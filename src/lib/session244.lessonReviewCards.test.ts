import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = join(ROOT, "reports", "closure", "LESSON_REVIEW_CARDS_S244.json");
const LEDGER_PATH = join(ROOT, "reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
const DUPLICATE_REFERENCE_PATH = join(ROOT, "reports", "mcq", "MCQ_DUPLICATE_ITEM_INDEX.csv");
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
  cardStatus: string;
  disposition: {
    status: string;
    decision: "KEEP" | "REVISE" | "ESCALATE" | null;
    queueStatus: string;
    recordId: string | null;
    reviewer: string | null;
    reviewedBasisHash: string | null;
    visualDecision: "REQUIRED" | "PREFERRED" | "SUFFICIENT" | "ESCALATE" | null;
    gradeLanguageDecision: "FIT" | "REVISE" | "ESCALATE" | null;
  };
  reviewStatus: { queueSourceStatus: string; visual: string; gradeLanguage: string };
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
  sourceSeals: {
    queueCompatibleLessonCurriculum: string;
    curriculumReviewBasis: string;
    duplicateReferenceIndex: string;
    liveDuplicateInventory: string;
  };
  summary: {
    lessonCount: number;
    disposition: { explicitDecisions: number; pendingHumanDecisions: number };
    duplicates: {
      clusterCount: number;
      placementCount: number;
      affectedLessonCount: number;
      withinLessonClusterCount: number;
      withinLessonGroupCount: number;
    };
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
    lessonDecisionLedger: { historyRecordCount: number; currentCount: number; staleCount: number; invalidCount: number; duplicateRecordIdCount: number; unknownLessonRecordCount: number };
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

  it("accepts only current explicit decisions and exposes closed review statuses", () => {
    expect(report.summary.priorInteractionClassification.importedAsV4DispositionCount).toBe(0);
    const ledgerRecords = readFileSync(LEDGER_PATH, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((record) => record.recordType === "lesson-disposition");
    const currentCards = report.cards.filter((card) => card.disposition.status === "CURRENT_HUMAN_DECISION");
    const pendingCards = report.cards.filter((card) => card.disposition.status === "PENDING_EXPLICIT_HUMAN_DECISION");
    const staleCards = report.cards.filter((card) => card.disposition.status === "STALE_HUMAN_DECISION");

    expect(report.summary.lessonDecisionLedger).toEqual({
      historyRecordCount: ledgerRecords.length,
      currentCount: currentCards.length,
      staleCount: staleCards.length,
      invalidCount: 0,
      duplicateRecordIdCount: 0,
      unknownLessonRecordCount: 0
    });
    expect(report.summary.disposition).toEqual({
      explicitDecisions: currentCards.length,
      pendingHumanDecisions: pendingCards.length + staleCards.length
    });

    const keep = report.cards.find((card) => card.lessonId === "dg4-01-01");
    expect(keep).toMatchObject({
      cardStatus: "CURRENT_HUMAN_DISPOSITION",
      disposition: {
        status: "CURRENT_HUMAN_DECISION", decision: "KEEP", queueStatus: "CLOSED_BY_CURRENT_HUMAN_DECISION",
        recordId: "S246-DG4-dg4-01-01", visualDecision: "SUFFICIENT", gradeLanguageDecision: "FIT"
      },
      reviewStatus: { visual: "CLOSED_BY_CURRENT_HUMAN_DECISION:SUFFICIENT", gradeLanguage: "CLOSED_BY_CURRENT_HUMAN_DECISION:FIT" }
    });

    const revise = report.cards.find((card) => card.lessonId === "k100-01-01");
    expect(revise).toMatchObject({
      cardStatus: "CURRENT_HUMAN_DISPOSITION",
      disposition: {
        status: "CURRENT_HUMAN_DECISION", decision: "REVISE", queueStatus: "CLOSED_BY_CURRENT_HUMAN_DECISION",
        recordId: "S246-K100-k100-01-01", visualDecision: "REQUIRED", gradeLanguageDecision: "FIT"
      },
      reviewStatus: { visual: "CLOSED_BY_CURRENT_HUMAN_DECISION:REQUIRED", gradeLanguage: "CLOSED_BY_CURRENT_HUMAN_DECISION:FIT" }
    });

    const repaired = report.cards.find((card) => card.lessonId === "bv-05-03");
    expect(repaired).toMatchObject({
      cardStatus: "CURRENT_HUMAN_DISPOSITION",
      disposition: {
        status: "CURRENT_HUMAN_DECISION", decision: "REVISE", queueStatus: "CLOSED_BY_CURRENT_HUMAN_DECISION",
        recordId: "S247-BV-bv-05-03-OLS-SUPERSESSION", visualDecision: "REQUIRED", gradeLanguageDecision: "FIT"
      },
      reviewStatus: { visual: "CLOSED_BY_CURRENT_HUMAN_DECISION:REQUIRED", gradeLanguage: "CLOSED_BY_CURRENT_HUMAN_DECISION:FIT" }
    });

    const escalate = report.cards.find((card) => card.lessonId === "mf3-02-05");
    expect(escalate).toMatchObject({
      cardStatus: "CURRENT_HUMAN_DISPOSITION",
      disposition: {
        status: "CURRENT_HUMAN_DECISION", decision: "ESCALATE", queueStatus: "CLOSED_BY_CURRENT_HUMAN_DECISION",
        recordId: "S248-MF3-mf3-02-05", visualDecision: "ESCALATE", gradeLanguageDecision: "ESCALATE"
      },
      reviewStatus: { visual: "CLOSED_BY_CURRENT_HUMAN_DECISION:ESCALATE", gradeLanguage: "CLOSED_BY_CURRENT_HUMAN_DECISION:ESCALATE" }
    });

    expect(currentCards.length + pendingCards.length + staleCards.length).toBe(report.cards.length);
    expect(report.summary.disposition.explicitDecisions + report.summary.disposition.pendingHumanDecisions).toBe(report.cards.length);
    expect(report.summary.lessonDecisionLedger.historyRecordCount).toBeGreaterThanOrEqual(currentCards.length + staleCards.length);
    expect(currentCards.every((card) => card.disposition.queueStatus === "CLOSED_BY_CURRENT_HUMAN_DECISION")).toBe(true);
    expect(pendingCards.every((card) => card.disposition.decision === null)).toBe(true);
    for (const card of report.cards) {
      expect(card.standards.alignmentClaimAllowed, card.lessonId).toBe(false);
      expect(card.standards.masteryClaimAllowed, card.lessonId).toBe(false);
      expect(card.standards.lessonClosureAllowed, card.lessonId).toBe(false);
    }
  });

  it("publishes stable exact-MCQ cluster references and reconciled live counts", () => {
    expect(report.sourceSeals.duplicateReferenceIndex).toBe(hash(readFileSync(DUPLICATE_REFERENCE_PATH, "utf8")));
    expect(report.sourceSeals.liveDuplicateInventory).toBe(hash(stable(report.duplicateClusters)));

    const clusterCount = report.duplicateClusters.length;
    const placementCount = report.duplicateClusters.reduce((total, cluster) => total + cluster.placements.length, 0);
    const affectedLessonCount = new Set(report.duplicateClusters.flatMap((cluster) => cluster.placements.map((placement) => placement.lessonId))).size;
    let withinLessonClusterCount = 0;
    let withinLessonGroupCount = 0;
    for (const cluster of report.duplicateClusters) {
      expect(cluster.placementCount, cluster.clusterId).toBe(cluster.placements.length);
      expect(cluster.placements.length, cluster.clusterId).toBeGreaterThan(1);
      const byLesson = new Map<string, number>();
      for (const placement of cluster.placements) byLesson.set(placement.lessonId, (byLesson.get(placement.lessonId) ?? 0) + 1);
      const repeatedLessonGroups = [...byLesson.values()].filter((count) => count > 1).length;
      if (repeatedLessonGroups > 0) withinLessonClusterCount += 1;
      withinLessonGroupCount += repeatedLessonGroups;
    }

    expect(report.summary.duplicates).toEqual({
      clusterCount,
      placementCount,
      affectedLessonCount,
      withinLessonClusterCount,
      withinLessonGroupCount
    });
    expect(new Set(report.duplicateClusters.map((cluster) => cluster.clusterId)).size).toBe(clusterCount);
    expect(report.cards.reduce((total, card) => total + card.duplicates.placementCount, 0)).toBe(placementCount);
    expect(report.cards.reduce((total, card) => total + card.duplicates.withinLessonGroupCount, 0)).toBe(withinLessonGroupCount);
    expect(new Set(report.cards.flatMap((card) => card.duplicates.clusterIds))).toEqual(new Set(report.duplicateClusters.map((cluster) => cluster.clusterId)));
  });

  it("keeps candidate and partial standards packets open until approval or rejection", () => {
    expect(report.summary.standards).toMatchObject({
      dossierCount: 6121,
      lessonEdgeReferenceCount: 6311,
      sharedAcrossLessonsEdgeCount: 164,
      extraSharedLessonReferenceCount: 190,
      explicitDecisionCount: 6121,
      validExplicitDecisionCount: 6121,
      pendingEdgeCount: 2,
      partialEdgeCount: 2,
      approvedEdgeCount: 0,
      rejectedEdgeCount: 6119,
      needsExactBenchmarkCount: 6119,
      lessonsWithCandidateEvidenceMap: 1134,
      lessonsMissingCandidateEvidenceMap: 567,
      inconsistentDecisionCount: 0,
      invalidDecisionCount: 0,
      unboundDecisionCount: 0
    });
    expect(report.summary.standards.pendingEdgeCount + report.summary.standards.rejectedEdgeCount).toBe(report.summary.standards.dossierCount);
    expect(report.cards.reduce((total, card) => total + card.standards.dossierCount, 0)).toBe(6311);

    const edgeRefs = report.cards.flatMap((card) => card.standards.edgeRefs);
    expect(edgeRefs).toHaveLength(6311);
    expect(edgeRefs.filter((edge) => edge.reviewStatus === "candidate")).toHaveLength(0);
    expect(edgeRefs.filter((edge) => edge.reviewStatus === "partial")).toHaveLength(10);
    expect(edgeRefs.some((edge) => edge.reviewStatus === "ready-for-human-review")).toBe(false);
    expect(new Set(edgeRefs.map((edge) => edge.reviewStatus))).toEqual(new Set(["partial", "rejected"]));

    const uniqueEdges = new Map<string, { reviewStatus: string; decisionIntegrityStatus: string }>();
    for (const edge of edgeRefs) {
      const existing = uniqueEdges.get(edge.edgeId);
      if (existing) expect(edge, edge.edgeId).toMatchObject(existing);
      else uniqueEdges.set(edge.edgeId, edge);
    }
    expect(uniqueEdges.size).toBe(6121);
    expect([...uniqueEdges.values()].filter((edge) => edge.reviewStatus === "candidate")).toHaveLength(0);
    expect([...uniqueEdges.values()].filter((edge) => edge.reviewStatus === "partial")).toHaveLength(2);

    for (const card of report.cards) {
      expect(card.standards.approvedEdgeCount, card.lessonId).toBe(0);
      expect(card.standards.pendingEdgeCount + card.standards.rejectedEdgeCount, card.lessonId).toBe(card.standards.dossierCount);
      for (const edge of card.standards.edgeRefs) {
        if (edge.reviewStatus === "partial" || edge.reviewStatus === "rejected") {
          expect(edge.decisionIntegrityStatus, edge.edgeId).toBe("VALID_EXPLICIT_HUMAN_DECISION");
        } else {
          expect(edge.reviewStatus, edge.edgeId).toBe("candidate");
          expect(edge.decisionIntegrityStatus, edge.edgeId).toBe("NO_EXPLICIT_HUMAN_DECISION");
        }
      }
    }
  });
});
