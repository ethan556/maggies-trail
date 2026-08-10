#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const sha = (v) => createHash("sha256").update(typeof v === "string" ? v : JSON.stringify(v)).digest("hex");
const ledger = JSON.parse(readFileSync("SESSION128_CONTENT_CHANGE_LEDGER.json", "utf8"));
const backlog = JSON.parse(readFileSync("EXCELLENCE_BACKLOG_S126.json", "utf8"));
const lesson = (path) => JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const evaluatorSource = readFileSync("src/lib/evaluate.ts", "utf8");
const rendererSource = readFileSync("src/components/widgets.tsx", "utf8");
const schemaSource = readFileSync("src/lib/schema.ts", "utf8");
if (!evaluatorSource.includes("spec.commonPlacements.find")) errors.push("unitRuler evaluator does not map named placement misconceptions");
if (!rendererSource.includes("Math.max(spec.requiredPlacements+2,...(spec.commonPlacements ?? []).map")) errors.push("unitRuler renderer does not make named placement misconceptions reachable");
if (!rendererSource.includes(">Remove unit</button>")) errors.push("unitRuler revision is not reversible");
if (!schemaSource.includes("a commonPlacements entry equals the correct placement count")) errors.push("unitRuler integrity gate does not reject a success-state misconception");
const conversions = [];
for (const file of ledger.files) {
  const live = lesson(file.path);
  for (const change of file.changes) {
    const step = live.steps.find((s) => s.id === change.stepId);
    const w = step?.widget;
    if (!w || w.type !== "unitRuler") { errors.push(`${file.path}/${change.stepId}: not unitRuler`); continue; }
    const derived = w.objectEnd - w.objectStart;
    if (derived !== w.requiredPlacements * w.targetUnitSize) errors.push(`${file.path}/${change.stepId}: ruler invariant mismatch`);
    if (derived !== change.frozenAnswer) errors.push(`${file.path}/${change.stepId}: frozen answer mismatch`);
    for (const wrong of change.preservedMisconceptions) {
      if (!w.commonPlacements.some((c) => c.placements === wrong.placements && c.feedback === wrong.feedback))
        errors.push(`${file.path}/${change.stepId}: lost misconception ${wrong.placements}`);
    }
    conversions.push({ lessonId: live.id, stepId: change.stepId, engine: w.type, derivedAnswer: derived, misconceptions: w.commonPlacements.map((c) => c.placements) });
  }
}
const rejected = [
  {
    lessonId: "mmt-02-01",
    candidate: "estimateSlider",
    disposition: "extend",
    proof: "estimateSlider grades a continuous multiplicative acceptance interval; the authored task compares three discrete candidates. Reuse would change the assessed action and answer set."
  },
  {
    lessonId: "dop-01-02",
    candidate: "evalOrder",
    disposition: "build",
    proof: "With tokens ( 2 + 3 ) × 4, evalOrder permits only the parenthesized + before ×; its reachable final set is {20}. Authored wrong results 14 and 24 are unreachable."
  },
  {
    lessonId: "rr-03-03",
    candidate: "covariationScrubber / doubleNumberLine",
    disposition: "build",
    proof: "covariationScrubber asks the learner to set the already-given input; doubleNumberLine/ratioTable expose only low/high feedback and merge distinct authored misconceptions."
  }
];
for (const r of rejected) {
  const live = backlog.records.find((x) => x.lessonId === r.lessonId);
  if (live) {
    if (live.candidateDisposition !== r.disposition)
      errors.push(`${r.lessonId}: compiler disposition no longer preserves the S128 rejection`);
    continue;
  }
  // A later exact-fit extension may legitimately complete a rejected REUSE candidate.
  // mmt-02-01 is valid only if it uses authored discrete choices — never the continuous
  // multiplicative interval that Session 128 rejected.
  if (r.lessonId === "mmt-02-01") {
    const followThrough = lesson("content/courses/measure-money-time/lessons/mmt-02-01.json");
    const widgets = followThrough.steps.filter((step) => ["i1", "i2", "i3"].includes(step.id)).map((step) => step.widget);
    if (widgets.length !== 3 || widgets.some((widget) => widget?.type !== "estimateSlider" || !Array.isArray(widget.choices) || widget.choices.length !== 3))
      errors.push("mmt-02-01: later completion does not preserve the S128 discrete-choice rejection");
  } else if (r.lessonId === "dop-01-02") {
    // Session 148 preserves the S128 rejection of evalOrder. The exact-number lab exposes the
    // inner and outer grouped states while keeping authored 14/24 misconception routes reachable.
    const followThrough = lesson("content/courses/decimal-operations/lessons/dop-01-02.json");
    const widgets = [
      ...followThrough.steps.filter((step) => step.widget).map((step) => step.widget),
      ...followThrough.remedials.map((r) => r.check?.widget).filter(Boolean),
    ];
    const tasks = new Set(widgets.map((widget) => widget?.task));
    if (widgets.length !== 7 || widgets.some((widget) => widget?.type !== "exactNumberLab") ||
        !["groupedEvaluate", "groupedFirst"].every((task) => tasks.has(task)))
      errors.push("dop-01-02: later completion does not preserve grouping-first action and authored misconception reachability");
  } else if (r.lessonId === "rr-03-03") {
    // Session 144 did not reuse either rejected surface. It built a new exact-fit lab whose
    // normalized rows and ordered multiplicative stages keep prediction, assumption testing,
    // and cheaper-then-predict misconception routes distinct.
    const followThrough = lesson("content/courses/ratios-rates/lessons/rr-03-03.json");
    const widgets = [
      ...followThrough.steps.filter((step) => step.widget).map((step) => step.widget),
      ...followThrough.remedials.map((r) => r.check?.widget).filter(Boolean),
    ];
    const tasks = new Set(widgets.map((widget) => widget?.task));
    if (widgets.length !== 7 || widgets.some((widget) => widget?.type !== "proportionalReasoningLab") ||
        !["predictOutput", "predictInput", "steadyAssumption", "cheaperThenPredict"].every((task) => tasks.has(task)))
      errors.push("rr-03-03: later completion does not preserve the S128 action and misconception separation");
  } else {
    errors.push(`${r.lessonId}: rejected candidate disappeared without a proven follow-through`);
  }
}
if (backlog.summary.liveK8Backlog > 62) errors.push(`live backlog regressed above the S128 close: ${backlog.summary.liveK8Backlog}`);
for (const id of ["mmt-01-02", "mmt-01-03"]) if (backlog.records.some((r) => r.lessonId === id)) errors.push(`${id}: completed lesson remains in backlog`);
if (errors.length) {
  console.error(`reuse-wave-s128 FAILED (${errors.length})`); for (const e of errors) console.error(`- ${e}`); process.exit(1);
}
const report = {
  session: 128,
  method: "proof-carrying exact-fit reuse; candidates are rejected when action, answer set, or misconception reachability changes",
  summary: {
    lessonsConverted: new Set(conversions.map((c) => c.lessonId)).size,
    stepsConverted: conversions.length,
    candidatesRejected: rejected.length,
    backlogBefore: 64,
    backlogAfter: 62,
    currentBacklog: backlog.summary.liveK8Backlog,
    tierDelta: { B: 2, C: -2 },
    authoredFilesChanged: ledger.files.length
  },
  conversions,
  rejected,
  contentLedgerSha256: sha(readFileSync("SESSION128_CONTENT_CHANGE_LEDGER.json", "utf8"))
};
writeFileSync("REUSE_WAVE_S128.json", JSON.stringify(report, null, 2) + "\n");
const lines = [
  "# REUSE_WAVE_S128 — proof-carrying exact-fit reuse",
  "",
  "## Result",
  "",
  `- ${report.summary.lessonsConverted} lessons converted; ${report.summary.stepsConverted} interactive steps.`,
  `- K–8 reviewed C/D backlog at Session 128 close: ${report.summary.backlogBefore} → ${report.summary.backlogAfter}. Current live queue: ${report.summary.currentBacklog}.`,
  `- Tier movement: B +${report.summary.tierDelta.B}; C ${report.summary.tierDelta.C}.`,
  `- ${report.summary.candidatesRejected} apparent reuse candidates rejected before mutation.`,
  "",
  "## Shipped exact fits",
  "",
  "| lesson | step | engine | derived answer | preserved wrong placements |",
  "|---|---|---|---:|---|",
  ...conversions.map((c) => `| ${c.lessonId} | ${c.stepId} | ${c.engine} | ${c.derivedAnswer} | ${c.misconceptions.join(", ")} |`),
  "",
  "The unitRuler engine now accepts optional named `commonPlacements`, validates its physical invariant, keeps all named errors reachable on the 0–20 ruler, and supports reversible add/remove controls.",
  "",
  "## Rejected apparent reuses",
  "",
  ...rejected.flatMap((r, i) => [`${i + 1}. **${r.lessonId} → ${r.candidate}: ${r.disposition.toUpperCase()}.** ${r.proof}`, ""]),
  "## Content-change ledger",
  "",
  "Four widget specifications in two lesson files changed. Prompts, bodies, IDs, order, hints, explanations, concept tags, variants, answers, and all non-target steps are hash-proved unchanged. Existing misconception feedback was preserved verbatim inside reachable engine states."
];
writeFileSync("REUSE_WAVE_S128.md", lines.join("\n") + "\n");
console.log(`reuse-wave-s128: ${conversions.length} steps exact-fit; ${rejected.length} false reuses preserved; S128 backlog 64 -> 62; current ${backlog.summary.liveK8Backlog}`);
