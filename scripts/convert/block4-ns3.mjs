// Conversion Playbook Block 4 (G6 Number System) — third batch: predicts on existing manipulatives.
//
// No widget block is modified; the script asserts each one byte-identical before and after. These
// four steps already run purpose-built engines (`absValueLine`, `dragOrder`, `matchPairs`) and were
// missing only the commitment before the manipulation — the same gap that took cp-03-01 and the six
// cr- labs to Tier A.
//
// Each predict names the misconception the step exists to break, not the answer the widget is about
// to show:
//   - ns-05-02: "greater" and "farther from zero" are different questions, and for negatives they
//     disagree. This is THE absolute-value confusion.
//   - ns-04-02: ordering negatives by magnitude reverses them. -8 is the smallest number and the
//     largest distance, simultaneously.
//   - ns-05-03: mixed decimal/fraction/negative forms tempt learners to order by "how the symbols
//     look" rather than by position on the line.
//   - ns-01-01: dividing by a number LESS THAN 1 makes the answer bigger than what you started
//     with, which contradicts the "division shrinks things" rule learned with whole numbers. It is
//     the single most load-bearing idea in the fraction-division unit.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/number-system/lessons";

const PLAN = {
  "ns-05-02": {
    step: "i2",
    expect: "absValueLine",
    predict: {
      prompt: "-4 and 3. One of them is the GREATER number; one is FARTHER from zero. Is it the same one?",
      options: [
        { id: "different", label: "No — 3 is greater, but -4 is farther from zero" },
        { id: "same", label: "Yes — the greater number is always the farther one" },
        { id: "neg", label: "No — -4 is both greater and farther, since 4 beats 3" },
      ],
      outcomeId: "different",
      reveal:
        "Different numbers answer the two questions. 3 sits to the RIGHT of -4, so 3 is greater. But -4 sits four steps from zero and 3 sits three, so -4 is farther. Order and distance are separate facts about the same pair.",
    },
  },

  "ns-04-02": {
    step: "i2",
    expect: "dragOrder",
    predict: {
      prompt: "0, -5, -1, -8 from smallest to largest. Where does -8 go?",
      options: [
        { id: "first", label: "First — it is the smallest, even though 8 is the biggest digit" },
        { id: "last", label: "Last among the negatives — 8 is the largest number there" },
        { id: "middle", label: "Between -5 and -1, ordered by size of the digit" },
      ],
      outcomeId: "first",
      reveal:
        "First. On the line, -8 sits farthest LEFT, and left means smaller. The digit 8 being large is exactly what pushes it further from zero in the negative direction — bigger digit, smaller number.",
    },
  },

  "ns-05-03": {
    step: "i2",
    expect: "dragOrder",
    predict: {
      prompt: "0.75, -2, 1.5, -1/2 — a decimal, a negative integer, another decimal and a negative fraction. What decides the order?",
      options: [
        { id: "position", label: "Position on the number line — the written form does not matter" },
        { id: "form", label: "Group them by form first: integers, then decimals, then fractions" },
        { id: "digits", label: "Compare the digits: 2 beats 1.5 beats 0.75 beats 1/2" },
      ],
      outcomeId: "position",
      reveal:
        "Position, and nothing else. A number's form is just how it is written down; -1/2 and -0.5 are the same point. Put each one where it falls on the line and the order reads off left to right.",
    },
  },

  "ns-01-01": {
    step: "i2",
    expect: "matchPairs",
    predict: {
      prompt: "Each question asks how many small pieces fit inside a bigger amount. Will those answers be bigger or smaller than the amount you started with?",
      options: [
        { id: "bigger", label: "Bigger — you are counting pieces, and small pieces are plentiful" },
        { id: "smaller", label: "Smaller — dividing always makes things smaller" },
        { id: "depends", label: "It depends which number is on top" },
      ],
      outcomeId: "bigger",
      reveal:
        "Bigger, every time the piece is smaller than one. \"Division makes things smaller\" is a rule learned with whole numbers, and it stops being true the moment you divide by something less than 1 — because you are counting how many pieces fit, and small pieces fit many times over.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);

  if (step.predict && step.predict.prompt === plan.predict.prompt) { skipped.push(lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.predict) throw new Error(`${lesson}/${plan.step}: already has a DIFFERENT predict`);
  if (step.variant) throw new Error(`${lesson}/${plan.step}: carries a variant tag — out of scope`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(step.widget));
  if (errs.length) throw new Error(`${lesson}: pre-existing widget fails integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  const widgetBefore = JSON.stringify(step.widget);
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") rebuilt.predict = plan.predict;
    rebuilt[k] = step[k];
  }
  if (!("predict" in rebuilt)) rebuilt.predict = plan.predict;
  for (const k of Object.keys(step)) delete step[k];
  Object.assign(step, rebuilt);
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(step.widget) !== widgetBefore) throw new Error(`${lesson}: WIDGET CHANGED — aborting`);
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: +predict (${plan.expect} untouched)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} predicts added, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
