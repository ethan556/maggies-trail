import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S246_BIVARIATE_STATISTICS_TRIPLE_DISPOSITIONS.jsonl");
const cardPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/bivariate-statistics/course.json");

const expectedDistribution = {
  decisions: { KEEP: 2, REVISE: 12, ESCALATE: 1 },
  visualDecisions: { REQUIRED: 8, PREFERRED: 1, SUFFICIENT: 5, ESCALATE: 1 },
  gradeLanguageDecisions: { FIT: 11, REVISE: 4, ESCALATE: 0 }
};

const expectedEscalation = "bv-05-03";
const reviewer = "ChatGPT Work independent assessor (bivariate-statistics)";
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (file) => fs.readFileSync(file, "utf8");
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`);
  }
});
const countBy = (records, field, allowed) => Object.fromEntries(
  allowed.map((value) => [value, records.filter((record) => record[field] === value).length])
);
const sameObject = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const duplicateValues = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const evidenceFile = (reference) => {
  const value = String(reference);
  if (value.startsWith("PREMIUM_PENDING_WORKLOAD_QUEUE.csv")) return "PREMIUM_PENDING_WORKLOAD_QUEUE.csv";
  const match = value.match(/^((?:content|reports)\/.+?\.(?:json|jsonl|csv|md|ts|mjs))(?::|#|$)/);
  return match?.[1] ?? null;
};
const ols = (points) => {
  const meanX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const meanY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const numerator = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const denominator = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
  const m = numerator / denominator;
  const b = meanY - m * meanX;
  const residuals = points.map(([x, y]) => y - (m * x + b));
  return { m, b, residuals, sum: residuals.reduce((total, value) => total + value, 0) };
};

const schema = parseLines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const cards = JSON.parse(read(cardPath)).cards.filter((card) => card.courseId === course.id);
const records = parseLines(candidatePath);
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const required = schema.contract.requiredDecisionFields;
const exactFields = ["recordType", ...required].sort();
const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const allowedLesson = new Set(lessonEnums);
const allowedVisual = new Set(visualEnums);
const allowedLanguage = new Set(languageEnums);
const errors = [];

for (const duplicate of duplicateValues(records.map((record) => record.recordId))) errors.push(`duplicate recordId ${duplicate}`);
for (const duplicate of duplicateValues(records.map((record) => record.lessonId))) errors.push(`duplicate lessonId ${duplicate}`);
if (new Set(expectedIds).size !== expectedIds.length) errors.push("course manifest contains duplicate lesson IDs");
if (records.length !== expectedIds.length) errors.push(`record count ${records.length} != ${expectedIds.length}`);
if (cards.length !== expectedIds.length) errors.push(`card count ${cards.length} != ${expectedIds.length}`);
if (expectedIds.some((id) => !recordById.has(id)) || records.some((record) => !expectedIds.includes(record.lessonId))) {
  errors.push("candidate lesson-id set differs from live course manifest");
}
if (expectedIds.some((id) => !cardById.has(id)) || cards.some((card) => !expectedIds.includes(card.lessonId))) {
  errors.push("card lesson-id set differs from live course manifest");
}

for (const lessonId of expectedIds) {
  const card = cardById.get(lessonId);
  const record = recordById.get(lessonId);
  if (!card) {
    errors.push(`${lessonId}: missing live card`);
    continue;
  }
  if (!record) {
    errors.push(`${lessonId}: missing candidate record`);
    continue;
  }
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S246-BV-${lessonId}`) errors.push(`${lessonId}: recordId does not follow the sealed course pattern`);
  const actualFields = Object.keys(record).sort();
  if (!sameObject(actualFields, exactFields)) errors.push(`${lessonId}: fields differ from the authoritative contract`);
  for (const field of required) {
    const value = record[field];
    if (value === undefined || value === null || value === "") errors.push(`${lessonId}: missing ${field}`);
  }
  if (!allowedLesson.has(record.decision)) errors.push(`${lessonId}: invalid decision ${record.decision}`);
  if (!allowedVisual.has(record.visualDecision)) errors.push(`${lessonId}: invalid visualDecision ${record.visualDecision}`);
  if (!allowedLanguage.has(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid gradeLanguageDecision ${record.gradeLanguageDecision}`);
  if (record.reviewer !== reviewer) errors.push(`${lessonId}: unexpected reviewer`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (String(record.rationale).trim().length < 240) errors.push(`${lessonId}: rationale is not substantive`);
  if (String(record.reopenCondition).trim().length < 170) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!/^[a-f0-9]{64}$/.test(record.reviewedBasisHash)) errors.push(`${lessonId}: reviewedBasisHash format`);
  if (record.reviewedBasisHash !== card.reviewBasisHash) errors.push(`${lessonId}: stale review basis`);

  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 3 || record.evidenceRefs.some((ref) => !String(ref).trim())) {
    errors.push(`${lessonId}: evidenceRefs must contain at least three non-empty references`);
  } else {
    const lessonRef = `content/courses/bivariate-statistics/lessons/${lessonId}.json`;
    if (!record.evidenceRefs.some((ref) => String(ref).startsWith(lessonRef))) errors.push(`${lessonId}: missing lesson-source evidence`);
    if (!record.evidenceRefs.some((ref) => String(ref).includes(`S244-RC-${lessonId}`))) errors.push(`${lessonId}: missing current-card evidence`);
    if (!record.evidenceRefs.some((ref) => /VIS01_PLACEMENTS/.test(String(ref)))) errors.push(`${lessonId}: missing live visual-placement evidence`);
    for (const reference of record.evidenceRefs) {
      const file = evidenceFile(reference);
      if (!file || !fs.existsSync(path.join(root, file))) errors.push(`${lessonId}: missing evidence file for ${reference}`);
    }
  }

  const lessonSource = path.join(root, card.source);
  if (!fs.existsSync(lessonSource)) errors.push(`${lessonId}: missing source ${card.source}`);
  else if (sha256(read(lessonSource)) !== card.lessonSourceHash) errors.push(`${lessonId}: lesson source hash differs from card`);
  const liveCoursePath = path.join(root, card.courseSource);
  if (!fs.existsSync(liveCoursePath)) errors.push(`${lessonId}: missing course source ${card.courseSource}`);
  else if (sha256(read(liveCoursePath)) !== card.courseSourceHash) errors.push(`${lessonId}: course source hash differs from card`);
}

const escalation = recordById.get(expectedEscalation);
if (escalation?.decision !== "ESCALATE" || escalation?.visualDecision !== "ESCALATE") {
  errors.push(`${expectedEscalation}: release-blocking semantic/visual escalation is not sealed`);
}
if (records.some((record) => record.lessonId !== expectedEscalation && (record.decision === "ESCALATE" || record.visualDecision === "ESCALATE"))) {
  errors.push("unexpected escalation outside the independently verified release blocker");
}
const fit = ols([[1, 3], [2, 6], [3, 7], [4, 9]]);
if (Math.abs(fit.m - 1.9) > 1e-12 || Math.abs(fit.b - 1.5) > 1e-12 || Math.abs(fit.sum) > 1e-12) {
  errors.push(`least-squares canary failed: ${JSON.stringify(fit)}`);
}

const decisions = countBy(records, "decision", lessonEnums);
const visualDecisions = countBy(records, "visualDecision", visualEnums);
const gradeLanguageDecisions = countBy(records, "gradeLanguageDecision", languageEnums);
if (!sameObject(decisions, expectedDistribution.decisions)) errors.push(`decision distribution ${JSON.stringify(decisions)}`);
if (!sameObject(visualDecisions, expectedDistribution.visualDecisions)) errors.push(`visual distribution ${JSON.stringify(visualDecisions)}`);
if (!sameObject(gradeLanguageDecisions, expectedDistribution.gradeLanguageDecisions)) errors.push(`language distribution ${JSON.stringify(gradeLanguageDecisions)}`);

const report = {
  status: errors.length === 0 ? "PASS" : "FAIL",
  courseId: course.id,
  expectedLessonCount: expectedIds.length,
  candidateRecordCount: records.length,
  liveCardCount: cards.length,
  exactManifestLessonIds: !errors.some((error) => error.includes("lesson-id set") || error.includes("manifest contains")),
  currentReviewBasisHashes: expectedIds.filter((id) => recordById.get(id)?.reviewedBasisHash === cardById.get(id)?.reviewBasisHash).length,
  lessonSourceHashesCurrent: expectedIds.filter((id) => {
    const card = cardById.get(id);
    return card && fs.existsSync(path.join(root, card.source)) && sha256(read(path.join(root, card.source))) === card.lessonSourceHash;
  }).length,
  courseSourceHashesCurrent: expectedIds.filter((id) => {
    const card = cardById.get(id);
    return card && fs.existsSync(path.join(root, card.courseSource)) && sha256(read(path.join(root, card.courseSource))) === card.courseSourceHash;
  }).length,
  completeRequiredFieldRecords: records.filter((record) => required.every((field) => record[field] !== undefined && record[field] !== null && record[field] !== "")).length,
  uniqueRecordIds: new Set(records.map((record) => record.recordId)).size,
  decisions,
  visualDecisions,
  gradeLanguageDecisions,
  leastSquaresCanary: {
    points: [[1, 3], [2, 6], [3, 7], [4, 9]],
    authoredClaim: "ŷ = 2x + 1; residual sum +1 treated as balanced/optimal",
    actualSlope: fit.m,
    actualIntercept: fit.b,
    actualResiduals: fit.residuals,
    actualResidualSum: fit.sum,
    releaseBlockerLessonId: expectedEscalation
  },
  expectedGenericReviewRowsAfterAuthoritativeIntegration: {
    LESSON_COMPLETE_DISPOSITION: records.length,
    VISUAL_FIRST_REPRESENTATION: records.length,
    GRADE_LANGUAGE_REVIEW: records.length,
    total: records.length * 3
  },
  candidateSha256: sha256(read(candidatePath)),
  errors
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
