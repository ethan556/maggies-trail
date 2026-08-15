/**
 * S242 / MPB-05 — LEIBNIZ NOTATION IS STACKED, AND FOUR ENGLISH SHAPES ARE NOT.
 *
 * Ruled 2026-08-15: `dy/dx` renders as a true stacked fraction everywhere, not as a slash.
 *
 * The ruling was taken because 231 index rows carried Leibniz notation and NONE of them formed an
 * island of any kind: `dy` is two letters, so the single-letter atom declines it, and the fraction
 * island wants digits on both sides. The notation therefore reached the screen in the UI's body
 * font — on 190 widget spec strings and 41 lesson-prose strings — visually unlike every other
 * variable in the app.
 *
 * THE HALF OF THIS FILE THAT MATTERS IS THE SECOND HALF. Admitting a new always-on island is
 * admitting that a character shape cannot occur in English, and this file has been wrong about that
 * before: the word-boundary defect tore 3,113 authored strings by assuming a single letter beside a
 * number was arithmetic. So the claim was tested against the corpus before it was believed, and the
 * four false positives it found are pinned below as fixtures. Each one sets exactly one constraint
 * in DERIVATIVE_OP, and deleting any constraint makes one of them fail.
 */
import { describe, expect, it } from "vitest";
import { authoredMathParts, powerShorthandToTex } from "./authoredMath";
import { renderMath } from "./renderMath";

/** The island SOURCES, in order — what the tokenizer decided to treat as mathematics. */
const islands = (text: string, arithmetic = false): string[] =>
  authoredMathParts(text, { includeArithmetic: arithmetic }).filter((p) => p.tex).map((p) => p.source ?? "");

/** The prose that survives with every island removed — literally what the learner reads as text. */
const residue = (text: string, arithmetic = false): string =>
  authoredMathParts(text, { includeArithmetic: arithmetic }).map((p) => p.text).join("");

describe("MPB-05 — the derivative stacks", () => {
  it("turns every authored Leibniz shape into a fraction", () => {
    for (const [source, tex] of [
      ["dy/dx", "\\frac{dy}{dx}"],
      ["dy/dt", "\\frac{dy}{dt}"],
      ["dV/dt", "\\frac{dV}{dt}"],
      // The operator form has no numerator variable — `d/dx[…]`, read "differentiate what follows".
      ["d/dx", "\\frac{d}{dx}"],
      ["d/dt", "\\frac{d}{dt}"],
      // Second order. The marker sits BEFORE the variable on top and AFTER it underneath, which is
      // why the rewrite carries them separately instead of treating the two halves symmetrically.
      ["d²y/dx²", "\\frac{d^{2}y}{dx^{2}}"],
      ["d²x/dt²", "\\frac{d^{2}x}{dt^{2}}"],
      /* Partials use the same shape with a different glyph and must not need a second rule. The
       * Greek letter is left as authored Unicode rather than rewritten to `\partial` or `\theta`,
       * because that is what this file already does with π, θ and Δ everywhere else and KaTeX emits
       * IDENTICAL MathML either way — `\frac{∂z}{∂x}` and `\frac{\partial z}{\partial x}` both
       * reach a screen reader as ∂ z ∂ x. Adding a rewrite would be a second spelling to maintain
       * for no change on screen.
       *
       * STATED PLAINLY: the corpus contains no partial derivative at all. These two rows are the
       * pattern being robust, not the pattern being exercised by content. */
      ["∂z/∂x", "\\frac{∂z}{∂x}"],
      ["dθ/dt", "\\frac{dθ}{dt}"]
    ] as const) {
      expect(powerShorthandToTex(source), source).toBe(tex);
    }
  });

  it("renders every one of those through KaTeX without an error", () => {
    for (const source of ["dy/dx", "d/dx", "d²y/dx²", "∂z/∂x", "d/dx[x² + 7]", "(dy/du)·(du/dx)"]) {
      const parts = authoredMathParts(source, { includeArithmetic: true }).filter((p) => p.tex);
      expect(parts.length, source).toBeGreaterThan(0);
      for (const part of parts) expect(renderMath(part.tex!, false).error, `${source} → ${part.tex}`).toBeNull();
    }
  });

  it("reaches widget strings, where arithmetic is off and 190 of the 231 rows live", () => {
    // `widgets.tsx` renders 155 of its 156 spec strings with includeArithmetic: false, so an island
    // that only forms on the arithmetic path never reaches an option label or a widget prompt.
    expect(islands("dy/dx = y with y(0) = 1. Take ONE Euler step.")).toContain("dy/dx");
    expect(islands("2x(dx/dt) + 2y(dy/dt) = 0")).toEqual(["dx/dt", "dy/dt"]);
    expect(residue("Ask of each quantity: is it different a second later? If yes, it owes a d/dt."))
      .not.toContain("d/dt");
  });

  it("carries the operator's argument, so the bracket is not orphaned beside the fraction", () => {
    expect(islands("Why is d/dx[x² + 7] the same as d/dx[x²]?")).toEqual(["d/dx[x² + 7]", "d/dx[x²]"]);
    expect(powerShorthandToTex("d/dx[x² + 7]")).toBe("\\frac{d}{dx}[x^{2} + 7]");
  });

  it("keeps the operator but drops the argument when the argument is a word", () => {
    /* The corpus writes word placeholders inside these brackets, exactly as it does inside an
     * integral's. Typesetting `[position]` renders it as eight italic letters multiplied together,
     * so `hasProseWord` refuses the wider island — and because both extents are offered as
     * candidates, the bare operator is still there to be accepted. Losing both would be worse. */
    expect(islands("d/dx[position] is the operator applied to position.")).toEqual(["d/dx"]);
    expect(residue("d/dx[position] is the operator applied to position.")).toContain("[position]");
  });

  it("sizes parentheses to the fraction they now contain", () => {
    // The chain rule and parametric arc length both wrap a derivative in authored parentheses. A
    // plain `(` sets at base height beside a two-line fraction and reads as belonging to the
    // numerator alone.
    expect(powerShorthandToTex("(dy/du)·(du/dx)")).toBe("\\left(\\frac{dy}{du}\\right)\\cdot \\left(\\frac{du}{dx}\\right)");
    expect(renderMath(powerShorthandToTex("√((dx/dt)² + (dy/dt)²)"), false).error).toBeNull();
  });

  it("merges the derivative into the equation around it where arithmetic is on", () => {
    // A stacked fraction followed by body-type "= 15" is worse than either form used consistently.
    expect(islands("So dy/dx = 15 at that point.", true)).toEqual(["dy/dx = 15"]);
    expect(islands("Here d²y/dx² = 6x tells you the concavity.", true)).toEqual(["d²y/dx² = 6x"]);
  });
});

