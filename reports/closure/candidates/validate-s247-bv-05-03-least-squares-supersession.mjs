import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S247_BV_05_03_LEAST_SQUARES_SUPERSEDING_DISPOSITION.jsonl");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const lessonPath = path.join(root, "content/courses/bivariate-statistics/lessons/bv-05-03.json");
const evaluatorPath = path.join(root, "src/lib/evaluate.ts");
const rendererPath = path.join(root, "src/components/widgets.tsx");
const describePath = path.join(root, "src/lib/describeState.ts");
const testPath = path.join(root, "src/lib/session247.bivariateLeastSquaresTruth.test.ts");
const expectedBasisHash = "f83a2f830c2e5527ac68ef305bf7c2044581b4e7f7cd821f79c8f282d49ff7f2";
const expectedRecordId = "S247-BV-bv-05-03-OLS-SUPERSESSION";
const epsilon = 1e-12;
const errors = [];
const read = (file) => fs.readFileSync(file, "utf8");
const close = (actual, expected) => Math.abs(actual - expected) <= epsilon;
const assert = (condition, message) => { if (!condition) errors.push(message); };

const lesson = JSON.parse(read(lessonPath));
const interactive = lesson.steps.find((step) => step.id === "i1")?.widget;
assert(interactive?.type === "scatterFit", "bv-05-03/i1 is not scatterFit");
const points = interactive?.points ?? [];
const meanX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
const meanY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
const sxx = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
const sxy = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
const slope = sxy / sxx;
const intercept = meanY - slope * meanX;
const residuals = points.map(([x, y]) => y - (slope * x + intercept));
const residualSum = residuals.reduce((sum, residual) => sum + residual, 0);
const sse = residuals.reduce((sum, residual) => sum + residual ** 2, 0);
const mse = sse / points.length;
const shiftedResiduals = points.map(([x, y]) => y - (slope * x + intercept + 0.7));
const shiftedSse = shiftedResiduals.reduce((sum, residual) => sum + residual ** 2, 0);
assert(close(slope, 1.9), `OLS slope ${slope} != 1.9`);
assert(close(intercept, 1.5), `OLS intercept ${intercept} != 1.5`);
[-0.4, 0.7, -0.2, -0.1].forEach((expected, index) => assert(close(residuals[index], expected), `residual ${index} ${residuals[index]} != ${expected}`));
assert(close(residualSum, 0), `signed residual sum ${residualSum} != 0`);
assert(close(sse, 0.7), `SSE ${sse} != 0.70`);
assert(close(mse, 0.175), `MSE ${mse} != 0.175`);
[-1.1, 0, -0.9, -0.8].forEach((expected, index) => assert(close(shiftedResiduals[index], expected), `shifted residual ${index} ${shiftedResiduals[index]} != ${expected}`));
assert(close(shiftedSse, 2.66), `shifted SSE ${shiftedSse} != 2.66`);

const accepted = [];
let nearestRejectedMse = Infinity;
for (let m10 = Math.round(interactive.mMin * 10); m10 <= Math.round(interactive.mMax * 10); m10 += Math.round(interactive.mStep * 10)) {
  for (let b10 = Math.round(interactive.bMin * 10); b10 <= Math.round(interactive.bMax * 10); b10 += Math.round(interactive.bStep * 10)) {
    const m = m10 / 10;
    const b = b10 / 10;
    const candidateMse = points.reduce((sum, [x, y]) => sum + (y - (m * x + b)) ** 2, 0) / points.length;
    if (candidateMse <= interactive.tolerance) accepted.push({ m, b, mse: candidateMse });
    else nearestRejectedMse = Math.min(nearestRejectedMse, candidateMse);
  }
}
assert(JSON.stringify(accepted.map(({ m, b }) => [m, b])) === JSON.stringify([[1.9, 1.5]]), `accepted lattice is ${JSON.stringify(accepted)}`);
assert(close(nearestRejectedMse, 0.185), `nearest rejected MSE ${nearestRejectedMse} != 0.185`);
assert(close(interactive.tolerance, 0.176), `tolerance ${interactive.tolerance} != 0.176`);

const k1 = lesson.steps.find((step) => step.id === "k1")?.widget;
const k2 = lesson.steps.find((step) => step.id === "k2")?.widget;
assert(k1?.answer === 0 && k1?.tolerance === 0, "k1 does not require the exact signed sum 0");
assert(k2?.options?.filter((option) => option.correct).length === 1, "k2 does not have exactly one correct option");
assert(k2?.options?.find((option) => option.correct)?.id === "no", "k2 correct option is not no");
assert(k2?.prompt === "Raise the fitted line by 0.7 so it hits (2, 6). What happens to the sum of squared residuals?", "k2 stem changed from the assessed clear form");
const scoredMcqs = lesson.steps.filter((step) => step.widget?.type === "mcq").map((step) => ({ id: step.id, lengths: step.widget.options.map((option) => option.label.length) }));
assert(scoredMcqs.every(({ lengths }) => Math.max(...lengths) - Math.min(...lengths) <= 19), `scored option length spread exceeds assessed bound: ${JSON.stringify(scoredMcqs)}`);
const lessonRaw = read(lessonPath);
assert(!lessonRaw.includes("data was invented") && !lessonRaw.includes("essentially balanced"), "retired false language remains");

