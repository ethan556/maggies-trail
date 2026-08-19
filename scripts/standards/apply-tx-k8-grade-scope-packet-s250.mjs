#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateStandardsDecision } from "./decision-contract.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const packetArg = args.find((argument) => !argument.startsWith("--"));
if (!packetArg) throw new Error("Usage: node scripts/standards/apply-tx-k8-grade-scope-packet-s250.mjs <packet.jsonl> [--apply]");
const supported = new Set(["§111.3", "§111.4", "§111.5", "§111.6", "§111.7", "§111.26", "§111.27", "§111.28"]);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const packetPath = path.resolve(root, packetArg);
const ledgerPath = path.join(root, "content/standards/human-review-decisions.json");
const packetText = fs.readFileSync(packetPath, "utf8");
const packet = packetText.trim().split(/\r?\n/).map(JSON.parse);
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
if (packet.length === 0 || packet.length > 40 || new Set(packet.map((record) => record.edgeId)).size !== packet.length) throw new Error("Texas K–8 packet must contain 1–40 unique edges.");
const candidateCodes = new Set(packet.map((record) => record.candidateCode));
if (candidateCodes.size !== 1) throw new Error("A packet must contain exactly one candidate code.");
const candidateCode = [...candidateCodes][0];
if (!supported.has(candidateCode)) throw new Error(`Unsupported Texas K–8 contract: ${candidateCode}`);
const existing = new Set((ledger.decisions ?? []).map((record) => record.edgeId));
const overlap = packet.filter((record) => existing.has(record.edgeId));
if (overlap.length) throw new Error(`Refusing duplicate standards decisions: ${overlap.map((record) => record.edgeId).join(", ")}`);
for (const record of packet) {
  const validation = validateStandardsDecision(record, { allowLegacy: false });
  const { signature, ...unsigned } = record;
  if (validation.errors.length) throw new Error(`${record.edgeId}: ${validation.errors.join("; ")}`);
  if (signature !== sha(JSON.stringify(unsigned))) throw new Error(`Invalid signature: ${record.edgeId}`);
  if (record.decision !== "rejected" || record.candidateCode !== candidateCode || !record.claimBoundary?.startsWith(`This decision rejects only the coarse ${candidateCode} portfolio locator.`)) throw new Error(`Out-of-scope decision: ${record.edgeId}`);
  if (record.evidenceSnapshot?.transferEvidenceUsed !== false) throw new Error(`Transfer inference is not allowed: ${record.edgeId}`);
}
const next = { ...ledger, schemaVersion: 2, statusContract: ["candidate", "partial", "approved", "rejected"], decisions: [...(ledger.decisions ?? []), ...packet].sort((left, right) => left.edgeId.localeCompare(right.edgeId)) };
if (apply) fs.writeFileSync(ledgerPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ mode: apply ? "apply" : "check", candidateCode, priorDecisions: ledger.decisions?.length ?? 0, appendedDecisions: packet.length, nextDecisions: next.decisions.length, packetSha256: sha(packetText) }, null, 2));
