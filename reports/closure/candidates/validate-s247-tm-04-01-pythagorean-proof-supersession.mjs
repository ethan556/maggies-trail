import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S247_TM_04_01_PYTHAGOREAN_PROOF_SUPERSEDING_DISPOSITION.jsonl");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const lessonPath = path.join(root, "content/courses/transformations-measurement/lessons/tm-04-01.json");
const figuresPath = path.join(root, "src/components/figures.tsx");
const widgetsPath = path.join(root, "src/components/widgets.tsx");
const schemaPath = path.join(root, "src/lib/schema.ts");
const evaluatorPath = path.join(root, "src/lib/evaluate.ts");
const testPath = path.join(root, "src/components/session247.pythagoreanRearrangementProof.test.tsx");
const expectedBasisHash = "8a903ada53617b727c8f922e61890edf616a47fdf3117dfe0e241bc477d1f82a";
const expectedRecordId = "S247-TM-tm-04-01-PYTHAGOREAN-PROOF-SUPERSESSION";
const errors = [];
const read = (file) => fs.readFileSync(file, "utf8");
const assert = (condition, message) => { if (!condition) errors.push(message); };
const close = (actual, expected, epsilon = 1e-9) => Math.abs(actual - expected) <= epsilon;
const getStep = (lesson, id) => lesson.steps.find((step) => step.id === id);
const point = (pair) => pair.split(",").map(Number);
const polygonPoints = (tag) => {
  const raw = tag.match(/points="([^"]+)"/)?.[1];
  if (!raw) return [];
  return raw.trim().split(/\s+/).map(point);
};
const distance2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const polygonArea = (vertices) => Math.abs(vertices.reduce((sum, vertex, index) => {
  const next = vertices[(index + 1) % vertices.length];
  return sum + vertex[0] * next[1] - vertex[1] * next[0];
}, 0)) / 2;
const numberAttribute = (tag, name) => {
  const match = tag.match(new RegExp(`${name}=(?:\\{(-?\\d+(?:\\.\\d+)?)\\}|"(-?\\d+(?:\\.\\d+)?)")`));
  return Number(match?.[1] ?? match?.[2]);
};
const groupBody = (source, name) => source.match(new RegExp(`<g data-arrangement="${name}">([\\s\\S]*?)<\\/g>`))?.[1] ?? "";

const lesson = JSON.parse(read(lessonPath));
const figuresRaw = read(figuresPath);
const figureStart = figuresRaw.indexOf("function PythagoreanProof()");
const figureEnd = figuresRaw.indexOf("\nfunction ", figureStart + 1);
const figure = figureStart >= 0 ? figuresRaw.slice(figureStart, figureEnd > figureStart ? figureEnd : undefined) : "";
assert(figureStart >= 0, "PythagoreanProof function is missing");
assert(figure.includes('role="img"') && figure.includes('aria-label="General rearrangement proof:'), "proof figure lacks its assessed role/aria label");
assert(figure.includes("<title>General rearrangement proof of the Pythagorean theorem</title>"), "proof title changed");
assert(figure.includes("<desc>Two equal outer squares each have side length a plus b"), "detailed proof description changed");
for (const phrase of ["same four congruent right triangles", "remaining region is a square of area c squared", "a squared plus b squared equals c squared"]) {
  assert(figure.includes(phrase), `accessible proof narration is missing: ${phrase}`);
}

const left = groupBody(figure, "c-squared");
const right = groupBody(figure, "a-squared-plus-b-squared");
assert(left.length > 0 && right.length > 0, "one or both proof arrangements are missing");
const arrangements = [left, right];
const outerSquares = arrangements.map((body) => body.match(/<rect[^>]+data-shape="outer-square"[^>]*\/>/)?.[0] ?? "");
for (const [index, outer] of outerSquares.entries()) {
  const width = numberAttribute(outer, "width");
  const height = numberAttribute(outer, "height");
  assert(width === 110 && height === 110, `arrangement ${index + 1} outer region is ${width} by ${height}, not 110 by 110`);
  assert(outer.includes('data-side="a+b"'), `arrangement ${index + 1} outer side is not marked a+b`);
}

