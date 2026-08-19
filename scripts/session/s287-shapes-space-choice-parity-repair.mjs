/**
 * S287 — Shapes & Space source-local MCQ parity repair.
 *
 * Applies the seven signed CHOICE_SURFACE_INTEGRITY label repairs only.  It
 * keeps every step ID, question, option ID/order, correct option, feedback,
 * evaluator, and visual binding intact.  A label drift outside this exact
 * before/after contract stops the script instead of overwriting authored work.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "shapes-space", "lessons");
const checkOnly = process.argv.includes("--check");

const updates = Object.freeze([
  {
    closure: "CHOICE-0100", lessonId: "geo-01-01", stepId: "ch1",
    before: ["A four-sided shape (quadrilateral) — color and size don't count", "An orange shape — that's its type", "A triangle, because it's big", "Can't tell without knowing the color"],
    after: ["A quadrilateral with four sides", "A triangle with three sides", "A circle with no straight sides", "A mystery with unknown sides"],
  },
  {
    closure: "CHOICE-0101", lessonId: "geo-01-01", stepId: "k2",
    before: ["Still a square — turning doesn't change its sides or corners", "A diamond, which is a new shape", "A triangle now", "It depends which corner it balances on"],
    after: ["A square, just turned", "A diamond, a new shape", "A triangle, just turned", "A shape set by the corner"],
  },
  {
    closure: "CHOICE-0102", lessonId: "geo-01-03", stepId: "k2",
    before: ["No — a rectangle with unequal sides fails the square's equal-sides rule", "Yes — squares and rectangles are the same thing", "Yes — all four-sided shapes are squares", "Only if the rectangle is red"],
    after: ["No — unequal sides can make a rectangle", "Yes — four right angles make a square", "Yes — every rectangle has equal sides", "It depends — color decides its shape"],
  },
  {
    closure: "CHOICE-0103", lessonId: "geo-02-02", stepId: "k3",
    before: ["Each one breaks a single rule, showing exactly what that rule requires", "They prove the definition is wrong", "They're just tricky and teach nothing", "They mean the shape has no rules"],
    after: ["They show the rule that fails", "They show every rule has failed", "They show definitions have no rules", "They show color decides the rules"],
  },
  {
    closure: "CHOICE-0104", lessonId: "geo-03-01", stepId: "k2",
    before: ["Both — each piece is a quarter of the area, even though the shapes differ", "Only Square A — fourths must be square", "Only Square B — the X is the 'real' way", "Neither — the pieces aren't identical"],
    after: ["Both squares show equal fourths", "Only Square A shows equal fourths", "Only Square B shows equal fourths", "Neither square shows equal fourths"],
  },
  {
    closure: "CHOICE-0105", lessonId: "geo-03-01", stepId: "k3",
    before: ["The fourths — fewer equal parts means bigger pieces", "The eighths — 8 is more than 4", "They're the same — same pan", "Can't tell without measuring"],
    after: ["The fourths are larger pieces", "The eighths are larger pieces", "The pieces are equal in size", "The pieces cannot be compared"],
  },
  {
    closure: "CHOICE-0106", lessonId: "geo-03-02", stepId: "k3",
    before: ["4/4, which is the whole shape (1)", "0/4 — nothing is left", "1/4", "4/1"],
    after: ["4/4, all parts shaded", "0/4, no parts shaded", "1/4, one part shaded", "4/1, four parts total"],
  },
]);

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const grouped = new Map();
for (const update of updates) {
  const entries = grouped.get(update.lessonId) ?? [];
  entries.push(update);
  grouped.set(update.lessonId, entries);
}

let changed = 0;
for (const [lessonId, entries] of grouped) {
  const source = path.join(lessonDir, `${lessonId}.json`);
  const lesson = JSON.parse(await readFile(source, "utf8"));
  let lessonChanged = false;
  for (const update of entries) {
    const step = lesson.steps.find((candidate) => candidate.id === update.stepId);
    if (!step || !["check", "challenge"].includes(step.kind) || step.widget?.type !== "mcq") {
      throw new Error(`${update.closure}: expected MCQ assessment at ${lessonId}/${update.stepId}`);
    }
    const options = step.widget.options;
    if (!Array.isArray(options) || !same(options.map((option) => option.id), ["a", "b", "c", "d"]) || !same(options.filter((option) => option.correct).map((option) => option.id), ["a"])) {
      throw new Error(`${update.closure}: option/evaluator contract drifted`);
    }
    const labels = options.map((option) => option.label);
    if (same(labels, update.after)) continue;
    if (!same(labels, update.before)) throw new Error(`${update.closure}: unexpected labels; refusing overwrite`);
    options.forEach((option, index) => { option.label = update.after[index]; });
    changed += 1;
    lessonChanged = true;
  }
  if (lessonChanged && !checkOnly) await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}

if (checkOnly && changed !== 0) throw new Error(`S287 is not current: ${changed} signed MCQ repairs still need application`);
console.log(JSON.stringify({ course: "shapes-space", signedSourceClosures: updates.length, changed, current: changed === 0 }, null, 2));
