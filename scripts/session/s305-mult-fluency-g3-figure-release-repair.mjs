import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonsRoot = path.join(repoRoot, "content/courses/mult-fluency-g3/lessons");
const checkOnly = process.argv.includes("--check");

const conceptRepairs = [
  {
    lessonId: "mf3-01-01",
    stepId: "c1",
    figure: "mult3-double",
    before: "Multiplying by 2 is doubling: two equal groups joined together.",
    after: "Times two is doubling: two equal groups join together.",
  },
  {
    lessonId: "mf3-01-06",
    stepId: "c2",
    figure: "mult3-break-apart",
    before: "For 7 × 6, split the seven groups into five groups and two groups: 30 + 12 = 42.",
    after: "For 7 × 6, use 7 × 6 = 5 × 6 + 2 × 6.",
  },
  {
    lessonId: "mf3-02-02",
    stepId: "c2",
    figure: "mult3-nines",
    before: "Subtracting from a ten fact is faster than skip-counting nine times.",
    after: "The nines pattern has one digit rising while the other falls.",
  },
  {
    lessonId: "mf3-02-05",
    stepId: "c1",
    figure: "mult3-mult-table",
    before: "Some facts, such as 6 × 7, 7 × 8, and 8 × 9, do not all share one quick table pattern. Practise them until recall is reliable.",
    after: "A multiplication table organizes rows and columns; practise harder facts until recall is reliable.",
  },
  {
    lessonId: "mf3-02-06",
    stepId: "c1",
    figure: "mult3-break-apart",
    before: "When a fact will not come, build it from one that does: 7 × 6 is 7 × 5 plus one more 7.",
    after: "When a fact does not come, break it into known groups: 7 × 6 = 5 × 6 + 2 × 6.",
  },
  {
    lessonId: "mf3-03-02",
    stepId: "c1",
    figure: "mult3-mult-table",
    before: "Now the whole range, out of order: any factor pair from 2 through 9.",
    after: "A multiplication table organizes rows and columns; practise facts out of order to test recall.",
  },
];

const exactReplacements = [
  {
    lessonId: "mf3-02-05",
    path: ["steps", 1, "predict", "options", 0, "label"],
    before: "They have no skip-count shortcut",
    after: "Their patterns are less immediate",
  },
  {
    lessonId: "mf3-02-05",
    path: ["steps", 1, "predict", "reveal"],
    before: "×5 and ×10 have digit patterns; ×6 through ×8 do not (×9 has its own digit pattern), so these need direct recall or a derived step.",
    after: "×5, ×9, and ×10 offer quick patterns; ×6 through ×8 often need direct recall or a derived step.",
  },
  {
    lessonId: "mf3-02-05",
    path: ["steps", 8, "takeaways", 0],
    before: "Some facts have no pattern.",
    after: "Some facts need a strategy before they become automatic.",
  },
  {
    lessonId: "mf3-03-05",
    path: ["steps", 2, "widget", "successFeedback"],
    before: "Correct — 42 ÷ 6 = 7, the reciprocal of 6 × 7 = 42.",
    after: "Correct — 42 ÷ 6 = 7; division undoes 6 × 7 = 42.",
  },
  {
    lessonId: "mf3-03-05",
    path: ["steps", 5, "widget", "successFeedback"],
    before: "Correct — 72 ÷ 8 = 9, the reciprocal of 8 × 9 = 72.",
    after: "Correct — 72 ÷ 8 = 9; division undoes 8 × 9 = 72.",
  },
  {
    lessonId: "mf3-03-05",
    path: ["steps", 6, "widget", "successFeedback"],
    before: "Correct — 56 ÷ 7 = 8, the reciprocal of 7 × 8 = 56.",
    after: "Correct — 56 ÷ 7 = 8; division undoes 7 × 8 = 56.",
  },
  {
    lessonId: "mf3-03-05",
    path: ["steps", 7, "widget", "successFeedback"],
    before: "Correct — 54 ÷ 6 = 9, the reciprocal of 6 × 9 = 54.",
    after: "Correct — 54 ÷ 6 = 9; division undoes 6 × 9 = 54.",
  },
  {
    lessonId: "mf3-03-05",
    path: ["remedials", 0, "check", "widget", "successFeedback"],
    before: "Correct — 42 ÷ 6 = 7, the reciprocal of 6 × 7 = 42.",
    after: "Correct — 42 ÷ 6 = 7; division undoes 6 × 7 = 42.",
  },
];