describe("MPB-05 — the four English shapes that must stay prose", () => {
  /* Each of these was a REAL match during the corpus test that preceded the ruling, not a
   * hypothetical. The comment on each names the constraint it pins. */

  it("does not read a slash between two words as a derivative", () => {
    // `d c/d b` — matched across three words of "compare a/b and c/d by checking a×d against b×c".
    // Pinned by: no whitespace anywhere inside the notation.
    const text = "compare a/b and c/d by checking a×d against b×c";
    expect(islands(text).join(" ")).not.toMatch(/d\s*c\/d/);
    expect(residue(text)).toContain("c/d");
  });

  it("does not read the matrix inverse d/det as a derivative", () => {
    // Pinned by: the denominator variable is ONE letter followed by a non-letter, so `det` fails.
    expect(islands("Inverse top-left = d/det = 3/6 = 1/2.")).not.toContain("d/de");
    expect(residue("Inverse top-left = d/det = 3/6 = 1/2.")).toContain("d/det");
  });

  it("does not read a slash-separated path as a derivative", () => {
    // `grade/domain/cluster` matched `de/do`. Pinned by: the leading `d` needs a non-alphanumeric
    // before it, which the `a` of "grade" cannot supply.
    for (const text of ["Read the grade/domain/cluster code.", "the and/or rule", "sender/receiver pairs"]) {
      expect(islands(text), text).toEqual([]);
      expect(residue(text), text).toBe(text);
    }
  });

  it("leaves the sentence around the notation completely untouched", () => {
    // The tearing failure mode this file has hit three times: an island that eats a neighbouring
    // word. Every character outside the notation must survive as prose.
    const text = "That is dA/dr — the derivative with respect to the RADIUS.";
    expect(islands(text)).toEqual(["dA/dr"]);
    expect(residue(text)).toBe("That is  — the derivative with respect to the RADIUS.");
  });

  it("stacks the notation in the lesson that teaches the notation", () => {
    /* The baseline flagged this lesson as the reason to ask before changing anything: a large share
     * of the rows sit in the lessons that EXPLAIN the three notations, "where showing dy/dx inline
     * may be the intent". The ruling went the other way, and this lesson is the strongest case for
     * it — the sentence says Leibniz notation "looks like a fraction", and until now it did not. */
    const text = "**dy/dx** — Leibniz. It *looks* like a fraction, and in the chain rule it behaves like one.";
    expect(islands(text, true)).toContain("dy/dx");
    expect(powerShorthandToTex("dy/dx")).toBe("\\frac{dy}{dx}");
  });
});
