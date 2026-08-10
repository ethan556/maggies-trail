// @vitest-environment jsdom
//
// THE ALGEBRA WORKSPACE THROUGH THE DOM (S210).
//
// The claim under test is the zero-pair decision: the mat can hold +5x and −3x at once, the
// expression reads 2x the whole time, and collapsing the pairs is a move with a before and an
// after. Under the net-count value this engine used to carry, none of that was representable.
//
// Expected counts are worked out by hand in the comments; nothing is read back from the model
// except where a test explicitly derives an expectation through it and says so.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";
import { stubPrefersReducedMotion } from "@/lib/mmip/mmipHarness";
import { algebraTilesCanonicalModel } from "@/lib/mmip/algebraTilesModel";

afterEach(cleanup);

/** The gallery lesson: build −3x + 5x, read 2x. */
const SPEC = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Build −3x + 5x with tiles, then read the simplified expression.",
  targetX: 2,
  targetConst: 0,
  maxTiles: 8,
  xStart: 0,
  constStart: 0,
  successFeedback: "s",
  xFeedback: "x",
  constFeedback: "c",
}) as TWidget;

function mount(spec: TWidget = SPEC, opts: { disabled?: boolean; tone?: "neutral" | "info" | "error" } = {}) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(undefined);
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
  return { holder, ...utils };
}

const openPanel = () => fireEvent.click(screen.getByTestId("at-pairs-toggle"));
const slide = (label: RegExp, v: number) => fireEvent.change(screen.getByLabelText(label), { target: { value: String(v) } });
const longTiles = () => Array.from(document.querySelectorAll("svg g[data-morph-actor] g"));
const unitTiles = () => Array.from(document.querySelectorAll('svg g[data-morph-actor*="uPos"] rect'));
const marked = () =>
  Array.from(document.querySelectorAll("[data-morph-ms]")).map((el) => [
    el.getAttribute("data-morph-motion"),
    el.getAttribute("data-morph-ms"),
  ]);

/* ───────────────────────── the classic surface is untouched ───────────────────────── */

describe("the workspace is opt-in", () => {
  it("renders the classic board, with the panel closed and the sliders unchanged", () => {
    mount();
    expect(screen.queryByTestId("at-pairs")).toBeNull();
    expect(screen.getByLabelText(/long tiles/i)).toBeTruthy();
    expect(screen.getByLabelText(/small tiles/i)).toBeTruthy();
    expect(screen.getByTestId("at-pairs-toggle").getAttribute("aria-expanded")).toBe("false");
    // 0 tiles at the start, and the expression the engine has always printed
    expect(longTiles()).toHaveLength(0);
    expect(document.body.textContent).toContain("0x + 0");
  });

  it("the sliders still solve the task, and still grade correct", () => {
    const { holder } = mount();
    slide(/long tiles/i, 2);
    slide(/small tiles/i, 0);
    expect(evaluate(SPEC, holder.v).correct).toBe(true);
    expect(holder.v).toMatchObject({ x: 2, c: 0 });
  });

  it("crossing zero on the slider never leaves a stray tile on the mat", () => {
    // −2 then +1: two negatives come off before a positive goes on, so the board draws ONE tile,
    // exactly as the net-count renderer did.
    mount();
    slide(/long tiles/i, -2);
    expect(longTiles()).toHaveLength(2);
    slide(/long tiles/i, 1);
    expect(longTiles()).toHaveLength(1);
  });

  it("the persisted value still carries the net counts the grader reads", () => {
    const { holder } = mount();
    slide(/long tiles/i, 3);
    expect(holder.v).toMatchObject({ x: 3, c: 0 });
    // S211 added two x² populations and the rectangle flag, additively: a classic lesson carries
    // them at the values it has always implied — no squares, no frame.
    expect((holder.v as { mat: unknown }).mat).toEqual({
      xPos: 3, xNeg: 0, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false,
    });
  });
});

/* ───────────────────────── the decision, made visible ───────────────────────── */

