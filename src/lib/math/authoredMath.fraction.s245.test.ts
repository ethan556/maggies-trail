import { describe, expect, it } from "vitest";
import { authoredMathParts, powerShorthandToTex } from "./authoredMath";
import { renderMath } from "./renderMath";

const corpusCases = [
  ["√5/√5", "\\frac{\\sqrt{5}}{\\sqrt{5}}"],
  ["5√5/5", "\\frac{5\\sqrt{5}}{5}"],
  ["6/√3", "\\frac{6}{\\sqrt{3}}"],
  ["4/√8", "\\frac{4}{\\sqrt{8}}"],
  ["4/(2√2)", "\\frac{4}{2\\sqrt{2}}"],
  ["2/√2", "\\frac{2}{\\sqrt{2}}"],
  ["10√5/5", "\\frac{10\\sqrt{5}}{5}"],
  ["2√2/2", "\\frac{2\\sqrt{2}}{2}"],
  ["3√3/3", "\\frac{3\\sqrt{3}}{3}"],
  ["9/(3√3)", "\\frac{9}{3\\sqrt{3}}"],
  ["3/√3", "\\frac{3}{\\sqrt{3}}"],
] as const;

describe("S245 radical fraction presentation packet", () => {
  it("converts every radical fraction shape in the live queue to one stacked fraction", () => {
    for (const [source, tex] of corpusCases) {
      expect(powerShorthandToTex(source), source).toBe(tex);
      expect(authoredMathParts(source), source).toEqual([
        { text: "", source, tex },
      ]);

      const rendered = renderMath(tex, false);
      expect(rendered.error, source).toBeNull();
      expect(rendered.html, source).toContain("<math");
      expect(rendered.html, source).toContain("mfrac");
    }
  });

  it("keeps the complete radical fraction together inside learner-facing sentences", () => {
    expect(authoredMathParts("Multiply by √3/√3 to rationalize.")).toEqual([
      { text: "Multiply by " },
      {
        text: "",
        source: "√3/√3",
        tex: "\\frac{\\sqrt{3}}{\\sqrt{3}}",
      },
      { text: " to rationalize." },
    ]);
  });

  it("does not weaken slash or word-boundary protections", () => {
    for (const text of [
      "On 5/5/2026 open https://example.com/a/b.",
      "Read input/output before continuing.",
    ]) {
      expect(authoredMathParts(text), text).toEqual([{ text }]);
    }

    expect(
      authoredMathParts("word/√5 and √5/result")
        .filter((part) => part.tex)
        .map((part) => part.source),
    ).toEqual(["√5", "√5"]);
  });
});
