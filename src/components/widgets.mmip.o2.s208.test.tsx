// @vitest-environment jsdom
//
// lineExplore ON THE REPRESENTATION SYNCHRONIZATION GRAPH — widget level (S208 wave 2a, O2).
//
// The engine and the model are proved in `src/lib/mmip/`. This file proves the WIRING: that the
// four ways into the widget are four `absorb` edits on one canonical line, that the three things
// on screen are derivations of it, that the snap the widget used to perform silently is now
// reported, that undo is the graph's single stack, and that none of it disturbed the classic
// rendering an authored lesson depends on.
//
// INDEPENDENCE. Every expected number here is computed in this file from the widget's own
// published geometry — `gridScales` with W = H = 300, pad = 12 on a ±gridMax grid — or stated by
// hand from the mathematics ("dragging the unit point to y = 5 while b = 3 makes the slope 2").
// Nothing is read back out of `lineFamilyModel`, and the pixel mapping below is written out
// longhand rather than imported, so a change to the model cannot quietly move the goalposts.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { evaluate } from "@/lib/evaluate";
import { LineExploreSpec, type TWidget } from "@/lib/schema";
import {
  answerLeakCheck,
  evaluatorRendererAgreement,
  keyboardParityCheck,
  reducedMotionCheck,
  srStateCheck,
} from "@/lib/mmip/mmipHarness";

afterEach(cleanup);

const SPEC = LineExploreSpec.parse({
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
  interceptFeedback: "The crossing is off — the line must meet the y-axis at 1.",
}) as TWidget;

/* ── the widget's published geometry, written out here rather than imported ───────────────────── */
const G = 6, W = 300, H = 300, PAD = 12;
/** viewBox y for a mathematical y: the grid spans −G..G over H − 2·pad pixels, y increasing up. */
const yPx = (mathY: number) => H - PAD - ((mathY + G) / (2 * G)) * (H - 2 * PAD);
const xPx = (mathX: number) => PAD + ((mathX + G) / (2 * G)) * (W - 2 * PAD);

function pinRect(svg: SVGSVGElement) {
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, x: 0, y: 0, width: W, height: H, right: W, bottom: H, toJSON: () => ({}) }) as DOMRect;
}

function mount(spec: TWidget = SPEC, opts: { disabled?: boolean; tone?: "info" } = {}) {
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
        disabled={opts.disabled ?? false}
        tone={opts.tone}
      />
    );
  }
  const utils = render(<Host />);
  const svg = utils.container.querySelector("svg") as SVGSVGElement;
  pinRect(svg);
  return { holder, svg, ...utils };
}

