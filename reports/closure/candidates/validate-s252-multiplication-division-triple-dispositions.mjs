#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S252_MULTIPLICATION_DIVISION_TRIPLE_DISPOSITIONS.jsonl");
const reportPath = path.join(here, "S252_MULTIPLICATION_DIVISION_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const ledgerPath = path.join(root, "reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = path.join(root, "reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const coursePath = path.join(root, "content", "courses", "multiplication-division", "course.json");
const figurePath = path.join(root, "src", "components", "figures.tsx");

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const evidenceFile = (reference) => {
  const value = String(reference);
  const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
};

function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else cell += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(cell); cell = ""; }
    else if (character === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += character;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...values] = rows.filter((candidate) => candidate.some((entry) => entry !== ""));
  return values.map((valuesRow) => Object.fromEntries(headers.map((header, index) => [header, valuesRow[index] ?? ""])));
}

const expectedDecisions = {
  "mult-01-01": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-01-02": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-01-03": ["REVISE", "REQUIRED", "FIT"],
  "mult-01-04": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-01-05": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-02-01": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-02-02": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-02-03": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-02-04": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-02-05": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-03-01": ["REVISE", "REQUIRED", "FIT"],
  "mult-03-02": ["REVISE", "REQUIRED", "FIT"],
  "mult-03-03": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-03-04": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-03-05": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-04-01": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-04-02": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-04-03": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-04-04": ["REVISE", "PREFERRED", "FIT"],
  "mult-04-05": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-05-01": ["REVISE", "PREFERRED", "FIT"],
  "mult-05-02": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-05-03": ["KEEP", "SUFFICIENT", "FIT"],
  "mult-05-04": ["KEEP", "SUFFICIENT", "FIT"],
};

const repairedFigures = {
  "mult-02-01/c2": "mult3-fair-shares",
  "mult-02-03/c2": "number-line-jumps",
  "mult-03-01/c1": "mult3-double",
  "mult-04-04/c2": "mult3-which-op",
  "mult-04-05/c2": "mult3-estimate",
};
const repairedProgression = {
  "mult-02-02/ch1": "After 2 rolls sell, 24 rolls remain. A learner claims 6 full bags of 6 can be packed. Enter the number of full bags that corrects the claim.",
  "mult-03-03/k2": "Start at 5 and double exactly three times. Enter the final number in the doubling chain.",
  "mult-03-04/k2": "Begin with 10 × 6 = 60, then subtract one group of 6. Enter the resulting ×9 product.",
  "mult-03-04/ch1": "The theater has 72 seats in all. Five seats are empty tonight. Enter the number of occupied seats.",
  "mult-05-03/ch1": "A learner says 5 × 7 + 4 must be even because 4 is even. Enter the score to test and correct the claim.",
};
const repairedChoices = [
  "mult-02-04/k3", "mult-04-04/k3", "mult-04-05/k1", "mult-05-01/k2",
  "mult-05-02/k3", "mult-05-03/k1", "mult-05-04/k1",
];
const specializedVisualDebt = {
  "mult-01-03": ["c1", "c2"],
  "mult-03-01": ["c1"],
  "mult-03-02": ["c1"],
  "mult-04-04": ["c2"],
  "mult-05-01": ["c1", "c2"],
};

const schema = parseJsonl(ledgerPath)[0];
const records = parseJsonl(candidatePath);
const course = JSON.parse(read(coursePath));
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((lesson) => lesson.courseId === course.id);
const lessonById = new Map(liveLessons.map((lesson) => [lesson.lessonId, lesson]));
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => card.courseId === course.id);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => expectedIds.includes(row.lesson_id));
const figuresSource = read(figurePath);
const errors = [];

