#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S252_FRACTIONS_DEEPER_G3_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "fractions-deeper-g3", "course.json");
const lessonDir = rel("content", "courses", "fractions-deeper-g3", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const repairReportPath = rel("reports", "pedagogy", "S252_FRACTIONS_DEEPER_G3_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session252.fractionsDeeperG3CourseIntegrity.test.tsx");
const repairScriptPath = rel("scripts", "audit", "repair-fractions-deeper-g3-s252.mjs");

const expectedHashes = {
  course: "252a8fb53f2f3e113733c4de058d1a32302d525ab334fbc0f33fd7f4f3e8f517",
  fractionFigureSurface: "f91c885b8d207746a583263e12eaf154c79551e45a12a57f6aa00664274034fb",
  figureIds: "7099c571bf90b4ab4feabdee8c741a321ad6f7ffe68d7ad9ad6ed0db646a7876",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
};
const expectedBasis = {
  "g3f-01-01": "32284ef4ca063451690172766db4589da2184b67fcabb37126d74c79076dfbff",
  "g3f-01-02": "69ff76b2766abcd8d9a574f34775cc0687c2471a8e7a3c563142186129cf21b4",
  "g3f-01-03": "f99ff3c2c60833ce36b84bd3301e0b78db4608baf161930ec1f52ac4b97ce560",
  "g3f-01-04": "ae6d272c3b20f34252a1f95c8eae854ec459f1e9f691510e2df096e35ea3cf09",
  "g3f-01-05": "640e55fbfb6d2a5a9e26abb744f34d102f4c787dc766c9648c1bc9591182ede6",
  "g3f-02-01": "0ab42d35065399178abc1426eb425ba1df7ac63f408dc6979a802c7586a9711a",
  "g3f-02-02": "cca00b0fee2d222157a5466d5d5a1d9c68fd3c39ffdcc1281b81df687186b4b3",
  "g3f-02-03": "a055caf66d34472e224f03d318f8e05841b202240585e58ebf28962b47d87e95",
  "g3f-02-04": "bf700a92299630287356fb95d97e3e4d2e2309a9018e647687c5596452948881",
  "g3f-02-05": "0bf9c22dedd412ebfec44b6382bbf268b9926c78383c5c9897e725d4eca288a5",
  "g3f-03-01": "1d03a7729cd066770f8a9650b15e2b430584c6d2a86d751f4881e46372a34672",
  "g3f-03-02": "0fbea208ff1a3e874dfa1cf5dd7de169c443a86a9775a9e598aafd1fbf43cfdb",
  "g3f-03-03": "d9c73b1104099b865225156843a8f84de3a729bd0bd54fe779f6d54b0a29ad60",
  "g3f-03-04": "92ae69aa939107c230d446bdbad9116ed1bf479e9b0078f803c3b3995e003036",
};
const expectedFigures = {
  "g3f-01-01": ["frac-equal-vs-unequal", "frac-equal-vs-unequal"],
  "g3f-01-02": ["frac-unit-fourth", "thirds-compare"],
  "g3f-01-03": ["frac-three-fourths", "frac-top-bottom"],
  "g3f-01-04": ["fm-fraction-of", "fm-fraction-of"],
  "g3f-01-05": ["frac-numline-fourths", "mc-ruler-eighths"],
  "g3f-02-01": ["frac-numline-fourths", "frac-numline-unit"],
  "g3f-02-02": ["thirds-compare", "thirds-compare"],
  "g3f-02-03": ["frac-equiv-half", "fa-multiplier"],
  "g3f-02-04": ["frac-equiv-numline", "frac-equiv-numline"],
  "g3f-02-05": ["frac-whole-disguise", "frac-whole-disguise"],
  "g3f-03-01": ["frac-whole-disguise", "frac-whole-disguise"],
  "g3f-03-02": ["frac-compare-wholes", "frac-compare-same-denom"],
  "g3f-03-03": ["frac-compare-same-denom", "frac-compare-same-numer"],
  "g3f-03-04": ["frac-top-bottom", "frac-top-bottom"],
};
const expectedLanguageRevise = new Set(["g3f-01-04", "g3f-02-05", "g3f-03-01", "g3f-03-04"]);
const fractionFigureFunctions = ["FaMultiplier", "FmFractionOf", "FracCompareSameDenom", "FracCompareSameNumer", "FracCompareWholes", "FracEqualVsUnequal", "FracEquivHalf", "FracEquivNumline", "FracNumlineFourths", "FracNumlineUnit", "FracThreeFourths", "FracTopBottom", "FracUnitFourth", "FracWholeDisguise", "McRulerEighths", "ThirdsCompare"];

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const same = (left, right) => stable(left) === stable(right);
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
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
  const [headers, ...body] = rows.filter((candidate) => candidate.some(Boolean));
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
function evidenceFile(reference) {
  const value = String(reference);
  const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
}
function extractFunctions(source, names) {
  return names.map((name) => {
    let start = source.indexOf(`function ${name}(`);
    if (start < 0) start = source.indexOf(`const ${name} =`);
    if (start < 0) return "";
    const ends = [source.indexOf("\nfunction ", start + 1), source.indexOf("\nconst ", start + 1)].filter((value) => value > start);
    const end = ends.length ? Math.min(...ends) : source.length;
    return source.slice(start, end).trim();
  }).join("\n---\n");
}

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, repairReportPath, focusedTestPath, repairScriptPath]) {
  if (!fs.existsSync(file)) errors.push(`missing required evidence: ${path.relative(root, file)}`);
}
const course = JSON.parse(read(coursePath));
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((entry) => entry.courseId === "fractions-deeper-g3");
const liveById = new Map(liveLessons.map((entry) => [entry.lessonId, entry]));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0];
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId));
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const requiredFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);

