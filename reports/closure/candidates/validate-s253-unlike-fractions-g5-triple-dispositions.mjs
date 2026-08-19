#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const rel = (...parts) => path.join(root, ...parts);
const candidatePath = path.join(here, "S253_UNLIKE_FRACTIONS_G5_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = rel("content", "courses", "unlike-fractions-g5", "course.json");
const lessonDir = rel("content", "courses", "unlike-fractions-g5", "lessons");
const ledgerPath = rel("reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const cardsPath = rel("reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const queuePath = rel("PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const figuresPath = rel("src", "components", "figures.tsx");
const figureIdsPath = rel("src", "components", "figureIds.ts");
const alignmentPath = rel("src", "lib", "figureTextAlignment.ts");
const repairReportPath = rel("reports", "pedagogy", "S252_UNLIKE_FRACTIONS_G5_WHOLE_COURSE_REPAIR.md");
const focusedTestPath = rel("src", "lib", "session252.unlikeFractionsG5CourseIntegrity.test.tsx");
const repairScriptPath = rel("scripts", "audit", "repair-unlike-fractions-g5-s252.mjs");

const expectedHashes = {
  candidate: "11224c71efc3b24a375c64349c698f2e1c0f8a917c7da941a7773a371b3539cb",
  course: "165f2322ec8cd5a5dfdcd62dc9980cd4f32a3e840e582e08fc60211b3c31ee99",
  fractionFigureSurface: "4de3788d4f3f0c3c79cdcde12729672275b320d3eceedc8faf258a7f9875b67f",
  figureIds: "2ab07e64986da0721ed4681b917e81358c05260ff937613a2bfe31624af68d01",
  alignment: "ae27d41090d10de21f5a53794ec82572d7d3f31f26d113eb5e1a0e0a3c585851",
};
const expectedBasis = {
  "g5u-01-01": "551a91a45a3218a13b0a0f99210de343a12ff253680048576dc82015d1a47e75",
  "g5u-01-02": "3ed7eef31dfbeac48f63efaf6ab9d67a3301d3f42f0f865a8d0c6e6efb0cbbe6",
  "g5u-01-03": "b65f099e601e5f77ecfe22b31b3b341b037382693e2b086a96b4da8eb3a463c2",
  "g5u-01-04": "0f2c6b20620ce2d4550d803881e145604ea7c9bdd8f7c1104b8d4ade5acb6531",
  "g5u-01-05": "71f3958bd6a34c03e681b188066d674d94cd1c1a432f769d04e90e47a92de31a",
  "g5u-02-01": "a5716567921ed15421bdede1f22bb432dc847c28531063f81cf89e46cedacaa0",
  "g5u-02-02": "592955c09cff0bac9a14eb10488fe4c2525b69b7556b916b8cb4fb24a9f37462",
  "g5u-02-03": "3a7b9ffcd9d3ad87f958eea91e0204087a73a7a65b53dbb84cd6004a5a18c04e",
  "g5u-02-04": "d446d06127a520468e74eed1cb7cc776c359f704418bf3ef587715175f601f0e",
  "g5u-02-05": "2c11030e21326aaecf4d22e02984cf214169a0024fe0e0803e571d1591cdfe0c",
  "g5u-03-01": "e09eacb2a81215c75e3c68207f68111ebb55df0792b7ab1de0341e5b4c2671b7",
  "g5u-03-02": "76ff934f10cf649e333361684445d972c6d3ce6dee567909c6532db5c7907a75",
  "g5u-03-03": "943e6182b3e8b267d0a23859a607e444da5d1c5d1afb658db5c1166870d080ee",
  "g5u-03-04": "7d20579ded0ca79d48b8f6b0ea91bd5b42581ba52e8e29a232f9de80b7010dfb",
};
const expectedFigures = {
  "g5u-01-01": ["fm-common-denom", "fm-add-unlike"],
  "g5u-01-02": ["fm-common-denom", "fa-multiplier"],
  "g5u-01-03": ["ns-lcm", "ns-lcm"],
  "g5u-01-04": ["fm-common-denom", "fm-common-denom"],
  "g5u-01-05": ["fm-add-unlike", "fa-add-like"],
  "g5u-02-01": ["fm-subtract-unlike", "fm-subtract-unlike"],
  "g5u-02-02": ["fa-add-like", "fa-improper-mixed"],
  "g5u-02-03": ["fa-subtract-like", "fa-mixed-improper"],
  "g5u-02-04": ["fa-mixed-improper", "fa-mixed-improper"],
  "g5u-02-05": ["fa-simplify", "fa-simplify"],
  "g5u-03-01": ["fa-benchmark-half", "fa-compare-benchmark"],
  "g5u-03-02": ["fm-add-unlike", "fm-add-unlike"],
  "g5u-03-03": ["fm-add-unlike", "fm-subtract-unlike"],
  "g5u-03-04": ["ns-lcm", "ns-lcm"],
};
const expectedRemedialRepeats = {
  "g5u-01-01": ["k1", "k3"], "g5u-01-02": ["k1", "k3"], "g5u-01-03": ["k1", "k3"],
  "g5u-01-04": ["k1"], "g5u-01-05": ["k1", "k3"], "g5u-02-01": ["k1", "k2"],
  "g5u-02-02": ["k1"], "g5u-02-03": ["k1"], "g5u-02-04": ["k1", "ch1"],
  "g5u-02-05": ["k1"], "g5u-03-01": ["k1", "k2", "ch1"],
  "g5u-03-02": ["k1", "k3", "ch1"], "g5u-03-03": ["k1", "ch1"], "g5u-03-04": ["k1"],
};
const fractionFigureFunctions = ["NsLcm", "FmCommonDenom", "FmAddUnlike", "FmSubtractUnlike", "FaMultiplier", "FaSimplify", "FaBenchmarkHalf", "FaCompareBenchmark", "FaAddLike", "FaSubtractLike", "FaImproperMixed", "FaMixedImproper"];

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
const normalize = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index];
    if (quoted) {
      if (ch === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
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
    const start = source.indexOf(`function ${name}(`);
    if (start < 0) return "";
    const end = source.indexOf("\nfunction ", start + 1);
    return source.slice(start, end < 0 ? source.length : end).trim();
  }).join("\n---\n");
}
function evaluatorSignature(widget) {
  if (widget.type === "numeric") return stable({ type: widget.type, answer: widget.answer });
  if (widget.type === "mcq") return stable({ type: widget.type, correct: widget.options.filter((option) => option.correct).map((option) => option.id) });
  if (widget.type === "estimateSlider") return stable({ type: widget.type, target: widget.target });
  if (widget.type === "fractionBar") return stable({ type: widget.type, targetNum: widget.targetNum, targetDen: widget.targetDen });
  return stable({ type: widget.type });
}

const errors = [];
for (const file of [candidatePath, coursePath, ledgerPath, cardsPath, queuePath, figuresPath, figureIdsPath, alignmentPath, repairReportPath, focusedTestPath, repairScriptPath]) {
  if (!fs.existsSync(file)) errors.push(`missing required evidence: ${path.relative(root, file)}`);
}
const course = JSON.parse(read(coursePath));
const lessonIds = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = new Map(lessonIds.map((id) => [id, JSON.parse(read(path.join(lessonDir, `${id}.json`)))]));
const authority = loadLessonReviewAuthority(root);
const liveLessons = authority.lessons.filter((entry) => entry.courseId === "unlike-fractions-g5");
const liveById = new Map(liveLessons.map((entry) => [entry.lessonId, entry]));
const records = parseJsonl(candidatePath);
const recordById = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0];
const requiredFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);
const cards = JSON.parse(read(cardsPath)).cards.filter((card) => lessonIds.includes(card.lessonId));
const cardById = new Map(cards.map((card) => [card.lessonId, card]));
const queue = parseCsv(read(queuePath)).filter((row) => lessonIds.includes(row.lesson_id));
const figureIdsSource = read(figureIdsPath);

