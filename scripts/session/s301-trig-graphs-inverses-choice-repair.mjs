/** S301 — source-local Trig Graphs & Inverses MCQ choice-parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const directory = path.join(root, "content", "courses", "trig-graphs-inverses", "lessons");
const check = process.argv.includes("--check");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceJson = (value) => JSON.stringify(value).replace(/[^\x20-\x7e]/g, (character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`);
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const choices = Object.freeze([
  { workId: "CHOICE-0259", lessonId: "tg-02-01", stepId: "k2", kind: "check", evaluatorHash: "59e9f0fcd34becc3c7e4650330689322372cb0451c05b61521f9cbf3923dad56", feedbackHash: "92f8877eea3f89a0f9830fe7d34dd328d0328ef409a9a54a31e5616b6bf1d718", labels: [["o1", "x = π/2, heading down", "x = π/2; the curve crosses the midline while falling."], ["o2", "x = 0", "x = 0; that point is the cosine graph’s peak."], ["o3", "x = π", "x = π; that point is the cosine graph’s trough."]] },
  { workId: "CHOICE-0260", lessonId: "tg-02-03", stepId: "k3", kind: "check", evaluatorHash: "0cce71e89f9eb1e502a48c128c5eacbad96735b8a08572f1c7d80a08be979644", feedbackHash: "71c45af3d4ada2fc297dc60307be048ea02f531b60582bad230f1e5e0c407756", labels: [["o1", "They give 2 and −2 — different graphs (they're reflections)", "They give 2 and −2, so the graphs are reflections."], ["o2", "Both give 2 — same graph", "They both give 2, so the graphs are the same."], ["o3", "Both give 0 — same graph", "They both give 0, so the graphs are the same."]] },
  { workId: "CHOICE-0261", lessonId: "tg-03-03", stepId: "k2", kind: "check", evaluatorHash: "6e7a3c5e55e1272bcce8ee4673457817cbbad16f8fbc8b6d4a0d13aa7ae2fa2c", feedbackHash: "8a565db456dc7bfd14bbb7f5a840641b5d33add76927f406ec0d1fe7fa05482c", labels: [["o1", "Steepens each branch — the graph still has no maximum", "It steepens each branch; tangent still has no maximum."], ["o2", "Sets the maximum value to 3", "It sets a maximum height of 3 on every branch."], ["o3", "Changes the period to π/3", "It changes the period so each cycle lasts π/3."]] },
  { workId: "CHOICE-0262", lessonId: "tg-04-01", stepId: "k1", kind: "check", evaluatorHash: "6c65f6daa76f57d5119fbf651707462a2ba11329ab31bbf23341287f983bc374", feedbackHash: "24de5f39d452640a978bddcf2807ff91a7405a728cee692984f24270cb265ec4", labels: [["o1", "5π/6 is outside the restricted branch [−π/2, π/2] that defines arcsin", "Its angle is outside arcsin’s branch [−π/2, π/2]."], ["o2", "Because 5π/6 is negative", "Because 5π/6 is negative, outside arcsin’s branch."], ["o3", "It is — arcsin has two values", "It is valid because arcsin returns both matching angles."]] },
  { workId: "CHOICE-0263", lessonId: "tg-04-01", stepId: "k3", kind: "check", evaluatorHash: "3b223778ddf42bb136dded855c8ad8e26177d68a64270f422857886ba3e7bb5e", feedbackHash: "a55309591e9faf303903642012e704c1daf471be9f971aedd62c23b48e91d31a", labels: [["o1", "Undefined — no angle has sine 2", "Undefined: no angle has sine equal to 2."], ["o2", "π/2", "π/2: sine reaches its largest value there."], ["o3", "About 1.09", "About 1.09 radians, the angle with sine 2."]] },
  { workId: "CHOICE-0264", lessonId: "tg-04-02", stepId: "ch1", kind: "challenge", evaluatorHash: "72d00c35957a6ec9b6bbbcfcb89ecd6f7f12c6dddde1326ac2a348ee60f61419", feedbackHash: "a4dd59489cf51bf5d1551d49387af479ead5f5d76856cfd5b648b9bced44cc34", labels: [["o1", "It approaches π/2 but never reaches it — a horizontal asymptote", "It approaches π/2; that value is a horizontal asymptote."], ["o2", "It grows without bound too", "It grows without bound as x continues to increase."], ["o3", "It reaches π/2 at x = 1000", "It reaches π/2 at a finite input such as x = 1000."]] },
  { workId: "CHOICE-0265", lessonId: "tg-04-02", stepId: "k1", kind: "check", evaluatorHash: "e674f188e8f023332a76fad20dc8102b72d8d8b4101db4b588619c3e5e6f8c28", feedbackHash: "002a6a1c35fb5b6700e7933f9c9ae63b32df47b33a813cbf7d47083a2a366d3b", labels: [["o1", "Cosine peaks at 0, so that interval straddles a turning point and repeats outputs (e.g. cos(±π/3) = 1/2)", "It repeats cosine outputs on both sides of the peak at 0."], ["o2", "Cosine is undefined for negative angles", "Cosine is undefined for negative angles on that branch."], ["o3", "That branch only contains positive cosine values", "That branch contains only positive cosine values."]] },
  { workId: "CHOICE-0266", lessonId: "tg-05-02", stepId: "k2", kind: "check", evaluatorHash: "73e4f4d2378a0c0c0a74d4c9a4685ab5f564a49a53f7ed711b5d3df14be22d14", feedbackHash: "f738ba7af83232d17d3643243c77d93be93e9ee2b59e3bdfa811aaa60fae274c", labels: [["o1", "+4/5 — branch angles always have cos ≥ 0", "+4/5: arcsin’s branch has nonnegative cosine."], ["o2", "−4/5", "−4/5: a negative sine requires a negative cosine."], ["o3", "−3/5", "−3/5: the input remains the cosine value."]] },
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

for (const target of choices) {
  const [, text] = await source(target.lessonId);
  const step = findStep(lesson(text), target.stepId);
  const widget = step.widget;
  if (step.kind !== target.kind || !widget || widget.type !== "mcq" || !Array.isArray(widget.options)) throw new Error(`${target.workId}: expected ${target.kind} MCQ`);
  if (hash(evaluator(widget)) !== target.evaluatorHash || hash(widget.options.map((option) => [option.id, option.feedback ?? null])) !== target.feedbackHash) throw new Error(`${target.workId}: evaluator or feedback drift`);
  if (widget.options.filter((option) => option.correct).map((option) => option.id).join(",") !== "o1") throw new Error(`${target.workId}: correct-answer drift`);
  for (const [optionId, before, after] of target.labels) {
    const option = widget.options.find((candidate) => candidate.id === optionId);
    if (!option || (option.label !== before && option.label !== after)) throw new Error(`${target.workId}/${optionId}: label drift`);
  }
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

if (check && changed) throw new Error(`S301 needs ${changed} source repair(s)`);
if (!check && changed) for (const [file, text] of files) await writeFile(file, text);
const packetSeal = createHash("sha256").update([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, text]) => `${path.basename(file)}\0${text}`).join("\n")).digest("hex");
console.log(JSON.stringify({ course: "trig-graphs-inverses", choiceRows: choices.length, labelEdits: changed, current: changed === 0, packetSeal }, null, 2));
