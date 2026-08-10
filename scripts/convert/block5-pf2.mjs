// Conversion Playbook Block 5 — enhancement (j) applied to the two lessons it was named for.
//
// The playbook pairs pf-02-03 and pf-03-03 under (j): "a draggable probe showing P(x) at the
// probe... slide the probe onto a root and the remainder hits zero — the Factor Theorem as a
// collision." pf-02-03 was converted when (j) was built; these are the remaining fits.
//
// pf-03-03/i1 asks "for f(x) = x^3 - 4x^2 + x + 6, test the candidate x = 2: what is f(2)?" and
// takes a number. That is the Remainder Theorem stated as arithmetic. With the probe it becomes an
// observation: slide to 2, the readout lands on 0, and the lesson's own factorisation
// (x - 2)(x - 3)(x + 1) is the reason. pf-02-01/i2 is the same shape one lesson earlier - f(2) for
// (x - 2)(x + 3)(x - 5), where the answer is zero precisely because (x - 2) is one of the factors.
//
// Both are MONIC, which `probeX` requires and documents: a sign chart fixes the polynomial only up
// to a positive constant, so the readout is the monic product. Verified before authoring rather
// than assumed - (x - 2)(x - 3)(x + 1) expands to exactly x^3 - 4x^2 + x + 6, the probe readout
// equals the real polynomial at six sample points for each lesson, and both charts' signs agree
// with the functions evaluated inside every interval.
//
// NOT converted, with reasons:
//   - pf-05-02 (Turning Points & Degree, C 22) needs the playbook's OTHER pf- idea: roots as
//     draggable inputs, so merging two roots turns a crossing into a bounce and a turning point
//     visibly disappears. `signChart` roots are authored, not dragged; that is a distinct
//     enhancement (live root positions, and a turning-point count derived from them), not a flag.
//   - pf-03-01/03-02 (long and synthetic division) are legitimately procedural, exactly as the
//     playbook says; their `buildExpression` formalization is the right engine for them.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/polynomial-functions/lessons";

const PLAN = {
  "pf-03-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "f(x) = x\u00b3 \u2212 4x\u00b2 + x + 6 factors as (x \u2212 2)(x \u2212 3)(x + 1). Before computing \u2014 what will f(2) be?",
      options: [
        { id: "zero", label: "Exactly 0 \u2014 the factor (x \u2212 2) becomes zero, and zero times anything is zero" },
        { id: "two", label: "2 \u2014 you substitute the 2 back in" },
        { id: "cant", label: "You cannot tell without multiplying it all out" },
      ],
      outcomeId: "zero",
      reveal:
        "Exactly 0. One factor of the product becomes (2 \u2212 2) = 0, so the whole product collapses to zero no matter what the other factors are. That is the Factor Theorem read backwards \u2014 and dividing by (x \u2212 2) would leave remainder 0 for the same reason.",
    },
    widget: {
      type: "signChart",
      prompt:
        "Build the sign chart for f(x) = x\u00b3 \u2212 4x\u00b2 + x + 6, then slide the probe onto x = 2 and read the value.",
      roots: [{ x: -1, mult: 1 }, { x: 2, mult: 1 }, { x: 3, mult: 1 }],
      leadingPositive: true,
      probeX: true,
      successFeedback:
        "Slide the probe to 2 and the readout is exactly 0 \u2014 and the same at \u22121 and 3. Those are the three roots, and each one is where a factor of (x \u2212 2)(x \u2212 3)(x + 1) collapses. Dividing by (x \u2212 2) leaves remainder 0 for the same reason: the remainder IS f(2).",
      crossFeedback:
        "All three roots are simple, so the curve crosses at each one and the sign changes every time. Slide the probe across a root and watch the readout pass through zero as the sign turns over.",
      bounceFeedback:
        "A sign that holds across a root means an even multiplicity \u2014 a bounce. Every factor here appears once, so all three are crossings.",
    },
  },

  "pf-02-01": {
    step: "i2",
    expect: "numeric",
    predict: {
      prompt: "For f(x) = (x \u2212 2)(x + 3)(x \u2212 5), what is f(2) \u2014 without multiplying anything out?",
      options: [
        { id: "zero", label: "0 \u2014 the first factor becomes zero, so the whole product does" },
        { id: "compute", label: "Something non-zero; you have to expand and substitute" },
        { id: "neg", label: "\u221221 \u2014 the other two factors multiplied together" },
      ],
      outcomeId: "zero",
      reveal:
        "0. A product is zero as soon as ANY factor is zero, and (2 \u2212 2) = 0. That is why the zeros can be read straight off factored form \u2014 no expansion, no substitution arithmetic.",
    },
    widget: {
      type: "signChart",
      prompt:
        "Build the sign chart for f(x) = (x \u2212 2)(x + 3)(x \u2212 5), then park the probe on x = 2.",
      roots: [{ x: -3, mult: 1 }, { x: 2, mult: 1 }, { x: 5, mult: 1 }],
      leadingPositive: true,
      probeX: true,
      successFeedback:
        "P(2) = 0, and so are P(\u22123) and P(5). Factored form hands you the zeros directly: each factor switches off at its own value, and switching off ONE is enough to zero the whole product. That is why the sign flips at each of them too.",
      crossFeedback:
        "Each factor appears once, so the sign changes at all three zeros. Drag the probe across one and watch the readout cross zero exactly where the sign turns.",
      bounceFeedback:
        "A sign holding across a zero would mean a repeated factor. Here every factor appears once, so each is a genuine crossing.",
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
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> signChart with probeX (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
