import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "add-subtract-100", "lessons");
const canonicalIds = ["a", "b", "c"];

function fail(message) {
  throw new Error(`S299 add-subtract-100 choice parity repair: ${message}`);
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

function optionArray(source, stepId) {
  const stepMarker = `"id": "${stepId}",`;
  const stepIndex = source.indexOf(stepMarker);
  if (stepIndex < 0 || source.indexOf(stepMarker, stepIndex + stepMarker.length) >= 0)
    fail(`expected one source step marker for ${stepId}`);
  const widgetIndex = source.indexOf('"type": "mcq"', stepIndex);
  const keyIndex = source.indexOf('"options": [', widgetIndex);
  if (widgetIndex < 0 || keyIndex < 0) fail(`missing MCQ option array for ${stepId}`);
  const openIndex = source.indexOf("[", keyIndex);
  const closeIndex = matchingIndex(source, openIndex, "[", "]");
  const ranges = [];
  for (let index = openIndex + 1; index < closeIndex;) {
    if (/\s|,/.test(source[index])) {
      index += 1;
      continue;
    }
    if (source[index] !== "{") fail(`unexpected option-array token for ${stepId}`);
    const end = matchingIndex(source, index, "{", "}");
    ranges.push({ start: index, end });
    index = end + 1;
  }
  if (ranges.length !== 3) fail(`${stepId} must have three option objects`);
  return { openIndex, closeIndex, ranges };
}

function reorderOptions(source, stepId, wantedIds) {
  const location = optionArray(source, stepId);
  const options = location.ranges.map(({ start, end }) => ({
    raw: source.slice(start, end + 1),
    value: JSON.parse(source.slice(start, end + 1)),
  }));
  const ids = options.map((option) => option.value.id);
  const correct = options.filter((option) => option.value.correct);
  if (correct.length !== 1 || correct[0].value.id !== "a")
    fail(`${stepId} must retain stable correct option a`);
  if (ids.join("|") === wantedIds.join("|")) return source;
  if (ids.join("|") !== canonicalIds.join("|")) fail(`${stepId} option order drifted`);

  const prefix = source.slice(location.openIndex + 1, location.ranges[0].start);
  const separator = source.slice(location.ranges[0].end + 1, location.ranges[1].start);
  const suffix = source.slice(location.ranges.at(-1).end + 1, location.closeIndex);
  for (let index = 1; index < location.ranges.length - 1; index += 1) {
    if (source.slice(location.ranges[index].end + 1, location.ranges[index + 1].start) !== separator)
      fail(`${stepId} option separators are inconsistent`);
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

const targets = records.flatMap((record) => record.lesson.steps
  .filter((step) => step.widget?.type === "mcq")
  .map((step) => ({ record, step })));

if (records.length !== 16) fail(`expected 16 lessons, found ${records.length}`);
if (targets.length !== 16) fail(`expected 16 MCQs, found ${targets.length}`);

for (const [index, { record, step }] of targets.entries()) {
  const targetIndex = index % 2 + 1;
  const wantedIds = ["b", "c"];
  wantedIds.splice(targetIndex, 0, "a");
  const nextSource = reorderOptions(record.source, step.id, wantedIds);
  if (nextSource !== record.source) {
    record.source = nextSource;
    record.changed = true;
  }
}

const changed = [];
for (const record of records) {
  if (!record.changed) continue;
  JSON.parse(record.source);
  writeFileSync(record.path, record.source);
  changed.push(record.lesson.id);
}

console.log(`S299 add-subtract-100 choice parity repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);