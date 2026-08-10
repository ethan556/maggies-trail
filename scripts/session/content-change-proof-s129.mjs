#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION128_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION129_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const targetPath = ledger.sourcePath;
const currentText = readFileSync(join(root, targetPath), "utf8");
const current = JSON.parse(currentText);
const sha = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const H = (value) => sha(canonical(value));
const errors = [];
if (ledger.baselineSession !== 128) errors.push("ledger baselineSession must be 128");
if (baseline.files[targetPath] !== ledger.beforeSha256)
  errors.push("target before hash does not match the sealed Session 128 lesson hash");
if (sha(currentText) !== ledger.afterSha256)
  errors.push("target after hash does not match current lesson bytes");

function walkLessons() {
  const out = [];
  const courses = join(root, "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".json")))
      out.push(`content/courses/${course}/lessons/${file}`);
  }
  return out.sort();
}
const files = walkLessons();
if (files.length !== baseline.count) errors.push(`lesson count ${files.length} != baseline ${baseline.count}`);
for (const path of files) {
  if (path === targetPath) continue;
  const actual = sha(readFileSync(join(root, path)));
  if (actual !== baseline.files[path]) errors.push(`${path}: changed outside the declared target`);
}

const top = Object.fromEntries(Object.entries(current).filter(([key]) => key !== "steps" && key !== "remedials"));
if (H(top) !== ledger.frozenSurfaceProof.topLevel.after || ledger.frozenSurfaceProof.topLevel.before !== ledger.frozenSurfaceProof.topLevel.after)
  errors.push("top-level frozen lesson fields changed");
const orderHash = H(current.steps.map((step) => step.id));
if (orderHash !== ledger.frozenSurfaceProof.stepOrder.after || ledger.frozenSurfaceProof.stepOrder.before !== ledger.frozenSurfaceProof.stepOrder.after)
  errors.push("step ordering changed");

const targetIds = new Set(["i1", "i2", "i3"]);
for (const step of current.steps) {
  const proof = ledger.frozenSurfaceProof.steps[step.id];
  if (!proof) { errors.push(`missing frozen proof for ${step.id}`); continue; }
  const value = targetIds.has(step.id)
    ? Object.fromEntries(Object.entries(step).filter(([key]) => key !== "widget"))
    : step;
  if (H(value) !== proof.after || proof.before !== proof.after)
    errors.push(`${step.id}: frozen step surface changed`);
}
const route = current.remedials.find((candidate) => candidate.conceptTag === "mmt-estimate");
if (!route) errors.push("mmt-estimate remedial missing");
else {
  const copy = structuredClone(route);
  delete copy.check.widget;
  const proof = ledger.frozenSurfaceProof.remedials["mmt-estimate"];
  if (H(copy) !== proof.after || proof.before !== proof.after)
    errors.push("mmt-estimate remedial fields outside check.widget changed");
}

const targets = [
  ...current.steps.filter((step) => targetIds.has(step.id)).map((step) => ({ path: `steps/${step.id}`, widget: step.widget })),
  { path: "remedials/mmt-estimate/check", widget: route?.check?.widget }
];
for (const { path, widget } of targets) {
  if (widget?.type !== "estimateSlider" || !Array.isArray(widget.choices) || widget.choices.length !== 3) {
    errors.push(`${path}: expected three-choice estimateSlider`);
    continue;
  }
  if (widget.min !== 0) errors.push(`${path}: physical comparison ruler must start at zero`);
  const correct = widget.choices.filter((choice) => choice.correct);
  if (correct.length !== 1) errors.push(`${path}: exactly one correct choice required`);
  else {
    const gap = Math.abs(correct[0].value - widget.target);
    if (widget.choices.some((choice) => !choice.correct && Math.abs(choice.value - widget.target) <= gap))
      errors.push(`${path}: correct choice is not uniquely nearest`);
  }
  for (const choice of widget.choices) {
    if (!choice.label || !choice.feedback) errors.push(`${path}: choice lost authored label or feedback`);
  }
}

const schema = readFileSync(join(root, "src/lib/schema.ts"), "utf8");
const evaluate = readFileSync(join(root, "src/lib/evaluate.ts"), "utf8");
const renderer = readFileSync(join(root, "src/components/widgets.tsx"), "utf8");
for (const token of [
  "estimateSlider choices: exactly one candidate must be correct",
  "estimateSlider choices: the correct candidate must be uniquely closest to the target"
]) if (!schema.includes(token)) errors.push(`schema guard missing: ${token}`);
for (const token of ["spec.choices.find", "Choose one of the shown estimates", "choice.feedback"])
  if (!evaluate.includes(token)) errors.push(`evaluate exact-choice route missing: ${token}`);
for (const token of ["DiscreteEstimateCompareW", "estimate-choice-gap", "estimate-choice-answer-ghost", "min-h-11"])
  if (!renderer.includes(token)) errors.push(`renderer exact-choice evidence missing: ${token}`);

if (errors.length) {
  console.error(`Session 129 content proof failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Session 129 content proof passed: ${files.length} lessons; 1 file / 4 widget nodes changed, all other authored surfaces preserved`);
