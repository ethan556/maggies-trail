/** S304 — source-local Rational Functions MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "rational-functions", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceJson = (value) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const choices = Object.freeze([
  { workId: "CHOICE-0216", lessonId: "rf-01-01", stepId: "i2", kind: "interactive", evaluatorHash: "fff433c8203e4f6f88cc5e23bd98506b2e18ec7bdf3e7c87ac3bcfa8263155d3", feedbackHash: "1d8190302511ea72c5b3a00ded6e6fe19674d7f4d9cef0acb6bf32915b0e0e33", labels: [["o1", "f(6) = 0 — a perfectly legal output", "f(6) = 0; the denominator is nonzero there."], ["o2", "x = 6 is excluded", "x = 6 is excluded because the denominator becomes zero."], ["o3", "f(6) is undefined", "f(6) is undefined because its numerator becomes zero."], ["o4", "f(6) = 6", "f(6) = 6 because the input is used as the output."]] },
  { workId: "CHOICE-0217", lessonId: "rf-01-01", stepId: "k3", kind: "check", evaluatorHash: "13ef4a490c1a4e2377f8af79c8fb44372739c1b17f98206b93e0f352678bb7d2", feedbackHash: "228ffd809545a29876b0317bbbc3124162844e0925d4d0134d87a41af9ed3628", labels: [["o1", "none — the denominator is never zero", "None; x² + 4 stays positive for every real x."], ["o2", "x = 2 and x = −2", "x = 2 and −2; their squares make the denominator zero."], ["o3", "x = −4", "x = −4; it makes the denominator equal to zero."], ["o4", "x = 1", "x = 1; it makes the denominator equal to zero."]] },
  { workId: "CHOICE-0218", lessonId: "rf-01-02", stepId: "k1", kind: "check", evaluatorHash: "9b232bd672d49cccc53b0e3b5202a75f60328d4ba575acf3c08cd723f54051e8", feedbackHash: "a6860479deb2d2a363a0af53b6f5e46b7dcf539530ad7f4ee2c32eb93eb03bb0", labels: [["o1", "it's already fully simplified", "It is already simplified; no common factor cancels."], ["o2", "3", "It simplifies to 3 after canceling the variable terms."], ["o3", "x + 3", "It simplifies to x + 3 after combining the terms."], ["o4", "x + 4", "It simplifies to x + 4 after combining the terms."]] },
  { workId: "CHOICE-0219", lessonId: "rf-04-01", stepId: "k1", kind: "check", evaluatorHash: "1756f5a5cf831c2644cac06c3eb6476c84aa8d8b6bc3ee712bf446ea294cf005", feedbackHash: "19e4279380c5aeeecb1c8579e24af557e89e55428302aa7f8583d28d1efd9991", labels: [["o1", "a fraction equals 0 only when its numerator does — and this one is always 1", "The numerator is always 1, so the fraction cannot equal 0."], ["o2", "because x = 0 is excluded", "x = 0 is excluded, so 1/x cannot ever be zero."], ["o3", "it does, at very large x", "At very large x, 1/x becomes exactly equal to zero."], ["o4", "because 1/x is always positive", "Because 1/x is positive for every allowable input."]] },
  { workId: "CHOICE-0220", lessonId: "rf-04-02", stepId: "k2", kind: "check", evaluatorHash: "703b065affe9ef8bb6eb5910e686bf58dca77d8f35db64e3ce83dec0f451ac71", feedbackHash: "6bd32341fa2e97b38b20ac83aa8de44b2ad81aedae64c11204adf00807c21406", labels: [["o1", "a vertical asymptote at x = 3", "A vertical asymptote at x = 3; a denominator factor remains."], ["o2", "a hole at x = 3", "A hole occurs at x = 3 because the zero factor cancels completely."], ["o3", "f(3) = 2", "f(3) = 2 because division by zero leaves the numerator unchanged."], ["o4", "f(3) = 0", "f(3) = 0 because the zero denominator forces a zero output."]] },
  { workId: "CHOICE-0221", lessonId: "rf-04-02", stepId: "k3", kind: "check", evaluatorHash: "7e4e78e4b2f54c86ad75ad7897f84634f75815e3747d2e6e951471a3a9eec020", feedbackHash: "836596a7b5632e48a0de5a1cb5bb2d4f556cabe95bedb5e1812a443d9cdc9981", labels: [["o1", "a vertical asymptote — one (x − 5) survives below", "A vertical asymptote remains because one x − 5 factor stays below."], ["o2", "a hole", "A hole remains because both x − 5 factors cancel completely."], ["o3", "f(5) = 1", "f(5) = 1 because the identical factors cancel at x = 5."], ["o4", "nothing special", "Nothing special happens because the factors cancel completely."]] },
  { workId: "CHOICE-0222", lessonId: "rf-04-03", stepId: "i2", kind: "interactive", evaluatorHash: "66d477ae6f6926e1df3f0899d7ecd5cbd06b2d18f45f8b6adf5667dd1f0c434b", feedbackHash: "2b9b025d62d69b380881a646300928f744f6e7f2bfca8dabb739044d35b1b47a", labels: [["o1", "none — the top's degree is larger", "No horizontal asymptote; degree top is greater."], ["o2", "y = 0", "y = 0 because the denominator’s degree is lower."], ["o3", "y = 1", "y = 1 because leading coefficients are both 1."], ["o4", "y = 1/2", "y = 1/2 because the denominator has coefficient 2."]] },
  { workId: "CHOICE-0223", lessonId: "rf-05-01", stepId: "k3", kind: "check", evaluatorHash: "756addc8690b5e7c5d06be04eeb29e67904be8ebc7282ce346759869de76eac6", feedbackHash: "e0d20ce22f22939ae71419dcc44bca796925e50b5aab3d9bc9aca6a80bf70cfc", labels: [["o1", "no solution — the only candidate is excluded", "No solution; the only candidate x = 1 is excluded."], ["o2", "x = 1", "x = 1 because both sides have the same denominator."], ["o3", "x = 5", "x = 5 because the numerators become equal at that input."], ["o4", "x = −2", "x = −2 because it makes the right numerator equal zero."]] },
]);

const files = new Map();
async function source(lessonId) { const file = path.join(directory, `${lessonId}.json`); if (!files.has(file)) files.set(file, await readFile(file, "utf8")); return [file, files.get(file)]; }
function lesson(text) { return JSON.parse(text); }
function findStep(raw, stepId) { const found = raw.steps.find((entry) => entry.id === stepId); if (!found) throw new Error(`missing ${raw.id}/${stepId}`); return found; }
function evaluator(widget) { const { prompt: _prompt, options, ...rest } = widget; return { ...rest, options: options.map(({ label: _label, ...option }) => option) }; }
function replaceOnce(text, pattern, replacement, label) { let count = 0; const updated = text.replace(pattern, (...matches) => { count += 1; return replacement.replace(/\$(\d+)/g, (_, index) => String(matches[Number(index)] ?? "")); }); if (count !== 1) throw new Error(`${label}: expected one raw source match, found ${count}`); return updated; }

for (const target of choices) {
  const [, text] = await source(target.lessonId); const step = findStep(lesson(text), target.stepId); const widget = step.widget;
  if (step.kind !== target.kind || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected ${target.kind} MCQ`);
  if (hash(evaluator(widget)) !== target.evaluatorHash || hash(widget.options.map((option) => [option.id, option.feedback ?? null])) !== target.feedbackHash) throw new Error(`${target.workId}: evaluator or feedback drift`);
  if (widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: correct-answer drift`);
  for (const [optionId, before, after] of target.labels) { const option = widget.options.find((candidate) => candidate.id === optionId); if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`); }
}

let changed = 0;
for (const target of choices) {
  const [file] = await source(target.lessonId); let text = files.get(file);
  for (const [optionId, before, after] of target.labels) {
    if (findStep(lesson(text), target.stepId).widget.options.find((option) => option.id === optionId).label === after) continue;
    const unicodeLiteral = JSON.stringify(before); const beforeLiteral = text.includes(unicodeLiteral) ? unicodeLiteral : sourceJson(before); const afterLiteral = beforeLiteral === unicodeLiteral ? JSON.stringify(after) : sourceJson(after);
    const pattern = new RegExp(`(\\{\\s*"id"\\s*:\\s*"${escape(target.stepId)}"[\\s\\S]*?"id"\\s*:\\s*"${escape(optionId)}"\\s*,\\s*"label"\\s*:\\s*)${escape(beforeLiteral)}`);
    text = replaceOnce(text, pattern, `$1${afterLiteral}`, `${target.workId}/${optionId}`); changed += 1;
  }
  files.set(file, text);
}
if (check && changed) throw new Error(`S304 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "rational-functions", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
