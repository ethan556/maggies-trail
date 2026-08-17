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
  generator: string; form: string; verdict: string; prompts: number;
  shapes: number; varyingSlots: number; run: string; example: string;
}

const rows: Row[] = [];
for (const pair of exhausted) {
  const prompts = new Set<string>();
  for (let i = 0; i < 40; i++) {
    for (const band of BANDS) {
      let v;
      try { v = variantForGenForm(pair.generator, pair.form, `${pair.generator}|${pair.form}|${band}|${i}`, band); } catch { continue; }
      const p = (v?.widget as { prompt?: string } | undefined)?.prompt;
      if (typeof p === "string") prompts.add(p);
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
  rows.push({
    generator: pair.generator, form: pair.form,
    verdict: contiguous ? "closed-fact-set" : "under-parameterised",
    prompts: prompts.size, shapes: shapes.size, varyingSlots: varying, run,
    example: list[0].replace(/[",\n]/g, " ").slice(0, 88),
  });
}

const closed = rows.filter((r) => r.verdict === "closed-fact-set");
mkdirSync(OUT, { recursive: true });
const out = join(OUT, "GENERATOR_EXHAUSTED_BY_SUBJECT.csv");
writeFileSync(out, [
  `# sourceSeal=${seal} — S242/GRB-04. Splitting the exhausted pairs by WHY they are narrow.`,
  "# closed-fact-set = one sentence, one number moving, and the values form a contiguous run with",
  "# no gaps — the pool IS the subject (a times table, a counting range). Widening these is wrong.",
  "# under-parameterised = everything else: the pool is narrow because a dimension is missing.",
  "generator,form,verdict,distinctPrompts,shapes,varyingSlots,run,example",
  ...rows
    .sort((a, b) => (a.verdict < b.verdict ? -1 : a.verdict > b.verdict ? 1 : b.prompts - a.prompts))
    .map((r) => [r.generator, r.form, r.verdict, r.prompts, r.shapes, r.varyingSlots, r.run, r.example].join(","))
].join("\n") + "\n");

console.log(`exhausted-by-subject @ ${seal}`);
console.log(`  ${exhausted.length} exhausted pairs in the audit; ${rows.length} produced two or more prompts`);
console.log(`    closed-fact-set      ${closed.length}   ← the pool IS the subject; widening would be wrong`);
console.log(`    under-parameterised  ${rows.length - closed.length}   ← the real backlog`);
console.log("\n── closed-fact-set, widest first ──");
for (const r of closed.sort((a, b) => b.prompts - a.prompts).slice(0, 25))
  console.log(`  ${r.generator}|${r.form}  ${r.prompts} prompts, one slot over ${r.run}\n      ${r.example}`);
console.log(`\n  wrote ${relative(ROOT, out)}`);
