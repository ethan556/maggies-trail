/** S298 — source-local figure withholding and MCQ-parity repair for solving-equations. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "solving-equations", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const figure = Object.freeze({
  workId: "VIS-alg1-04-02-c1-flip-arrow",
  lessonId: "alg1-04-02",
  stepId: "c1",
  figure: "flip-arrow",
  body: "One move breaks the pattern: **multiplying or dividing by a negative flips the inequality**. Solve −2x < 6 by dividing by −2 — and the `<` becomes `>`: **x > −3**. The number line mirrors across zero, so the direction reverses.",
  narration: "One move breaks the pattern: multiplying or dividing by a negative flips the inequality. Solve negative two x less than six by dividing by negative two — and the less-than becomes greater-than: x greater than negative three. The number line mirrors across zero, so the direction reverses.",
});
const choice = Object.freeze({
  workId: "CHOICE-0001",
  lessonId: "alg1-01-02",
  stepId: "k3",
  evaluatorHash: "f05bbd793ee51cae36bbebefd448dedce6134b0e6939bddc332b178ffa8a219c",
  feedbackHash: "a2a69371e00bce5f13db659c7ab8c842631136bb355714925b15f13be4421329",
  labels: [["a", "removing it from one side only would unbalance the equation", "Both sides must stay equal"], ["b", "because 3x is negative", "3x has to be negative"], ["c", "you don't — one side is enough", "One side can change alone"]],
});

const files = new Map();
async function source(lessonId) {
  const file = path.join(directory, `${lessonId}.json`);
  if (!files.has(file)) files.set(file, await readFile(file, "utf8"));
  return [file, files.get(file)];
}
const lesson = (text) => JSON.parse(text);
function step(raw, stepId) {
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
  const current = step(lesson(text), figure.stepId);
  if (current.kind !== "concept" || current.widget !== undefined || current.body !== figure.body || current.narration !== figure.narration || (current.figure !== figure.figure && current.figure !== undefined)) {
    throw new Error(`${figure.workId}: concept/evaluator contract drift`);
  }
}
{
  const [, text] = await source(choice.lessonId);
  const current = step(lesson(text), choice.stepId);
  const widget = current.widget;
  if (current.kind !== "check" || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${choice.workId}: expected MCQ`);
  if (hash(evaluator(widget)) !== choice.evaluatorHash || hash(widget.options.map((option) => [option.id, option.feedback ?? null])) !== choice.feedbackHash) throw new Error(`${choice.workId}: evaluator or feedback drift`);
  if (widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "a") throw new Error(`${choice.workId}: correct-answer drift`);
  for (const [id, before, after] of choice.labels) {
    const option = widget.options.find((candidate) => candidate.id === id);
    if (!option || (option.label !== before && option.label !== after)) throw new Error(`${choice.workId}/${id}: label drift`);
  }
}

let changed = 0;
{
  const [file, text] = await source(figure.lessonId);
  if (step(lesson(text), figure.stepId).figure === figure.figure) {
    files.set(file, replaceOnce(text, /^[ \t]*"figure"\s*:\s*"flip-arrow",\r?\n/m, "", figure.workId));
    changed += 1;
  }
}
{
  const [file] = await source(choice.lessonId);
  let text = files.get(file);
  for (const [optionId, before, after] of choice.labels) {
    if (step(lesson(text), choice.stepId).widget.options.find((option) => option.id === optionId).label === after) continue;
    const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(choice.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(JSON.stringify(before))}`);
    text = replaceOnce(text, pattern, `$1${JSON.stringify(after)}`, `${choice.workId}/${optionId}`);
    changed += 1;
  }
  files.set(file, text);
}

if (check && changed) throw new Error(`S298 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
console.log(JSON.stringify({ course: "solving-equations", figureWithholds: 1, choiceRows: 1, changed, current: changed === 0 }));
