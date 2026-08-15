/**
 * S242 / ARCH-01 — THE ARITHMETIC ATOM STOPS AT WORD BOUNDARIES.
 *
 * THE DEFECT. `includeArithmetic`'s atom was `\d*[A-Za-z]`: one letter, with nothing said about
 * what sits either side of it. So the scanner consumed the final letter of an ordinary English
 * word and built a run out of it. "Position −6, distance 6." produced the island `n −6`, and the
 * learner saw "Positio" followed by a KaTeX italic n − 6 — the word broken in half, and the
 * authored U+2212 re-set as a binary minus. 3,113 occurrences across 39,236 authored strings, in a
 * corpus where the tokenizer is the only thing standing between authored prose and the renderer.
 *
 * THE SECOND CLASS, which is why one assertion was worth landing. The same hole shredded radicals.
 * In "a = sqrt(25) so the leg is 5." the scanner took `a`, then `=`, then the `s` of `sqrt`,
 * emitted `a = s`, and left `qrt(25)` sitting in the prose. `sqrt(...)` has its own always-on
 * island at the top of `mathMatches`, but the arithmetic run started one character earlier and won
 * the overlap. With boundaries, `s` followed by `q` is not an atom, the run never forms, and the
 * radical island claims the text. 875 of the 879 raw-sqrt rows in the S242 presentation index sit
 * on arithmetic-on surfaces, so this ordering is load-bearing: widening `includeArithmetic` before
 * this fix would have multiplied the class.
 *
 * WHAT THIS FILE GUARDS, and why each group exists:
 *   1. tearing must not come back — the reported shapes, left edge and right edge;
 *   2. radicals must survive an arithmetic-on surface;
 *   3. legitimate mathematics must still typeset — the fix is only worth having if it costs
 *      nothing, and "costs nothing" is a claim that needs its own assertions;
 *   4. the S237 boundary guard must still hold. That guard drops a candidate preceded by an
 *      operator, because such a candidate is the tail of a larger expression and rendering it
 *      produces a FALSE STATEMENT set in polished KaTeX ("x^2 - x - 6 = 0" once yielded the island
 *      "6 = 0"). A later edit to the atom could plausibly resurrect that, and it is a worse defect
 *      than the one this file is about — a broken word is ugly, a false equation is wrong.
 */
import { describe, expect, it } from "vitest";
import { authoredMathParts } from "./authoredMath";

/** The source text of every island the tokenizer accepted, in order. */
const islands = (text: string, includeArithmetic = true): string[] =>
  authoredMathParts(text, { includeArithmetic })
    .filter((p) => p.source !== undefined)
    .map((p) => p.source as string);

/** The prose the learner reads, with islands removed — where a tear shows up as a broken word. */
const prose = (text: string, includeArithmetic = true): string =>
  authoredMathParts(text, { includeArithmetic })
    .map((p) => (p.source === undefined ? p.text : ""))
    .join("");

describe("ARCH-01 — English words are never torn by the arithmetic scanner", () => {
  const torn: Array<[string, string]> = [
    ["Position −6, distance 6. One marker, two honest numbers.", "Positio"],
    ["Too far left — you have passed −6.", "passe"],
    ["That is −6's mirror image on the other side of zero.", "i"],
    ["area = 1/2 bh", "are"],
    ["The total = 12 items altogether.", "tota"]
  ];

  it.each(torn)("%s", (text, brokenFragment) => {
    // The pre-fix failure signature: the prose ends mid-word, leaving a fragment behind.
    expect(prose(text), `"${brokenFragment}" indicates the word was torn`).not.toMatch(
      new RegExp(`${brokenFragment}(?![A-Za-z])`)
    );
    // And the whole word must survive intact somewhere in the prose.
    expect(prose(text).replace(/\s+/g, " ")).toContain(brokenFragment);
  });

  it("tears at the RIGHT edge too — an island must not eat the first letter of the next word", () => {
    // "1/2 × b" once ate the "b" of "base".
    const text = "Area = 1/2 × base × height.";
    for (const island of islands(text)) {
      expect(island, `island "${island}" swallowed the start of a word`).not.toMatch(/[A-Za-z]$/);
    }
    expect(prose(text)).toContain("base");
    expect(prose(text)).toContain("height");
  });
});