const lineCoords = (container: HTMLElement) => {
  const el = container.querySelector(".le-line") as SVGLineElement;
  return ["x1", "y1", "x2", "y2"].map((a) => el.getAttribute(a)).join("|");
};
const statusText = () => screen.getByTestId("le-status").textContent ?? "";
// `getByText(/^y = /)` stopped being unique: the widget's math surfaces (SvgLatexSurface /
// MathProse's KaTeX spans) can put more than one "y = …"-shaped node in the document at once,
// so a regex text search over the whole body is no longer a reliable way to find the one live
// readout. `le-equation` is a plain, stable hook on that exact <p> — the same pattern every
// other element in this widget already uses (le-status, le-undo, le-drag-b/m, le-ghost).
const equationText = () => screen.getByTestId("le-equation").textContent ?? "";
const dragTo = (testid: string, mathY: number) => {
  const hit = screen.getByTestId(testid);
  fireEvent.pointerDown(hit, { clientX: 150, clientY: yPx(mathY) });
  return hit;
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════ */

describe("classic rendering discipline", () => {
  it("adds no affordance and no chatter before the learner's first move", () => {
    const { container } = mount();
    expect(screen.queryByTestId("le-undo")).toBeNull();
    expect(statusText()).toBe("");
    expect(container.querySelectorAll("[data-morph-motion]")).toHaveLength(0);
    // The classic readouts, computed here from the authored start values (m = 0, b = 0).
    expect(equationText()).toBe("y = 0x + 0");
    expect(screen.getByLabelText("slope m").getAttribute("aria-valuetext")).toBe("slope 0");
    expect(screen.getByLabelText("intercept b").getAttribute("aria-valuetext")).toBe("intercept 0");
    expect((container.querySelector("svg") as SVGSVGElement).getAttribute("aria-label")).toBe(
      "Graph of y = 0x + 0. Slope 0, y-intercept 0."
    );
    // y = 0 is a flat line across the grid: both ends sit on the axis.
    expect(lineCoords(container)).toBe([xPx(-G), yPx(0), xPx(G), yPx(0)].join("|"));
  });

  it("keeps the rise/run triangle labels reading off the derived slope", () => {
    mount();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "-3" } });
    // run is 1 by construction, so the rise IS the slope — the label is a readout, not a claim.
    expect(screen.getByText("run 1")).toBeTruthy();
    expect(screen.getByText("rise -3")).toBeTruthy();
    expect(equationText()).toBe("y = -3x + 0");
  });

  it("still hides the target line until it is revealed, and prints it nowhere in the widget", () => {
    // A prompt that does not name the answer, so anything found really is the widget talking.
    const quiet = LineExploreSpec.parse({ ...SPEC, prompt: "Build the line the story describes." }) as TWidget;
    mount(quiet);
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "1" } });
    expect(screen.queryByTestId("le-ghost")).toBeNull();
    // The widget's own subtree: "y = 2x + 1" is the answer, "target" is the ghost's own label.
    const widget = screen.getByTestId("le-status").parentElement as HTMLElement;
    const leak = answerLeakCheck(widget, ["y = 2x + 1", "target"]);
    expect(leak.leaked).toEqual([]);
    // FOR THE RECORD, and deliberately not "fixed" here: the player's screen-reader narration
    // OUTSIDE the widget (`describeState.ts`, pinned by `widgets.a11yAudit.s44.test.tsx`) states
    // the target for every manipulative by design. That is a product decision with its own audit,
    // it predates this wiring, and this suite scopes around it rather than silently widening.
    expect(document.body.textContent).toContain("The target is y = 2x + 1.");
  });

  it("draws the revealed ghost from its own canonical line", () => {
    const { container } = mount(SPEC, { tone: "info" });
    expect(screen.getByTestId("le-ghost")).toBeTruthy();
    const ghost = container.querySelector('[data-testid="le-ghost"] line') as SVGLineElement;
    // y = 2x + 1 at the grid edges: (−6, −11) and (6, 13) — both off-grid, and the viewBox clips.
    expect(ghost.getAttribute("x1")).toBe(String(xPx(-G)));
    expect(ghost.getAttribute("y1")).toBe(String(yPx(2 * -G + 1)));
    expect(ghost.getAttribute("x2")).toBe(String(xPx(G)));
    expect(ghost.getAttribute("y2")).toBe(String(yPx(2 * G + 1)));
  });
});

describe("every origin is an edit on one canonical line", () => {
  it("the two drag handles and the two sliders converge on the same state and the same picture", () => {
    // Physically: slide the line to b = 3, then tilt the point above x = 1 up to y = 5, which is a
    // rise of 5 − 3 = 2 over a run of 1.
    const physical = mount();
    dragTo("le-drag-b", 3);
    dragTo("le-drag-m", 5);
    const physicalValue = physical.holder.v;
    const physicalLine = lineCoords(physical.container);
    const physicalEquation = equationText();
    cleanup();

    // Symbolically: the same two numbers, typed.
    const symbolic = mount();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("intercept b"), { target: { value: "3" } });

    expect(physicalValue).toEqual({ m: 2, b: 3 });
    expect(symbolic.holder.v).toEqual(physicalValue);
    expect(equationText()).toBe(physicalEquation);
    expect(lineCoords(symbolic.container)).toBe(physicalLine);
    // …and the picture is the one the mathematics says: y = 2x + 3 at the grid edges.
    expect(physicalLine).toBe([xPx(-G), yPx(2 * -G + 3), xPx(G), yPx(2 * G + 3)].join("|"));
    expect(physicalEquation).toBe("y = 2x + 3");
  });

  it("holds the slope when the intercept handle slides, and the intercept when the unit handle tilts", () => {
    const { holder } = mount();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "3" } });
    dragTo("le-drag-b", -2); // slide: the tilt must survive
    expect(holder.v).toEqual({ m: 3, b: -2 });
    dragTo("le-drag-m", 2); // tilt about (0, −2): rise 2 − (−2) = 4
    expect(holder.v).toEqual({ m: 4, b: -2 });
  });
});

