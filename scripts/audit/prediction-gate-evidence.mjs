/**
 * WS-E Phase 1 — prediction-gate evidence generator.
 *
 * READ-ONLY over content/courses/. This script opens lesson files with readFileSync only. It
 * never calls writeFileSync on anything under content/, never edits a `predict` block, and never
 * removes, reorders, or rewrites authored lesson content. Its one write target is
 * PREDICTION_GATE_ADJUDICATION.csv at the repo root — a brand-new artifact, never the existing
 * PREDICTION_GATE_AUDIT.csv (which is also only ever *read* here, for side-by-side comparison).
 *
 * What this replaces: PREDICTION_GATE_AUDIT.csv's generator (premium-rebuild-baseline-s226.mjs,
 * lines 119-155) decides KEEP/REMOVE/REFRAME from a widget-type capability lookup
 * (scripts/engine-capabilities.json) plus a string-equality "duplicates_task" check — never from
 * the gate's own predict.prompt/predict.reveal text. That's why the CSV has only two distinct
 * `reason` strings across 1,362 rows and why 0 of its 108 widget types ever split KEEP/REMOVE
 * within the same type (see WS_E_PREDICTION_RUBRIC.md §1 for the full evidence).
 *
 * This script does NOT decide verdicts. It extracts full per-gate context — prompt, options,
 * outcome, reveal, plus the OLD csv's decision/reason for comparison — into a new CSV with five
 * empty rubric-category columns and an empty proposed_verdict/adjudicator_notes pair. A human (or
 * a future assessor working from WS_E_PREDICTION_RUBRIC.md) fills those columns in by reading the
 * quoted prompt/reveal text. Every verdict that eventually lands in those columns is PROPOSED
 * until an explicit human ruling — see WS_E_PREDICTION_RUBRIC.md §3.
 *
 * Extraction shape (course walk, allSteps, csvCell/writeCsv) is deliberately cloned from
 * premium-rebuild-baseline-s226.mjs so this script's gate population matches that CSV's
 * population exactly, keeping the old_decision/old_reason join meaningful.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const COURSE_ROOT = join(ROOT, "content", "courses");
const OLD_CSV_PATH = join(ROOT, "PREDICTION_GATE_AUDIT.csv");
const OUTPUT_PATH = join(ROOT, "PREDICTION_GATE_ADJUDICATION.csv");

/* ---------------- read-only extraction helpers (cloned shape, see header) ---------------- */

function allSteps(lesson) {
  const steps = [...(lesson.steps ?? [])];
  for (const remedial of lesson.remedials ?? []) {
    if (remedial.concept) steps.push({ ...remedial.concept, _remedial: true });
    if (remedial.check) steps.push({ ...remedial.check, _remedial: true });
  }
  return steps;
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(path, rows, columns) {
  const lines = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))];
  writeFileSync(path, `${lines.join("\n")}\n`);
}

/** Minimal RFC4180-ish CSV parser — only used to READ the existing PREDICTION_GATE_AUDIT.csv for
 * the side-by-side old_decision/old_reason columns. Handles quoted fields containing commas,
 * newlines, and escaped quotes, which a naive split(",") cannot (several `reveal`/`prompt` cells
 * in the old CSV contain commas). */
function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = "";
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function loadOldCsv(path) {
  const map = new Map();
  if (!existsSync(path)) return map;
  const rows = parseCsv(readFileSync(path, "utf8")).filter((r) => r.length > 1);
  const header = rows[0];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of rows.slice(1)) {
    const key = `${r[idx.course_id]}|${r[idx.lesson_id]}|${r[idx.step_id]}`;
    map.set(key, { decision: r[idx.decision] ?? "", reason: r[idx.reason] ?? "" });
  }
  return map;
}

/* ---------------- walk content/courses/ read-only ---------------- */

const lessons = [];
for (const courseDir of readdirSync(COURSE_ROOT)) {
  const coursePath = join(COURSE_ROOT, courseDir, "course.json");
  const lessonsPath = join(COURSE_ROOT, courseDir, "lessons");
  if (!existsSync(coursePath) || !existsSync(lessonsPath)) continue;
  const course = JSON.parse(readFileSync(coursePath, "utf8"));
  for (const file of readdirSync(lessonsPath).filter((name) => name.endsWith(".json"))) {
    const path = join(lessonsPath, file);
    const lesson = JSON.parse(readFileSync(path, "utf8"));
    lessons.push({ course, lesson, path, steps: allSteps(lesson) });
  }
}

const oldCsv = loadOldCsv(OLD_CSV_PATH);

function formatOptions(options) {
  return (options ?? []).map((o) => `${o.id}="${o.label}"`).join(" | ");
}

const rows = [];
let matchedOld = 0;
let unmatchedOld = 0;
for (const { course, lesson, path, steps } of lessons) {
  for (const step of steps) {
    if (!step.predict) continue;
    const key = `${course.id}|${lesson.id}|${step.id}`;
    const old = oldCsv.get(key);
    if (old) matchedOld++;
    else unmatchedOld++;
    const outcomeOption = (step.predict.options ?? []).find((o) => o.id === step.predict.outcomeId);
    rows.push({
      course_id: course.id,
      grade: course.gradeLevel,
      lesson_id: lesson.id,
      step_id: step.id,
      source: relative(ROOT, path).replaceAll("\\", "/"),
      widget_type_context_only: step.widget?.type ?? "none",
      predict_prompt: step.predict.prompt,
      predict_options: formatOptions(step.predict.options),
      outcome_id: step.predict.outcomeId ?? "",
      outcome_label: outcomeOption?.label ?? "",
      predict_reveal: step.predict.reveal,
      old_decision: old?.decision ?? "",
      old_reason: old?.reason ?? "",
      // Five rubric categories (WS_E_PREDICTION_RUBRIC.md §4) — left EMPTY by this generator.
      // Filled in only by a human/assessor reading predict_prompt and predict_reveal directly,
      // never by widget_type_context_only or any other structural field.
      counterintuitive_consequence: "",
      common_misconception: "",
      invariant: "",
      estimate: "",
      causal_contrast: "",
      // Left EMPTY by this generator; filled in during real adjudication per the rubric §6.
      proposed_verdict: "",
      adjudicator_notes: ""
    });
  }
}

writeCsv(OUTPUT_PATH, rows, [
  "course_id",
  "grade",
  "lesson_id",
  "step_id",
  "source",
  "widget_type_context_only",
  "predict_prompt",
  "predict_options",
  "outcome_id",
  "outcome_label",
  "predict_reveal",
  "old_decision",
  "old_reason",
  "counterintuitive_consequence",
  "common_misconception",
  "invariant",
  "estimate",
  "causal_contrast",
  "proposed_verdict",
  "adjudicator_notes"
]);

console.log(
  JSON.stringify(
    {
      lessons: lessons.length,
      gates: rows.length,
      matched_old_csv_rows: matchedOld,
      unmatched_old_csv_rows: unmatchedOld,
      output: relative(ROOT, OUTPUT_PATH)
    },
    null,
    2
  )
);
