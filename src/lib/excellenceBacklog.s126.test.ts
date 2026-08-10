import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Audit = {
  repositoryRoot: string;
  summary: {
    liveK8Backlog: number;
    classified: number;
    unreviewed: number;
    honestPredictionCeilings: number;
  };
  honestPredictionCeilings: Array<{ lessonId: string; status: string; reason: string }>;
  causalCoverage: Array<{
    band: string;
    widgetSteps: number;
    causalWidgetSteps: number;
    explorationSteps: number;
    causalExplorationSteps: number;
    lessonsWithExploration: number;
    lessonsWithCausalSpine: number;
  }>;
  records: Array<{
    lessonId: string;
    reviewStatus: string;
    assessedClaimEvidence: unknown[];
    fitAcceptanceContract?: string;
    exactFitEvidence: string;
    misconceptionReachability: { status: string; authoredWrongPaths: unknown[] };
  }>;
};

const root = process.cwd();
const auditPath = join(root, "EXCELLENCE_BACKLOG_S126.json");

function regenerate(): Audit {
  execFileSync(process.execPath, [join(root, "scripts", "audit", "excellence-backlog-s126.mjs")], {
    cwd: root,
    stdio: "pipe",
    timeout: 120_000
  });
  return JSON.parse(readFileSync(auditPath, "utf8")) as Audit;
}

describe("Session 126 excellence truth compiler", () => {
  it("classifies the live K–8 queue with zero UNREVIEWED rows", () => {
    const audit = regenerate();
    // A frozen queue size rots on every conversion session (it shipped as 64 at S126 and was
    // 53 by S133 while this test never ran). The durable invariants are internal consistency,
    // zero UNREVIEWED, and the committed report agreeing with the live compiler.
    //
    // S204A: `liveK8Backlog > 0` was one more expiring assumption — it encoded "there is always
    // more K-8 work", which stopped being true when dd-01-01 and kc-02-03, the last two K-8
    // Tier C lessons, were converted. Asserting a non-empty backlog would now require leaving a
    // lesson unconverted purely to satisfy a test. The real invariants below hold at any size,
    // INCLUDING zero, and they are what actually guard against regression: if a K-8 lesson falls
    // back to C/D it reappears in liveK8Backlog and must be classified.
    expect(audit.summary.liveK8Backlog).toBeGreaterThanOrEqual(0);
    expect(audit.summary.classified).toBe(audit.summary.liveK8Backlog);
    expect(audit.summary.unreviewed).toBe(0);
    expect(new Set(audit.records.map((row) => row.lessonId)).size).toBe(audit.summary.liveK8Backlog);
    expect(audit.records.every((row) => row.reviewStatus === "classified")).toBe(true);
    const committed = readFileSync(join(root, "EXCELLENCE_BACKLOG_S126.md"), "utf8");
    expect(committed).toContain(`Live K–8 C/D queue: **${audit.summary.liveK8Backlog}**`);
  });

  it("keeps every classification source-backed and conversion-gated", () => {
    const audit = regenerate();
    for (const row of audit.records) {
      expect(row.assessedClaimEvidence.length, row.lessonId).toBeGreaterThan(0);
      expect(row.exactFitEvidence, row.lessonId).toContain("Acceptance contract:");
      expect(row.misconceptionReachability.status, row.lessonId).not.toBe("");
      expect(Array.isArray(row.misconceptionReachability.authoredWrongPaths), row.lessonId).toBe(true);
    }
  });

  it("detects honest Tier-B prediction ceilings from task structure, not a score-only queue", () => {
    const audit = regenerate();
    const ceilings = new Map(audit.honestPredictionCeilings.map((row) => [row.lessonId, row]));
    expect(ceilings.get("mmt-05-01")?.status).toBe("redundant");
    expect(ceilings.get("mmt-05-02")?.status).toBe("redundant");
    expect(ceilings.get("mmt-05-01")?.reason).toContain("read/count/identify");
    expect(audit.summary.honestPredictionCeilings).toBeGreaterThanOrEqual(2);

    const tierReport = readFileSync(join(root, "FLAGSHIP_TIERS.md"), "utf8");
    expect(tierReport).toContain("Honest Tier-B ceilings");
    expect(tierReport).not.toContain("One gate from Tier A — add a prediction cycle");
  });

  it("publishes denominator-visible causal coverage for every grade band", () => {
    const audit = regenerate();
    expect(audit.causalCoverage.map((row) => row.band)).toEqual(["K–2", "G3–5", "G6–8", "HS"]);
    for (const row of audit.causalCoverage) {
      expect(row.widgetSteps).toBeGreaterThan(0);
      expect(row.causalWidgetSteps).toBeLessThanOrEqual(row.widgetSteps);
      expect(row.causalExplorationSteps).toBeLessThanOrEqual(row.explorationSteps);
      expect(row.lessonsWithCausalSpine).toBeLessThanOrEqual(row.lessonsWithExploration);
    }
  });
});
