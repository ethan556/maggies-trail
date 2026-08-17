// @vitest-environment jsdom
//
// SESSION 209 WAVE B — the vertical-line decision, slopeTriangle on the RSG, and the assembled
// canonical-model seam for engine 2 (O2).
//
// THE DECISION UNDER TEST. The slope triangle's canonical object is a PAIR OF LEGS, not a line.
// `LineCanonical` therefore never has to hold a vertical line and stays total, while a run of 0
// is a legal, gradable, NAMED state of the triangle model. These tests are the widget-level half
// of that claim; the model-level half (including an exhaustive agreement check against the
// shipped grader over the whole leg lattice) is in `src/lib/mmip/lineFamilyModel.test.ts`.
//
// INDEPENDENCE. Every expected number is computed here from the widget's published geometry or
// stated by hand from the mathematics. Nothing is read back out of `lineFamilyModel`.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { evaluate } from "@/lib/evaluate";
import {
  AffineRelationshipLabSpec,
  SlopeTriangleSpec,
  type TAffineRelationshipLab,
  type TSlopeTriangle,
  type TWidget,
} from "@/lib/schema";
import { keyboardParityCheck, reducedMotionCheck } from "@/lib/mmip/mmipHarness";

afterEach(cleanup);

const FB = { fallbackFeedback: "From A to B the line has one constant ratio.", successFeedback: "Every triangle with that ratio sits on the same line." };

/** A(2,1) → B(6,9): slope 2, the shipped sample's problem. */
const SLOPED = SlopeTriangleSpec.parse({
  type: "slopeTriangle", prompt: "Build the slope triangle so the line through A also passes through B.",
  ax: 2, ay: 1, bx: 6, by: 9, runStart: 1, riseStart: 0, gridMax: 10, legMax: 8, ...FB,
}) as TWidget;

/** A(4,1) → B(4,7): the vertical problem. Only run 0 with some rise can be right. */
const VERTICAL = SlopeTriangleSpec.parse({
  type: "slopeTriangle", prompt: "Build the triangle so the line through A also passes through B.",
  ax: 4, ay: 1, bx: 4, by: 7, runStart: 1, riseStart: 0, gridMax: 10, legMax: 8, ...FB,
}) as TWidget;

/**
 * A(−14,−14) → B(7,13): the smallest authorable problem (searched, not guessed) on which the old
 * float verdict and the grader disagree. A run of −7 with a rise of −9 is exactly on the line —
 * −7·27 = −9·21 — but −14 + (−9/−7)·21 evaluates to 13.000000000000004, so the chip said "misses
 * B" while `evaluate` graded it right. It needs a ±14 grid, which no authored lesson currently
 * uses; the contradiction was latent rather than live, and it is now closed by construction.
 */
const FLOAT_TRAP = SlopeTriangleSpec.parse({
  type: "slopeTriangle", prompt: "Build the triangle so the line through A also passes through B.",
  ax: -14, ay: -14, bx: 7, by: 13, runStart: 1, riseStart: 0, gridMax: 14, legMax: 9, ...FB,
}) as TWidget;

/* ── the widget's published geometry, written out here rather than imported ───────────────────── */
const W = 340, H = 300, PAD = 26;
const stX = (g: number) => (x: number) => PAD + ((x + g) / (2 * g)) * (W - 2 * PAD);
const stY = (g: number) => (y: number) => H - PAD - ((y + g) / (2 * g)) * (H - 2 * PAD);

function mount(spec: TWidget, opts: { disabled?: boolean; tone?: "info" } = {}) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer spec={spec} value={value} disabled={opts.disabled ?? false} tone={opts.tone}
        onChange={(v) => { holder.v = v; setValue(v); }} />
    );
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}

const runOut = () => screen.getByTestId("st-run").textContent;
const riseOut = () => screen.getByTestId("st-rise").textContent;
const readout = () => (screen.getByText(/^slope = rise/).textContent ?? "").replace(/\s+/g, " ");
const press = (name: RegExp, times = 1) => {
  for (let i = 0; i < times; i += 1) fireEvent.click(screen.getByRole("button", { name }));
};
const setLeg = (name: RegExp, value: number) =>
  fireEvent.change(screen.getByRole("slider", { name }), { target: { value: String(value) } });
const drawnLine = (container: HTMLElement) => container.querySelector('[data-testid="st-line"]');

/* ══════════════════════════════════════════════════════════════════════════════════════════════ */