if (course.id !== "unlike-fractions-g5" || course.gradeLevel !== 5) errors.push("unexpected course identity/grade");
if (lessonIds.length !== 14 || new Set(lessonIds).size !== 14) errors.push("course manifest must contain 14 unique lessons");
if (liveLessons.length !== 14) errors.push(`live authority contains ${liveLessons.length} scoped lessons, expected 14`);
if (records.length !== 14 || new Set(records.map((record) => record.lessonId)).size !== 14) errors.push("candidate must contain 14 unique lesson records");
if (new Set(records.map((record) => record.recordId)).size !== 14) errors.push("candidate record IDs are not unique");
if (!same([...recordById.keys()].sort(), [...lessonIds].sort())) errors.push("candidate lesson set differs from course manifest");
if (sha256(read(candidatePath)) !== expectedHashes.candidate) errors.push("candidate hash changed");
if (sha256(read(coursePath)) !== expectedHashes.course) errors.push("reviewed course manifest hash changed");
if (sha256(read(figureIdsPath)) !== expectedHashes.figureIds) errors.push("registered figure-ID authority hash changed");
if (sha256(read(alignmentPath)) !== expectedHashes.alignment) errors.push("figure/text visibility authority hash changed");
if (sha256(extractFunctions(read(figuresPath), fractionFigureFunctions)) !== expectedHashes.fractionFigureSurface) errors.push("reviewed fraction-figure implementation surface changed");

