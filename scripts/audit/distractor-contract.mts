/**
 * S242 / GEN-03 — THE DISTRACTOR CONTRACT. A CENSUS, AFTER THREE DETECTORS FAILED.
 *
 * CLAUDE.md rule 3: "Every distractor is a computed real misconception whose feedback names it.
 * Never 'try again' — say what the learner did and why it fails, using the numbers actually drawn."
 *
 * THIS FILE STARTED AS A FINDINGS LIST AND IS A CENSUS BECAUSE THE FINDINGS WERE ALL FALSE.
 *
 * Three detectors were written, run over the registry, and thrown away. They are recorded here
 * because the reason each failed is the actual result of this packet:
 *
 *   · `diagnosis-without-numbers` — 1,778 rows. Rule 3 says "using the numbers actually drawn", so
 *     feedback with no digits looked generic. 12 read by hand, 12 were correct: "The whole should be
 *     first in this missing-part subtraction", "A cylinder has two flat faces and one curved
 *     surface", "This omits or mis-signs the middle terms". The clause about numbers governs
 *     misconceptions that ARE numeric; for a quadrant-sign or shape-classification error, quoting
 *     numbers would make the diagnosis worse. 0/12.
 *
 *   · `diagnosis-number-untraceable` — 1,320 rows, closing traceability over one-step combinations
 *     of the prompt's figures. 12 read by hand, 12 were correct. The misses were structural, not
 *     tunable: "62.5 = v_y²/g forgets the factor 2" quotes a named CONSTANT; "120 is group A as a
 *     whole (0.6 × 200) — only 50% of them…" restates a proportion as a percentage; "12 is the
 *     HALF-diagonal (√(169 − 25))" reaches a prompt number's square. Widening the closure far
 *     enough to admit these admits nearly every small number, which makes the detector vacuous
 *     rather than correct. 0/12.
 *
 *   · `no-error-reference-marker` — 1,549 strings with no second-person, contrastive or
 *     error-naming vocabulary. 30 distinct shapes read by hand, 30 were correct: "16 is the whole
 *     coefficient. Matching x² = 4py: 4p = 16, so the focus sits 4 from the vertex." Naming the
 *     learner's value and correcting it needs none of the vocabulary the detector wanted. 0/30.
 *
 * Plus 20 uniform-random distractor strings read as a control, also all correct. 74 read in total,
 * zero defects. THAT is the finding: rule 3 is already met by the generated corpus, and GEN-03's
 * premise — that distractor feedback needs a contract imposed on it — does not hold here.
 *
 * WHAT REMAINS GENUINELY MISSING, and what this census therefore measures instead:
 *
 *   1. There is NO per-distractor misconception IDENTIFIER anywhere. `cml.misconceptions` holds 644
 *      distinct entries across 960 lessons, but they are authored PROSE, three misconceptions to a
 *      sentence, attached to a LESSON. Nothing connects a distractor to a named error, so nothing
 *      can check that two distractors testing the same misconception agree, or that a lesson's
 *      declared misconceptions are the ones its distractors actually probe. That is the real gap.
 *   2. The banned phrasings rule 3 names explicitly — "try again" and its family — are checkable
 *      today, and are checked below.
 *
 * Run: npx tsx scripts/audit/distractor-contract.mts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS, variantForGenForm } from "../../src/lib/variants";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
const SEEDS = 3;
const BANDS: Band[] = ["support", "core", "stretch"];
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/**
 * The phrasings rule 3 bans by name, plus the family it means. This is a SMALL, CLOSED list of
 * things that are non-diagnostic no matter what the item is — unlike the three detectors above,
 * which all tried to infer "generic" from the absence of some feature and were wrong every time.
 */
const NON_DIAGNOSTIC = [
  /\btry again\b/i, /\bnot quite\b/i, /\bincorrect\b\.?$/i, /\bthat'?s wrong\b/i,
  /\bhave another go\b/i, /\bcheck your (?:work|answer)\b/i, /\bnope\b/i, /\bsorry\b/i,
  /\bthink again\b/i, /\bkeep trying\b/i, /^\s*no[.!]?\s*$/i
];

interface Row { generator: string; form: string; widgetType: string; code: string; where: string; seed: string; detail: string }
const rows: Row[] = [];
const seen = new Set<string>();

let distractors = 0;
let withFeedback = 0;
let pairsWithDistractors = 0;
let mcqDistractors = 0;
let trapDistractors = 0;
let totalFeedbackChars = 0;
/** Distinct feedback SHAPES — the string with its numbers masked. Repetition across a generator's
 * seeds is expected and fine; repetition across unrelated generators would mean boilerplate. */
const shapesByGenerator = new Map<string, Set<string>>();
const shapeOwners = new Map<string, Set<string>>();

