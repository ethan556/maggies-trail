import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/exponential-functions/lessons";
const disposition = {
  lessonId: "exp-02-03",
  stepId: "c3",
  figure: "exp-decay-50",
  sourceSignatures: ["Losing 50% from 80", "D(x) = 80 · (1/2)ˣ", "80, 40, 20"],
};

const file = path.join(dir, `${disposition.lessonId}.json`);
const raw = fs.readFileSync(file, "utf8");
const indent = raw.match(/\n( +)"/)?.[1].length ?? 2;
const lesson = JSON.parse(raw);
const item = (lesson.steps ?? []).find((candidate) => candidate?.id === disposition.stepId);
if (!item) throw new Error(`${disposition.lessonId}:${disposition.stepId} is missing`);
if (typeof item.body !== "string" || !disposition.sourceSignatures.every((signature) => item.body.includes(signature))) {
  throw new Error(`${disposition.lessonId}:${disposition.stepId} no longer has the exact verified decay contract`);
}

let figureChanges = 0;
if (item.figure === undefined) {
  item.figure = disposition.figure;
  fs.writeFileSync(file, `${JSON.stringify(lesson, null, indent)}\n`);
  figureChanges += 1;
} else if (item.figure !== disposition.figure) {
  throw new Error(`${disposition.lessonId}:${disposition.stepId} has unexpected figure ${JSON.stringify(item.figure)}`);
}

if (![0, 1].includes(figureChanges)) throw new Error(`expected 0 or 1 figure changes, got ${figureChanges}`);
console.log("S279 exponential-functions: exact generic decay-rate visual retained and guarded");
