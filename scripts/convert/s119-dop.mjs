// S119 -- dop-05-01 "Counting Decimal Places", backlog rank 13, Tier D.
//
// Same shape S116 solved for ns-02-03, and solved the same way: the lesson's question is not
// "what is 0.3 x 0.4" (column arithmetic can produce 0.12) but WHY the answer carries two decimal
// places. A unit square cut into hundredths answers it as a fact about the grid -- a block 3
// tenths wide and 4 tenths tall covers 12 small squares, and each small square IS a tenth of a
// tenth, which is a hundredth. The place count stops being a digit-counting rule.
//
// Verified independently before authoring: 0.3 x 0.4 = 0.12; 3 columns x 4 rows = 12 cells of the
// 100-cell square; 12/100 = 0.12. And the misconception the lesson names -- adding the tenths
// instead of multiplying -- lands on 3 + 4 = 7, which is a DIFFERENT shading than 12, so it is a
// distinguishable state rather than a message.
//
// dop-05-01's i2 (an mcq asking how many places 1.2 x 0.5 needs) is deliberately left alone: it is
// the formalization check that follows the lab, which is the ordering the tier formula rewards.

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "content/courses/decimal-operations/lessons/dop-05-01.json";

const widget = {
  type: "probabilityArea",
  prompt:
    "The whole square is 1, cut into 100 small squares. Shade a block 3 tenths wide and 4 tenths tall, then count what you covered.",
  rows: 10,
  cols: 10,
  targetNum: 12,
  targetDen: 100,
  start: 0,
  successFeedback:
    "12 small squares \u2014 12 hundredths, or 0.12. Each small square is a tenth OF a tenth, which is a hundredth, and that is exactly why the answer needs two decimal places: one from each factor. The 12 comes from 3 \u00d7 4; the two places come from the grid.",
  lowFeedback:
    "Not enough shaded yet. The block is 3 columns across and 4 rows down \u2014 if you are near 7, you have ADDED the tenths instead of covering the rectangle they make.",
  highFeedback:
    "Too much shaded. Keep the block to 3 columns across and 4 rows down; anything wider or taller is a different product.",
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const doc = JSON.parse(readFileSync(PATH, "utf8"));
const step = doc.steps.find((s) => s.id === "i1");
if (!step) throw new Error("i1 not found");
if (step.widget?.type === "probabilityArea") { console.log("dop-05-01: already converted"); process.exit(0); }
if (step.widget?.type !== "numeric") throw new Error(`expected numeric, found ${step.widget?.type}`);
if (step.variant) throw new Error("i1 carries a variant tag");

const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
if (errs.length) throw new Error(`integrity \u2014 ${errs.join("; ")}`);

// Independent arithmetic, not trusting the authored numbers.
const cols = 3, rows = 4;
if (cols * rows !== widget.targetNum) throw new Error(`block ${cols}x${rows} != targetNum ${widget.targetNum}`);
if (widget.targetNum / widget.targetDen !== 0.3 * 0.4)
  throw new Error(`grid value ${widget.targetNum / widget.targetDen} != 0.3 x 0.4`);
if (cols + rows === widget.targetNum) throw new Error("the add-instead-of-multiply trap is not distinguishable");
console.log(`  verified: ${cols} x ${rows} = ${widget.targetNum} of ${widget.targetDen} = ${widget.targetNum / widget.targetDen} = 0.3 x 0.4`);

const bodyBefore = step.body;
const predictBefore = JSON.stringify(step.predict ?? null);
step.widget = widget;
if (step.body !== bodyBefore) throw new Error("body changed");
if (JSON.stringify(step.predict ?? null) !== predictBefore) throw new Error("authored predict changed");

writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log("dop-05-01/i1: numeric -> probabilityArea (authored predict preserved)");
