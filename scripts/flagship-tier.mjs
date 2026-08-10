// Flagship tier audit — scores EVERY lesson on the thirteen experience
// dimensions, classifies A–D, checks the band targets, lists load-bearing
// K–8 concepts taught only at Tier C or below, and ranks the upgrade backlog.
//
//   node scripts/flagship-tier.mjs          # writes FLAGSHIP_TIERS.md
//
// Deterministic: reads content + scripts/engine-capabilities.json only.
// The engine-owned half of each score comes from the capability table, which
// src/lib/engineCapabilities.test.ts pins against the registry and the real
// onEvent/ghost wiring — the table cannot drift into flattery.
//
// Tier rules (printed in the report):
//   A  prediction ≥2 AND manip ≥2 AND consequence ≥2 AND misconception ≥2
//      AND total ≥ 30/39 — a complete mathematical laboratory.
//   B  manip ≥2 AND consequence ≥2 AND total ≥ 24, missing exactly one A gate
//      (almost always the prediction).
//   C  conventional interaction (manip ≤1) — with or without a prediction —
//      or an interactive lesson under the B bar.
//   D  no interactive step at all, or misconception sensitivity 0.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { predictionEligibility } from "./audit/prediction-eligibility.mjs";

const root = process.cwd();
// TIER_CAPS: optional path to an alternate capability-ratings file. Added in S182 after the
// external review showed the census silently depends on these ratings: pointing this at a
// conservative ratings file re-derives the whole census under that ruler, so a rating change
// (or a challenge to one) is always one command from a full recount instead of an argument.
const capsPath = process.env.TIER_CAPS ?? join(root, "scripts", "engine-capabilities.json");
const caps = JSON.parse(readFileSync(capsPath, "utf8")).types;

const ENTRY = new Set(["numeric", "fractionEntry", "buildExpression", "pointEntry"]);
const COMPARE = new Set(["placeCompare", "rationalCompare", "fractionCompare", "lengthCompare", "absValueLine"]);

const FOCUS = [
  ["fraction magnitude & operations", /fraction|^fr-|^fm-|^fa-|numerator|denominator/i],
  ["multiplication decomposition", /mult|array|equal-group|distributive|partial-product/i],
  ["division meaning", /divis|missing-factor|share|quotient/i],
  ["place-value estimation", /round|estimat|place-value|zero-pattern/i],
  ["rate of change", /slope|rate-of-change|secant|per-unit/i],
  ["ratios & proportions", /ratio|proportion|percent|unit-rate/i],
  ["equations", /equation|solve|balance|two-step|inequal/i],
  ["probability", /probab|chance|spinner|sample|likel/i],
  ["data distributions", /distribution|dot-plot|box|median|mean|spread|data/i],
  ["geometry & transformations", /transform|rigid|dilat|congruen|angle|triangle|geometr/i]
];

function band(g) {
  return g <= 2 ? "K-2" : g <= 5 ? "3-5" : g <= 8 ? "6-8" : "HS";
}

const lessons = [];
const remedialTags = new Set();
const coursesDir = join(root, "content", "courses");
for (const dir of readdirSync(coursesDir)) {
  const cj = join(coursesDir, dir, "course.json");
  if (!existsSync(cj)) continue;
  const course = JSON.parse(readFileSync(cj, "utf8"));
  const lessonsDir = join(coursesDir, dir, "lessons");
  if (!existsSync(lessonsDir)) continue;
  for (const f of readdirSync(lessonsDir)) {
    if (!f.endsWith(".json")) continue;
    const l = JSON.parse(readFileSync(join(lessonsDir, f), "utf8"));
    lessons.push({ course, lesson: l, file: `${dir}/lessons/${f}` });
    for (const r of l.remedials ?? []) remedialTags.add(r.conceptTag);
  }
}

