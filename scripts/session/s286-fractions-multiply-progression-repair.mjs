/**
 * S286 — Fractions Multiply progression and MCQ-parity follow-on.
 *
 * Repairs only the ten signed P1 source causes that S266 deliberately left
 * outside its figure-only scope.  Each update keeps the existing step ID,
 * widget type, evaluator target, and feedback branch structure.  The script
 * is intentionally fail-closed: it accepts either its pre-repair snapshot or
 * the exact repaired snapshot, and refuses to overwrite any other authoring.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "fractions-multiply", "lessons");
const checkOnly = process.argv.includes("--check");

const updates = Object.freeze([
  {
    lessonId: "fm-01-01", stepId: "k3", kind: "check", widgetType: "numeric",
    before: {
      body: "Rewrite over that denominator.",
      prompt: "Rewrite 1/2 with a denominator of 8. What is the new numerator?",
    },
    after: {
      body: "Find the scale factor.",
      prompt: "To turn 1/2 into a fraction with denominator 8, by what factor must both parts be scaled?",
    },
  },
  {
    lessonId: "fm-01-01", stepId: "ch1", kind: "challenge", widgetType: "numeric",
    before: {
      body: "Rewrite to a given denominator.",
      prompt: "Rewrite 1/3 with a denominator of 15. What is the new numerator?",
    },
    after: {
      body: "Complete an equivalent fraction.",
      prompt: "A fraction equal to 1/3 has denominator 15. What numerator completes ?/15?",
    },
  },
  {
    lessonId: "fm-01-03", stepId: "k3", kind: "check", widgetType: "fractionEntry",
    before: {
      body: "One more that simplifies.",
      prompt: "5/6 − 1/2 = ? (rewrite 1/2 as 3/6, then simplify)",
    },
    after: {
      body: "Correct a denominator mistake.",
      prompt: "A learner writes 5/6 − 1/2 = 4/4. Use sixths to correct the answer. Enter the simplified difference.",
    },
  },
  {
    lessonId: "fm-02-02", stepId: "i2", kind: "interactive", widgetType: "numeric",
    before: {
      body: "Your turn.",
      prompt: "3/5 of 10: split into 5 parts (10 ÷ 5 = 2), then take 3. What is 3/5 of 10?",
    },
    after: {
      body: "Repair an equal-shares mistake.",
      prompt: "A learner says 3/5 of 10 is 2 because one fifth is 2. How many counters are in three fifths?",
    },
  },
  {
    lessonId: "fm-02-02", stepId: "k3", kind: "check", widgetType: "numeric",
    before: {
      body: "A bigger numerator.",
      prompt: "What is 5/6 of 12?",
    },
    after: {
      body: "Read selected equal groups.",
      prompt: "Twelve counters are shared into 6 equal groups. Five groups are selected. How many counters are selected?",
    },
  },
  {
    lessonId: "fm-02-02", stepId: "ch1", kind: "challenge", widgetType: "numeric",
    before: {
      body: "Split and take.",
      prompt: "What is 3/8 of 16?",
    },
    after: {
      body: "Transfer to a shaded array.",
      prompt: "An array has 16 counters in 8 equal columns. Three full columns are shaded. How many counters are shaded?",
    },
  },
  {
    lessonId: "fm-03-01", stepId: "k3", kind: "check", widgetType: "mcq",
    before: {
      body: "Predict without a grid.",
      prompt: "Without computing exactly: 1/3 × 1/4 is —",
      options: [
        { id: "a", label: "smaller than both 1/3 and 1/4", correct: true, feedback: "Right — a part of a part shrinks. (It's 1/12, smaller than both.)" },
        { id: "b", label: "bigger than both", feedback: "Multiplying fractions under 1 shrinks, not grows. 1/3 × 1/4 = 1/12, smaller than both." },
        { id: "c", label: "exactly 1/4", feedback: "Taking 1/3 OF 1/4 makes it smaller than 1/4. The product is 1/12." },
      ],
    },
    after: {
      body: "Reason from the factors.",
      prompt: "Without calculating 1/3 × 1/4, which size description must be true?",
      options: [
        { id: "a", label: "less than both factors", correct: true, feedback: "Right — both positive factors are less than 1, so the product is a part of a part and is less than both." },
        { id: "b", label: "more than both factors", feedback: "Both factors are below 1, so each takes a part rather than making the amount larger. The product is less than both." },
        { id: "c", label: "equal to first factor", feedback: "The second factor, 1/4, takes one third of the first factor, so the product cannot equal 1/3." },
        { id: "d", label: "equal to second factor", feedback: "The first factor, 1/3, takes one fourth of the second factor, so the product cannot equal 1/4." },
      ],
    },
  },
  {
    lessonId: "fm-03-02", stepId: "k3", kind: "check", widgetType: "fractionEntry",
    before: {
      body: "Reduce to a familiar fraction.",
      prompt: "2/3 × 1/2 = ? (multiply across, then simplify)",
    },
    after: {
      body: "Find the part that remains.",
      prompt: "One half of 2/3 is 2/3 × 1/2. What share of the whole remains? Enter it in lowest terms.",
    },
  },
  {
    lessonId: "fm-03-02", stepId: "ch1", kind: "challenge", widgetType: "fractionEntry",
    before: {
      body: "Multiply across and simplify.",
      prompt: "5/6 × 2/5 = ?",
    },
    after: {
      body: "Cancel a shared factor first.",
      prompt: "In 5/6 × 2/5, cancel the shared factor before multiplying. What simplest fraction remains?",
    },
  },
  {
    lessonId: "fm-03-03", stepId: "i2", kind: "interactive", widgetType: "numeric",
    before: {
      body: "Reduce the result.",
      prompt: "3/5 × 10/12 = 30/60. In lowest terms this is 1 over what number? (divide both by 30)",
    },
    after: {
      body: "Verify a simplification claim.",
      prompt: "A student says 30/60 simplifies to 1/2. What denominator confirms that the claim is correct?",
    },
  },
  {
    lessonId: "fm-04-01", stepId: "k2", kind: "check", widgetType: "mcq",
    before: {
      body: "When nothing changes.",
      prompt: "Is 10 × 3/3 bigger than 10, smaller than 10, or exactly 10?",
    },
    after: {
      body: "Challenge a false claim.",
      prompt: "A student says 10 × 3/3 = 30. Is the product bigger than 10, smaller than 10, or exactly 10?",
    },
  },
  {
    lessonId: "fm-04-01", stepId: "k3", kind: "check", widgetType: "mcq",
    before: {
      body: "Read it off the fraction.",
      prompt: "Is 12 × 5/6 bigger than 12, smaller than 12, or exactly 12?",
    },
    after: {
      body: "Classify a shrink.",
      prompt: "Without calculating, is 12 × 5/6 bigger than 12, smaller than 12, or exactly 12?",
    },
  },
  {
    lessonId: "fm-04-02", stepId: "ch1", kind: "challenge", widgetType: "mcq",
    before: {
      body: "Compare without computing.",
      prompt: "Which is bigger: 3/5 × 12 or 7/6 × 12?",
    },
    after: {
      body: "Compare two scalers.",
      prompt: "Both products start with 12. Without finding either product, which scaler makes the greater result?",
    },
  },
  {
    lessonId: "fm-05-01", stepId: "ch1", kind: "challenge", widgetType: "numeric",
    before: {
      body: "A bigger count.",
      prompt: "6 ÷ 1/3 = ?",
    },
    after: {
      body: "Count thirds in a collection.",
      prompt: "Six whole litres are poured into cups that each hold 1/3 litre. How many full cups can be filled?",
    },
  },
  {
    lessonId: "fm-05-02", stepId: "ch1", kind: "challenge", widgetType: "fractionEntry",
    before: {
      body: "Split a third into three.",
      prompt: "1/3 ÷ 3 = ?",
    },
    after: {
      body: "Share one piece equally.",
      prompt: "One third of a pan is shared equally among 3 people. What fraction of the whole pan does each person get?",
    },
  },
]);

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function project(step, fields) {
  const result = {};
  for (const field of Object.keys(fields)) {
    result[field] = field === "prompt" ? step.widget?.prompt : field === "options" ? step.widget?.options : step[field];
  }
  return result;
}

function applyFields(step, fields) {
  for (const [field, value] of Object.entries(fields)) {
    if (field === "prompt" || field === "options") step.widget[field] = value;
    else step[field] = value;
  }
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
    if (!step) throw new Error(`${lessonId}/${update.stepId}: missing step`);
    if (step.kind !== update.kind || step.widget?.type !== update.widgetType) {
      throw new Error(`${lessonId}/${update.stepId}: evaluator contract drifted`);
    }
    const current = project(step, update.after);
    if (same(current, update.after)) continue;
    if (!same(project(step, update.before), update.before)) {
      throw new Error(`${lessonId}/${update.stepId}: unexpected authored text; refusing overwrite`);
    }
    applyFields(step, update.after);
    changed += 1;
    lessonChanged = true;
  }
  if (lessonChanged && !checkOnly) await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}

if (checkOnly && changed !== 0) throw new Error(`S286 is not current: ${changed} signed updates still need application`);
console.log(JSON.stringify({ course: "fractions-multiply", signedSourceClosures: updates.length, changed, current: changed === 0 }, null, 2));
