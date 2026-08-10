// Conversion Playbook — radical functions (re-), the lessons reachable WITHOUT the Block 6 engine.
//
// Block 6's `extraneousRootLab` is not built (see the scope note in this log), but one lesson in
// the course does not need it. re-03-02/i1 asks for the domain of f(x) = sqrt(x + 6) and takes an
// mcq. A domain question about a square root IS a sign question about its radicand: the function
// is defined exactly where x + 6 is non-negative. `signChart` already produces that, so the
// learner builds the region rather than selecting an inequality.
//
// Verified before authoring: the chart's truth ["-", "+"] matches the radicand evaluated at -10
// (= -4) and 0 (= 6), and at the root itself x + 6 = 0, so sqrt(0) = 0 is defined - the boundary
// is INCLUDED, which is the difference between x >= -6 and x > -6 and the thing the mcq's
// distractors turn on. The success feedback names that explicitly, because a sign chart marks the
// root but does not by itself say which side owns it.
//
// re-03-02/i2 (the cube-root domain, all reals) is deliberately NOT converted: an odd root has no
// excluded region, so the chart would have nothing to divide and the integrity gate refuses it -
// correctly, since "there is no restriction" is not a sign chart, it is the absence of one.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/radical-functions/lessons";

const PLAN = {
  "re-03-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "f(x) = \u221a(x + 6). A square root refuses negative inputs. Which x survive that rule?",
      options: [
        { id: "ge", label: "Those making x + 6 zero or positive \u2014 so from \u22126 rightwards" },
        { id: "pos", label: "Only x itself positive \u2014 from 0 rightwards" },
        { id: "all", label: "All of them; the root handles negatives fine" },
      ],
      outcomeId: "ge",
      reveal:
        "The rule applies to what is UNDER the root, not to x. x + 6 is zero or positive from \u22126 rightwards, so that is the domain \u2014 and \u22126 itself is in it, because \u221a0 = 0 is perfectly defined.",
    },
    widget: {
      type: "signChart",
      prompt:
        "Build the sign chart for the RADICAND, x + 6. Where it is positive is where \u221a(x + 6) is defined.",
      roots: [{ x: -6, mult: 1 }],
      leadingPositive: true,
      successFeedback:
        "Negative to the left of \u22126, positive to the right \u2014 and that positive region is the domain. The boundary belongs to it too: at x = \u22126 the radicand is exactly 0, and \u221a0 = 0 is defined, which is why the answer is x \u2265 \u22126 and not x > \u22126.",
      crossFeedback:
        "x + 6 is a single linear factor, so it changes sign once, at \u22126. One side must be negative and the other positive \u2014 and only the positive side can sit under a square root.",
      bounceFeedback:
        "A sign that holds across the root would mean an even multiplicity. Here (x + 6) appears once, so the radicand really does change sign at \u22126.",
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
  if (step.variant) throw new Error(`${lesson}/${plan.step}: carries a variant tag`);

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
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict, radicand chart)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
