import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S248_GEOMETRY_G7_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = path.join(root, "content/courses/geometry-g7/course.json");
const cardsPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = path.join(root, "src/components/figures.tsx");
const figureIdsPath = path.join(root, "src/components/figureIds.ts");
const alignmentPath = path.join(root, "src/lib/figureTextAlignment.ts");

const expectedDecision = Object.fromEntries([
  "g7-01-01", "g7-01-02", "g7-01-03", "g7-02-01", "g7-02-02", "g7-02-03",
  "g7-03-03", "g7-03b-01", "g7-03b-02", "g7-03b-03", "g7-04-02",
  "sa7-01-01", "sa7-01-02", "sa7-02-01", "sa7-02-02", "sa7-02-03",
].map((id) => [id, "KEEP"]));
for (const id of ["g7-03-01", "g7-03-02", "g7-04-01", "g7-04-03", "sa7-01-03"]) expectedDecision[id] = "REVISE";

const expectedVisual = {
  "g7-01-01": "SUFFICIENT", "g7-01-02": "SUFFICIENT", "g7-01-03": "PREFERRED",
  "g7-02-01": "SUFFICIENT", "g7-02-02": "SUFFICIENT", "g7-02-03": "SUFFICIENT",
  "g7-03-01": "REQUIRED", "g7-03-02": "REQUIRED", "g7-03-03": "SUFFICIENT",
  "g7-03b-01": "SUFFICIENT", "g7-03b-02": "SUFFICIENT", "g7-03b-03": "SUFFICIENT",
  "g7-04-01": "REQUIRED", "g7-04-02": "SUFFICIENT", "g7-04-03": "REQUIRED",
  "sa7-01-01": "SUFFICIENT", "sa7-01-02": "SUFFICIENT", "sa7-01-03": "REQUIRED",
  "sa7-02-01": "SUFFICIENT", "sa7-02-02": "SUFFICIENT", "sa7-02-03": "SUFFICIENT",
};
const expectedLanguage = Object.fromEntries(Object.keys(expectedDecision).map((id) => [id, "FIT"]));
expectedLanguage["g7-04-01"] = "REVISE";
expectedLanguage["sa7-01-03"] = "REVISE";

const reviewedFigureFunctions = [
  "ScaleDrawing", "CircleParts", "AnglePairs", "CrossSections", "RightTriangle",
  "G7ScaleRate", "G7ScaleDirections", "G7ScaleArea", "G7PiRatio", "G7Circumference",
  "G7CircleCvsA", "G7CompSupp", "G7VerticalAngles", "G7SolveAngles", "G7TriangleIneq",
  "G7Slicing", "G7Roundup", "G7SssLocks", "G7SsaTwoTriangles", "G7AaaSameShape",
  "G7CopyAngleArcs", "G7PerpBisectorArcs", "Sa7NetUnfold", "Sa7FormulaBookkeeping",
  "Sa7ThreeFacesRoutine", "Sa7UnitsSquared", "Sa7TriangularPrismParts", "Sa7LateralShortcut",
  "Sa7StackTheLayer", "Sa7SameRuleAnyBase", "Sa7DecomposeFloorPlan", "Sa7ManyCorrectCuts",
  "Sa7ThreeQuestionsOneCrate", "Sa7UnitsCheck",
].sort();
const expectedFigureSurfaceHash = "1c5bcc111402f4704751f87b022960537b8b65f306d4ce8f64bdd72ba97e4aeb";
const expectedAlignmentHash = "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851";

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const parseLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const countBy = (records, field, allowed) => Object.fromEntries(allowed.map((value) => [value, records.filter((record) => record[field] === value).length]));
const evidenceFile = (reference) => {
  const value = String(reference);
  const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
};
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...values] = rows.filter((candidate) => candidate.some((entry) => entry !== ""));
  return values.map((valueRow) => Object.fromEntries(headers.map((header, index) => [header, valueRow[index] ?? ""])));
}
function figureBlock(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) return "";
  const next = source.indexOf("\nfunction ", start + 1);
  return source.slice(start, next < 0 ? source.length : next).trim();
}

const schema = parseLines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const records = parseLines(candidatePath);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const expectedIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((lesson) => lesson.courseId === course.id);
const lessonById = new Map(liveLessons.map((lesson) => [lesson.lessonId, lesson]));
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => card.courseId === course.id);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => expectedIds.includes(row.lesson_id));
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const requiredFields = schema.contract.requiredDecisionFields;
const exactFields = new Set(["recordType", ...requiredFields]);
const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const errors = [];

