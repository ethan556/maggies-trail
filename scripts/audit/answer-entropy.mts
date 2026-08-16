/**
 * S242 / GRB-04 — A POOL OF TWENTY PROBLEMS WITH ONE ANSWER IS NOT TWENTY PROBLEMS.
 *
 * `GENERATOR_ANTI_REPEAT_AUDIT` measures freshness by counting distinct WIDGETS: a pair that emits
 * twenty different prompts is `clean` and never looked at again. That is the wrong denominator for
 * a mastery claim. `polygon-angles|exteriorSum` prints ten different polygons —
 *
 *     "Exterior angles of a 9-gon (one at each vertex): what do they sum to?"   → 360
 *     "Exterior angles of a 20-gon (one at each vertex): what do they sum to?"  → 360
 *
 * — and a learner who types 360 once types it forever. Ten prompts, one fact, and the widget audit
 * calls the pool ten wide.
 *
 * This audit asks the question that one does not: **how many distinct ANSWERS does a pair reach?**
 * Three populations, and the distinction between the first two is the point of the whole script:
 *
 *   · `constant`   — many prompts, ONE answer. Re-asking is worthless whatever the widget count
 *                    says. Some of these are legitimate invariance lessons (the exterior angles of
 *                    ANY polygon sum to 360° — that IS the theorem); the rest are generators that
 *                    vary decoration. Either way the pair cannot carry repeated assessment, and
 *                    which one it is has to be read.
 *   · `low-entropy`— the answer set is far smaller than the prompt set, so guessing from a short
 *                    list beats knowing. Reported with the most-common answer's share.
 *   · `rich`       — answers track prompts. Nothing to say.
 *
 * A pair can be `clean` in the anti-repeat audit and `constant` here. That combination is the
 * finding: it is invisible to every gate the platform has.
 *
 * Run: npx tsx scripts/audit/answer-entropy.mts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS, variantForGenForm } from "../../src/lib/variants";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const DRAWS = 24;
const BANDS: Band[] = ["support", "core", "stretch"];

/** What a learner would have to KNOW to be graded correct — not the widget's internal shape.
 *
 * THE FIRST CUT OF THIS SCRIPT REPORTED 625 CONSTANT PAIRS AND MOST OF THEM WERE THIS BUG.
 * Ordering and building engines express their answer as ids, and the generators assign those ids
 * BY RANK — so `sequence-order|byFives` answers `["o0","o1","o2","o3","o4"]` on every draw while
 * the labels behind them go `5 10 15 20 25` then `40 45 50 55 60`. The answer looked frozen; the
 * problem was completely fresh. `dragOrder` presents `spec.items` in AUTHORED order (`widgets.tsx:15155`,
 * no shuffle) and the generator scrambles that order, so the learner genuinely has to sort.
 *
 * Resolving every id to the label the learner actually sees is what makes the count mean anything.
 * `mcq` needs it for a second reason: display order is seeded-shuffled, so ids would report variety
 * that is never on screen. */
function graded(widget: Record<string, unknown>, answer: unknown): string {
  const label = new Map<string, string>();
  for (const field of ["items", "tokens", "options", "left", "right", "buckets", "cards", "parts"]) {
    const list = widget[field];
    if (!Array.isArray(list)) continue;
    for (const entry of list as Array<Record<string, unknown>>)
      if (entry && typeof entry.id === "string")
        label.set(entry.id, String(entry.label ?? entry.text ?? entry.value ?? entry.id));
  }
  const resolve = (v: unknown): unknown => {
    if (typeof v === "string") return label.get(v) ?? v;
    if (Array.isArray(v)) return v.map(resolve);
    if (v && typeof v === "object")
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [label.get(k) ?? k, resolve(x)]));
    return v;
  };
  if (widget.type === "mcq" && Array.isArray(widget.options)) {
    const correct = (widget.options as Array<{ id: string; label: string; correct?: boolean }>)
      .filter((o) => o.correct || o.id === answer)
      .map((o) => o.label);
    if (correct.length) return correct.sort().join(" ⧫ ");
  }
  return JSON.stringify(resolve(answer));
}

interface Row {
  generator: string; form: string; widgetType: string; verdict: string;
  prompts: number; answers: number; topShare: number; example: string; topAnswer: string;
}

const rows: Row[] = [];
let pairIndex = 0;
const startedAt = Date.now();

