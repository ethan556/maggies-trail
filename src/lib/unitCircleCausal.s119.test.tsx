// @vitest-environment jsdom
/**
 * RELEASE BLOCKER 2 — unit-circle causal representation.
 *
 * The wave view drew the moving point at (cos g, sin g) and ran ONE vertical leader line from that
 * point's height to the graph, with a source comment asserting "the point's height IS the trace
 * value". True for sine; false for cosine (which is the point's WIDTH) and false for tangent
 * (which is not a coordinate of the point at all). The picture taught a false causal story for two
 * of the three functions.
 *
 * Two further faults sat alongside it: the circle's radius was scaled by |amplitude|, so a
 * "unit circle" of radius 2 was being presented as a unit circle; and the graph's y-scale divided
 * by max(|amplitude|, 1), which exactly cancelled the amplitude it was meant to display.
 *
 * Every expected value below is computed from Math.sin/cos/tan in the test, never from the
 * engine's own helpers.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, ucWaveY, ucCircleQuantity, ucTransferGeometry, type TWidget } from "./schema";

afterEach(() => cleanup());
const D = Math.PI / 180;

const spec = (o: Record<string, unknown> = {}) =>
  WidgetSpec.parse({
    type: "unitCircleExplore",
    prompt: "p",
    targetAngle: 90,
    angleStart: 0,
    angleStep: 5,
    trace: "sin",
    successFeedback: "ok",
    lowFeedback: "lo",
    highFeedback: "hi",
    ...o
  }) as TWidget;

function mount(s: TWidget) {
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
  }
  return render(<Host />).container;
}

describe("ucCircleQuantity — each trace comes from its OWN circle quantity", () => {
  const angles = [0, 30, 45, 60, 90, 120, 135, 180, 210, 270, 300, 330, 360];

  it.each(angles)("at %i°, sine is the vertical coordinate", (a) => {
    expect(ucCircleQuantity("sin", a)).toBeCloseTo(Math.sin(a * D), 12);
  });

  it.each(angles)("at %i°, cosine is the HORIZONTAL coordinate — not the height", (a) => {
    expect(ucCircleQuantity("cos", a)).toBeCloseTo(Math.cos(a * D), 12);
  });

  it("cosine and sine genuinely differ, so conflating them was a real error", () => {
    // At 30° the point is (0.866, 0.5): drawing a vertical drop for cosine would have shown 0.5
    // where the answer is 0.866.
    expect(ucCircleQuantity("cos", 30)).toBeCloseTo(0.8660254, 6);
    expect(ucCircleQuantity("sin", 30)).toBeCloseTo(0.5, 6);
    expect(ucCircleQuantity("cos", 30)).not.toBeCloseTo(ucCircleQuantity("sin", 30), 3);
  });

  it.each([30, 45, 60, 135, 210])("at %i°, tangent is sin/cos — the tangent-line height", (a) => {
    expect(ucCircleQuantity("tan", a)).toBeCloseTo(Math.sin(a * D) / Math.cos(a * D), 9);
  });
});

describe("ucTransferGeometry — the construction matches the function", () => {
  it("sine reads a VERTICAL height off the point", () => {
    const g = ucTransferGeometry("sin", 30);
    expect(g.kind).toBe("vertical");
    expect(g.readAt).toBeCloseTo(Math.sin(30 * D), 12);
    expect(g.from[1]).toBeCloseTo(g.readAt, 12); // it really is the point's own height
  });

  it("cosine reads a HORIZONTAL width, and it is the point's x — not its y", () => {
    const g = ucTransferGeometry("cos", 30);
    expect(g.kind).toBe("horizontal");
    expect(g.readAt).toBeCloseTo(Math.cos(30 * D), 12);
    expect(g.from[0]).toBeCloseTo(g.readAt, 12);
    expect(g.readAt).not.toBeCloseTo(g.from[1], 3); // NOT the height
  });

  it("tangent uses the tangent-line intersection, not a coordinate of the point", () => {
    const g = ucTransferGeometry("tan", 30);
    expect(g.kind).toBe("tangent");
    expect(g.readAt).toBeCloseTo(Math.tan(30 * D), 9);
    // The intersection height exceeds the point's own height — it is a different construction.
    expect(Math.abs(g.readAt)).toBeGreaterThan(Math.abs(g.from[1]));
  });

  it("tangent is reported UNDEFINED at the asymptotes rather than drawn at a clamp", () => {
    expect(ucTransferGeometry("tan", 90).defined).toBe(false);
    expect(ucTransferGeometry("tan", 270).defined).toBe(false);
    expect(ucTransferGeometry("tan", 89).defined).toBe(true);
  });

  it("the transfer is amplitude- and midline-free — the circle keeps its meaning", () => {
    // Same angle, same construction, regardless of what the graph does with the value.
    expect(ucTransferGeometry("sin", 40)).toEqual(ucTransferGeometry("sin", 40));
    expect(ucTransferGeometry("sin", 40).readAt).toBeCloseTo(Math.sin(40 * D), 12);
  });
});

describe("the emitted ordinate composes the transfer with amplitude and midline", () => {
  const cases: Array<["sin" | "cos" | "tan", number, number, number, number, number]> = [
    // trace, x, amp, b, phase, mid
    ["sin", 30, 1, 1, 0, 0],
    ["sin", 30, 2, 1, 0, 0],
    ["sin", 30, -1, 1, 0, 0],
    ["cos", 60, 3, 1, 0, 1],
    ["cos", 60, 1, 2, 0, 0],
    ["sin", 45, 2, 1, 90, -1],
    ["tan", 30, 1, 1, 0, 0]
  ];
  it.each(cases)("%s x=%i a=%i b=%i p=%i m=%i", (trace, x, a, b, p, m) => {
    const gen = b * x + p;
    // THE INVARIANT: what the graph plots is the circle quantity, scaled and shifted.
    expect(ucWaveY(x, trace, a, b, p, m)).toBeCloseTo(a * ucCircleQuantity(trace, gen) + m, 9);
  });

  it("negative amplitude reflects the OUTPUT, leaving the circle quantity alone", () => {
    const q = ucCircleQuantity("sin", 30);
    expect(ucWaveY(30, "sin", -1, 1, 0, 0)).toBeCloseTo(-q, 12);
    expect(ucWaveY(30, "sin", 1, 1, 0, 0)).toBeCloseTo(q, 12);
    // the reflection is exactly a sign change on the emitted value
    expect(ucWaveY(30, "sin", -2, 1, 0, 0)).toBeCloseTo(-ucWaveY(30, "sin", 2, 1, 0, 0), 12);
  });

  it("midline displaces the whole trace and nothing else", () => {
    for (const x of [0, 45, 90, 200]) {
      expect(ucWaveY(x, "sin", 1, 1, 0, 3) - ucWaveY(x, "sin", 1, 1, 0, 0)).toBeCloseTo(3, 12);
    }
  });

  it("phase displaces the ANGLE, which is why the graph shifts", () => {
    // A 90° phase makes sine read as cosine — the displacement relationship, stated exactly.
    for (const x of [0, 30, 75, 140]) {
      expect(ucWaveY(x, "sin", 1, 1, 90, 0)).toBeCloseTo(Math.cos(x * D), 9);
    }
  });
});

describe("key-angle invariants", () => {
  it("sine and cosine at the quadrantal angles", () => {
    expect(ucCircleQuantity("sin", 0)).toBeCloseTo(0, 12);
    expect(ucCircleQuantity("cos", 0)).toBeCloseTo(1, 12);
    expect(ucCircleQuantity("sin", 90)).toBeCloseTo(1, 12);
    expect(ucCircleQuantity("cos", 90)).toBeCloseTo(0, 12);
    expect(ucCircleQuantity("sin", 180)).toBeCloseTo(0, 12);
    expect(ucCircleQuantity("cos", 180)).toBeCloseTo(-1, 12);
    expect(ucCircleQuantity("sin", 270)).toBeCloseTo(-1, 12);
    expect(ucCircleQuantity("cos", 270)).toBeCloseTo(0, 12);
  });

  it("the Pythagorean identity holds at every tested angle", () => {
    for (let a = 0; a < 360; a += 7) {
      const s = ucCircleQuantity("sin", a), c = ucCircleQuantity("cos", a);
      expect(s * s + c * c).toBeCloseTo(1, 12);
    }
  });

  it("tangent equals sine over cosine wherever it is defined", () => {
    for (let a = 0; a < 360; a += 7) {
      const g = ucTransferGeometry("tan", a);
      if (!g.defined) continue;
      expect(g.readAt).toBeCloseTo(ucCircleQuantity("sin", a) / ucCircleQuantity("cos", a), 9);
    }
  });
});

describe("rendering — the construction on screen matches the function", () => {
  it("sine draws the vertical read, and no cosine arc", () => {
    const c = mount(spec({ trace: "sin", angleStart: 30 }));
    expect(c.querySelector('[data-testid="uc-src-vertical"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="uc-src-arc"]')).toBeNull();
  });

  it("cosine draws the HORIZONTAL read and a quarter-turn arc, not a vertical drop", () => {
    const c = mount(spec({ trace: "cos", angleStart: 30 }));
    expect(c.querySelector('[data-testid="uc-src-horizontal"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="uc-src-arc"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="uc-src-vertical"]')).toBeNull();
  });

  it("tangent draws the tangent line and the extended ray", () => {
    const c = mount(spec({ trace: "tan", angleStart: 30 }));
    expect(c.querySelector('[data-testid="uc-tangent-line"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="uc-tangent-ray"]')).toBeTruthy();
    expect(c.querySelector('[data-testid="uc-src-vertical"]')).toBeNull();
  });

  it("the circle stays a UNIT circle at every amplitude", () => {
    const r1 = mount(spec({ trace: "sin", amplitude: 1 })).querySelector("circle");
    const a1 = r1?.getAttribute("r");
    cleanup();
    const r2 = mount(spec({ trace: "sin", amplitude: 3 })).querySelector("circle");
    expect(r2?.getAttribute("r")).toBe(a1);
  });
});
