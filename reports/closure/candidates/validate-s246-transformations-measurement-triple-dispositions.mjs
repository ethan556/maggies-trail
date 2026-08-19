import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S246_TRANSFORMATIONS_MEASUREMENT_TRIPLE_DISPOSITIONS.jsonl");
const cardPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/transformations-measurement/course.json");

const reviewer = "ChatGPT Work independent assessor (transformations-measurement)";
const expected = {
  "tm-01-01": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-01-02": ["KEEP", "SUFFICIENT", "FIT"],
  "tm-01-03": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-01b-01": ["KEEP", "SUFFICIENT", "FIT"],
  "tm-01b-02": ["KEEP", "SUFFICIENT", "FIT"],
  "tm-01b-03": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-02-01": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-02-02": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-02-03": ["KEEP", "SUFFICIENT", "FIT"],
  "tm-03-01": ["KEEP", "SUFFICIENT", "FIT"],
  "tm-03-02": ["REVISE", "REQUIRED", "FIT"],
  "tm-03-03": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-04-01": ["REVISE", "REQUIRED", "REVISE"],
  "tm-04-02": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-04-03": ["REVISE", "REQUIRED", "FIT"],
  "tm-05-01": ["REVISE", "SUFFICIENT", "FIT"],
  "tm-05-02": ["REVISE", "REQUIRED", "FIT"],
  "tm-05-03": ["REVISE", "SUFFICIENT", "REVISE"]
};
const expectedDistribution = {
  decisions: { KEEP: 5, REVISE: 13, ESCALATE: 0 },
  visualDecisions: { REQUIRED: 4, PREFERRED: 0, SUFFICIENT: 14, ESCALATE: 0 },
  gradeLanguageDecisions: { FIT: 16, REVISE: 2, ESCALATE: 0 }
};

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (file) => fs.readFileSync(file, "utf8");
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const countBy = (records, field, allowed) => Object.fromEntries(allowed.map((value) => [value, records.filter((record) => record[field] === value).length]));
const sameObject = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const duplicateValues = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const evidenceFile = (reference) => {
  const value = String(reference);
  const prefixes = ["content/", "reports/", "src/", "PREMIUM_PENDING_WORKLOAD_QUEUE.csv"];
  const prefix = prefixes.find((candidate) => value.startsWith(candidate));
  if (!prefix) return null;
  if (prefix === "PREMIUM_PENDING_WORKLOAD_QUEUE.csv") return prefix;
  const marker = value.indexOf(":", prefix.length);
  return marker === -1 ? value : value.slice(0, marker);
};

const schema = parseLines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const cardDocument = JSON.parse(read(cardPath));
const allCards = Array.isArray(cardDocument) ? cardDocument : (cardDocument.cards ?? cardDocument.lessonCards ?? []);
const cards = allCards.filter((card) => card.courseId === course.id);
const records = parseLines(candidatePath);
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const required = schema.contract.requiredDecisionFields;
const requiredKeys = new Set(["recordType", ...required]);
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
if (expectedIds.some((id) => !recordById.has(id)) || records.some((record) => !expectedIds.includes(record.lessonId))) errors.push("candidate lesson-id set differs from live course manifest");
if (expectedIds.some((id) => !cardById.has(id)) || cards.some((card) => !expectedIds.includes(card.lessonId))) errors.push("card lesson-id set differs from live course manifest");
if (Object.keys(expected).length !== expectedIds.length || expectedIds.some((id) => !expected[id])) errors.push("sealed expected-disposition map differs from manifest");

