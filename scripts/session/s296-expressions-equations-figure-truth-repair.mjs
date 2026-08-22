/**
 * S296 — close only the fixed-number figure mismatches in expressions-equations.
 *
 * A fixed figure is withheld when its rendered exemplar is not the exemplar the
 * adjacent instructional text teaches. This intentionally leaves the prose,
 * stable step IDs, widgets, evaluators, and the one exact exponent figure alone.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "expressions-equations", "lessons");
const check = process.argv.includes("--check");

const withholds = Object.freeze([
  {
    workId: "VIS-ee-02-02-c2-expression-machine",
    lessonId: "ee-02-02",
    stepId: "c2",
    figure: "expression-machine",
    body: "Exponents on variables follow the same order rules. x² at x = 3 means 3² = 3 × 3 = **9** — square the value, don't double it. And in x² + 1, the square resolves before the addition, exactly as it did with plain numbers last chapter.",
  },
  {
    workId: "VIS-ee-02b-02-c2-expression-machine",
    lessonId: "ee-02b-02",
    stepId: "c2",
    figure: "expression-machine",
    body: "Knowing the coefficient is not trivia — it is what makes combining possible.\n\n3x + x is not 3x. Written in full it is 3x + 1x, and once both coefficients are visible they add to 4x. The invisible 1 is the whole reason the answer is not 3.",
  },
  {
    workId: "VIS-ee-02b-03-c2-ee-like-terms",
    lessonId: "ee-02b-03",
    stepId: "c2",
    figure: "ee-like-terms",
    body: "The bracket also lets you treat a whole expression as a **single entity**.\n\nIn 3(n + 2) you can view (n + 2) as one thing being tripled, without ever looking inside it. That view is what makes 3(n + 2) + 4(n + 2) = 7(n + 2) obvious — seven of the same object — no distributing required.",
  },
  {
    workId: "VIS-ee-04-02-c2-balance-scale",
    lessonId: "ee-04-02",
    stepId: "c2",
    figure: "balance-scale",
    body: "Subtraction equations undo the same way, in reverse: to solve x − 5 = 12, **undo the −5** by ADDING 5 to both sides: x − 5 + 5 = 12 + 5, giving x = **17**. Whichever operation is attached to x, apply its OPPOSITE to both sides.",
  },
  {
    workId: "VIS-ee-04-03-c2-ee-mult-div-solve",
    lessonId: "ee-04-03",
    stepId: "c2",
    figure: "ee-mult-div-solve",
    body: "Division equations undo with **multiplication**. To solve x ÷ 3 = 6, undo the ÷3 by multiplying both sides by 3: x = 6 × 3 = **18**. Notice the pattern across all four one-step types: the opposite operation, applied to both sides, isolates x.",
  },
]);

const retained = Object.freeze({
  lessonId: "ee-01-01",
  stepId: "c2",
  figure: "ee-exponent-vs-mult",
  before: "The exponent is NOT a multiplier of the base — 2³ is not 2 × 3. The two most common squares to know by sight: **squaring** (exponent 2) means a number times itself, like 3² = 9, and **cubing** (exponent 3) means three copies, like 2³ = 8. \"Squared\" comes from area; \"cubed\" from volume.",
  after: "The exponent is NOT a multiplier of the base — 2³ = 8, not 2 × 3 = 6. The two most common squares to know by sight: **squaring** (exponent 2) means a number times itself, like 3² = 9, and **cubing** (exponent 3) means three copies, like 2³ = 8. \"Squared\" comes from area; \"cubed\" from volume.",
});

const loaded = new Map();
for (const target of withholds) {
  const file = path.join(lessonDirectory, `${target.lessonId}.json`);
  if (!loaded.has(file)) loaded.set(file, JSON.parse(await readFile(file, "utf8")));
  const step = loaded.get(file).steps.find((candidate) => candidate.id === target.stepId);
  if (!step || step.kind !== "concept" || step.widget !== undefined || step.body !== target.body) {
    throw new Error(`${target.workId}: lesson or evaluator contract drift`);
  }
  if (Object.hasOwn(step, "figure") && step.figure !== target.figure) {
    throw new Error(`${target.workId}: expected ${target.figure}, found ${String(step.figure)}`);
  }
}
{
  const file = path.join(lessonDirectory, `${retained.lessonId}.json`);
  if (!loaded.has(file)) loaded.set(file, JSON.parse(await readFile(file, "utf8")));
  const step = loaded.get(file).steps.find((candidate) => candidate.id === retained.stepId);
  if (!step || step.kind !== "concept" || step.figure !== retained.figure || step.widget !== undefined || (step.body !== retained.before && step.body !== retained.after)) {
    throw new Error("ee-01-01/c2: retained figure contract drift");
  }
}

let changed = 0;
for (const target of withholds) {
  const file = path.join(lessonDirectory, `${target.lessonId}.json`);
  const step = loaded.get(file).steps.find((candidate) => candidate.id === target.stepId);
  if (!Object.hasOwn(step, "figure")) continue;
  delete step.figure;
  changed += 1;
}
{
  const file = path.join(lessonDirectory, `${retained.lessonId}.json`);
  const step = loaded.get(file).steps.find((candidate) => candidate.id === retained.stepId);
  if (step.body === retained.before) {
    step.body = retained.after;
    changed += 1;
  }
}

if (check && changed) throw new Error(`S296 needs ${changed} safe figure withholds`);
if (!check && changed) {
  for (const [file, lesson] of loaded) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

console.log(JSON.stringify({
  course: "expressions-equations",
  fixedMismatchWithholds: withholds.length,
  exactFigureRetentions: 1,
  retainedFigureTextSynchronizations: 1,
  changed,
  current: changed === 0,
}));
