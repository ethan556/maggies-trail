// @vitest-environment jsdom
//
// DIRECT-MANIPULATION REGRESSION SUITE.
//
// The drag layer (useSvgDrag) gives ten laboratory widgets a pointer path to
// the same value their sliders drive. These tests pin the contract:
//
//   1. A press/drag at a viewBox position produces the SNAPPED value the
//      widget's math maps it to — never a raw float, never out of range.
//   2. The slider (the keyboard-parity control) is still rendered and still
//      drives the same value: drag is redundant, never the only path.
//   3. When the step is finalized (disabled), the drag hit area is gone.
//
// jsdom has no layout, so each test pins the SVG's bounding rect to its
// viewBox size (scale 1: client px == viewBox units), which is exactly the
// mapping useSvgDrag performs from the live rect in a real browser.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { snapToStep } from "./useSvgDrag";

afterEach(cleanup);

function pinRect(svg: SVGSVGElement, w: number, h: number) {
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, x: 0, y: 0, width: w, height: h, right: w, bottom: h, toJSON: () => ({}) }) as DOMRect;
}

function mount(spec: TWidget, disabled = false) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer
        spec={spec}
        value={value}
        onChange={(v) => {
          holder.v = v;
          setValue(v);
        }}
        disabled={disabled}
      />
    );
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}

describe("snapToStep", () => {
  it("clamps and snaps to the lattice, without float dust", () => {
    expect(snapToStep(3.7, 0, 10, 1)).toBe(4);
    expect(snapToStep(-2, 0, 10, 1)).toBe(0);
    expect(snapToStep(99, 0, 10, 1)).toBe(10);
    expect(snapToStep(0.31, 0, 1, 0.1)).toBe(0.3); // not 0.30000000000000004
    expect(snapToStep(7.4, 5, 9, 2)).toBe(7);
  });
});

describe("numberLinePlace drag", () => {
  const spec = WidgetSpec.parse({
    type: "numberLinePlace",
    prompt: "Place 6 on the line.",
    min: 0,
    max: 10,
    step: 1,
    tickStep: 1,
    target: 6,
    start: 0,
    successFeedback: "That's 6 — six steps from zero.",
    lowFeedback: "Too far left — count up from zero.",
    highFeedback: "Too far right — count back toward zero."
  }) as TWidget;

  it("press on the line places the marker at the snapped value", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 72);
    const hit = screen.getByTestId("nlp-drag");
    // viewBox: pad=20, usable 280 wide; value 6 of [0,10] sits at x = 20 + 0.6*280 = 188
    fireEvent.pointerDown(hit, { clientX: 188, clientY: 46 });
    expect(holder.v).toBe(6);
  });

  it("drag between lattice points snaps, never emits a raw float", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 72);
    const hit = screen.getByTestId("nlp-drag");
    fireEvent.pointerDown(hit, { clientX: 100, clientY: 46 });
    fireEvent.pointerMove(hit, { clientX: 173, clientY: 46 }); // raw ≈ 5.46 → snaps to 5
    expect(holder.v).toBe(5);
    fireEvent.pointerUp(hit, { clientX: 173, clientY: 46 });
  });

  it("keeps the slider as the keyboard-parity path to the same value", () => {
    const { holder } = mount(spec);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "6" } });
    expect(holder.v).toBe(6);
  });

  it("removes the drag surface when finalized (disabled)", () => {
    mount(spec, true);
    expect(screen.queryByTestId("nlp-drag")).toBeNull();
  });
});

describe("lineExplore drag handles", () => {
  const spec: TWidget = {
    type: "lineExplore",
    prompt: "Build y = 2x + 1.",
    targetSlope: 2,
    targetIntercept: 1,
    slopeMin: -4,
    slopeMax: 4,
    interceptMin: -5,
    interceptMax: 5,
    slopeStart: 0,
    interceptStart: 0,
    gridMax: 6,
    successFeedback: "y = 2x + 1 — slope 2 climbs, intercept 1 anchors the crossing.",
    slopeFeedback: "The tilt is off — the rise over one run must be 2.",
    interceptFeedback: "The crossing is off — the line must meet the y-axis at 1."
  };

  // gridScales: W=H=300, pad=12 → y = -G..G maps to 288..12; unit = 276/(2G) = 23 px per 1.
  const yPx = (mathY: number) => 288 - ((mathY + 6) / 12) * 276;

  it("dragging the intercept point slides b (snapped, clamped)", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("le-drag-b");
    fireEvent.pointerDown(hit, { clientX: 150, clientY: yPx(3.2) }); // raw 3.2 → b = 3
    expect(holder.v).toEqual({ m: 0, b: 3 });
    fireEvent.pointerMove(hit, { clientX: 150, clientY: yPx(-9) }); // below range → clamps to -5
    expect(holder.v).toEqual({ m: 0, b: -5 });
  });

  it("dragging the unit point tilts m around the current b", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("le-drag-m");
    // b is 0; pulling the x=1 point to y≈2.1 → m = 2
    fireEvent.pointerDown(hit, { clientX: 173, clientY: yPx(2.1) });
    expect(holder.v).toEqual({ m: 2, b: 0 });
  });

  it("keeps both sliders as the keyboard-parity path", () => {
    const { holder } = mount(spec);
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "1" } });
    expect(holder.v).toEqual({ m: 2, b: 1 });
  });
});

describe("quadDrag corner drag", () => {
  const spec: TWidget = {
    type: "quadDrag",
    prompt: "Finish the rectangle.",
    fixed: [
      [1, 1],
      [5, 1],
      [5, 4]
    ],
    targetX: 1,
    targetY: 4,
    startX: 2,
    startY: 2,
    gridMax: 8,
    targetName: "a rectangle",
    successFeedback: "Four right angles, opposite sides equal — that's the rectangle.",
    sideFeedback: "A side length is off — opposite sides of a rectangle match.",
    angleFeedback: "A corner isn't square — every rectangle angle is 90°."
  };

  it("dragging the fourth corner snaps it to the lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    const hit = screen.getByTestId("qd-drag");
    // W=260, PAD=22, U=(260-44)/8=27; lattice (1,4): x = 22+27 = 49, y = 260-22-4*27 = 130
    fireEvent.pointerDown(hit, { clientX: 52, clientY: 127 }); // near (1,4) → snaps
    expect(holder.v).toEqual({ x: 1, y: 4 });
  });
});

describe("unitCircleExplore point drag", () => {
  const spec: TWidget = {
    type: "unitCircleExplore",
    prompt: "Sweep to 90°.",
    targetAngle: 90,
    angleStart: 0,
    angleStep: 15,
    successFeedback: "At 90° the point sits straight up: cos 0, sin 1.",
    lowFeedback: "Keep sweeping counterclockwise — the angle is still too small.",
    highFeedback: "Past it — sweep back clockwise toward straight up."
  };

  it("dragging the point snaps the angle to the authored step", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("uc-drag");
    // straight up from center (150,150) → 90°; a bit off-vertical still snaps to 90
    fireEvent.pointerDown(hit, { clientX: 154, clientY: 40 });
    expect(holder.v).toEqual({ angle: 90 });
    // drag to the left horizontal → 180°
    fireEvent.pointerMove(hit, { clientX: 40, clientY: 148 });
    expect(holder.v).toEqual({ angle: 180 });
  });

  it("angle stays in [0, 360) — a drag just below the +x axis wraps, not -15", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("uc-drag");
    fireEvent.pointerDown(hit, { clientX: 260, clientY: 178 }); // ≈ -14° raw → 345 or 0 band, never negative
    const angle = (holder.v as { angle: number }).angle;
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(360);
    expect(angle % 15).toBe(0);
  });
});

/* ================= Session-19 breadth: six more drag surfaces =============== */

describe("vectorExplore head drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "vectorExplore",
    prompt: "Make u + v land on the ring.",
    mode: "add",
    ux: 2,
    uy: 1,
    targetX: 4,
    targetY: 3,
    vxStart: 1,
    vyStart: 0,
    gridMax: 6,
    successFeedback: "u + v = (4, 3) — the head-to-tail walk ends on the ring.",
    lowFeedback: "The sum falls short — v needs to reach further.",
    highFeedback: "The sum overshoots — pull v back toward the origin."
  });

  it("dragging v's head snaps components to the integer lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    const hit = screen.getByTestId("ve-drag");
    // W=260, C=130, U=(130-16)/6=19; (2,3) → x=130+38=168, y=130-57=73
    fireEvent.pointerDown(hit, { clientX: 170, clientY: 75 });
    expect(holder.v).toEqual({ vx: 2, vy: 3 });
  });

  it("clamps to ±gridMax at the edge", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    fireEvent.pointerDown(screen.getByTestId("ve-drag"), { clientX: 259, clientY: 130 });
    expect(holder.v).toEqual({ vx: 6, vy: 0 });
  });
});

describe("systemsExplore point drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "systemsExplore",
    prompt: "Find the point on BOTH lines.",
    m1: 1,
    b1: 1,
    m2: -1,
    b2: 5,
    successFeedback: "(2, 3) sits on both lines at once — the system's one solution.",
    offLine1Feedback: "That point misses line 1 — check y = x + 1 there.",
    offLine2Feedback: "That point misses line 2 — check y = −x + 5 there."
  });

  it("dragging the point snaps to integer coordinates", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("se-drag");
    // pad=14, usable 272; x∈[0,6]: x=2 → 14 + (2/6)*272 ≈ 104.7; y∈[0,7]: y=3 → 300-14-(3/7)*272 ≈ 169.4
    fireEvent.pointerDown(hit, { clientX: 105, clientY: 169 });
    expect(holder.v).toEqual({ x: 2, y: 3 });
  });
});

describe("secantSlope B drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "secantSlope",
    prompt: "Shrink the gap toward A.",
    curve: "square",
    mode: "limit",
    a: 1,
    targetH: 0.1,
    startH: 1.5,
    successFeedback: "The gap is tiny and the secant hugs the tangent — slope 2.",
    lowFeedback: "The gap collapsed to nothing — 0/0 says nothing; back off a hair.",
    highFeedback: "The gap is still wide — slide B closer to A."
  });

  it("dragging B horizontally sets the gap on the 0.05 lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 200);
    const hit = screen.getByTestId("ss-drag");
    // xs = [a-2.4, a+2.4] = [-1.4, 3.4]; PAD=26, usable 248. xMath=1.5 → px = 26 + (2.9/4.8)*248 ≈ 175.8 → h = 0.5
    fireEvent.pointerDown(hit, { clientX: 175.8, clientY: 100 });
    expect(holder.v).toBe(0.5);
  });

  it("the drag surface survives h = 0 (learner can drag back out of 0/0)", () => {
    const { container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 200);
    const hit = screen.getByTestId("ss-drag");
    // drag exactly onto A: xMath = 1 → h = 0
    fireEvent.pointerDown(hit, { clientX: 26 + (2.4 / 4.8) * 248, clientY: 100 });
    expect(screen.getByTestId("ss-drag")).toBeTruthy(); // still present, not unmounted with B
  });
});

