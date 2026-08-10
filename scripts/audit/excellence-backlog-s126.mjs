#!/usr/bin/env node
/**
 * Session 126 truth compiler.
 *
 * Converts the measured Session-125 K–8 Tier-C/D queue into a reviewed,
 * source-backed disposition ledger. It also adds the step-weighted metrics the
 * max-based lesson tier cannot express and audits named representations that
 * are described but not rendered at the graded step.
 *
 * Dependency-free: safe to run before npm install.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import process from "node:process";
import { predictionEligibility } from "./prediction-eligibility.mjs";

const ROOT = resolve(import.meta.dirname, "..", "..");
const CONTENT = join(ROOT, "content", "courses");
const OUT_JSON = join(ROOT, "EXCELLENCE_BACKLOG_S126.json");
const OUT_CSV = join(ROOT, "EXCELLENCE_BACKLOG_S126.csv");
const OUT_MD = join(ROOT, "EXCELLENCE_BACKLOG_S126.md");
const POLICY_PATH = join(ROOT, "scripts", "audit", "excellence-dispositions-s126.json");
const CAPS_PATH = join(ROOT, "scripts", "engine-capabilities.json");

const policyDoc = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
const policy = policyDoc.records;
const caps = JSON.parse(readFileSync(CAPS_PATH, "utf8")).types;
const fail = (message) => {
  throw new Error(`S126 excellence audit: ${message}`);
};

const ALLOWED = {
  interactionIntent: new Set(["read", "construct", "compare", "classify", "compute", "justify", "model"]),
  representationRequired: new Set([
    "none",
    "ruler",
    "grid",
    "graph",
    "table",
    "number line",
    "geometric figure",
    "symbolic process",
    "fraction model",
    "place-value chart",
    "probability experiment",
    "multiple"
  ]),
  representationPresent: new Set(["yes", "partial", "no"]),
  predictionEligibility: new Set(["eligible", "leaked", "redundant", "unsafe"]),
  candidateDisposition: new Set(["reuse", "extend", "build", "multi-engine", "intentional-assessment", "decline"]),
  honestRestingTier: new Set(["A", "B", "C-intentional"]),
  reviewStatus: new Set(["classified"])
};

if (policyDoc.session !== 126) fail(`policy session is ${policyDoc.session}, expected 126`);
// The reviewed policy is a living queue: completed lessons leave it. Exact parity with the
// measured live C/D set below is the invariant; a frozen historical row count would make progress
// fail its own gate.
//
// S204A: an EMPTY policy used to fail here, on the assumption that an empty queue meant a missing
// or unloaded file. That assumption expired the moment the queue was actually finished — dd-01-01
// and kc-02-03 were the last two K-8 Tier C lessons, and converting them left nothing behind. An
// audit that cannot express "the work is done" would force either a fake row or a deleted gate, so
// empty is now a legal state. The parity check below is what actually guards this file: if a K-8
// lesson regresses to C/D, `missingPolicy` catches it whether the policy is empty or not.
if (!Array.isArray(policy)) fail("policy records must be an array");
if (new Set(policy.map((row) => row.lessonId)).size !== policy.length) fail("policy contains duplicate lesson IDs");
for (const row of policy) {
  for (const [field, allowed] of Object.entries(ALLOWED)) {
    if (!allowed.has(row[field])) fail(`${row.lessonId}.${field}=${JSON.stringify(row[field])} is not allowed`);
  }
  for (const field of ["candidateEngineOrExtension", "fitAcceptanceContract", "workstream"]) {
    if (typeof row[field] !== "string" || !row[field].trim()) fail(`${row.lessonId}.${field} is empty`);
  }
}

function loadLessons() {
  const byId = new Map();
  const all = [];
  for (const courseDir of readdirSync(CONTENT).sort()) {
    const coursePath = join(CONTENT, courseDir, "course.json");
    const lessonsDir = join(CONTENT, courseDir, "lessons");
    if (!existsSync(coursePath) || !existsSync(lessonsDir)) continue;
    const course = JSON.parse(readFileSync(coursePath, "utf8"));
    for (const file of readdirSync(lessonsDir).filter((name) => name.endsWith(".json")).sort()) {
      const path = join(lessonsDir, file);
      const lesson = JSON.parse(readFileSync(path, "utf8"));
      const record = {
        course,
        courseDir,
        lesson,
        path,
        sourcePath: `content/courses/${courseDir}/lessons/${file}`
      };
      if (byId.has(lesson.id)) fail(`duplicate lesson ID on disk: ${lesson.id}`);
      byId.set(lesson.id, record);
      all.push(record);
    }
  }
  return { byId, all };
}

function liveTierRows() {
  const path = join(tmpdir(), `maggies-tier-s126-${process.pid}.json`);
  try {
    execFileSync(process.execPath, [join(ROOT, "scripts", "flagship-tier.mjs")], {
      cwd: ROOT,
      env: { ...process.env, TIER_JSON: path },
      stdio: "pipe",
      timeout: 120_000
    });
    return JSON.parse(readFileSync(path, "utf8"));
  } finally {
    rmSync(path, { force: true });
  }
}

function plain(value) {
  return String(value ?? "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compactPrompt(step) {
  const body = plain(step.body);
  const prompt = plain(step.widget?.prompt);
  if (body && prompt && body !== prompt) return `${body}: ${prompt}`;
  return prompt || body || step.id;
}

function widgetCounts(lesson) {
  const counts = new Map();
  for (const step of lesson.steps ?? []) {
    if (!step.widget?.type) continue;
    counts.set(step.widget.type, (counts.get(step.widget.type) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([type, count]) => `${type}×${count}`);
}

const WRONG_ARRAYS = [
  "commonErrors",
  "commonTotals",
  "commonBuilds",
  "commonEntries",
  "pairErrors",
  "commonLandings",
  "commonResults",
  "commonPairs",
  "commonCounts"
];

function misconceptionInventory(lesson) {
  const out = [];
  for (const step of lesson.steps ?? []) {
    const widget = step.widget;
    if (!widget) continue;
    if (Array.isArray(widget.options)) {
      for (const option of widget.options) {
        if (option.correct || !option.feedback) continue;
        out.push({ stepId: step.id, widgetType: widget.type, trigger: option.id ?? option.label, feedback: plain(option.feedback) });
      }
    }
    if (Array.isArray(widget.choices)) {
      for (const choice of widget.choices) {
        const isCorrect = widget.type === "trialProbabilityLab"
          ? choice.num * widget.total === widget.favourable * choice.den
          : widget.type === "compoundEventLab"
            ? (() => {
                const total = widget.stages.reduce((product, stage) => product * stage.outcomes.length, 1);
                const favourable = widget.stages.reduce((product, stage) => product * stage.favourable.length, 1);
                return widget.mode === "count" ? choice.count === total : choice.num * total === favourable * choice.den;
              })()
            : Boolean(choice.correct);
        if (isCorrect || !choice.feedback) continue;
        out.push({ stepId: step.id, widgetType: widget.type, trigger: choice.id ?? choice.value ?? choice.label, feedback: plain(choice.feedback) });
      }
    }
    if (Array.isArray(widget.measureChoices) && typeof widget.answer === "number") {
      const tolerance = typeof widget.tolerance === "number" ? widget.tolerance : 0;
      for (const choice of widget.measureChoices) {
        if (typeof choice.value !== "number" || Math.abs(choice.value - widget.answer) <= tolerance || !choice.feedback) continue;
        out.push({ stepId: step.id, widgetType: widget.type, trigger: choice.value, feedback: plain(choice.feedback) });
      }
    }
    if (Array.isArray(widget.judgeOptions)) {
      for (const option of widget.judgeOptions) {
        if (option.correct || !option.feedback) continue;
        out.push({ stepId: step.id, widgetType: widget.type, trigger: option.id ?? option.label, feedback: plain(option.feedback) });
      }
    }
    for (const field of WRONG_ARRAYS) {
      if (!Array.isArray(widget[field])) continue;
      for (const item of widget[field]) {
        const trigger = item.value ?? item.total ?? item.build ?? item.entry ?? item.landing ?? item.result ?? item.pair ?? item.count ?? "authored wrong state";
        out.push({ stepId: step.id, widgetType: widget.type, trigger, feedback: plain(item.feedback) });
      }
    }
  }
  return out;
}

function conceptTags(lesson) {
  return [...new Set((lesson.steps ?? []).map((step) => step.conceptTag).filter(Boolean))].sort();
}

function remedialRisk(allLessons, lesson) {
  const tags = new Set(conceptTags(lesson));
  let routes = 0;
  const sources = [];
  for (const source of allLessons) {
    for (const remedial of source.lesson.remedials ?? []) {
      if (!tags.has(remedial.conceptTag)) continue;
      routes++;
      sources.push(`${source.lesson.id}:${remedial.conceptTag}`);
    }
  }
  return { routes, sources: sources.sort() };
}

function capability(type) {
  return caps[type] ?? { manip: 0, conseq: 0, err: 0, adapt: 0, a11y: 0, mobile: 0, polish: 0 };
}

function band(grade) {
  return grade <= 2 ? "K–2" : grade <= 5 ? "G3–5" : grade <= 8 ? "G6–8" : "HS";
}

function coverage(allLessons) {
  const buckets = new Map();
  const ensure = (name) => {
    if (!buckets.has(name)) {
      buckets.set(name, {
        band: name,
        lessons: 0,
        widgetSteps: 0,
        causalWidgetSteps: 0,
        explorationSteps: 0,
        causalExplorationSteps: 0,
        lessonsWithExploration: 0,
        lessonsWithCausalSpine: 0
      });
    }
    return buckets.get(name);
  };
  for (const { course, lesson } of allLessons) {
    const b = ensure(band(course.gradeLevel));
    b.lessons++;
    const widgetSteps = (lesson.steps ?? []).filter((step) => step.widget);
    const exploration = widgetSteps.filter((step) => step.kind === "interactive");
    const causal = (step) => {
      const c = capability(step.widget.type);
      return c.manip >= 2 && c.conseq >= 2;
    };
    b.widgetSteps += widgetSteps.length;
    b.causalWidgetSteps += widgetSteps.filter(causal).length;
    b.explorationSteps += exploration.length;
    b.causalExplorationSteps += exploration.filter(causal).length;
    if (exploration.length) b.lessonsWithExploration++;
    if (exploration.some(causal)) b.lessonsWithCausalSpine++;
  }
  const order = new Map([["K–2", 0], ["G3–5", 1], ["G6–8", 2], ["HS", 3]]);
  return [...buckets.values()].sort((a, b) => order.get(a.band) - order.get(b.band)).map((row) => ({
    ...row,
    widgetCausalCoverage: row.widgetSteps ? row.causalWidgetSteps / row.widgetSteps : 0,
    explorationCausalCoverage: row.explorationSteps ? row.causalExplorationSteps / row.explorationSteps : 0,
    causalSpineCoverage: row.lessonsWithExploration ? row.lessonsWithCausalSpine / row.lessonsWithExploration : 0
  }));
}

const REPRESENTATION_WORDS = /\b(graph|bar graph|picture graph|line plot|dot plot|table|ruler|grid|number line|coordinate plane|diagram|figure)\b/i;
const READ_WORDS = /\b(read|shown|shows|display|look at|from the graph|from the table|on the ruler|on the number line|on the grid)\b/i;
const ANSWER_SURFACES = new Set(["numeric", "mcq", "fractionEntry", "buildExpression", "pointEntry"]);

function undrawnCandidates(allLessons) {
  const found = [];
  for (const { course, lesson, sourcePath } of allLessons) {
    for (const step of lesson.steps ?? []) {
      if (!step.widget || !ANSWER_SURFACES.has(step.widget.type)) continue;
      const text = plain(`${step.body ?? ""} ${step.widget.prompt ?? ""}`);
      if (!REPRESENTATION_WORDS.test(text) || !READ_WORDS.test(text)) continue;
      if (step.figure || step.widget.figure) continue;
      found.push({
        lessonId: lesson.id,
        title: lesson.title,
        grade: course.gradeLevel,
        stepId: step.id,
        widgetType: step.widget.type,
        sourcePath,
        evidence: text
      });
    }
  }
  return found;
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const { byId, all } = loadLessons();
const tiers = liveTierRows();
const tierById = new Map(tiers.map((row) => [row.id, row]));
const liveBacklog = tiers.filter((row) => row.grade <= 8 && (row.tier === "C" || row.tier === "D"));
const liveIds = new Set(liveBacklog.map((row) => row.id));
const policyIds = new Set(policy.map((row) => row.lessonId));
const missingPolicy = [...liveIds].filter((id) => !policyIds.has(id)).sort();
const stalePolicy = [...policyIds].filter((id) => !liveIds.has(id)).sort();
if (missingPolicy.length || stalePolicy.length) {
  fail(`policy/live backlog drift; missing policy=[${missingPolicy.join(", ")}], stale policy=[${stalePolicy.join(", ")}]`);
}

const records = policy.map((review) => {
  const source = byId.get(review.lessonId);
  const tier = tierById.get(review.lessonId);
  if (!source || !tier) fail(`${review.lessonId} is not resolvable on disk`);
  const { lesson, course, sourcePath } = source;
  const evidence = (lesson.steps ?? [])
    .filter((step) => step.widget && ["interactive", "check", "challenge"].includes(step.kind))
    .map((step) => ({ stepId: step.id, kind: step.kind, widgetType: step.widget.type, prompt: compactPrompt(step) }));
  const misconceptions = misconceptionInventory(lesson);
  const risk = remedialRisk(all, lesson);
  const currentPrediction = predictionEligibility(lesson, caps);
  return {
    lessonId: lesson.id,
    title: lesson.title,
    course: course.title,
    grade: course.gradeLevel,
    sourcePath,
    currentTier: tier.tier,
    currentScore: tier.total,
    currentDimensions: tier.d,
    currentWidgets: widgetCounts(lesson),
    conceptTags: conceptTags(lesson),
    assessedClaimEvidence: evidence,
    interactionIntent: review.interactionIntent,
    representationRequired: review.representationRequired,
    representationPresent: review.representationPresent,
    predictionEligibility: review.predictionEligibility,
    currentPredictionEligibility: currentPrediction,
    candidateDisposition: review.candidateDisposition,
    candidateEngineOrExtension: review.candidateEngineOrExtension,
    exactFitEvidence: `Classified from the authored prompts. Acceptance contract: ${review.fitAcceptanceContract}`,
    misconceptionReachability: {
      status: review.candidateDisposition === "intentional-assessment" ? "preserve-current-assessment" : "mapping-required-before-conversion",
      authoredWrongPaths: misconceptions
    },
    honestRestingTier: review.honestRestingTier,
    remedialRisk: risk,
    verificationOwner: `${lesson.id}.s126-fit.test + independent answer derivation + non-target lesson hash proof`,
    workstream: review.workstream,
    reviewStatus: review.reviewStatus
  };
});

if (records.some((row) => row.reviewStatus !== "classified")) fail("one or more rows remain UNREVIEWED");

const honestPredictionCeilings = tiers
  .filter((row) => row.grade <= 8 && row.tier === "B" && row.d.prediction < 2 && row.d.manip >= 2 && row.d.conseq >= 2 && row.d.misconception >= 2 && row.total + 2 >= 30)
  .map((row) => {
    const source = byId.get(row.id);
    const result = predictionEligibility(source.lesson, caps);
    return { lessonId: row.id, title: row.title, grade: row.grade, score: row.total, ...result };
  })
  .filter((row) => row.status !== "eligible")
  .sort((a, b) => a.grade - b.grade || a.lessonId.localeCompare(b.lessonId));

const result = {
  generatedAt: "deterministic-no-wall-clock",
  generatedFrom: [
    "content/courses/**/lessons/*.json",
    "scripts/engine-capabilities.json",
    "scripts/flagship-tier.mjs",
    "scripts/audit/excellence-dispositions-s126.json"
  ],
  // Portable across sealed extraction directory names; this report is rooted at the repository itself.
  repositoryRoot: ".",
  session: 126,
  definitions: {
    strongCausalStep: "widget capability manip >= 2 and consequence >= 2",
    explorationStep: "a widget step whose authored kind is interactive",
    causalSpine: "a lesson has at least one exploration step served by a strong causal engine",
    honestRestingTier: "target experience tier after exact-fit work; B/C-intentional are valid when prediction or manipulation would duplicate/change the assessed action"
  },
  summary: {
    liveK8Backlog: liveBacklog.length,
    classified: records.length,
    unreviewed: 0,
    dispositions: Object.fromEntries([...new Set(records.map((row) => row.candidateDisposition))].sort().map((value) => [value, records.filter((row) => row.candidateDisposition === value).length])),
    honestRestingTiers: Object.fromEntries([...new Set(records.map((row) => row.honestRestingTier))].sort().map((value) => [value, records.filter((row) => row.honestRestingTier === value).length])),
    representationMissing: records.filter((row) => row.representationPresent === "no").length,
    representationPartial: records.filter((row) => row.representationPresent === "partial").length,
    honestPredictionCeilings: honestPredictionCeilings.length
  },
  causalCoverage: coverage(all),
  honestPredictionCeilings,
  undrawnRepresentationCandidates: undrawnCandidates(all),
  records
};

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");

const csvFields = [
  "lessonId",
  "grade",
  "course",
  "title",
  "currentTier",
  "currentScore",
  "interactionIntent",
  "representationRequired",
  "representationPresent",
  "predictionEligibility",
  "candidateDisposition",
  "candidateEngineOrExtension",
  "honestRestingTier",
  "remedialRoutes",
  "currentWidgets",
  "assessedClaimEvidence",
  "exactFitEvidence",
  "misconceptionStatus",
  "authoredWrongPathCount",
  "verificationOwner",
  "sourcePath"
];
const csvRows = records.map((row) => ({
  ...row,
  remedialRoutes: row.remedialRisk.routes,
  assessedClaimEvidence: row.assessedClaimEvidence.map((item) => `${item.stepId} ${item.prompt}`),
  misconceptionStatus: row.misconceptionReachability.status,
  authoredWrongPathCount: row.misconceptionReachability.authoredWrongPaths.length
}));
writeFileSync(OUT_CSV, [csvFields.join(","), ...csvRows.map((row) => csvFields.map((field) => csvCell(row[field])).join(","))].join("\n") + "\n");

const pct = (value) => `${(value * 100).toFixed(1)}%`;
const countBy = (field) => [...new Set(records.map((row) => row[field]))].sort().map((value) => `| ${value} | ${records.filter((row) => row[field] === value).length} |`).join("\n");
const md = [];
md.push("# EXCELLENCE_BACKLOG_S126 — generated truth and disposition ledger");
md.push("");
md.push("Regenerate with `npm run audit:excellence`. This report is generated from live lesson JSON, the live tier compiler, the engine capability table, and the reviewed Session-126 disposition policy. It is a work queue only where the disposition says work remains; an honest Tier B or C-intentional is not a defect.");
md.push("");
md.push("## Gate summary");
md.push("");
md.push(`- Live K–8 C/D queue: **${liveBacklog.length}**`);
md.push(`- Classified: **${records.length}**`);
md.push("- UNREVIEWED: **0**");
md.push(`- Representation absent: **${result.summary.representationMissing}**; partial: **${result.summary.representationPartial}**`);
md.push(`- Honest prediction ceilings currently detected outside the C/D queue: **${honestPredictionCeilings.length}**`);
md.push("");
md.push("## Candidate disposition");
md.push("");
md.push("| disposition | lessons |");
md.push("|---|--:|");
md.push(countBy("candidateDisposition"));
md.push("");
md.push("## Honest resting tier");
md.push("");
md.push("| tier | lessons |");
md.push("|---|--:|");
md.push(countBy("honestRestingTier"));
md.push("");
md.push("## Step-weighted causal coverage");
md.push("");
md.push("The letter tier uses lesson-level maxima for triage. These measures keep the denominator visible.");
md.push("");
md.push("| band | causal widget steps | exploration causal coverage | lessons with causal spine |");
md.push("|---|---:|---:|---:|");
for (const row of result.causalCoverage) {
  md.push(`| ${row.band} | ${row.causalWidgetSteps}/${row.widgetSteps} (${pct(row.widgetCausalCoverage)}) | ${row.causalExplorationSteps}/${row.explorationSteps} (${pct(row.explorationCausalCoverage)}) | ${row.lessonsWithCausalSpine}/${row.lessonsWithExploration} (${pct(row.causalSpineCoverage)}) |`);
}
md.push("");
md.push("## Honest prediction ceilings");
md.push("");
if (!honestPredictionCeilings.length) md.push("- none");
else for (const row of honestPredictionCeilings) md.push(`- **${row.lessonId}** (G${row.grade}, B${row.score}): ${row.status} — ${row.reason}`);
md.push("");
md.push("## Reviewed queue");
md.push("");
md.push("| lesson | current | action | representation | prediction | target | candidate | remedial routes |");
md.push("|---|---:|---|---|---|---|---|---:|");
for (const row of records) {
  md.push(`| ${row.lessonId} — ${row.title} (G${row.grade}) | ${row.currentTier}${row.currentScore} | ${row.candidateDisposition} | ${row.representationRequired}: ${row.representationPresent} | ${row.predictionEligibility} | ${row.honestRestingTier} | ${row.candidateEngineOrExtension} | ${row.remedialRisk.routes} |`);
}
md.push("");
md.push("## Representation-presence audit");
md.push("");
md.push(`The strict whole-corpus text scan found **${result.undrawnRepresentationCandidates.length}** candidates where a graded answer surface names a graph/table/ruler/grid/number line/figure without a step-level rendered object. These are candidates, not automatic defects; the 64 reviewed rows above are authoritative for this phase.`);
md.push("");
for (const row of result.undrawnRepresentationCandidates.slice(0, 80)) md.push(`- ${row.lessonId}/${row.stepId} [${row.widgetType}] — ${row.evidence}`);
md.push("");
md.push("## Conversion acceptance rule");
md.push("");
md.push("No row marked reuse/extend/build/multi-engine is conversion-ready until its exact-fit contract is satisfied, every authored wrong path is mapped to a reachable state (or ledgered as retired), the answer is independently re-derived, and non-target lesson fields pass hash proof.");
md.push("");
md.push("**No authored lesson content was changed by this compiler.**");
writeFileSync(OUT_MD, md.join("\n") + "\n");

console.log(
  `excellence-s126: ${records.length}/${liveBacklog.length} classified, 0 unreviewed | ` +
    `dispositions ${JSON.stringify(result.summary.dispositions)} | ` +
    `representations no=${result.summary.representationMissing} partial=${result.summary.representationPartial} | ` +
    `honest prediction ceilings=${honestPredictionCeilings.length}`
);
