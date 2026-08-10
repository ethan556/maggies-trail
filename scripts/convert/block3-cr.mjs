// Conversion Playbook Block 3 (G10 geometry) — part 7: circles (cr-), closing out the block.
//
// This course needed no conversion at all: 12 of its 15 lessons already run `circleAngleExplore`
// or `circleMeasureExplore`, and the playbook (§3.7) said as much. What six of them lacked was the
// FIRST half of the loop — the lab is there, the commitment before it is not. That is the same gap
// `cp-03-01` had, and closing it took that lesson to Tier A.
//
// Each predict asks for the INVARIANT rather than the arithmetic the lab is about to display. A
// predict whose answer is the number on the readout is not a prediction, it is the answer key; a
// predict about the relationship ("must equal chords sit equally far from the centre?") is a claim
// the learner can hold wrongly and then watch fail. Every distractor here is a real misconception:
// that chord distance depends on position, that the perpendicular lands off-centre on the longer
// arc, that a bigger circle needs different machinery, that area and arc take different fractions.
//
// No widget block is modified. The script asserts the widget is byte-identical before and after,
// and refuses any step carrying a `variant` tag — the defect class that cost three reverts earlier
// in this session.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/circle-theorems/lessons";

const PLAN = {
  "cr-02-01": {
    step: "i1",
    expect: "circleMeasureExplore",
    predict: {
      prompt:
        "Two chords in the SAME circle happen to have the same length. Must they sit the same distance from the centre?",
      options: [
        { id: "always", label: "Always — equal chords are always equally far from the centre" },
        { id: "position", label: "Not necessarily — it depends where around the circle each one sits" },
        { id: "parallel", label: "Only if the two chords are parallel to each other" },
      ],
      outcomeId: "always",
      reveal:
        "Always. Half the chord, the distance to the centre, and the radius form a right triangle \u2014 fix the radius and the chord and the distance has no freedom left. Slide the chord and watch the distance readout depend on length alone, never on where it sits.",
    },
  },

  "cr-02-02": {
    step: "i1",
    expect: "circleMeasureExplore",
    predict:
      {
        prompt:
          "Drop a perpendicular from the centre onto a chord. Where does it meet the chord?",
        options: [
          { id: "midpoint", label: "Exactly at the midpoint — always, for every chord" },
          { id: "longer", label: "Nearer the end closer to the longer arc" },
          { id: "depends", label: "It depends on how long the chord is" },
        ],
        outcomeId: "midpoint",
        reveal:
          "Exactly the midpoint, every time. The two radii to the chord's ends are equal, so the triangle is isosceles and the perpendicular from the apex must bisect the base. Watch the two half-readouts stay equal to each other as you slide.",
      },
  },

  "cr-02-03": {
    step: "i1",
    expect: "circleMeasureExplore",
    predict: {
      prompt:
        "The circle is bigger now \u2014 radius 13, chord 24. Does finding the distance to the centre need anything new?",
      options: [
        { id: "same", label: "No — the same right triangle: half-chord, distance, radius" },
        { id: "bigger", label: "Yes — larger circles need the arc formula instead" },
        { id: "ratio", label: "Yes — you scale the previous answer by the ratio of the radii" },
      ],
      outcomeId: "same",
      reveal:
        "Nothing new. Half-chord 12, radius 13, distance 5 \u2014 a 5-12-13 triangle, exactly the same machinery as the 3-4-5 and 6-8-10 before it. Chord problems are Pythagoras wearing a circle.",
    },
  },

  "cr-03-01": {
    step: "i1",
    expect: "circleMeasureExplore",
    predict: {
      prompt: "Where a tangent touches the circle, what angle does it make with the radius drawn to that point?",
      options: [
        { id: "right", label: "Exactly 90\u00b0 — always, wherever the point of contact is" },
        { id: "varies", label: "It varies with how far the outside point sits from the centre" },
        { id: "acute", label: "Slightly less than 90\u00b0, since the tangent only grazes the curve" },
      ],
      outcomeId: "right",
      reveal:
        "Exactly 90\u00b0, always. That right angle is what makes the tangent length \u221a(D\u00b2 \u2212 r\u00b2) \u2014 the radius, the tangent and the line to the centre form a right triangle. Slide the outside point and watch the right angle refuse to move.",
    },
  },

  "cr-05-01": {
    step: "i1",
    expect: "circleMeasureExplore",
    predict: {
      prompt: "A 60\u00b0 arc sits in a circle of radius 6. What fraction of the whole circumference is it?",
      options: [
        { id: "sixth", label: "One sixth \u2014 because 60\u00b0 is one sixth of 360\u00b0" },
        { id: "depends", label: "It depends on the radius as well as the angle" },
        { id: "sixtieth", label: "60/360 of the DIAMETER rather than the circumference" },
      ],
      outcomeId: "sixth",
      reveal:
        "One sixth, and the radius never enters the fraction. An arc is the same share of the circumference that its angle is of the full turn \u2014 (1/6)(12\u03c0) = 2\u03c0. Open the angle and watch the fraction track the angle alone.",
    },
  },

  "cr-05-02": {
    step: "i1",
    expect: "circleMeasureExplore",
    predict: {
      prompt:
        "A 90\u00b0 sector takes a quarter of the circle's ARC. Does it also take a quarter of the AREA?",
      options: [
        { id: "same", label: "Yes \u2014 the same fraction of both" },
        { id: "squared", label: "No \u2014 area scales by the square, so it takes a sixteenth" },
        { id: "less", label: "No \u2014 area is a smaller share, since the sector narrows toward the centre" },
      ],
      outcomeId: "same",
      reveal:
        "The same fraction of both. The k\u00b2 rule governs SIMILAR figures scaled up; a sector is a SLICE of one fixed circle, so its angle takes the same share of everything \u2014 (1/4)(36\u03c0) = 9\u03c0. Open the angle and watch arc and area move in step.",
    },
  },
};

// ---- validate everything BEFORE writing anything ------------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);

  if (step.predict && step.predict.prompt === plan.predict.prompt) {
    skipped.push(lesson);
    continue;
  }
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

  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed — aborting`);
  if (JSON.stringify(step.widget) !== widgetBefore) throw new Error(`${lesson}: WIDGET CHANGED — aborting`);
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: +predict (widget ${plan.expect} untouched)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} newly given predicts, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
