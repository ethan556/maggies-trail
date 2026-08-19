import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S248_MULT_DIV_FLUENCY_G4_TRIPLE_DISPOSITIONS.jsonl");
const cardsPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/mult-div-fluency-g4/course.json");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = path.join(root, "src/components/figures.tsx");

const expectedVisual = {
  "g4m-01-01": "SUFFICIENT", "g4m-01-02": "SUFFICIENT", "g4m-01-03": "SUFFICIENT",
  "g4m-01-04": "REQUIRED", "g4m-01-05": "SUFFICIENT", "g4m-01-06": "SUFFICIENT",
  "g4m-02-01": "SUFFICIENT", "g4m-02-02": "SUFFICIENT", "g4m-02-03": "SUFFICIENT",
  "g4m-02-04": "REQUIRED", "g4m-02-05": "SUFFICIENT", "g4m-03-01": "SUFFICIENT",
  "g4m-03-02": "SUFFICIENT", "g4m-03-03": "SUFFICIENT", "g4m-03-04": "SUFFICIENT",
  "g4m-03-05": "SUFFICIENT",
};
const expectedLanguage = {
  "g4m-01-01": "FIT", "g4m-01-02": "FIT", "g4m-01-03": "FIT", "g4m-01-04": "FIT",
  "g4m-01-05": "FIT", "g4m-01-06": "REVISE", "g4m-02-01": "REVISE", "g4m-02-02": "REVISE",
  "g4m-02-03": "FIT", "g4m-02-04": "REVISE", "g4m-02-05": "FIT", "g4m-03-01": "FIT",
  "g4m-03-02": "FIT", "g4m-03-03": "FIT", "g4m-03-04": "FIT", "g4m-03-05": "REVISE",
};
const expectedNumeric = {
  "g4m-01-01/k1": 3500, "g4m-01-01/k3": 1600, "g4m-01-01/ch1": 8000,
  "g4m-01-02/k1": 76, "g4m-01-02/k3": 195, "g4m-01-02/ch1": 45,
  "g4m-01-03/k1": 160, "g4m-01-03/k2": 288, "g4m-01-03/k3": 2700, "g4m-01-03/ch1": 45,
  "g4m-01-04/k1": 126, "g4m-01-04/k2": 66, "g4m-01-04/k3": 108, "g4m-01-04/ch1": 133,
  "g4m-01-05/k1": 646, "g4m-01-05/k3": 768, "g4m-01-05/ch1": 420,
  "g4m-01-06/k1": 416, "g4m-01-06/k3": 570, "g4m-01-06/ch1": 312,
  "g4m-02-01/k2": 247, "g4m-02-01/ch1": 246, "g4m-02-02/k2": 245, "g4m-02-02/ch1": 155,
  "g4m-02-03/k2": 223, "g4m-02-03/ch1": 199, "g4m-02-04/k2": 830, "g4m-02-04/ch1": 861,
  "g4m-02-05/k1": 199, "g4m-02-05/k2": 346, "g4m-02-05/ch1": 236,
  "g4m-03-01/k1": 679, "g4m-03-01/k3": 536, "g4m-03-01/ch1": 714,
  "g4m-03-02/k1": 2, "g4m-03-02/k2": 4, "g4m-03-02/k3": 748, "g4m-03-02/ch1": 1,
  "g4m-03-03/k1": 14, "g4m-03-03/k3": 10, "g4m-03-03/ch1": 5,
  "g4m-03-04/k2": 185, "g4m-03-04/ch1": 9, "g4m-03-05/k2": 179, "g4m-03-05/ch1": 15,
};
const specializedIllustrationRowsRemaining = ["g4m-01-04/c2", "g4m-02-04/c1", "g4m-02-04/c2"];

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const countBy = (records, field, allowed) => Object.fromEntries(allowed.map((value) => [value, records.filter((record) => record[field] === value).length]));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const evidenceFile = (reference) => {
  const value = String(reference);
  const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
};
function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false; else cell += ch;
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
const records = parseLines(candidatePath);
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((lesson) => lesson.courseId === course.id);
const lessonById = new Map(liveLessons.map((lesson) => [lesson.lessonId, lesson]));
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => card.courseId === course.id);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => expectedIds.includes(row.lesson_id));
const requiredFields = schema.contract.requiredDecisionFields;
const exactFields = new Set(["recordType", ...requiredFields]);
const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const errors = [];

if (course.id !== "mult-div-fluency-g4" || course.gradeLevel !== 4) errors.push("unexpected course identity or grade");
if (expectedIds.length !== 16 || new Set(expectedIds).size !== 16) errors.push("manifest must contain 16 unique lessons");
if (liveLessons.length !== 16) errors.push(`authority has ${liveLessons.length} scoped lessons`);
if (records.length !== 16 || new Set(records.map((record) => record.lessonId)).size !== 16) errors.push("candidate must contain 16 unique lesson records");
if (new Set(records.map((record) => record.recordId)).size !== 16) errors.push("candidate recordIds are not unique");
if (!same([...recordById.keys()].sort(), [...expectedIds].sort())) errors.push("candidate lesson-id set differs from manifest");