describe("angleMeasure ray drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "angleMeasure",
    prompt: "Open the angle to 60°.",
    targetAngle: 60,
    angleStart: 0,
    angleStep: 5,
    successFeedback: "60° — a third of the way to a straight angle.",
    lowFeedback: "The opening is still too small — sweep the ray further.",
    highFeedback: "Past it — sweep back toward the baseline."
  });

  it("sweeping the ray snaps to the authored step", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 172);
    const hit = screen.getByTestId("am-drag");
    // center (150, 150); straight up → 90°
    fireEvent.pointerDown(hit, { clientX: 150, clientY: 30 });
    expect(holder.v).toEqual({ angle: 90 });
    // ≈ 61° raw snaps to 60
    fireEvent.pointerMove(hit, { clientX: 150 + 100 * Math.cos((61 * Math.PI) / 180), clientY: 150 - 100 * Math.sin((61 * Math.PI) / 180) });
    expect(holder.v).toEqual({ angle: 60 });
  });

  it("below the baseline clamps to the nearer end, never a negative angle", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 172);
    const hit = screen.getByTestId("am-drag");
    fireEvent.pointerDown(hit, { clientX: 260, clientY: 160 }); // just below the right baseline
    expect(holder.v).toEqual({ angle: 0 });
    fireEvent.pointerMove(hit, { clientX: 40, clientY: 160 }); // just below the left baseline
    expect(holder.v).toEqual({ angle: 180 });
  });
});

describe("quadraticExplore vertex drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "quadraticExplore",
    prompt: "Slide the vertex to (2, −3).",
    targetA: 1,
    targetH: 2,
    targetK: -3,
    successFeedback: "Vertex (2, −3): the +2 slid it right, the −3 slid it down.",
    shapeFeedback: "The width is off — a controls the stretch, not the position.",
    vertexFeedback: "The vertex is misplaced — h slides left-right, k slides up-down."
  });

  it("dragging the vertex sets (h, k) on the integer lattice, leaving a alone", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("qe-drag");
    // G=7 (default), pad=12, usable 276; (2,-3): px = 12 + ((2+7)/14)*276 ≈ 189.4; py = 300-12-((-3+7)/14)*276 ≈ 209.1
    fireEvent.pointerDown(hit, { clientX: 189, clientY: 209 });
    expect(holder.v).toEqual({ a: 1, h: 2, k: -3 });
  });
});

describe("argandExplore z drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "argandExplore",
    prompt: "Drag z to 3 + 2i.",
    mode: "plot",
    targetRe: 3,
    targetIm: 2,
    successFeedback: "3 + 2i: three steps real, two steps imaginary.",
    realFeedback: "The real part is off — count steps along the real axis.",
    imagFeedback: "The imaginary part is off — count steps up the imaginary axis."
  });

  it("dragging z snaps re and im to integers within ±gridMax", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    const hit = screen.getByTestId("ae-drag");
    // G=5 (default), C=130, U=(130-18)/5=22.4; (3,2): x=130+67.2=197.2, y=130-44.8=85.2
    fireEvent.pointerDown(hit, { clientX: 197, clientY: 85 });
    expect(holder.v).toEqual({ re: 3, im: 2 });
  });
});

describe("quadDrag self-measuring figure (errors must teach)", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "quadDrag",
    prompt: "Finish the rectangle.",
    fixed: [
      [1, 1],
      [5, 1],
      [5, 4]
    ],
    targetX: 1,
    targetY: 4,
    startX: 2,
    startY: 2,
    gridMax: 8,
    targetName: "a rectangle",
    successFeedback: "Four right angles, opposite sides equal — that's the rectangle.",
    sideFeedback: "A side length is off — opposite sides of a rectangle match.",
    angleFeedback: "A corner isn't square — every rectangle angle is 90°."
  });

  it("shows live side lengths on the figure and marks exactly the right angles", () => {
    const { container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    // Wrong state (2,2): only the fixed corner at (5,1) is a right angle → one tick
    expect(container.querySelectorAll('polyline[points][stroke="#2FA36B"]').length).toBe(1);
    // Drag the corner to the correct (1,4): all four corners square → four ticks
    fireEvent.pointerDown(screen.getByTestId("qd-drag"), { clientX: 49, clientY: 130 });
    const texts = [...container.querySelectorAll("text")].map((t) => t.textContent);
    expect(texts.filter((t) => t === "4").length).toBe(2); // both long sides measure 4
    expect(texts.filter((t) => t === "3").length).toBe(2); // both short sides measure 3
    expect(container.querySelectorAll('polyline[points][stroke="#2FA36B"]').length).toBe(4);
  });
});

describe("derivativeTrace curve scrub", () => {
  const spec: TWidget = {
    type: "derivativeTrace",
    prompt: "Drag the point along f and watch f′ draw itself.",
    fn: "square",
    mode: "slope",
    targetSlope: 0,
    targetX: 0,
    start: -3,
    showSecond: false, offsetMax: 0,
    successFeedback: "Slope 0 — the tangent lies flat at the bottom of the parabola.",
    lowFeedback: "The tangent still tilts downhill — keep moving toward the vertex.",
    highFeedback: "Past the vertex — the tangent now tilts uphill; come back."
  };

  it("scrubbing the curve panel moves x on the slider's half-unit lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 222);
    const band = screen.getByTestId("dt-drag");
    // viewBox: PAD=24, usable 272 across x∈[-4,4]; x=1.5 sits at 24 + (5.5/8)*272 = 211
    fireEvent.pointerDown(band, { clientX: 211, clientY: 50 });
    expect(holder.v).toBe(1.5);
    fireEvent.pointerMove(band, { clientX: 100, clientY: 40 }); // raw x ≈ -1.76 → snaps to -2.0
    expect(holder.v).toBe(-2);
  });

  it("keeps the slider as the keyboard path and removes the band when finalized", () => {
    const { holder } = mount(spec);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2.5" } });
    expect(holder.v).toBe(2.5);
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("dt-drag")).toBeNull();
  });
});

describe("dilationExplore vertex drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "dilationExplore",
    prompt: "Dilate the triangle by k = 2.",
    center: [0, 0],
    shape: [
      [2, 0],
      [0, 2],
      [-1, -1]
    ],
    targetK: 2,
    kMin: 0.5,
    kMax: 3,
    kStep: 0.5,
    kStart: 1,
    gridMin: -6,
    gridMax: 6,
    successFeedback: "Every length doubled — that's k = 2 from the center.",
    lowFeedback: "The image is still too small — lengths must double.",
    highFeedback: "Too big — the image should be exactly twice the preimage."
  });

  it("pulling the lead vertex along the ray sets k on the slider lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("dl-drag");
    // grid [-6,6] → pad 12, unit = 276/12 = 23px. shape[0]=(2,0); dragging to
    // math (4.1, 0.2) projects onto the ray to k≈2.05 → snaps to 2.
    // view x = 12 + (4.1+6)*23 = 244.3 ; view y = 12 + (6-0.2)*23 = 145.4
    fireEvent.pointerDown(hit, { clientX: 244.3, clientY: 145.4 });
    expect(holder.v).toEqual({ k: 2 });
  });

  it("clamps at kMax when dragged past the grid's reach", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    fireEvent.pointerDown(screen.getByTestId("dl-drag"), { clientX: 299, clientY: 150 });
    expect(holder.v).toEqual({ k: 3 });
  });
});

describe("transformExplore slide drag", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "transformExplore",
    prompt: "Slide the shape onto the target.",
    shape: [
      [0, 0],
      [2, 0],
      [0, 1]
    ],
    target: [
      [3, 2],
      [5, 2],
      [3, 3]
    ],
    dxMin: -6,
    dxMax: 6,
    dyMin: -6,
    dyMax: 6,
    gridMin: -6,
    gridMax: 6,
    allowReflect: false,
    successFeedback: "Slid (3, 2) — every vertex moved the same amount.",
    offsetFeedback: "Not aligned yet — compare matching corners to read the slide.",
    reflectFeedback: "The orientation is flipped — check whether a reflection is needed."
  });

  // grid [-6,6], pad 12, unit 23. math→view: x = 12+(mx+6)*23, y = 12+(6-my)*23
  const vx = (mx: number) => 12 + (mx + 6) * 23;
  const vy = (my: number) => 12 + (6 - my) * 23;

  it("captures the grab offset on press (no jump), then slides with the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("tf-drag");
    // press inside the shape at math (1, 0.3): the grab itself must not move
    // anything — state stays at the mount initializer (dx 0, dy 0)
    fireEvent.pointerDown(hit, { clientX: vx(1), clientY: vy(0.3) });
    expect(holder.v).toEqual({ dx: 0, dy: 0, reflect: "none" });
    // drag the grab point to (4, 2.3): the shape slides by exactly (3, 2)
    fireEvent.pointerMove(hit, { clientX: vx(4), clientY: vy(2.3) });
    expect(holder.v).toEqual({ dx: 3, dy: 2, reflect: "none" });
    fireEvent.pointerUp(hit, { clientX: vx(4), clientY: vy(2.3) });
  });

  it("clamps the slide to the slider ranges", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("tf-drag");
    fireEvent.pointerDown(hit, { clientX: vx(1), clientY: vy(0.5) });
    fireEvent.pointerMove(hit, { clientX: vx(20), clientY: vy(0.5) }); // way off-grid right
    expect((holder.v as { dx: number }).dx).toBe(6);
  });
});

describe("scatterFit line handles", () => {
  const spec: TWidget = WidgetSpec.parse({
    type: "scatterFit",
    prompt: "Fit the trend.",
    points: [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11]
    ],
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 12,
    mMin: -2,
    mMax: 2,
    mStep: 0.5,
    bMin: -3,
    bMax: 6,
    bStep: 1,
    mStart: 0,
    bStart: 0,
    tolerance: 0.5,
    successFeedback: "The line threads the cloud — residuals nearly vanish.",
    slopeFeedback: "The tilt fights the cloud — the residuals grow toward one end.",
    offsetFeedback: "The tilt is right but the line sits off the cloud — lift it."
  });

  // W=300,H=240,pad=18: y math→view: vy = 18 + (12 - my) * (204/12) = 18 + (12-my)*17
  const vyOf = (my: number) => 18 + (12 - my) * 17;

  it("the sky handle lifts the line: b changes, slope stays", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 240);
    // xA = 1.5; dragging the lift handle to y≈3.1 → b = snap(3.1 - 0*1.5) = 3
    fireEvent.pointerDown(screen.getByTestId("sf-drag-b"), { clientX: 60, clientY: vyOf(3.1) });
    expect(holder.v).toEqual({ m: 0, b: 3 });
  });

  it("the tangerine handle tilts about the lift handle's height", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 240);
    // anchor height at xA=1.5 is 0 (m=0,b=0); xB=8.5. Dragging tilt to y≈7.2:
    // m = snap(7.2/7) = 1 ; b = snap(0 - 1*1.5) = -2 (bStep 1, -1.5 rounds to -2 or -1?)
    // snapToStep(-1.5,…,1): (-1.5-(-3))/1=1.5 → Math.round(1.5)=2 → -3+2=-1
    fireEvent.pointerDown(screen.getByTestId("sf-drag-m"), { clientX: 250, clientY: vyOf(7.2) });
    const v = holder.v as { m: number; b: number };
    expect(v.m).toBe(1);
    expect(v.b).toBe(-1);
  });
});

