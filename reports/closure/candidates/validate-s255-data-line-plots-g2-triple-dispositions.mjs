#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S255_DATA_LINE_PLOTS_G2_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "data-line-plots-g2", "course.json");
const lessonDir = rel("content", "courses", "data-line-plots-g2", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const widgetsPath = rel("src", "components", "widgets.tsx");
const schemaPath = rel("src", "lib", "schema.ts");
const evaluatePath = rel("src", "lib", "evaluate.ts");
const repairReportPath = rel("reports", "pedagogy", "S254_DATA_LINE_PLOTS_G2_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session254.dataLinePlotsG2CourseIntegrity.test.tsx");
const legacyTestPath = rel("src", "lib", "session194.dataLinePlots.test.ts");
const repairScriptPath = rel("scripts", "audit", "repair-data-line-plots-g2-s254.mjs");

const expectedHashes = {
  candidate: "894056082a2a6182b7d07a6bdaffb2cdebec1322650d117ba766bf69cd384edd",
  course: "818fa5abcfe19f6d8002741759d4b42234e7f744a46ed1fe701120efe4434bd1",
  schema: "67887092e440910bec34d868099d29320946e95db3cb51b70d5cc815dcb7b129",
  evaluate: "1979ad6ac310485c5e13d2b915c6ae1fc65833542dea0e7dc60370d204a8c951",
  widgets: "7c7a6629507176d438f82abcfb9fd0057abd2a904794fe83c6fc09905a565149",
  figures: "a6558083bdf4bb1b8065cc7a01b4bb6dfab00638de63f7fa7126ac021b10fa59",
  figureIds: "d2145dc68cd70228875f88571b5d631bac2684a352c812e1fe2ae03cc0d5eb0e",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
};
const expectedBasis = {
  "g2g-01-01": "334ab79e9e14b138946b90cf0907f0687e49d29a475dcc269b484a8644fd8389",
  "g2g-01-02": "ef595cf10ee86c3ca1f30b2936e91113401bbc94dc7c63247c00ede6b8140b83",
  "g2g-01-03": "886a59a318bc1ee92408cf400f0478c83bccea72bf1b87ac6c033c297b356ddb",
  "g2g-01-04": "c990488870bec2d029eb8d5aed26d86348ac31f34daff77cdfbd8379efc08140",
  "g2g-01-05": "1954500345978ff5e9306c60822fbe89567c2b4b94effd3522223c5f39d88f75",
  "g2g-02-01": "29178a0976e40ab83e135cac328b2fb8503cc73b61ccf0983163af63cadc517b",
  "g2g-02-02": "954081706c0022cb601c07bf0af23cc35a71e4698a856c72285c5c84e6eebc49",
  "g2g-02-03": "dfc4b5ff266e074cab3beab8866ac74b7c72e089be5726beb4d651c3183767e6",
  "g2g-02-04": "419173d35ced67bcfc438d6bd3df1e176ec3362e4b655ffae4507148ccea25a0",
  "g2g-03-01": "675ae82b845ff1d3cf9c8d1ed17e876c34ae072ef3ab2269e4de7f03c1f6b994",
  "g2g-03-02": "b33d99ed903fbb8eaf45426f2a2ca64cbba93b5a583f585bc9cfe6b2a14c91f3",
  "g2g-03-03": "ce8c1303e74236854219e650026881d3cc1d9ecd92bd1a1eb895072fadbeba4a",
};
const expectedFigures = {
  "g2g-01-01": ["ruler-measure", "mmt-same-reading"],
  "g2g-01-02": ["dd-data-answers", "vm-line-plot-read"],
  "g2g-01-03": ["vm-line-plot-read", "vm-line-plot-read"],
  "g2g-01-04": ["vm-line-plot-read", "vm-line-plot-read"],
  "g2g-01-05": ["vm-line-plot-read", "vm-line-plot-read"],
  "g2g-02-01": ["mmt-picture-graph", "mmt-picture-graph"],
  "g2g-02-02": ["mmt-picture-graph", "mmt-picture-graph"],
  "g2g-02-03": ["single-scale-graph", "single-scale-graph"],
  "g2g-02-04": ["single-scale-graph", "mmt-taller-bar"],
  "g2g-03-01": ["single-scale-graph", "single-scale-graph"],
  "g2g-03-02": ["mmt-graph-subtraction", "single-scale-graph"],
  "g2g-03-03": ["vm-line-plot-read", "single-scale-graph"],
};
const copiedConcepts = new Set(["g2g-01-01", "g2g-01-03", "g2g-01-04", "g2g-01-05", "g2g-02-02", "g2g-02-03", "g2g-02-04"]);
const repeatedChecks = new Set(["g2g-01-01", "g2g-01-02", "g2g-01-03", "g2g-01-04", "g2g-01-05", "g2g-02-03", "g2g-02-04", "g2g-03-01", "g2g-03-02", "g2g-03-03"]);
const languageFit = new Set(["g2g-02-02", "g2g-03-03"]);
const weakFigurePlacements = new Set(["g2g-01-01/c2", "g2g-01-02/c1", "g2g-02-01/c1", "g2g-02-04/c2", "g2g-03-02/c1"]);

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const same = (left, right) => stable(left) === stable(right);
const normalize = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index];
    if (quoted) { if (ch === '"' && text[index + 1] === '"') { cell += '"'; index += 1; } else if (ch === '"') quoted = false; else cell += ch; }
    else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...body] = rows.filter((candidate) => candidate.some(Boolean));
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
function evidenceFile(reference) {
  const value = String(reference); const marker = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
  return marker === undefined ? value : value.slice(0, marker);
}

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, widgetsPath, schemaPath, evaluatePath, repairReportPath, focusedTestPath, legacyTestPath, repairScriptPath]) {
  if (!fs.existsSync(file)) errors.push(`missing required evidence: ${path.relative(root, file)}`);
}
if (sha256(read(candidatePath)) !== expectedHashes.candidate) errors.push("candidate hash changed");
for (const [name, file] of [["course", coursePath], ["schema", schemaPath], ["evaluate", evaluatePath], ["widgets", widgetsPath], ["figures", figuresPath], ["figureIds", figureIdsPath], ["alignment", alignmentPath]]) {
  if (sha256(read(file)) !== expectedHashes[name]) errors.push(`${name} reviewed surface hash changed`);
}

