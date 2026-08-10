// @vitest-environment jsdom
//
// S216 — the algebraTiles board says what is ON it (QA C-1, carried two sessions).
//
// The accessible name used to describe only the x-row and the constant, so with area mode engaged
// a screen-reader learner heard nothing about the square pile or the rectangle they were filling —
// the two things the lesson is about. House rule for a derived name: it is tested against states
// that trigger EACH clause, plus the state that triggers none.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

afterEach(cleanup);

/** No squares, no rectangle: the mat the engine has always had. */
const CLASSIC: TWidget = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Build 3x + 4 on the mat.",
  targetX: 3,
  targetConst: 4,
  successFeedback: "That is 3x + 4 on the mat.",
  xFeedback: "The long tiles are not right yet.",
  constFeedback: "The unit tiles are not right yet."
});

/** (x + 3) by (x + 2): a rectangle whose partial products include an x² cell. */
const AREA: TWidget = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Fill the rectangle (x + 3) by (x + 2).",
  targetX: 5,
  targetConst: 6,
  maxTiles: 8,
  area: { width: [1, 3], height: [1, 2], mode: "distribute" },
  successFeedback: "That is x² + 5x + 6 — every part of the rectangle produced.",
  xFeedback: "The long tiles do not match the rectangle's two x strips yet.",
  constFeedback: "The unit tiles do not match the rectangle's corner block yet."
});

function mount(spec: TWidget) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return (
      <WidgetRenderer spec={spec} value={v} disabled={false}
        onChange={(next) => { holder.v = next; setV(next); }} />
    );
  }
  return { holder, ...render(<Host />) };
}
const boardName = () => screen.getByRole("img").getAttribute("aria-label") ?? "";
const setSquares = (n: number) =>
  fireEvent.change(screen.getByTestId("at-square-slider"), { target: { value: String(n) } });

describe("the tile board's accessible name", () => {
  it("is byte-identical on a classic mat — no squares, no rectangle, no new clause", () => {
    mount(CLASSIC);
    // Both new clauses are empty on a mat that has neither, so the name is the one it has always
    // carried. Asserted as the literal string, not as a pattern.
    expect(boardName()).toBe("Tile board showing 0x and a constant of 0.");
    expect(screen.queryByTestId("at-square-slider")).toBeNull();
  });

  it("names the rectangle and its fill state", () => {
    mount(AREA);
    // (x + 3) by (x + 2): the width splits into 1 x-segment and 3 unit-segments, the height into
    // 1 and 2 — so 4 columns by 3 rows, 12 partial-product cells. Counted here, by hand.
    expect(boardName()).toBe(
      "Tile board showing 0x and a constant of 0. It sits in a rectangle x + 3 by x + 2, 0 of 12 parts covered."
    );
  });

  it("names the square pile as soon as one exists, and drops the clause when it empties", () => {
    mount(AREA);
    expect(boardName()).not.toContain("x²");
    setSquares(2);
    expect(boardName()).toContain("2x², ");
    expect(boardName()).toContain("rectangle x + 3 by x + 2"); // the other clause survives
    setSquares(0);
    expect(boardName()).not.toContain("x²");
  });

  it("moves the covered count as the rectangle fills", () => {
    mount(AREA);
    expect(boardName()).toContain("0 of 12 parts covered");
    setSquares(1); // the single x² cell of this rectangle
    expect(boardName()).toContain("1 of 12 parts covered");
    setSquares(0);
    expect(boardName()).toContain("0 of 12 parts covered");
  });
});
