import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S246_DECIMALS_INTRO_G4_TRIPLE_DISPOSITIONS.jsonl");
const cardPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/decimals-intro-g4/course.json");

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (file) => fs.readFileSync(file, "utf8");
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`);
  }
});

const schema = parseLines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const cards = JSON.parse(read(cardPath)).cards.filter((card) => card.courseId === course.id);
const records = parseLines(candidatePath);
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const required = schema.contract.requiredDecisionFields;
const allowedLesson = new Set(schema.contract.allowedLessonDecisions);
const allowedVisual = new Set(schema.contract.allowedVisualDecisions);
const allowedLanguage = new Set(schema.contract.allowedGradeLanguageDecisions);
const errors = [];

const duplicateValues = (values) => values.filter((value, index) => values.indexOf(value) !== index);
if (duplicateValues(records.map((record) => record.recordId)).length) errors.push("duplicate recordId");
if (duplicateValues(records.map((record) => record.lessonId)).length) errors.push("duplicate lessonId");
if (records.length !== expectedIds.length) errors.push(`record count ${records.length} != ${expectedIds.length}`);
if (cards.length !== expectedIds.length) errors.push(`card count ${cards.length} != ${expectedIds.length}`);
if (expectedIds.some((id) => !recordById.has(id)) || records.some((record) => !expectedIds.includes(record.lessonId))) {
  errors.push("candidate lesson-id set differs from live course manifest");
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
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: recordType`);
  for (const field of required) {
    const value = record[field];
    if (value === undefined || value === null || value === "") errors.push(`${lessonId}: missing ${field}`);
  }
  if (!allowedLesson.has(record.decision)) errors.push(`${lessonId}: decision`);
  if (!allowedVisual.has(record.visualDecision)) errors.push(`${lessonId}: visualDecision`);
  if (!allowedLanguage.has(record.gradeLanguageDecision)) errors.push(`${lessonId}: gradeLanguageDecision`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 2 || record.evidenceRefs.some((ref) => !String(ref).trim())) {
    errors.push(`${lessonId}: evidenceRefs`);
  }
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: reviewedAt`);
  if (!/^[a-f0-9]{64}$/.test(record.reviewedBasisHash)) errors.push(`${lessonId}: reviewedBasisHash format`);
  if (record.reviewedBasisHash !== card.reviewBasisHash) errors.push(`${lessonId}: stale review basis`);
  const lessonSource = path.join(root, card.source);
  if (!fs.existsSync(lessonSource)) errors.push(`${lessonId}: missing source ${card.source}`);
  else if (sha256(read(lessonSource)) !== card.lessonSourceHash) errors.push(`${lessonId}: lesson source hash differs from card`);
  const liveCoursePath = path.join(root, card.courseSource);
  if (!fs.existsSync(liveCoursePath)) errors.push(`${lessonId}: missing course source ${card.courseSource}`);
  else if (sha256(read(liveCoursePath)) !== card.courseSourceHash) errors.push(`${lessonId}: course source hash differs from card`);
}

const lessonCounts = Object.fromEntries([...allowedLesson].map((value) => [value, records.filter((record) => record.decision === value).length]));
const visualCounts = Object.fromEntries([...allowedVisual].map((value) => [value, records.filter((record) => record.visualDecision === value).length]));
const languageCounts = Object.fromEntries([...allowedLanguage].map((value) => [value, records.filter((record) => record.gradeLanguageDecision === value).length]));
const report = {
  status: errors.length === 0 ? "PASS" : "FAIL",
  courseId: course.id,
  expectedLessonCount: expectedIds.length,
  candidateRecordCount: records.length,
  liveCardCount: cards.length,
  exactLessonIdSet: !errors.some((error) => error.includes("lesson-id set")),
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
  decisions: lessonCounts,
  visualDecisions: visualCounts,
  gradeLanguageDecisions: languageCounts,
  expectedTripleStreamClosuresAfterLedgerIntegration: {
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
