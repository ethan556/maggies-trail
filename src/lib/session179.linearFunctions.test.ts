import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";
import { VARIANT_GENERATORS, type VariantForm } from "./variants";

/** S179: a1-linear-functions — 8 forms, 23 steps, zero new tasks. Several forms carry TWO
 * distinct sub-shapes: one matching what the live generator always produces, and a
 * frozen-content-only alternate the generator structurally never reaches (line-from-two-points
 * always asks for b; one frozen step asks for the slope instead. parallel-perpendicular always
 * computes a parallel intercept; one frozen step asks for a perpendicular slope). Both were
 * independently hand-verified, not assumed to share a formula. */

describe("a1-linear-functions: generator-native shapes self-derive (S179)", () => {
  const cases: [string, string][] = [
    ["form-conversion__numeric", "lf-point-slope-b"], ["intercepts__numeric", "lf-y-intercept"],
    ["line-from-point-slope__numeric", "lf-point-slope-b"], ["line-from-two-points__numeric", "lf-point-slope-b"],
    ["parallel-perpendicular__numeric", "lf-point-slope-b"], ["slope-intercept-graph__numeric", "lf-y-intercept"],
    ["slope-intercept-read__numeric", "lf-evaluate"], ["standard-form__numeric", "lf-x-intercept-AC"],
  ];
  it("every declared form upgrades and its own answer self-derives across many draws", () => {
    const g = VARIANT_GENERATORS.find((x: any) => x.tag === "a1-linear-functions")!;
    let checked = 0;
    for (const [form] of cases) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = g.gen(() => ((seed * 97 + form.length * 13) % 997) / 997, "core", form as VariantForm);
        expect(v.widget.type, form).toBe("exactNumberLab");
        expect(exactNumberTruth(v.widget as any).answerNumber, form).toBe(Number(v.answer));
        checked += 1;
      }
    }
    expect(checked).toBe(240);
  });
});

describe("a1-linear-functions: the frozen-only alternate shapes (S179)", () => {
  it("line-from-two-points/k2 asks for SLOPE, not b — a shape the generator never produces", () => {
    const d = JSON.parse(readFileSync("content/courses/linear-functions/lessons/lf-04-02.json", "utf8"));
    const k2 = d.steps.find((s: any) => s.id === "k2");
    expect(k2.widget.prompt).toMatch(/slope/i);
    const spec = WidgetSpec.parse(k2.widget) as any;
    expect(exactNumberTruth(spec).answerNumber).toBe(3); // (10-4)/(3-1)
  });
  it("parallel-perpendicular/ch1 builds the PERPENDICULAR line through a point, not a parallel intercept", () => {
    // s323-P7-lf-04-03: ch1's slope-only clone of i2 was redesigned into the two-step
    // build-the-perpendicular-through-(2,1) job — b = y − (−(1/m))·x = 1 − (−3)·2 = 7.
    const d = JSON.parse(readFileSync("content/courses/linear-functions/lessons/lf-04-03.json", "utf8"));
    const ch1 = d.steps.find((s: any) => s.id === "ch1");
    expect(ch1.widget.prompt).toMatch(/perpendicular/i);
    const spec = WidgetSpec.parse(ch1.widget) as any;
    expect(exactNumberTruth(spec).answerNumber).toBeCloseTo(1 - -3 * 2, 9); // b of y = −3x + 7
  });
  it("intercepts and slope-intercept-graph each carry an x-intercept variant the generator skips", () => {
    for (const [lid, sid, expected] of [["lf-02-03", "k2", 5], ["lf-02-03", "ch1", 4], ["lf-02-02", "ch1", 3]] as const) {
      const d = JSON.parse(readFileSync(`content/courses/linear-functions/lessons/${lid}.json`, "utf8"));
      const step = d.steps.find((s: any) => s.id === sid);
      expect(step.widget.type).toBe("exactNumberLab");
      const spec = WidgetSpec.parse(step.widget) as any;
      expect(exactNumberTruth(spec).answerNumber).toBe(expected);
    }
  });
});

describe("a1-linear-functions all 23 steps converted (S179)", () => {
  it("every step across all eight lessons self-derives its frozen answer", () => {
    let checked = 0;
    for (const lid of ["lf-02-01", "lf-02-02", "lf-02-03", "lf-03-02", "lf-03-03", "lf-04-01", "lf-04-02", "lf-04-03"]) {
      const d = JSON.parse(readFileSync(`content/courses/linear-functions/lessons/${lid}.json`, "utf8"));
      for (const step of d.steps) {
        if (step.variant?.gen !== "a1-linear-functions" || step.widget?.type !== "exactNumberLab") continue;
        const spec = WidgetSpec.parse(step.widget) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, `${lid}: ${step.widget.prompt}`).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(23);
  });
});
