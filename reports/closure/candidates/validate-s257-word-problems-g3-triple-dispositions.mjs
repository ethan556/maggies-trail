#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S257_WORD_PROBLEMS_G3_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "word-problems-g3", "course.json");
const lessonDir = rel("content", "courses", "word-problems-g3", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const reportPath = rel("reports", "pedagogy", "S257_WORD_PROBLEMS_G3_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session257.wordProblemsG3CourseIntegrity.test.tsx");
const legacyTestPath = rel("src", "lib", "session195.wordProblemsG3.test.ts");
const repairPath = rel("scripts", "audit", "repair-word-problems-g3-s257.mjs");

const expectedHashes = {
  candidate: "a434a40815eb4e5200e60c578b61ce7215b2bc232dede44e5f21683d7a6a210d",
  course: "0601e8ada41431e7e5e10baddbc438add41346c4a18e4efd3f66125eccc55f12",
  figureSurface: "907d3b2b3ed58a97eb5a7dc21fc8b51b1ab859a87793d22daa08aa38f3687136",
  figureIds: "ac3979c63119e457b6c41b37a2d09e30ff473a945cf698133202e084d70cdfb8",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
  repair: "8a5005c13e5a6379eb946d4d2198648f8d2c8b811f1f793e7b287cdb3c506dc8",
  focusedTest: "61474ed39d0cdfea9604e3eb223539127d24ae6bced1f9ff8874e1a82a0c4ef9",
  legacyTest: "e1a43f0e923d80a1026a9c339e407fb1026e682962a38ec58f83c0d27f48aacd",
  variants: "c906e0590e2c5ac986650c6f9f2f7c5d342de54409db3b751dd022904a0f2113",
  evaluators: "f76310fa9f28e3aa92ac4d1da4de34e622f4dc84cdb75233f23305c38ad51b12",
};
const expectedBasis = {
  "g3w-01-01": "643b3e6296f4583007a63adbfcb079ac22827301a6d9c7f99f862c04e5469982",
  "g3w-01-02": "9259a0bd3e5b582e8fd0f0cfecf9e3fc789d222c459936a943688a4585851d3c",
  "g3w-01-03": "998e73e65ac82d0308e45fb427716004caa09ddf62f53d3563c070e7297841b6",
  "g3w-01-04": "cb4df320929f46b9bf0e931bc8bd04a8d7a1d4bb044455b486891f69d86ee4d6",
  "g3w-02-01": "6ab46678431e25b970dcdfe92fc48c6731a82c57452608daf8d066d5bdaef347",
  "g3w-02-02": "dbcfa48b36a505c6fabad22b00d369b74b24184931ed4eefc26c0f9c1fb8555f",
  "g3w-02-03": "fd9100d38ef35109e52b9285dd7a542597959f536f64a1d358fa6520886c88f3",
  "g3w-02-04": "f1489afd23aa3834d429285a031ae94f6d05526fb5f13eadc2c6eed6eedaef51",
  "g3w-03-01": "b480f4a07721d74fe95aa03d78f6048e8c0700dc2210edadff21ab534cb4d2ec",
  "g3w-03-02": "43841f2eef536f33d282338dea796f89ffc8d67ac2046828201718495463c3ec",
  "g3w-03-03": "8abb596b7362e95d5266df4bf56cd7e68667b84c924b3b29c12e4cce88aad917",
  "g3w-03-04": "9732e9144edcfb9e494232a0dc6f05ac51143e9abcd634e45e8ebd121bcab333",
};
const expectedFigures = {
  "g3w-01-01": ["mb-multistep", "two-step-bar"], "g3w-01-02": ["dop-grouping", "mult3-equal-groups"],
  "g3w-01-03": ["mb-multistep", "mult3-equal-groups"], "g3w-01-04": ["mult3-fair-shares", "bar-join"],
  "g3w-02-01": ["ee-variable", "mult3-missing-factor"], "g3w-02-02": ["dop-order-matters", "dop-word-expr"],
  "g3w-02-03": ["two-step-bar", "mb-multistep"], "g3w-02-04": ["mmt-estimate", "mmt-estimate-catch"],
  "g3w-03-01": ["pv3-round-ten", "mult3-estimate"], "g3w-03-02": ["mmt-estimate-catch", "mb-multistep"],
  "g3w-03-03": ["as100-keyword-trap", "mult3-equal-groups"], "g3w-03-04": ["dop-word-expr", "dop-grouping"],
};
const specializedVisualResiduals = ["g3w-01-01/c2", "g3w-01-03/c2", "g3w-01-04/c2", "g3w-02-03/c1", "g3w-03-03/c1", "g3w-03-04/c2"];
const languageRevise = new Set(["g3w-01-03", "g3w-01-04", "g3w-02-02", "g3w-02-03", "g3w-02-04", "g3w-03-01", "g3w-03-02", "g3w-03-04"]);
const languageDebtPatterns = {
  "g3w-01-03": [/compact retrieval case/i, /return 0/i], "g3w-01-04": [/what is 24 ÷ 6 counters per team/i],
  "g3w-02-02": [/0 returned/i], "g3w-02-03": [/0 returned/i, /0 added back/i], "g3w-02-04": [/add 0/i],
  "g3w-03-01": [/add 0/i, /subtract 0/i], "g3w-03-02": [/return 0/i], "g3w-03-04": [/remove 0/i],
};
const figureFunctions = ["MbMultistep", "TwoStepBar", "DopGrouping", "Mult3EqualGroups", "Mult3FairShares", "BarJoin", "EeVariable", "Mult3MissingFactor", "DopOrderMatters", "DopWordExpr", "MmtEstimate", "MmtEstimateCatch", "Pv3RoundTen", "Mult3Estimate", "As100KeywordTrap"];

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const stable = (value) => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const same = (left, right) => stable(left) === stable(right);
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => { try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); } });
const normalize = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) { const ch = text[index]; if (quoted) { if (ch === '"' && text[index + 1] === '"') { cell += '"'; index += 1; } else if (ch === '"') quoted = false; else cell += ch; } else if (ch === '"') quoted = true; else if (ch === ",") { row.push(cell); cell = ""; } else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; } else cell += ch; }
  if (cell || row.length) { row.push(cell); rows.push(row); } const [headers, ...body] = rows.filter((candidate) => candidate.some(Boolean)); return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
