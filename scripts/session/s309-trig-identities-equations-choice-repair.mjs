/** S309 — source-local Trig Identities & Equations MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "trig-identities-equations", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceJson = (value) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const maskedContract = (widget) => { const copy = JSON.parse(JSON.stringify(widget)); for (const option of copy.options) option.label = "__LABEL__"; return copy; };
const choices = Object.freeze([
  { workId: "CHOICE-0267", lessonId: "ti-01-01", stepId: "k3", kind: "check", contractHash: "35719699de3b73ecba99fc7e5c58d490e27eb6b13ce9ec07e823277d67d1382d", labels: [["o1", "x = π/3 + 2πk or x = 5π/3 + 2πk", "x = π/3 + 2πk or x = 5π/3 + 2πk; both cosine branches."], ["o2", "x = π/3 + 2πk only", "x = π/3 + 2πk; it names only one cosine branch."], ["o3", "x = π/3 + πk", "x = π/3 + πk; it includes angles where cosine is −1/2."]] },
  { workId: "CHOICE-0268", lessonId: "ti-01-02", stepId: "k2", kind: "check", contractHash: "69f305ae27513733acdcce00b1fc06e559120bef40b6d1e00b581053ce167f97", labels: [["o1", "x = πk (one merged family)", "x = πk; this single family includes every sine zero."], ["o2", "x = 2πk only", "x = 2πk; it keeps only the even multiples of π."], ["o3", "x = π/2 + πk", "x = π/2 + πk; it lists cosine zeros instead."]] },
  { workId: "CHOICE-0269", lessonId: "ti-02-02", stepId: "k3", kind: "check", contractHash: "08d0f85a000eb01c4d32d003415b7b56f8bcaa58b13e3e00a942d19f17e8b6b6", labels: [["o1", "1", "1, after converting cot²θ to csc²θ and simplifying."], ["o2", "sin²θ", "sin²θ, after stopping before the cotangent term."], ["o3", "cot²θ", "cot²θ, after dropping the sine-squared factor."]] },
  { workId: "CHOICE-0270", lessonId: "ti-02-03", stepId: "k1", kind: "check", contractHash: "071b1776013d0469b748032d2b0d90675a5afbf5b70bf2cf5c7d16785f2efd58", labels: [["o1", "sin θ — the proof is complete", "sin θ, after cancelling cos θ on the stated domain."], ["o2", "sin θ·cos²θ", "sin θ·cos²θ, after multiplying instead of cancelling."], ["o3", "tan θ", "tan θ, after leaving the original quotient unsimplified."]] },
  { workId: "CHOICE-0271", lessonId: "ti-03-02", stepId: "k3", kind: "check", contractHash: "6c092fa92716f1b73d5e66d462211f69b2cb377a8e3c710c0ec9c45052e70b93", labels: [["o1", "cos θ (since sin90° = 1, cos90° = 0)", "cos θ, since the sine term survives the expansion."], ["o2", "sin θ", "sin θ, if the cofunction relation is reversed."], ["o3", "1 − sin θ", "1 − sin θ, if the subtraction formula is misread."]] },
]);
const files = new Map();
async function source(lessonId) { const file = path.join(directory, `${lessonId}.json`); if (!files.has(file)) files.set(file, await readFile(file, "utf8")); return [file, files.get(file)]; }
function lesson(text) { return JSON.parse(text); }
function findStep(raw, stepId) { const found = raw.steps.find((entry) => entry.id === stepId); if (!found) throw new Error(`missing ${raw.id}/${stepId}`); return found; }
function replaceOnce(text, pattern, replacement, label) { let count = 0; const updated = text.replace(pattern, (...matches) => { count += 1; return replacement.replace(/\$(\d+)/g, (_, index) => String(matches[Number(index)] ?? "")); }); if (count !== 1) throw new Error(`${label}: expected one raw source match, found ${count}`); return updated; }
for (const target of choices) { const [, text] = await source(target.lessonId); const step = findStep(lesson(text), target.stepId); const widget = step.widget; if (step.kind !== target.kind || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected ${target.kind} MCQ`); if (hash(maskedContract(widget)) !== target.contractHash) throw new Error(`${target.workId}: non-label contract drift`); if (widget.options.map((option) => option.id).join(",") !== "o1,o2,o3" || widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: option or correct-answer drift`); for (const [optionId, before, after] of target.labels) { const option = widget.options.find((candidate) => candidate.id === optionId); if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`); } }
let changed = 0;
for (const target of choices) { const [file] = await source(target.lessonId); let text = files.get(file); for (const [optionId, before, after] of target.labels) { if (findStep(lesson(text), target.stepId).widget.options.find((option) => option.id === optionId).label === after) continue; const unicodeLiteral = JSON.stringify(before); const beforeLiteral = text.includes(unicodeLiteral) ? unicodeLiteral : sourceJson(before); const afterLiteral = beforeLiteral === unicodeLiteral ? JSON.stringify(after) : sourceJson(after); const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(beforeLiteral)}`); text = replaceOnce(text, pattern, `$1${afterLiteral}`, `${target.workId}/${optionId}`); changed += 1; } files.set(file, text); }
if (check && changed) throw new Error(`S309 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "trig-identities-equations", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
