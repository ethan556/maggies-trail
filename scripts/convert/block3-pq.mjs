// Conversion Playbook Block 3 (G10 geometry) — part 6: polygons & quadrilaterals (pq-).
//
// One conversion and two predicts. The conversion is `pq-04-03` (Kites), which is the lesson that
// exercises the kite-classifier bug this session found and fixed: `quadName` had tested only one
// of the two valid kite orientations, so a kite listed from a different starting vertex was
// reported as "just a quadrilateral." A lesson whose entire subject is "how is a kite different
// from a parallelogram" is exactly where that bug would have been visible to a learner.
//
// Its authored question is: both kites and parallelograms have two pairs of congruent sides —
// what's the difference? The answer is ADJACENT pairs versus OPPOSITE pairs, which is a fact about
// where the equal sides SIT, and therefore a fact a drag can show and a sentence can only assert.
// Verified against the real classifier before authoring: fixed (0,0), (4,3), (8,0) with the corner
// at (4,8) gives adjacent pairs 5, 5 and 8.94, 8.94 — `quadName` returns "a kite"; the start (7,6)
// returns "just a quadrilateral", so the lab opens genuinely unsolved.
//
// FIT AUDIT — the rest of the course:
//   - pq-03-01 already runs `quadDrag` WITH a predict. Untouched.
//   - pq-03-03 (Squares) and pq-05-02 (Always/Sometimes/Never) already run `quadDrag` and simply
//     never had a predict. Added; widget byte-identical.
//   - **pq-04-02 (The Trapezoid Midsegment) does NOT convert, even though enhancement (e)'s
//     `showMidsegment` was built for exactly this theorem.** Its two variant-free steps are a
//     degenerate-limit question (shrink the top base to 0 — which needs TWO vertices to move,
//     and `quadDrag` moves one) and a computation on bases 30 and 12, which do not fit a 10-unit
//     grid. The engine shows the right concept; neither step asks the question the engine answers.
//     Residue, and an honest one: `showMidsegment` ships used only by the gallery sample.
//   - pq-02-03 (Diagonals Bisect) needs a `targetClaim: "diagonalsBisect"` the schema does not
//     have. Out of scope; already recorded as future work.
//   - Everything else is angle-sum arithmetic on fixed polygons, and every one of those steps
//     carries a `variant` tag serving live numeric problems — converting any of them would break
//     the surface contract, the defect class this session already hit three times.
//
// Validate-all-then-write; the predict-only entries assert the widget is byte-identical after.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/polygons-quadrilaterals/lessons";

/** Conversions: widget replaced AND predict added. */
const CONVERT = {
  "pq-04-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "A kite and a parallelogram both have two pairs of equal sides. Where do the equal sides sit in each?",
      options: [
        { id: "adjacent", label: "Kite: the equal sides are ADJACENT (they share a corner). Parallelogram: OPPOSITE." },
        { id: "opposite", label: "The other way round — a kite pairs opposite sides" },
        { id: "same", label: "Both pair them the same way; the difference is only the angles" },
      ],
      outcomeId: "adjacent",
      reveal:
        "Adjacent. That single difference is the whole distinction \u2014 place the corner so the two equal sides meet at a vertex and the shape reads as a kite; pair them across from each other instead and it reads as a parallelogram.",
    },
    widget: {
      type: "quadDrag",
      prompt: "Pinned at (0, 0), (4, 3) and (8, 0). Place the fourth corner so the equal sides sit ADJACENT — a kite.",
      fixed: [
        [0, 0],
        [4, 3],
        [8, 0],
      ],
      targetX: 4,
      targetY: 8,
      startX: 7,
      startY: 6,
      gridMax: 10,
      targetName: "a kite",
      successFeedback:
        "A kite. The two short sides (each 5) share the corner at (4, 3), and the two long sides share the corner you just placed \u2014 equal pairs ADJACENT, not opposite. That is the one thing separating this from a parallelogram.",
      sideFeedback:
        "The equal sides here do not share a corner, so the shape has no name beyond \"quadrilateral.\" Move the corner until two sides that MEET are the same length.",
      angleFeedback:
        "Close \u2014 there are equal sides, but they are sitting opposite each other, which is a parallelogram's signature. A kite needs them adjacent.",
    },
  },
};

/** Predict-only: the widget is already right and is asserted unchanged. */
const PREDICT_ONLY = {
  "pq-03-03": {
    step: "i1",
    expect: "quadDrag",
    predict: {
      prompt:
        "Three corners are pinned at (0,0), (5,0) and (5,5). How many places can the fourth corner go and still make a square?",
      options: [
        { id: "one", label: "Exactly one — the other three corners have already decided it" },
        { id: "two", label: "Two — one on each side of the diagonal" },
        { id: "four", label: "Four — one for each rotation of the square" },
      ],
      outcomeId: "one",
      reveal:
        "Exactly one. Three corners of a square leave no freedom at all for the fourth \u2014 every other position breaks either a side length or a right angle. Place it and watch the name snap to \"a square\" at one spot and nowhere else.",
    },
  },
  "pq-05-02": {
    step: "i1",
    expect: "quadDrag",
    predict: {
      prompt:
        "You will place the corner so all four sides equal 5. Will that alone make it a square, or only a rhombus?",
      options: [
        { id: "rhombus", label: "Only a rhombus — equal sides say nothing about the angles" },
        { id: "square", label: "A square — four equal sides is exactly what a square means" },
        { id: "depends", label: "It depends where the other three corners were pinned" },
      ],
      outcomeId: "rhombus",
      reveal:
        "Only a rhombus. Four equal sides leave the angles free to lean \u2014 \"all sides equal\" is ALWAYS true of a square but only SOMETIMES gives you one. That gap is the whole point of always/sometimes/never.",
    },
  },
};

// ---- validate everything BEFORE writing anything ------------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];

for (const [lesson, plan] of Object.entries(CONVERT)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);
  if (step.predict && step.predict.prompt === plan.predict.prompt && step.widget?.type === plan.widget.type) {
    skipped.push(lesson);
    continue;
  }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.predict) throw new Error(`${lesson}/${plan.step}: already has a DIFFERENT predict`);
  if (step.variant) throw new Error(`${lesson}/${plan.step}: carries a variant tag — converting would break its surface contract`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${lesson}: integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  step.widget = plan.widget;
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") rebuilt.predict = plan.predict;
    rebuilt[k] = step[k];
  }
  if (!("predict" in rebuilt)) rebuilt.predict = plan.predict;
  for (const k of Object.keys(step)) delete step[k];
  Object.assign(step, rebuilt);
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  staged.push([path, doc, lesson, plan.step, "convert+predict"]);
}

for (const [lesson, plan] of Object.entries(PREDICT_ONLY)) {
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
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(step.widget) !== widgetBefore) throw new Error(`${lesson}: WIDGET CHANGED — aborting`);
  staged.push([path, doc, lesson, plan.step, "predict-only"]);
}

for (const [path, doc, lesson, stepId, kind] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${stepId}: ${kind}`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
const planned = Object.keys(CONVERT).length + Object.keys(PREDICT_ONLY).length;
console.log(`\n${staged.length} newly touched, ${skipped.length} already done (of ${planned})`);
if (staged.length + skipped.length !== planned) throw new Error("unexpected count");
