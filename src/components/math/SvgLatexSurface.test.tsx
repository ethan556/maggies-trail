// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { SvgLatexSurface } from "./SvgLatexSurface";

describe("SvgLatexSurface", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 0 });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => 0 });
  });

  beforeAll(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value() {
        const element = this as SVGElement;
        return {
          x: Number(element.getAttribute("data-box-x") ?? 20),
          y: Number(element.getAttribute("data-box-y") ?? 20),
          width: Number(element.getAttribute("data-box-width") ?? 80),
          height: Number(element.getAttribute("data-box-height") ?? 14),
        };
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

    await waitFor(() => expect(container.querySelector("foreignObject[data-svg-latex-overlay] .katex")).not.toBeNull(), { timeout: 5_000 });
    expect(container.querySelector(".katex-html")?.textContent).not.toContain("^");
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe("The graph of y equals three to the power x.");
    expect(container.querySelector("svg text")?.getAttribute("data-svg-latex-source")).toBe(authoredFormula);
    expect(container.querySelector("svg text")?.getAttribute("style")).toContain("opacity: 0");
    expect(container.querySelector("foreignObject[data-svg-latex-overlay]")?.getAttribute("aria-hidden")).toBe("true");
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
    expect(container.querySelectorAll("foreignObject[data-svg-latex-overlay]")).toHaveLength(formulas.length);
  });
  it("measures KaTeX after render and clamps labels at every viewBox edge", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 104 });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => 24 });
    const { container } = render(
      <SvgLatexSurface>
        <svg viewBox="0 0 160 100" role="img" aria-label="Four edge formulas remain visible.">
          <text data-box-x="1" data-box-y="1" data-box-width="30" data-box-height="12" x="1" y="13">x^2 + 10</text>
          <text data-box-x="129" data-box-y="1" data-box-width="30" data-box-height="12" x="129" y="13">y^3 + 8</text>
          <text data-box-x="1" data-box-y="87" data-box-width="30" data-box-height="12" x="1" y="99">πr^2</text>
          <text data-box-x="129" data-box-y="87" data-box-width="30" data-box-height="12" x="129" y="99">θ/2</text>
        </svg>
      </SvgLatexSurface>,
    );

    await waitFor(() => expect(container.querySelectorAll("foreignObject[data-svg-latex-fit='measured']")).toHaveLength(4));
    for (const overlay of Array.from(container.querySelectorAll("foreignObject[data-svg-latex-fit='measured']"))) {
      const x = Number(overlay.getAttribute("x"));
      const y = Number(overlay.getAttribute("y"));
      const width = Number(overlay.getAttribute("width"));
      const height = Number(overlay.getAttribute("height"));
      expect(x).toBeGreaterThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(1);
      expect(x + width).toBeLessThanOrEqual(159);
      expect(y + height).toBeLessThanOrEqual(99);
    }
    expect(Array.from(container.querySelectorAll("svg text")).every((node) => node.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("keeps the authored text visible when a zoom-width KaTeX label cannot fit", async () => {
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 240 });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => 28 });
    const { container } = render(
      <SvgLatexSurface>
        <svg viewBox="0 0 120 60" role="img" aria-label="A long exponential expression.">
          <text data-box-x="2" data-box-y="20" data-box-width="80" data-box-height="14" x="2" y="34">y = 3^x + 2^x + 5^x</text>
        </svg>
      </SvgLatexSurface>,
    );

    await waitFor(() => expect(container.querySelector("text")?.getAttribute("data-svg-latex-fallback")).toBe("y = 3^x + 2^x + 5^x"));
    const source = container.querySelector("text")!;
    expect(source.getAttribute("aria-hidden")).toBeNull();
    expect(source.getAttribute("style") ?? "").not.toContain("opacity: 0");
    expect(container.querySelector("foreignObject[data-svg-latex-overlay]")).toBeNull();
  });
});
