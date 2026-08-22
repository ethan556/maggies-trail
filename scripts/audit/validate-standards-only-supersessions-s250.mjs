#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { candidateDossierHash } from "../standards/decision-contract.mjs";
import { deriveLessonReviewBasisHash, loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const root = process.cwd();
const candidatePath = path.join(root, "reports/closure/candidates/S250_TX_K8_STANDARDS_ONLY_LESSON_SUPERSESSIONS.jsonl");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const parse = (file) => fs.readFileSync(file, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const candidates = parse(candidatePath);
const ledger = parse(ledgerPath).filter((record) => record.recordType === "lesson-disposition");
const authority = loadLessonReviewAuthority(root);
const dossierByEdge = new Map(authority.standards.dossierDoc.dossiers.map((dossier) => [dossier.edgeId, dossier]));
const k8Codes = new Set(["§111.3", "§111.4", "§111.5", "§111.6", "§111.7", "§111.26", "§111.27", "§111.28"]);

if (candidates.length !== 53 || new Set(candidates.map((record) => record.recordId)).size !== 53 || new Set(candidates.map((record) => record.lessonId)).size !== 53) throw new Error("Candidate identity/count drift");
if (authority.lessonDecisions.summary.historyRecordCount !== 286 || authority.lessonDecisions.summary.currentCount !== 170
  || authority.lessonDecisions.summary.staleCount !== 57 || authority.lessonDecisions.summary.invalidCount !== 0) throw new Error("Post-append authority summary drift");

for (const candidate of candidates) {
  const lesson = authority.lessons.find((item) => item.lessonId === candidate.lessonId);
  const disposition = authority.lessonDecisions.byLesson.get(candidate.lessonId);
  if (!lesson || disposition?.status !== "CURRENT_HUMAN_DECISION" || JSON.stringify(disposition.record) !== JSON.stringify(candidate)) throw new Error(`${candidate.lessonId}: candidate is not exact current authority`);
  const history = ledger.filter((record) => record.lessonId === candidate.lessonId);
  if (history.length < 2 || history.at(-1).recordId !== candidate.recordId) throw new Error(`${candidate.lessonId}: append history drift`);
  const prior = history.at(-2);
  if (candidate.decision !== prior.decision || candidate.visualDecision !== prior.visualDecision || candidate.gradeLanguageDecision !== prior.gradeLanguageDecision || candidate.reopenCondition !== prior.reopenCondition) throw new Error(`${candidate.lessonId}: judgment drift`);

  const priorStandardsEdges = (authority.standards.byLesson.get(candidate.lessonId) ?? []).map((edge) => {
    if (!k8Codes.has(edge.candidateCode) || edge.reviewStatus !== "rejected") return edge;
    const dossier = dossierByEdge.get(edge.edgeId);
    if (!dossier) throw new Error(`${edge.edgeId}: missing dossier`);
    return { ...edge, dossierHash: candidateDossierHash(dossier), reviewStatus: "candidate", decisionIntegrityStatus: "NO_EXPLICIT_HUMAN_DECISION" };
  });
  const priorBasis = deriveLessonReviewBasisHash({ lessonCourseBasisHash: lesson.lessonCourseBasisHash, duplicateClusters: authority.duplicateInventory.byLesson.get(candidate.lessonId) ?? [], standardsEdges: priorStandardsEdges });
  if (priorBasis !== prior.reviewedBasisHash || candidate.reviewedBasisHash !== lesson.reviewBasisHash) throw new Error(`${candidate.lessonId}: basis reconstruction drift`);
}

const stillStale = authority.lessons.filter((lesson) => authority.lessonDecisions.byLesson.get(lesson.lessonId)?.status === "STALE_HUMAN_DECISION");
if (stillStale.length !== 57 || stillStale.some((lesson) => candidates.some((candidate) => candidate.lessonId === lesson.lessonId))) throw new Error("Unrelated stale boundary drift");
const raw = fs.readFileSync(candidatePath, "utf8");
console.log(JSON.stringify({ status: "PASS", exactCurrentSupersessions: candidates.length, ledgerHistory: ledger.length, current: 170, unrelatedStillStale: 57, invalid: 0, candidateSha256: sha(raw) }, null, 2));
