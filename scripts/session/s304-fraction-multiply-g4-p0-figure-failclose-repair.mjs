import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "fraction-multiply-g4", "lessons");
const checkOnly = process.argv.includes("--check");

const repairs = [
  ["g4x-01-01", "step", "c1", "fa-repeated-add"], ["g4x-01-01", "step", "c2", "fa-add-like"],
  ["g4x-01-02", "step", "c1", "fa-repeated-add"], ["g4x-01-02", "step", "c2", "fm-groups"], ["g4x-01-02", "remedial", "concept", "fm-groups"],
  ["g4x-01-03", "step", "c1", "frac-unit-fourth"], ["g4x-01-03", "step", "c2", "fa-repeated-add"],
  ["g4x-01-04", "remedial", "concept", "fa-repeated-add"], ["g4x-02-01", "remedial", "concept", "fa-repeated-add"],
  ["g4x-02-02", "step", "c1", "fm-groups"], ["g4x-02-02", "step", "c2", "fa-repeated-add"],
  ["g4x-02-03", "step", "c2", "fa-improper-mixed"], ["g4x-02-03", "remedial", "concept", "fa-improper-mixed"],
  ["g4x-02-04", "step", "c2", "fa-mixed-improper"], ["g4x-02-04", "remedial", "concept", "fa-improper-mixed"],
  ["g4x-03-01", "step", "c1", "fm-groups"], ["g4x-03-01", "step", "c2", "fa-repeated-add"],
  ["g4x-03-02", "step", "c1", "fm-groups"], ["g4x-03-03", "step", "c1", "number-line-jumps"], ["g4x-03-04", "step", "c2", "fa-repeated-add"],
];

const grouped = new Map();
for (const repair of repairs) {
  const [lessonId] = repair;
  const current = grouped.get(lessonId) ?? [];
  current.push(repair);
  grouped.set(lessonId, current);
}

const withoutWithheldFigureClaim = (text) => text?.replace(/\s+The figure (?:shows|identifies|stacks|regroups|groups|separates|benchmarks).+$/s, "").trim();
let changedPlacements = 0;
let removedFigures = 0;
let removedStaleClaims = 0;

for (const [lessonId, lessonRepairs] of grouped) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  const source = await readFile(file, "utf8");
  const lesson = JSON.parse(source);
  let changed = false;

  for (const [, surface, stepId, expectedFigure] of lessonRepairs) {
    const step = surface === "step" ? lesson.steps.find((candidate) => candidate.id === stepId) : lesson.remedials?.[0]?.[stepId];
    if (!step) throw new Error(`${lessonId}/${surface}/${stepId}: missing placement`);
    if (step.figure !== expectedFigure && step.figure !== undefined) {
      throw new Error(`${lessonId}/${surface}/${stepId}: expected ${expectedFigure} or fail-closed figure, found ${step.figure}`);
    }
    let placementChanged = false;
    if (step.figure === expectedFigure) {
      delete step.figure;
      removedFigures += 1;
      placementChanged = true;
    }
    for (const field of ["body", "narration"]) {
      const next = withoutWithheldFigureClaim(step[field]);
      if (next !== step[field]) {
        step[field] = next;
        removedStaleClaims += 1;
        placementChanged = true;
      }
    }
    if (placementChanged) {
      changed = true;
      changedPlacements += 1;
    }
  }

  if (changed && checkOnly) throw new Error(`${lessonId}: P0 figure repair is not current`);
  if (changed && !checkOnly) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

console.log(JSON.stringify({
  course: "fraction-multiply-g4",
  closedRootCauses: repairs.length,
  changedPlacements,
  removedFigures,
  removedStaleClaims,
  current: changedPlacements === 0,
}, null, 2));
