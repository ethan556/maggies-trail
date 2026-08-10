// S119 -- the fm- cluster's next batch, from the top of FLAGSHIP_TIERS' K-8 upgrade backlog
// (ranks 7 and 8 of 106). Same proven pattern S116 used for fm-01-03/03-03/04-01/05-02, and each
// builds a DIFFERENT fraction so the shape is not simply repeated.
//
// Both of these were only authorable AFTER this session's fractionBar repair: each turns on an
// IMPROPER fraction, and until now the renderer drew `d` parts and shaded the first `n`, so
// anything above one whole filled every part and looked exactly like one whole. The pictures
// would have contradicted the lessons.
//
// fm-04-02 "Scaling Without Computing" -- convert i2, NOT i1. i1 is 3/4 x 8, and fm-04-01 already
//   ships a 3/4 build; repeating it teaches nothing new. i2 asks "is 4/3 x 6 more than 6?" -- the
//   CONTRAST CASE to fm-04-01's 3/4, and the reason the lesson exists: a scaler above one whole
//   grows the thing it scales. Verified: 4/3 > 1, and 4/3 x 6 = 8 > 6.
//
// fm-02-01 "Groups of a Fraction" -- i1 asks for the numerator of 3 x 2/5. Building the PRODUCT,
//   6/5, is three groups of 2/5 laid end to end, and the bar crossing the whole-mark is why the
//   numerator (6) outgrows the denominator (5). Verified: 3 x 2/5 = 6/5, and 6/5 > 1.
//
// Measured and DECLINED this batch, with reasons:
//   fm-05-01 / fm-05-03 -- both are measurement division ("how many 1/2s fit in 4?"). fractionBar
//     builds ONE fraction; it cannot show N wholes being partitioned into unit pieces and counted.
//     numberLineHop is the right shape and is integer-only (established S116, still true). These
//     stay authored until a fractional-hop mode exists.
//   fm-05-03/i1 -- an mcq asking WHICH computation matches a story: a judgment task, the
//     legitimate-KEEP class already documented for cx-/cp-/gf-.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/fractions-multiply/lessons";

const PLAN = {
  "fm-04-02": {
    step: "i2",
    expect: "mcq",
    predict: {
      prompt:
        "4/3 is the scaler. Before building it \u2014 will 4/3 \u00d7 6 land above 6, below 6, or exactly on 6?",
      options: [
        { id: "above", label: "Above 6 \u2014 4/3 is more than one whole" },
        { id: "below", label: "Below 6 \u2014 multiplying by a fraction always shrinks" },
        { id: "equal", label: "Exactly 6 \u2014 the thirds cancel out" },
      ],
      outcomeId: "above",
      reveal:
        "\u201cMultiplying by a fraction shrinks it\u201d is only true for fractions BELOW one whole. 4/3 reaches past the whole-mark, so it stretches 6 rather than shrinking it \u2014 which the bar is about to show.",
    },
    widget: {
      type: "fractionBar",
      prompt:
        "Build 4/3 and watch where it lands against one whole \u2014 that comparison decides the answer.",
      targetNum: 4,
      targetDen: 3,
      numMin: 1,
      numMax: 12,
      denMin: 1,
      denMax: 12,
      numStart: 1,
      denStart: 1,
      commonFractions: [
        {
          num: 3,
          den: 4,
          feedback:
            "3/4 stops short of the whole-mark \u2014 that is a scaler that SHRINKS, and it would pull 6 down to 4.5. The numerator and denominator are the other way round here.",
        },
        {
          num: 1,
          den: 1,
          feedback:
            "One whole leaves 6 exactly where it was. 4/3 reaches past that mark, which is why the product climbs above 6.",
        },
      ],
      lowFeedback: "Not yet at 4/3 \u2014 keep adding thirds and watch for the whole-mark.",
      highFeedback: "Past 4/3 now \u2014 come back down, but stay beyond the whole-mark.",
      successFeedback:
        "4/3 crosses the whole-mark \u2014 one whole plus one more third. A scaler bigger than one whole stretches what it multiplies, so 4/3 \u00d7 6 climbs to 8. The rule is not \u201cmultiplying makes things bigger\u201d or \u201cfractions make things smaller\u201d; it is whether the scaler sits above or below one whole.",
    },
  },
  "fm-02-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "3 \u00d7 2/5 is three groups of 2/5 laid end to end. Will the result reach past one whole?",
      options: [
        { id: "past", label: "Yes \u2014 three groups of 2/5 overshoot a whole" },
        { id: "short", label: "No \u2014 fifths are small, so it stays under one whole" },
        { id: "exact", label: "It lands exactly on one whole" },
      ],
      outcomeId: "past",
      reveal:
        "Each group is 2/5, and 5/5 makes a whole \u2014 so two groups reach 4/5 and the third pushes past. The bar will cross the whole-mark, which is exactly why the numerator ends up larger than the denominator.",
    },
    widget: {
      type: "fractionBar",
      prompt:
        "Build the product of 3 \u00d7 2/5 \u2014 three groups of two fifths. Keep the fifths and count how many you end up with.",
      targetNum: 6,
      targetDen: 5,
      numMin: 1,
      numMax: 12,
      denMin: 1,
      denMax: 12,
      numStart: 1,
      denStart: 1,
      commonFractions: [
        {
          num: 6,
          den: 10,
          feedback:
            "6/10 changed the SIZE of the pieces as well as the count. Three groups do not make each fifth smaller \u2014 every piece is still a fifth. Only how MANY you have changes: 6 of them.",
        },
        {
          num: 2,
          den: 5,
          feedback:
            "That is one group. Three groups of 2/5 means three copies laid end to end \u2014 keep the fifths and count them all.",
        },
      ],
      lowFeedback: "Fewer fifths than three groups gives \u2014 keep adding until you have all six.",
      highFeedback: "More than three groups of 2/5 now \u2014 come back to six fifths.",
      successFeedback:
        "6/5 \u2014 six fifths, and the bar reaches past the whole-mark. Three groups of 2 fifths is 6 fifths: the pieces stayed the same size and only their COUNT changed, which is why you multiply the numerator and keep the denominator.",
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
  if (step.predict) throw new Error(`${lesson}/${plan.step}: already has a predict`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
  if (errs.length) throw new Error(`${lesson}: integrity \u2014 ${errs.join("; ")}`);

  // Independent arithmetic: each target must genuinely be improper, or the lesson's point is lost.
  const { targetNum: tn, targetDen: td } = plan.widget;
  if (tn <= td) throw new Error(`${lesson}: target ${tn}/${td} is not improper \u2014 the whole-mark crossing is the lesson`);
  console.log(`  ${lesson}: target ${tn}/${td} = ${(tn / td).toFixed(3)} (> 1 \u2713), spans ${Math.ceil(tn / td)} wholes`);

  const bodyBefore = step.body;
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") { rebuilt.predict = plan.predict; rebuilt.widget = plan.widget; continue; }
    rebuilt[k] = step[k];
  }
  if (rebuilt.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  const idx = doc.steps.findIndex((s) => s.id === plan.step);
  doc.steps[idx] = rebuilt;
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> fractionBar (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
