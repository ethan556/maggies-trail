import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "equations-unknowns-g1", "lessons");
const optionTargets = [
  ["g1e-01-01", "k1"], ["g1e-01-01", "k2"], ["g1e-01-01", "ch1"],
  ["g1e-01-02", "k1"], ["g1e-01-02", "k2"], ["g1e-01-02", "k3"], ["g1e-01-02", "ch1"],
  ["g1e-01-04", "k1"], ["g1e-01-04", "k2"], ["g1e-01-04", "k3"],
  ["g1e-01-05", "k3"],
  ["g1e-03-01", "k2"],
  ["g1e-03-02", "k1"], ["g1e-03-02", "k2"], ["g1e-03-02", "k3"], ["g1e-03-02", "ch1"],
  ["g1e-03-03", "k1"], ["g1e-03-03", "k2"], ["g1e-03-03", "k3"],
];
const phraseTargets = [
  ["g1e-02-01", "i1", "Find the end-unknown of 9 + 3 = __: start at 9 and count on 3. Where do you land?", "Find the missing number in 9 + 3 = __. Start at 9 and count on 3. Where do you land?"],
  ["g1e-02-02", "i1", "Find the middle-unknown of 5 + __ = 12: start at 12 and count back 5. Where do you land?", "Find the missing number in 5 + __ = 12. Start at 12 and count back 5. Where do you land?"],
  ["g1e-02-03", "i1", "Find the start-unknown of __ + 4 = 11: start at 11 and count back 4. Where do you land?", "Find the missing number in __ + 4 = 11. Start at 11 and count back 4. Where do you land?"],
];
const visualBefore = "An expression has no equal sign. An equation has one; then we check whether its two sides match. The scale shows a true equation.";
const visualAfter = "An expression has no equal sign. An equation has one. The balance shows 6 + 4 = 10, so both sides match.";
const labelBefore = "Substitute 8: verify 8 + 5 = 13";
const labelAfter = "Put in 8 and check: 8 + 5 = 13";
const canonicalIds = ["o0", "o1", "o2", "o3"];

function fail(message) {
  throw new Error(`S294 equations-unknowns-g1 repair: ${message}`);
}

function load(id) {
  const path = join(lessonsDirectory, `${id}.json`);
  return { path, lesson: JSON.parse(readFileSync(path, "utf8")), changed: false };
}

const records = new Map();
function record(id) {
  if (!records.has(id)) records.set(id, load(id));
  return records.get(id);
}
function step(id, stepId) {
  const current = record(id);
  const entry = current.lesson.steps.find((candidate) => candidate.id === stepId);
  if (!entry) fail(`${id}/${stepId} is missing`);
  return [current, entry];
}
function replaceValue(holder, key, before, after, label) {
  if (holder[key] === after) return false;
  if (holder[key] !== before) fail(`${label}/${key} drifted`);
  holder[key] = after;
  return true;
}

for (const [id, stepId] of optionTargets) {
  const [current, entry] = step(id, stepId);
  if (entry.widget?.type !== "mcq") fail(`${id}/${stepId} must be an MCQ`);
  const options = entry.widget.options;
  const targetIndex = optionTargets.findIndex(([lessonId, targetStepId]) => lessonId === id && targetStepId === stepId) % 3 + 1;
  const targetIds = ["o1", "o2", "o3"];
  targetIds.splice(targetIndex, 0, "o0");
  const ids = options.map((option) => option.id);
  const correct = options.filter((option) => option.correct);
  if (correct.length !== 1 || correct[0].id !== "o0") fail(`${id}/${stepId} must retain stable correct ID o0`);
  if (ids.join("|") === targetIds.join("|")) continue;
  if (ids.join("|") !== canonicalIds.join("|")) fail(`${id}/${stepId} option order drifted`);
  entry.widget.options = targetIds.map((optionId) => options.find((option) => option.id === optionId));
  current.changed = true;
}

for (const [id, stepId, before, after] of phraseTargets) {
  const [current, entry] = step(id, stepId);
  if (!entry.widget) fail(`${id}/${stepId} widget is missing`);
  current.changed = replaceValue(entry.widget, "prompt", before, after, `${id}/${stepId}`) || current.changed;
}

{
  const [current, entry] = step("g1e-03-03", "c2");
  if (entry.kind !== "concept" || entry.figure !== "add-balance-scale") fail("g1e-03-03/c2 must retain add-balance-scale");
  current.changed = replaceValue(entry, "body", visualBefore, visualAfter, "g1e-03-03/c2") || current.changed;
  current.changed = replaceValue(entry, "narration", visualBefore, visualAfter, "g1e-03-03/c2") || current.changed;
}

{
  const [current, entry] = step("g1e-03-02", "ch1");
  if (entry.widget?.type !== "mcq") fail("g1e-03-02/ch1 must retain MCQ widget");
  const option = entry.widget.options.find((candidate) => candidate.id === "o0");
  if (!option) fail("g1e-03-02/ch1/o0 is missing");
  current.changed = replaceValue(option, "label", labelBefore, labelAfter, "g1e-03-02/ch1/o0") || current.changed;
}

const changed = [];
for (const [id, current] of [...records.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  if (!current.changed) continue;
  writeFileSync(current.path, `${JSON.stringify(current.lesson, null, 2)}\n`);
  changed.push(id);
}
console.log(`S294 equations-unknowns-g1 repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
