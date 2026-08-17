#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const REPORT_DIR = path.join(ROOT, "reports", "closure");
const JSON_PATH = path.join(REPORT_DIR, "LESSON_REVIEW_CARDS_S244.json");
const CSV_PATH = path.join(REPORT_DIR, "LESSON_REVIEW_CARDS_S244.csv");
const MD_PATH = path.join(REPORT_DIR, "LESSON_REVIEW_CARDS_S244.md");

const relative = (file) => path.relative(ROOT, file).replaceAll(path.sep, "/");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const readText = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const readJson = (file) => JSON.parse(readText(file));

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

function loadLessons() {
  const records = [];
  const coursesRoot = path.join(ROOT, "content", "courses");
  for (const courseEntry of fs.readdirSync(coursesRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!courseEntry.isDirectory()) continue;
    const courseRoot = path.join(coursesRoot, courseEntry.name);
    const coursePath = path.join(courseRoot, "course.json");
    const lessonsPath = path.join(courseRoot, "lessons");
    if (!fs.existsSync(coursePath) || !fs.existsSync(lessonsPath)) continue;
    const courseRaw = fs.readFileSync(coursePath, "utf8");
    const course = JSON.parse(courseRaw);
    const courseSource = relative(coursePath);
    for (const file of fs.readdirSync(lessonsPath).filter((name) => name.endsWith(".json")).sort()) {
      const absolute = path.join(lessonsPath, file);
      const raw = fs.readFileSync(absolute, "utf8");
      const parsed = JSON.parse(raw);
      const lesson = parsed.lesson ?? parsed;
      const lessonId = String(lesson.id ?? file.replace(/\.json$/, ""));
      if (records.some((record) => record.lessonId === lessonId)) throw new Error(`Duplicate lesson id ${lessonId}`);
      records.push({
        lessonId,
        courseId: String(lesson.courseId ?? course.id ?? courseEntry.name),
        courseTitle: String(course.title ?? courseEntry.name),
        gradeLevel: Number(course.gradeLevel),
        title: String(lesson.title ?? lessonId),
        lesson,
        raw,
        source: relative(absolute),
        lessonSourceHash: hash(raw),
        courseSource,
        courseSourceHash: hash(courseRaw),
        lessonCourseBasisHash: hash(`${relative(absolute)}\0${raw}\0${courseSource}\0${courseRaw}\0`),
        courseRaw
      });
    }
  }
  return records.sort((a, b) => a.lessonId.localeCompare(b.lessonId));
}

function mcqIdentity(widget) {
  if (widget?.type !== "mcq" || !String(widget.prompt ?? "").trim() || !Array.isArray(widget.options)) return null;
  const labels = widget.options.map((option) => String(option?.label ?? "").trim()).sort().join("|");
  return `${String(widget.prompt).trim()}~~${labels}`;
}