describe("polarTrace limaçon drag", () => {
  const limacon: TWidget = WidgetSpec.parse({
    type: "polarTrace",
    prompt: "Pull the curve's rightmost point.",
    mode: "limacon",
    start: 1,
    targetA: 2,
    successFeedback: "a = 2 — the inner loop just closed into a cardioid.",
    lowFeedback: "The inner loop is still there — pull the axis point farther out.",
    highFeedback: "Past the cardioid — bring the axis point back in."
  });

  it("dragging the θ=0 point outward sets a on the integer lattice", () => {
    const { holder, container } = mount(limacon);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 250, 250);
    // C=125, MAXR=7, U=107/7≈15.286. a=2 ⇒ r=4 ⇒ x = 125 + 4*15.286 ≈ 186.1
    fireEvent.pointerDown(screen.getByTestId("pt-drag"), { clientX: 186, clientY: 125 });
    expect(holder.v).toBe(2);
  });

  it("rose mode renders no drag surface (petal count is discrete)", () => {
    const rose: TWidget = WidgetSpec.parse({
      type: "polarTrace",
      prompt: "How many petals?",
      mode: "rose",
      start: 2,
      target: 3,
      successFeedback: "n = 3 gives 3 petals — odd n keeps n petals.",
      lowFeedback: "Not enough petals yet — raise n.",
      highFeedback: "Too many petals — lower n."
    });
    mount(rose);
    expect(screen.queryByTestId("pt-drag")).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * WS-C wave 16 (S238) — four K–5 slider-proxy engines join the drag
 * grammar: fractionBar (drag the fill edge), barBuilder (pull the bar),
 * clockSet (turn the hand), hundredthsGrid (sweep the shading).
 * Same contract as the ten lab widgets above: snapped values only,
 * sliders retained as the keyboard-parity path, no hit area when done.
 * ------------------------------------------------------------------ */

describe("fractionBar drag", () => {
  const spec = WidgetSpec.parse({
    type: "fractionBar",
    prompt: "Build 3/4.",
    numStart: 1, denStart: 4, numMin: 1, numMax: 8, denMin: 2, denMax: 12,
    targetNum: 3, targetDen: 4,
    successFeedback: "3 of 4 equal parts — three fourths.",
    lowFeedback: "Not enough parts shaded yet.",
    highFeedback: "Too many parts shaded."
  }) as TWidget;

  it("press at a part boundary shades up to it (numerator on the integer lattice)", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 62);
    // pad=10, usable=280, d=4 ⇒ part width 70; x = 10 + 3*70 = 220 ⇒ n = 3
    fireEvent.pointerDown(screen.getByTestId("fb-drag"), { clientX: 220, clientY: 40 });
    expect(holder.v).toEqual({ n: 3, d: 4 });
  });

  it("drag left of the bar clamps at numMin, never below", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 62);
    fireEvent.pointerDown(screen.getByTestId("fb-drag"), { clientX: 3, clientY: 40 });
    expect(holder.v).toEqual({ n: 1, d: 4 });
  });

  it("the numerator slider remains the keyboard path, and the hit area is gone when disabled", () => {
    const { container } = mount(spec);
    expect(screen.getByRole("slider", { name: "numerator" })).toBeTruthy();
    void container;
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("fb-drag")).toBeNull();
  });

  it("a pinned numerator (numMin === numMax) renders no drag surface, like its missing slider", () => {
    const pinned = WidgetSpec.parse({
      type: "fractionBar",
      prompt: "Cut the bar into more parts.",
      numStart: 1, denStart: 2, numMin: 1, numMax: 1, denMin: 2, denMax: 8,
      targetNum: 1, targetDen: 4,
      successFeedback: "1 of 4 — same one part, smaller share.",
      lowFeedback: "More parts needed.",
      highFeedback: "Fewer parts needed."
    }) as TWidget;
    mount(pinned);
    expect(screen.queryByTestId("fb-drag")).toBeNull();
  });
});

describe("barBuilder drag", () => {
  const spec = WidgetSpec.parse({
    type: "barBuilder",
    prompt: "Build the bars to match the counts.",
    categories: ["cats", "dogs"],
    maxVal: 10, step: 1, target: [4, 7],
    successFeedback: "Both bars match the counts.",
    partialFeedback: "One bar matches — check the other against its count."
  }) as TWidget;

  it("press in a column sets THAT bar to the snapped height at the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 200);
    // padX=30, barW=120: x=90 is category 0. baseY=174, padTop=12: value 4 sits at
    // y = 174 - 0.4*162 = 109.2
    fireEvent.pointerDown(screen.getByTestId("bb-drag"), { clientX: 90, clientY: 109 });
    expect(holder.v).toEqual([4, 0]);
  });

  it("one sweep paints a second category without releasing", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 200);
    const hit = screen.getByTestId("bb-drag");
    fireEvent.pointerDown(hit, { clientX: 90, clientY: 109, pointerId: 1 });
    // move into category 1 at value 7: y = 174 - 0.7*162 = 60.6
    fireEvent.pointerMove(hit, { clientX: 210, clientY: 61, pointerId: 1 });
    expect(holder.v).toEqual([4, 7]);
  });

  it("drag above the ceiling clamps at maxVal; sliders remain; disabled removes the surface", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 200);
    fireEvent.pointerDown(screen.getByTestId("bb-drag"), { clientX: 90, clientY: 5 });
    expect(holder.v).toEqual([10, 0]);
    expect(screen.getByRole("slider", { name: "cats height" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("bb-drag")).toBeNull();
  });

  it("tally display renders no drag surface (steppers are the mark-making action)", () => {
    const tally = WidgetSpec.parse({
      type: "barBuilder",
      prompt: "Tally the pets.",
      categories: ["cats", "dogs"],
      maxVal: 10, step: 1, target: [4, 7], display: "tally",
      successFeedback: "Tallies match the counts.",
      partialFeedback: "One row matches — check the other against its count."
    }) as TWidget;
    mount(tally);
    expect(screen.queryByTestId("bb-drag")).toBeNull();
  });
});

describe("clockSet drag", () => {
  const spec = WidgetSpec.parse({
    type: "clockSet",
    prompt: "Set the clock to 3:30.",
    targetHour: 3, targetMinute: 30, minuteStep: 5,
    successFeedback: "3:30 — the minute hand points straight down.",
    hourFeedback: "Check the hour hand — the short one names the hour.",
    minuteFeedback: "Check the minute hand — the long one counts the minutes."
  }) as TWidget;

  it("a press near the minute hand's reach turns the MINUTE hand, snapped to minuteStep", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 220, 220);
    // start 12:00 — minute tip at (110, 36.4), hour tip at (110, 62.2). Press at 3 o'clock
    // FAR from center (radius ~74 > both tip distances measured from their tips? the minute
    // tip is nearer at the rim) — theta=90° ⇒ minute 15.
    fireEvent.pointerDown(screen.getByTestId("ck-drag"), { clientX: 195, clientY: 110, pointerId: 1 });
    expect(holder.v).toEqual({ hour: 12, minute: 15 });
  });

  it("one gesture keeps steering the SAME hand even when the pointer wanders inward", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 220, 220);
    const hit = screen.getByTestId("ck-drag");
    fireEvent.pointerDown(hit, { clientX: 195, clientY: 110, pointerId: 1 }); // grabs minute
    fireEvent.pointerMove(hit, { clientX: 110, clientY: 160, pointerId: 1 }); // straight down, close in
    expect(holder.v).toEqual({ hour: 12, minute: 30 });
    fireEvent.pointerUp(hit, { clientX: 110, clientY: 160, pointerId: 1 });
  });

  it("a press near the hour hand's tip turns the HOUR hand to a whole hour, minute untouched", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 220, 220);
    // hour tip sits at (110, 62.2) for 12:00 (length 47.8). Press just off that tip toward
    // 1 o'clock at the same short radius: theta=30° ⇒ hour 1.
    fireEvent.pointerDown(screen.getByTestId("ck-drag"), { clientX: 134, clientY: 68.6, pointerId: 1 });
    expect(holder.v).toEqual({ hour: 1, minute: 0 });
  });

  it("sliders remain the keyboard path; the drag surface is gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "hour hand" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "minute hand" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ck-drag")).toBeNull();
  });
});

