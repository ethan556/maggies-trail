#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S254_DIVISION_FLUENCY_G3_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "division-fluency-g3", "course.json");
const lessonDir = rel("content", "courses", "division-fluency-g3", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const generatorPath = rel("src", "lib", "g3FluencyVariants.ts");
const generatorTestPath = rel("src", "lib", "g3Fluency.sweep.test.ts");
const repairReportPath = rel("reports", "pedagogy", "S254_DIVISION_FLUENCY_G3_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session254.divisionFluencyG3CourseIntegrity.test.tsx");
const repairScriptPath = rel("scripts", "audit", "repair-division-fluency-g3-s254.mjs");

const expectedHashes = {
  candidate: "90d1d0d1809e289fba163b3145a45533a8846895252a3949904e263779dc7d94",
  course: "1514544972e3e820388f3d59636cc823fde4d04b40a2caae5a3057a511c2b3a1",
  figureSurface: "eb4a12d3faf9cc909d605c3fece86d4a0a0e850fc9e192b18fe5ed668f33d8fc",
  figureIds: "2ab07e64986da0721ed4681b917e81358c05260ff937613a2bfe31624af68d01",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
  divisionGeneratorSurface: "93a41cf2e77aa72374b558c54178f93c5208354f9e256d6048496b7faf71f5b7",
};
const expectedBasis = {
  "df3-01-01": "b0967342d35218c46eb9afe915b6da9b96e3bf9998fa7124a4723711469eb055",
  "df3-01-02": "fa7a264d04e287ce3f94374968492a9b595754cbc712ea3ae1974b8c825657cb",
  "df3-01-03": "0ad1eb213949af4278af4310688d85e334c9f455998921b49d3b255a7f6db020",
  "df3-01-04": "90f382a0f868987b4b9a65f1a189ab489fbc35452771175dfc05e631c38a4cc3",
  "df3-02-01": "a7fe7b8254838e2911abd6372885af0ad2150951558b37457253d6963dc1edbe",
  "df3-02-02": "7662cc82e154f981b01c013c6fd65c95551028a0e311741e984616763452b76c",
  "df3-02-03": "36c5a7a572ea3478836159c9cded61665229eac30fac56c0c1aaa0e7a68bdf17",
  "df3-02-04": "0f7f4a4b265961a2b7e5ee0e5f3f8e4f60233e798edb0895dd3515ece19678cc",
  "df3-03-01": "1c945676966bd08f85e5489c9eb71d16758f10cb2fafeb018b4214a1527864b2",
  "df3-03-02": "85004befbb3021e873e834a058f613021a23c57e0e38cb165628c733823ca3e8",
  "df3-03-03": "61afbd45f38d59023256e6491e2642286c768ff3a761148b46fba411919d31fe",
  "df3-03-04": "ddaec8f5b9e3fdf1f2ab9d20400613ba93169d8f9e784a5816fbb94b5004c5f0",
};
const expectedFigures = {
  "df3-01-01": ["mult3-fair-shares", "mult3-fact-family"], "df3-01-02": ["mult3-how-many-groups", "mult3-fact-family"],
  "df3-01-03": ["mult3-double-double", "mult3-fact-family"], "df3-01-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-02-01": ["mult3-missing-factor", "mult3-nines"], "df3-02-02": ["mult3-fact-family", "mult3-missing-factor"],
  "df3-02-03": ["mult3-missing-factor", "mult3-fact-family"], "df3-02-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-03-01": ["mult3-special", "mult3-fair-shares"], "df3-03-02": ["mult3-special", "mult3-special"],
  "df3-03-03": ["mult3-fact-family", "mult3-array"], "df3-03-04": ["mult3-which-op", "mult3-fair-shares"],
};
const expectedForms = {
  "df3-01-01": "DivBy2Numeric", "df3-01-02": "DivBy3Numeric", "df3-01-03": "DivBy45Numeric",
  "df3-01-04": "DivBy67Numeric", "df3-02-01": "DivBy89Numeric", "df3-02-02": "DivBy10Numeric",
  "df3-02-03": "DivThinkMultNumeric", "df3-02-04": "DivMissingNumeric", "df3-03-01": "DivSpecialNumeric",
  "df3-03-02": "DivZeroMcq", "df3-03-03": "DivMixedNumeric", "df3-03-04": "DivChooseMcq",
};
const languageRevise = new Set(Object.keys(expectedBasis).filter((id) => id !== "df3-03-04"));
const progressionLessons = new Set(["df3-01-01", "df3-01-02", "df3-01-03", "df3-01-04", "df3-02-01", "df3-02-02", "df3-02-03", "df3-02-04", "df3-03-01", "df3-03-02", "df3-03-03"]);
const figureFunctions = ["Mult3Array", "Mult3FairShares", "Mult3HowManyGroups", "Mult3MissingFactor", "Mult3FactFamily", "Mult3Special", "Mult3DoubleDouble", "Mult3Nines", "Mult3WhichOp"];

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
function extractFunctions(source, names) {
  return names.map((name) => { const start = source.indexOf(`function ${name}(`); const end = source.indexOf("\nfunction ", start + 1); return start < 0 ? "" : source.slice(start, end < 0 ? source.length : end).trim(); }).join("\n---\n");
}
function divisionGeneratorSurface(source) {
  const start = source.indexOf("/* ============================================================= g3-div-fluency");
  const end = source.indexOf("\nfunction fam(", start);
  return source.slice(start, end).trim();
}
function canonicalFactKey(left, right) { const [lo, hi] = [left, right].sort((a, b) => a - b); return `${lo}x${hi}`; }

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, generatorPath, generatorTestPath, repairReportPath, focusedTestPath, repairScriptPath]) if (!fs.existsSync(file)) errors.push(`missing required evidence: ${path.relative(root, file)}`);
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((entry) => entry.courseId === "division-fluency-g3");
const liveById = new Map(liveLessons.map((entry) => [entry.lessonId, entry]));
const records = parseJsonl(candidatePath); const recordById = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0]; const requiredFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId)); const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const figureIdsSource = read(figureIdsPath), generatorSource = read(generatorPath), generatorSurface = divisionGeneratorSurface(generatorSource);

