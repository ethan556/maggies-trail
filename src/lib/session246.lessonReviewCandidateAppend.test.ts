import { describe, expect, it } from "vitest";
// @ts-expect-error Audit ESM modules intentionally have no generated declarations.
import { planLessonReviewAppend } from "../../scripts/audit/append-lesson-review-candidates-s246.mjs";

const requiredDecisionFields = [
  "recordId", "lessonId", "reviewedBasisHash", "decision", "visualDecision", "gradeLanguageDecision",
  "reviewer", "reviewedAt", "rationale", "evidenceRefs", "reopenCondition"
];
const schema = {
  recordType: "schema", schemaVersion: 1,
  contract: {
    allowedLessonDecisions: ["KEEP", "REVISE", "ESCALATE"],
    allowedVisualDecisions: ["REQUIRED", "PREFERRED", "SUFFICIENT", "ESCALATE"],
    allowedGradeLanguageDecisions: ["FIT", "REVISE", "ESCALATE"],
    requiredDecisionFields
  }
};
const basis = "a".repeat(64);
const lessons = [{ lessonId: "a", reviewBasisHash: basis }, { lessonId: "b", reviewBasisHash: basis }, { lessonId: "c", reviewBasisHash: basis }];
const ledger = `${JSON.stringify(schema)}\n`;

function record(lessonId: string, overrides: Record<string, unknown> = {}) {
  return {
    recordType: "lesson-disposition", recordId: `record-${lessonId}`, lessonId, reviewedBasisHash: basis,
    decision: "KEEP", visualDecision: "SUFFICIENT", gradeLanguageDecision: "FIT", reviewer: "reviewer",
    reviewedAt: "2026-08-18T12:00:00.000Z", rationale: "Current complete review.", evidenceRefs: ["evidence"],
    reopenCondition: "Reopen when the basis changes.", ...overrides
  };
}
const source = (path: string, ...records: Array<Record<string, unknown>>) => ({ path, raw: `${records.map((item) => JSON.stringify(item)).join("\n")}\n` });

describe("S246 bounded lesson-review candidate appender", () => {
  it("preserves deterministic file/line order and returns exact distributions", () => {
    const candidateSources = [
      source("first.jsonl", record("b", { decision: "REVISE", visualDecision: "REQUIRED", gradeLanguageDecision: "REVISE" })),
      source("second.jsonl", record("a"))
    ];
    const first = planLessonReviewAppend({ ledgerRaw: ledger, candidateSources, lessons });
    const second = planLessonReviewAppend({ ledgerRaw: ledger, candidateSources, lessons });
    expect(first.appendedText).toBe(second.appendedText);
    expect(first.records.map((item: { lessonId: string }) => item.lessonId)).toEqual(["b", "a"]);
    expect(first.summary).toMatchObject({
      recordCount: 2, ledgerHistoryBefore: 0, ledgerHistoryAfter: 2,
      decision: { KEEP: 1, REVISE: 1 }, visualDecision: { REQUIRED: 1, SUFFICIENT: 1 }, gradeLanguageDecision: { FIT: 1, REVISE: 1 }
    });
  });

  it("rejects duplicate record IDs and lesson IDs within a batch", () => {
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger,
      candidateSources: [source("batch.jsonl", record("a"), record("b", { recordId: "record-a" }))], lessons
    })).toThrow(/duplicates recordId/);
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger,
      candidateSources: [source("batch.jsonl", record("a"), record("a", { recordId: "another" }))], lessons
    })).toThrow(/duplicates lessonId/);
  });

  it("rejects a historical record ID but accepts one fresh superseding record for a reviewed lesson", () => {
    const existing = `${ledger}${JSON.stringify(record("a"))}\n`;
    expect(() => planLessonReviewAppend({
      ledgerRaw: existing, candidateSources: [source("batch.jsonl", record("b", { recordId: "record-a" }))], lessons
    })).toThrow(/recordId .* already exists/);
    const superseding = planLessonReviewAppend({
      ledgerRaw: existing,
      candidateSources: [source("batch.jsonl", record("a", { recordId: "record-a-v2", rationale: "Fresh current reassessment." }))],
      lessons
    });
    expect(superseding.summary).toMatchObject({ recordCount: 1, ledgerHistoryBefore: 1, ledgerHistoryAfter: 2 });
    expect(superseding.records[0]).toMatchObject({ lessonId: "a", recordId: "record-a-v2" });
  });

  it("requires exact fields and a current live basis", () => {
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger, candidateSources: [source("batch.jsonl", { ...record("a"), extra: true })], lessons
    })).toThrow(/fields must exactly match/);
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger, candidateSources: [source("batch.jsonl", record("a", { reviewedBasisHash: "b".repeat(64) }))], lessons
    })).toThrow(/STALE_HUMAN_DECISION/);
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger, candidateSources: [source("batch.jsonl", record("a", { decision: "AUTO_KEEP" }))], lessons
    })).toThrow(/INVALID_HUMAN_DECISION/);
  });

  it("rejects unknown lessons and batches over the configured bound", () => {
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger, candidateSources: [source("batch.jsonl", record("unknown"))], lessons
    })).toThrow(/unknown lesson/);
    expect(() => planLessonReviewAppend({
      ledgerRaw: ledger, candidateSources: [source("batch.jsonl", record("a"), record("b"))], lessons, maxRecords: 1
    })).toThrow(/bounded limit/);
  });
});