describe("hundredthsGrid drag", () => {
  const spec = WidgetSpec.parse({
    type: "hundredthsGrid",
    prompt: "Shade 0.34.",
    mode: "hundredths",
    prefilled: 0, start: 0, target: 34, showDecimal: true,
    successFeedback: "34 hundredths — three full columns and four more.",
    lowFeedback: "Not enough hundredths shaded.",
    highFeedback: "Too many hundredths shaded."
  }) as TWidget;

  it("a press keeps the cells' tap semantics: an empty cell pulls the fill through it", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    // pad=6, cw=ch=28.8, column-major. Cell col 3, row 3 = index 33; press ⇒ n = 34.
    fireEvent.pointerDown(screen.getByTestId("hg-drag"), { clientX: 6 + 3 * 28.8 + 14, clientY: 6 + 3 * 28.8 + 14, pointerId: 1 });
    expect(holder.v).toBe(34);
  });

  it("a sweep drags the boundary with the pointer, and back again", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("hg-drag");
    fireEvent.pointerDown(hit, { clientX: 20, clientY: 20, pointerId: 1 }); // cell 0 ⇒ 1
    expect(holder.v).toBe(1);
    fireEvent.pointerMove(hit, { clientX: 6 + 4 * 28.8 + 14, clientY: 290, pointerId: 1 }); // col 4 bottom ⇒ 50
    expect(holder.v).toBe(50);
    fireEvent.pointerMove(hit, { clientX: 20, clientY: 6 + 1 * 28.8 + 14, pointerId: 1 }); // col 0 row 1 ⇒ 2
    expect(holder.v).toBe(2);
    fireEvent.pointerUp(hit, { clientX: 20, clientY: 40, pointerId: 1 });
  });

  it("the sweep never unshades the prefilled cells", () => {
    const locked = WidgetSpec.parse({
      type: "hundredthsGrid",
      prompt: "Add 0.2 more.",
      mode: "hundredths",
      prefilled: 30, start: 30, target: 50, showDecimal: true,
      successFeedback: "50 hundredths in all.",
      lowFeedback: "Not enough added yet.",
      highFeedback: "Too much added."
    }) as TWidget;
    const { holder, container } = mount(locked);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    fireEvent.pointerDown(screen.getByTestId("hg-drag"), { clientX: 20, clientY: 20, pointerId: 1 });
    expect(holder.v).toBe(30);
  });

  it("slider remains; disabled removes the surface", () => {
    mount(spec);
    expect(screen.getByRole("slider")).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("hg-drag")).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * WS-C wave 17 (S238) — batch 2: five more slider-proxy engines.
 * expLogExplore (pull the readout point onto the goal ring), signChart
 * (drag the probe along the axis), probabilityArea (sweep the shading),
 * compassConstruct (open the compass by pulling), triangleConstraintLab
 * (swing the angle arm). Same contract throughout.
 * ------------------------------------------------------------------ */

describe("expLogExplore drag", () => {
  const spec = WidgetSpec.parse({
    type: "expLogExplore",
    prompt: "Find the base whose square is 9.",
    mode: "exponential",
    x: 2, targetBase: 3, startBase: 2,
    successFeedback: "Base 3 — three squared is nine.",
    lowFeedback: "The curve is too shallow — raise the base.",
    highFeedback: "The curve overshoots — lower the base."
  }) as TWidget;

  it("pulling the point to height y solves for the base on the 0.1 lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 210);
    // M = max(x, goal, 4)*1.12 = 9*1.12 = 10.08; W=300,H=210,PAD=30.
    // Pull to y = 9: vy = H-PAD - (9/M)*(H-2*PAD) = 180 - (9/10.08)*150 = 46.07 ⇒ base = 3.
    fireEvent.pointerDown(screen.getByTestId("ele-drag"), { clientX: 150, clientY: 46 });
    expect(holder.v).toBe(3);
  });

  it("a pull below the axis in exponential mode is ignored, never NaN", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 210);
    fireEvent.pointerDown(screen.getByTestId("ele-drag"), { clientX: 150, clientY: 205 });
    expect(holder.v).toBe(2); // the mount-effect start value, untouched
  });

  it("the base slider remains; the surface is gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "choose the base" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ele-drag")).toBeNull();
  });
});

describe("signChart probe drag", () => {
  const spec = WidgetSpec.parse({
    type: "signChart",
    prompt: "Where is P positive?",
    roots: [{ x: -1, mult: 1 }, { x: 3, mult: 1 }],
    leadingPositive: true,
    probeX: true,
    successFeedback: "Positive outside the roots — the parabola opens upward.",
    crossFeedback: "An odd root crosses — the sign flips there.",
    bounceFeedback: "An even root bounces — the sign holds there."
  }) as TWidget;

  it("dragging along the axis moves the probe on the integer lattice", () => {
    const { container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 198);
    // lo=-3, hi=5, W=320, PAD=22: x=2 sits at 22 + (5/8)*276 = 194.5
    fireEvent.pointerDown(screen.getByTestId("sc-probe-drag"), { clientX: 194, clientY: 118 });
    expect(screen.getByTestId("sc-probe-readout").textContent).toContain("P(2)");
  });

  it("the probe dial remains the keyboard path; no surface without probeX or when disabled", () => {
    mount(spec);
    expect(screen.getByTestId("sc-probe-dial")).toBeTruthy();
    cleanup();
    const noProbe = WidgetSpec.parse({
      type: "signChart",
      prompt: "Claim the signs.",
      roots: [{ x: 0, mult: 1 }],
      leadingPositive: true,
      successFeedback: "Signs flip across an odd root — claim matched.",
      crossFeedback: "An odd root crosses — the sign flips there.",
      bounceFeedback: "An even root bounces — the sign holds there."
    }) as TWidget;
    mount(noProbe);
    expect(screen.queryByTestId("sc-probe-drag")).toBeNull();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("sc-probe-drag")).toBeNull();
  });
});

describe("probabilityArea drag", () => {
  const spec = WidgetSpec.parse({
    type: "probabilityArea",
    prompt: "Shade 3/10 of the grid.",
    rows: 2, cols: 5, targetNum: 3, targetDen: 10, start: 0,
    successFeedback: "3 of 10 cells — three tenths.",
    lowFeedback: "Not enough cells shaded.",
    highFeedback: "Too many cells shaded."
  }) as TWidget;

  it("a press shades through the cell under the pointer (row-major from the bottom)", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    // H = 300*rows/cols = 120; pad=6; cw=57.6, ch=54. Bottom row r=0. Cell col 2, bottom row:
    pinRect(svg, 300, 120);
    fireEvent.pointerDown(screen.getByTestId("pa-drag"), { clientX: 6 + 2 * 57.6 + 28, clientY: 90 });
    expect(holder.v).toBe(3);
  });

  it("a sweep to the top row reaches the second row's cells, and back down again", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 120);
    const hit = screen.getByTestId("pa-drag");
    fireEvent.pointerDown(hit, { clientX: 20, clientY: 90, pointerId: 1 });
    expect(holder.v).toBe(1);
    fireEvent.pointerMove(hit, { clientX: 6 + 1 * 57.6 + 28, clientY: 30, pointerId: 1 }); // top row col 1 ⇒ 7
    expect(holder.v).toBe(7);
    fireEvent.pointerUp(hit, { clientX: 20, clientY: 30, pointerId: 1 });
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "cells shaded" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("pa-drag")).toBeNull();
  });
});

describe("compassConstruct drag", () => {
  const perp = WidgetSpec.parse({
    type: "compassConstruct",
    prompt: "Open the compass past half the segment.",
    mode: "perpBisector",
    span: 6, target: 4, start: 2,
    successFeedback: "Radius 4 — the arcs cross above and below.",
    lowFeedback: "Too narrow — the arcs cannot reach each other.",
    highFeedback: "Wider than needed — the crossings just slide along the same line."
  }) as TWidget;

  it("pulling away from center A opens the radius on the integer lattice", () => {
    const { holder, container } = mount(perp);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 210);
    // A = (60, 120), U = 22. A pull to (60 + 4*22, 120) = (148, 120) ⇒ r = 4.
    fireEvent.pointerDown(screen.getByTestId("cmp-drag"), { clientX: 148, clientY: 120 });
    expect(holder.v).toBe(4);
  });

  it("the radius clamps to the 1..12 lattice from any pull", () => {
    const { holder, container } = mount(perp);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 210);
    fireEvent.pointerDown(screen.getByTestId("cmp-drag"), { clientX: 61, clientY: 120 });
    expect(holder.v).toBe(1);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(perp);
    expect(screen.getByRole("slider", { name: "how wide the compass is opened" })).toBeTruthy();
    cleanup();
    mount(perp, true);
    expect(screen.queryByTestId("cmp-drag")).toBeNull();
  });
});

describe("triangleConstraintLab drag", () => {
  const spec = WidgetSpec.parse({
    type: "triangleConstraintLab",
    prompt: "Swing the included angle to 60 degrees under SAS.",
    targetCriterion: "SAS", startCriterion: "SAS",
    sideA: 5, sideB: 8, targetAngle: 60, angleStart: 35, angleStep: 5, requiredMoves: 2,
    successFeedback: "SAS with the 60-degree included angle locks one triangle.",
    criterionFeedback: "Pick the criterion whose givens include the angle BETWEEN the sides.",
    angleFeedback: "Set the included angle to 60 degrees.",
    evidenceFeedback: "Try several criteria and watch whether a second triangle appears."
  }) as TWidget;

  it("a drag steers ray AC about A, snapped to angleStep", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 380, 230);
    // A = (45, 185). Pointer at 60° above the base ray: (45 + 100cos60, 185 − 100sin60) = (95, 98.4)
    fireEvent.pointerDown(screen.getByTestId("tcl-drag"), { clientX: 95, clientY: 98, pointerId: 1 });
    expect((holder.v as { angle: number }).angle).toBe(60);
  });

  it("the swing clamps to the authored 20–140 window", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 380, 230);
    // Nearly straight left, just above the base ray: atan2(5, -40) ≈ 172.9° → clamps to 140.
    fireEvent.pointerDown(screen.getByTestId("tcl-drag"), { clientX: 5, clientY: 180, pointerId: 1 });
    expect((holder.v as { angle: number }).angle).toBe(140);
  });

  it("the angle slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "triangle constraint angle" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("tcl-drag")).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * WS-C S239 — the tail closes. Every remaining slider-proxy engine
 * whose object is spatial joins the drag grammar: 1D positions
 * (percentBar, accumulateArea, slopeField, taylorApprox·radius,
 * verticalLineScanner, covariationScrubber, solidSliceLab), polar and
 * angular objects (spinnerSim, triangleClosureLab, lineRelationLab,
 * rotationLab, circleAngleExplore, elapsedTime), probes (sliceSum,
 * extraneousRootLab), 2D points (distanceGrid, coordinateProofLab,
 * slopeTriangle), handles and edges (boxPlot, fractionGrid,
 * binomialAreaLab), and count sweeps (integerChips, placeValue,
 * fractionOfSet, algebraTiles rows + area cells). Same contract:
 * values pinned, slider parity, no surface when disabled.
 * ------------------------------------------------------------------ */

describe("percentBar drag", () => {
  const spec = WidgetSpec.parse({
    type: "percentBar", whole: 40, targetPercent: 20, percentStep: 5, startPercent: 0, unit: "dollars",
    prompt: "The bill is $40. Shade a 20% tip.",
    successFeedback: "$8 — a fifth of the bill.", lowFeedback: "Under 20%.", highFeedback: "Over 20%."
  }) as TWidget;

  it("a press pulls the fill edge to the percent lattice under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 96);
    // pad=12, barW=296; 20% sits at x = 12 + 0.2*296 = 71.2
    fireEvent.pointerDown(screen.getByTestId("pb-drag"), { clientX: 71, clientY: 44, pointerId: 1 });
    expect(holder.v).toBe(20);
  });

  it("a sweep past the bar end clamps to 100", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 96);
    fireEvent.pointerDown(screen.getByTestId("pb-drag"), { clientX: 316, clientY: 44, pointerId: 1 });
    expect(holder.v).toBe(100);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "percent chosen" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("pb-drag")).toBeNull();
  });
});

describe("accumulateArea drag", () => {
  const spec = WidgetSpec.parse({
    type: "accumulateArea", fn: "line", mode: "area", targetArea: 4, targetX: 0, start: 0,
    prompt: "f(x) = 2x. Drag x until the swept area reaches 4.",
    successFeedback: "x = 2, area 4.", lowFeedback: "Not enough area yet.", highFeedback: "Too far."
  }) as TWidget;

  it("a press pulls the sweep frontier to the 0.25 lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 228);
    // PAD=26, usable 268; x=2 sits at 26 + 0.5*268 = 160
    fireEvent.pointerDown(screen.getByTestId("aa-drag"), { clientX: 160, clientY: 100, pointerId: 1 });
    expect(holder.v).toBe(2);
    fireEvent.pointerMove(screen.getByTestId("aa-drag"), { clientX: 200, clientY: 180, pointerId: 1 }); // raw 2.597 → 2.5
    expect(holder.v).toBe(2.5);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "how far the area has been swept" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("aa-drag")).toBeNull();
  });
});

