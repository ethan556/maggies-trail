/** PHASE B — math pipeline (s200). Renderer correctness + the degradation contract. */
import { describe, expect, it } from "vitest";
import { renderMath } from "./renderMath";

describe("renderMath", () => {
  it("renders inline and display fractions to KaTeX markup with MathML for screen readers", () => {
    for (const display of [false, true]) {
      const out = renderMath("\\frac{1}{2}", display);
      expect(out.error).toBeNull();
      expect(out.html).toContain("katex");
      expect(out.html).toContain("<math"); // §28: real math for AT, not a picture of math
      expect(out.html.includes("katex-display")).toBe(display);
    }
  });

  it("is deterministic: same tex, same markup", () => {
    expect(renderMath("x^2 + 3x - 4", true).html).toBe(renderMath("x^2 + 3x - 4", true).html);
  });

  it("never throws at a learner: invalid tex degrades to escaped text and reports the error", () => {
    const out = renderMath("\\frac{1}{", false);
    expect(out.error).not.toBeNull();
    expect(out.html).toContain("math-fallback");
    const hostile = renderMath("<script>alert(1)</script>\\badcmd", false);
    expect(hostile.html).not.toContain("<script>");
  });

  it("covers the notation classes §21 names, error-free", () => {
    for (const tex of [
      "\\sqrt{2}", "2\\tfrac{3}{4}", "x^{n}", "f(x) = mx + b", "(3, -2)",
      "\\angle ABC", "P(A \\mid B)", "\\bar{x}", "\\int_0^1 x^2\\,dx",
      "\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", "3\\ \\text{cm}"
    ]) {
      expect(renderMath(tex, true).error, tex).toBeNull();
    }
  });
});
