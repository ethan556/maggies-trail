#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const lessonPath = join(root, "content/courses/measure-money-time/lessons/mmt-02-01.json");
const lesson = JSON.parse(readFileSync(lessonPath, "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION129_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const queue = JSON.parse(readFileSync(join(root, "EXCELLENCE_BACKLOG_S126.json"), "utf8"));
const product = JSON.parse(readFileSync(join(root, "PRODUCT_STATE.json"), "utf8"));
const tierPath = join(tmpdir(), `maggies-tier-s129-${process.pid}.json`);
let tier;
try {
  execFileSync(process.execPath, [join(root, "scripts/flagship-tier.mjs")], {
    cwd: root,
    env: { ...process.env, TIER_JSON: tierPath },
    stdio: "ignore",
    timeout: 120_000
  });
  tier = JSON.parse(readFileSync(tierPath, "utf8")).find((row) => row.id === lesson.id);
} finally {
  rmSync(tierPath, { force: true });
}
if (!tier) throw new Error("mmt-02-01 tier not found");
const targets = [
  ...lesson.steps.filter((step) => ["i1", "i2", "i3"].includes(step.id)).map((step) => ({ id: step.id, widget: step.widget })),
  { id: "remedial", widget: lesson.remedials.find((route) => route.conceptTag === "mmt-estimate")?.check?.widget }
];
const errors = [];
for (const target of targets) {
  const widget = target.widget;
  if (widget?.type !== "estimateSlider" || widget.choices?.length !== 3)
    errors.push(`${target.id}: not a three-choice estimateSlider`);
  else {
    const correct = widget.choices.find((choice) => choice.correct);
    if (!correct) errors.push(`${target.id}: correct choice missing`);
    else if (widget.choices.some((choice) => !choice.correct && Math.abs(choice.value - widget.target) <= Math.abs(correct.value - widget.target)))
      errors.push(`${target.id}: correct choice is not uniquely nearest`);
  }
}
const queueRows = queue.records ?? queue.rows ?? [];
if (queueRows.some((row) => row.lessonId === lesson.id)) errors.push("completed lesson remains in live excellence queue");
if (queueRows.length > 61) errors.push(`live queue regressed above the Session 129 close: ${queueRows.length}`);
if (tier.tier !== "B" || tier.total !== 27) errors.push(`expected honest B27 resting tier, found ${tier.tier}${tier.total}`);
if ((product.flagshipTiers?.B ?? 0) < 204 || (product.flagshipTiers?.C ?? 9999) > 289)
  errors.push(`product tiers regressed behind Session 129: ${JSON.stringify(product.flagshipTiers)}`);
if (ledger.widgetNodesChanged !== 4) errors.push(`content ledger says ${ledger.widgetNodesChanged} widget changes`);

const result = {
  session: 129,
  lessonId: lesson.id,
  title: lesson.title,
  engine: "estimateSlider exact discrete comparison mode",
  convertedExperiences: targets.map(({ id, widget }) => ({
    id,
    target: widget.target,
    correctValue: widget.choices.find((choice) => choice.correct).value,
    candidateValues: widget.choices.map((choice) => choice.value),
    prompt: widget.prompt
  })),
  tier: { before: "C20", after: `${tier.tier}${tier.total}`, honestRestingTier: "B" },
  productTiersAtClose: { A: 608, B: 204, C: 289, D: 28 },
  currentProductTiers: product.flagshipTiers,
  queue: { before: 62, afterAtClose: 61, current: queueRows.length, unreviewed: queue.summary?.unreviewed ?? 0 },
  authoredContent: { filesChanged: 1, widgetNodesChanged: 4, exception: ledger.exception },
  invariants: [
    "only authored candidate values are selectable",
    "exactly one candidate is correct",
    "the correct candidate is uniquely closest to the stated actual quantity",
    "every wrong candidate retains its own authored feedback",
    "the fixed actual marker and learner estimate use different shapes and labels, not color alone",
    "continuous logarithmic estimation remains behaviorally separate"
  ],
  adversarialRejects: [
    "ties at the winning distance",
    "duplicate candidate values",
    "candidate values outside the physical ruler",
    "continuous mode with a zero logarithmic minimum",
    "Check before an authored candidate is selected"
  ],
  errors
};
writeFileSync(join(root, "ESTIMATE_COMPARE_S129.json"), JSON.stringify(result, null, 2) + "\n");
const rows = result.convertedExperiences.map((row) => `| ${row.id} | ${row.target} | ${row.candidateValues.join(", ")} | ${row.correctValue} |`).join("\n");
const md = `# Session 129 — Exact discrete estimate comparison\n\n## Result\n\n- **Engine extension:** ${result.engine}.\n- **Converted experiences:** ${result.convertedExperiences.length} (three lesson interactions plus the remedial retry).\n- **Tier:** ${result.tier.before} → **${result.tier.after}**; Tier B is intentional because prediction would repeat an object-reading comparison.\n- **Reviewed K–8 queue at Session 129 close:** ${result.queue.before} → **${result.queue.afterAtClose}**. Current live queue: **${result.queue.current}**, zero unreviewed.\n- **Product tiers at Session 129 close:** A ${result.productTiersAtClose.A} · B ${result.productTiersAtClose.B} · C ${result.productTiersAtClose.C} · D ${result.productTiersAtClose.D}. Current: A ${result.currentProductTiers.A} · B ${result.currentProductTiers.B} · C ${result.currentProductTiers.C} · D ${result.currentProductTiers.D}.\n\n## Independently derived candidates\n\n| experience | stated actual | authored candidates | uniquely closest |\n|---|---:|---|---:|\n${rows}\n\n## Breakthrough interaction\n\nThe engine no longer treats “estimate” as a generic continuous tolerance window. In exact-choice mode it renders a physical zero-based comparison ruler, a fixed diamond for the stated actual length, a circular learner marker, and a dashed distance band. The learner may select only the authored values; each wrong value routes to its original diagnosis. Continuous order-of-magnitude estimation remains the existing logarithmic mode.\n\n## Adversarial contract\n\n${result.invariants.map((item) => `- ${item}`).join("\n")}\n\nRejected authoring defects:\n\n${result.adversarialRejects.map((item) => `- ${item}`).join("\n")}\n\n## Frozen-content ledger\n\nOne lesson JSON changed under the broken-representation exception: four widget nodes only. Prompts, bodies, IDs, ordering, checks, challenges, answers, hints, explanation variants, variants, concept tags, remedial mapping, and every non-target lesson remain hash-proved unchanged. See \`SESSION129_CONTENT_CHANGE_LEDGER.json\`.\n`;
writeFileSync(join(root, "ESTIMATE_COMPARE_S129.md"), md);
if (errors.length) {
  console.error(`estimate-compare-s129 failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`estimate-compare-s129 passed: 4 exact-choice experiences; mmt-02-01 C20 -> ${tier.tier}${tier.total}; S129 queue 62 -> 61; current ${queueRows.length}`);
