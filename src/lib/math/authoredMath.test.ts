import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { authoredMathParts, powerShorthandToTex } from "./authoredMath";
import { renderMath } from "./renderMath";

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

  it("recognizes fractions, roots, and authored Unicode-script expressions", () => {
    const parts = authoredMathParts("Compare 1/2 × 8 = 4, sqrt(9), √(−36), and (2⁴)².", { includeArithmetic: true });
    expect(parts.filter((part) => part.tex).map((part) => part.tex)).toEqual([
      "\\frac{1}{2} \\times  8 = 4",
      "\\sqrt{9}",
      "\\sqrt{-36}",
      "(2^{4})^{2}"
    ]);
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

/**
 * WS-G §2.2 — integral / summation / limit shorthand.
 *
 * Every `source` below is a verbatim authored string from the Calc band (`integration-*`,
 * `limits-continuity`, `sequences-series`, `series-convergence`, `parametric-polar-calculus`),
 * not an invented shape. The file it came from is named where the shape is unusual.
 */
describe("WS-G calculus shorthand — integrals", () => {
  it("converts the definite, indefinite and mixed-bound forms the corpus authors", () => {
    for (const [source, tex] of [
      // in-05-01 / in-04-03: Unicode sub+superscript bounds, ASCII differential.
      ["∫₀¹ x⁵ dx", "\\int_{0}^{1} x^{5}\\,dx"],
      ["∫ x³ dx", "\\int x^{3}\\,dx"],
      ["∫ₐᵇ f(x) dx", "\\int_{a}^{b} f(x)\\,dx"],
      ["∫₀ˣ 2t dt", "\\int_{0}^{x} 2t\\,dt"],
      // in-05-02: a superscript bound too big for one glyph is authored with a caret or braces.
      ["∫₀^(π/2) cos x dx", "\\int_{0}^{π/2} \\cos x\\,dx"],
      ["∫₁^e (1/x) dx", "\\int_{1}^{e} (1/x)\\,dx"],
      ["∫₀^(x²) t³ dt", "\\int_{0}^{x^{2}} t^{3}\\,dt"],
      ["∫ₐ^(g(x)) f(t) dt", "\\int_{a}^{g(x)} f(t)\\,dt"],
      ["∫₀^{2π} ½(4) dθ", "\\int_{0}^{2π} \\frac{1}{2}(4)\\,dθ"],
      // in-01-03: bounds with no integrand at all, and an integrand with no differential.
      ["∫₁³ f", "\\int_{1}^{3} f"],
      ["∫₄¹", "\\int_{4}^{1}"],
      ["∫ |v| dt", "\\int |v|\\,dt"],
      // in-05-03 / pc-02-01: a coefficient in front belongs to the integral.
      ["π∫₀¹ x⁴ dx", "π\\int_{0}^{1} x^{4}\\,dx"],
      ["(1/2)∫₁² u³ du", "(\\frac{1}{2})\\int_{1}^{2} u^{3}\\,du"],
      ["∫½r²dθ", "\\int \\frac{1}{2}r^{2}\\,dθ"],
      // pc-01-02: only the differential that CLOSES the integrand is spaced.
      /* S242 / MPB-05, ruled 2026-08-15. This fixture asserted the slash form — `(dx/dt)^{2}` —
       * because before the ruling nothing recognised Leibniz notation and the arc-length integrand
       * reached the screen with its derivatives in body type. The ruling is that they stack, so the
       * expectation is updated rather than the behaviour: it now demands MORE of the output (a
       * fraction, and parentheses sized to it), not less. */
      [
        "∫ √((dx/dt)² + (dy/dt)²) dt",
        "\\int \\sqrt{\\left(\\frac{dx}{dt}\\right)^{2} + \\left(\\frac{dy}{dt}\\right)^{2}}\\,dt"
      ],
      // in-04-01: substitution rewrites the bounds as `x=a`, using real Unicode subscripts.
      ["∫ₓ₌ₐ^(x=b)", "\\int_{x=a}^{x=b}"],
      ["∫ᵤ₌ᵤ₍ₐ₎^(u=u(b))", "\\int_{u=u(a)}^{u=u(b)}"]
    ] as const) {
      expect(powerShorthandToTex(source), source).toBe(tex);
    }
  });

  it("keeps a chain of integrals in one island instead of one per operator", () => {
    // in-01-03. Two of these three sit immediately after an `=`, where S237's boundary guard
    // discards an ARITHMETIC candidate — an explicit operator island must survive it.
    expect(authoredMathParts("∫₁⁴ = ∫₁³ + ∫₃⁴ = 4 + (−2) = 2", { includeArithmetic: true })).toEqual([
      {
        text: "",
        source: "∫₁⁴ = ∫₁³ + ∫₃⁴ = 4 + (−2) = 2",
        tex: "\\int_{1}^{4} = \\int_{1}^{3} + \\int_{3}^{4} = 4 + (-2) = 2"
      }
    ]);
  });

  it("outranks the arithmetic scanner even when that scanner starts further left", () => {
    // ia-03-01 / dr-01-01. Overlaps are normally won by whichever candidate starts earlier, and
    // in arithmetic mode the speculative scanner starts one character to the left of both of
    // these — producing "g = (1/3)" and "(x) = l", i.e. an `l` torn out of `lim` and an `x` out
    // of `dx`. An explicit operator symbol has to beat a guess assembled from single letters.
    expect(authoredMathParts("f_avg = (1/3)∫₀³ x² dx = 9/3 = 3.", { includeArithmetic: true })).toEqual([
      { text: "f_avg = " },
      {
        text: "",
        source: "(1/3)∫₀³ x² dx = 9/3 = 3",
        tex: "(\\frac{1}{3})\\int_{0}^{3} x^{2}\\,dx = \\frac{9}{3} = 3"
      },
      { text: "." }
    ]);
    const quotient = authoredMathParts(
      "f′(x) = lim(h→0) [f(x+h) − f(x)]/h — and the cancellation must happen before h reaches 0.",
      { includeArithmetic: true }
    );
    expect(quotient.filter((part) => part.tex).map((part) => part.source)).toEqual(["lim(h→0) [f(x+h) − f(x)]/h"]);
  });

  it("stops the integrand at prose rather than typesetting the sentence", () => {
    expect(authoredMathParts("Compute ∫₀¹ x⁵ dx.")).toEqual([
      { text: "Compute " },
      { text: "", source: "∫₀¹ x⁵ dx", tex: "\\int_{0}^{1} x^{5}\\,dx" },
      { text: "." }
    ]);
    // in-01-02. The baseline scanner cut "x = l" out of "dx = limit" and typeset it as an
    // equation; the integral island now claims `dx` and the word stays prose.
    const riemann = authoredMathParts(
      "So the definite integral is defined as ∫ₐᵇ f(x) dx = limit of the Riemann sums as n → ∞",
      { includeArithmetic: true }
    );
    expect(riemann.filter((part) => part.tex).map((part) => part.source)).toEqual(["∫ₐᵇ f(x) dx", "∞"]);
  });
});

describe("WS-G calculus shorthand — summations", () => {
  it("converts every bound shape the corpus authors, including the incomplete one", () => {
    for (const [source, tex] of [
      // sr-02-01 / sr-02-02: bounds written as prose, body after `of`.
      ["Σ from k = 1 to 5 of (2k + 1)", "\\sum_{k=1}^{5} (2k + 1)"],
      ["Σ from k = 1 to 4 of 3", "\\sum_{k=1}^{4} 3"],
      ["Σ from k = 0 to 3 of 2ᵏ", "\\sum_{k=0}^{3} 2^{k}"],
      ["Σ from k = 1 to 6 of 3·2ᵏ⁻¹", "\\sum_{k=1}^{6} 3\\cdot 2^{k-1}"],
      // sr-02-03: bounds only — the lesson asks how many terms the sum has.
      ["Σ from k = 3 to 11", "\\sum_{k=3}^{11}"],
      ["Σ from i = 1 to n", "\\sum_{i=1}^{n}"],
      // sr-02-01: NO upper bound — the question is "what upper bound does it need?", so the
      // missing bound is the point of the item and must survive conversion.
      ["Σ from k = 1 of 3k", "\\sum_{k=1} 3k"],
      // exact-practice-certification: the body is authored BEFORE the bounds.
      ["Σ k from k=0 to 3", "\\sum_{k=0}^{3} k"],
      ["Σ k for k=2 to 7", "\\sum_{k=2}^{7} k"],
      // sc-01-02 / sc-02-02: unbounded series notation.
      ["Σ1/n²", "\\sum 1/n^{2}"],
      ["Σ xⁿ/2ⁿ", "\\sum x^{n}/2^{n}"],
      ["Σ 1/(n² + 1)", "\\sum 1/(n^{2} + 1)"]
    ] as const) {
      expect(powerShorthandToTex(source), source).toBe(tex);
    }
  });

  it("does not run one summation into the next", () => {
    expect(authoredMathParts("So Σ1/n² converges and Σ1/n diverges.")).toEqual([
      { text: "So " },
      { text: "", source: "Σ1/n²", tex: "\\sum 1/n^{2}" },
      { text: " converges and " },
      { text: "", source: "Σ1/n", tex: "\\sum 1/n" },
      { text: " diverges." }
    ]);
  });
});

describe("WS-G calculus shorthand — limits", () => {
  it("converts two-sided, one-sided, infinite and operator-free forms", () => {
    for (const [source, tex] of [
      // lc-02-01 / lc-01-01.
      ["lim(x→2) (x² − 4)/(x − 2)", "\\lim_{x \\to 2} (x^{2} - 4)/(x - 2)"],
      ["lim(x→1)(2x + 3)", "\\lim_{x \\to 1}(2x + 3)"],
      ["lim(x→a) f(x) = L", "\\lim_{x \\to a} f(x) = L"],
      // lc-02-03: the sign is a Unicode superscript on the approach value.
      ["lim(x→0⁺) x·ln x", "\\lim_{x \\to 0^{+}} x\\cdot \\ln x"],
      ["lim(x→4⁻)", "\\lim_{x \\to 4^{-}}"],
      // lc-03-01: →∞.
      ["lim(x→∞) x/eˣ", "\\lim_{x \\to \\infty} x/e^{x}"],
      ["lim(x→∞) (5x³ − 2)/(2x³ + x)", "\\lim_{x \\to \\infty} (5x^{3} - 2)/(2x^{3} + x)"],
      // dc-04-01: the difference quotient.
      ["lim(h→0) [f(x+h) − f(x)]/h", "\\lim_{h \\to 0} [f(x+h) - f(x)]/h"],
      // lc-01-03: the limit laws, where the parenthesis is the BODY and not an approach.
      ["lim(f + g) = lim f + lim g", "\\lim (f + g) = \\lim f + \\lim g"],
      ["lim f/g = lim f′/g′", "\\lim f/g = \\lim f'/g'"]
    ] as const) {
      expect(powerShorthandToTex(source), source).toBe(tex);
    }
  });

  it("carries the value a one-sided limit equals into the same island", () => {
    expect(authoredMathParts("With lim(x→2⁻) = 3 and lim(x→2⁺) = 4, the two-sided lim(x→2) f(x):")).toEqual([
      { text: "With " },
      { text: "", source: "lim(x→2⁻) = 3", tex: "\\lim_{x \\to 2^{-}} = 3" },
      { text: " and " },
      { text: "", source: "lim(x→2⁺) = 4", tex: "\\lim_{x \\to 2^{+}} = 4" },
      { text: ", the two-sided " },
      { text: "", source: "lim(x→2) f(x)", tex: "\\lim_{x \\to 2} f(x)" },
      { text: ":" }
    ]);
  });
});

describe("WS-G calculus shorthand — what it refuses", () => {
  it("renders the operator glyph but refuses an arbitrary English integrand", () => {
    // The universal glyph policy renders the explicit integral sign, while the conservative
    // calculus grammar still refuses to turn the neighbouring English words into variables.
    expect(authoredMathParts(
      "The model writes ∫ total distance dt.",
    ).filter((part) => part.tex).map((part) => part.source)).toEqual(["∫"]);
    expect(authoredMathParts(
      "How many terms does Σ from k = 3 to 11 of (anything) have?",
    ).filter((part) => part.tex)).toEqual([]);
  });

  it("still converts a single-letter operand — the guard rejects words, not variables", () => {
    // in-02-03 authors both shapes in one lesson: `∫ (rate) dt` is prose, `∫ r dt` is an integral.
    expect(authoredMathParts("What are the units of ∫ r dt?")).toEqual([
      { text: "What are the units of " },
      { text: "", source: "∫ r dt", tex: "\\int r\\,dt" },
      { text: "?" }
    ]);
  });

  it("renders an explicit operator glyph while leaving a spelled-out operator as prose", () => {
    expect(authoredMathParts("The ∫ is a stretched S for 'sum'.")).toEqual([
      { text: "The " },
      { text: "", source: "∫", tex: "\\int " },
      { text: " is a stretched S for 'sum'." },
    ]);
    const prose = "If lim from the left is 1 and lim from the right is 3";
    expect(authoredMathParts(prose)).toEqual([{ text: prose }]);
  });

  it("normalises the two corpus-proven legacy lower-bound glyphs only after an integral", () => {
    // in-01-03 is the sole corpus source of modifier beta and the tone letter. Unicode has no
    // Latin subscript b or c; inside this exact integral-bound position the adjoining equations
    // prove the intended bound, so the renderer repairs them without admitting general aliases.
    const parts = authoredMathParts("∫ₐᵇ f = −∫ᵦᵃ f (running backwards flips the sign)");
    expect(parts.filter((part) => part.tex).map((part) => part.source)).toEqual(["∫ₐᵇ f", "∫ᵦᵃ f"]);
    expect(parts.filter((part) => part.tex).map((part) => part.tex)).toEqual([
      "\\int_{a}^{b} f",
      "\\int_{b}^{a} f"
    ]);
    expect(powerShorthandToTex("∫꜀ᵇ f")).toBe("\\int_{c}^{b} f");
  });

  it("never lets an island cross a newline", () => {
    // in-05-02 lists four antiderivatives one per line; one island per line, breaks preserved.
    expect(authoredMathParts("∫ eˣ dx = eˣ + C\n∫ cos x dx = sin x + C")).toEqual([
      { text: "", source: "∫ eˣ dx = eˣ + C", tex: "\\int e^{x}\\,dx = e^{x} + C" },
      { text: "\n" },
      { text: "", source: "∫ cos x dx = sin x + C", tex: "\\int \\cos x\\,dx = \\sin x + C" }
    ]);
  });

  it("does not swallow a bare letter that follows the integrand across a space", () => {
    // Synthetic, unlike the rest of this file: it pins the juxtaposition restriction directly,
    // because the corpus shape that would expose it has simply not been authored yet.
    const parts = authoredMathParts("Evaluate ∫ f dx I think, then check.");
    expect(parts.filter((part) => part.tex).map((part) => part.source)).toEqual(["∫ f dx"]);
  });
});

/* ── Corpus gates ──────────────────────────────────────────────────────────── */

const calcBandStrings = (() => {
  const withOperator: string[] = [];
  const withoutOperator: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { walk(path); continue; }
      if (!entry.name.endsWith(".json")) continue;
      const raw = readFileSync(path, "utf8");
      if (!/∫|Σ|∑|lim/.test(raw)) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(raw); } catch { continue; }
      (function visit(value: unknown): void {
        if (typeof value === "string") (/[∫Σ∑]|\blim\b/.test(value) ? withOperator : withoutOperator).push(value);
        else if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") Object.values(value).forEach(visit);
      })(parsed);
    }
  };
  walk("content/courses");
  return { withOperator, withoutOperator };
})();

