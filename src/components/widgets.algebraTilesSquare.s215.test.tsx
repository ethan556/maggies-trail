// @vitest-environment jsdom
//
// S215 — the x² control on the stage.
//
// The model half lives in `src/lib/mmip/algebraTilesSquare.s215.test.ts`. This file pins the part
// only a render can show: that the control exists exactly where it is wanted and nowhere else,
// that it is a real 44px slider stating its own number, that driving it fills the rectangle's x²
// cell in the PICTURE, and that the frame-standing refusal reaches the control as a disabled state
// rather than as a click that silently does nothing.
//
// The classic mat is checked negatively and deliberately: 27 authored steps use this engine with
// no rectangle, and none of them may grow a third slider.

import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import React from "react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";

beforeEach(cleanup);

const binomial: TWidget = WidgetSpec.parse({
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

const classic: TWidget = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Build 3x + 4 on the mat.",
  targetX: 3,
  targetConst: 4,
  successFeedback: "That is 3x + 4 on the mat.",
  xFeedback: "The long tiles are not right yet.",
  constFeedback: "The unit tiles are not right yet."
});

function Host({ spec, holder, disabled }: { spec: TWidget; holder: { v: unknown }; disabled?: boolean }) {
  const [v, setV] = useState<unknown>(null);
  return (
    <WidgetRenderer
      spec={spec}
      value={v}
      disabled={disabled ?? false}
      onChange={(next) => {
        holder.v = next;
        setV(next);
      }}
    />
  );
}

const mount = (spec: TWidget, disabled?: boolean) => {
  const holder = { v: null as unknown };
  const r = render(<Host spec={spec} holder={holder} disabled={disabled} />);
  return { holder, ...r };
};

const squareSlider = () => screen.getByTestId("at-square-slider") as HTMLInputElement;
const set = (el: HTMLElement, value: number) => fireEvent.change(el, { target: { value: String(value) } });

describe("the x² slider exists exactly where a rectangle does", () => {
  it("renders for an area lesson", () => {
    mount(binomial);
    expect(screen.queryByTestId("at-square-slider")).not.toBeNull();
  });

  it("does NOT render for the classic mat every authored step uses", () => {
    mount(classic);
    expect(screen.queryByTestId("at-square-slider")).toBeNull();
    // …and the two sliders that lesson has always had are still exactly two.
    expect(screen.getAllByRole("slider").length).toBe(2);
  });

  it("is a real range input, 44px tall, spanning the mat's own range", () => {
    mount(binomial);
    const el = squareSlider();
    expect(el.tagName).toBe("INPUT");
    expect(el.getAttribute("type")).toBe("range");
    expect(el.className).toContain("h-11"); // 2.75rem = 44px, the touch-target floor
    expect(el.getAttribute("min")).toBe("-8");
    expect(el.getAttribute("max")).toBe("8");
    expect(el.getAttribute("step")).toBe("1");
  });

  it("states its number, in the label a sighted learner reads and in the one a screen reader gets", () => {
    mount(binomial);
    expect(squareSlider().getAttribute("aria-valuetext")).toBe("0 square tiles");
    expect(screen.getByText(/x²-tiles =/).textContent).toContain("0");
    set(squareSlider(), 2);
    expect(squareSlider().getAttribute("aria-valuetext")).toBe("2 square tiles");
    expect(screen.getByText(/x²-tiles =/).textContent).toContain("2");
  });
});

describe("driving it fills the rectangle's x² cell", () => {
  it("the x² cell is a hole until the slider produces a tile for it", () => {
    mount(binomial);
    // (x + 3)(x + 2) holds exactly one x² cell.
    expect(screen.queryAllByTestId("at-cell-square-filled").length).toBe(0);
    set(squareSlider(), 1);
    expect(screen.queryAllByTestId("at-cell-square-filled").length).toBe(1);
  });

  it("the progress line counts it, and only says covered when the mat is EXACTLY the rectangle", () => {
    mount(binomial);
    const progress = () => screen.getByTestId("at-area-progress").textContent ?? "";
    expect(progress()).toContain("0 of 12 parts");

    set(squareSlider(), 1);
    expect(progress()).toContain("1 of 12 parts");

    const [, x, u] = screen.getAllByRole("slider"); // x², x, unit — in the order the algebra reads
    set(x, 5);
    set(u, 6);
    expect(progress()).toContain("Every part of the rectangle is covered");
    expect(progress()).toContain("x² + 5x + 6");
  });

  it("over-producing x² covers the cell and is still NOT announced as finished", () => {
    mount(binomial);
    const [sq, x, u] = screen.getAllByRole("slider");
    set(x, 5);
    set(u, 6);
    set(sq, 3);
    const text = screen.getByTestId("at-area-progress").textContent ?? "";
    expect(text).toContain("left over with nowhere inside it to go");
    expect(text).not.toContain("Every part of the rectangle is covered");
  });

  it("writes the x² tiles into the persisted mat, so the grader sees them", () => {
    const { holder } = mount(binomial);
    set(squareSlider(), 2);
    const v = holder.v as { mat: { sqPos: number; sqNeg: number } };
    expect(v.mat.sqPos).toBe(2);
    expect(v.mat.sqNeg).toBe(0);
  });
});