if (course.id !== "geometry-g7" || course.gradeLevel !== 7) errors.push("unexpected course identity or grade");
if (expectedIds.length !== 21 || new Set(expectedIds).size !== 21) errors.push("manifest must contain 21 unique lessons");
if (liveLessons.length !== 21) errors.push(`live authority has ${liveLessons.length} scoped lessons`);
if (records.length !== 21 || new Set(records.map((record) => record.lessonId)).size !== 21) errors.push("candidate must contain 21 unique lesson records");
if (new Set(records.map((record) => record.recordId)).size !== 21) errors.push("candidate recordIds are not unique");
if (!same([...recordById.keys()].sort(), [...expectedIds].sort())) errors.push("candidate lesson-id set differs from manifest");

for (const lessonId of expectedIds) {
  const lesson = lessonById.get(lessonId);
  const record = recordById.get(lessonId);
  if (!lesson || !record) continue;
  const fields = Object.keys(record);
  for (const field of fields.filter((field) => !exactFields.has(field))) errors.push(`${lessonId}: unknown field ${field}`);
  for (const field of [...exactFields].filter((field) => !fields.includes(field))) errors.push(`${lessonId}: missing exact field ${field}`);
  if (record.recordType !== "lesson-disposition") errors.push(`${lessonId}: invalid recordType`);
  if (record.recordId !== `S248-G7-${lessonId}`) errors.push(`${lessonId}: recordId pattern mismatch`);
  if (record.reviewedBasisHash !== lesson.reviewBasisHash) errors.push(`${lessonId}: stale current-authority basis hash`);
  if (record.decision !== expectedDecision[lessonId]) errors.push(`${lessonId}: lesson decision differs from independent assessment`);
  if (record.visualDecision !== expectedVisual[lessonId]) errors.push(`${lessonId}: visual decision differs from independent assessment`);
  if (record.gradeLanguageDecision !== expectedLanguage[lessonId]) errors.push(`${lessonId}: language decision differs from independent assessment`);
  if (!lessonEnums.includes(record.decision) || !visualEnums.includes(record.visualDecision) || !languageEnums.includes(record.gradeLanguageDecision)) errors.push(`${lessonId}: invalid decision enum`);
  if (record.reviewer !== "ChatGPT Work independent assessor (geometry-g7 S248)") errors.push(`${lessonId}: reviewer mismatch`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${lessonId}: invalid reviewedAt`);
  if (String(record.rationale).trim().length < 260) errors.push(`${lessonId}: rationale is not substantive`);
  if (String(record.reopenCondition).trim().length < 170) errors.push(`${lessonId}: reopenCondition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 6) errors.push(`${lessonId}: requires at least six evidence references`);
  else for (const reference of record.evidenceRefs) {
    const file = evidenceFile(reference);
    if (!fs.existsSync(path.join(root, file))) errors.push(`${lessonId}: missing evidence file ${file}`);
  }

  const concepts = lesson.lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2) errors.push(`${lessonId}: expected two main concepts`);
  for (const concept of concepts) {
    if (!concept.figure) errors.push(`${lessonId}/${concept.id}: figure missing`);
    if (concept.narration !== concept.body) errors.push(`${lessonId}/${concept.id}: narration drift`);
  }
}

const getStep = (lessonId, stepId) => lessonById.get(lessonId)?.lesson.steps.find((step) => step.id === stepId);
if (getStep("g7-03-01", "c1")?.figure !== "angle-pairs") errors.push("g7-03-01/c1 reviewed mismatch changed");
if (getStep("g7-03-02", "c1")?.figure !== "angle-pairs") errors.push("g7-03-02/c1 reviewed mismatch changed");
if (getStep("g7-04-01", "c1")?.figure !== "right-triangle") errors.push("g7-04-01/c1 reviewed mismatch changed");
const ambiguous = getStep("g7-04-01", "k3")?.widget;
if (ambiguous?.type !== "numeric" || ambiguous.answer !== 10 || !ambiguous.prompt.includes("Which cannot be the third side?")) errors.push("g7-04-01/k3 reviewed ambiguity changed");
const roundup = lessonById.get("g7-04-03")?.lesson;
if (roundup?.steps.some((step) => step.widget?.type === "solidSliceLab" || step.figure === "cross-sections" || step.figure === "g7-slicing")) errors.push("g7-04-03 reviewed missing cross-section job changed");
if (getStep("g7-04-03", "c1")?.figure !== "scale-drawing") errors.push("g7-04-03/c1 reviewed integration gap changed");
const triangular = lessonById.get("sa7-01-03")?.lesson;
const triangularText = JSON.stringify(triangular);
if ((triangularText.match(/same rule works for any prism/g) ?? []).length !== 3) errors.push("sa7-01-03 reviewed any-prism overgeneralization changed");
if (!same(triangular?.steps.filter((step) => step.kind === "concept").map((step) => step.figure), ["sa7-triangular-prism-parts", "sa7-lateral-shortcut"])) errors.push("sa7-01-03 reviewed pyramid-visual gap changed");

