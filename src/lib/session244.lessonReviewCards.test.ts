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
      explicitDecisionCount: number;
      validExplicitDecisionCount: number;
      pendingEdgeCount: number;
      partialEdgeCount: number;
      approvedEdgeCount: number;
      rejectedEdgeCount: number;
      needsExactBenchmarkCount: number;
      lessonsWithCandidateEvidenceMap: number;
      lessonsMissingCandidateEvidenceMap: number;
      inconsistentDecisionCount: number;
      invalidDecisionCount: number;
      unboundDecisionCount: number;
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
      clusterCount: 126,
      placementCount: 288,
      affectedLessonCount: 179,
      withinLessonGroupCount: 49
    });
    expect(report.duplicateClusters).toHaveLength(126);
    expect(new Set(report.duplicateClusters.map((cluster) => cluster.clusterId)).size).toBe(126);
    expect(report.duplicateClusters.reduce((total, cluster) => total + cluster.placementCount, 0)).toBe(288);
    expect(report.cards.reduce((total, card) => total + card.duplicates.placementCount, 0)).toBe(288);
    expect(report.cards.reduce((total, card) => total + card.duplicates.withinLessonGroupCount, 0)).toBe(49);
    expect(new Set(report.cards.flatMap((card) => card.duplicates.clusterIds)).size).toBe(126);
  });

  it("keeps candidate and partial standards packets open until approval or rejection", () => {
    expect(report.summary.standards).toMatchObject({
      dossierCount: 6121,
      lessonEdgeReferenceCount: 6311,
      sharedAcrossLessonsEdgeCount: 164,
      extraSharedLessonReferenceCount: 190,
      explicitDecisionCount: 2,
      validExplicitDecisionCount: 2,
      pendingEdgeCount: 6121,
      partialEdgeCount: 2,
      approvedEdgeCount: 0,
      rejectedEdgeCount: 0,
      needsExactBenchmarkCount: 6119,
      lessonsWithCandidateEvidenceMap: 1134,
      lessonsMissingCandidateEvidenceMap: 567,
      inconsistentDecisionCount: 0,
      invalidDecisionCount: 0,
      unboundDecisionCount: 0
    });
    expect(report.summary.standards.pendingEdgeCount).toBe(report.summary.standards.dossierCount);
    expect(report.cards.reduce((total, card) => total + card.standards.dossierCount, 0)).toBe(6311);

    const edgeRefs = report.cards.flatMap((card) => card.standards.edgeRefs);
    expect(edgeRefs).toHaveLength(6311);
    expect(edgeRefs.filter((edge) => edge.reviewStatus === "candidate")).toHaveLength(6301);
    expect(edgeRefs.filter((edge) => edge.reviewStatus === "partial")).toHaveLength(10);
    expect(edgeRefs.some((edge) => edge.reviewStatus === "ready-for-human-review")).toBe(false);
    expect(new Set(edgeRefs.map((edge) => edge.reviewStatus))).toEqual(new Set(["candidate", "partial"]));

    const uniqueEdges = new Map<string, { reviewStatus: string; decisionIntegrityStatus: string }>();
    for (const edge of edgeRefs) {
      const existing = uniqueEdges.get(edge.edgeId);
      if (existing) expect(edge, edge.edgeId).toMatchObject(existing);
      else uniqueEdges.set(edge.edgeId, edge);
    }
    expect(uniqueEdges.size).toBe(6121);
    expect([...uniqueEdges.values()].filter((edge) => edge.reviewStatus === "candidate")).toHaveLength(6119);
    expect([...uniqueEdges.values()].filter((edge) => edge.reviewStatus === "partial")).toHaveLength(2);

    for (const card of report.cards) {
      expect(card.standards.approvedEdgeCount, card.lessonId).toBe(0);
      expect(card.standards.rejectedEdgeCount, card.lessonId).toBe(0);
      expect(card.standards.pendingEdgeCount, card.lessonId).toBe(card.standards.dossierCount);
      for (const edge of card.standards.edgeRefs) {
        if (edge.reviewStatus === "partial") {
          expect(edge.decisionIntegrityStatus, edge.edgeId).toBe("VALID_EXPLICIT_HUMAN_DECISION");
        } else {
          expect(edge.reviewStatus, edge.edgeId).toBe("candidate");
          expect(edge.decisionIntegrityStatus, edge.edgeId).toBe("NO_EXPLICIT_HUMAN_DECISION");
        }
      }
    }
  });
});
