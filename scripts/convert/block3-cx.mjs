// Conversion Playbook Block 3 (G10 geometry) — part 2: coordinate proofs (cx-).
//
// The playbook calls this course "zero enhancement, every lesson maps directly" — reading the
// full arc of every remaining lesson (every widget step, not just i1) shows that is only true for
// a minority. `coordinateProofLab` is a 3-fixed-vertices-plus-one-dragged-4th CONSTRUCTION tool;
// `distanceGrid` is a one-fixed-anchor drag-to-a-point tool; `quadDrag` is a 3-fixed-plus-1-dragged
// tool with a LIVE NAME classifier. Most of cx-'s remaining content (side/area/perimeter formulas
// on an already-fixed figure, triangle classification, ratio-partition, circle algebra) is not a
// construction task at all, and forcing it into any of the three would misrepresent what the step
// asks. Five lessons ARE genuine fits; the rest are honest residue, each with its reason recorded
// in CONVERSION_LOG.md.
//
// FIVE LESSONS, THREE HISTORIES:
//   cx-02-02 — LEFT ALONE. Its `ch` step already carries `coordinateProofLab`, pre-dating this
//     block; i1 tests a genuinely different concept (collinearity via a shared point) that no
//     lab here models. No predict added either: a corpus-wide check found zero precedent for a
//     `predict` block on a `kind: "challenge"` step — that slot is the capstone application, not
//     a lab intro, and inventing a first exception here would be new scope, not a fix. Recorded
//     for completeness; there is nothing for this script to DO to it, so no PLAN entry exists.
//   cx-05-01, cx-05-02 — ALREADY APPLIED (their `distanceGrid` conversions ran earlier in this
//     block and are confirmed live on disk with authored predicts). Kept here as the historical
//     record of what ran; NOT re-executed — the apply loop below skips a lesson whose target step
//     already carries the exact predict this file specifies, rather than treating a second run as
//     an error. That is what makes this script safely re-runnable against a partially-converted
//     tree, which matters now that the batch spans more than one session.
//   cx-01-02, cx-03-02 — NEW this pass. cx-01-02 (midpoint) is a two-point, one-dragged-point
//     task with no quadrilateral in it: `distanceGrid` (anchor A, target the midpoint M) matches
//     its actual content. cx-03-02 (rhombus vs. square) IS a quadrilateral-drag question with a
//     live classifier already built for exactly this discrimination: `quadDrag`, not
//     `coordinateProofLab` — there is no 4th-vertex CLAIM to build toward, the shape already names
//     itself the instant the diagonals equalize.
//
// Validate-all-then-write: every spec is parsed and integrity-checked BEFORE any file is written.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/coordinate-proofs/lessons";

