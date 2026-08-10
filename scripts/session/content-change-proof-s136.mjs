#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION133_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION136_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => Array.isArray(value)
  ? `[${value.map(canonical).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`
    : JSON.stringify(value);
const H = (value) => sha(canonical(value));
const errors = [];
if (ledger.session !== 136 || ledger.baselineSession !== 135) errors.push("ledger session/baseline mismatch");
if (ledger.authoredFilesChanged !== 2 || ledger.widgetNodesChanged !== 13 || ledger.variantDeclarationsChanged !== 7) errors.push("ledger count mismatch");
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
function pieceArea(piece) {
  if (piece.shape === "rectangle") return piece.width * piece.height;
  if (piece.shape === "triangle") return piece.base * piece.height / 2;
  if (piece.shape === "parallelogram") return piece.base * piece.height;
  return piece.area;
}
function answer(widget) {
  if (widget.type !== "compositeAreaLab") return null;
  if (widget.target.kind === "piece") return pieceArea(widget.pieces.find((piece) => piece.id === widget.target.pieceId));
  return widget.pieces.reduce((sum, piece) => sum + (piece.operation === "subtract" ? -1 : 1) * pieceArea(piece), 0);
}
function wrongFeedback(widget) {
  const right = answer(widget);
  return widget.choices.filter((choice) => Math.abs(choice.value - right) > 1e-9).map((choice) => choice.feedback);
}
const files = lessonFiles();
if (files.length !== baseline.count) errors.push(`lesson count ${files.length} != baseline ${baseline.count}`);
for (const path of files) {
  const bytes = readFileSync(join(root, path));
  const record = targets.get(path);
  if (!record) {
    if (sha(bytes) !== baseline.files[path]) errors.push(`${path}: changed outside Session 136 ledger`);
    continue;
  }
  if (baseline.files[path] !== record.beforeSha256) errors.push(`${path}: before hash does not match canonical content seal`);
  if (sha(bytes) !== record.afterSha256) errors.push(`${path}: after hash does not match current bytes`);
  const doc = JSON.parse(bytes);
  const top = Object.fromEntries(Object.entries(doc).filter(([key]) => !["steps", "remedials"].includes(key)));
  if (H(top) !== record.frozenSurfaceProof.topLevel.after || record.frozenSurfaceProof.topLevel.before !== record.frozenSurfaceProof.topLevel.after) errors.push(`${path}: top-level authored fields changed`);
  if (H(doc.steps.map((step) => step.id)) !== record.frozenSurfaceProof.stepOrder.after || record.frozenSurfaceProof.stepOrder.before !== record.frozenSurfaceProof.stepOrder.after) errors.push(`${path}: step order changed`);
  const changedWidgetIds = new Set(record.changes.filter((change) => /^steps\/[^/]+\/widget$/.test(change.path)).map((change) => change.path.split("/")[1]));
  const changedVariantIds = new Set(record.changes.filter((change) => /^steps\/[^/]+\/variant$/.test(change.path)).map((change) => change.path.split("/")[1]));
  for (const step of doc.steps) {
    const proof = record.frozenSurfaceProof.steps[step.id];
    if (!proof) { errors.push(`${path}/${step.id}: missing step proof`); continue; }
    const value = structuredClone(step);
    if (changedWidgetIds.has(step.id)) delete value.widget;
    if (changedVariantIds.has(step.id)) delete value.variant;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${step.id}: frozen step surface changed`);
    if (changedWidgetIds.has(step.id)) {
      if (step.widget?.type !== "compositeAreaLab") errors.push(`${path}/${step.id}: lost compositeAreaLab surface`);
      const answerProof = record.answerProof[step.id];
      if (Math.abs(answer(step.widget) - answerProof.after) > 1e-9 || Math.abs(answerProof.before - answerProof.after) > 1e-9) errors.push(`${path}/${step.id}: answer changed`);
      const feedbackProof = record.misconceptionFeedbackProof[step.id];
      if (canonical(wrongFeedback(step.widget)) !== canonical(feedbackProof.after) || canonical(feedbackProof.before) !== canonical(feedbackProof.after)) errors.push(`${path}/${step.id}: misconception feedback changed`);
    }
  }
  for (const route of doc.remedials ?? []) {
    const rid = route.check.id;
    const proof = record.frozenSurfaceProof.remedials[rid];
    if (!proof) { errors.push(`${path}/${rid}: missing remedial proof`); continue; }
    const value = structuredClone(route);
    if (proof.widgetChanged) delete value.check.widget;
    if (H(value) !== proof.after || proof.before !== proof.after) errors.push(`${path}/${rid}: remedial fields outside widget changed`);
    if (proof.widgetChanged) {
      const answerProof = record.answerProof[`remedial:${rid}`];
      if (Math.abs(answer(route.check.widget) - answerProof.after) > 1e-9 || Math.abs(answerProof.before - answerProof.after) > 1e-9) errors.push(`${path}/${rid}: remedial answer changed`);
      const feedbackProof = record.misconceptionFeedbackProof[`remedial:${rid}`];
      if (canonical(wrongFeedback(route.check.widget)) !== canonical(feedbackProof.after) || canonical(feedbackProof.before) !== canonical(feedbackProof.after)) errors.push(`${path}/${rid}: remedial feedback changed`);
    }
  }
}
if (errors.length) {
  console.error(`Session 136 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Session 136 content proof passed: ${files.length} lessons; 2 files / 13 widget nodes / 7 variant declarations changed; all other authored surfaces preserved`);
