#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION132_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION133_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => Array.isArray(value)
  ? `[${value.map(canonical).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`
    : JSON.stringify(value);
const H = (value) => sha(canonical(value));
const errors = [];
if (ledger.session !== 133 || ledger.baselineSession !== 132) errors.push("ledger session/baseline mismatch");
if (ledger.authoredFilesChanged !== 1 || ledger.widgetNodesChanged !== 8 || ledger.variantDeclarationsChanged !== 0) errors.push("ledger count mismatch");
const targets = new Map(ledger.lessons.map((row) => [row.sourcePath, row]));
function lessonFiles() {
  const out = [];
  const courses = join(root, "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) out.push(`content/courses/${course}/lessons/${file}`);
  }
  return out.sort();
}
function correctChoice(widget, choice) {
  const total = widget.stages.reduce((product, stage) => product * stage.outcomes.length, 1);
  if (widget.mode === "count") return choice.count === total;
  const favourable = widget.stages.reduce((product, stage) => product * stage.favourable.length, 1);
  return choice.num * total === favourable * choice.den;
}
function wrongFeedback(widget) {
  if (widget.type === "numeric") return widget.commonErrors.map((entry) => entry.feedback).sort();
  if (widget.type === "mcq") return widget.options.filter((option) => !option.correct).map((option) => option.feedback).sort();
  if (widget.type === "compoundEventLab") return widget.choices.filter((choice) => !correctChoice(widget, choice)).map((choice) => choice.feedback).sort();
  return [];
}
function answerLabel(widget) {
  if (widget.type === "numeric") return String(widget.answer);
  if (widget.type === "mcq") return widget.options.find((option) => option.correct)?.label ?? null;
  if (widget.type === "compoundEventLab") return widget.choices.find((choice) => correctChoice(widget, choice))?.label ?? null;
  return null;
}
const files = lessonFiles();
if (files.length !== baseline.count) errors.push(`lesson count ${files.length} != baseline ${baseline.count}`);
for (const path of files) {
  const bytes = readFileSync(join(root, path));
  const record = targets.get(path);
  if (!record) {
    if (sha(bytes) !== baseline.files[path]) errors.push(`${path}: changed outside Session 133 ledger`);
    continue;
  }
  if (baseline.files[path] !== record.beforeSha256) errors.push(`${path}: before hash does not match Session 132 seal`);
  if (sha(bytes) !== record.afterSha256) errors.push(`${path}: after hash does not match current bytes`);
  const doc = JSON.parse(bytes);
  const top = Object.fromEntries(Object.entries(doc).filter(([key]) => !["steps", "remedials"].includes(key)));
  if (H(top) !== record.frozenSurfaceProof.topLevel.after || record.frozenSurfaceProof.topLevel.before !== record.frozenSurfaceProof.topLevel.after) errors.push(`${path}: top-level authored fields changed`);
  if (H(doc.steps.map((step) => step.id)) !== record.frozenSurfaceProof.stepOrder.after || record.frozenSurfaceProof.stepOrder.before !== record.frozenSurfaceProof.stepOrder.after) errors.push(`${path}: step order changed`);
  const changedStepIds = new Set(record.changes.filter((change) => /^steps\/[^/]+\/widget$/.test(change.path)).map((change) => change.path.split("/")[1]));
  for (const step of doc.steps) {
    const proof = record.frozenSurfaceProof.steps[step.id];
    if (!proof) { errors.push(`${path}/${step.id}: missing proof`); continue; }
    const value = structuredClone(step);
    if (changedStepIds.has(step.id)) delete value.widget;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${step.id}: frozen surface changed`);
    const feedbackProof = record.misconceptionFeedbackProof[step.id];
    if (feedbackProof && canonical(wrongFeedback(step.widget)) !== canonical(feedbackProof.after)) errors.push(`${path}/${step.id}: misconception feedback changed`);
    const answerProof = record.answerProof[step.id];
    if (answerProof && answerLabel(step.widget) !== answerProof.after) errors.push(`${path}/${step.id}: answer changed`);
  }
  for (const route of doc.remedials ?? []) {
    const rid = route.check.id;
    const proof = record.frozenSurfaceProof.remedials[rid];
    if (!proof) { errors.push(`${path}/${rid}: missing remedial proof`); continue; }
    const value = structuredClone(route); delete value.check.widget;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${rid}: remedial fields outside widget changed`);
    const feedbackProof = record.misconceptionFeedbackProof[`remedial:${rid}`];
    if (feedbackProof && canonical(wrongFeedback(route.check.widget)) !== canonical(feedbackProof.after)) errors.push(`${path}/${rid}: remedial feedback changed`);
    const answerProof = record.answerProof[`remedial:${rid}`];
    if (answerProof && answerLabel(route.check.widget) !== answerProof.after) errors.push(`${path}/${rid}: remedial answer changed`);
  }
  for (const proof of Object.values(record.misconceptionFeedbackProof)) if (canonical(proof.before) !== canonical(proof.after)) errors.push(`${path}: baseline misconception feedback was not preserved`);
  for (const proof of Object.values(record.answerProof)) if (proof.before !== proof.after) errors.push(`${path}: baseline answer was not preserved`);
}
if (errors.length) {
  console.error(`Session 133 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Session 133 content proof passed: ${files.length} lessons; 1 file / 8 widget nodes / 0 variant declarations changed; all other authored surfaces preserved`);
