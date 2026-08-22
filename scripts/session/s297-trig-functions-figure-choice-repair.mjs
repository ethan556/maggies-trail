/** S297 — exact figure truth and parallel-choice repair for trig-functions. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "trig-functions", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const figure = Object.freeze({
  workId: "VIS-tf-01-01-c1-sohcahtoa-triangle",
  lessonId: "tf-01-01",
  stepId: "c1",
  figure: "sohcahtoa-triangle",
  before: "Stand at an acute angle θ of a right triangle. The side across from you is the **opposite**; the side touching you (not the hypotenuse) is the **adjacent**; the longest side, across from the right angle, is the **hypotenuse**. Three ratios of these sides get names: **sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj** — SOH-CAH-TOA.",
  after: "Stand at an acute angle θ of the 3-4-5 right triangle shown. The side across from θ is the **opposite** (3); the side touching θ (not the hypotenuse) is the **adjacent** (4); the longest side, across from the right angle, is the **hypotenuse** (5). So **sin θ = 3/5, cos θ = 4/5, tan θ = 3/4** — SOH-CAH-TOA. The same opposite, adjacent, and hypotenuse labels define the ratios in every right triangle.",
});

const choices = Object.freeze([
  {
    workId: "CHOICE-0256", lessonId: "tf-03-01", stepId: "i3",
    evaluatorHash: "e4b38c05713d5f0d845d2c9e43fad22b6a993403bcf55a29af07454e2c48cf84",
    feedbackHash: "20165b07a932aa1062a6991f07dce5a458e88d59587dbe47096e4e08103c01f5",
    labels: [["o1", "Undefined — the point is (0, 1), and y/x divides by zero", "Undefined: zero denominator"], ["o2", "1", "1: equal x- and y-values"], ["o3", "0", "0: zero y-coordinate"], ["o4", "90", "90: the input angle"]],
  },
  {
    workId: "CHOICE-0257", lessonId: "tf-04-01", stepId: "i2",
    evaluatorHash: "12e6eb5faf35d8fa87752a5c51e6fd9c564076e7f9e9f449d25a0665bedae11b",
    feedbackHash: "a7feb5178f2c6bdfe6e0ad3d4dbb6516ea0be44ca8f2a0cce9caa724c8a85d59",
    labels: [["o1", "Sine starts at 0 and rises; cosine starts at its peak, 1", "sin 0 = 0; cos 0 = 1"], ["o2", "They start at the same value", "sin 0 = cos 0"], ["o3", "Cosine starts at 0", "cos 0 = 0; sin 0 = 1"], ["o4", "Sine starts at its minimum", "sin 0 = −1; cos 0 = 1"]],
  },
  {
    workId: "CHOICE-0258", lessonId: "tf-05-03", stepId: "k2",
    evaluatorHash: "88d08d84ebb1448c22fe79ed557a8940e92d824333837ac3007e728f04aa27d5",
    feedbackHash: "4faf5e765b16e6c1dd58a04b694d443513ad9bbcfae19167d589cdab9f9fa5e5",
    labels: [["o1", "Squaring erases sign — both ±0.8 square to 0.64, and the quadrant restores it", "+0.8 and −0.8 both square to 0.64"], ["o2", "It's rounding error in the identity", "Rounding creates a second value"], ["o3", "The identity only works in Quadrant I", "The identity only works in QI"], ["o4", "Sine has two possible values", "Sine has a second value"]],
  },
]);

const files = new Map();
async function source(lessonId) {
  const file = path.join(directory, `${lessonId}.json`);
  if (!files.has(file)) files.set(file, await readFile(file, "utf8"));
  return [file, files.get(file)];
}
function lesson(text) { return JSON.parse(text); }
function findStep(raw, stepId) {
  const found = raw.steps.find((entry) => entry.id === stepId);
  if (!found) throw new Error(`missing ${raw.id}/${stepId}`);
  return found;
}
function evaluator(widget) {
  const { prompt: _prompt, options, ...rest } = widget;
  return { ...rest, options: options.map(({ label: _label, ...option }) => option) };
}
function replaceOnce(text, pattern, replacement, label) {
  let count = 0;
  const updated = text.replace(pattern, (...matches) => {
    count += 1;
    return replacement.replace(/\$(\d+)/g, (_, index) => String(matches[Number(index)] ?? ""));
  });
  if (count !== 1) throw new Error(`${label}: expected one raw source match, found ${count}`);
  return updated;
}

{
  const [, text] = await source(figure.lessonId);
  const step = findStep(lesson(text), figure.stepId);
  if (step.kind !== "concept" || step.figure !== figure.figure || step.widget !== undefined || (step.body !== figure.before && step.body !== figure.after)) {
    throw new Error(`${figure.workId}: figure/evaluator contract drift`);
  }
}
for (const target of choices) {
  const [, text] = await source(target.lessonId);
  const step = findStep(lesson(text), target.stepId);
  const widget = step.widget;
  if (step.kind !== "interactive" && step.kind !== "check") throw new Error(`${target.workId}: step-kind drift`);
  if (!widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected MCQ`);
  if (hash(evaluator(widget)) !== target.evaluatorHash || hash(widget.options.map((option) => [option.id, option.feedback ?? null])) !== target.feedbackHash) throw new Error(`${target.workId}: evaluator or feedback drift`);
  if (widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: correct-answer drift`);
  for (const [optionId, before, after] of target.labels) {
    const option = widget.options.find((candidate) => candidate.id === optionId);
    if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`);
  }
}

let changed = 0;
{
  const [file, text] = await source(figure.lessonId);
  if (findStep(lesson(text), figure.stepId).body === figure.before) {
    files.set(file, replaceOnce(text, new RegExp(escape(JSON.stringify(figure.before))), JSON.stringify(figure.after), figure.workId));
    changed += 1;
  }
}
for (const target of choices) {
  const [file] = await source(target.lessonId);
  let text = files.get(file);
  for (const [optionId, before, after] of target.labels) {
    if (findStep(lesson(text), target.stepId).widget.options.find((option) => option.id === optionId).label === after) continue;
    const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(JSON.stringify(before))}`);
    text = replaceOnce(text, pattern, `$1${JSON.stringify(after)}`, `${target.workId}/${optionId}`);
    changed += 1;
  }
  files.set(file, text);
}

if (check && changed) throw new Error(`S297 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
console.log(JSON.stringify({ course: "trig-functions", figureRows: 1, choiceRows: choices.length, changed, current: changed === 0 }));
