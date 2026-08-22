import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const candidateDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(candidateDir, "../../..");
const candidatePath = path.join(candidateDir, "COUNTING_TO_100_K_S246_LESSON_DISPOSITIONS.jsonl");
const cardsPath = path.join(repoRoot, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const coursePath = path.join(repoRoot, "content/courses/counting-to-100-k/course.json");

const records = fs.readFileSync(candidatePath, "utf8").trim().split(/\r?\n/).map((line, index) => {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`${path.relative(repoRoot, candidatePath)}:${index + 1}: ${error.message}`);
  }
});
const cards = JSON.parse(fs.readFileSync(cardsPath, "utf8")).cards;
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds).sort();
const cardById = new Map(cards.filter((card) => card.courseId === course.id).map((card) => [card.lessonId, card]));
const allowedLesson = new Set(["KEEP", "REVISE", "ESCALATE"]);
const allowedVisual = new Set(["REQUIRED", "PREFERRED", "SUFFICIENT", "ESCALATE"]);
const allowedLanguage = new Set(["FIT", "REVISE", "ESCALATE"]);
const requiredFields = ["recordId", "lessonId", "reviewedBasisHash", "decision", "visualDecision", "gradeLanguageDecision", "reviewer", "reviewedAt", "rationale", "evidenceRefs", "reopenCondition"];
const failures = [];
const recordIds = new Set();
const actualIds = records.map((record) => record.lessonId).sort();

if (records.length !== 18) failures.push(`expected 18 records, found ${records.length}`);
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) failures.push("candidate lesson IDs do not exactly match the course manifest");
if (cardById.size !== 18) failures.push(`expected 18 current review cards, found ${cardById.size}`);

for (const [index, record] of records.entries()) {
  const where = `record ${index + 1} (${record.lessonId ?? "missing lessonId"})`;
  if (record.recordType !== "lesson-disposition") failures.push(`${where}: invalid recordType`);
  for (const field of requiredFields) {
    if (record[field] === undefined || record[field] === null || record[field] === "") failures.push(`${where}: missing ${field}`);
  }
  if (recordIds.has(record.recordId)) failures.push(`${where}: duplicate recordId ${record.recordId}`);
  recordIds.add(record.recordId);
  if (!allowedLesson.has(record.decision)) failures.push(`${where}: invalid decision ${record.decision}`);
  if (!allowedVisual.has(record.visualDecision)) failures.push(`${where}: invalid visualDecision ${record.visualDecision}`);
  if (!allowedLanguage.has(record.gradeLanguageDecision)) failures.push(`${where}: invalid gradeLanguageDecision ${record.gradeLanguageDecision}`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) failures.push(`${where}: reviewedAt is not parseable`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 3 || record.evidenceRefs.some((ref) => typeof ref !== "string" || !ref.trim())) failures.push(`${where}: at least three non-empty evidenceRefs are required`);
  if (!record.evidenceRefs?.some((ref) => ref.includes(`/lessons/${record.lessonId}.json`))) failures.push(`${where}: lesson-source evidence is missing`);
  if (!record.evidenceRefs?.some((ref) => ref.includes("FIGURE_TEXT_ALIGNMENT_AUDIT.csv"))) failures.push(`${where}: visual-alignment evidence is missing`);
  if (String(record.rationale).trim().length < 120) failures.push(`${where}: rationale is not substantive`);
  if (String(record.reopenCondition).trim().length < 80) failures.push(`${where}: reopenCondition is not substantive`);
  const card = cardById.get(record.lessonId);
  if (!card) failures.push(`${where}: no current course review card`);
  else if (record.reviewedBasisHash !== card.reviewBasisHash) failures.push(`${where}: stale reviewedBasisHash`);
}

const countBy = (key) => Object.fromEntries([...new Set(records.map((record) => record[key]))].sort().map((value) => [value, records.filter((record) => record[key] === value).length]));
const summary = {
  courseId: course.id,
  records: records.length,
  currentBasisHashes: records.filter((record) => cardById.get(record.lessonId)?.reviewBasisHash === record.reviewedBasisHash).length,
  uniqueRecordIds: recordIds.size,
  decisions: countBy("decision"),
  visualDecisions: countBy("visualDecision"),
  gradeLanguageDecisions: countBy("gradeLanguageDecision"),
  expectedThreeStreamDispositionRows: records.length * 3,
  failures
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
