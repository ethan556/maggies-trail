import { describe, expect, it } from "vitest";
import { authoredMathParts } from "./authoredMath";

const residue = (text: string) =>
  authoredMathParts(text, { includeArithmetic: true })
    .map((part) => (part.source === undefined ? part.text : ""))
    .join("");

describe("S245 expanded authored-surface notation", () => {
  it("keeps a signed rational power in one math island", () => {
    const text =
      "Even numerator: x = ±k^(n/m) — two real solutions (for k > 0).";
    const parts = authoredMathParts(text, { includeArithmetic: true });
    expect(residue(text)).not.toContain("^");
    expect(parts.some((part) => part.source?.includes("±k^(n/m)"))).toBe(true);
  });

  it("keeps pi fractions inside surrounding equations", () => {
    for (const text of [
      "Peak where 2(x − π/4) = π/2: x − π/4 = π/4, x = π/2.",
      "Peak where 3(x − π/3) = π/2 → x = π/3 + π/6 = π/2; y = 4·1 + 2 = 6.",
    ]) {
      expect(residue(text), text).not.toMatch(/\/(?:2|3|4|6)\b/);
      expect(
        authoredMathParts(text, { includeArithmetic: true }).some((part) =>
          part.tex?.includes("\\frac{π}"),
        ),
      ).toBe(true);
    }
  });

  it("keeps negative powers inside their reciprocal equations", () => {
    for (const text of [
      "A negative exponent means reciprocal: a^(−n) = 1/a^n.",
      "3^-2 = 1/3^2 = 1/9.",
    ]) {
      expect(
        residue(text),
        JSON.stringify(authoredMathParts(text, { includeArithmetic: true })),
      ).not.toContain("^");
    }
  });
});
