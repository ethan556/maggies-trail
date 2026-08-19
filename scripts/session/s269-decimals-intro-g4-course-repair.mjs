import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/decimals-intro-g4/lessons";

// The registered dpv-hundredths-grid is a fixed 0.1-and-0.01 orientation
// diagram. Every queue-listed slot names a different exact quantity, so no
// registered visual can truthfully accompany it. Remove it rather than let a
// learner infer that the fixed shading represents the neighbouring text.
const dispositions = new Map([
  ["dg4-01-01:c2", undefined],
  ["dg4-01-02:c2", undefined],
  ["dg4-01-06:c2", undefined],
  ["dg4-02-01:c2", undefined],
  ["dg4-02-02:c2", undefined],
  ["dg4-02-03:c2", undefined],
  ["dg4-02-04:c1", undefined],
  ["dg4-02-04:c2", undefined],
  ["dg4-02-05:c2", undefined],
  ["dg4-03-01:c1", undefined],
  ["dg4-03-01:c2", undefined],
  ["dg4-03-02:c2", undefined],
  ["dg4-03-03:c1", undefined],
  ["dg4-03-04:c2", undefined],
  ["dg4-03-05:c2", undefined],
  ["dg4-03-06:c2", undefined],
]);

const lessonIds = new Set([...dispositions.keys()].map((key) => key.split(":")[0]));
let figureChanges = 0;
for (const lessonId of lessonIds) {
  const file = path.join(dir, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const step of lesson.steps ?? []) {
    const key = `${lesson.id}:${step.id}`;
    if (!dispositions.has(key)) continue;
    if (step.figure === undefined) continue;
    if (step.figure !== "dpv-hundredths-grid") {
      throw new Error(`${key} has unexpected figure ${JSON.stringify(step.figure)}`);
    }
    delete step.figure;
    changed = true;
    figureChanges += 1;
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, dispositions.size].includes(figureChanges)) {
  throw new Error(`expected 0 or ${dispositions.size} figure changes, got ${figureChanges}`);
}
console.log("S269 decimals-intro-g4: 16 fixed-number visual mismatches fail-closed");