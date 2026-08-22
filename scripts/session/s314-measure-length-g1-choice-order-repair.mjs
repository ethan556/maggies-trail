import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "measure-length-g1", "lessons");
const canonicalIds = ["o0", "o1", "o2", "o3"];
const expectedInventoryHash = "3aadd34a6d836b0b5296f5c319364da196a62fd0347fa0f8433008a85b662bbd";
const fail = (message) => { throw new Error(`S314 measure-length-g1 choice-order repair: ${message}`); };

function matchingIndex(source, openIndex, open, close) {
  let depth = 0; let inString = false; let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (inString) { if (escaped) escaped = false; else if (character === "\\") escaped = true; else if (character === "\"") inString = false; continue; }
    if (character === "\"") inString = true;
    else if (character === open) depth += 1;
    else if (character === close && --depth === 0) return index;
  }
  fail(`unterminated ${open}${close} structure at ${openIndex}`);
}

function optionLocation(source, stepId) {
  const marker = `"id": "${stepId}",`;
  const stepIndex = source.indexOf(marker);
  if (stepIndex < 0 || source.indexOf(marker, stepIndex + marker.length) >= 0) fail(`expected one source step marker for ${stepId}`);
  const widgetIndex = source.indexOf('"widget": {', stepIndex);
  const nextStepIndex = source.indexOf('\n    {\n      "id": "', stepIndex + marker.length);
  const keyIndex = source.indexOf('"options": [', widgetIndex);
  if (widgetIndex < 0 || keyIndex < 0 || (nextStepIndex >= 0 && keyIndex > nextStepIndex)) fail(`missing widget options for ${stepId}`);
  const openIndex = source.indexOf("[", keyIndex); const closeIndex = matchingIndex(source, openIndex, "[", "]"); const ranges = [];
  for (let index = openIndex + 1; index < closeIndex;) {
    if (/\s|,/.test(source[index])) { index += 1; continue; }
    if (source[index] !== "{") fail(`unexpected widget-options token for ${stepId}`);
    const end = matchingIndex(source, index, "{", "}"); ranges.push({ start: index, end }); index = end + 1;
  }
  if (ranges.length !== 4) fail(`${stepId} must have four MCQ options`);
  return { openIndex, closeIndex, ranges };
}

function reorderOptions(source, target, targetIndex) {
  const location = optionLocation(source, target.stepId);
  const options = location.ranges.map(({ start, end }) => ({ raw: source.slice(start, end + 1), value: JSON.parse(source.slice(start, end + 1)) }));
  const ids = options.map((option) => option.value.id); const correct = options.filter((option) => option.value.correct).map((option) => option.value.id);
  const wantedIds = canonicalIds.filter((id) => id !== "o0"); wantedIds.splice(targetIndex, 0, "o0");
  if (ids.join("|") === wantedIds.join("|")) return source;
  if (ids.join("|") !== canonicalIds.join("|")) fail(`${target.lessonId}/${target.stepId} option order drifted`);
  if (correct.join("|") !== "o0") fail(`${target.lessonId}/${target.stepId} correct-option contract drifted`);
  const prefix = source.slice(location.openIndex + 1, location.ranges[0].start); const separator = source.slice(location.ranges[0].end + 1, location.ranges[1].start); const suffix = source.slice(location.ranges.at(-1).end + 1, location.closeIndex);
  for (let index = 1; index < location.ranges.length - 1; index += 1) if (source.slice(location.ranges[index].end + 1, location.ranges[index + 1].start) !== separator) fail(`${target.lessonId}/${target.stepId} option separators are inconsistent`);
  const rawById = new Map(options.map((option) => [option.value.id, option.raw]));
  return `${source.slice(0, location.openIndex + 1)}${prefix}${wantedIds.map((id) => rawById.get(id)).join(separator)}${suffix}${source.slice(location.closeIndex)}`;
}

const records = readdirSync(lessonsDirectory).filter((name) => name.endsWith(".json")).sort().map((name) => { const path = join(lessonsDirectory, name); const source = readFileSync(path, "utf8"); return { path, source, lesson: JSON.parse(source), changed: false }; });
if (records.length !== 10) fail(`expected 10 lessons, found ${records.length}`);
const targets = records.flatMap((record) => record.lesson.steps.filter((step) => step.widget?.type === "mcq").map((step) => ({ lessonId: record.lesson.id, stepId: step.id })));
if (targets.length !== 22 || createHash("sha256").update(targets.map((target) => `${target.lessonId}/${target.stepId}`).join("\n")).digest("hex") !== expectedInventoryHash) fail("main-sequence MCQ target inventory drifted");
const changed = [];
for (const [index, target] of targets.entries()) {
  const record = records.find((candidate) => candidate.lesson.id === target.lessonId); const step = record?.lesson.steps.find((candidate) => candidate.id === target.stepId);
  if ((step?.widget?.type === "mcq" ? step.widget.options.filter((option) => option.correct).map((option) => option.id) : []).join("|") !== "o0") fail(`${target.lessonId}/${target.stepId} correct-option contract drifted`);
  const nextSource = reorderOptions(record.source, target, index % 3 + 1); if (nextSource !== record.source) { record.source = nextSource; record.changed = true; }
}
for (const record of records) if (record.changed) { JSON.parse(record.source); writeFileSync(record.path, record.source); changed.push(record.lesson.id); }
console.log(`S314 measure-length-g1 choice-order repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