function wrongPathCount(w) {
  let n = 0;
  if (w.options) n += w.options.filter((o) => !o.correct && o.feedback).length;
  if (w.type === "trialProbabilityLab" && Array.isArray(w.choices)) {
    n += w.choices.filter((choice) =>
      choice.num * w.total !== w.favourable * choice.den && choice.feedback
    ).length;
  }
  if (w.type === "compoundEventLab" && Array.isArray(w.choices)) {
    const total = w.stages.reduce((product, stage) => product * stage.outcomes.length, 1);
    const favourable = w.stages.reduce((product, stage) => product * stage.favourable.length, 1);
    n += w.choices.filter((choice) => {
      const correct = w.mode === "count" ? choice.count === total : choice.num * total === favourable * choice.den;
      return !correct && choice.feedback;
    }).length;
  }
  if (Array.isArray(w.measureChoices) && typeof w.answer === "number") {
    const tolerance = typeof w.tolerance === "number" ? w.tolerance : 0;
    n += w.measureChoices.filter((choice) =>
      typeof choice.value === "number" && Math.abs(choice.value - w.answer) > tolerance && choice.feedback
    ).length;
  }
  if (Array.isArray(w.judgeOptions)) n += w.judgeOptions.filter((option) => !option.correct && option.feedback).length;
  for (const k of ["commonErrors", "commonTotals", "commonBuilds", "commonEntries", "pairErrors", "commonLandings", "commonResults", "commonPairs", "commonCounts", "misorderFeedback"])
    if (Array.isArray(w[k])) n += w[k].length;
  for (const k of Object.keys(w))
    if (/Feedback$/.test(k) && !/success|reveal/i.test(k) && typeof w[k] === "string") n += 1;
  // Engines whose diagnosis is DERIVED rather than authored: count the wrong worlds the
  // grader actually names. unitChain enumerates 2^hops direction sequences and names the
  // first wrong crossing in each wrong one (see evaluate.ts) — each is a distinct,
  // reachable, individually-worded wrong path with no authored array to count.
  if (w.type === "unitChain" && Array.isArray(w.hops)) n += Math.pow(2, w.hops.length) - 1;
  // slopeTriangle derives two diagnoses the authoring never spells out — the swapped legs
  // (reciprocal slope) and the dropped sign — both proven reachable in slopeTriangle.s123.test.ts.
  if (w.type === "slopeTriangle") n += 2;
  // dotPlot READ mode derives its diagnoses too: one per other non-empty stack (wrong stack
  // counted), plus whole-plot-as-total, plus half-counted stack (see evaluate.ts).
  if (w.type === "dotPlot" && Array.isArray(w.given) && typeof w.askIndex === "number")
    n += w.given.filter((g, i) => i !== w.askIndex && g > 0).length + 2;
  return n;
}

