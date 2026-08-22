import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/two-step-equations/lessons";

// The authoritative fixed-exemplar guards reject these figures: each displays
// different learner-visible quantities from the equation or multiplier copy.
// Withhold them until an exact registered representation exists.
const dispositions = [
  { lessonId: "tse-01-02", stepId: "c2", source: "tse-combine-like" },
  { lessonId: "tse-01b-02", stepId: "c2", source: "pr7-percent-multiplier" },
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
    const item = (lesson.steps ?? []).find((candidate) => candidate?.id === disposition.stepId);
    if (!item) throw new Error(`${lessonId}:${disposition.stepId} is missing`);
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
console.log("S275 two-step-equations: 2 mismatched fixed-exemplar figures fail-closed");
