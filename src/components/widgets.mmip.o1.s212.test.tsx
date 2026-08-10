// @vitest-environment jsdom
//
// THE AREA WORKSPACE THROUGH THE DOM (S212, redesigned S215).
//
// S213's Fable-QA rejected the first version: the rectangle was a fixed dashed box with a caption,
// and "Open the rectangle" computed the expansion in one press. The rectangle is now real geometry
// — edges proportional to the factors, interior divided into the partial-product cells — and the
// learner FILLS it by producing tiles. There is no open-it-for-me button.
//
// Partial products are counted by hand in the comments.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, algebraTilesPartials, type TWidget } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";
import { stubPrefersReducedMotion } from "@/lib/mmip/mmipHarness";

afterEach(cleanup);

const FB = { successFeedback: "S", xFeedback: "X", constFeedback: "C" };

/** 3(x + 2). Partials by hand: square 0·1 = 0; x 0·2 + 3·1 = 3; unit 3·2 = 6. Nine cells. */
const DIST = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Cover the rectangle with tiles.",
  targetX: 3, targetConst: 6, maxTiles: 12, ...FB,
  area: { width: [0, 3], height: [1, 2], mode: "distribute" },
  partialProductFeedback: "P",
  unopenedFrameFeedback: "U",
}) as TWidget;

/** (x + 2)(x + 3). Partials: square 1; x 1·3 + 2·1 = 5; unit 2·3 = 6. */
const FACT = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Gather x² + 5x + 6 into a rectangle.",
  targetX: 5, targetConst: 6, targetSquare: 1, maxTiles: 12, ...FB,
  area: { width: [1, 2], height: [1, 3], mode: "factor" },
  frameMismatchFeedback: "M",
}) as TWidget;

const CLASSIC = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Build −3x + 5x.",
  targetX: 2, targetConst: 0, maxTiles: 8, xStart: 0, constStart: 0, ...FB,
}) as TWidget;

function mount(spec: TWidget = DIST) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(undefined);
    return <WidgetRenderer spec={spec} value={value} onChange={(v) => { holder.v = v; setValue(v); }} disabled={false} />;
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}
const openPanel = () => fireEvent.click(screen.getByTestId("at-pairs-toggle"));
const setLong = (n: number) => fireEvent.change(screen.getByLabelText(/long tiles/i), { target: { value: String(n) } });
const setSmall = (n: number) => fireEvent.change(screen.getByLabelText(/small tiles/i), { target: { value: String(n) } });
const allCells = () => Array.from(document.querySelectorAll('[data-testid^="at-cell-"]'));
const filledCells = () => Array.from(document.querySelectorAll('[data-testid*="-filled"]'));

/* ─────────────── item 1: edges proportional to the factors ─────────────── */

