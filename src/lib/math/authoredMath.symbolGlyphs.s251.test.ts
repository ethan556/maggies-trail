import { describe, expect, it } from "vitest";
import { authoredMathParts } from "./authoredMath";

describe("S251 universal mathematical glyph rendering", () => {
  it("routes standalone Greek, relation and calculus glyphs through math islands", () => {
    const source = "Use π and θ; distinct zeros ≤ degree; add ± signs; compare ≠ and ∞; then ∑, ∫, and √.";
    const parts = authoredMathParts(source, { includeArithmetic: false });
    const islands = parts.filter((part) => part.tex).map((part) => part.source);
    expect(islands).toEqual(["π", "θ", "≤", "±", "≠", "∞", "∑", "∫", "√"]);
    expect(parts.filter((part) => !part.tex).map((part) => part.text).join("")).not.toMatch(/[πθ≤±≠∞∑∫√]/);
  });

  it("keeps a complete expression as one island instead of splitting its symbols", () => {
    const parts = authoredMathParts("Solve x² ≥ 4π.", { includeArithmetic: true });
    const islands = parts.filter((part) => part.tex);
    expect(islands).toHaveLength(1);
    expect(islands[0]?.source).toBe("x² ≥ 4π");
  });
  it("renders algebraic slash fractions as one stacked fraction", () => {
    const parts = authoredMathParts("Check (x³ + 1)⁶/18 and 3x²/18.", {
      includeArithmetic: true,
    });
    expect(parts.filter((part) => part.tex).map((part) => [part.source, part.tex])).toEqual([
      ["(x³ + 1)⁶/18", "\\frac{(x^{3} + 1)^{6}}{18}"],
      ["3x²/18", "\\frac{3x^{2}}{18}"],
    ]);
  });

  it("does not promote a false closed relation as a complete math statement", () => {
    const islands = authoredMathParts("A learner writes 9 ≤ 2 here.", {
      includeArithmetic: true,
    })
      .filter((part) => part.tex)
      .map((part) => part.source);
    expect(islands).toEqual(["≤"]);
    expect(islands).not.toContain("9 ≤ 2");
  });
});
