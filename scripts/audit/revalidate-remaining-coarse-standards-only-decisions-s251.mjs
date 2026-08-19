#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash } from "../standards/decision-contract.mjs";
import { deriveLessonReviewBasisHash, loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const root = process.cwd();
const generate = process.argv.includes("--generate");
const candidatePath = "reports/closure/candidates/S251_REMAINING_COARSE_STANDARDS_ONLY_LESSON_SUPERSESSIONS.jsonl";
const reportPath = "reports/closure/S251_REMAINING_COARSE_STANDARDS_ONLY_LESSON_SUPERSESSIONS.md";
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "reports/standards/S251_REMAINING_COARSE_SCOPE_PORTFOLIO.json"), "utf8"));
const changedEdgeIds = new Set(manifest.packetFiles.flatMap((relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line).edgeId)));
if (changedEdgeIds.size !== 2560) throw new Error(`Expected 2560 changed standards edges, found ${changedEdgeIds.size}`);

const authority = loadLessonReviewAuthority(root);
const dossierByEdge = new Map(authority.standards.dossierDoc.dossiers.map((dossier) => [dossier.edgeId, dossier]));
const recoverable = [];
const unrelated = [];
for (const lesson of authority.lessons) {
  const disposition = authority.lessonDecisions.byLesson.get(lesson.lessonId);
  if (disposition?.status !== "STALE_HUMAN_DECISION") continue;
  const priorStandardsEdges = (authority.standards.byLesson.get(lesson.lessonId) ?? []).map((edge) => {
    if (!changedEdgeIds.has(edge.edgeId) || edge.reviewStatus !== "rejected") return edge;
    const dossier = dossierByEdge.get(edge.edgeId);
    if (!dossier) throw new Error(`${edge.edgeId}: missing dossier`);
    return { ...edge, dossierHash: candidateDossierHash(dossier), reviewStatus: "candidate", decisionIntegrityStatus: "NO_EXPLICIT_HUMAN_DECISION" };
  });
  const reconstructedPriorBasis = deriveLessonReviewBasisHash({
    lessonCourseBasisHash: lesson.lessonCourseBasisHash,
    duplicateClusters: authority.duplicateInventory.byLesson.get(lesson.lessonId) ?? [],
    standardsEdges: priorStandardsEdges,
  });
  const entry = { lesson, disposition, reconstructedPriorBasis };
  if (reconstructedPriorBasis === disposition.record.reviewedBasisHash) recoverable.push(entry);
  else unrelated.push(entry);
}
if (authority.lessonDecisions.summary.staleCount !== 110 || recoverable.length !== 53 || unrelated.length !== 57) {
  throw new Error(`Expected 110 stale = 53 standards-only + 57 unrelated; found ${authority.lessonDecisions.summary.staleCount} = ${recoverable.length} + ${unrelated.length}`);
}

const records = recoverable.map(({ lesson, disposition }) => {
  const prior = disposition.record;
  return {
    recordType: "lesson-disposition",
    recordId: `S251-COARSE-BASIS-${lesson.lessonId}`,
    lessonId: lesson.lessonId,
    reviewedBasisHash: lesson.reviewBasisHash,
    decision: prior.decision,
    visualDecision: prior.visualDecision,
    gradeLanguageDecision: prior.gradeLanguageDecision,
    reviewer: "ChatGPT Work independent basis-only assessor (remaining coarse-locator closure)",
    reviewedAt: "2026-08-18T23:59:00.000Z",
    rationale: `Independent revalidation reproduced the prior signed review basis exactly after changing only the S251 coarse standards-locator edge states from their new rejected status back to their former candidate status. Lesson source, course source, exact-MCQ duplicate inputs, and every standards reference outside the 2,560-edge S251 portfolio are unchanged from the reviewed basis. The new standards decisions narrow unsupported alignment claims and do not alter the lesson, visual, or grade-language judgment. Prior assessment: ${prior.rationale}`,
    evidenceRefs: [
      ...prior.evidenceRefs,
      `reports/standards/S251_REMAINING_COARSE_SCOPE_PORTFOLIO.md:${lesson.lessonId} standards-only basis change`,
      `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl:${prior.recordId} prior signed decision`,
      `reports/closure/LESSON_REVIEW_CARDS_S244.json:${lesson.lessonId} live source basis`,
      "reports/closure/S251_REMAINING_COARSE_STANDARDS_ONLY_LESSON_SUPERSESSIONS.md:exact prior-basis reconstruction",
    ],
    reopenCondition: prior.reopenCondition,
  };
});
if (new Set(records.map((record) => record.recordId)).size !== 53 || new Set(records.map((record) => record.lessonId)).size !== 53) throw new Error("Supersession identity collision");
const candidateText = `${records.map(JSON.stringify).join("\n")}\n`;
if (generate) {
  fs.writeFileSync(path.join(root, candidatePath), candidateText, "utf8");
  fs.writeFileSync(path.join(root, reportPath), `# S251 remaining-coarse standards-only lesson supersessions\n\n- Stale lesson decisions before review: 110.\n- Exact prior-basis reconstructions: 53.\n- Unrelated stale decisions retained open: 57.\n- Candidate supersessions: 53.\n- Standards status changes tested: 2,560.\n- Candidate SHA-256: \`${sha(candidateText)}\`.\n\nFor every superseded decision, reconstructing the pre-S251 basis from the current lesson/course, duplicate inventory, and standards edge set yields the exact previously signed \`reviewedBasisHash\`. Only standards locator statuses changed. No decision is copied from the 57 unrelated stale records.\n`, "utf8");
}
if (fs.readFileSync(path.join(root, candidatePath), "utf8") !== candidateText) throw new Error("Candidate packet is not byte-current");
console.log(JSON.stringify({ status: "PASS", stale: 110, standardsOnly: 53, unrelatedStillStale: 57, changedEdges: changedEdgeIds.size, candidateSha256: sha(candidateText), lessonIds: records.map((record) => record.lessonId) }, null, 2));
