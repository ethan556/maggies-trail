#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const REPORT_DIR = path.join(ROOT, "reports", "closure");
const JSON_PATH = path.join(REPORT_DIR, "LESSON_REVIEW_CARDS_S244.json");
const CSV_PATH = path.join(REPORT_DIR, "LESSON_REVIEW_CARDS_S244.csv");
const MD_PATH = path.join(REPORT_DIR, "LESSON_REVIEW_CARDS_S244.md");

const relative = (file) => path.relative(ROOT, file).replaceAll(path.sep, "/");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const readText = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

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
  if (field !== "" || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function csvObjects(text) {
  const rows = parseCsv(text.split(/\r?\n/).filter((line) => !line.startsWith("#")).join("\n"));
  const [headers = [], ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function groupBy(rows, key) {
  const result = new Map();
  for (const row of rows) {
    const value = row[key];
    if (!result.has(value)) result.set(value, []);
    result.get(value).push(row);
  }
  return result;
}

function queueStatus(rows, workstream, absentStatus) {
  const matches = rows.filter((row) => row.workstream === workstream);
  if (matches.length === 0) return { status: absentStatus, rowCount: 0, workIds: [] };
  return {
    status: [...new Set(matches.map((row) => row.status))].sort().join(" | "),
    rowCount: matches.length,
    workIds: matches.map((row) => row.work_id).sort()
  };
}

function decisionAwareReviewStatus(rows, workstream, humanDisposition, closedStatus) {
  if (humanDisposition.status === "CURRENT_HUMAN_DECISION") {
    const matches = rows.filter((row) => row.workstream === workstream);
    if (matches.length !== 0) throw new Error(`${humanDisposition.record.lessonId} has a current decision but ${matches.length} open ${workstream} rows`);
    return { status: closedStatus, rowCount: 0, workIds: [] };
  }
  return queueStatus(rows, workstream, "MISSING_REQUIRED_OPEN_QUEUE_ROW");
}

function writeOrCheck(file, expected) {
  if (CHECK) {
    if (!fs.existsSync(file)) throw new Error(`${relative(file)} is missing; regenerate the review-card reports`);
    const actual = fs.readFileSync(file, "utf8");
    if (actual !== expected) throw new Error(`${relative(file)} is stale; regenerate from the sealed live source`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, expected);
}

const reviewAuthority = loadLessonReviewAuthority(ROOT);
const { lessons, duplicateInventory, standards, lessonDecisions } = reviewAuthority;
const curriculumSeal = hash(lessons.map(({ source, raw }) => `${source}\0${raw}\0`).join(""));
const uniqueCourses = [...new Map(lessons.map((lesson) => [lesson.courseSource, lesson.courseRaw])).entries()]
  .sort(([a], [b]) => a.localeCompare(b));
const reviewBasisSeal = hash([
  ...uniqueCourses.map(([source, raw]) => `${source}\0${raw}\0`),
  ...lessons.map(({ source, raw }) => `${source}\0${raw}\0`)
].join(""));

const queueRaw = readText("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const queueSummaryRaw = readText("PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md");
const queueDeclaredSeal = queueSummaryRaw.match(/Curriculum source seal:\s*`([a-f0-9]{64})`/i)?.[1] ?? null;
const queueRows = csvObjects(queueRaw);
const queueByLesson = groupBy(queueRows.filter((row) => row.lesson_id), "lesson_id");
const queueSourceStatus = queueDeclaredSeal === curriculumSeal ? "SOURCE_SEAL_MATCH" : "STALE_SOURCE_SEAL";

if (queueSourceStatus === "SOURCE_SEAL_MATCH") {
  for (const lesson of lessons) {
    const rows = queueByLesson.get(lesson.lessonId) ?? [];
    const humanDisposition = lessonDecisions.byLesson.get(lesson.lessonId);
    const expectedGenericCount = humanDisposition.status === "CURRENT_HUMAN_DECISION" ? 0 : 1;
    for (const workstream of ["LESSON_COMPLETE_DISPOSITION", "VISUAL_FIRST_REPRESENTATION", "GRADE_LANGUAGE_REVIEW"]) {
      const actual = rows.filter((row) => row.workstream === workstream).length;
      if (actual !== expectedGenericCount) throw new Error(`${lesson.lessonId} must have exactly ${expectedGenericCount} ${workstream} queue rows; found ${actual}`);
    }
    const expectedRevisionCount = humanDisposition.status === "CURRENT_HUMAN_DECISION"
      && ["REVISE", "ESCALATE"].includes(humanDisposition.decision) ? 1 : 0;
    const actualRevisionCount = rows.filter((row) => row.workstream === "LESSON_REVISION_IMPLEMENTATION").length;
    if (actualRevisionCount !== expectedRevisionCount) throw new Error(`${lesson.lessonId} must have exactly ${expectedRevisionCount} LESSON_REVISION_IMPLEMENTATION queue rows; found ${actualRevisionCount}`);
  }
}
const legacyClassificationRaw = readText("CLOSURE_LESSON_CLASSIFICATION.csv");
const legacyClassifications = new Map(csvObjects(legacyClassificationRaw).map((row) => [row.lesson, row]));

const cards = lessons.map((lesson) => {
  const rows = queueByLesson.get(lesson.lessonId) ?? [];
  const humanDisposition = lessonDecisions.byLesson.get(lesson.lessonId);
  const complete = decisionAwareReviewStatus(rows, "LESSON_COMPLETE_DISPOSITION", humanDisposition, "CLOSED_BY_CURRENT_HUMAN_DECISION");
  const visual = decisionAwareReviewStatus(rows, "VISUAL_FIRST_REPRESENTATION", humanDisposition, `CLOSED_BY_CURRENT_HUMAN_DECISION:${humanDisposition.record?.visualDecision ?? ""}`);
  const language = decisionAwareReviewStatus(rows, "GRADE_LANGUAGE_REVIEW", humanDisposition, `CLOSED_BY_CURRENT_HUMAN_DECISION:${humanDisposition.record?.gradeLanguageDecision ?? ""}`);
  const progression = queueStatus(rows, "LESSON_PROGRESSION_AND_DUPLICATION", "NO_OPEN_HEURISTIC_FLAG");
  const duplicateEntries = duplicateInventory.byLesson.get(lesson.lessonId) ?? [];
  const dossierEntries = standards.byLesson.get(lesson.lessonId) ?? [];
  const partialEdgeCount = dossierEntries.filter((entry) => entry.reviewStatus === "partial").length;
  const approvedEdgeCount = dossierEntries.filter((entry) => entry.reviewStatus === "approved").length;
  const rejectedEdgeCount = dossierEntries.filter((entry) => entry.reviewStatus === "rejected").length;
  const pendingEdgeCount = dossierEntries.length - approvedEdgeCount - rejectedEdgeCount;
  const standardsStatus = dossierEntries.length === 0
    ? "NO_CANDIDATE_DOSSIER"
    : pendingEdgeCount === dossierEntries.length
      ? "CANDIDATE_ONLY_PENDING_HUMAN_REVIEW"
      : pendingEdgeCount > 0
        ? "PARTIAL_HUMAN_REVIEW_PENDING"
        : "HUMAN_REVIEW_COMPLETE_APPROVAL_AND_REJECTION_COUNTS_SHOWN";
  const legacy = legacyClassifications.get(lesson.lessonId) ?? null;
  const assessorTasks = [
    humanDisposition.status === "CURRENT_HUMAN_DECISION" ? null : "COMPLETE_LESSON_DISPOSITION",
    humanDisposition.status === "CURRENT_HUMAN_DECISION" ? null : "VISUAL_FIRST_DISPOSITION",
    humanDisposition.status === "CURRENT_HUMAN_DECISION" ? null : "GRADE_LANGUAGE_REVIEW",
    dossierEntries.length ? (pendingEdgeCount ? "STANDARDS_EDGE_REVIEW" : null) : "STANDARDS_EVIDENCE_MAPPING",
    duplicateEntries.length || progression.rowCount ? "PROGRESSION_AND_DUPLICATION_REVIEW" : null
  ].filter(Boolean);

  const core = {
    reviewCardId: `S244-RC-${lesson.lessonId}`,
    lessonId: lesson.lessonId,
    courseId: lesson.courseId,
    courseTitle: lesson.courseTitle,
    gradeLevel: lesson.gradeLevel,
    title: lesson.title,
    source: lesson.source,
    lessonSourceHash: lesson.lessonSourceHash,
    courseSource: lesson.courseSource,
    courseSourceHash: lesson.courseSourceHash,
    lessonCourseBasisHash: lesson.lessonCourseBasisHash,
    reviewBasisHash: lesson.reviewBasisHash,
    cardStatus: humanDisposition.status === "CURRENT_HUMAN_DECISION" ? "CURRENT_HUMAN_DISPOSITION" : "PENDING_ASSESSOR",
    disposition: {
      status: humanDisposition.status,
      decision: humanDisposition.decision,
      allowedDecisions: ["KEEP", "REVISE", "ESCALATE"],
      queueStatus: complete.status,
      queueWorkIds: complete.workIds,
      recordId: humanDisposition.record?.recordId ?? null,
      reviewer: humanDisposition.record?.reviewer ?? null,
      reviewedAt: humanDisposition.record?.reviewedAt ?? null,
      reviewedBasisHash: humanDisposition.record?.reviewedBasisHash ?? null,
      visualDecision: humanDisposition.status === "CURRENT_HUMAN_DECISION" ? humanDisposition.record.visualDecision : null,
      gradeLanguageDecision: humanDisposition.status === "CURRENT_HUMAN_DECISION" ? humanDisposition.record.gradeLanguageDecision : null,
      validationErrors: humanDisposition.errors,
      authority: "Only a valid, current record in LESSON_REVIEW_DECISIONS_S244.jsonl supplies a V4 lesson decision; heuristic classifications are never imported."
    },
    reviewStatus: {
      queueSourceStatus,
      visual: visual.status,
      gradeLanguage: language.status,
      progression: progression.status,
      openQueueRowCount: rows.length
    },
    duplicates: {
      status: duplicateEntries.length ? "EXACT_MCQ_DUPLICATE_CLUSTER_PRESENT" : "NO_EXACT_MCQ_DUPLICATE_CLUSTER",
      clusterCount: duplicateEntries.length,
      placementCount: duplicateEntries.reduce((total, entry) => total + entry.placementCount, 0),
      withinLessonGroupCount: duplicateEntries.filter((entry) => entry.withinLesson).length,
      clusterIds: duplicateEntries.map((entry) => entry.clusterId),
      clusterRefs: duplicateEntries,
      progressionQueueRowCount: progression.rowCount
    },
    standards: {
      status: standardsStatus,
      lessonEvidenceMapStatus: standards.evidenceLessonIds.has(lesson.lessonId)
        ? "PRESENT_CANDIDATE_EVIDENCE"
        : "MISSING_CANDIDATE_EVIDENCE",
      dossierCount: dossierEntries.length,
      partialEdgeCount,
      pendingEdgeCount,
      approvedEdgeCount,
      rejectedEdgeCount,
      needsExactBenchmarkCount: dossierEntries.filter((entry) => entry.sourceTextStatus === "scope-locator-requires-exact-benchmark").length,
      frameworks: [...new Set(dossierEntries.map((entry) => entry.framework))].sort(),
      candidateCodes: [...new Set(dossierEntries.map((entry) => entry.candidateCode))].sort(),
      edgeIds: dossierEntries.map((entry) => entry.edgeId),
      edgeRefs: dossierEntries,
      candidateOnly: pendingEdgeCount > 0,
      alignmentClaimAllowed: false,
      masteryClaimAllowed: false,
      lessonClosureAllowed: false
    },
    priorInteractionClosureClassification: legacy ? {
      decision: legacy.decision,
      lessonClass: legacy["lesson class"],
      authorityBoundary: "Interaction-engine triage only; not a V4 whole-lesson semantic disposition."
    } : null,
    assessorTasks
  };
  return { ...core, reviewCardHash: hash(stable(core)) };
});

const allDossiers = standards.dossierDoc.dossiers ?? [];
const explicitStandardsDecisions = standards.decisionsDoc.decisions ?? [];
const lessonEdgeReferences = cards.flatMap((card) => card.standards.edgeIds);
const lessonCountByEdge = new Map();
for (const edgeId of lessonEdgeReferences) lessonCountByEdge.set(edgeId, (lessonCountByEdge.get(edgeId) ?? 0) + 1);
const summary = {
  lessonCount: cards.length,
  disposition: {
    explicitDecisions: cards.filter((card) => card.disposition.decision !== null).length,
    pendingHumanDecisions: cards.filter((card) => card.disposition.decision === null).length
  },
  visual: {
    explicitDecisions: cards.filter((card) => card.disposition.visualDecision !== null).length,
    pendingHumanDispositions: cards.filter((card) => card.disposition.visualDecision === null).length
  },
  gradeLanguage: { pendingHumanReviews: cards.filter((card) => card.disposition.gradeLanguageDecision === null).length },
  progression: { lessonsWithOpenQueueRows: cards.filter((card) => card.duplicates.progressionQueueRowCount > 0).length },
  duplicates: duplicateInventory.summary,
  standards: {
    dossierCount: allDossiers.length,
    lessonEdgeReferenceCount: lessonEdgeReferences.length,
    sharedAcrossLessonsEdgeCount: [...lessonCountByEdge.values()].filter((count) => count > 1).length,
    extraSharedLessonReferenceCount: lessonEdgeReferences.length - lessonCountByEdge.size,
    explicitDecisionCount: explicitStandardsDecisions.length,
    validExplicitDecisionCount: standards.validDecisionCount,
    pendingEdgeCount: standards.pendingDecisionCount,
    partialEdgeCount: standards.partialDecisionCount,
    approvedEdgeCount: standards.approvedDecisionCount,
    rejectedEdgeCount: standards.rejectedDecisionCount,
    needsExactBenchmarkCount: allDossiers.filter((dossier) => dossier.sourceTextStatus === "scope-locator-requires-exact-benchmark").length,
    lessonsWithCandidateEvidenceMap: cards.filter((card) => card.standards.lessonEvidenceMapStatus === "PRESENT_CANDIDATE_EVIDENCE").length,
    lessonsMissingCandidateEvidenceMap: cards.filter((card) => card.standards.lessonEvidenceMapStatus === "MISSING_CANDIDATE_EVIDENCE").length,
    inconsistentDecisionCount: standards.inconsistentDecisionCount,
    invalidDecisionCount: standards.invalidDecisionCount,
    unboundDecisionCount: standards.unboundDecisionCount
  },
  queue: {
    sourceStatus: queueSourceStatus,
    declaredCurriculumSeal: queueDeclaredSeal,
    rowCount: queueRows.length
  },
  priorInteractionClassification: {
    rowCount: legacyClassifications.size,
    importedAsV4DispositionCount: 0
  },
  lessonDecisionLedger: lessonDecisions.summary
};

const duplicateSeal = hash(stable(duplicateInventory.clusters));
const document = {
  schemaVersion: 1,
  generatedAt: "deterministic",
  contract: {
    purpose: "One compact, source-sealed assessor card per live lesson.",
    semanticDecisionPolicy: "Evidence and queue state may be derived; KEEP, REVISE, ESCALATE, visual sufficiency, grade-language fitness, and standards approval require explicit human review.",
    queueAbsencePolicy: "NO_OPEN_HEURISTIC_FLAG means only that the current derived queue has no row; it is not approval.",
    standardsPolicy: "Candidate crosswalks and evidence maps are planning evidence, not verified Common Core or state-framework alignment.",
    legacyClassificationPolicy: "CLOSURE_LESSON_CLASSIFICATION.csv is interaction-engine triage and cannot supply a V4 whole-lesson disposition."
  },
  sourceSeals: {
    queueCompatibleLessonCurriculum: curriculumSeal,
    curriculumReviewBasis: reviewBasisSeal,
    pendingQueueDeclaredCurriculum: queueDeclaredSeal,
    pendingQueue: hash(queueRaw),
    pendingQueueSummary: hash(queueSummaryRaw),
    priorInteractionClassification: hash(legacyClassificationRaw),
    standardsLessonEvidenceMap: hash(readText("content/standards/lesson-evidence-map.json")),
    standardsDossiers: hash(readText("content/standards/evidence-dossiers.json")),
    standardsHumanDecisions: hash(readText("content/standards/human-review-decisions.json")),
    lessonHumanDecisions: hash(lessonDecisions.raw),
    duplicateReferenceIndex: hash(readText("reports/mcq/MCQ_DUPLICATE_ITEM_INDEX.csv")),
    liveDuplicateInventory: duplicateSeal
  },
  summary,
  duplicateClusters: duplicateInventory.clusters,
  cards
};

const jsonOutput = `${JSON.stringify(document)}\n`;
const csvHeaders = [
  "review_card_id", "lesson_id", "course_id", "grade_level", "title", "source", "lesson_source_hash", "review_card_hash",
  "course_source", "course_source_hash", "lesson_course_basis_hash", "review_basis_hash",
  "card_status", "queue_source_status", "complete_disposition_status", "complete_disposition_decision", "visual_status", "grade_language_status",
  "progression_status", "open_queue_rows", "duplicate_status", "duplicate_cluster_count", "duplicate_placement_count",
  "within_lesson_duplicate_groups", "duplicate_cluster_ids", "standards_status", "standards_evidence_map_status",
  "standards_dossier_count", "standards_pending_edges", "standards_approved_edges", "standards_rejected_edges",
  "standards_needing_exact_benchmark", "standards_frameworks", "standards_candidate_codes", "standards_edge_ids",
  "prior_interaction_classification", "assessor_tasks"
];
const csvRows = cards.map((card) => [
  card.reviewCardId, card.lessonId, card.courseId, card.gradeLevel, card.title, card.source, card.lessonSourceHash, card.reviewCardHash,
  card.courseSource, card.courseSourceHash, card.lessonCourseBasisHash, card.reviewBasisHash,
  card.cardStatus, card.reviewStatus.queueSourceStatus, card.disposition.queueStatus, card.disposition.decision ?? "", card.reviewStatus.visual, card.reviewStatus.gradeLanguage,
  card.reviewStatus.progression, card.reviewStatus.openQueueRowCount, card.duplicates.status, card.duplicates.clusterCount,
  card.duplicates.placementCount, card.duplicates.withinLessonGroupCount, card.duplicates.clusterIds.join(" "), card.standards.status,
  card.standards.lessonEvidenceMapStatus, card.standards.dossierCount, card.standards.pendingEdgeCount,
  card.standards.approvedEdgeCount, card.standards.rejectedEdgeCount, card.standards.needsExactBenchmarkCount,
  card.standards.frameworks.join(" "), card.standards.candidateCodes.join(" "), card.standards.edgeIds.join(" "),
  card.priorInteractionClosureClassification?.decision ?? "", card.assessorTasks.join(" ")
]);
const csvOutput = `${csvHeaders.join(",")}\n${csvRows.map((row) => row.map(csv).join(",")).join("\n")}\n`;

const mdOutput = [
  "# Maggie's Trail S244 lesson review cards",
  "",
  "Deterministic assessor view generated from the live lesson source. No semantic judgment is auto-approved.",
  "",
  `- Review-basis seal (lessons plus course/grade metadata): \`${reviewBasisSeal}\``,
  `- Queue-compatible lesson-only seal: \`${curriculumSeal}\``,
  `- Queue freshness: **${queueSourceStatus}** (declared seal: \`${queueDeclaredSeal ?? "missing"}\`)`,
  `- Cards: **${summary.lessonCount.toLocaleString("en-US")}**`,
  `- Card JSON: \`reports/closure/LESSON_REVIEW_CARDS_S244.json\``,
  `- Compact CSV: \`reports/closure/LESSON_REVIEW_CARDS_S244.csv\``,
  "",
  "## Genuine assessor work remaining",
  "",
  "These counts overlap and must not be summed as independent lesson defects.",
  "",
  "| Judgment / evidence packet | Explicitly closed | Pending / flagged |",
  "|---|---:|---:|",
  `| Whole-lesson KEEP / REVISE / ESCALATE | ${summary.disposition.explicitDecisions.toLocaleString("en-US")} | ${summary.disposition.pendingHumanDecisions.toLocaleString("en-US")} lessons |`,
  `| Visual required / preferred / sufficient | ${summary.visual.explicitDecisions.toLocaleString("en-US")} | ${summary.visual.pendingHumanDispositions.toLocaleString("en-US")} lessons |`,
  `| Grade-band language fitness | ${(summary.lessonCount - summary.gradeLanguage.pendingHumanReviews).toLocaleString("en-US")} | ${summary.gradeLanguage.pendingHumanReviews.toLocaleString("en-US")} lessons |`,
  `| Standards edge approval / rejection | ${(summary.standards.approvedEdgeCount + summary.standards.rejectedEdgeCount).toLocaleString("en-US")} | ${summary.standards.pendingEdgeCount.toLocaleString("en-US")} edges |`,
  `| Candidate standards evidence-map coverage | ${summary.standards.lessonsWithCandidateEvidenceMap.toLocaleString("en-US")} candidate-mapped | ${summary.standards.lessonsMissingCandidateEvidenceMap.toLocaleString("en-US")} lessons missing |`,
  `| Exact MCQ duplicate identities | 0 semantic dispositions recorded here | ${summary.duplicates.clusterCount.toLocaleString("en-US")} clusters / ${summary.duplicates.placementCount.toLocaleString("en-US")} placements |`,
  `| Broader progression / repetition queue | 0 semantic dispositions recorded here | ${summary.progression.lessonsWithOpenQueueRows.toLocaleString("en-US")} lessons |`,
  "",
  `Exact duplicate evidence includes **${summary.duplicates.withinLessonGroupCount.toLocaleString("en-US")}** within-lesson groups across **${summary.duplicates.affectedLessonCount.toLocaleString("en-US")}** affected lessons. It proves repeated item identity, not whether a cross-lesson recurrence is instructionally justified.`,
  "",
  `Standards evidence remains candidate-only: **${summary.standards.needsExactBenchmarkCount.toLocaleString("en-US")}** dossiers still need exact benchmark text and independent review; **${summary.standards.approvedEdgeCount.toLocaleString("en-US")}** are approved and **${summary.standards.rejectedEdgeCount.toLocaleString("en-US")}** rejected.`,
  `The **${summary.standards.dossierCount.toLocaleString("en-US")}** central standards edges appear as **${summary.standards.lessonEdgeReferenceCount.toLocaleString("en-US")}** lesson-card references because **${summary.standards.sharedAcrossLessonsEdgeCount.toLocaleString("en-US")}** edges are shared across lessons; cards reference that central authority rather than copying decisions.`,
  "",
  "## Authority boundaries",
  "",
  "- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` supplies open queue state only. Its curriculum seal must match before its lesson rows are treated as current.",
  "- `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` is append-only human input. A decision is current only while its reviewed lesson, course, duplicate-cluster, and standards-reference basis hash matches the live card.",
  "- `CLOSURE_LESSON_CLASSIFICATION.csv` classifies interaction-engine closure. Its KEEP values are deliberately not imported as whole-lesson V4 decisions.",
  "- `content/standards/human-review-decisions.json` is the only standards approval/rejection authority. Candidate dossiers cannot approve themselves.",
  "- Exact MCQ clusters are recomputed from current lesson JSON. The older duplicate index is retained as a reference seal, not treated as live authority.",
  "- Regenerate with `node scripts/audit/lesson-review-cards-s244.mjs`; verify byte-for-byte freshness with `node scripts/audit/lesson-review-cards-s244.mjs --check`.",
  ""
].join("\n");

writeOrCheck(JSON_PATH, jsonOutput);
writeOrCheck(CSV_PATH, csvOutput);
writeOrCheck(MD_PATH, mdOutput);

console.log(JSON.stringify({
  mode: CHECK ? "check" : "write",
  queueCompatibleLessonCurriculumSeal: curriculumSeal,
  curriculumReviewBasisSeal: reviewBasisSeal,
  queueSourceStatus,
  summary
}, null, 2));