describe("slopeField drag", () => {
  const spec = WidgetSpec.parse({
    type: "slopeField", equation: "linear", targetY0: 5, startY0: 1,
    prompt: "dy/dx = x. Drag the starting value to y = 5.",
    successFeedback: "Every solution is a vertical shift.", lowFeedback: "Below 5.", highFeedback: "Above 5."
  }) as TWidget;

  it("a press pulls the initial condition to the integer under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 210);
    // PAD=26, H=210: y=5 sits at vy = 184 − (5/8)*158 = 85.25
    fireEvent.pointerDown(screen.getByTestId("sfd-drag"), { clientX: 150, clientY: 85, pointerId: 1 });
    expect(holder.v).toBe(5);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "the initial condition" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("sfd-drag")).toBeNull();
  });
});

describe("taylorApprox drag (radius mode only)", () => {
  const radiusSpec = WidgetSpec.parse({
    type: "taylorApprox", fn: "geometric", mode: "radius", targetXTenths: 10, xStart: 3,
    prompt: "Slide x toward the edge of convergence.",
    successFeedback: "At x = 1 the terms stop shrinking.", lowFeedback: "Not there yet.", highFeedback: "Past it."
  }) as TWidget;
  const termsSpec = WidgetSpec.parse({
    type: "taylorApprox", fn: "exp", mode: "terms", atX: 1, tolerance: 0.01, targetN: 4, nStart: 0,
    prompt: "Add terms until the polynomial hugs e at x = 1.",
    successFeedback: "Four terms past the constant.", lowFeedback: "Not enough terms.", highFeedback: "More than you need."
  }) as TWidget;

  it("dragging the evaluation point snaps to the tenths lattice", () => {
    const { holder, container } = mount(radiusSpec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 160);
    // geometric: XMIN=-1.6, XMAX=1.6, PAD=24, usable 272; x=1.0 sits at 24 + (2.6/3.2)*272 = 245
    fireEvent.pointerDown(screen.getByTestId("ta-drag"), { clientX: 245, clientY: 80, pointerId: 1 });
    expect(holder.v).toBe(10);
  });

  it("terms mode gets NO drag surface — a term count is scalar (survival rule)", () => {
    mount(termsSpec);
    expect(screen.queryByTestId("ta-drag")).toBeNull();
    expect(screen.getByRole("slider", { name: "number of terms" })).toBeTruthy();
  });

  it("radius slider remains; surface gone when disabled", () => {
    mount(radiusSpec);
    expect(screen.getByRole("slider", { name: "the evaluation point, in tenths" })).toBeTruthy();
    cleanup();
    mount(radiusSpec, true);
    expect(screen.queryByTestId("ta-drag")).toBeNull();
  });
});

describe("verticalLineScanner drag", () => {
  const spec = WidgetSpec.parse({
    type: "verticalLineScanner", relation: "circle", targetVerdict: "not-function",
    xMin: -5, xMax: 5, scanStart: -5, scanStep: 0.5, requiredSweeps: 8,
    prompt: "Sweep the vertical line across the circle.",
    successFeedback: "Two crossings — not a function.",
    moreSweepFeedback: "Keep sweeping.", verdictFeedback: "Look at the maximum count."
  }) as TWidget;

  it("a press pulls the scanner to the scanStep lattice and records the hits", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 360, 260);
    // pad=22, usable 316; x=3 sits at 22 + (8/10)*316 = 274.8
    fireEvent.pointerDown(screen.getByTestId("vls-drag"), { clientX: 275, clientY: 100, pointerId: 1 });
    const v = holder.v as { x: number; maxIntersections: number };
    expect(v.x).toBe(3);
    expect(v.maxIntersections).toBe(2); // the circle crosses twice at |x| < 4
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider")).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("vls-drag")).toBeNull();
  });
});

describe("covariationScrubber drag", () => {
  const spec = WidgetSpec.parse({
    type: "covariationScrubber", prompt: "Move x to 4.", a: 2, b: 3,
    inputMin: 0, inputMax: 8, inputStart: 0, targetInput: 4, inputLabel: "x", outputLabel: "y",
    contextTemplate: "At input {x}, the function outputs {y}.",
    successFeedback: "At x = 4, y = 11 everywhere.", lowFeedback: "Increase x.", highFeedback: "Decrease x."
  }) as TWidget;

  it("a press on the graph pulls the shared input to the integer under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = screen.getByTestId("cvs-drag").closest("svg") as SVGSVGElement;
    pinRect(svg, 340, 220);
    // pad=24, G=8, usable 292; x=4 sits at 24 + 0.5*292 = 170
    fireEvent.pointerDown(screen.getByTestId("cvs-drag"), { clientX: 170, clientY: 100, pointerId: 1 });
    expect(holder.v).toBe(4);
    expect(container).toBeTruthy();
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider")).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("cvs-drag")).toBeNull();
  });
});

describe("solidSliceLab drag", () => {
  const spec = WidgetSpec.parse({
    type: "solidSliceLab", prompt: "Stop where the cross-section is greatest.",
    solid: "sphere", radius: 5, height: 10, targetFraction: 0.5, startFraction: 0.1,
    fractionStep: 0.05, tolerance: 0.03, comparisonRequired: false, requiredMoves: 4,
    successFeedback: "The middle slice wins.", positionFeedback: "Not the largest yet.",
    comparisonFeedback: "Add the comparison solid.", invariantFeedback: "Try more heights."
  }) as TWidget;

  it("a press pulls the section plane to the fractionStep height under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 250);
    // y = 205 − fraction*150; fraction 0.5 sits at vy = 130
    fireEvent.pointerDown(screen.getByTestId("ssl-drag"), { clientX: 150, clientY: 130, pointerId: 1 });
    expect((holder.v as { fraction: number }).fraction).toBe(0.5);
    expect((holder.v as { moves: number }).moves).toBe(1);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "section height" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ssl-drag")).toBeNull();
  });
});

describe("spinnerSim drag", () => {
  const spec = WidgetSpec.parse({
    type: "spinnerSim", prompt: "Shade six sectors.", sectors: 12, targetFavourable: 6, favourableStart: 0,
    successFeedback: "Six sectors.", lowFeedback: "Keep going.", highFeedback: "Too many."
  }) as TWidget;

  it("the sector under the pointer pulls the shading boundary through it", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 200, 210);
    // 3 o'clock = 90° from 12 = sector index 3 → 4 shaded
    fireEvent.pointerDown(screen.getByTestId("sps-drag"), { clientX: 190, clientY: 100, pointerId: 1 });
    expect(holder.v).toBe(4);
    // just right of 12 o'clock → exactly 1
    fireEvent.pointerMove(screen.getByTestId("sps-drag"), { clientX: 101, clientY: 20, pointerId: 1 });
    expect(holder.v).toBe(1);
    // just LEFT of 12 o'clock → the whole wheel
    fireEvent.pointerMove(screen.getByTestId("sps-drag"), { clientX: 95, clientY: 20, pointerId: 1 });
    expect(holder.v).toBe(12);
    fireEvent.pointerUp(screen.getByTestId("sps-drag"), { clientX: 95, clientY: 20, pointerId: 1 });
  });

  it("slider remains (zero stays reachable there); surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "winning sectors" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("sps-drag")).toBeNull();
  });
});

describe("triangleClosureLab drag", () => {
  const spec = WidgetSpec.parse({
    type: "triangleClosureLab", prompt: "Will beams of 7, 8, and 12 form a triangle?",
    sides: [7, 8, 12], angleStart: 30, angleStep: 5, requiredMoves: 2,
    choices: [
      { id: "a", label: "Yes", verdict: "forms", feedback: "The shorter pair out-reaches the longest beam." },
      { id: "b", label: "No", verdict: "does-not-form", feedback: "Check the sum: 7 + 8 = 15 > 12." },
      { id: "c", label: "Only as base", verdict: "does-not-form", feedback: "Position doesn't matter — 7 + 8 > 12 either way." }
    ],
    fallbackFeedback: "Compare 7 + 8 with 12.", successFeedback: "The frame closes."
  }) as TWidget;

  it("a drag swings the hinged beam on the angleStep lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 290, 165);
    // hinge at (145, 130); straight up = 90°
    fireEvent.pointerDown(screen.getByTestId("tclo-drag"), { clientX: 145, clientY: 50, pointerId: 1 });
    expect((holder.v as { angle: number }).angle).toBe(90);
  });

  it("a pull below the base clamps at 0", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 290, 165);
    fireEvent.pointerDown(screen.getByTestId("tclo-drag"), { clientX: 250, clientY: 160, pointerId: 1 });
    expect((holder.v as { angle: number }).angle).toBe(0);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "hinge angle" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("tclo-drag")).toBeNull();
  });
});

describe("lineRelationLab drag", () => {
  const spec = WidgetSpec.parse({
    type: "lineRelationLab", targetRelation: "parallel", baseAngle: 0, angleStart: 35, offsetStart: 2,
    angleStep: 5, requiredMoves: 3, prompt: "Turn the blue line parallel to the dark one.",
    successFeedback: "Equal angles force parallel.", angleFeedback: "The angles still differ.",
    distanceFeedback: "Position is not what the converse is about."
  }) as TWidget;

  it("a drag rotates the active line about its own anchor, mod 180", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 360, 220);
    // anchor at angle 35, offset 2: (180 − sin35°*36, 110 + cos35°*36) ≈ (159.4, 139.5); straight above → 90°
    fireEvent.pointerDown(screen.getByTestId("lrl-drag"), { clientX: 159, clientY: 50, pointerId: 1 });
    expect((holder.v as { angle: number }).angle).toBe(90);
    expect((holder.v as { offset: number }).offset).toBe(2); // translation untouched
  });

  it("both sliders remain; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "active line angle" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "active line offset" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("lrl-drag")).toBeNull();
  });
});

describe("rotationLab drag", () => {
  const spec = WidgetSpec.parse({
    type: "rotationLab", mode: "coordinateRule", prompt: "Quarter turn counterclockwise.",
    point: [5, 2], centre: [0, 0], targetAngle: 90, angleStart: 0, angleStep: 90, gridMax: 8,
    successFeedback: "The image is (−2, 5).", lowFeedback: "Not far enough.", highFeedback: "Too far."
  }) as TWidget;

  it("carrying the image around the centre sets the turn on the angleStep lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    // preimage (5,2) is at atan2(2,5) ≈ 21.8°; pointer at ≈111.8° (radius 5) → turn 90.
    // math (−1.86, 4.64) → pixel (150 − 27.9, 150 − 69.6) ≈ (122, 80)
    fireEvent.pointerDown(screen.getByTestId("rl-drag"), { clientX: 122, clientY: 80, pointerId: 1 });
    expect((holder.v as { angle: number }).angle).toBe(90);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "Rotation angle in degrees counterclockwise" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("rl-drag")).toBeNull();
  });
});

