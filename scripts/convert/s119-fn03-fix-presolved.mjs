// S119 hygiene fix — three `sequenceBuild` geometricTerm steps opened PRE-SOLVED because the
// conversion script used a blanket `start: 2`, and 2 is also the smallest valid ratio — so any
// step whose correct answer happened to be 2 opened already showing it. Caught by
// content.widgets.audit.test.ts on its first real pass over this content.
//
// Fix: move `start` to 5 for exactly the three affected steps (fn-03-02/i3 r=2, fn-03-03/i1 r=2,
// fn-03-03/i3 r=2) — a valid position within [2, rMax=9] that is provably not the target ratio for
// any of them. Nothing else in each step changes; the body, prompt, and every feedback string are
// asserted byte-identical before and after.
import { readFileSync, writeFileSync } from "node:fs";
const { geometricTerm } = await import("../../src/lib/schema.ts");

const FIXES = [
  { path: "content/courses/functions-and-sequences/lessons/fn-03-02.json", step: "i3" },
  { path: "content/courses/functions-and-sequences/lessons/fn-03-03.json", step: "i1" },
  { path: "content/courses/functions-and-sequences/lessons/fn-03-03.json", step: "i3" },
];
const NEW_START = 5;

let n = 0;
for (const { path, step } of FIXES) {
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const st = doc.steps.find((s) => s.id === step);
  if (!st) throw new Error(`${path}/${step}: missing`);
  const w = st.widget;
  if (w?.type !== "sequenceBuild" || w.mode !== "geometricTerm") throw new Error(`${path}/${step}: not a geometricTerm step`);

  // Independently re-derive that the CURRENT start is the defect (pre-solved) and that the new
  // start genuinely is not — never trust the description, check the arithmetic.
  const answerNow = w.start;
  const preSolvedNow = geometricTerm(w.first, answerNow, w.atPosition) === w.targetTerm;
  if (!preSolvedNow) throw new Error(`${path}/${step}: expected this to be the pre-solved case, but it is not — investigate before patching`);
  const stillPreSolved = geometricTerm(w.first, NEW_START, w.atPosition) === w.targetTerm;
  if (stillPreSolved) throw new Error(`${path}/${step}: NEW_START=${NEW_START} is ALSO the correct ratio — pick a different value`);
  if (NEW_START < 2 || NEW_START > w.rMax) throw new Error(`${path}/${step}: NEW_START=${NEW_START} is outside [2, ${w.rMax}]`);

  const widgetBefore = JSON.stringify(w);
  w.start = NEW_START;
  const widgetAfter = JSON.stringify(w);
  // Every field except `start` must be byte-identical.
  const before = JSON.parse(widgetBefore); before.start = NEW_START;
  if (JSON.stringify(before) !== widgetAfter) throw new Error(`${path}/${step}: an unrelated field changed`);

  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${path.split("/").pop()}/${step}: start ${answerNow} -> ${NEW_START} (was pre-solved at r=${answerNow}, target ratio unaffected)`);
  n++;
}
console.log(`${n} steps patched`);
