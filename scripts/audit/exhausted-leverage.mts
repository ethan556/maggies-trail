/**
 * S242 / GRB-04 — RANK THE UNDER-PARAMETERISED PAIRS BY LEVERAGE, NOT BY TRACTABILITY.
 *
 * `GENERATOR_EXHAUSTED_BY_SUBJECT.csv` splits the exhausted pairs into 12 closed-fact-sets (the pool
 * IS the subject — widening them is wrong) and 273 under-parameterised ones (a dimension is
 * missing). 273 is a backlog, not a batch, and CLAUDE.md's working rhythm is explicit about how to
 * pick from it: **by leverage, not tractability.**
 *
 * The plan's priority formula is learner exposure × reuse count × defect severity × conceptual
 * importance × generator reach. Three of those five are measurable here and the other two are
 * judgement, so this script computes the measurable part and prints it for a human to read:
 *
 *   · EXPOSURE   — how many authored steps declare this exact (gen, form). A pair nobody declares
 *                  costs a learner nothing however small its pool is.
 *   · SCARCITY   — how far below the ten-draw anti-repeat window the pool sits. A pool of 2 repeats
 *                  on the second encounter; a pool of 9 repeats on the tenth.
 *   · REACH      — how many forms the generator has, i.e. how much else a shared fix touches.
 *
 * `harm = exposure × (WINDOW − distinctPrompts)` is the ordering. It is deliberately NOT a product
 * of all three: reach is printed beside it as a grouping hint, because families are repaired
 * together and a generator with six thin forms is one packet, not six.
 *
 * Run: npx tsx scripts/audit/exhausted-leverage.mts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
const WINDOW = 10;

interface Pair { generator: string; form: string; prompts: number; example: string }

const rows = readFileSync(join(OUT, "GENERATOR_EXHAUSTED_BY_SUBJECT.csv"), "utf8")
  .split("\n")
  .filter((l) => l && !l.startsWith("#") && !l.startsWith("generator,"))
  .map((l) => l.split(","))
  .filter((f) => f[2] === "under-parameterised")
  .map<Pair>((f) => ({ generator: f[0], form: f[1], prompts: Number(f[3]), example: f.slice(7).join(",") }));

/** Every `"variant": { "gen": …, "form": … }` in the authored corpus, counted per pair. */
const declared = new Map<string, number>();
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith(".json") ? [path] : [];
  });

for (const file of walk(join(ROOT, "content"))) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/"variant"\s*:\s*\{\s*"gen"\s*:\s*"([^"]+)"\s*(?:,\s*"form"\s*:\s*"([^"]+)")?/g)) {
    const key = `${m[1]}|${m[2] ?? "default"}`;
    declared.set(key, (declared.get(key) ?? 0) + 1);
  }
}

const reach = new Map<string, number>();
for (const r of rows) reach.set(r.generator, (reach.get(r.generator) ?? 0) + 1);

const scored = rows
  .map((r) => {
    const exposure = declared.get(`${r.generator}|${r.form}`) ?? 0;
    return { ...r, exposure, scarcity: WINDOW - r.prompts, harm: exposure * (WINDOW - r.prompts), thinForms: reach.get(r.generator)! };
  })
  .sort((a, b) => b.harm - a.harm || b.exposure - a.exposure || a.prompts - b.prompts);

const live = scored.filter((r) => r.exposure > 0);
const dormant = scored.length - live.length;

console.log(`exhausted-leverage — ${rows.length} under-parameterised pairs`);
console.log(`  declared on at least one authored step   ${live.length}`);
console.log(`  declared NOWHERE (cost a learner nothing) ${dormant}   ← not a backlog item until something uses them\n`);

console.log("── by harm = declarations × (10 − pool) ──");
console.log("  harm  decl  pool  forms  generator|form");
for (const r of live.slice(0, 30))
  console.log(`  ${String(r.harm).padStart(4)}  ${String(r.exposure).padStart(4)}  ${String(r.prompts).padStart(4)}  ${String(r.thinForms).padStart(5)}  ${r.generator}|${r.form}`);

console.log("\n── generators with the most thin forms (repair as ONE family) ──");
const byGen = new Map<string, { forms: number; harm: number; decl: number }>();
for (const r of live) {
  const cur = byGen.get(r.generator) ?? { forms: 0, harm: 0, decl: 0 };
  byGen.set(r.generator, { forms: cur.forms + 1, harm: cur.harm + r.harm, decl: cur.decl + r.exposure });
}
for (const [gen, v] of [...byGen.entries()].sort((a, b) => b[1].harm - a[1].harm).slice(0, 15))
  console.log(`  harm ${String(v.harm).padStart(5)}  ${String(v.forms).padStart(2)} thin forms  ${String(v.decl).padStart(4)} declarations  ${gen}`);
