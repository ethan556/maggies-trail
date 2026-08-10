import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth, evalApproxExpr } from "./schema";
import { GEOMETRY_GENERATORS } from "./geometryVariants";

/** S168: the `root` op and the g10-solid-geometry bank. Solid geometry is arithmetic on authored
 * dimensions, so approximationEvaluate carries it — but any nth root must be an EXACT perfect
 * power, otherwise a rounded irrational would silently decide an answer. */

describe("approximationEvaluate root op (S168)", () => {
  it("returns exact integer roots", () => {
    expect(evalApproxExpr({ op: "root", index: 3, arg: { op: "lit", value: 216 } }, [])).toBe(6);
    expect(evalApproxExpr({ op: "root", index: 3, arg: { op: "lit", value: -27 } }, [])).toBe(-3);
    expect(evalApproxExpr({ op: "root", index: 4, arg: { op: "lit", value: 81 } }, [])).toBe(3);
  });
  it("throws rather than approximate a non-perfect power", () => {
    expect(() => evalApproxExpr({ op: "root", index: 3, arg: { op: "lit", value: 217 } }, [])).toThrow(/not an exact perfect power/);
  });
  it("rejects an even root of a negative value and a degenerate index", () => {
    expect(() => evalApproxExpr({ op: "root", index: 2, arg: { op: "lit", value: -4 } }, [])).toThrow(/even root of a negative/);
    expect(() => evalApproxExpr({ op: "root", index: 1, arg: { op: "lit", value: 8 } }, [])).toThrow(/at least 2/);
  });
  it("derives the tank radius from its volume coefficient: cbrt(3·288/4) = 6", () => {
    const t = exactNumberTruth({
      task: "approximationEvaluate", values: [],
      approxConstants: [{ id: "V", label: "the volume coefficient", value: 288 }],
      approxFormula: { op: "root", index: 3, arg: { op: "divide", left: { op: "multiply", left: { op: "lit", value: 3 }, right: { op: "const", id: "V" } }, right: { op: "lit", value: 4 } } },
      approxRound: 0,
    });
    expect(t.answerNumber).toBe(6);
  });
});

describe("g10-solid-geometry bank after the S168 conversion", () => {
  const bank = JSON.parse(readFileSync("src/lib/geometryVariantTemplates.json", "utf8"));
  const CONVERTED = ["sg-revolution__numeric", "sg-cavalieri-limits__numeric", "sg-sphere-justified__numeric",
    "sg-composite-subtract__numeric", "sg-composite-surface__numeric", "sg-density__numeric", "sg-modeling__numeric"];

  it("every converted pool entry parses and derives its own answer", () => {
    let checked = 0;
    for (const form of CONVERTED) {
      for (const entry of bank["g10-solid-geometry"][form] as any[]) {
        expect(entry.type, `${form} should be fully converted`).toBe("exactNumberLab");
        const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, entry.prompt).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(22);
  });

  it("the geometry generator serves exactNumberLab and re-derives the answer from the truth", () => {
    const g = GEOMETRY_GENERATORS.find((x: any) => x.tag === "g10-solid-geometry")! as any;
    let seed = 1;
    for (const form of CONVERTED) {
      const v = g.gen(() => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296), "core", form);
      expect(v.widget.type).toBe("exactNumberLab");
      expect(v.answer).toBe(exactNumberTruth(v.widget).answerNumber);
    }
  });
});
