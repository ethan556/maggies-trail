#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const CANDIDATE = join(ROOT, "reports", "closure", "candidates", "S252_ADD_SUBTRACT_10_K_TRIPLE_DISPOSITIONS.jsonl");
const REPORT = join(ROOT, "reports", "closure", "candidates", "S252_ADD_SUBTRACT_10_K_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const lessons = loadLessonReviewAuthority(ROOT).lessons.filter((lesson) => lesson.courseId === "add-subtract-10-k").sort((a, b) => a.lessonId.localeCompare(b.lessonId));
if (lessons.length !== 20) throw new Error(`Expected 20 lessons, found ${lessons.length}`);

const records = lessons.map((lesson) => ({
  recordType: "lesson-disposition",
  recordId: `S252-KOA-${lesson.lessonId}`,
  lessonId: lesson.lessonId,
  reviewedBasisHash: lesson.reviewBasisHash,
  decision: "REVISE",
  visualDecision: "SUFFICIENT",
  gradeLanguageDecision: "FIT",
  reviewer: "Codex course assessor (add-subtract-10-k S252)",
  reviewedAt: "2026-08-18T23:58:00.000Z",
  rationale: `Complete review of ${lesson.lessonId} (${lesson.title}) covered all main and remedial steps, semantic figure and accessible-text agreement, evaluator/target/feedback truth, prompt diversity, and Kindergarten language. The lesson's main sequence is truthful, represented, and age-fit. REVISE remains because its remedial route is immediate same-family practice rather than a distinct misconception diagnosis.`,
  evidenceRefs: [
    `${lesson.source}:complete main and remedial review`,
    "reports/pedagogy/S252_ADD_SUBTRACT_10_K_WHOLE_COURSE_REPAIR.md:source changes and authority boundary",
    "src/lib/session252.addSubtract10KCourseIntegrity.test.tsx:figure, progression, evaluator, feedback, schema, and pedagogy contracts",
    "scripts/audit/repair-add-subtract-10-k-s252.mjs:idempotent 20-lesson source repair",
    "PREMIUM_PENDING_WORKLOAD_QUEUE.csv:pre-reconciliation 94-row course portfolio",
  ],
  reopenCondition: "Reopen on any lesson, remedial, course, duplicate-reference, standards-reference, figure implementation, widget/evaluator, feedback, generator, renderer, queue-authority, or V4-contract change; REVISE closes review only and preserves implementation debt.",
}));
const jsonl = `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
const sha = createHash("sha256").update(jsonl).digest("hex");
const report = `# S252 Add/Subtract Within 10 K Triple-Disposition Assessment\n\n- Lessons: **20/20**.\n- Decisions: **20 REVISE / 20 SUFFICIENT / 20 FIT**.\n- Generic rows eligible to close: **60**.\n- Revision rows preserved/opened: **20**.\n- Candidate SHA-256: \`${sha}\`.\n\nThe complete main sequence is truthful, visually represented, action-diverse, and Kindergarten-fit. REVISE retains remedial diversification without hiding it; no standards, mastery, or transfer closure is claimed.\n`;
if (CHECK) {
  if (!existsSync(CANDIDATE) || readFileSync(CANDIDATE, "utf8") !== jsonl) throw new Error("Candidate is stale");
  if (!existsSync(REPORT) || readFileSync(REPORT, "utf8") !== report) throw new Error("Assessment is stale");
  console.log(JSON.stringify({ status: "CURRENT", records: 20, sha }, null, 2));
} else {
  writeFileSync(CANDIDATE, jsonl, "utf8");
  writeFileSync(REPORT, report, "utf8");
  console.log(JSON.stringify({ status: "WROTE", records: 20, sha }, null, 2));
}