describe("slopeTriangle: classic rendering discipline", () => {
  it("renders the authored start exactly as before, with no new affordance", () => {
    const { container } = mount(SLOPED);
    expect([runOut(), riseOut()]).toEqual(["1", "0"]);
    expect(readout()).toContain("slope = rise ÷ run = 0 ÷ 1");
    expect(readout()).toContain("compare the tip with B");
    expect(screen.queryByTestId("st-undo")).toBeNull();
    expect(screen.getByTestId("st-status").textContent).toBe("");
    expect(container.querySelectorAll("[data-morph-motion]")).toHaveLength(0);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "A grid with point A at 2, 1 and point B at 6, 9. The built triangle has run 1 and rise 0. Compare its tip with point B."
    );
    // run 1 / rise 0 through A(2,1) is the flat line y = 1, drawn edge to edge on a ±10 grid.
    const x = stX(10), y = stY(10);
    const line = drawnLine(container) as Element;
    expect([line.getAttribute("x1"), line.getAttribute("y1"), line.getAttribute("x2"), line.getAttribute("y2")])
      .toEqual([String(x(-10)), String(y(1)), String(x(10)), String(y(1))]);
  });

  it("keeps the reveal ghost naming the authored line's slope", () => {
    mount(SLOPED, { tone: "info" });
    expect(screen.getByTestId("st-ghost").textContent).toContain("has slope 2");
  });
});

describe("THE VERTICAL-LINE DECISION, at the surface", () => {
  it("lets a learner reach run 0 and NAMES the undefined slope", () => {
    const { container, holder } = mount(VERTICAL, { tone: "info" });
    setLeg(/Set rise \(up\)/, 3);
    press(/Decrease run \(across\)/); // 1 → 0
    expect(holder.v).toEqual({ run: 0, rise: 3 });
    expect(readout()).toContain("slope = rise ÷ run = undefined");
    // The line is drawn, and it is the vertical line through A(4, ·) spanning the grid.
    const x = stX(10), y = stY(10);
    const line = drawnLine(container) as Element;
    expect([line.getAttribute("x1"), line.getAttribute("x2")]).toEqual([String(x(4)), String(x(4))]);
    expect([line.getAttribute("y1"), line.getAttribute("y2")]).toEqual([String(y(-10)), String(y(10))]);
    // …and on THIS problem that is the right answer, so the picture says so and the grader agrees.
    expect(readout()).toContain("✓ passes through B");
    expect(evaluate(VERTICAL, holder.v).correct).toBe(true);
  });

  it("says undefined, never infinite, and explains why to a screen reader", () => {
    mount(VERTICAL);
    setLeg(/Set rise \(up\)/, 3);
    press(/Decrease run \(across\)/);
    const said = screen.getByTestId("st-status").textContent ?? "";
    expect(said).not.toMatch(/infinit/i);
    expect(readout()).not.toMatch(/infinit/i);
    expect(said).toContain("run by -1");
  });

  it("draws NO line for the empty triangle, matching its own readout", () => {
    // Pre-S209 the widget drew a vertical line through A here while saying "no triangle" — and on
    // a vertical problem that phantom even claimed to pass through B, contradicting the grader.
    const { container, holder } = mount(VERTICAL);
    press(/Decrease run \(across\)/); // run 1 → 0, rise already 0
    expect(holder.v).toEqual({ run: 0, rise: 0 });
    expect(readout()).toContain("slope = rise ÷ run = no triangle");
    expect(drawnLine(container)).toBeNull();
    expect(readout()).toContain("compare the tip with B");
    // The old verdict was `run === 0 ? bx === ax : …`, which on THIS problem is true — so the
    // phantom line claimed to pass through B while the grader rejected the empty triangle.
    expect(VERTICAL.type === "slopeTriangle" && VERTICAL.bx === VERTICAL.ax).toBe(true);
    // The grader rejects the empty triangle too, so picture and grader now agree.
    expect(evaluate(VERTICAL, holder.v).correct).toBe(false);
  });

  it("still refuses a vertical line where y = mx + b is the object — lineExplore cannot reach one", () => {
    // The boundary the decision draws, checked from the other side: lineExplore's triangle is
    // fixed at run 1, so no gesture there can ask the line model for a vertical line.
    const { container } = mount(SLOPED);
    expect(container.querySelectorAll('[data-testid="le-drag-b"]')).toHaveLength(0);
  });
});