if (course.id !== "division-fluency-g3" || course.gradeLevel !== 3 || lessonIds.length !== 12 || new Set(lessonIds).size !== 12) errors.push("unexpected course identity/grade/lesson manifest");
if (liveLessons.length !== 12 || records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) errors.push("candidate/live authority must contain 12 unique lessons/records");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate) errors.push("candidate hash changed");
if (sha256(read(coursePath)) !== expectedHashes.course) errors.push("course manifest hash changed");
if (sha256(extractFunctions(read(figuresPath), figureFunctions)) !== expectedHashes.figureSurface) errors.push("reviewed figure implementation surface changed");
if (sha256(read(figureIdsPath)) !== expectedHashes.figureIds || sha256(read(alignmentPath)) !== expectedHashes.alignment) errors.push("figure registration/visibility authority changed");
if (sha256(generatorSurface) !== expectedHashes.divisionGeneratorSurface) errors.push("reviewed division generator surface changed");

let conceptFigures = 0, gradedSurfaces = 0, areaModels = 0, variantBindings = 0, textOnlyRemedials = 0, exactRemedialRepeats = 0, semanticZeroRepeat = 0;
for (const id of lessonIds) {
  const record = recordById.get(id), live = liveById.get(id), lesson = lessons.get(id);
  if (!record || !live || !lesson) continue;
  const fields = new Set(Object.keys(record));
  if (fields.size !== requiredFields.size || [...fields].some((field) => !requiredFields.has(field))) errors.push(`${id}: candidate fields differ from schema`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S254-DF3-${id}` || record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== live.reviewBasisHash) errors.push(`${id}: record identity/current basis mismatch`);
  const expectedLanguage = languageRevise.has(id) ? "REVISE" : "FIT";
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== expectedLanguage) errors.push(`${id}: expected REVISE/REQUIRED/${expectedLanguage}`);
  if (record.reviewer !== "ChatGPT Work independent assessor (division-fluency-g3 S254)" || !Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: reviewer/timestamp mismatch`);
  if (String(record.rationale).length < 340 || String(record.reopenCondition).length < 340) errors.push(`${id}: rationale/reopen condition not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 12) errors.push(`${id}: evidence incomplete`); else for (const ref of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(ref).split("/")))) errors.push(`${id}: missing evidence ${ref}`);

  const mainIds = lesson.steps.map((step) => step.id), remedialIds = lesson.remedials.flatMap((route) => [route.concept.id, route.check.id]);
  if (lesson.id !== id || lesson.courseId !== course.id || new Set([...mainIds, ...remedialIds]).size !== mainIds.length + remedialIds.length) errors.push(`${id}: lesson identity/step IDs invalid`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: concept figure mapping changed`);
  for (const step of concepts) { conceptFigures += 1; if (!step.figure || !figureIdsSource.includes(JSON.stringify(step.figure)) || step.body !== step.narration) errors.push(`${id}/${step.id}: figure registration/body parity changed`); }
  const mainWidgets = lesson.steps.filter((step) => step.widget);
  const prompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: detector-defined main progression closure changed`);
  if (progressionLessons.has(id)) {
    const expectedPrefixes = { i2: "Model a second case, then verify it:", k2: "Use an inverse multiplication fact to solve:", ch1: "Transfer to a final case:" };
    for (const [stepId, prefix] of Object.entries(expectedPrefixes)) if (!lesson.steps.find((step) => step.id === stepId)?.widget?.prompt?.startsWith(prefix)) errors.push(`${id}/${stepId}: reviewed meta-language debt changed`);
    if (id !== "df3-03-02" && !lesson.steps.find((step) => step.id === "k3")?.widget?.prompt?.startsWith("Retrieve without the array:")) errors.push(`${id}/k3: reviewed retrieval-language debt changed`);
  }
  for (const step of mainWidgets) {
    const widget = step.widget; gradedSurfaces += 1;
    if (widget.type === "areaModel") { areaModels += 1; if (widget.requireFactors && widget.requireFactors.w * widget.requireFactors.h !== widget.targetArea) errors.push(`${id}/${step.id}: area-model factor target false`); }
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || widget.tolerance !== 0 || (widget.commonErrors ?? []).some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator invalid`);
    if (widget.type === "mcq" && (widget.options.filter((option) => option.correct).length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length || widget.options.some((option) => !option.feedback))) errors.push(`${id}/${step.id}: MCQ evaluator invalid`);
    if (step.variant?.gen) {
      variantBindings += 1;
      if (step.variant.gen !== "g3-div-fluency") errors.push(`${id}/${step.id}: wrong generator family`);
      const expectedForm = id === "df3-03-04" && step.id === "k3" ? "DivMixedNumeric" : expectedForms[id];
      if (step.variant.form !== expectedForm) errors.push(`${id}/${step.id}: expected ${expectedForm}, got ${step.variant.form}`);
      if (widget.type === "numeric" && step.variant.factFamily) {
        const nums = [...widget.prompt.matchAll(/\d+/g)].map((match) => Number(match[0]));
        let key;
        if (widget.prompt.includes("× ?")) key = canonicalFactKey(nums[0], widget.answer); else if (widget.prompt.includes("÷")) key = canonicalFactKey(nums[1], widget.answer);
        if (key && step.variant.factFamily !== key) errors.push(`${id}/${step.id}: authored fact-family ${step.variant.factFamily} should be ${key}`);
      }
      if (["DivZeroMcq", "DivChooseMcq"].includes(step.variant.form) && step.variant.factFamily) errors.push(`${id}/${step.id}: conceptual form must not carry factFamily`);
    }
  }
  if (lesson.remedials.length !== 1) errors.push(`${id}: expected one remedial route`);
  const route = lesson.remedials[0];
  gradedSurfaces += 1;
  if (route.concept.figure) errors.push(`${id}: reviewed text-only remedial changed`); else textOnlyRemedials += 1;
  if (route.concept.body !== route.concept.narration) errors.push(`${id}: remedial body/narration parity changed`);
  const k1 = lesson.steps.find((step) => step.id === "k1");
  if (id === "df3-03-02") {
    if (route.check.widget.prompt !== k1.widget.prompt || route.check.widget.options.find((option) => option.correct)?.id !== k1.widget.options.find((option) => option.correct)?.id) errors.push(`${id}: reviewed semantic zero-division repeat changed`); else semanticZeroRepeat += 1;
    const lengths = route.check.widget.options.map((option) => option.label.length);
    if (Math.max(...lengths) - Math.min(...lengths) < 25 || route.check.widget.options.find((option) => option.correct)?.label.length !== Math.max(...lengths)) errors.push(`${id}: residual remedial answer-length cue changed`);
  } else if (stable(route.check.widget) !== stable(k1.widget)) errors.push(`${id}: expected exact k1 remedial repeat`); else exactRemedialRepeats += 1;
}
if (conceptFigures !== 24 || gradedSurfaces !== 84 || areaModels !== 24 || variantBindings !== 45 || textOnlyRemedials !== 12 || exactRemedialRepeats !== 11 || semanticZeroRepeat !== 1) errors.push(`coverage changed: figures=${conceptFigures} graded=${gradedSurfaces} area=${areaModels} variants=${variantBindings} remedials=${textOnlyRemedials} exact=${exactRemedialRepeats} semantic=${semanticZeroRepeat}`);

