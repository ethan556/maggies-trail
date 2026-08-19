#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash, validateStandardsDecision } from "../../../scripts/standards/decision-contract.mjs";
import { verifyStandardsDecisions } from "../../../scripts/standards/verify-standards-decisions.mjs";

const root = process.cwd();
const packetPath = path.join(root, "reports/closure/candidates/S247_CCSS_HSF_DOMAIN_SCOPE_BATCH03.jsonl");
const packetText = fs.readFileSync(packetPath, "utf8");
const packet = packetText.trim().split(/\r?\n/).map((line) => JSON.parse(line));
const decisions = JSON.parse(fs.readFileSync(path.join(root, "content/standards/human-review-decisions.json"), "utf8")).decisions;
const dossiers = JSON.parse(fs.readFileSync(path.join(root, "content/standards/evidence-dossiers.json"), "utf8")).dossiers;
const byDecision = new Map(decisions.map((record) => [record.edgeId, record]));
const byDossier = new Map(dossiers.map((record) => [record.edgeId, record]));
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const errors = [];
if (packet.length !== 40) errors.push(`packet length ${packet.length} != 40`);
for (const record of packet) {
  const ledger = byDecision.get(record.edgeId);
  const dossier = byDossier.get(record.edgeId);
  if (JSON.stringify(ledger) !== JSON.stringify(record)) errors.push(`${record.edgeId}: ledger mismatch`);
  if (!dossier || dossier.review?.status !== "rejected") errors.push(`${record.edgeId}: dossier is not rejected`);
  else if (candidateDossierHash(dossier) !== record.dossierHash) errors.push(`${record.edgeId}: candidate basis drift`);
  const validation = validateStandardsDecision(record, { allowLegacy:false });
  if (validation.errors.length) errors.push(`${record.edgeId}: ${validation.errors.join("; ")}`);
  const { signature, ...unsigned } = record;
  if (signature !== sha256(JSON.stringify(unsigned))) errors.push(`${record.edgeId}: signature mismatch`);
  for (const lesson of Object.values(record.evidenceSnapshot.lessonSourceHashes)) if (sha256(fs.readFileSync(path.join(root, lesson.relativePath))) !== lesson.sha256) errors.push(`${record.edgeId}: stale lesson ${lesson.relativePath}`);
}
const authority = verifyStandardsDecisions(root);
if (authority.decisionCount !== 122 || authority.validDecisionCount !== 122 || authority.invalidDecisionCount !== 0) errors.push(`authority totals ${authority.validDecisionCount}/${authority.decisionCount}, invalid ${authority.invalidDecisionCount}`);
if (authority.statusCounts.rejected !== 120 || authority.statusCounts.partial !== 2 || authority.statusCounts.candidate !== 5999) errors.push(`unexpected statuses ${JSON.stringify(authority.statusCounts)}`);
console.log(JSON.stringify({ status:errors.length ? "FAIL" : "PASS", exactPacketLedgerMatches:packet.filter((record) => JSON.stringify(byDecision.get(record.edgeId)) === JSON.stringify(record)).length, authority:{ dossiers:authority.dossierCount, decisions:authority.decisionCount, valid:authority.validDecisionCount, invalid:authority.invalidDecisionCount, statusCounts:authority.statusCounts }, packetSha256:sha256(packetText), errors }, null, 2));
if (errors.length) process.exitCode = 1;