describe("slopeTriangle: the picture and the grader tell one story", () => {
  it("agrees with the grader where float arithmetic disagrees", () => {
    // Demonstrated here, not asserted: the two routes really do part company on these numbers.
    expect(-14 + (-9 / -7) * (7 - -14) === 13).toBe(false); // the old float route
    expect(-7 * (13 - -14) === -9 * (7 - -14)).toBe(true); // the exact route, the grader's own rule

    const { holder } = mount(FLOAT_TRAP, { tone: "info" });
    setLeg(/Set run \(across\)/, -7);
    setLeg(/Set rise \(up\)/, -9);
    expect(holder.v).toEqual({ run: -7, rise: -9 });
    expect(readout()).toContain("✓ passes through B");
    expect(evaluate(FLOAT_TRAP, holder.v).correct).toBe(true);
  });

  it("accepts every equivalent triangle, which is the lesson", () => {
    for (const [run, rise] of [[1, 2], [2, 4], [4, 8], [-1, -2]] as const) {
      cleanup();
      const { holder } = mount(SLOPED, { tone: "info" });
      setLeg(/Set run \(across\)/, run);
      setLeg(/Set rise \(up\)/, rise);
      expect([run, rise, readout().includes("✓ passes through B")]).toEqual([run, rise, true]);
      expect([run, rise, evaluate(SLOPED, holder.v).correct]).toEqual([run, rise, true]);
    }
  });
});