if (course.id !== "multiplication-division" || course.gradeLevel !== 3) errors.push("unexpected course identity or grade");
if (expectedIds.length !== 24 || new Set(expectedIds).size !== 24) errors.push("course manifest must contain 24 unique lessons");
if (liveLessons.length !== 24) errors.push(`live authority has ${liveLessons.length} scoped lessons`);
if (records.length !== 24 || new Set(records.map((record) => record.lessonId)).size !== 24) errors.push("candidate must contain 24 unique lesson records");
if (new Set(records.map((record) => record.recordId)).size !== 24) errors.push("candidate recordIds are not unique");
if (!same([...recordById.keys()].sort(), [...expectedIds].sort())) errors.push("candidate lesson-id set differs from manifest");
if (!fs.existsSync(reportPath)) errors.push("assessment report is missing");

const requiredFields = schema.contract.requiredDecisionFields;
const exactFields = new Set(["recordType", ...requiredFields]);
for (const lessonId of expectedIds) {
  const lesson = lessonById.get(lessonId); const record = recordById.get(lessonId);
  if (!lesson || !record) continue;
  const fields = Object.keys(record);
  for (const field of fields.filter((field) => !exactFields.has(field))) errors.push(`${lessonId}: unknown field ${field}`);
  for (const field of [...exactFields].filter((field) => !fields.includes(field))) errors.push(`${lessonId}: missing field ${field}`);
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S252-MD-${lessonId}`) errors.push(`${lessonId}: recordId pattern mismatch`);
  if (record.reviewedBasisHash !== lesson.reviewBasisHash) errors.push(`${lessonId}: candidate is not bound directly to current authority`);
  const expected = expectedDecisions[lessonId];
  if (!expected || record.decision !== expected[0] || record.visualDecision !== expected[1] || record.gradeLanguageDecision !== expected[2]) errors.push(`${lessonId}: triple decision mismatch`);
  if (!schema.contract.allowedLessonDecisions.includes(record.decision) || !schema.contract.allowedVisualDecisions.includes(record.visualDecision) || !schema.contract.allowedGradeLanguageDecisions.includes(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid decision enum`);
  if (record.reviewer !== "Codex independent assessor (multiplication-division S252)") errors.push(`${lessonId}: reviewer mismatch`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (String(record.rationale).trim().length < 300) errors.push(`${lessonId}: rationale is not independently substantive`);
  if (String(record.reopenCondition).trim().length < 130) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 6) errors.push(`${lessonId}: requires at least six evidence references`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(path.join(root, evidenceFile(reference)))) errors.push(`${lessonId}: missing evidence ${evidenceFile(reference)}`);
}

