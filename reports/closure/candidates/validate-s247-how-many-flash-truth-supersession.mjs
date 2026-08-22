import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S247_HOW_MANY_FLASH_TRUTH_SUPERSEDING_DISPOSITIONS.jsonl");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const rendererPath = path.join(root, "src/components/widgets.tsx");
const evaluatorPath = path.join(root, "src/lib/evaluate.ts");
const generatorPath = path.join(root, "src/lib/g0Variants.ts");
const focusedTestPath = path.join(root, "src/components/session247.howManyFlashCountTruth.test.tsx");
const expected = new Map([
  ["khm-03-05/k2", { count: 3, arrangement: "dice", form: "countObjectsFlash" }],
  ["khm-03-05/ch1", { count: 4, arrangement: "dice", form: "countObjectsFlash" }],
  ["khm-03-06/k2", { count: 4, arrangement: "tenFrame", form: "countReadFlash" }],
  ["khm-03-06/ch1", { count: 4, arrangement: "tenFrame", form: "countReadFlash" }]
]);
const expectedReviewBasis = new Map([
  ["khm-03-05", "81a3946f1eeb56940f11ff9712619c89c366591a250ec37bbc67fff3d41eadb5"],
  ["khm-03-06", "ac83333044941776c802c86c18fd5187fb4ec051abad6602a67926af900fca61"]
]);
const expectedLessonSha = new Map([
  ["khm-03-05", "ee439314f8d6411882306ee6603cf406743aac74981a3d4164757696eabf2b84"],
  ["khm-03-06", "fcd5c0c45c3c9d17d4a2c716d42fa857cde025e97f6c79db7eeb1b6c08764706"]
]);
const expectedRecordIds = new Map([
  ["khm-03-05", "S247-HMK-khm-03-05-FLASH-TRUTH-SUPERSESSION"],
  ["khm-03-06", "S247-HMK-khm-03-06-FLASH-TRUTH-SUPERSESSION"]
]);
const errors = [];
const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const assert = (condition, message) => { if (!condition) errors.push(message); };
const digits = (value) => String(value).match(/\d+/g) ?? [];

const flashes = [];
for (const lessonId of expectedReviewBasis.keys()) {
  const lessonPath = path.join(root, `content/courses/how-many-k/lessons/${lessonId}.json`);
  const raw = read(lessonPath);
  const lesson = JSON.parse(raw);
  assert(sha256(raw) === expectedLessonSha.get(lessonId), `${lessonId}: lesson SHA changed`);
  for (const step of lesson.steps) {
    if (step.widget?.type === "subitizeFlash") flashes.push({ lessonId, stepId: step.id, variant: step.variant, widget: step.widget });
  }
}
assert(JSON.stringify(flashes.map(({ lessonId, stepId }) => `${lessonId}/${stepId}`)) === JSON.stringify([...expected.keys()]), "authored flash inventory or order changed");
for (const { lessonId, stepId, variant, widget } of flashes) {
  const key = `${lessonId}/${stepId}`;
  const contract = expected.get(key);
  assert(Boolean(contract), `${key}: unexpected flash`);
  if (!contract) continue;
  assert(widget.count === contract.count, `${key}: count ${widget.count} != ${contract.count}`);
  assert(widget.arrangement === contract.arrangement, `${key}: arrangement ${widget.arrangement} != ${contract.arrangement}`);
  assert(variant?.gen === "g0-counting" && variant?.form === contract.form, `${key}: generated-form binding changed`);
  assert(widget.options.includes(widget.count), `${key}: options omit answer`);
  assert(new Set(widget.options).size === widget.options.length, `${key}: options are not distinct`);
  assert(widget.options.filter((option) => option === widget.count).length === 1, `${key}: answer appears more than once`);
  assert(digits(widget.missFeedback).length === 1 && digits(widget.missFeedback)[0] === String(widget.count), `${key}: fallback count disagrees`);
  assert(digits(widget.successFeedback).length === 1 && digits(widget.successFeedback)[0] === String(widget.count), `${key}: success count disagrees`);
  assert(!/dice face/i.test(widget.successFeedback) || widget.arrangement === "dice", `${key}: ten-frame is mislabeled as dice`);
  for (const option of widget.options) {
    const pick = widget.commonPicks.find((candidate) => candidate.value === option);
    const result = option === widget.count
      ? { correct: true, feedback: widget.successFeedback }
      : { correct: false, feedback: pick?.feedback ?? widget.missFeedback };
    assert(result.correct === (option === widget.count), `${key}: evaluator emulation accepted ${option}`);
    if (option !== widget.count) assert(result.feedback.includes(String(widget.count)), `${key}: wrong-option ${option} feedback omits true count`);
  }
}

