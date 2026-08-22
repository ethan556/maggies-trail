#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";
import { planLessonReviewAppend } from "../../../scripts/audit/append-lesson-review-candidates-s246.mjs";

const root = process.cwd();
const courseId = "trig-identities-equations";
const candidatePath = "reports/closure/candidates/S246_TRIG_IDENTITIES_EQUATIONS_TRIPLE_DISPOSITIONS.jsonl";
const ledgerPath = "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl";
const exactFields = [
  "recordType", "recordId", "lessonId", "reviewedBasisHash", "decision", "visualDecision",
  "gradeLanguageDecision", "reviewer", "reviewedAt", "rationale", "evidenceRefs", "reopenCondition"
].sort();

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); if (row.some(Boolean)) rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const [headers = [], ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

const candidateRaw = fs.readFileSync(path.join(root, candidatePath), "utf8");
const records = candidateRaw.split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${candidatePath}:${index + 1}: ${error.message}`); }
});
const course = JSON.parse(fs.readFileSync(path.join(root, "content/courses", courseId, "course.json"), "utf8"));
const expectedLessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const cardsDoc = JSON.parse(fs.readFileSync(path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json"), "utf8"));
const cards = cardsDoc.cards.filter((card) => card.courseId === courseId);
const cardsByLesson = new Map(cards.map((card) => [card.lessonId, card]));
const authority = loadLessonReviewAuthority(root);
const candidatePlan = planLessonReviewAppend({
  ledgerRaw: fs.readFileSync(path.join(root, ledgerPath), "utf8"),
  candidateSources: [{ path: candidatePath, raw: candidateRaw }],
  lessons: authority.lessons
});
const queue = parseCsv(fs.readFileSync(path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv"), "utf8"));
const courseQueue = queue.filter((row) => expectedLessonIds.includes(row.lesson_id));
const vis = parseCsv(fs.readFileSync(path.join(root, "reports/vis/VIS01_PLACEMENTS.csv"), "utf8"))
  .filter((row) => expectedLessonIds.includes(row.lesson_id));
const failures = [];
const fail = (condition, message) => { if (!condition) failures.push(message); };
const count = (field, value) => records.filter((record) => record[field] === value).length;

fail(records.length === 15, `expected 15 records, found ${records.length}`);
fail(cards.length === 15, `expected 15 current cards, found ${cards.length}`);
fail(new Set(records.map((record) => record.recordId)).size === 15, "record IDs must be unique");
fail(new Set(records.map((record) => record.lessonId)).size === 15, "lesson IDs must be unique");
fail(JSON.stringify(records.map((record) => record.lessonId)) === JSON.stringify(expectedLessonIds), "records must follow exact course/chapter order");

for (const record of records) {
  const card = cardsByLesson.get(record.lessonId);
  const source = path.join(root, "content/courses", courseId, "lessons", `${record.lessonId}.json`);
  fail(record.recordType === "lesson-disposition", `${record.lessonId}: recordType`);
  fail(JSON.stringify(Object.keys(record).sort()) === JSON.stringify(exactFields), `${record.lessonId}: exact fields`);
  fail(record.recordId === `S246-TI-${record.lessonId}`, `${record.lessonId}: deterministic record ID`);
  fail(Boolean(card), `${record.lessonId}: missing card`);
  fail(record.reviewedBasisHash === card?.reviewBasisHash, `${record.lessonId}: stale basis hash`);
  fail(card?.disposition?.status === "PENDING_EXPLICIT_HUMAN_DECISION", `${record.lessonId}: card is not pending before append`);
  fail(fs.existsSync(source), `${record.lessonId}: missing lesson source`);
  fail(["KEEP", "REVISE", "ESCALATE"].includes(record.decision), `${record.lessonId}: decision enum`);
  fail(["REQUIRED", "PREFERRED", "SUFFICIENT", "ESCALATE"].includes(record.visualDecision), `${record.lessonId}: visual enum`);
  fail(["FIT", "REVISE", "ESCALATE"].includes(record.gradeLanguageDecision), `${record.lessonId}: language enum`);
  fail(record.reviewer === "ChatGPT Work independent assessor (trig-identities-equations)", `${record.lessonId}: reviewer`);
  fail(Number.isFinite(Date.parse(record.reviewedAt)), `${record.lessonId}: reviewedAt`);
  fail(record.rationale.length >= 220, `${record.lessonId}: rationale too short`);
  fail(Array.isArray(record.evidenceRefs) && record.evidenceRefs.length >= 3, `${record.lessonId}: evidence refs`);
  fail(record.reopenCondition.length >= 100, `${record.lessonId}: reopen condition too short`);
}

fail(count("decision", "KEEP") === 1, "expected KEEP 1");
fail(count("decision", "REVISE") === 12, "expected REVISE 12");
fail(count("decision", "ESCALATE") === 2, "expected ESCALATE 2");
fail(count("visualDecision", "REQUIRED") === 1, "expected visual REQUIRED 1");
fail(count("visualDecision", "PREFERRED") === 3, "expected visual PREFERRED 3");
fail(count("visualDecision", "SUFFICIENT") === 11, "expected visual SUFFICIENT 11");
fail(count("gradeLanguageDecision", "FIT") === 9, "expected language FIT 9");
fail(count("gradeLanguageDecision", "REVISE") === 6, "expected language REVISE 6");
fail(candidatePlan.summary.recordCount === 15, "append simulation must accept all 15 records");

for (const lessonId of ["ti-02-03", "ti-04-03"]) {
  fail(records.find((record) => record.lessonId === lessonId)?.decision === "ESCALATE", `${lessonId}: domain-truth escalation required`);
}
fail(records.find((record) => record.lessonId === "ti-02-02")?.visualDecision === "REQUIRED", "ti-02-02: replacement visual required");
fail(records.find((record) => record.lessonId === "ti-05-02")?.decision === "KEEP", "ti-05-02: calibrated keep required");

const genericStreams = ["LESSON_COMPLETE_DISPOSITION", "VISUAL_FIRST_REPRESENTATION", "GRADE_LANGUAGE_REVIEW"];
for (const lessonId of expectedLessonIds) {
  for (const workstream of genericStreams) {
    fail(courseQueue.filter((row) => row.lesson_id === lessonId && row.workstream === workstream).length === 1, `${lessonId}: expected one ${workstream} row`);
  }
  fail((cardsByLesson.get(lessonId)?.standards?.edgeIds ?? []).length === 6, `${lessonId}: expected six candidate standards edges`);
  fail((cardsByLesson.get(lessonId)?.duplicates?.clusterCount ?? -1) === 0, `${lessonId}: unexpected exact duplicate cluster`);
}

const mathRows = courseQueue.filter((row) => row.workstream === "MATH_PRESENTATION_RESIDUE");
const choiceRows = courseQueue.filter((row) => row.workstream === "CHOICE_SURFACE_INTEGRITY");
const progressionRows = courseQueue.filter((row) => row.workstream === "LESSON_PROGRESSION_AND_DUPLICATION");
fail(mathRows.length === 116, `expected 116 math rows, found ${mathRows.length}`);
fail(new Set(mathRows.map((row) => row.lesson_id)).size === 14, "math rows must affect 14 lessons");
fail(choiceRows.length === 5, `expected 5 choice rows, found ${choiceRows.length}`);
fail(progressionRows.length === 2, `expected 2 detector progression rows, found ${progressionRows.length}`);
fail(vis.length === 30 && vis.every((row) => row.cause === "RENDERS"), "all 30 concept figures must currently render");

if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "PASS",
  courseId,
  lessonCount: records.length,
  expectedGenericClosures: records.length * 3,
  expectedImplementationDebtRows: count("decision", "REVISE") + count("decision", "ESCALATE"),
  decision: { KEEP: 1, REVISE: 12, ESCALATE: 2 },
  visualDecision: { REQUIRED: 1, PREFERRED: 3, SUFFICIENT: 11 },
  gradeLanguageDecision: { FIT: 9, REVISE: 6 },
  rootCauseEvidence: {
    domainTruthEscalations: 2,
    visualReplacementLessons: 1,
    mathPresentationRows: mathRows.length,
    choiceRows: choiceRows.length,
    detectorProgressionRows: progressionRows.length,
    qualitativeAdditionalProgressionLessons: 1,
    renderedConceptFigures: vis.length,
    candidateStandardsEdges: cards.reduce((total, card) => total + card.standards.edgeIds.length, 0),
    exactDuplicateClusters: cards.reduce((total, card) => total + card.duplicates.clusterCount, 0)
  }
}, null, 2));