describe("the declared clamp policy is reported, not silent", () => {
  it("says what it snapped a drag to", () => {
    mount();
    dragTo("le-drag-b", 3.4);
    expect(screen.getByTestId("le-status").textContent).toContain("snapped to 3");
    expect(screen.getByLabelText("intercept b").getAttribute("aria-valuetext")).toBe("intercept 3");
  });

  it("says what it clamped a drag to at the end of the authored range", () => {
    const { holder } = mount();
    dragTo("le-drag-b", -9); // below interceptMin = −5
    expect(holder.v).toEqual({ m: 0, b: -5 });
    expect(statusText()).toContain("clamped");
    expect(statusText()).toContain("-5");
  });

  it("routes the sentence to a live region a screen reader reaches", () => {
    mount();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "2" } });
    // Stated by hand: the rate went from 0 to 2, which is an increase of 2.
    const sr = srStateCheck(screen.getByTestId("le-status").closest("div") as HTMLElement, {
      expectedSubstrings: ["0 becomes 2"],
      liveRegionSelector: '[data-testid="le-status"]',
    });
    expect(sr.missing).toEqual([]);
  });
});

describe("undo belongs to the graph", () => {
  it("appears only once there is a move to step back from, and steps back exactly", () => {
    const { holder } = mount();
    expect(screen.queryByTestId("le-undo")).toBeNull();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("intercept b"), { target: { value: "4" } });
    expect(holder.v).toEqual({ m: 3, b: 4 });

    fireEvent.click(screen.getByTestId("le-undo"));
    expect(holder.v).toEqual({ m: 3, b: 0 });
    fireEvent.click(screen.getByTestId("le-undo"));
    expect(holder.v).toEqual({ m: 0, b: 0 });
    // The stack is empty, so the affordance goes away again — there is no second stack to disagree.
    expect(screen.queryByTestId("le-undo")).toBeNull();
  });

  it("treats one drag as one step back, however many samples it took", () => {
    const { holder } = mount();
    const hit = dragTo("le-drag-b", 1);
    for (const y of [2, 3, 4, 5]) fireEvent.pointerMove(hit, { clientX: 150, clientY: yPx(y) });
    expect(holder.v).toEqual({ m: 0, b: 5 });
    fireEvent.pointerUp(hit, { clientX: 150, clientY: yPx(5) });
    fireEvent.click(screen.getByTestId("le-undo"));
    expect(holder.v).toEqual({ m: 0, b: 0 });
    expect(screen.queryByTestId("le-undo")).toBeNull();
  });

  it("keeps two separate presses as two steps", () => {
    const { holder } = mount();
    const first = dragTo("le-drag-b", 2);
    fireEvent.pointerUp(first, { clientX: 150, clientY: yPx(2) });
    dragTo("le-drag-b", 5);
    expect(holder.v).toEqual({ m: 0, b: 5 });
    fireEvent.click(screen.getByTestId("le-undo"));
    expect(holder.v).toEqual({ m: 0, b: 2 });
    fireEvent.click(screen.getByTestId("le-undo"));
    expect(holder.v).toEqual({ m: 0, b: 0 });
  });

  it("drops the stack when the host hands the widget a different problem", () => {
    // A controlled widget whose parent replaces the value is looking at a different position; the
    // moves on the stack belonged to a position that no longer exists.
    function Host({ v }: { v: { m: number; b: number } }) {
      return <WidgetRenderer spec={SPEC} value={v} onChange={() => {}} disabled={false} />;
    }
    const { rerender } = render(<Host v={{ m: 1, b: 1 }} />);
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "3" } });
    rerender(<Host v={{ m: -2, b: 4 }} />);
    expect(equationText()).toBe("y = -2x + 4");
    expect(screen.queryByTestId("le-undo")).toBeNull();
  });
});

