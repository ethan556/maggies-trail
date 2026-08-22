#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash, validateStandardsDecision } from "./decision-contract.mjs";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const json = (relativePath) => JSON.parse(read(relativePath));
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const fileHash = (relativePath) => sha(read(relativePath));
const manifest = json("reports/standards/S251_REMAINING_COARSE_SCOPE_PORTFOLIO.json");
const ledgerPath = path.join(root, "content/standards/human-review-decisions.json");
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const dossiers = json("content/standards/evidence-dossiers.json").dossiers;
const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));

if (manifest.status !== "PASS" || manifest.decisions !== 2560 || manifest.baselineDecisions !== 3561
  || manifest.packets !== 167 || manifest.maxPacketSize !== 40) throw new Error("Remaining-coarse manifest contract drift");
if ((ledger.decisions ?? []).length !== manifest.baselineDecisions) throw new Error(`Ledger baseline drift: ${ledger.decisions?.length ?? 0}`);
for (const [relativePath, expected] of Object.entries(manifest.sourceArtifactHashes)) {
  const artifactPath = relativePath === "evidenceDossiersSha256" ? "content/standards/evidence-dossiers.json"
    : relativePath === "objectivesSha256" ? "content/standards/objectives.json"
      : "content/standards/source-registry.json";
  if (fileHash(artifactPath) !== expected) throw new Error(`${artifactPath}: source seal drift`);
}

const existing = new Set((ledger.decisions ?? []).map((record) => record.edgeId));
const records = [];
for (const packetFile of manifest.packetFiles) {
  const packetText = read(packetFile);
  const packet = packetText.trim().split(/\r?\n/).map(JSON.parse);
  if (packet.length === 0 || packet.length > 40 || new Set(packet.map((record) => record.edgeId)).size !== packet.length) throw new Error(`${packetFile}: packet size/identity drift`);
  const codes = new Set(packet.map((record) => record.candidateCode));
  const frameworks = new Set(packet.map((record) => dossierByEdge.get(record.edgeId)?.framework));
  if (codes.size !== 1 || frameworks.size !== 1 || frameworks.has(undefined)) throw new Error(`${packetFile}: mixed or missing authority contract`);
  for (const record of packet) {
    if (existing.has(record.edgeId)) throw new Error(`${record.edgeId}: already decided`);
    const dossier = dossierByEdge.get(record.edgeId);
    if (!dossier || dossier.review?.status !== "candidate"
      || dossier.sourceTextStatus !== "scope-locator-requires-exact-benchmark"
      || dossier.checks?.exactStandardCodeCandidate !== false
      || dossier.candidateCode !== record.candidateCode
      || candidateDossierHash(dossier) !== record.dossierHash) throw new Error(`${record.edgeId}: live dossier contract drift`);
    const validation = validateStandardsDecision(record, { allowLegacy: false });
    const { signature, ...unsigned } = record;
    if (validation.errors.length || signature !== sha(JSON.stringify(unsigned)) || record.decision !== "rejected"
      || !record.claimBoundary?.startsWith(`This decision rejects only the coarse ${record.candidateCode} scope locator.`)
      || record.evidenceSnapshot?.transferEvidenceUsed !== false) throw new Error(`${record.edgeId}: invalid bounded rejection`);
    for (const seal of Object.values(record.evidenceSnapshot.lessonSourceHashes)) {
      if (fileHash(seal.relativePath) !== seal.sha256) throw new Error(`${record.edgeId}: stale lesson source`);
    }
    records.push(record);
  }
}

if (records.length !== 2560 || new Set(records.map((record) => record.edgeId)).size !== 2560
  || sha(records.map((record) => record.signature).join("\n")) !== manifest.aggregateSeal) throw new Error("Aggregate packet coverage/seal drift");
const next = {
  ...ledger,
  schemaVersion: 2,
  statusContract: ["candidate", "partial", "approved", "rejected"],
  decisions: [...ledger.decisions, ...records].sort((left, right) => left.edgeId.localeCompare(right.edgeId)),
};
if (next.decisions.length !== 6121) throw new Error(`Final decision count drift: ${next.decisions.length}`);
if (apply) fs.writeFileSync(ledgerPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ mode: apply ? "apply" : "check", packets: manifest.packets, appendedDecisions: records.length, priorDecisions: ledger.decisions.length, nextDecisions: next.decisions.length, aggregateSeal: manifest.aggregateSeal }, null, 2));
