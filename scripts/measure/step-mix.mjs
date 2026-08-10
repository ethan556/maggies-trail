#!/usr/bin/env node
/** step-mix — the manipulation profile of every answerable step, by band.
 *
 *   node scripts/measure/step-mix.mjs           # human table
 *   node scripts/measure/step-mix.mjs --json    # machine-readable
 *
 * WHY THIS EXISTS. The "static numeric/MCQ %" and "rich manipulative %" targets have been
 * reported across several sessions without a pinned definition, and the numbers drifted: S204C's
 * 76.5% reproduces only as (widget steps − rich − exactNumberLab) ÷ widget steps, an undeclared
 * rule that special-cases one engine and moves the target by eight points. A target you cannot
 * recompute is not a target.
 *
 * THE DEFINITION, and it is the only one:
 *   denominator — every step carrying a widget. Concept and recap steps carry none and are
 *                 excluded; the remaining kinds (interactive / check / challenge) are exactly the
 *                 steps that ask a learner for something.
 *   rich        — the step's engine has manip >= 2 in scripts/engine-capabilities.json
 *   semi        — manip == 1
 *   static      — manip == 0
 * No engine is special-cased. An unrated widget type is a hard error, not a silent zero, so a new
 * engine cannot quietly enter the corpus without a capability row.
 *
 * The capability table is the authority and cannot flatter itself: engineCapabilities.test.ts pins
 * adapt=3 to components that actually wire onEvent, and errorTeach=3 to a real reveal-ghost node.
 *
 * Deterministic: reads content/ and the capability table only. No wall clock, no network.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const caps = JSON.parse(readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")).types;

const band = (g) => (g <= 2 ? "K-2" : g <= 5 ? "3-5" : g <= 8 ? "6-8" : "HS");
const ORDER = ["K-2", "3-5", "6-8", "HS"];

const bands = {};
const coursesDir = join(root, "content", "courses");
for (const dir of readdirSync(coursesDir)) {
  const coursePath = join(coursesDir, dir, "course.json");
  if (!existsSync(coursePath)) continue;
  // NOTE: the field is `gradeLevel`. `course.grade` is undefined everywhere in this corpus, and
  // reading it silently buckets all 129 courses into one band — a real mis-measurement.
  const gradeLevel = JSON.parse(readFileSync(coursePath, "utf8")).gradeLevel;
  if (typeof gradeLevel !== "number") throw new Error(`step-mix: ${dir}/course.json has no numeric gradeLevel`);
  const lessonsDir = join(coursesDir, dir, "lessons");
  if (!existsSync(lessonsDir)) continue;

  for (const file of readdirSync(lessonsDir)) {
    if (!file.endsWith(".json")) continue;
    const lesson = JSON.parse(readFileSync(join(lessonsDir, file), "utf8"));
    for (const step of lesson.steps ?? []) {
      const type = step.widget?.type;
      if (!type) continue;
      const row = (bands[band(gradeLevel)] ??= { total: 0, rich: 0, semi: 0, static: 0 });
      row.total++;
      /* S205K: capability can be per-answerMode (finer than per-type, so a type whose modes
       * genuinely differ stops forcing one claim over all of them). Mode-level wins when the
       * step's own spec names a mode the file rates; the type value remains the floor. */
      const byMode = caps[type]?.manipByAnswerMode;
      const manip = (byMode && step.widget?.answerMode != null && byMode[step.widget.answerMode] !== undefined)
        ? byMode[step.widget.answerMode]
        : caps[type]?.manip;
      if (manip === undefined)
        throw new Error(`step-mix: widget type "${type}" (${lesson.id}) has no row in engine-capabilities.json`);
      if (manip >= 2) row.rich++;
      else if (manip === 1) row.semi++;
      else row.static++;
    }
  }
}

const pct = (n, d) => (d === 0 ? "0.0%" : ((100 * n) / d).toFixed(1) + "%");

if (process.argv.includes("--json")) {
  const out = {};
  for (const b of ORDER) if (bands[b]) out[b] = { ...bands[b], richPct: +((100 * bands[b].rich) / bands[b].total).toFixed(1) };
  console.log(JSON.stringify({ generatedAt: "deterministic-no-wall-clock", definition: "rich=manip>=2, semi=manip==1, static=manip==0, over steps carrying a widget", bands: out }, null, 2));
} else {
  for (const b of ORDER) {
    const r = bands[b];
    if (!r) continue;
    console.log(
      `${b.padEnd(4)} answerable ${String(r.total).padStart(5)} | rich ${String(r.rich).padStart(4)} ${pct(r.rich, r.total).padStart(6)}` +
      ` | semi ${String(r.semi).padStart(4)} ${pct(r.semi, r.total).padStart(6)}` +
      ` | static ${String(r.static).padStart(5)} ${pct(r.static, r.total).padStart(6)}`
    );
  }
  const hs = bands.HS;
  if (hs) {
    const need = Math.ceil(0.25 * hs.total) - hs.rich;
    /* Two different numbers, and conflating them has already misled a handover. CONVERTING an
     * existing step (a widget swapped in place) leaves the denominator alone. INSERTING a new
     * step — which is what this campaign has actually been doing — grows numerator AND
     * denominator, so it takes MORE of them. Print both, derived, so nobody plans against the
     * smaller one by accident. */
    const insertNeed = need > 0 ? Math.ceil((0.25 * hs.total - hs.rich) / 0.75) : 0;
    console.log(`\nHS against the >=25% rich target: ${pct(hs.rich, hs.total)} — ${need > 0 ? `${need} more rich steps needed` : "met"}.`);
    if (need > 0)
      console.log(
        `  ${need} if CONVERTED in place (denominator fixed) · ${insertNeed} if INSERTED as new steps (denominator grows).`,
      );
  }
}