for (const generator of VARIANT_GENERATORS) {
  /* S242 / GRB-04. `"default"` IS ALWAYS PROBED, EVEN WHEN THE GENERATOR DECLARES A FORMS LIST.
   *
   * Both audits used to walk `generator.forms ?? ["default"]`, so a generator that declares any
   * form never had its DEFAULT branch measured — and **370 authored steps across 260 generators
   * declare a `gen` with no `form`**, which is exactly the branch that was going unwatched.
   * `compare-groups` and `compare-numerals` proved it matters: their default branches carried the
   * same fixed-correct-side bug as their named siblings, and only a source read found it.
   *
   * A generator that ignores an unrecognised form simply repeats one of its named branches here,
   * which costs a duplicate row and hides nothing. */
  const declared: readonly string[] = (generator as { forms?: readonly string[] }).forms ?? [];
  const forms: readonly string[] = declared.includes("default") ? declared : [...declared, "default"];
  for (const form of forms) {
    const widgets = new Set<string>();
    const answers = new Map<string, number>();
    let example = "";
    let widgetType = "";
    if (++pairIndex % 300 === 0)
      console.log(`  … ${pairIndex} pairs, ${Math.round((Date.now() - startedAt) / 1000)}s (at ${generator.tag}|${form})`);
    for (let i = 0; i < DRAWS; i++) {
      const band = BANDS[i % BANDS.length];
      let v;
      try { v = variantForGenForm(generator.tag, form, `${generator.tag}|${form}|${band}|${i}`, band); } catch { break; }
      if (!v) break;
      const w = v.widget as unknown as Record<string, unknown>;
      widgetType ||= String(w.type ?? "");
      widgets.add(JSON.stringify(w));
      const key = graded(w, v.answer);
      answers.set(key, (answers.get(key) ?? 0) + 1);
      example ||= String(w.prompt ?? "").slice(0, 90);
    }
    if (widgets.size < 2) continue; // single-problem pairs are GRB-04's business, not this audit's
    const total = [...answers.values()].reduce((a, b) => a + b, 0);
    const [topAnswer, topCount] = [...answers].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
    const topShare = topCount / total;
    /* The threshold is a RATIO, not a count: a pair with 4 prompts and 3 answers is fine, and one
     * with 20 prompts and 3 answers is not. `constant` is exact — one answer, no tolerance. */
    const verdict =
      answers.size === 1 ? "constant"
      : answers.size * 3 <= widgets.size || topShare >= 0.6 ? "low-entropy"
      : "rich";
    rows.push({
      generator: generator.tag, form, widgetType, verdict,
      prompts: widgets.size, answers: answers.size,
      topShare: Math.round(topShare * 100) / 100,
      example: example.replace(/[",\n]/g, " "), topAnswer: topAnswer.replace(/[",\n]/g, " ").slice(0, 40),
    });
  }
}

const by = (v: string) => rows.filter((r) => r.verdict === v);
mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "GENERATOR_ANSWER_ENTROPY.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} draws=${DRAWS} — S242/GRB-04. Distinct ANSWERS, not distinct widgets.`,
  "# constant = many prompts, one answer: re-asking cannot measure anything. Some are legitimate",
  "# invariance lessons and some are decoration; the distinction has to be read, not computed.",
  "generator,form,widgetType,verdict,distinctPrompts,distinctAnswers,topAnswerShare,topAnswer,examplePrompt",
  ...rows
    .sort((a, b) =>
      (a.verdict === b.verdict ? 0 : a.verdict === "constant" ? -1 : b.verdict === "constant" ? 1 : a.verdict < b.verdict ? -1 : 1) ||
      b.prompts - a.prompts)
    .map((r) => [r.generator, r.form, r.widgetType, r.verdict, r.prompts, r.answers, r.topShare, r.topAnswer, r.example].join(","))
].join("\n") + "\n");

console.log(`answer-entropy @ ${seal}`);
console.log(`  ${rows.length} (generator, form) pairs with more than one distinct widget, ${DRAWS} draws each`);
console.log(`    constant     ${by("constant").length}  (every draw grades on the SAME answer)`);
console.log(`    low-entropy  ${by("low-entropy").length}  (answers ≤ ⅓ of prompts, or one answer ≥ 60% of draws)`);
console.log(`    rich         ${by("rich").length}`);
console.log("\n── constant, widest first: the prompt count is what the freshness audit currently believes ──");
for (const r of by("constant").sort((a, b) => b.prompts - a.prompts))
  console.log(`  ${r.generator}|${r.form} — ${r.prompts} prompts, answer always ${r.topAnswer}\n      ${r.example}`);
console.log(`\n  wrote ${relative(ROOT, csv)}`);
