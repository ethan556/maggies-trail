// S117 Wave B — three cp- lessons gain ONE construction lab step each, under explicit content
// mandate, in the exact S116 pattern (read the authored prose, then PERFORM it: new step `i1b`
// directly after `i1`, carrying the lesson's own conceptTag, with a predict). No authored word
// is edited; the only new content is each i1b (body, spec copy, predict), all ledgered.
//
// - cp-01-02 (Constructing a Perpendicular Bisector): its i1 is a steppedReveal of the very
//   construction cp-01-01/i1 already performs at span 8. The lab uses span 6 so the two lessons
//   pose DIFFERENT smallest-radius problems (6/2 = 3, smallest whole clearing it = 4).
// - cp-03-03 (Why Constructions Work): its i1 mcq asks which lengths are equal BY THE COMPASS
//   ALONE, and its i2 orders the perpendicular-bisector proof. The lab performs that exact
//   construction first (span 10 -> smallest whole radius 6), with copy aimed at the warrant:
//   the proof's SSS pairs are the equal radii the learner just chose.
// - cp-03-02 (The Square & the Triangle): the inscribed square's warrant IS the perpendicular
//   bisector -- of the diameter, through the center, cutting the circle at the two remaining
//   vertices. span 4 -> smallest whole radius 3.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/constructions-and-proof/lessons";

const PLAN = {
  "cp-01-02": {
    conceptTag: "cp-perp-bisector",
    body: "Now swing the arcs yourself.",
    predict: {
      prompt:
        "Both arcs will be drawn with the SAME compass opening \u2014 one from A, one from B. Whatever point they cross at must be\u2026",
      options: [
        { id: "equi", label: "The same distance from A and from B \u2014 that is what equal radii mean" },
        { id: "mid", label: "Exactly at the segment's midpoint" },
        { id: "closerA", label: "Closer to whichever end the compass touched first" },
      ],
      outcomeId: "equi",
      reveal:
        "An arc is every point at ONE distance from its center. Where two equal-radius arcs cross, that point is the same distance from A and from B at once \u2014 and every such point lies on the perpendicular bisector. The compass is not drawing a curve; it is making a promise about distance.",
    },
    widget: {
      type: "compassConstruct",
      mode: "perpBisector",
      span: 6,
      target: 4,
      start: 2,
      prompt:
        "A and B are 6 apart. Open the compass until the two arcs actually meet \u2014 find the smallest whole radius that does it.",
      successFeedback:
        "Radius 4 \u2014 the first whole opening that clears half of 6. Widen it and watch: the crossings slide, but the LINE through them refuses to move. Both crossings are equidistant from A and from B by construction, so they lie on the perpendicular bisector no matter which radius you chose.",
      lowFeedback:
        "The arcs cannot reach each other yet. Each reaches only its own radius from its own end, so together they must span more than the 6 between A and B \u2014 the radius has to clear 3.",
      highFeedback:
        "They do meet, but you were asked for the SMALLEST whole radius that reaches. Come back down until they are just about to come apart.",
    },
  },
  "cp-03-03": {
    conceptTag: "cp-why-works",
    body: "Perform the construction the proof will explain.",
    predict: {
      prompt:
        "The proof you are about to order rests on ONE guarantee the compass gives for free. Which is it?",
      options: [
        { id: "radii", label: "Every arc's points sit at the SAME distance from its center \u2014 equal radii, no measuring" },
        { id: "perp", label: "The compass draws the perpendicular directly" },
        { id: "mid", label: "The compass finds the midpoint by touch" },
      ],
      outcomeId: "radii",
      reveal:
        "The compass never measures and never aims \u2014 it only promises equal distance from its center. XA = XB and YA = YB come from that promise alone, and they are exactly the equal pairs the SSS argument in the proof will lean on. Perpendicularity and the midpoint are CONCLUSIONS, not tools.",
    },
    widget: {
      type: "compassConstruct",
      mode: "perpBisector",
      span: 10,
      target: 6,
      start: 2,
      prompt:
        "A and B are 10 apart. Swing the equal arcs and find the smallest whole radius where they cross \u2014 these crossings are the X and Y of the proof.",
      successFeedback:
        "Radius 6 \u2014 the first whole opening past half of 10. Now name what you actually guaranteed: XA = XB and YA = YB, because each crossing sits on BOTH equal-radius arcs. Those two equalities are the entire input to the proof you order next \u2014 everything else is deduction.",
      lowFeedback:
        "The arcs each reach only their own radius from their own end. To touch, the two radii together must beat the 10 between A and B \u2014 clear 5.",
      highFeedback:
        "Crossing, yes \u2014 but the task asks for the SMALLEST whole radius that manages it. Bring it back down.",
    },
  },
  "cp-03-02": {
    conceptTag: "cp-square-triangle",
    body: "Build the square's warrant yourself.",
    predict: {
      prompt:
        "AB is the circle's diameter. The construction bisects it with equal arcs. Where must the bisector's crossing points land?",
      options: [
        { id: "circle", label: "On the circle \u2014 they become the square's other two vertices" },
        { id: "inside", label: "Strictly inside the circle, near the center" },
        { id: "anywhere", label: "Anywhere \u2014 it depends on the compass opening" },
      ],
      outcomeId: "circle",
      reveal:
        "The perpendicular bisector of a diameter passes through the center, so it is itself a diameter line \u2014 and a diameter meets the circle at two points. Those two points, with A and B, are four circle points a quarter-turn apart: the inscribed square. The compass opening only decides where the ARCS cross; the line they fix was never in doubt.",
    },
    widget: {
      type: "compassConstruct",
      mode: "perpBisector",
      span: 4,
      target: 3,
      start: 1,
      prompt:
        "The diameter's ends are 4 apart. Find the smallest whole radius whose arcs cross \u2014 the line through the crossings carries the square's other two vertices.",
      successFeedback:
        "Radius 3 \u2014 just past half of 4. The line through the crossings is perpendicular to the diameter AND passes through its midpoint, the circle's center \u2014 so it is the second diameter, and its circle-crossings complete the square. Equal central angles of 90\u00b0 each: that is where \u201cregular\u201d comes from.",
      lowFeedback:
        "The two arcs each reach only their own radius; together they must beat the 4 between the ends \u2014 the radius has to clear 2.",
      highFeedback:
        "They cross, but not at the SMALLEST whole radius that manages it. Ease back down.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  if (doc.steps.some((s) => s.id === "i1b")) { console.log(`${lesson}: i1b already present, skipped`); continue; }
  const idx = doc.steps.findIndex((s) => s.id === "i1");
  if (idx === -1) throw new Error(`${lesson}: i1 not found`);
  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${lesson}: integrity \u2014 ${errs.join("; ")}`);

  const before = JSON.stringify(doc.steps);
  const i1b = { id: "i1b", kind: "interactive", body: plan.body, conceptTag: plan.conceptTag, widget: plan.widget, predict: plan.predict };
  doc.steps.splice(idx + 1, 0, i1b);
  // Every pre-existing step must be byte-identical after the insertion.
  const after = JSON.stringify(doc.steps.filter((s) => s.id !== "i1b"));
  if (after !== before) throw new Error(`${lesson}: an existing step changed \u2014 aborting`);
  staged.push([path, doc, lesson]);
}

for (const [path, doc, lesson] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}: +i1b compassConstruct(perpBisector) with predict \u2014 existing steps byte-identical`);
}
console.log(`${staged.length} lessons gained a construction lab step`);
