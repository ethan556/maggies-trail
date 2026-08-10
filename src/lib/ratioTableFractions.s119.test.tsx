// @vitest-environment jsdom
/**
 * S119 — `ratioTable` fraction mode, and the ratio-consistency gate that came with it.
 *
 * The unit-rate lessons are titled "Dividing by a Fraction". Every engine that fitted their
 * arithmetic displayed 0.25 and 0.3125, which sidesteps the thing being taught — so they were
 * declined earlier this session on exactly that ground. `doubleNumberLine.denom` was then measured
 * and served only ONE of the three (the other two need 16 and 20 steps against a max of 8).
 * ratioTable has no step lattice, so all three fit.
 *
 * Two properties matter and are both adversarial here:
 *   1. Nothing displays as a decimal — the fractions survive, via the SAME `hopLabel` already
 *      proven for numberLineHop, so there is one fraction formatter rather than two.
 *   2. Every row of a ratio table asserts the SAME ratio. A decorative row that quietly breaks it
 *      teaches a false pattern and the learner cannot tell which row to trust. Nothing checked
 *      that before; the new integrity gate does, and it is checked here against tables built to
 *      break it.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, widgetIntegrityErrors, hopLabel, type TWidget } from "./schema";
import { evaluate } from "./evaluate";

afterEach(() => cleanup());

const base = {
  type: "ratioTable" as const,
  prompt: "p",
  colA: "time",
  colB: "distance",
  denom: 4,
  rows: [
    [1, 2],
    [2, 4]
  ],
  askA: 4,
  targetB: 8,
  bMax: 16,
  bStep: 1,
  bStart: 0,
  successFeedback: "ok",
  lowFeedback: "low",
  highFeedback: "high"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

function mount(s: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

describe("the three lessons' arithmetic, computed here", () => {
  const cases: Array<[string, number, number, number, number, number]> = [
    // id, denom, a0, b0, askA, targetB
    ["pr-01-01/i1", 4, 1, 2, 4, 8],
    ["pr-01-03/i1", 16, 5, 10, 16, 32],
    ["pr-01-03/i2", 20, 3, 6, 20, 40]
  ];
  it.each(cases)("%s is a consistent ratio with unit rate 2", (_id, den, a0, b0, askA, targetB) => {
    // cross-multiplication, not division — exact integers throughout
    expect(b0 * askA).toBe(a0 * targetB);
    expect(targetB / askA).toBe(2);
    // and the denominator really does make askA one whole unit
    expect(askA / den).toBe(1);
  });

  it("the fractions are the lessons' own numbers, not decimal stand-ins", () => {
    expect(hopLabel(1, 4)).toBe("1/4");
    expect(hopLabel(2, 4)).toBe("1/2"); // reduces
    expect(hopLabel(5, 16)).toBe("5/16");
    expect(hopLabel(10, 16)).toBe("5/8"); // reduces
    expect(hopLabel(3, 20)).toBe("3/20");
    expect(hopLabel(6, 20)).toBe("3/10"); // reduces
  });
});

describe("ADVERSARIAL — no decimal ever reaches the screen in fraction mode", () => {
  it.each([
    [4, [1, 2] as [number, number], 4, 8],
    [16, [5, 10] as [number, number], 16, 32],
    [20, [3, 6] as [number, number], 20, 40]
  ])("denom %i renders fractions, not decimals", (den, row, askA, targetB) => {
    const c = mount(spec({ denom: den, rows: [row, [row[0] * 2, row[1] * 2]], askA, targetB, bMax: targetB + 8 }));
    const text = c.textContent ?? "";
    // The decimal forms these would otherwise take: 0.25, 0.3125, 0.15 …
    expect(text).not.toMatch(/0\.\d/);
    expect(text).toContain("/");
  });

  it("a table WITHOUT denom still shows plain numbers — the mode is opt-in", () => {
    const c = mount(spec({ denom: undefined, rows: [[4, 6], [8, 12]], askA: 20, targetB: 30, bMax: 40 }));
    const text = c.textContent ?? "";
    expect(text).toContain("20");
  });
});

describe("ADVERSARIAL — the ratio-consistency gate", () => {
  it("accepts each of the three authored tables", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
    expect(widgetIntegrityErrors(spec({ denom: 16, rows: [[5, 10], [10, 20]], askA: 16, targetB: 32, bMax: 48 }))).toEqual([]);
    expect(widgetIntegrityErrors(spec({ denom: 20, rows: [[3, 6], [6, 12]], askA: 20, targetB: 40, bMax: 60 }))).toEqual([]);
  });

  it("REFUSES a shown row that quietly breaks the ratio", () => {
    // 1:2 and 2:5 are different rates. A learner reading down the column would see no rule at all.
    expect(2 * 1).not.toBe(1 * 5);
    expect(widgetIntegrityErrors(spec({ rows: [[1, 2], [2, 5]] })).join(" ")).toMatch(/off the ratio/);
  });

  it("REFUSES a target that is off the ratio the rows establish", () => {
    // rows say 1:2, so askA 4 must give 8 — not 9.
    expect(widgetIntegrityErrors(spec({ targetB: 9 })).join(" ")).toMatch(/off the ratio/);
  });

  it("refuses a target above the slider ceiling", () => {
    expect(widgetIntegrityErrors(spec({ askA: 12, targetB: 24, bMax: 16 })).join(" ")).toMatch(/above bMax/);
  });

  it("refuses a target off the bStep lattice", () => {
    // 1:2 with askA 5 needs targetB 10; on a step of 4 that value cannot be selected.
    expect(widgetIntegrityErrors(spec({ askA: 5, targetB: 10, bStep: 4, bMax: 20 })).join(" ")).toMatch(/bStep lattice/);
  });

  it("refuses fractional counts in fraction mode — the whole point is integers underneath", () => {
    expect(widgetIntegrityErrors(spec({ rows: [[1.5, 3], [3, 6]], askA: 6, targetB: 12 })).join(" ")).toMatch(
      /must be a whole number/
    );
  });

  it("refuses a first row that fixes no ratio", () => {
    expect(widgetIntegrityErrors(spec({ rows: [[0, 0], [2, 4]] })).join(" ")).toMatch(/fixes no ratio/);
  });
});

describe("grading is unchanged and exact", () => {
  it("the unit rate is accepted and neighbours are not", () => {
    const s = spec();
    expect(evaluate(s, 8).correct).toBe(true);
    expect(evaluate(s, 7).correct).toBe(false);
    expect(evaluate(s, 9).correct).toBe(false);
  });

  it("under and over get their own directions", () => {
    const s = spec();
    expect(evaluate(s, 4).feedback).toBe(base.lowFeedback);
    expect(evaluate(s, 12).feedback).toBe(base.highFeedback);
  });
});
