/** S312 — source-local Function Transformations MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "function-transformations", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceJson = (value) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const maskedContract = (widget) => { const copy = JSON.parse(JSON.stringify(widget)); for (const option of copy.options) option.label = "__LABEL__"; return copy; };
const choices = Object.freeze([
  { workId: "CHOICE-0082", lessonId: "ft-03-03", stepId: "i1", kind: "interactive", contractHash: "91898a18617df5fb0c42c690bca1c244003fa19c1dbbf84d7e23e0a0506562d9", labels: [["o1", "the −2 in front", "The −2 in front; its negative sign reflects the parabola."], ["o2", "the 1 inside", "The 1 inside; it shifts the parabola horizontally."], ["o3", "the 8 outside", "The 8 outside; it shifts the parabola vertically."], ["o4", "the exponent 2", "The exponent 2; it sets the graph's quadratic shape."]] },
  { workId: "CHOICE-0083", lessonId: "ft-04-01", stepId: "k3", kind: "check", contractHash: "f5cdddddd390882e2687b34b981979a36d33b16eaffd6dc3c32585b9f13f1c8e", labels: [["o1", "evaluate f(x) and g(x) separately, then subtract g's output from f's", "Evaluate f(x) and g(x), then subtract g(x) from f(x)."], ["o2", "feed g's output into f", "Evaluate g(x), then use its output as f's input value."], ["o3", "the same thing as (g − f)(x)", "Reverse the subtraction to calculate (g − f)(x) instead."], ["o4", "multiply f's output by g's, then negate", "Multiply f(x) by g(x), then change the product's sign."]] },
]);
const files = new Map();
async function source(lessonId) { const file = path.join(directory, `${lessonId}.json`); if (!files.has(file)) files.set(file, await readFile(file, "utf8")); return [file, files.get(file)]; }
function lesson(text) { return JSON.parse(text); }
function findStep(raw, stepId) { const found = raw.steps.find((entry) => entry.id === stepId); if (!found) throw new Error(`missing ${raw.id}/${stepId}`); return found; }
function replaceOnce(text, pattern, replacement, label) { let count = 0; const updated = text.replace(pattern, (...matches) => { count += 1; return replacement.replace(/\$(\d+)/g, (_, index) => String(matches[Number(index)] ?? "")); }); if (count !== 1) throw new Error(`${label}: expected one raw source match, found ${count}`); return updated; }
for (const target of choices) { const [, text] = await source(target.lessonId); const step = findStep(lesson(text), target.stepId); const widget = step.widget; if (step.kind !== target.kind || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected ${target.kind} MCQ`); if (hash(maskedContract(widget)) !== target.contractHash) throw new Error(`${target.workId}: non-label contract drift`); if (widget.options.map((option) => option.id).join(",") !== "o1,o2,o3,o4" || widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: option or correct-answer drift`); for (const [optionId, before, after] of target.labels) { const option = widget.options.find((candidate) => candidate.id === optionId); if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`); } }
let changed = 0;
for (const target of choices) { const [file] = await source(target.lessonId); let text = files.get(file); for (const [optionId, before, after] of target.labels) { if (findStep(lesson(text), target.stepId).widget.options.find((option) => option.id === optionId).label === after) continue; const unicodeLiteral = JSON.stringify(before); const beforeLiteral = text.includes(unicodeLiteral) ? unicodeLiteral : sourceJson(before); const afterLiteral = beforeLiteral === unicodeLiteral ? JSON.stringify(after) : sourceJson(after); const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(beforeLiteral)}`); text = replaceOnce(text, pattern, `$1${afterLiteral}`, `${target.workId}/${optionId}`); changed += 1; } files.set(file, text); }
if (check && changed) throw new Error(`S312 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "function-transformations", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
