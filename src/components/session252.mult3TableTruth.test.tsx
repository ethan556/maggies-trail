import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";

describe("S252 multiplication-table figure truth", () => {
  it("aligns the highlighted square fact across geometry, visible text, and accessibility text", () => {
    const markup = renderToStaticMarkup(FIGURES["mult3-mult-table"]());

    expect(markup).toContain("4 × 4 = 16 (highlighted square fact)");
    expect(markup).toContain("four times four highlighted at sixteen");
    expect(markup).not.toContain("4 × 6 = 24 (highlighted)");
    expect(markup).not.toContain("four and six highlighted at twenty-four");

    // The highlighted cell is row factor 4, column factor 4, whose printed value is 16.
    expect(markup).toMatch(/fill-opacity="0\.4"[^>]*><\/rect><text[^>]*>16<\/text>/);
  });
});
