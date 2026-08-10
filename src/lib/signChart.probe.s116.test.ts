import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";
import { signChartValueAt } from "./evaluate";

/**
 * S116 (j): probeX — a draggable probe with a live P(x) readout, so the Factor Theorem arrives as
 * a collision (slide onto a root, the readout hits zero) rather than as a stated rule.
 *
 * The probe is exploratory: local widget state, never part of the graded value. That is why there
 * is no evaluator or audit change to test here — the graded contract is untouched.
 *
 * The readout is checked against the ACTUAL polynomial, not against the helper's own output.
 */
const base = { type: "signChart" as const, prompt: "p", successFeedback: "ok", crossFeedback: "cross", bounceFeedback: "bounce" };

describe("signChart probeX (S116 j)", () => {
  it("the readout equals the real polynomial at every integer in range", () => {
    // f(x) = x^3 - 7x + 6 = (x + 3)(x - 1)(x - 2) — monic, so the monic product is exact.
    const roots = [{ x: -3, mult: 1 }, { x: 1, mult: 1 }, { x: 2, mult: 1 }];
    const f = (x: number) => x ** 3 - 7 * x + 6;
    for (let x = -5; x <= 5; x++) {
      expect(signChartValueAt(roots, true, x), `x=${x}`).toBe(f(x));
    }
  });

  it("hits exactly zero at each root — the Factor Theorem collision", () => {
    const roots = [{ x: -3, mult: 1 }, { x: 1, mult: 1 }, { x: 2, mult: 1 }];
    for (const r of roots) expect(signChartValueAt(roots, true, r.x)).toBe(0);
  });

  it("never returns negative zero at a root", () => {
    // IEEE yields -0 when an odd number of factors is negative and one is exactly zero; probing
    // (x + 3)(x - 1)(x - 2) at x = 1 is that case. "P(1) = -0" would read as a bug at precisely
    // the moment the theorem is meant to land.
    const roots = [{ x: -3, mult: 1 }, { x: 1, mult: 1 }, { x: 2, mult: 1 }];
    for (const r of roots) {
      const v = signChartValueAt(roots, true, r.x);
      expect(Object.is(v, -0), `root ${r.x} produced -0`).toBe(false);
    }
  });

  it("respects the leading sign and multiplicities", () => {
    // -(x - 2)^2 : negative everywhere except the double root, where it is zero.
    // The reference is normalised the same way the helper is — g(2) is IEEE -0, and normalising
    // that away is exactly the contract being pinned, not an accident to reproduce.
    const roots = [{ x: 2, mult: 2 }];
    const g = (x: number) => {
      const y = -Math.pow(x - 2, 2);
      return y === 0 ? 0 : y;
    };
    for (let x = 0; x <= 4; x++) expect(signChartValueAt(roots, false, x), `x=${x}`).toBe(g(x));
    expect(signChartValueAt(roots, false, 2)).toBe(0);
  });

  it("is refused alongside poles — a rational function has no remainder", () => {
    const spec = WidgetSpec.parse({
      ...base, roots: [{ x: 1, mult: 1 }], poles: [{ x: 4, mult: 1 }], probeX: true, leadingPositive: true,
    });
    expect(widgetIntegrityErrors(spec).join(" ")).toMatch(/probeX is for POLYNOMIALS/);
  });

  it("a probe-less spec is unaffected and probeX alone passes integrity", () => {
    const withProbe = WidgetSpec.parse({ ...base, roots: [{ x: -3, mult: 1 }, { x: 1, mult: 1 }, { x: 2, mult: 1 }], probeX: true, leadingPositive: true });
    expect(widgetIntegrityErrors(withProbe)).toEqual([]);
    const without = WidgetSpec.parse({ ...base, roots: [{ x: -3, mult: 1 }, { x: 1, mult: 1 }, { x: 2, mult: 1 }], leadingPositive: true });
    expect(widgetIntegrityErrors(without)).toEqual([]);
    // `WidgetSpec.parse` returns the whole widget union, so `probeX` has to be reached through a
    // narrowing check rather than read off it directly — vitest transpiles without typechecking
    // and would not have caught the difference, but `tsc --noEmit` does.
    expect(without.type).toBe("signChart");
    if (without.type === "signChart") expect(without.probeX).toBeUndefined();
  });
});
