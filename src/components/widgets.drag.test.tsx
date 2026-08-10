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