const allPolygonTags = arrangements.flatMap((body) => [...body.matchAll(/<polygon[\s\S]*?\/>/g)].map((match) => match[0]));
const cTag = allPolygonTags.find((tag) => tag.includes('data-area="c²"')) ?? "";
const triangleTags = allPolygonTags.filter((tag) => !tag.includes('data-area="c²"'));
assert(triangleTags.length === 8, `displayed right-triangle count ${triangleTags.length} != 8`);
const triangleAreas = [];
for (const [index, tag] of triangleTags.entries()) {
  const vertices = polygonPoints(tag);
  assert(vertices.length === 3, `polygon ${index + 1} is not a triangle`);
  const sideSquares = [distance2(vertices[0], vertices[1]), distance2(vertices[1], vertices[2]), distance2(vertices[2], vertices[0])].sort((a, b) => a - b);
  assert(JSON.stringify(sideSquares) === JSON.stringify([42 ** 2, 68 ** 2, 42 ** 2 + 68 ** 2]), `triangle ${index + 1} side squares ${JSON.stringify(sideSquares)} are not the 42-68-c triple`);
  triangleAreas.push(polygonArea(vertices));
}
assert(triangleAreas.every((area) => area === 42 * 68 / 2), `triangle areas are not all ab/2: ${JSON.stringify(triangleAreas)}`);

const cVertices = polygonPoints(cTag);
assert(cVertices.length === 4, "c-squared remainder is not a quadrilateral");
const cSideSquares = cVertices.map((vertex, index) => distance2(vertex, cVertices[(index + 1) % cVertices.length]));
assert(cSideSquares.every((value) => value === 42 ** 2 + 68 ** 2), `c remainder side squares are ${JSON.stringify(cSideSquares)}`);
for (let index = 0; index < cVertices.length; index += 1) {
  const before = cVertices[(index + cVertices.length - 1) % cVertices.length];
  const vertex = cVertices[index];
  const after = cVertices[(index + 1) % cVertices.length];
  const incoming = [before[0] - vertex[0], before[1] - vertex[1]];
  const outgoing = [after[0] - vertex[0], after[1] - vertex[1]];
  assert(incoming[0] * outgoing[0] + incoming[1] * outgoing[1] === 0, `c remainder corner ${index + 1} is not a right angle`);
}
const cArea = polygonArea(cVertices);
assert(cArea === 42 ** 2 + 68 ** 2, `c remainder area ${cArea} != a²+b²`);

const remainderTags = ["a²", "b²"].map((area) => right.match(new RegExp(`<rect[^>]+data-area="${area}"[^>]*\\/>`))?.[0] ?? "");
const remainderSides = remainderTags.map((tag, index) => {
  const width = numberAttribute(tag, "width");
  const height = numberAttribute(tag, "height");
  assert(width === height, `${index === 0 ? "a" : "b"} remainder is ${width} by ${height}, not a square`);
  return width;
});
assert(JSON.stringify(remainderSides) === JSON.stringify([42, 68]), `a/b remainder sides ${JSON.stringify(remainderSides)} != [42,68]`);
const outerArea = 110 ** 2;
const fourTrianglesArea = 4 * (42 * 68 / 2);
const leftPartitionArea = fourTrianglesArea + cArea;
const rightPartitionArea = fourTrianglesArea + remainderSides[0] ** 2 + remainderSides[1] ** 2;
assert(110 === 42 + 68, "outer side is not a+b");
assert(leftPartitionArea === outerArea, `left partition area ${leftPartitionArea} != ${outerArea}`);
assert(rightPartitionArea === outerArea, `right partition area ${rightPartitionArea} != ${outerArea}`);
assert(cArea === remainderSides[0] ** 2 + remainderSides[1] ** 2, "left and right leftover areas differ");

const c1 = getStep(lesson, "c1");
const i1 = getStep(lesson, "i1");
const c2 = getStep(lesson, "c2");
assert(c1?.figure === "pythagorean-proof" && c2?.figure === "pythagorean-proof", "general proof figure is not present at both concept steps");
assert(i1?.widget?.prompt.includes("checks one example") && i1?.widget?.prompt.includes("general proof"), "i1 prompt does not separate example from proof");
assert(i1?.widget?.authoredStages?.at(-1)?.body.includes("does not by itself prove the theorem"), "i1 final stage still overclaims the example");
assert(c2?.body.includes("same four congruent right triangles") && c2?.body.includes("Subtracting the same four triangles"), "c2 does not state the equal-area subtraction proof");
const lessonRaw = read(lessonPath);
for (const retired of ["That area picture is the proof", "together they exactly fill the square built on the hypotenuse", "Build a square on each side to see why"]) {
  assert(!lessonRaw.includes(retired), `retired false/ambiguous wording remains: ${retired}`);
}