let conceptFigures = 0, textOnlyRemedials = 0, evaluatorRepeatLessons = 0, gradedSurfaces = 0;
for (const id of lessonIds) {
  const record = recordById.get(id), live = liveById.get(id), lesson = lessons.get(id);
  if (!record || !live || !lesson) continue;
  const fields = new Set(Object.keys(record));
  if (fields.size !== requiredFields.size || [...fields].some((field) => !requiredFields.has(field))) errors.push(`${id}: candidate fields differ from ledger schema`);
  if (record.recordType !== "lesson-disposition" || record.recordId !== `S253-G5U-${id}`) errors.push(`${id}: record identity mismatch`);
  if (record.reviewedBasisHash !== expectedBasis[id] || record.reviewedBasisHash !== live.reviewBasisHash) errors.push(`${id}: candidate is not bound to exact current lesson authority`);
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: expected REVISE/REQUIRED/FIT`);
  if (!schema.contract.allowedLessonDecisions.includes(record.decision) || !schema.contract.allowedVisualDecisions.includes(record.visualDecision) || !schema.contract.allowedGradeLanguageDecisions.includes(record.gradeLanguageDecision)) errors.push(`${id}: decision enum outside schema`);
  if (record.reviewer !== "ChatGPT Work independent assessor (unlike-fractions-g5 S253)") errors.push(`${id}: reviewer mismatch`);
  if (!Number.isFinite(Date.parse(record.reviewedAt))) errors.push(`${id}: invalid timestamp`);
  if (String(record.rationale).length < 300 || String(record.reopenCondition).length < 300) errors.push(`${id}: rationale/reopen condition is not substantive`);
  if (!Array.isArray(record.evidenceRefs) || record.evidenceRefs.length < 10) errors.push(`${id}: evidence references are incomplete`);
  else for (const reference of record.evidenceRefs) if (!fs.existsSync(rel(...evidenceFile(reference).split("/")))) errors.push(`${id}: missing evidence ${reference}`);

  if (lesson.id !== id || lesson.courseId !== course.id) errors.push(`${id}: lesson identity mismatch`);
  const mainIds = lesson.steps.map((step) => step.id);
  const remedialIds = lesson.remedials.flatMap((route) => [route.concept.id, route.check.id]);
  const allIds = [...mainIds, ...remedialIds];
  if (new Set(allIds).size !== allIds.length) errors.push(`${id}: step IDs are not unique across main/remedial routes`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2 || !same(concepts.map((step) => step.figure), expectedFigures[id])) errors.push(`${id}: reviewed concept-figure mapping changed`);
  for (const step of concepts) {
    conceptFigures += 1;
    if (!step.figure || step.figure === "count-on-hops") errors.push(`${id}/${step.id}: missing or generic main figure`);
    if (step.body !== step.narration) errors.push(`${id}/${step.id}: body/narration parity changed`);
    if (!figureIdsSource.includes(JSON.stringify(step.figure))) errors.push(`${id}/${step.id}: figure not registered`);
  }
  const mainWidgets = lesson.steps.filter((step) => step.widget);
  const prompts = mainWidgets.map((step) => step.widget.prompt);
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalize)).size !== prompts.length || new Set(mainWidgets.map((step) => stable(step.widget))).size !== mainWidgets.length) errors.push(`${id}: repaired main-route progression collision returned`);
  const i1 = lesson.steps.find((step) => step.id === "i1"), i2 = lesson.steps.find((step) => step.id === "i2");
  if (!i1?.widget || !i2?.widget || i1.widget.type !== i2.widget.type || i1.widget.prompt === i2.widget.prompt || i2.body !== "Repair the misconception." || !/learner/i.test(i2.widget.prompt)) errors.push(`${id}: misconception-repair interaction changed`);
  if (lesson.remedials.length !== 1) errors.push(`${id}: expected one reviewed remedial route`);
  for (const route of lesson.remedials) {
    if (route.concept.figure) errors.push(`${id}: reviewed text-only remedial premise changed; reassess visual decision`);
    else textOnlyRemedials += 1;
    if (route.concept.body !== route.concept.narration) errors.push(`${id}: remedial body/narration parity changed`);
    const signature = evaluatorSignature(route.check.widget);
    const repeats = mainWidgets.filter((step) => evaluatorSignature(step.widget) === signature).map((step) => step.id);
    if (!same(repeats, expectedRemedialRepeats[id])) errors.push(`${id}: remedial/main evaluator-repeat boundary changed: ${JSON.stringify(repeats)}`);
    else evaluatorRepeatLessons += 1;
  }

  const graded = [...mainWidgets, ...lesson.remedials.map((route) => route.check)];
  gradedSurfaces += graded.length;
  for (const step of graded) {
    const widget = step.widget;
    if (widget.type === "fractionBar" && !(widget.targetNum >= widget.numMin && widget.targetNum <= widget.numMax && widget.targetDen >= widget.denMin && widget.targetDen <= widget.denMax)) errors.push(`${id}/${step.id}: fraction target outside range`);
    if (widget.type === "numeric" && (!Number.isFinite(widget.answer) || (widget.commonErrors ?? []).some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric evaluator collision`);
    if (widget.type === "estimateSlider" && !(widget.target >= widget.min && widget.target <= widget.max && Number.isFinite(widget.acceptFactor))) errors.push(`${id}/${step.id}: estimate target/range invalid`);
    if (widget.type === "mcq") {
      if (widget.options.filter((option) => option.correct).length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length || widget.options.some((option) => !option.feedback)) errors.push(`${id}/${step.id}: MCQ evaluator/feedback invalid`);
    }
  }
}
if (conceptFigures !== 28 || textOnlyRemedials !== 14 || evaluatorRepeatLessons !== 14 || gradedSurfaces !== 98) errors.push(`coverage changed: ${conceptFigures} figures/${textOnlyRemedials} text-only remedials/${evaluatorRepeatLessons} repeat lessons/${gradedSurfaces} graded surfaces`);

