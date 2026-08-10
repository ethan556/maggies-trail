// S119 -- the lessons the rational-hop mode unblocks. All are measurement division ("how many
// of this piece fit in that amount?"), which is precisely what a hop-counting number line shows
// and what no engine could previously represent below one unit.
//
// S116 refused to force ns-01-01 onto this engine, and was right to: the only way then was to
// relabel a 0-2 question as a 0-10 integer axis, "which misrepresents the mathematics rather than
// revealing it". The `denom` mode answers that objection directly -- the axis now READS
// 0, 1/5, 2/5 ... 1 ... 2, with whole numbers carrying taller emphasised ticks, while the
// arithmetic underneath stays in exact integer numerator units. Nothing is rounded, no float
// reaches a grade, and the numbers on screen are the question's own numbers.
//
// Arithmetic verified independently below before any write, in numerator units:
//   ns-01-01  2 / (1/5)  = 10 fifths   -> denom 5, start 0, hop 1, hops 10, land 10 units = "2"
//   fm-05-01  4 / (1/2)  = 8 halves    -> denom 2, start 0, hop 1, hops 8,  land 8 units  = "4"
//   fm-05-03  3 / (1/4)  = 12 quarters -> denom 4, start 0, hop 1, hops 12, land 12 units = "3"

import { readFileSync, writeFileSync } from "node:fs";

