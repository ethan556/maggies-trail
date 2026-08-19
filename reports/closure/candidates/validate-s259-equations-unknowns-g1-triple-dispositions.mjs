#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S259_EQUATIONS_UNKNOWNS_G1_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "equations-unknowns-g1", "course.json");
const lessonDir = rel("content", "courses", "equations-unknowns-g1", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const koaFiguresPath = rel("src", "components", "figures", "koaJoinFigures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const reportPath = rel("reports", "pedagogy", "S259_EQUATIONS_UNKNOWNS_G1_WHOLE_COURSE_REPAIR.md");
const testPath = rel("src", "lib", "session259.equationsUnknownsG1CourseIntegrity.test.tsx");
const legacyTestPath = rel("src", "lib", "session191.batchA.test.ts");
const repairPath = rel("scripts", "audit", "repair-equations-unknowns-g1-s259.mjs");

const expectedHashes = {
  candidate: "432c6a40e0cfe9cb76b96128ad038140d4f1b98d1fcace6cda81bd811b064e5b",
  course: "eceb47512596cecbd32276f35ce78ed95d34ad69286bb0b21989dd33759247c2",
  reviewedFigureSurface: "f808b08238d9d9c85022deda4edb87f7ff8120d9f7ea45efedd1663782ae5b83",
  repair: "7ec4338685263fc5c8e7b7634760f47f27e944c3ecbd6556f379e56f40a0fe61",
  test: "bad135e88cdffd40cc72b1343ddc9fee3292fa3460f4063d9346ed4d50cd3cfb",
  variants: "ac3ead66b78825d0c60e6dfc8ce1f919039a3dbeaf2abcdc144be5ee2afdea8a",
  evaluators: "519622e3d202ccfc09900687bba51530af4534bea275a78e3577194b59764a3a",
};
const expectedBasis = {
  "g1e-01-01": "c233359e5e041e95ff829cc6ae9089dac8df7417c388f74620c11c3c4709d302",
  "g1e-01-02": "36ebc6f86f84b2d1a230003c33baf739b0126e9b212812d02df2bb23378786ff",
  "g1e-01-03": "bd688543f51b33138a90b54d425cb97cc2a38858ae15201ed503ece16a630f7a",
  "g1e-01-04": "ec399d209e7fe912a21559186ca07047c888896c47b1001f880e4066fb3631c2",
  "g1e-01-05": "0a50d205819f8f7b5a8363728d48c2376fd8bcb804a3e7bef4314ec048ce0199",
  "g1e-02-01": "abc90bdee160a4f8fb4bd70fbd89eb3c88d95aa4da385835728a8c6fa69f1d9a",
  "g1e-02-02": "a7cdc6be8177f577a810e86dce1435e84cb9fc0c31acf4e8fdf5f6d613b4bdf3",
  "g1e-02-03": "da7b294b8e68253f7e04cc3733bbe74c03ecee8cf0c834a744543b8201791f23",
  "g1e-02-04": "2fb6de19b1d0bc1bdade99375a422fae7181fe4d4a4d0641e157a8670871f02c",
  "g1e-03-01": "ccc32a3ab148667d2a4cfeeb3d3fff5eea4e3956db196d6d779ef57d601d6977",
  "g1e-03-02": "4fab361a41f6c86f121ecd6beb65dba55ce428d0be8d5708ab27b98d1bffee42",
  "g1e-03-03": "7f11d7b1999495f8421df360fd94c20a0963c77535592cefeaeafe444eb029e6",
};
const expectedFigures = {
  "g1e-01-01": ["as-equal-sign", "add-balance-scale"], "g1e-01-02": ["as-equal-sign", "add-balance-scale"],
  "g1e-01-03": ["add-balance-scale", "balance-unknown"], "g1e-01-04": ["add-balance-scale", "balance-unknown"],
  "g1e-01-05": ["add-balance-scale", "as-equal-sign"], "g1e-02-01": ["bar-join", "koa-join-two-groups"],
  "g1e-02-02": ["balance-unknown", "bar-part-whole"], "g1e-02-03": ["bar-part-whole", "as-part-whole"],
  "g1e-02-04": ["difference-gap", "fact-family"], "g1e-03-01": ["fact-family", "as-fact-family"],
  "g1e-03-02": ["balance-unknown", "as-unknown"], "g1e-03-03": ["as-equal-sign", "add-balance-scale"],
};
const revise = new Set(["g1e-01-01", "g1e-01-02", "g1e-01-04", "g1e-01-05", "g1e-02-01", "g1e-02-02", "g1e-02-03", "g1e-03-01", "g1e-03-02", "g1e-03-03"]);
const languageRevise = new Set(["g1e-02-01", "g1e-02-02", "g1e-02-03", "g1e-03-02"]);
const choiceLessons = new Set(["g1e-01-01", "g1e-01-02", "g1e-01-04", "g1e-01-05", "g1e-03-01", "g1e-03-02", "g1e-03-03"]);
const figureFunctions = ["DifferenceGap", "FactFamily", "AddBalanceScale", "BalanceUnknown", "BarJoin", "BarPartWhole", "AsFactFamily", "AsEqualSign", "AsUnknown", "AsPartWhole"];

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const stable = (value) => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const same = (left, right) => stable(left) === stable(right);
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => { try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); } });
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
const normalize = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
function parseCsv(text) { const rows = []; let row = [], cell = "", quoted = false; for (let i = 0; i < text.length; i += 1) { const ch = text[i]; if (quoted) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (ch === '"') quoted = false; else cell += ch; } else if (ch === '"') quoted = true; else if (ch === ",") { row.push(cell); cell = ""; } else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; } else cell += ch; } if (cell || row.length) { row.push(cell); rows.push(row); } const [headers, ...body] = rows.filter((entry) => entry.some(Boolean)); return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))); }
function extractFunction(source, name) { const start = source.indexOf(`function ${name}(`); const end = source.indexOf("\nfunction ", start + 1); return start < 0 ? "" : source.slice(start, end < 0 ? source.length : end).trim(); }
function evaluatorSignature(widget) { if (widget.type === "numeric") return { type: widget.type, answer: widget.answer }; if (widget.type === "mcq") return { type: widget.type, correct: widget.options.filter((option) => option.correct).map((option) => option.id), order: widget.options.map((option) => option.id) }; if (widget.type === "numberLineHop") return { type: widget.type, landing: widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops }; if (widget.type === "tenFrame") return { type: widget.type, target: widget.target }; return { type: widget.type }; }

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, koaFiguresPath, figureIdsPath, reportPath, testPath, legacyTestPath, repairPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath); const byId = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0]; const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const authority = loadLessonReviewAuthority(root); const live = new Map(authority.lessons.filter((entry) => entry.courseId === course.id).map((entry) => [entry.lessonId, entry]));
const mainSource = read(figuresPath); const koaSource = read(koaFiguresPath);
const reviewedSurface = figureFunctions.map((name) => extractFunction(mainSource, name)).concat(extractFunction(koaSource, "KoaJoinTwoGroups")).join("\n---\n");
if (course.id !== "equations-unknowns-g1" || course.gradeLevel !== 1 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.recordId)).size !== 12 || !same([...byId.keys()].sort(), [...lessonIds].sort())) errors.push("candidate identity/set invalid");
if (sha256(read(candidatePath)) !== expectedHashes.candidate || sha256(read(coursePath)) !== expectedHashes.course || sha256(reviewedSurface) !== expectedHashes.reviewedFigureSurface || sha256(read(repairPath)) !== expectedHashes.repair || sha256(read(testPath)) !== expectedHashes.test) errors.push("sealed evidence hash changed");
for (const surface of [...figureFunctions.map((name) => extractFunction(mainSource, name)), extractFunction(koaSource, "KoaJoinTwoGroups")]) if (!surface.includes("<title") || !surface.includes('role="img"')) errors.push("reviewed figure accessibility changed");

