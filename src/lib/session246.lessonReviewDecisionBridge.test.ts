import { describe, expect, it } from "vitest";
// The authoritative audit contract is intentionally executable Node ESM, shared by both materializers.
// @ts-expect-error The repository does not emit declarations for audit .mjs modules.
import { deriveLessonReviewBasisHash, resolveLessonDecisionLedger, reviewQueueDirective, stable } from "../../scripts/audit/lesson-review-authority-s246.mjs";

const schema = {
  recordType: "schema",
  schemaVersion: 1,
  contract: {
    allowedLessonDecisions: ["KEEP", "REVISE", "ESCALATE"],
    allowedVisualDecisions: ["REQUIRED", "PREFERRED", "SUFFICIENT", "ESCALATE"],
    allowedGradeLanguageDecisions: ["FIT", "REVISE", "ESCALATE"]
  }
};

const basisInput = {
  lessonCourseBasisHash: "source-course-a",
  duplicateClusters: [{ clusterId: "MCQ-a", stepIds: ["k1", "k2"] }],
  standardsEdges: [{ edgeId: "edge-a", dossierHash: "dossier-a", reviewStatus: "candidate" }]
};
const basis = deriveLessonReviewBasisHash(basisInput);
const lessons = [{ lessonId: "keep", reviewBasisHash: basis }, { lessonId: "revise", reviewBasisHash: basis }];

function record(overrides: Record<string, unknown> = {}) {
  return {
    recordType: "lesson-disposition", recordId: "record-1", lessonId: "keep", reviewedBasisHash: basis,
    decision: "KEEP", visualDecision: "SUFFICIENT", gradeLanguageDecision: "FIT",
    reviewer: "independent assessor", reviewedAt: "2026-08-18T12:00:00.000Z",
    rationale: "Complete semantic review of the current source.", evidenceRefs: ["lesson.json#steps"],
    reopenCondition: "Reopen when the review basis changes.", ...overrides
  };
}

function ledger(...records: Array<Record<string, unknown>>) {
  return resolveLessonDecisionLedger({ lessons, raw: [schema, ...records].map((entry) => JSON.stringify(entry)).join("\n") + "\n" });
}

describe("S246 fail-closed lesson review decision bridge", () => {
  it("closes all three review rows for current KEEP without implementation debt", () => {
    const result = ledger(record());
    const decision = result.byLesson.get("keep");
    expect(decision).toMatchObject({ status: "CURRENT_HUMAN_DECISION", decision: "KEEP", errors: [] });
    expect(reviewQueueDirective(decision)).toEqual({ emitGenericReviewRows: false, emitRevisionImplementationRow: false });
    expect(result.summary).toMatchObject({ currentCount: 1, staleCount: 0, invalidCount: 0 });
  });

  it("closes three review rows for current REVISE and creates exactly one implementation row", () => {
    const result = ledger(record({ recordId: "record-2", lessonId: "revise", decision: "REVISE", visualDecision: "REQUIRED", gradeLanguageDecision: "REVISE" }));
    const decision = result.byLesson.get("revise");
    expect(decision).toMatchObject({ status: "CURRENT_HUMAN_DECISION", decision: "REVISE" });
    expect(reviewQueueDirective(decision)).toEqual({ emitGenericReviewRows: false, emitRevisionImplementationRow: true });
  });

  it("fails closed for a stale hash and invalid enum", () => {
    const stale = ledger(record({ reviewedBasisHash: "0".repeat(64) })).byLesson.get("keep");
    expect(stale).toMatchObject({ status: "STALE_HUMAN_DECISION", decision: null });
    expect(reviewQueueDirective(stale)).toEqual({ emitGenericReviewRows: true, emitRevisionImplementationRow: false });
    const invalid = ledger(record({ decision: "AUTO_KEEP" })).byLesson.get("keep");
    expect(invalid).toMatchObject({ status: "INVALID_HUMAN_DECISION", decision: null, errors: ["decision"] });
    expect(reviewQueueDirective(invalid)).toEqual({ emitGenericReviewRows: true, emitRevisionImplementationRow: false });
  });

  it("fails closed for every record that reuses a duplicate record id", () => {
    const result = ledger(record(), record({ lessonId: "revise", decision: "REVISE", recordId: "record-1" }));
    expect(result.byLesson.get("keep")).toMatchObject({ status: "INVALID_HUMAN_DECISION", decision: null, errors: ["duplicateRecordId"] });
    expect(result.byLesson.get("revise")).toMatchObject({ status: "INVALID_HUMAN_DECISION", decision: null, errors: ["duplicateRecordId"] });
    expect(result.summary).toMatchObject({ currentCount: 0, invalidCount: 2, duplicateRecordIdCount: 1 });
  });

  it("invalidates freshness when source/course, duplicate, or standards basis changes", () => {
    const changed = [
      deriveLessonReviewBasisHash({ ...basisInput, lessonCourseBasisHash: "source-course-b" }),
      deriveLessonReviewBasisHash({ ...basisInput, duplicateClusters: [{ clusterId: "MCQ-b", stepIds: ["k1", "k2"] }] }),
      deriveLessonReviewBasisHash({ ...basisInput, standardsEdges: [{ edgeId: "edge-a", dossierHash: "dossier-b", reviewStatus: "candidate" }] })
    ];
    expect(new Set([basis, ...changed]).size).toBe(4);
    for (const reviewBasisHash of changed) {
      const result = resolveLessonDecisionLedger({
        lessons: [{ lessonId: "keep", reviewBasisHash }],
        raw: [schema, record()].map((entry) => JSON.stringify(entry)).join("\n") + "\n"
      });
      expect(result.byLesson.get("keep").status).toBe("STALE_HUMAN_DECISION");
    }
  });

  it("is deterministic with exact generic-review and remediation counts", () => {
    const records = [record(), record({ recordId: "record-2", lessonId: "revise", decision: "ESCALATE", visualDecision: "ESCALATE", gradeLanguageDecision: "ESCALATE" })];
    const first = ledger(...records);
    const second = ledger(...records);
    expect(stable(first.summary)).toBe(stable(second.summary));
    const directives = lessons.map(({ lessonId }) => reviewQueueDirective(first.byLesson.get(lessonId)));
    expect(directives.filter((item: { emitGenericReviewRows: boolean }) => item.emitGenericReviewRows).length * 3).toBe(0);
    expect(directives.filter((item: { emitRevisionImplementationRow: boolean }) => item.emitRevisionImplementationRow)).toHaveLength(1);
  });
});
