import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";
import { evaluate, signChartSigns } from "./evaluate";

/**
 * S116 raised signChart's multiplicity cap from 3 to 6 so monomial end-behaviour lessons can be
 * authored faithfully (f(x) = -2x^5 is a single root of multiplicity 5; authoring it as 3 would
 * put a different function on screen from the one the prose names).
 *
 * The claim being pinned is that nothing downstream reads the MAGNITUDE of `mult` — every consumer
 * branches on parity alone. These tests check that directly against real arithmetic rather than
 * against the implementation, so a future change that starts depending on the magnitude fails here.
 */
const base = {
  type: "signChart" as const,
  prompt: "p",
  successFeedback: "ok",
  crossFeedback: "cross",
  bounceFeedback: "bounce",
};

describe("signChart multiplicity cap (S116)", () => {
  it("accepts multiplicities up to 6 and still refuses 7", () => {
    for (const mult of [1, 2, 3, 4, 5, 6]) {
      const r = WidgetSpec.safeParse({ ...base, roots: [{ x: 0, mult }], leadingPositive: true });
      expect(r.success, `mult ${mult} should parse`).toBe(true);
    }
    expect(WidgetSpec.safeParse({ ...base, roots: [{ x: 0, mult: 7 }], leadingPositive: true }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...base, roots: [{ x: 0, mult: 0 }], leadingPositive: true }).success).toBe(false);
  });

  it("high multiplicities flip by PARITY, matching the actual function's sign", () => {
    // -2x^5: odd power, negative lead. Left of 0 positive, right of 0 negative.
    const odd = signChartSigns([{ x: 0, mult: 5 }], false);
    const f5 = (x: number) => -2 * Math.pow(x, 5);
    expect(odd).toEqual(["+", "-"]);
    expect(f5(-1) > 0 ? "+" : "-").toBe(odd[0]);
    expect(f5(1) > 0 ? "+" : "-").toBe(odd[1]);

    // 3x^4: even power, positive lead. Positive on BOTH sides — a bounce, no crossing.
    const even = signChartSigns([{ x: 0, mult: 4 }], true);
    const f4 = (x: number) => 3 * Math.pow(x, 4);
    expect(even).toEqual(["+", "+"]);
    expect(f4(-1) > 0 ? "+" : "-").toBe(even[0]);
    expect(f4(1) > 0 ? "+" : "-").toBe(even[1]);
  });

  it("multiplicity 5 behaves identically to 1 and 3; 4 identically to 2", () => {
    for (const lead of [true, false]) {
      const one = signChartSigns([{ x: 0, mult: 1 }], lead);
      expect(signChartSigns([{ x: 0, mult: 3 }], lead)).toEqual(one);
      expect(signChartSigns([{ x: 0, mult: 5 }], lead)).toEqual(one);
      const two = signChartSigns([{ x: 0, mult: 2 }], lead);
      expect(signChartSigns([{ x: 0, mult: 4 }], lead)).toEqual(two);
      expect(signChartSigns([{ x: 0, mult: 6 }], lead)).toEqual(two);
    }
  });

  it("a high-multiplicity spec grades and diagnoses like any other", () => {
    const spec = WidgetSpec.parse({ ...base, roots: [{ x: 0, mult: 5 }], leadingPositive: false });
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(evaluate(spec, ["+", "-"]).correct).toBe(true);
    // Missing the crossing at an odd root fires the cross diagnosis, not the bounce one.
    expect(evaluate(spec, ["-", "-"]).feedback).toBe("cross");
    // Flipping across an EVEN root fires the bounce diagnosis.
    const evenSpec = WidgetSpec.parse({ ...base, roots: [{ x: 0, mult: 4 }], leadingPositive: true });
    expect(evaluate(evenSpec, ["-", "+"]).feedback).toBe("bounce");
  });
});
