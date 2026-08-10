// Conversion Playbook Block 4 — ns-02-02 (Adding and Subtracting Decimals), unblocked by the
// S116 `columnCalc.decimals` enhancement.
//
// This lesson sat at Tier D because every place-value engine in the registry is integer-only:
// `placeValue` is hundreds/tens/ones typed `z.number().int()`, `baseTenCompose` takes an integer
// target capped at 999, and `columnCalc` had no notion of a point. The fix keeps ALL of that
// integer machinery and adds only what decimals actually are — a shift in what the columns are
// CALLED, and a mark showing where the shift happens.
//
// 8.60 + 0.75 is authored as `a: 860, b: 75, decimals: 2`. Every carry, every reachability check
// and every commonResults value stays an exact integer; nothing anywhere touches a float. The
// widget renames column 0 from "ones" to "hundredths", column 1 to "tenths", column 2 back to
// "ones", and draws the point between columns 2 and 1 in every row. That is the whole lesson made
// mechanical: "line up the points" is not a separate rule to remember, it is what lining up the
// PLACES already means, and the padding of 8.6 to 8.60 is visible as the empty hundredths column
// the learner has to fill.
//
// The single reachable wrong answer, 835 (8.35), is the forgotten carry: the tenths column makes
// 6 + 7 = 13, and the extra whole has to move left into the ones. It was taken from
// `columnCalcReachable`, not invented — an earlier draft of this spec used a made-up misconception
// value and the integrity gate correctly rejected it as unreachable.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/number-system/lessons";

const PLAN = {
  "ns-02-02": {
    step: "i2",
    expect: "numeric",
    widget: {
      type: "columnCalc",
      op: "add",
      a: 860,
      b: 75,
      decimals: 2,
      prompt:
        "Add 8.60 + 0.75 column by column. Work right to left, and carry when a column passes 9.",
      commonResults: [
        {
          value: 835,
          feedback:
            "8.35 \u2014 the tenths column is right, but the carry never moved. 6 tenths + 7 tenths is 13 tenths, which is one WHOLE and 3 tenths: the 3 stays, the whole belongs in the ones column.",
        },
      ],
      fallbackFeedback:
        "Not there yet. Start at the hundredths (the rightmost column) and work left, carrying whenever a column total passes 9.",
      successFeedback:
        "9.35. Notice that nothing about the arithmetic was special \u2014 the columns carried exactly as whole numbers do. The only decimal-specific move was lining the points up, which is the same thing as lining the PLACES up: hundredths under hundredths, tenths under tenths.",
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
  if (step.widget?.type === plan.widget.type) { skipped.push(lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.variant)
    throw new Error(`${lesson}/${plan.step}: carries a variant tag — converting would break its surface contract`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${lesson}: integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  const predictBefore = JSON.stringify(step.predict ?? null);
  step.widget = plan.widget;
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(step.predict ?? null) !== predictBefore)
    throw new Error(`${lesson}: authored predict changed — aborting`);
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> columnCalc decimals:${plan.widget.decimals} (authored predict preserved)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted (of ${Object.keys(PLAN).length})`);
