// Conversion Playbook Block 3 (G10 geometry) — part 4: similarity (sy-).
//
// `sy-03-01` is the lesson enhancement (b)'s `segments` mode was BUILT for, and it is the whole
// reason that mode exists: the side-splitter theorem is the claim that two ratios cannot be made
// to disagree, and a static diagram can only assert that. Here the learner drags the parallel cut
// the length of the triangle and watches AD/DB and AE/EC track each other at every position —
// the invariance is the thing you cannot break, not a sentence under a picture.
//
// FIT AUDIT — every widget step of all 15 lessons was read, not just i1:
//   - sy-01-01, sy-05-03 ALREADY run `dilationExplore` with authored predicts. Untouched.
//   - sy-03-01/i1 converts (below). Its numbers map exactly onto the engine: AD = 4, DB = 6 puts
//     the cut at t = AD/AB = 0.4, where BOTH readouts show 0.67 — which is 4/6 and equally 6/9,
//     so the step's own answer (EC = 9) is the number on screen.
//   - sy-03-02 (the CONVERSE) does NOT fit, despite being the adjacent lesson and sounding like
//     it should. `SideSplitterW`'s cutter is parallel BY CONSTRUCTION — it interpolates D and E
//     at the same parameter t along two sides, so it can never display a non-parallel cut. The
//     converse's entire content is "given ratios that match / don't match, IS it parallel?", and
//     an engine that cannot render the non-parallel case cannot pose that question. Forcing it
//     would show the learner a parallel line while asking them to decide whether it is parallel.
//   - The rest (criterion selection, geometric mean, indirect measurement, scale drawings) are
//     computation or classification on fixed figures; no drag target. Residue.
//
// Only i1 carries no `variant` tag on sy-03-01 — checked before conversion, after this session's
// two reverts caused by exactly that oversight elsewhere. k1/k2/ch all declare `g10-similarity`
// and are left strictly alone.
//
// Validate-all-then-write, matching block3-sg.mjs / block3-cx.mjs.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/similarity/lessons";

const PLAN = {
  "sy-03-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A line parallel to the base cuts the other two sides. Slide it up and down: can the two ratios AD/DB and AE/EC ever come apart?",
      options: [
        { id: "never", label: "Never — wherever the parallel cut sits, the two ratios stay equal" },
        { id: "sometimes", label: "Sometimes — they only match when the cut is at the midpoint" },
        { id: "shape", label: "It depends on the triangle — they match only in isosceles ones" },
      ],
      outcomeId: "never",
      reveal:
        "Never. Drag the cut anywhere along the sides and the two readouts move together, digit for digit \u2014 that is the side-splitter theorem, and the reason it can be used to solve for a missing length.",
    },
    widget: {
      type: "dilationExplore",
      prompt:
        "Slide the parallel cut until AD = 4 and DB = 6 \u2014 four tenths of the way down \u2014 then read what the other side is forced to do.",
      shape: [
        [1, 11],
        [1, 1],
        [11, 1],
      ],
      center: [0, 0],
      targetK: 0.4,
      kMin: 0.1,
      kMax: 0.9,
      kStep: 0.1,
      kStart: 0.1,
      gridMin: 0,
      gridMax: 12,
      showRatios: ["segments"],
      successFeedback:
        "Both readouts show 0.67. That is AD/DB = 4/6 \u2014 and it is equally AE/EC = 6/9, which is why EC must be 9. Slide the cut anywhere else and the two numbers change together and stay equal: the ratio is forced, never coincidental.",
      lowFeedback:
        "The cut is too high \u2014 AD/DB is still under 4/6. Keep sliding down, and watch the second ratio follow the first the whole way.",
      highFeedback:
        "Past it \u2014 AD/DB has gone above 4/6. Ease back up. Notice that overshooting moved BOTH ratios, never just one.",
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

  // Idempotent: a second run against an already-converted tree is a no-op, not an error.
  if (step.predict && step.predict.prompt === plan.predict.prompt && step.widget?.type === plan.widget.type) {
    skipped.push(lesson);
    continue;
  }

  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected widget ${plan.expect}, found ${step.widget?.type}`);
  if (step.predict)
    throw new Error(`${lesson}/${plan.step}: already has a DIFFERENT predict — refusing to overwrite`);
  // The defect class this session kept hitting: converting a step whose `variant` tag declares a
  // generator that serves the OLD surface silently kills that step's freshness.
  if (step.variant)
    throw new Error(`${lesson}/${plan.step}: carries a variant tag (${step.variant.gen}) — converting would break its surface contract`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
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
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed — aborting`);
  staged.push([path, doc, lesson, plan]);
}

// ---- only now touch the disk --------------------------------------------------------------------
for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} newly converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected conversion count");
