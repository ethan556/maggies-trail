#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const lessonPath = "content/courses/sampling-and-probability/lessons/sp-04-03.json";
const lesson = JSON.parse(readFileSync(join(root, lessonPath), "utf8"));
const errors = [];
const product = (xs) => xs.reduce((a, b) => a * b, 1);
const total = (w) => product(w.stages.map((s) => s.outcomes.length));
const favourable = (w) => product(w.stages.map((s) => s.favourable.length));
const correct = (w, c) => w.mode === "count" ? c.count === total(w) : c.num * total(w) === favourable(w) * c.den;
const specs = [];
for (const step of lesson.steps) if (step.widget?.type === "compoundEventLab") specs.push({ id: step.id, remedial: false, widget: step.widget });
for (const route of lesson.remedials ?? []) if (route.check.widget?.type === "compoundEventLab") specs.push({ id: route.check.id, remedial: true, widget: route.check.widget });
if (specs.length !== 8) errors.push(`expected 8 fixed compoundEventLab experiences, found ${specs.length}`);
if (specs.filter((x) => x.widget.mode === "count").length !== 5) errors.push("expected 5 count experiences");
if (specs.filter((x) => x.widget.mode === "probability").length !== 3) errors.push("expected 3 probability experiences");
const expected = { i1: "30", k1: "1/4", i2: "16", i3: "1/9", k2: "20", k3: "12", ch1: "1/4", "rem-srp-k": "30" };
for (const row of specs) {
  const w = row.widget;
  const t = total(w);
  const fav = favourable(w);
  if (t > 120) errors.push(`${row.id}: total ${t} exceeds visual ceiling`);
  if (w.mode === "count" && w.stages.some((s) => s.favourable.length)) errors.push(`${row.id}: count mode has favourable indices`);
  if (w.mode === "probability" && w.stages.some((s) => s.favourable.length === 0)) errors.push(`${row.id}: probability stage lacks favourable outcomes`);
  const right = w.choices.filter((c) => correct(w, c));
  if (right.length !== 1) errors.push(`${row.id}: expected one correct choice, found ${right.length}`);
  const actual = right[0]?.label;
  if (actual !== expected[row.id]) errors.push(`${row.id}: correct label ${actual} != ${expected[row.id]}`);
  const wrong = w.choices.filter((c) => !correct(w, c));
  if (wrong.length < 2) errors.push(`${row.id}: fewer than two misconception paths`);
  if (wrong.some((c) => typeof c.feedback !== "string" || c.feedback.length < 25)) errors.push(`${row.id}: weak/missing misconception feedback`);
  if (w.mode === "probability" && fav <= 0) errors.push(`${row.id}: no favourable outcomes`);
}
const declarations = [];
for (const step of lesson.steps) if (step.variant) declarations.push(`${step.variant.gen}/${step.variant.form}`);
const expectedDecl = [
  "g7-sp-compound-model/spCompoundBasic",
  "g7-sp-counting-principle/spCountOutfitsReal",
  "g7-sp-counting-principle/spCountCoinDieReal",
  "g7-sp-compound-model/spCompoundGame"
];
for (const item of expectedDecl) if (!declarations.includes(item)) errors.push(`missing variant declaration ${item}`);
const variantSource = readFileSync(join(root, "src/lib/variants.ts"), "utf8");
for (const needle of ["compoundCountLab(", "compoundProbabilityLab(", 'form === "spCountOutfitsReal"', 'form === "spCountCoinDieReal"', 'form === "spCompoundGame"']) {
  if (!variantSource.includes(needle)) errors.push(`variant source missing ${needle}`);
}
const registration = {
  schema: readFileSync(join(root, "src/lib/schema.ts"), "utf8").includes('type: z.literal("compoundEventLab")'),
  renderer: readFileSync(join(root, "src/components/widgets.tsx"), "utf8").includes('case "compoundEventLab"'),
  narration: readFileSync(join(root, "src/lib/describeState.ts"), "utf8").includes('case "compoundEventLab"'),
  stageWidth: readFileSync(join(root, "src/components/stageWidth.ts"), "utf8").includes('compoundEventLab: "wide"'),
  sample: readFileSync(join(root, "src/components/widgetSamples.ts"), "utf8").includes('type: "compoundEventLab"'),
  capabilities: Boolean(JSON.parse(readFileSync(join(root, "scripts/engine-capabilities.json"), "utf8")).types.compoundEventLab)
};
for (const [surface, present] of Object.entries(registration)) if (!present) errors.push(`registration surface missing: ${surface}`);
if (errors.length) {
  console.error(`Session 133 compound-event audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const report = {
  session: 133,
  lessonId: lesson.id,
  lessonPath,
  fixedExperiences: specs.length,
  countExperiences: specs.filter((x) => x.widget.mode === "count").length,
  probabilityExperiences: specs.filter((x) => x.widget.mode === "probability").length,
  variantDeclarations: expectedDecl,
  registry: registration,
  experiences: specs.map(({ id, remedial, widget: w }) => ({
    id, remedial, mode: w.mode, factors: w.stages.map((s) => s.outcomes.length),
    total: total(w), favourable: w.mode === "probability" ? favourable(w) : null,
    correct: w.choices.find((c) => correct(w, c)).label,
    wrongPaths: w.choices.filter((c) => !correct(w, c)).length
  })),
  sourceSha256: createHash("sha256").update(readFileSync(join(root, lessonPath))).digest("hex")
};
writeFileSync(join(root, "COMPOUND_EVENT_S133.json"), JSON.stringify(report, null, 2) + "\n");
const rows = report.experiences.map((x) => `| ${x.id} | ${x.remedial ? "yes" : "no"} | ${x.mode} | ${x.factors.join(" × ")} | ${x.total} | ${x.favourable ?? "—"} | ${x.correct} | ${x.wrongPaths} |`).join("\n");
writeFileSync(join(root, "COMPOUND_EVENT_S133.md"), `# Session 133 — Compound event laboratory\n\nThe fixed stage structure, complete ordered sample space, and learner claim share one deterministic truth. Count and probability are separate modes and separate grading contracts.\n\n| experience | remedial | mode | stage factors | total | favourable | correct claim | wrong paths |\n|---|---|---|---:|---:|---:|---:|---:|\n${rows}\n\n- Fixed experiences: **${report.fixedExperiences}**\n- Count claims: **${report.countExperiences}**\n- Probability claims: **${report.probabilityExperiences}**\n- Declared variant forms preserved on the new surface: **${expectedDecl.length}**\n- Registration surfaces checked: **${Object.keys(registration).length}/${Object.keys(registration).length}**\n`, "utf8");
console.log(`compound-event-s133: ${specs.length}/8 fixed experiences; ${expectedDecl.length}/4 variant declarations; registration ${Object.keys(registration).length}/${Object.keys(registration).length}`);