const truthCases = [
  ["i1", 25, null],
  ["k1", 100, null],
  ["i2", null, "pyth:hypotenuse-opposite-right"],
  ["k2", 169, null],
  ["k3", null, "pyth:squared-terms-are-areas"],
  ["ch1", 5, null],
];
for (const [id, answerNumber, answerClaim] of truthCases) {
  const widget = getStep(lesson, id)?.widget;
  assert(widget?.type === "geometricConstraintLab" && widget?.task === "pythagoreanArea", `${id} is not the assessed Pythagorean lab`);
  const model = widget?.pythagorean ?? {};
  const areaA = model.legAreaA ?? model.legA ** 2;
  const areaB = model.legAreaB ?? model.legB ** 2;
  const cSquared = areaA + areaB;
  const derivedNumber = model.target === "cSquared" ? cSquared : model.target === "length" ? Math.sqrt(cSquared) : null;
  const derivedClaim = model.target === "hypotenuseIdentity" ? "pyth:hypotenuse-opposite-right" : model.target === "areaMeaning" ? "pyth:squared-terms-are-areas" : null;
  assert(derivedNumber === answerNumber, `${id} derived answer ${derivedNumber} != ${answerNumber}`);
  assert(derivedClaim === answerClaim, `${id} derived claim ${derivedClaim} != ${answerClaim}`);
  if (answerClaim) assert(widget.choices.filter((choice) => choice.claim === answerClaim).length === 1, `${id} does not have exactly one choice matching derived truth`);
  if (answerNumber !== null) assert(widget.numericErrors.every((entry) => entry.value !== answerNumber), `${id} names the correct number as an error`);
}
const remedialWidget = lesson.remedials?.[0]?.check?.widget;
assert(remedialWidget?.pythagorean?.legA ** 2 + remedialWidget?.pythagorean?.legB ** 2 === 25, "remedial truth is not c²=25");

const schemaRaw = read(schemaPath);
const evaluatorRaw = read(evaluatorPath);
const widgetsRaw = read(widgetsPath);
assert(schemaRaw.includes("const model=spec.pythagorean") && schemaRaw.includes("c2=geometricClean(areaA+areaB)") && schemaRaw.includes("else if(model.target===\"cSquared\")answerNumber=c2"), "Pythagorean truth engine no longer derives c² from leg-square areas");
assert(evaluatorRaw.includes('case "geometricConstraintLab"') && evaluatorRaw.includes("const truth=geometricConstraintTruth(spec)") && evaluatorRaw.includes("Math.abs(v.numeric-truth.answerNumber)<=spec.tolerance"), "live evaluator no longer grades from derived geometry truth");
assert(widgetsRaw.includes("Right triangle with two square tiles on its legs, not to scale") && widgetsRaw.includes('data-testid="gcl-leg-square-a"') && widgetsRaw.includes('data-testid="gcl-leg-square-b"'), "live Pythagorean question diagram no longer exposes two true square tiles with an accessible not-to-scale warning");

const repeatedCSquaredJobs = [i1, getStep(lesson, "k1"), getStep(lesson, "k2"), lesson.remedials?.[0]?.check]
  .filter((step) => step?.widget?.pythagorean?.target === "cSquared");
assert(repeatedCSquaredJobs.length === 4, `retained calculate-c² job count ${repeatedCSquaredJobs.length} != 4; disposition must be reconsidered`);
const i2Lengths = getStep(lesson, "i2")?.widget?.choices.map((choice) => choice.label.length) ?? [];
assert(JSON.stringify(i2Lengths) === JSON.stringify([52, 17, 22, 25]), `retained i2 option lengths changed: ${JSON.stringify(i2Lengths)}`);

const testRaw = read(testPath);
for (const contract of ["uses two equal true outer squares and eight congruent right triangles", "keeps every visible proof label measurable and collision-free", "makes the central c region and the a and b regions genuine squares with equal leftover area", "expect(scan.skipped).toEqual([])", "expect(collisions(scan.boxes).map(describeCollision)).toEqual([])"]) {
  assert(testRaw.includes(contract), `focused regression is missing: ${contract}`);
}

const authority = loadLessonReviewAuthority(root);
const liveLesson = authority.lessons.find((record) => record.lessonId === "tm-04-01");
const currentDisposition = authority.lessonDecisions.byLesson.get("tm-04-01");
assert(liveLesson?.reviewBasisHash === expectedBasisHash, `live review basis ${liveLesson?.reviewBasisHash} != ${expectedBasisHash}`);
assert(currentDisposition?.status === "CURRENT_HUMAN_DECISION", `tm-04-01 authority status ${currentDisposition?.status} != CURRENT_HUMAN_DECISION`);
assert(currentDisposition?.record?.recordId === expectedRecordId, `current authority record ${currentDisposition?.record?.recordId} != ${expectedRecordId}`);
assert(currentDisposition?.record?.reviewedBasisHash === expectedBasisHash, "current authority record is not sealed to the live basis");
assert((authority.duplicateInventory.byLesson.get("tm-04-01") ?? []).length === 0, "live exact-MCQ duplicate basis is not empty");
assert((authority.standards.byLesson.get("tm-04-01") ?? []).length === 5, "expected five still-candidate standards edges");

