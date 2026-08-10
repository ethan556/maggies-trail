// S117 Wave C — two more mandated lab-step additions, each measured against the engine's ACTUAL
// shape rather than the playbook's one-line description. Same `i1b` pattern: insert after `i1`,
// carry the lesson's conceptTag, add a predict, touch no existing step.
//
// sg-04-01 (Adding Solids). The playbook asks for "one lab step slicing the composite", but
//   `solidSliceLab.solid` is an enum of FOUR primitives -- there is no composite solid, and
//   inventing one would be engine work. What the lesson actually turns on is narrower and IS
//   representable: its i1 asks why the hemisphere and cylinder must share a radius for clean
//   addition. Slice the SPHERE against the constant-area prism and the answer appears as a
//   measurement: a sphere's sections vary with height and equal pi*r^2 at exactly one place, its
//   equator. That equator is the join. Verified arithmetic: at radius 5, the equatorial section is
//   pi*25 = 78.5398163397; targetFraction 0.5 is the equator of a sphere of height 2r = 10.
//
// rf-02-02 (Dividing Rational Expressions). (x + 2)/5 / ((x - 1)/10) = 2(x + 2)/(x - 1). The
//   restriction x != 1 arrives from the DIVISOR, not from any denominator visible in the original
//   numerator -- which is the whole content of "restriction tracking" one lesson early. Charted as
//   root -2, pole 1. Signs verified against the real function: x=-3 -> 2(-1)/(-4) > 0;
//   x=0 -> 2(2)/(-1) < 0; x=2 -> 2(4)/(1) > 0, so ["+","-","+"] with leadingPositive true.
//
// Measured and DECLINED, with reasons (ledgered in KNOWN_ISSUES):
//   sg-04-02/04-03 -- the tube's cross-section is an ANNULUS (pi*R^2 - pi*r^2, the very quantity
//     the lesson contrasts with pi*(R-r)^2). No solid in the enum has a ring section, so the lab
//     could not show the shape whose area the lesson is about.
//   sg-05-02/05-03 -- density and cost-per-unit are ratios over a whole solid, not facts about a
//     cross-section; a sweep would show a quantity the lesson never asks about.
//   rf-03-01/03-02/03-03 -- the sums reduce to numerators with non-integer roots (-7/2, -3/5) and
//     `signChart.roots.x` is integer-typed, so the chart cannot place the zero it would need to.
//   rf-02-03 -- its exclusion at x = 3 is a sign-CHANGING zero of the reduced function, which is
//     neither a pole (the curve reaches it) nor a hole (the sign is untouched there); authoring it
//     as either ships a chart that is false about the function.

import { readFileSync, writeFileSync } from "node:fs";

