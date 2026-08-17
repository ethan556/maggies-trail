/**
 * S242 / GRB-04 — HOW MANY OF THE EXHAUSTED PAIRS ARE A DEFECT, AND HOW MANY ARE THE SUBJECT?
 *
 * `GENERATOR_ANTI_REPEAT_AUDIT.csv` reports 293 (generator, form) pairs whose pool sits at or below
 * the anti-repeat window, and that number has been carried as a backlog: 293 generators to widen.
 *
 * It is not a backlog. Some of those pools are narrow because the SUBJECT is narrow, and widening
 * them would be wrong:
 *
 *     g3-mult-fluency|MultTable4Numeric  →  4 × 0, 4 × 1, 4 × 2 … 4 × 10
 *
 * The four times table is eleven facts. A learner meeting all eleven is the drill working, not a
 * freshness failure, and CLAUDE.md rule 7 already says so for single-fact items — "Rejecting is a
 * SUCCESS, not a failure." Nobody has separated the two populations, so every report of "293
 * exhausted pairs" has overstated the work.
 *
 * ── The discriminator ───────────────────────────────────────────────────────────────────────────
 * A closed fact set has a signature no under-parameterised generator has: every prompt is the SAME
 * SENTENCE with ONE number changing, and those numbers form a CONTIGUOUS RUN with no gaps. `4 × n`
 * for n = 0…10 is the whole table; a generator that merely forgot a dimension produces scattered
 * values, several changing numbers, or several sentences.
 *
 * That is mechanical and it is also only a proposal. Every row it prints is hand-read before any
 * number here is believed — the same rule this session has applied to eight other detectors, six of
 * which turned out mostly false on first run.
 *
 * Run: npx tsx scripts/audit/exhausted-by-subject.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { variantForGenForm } from "../../src/lib/variants";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const BANDS: Band[] = ["support", "core", "stretch"];

/** The exhausted rows, read from the audit that produced them rather than re-derived. */
const csv = readFileSync(join(OUT, "GENERATOR_ANTI_REPEAT_AUDIT.csv"), "utf8").split("\n");
const exhausted = csv
  .filter((line) => !line.startsWith("#") && line.includes(",exhausted,"))
  .map((line) => line.split(","))
  .map((f) => ({ generator: f[0], form: f[1], widgetType: f[2] }));

