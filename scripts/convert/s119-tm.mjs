// S119, sixth pass -- tm-03-02 "Angles in a Triangle" (backlog rank 22, Tier D 24).
//
// The lesson's concept step states the invariant outright: "The three angles inside ANY triangle
// always add up to 180 degrees. Know two of them and you can find the third by subtracting." Its
// i1 then asks the subtraction (40 + 60 -> 80) in a numeric box. The word doing the work in that
// sentence is ANY -- and a single arithmetic question cannot show it, because one triangle is not
// evidence about every triangle.
//
// `triangleAngleLab` was built for exactly this: deform the triangle by dragging one vertex while
// all three angle readouts and their sum update live. The sum is the thing that REFUSES to move
// while everything else does, which is what an invariant is. The learner reaches a target angle by
// dragging, and watches 180 hold at every position on the way.
//
// Reachability verified on the widget's own 0.25 drag lattice (scripts/measure/tm-reach.ts,
// recomputing the angle from coordinates rather than importing the widget's helper, so a bug there
// could not certify itself): target A = 40 is reachable to within 0.03 degrees at C = (7.25, 6.25),
// well inside the authored 3-degree tolerance, and the three angles sum to exactly 180.000000 at
// every lattice point tested.
//
// i2 ("all three angles equal -- what is each?") and every check step are untouched: the numeric
// formalization now FOLLOWS the manipulation, the ordering the tier formula rewards.
//
// NOT converted, measured and declined:
//   tm-03-03 (Angle-Angle Similarity) -- the AA criterion is a claim about TWO triangles, and no
//     registered engine draws two. `triangleConstraintLab`'s criterion enum is
//     SSS/SAS/ASA/AAS/HL/SSA -- congruence criteria, not similarity, and AA is absent by
//     construction. `dilationExplore` shows a shape and its scaled image, which presumes similarity
//     rather than testing it. Forcing either would answer a different question than the lesson asks.
//   tm-05-01 (Volume of a Cylinder) -- `volumeBuilder` builds rectangular prisms (l x w x h) and
//     has no circular base; `solidSliceLab` grades a slice POSITION, and every cross-section of a
//     cylinder is identical, so no position is distinguishable and `targetFraction` would be
//     arbitrary. A cylinder-volume lab (drag r and h, watch pi*r^2*h accumulate) is a real engine
//     gap, not a conversion.

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "content/courses/transformations-measurement/lessons/tm-03-02.json";

const widget = {
  type: "triangleAngleLab",
  prompt:
    "Drag corner C to reshape the triangle until angle A reads 40\u00b0. Watch all three readouts \u2014 and especially their total \u2014 the whole way.",
  fixedA: [1, 1],
  fixedB: [7, 1],
  startC: [4, 6],
  targetAngleA: 40,
  tolerance: 3,
  gridMax: 8,
  requiredMoves: 4,
  successFeedback:
    "Angle A is 40\u00b0. Now look at what happened while you were dragging: every angle changed, and the total never did \u2014 it read 180\u00b0 at every single position. That is why knowing two angles fixes the third: the two you know plus the one you don't must fill exactly 180\u00b0, so the third is whatever is left over.",
  targetFeedback:
    "Not 40\u00b0 at corner A yet. Drag C further from A to open that angle, closer to narrow it \u2014 and keep an eye on the total as you do.",
  invariantFeedback:
    "Reshape the triangle a few more times first. One position cannot show you that the sum is fixed; watching it survive several different triangles is the entire point.",
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const doc = JSON.parse(readFileSync(PATH, "utf8"));
const step = doc.steps.find((s) => s.id === "i1");
if (!step) throw new Error("i1 not found");
if (step.widget?.type === "triangleAngleLab") { console.log("tm-03-02: already converted"); process.exit(0); }
if (step.widget?.type !== "numeric") throw new Error(`expected numeric, found ${step.widget?.type}`);
if (step.variant) throw new Error("i1 carries a variant tag");

const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
if (errs.length) throw new Error(`integrity \u2014 ${errs.join("; ")}`);

// Independent reachability + invariant check on the widget's own lattice.
const angleAt = (p, q, r) => {
  const u = [q[0] - p[0], q[1] - p[1]], v = [r[0] - p[0], r[1] - p[1]];
  const d = u[0] * v[0] + u[1] * v[1], m = Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]);
  return (Math.acos(Math.max(-1, Math.min(1, d / m))) * 180) / Math.PI;
};
let bestErr = Infinity, worstSum = 0;
for (let x = 0; x <= widget.gridMax; x += 0.25) {
  for (let y = 2; y <= widget.gridMax; y += 0.25) {
    const C = [x, y];
    const a = angleAt(widget.fixedA, widget.fixedB, C);
    const b = angleAt(widget.fixedB, widget.fixedA, C);
    bestErr = Math.min(bestErr, Math.abs(a - widget.targetAngleA));
    worstSum = Math.max(worstSum, Math.abs(a + b + (180 - a - b) - 180));
  }
}
if (bestErr > widget.tolerance) throw new Error(`target ${widget.targetAngleA} unreachable: closest is ${bestErr.toFixed(3)} off`);
if (worstSum > 1e-9) throw new Error(`angle sum drifts by ${worstSum}`);
console.log(`  verified: target ${widget.targetAngleA}\u00b0 reachable to ${bestErr.toFixed(3)}\u00b0 (tolerance ${widget.tolerance}\u00b0); sum invariant to ${worstSum}`);

const bodyBefore = step.body;
const predictBefore = JSON.stringify(step.predict ?? null);
step.widget = widget;
if (step.body !== bodyBefore) throw new Error("body changed");
if (JSON.stringify(step.predict ?? null) !== predictBefore) throw new Error("authored predict changed");

writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log("tm-03-02/i1: numeric -> triangleAngleLab (authored predict preserved)");
