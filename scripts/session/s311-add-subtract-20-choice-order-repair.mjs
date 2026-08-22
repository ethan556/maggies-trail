import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "add-subtract-20", "lessons");
const expectedInventoryHash = "bc1745c271f56dfae699c25a028c5caee4e8a696d9c22f992aeddb9389204f92";

function fail(message) { throw new Error(`S311 add-subtract-20 choice-order repair: ${message}`); }

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
    if (/\s|,/.test(source[index])) { index += 1; continue; }
    if (source[index] !== "{") fail(`unexpected widget-options token for ${stepId}`);
    const end = matchingIndex(source, index, "{", "}");
    ranges.push({ start: index, end });
    index = end + 1;
  }
  if (![2, 3].includes(ranges.length)) fail(`${stepId} must have two or three MCQ options`);
  return { openIndex, closeIndex, ranges };
}

function reorderOptions(source, target, targetIndex) {
  const location = widgetOptionArray(source, target.stepId);
  const options = location.ranges.map(({ start, end }) => ({ raw: source.slice(start, end + 1), value: JSON.parse(source.slice(start, end + 1)) }));
  const canonicalIds = options.length === 2 ? ["a", "b"] : ["a", "b", "c"];
  const ids = options.map((option) => option.value.id);
  const correct = options.filter((option) => option.value.correct).map((option) => option.value.id);
  const wantedIds = canonicalIds.filter((id) => id !== "a");
  wantedIds.splice(targetIndex, 0, "a");
  if (ids.join("|") === wantedIds.join("|")) return source;
  if (ids.join("|") !== canonicalIds.join("|")) fail(`${target.lessonId}/${target.stepId} option order drifted`);
  if (correct.join("|") !== "a") fail(`${target.lessonId}/${target.stepId} correct-option contract drifted`);
  const prefix = source.slice(location.openIndex + 1, location.ranges[0].start);
  const separator = source.slice(location.ranges[0].end + 1, location.ranges[1].start);
  const suffix = source.slice(location.ranges.at(-1).end + 1, location.closeIndex);
  for (let index = 1; index < location.ranges.length - 1; index += 1)
    if (source.slice(location.ranges[index].end + 1, location.ranges[index + 1].start) !== separator)
      fail(`${target.lessonId}/${target.stepId} option separators are inconsistent`);
  const rawById = new Map(options.map((option) => [option.value.id, option.raw]));
  return `${source.slice(0, location.openIndex + 1)}${prefix}${wantedIds.map((id) => rawById.get(id)).join(separator)}${suffix}${source.slice(location.closeIndex)}`;
}

const records = readdirSync(lessonsDirectory).filter((name) => name.endsWith(".json")).sort().map((name) => {
  const path = join(lessonsDirectory, name);
  const source = readFileSync(path, "utf8");
  return { path, source, lesson: JSON.parse(source), changed: false };
});
if (records.length !== 17) fail(`expected 17 lessons, found ${records.length}`);
const targets = records.flatMap((record) => record.lesson.steps.filter((step) => step.widget?.type === "mcq").map((step) => ({ lessonId: record.lesson.id, stepId: step.id, optionIds: step.widget.options.map((option) => option.id).sort() })));
const inventory = targets.map((target) => `${target.lessonId}/${target.stepId}:${target.optionIds.join(",")}`).join("\n");
if (targets.length !== 17 || createHash("sha256").update(inventory).digest("hex") !== expectedInventoryHash)
  fail("main-sequence MCQ target inventory drifted");

const changed = [];
let threeOptionOrdinal = 0;
for (const target of targets) {
  const record = records.find((candidate) => candidate.lesson.id === target.lessonId);
  const step = record?.lesson.steps.find((candidate) => candidate.id === target.stepId);
  const correctIds = step?.widget?.type === "mcq" ? step.widget.options.filter((option) => option.correct).map((option) => option.id) : [];
  if (correctIds.join("|") !== "a") fail(`${target.lessonId}/${target.stepId} correct-option contract drifted`);
  const targetIndex = target.optionIds.length === 2 ? 1 : threeOptionOrdinal++ % 2 + 1;
  const nextSource = reorderOptions(record.source, target, targetIndex);
  if (nextSource !== record.source) { record.source = nextSource; record.changed = true; }
}
if (threeOptionOrdinal !== 15) fail(`expected 15 three-option MCQs, found ${threeOptionOrdinal}`);
for (const record of records) {
  if (!record.changed) continue;
  JSON.parse(record.source);
  writeFileSync(record.path, record.source);
  changed.push(record.lesson.id);
}
console.log(`S311 add-subtract-20 choice-order repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
