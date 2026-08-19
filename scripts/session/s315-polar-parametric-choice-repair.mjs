/** S315 — source-local Polar & Parametric MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "polar-parametric", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceJson = (value) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const maskedContract = (widget) => { const copy = JSON.parse(JSON.stringify(widget)); for (const option of copy.options) option.label = "__LABEL__"; return copy; };
const choices = Object.freeze([
  { workId: "CHOICE-0189", lessonId: "pp-02-03", stepId: "k3", kind: "check", contractHash: "bd8b842d18a14d8a1f9ba567b213f888cf9bd4f2c18c498e3a8b21e17c2ea556", labels: [["o1", "Convex (a/b = 2.5 ≥ 2)", "Convex limaçon; a/b = 2.5 means no dimple."], ["o2", "Dimpled", "Dimpled limaçon; this needs 1 < a/b < 2."], ["o3", "Cardioid", "Cardioid; this needs a/b to equal 1 exactly."]] },
  { workId: "CHOICE-0190", lessonId: "pp-03-03", stepId: "k2", kind: "check", contractHash: "135fb39d3a05d29384471a10f6a4cda524d4ee41c402fd3112776c08c2b7536f", labels: [["o1", "2 (the k = 0 root)", "2, the real cube root of 8 when k = 0."], ["o2", "8", "8, the original value rather than a cube root."], ["o3", "4", "4, whose cube is 64 rather than 8."]] },
  { workId: "CHOICE-0191", lessonId: "pp-04-01", stepId: "k3", kind: "check", contractHash: "1bfcddc9883a26f0eb0a4b0a532c211ce028251b35acda198f0f4091c0e86214", labels: [["o1", "Different t values (like ±1) give the same x but different y", "Two t-values share x but give different y-values."], ["o2", "Because t² is always positive", "Squaring t makes x nonnegative, not multivalued."], ["o3", "It actually is a function", "It passes the vertical-line test as one y for each x."]] },
  { workId: "CHOICE-0192", lessonId: "pp-05-03", stepId: "k1", kind: "check", contractHash: "1a3ed6c3966985a333a88597306d5eac0bffc481bc5c465810b404793fd4b417", labels: [["o1", "a downward parabola (negative x² coefficient)", "Downward-opening parabola; its x² coefficient is negative."], ["o2", "a straight line", "Straight line; it would have no x² coefficient."], ["o3", "an upward parabola", "Upward-opening parabola; its x² coefficient is positive."]] },
]);

const files = new Map();
async function source(lessonId) { const file = path.join(directory, `${lessonId}.json`); if (!files.has(file)) files.set(file, await readFile(file, "utf8")); return [file, files.get(file)]; }
function lesson(text) { return JSON.parse(text); }
function findStep(raw, stepId) { const found = raw.steps.find((entry) => entry.id === stepId); if (!found) throw new Error(`missing ${raw.id}/${stepId}`); return found; }
function replaceOnce(text, pattern, replacement, label) { let count = 0; const updated = text.replace(pattern, (...matches) => { count += 1; return replacement.replace(/\$(\d+)/g, (_, index) => String(matches[Number(index)] ?? "")); }); if (count !== 1) throw new Error(`${label}: expected one raw source match, found ${count}`); return updated; }

for (const target of choices) {
  const [, text] = await source(target.lessonId);
  const step = findStep(lesson(text), target.stepId);
  const widget = step.widget;
  if (step.kind !== target.kind || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected ${target.kind} MCQ`);
  if (hash(maskedContract(widget)) !== target.contractHash) throw new Error(`${target.workId}: non-label contract drift`);
  if (widget.options.map((option) => option.id).join(",") !== "o1,o2,o3" || widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: option or correct-answer drift`);
  for (const [optionId, before, after] of target.labels) { const option = widget.options.find((candidate) => candidate.id === optionId); if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`); }
}

let changed = 0;
for (const target of choices) {
  const [file] = await source(target.lessonId);
  let text = files.get(file);
  for (const [optionId, before, after] of target.labels) {
    if (findStep(lesson(text), target.stepId).widget.options.find((option) => option.id === optionId).label === after) continue;
    const unicodeLiteral = JSON.stringify(before);
    const beforeLiteral = text.includes(unicodeLiteral) ? unicodeLiteral : sourceJson(before);
    const afterLiteral = beforeLiteral === unicodeLiteral ? JSON.stringify(after) : sourceJson(after);
    const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(beforeLiteral)}`);
    text = replaceOnce(text, pattern, `$1${afterLiteral}`, `${target.workId}/${optionId}`);
    changed += 1;
  }
  files.set(file, text);
}

if (check && changed) throw new Error(`S315 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "polar-parametric", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
