import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S248_DECIMAL_FLUENCY_G5_TRIPLE_DISPOSITIONS.jsonl");
const cardsPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const coursePath = path.join(root, "content/courses/decimal-fluency-g5/course.json");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const vis01Path = path.join(root, "reports/vis/VIS01_PLACEMENTS.csv");
const figuresPath = path.join(root, "src/components/figures.tsx");

const expectedVisual = {
  "g5d-01-01": "SUFFICIENT", "g5d-01-02": "SUFFICIENT", "g5d-01-03": "SUFFICIENT",
  "g5d-01-04": "SUFFICIENT", "g5d-01-05": "SUFFICIENT", "g5d-01-06": "REQUIRED",
  "g5d-02-01": "SUFFICIENT", "g5d-02-02": "SUFFICIENT", "g5d-02-03": "SUFFICIENT",
  "g5d-02-04": "REQUIRED", "g5d-02-05": "REQUIRED", "g5d-03-01": "REQUIRED",
  "g5d-03-02": "SUFFICIENT", "g5d-03-03": "REQUIRED", "g5d-03-04": "SUFFICIENT",
  "g5d-03-05": "REQUIRED",
};
const expectedLanguage = {
  "g5d-01-01": "FIT", "g5d-01-02": "FIT", "g5d-01-03": "FIT", "g5d-01-04": "FIT",
  "g5d-01-05": "FIT", "g5d-01-06": "FIT", "g5d-02-01": "FIT", "g5d-02-02": "FIT",
  "g5d-02-03": "REVISE", "g5d-02-04": "FIT", "g5d-02-05": "FIT", "g5d-03-01": "FIT",
  "g5d-03-02": "FIT", "g5d-03-03": "REVISE", "g5d-03-04": "FIT", "g5d-03-05": "REVISE",
};
const specializedIllustrationRowsRemaining = [
  "g5d-01-06/c1",
  "g5d-02-04/c1", "g5d-02-04/c2",
  "g5d-02-05/c1", "g5d-02-05/c2",
  "g5d-03-01/c1", "g5d-03-01/c2",
  "g5d-03-03/c1",
  "g5d-03-05/c1", "g5d-03-05/c2",
];

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
const records = parseLines(candidatePath);
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((lesson) => lesson.courseId === course.id);
const lessonById = new Map(liveLessons.map((lesson) => [lesson.lessonId, lesson]));
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const cardDoc = JSON.parse(read(cardsPath));
const cards = cardDoc.cards.filter((card) => card.courseId === course.id);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => expectedIds.includes(row.lesson_id));
const vis01 = parseCsv(read(vis01Path)).filter((row) => expectedIds.includes(row.lesson_id));
const requiredFields = schema.contract.requiredDecisionFields;
const exactFields = new Set(["recordType", ...requiredFields]);
const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const errors = [];

if (course.id !== "decimal-fluency-g5" || course.gradeLevel !== 5) errors.push("unexpected course identity or grade");
if (expectedIds.length !== 16 || new Set(expectedIds).size !== 16) errors.push("manifest must contain 16 unique lessons");
if (liveLessons.length !== 16) errors.push(`authority has ${liveLessons.length} scoped lessons`);
if (records.length !== 16 || new Set(records.map((record) => record.lessonId)).size !== 16) errors.push("candidate must contain 16 unique lesson records");
if (new Set(records.map((record) => record.recordId)).size !== 16) errors.push("candidate recordIds are not unique");
if (!same([...recordById.keys()].sort(), [...expectedIds].sort())) errors.push("candidate lesson-id set differs from manifest");

for (const lessonId of expectedIds) {
  const lesson = lessonById.get(lessonId);
  const record = recordById.get(lessonId);
  if (!lesson || !record) continue;
  const fields = Object.keys(record);
  for (const field of fields.filter((field) => !exactFields.has(field))) errors.push(`${lessonId}: unknown field ${field}`);
  for (const field of [...exactFields].filter((field) => !fields.includes(field))) errors.push(`${lessonId}: missing exact field ${field}`);
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S248-G5D-${lessonId}`) errors.push(`${lessonId}: recordId pattern mismatch`);
  if (record.reviewedBasisHash !== lesson.reviewBasisHash) errors.push(`${lessonId}: candidate is not bound to the current live authority basis`);
  if (record.decision !== "REVISE") errors.push(`${lessonId}: reviewed lesson decision differs from REVISE`);
  if (record.visualDecision !== expectedVisual[lessonId]) errors.push(`${lessonId}: visual decision differs from independent assessment`);
  if (record.gradeLanguageDecision !== expectedLanguage[lessonId]) errors.push(`${lessonId}: language decision differs from independent assessment`);
  if (!lessonEnums.includes(record.decision) || !visualEnums.includes(record.visualDecision) || !languageEnums.includes(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid decision enum`);
  if (record.reviewer !== "ChatGPT Work independent assessor (decimal-fluency-g5 S248)") errors.push(`${lessonId}: reviewer mismatch`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (String(record.rationale).trim().length < 400) errors.push(`${lessonId}: rationale is not independently substantive`);
  if (String(record.reopenCondition).trim().length < 230) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 5) errors.push(`${lessonId}: requires at least five evidence references`);
  else for (const reference of record.evidenceRefs) {
    const file = evidenceFile(reference);
    if (!fs.existsSync(path.join(root, file))) errors.push(`${lessonId}: missing evidence file ${file}`);
  }

  const core = lesson.lesson.steps ?? [];
  const i1 = core.find((step) => step.id === "i1")?.widget;
  const i2 = core.find((step) => step.id === "i2")?.widget;
  const withoutPrompt = (widget) => { const copy = structuredClone(widget); delete copy.prompt; return copy; };
  if (!i1 || !i2 || stable(withoutPrompt(i1)) !== stable(withoutPrompt(i2))) errors.push(`${lessonId}: independently reviewed same-action i1/i2 cause changed`);
}