for (const generator of VARIANT_GENERATORS) {
  const forms: readonly string[] = (generator as { forms?: readonly string[] }).forms ?? ["default"];
  for (const form of forms) {
    let touched = false;
    for (let i = 0; i < SEEDS; i++) {
      const band = BANDS[i % BANDS.length];
      const seed = `${generator.tag}|${form}|${band}|${i}`;
      let variant;
      try { variant = variantForGenForm(generator.tag, form, seed, band); } catch { continue; }
      if (!variant) continue;
      const widget = variant.widget as unknown as Record<string, unknown>;

      const found: Array<{ where: string; feedback: string; kind: "mcq" | "trap" }> = [];
      if (widget.type === "mcq" && Array.isArray(widget.options))
        for (const option of widget.options as Array<Record<string, unknown>>)
          if (!option.correct) found.push({ where: `options.${String(option.id)}`, feedback: String(option.feedback ?? ""), kind: "mcq" });
      if (Array.isArray(widget.commonErrors))
        for (const error of widget.commonErrors as Array<Record<string, unknown>>)
          found.push({ where: `commonErrors.${String(error.value)}`, feedback: String(error.feedback ?? ""), kind: "trap" });
      if (!found.length) continue;
      touched = true;

      for (const distractor of found) {
        distractors++;
        if (distractor.kind === "mcq") mcqDistractors++; else trapDistractors++;
        const feedback = distractor.feedback.trim();
        if (!feedback) continue;
        withFeedback++;
        totalFeedbackChars += feedback.length;

        const shape = feedback.replace(/\d+(?:\.\d+)?/g, "#").toLowerCase();
        if (!shapesByGenerator.has(generator.tag)) shapesByGenerator.set(generator.tag, new Set());
        shapesByGenerator.get(generator.tag)!.add(shape);
        if (!shapeOwners.has(shape)) shapeOwners.set(shape, new Set());
        shapeOwners.get(shape)!.add(generator.tag);

        for (const banned of NON_DIAGNOSTIC) {
          if (!banned.test(feedback)) continue;
          const key = `${generator.tag}|${form}|${shape}`;
          if (seen.has(key)) break;
          seen.add(key);
          rows.push({ generator: generator.tag, form, widgetType: String(widget.type), code: "non-diagnostic-phrasing", where: distractor.where, seed, detail: feedback.slice(0, 200) });
          break;
        }
      }
    }
    if (touched) pairsWithDistractors++;
  }
}

/* Boilerplate would show as ONE feedback shape owned by many unrelated generators. A shape shared by
 * two forms of the same generator is not boilerplate, it is the same misconception written once. */
const shared = [...shapeOwners.entries()].filter(([, owners]) => owners.size >= 4).sort((a, b) => b[1].size - a[1].size);
for (const [shape, owners] of shared.slice(0, 50))
  rows.push({
    generator: [...owners].slice(0, 3).join(" / "), form: `+${Math.max(0, owners.size - 3)} more`, widgetType: "",
    code: "feedback-shape-shared-across-generators", where: "", seed: "", detail: `${owners.size} generators share: ${shape.slice(0, 150)}`
  });

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "GENERATOR_DISTRACTOR_CONTRACT_AUDIT.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} seeds=${SEEDS} — S242/GEN-03. A CENSUS, not a findings list: three detectors that`,
  "# tried to infer 'generic feedback' were 0/54 on hand-check and were removed. See the file header for",
  "# each and why it failed. Only rule 3's explicitly-banned phrasings and cross-generator boilerplate",
  "# are reported as findings; everything else here is a count.",
  "generator,form,widgetType,code,where,seed,detail",
  ...rows.map((r) => [r.generator, r.form, r.widgetType, r.code, r.where, r.seed, r.detail]
    .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
].join("\n") + "\n");

const distinctShapes = new Set([...shapeOwners.keys()]).size;
console.log(`distractor-contract @ ${seal}`);
console.log(`  ${pairsWithDistractors} (generator, form) pairs carry distractors`);
console.log(`  ${distractors.toLocaleString()} distractors examined — ${mcqDistractors.toLocaleString()} mcq options, ${trapDistractors.toLocaleString()} numeric traps`);
console.log(`  ${withFeedback.toLocaleString()} carry feedback (${((100 * withFeedback) / Math.max(distractors, 1)).toFixed(1)}%), mean length ${Math.round(totalFeedbackChars / Math.max(withFeedback, 1))} chars`);
console.log(`  ${distinctShapes.toLocaleString()} distinct feedback shapes (numbers masked)`);
console.log(`  ${rows.filter((r) => r.code === "non-diagnostic-phrasing").length}  non-diagnostic-phrasing  (rule 3's named bans: "try again", "not quite", …)`);
console.log(`  ${shared.length}  feedback shapes shared by 4+ unrelated generators`);
console.log(`  wrote ${relative(ROOT, csv)}`);
console.log("\n  NOT MEASURED: whether a distractor maps to a NAMED misconception. No such identifier");
console.log("  exists — cml.misconceptions is lesson-level prose. That gap is GEN-03's real deliverable");
console.log("  and it is authoring work, specified in GEN03_DISTRACTOR_CONTRACT.md rather than faked here.");

if (rows.some((r) => r.code === "non-diagnostic-phrasing")) {
  console.log("\n── non-diagnostic-phrasing ──");
  for (const r of rows.filter((r) => r.code === "non-diagnostic-phrasing"))
    console.log(`  ${r.generator}|${r.form} ${r.where}: ${r.detail}`);
  process.exit(1);
}
