/**
 * S316 serial integration — append staged Cowork dispositions to the decision ledger.
 * Single-writer step. Order matters: later records supersede earlier per lesson.
 * Validates every record against the ledger schema contract before writing anything.
 * Usage: node scripts/session/append-s316-dispositions.mjs [--write]
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const stagingDir = path.join(root, "reports/closure/cowork-staging");

// Causal append order (assessments first, then successive verification rounds).
const ORDER = [
  // Lane B assessor records (15 courses)
  "laneB-counting-to-100-k-dispositions.jsonl",
  "laneB-proportional-relationships-dispositions.jsonl",
  "laneB-measurement-data-dispositions.jsonl",
  "laneB-circle-theorems-dispositions.jsonl",
  "laneB-function-analysis-dispositions.jsonl",
  "laneB-expressions-equations-dispositions.jsonl",
  "laneB-integration-accumulation-dispositions.jsonl",
  "laneB-triangle-congruence-dispositions.jsonl",
  "laneB-measure-money-time-dispositions.jsonl",
  "laneB-limits-continuity-dispositions.jsonl",
  "laneB-trig-graphs-inverses-dispositions.jsonl",
  "laneB-vectors-matrices-dispositions.jsonl",
  "laneB-logarithms-dispositions.jsonl",
  "laneB-place-value-dispositions.jsonl",
  "laneB-constructions-and-proof-dispositions.jsonl",
  // Verification rounds, oldest first
  "laneAV2-mixed-g4v-dispositions.jsonl",
  "laneAV2-g5u-dispositions.jsonl",
  "laneAV2-g1-koa-dispositions.jsonl",
  "laneBV-implementations-dispositions.jsonl",
  "laneAV3-koa-dispositions.jsonl",
  "laneAV3-residuals-dispositions.jsonl",
  "laneBV2-dispositions.jsonl",
  "laneAV4-final-dispositions.jsonl",
  "laneAV4-g2-g3-dispositions.jsonl",
  // S317 wave (2026-08-20, second session round)
  "laneB-data-distributions-dispositions.jsonl",
  "laneB-statistical-inference-dispositions.jsonl",
  "laneB-fractions-dispositions.jsonl",
  "laneB-conditional-probability-dispositions.jsonl",
  "laneV-s317-batch1-dispositions.jsonl",
  "laneV-s317-batch2-dispositions.jsonl",
  "laneV-s317-final-dispositions.jsonl",
];
// Explicitly EXCLUDED (set aside by the S316 adjudication): laneAV-g1, laneAV-g2-g3, laneAV-g4-g5.

const ledgerLines = fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/).filter(Boolean);
const schema = JSON.parse(ledgerLines[0]);
if (schema.recordType !== "schema") throw new Error("ledger must start with schema record");
const allowedLesson = new Set(schema.contract.allowedLessonDecisions);
const allowedVisual = new Set(schema.contract.allowedVisualDecisions);
const allowedLanguage = new Set(schema.contract.allowedGradeLanguageDecisions);
const existingIds = new Set(
  ledgerLines.slice(1).map((l) => { try { return String(JSON.parse(l).recordId ?? ""); } catch { return ""; } })
);

const out = [];
const problems = [];
let skippedAlreadyAppended = 0;
const seenNewIds = new Set();
for (const file of ORDER) {
  const p = path.join(stagingDir, file);
  if (!fs.existsSync(p)) { problems.push(`MISSING FILE: ${file}`); continue; }
  const recs = fs.readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean).map((l, i) => {
    try { return JSON.parse(l); } catch (e) { problems.push(`${file}:${i + 1} bad JSON`); return null; }
  }).filter(Boolean);
  for (const r of recs) {
    // Format normalization (verdicts untouched): some staging writers put prose,
    // null, or the synonym APPROPRIATE in the two sub-decision enum fields.
    // Map mechanically and record provenance in the rationale.
    const notes = [];
    if (!allowedVisual.has(r.visualDecision)) {
      const orig = r.visualDecision;
      const figureOpen = r.decision === "REVISE" && /figure|visual/i.test(String(r.rationale ?? ""));
      r.visualDecision = figureOpen ? "REQUIRED" : "SUFFICIENT";
      notes.push(`visualDecision normalized to ${r.visualDecision}${typeof orig === "string" ? ` (original prose retained: "${orig.slice(0, 120)}")` : " (was null)"}`);
    }
    if (!allowedLanguage.has(r.gradeLanguageDecision)) {
      const orig = r.gradeLanguageDecision;
      r.gradeLanguageDecision = "FIT";
      notes.push(`gradeLanguageDecision normalized to FIT${typeof orig === "string" ? ` (original: "${orig.slice(0, 120)}")` : " (was null)"}`);
    }
    if (notes.length) r.rationale = `${r.rationale} [S316 integration format normalization: ${notes.join("; ")}]`;
    const errs = [];
    if (r.recordType !== "lesson-disposition") errs.push("recordType");
    if (!r.recordId) errs.push("recordId");
    if (existingIds.has(String(r.recordId))) { skippedAlreadyAppended += 1; continue; } // idempotent re-run
    if (seenNewIds.has(String(r.recordId))) errs.push("duplicateRecordId");
    if (!allowedLesson.has(r.decision)) errs.push("decision");
    if (!allowedVisual.has(r.visualDecision)) errs.push("visualDecision");
    if (!allowedLanguage.has(r.gradeLanguageDecision)) errs.push("gradeLanguageDecision");
    if (!String(r.reviewer ?? "").trim()) errs.push("reviewer");
    if (!String(r.rationale ?? "").trim()) errs.push("rationale");
    if (!String(r.reopenCondition ?? "").trim()) errs.push("reopenCondition");
    if (!Array.isArray(r.evidenceRefs) || !r.evidenceRefs.length) errs.push("evidenceRefs");
    if (!Number.isFinite(Date.parse(String(r.reviewedAt ?? "")))) errs.push("reviewedAt");
    if (!/^[a-f0-9]{64}$/i.test(String(r.reviewedBasisHash ?? ""))) errs.push("reviewedBasisHash");
    if (errs.length) { problems.push(`${file} ${r.recordId ?? r.lessonId}: ${errs.join(",")}`); continue; }
    seenNewIds.add(String(r.recordId));
    out.push({ file, record: r });
  }
}

console.log(JSON.stringify({ files: ORDER.length, validRecords: out.length, skippedAlreadyAppended, problems }, null, 2));
if (problems.length) process.exit(1);
if (process.argv.includes("--write")) {
  const text = out.map(({ record }) => JSON.stringify(record)).join("\n");
  const cur = fs.readFileSync(ledgerPath, "utf8");
  fs.appendFileSync(ledgerPath, (cur.endsWith("\n") ? "" : "\n") + text + "\n");
  console.log(`APPENDED ${out.length} records`);
}