for (const lessonId of expectedIds) {
  const lesson = lessonById.get(lessonId); const record = recordById.get(lessonId);
  if (!lesson || !record) continue;
  const fields = Object.keys(record);
  for (const field of fields.filter((field) => !exactFields.has(field))) errors.push(`${lessonId}: unknown field ${field}`);
  for (const field of [...exactFields].filter((field) => !fields.includes(field))) errors.push(`${lessonId}: missing exact field ${field}`);
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S248-G4M-${lessonId}`) errors.push(`${lessonId}: recordId pattern mismatch`);
  if (record.reviewedBasisHash !== lesson.reviewBasisHash) errors.push(`${lessonId}: candidate is not bound to current live authority`);
  if (record.decision !== "REVISE") errors.push(`${lessonId}: expected REVISE`);
  if (record.visualDecision !== expectedVisual[lessonId]) errors.push(`${lessonId}: visual decision mismatch`);
  if (record.gradeLanguageDecision !== expectedLanguage[lessonId]) errors.push(`${lessonId}: language decision mismatch`);
  if (!lessonEnums.includes(record.decision) || !visualEnums.includes(record.visualDecision) || !languageEnums.includes(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid decision enum`);
  if (record.reviewer !== "ChatGPT Work independent assessor (mult-div-fluency-g4 S248)") errors.push(`${lessonId}: reviewer mismatch`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (String(record.rationale).trim().length < 350) errors.push(`${lessonId}: rationale is not independently substantive`);
  if (String(record.reopenCondition).trim().length < 190) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 5) errors.push(`${lessonId}: requires at least five evidence references`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(path.join(root, evidenceFile(reference)))) errors.push(`${lessonId}: missing evidence ${evidenceFile(reference)}`);

  const i1 = lesson.lesson.steps.find((step) => step.id === "i1")?.widget;
  const i2 = lesson.lesson.steps.find((step) => step.id === "i2")?.widget;
  const withoutPrompt = (widget) => { const copy = structuredClone(widget); delete copy.prompt; return copy; };
  if (!i1 || !i2 || stable(withoutPrompt(i1)) !== stable(withoutPrompt(i2))) errors.push(`${lessonId}: reviewed prompt-stripped duplicate action changed`);
}

const mainMcqs = liveLessons.flatMap((lesson) => lesson.lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [{ lessonId: lesson.lessonId, stepId: step.id, widget: step.widget }] : []));
const genericIncorrect = mainMcqs.flatMap(({ widget }) => widget.options.filter((option) => !option.correct)).filter((option) => /try again\.?$|incorrect\.?$|not quite\.?$|does not match the place-value model/i.test(option.feedback));
if (mainMcqs.length !== 19) errors.push(`main MCQ count ${mainMcqs.length} != 19`);
if (genericIncorrect.length !== 0) errors.push(`generic incorrect-option feedback count ${genericIncorrect.length} != 0`);
for (const { lessonId, stepId, widget } of mainMcqs) {
  if (widget.options.filter((option) => option.correct).length !== 1) errors.push(`${lessonId}/${stepId}: not exactly one correct option`);
  if (new Set(widget.options.map((option) => option.label)).size !== widget.options.length) errors.push(`${lessonId}/${stepId}: duplicate labels`);
  const lengths = widget.options.map((option) => option.label.length);
  if (Math.max(...lengths) - Math.min(...lengths) > 14) errors.push(`${lessonId}/${stepId}: option-length spread exceeds 14`);
}

for (const [key, answer] of Object.entries(expectedNumeric)) {
  const [lessonId, stepId] = key.split("/");
  const widget = lessonById.get(lessonId)?.lesson.steps.find((step) => step.id === stepId)?.widget;
  if (widget?.type !== "numeric" || widget.answer !== answer || widget.tolerance !== 0) errors.push(`${key}: reviewed numeric truth contract changed`);
}
const columns = liveLessons.flatMap((lesson) => lesson.lesson.steps.flatMap((step) => step.widget?.type === "columnCalc" ? [{ lessonId: lesson.lessonId, stepId: step.id, widget: step.widget }] : []));
for (const { lessonId, stepId, widget } of columns) {
  const expected = widget.a * widget.b;
  if (widget.op !== "multiply" || !widget.successFeedback.includes(`${widget.a} × ${widget.b} = ${expected}`)) errors.push(`${lessonId}/${stepId}: column evaluator/feedback mismatch`);
}

