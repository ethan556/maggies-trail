// @vitest-environment jsdom
/**
 * S119 — numberLineHop rational hops (`denom`).
 *
 * S116 declined to put ns-01-01 (2 ÷ 1/5) on this engine, correctly: the only way then was to
 * relabel a 0–2 question as a 0–10 integer axis, which "misrepresents the mathematics rather than
 * revealing it". This mode answers that specific objection — the axis reads the question's own
 * numbers (0, 1/5, … 1, … 2) with whole numbers emphasised, while the arithmetic underneath stays
 * in exact integer numerator units, so grading is unchanged and no float is involved.
 *
 * Labels are checked against fractions computed in the test, not against `hopLabel`, so a bug in
 * the shared formatter fails here rather than agreeing with itself.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, hopLabel, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

afterEach(() => cleanup());

const spec = (o: Record<string, unknown>) =>
  WidgetSpec.parse({
    type: "numberLineHop",
    prompt: "p",
    min: 0,
    max: 10,
    start: 0,
    hop: 1,
    hops: 10,
    denom: 5,
    direction: "forward",
    commonLandings: [],
    missFeedback: "miss",
    successFeedback: "ok",
    ...o
  }) as TWidget;

function mount(s: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

describe("hopLabel — exact, reduced, no floats", () => {
  it.each([
    [0, 5, "0"],
    [1, 5, "1/5"],
    [2, 5, "2/5"],
    [5, 5, "1"],
    [7, 5, "1 2/5"],
    [10, 5, "2"],
    [6, 4, "1 1/2"], // reduces
    [4, 3, "1 1/3"],
    [8, 2, "4"]
  ])("%i units over %i reads %s", (u, d, want) => {
    expect(hopLabel(u, d)).toBe(want);
  });

  it("a whole-number landing never shows a fraction", () => {
    for (let w = 0; w <= 4; w++) expect(hopLabel(w * 5, 5)).toBe(String(w));
  });

  it("denom of 1 (or absent) is a plain integer label", () => {
    expect(hopLabel(7, 1)).toBe("7");
  });
});

describe("backward compatibility — an integer spec is untouched", () => {
  it("a spec with no denom labels ticks as plain integers", () => {
    mount(spec({ denom: undefined, min: 0, max: 10, hop: 1, hops: 4 }));
    expect(screen.getByRole("radio", { name: "Land on 4" })).toBeTruthy();
  });

  it("grading is identical with and without denom — the evaluator sees only numerator units", () => {
    const withDenom = spec({});
    const without = spec({ denom: undefined });
    for (const v of [10, 2, 7]) {
      expect(evaluate(withDenom, v).correct).toBe(evaluate(without, v).correct);
    }
  });
});

describe("the axis speaks the question's numbers (S116's objection, answered)", () => {
  it("ns-01-01's line offers 2 as a landing, not 10", () => {
    mount(spec({}));
    // The learner sees "2", the question's number — not the internal count of fifths.
    expect(screen.getByRole("radio", { name: "Land on 2" })).toBeTruthy();
    expect(screen.queryByRole("radio", { name: "Land on 10" })).toBeNull();
  });

  it("fractional positions between the wholes are offered with true fraction names", () => {
    mount(spec({}));
    expect(screen.getByRole("radio", { name: "Land on 1/5" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Land on 1 2/5" })).toBeTruthy();
  });

  it("whole numbers are the emphasised landmarks", () => {
    const c = mount(spec({}));
    const wholeTicks = [...c.querySelectorAll("line")].filter((l) => l.getAttribute("stroke-width") === "2");
    // 0, 1 and 2 are whole positions on a 0–10 fifths lattice (plus the axis rule itself).
    expect(wholeTicks.length).toBeGreaterThanOrEqual(3);
  });

  it("grading still lands on the exact hop count: 2 ÷ 1/5 = 10 fifths", () => {
    const s = spec({});
    expect(evaluate(s, 10).correct).toBe(true); // 10 fifths = 2 wholes
    expect(evaluate(s, 5).correct).toBe(false); // 1 whole — halfway
  });

  it("fm-05-01's halves and fm-05-03's quarters grade exactly", () => {
    const halves = spec({ denom: 2, max: 8, hops: 8 });
    expect(evaluate(halves, 8).correct).toBe(true); // 4 ÷ 1/2 = 8
    const quarters = spec({ denom: 4, max: 12, hops: 12 });
    expect(evaluate(quarters, 12).correct).toBe(true); // 3 ÷ 1/4 = 12
  });
});
