import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/decimal-operations/lessons";

// Every flagged figure is a fixed exemplar whose numbers (or operation) conflict
// with the adjacent learner-visible worked example.  There is no exact registered
// replacement, so fail closed rather than teach two incompatible examples at once.
const removals = new Map([
  ["dop-02-02:c1", "dop-standard-algo"],
  ["dop-02-02:c2", "dop-standard-algo"],
  ["dop-02-03:c2", "dop-two-by-two"],
  ["dop-03-01:c2", "dop-estimate-quotient"],
  ["dop-04-02:c1", "dop-pad-borrow"],
  ["dop-04-02:c2", "dop-pad-borrow"],
  ["dop-05-02:c1", "dop-count-places"],
  ["dop-05-02:c2", "dop-estimate-quotient"],
  ["dop-05-03:c1", "dop-count-places"],
]);

const lessonIds = new Set([...removals.keys()].map((key) => key.split(":")[0]));
let changes = 0;
for (const lessonId of lessonIds) {
  const file = path.join(dir, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const step of lesson.steps ?? []) {
    const expected = removals.get(`${lesson.id}:${step.id}`);
    if (!expected) continue;
    if (step.figure === expected) {
      delete step.figure;
      changes += 1;
    } else if (step.figure !== undefined) {
      throw new Error(`${lesson.id}:${step.id}: expected ${expected} or no figure, found ${step.figure}`);
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, removals.size].includes(changes)) throw new Error(`expected 0 or ${removals.size} figure changes, got ${changes}`);
console.log(`S266 decimal-operations: ${removals.size} fixed-exemplar figure mismatches fail-closed`);