describe("ARCH-01 — radicals survive an arithmetic-on surface", () => {
  it("does not shred sqrt( into an atom", () => {
    const text = "a = sqrt(25) so the leg is 5.";
    expect(islands(text)).not.toContain("a = s");
    expect(prose(text)).not.toContain("qrt(");
    // The always-on radical island gets to claim it instead.
    expect(islands(text).some((i) => i.includes("sqrt(25)"))).toBe(true);
  });

  it("behaves the same with arithmetic off — the flag must not change whether a radical renders", () => {
    const text = "y = sqrt(9)";
    const on = islands(text, true).some((i) => i.includes("sqrt(9)"));
    const off = islands(text, false).some((i) => i.includes("sqrt(9)"));
    expect(on).toBe(off);
    expect(off).toBe(true);
  });
});

describe("ARCH-01 — legitimate mathematics still typesets", () => {
  const kept: Array<[string, string]> = [
    ["f(x) = x^2", "(x) = x^2"],
    ["Solve x + 3 = 10 for x.", "x + 3 = 10"],
    ["Simplify 2x + 4 first.", "2x + 4"],
    ["Compare 3/4 and 2/3.", "3/4"]
  ];

  it.each(kept)("%s still yields an island", (text, expected) => {
    expect(islands(text).join(" | ")).toContain(expected);
  });

  it("a multi-digit coefficient is still one atom", () => {
    expect(islands("12x + 5 = 29").join(" | ")).toContain("12x + 5 = 29");
  });
});

describe("S242 — inequality relations are always-on islands", () => {
  /* The relation island exists because 37 authored strings leaked at a 100% rate: 26 sat on
   * surfaces that pass `includeArithmetic: false` (option labels, widget prompts) where the
   * arithmetic run is never consulted, and 11 carried negative operands the atom refuses to start
   * on. `<=` and `>=` do not occur in English and `≤`/`≥` occur nowhere else, so the relation is
   * its own evidence of mathematics — which is what makes it safe always-on where a bare `=` is
   * not, and what licenses the ASCII hyphen inside its operands. */
  const shouldRender: Array<[string, boolean, string]> = [
    ["x >= 3", false, "x >= 3"],
    ["x <= 3", false, "x <= 3"],
    ["Solve: 2x + 4 >= 10", false, "2x + 4 >= 10"],
    ["Solve: -7x - 8 <= -43", false, "-7x - 8 <= -43"],
    ["Add 4 (-6x>=-24), divide by -6 and FLIP: x<=4.", true, "-6x>=-24"],
    ["Subtract 6 (-2x<=-18), divide by -2 and FLIP: x>=9.", true, "-2x<=-18"]
  ];

  it.each(shouldRender)("%s", (text, arith, expected) => {
    expect(islands(text, arith)).toContain(expected);
  });

  it("captures the WHOLE left operand, not just its last term", () => {
    // Matching one term produced `4 >= 10` from "2x + 4 >= 10" — a false claim, which the guard
    // then correctly refused, so the inequality silently stayed raw. A subtle failure: the bug
    // and its own safety net cancelled into "nothing renders".
    expect(islands("Solve: 2x + 4 >= 10", false)).not.toContain("4 >= 10");
  });

  it("does not swallow the space before an unsigned operand", () => {
    for (const island of islands("divide by -6 and FLIP: x<=4.", true)) {
      expect(island).toBe(island.trim());
    }
  });

  it("≠ is a relation on the same terms as ≤ and ≥", () => {
    // MATH-01 found 285 rows of "6 ≠ 4" and "−6 ≠ 6" sitting in body type beside typeset islands.
    // The argument that admitted the digraphs applies unchanged: ≠ does not occur in English, so it
    // is its own evidence that the surrounding text is mathematics, and it is safe always-on where
    // a bare `=` is not.
    expect(islands("Equal distance would need equal magnitudes: 6 ≠ 4.", false)).toContain("6 ≠ 4");
    expect(islands("−6 ≠ 6, so they differ.", false)).toContain("−6 ≠ 6");
    // And a FALSE not-equal claim is refused exactly like a false equation.
    expect(islands("A learner writes 6 ≠ 6 here.", true)).toEqual([]);
  });

  it("a false inequality is refused, exactly like false arithmetic", () => {
    expect(islands("9 <= 2", true)).toEqual([]);
    expect(islands("5 >= 5", true)).toContain("5 >= 5");
  });

  it("hyphen ranges are still safe — the relation is what licenses the hyphen", () => {
    // S237 kept the ASCII hyphen out of the arithmetic operator class because "Ages 3-5" was being
    // typeset as arithmetic. That protection must survive: these carry no relation, so no island.
    expect(islands("Ages 3-5 are welcome.", false)).toEqual([]);
    expect(islands("Pages 10-12 tonight.", false)).toEqual([]);
    expect(islands("The score was 7-2 at half time.", false)).toEqual([]);
  });
});

