import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";

/** S170: linearSystemSolve (Cramer's rule, integer-exact) plus two waves — a1-systems onto a new
 * task, g10-circle-theorems entirely by reuse of approximationEvaluate. Circle theorems are
 * arithmetic on authored segment/arc lengths (tangent equality, power of a point, arc-angle
 * relationships) — mathematically exact, no trigonometric function ever called. */

describe("exactNumberLab linearSystemSolve (S170)", () => {
  it("solves a well-conditioned 2x2 system via Cramer's rule", () => {
    // x+y=12, x-y=4 -> x=8
    expect(exactNumberTruth({ task: "linearSystemSolve", values: [], sysA1: 1, sysB1: 1, sysC1: 12, sysA2: 1, sysB2: -1, sysC2: 4, sysAsk: "x" }).answerNumber).toBe(8);
    // dimes+nickels: x+y=12, 10x+5y=95 -> x=7
    expect(exactNumberTruth({ task: "linearSystemSolve", values: [], sysA1: 1, sysB1: 1, sysC1: 12, sysA2: 10, sysB2: 5, sysC2: 95, sysAsk: "x" }).answerNumber).toBe(7);
  });
  it("solves for y as readily as x", () => {
    // father+son ages: x+y=40, x-4y=0 -> y=8
    expect(exactNumberTruth({ task: "linearSystemSolve", values: [], sysA1: 1, sysB1: 1, sysC1: 40, sysA2: 1, sysB2: -4, sysC2: 0, sysAsk: "y" }).answerNumber).toBe(8);
  });
  it("throws on a singular system rather than dividing by zero", () => {
    expect(() => exactNumberTruth({ task: "linearSystemSolve", values: [], sysA1: 1, sysB1: 2, sysC1: 3, sysA2: 2, sysB2: 4, sysC2: 6, sysAsk: "x" })).toThrow(/singular/);
  });
  it("throws rather than round a non-integer solution", () => {
    expect(() => exactNumberTruth({ task: "linearSystemSolve", values: [], sysA1: 1, sysB1: 2, sysC1: 1, sysA2: 3, sysB2: 1, sysC2: 1, sysAsk: "x" })).toThrow(/not integer-exact/);
  });
});

describe("g10-circle-theorems fully converted (S170)", () => {
  const bank = JSON.parse(readFileSync("src/lib/geometryVariantTemplates.json", "utf8"))["g10-circle-theorems"];
  const forms = ["cr-tangent-apps__numeric", "cr-secant-angles__numeric", "cr-power-point__numeric"];

  it("every pool entry across the three theorem forms is exactNumberLab and self-derives", () => {
    let checked = 0;
    for (const form of forms) {
      for (const entry of bank[form] as any[]) {
        expect(entry.type, `${form}: ${entry.prompt}`).toBe("exactNumberLab");
        const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, entry.prompt).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(11);
  });

  it("the well-distance step is a genuine irrational with declared tolerance, not a disguised approximation", () => {
    // tangent^2 = external * (external + diameter): 12^2 = d(d+14) -> d = (-14+sqrt(772))/2
    const entry = bank["cr-power-point__numeric"].find((e: any) => e.prompt.includes("circular well"));
    const spec = WidgetSpec.parse(entry) as any;
    const truth = exactNumberTruth(spec);
    expect(truth.answerNumber).toBeCloseTo(6.89, 2);
    expect(spec.tolerance).toBeGreaterThan(0);
  });
});
