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
