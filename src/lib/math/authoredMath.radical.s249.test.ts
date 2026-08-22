import { describe, expect, it } from "vitest";
import { authoredMathParts } from "./authoredMath";

const mathSources = (text: string, includeArithmetic = false) =>
  authoredMathParts(text, { includeArithmetic })
    .filter((part) => part.tex)
    .map((part) => part.source);

describe("S249 nested radical rendering", () => {
  it("keeps coordinate-distance radicals intact on arithmetic-off surfaces", () => {
    expect(mathSources("Use √((4−0)² + (4−1)²) to find the distance.")).toEqual([
      "√((4−0)² + (4−1)²)",
    ]);
    expect(mathSources("Distance is √((x₂ − x₁)² + (y₂ − y₁)²)." )).toEqual([
      "√((x₂ − x₁)² + (y₂ − y₁)²)",
    ]);
  });

  it("keeps nested statistical radicands intact without swallowing prose", () => {
    const text = "Divide by √([nΣx² − (Σx)²][nΣy² − (Σy)²]), then interpret r.";
    const parts = authoredMathParts(text);
    expect(parts.filter((part) => part.tex).map((part) => part.source)).toEqual([
      "√([nΣx² − (Σx)²][nΣy² − (Σy)²])",
    ]);
    expect(parts.at(-1)?.text).toBe(", then interpret r.");
  });

  it("renders an explicit radical glyph without reinterpreting prose parentheses", () => {
    expect(mathSources("The √ symbol names the principal square root.", true)).toEqual(["√"]);
    for (const text of [
      "Use the square-root method (after checking the domain).",
      "Read (nested prose) carefully.",
    ]) {
      expect(mathSources(text, true), text).toEqual([]);
    }
  });
});
