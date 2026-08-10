#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const coursesRoot = join(root, "content", "courses");
const conceptTag = "mmt-estimate";
const dryRun = process.argv.includes("--dry-run");

const hash = (text) => createHash("sha256").update(text).digest("hex");
const clone = (value) => JSON.parse(JSON.stringify(value));

function lessonFiles() {
  const out = [];
  for (const course of readdirSync(coursesRoot)) {
    const dir = join(coursesRoot, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).filter((file) => file.endsWith(".json"))) {
      const path = join(dir, name);
      const text = readFileSync(path, "utf8");
      const lesson = JSON.parse(text);
      const ownsTag = (lesson.steps ?? []).some((step) => step.conceptTag === conceptTag)
        || (lesson.remedials ?? []).some((route) => route.conceptTag === conceptTag);
      if (ownsTag) out.push({ path, text, lesson });
    }
  }
  return out;
}

const matches = lessonFiles();
if (matches.length !== 1)
  throw new Error(`Expected exactly one lesson owning ${conceptTag}; found ${matches.length}`);

const { path, text: beforeText, lesson } = matches[0];
if (lesson.id !== "mmt-02-01")
  throw new Error(`Expected ${conceptTag} to resolve to mmt-02-01; found ${lesson.id}`);

const before = clone(lesson);
const changes = [];

function parseEstimateWidget(widget, location) {
  if (!widget || widget.type !== "mcq")
    throw new Error(`${location}: expected authored mcq`);
  const targetMatch = widget.prompt.match(/about\s+(\d+)\s+inch(?:es)?\s+long/i);
  if (!targetMatch) throw new Error(`${location}: could not derive stated actual length from prompt`);
  const target = Number(targetMatch[1]);
  const choices = widget.options.map((option) => {
    const valueMatch = option.label.match(/^(\d+)\s+inch(?:es)?$/i);
    if (!valueMatch) throw new Error(`${location}: non-inch choice ${JSON.stringify(option.label)}`);
    return {
      value: Number(valueMatch[1]),
      label: option.label,
      correct: option.correct === true,
      feedback: option.feedback
    };
  });
  if (choices.length < 3) throw new Error(`${location}: need at least three authored candidates`);
  if (new Set(choices.map((choice) => choice.value)).size !== choices.length)
    throw new Error(`${location}: duplicate candidate values`);
  const correct = choices.filter((choice) => choice.correct);
  if (correct.length !== 1) throw new Error(`${location}: expected exactly one correct candidate`);
  const correctGap = Math.abs(correct[0].value - target);
  if (choices.some((choice) => !choice.correct && Math.abs(choice.value - target) <= correctGap))
    throw new Error(`${location}: authored correct choice is not uniquely closest to ${target}`);
  const maxValue = Math.max(target, ...choices.map((choice) => choice.value));
  const max = Math.max(5, Math.ceil(maxValue / 5) * 5);
  const low = choices.find((choice) => !choice.correct && choice.value < target);
  const high = choices.find((choice) => !choice.correct && choice.value > target);
  if (!low || !high) throw new Error(`${location}: need authored wrong choices on both sides of target`);
  return {
    type: "estimateSlider",
    prompt: widget.prompt,
    min: 0,
    max,
    target,
    unitLabel: "inches",
    choices,
    lowFeedback: low.feedback,
    highFeedback: high.feedback,
    successFeedback: correct[0].feedback
  };
}

for (const stepId of ["i1", "i2", "i3"]) {
  const step = lesson.steps.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`${lesson.id}: missing ${stepId}`);
  if (step.variant !== undefined) throw new Error(`${lesson.id}/${stepId}: target must be variant-free`);
  const oldWidget = clone(step.widget);
  const nextWidget = parseEstimateWidget(step.widget, `${lesson.id}/${stepId}`);
  step.widget = nextWidget;
  changes.push({
    path: `${lesson.id}/steps/${stepId}/widget`,
    reason: "Broken representation: the learner was asked to compare physical lengths with no drawn scale. Exact discrete comparison now renders the stated actual length and only the authored candidates.",
    target: nextWidget.target,
    correctValue: nextWidget.choices.find((choice) => choice.correct).value,
    preservedPrompt: oldWidget.prompt,
    preservedChoices: oldWidget.options.map(({ label, correct, feedback }) => ({ label, correct: correct === true, feedback }))
  });
}

const route = lesson.remedials.find((candidate) => candidate.conceptTag === conceptTag);
if (!route?.check) throw new Error(`${lesson.id}: missing ${conceptTag} remedial check`);
const oldRemedial = clone(route.check.widget);
route.check.widget = parseEstimateWidget(route.check.widget, `${lesson.id}/remedials/${conceptTag}/check`);
changes.push({
  path: `${lesson.id}/remedials/${conceptTag}/check/widget`,
  reason: "Broken remedial representation: the retry path now shows the same physical closeness relationship instead of returning the learner to an undrawn multiple-choice description.",
  target: route.check.widget.target,
  correctValue: route.check.widget.choices.find((choice) => choice.correct).value,
  preservedPrompt: oldRemedial.prompt,
  preservedChoices: oldRemedial.options.map(({ label, correct, feedback }) => ({ label, correct: correct === true, feedback }))
});

// Prove that only the four widget nodes above changed.
const strippedBefore = clone(before);
const strippedAfter = clone(lesson);
for (const stepId of ["i1", "i2", "i3"]) {
  const a = strippedBefore.steps.find((step) => step.id === stepId);
  const b = strippedAfter.steps.find((step) => step.id === stepId);
  a.widget = "__TARGET_WIDGET__";
  b.widget = "__TARGET_WIDGET__";
}
const rb = strippedBefore.remedials.find((candidate) => candidate.conceptTag === conceptTag);
const ra = strippedAfter.remedials.find((candidate) => candidate.conceptTag === conceptTag);
rb.check.widget = "__TARGET_WIDGET__";
ra.check.widget = "__TARGET_WIDGET__";
if (JSON.stringify(strippedBefore) !== JSON.stringify(strippedAfter))
  throw new Error("Non-target authored lesson fields changed; aborting before write");

const afterText = JSON.stringify(lesson, null, 1) + "\n";
const ledger = {
  session: 129,
  lessonId: lesson.id,
  sourcePath: path.slice(root.length + 1),
  exception: "broken representation / broken remedial interaction",
  beforeSha256: hash(beforeText),
  afterSha256: hash(afterText),
  authoredFilesChanged: 1,
  widgetNodesChanged: changes.length,
  changes
};

if (!dryRun) {
  writeFileSync(path, afterText);
  writeFileSync(join(root, "SESSION129_CONTENT_CHANGE_LEDGER.json"), JSON.stringify(ledger, null, 2) + "\n");
}
console.log(`${dryRun ? "dry-run" : "converted"}: ${lesson.id}, ${changes.length} exact discrete estimate comparisons`);
console.log(JSON.stringify(ledger, null, 2));
