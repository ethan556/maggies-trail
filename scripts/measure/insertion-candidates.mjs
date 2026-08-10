#!/usr/bin/env node
/** insertion-candidates — the steppedReveal campaign's worklist, computed rather than hand-read.
 *
 *   node scripts/measure/insertion-candidates.mjs [--json] [--course <slug>] [--top N]
 *
 * WHY THIS EXISTS. The campaign needs ~360 more rich HS steps. Sessions have been adjudicating
 * roughly one conversion per 25 lessons because every candidate is read by hand and most refuse
 * late, after the reading cost is already paid. The three-gate test (models / reaches / represents)
 * has a machine-checkable part and a human part; nothing was doing the machine part first.
 *
 * WHAT THIS DOES — and, more importantly, WHAT IT DOES NOT.
 *
 * It computes the PRIOR, not the verdict. For every HS lesson holding a non-rich answering moment,
 * it asks which rich engines are already proven on this exact material, and ranks by that. It
 * cannot tell you whether an engine TEACHES the lesson's idea; that judgement stays human, and the
 * three-gate test still has to be run by hand on whatever this surfaces. A high rank means "cheap
 * to adjudicate", never "safe to convert".
 *
 * The ranking signal is deliberately conservative — reuse-first, per Protocol v2:
 *
 *   +100  the engine already appears in a Tier A/B lesson IN THE SAME COURSE. The strongest signal
 *         available without reading: someone already made this engine teach this course's material
 *         and it scored. Zero new registration work.
 *   +40   the engine appears at Tier A/B elsewhere under the same conceptTag PREFIX (the tag's
 *         course-ish stem, e.g. "ca-" from "ca-rolle"), i.e. proven on adjacent material.
 *   +25   the lesson's blocked interactive step is a steppedReveal — the wall the insert-after
 *         operation was built for, where insertion adds a doing-moment without touching authored
 *         teaching.
 *   +15   the lesson is Tier C/D (converting it moves the tier census as well as the step mix).
 *
 * Deterministic: reads content/, scripts/engine-capabilities.json and a tier JSON only. No network,
 * no wall clock, no randomness. Exits 1 if the capability file's shape has drifted, because a
 * silently-empty rich-engine set would rank everything zero and look like "no candidates".
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..", "..");
const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const courseFilter = argv.includes("--course") ? argv[argv.indexOf("--course") + 1] : null;
const top = argv.includes("--top") ? Number(argv[argv.indexOf("--top") + 1]) : 25;

/* ---- capabilities: which engines are "rich" (manip >= 2), read from the same file step-mix uses */
const capRaw = JSON.parse(readFileSync(join(root, "scripts/engine-capabilities.json"), "utf8"));
const types = capRaw.types ?? capRaw;
const manipOf = new Map(Object.entries(types).map(([t, v]) => [t, v?.manip ?? 0]));
/* S205K: manip can be per-answerMode. richStep judges a STEP (its own mode wins); the type-level
 * RICH set remains for engine-name lists and stays the conservative floor. */
const richStep = (w) => {
  const v = types[w?.type]; if (!v) return false;
  const m = v.manipByAnswerMode;
  const r = m && w?.answerMode != null && m[w.answerMode] !== undefined ? m[w.answerMode] : (v.manip ?? 0);
  return r >= 2;
};
const RICH = new Set([...manipOf].filter(([, m]) => m >= 2).map(([t]) => t));
if (RICH.size === 0) {
  console.error("insertion-candidates: parsed ZERO rich engines from scripts/engine-capabilities.json — the file shape changed. Fix the parser; do not rank against an empty set.");
  process.exit(1);
}

/* ---- tiers: reuse a cached run if present, else compute one (about a second, per the applier) */
const tierPath = join(root, ".tier-precheck.json");
if (!existsSync(tierPath)) {
  const r = spawnSync(process.execPath, [join(root, "scripts/flagship-tier.mjs")],
    { cwd: root, encoding: "utf8", env: { ...process.env, TIER_JSON: tierPath } });
  if (r.status !== 0) { console.error("insertion-candidates: tier scan failed"); process.exit(1); }
}
const tierOf = new Map(JSON.parse(readFileSync(tierPath, "utf8")).map((r) => [r.id, r.tier]));

/* ---- corpus walk ---- */
const tagStem = (t) => (typeof t === "string" && t.includes("-") ? t.slice(0, t.indexOf("-")) : t ?? "");
const lessons = [];
for (const dir of readdirSync(join(root, "content/courses"))) {
  const cj = join(root, "content/courses", dir, "course.json");
  const ld = join(root, "content/courses", dir, "lessons");
  if (!existsSync(cj) || !existsSync(ld)) continue;
  const course = JSON.parse(readFileSync(cj, "utf8"));
  if (courseFilter && dir !== courseFilter) continue;
  for (const f of readdirSync(ld)) {
    if (!f.endsWith(".json")) continue;
    const l = JSON.parse(readFileSync(join(ld, f), "utf8"));
    const id = f.replace(".json", "");
    lessons.push({ id, course: dir, courseTitle: course.title, gradeLevel: course.gradeLevel, tier: tierOf.get(id) ?? "?", steps: l.steps ?? [], title: l.title });
  }
}

