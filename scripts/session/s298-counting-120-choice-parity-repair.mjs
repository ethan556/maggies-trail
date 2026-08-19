import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lessonsDirectory = join(process.cwd(), "content", "courses", "counting-120", "lessons");
const canonicalIds = ["a", "b", "c"];

function fail(message) {
  throw new Error(`S298 counting-120 choice parity repair: ${message}`);
}

function load(name) {
  const path = join(lessonsDirectory, name);
  const source = readFileSync(path, "utf8");
  const indentation = source.match(/\n( +)"id":/);
  if (!indentation) fail(`${name} indentation is not recognizable`);
  return { path, lesson: JSON.parse(source), indent: indentation[1].length, changed: false };
}

const records = readdirSync(lessonsDirectory)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map(load);

const targets = records.flatMap((record) => record.lesson.steps
  .filter((step) => step.widget?.type === "mcq")
  .map((step) => ({ record, step })));

if (records.length !== 15) fail(`expected 15 lessons, found ${records.length}`);
if (targets.length !== 17) fail(`expected 17 MCQs, found ${targets.length}`);

for (const [index, { record, step }] of targets.entries()) {
  const widget = step.widget;
  const options = widget.options;
  const ids = options.map((option) => option.id);
  const correct = options.filter((option) => option.correct);
  const targetIndex = index % 2 + 1;
  const wantedIds = ["b", "c"];
  wantedIds.splice(targetIndex, 0, "a");

  if (correct.length !== 1 || correct[0].id !== "a")
    fail(`${record.lesson.id}/${step.id} must retain stable correct option a`);
  if (ids.join("|") === wantedIds.join("|")) continue;
  if (ids.join("|") !== canonicalIds.join("|"))
    fail(`${record.lesson.id}/${step.id} option order drifted`);

  step.widget.options = wantedIds.map((id) => options.find((option) => option.id === id));
  record.changed = true;
}

const changed = [];
for (const record of records) {
  if (!record.changed) continue;
  writeFileSync(record.path, `${JSON.stringify(record.lesson, null, record.indent)}\n`);
  changed.push(record.lesson.id);
}

console.log(`S298 counting-120 choice parity repair: ${changed.length ? `updated ${changed.join(", ")}` : "already current"}`);