let lessonsWithRemedials = 0;
for (const lessonId of expectedIds) {
  const card = cardById.get(lessonId);
  const record = recordById.get(lessonId);
  if (!card) { errors.push(`${lessonId}: missing live card`); continue; }
  if (!record) { errors.push(`${lessonId}: missing candidate record`); continue; }
  const unexpectedKeys = Object.keys(record).filter((key) => !requiredKeys.has(key));
  const absentKeys = [...requiredKeys].filter((key) => !(key in record));
  if (unexpectedKeys.length) errors.push(`${lessonId}: unexpected fields ${unexpectedKeys.join(",")}`);
  if (absentKeys.length) errors.push(`${lessonId}: absent fields ${absentKeys.join(",")}`);
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S246-TM-${lessonId}`) errors.push(`${lessonId}: recordId does not follow the sealed course pattern`);
  for (const field of required) if (record[field] === undefined || record[field] === null || record[field] === "") errors.push(`${lessonId}: missing ${field}`);
  if (!allowedLesson.has(record.decision)) errors.push(`${lessonId}: invalid decision ${record.decision}`);
  if (!allowedVisual.has(record.visualDecision)) errors.push(`${lessonId}: invalid visualDecision ${record.visualDecision}`);
  if (!allowedLanguage.has(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid gradeLanguageDecision ${record.gradeLanguageDecision}`);
  if (JSON.stringify([record.decision, record.visualDecision, record.gradeLanguageDecision]) !== JSON.stringify(expected[lessonId])) errors.push(`${lessonId}: dispositions differ from sealed assessment`);
  if (record.reviewer !== reviewer) errors.push(`${lessonId}: unexpected reviewer`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.reviewedAt) || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (String(record.rationale).trim().length < 240) errors.push(`${lessonId}: rationale is not substantive`);
  if (String(record.reopenCondition).trim().length < 180) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!/^[a-f0-9]{64}$/.test(record.reviewedBasisHash)) errors.push(`${lessonId}: reviewedBasisHash format`);
  if (record.reviewedBasisHash !== card.reviewBasisHash) errors.push(`${lessonId}: stale review basis`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 3 || record.evidenceRefs.some((ref) => !String(ref).trim())) errors.push(`${lessonId}: evidenceRefs must contain at least three non-empty references`);
  else {
    const lessonRef = `content/courses/transformations-measurement/lessons/${lessonId}.json`;
    if (!record.evidenceRefs.some((ref) => String(ref).startsWith(lessonRef))) errors.push(`${lessonId}: missing lesson-source evidence`);
    if (!record.evidenceRefs.some((ref) => String(ref).includes(`S244-RC-${lessonId}`))) errors.push(`${lessonId}: missing current-card evidence`);
    if (!record.evidenceRefs.some((ref) => /VIS01_PLACEMENTS|PREMIUM_PENDING_WORKLOAD_QUEUE|figures\.tsx/.test(String(ref)))) errors.push(`${lessonId}: missing visual or queue evidence`);
    for (const reference of record.evidenceRefs) {
      const file = evidenceFile(reference);
      if (!file || !fs.existsSync(path.join(root, file))) errors.push(`${lessonId}: missing evidence file for ${reference}`);
    }
  }
  const lessonSource = path.join(root, card.source);
  if (!fs.existsSync(lessonSource)) errors.push(`${lessonId}: missing source ${card.source}`);
  else {
    const lesson = JSON.parse(read(lessonSource));
    if (lesson.id !== lessonId || lesson.courseId !== course.id) errors.push(`${lessonId}: lesson identity/course mismatch`);
    if (!Array.isArray(lesson.steps) || !lesson.steps.length) errors.push(`${lessonId}: complete lesson path missing`);
    if (Array.isArray(lesson.remedials) && lesson.remedials.length) lessonsWithRemedials += 1;
    if (sha256(read(lessonSource)) !== card.lessonSourceHash) errors.push(`${lessonId}: lesson source hash differs from card`);
  }
  const liveCoursePath = path.join(root, card.courseSource);
  if (!fs.existsSync(liveCoursePath)) errors.push(`${lessonId}: missing course source ${card.courseSource}`);
  else if (sha256(read(liveCoursePath)) !== card.courseSourceHash) errors.push(`${lessonId}: course source hash differs from card`);
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
  lessonSourceHashesCurrent: expectedIds.filter((id) => { const card = cardById.get(id); return card && fs.existsSync(path.join(root, card.source)) && sha256(read(path.join(root, card.source))) === card.lessonSourceHash; }).length,
  courseSourceHashesCurrent: expectedIds.filter((id) => { const card = cardById.get(id); return card && fs.existsSync(path.join(root, card.courseSource)) && sha256(read(path.join(root, card.courseSource))) === card.courseSourceHash; }).length,
  lessonsWithRemedials,
  completeRequiredFieldRecords: records.filter((record) => required.every((field) => record[field] !== undefined && record[field] !== null && record[field] !== "")).length,
  exactContractFields: records.filter((record) => Object.keys(record).length === requiredKeys.size && Object.keys(record).every((key) => requiredKeys.has(key))).length,
  uniqueRecordIds: new Set(records.map((record) => record.recordId)).size,
  decisions,
  visualDecisions,
  gradeLanguageDecisions,
  expectedGenericReviewRowsAfterAuthoritativeIntegration: { LESSON_COMPLETE_DISPOSITION: records.length, VISUAL_FIRST_REPRESENTATION: records.length, GRADE_LANGUAGE_REVIEW: records.length, total: records.length * 3 },
  resultingImplementationDebt: { lessonRevisionImplementationRows: 13, requiredVisualLessons: 4, gradeLanguageRevisionLessons: 2, flaggedProgressionLessons: 8, choiceSurfaceRows: 3, mathPresentationRows: 47, withheldIllustrationRows: 2, independentlyFoundProofPackets: 1, independentlyFoundCoordinateVisualPackets: 1 },
  candidateSha256: sha256(read(candidatePath)),
  errors
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
