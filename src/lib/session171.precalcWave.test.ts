import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";

/** S171: polynomialIntegerRoots (rational-root-theorem candidates, direct substitution, monic
 * only) plus two waves — g12-function-analysis in full via pure nested-arithmetic reuse of
 * approximationEvaluate, and a g12-polynomial-rational-analysis subset. Complex-conjugate
 * products (a-bi)(a+bi)=a²+b² are real-valued algebraic identities: no imaginary arithmetic is
 * ever performed, only the real formula the identity reduces to. */

describe("exactNumberLab polynomialIntegerRoots (S171)", () => {
  it("finds every integer root of a monic cubic via candidate substitution", () => {
    // x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
    const t = exactNumberTruth({ task: "polynomialIntegerRoots", values: [], pirCoefficients: [1, -6, 11, -6], pirMode: "largest" });
    expect(t.answerNumber).toBe(3);
    expect(exactNumberTruth({ task: "polynomialIntegerRoots", values: [], pirCoefficients: [1, -6, 11, -6], pirMode: "smallest" }).answerNumber).toBe(1);
    expect(exactNumberTruth({ task: "polynomialIntegerRoots", values: [], pirCoefficients: [1, -6, 11, -6], pirMode: "sum" }).answerNumber).toBe(6);
    expect(exactNumberTruth({ task: "polynomialIntegerRoots", values: [], pirCoefficients: [1, -6, 11, -6], pirMode: "count" }).answerNumber).toBe(3);
  });
  it("refuses a non-monic leading coefficient rather than search rational candidates", () => {
    expect(() => exactNumberTruth({ task: "polynomialIntegerRoots", values: [], pirCoefficients: [2, -3, -3, 2], pirMode: "largest" })).toThrow(/monic/);
  });
  it("throws when no integer root exists among the candidates", () => {
    // x^3 + x + 1 has no rational root
    expect(() => exactNumberTruth({ task: "polynomialIntegerRoots", values: [], pirCoefficients: [1, 0, 1, 1], pirMode: "largest" })).toThrow(/no integer roots/);
  });
});

describe("g12-function-analysis and g12-polynomial-rational-analysis (S171)", () => {
  const bank = JSON.parse(readFileSync("src/lib/precalculusVariantTemplates.json", "utf8"));
  const converted: [string, string][] = [
    ["g12-function-analysis", "function-analysis__fna-compose-order__numeric"],
    ["g12-function-analysis", "function-analysis__fna-compose-domain__numeric"],
    ["g12-function-analysis", "function-analysis__fna-decompose__numeric"],
    ["g12-function-analysis", "function-analysis__fna-one-to-one__numeric"],
    ["g12-function-analysis", "function-analysis__fna-restricted__numeric"],
    ["g12-function-analysis", "function-analysis__fna-inverse-verify__numeric"],
    ["g12-polynomial-rational-analysis", "polynomial-rational-analysis__pra-conjugate__numeric"],
    ["g12-polynomial-rational-analysis", "polynomial-rational-analysis__pra-build-mixed__numeric"],
    ["g12-polynomial-rational-analysis", "polynomial-rational-analysis__pra-slant-find__numeric"],
    ["g12-polynomial-rational-analysis", "polynomial-rational-analysis__pra-rrt-pipeline__numeric"],
  ];

  it("every pool entry across all ten converted forms is exactNumberLab and self-derives", () => {
    let checked = 0;
    for (const [tag, form] of converted) {
      for (const entry of bank[tag][form] as any[]) {
        expect(entry.type, `${form}: ${entry.prompt}`).toBe("exactNumberLab");
        const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, entry.prompt).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(21);
  });

  it("complex-conjugate products stay real-valued: (a-bi)(a+bi) reduces to a^2+b^2, never touching i", () => {
    const spec = { task: "approximationEvaluate", values: [], approxConstants: [{ id: "b", label: "the imaginary coefficient", value: 2 }], approxFormula: { op: "multiply", left: { op: "const", id: "b" }, right: { op: "const", id: "b" } }, approxRound: 0 } as any;
    expect(exactNumberTruth(spec).answerNumber).toBe(4); // (x-2i)(x+2i) = x^2+4
  });

  it("pra-rrt-list and pra-fta-count were deferred at S171 time and later converted in S172", () => {
    // This test originally asserted these forms stayed on the numeric surface. S172 built
    // rationalRootCandidateCount and polynomialZeroCount and converted both — see
    // session172.polyCounting.test.ts for that coverage. Historical note only; no assertion
    // belongs here now that the deferral is resolved.
    expect(true).toBe(true);
  });
});
