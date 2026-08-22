import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/add-subtract-1000-g3/lessons";

// Repairs only generated course-local output. The S195 builder remains untouched.
const exactFigures = new Map([
  ["g3a-01-01:c1", "pv1000-decompose"], ["g3a-01-01:c2", "pv1000-decompose"],
  ["g3a-01-02:c1", "pv1000-trade-ones"], ["g3a-01-02:c2", "pv1000-trade-ones"],
  ["g3a-01-03:c1", "pv1000-decompose"], ["g3a-01-03:c2", "pv1000-decompose"],
  ["g3a-01-04:c1", "pv1000-trade-down"], ["g3a-01-04:c2", "pv1000-trade-down"],
  ["g3a-02-01:c1", "pv1000-cascade-down"], ["g3a-02-01:c2", "pv1000-cascade-down"],

  ["g3a-03-02:c1", "as100-choose-steps"], ["g3a-03-02:c2", "as100-choose-steps"],
]);

const i2Plans = new Map([
  ["g3a-01-01", { type: "baseTenCompose", prompt: "Build 326 + 142 with blocks: 4 flats, 6 rods, 8 cubes.", target: 468, success: "468 — four hundreds, six tens, and eight ones. No column needs a trade." }],
  ["g3a-01-02", { type: "columnCalc", op: "add", a: 286, b: 157, prompt: "286 + 157 = ? Work each column and track both carries.", common: [433, 343] }],
  ["g3a-01-03", { type: "baseTenCompose", prompt: "You have 754. Remove 321: build the 433 left with blocks.", target: 433, success: "433 — four hundreds, three tens, and three ones. Every column can pay without a trade." }],
  ["g3a-01-04", { type: "columnCalc", op: "subtract", a: 631, b: 257, prompt: "631 − 257 = ? Trade from the left before subtracting a short column.", common: [386, 426] }],
  ["g3a-02-01", { type: "columnCalc", op: "subtract", a: 704, b: 358, prompt: "704 − 358 = ? The tens are empty, so trace the trade through zero.", common: [354, 454] }],
  ["g3a-02-02", { type: "numberLineHop", prompt: "Add 300 to 246 on the open line: use three hundred-jumps.", min: 200, max: 600, start: 246, hop: 100, hops: 3, landing: 546 }],
  ["g3a-02-03", { type: "columnCalc", op: "add", a: 397, b: 156, prompt: "Use columns to check the compensation result: 397 + 156 = 553.", common: [543, 453] }],
  ["g3a-03-01", { type: "columnCalc", op: "add", a: 267, b: 358, prompt: "Use inverse addition: does 267 + 358 rebuild the original 625?", common: [615, 525] }],
  ["g3a-03-02", { type: "estimateSlider", prompt: "After a purchase and donation, estimate: 720 − 240 + 80. Slide to the fund total.", min: 100, max: 1600, start: 100, target: 560, ticks: [100, 850, 1600], success: "About 560 — down 240, then up 80, so the fund lands below its starting 720.", low: "Too low — 720 minus 240 leaves 480 before the fund raises 80 more.", high: "Too high — the fund cannot end above where it started after spending more than it raised." }],
  ["g3a-03-03", { type: "columnCalc", op: "subtract", a: 500, b: 298, prompt: "Compare the roads: work 500 − 298 in columns and notice the long borrow chain.", common: [218, 398] }],
]);

const suffixes = {
  k1: "Work place by place.",
  k2: "Use the idea from this lesson.",
  k3: "Name the deciding place-value fact.",
  ch1: "Finish with a fresh situation.",
};

function answerFor(widget) {
  return widget.op === "add" ? widget.a + widget.b : widget.a - widget.b;
}

function repairColumn(widget) {
  const answer = answerFor(widget);
  const symbol = widget.op === "add" ? "+" : "−";
  widget.fallbackFeedback = widget.op === "add"
    ? `Work from ones to hundreds. Regroup only when a place makes ten or more, then check that ${widget.a} ${symbol} ${widget.b} = ${answer}.`
    : `Work from ones to hundreds. Trade from the next place only when the top digit is too small, then check that ${widget.a} ${symbol} ${widget.b} = ${answer}.`;
  widget.successFeedback = `Correct — ${widget.a} ${symbol} ${widget.b} = ${answer}.`;
}

