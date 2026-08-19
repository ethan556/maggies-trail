// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

const REPAIRED_FIGURES = [
  "g2g-shared-unit-compare",
  "g2g-record-repeats",
  "g2g-bar-gap",
  "g2g-display-choice",
  "mult3-divide-one-self",
] as const;

describe("S255 data-display and division figure collision repairs", () => {
  afterEach(cleanup);

  it.each(REPAIRED_FIGURES)("keeps %s labels collision-free", (figureId) => {
    const Figure = FIGURES[figureId];
    expect(Figure, `${figureId} left the registry`).toBeDefined();
    const { container } = render(<Figure />);
    const svg = container.querySelector("svg");
    expect(svg, `${figureId} did not render an SVG`).not.toBeNull();
    expect(collisions(scanTextBoxes(svg!).boxes).map(describeCollision), figureId).toEqual([]);
  });
});
