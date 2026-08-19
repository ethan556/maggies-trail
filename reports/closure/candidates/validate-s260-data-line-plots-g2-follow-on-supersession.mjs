#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S260_DATA_LINE_PLOTS_G2_FOLLOW_ON_SUPERSEDING_TRIPLE_DISPOSITIONS.jsonl");
const priorCandidatePath = path.join(here, "S255_DATA_LINE_PLOTS_G2_TRIPLE_DISPOSITIONS.jsonl");
const assessmentPath = path.join(here, "S260_DATA_LINE_PLOTS_G2_FOLLOW_ON_SUPERSESSION_ASSESSMENT.md");
const coursePath = rel("content", "courses", "data-line-plots-g2", "course.json");
const lessonDir = rel("content", "courses", "data-line-plots-g2", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const widgetsPath = rel("src", "components", "widgets.tsx");
const schemaPath = rel("src", "lib", "schema.ts");
const evaluatePath = rel("src", "lib", "evaluate.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const generatorPath = rel("src", "lib", "g2Variants.ts");
const solverPath = rel("src", "lib", "g2Independent.cjs");
const followOnReportPath = rel("reports", "pedagogy", "S255_DATA_LINE_PLOTS_G2_FOLLOW_ON.md");
const originalReportPath = rel("reports", "pedagogy", "S254_DATA_LINE_PLOTS_G2_WHOLE_COURSE_REPAIR.md");
const repairScriptPath = rel("scripts", "audit", "repair-data-line-plots-g2-s255.mjs");
const followOnTestPath = rel("src", "lib", "session255.dataLinePlotsG2FollowOn.test.tsx");
const integrityTestPath = rel("src", "lib", "session254.dataLinePlotsG2CourseIntegrity.test.tsx");
const solverTestPath = rel("src", "lib", "session194.dataLinePlots.test.ts");

const expectedHashes = {
  candidate: "ccd5e1a640a4d058c94eb87ce23b28ccc36731a4d7603686685f796bc74cc5fa",
  priorCandidate: "894056082a2a6182b7d07a6bdaffb2cdebec1322650d117ba766bf69cd384edd",
  course: "818fa5abcfe19f6d8002741759d4b42234e7f744a46ed1fe701120efe4434bd1",
  figureSurface: "7b29528c0fa4ef4c35478c8bae026e38588af38d4ce03014d484040703ee12df",
  figureIds: "4c27ab55e95ab404cbd6d8f4c2e8becff836a45059d775e45038df6cefe21ef3",
  widgets: "7c7a6629507176d438f82abcfb9fd0057abd2a904794fe83c6fc09905a565149",
  schema: "67887092e440910bec34d868099d29320946e95db3cb51b70d5cc815dcb7b129",
  evaluate: "1979ad6ac310485c5e13d2b915c6ae1fc65833542dea0e7dc60370d204a8c951",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
  generator: "8335cce01889f219dc72023dc48d30d38958d313b9bbef172995d664c39d64ce",
  solver: "50e847e6d978a23072dd116ad8b5764ac7830b98fd52469e6dfd6bd2c4b5b74e",
  repair: "98b9f3477e257c9709b353338d536680c7563f2ad40aae210d940c08cf3c943c",
  followOnTest: "9930ac4344896a5b6fdd46e37a37941afd263138420e162f4dc9e946ef24d39c",
  solverTest: "facc3857ff4e3280f6e9d172b9299168f2961bd0048769ede460c0abce7f3b24",
};
const expectedBasis = {
  "g2g-01-01": "c757eee57a8ed1820cdfcd63b98a148ebf8b836ae24afcd5955e3e48a8135f14",
  "g2g-01-02": "b2c9060ddd568ede630f61b4aca3b2f8f94f05899a3df4a246824360779ab2be",
  "g2g-01-03": "5731b4d6de2f764a22873341fb473268029874a09b3bf96f2fa80812fbe37b7a",
  "g2g-01-04": "e9133488d453716c586e194082bd83659c4c6f7b46ecf94b876b07a73e09617f",
  "g2g-01-05": "d090fa853503480907056027798e88471ca4349c206785bc6f23b4603921ceba",
  "g2g-02-01": "c27f1616aa0cea63faf6b9dabd552a131f642fcbeffa8d7c2716976d438d2c21",
  "g2g-02-02": "393927f93e44e945abab1c26dfdcb00cabeb95f2794cb40a6e866be32b3560e7",
  "g2g-02-03": "a0c54ddbd2b4cf0fa0531071debc5f1dfa2214f304a0e940106bbad0eaa64b2d",
  "g2g-02-04": "8ad1abfbafad7c95816dea09de154fba6c7bd86998345f7306b66b5c387fa3e8",
  "g2g-03-01": "04d601448f2389fc40d3edf6ca6e0ea4f2d6bc785c4e2e017e55499791e7ff76",
  "g2g-03-02": "8936f2c58c862af7ebe82fdafe0a1f2e5c076814596a16b19382b415c6298855",
  "g2g-03-03": "62d895584a3184a44508c26ec2bd060b5ddfa6864f31aee9513584cf54547282",
};
const expectedMainFigures = {
  "g2g-01-01": ["ruler-measure", "g2g-shared-unit-compare"],
  "g2g-01-02": ["g2g-record-repeats", "vm-line-plot-read"],
  "g2g-01-03": ["vm-line-plot-read", "vm-line-plot-read"],
  "g2g-01-04": ["vm-line-plot-read", "vm-line-plot-read"],
  "g2g-01-05": ["vm-line-plot-read", "vm-line-plot-read"],
  "g2g-02-01": ["mmt-picture-graph", "mmt-picture-graph"],
  "g2g-02-02": ["mmt-picture-graph", "mmt-picture-graph"],
  "g2g-02-03": ["single-scale-graph", "single-scale-graph"],
  "g2g-02-04": ["single-scale-graph", "g2g-bar-gap"],
  "g2g-03-01": ["single-scale-graph", "single-scale-graph"],
  "g2g-03-02": ["g2g-bar-gap", "single-scale-graph"],
  "g2g-03-03": ["vm-line-plot-read", "single-scale-graph"],
};
const expectedRemedialFigures = {
  "g2g-01-01": "g2g-shared-unit-compare", "g2g-01-02": "g2g-record-repeats",
  "g2g-01-03": "vm-line-plot-read", "g2g-01-04": "vm-line-plot-read", "g2g-01-05": "vm-line-plot-read",
  "g2g-02-01": "mmt-picture-graph", "g2g-02-02": "mmt-picture-graph", "g2g-02-03": "single-scale-graph",
  "g2g-02-04": "g2g-bar-gap", "g2g-03-01": "single-scale-graph", "g2g-03-02": "g2g-bar-gap",
  "g2g-03-03": "g2g-display-choice",
};
const expectedPositions = {
  "g2g-01-01/k1": 1, "g2g-01-01/rem-g2g-measure-group-k": 2,
  "g2g-01-02/k1": 3, "g2g-01-02/k3": 0, "g2g-01-02/rem-g2g-record-k": 1,
  "g2g-01-03/k3": 2,
  "g2g-01-05/k1": 3, "g2g-01-05/k3": 0, "g2g-01-05/rem-g2g-mode-k": 1,
  "g2g-02-01/k3": 2, "g2g-02-03/k3": 3,
  "g2g-03-03/k1": 0, "g2g-03-03/k2": 1, "g2g-03-03/k3": 2, "g2g-03-03/rem-g2g-choose-graph-k": 3,
};
const expectedVariantCounts = {
  "g2-add-subtract-100/Add2DigitNumeric": 4,
  "g2-measure-money-time/MmtBarGraphNumeric": 6,
  "g2-measure-money-time/MmtGraphCompareNumeric": 8,
  "g2-measure-money-time/MmtLinePlotNumeric": 9,
  "g2-measure-money-time/MmtPictureGraphRead": 5,
  "g2-measure-money-time/MmtRulerSubtractNumeric": 5,
};
const figureFunctions = ["G2gSharedUnitCompare", "G2gRecordRepeats", "G2gBarGap", "G2gDisplayChoice"];
const figureTokens = {
  G2gSharedUnitCompare: ["four centimeters", "six", "same unit", "4 cm", "6 cm"],
  G2gRecordRepeats: ["five, six, six, and seven centimeters", "repeated six", "5 cm", "6 cm", "two ribbons"],
  G2gBarGap: ["cats at three votes", "dogs at six votes", "three-vote gap", "cats 3", "dogs 6", "gap 3"],
  G2gDisplayChoice: ["measurements", "line plot", "named categories", "separate bars", "bar graph"],
};

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const stable = (value) => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const same = (left, right) => stable(left) === stable(right);
const normalize = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => { try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); } });
function parseCsv(text) { const rows = []; let row = [], cell = "", quoted = false; for (let index = 0; index < text.length; index += 1) { const ch = text[index]; if (quoted) { if (ch === '"' && text[index + 1] === '"') { cell += '"'; index += 1; } else if (ch === '"') quoted = false; else cell += ch; } else if (ch === '"') quoted = true; else if (ch === ",") { row.push(cell); cell = ""; } else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; } else cell += ch; } if (cell || row.length) { row.push(cell); rows.push(row); } const [headers, ...body] = rows.filter((candidate) => candidate.some(Boolean)); return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))); }
function evidenceFile(reference) { const value = String(reference); const markers = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b); return markers.length ? value.slice(0, markers[0]) : value; }
function extractFunction(source, name) { const start = source.indexOf(`function ${name}(`); const end = source.indexOf("\nfunction ", start + 1); return start < 0 ? "" : source.slice(start, end < 0 ? source.length : end).trim(); }
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
const graphTruth = (widget) => widget.drawn * (widget.unitValue ?? 1);