describe("S242 / MATH-03 (MPB-04) — absolute-value bars are an operand", () => {
  /* "Which is equivalent to |x| ≥ 2?" produced no island at all: a relation needs an operand on
   * both sides and `|x|` was not one, so the inequality sat in body type beside typeset
   * neighbours. ~200 rows of the symbolic-display index are this shape. */

  it("carries a relation", () => {
    expect(islands("Which is equivalent to |x| ≥ 2?", false)).toContain("|x| ≥ 2");
    expect(islands("That is the inside band, the solution of |x| ≤ 2.", false)).toContain("|x| ≤ 2");
  });

  it("carries an equation on an arithmetic surface", () => {
    // Not reachable through the relation island: `=` is not one of its operators.
    expect(islands("|−6| = 6 and |4| = 4, and 6 > 4.")).toContain("|−6| = 6");
    expect(islands("So close — but |0| = 0, so 0 IS an output.")).toContain("|0| = 0");
  });

  it("admits an expression inside the bars, not only a single value", () => {
    expect(islands("Solve |x − 2| ≥ 5", false)).toContain("|x − 2| ≥ 5");
  });

  it("REFUSES conditional-probability notation, which uses the same character", () => {
    /* This is the reason the bar content is restricted to a value rather than to "anything between
     * two bars". `P(A | B)` is conditional probability and `P(king | face) = …` puts two bars in one
     * sentence — a permissive `\|[^|\n]+\|` would match from the first to the second, across the
     * prose between them, and typeset it as an absolute value. */
    expect(islands("Conditioning: P(A | B)", false)).toEqual([]);
    expect(islands("P(A | B) = P(A ∩ B) / P(B).", false)).toEqual([]);
    // An absolute-value misreading is an island that OPENS with a bar. That is what this asserts.
    //
    // It deliberately does NOT assert that no island contains a bar at all, because one does:
    // with arithmetic on, "P(king | face) = …" yields `(king | face) = P`. That is the PAREN-ATOM
    // tearing a function application in half — `\([^()\n]{1,40}\)` has matched a bracketed group
    // since long before this packet, and the same shape torn `f(x) = 4 * 2^x` into `f` plus an
    // island. Verified identical before and after MPB-04. Writing the stronger assertion here would
    // quietly bind this packet to a defect it did not cause and is not fixing; the defect is
    // tracked separately, and when it closes this fixture can be tightened in the same commit.
    for (const island of islands("P(king | face) = P(king and face)/P(face) = 1/3.", true))
      expect(island, "a conditional probability was read as an absolute value").not.toMatch(/^\s*\|/);
  });
});

describe("S242 / MATH-03 (MPB-03) — ± binds to its operand", () => {
  it("renders the two-case shape", () => {
    expect(islands("That treats the center as −1. So the cases are x − 1 = ±4.")).toContain("x − 1 = ±4");
  });

  it("leaves ± alone when it is being used as a word", () => {
    /* 622 of the corpus's 719 `±` strings put a value straight after it; the other 97 use the symbol
     * as a noun — "The ± in the formula flips only the imaginary sign" — or stand it alone as a
     * token label. Requiring a value is what keeps those in prose. */
    expect(islands("The ± in the formula flips only the imaginary sign.")).toEqual([]);
    expect(islands("±")).toEqual([]);
  });
});

