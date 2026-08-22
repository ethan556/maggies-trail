/**
 * S266 — Fractions Multiply source-local visual repair.
 *
 * Every listed placement points to a registered, fixed exemplar whose values
 * differ from the authored explanation. A figure must never contradict the
 * learner-facing mathematics, so this deliberately fails closed: it removes
 * only the mismatched binding and leaves the truthful explanation and its
 * evaluator contract intact. Rebinding is intentionally not attempted because
 * the registry has no parameterised exact equivalent for these examples.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "fractions-multiply", "lessons");

const removals = Object.freeze([
  ["fm-01-02", "c2", "fm-add-unlike"],
  ["fm-01-03", "c1", "fm-subtract-unlike"],
  ["fm-01-03", "c2", "fm-subtract-unlike"],
  ["fm-02-01", "c1", "fm-groups"],
  ["fm-02-01", "c2", "fm-groups"],
  ["fm-02-02", "c2", "fm-fraction-of"],
  ["fm-03-02", "c1", "fm-multiply-across"],
  ["fm-03-03", "c1", "fm-cancel"],
  ["fm-03-03", "c2", "fm-cancel"],
  ["fm-05-01", "c1", "fm-divide-unit"],
  ["fm-05-01", "c2", "fm-divide-unit"],
  ["fm-05-02", "c1", "fm-unit-divide-whole"],
  ["fm-05-02", "c2", "fm-unit-divide-whole"],
  ["fm-05-03", "c1", "fm-divide-unit"],
]);

const byLesson = new Map();
for (const [lessonId, stepId, figureId] of removals) {
  const entries = byLesson.get(lessonId) ?? [];
  entries.push([stepId, figureId]);
  byLesson.set(lessonId, entries);
}

let removed = 0;
for (const [lessonId, entries] of byLesson) {
  const source = path.join(lessonDir, `${lessonId}.json`);
  const lesson = JSON.parse(await readFile(source, "utf8"));
  for (const [stepId, expectedFigure] of entries) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step) throw new Error(`${lessonId}/${stepId}: missing step`);
    if (step.figure === expectedFigure) {
      delete step.figure;
      removed += 1;
    } else if (step.figure !== undefined) {
      throw new Error(`${lessonId}/${stepId}: expected ${expectedFigure}, found ${step.figure}`);
    }
  }
  await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}

if (removed > removals.length) throw new Error(`Guard failed: removed ${removed}, expected at most ${removals.length}`);
console.log(JSON.stringify({ course: "fractions-multiply", removed, expectedRemovals: removals.length, idempotent: removed === 0 }, null, 2));
