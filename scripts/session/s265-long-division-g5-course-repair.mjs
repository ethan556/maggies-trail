import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/long-division-g5/lessons";
const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

// The inherited `count-on-hops` renderer always shows 4 + 3 = 7. It cannot
// represent any of the long-division claims in this course. The two retained
// figures are generic, registered examples whose own visible arithmetic does
// not contradict their number-free authored concept text.
const exactFigurePlacements = new Map([
  ["g5l-01-01/c2", "dop-estimate-quotient"],
  ["g5l-02-02/c1", "dop-long-division"],
]);

const i2Repairs = new Map([
  ["g5l-01-01", {
    body: "Estimate a new two-digit-division quotient with nearby numbers that divide cleanly, then compare the estimate with the exact result.",
    widget: {
      type: "estimateSlider", prompt: "714 ÷ 21 — slide to estimate the quotient before dividing.",
      min: 2, max: 200, start: 2, target: 34, acceptFactor: 2, unitLabel: "groups", ticks: [2, 101, 200],
      lowFeedback: "Too low — 21 groups of 21 already make 441, and 714 needs many more groups.",
      highFeedback: "Too high — 21 × 40 = 840, which is beyond 714.",
      successFeedback: "About 34 — 700 ÷ 20 is about 35, and the exact quotient 714 ÷ 21 is 34."
    }
  }],
  ["g5l-01-02", {
    body: "Transfer the multiple-of-ten shortcut to a different divisor by building an exact route of equal groups.",
    widget: {
      type: "numberLineHop", prompt: "How many 40s fit in 360? Hop by forties.",
      min: 0, max: 400, start: 0, hop: 40, hops: 9, direction: "forward",
      commonLandings: [
        { value: 320, feedback: "Eight hops reach 320; one more forty still fits to make 360." },
        { value: 400, feedback: "Ten hops overshoot 360. Stop after the ninth equal group." }
      ],
      missFeedback: "Nine hops of forty are needed to reach 360.",
      successFeedback: "360 after nine hops — so 360 ÷ 40 = 9, found by counting equal groups of forty.",
      lowFeedback: "Short of the landing — nine hops of forty are needed to reach 360.",
      highFeedback: "Past the landing — nine hops of forty stop exactly on 360."
    }
  }],
  ["g5l-02-01", {
    body: "Choose new convenient partial-quotient batches, then add their group counts to reconstruct a different quotient.",
    widget: {
      type: "barBuilder", prompt: "Count 672 ÷ 28 in batches: build 20 groups, then 4 more, then the total.",
      categories: ["First batch", "Second batch", "Total"], target: [20, 4, 24], maxVal: 26, step: 1,
      successFeedback: "24 groups in all — twenty groups of 28 make 560, four more make 112, and 560 + 112 = 672.",
      partialFeedback: "Build the first batch at 20, the second at 4, and their total at 24.", display: "bar", histogram: false
    }
  }],
  ["g5l-02-02", {
    body: "Locate the first quotient digit by place value in a new division, before any later digit is calculated.",
    widget: {
      type: "estimateSlider", prompt: "Dividing 756 by 27, the first quotient digit sits in the tens place — slide to what it is worth.",
      min: 2, max: 200, start: 2, target: 20, acceptFactor: 2, unitLabel: "groups", ticks: [2, 101, 200],
      lowFeedback: "Too low — the first quotient digit stands for whole tens of groups, not single ones.",
      highFeedback: "Too high — the tens digit is 2, so it represents twenty groups before the ones digit is found.",
      successFeedback: "20 — the leading 2 represents twenty groups of 27, the first place-value batch in 756 ÷ 27."
    }
  }],
  ["g5l-03-01", {
    body: "Adjust a different oversized trial digit and verify that the revised product fits without creating a negative remainder.",
    widget: {
      type: "estimateSlider", prompt: "5 × 26 = 130 overshoots the 119 available — slide to what 4 × 26 gives.",
      min: 5, max: 200, start: 5, target: 104, acceptFactor: 2, unitLabel: "units", ticks: [5, 103, 200],
      lowFeedback: "Too low — four twenty-sixes make 104, so the adjusted product is above one hundred.",
      highFeedback: "Too high — the revised digit is 4, and 4 × 26 is 104, safely below 119.",
      successFeedback: "104 — it fits inside 119 and leaves 15, so lowering the trial digit avoids a negative remainder."
    }
  }],
  ["g5l-03-02", {
    body: "Check a new division by rebuilding the dividend and confirming that the remainder is too small to make another group.",
    widget: {
      type: "estimateSlider", prompt: "Quotient 18, divisor 27, remainder 13 — slide to the dividend it rebuilds.",
      min: 50, max: 2000, start: 50, target: 499, acceptFactor: 2, unitLabel: "units", ticks: [50, 1025, 2000],
      lowFeedback: "Too low — eighteen groups of 27 make 486 before the remainder is added.",
      highFeedback: "Too high — 18 × 27 is 486 and adding the remainder 13 makes only 499.",
      successFeedback: "499 — 18 × 27 + 13 rebuilds the dividend, and 13 is smaller than the divisor 27."
    }
  }],
]);

let figureRemoved = 0;
let figureRebound = 0;
let progressionChanged = 0;

for (const fileName of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, fileName);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  const byId = new Map(lesson.steps.map((step) => [step.id, step]));

  for (const stepId of ["c1", "c2"]) {
    const step = byId.get(stepId);
    if (!step) throw new Error(`${file}/${stepId}: missing concept`);
    const key = `${lesson.id}/${stepId}`;
    const exactFigure = exactFigurePlacements.get(key);
    if (exactFigure) {
      if (step.figure === "count-on-hops") { step.figure = exactFigure; figureRebound += 1; }
      else if (step.figure !== exactFigure) throw new Error(`${file}/${stepId}: expected count-on-hops or ${exactFigure}`);
    } else if (step.figure === "count-on-hops") {
      delete step.figure;
      figureRemoved += 1;
    } else if (step.figure !== undefined) {
      throw new Error(`${file}/${stepId}: expected count-on-hops or no figure`);
    }
  }

  const repair = i2Repairs.get(lesson.id);
  const i2 = byId.get("i2");
  if (!repair || !i2) throw new Error(`${file}: missing i2 repair`);
  if (!sameJson({ body: i2.body, widget: i2.widget }, repair)) {
    if (i2.widget?.type !== repair.widget.type) throw new Error(`${file}/i2: evaluator type changed unexpectedly`);
    i2.body = repair.body;
    i2.widget = repair.widget;
    progressionChanged += 1;
  }

  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, 10].includes(figureRemoved)) throw new Error(`expected 0 or 10 figure removals, got ${figureRemoved}`);
if (![0, 2].includes(figureRebound)) throw new Error(`expected 0 or 2 exact figure rebindings, got ${figureRebound}`);
if (![0, 6].includes(progressionChanged)) throw new Error(`expected 0 or 6 progression changes, got ${progressionChanged}`);

console.log(`S265 long-division-g5: ${figureRemoved} safe figure removals, ${figureRebound} exact figure rebindings, ${progressionChanged} evaluator-preserving progression repairs`);