function buildDuplicateInventory(lessons) {
  const placementsByIdentity = new Map();
  for (const record of lessons) {
    for (const [index, step] of (record.lesson.steps ?? []).entries()) {
      const identity = mcqIdentity(step?.widget);
      if (!identity) continue;
      const placement = { lessonId: record.lessonId, stepId: String(step.id ?? index), index };
      if (!placementsByIdentity.has(identity)) placementsByIdentity.set(identity, []);
      placementsByIdentity.get(identity).push(placement);
    }
  }

  const clusters = [...placementsByIdentity]
    .filter(([, placements]) => placements.length > 1)
    .map(([identity, placements]) => {
      const clusterId = `MCQ-${hash(identity).slice(0, 16)}`;
      const sortedPlacements = placements.sort((a, b) =>
        a.lessonId.localeCompare(b.lessonId) || a.index - b.index || a.stepId.localeCompare(b.stepId)
      );
      const lessonCounts = new Map();
      for (const placement of sortedPlacements) {
        lessonCounts.set(placement.lessonId, (lessonCounts.get(placement.lessonId) ?? 0) + 1);
      }
      return {
        clusterId,
        identityHash: hash(identity),
        prompt: identity.split("~~", 1)[0],
        placementCount: sortedPlacements.length,
        withinLesson: [...lessonCounts.values()].some((count) => count > 1),
        placements: sortedPlacements
      };
    })
    .sort((a, b) => a.clusterId.localeCompare(b.clusterId));

  const ids = new Set(clusters.map((cluster) => cluster.clusterId));
  if (ids.size !== clusters.length) throw new Error("Duplicate cluster id collision");

  const byLesson = new Map(lessons.map((lesson) => [lesson.lessonId, []]));
  let withinLessonGroupCount = 0;
  for (const cluster of clusters) {
    const grouped = new Map();
    for (const placement of cluster.placements) {
      if (!grouped.has(placement.lessonId)) grouped.set(placement.lessonId, []);
      grouped.get(placement.lessonId).push(placement);
    }
    for (const [lessonId, placements] of grouped) {
      if (placements.length > 1) withinLessonGroupCount += 1;
      byLesson.get(lessonId).push({
        clusterId: cluster.clusterId,
        placementCount: placements.length,
        withinLesson: placements.length > 1,
        stepIds: placements.map((placement) => placement.stepId)
      });
    }
  }
  for (const entries of byLesson.values()) entries.sort((a, b) => a.clusterId.localeCompare(b.clusterId));

  return {
    clusters,
    byLesson,
    summary: {
      clusterCount: clusters.length,
      placementCount: clusters.reduce((total, cluster) => total + cluster.placementCount, 0),
      affectedLessonCount: [...byLesson.values()].filter((entries) => entries.length > 0).length,
      withinLessonClusterCount: clusters.filter((cluster) => cluster.withinLesson).length,
      withinLessonGroupCount
    }
  };
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

function loadLessonDecisions(lessons) {
  const file = "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl";
  const raw = readText(file);
  const records = raw.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return { value: JSON.parse(line), line: index + 1 };
    } catch (error) {
      throw new Error(`${file}:${index + 1} is not valid JSON: ${error.message}`);
    }
  });
  const schema = records[0]?.value;
  if (schema?.recordType !== "schema" || schema?.schemaVersion !== 1) {
    throw new Error(`${file} must begin with the S244 schema record`);
  }

  const lessonById = new Map(lessons.map((lesson) => [lesson.lessonId, lesson]));
  const latest = new Map();
  const recordIds = new Set();
  let duplicateRecordIdCount = 0;
  let unknownLessonRecordCount = 0;
  for (const entry of records.slice(1)) {
    const record = entry.value;
    if (record.recordType !== "lesson-disposition") continue;
    if (recordIds.has(record.recordId)) duplicateRecordIdCount += 1;
    recordIds.add(record.recordId);
    if (!lessonById.has(String(record.lessonId))) unknownLessonRecordCount += 1;
    latest.set(String(record.lessonId), { record, line: entry.line });
  }

  const allowedLesson = new Set(schema.contract.allowedLessonDecisions ?? []);
  const allowedVisual = new Set(schema.contract.allowedVisualDecisions ?? []);
  const allowedLanguage = new Set(schema.contract.allowedGradeLanguageDecisions ?? []);
  const byLesson = new Map();
  let currentCount = 0;
  let staleCount = 0;
  let invalidCount = duplicateRecordIdCount + unknownLessonRecordCount;
  for (const lesson of lessons) {
    const entry = latest.get(lesson.lessonId);
    if (!entry) {
      byLesson.set(lesson.lessonId, { status: "PENDING_EXPLICIT_HUMAN_DECISION", decision: null, record: null, errors: [] });
      continue;
    }
    const { record } = entry;
    const errors = [];
    if (!record.recordId) errors.push("recordId");
    if (!allowedLesson.has(record.decision)) errors.push("decision");
    if (!allowedVisual.has(record.visualDecision)) errors.push("visualDecision");
    if (!allowedLanguage.has(record.gradeLanguageDecision)) errors.push("gradeLanguageDecision");
    if (!String(record.reviewer ?? "").trim()) errors.push("reviewer");
    if (!String(record.rationale ?? "").trim()) errors.push("rationale");
    if (!String(record.reopenCondition ?? "").trim()) errors.push("reopenCondition");
    if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length === 0 || record.evidenceRefs.some((ref) => !String(ref).trim())) errors.push("evidenceRefs");
    if (!Number.isFinite(Date.parse(String(record.reviewedAt ?? "")))) errors.push("reviewedAt");
    if (!/^[a-f0-9]{64}$/i.test(String(record.reviewedBasisHash ?? ""))) errors.push("reviewedBasisHash");
    if (errors.length > 0) {
      invalidCount += 1;
      byLesson.set(lesson.lessonId, { status: "INVALID_HUMAN_DECISION", decision: null, record, errors });
    } else if (record.reviewedBasisHash !== lesson.reviewBasisHash) {
      staleCount += 1;
      byLesson.set(lesson.lessonId, { status: "STALE_HUMAN_DECISION", decision: null, record, errors: [] });
    } else {
      currentCount += 1;
      byLesson.set(lesson.lessonId, { status: "CURRENT_HUMAN_DECISION", decision: record.decision, record, errors: [] });
    }
  }
  return {
    file,
    raw,
    schema,
    byLesson,
    summary: {
      historyRecordCount: records.slice(1).filter((entry) => entry.value.recordType === "lesson-disposition").length,
      currentCount,
      staleCount,
      invalidCount,
      duplicateRecordIdCount,
      unknownLessonRecordCount
    }
  };
}

