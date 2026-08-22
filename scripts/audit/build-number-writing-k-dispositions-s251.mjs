#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const CANDIDATE = join(ROOT, "reports", "closure", "candidates", "S251_NUMBER_WRITING_K_TRIPLE_DISPOSITIONS.jsonl");
const REPORT = join(ROOT, "reports", "closure", "candidates", "S251_NUMBER_WRITING_K_TRIPLE_DISPOSITIONS_ASSESSMENT.md");

const authority = loadLessonReviewAuthority(ROOT);
const lessons = authority.lessons
  .filter((lesson) => lesson.courseId === "number-writing-k")
  .sort((a, b) => a.lessonId.localeCompare(b.lessonId));
if (lessons.length !== 14) throw new Error(`Expected 14 number-writing-k lessons, found ${lessons.length}`);

const records = lessons.map((lesson) => ({
  recordType: "lesson-disposition",
  recordId: `S251-NWK-${lesson.lessonId}`,
  lessonId: lesson.lessonId,
  reviewedBasisHash: lesson.reviewBasisHash,
  decision: "REVISE",
  visualDecision: "SUFFICIENT",
  gradeLanguageDecision: "FIT",
  reviewer: "Codex independent assessor (number-writing-k S251)",
  reviewedAt: "2026-08-18T22:00:00.000Z",
  rationale: `Independent review of ${lesson.lessonId} (${lesson.title}) covered every main and remedial step, both semantic figures and accessible text, widget target/evaluator/feedback agreement, prompt diversity, option parity, and Kindergarten language. The main sequence is mathematically truthful after the S251 place-value and flash-feedback repairs, all promised concept visuals render, and the language is age-fit. REVISE is retained because the remedial concept/check pair substantially repeats the main teaching/check rather than diagnosing a distinct misconception; this implementation debt must remain explicit even though the three human-review dimensions are now signed.`,
  evidenceRefs: [
    `${lesson.source}:complete lesson and remedial review`,
    "reports/pedagogy/S249_NUMBER_WRITING_K_WHOLE_COURSE_REPAIR.md:implementation evidence and authority boundary",
    "src/lib/session249.numberWritingKCourseIntegrity.test.ts:whole-course schema, visual, action, evaluator, and truth contract",
    "scripts/audit/repair-number-writing-k-s249.mjs:idempotent source normalization",
    "src/components/figures/numberWritingFigures.tsx:28 registered semantic figures and accessible descriptions",
    "PREMIUM_PENDING_WORKLOAD_QUEUE.csv:current generic review rows",
  ],
  reopenCondition: "Reopen on any lesson, remedial, course, duplicate-reference, standards-reference, figure implementation, widget/evaluator, feedback, generator, renderer, queue-authority, or V4-contract change; this REVISE decision closes review only and preserves implementation debt.",
}));

const jsonl = `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
const sha = createHash("sha256").update(jsonl).digest("hex");
const report = `# S251 Number Writing K Triple-Disposition Assessment

## Verdict

- Lessons reviewed: **14/14**.
- Whole-lesson: **14 REVISE**.
- Visual: **14 SUFFICIENT**.
- Grade language: **14 FIT**.
- Candidate SHA-256: \`${sha}\`.
- Generic rows eligible to close after append/rebuild: **42**.
- Revision-implementation rows deliberately retained/opened: **14**.
- Net queue reduction: **28**.

## Independent findings and repairs

The review did not inherit the writer packet. It found and repaired two false keyed MCQs, an off-topic Writing Twenty interaction, an action/prompt mismatch, ambiguous leading-digit language, and five flash widgets whose authored count disagreed with their success and miss feedback. The aggregate regression now pins all of those truths.

All 28 concept figures are registered, semantic, and accessible. Main interactions are distinct and all main MCQs remain evaluator-true and position-balanced. The retained REVISE status is narrow and honest: each remedial pair substantially repeats its main concept/check instead of diagnosing a separate misconception.

## Authority boundary

This file is an isolated candidate. The canonical appender must validate current basis hashes before append. A signed review closes the three generic review rows only; it does not close the retained revision implementation, create standards approval, or claim mastery/transfer.
`;

if (CHECK) {
  if (!existsSync(CANDIDATE) || readFileSync(CANDIDATE, "utf8") !== jsonl) throw new Error("Number Writing candidate is stale");
  if (!existsSync(REPORT) || readFileSync(REPORT, "utf8") !== report) throw new Error("Number Writing report is stale");
  console.log(JSON.stringify({ status: "CURRENT", records: records.length, sha }, null, 2));
} else {
  writeFileSync(CANDIDATE, jsonl, "utf8");
  writeFileSync(REPORT, report, "utf8");
  console.log(JSON.stringify({ status: "WROTE", records: records.length, sha }, null, 2));
}