const mixed = lessons.get("g5u-02-03");
for (const stepId of ["i1", "i2"]) if (/19\/8|nineteen eighths/i.test(mixed.steps.find((step) => step.id === stepId)?.widget?.prompt ?? "")) errors.push(`g5u-02-03/${stepId}: false whole-mixed target returned`);
const reasonable = lessons.get("g5u-03-02");
for (const stepId of ["i1", "i2"]) if (!/1\/3 is not enough to reach one whole/i.test(reasonable.steps.find((step) => step.id === stepId)?.widget?.highFeedback ?? "")) errors.push(`g5u-03-02/${stepId}: case-specific high feedback changed`);
for (const [lessonId, stepId] of [["g5u-01-05", "k2"], ["g5u-02-01", "k3"], ["g5u-03-02", "k1"], ["g5u-03-02", "k3"]]) {
  const widget = lessons.get(lessonId).steps.find((step) => step.id === stepId).widget;
  const lengths = widget.options.map((option) => option.label.length);
  if (widget.options.length !== 4 || widget.options.filter((option) => option.correct).length !== 1 || Math.max(...lengths) - Math.min(...lengths) > 22 || widget.options.some((option) => /yes because/i.test(option.label))) errors.push(`${lessonId}/${stepId}: repaired choice parity changed`);
}