function evidenceFile(reference) { const value = String(reference); const markers = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b); return markers.length ? value.slice(0, markers[0]) : value; }
function extractFunctions(source, names) { return names.map((name) => { const start = source.indexOf(`function ${name}(`); const end = source.indexOf("\nfunction ", start + 1); return start < 0 ? "" : source.slice(start, end < 0 ? source.length : end).trim(); }).join("\n---\n"); }
function evaluatorSignature(widget) {
  if (widget.type === "numeric") return { type: widget.type, answer: widget.answer };
  if (widget.type === "mcq") return { type: widget.type, correct: widget.options.filter((option) => option.correct).map((option) => option.id) };
  if (widget.type === "numberLineHop") return { type: widget.type, landing: widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops };
  if (widget.type === "numberLinePlace" || widget.type === "estimateSlider") return { type: widget.type, target: widget.target };
  if (widget.type === "barBuilder") return { type: widget.type, target: widget.target };
  if (widget.type === "tapDiagram") return { type: widget.type, correct: widget.hotspots.filter((spot) => spot.correct).map((spot) => spot.id) };
  return { type: widget.type };
}

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, reportPath, focusedTestPath, legacyTestPath, repairPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath)); const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds); const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath); const recordById = new Map(records.map((record) => [record.lessonId, record])); const schema = parseJsonl(ledgerPath)[0]; const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const authority = loadLessonReviewAuthority(root); const live = authority.lessons.filter((entry) => entry.courseId === course.id); const liveById = new Map(live.map((entry) => [entry.lessonId, entry]));
const figureIdsSource = read(figureIdsPath); const figureSurface = extractFunctions(read(figuresPath), figureFunctions);

