import { describe, expect, it } from "vitest";
import { authoredMathParts, powerShorthandToTex } from "./authoredMath";

describe("authored math shorthand", () => {
  it("converts nested and parenthesized exponents to valid TeX", () => {
    expect(powerShorthandToTex("(2^4)^2")).toBe("(2^{4})^{2}");
    expect(powerShorthandToTex("a^(m·n)")).toBe("a^{m\\cdot n}");
    expect(powerShorthandToTex("2^?")).toBe("2^{?}");
  });

  it("isolates math tokens while preserving prose and punctuation", () => {
    expect(authoredMathParts("Simplify (2^4)^2 to 2^?.")).toEqual([
      { text: "Simplify" },
      { text: " " },
      { text: "", tex: "(2^{4})^{2}" },
      { text: " " },
      { text: "to" },
      { text: " " },
      { text: ".", tex: "2^{?}" }
    ]);
  });
});
