#!/usr/bin/env node
/**
 * S200 §22 figure repair — applier.
 *
 * Reads a mapping of `lessonPath -> { stepId: figureId }` and inserts a `figure` key
 * immediately after `body` on each named concept step. Abort-before-write: every
 * precondition across EVERY file is checked before a single byte is written, so a bad
 * mapping cannot leave the corpus half-edited.
 *
 * Preconditions asserted per step:
 *   - the step exists
 *   - its kind is "concept"
 *   - it has no `figure` already (never silently overwrite authored content)
 *   - the figure id is registered in FIGURE_IDS (an unregistered id renders nothing)
 *
 * Nothing else in the file is touched: prose, answers, hints, ids, order and widgets are
 * re-serialised from the parsed original, so the diff is exactly one added key per step
 * (plus the comma on the preceding line).
 *
 * Usage: node scripts/session/s200-apply-figures.mjs <mapping.json>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const mappingPath = process.argv[2];
if (!mappingPath) {
  console.error("usage: node scripts/session/s200-apply-figures.mjs <mapping.json>");
  process.exit(2);
}
const root = process.cwd();
const plan = JSON.parse(readFileSync(mappingPath, "utf8"));
const idsSrc = readFileSync(join(root, "src", "components", "figureIds.ts"), "utf8");
const open = idsSrc.indexOf("new Set([");
const close = idsSrc.indexOf("])", open);
const IDS = new Set([...idsSrc.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const staged = [];
const problems = [];
let stepCount = 0;

for (const [rel, byStep] of Object.entries(plan)) {
  let raw;
  try { raw = readFileSync(join(root, rel), "utf8"); }
  catch { problems.push(`${rel}: cannot read`); continue; }
  let doc;
  try { doc = JSON.parse(raw); }
  catch (e) { problems.push(`${rel}: invalid JSON (${e.message})`); continue; }
  const byId = new Map((doc.steps ?? []).map((s) => [s.id, s]));
  for (const [stepId, figureId] of Object.entries(byStep)) {
    stepCount += 1;
    const step = byId.get(stepId);
    if (!step) { problems.push(`${rel}:${stepId} does not exist`); continue; }
    if (step.kind !== "concept") { problems.push(`${rel}:${stepId} is kind "${step.kind}", not concept`); continue; }
    if (step.figure !== undefined) { problems.push(`${rel}:${stepId} already has figure "${step.figure}" — refusing to overwrite`); continue; }
    if (!IDS.has(figureId)) { problems.push(`${rel}:${stepId} -> "${figureId}" is not registered in FIGURE_IDS`); continue; }
  }
  staged.push({ rel, raw, byStep });
}

if (problems.length) {
  console.error(`figure applier ABORTED before writing — ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log(`preconditions OK: ${staged.length} files / ${stepCount} steps`);

for (const { rel, raw, byStep } of staged) {
  const doc = JSON.parse(raw);
  for (const step of doc.steps) {
    const figureId = byStep[step.id];
    if (!figureId) continue;
    const entries = Object.entries(step);
    for (const k of Object.keys(step)) delete step[k];
    for (const [k, v] of entries) {
      step[k] = v;
      if (k === "body") step.figure = figureId;
    }
  }
  writeFileSync(join(root, rel), JSON.stringify(doc, null, 2) + "\n");
}

// post-verify from disk, not from memory
let verified = 0;
for (const [rel, byStep] of Object.entries(plan)) {
  const doc = JSON.parse(readFileSync(join(root, rel), "utf8"));
  for (const step of doc.steps) {
    if (byStep[step.id]) {
      if (step.figure !== byStep[step.id]) { console.error(`POST-VERIFY FAILED ${rel}:${step.id}`); process.exit(1); }
      verified += 1;
    }
  }
}
console.log(`applied and verified from disk: ${verified} figures across ${staged.length} lessons`);
for (const { rel } of staged) console.log(`  ${rel}`);