if (course.id !== "word-problems-g3" || course.gradeLevel !== 3 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course identity/manifest boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate must contain 12 unique lessons/records");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate || sha256(read(coursePath)) !== expectedHashes.course || sha256(figureSurface) !== expectedHashes.figureSurface || sha256(read(figureIdsPath)) !== expectedHashes.figureIds || sha256(read(alignmentPath)) !== expectedHashes.alignment || sha256(read(repairPath)) !== expectedHashes.repair || sha256(read(focusedTestPath)) !== expectedHashes.focusedTest || sha256(read(legacyTestPath)) !== expectedHashes.legacyTest) errors.push("one or more sealed evidence hashes changed");
for (const source of figureFunctions.map((name) => extractFunctions(read(figuresPath), [name]))) if (!source.includes("<title") || !source.includes('role="img"')) errors.push("reviewed figure accessibility surface changed");

let conceptFigures = 0, textOnlyRemedials = 0, diversifiedLessons = 0, gradedSurfaces = 0, cmlSurfaces = 0; const variants = [], evaluators = [];
for (const id of lessonIds) {
  const lesson = lessons.get(id); const record = recordById.get(id); const current = liveById.get(id); if (!record || !current) { errors.push(`${id}: missing candidate/current authority`); continue; }
  if (!same(Object.keys(record).sort(), requiredFields)) errors.push(`${id}: fields differ from canonical contract`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S257-G3W-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== current.reviewBasisHash) errors.push(`${id}: identity/current-basis mismatch`);
  const expectedLanguage = languageRevise.has(id) ? "REVISE" : "FIT";
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== expectedLanguage) errors.push(`${id}: expected REVISE/REQUIRED/${expectedLanguage}`);
  if (record.reviewer !== "ChatGPT Work independent assessor (word-problems-g3 S257)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp invalid`);
  if (String(record.rationale).length < 280 || String(record.reopenCondition).length < 280 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 10) errors.push(`${id}: rationale, reopen condition, or evidence incomplete`); else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: concept figure map changed`);
  for (const concept of concepts) { conceptFigures += 1; if (!concept.figure || concept.figure === "count-on-hops" || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: figure registration/narration failed`); }
  if (!lesson.remedials || lesson.remedials.length !== 1) errors.push(`${id}: expected one remedial route`);
  const route = lesson.remedials[0]; if (route.concept.figure) errors.push(`${id}: reviewed text-only remedial changed`); else textOnlyRemedials += 1; if (route.concept.body !== route.concept.narration) errors.push(`${id}: remedial narration mismatch`);
  const allWidgets = [...lesson.steps.filter((step) => step.widget), route.check]; const prompts = allWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(allWidgets.map((step) => stable(step.widget))).size !== allWidgets.length) errors.push(`${id}: progression/remedial collision returned`); else diversifiedLessons += 1;
  const lessonText = JSON.stringify(lesson); for (const pattern of languageDebtPatterns[id] ?? []) if (!pattern.test(lessonText)) errors.push(`${id}: reviewed language-debt boundary changed for ${pattern}`);
  for (const step of [...lesson.steps, route.concept, route.check]) if (step.cml) { cmlSurfaces += 1; if (/g3w |hidden question first/i.test(step.cml.actionGoal ?? "") || /g3w /i.test((step.cml.invariants ?? []).join(" ")) || /g3w /i.test((step.cml.misconceptions ?? []).join(" ")) || Object.keys(step.cml).some((key) => /waiver/i.test(key))) errors.push(`${id}/${step.id}: CML regression or waiver found`); }
  for (const step of allWidgets) {
    const widget = step.widget; gradedSurfaces += 1; evaluators.push([id, step.id, evaluatorSignature(widget)]); if (step.variant) variants.push([id, step.id, step.variant]);
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
    if (widget.type === "mcq" && (widget.options.length !== 4 || widget.options.filter((option) => option.correct).length !== 1 || !widget.options[0].correct || !same(widget.options.map((option) => option.id), ["o0", "o1", "o2", "o3"]) || widget.options.some((option) => !option.feedback))) errors.push(`${id}/${step.id}: MCQ evaluator invalid`);
    if (widget.type === "numberLineHop") { const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops; if (!(landing >= widget.min && landing <= widget.max) || (widget.commonLandings ?? []).some((trap) => trap.value === landing)) errors.push(`${id}/${step.id}: hop evaluator invalid`); }
    if (widget.type === "numberLinePlace" && (!(widget.target >= widget.min && widget.target <= widget.max) || widget.fractionDen !== undefined || (widget.commonPlacements ?? []).some((trap) => trap.value === widget.target))) errors.push(`${id}/${step.id}: placement evaluator invalid`);
    if (widget.type === "estimateSlider" && (!(widget.target > widget.min && widget.target < widget.max) || !Array.isArray(widget.choices) || widget.choices.length !== 3 || widget.choices.filter((choice) => choice.correct).length !== 1)) errors.push(`${id}/${step.id}: estimate evaluator invalid`);
    if (widget.type === "barBuilder" && (!Array.isArray(widget.target) || widget.target.length !== widget.categories.length || Math.max(...widget.target) > widget.maxVal)) errors.push(`${id}/${step.id}: bar evaluator invalid`);
    if (widget.type === "tapDiagram") { const correct = widget.hotspots.filter((spot) => spot.correct); if (!correct.length || correct.length === widget.hotspots.length || !widget.successFeedback || !/extra|irrelevant/i.test(widget.successFeedback)) errors.push(`${id}/${step.id}: tap selection/feedback invalid`); }
  }
}
if (conceptFigures !== 24 || textOnlyRemedials !== 12 || diversifiedLessons !== 12 || gradedSurfaces !== 84 || cmlSurfaces !== 72 || variants.length !== 27 || sha256(stable(variants)) !== expectedHashes.variants || sha256(stable(evaluators)) !== expectedHashes.evaluators) errors.push(`coverage or authored seals changed: figures=${conceptFigures} remedials=${textOnlyRemedials} diverse=${diversifiedLessons} graded=${gradedSurfaces} cml=${cmlSurfaces} variants=${variants.length}`);

