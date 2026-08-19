import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "@/components/figureIds";

type Report = {
  sourceHash: string;
  scope: {
    lessonFiles: number;
    figureRegistryIds: number;
    graphWidgetTypes: number;
    graphFigureIds: number;
    widgetRendererDefinitionsResolved: number;
    figureRendererDefinitionsResolved: number;
    authoredConsumers: number;
    graphEmittingGenerators: number;
  };
  consumers: Array<{ consumerId: string }>;
  checks: Array<{ targetKind: string; targetId: string; rule: string; status: string }>;
  portfolios: Array<{ portfolioId: string; affectedTargets: number }>;
  violationsByRule: Record<string, number>;
};

const root = resolve(import.meta.dirname, "../..");
const AUDIT_TIMEOUT_MS = 120_000;
const report = JSON.parse(
  readFileSync(resolve(root, "reports/graph-labeling/GRAPH_FIGURE_LABELING_INVENTORY_S252.json"), "utf8")
) as Report;

describe("S252 graph / statistical-display corpus inventory", () => {
  it("is byte-for-byte source-current", () => {
    execFileSync(process.execPath, [resolve(root, "node_modules/tsx/dist/cli.mjs"), "scripts/audit/graph-figure-labeling-inventory-s252.mts", "--check"], {
      cwd: root,
      stdio: "pipe",
      timeout: AUDIT_TIMEOUT_MS
    });
  }, AUDIT_TIMEOUT_MS + 5_000);

  it("covers the normative renderer scope and the complete live figure registry", () => {
    expect(report.sourceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(report.scope.lessonFiles).toBe(1701);
    expect(report.scope.figureRegistryIds).toBe(FIGURE_IDS.size);
    expect(report.scope.graphWidgetTypes).toBe(59);
    expect(report.scope.widgetRendererDefinitionsResolved).toBe(59);
    expect(report.scope.graphFigureIds).toBeGreaterThan(0);
    expect(report.scope.figureRendererDefinitionsResolved).toBe(report.scope.graphFigureIds);
  });

  it("assigns every authored/remedial placement exactly once", () => {
    expect(report.scope.authoredConsumers).toBe(report.consumers.length);
    expect(new Set(report.consumers.map(row => row.consumerId)).size).toBe(report.consumers.length);
    expect(report.scope.graphEmittingGenerators).toBeGreaterThanOrEqual(17);
  });

  it("checks all eight statically auditable contracts for every classified renderer", () => {
    const targetCount = report.scope.graphWidgetTypes + report.scope.graphFigureIds;
    expect(report.checks).toHaveLength(targetCount * 8);
    const perTarget = new Map<string, Set<string>>();
    for (const row of report.checks) {
      const key = `${row.targetKind}:${row.targetId}`;
      perTarget.set(key, (perTarget.get(key) ?? new Set()).add(row.rule));
      expect(["PASS", "VIOLATION", "REVIEW", "NOT_APPLICABLE"]).toContain(row.status);
    }
    expect([...perTarget.values()].every(rules => rules.size === 8)).toBe(true);
  });

  it("ratchets proved violations while keeping reviews separate", () => {
    const ceilings: Record<string, number> = {
      aria: 0,
      grid: 178,
      labels: 69,
      no_caret: 0,
      no_clipping: 10,
      origin: 169,
      ticks: 257,
      units: 0
    };
    for (const [rule, ceiling] of Object.entries(ceilings)) expect(report.violationsByRule[rule] ?? 0, rule).toBeLessThanOrEqual(ceiling);
    expect(report.portfolios.length).toBeLessThanOrEqual(433);
    expect(report.portfolios.every(row => row.portfolioId.startsWith("GF-") && row.affectedTargets > 0)).toBe(true);
  });
});