function loadStandards(lessonIds) {
  const evidenceMap = readJson("content/standards/lesson-evidence-map.json");
  const dossierDoc = readJson("content/standards/evidence-dossiers.json");
  const decisionsDoc = readJson("content/standards/human-review-decisions.json");
  const evidenceLessonIds = new Set((evidenceMap.lessons ?? []).map((lesson) => String(lesson.lessonId)));
  const decisions = new Map((decisionsDoc.decisions ?? []).map((decision) => [String(decision.edgeId), decision]));
  const byLesson = new Map([...lessonIds].map((lessonId) => [lessonId, []]));
  const seenEdges = new Set();
  let inconsistentDecisionCount = 0;
  let invalidDecisionCount = 0;
  let validDecisionCount = 0;
  let approvedDecisionCount = 0;
  let rejectedDecisionCount = 0;

  for (const dossier of dossierDoc.dossiers ?? []) {
    if (seenEdges.has(dossier.edgeId)) throw new Error(`Duplicate standards edge ${dossier.edgeId}`);
    seenEdges.add(dossier.edgeId);
    const explicitDecision = decisions.get(String(dossier.edgeId)) ?? null;
    const explicitStatus = explicitDecision?.decision;
    const { signature: recordedSignature, ...unsignedDecision } = explicitDecision ?? {};
    const signatureValid = explicitDecision ? hash(JSON.stringify(unsignedDecision)) === recordedSignature : false;
    const { dossierHash: currentDossierHash, ...readyDossierCore } = dossier;
    readyDossierCore.claimLimit = "Planning/review only. Not a verified alignment or mastery claim.";
    readyDossierCore.review = {
      status: "ready-for-human-review",
      reviewer: null,
      reviewedAt: null,
      notes: null,
      officialTextSnapshot: null,
      approvedDepth: null
    };
    const signedDossierBasisValid = explicitDecision
      ? explicitDecision.dossierHash === currentDossierHash || explicitDecision.dossierHash === hash(JSON.stringify(readyDossierCore))
      : false;
    const reviewMatches = Boolean(explicitStatus && dossier.review?.status === explicitStatus);
    const decisionValid = Boolean(explicitDecision && signatureValid && signedDossierBasisValid && reviewMatches);
    if (explicitDecision && !reviewMatches) inconsistentDecisionCount += 1;
    if (explicitDecision && !decisionValid) invalidDecisionCount += 1;
    if (decisionValid) {
      validDecisionCount += 1;
      if (explicitStatus === "approve") approvedDecisionCount += 1;
      if (explicitStatus === "reject") rejectedDecisionCount += 1;
    }
    const reviewStatus = decisionValid ? explicitStatus : "ready-for-human-review";
    const coveredLessons = new Set([
      ...(dossier.evidenceSummary?.lessonIds ?? []),
      ...(dossier.stepEvidence ?? []).map((step) => step.lessonId)
    ].map(String));
    for (const lessonId of coveredLessons) {
      if (!byLesson.has(lessonId)) continue;
      byLesson.get(lessonId).push({
        edgeId: String(dossier.edgeId),
        dossierHash: String(dossier.dossierHash),
        framework: String(dossier.framework),
        candidateCode: String(dossier.candidateCode),
        candidateDepth: String(dossier.candidateDepth),
        sourceTextStatus: String(dossier.sourceTextStatus),
        reviewStatus,
        decisionIntegrityStatus: explicitDecision
          ? decisionValid ? "VALID_EXPLICIT_HUMAN_DECISION" : "INVALID_OR_STALE_EXPLICIT_DECISION"
          : "NO_EXPLICIT_HUMAN_DECISION"
      });
    }
  }
  for (const entries of byLesson.values()) entries.sort((a, b) => a.edgeId.localeCompare(b.edgeId));

  const unboundDecisionCount = [...decisions.keys()].filter((edgeId) => !seenEdges.has(edgeId)).length;
  return {
    evidenceMap,
    dossierDoc,
    decisionsDoc,
    evidenceLessonIds,
    byLesson,
    inconsistentDecisionCount,
    invalidDecisionCount,
    unboundDecisionCount,
    validDecisionCount,
    approvedDecisionCount,
    rejectedDecisionCount,
    pendingDecisionCount: (dossierDoc.dossiers ?? []).length - validDecisionCount
  };
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

const lessons = loadLessons();
const lessonIds = new Set(lessons.map((lesson) => lesson.lessonId));
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
    for (const workstream of ["LESSON_COMPLETE_DISPOSITION", "VISUAL_FIRST_REPRESENTATION", "GRADE_LANGUAGE_REVIEW"]) {
      if (rows.filter((row) => row.workstream === workstream).length !== 1) {
        throw new Error(`${lesson.lessonId} must have exactly one ${workstream} queue row`);
      }
    }
  }
}

