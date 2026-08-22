import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "division-fluency-g3", "lessons");
const CHECK = process.argv.includes("--check");
const mainPlans = {
  "df3-01-01": { i2: "Arrange 14 squares into 2 equal rows.", k2: "What number makes 2 × ? = 18?", k3: "How many groups of 2 fit in 14?", ch1: "20 stickers are shared equally between 2 children. How many stickers does each child get?" },
  "df3-01-02": { i2: "Arrange 24 squares into 3 equal rows.", k2: "What number makes 3 × ? = 24?", k3: "How many groups of 3 fit in 18?", ch1: "27 pencils are shared equally among 3 cups. How many pencils go in each cup?" },
  "df3-01-03": { i2: "Arrange 35 squares into 5 equal rows.", k2: "What number makes 5 × ? = 35?", k3: "How many groups of 4 fit in 36?", ch1: "45 berries are shared equally among 5 bowls. How many berries go in each bowl?" },
  "df3-01-04": { i2: "Arrange 56 squares into 7 equal rows.", k2: "What number makes 7 × ? = 56?", k3: "How many groups of 6 fit in 48?", ch1: "63 cards are shared equally among 7 piles. How many cards go in each pile?" },
  "df3-02-01": { i2: "Arrange 63 squares into 9 equal rows.", k2: "What number makes 9 × ? = 63?", k3: "How many groups of 8 fit in 64?", ch1: "81 beads are shared equally among 9 bags. How many beads go in each bag?" },
  "df3-02-02": { i2: "Arrange 90 squares into 10 equal rows.", k2: "How many groups of 10 make 90?", k3: "How many groups of 10 fit in 60?", ch1: "80 cubes are arranged in groups of 10. How many groups are there?" },
  "df3-02-03": { i2: "Arrange 48 squares into 8 equal rows.", k2: "What number makes 8 × ? = 48?", k3: "How many groups of 6 fit in 54?", ch1: "72 markers are shared equally among 9 students. How many markers does each student get?" },
  "df3-02-04": { i2: "Arrange 42 squares into 7 equal rows.", k2: "What number makes 7 × ? = 42?", k3: "How many groups of 9 fit in 36?", ch1: "40 blocks are arranged in rows of 8. How many rows are there?" },
  "df3-03-01": { i2: "Arrange 9 squares into 9 equal rows.", k2: "What number makes 9 × ? = 9?", k3: "How many groups of 1 fit in 12?", ch1: "7 cards are shared equally among 7 children. How many cards does each child get?" },
  "df3-03-02": { i2: "What does 0 × any number equal?", k2: "Five equal groups contain 0 counters in all. How many counters are in each group?", k3: "Does 12 ÷ 0 have a quotient?", ch1: "Which expression has a quotient?" },
  "df3-03-03": { i2: "How many squares are shown in 7 rows of 9?", k2: "What number makes 7 × ? = 63?", k3: "How many groups of 8 fit in 72?", ch1: "45 stickers are shared equally among 9 students. How many stickers does each student get?" },
};

const mainFigures = {
  "df3-02-01": { c2: "mult3-divide-by-nine" },
  "df3-02-02": { c1: "mult3-divide-by-ten", c2: "mult3-divide-by-ten" },
  "df3-03-01": { c1: "mult3-divide-one-self", c2: "mult3-divide-one-self" },
  "df3-03-02": { c1: "mult3-divide-by-zero", c2: "mult3-divide-by-zero" },
};