/** Replace every integer with a placeholder: two prompts share a SHAPE if these match. */
const shapeOf = (prompt: string) => prompt.replace(/-?\d+(?:\.\d+)?/g, "§");
const numbersIn = (prompt: string) => [...prompt.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

interface Row {
  generator: string; form: string; verdict: string; prompts: number; answers: number;
  shapes: number; varyingSlots: number; run: string; example: string;
}

/**
 * The answer a widget keys, when it keys one readably. Value widgets carry `answer`; choice widgets
 * mark a correct option. A widget that does neither returns null, and a pair with any unreadable
 * answer is never classified by answer cardinality — an unreadable answer must not be allowed to
 * look like a repeated one.
 */
function answerOf(widget: unknown): string | null {
  const w = widget as { answer?: unknown; options?: Array<{ label?: unknown; correct?: boolean }> } | undefined;
  if (w?.answer !== undefined && w.answer !== null) return String(w.answer);
  const correct = (w?.options ?? []).filter((o) => o.correct).map((o) => String(o.label ?? ""));
  return correct.length ? correct.sort().join(" / ") : null;
}

const rows: Row[] = [];
for (const pair of exhausted) {
  const prompts = new Set<string>();
  const answers = new Set<string>();
  let answersReadable = true;
  for (let i = 0; i < 40; i++) {
    for (const band of BANDS) {
      let v;
      try { v = variantForGenForm(pair.generator, pair.form, `${pair.generator}|${pair.form}|${band}|${i}`, band); } catch { continue; }
      const p = (v?.widget as { prompt?: string } | undefined)?.prompt;
      if (typeof p !== "string") continue;
      if (!prompts.has(p)) {
        const a = answerOf(v?.widget);
        if (a === null) answersReadable = false;
        else answers.add(a);
      }
      prompts.add(p);
    }
  }
  if (prompts.size < 2) continue;
  const list = [...prompts];
  const shapes = new Set(list.map(shapeOf));
  /* One sentence, and exactly one of its numbers moving. `numbersIn` is positional, so the slot
   * that varies is the index whose values are not all identical. */
  const grids = list.map(numbersIn);
  const width = grids[0].length;
  const sameWidth = grids.every((g) => g.length === width);
  const varying = sameWidth
    ? Array.from({ length: width }, (_, i) => new Set(grids.map((g) => g[i])).size).filter((n) => n > 1).length
    : -1;
  let run = "-";
  let contiguous = false;
  if (shapes.size === 1 && varying === 1 && sameWidth) {
    const slot = Array.from({ length: width }, (_, i) => i).find((i) => new Set(grids.map((g) => g[i])).size > 1)!;
    const values = [...new Set(grids.map((g) => g[slot]))].sort((a, b) => a - b);
    /* CONTIGUITY ALONE IS NOT ENOUGH, and the first cut proved it by proposing 58. `pick(rand, lo, hi)`
     * produces a contiguous run too, so an under-parameterised generator looks identical to a closed
     * fact set from the outside. Reading the top of that list: `radian-convert|radToDeg` runs 2..12,
     * `mass|kgToG` runs 2..12, `a2-radicals|re-products` runs 2..12 — nothing bounds "how many
     * kilograms to convert" at twelve; that is just the range someone typed.
     *
     * A set that is closed BY CONVENTION starts where the convention starts: the times tables at 0,
     * the clock at 1. A run beginning at 2 or 3 has a missing lower end, which is the signature of a
     * chosen range rather than a complete one. */
    const wholeSet = values[0] === 0 || values[0] === 1;
    contiguous = wholeSet && values.every((v, i) => Number.isInteger(v) && (i === 0 || v === values[i - 1] + 1));
    run = `${values[0]}..${values[values.length - 1]}`;
  }
  /* ── THE THIRD POPULATION, AND READING THE TOP OF THE RANKED LIST IS WHAT FOUND IT ────────────
   *
   * `g1-shapes-measure|Smg1HalvesNumeric` sat in the backlog as six prompts short of the window.
   * Printed with its answers, it is this:
   *
   *     [2]  If a cracker is split into halves, how many equal parts are there?
   *     [2]  If a ribbon is split into halves, how many equal parts are there?
   *     [2]  If a pizza  is split into halves, how many equal parts are there?      … six in all
   *
   * SIX PROMPTS, ONE ANSWER. The object noun is a costume; the mathematics never moves. Widening it
   * to twenty nouns would take the pool count from 6 to 20 and change what the learner does by
   * nothing, which is exactly what the plan means by "numerical variation alone can masquerade as
   * curriculum variety" and what ARCH-04 exists to forbid. It is also CLAUDE.md rule 7 — one problem
   * exists, so the honest move is to reject, not to dress it up to raise a count.
   *
   * A pool is COSMETIC-ONLY when every prompt keys the same answer. That is not the same as narrow:
   * `Smg1ShapeSidesNumeric` has eight prompts and three answers (0, 3, 4 — circle, triangle,
   * square/rectangle × sides/corners) and is a real if small vocabulary drill.
   *
   * Answer cardinality is only consulted when EVERY prompt's answer could actually be read. A drag
   * or sort widget keys neither `answer` nor a correct option, and an unreadable answer must never
   * be allowed to look like a repeated one. */
  const cosmetic = answersReadable && answers.size === 1 && prompts.size > 1;
  rows.push({
    generator: pair.generator, form: pair.form,
    verdict: contiguous ? "closed-fact-set" : cosmetic ? "cosmetic-only" : "under-parameterised",
    prompts: prompts.size, answers: answersReadable ? answers.size : -1,
    shapes: shapes.size, varyingSlots: varying, run,
    example: list[0].replace(/[",\n]/g, " ").slice(0, 88),
  });
}

const closed = rows.filter((r) => r.verdict === "closed-fact-set");
const cosmetic = rows.filter((r) => r.verdict === "cosmetic-only");
mkdirSync(OUT, { recursive: true });
const out = join(OUT, "GENERATOR_EXHAUSTED_BY_SUBJECT.csv");
writeFileSync(out, [
  `# sourceSeal=${seal} — S242/GRB-04. Splitting the exhausted pairs by WHY they are narrow.`,
  "# closed-fact-set = one sentence, one number moving, and the values form a contiguous run with",
  "# no gaps — the pool IS the subject (a times table, a counting range). Widening these is wrong.",
  "# cosmetic-only = every prompt keys the SAME ANSWER — the variation is a noun, not mathematics.",
  "# Widening these raises a count and changes nothing a learner does; see CLAUDE.md rule 7.",
  "# under-parameterised = everything else: the pool is narrow because a dimension is missing.",
  "generator,form,verdict,distinctPrompts,distinctAnswers,shapes,varyingSlots,run,example",
  ...rows
    .sort((a, b) => (a.verdict < b.verdict ? -1 : a.verdict > b.verdict ? 1 : b.prompts - a.prompts))
    .map((r) => [r.generator, r.form, r.verdict, r.prompts, r.answers, r.shapes, r.varyingSlots, r.run, r.example].join(","))
].join("\n") + "\n");

console.log(`exhausted-by-subject @ ${seal}`);
console.log(`  ${exhausted.length} exhausted pairs in the audit; ${rows.length} produced two or more prompts`);
console.log(`    closed-fact-set      ${closed.length}   ← the pool IS the subject; widening would be wrong`);
console.log(`    cosmetic-only        ${cosmetic.length}   ← N prompts, ONE answer; widening is the anti-pattern`);
console.log(`    under-parameterised  ${rows.length - closed.length - cosmetic.length}   ← the real backlog`);
console.log("\n── closed-fact-set, widest first ──");
for (const r of closed.sort((a, b) => b.prompts - a.prompts).slice(0, 25))
  console.log(`  ${r.generator}|${r.form}  ${r.prompts} prompts, one slot over ${r.run}\n      ${r.example}`);
console.log("\n── cosmetic-only, widest first (every one of these keys a single answer) ──");
for (const r of cosmetic.sort((a, b) => b.prompts - a.prompts))
  console.log(`  ${r.generator}|${r.form}  ${r.prompts} prompts, 1 answer\n      ${r.example}`);
console.log(`\n  wrote ${relative(ROOT, out)}`);
