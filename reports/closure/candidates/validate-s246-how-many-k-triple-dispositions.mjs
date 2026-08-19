import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S246_HOW_MANY_K_TRIPLE_DISPOSITIONS.jsonl");
const cardsPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/how-many-k/course.json");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const builderPath = path.join(root, "scripts/session/build-how-many-k.mjs");

const expectedDistribution = {
  decisions: { KEEP: 0, REVISE: 16, ESCALATE: 0 },
  visualDecisions: { REQUIRED: 16, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 },
  gradeLanguageDecisions: { FIT: 0, REVISE: 16, ESCALATE: 0 },
};
const expectedQueue = {
  ILLUSTRATION_REPLACEMENT: 32,
  LESSON_PROGRESSION_AND_DUPLICATION: 16,
  CHOICE_SURFACE_INTEGRITY: 2,
  GRADE_LANGUAGE_REVIEW: 16,
  LESSON_COMPLETE_DISPOSITION: 16,
  VISUAL_FIRST_REPRESENTATION: 16,
};

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const countBy = (records, field, allowed) => Object.fromEntries(allowed.map((value) => [value, records.filter((record) => record[field] === value).length]));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const duplicateValues = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const evidenceFile = (reference) => {
  const value = String(reference);
  const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
};
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...values] = rows.filter((candidate) => candidate.some((entry) => entry !== ""));
  return values.map((valuesRow) => Object.fromEntries(headers.map((header, index) => [header, valuesRow[index] ?? ""])));
}

const schema = parseLines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => card.courseId === course.id);
const records = parseLines(candidatePath);
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const queue = parseCsv(read(queuePath)).filter((row) => row.lesson_id.startsWith("khm-"));
const requiredFields = schema.contract.requiredDecisionFields;
const exactFields = new Set(["recordType", ...requiredFields]);
const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const errors = [];

