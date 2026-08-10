// S119, eighth pass -- smg1-02-03 "Fourths Make Halves" (Grade 1, backlog rank 25, Tier C 22).
//
// "How many fourths make one half?" is a question about a picture, answered in a numeric box. The
// bar answers it directly: build fourths one at a time and watch the second one land exactly on the
// half mark. Nothing is computed; the equivalence is seen.
//
// Verified: 2/4 = 1/2 exactly (2 x 2 = 4 x 1). Both traps sit inside the slider bounds and neither
// equals the target's value, which the integrity gate independently requires -- 1/4 = 0.25 and
// 4/4 = 1, against a target of 0.5.
//
// Copy is written for six-year-olds: short sentences, concrete words, no algebra vocabulary.
//
// The rest of the course was measured and DECLINED:
//   smg1-01-01/01-02/01-03 count a shape's sides, faces and corners. `tapDiagram` is the only
//     tap-to-count engine and it places ICONS at coordinates on a blank canvas -- it never draws
//     the shape. "Tap each side of the triangle" would present no triangle to tap, so the counting
//     would be of floating markers rather than of a figure's parts. A shape-parts mode that draws
//     the polygon or solid and makes its sides/vertices tappable is the honest fix.
//   smg1-03-02 asks "how many MORE" (5 paperclips vs 3). `lengthCompare` draws exactly that
//     picture, with per-unit tick marks, but its `pick` mode grades WHICH BAR is tapped, not the
//     difference between them. Converting would grade "the pencil" when the lesson asks for 2.
//     A difference-readout mode on lengthCompare is the natural fix and would serve the whole
//     comparison family.

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "content/courses/shapes-measure-g1/lessons/smg1-02-03.json";

const predict = {
  prompt: "You will add fourths one at a time. How many will it take to reach the half mark?",
  options: [
    { id: "two", label: "Two fourths" },
    { id: "one", label: "Just one fourth" },
    { id: "four", label: "All four fourths" },
  ],
  outcomeId: "two",
  reveal:
    "A half is one of two equal parts, and a fourth is one of four. Two fourths side by side reach exactly as far as one half \u2014 you are about to watch them land on the same spot.",
};

const widget = {
  type: "fractionBar",
  prompt: "Make fourths until your bar reaches the half mark. How many fourths did it take?",
  targetNum: 2,
  targetDen: 4,
  numMin: 1,
  numMax: 12,
  denMin: 1,
  denMax: 12,
  numStart: 1,
  denStart: 1,
  commonFractions: [
    {
      num: 1,
      den: 4,
      feedback:
        "One fourth is only half as far as the half mark. Add one more fourth and look again.",
    },
    {
      num: 4,
      den: 4,
      feedback:
        "Four fourths fill the WHOLE bar, not half of it. Take some away and stop at the half mark.",
    },
  ],
  lowFeedback: "Not far enough yet. Keep adding fourths until you reach the half mark.",
  highFeedback: "That went past the half mark. Take a fourth away.",
  successFeedback:
    "Two fourths! The bar stops in exactly the same place as one half. That is why 2/4 and 1/2 are two names for the same amount \u2014 the pieces are smaller, so you need more of them to go the same distance.",
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const doc = JSON.parse(readFileSync(PATH, "utf8"));
const step = doc.steps.find((s) => s.id === "i1");
if (!step) throw new Error("i1 not found");
if (step.widget?.type === "fractionBar") { console.log("smg1-02-03: already converted"); process.exit(0); }
if (step.widget?.type !== "numeric") throw new Error(`expected numeric, found ${step.widget?.type}`);
if (step.variant) throw new Error("i1 carries a variant tag");
if (step.predict) throw new Error("i1 already has a predict");

const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
if (errs.length) throw new Error(`integrity \u2014 ${errs.join("; ")}`);

// Independent arithmetic: the target really is one half, and neither trap shares its value.
if (widget.targetNum * 2 !== widget.targetDen)
  throw new Error(`${widget.targetNum}/${widget.targetDen} is not one half`);
for (const t of widget.commonFractions)
  if (t.num * widget.targetDen === t.den * widget.targetNum)
    throw new Error(`trap ${t.num}/${t.den} equals the target value`);
console.log(`  verified: ${widget.targetNum}/${widget.targetDen} = 1/2 exactly; both traps distinct in value`);

const bodyBefore = step.body;
const rebuilt = {};
for (const k of Object.keys(step)) {
  if (k === "widget") { rebuilt.predict = predict; rebuilt.widget = widget; continue; }
  rebuilt[k] = step[k];
}
if (rebuilt.body !== bodyBefore) throw new Error("body changed");
const idx = doc.steps.findIndex((s) => s.id === "i1");
doc.steps[idx] = rebuilt;

writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log("smg1-02-03/i1: numeric -> fractionBar (+predict)");
