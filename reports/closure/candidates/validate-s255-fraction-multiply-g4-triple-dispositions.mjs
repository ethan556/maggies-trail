#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S255_FRACTION_MULTIPLY_G4_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "fraction-multiply-g4", "course.json");
const lessonDir = rel("content", "courses", "fraction-multiply-g4", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const reportPath = rel("reports", "pedagogy", "S255_FRACTION_MULTIPLY_G4_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session255.fractionMultiplyG4CourseIntegrity.test.tsx");
const legacyTestPath = rel("src", "lib", "session196.fractionMultiplyG4.test.ts");
const repairPath = rel("scripts", "audit", "repair-fraction-multiply-g4-s255.mjs");

const expectedHashes = {
  candidate: "ecab4b04efaab677745d02c4cc8aa58cfb061d229059a9b8a95c70364349b380",
  course: "664d731bdbebd4366da43aa8cf84603f83c0813691bbc6437abce77d86237f56",
  figureSurface: "c1b9386ea07a05ae2fefa46625809af455accedb102aa623b266220d0b284204",
  figureIds: "d2145dc68cd70228875f88571b5d631bac2684a352c812e1fe2ae03cc0d5eb0e",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
  evaluatorSeal: "f7fb85499b132101a961e49111a5ad4f89362aa9ffaf5eb86d363153aaa56ac7",
};
const expectedBasis = {
  "g4x-01-01": "2d709c8ff2c3fc983ed4e5699acfba4d9b9e78641a82f079659590e42de4fbb4",
  "g4x-01-02": "93a2464b755900fdc56cea499646e086e712cbd06fad8ffd314bb4eb5db47ff9",
  "g4x-01-03": "5a466e7ed1bb5a8d078a36ac1ca18c61719e002d723e72c46277332f9c7420b6",
  "g4x-01-04": "5d451a0662ed27d67ad7d95522351352aad753c363e488fb61edf4a5f725acf0",
  "g4x-02-01": "fdd299154bfef78272d509544362c406e6de9f6a07e8a8814aa1429766e6984e",
  "g4x-02-02": "e0a54426b5d5e1e507d7f321a80457e8a7cd26061b62abe2c3ad4514fb751e42",
  "g4x-02-03": "98e6acc8d2d0c72f63eefbd52bbe84fa5bf6cf307c9722e295ab2dcfa06d110d",
  "g4x-02-04": "f917e9ff01da0511d8f84cfbbece96ffeaef01f30d1efdee5d940ef87929e391",
  "g4x-03-01": "12b4cc1bc07d88c0e3db2a5660289e0dc6ab7ef5d058338cdd7d36d2192a93b2",
  "g4x-03-02": "a822898e3845c386feac62e09d1fd14c5abf745b0aba56a478e3ef9bb3686674",
  "g4x-03-03": "25205a414faa850d0c0ce14a6ba9fb3bbb4e654cfc352b39ee2ffd7575884a71",
  "g4x-03-04": "e52bdd7fb19b3d92a56792dcba70beabe87722e8f1360cca552b6d06c1753e85",
};
const expectedFigures = {
  "g4x-01-01": ["fa-repeated-add", "fa-add-like"], "g4x-01-02": ["fa-repeated-add", "fm-groups"],
  "g4x-01-03": ["frac-unit-fourth", "fa-repeated-add"], "g4x-01-04": ["fm-groups", "fa-repeated-add"],
  "g4x-02-01": ["number-line-jumps", "frac-numline-pastone"], "g4x-02-02": ["fm-groups", "fa-repeated-add"],
  "g4x-02-03": ["frac-numline-pastone", "fa-improper-mixed"], "g4x-02-04": ["fa-improper-mixed", "fa-mixed-improper"],
  "g4x-03-01": ["fm-groups", "fa-repeated-add"], "g4x-03-02": ["fm-groups", "fa-improper-mixed"],
  "g4x-03-03": ["number-line-jumps", "fm-groups"], "g4x-03-04": ["fa-benchmark-half", "fa-repeated-add"],
};
const expectedRemedialRepeats = {
  "g4x-01-01": ["k1"], "g4x-01-02": ["k1", "k3"], "g4x-01-03": ["k1"], "g4x-01-04": ["k1", "k3"],
  "g4x-02-01": ["k1", "k3"], "g4x-02-02": ["k1", "k3"], "g4x-02-03": ["k1", "k3"], "g4x-02-04": ["k1", "k3"],
  "g4x-03-01": ["k1"], "g4x-03-02": ["k1"], "g4x-03-03": ["k1", "k3"], "g4x-03-04": ["k1", "k3"],
};
const specializedVisualResiduals = [
  "g4x-01-03/c1", "g4x-02-01/c2", "g4x-02-02/c1", "g4x-02-02/c2", "g4x-02-03/c2", "g4x-02-04/c1",
  "g4x-02-04/c2", "g4x-03-02/c1", "g4x-03-03/c1", "g4x-03-04/c1", "g4x-03-04/c2",
];
const expectedVariantContractResiduals = [
  "g4x-01-01/ch1", "g4x-01-02/k2", "g4x-01-02/ch1", "g4x-01-03/k2", "g4x-01-03/ch1", "g4x-01-04/k3",
  "g4x-02-01/k2", "g4x-02-01/ch1", "g4x-02-02/k2", "g4x-02-03/k2", "g4x-02-03/ch1", "g4x-03-01/k3",
  "g4x-03-03/k2", "g4x-03-04/k2",
];
const figureFunctions = ["FmGroups", "FaBenchmarkHalf", "FaAddLike", "FaImproperMixed", "FaMixedImproper", "FaRepeatedAdd", "FracUnitFourth", "FracNumlinePastOne", "NumberLineJumps"];

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const stable = (value) => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const same = (left, right) => stable(left) === stable(right);
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => { try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); } });
const normalize = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index];
    if (quoted) { if (ch === '"' && text[index + 1] === '"') { cell += '"'; index += 1; } else if (ch === '"') quoted = false; else cell += ch; }
    else if (ch === '"') quoted = true; else if (ch === ",") { row.push(cell); cell = ""; } else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...body] = rows.filter((candidate) => candidate.some(Boolean));
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
function evidenceFile(reference) {
  const value = String(reference); const markers = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b);
  return markers.length ? value.slice(0, markers[0]) : value;
}
function extractFunctions(source, names) {
  return names.map((name) => { const start = source.indexOf(`function ${name}(`); const end = source.indexOf("\nfunction ", start + 1); return start < 0 ? "" : source.slice(start, end < 0 ? source.length : end).trim(); }).join("\n---\n");
}
function evaluatorSignature(widget) {
  if (widget.type === "numeric") return { type: widget.type, answer: widget.answer };
  if (widget.type === "mcq") return { type: widget.type, correct: widget.options.filter((option) => option.correct).map((option) => option.id) };
  if (widget.type === "fractionBar") return { type: widget.type, targetNum: widget.targetNum, targetDen: widget.targetDen };
  if (widget.type === "numberLinePlace" || widget.type === "estimateSlider") return { type: widget.type, target: widget.target };
  return { type: widget.type };
}

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, reportPath, focusedTestPath, legacyTestPath, repairPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0];
const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const authority = loadLessonReviewAuthority(root);
const live = authority.lessons.filter((entry) => entry.courseId === course.id);
const liveById = new Map(live.map((entry) => [entry.lessonId, entry]));
const figureIdsSource = read(figureIdsPath);
const figureSurface = extractFunctions(read(figuresPath), figureFunctions);

