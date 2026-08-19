import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "measure-compare-k", "lessons");
const targets = [
  ["kmd-01-01", "k1"], ["kmd-01-01", "k3"], ["kmd-01-01", "ch1"], ["kmd-01-02", "k1"],
  ["kmd-01-03", "k1"], ["kmd-01-03", "k3"], ["kmd-01-03", "ch1"], ["kmd-01-04", "k1"],
  ["kmd-01-04", "ch1"], ["kmd-02-01", "k3"], ["kmd-02-02", "k2"], ["kmd-02-02", "k3"],
  ["kmd-02-02", "ch1"], ["kmd-02-03", "k2"], ["kmd-02-04", "k2"], ["kmd-03-01", "k1"],
  ["kmd-03-01", "k2"], ["kmd-03-01", "ch1"], ["kmd-03-02", "k1"], ["kmd-03-02", "ch1"],
  ["kmd-03-03", "k3"], ["kmd-03-04", "k2"], ["kmd-03-04", "ch1"],
].map(([lessonId, stepId]) => ({ lessonId, stepId, canonicalIds: ["o0", "o1", "o2", "o3"], correctId: "o0" }));

function fail(message) {
  throw new Error(`S305 measure-compare-k choice-order repair: ${message}`);
}

function matchingIndex(source, openIndex, open, close) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") inString = false;
      continue;
    }
    if (character === "\"") inString = true;
    else if (character === open) depth += 1;
    else if (character === close && --depth === 0) return index;
  }
  fail(`unterminated ${open}${close} structure at ${openIndex}`);
}

function widgetOptionArray(source, stepId) {
  const stepMarker = `"id": "${stepId}",`;
  const stepIndex = source.indexOf(stepMarker);
  if (stepIndex < 0 || source.indexOf(stepMarker, stepIndex + stepMarker.length) >= 0)
    fail(`expected one source step marker for ${stepId}`);
  const widgetIndex = source.indexOf('"widget": {', stepIndex);
  const nextStepIndex = source.indexOf('\n    {\n      "id": "', stepIndex + stepMarker.length);
  const keyIndex = source.indexOf('"options": [', widgetIndex);
  if (widgetIndex < 0 || keyIndex < 0 || (nextStepIndex >= 0 && keyIndex > nextStepIndex))
    fail(`missing widget options for ${stepId}`);
  const openIndex = source.indexOf("[", keyIndex);
  const closeIndex = matchingIndex(source, openIndex, "[", "]");
  const ranges = [];
  for (let index = openIndex + 1; index < closeIndex;) {
    if (/\s|,/.test(source[index])) {
      index += 1;
      continue;
    }
    if (source[index] !== "{") fail(`unexpected widget-options token for ${stepId}`);
    const end = matchingIndex(source, index, "{", "}");
    ranges.push({ start: index, end });
    index = end + 1;
  }
  if (ranges.length !== 4) fail(`${stepId} must have four MCQ options`);
  return { openIndex, closeIndex, ranges };
}

function reorderOptions(source, target, targetIndex) {
  const location = widgetOptionArray(source, target.stepId);
  const options = location.ranges.map(({ start, end }) => ({
    raw: source.slice(start, end + 1),
    value: JSON.parse(source.slice(start, end + 1)),
  }));
  const ids = options.map((option) => option.value.id);
  const correct = options.filter((option) => option.value.correct).map((option) => option.value.id);
  const wantedIds = target.canonicalIds.filter((id) => id !== target.correctId);
  wantedIds.splice(targetIndex, 0, target.correctId);
  if (ids.join("|") === wantedIds.join("|")) return source;
  if (ids.join("|") !== target.canonicalIds.join("|"))
    fail(`${target.lessonId}/${target.stepId} option order drifted`);
  if (correct.join("|") !== target.correctId)
    fail(`${target.lessonId}/${target.stepId} correct-option contract drifted`);

  const prefix = source.slice(location.openIndex + 1, location.ranges[0].start);
  const separator = source.slice(location.ranges[0].end + 1, location.ranges[1].start);
  const suffix = source.slice(location.ranges.at(-1).end + 1, location.closeIndex);
  for (let index = 1; index < location.ranges.length - 1; index += 1) {
    if (source.slice(location.ranges[index].end + 1, location.ranges[index + 1].start) !== separator)
      fail(`${target.lessonId}/${target.stepId} option separators are inconsistent`);
  }
  const rawById = new Map(options.map((option) => [option.value.id, option.raw]));
  return `${source.slice(0, location.openIndex + 1)}${prefix}${wantedIds.map((id) => rawById.get(id)).join(separator)}${suffix}${source.slice(location.closeIndex)}`;
}

const records = readdirSync(lessonsDirectory)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => {
    const path = join(lessonsDirectory, name);
    const source = readFileSync(path, "utf8");
    return { path, source, lesson: JSON.parse(source), changed: false };
  });

if (records.length !== 12) fail(`expected 12 lessons, found ${records.length}`);
const expectedKeys = new Set(targets.map((target) => `${target.lessonId}/${target.stepId}`));
const actualKeys = new Set(records.flatMap((record) => record.lesson.steps
  .filter((step) => step.widget?.type === "mcq")
  .map((step) => `${record.lesson.id}/${step.id}`)));
if (actualKeys.size !== expectedKeys.size || [...actualKeys].some((key) => !expectedKeys.has(key)))
  fail("main-sequence MCQ target inventory drifted");

const changed = [];
for (const [index, target] of targets.entries()) {
  const record = records.find((candidate) => candidate.lesson.id === target.lessonId);
  if (!record) fail(`missing lesson ${target.lessonId}`);
  const step = record.lesson.steps.find((candidate) => candidate.id === target.stepId);
  const correctIds = step?.widget?.type === "mcq"
    ? step.widget.options.filter((option) => option.correct).map((option) => option.id)
    : [];
  if (correctIds.join("|") !== target.correctId)
    fail(`${target.lessonId}/${target.stepId} correct-option contract drifted`);
  const nextSource = reorderOptions(record.source, target, index % 3 + 1);
  if (nextSource !== record.source) {
    record.source = nextSource;
    record.changed = true;
  }
}

for (const record of records) {
  if (!record.changed) continue;
  JSON.parse(record.source);
  writeFileSync(record.path, record.source);
  changed.push(record.lesson.id);
}

console.log(`S305 measure-compare-k choice-order repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