if (course.id !== "fractions-deeper-g3" || course.gradeLevel !== 3) errors.push("unexpected course identity/grade");
if (lessonIds.length !== 14 || new Set(lessonIds).size !== 14) errors.push("course manifest must contain 14 unique lessons");
if (liveLessons.length !== 14) errors.push(`current authority contains ${liveLessons.length} scoped lessons, expected 14`);
if (records.length !== 14 || new Set(records.map((record) => record.lessonId)).size !== 14) errors.push("candidate must contain 14 unique lesson records");
if (new Set(records.map((record) => record.recordId)).size !== 14) errors.push("candidate record IDs are not unique");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from course manifest");
if (sha256(read(coursePath)) !== expectedHashes.course) errors.push("reviewed course manifest hash changed");
if (sha256(read(figureIdsPath)) !== expectedHashes.figureIds) errors.push("registered figure-ID authority hash changed");
if (sha256(read(alignmentPath)) !== expectedHashes.alignment) errors.push("figure/text visibility authority hash changed");
const figureSource = read(figuresPath);
if (sha256(extractFunctions(figureSource, fractionFigureFunctions)) !== expectedHashes.fractionFigureSurface) errors.push("reviewed fraction-figure implementation surface changed");

for (const id of lessonIds) {
  const record = recordById.get(id), live = liveById.get(id), lesson = lessons.get(id);
  if (!record || !live || !lesson) continue;
  const fields = new Set(Object.keys(record));
  if (fields.size !== requiredFields.size || [...fields].some((field) => !requiredFields.has(field))) errors.push(`${id}: candidate fields differ from ledger schema`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S252-G3F-${id}`) errors.push(`${id}: record identity mismatch`);
  if (record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== live.reviewBasisHash) errors.push(`${id}: candidate is not bound to exact current lesson authority`);
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED") errors.push(`${id}: expected REVISE/REQUIRED`);
  const expectedLanguage = expectedLanguageRevise.has(id) ? "REVISE" : "FIT";
  if (record.gradeLanguageDecision !== expectedLanguage) errors.push(`${id}: language decision should be ${expectedLanguage}`);
  if (!schema.contract.allowedLessonDecisions.includes(record.decision) || !schema.contract.allowedVisualDecisions.includes(record.visualDecision) || !schema.contract.allowedGradeLanguageDecisions.includes(record.gradeLanguageDecision)) errors.push(`${id}: decision enum outside schema`);
  if (record.reviewer !== "ChatGPT Work independent assessor (fractions-deeper-g3 S252)") errors.push(`${id}: reviewer mismatch`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: invalid timestamp`);
  if (String(record.rationale).length < 330 || String(record.reopenCondition).length < 250) errors.push(`${id}: rationale/reopen condition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 8) errors.push(`${id}: evidence references are incomplete`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  if (lesson.id !== id || lesson.courseId !== course.id) errors.push(`${id}: lesson identity mismatch`);
  const mainIds = lesson.steps.map((step) => step.id);
  const remedialIds = lesson.remedials.flatMap((route) => [route.concept.id, route.check.id]);
  const allIds = [...mainIds, ...remedialIds];
  if (new Set(allIds).size !== allIds.length) errors.push(`${id}: step IDs are not unique across main/remedial routes`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: reviewed two-concept figure mapping changed`);
  for (const step of concepts) {
    if (!step.figure || step.figure === "count-on-hops") errors.push(`${id}/${step.id}: missing or generic main figure`);
    if (step.body !== step.narration) errors.push(`${id}/${step.id}: body/narration parity changed`);
    if (!read(figureIdsPath).includes(JSON.stringify(step.figure))) errors.push(`${id}/${step.id}: figure is not in registered authority`);
  }
  const i1 = lesson.steps.find((step) => step.id === "i1"), i2 = lesson.steps.find((step) => step.id === "i2");
  if (!i1?.widget || !i2?.widget || i1.widget.prompt === i2.widget.prompt || stable(i1.widget) === stable(i2.widget)) errors.push(`${id}: repaired i1/i2 progression is no longer distinct`);
  if (!i2?.body || !/misconception|repair|notice|compare|check|look/i.test(`${i2.body} ${i2.predict?.reveal ?? ""}`)) errors.push(`${id}: i2 no longer provides an inspectable misconception-repair job`);
  if (lesson.remedials.length !== 1) errors.push(`${id}: expected one reviewed remedial route`);
  for (const route of lesson.remedials) {
    if (route.concept.figure) errors.push(`${id}: residual text-only remedial premise changed; reassessment required`);
    const k1 = lesson.steps.find((step) => step.id === "k1");
    if (!k1?.widget || !same(route.check.widget, k1.widget)) errors.push(`${id}: residual exact k1 remedial repetition changed; reassessment required`);
    if (route.concept.body !== route.concept.narration) errors.push(`${id}: remedial body/narration parity changed`);
  }
}