describe("a zero pair is a state the learner can build and then collapse", () => {
  it("holds +5x and −3x at once while the expression stays at 2x", () => {
    const { holder } = mount();
    openPanel();
    // five positives via the slider, then three zero pairs → +8x and −3x is not the lesson;
    // build it honestly: 2x net with three pairs added on top = 5 positives, 3 negatives.
    slide(/long tiles/i, 2);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByTestId("at-add-pair-x"));
    // 2 + 3 = 5 long tiles drawn positive, plus 3 drawn negative = 8 on the mat
    expect(longTiles()).toHaveLength(8);
    expect(holder.v).toMatchObject({ x: 2, c: 0 });
    expect((holder.v as { mat: unknown }).mat).toEqual({
      xPos: 5, xNeg: 3, uPos: 0, uNeg: 0, sqPos: 0, sqNeg: 0, framed: false,
    });
    // both readings on screen at once
    expect(screen.getByTestId("at-unsimplified").textContent).toContain("5x − 3x");
    expect(screen.getByTestId("at-unsimplified").textContent).toContain("2x + 0");
    // and the grader is unmoved: the mat is worth what it was worth
    expect(evaluate(SPEC, holder.v).correct).toBe(true);
  });

  it("Simplify collapses every pair, changes the tiles and not the value", () => {
    const { holder } = mount();
    openPanel();
    slide(/long tiles/i, 2);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByTestId("at-add-pair-x"));
    expect(screen.getByTestId("at-cancel-all").textContent).toContain("(3)"); // three pairs waiting
    fireEvent.click(screen.getByTestId("at-cancel-all"));
    expect(longTiles()).toHaveLength(2); // the three pairs left together
    expect(holder.v).toMatchObject({ x: 2, c: 0 }); // still worth 2x
    expect(screen.queryByTestId("at-unsimplified")).toBeNull(); // nothing left to say twice
    expect((screen.getByTestId("at-cancel-all") as HTMLButtonElement).disabled).toBe(true);
  });

  it("the collapse is animated as a COLLAPSE, and a refusal animates nothing", () => {
    mount();
    openPanel();
    fireEvent.click(screen.getByTestId("at-add-pair-x"));
    expect(marked()).toEqual([["join", "220"]]); // tiles arriving
    fireEvent.click(screen.getByTestId("at-cancel-all"));
    // equationMorph maps cancel → collapse, weight 1.2 × 220 = 264
    expect(marked()).toEqual([["collapse", "264"]]);
  });

  it("undo puts the pair back", () => {
    const { holder } = mount();
    openPanel();
    fireEvent.click(screen.getByTestId("at-add-pair-x"));
    fireEvent.click(screen.getByTestId("at-cancel-all"));
    expect(longTiles()).toHaveLength(0);
    fireEvent.click(screen.getByTestId("at-undo"));
    expect(longTiles()).toHaveLength(2);
    expect(holder.v).toMatchObject({ x: 0, c: 0 });
  });
});

/* ───────────────────────── refusal, access, and no leak ───────────────────────── */

describe("the affordances answer for themselves", () => {
  it("a refusal reaches a live region that is mounted even with the panel closed", () => {
    mount();
    const status = screen.getByTestId("at-status");
    expect(status.getAttribute("role")).toBe("status");
    expect(status.className).toBe("sr-only");
    expect(status.textContent).toBe(""); // silent about accepted classic moves
    slide(/long tiles/i, 3);
    expect(screen.getByTestId("at-status").textContent).toBe("");
    // fill the positive pile to the mat's limit of 8, then ask for one more
    openPanel();
    slide(/long tiles/i, 8);
    fireEvent.click(screen.getByTestId("at-add-pair-x"));
    expect(screen.getByTestId("at-status").textContent).toMatch(/at most 8 tiles of one kind/);
  });

  it("every new control is a native button with a 44px target and a mathematical name", () => {
    const { container } = mount();
    openPanel();
    const panel = screen.getByTestId("at-pairs");
    for (const el of Array.from(panel.querySelectorAll('[role="button"], [tabindex]')))
      expect(["BUTTON", "INPUT"]).toContain(el.tagName);
    for (const el of Array.from(panel.querySelectorAll("button"))) expect(el.className).toMatch(/min-h-11/);
    expect(screen.getByTestId("at-pairs-toggle").className).toMatch(/min-h-11/);
    expect(screen.getByTestId("at-add-pair-x").getAttribute("aria-label")).toMatch(
      /one positive and one negative, which together are worth nothing/
    );
    fireEvent.click(screen.getByTestId("at-add-pair-x"));
    expect(screen.getByTestId("at-cancel-all").getAttribute("aria-label")).toMatch(/1 pair of x-tiles/);
    for (const el of Array.from(container.querySelectorAll('[class*="transition"]')))
      expect(el.getAttribute("class") ?? "").toMatch(/motion-reduce:transition-none|transition-colors/);
  });

  it("under reduced motion nothing travels and the words carry the move", () => {
    const restore = stubPrefersReducedMotion(true);
    try {
      mount();
      openPanel();
      fireEvent.click(screen.getByTestId("at-add-pair-x"));
      fireEvent.click(screen.getByTestId("at-cancel-all"));
      expect(marked()).toEqual([]);
      const status = screen.getByTestId("at-status").textContent ?? "";
      expect(status).toMatch(/made zero and left the mat together/);
      expect(status).toMatch(/State delta/);
      expect(longTiles()).toHaveLength(0); // the state change is complete without any animation
    } finally {
      restore();
    }
  });

  it("nothing on screen says what the target is before the reveal", () => {
    const { container } = mount();
    openPanel();
    expect(container.textContent).not.toMatch(/2 x-tiles and 0 unit tiles/);
    expect(screen.queryByTestId("at-ghost")).toBeNull();
    cleanup();
    // …and the ghost is still the only place it is named
    render(<WidgetRenderer spec={SPEC} value={{ x: 1, c: 0 }} onChange={() => {}} disabled tone="info" />);
    expect(screen.getByTestId("at-ghost").textContent).toContain("2 x-tiles and 0 unit tiles");
  });
});

