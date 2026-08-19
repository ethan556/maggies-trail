/** S284 — source-local Grade 5 fractions-add figure-exact repair. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "fractions-add", "lessons");
const check = process.argv.includes("--check");

const changes = Object.freeze([
  ["fa-01-02", "c1", "fa-multiplier", "fm-common-denom"],
  ["fa-03-01", "c1", "fa-add-like", null],
  ["fa-03-01", "c2", "fa-add-like", null],
  ["fa-03-02", "c1", "fa-subtract-like", null],
  ["fa-03-02", "c2", "fa-subtract-like", null],
  ["fa-04-01", "c1", "fa-improper-mixed", null],
  ["fa-04-01", "c2", "fa-improper-mixed", null],
  ["fa-04-02", "c1", "fa-mixed-improper", null],
  ["fa-04-03", "c1", "fa-improper-mixed", null],
  ["fa-04-03", "c2", "fa-mixed-improper", null],
  ["fa-05-01", "c1", "fa-repeated-add", null],
  ["fa-05-01", "c2", "fa-repeated-add", null],
  ["fa-05-02", "c1", "fa-repeated-add", null],
]);

const byLesson = new Map();
for (const entry of changes) {
  const [lessonId] = entry;
  const entries = byLesson.get(lessonId) ?? [];
  entries.push(entry);
  byLesson.set(lessonId, entries);
}

let repaired = 0;
for (const [lessonId, entries] of byLesson) {
  const sourcePath = path.join(lessonDir, `${lessonId}.json`);
  const source = await readFile(sourcePath, "utf8");
  const lesson = JSON.parse(source);
  let changed = false;
  for (const [, stepId, before, after] of entries) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`missing ${lessonId}/${stepId}`);
    const current = step.figure ?? null;
    if (current !== before && current !== after) {
      throw new Error(`${lessonId}/${stepId}: expected ${before} or ${after}, found ${current}`);
    }
    if (current === after) continue;
    if (after === null) delete step.figure;
    else step.figure = after;
    repaired += 1;
    changed = true;
  }
  if (changed) {
    if (check) throw new Error(`${lessonId}: repair required in --check mode`);
    const indent = source.match(/^\{\r?\n( +)"id":/m)?.[1]?.length ?? 2;
    await writeFile(sourcePath, `${JSON.stringify(lesson, null, indent)}\n`, "utf8");
  }
}

if (repaired > changes.length) throw new Error(`repair count ${repaired} exceeds ${changes.length}`);
console.log(JSON.stringify({ course: "fractions-add", sourceRows: changes.length, repaired, current: repaired === 0 }, null, 2));
