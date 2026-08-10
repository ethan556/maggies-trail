// Conversion Playbook Block 3 (G10 geometry) — a focused second authoring batch against the
// engines that are now ready: tc-01-02 (SSA ambiguity, zero enhancement), tc-05-02 (the hinge
// theorem via triangleSolve SAS, zero enhancement), rt-01-01 (Pythagorean via distanceGrid, zero
// enhancement — the engine's own doc says it was built for exactly this). Same discipline as
// every prior block: validate every spec against schema + integrity BEFORE writing ANY file,
// re-check body byte-equality after, abort before a partial batch can reach disk.

import { readFileSync, writeFileSync } from "node:fs";

const PLAN = {
  "triangle-congruence/lessons/tc-01-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "Two sides and a non-included angle (SSA) are given. Will they always lock ONE triangle?",
      options: [
        { id: "no", label: "No — the same givens can close into two different triangles" },
        { id: "yes", label: "Yes — any two sides and an angle pin the shape" },
        { id: "depends", label: "Only if you also know it's a right triangle" },
      ],
      outcomeId: "no",
      reveal:
        "No. Swing the free side from the given angle: it can meet the opposite ray at TWO different points, and both finish a legitimate triangle from the same three parts. SSA is the one combination that doesn't guarantee congruence — build both triangles and see them stand side by side.",
    },
    widget: {
      type: "triangleConstraintLab",
      prompt:
        "The givens are SSA. Test the angle, then use the second-triangle control — does the same set of parts really finish only one triangle?",
      targetCriterion: "SSA",
      startCriterion: "SSA",
      sideA: 5,
      sideB: 8,
      targetAngle: 35,
      angleStart: 35,
      angleStep: 5,
      requiredMoves: 3,
      successFeedback:
        "Two noncongruent triangles, both built from the same 5, 8, and 35° — that is what \"SSA fails\" means. Nothing was drawn wrong; the parts themselves don't pin down a unique shape.",
      criterionFeedback: "Keep the givens set to SSA — that is the combination in question.",
      angleFeedback: "Bring the angle back to 35° and reveal the second triangle from there.",
      evidenceFeedback: "Reveal the second triangle at least once before deciding — one glance isn't a test.",
    },
  },

  "triangle-congruence/lessons/tc-05-02": {
    step: "i3",
    expect: "dragOrder",
    predict: {
      prompt: "Two sides stay fixed and only the angle between them grows. Does the third side ALWAYS grow too?",
      options: [
        { id: "always", label: "Always — a bigger included angle means a bigger opposite side, no exceptions" },
        { id: "sometimes", label: "Sometimes — it depends on which two sides are fixed" },
        { id: "no", label: "No — the third side can shrink even as the angle grows" },
      ],
      outcomeId: "always",
      reveal:
        "Always. Drag the included angle open and watch the third side's length climb without ever turning back — a hinge swinging wider always pushes its far ends further apart. That one-way relationship is the whole hinge theorem.",
    },
    widget: {
      type: "triangleSolve",
      prompt:
        "Sides 5 and 8 are fixed. Open the included angle and watch the third side — does it ever shrink as the angle grows?",
      mode: "sas",
      a: 5,
      b: 8,
      target: 8,
      start: 30,
      successFeedback:
        "At 75° the third side reaches 8 — right between its length at 30° (about 4.4) and at 120° (about 11.4). Every larger angle gave a larger side, in that order, with no exceptions: that monotonic climb IS the hinge theorem.",
      lowFeedback: "Still short of 8 — open the angle further and watch the third side keep climbing, never falling back.",
      highFeedback: "Past 8 now — ease the angle back and watch the third side shrink, but only because the angle did.",
    },
  },

  "right-triangles-trig/lessons/rt-01-01": {
    step: "i1",
    expect: "mcq",
    widget: {
      type: "distanceGrid",
      prompt: "Move the point so the legs are 3 across and 4 up, and read the straight-line distance back to the corner.",
      anchor: [0, 0],
      targetPoint: [4, 3],
      gridMin: 0,
      gridMax: 8,
      startX: 0,
      startY: 0,
      successFeedback:
        "Across 4, up 3, distance 5 — and 4² + 3² is 16 + 9 = 25 = 5². The distance formula you just used and the Pythagorean theorem are the same computation: the two legs squared, added, and rooted.",
      wrongPointFeedback: "Not at (4, 3) yet. Watch the two legs forming as you drag — those are exactly the two lengths the theorem squares.",
    },
  },
};

// ---- validate everything BEFORE writing anything ----------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
for (const [key, plan] of Object.entries(PLAN)) {
  const path = `content/courses/${key}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${key}: step ${plan.step} not found`);
  if (step.widget?.type !== plan.expect)
    throw new Error(`${key}/${plan.step}: expected widget ${plan.expect}, found ${step.widget?.type}`);
  if ("predict" in plan && step.predict)
    throw new Error(`${key}/${plan.step}: already has a predict — refusing to overwrite authored content`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
  if (errs.length) throw new Error(`${key}: integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  step.widget = plan.widget;
  if ("predict" in plan) {
    const rebuilt = {};
    for (const k of Object.keys(step)) {
      if (k === "widget") rebuilt.predict = plan.predict;
      rebuilt[k] = step[k];
    }
    if (!("predict" in rebuilt)) rebuilt.predict = plan.predict;
    for (const k of Object.keys(step)) delete step[k];
    Object.assign(step, rebuilt);
  }
  if (step.body !== bodyBefore) throw new Error(`${key}: body changed — aborting`);
  staged.push([path, doc, key, plan]);
}

// ---- only now touch the disk -------------------------------------------------------------------
for (const [path, doc, key, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${key}/${plan.step}: ${plan.expect} -> ${plan.widget.type}${"predict" in plan ? " (+predict)" : ""}`);
}
console.log(`\n${staged.length} lessons converted (expected 3)`);
if (staged.length !== 3) throw new Error("unexpected conversion count");
