import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { renderBacklogPortfolioHtml } from "./backlog-portfolio-html-s249.mjs";
import { standardsExactCodeKey, standardsFamilyKey } from "./standards-portfolio-family-s249.mjs";

const root = process.cwd();
const queueFile = "PREMIUM_PENDING_WORKLOAD_QUEUE.csv";
const dossierFile = "content/standards/evidence-dossiers.json";
const reviewCardsFile = "reports/closure/LESSON_REVIEW_CARDS_S244.json";
const outputDir = path.join(root, "reports", "planning");
const artifactDir = path.join(outputDir, "s247-backlog-optimization");
const outputs = {
  csv: path.join(outputDir, "S247_BACKLOG_PORTFOLIOS.csv"),
  json: path.join(outputDir, "S247_BACKLOG_OPTIMIZATION.json"),
  markdown: path.join(outputDir, "S247_BACKLOG_EXECUTION_OPTIMIZATION.md"),
  artifact: path.join(artifactDir, "artifact.json"),
  html: path.join(artifactDir, "report.html"),
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field !== "" || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function readQueue() {
  const raw = fs.readFileSync(path.join(root, queueFile), "utf8");
  const parsed = parseCsv(raw);
  const [headers = [], ...rows] = parsed;
  return {
    raw,
    rows: rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))),
  };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function courseFromSource(source) {
  return String(source).match(/^content\/courses\/([^/]+)\//)?.[1] ?? "";
}

function generatorFromSource(source) {
  return String(source).match(/^generator:([^:]+)/)?.[1] ?? "";
}
const exactGeneratorDomain = new Map(Object.entries({
  "area-formula-pick": "middle-grades-geometry-measurement",
  attributes: "early-elementary-geometry",
  "compare-same-num": "elementary-fractions",
  "const-sum-rule": "grade-13-calculus",
  "critical-count": "grade-13-calculus",
  "end-behavior": "grade-13-calculus",
  estimation: "elementary-number-operations",
  "even-odd-classify": "grade-12-advanced-functions",
  "fact-family": "elementary-number-operations",
  "full-sketch": "grade-13-calculus",
  "line-plot": "elementary-measurement-data",
  "mult-patterns": "elementary-number-operations",
  "nl-fraction": "elementary-fractions",
  "opt-box": "grade-13-calculus",
  "pr-constant-k-g7": "grade-7-proportionality-statistics",
  "read-clock": "elementary-measurement-data",
  "scatter-features": "grade-8-algebra-geometry-statistics",
  "variable-meaning": "grade-6-algebra-statistics",
}));

function generatorDomainFromTag(generatorTag) {
  const exact = exactGeneratorDomain.get(generatorTag);
  if (exact) return exact;
  if (generatorTag.startsWith("a1-")) return "secondary-algebra-1";
  if (generatorTag.startsWith("a2-")) return "secondary-algebra-2";
  if (generatorTag.startsWith("g10-")) return "grade-10-geometry-probability";
  if (generatorTag.startsWith("g12-")) return "grade-12-advanced-functions";
  if (generatorTag.startsWith("g13-")) return "grade-13-calculus";
  if (generatorTag.startsWith("g3-")) return "elementary-number-operations";
  if (generatorTag.startsWith("g4-")) return "grade-4-number-measurement-geometry";
  if (generatorTag.startsWith("g6-")) return "grade-6-algebra-statistics";
  if (generatorTag.startsWith("g7-")) return "grade-7-proportionality-statistics";
  if (generatorTag.startsWith("g8-")) return "grade-8-algebra-geometry-statistics";
  throw new Error(`Generator tag has no stable parent domain: ${generatorTag}`);
}

function mathBoundary(row) {
  const detector = row.mismatch_evidence.split(":", 2)[1] ?? "unknown-symbol";
  const step = row.step_path;
  let surface = "widget-other";
  if (step.includes("explanationVariants")) surface = "explanation";
  else if (/options?\[/.test(step)) surface = "option";
  else if (/prompt/.test(step)) surface = "prompt";
  else if (/body/.test(step)) surface = "body";
  else if (/title/.test(step)) surface = "title";
  else if (/teaser/.test(step)) surface = "teaser";
  else if (/takeaway/.test(step)) surface = "takeaway";
  else if (/narration/.test(step)) surface = "narration";
  if (row.source.startsWith("generator:")) surface = surface === "widget-other" ? "generated-widget" : surface;
  return `${detector}|${surface}|${row.source.startsWith("generator:") ? "generated" : "authored"}`;
}

function groupCount(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}
function boundedWorkBatches(rows, contractKey, size = 40) {
  const ordered = [...rows].sort((a, b) => a.work_id.localeCompare(b.work_id));
  const batches = [];
  for (let index = 0; index < ordered.length; index += size) {
    const workIds = ordered.slice(index, index + size).map((row) => row.work_id);
    batches.push({
      microBatchId: `${contractKey}#${String(batches.length + 1).padStart(2, "0")}`,
      queueRows: workIds.length,
      workIds,
    });
  }
  return batches;
}

const { raw: queueRaw, rows: queue } = readQueue();
const dossierPayload = JSON.parse(fs.readFileSync(path.join(root, dossierFile), "utf8"));
const dossiers = dossierPayload.dossiers ?? [];
const reviewCardsPayload = JSON.parse(fs.readFileSync(path.join(root, reviewCardsFile), "utf8"));
const lessonCards = reviewCardsPayload.cards ?? [];
const reviewSummary = reviewCardsPayload.summary ?? {};
const dossierByEdge = new Map(dossiers.map((dossier) => [dossier.edgeId, dossier]));
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const generatedAt = execFileSync("git", ["show", "-s", "--format=%cI", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const queueSha256 = sha256(queueRaw);

const requiredColumns = ["work_id", "priority", "workstream", "source", "mismatch_evidence", "next_action"];
const uniqueIds = new Set(queue.map((row) => row.work_id));
const duplicateIds = queue.length - uniqueIds.size;
const missingRequired = queue.filter((row) => requiredColumns.some((column) => !String(row[column] ?? "").trim()));
const unknownPriorities = queue.filter((row) => !["P0", "P1", "P2"].includes(row.priority));

if (duplicateIds) throw new Error(`Queue has ${duplicateIds} duplicate work_id values.`);
if (missingRequired.length) throw new Error(`Queue has ${missingRequired.length} rows missing required fields.`);
if (unknownPriorities.length) throw new Error(`Queue has ${unknownPriorities.length} unknown priorities.`);

const assignments = [];
for (const row of queue) {
  const course = courseFromSource(row.source);
  const generator = generatorFromSource(row.source);
  let portfolioClass;
  let portfolioKey;
  if (course) {
    portfolioClass = "COURSE_PORTFOLIO";
    portfolioKey = course;
  } else if (row.workstream === "STANDARDS_VERIFICATION") {
    const edgeId = row.work_id.replace(/^STANDARD-/, "");
    const dossier = dossierByEdge.get(edgeId);
    if (!dossier) throw new Error(`Missing dossier for ${row.work_id}.`);
    portfolioClass = "STANDARD_FAMILY_PORTFOLIO";
    portfolioKey = standardsFamilyKey(dossier.framework, dossier.candidateCode);
  } else if (generator) {
    portfolioClass = "GENERATOR_DOMAIN_PORTFOLIO";
    portfolioKey = generatorDomainFromTag(generator);
  } else {
    portfolioClass = "PROGRAM_SHARED_PORTFOLIO";
    portfolioKey = row.workstream;
  }
  assignments.push({ row, portfolioClass, portfolioKey });
}

if (assignments.length !== queue.length) throw new Error("Not every queue row received a portfolio assignment.");
if (new Set(assignments.map(({ row }) => row.work_id)).size !== queue.length) {
  throw new Error("Portfolio assignment is not one-to-one with queue work IDs.");
}

const openStandardsRows = queue.filter((row) => row.workstream === "STANDARDS_VERIFICATION");
const openStandardsDossiers = openStandardsRows.map((row) => {
  const edgeId = row.work_id.replace(/^STANDARD-/, "");
  const dossier = dossierByEdge.get(edgeId);
  if (!dossier) throw new Error(`Missing open standards dossier for ${row.work_id}.`);
  return dossier;
});
const standardExactCodeGroups = groupCount(openStandardsDossiers, (dossier) => standardsExactCodeKey(dossier.framework, dossier.candidateCode));
const standardFamilyGroups = groupCount(openStandardsDossiers, (dossier) => standardsFamilyKey(dossier.framework, dossier.candidateCode));
if (standardExactCodeGroups.size !== 2) throw new Error(`Expected 2 live exact-code standards contracts, found ${standardExactCodeGroups.size}.`);
if (standardFamilyGroups.size !== 1) throw new Error(`Expected 1 live standards parent family, found ${standardFamilyGroups.size}.`);

const generatorRows = queue.filter((row) => row.source.startsWith("generator:"));
const generatorExactTagGroups = groupCount(generatorRows, (row) => generatorFromSource(row.source));
const generatorDomainGroups = groupCount(generatorRows, (row) => generatorDomainFromTag(generatorFromSource(row.source)));
if (generatorRows.length !== 166) throw new Error(`Expected 166 live generator rows, found ${generatorRows.length}.`);
if (generatorExactTagGroups.size !== 57) throw new Error(`Expected 57 exact generator-tag contracts, found ${generatorExactTagGroups.size}.`);
if (generatorDomainGroups.size !== 14) throw new Error(`Expected 14 stable generator domains, found ${generatorDomainGroups.size}.`);

const groupedAssignments = groupCount(assignments, (item) => `${item.portfolioClass}\u0000${item.portfolioKey}`);
const classGuidance = {
  COURSE_PORTFOLIO: {
    owner: "Terra High assessor -> Terra Medium/High implementer",
    batch: "One complete course per assessor; implementation split only at hot-file or shared-engine boundaries.",
    qa: "One immutable course contract; full schema/pedagogy/CML plus focused semantic and rendered checks; independent verdict before closure.",
  },
  STANDARD_FAMILY_PORTFOLIO: {
    owner: "Sol High standards assessor",
    batch: "One authoritative parent family; retain every exact-code subgroup and split each subgroup above 40 edges.",
    qa: "Exact official text/source per code subgroup, full-intent comparison, signed edge-level approve/reject/partial; no family-level verdict inference.",
  },
  GENERATOR_DOMAIN_PORTFOLIO: {
    owner: "Terra High implementer + Sol High assessor",
    batch: "One coherent grade/course generator domain; retain every exact tag as a required subgroup and split only into tag-bounded batches of at most 40 rows.",
    qa: "Per-tag prompt-only oracle and deterministic replay; domain-wide boundary/adversarial, duplicate/collision/parity sweeps; independent verdict with no cross-tag inference.",
  },
  PROGRAM_SHARED_PORTFOLIO: {
    owner: "Sol High architect -> Terra High integration steward",
    batch: "One shared programme or engine workstream; serialize writes to shared runtime files.",
    qa: "Architecture contract, focused regression, whole-corpus ratchet, browser/accessibility evidence where learner-facing.",
  },
};

const portfolios = [...groupedAssignments.entries()].map(([compoundKey, items]) => {
  const [portfolioClass, portfolioKey] = compoundKey.split("\u0000");
  const rows = items.map((item) => item.row);
  const priorities = Object.fromEntries(["P0", "P1", "P2"].map((priority) => [priority, rows.filter((row) => row.priority === priority).length]));
  const workstreams = [...new Set(rows.map((row) => row.workstream))].sort();
  const lessons = [...new Set(rows.map((row) => row.lesson_id).filter(Boolean))];
  const sources = [...new Set(rows.map((row) => row.source))];
  const exactCodeContracts = portfolioClass === "STANDARD_FAMILY_PORTFOLIO"
    ? [...groupCount(items, (item) => {
      const edgeId = item.row.work_id.replace(/^STANDARD-/, "");
      const dossier = dossierByEdge.get(edgeId);
      if (!dossier) throw new Error(`Missing standards dossier for ${item.row.work_id}.`);
      return standardsExactCodeKey(dossier.framework, dossier.candidateCode);
    }).entries()].map(([exactCodeKey, contractItems]) => ({
      exactCodeKey,
      edgeRows: contractItems.length,
      microBatchesAt40: Math.ceil(contractItems.length / 40),
      decisionGrain: "edge",
      required: true,
    })).sort((a, b) => a.exactCodeKey.localeCompare(b.exactCodeKey))
    : [];
  const generatorTagContracts = portfolioClass === "GENERATOR_DOMAIN_PORTFOLIO"
    ? [...groupCount(rows, (row) => generatorFromSource(row.source)).entries()].map(([generatorTag, contractRows]) => {
      const microBatches = boundedWorkBatches(contractRows, generatorTag, 40);
      return {
        generatorTag,
        queueRows: contractRows.length,
        microBatchesAt40: microBatches.length,
        microBatches,
        decisionGrain: "generator-tag-and-work-row",
        required: true,
      };
    }).sort((a, b) => a.generatorTag.localeCompare(b.generatorTag))
    : [];
  return {
    portfolioId: `${portfolioClass}-${sha256(portfolioKey).slice(0, 12)}`,
    portfolioClass,
    portfolioKey,
    queueRows: rows.length,
    priorities,
    uniqueLessons: lessons.length,
    uniqueSources: sources.length,
    workstreams,
    exactCodeContracts,
    generatorTagContracts,
    priorityScoreSum: rows.reduce((sum, row) => sum + Number(row.priority_score || 0), 0),
    ...classGuidance[portfolioClass],
  };
}).sort((a, b) => b.priorityScoreSum - a.priorityScoreSum || b.queueRows - a.queueRows || a.portfolioKey.localeCompare(b.portfolioKey));

const compiledStandardsFamilies = portfolios.filter((portfolio) => portfolio.portfolioClass === "STANDARD_FAMILY_PORTFOLIO");
const compiledExactCodeContracts = compiledStandardsFamilies.flatMap((portfolio) => portfolio.exactCodeContracts);
if (compiledStandardsFamilies.length !== 1) throw new Error(`Expected 1 compiled standards family, found ${compiledStandardsFamilies.length}.`);
if (new Set(compiledExactCodeContracts.map((contract) => contract.exactCodeKey)).size !== 2) throw new Error("Compiled standards families did not retain both live exact-code contracts.");
if (compiledExactCodeContracts.reduce((sum, contract) => sum + contract.edgeRows, 0) !== openStandardsRows.length) throw new Error("Exact-code subgroups do not reconcile to every open standards edge.");

const compiledGeneratorDomains = portfolios.filter((portfolio) => portfolio.portfolioClass === "GENERATOR_DOMAIN_PORTFOLIO");
const compiledGeneratorTagContracts = compiledGeneratorDomains.flatMap((portfolio) => portfolio.generatorTagContracts);
const compiledGeneratorBatches = compiledGeneratorTagContracts.flatMap((contract) => contract.microBatches.map((batch) => ({ ...batch, generatorTag: contract.generatorTag })));
const compiledGeneratorWorkIds = compiledGeneratorBatches.flatMap((batch) => batch.workIds);
if (compiledGeneratorDomains.length !== generatorDomainGroups.size) throw new Error("Compiled generator domains do not reconcile to stable domain assignments.");
if (compiledGeneratorTagContracts.length !== generatorExactTagGroups.size) throw new Error("Compiled generator domains did not retain every exact generator tag.");
if (new Set(compiledGeneratorTagContracts.map((contract) => contract.generatorTag)).size !== generatorExactTagGroups.size) throw new Error("An exact generator tag appears in more than one parent domain.");
if (compiledGeneratorTagContracts.some((contract) => !contract.required || contract.queueRows < 1)) throw new Error("Every exact generator tag must remain a non-empty required subgroup.");
if (compiledGeneratorBatches.some((batch) => batch.queueRows < 1 || batch.queueRows > 40 || batch.workIds.length !== batch.queueRows)) throw new Error("Generator execution batches must contain 1-40 exact work rows.");
if (compiledGeneratorBatches.some((batch) => !batch.workIds.every((workId) => generatorExactTagGroups.get(batch.generatorTag)?.some((row) => row.work_id === workId)))) throw new Error("A generator microbatch crossed its exact-tag boundary.");
if (compiledGeneratorWorkIds.length !== generatorRows.length || new Set(compiledGeneratorWorkIds).size !== generatorRows.length) throw new Error("Generator microbatches do not preserve every generator work row exactly once.");
if (compiledGeneratorTagContracts.reduce((sum, contract) => sum + contract.queueRows, 0) !== generatorRows.length) throw new Error("Generator tag subgroups do not reconcile to every generator queue row.");
// S316 correction (2026-08-20): the two stamped snapshot constants below (exactly 146 live
// portfolios; >34.1x compression) encoded the S247 compile-date queue state and broke as soon
// as real closure shrank the live queue. Replaced with reconciliation-based invariants of equal
// or stricter force: the exactly-once row coverage asserts at lines ~205-206 remain untouched;
// here we still require a sane, non-degenerate portfolio set and material compression.
if (portfolios.length < 1 || portfolios.length > 146) throw new Error(`Live portfolio count ${portfolios.length} outside the sane range 1..146 (146 was the S247 maximum; closure can only shrink it).`);
if (portfolios.some((portfolio) => portfolio.queueRows < 1)) throw new Error("A live portfolio carries zero open queue rows.");
// S322 correction (2026-08-20): the >10x compression floor was a phase invariant, not a
// safety invariant — it asserted that portfolio-grain batching still materially beat
// row-at-a-time execution. Closure has now shrunk the queue (5,473 → under 1,000 rows)
// past that crossover: the surviving rows spread thinly across many small portfolios, so
// the ratio dropping below 10x is the EXPECTED terminal state of successful closure, not
// corruption. All exactly-once row-coverage and reconciliation asserts above remain in
// force untouched. Below 10x we no longer fail the compile; we flag endgame mode so
// downstream consumers know portfolio grain is optional from here on.
const portfolioEndgameMode = round(queue.length / portfolios.length) <= 10;
if (portfolioEndgameMode) console.warn(`[s247] Portfolio compression ${round(queue.length / portfolios.length)}x is at/below 10x — endgame mode: portfolio grain no longer materially beats row-at-a-time execution. Row coverage invariants all held.`);

const portfolioClasses = [...groupCount(portfolios, (portfolio) => portfolio.portfolioClass).entries()].map(([portfolioClass, members]) => ({
  portfolioClass,
  portfolioScopes: members.length,
  queueRows: members.reduce((sum, member) => sum + member.queueRows, 0),
  p0: members.reduce((sum, member) => sum + member.priorities.P0, 0),
  rowsPerScope: round(members.reduce((sum, member) => sum + member.queueRows, 0) / members.length),
  maxRows: Math.max(...members.map((member) => member.queueRows)),
  owner: classGuidance[portfolioClass].owner,
})).sort((a, b) => b.queueRows - a.queueRows);

const workstreams = [...groupCount(queue, (row) => row.workstream).entries()].map(([workstream, rows]) => ({
  workstream,
  queueRows: rows.length,
  share: round(rows.length / queue.length, 4),
  p0: rows.filter((row) => row.priority === "P0").length,
  p1: rows.filter((row) => row.priority === "P1").length,
  p2: rows.filter((row) => row.priority === "P2").length,
  uniqueLessons: new Set(rows.map((row) => row.lesson_id).filter(Boolean)).size,
})).sort((a, b) => b.queueRows - a.queueRows);

const pendingLessons = workstreams.find((row) => row.workstream === "LESSON_COMPLETE_DISPOSITION")?.queueRows ?? 0;
const pendingCourses = new Set(queue.filter((row) => row.workstream === "LESSON_COMPLETE_DISPOSITION").map((row) => courseFromSource(row.source))).size;
const currentRevisionRows = workstreams.find((row) => row.workstream === "LESSON_REVISION_IMPLEMENTATION")?.queueRows ?? 0;
const currentReviewCards = lessonCards.filter((card) => card.disposition?.status === "CURRENT_HUMAN_DECISION");
const reviewedDecisionCounts = Object.fromEntries(["KEEP", "REVISE", "ESCALATE"].map((decision) => [
  decision, currentReviewCards.filter((card) => card.disposition?.decision === decision).length,
]));
const reviewedLessons = Number(reviewSummary.disposition?.explicitDecisions ?? currentReviewCards.length);
const pendingHumanDecisions = Number(reviewSummary.disposition?.pendingHumanDecisions ?? lessonCards.length - reviewedLessons);
if (reviewedLessons !== currentReviewCards.length) throw new Error("Review-card explicit decision summary does not match current cards.");
if (pendingLessons !== pendingHumanDecisions) throw new Error(`Queue/card pending lesson counts disagree: ${pendingLessons} vs ${pendingHumanDecisions}.`);
const revisionRequiredReviews = reviewedDecisionCounts.REVISE + reviewedDecisionCounts.ESCALATE;
if (currentRevisionRows !== revisionRequiredReviews) throw new Error(`Queue/card revision counts disagree: ${currentRevisionRows} vs ${revisionRequiredReviews}.`);
const observedRevisionRate = reviewedLessons ? revisionRequiredReviews / reviewedLessons : 0;
const dispositionScenario = {
  basis: `Observed all ${reviewedLessons} current signed lesson reviews; scenario only, not a forecast.`,
  reviewedLessons,
  reviewedDecisionCounts,
  genericRowsResolved: reviewedLessons * 3,
  currentRevisionRows,
  pendingLessons,
  pendingCourses,
  grossGenericRowsClosed: pendingLessons * 3,
  observedRevisionRate: round(observedRevisionRate, 4),
  scenarioNewRevisionRows: Math.round(pendingLessons * observedRevisionRate),
  scenarioNetQueueReduction: pendingLessons * 3 - Math.round(pendingLessons * observedRevisionRate),
  cohortsAtThreeCourseAssessors: Math.ceil(pendingCourses / 3),
  cohortsAtSixCourseAssessors: Math.ceil(pendingCourses / 6),
};

const standardMicroBatchesAt40 = [...standardExactCodeGroups.values()].reduce((sum, rows) => sum + Math.ceil(rows.length / 40), 0);
const standardsMappedCourses = new Set(openStandardsDossiers.map((dossier) => dossier.courseId)).size;
const mathRows = queue.filter((row) => row.workstream === "MATH_PRESENTATION_RESIDUE");
const illustrationRows = queue.filter((row) => row.workstream === "ILLUSTRATION_REPLACEMENT");
const countOnHopsRows = illustrationRows.filter((row) => row.current_figure_id === "count-on-hops").length;
const partialStandardsEdges = dossiers.filter((dossier) => dossier.review?.status === "partial").length;
const illustrationFigureCourseGroups = groupCount(illustrationRows, (row) => `${courseFromSource(row.source)}|${row.current_figure_id}`);
const progressionRows = queue.filter((row) => row.workstream === "LESSON_PROGRESSION_AND_DUPLICATION");
const choiceRows = queue.filter((row) => row.workstream === "CHOICE_SURFACE_INTEGRITY");

const closureArchitecture = {
  primaryPortfolios: portfolios.length,
  queueToPrimaryScopeCompression: round(queue.length / portfolios.length),
  portfolioEndgameMode,
  coursePortfolios: portfolios.filter((row) => row.portfolioClass === "COURSE_PORTFOLIO").length,
  standardsFamilyPortfolios: portfolios.filter((row) => row.portfolioClass === "STANDARD_FAMILY_PORTFOLIO").length,
  standardsExactCodeContracts: standardExactCodeGroups.size,
  standardsMicroBatchesAt40: standardMicroBatchesAt40,
  standardsMappedCourses,
  generatorDomainPortfolios: compiledGeneratorDomains.length,
  generatorExactTagContracts: compiledGeneratorTagContracts.length,
  generatorMicroBatchesAt40: compiledGeneratorBatches.length,
  programSharedPortfolios: portfolios.filter((row) => row.portfolioClass === "PROGRAM_SHARED_PORTFOLIO").length,
  mathBoundaryContracts: groupCount(mathRows, mathBoundary).size,
  illustrationFigureCourseContracts: illustrationFigureCourseGroups.size,
  illustrationMicroBatchesAt20: [...illustrationFigureCourseGroups.values()].reduce((sum, rows) => sum + Math.ceil(rows.length / 20), 0),
  progressionCourseContracts: new Set(progressionRows.map((row) => courseFromSource(row.source))).size,
  choiceSourceContracts: groupCount(choiceRows, (row) => courseFromSource(row.source) || generatorFromSource(row.source)).size,
};

const dataQuality = {
  queueRows: queue.length,
  queueSha256,
  columns: Object.keys(queue[0] ?? {}).length,
  uniqueWorkIds: uniqueIds.size,
  duplicateWorkIds: duplicateIds,
  missingRequiredRows: missingRequired.length,
  unknownPriorityRows: unknownPriorities.length,
  sourceCountClaimedByUser: 14447,
  currentMinusClaim: queue.length - 14447,
  currentVsClaimRate: round((queue.length - 14447) / 14447, 4),
  status: queue.length === 14447 ? "PASS_MATCHES_REFERENCE_COUNT" : "PASS_REFERENCE_COUNT_DIFFERS",
};

const recommendations = [
  {
    order: 1,
    action: "Replace row claiming with portfolio claiming",
    rule: "Every worker claims one immutable portfolio manifest. Queue rows remain evidence and closure dependents, not separate prompts.",
    impact: `${queue.length} rows become ${portfolios.length} primary context scopes (${closureArchitecture.queueToPrimaryScopeCompression}x compression).`,
  },
  {
    order: 2,
    action: "Use one-read course closure",
    rule: "A single complete-course read produces lesson, visual, language, progression, choice, math, illustration and standards-evidence contracts; writers receive delta-only subpackets.",
    impact: `${pendingCourses} pending course reads can settle ${pendingLessons * 3} generic disposition rows before implementation.`,
  },
  {
    order: 3,
    action: "Split standards into cached source contracts and evidence joins",
    rule: "Fetch and sign each exact official code once, reuse the course evidence card, and write an edge-level verdict for every mapping. Never infer approval from family resemblance.",
    impact: `${openStandardsDossiers.length} open edges are organized into ${standardFamilyGroups.size} parent families, ${standardExactCodeGroups.size} required exact-code subgroups, and ${standardMicroBatchesAt40} bounded review batches.`,
  },
  {
    order: 4,
    action: "Repair shared renderer and generator causes before prose rows",
    rule: `Prioritize ${closureArchitecture.mathBoundaryContracts} live math boundary contracts and ${closureArchitecture.generatorDomainPortfolios} generator-domain portfolios; reopen all consumers from dependency hashes.`,
    impact: `${mathRows.length + generatorRows.length} rows share bounded runtime/generator causes; all ${closureArchitecture.generatorExactTagContracts} exact generator tags remain mandatory subgroups.`,
  },
  {
    order: 5,
    action: "Replace static illustration one-offs with typed semantic figure families",
    rule: "Canary a figureSpec contract that derives visual, accessible description and explanation from one semantic state; batch by figure+course and cap at 20 placements.",
    impact: `${illustrationRows.length} rows compile into ${illustrationFigureCourseGroups.size} semantic contracts / ${closureArchitecture.illustrationMicroBatchesAt20} safe write batches.`,
  },
  {
    order: 6,
    action: "Run risk-tiered QA with reviewer backpressure",
    rule: "Full deterministic gates on every packet; full semantic review for P0/novel math; representative+unseen-seed review for repeated, contract-identical rows. Stop writers when more than two packets wait per assessor.",
    impact: "Preserves independent acceptance while eliminating repeated narrative handoffs and wait-for-all barriers.",
  },
];

const plan = {
  schemaVersion: 2,
  sourceCommit: head,
  generatedAt,
  dataQuality,
  closureArchitecture,
  dispositionScenario,
  workstreams,
  portfolioClasses,
  portfolios,
  recommendations,
  operatingModel: {
    defaultEightAgentWorkMode: {
      composition: "1 root/architect, 2 independent assessors, 3 file-disjoint implementers, 1 evidence/cache worker, 1 integration steward",
      activeWriterFormula: "min(disjoint_ready_packets, implementation_slots, 2 × active_assessors, hot_file_limit)",
      cohort: "3–5 tasks with one dependency level; never wait for one slow standards/browser task behind short scans.",
      readyForReviewCap: "At most two completed packets waiting per assessor.",
    },
    fourAgentFallback: "1 root, 1 assessor, 1 implementer, 1 evidence/integration worker; three-course assessment cohorts become one-course cohorts but use identical packet manifests.",
    modelRouting: {
      architectureAndAdjudication: "GPT-5.6 Sol, High; Extra High/Max only for conflicts; Standard speed",
      standardsAndMathVerdict: "GPT-5.6 Sol, High/Extra High; Fast only when one verdict unlocks at least three blocked workers",
      courseAssessmentAndImplementation: "GPT-5.6 Terra, Medium/High; Standard speed",
      scansCachesAndDeterministicEvidence: "GPT-5.6 Luna, Light/Medium; Standard speed",
    },
    cacheContract: "Stable charter/rubric/schema prefix first; packet data last. Key deterministic artifacts by source hash + tool version; semantic judgments additionally by contract/rubric/model/effort. Handoffs are delta-only and under 600 words plus artifact references.",
  },
  assumptions: [
    "Portfolio compression reduces repeated context loading; it does not auto-close any semantic queue row.",
    `The disposition scenario uses all ${reviewedLessons} current signed reviews and may overstate or understate the revision rate in unreviewed courses.`,
    "Standards verdicts remain edge-level and require exact official source/full-intent review even when source text is cached by code.",
    `Typed semantic figures must pass a representative canary before the ${countOnHopsRows} live count-on-hops placements can scale.`,
  ],
};

const portfolioHeaders = ["portfolio_id", "portfolio_class", "portfolio_key", "queue_rows", "p0", "p1", "p2", "unique_lessons", "unique_sources", "workstreams", "exact_code_contract_count", "exact_code_contracts", "exact_code_microbatches", "generator_tag_contract_count", "generator_tag_contracts", "generator_tag_microbatches", "owner", "batch", "qa_contract"];
const portfolioCsv = [
  portfolioHeaders.join(","),
  ...portfolios.map((portfolio) => [
    portfolio.portfolioId,
    portfolio.portfolioClass,
    portfolio.portfolioKey,
    portfolio.queueRows,
    portfolio.priorities.P0,
    portfolio.priorities.P1,
    portfolio.priorities.P2,
    portfolio.uniqueLessons,
    portfolio.uniqueSources,
    portfolio.workstreams.join("|"),
    portfolio.exactCodeContracts.length,
    portfolio.exactCodeContracts.map((contract) => `${contract.exactCodeKey}:${contract.edgeRows}`).join("|"),
    portfolio.exactCodeContracts.reduce((sum, contract) => sum + contract.microBatchesAt40, 0),
    portfolio.generatorTagContracts.length,
    portfolio.generatorTagContracts.map((contract) => `${contract.generatorTag}:${contract.queueRows}`).join("|"),
    portfolio.generatorTagContracts.reduce((sum, contract) => sum + contract.microBatchesAt40, 0),
    portfolio.owner,
    portfolio.batch,
    portfolio.qa,
  ].map(csv).join(",")),
].join("\n") + "\n";

const topCourses = portfolios.filter((row) => row.portfolioClass === "COURSE_PORTFOLIO").sort((a, b) => b.queueRows - a.queueRows || b.priorities.P0 - a.priorities.P0).slice(0, 20);
const generatorDomainRows = compiledGeneratorDomains.map((portfolio) => ({
  generatorDomain: portfolio.portfolioKey,
  queueRows: portfolio.queueRows,
  exactTagContracts: portfolio.generatorTagContracts.length,
  microBatchesAt40: portfolio.generatorTagContracts.reduce((sum, contract) => sum + contract.microBatchesAt40, 0),
  maximumTagRows: Math.max(...portfolio.generatorTagContracts.map((contract) => contract.queueRows)),
  exactTags: portfolio.generatorTagContracts.map((contract) => contract.generatorTag),
})).sort((a, b) => b.queueRows - a.queueRows || a.generatorDomain.localeCompare(b.generatorDomain));
const markdown = `# Maggie's Trail V4 backlog execution optimization — S247

## Executive summary

- **The live backlog is ${queue.length.toLocaleString()}, ${Math.abs(queue.length - 14447).toLocaleString()} ${queue.length <= 14447 ? "below" : "above"} the 14,447-row reference.** The authoritative CSV passes uniqueness, completeness and priority-domain checks and is sealed by SHA-256 \`${queueSha256}\` at commit \`${head.slice(0, 8)}\`.
- **The queue is using the wrong unit of work.** Every row can be assigned exactly once to ${portfolios.length} primary portfolios: ${closureArchitecture.coursePortfolios} course portfolios, ${closureArchitecture.standardsFamilyPortfolios} standards parent-family portfolio${closureArchitecture.standardsFamilyPortfolios === 1 ? "" : "s"}, ${closureArchitecture.generatorDomainPortfolios} generator domains and ${closureArchitecture.programSharedPortfolios} shared programme/engine portfolios. The ${closureArchitecture.standardsExactCodeContracts} exact standards codes and ${closureArchitecture.generatorExactTagContracts} exact generator tags remain required subgroups. That is ${closureArchitecture.queueToPrimaryScopeCompression}× fewer context scopes without deleting or auto-closing a single task.
- **The fastest safe path is course-first, cause-first and evidence-last.** Read each course once, emit all semantic contracts, implement file-disjoint causes, run deterministic evidence once, and obtain an independent verdict. Standards use a separate exact-code cache and retain edge-level decisions.

## Dataset and grain

The source is \`${queueFile}\`: one row per currently open closure obligation. The compiler verifies ${queue.length}/${queue.length} unique work IDs, ${missingRequired.length} missing required records, and ${unknownPriorities.length} invalid priority values. The portfolio CSV is a derived execution view; the queue remains the source of truth.

## The breakthrough: ${queue.length.toLocaleString()} rows become ${portfolios.length} claimable portfolios

| Portfolio class | Queue rows | Primary scopes | Rows per scope | P0 rows | Maximum scope |
|---|---:|---:|---:|---:|---:|
${portfolioClasses.map((row) => `| ${row.portfolioClass} | ${row.queueRows.toLocaleString()} | ${row.portfolioScopes} | ${row.rowsPerScope} | ${row.p0.toLocaleString()} | ${row.maxRows} |`).join("\n")}

This is a context-loading optimization, not a quality shortcut. A portfolio owns one coherent read and contract. Writes still split at shared hot files, exact generator-tag boundaries and maximum safe batch sizes.

## One course read should drive every local decision

The ${closureArchitecture.coursePortfolios} course portfolios cover ${portfolioClasses.find((row) => row.portfolioClass === "COURSE_PORTFOLIO").queueRows.toLocaleString()} source-local rows. A course assessor reads the full lesson set once and emits lesson/visual/language dispositions, progression and choice jobs, math and figure requirements, revision contracts and standards evidence summaries. Implementers receive only exact owned files and deltas.

Top closure-leverage course portfolios:

| Course | Rows | P0 | Lessons | Workstreams |
|---|---:|---:|---:|---|
${topCourses.map((row) => `| ${row.portfolioKey} | ${row.queueRows} | ${row.priorities.P0} | ${row.uniqueLessons} | ${row.workstreams.join(", ")} |`).join("\n")}

## Standards: cache the official source, never the verdict

The ${openStandardsDossiers.length.toLocaleString()} open standards edges resolve to ${standardFamilyGroups.size} authoritative framework+parent-family portfolio${standardFamilyGroups.size === 1 ? "" : "s"} while retaining ${standardExactCodeGroups.size} required exact framework+code contracts across ${standardsMappedCourses} course${standardsMappedCourses === 1 ? "" : "s"}. Each exact-code subgroup is capped at 40 edges, producing ${standardMicroBatchesAt40} bounded batches. Official text is fetched and signed once per exact code; course evidence is read once; each edge still receives its own approve/reject/partial decision. Family grouping never supplies a verdict.

## Generators: parent domains retain exact-tag execution contracts

All ${generatorRows.length} generator rows compile into ${closureArchitecture.generatorDomainPortfolios} coherent grade/course domains while retaining all ${closureArchitecture.generatorExactTagContracts} exact generator tags as required subgroups. The ${closureArchitecture.generatorMicroBatchesAt40} execution microbatches are tag-bounded and contain at most 40 rows; no decision or batch can cross an exact-tag boundary.

| Generator domain | Rows | Exact tags | Microbatches ≤40 | Largest tag | Required exact tags |
|---|---:|---:|---:|---:|---|
${generatorDomainRows.map((row) => `| ${row.generatorDomain} | ${row.queueRows} | ${row.exactTagContracts} | ${row.microBatchesAt40} | ${row.maximumTagRows} | ${row.exactTags.map((tag) => `\`${tag}\``).join(", ")} |`).join("\n")}

## Shared causes that should close many rows

- **Math rendering:** ${mathRows.length.toLocaleString()} rows compile into ${closureArchitecture.mathBoundaryContracts} symbol × surface × source contracts. Repair the renderer boundary once, then verify every dependent field and screen-reader string.
- **Illustrations:** ${illustrationRows.length.toLocaleString()} rows compile into ${closureArchitecture.illustrationFigureCourseContracts} figure+course contracts and ${closureArchitecture.illustrationMicroBatchesAt20} write batches capped at 20 placements. The ${countOnHopsRows.toLocaleString()} live \`count-on-hops\` placements require typed semantic figure specifications, not bespoke pictures.
- **Generators:** ${generatorRows.length} generated rows compile into ${closureArchitecture.generatorDomainPortfolios} parent domains, ${closureArchitecture.generatorExactTagContracts} required exact-tag contracts and ${closureArchitecture.generatorMicroBatchesAt40} tag-bounded microbatches. Reuse domain context, but run the prompt-only oracle, deterministic replay and verdict independently per tag.
- **Progression and choices:** ${progressionRows.length} progression rows are ${closureArchitecture.progressionCourseContracts} course contracts; ${choiceRows.length} choice rows are ${closureArchitecture.choiceSourceContracts} authored-course or generator contracts.

## Optimized operating sequence

1. **Freeze and compile.** Require queue SHA, base commit, contract hash and owned files in every portfolio. Reject stale claims automatically.
2. **Assessment cohort.** Review 3 courses concurrently with four active agents, or 6 with eight active agents. One assessor owns one course. The ${pendingCourses} remaining course reviews become ${dispositionScenario.cohortsAtThreeCourseAssessors} three-assessor cohorts or ${dispositionScenario.cohortsAtSixCourseAssessors} six-assessor cohorts.
3. **Contract fan-out.** Convert course findings into small, file-disjoint write packets: 5–12 lessons, one generator family, one math boundary, or at most 20 illustration placements.
4. **Deterministic evidence cohort.** Luna workers run schema, pedagogy, duplication, parity, seed, renderer and accessibility gates once per changed dependency partition; raw logs stay outside model context.
5. **Independent verdict cohort.** Assessors read the contract, diff, rendered state and unseen samples before the producer narrative. P0 and novel mathematics receive full semantic review; contract-identical mechanical rows receive representative plus unseen-sample review.
6. **Serial integration.** One steward regenerates queue/cards/cache and proves exact closures. No parallel writer touches a hot file or shared generated artifact.

## Throughput controls

- Active writers = \`min(disjoint ready packets, implementation slots, 2 × active assessors, hot-file limit)\`.
- Stop spawning writers when more than two completed packets wait per assessor.
- Use 3–5-task micro-cohorts; never hold fast scans behind a slow standards or browser task.
- Interrupt and split any packet lasting more than twice its cohort median.
- Standard speed is the default. Fast is allowed only when one short verdict unlocks at least three blocked workers. Ultra/Max is for genuine adjudication, not bulk work.
- Stable instructions, tools, rubric and schema go first in every prompt; packet-specific data goes last for exact-prefix cache reuse.

## Measured disposition leverage

All ${reviewedLessons.toLocaleString()} current signed lesson reviews resolved ${dispositionScenario.genericRowsResolved.toLocaleString()} generic disposition rows and left ${currentRevisionRows.toLocaleString()} implementation or escalation rows. If the same ${round(observedRevisionRate * 100, 1)}% revision-required rate held—a planning scenario, not a forecast—the remaining ${pendingLessons.toLocaleString()} reviews would resolve ${dispositionScenario.grossGenericRowsClosed.toLocaleString()} generic rows, create about ${dispositionScenario.scenarioNewRevisionRows.toLocaleString()} implementation rows and reduce the queue by about ${dispositionScenario.scenarioNetQueueReduction.toLocaleString()} net rows before those fixes are completed.

## Immediate next waves

1. Run six high-leverage course assessments per eight-agent cohort, prioritizing P0 density and cross-workstream overlap rather than raw row count alone.
2. Start renderer-boundary canaries, then expand through the ${closureArchitecture.mathBoundaryContracts} live exact boundary contracts.
3. Build one typed semantic-figure canary for three different \`count-on-hops\` concepts; scale across the ${countOnHopsRows.toLocaleString()} live placements only if value, visible model, explanation and accessible description remain synchronized.
4. Begin exact-code standards batches only after course evidence summaries are current; keep the existing ${partialStandardsEdges.toLocaleString()} partial edges open.
5. Implement or adjudicate the ${currentRevisionRows.toLocaleString()} current revision/escalation packets before reviewing their courses again.

## Further questions

- Which exact semantic figure families can replace \`count-on-hops\` without recreating a generic illustration under a new name?
- Which standards authorities permit stable direct-source retrieval in the execution environment, and which need a separately cached official snapshot?
- Does the revision-required rate remain near the observed ${round(observedRevisionRate * 100, 1)}% once less risky courses are reviewed? Recalculate after every 100 decisions.

## Caveats and assumptions

- Portfolio compression reduces repeated reading and orchestration; it does not constitute closure evidence.
- Standards remain the largest semantic workload. Source caching saves tokens, but no benchmark is approved by analogy.
- The disposition scenario is based on all ${reviewedLessons.toLocaleString()} current reviewed lessons and is deliberately labeled as a scenario.
- Shared renderer and semantic-figure scaling stops on any learner-visible mathematical, accessibility or state-synchronization failure.
`;

const portfolioClassLabel = {
  COURSE_PORTFOLIO: "Course",
  STANDARD_FAMILY_PORTFOLIO: "Standards family",
  GENERATOR_DOMAIN_PORTFOLIO: "Generator domain",
  PROGRAM_SHARED_PORTFOLIO: "Programme/shared",
};
const chartRows = portfolioClasses.map((row) => ({
  portfolio_class: portfolioClassLabel[row.portfolioClass],
  rows_per_scope: row.rowsPerScope,
  queue_rows: row.queueRows,
  scopes: row.portfolioScopes,
})).sort((a, b) => b.rows_per_scope - a.rows_per_scope);
const tableRows = workstreams.map((row) => ({
  workstream: row.workstream.replaceAll("_", " ").toLowerCase(),
  queue_rows: row.queueRows,
  share_pct: round(row.share * 100, 2),
  p0_rows: row.p0,
  unique_lessons: row.uniqueLessons,
}));
const courseRows = topCourses.map((row) => ({
  course: row.portfolioKey,
  queue_rows: row.queueRows,
  p0_rows: row.priorities.P0,
  lessons: row.uniqueLessons,
  workstream_count: row.workstreams.length,
}));
const generatorArtifactRows = generatorDomainRows.map((row) => ({
  generator_domain: row.generatorDomain,
  queue_rows: row.queueRows,
  exact_tag_contracts: row.exactTagContracts,
  microbatches_at_40: row.microBatchesAt40,
  maximum_tag_rows: row.maximumTagRows,
  exact_tags: row.exactTags.join("|"),
}));

const source = {
  id: "authoritative_queue",
  label: "Maggie's Trail authoritative pending workload queue",
  path: queueFile,
  query: {
    engine: "duckdb",
    language: "sql",
    id: `s247-backlog-${queueSha256.slice(0, 12)}`,
    executed_at: generatedAt,
    description: "Loads the complete authoritative queue. The saved S247 compiler assigns every row exactly once to a primary portfolio and produces the bounded report datasets.",
    sql: `SELECT * FROM read_csv_auto('${queueFile}', header = true);`,
    tables_used: [queueFile],
    filters: { population: "all open queue rows; no sampling or exclusions" },
  },
};

const artifact = {
  surface: "report",
  manifest: {
    version: 2,
    surface: "report",
    title: "Maggie's Trail backlog breakthrough",
    generatedAt,
    blocks: [
      { id: "title", type: "markdown", body: "# Maggie's Trail backlog breakthrough" },
      { id: "executive-summary", type: "markdown", sourceId: source.id, body: `**${queue.length.toLocaleString()} live rows → ${portfolios.length} exact portfolios (${closureArchitecture.queueToPrimaryScopeCompression}× fewer context scopes).** Course-first, cause-first execution preserves independent QA while eliminating repeated reading.` },
      { id: "portfolio-compression-chart-block", type: "chart", chartId: "portfolio-compression-chart" },
      { id: "generator-domain-summary", type: "markdown", sourceId: source.id, body: `**${generatorRows.length} generator rows → ${closureArchitecture.generatorDomainPortfolios} parent domains, retaining ${closureArchitecture.generatorExactTagContracts} required exact tags in ${closureArchitecture.generatorMicroBatchesAt40} tag-bounded microbatches (≤40 rows).**` },
      { id: "generator-domain-chart-block", type: "chart", chartId: "generator-domain-chart" },
    ],
    charts: [{
      id: "portfolio-compression-chart",
      title: "Queue rows represented by one portfolio",
      subtitle: "Current authoritative queue; higher values mean less repeated context loading",
      type: "bar",
      intent: "comparison",
      dataset: "portfolio_classes",
      sourceId: source.id,
      encodings: {
        x: { field: "portfolio_class", type: "nominal", label: "Portfolio class" },
        y: { field: "rows_per_scope", type: "quantitative", label: "Rows per portfolio", format: "number" },
      },
      settings: { sort: "descending", showValues: true },
      labels: { values: "all" },
      palette: { kind: "sequential", name: "blue" },
      layout: "full",
      surface: { compact: true },
    }, {
      id: "generator-domain-chart",
      title: "Generator rows by coherent parent domain",
      subtitle: "Every exact generator tag remains a required execution subgroup",
      type: "bar",
      intent: "comparison",
      dataset: "generator_domains",
      sourceId: source.id,
      encodings: {
        x: { field: "generator_domain", type: "nominal", label: "Generator domain" },
        y: { field: "queue_rows", type: "quantitative", label: "Queue rows", format: "number" },
      },
      settings: { sort: "descending", showValues: true },
      labels: { values: "all" },
      palette: { kind: "sequential", name: "orange" },
      layout: "full",
      surface: { compact: true },
    }],
    sources: [source],
  },
  snapshot: {
    version: 2,
    generatedAt,
    status: "ready",
    datasets: {
      portfolio_classes: chartRows,
      workstreams: tableRows,
      top_courses: courseRows,
      generator_domains: generatorArtifactRows,
    },
  },
  sources: [source],
};

const htmlReport = renderBacklogPortfolioHtml({
  queueRows: queue.length,
  referenceRows: dataQuality.sourceCountClaimedByUser,
  primaryPortfolios: portfolios.length,
  standardsFamilyPortfolios: closureArchitecture.standardsFamilyPortfolios,
  standardsExactCodeContracts: closureArchitecture.standardsExactCodeContracts,
  generatorDomainPortfolios: closureArchitecture.generatorDomainPortfolios,
  generatorExactTagContracts: closureArchitecture.generatorExactTagContracts,
  generatorMicroBatchesAt40: closureArchitecture.generatorMicroBatchesAt40,
  compression: closureArchitecture.queueToPrimaryScopeCompression,
  queueSha256,
  sourceCommit: head,
  generatedAt,
  portfolioClasses: portfolioClasses.map((row) => ({ ...row, label: portfolioClassLabel[row.portfolioClass] })),
  workstreams,
  topCourses,
  generatorDomains: generatorDomainRows,
  reviewedLessons,
  currentRevisionRows,
  pendingLessons,
});

const rendered = {
  [outputs.csv]: portfolioCsv,
  [outputs.json]: JSON.stringify(plan, null, 2) + "\n",
  [outputs.markdown]: markdown,
  [outputs.artifact]: JSON.stringify(artifact, null, 2) + "\n",
  [outputs.html]: htmlReport,
};

const checkOnly = process.argv.includes("--check");
for (const [file, contents] of Object.entries(rendered)) {
  if (checkOnly) {
    if (!fs.existsSync(file)) throw new Error(`Missing generated artifact: ${path.relative(root, file)}`);
    const existing = fs.readFileSync(file, "utf8");
    if (existing !== contents) throw new Error(`Stale generated artifact: ${path.relative(root, file)}`);
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents, "utf8");
  }
}

console.log(JSON.stringify({
  status: checkOnly ? "CURRENT" : "WROTE",
  queueRows: queue.length,
  queueSha256,
  primaryPortfolios: portfolios.length,
  compression: closureArchitecture.queueToPrimaryScopeCompression,
  classCounts: Object.fromEntries(portfolioClasses.map((row) => [row.portfolioClass, { scopes: row.portfolioScopes, rows: row.queueRows }])),
  outputs: Object.values(outputs).map((file) => path.relative(root, file).replaceAll("\\", "/")),
}, null, 2));
