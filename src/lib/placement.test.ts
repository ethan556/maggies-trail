import { describe, expect, it } from "vitest";
import prereqData from "../../content/skill-prereqs.json";
import {
  buildDiagnosticReport,
  estimateAbility,
  nextItem,
  placementRoute,
  responseProbability,
  seedMastery,
  PLACEMENT_BANK,
  type DiagnosticConfidence,
  type PlacementItem,
  type PlacementResponse
} from "./placement";

const prereqs = prereqData.prereqs as Record<string, string[]>;
const response = (item: PlacementItem, correct: boolean, confidence: DiagnosticConfidence = 0.5): PlacementResponse => ({
  itemId: item.id,
  tag: item.tag,
  grade: item.grade,
  domain: item.domain,
  representation: item.representation,
  correct,
  confidence
});

describe("calibrated placement bank", () => {
  it("has two independent probes per level, valid provisional parameters, and real conceptTags", () => {
    const universe = new Set(Object.keys(prereqs));
    for (const values of Object.values(prereqs)) for (const tag of values) universe.add(tag);
    const ids = new Set<string>();
    const tags = new Set<string>();
    const byGrade = new Map<number, number>();
    for (const item of PLACEMENT_BANK) {
      expect(ids.has(item.id)).toBe(false);
      expect(tags.has(item.tag)).toBe(false);
      ids.add(item.id);
      tags.add(item.tag);
      byGrade.set(item.grade, (byGrade.get(item.grade) ?? 0) + 1);
      expect(item.answer).toBeGreaterThanOrEqual(0);
      expect(item.answer).toBeLessThan(item.choices.length);
      expect(item.discrimination).toBeGreaterThan(0);
      expect(item.calibration).toBe("provisional");
      expect(universe.has(item.tag)).toBe(true);
    }
    expect(PLACEMENT_BANK).toHaveLength(28);
    for (let grade = 0; grade <= 13; grade++) expect(byGrade.get(grade)).toBe(2);
  });

  it("probability rises with ability and respects the guessing floor", () => {
    const item = PLACEMENT_BANK.find((row) => row.id === "p-g8-slope")!;
    expect(responseProbability(-4, item)).toBeGreaterThanOrEqual(0.24);
    expect(responseProbability(3, item)).toBeGreaterThan(responseProbability(0, item));
  });
});

describe("domain-balanced adaptive selection", () => {
  it("starts near the chosen grade and never repeats an item or skill", () => {
    const first = nextItem(PLACEMENT_BANK, [], 12, 8)!;
    expect(Math.abs(first.grade - 8)).toBeLessThanOrEqual(1);
    const history: PlacementResponse[] = [];
    const ids = new Set<string>();
    const tags = new Set<string>();
    for (let index = 0; index < 12; index++) {
      const item = nextItem(PLACEMENT_BANK, history, 12, 8);
      if (!item) break;
      expect(ids.has(item.id)).toBe(false);
      expect(tags.has(item.tag)).toBe(false);
      ids.add(item.id);
      tags.add(item.tag);
      history.push(response(item, index % 3 !== 0));
    }
    expect(history).toHaveLength(12);
    expect(new Set(history.map((row) => row.domain)).size).toBeGreaterThanOrEqual(4);
    expect(nextItem(PLACEMENT_BANK, history, 12, 8)).toBeNull();
  });

  it("moves the ability estimate upward with stronger evidence", () => {
    const mid = PLACEMENT_BANK.filter((item) => item.grade >= 6 && item.grade <= 9).slice(0, 6);
    const low = estimateAbility(mid.map((item) => response(item, false)), PLACEMENT_BANK, 7);
    const high = estimateAbility(mid.map((item) => response(item, true)), PLACEMENT_BANK, 7);
    expect(high.theta).toBeGreaterThan(low.theta);
    expect(high.scaledScore).toBeGreaterThan(low.scaledScore);
  });
});

describe("false-mastery protection", () => {
  it("never labels a domain secure from one correct answer", () => {
    const item = PLACEMENT_BANK.find((row) => row.domain === "algebra" && row.grade === 8)!;
    const report = buildDiagnosticReport([response(item, true, 1)], PLACEMENT_BANK, 8);
    expect(report.domainScores.find((domain) => domain.domain === "algebra")?.status).toBe("insufficient-evidence");
  });

  it("treats a high-confidence wrong answer as a misconception signal", () => {
    const items = PLACEMENT_BANK.filter((row) => row.domain === "data").slice(0, 3);
    const report = buildDiagnosticReport(
      [response(items[0], true, 1), response(items[1], true, 1), response(items[2], false, 1)],
      PLACEMENT_BANK,
      8
    );
    const data = report.domainScores.find((domain) => domain.domain === "data")!;
    expect(data.highConfidenceErrors).toBe(1);
    expect(data.status).toBe("needs-support");
  });
});

describe("mastery seeding and routing", () => {
  const fixture = { top: ["mid"], mid: ["base"], base: [] as string[] };

  it("caps prerequisite inference below proficiency and lets direct misses win", () => {
    const responses: PlacementResponse[] = [
      { tag: "top", grade: 9, correct: true, confidence: 1 },
      { tag: "mid", grade: 7, correct: false, confidence: 1 }
    ];
    const states = seedMastery(responses, fixture, "2026-07-23");
    expect(states.top.mastery).toBeLessThan(0.8);
    expect(states.base.mastery).toBeCloseTo(0.64, 10);
    expect(states.mid.mastery).toBeCloseTo(0.08, 10);
  });

  it("routes from the vertical estimate rather than a single first miss", () => {
    const items = PLACEMENT_BANK.filter((row) => row.grade >= 8 && row.grade <= 10).slice(0, 5);
    const route = placementRoute(items.map((item) => response(item, true)), PLACEMENT_BANK, 9)!;
    expect(route.grade).toBeGreaterThanOrEqual(9);
  });
});