const mainMcqs = liveLessons.flatMap((lesson) => lesson.lesson.steps.flatMap((step) => step.widget?.type === "mcq" ? [{ lessonId: lesson.lessonId, stepId: step.id, widget: step.widget }] : []));
const genericIncorrectFeedback = mainMcqs.flatMap(({ widget }) => widget.options.filter((option) => !option.correct)).filter((option) => /does not match the place-value model or the expected size/.test(option.feedback));
if (mainMcqs.length !== 22) errors.push(`main MCQ count ${mainMcqs.length} != 22`);
if (genericIncorrectFeedback.length !== 66) errors.push(`templated incorrect feedback count ${genericIncorrectFeedback.length} != 66`);
for (const { lessonId, stepId, widget } of mainMcqs) {
  if (widget.options.filter((option) => option.correct).length !== 1) errors.push(`${lessonId}/${stepId}: not exactly one correct option`);
  if (new Set(widget.options.map((option) => option.label)).size !== widget.options.length) errors.push(`${lessonId}/${stepId}: duplicate labels`);
  const lengths = widget.options.map((option) => option.label.length);
  if (Math.max(...lengths) - Math.min(...lengths) > 14) errors.push(`${lessonId}/${stepId}: option-length spread exceeds 14`);
}

const figureSource = read(figuresPath);
for (const fragment of ["10 mm <tspan", "100 cm <tspan", "1000 m <tspan", ">equal lengths</text>"]) {
  if (!figureSource.includes(fragment)) errors.push("reviewed truthful McLengthLadder equality source changed");
}
const measurement = lessonById.get("g5d-03-04")?.lesson;
if (measurement?.steps.find((step) => step.id === "c2")?.figure !== "mc-length-ladder") errors.push("g5d-03-04/c2 no longer references reviewed truthful figure");

const cardsCurrent = expectedIds.filter((id) => {
  const card = cardById.get(id), lesson = lessonById.get(id);
  return card && lesson && card.reviewBasisHash === lesson.reviewBasisHash && card.lessonSourceHash === lesson.lessonSourceHash;
}).length;
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const vis01PriorCountOnRows = vis01.filter((row) => row.figure === "count-on-hops").length;
const dispositions = countBy(records, "decision", lessonEnums);
const visualDecisions = countBy(records, "visualDecision", visualEnums);
const gradeLanguageDecisions = countBy(records, "gradeLanguageDecision", languageEnums);
if (!same(dispositions, { KEEP: 0, REVISE: 16, ESCALATE: 0 })) errors.push(`decision distribution ${JSON.stringify(dispositions)}`);
if (!same(visualDecisions, { REQUIRED: 6, PREFERRED: 0, SUFFICIENT: 10, ESCALATE: 0 })) errors.push(`visual distribution ${JSON.stringify(visualDecisions)}`);
if (!same(gradeLanguageDecisions, { FIT: 13, REVISE: 3, ESCALATE: 0 })) errors.push(`language distribution ${JSON.stringify(gradeLanguageDecisions)}`);

const report = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  gradeLevel: course.gradeLevel,
  manifestLessons: expectedIds.length,
  candidateRecords: records.length,
  currentAuthorityBasisHashes: expectedIds.filter((id) => recordById.get(id)?.reviewedBasisHash === lessonById.get(id)?.reviewBasisHash).length,
  sharedCardsCurrentlyFreshForScopedLessons: cardsCurrent,
  sharedCardsFreshnessBoundary: cardsCurrent === 16 ? "FRESH" : "STALE_SHARED_ARTIFACT_NOT_USED_AS_AUTHORITY",
  decisions: dispositions,
  visualDecisions,
  gradeLanguageDecisions,
  evaluatorAndChoiceEvidence: {
    mainMcqs: mainMcqs.length,
    genericTemplatedIncorrectFeedback: genericIncorrectFeedback.length,
    focusedTestFile: "src/lib/session248.decimalFluencyG5CourseIntegrity.test.ts",
  },
  specializedRowsRemainingAfterTripleDispositionAppend: {
    LESSON_PROGRESSION_AND_DUPLICATION: expectedIds.map((lessonId) => `PROGRESSION-${lessonId}`),
    ILLUSTRATION_REPLACEMENT_SEMANTIC: specializedIllustrationRowsRemaining,
    releaseBlockingFalseFigure: null,
    CHOICE_SURFACE_INTEGRITY: [],
    MATH_PRESENTATION_RESIDUE: [],
    LESSON_REVISION_IMPLEMENTATION: expectedIds,
  },
  genericRowsEligibleToCloseAfterAuthoritativeAppend: {
    LESSON_COMPLETE_DISPOSITION: 16,
    VISUAL_FIRST_REPRESENTATION: 16,
    GRADE_LANGUAGE_REVIEW: 16,
    total: 48,
  },
  currentScopedQueueRows: queue.length,
  currentScopedQueueDistribution: queueCounts,
  staleVis01PriorCountOnRows: vis01PriorCountOnRows,
  candidateSha256: sha256(read(candidatePath)),
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
