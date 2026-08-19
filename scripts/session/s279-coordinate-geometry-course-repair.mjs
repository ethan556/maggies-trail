import fs from "node:fs";
import path from "node:path";

const dir = path.join("content", "courses", "coordinate-geometry", "lessons");

function updateExact(value, legacy, expected, label) {
  if (value === expected) return false;
  if (value !== legacy) throw new Error(`${label} has unexpected source; refusing an unreviewed overwrite`);
  return true;
}

const quadrilateralFile = path.join(dir, "cg-03-02.json");
const quadrilateralSource = fs.readFileSync(quadrilateralFile, "utf8");
const quadrilateral = JSON.parse(quadrilateralSource);
const trapezoidCheck = quadrilateral.steps?.find((step) => step.id === "k2");
if (!trapezoidCheck || trapezoidCheck.widget?.type !== "mcq") throw new Error("cg-03-02/k2 is missing");
const optionById = new Map(trapezoidCheck.widget.options.map((option) => [option.id, option]));
for (const [id, correct] of [["a", true], ["b", false], ["c", false]]) {
  if (optionById.get(id)?.correct === true !== correct) throw new Error(`cg-03-02/k2/${id} correctness changed`);
}
const choiceRepairs = [
  ["b", "Yes — it has parallel sides", "Yes — parallel sides mean it still counts as a trapezoid"],
  ["c", "Only if its sides are equal", "Only if all its sides are equal, so it is a rhombus"],
];
let quadrilateralChanged = false;
for (const [id, legacy, expected] of choiceRepairs) {
  const option = optionById.get(id);
  if (!option) throw new Error(`cg-03-02/k2/${id} is missing`);
  if (updateExact(option.label, legacy, expected, `cg-03-02/k2/${id}`)) {
    option.label = expected;
    quadrilateralChanged = true;
  }
}
if (quadrilateralChanged) {
  const indent = quadrilateralSource.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(quadrilateralFile, `${JSON.stringify(quadrilateral, null, indent)}\n`);
}

const plottingFile = path.join(dir, "cg-01-02.json");
const plottingSource = fs.readFileSync(plottingFile, "utf8");
const plotting = JSON.parse(plottingSource);
const verticalCheck = plotting.steps?.find((step) => step.id === "k3");
if (!verticalCheck || verticalCheck.widget?.type !== "pointSetReasoningLab") throw new Error("cg-01-02/k3 is missing");
if (verticalCheck.widget.answerMode !== "numeric" || verticalCheck.widget.task !== "axisDistance") {
  throw new Error("cg-01-02/k3 evaluator contract changed");
}
const verticalRepairs = [
  [verticalCheck, "body", "A vertical measure.", "Audit a vertical distance claim."],
  [verticalCheck.widget, "prompt", "How many units long is the segment from (4, 1) to (4, 6)?", "A classmate says the segment from (4, 1) to (4, 6) is 5 units long. Use the evidence to decide the length."],
  [verticalCheck.widget, "successFeedback", "Same x-number, so the length is 6 − 1 = 5 units.", "The claim checks out: same x-number, so 6 − 1 = 5 units."],
  [verticalCheck.widget, "fallbackFeedback", "Same x-number, so the length is 6 − 1 = 5 units.", "Check the claim by subtracting heights: 6 − 1 = 5 units."],
];
let plottingChanged = false;
for (const [object, key, legacy, expected] of verticalRepairs) {
  if (updateExact(object[key], legacy, expected, `cg-01-02/k3/${key}`)) {
    object[key] = expected;
    plottingChanged = true;
  }
}
if (plottingChanged) {
  const indent = plottingSource.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(plottingFile, `${JSON.stringify(plotting, null, indent)}\n`);
}

console.log("S279 coordinate-geometry: one option-parity and one evidence-based progression repair sealed");
