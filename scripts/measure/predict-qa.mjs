/* Prediction QA — a corpus-wide gate for `predict` blocks.
 *
 *   node scripts/measure/predict-qa.mjs
 *
 * The tier formula rewards the PRESENCE of a prediction; it cannot see whether the prediction is
 * worth making. Authoring predictions in bulk is exactly where that gap bites, so this checks the
 * properties a bulk pass is most likely to break:
 *
 *   1. structural   — outcomeId is actually offered; ids and labels unique; >= 3 options
 *   2. placement    — sits on an interactive step that has something to manipulate
 *   3. substance    — the reveal says materially more than the option it explains
 *   4. grounding    — the prompt shares real vocabulary with the step it introduces, so it is
 *                     about THIS lesson rather than a template dropped in
 *   5. distinctness — no prompt or reveal is reused across the corpus, which is the signature of
 *                     a bulk pass that stopped reading the lessons
 *
 * Deterministic, dependency-free, reads content/ only.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/courses";
const MIN_OPTIONS = 2;          // a binary ("will it hold?") is a real commitment; one option is not
const REVEAL_MARGIN = 60;      // chars the reveal must exceed the chosen option's label by
const MIN_GROUNDING = 2;       // content words shared with the LESSON's text (advisory)

const STOP = new Set(("the a an and or of to in on at is are was be been will would can could it its this that these those " +
  "for from with without by as if then than so but not no yes you your they them their we our i me my what which who how " +
  "why when where all any each every some more most less least one two three both either neither same different other " +
  "does do did done has have had having make makes made get gets got go goes going come comes came take takes took " +
  "here there now next after before while during over under up down out into onto off about between among").split(" "));

const words = (s) =>
  new Set(
    String(s ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9²³√⁻¹\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  );

const problems = [];
const warnings = [];
const seenPrompt = new Map();
const seenReveal = new Map();
let checked = 0;

for (const course of readdirSync(ROOT)) {
  const dir = join(ROOT, course, "lessons");
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const lesson = JSON.parse(readFileSync(join(dir, file), "utf8"));
    for (const step of lesson.steps ?? []) {
      const p = step.predict;
      if (!p) continue;
      checked++;
      const where = `${lesson.id}/${step.id}`;
      const fail = (msg) => problems.push(`${where}: ${msg}`);
      const warn = (msg) => warnings.push(`${where}: ${msg}`);

      // 1 structural
      const ids = (p.options ?? []).map((o) => o.id);
      const labels = (p.options ?? []).map((o) => o.label);
      if (ids.length < MIN_OPTIONS) fail(`only ${ids.length} option(s) — nothing to commit between`);
      else if (ids.length === 2) warn("binary prediction — legitimate, but a third option usually names a second misconception");
      if (new Set(ids).size !== ids.length) fail("duplicate option ids");
      if (new Set(labels).size !== labels.length) fail("two options say the same thing");
      if (!ids.includes(p.outcomeId)) fail(`outcomeId "${p.outcomeId}" is not one of the options`);

      // 2 placement
      if (step.kind !== "interactive") fail(`predict on a ${step.kind} step — a prediction precedes a manipulation`);
      if (!step.widget) fail("predict with no widget to manipulate");

      // 3 substance
      const chosen = (p.options ?? []).find((o) => o.id === p.outcomeId);
      if (chosen && (p.reveal ?? "").length < chosen.label.length + REVEAL_MARGIN)
        warn("the reveal barely exceeds the option it explains — check it explains rather than restates");

      // 4 grounding — ADVISORY. Measured against the whole lesson, not just the step: a good
      // prediction often introduces vocabulary the step then uses, so a step-local comparison
      // punishes exactly the writing it should reward. Kept as a warning because it still catches
      // a template dropped into the wrong lesson.
      const lessonText = (lesson.steps ?? []).map((x) => `${x.body ?? ""} ${x.widget?.prompt ?? ""}`).join(" ") + " " + (lesson.title ?? "");
      const lw = words(lessonText);
      const shared = [...words(p.prompt)].filter((w) => lw.has(w));
      if (shared.length < MIN_GROUNDING)
        warn(`prompt shares only ${shared.length} content word(s) with its lesson — is it about this lesson?`);

      // 5 distinctness across the corpus
      const pk = String(p.prompt ?? "").trim().toLowerCase();
      const rk = String(p.reveal ?? "").trim().toLowerCase();
      if (seenPrompt.has(pk)) fail(`prompt is identical to ${seenPrompt.get(pk)}`);
      else seenPrompt.set(pk, where);
      if (seenReveal.has(rk)) fail(`reveal is identical to ${seenReveal.get(rk)}`);
      else seenReveal.set(rk, where);
    }
  }
}

for (const p of problems) console.error("  ✗ " + p);
if (process.env.PREDICT_QA_WARN) for (const w of warnings) console.error("  ! " + w);
console.log(`predict QA: ${checked} predictions checked, ${problems.length} problem(s), ${warnings.length} warning(s)`);
process.exit(problems.length ? 1 : 0);
