/**
 * S116 — `columnCalc.decimals`.
 *
 * The enhancement's whole claim is that decimal column arithmetic IS integer column arithmetic
 * with renamed places. These tests pin that claim from both ends: the integer machinery must be
 * bit-identical to the undecorated case, and the places must actually rename.
 */
import { describe, it, expect } from "vitest";
import {
  WidgetSpec,
  widgetIntegrityErrors,
  columnCalcTruth,
  columnCalcReachable,
} from "./schema";

const base = {
  type: "columnCalc" as const,
  op: "add" as const,
  a: 860,
  b: 75,
  prompt: "p",
  fallbackFeedback: "f",
  successFeedback: "s",
  commonResults: [],
};

describe("columnCalc.decimals", () => {
  it("accepts a decimal add and leaves the integer arithmetic untouched", () => {
    const dec = WidgetSpec.parse({ ...base, decimals: 2 });
    expect(widgetIntegrityErrors(dec)).toEqual([]);
    // The truth and the reachable set must not depend on `decimals` at all — that is the claim.
    expect(columnCalcTruth("add", 860, 75)).toBe(935);
    expect([...columnCalcReachable("add", 860, 75)].sort((x, y) => x - y)).toEqual([835, 935]);
  });

  it("is absent by default, so every pre-S116 spec is unchanged", () => {
    const legacy = WidgetSpec.parse({ ...base, a: 167, b: 275 });
    expect(legacy.type).toBe("columnCalc");
    if (legacy.type !== "columnCalc") return;
    // `.optional()` not `.default(0)`: a default would make the field REQUIRED in the inferred
    // type and break every variant generator that builds a columnCalc without it.
    expect(legacy.decimals).toBeUndefined();
    expect(widgetIntegrityErrors(legacy)).toEqual([]);
  });

  it("refuses decimals on multiply, where the product's point sits elsewhere", () => {
    const bad = WidgetSpec.parse({ ...base, op: "multiply", b: 7, decimals: 2 });
    expect(widgetIntegrityErrors(bad).some((e) => e.includes("add/subtract only"))).toBe(true);
  });

  it("allows decimals on subtract when the scaled integers still order correctly", () => {
    const sub = WidgetSpec.parse({ type: "columnCalc", op: "subtract", a: 935, b: 75, decimals: 2, prompt: "p", fallbackFeedback: "f", successFeedback: "s", commonResults: [] });
    expect(widgetIntegrityErrors(sub)).toEqual([]);
  });

  it("still rejects a commonResults value that no move sequence reaches", () => {
    const bad = WidgetSpec.parse({ ...base, decimals: 2, commonResults: [{ value: 1610, feedback: "x" }] });
    expect(widgetIntegrityErrors(bad).some((e) => e.includes("unreachable"))).toBe(true);
  });

  it("bounds decimals to the places the label table actually has names for", () => {
    expect(WidgetSpec.safeParse({ ...base, decimals: 4 }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...base, decimals: -1 }).success).toBe(false);
  });

  it("the shipped ns-02-02 lab is solvable and its misconception is reachable", async () => {
    const { readFileSync } = await import("node:fs");
    const doc = JSON.parse(
      readFileSync("content/courses/number-system/lessons/ns-02-02.json", "utf8")
    );
    const step = doc.steps.find((s: { id: string }) => s.id === "i2");
    const spec = WidgetSpec.parse(step.widget);
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    if (spec.type !== "columnCalc") return;
    const reach = columnCalcReachable(spec.op, spec.a, spec.b);
    expect(reach.has(columnCalcTruth(spec.op, spec.a, spec.b))).toBe(true);
    for (const r of spec.commonResults) expect(reach.has(r.value)).toBe(true);
    // 935 scaled by 2 places is 9.35 — the authored answer.
    expect(columnCalcTruth(spec.op, spec.a, spec.b) / 100).toBeCloseTo(9.35, 10);
  });
});