describe("S242 / MATH-03 (MPB-01) — π carries its coefficient, its group and its slash", () => {
  it("≈ is an operator, which was the missing half of the problem", () => {
    // The dominant residue was "113.1 ≈ 36π": the run never formed because `≈` was absent from the
    // operator class, not because π was unrecognised.
    expect(islands("113.1 ≈ 36π is the WHOLE circle's area — the sector claims a quarter: 9π ≈ 28.27."))
      .toEqual(["113.1 ≈ 36π", "9π ≈ 28.27"]);
    expect(islands("14.14 ≈ 4.5π halves the slice.")).toContain("14.14 ≈ 4.5π");
  });

  it("keeps a juxtaposed bracketed factor with its constant", () => {
    // Without the group the run stopped at "2π" and left "(7)" in the prose of a circumference line.
    expect(islands("44 ≈ 2π(7) is the circumference.")).toContain("44 ≈ 2π(7)");
  });

  it("admits π on either side of a slash", () => {
    // 409 rows: the fraction island required digits on both sides, so radian values — the subject of
    // the lessons they appear in — stayed prose.
    expect(islands("The peak sits at π/2.", false)).toContain("π/2");
    expect(islands("Between 3π/2 and 2π the sine is negative.", false)).toContain("3π/2");
    expect(islands("A quarter turn is 2π/4 = π/2 radians.", false)).toEqual(["2π/4", "π/2"]);
  });

  it("does not disturb ordinary fractions or hyphen ranges", () => {
    expect(islands("Compare 3/4 and 2/3.", false)).toEqual(["3/4", "2/3"]);
    expect(islands("Pages 10-12 tonight.", false)).toEqual([]);
  });

  it("leaves π alone when it is being used as a word", () => {
    expect(islands("A circle has radius 4. Before multiplying by π, what does it give?")).toEqual([]);
  });
});

describe("S242 — power shapes that used to orphan their exponent", () => {
  it("admits math symbols in the exponent", () => {
    // The exponent class was [A-Za-z0-9?+-], so "1^∞" matched no exponent and the whole thing
    // stayed prose — on a L'Hôpital lesson whose subject IS the indeterminate forms.
    expect(islands("1^∞ yields to logarithms")).toContain("1^∞");
  });

  it("prefers a variable-with-power over the bare number before it", () => {
    // Listed after the number branch, "3e^(x²)" matched just `3`: the run emitted `f = 3` and left
    // `e^(x²)` in the prose.
    expect(islands("f = 3e^(x²)")).toContain("f = 3e^(x²)");
    // A bare digit must still reach the number branch.
    expect(islands("Solve x + 3 = 10")).toContain("x + 3 = 10");
  });

  it("allows one level of nesting inside a parenthesised exponent", () => {
    // "2^(3 + (−1))" previously matched no exponent and rendered as literal "2^()" — a caret and
    // an empty pair of brackets, which is worse than leaving the whole thing alone.
    // S242 (later): the arithmetic run now carries powers, so the whole equation is ONE island
    // rather than three. That is the better outcome — the contract is that no caret survives into
    // the prose, which is asserted below and is what the learner actually experiences.
    const found = islands("2^3 · 2^-1 = 2^(3 + (−1)) = 2^2.");
    expect(found.join(" ")).toContain("2^(3 + (−1))");
    expect(prose("2^3 · 2^-1 = 2^(3 + (−1)) = 2^2.")).not.toContain("^(");
    expect(prose("2^3 · 2^-1 = 2^(3 + (−1)) = 2^2.")).not.toContain("2^()");
  });
});

