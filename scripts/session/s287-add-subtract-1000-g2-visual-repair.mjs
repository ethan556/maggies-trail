import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LESSONS = join(ROOT, "content", "courses", "add-subtract-1000-g2", "lessons");

function fail(message) {
  throw new Error(`S287 add-subtract-1000-g2 visual repair: ${message}`);
}

function conceptStep(lesson, id) {
  const step = lesson.steps.find((candidate) => candidate.id === id);
  if (!step || step.kind !== "concept") fail(`${lesson.id}/${id} must be a concept step`);
  return step;
}

function remedialConcept(lesson, conceptTag) {
  const remedial = lesson.remedials.find((candidate) => candidate.conceptTag === conceptTag);
  if (!remedial || remedial.concept.kind !== "concept") fail(`${lesson.id}/${conceptTag} remedial concept is missing`);
  return remedial.concept;
}

function matches(concept, expected) {
  return Object.entries(expected).every(([key, value]) => concept[key] === value);
}

function repairConcept(concept, before, after, label) {
  if (matches(concept, after)) return false;
  if (!matches(concept, before)) fail(`${label} no longer matches the guarded source payload`);
  Object.assign(concept, after);
  return true;
}

const acrossZero = {
  id: "g2b-02-04",
  repairs: [
    {
      get: (lesson) => conceptStep(lesson, "c1"),
      before: { figure: "pv3-borrow-zero" },
      after: { figure: "pv1000-cascade-down" },
      label: "g2b-02-04/c1",
    },
    {
      get: (lesson) => conceptStep(lesson, "c2"),
      before: { figure: "pv3-borrow-zero" },
      after: { figure: "pv1000-trade-down" },
      label: "g2b-02-04/c2",
    },
    {
      get: (lesson) => remedialConcept(lesson, "g2b-across-zero"),
      before: { figure: "pv3-borrow-zero" },
      after: { figure: "pv1000-trade-down" },
      label: "g2b-02-04/remedials.0.concept",
    },
  ],
};

const mentalHundred = {
  id: "g2b-02-06",
  repairs: [
    {
      get: (lesson) => conceptStep(lesson, "c2"),
      before: {
        body: "For 348, one hundred more is 448, then 548. The tens and ones stay the same.",
        narration: "For 348, one hundred more is 448, then 548. The tens and ones stay the same.",
      },
      after: {
        body: "Start at 200 and add 100 each time: 200, 300, 400, 500, 600. Only the hundreds digit changes.",
        narration: "Start at 200 and add 100 each time: 200, 300, 400, 500, 600. Only the hundreds digit changes.",
      },
      label: "g2b-02-06/c2",
    },
    {
      get: (lesson) => remedialConcept(lesson, "g2b-mental-hundred"),
      before: {
        body: "For 348, one hundred more is 448, then 548. The tens and ones stay the same.",
        narration: "For 348, one hundred more is 448, then 548. The tens and ones stay the same.",
      },
      after: {
        body: "Start at 200 and add 100 each time: 200, 300, 400, 500, 600. Only the hundreds digit changes.",
        narration: "Start at 200 and add 100 each time: 200, 300, 400, 500, 600. Only the hundreds digit changes.",
      },
      label: "g2b-02-06/remedials.0.concept",
    },
  ],
};

const changed = [];
for (const repair of [acrossZero, mentalHundred]) {
  const path = join(LESSONS, `${repair.id}.json`);
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  let lessonChanged = false;
  for (const entry of repair.repairs) {
    lessonChanged = repairConcept(entry.get(lesson), entry.before, entry.after, entry.label) || lessonChanged;
  }
  if (lessonChanged) {
    writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
    changed.push(repair.id);
  }
}

console.log(`S287 add-subtract-1000-g2 visual repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
