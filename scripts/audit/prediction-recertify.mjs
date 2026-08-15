#!/usr/bin/env node
/**
 * S242 / PRED-01 — RE-CERTIFY PREDICTION PHASE 4 AGAINST THE LIVE CORPUS.
 *
 * THE SITUATION THIS RESOLVES. `PREDICTION_GATE_ADJUDICATION.csv` carries 1,362 adjudicated gates
 * with verdicts KEEP 1,145 / REWRITE 200 / REMOVE 17. The reports built from it still describe that
 * work as OPEN — 200 rewrites outstanding, 17 removals outstanding — while the plan's own reading
 * of the source says the opposite: the removals are gone, the rewrites are in, and 51 further KEEP
 * rows were thinned, leaving 1,294 live gates.
 *
 * Both statements cannot be true, and the difference matters: if the reports are right, 217 pieces
 * of pedagogy work are pending; if the source is right, re-running them would REDO work already
 * done, against a corpus that has moved. So this script does not trust either document. It reads
 * the live lesson JSON and states what is actually there.
 *
 * WHAT IT CHECKS, and each is a different claim:
 *   1. REMOVED — every REMOVE verdict's gate is absent from the live corpus.
 *   2. REWRITTEN — every REWRITE verdict's gate is present AND its reveal text differs from the
 *      adjudicated text. Present-but-identical is a rewrite that did not happen, and is the failure
 *      mode a naive "is it still there?" check would score as success.
 *   3. THINNED — `THIN` rows absent from the live corpus. This verdict did not exist when the file
 *      was written: 51 rows said KEEP and meant removed, which is how a status report ends up
 *      quoting 51 gates that are not there. The S242 ruling is that the thinning was deliberate, so
 *      `THIN` was added as a fourth verdict and the original review decision preserved alongside it
 *      in `adjudicated_verdict`. A KEEP row that is absent is now an ERROR rather than a shrug —
 *      a removal with no verdict recording it is exactly the state this file was in.
 *   4. REVERSED — `THIN-REVERSED`, the three thinned gates on flagship CML steps. Their removal
 *      broke the flagship contract, which is what produced CML-01's errors, so they are restored
 *      and must be PRESENT.
 *   5. NEW — live gates the adjudication never saw, which are gates added since.
 *
 * Usage: node scripts/audit/prediction-recertify.mjs [--write]
 *   --write emits PREDICTION_PHASE4_RECERTIFICATION.csv and .md.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const seal = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch { return "unsealed"; }
})();

/* ---- the live corpus ---- */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}

/** key -> { reveal, prompt, path, widget } for every live prediction gate. */
const live = new Map();
for (const file of walk(join(ROOT, "content"))) {
  let json;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!Array.isArray(lesson.steps)) continue;
  for (const [index, step] of lesson.steps.entries()) {
    if (!step.predict) continue;
    live.set(`${lesson.id}#${step.id ?? index}`, {
      reveal: String(step.predict.reveal ?? ""),
      prompt: String(step.predict.prompt ?? ""),
      path: relative(ROOT, file).split(sep).join("/"),
      widget: step.widget?.type ?? null
    });
  }
}

