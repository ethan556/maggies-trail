#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION130_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION131_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
const H = (value) => sha(canonical(value));
const errors = [];
if (ledger.session !== 131 || ledger.baselineSession !== 130) errors.push("ledger session/baseline mismatch");
if (ledger.filesChanged !== 3 || ledger.widgetNodesChanged !== 26 || ledger.variantDeclarationsChanged !== 0) errors.push("ledger change counts mismatch");
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
    if (sha(bytes) !== baseline.files[path]) errors.push(`${path}: changed outside Session 131 ledger`);
    continue;
  }
  if (baseline.files[path] !== record.beforeSha256) errors.push(`${path}: before hash does not match Session 130 seal`);
  if (sha(bytes) !== record.afterSha256) errors.push(`${path}: after hash does not match current bytes`);
  const doc = JSON.parse(bytes);
  const top = Object.fromEntries(Object.entries(doc).filter(([key]) => !["steps", "remedials"].includes(key)));
  const topProof = record.frozenSurfaceProof.topLevel;
  if (H(top) !== topProof.after || topProof.before !== topProof.after) errors.push(`${path}: top-level authored fields changed`);
  const orderProof = record.frozenSurfaceProof.stepOrder;
  if (H(doc.steps.map((step) => step.id)) !== orderProof.after || orderProof.before !== orderProof.after) errors.push(`${path}: step order changed`);
  for (const step of doc.steps) {
    const proof = record.frozenSurfaceProof.steps[step.id];
    if (!proof) { errors.push(`${path}/${step.id}: missing proof`); continue; }
    const value = structuredClone(step); delete value.widget;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${step.id}: fields outside widget changed`);
  }
  const wrongFeedback = (widget) => {
    const values = [];
    if (widget.mode === "measure") {
      const tolerance = typeof widget.tolerance === "number" ? widget.tolerance : 0.01;
      for (const choice of widget.measureChoices ?? []) if (Math.abs(choice.value - widget.answer) > tolerance && choice.feedback) values.push(choice.feedback);
    } else {
      for (const option of widget.judgeOptions ?? []) if (!option.correct && option.feedback) values.push(option.feedback);
    }
    return values.sort();
  };
  for (const step of doc.steps) {
    const feedbackProof = record.misconceptionFeedbackProof[step.id];
    if (feedbackProof && canonical(wrongFeedback(step.widget)) !== canonical(feedbackProof.after)) errors.push(`${path}/${step.id}: misconception feedback changed`);
    if (feedbackProof && canonical(feedbackProof.before) !== canonical(feedbackProof.after)) errors.push(`${path}/${step.id}: baseline misconception feedback was not preserved`);
  }
  for (const route of doc.remedials ?? []) {
    const feedbackProof = record.misconceptionFeedbackProof[`remedial:${route.conceptTag}`];
    if (feedbackProof && canonical(wrongFeedback(route.check.widget)) !== canonical(feedbackProof.after)) errors.push(`${path}/${route.conceptTag}: remedial misconception feedback changed`);
    if (feedbackProof && canonical(feedbackProof.before) !== canonical(feedbackProof.after)) errors.push(`${path}/${route.conceptTag}: baseline remedial misconception feedback was not preserved`);
  }
  for (const route of doc.remedials ?? []) {
    const proof = record.frozenSurfaceProof.remedials[route.conceptTag];
    if (!proof) { errors.push(`${path}/${route.conceptTag}: missing remedial proof`); continue; }
    const value = structuredClone(route); delete value.check.widget;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${route.conceptTag}: remedial fields outside widget changed`);
  }
}
if (errors.length) {
  console.error(`Session 131 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Session 131 content proof passed: ${files.length} lessons; 3 files / 26 widget nodes changed; all other authored surfaces preserved`);