function scoreLesson(course, l) {
  const steps = l.steps ?? [];
  const widgetSteps = steps.filter((s) => s.widget);
  const assessed = steps.filter((s) => s.widget && (s.kind === "check" || s.kind === "challenge"));
  const cap = (t) => caps[t] ?? { manip: 0, conseq: 0, err: 1, adapt: 0, a11y: 2, mobile: 2, polish: 1 };
  /* S205K: manip can be rated per answerMode (see engine-capabilities manipByAnswerMode). The
   * step's own mode wins when rated; the type value stays the floor, so a reader that ignored
   * this would under-count, never over-count. */
  const manipOfStep = (w) => {
    const c = cap(w?.type ?? "mcq");
    const m = c.manipByAnswerMode;
    return m && w?.answerMode != null && m[w.answerMode] !== undefined ? m[w.answerMode] : c.manip;
  };
  const engines = widgetSteps.map((s) => cap(s.widget.type));
  const maxOf = (k) => (engines.length ? Math.max(...engines.map((e) => e[k])) : 0);
  const minOf = (k) => (engines.length ? Math.min(...engines.map((e) => e[k])) : 0);

  const d = {};
  // 1 meaningful prediction
  const predictSteps = steps.filter((s) => s.predict);
  d.prediction =
    predictSteps.length === 0 ? 0 : predictSteps.some((s) => manipOfStep(s.widget) >= 2) ? 3 : 2;
  // 2 direct manipulation · 3 visible consequence
  d.manip = widgetSteps.length ? Math.max(...widgetSteps.map((s) => manipOfStep(s.widget)), 0) : maxOf("manip");
  d.conseq = maxOf("conseq");
  // 4 revise: retry is universal player behaviour (2); stateful engines preserve work (3)
  d.revise = widgetSteps.length === 0 ? 0 : d.manip >= 2 ? 3 : 2;
  // 5 contrast between cases
  const byTag = {};
  for (const s of assessed) if (s.conceptTag) byTag[s.conceptTag] = (byTag[s.conceptTag] ?? 0) + 1;
  const maxSame = Math.max(0, ...Object.values(byTag));
  const hasCompare = widgetSteps.some((s) => COMPARE.has(s.widget.type));
  d.contrast = maxSame >= 3 || hasCompare ? 3 : maxSame >= 2 ? 2 : assessed.length >= 2 ? 1 : 0;
  // 6 invariant: success feedback everywhere it can exist + a naming step after interaction
  const firstW = steps.findIndex((s) => s.widget);
  const conceptAfter = firstW >= 0 && steps.slice(firstW + 1).some((s) => !s.widget && s.kind === "concept");
  d.invariant = widgetSteps.length === 0 ? 0 : conceptAfter ? 3 : 2;
  // 7 formalization: notation entry after a manipulable step
  let manipSeen = false;
  let entryAfterManip = false;
  for (const s of steps) {
    if (!s.widget) continue;
    if (manipOfStep(s.widget) >= 2) manipSeen = true;
    else if (manipSeen && ENTRY.has(s.widget.type)) entryAfterManip = true;
  }
  d.formal = entryAfterManip ? 3 : widgetSteps.some((s) => ENTRY.has(s.widget.type)) ? 2 : widgetSteps.length ? 1 : 0;
  // 8 transfer: a challenge, ideally on a different surface
  const ch = steps.filter((s) => s.kind === "challenge" && s.widget);
  const kTypes = new Set(steps.filter((s) => s.kind === "check" && s.widget).map((s) => s.widget.type));
  d.transfer = ch.length === 0 ? 0 : ch.some((s) => !kTypes.has(s.widget.type)) ? 3 : 2;
  // 9 misconception sensitivity: mean distinct wrong paths per widget step
  // Sensitivity is about GRADED moments: average over assessed steps so a lesson
  // is not punished for also containing wrong-path-free exploration widgets.
  const sensBase = assessed.length ? assessed : widgetSteps;
  const meanWrong = sensBase.length
    ? sensBase.reduce((t, s) => t + wrongPathCount(s.widget), 0) / sensBase.length
    : 0;
  d.misconception = meanWrong >= 2.5 ? 3 : meanWrong >= 1.5 ? 2 : meanWrong >= 0.75 ? 1 : 0;
  // 10 process adaptation: onEvent engines + authored remedials
  d.adapt = Math.min(3, (maxOf("adapt") >= 3 ? 2 : 0) + ((l.remedials ?? []).length > 0 ? 1 : 0));
  // 11–13 engine-owned floors
  d.a11y = widgetSteps.length ? minOf("a11y") : 2;
  d.mobile = widgetSteps.length ? minOf("mobile") : 2;
  d.polish = widgetSteps.length ? minOf("polish") : 1;

  const total = Object.values(d).reduce((a, b) => a + b, 0);
  const gates = d.prediction >= 2 && d.manip >= 2 && d.conseq >= 2 && d.misconception >= 2;
  let tier;
  if (widgetSteps.length === 0 || d.misconception === 0) tier = "D";
  // Prediction stapled to a static step: flagship-rank counts these as done
  // ("flagship" status), but no laboratory exists — the mandate's "incorrectly
  // classified" case. Hand-verified exemplar: asv-01-02 (predict on plain numeric).
  else if (predictSteps.length > 0 && d.manip === 0 && d.conseq <= 1) tier = "D";
  else if (gates && total >= 30) tier = "A";
  else if (d.manip >= 2 && d.conseq >= 2 && total >= 24) tier = "B";
  // Model-grounded PICKS (manip 1: absValueLine, fractionCompare, placeCompare…)
  // can reach B when everything else is strong — "rich interaction missing one
  // phase", the missing phase being direct manipulation. They can never reach A.
  else if (d.manip === 1 && d.conseq >= 2 && d.misconception >= 2 && total >= 26) tier = "B";
  else tier = "C";
  return { d, total, tier };
}