/* ---- the adjudication ---- */
function parseCsv(text) {
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
  const header = rows.shift();
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const adjudication = parseCsv(readFileSync(join(ROOT, "PREDICTION_GATE_ADJUDICATION.csv"), "utf8"));

/* ---- the comparison ---- */
const results = [];
const counts = { REMOVE: { closed: 0, open: 0 }, REWRITE: { closed: 0, open: 0, missing: 0 },
  KEEP: { present: 0, thinned: 0 }, THIN: { closed: 0, open: 0 }, REVERSED: { closed: 0, open: 0 } };

for (const row of adjudication) {
  const key = `${row.lesson_id}#${row.step_id}`;
  const verdict = row.proposed_verdict;
  const now = live.get(key);
  let state, detail;
  if (verdict === "REMOVE") {
    if (!now) { state = "closed"; detail = "gate absent, as adjudicated"; counts.REMOVE.closed++; }
    else { state = "OPEN"; detail = "REMOVE verdict but the gate is still live"; counts.REMOVE.open++; }
  } else if (verdict === "REWRITE") {
    if (!now) { state = "MISSING"; detail = "REWRITE verdict but the gate is gone entirely"; counts.REWRITE.missing++; }
    else if (now.reveal.trim() !== row.predict_reveal.trim()) {
      state = "closed"; detail = "reveal differs from the adjudicated text"; counts.REWRITE.closed++;
    } else { state = "OPEN"; detail = "reveal is byte-identical to the adjudicated text — the rewrite did not happen"; counts.REWRITE.open++; }
  } else if (verdict === "THIN") {
    // S242 ruling: thinned deliberately. A THIN row is CLOSED when the gate is absent — the same
    // shape as REMOVE, recorded separately because the decision was made after adjudication rather
    // than during it, and that distinction is the reason the file misled anyone in the first place.
    if (!now) { state = "closed"; detail = "thinned deliberately (S242 ruling)"; counts.THIN.closed++; }
    else { state = "OPEN"; detail = "marked THIN but the gate is still live"; counts.THIN.open++; }
  } else if (verdict === "THIN-REVERSED") {
    if (now) { state = "closed"; detail = "thinning reversed: the step is cml.flagship and its contract requires a prediction"; counts.REVERSED.closed++; }
    else { state = "OPEN"; detail = "THIN-REVERSED but the gate is absent — the flagship contract is broken"; counts.REVERSED.open++; }
  } else {
    if (now) { state = "present"; detail = "KEEP, still live"; counts.KEEP.present++; }
    else { state = "OPEN"; detail = "KEEP verdict but the gate is gone and no THIN verdict records why"; counts.KEEP.thinned++; }
  }
  results.push({ key, lesson: row.lesson_id, step: row.step_id, course: row.course_id, grade: row.grade, verdict, state, detail });
}

const adjudicatedKeys = new Set(adjudication.map((r) => `${r.lesson_id}#${r.step_id}`));
const added = [...live.keys()].filter((k) => !adjudicatedKeys.has(k)).sort();

/* ---- report ---- */
const open = results.filter((r) => r.state === "OPEN" || r.state === "MISSING");
console.log(`prediction-recertify @ ${seal}`);
console.log(`  adjudicated rows        ${adjudication.length}`);
console.log(`  live prediction gates   ${live.size}`);
console.log(`  REMOVE  closed ${counts.REMOVE.closed}/${counts.REMOVE.closed + counts.REMOVE.open}`);
console.log(`  REWRITE closed ${counts.REWRITE.closed}/${counts.REWRITE.closed + counts.REWRITE.open + counts.REWRITE.missing}`
  + (counts.REWRITE.open ? ` — ${counts.REWRITE.open} still byte-identical` : "")
  + (counts.REWRITE.missing ? ` — ${counts.REWRITE.missing} gone entirely` : ""));
console.log(`  KEEP    live ${counts.KEEP.present}${counts.KEEP.thinned ? `, ${counts.KEEP.thinned} GONE WITH NO THIN VERDICT` : ""}`);
console.log(`  THIN    closed ${counts.THIN.closed}/${counts.THIN.closed + counts.THIN.open} (deliberate, S242 ruling)`);
console.log(`  THIN-REVERSED closed ${counts.REVERSED.closed}/${counts.REVERSED.closed + counts.REVERSED.open} (flagship steps, restored)`);
console.log(`  gates added since adjudication: ${added.length}${added.length ? ` (${added.slice(0, 4).join(", ")}${added.length > 4 ? ", …" : ""})` : ""}`);
console.log(`  arithmetic: ${adjudication.length} adjudicated − ${counts.REMOVE.closed} removed − ${counts.THIN.closed} thinned − ${counts.KEEP.thinned} unexplained + ${added.length} added = ${adjudication.length - counts.REMOVE.closed - counts.THIN.closed - counts.KEEP.thinned + added.length} (live: ${live.size})`);
console.log(open.length ? `  ${open.length} ROW(S) STILL OPEN` : "  every adjudicated verdict is reflected in the live corpus");

if (WRITE) {
  const csv = (cells) => cells.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c))).join(",");
  writeFileSync(join(ROOT, "PREDICTION_PHASE4_RECERTIFICATION.csv"), [
    `# sourceSeal=${seal} generatedBy=scripts/audit/prediction-recertify.mjs`,
    "# Each adjudicated verdict compared against the LIVE lesson JSON, not against a previous report.",
    csv(["key", "course", "grade", "lesson", "step", "verdict", "state", "detail"]),
    ...results.map((r) => csv([r.key, r.course, r.grade, r.lesson, r.step, r.verdict, r.state, r.detail])),
    ...added.map((k) => csv([k, "", "", k.split("#")[0], k.split("#")[1], "(not adjudicated)", "added", "live gate the adjudication never saw"]))
  ].join("\n") + "\n");
  console.log("  wrote PREDICTION_PHASE4_RECERTIFICATION.csv");
}

process.exitCode = open.length ? 1 : 0;
