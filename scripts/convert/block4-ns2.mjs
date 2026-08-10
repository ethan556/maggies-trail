// Conversion Playbook Block 4 (G6 Number System) — second batch.
//
// ns-04-03 (The Four Quadrants, Tier C 23) — playbook §5 names `plotPoint` for this lesson and it
// fits, though not in the way the one-line description implies. `plotPoint` is a LABELLED GRID with
// 1-based cells, not a signed coordinate plane: `targets` must be positive integers. What makes it
// faithful here is `xLabels`/`yLabels` — a 7×7 grid labelled −3…3 on both axes, so cell (7, 2) is
// genuinely the point (3, −2), axes included at 0. Verified before authoring: the label lookup was
// confirmed against the parsed spec, and the target grades correct while each quadrant confusion
// grades wrong with its own message.
//
// The authored step asks learners to NAME the quadrant of (3, −2). The lab asks them to PLACE it
// and then read what quadrant it landed in — the same fact, arrived at causally rather than
// recalled. The three `pointErrors` are the three wrong quadrants, each diagnosing the specific
// sign error that lands there, which an mcq distractor list cannot do (an mcq can say "Quadrant I
// is wrong"; the grid can say "you put y ABOVE the axis, but −2 is below it").
//
// NOT CONVERTED, and the reason matters more than the conversion:
//   - **ns-03-03 (Factoring with the Distributive Property, Tier C 22)** — §5 proposes `areaModel`
//     ("factoring as un-tiling a rectangle"). The engine grades on `targetArea` alone, so for
//     8 + 12 = 20 it accepts 1×20, 2×10 AND 4×5 as correct. The lesson's entire point is pulling
//     out the GREATEST common factor — the one arrangement the engine cannot demand. This is the
//     same class of gap the schema's own `square` flag was added to close for a different lesson
//     ("ungated, areaModel accepts 4×9 and the learner never finds the side the lesson asks for").
//     A `requireFactors`-style gate would fix it; without one, converting would mark a
//     non-GCF factoring correct and actively teach against the lesson.
//   - **ns-01-02 (Flip and Multiply, Tier C 22)** — its free steps are "what is the reciprocal of
//     3/8" and a fraction computation. §5's proposal is a two-track hop where the ÷(a/b) and ×(b/a)
//     tracks land identically, but `numberLineHop` is integer-only (established in the previous
//     batch), so neither track is representable. `fractionBar` remains the honest candidate.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/number-system/lessons";
const L = ["-3", "-2", "-1", "0", "1", "2", "3"];

const PLAN = {
  "ns-04-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "The point (3, -2) has a positive x and a negative y. Before plotting it — which way from the origin does that put it?",
      options: [
        { id: "rightdown", label: "Right and DOWN — positive x moves right, negative y moves down" },
        { id: "rightup", label: "Right and up — the signs both describe distance, not direction" },
        { id: "leftdown", label: "Left and down — a negative anywhere sends it left" },
      ],
      outcomeId: "rightdown",
      reveal:
        "Right and down. Each coordinate controls its own axis independently: the x tells you how far across, its sign which side; the y how far up or down, its sign which side. Place it and read the quadrant off where it lands.",
    },
    widget: {
      type: "plotPoint",
      prompt: "Plot the point (3, -2) on the grid, then read which quadrant it landed in.",
      cols: 7,
      rows: 7,
      xLabels: L,
      yLabels: L,
      targets: [{ x: 7, y: 2 }],
      pointErrors: [
        {
          x: 7,
          y: 6,
          feedback:
            "That is (3, 2) — Quadrant I. The x is right, but you put the y ABOVE the axis; -2 sits below it.",
        },
        {
          x: 1,
          y: 2,
          feedback:
            "That is (-3, -2) — Quadrant III. The y is correct, but you moved LEFT; a positive x goes right.",
        },
        {
          x: 1,
          y: 6,
          feedback:
            "That is (-3, 2) — Quadrant II. Both signs are flipped: 3 goes right, and -2 goes down.",
        },
      ],
      missFeedback:
        "Not there yet. Count across to 3 first — positive, so to the right of 0 — then down to -2, below the axis.",
      successFeedback:
        "Quadrant IV — right of the vertical axis and below the horizontal one. That is what a positive x with a negative y always means, and it is why the quadrant can be read off the pair of SIGNS without plotting at all once you trust the pattern.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);

  if (step.widget?.type === plan.widget.type) { skipped.push(lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.predict) throw new Error(`${lesson}/${plan.step}: already has a predict`);
  if (step.variant)
    throw new Error(`${lesson}/${plan.step}: carries a variant tag — converting would break its surface contract`);

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
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
