/**
 * S242 / GEN-04 — DOES THE QUEUE ACTUALLY REMOVE THE DUPLICATES? MEASURED, NOT ASSERTED.
 *
 * §10 asks for "duplicate rate 0 inside the anti-repeat window". `GENERATOR_DUPLICATION_AUDIT.csv`
 * measured that rate with NO queue in place, because none existed: 2,045 (generator, form) pairs,
 * 1,803 of them with a pool wider than the window and every one of them still capable of repeating.
 *
 * This draws each pair twice — once bare, exactly as the runtime did before this packet, and once
 * through `drawFreshVariant` — so the claim "the queue works" is a measured before-and-after over
 * the whole corpus rather than a unit test over a sample. Four populations, because they mean
 * different things and collapsing them is what made the first run report seven bugs it did not have:
 *
 *   · `clean`     — pool above the window, zero duplicates inside it. The queue did its job.
 *   · `exhausted` — pool at or below the window. GRB-04's work; no queue can help. The queue says so.
 *   · `marginal`  — pool just above the window. Re-seeding RESAMPLES rather than enumerates, so one
 *                   unseen problem in eleven is missed about a tenth of the time. Announced, so not
 *                   a bug — but it means "pool wider than the window" and "a queue can keep it
 *                   fresh" are different claims, and GRB-04's population is larger than 242.
 *   · `leaking`   — a repeat served WITHOUT the queue announcing it. A MECHANISM BUG, and the number
 *                   §10 requires to be zero. Any row here fails the run.
 *
 * Run: npx tsx scripts/audit/anti-repeat-window.mts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS, variantForGenForm, variantForStep } from "../../src/lib/variants";
import { drawFreshVariant, fingerprintWidget, rememberDraw, REPEAT_WINDOW, type RecentDraws } from "../../src/lib/antiRepeat";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
/* 20 draws, not 50. The window is 10, so 20 exercises it twice over with every draw after the
 * tenth having a full history to collide against — which is the condition being measured. 50 was
 * the duplication audit's sample size for estimating POOL SIZE, a different question, and at
 * 2,045 pairs × (one bare draw + up to MAX_DRAW_ATTEMPTS queued draws) it did not finish. */
const DRAWS = 20;
const BANDS: Band[] = ["support", "core", "stretch"];
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** Duplicates inside a sliding window of the last REPEAT_WINDOW draws — the audit's own definition. */
function windowDuplicates(keys: string[]): number {
  let n = 0;
  for (let i = 0; i < keys.length; i++)
    for (let j = Math.max(0, i - REPEAT_WINDOW); j < i; j++)
      if (keys[i] === keys[j]) { n++; break; }
  return n;
}

interface Row {
  generator: string; form: string; widgetType: string; verdict: string;
  draws: number; distinct: number; before: number; after: number; exhaustedDraws: number; redraws: number;
}

const rows: Row[] = [];
const startedAt = Date.now();
let pairIndex = 0;

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
    /* The widget type must be discovered, not assumed: `variantForStep` refuses a variant whose
     * type does not match the step's declared surface, so a step built with the wrong type
     * resolves to null and the pair would silently vanish from this audit. */
    /* `variantForGenForm` HAS NO SURFACE GUARD, which is exactly the question being asked here.
     *
     * The first cut probed with `variantForStep({widget:{type:""}}, …)` — which the resolver
     * correctly refuses, since no variant has widget type "" — and then fell back to calling the
     * generator directly with a constant `rand` of `() => 0.5`. THAT HUNG THE AUDIT. Generators
     * routinely reject-and-resample ("draw again until the two values differ"), and a rand that
     * returns the same number forever makes that loop non-terminating. It ran for eighteen minutes
     * on one pair before the cause was found by timing all 2,667 pairs separately.
     *
     * Never hand a generator a constant rand. There is a resolver that answers this question. */
    let widgetType = "";
    try { widgetType = variantForGenForm(generator.tag, form, "probe", "core")?.widget.type ?? ""; } catch { /* unresolvable */ }
    if (!widgetType) continue;
    const step = { widget: { type: widgetType }, variant: { gen: generator.tag, form } };
    /* Progress, because this walks every generator in the registry and a silent ten-minute wall is
     * indistinguishable from a hang — which is how the generator sweep in this session stayed
     * broken for hours behind a redirect to /dev/null. */
    if (++pairIndex % 200 === 0)
      console.log(`  … ${pairIndex} pairs, ${Math.round((Date.now() - startedAt) / 1000)}s elapsed (at ${generator.tag}|${form})`);

    const withoutQueue: string[] = [];
    const withQueue: string[] = [];
    let recent: RecentDraws = {};
    let exhaustedDraws = 0;
    let redraws = 0;

    for (let i = 0; i < DRAWS; i++) {
      const band = BANDS[i % BANDS.length];
      const seed = `${generator.tag}|${form}|${band}|${i}`;
      // BEFORE: exactly what the runtime did before this packet — one draw, no history consulted.
      let bare;
      try { bare = variantForStep(step, seed, band); } catch { break; }
      if (!bare) break;
      withoutQueue.push(fingerprintWidget(bare.widget));
      // AFTER: the same seed through the queue, with the history the previous draws produced.
      let drawn;
      try { drawn = drawFreshVariant(step, seed, band, recent, "k"); } catch { break; }
      if (!drawn) break;
      withQueue.push(drawn.fingerprint);
      recent = rememberDraw(recent, "k", drawn.fingerprint);
      if (drawn.exhausted) exhaustedDraws++;
      redraws += drawn.attempts - 1;
    }
    if (withQueue.length < REPEAT_WINDOW) continue;

    const distinct = new Set(withoutQueue).size;
    const after = windowDuplicates(withQueue);
    /* THE VERDICT ASKS WHETHER THE QUEUE ANNOUNCED THE DUPLICATE, NOT HOW BIG THE POOL IS.
     *
     * The first cut classified by pool size — `distinct <= REPEAT_WINDOW` meant exhausted, anything
     * above it that still duplicated meant a mechanism bug — and it reported 7 bugs. Every one was
     * a false positive, and reading them is what produced the rule now in force: all 7 had
     * `exhaustedDraws` exactly equal to their duplicate count. The queue had said, on precisely
     * those draws, that it could not find anything fresh.
     *
     * The cause is that re-seeding RESAMPLES the pool, it does not enumerate it. With a pool of 11
     * and a window of 10 there is exactly one unseen problem, and 24 independent draws at 1-in-11
     * miss it about a tenth of the time. That is arithmetic, not a defect — but it means "pool
     * bigger than the window" is not the same claim as "a queue can keep it fresh", which is why
     * `marginal` is now reported as its own population rather than folded into either neighbour.
     *
     * A leak is now what it should always have been: a repeat the queue served WITHOUT saying so. */
    /* S242 / GRB-04. ZERO POST-QUEUE DUPLICATES IS THE STRONGEST EVIDENCE THERE IS, and it must be
     * read before the pool estimate.
     *
     * `distinctWidgets` counts distinct widgets in DRAWS random draws, so it is a lower bound that
     * systematically understates any pool near the window: 20 draws from a pool of 12 are expected
     * to reveal about 9.9 of them. Three pairs widened from 4 problems to 12 therefore kept the
     * `exhausted` label — while their in-window duplicates fell from 10 to 0, 2 and 3. The label was
     * wrong, not the content, and the ordering below is the fix: a pair the queue serves without a
     * single repeat is CLEAN whatever a sampled estimate of its pool says. */
    const announced = exhaustedDraws >= after;
    const verdict =
      after > 0 && !announced ? "leaking"
      : after === 0 ? "clean"
      : distinct <= REPEAT_WINDOW ? "exhausted"
      : "marginal";
    rows.push({
      generator: generator.tag, form, widgetType, verdict,
      draws: withQueue.length, distinct, before: windowDuplicates(withoutQueue), after, exhaustedDraws, redraws
    });
  }
}

