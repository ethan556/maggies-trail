import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/measure-length-g1/lessons";

// Only these registered figures show the exact concept named by their adjacent copy.
const exactFigures = new Map([
  ["g1m-01-01:c1", "ks-compare-length"],
  ["g1m-01-01:c2", "ks-same-end-fair"],
  ["g1m-01-02:c1", "smg1-three-counts"],
  ["g1m-01-02:c2", "smg1-middle-between"],
]);

const i2Plans = new Map([
  ["g1m-01-01", {
    type: "lengthCompare", prompt: "Slide the red strip to the start line, then tap the longer strip.",
    items: [{ id: "top", label: "red strip", length: 8, startOffset: 2 }, { id: "bottom", label: "blue string", length: 6 }], answerId: "top",
    unalignedFeedback: "The red strip starts ahead, so line up both starting ends before comparing.",
    missFeedback: "Now both strips begin together. Check which far end reaches farther.",
    successFeedback: "Both starts match, and the red strip reaches farther than the blue string."
  }],
  ["g1m-01-02", {
    type: "lengthCompare", prompt: "Use this pair to finish the order: align it, then tap the longer object.",
    items: [{ id: "top", label: "green ribbon", length: 4, startOffset: 1 }, { id: "bottom", label: "orange cord", length: 7 }], answerId: "bottom",
    unalignedFeedback: "The green ribbon starts ahead. Put both starts on the line before ordering the pair.",
    missFeedback: "With matching starts, compare the far ends to place this pair in order.",
    successFeedback: "The orange cord reaches farther, so it belongs above the green ribbon in the order."
  }],
  ["g1m-01-03", {
    type: "lengthCompare", prompt: "Finish the chain: align the string and rod, then tap the longer one.",
    items: [{ id: "top", label: "string", length: 7, startOffset: 2 }, { id: "bottom", label: "rod", length: 5 }], answerId: "top",
    unalignedFeedback: "The string starts ahead. Align its start with the rod before using this link in the chain.",
    missFeedback: "Now the starts match. The farther end tells which link is longer.",
    successFeedback: "The string is longer than the rod, completing the second comparison in the chain."
  }],
  ["g1m-01-04", {
    type: "lengthCompare", prompt: "Test a fresh chain link: align both starts, then tap the longer object.",
    items: [{ id: "top", label: "string", length: 8, startOffset: 1 }, { id: "bottom", label: "rod", length: 3 }], answerId: "top",
    unalignedFeedback: "Do not trust a shifted start. Align both objects before checking this chain link.",
    missFeedback: "Once both starts match, compare the far ends for the true longer object.",
    successFeedback: "The string reaches farther than the rod, so this link keeps the chain pointing one way."
  }],
  ["g1m-02-01", {
    type: "unitRuler", prompt: "Measure a new strip: start at its edge and cover it with five one-unit blocks.",
    objectStart: 1, objectEnd: 6, targetUnitSize: 1, startUnitSize: 2, requiredPlacements: 5,
    successFeedback: "Five equal one-unit blocks cover the strip exactly from start to finish.",
    alignFeedback: "Put zero at the strip's starting edge before placing any blocks.",
    gapOverlapFeedback: "Let every block touch the next one: no spaces and no double-covering.",
    unitFeedback: "Use one size of block all the way along, or the count will not name a length."
  }],
  ["g1m-02-02", {
    type: "unitRuler", prompt: "Make this measurement trustworthy: cover the cord with seven touching one-unit blocks.",
    objectStart: 2, objectEnd: 9, targetUnitSize: 1, startUnitSize: 2, requiredPlacements: 7,
    successFeedback: "Seven touching one-unit blocks cover the cord, so no length is missed or counted twice.",
    alignFeedback: "Start at the cord's first edge, not at a number farther along the ruler.",
    gapOverlapFeedback: "Close every space and keep blocks from sitting on the same part of the cord.",
    unitFeedback: "Keep every block the same size so each count means the same amount of length."
  }],
  ["g1m-02-03", {
    type: "unitRuler", prompt: "Count a fresh path: cover it from 3 to 9 with six one-unit blocks.",
    objectStart: 3, objectEnd: 9, targetUnitSize: 1, startUnitSize: 2, requiredPlacements: 6,
    successFeedback: "Six equal blocks cover the path, so its measurement is six units.",
    alignFeedback: "Line zero up with the path's starting edge before you begin counting.",
    gapOverlapFeedback: "The blocks must meet end to end; a gap misses length and an overlap counts it twice.",
    unitFeedback: "Choose one unit size and keep it for every block in this measurement."
  }],
  ["g1m-03-01", {
    type: "unitRuler", prompt: "Measure a new cube train: six identical one-unit cubes cover it end to end.",
    objectStart: 2, objectEnd: 8, targetUnitSize: 1, startUnitSize: 2, requiredPlacements: 6,
    successFeedback: "Six identical cubes cover the train exactly, so its length is six cubes.",
    alignFeedback: "Begin at the train's first edge so the cubes cover every part of its length.",
    gapOverlapFeedback: "Cubes must touch without spaces or overlaps for the count to be true.",
    unitFeedback: "Every cube must be the same size before its count can measure a length."
  }],
  ["g1m-03-02", {
    type: "unitRuler", prompt: "Use long units this time: four two-unit clips cover the path from 2 to 10.",
    objectStart: 2, objectEnd: 10, targetUnitSize: 2, startUnitSize: 1, requiredPlacements: 4,
    successFeedback: "Four equal two-unit clips cover the path exactly, so the count is four long units.",
    alignFeedback: "Start the first long unit at the path's first edge before measuring.",
    gapOverlapFeedback: "Long units still have to touch end to end with no gaps or overlaps.",
    unitFeedback: "Use the same long unit every time so the count has one clear meaning."
  }],
  ["g1m-03-03", {
    type: "unitRuler", prompt: "Measure another rope with long units: three two-unit blocks cover it from 1 to 7.",
    objectStart: 1, objectEnd: 7, targetUnitSize: 2, startUnitSize: 1, requiredPlacements: 3,
    successFeedback: "Three two-unit blocks cover this rope exactly. Bigger units give a smaller count for the same kind of length.",
    alignFeedback: "Line the first long block up with the rope's starting edge before counting.",
    gapOverlapFeedback: "Keep each long block touching the next so the rope is covered once, without spaces.",
    unitFeedback: "Every long block needs the same size, or their count cannot measure one length."
  }],
]);

