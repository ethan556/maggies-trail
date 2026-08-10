#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION131_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION132_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => Array.isArray(value)
  ? `[${value.map(canonical).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`
    : JSON.stringify(value);
const H = (value) => sha(canonical(value));
const errors = [];
if (ledger.session !== 132 || ledger.baselineSession !== 131) errors.push("ledger session/baseline mismatch");
if (ledger.authoredFilesChanged !== 2 || ledger.widgetNodesChanged !== 15 || ledger.variantDeclarationsChanged !== 7)
  errors.push("ledger count mismatch");
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
const files = lessonFiles();
if (files.length !== baseline.count) errors.push(`lesson count ${files.length} != baseline ${baseline.count}`);
for (const path of files) {
  const bytes = readFileSync(join(root, path));
  const record = targets.get(path);
  if (!record) {
    if (sha(bytes) !== baseline.files[path]) errors.push(`${path}: changed outside Session 132 ledger`);
    continue;
  }
  if (baseline.files[path] !== record.beforeSha256) errors.push(`${path}: before hash does not match Session 131 seal`);
  if (sha(bytes) !== record.afterSha256) errors.push(`${path}: after hash does not match current bytes`);
  const doc = JSON.parse(bytes);
  const top = Object.fromEntries(Object.entries(doc).filter(([key]) => !["steps", "remedials"].includes(key)));
  if (H(top) !== record.frozenSurfaceProof.topLevel.after || record.frozenSurfaceProof.topLevel.before !== record.frozenSurfaceProof.topLevel.after)
    errors.push(`${path}: top-level authored fields changed`);
  if (H(doc.steps.map((step) => step.id)) !== record.frozenSurfaceProof.stepOrder.after || record.frozenSurfaceProof.stepOrder.before !== record.frozenSurfaceProof.stepOrder.after)
    errors.push(`${path}: step order changed`);
  const changedStepIds = new Set(record.changes.filter((change) => /^steps\/[^/]+\/widget$/.test(change.path)).map((change) => change.path.split("/")[1]));
  for (const step of doc.steps) {
    const proof = record.frozenSurfaceProof.steps[step.id];
    if (!proof) { errors.push(`${path}/${step.id}: missing proof`); continue; }
    const value = structuredClone(step);
    if (changedStepIds.has(step.id)) {
      delete value.widget;
      if (value.variant) value.variant.form = "__TARGET_FORM__";
    }
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${step.id}: frozen surface changed`);
  }
  const changedRemedialIds = new Set(record.changes.filter((change) => /^remedials\/[^/]+\/check\/widget$/.test(change.path)).map((change) => change.path.split("/")[1]));
  for (const route of doc.remedials ?? []) {
    const rid = route.check.id;
    const proof = record.frozenSurfaceProof.remedials[rid];
    if (!proof) { errors.push(`${path}/${rid}: missing remedial proof`); continue; }
    const value = structuredClone(route);
    if (changedRemedialIds.has(rid)) delete value.check.widget;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${rid}: remedial fields outside widget changed`);
  }
  const wrongFeedback = (widget) => widget.type === "trialProbabilityLab"
    ? widget.choices.filter((choice) => choice.num * widget.total !== widget.favourable * choice.den).map((choice) => choice.feedback).sort()
    : [];
  for (const step of doc.steps) {
    const proof = record.misconceptionFeedbackProof[step.id];
    if (!proof) continue;
    if (canonical(wrongFeedback(step.widget)) !== canonical(proof.after)) errors.push(`${path}/${step.id}: misconception feedback changed`);
    if (canonical(proof.before) !== canonical(proof.after)) errors.push(`${path}/${step.id}: baseline misconception feedback was not preserved`);
  }
  for (const route of doc.remedials ?? []) {
    const proof = record.misconceptionFeedbackProof[`remedial:${route.check.id}`];
    if (!proof) continue;
    if (canonical(wrongFeedback(route.check.widget)) !== canonical(proof.after)) errors.push(`${path}/${route.check.id}: remedial misconception feedback changed`);
    if (canonical(proof.before) !== canonical(proof.after)) errors.push(`${path}/${route.check.id}: baseline remedial misconception feedback was not preserved`);
  }
}
if (errors.length) {
  console.error(`Session 132 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Session 132 content proof passed: ${files.length} lessons; 2 files / 15 widget nodes / 7 variant forms changed; all other authored surfaces preserved`);