let fractionBarSurfaces = 0, correctedFeedbackLines = 0, truthfulFeedbackLines = 0;
for (const [id, lesson] of lessons) {
  const widgets = [
    ...lesson.steps.filter((step) => step.widget).map((step) => ({ widget: step.widget, main: true })),
    ...lesson.remedials.map((route) => ({ widget: route.check.widget, main: false })),
  ];
  for (const { widget } of widgets) {
    if (widget.type === "fractionBar") {
      fractionBarSurfaces += 1;
      const target = `${widget.targetNum}/${widget.targetDen}`;
      for (const field of ["lowFeedback", "highFeedback"]) {
        truthfulFeedbackLines += 1;
        if (id !== "g3f-01-01") correctedFeedbackLines += 1;
        if (!String(widget[field]).includes(target)) errors.push(`${id}/${widget.prompt}: ${field} omits evaluator target ${target}`);
        if (/target half|longer than half|shorter than half/i.test(String(widget[field]))) errors.push(`${id}/${widget.prompt}: stale target-half feedback remains`);
      }
      if (!(widget.targetNum >= widget.numMin && widget.targetNum <= widget.numMax && widget.targetDen >= widget.denMin && widget.targetDen <= widget.denMax)) errors.push(`${id}/${widget.prompt}: fraction target outside evaluator range`);
      const distractors = widget.commonFractions ?? [];
      if (new Set(distractors.map((item) => `${item.num}/${item.den}`)).size !== distractors.length) errors.push(`${id}/${widget.prompt}: duplicate fraction feedback states`);
    } else if (widget.type === "mcq") {
      if (widget.options.filter((option) => option.correct).length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length) errors.push(`${id}/${widget.prompt}: MCQ evaluator/options disagree`);
      if (widget.options.some((option) => !String(option.feedback).trim())) errors.push(`${id}/${widget.prompt}: MCQ option lacks feedback`);
    } else if (widget.type === "numeric") {
      if (!Number.isFinite(widget.answer)) errors.push(`${id}/${widget.prompt}: numeric evaluator answer is not finite`);
      const mistakes = widget.commonErrors ?? [];
      if (mistakes.some((item) => item.value === widget.answer) || new Set(mistakes.map((item) => item.value)).size !== mistakes.length) errors.push(`${id}/${widget.prompt}: numeric error map conflicts with answer`);
    } else if (widget.type === "numberLine") {
      if (widget.target < widget.min || widget.target > widget.max || !Number.isFinite(widget.step)) errors.push(`${id}/${widget.prompt}: number-line evaluator target/range invalid`);
    }
  }
}
if (fractionBarSurfaces !== 20 || truthfulFeedbackLines !== 40 || correctedFeedbackLines !== 36) errors.push(`feedback coverage ${fractionBarSurfaces} fraction bars/${truthfulFeedbackLines} truthful lines/${correctedFeedbackLines} repaired lines, expected 20/40/36`);