for (const [lessonId, stepId] of [["df3-03-02", "k1"], ["df3-03-02", "k3"]]) {
  const widget = lessons.get(lessonId).steps.find((step) => step.id === stepId).widget; const lengths = widget.options.map((option) => option.label.length);
  if (!same(widget.options.map((option) => option.id), ["o0", "o1", "o2", "o3"]) || widget.options.filter((option) => option.correct).length !== 1 || Math.max(...lengths) - Math.min(...lengths) > 8) errors.push(`${lessonId}/${stepId}: repaired choice parity changed`);
}
const allText = stable([...lessons.values()]);
for (const pattern of [/÷10 shifts/i, /shifts every digit/i, /digits move down/i, /zero .* disappears/i, /A quotient can always be checked by multiplying it back\./, /Every division fact has a multiplication twin/, /dividing a number by itself gives 1/]) if (pattern.test(allText)) errors.push(`audited source overclaim returned: ${pattern}`);
if (!allText.includes("dividing a nonzero number by itself gives 1") || !allText.includes("Division by zero is undefined")) errors.push("qualified self-division/zero-domain truth missing");
if (!generatorSurface.includes("A number divided by itself is never zero unless the number itself is zero.")) errors.push("reviewed learner-visible DivSpecial false exception changed; reassess release blocker");
if (!generatorSurface.includes("{ factFamily: factFamilyKey(n, n) }")) errors.push("reviewed DivSpecial self-division mastery misattribution changed; reassess release blocker");

