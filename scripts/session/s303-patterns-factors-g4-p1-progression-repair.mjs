import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "patterns-factors-g4", "lessons");
const checkOnly = process.argv.includes("--check");

const repairs = [
  {
    rootCause: "PROGRESSION-g4p-01-01",
    lessonId: "g4p-01-01",
    stepId: "k3",
    widgetType: "numeric",
    before: {
      body: "",
      prompt: "A rectangle has one side 5 and an area of 40. What is the other side?",
    },
    after: {
      body: "Complete a factor-pair record.",
      prompt: "A factor-pair record for 40 includes 1 × 40, 2 × 20, 4 × 10, and 5 × ?. Which number completes the last pair?",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-01-02",
    lessonId: "g4p-01-02",
    stepId: "k3",
    widgetType: "mcq",
    before: { body: "", prompt: "Which of these is a factor of 60?" },
    after: {
      body: "Use a factor-pair record.",
      prompt: "A factor-pair record for 60 begins 1 × 60, 2 × ?. Which number completes the pair?",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-01-03",
    lessonId: "g4p-01-03",
    stepId: "k2",
    widgetType: "mcq",
    before: { body: "", prompt: "Which of these is a multiple of 7?" },
    after: {
      body: "Check equal groups.",
      prompt: "Which total could be packed into equal groups of 7 with none left over?",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-01-04",
    lessonId: "g4p-01-04",
    stepId: "k3",
    widgetType: "mcq",
    before: { body: "", prompt: "Which of these is a multiple of 8?" },
    after: {
      body: "Check a packing claim.",
      prompt: "Which total can be packed into equal groups of 8 with none left over?",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-02-01",
    lessonId: "g4p-02-01",
    stepId: "k3",
    widgetType: "mcq",
    before: { body: "", prompt: "Is 21 prime or composite?" },
    after: {
      body: "Use a factor pair as evidence.",
      prompt: "A number has the factor pair 3 × 7 = 21. Is that number prime or composite?",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-02-01",
    lessonId: "g4p-02-01",
    stepId: "ch1",
    widgetType: "mcq",
    before: { body: "One more, for the road.", prompt: "Is 11 prime or composite?" },
    after: {
      body: "Rule out a nontrivial factor pair.",
      prompt: "Only 1 × 11 builds 11. Is 11 prime or composite?",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-03-02",
    lessonId: "g4p-03-02",
    stepId: "i2",
    widgetType: "barBuilder",
    before: {
      body: "Build a new shape-count pattern, then use its constant increase to predict a later step.",
      prompt: "Build the shape pattern: 4 squares, then 8, then 12, then 16.",
    },
    after: {
      body: "Test a proposed constant-increase rule.",
      prompt: "A teammate says this shape pattern adds 4 squares each step. Build four steps to test it: 4, 8, 12, 16.",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-03-03",
    lessonId: "g4p-03-03",
    stepId: "i2",
    widgetType: "tapDiagram",
    before: {
      body: "Inspect a new rule and distinguish its visible features from the information the rule directly gives.",
      prompt: "The rule is 'add 5' from 5: 5, 10, 15, 20, 25. Tap the features the RULE never states.",
    },
    after: {
      body: "Check a classmate's claim against the terms.",
      prompt: "A classmate says every visible feature must be written in the rule. For 'add 5' from 5: 5, 10, 15, 20, 25, tap the features the rule never states.",
    },
  },
  {
    rootCause: "PROGRESSION-g4p-03-04",
    lessonId: "g4p-03-04",
    stepId: "i2",
    widgetType: "barBuilder",
    before: {
      body: "Build a related doubling pattern from a new start, then use the rule rather than only the next term.",
      prompt: "Build the first four terms of 'multiply by 2 from 3': 3, 6, 12, 24.",
    },
    after: {
      body: "Verify a doubling claim from its starting value.",
      prompt: "A teammate claims that doubling from 3 gives 3, 6, 12, 24. Build the four terms to test the claim.",
    },
  },
];

const byLesson = new Map();
for (const repair of repairs) {
  const current = byLesson.get(repair.lessonId) ?? [];
  current.push(repair);
  byLesson.set(repair.lessonId, current);
}

let changedPlacements = 0;
const changedRoots = new Set();
for (const [lessonId, lessonRepairs] of byLesson) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  const source = await readFile(file, "utf8");
  const lesson = JSON.parse(source);
  let changed = false;

  for (const repair of lessonRepairs) {
    const step = lesson.steps.find((candidate) => candidate.id === repair.stepId);
    if (!step?.widget) throw new Error(`${lessonId}/${repair.stepId}: missing widget`);
    if (step.widget.type !== repair.widgetType) throw new Error(`${lessonId}/${repair.stepId}: expected ${repair.widgetType}, found ${step.widget.type}`);
    const current = { body: step.body ?? "", prompt: step.widget.prompt };
    const isBefore = JSON.stringify(current) === JSON.stringify(repair.before);
    const isAfter = JSON.stringify(current) === JSON.stringify(repair.after);
    if (!isBefore && !isAfter) throw new Error(`${lessonId}/${repair.stepId}: unexpected source contract`);
    if (isBefore) {
      step.body = repair.after.body;
      step.widget.prompt = repair.after.prompt;
      changed = true;
      changedPlacements += 1;
      changedRoots.add(repair.rootCause);
    }
  }

  if (changed && !checkOnly) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
  if (changed && checkOnly) throw new Error(`${lessonId}: repair is not current`);
}

if (checkOnly && changedPlacements !== 0) throw new Error("repair check should not mutate source");
console.log(JSON.stringify({
  course: "patterns-factors-g4",
  signedRootCauseClosures: 8,
  changedPlacements,
  changedRoots: [...changedRoots].sort(),
  current: changedPlacements === 0,
}));
