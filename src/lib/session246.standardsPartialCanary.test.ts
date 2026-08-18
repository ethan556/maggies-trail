import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error The standards pipeline contract is intentionally shared with Node scripts.
import { normalizeStandardsDecisionStatus, validateStandardsDecision } from "../../scripts/standards/decision-contract.mjs";

const root = process.cwd();
const read = <T>(file: string): T => JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as T;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S246 standards partial-decision canary", () => {
  it("normalizes the legacy vocabulary without weakening the canonical contract", () => {
    expect(normalizeStandardsDecisionStatus("ready-for-human-review")).toBe("candidate");
    expect(normalizeStandardsDecisionStatus("approve")).toBe("approved");
    expect(normalizeStandardsDecisionStatus("reject")).toBe("rejected");
    expect(normalizeStandardsDecisionStatus("partial")).toBe("partial");
    expect(validateStandardsDecision({ decision:"partial" }).errors).toContain("partial requires claimBoundary");
  });

  it("creates exactly two bounded Common Core dossiers across the five Chapter 1 lessons", () => {
    const doc = read<{ dossiers: Array<Record<string, any>> }>("content/standards/evidence-dossiers.json");
    const scoped = doc.dossiers.filter((dossier) => dossier.courseId === "add-subtract-10-k");
    expect(scoped.map((dossier) => dossier.candidateCode).sort()).toEqual(["K.OA.A.1", "K.OA.A.2"]);
    for (const dossier of scoped) {
      expect(dossier.review.status).toBe("partial");
      expect(dossier.evidenceSummary.lessonIds).toEqual(["koa-01-01", "koa-01-02", "koa-01-03", "koa-01-04", "koa-01-05"]);
      expect(dossier.stepEvidence.some((step: { evidenceRoles: string[] }) => step.evidenceRoles.includes("independent-practice"))).toBe(true);
      expect(dossier.officialUrl).toMatch(/^https:\/\/www\.thecorestandards\.org\/Math\/Content\/K\/OA\/A\/[12]\/$/);
      expect(dossier.claimLimit).toContain("Partial evidence:");
    }
  });

  it("records two valid partial decisions and no approvals or rejections", () => {
    const ledger = read<{ schemaVersion:number; statusContract:string[]; decisions:Array<Record<string, any>> }>("content/standards/human-review-decisions.json");
    expect(ledger.schemaVersion).toBe(2);
    expect(ledger.statusContract).toEqual(["candidate", "partial", "approved", "rejected"]);
    expect(ledger.decisions).toHaveLength(2);
    for (const decision of ledger.decisions) {
      expect(decision.decision).toBe("partial");
      const { signature, ...unsigned } = decision;
      expect(signature).toBe(hash(JSON.stringify(unsigned)));
      expect(validateStandardsDecision(decision).errors).toEqual([]);
    }
    expect(ledger.decisions.some((decision) => ["approved", "rejected"].includes(decision.decision))).toBe(false);
  });

  it("adds candidate-evidence map rows for only the bounded five lessons", () => {
    const map = read<{ lessons:Array<{lessonId:string;courseId:string}> }>("content/standards/lesson-evidence-map.json");
    const scoped = map.lessons.filter((lesson) => lesson.courseId === "add-subtract-10-k");
    expect(scoped.map((lesson) => lesson.lessonId)).toEqual(["koa-01-01", "koa-01-02", "koa-01-03", "koa-01-04", "koa-01-05"]);
  });
});
