// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { SvgLatexSurface } from "./SvgLatexSurface";

describe("SvgLatexSurface", () => {
  beforeAll(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value() {
        return { x: 20, y: 20, width: 80, height: 14 };
      },
    });
  });

  it("replaces a formula label with a caret-free KaTeX overlay and leaves prose alone", async () => {
    const authoredFormula = "y = 3^x";
    const { container } = render(
      <SvgLatexSurface>
        <svg viewBox="0 0 160 80" role="img" aria-label="The graph of y equals three to the power x.">
          <text x="60" y="30" fontSize="14">{authoredFormula}</text>
          <text x="60" y="55" fontSize="12">horizontal axis</text>
        </svg>
      </SvgLatexSurface>,
    );

    await waitFor(() => expect(container.querySelector("foreignObject[data-svg-latex-overlay] .katex")).not.toBeNull());
    expect(container.querySelector(".katex-html")?.textContent).not.toContain("^");
    expect(container.querySelector("svg text")?.getAttribute("style")).toContain("opacity: 0");
    expect(container.querySelectorAll("foreignObject[data-svg-latex-overlay]")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll("svg text"))[1].textContent).toBe("horizontal axis");
  });

  it("covers fractions, Greek symbols, powers, and calculus labels through the same renderer", async () => {
    const formulas = ["3/4 ÷ 1/2", "A = πr²", "θ = π/4", "∫₀¹ x² dx"];
    const { container } = render(
      <SvgLatexSurface>
        <svg viewBox="0 0 240 120" role="img" aria-label="Four mathematical expressions.">
          {formulas.map((formula, index) => <text key={formula} x="100" y={20 + index * 24}>{formula}</text>)}
        </svg>
      </SvgLatexSurface>,
    );

    await waitFor(() => expect(container.querySelectorAll("foreignObject[data-svg-latex-overlay]")).toHaveLength(formulas.length));
    expect(container.querySelectorAll(".katex")).toHaveLength(formulas.length);
  });
});
