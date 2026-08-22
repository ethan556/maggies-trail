import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";


const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S247_TI_DOMAIN_TRUTH_SUPERSEDING_DISPOSITIONS.jsonl");

const figurePath = path.join(root, "src/components/figures.tsx");
const widgetPath = path.join(root, "src/components/widgets.tsx");
const evaluatorPath = path.join(root, "src/lib/evaluate.ts");
const testPath = path.join(root, "src/lib/session247.trigIdentityDomainTruth.test.ts");
const lessons = Object.fromEntries(["ti-02-03", "ti-04-03"].map((id) => [id, JSON.parse(fs.readFileSync(path.join(root, "content/courses/trig-identities-equations/lessons", `${id}.json`), "utf8"))]));
const expected = {
  "ti-02-03": { basis: "cc4fe5e5eca0c428f04aba76f6aca7b4c52f1163cb008ade9363b575e0f878e6", recordId: "S247-TI-ti-02-03-DOMAIN-SUPERSESSION", triple: ["REVISE", "PREFERRED", "REVISE"] },
  "ti-04-03": { basis: "9ef2282d8356194b354fb6e23265832b466bb02a34dd9bdb1265e1c8288f4496", recordId: "S247-TI-ti-04-03-DOMAIN-SUPERSESSION", triple: ["REVISE", "PREFERRED", "FIT"] },
};
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const close = (actual, expectedValue, epsilon = 1e-10) => Math.abs(actual - expectedValue) <= epsilon;
const step = (lesson, id) => lesson.steps.find((candidate) => candidate.id === id);
const text = (value) => typeof value === "string" ? value : Array.isArray(value) ? value.map(text).join(" ") : value && typeof value === "object" ? Object.values(value).map(text).join(" ") : "";
const definedQuotient = (numerator, denominator) => Math.abs(denominator) < 1e-10 ? undefined : numerator / denominator;

// Independent allowed-input evaluations for every cancellation family.
const a = 0.7;
const s = Math.sin(a), c = Math.cos(a);
assert(close((s / c) * c, s), "tan(theta)*cos(theta) does not reduce to sin(theta) on cos(theta)!=0");
assert(close((1 - c ** 2) / s, s), "(1-cos^2(theta))/sin(theta) does not reduce to sin(theta) on sin(theta)!=0");
assert(close(((1 / c) ** 2 - 1) / (s / c), s / c), "(sec^2(theta)-1)/tan(theta) does not reduce to tan(theta) on the common domain");
assert(close((c / s) * s, c), "cot(theta)*sin(theta) does not reduce to cos(theta) on sin(theta)!=0");
assert(close((1 / c) * c, 1), "sec(theta)*cos(theta) does not reduce to 1 on cos(theta)!=0");
assert(close(Math.sin(2 * a) / s, 2 * c), "sin(2theta)/sin(theta) does not reduce to 2cos(theta) on sin(theta)!=0");
assert(close(Math.sin(2 * a) / c, 2 * s), "sin(2theta)/cos(theta) does not reduce to 2sin(theta) on cos(theta)!=0");
assert(close(Math.cos(2 * a) / (c - s), c + s), "cos(2theta)/(cos(theta)-sin(theta)) does not factor on its common domain");

// Representative excluded inputs: original undefined while reduced expression remains finite.
assert(definedQuotient(Math.sin(Math.PI), Math.sin(0)) === undefined && Number.isFinite(2 * Math.cos(0)), "sin(2theta)/sin(theta) exclusion at theta=0 failed");
assert(definedQuotient(Math.sin(Math.PI), Math.cos(Math.PI / 2)) === undefined && Number.isFinite(2 * Math.sin(Math.PI / 2)), "sin(2theta)/cos(theta) exclusion at theta=pi/2 failed");
assert(definedQuotient(Math.cos(Math.PI / 2), Math.cos(Math.PI / 4) - Math.sin(Math.PI / 4)) === undefined && Number.isFinite(Math.SQRT2), "difference-of-squares quotient exclusion at theta=pi/4 failed");

const t0203 = text(lessons["ti-02-03"]);
for (const phrase of ["common domain cos θ ≠ 0", "sin θ ≠ 0 and cos θ ≠ 0", "original quotient is undefined", "cannot remove domain restrictions"]) assert(t0203.includes(phrase), `ti-02-03 missing ${phrase}`);
const t0403 = text(lessons["ti-04-03"]);
for (const phrase of ["common domain sin θ ≠ 0", "common domain cos θ ≠ 0", "common domain cos θ − sin θ ≠ 0", "never divide by sin x", "excluded values remain excluded"]) assert(t0403.includes(phrase), `ti-04-03 missing ${phrase}`);

// Independently solve both equation families.
const sinRoots = [0, Math.PI / 3, Math.PI, 5 * Math.PI / 3];
assert(sinRoots.every((x) => close(Math.sin(2 * x), Math.sin(x))), "sin(2x)=sin(x) root set contains a false root");
assert(close(sinRoots.reduce((sum, x) => sum + x, 0), 3 * Math.PI), "sin(2x)=sin(x) roots do not sum to 3pi");
const cosRoots = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
assert(cosRoots.every((x) => close(Math.cos(2 * x), Math.cos(x))), "cos(2x)=cos(x) root set contains a false root");
assert(close(cosRoots.reduce((sum, x) => sum + x, 0), 2 * Math.PI), "cos(2x)=cos(x) roots do not sum to 2pi");

