#!/usr/bin/env node
// Explicit human approval seam: only a fully eligible candidate run can become the runtime overlay.
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const value = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
const input = value('--input');
const reviewer = value('--reviewer');
const notes = value('--notes');
const output = value('--output') || path.join(process.cwd(), 'content/assessment/calibration/active.json');
if (!input || !reviewer || reviewer.trim().length < 3 || !notes || notes.trim().length < 20) {
  console.error('Usage: node scripts/promote-diagnostic-calibration.cjs --input run.json --reviewer "Name / role" --notes "Psychometric review rationale..." [--output active.json]');
  process.exit(2);
}
const run = JSON.parse(fs.readFileSync(input, 'utf8'));
if (run.status !== 'candidate' || run.qualitySummary?.promotionEligible !== true) throw new Error('Run is not promotion-eligible.');
if (!Array.isArray(run.items) || run.items.length !== 28 || run.items.some((item) => item.qualityFlags?.length || !Number.isFinite(item.difficulty) || !Number.isFinite(item.discrimination) || item.sampleN < 500)) throw new Error('Every item must pass promotion gates with at least 500 responses.');
const parameters = Object.fromEntries(run.items.map((item) => [item.itemId, {
  difficulty: item.difficulty,
  discrimination: item.discrimination,
  sampleN: item.sampleN,
  difficultySe: item.difficultySe,
  discriminationSe: item.discriminationSe,
  pointBiserial: item.pointBiserial
}]));
const active = {
  schemaVersion: 1,
  instrumentVersion: run.instrumentVersion,
  status: 'field-calibrated',
  runId: run.runId,
  approvedBy: reviewer.trim(),
  approvedAt: new Date().toISOString(),
  approvalNotes: notes.trim(),
  outputSha256: run.outputSha256,
  scaleLink: run.scaleLink,
  parameters,
  claimBoundary: 'Field-calibrated item parameters have passed the declared automated gates and explicit human psychometric approval. This does not by itself establish national norms, predictive validity, subgroup fairness, or high-stakes suitability.'
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(active, null, 2) + '\n');
console.log(`promoted ${run.runId} to ${output}`);
