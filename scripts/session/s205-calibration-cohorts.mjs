#!/usr/bin/env node
/** s205-calibration-cohorts — field-readiness audit for the three pilot calibration populations.
 *
 *   node scripts/session/s205-calibration-cohorts.mjs
 *
 * WHAT THIS IS, AND IS NOT. Field calibration requires real learners; nothing in a sandbox can
 * perform it, and the pipeline already enforces that honestly (calibrate-diagnostic.cjs never
 * labels a run field-calibrated; promote-diagnostic-calibration.cjs requires a named human
 * approver; placementBank.server.ts refuses any overlay whose per-item sampleN < 500). What CAN be
 * done by engineering is to prove the three pilot cohorts are READY to collect: that the
 * instrument covers each cohort's concepts, that every collection prerequisite exists, and that
 * the sample the field team must gather is stated as numbers derived from the contract's own
 * gates rather than asserted.
 *
 * Pilot cohorts (transition points with manageable populations):
 *   algebra-1  — every course titled "Algebra 1:"
 *   g6-8       — every course with gradeLevel 6..8
 *   g2-3       — every course with gradeLevel 2..3
 *
 * Deterministic: reads content/, src/lib/placement.ts (item bank literals) and the calibration
 * contract only. Writes S205_CALIBRATION_COHORTS.json + .md. Exit 1 if any readiness check fails.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const contract = JSON.parse(read("content/assessment/diagnostic-calibration-contract.json"));
const active = JSON.parse(read("content/assessment/calibration/active.json"));
const gates = contract.qualityGates;

/* ---- 1. The placement item bank, read from source literals (no server import needed).
 * Items are `item("id", "tag", grade, "courseSlug", …)` calls — parse exactly that shape. ---- */
const placementSrc = read("src/lib/placement.ts");
const itemRe = /item\(\s*"([^"]+)",\s*"([^"]+)",\s*(\d+),\s*"([^"]+)"/g;
const bank = [];
for (let m; (m = itemRe.exec(placementSrc)); ) bank.push({ id: m[1], conceptTag: m[2], grade: Number(m[3]), courseSlug: m[4] });
if (bank.length === 0) throw new Error("cohorts: parsed zero placement items from src/lib/placement.ts — the literal shape changed; fix the parser, do not guess");

/* ---- 2. Cohort membership from the corpus. ---- */
const cohortOf = (course) =>
  course.title.startsWith("Algebra 1:") ? "algebra-1"
  : course.gradeLevel >= 6 && course.gradeLevel <= 8 ? "g6-8"
  : course.gradeLevel >= 2 && course.gradeLevel <= 3 ? "g2-3"
  : null;

const cohorts = { "algebra-1": mk(), "g6-8": mk(), "g2-3": mk() };
function mk() { return { courses: [], lessons: 0, conceptTags: new Set(), masteryCells: 0, bankItems: [] }; }

for (const dir of readdirSync(join(root, "content/courses"))) {
  const cj = join(root, "content/courses", dir, "course.json");
  if (!existsSync(cj)) continue;
  const course = JSON.parse(readFileSync(cj, "utf8"));
  const key = cohortOf(course);
  if (!key) continue;
  const c = cohorts[key];
  c.courses.push({ slug: dir, title: course.title, gradeLevel: course.gradeLevel });
  const ld = join(root, "content/courses", dir, "lessons");
  if (!existsSync(ld)) continue;
  for (const f of readdirSync(ld)) {
    if (!f.endsWith(".json")) continue;
    c.lessons++;
    for (const s of JSON.parse(readFileSync(join(ld, f), "utf8")).steps ?? [])
      if (s.conceptTag) c.conceptTags.add(s.conceptTag);
  }
}

/* Mastery cells per cohort — the mastery side of the calibration mandate. Cells key on
 * courseId + gradeLevel (verified against content/mastery/mastery-cells.json), not conceptTag. */
const cells = JSON.parse(read("content/mastery/mastery-cells.json")).cells;
const slugCohort = new Map();
for (const [key, c] of Object.entries(cohorts)) for (const course of c.courses) slugCohort.set(course.slug, key);
for (const cell of cells) {
  const key = slugCohort.get(cell.courseId);
  if (key) cohorts[key].masteryCells++;
}

/* Bank items per cohort. The instrument is a VERTICAL scale with two probes per grade rank
 * (28 items, K..13) — there is no Algebra-1 subtest, and grade 9 carries exactly two probes.
 * A placement decision AT a transition is made by the rungs AROUND it, so each cohort's slice is
 * its grade band plus one rung either side: that is what the start-grade estimate discriminates
 * over, and it is the honest thing to calibrate for that population. */
const inSlice = (g, lo, hi) => g >= lo && g <= hi;
for (const item of bank) {
  if (inSlice(item.grade, 5, 9)) cohorts["g6-8"].bankItems.push(item.id);   // band 6-8 ± 1
  if (inSlice(item.grade, 1, 4)) cohorts["g2-3"].bankItems.push(item.id);   // band 2-3 ± 1
  if (inSlice(item.grade, 7, 10)) cohorts["algebra-1"].bankItems.push(item.id); // the 8->9 transition region
}

