// Conversion Playbook Block 5 — rf-01-03, unblocked by relaxing signChart's root floor.
//
// The lesson is the "-1 trick": (4 - x) is -(x - 4), so (4 - x)/(x^2 - 16) cancels to -1/(x + 4)
// with a HOLE left behind at x = 4. Its i2 step asks for that simplification and takes an mcq.
//
// A schema floor had to move first. `roots` required `.min(1)`, but the simplified function has NO
// zero at all — only a pole at -4 and a hole at 4 — so the entire class of rootless rational
// functions was unauthorable. Relaxed to `.min(0)`, with the integrity gate now demanding at least
// one CUT (root or pole) instead of at least one root. A polynomial spec has no poles, so it still
// needs a root exactly as before; nothing that used to be valid changed.
//
// Verified against the real function before authoring: (4 - x)/(x^2 - 16) is positive at x = -10
// and negative at x = 0, giving ["+", "-"], which is what the parity walk over a single odd pole
// produces with `leadingPositive: false` (as x grows, -1/(x + 4) approaches 0 from below). At the
// hole, x = 4, the original expression is genuinely NaN.
//
// The hole is the whole point of this lesson and is authored here, unlike rf-01-01: the cancelled
// factor does not vanish, it leaves a puncture, and the chart shows the puncture sitting on an
// otherwise unbroken piece of curve.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/rational-functions/lessons";

const PLAN = {
  "rf-01-03": {
    step: "i2",
    expect: "mcq",
    predict: {
      prompt:
        "(4 \u2212 x)/(x\u00b2 \u2212 16) cancels down to \u22121/(x + 4). What happened to x = 4, which used to break the original?",
      options: [
        { id: "hole", label: "It is still excluded \u2014 the cancelling leaves a hole there" },
        { id: "fine", label: "It is fine now; the cancellation repaired it" },
        { id: "pole", label: "It became a vertical asymptote" },
      ],
      outcomeId: "hole",
      reveal:
        "Still excluded. Cancelling changes how the expression LOOKS, never which inputs it was allowed to take \u2014 the original was undefined at x = 4 and so is the simplified form, with a single point punched out. That puncture is a hole, not an asymptote: the curve carries on either side of it.",
    },
    widget: {
      type: "signChart",
      prompt:
        "Build the sign chart for (4 \u2212 x)/(x\u00b2 \u2212 16), which simplifies to \u22121/(x + 4). The dashed line is the asymptote; the hollow point is the hole.",
      roots: [],
      poles: [{ x: -4, mult: 1 }],
      holes: [4],
      leadingPositive: false,
      successFeedback:
        "Positive left of \u22124, negative right of it \u2014 and nothing happens at the hole. That is the difference the lesson turns on: the pole at \u22124 is where the function runs away, the hole at 4 is where it simply skips a single point. Both are excluded values; only one changes the shape.",
      crossFeedback:
        "The pole at \u22124 has odd order, so the sign changes across it. Nothing changes at the hole \u2014 a puncture does not flip anything.",
      bounceFeedback:
        "A sign that holds across a cut belongs to an even multiplicity. Here (x + 4) appears once, so the sign really does change.",
    },
  },

  // rf-05-01/i2 — the extraneous root, made visible. The playbook's note for this lesson is that
  // "the extraneous candidate lands exactly on a pole", and that is literally what the chart shows:
  // solving reduces to (x - 7)/(x - 4), so x = 7 sits ON the axis (f(7) = 0, a genuine solution)
  // while x = 4 sits where the function does not exist (f(4) is infinite). One candidate is a
  // zero; the other is a gap the LCD multiplication minted. Verified before authoring: the chart's
  // ["+", "-", "+"] matches f evaluated at 0, 5 and 10.
  "rf-05-01": {
    step: "i2",
    expect: "mcq",
    predict: {
      prompt:
        "Clearing the LCD gave candidates x = 4 and x = 7, from an equation whose denominator was (x − 4). Before checking either — can BOTH be solutions?",
      options: [
        { id: "one", label: "No — x = 4 was never allowed, because it zeroes the denominator" },
        { id: "both", label: "Yes — both came out of correct algebra, so both count" },
        { id: "neither", label: "No — multiplying by the LCD invalidates every candidate" },
      ],
      outcomeId: "one",
      reveal:
        "Only one. x = 4 was banned before the algebra started — it makes the original denominator zero, so it was never in the domain. Multiplying by the LCD quietly removed that restriction and minted a candidate the original equation cannot accept.",
    },
    widget: {
      type: "signChart",
      prompt:
        "The solving reduces to (x − 7)/(x − 4). Build its sign chart — then look at where each candidate sits.",
      roots: [{ x: 7, mult: 1 }],
      poles: [{ x: 4, mult: 1 }],
      leadingPositive: true,
      successFeedback:
        "There is the verdict, drawn rather than recalled: x = 7 sits ON the axis — the function is genuinely zero there, so it solves the equation. x = 4 is the dashed line, where the function does not exist at all. A solution has to be a point on the curve, and only one of the two candidates is.",
      crossFeedback:
        "Both cuts are odd, so the sign changes at each — at the zero (x = 7) because the curve passes through the axis, and at the pole (x = 4) because it swaps sides of the asymptote without ever touching it.",
      bounceFeedback:
        "A sign holding across a cut means an even multiplicity. Both (x − 7) and (x − 4) appear once here, so the sign changes at both.",
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
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict, rootless: pole + hole)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
