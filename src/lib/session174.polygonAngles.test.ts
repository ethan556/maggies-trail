import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";
import { VARIANT_GENERATORS, type VariantForm } from "./variants";

/** S174: polygon-angles is a purely arithmetic family (interior/exterior angle relationships on
 * n, sum, interior, or exterior) with no trigonometry anywhere — every step is a closed formula
 * on a single given quantity. This generator does not use the concept__surface naming
 * convention other families use: forms are bare names ("sidesFromSum", etc.), and the no-form
 * case defaults to the literal string "default" — a naming mismatch caught during this
 * session's own generator-wiring before any adversarial test ran, worth pinning here. */

describe("polygon-angles: seven bare-named forms, no concept__surface suffix (S174)", () => {
  it("registers and resolves using bare form names, not the concept__surface convention", () => {
    const g = VARIANT_GENERATORS.find((x: any) => x.tag === "polygon-angles")!;
    // "sidesFromSum", not "sidesFromSum__numeric" — this generator never forks on surface.
    const v = g.gen(() => 0.5, "core", "sidesFromSum" as VariantForm);
    expect(v.widget.type).toBe("exactNumberLab");
  });
  it("the omitted-form content steps resolve via the literal string 'default'", () => {
    const g = VARIANT_GENERATORS.find((x: any) => x.tag === "polygon-angles")!;
    const v = g.gen(() => 0.5, "core", "default" as VariantForm);
    expect(v.widget.type).toBe("exactNumberLab");
  });
});

describe("exactNumberLab polygon angle arithmetic derives every relationship correctly (S174)", () => {
  const A = (id: string, label: string, value: number, formula: any) =>
    ({ task: "approximationEvaluate" as const, values: [], approxConstants: [{ id, label, value }], approxFormula: formula, approxRound: 0 });
  const con = (id: string) => ({ op: "const" as const, id });
  const lit = (v: number) => ({ op: "lit" as const, value: v });
  const mul = (l: any, r: any) => ({ op: "multiply" as const, left: l, right: r });
  const div = (l: any, r: any) => ({ op: "divide" as const, left: l, right: r });
  const add = (l: any, r: any) => ({ op: "add" as const, left: l, right: r });
  const sub = (l: any, r: any) => ({ op: "subtract" as const, left: l, right: r });

  it("interior angle sum: (n-2) x 180, hexagon and decagon", () => {
    expect(exactNumberTruth(A("n", "sides", 6, mul(sub(con("n"), lit(2)), lit(180)))).answerNumber).toBe(720);
    expect(exactNumberTruth(A("n", "sides", 10, mul(sub(con("n"), lit(2)), lit(180)))).answerNumber).toBe(1440);
  });
  it("sides from interior sum, exterior sum is always 360, and the interior/exterior supplement", () => {
    expect(exactNumberTruth(A("s", "sum", 900, add(div(con("s"), lit(180)), lit(2)))).answerNumber).toBe(7);
    expect(exactNumberTruth(A("n", "sides", 23, lit(360))).answerNumber).toBe(360);
    expect(exactNumberTruth(A("i", "interior", 108, sub(lit(180), con("i")))).answerNumber).toBe(72);
  });
  it("sides from a regular polygon's exterior or interior angle, and regular interior itself", () => {
    expect(exactNumberTruth(A("e", "exterior", 24, div(lit(360), con("e")))).answerNumber).toBe(15);
    expect(exactNumberTruth(A("i", "interior", 150, div(lit(360), sub(lit(180), con("i"))))).answerNumber).toBe(12);
    expect(exactNumberTruth(A("n", "sides", 8, div(mul(sub(con("n"), lit(2)), lit(180)), con("n")))).answerNumber).toBe(135);
  });
});

describe("polygon-angles family fully converted (S174)", () => {
  it("all 8 authored content steps across the three lessons are exactNumberLab", () => {
    let checked = 0;
    for (const lid of ["pq-01-01", "pq-01-02", "pq-01-03"]) {
      const path = `content/courses/polygons-quadrilaterals/lessons/${lid}.json`;
      const d = JSON.parse(readFileSync(path, "utf8"));
      for (const step of d.steps) {
        if (step.variant?.gen !== "polygon-angles" || step.widget?.type !== "exactNumberLab") continue;
        const spec = WidgetSpec.parse(step.widget) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        expect(exactNumberTruth(spec).answerNumber, step.widget.prompt).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(8);
  });
});
