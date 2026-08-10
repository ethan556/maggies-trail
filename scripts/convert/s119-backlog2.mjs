// S119, fifth pass -- three more from the top of the K-8 upgrade backlog, all onto engines that
// already exist. No engine work.
//
// ee-03-01 (rank 7, C 22) "The Distributive Property with Variables". Its i1 is an mcq: "which
//   expression equals 3(x + 4)?" -- the answer selected from a list. `algebraTiles` is registered
//   in adjacent courses and models exactly this: build 3x + 12 out of x-tiles and unit tiles, and
//   the three groups of (x + 4) are visible as three x-tiles and three fours. The misconception
//   the lesson exists to break -- multiplying only the first term, giving 3x + 4 -- is a
//   REACHABLE BUILD (leave the constant at 4) rather than a distractor to eliminate.
//   Verified: 3(x + 4) = 3x + 12, so targetX 3, targetConst 12; maxTiles must clear 12.
//
// sp-01-01 (rank 11, C 22) and sp-01-03 (rank 12, C 21) are the same shape: scale a sample
//   proportion up to a population. `ratioTable` is registered and is precisely this -- known rows
//   fixed, one row's B set by the learner, with the constant ratio visible down the column.
//   Verified by independent arithmetic below: 30/50 of 500 is 300; 2/50 of 5000 is 200.
//
// Measured and DECLINED:
//   sp-01-01/i2, sp-01-03/i3 -- "which sampling method is least biased?" is a judgment task, the
//     legitimate-KEEP class documented for cx-/cp-/gf-. `samplingBiasLab` exists but answers a
//     different question (watching a biased frame distort an estimate), and neither step asks it.
//   sp-02-02 -- its i1/i2 are interpretation questions about ALREADY-DRAWN dot plots ("what does
//     this overlap suggest?"), which is reading a display, not manipulating one. i3 is arithmetic
//     on given means. Converting would draw a plot the learner does not control.
//   sp-03-02 -- relative frequency from a FIXED reported outcome (6 heads in 10 flips). A
//     simulation engine would generate its own trials and contradict the authored numbers.

import { readFileSync, writeFileSync } from "node:fs";