const suffixes = {
  k1: "Choose the key measurement idea.",
  k2: "Show the comparison result.",
  k3: "Use a fresh measurement clue.",
  ch1: "Finish with a new object.",
};

function applyI2Plan(step, plan) {
  if (step.widget?.type !== plan.type) throw new Error(`${step.id}: expected ${plan.type}`);
  if (plan.type === "lengthCompare") {
    Object.assign(step.widget, plan);
    return;
  }
  if (plan.type === "unitRuler") {
    Object.assign(step.widget, {
      prompt: plan.prompt,
      objectStart: plan.objectStart,
      objectEnd: plan.objectEnd,
      allowedUnitSizes: [1, 2],
      targetUnitSize: plan.targetUnitSize,
      startUnitSize: plan.startUnitSize,
      requiredPlacements: plan.requiredPlacements,
      successFeedback: plan.successFeedback,
      alignFeedback: plan.alignFeedback,
      gapOverlapFeedback: plan.gapOverlapFeedback,
      unitFeedback: plan.unitFeedback,
    });
    return;
  }
  throw new Error(`Unsupported i2 plan type ${plan.type}`);
}

const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
if (files.length !== 10 || i2Plans.size !== 10) throw new Error("S264 expects the clean ten-lesson course");
let figureChanges = 0;
let i2Changes = 0;
let promptChanges = 0;
for (const name of files) {
  const file = path.join(dir, name);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  const plan = i2Plans.get(lesson.id);
  if (!plan) throw new Error(`${lesson.id}: missing i2 plan`);
  for (const step of lesson.steps ?? []) {
    if (step.id === "c1" || step.id === "c2") {
      const wanted = exactFigures.get(`${lesson.id}:${step.id}`);
      if (wanted) {
        if (step.figure !== wanted) { step.figure = wanted; figureChanges += 1; }
      } else if (step.figure !== undefined) {
        delete step.figure;
        figureChanges += 1;
      }
    }
    if (step.id === "i2") {
      const before = JSON.stringify(step.widget);
      applyI2Plan(step, plan);
      if (JSON.stringify(step.widget) !== before) i2Changes += 1;
    }
    if (suffixes[step.id] && step.widget?.prompt && !step.widget.prompt.endsWith(suffixes[step.id])) {
      step.widget.prompt = `${step.widget.prompt} ${suffixes[step.id]}`;
      promptChanges += 1;
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, 20].includes(figureChanges)) throw new Error(`expected 0 or 20 figure changes, got ${figureChanges}`);
if (![0, 10].includes(i2Changes)) throw new Error(`expected 0 or 10 i2 changes, got ${i2Changes}`);
if (![0, 40].includes(promptChanges)) throw new Error(`expected 0 or 40 prompt changes, got ${promptChanges}`);
console.log("S264 measure-length-g1: 4 exact rebindings + 16 fail-closures + 10 distinct i2 evaluators sealed");