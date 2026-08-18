import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S246_COORDINATE_PROOFS_TRIPLE_DISPOSITIONS.jsonl");
const cardPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/coordinate-proofs/course.json");

const expectedDistribution = {
  decisions: { KEEP: 1, REVISE: 14, ESCALATE: 0 },
  visualDecisions: { REQUIRED: 9, PREFERRED: 1, SUFFICIENT: 5, ESCALATE: 0 },
  gradeLanguageDecisions: { FIT: 10, REVISE: 5, ESCALATE: 0 },
};
const expectedRequiredVisuals = new Set([
  "cx-02-02", "cx-03-01", "cx-03-02", "cx-03-03", "cx-04-01",
  "cx-04-02", "cx-04-03", "cx-05-01", "cx-05-02",
]);
const expectedLanguageRevisions = new Set(["cx-03-02", "cx-03-03", "cx-04-02", "cx-04-03", "cx-05-03"]);
const requiredEvidenceFiles = new Set([
  "reports/closure/LESSON_REVIEW_CARDS_S244.csv",
  "content/courses/coordinate-proofs/course.json",
]);

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const duplicateValues = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const countBy = (records, field, allowed) => Object.fromEntries(allowed.map((value) => [value, records.filter((record) => record[field] === value).length]));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const evidenceFile = (reference) => {
  const value = String(reference);
  const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
};

const schema = parseLines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const cards = JSON.parse(read(cardPath)).cards.filter((card) => card.courseId === course.id);
const records = parseLines(candidatePath);
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const requiredFields = schema.contract.requiredDecisionFields;
const exactFields = new Set(["recordType", ...requiredFields]);
const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const errors = [];

if (course.id !== "coordinate-proofs" || course.gradeLevel !== 10) errors.push("unexpected live course identity or grade");
if (expectedIds.length !== 15) errors.push(`live manifest has ${expectedIds.length} lessons, expected 15`);
if (new Set(expectedIds).size !== expectedIds.length) errors.push("course manifest contains duplicate lesson IDs");
if (records.length !== expectedIds.length) errors.push(`candidate record count ${records.length} != ${expectedIds.length}`);
if (cards.length !== expectedIds.length) errors.push(`live card count ${cards.length} != ${expectedIds.length}`);
for (const value of duplicateValues(records.map((record) => record.recordId))) errors.push(`duplicate recordId ${value}`);
for (const value of duplicateValues(records.map((record) => record.lessonId))) errors.push(`duplicate lessonId ${value}`);
if (expectedIds.some((id) => !recordById.has(id)) || records.some((record) => !expectedIds.includes(record.lessonId))) errors.push("candidate lesson-id set differs from live course manifest");
if (expectedIds.some((id) => !cardById.has(id)) || cards.some((card) => !expectedIds.includes(card.lessonId))) errors.push("card lesson-id set differs from live course manifest");

