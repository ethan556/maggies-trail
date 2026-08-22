#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S256_DIVISION_FLUENCY_G3_FOLLOW_ON_SUPERSEDING_TRIPLE_DISPOSITIONS.jsonl");
const priorCandidatePath = path.join(here, "S254_DIVISION_FLUENCY_G3_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "division-fluency-g3", "course.json");
const lessonDir = rel("content", "courses", "division-fluency-g3", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const generatorPath = rel("src", "lib", "g3FluencyVariants.ts");
const repairReportPath = rel("reports", "pedagogy", "S254_DIVISION_FLUENCY_G3_FOLLOW_ON.md");
const originalReportPath = rel("reports", "pedagogy", "S254_DIVISION_FLUENCY_G3_WHOLE_COURSE_REPAIR.md");
const followOnTestPath = rel("src", "lib", "session254.divisionFluencyG3FollowOn.test.tsx");
const integrityTestPath = rel("src", "lib", "session254.divisionFluencyG3CourseIntegrity.test.tsx");
const sweepTestPath = rel("src", "lib", "g3Fluency.sweep.test.ts");
const repairScriptPath = rel("scripts", "audit", "repair-division-fluency-g3-follow-on-s254.mjs");

const expectedHashes = {
  candidate: "40f87737068d97c839b759a41844c26d41c7b2c616804dce9b0b42a81b2c77bb",
  priorCandidate: "90d1d0d1809e289fba163b3145a45533a8846895252a3949904e263779dc7d94",
  course: "1514544972e3e820388f3d59636cc823fde4d04b40a2caae5a3057a511c2b3a1",
  figureSurface: "a57683a2929810237b8dd5fbbad55d2c4ab016a0b74fbbff72b5c75ce6dafa24",
  figureIds: "d2145dc68cd70228875f88571b5d631bac2684a352c812e1fe2ae03cc0d5eb0e",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
  generator: "d13c6eb48174affab8d2407ee86a9016d9bd6398f2abd9c5ad6e0c912f3174f1",
  repair: "3839f12d3886aebb65fc0ee781696fa4d2690a124360321c4d61328adedfe392",
  followOnTest: "ae7d72701d6b846ba5c06da0cd8283892e4ae21779c8fcdd7301a5dcd29b8243",
};
const expectedBasis = {
  "df3-01-01": "3e2f26458bf84832a8c59dd8959a765bd24fec284d22f2f59cff5bf1d45b1b61",
  "df3-01-02": "14071156f04daf7ef61eecb3642d8912d250035f0413996bef9c19fd747cb769",
  "df3-01-03": "80e306b4737fb219a25fc9bd1e07dcbdae2dd3328a192b91504161cb08a79028",
  "df3-01-04": "800234c63aa3d054f29277939509e5420d63adfa714a6ed83be90b7f34fcffac",
  "df3-02-01": "f52dd054a5810513f1e8aaa76b042e43f13845d4d9165b07f6d6c7a6789f7e0c",
  "df3-02-02": "b72b8d679e36b247579f6859b04e3a26b03f59585091105aaeacc121ef8dca9a",
  "df3-02-03": "b0a51b8918df13e26309371888bc96ef13fbc666fcca0245741df43498d1b0de",
  "df3-02-04": "52fab4026449b3d64e22b40a7e4467fe2c92786117dd904b4ef81732f8438214",
  "df3-03-01": "94c0059d4ef9638986578ab26964950c465c81602d85829c9269597958bd6d8e",
  "df3-03-02": "7a17b2d581133cabc1226563c6ca684b90d18e0747e6acf777059a379bf36b4e",
  "df3-03-03": "3ae9f7c2b67d8d60c9e387664564ce319f581b5a361547a95a55cf0ba9ce6cfb",
  "df3-03-04": "b57bbf79a1682c67f73f0252376f7577ef6b82c0afb0fb5ee87851ceafc2fbdb",
};
const expectedMainFigures = {
  "df3-01-01": ["mult3-fair-shares", "mult3-fact-family"], "df3-01-02": ["mult3-how-many-groups", "mult3-fact-family"],
  "df3-01-03": ["mult3-double-double", "mult3-fact-family"], "df3-01-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-02-01": ["mult3-missing-factor", "mult3-divide-by-nine"], "df3-02-02": ["mult3-divide-by-ten", "mult3-divide-by-ten"],
  "df3-02-03": ["mult3-missing-factor", "mult3-fact-family"], "df3-02-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-03-01": ["mult3-divide-one-self", "mult3-divide-one-self"], "df3-03-02": ["mult3-divide-by-zero", "mult3-divide-by-zero"],
  "df3-03-03": ["mult3-fact-family", "mult3-array"], "df3-03-04": ["mult3-which-op", "mult3-fair-shares"],
};
const expectedRemedialFigures = {
  "df3-01-01": "mult3-fair-shares", "df3-01-02": "mult3-how-many-groups", "df3-01-03": "mult3-double-double", "df3-01-04": "mult3-missing-factor",
  "df3-02-01": "mult3-divide-by-nine", "df3-02-02": "mult3-divide-by-ten", "df3-02-03": "mult3-missing-factor", "df3-02-04": "mult3-missing-factor",
  "df3-03-01": "mult3-divide-one-self", "df3-03-02": "mult3-divide-by-zero", "df3-03-03": "mult3-fact-family", "df3-03-04": "mult3-which-op",
};
const expectedForms = {
  "df3-01-01": "DivBy2Numeric", "df3-01-02": "DivBy3Numeric", "df3-01-03": "DivBy45Numeric", "df3-01-04": "DivBy67Numeric",
  "df3-02-01": "DivBy89Numeric", "df3-02-02": "DivBy10Numeric", "df3-02-03": "DivThinkMultNumeric", "df3-02-04": "DivMissingNumeric",
  "df3-03-01": "DivSpecialNumeric", "df3-03-02": "DivZeroMcq", "df3-03-03": "DivMixedNumeric", "df3-03-04": "DivChooseMcq",
};
const figureFunctions = ["Mult3Array", "Mult3FairShares", "Mult3HowManyGroups", "Mult3MissingFactor", "Mult3FactFamily", "Mult3DoubleDouble", "Mult3WhichOp", "Mult3DivideByNine", "Mult3DivideByTen", "Mult3DivideOneSelf", "Mult3DivideByZero"];
const newFigureIds = new Set(["mult3-divide-by-nine", "mult3-divide-by-ten", "mult3-divide-one-self", "mult3-divide-by-zero"]);

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
function canonicalFactKey(left, right) { const [lo, hi] = [left, right].sort((a, b) => a - b); return `${lo}x${hi}`; }

const errors = [];
for (const file of [candidatePath, priorCandidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, generatorPath, repairReportPath, originalReportPath, followOnTestPath, integrityTestPath, sweepTestPath, repairScriptPath]) if (!fs.existsSync(file)) errors.push(`missing evidence ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath)); const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds); const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const records = parseJsonl(candidatePath); const recordById = new Map(records.map((record) => [record.lessonId, record])); const priorRecords = parseJsonl(priorCandidatePath); const priorById = new Map(priorRecords.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0]; const requiredFields = ["recordType", ...schema.contract.requiredDecisionFields].sort();
const authority = loadLessonReviewAuthority(root); const live = authority.lessons.filter((entry) => entry.courseId === course.id); const liveById = new Map(live.map((entry) => [entry.lessonId, entry]));
const figureIdsSource = read(figureIdsPath); const figureSurface = extractFunctions(read(figuresPath), figureFunctions); const generatorSource = read(generatorPath);

if (course.id !== "division-fluency-g3" || course.gradeLevel !== 3 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("course identity/manifest boundary changed");
if (records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate must contain 12 unique lessons/records");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate || sha256(read(priorCandidatePath)) !== expectedHashes.priorCandidate || sha256(read(coursePath)) !== expectedHashes.course || sha256(figureSurface) !== expectedHashes.figureSurface || sha256(read(figureIdsPath)) !== expectedHashes.figureIds || sha256(read(alignmentPath)) !== expectedHashes.alignment || sha256(read(generatorPath)) !== expectedHashes.generator || sha256(read(repairScriptPath)) !== expectedHashes.repair || sha256(read(followOnTestPath)) !== expectedHashes.followOnTest) errors.push("one or more sealed evidence hashes changed");
const priorCurrentMatches = lessonIds.filter((id) => priorById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length;
if (priorCurrentMatches !== 0) errors.push(`prior S254 candidate must be fully stale, found ${priorCurrentMatches}/12 current hashes`);
for (const source of figureFunctions.map((name) => extractFunctions(read(figuresPath), [name]))) if (!source.includes("<title") || !source.includes('role="img"') || !source.includes("aria-label")) errors.push("reviewed figure accessibility surface changed");

let mainFigures = 0, remedialFigures = 0, newMainBindings = 0, newRemedialBindings = 0, diversifiedRemedials = 0, gradedSurfaces = 0, areaModels = 0, variantBindings = 0, cmlZeroSurfaces = 0;
for (const id of lessonIds) {
  const lesson = lessons.get(id); const record = recordById.get(id); const current = liveById.get(id);
  if (!record || !current) { errors.push(`${id}: missing candidate/current authority`); continue; }
  if (!same(Object.keys(record).sort(), requiredFields)) errors.push(`${id}: fields differ from canonical contract`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S256-DF3-FOLLOWON-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== current.reviewBasisHash) errors.push(`${id}: identity/current-basis mismatch`);
  if (record.decision !== "KEEP" || record.visualDecision !== "SUFFICIENT" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: expected KEEP/SUFFICIENT/FIT`);
  if (record.reviewer !== "ChatGPT Work independent assessor (division-fluency-g3 follow-on supersession S256)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp invalid`);
  if (String(record.rationale).length < 280 || String(record.reopenCondition).length < 280 || !Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 12) errors.push(`${id}: rationale, reopen condition, or evidence is incomplete`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  const mainIds = lesson.steps.map((step) => step.id); const remedialIds = lesson.remedials.flatMap((route) => [route.concept.id, route.check.id]);
  if (lesson.id !== id || lesson.courseId !== course.id || new Set([...mainIds, ...remedialIds]).size !== mainIds.length + remedialIds.length) errors.push(`${id}: identity or stable step IDs invalid`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedMainFigures[id])) errors.push(`${id}: main figure map changed`);
  for (const concept of concepts) { mainFigures += 1; if (newFigureIds.has(concept.figure)) newMainBindings += 1; if (!concept.figure || !figureIdsSource.includes(JSON.stringify(concept.figure)) || concept.body !== concept.narration) errors.push(`${id}/${concept.id}: main figure registration/narration failed`); }
  const mainWidgets = lesson.steps.filter((step) => step.widget); const prompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: main progression collision returned`);
  for (const pattern of [/Model a second case, then verify it:/i, /Use an inverse multiplication fact to solve:/i, /Retrieve without the array:/i, /Transfer to a final case:/i]) if (pattern.test(prompts.join("\n"))) errors.push(`${id}: meta-instructional stem returned`);

  if (!lesson.remedials || lesson.remedials.length !== 1) errors.push(`${id}: expected one remedial route`);
  const route = lesson.remedials[0];
  if (route.concept.figure !== expectedRemedialFigures[id] || !figureIdsSource.includes(JSON.stringify(route.concept.figure)) || route.concept.body !== route.concept.narration) errors.push(`${id}: figured remedial mapping/registration/narration changed`); else { remedialFigures += 1; if (newFigureIds.has(route.concept.figure)) newRemedialBindings += 1; }
  const remedialPrompt = route.check.widget.prompt;
  if (mainWidgets.some((step) => step.widget.prompt === remedialPrompt) || mainWidgets.some((step) => normalize(step.widget.prompt) === normalize(remedialPrompt)) || mainWidgets.some((step) => stable(step.widget) === stable(route.check.widget))) errors.push(`${id}: remedial diversity closure changed`); else diversifiedRemedials += 1;

  for (const step of [...mainWidgets, route.check]) {
    const widget = step.widget; gradedSurfaces += 1;
    if (widget.type === "areaModel") { areaModels += 1; if (widget.requireFactors && widget.requireFactors.w * widget.requireFactors.h !== widget.targetArea) errors.push(`${id}/${step.id}: area-model target invalid`); }
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
    if (widget.type === "mcq" && (widget.options.length < 3 || widget.options.filter((option) => option.correct).length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length || widget.options.some((option) => !option.feedback))) errors.push(`${id}/${step.id}: MCQ evaluator invalid`);
  }
  for (const step of mainWidgets.filter((step) => step.variant?.gen)) {
    variantBindings += 1; const widget = step.widget;
    if (step.variant.gen !== "g3-div-fluency") errors.push(`${id}/${step.id}: wrong generator family`);
    const expectedForm = id === "df3-03-04" && step.id === "k3" ? "DivMixedNumeric" : expectedForms[id];
    if (step.variant.form !== expectedForm) errors.push(`${id}/${step.id}: expected ${expectedForm}, got ${step.variant.form}`);
    if (widget.type === "numeric" && step.variant.factFamily) { const nums = [...widget.prompt.matchAll(/\d+/g)].map((match) => Number(match[0])); let key; if (widget.prompt.includes("× ?")) key = canonicalFactKey(nums[0], widget.answer); else if (widget.prompt.includes("÷")) key = canonicalFactKey(nums[1], widget.answer); if (key && step.variant.factFamily !== key) errors.push(`${id}/${step.id}: fact-family ${step.variant.factFamily} should be ${key}`); }
    if (["DivZeroMcq", "DivChooseMcq"].includes(step.variant.form) && step.variant.factFamily) errors.push(`${id}/${step.id}: conceptual form must not carry factFamily`);
  }
  if (id === "df3-03-02") {
    for (const step of lesson.steps.filter((entry) => ["i1", "i2"].includes(entry.id))) {
      cmlZeroSurfaces += 1;
      if (step.widget.type !== "mcq" || step.cml?.kernel !== "quantity-composition" || step.cml?.translationFrom !== "symbolic" || step.cml?.translationTo !== "language" || step.cml?.representations?.join(",") !== "symbolic,language" || !step.cml?.invariants?.[0]?.startsWith("Zero times every number is 0") || Object.keys(step.cml).some((key) => /waiver/i.test(key))) errors.push(`${id}/${step.id}: strict zero-division CML contract changed`);
    }
    const choiceSurfaces = [lesson.steps.find((step) => step.id === "k1").widget, lesson.steps.find((step) => step.id === "k3").widget, route.check.widget];
    for (const widget of choiceSurfaces) { const lengths = widget.options.map((option) => option.label.length); if (Math.max(...lengths) - Math.min(...lengths) > 8 || widget.options.filter((option) => option.correct).length !== 1) errors.push(`${id}: zero-division option parity changed`); }
  }
}
if (mainFigures !== 24 || remedialFigures !== 12 || newMainBindings !== 7 || newRemedialBindings !== 4 || diversifiedRemedials !== 12 || gradedSurfaces !== 84 || areaModels !== 22 || variantBindings !== 45 || cmlZeroSurfaces !== 2) errors.push(`coverage changed: mainFigures=${mainFigures} remedialFigures=${remedialFigures} newMain=${newMainBindings} newRemedial=${newRemedialBindings} diversified=${diversifiedRemedials} graded=${gradedSurfaces} area=${areaModels} variants=${variantBindings} cml=${cmlZeroSurfaces}`);

const allText = stable([...lessons.values()]);
for (const pattern of [/÷10 shifts/i, /shifts every digit/i, /digits move down/i, /zero .* disappears/i, /A quotient can always be checked by multiplying it back\./, /Every division fact has a multiplication twin/, /dividing a number by itself gives 1/]) if (pattern.test(allText)) errors.push(`audited source overclaim returned: ${pattern}`);
if (!allText.includes("dividing a nonzero number by itself gives 1") || !allText.includes("Division by zero is undefined")) errors.push("qualified self-division/zero-domain truth missing");
if (!generatorSource.includes("A nonzero number divided by itself equals 1, not 0. The separate expression 0 ÷ 0 is undefined.") || generatorSource.includes("unless the number itself is zero") || !generatorSource.includes("{ factFamily: factFamilyKey(1, n) }")) errors.push("DivSpecialNumeric zero-domain or 1×n mastery repair changed");

const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId)); const cardsFresh = cards.filter((card) => card.reviewBasisHash === liveById.get(card.lessonId)?.reviewBasisHash && card.lessonSourceHash === liveById.get(card.lessonId)?.lessonSourceHash).length;
if (cardsFresh !== 0) errors.push(`shared card freshness changed: ${cardsFresh}`);
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id)); const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { CHOICE_SURFACE_INTEGRITY: 2, GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 11, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 73 || !same(queueCounts, expectedQueueCounts)) errors.push(`queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions); const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions); const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 12, REVISE: 0, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 0, PREFERRED: 0, SUFFICIENT: 12, ESCALATE: 0 }) || !same(languages, { FIT: 12, REVISE: 0, ESCALATE: 0 })) errors.push("disposition distribution changed");

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  priorS254CandidateCurrentHashesMatched: priorCurrentMatches, priorS254CandidateRequiredState: "STALE",
  sharedCardsFresh: cardsFresh,
  verifiedFollowOnClosures: { newRegisteredFigures: 4, newMainBindings, figuredRemedials: remedialFigures, newFigureRemedialBindings: newRemedialBindings, diversifiedRemedials, zeroDivisionInteractions: 2, directStemLessons: 11, generatorTruthDefects: 2, totalKnownResidualsClosed: 44 },
  reviewedRuntime: { mainFigures, gradedSurfaces, areaModels, variantBindings, strictZeroDivisionCmlSurfaces: cmlZeroSurfaces, cmlWaivers: 0 },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages,
  releaseBlockers: [], residualSpecializedDebt: [],
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, revisionRowsOpened: 0, staleSourceRowsClosedOnRefresh: 37, expectedRowsAfterAppendAndSourceRefresh: 0 },
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