describe("the rectangle is drawn from the factors", () => {
  it("an x-edge is drawn longer than a unit edge, and 3 wide is three times 1 wide", () => {
    const { container } = mount(DIST);
    const cells = allCells() as unknown as SVGRectElement[];
    // 3(x + 2): width is three unit-segments; height is one x-segment and two unit-segments.
    const widths = new Set(cells.map((c) => c.getAttribute("width")));
    const heights = new Set(cells.map((c) => c.getAttribute("height")));
    expect([...widths]).toEqual(["18"]); // three columns, each one unit wide
    expect([...heights].sort()).toEqual(["18", "44"]); // an x row and two unit rows
    expect(Number([...heights].sort()[1])).toBeGreaterThan(Number([...heights].sort()[0]));
    // the outline spans exactly the sum of its segments
    const outline = container.querySelector('[data-testid="at-frame"] rect[fill="none"]') as SVGRectElement;
    expect(outline.getAttribute("width")).toBe(String(3 * 18 + 2));
    expect(outline.getAttribute("height")).toBe(String(44 + 2 * 18 + 2));
  });

  it("labels each edge with the factor it is, where the edge is", () => {
    mount(DIST);
    const texts = Array.from(screen.getByTestId("at-frame").querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("3");
    expect(texts).toContain("x + 2");
  });
});

/* ─────────────── item 2: the interior is the partial products ─────────────── */

describe("the interior is the multiplication, as areas", () => {
  it("has one cell per partial product, and the counts ARE algebraTilesPartials", () => {
    mount(DIST);
    // 3 columns × 3 rows = 9 cells: 3 x-cells (one per column, in the x row) and 6 unit cells.
    expect(allCells()).toHaveLength(9);
    expect(document.querySelectorAll('[data-testid^="at-cell-x"]')).toHaveLength(3);
    expect(document.querySelectorAll('[data-testid^="at-cell-unit"]')).toHaveLength(6);
    const p = algebraTilesPartials([0, 3], [1, 2]);
    expect([p.x, p.unit, p.square]).toEqual([3, 6, 0]);
  });

  it("the expansion is READ OFF the picture: cells covered, then the sum they make", () => {
    mount(DIST);
    expect(screen.getByTestId("at-area-progress").textContent).toMatch(/^0 of 9 parts/);
    setLong(3);
    setSmall(6);
    expect(screen.getByTestId("at-area-progress").textContent).toMatch(/Every part of the rectangle is covered: 9 pieces, and together they are 3x \+ 6\./);
  });
});

/* ─────────────── item 3: produce, not click ─────────────── */

describe("the learner produces the partial products", () => {
  it("offers NO button that computes the expansion", () => {
    const { container } = mount(DIST);
    expect(screen.queryByTestId("at-open-frame")).toBeNull();
    expect(screen.queryByTestId("at-open-frame-partial")).toBeNull();
    expect(screen.queryByTestId("at-gather-frame")).toBeNull();
    // the only button before the panel is opened is the zero-pair toggle
    expect(Array.from(container.querySelectorAll("button")).map((b) => b.getAttribute("data-testid"))).toEqual([
      "at-pairs-toggle",
    ]);
  });

  it("starts empty and ungraded-as-unstarted, not as a constant error", () => {
    const { holder } = mount(DIST);
    expect(filledCells()).toHaveLength(0);
    expect(evaluate(DIST, holder.v).feedback).toBe("U"); // unopenedFrameFeedback
    expect(evaluate(DIST, holder.v).feedback).not.toBe("C");
  });

  it("fills region by region as the learner supplies each count", () => {
    const { holder } = mount(DIST);
    setLong(3); // the three x-cells
    expect(filledCells()).toHaveLength(3);
    expect(evaluate(DIST, holder.v).correct).toBe(false);
    setSmall(6); // the six unit-cells
    expect(filledCells()).toHaveLength(9);
    expect(evaluate(DIST, holder.v).correct).toBe(true);
  });

  it("either order covers it — the rectangle does not care which region comes first", () => {
    const a = mount(DIST);
    setLong(3); setSmall(6);
    const first = a.holder.v;
    cleanup();
    const b = mount(DIST);
    setSmall(6); setLong(3);
    expect((b.holder.v as { x: number; c: number }).x).toBe((first as { x: number }).x);
    expect(evaluate(DIST, b.holder.v).correct).toBe(true);
  });
});

/* ─────────────── the misconception, IN THE PICTURE ─────────────── */

describe("an incomplete distribution is a hole in the rectangle", () => {
  it("3x + 2 covers the x row and leaves four unit cells empty", () => {
    const { holder } = mount(DIST);
    setLong(3);
    setSmall(2); // one copy of the 2 instead of three
    expect(filledCells()).toHaveLength(5);
    expect(allCells()).toHaveLength(9);
    expect(screen.getByTestId("at-area-progress").textContent).toMatch(/^5 of 9 parts/);
    expect(evaluate(DIST, holder.v).feedback).toBe("P"); // and the sentence names it too
  });

  it("a tile of the wrong sign covers nothing", () => {
    const neg = WidgetSpec.parse({
      type: "algebraTiles", prompt: "p", targetX: -3, targetConst: -6, maxTiles: 8, ...FB,
      area: { width: [0, -3], height: [1, 2], mode: "distribute" },
    }) as TWidget;
    mount(neg);
    setLong(3); setSmall(6); // positives, where the rectangle is negative
    expect(filledCells()).toHaveLength(0);
    setLong(-3); setSmall(-6);
    expect(filledCells()).toHaveLength(9);
  });
});

/* ─────────────── over-production never reads as finished ─────────────── */

describe("a rectangle holds exactly its own area", () => {
  it("covering every cell with tiles to spare is NOT announced as complete", () => {
    // One slider drag past the target is all it took: 8 x-tiles cover the 3 x-cells and 5 are
    // left over. The widget used to say "9 pieces … together they are −8x − 8".
    const { holder } = mount(DIST);
    setSmall(6);
    setLong(8);
    expect(filledCells()).toHaveLength(9); // every cell covered…
    const said = screen.getByTestId("at-area-progress").textContent ?? "";
    expect(said).not.toMatch(/together they are/); // …and it does not claim an expansion
    expect(said).toMatch(/5 x-tiles are left over with nowhere inside it to go/);
    expect(said).toMatch(/A rectangle holds exactly its own area/);
    expect(evaluate(DIST, holder.v).correct).toBe(false); // and the verdict agrees with the words
  });

  it("the announcement and the verdict agree across the whole slider range", () => {
    for (const x of [0, 1, 3, 4, 8]) {
      cleanup();
      const { holder } = mount(DIST);
      setSmall(6);
      setLong(x);
      const said = screen.getByTestId("at-area-progress").textContent ?? "";
      const claimsDone = said.includes("together they are");
      expect([x, claimsDone]).toEqual([x, evaluate(DIST, holder.v).correct]);
    }
  });

  it("surplus units are named too, and a stray tile of the wrong kind", () => {
    mount(DIST);
    setLong(3);
    setSmall(9);
    expect(screen.getByTestId("at-area-progress").textContent).toMatch(/3 unit tiles are left over/);
  });
});

/* ─────────────── factor mode keeps its own move ─────────────── */

describe("factor mode", () => {
  it("starts with the trinomial loose and gathers it into the rectangle", () => {
    const { holder } = mount(FACT);
    expect(filledCells()).toHaveLength(12); // (1+2) columns × (1+3) rows, all covered at the start
    fireEvent.click(screen.getByTestId("at-gather-frame"));
    expect(evaluate(FACT, holder.v).correct).toBe(true);
  });

  it("refuses tiles that do not make that rectangle, and says what is missing", () => {
    mount(FACT);
    setSmall(5); // 6 → 5
    expect((screen.getByTestId("at-gather-frame") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByTestId("at-gather-frame").getAttribute("aria-label")).toMatch(/the rectangle needs 1, 5 and 6/i);
  });
});

/* ─────────────── classic lessons are untouched ─────────────── */

describe("a lesson with no rectangle is byte-identical", () => {
  it("draws no frame, no cells, no progress line, and no new controls", () => {
    const { container } = mount(CLASSIC);
    expect(screen.queryByTestId("at-frame")).toBeNull();
    expect(allCells()).toHaveLength(0);
    expect(screen.queryByTestId("at-area-progress")).toBeNull();
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("its readout and picture name still say exactly what they always said", () => {
    const { container } = mount(CLASSIC);
    const readout = Array.from(container.querySelectorAll("p")).find((p) => /tabular-nums/.test(p.className))!;
    expect(readout.textContent).toBe("0x + 0");
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/showing 0x and a constant of 0/);
  });

  it("still solves and grades exactly as before", () => {
    const { holder } = mount(CLASSIC);
    setLong(2);
    expect(evaluate(CLASSIC, holder.v).correct).toBe(true);
  });
});

/* ─────────────── access ─────────────── */

describe("the workspace answers for itself", () => {
  it("is keyboard-operable through native controls at 44px", () => {
    mount(DIST);
    const long = screen.getByLabelText(/long tiles/i) as HTMLInputElement;
    const small = screen.getByLabelText(/small tiles/i) as HTMLInputElement;
    for (const el of [long, small]) {
      expect(el.tagName).toBe("INPUT");
      expect(el.disabled).toBe(false);
      expect(el.className).toMatch(/h-11/); // 44px
      el.focus();
      expect(document.activeElement).toBe(el);
    }
  });

  it("says how much of the rectangle is covered, aloud", () => {
    mount(DIST);
    const p = screen.getByTestId("at-area-progress");
    expect(p.getAttribute("aria-live")).toBe("polite");
    setLong(3);
    expect(p.textContent).toMatch(/3 of 9 parts of the rectangle are covered/);
  });

  it("under reduced motion the state change is still complete", () => {
    const restore = stubPrefersReducedMotion(true);
    try {
      const { holder } = mount(DIST);
      setLong(3); setSmall(6);
      expect(document.querySelectorAll("[data-morph-ms]")).toHaveLength(0);
      expect(filledCells()).toHaveLength(9);
      expect(evaluate(DIST, holder.v).correct).toBe(true);
    } finally {
      restore();
    }
  });

  it("never names the answer before the reveal", () => {
    const { container } = mount(DIST);
    expect(container.textContent).not.toMatch(/3 x-tiles and 6 unit tiles/);
    expect(screen.queryByTestId("at-ghost")).toBeNull();
  });
});