if (course.id !== "how-many-k" || course.gradeLevel !== 0) errors.push("unexpected live course identity or grade");
if (expectedIds.length !== 16) errors.push(`live manifest has ${expectedIds.length} lessons, expected 16`);
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
  if (record.recordId !== `S246-KHM-${lessonId}`) errors.push(`${lessonId}: recordId pattern mismatch`);
  for (const field of requiredFields) if (record[field] === undefined || record[field] === null || record[field] === "") errors.push(`${lessonId}: empty ${field}`);
  if (!lessonEnums.includes(record.decision)) errors.push(`${lessonId}: invalid decision ${record.decision}`);
  if (!visualEnums.includes(record.visualDecision)) errors.push(`${lessonId}: invalid visualDecision ${record.visualDecision}`);
  if (!languageEnums.includes(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid gradeLanguageDecision ${record.gradeLanguageDecision}`);
  if (record.reviewer !== "ChatGPT Work independent assessor (how-many-k)") errors.push(`${lessonId}: unexpected reviewer`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (record.reviewedBasisHash !== card.reviewBasisHash) errors.push(`${lessonId}: stale review basis`);
  if (String(record.rationale).trim().length < 300) errors.push(`${lessonId}: rationale is not independently substantive`);
  if (String(record.reopenCondition).trim().length < 170) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== "REVISE") errors.push(`${lessonId}: differs from reviewed triple disposition`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 4) errors.push(`${lessonId}: requires at least four evidence references`);
  else {
    if (!record.evidenceRefs.some((reference) => String(reference).startsWith(`content/courses/how-many-k/lessons/${lessonId}.json`))) errors.push(`${lessonId}: missing complete lesson evidence`);
    if (!record.evidenceRefs.some((reference) => String(reference).includes(`S244-RC-${lessonId}`))) errors.push(`${lessonId}: missing live card evidence`);
    if (!record.evidenceRefs.some((reference) => String(reference).includes(`PROGRESSION-${lessonId}`))) errors.push(`${lessonId}: missing progression evidence`);
    if (!record.evidenceRefs.some((reference) => /PREMIUM_PENDING_WORKLOAD_QUEUE|build-how-many-k|MCQ_DUPLICATE_ITEM_INDEX/.test(String(reference)))) errors.push(`${lessonId}: missing root-cause evidence`);
    for (const reference of record.evidenceRefs) {
      const file = evidenceFile(reference);
      if (!fs.existsSync(path.join(root, file))) errors.push(`${lessonId}: missing evidence file ${file}`);
    }
  }
  const lessonSource = path.join(root, card.source);
  const courseSource = path.join(root, card.courseSource);
  if (!fs.existsSync(lessonSource) || sha256(read(lessonSource)) !== card.lessonSourceHash) errors.push(`${lessonId}: lesson source hash differs from card`);
  if (!fs.existsSync(courseSource) || sha256(read(courseSource)) !== card.courseSourceHash) errors.push(`${lessonId}: course source hash differs from card`);
}

const queueCounts = Object.fromEntries(Object.keys(expectedQueue).map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
if (!same(queueCounts, expectedQueue)) errors.push(`scoped queue distribution ${JSON.stringify(queueCounts)}`);
const p0 = queue.filter((row) => row.priority === "P0");
if (p0.length !== 48) errors.push(`P0 count ${p0.length} != 48`);
if (p0.filter((row) => row.workstream === "ILLUSTRATION_REPLACEMENT").length !== 32) errors.push("expected 32 P0 illustration rows");
if (p0.filter((row) => row.workstream === "LESSON_PROGRESSION_AND_DUPLICATION").length !== 16) errors.push("expected 16 P0 progression rows");
for (const lessonId of expectedIds) {
  if (queue.filter((row) => row.lesson_id === lessonId && row.workstream === "ILLUSTRATION_REPLACEMENT").length !== 2) errors.push(`${lessonId}: expected two P0 figure rows`);
  if (queue.filter((row) => row.lesson_id === lessonId && row.workstream === "LESSON_PROGRESSION_AND_DUPLICATION").length !== 1) errors.push(`${lessonId}: expected one P0 progression row`);
}
const builder = read(builderPath);
if (!builder.includes('{ id: "c1", kind: "concept", figure: "count-on-hops"')) errors.push("builder no longer has reviewed hard-coded c1 figure root cause");
if (!builder.includes('{ id: "c2", kind: "concept", figure: "count-on-hops"')) errors.push("builder no longer has reviewed hard-coded c2 figure root cause");
if (!builder.includes('const i2w = typeof d.i1.widget === "function" ? d.i1.widget()')) errors.push("builder no longer has reviewed i2 clone root cause");
for (const lessonId of ["khm-03-05", "khm-03-06"]) {
  const lesson = JSON.parse(read(path.join(root, `content/courses/how-many-k/lessons/${lessonId}.json`)));
  const flashes = lesson.steps.filter((step) => step.widget?.type === "subitizeFlash");
  if (flashes.length !== 2 || flashes.some((step) => step.widget.count === 5 || !/5/.test(step.widget.successFeedback) || !/5/.test(step.widget.missFeedback))) errors.push(`${lessonId}: reviewed false flash-feedback blocker changed`);
}

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
  lessonSourceHashesCurrent: expectedIds.filter((id) => { const card = cardById.get(id); return card && sha256(read(path.join(root, card.source))) === card.lessonSourceHash; }).length,
  courseSourceHashesCurrent: expectedIds.filter((id) => { const card = cardById.get(id); return card && sha256(read(path.join(root, card.courseSource))) === card.courseSourceHash; }).length,
  exactManifestLessonIds: !errors.some((error) => error.includes("lesson-id set") || error.includes("manifest contains")),
  completeExactFieldRecords: records.filter((record) => Object.keys(record).length === exactFields.size && [...exactFields].every((field) => record[field] !== undefined && record[field] !== null && record[field] !== "")).length,
  uniqueRecordIds: new Set(records.map((record) => record.recordId)).size,
  decisions,
  visualDecisions,
  gradeLanguageDecisions,
  scopedOpenQueueRows: queue.length,
  p0RowsReviewed: { ILLUSTRATION_REPLACEMENT: 32, LESSON_PROGRESSION_AND_DUPLICATION: 16, total: 48 },
  otherOpenRowsReviewed: { CHOICE_SURFACE_INTEGRITY: 2, genericTripleReview: 48, total: 50 },
  genericReviewRowsEligibleToCloseAfterAuthoritativeAppend: { LESSON_COMPLETE_DISPOSITION: 16, VISUAL_FIRST_REPRESENTATION: 16, GRADE_LANGUAGE_REVIEW: 16, total: 48 },
  reviewedRevisionImplementationRowsExpected: 16,
  p0RowsRemainingAsImplementationDebtAfterAppend: 48,
  releaseBlockingFalseFeedbackLessons: ["khm-03-05", "khm-03-06"],
  candidateSha256: sha256(read(candidatePath)),
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
