import { describe, expect, it } from "vitest";
import { authoredMathParts } from "./authoredMath";
import { renderMath } from "./renderMath";

const islands = (text: string, includeArithmetic = false) =>
  authoredMathParts(text, { includeArithmetic }).filter((part) => part.tex);

const residue = (text: string, includeArithmetic = false) =>
  authoredMathParts(text, { includeArithmetic })
    .filter((part) => !part.tex)
    .map((part) => part.text)
    .join("");

describe("S245 integral presentation packet", () => {
  it("renders a standalone integral label but leaves a symbol discussed in prose alone", () => {
    expect(islands("∫")).toEqual([{ text: "", source: "∫", tex: "\\int " }]);
    expect(authoredMathParts("The ∫ is a stretched S for sum.")).toEqual([
      { text: "The ∫ is a stretched S for sum." },
    ]);
  });

  it("preserves the sanctioned language integrands as text inside true notation", () => {
    const cases = [
      ["∫ (rate) dt", "\\int \\left(\\text{rate}\\right)\\,dt"],
      ["∫ speed dt", "\\int \\text{speed}\\,dt"],
      [
        "∫ₐᵇ (top − bottom) dx",
        "\\int_{a}^{b} \\left(\\text{top} - \\text{bottom}\\right)\\,dx",
      ],
      [
        "∫ (something in u) du",
        "\\int \\left(\\text{something in }u\\right)\\,du",
      ],
    ] as const;

    for (const [source, tex] of cases) {
      expect(islands(source), source).toEqual([{ text: "", source, tex }]);
      expect(residue(source), source).not.toContain("∫");
      const rendered = renderMath(tex, false);
      expect(rendered.error, source).toBeNull();
      expect(rendered.html, source).toContain("<math");
      expect(rendered.html, source).toContain("mtext");
    }
  });

  it("keeps a usage note outside a complete integral island", () => {
    const text =
      "∫₁³ (x³ + x)/x dx (for x ≠ 0). Give a decimal to three places.";
    const parts = authoredMathParts(text);
    expect(parts[0]).toEqual({
      text: "",
      source: "∫₁³ (x³ + x)/x dx",
      tex: "\\int_{1}^{3} (x^{3} + x)/x\\,dx",
    });
    expect(parts.filter((part) => part.tex).map((part) => part.source)).toEqual(
      ["∫₁³ (x³ + x)/x dx", "x ≠ 0"],
    );
    expect(residue(text)).not.toContain("∫");
  });

  it("treats pi next to the integrand as a constant, not a word boundary", () => {
    expect(islands("∫πf² dx")).toEqual([
      { text: "", source: "∫πf² dx", tex: "\\int πf^{2}\\,dx" },
    ]);
  });

  it("does not generalise the text-integrand licence to arbitrary prose", () => {
    for (const text of [
      "∫ speedy dt",
      "∫ total distance dt",
      "The integral of a rate gives change.",
    ]) {
      expect(islands(text), text).toEqual([]);
      expect(residue(text), text).toBe(text);
    }
  });
});
