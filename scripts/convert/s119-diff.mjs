// S119, ninth pass -- every "how many more" step the measurement pass found, onto the new
// `lengthCompare` difference mode. Six steps across three lessons and two grade bands.
//
// These were all numeric boxes sitting beside a comparison the learner could not see. The engine
// already drew the right picture -- two tick-marked bars from a shared baseline -- and graded the
// wrong quantity (WHICH bar, not the gap). Difference mode grades the gap and shades it.
//
// Every difference is recomputed in this script from the two lengths before any write, and the
// integrity gate independently re-derives it as well, so an authoring slip cannot ship. `diffMax`
// is set to the longer bar in every case, which the gate REQUIRES: it keeps "I counted the whole
// long bar" -- the commonest comparison-subtraction error -- reachable as a state with its own
// diagnosis rather than clamped out of the slider's range.
//
// Copy register follows the grade: smg1- (Grade 1) uses short concrete sentences; mmt- (Grade 2)
// can carry one more clause.

import { readFileSync, writeFileSync } from "node:fs";

const mk = (o) => ({
  type: "lengthCompare",
  mode: "difference",
  orientation: "h",
  ...o,
});

const PLAN = [
  {
    path: "content/courses/shapes-measure-g1/lessons/smg1-03-02.json",
    lesson: "smg1-03-02",
    steps: {
      i1: {
        predict: {
          prompt: "The pencil is longer than the eraser. To find how many MORE, what do you count?",
          options: [
            { id: "extra", label: "Only the extra part that sticks out" },
            { id: "whole", label: "The whole pencil" },
            { id: "both", label: "Both bars added together" },
          ],
          outcomeId: "extra",
          reveal:
            "\u201cHow many more\u201d means how much longer one is than the other. That is just the part sticking out past the end of the shorter bar \u2014 not the whole bar.",
        },
        widget: mk({
          prompt: "The bars start in the same place. Count the paperclips the pencil sticks out past the eraser.",
          unitLabel: "paperclips",
          items: [
            { id: "pencil", label: "pencil", length: 5 },
            { id: "eraser", label: "eraser", length: 3 },
          ],
          answerId: "pencil",
          targetDifference: 2,
          diffMax: 5,
          successFeedback:
            "2 more paperclips! The pencil is 5 and the eraser is 3, and the shaded part is the 2 that stick out. That is what \u201chow many more\u201d asks for.",
          countsWholeFeedback:
            "5 is the WHOLE pencil. Count only the shaded part \u2014 the bit past the end of the eraser.",
          missFeedback: "Count the shaded paperclips one at a time, starting where the eraser ends.",
        }),
      },
      i2: {
        widget: mk({
          prompt: "Count the blocks the book sticks out past the phone.",
          unitLabel: "blocks",
          items: [
            { id: "book", label: "book", length: 8 },
            { id: "phone", label: "phone", length: 3 },
          ],
          answerId: "book",
          targetDifference: 5,
          diffMax: 8,
          successFeedback:
            "5 more blocks. The book is 8 and the phone is 3, so the part sticking out is 5 blocks long.",
          countsWholeFeedback:
            "8 is the whole book. The question asks only for the part past the end of the phone.",
          missFeedback: "Start counting where the phone ends and stop at the end of the book.",
        }),
      },
      i3: {
        widget: mk({
          prompt: "Count the cubes the spoon sticks out past the key.",
          unitLabel: "cubes",
          items: [
            { id: "spoon", label: "spoon", length: 6 },
            { id: "key", label: "key", length: 2 },
          ],
          answerId: "spoon",
          targetDifference: 4,
          diffMax: 6,
          successFeedback:
            "4 more cubes. The spoon is 6 and the key is 2, and 4 cubes stick out past the key.",
          countsWholeFeedback: "6 is the whole spoon. Count just the shaded cubes past the key.",
          missFeedback: "Count the shaded cubes, starting where the key ends.",
        }),
      },
    },
  },
  {
    path: "content/courses/measure-money-time/lessons/mmt-02-02.json",
    lesson: "mmt-02-02",
    steps: {
      i2: {
        widget: mk({
          prompt: "Both start at the same line. Count the inches the pencil reaches past the crayon.",
          unitLabel: "inches",
          items: [
            { id: "pencil", label: "pencil", length: 6 },
            { id: "crayon", label: "crayon", length: 3 },
          ],
          answerId: "pencil",
          targetDifference: 3,
          diffMax: 6,
          successFeedback:
            "3 inches more. Comparing lengths means measuring the gap between their ends \u2014 6 \u2212 3 = 3, and the shaded stretch is that subtraction drawn out.",
          countsWholeFeedback:
            "6 inches is the pencil's whole length. The comparison asks for the overhang only: the stretch past the crayon's end.",
          missFeedback: "Count the shaded inches, beginning where the crayon stops.",
        }),
      },
      i3: {
        widget: mk({
          prompt: "Count the inches the marker reaches past the spoon.",
          unitLabel: "inches",
          items: [
            { id: "marker", label: "marker", length: 12 },
            { id: "spoon", label: "spoon", length: 5 },
          ],
          answerId: "marker",
          targetDifference: 7,
          diffMax: 12,
          successFeedback:
            "7 inches more \u2014 12 \u2212 5. With a bigger gap the counting gets slower, which is exactly why subtraction is worth having: it gives the same answer without counting every inch.",
          countsWholeFeedback:
            "12 is the marker's full length. The gap is what is left after the spoon's 5 inches are covered.",
          missFeedback: "Start where the spoon ends and count the shaded inches to the marker's tip.",
        }),
      },
    },
  },
  {
    path: "content/courses/measure-money-time/lessons/mmt-05-03.json",
    lesson: "mmt-05-03",
    steps: {
      i2: {
        widget: mk({
          prompt: "Each square is one vote. Count the votes Tuesday has beyond Monday's.",
          unitLabel: "votes",
          items: [
            { id: "tue", label: "Tuesday", length: 7 },
            { id: "mon", label: "Monday", length: 3 },
          ],
          answerId: "tue",
          targetDifference: 4,
          diffMax: 7,
          successFeedback:
            "4 more votes. Reading \u201chow many more\u201d off a bar graph is the same move as comparing two lengths \u2014 you measure the gap between the bar ends, not either bar on its own.",
          countsWholeFeedback:
            "7 is Tuesday's total. The question compares the two days, so the answer is the difference between them.",
          missFeedback: "Count the shaded squares, starting from the end of Monday's bar.",
        }),
      },
    },
  },
];

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
let converted = 0;
for (const plan of PLAN) {
  const doc = JSON.parse(readFileSync(plan.path, "utf8"));
  let touched = false;
  for (const [sid, change] of Object.entries(plan.steps)) {
    const step = doc.steps.find((s) => s.id === sid);
    if (!step) throw new Error(`${plan.lesson}: step ${sid} not found`);
    if (step.widget?.type === "lengthCompare") continue;
    if (step.widget?.type !== "numeric")
      throw new Error(`${plan.lesson}/${sid}: expected numeric, found ${step.widget?.type}`);
    if (step.variant) throw new Error(`${plan.lesson}/${sid}: carries a variant tag`);
    if (change.predict && step.predict) throw new Error(`${plan.lesson}/${sid}: already has a predict`);

    const errs = widgetIntegrityErrors(WidgetSpec.parse(change.widget));
    if (errs.length) throw new Error(`${plan.lesson}/${sid}: integrity \u2014 ${errs.join("; ")}`);

    // Independent arithmetic: recompute the gap from the two lengths.
    const [x, y] = change.widget.items;
    const gap = Math.abs(x.length - y.length);
    if (gap !== change.widget.targetDifference)
      throw new Error(`${plan.lesson}/${sid}: computed gap ${gap} != targetDifference ${change.widget.targetDifference}`);
    const longer = Math.max(x.length, y.length);
    if (change.widget.diffMax < longer)
      throw new Error(`${plan.lesson}/${sid}: diffMax clamps the whole-bar error out of reach`);
    console.log(`  ${plan.lesson}/${sid}: ${longer} \u2212 ${Math.min(x.length, y.length)} = ${gap} \u2713 (whole-bar error reachable at ${longer})`);

    const bodyBefore = step.body;
    const rebuilt = {};
    for (const k of Object.keys(step)) {
      if (k === "widget") {
        if (change.predict) rebuilt.predict = change.predict;
        rebuilt.widget = change.widget;
        continue;
      }
      rebuilt[k] = step[k];
    }
    if (rebuilt.body !== bodyBefore) throw new Error(`${plan.lesson}/${sid}: body changed`);
    const idx = doc.steps.findIndex((s) => s.id === sid);
    doc.steps[idx] = rebuilt;
    touched = true;
    converted++;
  }
  if (touched) staged.push([plan.path, doc, plan.lesson]);
}

for (const [path, doc, lesson] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}: written`);
}
console.log(`${converted} steps converted across ${staged.length} lessons`);