const by = (v: string) => rows.filter((r) => r.verdict === v);
const before = rows.reduce((n, r) => n + r.before, 0);
const after = rows.reduce((n, r) => n + r.after, 0);

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "GENERATOR_ANTI_REPEAT_AUDIT.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} window=${REPEAT_WINDOW} draws=${DRAWS} — S242/GEN-04.`,
  "# `before` counts duplicates inside the window with NO queue (what the runtime did until this packet);",
  "# `after` counts them through drawFreshVariant. `exhausted` = pool at or below the window, which is",
  "# GRB-04's finding and not something a queue can repair. Any `leaking` row is a mechanism bug.",
  "generator,form,widgetType,verdict,draws,distinctWidgets,windowDuplicatesBefore,windowDuplicatesAfter,exhaustedDraws,redraws",
  ...rows
    .sort((a, b) => (a.verdict < b.verdict ? -1 : a.verdict > b.verdict ? 1 : b.after - a.after || a.distinct - b.distinct))
    .map((r) => [r.generator, r.form, r.widgetType, r.verdict, r.draws, r.distinct, r.before, r.after, r.exhaustedDraws, r.redraws].join(","))
].join("\n") + "\n");

console.log(`anti-repeat-window @ ${seal}`);
console.log(`  ${rows.length} (generator, form) pairs exercised, ${DRAWS} draws each`);
console.log(`  window duplicates BEFORE the queue: ${before.toLocaleString()}`);
console.log(`  window duplicates AFTER  the queue: ${after.toLocaleString()}`);
console.log(`    clean      ${by("clean").length}  (pool above the window, zero duplicates inside it)`);
console.log(`    exhausted  ${by("exhausted").length}  (pool at or below the window — GRB-04, not repairable here)`);
console.log(`    marginal   ${by("marginal").length}  (pool just above the window: re-seeding resamples, so it can still miss — and says so)`);
console.log(`    leaking    ${by("leaking").length}  (a repeat served WITHOUT the queue announcing it — a mechanism bug)`);
/* `distinctWidgets` SATURATES AT THE DRAW COUNT and is therefore a lower bound, not a pool size: a
 * pair reporting 20 in 20 draws has a pool of at least 20 and possibly thousands. Only pairs
 * measuring BELOW the draw count have a proven ceiling, so only those can be called narrow. */
const provablyNarrow = rows.filter((r) => r.distinct < DRAWS).length;
console.log(`  ${provablyNarrow} pairs have a PROVEN pool ceiling below ${DRAWS} draws; the rest saturated the sample and are unbounded above`);
console.log(`  re-draws spent: ${rows.reduce((n, r) => n + r.redraws, 0).toLocaleString()}`);
console.log(`  wrote ${relative(ROOT, csv)}`);

// Duplicates that survive on a pool WIDE ENOUGH to avoid them are the number §10 requires to be
// zero. Printed in full, then fatal — a capped list of mechanism bugs is a list that ships.
if (by("leaking").length) {
  console.log("\n── leaking ──");
  for (const r of by("leaking"))
    console.log(`  ${r.generator}|${r.form} ${r.widgetType}: ${r.after} duplicate(s) in-window, ${r.exhaustedDraws} announced, pool ≥ ${r.distinct}`);
  process.exit(1);
}
if (by("marginal").length) {
  console.log("\n── marginal (announced, not a bug — GRB-04 territory) ──");
  for (const r of by("marginal"))
    console.log(`  ${r.generator}|${r.form} ${r.widgetType}: ${r.after} announced duplicate(s), pool ≥ ${r.distinct}`);
}
