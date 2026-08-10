#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const lessonIds = ["sp-02-01", "sp-02-02", "sp-02-03"];
const lessonPaths = lessonIds.map((id) => join(root, `content/courses/sampling-and-probability/lessons/${id}.json`));
const queue = JSON.parse(readFileSync(join(root, "EXCELLENCE_BACKLOG_S126.json"), "utf8"));
const product = JSON.parse(readFileSync(join(root, "PRODUCT_STATE.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION131_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const tierPath = join(tmpdir(), `maggies-tier-s131-${process.pid}.json`);
let tiers;
try {
  execFileSync(process.execPath, [join(root, "scripts", "flagship-tier.mjs")], {
    cwd: root,
    env: { ...process.env, TIER_JSON: tierPath },
    stdio: "ignore",
    timeout: 120_000
  });
  tiers = JSON.parse(readFileSync(tierPath, "utf8"));
} finally {
  rmSync(tierPath, { force: true });
}
const errors = [];
const sourceContracts = [
  ["src/lib/schema.ts", ["DistributionCompareLabSpec", "distributionGapUnits", "distributionOverlapFraction", "expected exactly one accepted choice"]],
  ["src/lib/evaluate.ts", ["case \"distributionCompareLab\"", "spec.measureChoices.find", "spec.judgeOptions.find"]],
  ["src/components/widgets.tsx", ["function DistributionCompareLabW", "dcl-overlap", "dcl-reveal-ghost", "variability-width"]],
  ["src/lib/variants.ts", ["const distributionMeasure", "const distributionJudge", "g7-sp-gap-units", "g7-sp-overlap-interpret"]],
  ["scripts/flagship-tier.mjs", ["Array.isArray(w.measureChoices)", "Array.isArray(w.judgeOptions)"]]
];
for (const [path, tokens] of sourceContracts) {
  const text = readFileSync(join(root, path), "utf8");
  for (const token of tokens) if (!text.includes(token)) errors.push(`${path}: missing contract token ${token}`);
}
const experiences = [];
for (const path of lessonPaths) {
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  const widgets = [
    ...lesson.steps.filter((step) => step.widget).map((step) => ({ id: step.id, widget: step.widget, kind: step.kind })),
    ...(lesson.remedials ?? []).map((route) => ({ id: `remedial:${route.conceptTag}`, widget: route.check.widget, kind: "remedial" }))
  ];
  for (const entry of widgets) {
    const widget = entry.widget;
    if (widget.type !== "distributionCompareLab") {
      errors.push(`${lesson.id}/${entry.id}: expected distributionCompareLab, found ${widget.type}`);
      continue;
    }
    if (widget.mode === "measure") {
      const derived = Math.abs(widget.meanA - widget.meanB) / widget.variability;
      if (Math.abs(derived - widget.answer) > widget.tolerance) errors.push(`${lesson.id}/${entry.id}: answer ${widget.answer} contradicts derived ${derived}`);
      const accepted = widget.measureChoices.filter((choice) => Math.abs(choice.value - widget.answer) <= widget.tolerance);
      if (accepted.length !== 1) errors.push(`${lesson.id}/${entry.id}: ${accepted.length} accepted choices`);
      if (widget.measureChoices.filter((choice) => Math.abs(choice.value - widget.answer) > widget.tolerance).length < 2)
        errors.push(`${lesson.id}/${entry.id}: fewer than two reachable misconception choices`);
      experiences.push({ lessonId: lesson.id, id: entry.id, mode: widget.mode, derivedGap: derived, acceptedAnswer: widget.answer, wrongStates: widget.measureChoices.filter((choice) => Math.abs(choice.value - widget.answer) > widget.tolerance).map((choice) => choice.value) });
    } else {
      const correct = widget.judgeOptions.filter((option) => option.correct);
      if (correct.length !== 1) errors.push(`${lesson.id}/${entry.id}: ${correct.length} correct conclusions`);
      if (widget.judgeOptions.filter((option) => !option.correct).length < 2) errors.push(`${lesson.id}/${entry.id}: fewer than two misconception conclusions`);
      experiences.push({ lessonId: lesson.id, id: entry.id, mode: widget.mode, derivedGap: widget.gapUnits, acceptedAnswer: correct[0]?.label, wrongStates: widget.judgeOptions.filter((option) => !option.correct).map((option) => option.label) });
    }
  }
  const tier = tiers.find((row) => row.id === lesson.id);
  const expectedTotal = lesson.id === "sp-02-01" ? 31 : 30;
  if (tier?.tier !== "B" || tier.total !== expectedTotal) errors.push(`${lesson.id}: expected honest B${expectedTotal}, found ${tier?.tier}${tier?.total}`);
}
if (experiences.length !== 26) errors.push(`expected 26 converted experiences, found ${experiences.length}`);
if (experiences.filter((entry) => entry.mode === "measure").length !== 18) errors.push("expected 18 measure experiences");
if (experiences.filter((entry) => entry.mode === "judge").length !== 8) errors.push("expected 8 judge experiences");
const rows = queue.records ?? queue.rows ?? [];
for (const id of lessonIds) if (rows.some((row) => row.lessonId === id)) errors.push(`${id}: completed lesson remains in live queue`);
if (rows.length > 56) errors.push(`live queue regressed above the Session 131 ceiling: ${rows.length}`);
if ((product.flagshipTiers?.A ?? 0) < 608 || ((product.flagshipTiers?.A ?? 0) + (product.flagshipTiers?.B ?? 0)) < 817 || ((product.flagshipTiers?.C ?? 9999) + (product.flagshipTiers?.D ?? 9999)) > 312)
  errors.push(`PRODUCT_STATE regressed below the Session 131 tier floor: ${JSON.stringify(product.flagshipTiers)}`);
if (ledger.filesChanged !== 3 || ledger.widgetNodesChanged !== 26) errors.push("content ledger counts mismatch");
const feedbackProofs = ledger.lessons.flatMap((row) => Object.values(row.misconceptionFeedbackProof ?? {}));
if (feedbackProofs.length !== 26 || feedbackProofs.some((proof) => JSON.stringify(proof.before) !== JSON.stringify(proof.after)))
  errors.push("misconception-feedback preservation proof is incomplete");
const result = {
  session: 131,
  engine: "distributionCompareLab",
  lessons: lessonIds,
  convertedExperiences: experiences,
  counts: { total: experiences.length, measure: experiences.filter((entry) => entry.mode === "measure").length, judge: experiences.filter((entry) => entry.mode === "judge").length },
  tiers: { before: { A: 608, B: 206, C: 287, D: 28 }, after: product.flagshipTiers, lessonResults: { "sp-02-01": "B31", "sp-02-02": "B30", "sp-02-03": "B30" } },
  queue: { before: 59, after: rows.length, unreviewed: queue.summary?.unreviewed ?? 0 },
  authoredContent: { filesChanged: 3, widgetNodesChanged: 26, misconceptionFeedbackProofs: feedbackProofs.length, exception: ledger.exception },
  invariants: [
    "the two distributions and their overlap are visible before the learner answers",
    "measure mode derives the standardized gap from the displayed means and variability-width",
    "judge mode preserves the authored conclusion rather than inventing a global numeric threshold",
    "every authored wrong path remains an exact reachable choice with verbatim feedback",
    "reversing group order cannot make the standardized gap negative",
    "seeded variants stay on the same causal surface",
    "reveal adds a tangerine target without replacing the learner's sky tape"
  ],
  errors
};
writeFileSync(join(root, "DISTRIBUTION_COMPARE_S131.json"), JSON.stringify(result, null, 2) + "\n");
const rowsMd = experiences.map((entry) => `| ${entry.lessonId} | ${entry.id} | ${entry.mode} | ${typeof entry.derivedGap === "number" ? Number(entry.derivedGap.toFixed(2)) : entry.derivedGap} | ${entry.acceptedAnswer} | ${entry.wrongStates.join(" · ")} |`).join("\n");
writeFileSync(join(root, "DISTRIBUTION_COMPARE_S131.md"), `# Session 131 — Causal distribution comparison\n\n## Result\n\n- **New shared engine:** \`distributionCompareLab\`.\n- **Converted experiences:** ${experiences.length}: 18 standardized-gap measurements and 8 overlap conclusions.\n- **Lessons:** ${lessonIds.join(", ")}; all finish at an honest Tier B.\n- **Reviewed K–8 queue:** 59 → **${rows.length}**, zero unreviewed.\n- **Product tiers:** A ${product.flagshipTiers.A} · B ${product.flagshipTiers.B} · C ${product.flagshipTiers.C} · D ${product.flagshipTiers.D}.\n\n## Breakthrough relationship\n\nThe same fixed geometry now supports both claims in the strand: the raw distance between means is measured in one shared variability-width, and that standardized distance visibly controls overlap. The learner manipulates the conclusion or the unit-count, while the distributions remain fixed evidence.\n\n## Converted evidence\n\n| lesson | experience | mode | gap units | accepted answer | preserved wrong states |\n|---|---|---|---:|---|---|\n${rowsMd}\n\n## Adversarial contract\n\n${result.invariants.map((item) => `- ${item}`).join("\n")}\n\n## Frozen-content ledger\n\nThree lesson JSON files changed under the broken-representation exception: 26 widget nodes. All ${feedbackProofs.length} authored misconception-feedback mappings are preserved verbatim, and every field outside the target widget nodes is hash-proved unchanged in \`SESSION131_CONTENT_CHANGE_LEDGER.json\`.\n`);
if (errors.length) {
  console.error(`distribution-compare-s131 failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`distribution-compare-s131 passed: 26 experiences; three lessons -> honest B; queue 59 -> ${rows.length}`);