const serialized = liveLessons.map((lesson) => JSON.stringify(lesson.lesson)).join("\n");
for (const forbidden of [
  "a four-digit quotient should have hundreds, tens, or thousands",
  "closest to 2,437 among the multiples of 5",
  "nine hundreds divide into three groups of one hundred each",
  "8 full vans leave 1 hikers standing",
  "Each factor's zeros survive into the product",
  "Count every zero",
]) if (serialized.includes(forbidden)) errors.push(`repaired false/malformed phrase returned: ${forbidden}`);
for (const lessonId of ["g4m-02-03", "g4m-02-04", "g4m-02-05", "g4m-03-01", "g4m-03-02", "g4m-03-03", "g4m-03-04", "g4m-03-05"]) {
  const text = JSON.stringify(lessonById.get(lessonId)?.lesson);
  if (text.includes("Split a factor into its places, multiply each part, and add every piece back.")) errors.push(`${lessonId}: copied multiplication fallback returned`);
  if (text.includes("Split a factor into places, build each piece, and reassemble the whole")) errors.push(`${lessonId}: copied multiplication CML returned`);
}
const partial = lessonById.get("g4m-02-04")?.lesson;
if (!partial?.steps.find((step) => step.id === "i1")?.widget?.prompt.includes("reasonable quotient range")) errors.push("g4m-02-04/i1 exact-total/evaluator repair changed");
if (!partial?.steps.find((step) => step.id === "i2")?.widget?.prompt.includes("reasonable range")) errors.push("g4m-02-04/i2 exact-total/evaluator repair changed");

const figureSource = read(figuresPath);
if (lessonById.get("g4m-01-04")?.lesson.steps.find((step) => step.id === "c2")?.figure !== "pv4-carry-chain" || !figureSource.includes("2,758") || !figureSource.includes("+ 1,463")) errors.push("reviewed addition-vs-multiplication figure debt changed");
if (partial?.steps.find((step) => step.id === "c1")?.figure !== "dop-long-division" || partial?.steps.find((step) => step.id === "c2")?.figure !== "dop-estimate-quotient") errors.push("reviewed partial-quotients figure debt changed");

const cardsCurrent = expectedIds.filter((id) => {
  const card = cardById.get(id), lesson = lessonById.get(id);
  return card && lesson && card.reviewBasisHash === lesson.reviewBasisHash && card.lessonSourceHash === lesson.lessonSourceHash;
}).length;
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const dispositions = countBy(records, "decision", lessonEnums);
const visualDecisions = countBy(records, "visualDecision", visualEnums);
const gradeLanguageDecisions = countBy(records, "gradeLanguageDecision", languageEnums);
if (!same(dispositions, { KEEP: 0, REVISE: 16, ESCALATE: 0 })) errors.push(`decision distribution ${JSON.stringify(dispositions)}`);
if (!same(visualDecisions, { REQUIRED: 2, PREFERRED: 0, SUFFICIENT: 14, ESCALATE: 0 })) errors.push(`visual distribution ${JSON.stringify(visualDecisions)}`);
if (!same(gradeLanguageDecisions, { FIT: 11, REVISE: 5, ESCALATE: 0 })) errors.push(`language distribution ${JSON.stringify(gradeLanguageDecisions)}`);

const report = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  manifestLessons: expectedIds.length,
  candidateRecords: records.length,
  currentAuthorityBasisHashes: expectedIds.filter((id) => recordById.get(id)?.reviewedBasisHash === lessonById.get(id)?.reviewBasisHash).length,
  sharedCardsCurrentlyFreshForScopedLessons: cardsCurrent,
  decisions: dispositions,
  visualDecisions,
  gradeLanguageDecisions,
  evaluatorAndChoiceEvidence: { mainMcqs: mainMcqs.length, genericIncorrectOptions: genericIncorrect.length, numericTruthContracts: Object.keys(expectedNumeric).length, columnContracts: columns.length },
  specializedRowsRemainingAfterTripleDispositionAppend: {
    LESSON_PROGRESSION_AND_DUPLICATION: expectedIds.map((lessonId) => `PROGRESSION-${lessonId}`),
    ILLUSTRATION_REPLACEMENT_SEMANTIC: specializedIllustrationRowsRemaining,
    CHOICE_SURFACE_INTEGRITY: [], MATH_PRESENTATION_RESIDUE: [],
    LESSON_REVISION_IMPLEMENTATION: expectedIds,
  },
  genericRowsEligibleToCloseAfterAuthoritativeAppend: { LESSON_COMPLETE_DISPOSITION: 16, VISUAL_FIRST_REPRESENTATION: 16, GRADE_LANGUAGE_REVIEW: 16, total: 48 },
  currentScopedQueueRows: queue.length,
  currentScopedQueueDistribution: queueCounts,
  candidateSha256: sha256(read(candidatePath)),
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
