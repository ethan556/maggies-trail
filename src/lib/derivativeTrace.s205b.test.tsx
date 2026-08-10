// @vitest-environment jsdom
/** derivativeTrace f″ extension (S205B) — the engine gap ca-03-01's refusal proved.
 *
 * The derivative library is verified by a genuinely independent second method: central finite
 * differences of the level below. traceSlopeAt must match (f(x+h)−f(x−h))/2h against traceAt, and
 * traceSecondAt must match the same operator applied to traceSlopeAt — the closed forms are never
 * compared to themselves. If someone edits x³ − 3x but forgets 3x² − 3, this file fails.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { traceAt, traceSlopeAt, traceSecondAt, type TraceFn } from "@/lib/evaluate";
import { describeWidgetState } from "@/lib/describeState";
import { WidgetRenderer } from "@/components/widgets";
import type { TWidget } from "@/lib/schema";

const XS = [-3.5, -2, -1, -0.5, 0.5, 1, 2, 3.5]; // avoids |x|'s corner at 0 for difference checks
const H = 1e-4;

describe("trace function library — closed forms vs central differences", () => {
  const smooth: TraceFn[] = ["square", "cubic", "cubicMix"];
  it("traceSlopeAt is the derivative of traceAt (independent finite-difference check)", () => {
    for (const fn of [...smooth, "abs" as const]) {
      for (const x of XS) {
        const numeric = (traceAt(fn, x + H) - traceAt(fn, x - H)) / (2 * H);
        expect(traceSlopeAt(fn, x), `${fn} at ${x}`).toBeCloseTo(numeric, 5);
      }
    }
  });
  it("traceSecondAt is the derivative of traceSlopeAt (same operator, one level up)", () => {
    for (const fn of smooth) {
      for (const x of XS) {
        const numeric = ((traceSlopeAt(fn, x + H) as number) - (traceSlopeAt(fn, x - H) as number)) / (2 * H);
        expect(traceSecondAt(fn, x), `${fn} at ${x}`).toBeCloseTo(numeric, 4);
      }
    }
    // |x|: straight on both sides (f″ = 0), undefined at the corner — like f′ there.
    expect(traceSecondAt("abs", 2)).toBe(0);
    expect(traceSecondAt("abs", 0)).toBeNull();
    expect(traceSlopeAt("abs", 0)).toBeNull();
  });
  it("cubicMix separates the events the lesson needs: critical points at ±1, inflection at 0", () => {
    expect(traceSlopeAt("cubicMix", -1)).toBe(0);
    expect(traceSlopeAt("cubicMix", 1)).toBe(0);
    expect(traceSecondAt("cubicMix", -1)).toBeLessThan(0); // flat AND bending down: a local max
    expect(traceSecondAt("cubicMix", 1)).toBeGreaterThan(0); // flat AND bending up: a local min
    expect(traceSecondAt("cubicMix", 0)).toBe(0); // the bend flips…
    expect(traceSlopeAt("cubicMix", 0)).toBe(-3); // …where the tangent is NOT flat
  });
});

const specWith = (over: Partial<Record<string, unknown>>): TWidget =>
  ({
    type: "derivativeTrace",
    prompt: "p",
    fn: "cubicMix",
    mode: "point",
    targetX: 0,
    targetSlope: 0,
    start: -2,
    showSecond: true, offsetMax: 0,
    successFeedback: "s",
    lowFeedback: "l",
    highFeedback: "h",
    ...over
  }) as unknown as TWidget;

describe("f″ pane rendering", () => {
  it("showSecond draws the third pane; default leaves the widget exactly two panes", () => {
    const withPane = render(
      React.createElement(WidgetRenderer, { spec: specWith({}), value: -2, onChange: () => {}, disabled: false })
    );
    expect(withPane.container.querySelectorAll('[data-testid="dt-second"]').length).toBe(1);
    const without = render(
      React.createElement(WidgetRenderer, { spec: specWith({ showSecond: false }), value: -2, onChange: () => {}, disabled: false })
    );
    expect(without.container.querySelectorAll('[data-testid="dt-second"]').length).toBe(0);
  });
  it("the f″ trace is drawn only as far as the learner has dragged — it is traced, not told", () => {
    const early = render(
      React.createElement(WidgetRenderer, { spec: specWith({}), value: -3, onChange: () => {}, disabled: false })
    );
    const late = render(
      React.createElement(WidgetRenderer, { spec: specWith({}), value: 3, onChange: () => {}, disabled: false })
    );
    const len = (c: HTMLElement) =>
      (c.querySelector('[data-testid="dt-second"] path')?.getAttribute("d") ?? "").length;
    expect(len(late.container as unknown as HTMLElement)).toBeGreaterThan(len(early.container as unknown as HTMLElement));
  });
});

describe("describeState reads the SAME library the grader uses", () => {
  it("speaks slope and bend from traceSlopeAt/traceSecondAt, including the inflection", () => {
    const atInflection = describeWidgetState(specWith({}), 0)!;
    expect(atInflection).toContain("y = x³ − 3x");
    expect(atInflection).toContain("-3"); // f′(0) — flat it is not
    expect(atInflection).toContain("not bending"); // f″(0) = 0
    const atMax = describeWidgetState(specWith({}), -1)!;
    expect(atMax).toContain("flat"); // f′(−1) = 0
    expect(atMax).toContain("bending downward"); // f″(−1) = −6
  });
  it("without showSecond the description never mentions f″ — the pane is not on screen", () => {
    expect(describeWidgetState(specWith({ showSecond: false }), -1)!).not.toContain("f″");
  });
});