let allWidgetCount = 0; let mainMcqCount = 0; let remedialMcqCount = 0; let numericCount = 0; let figurePlacements = 0;
const allFigures = new Set();
const normalized = (prompt) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
for (const live of liveLessons) {
  const lesson = live.lesson;
  const mainSteps = lesson.steps;
  const remedialSteps = (lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean));
  const allSteps = [...mainSteps, ...remedialSteps];
  const widgetSteps = mainSteps.filter((step) => step.widget);
  const prompts = widgetSteps.map((step) => step.widget.prompt);
  const payloads = widgetSteps.map((step) => stable(step.widget));
  if (new Set(prompts).size !== prompts.length) errors.push(`${live.lessonId}: exact prompt collision`);
  if (new Set(prompts.map(normalized)).size !== prompts.length) errors.push(`${live.lessonId}: number-normalized prompt collision`);
  if (new Set(payloads).size !== payloads.length) errors.push(`${live.lessonId}: exact widget payload collision`);
  for (const step of allSteps) {
    if (step.figure) { figurePlacements += 1; allFigures.add(step.figure); }
    const widget = step.widget;
    if (!widget) continue;
    allWidgetCount += 1;
    if (step.predict) {
      const ids = step.predict.options.map((option) => option.id);
      if (new Set(ids).size !== ids.length || !ids.includes(step.predict.outcomeId)) errors.push(`${live.lessonId}/${step.id}: invalid prediction truth contract`);
    }
    if (widget.type === "numeric") {
      numericCount += 1;
      if (!Number.isFinite(widget.answer) || widget.tolerance !== 0) errors.push(`${live.lessonId}/${step.id}: numeric answer/tolerance drift`);
      for (const common of widget.commonErrors ?? []) if (common.value === widget.answer) errors.push(`${live.lessonId}/${step.id}: common error equals answer`);
    }
    if (widget.type === "mcq") {
      if (mainSteps.includes(step)) mainMcqCount += 1; else remedialMcqCount += 1;
      if (widget.options.filter((option) => option.correct).length !== 1) errors.push(`${live.lessonId}/${step.id}: MCQ does not have exactly one correct option`);
      if (new Set(widget.options.map((option) => option.id)).size !== widget.options.length || new Set(widget.options.map((option) => option.label)).size !== widget.options.length) errors.push(`${live.lessonId}/${step.id}: duplicate MCQ ID or label`);
      for (const option of widget.options) if (String(option.feedback).trim().length < 15) errors.push(`${live.lessonId}/${step.id}/${option.id}: feedback is not diagnostic`);
    }
  }
}
if (allWidgetCount !== 183 || mainMcqCount !== 46 || remedialMcqCount !== 25 || numericCount !== 63) errors.push(`corpus count drift: widgets=${allWidgetCount}, mainMcq=${mainMcqCount}, remedialMcq=${remedialMcqCount}, numeric=${numericCount}`);
if (figurePlacements !== 48 || allFigures.size !== 21) errors.push(`figure corpus drift: placements=${figurePlacements}, ids=${allFigures.size}`);
for (const figure of allFigures) if (!figuresSource.includes(`"${figure}":`)) errors.push(`unregistered figure ${figure}`);

const getStep = (placement) => {
  const [lessonId, stepId] = placement.split("/");
  return lessonById.get(lessonId)?.lesson.steps.find((step) => step.id === stepId);
};
for (const [placement, figure] of Object.entries(repairedFigures)) if (getStep(placement)?.figure !== figure) errors.push(`${placement}: repaired figure mapping changed`);
for (const [placement, prompt] of Object.entries(repairedProgression)) if (getStep(placement)?.widget?.prompt !== prompt) errors.push(`${placement}: repaired progression job changed`);
for (const placement of repairedChoices) {
  const widget = getStep(placement)?.widget;
  if (widget?.type !== "mcq") { errors.push(`${placement}: repaired choice is no longer MCQ`); continue; }
  if (!same(widget.options.map((option) => option.id), ["a", "b", "c", "d"])) errors.push(`${placement}: option IDs changed`);
  const lengths = widget.options.map((option) => option.label.length);
  if (Math.max(...lengths) - Math.min(...lengths) > 18) errors.push(`${placement}: repaired choice length spread exceeds 18`);
}

const serialized = liveLessons.map((lesson) => JSON.stringify(lesson.lesson)).join("\n");
for (const forbidden of [
  "every times fact you know hands you two division facts",
  "Every non-square product has exactly such a twin pair.",
  "6 only splits as 2 × 3",
  "10 is the biggest one-digit jump",
  "Wrong size = wrong operation, guaranteed.",
  "×10 shifts",
]) if (serialized.includes(forbidden)) errors.push(`repaired false claim returned: ${forbidden}`);
if (!getStep("mult-02-04/c2")?.body.includes("When the factors match")) errors.push("equal-factor truth repair changed");
if (!getStep("mult-03-02/c1")?.body.includes("ten times as much")) errors.push("tenfold place-value truth repair changed");
if (!getStep("mult-04-05/c1")?.body.includes("more than one group")) errors.push("positive multi-group qualification changed");
if (!getStep("mult-05-02/i2")?.widget?.successFeedback.includes("Inside this 4-by-4 grid")) errors.push("4-by-4 reflection truth repair changed");

