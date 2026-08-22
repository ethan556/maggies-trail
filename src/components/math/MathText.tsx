"use client";
/**
 * Phase B — the §21 component pair: MathInline for math inside a sentence, MathDisplay for
 * standalone equations. These are the ONLY sanctioned math surfaces; UI numerals (XP, step
 * counts, scores) are ordinary text and must never route through here.
 *
 * Layout-shift contract: MathDisplay reserves height BEFORE KaTeX's stylesheet arrives, so
 * a lesson never reflows under the learner's finger. The reservation is em-based (KaTeX
 * display math sits ≈ 2.2em tall for a fraction), and the fallback text renders at the
 * same font size — worst case the swap is a font change, not a height change.
 *
 * Stage contract: colors inherit currentColor, so math is ink-on-light inside `.stage` in
 * BOTH themes — same rule every figure follows.
 *
 * Adoption status: Wave 4 wires authored power shorthand into lesson prose, prediction copy,
 * feedback, and widget prompts/options. KaTeX remains lazy: a lesson without authored math
 * tokens pays no renderer or stylesheet cost.
 */
import { Fragment, useEffect, useState } from "react";
import type { RenderedMath } from "@/lib/math/renderMath";
import { authoredMathParts } from "@/lib/math/authoredMath";

type Renderer = (tex: string, display: boolean) => RenderedMath;
let loaded: Renderer | null = null;
let loading: Promise<Renderer> | null = null;

function loadRenderer(): Promise<Renderer> {
  if (loaded) return Promise.resolve(loaded);
  loading ??= Promise.all([import("@/lib/math/renderMath"), import("katex/dist/katex.min.css" as string)]).then(
    ([m]) => (loaded = m.renderMath)
  );
  return loading;
}

function useMath(tex: string, display: boolean): RenderedMath | null {
  const [out, setOut] = useState<RenderedMath | null>(loaded ? loaded(tex, display) : null);
  useEffect(() => {
    let live = true;
    void loadRenderer().then((r) => { if (live) setOut(r(tex, display)); });
    return () => { live = false; };
  }, [tex, display]);
  return out;
}

/** No aria-label here, deliberately: renderMath emits MathML alongside the HTML
 * (output: "htmlAndMathml"), which screen readers speak as real mathematics. An aria-label
 * of the raw tex would OVERRIDE that MathML and read "\\frac{1}{2}" aloud — strictly worse.
 * The pre-load fallback shows the tex source to everyone for the moment before the
 * renderer arrives; the swap replaces it with self-describing KaTeX markup. */
export function MathInline({ tex, fallback = "mathematical expression" }: { tex: string; fallback?: string }) {
  const out = useMath(tex, false);
  if (!out) return <span className="math-inline">{fallback}</span>;
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: out.html }} />;
}

/** The lazy renderer must never flash authoring syntax. This is deliberately
 * plain-language rather than a second visual maths renderer: KaTeX replaces it
 * as soon as the shared module arrives, while slow devices still see an honest
 * caret-free expression. */
function visibleMathFallback(source: string): string {
  return source
    .replaceAll("^", " raised to ")
    .replaceAll("_", " subscript ")
    .replace(/\s{2,}/g, " ");
}

function mathParts(text: string, includeArithmetic: boolean, keyPrefix: string) {
  return authoredMathParts(text, { includeArithmetic }).map((part, index) => (
    part.tex
      ? <span key={`${keyPrefix}${index}`}><MathInline tex={part.tex} fallback={visibleMathFallback(part.source ?? part.tex)} />{part.text}</span>
      : part.text
  ));
}

/* S242. ITALICS, AND WHY THE RULE IS THE CAREFUL PART.
 *
 * `*emphasis*` was reaching the screen with its asterisks: both renderers split on `**` and
 * nothing handled a single one. 138 authored strings are affected — "A word like *then* or
 * *after* points to order", "*more* does not always mean add" — and in every one the emphasis is
 * doing real instructional work, marking the keyword the sentence is about.
 *
 * The reason it was never fixed by simply splitting on `*` is that THE SAME CHARACTER IS
 * MULTIPLICATION in this corpus: "For f(x) = 5 * 3^x, what is f(2)?". Split naively and that
 * prompt becomes "For f(x) = 5 " + italic " 3^x, what is f(2)?" with the asterisks eaten — a
 * silently wrong equation, which is far worse than a visible asterisk.
 *
 * So an italic run must be evidence of emphasis rather than a guess:
 *   · the opening `*` is not preceded by a letter or digit  → "2*3*4" and "a*b*c" cannot start one
 *   · the opening `*` is not followed by whitespace          → "5 * 3^x" cannot start one
 *   · the closing `*` is not preceded by whitespace          → an unclosed run cannot swallow a line
 *   · the closing `*` is not followed by a letter or digit
 *   · the content holds no `*` and no newline                → runs cannot nest or straddle lines
 * Measured against the whole corpus plus a sample from every generator: 223 strings carry a single
 * asterisk after bold is removed; 138 match this rule and every one is emphasis; 85 do not match
 * and every one is multiplication. No string falls on the wrong side.
 *
 * Bold is split FIRST so `**a *b* c**` works, and the math tokenizer runs inside every leaf so
 * `**8 × 3**` and `*x^2*` still typeset. Text with no emphasis at all — the overwhelming majority
 * of callers — keeps the original fast path and its exact output, no extra wrapping element. */