/* ───────── S212 review, C2: a move that moved nothing describes nothing ───────── */

describe("an accepted edit that changes nothing", () => {
  // The `accept()` fix (S213) stopped unchanged transactions carrying ops, which changed what a
  // learner hears. For solveBalance that case is reachable from the DOM (its Reset button) and is
  // pinned audibly in widgets.mmip.o1.s208.test.tsx. For THIS widget it is not, and this test
  // exists to say so out loud rather than to fake the coverage:
  //
  //   · AlgebraTilesW has no reset control on the mat;
  //   · its only other no-op path is re-entering a slider's current number, and React suppresses a
  //     same-value change event, so no event reaches the widget at all.
  //
  // The transaction shape is therefore pinned at the model level instead
  // (algebraTilesModel.test.ts, "reset on an untouched mat"). The guard below fails the day
  // someone adds a reset control, which is exactly when the audible pin becomes writable.
  it("has no control that can produce one — so the audible pin lives with solveBalance", () => {
    mount();
    openPanel();
    expect(screen.queryByTestId("at-reset")).toBeNull();
    const panel = screen.getByTestId("at-pairs");
    const names = Array.from(panel.querySelectorAll("button")).map((b) => b.getAttribute("data-testid"));
    expect(names).toEqual(["at-add-pair-x", "at-add-pair-unit", "at-cancel-all", "at-undo"]);
  });

  it("and every move that DOES change something both animates and narrates", () => {
    mount();
    openPanel();
    fireEvent.click(screen.getByTestId("at-add-pair-x"));
    expect(Array.from(document.querySelectorAll("[data-morph-ms]")).length).toBeGreaterThan(0);
    expect(screen.getByTestId("at-status").textContent).toMatch(/zero pair/);
  });
});

/* ───────────────────────── the model is the seam, not a shape ───────────────────────── */

describe("the component runs THROUGH the assembled canonical model", () => {
  it("imports the assembled object and reaches no loose mutation helper", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const src = readFileSync(join(process.cwd(), "src", "components", "widgets.tsx"), "utf8");
    expect(src).toContain("algebraTilesCanonicalModel");
    for (const loose of ["algebraTilesApply(", "algebraTilesNormalize(", "deriveMat(", "algebraTilesInitial("])
      expect([loose, src.includes(loose)]).toEqual([loose, false]);
    expect(src).toContain("model.apply(st, edit, origin, source)");
  });

  it("what the board draws is exactly what the model's bindings derive", () => {
    const model = algebraTilesCanonicalModel({ targetX: 2, targetConst: 0, maxTiles: 8 });
    mount();
    openPanel();
    fireEvent.click(screen.getByTestId("at-add-pair-x"));
    const after = model.apply(model.initial, { kind: "placeZeroPair", tile: "x" }, "physical", "algebraTiles.mat").after;
    const views = model.views(after);
    expect(longTiles()).toHaveLength(views.mat.xPos + views.mat.xNeg);
    expect(screen.getByTestId("at-unsimplified").textContent).toContain(views.expression.unsimplified!);
    expect((screen.getByTestId("at-cancel-all") as HTMLButtonElement).disabled).toBe(!views.controls.canCancelAll);
  });
});