// These exact fingerprints make the validator honest about known residual visual debt. If any
// fingerprint changes, the decisions must be reassessed rather than silently carried forward.
if (getStep("mult-01-03/c1")?.figure !== "skip-count-line" || !figuresSource.includes("const nums = [200, 300, 400, 500, 600]")) errors.push("mult-01-03 skip-count visual debt changed");
if (!getStep("mult-03-01/c1")?.body.includes("model pairs 6 with another 6") || !figuresSource.includes("Times two is doubling: 5 and 5 make 10")) errors.push("mult-03-01 double-model mismatch changed");
if (getStep("mult-03-02/c1")?.figure !== "mult3-fives" || !figuresSource.includes("The fives pattern: 5, 10, 15, 20")) errors.push("mult-03-02 x10 visual debt changed");
if (getStep("mult-04-04/c2")?.figure !== "mult3-which-op" || !getStep("mult-04-04/c2")?.body.includes("then subtract")) errors.push("mult-04-04 two-step visual debt changed");
if (getStep("mult-05-01/c1")?.figure !== "mult3-add-table" || !figuresSource.includes("fill={(r+c)===3?TANGERINE")) errors.push("mult-05-01 addition-table visual debt changed");
if (getStep("mult-05-02/c1")?.figure !== "mult3-mult-table" || !figuresSource.includes("4 × 4 = 16 (highlighted square fact)") || figuresSource.includes("4 × 6 = 24 (highlighted)")) errors.push("mult-05-02 repaired shared figure truth changed");

const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions);
const visualDecisions = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions);
const languageDecisions = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 19, REVISE: 5, ESCALATE: 0 })) errors.push(`decision distribution ${JSON.stringify(decisions)}`);
if (!same(visualDecisions, { REQUIRED: 3, PREFERRED: 2, SUFFICIENT: 19, ESCALATE: 0 })) errors.push(`visual distribution ${JSON.stringify(visualDecisions)}`);
if (!same(languageDecisions, { FIT: 24, REVISE: 0, ESCALATE: 0 })) errors.push(`language distribution ${JSON.stringify(languageDecisions)}`);

const cardsCurrent = expectedIds.filter((lessonId) => {
  const card = cardById.get(lessonId); const lesson = lessonById.get(lessonId);
  return card && lesson && card.reviewBasisHash === lesson.reviewBasisHash && card.lessonSourceHash === lesson.lessonSourceHash;
}).length;
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const result = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  manifestLessons: expectedIds.length,
  candidateRecords: records.length,
  directCurrentAuthorityHashes: expectedIds.filter((lessonId) => recordById.get(lessonId)?.reviewedBasisHash === lessonById.get(lessonId)?.reviewBasisHash).length,
  sharedCardsCurrentlyFresh: cardsCurrent,
  decisions,
  visualDecisions,
  gradeLanguageDecisions: languageDecisions,
  corpusEvidence: { allWidgets: allWidgetCount, mainMcqs: mainMcqCount, remedialMcqs: remedialMcqCount, numericWidgets: numericCount, figurePlacements, registeredFigureIds: allFigures.size },
  verifiedSourceClosures: { progression: 4, choiceSurface: 7, visualAccepted: 3, visualReopenedByExactSourceReview: 2, truthRepairs: 6, sharedFigureBlockersClosedDuringAssessment: 1 },
  specializedRowsRemainingAfterAppend: {
    ILLUSTRATION_REPLACEMENT_SEMANTIC: specializedVisualDebt,
    LESSON_REVISION_IMPLEMENTATION: Object.keys(specializedVisualDebt),
    LESSON_PROGRESSION_AND_DUPLICATION: [],
    CHOICE_SURFACE_INTEGRITY: [],
    MATH_PRESENTATION_RESIDUE: [],
  },
  genericRowsEligibleToCloseAfterAuthoritativeAppend: { LESSON_COMPLETE_DISPOSITION: 24, VISUAL_FIRST_REPRESENTATION: 24, GRADE_LANGUAGE_REVIEW: 24, total: 72 },
  currentScopedQueueRows: queue.length,
  currentScopedQueueDistribution: queueCounts,
  candidateSha256: sha256(read(candidatePath)),
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
