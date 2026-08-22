import fs from "node:fs";

const repairs = [
  ["fractions-add", "fa-03-03", "c2", "fa-add-like"],
  ["number-system", "ns-03-03", "c2", "ns-factor-distribute"],
  ["number-system", "ns-05-01", "c2", "absolute-value-arcs"],
  ["number-system", "ns-05-02", "c1", "ns-abs-compare"],
  ["place-value", "pv-03-02", "c2", "pv3-regroup"],
  ["proportional-relationships", "pr-04-01", "c2", "pr-percent-shortcut"],
  ["right-triangles-trig", "rt-01-04", "c2", "rt-30-60-90"],
  ["sequences-series", "sr-03-01", "c1", "gauss-pairing"],
  ["transformations-measurement", "tm-03-03", "c2", "angle-types"],
  ["trig-functions", "tf-03-01", "c1", "unit-circle-reference"],
  ["volume-measurement", "vm-05-02", "c2", "l-solid-cuts"],
];

for (const [course, lessonId, stepId, staleFigure] of repairs) {
  const file = `content/courses/${course}/lessons/${lessonId}.json`;
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  const step = lesson.steps.find((item) => item.id === stepId);
  if (!step) throw new Error(`${file}: missing ${stepId}`);
  if (step.figure === staleFigure) delete step.figure;
  else if (step.figure !== undefined) throw new Error(`${file}/${stepId}: unexpected ${step.figure}`);
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}
console.log(`S261 VIS-03 singleton fail-close B: ${repairs.length} placements`);