/* ---- proven-engine indexes: what already scores, and where ---- */
const provenInCourse = new Map();   // course -> Set(engine)
const provenInStem = new Map();     // conceptTag stem -> Set(engine)
for (const l of lessons) {
  if (l.tier !== "A" && l.tier !== "B") continue;
  for (const s of l.steps) {
    const t = s.widget?.type;
    if (!t || !RICH.has(t)) continue;
    (provenInCourse.get(l.course) ?? provenInCourse.set(l.course, new Set()).get(l.course)).add(t);
    const stem = tagStem(s.conceptTag ?? l.steps.find((x) => x.conceptTag)?.conceptTag);
    if (stem) (provenInStem.get(stem) ?? provenInStem.set(stem, new Set()).get(stem)).add(t);
  }
}

/* ---- candidates: HS lessons with a non-rich answering moment ---- */
const HS = (g) => g >= 9;
const rows = [];
for (const l of lessons) {
  if (!HS(l.gradeLevel)) continue;
  const widgetSteps = l.steps.filter((s) => s.widget?.type);
  const nonRich = widgetSteps.filter((s) => !RICH.has(s.widget.type));
  if (nonRich.length === 0) continue;
  const hasSteppedReveal = widgetSteps.some((s) => s.widget.type === "steppedReveal");
  const stem = tagStem(l.steps.find((x) => x.conceptTag)?.conceptTag);

  const inCourse = [...(provenInCourse.get(l.course) ?? [])];
  const inStem = [...(provenInStem.get(stem) ?? [])].filter((e) => !inCourse.includes(e));

  let score = 0;
  if (inCourse.length) score += 100;
  if (inStem.length) score += 40;
  if (hasSteppedReveal) score += 25;
  if (l.tier === "C" || l.tier === "D") score += 15;
  if (score === 0) continue;

  rows.push({
    lesson: l.id, title: l.title, course: l.course, tier: l.tier, score,
    nonRichSteps: nonRich.map((s) => `${s.id}:${s.widget.type}`),
    hasSteppedReveal,
    provenInCourse: inCourse.sort(),
    provenNearby: inStem.sort(),
  });
}
rows.sort((a, b) => b.score - a.score || a.lesson.localeCompare(b.lesson));

/* ---- 5. Campaign arithmetic. Printed unconditionally, because the framing it corrects survived
 * four sessions of handovers: this was called "the steppedReveal campaign (~540 insertions)", and
 * the steppedReveal wall CANNOT supply that. There are only so many such lessons; the number below
 * is a hard ceiling assuming every one of them converts, which they will not (three in the dr/dc
 * cluster already refused on structural grounds). The gap has to come from ordinary answering
 * moments in ordinary HS lessons — insertions are not tier-gated and need no steppedReveal anchor.
 * Re-derived from the corpus on every run so it cannot go stale. */
{
  const RICH_SET = RICH;
  let hsLessons = 0, hsWithSR = 0, nonRichMoments = 0;
  for (const l of lessons) {
    if (!HS(l.gradeLevel)) continue;
    hsLessons++;
    let sr = false;
    for (const s of l.steps) {
      if (!s.widget?.type) continue;
      if (s.widget.type === "steppedReveal") sr = true;
      else if (!richStep(s.widget)) nonRichMoments++;
    }
    if (sr) hsWithSR++;
  }
  const hsRich = lessons.filter((l) => HS(l.gradeLevel))
    .reduce((n, l) => n + l.steps.filter((s) => s.widget?.type && richStep(s.widget)).length, 0);
  const hsAnswerable = hsRich + nonRichMoments + hsWithSR;
  const need = Math.max(0, Math.ceil(0.25 * hsAnswerable) - hsRich);
  const ceilingPct = need > 0 ? ((100 * hsWithSR) / need).toFixed(1) : "n/a";
  const banner = [
    "",
    "CAMPAIGN ARITHMETIC (re-derived, not quoted)",
    `  HS rich now ......................... ${hsRich} of ${hsAnswerable} answerable`,
    `  rich steps needed for >=25% ......... ${need}`,
    `  HS lessons carrying a steppedReveal . ${hsWithSR}`,
    `  => the steppedReveal wall's CEILING is ${hsWithSR} steps = ${ceilingPct}% of the gap,`,
    "     and that assumes every one converts, which they do not.",
    `  The other ~${(100 - Number(ceilingPct)).toFixed(0)}% must come from the ${nonRichMoments} non-rich answering moments`,
    "     in ordinary HS lessons. Insertions are not tier-gated and need no steppedReveal anchor.",
    "",
    "  DO NOT call this 'the steppedReveal campaign'. That framing sets a target the wall",
    "  cannot reach and hides where the work actually is.",
  ].join("\n");
  if (!asJson) console.log(banner);
}

if (asJson) {
  writeFileSync(join(root, "INSERTION_CANDIDATES.json"), JSON.stringify({ richEngines: [...RICH].sort(), candidates: rows }, null, 2));
  console.log(`insertion-candidates: ${rows.length} ranked -> INSERTION_CANDIDATES.json`);
} else {
  console.log(`rich engines: ${RICH.size} | HS candidates with a reuse signal: ${rows.length}\n`);
  console.log("score  lesson      tier  steppedReveal  proven-in-course (zero new registration)");
  for (const r of rows.slice(0, top)) {
    console.log(
      `${String(r.score).padStart(5)}  ${r.lesson.padEnd(11)} ${r.tier.padEnd(5)} ${(r.hasSteppedReveal ? "yes" : "—").padEnd(14)} ${r.provenInCourse.join(", ") || "—"}`
    );
  }
  console.log(`\nRanking is a PRIOR on adjudication cost, never a verdict. Run the three-gate test\n(models / reaches / represents) by hand on each before writing anything.`);
}
