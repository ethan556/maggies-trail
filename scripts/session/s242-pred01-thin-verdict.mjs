#!/usr/bin/env node
/**
 * S242 / PRED-01 — RECORD THE FOURTH VERDICT: THIN.
 *
 * THE RULING (user, S242): the 51 gates removed after adjudication were thinned DELIBERATELY.
 *
 * That settles the divergence the re-certification found, and it makes the adjudication file's
 * current state the problem rather than the corpus's. 51 rows say KEEP and mean removed. Anyone
 * reading them — or grepping them, which is how a number ends up in a status report — draws the
 * wrong conclusion, and this program has already been slowed once by counts that were true when
 * written and false when quoted. So the verdict is written down.
 *
 * WHAT THIS SCRIPT DOES. Adds `THIN` as a fourth verdict on the 48 rows that are still thinned, and
 * preserves what adjudication originally said in a new `adjudicated_verdict` column so nothing is
 * destroyed. A reader of `proposed_verdict` now sees what actually happened; a reader who needs the
 * review history still has it.
 *
 * THE THREE EXCEPTIONS, recorded rather than folded in. Three of the 51 sat on FLAGSHIP CML steps —
 * dc-02-02#i1, pra-04-02#i1, tf-03-02#i1 — and their removal is what produced CML-01's three
 * `flagship-missing-prediction` errors. They were restored earlier under PRED-01 and the strict gate
 * is green with them in place. Marking them THIN would be recording a removal that did not happen
 * and cannot happen while those steps carry `cml.flagship: true`, because the flagship contract
 * requires a prediction. They are marked `THIN-REVERSED` with that reason.
 *
 * The only way to thin those three as well is to drop `cml.flagship` from the steps, which weakens
 * a gate — the one thing CLAUDE.md says never to do to make something pass — so it is not done here
 * and not done quietly. If the pedagogy intent really is that those three steps should not carry
 * predictions, then the question is whether they should be flagship at all, and that is a
 * curriculum decision, not a bookkeeping one.
 *
 * Run: node scripts/session/s242-pred01-thin-verdict.mjs [--check]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHECK = process.argv.includes("--check");
const ROOT = process.cwd();
const CSV = join(ROOT, "PREDICTION_GATE_ADJUDICATION.csv");

const RESTORED = new Set(["dc-02-02#i1", "pra-04-02#i1", "tf-03-02#i1"]);
const RATIONALE = "S242 ruling: thinned deliberately after adjudication.";
const REVERSED = "S242 ruling: thinned deliberately, but REVERSED — the step is cml.flagship, whose contract requires a prediction. Restored by scripts/session/s242-pred01-restore.mjs.";

/* ---- csv ---- */
function parse(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const cell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/* ---- which gates are live ---- */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}
const live = new Set();
for (const file of walk(join(ROOT, "content"))) {
  let json;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!Array.isArray(lesson.steps)) continue;
  for (const [i, step] of lesson.steps.entries())
    if (step.predict) live.add(`${lesson.id}#${step.id ?? i}`);
}

/* ---- rewrite ---- */
const rows = parse(readFileSync(CSV, "utf8"));
const header = rows.shift();
const body = rows.filter((r) => r.length > 1);
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

if (header.includes("adjudicated_verdict")) {
  if (!CHECK) console.log("s242-pred01-thin-verdict: already applied, nothing to do");
} else if (!CHECK) {
  header.splice(idx.proposed_verdict + 1, 0, "adjudicated_verdict");
}

let thinned = 0, reversed = 0;
const out = [];
for (const row of body) {
  const key = `${row[idx.lesson_id]}#${row[idx.step_id]}`;
  const original = row[idx.proposed_verdict];
  let verdict = original, note = row[idx.adjudicator_notes] ?? "";
  if (original === "KEEP" && !live.has(key)) { verdict = "THIN"; note = RATIONALE; thinned++; }
  else if (original === "KEEP" && RESTORED.has(key)) { verdict = "THIN-REVERSED"; note = REVERSED; reversed++; }
  if (CHECK) continue;
  const next = [...row];
  next[idx.adjudicator_notes] = note;
  next[idx.proposed_verdict] = verdict;
  next.splice(idx.proposed_verdict + 1, 0, original);
  out.push(next);
}

if (CHECK) {
  const has = header.includes("adjudicated_verdict");
  const thinRows = body.filter((r) => r[idx.proposed_verdict] === "THIN").length;
  const revRows = body.filter((r) => r[idx.proposed_verdict] === "THIN-REVERSED").length;
  console.log(`${has && thinRows === 48 && revRows === 3 ? "ok  " : "MISS"} adjudicated_verdict column: ${has}, THIN ${thinRows}, THIN-REVERSED ${revRows}`);
  process.exitCode = has && thinRows === 48 && revRows === 3 ? 0 : 1;
} else if (thinned || reversed) {
  writeFileSync(CSV, [header, ...out].map((r) => r.map(cell).join(",")).join("\n") + "\n");
  console.log(`s242-pred01-thin-verdict: ${thinned} row(s) marked THIN, ${reversed} marked THIN-REVERSED`);
}
