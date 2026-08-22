// @vitest-environment jsdom
/**
 * S331 — CL-P1-011: the three mobile=1 engines' touch-alternative controls.
 *
 * The registry census scored `systemsExplore`, `matrixTransform`, and `compassConstruct` mobile=1:
 * "the primary interaction is fine-motor pointer dragging on an SVG canvas with no large discrete
 * alternative" (docs/CAPABILITY_AXES.md §mobile). What each one actually needed, read from source:
 *
 *   · systemsExplore  — the answer POINT was reachable only by the SVG drag or two CONTINUOUS
 *                       range sliders. S331 added the house −/range/+ stepper row (44px buttons)
 *                       for both coordinates, walking the same integer lattice the drag snaps to.
 *   · compassConstruct — perp/hex modes had a whole-canvas compass drag plus one continuous range;
 *                       the classical modes had the range as their ONLY control. S331 added
 *                       open/close stepper buttons walking the drag's own 1..12 snap lattice, in
 *                       BOTH renderers.
 *   · matrixTransform — the census was STALE: this engine has no drag surface at all, and its only
 *                       interaction has been four 44px MatrixStepper button pairs since S46. No
 *                       code change; the fact is pinned here so the score cannot drift again.
 *
 * The contract proved below, per engine: the discrete tap controls reach EVERY state the drag can
 * reach (the drags snap — `snapToStep(…, step 1)` — so their codomain is exactly the integer
 * lattice the buttons walk, and the bounds tests show the buttons cover it end to end); the
 * evaluator sees the same values either path produces (no grading logic changed); and the
 * aria-live readouts announce the stepped state just as they announce the dragged one.
 *
 * Events are real DOM events, following session248.engineReversiblePlay.test.tsx; the drag press
 * pins the SVG bounding rect to its viewBox (client px == viewBox units), following
 * widgets.drag.test.tsx.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";
import { SAMPLES } from "./widgetSamples";

const specOf = (type: TWidget["type"]): TWidget => {
  const raw = (SAMPLES as Array<{ type?: TWidget["type"] }>).find((sample) => sample.type === type);
  if (!raw) throw new Error(`No canonical sample for ${type}`);
  return WidgetSpec.parse(raw);
};

function Host({ spec, holder }: { spec: TWidget; holder: { value: unknown } }) {
  const [value, setValue] = useState<unknown>(null);
  holder.value = value;
  return (
    <WidgetRenderer
      spec={spec}
      value={value}
      onChange={(next) => {
        holder.value = next;
        setValue(next);
      }}
      disabled={false}
      seed="s331-touch-alternatives"
    />
  );
}

const mount = (spec: TWidget) => {
  const holder: { value: unknown } = { value: null };
  const utils = render(<Host spec={spec} holder={holder} />);
  return { holder, ...utils };
};

const pinRect = (svg: SVGSVGElement, w: number, h: number) => {
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, x: 0, y: 0, width: w, height: h, right: w, bottom: h, toJSON: () => ({}) }) as DOMRect;
};

const button = (name: string) => screen.getByRole("button", { name }) as HTMLButtonElement;

/** Tap a stepper until it refuses (bounds), with a hard cap so a broken clamp cannot loop. */
const tapUntilDisabled = (name: string, cap = 30) => {
  for (let i = 0; i < cap && !button(name).disabled; i++) fireEvent.click(button(name));
  expect(button(name).disabled, `${name} must disable at its bound`).toBe(true);
};

afterEach(cleanup);

describe("S331 systemsExplore — the point steppers reach every lattice state the drag can", () => {
  it("solves the system by taps alone, and the live readout announces the stepped state", () => {
    const spec = specOf("systemsExplore");
    const { holder, container } = mount(spec); // sample starts at (0, 0); the crossing is (2, 3)
    fireEvent.click(button("Increase point x"));
    fireEvent.click(button("Increase point x"));
    for (let i = 0; i < 3; i++) fireEvent.click(button("Increase point y"));
    expect(holder.value).toEqual({ x: 2, y: 3 });
    expect(evaluate(spec, holder.value).correct).toBe(true);
    // SR parity: the same aria-live readout the drag feeds announces the stepped state.
    const live = Array.from(container.querySelectorAll('[aria-live="polite"]'))
      .map((el) => el.textContent ?? "")
      .join(" | ");
    expect(live).toMatch(/\(2, 3\)/);
    expect(live).toContain("✓ line 1");
    expect(live).toContain("✓ line 2");
  });

  it("covers the drag's whole snapped domain: both axes walk to both bounds and disable there", () => {
    // The drag snaps to the integer lattice inside [xMin,xMax]×[yMin,yMax] (`snapToStep(…, 1)`),
    // so bound-to-bound button walks at step 1 cover its entire codomain.
    const spec = specOf("systemsExplore");
    const { holder } = mount(spec);
    tapUntilDisabled("Increase point x");
    tapUntilDisabled("Increase point y");
    expect(holder.value).toEqual({ x: 6, y: 7 }); // the sample's xMax/yMax corner
    tapUntilDisabled("Decrease point x");
    tapUntilDisabled("Decrease point y");
    expect(holder.value).toEqual({ x: 0, y: 0 }); // and back to the xMin/yMin corner
  });

  it("steps onward from a state the drag created — one gesture's result, finished by taps", () => {
    const spec = specOf("systemsExplore");
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 300); // viewBox 0 0 300 300 — client px == viewBox units
    // pad=14: (4, 5) sits at px = 14 + (4/6)·272 ≈ 195, py = 286 − (5/7)·272 ≈ 92.
    fireEvent.pointerDown(screen.getByTestId("se-drag"), { clientX: 195, clientY: 92 });
    expect(holder.value).toEqual({ x: 4, y: 5 });
    for (let i = 0; i < 2; i++) fireEvent.click(button("Decrease point x"));
    for (let i = 0; i < 2; i++) fireEvent.click(button("Decrease point y"));
    expect(holder.value).toEqual({ x: 2, y: 3 });
    expect(evaluate(spec, holder.value).correct).toBe(true);
  });
});