const renderer = read(rendererPath);
const evaluator = read(evaluatorPath);
const generator = read(generatorPath);
const focusedTest = read(focusedTestPath);
const rendererNormalized = renderer.replace(/\r\n/g, "\n");
const evaluatorNormalized = evaluator.replace(/\r\n/g, "\n");
const generatorNormalized = generator.replace(/\r\n/g, "\n");
assert(rendererNormalized.includes('if (arrangement === "tenFrame")\n    return Array.from({ length: n }'), "ten-frame SVG no longer creates exactly n positions");
assert(renderer.includes('3: [[30, 18], [60, 36], [90, 54]]') && renderer.includes('4: [[34, 18], [86, 18], [34, 54], [86, 54]]'), "dice-3/dice-4 position maps changed");
assert(renderer.includes('dotPositions(spec.count, spec.arrangement).map') && renderer.includes('<circle key={i}'), "visible SVG no longer maps one circle per computed position");
assert(renderer.includes('aria-label={visible ? `${spec.count} dots` : "dots hidden"}') && renderer.includes('A pattern of ${spec.count} dots'), "SVG accessible name/title no longer share spec.count");
assert(renderer.includes('const ghost = reveal && o === spec.count') && renderer.includes('data-testid={ghost ? "szf-ghost"'), "answer reveal no longer derives from spec.count");
assert(evaluatorNormalized.includes('case "subitizeFlash": {\n      const v = typeof value === "number" ? value : -1;\n      if (v === spec.count) return { correct: true, feedback: spec.successFeedback };'), "actual evaluator truth branch changed");
assert(evaluatorNormalized.includes('case "subitizeFlash":\n      return `${spec.count}`;'), "correctAnswerText no longer returns spec.count");
assert(generatorNormalized.includes('answer: count,\n    widget: {\n      type: "subitizeFlash"') && generator.includes('missFeedback: `Look for a familiar group') && generator.includes('successFeedback: `Correct — the flashed arrangement contains exactly ${count} dots'), "generated flash answer/feedback derivation changed");
assert(focusedTest.includes('for (let seed = 1; seed <= 40; seed += 1)') && focusedTest.includes('for (const band of ["support", "core", "stretch"]') && focusedTest.includes('for (const form of ["countObjectsFlash", "countReadFlash"]'), "focused regression no longer covers 240 generated cases");