const changedLessons = new Set();
const errors = [];

function readLesson(lessonId) {
  const file = path.join(lessonsRoot, `${lessonId}.json`);
  const text = fs.readFileSync(file, "utf8");
  const lesson = JSON.parse(text);
  if (lesson.id !== lessonId || lesson.courseId !== "mult-fluency-g3") {
    throw new Error(`${lessonId}: unexpected lesson identity`);
  }
  return { file, text, lesson };
}

function atPath(value, pathParts) {
  return pathParts.reduce((cursor, part) => cursor?.[part], value);
}

function assignAtPath(value, pathParts, next) {
  const parent = atPath(value, pathParts.slice(0, -1));
  if (!parent || typeof parent !== "object") {
    throw new Error(`missing ${pathParts.join(".")}`);
  }
  parent[pathParts.at(-1)] = next;
}

const lessons = new Map();
for (const lessonId of new Set([...conceptRepairs, ...exactReplacements].map((repair) => repair.lessonId))) {
  lessons.set(lessonId, readLesson(lessonId));
}

for (const repair of conceptRepairs) {
  const entry = lessons.get(repair.lessonId);
  const step = entry.lesson.steps.find((candidate) => candidate.id === repair.stepId);
  if (!step || step.kind !== "concept") {
    errors.push(`${repair.lessonId}/${repair.stepId}: expected concept step`);
    continue;
  }
  if (step.figure !== repair.figure) {
    errors.push(`${repair.lessonId}/${repair.stepId}: expected ${repair.figure}, received ${step.figure ?? "none"}`);
    continue;
  }
  if (step.body !== step.narration) {
    errors.push(`${repair.lessonId}/${repair.stepId}: body and narration diverged`);
    continue;
  }
  if (step.body !== repair.before && step.body !== repair.after) {
    errors.push(`${repair.lessonId}/${repair.stepId}: unexpected source text`);
    continue;
  }
  if (step.body !== repair.after) {
    step.body = repair.after;
    step.narration = repair.after;
    changedLessons.add(repair.lessonId);
  }
}

for (const repair of exactReplacements) {
  const entry = lessons.get(repair.lessonId);
  const current = atPath(entry.lesson, repair.path);
  if (current !== repair.before && current !== repair.after) {
    errors.push(`${repair.lessonId}/${repair.path.join(".")}: unexpected source value`);
    continue;
  }
  if (current !== repair.after) {
    assignAtPath(entry.lesson, repair.path, repair.after);
    changedLessons.add(repair.lessonId);
  }
}

const hardFacts = lessons.get("mf3-02-05")?.lesson;
if (hardFacts?.steps?.[1]?.predict?.outcomeId !== "a") {
  errors.push("mf3-02-05: prediction outcome ID changed");
}

if (errors.length > 0) {
  throw new Error(`S305 repair guard failed:\n${errors.join("\n")}`);
}

if (checkOnly && changedLessons.size > 0) {
  throw new Error(`S305 repair drift in: ${[...changedLessons].sort().join(", ")}`);
}

if (!checkOnly) {
  for (const lessonId of changedLessons) {
    const entry = lessons.get(lessonId);
    fs.writeFileSync(entry.file, `${JSON.stringify(entry.lesson, null, 2)}\n`, "utf8");
  }
}

console.log(JSON.stringify({
  course: "mult-fluency-g3",
  closedRootCauses: 12,
  conceptBindingsAligned: conceptRepairs.length,
  releaseTruthRepairs: exactReplacements.length,
  changedLessons: checkOnly ? 0 : changedLessons.size,
  current: checkOnly,
}, null, 2));