const PLAN = [
  {
    path: "content/courses/number-system/lessons/ns-01-01.json",
    lesson: "ns-01-01",
    step: "i1",
    expect: "numeric",
    keepPredict: true, // authored predict already asks the right question
    widget: {
      type: "numberLineHop",
      prompt:
        "Hop from 0 to 2 in fifths, one fifth at a time. The number of hops it takes IS 2 \u00f7 1/5.",
      min: 0,
      max: 10,
      start: 0,
      hop: 1,
      hops: 10,
      denom: 5,
      direction: "forward",
      commonLandings: [
        {
          value: 2,
          feedback:
            "That is 2 fifths, not 2 wholes. The question asks how many fifths fit in TWO WHOLE units \u2014 keep hopping until you reach the 2 on the axis.",
        },
        {
          value: 5,
          feedback:
            "Five fifths reaches 1 whole \u2014 exactly half the journey. Two wholes needs that again.",
        },
      ],
      missFeedback:
        "Count the hops, not the label you land on. Each hop is one fifth; stop when the marker reaches 2.",
      successFeedback:
        "Ten hops to reach 2. Each hop is 1/5, and it took 10 of them \u2014 so 2 \u00f7 1/5 = 10. Dividing by a fraction smaller than 1 gives an answer BIGGER than what you started with, because small pieces take many hops to cover the distance.",
    },
  },
  {
    path: "content/courses/fractions-multiply/lessons/fm-05-01.json",
    lesson: "fm-05-01",
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "How many halves will it take to hop from 0 all the way to 4?",
      options: [
        { id: "eight", label: "8 \u2014 two halves per whole, four wholes" },
        { id: "two", label: "2 \u2014 there are two halves in anything" },
        { id: "four", label: "4 \u2014 one hop per whole" },
      ],
      outcomeId: "eight",
      reveal:
        "Each whole holds two halves, and there are four wholes to cross \u2014 so the hops multiply: 4 \u00d7 2 = 8. Dividing by 1/n multiplies by n, and the hop count is why.",
    },
    widget: {
      type: "numberLineHop",
      prompt: "Hop from 0 to 4 one half at a time. The number of hops is 4 \u00f7 1/2.",
      min: 0,
      max: 8,
      start: 0,
      hop: 1,
      hops: 8,
      denom: 2,
      direction: "forward",
      commonLandings: [
        {
          value: 2,
          feedback:
            "Two halves reaches only 1 whole. There are four wholes to cross, so keep going \u2014 each whole costs two hops.",
        },
        {
          value: 4,
          feedback:
            "Four hops reaches 2, not 4 \u2014 an easy slip, because the hop COUNT and the position look alike here. Watch the axis label, not the tally.",
        },
      ],
      missFeedback: "Each hop is one half. Count how many it takes for the marker to reach 4.",
      successFeedback:
        "Eight hops. Every whole took two halves, and four wholes took eight \u2014 so 4 \u00f7 1/2 = 8. That is why dividing by 1/n multiplies by n: n pieces fit inside each whole.",
    },
  },
  {
    path: "content/courses/fractions-multiply/lessons/fm-05-03.json",
    lesson: "fm-05-03",
    step: "i2",
    expect: "numeric",
    predict: {
      prompt: "A 1/4-cup scoop, and 3 cups to fill. More than 3 scoops, or fewer?",
      options: [
        { id: "more", label: "More \u2014 a quarter-cup scoop is smaller than a cup" },
        { id: "fewer", label: "Fewer \u2014 dividing always makes the answer smaller" },
        { id: "same", label: "Exactly 3 \u2014 one scoop per cup" },
      ],
      outcomeId: "more",
      reveal:
        "The scoop is smaller than the thing being measured, so it takes MANY of them. Dividing only shrinks the answer when you divide by something bigger than 1.",
    },
    widget: {
      type: "numberLineHop",
      prompt: "Hop from 0 to 3 one quarter at a time \u2014 the hop count is how many scoops fill 3 cups.",
      min: 0,
      max: 12,
      start: 0,
      hop: 1,
      hops: 12,
      denom: 4,
      direction: "forward",
      commonLandings: [
        {
          value: 3,
          feedback:
            "Three quarter-scoops fills only 3/4 of one cup \u2014 not 3 cups. Keep hopping to the 3 on the axis.",
        },
        {
          value: 4,
          feedback:
            "Four quarters fills exactly 1 cup. Two more cups to go, at four scoops each.",
        },
      ],
      missFeedback: "Each hop is a quarter cup. Count the hops until the marker reaches 3.",
      successFeedback:
        "Twelve scoops. Four quarters fill each cup, and three cups take 12 \u2014 so 3 \u00f7 1/4 = 12. The answer is bigger than 3 because the measuring piece is smaller than a cup.",
    },
  },
];

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const plan of PLAN) {
  const doc = JSON.parse(readFileSync(plan.path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${plan.lesson}: step ${plan.step} not found`);
  if (step.widget?.type === plan.widget.type) { skipped.push(plan.lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${plan.lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.variant) throw new Error(`${plan.lesson}/${plan.step}: carries a variant tag`);
  if (plan.keepPredict && !step.predict) throw new Error(`${plan.lesson}: expected an authored predict to preserve`);
  if (!plan.keepPredict && step.predict) throw new Error(`${plan.lesson}: already has a predict`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
  if (errs.length) throw new Error(`${plan.lesson}: integrity \u2014 ${errs.join("; ")}`);

  // Independent arithmetic: the landing must be a whole number of `denom` units, and the hop
  // count must equal (whole units crossed) x denom -- i.e. the division the prompt states.
  const w = plan.widget;
  const landUnits = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
  if (landUnits % w.denom !== 0) throw new Error(`${plan.lesson}: landing ${landUnits} is not a whole number of units`);
  const wholes = landUnits / w.denom;
  if (w.hops !== wholes * w.denom) throw new Error(`${plan.lesson}: hop count ${w.hops} != ${wholes} x ${w.denom}`);
  console.log(`  ${plan.lesson}: ${wholes} \u00f7 1/${w.denom} = ${w.hops} hops, landing at ${landUnits} units = ${wholes}`);

  const bodyBefore = step.body;
  const predictBefore = JSON.stringify(step.predict ?? null);
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") {
      if (!plan.keepPredict) rebuilt.predict = plan.predict;
      rebuilt.widget = plan.widget;
      continue;
    }
    rebuilt[k] = step[k];
  }
  if (rebuilt.body !== bodyBefore) throw new Error(`${plan.lesson}: body changed`);
  if (plan.keepPredict && JSON.stringify(rebuilt.predict ?? null) !== predictBefore)
    throw new Error(`${plan.lesson}: authored predict changed`);
  const idx = doc.steps.findIndex((s) => s.id === plan.step);
  doc.steps[idx] = rebuilt;
  staged.push([plan, doc]);
}

for (const [plan, doc] of staged) {
  writeFileSync(plan.path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${plan.lesson}/${plan.step}: ${plan.expect} -> numberLineHop denom=${plan.widget.denom}${plan.keepPredict ? " (authored predict preserved)" : " (+predict)"}`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`${staged.length} converted, ${skipped.length} already done (of ${PLAN.length})`);