const cardsFresh = lessonIds.filter((id) => {
  const card = cardById.get(id), live = liveById.get(id);
  return card && live && card.reviewBasisHash === live.reviewBasisHash && card.lessonSourceHash === live.lessonSourceHash;
}).length;
if (cardsFresh !== 0) errors.push(`shared card freshness changed: ${cardsFresh} current cards; candidate binds live authority directly`);
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));
const expectedQueueCounts = { CHOICE_SURFACE_INTEGRITY: 4, GRADE_LANGUAGE_REVIEW: 14, ILLUSTRATION_REPLACEMENT: 28, LESSON_COMPLETE_DISPOSITION: 14, LESSON_PROGRESSION_AND_DUPLICATION: 8, VISUAL_FIRST_REPRESENTATION: 14 };
if (queue.length !== 82 || !same(queueCounts, expectedQueueCounts)) errors.push(`current scoped queue boundary changed: ${queue.length} ${JSON.stringify(queueCounts)}`);

const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions);
const visuals = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions);
const languages = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
if (!same(decisions, { KEEP: 0, REVISE: 14, ESCALATE: 0 })) errors.push(`lesson disposition distribution ${JSON.stringify(decisions)}`);
if (!same(visuals, { REQUIRED: 14, PREFERRED: 0, SUFFICIENT: 0, ESCALATE: 0 })) errors.push(`visual disposition distribution ${JSON.stringify(visuals)}`);
if (!same(languages, { FIT: 14, REVISE: 0, ESCALATE: 0 })) errors.push(`language disposition distribution ${JSON.stringify(languages)}`);

const result = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  lessons: lessonIds.length,
  currentLessonHashesMatched: lessonIds.filter((id) => recordById.get(id)?.reviewedBasisHash === liveById.get(id)?.reviewBasisHash).length,
  sharedCardsFresh: cardsFresh,
  verifiedSourceClosures: { illustrationReplacements: 28, progressionRows: 8, choiceRows: 4, total: 40, lessonWideMisconceptionRepairs: 14, learnerVisibleTruthRepairs: 4 },
  reviewedRuntime: { conceptFigures, gradedSurfaces, evaluatorSeal: "8b35d2905bffc3f060f3653722e4c20f56be47d60233364d3d8a936ba13e4b45" },
  dispositions: decisions,
  visualDispositions: visuals,
  languageDispositions: languages,
  residualSpecializedDebt: { textOnlyRemedials, evaluatorEquivalentRemedialRepeats: evaluatorRepeatLessons },
  currentScopedQueue: { rows: queue.length, distribution: queueCounts },
  expectedQueueEffect: { genericRowsClosedOnAppend: 42, lessonRevisionRowsOpened: 14, immediateNetReduction: 28, staleRepairedSourceRowsClosedOnRefresh: 40, expectedRowsAfterAppendAndSourceRefresh: 14 },
  hashes: expectedHashes,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
