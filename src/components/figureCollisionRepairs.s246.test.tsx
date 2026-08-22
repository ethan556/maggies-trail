// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

const REPAIRED_FIGURES = ["ia-top-bottom-swap", "asv-coordinate-rectangle-area"] as const;

describe("S246 named figure collision repairs", () => {
  afterEach(cleanup);

  it.each(REPAIRED_FIGURES)("keeps %s text labels collision-free", (figureId) => {
    const Figure = FIGURES[figureId];
    expect(Figure, `${figureId} left the registry`).toBeDefined();
    const { container } = render(<Figure />);
    const svg = container.querySelector("svg");
    expect(svg, `${figureId} did not render an SVG`).not.toBeNull();
    expect(
      collisions(scanTextBoxes(svg!).boxes).map(describeCollision),
      figureId,
    ).toEqual([]);
  });

  it("preserves the curve-order and rectangle-area mathematical messages", () => {
    const crossing = render(<>{FIGURES["ia-top-bottom-swap"]()}</>);
    expect(crossing.getByText("blue − orange")).toBeTruthy();
    expect(crossing.getByText("orange − blue")).toBeTruthy();
    expect(crossing.getAllByText("top − bottom")).toHaveLength(2);
    expect(crossing.getByText("split at the crossing")).toBeTruthy();
    const rectangle = render(<>{FIGURES["asv-coordinate-rectangle-area"]()}</>);
    const svg = rectangle.container.querySelector("svg");
    expect(svg?.getAttribute("data-width")).toBe("4");
    expect(svg?.getAttribute("data-height")).toBe("2");
    expect(svg?.getAttribute("data-area")).toBe("8");
    expect(rectangle.getByText("6 − 2 = 4")).toBeTruthy();
    expect(rectangle.getByText("4 − 2 = 2")).toBeTruthy();
    expect(rectangle.getByText("4 × 2 = 8")).toBeTruthy();
  });
});