describe("motion describes the mathematics", () => {
  it("animates the representation the edit acted on, by the operation's own verb", () => {
    const { container } = mount();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "3" } });
    // Tripling a rate is a BRANCH (a factor reaching the term), by hand from mmipTypes §3.
    const tilted = Array.from(container.querySelectorAll('[data-morph-actor~="slope:line"]'));
    expect(tilted.length).toBeGreaterThan(0);
    for (const el of tilted) expect(el.getAttribute("data-morph-motion")).toBe("branch");
    // The intercept did not move, so nothing that is only the intercept's animates.
    const slid = container.querySelector('[data-morph-actor="intercept:line"]') as Element;
    expect(slid.getAttribute("data-morph-motion")).toBeNull();
  });

  it("keeps the whole transformation legible with motion suppressed", () => {
    reducedMotionCheck({
      render: () => {
        const { container } = mount();
        fireEvent.change(screen.getByLabelText("intercept b"), { target: { value: "-4" } });
        return container;
      },
      assertMeaningful: (container) => {
        // No travel at all …
        expect(container.querySelectorAll("[data-morph-motion]")).toHaveLength(0);
        // … and the words carry the whole change: down by 4, from 0 to −4, stated by hand.
        const said = (container.querySelector('[data-testid="le-status"]') as Element).textContent ?? "";
        expect(said).toContain("Slide the line down by 4");
        expect(said).toContain("0 to -4");
        // The state itself is still on screen, not only in the animation.
        expect(container.querySelector(".le-line")?.getAttribute("y1")).toBe(String(yPx(-4)));
      },
    });
  });
});

describe("keyboard parity and grader agreement", () => {
  it("gives every affordance a keyboard path", () => {
    const { container } = mount();
    fireEvent.change(screen.getByLabelText("slope m"), { target: { value: "2" } });
    const parity = keyboardParityCheck(container, {
      pointerSelectors: { sliders: 'input[type="range"]', undo: '[data-testid="le-undo"]' },
    });
    expect(parity.failures).toEqual([]);
    expect(parity.checked).toBe(3);
    // The drag handles are the REDUNDANT path and say so: presentation only, never the sole route.
    for (const id of ["le-drag-b", "le-drag-m"]) {
      expect(screen.getByTestId(id).getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("removes the pointer surface, the undo and the chatter when the step is finalized", () => {
    mount(SPEC, { disabled: true });
    expect(screen.queryByTestId("le-drag-b")).toBeNull();
    expect(screen.queryByTestId("le-drag-m")).toBeNull();
    expect(screen.queryByTestId("le-undo")).toBeNull();
    expect((screen.getByLabelText("slope m") as HTMLInputElement).disabled).toBe(true);
  });

  it("never lets the picture and the grader tell two different stories", () => {
    // The rendered equation is the picture's claim; `evaluate` is the grader's. They must agree
    // about whether this state is the authored target, at every one of these positions.
    const rendered = (spec: TWidget, state: { m: number; b: number }) => {
      cleanup();
      mount(spec);
      fireEvent.change(screen.getByLabelText("slope m"), { target: { value: String(state.m) } });
      fireEvent.change(screen.getByLabelText("intercept b"), { target: { value: String(state.b) } });
      return equationText();
    };
    // Written out by hand: "y = 2x + 1" is the only reading that is the target.
    const targetReading = "y = 2x + 1";
    const result = evaluatorRendererAgreement(
      [
        { spec: SPEC, state: { m: 2, b: 1 }, label: "on target" },
        { spec: SPEC, state: { m: 2, b: -1 }, label: "intercept wrong" },
        { spec: SPEC, state: { m: -2, b: 1 }, label: "slope wrong" },
        { spec: SPEC, state: { m: 1, b: 2 }, label: "m and b swapped" },
      ],
      (spec, state) => evaluate(spec, state).correct,
      rendered,
      (truth, text) => truth === (text === targetReading)
    );
    expect(result.failures).toEqual([]);
  });
});
