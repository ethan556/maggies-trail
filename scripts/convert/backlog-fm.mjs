// K-8 upgrade backlog — the fm- cluster (Multiplying & Dividing Fractions, G5).
//
// WHY THIS COURSE. `FLAGSHIP_TIERS.md` ranks 110 K-8 Tier C/D lessons by load-bearing concepts,
// focus domains and misconception burden. Eight of the top thirteen are fm-, all flagged with the
// same gaps: `prediction manip conseq adapt`. That is a cluster, not a scatter - one course, one
// concept domain (fraction magnitude & operations), one engine already registered and in use here.
// Four lessons are converted in this batch, chosen so each builds a DIFFERENT fraction rather than
// repeating one shape.
//
// Every target was checked against real arithmetic before authoring:
//   fm-05-02  (1/2) / 3 = 1/6        fm-03-03  (2/3)(6/7) = 12/21 = 4/7
//   fm-01-03  5/6 - 1/3 = 3/6 = 1/2  fm-04-01  6 x 3/4 = 4.5 < 6
//
// A note on `fractionBar` grading: it compares by CROSS-MULTIPLICATION, so any equivalent build is
// accepted. That is exactly right for three of these - a learner who lands on 3/6 for fm-01-03 or
// 12/21 for fm-03-03 has done the arithmetic correctly and simply not reduced, and the success
// feedback names the reduction rather than the widget rejecting it. Reachability is bounded by
// numMax/denMax 12, so 12/21 is not buildable here; 4/7 is, and the feedback covers the route.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/fractions-multiply/lessons";

