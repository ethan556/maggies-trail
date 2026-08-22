#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const CANDIDATE = join(ROOT, "reports", "closure", "candidates", "S251_G1A_02_06_VISUAL_WORDING_SUPERSESSION.jsonl");
const REPORT = join(ROOT, "reports", "closure", "candidates", "S251_G1A_02_06_VISUAL_WORDING_SUPERSESSION.md");
const authority = loadLessonReviewAuthority(ROOT);
const lesson = authority.lessons.find((entry) => entry.lessonId === "g1a-02-06");
if (!lesson) throw new Error("Missing g1a-02-06 authority lesson");

const record = {
  recordType: "lesson-disposition",
  recordId: "S251-G1A-g1a-02-06-VISUAL-WORDING-SUPERSESSION-V2",
  lessonId: lesson.lessonId,
  reviewedBasisHash: lesson.reviewBasisHash,
  decision: "REVISE",
  visualDecision: "SUFFICIENT",
  gradeLanguageDecision: "FIT",
  reviewer: "Codex course assessor (g1a-02-06 S251 supersession)",
  reviewedAt: "2026-08-18T22:55:00.000Z",
  rationale: "Superseding review after the concept sentence beside tno-count-down-tens was narrowed to the grade-fit invariant that moving upward one chart row counts back one ten. The figure, visible text, narration, accessible description, target, and feedback agree; the adversarial figure/text audit has no conflict. REVISE remains because the remedial route is still same-family immediate practice rather than a distinct misconception diagnosis.",
  evidenceRefs: [
    `${lesson.source}:steps.3 body and narration`,
    "src/components/figureTextAdversarialAudit.test.tsx:global zero-review visual contract",
    "src/lib/session251.addWithin100G1CourseIntegrity.test.tsx:course figure, progression, evaluator, and feedback contracts",
    "scripts/audit/repair-add-within-100-g1-s251.mjs:idempotent current-source repair",
  ],
  reopenCondition: "Reopen on any lesson, course, duplicate-reference, standards-reference, figure implementation, widget/evaluator, feedback, renderer, queue-authority, or V4-contract change.",
};

const jsonl = `${JSON.stringify(record)}\n`;
const sha = createHash("sha256").update(jsonl).digest("hex");
const report = `# S251 g1a-02-06 Visual-Wording Supersession\n\n- Record: **1 current-hash supersession**.\n- Decision: **REVISE / SUFFICIENT / FIT**.\n- Candidate SHA-256: \`${sha}\`.\n- Cause: a final adversarial visual audit exposed numeral-token ambiguity; the learner sentence now states the one-row/one-ten invariant without duplicating the figure's example numerals.\n- Authority: append-only; the preceding S251 course record becomes stale history.\n`;

if (CHECK) {
  if (!existsSync(CANDIDATE) || readFileSync(CANDIDATE, "utf8") !== jsonl) throw new Error("Supersession candidate is stale");
  if (!existsSync(REPORT) || readFileSync(REPORT, "utf8") !== report) throw new Error("Supersession report is stale");
  console.log(JSON.stringify({ status: "CURRENT", records: 1, sha, basis: lesson.reviewBasisHash }, null, 2));
} else {
  writeFileSync(CANDIDATE, jsonl, "utf8");
  writeFileSync(REPORT, report, "utf8");
  console.log(JSON.stringify({ status: "WROTE", records: 1, sha, basis: lesson.reviewBasisHash }, null, 2));
}