describe("WS-G calculus shorthand over the authored Calc band", () => {
  it("the corpus sample is real and large", () => {
    // Guards against a silent read failure making every assertion below pass vacuously.
    expect(calcBandStrings.withOperator.length).toBeGreaterThan(300);
    expect(calcBandStrings.withoutOperator.length).toBeGreaterThan(1000);
  });

  it("every island it emits parses through the sanctioned renderer", () => {
    const broken: string[] = [];
    for (const text of calcBandStrings.withOperator) {
      for (const mode of [{}, { includeArithmetic: true }]) {
        for (const part of authoredMathParts(text, mode)) {
          if (!part.tex || !/[∫Σ∑]|\blim\b/.test(part.source ?? "")) continue;
          const { error } = renderMath(part.tex, false);
          if (error) broken.push(`${part.source} -> ${part.tex}: ${error}`);
        }
      }
    }
    expect(broken.slice(0, 10)).toEqual([]);
  });

  it("emits no Unicode the renderer cannot typeset", () => {
    // KaTeX accepts π, θ and ∞ natively but has no glyph metrics for ∫, Σ, ½, ′ or a Unicode
    // script character: those must all have been converted, not passed through.
    const UNCONVERTED = /[∫Σ∑½′⁰-⁹²³¹₀-₉ₐ-ₜᵢ-ᵥˣⁿᵃᵇᶜᵏᵖ]/;
    const leaked: string[] = [];
    for (const text of calcBandStrings.withOperator) {
      for (const part of authoredMathParts(text, { includeArithmetic: true })) {
        if (part.tex && UNCONVERTED.test(part.tex)) leaked.push(`${part.source} -> ${part.tex}`);
      }
    }
    expect(leaked.slice(0, 10)).toEqual([]);
  });

  it("is lossless: the parts always reassemble into the authored string, island by island", () => {
    const lossy: string[] = [];
    for (const text of [...calcBandStrings.withOperator, ...calcBandStrings.withoutOperator]) {
      for (const mode of [{}, { includeArithmetic: true }]) {
        const parts = authoredMathParts(text, mode);
        const rebuilt = parts.map((part) => (part.tex ? part.source ?? "" : part.text)).join("");
        if (rebuilt !== text) lossy.push(text.slice(0, 120));
        if (parts.some((part) => part.tex && part.source?.includes("\n"))) lossy.push(`MULTILINE: ${text.slice(0, 120)}`);
      }
    }
    expect(lossy.slice(0, 5)).toEqual([]);
    /* S242. BUDGET ONLY — the assertion above is untouched. This walks the whole Calc band twice,
     * once per option set, and measures 4,939 ms on an idle machine against vitest's 5,000 ms
     * default: it fails as a TIMEOUT under any concurrent load, which is how it went red in a
     * sharded run while passing in isolation. A test that flips on machine load teaches nothing
     * except to distrust the suite. Verified not to be a regression by stashing the session's
     * changes and reproducing on a clean tree. */
  }, 30_000);

  it("NON-REGRESSION: the calculus patterns never fire on a row without a calculus operator", () => {
    // The highest-risk population for a false positive is prose sitting in the SAME lessons as
    // real notation. None of it may acquire an \int, \sum or \lim it did not author.
    const fired: string[] = [];
    for (const text of calcBandStrings.withoutOperator) {
      for (const mode of [{}, { includeArithmetic: true }]) {
        for (const part of authoredMathParts(text, mode)) {
          if (part.tex && /\\(?:int|sum|lim)\b/.test(part.tex)) fired.push(`${part.source} <= ${text.slice(0, 90)}`);
        }
      }
    }
    expect(fired.slice(0, 10)).toEqual([]);
    // S242. Budget only, same reason as the lossless walk above: 4,669 ms idle against a 5,000 ms
    // default. Nothing about what it checks has changed.
  }, 30_000);
});
