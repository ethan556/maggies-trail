import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";

/** S167: antiderivativeInitialValue integrates a polynomial rate one or two times, pinning each
 * constant with the authored initial condition. Every integrated coefficient must land on an
 * integer — a non-terminating rational cannot be held exactly in binary floating point, so the
 * branch throws rather than let a rounded coefficient decide an answer. */

describe("exactNumberLab antiderivativeInitialValue (S167)", () => {
  it("first order: F'(x) = 2x with F(1) = 5 gives F(3) = 13", () => {
    const t = exactNumberTruth({ task: "antiderivativeInitialValue", values: [], aivRate: [2, 0], aivOrder: 1, aivAt0: 1, aivInit: [5], aivTarget: 3 });
    expect(t.answerNumber).toBe(13);
    expect(t.stages.map((s) => s.key)).toEqual(["aiv:integrate1", "aiv:evaluate"]);
  });

  it("first order from t = 0: v(t) = 2t with s(0) = 10 gives s(3) = 19", () => {
    expect(exactNumberTruth({ task: "antiderivativeInitialValue", values: [], aivRate: [2, 0], aivOrder: 1, aivAt0: 0, aivInit: [10], aivTarget: 3 }).answerNumber).toBe(19);
  });

  it("second order: a(t) = 6t with v(0) = 2 and s(0) = 1 gives s(2) = 13", () => {
    const t = exactNumberTruth({ task: "antiderivativeInitialValue", values: [], aivRate: [6, 0], aivOrder: 2, aivAt0: 0, aivInit: [2, 1], aivTarget: 2 });
    expect(t.answerNumber).toBe(13);
    expect(t.stages.map((s) => s.key)).toEqual(["aiv:integrate1", "aiv:integrate2", "aiv:evaluate"]);
  });

  it("throws rather than round a non-terminating integrated coefficient", () => {
    // integrating x^2 gives x^3/3 — not exactly representable, so the branch must refuse.
    expect(() => exactNumberTruth({ task: "antiderivativeInitialValue", values: [], aivRate: [1, 0, 0], aivOrder: 1, aivAt0: 0, aivInit: [0], aivTarget: 3 })).toThrow(/non-terminating/);
  });

  it("throws when the initial-condition count does not match the order", () => {
    expect(() => exactNumberTruth({ task: "antiderivativeInitialValue", values: [], aivRate: [6, 0], aivOrder: 2, aivAt0: 0, aivInit: [2], aivTarget: 2 })).toThrow(/initial value/);
    expect(() => exactNumberTruth({ task: "antiderivativeInitialValue", values: [], aivRate: [2, 0], aivOrder: 3, aivAt0: 0, aivInit: [1, 2, 3], aivTarget: 1 })).toThrow(/order must be 1 or 2/);
  });
});

describe("calculus template bank stays exact after the S167 conversion", () => {
  const bank = JSON.parse(readFileSync("src/lib/calculusVariantTemplates.json", "utf8"));

  it("every exactNumberLab pool entry parses and derives its own answer", () => {
    let checked = 0;
    for (const tag of Object.keys(bank)) {
      for (const form of Object.keys(bank[tag])) {
        for (const entry of bank[tag][form] as any[]) {
          if (entry.type !== "exactNumberLab") continue;
          const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
          const truth = exactNumberTruth(spec);
          expect(truth.answerNumber, `${form}: ${entry.prompt}`).toBeTypeOf("number");
          checked += 1;
        }
      }
    }
    expect(checked).toBe(9);
  });

  it("leaves dc-related-rates on the authored numeric surface (duplicate misconception values)", () => {
    // Both authored misconceptions on dc-02-01/ch1 are valued 36. Under numeric grading the second
    // is unreachable; exactNumberLab rejects the duplicate outright. Converting would mean deleting
    // authored feedback, so this form is deliberately deferred, not silently edited.
    const pool = bank["g13-derivatives-in-context"]["derivatives-in-context__dc-related-rates__numeric"];
    expect(pool.every((entry: any) => entry.type === "numeric")).toBe(true);
  });
});