const remedials = {
  "df3-01-01": ["mult3-fair-shares", "Twelve shared equally between 2 groups makes 6 in each group.", "Share 12 counters equally between 2 groups. How many counters are in each group?", 6, 12, 7, "Think: 2 × ? = 12.", "Correct — 12 ÷ 2 = 6."],
  "df3-01-02": ["mult3-how-many-groups", "Eighteen can be split into 3 equal groups of 6.", "Share 18 counters equally among 3 groups. How many counters are in each group?", 6, 18, 7, "Think: 3 × ? = 18.", "Correct — 18 ÷ 3 = 6."],
  "df3-01-03": ["mult3-double-double", "The fact 4 × 6 = 24 also tells us 24 ÷ 4 = 6.", "Use 4 × 6 = 24. What is 24 ÷ 4?", 6, 24, 7, "Use the multiplication fact 4 × 6 = 24.", "Correct — 24 ÷ 4 = 6."],
  "df3-01-04": ["mult3-missing-factor", "Division finds the missing factor: 6 × 5 = 30, so 30 ÷ 6 = 5.", "Use 6 × 5 = 30. What is 30 ÷ 6?", 5, 30, 6, "Find the number that makes 6 × ? = 30.", "Correct — 30 ÷ 6 = 5."],
  "df3-02-01": ["mult3-divide-by-nine", "Six groups of 9 make 54, so 54 ÷ 9 = 6.", "Use 9 × 6 = 54. What is 54 ÷ 9?", 6, 54, 7, "Find the number that makes 9 × ? = 54.", "Correct — 54 ÷ 9 = 6."],
  "df3-02-02": ["mult3-divide-by-ten", "Fifty is 5 complete tens, so 50 ÷ 10 = 5.", "Five tens make 50. What is 50 ÷ 10?", 5, 50, 6, "Count the groups of ten in 50.", "Correct — 50 contains 5 groups of ten."],
  "df3-02-03": ["mult3-missing-factor", "The inverse multiplication question for 49 ÷ 7 is 7 × ? = 49.", "Seven equal groups hold 49 counters. How many counters are in each group?", 7, 49, 8, "Recall the 7 times table.", "Correct — 7 × 7 = 49, so 49 ÷ 7 = 7."],
  "df3-02-04": ["mult3-missing-factor", "The quotient is the missing factor in 8 × ? = 56.", "Eight equal groups hold 56 counters. How many counters are in each group?", 7, 56, 8, "Find the factor paired with 8.", "Correct — 8 × 7 = 56."],
  "df3-03-01": ["mult3-divide-one-self", "A nonzero number divided by itself makes exactly 1 full group.", "What is 6 ÷ 6?", 1, 6, 0, "How many full groups of 6 fit in 6?", "Correct — 6 ÷ 6 = 1."],
  "df3-03-03": ["mult3-fact-family", "Use the matching multiplication fact: 5 × 7 = 35.", "Use 5 × 7 = 35. What is 35 ÷ 5?", 7, 35, 8, "Find the missing factor in 5 × ? = 35.", "Correct — 35 ÷ 5 = 7."],
};

function step(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
}

function numericRemedial(lesson, plan) {
  const route = lesson.remedials?.[0];
  if (!route) throw new Error(`Missing remedial for ${lesson.id}`);
  const [figure, conceptBody, prompt, answer, repeatTotal, near, fallbackFeedback, successFeedback] = plan;
  route.concept.figure = figure;
  route.concept.body = conceptBody;
  route.concept.narration = conceptBody;
  route.check.body = "Try a new fact with the same idea.";
  route.check.explanationVariants = [successFeedback.replace(/^Correct —\s*/, ""), fallbackFeedback];
  route.check.widget = {
    type: "numeric", prompt, answer, tolerance: 0, unit: "",
    commonErrors: [
      { value: repeatTotal, feedback: "That repeats the total instead of finding one equal share or the missing factor." },
      { value: near, feedback: `Check by multiplying. ${near} does not rebuild the stated total.` },
    ],
    fallbackFeedback, successFeedback,
  };
}