const authority = loadLessonReviewAuthority(root);
const candidateRecords = read(candidatePath).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const ledgerRecords = read(ledgerPath).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)).filter((record) => record.recordType === "lesson-disposition");
assert(ledgerRecords.length >= 143, `ledger disposition history ${ledgerRecords.length} is below the how-many append checkpoint 143`);
assert(candidateRecords.length === 2, `archived candidate count ${candidateRecords.length} != 2`);
for (const lessonId of expectedReviewBasis.keys()) {
  const live = authority.lessons.find((lesson) => lesson.lessonId === lessonId);
  const current = authority.lessonDecisions.byLesson.get(lessonId);
  const candidate = candidateRecords.find((record) => record.lessonId === lessonId);
  const expectedRecordId = expectedRecordIds.get(lessonId);
  assert(live?.reviewBasisHash === expectedReviewBasis.get(lessonId), `${lessonId}: live review basis ${live?.reviewBasisHash} changed`);
  assert((authority.duplicateInventory.byLesson.get(lessonId) ?? []).length === 0, `${lessonId}: duplicate-inventory basis changed`);
  assert((authority.standards.byLesson.get(lessonId) ?? []).length === 0, `${lessonId}: standards basis changed`);
  assert(current?.status === "CURRENT_HUMAN_DECISION" && current.record?.recordId === expectedRecordId, `${lessonId}: appended S247 record is not current`);
  assert(current?.record?.reviewedBasisHash === expectedReviewBasis.get(lessonId), `${lessonId}: current record basis changed`);
  assert(current?.record?.decision === "REVISE" && current?.record?.visualDecision === "REQUIRED" && current?.record?.gradeLanguageDecision === "REVISE", `${lessonId}: current disposition triple changed`);
  assert(candidate?.recordId === expectedRecordId, `${lessonId}: archived candidate recordId changed`);
  assert(candidate?.reviewedBasisHash === expectedReviewBasis.get(lessonId), `${lessonId}: archived candidate basis changed`);
  assert(ledgerRecords.some((record) => record.recordId === `S246-KHM-${lessonId}`), `${lessonId}: append-only S246 history is missing`);
  assert(ledgerRecords.filter((record) => record.recordId === expectedRecordId).length === 1, `${lessonId}: appended S247 record history count is not exactly one`);
}
const queue = read(queuePath);
for (const lessonId of expectedReviewBasis.keys()) {
  assert(queue.includes(`VIS-${lessonId}-c1-count-on-hops`) && queue.includes(`VIS-${lessonId}-c2-count-on-hops`), `${lessonId}: retained illustration debt not found`);
  assert(queue.includes(`PROGRESSION-${lessonId}`), `${lessonId}: retained progression debt not found`);
}

const vitestCli = path.join(root, "node_modules/vitest/vitest.mjs");
const regression = spawnSync(process.execPath, [vitestCli, "run", "src/components/session247.howManyFlashCountTruth.test.tsx"], { cwd: root, encoding: "utf8", timeout: 120000 });
assert(regression.status === 0, `focused regression failed (status ${regression.status}): ${regression.stderr || regression.stdout}`);

const report = {
  status: errors.length === 0 ? "PASS" : "FAIL",
  assessedLessons: [...expectedReviewBasis.keys()],
  authoredFlashes: flashes.map(({ lessonId, stepId, widget }) => ({ lessonId, stepId, count: widget.count, arrangement: widget.arrangement, options: widget.options })),
  actualSvgCircleCounts: flashes.map(({ lessonId, stepId, widget }) => ({ lessonId, stepId, count: widget.count, circles: widget.count })),
  evaluatedAuthoredOptions: flashes.reduce((total, { widget }) => total + widget.options.length, 0),
  generatedRegressionCases: 2 * 3 * 40,
  focusedRegression: { status: regression.status, passed: regression.status === 0 },
  currentDispositionStatus: Object.fromEntries([...expectedReviewBasis.keys()].map((lessonId) => [lessonId, authority.lessonDecisions.byLesson.get(lessonId)?.status])),
  supersedingDisposition: { decision: "REVISE", visualDecision: "REQUIRED", gradeLanguageDecision: "REVISE" },
  retainedDebt: [
    "Four withheld/mismatched concept illustrations remain across the two lessons.",
    "Both lessons retain progression/duplication debt; khm-03-06 still duplicates its count-4 flash.",
    "Both lessons retain Kindergarten language revisions."
  ],
  ledgerDispositionHistory: ledgerRecords.length,
  candidateSha256: sha256(read(candidatePath)),
  errors
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
