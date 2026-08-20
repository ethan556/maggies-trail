/**
 * Cowork 2026-08-19 — line-ending re-basing migration for LESSON_REVIEW_DECISIONS_S244.jsonl.
 *
 * Problem: reviewedBasisHash values were signed on a Windows working tree whose lesson JSON
 * files were LF (rewritten by repair scripts) while course.json files were CRLF (autocrlf
 * checkout). On an LF checkout of the identical committed content, every stored basis hash
 * reads as stale, spuriously discarding signed human review decisions.
 *
 * This migration is purely additive and content-guarded:
 *  - For each lesson whose LATEST disposition record fails current-basis validation, recompute
 *    the basis under the four line-ending variants of the CURRENT committed content
 *    (lesson raw x course raw, each LF or CRLF).
 *  - Only when the stored hash matches one of those variants exactly — proving the decision was
 *    signed against byte-equivalent content — append a new record carrying the same human
 *    decision with the basis re-computed on this checkout's bytes.
 *  - Records that match no variant are genuinely stale and are left untouched.
 *  - Nothing is edited or deleted; history is preserved; every migration is listed on stdout
 *    and in the appended records' rationale.
 */
import fs from "node:fs";
import path from "node:path";
import { loadLessonReviewAuthority, deriveLessonReviewBasisHash, hash } from "../audit/lesson-review-authority-s246.mjs";

const root = process.cwd();
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const authority = loadLessonReviewAuthority(root);
const lessonById = new Map(authority.lessons.map((l) => [l.lessonId, l]));

const rawLines = fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/).filter(Boolean);
const records = rawLines.map((line) => JSON.parse(line));
const dispositions = records.filter((r) => r.recordType === "lesson-disposition");
const latest = new Map();
for (const r of dispositions) latest.set(String(r.lessonId), r);
const existingIds = new Set(dispositions.map((r) => String(r.recordId)));

const crlf = (s) => s.replace(/\r?\n/g, "\r\n");
const variants = [
  ["LF/LF", (l) => [l.raw, l.courseRaw]],
  ["CRLF/CRLF", (l) => [crlf(l.raw), crlf(l.courseRaw)]],
  ["LF/CRLF", (l) => [l.raw, crlf(l.courseRaw)]],
  ["CRLF/LF", (l) => [crlf(l.raw), l.courseRaw]],
];

const migrated = [];
const genuinelyStale = [];
let alreadyCurrent = 0;

for (const [lessonId, rec] of latest) {
  const lesson = lessonById.get(lessonId);
  if (!lesson) continue;
  if (rec.reviewedBasisHash === lesson.reviewBasisHash) { alreadyCurrent += 1; continue; }
  let matchedVariant = null;
  for (const [name, fn] of variants) {
    const [lr, cr] = fn(lesson);
    const lc = hash(`${lesson.source}\0${lr}\0${lesson.courseSource}\0${cr}\0`);
    const basis = deriveLessonReviewBasisHash({
      lessonCourseBasisHash: lc,
      duplicateClusters: authority.duplicateInventory.byLesson.get(lessonId) ?? [],
      standardsEdges: authority.standards.byLesson.get(lessonId) ?? [],
    });
    if (rec.reviewedBasisHash === basis) { matchedVariant = name; break; }
  }
  if (!matchedVariant) { genuinelyStale.push(lessonId); continue; }
  const newId = `${rec.recordId}-lfnorm`;
  if (existingIds.has(newId)) continue;
  migrated.push({
    ...rec,
    recordId: newId,
    reviewedBasisHash: lesson.reviewBasisHash,
    rationale: `${rec.rationale} [Mechanical line-ending re-basing of ${rec.recordId} on 2026-08-19: stored basis matched byte-equivalent content under ${matchedVariant} endings; decision content unchanged.]`,
    evidenceRefs: [...(rec.evidenceRefs ?? []), `migration:${rec.recordId}:${matchedVariant}`],
  });
}

if (process.argv.includes("--write")) {
  const out = migrated.map((r) => JSON.stringify(r)).join("\n");
  if (migrated.length) fs.appendFileSync(ledgerPath, (fs.readFileSync(ledgerPath, "utf8").endsWith("\n") ? "" : "\n") + out + "\n");
}

console.log(JSON.stringify({
  latestRecords: latest.size,
  alreadyCurrent,
  migrated: migrated.length,
  genuinelyStale: genuinelyStale.length,
  staleLessonIds: genuinelyStale.sort(),
  wrote: process.argv.includes("--write"),
}, null, 2));