describe("S242 / GEN-01 — two leaks the generated-side sweep found that no source scan could", () => {
  /* Both of these were invisible until `scripts/audit/generator-quality-sweep.mts` generated
   * 102,251 problems and read the strings the generators actually emit. Neither shape occurs in
   * authored lesson JSON at all — they are built at runtime from drawn values — so every previous
   * audit, all of which read source, was structurally incapable of seeing them. */

  it("an exponent may carry the authored minus sign U+2212, not only the ASCII hyphen", () => {
    // The exponent class was [A-Za-z0-9?π∞+-]: ASCII hyphen, no U+2212. Generators write the
    // typographic minus, so "1/81 = 3^−4" matched no exponent and the learner read a literal caret
    // on an exponent lesson — 12 occurrences, all on `exp-solve`, whose subject IS negative powers.
    expect(islands("1/81 = 3^−4, so x = −4.").join(" ")).toContain("3^−4");
    expect(prose("1/81 = 3^−4, so x = −4.")).not.toContain("^");
    expect(islands("(1/2)^−4 = 2^4 = 16, so x = −4, not 2.")).toContain("(1/2)^−4");
    // The ASCII form must keep working — this widened the class, it did not swap it.
    expect(islands("2^-1 is one half.")).toContain("2^-1");
  });

  it("a coefficient welded to sqrt( does not block the radical island", () => {
    // `\bsqrt` needs a word boundary, and there is none between "4" and "s". So "4sqrt(3)" matched
    // NOTHING — not the radical island, not the arithmetic run — and stayed raw. It is an mcq
    // option label on a simplify-the-radical question, so the learner chose between "4sqrt(3)" and
    // "2sqrt(3)" as literal text on the one question where the notation is the point.
    expect(islands("4sqrt(3)")).toEqual(["4sqrt(3)"]);
    expect(islands("Which is 2sqrt(3) or 4sqrt(3)?")).toEqual(["2sqrt(3)", "4sqrt(3)"]);
    expect(prose("4sqrt(3)")).not.toContain("sqrt");
  });

  it("the coefficient must not swallow the space in front of a bare radical", () => {
    // The first cut of the fix was `\d*\s*sqrt`, whose `\d*` matched nothing and whose `\s*` then
    // ate the preceding space: "Evaluate sqrt(4) * sqrt(4)." produced the island " sqrt(4)". An
    // island that carries leading whitespace re-flows the sentence around it.
    for (const island of islands("Evaluate sqrt(4) * sqrt(4).")) expect(island).toBe(island.trim());
    expect(islands("Evaluate sqrt(4) * sqrt(4).")).toEqual(["sqrt(4)", "sqrt(4)"]);
  });

  it("a power on a fraction's denominator stays with the fraction", () => {
    // The fraction island stopped at the denominator, so "1/6^3" was claimed as "1/6" and the
    // "^3" was left in the prose — a typeset one-sixth followed by a literal caret and a 3, on the
    // negative-exponent lesson whose whole content is 6^(-3) = 1/6^3.
    const text = "A negative exponent takes the reciprocal: 6^(-3) = 1/6^3 = 1/216.";
    expect(islands(text).join(" ")).toContain("1/6^3");
    expect(prose(text)).not.toContain("^");
    // A bare fraction is unchanged — the power is optional, not required.
    expect(islands("Compare 3/4 and 2/3.")).toEqual(["3/4", "2/3"]);
  });

  it("a letter before sqrt is still a word, not a coefficient", () => {
    // The lookbehind admits a digit and refuses a letter, so an English word ending in a letter
    // followed by "sqrt" cannot start a radical.
    expect(islands("asqrt(3)")).toEqual([]);
  });
});

describe("ARCH-01 — the S237 false-statement guard still holds", () => {
  // These are worse than a torn word: polished KaTeX asserting something untrue. The boundary
  // change must not reopen them.
  const falseTails: Array<[string, string]> = [
    ["Solve x^2 - x - 6 = 0 by factoring.", "6 = 0"],
    ["Solve x^2 - 2x - 8 = 0.", "8 = 0"]
  ];

  it.each(falseTails)("%s never emits the tail %s", (text, tail) => {
    expect(islands(text)).not.toContain(tail);
  });

  it("arithmetic that is simply false is still refused", () => {
    // isFalseNumericClaim: the tokenizer must not typeset a wrong equation as if it were fine.
    expect(islands("Some learners write 2 + 2 = 5 here.")).not.toContain("2 + 2 = 5");
  });
});
