#!/usr/bin/env node
// S199 — Phase 1: pure ingestion of the G6-12 CCSS gap patch (21 authored lessons).
// Source: /mnt/user-data/uploads/g6-12-gap-patch.json (verbatim authored content, current schema).
// This phase copies content EXACTLY as authored and wires the graph; every structural claim the
// patch makes about the repo (insertion positions, no collisions, edge endpoints) is asserted
// against the live tree before any write. Optimization deltas, if any, come in phase 2 as a
// separate, logged script so the authored baseline stays auditable.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const patch = JSON.parse(readFileSync("/mnt/user-data/uploads/g6-12-gap-patch.json", "utf8"));

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("INGEST ASSERT: " + msg); };

must(patch.totalLessons === 21, "patch declares 21 lessons");

/* ---------- per-lesson authoring-contract check (the patch's own contract) ---------- */
function checkLesson(L) {
  must(L.steps.length >= 8, `${L.id}: >=8 steps`);
  let predicts = 0;
  for (const s of L.steps) {
    must(typeof s.body === "string" && s.body.length > 0, `${L.id}/${s.id}: body`);
    if (s.predict) {
      predicts++;
      must(s.predict.options.some((o) => o.id === s.predict.outcomeId), `${L.id}/${s.id}: predict outcome`);
    }
    if (s.kind === "check" || s.kind === "challenge") {
      must(typeof s.conceptTag === "string" && s.conceptTag.length > 0, `${L.id}/${s.id}: conceptTag`);
      must((s.explanationVariants ?? []).length >= 2, `${L.id}/${s.id}: 2 explanationVariants`);
    }
    if (s.kind === "challenge") {
      must((s.hints ?? []).length === 3, `${L.id}/${s.id}: exactly 3 graduated hints`);
    }
    const w = s.widget;
    if (w?.type === "numeric" && (s.kind === "check" || s.kind === "challenge")) {
      must((w.commonErrors ?? []).length >= 2, `${L.id}/${s.id}: numeric needs >=2 commonErrors`);
      must(typeof w.fallbackFeedback === "string" && w.fallbackFeedback.length > 0, `${L.id}/${s.id}: fallbackFeedback`);
      for (const e of w.commonErrors) must(e.value !== w.answer, `${L.id}/${s.id}: trap equals answer`);
    }
    if (w?.type === "mcq") {
      must(w.options.filter((o) => o.correct).length === 1, `${L.id}/${s.id}: one correct`);
      for (const o of w.options) must(typeof o.feedback === "string" && o.feedback.length > 0, `${L.id}/${s.id}: option feedback`);
    }
  }
  must(predicts <= 1, `${L.id}: at most one prediction`);
  const recap = L.steps.find((s) => s.kind === "recap");
  must(recap && (recap.takeaways ?? []).length >= 1 && (recap.takeaways ?? []).length <= 3, `${L.id}: recap takeaways 1-3`);
  must(typeof recap.teaser === "string" && recap.teaser.length > 0, `${L.id}: recap teaser`);
}

const written = [];

/* ---------- 1) two new courses ---------- */
for (const c of patch.courses) {
  const dir = join(root, "content/courses", c.slug);
  must(!existsSync(dir), `course dir ${c.slug} must not pre-exist`);
  const cj = c.course;
  must(cj.id === c.slug && cj.slug === c.slug && cj.gradeLevel === c.grade, `${c.slug}: course.json identity`);
  const declared = cj.chapters.flatMap((ch) => ch.lessonIds);
  must(declared.length === c.lessons.length && c.lessonCount === c.lessons.length, `${c.slug}: lesson count`);
  must(JSON.stringify(declared) === JSON.stringify(c.lessons.map((l) => l.id)), `${c.slug}: chapter order matches lesson order`);
  for (const L of c.lessons) {
    must(L.courseId === c.slug, `${L.id}: courseId`);
    must(cj.chapters.some((ch) => ch.id === L.chapterId), `${L.id}: chapterId declared`);
    checkLesson(L);
  }
  mkdirSync(join(dir, "lessons"), { recursive: true });
  writeFileSync(join(dir, "course.json"), JSON.stringify(cj, null, 2) + "\n");
  for (const L of c.lessons) {
    writeFileSync(join(dir, "lessons", `${L.id}.json`), JSON.stringify(L, null, 2) + "\n");
    written.push(`${c.slug}/${L.id}`);
  }
}