if (course.id !== "fraction-multiply-g4" || course.gradeLevel !== 4 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course identity/manifest boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate must contain 12 unique lesson and record IDs");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate || sha256(read(coursePath)) !== expectedHashes.course || sha256(figureSurface) !== expectedHashes.figureSurface || sha256(read(figureIdsPath)) !== expectedHashes.figureIds || sha256(read(alignmentPath)) !== expectedHashes.alignment) errors.push("one or more sealed evidence hashes changed");
for (const source of figureFunctions.map((name) => extractFunctions(read(figuresPath), [name]))) if (!source.includes("<title") || !source.includes('role="img"')) errors.push("reviewed figure accessibility surface changed");

let conceptFigures = 0, textOnlyRemedials = 0, remedialPromptRepeats = 0, gradedSurfaces = 0;
const evaluatorEntries = [];
const variantContractResiduals = [];
for (const id of lessonIds) {
  const lesson = lessons.get(id); const record = recordById.get(id); const current = liveById.get(id);
  if (!record || !current) { errors.push(`${id}: missing candidate or live authority`); continue; }
  if (!same(Object.keys(record).sort(), requiredFields)) errors.push(`${id}: fields differ from canonical contract`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S255-G4X-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== current.reviewBasisHash) errors.push(`${id}: identity/current-basis mismatch`);
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: expected REVISE/REQUIRED/FIT`);
  if (record.reviewer !== "ChatGPT Work independent assessor (fraction-multiply-g4 S255)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp invalid`);
  if (String(record.rationale).length < 280 || String(record.reopenCondition).length < 280 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 10) errors.push(`${id}: rationale, reopen condition, or evidence is incomplete`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: concept figure map changed`);
  for (const concept of concepts) { conceptFigures += 1; if (!concept.figure || concept.figure === "count-on-hops" || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: figure registration or narration parity failed`); }
  const mainWidgets = lesson.steps.filter((step) => step.widget);
  const prompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: main progression collision returned`);
  if (!lesson.remedials || lesson.remedials.length !== 1) errors.push(`${id}: expected one remedial route`);
  for (const route of lesson.remedials ?? []) {
    if (route.concept.figure) errors.push(`${id}: reviewed text-only remedial premise changed`); else textOnlyRemedials += 1;
    if (route.concept.body !== route.concept.narration) errors.push(`${id}: remedial narration mismatch`);
    const repeatedPrompt = mainWidgets.filter((step) => step.widget.prompt === route.check.widget.prompt).map((step) => step.id);
    if (!same(repeatedPrompt, ["k1"])) errors.push(`${id}: remedial must retain the reviewed exact k1 repeat boundary`); else remedialPromptRepeats += 1;
    const repeatedSignatures = mainWidgets.filter((step) => same(evaluatorSignature(step.widget), evaluatorSignature(route.check.widget))).map((step) => step.id);
    if (!same(repeatedSignatures, expectedRemedialRepeats[id])) errors.push(`${id}: remedial evaluator-repeat boundary changed`);
  }
  for (const step of [...mainWidgets, ...(lesson.remedials ?? []).map((route) => route.check)]) {
    const widget = step.widget; gradedSurfaces += 1; evaluatorEntries.push([id, step.id, evaluatorSignature(widget)]);
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
    if (widget.type === "mcq" && (widget.options.filter((option) => option.correct).length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length || widget.options.some((option) => !option.feedback))) errors.push(`${id}/${step.id}: MCQ evaluator invalid`);
    if (widget.type === "fractionBar" && (!(widget.targetNum >= widget.numMin && widget.targetNum <= widget.numMax && widget.targetDen >= widget.denMin && widget.targetDen <= widget.denMax) || widget.commonFractions.some((trap) => trap.num * widget.targetDen === trap.den * widget.targetNum))) errors.push(`${id}/${step.id}: fraction-bar target/trap invalid`);
    if (widget.type === "numberLinePlace" && (!(widget.target >= widget.min && widget.target <= widget.max) || (widget.commonPlacements ?? []).some((trap) => trap.value === widget.target))) errors.push(`${id}/${step.id}: number-line target/trap invalid`);
    if (widget.type === "estimateSlider" && (!(widget.target >= widget.min && widget.target <= widget.max) || (Array.isArray(widget.choices) && widget.choices.filter((choice) => choice.correct).length !== 1))) errors.push(`${id}/${step.id}: estimate target/choice invalid`);
    if (step.variant?.form === "faWholeTimesFractionNumeric" && !/^Compute (\d+) × (\d+)\/(\d+)/.test(widget.prompt)) variantContractResiduals.push(`${id}/${step.id}`);
  }
}
if (conceptFigures !== 24 || textOnlyRemedials !== 12 || remedialPromptRepeats !== 12 || gradedSurfaces !== 84 || sha256(stable(evaluatorEntries)) !== expectedHashes.evaluatorSeal) errors.push(`coverage/evaluator seal changed: ${conceptFigures}/${textOnlyRemedials}/${remedialPromptRepeats}/${gradedSurfaces}`);
if (!same(variantContractResiduals, expectedVariantContractResiduals)) errors.push(`literal variant-contract residual boundary changed: ${JSON.stringify(variantContractResiduals)}`);

const corpusText = JSON.stringify([...lessons.values()]);
for (const pattern of [/target half/i, /shorter than half/i, /longer than half/i, /denominator never changes/i, /just under seven/i, /little less than 7/i, /\b1 pieces\b/i, /\b1 fourths\b/i]) if (pattern.test(corpusText)) errors.push(`audited false claim returned: ${pattern}`);
for (const required of ["requested unsimplified form", "Group the pieces into denominator-sized wholes", "Divide the numerator and denominator by the stated common factor", "5 5/6, just under six", "whole-number n and nonzero denominator b"]) if (!corpusText.includes(required)) errors.push(`required truth repair missing: ${required}`);
const estimate = lessons.get("g4x-03-04");
if (!estimate.steps.find((step) => step.id === "c1").body.includes("7 × 5/6 = 5 5/6") || estimate.steps.find((step) => step.id === "i1").widget.target !== 6 || !estimate.steps.find((step) => step.id === "k1").widget.options.find((option) => option.correct)?.label.includes("About 6")) errors.push("g4x-03-04 estimate surfaces disagree");

const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId));
const cardsFresh = cards.filter((card) => card.reviewBasisHash === liveById.get(card.lessonId)?.reviewBasisHash && card.lessonSourceHash === liveById.get(card.lessonId)?.lessonSourceHash).length;
if (cardsFresh !== 0) errors.push(`shared card freshness boundary changed: ${cardsFresh} current`);
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 12, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 72 || !same(queueCounts, expectedQueueCounts)) errors.push(`queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions);
const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions);
const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 0, REVISE: 12, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 12, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 }) || !same(languages, { FIT: 12, REVISE: 0, ESCALATE: 0 })) errors.push("disposition distribution changed");

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  sharedCardsFresh: cardsFresh,
  verifiedSourceClosures: { genericPlaceholderReplacements: 24, mainProgressionRows: 12, total: 36, exactOrAdequateFigureAlignments: 13 },
  specializedResiduals: { unsynchronizedMainFigurePlacements: specializedVisualResiduals, textOnlyRemedials, exactRemedialPromptRepeats: remedialPromptRepeats, literalVariantContractMismatches: variantContractResiduals },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages,
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, lessonRevisionRowsOpened: 12, immediateNetReduction: 24, staleSourceRowsClosedOnRefresh: 36, specializedFigureRowsRetainedOrOpened: 11, variantContractRowsRetainedOrOpened: 10, projectedRows: 33 },
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