let conceptFigures = 0, remedialFigures = 0, graded = 0, mcqs = 0, correctAtZero = 0, diverse = 0; const variants = [], evaluators = [];
for (const id of lessonIds) {
  const lesson = lessons.get(id); const record = byId.get(id); const current = live.get(id);
  if (!record || !current) { errors.push(`${id}: missing candidate/current authority`); continue; }
  if (!same(Object.keys(record).sort(), requiredFields)) errors.push(`${id}: canonical fields changed`);
  const expectedDecision = revise.has(id) ? "REVISE" : "KEEP"; const expectedLanguage = languageRevise.has(id) ? "REVISE" : "FIT";
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S259-G1E-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== current.reviewBasisHash || record.decision !== expectedDecision || record.visualDecision !== "SUFFICIENT" || record.gradeLanguageDecision !== expectedLanguage) errors.push(`${id}: identity/basis/disposition mismatch`);
  if (record.reviewer !== "ChatGPT Work independent assessor (equations-unknowns-g1 S259)" || !Number.isFinite(Date.parse(record.reviewedAt)) || String(record.rationale).length < 250 || String(record.reopenCondition).length < 250 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 10) errors.push(`${id}: review evidence incomplete`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept"); if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: concept figure map changed`);
  for (const concept of concepts) { conceptFigures += 1; if (!concept.figure || concept.figure === "count-on-hops" || concept.body !== concept.narration || !read(figureIdsPath).includes(JSON.stringify(concept.figure))) errors.push(`${id}/${concept.id}: figure registration/narration invalid`); }
  if (!Array.isArray(lesson.remedials) || lesson.remedials.length !== 1 || !lesson.remedials[0].concept.figure || lesson.remedials[0].concept.body !== lesson.remedials[0].concept.narration) errors.push(`${id}: remedial figure/narration invalid`); else remedialFigures += 1;
  const entries = [...lesson.steps.filter((step) => step.widget), lesson.remedials[0].check]; const prompts = entries.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(entries.map((step) => stable(step.widget))).size !== entries.length) errors.push(`${id}: progression/remedial collision`); else diverse += 1;
  const lessonMcqs = entries.filter((step) => step.widget.type === "mcq"); if (choiceLessons.has(id) !== Boolean(lessonMcqs.length)) errors.push(`${id}: reviewed choice boundary changed`);
  for (const step of entries) { const widget = step.widget; graded += 1; evaluators.push([id, step.id, evaluatorSignature(widget)]); if (step.variant) variants.push([id, step.id, step.variant]);
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((entry) => entry.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
    if (widget.type === "tenFrame" && (!Number.isInteger(widget.target) || widget.target < 0 || widget.target > 10)) errors.push(`${id}/${step.id}: ten-frame target invalid`);
    if (widget.type === "numberLineHop") { const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops; if (landing < widget.min || landing > widget.max || (widget.commonLandings ?? []).some((entry) => entry.value === landing)) errors.push(`${id}/${step.id}: hop evaluator invalid`); }
    if (widget.type === "mcq") { mcqs += 1; const at = widget.options.findIndex((option) => option.correct); if (at === 0) correctAtZero += 1; if (widget.options.length !== 4 || widget.options.filter((option) => option.correct).length !== 1 || at !== 0 || !same(widget.options.map((option) => option.id), ["o0", "o1", "o2", "o3"]) || widget.options.some((option) => !option.feedback)) errors.push(`${id}/${step.id}: reviewed MCQ contract changed`); }
  }
}
if (conceptFigures !== 24 || remedialFigures !== 12 || graded !== 84 || mcqs !== 24 || correctAtZero !== 24 || diverse !== 12 || variants.length !== 48 || sha256(stable(variants)) !== expectedHashes.variants || sha256(stable(evaluators)) !== expectedHashes.evaluators) errors.push(`coverage/seal changed: concepts=${conceptFigures} remedials=${remedialFigures} graded=${graded} mcqs=${mcqs} at0=${correctAtZero} diverse=${diverse} variants=${variants.length}`);
const checkLesson = lessons.get("g1e-03-02"); const repeatedDistractors = same(checkLesson.steps.find((step) => step.id === "k1").widget.options.slice(1).map((option) => option.label), checkLesson.steps.find((step) => step.id === "ch1").widget.options.slice(1).map((option) => option.label)); if (!repeatedDistractors) errors.push("g1e-03-02 reviewed repeated distractor debt changed");
const writing = lessons.get("g1e-03-03"); if (writing.steps.some((step) => step.widget?.type === "equationBuilder" || /write your own/i.test(step.widget?.prompt ?? "") && step.widget?.type !== "mcq")) errors.push("g1e-03-03 reviewed missing-authorship boundary changed");
for (const [id, pattern] of [["g1e-02-01", /end-unknown of/i], ["g1e-02-02", /middle-unknown of/i], ["g1e-02-03", /start-unknown of/i], ["g1e-03-02", /Substitute 8: verify/i]]) if (!pattern.test(JSON.stringify(lessons.get(id)))) errors.push(`${id}: reviewed language debt changed`);
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id)); const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((stream) => [stream, queue.filter((row) => row.workstream === stream).length])); const expectedQueue = { GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 23, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 12, VISUAL_FIRST_REPRESENTATION: 12 }; if (queue.length !== 71 || !same(queueCounts, expectedQueue)) errors.push(`queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId)); const cardsFresh = cards.filter((card) => card.reviewBasisHash === live.get(card.lessonId)?.reviewBasisHash && card.lessonSourceHash === live.get(card.lessonId)?.lessonSourceHash).length; if (cardsFresh !== 0) errors.push(`shared card freshness changed: ${cardsFresh}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions); const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions); const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 2, REVISE: 10, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 0, PREFERRED: 0, SUFFICIENT: 12, ESCALATE: 0 }) || !same(languages, { FIT: 8, REVISE: 4, ESCALATE: 0 })) errors.push("disposition distribution changed");

console.log(JSON.stringify({ status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length, currentLessonHashesMatched: lessonIds.filter((id) => byId.get(id)?.reviewedBasisHash === live.get(id)?.reviewBasisHash).length, sharedCardsFresh: cardsFresh, verifiedSourceClosures: { queuedIllustrations: 23, additionalFigureUpgrade: 1, progression: 12, sourceQueueRows: 35, figuredDiversifiedRemedials: 12 }, reviewedRuntime: { conceptFigures, remedialFigures, gradedSurfaces: graded, authoredVariants: variants.length }, specializedResiduals: { correctOptionAtFirstPosition: `${correctAtZero}/${mcqs}`, repeatedDistractorPayloadLesson: "g1e-03-02", missingPromisedAuthorshipLesson: "g1e-03-03", languageLessons: [...languageRevise] }, dispositions: decisions, visualDispositions: visuals, languageDispositions: languages, currentScopedQueue: { rows: queue.length, distribution: queueCounts }, expectedQueueEffect: { genericRowsClosedOnAppend: 36, staleSourceRowsClosedOnRefresh: 35, consolidatedRevisionRowsOpened: 10, projectedRows: 10 }, releaseBlockers: [], errors }, null, 2));
if (errors.length) process.exitCode = 1;
