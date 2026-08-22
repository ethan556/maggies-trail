#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateStandardsDecision } from "./decision-contract.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const packetArg = args.find((arg) => !arg.startsWith("--"));
if (!packetArg) {
  throw new Error("Usage: node scripts/standards/apply-coarse-domain-scope-packet-s247.mjs <packet.jsonl> [--apply]");
}

const scopeContracts = {
  HSF: "This decision rejects only the coarse HSF domain-level edge.",
  "CA-HSF": "This decision rejects only the coarse CA-HSF portfolio locator.",
  "MA.HS.HSF": "This decision rejects only the coarse MA.HS.HSF portfolio locator.",
  "NY-HSA": "This decision rejects only the coarse NY-HSA portfolio locator.",
  "NY-HSF": "This decision rejects only the coarse NY-HSF portfolio locator.",
  "NY-HSG": "This decision rejects only the coarse NY-HSG portfolio locator.",
  "NY-HSN": "This decision rejects only the coarse NY-HSN portfolio locator.",
  "NY-HSS": "This decision rejects only the coarse NY-HSS portfolio locator.",
};
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const packetPath = path.resolve(root, packetArg);
const ledgerPath = path.join(root, "content/standards/human-review-decisions.json");
const packetText = fs.readFileSync(packetPath, "utf8");
const packet = packetText.trim().split(/\r?\n/).map((line) => JSON.parse(line));
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));

if (packet.length === 0 || packet.length > 50 || new Set(packet.map((record) => record.edgeId)).size !== packet.length) {
  throw new Error("Coarse-domain packet must contain 1–50 unique edges.");
}
const candidateCodes = new Set(packet.map((record) => record.candidateCode));
if (candidateCodes.size !== 1) throw new Error("A packet must contain exactly one candidate code.");
const candidateCode = [...candidateCodes][0];
const claimPrefix = scopeContracts[candidateCode];
if (!claimPrefix) throw new Error(`Unsupported coarse-domain contract: ${candidateCode}`);

const existing = new Set((ledger.decisions ?? []).map((record) => record.edgeId));
const overlap = packet.filter((record) => existing.has(record.edgeId));
if (overlap.length) {
  throw new Error(`Refusing duplicate standards decisions: ${overlap.map((record) => record.edgeId).join(", ")}`);
}
for (const record of packet) {
  const validation = validateStandardsDecision(record, { allowLegacy: false });
  if (validation.errors.length) throw new Error(`${record.edgeId}: ${validation.errors.join("; ")}`);
  const { signature, ...unsigned } = record;
  if (signature !== sha256(JSON.stringify(unsigned))) throw new Error(`Invalid signature: ${record.edgeId}`);
  if (record.decision !== "rejected" || record.candidateCode !== candidateCode || !record.claimBoundary?.startsWith(claimPrefix)) {
    throw new Error(`Out-of-scope decision: ${record.edgeId}`);
  }
  if (record.evidenceSnapshot?.transferEvidenceUsed !== false) {
    throw new Error(`Transfer inference is not allowed: ${record.edgeId}`);
  }
}

const next = {
  ...ledger,
  schemaVersion: 2,
  statusContract: ["candidate", "partial", "approved", "rejected"],
  decisions: [...(ledger.decisions ?? []), ...packet].sort((a, b) => a.edgeId.localeCompare(b.edgeId)),
};
if (apply) fs.writeFileSync(ledgerPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  mode: apply ? "apply" : "check",
  candidateCode,
  packet: path.relative(root, packetPath).replaceAll("\\", "/"),
  priorDecisions: ledger.decisions?.length ?? 0,
  appendedDecisions: packet.length,
  nextDecisions: next.decisions.length,
  packetSha256: sha256(packetText),
}, null, 2));
