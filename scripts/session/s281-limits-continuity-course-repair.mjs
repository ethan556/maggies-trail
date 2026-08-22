import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/limits-continuity/lessons";
const targets = new Map([
  ["lc-01-03:k1", {
    prompt: "For f(x) = 1/x² as x → 0",
    labels: ["does not exist; values grow without bound", "approaches 0; values shrink", "approaches 1; values settle"],
  }],
  ["lc-03-01:ch1", {
    prompt: "f = x² for x < 1 and 3x for x ≥ 1",
    labels: ["does not exist; sides approach 1 and 3", "approaches 2; average of 1 and 3", "approaches 1; the left-side value"],
  }],
  ["lc-03-01:k2", {
    prompt: "With lim(x→2⁻) = 3 and lim(x→2⁺) = 4",
    labels: ["does not exist; sides approach 3 and 4", "approaches 3.5; the two values averaged", "approaches 4; the right-side value"],
  }],
  ["lc-03-03:ch1", {
    prompt: "As x → ∞, (x³ + 1)/(2x + 5)",
    labels: ["grows to +∞; numerator degree is larger", "approaches 1/2; degrees are equal", "approaches 0; denominator degree is larger"],
  }],
  ["lc-03-03:k1", {
    prompt: "For end behavior of (7x³ + 2x)/(x³ − 1)",
    labels: ["leading terms 7x³ and x³ determine the limit", "constant terms determine the limit at infinity", "middle terms determine the limit at infinity"],
  }],
  ["lc-03-03:k2", {
    prompt: "As x → ∞, (−2x³ + 5)/(x² + 1)",
    labels: ["grows to −∞; numerator degree is larger", "grows to +∞; numerator degree is larger", "approaches −2; the degrees are equal"],
  }],
  ["lc-03-03:k3", {
    prompt: "For (3x + 2)/(x² + 1) as x → ∞",
    labels: ["approaches 0; denominator degree is larger", "approaches 3; the degrees are equal", "grows to +∞; numerator degree is larger"],
  }],
  ["lc-04-01:k3", {
    prompt: "Continuity at x = a requires:",
    labels: ["f(a) is defined, limit exists, and they agree", "f(a) is defined, regardless of the limit", "limit exists, regardless of f(a)"],
  }],
  ["lc-04-02:k3", {
    prompt: "f(x) = 1/x has what kind of discontinuity",
    labels: ["infinite; a vertical asymptote at x = 0", "removable; a hole at x = 0", "jump; two finite sides at x = 0"],
  }],
  ["lc-04-03:k3", {
    prompt: "Why does the IVT require f to be continuous",
    labels: ["A jump can skip an intermediate value", "Only continuous functions can have roots", "Continuity makes every function increase"],
  }],
]);

const lessonIds = new Set([...targets.keys()].map((key) => key.split(":")[0]));
let labelChanges = 0;
let seen = 0;
for (const lessonId of lessonIds) {
  const file = path.join(dir, `${lessonId}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const indent = raw.match(/\n( +)"/)?.[1].length ?? 2;
  const lesson = JSON.parse(raw);
  let changed = false;
  for (const step of lesson.steps ?? []) {
    const key = `${lesson.id}:${step.id}`;
    const target = targets.get(key);
    if (!target) continue;
    seen += 1;
    if (step.widget?.type !== "mcq" || !step.widget.prompt.includes(target.prompt)) {
      throw new Error(`${key} no longer has the expected choice contract`);
    }
    if (!Array.isArray(step.widget.options) || step.widget.options.length !== target.labels.length) {
      throw new Error(`${key} no longer has three options`);
    }
    for (const [index, option] of step.widget.options.entries()) {
      if (option.id !== `o${index + 1}` || Boolean(option.correct) !== (index === 0)) {
        throw new Error(`${key} changed stable option identity or evaluator truth`);
      }
      if (option.label !== target.labels[index]) {
        option.label = target.labels[index];
        changed = true;
        labelChanges += 1;
      }
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(lesson, null, indent)}\n`);
}

if (seen !== targets.size) throw new Error(`expected ${targets.size} choice dispositions, found ${seen}`);
if (![0, targets.size * 3].includes(labelChanges)) {
  throw new Error(`expected 0 or ${targets.size * 3} option-label changes, got ${labelChanges}`);
}
console.log(`S281 limits-continuity: ${targets.size} choice surfaces repaired with ${labelChanges} parallel labels`);