describe("circleAngleExplore endpoint drag", () => {
  const central = WidgetSpec.parse({
    type: "circleAngleExplore", mode: "central", targetAngle: 140, startArc: 80,
    prompt: "Open the arc to 140°.",
    successFeedback: "140° of arc, 140° at the centre.", lowFeedback: "Wider.", highFeedback: "Narrower."
  }) as TWidget;
  const inscribed = WidgetSpec.parse({
    type: "circleAngleExplore", mode: "inscribed", targetAngle: 40, startArc: 80,
    prompt: "Make the angle at P read 40°.",
    successFeedback: "Half of 80.", lowFeedback: "Wider.", highFeedback: "Narrower."
  }) as TWidget;
  const cyclic = WidgetSpec.parse({
    type: "circleAngleExplore", mode: "cyclic", targetAngle: 100, startArc: 80,
    prompt: "Opposite angles.",
    successFeedback: "Supplementary.", lowFeedback: "Wider.", highFeedback: "Narrower."
  }) as TWidget;

  it("dragging endpoint A along the rim widens the arc symmetrically", () => {
    const { holder, container } = mount(central);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 220, 200);
    // arc 140 puts A at 20°: (110 + 66cos20°, 96 − 66sin20°) ≈ (172, 73.4)
    fireEvent.pointerDown(screen.getByTestId("ca-drag-a"), { clientX: 172, clientY: 73, pointerId: 1 });
    expect(holder.v).toBe(140);
  });

  it("dragging endpoint B mirrors the same mapping", () => {
    const { holder, container } = mount(central);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 220, 200);
    // arc 100 puts B at 140°: (110 + 66cos140°, 96 − 66sin140°) ≈ (59.4, 53.6)
    fireEvent.pointerDown(screen.getByTestId("ca-drag-b"), { clientX: 59, clientY: 53, pointerId: 1 });
    expect(holder.v).toBe(100);
  });

  it("P slides along the far arc in inscribed mode (its slider's own lattice)", () => {
    const { container } = mount(inscribed);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 220, 200);
    // arc 80 → bDeg 130; pPos 50 → pDeg 270 (the bottom): (110, 162)
    fireEvent.pointerDown(screen.getByTestId("ca-drag-p"), { clientX: 110, clientY: 162, pointerId: 1 });
    expect((screen.getByRole("slider", { name: "where P sits" }) as HTMLInputElement).value).toBe("50");
  });

  it("cyclic mode renders NO P surface (P has no slider there — parity rule)", () => {
    mount(cyclic);
    expect(screen.queryByTestId("ca-drag-p")).toBeNull();
    expect(screen.getByTestId("ca-drag-a")).toBeTruthy();
  });

  it("arc slider remains; surfaces gone when disabled", () => {
    mount(central);
    expect(screen.getByRole("slider", { name: "arc size in degrees" })).toBeTruthy();
    cleanup();
    mount(central, true);
    expect(screen.queryByTestId("ca-drag-a")).toBeNull();
    expect(screen.queryByTestId("ca-drag-b")).toBeNull();
  });
});

describe("sliceSum probe drag", () => {
  const spec = WidgetSpec.parse({
    type: "sliceSum", mode: "areaBetween", tolerance: 0.005, nStart: 2, ruleStart: "left",
    prompt: "Inspect a slice, then raise the count.",
    successFeedback: "Top minus bottom.", lowFeedback: "Under 1/6.", highFeedback: "Over 1/6."
  }) as TWidget;

  it("sweeping the region highlights the slice under the pointer (local, never graded)", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 330, 190);
    // [a,b]=[0,1], n=2: x=0.75 sits at 26 + 0.75*131 ≈ 124 → slice 2
    fireEvent.pointerDown(screen.getByTestId("ssm-drag"), { clientX: 124, clientY: 100, pointerId: 1 });
    expect((screen.getByRole("slider", { name: "which slice to inspect" }) as HTMLInputElement).value).toBe("2");
    expect(holder.v).toEqual({ n: 2, rule: "left" }); // the graded state never moved
  });

  it("both sliders remain; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "number of slices" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ssm-drag")).toBeNull();
  });
});

describe("extraneousRootLab probe drag", () => {
  const spec = WidgetSpec.parse({
    type: "extraneousRootLab", prompt: "Find the candidate that survives.",
    radical: { c: 6, scale: 1 }, line: { m: 1, b: 0 }, probeStart: -4,
    targetPhase: "identifyTrue", trueRoot: 3, phantomRoot: -2, requiredMoves: 2,
    successFeedback: "x = 3 survives.", phantomPickedFeedback: "−2 satisfies only the squared pair.",
    notSquaredFeedback: "Square both sides first.", signRegionFeedback: "The line is negative here.",
    domainConfusionFeedback: "That x is neither candidate."
  }) as TWidget;

  it("dragging carries the probe line to the integer under the pointer, in the gesture's own frame", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 340, 210);
    // lo=−8, hi=5 (max of cands 3, probe −4, −c+6=0, plus 2), usable 288: x=3 sits at 26 + (11/13)*288 ≈ 270
    fireEvent.pointerDown(screen.getByTestId("erl-drag"), { clientX: 270, clientY: 100, pointerId: 1 });
    expect((screen.getByTestId("erl-probe") as HTMLInputElement).value).toBe("3");
    expect((holder.v as { pick: number | null }).pick).toBeNull(); // probing is not picking
    fireEvent.pointerUp(screen.getByTestId("erl-drag"), { clientX: 270, clientY: 100, pointerId: 1 });
  });

  it("probe slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByTestId("erl-probe")).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("erl-drag")).toBeNull();
  });
});

describe("distanceGrid drag", () => {
  const spec = WidgetSpec.parse({
    type: "distanceGrid", prompt: "Move the point to (6, 6).",
    anchor: [2, 3], targetPoint: [6, 6], gridMin: 0, gridMax: 8, startX: 2, startY: 3,
    successFeedback: "√(4² + 3²) = 5.", wrongPointFeedback: "Not at (6, 6) yet."
  }) as TWidget;

  it("a press carries the point to the integer lattice point under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    // pad=16, usable 268: (6,6) sits at (16 + 0.75*268, 300−16 − 0.75*268) = (217, 83)
    fireEvent.pointerDown(screen.getByTestId("dgr-drag"), { clientX: 217, clientY: 83, pointerId: 1 });
    expect(holder.v).toEqual({ x: 6, y: 6 });
  });

  it("a pull past the grid clamps to its edge", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    fireEvent.pointerDown(screen.getByTestId("dgr-drag"), { clientX: 500, clientY: 83, pointerId: 1 });
    expect((holder.v as { x: number }).x).toBe(8);
  });

  it("sliders remain; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "point across" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("dgr-drag")).toBeNull();
  });
});

describe("coordinateProofLab drag", () => {
  const spec = WidgetSpec.parse({
    type: "coordinateProofLab", prompt: "Place D so ABCD is a parallelogram.",
    fixed: [[1, 1], [6, 1], [8, 5]], target: [3, 5], start: [8, 8], targetClaim: "parallelogram",
    gridMin: 0, gridMax: 10, requiredEvidence: ["slopes", "midpoints"], requiredMoves: 4,
    successFeedback: "D = (3, 5).", positionFeedback: "Evidence still disagrees.",
    evidenceFeedback: "Inspect both slopes and midpoints."
  }) as TWidget;

  it("a press carries vertex D to the integer lattice point under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 380, 300);
    // P=30, X pitch 32, Y pitch 24: (3,5) sits at (126, 150)
    fireEvent.pointerDown(screen.getByTestId("cpl-drag"), { clientX: 126, clientY: 150, pointerId: 1 });
    const v = holder.v as { x: number; y: number; moves: number };
    expect([v.x, v.y]).toEqual([3, 5]);
    expect(v.moves).toBe(1);
  });

  it("sliders remain; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "D x-coordinate" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("cpl-drag")).toBeNull();
  });
});

describe("boxPlot handle drag", () => {
  const spec = WidgetSpec.parse({
    type: "boxPlot", prompt: "Set the summary: 78, 82, 85, 88, 92.",
    axisMin: 60, axisMax: 100, targetMin: 78, targetQ1: 82, targetMed: 85, targetQ3: 88, targetMax: 92,
    startMin: 60, startQ1: 70, startMed: 80, startQ3: 90, startMax: 100,
    successFeedback: "A tight box IS consistency.", orderFeedback: "Keep the five in order.",
    valueFeedback: "Not yet 78, 82, 85, 88, 92."
  }) as TWidget;

  it("a press grabs the nearest handle and holds it for the whole gesture", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 130);
    const hit = screen.getByTestId("bpl-drag");
    // pad=22, 276 px per 40 units. Press beside min (60 → x=22)…
    fireEvent.pointerDown(hit, { clientX: 24, clientY: 58, pointerId: 1 });
    // …and pull to 78 (x = 22 + 18/40*276 ≈ 146)
    fireEvent.pointerMove(hit, { clientX: 146, clientY: 58, pointerId: 1 });
    expect((holder.v as { min: number }).min).toBe(78);
    // crossing q1's seat does NOT swap hands: min keeps following, q1 stays put
    fireEvent.pointerMove(hit, { clientX: 200, clientY: 58, pointerId: 1 });
    expect((holder.v as { min: number }).min).toBe(86);
    expect((holder.v as { q1: number }).q1).toBe(70);
    fireEvent.pointerUp(hit, { clientX: 200, clientY: 58, pointerId: 1 });
  });

  it("five sliders remain; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getAllByRole("slider").length).toBe(5);
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("bpl-drag")).toBeNull();
  });
});

describe("fractionGrid shade-edge drag", () => {
  const spec = WidgetSpec.parse({
    type: "fractionGrid", prompt: "1/2 × 1/3.", num1: 1, den1: 2, num2: 1, den2: 3,
    rowFeedback: "Rows carry the first factor.", colFeedback: "Columns carry the 1/3.",
    successFeedback: "1 of 6 is 1/6."
  }) as TWidget;

  it("the row edge drags down on the row lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 240, 240);
    fireEvent.change(screen.getByRole("slider", { name: "row count" }), { target: { value: "2" } });
    const hit = screen.getByTestId("fgr-drag-r");
    fireEvent.pointerDown(hit, { clientX: 120, clientY: 10, pointerId: 1 });
    // rh = 228/2 = 114; vy=130 → raw 1.09 → 1
    fireEvent.pointerMove(hit, { clientX: 120, clientY: 130, pointerId: 1 });
    expect((holder.v as { shadeR: number }).shadeR).toBe(1);
    fireEvent.pointerUp(hit, { clientX: 120, clientY: 130, pointerId: 1 });
  });

  it("the column edge drags right on the column lattice", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 240, 240);
    fireEvent.change(screen.getByRole("slider", { name: "column count" }), { target: { value: "3" } });
    const hit = screen.getByTestId("fgr-drag-c");
    // cw = 228/3 = 76; vx = 6 + 2*76 = 158 → shadeC 2
    fireEvent.pointerDown(hit, { clientX: 158, clientY: 120, pointerId: 1 });
    expect((holder.v as { shadeC: number }).shadeC).toBe(2);
  });

  it("partition sliders remain (survival rule); surfaces gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "row count" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("fgr-drag-r")).toBeNull();
    expect(screen.queryByTestId("fgr-drag-c")).toBeNull();
  });
});

