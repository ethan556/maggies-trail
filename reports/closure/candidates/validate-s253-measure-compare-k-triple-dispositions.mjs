#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const COURSE = "measure-compare-k";
const PREFIX = "S253-KMD";
const REVIEWER = "Codex independent assessor (measure-compare-k S253)";
const candidatePath = path.join(here, "S253_MEASURE_COMPARE_K_TRIPLE_DISPOSITIONS.jsonl");
const reportPath = path.join(here, "S253_MEASURE_COMPARE_K_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const courseRoot = path.join(root, "content", "courses", COURSE);
const lessonsDir = path.join(courseRoot, "lessons");
const ledgerPath = path.join(root, "reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const figureIdsPath = path.join(root, "src", "components", "figureIds.ts");
const figuresPath = path.join(root, "src", "components", "figures.tsx");
const sourceReportPath = path.join(root, "reports", "pedagogy", "S253_MEASURE_COMPARE_K_WHOLE_COURSE_REPAIR.md");
const sourceTestPath = path.join(root, "src", "lib", "session253.measureCompareKCourseIntegrity.test.tsx");
const repairPath = path.join(root, "scripts", "audit", "repair-measure-compare-k-s253.mjs");
const legacyTestPath = path.join(root, "src", "lib", "session198.measureCompareK.test.ts");
const generatorPath = path.join(root, "src", "lib", "g0Variants.ts");
const solverPath = path.join(root, "src", "lib", "g0Independent.cjs");
const read = (file) => fs.readFileSync(file, "utf8");
const jsonLines = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const sha = (text) => createHash("sha256").update(text).digest("hex");
const stable = (value) => Array.isArray(value) ? `[${value.map(stable).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const normalized = (text) => String(text).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const evidenceFile = (ref) => String(ref).split(/[:#]/)[0];
const errors = [];
const fail = (message) => errors.push(message);

const courseRaw = read(path.join(courseRoot, "course.json"));
const course = JSON.parse(courseRaw);
const ids = course.chapters.flatMap((chapter) => chapter.lessonIds);
const schema = jsonLines(ledgerPath)[0];
const expectedFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);
const records = jsonLines(candidatePath);
const byId = new Map(records.map((record) => [record.lessonId, record]));
const reviewAuthority = loadLessonReviewAuthority(root);
const authority = reviewAuthority.lessons.filter((lesson) => lesson.courseId === COURSE);
const live = new Map(authority.map((lesson) => [lesson.lessonId, lesson]));

const expectedReviewHashes = {
  "kmd-01-01": "4e4d0fe1c276997c0d42383a40c453d46c9363da0e75c78fdfff9a708ab63d7a",
  "kmd-01-02": "05a818d19ece2bf7876f8e185a6f1fe1e7af36d034e78828342fe793f3b57628",
  "kmd-01-03": "e100a866799baeacf993dff55d7d6671a02e5d7524f141676748d5be319d88f9",
  "kmd-01-04": "ad94c65c1aeeb77b4225d61d19991547dc1f84771c7bca6f3ea167c10b8ef9a7",
  "kmd-02-01": "7c26c694d3a13af801ab2d68b6b0ba3cedb2d7e4e8a99fa75c0edef95ffdc028",
  "kmd-02-02": "ebe104a90b35aff9867a81b31a74b5a14822b0192f0d7b2d6a05bca5150456cf",
  "kmd-02-03": "c70ac5f3729c2acbf50c0697dd2f93bf0630061a16e4ced9e76d53b944a08bfd",
  "kmd-02-04": "133c381b3f723ed05aebb9729c57ce017c220940074fa09a8b574d4f0ad48773",
  "kmd-03-01": "f681a225da4d656ade253544aecb1fc048dcf537adf051e456e1e2ed63afae57",
  "kmd-03-02": "585c863f5a7c3ed1512d162033a4ab4d4ea967c13d624e9e829f5d0d5e3ce4c1",
  "kmd-03-03": "b3b423e0ab0bf7a66256098182d2e8620b32c33c26082166fcc5ddcf5d9acaae",
  "kmd-03-04": "780ecc4c19a7690fcc3b1c44bef2bfb3f212ca8fb047abef33ed4cbede539181",
};
const expectedLessonHashes = {
  "kmd-01-01": "7106e6b3ea2f791034d2770253df27399dfa61df2759810261afd9b1fbf4e450",
  "kmd-01-02": "d913ff6a58a457ce9dfc43ddd2a8c86fab126d5ecef7c29371b2b288a72f92bb",
  "kmd-01-03": "ba5c48f5d91f85591a5951d10df90fd80ab4a5aed2da92ca72a81ca2a3d8c9fb",
  "kmd-01-04": "beec3c0dc61934f3a8d52c3ed27a740d8732cb95841ade25cb894c8dcf9166a2",
  "kmd-02-01": "22fa3dd6fb0377dccbe278423046942bd1809bd882c311462c44a7612dd900c8",
  "kmd-02-02": "35e3b90053a0f37b0972e6e9fd9f7cc986bbcb1d6897213a84107474684e0c69",
  "kmd-02-03": "acc4565ee5f7ce9eea8860aaf8815bb629166a388c699de6c8dc918de1dfe722",
  "kmd-02-04": "6ea2301c62d4be7b5e027f94d5bf318ba2ee5e1262bb3d4db154b047ff5672c0",
  "kmd-03-01": "4701ebaadef037a790e82b3511be76bd5c27b1b28374f372162ff8a49ba8034d",
  "kmd-03-02": "863f21756708c8877e03d35df0127994ee323553de62e578f1ce6ca7a22db170",
  "kmd-03-03": "d6110b09be1baee3ecf02539b956c03a41dcda35e296ea77a331ec95ab2ad87b",
  "kmd-03-04": "eee407977a8a0c0b1aa7bc46952e49010d5b82d7597dc06208e224972342f0c2",
};
const figureMap = {
  "kmd-01-01": ["ks-size-trick", "ks-seesaw"],
  "kmd-01-02": ["ks-compare-length", "length-compare"],
  "kmd-01-03": ["ks-seesaw", "ks-size-trick"],
  "kmd-01-04": ["kmd-capacity-same-scoop", "kmd-capacity-same-scoop"],
  "kmd-02-01": ["ks-compare-length", "length-compare"],
  "kmd-02-02": ["ks-seesaw", "add-balance-scale"],
  "kmd-02-03": ["ks-same-end-fair", "ks-compare-length"],
  "kmd-02-04": ["ks-compare-length", "length-compare"],
  "kmd-03-01": ["ks-sort-count", "geo3-sort-yesno"],
  "kmd-03-02": ["geo3-sort-yesno", "ks-compare-length"],
  "kmd-03-03": ["ks-sort-count", "ks-count-groups"],
  "kmd-03-04": ["ks-count-groups", "ks-sort-count"],
};
const choiceMap = {
  "kmd-01-01/k3": ["Seesaw: heavier; ruler: longer", "Seesaw: longer; ruler: heavier", "Both tools compare only length", "Both tools compare only weight"],
  "kmd-01-04/ch1": ["Seesaw: heavier; ruler: longer", "Seesaw: longer; ruler: heavier", "Both tools compare only length", "Both tools compare only weight"],
  "kmd-03-01/k2": ["One clear rule tests every object", "Equal-sized piles decide the groups", "A neat pattern decides every group", "Fast sorting decides every group"],
  "kmd-03-02/k1": ["One clear rule tests every object", "Equal-sized piles decide the groups", "A neat pattern decides every group", "Fast sorting decides every group"],
};
const languageFingerprint = {
  "kmd-01-01": /attribute|hide many amounts/i,
  "kmd-01-02": /attribute|distance end to end/i,
  "kmd-01-03": /presses|three answers/i,
  "kmd-01-04": /capacity|misjudge|swallows/i,
  "kmd-02-01": /independently|read the far ends/i,
  "kmd-02-02": /read the tilt|neither side winning/i,
  "kmd-02-03": /oldest length trick|tell the truth/i,
  "kmd-02-04": /rule turned upright|does the aligning/i,
  "kmd-03-01": /asks one question|regroup/i,
  "kmd-03-02": /where big begins|yes-or-no question/i,
  "kmd-03-03": /earns its own number|piles into data/i,
  "kmd-03-04": /answers itself|full chain|never vote/i,
};

if (course.id !== COURSE || ids.length !== 12 || new Set(ids).size !== 12) fail("course manifest is not 12 unique measure-compare-k lessons");
if (authority.length !== 12 || records.length !== 12 || new Set(records.map((record) => record.lessonId)).size !== 12 || new Set(records.map((record) => record.recordId)).size !== 12) fail("candidate/live authority cardinality or identity uniqueness drift");
if (!fs.existsSync(reportPath)) fail("assessment report missing");
if (sha(courseRaw) !== "f31690ad4b7d7cd817ee9d54260d642bf199429c6c0e1f44ebebe76c66e218fc") fail("course source hash drift");
if (sha(read(figureIdsPath)) !== "2ab07e64986da0721ed4681b917e81358c05260ff937613a2bfe31624af68d01") fail("figure registry hash drift");
if (sha(read(sourceTestPath)) !== "7f9a05336c34ac95d1bc84ce0f7285b266f5f5bacb3b1980c2b4c68778aa531c") fail("S253 aggregate test hash drift");
if (sha(read(repairPath)) !== "e295de2afc8a296781e1957bc534b28792b5d7eeb77ab4cfe4a66cd919d6beae") fail("repair authority hash drift");

for (const id of ids) {
  const record = byId.get(id), current = live.get(id);
  if (!record || !current) { fail(`${id}: missing candidate or live authority`); continue; }
  if (record.recordType !== "lesson-disposition" || record.recordId !== `${PREFIX}-${id}`) fail(`${id}: candidate identity drift`);
  if (record.reviewedBasisHash !== expectedReviewHashes[id] || record.reviewedBasisHash !== current.reviewBasisHash) fail(`${id}: stale or unexpected live review basis`);
  if (current.lessonSourceHash !== expectedLessonHashes[id]) fail(`${id}: lesson source hash drift`);
  if (record.decision !== "REVISE" || record.visualDecision !== "REQUIRED" || record.gradeLanguageDecision !== "REVISE") fail(`${id}: triple disposition mismatch`);
  if (record.reviewer !== REVIEWER || !Number.isFinite(Date.parse(record.reviewedAt))) fail(`${id}: reviewer or timestamp contract`);
  if (Object.keys(record).some((field) => !expectedFields.has(field)) || [...expectedFields].some((field) => !(field in record))) fail(`${id}: candidate field contract mismatch`);
  if (record.rationale.length < 300 || record.reopenCondition.length < 170 || record.evidenceRefs.length < 7) fail(`${id}: evidence narrative is not substantive`);
  for (const ref of record.evidenceRefs) if (!fs.existsSync(path.join(root, evidenceFile(ref)))) fail(`${id}: missing evidence ${ref}`);
}

const figureIds = read(figureIdsPath), figures = read(figuresPath);
let figurePlacements = 0, progressionClosures = 0, choiceClosures = 0, remedialConceptClones = 0, remedialWidgetClones = 0;
let targetEqualCommonCounts = 0, generatorJobMismatches = 0;
const lessonHashes = [];
for (const id of ids) {
  const raw = read(path.join(lessonsDir, `${id}.json`));
  lessonHashes.push(sha(raw));
  const lesson = JSON.parse(raw);
  if (lesson.readingProfile !== "early") fail(`${id}: reading profile drift`);
  const allText = JSON.stringify(lesson);
  if (!languageFingerprint[id].test(allText)) fail(`${id}: language-revision evidence disappeared`);
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2) fail(`${id}: expected exactly two main concept placements`);
  concepts.forEach((concept, index) => {
    figurePlacements += 1;
    if (concept.figure !== figureMap[id][index]) fail(`${id}/${concept.id}: figure mapping drift`);
    if (!figureIds.includes(`"${concept.figure}"`)) fail(`${id}/${concept.id}: figure unregistered`);
    if (concept.body !== concept.narration) fail(`${id}/${concept.id}: body/narration drift`);
  });
  const mainWidgets = lesson.steps.filter((step) => step.widget);
  const prompts = mainWidgets.map((step) => step.widget.prompt);
  const payloads = mainWidgets.map((step) => stable(step.widget));
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalized)).size !== prompts.length || new Set(payloads).size !== payloads.length) fail(`${id}: repaired progression collision returned`);
  else progressionClosures += 1;

  const remedial = lesson.remedials?.[0];
  if (!remedial || lesson.remedials.length !== 1) fail(`${id}: expected one bounded remedial route`);
  const conceptClone = Boolean(remedial?.concept && concepts.some((step) => step.body === remedial.concept.body && step.narration === remedial.concept.narration));
  const widgetClone = Boolean(remedial?.check?.widget && mainWidgets.some((step) => stable(step.widget) === stable(remedial.check.widget)));
  if (!conceptClone || remedial?.concept?.figure) fail(`${id}: remedial clone/no-figure evidence no longer supports REQUIRED/REVISE`);
  if (conceptClone) remedialConceptClones += 1;
  if (widgetClone) remedialWidgetClones += 1;

  for (const step of [...lesson.steps, remedial?.check].filter(Boolean)) {
    const widget = step.widget;
    if (!widget) continue;
    if (widget.type === "mcq") {
      if (widget.options.filter((option) => option.correct).length !== 1 || new Set(widget.options.map((option) => option.id)).size !== widget.options.length) fail(`${id}/${step.id}: MCQ truth or ID uniqueness drift`);
    }
    if (widget.type === "tapDiagram") {
      const correct = widget.hotspots.filter((hotspot) => hotspot.correct);
      if (correct.length !== 1 || new Set(widget.hotspots.map((hotspot) => hotspot.id)).size !== widget.hotspots.length) fail(`${id}/${step.id}: tap truth or ID uniqueness drift`);
      if (step.variant?.form === "shapeSortTap" && correct[0].count !== Math.max(...widget.hotspots.map((hotspot) => hotspot.count))) generatorJobMismatches += 1;
    }
    if (widget.type === "tenFrame" && widget.commonCounts.some((entry) => entry.count === widget.target)) targetEqualCommonCounts += 1;
  }
}
for (const [key, labels] of Object.entries(choiceMap)) {
  const [id, stepId] = key.split("/");
  const lesson = JSON.parse(read(path.join(lessonsDir, `${id}.json`)));
  const widget = lesson.steps.find((step) => step.id === stepId)?.widget;
  if (widget?.type !== "mcq" || stable(widget.options.map((option) => option.label)) !== stable(labels) || widget.options.filter((option) => option.correct).length !== 1) fail(`${key}: repaired choice-surface drift`);
  else choiceClosures += 1;
}

if (figurePlacements !== 24 || progressionClosures !== 12 || choiceClosures !== 4) fail(`source closure drift: figures=${figurePlacements}, progression=${progressionClosures}, choices=${choiceClosures}`);
if (remedialConceptClones !== 12 || remedialWidgetClones !== 8) fail(`remedial residual drift: concept=${remedialConceptClones}, widget=${remedialWidgetClones}`);
if (targetEqualCommonCounts !== 2 || generatorJobMismatches !== 4) fail(`specialized residual drift: target-equal=${targetEqualCommonCounts}, generator-jobs=${generatorJobMismatches}`);
if (sha(lessonHashes.join("\n")) !== "dba3fd41c2bbf90ed64bf7cc6b676ca7c2de520f830cb60b66c2d4795e7872e5") fail("current repair seal drift");
if (!figures.includes("function KmdCapacitySameScoop()") || !figures.includes("The cup holds four equal scoops and the jug holds six equal scoops, so the jug holds more.")) fail("capacity figure visual/accessible semantics drift");
if (!read(generatorPath).includes("Tap the group with the greatest number of shapes.") || !read(solverPath).includes("case 'shapeSortTap': return [state.hotspots.reduce")) fail("recorded shapeSortTap greatest-count contract drift");
if (!read(legacyTestPath).includes("solver must tap the max-count group") || !read(legacyTestPath).includes("for (const t of w.commonCounts) expect(t.count).not.toBe(w.target)")) fail("legacy residual gate contract drift");

const sourceReport = read(sourceReportPath);
for (const claim of ["ILLUSTRATION_REPLACEMENT`: 24", "LESSON_PROGRESSION_AND_DUPLICATION`: 12", "CHOICE_SURFACE_INTEGRITY`: 4", "Current source seal: `dba3fd41c2bbf90ed64bf7cc6b676ca7c2de520f830cb60b66c2d4795e7872e5`"]) if (!sourceReport.includes(claim)) fail(`source report evidence drift: ${claim}`);
const counts = Object.fromEntries(["KEEP", "REVISE", "ESCALATE"].map((decision) => [decision, records.filter((record) => record.decision === decision).length]));
if (stable(counts) !== stable({ KEEP: 0, REVISE: 12, ESCALATE: 0 })) fail(`decision distribution ${JSON.stringify(counts)}`);

const result = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: COURSE,
  records: records.length,
  currentHashes: records.filter((record) => record.reviewedBasisHash === live.get(record.lessonId)?.reviewBasisHash).length,
  decisions: counts,
  visual: { REQUIRED: records.filter((record) => record.visualDecision === "REQUIRED").length },
  language: { REVISE: records.filter((record) => record.gradeLanguageDecision === "REVISE").length },
  sourceClosures: { illustration: 24, progression: 12, choice: 4, total: 40 },
  genericRowsClosable: 36,
  revisionRowsRetained: 12,
  specializedResiduals: { remedialConceptClones: 12, remedialWidgetClones: 8, targetEqualCommonCounts, generatorJobMismatches },
  candidateSha256: sha(read(candidatePath)),
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
