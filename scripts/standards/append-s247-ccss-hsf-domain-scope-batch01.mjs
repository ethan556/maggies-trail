#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateStandardsDecision } from "./decision-contract.mjs";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const packetPath = path.join(root, "reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.jsonl");
const ledgerPath = path.join(root, "content/standards/human-review-decisions.json");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const packet = fs.readFileSync(packetPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));

if (packet.length !== 40 || new Set(packet.map((record) => record.edgeId)).size !== 40) {
  throw new Error("The bounded HSF packet must contain exactly 40 unique edges.");
}
const existing = new Set((ledger.decisions ?? []).map((record) => record.edgeId));
const overlap = packet.filter((record) => existing.has(record.edgeId));
if (overlap.length) throw new Error(`Refusing duplicate standards decisions: ${overlap.map((record) => record.edgeId).join(", ")}`);

for (const record of packet) {
  const validation = validateStandardsDecision(record, { allowLegacy: false });
  if (validation.errors.length) throw new Error(`${record.edgeId}: ${validation.errors.join("; ")}`);
  const { signature, ...unsigned } = record;
  if (signature !== sha256(JSON.stringify(unsigned))) throw new Error(`Invalid signature: ${record.edgeId}`);
  if (record.decision !== "rejected" || record.candidateCode !== "HSF") {
    throw new Error(`Out-of-scope decision: ${record.edgeId}`);
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
  priorDecisions: ledger.decisions?.length ?? 0,
  appendedDecisions: packet.length,
  nextDecisions: next.decisions.length,
  packetSha256: sha256(fs.readFileSync(packetPath)),
}, null, 2));
