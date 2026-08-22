import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/decimals-place-value/lessons";

// Each flagged asset is a fixed numeric exemplar with a different decimal or
// rounding target than the adjacent learner-visible text. With no exact sibling
// asset available, remove it rather than imply that its values prove this claim.
const removals = new Map([
  ["dpv-02-02:c1", "dpv-expanded"],
  ["dpv-02-02:c2", "dpv-expanded"],
  ["dpv-02-03:c1", "dpv-words"],
  ["dpv-02-03:c2", "dpv-words"],
  ["dpv-03-01:c2", "dpv-line-up-compare"],
  ["dpv-03-03:c2", "dpv-trailing-zero"],
  ["dpv-04-02:c2", "dpv-round-whole"],
  ["dpv-04-03:c1", "dpv-round-whole"],
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
console.log(`S267 decimals-place-value: ${removals.size} fixed-exemplar mismatches fail-closed`);
