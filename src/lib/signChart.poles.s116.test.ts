import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, signChartCuts } from "./schema";
import { evaluate, signChartSigns } from "./evaluate";

/**
 * S116 (k): poles and holes on signChart — the playbook's main Block 5 build.
 *
 * The claim: a pole cuts the number line exactly as a root does and flips the sign by the same
 * parity rule, but the curve never reaches it (vertical asymptote) rather than passing through it.
 * A hole cuts nothing and changes no sign.
 *
 * Every sign claim below is checked against the ACTUAL rational function evaluated at sample
 * points, not against the implementation — so a regression in the merge/parity logic fails here
 * rather than quietly agreeing with itself.
 */
const base = { type: "signChart" as const, prompt: "p", successFeedback: "ok", crossFeedback: "cross", bounceFeedback: "bounce" };

/** Sign of f at x, as the chart would label it. */
const sgn = (y: number) => (y > 0 ? "+" : "-");

describe("signChart poles and holes (S116 k)", () => {
  it("a simple pole splits an interval and flips the sign — matching the real function", () => {
    // f(x) = (x + 7)/(x - 4): root at -7, simple pole at 4.
    const spec = WidgetSpec.parse({ ...base, roots: [{ x: -7, mult: 1 }], poles: [{ x: 4, mult: 1 }], leadingPositive: true });
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    const truth = signChartSigns([{ x: -7, mult: 1 }], true, [{ x: 4, mult: 1 }]);
    expect(truth).toHaveLength(3); // two cuts -> three intervals

    const f = (x: number) => (x + 7) / (x - 4);
    expect([sgn(f(-10)), sgn(f(0)), sgn(f(10))]).toEqual(truth);
    expect(evaluate(spec, truth).correct).toBe(true);
  });

  it("an EVEN pole does not flip the sign, matching 1/(x-2)^2", () => {
    // f(x) = 1/(x - 2)^2 is positive on both sides — a pole with no sign change.
    const truth = signChartSigns([], true, [{ x: 2, mult: 2 }]);
    const f = (x: number) => 1 / Math.pow(x - 2, 2);
    expect([sgn(f(0)), sgn(f(5))]).toEqual(truth);
    expect(truth).toEqual(["+", "+"]);
  });

  it("holes change neither the interval count nor any sign", () => {
    const roots = [{ x: -7, mult: 1 }];
    const poles = [{ x: 4, mult: 1 }];
    const withHole = WidgetSpec.parse({ ...base, roots, poles, holes: [1], leadingPositive: true });
    expect(widgetIntegrityErrors(withHole)).toEqual([]);
    // A hole is not a cut.
    expect(signChartCuts(roots, poles)).toHaveLength(2);
    expect(signChartSigns(roots, true, poles)).toEqual(["+", "-", "+"]);
    // And the graded truth is identical with and without it.
    const noHole = WidgetSpec.parse({ ...base, roots, poles, leadingPositive: true });
    expect(evaluate(withHole, ["+", "-", "+"]).correct).toBe(evaluate(noHole, ["+", "-", "+"]).correct);
  });

  it("cuts merge in x order regardless of authoring order", () => {
    const cuts = signChartCuts([{ x: 5, mult: 1 }, { x: -1, mult: 2 }], [{ x: 2, mult: 1 }]);
    expect(cuts.map((c) => c.x)).toEqual([-1, 2, 5]);
    expect(cuts.map((c) => c.kind)).toEqual(["root", "pole", "root"]);
  });

  it("an even POLE fires the bounce diagnosis, exactly as an even root does", () => {
    // Sign is + on both sides of the even pole; flipping it is the bounce error.
    const spec = WidgetSpec.parse({ ...base, roots: [{ x: -3, mult: 1 }], poles: [{ x: 2, mult: 2 }], leadingPositive: true });
    const truth = signChartSigns([{ x: -3, mult: 1 }], true, [{ x: 2, mult: 2 }]);
    expect(truth).toEqual(["-", "+", "+"]);
    expect(evaluate(spec, ["-", "+", "-"]).feedback).toBe("bounce");
  });

  it("refuses a value authored as both a root and a pole", () => {
    const spec = WidgetSpec.parse({ ...base, roots: [{ x: 4, mult: 1 }], poles: [{ x: 4, mult: 1 }], leadingPositive: true });
    expect(widgetIntegrityErrors(spec).join(" ")).toMatch(/BOTH a root and a pole/);
  });

  it("refuses a hole that is also a pole, or also a root", () => {
    const asPole = WidgetSpec.parse({ ...base, roots: [{ x: -7, mult: 1 }], poles: [{ x: 4, mult: 1 }], holes: [4], leadingPositive: true });
    expect(widgetIntegrityErrors(asPole).join(" ")).toMatch(/both a pole and a hole/);
    const asRoot = WidgetSpec.parse({ ...base, roots: [{ x: -7, mult: 1 }], holes: [-7], leadingPositive: true });
    expect(widgetIntegrityErrors(asRoot).join(" ")).toMatch(/both a root and a hole/);
  });

  it("refuses duplicate poles and a chart where nothing ever flips", () => {
    const dup = WidgetSpec.parse({ ...base, roots: [{ x: 0, mult: 1 }], poles: [{ x: 3, mult: 1 }, { x: 3, mult: 1 }], leadingPositive: true });
    expect(widgetIntegrityErrors(dup).join(" ")).toMatch(/duplicate pole/);
    const flat = WidgetSpec.parse({ ...base, roots: [{ x: 1, mult: 2 }], poles: [{ x: 3, mult: 2 }], leadingPositive: true });
    expect(widgetIntegrityErrors(flat).join(" ")).toMatch(/every cut has even multiplicity/);
  });

  it("a ROOTLESS chart is valid when a pole cuts it, and matches the real function", () => {
    // (4 - x)/(x^2 - 16) reduces to -1/(x + 4): a pole at -4, a hole at 4, and no zero anywhere.
    const spec = WidgetSpec.parse({ ...base, roots: [], poles: [{ x: -4, mult: 1 }], holes: [4], leadingPositive: false });
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    const truth = signChartSigns([], false, [{ x: -4, mult: 1 }]);
    expect(truth).toEqual(["+", "-"]);
    const f = (x: number) => (4 - x) / (x * x - 16);
    expect([sgn(f(-10)), sgn(f(0))]).toEqual(truth);
    // The hole really is undefined in the ORIGINAL expression.
    expect(Number.isNaN(f(4))).toBe(true);
    expect(evaluate(spec, truth).correct).toBe(true);
  });

  it("refuses a chart with neither roots nor poles — nothing divides the line", () => {
    const spec = WidgetSpec.parse({ ...base, roots: [], leadingPositive: true });
    expect(widgetIntegrityErrors(spec).join(" ")).toMatch(/nothing to divide the line/);
    // A hole alone still does not divide it.
    const holeOnly = WidgetSpec.parse({ ...base, roots: [], holes: [2], leadingPositive: true });
    expect(widgetIntegrityErrors(holeOnly).join(" ")).toMatch(/nothing to divide the line/);
  });

  it("roots-only specs are completely unchanged by the addition", () => {
    const spec = WidgetSpec.parse({ ...base, roots: [{ x: -2, mult: 1 }, { x: 1, mult: 2 }], leadingPositive: true });
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    const truth = signChartSigns([{ x: -2, mult: 1 }, { x: 1, mult: 2 }], true);
    // (x + 2)(x - 1)^2
    const f = (x: number) => (x + 2) * Math.pow(x - 1, 2);
    expect([sgn(f(-3)), sgn(f(0)), sgn(f(2))]).toEqual(truth);
    expect(evaluate(spec, truth).correct).toBe(true);
  });
});
