// Conversion Playbook Block 5 — rf- (rational functions), second conversion against enhancement (k).
//
// rf-01-02/i2 (Simplify by Factoring, Tier B 26) is the lesson enhancement (k) was built for, and
// the only step in the corpus that exercises all three of its features at once:
// (x^2 + 5x + 6)/(x^2 - 4) factors to (x + 3)/(x - 2) with a HOLE at x = -2 — a root, a pole and a
// removable discontinuity in one chart.
//
// The playbook's line for this lesson is "the hole survives the cancellation, visibly", and that is
// precisely what the chart shows and prose cannot: the hole at -2 sits INSIDE the middle interval,
// splitting nothing and flipping nothing, while the pole at 2 splits the line and flips the sign
// with no crossing. Those two behaviours look identical in the algebra — both are values excluded
// from the domain — and completely different on the chart. That distinction IS the lesson.
//
// Verified against the real function before authoring, not just against the engine:
//   f(-10)  = +0.583   -> "+"   (left of the root)
//   f(-2.5) = -0.111   -> "-"   (middle interval, LEFT of the hole)
//   f(0)    = -1.500   -> "-"   (middle interval, RIGHT of the hole — same sign, as it must be)
//   f(10)   = +1.625   -> "+"   (right of the pole)
// The two samples bracketing the hole agree, which is the computational statement of "a removable
// discontinuity punches out one point and changes nothing else".
//
// WHAT THIS STEP NOW ASKS, stated plainly because it is a change of task. The authored step asked
// the learner to simplify and pick the result from four options. The chart pre-places the factored
// structure — it must, since roots and poles come from the spec — so the step now asks for the
// SIGNS rather than the factorisation, with the factored form given in the prompt. That is a real
// trade: the factoring procedure is no longer tested HERE. It remains tested at k1, k2 and ch1,
// which carry live variant generators and were left untouched. What the step gains is the thing
// the mcq could not do at all — showing that the cancelled factor leaves a visible scar.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/rational-functions/lessons";

const PLAN = {
  "rf-01-02": {
    step: "i2",
    expect: "mcq",
    predict: {
      prompt:
        "(x\u00b2 + 5x + 6)/(x\u00b2 \u2212 4) cancels to (x + 3)/(x \u2212 2). The cancelled (x + 2) is gone from the formula \u2014 is it gone from the GRAPH?",
      options: [
        { id: "hole", label: "No \u2014 x = \u22122 is still excluded, leaving a hole in an otherwise unbroken curve" },
        { id: "gone", label: "Yes \u2014 once it cancels it stops affecting the function at all" },
        { id: "asymptote", label: "No \u2014 it leaves a vertical asymptote, just like x = 2 does" },
      ],
      outcomeId: "hole",
      reveal:
        "A hole, not an asymptote. Cancelling changes the FORMULA, never the domain \u2014 x = \u22122 was excluded before and stays excluded. But nothing blows up there: the curve carries on either side at the same sign, with a single point punched out.",
    },
    widget: {
      type: "signChart",
      prompt:
        "(x\u00b2 + 5x + 6)/(x\u00b2 \u2212 4) factors to (x + 3)/(x \u2212 2), with a hole left behind at x = \u22122. Mark the sign on each interval.",
      roots: [{ x: -3, mult: 1 }],
      poles: [{ x: 2, mult: 1 }],
      holes: [-2],
      leadingPositive: true,
      successFeedback:
        "Positive, negative, positive. Look at what the hole did to the signs: nothing. \u22122 sits inside the middle interval, and the function is negative on BOTH sides of it \u2014 the point is missing, but the sign carries straight through. The pole at 2 is the opposite: no point there either, yet the sign flips across it. That is the whole difference between a factor that cancels and one that does not.",
      crossFeedback:
        "One of the crossings is wrong. Both \u22123 and 2 are odd \u2014 a simple root and a simple pole \u2014 so the sign must change across each of them. The hole at \u22122 is not a crossing and must not change anything.",
      bounceFeedback:
        "That pattern treats one of the cuts as a bounce. Neither is: the root at \u22123 and the pole at 2 are both simple, so each flips the sign.",
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