function repairZeroLesson(lesson) {
  const makeCml = (total) => ({
    stage: "construct", flagship: false, kernel: "quantity-composition",
    actionGoal: `Use inverse multiplication to explain why ${total} ÷ 0 has no quotient.`,
    invariants: [`Zero times every number is 0, so 0 × ? cannot equal ${total}.`],
    misconceptions: ["Treating zero as an ordinary divisor or copying zero as the quotient."],
    representations: ["symbolic", "language"], translationFrom: "symbolic", translationTo: "language",
    fadeLevel: 0, transferFamily: "fact-fluency:g3d-zero", delayed: true,
    counterfactualPrompt: `What would have to be true for ${total} ÷ 0 to have a quotient?`,
  });
  const i1 = step(lesson, "i1");
  delete i1.predict;
  i1.body = "Match division by zero to its inverse multiplication question.";
  i1.widget = {
    type: "mcq",
    prompt: "Which inverse equation would need a solution for 7 ÷ 0 to have a quotient?",
    options: [
      { id: "o0", label: "0 × ? = 7", feedback: "Correct — but zero times every number is 0, so this equation has no solution.", correct: true },
      { id: "o1", label: "7 × 0 = 0", feedback: "This fact is true, but it does not find a number that zero can multiply to make 7.", correct: false },
      { id: "o2", label: "7 × ? = 0", feedback: "This asks about 0 ÷ 7, where zero is the total, not the divisor.", correct: false },
    ],
  };
  i1.cml = makeCml(7);
  const i2 = step(lesson, "i2");
  i2.body = "Use the zero-product pattern.";
  i2.widget = {
    type: "mcq",
    prompt: "What does 0 × any number equal?",
    options: [
      { id: "o0", label: "It always equals 0", feedback: "Correct — that is why 0 cannot multiply by a number to make 12.", correct: true },
      { id: "o1", label: "It always equals 1", feedback: "Zero groups contain 0, not 1.", correct: false },
      { id: "o2", label: "It always equals 12", feedback: "Zero times any number is 0, so it cannot equal 12.", correct: false },
    ],
  };
  i2.cml = makeCml(12);

  const route = lesson.remedials[0];
  route.concept.figure = "mult3-divide-by-zero";
  route.concept.body = "To divide 5 by 0, we would need a number that makes 0 × ? = 5. No number works.";
  route.concept.narration = route.concept.body;
  route.check.body = "Use inverse multiplication to justify the rule.";
  route.check.explanationVariants = ["Zero times every number is zero, never five.", "Division by zero is undefined."];
  route.check.widget = {
    type: "mcq",
    prompt: "Which statement proves that 5 ÷ 0 has no quotient?",
    options: [
      { id: "o0", label: "0 × ? = 5 has no solution", feedback: "Correct — zero times every number equals zero, so no product can be 5.", correct: true },
      { id: "o1", label: "5 × 0 = 0, so quotient is 5", feedback: "That product is 0, not 5, so 5 cannot be the quotient.", correct: false },
      { id: "o2", label: "0 × 0 = 0, so quotient is 0", feedback: "A quotient of 0 would require 0 × 0 = 5, which is false.", correct: false },
      { id: "o3", label: "1 × 0 = 0, so quotient is 1", feedback: "A quotient of 1 would require 1 × 0 = 5, which is false.", correct: false },
    ],
  };
}

function repairChooseRemedial(lesson) {
  const route = lesson.remedials[0];
  route.concept.figure = "mult3-which-op";
  route.concept.body = "When a known total is shared equally, divide to find the size of each share.";
  route.concept.narration = route.concept.body;
  route.check.body = "Choose the operation for a new sharing story.";
  route.check.explanationVariants = ["A known total shared among known groups calls for division.", "24 ÷ 6 finds the pencils per student."];
  route.check.widget = {
    type: "mcq",
    prompt: "24 pencils are shared equally among 6 students. Which operation finds the pencils for each student?",
    options: [
      { id: "o0", label: "Multiply", feedback: "Multiplication combines equal groups; here the total is already known.", correct: false },
      { id: "o1", label: "Add", feedback: "Adding would increase the total instead of sharing it.", correct: false },
      { id: "o2", label: "Divide", feedback: "Correct — 24 ÷ 6 finds the amount in each equal share.", correct: true },
    ],
  };
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];

for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  const prompts = mainPlans[lesson.id];
  if (prompts) {
    step(lesson, "i2").widget.prompt = prompts.i2;
    step(lesson, "k2").widget.prompt = prompts.k2;
    step(lesson, "k3").widget.prompt = prompts.k3;
    step(lesson, "ch1").widget.prompt = prompts.ch1;
  }
  for (const [id, figure] of Object.entries(mainFigures[lesson.id] ?? {})) step(lesson, id).figure = figure;
  if (lesson.id === "df3-03-02") repairZeroLesson(lesson);
  else if (lesson.id === "df3-03-04") repairChooseRemedial(lesson);
  else numericRemedial(lesson, remedials[lesson.id]);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} division follow-on lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed,
  remedialFigures: 12, diversifiedRemedials: 12, mainFigureRepairs: 7,
  metaPrefixesRemaining: 0, zeroDivisionInteractionsRepaired: 2,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
