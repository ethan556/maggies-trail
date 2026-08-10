// Conversion Playbook Block 5 (A2 polynomial & rational) — opening conversion.
//
// pf-01-02/i2 (End Behavior, Tier C 25). Playbook section 6 says of the pf-01-* lessons: "end
// behavior is the outermost intervals of the chart they built." That is exactly this step. Its
// authored question is "as x grows huge and positive, what happens to f(x) = -2x^5?", answered by
// an mcq whose right option is "plunges toward -infinity". A sign chart makes the learner PRODUCE
// that answer: build the chart for -2x^5, and the far-right interval IS the end behaviour.
//
// A SCHEMA LIMIT HAD TO BE RAISED FIRST, and it is worth being precise about why. `signChart`
// capped root multiplicity at 3. f(x) = -2x^5 is a single root of multiplicity 5 at the origin, so
// the lesson could not be authored faithfully — using multiplicity 3 would have put x^3 on screen
// while the prose named x^5. Reading the consumers showed the cap is purely an authoring bound:
// `signChartSigns` flips on `mult % 2`, and the renderer picks its marker with `r.mult % 2 === 0`.
// Nothing anywhere reads the magnitude. Raised to 6 (the A2 curriculum's realistic range) with a
// regression suite (`signChart.multiplicity.s116.test.ts`) that pins the parity claim against real
// arithmetic — -2x^5 and 3x^4 evaluated at +/-1 — rather than against the implementation, so a
// future change that starts depending on magnitude fails loudly.
//
// Verified before authoring: the chart's truth ["+", "-"] agrees with f(-1) = +2 and f(1) = -2.
//
// The sign chart shows SIGN, not magnitude, so it answers "is the right end negative" rather than
// "does it dive without bound". The successFeedback closes that gap explicitly instead of letting
// the widget imply more than it shows.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/polynomial-functions/lessons";

const PLAN = {
  "pf-01-02": {
    step: "i2",
    expect: "mcq",
    predict: {
      prompt:
        "f(x) = -2x^5. The x^5 grows huge and positive on the right. What does the -2 do to that?",
      options: [
        { id: "flip", label: "Flips it negative — the right end falls" },
        { id: "shrink", label: "Shrinks it toward zero, so the end levels off" },
        { id: "nothing", label: "Nothing to the direction — only the steepness" },
      ],
      outcomeId: "flip",
      reveal:
        "It flips the sign. A negative leading coefficient turns a huge positive x^5 into a huge negative value, so the far-right end of the chart is negative \u2014 and because x^5 keeps growing without bound, so does the fall.",
    },
    widget: {
      type: "signChart",
      prompt:
        "Build the sign chart for f(x) = -2x^5, then read the far-right interval \u2014 that is its end behaviour.",
      roots: [{ x: 0, mult: 5 }],
      leadingPositive: false,
      successFeedback:
        "The far-right interval is negative: as x grows huge and positive, f(x) is negative \u2014 and since x^5 grows without bound, f(x) plunges toward -\u221e rather than settling anywhere. The left end is positive, because an ODD power crosses at the origin instead of bouncing off it.",
      crossFeedback:
        "The origin is a root of multiplicity 5 \u2014 odd, so the curve CROSSES there and the two sides must have opposite signs. Right now both ends agree, which would mean it touched and turned back.",
      bounceFeedback:
        "That flip would be right for an even multiplicity, where the curve bounces. Here the power is 5 \u2014 odd \u2014 so it crosses, and the sign genuinely changes.",
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
