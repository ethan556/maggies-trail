import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "place-value-1000", "lessons");
const targets = [
  { lessonId: "pv1000-01-01", stepId: "i1", canonicalIds: ["h", "t", "o"], outcomeId: "h" },
  { lessonId: "pv1000-01-02", stepId: "i1", canonicalIds: ["maya", "leo", "same"], outcomeId: "same" },
  { lessonId: "pv1000-01-03", stepId: "i1", canonicalIds: ["six", "four", "one"], outcomeId: "six" },
  { lessonId: "pv1000-02-01", stepId: "i1", canonicalIds: ["tens", "ones", "hundreds"], outcomeId: "tens" },
  { lessonId: "pv1000-02-02", stepId: "i1", canonicalIds: ["five", "zero", "three"], outcomeId: "five" },
  { lessonId: "pv1000-02-03", stepId: "i1", canonicalIds: ["thirty", "thirteen", "three"], outcomeId: "thirty" },
  { lessonId: "pv1000-03-01", stepId: "i1", canonicalIds: ["zero", "skip", "one"], outcomeId: "zero" },
  { lessonId: "pv1000-03-02", stepId: "i1a", canonicalIds: ["hundreds", "tens", "ones"], outcomeId: "hundreds" },
  { lessonId: "pv1000-03-03", stepId: "i2a", canonicalIds: ["hundreds", "tens", "ones"], outcomeId: "hundreds" },
  { lessonId: "pv1000-04-01", stepId: "i1", canonicalIds: ["no", "ones", "tens"], outcomeId: "no" },
  { lessonId: "pv1000-04-02", stepId: "i1", canonicalIds: ["no", "ones", "tens"], outcomeId: "no" },
  { lessonId: "pv1000-04-03", stepId: "i1", canonicalIds: ["more", "less", "cant"], outcomeId: "more" },
];

function fail(message) {
  throw new Error(`S301 place-value-1000 prediction-order repair: ${message}`);
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

function predictionOptionArray(source, stepId) {
  const stepMarker = `"id": "${stepId}",`;
  const stepIndex = source.indexOf(stepMarker);
  if (stepIndex < 0 || source.indexOf(stepMarker, stepIndex + stepMarker.length) >= 0)
    fail(`expected one source step marker for ${stepId}`);
  const predictIndex = source.indexOf('"predict": {', stepIndex);
  const keyIndex = source.indexOf('"options": [', predictIndex);
  if (predictIndex < 0 || keyIndex < 0) fail(`missing prediction options for ${stepId}`);
  const openIndex = source.indexOf("[", keyIndex);
  const closeIndex = matchingIndex(source, openIndex, "[", "]");
  const ranges = [];
  for (let index = openIndex + 1; index < closeIndex;) {
    if (/\s|,/.test(source[index])) {
      index += 1;
      continue;
    }
    if (source[index] !== "{") fail(`unexpected prediction-options token for ${stepId}`);
    const end = matchingIndex(source, index, "{", "}");
    ranges.push({ start: index, end });
    index = end + 1;
  }
  if (ranges.length !== 3) fail(`${stepId} must have three prediction options`);
  return { openIndex, closeIndex, ranges };
}

function reorderOptions(source, target, targetIndex) {
  const location = predictionOptionArray(source, target.stepId);
  const options = location.ranges.map(({ start, end }) => ({
    raw: source.slice(start, end + 1),
    value: JSON.parse(source.slice(start, end + 1)),
  }));
  const ids = options.map((option) => option.value.id);
  const wantedIds = target.canonicalIds.filter((id) => id !== target.outcomeId);
  wantedIds.splice(targetIndex, 0, target.outcomeId);
  if (ids.join("|") === wantedIds.join("|")) return source;
  if (ids.join("|") !== target.canonicalIds.join("|"))
    fail(`${target.lessonId}/${target.stepId} option order drifted`);

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
  .filter((step) => step.predict)
  .map((step) => `${record.lesson.id}/${step.id}`)));
if (actualKeys.size !== expectedKeys.size || [...actualKeys].some((key) => !expectedKeys.has(key)))
  fail("prediction target inventory drifted");

const changed = [];
for (const [index, target] of targets.entries()) {
  const record = records.find((candidate) => candidate.lesson.id === target.lessonId);
  if (!record) fail(`missing lesson ${target.lessonId}`);
  const step = record.lesson.steps.find((candidate) => candidate.id === target.stepId);
  if (!step?.predict || step.predict.outcomeId !== target.outcomeId)
    fail(`${target.lessonId}/${target.stepId} outcome contract drifted`);
  const nextSource = reorderOptions(record.source, target, index % 2 + 1);
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

console.log(`S301 place-value-1000 prediction-order repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
