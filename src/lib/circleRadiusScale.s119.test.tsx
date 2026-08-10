// @vitest-environment jsdom
/**
 * S119 — `circleMeasureExplore` radiusScale: the circle that responds.
 *
 * g7-02-03's own concept step states the misconception outright: *"Circumference and area are the
 * classic mix-up: C = 2πr doubles, A = πr² squares."* That is a claim about how two quantities
 * RESPOND to a change in r — and no fixed diagram can show a response. The other three modes hold
 * the circle still and move something inside it; this one moves the circle.
 *
 * Exactness matters here and is asserted directly: at whole r every measure is an exact integer
 * (d = 2r, and the π-coefficients 2r and r²), so nothing on screen is rounded and grading is
 * integer equality. Coefficients are checked against arithmetic written in the test.
 *
 * The keyboard drive is included HERE rather than left to the shared gate: `byType` takes the
 * FIRST sample of each type, and an earlier chordDistance sample already claims that slot, so the
 * shared gate never exercises this mode.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, widgetIntegrityErrors, circleScaleReadouts, type TWidget } from "./schema";
import { evaluate, correctAnswerText } from "./evaluate";

afterEach(() => cleanup());

const base = {
  type: "circleMeasureExplore" as const,
  mode: "radiusScale" as const,
  prompt: "p",
  radius: 5,
  targetRadius: 5,
  radiusMax: 10,
  askQuantity: "circumference" as const,
  successFeedback: "ok",
  lowFeedback: "too small",
  highFeedback: "too big"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

function Host({ s }: { s: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
}

describe("circleScaleReadouts is exact, checked against arithmetic here", () => {
  it.each([1, 2, 3, 5, 7, 10, 12])("r = %i gives whole-number measures", (r) => {
    const t = circleScaleReadouts(r);
    expect(t.diameter).toBe(r + r);
    expect(t.circumferenceCoef).toBe(r + r);
    expect(t.areaCoef).toBe(r * r);
    expect(Number.isInteger(t.areaCoef)).toBe(true);
  });

  it("THE LESSON: circumference tracks 2r while area tracks r squared — they diverge", () => {
    // Doubling the radius doubles the circumference and QUADRUPLES the area.
    const a = circleScaleReadouts(3);
    const b = circleScaleReadouts(6);
    expect(b.circumferenceCoef / a.circumferenceCoef).toBe(2);
    expect(b.areaCoef / a.areaCoef).toBe(4);
  });

  it("the two coefficients coincide only at r = 2, which is why the gate bars small targets", () => {
    const coincide: number[] = [];
    for (let r = 1; r <= 12; r++) {
      const t = circleScaleReadouts(r);
      if (t.circumferenceCoef === t.areaCoef) coincide.push(r);
    }
    expect(coincide).toEqual([2]);
  });

  it("covers the three lessons' own answers at r = 5", () => {
    const t = circleScaleReadouts(5);
    expect(t.diameter).toBe(10); // g7-02-01/i1
    expect(t.circumferenceCoef).toBe(10); // g7-02-02/i1
    expect(t.areaCoef).toBe(25); // g7-02-03/i1
  });
});

describe("grading", () => {
  const s = spec();
  it("the target radius is correct", () => {
    expect(evaluate(s, 5).correct).toBe(true);
  });
  it("under and over get their own directions", () => {
    expect(evaluate(s, 3)).toEqual({ correct: false, feedback: base.lowFeedback });
    expect(evaluate(s, 8)).toEqual({ correct: false, feedback: base.highFeedback });
  });
  it("refuses a non-number", () => {
    expect(evaluate(s, null).correct).toBe(false);
  });
  it("correctAnswerText states the radius AND the asked quantity", () => {
    expect(correctAnswerText(s)).toContain("radius 5");
    expect(correctAnswerText(s)).toContain("circumference 10");
    expect(correctAnswerText(spec({ askQuantity: "area" }))).toContain("area 25");
    expect(correctAnswerText(spec({ askQuantity: "diameter" }))).toContain("diameter 10");
  });
});

describe("backward compatibility — the other three modes are untouched", () => {
  const chord = {
    type: "circleMeasureExplore" as const,
    mode: "chordDistance" as const,
    prompt: "p",
    radius: 5,
    targetLength: 8,
    start: 0,
    successFeedback: "ok",
    lowFeedback: "lo",
    highFeedback: "hi"
  };
  it("a chordDistance spec parses with none of the radiusScale keys injected", () => {
    const p = WidgetSpec.parse(chord) as Record<string, unknown>;
    expect("targetRadius" in p).toBe(false);
    expect("askQuantity" in p).toBe(false);
    expect("radiusMax" in p).toBe(false);
  });
  it("chordDistance still grades through circleMeasureReadout — 2√(25−9) = 8 at v = 3", () => {
    expect(2 * Math.sqrt(25 - 9)).toBe(8);
    expect(evaluate(WidgetSpec.parse(chord) as TWidget, 3).correct).toBe(true);
  });
  it("chordDistance still passes its own integrity gate", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(chord) as TWidget)).toEqual([]);
  });
});

describe("integrity gate", () => {
  it("accepts a well-formed radiusScale lab", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
  });
  it("refuses a target above the slider ceiling", () => {
    expect(widgetIntegrityErrors(spec({ targetRadius: 12, radiusMax: 8 })).join(" ")).toMatch(/above radiusMax/);
  });
  it("REFUSES r < 3, where the doubling-vs-squaring contrast is invisible", () => {
    // At r = 2 the coefficients are both 4; at r = 1 they are 2 and 1. Neither shows the divergence.
    expect(circleScaleReadouts(2).circumferenceCoef).toBe(circleScaleReadouts(2).areaCoef);
    expect(widgetIntegrityErrors(spec({ targetRadius: 2 })).join(" ")).toMatch(/contrast/);
  });
  it("refuses radiusScale fields on the other modes as dead configuration", () => {
    const bad = {
      type: "circleMeasureExplore" as const,
      mode: "arcSector" as const,
      prompt: "p",
      radius: 5,
      targetAngle: 90,
      targetRadius: 5,
      successFeedback: "ok",
      lowFeedback: "lo",
      highFeedback: "hi"
    };
    expect(widgetIntegrityErrors(WidgetSpec.parse(bad) as TWidget).join(" ")).toMatch(/unreachable outside radiusScale/);
  });
});

describe("rendering and keyboard parity", () => {
  it("shows all three measures at once — the divergence needs them side by side", () => {
    const { container } = render(<Host s={spec()} />);
    expect(container.textContent).toContain("diameter");
    expect(container.textContent).toContain("circumference");
    expect(container.textContent).toContain("area");
  });

  it("KEYBOARD DRIVE (the shared gate cannot reach this mode): the range solves it", () => {
    const s = spec();
    let v: unknown = null;
    function H() {
      const [val, setVal] = useState<unknown>(null);
      v = val;
      return <WidgetRenderer spec={s} value={val} disabled={false} onChange={(x) => { v = x; setVal(x); }} />;
    }
    render(<H />);
    const slider = screen.getByLabelText("radius") as HTMLInputElement;
    expect(slider.tagName).toBe("INPUT");
    expect(slider.type).toBe("range");
    fireEvent.change(slider, { target: { value: "5" } });
    expect(evaluate(s, v).correct).toBe(true);
  });

  it("aria-valuetext carries all three measures, not just the raw radius", () => {
    render(<Host s={spec()} />);
    const t = screen.getByLabelText("radius").getAttribute("aria-valuetext") ?? "";
    expect(t).toMatch(/radius 1/);
    expect(t).toMatch(/diameter 2/);
    expect(t).toMatch(/area 1 pi/);
  });
});