describe("binomialAreaLab strip-edge drag", () => {
  const spec = WidgetSpec.parse({
    type: "binomialAreaLab", requiredMoves: 3, startA: 1, startB: 0,
    prompt: "Build (x + 3)(x + 3).", pX: 1, qX: 1, targetA: 3, targetB: 3, asks: "middle",
    successFeedback: "x² + 6x + 9.", productMiddleFeedback: "The strips were multiplied.",
    partialFeedback: "One partition has arrived.", signFeedback: "Right sizes, wrong direction."
  }) as TWidget;

  it("the across edge drags to the unit lattice, including through the block to negatives", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 340, 250);
    const hit = screen.getByTestId("bal-drag-a");
    // scale=1, U=13, OX=46, xw=52: a=3 puts the edge at 46 + (4+3)*13 = 137
    fireEvent.pointerDown(hit, { clientX: 137, clientY: 60, pointerId: 1 });
    expect((holder.v as { a: number }).a).toBe(3);
    // pulling back through the block: 46 + (4−2)*13 = 72 → a = −2
    fireEvent.pointerMove(hit, { clientX: 72, clientY: 60, pointerId: 1 });
    expect((holder.v as { a: number }).a).toBe(-2);
    fireEvent.pointerUp(hit, { clientX: 72, clientY: 60, pointerId: 1 });
  });

  it("the down edge drags the same way", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 340, 250);
    // OY=30, xh=52: b=3 puts the edge at 30 + 7*13 = 121
    fireEvent.pointerDown(screen.getByTestId("bal-drag-b"), { clientX: 70, clientY: 121, pointerId: 1 });
    expect((holder.v as { b: number }).b).toBe(3);
  });

  it("sliders remain; surfaces gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "across partition" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("bal-drag-a")).toBeNull();
  });
});

describe("integerChips row sweep", () => {
  const spec = WidgetSpec.parse({
    type: "integerChips", target: -7, maxPos: 10, maxNeg: 10, posStart: 0, negStart: 0,
    prompt: "Build −3 + (−4) with chips.",
    successFeedback: "−7 — debts add.", lowFeedback: "Too far negative.", highFeedback: "No positives belong."
  }) as TWidget;

  it("sweeping a band counts chips through the one under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 128);
    // chip pitch 26 from padL 16: third chip's centre is 68
    fireEvent.pointerDown(screen.getByTestId("ic-drag-pos"), { clientX: 68, clientY: 30, pointerId: 1 });
    expect(holder.v).toEqual({ pos: 3, neg: 0 });
    fireEvent.pointerUp(screen.getByTestId("ic-drag-pos"), { clientX: 68, clientY: 30, pointerId: 1 });
    fireEvent.pointerDown(screen.getByTestId("ic-drag-neg"), { clientX: 146, clientY: 88, pointerId: 1 });
    expect(holder.v).toEqual({ pos: 3, neg: 6 });
    fireEvent.pointerUp(screen.getByTestId("ic-drag-neg"), { clientX: 146, clientY: 88, pointerId: 1 });
  });

  it("sweeping left of the first chip reaches zero", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 128);
    const hit = screen.getByTestId("ic-drag-pos");
    fireEvent.pointerDown(hit, { clientX: 68, clientY: 30, pointerId: 1 });
    fireEvent.pointerMove(hit, { clientX: 3, clientY: 30, pointerId: 1 });
    expect(holder.v).toEqual({ pos: 0, neg: 0 });
    fireEvent.pointerUp(hit, { clientX: 3, clientY: 30, pointerId: 1 });
  });

  it("sliders and zero-pair buttons remain; surfaces gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "positive chips" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ic-drag-pos")).toBeNull();
    expect(screen.queryByTestId("ic-drag-neg")).toBeNull();
  });
});

describe("placeValue block sweep", () => {
  const spec = WidgetSpec.parse({
    type: "placeValue", prompt: "Build 156 with blocks.", target: 156,
    maxHundreds: 4, maxTens: 12, maxOnes: 15, hStart: 0, tStart: 0, oStart: 0,
    successFeedback: "156 — 1 hundred, 5 tens, 6 ones.", lowFeedback: "Less than 156.", highFeedback: "More than 156."
  }) as TWidget;

  it("each place's band counts blocks through the one under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 150);
    fireEvent.pointerDown(screen.getByTestId("pv-drag-h"), { clientX: 74, clientY: 30, pointerId: 1 }); // 2nd flat
    expect(holder.v).toEqual({ h: 2, t: 0, o: 0 });
    fireEvent.pointerUp(screen.getByTestId("pv-drag-h"), { clientX: 74, clientY: 30, pointerId: 1 });
    fireEvent.pointerDown(screen.getByTestId("pv-drag-t"), { clientX: 60, clientY: 80, pointerId: 1 }); // 5th rod
    expect(holder.v).toEqual({ h: 2, t: 5, o: 0 });
    fireEvent.pointerUp(screen.getByTestId("pv-drag-t"), { clientX: 60, clientY: 80, pointerId: 1 });
    fireEvent.pointerDown(screen.getByTestId("pv-drag-o"), { clientX: 89, clientY: 116, pointerId: 1 }); // 8th one
    expect(holder.v).toEqual({ h: 2, t: 5, o: 8 });
    fireEvent.pointerUp(screen.getByTestId("pv-drag-o"), { clientX: 89, clientY: 116, pointerId: 1 });
  });

  it("the ones wrap row-major like the drawing", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 150);
    // row 1, col 2 → 13 ones: vx = 8 + 2*11 + 4 = 34, vy = 112 + 11 + 4 = 127
    fireEvent.pointerDown(screen.getByTestId("pv-drag-o"), { clientX: 34, clientY: 127, pointerId: 1 });
    expect((holder.v as { o: number }).o).toBe(13);
  });

  it("sliders remain; surfaces gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "hundreds" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("pv-drag-h")).toBeNull();
  });
});

describe("fractionOfSet sweep", () => {
  const spec = WidgetSpec.parse({
    type: "fractionOfSet", prompt: "Choose 3/4 of the 12 counters.", setSize: 12, num: 3, den: 4, groupsHint: true,
    successFeedback: "9 counters.", lowFeedback: "Not enough yet.", highFeedback: "Too many."
  }) as TWidget;

  it("a press chooses every item up to the one under the pointer, row-major", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 278, 114);
    // cols=6; item 9 (row 1, col 2) sits at (24 + 2*40, 22 + 40) = (104, 62)
    fireEvent.pointerDown(screen.getByTestId("fos-drag"), { clientX: 104, clientY: 62, pointerId: 1 });
    expect(holder.v).toBe(9);
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "how many chosen" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("fos-drag")).toBeNull();
  });
});

describe("algebraTiles row sweep and area cells", () => {
  const classic = WidgetSpec.parse({
    type: "algebraTiles", targetX: 3, targetConst: 2, maxTiles: 8, xStart: 0, constStart: 0,
    prompt: "Build (2x + 3) + (x − 1) with tiles.",
    successFeedback: "3x + 2.", xFeedback: "The x-tiles are wrong.", constFeedback: "The units are off."
  }) as TWidget;
  const area = WidgetSpec.parse({
    type: "algebraTiles", targetX: -3, targetConst: -6, maxTiles: 8, xStart: 0, constStart: 0,
    area: { width: [0, -3], height: [1, 2], mode: "distribute" },
    prompt: "Fill the rectangle for −3(x + 2).",
    successFeedback: "−3x − 6.", xFeedback: "The x-cells are not all covered.", constFeedback: "The unit cells are off."
  }) as TWidget;

  it("sweeping the long-tile row counts tiles through the one under the pointer", () => {
    const { holder, container } = mount(classic);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 130);
    // pitch 25 from x=12: third tile's middle is 72
    fireEvent.pointerDown(screen.getByTestId("at-drag-x"), { clientX: 72, clientY: 40, pointerId: 1 });
    expect((holder.v as { x: number }).x).toBe(3);
    fireEvent.pointerUp(screen.getByTestId("at-drag-x"), { clientX: 72, clientY: 40, pointerId: 1 });
  });

  it("sweeping the unit row does the same on its own pitch, and left of the first tile is zero", () => {
    const { holder, container } = mount(classic);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 130);
    const hit = screen.getByTestId("at-drag-unit");
    // pitch 23 from x=12: second tile's middle is 44
    fireEvent.pointerDown(hit, { clientX: 44, clientY: 85, pointerId: 1 });
    expect((holder.v as { c: number }).c).toBe(2);
    fireEvent.pointerMove(hit, { clientX: 8, clientY: 85, pointerId: 1 });
    expect((holder.v as { c: number }).c).toBe(0);
    fireEvent.pointerUp(hit, { clientX: 8, clientY: 85, pointerId: 1 });
  });

  it("the sweep keeps the pile's current sign — magnitude is the spatial quantity", () => {
    const { holder, container } = mount(classic);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 130);
    fireEvent.change(screen.getByRole("slider", { name: "long tiles" }), { target: { value: "-2" } });
    expect((holder.v as { x: number }).x).toBe(-2);
    fireEvent.pointerDown(screen.getByTestId("at-drag-x"), { clientX: 72, clientY: 40, pointerId: 1 });
    expect((holder.v as { x: number }).x).toBe(-3);
  });

  it("tapping a dashed cell produces its tile WITH the cell's sign; tapping again takes it back", () => {
    const { holder } = mount(area);
    // the distribute rectangle for −3(x+2): 3 negative x-cells and 6 negative unit-cells
    const xCells = screen.getAllByTestId("at-cell-x-neg");
    expect(xCells.length).toBe(3);
    fireEvent.click(xCells[0]);
    expect((holder.v as { x: number }).x).toBe(-1);
    const filled = screen.getAllByTestId("at-cell-x-neg-filled");
    expect(filled.length).toBe(1);
    fireEvent.click(filled[0]);
    expect((holder.v as { x: number }).x).toBe(0);
  });

  it("sliders remain; sweep bands gone when disabled", () => {
    mount(classic);
    expect(screen.getByRole("slider", { name: "long tiles" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "small tiles" })).toBeTruthy();
    cleanup();
    mount(classic, true);
    expect(screen.queryByTestId("at-drag-x")).toBeNull();
    expect(screen.queryByTestId("at-drag-unit")).toBeNull();
  });
});