const factorSpec: TWidget = WidgetSpec.parse({
  type: "algebraTiles",
  prompt: "Gather these tiles into one rectangle.",
  targetX: 5,
  targetConst: 6,
  maxTiles: 8,
  area: { width: [1, 3], height: [1, 2], mode: "factor" },
  successFeedback: "Gathered: the tiles make the rectangle (x + 3) by (x + 2).",
  xFeedback: "The long tiles do not match the rectangle's x strips yet.",
  constFeedback: "The unit tiles do not match the rectangle's corner block yet."
});

describe("what factor mode actually asks of a learner TODAY", () => {
  // Recorded, not endorsed. `algebraTilesInitial` lays factor mode out with the partial products
  // ALREADY on the mat, so `matchesPartials` holds before the learner has done anything and the
  // gather button is live on arrival. One press and the step is graded correct — which is the same
  // shape of defect Fable-QA rejected in distribute mode ("the step removed a manipulation instead
  // of adding one"). The x² control this session adds is what makes the alternative possible: a
  // factor step could start from an EMPTY mat and require the tiles to be produced first. That is a
  // change to the starting state, not to a control, so it is left for adjudication — and pinned
  // here so that whichever way it goes, it goes deliberately.
  it("hands the learner the answer: the gather button is live before any move is made", () => {
    const { holder } = mount(factorSpec);
    const gather = screen.getByTestId("at-gather-frame") as HTMLButtonElement;
    expect(gather.disabled).toBe(false);
    fireEvent.click(gather);
    expect(evaluate(factorSpec, holder.v).correct).toBe(true);
  });

  it("and the mat it starts from is exactly the answer, tile for tile", () => {
    const { holder } = mount(factorSpec);
    // The initial write-back is the mat the lesson opens with.
    const v = holder.v as { x: number; c: number; mat: { sqPos: number; xPos: number; uPos: number } };
    expect({ sq: v.mat.sqPos, x: v.x, c: v.c }).toEqual({ sq: 1, x: 5, c: 6 });
  });
});

describe("the frame-standing refusal reaches the control", () => {
  it("is disabled, with a reason, while the rectangle is still whole", () => {
    // A factor lesson closes its rectangle; once it is whole, nothing on the mat may be typed at.
    const unusedFactorSpec: TWidget = WidgetSpec.parse({
      type: "algebraTiles",
      prompt: "Gather these tiles into one rectangle.",
      targetX: 5,
      targetConst: 6,
      maxTiles: 8,
      area: { width: [1, 3], height: [1, 2], mode: "factor" },
      successFeedback: "Gathered: the tiles make the rectangle (x + 3) by (x + 2).",
      xFeedback: "The long tiles do not match the rectangle's x strips yet.",
      constFeedback: "The unit tiles do not match the rectangle's corner block yet."
    });
    expect(unusedFactorSpec).toEqual(factorSpec); // same shape, declared twice on purpose: this
    // test reads the SHARED spec, and the equality proves the two descriptions have not drifted.
    mount(factorSpec);
    // Factor mode lays the partial products out loose, so the mat starts open and editable.
    expect(squareSlider().disabled).toBe(false);
    fireEvent.click(screen.getByTestId("at-gather-frame"));
    expect(squareSlider().disabled).toBe(true);
    expect(squareSlider().getAttribute("title")).toContain("open it first");
  });

  it("is disabled when the whole widget is", () => {
    mount(binomial, true);
    expect(squareSlider().disabled).toBe(true);
  });
});
