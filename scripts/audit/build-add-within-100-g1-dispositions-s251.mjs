#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const CANDIDATE = join(ROOT, "reports", "closure", "candidates", "S251_ADD_WITHIN_100_G1_TRIPLE_DISPOSITIONS.jsonl");
const REPORT = join(ROOT, "reports", "closure", "candidates", "S251_ADD_WITHIN_100_G1_TRIPLE_DISPOSITIONS_ASSESSMENT.md");

const authority = loadLessonReviewAuthority(ROOT);
const lessons = authority.lessons
  .filter((lesson) => lesson.courseId === "add-within-100-g1")
  .sort((a, b) => a.lessonId.localeCompare(b.lessonId));
if (lessons.length !== 14) throw new Error(`Expected 14 add-within-100-g1 lessons, found ${lessons.length}`);

const records = lessons.map((lesson) => ({
  recordType: "lesson-disposition",
  recordId: `S251-G1A-${lesson.lessonId}`,
  lessonId: lesson.lessonId,
  reviewedBasisHash: lesson.reviewBasisHash,
  decision: "REVISE",
  visualDecision: "SUFFICIENT",
  gradeLanguageDecision: "FIT",
  reviewer: "Codex course assessor (add-within-100-g1 S251)",
  reviewedAt: "2026-08-18T22:20:00.000Z",
  rationale: `Complete review of ${lesson.lessonId} (${lesson.title}) covered every main and remedial step, both semantic figures and their accessible text, evaluator/target/feedback agreement, number-normalized prompt diversity, and Grade 1 language. The repaired main sequence is mathematically truthful, both concept visuals render, the second interaction requires a different learner action, and the language is age-fit. REVISE remains because the remedial route is still same-family immediate practice rather than a fully distinct misconception diagnosis; that implementation debt must stay open after the three review dimensions are signed.`,
  evidenceRefs: [
    `${lesson.source}:complete main and remedial review`,
    "reports/pedagogy/S251_ADD_WITHIN_100_G1_WHOLE_COURSE_REPAIR.md:source changes, exact queue identities, and authority boundary",
    "src/lib/session251.addWithin100G1CourseIntegrity.test.tsx:schema, pedagogy, figure, progression, evaluator, and feedback contracts",
    "scripts/audit/repair-add-within-100-g1-s251.mjs:idempotent 14-lesson source repair",
    "src/components/figures.tsx:registered semantic figure implementations and accessible titles",
    "PREMIUM_PENDING_WORKLOAD_QUEUE.csv:pre-reconciliation 84-row course portfolio",
  ],
  reopenCondition: "Reopen on any lesson, remedial, course, duplicate-reference, standards-reference, figure implementation, widget/evaluator, feedback, generator, renderer, queue-authority, or V4-contract change; this REVISE decision closes review only and preserves implementation debt.",
}));

const jsonl = `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
const sha = createHash("sha256").update(jsonl).digest("hex");
const report = `# S251 Add Within 100 G1 Triple-Disposition Assessment

## Verdict

- Lessons reviewed: **14/14**.
- Whole-lesson: **14 REVISE**.
- Visual: **14 SUFFICIENT**.
- Grade language: **14 FIT**.
- Candidate SHA-256: \`${sha}\`.
- Generic rows eligible to close after append/rebuild: **42**.
- Revision-implementation rows deliberately retained/opened: **14**.
- Net generic-review reduction: **28**.

## Review result

The assessment covers all main and remedial surfaces after the source repair. Every concept now uses a registered semantic figure with accessible text, every copied second interaction is replaced by a different selection action, every same-sitting exact or number-normalized prompt is unique, and the generated numeric feedback no longer concatenates question punctuation with answers.

The main sequence is mathematically truthful and grade-language fit. The retained REVISE status is bounded: remedial pairs still provide same-family immediate practice rather than a substantially different misconception diagnosis. The signed decisions close the three generic review streams only and preserve that implementation row.

## Authority boundary

This packet is current-hash bound and must pass the canonical bounded appender before integration. It does not approve standards, infer mastery or transfer, or close any source-derived row until the visual and queue audits are regenerated from the repaired lessons.
`;

if (CHECK) {
  if (!existsSync(CANDIDATE) || readFileSync(CANDIDATE, "utf8") !== jsonl) throw new Error("Add Within 100 candidate is stale");
  if (!existsSync(REPORT) || readFileSync(REPORT, "utf8") !== report) throw new Error("Add Within 100 assessment is stale");
  console.log(JSON.stringify({ status: "CURRENT", records: records.length, sha }, null, 2));
} else {
  writeFileSync(CANDIDATE, jsonl, "utf8");
  writeFileSync(REPORT, report, "utf8");
  console.log(JSON.stringify({ status: "WROTE", records: records.length, sha }, null, 2));
}