const schema = parseJsonl(ledgerPath)[0];
const requiredFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((entry) => entry.courseId === course.id);
const liveById = new Map(liveLessons.map((entry) => [entry.lessonId, entry]));
const records = parseJsonl(candidatePath);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId));
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const figureIdsSource = read(figureIdsPath);

if (course.id !== "data-line-plots-g2" || course.gradeLevel !== 2 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("unexpected course identity, grade, or manifest");
if (liveLessons.length !== 12 || records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate/live authority must contain 12 unique lessons/records");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");

let conceptFigures = 0, textOnlyRemedials = 0, exactCopiedConcepts = 0, exactRepeatedChecks = 0, mcqSurfaces = 0, firstKeyedMcqs = 0;
const observedWeak = new Set();
for (const id of lessonIds) {
  const lesson = lessons.get(id), record = recordById.get(id), live = liveById.get(id);
  if (!lesson || !record || !live) continue;
  const fields = new Set(Object.keys(record));
  if (fields.size !== requiredFields.size || [...fields].some((field) => !requiredFields.has(field))) errors.push(`${id}: candidate fields differ from schema`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S255-DLPG2-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== live.reviewBasisHash) errors.push(`${id}: record identity/current basis mismatch`);
  const expectedLanguage = languageFit.has(id) ? "FIT" : "REVISE";
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== expectedLanguage) errors.push(`${id}: expected REVISE/REQUIRED/${expectedLanguage}`);
  if (record.reviewer !== "ChatGPT Work independent assessor (data-line-plots-g2 S255)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp mismatch`);
  if (String(record.rationale).length < 280 || String(record.reopenCondition).length < 300) errors.push(`${id}: rationale/reopen condition not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 14) errors.push(`${id}: evidence incomplete`);
  else for (const ref of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(ref).split("/")))) errors.push(`${id}: missing evidence ${ref}`);

  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: concept figure mapping changed`);
  for (const concept of concepts) {
    conceptFigures += 1;
    if (!concept.figure || concept.figure === "count-on-hops" || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: repaired semantic figure contract changed`);
    if (weakFigurePlacements.has(`${id}/${concept.id}`)) observedWeak.add(`${id}/${concept.id}`);
  }
  const prompts = lesson.steps.filter((step) => step.widget).map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length) errors.push(`${id}: main prompt progression closure changed`);
  const remedial = lesson.remedials?.[0];
  if (!remedial || remedial.concept.figure) errors.push(`${id}: expected one text-only remedial route`); else textOnlyRemedials += 1;
  const c2 = concepts[1];
  const conceptCopied = remedial && remedial.concept.body === c2.body && remedial.concept.narration === c2.narration;
  if (conceptCopied) exactCopiedConcepts += 1;
  if (conceptCopied !== copiedConcepts.has(id)) errors.push(`${id}: exact remedial concept inventory changed`);
  const k1 = lesson.steps.find((step) => step.id === "k1");
  const checkRepeated = Boolean(remedial && k1 && same(remedial.check.widget, k1.widget));
  if (checkRepeated) exactRepeatedChecks += 1;
  if (checkRepeated !== repeatedChecks.has(id)) errors.push(`${id}: exact k1 remedial inventory changed`);
  for (const step of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.check])]) {
    if (step.widget?.type !== "mcq") continue;
    mcqSurfaces += 1;
    const correct = step.widget.options.filter((option) => option.correct);
    if (correct.length !== 1) errors.push(`${id}/${step.id}: MCQ does not have one key`);
    if (step.widget.options[0]?.correct) firstKeyedMcqs += 1;
  }
}

if (conceptFigures !== 24 || textOnlyRemedials !== 12 || exactCopiedConcepts !== 7 || exactRepeatedChecks !== 10) errors.push(`residual inventory changed: ${JSON.stringify({ conceptFigures, textOnlyRemedials, exactCopiedConcepts, exactRepeatedChecks })}`);
if (mcqSurfaces !== 15 || firstKeyedMcqs !== 15) errors.push(`MCQ position inventory changed: ${mcqSurfaces}/${firstKeyedMcqs}`);
if (!same([...observedWeak].sort(), [...weakFigurePlacements].sort())) errors.push("weak concept-to-figure inventory changed");

const modeLesson = lessons.get("g2g-01-05");
const modeI1 = modeLesson.steps.find((step) => step.id === "i1").widget;
const modeI2 = modeLesson.steps.find((step) => step.id === "i2").widget;
const labelAt = (widget) => widget.values[widget.askIndex] / (widget.denominator ?? 1);
if (modeI1.type !== "dotPlot" || labelAt(modeI1) !== 6 || modeI1.given[modeI1.askIndex] !== 5 || !/which value/i.test(modeI1.prompt)) errors.push("g2g-01-05/i1 reviewed modal-value action debt changed");
if (modeI2.type !== "dotPlot" || labelAt(modeI2) !== 6 || modeI2.given[modeI2.askIndex] !== 6 || !/which measured value/i.test(modeI2.prompt)) errors.push("g2g-01-05/i2 reviewed value-frequency collision changed");
if (!read(evaluatePath).includes("if (v[ask] === spec.given[ask] && marked === spec.given[ask])") || !read(widgetsPath).includes("Tap X's to count them.")) errors.push("reviewed dotPlot action/evaluator contract changed");

const queueCounts = countBy(queue, "workstream", ["ILLUSTRATION_REPLACEMENT", "LESSON_PROGRESSION_AND_DUPLICATION", "LESSON_COMPLETE_DISPOSITION", "VISUAL_FIRST_REPRESENTATION", "GRADE_LANGUAGE_REVIEW"]);
const expectedQueueCounts = { ILLUSTRATION_REPLACEMENT: 24, LESSON_PROGRESSION_AND_DUPLICATION: 12, LESSON_COMPLETE_DISPOSITION: 12, VISUAL_FIRST_REPRESENTATION: 12, GRADE_LANGUAGE_REVIEW: 12 };
if (queue.length !== 72 || !same(queueCounts, expectedQueueCounts)) errors.push(`current queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions);
const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions);
const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 0, REVISE: 12, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 12, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 }) || !same(languages, { FIT: 2, REVISE: 10, ESCALATE: 0 })) errors.push(`disposition distributions changed: ${JSON.stringify({ decisions, visuals, languages })}`);
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const freshCards = lessonIds.filter((id) => cardById.get(id)?.reviewBasisHash === expectedBasis[id]).length;

const result = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  sharedCardsFresh: freshCards,
  verifiedSourceClosures: { illustration: 24, progression: 12, total: 36 },
  dispositions: decisions,
  visualDispositions: visuals,
  languageDispositions: languages,
  residualSpecializedDebt: { textOnlyRemedials, exactCopiedConcepts, exactK1RemedialRepeats: exactRepeatedChecks, mcqSurfaces, fixedFirstKeyedMcqs: firstKeyedMcqs, weakConceptFigurePlacements: observedWeak.size, modalValueActionMismatch: 1, maskedValueFrequencyCollision: 1 },
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, lessonRevisionRowsOpened: 12, immediateNetReduction: 24, staleRepairedSourceRowsClosedOnRefresh: 36, expectedRowsAfterAppendAndSourceRefresh: 12 },
  releaseBlocker: "No shared-engine or learner-visible arithmetic blocker was found. Release-quality lesson revision remains required for the dotPlot value-vs-marking prompt contract, visual-less remedials, repeated retry jobs, fixed-first MCQ keys, and five weak concept-to-figure placements.",
  hashes: expectedHashes,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