const rows = lessons.map(({ course, lesson, file }) => {
  const { d, total, tier } = scoreLesson(course, lesson);
  const tags = (lesson.steps ?? []).map((s) => s.conceptTag).filter(Boolean);
  const hay = `${lesson.title} ${course.title} ${tags.join(" ")}`;
  const focus = FOCUS.filter(([, re]) => re.test(hay)).map(([n]) => n);
  return {
    id: lesson.id,
    title: lesson.title,
    course: course.title,
    grade: course.gradeLevel,
    band: band(course.gradeLevel),
    file,
    tags,
    d,
    total,
    tier,
    focus,
    loadBearing: tags.some((t) => remedialTags.has(t)),
    predictionEligibility: predictionEligibility(lesson, caps)
  };
});

// ------------------------------------------------------------------ report --
const md = [];
md.push("# Flagship tier audit (generated — do not hand-edit)");
md.push("");
md.push("Regenerate with `node scripts/flagship-tier.mjs`. Thirteen dimensions, 0–3 each");
md.push("(prediction · manipulation · consequence · revise · contrast · invariant ·");
md.push("formalization · transfer · misconception · adaptation · a11y · mobile · polish).");
md.push("");
md.push("**Tier rules** — A: prediction≥2 ∧ manip≥2 ∧ consequence≥2 ∧ misconception≥2 ∧ total≥30.");
md.push("B: manip≥2 ∧ consequence≥2 ∧ total≥24 with one A-gate missing — or a model-grounded pick");
md.push("(manip 1: e.g. fractionCompare) at conseq≥2 ∧ misconception≥2 ∧ total≥26. C: choice/entry");
md.push("interaction or under the B bar. D: no interactive step, or misconception sensitivity 0.");
md.push("");

const bands = ["K-2", "3-5", "6-8", "HS"];
md.push("## Tier distribution");
md.push("");
md.push("| Band | A | B | C | D | lessons |");
md.push("| --- | --: | --: | --: | --: | --: |");
for (const b of bands) {
  const br = rows.filter((r) => r.band === b);
  const c = (t) => br.filter((r) => r.tier === t).length;
  md.push(`| ${b} | ${c("A")} | ${c("B")} | ${c("C")} | ${c("D")} | ${br.length} |`);
}
const k8 = rows.filter((r) => r.band !== "HS");
const k8A = k8.filter((r) => r.tier === "A").length;
const k8B = k8.filter((r) => r.tier === "B").length;
md.push("");
md.push(`**K–8 targets** — Tier A ${k8A}/200–250 ${k8A >= 200 ? "✓" : "▲ below target"} · ` +
  `Tier B ${k8B}/200–300 ${k8B >= 200 ? "✓" : "▲ below target"}.`);
md.push("");

// Load-bearing K-8 concepts taught only at C or below
const bestByTag = {};
for (const r of k8)
  for (const t of r.tags) {
    const rank = { A: 4, B: 3, C: 2, D: 1 }[r.tier];
    if (!bestByTag[t] || rank > bestByTag[t].rank) bestByTag[t] = { rank, tier: r.tier, lesson: r.id };
  }
const cOnly = [...remedialTags]
  .filter((t) => bestByTag[t] && bestByTag[t].rank <= 2)
  .sort()
  .map((t) => `${t} (best: ${bestByTag[t].tier} in ${bestByTag[t].lesson})`);
md.push("## Load-bearing K–8 concepts with no experience above Tier C");
md.push("");
md.push(cOnly.length ? cOnly.map((x) => `- ${x}`).join("\n") : "- none — every remediation-target concept has a Tier-B-or-better experience ✓");
md.push("");