const PLAN = {
  "content/courses/expressions-equations/lessons/ee-03-01.json": {
    lesson: "ee-03-01",
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "3(x + 4) means three groups of (x + 4). When you lay those groups out as tiles, how many unit tiles appear?",
      options: [
        { id: "twelve", label: "Twelve \u2014 each of the three groups brings its own 4" },
        { id: "four", label: "Four \u2014 the 4 is only written once" },
        { id: "seven", label: "Seven \u2014 3 + 4" },
      ],
      outcomeId: "twelve",
      reveal:
        "The multiplier reaches everything inside the bracket. Three groups each carrying an x and a 4 give three x-tiles and twelve unit tiles \u2014 which is why 3(x + 4) is 3x + 12 and not 3x + 4.",
    },
    widget: {
      type: "algebraTiles",
      prompt:
        "Build 3(x + 4) with tiles: three groups, each holding one x and four units. Then read off the expression you made.",
      targetX: 3,
      targetConst: 12,
      maxTiles: 14,
      xStart: 0,
      constStart: 0,
      successFeedback:
        "3x + 12. Every one of the three groups brought its own 4, so the units came to twelve, not four. That is what \u201cdistribute\u201d means \u2014 the 3 reaches BOTH terms inside the bracket, and the tiles make it impossible to give it to only one.",
      xFeedback:
        "Check the x-tiles: three groups means three x-tiles, one from each group.",
      constFeedback:
        "Check the unit tiles. If you have four, you gave the 3 to the x only and left the 4 behind \u2014 but each of the three groups carries its own 4, so there are twelve.",
    },
  },
  "content/courses/sampling-and-probability/lessons/sp-01-01.json": {
    lesson: "sp-01-01",
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "30 of 50 sampled students prefer pizza. The school has 500 students \u2014 ten times the sample. What should the estimate be?",
      options: [
        { id: "ten", label: "Ten times the sample count \u2014 300" },
        { id: "same", label: "Still 30 \u2014 the sample already counted them" },
        { id: "half", label: "250 \u2014 half the school, since 30 is about half the sample" },
      ],
      outcomeId: "ten",
      reveal:
        "A sample estimate assumes the same RATIO holds in the whole population. 500 is ten times 50, so the count scales by ten as well: 300. The ratio stays fixed while both numbers grow \u2014 which is what the table will show.",
    },
    widget: {
      type: "ratioTable",
      prompt:
        "The sample is 30 out of 50. Fill in the row for the whole school of 500, keeping the ratio the same.",
      colA: "students asked",
      colB: "prefer pizza",
      rows: [
        [50, 30],
        [100, 60],
      ],
      askA: 500,
      targetB: 300,
      bMax: 500,
      bStep: 10,
      bStart: 0,
      successFeedback:
        "300. Look down the column: 30 out of 50, 60 out of 100, 300 out of 500 \u2014 the ratio never changed, only the size of the group. That constant ratio IS the assumption a sample estimate rests on.",
      lowFeedback:
        "Too low. 500 is ten times the 50 you sampled, so the count has to grow by the same factor \u2014 compare your row against the ones above it.",
      highFeedback:
        "Too high \u2014 that is more than the ratio allows. 30 out of every 50 is well under everyone; scaling it to 500 cannot exceed 300.",
    },
  },
  "content/courses/sampling-and-probability/lessons/sp-01-03.json": {
    lesson: "sp-01-03",
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "2 defects in a sample of 50 phones. The factory made 5000 \u2014 a hundred times as many. Will the estimated defect count be small or large?",
      options: [
        { id: "twohundred", label: "Large in count, small in rate \u2014 about 200" },
        { id: "two", label: "Still about 2 \u2014 defects are rare" },
        { id: "fifty", label: "About 50 \u2014 one per hundred phones" },
      ],
      outcomeId: "twohundred",
      reveal:
        "A rare rate can still be a big count once the population is large. 2 in 50 is 4%, and 4% of 5000 is 200 \u2014 the RATE stayed tiny while the count grew a hundredfold.",
    },
    widget: {
      type: "ratioTable",
      prompt:
        "The sample is 2 defects out of 50 phones. Fill in the row for all 5000 phones, keeping the ratio the same.",
      colA: "phones checked",
      colB: "defective",
      rows: [
        [50, 2],
        [500, 20],
      ],
      askA: 5000,
      targetB: 200,
      bMax: 400,
      bStep: 10,
      bStart: 0,
      successFeedback:
        "200. The rate held at 2 in every 50 \u2014 4% \u2014 all the way down the column, but a hundredfold bigger population turns a rare defect into 200 phones. Rate and count are different questions, and a sample answers the first in order to estimate the second.",
      lowFeedback:
        "Too low. Each 50 phones brings about 2 defects, and 5000 holds a hundred of those groups \u2014 count them up.",
      highFeedback:
        "Too high. Only 2 in every 50 are defective, so even 5000 phones cannot reach past 200.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [path, plan] of Object.entries(PLAN)) {
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${plan.lesson}: step ${plan.step} not found`);
  if (step.widget?.type === plan.widget.type) { skipped.push(plan.lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${plan.lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.variant) throw new Error(`${plan.lesson}/${plan.step}: carries a variant tag`);
  if (step.predict) throw new Error(`${plan.lesson}/${plan.step}: already has a predict`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${plan.lesson}: integrity \u2014 ${errs.join("; ")}`);

  // Independent arithmetic per widget kind, computed here rather than trusted from the spec.
  const w = plan.widget;
  if (w.type === "algebraTiles") {
    const groups = 3, inner = 4;
    if (groups !== w.targetX) throw new Error(`${plan.lesson}: group count != targetX`);
    if (groups * inner !== w.targetConst) throw new Error(`${plan.lesson}: ${groups}x${inner} != ${w.targetConst}`);
    if (w.maxTiles < w.targetConst) throw new Error(`${plan.lesson}: maxTiles ${w.maxTiles} cannot reach ${w.targetConst}`);
    console.log(`  ${plan.lesson}: ${groups}(x + ${inner}) = ${w.targetX}x + ${w.targetConst} \u2713`);
  } else if (w.type === "ratioTable") {
    const [a0, b0] = w.rows[0];
    if (b0 * w.askA !== a0 * w.targetB)
      throw new Error(`${plan.lesson}: ${b0}/${a0} != ${w.targetB}/${w.askA} (cross-multiplication)`);
    for (const [a, b] of w.rows)
      if (b * a0 !== a * b0) throw new Error(`${plan.lesson}: shown row ${a}/${b} breaks the ratio`);
    if (w.targetB > w.bMax) throw new Error(`${plan.lesson}: targetB ${w.targetB} exceeds bMax ${w.bMax}`);
    if (w.targetB % w.bStep !== 0) throw new Error(`${plan.lesson}: targetB ${w.targetB} is off the bStep lattice`);
    console.log(`  ${plan.lesson}: ${b0}/${a0} = ${w.targetB}/${w.askA} \u2713 (all rows consistent)`);
  }

  const bodyBefore = step.body;
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") { rebuilt.predict = plan.predict; rebuilt.widget = plan.widget; continue; }
    rebuilt[k] = step[k];
  }
  if (rebuilt.body !== bodyBefore) throw new Error(`${plan.lesson}: body changed`);
  const idx = doc.steps.findIndex((s) => s.id === plan.step);
  doc.steps[idx] = rebuilt;
  staged.push([path, doc, plan]);
}

for (const [path, doc, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${plan.lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
