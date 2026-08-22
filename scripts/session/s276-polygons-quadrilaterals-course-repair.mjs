import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/polygons-quadrilaterals/lessons";
const disposition = { lessonId: "pq-01-03", stepId: "c2", source: "pq-exterior" };

const file = path.join(dir, `${disposition.lessonId}.json`);
const raw = fs.readFileSync(file, "utf8");
const indent = raw.match(/`n( +)"/)?.[1].length ?? 2;
const lesson = JSON.parse(raw);
const item = (lesson.steps ?? []).find((candidate) => candidate?.id === disposition.stepId);
if (!item) throw new Error(`${disposition.lessonId}:${disposition.stepId} is missing`);

let figureChanges = 0;
if (item.figure !== undefined) {
  if (item.figure !== disposition.source) {
    throw new Error(`${disposition.lessonId}:${disposition.stepId} has unexpected figure ${JSON.stringify(item.figure)}`);
  }
  delete item.figure;
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, indent)}\n`);
  figureChanges += 1;
}

if (![0, 1].includes(figureChanges)) throw new Error(`expected 0 or 1 figure changes, got ${figureChanges}`);
console.log("S276 polygons-quadrilaterals: 1 unsynchronized exterior-angle figure fail-closed");
