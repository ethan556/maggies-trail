import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/volume-problems-g5/lessons";

// These registered figures state only the adjacent concept; fixed-number figures
// are intentionally withheld unless their values exactly match the lesson copy.
const exactFigures = new Map([
  ["g5v-01-01:c1", "vm-cube-unit"],
  ["g5v-01-01:c2", "vm-count-cubes"],
  ["g5v-01-02:c1", "vm-slice-layers"],
  ["g5v-02-01:c1", "vm-formula-lwh"],
  ["g5v-02-01:c2", "vm-count-cubes"],
  ["g5v-02-02:c1", "vm-base-height"],
  ["g5v-02-02:c2", "vm-base-height"],
  ["g5v-03-02:c1", "vm-formula-lwh"],
]);

const i2Plans = new Map([
  ["g5v-01-01", {
    type: "areaModel", prompt: "Build a new base layer: make a 3-by-6 rectangle of unit cubes.",
    targetArea: 18, wMax: 6, hMax: 6, wStart: 1, hStart: 1, square: false, requireFactors: { w: 3, h: 6 },
    successFeedback: "18 cubes fill this one layer. Repeating that complete layer creates a volume.",
    lowFeedback: "That is fewer than 18 cubes. Build until the base is 3 by 6.",
    highFeedback: "That is more than 18 cubes. Keep the base at 3 by 6.",
    factorFeedback: "That area is correct from another pair of factors, but this base must be 3 across and 6 deep.",
  }],
  ["g5v-01-02", {
    type: "barBuilder", prompt: "Build three identical layers of 15 cubes each.",
    categories: ["Layer 1", "Layer 2", "Layer 3"], target: [15, 15, 15], maxVal: 18, step: 1, display: "bar", histogram: false,
    successFeedback: "45 cubes: three complete copies of the 15-cube base.",
    partialFeedback: "Each layer copies the same base, so build every bar to 15.",
  }],
  ["g5v-02-01", {
    type: "areaModel", prompt: "Build the l times w layer for a 3-by-7 base.",
    targetArea: 21, wMax: 7, hMax: 7, wStart: 1, hStart: 1, square: false, requireFactors: { w: 3, h: 7 },
    successFeedback: "21 cubes make one layer. Height repeats this layer to form the volume.",
    lowFeedback: "That base has fewer than 21 cubes. Build it to 3 by 7.",
    highFeedback: "That base has more than 21 cubes. Keep the sides at 3 and 7.",
    factorFeedback: "The area matches, but this formula layer must be 3 across and 7 deep.",
  }],
  ["g5v-02-02", {
    type: "estimateSlider", prompt: "Use B times h: a base of 9 square units, 4 layers tall — slide to the volume.",
    min: 4, max: 180, start: 4, target: 36, acceptFactor: 2, unitLabel: "cubes", ticks: [4, 92, 180],
    lowFeedback: "Too low — four copies of a 9-square-unit base make 36 cubes.",
    highFeedback: "Too high — the base is repeated four times, not dozens of times.",
    successFeedback: "36 — B times h means 9 cubes in each of 4 complete layers.",
  }],
  ["g5v-02-03", {
    type: "estimateSlider", prompt: "Recover the missing height: volume 80 cubes with a base of 20 — slide to the height.",
    min: 1, max: 24, start: 1, target: 4, acceptFactor: 2, unitLabel: "layers", ticks: [1, 12, 24],
    lowFeedback: "Too low — four layers of 20 are needed to make 80 cubes.",
    highFeedback: "Too high — more than four 20-cube layers would pass 80.",
    successFeedback: "4 — 80 divided by 20 tells how many complete base-layers fit.",
  }],
  ["g5v-03-01", {
    type: "barBuilder", prompt: "Build a 4-by-7 full block as four layers of 7, before removing a notch of 6.",
    categories: ["L1", "L2", "L3", "L4"], target: [7, 7, 7, 7], maxVal: 9, step: 1, display: "bar", histogram: false,
    successFeedback: "28 cubes fill the block; remove the 6-cube notch once to leave 22.",
    partialFeedback: "The full block has four equal layers, so build each bar to 7 before subtracting the notch.",
  }],
  ["g5v-03-02", {
    type: "estimateSlider", prompt: "A crate is 6 m by 3 m at the base and 2 m deep — slide to its volume.",
    min: 1, max: 120, start: 1, target: 36, acceptFactor: 2, unitLabel: "cubic metres", ticks: [1, 61, 120],
    lowFeedback: "Too low — the base is 18 square metres and two complete layers make 36 cubic metres.",
    highFeedback: "Too high — 18 square metres repeated twice is 36, not the hundreds.",
    successFeedback: "36 — find the 18-square-metre base, then use the depth of 2.",
  }],
  ["g5v-03-03", {
    type: "estimateSlider", prompt: "Solid C has base 14 and height 4; solid D has base 7 and height 8. Slide to C's volume.",
    min: 1, max: 160, start: 1, target: 56, acceptFactor: 2, unitLabel: "cubes", ticks: [1, 81, 160],
    lowFeedback: "Too low — four layers of 14 already make 56 cubes.",
    highFeedback: "Too high — 14 repeated four times is 56, and D also has 56 cubes.",
    successFeedback: "56 — both C and D have the same volume even though their dimensions differ.",
  }],
]);

const suffixes = {
  k1: "Choose a new reason.",
  k2: "Calculate this fresh case.",
  k3: "Use a different check.",
  ch1: "Finish with a final case.",
};

function applyI2Plan(step, plan) {
  if (step.widget?.type !== plan.type) throw new Error(`${step.id}: expected ${plan.type}`);
  Object.assign(step.widget, plan);
}

const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
if (files.length !== 8 || i2Plans.size !== 8) throw new Error("S265 expects the clean eight-lesson course");
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

if (![0, 16].includes(figureChanges)) throw new Error(`expected 0 or 16 figure changes, got ${figureChanges}`);
if (![0, 8].includes(i2Changes)) throw new Error(`expected 0 or 8 i2 changes, got ${i2Changes}`);
if (![0, 32].includes(promptChanges)) throw new Error(`expected 0 or 32 prompt changes, got ${promptChanges}`);
console.log("S265 volume-problems-g5: 8 exact rebindings + 8 fail-closures + 8 distinct i2 evaluators sealed");