const PLAN = [
  {
    path: "content/courses/solid-geometry/lessons/sg-04-01.json",
    lesson: "sg-04-01",
    after: "i1",
    step: {
      id: "i1b",
      kind: "interactive",
      body: "Find the join by measuring it.",
      conceptTag: "sg-add-solids",
      widget: {
        type: "solidSliceLab",
        prompt:
          "Sweep a section through the sphere, with a constant-area prism beside it for reference. Test several heights, then stop where the sphere's section matches the prism's \u2014 that height is where a hemisphere can be joined cleanly.",
        solid: "sphere",
        radius: 5,
        height: 10,
        baseArea: 78.5398163397,
        targetFraction: 0.5,
        startFraction: 0.1,
        fractionStep: 0.1,
        tolerance: 0.01,
        comparisonRequired: true,
        requiredMoves: 5,
        successFeedback:
          "Only at the equator does the sphere's section reach \u03c0r\u00b2 \u2014 everywhere else it is smaller. That is exactly why the cylinder's radius must equal the hemisphere's: the join is a shared circle, and the hemisphere's widest circle is the only one that can match a cylinder's constant section. Mismatch the radii and the two solids meet along a step, not a surface, and the volumes stop simply adding.",
        positionFeedback:
          "Keep sweeping, then settle at the height where the two section areas agree. On a sphere that happens at one height only.",
        comparisonFeedback:
          "Bring in the constant-area prism. \u201cSame radius at the join\u201d is a COMPARISON, so both sections have to be on screen to be compared.",
        invariantFeedback:
          "Move the plane through several heights first. The point is that the sphere's section keeps changing while the prism's does not \u2014 one snapshot cannot show that.",
      },
      predict: {
        prompt:
          "A hemisphere of radius 5 sits on a cylinder. Across how many heights does the sphere's horizontal section have area \u03c0\u00b75\u00b2?",
        options: [
          { id: "one", label: "One \u2014 the equator, and nowhere else" },
          { id: "all", label: "Every height \u2014 the radius is 5 throughout" },
          { id: "none", label: "None \u2014 a curved surface never gives a flat circle" },
        ],
        outcomeId: "one",
        reveal:
          "A sphere's sections are circles that shrink as you move away from the equator, so \u03c0\u00b75\u00b2 is reached exactly once. The equator is therefore the only circle a cylinder of radius 5 can be joined to \u2014 which is why the two radii must match.",
      },
    },
  },
  {
    path: "content/courses/rational-functions/lessons/rf-02-02.json",
    lesson: "rf-02-02",
    after: "i1",
    step: {
      id: "i1b",
      kind: "interactive",
      body: "Chart what the division left behind.",
      conceptTag: "rf-divide",
      widget: {
        type: "signChart",
        prompt:
          "The quotient reduces to 2(x + 2)/(x \u2212 1). Mark each interval's sign \u2014 and notice which x the chart has to exclude.",
        roots: [{ x: -2, mult: 1 }],
        poles: [{ x: 1, mult: 1 }],
        leadingPositive: true,
        successFeedback:
          "Positive, negative, positive \u2014 with a root at \u22122 and a wall at 1. Trace where that wall came from: nothing in the original numerator forbids x = 1. It was the DIVISOR, (x \u2212 1)/10, that could not be zero, and flipping it to multiply moved x \u2212 1 underneath the bar. Restrictions come from the operation you performed, not only from the fractions you started with.",
        crossFeedback:
          "Both cuts are single factors \u2014 x + 2 above the bar and x \u2212 1 below \u2014 and a single factor flips the sign from either side of it. Each cut changes exactly one sign.",
        bounceFeedback:
          "Holding a sign across a cut needs an even power there. Each factor here appears once, so the sign really does flip at \u22122 and again at 1.",
      },
      predict: {
        prompt:
          "Dividing by (x \u2212 1)/10 bans one value of x. Where does that ban show up in the ANSWER, 2(x + 2)/(x \u2212 1)?",
        options: [
          { id: "pole", label: "As a wall at x = 1 that the curve never reaches" },
          { id: "root", label: "As a zero at x = 1" },
          { id: "gone", label: "Nowhere \u2014 the division is finished, so its condition is spent" },
        ],
        outcomeId: "pole",
        reveal:
          "You may never divide by zero, so x = 1 was excluded the moment the division was written \u2014 and after the flip that factor sits in the denominator, where it shows as a vertical wall. The condition does not expire when the operation is carried out; it is recorded in the result.",
      },
    },
  },
];

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
for (const plan of PLAN) {
  const doc = JSON.parse(readFileSync(plan.path, "utf8"));
  if (doc.steps.some((s) => s.id === plan.step.id)) { console.log(`${plan.lesson}: ${plan.step.id} already present, skipped`); continue; }
  const idx = doc.steps.findIndex((s) => s.id === plan.after);
  if (idx === -1) throw new Error(`${plan.lesson}: anchor step ${plan.after} not found`);
  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.step.widget));
  if (errs.length) throw new Error(`${plan.lesson}: integrity \u2014 ${errs.join("; ")}`);

  const before = JSON.stringify(doc.steps);
  doc.steps.splice(idx + 1, 0, plan.step);
  const after = JSON.stringify(doc.steps.filter((s) => s.id !== plan.step.id));
  if (after !== before) throw new Error(`${plan.lesson}: an existing step changed \u2014 aborting`);
  staged.push([plan, doc]);
}

for (const [plan, doc] of staged) {
  writeFileSync(plan.path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${plan.lesson}: +${plan.step.id} ${plan.step.widget.type} with predict \u2014 existing steps byte-identical`);
}
console.log(`${staged.length} lessons gained a lab step`);
