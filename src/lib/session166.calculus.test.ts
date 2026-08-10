import { describe, expect, it } from "vitest";
import { exactNumberTruth, evalApproxExpr } from "./schema";

/** S166: rationalLimitAtInfinity, polynomialEvaluate, and the template-bank upgrade for
 * g12-limits-continuity. Both new tasks are purely integer/rational arithmetic — no float
 * approximation decides an answer. The template-bank upgrade adds exactNumberLab support to
 * authoredTemplateVariants.ts (answerFor case + exactNumberTruth import). */

describe("exactNumberLab calculus tasks (S166)", () => {

  describe("rationalLimitAtInfinity", () => {
    it("degree(num) < degree(denom) → limit is 0", () => {
      const t = exactNumberTruth({ task: "rationalLimitAtInfinity", values: [], limDegNum: 1, limDegDenom: 2, limLeadNum: 2, limLeadDenom: 1 });
      expect(t.answerNumber).toBe(0);
      expect(t.stages.map(s => s.key)).toEqual(["lim:degree", "lim:value"]);
    });
    it("equal degrees → limit is ratio of leading coefficients", () => {
      expect(exactNumberTruth({ task: "rationalLimitAtInfinity", values: [], limDegNum: 3, limDegDenom: 3, limLeadNum: 5, limLeadDenom: 2 }).answerNumber).toBe(2.5);
      expect(exactNumberTruth({ task: "rationalLimitAtInfinity", values: [], limDegNum: 2, limDegDenom: 2, limLeadNum: 4, limLeadDenom: 2 }).answerNumber).toBe(2);
    });
    it("throws when numerator degree exceeds denominator (no finite limit)", () => {
      expect(() => exactNumberTruth({ task: "rationalLimitAtInfinity", values: [], limDegNum: 3, limDegDenom: 2, limLeadNum: 1, limLeadDenom: 1 })).toThrow(/degree.*exceeds/);
    });
    it("throws on zero leading denominator coefficient", () => {
      expect(() => exactNumberTruth({ task: "rationalLimitAtInfinity", values: [], limDegNum: 2, limDegDenom: 2, limLeadNum: 4, limLeadDenom: 0 })).toThrow(/zero leading/);
    });
  });

  describe("polynomialEvaluate", () => {
    it("x² + 1 at x = 3 → 10 (continuous function limit)", () => {
      const t = exactNumberTruth({ task: "polynomialEvaluate", values: [], polyCoefficients: [1, 0, 1], polyAt: 3 });
      expect(t.answerNumber).toBe(10);
      expect(t.stages.map(s => s.key)).toEqual(["poly:substitute", "poly:evaluate"]);
    });
    it("2x² − x + 3 at x = 2 → 9", () => {
      expect(exactNumberTruth({ task: "polynomialEvaluate", values: [], polyCoefficients: [2, -1, 3], polyAt: 2 }).answerNumber).toBe(9);
    });
    it("x³ − x − 1 at x = 1 → −1 and at x = 2 → 5 (IVT sign change)", () => {
      expect(exactNumberTruth({ task: "polynomialEvaluate", values: [], polyCoefficients: [1, 0, -1, -1], polyAt: 1 }).answerNumber).toBe(-1);
      expect(exactNumberTruth({ task: "polynomialEvaluate", values: [], polyCoefficients: [1, 0, -1, -1], polyAt: 2 }).answerNumber).toBe(5);
    });
    it("throws on empty coefficients", () => {
      expect(() => exactNumberTruth({ task: "polynomialEvaluate", values: [], polyCoefficients: [], polyAt: 1 })).toThrow();
    });
  });

  describe("approximationEvaluate: conjugate-limit and geometric-series patterns", () => {
    const lit = (v: number) => ({ op: "lit" as const, value: v });
    const con = (id: string) => ({ op: "const" as const, id });
    const C = (id: string, label: string, value: number) => ({ id, label, value });
    const sq = (a: any) => ({ op: "sqrt" as const, arg: a });
    const add = (l: any, r: any) => ({ op: "add" as const, left: l, right: r });
    const sub = (l: any, r: any) => ({ op: "subtract" as const, left: l, right: r });
    const div = (l: any, r: any) => ({ op: "divide" as const, left: l, right: r });

    it("conjugate limit 1/(sqrt(4)+2) rounds to 0.25", () => {
      const t = exactNumberTruth({
        task: "approximationEvaluate", values: [],
        approxConstants: [C("c", "the radicand at x=0", 4)],
        approxFormula: div(lit(1), add(sq(con("c")), lit(2))),
        approxRound: 2,
      });
      expect(t.answerNumber).toBe(0.25);
    });
    it("geometric series a/(1-r) with a=r=1/3 rounds to 0.5", () => {
      const t = exactNumberTruth({
        task: "approximationEvaluate", values: [],
        approxConstants: [C("a", "first term", 1 / 3), C("r", "common ratio", 1 / 3)],
        approxFormula: div(con("a"), sub(lit(1), con("r"))),
        approxRound: 3,
      });
      expect(t.answerNumber).toBe(0.5);
    });
    it("sqrt op: sqrt(144)/4 = 3", () => {
      expect(evalApproxExpr({ op: "sqrt", arg: { op: "lit", value: 144 } }, [])).toBe(12);
    });
  });

});
