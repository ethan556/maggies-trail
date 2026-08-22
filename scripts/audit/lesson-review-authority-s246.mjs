import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { decisionStatusOf, normalizeStandardsDecisionStatus, validateStandardsDecision } from "../standards/decision-contract.mjs";

export const hash = (value) => createHash("sha256").update(value).digest("hex");

export function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function deriveLessonReviewBasisHash({ lessonCourseBasisHash, duplicateClusters, standardsEdges }) {
  return hash(stable({ lessonCourseBasisHash, duplicateClusters, standardsEdges }));
}

function relative(root, file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

export function loadLessons(root) {
  const records = [];
  const coursesRoot = path.join(root, "content", "courses");
  for (const courseEntry of fs.readdirSync(coursesRoot, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!courseEntry.isDirectory()) continue;
    const courseRoot = path.join(coursesRoot, courseEntry.name);
    const coursePath = path.join(courseRoot, "course.json");
    const lessonsPath = path.join(courseRoot, "lessons");
    if (!fs.existsSync(coursePath) || !fs.existsSync(lessonsPath)) continue;
    const courseRaw = fs.readFileSync(coursePath, "utf8");
    const course = JSON.parse(courseRaw);
    const courseSource = relative(root, coursePath);
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
        source: relative(root, absolute),
        lessonSourceHash: hash(raw),
        courseSource,
        courseSourceHash: hash(courseRaw),
        lessonCourseBasisHash: hash(`${relative(root, absolute)}\0${raw}\0${courseSource}\0${courseRaw}\0`),
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

export function buildDuplicateInventory(lessons) {
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
      for (const placement of sortedPlacements) lessonCounts.set(placement.lessonId, (lessonCounts.get(placement.lessonId) ?? 0) + 1);
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
  if (new Set(clusters.map((cluster) => cluster.clusterId)).size !== clusters.length) throw new Error("Duplicate cluster id collision");

  const byLesson = new Map(lessons.map((lesson) => [lesson.lessonId, []]));
  let withinLessonGroupCount = 0;
  for (const cluster of clusters) {
    const grouped = new Map();
    for (const placement of cluster.placements) {
      if (!grouped.has(placement.lessonId)) grouped.set(placement.lessonId, []);
      grouped.get(placement.lessonId).push(placement);
    }
    for (const [lessonId, placements] of grouped) {
      if (!byLesson.has(lessonId)) continue;
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

export function buildStandardsAuthority({ lessonIds, evidenceMap, dossierDoc, decisionsDoc }) {
  const evidenceLessonIds = new Set((evidenceMap.lessons ?? []).map((lesson) => String(lesson.lessonId)));
  const decisions = new Map((decisionsDoc.decisions ?? []).map((decision) => [String(decision.edgeId), decision]));
  const byLesson = new Map([...lessonIds].map((lessonId) => [lessonId, []]));
  const seenEdges = new Set();
  let inconsistentDecisionCount = 0;
  let invalidDecisionCount = 0;
  let validDecisionCount = 0;
  let partialDecisionCount = 0;
  let approvedDecisionCount = 0;
  let rejectedDecisionCount = 0;
  for (const dossier of dossierDoc.dossiers ?? []) {
    if (seenEdges.has(dossier.edgeId)) throw new Error(`Duplicate standards edge ${dossier.edgeId}`);
    seenEdges.add(dossier.edgeId);
    const explicitDecision = decisions.get(String(dossier.edgeId)) ?? null;
    const explicitStatus = decisionStatusOf(explicitDecision);
    const { signature: recordedSignature, ...unsignedDecision } = explicitDecision ?? {};
    const signatureValid = explicitDecision ? hash(JSON.stringify(unsignedDecision)) === recordedSignature : false;
    const { dossierHash: currentDossierHash, ...readyDossierCore } = dossier;
    readyDossierCore.claimLimit = "Planning/review only. Not a verified alignment or mastery claim.";
    readyDossierCore.review = { status: "candidate", reviewer: null, reviewedAt: null, notes: null, officialTextSnapshot: null, officialSourceUrl: null, claimBoundary: null, approvedDepth: null };
    const legacyReadyDossierCore = structuredClone(readyDossierCore);
    legacyReadyDossierCore.review = { status: "ready-for-human-review", reviewer: null, reviewedAt: null, notes: null, officialTextSnapshot: null, approvedDepth: null };
    const signedDossierBasisValid = explicitDecision
      ? explicitDecision.dossierHash === currentDossierHash
        || explicitDecision.dossierHash === hash(JSON.stringify(readyDossierCore))
        || explicitDecision.dossierHash === hash(JSON.stringify(legacyReadyDossierCore))
      : false;
    const reviewMatches = Boolean(explicitStatus && normalizeStandardsDecisionStatus(dossier.review?.status) === explicitStatus);
    const contractValid = explicitDecision ? validateStandardsDecision(explicitDecision).errors.length === 0 : false;
    const decisionValid = Boolean(explicitDecision && signatureValid && signedDossierBasisValid && reviewMatches && contractValid);
    if (explicitDecision && !reviewMatches) inconsistentDecisionCount += 1;
    if (explicitDecision && !decisionValid) invalidDecisionCount += 1;
    if (decisionValid) {
      validDecisionCount += 1;
      if (explicitStatus === "partial") partialDecisionCount += 1;
      if (explicitStatus === "approved") approvedDecisionCount += 1;
      if (explicitStatus === "rejected") rejectedDecisionCount += 1;
    }
    const reviewStatus = decisionValid ? explicitStatus : "candidate";
    const coveredLessons = new Set([...(dossier.evidenceSummary?.lessonIds ?? []), ...(dossier.stepEvidence ?? []).map((step) => step.lessonId)].map(String));
    for (const lessonId of coveredLessons) {
      if (!byLesson.has(lessonId)) continue;
      byLesson.get(lessonId).push({
        edgeId: String(dossier.edgeId), dossierHash: String(dossier.dossierHash), framework: String(dossier.framework),
        candidateCode: String(dossier.candidateCode), candidateDepth: String(dossier.candidateDepth),
        sourceTextStatus: String(dossier.sourceTextStatus), reviewStatus,
        decisionIntegrityStatus: explicitDecision ? decisionValid ? "VALID_EXPLICIT_HUMAN_DECISION" : "INVALID_OR_STALE_EXPLICIT_DECISION" : "NO_EXPLICIT_HUMAN_DECISION"
      });
    }
  }
  for (const entries of byLesson.values()) entries.sort((a, b) => a.edgeId.localeCompare(b.edgeId));
  const unboundDecisionCount = [...decisions.keys()].filter((edgeId) => !seenEdges.has(edgeId)).length;
  return {
    evidenceMap, dossierDoc, decisionsDoc, evidenceLessonIds, byLesson,
    inconsistentDecisionCount, invalidDecisionCount, unboundDecisionCount, validDecisionCount,
    partialDecisionCount, approvedDecisionCount, rejectedDecisionCount,
    pendingDecisionCount: (dossierDoc.dossiers ?? []).length - approvedDecisionCount - rejectedDecisionCount
  };
}

export function resolveLessonDecisionLedger({ lessons, raw }) {
  const file = "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl";
  const records = raw.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return { value: JSON.parse(line), line: index + 1 }; }
    catch (error) { throw new Error(`${file}:${index + 1} is not valid JSON: ${error.message}`); }
  });
  const schema = records[0]?.value;
  if (schema?.recordType !== "schema" || schema?.schemaVersion !== 1) throw new Error(`${file} must begin with the S244 schema record`);
  const lessonById = new Map(lessons.map((lesson) => [lesson.lessonId, lesson]));
  const dispositionEntries = records.slice(1).filter((entry) => entry.value.recordType === "lesson-disposition");
  const recordIdCounts = new Map();
  for (const { value } of dispositionEntries) {
    const id = String(value.recordId ?? "");
    if (id) recordIdCounts.set(id, (recordIdCounts.get(id) ?? 0) + 1);
  }
  const duplicateRecordIds = new Set([...recordIdCounts].filter(([, count]) => count > 1).map(([id]) => id));
  const unknownLessonRecordCount = dispositionEntries.filter(({ value }) => !lessonById.has(String(value.lessonId))).length;
  const latest = new Map();
  for (const entry of dispositionEntries) if (lessonById.has(String(entry.value.lessonId))) latest.set(String(entry.value.lessonId), entry);

  const allowedLesson = new Set(schema.contract.allowedLessonDecisions ?? []);
  const allowedVisual = new Set(schema.contract.allowedVisualDecisions ?? []);
  const allowedLanguage = new Set(schema.contract.allowedGradeLanguageDecisions ?? []);
  const byLesson = new Map();
  let currentCount = 0;
  let staleCount = 0;
  let invalidKnownLessonCount = 0;
  for (const lesson of lessons) {
    const entry = latest.get(lesson.lessonId);
    if (!entry) {
      byLesson.set(lesson.lessonId, { status: "PENDING_EXPLICIT_HUMAN_DECISION", decision: null, record: null, errors: [] });
      continue;
    }
    const { recordId, decision, visualDecision, gradeLanguageDecision } = entry.value;
    const record = entry.value;
    const errors = [];
    if (!recordId) errors.push("recordId");
    if (duplicateRecordIds.has(String(recordId))) errors.push("duplicateRecordId");
    if (!allowedLesson.has(decision)) errors.push("decision");
    if (!allowedVisual.has(visualDecision)) errors.push("visualDecision");
    if (!allowedLanguage.has(gradeLanguageDecision)) errors.push("gradeLanguageDecision");
    if (!String(record.reviewer ?? "").trim()) errors.push("reviewer");
    if (!String(record.rationale ?? "").trim()) errors.push("rationale");
    if (!String(record.reopenCondition ?? "").trim()) errors.push("reopenCondition");
    if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length === 0 || record.evidenceRefs.some((ref) => !String(ref).trim())) errors.push("evidenceRefs");
    if (!Number.isFinite(Date.parse(String(record.reviewedAt ?? "")))) errors.push("reviewedAt");
    if (!/^[a-f0-9]{64}$/i.test(String(record.reviewedBasisHash ?? ""))) errors.push("reviewedBasisHash");
    if (errors.length) {
      invalidKnownLessonCount += 1;
      byLesson.set(lesson.lessonId, { status: "INVALID_HUMAN_DECISION", decision: null, record, errors });
    } else if (record.reviewedBasisHash !== lesson.reviewBasisHash) {
      staleCount += 1;
      byLesson.set(lesson.lessonId, { status: "STALE_HUMAN_DECISION", decision: null, record, errors: [] });
    } else {
      currentCount += 1;
      byLesson.set(lesson.lessonId, { status: "CURRENT_HUMAN_DECISION", decision, record, errors: [] });
    }
  }
  return {
    file, raw, schema, byLesson,
    summary: {
      historyRecordCount: dispositionEntries.length,
      currentCount, staleCount,
      invalidCount: invalidKnownLessonCount + unknownLessonRecordCount,
      duplicateRecordIdCount: duplicateRecordIds.size,
      unknownLessonRecordCount
    }
  };
}

export function reviewQueueDirective(disposition) {
  const current = disposition?.status === "CURRENT_HUMAN_DECISION";
  return {
    emitGenericReviewRows: !current,
    emitRevisionImplementationRow: current && (disposition.decision === "REVISE" || disposition.decision === "ESCALATE")
  };
}

export function loadLessonReviewAuthority(root) {
  const lessons = loadLessons(root);
  const lessonIds = new Set(lessons.map((lesson) => lesson.lessonId));
  const duplicateInventory = buildDuplicateInventory(lessons);
  const standards = buildStandardsAuthority({
    lessonIds,
    evidenceMap: JSON.parse(fs.readFileSync(path.join(root, "content/standards/lesson-evidence-map.json"), "utf8")),
    dossierDoc: JSON.parse(fs.readFileSync(path.join(root, "content/standards/evidence-dossiers.json"), "utf8")),
    decisionsDoc: JSON.parse(fs.readFileSync(path.join(root, "content/standards/human-review-decisions.json"), "utf8"))
  });
  for (const lesson of lessons) {
    lesson.reviewBasisHash = deriveLessonReviewBasisHash({
      lessonCourseBasisHash: lesson.lessonCourseBasisHash,
      duplicateClusters: duplicateInventory.byLesson.get(lesson.lessonId) ?? [],
      standardsEdges: standards.byLesson.get(lesson.lessonId) ?? []
    });
  }
  const decisionsRaw = fs.readFileSync(path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl"), "utf8");
  return { lessons, duplicateInventory, standards, lessonDecisions: resolveLessonDecisionLedger({ lessons, raw: decisionsRaw }) };
}