const PLAN = {
  // ---- fm-04-01: the scaling DIRECTION, seen rather than asserted ------------------------------
  "fm-04-01": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "6 \u00d7 3/4. Before building anything \u2014 will the answer land above 6, below 6, or exactly on it?",
      options: [
        { id: "below", label: "Below 6 \u2014 because 3/4 is less than one whole" },
        { id: "above", label: "Above 6 \u2014 multiplying always makes things bigger" },
        { id: "same", label: "Exactly 6 \u2014 the fraction just rearranges it" },
      ],
      outcomeId: "below",
      reveal:
        "Below. \"Multiplying makes things bigger\" is only true for factors above 1. Build 3/4 and look at the bar: it is less than one whole, so taking 3/4 OF something can only give you less than you started with.",
    },
    widget: {
      type: "fractionBar",
      prompt: "Build 3/4 and compare the bar to one whole \u2014 that comparison is the whole answer.",
      targetNum: 3,
      targetDen: 4,
      numMin: 1, numMax: 12, denMin: 1, denMax: 12, numStart: 1, denStart: 1,
      commonFractions: [
        { num: 4, den: 3, feedback: "4/3 is more than one whole \u2014 that is the fraction that would make 6 GROW. Swap the numerator and denominator back." },
        { num: 1, den: 1, feedback: "One whole leaves 6 exactly where it was. 3/4 is less than that, which is why the product drops below 6." },
      ],
      lowFeedback: "Still short of 3/4 \u2014 add more quarters.",
      highFeedback: "Past 3/4 now \u2014 take some away. Watch whether the bar stays under one whole as you do.",
      successFeedback:
        "3/4 sits below one whole, so 6 \u00d7 3/4 must sit below 6 \u2014 it is 4.5. The rule is not \"multiplying makes it bigger\"; it is \"multiplying by MORE than one makes it bigger, and by less than one makes it smaller.\"",
    },
  },

  // ---- fm-05-02: dividing a fraction BY a whole number, as cutting ------------------------------
  "fm-05-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "Cut 1/2 into 3 equal parts. Will each part be bigger or smaller than the 1/2 you started with?",
      options: [
        { id: "smaller", label: "Smaller \u2014 cutting something into parts makes each part smaller" },
        { id: "bigger", label: "Bigger \u2014 dividing by 3 makes the pieces grow" },
        { id: "same", label: "The same size, just relabelled" },
      ],
      outcomeId: "smaller",
      reveal:
        "Smaller. Each of the 3 parts is a third of a half \u2014 and it takes six of them to fill a whole, so each one is 1/6. Build it and count.",
    },
    widget: {
      type: "fractionBar",
      prompt: "Build the size of ONE part when a half is cut into 3 \u2014 how many of that piece fill a whole?",
      targetNum: 1,
      targetDen: 6,
      numMin: 1, numMax: 12, denMin: 1, denMax: 12, numStart: 1, denStart: 1,
      commonFractions: [
        { num: 1, den: 3, feedback: "1/3 is a third of a WHOLE. You cut a third off a HALF, which is smaller still \u2014 keep going." },
        { num: 1, den: 2, feedback: "That is the half you started with, before any cutting. Cut it into 3 and each piece gets smaller." },
        { num: 3, den: 2, feedback: "3/2 is bigger than a whole \u2014 you have multiplied by 3 instead of cutting into 3." },
      ],
      lowFeedback: "The piece is still too big \u2014 make it a smaller share of the whole.",
      highFeedback: "Too small now \u2014 that piece would need more than six to fill a whole.",
      successFeedback:
        "1/6 \u2014 six of them fill a whole. Cutting a half into 3 doubles the number of pieces the whole needs, from 2 to 6, which is why dividing a fraction by a whole number makes the DENOMINATOR grow.",
    },
  },

  // ---- fm-03-03: multiply across, then reduce ----------------------------------------------------
  "fm-03-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "2/3 \u00d7 6/7. Both factors are less than one whole. Where must the product land?",
      options: [
        { id: "belowboth", label: "Below both of them \u2014 taking a part of a part shrinks it twice" },
        { id: "between", label: "Somewhere between 2/3 and 6/7" },
        { id: "above", label: "Above both \u2014 two fractions multiplied grow" },
      ],
      outcomeId: "belowboth",
      reveal:
        "Below both. 2/3 of 6/7 is a part OF a part, so it is smaller than either piece you started with. Multiplying across gives 12/21, which reduces to 4/7 \u2014 and 4/7 is indeed under both 2/3 and 6/7.",
    },
    widget: {
      type: "fractionBar",
      prompt: "Build the product of 2/3 \u00d7 6/7 in its simplest form.",
      targetNum: 4,
      targetDen: 7,
      numMin: 1, numMax: 12, denMin: 1, denMax: 12, numStart: 1, denStart: 1,
      commonFractions: [
        { num: 8, den: 10, feedback: "That looks like the numerators and denominators were ADDED, not multiplied. Multiply across: 2\u00d76 over 3\u00d77." },
        { num: 12, den: 7, feedback: "The numerator is right (2\u00d76 = 12) but the denominator was not multiplied \u2014 3\u00d77 = 21, and 12/21 reduces to 4/7." },
      ],
      lowFeedback: "Below the product \u2014 build a slightly larger share.",
      highFeedback: "Above the product \u2014 build a slightly smaller share.",
      successFeedback:
        "4/7. Multiplying across gives 12/21, and dividing both by 3 gives 4/7 \u2014 the same length either way, which is what \"reducing\" means: a different name for one bar, not a different bar.",
    },
  },

  // ---- fm-01-03: subtracting unlike fractions ----------------------------------------------------
  "fm-01-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "5/6 \u2212 1/3. The pieces are different sizes. What has to happen before they can be subtracted?",
      options: [
        { id: "common", label: "Rewrite them over a common denominator \u2014 1/3 becomes 2/6" },
        { id: "subtract", label: "Subtract the numerators and the denominators separately" },
        { id: "nothing", label: "Nothing \u2014 subtract as they stand" },
      ],
      outcomeId: "common",
      reveal:
        "They have to be the same SIZE of piece first. 1/3 is 2/6, so the subtraction becomes 5/6 \u2212 2/6 = 3/6 \u2014 three sixths, which is a half.",
    },
    widget: {
      type: "fractionBar",
      prompt: "Build the result of 5/6 \u2212 1/3.",
      targetNum: 1,
      targetDen: 2,
      numMin: 1, numMax: 12, denMin: 1, denMax: 12, numStart: 1, denStart: 1,
      commonFractions: [
        { num: 4, den: 3, feedback: "4/3 comes from subtracting the numerators AND the denominators (5\u22121 over 6\u22123). Denominators name the piece size; they are not subtracted." },
        { num: 2, den: 3, feedback: "2/3 is bigger than the answer. Rewrite 1/3 as 2/6 first, then take 2 sixths off 5 sixths." },
      ],
      lowFeedback: "Below the answer \u2014 build a slightly larger share.",
      highFeedback: "Above the answer \u2014 build a slightly smaller share.",
      successFeedback:
        "3/6, which is 1/2 \u2014 the bar accepts either, because they are the same length. Once both fractions were sixths the subtraction was ordinary counting: 5 sixths take away 2 sixths leaves 3.",
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
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> fractionBar ${plan.widget.targetNum}/${plan.widget.targetDen} (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