// Fastest path to target: K-8 Tier-B lessons where PREDICTION is the only missing A-gate.
// Session 125 proved that score arithmetic alone is unsafe: a read-only graph task can be a
// complete experience at B because a prediction would merely duplicate the observation. Keep
// the mechanical candidate set, then split it with the content-driven eligibility rule.
const predictionGateCandidates = k8.filter(
  (r) =>
    r.tier === "B" &&
    r.d.prediction < 2 &&
    r.d.manip >= 2 &&
    r.d.conseq >= 2 &&
    r.d.misconception >= 2 &&
    r.total + 2 >= 30
);
const oneGate = predictionGateCandidates.filter((r) => r.predictionEligibility.status === "eligible");
const honestBCeilings = predictionGateCandidates.filter((r) => r.predictionEligibility.status !== "eligible");
md.push(`## One honest gate from Tier A — prediction-eligible (${oneGate.length} K–8 lessons)`);
md.push("");
md.push("| lesson | course (grade) | total | focus domains | eligibility evidence |");
md.push("|---|---|--:|---|---|");
for (const r of oneGate.sort((a2, b2) => b2.focus.length - a2.focus.length || b2.total - a2.total).slice(0, 40))
  md.push(`| ${r.id} — ${r.title} | ${r.course} (G${r.grade}) | ${r.total}/39 | ${r.focus.join("; ") || "—"} | ${r.predictionEligibility.reason} |`);
md.push("");
md.push(`## Honest Tier-B ceilings — prediction would be redundant or unsafe (${honestBCeilings.length})`);
md.push("");
md.push("| lesson | course (grade) | total | status | reason |");
md.push("|---|---|--:|---|---|");
for (const r of honestBCeilings.sort((a, b) => a.grade - b.grade || a.id.localeCompare(b.id)))
  md.push(`| ${r.id} — ${r.title} | ${r.course} (G${r.grade}) | ${r.total}/39 | ${r.predictionEligibility.status} | ${r.predictionEligibility.reason} |`);
md.push("");

// Upgrade backlog: K-8 C/D lessons ranked by load-bearing, focus domains, misconception burden
const backlog = k8
  .filter((r) => r.tier === "C" || r.tier === "D")
  .map((r) => ({
    ...r,
    priority:
      (r.loadBearing ? 40 : 0) +
      r.focus.length * 12 +
      (3 - r.d.manip) * 6 +
      (r.tier === "D" ? 10 : 0) +
      (8 - Math.min(8, r.grade))
  }))
  .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
md.push(`## Upgrade backlog — K–8 Tier C/D, priority-ranked (top 60 of ${backlog.length})`);
md.push("");
md.push("| # | lesson | course (grade) | tier | total | gaps | focus domains | priority |");
md.push("|--:|---|---|---|--:|---|---|--:|");
for (const [i, r] of backlog.slice(0, 60).entries()) {
  const gaps = Object.entries(r.d)
    .filter(([, v]) => v <= 1)
    .map(([k]) => k)
    .join(" ");
  md.push(
    `| ${i + 1} | ${r.id} — ${r.title} | ${r.course} (G${r.grade}) | ${r.tier} | ${r.total}/39 | ${gaps} | ${r.focus.join("; ") || "—"} | ${r.priority} |`
  );
}
md.push("");
md.push(`Totals: ${rows.length} lessons · A ${rows.filter((r) => r.tier === "A").length} · B ${rows.filter((r) => r.tier === "B").length} · C ${rows.filter((r) => r.tier === "C").length} · D ${rows.filter((r) => r.tier === "D").length}.`);
md.push("");

writeFileSync(join(root, "FLAGSHIP_TIERS.md"), md.join("\n"));
// Opt-in machine-readable side output for measurement scripts. Default run is
// byte-identical to before; nothing downstream reads this unless asked.
if (process.env.TIER_JSON) writeFileSync(process.env.TIER_JSON, JSON.stringify(rows, null, 1));
console.log(
  `tiers: A ${rows.filter((r) => r.tier === "A").length} B ${rows.filter((r) => r.tier === "B").length} C ${rows.filter((r) => r.tier === "C").length} D ${rows.filter((r) => r.tier === "D").length} | K-8 A ${k8A} B ${k8B} | C-only load-bearing ${cOnly.length} | backlog ${backlog.length}`
);