const ITALIC_RUN = /(?<![A-Za-z0-9])\*(?![\s*])([^*\n]*?)(?<![\s*])\*(?![A-Za-z0-9])/g;

const SPOKEN_SUPERSCRIPT: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁺": "plus", "⁻": "minus", "ⁿ": "n", "ˣ": "x",
};

const SPOKEN_SUBSCRIPT: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

function scriptRun(source: string, map: Record<string, string>): string {
  return Array.from(source, (character) => map[character] ?? character).join(" ");
}

function naturalizeMathSyntax(source: string): string {
  return source
    .replace(/\^\(([^()]*)\)/g, " raised to the quantity $1")
    .replace(/\^\{([^{}]*)\}/g, " raised to $1")
    .replace(/\^([?A-Za-z0-9π∞+−-]+)/g, " raised to $1")
    .replace(/[⁰¹²³⁴-⁹⁺⁻ⁿˣ]+/g, (run) => {
      if (run === "²") return " squared";
      if (run === "³") return " cubed";
      return ` raised to ${scriptRun(run, SPOKEN_SUPERSCRIPT)}`;
    })
    .replace(/[₀-₉]+/g, (run) => ` subscript ${scriptRun(run, SPOKEN_SUBSCRIPT)}`)
    .replaceAll("sqrt(", "square root of (")
    .replaceAll("sqrt", "square root of")
    .replaceAll("√", " square root of ")
    .replaceAll("π", " pi ")
    .replaceAll("θ", " theta ")
    .replaceAll("∑", " sum ")
    .replaceAll("∫", " integral ")
    .replaceAll("×", " times ")
    .replaceAll("*", " times ")
    .replaceAll("÷", " divided by ")
    .replaceAll("/", " divided by ")
    .replaceAll("−", " minus ")
    .replaceAll("≤", " less than or equal to ")
    .replaceAll("≥", " greater than or equal to ")
    .replaceAll("≠", " not equal to ")
    .replaceAll("=", " equals ");
}

/**
 * Plain-language equivalent for places where HTML/MathML cannot be used, such
 * as an accessible name. Visual mathematics belongs in KaTeX; ARIA belongs in
 * natural language. In particular, never make a screen reader announce the
 * authoring caret in `3^x` or the markdown markers around emphasized words.
 */
export function accessibleMathText(text: string): string {
  const spoken = authoredMathParts(text, { includeArithmetic: true }).map((part) => {
    if (!part.tex) return part.text;
    return naturalizeMathSyntax(part.source ?? part.tex);
  }).join("");

  const withoutMarkup = spoken.replaceAll("**", "").replace(ITALIC_RUN, "$1");
  return naturalizeMathSyntax(withoutMarkup)
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

/** Split one bold-free segment into italic and plain runs, in order. */
function italicRuns(segment: string): Array<{ text: string; italic: boolean }> {
  const runs: Array<{ text: string; italic: boolean }> = [];
  let cursor = 0;
  for (const match of segment.matchAll(ITALIC_RUN)) {
    const start = match.index ?? 0;
    if (start > cursor) runs.push({ text: segment.slice(cursor, start), italic: false });
    runs.push({ text: match[1], italic: true });
    cursor = start + match[0].length;
  }
  if (cursor < segment.length) runs.push({ text: segment.slice(cursor), italic: false });
  return runs;
}

/** Mixed prose + authored power shorthand. Only the power tokens are sent to
 * KaTeX; surrounding words and punctuation retain normal wrapping and speech.
 *
 * Bold: authors write `**word**` the same way they do in step `body` text (see the `Rich`
 * component in playerChrome.tsx, the original home of this convention). `body` text and
 * `MathProse` text used to diverge here — `**or**` inside a widget prompt rendered as literal
 * asterisks, since only `Rich` split on them. Fixed by splitting first (odd segments bold),
 * then running the SAME math tokenizer over every segment, so `**8 × 3**` still gets its math
 * treatment inside the bold. */
export function MathProse({ text, includeArithmetic = false }: { text: string; includeArithmetic?: boolean }) {
  const hasBold = text.includes("**");
  if (!hasBold) {
    const runs = italicRuns(text);
    if (runs.length === 1 && !runs[0].italic) return <>{mathParts(text, includeArithmetic, "m")}</>;
    return <>{runs.map((run, ri) =>
      run.italic
        ? <em key={ri}>{mathParts(run.text, includeArithmetic, `m${ri}-`)}</em>
        : <Fragment key={ri}>{mathParts(run.text, includeArithmetic, `m${ri}-`)}</Fragment>
    )}</>;
  }
  const segments = text.split("**");
  return <>{segments.map((seg, si) => {
    const inner = italicRuns(seg).map((run, ri) =>
      run.italic
        ? <em key={ri}>{mathParts(run.text, includeArithmetic, `${si}-${ri}-`)}</em>
        : <Fragment key={ri}>{mathParts(run.text, includeArithmetic, `${si}-${ri}-`)}</Fragment>
    );
    return si % 2 === 1 ? <strong key={si}>{inner}</strong> : <Fragment key={si}>{inner}</Fragment>;
  })}</>;
}

export function MathDisplay({ tex }: { tex: string }) {
  const out = useMath(tex, true);
  return (
    <div className="math-display" style={{ minHeight: "2.6em" }} aria-busy={!out || undefined}>
      {out ? <span dangerouslySetInnerHTML={{ __html: out.html }} /> : <span aria-hidden="true">&nbsp;</span>}
    </div>
  );
}