const ledgerRecords = read(ledgerPath).trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const lessonHistory = ledgerRecords.filter((record) => record.recordType === "lesson-disposition");
const candidateRecords = read(candidatePath).trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const candidate = candidateRecords[0];
const appendedRecords = lessonHistory.filter((record) => record.recordId === expectedRecordId);
const appended = appendedRecords[0];
const supersedingOrdinal = lessonHistory.findIndex((record) => record.recordId === expectedRecordId) + 1;
const priorRecords = lessonHistory.filter((record) => record.recordId === "S246-TM-tm-04-01");
assert(lessonHistory.length >= 144, `lesson-disposition history count ${lessonHistory.length} is below the TM append checkpoint 144`);
assert(supersedingOrdinal === 144, `TM superseding record ordinal ${supersedingOrdinal} != append checkpoint 144`);
assert(candidateRecords.length === 1, `candidate count ${candidateRecords.length} != 1`);
assert(appendedRecords.length === 1, `appended superseding record count ${appendedRecords.length} != 1`);
assert(priorRecords.length === 1, `preserved S246 history count ${priorRecords.length} != 1`);
assert(priorRecords[0]?.reviewedBasisHash === "d2eeb48d58449bb8d6b847fa9cf24a9e666028b695d23e2bb62c62b111f6d128", "preserved S246 record basis changed");
assert(JSON.stringify(appended) === JSON.stringify(candidate), "candidate and appended ledger record are not exactly equal");
assert(JSON.stringify(currentDisposition?.record) === JSON.stringify(candidate), "authority-current and candidate records are not exactly equal");
assert(candidate?.recordId === expectedRecordId, `recordId ${candidate?.recordId} != ${expectedRecordId}`);
assert(candidate?.reviewedBasisHash === expectedBasisHash, "candidate is not sealed to live review basis");
assert(candidate?.decision === "REVISE" && candidate?.visualDecision === "SUFFICIENT" && candidate?.gradeLanguageDecision === "FIT", "candidate disposition triple changed");
assert(candidate?.rationale.includes("i1, k1, k2, and the remedial") && candidate?.rationale.includes("52 characters versus 17-25"), "candidate does not preserve assessed progression/option debt");

const report = {
  status: errors.length === 0 ? "PASS" : "FAIL",
  lessonId: "tm-04-01",
  currentReviewBasisHash: liveLesson?.reviewBasisHash,
  currentDispositionStatus: currentDisposition?.status,
  currentRecordId: currentDisposition?.record?.recordId,
  priorRecordId: priorRecords[0]?.recordId,
  priorRecordPreservedAsHistory: priorRecords.length === 1,
  supersedingRecordId: candidate?.recordId,
  disposition: candidate ? { decision: candidate.decision, visualDecision: candidate.visualDecision, gradeLanguageDecision: candidate.gradeLanguageDecision } : null,
  geometry: {
    a: 42,
    b: 68,
    outerSide: 110,
    outerArea,
    triangleCount: triangleTags.length,
    eachTriangleArea: triangleAreas[0],
    fourTrianglesArea,
    cSideSquared: cSideSquares[0],
    cArea,
    rightRemainderSides: remainderSides,
    leftPartitionArea,
    rightPartitionArea,
  },
  widgetTruth: truthCases.map(([id, answerNumber, answerClaim]) => ({ id, answerNumber, answerClaim })),
  retainedImplementationDebt: [
    "i1, k1, k2, and the remedial all calculate c-squared from two leg lengths.",
    "i2's correct choice is 52 characters; distractors are 17, 22, and 25 characters, creating a cueable option surface.",
    "Five standards edges remain candidate-only and are not approved by this lesson disposition.",
  ],
  ledger: {
    liveLessonDispositionHistoryCount: lessonHistory.length,
    tmAppendCheckpointOrdinal: supersedingOrdinal,
    supersedingRecordCount: appendedRecords.length,
    candidateEqualsLedger: JSON.stringify(appended) === JSON.stringify(candidate),
    authorityCurrentEqualsCandidate: JSON.stringify(currentDisposition?.record) === JSON.stringify(candidate),
  },
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
