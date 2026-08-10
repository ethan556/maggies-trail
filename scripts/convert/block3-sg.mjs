// Conversion Playbook Block 3 (G10 geometry) — part 1: solid geometry (sg-).
// Per §3.1: the engine was BUILT for Cavalieri (`comparisonRequired`, `targetFraction`) and the
// Cavalieri lessons never called it. Replaces the widget block of ONE step per lesson and adds a
// predict. Prose, ids, order, hints, conceptTags and every other step are untouched.
//
// Validate-all-then-write: every spec is parsed and integrity-checked BEFORE any file is written,
// so a bad spec can never reach disk half-way through the batch.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/solid-geometry/lessons";

/** lesson id -> { step, expect: old widget type, widget, predict } */
const PLAN = {
  "sg-01-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "Slide a plane through a sphere. Where is the cross-section BIGGEST?",
      options: [
        { id: "mid", label: "Exactly halfway — the slice through the centre" },
        { id: "top", label: "Near the top, where the surface curves hardest" },
        { id: "same", label: "Every parallel slice has the same area" },
      ],
      outcomeId: "mid",
      reveal:
        "Halfway. Only the slice through the centre is a circle of the sphere's full radius; every other parallel cut is a smaller circle. Sweep the plane and watch the area readout rise to its maximum and fall away again.",
    },
    widget: {
      type: "solidSliceLab",
      prompt:
        "Sweep the section plane through the sphere and stop where the cross-sectional area is greatest.",
      solid: "sphere",
      radius: 5,
      height: 10,
      targetFraction: 0.5,
      startFraction: 0.1,
      fractionStep: 0.05,
      tolerance: 0.03,
      comparisonRequired: false,
      requiredMoves: 4,
      successFeedback:
        "The middle slice wins: a circle of radius 5, area \u03c0(5\u00b2) \u2248 78.54 \u2014 the value the entry above asks for. It is the only cut that passes through the centre, so it is the only one that gets the whole radius.",
      positionFeedback:
        "Not the largest section yet \u2014 read the area as you move. It climbs toward the centre and falls away on either side.",
      comparisonFeedback: "Add the comparison solid to finish the reading.",
      invariantFeedback:
        "Try more heights first. One slice is a measurement; several slices are the evidence that the middle one is the maximum.",
    },
  },

  "sg-01-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A cone is cut by a plane parallel to its base, halfway up. How does that slice's AREA compare with the base?",
      options: [
        { id: "quarter", label: "One quarter of it \u2014 the radius halves, so the area quarters" },
        { id: "half", label: "Half of it \u2014 halfway up, half the area" },
        { id: "same", label: "The same \u2014 parallel cuts of a cone are congruent" },
      ],
      outcomeId: "quarter",
      reveal:
        "One quarter. Halfway up, the radius has halved \u2014 and area follows the SQUARE of the radius, so it drops to a quarter. This is the k\u00b2 rule appearing inside a single solid. Sweep the plane and watch the area fall faster than the height.",
    },
    widget: {
      type: "solidSliceLab",
      prompt:
        "Sweep the section plane up the cone and stop halfway. Watch how much faster the area shrinks than the height climbs.",
      solid: "cone",
      radius: 8,
      height: 12,
      targetFraction: 0.5,
      startFraction: 0.1,
      fractionStep: 0.05,
      tolerance: 0.03,
      comparisonRequired: false,
      requiredMoves: 4,
      successFeedback:
        "Halfway up, the radius is 4 and the area is \u03c0(4\u00b2) \u2248 50.27 \u2014 exactly a quarter of the base's \u03c0(8\u00b2). Height scaled by \u00bd; area scaled by \u00bd\u00b2. The exponent is not a rule here, it is something the readout did.",
      positionFeedback:
        "Not at the halfway cut yet \u2014 keep moving and compare the area readout against the base area as you go.",
      comparisonFeedback: "Add the comparison solid to finish the reading.",
      invariantFeedback:
        "Test more heights first \u2014 the point is the RATE the area falls, and one slice cannot show a rate.",
    },
  },

  "sg-02-01": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "Two solids have equal heights, and their cross-sections match at the bottom and at the top. Must they have the same volume?",
      options: [
        { id: "no", label: "No \u2014 they must match at EVERY height, not just two of them" },
        { id: "yes", label: "Yes \u2014 matching ends is enough to pin the volume" },
        { id: "cant", label: "There is no way to tell without the formulas" },
      ],
      outcomeId: "no",
      reveal:
        "No. Cavalieri's hypothesis is every height, and two agreements do not make a theorem \u2014 the solids are free to disagree everywhere in between. Sweep the plane through both and hunt for a height where the two readouts come apart.",
    },
    widget: {
      type: "solidSliceLab",
      prompt:
        "Two solids, same height. Sweep the section plane through BOTH and check the areas at matching heights \u2014 then stop at the middle.",
      solid: "cylinder",
      radius: 4,
      height: 8,
      baseArea: 50.2654824574,
      targetFraction: 0.5,
      startFraction: 0.1,
      fractionStep: 0.05,
      tolerance: 0.03,
      comparisonRequired: true,
      requiredMoves: 5,
      successFeedback:
        "Equal at every height you tested \u2014 THAT is the hypothesis Cavalieri actually needs. Matching at the two ends would have proved nothing; the theorem is about all the slices in between.",
      positionFeedback:
        "Keep sweeping, then finish at the middle height where both readouts can be compared side by side.",
      comparisonFeedback:
        "Bring in the second solid. Cavalieri is a comparison theorem \u2014 with one solid on screen there is nothing to compare, and 'every cross-section matches' has no second term.",
      invariantFeedback:
        "Two heights are not 'every height'. Test more before claiming the volumes must agree \u2014 that gap is exactly what this lesson is about.",
    },
  },

  "sg-02-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "Every cross-section of solid B has exactly half the area of A's at the same height. What is B's volume?",
      options: [
        { id: "half", label: "Half of A's \u2014 the ratio carries straight through" },
        { id: "quarter", label: "A quarter \u2014 areas scale as the square" },
        { id: "unknown", label: "Not determined without the shapes" },
      ],
      outcomeId: "half",
      reveal:
        "Half. Volume is the accumulation of slices, so a constant ratio between the slices passes straight to the total \u2014 no squaring, because nothing is being scaled in two directions here. Sweep and watch the ratio hold at every height.",
    },
    widget: {
      type: "solidSliceLab",
      prompt:
        "Sweep the plane and check the two area readouts at several matching heights. Does their RATIO ever change?",
      solid: "prism",
      radius: 4,
      height: 8,
      baseArea: 32,
      targetFraction: 0.5,
      startFraction: 0.1,
      fractionStep: 0.05,
      tolerance: 0.03,
      comparisonRequired: true,
      requiredMoves: 5,
      successFeedback:
        "The ratio held at every height you tested \u2014 so it holds for the accumulated total too. A constant slice ratio is a volume ratio; that is Cavalieri used as a scale, not just as an equality.",
      positionFeedback: "Keep sweeping, then settle at the middle height to finish the reading.",
      comparisonFeedback:
        "Add the second solid \u2014 a ratio needs two readouts, and there is only one on screen.",
      invariantFeedback:
        "Test more heights first. 'Every cross-section' is a claim about all of them, and it is the constancy you are checking.",
    },
  },

  "sg-03-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A pyramid has base area 36 and height 6. What is its cross-sectional area halfway up?",
      options: [
        { id: "nine", label: "9 \u2014 halfway up, the linear scale is \u00bd, so the area is \u00bc of 36" },
        { id: "eighteen", label: "18 \u2014 half the height, half the area" },
        { id: "twelve", label: "12 \u2014 a third, because pyramids are one-third solids" },
      ],
      outcomeId: "nine",
      reveal:
        "9. Halfway up, every horizontal length has halved, so the area is 36 \u00d7 (\u00bd)\u00b2 = 9. The one-third in the volume formula comes from ACCUMULATING these shrinking slices \u2014 it is not a factor you apply to any single one of them.",
    },
    widget: {
      type: "solidSliceLab",
      prompt:
        "Sweep the plane up the pyramid to the halfway cut, then watch how the shrinking slices accumulate toward one third.",
      solid: "cone",
      radius: 6,
      height: 6,
      baseArea: 36,
      targetFraction: 0.5,
      startFraction: 0.1,
      fractionStep: 0.05,
      tolerance: 0.03,
      comparisonRequired: true,
      requiredMoves: 5,
      successFeedback:
        "Area 9 at half height \u2014 a quarter of the base, because the linear halving is squared. Stack those quartering slices all the way up and the total lands at exactly one third of the enclosing prism. The coefficient was accumulated, not assumed.",
      positionFeedback:
        "Not at the halfway cut \u2014 keep moving and read the area against the base area of 36.",
      comparisonFeedback:
        "Bring in the enclosing solid. One third is a COMPARISON, so the thing it is one third OF has to be on screen.",
      invariantFeedback:
        "Test more heights first \u2014 the accumulation is the argument, and one slice cannot accumulate.",
    },
  },

  "sg-05-01": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "A statue is scaled up by k = 5. Its height, its bronze surface, and its weight scale by:",
      options: [
        { id: "kkk", label: "5, then 25, then 125 \u2014 one exponent per dimension involved" },
        { id: "all5", label: "5 for all three \u2014 scaling is scaling" },
        { id: "k2k3", label: "5, 125, 25 \u2014 weight before surface" },
      ],
      outcomeId: "kkk",
      reveal:
        "5, 25, 125. Length has one dimension, surface two, volume three, and each picks up one factor of k. Drag k and watch the three readouts pull apart at three different speeds \u2014 that separation IS the reason a scaled statue costs so much more bronze than it does height.",
    },
    widget: {
      type: "dilationExplore",
      prompt:
        "Drag the scale factor and watch the three readouts. They start together at k = 1 and separate immediately \u2014 set k = 2 and read all three.",
      shape: [
        [1, 1],
        [4, 1],
        [4, 3],
      ],
      center: [0, 0],
      targetK: 2,
      kMin: 0.5,
      kMax: 3,
      kStep: 0.5,
      kStart: 1,
      gridMin: 0,
      gridMax: 8,
      showRatios: ["length", "area", "volume"],
      successFeedback:
        "At k = 2: lengths \u00d72, area \u00d74, volume \u00d78. Three readouts, three exponents, one drag. Scaled to k = 5 the same pattern gives 5, 25 and 125 \u2014 the sort the entry above asks for.",
      lowFeedback:
        "Below 2 \u2014 and notice the readouts are already separating. Keep dragging up and watch the gap between them widen.",
      highFeedback:
        "Past 2 \u2014 ease back. The pattern is easiest to read at k = 2, where the three readouts are exactly 2, 4 and 8.",
    },
  },
};

// ---- validate everything BEFORE writing anything ----------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected widget ${plan.expect}, found ${step.widget?.type}`);
  if (plan.predict && step.predict)
    throw new Error(`${lesson}/${plan.step}: already has a predict — refusing to overwrite authored content`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
  if (errs.length) throw new Error(`${lesson}: integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  step.widget = plan.widget;
  if (plan.predict) {
    const rebuilt = {};
    for (const k of Object.keys(step)) {
      if (k === "widget") rebuilt.predict = plan.predict;
      rebuilt[k] = step[k];
    }
    if (!("predict" in rebuilt)) rebuilt.predict = plan.predict;
    for (const k of Object.keys(step)) delete step[k];
    Object.assign(step, rebuilt);
  }
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed — aborting`);
  staged.push([path, doc, lesson, plan]);
}

// ---- only now touch the disk ------------------------------------------------------------------
for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict)`);
}
console.log(`\n${staged.length} lessons converted (expected ${Object.keys(PLAN).length})`);
if (staged.length !== Object.keys(PLAN).length) throw new Error("unexpected conversion count");