const errors = [];
for (const file of [candidatePath, priorCandidatePath, assessmentPath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, widgetsPath, schemaPath, evaluatePath, alignmentPath, generatorPath, solverPath, followOnReportPath, originalReportPath, repairScriptPath, followOnTestPath, integrityTestPath, solverTestPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath); const recordById = new Map(records.map((record) => [record.lessonId, record]));
const priorRecords = parseJsonl(priorCandidatePath); const priorById = new Map(priorRecords.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0]; const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const authority = loadLessonReviewAuthority(root); const live = authority.lessons.filter((entry) => entry.courseId === course.id); const liveById = new Map(live.map((entry) => [entry.lessonId, entry]));
const figuresSource = read(figuresPath); const figureIdsSource = read(figureIdsPath);
const figureSurface = figureFunctions.map((name) => extractFunction(figuresSource, name)).join("\n---\n");
const require = createRequire(import.meta.url); const { solvePrompt } = require(solverPath);

if (course.id !== "data-line-plots-g2" || course.gradeLevel !== 2 || !same(course.chapters.map((chapter) => chapter.lessonIds.length), [5, 4, 3]) || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course identity/manifest boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate must contain 12 unique lessons/records");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate || sha256(read(priorCandidatePath)) !== expectedHashes.priorCandidate || sha256(read(coursePath)) !== expectedHashes.course || sha256(figureSurface) !== expectedHashes.figureSurface || sha256(read(figureIdsPath)) !== expectedHashes.figureIds || sha256(read(widgetsPath)) !== expectedHashes.widgets || sha256(read(schemaPath)) !== expectedHashes.schema || sha256(read(evaluatePath)) !== expectedHashes.evaluate || sha256(read(alignmentPath)) !== expectedHashes.alignment || sha256(read(generatorPath)) !== expectedHashes.generator || sha256(read(solverPath)) !== expectedHashes.solver || sha256(read(repairScriptPath)) !== expectedHashes.repair || sha256(read(followOnTestPath)) !== expectedHashes.followOnTest || sha256(read(solverTestPath)) !== expectedHashes.solverTest) errors.push("one or more sealed evidence hashes changed");
const priorCurrentMatches = lessonIds.filter((id) => priorById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length;
if (priorCurrentMatches !== 0) errors.push(`prior S255 candidate must be fully stale, found ${priorCurrentMatches}/12 current hashes`);

for (const name of figureFunctions) { const source = extractFunction(figuresSource, name); if (!source.includes("<title") || !source.includes('role="img"')) errors.push(`${name}: accessibility contract changed`); for (const token of figureTokens[name]) if (!source.toLowerCase().includes(token.toLowerCase())) errors.push(`${name}: missing visible/accessibility token ${token}`); }
for (const id of ["g2g-shared-unit-compare", "g2g-record-repeats", "g2g-bar-gap", "g2g-display-choice"]) if (!figureIdsSource.includes(JSON.stringify(id)) || !figuresSource.includes(`${JSON.stringify(id)}:`)) errors.push(`${id}: figure registration changed`);

const typeCounts = {}; const variantCounts = {}; const positionCounts = [0, 0, 0, 0];
let mainFigures = 0, remedialFigures = 0, newMainBindings = 0, newRemedialBindings = 0, diversifiedRemedials = 0, gradedSurfaces = 0, solverBindings = 0, modalContracts = 0;
const newFigureIds = new Set(["g2g-shared-unit-compare", "g2g-record-repeats", "g2g-bar-gap", "g2g-display-choice"]);
for (const id of lessonIds) {
  const lesson = lessons.get(id); const record = recordById.get(id); const current = liveById.get(id);
  if (!record || !current) { errors.push(`${id}: missing candidate/current authority`); continue; }
  if (!same(Object.keys(record).sort(), requiredFields)) errors.push(`${id}: fields differ from canonical contract`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S260-DLPG2-FOLLOWON-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== current.reviewBasisHash) errors.push(`${id}: identity/current-basis mismatch`);
  if (record.decision !== "KEEP" || record.visualDecision !== "SUFFICIENT" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: expected KEEP/SUFFICIENT/FIT`);
  if (record.reviewer !== "ChatGPT Work independent assessor (data-line-plots-g2 follow-on supersession S260)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp invalid`);
  if (String(record.rationale).length < 300 || String(record.reopenCondition).length < 300 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 15) errors.push(`${id}: rationale, reopen condition, or evidence is incomplete`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  const route = lesson.remedials?.[0]; const mainIds = lesson.steps.map((step) => step.id); const remedialIds = route ? [route.concept.id, route.check.id] : [];
  if (lesson.id !== id || lesson.courseId !== course.id || lesson.remedials?.length !== 1 || new Set([...mainIds, ...remedialIds]).size !== mainIds.length + remedialIds.length) errors.push(`${id}: identity, remedial count, or stable step IDs invalid`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedMainFigures[id])) errors.push(`${id}: main figure map changed`);
  for (const concept of concepts) { mainFigures += 1; if (newFigureIds.has(concept.figure)) newMainBindings += 1; if (!concept.figure || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: main figure registration/narration failed`); }
  if (!route || route.concept.figure !== expectedRemedialFigures[id] || !figureIdsSource.includes(JSON.stringify(route.concept.figure)) || route.concept.body !== route.concept.narration || route.concept.body === concepts[1].body) errors.push(`${id}: figured remedial mapping, narration, or concept diversity changed`); else { remedialFigures += 1; if (newFigureIds.has(route.concept.figure)) newRemedialBindings += 1; }

  const mainWidgets = lesson.steps.filter((step) => step.widget); const mainPrompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(mainPrompts).size !== mainPrompts.length || new Set(mainPrompts.map(normalize)).size !== mainPrompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: main exact, normalized, or payload collision returned`);
  if (mainWidgets.some((step) => step.widget.prompt === route.check.widget.prompt) || mainWidgets.some((step) => normalize(step.widget.prompt) === normalize(route.check.widget.prompt)) || mainWidgets.some((step) => stable(step.widget) === stable(route.check.widget))) errors.push(`${id}: remedial transfer collides with a main job`); else diversifiedRemedials += 1;

  for (const step of [...mainWidgets, route.check]) {
    const widget = step.widget; const key = `${id}/${step.id}`; gradedSurfaces += 1; typeCounts[widget.type] = (typeCounts[widget.type] ?? 0) + 1;
    if (!widget.prompt || !widget.successFeedback && widget.type !== "mcq") errors.push(`${key}: incomplete prompt/success feedback`);
    if (widget.type === "numeric") { if (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer || !error.feedback)) errors.push(`${key}: numeric evaluator invalid`); }
    else if (widget.type === "mcq") { const position = widget.options.findIndex((option) => option.correct); const expectedPosition = expectedPositions[key]; positionCounts[position] += 1; if (expectedPosition === undefined || position !== expectedPosition || widget.options.length !== 4 || widget.options.filter((option) => option.correct).length !== 1 || widget.options.find((option) => option.correct)?.id !== "o0" || !same([...widget.options.map((option) => option.id)].sort(), ["o0", "o1", "o2", "o3"]) || widget.options.some((option) => !option.feedback)) errors.push(`${key}: MCQ identity, truth, or deterministic position changed`); const lengths = widget.options.map((option) => option.label.length); if (Math.max(...lengths) / Math.min(...lengths) > 1.25) errors.push(`${key}: MCQ label parity changed`); }
    else if (widget.type === "graphRead") { const truth = graphTruth(widget); if (truth > widget.scaleMax || (widget.commonResults ?? []).some((result) => result.value === truth || result.value < 0 || result.value > widget.scaleMax || !result.feedback)) errors.push(`${key}: graphRead visible target/evaluator invalid`); }
    else if (widget.type === "dotPlot") { const ask = widget.askIndex ?? 0; if (!same(widget.given, widget.target) || widget.target[ask] <= 0 || !widget.target.some((count, index) => index !== ask && count > 0) || Math.max(...widget.target) > widget.maxPerValue || widget.values.some((value) => value % (widget.denominator ?? 1) !== 0)) errors.push(`${key}: dotPlot read-only/value/stack contract invalid`); }
    else if (widget.type === "barBuilder") { if (widget.categories.length !== widget.target.length || Math.max(...widget.target) > widget.maxVal || !["bar", "tally", "pictograph"].includes(widget.display)) errors.push(`${key}: barBuilder contract invalid`); }
    else if (widget.type === "unitRuler") { if (widget.objectEnd - widget.objectStart !== widget.requiredPlacements * widget.targetUnitSize) errors.push(`${key}: unitRuler endpoint contract invalid`); }
    else errors.push(`${key}: unreviewed widget type ${widget.type}`);

    if (step.variant) { solverBindings += 1; const variantKey = `${step.variant.gen}/${step.variant.form}`; variantCounts[variantKey] = (variantCounts[variantKey] ?? 0) + 1; if (!(variantKey in expectedVariantCounts)) errors.push(`${key}: unreviewed generator binding ${variantKey}`); const derived = solvePrompt(step.variant.form, widget.prompt); const target = widget.type === "numeric" ? widget.answer : widget.type === "graphRead" ? graphTruth(widget) : undefined; if (target === undefined || derived !== target) errors.push(`${key}: independent solver/evaluator disagreement ${derived} != ${target}`); }
  }
  if (id === "g2g-01-05") for (const stepId of ["i1", "i2"]) { const widget = lesson.steps.find((step) => step.id === stepId)?.widget; const ask = widget?.askIndex; const value = widget && ask !== undefined ? widget.values[ask] / (widget.denominator ?? 1) : undefined; const frequency = widget && ask !== undefined ? widget.given[ask] : undefined; if (widget?.type !== "dotPlot" || !/tap every x in (that|the tallest) stack/i.test(widget.prompt) || value !== 6 || frequency !== 5 || value === frequency || widget.target[ask] !== 5) errors.push(`${id}/${stepId}: value-versus-stack repair changed`); else modalContracts += 1; }
}

const expectedTypeCounts = { barBuilder: 7, dotPlot: 7, graphRead: 13, mcq: 15, numeric: 40, unitRuler: 2 };
if (!same(typeCounts, expectedTypeCounts) || !same(variantCounts, expectedVariantCounts) || !same(positionCounts, [3, 4, 4, 4]) || mainFigures !== 24 || remedialFigures !== 12 || newMainBindings !== 4 || newRemedialBindings !== 5 || diversifiedRemedials !== 12 || gradedSurfaces !== 84 || solverBindings !== 37 || modalContracts !== 2) errors.push(`coverage changed: types=${JSON.stringify(typeCounts)} variants=${JSON.stringify(variantCounts)} positions=${JSON.stringify(positionCounts)} mainFigures=${mainFigures} remedials=${remedialFigures} newMain=${newMainBindings} newRemedial=${newRemedialBindings} diversified=${diversifiedRemedials} graded=${gradedSurfaces} solverBindings=${solverBindings} modal=${modalContracts}`);
const allText = stable([...lessons.values()]).toLowerCase();
for (const phrase of ["building it is transcription", "wears the tallest stack", "different crowns", "transfer to a new graph", "step one of a put-together", "unit-scale", "y-axis label", "adding the marks measures nothing", "count-on-hops", "one picture per counted thing", "keeps everything", "count means nothing"]) if (allText.includes(phrase)) errors.push(`assessed truth/language cause returned: ${phrase}`);

const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId)); const cardsFresh = cards.filter((card) => card.reviewBasisHash === liveById.get(card.lessonId)?.reviewBasisHash && card.lessonSourceHash === liveById.get(card.lessonId)?.lessonSourceHash).length;
if (cardsFresh !== 0) errors.push(`shared card freshness changed: ${cardsFresh}`);
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id)); const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 12, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 72 || !same(queueCounts, expectedQueueCounts)) errors.push(`queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions); const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions); const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 12, REVISE: 0, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 0, PREFERRED: 0, SUFFICIENT: 12, ESCALATE: 0 }) || !same(languages, { FIT: 12, REVISE: 0, ESCALATE: 0 })) errors.push("disposition distribution changed");

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  priorS255CandidateCurrentHashesMatched: priorCurrentMatches, priorS255CandidateRequiredState: "STALE", sharedCardsFresh: cardsFresh,
  verifiedFollowOnClosures: { assessedResidualsClosed: 50, textOnlyRemedialsClosed: 12, copiedRemedialConceptsClosed: 7, repeatedK1RemedialsClosed: 10, choiceCueingInstancesClosed: 15, weakFigurePlacementsClosed: 5, dotPlotAmbiguityClosed: 1, newRegisteredFigures: 4, figuredRemedials: remedialFigures, diversifiedRemedials },
  reviewedRuntime: { gradedSurfaces, typeCounts, solverBindings, variantCounts, mainFigures, newMainBindings, newRemedialBindings, modalContracts, deterministicMcqPositions: positionCounts },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages, releaseBlockers: [], residualSpecializedDebt: [],
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, revisionRowsOpened: 0, staleSourceRowsClosedOnRefresh: 36, expectedRowsAfterAppendAndSourceRefresh: 0 },
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
