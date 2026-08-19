import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/expressions-patterns-g5/lessons";

const exactFigures = new Map([
  ["g5e-01-01:c1", "dop-precedence"],
  ["g5e-01-01:c2", "dop-precedence"],
  ["g5e-01-04:c1", "dop-precedence"],
  ["g5e-01-04:c2", "dop-precedence"],
  ["g5e-02-01:c1", "dop-word-expr"],
  ["g5e-02-02:c1", "ee-read-aloud-tree"],
  ["g5e-03-02:c1", "cg-pair-terms"],
  ["g5e-03-02:c2", "cg-pair-terms"],
  ["g5e-03-03:c1", "cg-line-up"],
  ["g5e-03-03:c2", "cg-line-up"],
  ["g5e-03-04:c1", "cg-pair-terms"],
]);

const operationPlan = {
  type: "mcq",
  prompt: "Which plan evaluates 7 × 8 − 30 correctly?",
  options: [
    { id: "o0", label: "Multiply 7 by 8, then subtract 30", correct: true, feedback: "Correct — multiplication makes 56 first, and then 30 is removed." },
    { id: "o1", label: "Subtract 30 from 8, then multiply by 7", correct: false, feedback: "That changes the grouping. The product 7 × 8 must be completed before the subtraction." },
    { id: "o2", label: "Add 8 and 30, then multiply by 7", correct: false, feedback: "The expression contains subtraction, not addition, and multiplication has priority." },
    { id: "o3", label: "Subtract 7 from 30, then multiply by 8", correct: false, feedback: "That reverses the subtraction and moves it ahead of the product." },
  ],
};

const structuralReason = {
  type: "mcq",
  prompt: "Which explanation proves that 'add 12' makes three times the matching terms of 'add 4' when both rules start at 0?",
  options: [
    { id: "o0", label: "Each 12-step equals three 4-steps, and both rules start at 0", correct: true, feedback: "Correct — the 3-to-1 step-size ratio and the shared zero start force every matching pair to have the same factor." },
    { id: "o1", label: "The first pair happens to be 4 and 12", correct: false, feedback: "One matching pair is evidence, but it does not explain why every later pair must follow." },
    { id: "o2", label: "The two rules both use even numbers", correct: false, feedback: "Being even does not create a factor of 3; the step sizes and shared start do." },
    { id: "o3", label: "The gap between the rules stays equal to 8", correct: false, feedback: "The gap grows at every step. The ratio stays fixed, not the difference." },
  ],
};

const parityLabels = new Map([
  ["o0", "Each B term is 2 times the matching A term"],
  ["o1", "Each B term is 3 more than the matching A term"],
  ["o2", "Each B term is equal to the matching A term"],
  ["o3", "Each B term has no fixed link to the matching A term"],
]);

let figureChanges = 0;
let progressionChanges = 0;
let choiceChanges = 0;

for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, name);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const step of lesson.steps ?? []) {
    const key = `${lesson.id}:${step.id}`;
    const wanted = exactFigures.get(key);
    if (step.figure === "count-on-hops") {
      if (wanted) step.figure = wanted;
      else delete step.figure;
      figureChanges += 1;
    } else if (wanted && step.figure !== wanted) {
      throw new Error(`${file}/${step.id}: expected ${wanted}, found ${step.figure ?? "no figure"}`);
    }

    if (lesson.id === "g5e-01-04" && step.id === "i2") {
      const already = step.widget?.type === "mcq" && step.widget?.prompt === operationPlan.prompt;
      if (!already) {
        if (step.widget?.type !== "estimateSlider" || step.widget?.target !== 26) throw new Error(`${file}/i2: unexpected progression source`);
        step.body = "Choose the valid operation plan before computing.";
        step.widget = operationPlan;
        progressionChanges += 1;
      }
    }

    if (lesson.id === "g5e-03-05" && step.id === "i2") {
      const already = step.widget?.type === "mcq" && step.widget?.prompt === structuralReason.prompt;
      if (!already) {
        if (step.widget?.type !== "barBuilder" || step.widget?.target?.join(",") !== "4,8,12,16") throw new Error(`${file}/i2: unexpected progression source`);
        step.body = "Select the structural reason; do not build another term table.";
        step.widget = structuralReason;
        progressionChanges += 1;
      }
    }

    if (lesson.id === "g5e-03-01" && step.id === "k3") {
      if (step.widget?.type !== "mcq") throw new Error(`${file}/k3: expected MCQ`);
      for (const option of step.widget.options ?? []) {
        const wantedLabel = parityLabels.get(option.id);
        if (!wantedLabel) throw new Error(`${file}/k3: unexpected option ${option.id}`);
        if (option.label !== wantedLabel) {
          option.label = wantedLabel;
          choiceChanges += 1;
        }
      }
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, 24].includes(figureChanges)) throw new Error(`expected 0 or 24 figure changes, got ${figureChanges}`);
if (![0, 2].includes(progressionChanges)) throw new Error(`expected 0 or 2 progression changes, got ${progressionChanges}`);
if (![0, 1, 4].includes(choiceChanges)) throw new Error(`expected 0, 1, or 4 option-label changes, got ${choiceChanges}`);

console.log("S261 expressions-patterns-g5: 11 exact rebindings + 13 fail-closures + 2 progression repairs + 1 choice-surface repair sealed");