describe("S331 compassConstruct — open/close steppers walk the drag's 1..12 snap lattice", () => {
  it("perpBisector: solves by taps alone, and the live status announces the crossing", () => {
    const spec = specOf("compassConstruct"); // perpBisector, span 8, start 2, target 5
    const { holder } = mount(spec);
    for (let i = 0; i < 3; i++) fireEvent.click(button("Open the compass by 1"));
    expect(holder.value).toBe(5);
    expect(evaluate(spec, holder.value).correct).toBe(true);
    expect(screen.getByText(/the arcs cross/)).toBeTruthy();
    // …and back off it: the taps are reversible, same as the drag.
    fireEvent.click(button("Close the compass by 1"));
    expect(holder.value).toBe(4);
    const verdict = evaluate(spec, holder.value);
    expect(verdict.correct).toBe(false);
    expect(verdict.feedback).toBe((spec as { lowFeedback: string }).lowFeedback);
  });

  it("perpBisector: covers the drag's whole codomain — taps reach both ends of 1..12", () => {
    // The canvas drag snaps its radius to `snapToStep(raw, 1, 12, 1)`; the buttons walk that
    // exact lattice, so bound-to-bound coverage IS full drag-state coverage.
    const { holder } = mount(specOf("compassConstruct"));
    tapUntilDisabled("Open the compass by 1");
    expect(holder.value).toBe(12);
    tapUntilDisabled("Close the compass by 1");
    expect(holder.value).toBe(1);
  });

  it("perpBisector: finishes by taps from a state the compass-arm drag created", () => {
    const spec = specOf("compassConstruct");
    const { holder, container } = mount(spec);
    const svg = container.querySelector("svg") as SVGSVGElement;
    pinRect(svg, 300, 210); // viewBox 0 0 300 210
    // Center A at (60, 120), U = 22: a press at (60 + 7·22, 120) = (214, 120) is radius 7.
    fireEvent.pointerDown(screen.getByTestId("cmp-drag"), { clientX: 214, clientY: 120 });
    expect(holder.value).toBe(7);
    fireEvent.click(button("Close the compass by 1"));
    fireEvent.click(button("Close the compass by 1"));
    expect(holder.value).toBe(5);
    expect(evaluate(spec, holder.value).correct).toBe(true);
  });

  it("classical modes: the steppers exist there too — the range is no longer the only control", () => {
    const spec = WidgetSpec.parse({
      type: "compassConstruct", prompt: "p", mode: "angleBisector", span: 6, target: 5, start: 2,
      successFeedback: "The crossings are the same distance from each arm, so the ray through them splits the angle exactly in half.",
      lowFeedback: "Too narrow — the arcs cannot reach each other yet.",
      highFeedback: "Wider than it needs to be — the crossings have drifted off the useful part of the arms."
    }) as TWidget;
    const { holder } = mount(spec);
    for (let i = 0; i < 3; i++) fireEvent.click(button("Open the compass by 1"));
    expect(holder.value).toBe(5);
    expect(evaluate(spec, holder.value).correct).toBe(true);
    expect(screen.getByText(/the arcs cross/)).toBeTruthy();
    tapUntilDisabled("Open the compass by 1");
    expect(holder.value).toBe(12);
    tapUntilDisabled("Close the compass by 1");
    expect(holder.value).toBe(1);
  });
});

describe("S331 matrixTransform — no drag exists; the button surface already IS the interaction", () => {
  it("renders no pointer drag surface, and its 44px steppers alone reach the target", () => {
    const spec = specOf("matrixTransform");
    const { holder, container } = mount(spec);
    // The mobile=1 census claim was stale: there is no drag hit area anywhere in this engine.
    expect(container.querySelector(".mt-drag-hit")).toBeNull();
    expect(container.querySelector("[data-testid$='-drag']")).toBeNull();
    // Identity → rotation 90° CCW, entirely by the min-h-11/min-w-11 stepper buttons.
    fireEvent.click(button("Lower the x-part of the first column"));  // a: 1 → 0
    fireEvent.click(button("Raise the y-part of the first column"));  // c: 0 → 1
    fireEvent.click(button("Lower the x-part of the second column")); // b: 0 → −1
    fireEvent.click(button("Lower the y-part of the second column")); // d: 1 → 0
    expect(evaluate(spec, holder.value).correct).toBe(true);
  });
});