const figureIds = read(figureIdsPath);
const conceptFigures = liveLessons.flatMap((lesson) => lesson.lesson.steps.filter((step) => step.kind === "concept").map((step) => step.figure));
if (conceptFigures.length !== 42) errors.push(`main concept figure placements ${conceptFigures.length} != 42`);
for (const figure of conceptFigures) if (!figure || !figureIds.includes(JSON.stringify(figure))) errors.push(`unregistered concept figure ${figure}`);
const figureSource = read(figuresPath);
const reviewedFigureSurface = reviewedFigureFunctions.map((name) => `${name}\n${figureBlock(figureSource, name)}`).join("\n---\n");
if (sha256(reviewedFigureSurface) !== expectedFigureSurfaceHash) errors.push("reviewed geometry figure surface hash changed");
if (sha256(read(alignmentPath)) !== expectedAlignmentHash) errors.push("figure-text alignment gate hash changed");

const dispositions = countBy(records, "decision", lessonEnums);
const visualDecisions = countBy(records, "visualDecision", visualEnums);
const languageDecisions = countBy(records, "gradeLanguageDecision", languageEnums);
if (!same(dispositions, { KEEP: 16, REVISE: 5, ESCALATE: 0 })) errors.push(`decision distribution ${JSON.stringify(dispositions)}`);
if (!same(visualDecisions, { REQUIRED: 5, PREFERRED: 1, SUFFICIENT: 15, ESCALATE: 0 })) errors.push(`visual distribution ${JSON.stringify(visualDecisions)}`);
if (!same(languageDecisions, { FIT: 19, REVISE: 2, ESCALATE: 0 })) errors.push(`language distribution ${JSON.stringify(languageDecisions)}`);

const expectedQueueCounts = {
  CHOICE_SURFACE_INTEGRITY: 8, GRADE_LANGUAGE_REVIEW: 21, ILLUSTRATION_REPLACEMENT: 1,
  LESSON_COMPLETE_DISPOSITION: 21, LESSON_PROGRESSION_AND_DUPLICATION: 1,
  MATH_PRESENTATION_RESIDUE: 36, STANDARDS_VERIFICATION: 35, VISUAL_FIRST_REPRESENTATION: 21,
};
if (!same(queueCounts, expectedQueueCounts)) errors.push(`current scoped queue distribution changed: ${JSON.stringify(queueCounts)}`);
const freshCards = expectedIds.filter((id) => cardById.get(id)?.reviewBasisHash === lessonById.get(id)?.reviewBasisHash).length;

const report = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  manifestLessons: expectedIds.length,
  candidateRecords: records.length,
  currentAuthorityBasisHashes: expectedIds.filter((id) => recordById.get(id)?.reviewedBasisHash === lessonById.get(id)?.reviewBasisHash).length,
  sharedCardsCurrentlyFreshForScopedLessons: freshCards,
  sharedCardsFreshnessBoundary: freshCards === 21 ? "FRESH" : "STALE_SHARED_ARTIFACT_NOT_USED_AS_AUTHORITY",
  decisions: dispositions,
  visualDecisions,
  gradeLanguageDecisions: languageDecisions,
  reviewedConceptFigurePlacements: conceptFigures.length,
  reviewedFigureSurfaceSha256: sha256(reviewedFigureSurface),
  figureAlignmentGateSha256: sha256(read(alignmentPath)),
  currentScopedQueueRows: queue.length,
  currentScopedQueueDistribution: queueCounts,
  appendAndQueueRebuildExpectation: {
    genericTripleRowsClosed: 63,
    lessonRevisionImplementationRowsOpened: 5,
    immediateNetQueueDelta: -58,
    expectedRowsBeforeSourceAuditRefresh: 86,
    staleSourceRowsClosedOnRefresh: 46,
    specializedVisualRowsOpened: 5,
    expectedRowsAfterFullRefresh: 45,
    standardsRowsRemaining: 35,
  },
  candidateSha256: sha256(read(candidatePath)),
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
