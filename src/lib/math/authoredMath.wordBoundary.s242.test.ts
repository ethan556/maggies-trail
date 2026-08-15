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
    const found = islands("2^3 · 2^-1 = 2^(3 + (−1)) = 2^2.");
    expect(found).toContain("2^(3 + (−1))");
    expect(prose("2^3 · 2^-1 = 2^(3 + (−1)) = 2^2.")).not.toContain("^(");
    expect(prose("2^3 · 2^-1 = 2^(3 + (−1)) = 2^2.")).not.toContain("2^()");
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
