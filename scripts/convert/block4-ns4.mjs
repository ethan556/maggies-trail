// Conversion Playbook Block 4 (G6 Number System) — fourth batch: decimal multiplication.
//
// ns-02-03 (Multiplying and Dividing Decimals, Tier D 24) was logged as blocked on a columnCalc
// enhancement: a product carries aDecimals + bDecimals places, so its point sits in a different
// column from the operands', which the renderer's single shared point-column cannot express. That
// diagnosis was right about `columnCalc` and wrong about the LESSON — column arithmetic is not the
// only, or the best, representation of what this step teaches.
//
// The authored step is "Compute 0.6 x 0.7" (answer 0.42), and its sibling i1 asks the conceptual
// question the whole lesson turns on: "how many decimal places does the answer need?". Column
// arithmetic can produce 0.42 but cannot show WHY it has two places. The area model can: on a
// unit square cut into hundredths, a block 6 tenths wide and 7 tenths tall covers 42 small
// squares, and each small square IS a hundredth because a tenth of a tenth is a hundredth. The
// place count stops being a rule about counting digits and becomes a fact about the grid.
//
// `probabilityArea` already does exactly this — shade cells, grade the fraction — and needs no
// engine work at all. 10x10 grid, target 42/100. Verified before authoring: 42 grades correct,
// the empty start is not pre-solved, and 13 (the "add the tenths, 6 + 7" error) falls to the low
// path rather than silently passing.
//
// STILL BLOCKED, and sharpened rather than repeated:
//   - **ns-02-01 (Multi-Digit Division, D 24).** Its step is "verify 936 / 24 = 39 by computing
//     24 x 39" — so what it actually needs is TWO-DIGIT MULTIPLICATION, not division. `columnCalc`
//     caps the multiplier at a single digit 2-9 because `columnCalcReachable` enumerates one
//     partial-product pass (`(A[i] ?? 0) * b`). A two-digit multiplier means two partial-product
//     rows plus a final addition — three interacting move-sequences instead of one, a different
//     grid geometry, and a reachability enumeration that is a different algorithm rather than a
//     wider loop. That is a scoped engine project, not a field.
//   - **columnCalc decimal multiply** remains unimplemented for the same structural reason found
//     by reading the renderer: `ccPt` emits the point as a fixed separator cell after column index
//     `decimals` in EVERY row, and that shared alignment is deliberately the content of the
//     add/subtract lesson. Per-row point positions also break down when the product needs more
//     decimal places than the operand grid has columns (0.6 x 0.7 scales to a single-digit grid
//     but a two-place answer). Recorded so the next attempt starts from the real constraint.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/number-system/lessons";

const PLAN = {
  "ns-02-03": {
    step: "i2",
    expect: "numeric",
    widget: {
      type: "probabilityArea",
      prompt:
        "The whole square is 1, cut into 100 small squares. Shade a block 6 tenths wide and 7 tenths tall, then count what you covered.",
      rows: 10,
      cols: 10,
      targetNum: 42,
      targetDen: 100,
      start: 0,
      successFeedback:
        "42 small squares — 42 hundredths, or 0.42. Each small square is a tenth OF a tenth, which is a hundredth, and that is the whole reason the answer needs two decimal places: one from each factor. Counting places is not a rule to memorise; it is what the grid was always going to do.",
      lowFeedback:
        "Not enough shaded yet. The block is 6 columns across and 7 rows down — if you are near 13, you have added the tenths instead of covering the rectangle they make.",
      highFeedback:
        "Too much shaded. Keep the block to 6 columns across and 7 rows down; anything wider or taller is a different product.",
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
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (authored predict preserved)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
