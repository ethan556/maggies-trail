import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/radicals-and-exponents/lessons";

// Generic formula figures are reused only where they state the same relationship
// as the adjacent copy. Fixed-number examples that conflict with learner-visible
// values, or a different operation entirely, fail closed.
const dispositions = new Map([
  ["rad-01-01:c1", undefined],
  ["rad-01-03:c1", undefined],
  ["rad-02-03:c1", undefined],
  ["rad-03-01:c1", "rad-denom-root"],
  ["rad-03-02:c1", "rad-read-fraction"],
  ["rad-03-03:c1", "rad-neg-rational"],
]);

const lessonIds = new Set([...dispositions.keys()].map((key) => key.split(":")[0]));
let figureChanges = 0;
for (const lessonId of lessonIds) {
  const file = path.join(dir, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const step of lesson.steps ?? []) {
    const wanted = dispositions.get(`${lesson.id}:${step.id}`);
    if (!dispositions.has(`${lesson.id}:${step.id}`)) continue;
    if (wanted) {
      if (step.figure !== wanted) {
        step.figure = wanted;
        figureChanges += 1;
      }
    } else if (step.figure !== undefined) {
      delete step.figure;
      figureChanges += 1;
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, dispositions.size].includes(figureChanges)) throw new Error(`expected 0 or ${dispositions.size} figure changes, got ${figureChanges}`);
console.log("S268 radicals-and-exponents: 3 exact generic rebindings + 3 fixed-example fail-closures sealed");
