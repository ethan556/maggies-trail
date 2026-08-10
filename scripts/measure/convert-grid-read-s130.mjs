#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const targets = [
  {
    lessonId: "ssg2-02-02",
    path: "content/courses/shapes-shares-g2/lessons/ssg2-02-02.json",
    stepForms: { k1: "colTrapRead", k2: "read", k3: "read", ch1: "squareRead" },
    remedialTag: "ssg2-grid-count"
  },
  {
    lessonId: "ssg2-02-03",
    path: "content/courses/shapes-shares-g2/lessons/ssg2-02-03.json",
    stepForms: { k1: "Ssg2GridApplyRead", k2: "Ssg2GridApplyRead", k3: "Ssg2GridApplyRead", ch1: "Ssg2GridApplyRead" },
    remedialTag: "ssg2-grid-apply"
  }
];
const dryRun = process.argv.includes("--dry-run");
const sha = (text) => createHash("sha256").update(text).digest("hex");
const clone = (v) => JSON.parse(JSON.stringify(v));

function parseGrid(widget, location) {
  if (!widget || widget.type !== "numeric") throw new Error(`${location}: expected numeric widget`);
  const m = widget.prompt.match(/(?:partitioned into|has)\s+(\d+)\s+rows\s+and\s+(\d+)\s+columns/i);
  if (!m) throw new Error(`${location}: could not derive rows/columns from prompt`);
  const rows = Number(m[1]);
  const cols = Number(m[2]);
  const answer = rows * cols;
  if (widget.answer !== answer) throw new Error(`${location}: authored answer ${widget.answer} != ${rows}×${cols}`);
  if (!Array.isArray(widget.commonErrors) || widget.commonErrors.length < 2)
    throw new Error(`${location}: expected at least two authored misconception paths`);
  const counts = widget.commonErrors.map((entry) => ({ count: entry.value, feedback: entry.feedback }));
  if (new Set(counts.map((entry) => entry.count)).size !== counts.length)
    throw new Error(`${location}: duplicate misconception counts`);
  for (const entry of counts) {
    if (!Number.isInteger(entry.count) || entry.count < 0 || entry.count > answer)
      throw new Error(`${location}: misconception ${entry.count} is not reachable on the fixed ${answer}-cell grid`);
    if (entry.count === answer) throw new Error(`${location}: misconception equals the correct count`);
  }
  return {
    type: "areaModel",
    prompt: widget.prompt,
    targetArea: answer,
    wMax: cols,
    hMax: rows,
    wStart: cols,
    hStart: rows,
    countGrid: true,
    commonCounts: counts,
    successFeedback: widget.fallbackFeedback,
    lowFeedback: widget.fallbackFeedback,
    highFeedback: widget.fallbackFeedback
  };
}

const ledger = { session: 130, baselineSession: 129, exception: "broken representation / broken remedial interaction / variant surface continuity", authoredFilesChanged: 0, widgetNodesChanged: 0, variantDeclarationsChanged: 0, lessons: [] };
for (const target of targets) {
  const full = join(root, target.path);
  const beforeText = readFileSync(full, "utf8");
  const lesson = JSON.parse(beforeText);
  if (lesson.id !== target.lessonId) throw new Error(`${target.path}: expected ${target.lessonId}, found ${lesson.id}`);
  const before = clone(lesson);
  const changes = [];
  for (const step of lesson.steps) {
    if (!step.widget || !["i1", "i2", "i3", "k1", "k2", "k3", "ch1"].includes(step.id)) continue;
    const oldWidget = clone(step.widget);
    step.widget = parseGrid(step.widget, `${lesson.id}/${step.id}`);
    if (step.variant) {
      const form = target.stepForms[step.id];
      if (!form) throw new Error(`${lesson.id}/${step.id}: missing read-mode variant form`);
      const oldForm = step.variant.form ?? "default";
      step.variant.form = form;
      ledger.variantDeclarationsChanged++;
      changes.push({ path: `steps/${step.id}/variant/form`, before: oldForm, after: form, reason: "Variant must preserve the authored areaModel counting surface." });
    }
    ledger.widgetNodesChanged++;
    changes.push({
      path: `steps/${step.id}/widget`,
      rows: step.widget.hStart,
      columns: step.widget.wStart,
      answer: step.widget.targetArea,
      commonCounts: step.widget.commonCounts.map((entry) => entry.count),
      preservedPrompt: oldWidget.prompt,
      preservedFeedback: [...oldWidget.commonErrors.map((entry) => entry.feedback), oldWidget.fallbackFeedback],
      reason: "The lesson asked the learner to count a grid that was never drawn. Fixed-grid counting now renders the authored rows and columns without allowing factor construction."
    });
  }
  const route = lesson.remedials.find((candidate) => candidate.conceptTag === target.remedialTag);
  if (!route?.check?.widget) throw new Error(`${lesson.id}: missing remedial ${target.remedialTag}`);
  const oldRemedial = clone(route.check.widget);
  route.check.widget = parseGrid(route.check.widget, `${lesson.id}/remedials/${target.remedialTag}`);
  ledger.widgetNodesChanged++;
  changes.push({
    path: `remedials/${target.remedialTag}/check/widget`,
    rows: route.check.widget.hStart,
    columns: route.check.widget.wStart,
    answer: route.check.widget.targetArea,
    commonCounts: route.check.widget.commonCounts.map((entry) => entry.count),
    preservedPrompt: oldRemedial.prompt,
    preservedFeedback: [...oldRemedial.commonErrors.map((entry) => entry.feedback), oldRemedial.fallbackFeedback],
    reason: "The remedial retry now shows the same fixed grid rather than returning to an undrawn numeric prompt."
  });

  // Only target widgets and declared variant forms may change.
  const strip = (doc) => {
    const x = clone(doc);
    for (const step of x.steps) {
      if (["i1", "i2", "i3", "k1", "k2", "k3", "ch1"].includes(step.id)) {
        step.widget = "__TARGET_WIDGET__";
        if (step.variant) step.variant.form = "__TARGET_FORM__";
      }
    }
    const r = x.remedials.find((candidate) => candidate.conceptTag === target.remedialTag);
    r.check.widget = "__TARGET_WIDGET__";
    return x;
  };
  if (JSON.stringify(strip(before)) !== JSON.stringify(strip(lesson)))
    throw new Error(`${lesson.id}: non-target authored fields changed; aborting`);
  const afterText = JSON.stringify(lesson, null, 1) + "\n";
  ledger.authoredFilesChanged++;
  ledger.lessons.push({ lessonId: lesson.id, sourcePath: target.path, beforeSha256: sha(beforeText), afterSha256: sha(afterText), changes });
  if (!dryRun) writeFileSync(full, afterText);
}
if (!dryRun) writeFileSync(join(root, "SESSION130_CONTENT_CHANGE_LEDGER.json"), JSON.stringify(ledger, null, 2) + "\n");
console.log(`${dryRun ? "dry-run" : "converted"}: ${ledger.authoredFilesChanged} lessons, ${ledger.widgetNodesChanged} fixed-grid widgets, ${ledger.variantDeclarationsChanged} variant forms`);
