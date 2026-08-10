import { describe, expect, it } from "vitest";
import { authoredMathParts, powerShorthandToTex } from "./authoredMath";

describe("authored math shorthand", () => {
  it("converts powers, Unicode superscripts, roots, fractions, and operators to TeX", () => {
    expect(powerShorthandToTex("(2^4)^2")).toBe("(2^{4})^{2}");
    expect(powerShorthandToTex("(2⁴)²")).toBe("(2^{4})^{2}");
    expect(powerShorthandToTex("a^(m·n)")).toBe("a^{m\\cdot n}");
    expect(powerShorthandToTex("1/2 × sqrt(16)")).toBe("\\frac{1}{2} \\times  \\sqrt{16}");
    expect(powerShorthandToTex("√(−36) and √|D|")).toBe("\\sqrt{-36} and \\sqrt{\\lvert D\\rvert}");
    expect(powerShorthandToTex("x ≤ 4")).toBe("x \\le  4");
  });

  it("keeps a balanced multi-factor power expression in one math island", () => {
    expect(authoredMathParts("Use (x^2 y^3)^2 now.")).toEqual([
      { text: "Use " },
      { text: "", source: "(x^2 y^3)^2", tex: "(x^{2} y^{3})^{2}" },
      { text: " now." }
    ]);
  });

  it("isolates math while preserving contiguous prose and punctuation", () => {
    expect(authoredMathParts("Simplify (2^4)^2 to 2^?. What is the exponent?")).toEqual([
      { text: "Simplify " },
      { text: "", source: "(2^4)^2", tex: "(2^{4})^{2}" },
      { text: " to " },
      { text: "", source: "2^?", tex: "2^{?}" },
      { text: ". What is the exponent?" }
    ]);
  });

  it("recognizes fractions and roots while leaving already-presented Unicode superscripts alone", () => {
    const parts = authoredMathParts("Compare 1/2 × 8 = 4, sqrt(9), √(−36), and (2⁴)².", { includeArithmetic: true });
    expect(parts.filter((part) => part.tex).map((part) => part.tex)).toEqual([
      "\\frac{1}{2} \\times  8 = 4",
      "\\sqrt{9}",
      "\\sqrt{-36}"
    ]);
    expect(parts.at(-1)?.text).toContain("(2⁴)²");
  });

  it("renders compact arithmetic and equality runs without swallowing prose", () => {
    expect(authoredMathParts("Because 2x = 8, divide both sides by 2.", { includeArithmetic: true })).toEqual([
      { text: "Because " },
      { text: "", source: "2x = 8", tex: "2x = 8" },
      { text: ", divide both sides by 2." }
    ]);
  });

  it("does not reinterpret dates, URLs, slash-separated prose, or ordinary text", () => {
    const text = "On 8/10/2026 open https://example.com/a/b and read input/output notes.";
    expect(authoredMathParts(text)).toEqual([{ text }]);
  });
});
