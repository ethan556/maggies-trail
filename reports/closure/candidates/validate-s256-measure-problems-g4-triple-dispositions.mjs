#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S256_MEASURE_PROBLEMS_G4_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "measure-problems-g4", "course.json");
const lessonDir = rel("content", "courses", "measure-problems-g4", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const reportPath = rel("reports", "pedagogy", "S256_MEASURE_PROBLEMS_G4_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session256.measureProblemsG4CourseIntegrity.test.tsx");
const legacyTestPath = rel("src", "lib", "session196.measureProblemsG4.test.ts");
const repairPath = rel("scripts", "audit", "repair-measure-problems-g4-s256.mjs");

const expectedHashes = {
  candidate: "296319639c05001b723c9ae773dd3c27915268555ab6414e3a8f3c3d6477bed8",
  course: "a789f5cb5c7d3c67fa4dcb9a796e38e776f25e6d79551dbc943929adf31ac9d1",
  figureSurface: "d07f96d44211ab730964d8298de9b823fcf9a24ec66aab86877eed9e66525cce",
  figureIds: "d2145dc68cd70228875f88571b5d631bac2684a352c812e1fe2ae03cc0d5eb0e",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
};
const expectedBasis = {
  "g4v-01-01": "7efdb47da1f65161b337bd17c39591ea1c67c3f4dc1b1f9b1f2af1046db98d5c",
  "g4v-01-02": "4a63c5c92183f5202f40ad24c7b0bc6d982271d88261830a358dd289e4b3f291",
  "g4v-01-03": "1e2c28d053787d9d49e6e574b6039cf330be3b2f9b3fa1cd2d235693d7533830",
  "g4v-01-04": "b5ff369c881c5807a2348cd61e6f5bc8bee5833feebd6b4044ca1a48716d8818",
  "g4v-02-01": "11c22045c8d40c3d38b9329e1253be0b2841f6dc5cd444b3c9249a554a721569",
  "g4v-02-02": "17b6cab104269541e957e8ad679d465474148317a967238b4d5755919394e00b",
  "g4v-02-03": "b702d1300230fd4b6839cde441658ccf1e1873701d1b73d5a54dac670bcecca3",
  "g4v-02-04": "1aa81033e5d4ae4802d3f66cc4bbb48d0de8cccbf1f22ae97a0f25dd7f44856a",
  "g4v-03-01": "b3947aafd589c866e330cf2083bfcf717df3a05b29acb0ae1901bec767bc9fef",
  "g4v-03-02": "969f112452532ce587cea8bbb8ca54e6f8677915d4ee55f39b51a7acc6a762fd",
  "g4v-03-03": "5469e249da3695791db7b765fb4e9275b526a265f0a427686ad39013a8c8b066",
  "g4v-03-04": "a767e304ac88ad4a51009f0785487cc4a5e6f8ac7921e74a0b030a26d9330910",
};
const expectedFigures = {
  "g4v-01-01": ["mc-length-ladder", "rr-conversion"], "g4v-01-02": ["ratio-table", "mc-length-ladder"],
  "g4v-01-03": ["mc-length-ladder", "rr-conversion"], "g4v-01-04": ["md3-mass-scale", "mc-mass-volume"],
  "g4v-02-01": ["md3-liter", "mc-mass-volume"], "g4v-02-02": ["clock-face", "rr-chain"],
  "g4v-02-03": ["mb-multistep", "two-step-bar"], "g4v-02-04": ["md3-elapsed", "rr-chain"],
  "g4v-03-01": ["mmt-coin-total", "mb-multistep"], "g4v-03-02": ["line-plot", "vm-total-length"],
  "g4v-03-03": ["mb-multistep", "rr-chain"], "g4v-03-04": ["mb-multistep", "two-step-bar"],
};
const expectedRemedialRepeats = {
  "g4v-01-01": ["k1", "k3"], "g4v-01-02": ["k1"], "g4v-01-03": ["k1"], "g4v-01-04": ["k1"],
  "g4v-02-01": ["k1"], "g4v-02-02": ["k1"], "g4v-02-03": ["k1"], "g4v-02-04": ["k1"],
  "g4v-03-01": ["k1"], "g4v-03-02": ["k1"], "g4v-03-03": ["k1"], "g4v-03-04": ["k1", "k3"],
};
const specializedVisualResiduals = ["g4v-01-02/c1", "g4v-02-01/c1", "g4v-02-02/c1", "g4v-02-03/c2", "g4v-02-04/c1", "g4v-03-01/c1", "g4v-03-02/c1", "g4v-03-04/c1", "g4v-03-04/c2"];
const figureFunctions = ["McLengthLadder", "RrConversion", "RatioTable", "Md3MassScale", "McMassVolume", "Md3Liter", "ClockFace", "RrChain", "MbMultistep", "TwoStepBar", "Md3Elapsed", "MmtCoinTotal", "LinePlot", "VmTotalLength"];

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
  return { type: widget.type };
}

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, reportPath, focusedTestPath, legacyTestPath, repairPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath); const recordById = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0]; const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const authority = loadLessonReviewAuthority(root); const live = authority.lessons.filter((entry) => entry.courseId === course.id); const liveById = new Map(live.map((entry) => [entry.lessonId, entry]));
const figureIdsSource = read(figureIdsPath); const figureSurface = extractFunctions(read(figuresPath), figureFunctions);