const evaluatorRaw = read(evaluatorPath);
const rendererRaw = read(rendererPath);
const describeRaw = read(describePath);
const testRaw = read(testPath);
assert(evaluatorRaw.includes("const mse = spec.points.reduce") && evaluatorRaw.includes("if (mse <= spec.tolerance)"), "actual scatterFit evaluator no longer uses MSE threshold");
assert(rendererRaw.includes("{/* residuals — the thing being minimized, made visible */}"), "scatterFit residual whiskers are missing");
assert(rendererRaw.includes('aria-label="line slope"') && rendererRaw.includes('aria-label="line intercept"'), "keyboard slider labels are missing");
assert(rendererRaw.includes("prefers-reduced-motion: no-preference"), "reduced-motion guard is missing");
assert(rendererRaw.includes(">miss = {fmt(mse)}</span>"), "assessed ambiguous MSE readout is no longer present; disposition must be reconsidered");
assert(rendererRaw.includes("Scatter with a trend line, y equals") && !rendererRaw.includes("mean squared residual ${fmt(mse)}"), "assessed SVG metric-description gap changed; disposition must be reconsidered");
const scatterDescription = describeRaw.slice(describeRaw.indexOf('case "scatterFit"'), describeRaw.indexOf('case "angleMeasure"'));
assert(scatterDescription.includes("Your fit line is y =") && !/residual|squared|MSE|mean squared/i.test(scatterDescription), "assessed nonvisual state gap changed; disposition must be reconsidered");
assert(testRaw.includes("makes the exact least-squares line the only accepted slider state") && testRaw.includes('expect(accepted).toEqual(["1.9|1.5"])') && testRaw.includes("2.66"), "focused mathematical regression is incomplete");

const authority = loadLessonReviewAuthority(root);
const liveLesson = authority.lessons.find((record) => record.lessonId === "bv-05-03");
const currentDisposition = authority.lessonDecisions.byLesson.get("bv-05-03");
assert(liveLesson?.reviewBasisHash === expectedBasisHash, `live review basis ${liveLesson?.reviewBasisHash} != ${expectedBasisHash}`);
assert((authority.duplicateInventory.byLesson.get("bv-05-03") ?? []).length === 0, "live exact-MCQ duplicate basis is not empty");
assert((authority.standards.byLesson.get("bv-05-03") ?? []).length === 0, "live standards-edge basis is not empty");
assert(authority.lessonDecisions.summary.historyRecordCount >= 141, `ledger history ${authority.lessonDecisions.summary.historyRecordCount} is below the BV append checkpoint 141`);
assert(authority.lessonDecisions.summary.duplicateRecordIdCount === 0, "authoritative ledger has duplicate record IDs");
assert(authority.lessonDecisions.summary.invalidCount === 0, "authoritative ledger has invalid or unknown records");
assert(currentDisposition?.status === "CURRENT_HUMAN_DECISION", `S247 disposition is ${currentDisposition?.status ?? "missing"}, not CURRENT_HUMAN_DECISION`);
assert(currentDisposition?.record?.recordId === expectedRecordId, `current record ${currentDisposition?.record?.recordId} != ${expectedRecordId}`);

const candidateLines = read(candidatePath).split(/\r?\n/).filter((line) => line.trim());
assert(candidateLines.length === 1, `candidate file contains ${candidateLines.length} records, not 1`);
let candidate;
try { candidate = JSON.parse(candidateLines[0]); }
catch (error) { errors.push(`candidate JSON is invalid: ${error.message}`); }
assert(candidate?.recordId === expectedRecordId, `recordId ${candidate?.recordId} != ${expectedRecordId}`);
assert(candidate?.reviewedBasisHash === expectedBasisHash, "candidate is not sealed to the live basis");
assert(candidate?.decision === "REVISE" && candidate?.visualDecision === "REQUIRED" && candidate?.gradeLanguageDecision === "FIT", "candidate disposition triple changed");
assert(JSON.stringify(candidate) === JSON.stringify(currentDisposition?.record), "candidate record differs from the authoritative current ledger record");

const ledgerRecords = read(ledgerPath).split(/\r?\n/).filter((line) => line.trim()).map((line) => JSON.parse(line));
const supersededRecord = ledgerRecords.find((record) => record.recordId === "S246-BV-bv-05-03");
assert(supersededRecord?.decision === "ESCALATE" && supersededRecord?.reviewedBasisHash !== expectedBasisHash, "superseded S246 ESCALATE history is missing or not stale to the live basis");

const report = {
  status: errors.length === 0 ? "PASS" : "FAIL",
  lessonId: "bv-05-03",
  currentReviewBasisHash: liveLesson?.reviewBasisHash,
  currentDispositionStatus: currentDisposition?.status,
  currentRecordId: currentDisposition?.record?.recordId,
  supersededRecordId: supersededRecord?.recordId,
  disposition: candidate ? { decision: candidate.decision, visualDecision: candidate.visualDecision, gradeLanguageDecision: candidate.gradeLanguageDecision } : null,
  ols: { meanX, meanY, sxx, sxy, slope, intercept, residuals, residualSum, sse, mse },
  shiftedUpByPointSevenResiduals: { deltaIntercept: 0.7, residuals: shiftedResiduals, sse: shiftedSse },
  lattice: { mStep: interactive?.mStep, bStep: interactive?.bStep, tolerance: interactive?.tolerance, accepted, nearestRejectedMse },
  choiceLengths: scoredMcqs,
  retainedImplementationDebt: [
    "ScatterFitW labels the scored mean squared residual only as 'miss', while lesson feedback names SSE.",
    "The scatter SVG and describeState path do not communicate residual magnitudes or the scored fit metric nonvisually."
  ],
  authoritativeLedger: authority.lessonDecisions.summary,
  errors
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
