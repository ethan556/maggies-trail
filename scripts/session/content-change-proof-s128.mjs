#!/usr/bin/env node
/** Reproducible proof that Session 128 changed only the ledgered widget specs. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION127_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION128_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const sha = (value) => createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest("hex");
const without = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (path.endsWith(".json") && /content\/courses\/[^/]+\/lessons\//.test(path.replaceAll("\\", "/"))) files.push(path);
  }
  return files;
}
const livePaths = walk(join(root, "content", "courses")).map((p) => relative(root, p).replaceAll("\\", "/"));
const changed = new Map(ledger.files.map((f) => [f.path, f]));
const errors = [];
for (const path of livePaths) {
  const raw = readFileSync(join(root, path));
  const fileSha = sha(raw);
  const entry = changed.get(path);
  if (!entry) {
    if (baseline.files[path] !== fileSha) errors.push(`${path}: changed outside ledger`);
    continue;
  }
  if (baseline.files[path] !== entry.beforeFileSha256) errors.push(`${path}: ledger preimage does not match Session 127`);
  if (entry.afterFileSha256 !== fileSha) errors.push(`${path}: current file does not match ledger after-image`);
  const lesson = JSON.parse(raw);
  const targetIds = new Set(entry.changes.map((c) => c.stepId));
  if (sha(without(lesson, ["steps"])) !== entry.topLevelWithoutStepsSha256) errors.push(`${path}: top-level lesson surface changed`);
  if (sha(lesson.steps.map((s) => s.id)) !== entry.stepOrderSha256) errors.push(`${path}: step order changed`);
  if (sha(lesson.steps.filter((s) => !targetIds.has(s.id))) !== entry.nonTargetStepsSha256) errors.push(`${path}: non-target step changed`);
  for (const change of entry.changes) {
    const step = lesson.steps.find((s) => s.id === change.stepId);
    if (!step) { errors.push(`${path}/${change.stepId}: missing`); continue; }
    if (sha(without(step, ["widget"])) !== change.frozenStepSurfaceSha256) errors.push(`${path}/${change.stepId}: frozen surface changed`);
    if (sha(step.widget) !== change.afterWidgetSha256) errors.push(`${path}/${change.stepId}: widget differs from approved after-image`);
    if (step.widget.type !== "unitRuler") errors.push(`${path}/${change.stepId}: expected unitRuler`);
    const derived = step.widget.objectEnd - step.widget.objectStart;
    if (derived !== change.frozenAnswer || derived !== change.independentlyDerivedAnswer)
      errors.push(`${path}/${change.stepId}: independently derived answer changed`);
    for (const wrong of change.preservedMisconceptions) {
      const live = step.widget.commonPlacements.find((c) => c.placements === wrong.placements);
      if (!live || live.feedback !== wrong.feedback) errors.push(`${path}/${change.stepId}: misconception ${wrong.placements} not preserved`);
    }
  }
}
for (const path of Object.keys(baseline.files)) if (!livePaths.includes(path)) errors.push(`${path}: removed since Session 127`);
for (const path of changed.keys()) if (!livePaths.includes(path)) errors.push(`${path}: ledgered file missing`);
if (errors.length) {
  console.error(`Session 128 content proof FAILED (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Session 128 content proof passed: ${livePaths.length} lessons; ${changed.size} files / ${ledger.files.reduce((n,f)=>n+f.changes.length,0)} widget specs changed, every other authored surface preserved`);