/* ---- 3. Collection prerequisites: every named artifact must exist. ---- */
const prereqs = [
  ["export tool", "scripts/export-diagnostic-field.cjs"],
  ["estimation tool", "scripts/calibrate-diagnostic.cjs"],
  ["promotion tool (human gate)", "scripts/promote-diagnostic-calibration.cjs"],
  ["field-store migration", "db/migrations/004_diagnostic_calibration.sql"],
  ["runtime overlay guard", "src/lib/placementBank.server.ts"],
  ["field client", "src/lib/diagnosticFieldClient.ts"],
  ["contract", "content/assessment/diagnostic-calibration-contract.json"],
].map(([name, p]) => ({ name, path: p, present: existsSync(join(root, p)) }));

const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok, detail }); if (!ok) process.exitCode = 1; };

check("active bank honestly awaiting field data", active.status === "awaiting-field-data" && active.runId === null,
  `status=${active.status} runId=${active.runId} — a pre-seeded runId would fake provenance`);
check("promotion requires a human", gates.humanApprovalRequired === true, "qualityGates.humanApprovalRequired");
for (const p of prereqs) check(`prerequisite: ${p.name}`, p.present, p.path);
for (const [key, c] of Object.entries(cohorts)) {
  check(`${key}: has courses`, c.courses.length > 0, `${c.courses.length} courses / ${c.lessons} lessons`);
  check(`${key}: instrument covers the cohort`, c.bankItems.length >= 4,
    `${c.bankItems.length} placement items address this cohort (floor 4 — below that a per-cohort start-grade estimate is unidentifiable)`);
  check(`${key}: mastery cells exist to calibrate against`, c.masteryCells > 0, `${c.masteryCells} cells`);
}

/* ---- 4. The field ask, derived from the contract, never invented. ---- */
const fieldAsk = Object.fromEntries(Object.entries(cohorts).map(([key, c]) => [key, {
  minimumUsableSessions: gates.minimumUsableSessions,
  minimumResponsesPerItem: gates.minimumResponsesPerItem,
  perItemFloorForPromotion: gates.minimumResponsesPerItemForPromotion,
  itemsToCalibrate: c.bankItems.length,
  /* Worst case: every response independent — sessions needed if each session touches ~12 items. */
  estimatedSessionsForPromotion: Math.max(gates.minimumUsableSessions,
    Math.ceil((c.bankItems.length * gates.minimumResponsesPerItemForPromotion) / 12)),
  anchorsRequired: gates.minimumAnchorItems,
}]));

const out = {
  generatedAt: "deterministic-no-wall-clock",
  claimBoundary: contract.claimBoundary,
  instrumentVersion: contract.instrumentVersion,
  cohorts: Object.fromEntries(Object.entries(cohorts).map(([k, c]) => [k, {
    courses: c.courses, lessons: c.lessons, conceptTags: c.conceptTags.size,
    masteryCells: c.masteryCells, bankItemIds: c.bankItems.sort(),
  }])),
  fieldAsk, prereqs, checks,
  passed: checks.every((c) => c.ok),
};
writeFileSync(join(root, "S205_CALIBRATION_COHORTS.json"), JSON.stringify(out, null, 2));

const md = [
  "# S205 — calibration field-readiness: Algebra 1 · G6-8 · G2-3 (generated — do not hand-edit)", "",
  "Field calibration needs real learners; this audit proves the three pilot cohorts are READY to",
  "collect and states the sample each needs, derived from the contract's own gates.", "",
  "| cohort | courses | lessons | concept tags | mastery cells | bank items | sessions needed (promotion) |",
  "| --- | --: | --: | --: | --: | --: | --: |",
  ...Object.entries(cohorts).map(([k, c]) =>
    `| ${k} | ${c.courses.length} | ${c.lessons} | ${c.conceptTags.size} | ${c.masteryCells} | ${c.bankItems.length} | ${fieldAsk[k].estimatedSessionsForPromotion} |`),
  "", "## Readiness checks", "",
  ...checks.map((c) => `- ${c.ok ? "✓" : "✗ FAIL"} ${c.name} — ${c.detail}`),
  "", `Overall: ${out.passed ? "READY TO COLLECT" : "NOT READY — fix the ✗ items"}. Runtime stays on provisional seeds until a run passes every gate AND a named human approves it (promote-diagnostic-calibration.cjs).`,
];
writeFileSync(join(root, "S205_CALIBRATION_COHORTS.md"), md.join("\n") + "\n");
console.log(`calibration-cohorts: ${out.passed ? "READY" : "NOT READY"} — ` +
  Object.entries(cohorts).map(([k, c]) => `${k} ${c.courses.length}c/${c.lessons}l/${c.bankItems.length}i`).join(" · "));
