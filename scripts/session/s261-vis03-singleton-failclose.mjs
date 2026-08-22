import fs from "node:fs";

const repairs = [
  ["content/courses/coordinate-proofs/lessons/cx-02-03.json", "c1", "perpendicular-rotation"],
  ["content/courses/data-line-plots-g2/lessons/g2g-03-01.json", "c2", "single-scale-graph"],
  ["content/courses/exponents-polynomials/lessons/ep-01-03.json", "c1", "exponent-repeat"],
  ["content/courses/expressions-equations/lessons/ee-01-02.json", "c2", "ee-eval-power"],
  ["content/courses/expressions-equations/lessons/ee-04-03.json", "c1", "ee-mult-div-solve"],
  ["content/courses/function-transformations/lessons/ft-04-03.json", "c1", "composition-chain"],
];

for (const [file, stepId, staleFigure] of repairs) {
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  const step = lesson.steps.find((item) => item.id === stepId);
  if (!step) throw new Error(`${file}: missing ${stepId}`);
  if (step.figure === staleFigure) delete step.figure;
  else if (step.figure !== undefined) throw new Error(`${file}/${stepId}: unexpected ${step.figure}`);
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

console.log(`S261 VIS-03 singleton fail-close: ${repairs.length} placements`);
