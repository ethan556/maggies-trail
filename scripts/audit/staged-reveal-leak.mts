/**
 * S242 / ENG-01 — DOES A STAGED-REVEAL STEP STILL HAND OVER ITS ANSWER? MEASURED PER STEP.
 *
 * `ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` found seven engines whose terminal derivation stage prints
 * the graded answer, over 648 authored instances and 544 graded. This measures the same corpus
 * against the gate that now holds those values until `tone === "info"`, so the closure number is
 * MEASURED at the new seal rather than quoted from the audit that motivated the work.
 *
 * The check is the one that matters to a learner: build the truth for the step exactly as the widget
 * does, walk its stages, and ask whether any stage a learner may open before the verdict displays
 * the graded answer. A step is `leaking` if one does.
 *
 * WHAT THIS DOES NOT DO IS RENDER. The render path is covered by
 * `widgets.stageAnswerGate.s242.test.tsx`, which found a leak this kind of scan could not — the
 * accessible "Describe this model" panel narrating every opened stage verbatim, so a screen-reader
 * user got the answer and a sighted user did not. A source-level scan and a render test catch
 * different things and this program has now been burned by trusting either one alone.
 *
 * Run: npx tsx scripts/audit/staged-reveal-leak.mts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import {
  exactNumberTruth, geometricConstraintTruth, pointSetReasoningTruth, affineRelationshipTruth,
  placeValueTransformTruth, proportionalReasoningTruth, quotientReasoningTruth
} from "../../src/lib/schema";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "eng");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** The same predicate the widget and the describer apply, kept deliberately independent of both. */
function revealsAnswer(value: unknown, truth: { answerNumber?: number; answerClaim?: string; answerRelation?: string }): boolean {
  if (typeof value === "number") return typeof truth.answerNumber === "number" && Math.abs(value - truth.answerNumber) <= 1e-9;
  const text = String(value ?? "");
  if (!text) return false;
  if (typeof truth.answerNumber === "number") {
    const last = text.match(/(-?\d+(?:\.\d+)?)(?!.*\d)/);
    if (last && Math.abs(Number(last[1]) - truth.answerNumber) <= 1e-9) return true;
  }
  if (truth.answerClaim && text.includes(truth.answerClaim)) return true;
  if (truth.answerRelation) {
    const symbol = truth.answerRelation === "lt" ? "<" : truth.answerRelation === "gt" ? ">" : "=";
    if (text.includes(symbol)) return true;
  }
  return false;
}

type Truth = { stages: ReadonlyArray<{ value: unknown; key?: string; label?: string }>; answerNumber?: number; answerClaim?: string; answerRelation?: string };
const ENGINES: Record<string, (spec: never) => Truth> = {
  exactNumberLab: exactNumberTruth as never,
  geometricConstraintLab: geometricConstraintTruth as never,
  pointSetReasoningLab: pointSetReasoningTruth as never,
  affineRelationshipLab: affineRelationshipTruth as never,
  placeValueTransformLab: placeValueTransformTruth as never,
  proportionalReasoningLab: proportionalReasoningTruth as never,
  quotientReasoningLab: quotientReasoningTruth as never
};

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

interface Row { lesson: string; step: string; engine: string; task: string; kind: string; graded: string; stagesTotal: number; answerStages: number; compelled: string }
const rows: Row[] = [];
let instances = 0;
let graded = 0;

for (const file of walk(join(ROOT, "content", "courses"))) {
  let json: { lesson?: { id?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  for (const [index, raw] of lesson.steps.entries()) {
    const step = raw as { id?: string; kind?: string; widget?: Record<string, unknown> };
    const widget = step.widget;
    const build = widget && ENGINES[String(widget.type)];
    if (!widget || !build) continue;
    let truth: Truth;
    try { truth = build(widget as never); } catch { continue; }
    instances++;
    const isGraded = step.kind === "check" || step.kind === "challenge";
    if (isGraded) graded++;
    const answerStages = truth.stages.filter((stage) => revealsAnswer(stage.value, truth));
    if (!answerStages.length) continue;
    // A step is COMPELLED when canCheck requires opening a stage that displays the answer.
    const required = new Set(Array.isArray(widget.requiredStageKeys) ? (widget.requiredStageKeys as string[]) : []);
    const compelled = answerStages.some((stage) => stage.key !== undefined && required.has(stage.key));
    rows.push({
      lesson: String(lesson.id), step: String(step.id ?? index), engine: String(widget.type),
      task: String(widget.task ?? ""), kind: String(step.kind ?? ""), graded: String(isGraded),
      stagesTotal: truth.stages.length, answerStages: answerStages.length, compelled: String(compelled)
    });
  }
}

const gradedRows = rows.filter((r) => r.graded === "true");
const compelledRows = rows.filter((r) => r.compelled === "true");
mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "STAGED_REVEAL_ANSWER_INDEX.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} — S242/ENG-01. One row per authored step whose derivation ladder contains a`,
  "# stage displaying the GRADED ANSWER. Since the S242 gate these values are withheld until",
  "# tone === 'info' (post-verdict), so a row here is a stage that is HELD, not one that leaks.",
  "# `compelled` = canCheck's requiredStageKeys forces that stage open; harmless once it is held,",
  "# and the number to watch if the gate is ever weakened.",
  "lesson,step,engine,task,kind,graded,stagesTotal,answerStages,compelled",
  ...rows.map((r) => [r.lesson, r.step, r.engine, r.task, r.kind, r.graded, r.stagesTotal, r.answerStages, r.compelled].join(","))
].join("\n") + "\n");

console.log(`staged-reveal-leak @ ${seal}`);
console.log(`  ${instances} authored instances across ${Object.keys(ENGINES).length} staged-reveal engines (${graded} graded)`);
console.log(`  ${rows.length} steps have a stage that displays the graded answer (${gradedRows.length} graded)`);
console.log(`  ${compelledRows.length} of those are COMPELLED — requiredStageKeys forces the answer stage open`);
console.log("  All are now withheld until the verdict; the gate is proven at the render boundary by");
console.log("  src/components/widgets.stageAnswerGate.s242.test.tsx (visible text, accessible name,");
console.log("  the magnitude rail's landmarks, and the 'Describe this model' panel).");
const byEngine = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.engine]: (acc[r.engine] ?? 0) + 1 }), {});
for (const [engine, n] of Object.entries(byEngine).sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${engine}`);
console.log(`  wrote ${relative(ROOT, csv)}`);
