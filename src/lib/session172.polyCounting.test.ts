import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";

/** S172: rationalRootCandidateCount and polynomialZeroCount are counting operations, not
 * evaluation — no polynomial is ever substituted into or solved. Duplicate candidates are
 * deduplicated by exact integer GCD reduction, never by floating-point comparison. */

describe("exactNumberLab rationalRootCandidateCount (S172)", () => {
  it("counts distinct ± reduced-fraction candidates, deduplicating exactly", () => {
    // lead=1, const=-6: divisors of 6 all reduce distinctly -> 4 positive values, x2 = 8
    expect(exactNumberTruth({ task: "rationalRootCandidateCount", values: [], rrcLeading: 1, rrcConstant: -6 }).answerNumber).toBe(8);
    // lead=2, const=2: 2/2 reduces to the same value as 1/1 -> only 3 distinct positive values, x2 = 6
    expect(exactNumberTruth({ task: "rationalRootCandidateCount", values: [], rrcLeading: 2, rrcConstant: 2 }).answerNumber).toBe(6);
    expect(exactNumberTruth({ task: "rationalRootCandidateCount", values: [], rrcLeading: 3, rrcConstant: 5 }).answerNumber).toBe(8);
  });
  it("throws on a non-positive leading coefficient or a zero constant term", () => {
    expect(() => exactNumberTruth({ task: "rationalRootCandidateCount", values: [], rrcLeading: 0, rrcConstant: 6 })).toThrow();
    expect(() => exactNumberTruth({ task: "rationalRootCandidateCount", values: [], rrcLeading: 1, rrcConstant: 0 })).toThrow();
  });
});

describe("exactNumberLab polynomialZeroCount (S172)", () => {
  it("sums multiplicities for the total mode", () => {
    // (x-1)^2(x+2)^1 -> 2+1 = 3
    expect(exactNumberTruth({ task: "polynomialZeroCount", values: [], pzcMode: "total", pzcMultiplicities: [2, 1] }).answerNumber).toBe(3);
  });
  it("counts factors (ignoring multiplicity) for the distinct mode", () => {
    // (x-5)^3(x+1)^2(x-4)^1 -> 3 distinct factors
    expect(exactNumberTruth({ task: "polynomialZeroCount", values: [], pzcMode: "distinct", pzcMultiplicities: [3, 2, 1] }).answerNumber).toBe(3);
  });
  it("subtracts given real (simple) zeros from the degree for the nonReal mode", () => {
    expect(exactNumberTruth({ task: "polynomialZeroCount", values: [], pzcMode: "nonReal", pzcDegree: 4, pzcRealCount: 2 }).answerNumber).toBe(2);
  });
  it("throws when the real-zero count exceeds the degree", () => {
    expect(() => exactNumberTruth({ task: "polynomialZeroCount", values: [], pzcMode: "nonReal", pzcDegree: 3, pzcRealCount: 5 })).toThrow();
  });
});

describe("g12-polynomial-rational-analysis coverage after S172", () => {
  const bank = JSON.parse(readFileSync("src/lib/precalculusVariantTemplates.json", "utf8"))["g12-polynomial-rational-analysis"];
  const DEFERRED_INEQUALITY_FORMS = new Set([
    "polynomial-rational-analysis__pra-boundary-rule__numeric", // sign-chart boundary inclusion
    "polynomial-rational-analysis__pra-ineq-scratch__numeric",  // integer-solution count, quadratic inequality
    "polynomial-rational-analysis__pra-rearrange__numeric",     // integer-solution count, rational inequality
  ]);
  it("has no numeric-surface stragglers OUTSIDE the deliberately-deferred inequality forms", () => {
    const numericForms = Object.keys(bank).filter((f) => f.endsWith("__numeric"));
    const stragglers: string[] = [];
    for (const form of numericForms) {
      if (DEFERRED_INEQUALITY_FORMS.has(form)) continue;
      for (const entry of bank[form] as any[]) if (entry.type !== "exactNumberLab") stragglers.push(`${form}: ${entry.prompt}`);
    }
    expect(stragglers).toEqual([]);
  });
  it("confirms the deferred forms are genuinely still numeric (not silently converted) so this test cannot go stale", () => {
    for (const form of DEFERRED_INEQUALITY_FORMS) expect(bank[form].every((e: any) => e.type === "numeric"), form).toBe(true);
  });
  it("every converted entry across the session's seven forms self-derives", () => {
    let checked = 0;
    for (const form of ["polynomial-rational-analysis__pra-rrt-list__numeric", "polynomial-rational-analysis__pra-fta-count__numeric", "polynomial-rational-analysis__pra-rrt-test__numeric"]) {
      for (const entry of bank[form] as any[]) {
        const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, entry.prompt).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(7);
  });
});
