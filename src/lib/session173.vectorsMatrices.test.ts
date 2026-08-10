import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth, evalApproxExpr } from "./schema";

/** S173: sinDeg/cosDeg and vectorDirectionAngle are a DELIBERATE, narrow exception to the
 * standing rule that arbitrary-angle trig is out of scope (established at g10-right-triangles
 * and a2-trig). The distinction: sin(30°)=1/2 and the diagonal case |x|=|y| are closed-form
 * algebraic facts provable from 30-60-90/45-45-90 triangles, not numerical approximations of an
 * arbitrary angle. Every op here is whitelist-only and MUST throw outside that whitelist — that
 * property is exercised explicitly and repeatedly below, because a silent fallback to a generic
 * trig call would collapse the whole distinction this test exists to protect. */

describe("sinDeg / cosDeg: whitelisted special angles only (S173)", () => {
  it("returns exact values at the sixteen standard special angles", () => {
    expect(evalApproxExpr({ op: "sinDeg", degrees: 30 } as any, [])).toBe(0.5);
    expect(evalApproxExpr({ op: "cosDeg", degrees: 60 } as any, [])).toBe(0.5);
    expect(evalApproxExpr({ op: "sinDeg", degrees: 90 } as any, [])).toBe(1);
    expect(evalApproxExpr({ op: "cosDeg", degrees: 180 } as any, [])).toBe(-1);
    expect(evalApproxExpr({ op: "sinDeg", degrees: 45 } as any, [])).toBeCloseTo(Math.SQRT2 / 2, 12);
  });
  it("normalizes angles beyond one full turn and negative angles onto the same whitelist", () => {
    expect(evalApproxExpr({ op: "sinDeg", degrees: 390 } as any, [])).toBe(0.5); // 390 = 30 + 360
    expect(evalApproxExpr({ op: "cosDeg", degrees: -90 } as any, [])).toBeCloseTo(0, 12); // -90 = 270
  });
  it("throws on every angle outside the whitelist — this is the property that matters most", () => {
    for (const deg of [1, 10, 15, 20, 37, 40, 50, 55, 70, 80, 100, 200, 250, 359]) {
      expect(() => evalApproxExpr({ op: "sinDeg", degrees: deg } as any, [])).toThrow(/not one of the standard special angles/);
      expect(() => evalApproxExpr({ op: "cosDeg", degrees: deg } as any, [])).toThrow(/not one of the standard special angles/);
    }
  });
});

describe("vectorDirectionAngle: axes and the 45-degree diagonal only (S173)", () => {
  it("names the angle on each axis and each diagonal quadrant", () => {
    expect(exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: 5, vdaY: 0 }).answerNumber).toBe(0);
    expect(exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: 0, vdaY: 5 }).answerNumber).toBe(90);
    expect(exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: -1, vdaY: -1 }).answerNumber).toBe(225);
    expect(exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: 3, vdaY: -3 }).answerNumber).toBe(315);
    expect(exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: -2, vdaY: 2 }).answerNumber).toBe(135);
  });
  it("throws on any vector off the whitelisted axes/diagonals, and on the zero vector", () => {
    for (const [x, y] of [[2, 1], [1, 3], [4, -1], [-3, 5]]) {
      expect(() => exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: x, vdaY: y })).toThrow(/not on a standard special-angle axis or diagonal/);
    }
    expect(() => exactNumberTruth({ task: "vectorDirectionAngle", values: [], vdaX: 0, vdaY: 0 })).toThrow(/zero vector/);
  });
});

describe("g12-vectors-matrices: eleven forms converted, one deliberately deferred (S173)", () => {
  const bank = JSON.parse(readFileSync("src/lib/precalculusVariantTemplates.json", "utf8"))["g12-vectors-matrices"];
  const CONVERTED = ["vec-direction", "vec-scalar", "vec-matrix-arith", "vec-determinant", "vec-solve-systems",
    "vec-add", "vec-applications", "vec-components", "vec-dot", "vec-rotation", "vec-work"].map((f) => `vectors-matrices__${f}__numeric`);
  const DEFERRED = "vectors-matrices__vec-angle__numeric";

  it("has no numeric-surface stragglers outside the deliberately-deferred vec-angle form", () => {
    const numericForms = Object.keys(bank).filter((f) => f.endsWith("__numeric"));
    expect(numericForms.sort()).toEqual([...CONVERTED, DEFERRED].sort());
    const stragglers: string[] = [];
    for (const form of CONVERTED) for (const entry of bank[form] as any[]) if (entry.type !== "exactNumberLab") stragglers.push(`${form}: ${entry.prompt}`);
    expect(stragglers).toEqual([]);
  });

  it("vec-angle stays numeric: it mixes whitelisted special angles (0, 45, 60) with a genuine arbitrary arccos (53.13 deg from a 3-4-5 triangle) that has no closed form", () => {
    expect(bank[DEFERRED].every((e: any) => e.type === "numeric")).toBe(true);
    const arbitrary = bank[DEFERRED].find((e: any) => e.answer === 53.13);
    expect(arbitrary).toBeDefined(); // confirms the boundary case is genuinely present, not assumed
  });

  it("every entry across all eleven converted forms self-derives", () => {
    let checked = 0;
    for (const form of CONVERTED) {
      for (const entry of bank[form] as any[]) {
        const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, entry.prompt).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(31);
  });
});