const duplicateInventory = buildDuplicateInventory(lessons);
const standards = loadStandards(lessonIds);
for (const lesson of lessons) {
  lesson.reviewBasisHash = hash(stable({
    lessonCourseBasisHash: lesson.lessonCourseBasisHash,
    duplicateClusters: duplicateInventory.byLesson.get(lesson.lessonId) ?? [],
    standardsEdges: standards.byLesson.get(lesson.lessonId) ?? []
  }));
}
const lessonDecisions = loadLessonDecisions(lessons);
const legacyClassificationRaw = readText("CLOSURE_LESSON_CLASSIFICATION.csv");
const legacyClassifications = new Map(csvObjects(legacyClassificationRaw).map((row) => [row.lesson, row]));

const cards = lessons.map((lesson) => {
  const rows = queueByLesson.get(lesson.lessonId) ?? [];
  const complete = queueStatus(rows, "LESSON_COMPLETE_DISPOSITION", "MISSING_QUEUE_ROW");
  const visual = queueStatus(rows, "VISUAL_FIRST_REPRESENTATION", "MISSING_QUEUE_ROW");
  const language = queueStatus(rows, "GRADE_LANGUAGE_REVIEW", "MISSING_QUEUE_ROW");
  const progression = queueStatus(rows, "LESSON_PROGRESSION_AND_DUPLICATION", "NO_OPEN_HEURISTIC_FLAG");
  const humanDisposition = lessonDecisions.byLesson.get(lesson.lessonId);
  const duplicateEntries = duplicateInventory.byLesson.get(lesson.lessonId) ?? [];
  const dossierEntries = standards.byLesson.get(lesson.lessonId) ?? [];
  const approvedEdgeCount = dossierEntries.filter((entry) => entry.reviewStatus === "approve").length;
  const rejectedEdgeCount = dossierEntries.filter((entry) => entry.reviewStatus === "reject").length;
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