const cardsFresh = lessonIds.filter((id) => { const card = cardById.get(id), live = liveById.get(id); return card && live && card.reviewBasisHash === live.reviewBasisHash && card.lessonSourceHash === live.lessonSourceHash; }).length;
if (cardsFresh !== 0) errors.push(`shared cards freshness changed: ${cardsFresh}`);
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { CHOICE_SURFACE_INTEGRITY: 2, GRADE_LANGUAGE_REVIEW: 12, ILLUSTRATION_REPLACEMENT: 24, LESSON_COMPLETE_DISPOSITION: 12, LESSON_PROGRESSION_AND_DUPLICATION: 11, VISUAL_FIRST_REPRESENTATION: 12 };
if (queue.length !== 73 || !same(queueCounts, expectedQueueCounts)) errors.push(`current queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);
const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions), visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions), languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 0, REVISE: 12, ESCALATE: 0 }) || !same(visuals, { REQUIRED: 12, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 }) || !same(languages, { FIT: 1, REVISE: 11, ESCALATE: 0 })) errors.push(`disposition distributions changed: ${JSON.stringify({ decisions, visuals, languages })}`);

const result = {
  status: errors.length ? "FAIL" : "PASS", courseId: course.id, lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  sharedCardsFresh: cardsFresh,
  verifiedSourceClosures: { illustration: 24, progression: 11, choice: 2, total: 37 },
  reviewedRuntime: { conceptFigures, gradedSurfaces, areaModels, variantBindings },
  dispositions: decisions, visualDispositions: visuals, languageDispositions: languages,
  residualSpecializedDebt: { textOnlyRemedials, exactK1RemedialRepeats: exactRemedialRepeats, semanticZeroDivisionRemedialRepeats: semanticZeroRepeat, divisionByZeroRemedialChoiceCue: 1, specializedMainVisualMismatchLessons: 4, sharedGeneratorReleaseBlockers: 2 },
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 36, lessonRevisionRowsOpened: 12, immediateNetReduction: 24, staleRepairedSourceRowsClosedOnRefresh: 37, expectedRowsAfterAppendAndSourceRefresh: 12 },
  releaseBlocker: "DivSpecialNumeric tells learners self-division can be zero when the number is zero and tags generated n÷n facts as n×n mastery instead of 1×n; shared generator correction and property ratchets are required before release.",
  hashes: expectedHashes, errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