if (course.id !== "measure-problems-g4" || course.gradeLevel !== 4 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course identity/manifest boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate must contain 12 unique lesson and record IDs");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate || sha256(read(coursePath)) !== expectedHashes.course || sha256(figureSurface) !== expectedHashes.figureSurface || sha256(read(figureIdsPath)) !== expectedHashes.figureIds || sha256(read(alignmentPath)) !== expectedHashes.alignment) errors.push("one or more sealed evidence hashes changed");
for (const source of figureFunctions.map((name) => extractFunctions(read(figuresPath), [name]))) if (!source.includes("<title") || !source.includes('role="img"')) errors.push("reviewed figure accessibility surface changed");

let conceptFigures = 0, textOnlyRemedials = 0, exactRemedialPromptRepeats = 0, gradedSurfaces = 0;
for (const id of lessonIds) {
  const lesson = lessons.get(id); const record = recordById.get(id); const current = liveById.get(id);
  if (!record || !current) { errors.push(`${id}: missing candidate or live authority`); continue; }
  if (!same(Object.keys(record).sort(), requiredFields)) errors.push(`${id}: fields differ from canonical contract`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S256-G4V-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== current.reviewBasisHash) errors.push(`${id}: identity/current-basis mismatch`);
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: expected REVISE/REQUIRED/FIT`);
  if (record.reviewer !== "ChatGPT Work independent assessor (measure-problems-g4 S256)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp invalid`);
  if (String(record.rationale).length < 250 || String(record.reopenCondition).length < 250 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 10) errors.push(`${id}: rationale, reopen condition, or evidence is incomplete`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: concept figure map changed`);
  for (const concept of concepts) { conceptFigures += 1; if (!concept.figure || concept.figure === "count-on-hops" || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: figure registration or narration parity failed`); }
  const mainWidgets = lesson.steps.filter((step) => step.widget); const prompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: main progression collision returned`);
  if (!lesson.remedials || lesson.remedials.length !== 1) errors.push(`${id}: expected one remedial route`);
  for (const route of lesson.remedials ?? []) {
    if (route.concept.figure) errors.push(`${id}: reviewed text-only remedial premise changed`); else textOnlyRemedials += 1;
    if (route.concept.body !== route.concept.narration) errors.push(`${id}: remedial narration mismatch`);
    const repeatedPrompt = mainWidgets.filter((step) => step.widget.prompt === route.check.widget.prompt).map((step) => step.id);
    if (!same(repeatedPrompt, ["k1"])) errors.push(`${id}: remedial must retain the reviewed exact k1 repeat boundary`); else exactRemedialPromptRepeats += 1;
    const repeatedSignatures = mainWidgets.filter((step) => same(evaluatorSignature(step.widget), evaluatorSignature(route.check.widget))).map((step) => step.id);
    if (!same(repeatedSignatures, expectedRemedialRepeats[id])) errors.push(`${id}: remedial evaluator-repeat boundary changed: ${JSON.stringify(repeatedSignatures)}`);
  }
  for (const step of [...mainWidgets, ...(lesson.remedials ?? []).map((route) => route.check)]) {
    const widget = step.widget; gradedSurfaces += 1;
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
    if (widget.type === "mcq" && (widget.options.length !== 4 || widget.options.filter((option) => option.correct).length !== 1 || !widget.options[0].correct || new Set(widget.options.map((option) => option.id)).size !== widget.options.length || widget.options.some((option) => !option.feedback))) errors.push(`${id}/${step.id}: MCQ evaluator invalid`);
    if (widget.type === "numberLineHop") { const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops; if (!(landing >= widget.min && landing <= widget.max) || (widget.commonLandings ?? []).some((trap) => trap.value === landing)) errors.push(`${id}/${step.id}: number-line-hop evaluator invalid`); }
    if (widget.type === "numberLinePlace" && (!(widget.target >= widget.min && widget.target <= widget.max) || (widget.commonPlacements ?? []).some((trap) => trap.value === widget.target))) errors.push(`${id}/${step.id}: number-line-place evaluator invalid`);
    if (widget.type === "estimateSlider" && (!(widget.target > widget.min && widget.target < widget.max) || !Array.isArray(widget.choices) || widget.choices.length !== 3 || widget.choices.filter((choice) => choice.correct).length !== 1)) errors.push(`${id}/${step.id}: estimate evaluator invalid`);
    if (widget.type === "barBuilder" && (!Array.isArray(widget.target) || widget.target.length !== widget.categories.length || Math.max(...widget.target) > widget.maxVal)) errors.push(`${id}/${step.id}: bar-builder evaluator invalid`);
  }
}
if (conceptFigures !== 24 || textOnlyRemedials !== 12 || exactRemedialPromptRepeats !== 12 || gradedSurfaces !== 84) errors.push(`coverage changed: ${conceptFigures}/${textOnlyRemedials}/${exactRemedialPromptRepeats}/${gradedSurfaces}`);

const corpusText = JSON.stringify([...lessons.values()]);
for (const pattern of [/count-on-hops/i, /2\/4 of the way/i, /target sits at the halfway/i, /in tens of dollars/i, /every measurement family there is/i, /only new information in a conversion problem/i]) if (pattern.test(corpusText)) errors.push(`audited false claim returned: ${pattern}`);
if (/5 kilograms/i.test(JSON.stringify(lessons.get("g4v-02-02")))) errors.push("irrelevant mass context returned to the time lesson");
if (/6 equal parts of 400 m/i.test(JSON.stringify(lessons.get("g4v-03-01")))) errors.push("irrelevant distance diagram returned to the money lesson");
const fractionWidgets = lessons.get("g4v-03-02").steps.filter((step) => ["i1", "i2"].includes(step.id)).map((step) => step.widget);
if (!same(fractionWidgets.map((widget) => [widget.type, widget.target, widget.step, widget.fractionDen]), [["numberLinePlace", 2, 0.25, undefined], ["numberLinePlace", 3, 0.25, undefined]])) errors.push("quarter-unit number-line repair changed");

const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId));
const cardsFresh = cards.filter((card) => card.reviewBasisHash === liveById.get(card.lessonId)?.reviewBasisHash && card.lessonSourceHash === liveById.get(card.lessonId)?.lessonSourceHash).length;
if (cardsFresh !== 0) errors.push(`shared card freshness boundary changed: ${cardsFresh} current`);
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 12, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 72 || !same(queueCounts, expectedQueueCounts)) errors.push(`queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions); const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions); const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 0, REVISE: 12, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 12, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 }) || !same(languages, { FIT: 12, REVISE: 0, ESCALATE: 0 })) errors.push("disposition distribution changed");

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  sharedCardsFresh: cardsFresh,
  verifiedSourceClosures: { genericPlaceholderReplacements: 24, mainProgressionRows: 12, total: 36, exactOrAdequateFigureAlignments: 15 },
  specializedResiduals: { unsynchronizedMainFigurePlacements: specializedVisualResiduals, textOnlyRemedials, exactRemedialPromptRepeats },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages,
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, lessonRevisionRowsOpened: 12, immediateNetReduction: 24, staleSourceRowsClosedOnRefresh: 36, specializedFigureRowsRetainedOrOpened: 9, projectedRows: 21 },
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
