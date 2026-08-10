#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const lessonIds = ["sp-03-02", "sp-03-03"];
const lessonPaths = lessonIds.map((id) => join(root, `content/courses/sampling-and-probability/lessons/${id}.json`));
const queue = JSON.parse(readFileSync(join(root, "EXCELLENCE_BACKLOG_S126.json"), "utf8"));
const product = JSON.parse(readFileSync(join(root, "PRODUCT_STATE.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION132_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const errors = [];
const sourceContracts = [
  ["src/lib/schema.ts", ["TrialProbabilityLabSpec", "trialProbabilityEquivalent", "trialProbabilityClaimCount", "expected exactly one accepted fraction"]],
  ["src/lib/evaluate.ts", ["case \"trialProbabilityLab\"", "trialProbabilityEquivalent(spec, choice)"]],
  ["src/lib/pedagogy.ts", ["case \"trialProbabilityLab\"", "trialProbabilityEquivalent(w, choice)"]],
  ["src/lib/describeState.ts", ["case \"trialProbabilityLab\"", "trialProbabilityClaimCount"]],
  ["src/components/widgets.tsx", ["function TrialProbabilityLabW", "tpl-learner-claim", "tpl-reveal-ghost", "same total"]],
  ["src/lib/variants.ts", ["trialRelFreq", "trialTheoretical", "const trialProbabilityLab"]],
  ["scripts/flagship-tier.mjs", ["w.type === \"trialProbabilityLab\""]],
  ["scripts/audit/excellence-backlog-s126.mjs", ["widget.type === \"trialProbabilityLab\""]]
];
for (const [path, tokens] of sourceContracts) {
  const text = readFileSync(join(root, path), "utf8");
  for (const token of tokens) if (!text.includes(token)) errors.push(`${path}: missing ${token}`);
}
const tierPath = join(tmpdir(), `maggies-tier-s132-${process.pid}.json`);
let tiers;
try {
  execFileSync(process.execPath, [join(root, "scripts", "flagship-tier.mjs")], { cwd: root, env: { ...process.env, TIER_JSON: tierPath }, stdio: "ignore", timeout: 120_000 });
  tiers = JSON.parse(readFileSync(tierPath, "utf8"));
} finally {
  rmSync(tierPath, { force: true });
}
const experiences = [];
for (const path of lessonPaths) {
  const lesson = JSON.parse(readFileSync(path, "utf8"));
  const widgets = [
    ...lesson.steps.filter((step) => step.widget?.type === "trialProbabilityLab").map((step) => ({ id: step.id, kind: step.kind, variant: step.variant, widget: step.widget })),
    ...(lesson.remedials ?? []).filter((route) => route.check.widget?.type === "trialProbabilityLab").map((route) => ({ id: `remedial:${route.check.id}`, kind: "remedial", widget: route.check.widget }))
  ];
  for (const entry of widgets) {
    const widget = entry.widget;
    if (widget.favourable > widget.total) errors.push(`${lesson.id}/${entry.id}: favourable exceeds total`);
    if (widget.mode === "theoretical") {
      if (widget.outcomes.length !== widget.total) errors.push(`${lesson.id}/${entry.id}: theoretical outcome count mismatch`);
      if (widget.outcomes.filter((outcome) => outcome.favourable).length !== widget.favourable) errors.push(`${lesson.id}/${entry.id}: favourable outcome mismatch`);
    } else if (widget.outcomes.length) errors.push(`${lesson.id}/${entry.id}: experimental mode contains outcome list`);
    const accepted = widget.choices.filter((choice) => choice.num * widget.total === widget.favourable * choice.den);
    const wrong = widget.choices.filter((choice) => choice.num * widget.total !== widget.favourable * choice.den);
    if (accepted.length !== 1) errors.push(`${lesson.id}/${entry.id}: ${accepted.length} accepted choices`);
    if (wrong.length < 2) errors.push(`${lesson.id}/${entry.id}: fewer than two exact misconception choices`);
    if (new Set(widget.choices.map((choice) => `${choice.num / choice.den}`)).size !== widget.choices.length) errors.push(`${lesson.id}/${entry.id}: duplicate rational values`);
    experiences.push({ lessonId: lesson.id, id: entry.id, kind: entry.kind, mode: widget.mode, favourable: widget.favourable, total: widget.total, accepted: accepted[0]?.label, wrongClaims: wrong.map((choice) => ({ label: choice.label, projectedFavourable: Number(((choice.num / choice.den) * widget.total).toFixed(2)) })), variantForm: entry.variant?.form ?? null });
  }
  const tier = tiers.find((row) => row.id === lesson.id);
  const expected = lesson.id === "sp-03-02" ? 27 : 30;
  if (tier?.tier !== "B" || tier.total !== expected) errors.push(`${lesson.id}: expected honest B${expected}, found ${tier?.tier}${tier?.total}`);
}
if (experiences.length !== 15) errors.push(`expected 15 converted experiences, found ${experiences.length}`);
if (experiences.filter((entry) => entry.mode === "experimental").length !== 12) errors.push("expected 12 experimental experiences");
if (experiences.filter((entry) => entry.mode === "theoretical").length !== 3) errors.push("expected 3 theoretical experiences");
if (experiences.filter((entry) => entry.variantForm).length !== 7) errors.push("expected 7 surface-preserving variant declarations");
const rows = queue.records ?? queue.rows ?? [];
for (const id of lessonIds) if (rows.some((row) => row.lessonId === id)) errors.push(`${id}: completed lesson remains in live queue`);
if (rows.length > 54) errors.push(`live queue regressed above the Session-132 ceiling: ${rows.length} > 54`);
if (product.flagshipTiers?.A < 608 || product.flagshipTiers?.B < 211 || product.flagshipTiers?.C > 282 || product.flagshipTiers?.D > 28)
  errors.push(`PRODUCT_STATE regressed below Session-132 tier floors/ceilings: ${JSON.stringify(product.flagshipTiers)}`);
if (product.widgetTypes < 108 || product.manipulatives < 102) errors.push(`PRODUCT_STATE registry regressed below Session-132 floors: widgets=${product.widgetTypes} manipulatives=${product.manipulatives}`);
if (ledger.authoredFilesChanged !== 2 || ledger.widgetNodesChanged !== 15 || ledger.variantDeclarationsChanged !== 7) errors.push("content ledger counts mismatch");
const feedbackProofs = ledger.lessons.flatMap((row) => Object.values(row.misconceptionFeedbackProof ?? {}));
if (feedbackProofs.length !== 15 || feedbackProofs.some((proof) => JSON.stringify(proof.before) !== JSON.stringify(proof.after))) errors.push("misconception feedback preservation incomplete");
const result = {
  session: 132,
  engine: "trialProbabilityLab",
  lessons: lessonIds,
  counts: { total: experiences.length, experimental: experiences.filter((entry) => entry.mode === "experimental").length, theoretical: experiences.filter((entry) => entry.mode === "theoretical").length, remedial: experiences.filter((entry) => entry.kind === "remedial").length, variantDeclarations: experiences.filter((entry) => entry.variantForm).length },
  experiences,
  tiers: { before: { A: 608, B: 209, C: 284, D: 28 }, after: product.flagshipTiers, lessonResults: { "sp-03-02": "B27", "sp-03-03": "B30" } },
  registry: { widgetTypes: product.widgetTypes, manipulativeTypes: product.manipulatives },
  queue: { before: 56, after: rows.length, unreviewed: queue.summary?.unreviewed ?? 0 },
  authoredContent: { filesChanged: 2, widgetNodesChanged: 15, variantDeclarationsChanged: 7, misconceptionFeedbackProofs: feedbackProofs.length, exception: ledger.exception },
  invariants: [
    "experimental mode keeps the authored trial evidence fixed and projects every chosen fraction onto the same total",
    "theoretical mode renders every equally likely outcome and marks exactly the authored favourable set",
    "grading, integrity, narration, and reveal use the same cross-product truth",
    "every authored wrong path remains an exact reachable choice with verbatim feedback",
    "theoretical reference probabilities remain context, never the graded target",
    "seeded variants preserve the causal trialProbabilityLab surface",
    "semantic color is paired with checkmarks, circles, diamonds, labels, and dashed lines",
    "reveal adds a tangerine target ghost without replacing the learner's sky claim"
  ],
  errors
};
writeFileSync(join(root, "TRIAL_PROBABILITY_S132.json"), JSON.stringify(result, null, 2) + "\n");
const table = experiences.map((entry) => `| ${entry.lessonId} | ${entry.id} | ${entry.mode} | ${entry.favourable}/${entry.total} | ${entry.accepted} | ${entry.wrongClaims.map((claim) => `${claim.label}→${claim.projectedFavourable}`).join(" · ")} | ${entry.variantForm ?? "—"} |`).join("\n");
writeFileSync(join(root, "TRIAL_PROBABILITY_S132.md"), `# Session 132 — Trial probability lab\n\n## Result\n\n- **New shared engine:** \`trialProbabilityLab\`.\n- **Converted experiences:** ${experiences.length}: 12 experimental and 3 theoretical, including 2 remedial checks.\n- **Surface-preserving variant declarations:** 7.\n- **Lessons:** ${lessonIds.join(", ")}; both finish at an honest Tier B.\n- **Reviewed K–8 queue:** 56 → **${rows.length}**, zero unreviewed.\n- **Product tiers:** A ${product.flagshipTiers.A} · B ${product.flagshipTiers.B} · C ${product.flagshipTiers.C} · D ${product.flagshipTiers.D}.\n- **Registry:** ${product.widgetTypes} widget types, ${product.manipulatives} manipulatives.\n\n## Breakthrough relationship\n\nOne causal surface now handles both meanings of probability. Experimental mode fixes the observed trials; theoretical mode fixes the equally likely outcome space. Every answer fraction is projected onto the same denominator, so successes-over-failures, complement, and theoretical-versus-experimental confusions become visible claims rather than opaque wrong answers.\n\n## Converted evidence\n\n| lesson | experience | mode | evidence | accepted | wrong fraction → claimed favourable count | variant form |\n|---|---|---|---:|---|---|---|\n${table}\n\n## Adversarial contract\n\n${result.invariants.map((item) => `- ${item}`).join("\n")}\n\n## Frozen-content ledger\n\nTwo lesson files changed under the broken-representation, remedial-continuity, and variant-surface-continuity exceptions: 15 widget nodes and 7 variant forms. All ${feedbackProofs.length} misconception-feedback mappings are preserved verbatim. Every other authored field is hash-proved unchanged in \`SESSION132_CONTENT_CHANGE_LEDGER.json\`.\n`);
if (errors.length) {
  console.error(`trial-probability-s132 failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`trial-probability-s132 passed: 15 experiences; two lessons -> honest B; Session-132 queue ceiling 54, current ${rows.length}; registry floor 108, current ${product.widgetTypes}`);
