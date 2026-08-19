import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/parametric-polar-calculus/lessons";

// dr-chain-gears fixes a numerical *multiplication* chain (3 × 5 = 15).
// It cannot evidence parametric derivative division, a second-derivative
// procedure, or perpendicular acceleration. Each queue-listed occurrence is
// therefore withheld rather than shown beside an incompatible relationship.
const dispositions = [
  { lessonId: "pc-01-01", location: "step", stepId: "c1", source: "dr-chain-gears" },
  { lessonId: "pc-01-01", location: "step", stepId: "c2", source: "dr-chain-gears" },
  { lessonId: "pc-01-01", location: "remedial", stepId: "rc1", source: "dr-chain-gears" },
  { lessonId: "pc-03-01", location: "step", stepId: "c2", source: "dr-chain-gears" },
];

const byLesson = new Map();
for (const disposition of dispositions) {
  const entries = byLesson.get(disposition.lessonId) ?? [];
  entries.push(disposition);
  byLesson.set(disposition.lessonId, entries);
}

let figureChanges = 0;
let seen = 0;
for (const [lessonId, entries] of byLesson) {
  const file = path.join(dir, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const disposition of entries) {
    const candidates = disposition.location === "step"
      ? lesson.steps ?? []
      : (lesson.remedials ?? []).map((remedial) => remedial.concept);
    const item = candidates.find((candidate) => candidate?.id === disposition.stepId);
    if (!item) throw new Error(`${lessonId}:${disposition.location}:${disposition.stepId} is missing`);
    seen += 1;
    if (item.figure === undefined) continue;
    if (item.figure !== disposition.source) {
      throw new Error(`${lessonId}:${disposition.stepId} has unexpected figure ${JSON.stringify(item.figure)}`);
    }
    delete item.figure;
    changed = true;
    figureChanges += 1;
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (seen !== dispositions.length) throw new Error(`expected ${dispositions.length} dispositions, found ${seen}`);
if (![0, dispositions.length].includes(figureChanges)) {
  throw new Error(`expected 0 or ${dispositions.length} figure changes, got ${figureChanges}`);
}
console.log("S271 parametric-polar-calculus: 4 incompatible chain-gear figures fail-closed");