// Retained debt must remain aligned with the exact current dispositions.
const k1Options = step(lessons["ti-02-03"], "k1").widget.options;
assert(k1Options.find((option) => option.correct)?.label.includes("proof is complete"), "ti-02-03 k1 cue changed; disposition must be reconsidered");
const figuresRaw = fs.readFileSync(figurePath, "utf8");
const doubleFigure = figuresRaw.slice(figuresRaw.indexOf("function TiDoubleProve"), figuresRaw.indexOf("function TiExpandMixed"));
assert(doubleFigure.includes("sin 2θ / sin θ = 2 cos θ") && doubleFigure.includes("only where sin θ ≠ 0") && doubleFigure.includes("Inputs where sine theta is zero remain excluded"), "TiDoubleProve common-domain visual/accessibility contract changed");
const challenge = step(lessons["ti-04-03"], "ch1").widget;
const feedback419 = challenge.commonErrors.find((item) => close(item.value, 4.19))?.feedback ?? "";
assert(feedback419.includes("counts only one") && feedback419.includes("2π/3 and 4π/3") && feedback419.includes("2π ≈ 6.28") && !feedback419.includes("4.19 ≈ 2π/3 + 4π/3"), "ti-04-03 4.19 misconception feedback changed");

const widgetRaw = fs.readFileSync(widgetPath, "utf8");
const evaluatorRaw = fs.readFileSync(evaluatorPath, "utf8");
assert(widgetRaw.includes("function UnitCircleExploreW") && widgetRaw.includes("ucGhostPoint(angle, spec.ghost"), "assessed unit-circle ghost renderer changed");
assert(evaluatorRaw.includes("UC_TRUE_FORMULAS.has(chosen.id)"), "assessed unit-circle ghost evaluator changed");
const testRaw = fs.readFileSync(testPath, "utf8");
for (const marker of ["Lesson.parse", "lintLesson", "WidgetSpec.parse", "widgetIntegrityErrors", "rejects the former unrestricted-cancellation claim"]) assert(testRaw.includes(marker), `focused test missing ${marker}`);
assert(testRaw.includes("TiDoubleProve") && testRaw.includes("4.19") && testRaw.includes("counts only one") && testRaw.includes("Inputs where sine theta is zero remain excluded"), "focused regression does not ratchet the repaired figure and challenge feedback");

const candidateRecords = fs.readFileSync(candidatePath, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
assert(candidateRecords.length === 2, `candidate record count ${candidateRecords.length} != 2`);
const candidateByLesson = new Map(candidateRecords.map((record) => [record.lessonId, record]));
assert(candidateByLesson.size === 2, "candidate lessons are not unique");

const authority = loadLessonReviewAuthority(root);
assert(authority.lessonDecisions.summary.historyRecordCount === 146, `ledger history ${authority.lessonDecisions.summary.historyRecordCount} != 146`);
assert(authority.lessonDecisions.summary.currentCount === 140, `current decision count ${authority.lessonDecisions.summary.currentCount} != 140`);
assert(authority.lessonDecisions.summary.staleCount === 0, `stale decision count ${authority.lessonDecisions.summary.staleCount} != 0`);
for (const [id, contract] of Object.entries(expected)) {
  const live = authority.lessons.find((lesson) => lesson.lessonId === id);
  const current = authority.lessonDecisions.byLesson.get(id);
  const candidate = candidateByLesson.get(id);
  assert(live?.reviewBasisHash === contract.basis, `${id} live basis ${live?.reviewBasisHash} != ${contract.basis}`);
  assert(current?.status === "CURRENT_HUMAN_DECISION", `${id} does not resolve CURRENT_HUMAN_DECISION`);
  assert(current?.record?.recordId === contract.recordId, `${id} current recordId ${current?.record?.recordId} != ${contract.recordId}`);
  assert(Boolean(candidate), `${id} candidate is missing`);
  if (candidate) {
    assert(candidate.recordId === contract.recordId, `${id} candidate recordId changed`);
    assert(candidate.reviewedBasisHash === contract.basis, `${id} candidate basis changed`);
    assert(JSON.stringify([candidate.decision, candidate.visualDecision, candidate.gradeLanguageDecision]) === JSON.stringify(contract.triple), `${id} candidate disposition triple changed`);
    assert(JSON.stringify(current?.record) === JSON.stringify(candidate), `${id} authoritative record is not exact-equal to the isolated candidate`);
  }
  assert((authority.duplicateInventory.byLesson.get(id) ?? []).length === 0, `${id} exact-MCQ duplicate basis changed`);
  assert((authority.standards.byLesson.get(id) ?? []).length === 6, `${id} standards-edge basis is not six candidate edges`);
}

const report = {
  status: errors.length ? "FAIL" : "PASS",
  currentBasis: Object.fromEntries(Object.entries(expected).map(([id, contract]) => [id, contract.basis])),
  dispositions: Object.fromEntries(Object.entries(expected).map(([id, contract]) => [id, contract.triple])),
  verifiedDomains: 8,
  equationFamiliesRecomputed: 2,
  retainedDebt: {
    "ti-02-03": ["k1 correctness cue", "domain not represented by proof figures/ghost", "structured math and runtime accessibility"],
    "ti-04-03": ["proof figure remains a textual equation rather than a stepwise domain visual", "structured math and runtime accessibility"],
  },
  authority: { ...authority.lessonDecisions.summary, exactCurrentCandidateMatches: 2 },
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
