import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/place-value-1000/lessons";

// These three figures encode fixed numerical exemplars that are not licensed
// by their surrounding source text. Withhold them until an exact registered
// representation exists; the existing widgets remain the interactive evidence.
const dispositions = [
  { lessonId: "pv1000-02-01", stepId: "c1", source: "skip-count-line" },
  { lessonId: "pv1000-04-02", stepId: "c1", source: "decompose-combine" },
  { lessonId: "pv1000-04-03", stepId: "c2", source: "pv1000-stadium" },
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
console.log("S273 place-value-1000: 3 withheld fixed-exemplar figures fail-closed");