describe("elapsedTime hand turn", () => {
  const spec = WidgetSpec.parse({
    type: "elapsedTime", prompt: "Set how long the film runs.",
    startHour: 2, startMinute: 15, targetMinutes: 45, minuteStep: 5, maxMinutes: 120, startElapsed: 0,
    successFeedback: "45 minutes.", lowFeedback: "Not enough time.", highFeedback: "Too much time."
  }) as TWidget;

  it("turning the finish hand accumulates elapsed time, wrapping past 12", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 130);
    const hit = screen.getByTestId("et-drag");
    // finish clock centre (238, 62); hand starts at :15. Press at :30 (straight down)
    fireEvent.pointerDown(hit, { clientX: 238, clientY: 112, pointerId: 1 });
    expect(holder.v).toBe(15);
    // sweep on to :45 (9 o'clock side)
    fireEvent.pointerMove(hit, { clientX: 188, clientY: 62, pointerId: 1 });
    expect(holder.v).toBe(30);
    // keep going through :00 — the wrap ADDS, it does not reset
    fireEvent.pointerMove(hit, { clientX: 238, clientY: 12, pointerId: 1 });
    expect(holder.v).toBe(45);
    // wind back a notch to :50
    fireEvent.pointerMove(hit, { clientX: 195, clientY: 37, pointerId: 1 });
    expect(holder.v).toBe(35);
    fireEvent.pointerUp(hit, { clientX: 195, clientY: 37, pointerId: 1 });
  });

  it("slider remains; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "minutes that pass" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("et-drag")).toBeNull();
  });
});

describe("slopeTriangle tip drag", () => {
  const spec = WidgetSpec.parse({
    type: "slopeTriangle", prompt: "Build the slope triangle from A so the line passes through B.",
    ax: 1, ay: 1, bx: 4, by: 7, runStart: 1, riseStart: 0, gridMax: 10, legMax: 9,
    successFeedback: "Slope 2.", fallbackFeedback: "3 across and 6 up."
  }) as TWidget;

  it("carrying the tip sets run and rise together through the model", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 340, 300);
    // tip (4,7): vx = 26 + (14/20)*288 ≈ 228, vy = 274 − (17/20)*248 ≈ 63
    fireEvent.pointerDown(screen.getByTestId("st-drag"), { clientX: 228, clientY: 63, pointerId: 1 });
    expect(holder.v).toEqual({ run: 3, rise: 6 });
    fireEvent.pointerUp(screen.getByTestId("st-drag"), { clientX: 228, clientY: 63, pointerId: 1 });
  });

  it("steppers and sliders remain; surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "Set run (across)" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("st-drag")).toBeNull();
  });
});

// S240: percentBar's flat-fee segment (pr-04b-02/k3's alongside), feasibleRegionExplore, and
// parametricTrace — the three engines added this wave. Same contract as above: a drag lands on
// the SNAPPED value the widget's own math maps to, the slider stays as keyboard parity, and the
// drag surface disappears once the step is disabled.

describe("percentBar flatFee drag", () => {
  const spec = WidgetSpec.parse({
    type: "percentBar", whole: 50, targetPercent: 40, percentStep: 5, startPercent: 0, unit: "dollars",
    flatFee: 5, feeLabel: "flat fee",
    prompt: "A service charges a flat $5 fee plus a percent of the order.",
    successFeedback: "40%.", lowFeedback: "Under 40%.", highFeedback: "Over 40%."
  }) as TWidget;

  it("the fee segment shifts the percent track — a press lands on the lattice point THAT shift implies", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 320, 96);
    // feeW=34 (flatFee>0), trackX=12+34=46, barW=320-24-34=262; 40% sits at 46+0.4*262=150.8.
    // Under the OLD (no-fee) geometry this same clientX would read ~46% (pad=12, barW=296), so
    // landing on 40 here proves the fee segment actually moved the track, not just decoration.
    fireEvent.pointerDown(screen.getByTestId("pb-drag"), { clientX: 151, clientY: 44, pointerId: 1 });
    expect(holder.v).toBe(40);
  });

  it("renders the fee segment and names it in the bar's accessible label", () => {
    mount(spec);
    expect(screen.getByTestId("pb-fee")).toBeTruthy();
    expect(screen.getByRole("img", { name: /flat fee/ })).toBeTruthy();
  });

  it("the fee segment is absent when flatFee is 0 — every pre-S240 percentBar renders byte-identical", () => {
    const noFee = WidgetSpec.parse({ ...spec, flatFee: 0 }) as TWidget;
    mount(noFee);
    expect(screen.queryByTestId("pb-fee")).toBeNull();
  });

  it("slider remains; drag surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "percent chosen" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("pb-drag")).toBeNull();
  });
});

describe("feasibleRegionExplore fence drag", () => {
  // iar-03-01's exact numbers.
  const spec = WidgetSpec.parse({
    type: "feasibleRegionExplore",
    prompt: "Drag the flour limit fence and watch what happens to the corner at (6, 0).",
    slantM: -1, slantB: 6, verticalMin: 2, verticalMax: 6, verticalStep: 1, verticalStart: 6, verticalTarget: 4,
    xMax: 8, yMax: 8, fenceLabel: "flour limit",
    successFeedback: "At x ≤ 4 the corner (6,0) is gone.", lowFeedback: "Still farther out than x = 4.", highFeedback: "Past x = 4."
  }) as TWidget;

  it("a press pulls the fence to the vertical lattice under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    // pad=34, plotW=232; x=4 of [0,8] sits at 34 + (4/8)*232 = 150
    fireEvent.pointerDown(screen.getByTestId("fre-drag"), { clientX: 150, clientY: 150, pointerId: 1 });
    expect(holder.v).toBe(4);
  });

  it("clamps to verticalMin/verticalMax, not to 0 or the plot edge", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    const hit = screen.getByTestId("fre-drag");
    fireEvent.pointerDown(hit, { clientX: 0, clientY: 150, pointerId: 1 }); // far past the left edge
    expect(holder.v).toBe(2); // verticalMin, not 0
    fireEvent.pointerMove(hit, { clientX: 300, clientY: 150, pointerId: 1 }); // far past the right edge
    expect(holder.v).toBe(6); // verticalMax
    fireEvent.pointerUp(hit, { clientX: 300, clientY: 150, pointerId: 1 });
  });

  it("also drags correctly on iar-03-03's non-integer-corner configuration", () => {
    const spec2 = WidgetSpec.parse({
      ...spec,
      slantM: -0.5, slantB: 4, verticalMin: 2, verticalMax: 8, verticalStart: 4, verticalTarget: 5,
      fenceLabel: "dough limit"
    }) as TWidget;
    const { holder, container } = mount(spec2);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300);
    // x=5 of [0,8] sits at 34 + (5/8)*232 = 179
    fireEvent.pointerDown(screen.getByTestId("fre-drag"), { clientX: 179, clientY: 150, pointerId: 1 });
    expect(holder.v).toBe(5);
  });

  it("slider remains; drag surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "flour limit position" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("fre-drag")).toBeNull();
  });
});

describe("parametricTrace point drag — line mode", () => {
  // pp-04-01/i1b's exact numbers.
  const spec = WidgetSpec.parse({
    type: "parametricTrace",
    prompt: "For x = t + 1, y = 2t, drag the point forward and watch which way the arrows point.",
    mode: "line", lineX0: 1, lineYK: 2, tMin: 0, tMax: 3, tStep: 0.1, tStart: 0, targetT: 2, tTolerance: 0.15,
    successFeedback: "At t = 2 the point has reached (3, 4).", lowFeedback: "Not far enough yet.", highFeedback: "Too far."
  }) as TWidget;

  it("a press pulls the traced point to the t-lattice under the pointer", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    // full sweep x in [1,4], padded 18% -> [0.46,4.54]; pad=28, plotW=204.
    // t=2 -> x=3 -> px = 28 + ((3-0.46)/4.08)*204 = 155
    fireEvent.pointerDown(screen.getByTestId("ptr-drag"), { clientX: 155, clientY: 130, pointerId: 1 });
    expect(holder.v).toBe(2);
  });

  it("clamps to tMin/tMax at the ends of the path", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    const hit = screen.getByTestId("ptr-drag");
    fireEvent.pointerDown(hit, { clientX: 0, clientY: 130, pointerId: 1 });
    expect(holder.v).toBe(0);
    fireEvent.pointerMove(hit, { clientX: 260, clientY: 130, pointerId: 1 });
    expect(holder.v).toBe(3);
    fireEvent.pointerUp(hit, { clientX: 260, clientY: 130, pointerId: 1 });
  });

  it("slider remains; drag surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "parameter t" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ptr-drag")).toBeNull();
  });
});

describe("parametricTrace point drag — circle mode", () => {
  // pp-04-01/i2's exact numbers.
  const spec = WidgetSpec.parse({
    type: "parametricTrace",
    prompt: "x = cos t, y = sin t starts at (1, 0). Drag the point forward to t = π/2 and watch which way it turns.",
    mode: "circle", tMin: 0, tMax: 6.283185307179586, tStep: 0.1, tStart: 0, targetT: 1.5707963267948966, tTolerance: 0.15,
    successFeedback: "At t = π/2 the point has swung up to (0, 1).", lowFeedback: "Not far enough yet.", highFeedback: "Too far."
  }) as TWidget;

  it("the press anchors the turn at the current point; dragging around accumulates t continuously, never wrapping backward", () => {
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 260, 260);
    const hit = screen.getByTestId("ptr-drag");
    // full sweep x,y in [-1,1], padded 18% floored at 0.5 -> [-1.5,1.5]; pad=28, plotW=plotH=204.
    // t=0 -> (1,0) -> screen (198,130): the opening press anchors the turn — no jump yet.
    fireEvent.pointerDown(hit, { clientX: 198, clientY: 130, pointerId: 1 });
    expect(holder.v).toBe(0);
    // t=π/2 -> (0,1) -> screen (130,62): a quarter turn forward, landing near the target.
    fireEvent.pointerMove(hit, { clientX: 130, clientY: 62, pointerId: 1 });
    expect(holder.v).toBeCloseTo(1.6, 5);
    // t=π -> (-1,0) -> screen (62,130): ANOTHER quarter turn forward must ADD to 3.1, not
    // wrap back toward 0 the way a naive absolute-angle reading would.
    fireEvent.pointerMove(hit, { clientX: 62, clientY: 130, pointerId: 1 });
    expect(holder.v).toBeCloseTo(3.1, 5);
    fireEvent.pointerUp(hit, { clientX: 62, clientY: 130, pointerId: 1 });
  });

  it("slider remains; drag surface gone when disabled", () => {
    mount(spec);
    expect(screen.getByRole("slider", { name: "parameter t" })).toBeTruthy();
    cleanup();
    mount(spec, true);
    expect(screen.queryByTestId("ptr-drag")).toBeNull();
  });
});