function applyI2Plan(step, plan) {
  if (plan.type === "baseTenCompose") {
    if (step.widget?.type !== "baseTenCompose") throw new Error(`expected baseTenCompose at ${step.id}`);
    step.widget.prompt = plan.prompt;
    step.widget.target = plan.target;
    step.widget.missFeedback = `That build names a different number — total each unit's worth and match ${plan.target} exactly.`;
    step.widget.successFeedback = plan.success;
    return;
  }
  if (plan.type === "columnCalc") {
    if (step.widget?.type !== "columnCalc") throw new Error(`expected columnCalc at ${step.id}`);
    step.widget.prompt = plan.prompt;
    step.widget.op = plan.op;
    step.widget.a = plan.a;
    step.widget.b = plan.b;
    step.widget.commonResults = plan.common.map((value) => ({ value, feedback: "That result does not preserve every place-value move. Recheck each column and every carry or trade." }));
    repairColumn(step.widget);
    return;
  }
  if (plan.type === "numberLineHop") {
    if (step.widget?.type !== "numberLineHop") throw new Error(`expected numberLineHop at ${step.id}`);
    Object.assign(step.widget, { min: plan.min, max: plan.max, start: plan.start, hop: plan.hop, hops: plan.hops, prompt: plan.prompt });
    step.widget.commonLandings = [
      { value: plan.start + 10, feedback: "That moves by tens. Each jump here is 100." },
      { value: plan.start + plan.hop, feedback: "That is only one hundred-jump. Take all three jumps." },
    ];
    step.widget.missFeedback = `Each hop is 100. From ${plan.start}, 3 hops land on ${plan.landing}.`;
    step.widget.successFeedback = `${plan.landing} — three hundred-jumps move the hundreds place while the tens and ones stay put.`;
    return;
  }
  if (plan.type === "estimateSlider") {
    if (step.widget?.type !== "estimateSlider") throw new Error(`expected estimateSlider at ${step.id}`);
    Object.assign(step.widget, { prompt: plan.prompt, min: plan.min, max: plan.max, start: plan.start, target: plan.target, ticks: plan.ticks, successFeedback: plan.success, lowFeedback: plan.low, highFeedback: plan.high });
    return;
  }
  throw new Error(`Unknown i2 plan ${plan.type}`);
}

let figureChanges = 0;
let i2Changes = 0;
let feedbackChanges = 0;
let promptChanges = 0;
for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, name);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  const plan = i2Plans.get(lesson.id);
  if (!plan) throw new Error(`${lesson.id}: missing i2 plan`);
  for (const step of lesson.steps ?? []) {
    const key = `${lesson.id}:${step.id}`;
    const wanted = exactFigures.get(key);
    if (step.id === "c1" || step.id === "c2") {
      if (wanted) {
        if (step.figure !== wanted) { step.figure = wanted; figureChanges += 1; }
      } else if (step.figure !== undefined) { delete step.figure; figureChanges += 1; }
    }
    if (step.id === "i2") {
      const before = JSON.stringify(step.widget);
      applyI2Plan(step, plan);
      if (JSON.stringify(step.widget) !== before) i2Changes += 1;
    }
    if (step.widget?.type === "columnCalc") {
      const before = `${step.widget.fallbackFeedback}\u0000${step.widget.successFeedback}`;
      repairColumn(step.widget);
      if (`${step.widget.fallbackFeedback}\u0000${step.widget.successFeedback}` !== before) feedbackChanges += 1;
    }
    if (step.widget?.type === "baseTenCompose") {
      const expected = `match ${step.widget.target} exactly.`;
      if (!step.widget.missFeedback?.includes(expected)) {
        step.widget.missFeedback = `That build names a different number — total each unit's worth and ${expected}`;
        feedbackChanges += 1;
      }
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
// Four i2 plans repair their column feedback as part of their atomic payload.
// The remaining six columns plus two original base-ten mismatch messages are
// counted in this pass; the source-level total is still 12 column repairs.
if (![0, 8].includes(feedbackChanges)) throw new Error(`expected 0 or 8 direct feedback changes, got ${feedbackChanges}`);
if (![0, 40].includes(promptChanges)) throw new Error(`expected 0 or 40 prompt changes, got ${promptChanges}`);
console.log("S263 add-subtract-1000-g3: 12 exact rebindings + 8 fail-closures + 10 distinct i2 evaluators + 12 false column-feedback repairs sealed");