/** lesson id -> { step, expect: old widget type, widget, predict } */
const PLAN = {
  // ---- already applied earlier this block; kept as history, see the skip-if-done guard below ----
  "cx-05-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A circle centred at (3, 4) is tangent to the x-axis. Which point on the axis is the circle actually touching?",
      options: [
        { id: "below", label: "(3, 0) — straight down from the centre" },
        { id: "origin", label: "(0, 0) — the origin" },
        { id: "either", label: "Any point on the axis within reach of the radius" },
      ],
      outcomeId: "below",
      reveal:
        "(3, 0). Tangency means the circle touches the line at exactly one point, and that point is where the PERPENDICULAR from the centre lands \u2014 straight down, since the x-axis is horizontal. Drag to it and read the radius off the distance.",
    },
    widget: {
      type: "distanceGrid",
      prompt:
        "The circle is tangent to the x-axis. Drag the point to where the circle actually touches the axis, and read its radius off the distance from the centre.",
      anchor: [3, 4],
      targetPoint: [3, 0],
      gridMin: 0,
      gridMax: 8,
      startX: 0,
      startY: 0,
      successFeedback:
        "Straight down 4, across 0 \u2014 distance \u221a(0\u00b2 + 4\u00b2) = 4. Tangency to an axis is a vertical reach: the radius is exactly the centre's distance to that axis, no more arithmetic needed.",
      wrongPointFeedback:
        "Not the point of tangency yet \u2014 that point sits directly below the centre, where the perpendicular from (3, 4) meets the x-axis.",
    },
  },

  "cx-05-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "A cell tower at the origin covers a disk of radius 20. A house sits at (12, 16) \u2014 exactly a scaled 3\u20134\u20135 triangle away. Inside, outside, or exactly on the edge?",
      options: [
        { id: "edge", label: "Exactly on the edge — no margin either way" },
        { id: "inside", label: "Comfortably inside" },
        { id: "outside", label: "Just outside" },
      ],
      outcomeId: "edge",
      reveal:
        "Exactly on the edge. 12\u00b2 + 16\u00b2 = 400 = 20\u00b2, so the distance from the tower to the house equals the radius exactly \u2014 zero margin. Drag to the house and watch the readout land precisely on 20.",
    },
    widget: {
      type: "distanceGrid",
      prompt:
        "Drag the point to the house at (12, 16) and read its distance from the tower at the origin \u2014 then compare that to the coverage radius of 20.",
      anchor: [0, 0],
      targetPoint: [12, 16],
      gridMin: 0,
      gridMax: 16,
      startX: 4,
      startY: 4,
      successFeedback:
        "\u221a(12\u00b2 + 16\u00b2) = \u221a400 = 20 \u2014 exactly the coverage radius. 144 + 256 lands precisely on 400: the house sits on the boundary, covered with zero margin.",
      wrongPointFeedback:
        "Not the house yet. Keep dragging toward (12, 16) and watch the distance readout climb toward the radius, 20.",
    },
  },

  // ---- new this pass -------------------------------------------------------------------------
  "cx-01-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "A(1, 2), B(7, 10) — distance 10 apart. Drag toward the midpoint: how far will it sit from A?",
      options: [
        { id: "half", label: "5 — exactly half of AB" },
        { id: "avg", label: "Something else — averaging coordinates doesn't average the distance" },
        { id: "depends", label: "It depends on which coordinate moved more" },
      ],
      outcomeId: "half",
      reveal:
        "5 \u2014 half of 10. Averaging both coordinates finds the point exactly halfway ALONG the segment, which is exactly half the distance from either end. Drag to it and read the live distance off the legs.",
    },
    widget: {
      type: "distanceGrid",
      prompt: "Drag the point to the midpoint of A(1, 2) and B(7, 10), and read its distance from A.",
      anchor: [1, 2],
      targetPoint: [4, 6],
      gridMin: 0,
      gridMax: 10,
      startX: 1,
      startY: 2,
      successFeedback:
        "Distance from A: 5 \u2014 exactly half of AB's 10. The point that averages both coordinates is the point exactly halfway along the segment, which is why the distance halves too.",
      wrongPointFeedback:
        "Not the midpoint yet \u2014 a point can be exactly halfway in x or in y without being halfway along the SEGMENT. Average both coordinates together: ((1+7)/2, (2+10)/2).",
    },
  },

};

// ---- validate everything BEFORE writing anything ----------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);

  // Idempotency: if this exact predict is already in place, this lesson was already converted by
  // an earlier run of this same file — skip it silently rather than treating a second run as an
  // error. Anything else unexpected (right predict, wrong widget; or vice versa) still throws.
  if (step.predict && step.predict.prompt === plan.predict.prompt && step.widget?.type === plan.widget.type) {
    skipped.push(lesson);
    continue;
  }

  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected widget ${plan.expect}, found ${step.widget?.type}`);
  if (plan.predict && step.predict)
    throw new Error(`${lesson}/${plan.step}: already has a DIFFERENT predict — refusing to overwrite authored content`);

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
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} lessons newly converted, ${skipped.length} already done (of ${Object.keys(PLAN).length} planned)`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected conversion count");