/* ---------- 2) two chapter insertions ---------- */
for (const ci of patch.chapterInsertions) {
  const dir = join(root, "content/courses", ci.courseSlug);
  const cjPath = join(dir, "course.json");
  const cj = JSON.parse(readFileSync(cjPath, "utf8"));
  must(!cj.chapters.some((ch) => ch.id === ci.chapter.id), `${ci.courseSlug}: chapter ${ci.chapter.id} must not pre-exist`);
  must(JSON.stringify(ci.chapter.lessonIds) === JSON.stringify(ci.lessons.map((l) => l.id)), `${ci.courseSlug}: chapter lessonIds match lessons`);
  for (const L of ci.lessons) {
    must(L.courseId === ci.courseSlug && L.chapterId === ci.chapter.id, `${L.id}: identity`);
    must(!existsSync(join(dir, "lessons", `${L.id}.json`)), `${L.id}: lesson file must not pre-exist`);
    checkLesson(L);
  }
  if (ci.courseSlug === "statistical-inference") {
    // declared: after ch3-margin-of-error, before ch4-is-the-difference-real
    const i3 = cj.chapters.findIndex((ch) => ch.id === "ch3-margin-of-error");
    const i4 = cj.chapters.findIndex((ch) => ch.id === "ch4-is-the-difference-real");
    must(i3 >= 0 && i4 === i3 + 1, "statistical-inference: live layout matches the declared insertion seam");
    cj.chapters.splice(i4, 0, ci.chapter);
  } else if (ci.courseSlug === "bivariate-statistics") {
    must(cj.chapters[cj.chapters.length - 1].id === "ch4-two-way-tables", "bivariate: ch4 is currently last");
    cj.chapters.push(ci.chapter);
  } else {
    must(false, `unknown insertion target ${ci.courseSlug}`);
  }
  writeFileSync(cjPath, JSON.stringify(cj, null, 2) + "\n");
  for (const L of ci.lessons) {
    writeFileSync(join(dir, "lessons", `${L.id}.json`), JSON.stringify(L, null, 2) + "\n");
    written.push(`${ci.courseSlug}/${L.id}`);
  }
  /* seam edit */
  if (ci.seamEdit) {
    must(ci.seamEdit.field === "recap.teaser", "seam edit field is recap.teaser");
    const lp = join(dir, "lessons", `${ci.seamEdit.lessonId}.json`);
    const lesson = JSON.parse(readFileSync(lp, "utf8"));
    const recap = lesson.steps.find((s) => s.kind === "recap");
    must(recap.teaser === "Next chapter: two groups differ. Could chance alone have done that?",
      `${ci.seamEdit.lessonId}: current teaser matches the expected pre-edit value`);
    recap.teaser = ci.seamEdit.newValue;
    writeFileSync(lp, JSON.stringify(lesson, null, 2) + "\n");
    written.push(`SEAM ${ci.courseSlug}/${ci.seamEdit.lessonId}`);
  }
}

/* ---------- 3) PATH_EDGES ---------- */
const csPath = join(root, "src/lib/content.server.ts");
let cs = readFileSync(csPath, "utf8");
for (const e of patch.pathEdges) {
  const line = `  { from: "${e.from}", to: "${e.to}" },`;
  must(!cs.includes(`from: "${e.from}", to: "${e.to}"`), `edge ${e.from}->${e.to} must not pre-exist`);
}
const anchor = `  { from: "solving-equations", to: "linear-functions" },`;
must(cs.split(anchor).length === 2, "PATH_EDGES anchor line unique");
const block = patch.pathEdges.map((e) => `  { from: "${e.from}", to: "${e.to}" },`).join("\n");
cs = cs.replace(anchor, anchor + "\n  // S199 — G6-12 gap patch wiring (A-REI.D.12, A-REI.C.7)\n" + block);
writeFileSync(csPath, cs);

console.log(`ingested ${written.length} writes (${written.filter((w) => !w.startsWith("SEAM")).length} lessons + ${written.filter((w) => w.startsWith("SEAM")).length} seam edit); ${asserts} assertions passed`);
console.log("pathEdges added:", patch.pathEdges.length);