const corpusText = JSON.stringify([...lessons.values()]);
for (const pattern of [/count-on-hops/i, /Fourths needs/i, /Bars A and D pass/i, /63's neighbors/i, /arriving shelve/i, /arriving boxe/i, /Name the hidden question first, answer it/i]) if (pattern.test(corpusText)) errors.push(`copied/generic defect returned: ${pattern}`);
const estimate = lessons.get("g3w-02-04"); const opening = estimate.steps.find((step) => step.id === "i1").widget; if (opening.type !== "estimateSlider" || opening.target !== 250 || opening.choices.find((choice) => choice.correct)?.value !== 250 || opening.choices.some((choice) => choice.value === 240 && choice.correct)) errors.push("g3w-02-04 exact-versus-useful estimate truth changed");
for (const id of ["i1", "i2"]) { const widget = lessons.get("g3w-03-03").steps.find((step) => step.id === id).widget; if (widget.type !== "tapDiagram" || !/extra|irrelevant/i.test(widget.successFeedback)) errors.push(`g3w-03-03/${id}: copied-feedback repair changed`); }

const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId)); const cardsFresh = cards.filter((card) => card.reviewBasisHash === liveById.get(card.lessonId)?.reviewBasisHash && card.lessonSourceHash === liveById.get(card.lessonId)?.lessonSourceHash).length; if (cardsFresh !== 0) errors.push(`shared card freshness changed: ${cardsFresh}`);
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id)); const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 12, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 72 || !same(queueCounts, expectedQueueCounts)) errors.push(`queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions); const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions); const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 0, REVISE: 12, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 12, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 }) || !same(languages, { FIT: 4, REVISE: 8, ESCALATE: 0 })) errors.push("disposition distribution changed");

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length, sharedCardsFresh: cardsFresh,
  verifiedSourceClosures: { genericPlaceholderReplacements: 24, progressionAndRemedialDiversity: 12, total: 36, exactOrAdequateMainFigureAlignments: 18 },
  reviewedRuntime: { conceptFigures, gradedSurfaces, authoredVariantBindings: variants.length, cmlSurfaces, cmlWaivers: 0 },
  specializedResiduals: { unsynchronizedMainFigurePlacements: specializedVisualResiduals, textOnlyRemedials, unnaturalGeneratorShapedLanguageLessons: [...languageRevise] },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages, releaseBlockers: [],
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, lessonRevisionRowsOpened: 12, immediateNetReduction: 24, staleSourceRowsClosedOnRefresh: 36, specializedFigureRowsRetainedOrOpened: 6, projectedRows: 18 },
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
