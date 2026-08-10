// Conversion Playbook Block 3 (G10 geometry) — part 5: constructions & proof (cp-).
//
// THE PLAYBOOK'S PRESCRIPTION DOES NOT SURVIVE CONTACT WITH THE CONTENT, and the finding matters
// more than the batch. §3.5 says: extend `compassConstruct`'s mode enum, then convert the cp-
// construction lessons onto the new modes. The enum WAS extended this session — angleBisector,
// perpAtPoint, perpFromPoint, parallelThroughPoint, copyAngle all ship, tested and gallery-covered.
// But the lessons those modes were built for cannot take them, for a reason that only appears when
// you read the widget block instead of its type name:
//
//   cp-01-03/i1, cp-02-01/i1, cp-02-02/i1, cp-02-03/i1 are `steppedReveal` widgets whose
//   `panels` array holds THREE STAGES OF AUTHORED INSTRUCTIONAL PROSE each — e.g. "Point on V,
//   swing an arc that crosses one side at D and the other at E. Now VD = VE." Replacing the
//   widget block deletes that teaching text. The frozen-content rule exists precisely for this.
//
// And there is no second step to convert instead: every other variant-free step in those four
// lessons is arithmetic, not construction (bisect 90° → 45; alternate angle of 55° → 55;
// corresponding angle 63° → 63). An engine that opens a compass cannot pose "what is half of 90."
//
// So the gain here is NOT a widget swap. It is the missing HALF of the loop: these steps already
// show the construction, but they ask for no commitment before revealing it. Adding a `predict`
// gives predict → observe → explain while deleting nothing. Precedent is well established — the
// `steppedReveal` + `predict` pairing already ships in multiple courses (mult-01-05, mult-02-03,
// mult-03-05, mult-04-03, pv2-04-01 and others), so this invents no new convention.
//
// Each predict asks the question the construction's WARRANT answers — the equidistance that does
// the work — not "what will the picture look like." That is the fact the lesson is really about,
// and the one a learner can hold a wrong belief about while still copying the steps correctly.
//
// cp-03-01 is the same shape from the other direction: it already runs `compassConstruct`
// (hexagon) and simply never had a predict. Added.
//
// Validate-all-then-write. NO widget block is modified by this script at all — it asserts the
// widget is byte-identical before and after, so a mistake here cannot silently rewrite content.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/constructions-and-proof/lessons";

/** lesson -> { step, expect (widget type, asserted unchanged), predict } */
const PLAN = {
  "cp-01-03": {
    step: "i1",
    expect: "steppedReveal",
    predict: {
      prompt:
        "The construction swings one arc from V, then equal arcs from where it cut the two sides. What makes the final ray an exact bisector — not just a close one?",
      options: [
        {
          id: "equidistant",
          label: "The meeting point F is the same distance from both arms, so VF must split the angle evenly",
        },
        { id: "middle", label: "It is drawn through the middle of the arc, which looks halfway" },
        { id: "measure", label: "Nothing guarantees it — you check it afterwards with a protractor" },
      ],
      outcomeId: "equidistant",
      reveal:
        "Equidistance does the work. VD = VE because they are one arc from V; then F is an equal radius from BOTH D and E. Two triangles with three matching sides are congruent, so the two halves of the angle are equal \u2014 exactly, and without measuring anything.",
    },
  },

  "cp-02-01": {
    step: "i1",
    expect: "steppedReveal",
    predict: {
      prompt:
        "P sits ON the line. The construction first marks two points equidistant from P, then swings equal arcs from those. Why does that force a RIGHT angle at P?",
      options: [
        {
          id: "isosceles",
          label: "The crossings are equidistant from both marks, so the line through them is the perpendicular bisector of the segment they span — and P is its midpoint",
        },
        { id: "eyeball", label: "It doesn't force it — you line it up by eye and check" },
        { id: "radius", label: "Any line drawn through two arc crossings is automatically perpendicular" },
      ],
      outcomeId: "isosceles",
      reveal:
        "The two marks are equal distances from P, so P is the MIDPOINT of the segment joining them. The crossings are equidistant from both marks, which is the definition of the perpendicular bisector of that segment \u2014 and a perpendicular bisector meets the segment square, at its midpoint, which is P.",
    },
  },

  "cp-02-02": {
    step: "i1",
    expect: "steppedReveal",
    predict: {
      prompt:
        "P is OFF the line. The first arc from P cuts the line in two places. Before the rest of the construction runs \u2014 what does that pair of points already guarantee?",
      options: [
        {
          id: "equidistant",
          label: "Both are the same distance from P, so P sits on their perpendicular bisector — and that bisector is the drop",
        },
        { id: "nearest", label: "One of the two is the nearest point on the line to P" },
        { id: "nothing", label: "Nothing yet — the two points are just construction scaffolding" },
      ],
      outcomeId: "equidistant",
      reveal:
        "The two cuts are one arc from P, so P is equidistant from both \u2014 which puts P on the perpendicular bisector of the segment between them. That bisector is the perpendicular you are dropping; the rest of the construction just finds a second point on it so you can draw it.",
    },
  },

  "cp-02-03": {
    step: "i1",
    expect: "steppedReveal",
    predict: {
      prompt:
        "The parallel construction copies an angle from the given line up to P. Why does copying an angle force the two lines never to meet?",
      options: [
        {
          id: "corresponding",
          label: "Equal corresponding angles at a transversal is exactly the condition for two lines to be parallel",
        },
        { id: "distance", label: "Because the copy is made the same distance away from the line" },
        { id: "looks", label: "It doesn't force it — the copy just makes them look parallel" },
      ],
      outcomeId: "corresponding",
      reveal:
        "Equal corresponding angles IS parallelism \u2014 it is the converse of the transversal theorem, and it is a proof rather than an appearance. The compass never measures a distance to the line; it only carries an angle, and that alone is enough.",
    },
  },

  "cp-03-01": {
    step: "i1",
    expect: "compassConstruct",
    predict: {
      prompt:
        "You will step the compass around a circle of radius 6. What compass opening lands you exactly back at the start after six steps?",
      options: [
        { id: "radius", label: "6 — the radius itself" },
        { id: "half", label: "3 — half the radius, since six steps is a lot" },
        { id: "circumference", label: "About 6.3 — a sixth of the circumference" },
      ],
      outcomeId: "radius",
      reveal:
        "The radius itself. A chord equal to the radius makes an equilateral triangle with the two radii to its ends, so it subtends exactly 60\u00b0 \u2014 and six 60\u00b0 steps is one full lap. Set the compass to 6 and walk it round.",
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
  if (step.predict) throw new Error(`${lesson}/${plan.step}: already has a DIFFERENT predict — refusing to overwrite`);
  if (step.variant)
    throw new Error(`${lesson}/${plan.step}: carries a variant tag — out of scope for this batch`);

  // The widget is NOT being changed here; re-validate it anyway so a pre-existing bad spec can't
  // ride along unnoticed just because this path skips the swap.
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
