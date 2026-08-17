import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = join(ROOT, "reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const SCRIPT_PATH = join(ROOT, "scripts", "audit", "lesson-review-cards-s244.mjs");
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

interface Card {
  reviewCardId: string;
  lessonId: string;
  source: string;
  lessonSourceHash: string;
  courseSource: string;
  courseSourceHash: string;
  lessonCourseBasisHash: string;
  reviewBasisHash: string;
  reviewCardHash: string;
  disposition: {
    status: string;
    decision: "KEEP" | "REVISE" | "ESCALATE" | null;
    recordId: string | null;
    reviewer: string | null;
    reviewedBasisHash: string | null;
  };
  reviewStatus: { queueSourceStatus: string };
  duplicates: {
    clusterCount: number;
    placementCount: number;
    withinLessonGroupCount: number;
    clusterIds: string[];
    clusterRefs: Array<{ clusterId: string; placementCount: number; withinLesson: boolean; stepIds: string[] }>;
  };
  standards: {
    dossierCount: number;
    pendingEdgeCount: number;
    approvedEdgeCount: number;
    rejectedEdgeCount: number;
    edgeIds: string[];
    edgeRefs: Array<{ edgeId: string; reviewStatus: string; decisionIntegrityStatus: string }>;
    alignmentClaimAllowed: boolean;
    masteryClaimAllowed: boolean;
    lessonClosureAllowed: boolean;
  };
  priorInteractionClosureClassification: { decision: string; authorityBoundary: string } | null;
}

interface ReviewCardsReport {
  generatedAt: string;
  sourceSeals: { queueCompatibleLessonCurriculum: string; curriculumReviewBasis: string };
  summary: {
    lessonCount: number;
    disposition: { explicitDecisions: number; pendingHumanDecisions: number };
    duplicates: { clusterCount: number; placementCount: number; affectedLessonCount: number; withinLessonGroupCount: number };
    standards: {
      dossierCount: number;
      lessonEdgeReferenceCount: number;
      sharedAcrossLessonsEdgeCount: number;
      extraSharedLessonReferenceCount: number;
      pendingEdgeCount: number;
      approvedEdgeCount: number;
      rejectedEdgeCount: number;
      lessonsWithCandidateEvidenceMap: number;
      lessonsMissingCandidateEvidenceMap: number;
      invalidDecisionCount: number;
    };
    queue: { sourceStatus: string; declaredCurriculumSeal: string | null };
    priorInteractionClassification: { importedAsV4DispositionCount: number };
    lessonDecisionLedger: { historyRecordCount: number; currentCount: number; staleCount: number; invalidCount: number };
  };
  duplicateClusters: Array<{ clusterId: string; placementCount: number; placements: Array<{ lessonId: string }> }>;
  cards: Card[];
}

const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as ReviewCardsReport;

describe("S244 source-sealed lesson review cards", () => {
  it("is a byte-current deterministic materialized view", () => {
    expect(() => execFileSync(process.execPath, [SCRIPT_PATH, "--check"], { cwd: ROOT, stdio: "pipe" })).not.toThrow();
    expect(report.generatedAt).toBe("deterministic");
  });

  it("binds every card to its live lesson and course metadata", () => {
    expect(report.cards).toHaveLength(1701);
    expect(new Set(report.cards.map((card) => card.lessonId)).size).toBe(1701);
    expect(new Set(report.cards.map((card) => card.reviewCardId)).size).toBe(1701);

    for (const card of report.cards) {
      const lessonRaw = readFileSync(join(ROOT, card.source), "utf8");
      const courseRaw = readFileSync(join(ROOT, card.courseSource), "utf8");
      expect(card.lessonSourceHash, card.lessonId).toBe(hash(lessonRaw));
      expect(card.courseSourceHash, card.lessonId).toBe(hash(courseRaw));
      expect(card.lessonCourseBasisHash, card.lessonId).toBe(hash(`${card.source}\0${lessonRaw}\0${card.courseSource}\0${courseRaw}\0`));
      expect(card.reviewBasisHash, card.lessonId).toBe(hash(stable({
        lessonCourseBasisHash: card.lessonCourseBasisHash,
        duplicateClusters: card.duplicates.clusterRefs,
        standardsEdges: card.standards.edgeRefs
      })));
      const { reviewCardHash, ...core } = card;
      expect(reviewCardHash, card.lessonId).toBe(hash(stable(core)));
    }

    const lessonSeal = hash(report.cards.map((card) => `${card.source}\0${readFileSync(join(ROOT, card.source), "utf8")}\0`).join(""));
    const courses = [...new Set(report.cards.map((card) => card.courseSource))].sort();
    const reviewBasisSeal = hash([
      ...courses.map((source) => `${source}\0${readFileSync(join(ROOT, source), "utf8")}\0`),
      ...report.cards.map((card) => `${card.source}\0${readFileSync(join(ROOT, card.source), "utf8")}\0`)
    ].join(""));
    expect(report.sourceSeals.queueCompatibleLessonCurriculum).toBe(lessonSeal);
    expect(report.sourceSeals.curriculumReviewBasis).toBe(reviewBasisSeal);
    expect(report.summary.queue.sourceStatus).toBe(
      report.summary.queue.declaredCurriculumSeal === lessonSeal ? "SOURCE_SEAL_MATCH" : "STALE_SOURCE_SEAL"
    );
    expect(new Set(report.cards.map((card) => card.reviewStatus.queueSourceStatus))).toEqual(new Set([report.summary.queue.sourceStatus]));
  });

  it("never imports mechanical KEEP labels or candidate evidence as semantic approval", () => {
    expect(report.summary.priorInteractionClassification.importedAsV4DispositionCount).toBe(0);
    expect(report.summary.lessonDecisionLedger.historyRecordCount).toBe(0);
    expect(report.summary.lessonDecisionLedger.currentCount).toBe(0);
    expect(report.summary.lessonDecisionLedger.staleCount).toBe(0);
    expect(report.summary.lessonDecisionLedger.invalidCount).toBe(0);
    expect(report.summary.disposition).toEqual({ explicitDecisions: 0, pendingHumanDecisions: 1701 });
    for (const card of report.cards) {
      expect(card.disposition.decision, card.lessonId).toBeNull();
      expect(card.disposition.status, card.lessonId).toBe("PENDING_EXPLICIT_HUMAN_DECISION");
      if (card.priorInteractionClosureClassification?.decision === "KEEP") {
        expect(card.disposition.decision, card.lessonId).not.toBe("KEEP");
      }
      expect(card.standards.alignmentClaimAllowed, card.lessonId).toBe(false);
      expect(card.standards.masteryClaimAllowed, card.lessonId).toBe(false);
      expect(card.standards.lessonClosureAllowed, card.lessonId).toBe(false);
    }
  });

  it("publishes stable exact-MCQ cluster references and reconciled live counts", () => {
    expect(report.summary.duplicates).toMatchObject({
      clusterCount: 136,
      placementCount: 314,
      affectedLessonCount: 192,
      withinLessonGroupCount: 49
    });
    expect(report.duplicateClusters).toHaveLength(136);
    expect(new Set(report.duplicateClusters.map((cluster) => cluster.clusterId)).size).toBe(136);
    expect(report.duplicateClusters.reduce((total, cluster) => total + cluster.placementCount, 0)).toBe(314);
    expect(report.cards.reduce((total, card) => total + card.duplicates.placementCount, 0)).toBe(314);
    expect(report.cards.reduce((total, card) => total + card.duplicates.withinLessonGroupCount, 0)).toBe(49);
    expect(new Set(report.cards.flatMap((card) => card.duplicates.clusterIds)).size).toBe(136);
  });

  it("keeps every standards packet candidate-only until a valid explicit decision exists", () => {
    expect(report.summary.standards).toMatchObject({
      dossierCount: 6119,
      lessonEdgeReferenceCount: 6301,
      sharedAcrossLessonsEdgeCount: 162,
      extraSharedLessonReferenceCount: 182,
      pendingEdgeCount: 6119,
      approvedEdgeCount: 0,
      rejectedEdgeCount: 0,
      lessonsWithCandidateEvidenceMap: 1129,
      lessonsMissingCandidateEvidenceMap: 572,
      invalidDecisionCount: 0
    });
    expect(report.cards.reduce((total, card) => total + card.standards.dossierCount, 0)).toBe(6301);
    const edgeIds = report.cards.flatMap((card) => card.standards.edgeIds);
    expect(edgeIds).toHaveLength(6301);
    expect(new Set(edgeIds).size).toBe(6119);
    for (const card of report.cards) {
      expect(card.standards.approvedEdgeCount, card.lessonId).toBe(0);
      expect(card.standards.rejectedEdgeCount, card.lessonId).toBe(0);
      expect(card.standards.pendingEdgeCount, card.lessonId).toBe(card.standards.dossierCount);
      for (const edge of card.standards.edgeRefs) {
        expect(edge.reviewStatus, edge.edgeId).toBe("ready-for-human-review");
        expect(edge.decisionIntegrityStatus, edge.edgeId).toBe("NO_EXPLICIT_HUMAN_DECISION");
      }
    }
  });
});