for (const lessonId of expectedIds) {
  const card = cardById.get(lessonId);
  const record = recordById.get(lessonId);
  if (!card || !record) continue;
  const fields = Object.keys(record);
  for (const field of fields.filter((field) => !exactFields.has(field))) errors.push(`${lessonId}: unknown field ${field}`);
  for (const field of [...exactFields].filter((field) => !fields.includes(field))) errors.push(`${lessonId}: missing exact field ${field}`);
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S246-CX-${lessonId}`) errors.push(`${lessonId}: recordId pattern mismatch`);
  for (const field of requiredFields) if (record[field] === undefined || record[field] === null || record[field] === "") errors.push(`${lessonId}: empty ${field}`);
  if (!lessonEnums.includes(record.decision)) errors.push(`${lessonId}: invalid decision ${record.decision}`);
  if (!visualEnums.includes(record.visualDecision)) errors.push(`${lessonId}: invalid visualDecision ${record.visualDecision}`);
  if (!languageEnums.includes(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid gradeLanguageDecision ${record.gradeLanguageDecision}`);
  if (record.reviewer !== "ChatGPT Work independent assessor (coordinate-proofs)") errors.push(`${lessonId}: unexpected reviewer`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (!/^[a-f0-9]{64}$/.test(record.reviewedBasisHash)) errors.push(`${lessonId}: malformed reviewedBasisHash`);
  if (record.reviewedBasisHash !== card.reviewBasisHash) errors.push(`${lessonId}: stale review basis`);
  if (String(record.rationale).trim().length < 280) errors.push(`${lessonId}: rationale is not independently substantive`);
  if (String(record.reopenCondition).trim().length < 150) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 3 || record.evidenceRefs.some((reference) => !String(reference).trim())) {
    errors.push(`${lessonId}: requires at least three non-empty evidence references`);
  } else {
    const lessonPrefix = `content/courses/coordinate-proofs/lessons/${lessonId}.json`;
    if (!record.evidenceRefs.some((reference) => String(reference).startsWith(lessonPrefix))) errors.push(`${lessonId}: missing complete lesson evidence`);
    if (!record.evidenceRefs.some((reference) => String(reference).includes(`S244-RC-${lessonId}`))) errors.push(`${lessonId}: missing live card evidence`);
    if (!record.evidenceRefs.some((reference) => /FIGURE_TEXT_ALIGNMENT_AUDIT|reports\/vis\/VIS01_PLACEMENTS|src\/components\/(figures|widgets)\.tsx|PREMIUM_PENDING_WORKLOAD_QUEUE/.test(String(reference)))) errors.push(`${lessonId}: missing visual or queue evidence`);
    for (const reference of record.evidenceRefs) {
      const file = evidenceFile(reference);
      if (!fs.existsSync(path.join(root, file))) errors.push(`${lessonId}: missing evidence file ${file}`);
    }
  }
  const lessonSource = path.join(root, card.source);
  if (!fs.existsSync(lessonSource) || sha256(read(lessonSource)) !== card.lessonSourceHash) errors.push(`${lessonId}: lesson source hash differs from card`);
  const courseSource = path.join(root, card.courseSource);
  if (!fs.existsSync(courseSource) || sha256(read(courseSource)) !== card.courseSourceHash) errors.push(`${lessonId}: course source hash differs from card`);
  if (record.decision === "KEEP" && (record.visualDecision !== "SUFFICIENT" || record.gradeLanguageDecision !== "FIT")) errors.push(`${lessonId}: KEEP requires SUFFICIENT/FIT in this packet`);
  if (expectedRequiredVisuals.has(lessonId) !== (record.visualDecision === "REQUIRED")) errors.push(`${lessonId}: required-visual adjudication differs from reviewed blocker map`);
  if (expectedLanguageRevisions.has(lessonId) !== (record.gradeLanguageDecision === "REVISE")) errors.push(`${lessonId}: language adjudication differs from reviewed blocker map`);
}

for (const file of requiredEvidenceFiles) if (!fs.existsSync(path.join(root, file))) errors.push(`missing required shared evidence ${file}`);
const decisions = countBy(records, "decision", lessonEnums);
const visualDecisions = countBy(records, "visualDecision", visualEnums);
const gradeLanguageDecisions = countBy(records, "gradeLanguageDecision", languageEnums);
if (!same(decisions, expectedDistribution.decisions)) errors.push(`decision distribution ${JSON.stringify(decisions)}`);
if (!same(visualDecisions, expectedDistribution.visualDecisions)) errors.push(`visual distribution ${JSON.stringify(visualDecisions)}`);
if (!same(gradeLanguageDecisions, expectedDistribution.gradeLanguageDecisions)) errors.push(`language distribution ${JSON.stringify(gradeLanguageDecisions)}`);

const report = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  gradeLevel: course.gradeLevel,
  manifestLessons: expectedIds.length,
  candidateRecords: records.length,
  liveCards: cards.length,
  currentReviewBasisHashes: expectedIds.filter((id) => recordById.get(id)?.reviewedBasisHash === cardById.get(id)?.reviewBasisHash).length,
  lessonSourceHashesCurrent: expectedIds.filter((id) => {
    const card = cardById.get(id); return card && fs.existsSync(path.join(root, card.source)) && sha256(read(path.join(root, card.source))) === card.lessonSourceHash;
  }).length,
  courseSourceHashesCurrent: expectedIds.filter((id) => {
    const card = cardById.get(id); return card && fs.existsSync(path.join(root, card.courseSource)) && sha256(read(path.join(root, card.courseSource))) === card.courseSourceHash;
  }).length,
  exactManifestLessonIds: !errors.some((error) => error.includes("lesson-id set") || error.includes("manifest contains")),
  completeExactFieldRecords: records.filter((record) => Object.keys(record).length === exactFields.size && [...exactFields].every((field) => record[field] !== undefined && record[field] !== null && record[field] !== "")).length,
  uniqueRecordIds: new Set(records.map((record) => record.recordId)).size,
  decisions,
  visualDecisions,
  gradeLanguageDecisions,
  genericReviewRowsEligibleToCloseAfterAuthoritativeAppend: { LESSON_COMPLETE_DISPOSITION: 15, VISUAL_FIRST_REPRESENTATION: 15, GRADE_LANGUAGE_REVIEW: 15, total: 45 },
  reviewedRevisionImplementationRowsExpected: 14,
  candidateSha256: sha256(read(candidatePath)),
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