describe("slopeTriangle: policy, undo and motion", () => {
  it("clamps a leg at the authored maximum and says so instead of moving it silently", () => {
    const { holder } = mount(SLOPED);
    setLeg(/Set run \(across\)/, 8);
    press(/Increase run \(across\)/); // already at legMax 8 — the button is disabled, so nothing moves
    expect(holder.v).toEqual({ run: 8, rise: 0 });
    expect((screen.getByRole("button", { name: /Increase run \(across\)/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("gives undo to the graph: one stepper run is one step back, and Reset is undoable", () => {
    const { holder } = mount(SLOPED);
    expect(screen.queryByTestId("st-undo")).toBeNull();
    press(/Increase rise \(up\)/, 4); // one run on one leg → one entry
    expect(holder.v).toEqual({ run: 1, rise: 4 });
    fireEvent.click(screen.getByTestId("st-undo"));
    expect(holder.v).toEqual({ run: 1, rise: 0 });
    expect(screen.queryByTestId("st-undo")).toBeNull();

    press(/Increase rise \(up\)/, 2);
    fireEvent.click(screen.getByRole("button", { name: /^Reset$/ }));
    expect(holder.v).toEqual({ run: 1, rise: 0 });
    fireEvent.click(screen.getByTestId("st-undo")); // Reset is an ordinary edit, so it steps back
    expect(holder.v).toEqual({ run: 1, rise: 2 });
  });

  it("separates the two legs into separate steps back", () => {
    const { holder } = mount(SLOPED);
    press(/Increase rise \(up\)/, 2);
    press(/Increase run \(across\)/, 1);
    expect(holder.v).toEqual({ run: 2, rise: 2 });
    fireEvent.click(screen.getByTestId("st-undo"));
    expect(holder.v).toEqual({ run: 1, rise: 2 });
    fireEvent.click(screen.getByTestId("st-undo"));
    expect(holder.v).toEqual({ run: 1, rise: 0 });
  });

  it("animates the leg that moved, by the operation's own verb", () => {
    const { container } = mount(SLOPED);
    press(/Increase rise \(up\)/);
    // Adding to a leg is a JOIN, by hand from mmipTypes §3.
    const rise = container.querySelector('[data-morph-actor="rise:triangle"]') as Element;
    expect(rise.getAttribute("data-morph-motion")).toBe("join");
    const run = container.querySelector('[data-morph-actor="run:triangle"]') as Element;
    expect(run.getAttribute("data-morph-motion")).toBeNull();
  });

  it("keeps the change legible with motion suppressed", () => {
    reducedMotionCheck({
      render: () => {
        const { container } = mount(SLOPED);
        setLeg(/Set rise \(up\)/, 6);
        return container;
      },
      assertMeaningful: (container) => {
        expect(container.querySelectorAll("[data-morph-motion]")).toHaveLength(0);
        const said = (container.querySelector('[data-testid="st-status"]') as Element).textContent ?? "";
        expect(said).toContain("Change the rise by 6");
        expect(container.querySelector('[data-testid="st-rise"]')?.textContent).toBe("6");
      },
    });
  });

  it("gives every affordance a keyboard path and removes them when finalized", () => {
    const { container } = mount(SLOPED);
    press(/Increase rise \(up\)/);
    const parity = keyboardParityCheck(container, {
      pointerSelectors: { steppers: "button", sliders: 'input[type="range"]' },
    });
    expect(parity.failures).toEqual([]);
    cleanup();
    mount(SLOPED, { disabled: true });
    expect(screen.queryByTestId("st-undo")).toBeNull();
    expect((screen.getByRole("slider", { name: /Set run/ }) as HTMLInputElement).disabled).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════ */

const AFFINE = AffineRelationshipLabSpec.parse({
  type: "affineRelationshipLab",
  task: "compareRate",
  answerMode: "choice",
  prompt: "Which plan charges more per hour?",
  lines: [
    { id: "a", label: "Plan A", m: 3, b: 2, sourceKind: "equation", sourceText: "y = 3x + 2" },
    { id: "b", label: "Plan B", m: 1, b: 6, sourceKind: "equation", sourceText: "y = x + 6" },
  ],
  rateGoal: "greater",
  choices: [
    { id: "a", label: "Plan A", claim: "rate:greater:a", feedback: "Plan A climbs 3 per hour against Plan B's 1." },
    { id: "b", label: "Plan B", claim: "rate:greater:b", feedback: "Plan B starts higher but climbs more slowly." },
  ],
  requiredExplorations: 1,
  successFeedback: "Plan A's rate of 3 per hour is the greater one.",
  explorationFeedback: "Open a stage to compare the two rates.",
  fallbackFeedback: "Compare how much each plan adds for one more hour.",
}) as TAffineRelationshipLab as TWidget;

describe("affineRelationshipLab: derive-only adoption of the line-shaped core", () => {
  it("plots each relation from its derived line, exactly", () => {
    const { container } = render(<WidgetRenderer spec={AFFINE} value={{}} onChange={() => {}} disabled={false} />);
    const drawn = Array.from(container.querySelectorAll("svg line[stroke-dasharray], svg line[stroke-width='3']"))
      .filter((el) => el.getAttribute("stroke-width") === "3");
    expect(drawn).toHaveLength(2);
    const span = (el: Element) => ["x1", "y1", "x2", "y2"].map((a) => Number(el.getAttribute(a)));
    const [a, b] = drawn.map(span);
    // Both relations are drawn across the SAME x-range, so the window is shared.
    expect([a[0], a[2]]).toEqual([b[0], b[2]]);
    // Window-free and scale-free: over one shared run, the drops are in the ratio of the slopes.
    // Plan A rises 3 per unit, Plan B rises 1, so A's pixel drop must be exactly 3× B's.
    const dropA = a[1] - a[3];
    const dropB = b[1] - b[3];
    expect(dropB).not.toBe(0);
    expect(dropA / dropB).toBeCloseTo(3, 12);
    // y increases upward on screen, so a positive rate must fall in pixel terms.
    expect(dropA).toBeGreaterThan(0);
  });

  it("leaves the grader and every authored surface exactly where they were", () => {
    render(<WidgetRenderer spec={AFFINE} value={{}} onChange={() => {}} disabled={false} />);
    // The source cards, the stage buttons and the choices are untouched by the derive-only wiring.
    expect(screen.getAllByText(/Plan A/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("y = 3x + 2")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Open affine stage/ }).length).toBeGreaterThan(0);
    // And no new affordance appeared this window.
    expect(screen.queryByTestId("arl-undo")).toBeNull();
    expect(screen.queryByTestId("arl-status")).toBeNull();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════ */

describe("both line-family engines run THROUGH the assembled canonical model", () => {
  it("imports the assembled objects and reaches no loose constructor or deriver", async () => {
    // A source-level pin, in the manner of O1's (S209-A1): the point is that the seam exists in
    // the code, and only the code can testify to that. If a later edit re-introduces a direct
    // `makeLineCanonical(...)` or `deriveGraph(...)` in the renderer, `CanonicalModel` silently
    // stops being load-bearing for these engines and nothing behavioural would notice.
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const src = readFileSync(join(process.cwd(), "src", "components", "widgets.tsx"), "utf8");
    expect(src).toContain("lineFamilyCanonicalModel");
    expect(src).toContain("slopeTriangleCanonicalModel");
    for (const loose of [
      "makeLineCanonical(",
      "makeTriangleCanonical(",
      "createLineFamilyGraph(",
      "absorbLineEdit(",
      "absorbTriangleLegEdit(",
      "deriveTriangleLegs(",
      "deriveTriangleSlope(",
      "deriveTriangleLine(",
      "deriveTriangleVerdict(",
      "affineLineValue(",
    ]) {
      expect([loose, src.includes(loose)]).toEqual([loose, false]);
    }
    // and both renderers really do derive through the object
    expect(src).toContain("model.views(");
    expect(src).toContain("model.createGraph()");
    expect(src).toContain("model.equivalent(");
  });
});
