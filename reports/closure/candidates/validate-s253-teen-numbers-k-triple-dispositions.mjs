#!/usr/bin/env node
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const COURSE = "teen-numbers-k";
const PREFIX = "S253-TNK";
const REVIEWER = "Codex independent assessor (teen-numbers-k S253)";
const candidatePath = path.join(here, "S253_TEEN_NUMBERS_K_TRIPLE_DISPOSITIONS.jsonl");
const reportPath = path.join(here, "S253_TEEN_NUMBERS_K_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const coursePath = path.join(root, "content", "courses", COURSE, "course.json");
const lessonsDir = path.join(root, "content", "courses", COURSE, "lessons");
const ledgerPath = path.join(root, "reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const figuresPath = path.join(root, "src", "components", "figureIds.ts");
const read = (file) => fs.readFileSync(file, "utf8");
const lines = (file) => read(file).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const stable = (value) => Array.isArray(value) ? `[${value.map(stable)}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}` : JSON.stringify(value);
const evidenceFile = (ref) => String(ref).split(/[:#]/)[0];
const normalized = (text) => text.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const errors = [];
const schema = lines(ledgerPath)[0];
const course = JSON.parse(read(coursePath));
const records = lines(candidatePath);
const authority = loadLessonReviewAuthority(root).lessons.filter((lesson) => lesson.courseId === COURSE);
const live = new Map(authority.map((lesson) => [lesson.lessonId, lesson]));
const ids = course.chapters.flatMap((chapter) => chapter.lessonIds);
const byId = new Map(records.map((record) => [record.lessonId, record]));
const revise = new Set(ids);
const expectedFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);

if (course.id !== COURSE || ids.length !== 12 || new Set(ids).size !== 12) errors.push("course manifest is not 12 unique teen-number lessons");
if (authority.length !== 12 || records.length !== 12 || new Set(records.map((r) => r.lessonId)).size !== 12) errors.push("candidate/live authority cardinality drift");
if (!fs.existsSync(reportPath)) errors.push("assessment report missing");
for (const id of ids) {
  const record = byId.get(id), current = live.get(id);
  if (!record || !current) { errors.push(`${id}: missing candidate or live authority`); continue; }
  if (record.recordId !== `${PREFIX}-${id}` || record.recordType !== "lesson-disposition") errors.push(`${id}: identity drift`);
  if (record.reviewedBasisHash !== current.reviewBasisHash) errors.push(`${id}: stale live authority hash`);
  if (record.reviewer !== REVIEWER) errors.push(`${id}: reviewer drift`);
  if (record.decision !== (revise.has(id) ? "REVISE" : "KEEP") || record.visualDecision !== "SUFFICIENT" || record.gradeLanguageDecision !== "FIT") errors.push(`${id}: triple disposition mismatch`);
  if (Object.keys(record).some((field) => !expectedFields.has(field)) || [...expectedFields].some((field) => !(field in record))) errors.push(`${id}: candidate field contract mismatch`);
  if (record.rationale.length < 300 || record.reopenCondition.length < 140 || record.evidenceRefs.length < 6) errors.push(`${id}: evidence narrative is not substantive`);
  for (const ref of record.evidenceRefs) if (!fs.existsSync(path.join(root, evidenceFile(ref)))) errors.push(`${id}: missing evidence ${ref}`);
}

const figureIds = read(figuresPath);
let placements = 0, widgets = 0, remedialConceptClones = 0;
for (const id of ids) {
  const lesson = JSON.parse(read(path.join(lessonsDir, `${id}.json`)));
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  if (concepts.length !== 2) errors.push(`${id}: expected two concept placements`);
  for (const concept of concepts) {
    placements += 1;
    if (!concept.figure || concept.figure === "count-on-hops" || !figureIds.includes(`"${concept.figure}"`)) errors.push(`${id}/${concept.id}: non-semantic or unregistered figure`);
    if (concept.body !== concept.narration) errors.push(`${id}/${concept.id}: narration drift`);
  }
  const main = lesson.steps.filter((step) => step.widget);
  widgets += main.length;
  const prompts = main.map((step) => step.widget.prompt), payloads = main.map((step) => stable(step.widget));
  if (new Set(prompts).size !== prompts.length || new Set(prompts.map(normalized)).size !== prompts.length || new Set(payloads).size !== payloads.length) errors.push(`${id}: progression collision returned`);
  const remedialConcept = lesson.remedials?.[0]?.concept;
  const clone = Boolean(remedialConcept && lesson.steps.some((step) => step.kind === "concept" && step.body === remedialConcept.body && step.narration === remedialConcept.narration));
  if (clone) remedialConceptClones += 1;
  if (!clone) errors.push(`${id}: remedial concept clone fingerprint no longer supports disposition`);
  for (const step of [...lesson.steps, ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check].filter(Boolean))]) {
    const widget = step.widget;
    if (!widget) continue;
    if (widget.type === "mcq" && widget.options.filter((option) => option.correct).length !== 1) errors.push(`${id}/${step.id}: MCQ truth contract`);
    if (widget.type === "numeric" && (widget.tolerance !== 0 || widget.commonErrors?.some((error) => error.value === widget.answer))) errors.push(`${id}/${step.id}: numeric truth contract`);
  }
}
if (placements !== 24 || widgets !== 72 || remedialConceptClones !== 12) errors.push(`corpus drift: placements=${placements}, widgets=${widgets}, remedialClones=${remedialConceptClones}`);
const counts = Object.fromEntries(["KEEP","REVISE","ESCALATE"].map((d) => [d, records.filter((r) => r.decision === d).length]));
if (stable(counts) !== stable({ KEEP: 0, REVISE: 12, ESCALATE: 0 })) errors.push(`decision distribution ${JSON.stringify(counts)}`);
const sourceReport = read(path.join(root, "reports", "pedagogy", "S253_TEEN_NUMBERS_K_WHOLE_COURSE_REPAIR.md"));
for (const claim of ["ILLUSTRATION_REPLACEMENT | 24 | 0", "LESSON_PROGRESSION_AND_DUPLICATION | 12 | 0", "CHOICE_SURFACE_INTEGRITY | 1 | 0", "3137f8c1174be7357405bd55bf742e7612723abed0a41450542fa65461db52cf"]) if (!sourceReport.includes(claim)) errors.push(`source closure evidence drift: ${claim}`);
const result = { status: errors.length ? "FAIL" : "PASS", courseId: COURSE, records: records.length, currentHashes: records.filter((r) => r.reviewedBasisHash === live.get(r.lessonId)?.reviewBasisHash).length, decisions: counts, visual: { SUFFICIENT: records.filter((r) => r.visualDecision === "SUFFICIENT").length }, language: { FIT: records.filter((r) => r.gradeLanguageDecision === "FIT").length }, sourceClosures: 37, genericRowsClosable: 36, revisionRowsRetained: 12, candidateSha256: createHash("sha256").update(read(candidatePath)).digest("hex"), errors };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
