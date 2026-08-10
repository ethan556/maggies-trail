// Domain-as-radicand-sign-chart, applied a second time.
//
// ft-01-02/i1 (Domain: the Allowed Inputs, Tier D 24) asks for the smallest allowed x in
// y = sqrt(x - 3) and takes a number. This is the same shape as re-03-02, already converted and
// gated: a domain question about a square root IS a sign question about its radicand, and the
// function is defined exactly where x - 3 is non-negative. The learner builds that region rather
// than recalling an inequality.
//
// Verified before authoring: the chart's ["-", "+"] matches the radicand at 0 (= -3) and 5 (= 2),
// and at the root x - 3 = 0, so sqrt(0) = 0 is defined. The boundary being INCLUDED is precisely
// the lesson's answer - the smallest allowed x is 3 itself, not the first value past it - and a
// sign chart marks the root without saying which side owns it, so the success feedback says so.
//
// Its own predict is preserved byte-for-byte; the step already asked "which inputs must be
// banned?", which is the commitment this lab now resolves.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/function-transformations/lessons";

const PLAN = {
  "ft-01-02": {
    step: "i1",
    expect: "numeric",
    widget: {
      type: "signChart",
      prompt:
        "Build the sign chart for the RADICAND, x \u2212 3. Where it is positive is where \u221a(x \u2212 3) is defined.",
      roots: [{ x: 3, mult: 1 }],
      leadingPositive: true,
      successFeedback:
        "Negative to the left of 3, positive to the right \u2014 and the smallest allowed x is 3 ITSELF, not the first value past it. At x = 3 the radicand is exactly 0, and \u221a0 = 0 is perfectly defined, so the boundary belongs to the domain.",
      crossFeedback:
        "x \u2212 3 is a single linear factor, so it changes sign once, at 3. One side must be negative and the other positive \u2014 and only the positive side can sit under a square root.",
      bounceFeedback:
        "A sign that holds across the root would mean an even multiplicity. Here (x \u2212 3) appears once, so the radicand really does change sign at 3.",
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
  if (step.variant) throw new Error(`${lesson}/${plan.step}: carries a variant tag`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${lesson}: integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  const predictBefore = JSON.stringify(step.predict ?? null);
  step.widget = plan.widget;
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(step.predict ?? null) !== predictBefore)
    throw new Error(`${lesson}: authored predict changed — aborting`);
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (authored predict preserved)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
