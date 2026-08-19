/** S260 guarded repair for the seven authored RNO fixed-figure mismatches. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const COURSE = join(ROOT, "content", "courses", "rational-number-operations", "lessons");

const REPAIRS = [
  ["rno-01-01", "c1", "integer-jump", "rno7-add-same-line"],
  ["rno-01-01", "c2", "integer-jump", "rno7-add-same-line"],
  ["rno-02-01", "c1", "integer-jump", "rno7-subtract-opposite-five-three"],
  ["rno-02-02", "c1", "integer-jump", "rno7-change-rise-line"],
  ["rno-02-03", "c3", "rno-add-opposite", "rno7-subtract-negative"],
  ["rno-04-02", "c1", "integer-jump", "rno7-signed-decimal-addition"],
  ["rno-04-02", "c2", "rno-add-opposite", "rno7-signed-decimal"],
];

const byLesson = new Map();
for (const repair of REPAIRS) {
  const [lesson] = repair;
  byLesson.set(lesson, [...(byLesson.get(lesson) ?? []), repair]);
}

let changed = 0;
for (const [lessonId, repairs] of byLesson) {
  const path = join(COURSE, `${lessonId}.json`);
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  let lessonChanged = false;
  for (const [, stepId, before, after] of repairs) {
    const step = lesson.steps?.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`${lessonId}/${stepId}: step absent`);
    if (step.figure === after) continue;
    if (step.figure !== before) throw new Error(`${lessonId}/${stepId}: expected ${before} or ${after}, found ${String(step.figure)}`);
    if (CHECK) throw new Error(`${lessonId}/${stepId}: repair pending ${before} -> ${after}`);
    step.figure = after;
    lessonChanged = true;
    changed += 1;
  }
  if (lessonChanged) writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
}

console.log(`S260 RNO figure parity: ${CHECK ? "CURRENT" : `applied ${changed} binding repairs`} (${REPAIRS.length} guarded rows)`);