const arrayLesson = lessons.get("g3f-01-04");
const arrayFallbacks = [...arrayLesson.steps, ...arrayLesson.remedials.map((route) => route.check)].filter((step) => step.widget?.type === "numeric").map((step) => step.widget.fallbackFeedback ?? "");
if (!arrayFallbacks.some((text) => /equal pieces the whole was cut into/i.test(text))) errors.push("g3f-01-04 context-wrong numeric fallback debt changed; reassess language decision");
for (const id of ["g3f-02-05", "g3f-03-01", "g3f-03-04"]) if (!/mixed number/i.test(read(path.join(lessonDir, `${id}.json`)))) errors.push(`${id}: reviewed mixed-number terminology debt changed`);
const sixthsEighths = lessons.get("g3f-02-02");
if (!/1\/8|one eighth/i.test(stable(sixthsEighths.steps.filter((step) => step.kind === "concept"))) || !expectedFigures["g3f-02-02"].every((figure) => figure === "thirds-compare")) errors.push("g3f-02-02 sixths/eighths-to-thirds-only visual mismatch changed");

const cardsFresh = lessonIds.filter((id) => {
  const card = cardById.get(id), live = liveById.get(id);
  return card && live && card.reviewBasisHash === live.reviewBasisHash && card.lessonSourceHash === live.lessonSourceHash;
}).length;
if (cardsFresh !== 0) errors.push(`shared card freshness changed: ${cardsFresh} current cards; candidate deliberately binds live authority instead`);
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { GRADE_LANGUAGE_REVIEW: 14, ILLUSTRATION_REPLACEMENT: 26, LESSON_COMPLETE_DISPOSITION: 14, LESSON_PROGRESSION_AND_DUPLICATION: 14, VISUAL_FIRST_REPRESENTATION: 14 };
if (queue.length !== 82 || !same(queueCounts, expectedQueueCounts)) errors.push(`current scoped queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);

const lessonEnums = schema.contract.allowedLessonDecisions;
const visualEnums = schema.contract.allowedVisualDecisions;
const languageEnums = schema.contract.allowedGradeLanguageDecisions;
const decisions = countBy(records, "decision", lessonEnums);
const visuals = countBy(records, "visualDecision", visualEnums);
const languages = countBy(records, "gradeLanguageDecision", languageEnums);
if (!same(decisions, { KEEP: 0, REVISE: 14, ESCALATE: 0 })) errors.push(`lesson disposition distribution ${JSON.stringify(decisions)}`);
if (!same(visuals, { REQUIRED: 14, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 })) errors.push(`visual disposition distribution ${JSON.stringify(visuals)}`);
if (!same(languages, { FIT: 10, REVISE: 4, ESCALATE: 0 })) errors.push(`language disposition distribution ${JSON.stringify(languages)}`);

const result = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  sharedCardsFresh: cardsFresh,
  verifiedMainRepairs: { illustrationReplacements: 26, progressionClosures: 14, correctedFeedbackLines, truthfulFeedbackLines, fractionBarSurfaces },
  dispositions: decisions,
  visualDispositions: visuals,
  languageDispositions: languages,
  residualSpecializedDebt: { textOnlyRemedials: 14, exactK1RemedialRepeats: 14, sixthsEighthsVisualMismatch: 1, contextWrongNumericFallbackLessons: 1, mixedNumberTerminologyLessons: 3 },
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 42, lessonRevisionRowsOpened: 14, immediateNetReduction: 28, staleRepairedSourceRowsClosedOnRefresh: 40, expectedRowsAfterAppendAndSourceRefresh: 14 },
  hashes: { candidate: sha256(read(candidatePath)), ...expectedHashes },
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
