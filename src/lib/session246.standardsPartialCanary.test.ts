import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error The standards pipeline contract is intentionally shared with Node scripts.
import { candidateDossierHash, normalizeStandardsDecisionStatus, validateStandardsDecision } from "../../scripts/standards/decision-contract.mjs";

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
      expect(dossier.stepEvidence.some((step: { evidenceRoles: string[] }) => step.evidenceRoles.includes("transfer"))).toBe(false);
      expect(dossier.evidenceSummary.designedEvidence).toEqual({
        exposed:true,
        constructed:true,
        practiced:true,
        transferred:false,
        retrievalReady:false,
        cumulative:false
      });
      expect(dossier.evidenceSummary.directManipulation).toEqual({ coverage:"none" });
      expect(dossier.officialUrl).toMatch(/^https:\/\/www\.thecorestandards\.org\/Math\/Content\/K\/OA\/A\/[12]\/$/);
      expect(dossier.claimLimit).toContain("Partial evidence:");
    }
  });

  it("keeps two valid partial decisions alongside the independently rejected coarse HSF edges", () => {
    const ledger = read<{ schemaVersion:number; statusContract:string[]; decisions:Array<Record<string, any>> }>("content/standards/human-review-decisions.json");
    const dossiers = read<{ dossiers:Array<Record<string, any>> }>("content/standards/evidence-dossiers.json").dossiers;
    expect(ledger.schemaVersion).toBe(2);
    expect(ledger.statusContract).toEqual(["candidate", "partial", "approved", "rejected"]);
    expect(ledger.decisions).toHaveLength(6121);
    for (const decision of ledger.decisions) {

      const { signature, ...unsigned } = decision;
      expect(signature).toBe(hash(JSON.stringify(unsigned)));
      expect(validateStandardsDecision(decision).errors).toEqual([]);
      expect(decision.dossierHash).toBe(candidateDossierHash(dossiers.find((dossier) => dossier.edgeId === decision.edgeId)));
    }
    expect(ledger.decisions.filter((decision) => decision.decision === "partial")).toHaveLength(2);
    expect(ledger.decisions.filter((decision) => decision.decision === "rejected")).toHaveLength(6119);
    expect(ledger.decisions.filter((decision) => decision.decision === "approved")).toHaveLength(0);
  });

  it("adds candidate-evidence map rows for only the bounded five lessons", () => {
    const map = read<{ lessons:Array<{lessonId:string;courseId:string;maxDesignedLevel:number;evidenceRoles:string[]}> }>("content/standards/lesson-evidence-map.json");
    const scoped = map.lessons.filter((lesson) => lesson.courseId === "add-subtract-10-k");
    expect(scoped.map((lesson) => lesson.lessonId)).toEqual(["koa-01-01", "koa-01-02", "koa-01-03", "koa-01-04", "koa-01-05"]);
    expect(scoped.every((lesson) => lesson.maxDesignedLevel === 3)).toBe(true);
    expect(scoped.every((lesson) => JSON.stringify(lesson.evidenceRoles) === JSON.stringify(["exposed", "constructed", "practiced"]))).toBe(true);
  });

  it("derives conservative objective evidence and canonical infrastructure counts", () => {
    const objectives = read<{ objectives:Array<Record<string, any>> }>("content/standards/objectives.json").objectives;
    const scoped = objectives.filter((objective) => objective.courseId === "add-subtract-10-k");
    expect(scoped).toHaveLength(2);
    for (const objective of scoped) {
      expect(objective.practiceStates).toBe(20);
      expect(objective.masteryArcScore).toBe(Object.values(objective.arc).filter(Boolean).length);
      expect(objective.masteryArcScore).toBe(5);
      expect(objective.arc).toMatchObject({
        prediction:true,
        construction:true,
        explanation:true,
        independentSymbolic:true,
        mixedPractice:true,
        linkedConsequence:false,
        nearMiss:false,
        delayedRetrieval:false,
        unfamiliarTransfer:false,
        cumulativeAssessment:false
      });
    }

    const metrics = read<Record<string, number>>("content/mastery/infrastructure-metrics.json");
    expect(metrics).toMatchObject({
      objectives:1167,
      lessons:1134,
      crosswalkEdges:6121,
      provisionalEdges:6121,
      reviewReadyEdges:0,
      humanPartialEdges:2,
      humanApprovedEdges:0,
      humanRejectedEdges:6119
    });
  });

  it("shows partial edges as open work in the standards summary", () => {
    const page = fs.readFileSync(path.join(root, "src/app/(shell)/standards/page.tsx"), "utf8");
    expect(page).toContain("Partial standards edges");
    expect(page).toContain("are partial and still open");
  });
});
