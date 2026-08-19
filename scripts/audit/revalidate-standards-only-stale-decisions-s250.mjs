#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash } from "../standards/decision-contract.mjs";
import { deriveLessonReviewBasisHash, loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const root = process.cwd();
const generate = process.argv.includes("--generate");
const candidatePath = "reports/closure/candidates/S250_TX_K8_STANDARDS_ONLY_LESSON_SUPERSESSIONS.jsonl";
const reportPath = "reports/closure/S250_TX_K8_STANDARDS_ONLY_LESSON_SUPERSESSIONS.md";
const k8Codes = new Set(["§111.3", "§111.4", "§111.5", "§111.6", "§111.7", "§111.26", "§111.27", "§111.28"]);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const authority = loadLessonReviewAuthority(root);
const dossierByEdge = new Map(authority.standards.dossierDoc.dossiers.map((dossier) => [dossier.edgeId, dossier]));
const recoverable = [];
const unrelated = [];

for (const lesson of authority.lessons) {
  const disposition = authority.lessonDecisions.byLesson.get(lesson.lessonId);
  if (disposition?.status !== "STALE_HUMAN_DECISION") continue;
  const priorStandardsEdges = (authority.standards.byLesson.get(lesson.lessonId) ?? []).map((edge) => {
    if (!k8Codes.has(edge.candidateCode) || edge.reviewStatus !== "rejected") return edge;
    const dossier = dossierByEdge.get(edge.edgeId);
    if (!dossier) throw new Error(`${edge.edgeId}: missing dossier`);
    return {
      ...edge,
      dossierHash: candidateDossierHash(dossier),
      reviewStatus: "candidate",
      decisionIntegrityStatus: "NO_EXPLICIT_HUMAN_DECISION",
    };
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
    recordId: `S250-TXK8-BASIS-${lesson.lessonId}`,
    lessonId: lesson.lessonId,
    reviewedBasisHash: lesson.reviewBasisHash,
    decision: prior.decision,
    visualDecision: prior.visualDecision,
    gradeLanguageDecision: prior.gradeLanguageDecision,
    reviewer: "ChatGPT Work independent basis-only assessor (Texas K–8 locator closure)",
    reviewedAt: "2026-08-18T23:58:00.000Z",
    rationale: `Independent revalidation reproduced the prior signed review basis exactly after changing only the eight Texas K–8 coarse-locator edge states from their new rejected status back to their former candidate status. The lesson source, course source, exact-MCQ duplicate inputs, and every non-Texas-K–8 standards reference are unchanged from the reviewed basis. The new standards decisions narrow unsupported alignment claims and do not alter the lesson, visual, or grade-language judgment. Prior assessment: ${prior.rationale}`,
    evidenceRefs: [
      ...prior.evidenceRefs,
      `reports/standards/S250_TX_TEKS_K8_GRADE_SCOPE_PORTFOLIO.md:${lesson.lessonId} standards-only basis change`,
      `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl:${prior.recordId} prior signed decision`,
      `reports/closure/LESSON_REVIEW_CARDS_S244.json:${lesson.lessonId} current source-sealed card`,
      "reports/closure/S250_TX_K8_STANDARDS_ONLY_LESSON_SUPERSESSIONS.md:exact prior-basis reconstruction",
    ],
    reopenCondition: prior.reopenCondition,
  };
});

if (new Set(records.map((record) => record.recordId)).size !== 53 || new Set(records.map((record) => record.lessonId)).size !== 53) {
  throw new Error("Supersession identity collision");
}
const candidateText = `${records.map(JSON.stringify).join("\n")}\n`;
if (generate) {
  fs.writeFileSync(path.join(root, candidatePath), candidateText, "utf8");
  fs.writeFileSync(path.join(root, reportPath), `# S250 Texas K–8 standards-only lesson supersessions

- Stale lesson decisions before review: 110.
- Exact prior-basis reconstructions: 53.
- Unrelated stale decisions retained open: 57.
- Candidate supersessions: 53.
- Decision distribution: ${JSON.stringify(Object.fromEntries([...new Set(records.map((record) => record.decision))].map((value) => [value, records.filter((record) => record.decision === value).length])))}.
- Visual distribution: ${JSON.stringify(Object.fromEntries([...new Set(records.map((record) => record.visualDecision))].map((value) => [value, records.filter((record) => record.visualDecision === value).length])))}.
- Language distribution: ${JSON.stringify(Object.fromEntries([...new Set(records.map((record) => record.gradeLanguageDecision))].map((value) => [value, records.filter((record) => record.gradeLanguageDecision === value).length])))}.
- Candidate SHA-256: \`${sha(candidateText)}\`.

For every superseded decision, reconstructing the pre-Texas-K–8 basis from the current lesson/course, duplicate inventory, and standards edge set yields the exact previously signed \`reviewedBasisHash\`. The only changed components are the eight coarse Texas grade-section edge statuses and their candidate/rejected integrity labels. No decision is copied from the 57 unrelated stale records.

The original decision, rationale, evidence, and reopen condition remain preserved. Each new record explicitly revalidates the current basis and adds the current standards portfolio, prior record, current card, and this audit as evidence.
`, "utf8");
}

const existing = fs.readFileSync(path.join(root, candidatePath), "utf8");
if (existing !== candidateText) throw new Error("Candidate packet is not byte-current");
console.log(JSON.stringify({ status: "PASS", stale: 110, standardsOnly: 53, unrelatedStillStale: 57, candidateSha256: sha(candidateText), lessonIds: records.map((record) => record.lessonId) }, null, 2));
