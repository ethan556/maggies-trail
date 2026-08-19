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
const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const stable = (value) => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const same = (left, right) => stable(left) === stable(right);
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => { try { return JSON.parse(line); } catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); } });
const normalize = (value) => String(value).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
const require = createRequire(import.meta.url);
const { solve: solveG4 } = require(rel("src", "lib", "g4Independent.cjs"));

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
  const value = String(reference);
  const markers = [value.indexOf(":"), value.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b);
  return markers.length ? value.slice(0, markers[0]) : value;
}

function extractFunctions(source, names) {
  return names.map((name) => {
    const start = source.indexOf(`function ${name}(`);
    const end = source.indexOf("\nfunction ", start + 1);
    return start < 0 ? "" : source.slice(start, end < 0 ? source.length : end).trim();
  }).join("\n---\n");
}

const candidatePath = path.join(here, "S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS.jsonl");
const staleCandidatePath = path.join(here, "S255_FRACTION_MULTIPLY_G4_TRIPLE_DISPOSITIONS.jsonl");
const assessmentPath = path.join(here, "S258_FRACTION_MULTIPLY_G4_SUPERSEDING_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const coursePath = rel("content", "courses", "fraction-multiply-g4", "course.json");
const lessonDir = rel("content", "courses", "fraction-multiply-g4", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const repairPath = rel("scripts", "audit", "repair-fraction-multiply-g4-s258.mjs");
const reportPath = rel("reports", "pedagogy", "S258_FRACTION_MULTIPLY_G4_SUPERSESSION.md");
const s258TestPath = rel("src", "lib", "session258.fractionMultiplyG4Supersession.test.tsx");

const expectedHashes = {
  candidate: "61a9c4fbbca0bee12afee3f45ba789c848d4fc2860e3a770cf10d52340dc6f43",
  staleCandidate: "ecab4b04efaab677745d02c4cc8aa58cfb061d229059a9b8a95c70364349b380",
  course: "664d731bdbebd4366da43aa8cf84603f83c0813691bbc6437abce77d86237f56",
  repair: "108856dfe1db8c83cdd6b74bf5e2af6cc7d0151d5f6df47c1bb73bbdd26fc94d",
  report: "1e0ab6b28fce36f5cf658a8384f7302900a1f605176f87b458f2eec48af015b3",
  s258Test: "b4cf971cf1c8d64d1189ff72528fcdd3727e4025e02d1a384544ce217f665d2e",
  figureSurface: "b9deb53faf7220db97f02c6a9a8d34483442cdade2dabd95e3da579111f56948",
  evaluatorSurface: "c47fd46ba4f9d37ac3c66cf852651495d23bd82b3bece80b0ea7de95085bb585",
};

const expectedBasis = {
  "g4x-01-01": ["bc4fef96c69b5f0f5eee748e494256e8eb37a1ff015ac6e0057ebda6a92da58b", "c9e1be5fbfdc7cb57d774fb8e5ad00d17084a48552e50ab228d0bec4256182ae"],
  "g4x-01-02": ["01a7679cf728c5f8c35fcffdd80cfd47420af5de5e6a8f16491e50749db9ff12", "bdc4b44f931af0c363d11ac57abdcd196d84517530809f3839685e26a7a237a7"],
  "g4x-01-03": ["62eb5c00a767b862cceefe50b0265ef78d2ed4180531f6de0821379980608773", "7e169860bba05052d92b2f61d02c71fff13be29d6205a4d9403b2d7bcb666e43"],
  "g4x-01-04": ["363e9c072db00b3a3b266f26c7e89b6a00257cc718b637718b2a5a5263fa1385", "2a12564b9c0b16985ee98331db99fb0ef7b6cea6ce009d827a313386c6cb8865"],
  "g4x-02-01": ["7a3f184b159712026315565b64c179fc5c2566a8ca6fbc10c04f022e3363a48f", "09cd32f7c37c78b5ca7ae4c12eb67f296c368d8bbdfb3fdc952069b71425d867"],
  "g4x-02-02": ["5749c4f5c48ccf635f53ea2e3d3870382e0a7124f63886eb2aeffcdcfc5c7775", "5d6a362459a4c238211fc0b630b9545deb413f4e33383d4e016a3feb39d085c0"],
  "g4x-02-03": ["eb1e2fc752f2047d864eb9807dd95dec928fe1f3f3e97ed80f3f8beb24bf656c", "d2edfd1950c2dd4b3786a1f2477c4a4efc3b869f0e02b1924bb8eda753660e33"],
  "g4x-02-04": ["a5915d18320062e40c742a652564a64d633d0e1bc82c4711a16ad73af282fe89", "a685c4cd8b2e53ed77f5f78086ab765e6b12273c2db5579025c0622f4760ba34"],
  "g4x-03-01": ["f1e87d4f740101b21e798a990514be9bccc7f3292cc2276e4a21d63772f06793", "acdedd15493231e5a5d517dae0618e359f8c29e2f50103dfc1f8876e86027911"],
  "g4x-03-02": ["22741a07f49fec6b23b43f6227759131dfc30fda7419cb4241dfde5388f1569e", "8bd9d8aba3472ba5f3e651543f28b1d2737146e37c7432cb9e92e061a6e5ae45"],
  "g4x-03-03": ["5b36437983911e86c571cbfcaf162b050eadd18aa75537572ba26ab168c21b93", "01e8044baed1d2edba9dd80146905fc4f0c803ee3f2f7b93e8134e2e28a1e94f"],
  "g4x-03-04": ["465a73154dee158845b5f043b0543b4e062ef7711ddfa758d505b5ecb7167dd5", "abb623a39d21d5837f924d55528feb0ada07b93d5a644295c4d269cf039f2b91"],
};

const literalPlacements = new Set([
  "g4x-01-01/ch1", "g4x-01-02/k2", "g4x-01-02/ch1", "g4x-01-03/k2", "g4x-01-03/ch1", "g4x-01-04/k3",
  "g4x-02-01/k2", "g4x-02-01/ch1", "g4x-02-02/k2", "g4x-02-03/k2", "g4x-02-03/ch1", "g4x-03-01/k3",
  "g4x-03-03/k2", "g4x-03-04/k2",
]);
const synchronizedPlacements = new Set([
  "g4x-01-03/c1", "g4x-02-01/c2", "g4x-02-02/c1", "g4x-02-02/c2", "g4x-02-03/c2", "g4x-02-04/c1",
  "g4x-02-04/c2", "g4x-03-02/c1", "g4x-03-03/c1", "g4x-03-04/c1", "g4x-03-04/c2",
]);
const reviseLessons = new Set(["g4x-01-01", "g4x-01-02", "g4x-01-03", "g4x-01-04", "g4x-02-01", "g4x-02-02", "g4x-02-03", "g4x-03-03", "g4x-03-04"]);
const figureFunctions = ["FaRepeatedAdd", "FaAddLike", "FmGroups", "FracUnitFourth", "NumberLineJumps", "FracNumlinePastOne", "FaImproperMixed", "FaMixedImproper", "FaBenchmarkHalf"];

const errors = [];
for (const file of [candidatePath, staleCandidatePath, assessmentPath, coursePath, ledgerPath, queuePath, figuresPath, figureIdsPath, repairPath, reportPath, s258TestPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
if (errors.length) { console.log(JSON.stringify({ status: "FAIL", errors }, null, 2)); process.exit(1); }

const figureSurface = extractFunctions(read(figuresPath), figureFunctions);
const evaluatorSurface = ["src/lib/evaluate.ts", "src/lib/schema.ts", "src/lib/g4Independent.cjs", "src/lib/variants.ts"].map((file) => read(rel(...file.split("/")))).join("\n---\n");
for (const [name, actual, expected] of [
  ["candidate", sha256(read(candidatePath)), expectedHashes.candidate], ["stale candidate", sha256(read(staleCandidatePath)), expectedHashes.staleCandidate],
  ["course", sha256(read(coursePath)), expectedHashes.course], ["repair", sha256(read(repairPath)), expectedHashes.repair],
  ["repair report", sha256(read(reportPath)), expectedHashes.report], ["S258 test", sha256(read(s258TestPath)), expectedHashes.s258Test],
  ["figure surface", sha256(figureSurface), expectedHashes.figureSurface], ["evaluator surface", sha256(evaluatorSurface), expectedHashes.evaluatorSurface],
]) if (actual !== expected) errors.push(`${name} hash changed: ${actual}`);
for (const name of figureFunctions) { const source = extractFunctions(read(figuresPath), [name]); if (!source.includes("<title") || !source.includes('role="img"')) errors.push(`${name}: accessibility surface changed`); }

const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const authority = loadLessonReviewAuthority(root);
const live = new Map(authority.lessons.filter((entry) => entry.courseId === course.id).map((entry) => [entry.lessonId, entry]));
const records = parseJsonl(candidatePath);
const staleRecords = parseJsonl(staleCandidatePath);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0];
const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const figureIdsSource = read(figureIdsPath);

if (course.id !== "fraction-multiply-g4" || course.gradeLevel !== 4 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate needs 12 unique lesson/record IDs");
if (!same(records.map((record) => record.lessonId).sort(), lessonIds.slice().sort())) errors.push("candidate lesson set differs from manifest");
if (staleRecords.length !== 12 || staleRecords.some((record) => live.get(record.lessonId)?.reviewBasisHash === record.reviewedBasisHash)) errors.push("S255 candidate is absent, changed, or no longer stale for all 12 lessons");

let restoredLiteralPrompts = 0, synchronizedMainVisuals = 0, remedialFigures = 0, distinctRemedials = 0, gradedSurfaces = 0;
let mcqs = 0, fixedFirst = 0, parityFailures = 0;
const mcqLessons = new Set();
for (const id of lessonIds) {
  const lesson = lessons.get(id); const current = live.get(id); const record = recordById.get(id); const [basis, source] = expectedBasis[id];
  if (!current || !record) { errors.push(`${id}: missing current authority or candidate`); continue; }
  if (current.reviewBasisHash !== basis || current.lessonSourceHash !== source || record.reviewedBasisHash !== basis) errors.push(`${id}: current source/review hash mismatch`);
  if (!same(Object.keys(record).sort(), requiredFields) || record.recordType !== "lesson-disposition" || record.recordId !== `S258-G4X-${id}`) errors.push(`${id}: canonical identity/fields mismatch`);
  const expectedDecision = reviseLessons.has(id) ? "REVISE" : "KEEP";
  if (record.decision !== expectedDecision || record.visualDecision !== "SUFFICIENT" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: disposition mismatch`);
  if (record.reviewer !== "ChatGPT Work independent assessor (fraction-multiply-g4 S258 supersession)" || !Number.isFinite(Date.parse(record.reviewedAt)) || String(record.rationale).length < 260 || String(record.reopenCondition).length < 260 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 10) errors.push(`${id}: weak reviewer/rationale/evidence contract`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2) errors.push(`${id}: expected two main concepts`);
  for (const concept of concepts) {
    if (!concept.figure || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: main figure/registration/narration mismatch`);
    if (synchronizedPlacements.has(`${id}/${concept.id}`)) { synchronizedMainVisuals += 1; if (!/The figure shows (?:another|the same|the inverse)/.test(concept.body)) errors.push(`${id}/${concept.id}: visual transition lost`); }
  }
  const mainWidgets = lesson.steps.filter((step) => step.widget);
  const prompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: main-route collision returned`);
  if (!lesson.remedials || lesson.remedials.length !== 1) errors.push(`${id}: remedial boundary changed`);
  for (const route of lesson.remedials ?? []) {
    if (!route.concept.figure || !figureIdsSource.includes(JSON.stringify(route.concept.figure)) || route.concept.body !== route.concept.narration || !/The figure (?:shows|identifies|stacks|regroups|groups|separates|benchmarks)/.test(route.concept.body)) errors.push(`${id}: remedial visual/narration mismatch`); else remedialFigures += 1;
    if (mainWidgets.some((step) => step.widget.prompt === route.check.widget.prompt || normalize(step.widget.prompt) === normalize(route.check.widget.prompt) || stable(step.widget) === stable(route.check.widget))) errors.push(`${id}: remedial repeats a main job`); else distinctRemedials += 1;
  }

  const graded = [...mainWidgets, ...(lesson.remedials ?? []).map((route) => route.check)];
  for (const step of graded) {
    const widget = step.widget; gradedSurfaces += 1;
    if (literalPlacements.has(`${id}/${step.id}`)) { restoredLiteralPrompts += 1; if (!/^Compute (\d+) × (\d+)\/(\d+)/.test(widget.prompt)) errors.push(`${id}/${step.id}: literal contract lost`); }
    if (widget.type === "numeric") {
      if (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer)) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
      if (step.variant && ["check", "challenge"].includes(step.kind)) { const derived = solveG4(step.variant.form, { prompt: widget.prompt, options: [] }); if (derived !== widget.answer) errors.push(`${id}/${step.id}: independent numeric solver disagreement`); }
    } else if (widget.type === "mcq") {
      mcqs += 1; mcqLessons.add(id); const correct = widget.options.filter((option) => option.correct);
      if (correct.length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length || widget.options.some((option) => !option.feedback)) errors.push(`${id}/${step.id}: MCQ evaluator invalid`);
      if (widget.options[0]?.correct) fixedFirst += 1;
      const lengths = widget.options.map((option) => option.label.length); if (Math.max(...lengths) / Math.min(...lengths) > 1.25) parityFailures += 1;
      if (step.variant) { const derived = solveG4(step.variant.form, { prompt: widget.prompt, options: widget.options.map((option) => ({ id: option.id, label: option.label })) }); if (derived !== correct[0]?.label) errors.push(`${id}/${step.id}: independent MCQ solver disagreement`); }
    } else if (widget.type === "fractionBar") {
      if (!(widget.targetNum >= widget.numMin && widget.targetNum <= widget.numMax && widget.targetDen >= widget.denMin && widget.targetDen <= widget.denMax) || widget.commonFractions.some((trap) => trap.num * widget.targetDen === trap.den * widget.targetNum)) errors.push(`${id}/${step.id}: fraction-bar target/trap invalid`);
    } else if (widget.type === "numberLinePlace") {
      if (!(widget.target >= widget.min && widget.target <= widget.max) || (widget.commonPlacements ?? []).some((trap) => trap.value === widget.target)) errors.push(`${id}/${step.id}: number-line target/trap invalid`);
    } else if (widget.type === "estimateSlider") {
      if (!(widget.target >= widget.min && widget.target <= widget.max) || (Array.isArray(widget.choices) && widget.choices.filter((choice) => choice.correct).length !== 1)) errors.push(`${id}/${step.id}: estimate target/choice invalid`);
    }
  }
}

if (restoredLiteralPrompts !== 14 || synchronizedMainVisuals !== 11 || remedialFigures !== 12 || distinctRemedials !== 12 || gradedSurfaces !== 84) errors.push(`repair coverage changed: ${restoredLiteralPrompts}/${synchronizedMainVisuals}/${remedialFigures}/${distinctRemedials}/${gradedSurfaces}`);
if (mcqs !== 21 || fixedFirst !== 21 || parityFailures !== 19 || !same([...mcqLessons].sort(), [...reviseLessons].sort())) errors.push(`choice residual changed: ${mcqs}/${fixedFirst}/${parityFailures}/${JSON.stringify([...mcqLessons].sort())}`);

const corpusText = JSON.stringify([...lessons.values()]);
for (const pattern of [/target half/i, /shorter than half/i, /longer than half/i, /denominator never changes/i, /just under seven/i, /little less than 7/i, /\b1 pieces\b/i, /\b1 fourths\b/i]) if (pattern.test(corpusText)) errors.push(`audited false claim returned: ${pattern}`);
for (const required of ["requested unsimplified form", "Group the pieces into denominator-sized wholes", "Divide the numerator and denominator by the stated common factor", "5 5/6, just under six", "whole-number n and nonzero denominator b"]) if (!corpusText.includes(required)) errors.push(`required truth repair missing: ${required}`);

const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 12, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 72 || !same(queueCounts, expectedQueueCounts)) errors.push(`scoped queue changed: ${queue.length} ${JSON.stringify(queueCounts)}`);

const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions);
const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions);
const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 3, REVISE: 9, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 0, PREFERRED: 0, SUFFICIENT: 12, ESCALATE: 0 }) || !same(languages, { FIT: 12, REVISE: 0, ESCALATE: 0 })) errors.push("disposition distribution changed");

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === live.get(id)?.reviewBasisHash).length,
  staleS255RequiredAndVerified: staleRecords.length === 12 && staleRecords.every((record) => live.get(record.lessonId)?.reviewBasisHash !== record.reviewedBasisHash),
  verifiedS258Repairs: { restoredLiteralPrompts, synchronizedMainVisuals, visualRemedials: remedialFigures, distinctRemedialTransfers: distinctRemedials, gradedSurfaces },
  residualChoiceDebt: { mcqSurfaces: mcqs, fixedCorrectPositionZero: fixedFirst, optionParityOver1_25: parityFailures, affectedLessons: [...mcqLessons].sort() },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages,
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericHumanRowsClosed: 36, lessonRevisionRowsOpened: 9, staleGenericSourceRowsClosedOnRefresh: 36, choiceSurfaceRowsOpened: 21, projectedRows: 30 },
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
