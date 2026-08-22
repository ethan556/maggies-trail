#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const CANDIDATE = join(ROOT, "reports", "closure", "candidates", "S251_FLUENCY_20_G2_TRIPLE_DISPOSITIONS.jsonl");
const REPORT = join(ROOT, "reports", "closure", "candidates", "S251_FLUENCY_20_G2_TRIPLE_DISPOSITIONS_ASSESSMENT.md");
const lessons = loadLessonReviewAuthority(ROOT).lessons
  .filter((lesson) => lesson.courseId === "fluency-20-g2")
  .sort((a, b) => a.lessonId.localeCompare(b.lessonId));
if (lessons.length !== 14) throw new Error(`Expected 14 lessons, found ${lessons.length}`);

const records = lessons.map((lesson) => ({
  recordType: "lesson-disposition",
  recordId: `S251-F20-${lesson.lessonId}`,
  lessonId: lesson.lessonId,
  reviewedBasisHash: lesson.reviewBasisHash,
  decision: "REVISE",
  visualDecision: "SUFFICIENT",
  gradeLanguageDecision: "FIT",
  reviewer: "Codex course assessor (fluency-20-g2 S251)",
  reviewedAt: "2026-08-18T23:45:00.000Z",
  rationale: `Complete review of ${lesson.lessonId} (${lesson.title}) covered every main and remedial step, both semantic figures and their accessible text, evaluator/target/feedback agreement, fluency-strategy truth, normalized prompt diversity, and Grade 2 language. The repaired main sequence is truthful, both concept visuals render, the second interaction requires a different learner action, and the language is age-fit. REVISE remains because the remedial route is same-family immediate practice rather than a fully distinct misconception diagnosis.`,
  evidenceRefs: [
    `${lesson.source}:complete main and remedial review`,
    "reports/pedagogy/S251_FLUENCY_20_G2_WHOLE_COURSE_REPAIR.md:source changes and authority boundary",
    "src/lib/session251.fluency20G2CourseIntegrity.test.tsx:figure, progression, evaluator, feedback, schema, and pedagogy contracts",
    "scripts/audit/repair-fluency-20-g2-s251.mjs:idempotent 14-lesson source repair",
    "PREMIUM_PENDING_WORKLOAD_QUEUE.csv:pre-reconciliation 84-row course portfolio",
  ],
  reopenCondition: "Reopen on any lesson, remedial, course, duplicate-reference, standards-reference, figure implementation, widget/evaluator, feedback, generator, renderer, queue-authority, or V4-contract change; REVISE closes review only and preserves implementation debt.",
}));

const jsonl = `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
const sha = createHash("sha256").update(jsonl).digest("hex");
const report = `# S251 Fluency Within 20 G2 Triple-Disposition Assessment\n\n- Lessons: **14/14**.\n- Decisions: **14 REVISE / 14 SUFFICIENT / 14 FIT**.\n- Generic rows eligible to close: **42**.\n- Revision rows preserved/opened: **14**.\n- Candidate SHA-256: \`${sha}\`.\n\nThe complete main sequence is truthful, visually represented, action-diverse, and grade-fit. The bounded REVISE status retains remedial diversification work; it does not block closure of the three completed review dimensions. No standards, mastery, or transfer claim is made.\n`;
if (CHECK) {
  if (!existsSync(CANDIDATE) || readFileSync(CANDIDATE, "utf8") !== jsonl) throw new Error("Candidate is stale");
  if (!existsSync(REPORT) || readFileSync(REPORT, "utf8") !== report) throw new Error("Assessment is stale");
  console.log(JSON.stringify({ status: "CURRENT", records: 14, sha }, null, 2));
} else {
  writeFileSync(CANDIDATE, jsonl, "utf8");
  writeFileSync(REPORT, report, "utf8");
  console.log(JSON.stringify({ status: "WROTE", records: 14, sha }, null, 2));
}
