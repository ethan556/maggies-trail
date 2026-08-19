/**
 * Canonical authored-math boundary.
 *
 * Course JSON stays readable for authors (`x^2`, `1/2`, `sqrt(9)`) while this
 * module identifies only explicit mathematical notation and converts it to
 * TeX for the single sanctioned KaTeX renderer. Prose is deliberately left
 * alone: a year, URL, or slash-separated word must never become mathematics.
 */
export interface AuthoredMathPart {
  /** Plain prose following this part. Math parts normally leave this empty. */
  text: string;
  /** TeX sent to the renderer when this is a math part. */
  tex?: string;
  /** Readable authoring source shown during the lazy renderer load. */
  source?: string;
}

interface Match {
  start: number;
  end: number;
  source: string;
}

const SUPERSCRIPT: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "-",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  // WS-G. The Calc band writes eˣ, xⁿ, 2ᵏ, Σ1/nᵖ and — load-bearing for §2.2 — carries an
  // integral's upper bound as a superscript letter (∫ₐᵇ, ∫₀ˣ). Only GENUINE Unicode
  // superscripts are listed; see STRAY_SCRIPT for what happens to the improvised ones.
  ᵃ: "a",
  ᵇ: "b",
  ᶜ: "c",
  ᵈ: "d",
  ᵉ: "e",
  ᶠ: "f",
  ᵍ: "g",
  ʰ: "h",
  ⁱ: "i",
  ʲ: "j",
  ᵏ: "k",
  ˡ: "l",
  ᵐ: "m",
  ⁿ: "n",
  ᵒ: "o",
  ᵖ: "p",
  ʳ: "r",
  ˢ: "s",
  ᵗ: "t",
  ᵘ: "u",
  ᵛ: "v",
  ʷ: "w",
  ˣ: "x",
  ʸ: "y",
  ᶻ: "z",
};

/** The subscript mirror. Lower bounds (∫₀, ∫ₐ, Σ) and indices (xᵢ, xᵢ₊₁) live here. */
const SUBSCRIPT: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  "₊": "+",
  "₋": "-",
  "₌": "=",
  "₍": "(",
  "₎": ")",
  ₐ: "a",
  ₑ: "e",
  ₕ: "h",
  ᵢ: "i",
  ⱼ: "j",
  ₖ: "k",
  ₗ: "l",
  ₘ: "m",
  ₙ: "n",
  ₒ: "o",
  ₚ: "p",
  ᵣ: "r",
  ₛ: "s",
  ₜ: "t",
  ᵤ: "u",
  ᵥ: "v",
  ₓ: "x",
};

const SUPERSCRIPT_RUN = new RegExp(
  `[${Object.keys(SUPERSCRIPT).join("")}]+`,
  "g",
);
const SUBSCRIPT_RUN = new RegExp(`[${Object.keys(SUBSCRIPT).join("")}]+`, "g");

function superscriptToTex(source: string): string {
  return source.replace(
    SUPERSCRIPT_RUN,
    (run) =>
      `^{${Array.from(run, (character) => SUPERSCRIPT[character] ?? character).join("")}}`,
  );
}

function subscriptToTex(source: string): string {
  return source.replace(
    SUBSCRIPT_RUN,
    (run) =>
      `_{${Array.from(run, (character) => SUBSCRIPT[character] ?? character).join("")}}`,
  );
}

/* ── Calculus operator shorthand: ∫ / Σ / lim ─────────────────────────────────
 *
 * WS-G §2.2. The Calc band authors integrals, sums and limits as literal Unicode
 * (`∫₀² x² dx`, `Σ from k = 1 to 5 of (2k + 1)`, `lim(x→0⁺) x·ln x`) and they shipped as
 * prose because nothing here recognised them. The shapes below are taken from the authored
 * corpus, not invented: every fragment quoted in a comment is a real content string.
 *
 * The extent rules are as conservative as the rest of this file. An island is a run of math
 * ATOMS hanging off the operator; the run ends at the first thing that is not one, so the
 * sentence around it stays prose. Two guards then drop islands the scanner should not have
 * started (`hasProseWord`, and the bare-operator check in `calculusMatches`).
 */

/** Everything that LOOKS like a script. Bounds consume the supported ones; a leftover is fatal. */
const STRAY_SCRIPT =
  "\\u00B2\\u00B3\\u00B9\\u2070-\\u209C\\u02B0-\\u02FF\\u1D2C-\\u1DBF\\uA700-\\uA707\\u2C7C";

const SUP_CHARS = `[${Object.keys(SUPERSCRIPT).join("")}]+`;
const SUB_CHARS = `[${Object.keys(SUBSCRIPT).join("")}]+`;
/* Two legacy glyphs occur only as lower bounds in one authored integral-properties lesson.
 * Unicode has no Latin subscript b or c, so the source used modifier beta (ᵦ) and a tone letter
 * (꜀). They are admitted ONLY immediately after ∫ and normalised below; they never become general
 * subscript letters or arithmetic atoms. */
const LEGACY_INTEGRAL_SUB_CHARS = "[ᵦ꜀]";
const INTEGRAL_SUB_CHARS = `(?:${SUB_CHARS}|${LEGACY_INTEGRAL_SUB_CHARS})`;
/** A space or tab — never a newline: an island that spanned lines would eat the authored break. */
const GAP = "[ \\t]";
const PAREN = String.raw`\((?:[^()\n]|\([^()\n]*\))*\)`;
const BRACKET = String.raw`\[(?:[^[\]\n]|\[[^[\]\n]*\])*\]`;
const BARS = String.raw`\|[^|\n]+\|`;
/** A caret power, a brace power (`∫₀^{2π}` is authored that way), or a Unicode superscript run. */
const POWER = `(?:${SUP_CHARS}|\\^\\{[^{}\\n]*\\}|\\^${PAREN}|\\^(?:[?]|[A-Za-z0-9π∞+−-]+))`;
const SCRIPTS = `(?:${SUB_CHARS})?(?:${POWER})?`;
/** A single authored variable or numeral carrying a real Unicode/TeX script. Requiring the script
 * and hard word boundaries makes this safe on arithmetic-off surfaces without guessing at prose. */
const SCRIPTED_ATOM = `(?<![A-Za-z0-9])(?:[A-Za-z0-9θαβγλμσΔΩπ])(?:${SUB_CHARS}(?:${POWER})?|${POWER})(?![A-Za-z])`;
/** A conservative algebraic numerator over a literal numeric denominator. This closes forms such
 * as `(x³ + 1)⁶/18` and `3x²/18` without admitting dates, URLs, or word/word slashes. */
const ALGEBRAIC_VALUE = `(?:${PAREN}(?:${SCRIPTS})?|[A-Za-zπθ](?:${SCRIPTS})?)`;
const ALGEBRAIC_FACTOR = `(?:\\d+(?:\\.\\d+)?)?${ALGEBRAIC_VALUE}`;
const ALGEBRAIC_NUMERATOR = `${ALGEBRAIC_FACTOR}(?:\\s*[·×*]\\s*${ALGEBRAIC_FACTOR})*`;
const ALGEBRAIC_FRACTION = `(?<![\\w/])(${ALGEBRAIC_NUMERATOR})\\s*\\/\\s*(\\d+(?:\\.\\d+)?)(?![\\w/])`;
/** `∫` plus its bounds — an atom in its own right, so `∫₀² + ∫₂⁵ = ∫₀⁵` is one island. */
const INTEGRAL_OP = `∫(?:${INTEGRAL_SUB_CHARS})?(?:${POWER})?(?![${STRAY_SCRIPT}])`;
/** Function names that become a TeX command verbatim. `sqrt`/`lim` have their own rules below. */
const TEX_FUNCTIONS =
  "arcsin|arccos|arctan|sinh|cosh|tanh|sin|cos|tan|sec|csc|cot|log|ln|exp";
const FUNCTION_NAMES = `${TEX_FUNCTIONS}|sqrt|lim`;
/* π is a constant, not a Latin word character. Keeping it outside the word-boundary branch lets
 * an integral claim ordinary juxtaposition such as `∫πf² dx` without weakening the protection
 * that stops a single ASCII letter being torn out of prose. */
const NAME = `(?:[A-Za-zθ]′?(?![A-Za-z])|π)`;
/** A named function carries its argument, so `cos x dx` does not need bare-letter juxtaposition. */
const FUNCTION = `(?:${FUNCTION_NAMES})(?![A-Za-z])(?:${GAP}*(?:${PAREN}|${BARS}|${NAME}${SCRIPTS}))?`;
/** `dx`, `dt`, `du`, `dy`, `dθ` — the only two-letter runs the corpus's integrands contain. */
const DIFFERENTIAL = String.raw`d[A-Za-zθ](?![A-Za-z])`;

/* S245 / MATH_FRACTION_DISPLAY_INDEX. These are the radical-bearing rational forms authored by
 * the curriculum (`5√5/5`, `6/√3`, `4/(2√2)`). A bare numeric fraction already has a deliberately
 * conservative path below; requiring √ on at least one side keeps URLs, dates and prose slashes
 * outside this always-on island while allowing the whole mathematical quantity to render as one
 * accessible stacked fraction instead of three disconnected islands. */
const RADICAL_SOURCE = String.raw`√(?:\((?:[^()\n]|\([^()\n]*\))*\)|\|[^|\n]+\||[A-Za-z0-9]+)`;
const RADICAL_NUMBER = String.raw`\d+(?:\.\d+)?`;
const RADICAL_FACTOR = String.raw`(?:${RADICAL_NUMBER})?${RADICAL_SOURCE}`;
const RADICAL_FRACTION_TERM = String.raw`(?:\(${RADICAL_FACTOR}\)|${RADICAL_FACTOR}|${RADICAL_NUMBER})`;
const RADICAL_FRACTION = String.raw`(?<![\w/])(${RADICAL_FRACTION_TERM})\s*\/\s*(${RADICAL_FRACTION_TERM})(?![\w/])`;

function radicalFractionToTex(numerator: string, denominator: string): string {
  const unwrap = (term: string): string =>
    term.startsWith("(") && term.endsWith(")") ? term.slice(1, -1) : term;
  return `\\frac{${unwrap(numerator)}}{${unwrap(denominator)}}`;
}

/* ── Leibniz derivative notation ─────────────────────────────────────────────
 *
 * S242 / MPB-05, ruled 2026-08-15: `dy/dx` is STACKED as a true fraction everywhere, not left as
 * a slash. 231 index rows are this shape and none of them formed an island of any kind — `dy` is
 * two letters, so the single-letter atom declines it, and the numeric-fraction island requires
 * digits. The notation therefore reached the screen in the UI's body font on 190 widget strings
 * and 41 lesson-prose strings, visually unlike every other variable in the app.
 *
 * ADMITTED ALWAYS-ON, on the licence already ratified for `≤`, `±` and π: the shape does not occur
 * in English. That claim was tested against the corpus rather than assumed, and the test found
 * four false positives, each of which set one of the constraints below:
 *
 *   · `compare a/b and c/d by checking a×d…` → matched `d c/d b` across three words.
 *     ⇒ NO whitespace anywhere inside the notation.
 *   · `Inverse top-left = d/det = 3/6` → the matrix inverse, not a derivative.
 *     ⇒ the denominator variable is ONE letter with a non-letter after it, so `det` is refused.
 *   · `contentLocatorRule: "grade/domain/cluster"` → matched `de/do`.
 *     ⇒ the leading `d` needs a non-alphanumeric before it, so `grade` cannot supply it.
 *   · `dr/dc steppedReveal cluster` in a session-tag file → a real derivative SHAPE that is not a
 *     derivative. Nothing in the notation distinguishes it; it is excluded by not being
 *     learner-visible content, and it is recorded here so the next reader does not "fix" it.
 *
 * The order marker is admitted on both sides so `d²y/dx²` stacks as one object rather than
 * tearing into a superscript and a fraction.
 */
const D_OPERATOR = "[d∂]";
const DERIVATIVE_ORDER = String.raw`(?:[²³]|\^\{?[23]\}?)`;
/** `dy/dx`, `d²y/dx²`, `d/dx`, `∂z/∂x` — the operator form omits the numerator variable. */
const DERIVATIVE_OP =
  String.raw`(?<![A-Za-z0-9])${D_OPERATOR}${DERIVATIVE_ORDER}?(?:[A-Za-zθ](?![A-Za-z]))?` +
  String.raw`\/${D_OPERATOR}[A-Za-zθ]${DERIVATIVE_ORDER}?(?![A-Za-z])`;
const NUMBER = String.raw`\d+(?:\.\d+)?%?`;
const FRACTION_FACTOR = String.raw`(?:\d+(?:\.\d+)?π?|π|(?<![A-Za-z])[A-Za-z](?![A-Za-z]))(?:${POWER})?`;
const PI_FRACTION = String.raw`${FRACTION_FACTOR}\s*\/\s*${FRACTION_FACTOR}`;
/* DERIVATIVE_OP precedes DIFFERENTIAL in both alternations below, and the order is load-bearing:
 * `dy` matches DIFFERENTIAL, so listed second the derivative never gets a turn and `dy/dx` tears
 * into an atom, an operator and another atom — three islands where the notation is one object. */
const ATOM_BODY = `(?:${PAREN}|${BRACKET}|${BARS}|${FUNCTION}|${DERIVATIVE_OP}|${DIFFERENTIAL}|${INTEGRAL_OP}|${PI_FRACTION}|½|${NAME}|${NUMBER})`;
const ATOM = `(?:√${GAP}*)?${ATOM_BODY}${SCRIPTS}`;
/**
 * Juxtaposition across a space is how `x³ dx`, `½ r² dθ` and `cos x` are written — but it is
 * also how English is written. A bare single letter may therefore START a run (`∫ f dx`) and may
 * follow an operator (`x · e^(x²)`), yet may never be picked up by juxtaposition alone; without
 * that restriction "∫ f dx I think" would swallow the `I`.
 */
const JUXTAPOSED = `(?:√${GAP}*)?(?:${PAREN}|${BRACKET}|${BARS}|${FUNCTION}|${DERIVATIVE_OP}|${DIFFERENTIAL}|${INTEGRAL_OP}|${PI_FRACTION}|½|${NUMBER}|${NAME}${POWER}|${NAME}${SUB_CHARS})${SCRIPTS}`;
const OPERATOR = String.raw`[-+−×÷·*/=<>≤≥≠≈]`;
const RUN = `${ATOM}(?:${GAP}*${OPERATOR}${GAP}*${ATOM}|${ATOM}|${GAP}+${JUXTAPOSED})*`;
/** `lim(x→4⁻) = 4 − 1 = 3` and `∫₁⁴ = ∫₁³ + ∫₃⁴`: the operator may lead, the result is the body. */
const BODY = `(?:${GAP}*${OPERATOR})?${GAP}*${RUN}`;
/** `π∫₀¹ x⁴ dx`, `(1/2)∫₁² u³ du`, `½∫(1 + cos θ)²dθ` — the coefficient belongs to the integral. */
const COEFFICIENT = String.raw`(?:½|π|\([^()\s\n]{1,14}\))`;

const INTEGRAL_ISLAND = `${COEFFICIENT}?${INTEGRAL_OP}(?:${BODY})?`;
/* The Calc corpus uses four deliberate language placeholders inside displayed integral notation.
 * They are not products of italic letters: the renderer must preserve them as words. This closed
 * vocabulary is explicit evidence, not a general licence to turn prose after ∫ into mathematics. */
const TEXTUAL_INTEGRAND = String.raw`(?:\((?:rate|top${GAP}*[-−]${GAP}*bottom|something${GAP}+in${GAP}+u)\)|speed)`;
const TEXTUAL_INTEGRAL_ISLAND = new RegExp(
  `${COEFFICIENT}?${INTEGRAL_OP}${GAP}*${TEXTUAL_INTEGRAND}${GAP}*${DIFFERENTIAL}`,
  "g",
);
const SUMMATION_ISLAND =
  `[Σ∑](?:${GAP}*${RUN})?` +
  `(?:${GAP}*(?:from|for)${GAP}+[A-Za-z]${GAP}*=${GAP}*[A-Za-z0-9]+(?:${GAP}+to${GAP}+[A-Za-z0-9]+)?)?` +
  `(?:${GAP}*of${GAP}+${RUN})?`;
const LIMIT_ISLAND = `\\blim(?![A-Za-z])(?:${GAP}*\\(${GAP}*[A-Za-z]${GAP}*→[^()\\n]{1,16}\\))?(?:${BODY})?`;

const CALCULUS_ISLANDS = [INTEGRAL_ISLAND, SUMMATION_ISLAND, LIMIT_ISLAND].map(
  (island) => new RegExp(island, "g"),
);
/** Cheap gate: the overwhelming majority of the corpus contains no calculus operator at all. */
const CALCULUS_OPERATOR = /[∫Σ∑]|\blim\b/;
/** The operator alone carries no mathematics: "The ∫ is a stretched S for 'sum'" is prose. */
const BARE_OPERATOR = /^(?:∫|[Σ∑]|lim)$/;
const WORDS = /[A-Za-z]{3,}/g;
const FUNCTION_WORDS = new Set(FUNCTION_NAMES.split("|"));
/** The summation's own authored scaffolding, which SUMMATION_ISLAND consumes rather than typesets. */
const SUM_SCAFFOLD =
  /\b(?:from|for)[ \t]+[A-Za-z][ \t]*=[ \t]*[A-Za-z0-9]+(?:[ \t]+to[ \t]+[A-Za-z0-9]+)?(?:[ \t]+of\b)?/g;

/**
 * An island containing an English word is not an island. The corpus deliberately writes
 * word-placeholders inside the operator's own brackets — `∫ₐᵇ (top − bottom) dx`, `∫ (rate) dt`,
 * `Σ from k = 3 to 11 of (anything)`, `∫ speed dt` — and a bracket group is matched by character
 * class, so those words reach the run. Typesetting them would render `top` as t·o·p in math
 * italic. Dropping the whole island leaves the characters exactly as authored, which is the same
 * direction this file already fails in for a false numeric claim.
 */
function hasProseWord(source: string): boolean {
  for (const word of source.replace(SUM_SCAFFOLD, " ").match(WORDS) ?? []) {
    if (!FUNCTION_WORDS.has(word)) return true;
  }
  return false;
}

/** Split a summation into (index, lower, upper, body) when it is authored in prose bounds. */
const SUMMATION_BOUNDS =
  /^[Σ∑][ ]*(.*?)[ ]*(?:from|for)[ ]+([A-Za-z])[ ]*=[ ]*([A-Za-z0-9]+)(?:[ ]+to[ ]+([A-Za-z0-9]+))?(?:[ ]+of[ ]+(.*))?$/;

/**
 * Convert the operators once their bounds are already TeX. `superscriptToTex`/`subscriptToTex`
 * have run by this point, so `∫₀²` arrives as `∫_{0}^{2}` and the integral rule is little more
 * than naming the command and spacing the differential.
 */
function calculusShorthandToTex(source: string): string {
  // `cos x` set as three italic letters is c·o·s, not a cosine. The rewrite is scoped to these
  // islands because they are the only place in the corpus a function name is authored as a word.
  let tex = source
    .replace(
      new RegExp(`(?<!\\\\)\\b(${TEX_FUNCTIONS})(?![A-Za-z])`, "g"),
      "\\$1",
    )
    .replaceAll("½", "\\frac{1}{2}");

  /* Source-compatible repairs for the two bounded legacy glyphs and the four sanctioned textual
   * integrands. \text keeps the visible words and accessible MathML truthful instead of silently
   * pretending that `speed` means s·p·e·e·d. */
  tex = tex
    .replace(/∫ᵦ/g, "∫_{b}")
    .replace(/∫꜀/g, "∫_{c}")
    .replace(/\(rate\)/g, "\\left(\\text{rate}\\right)")
    .replace(
      /\(top\s*-\s*bottom\)/g,
      "\\left(\\text{top} - \\text{bottom}\\right)",
    )
    .replace(/\(something\s+in\s+u\)/g, "\\left(\\text{something in }u\\right)")
    .replace(/\bspeed\b/g, "\\text{speed}");

  const summation = tex.match(SUMMATION_BOUNDS);
  if (summation) {
    const [, before, index, lower, upper, after] = summation;
    const bounds = upper
      ? `_{${index}=${lower}}^{${upper}}`
      : `_{${index}=${lower}}`;
    const body = (after ?? before ?? "").trim();
    tex = `\\sum${bounds}${body ? ` ${body}` : ""}`;
  } else {
    // A command name runs to the next non-letter, so `\sumx` is a syntax error and `\sum x` is
    // not — but a space before a bound would be noise, hence the second pass on each operator.
    tex = tex.replace(/[Σ∑]\s*/g, "\\sum ").replace(/\\sum (?=[_^])/g, "\\sum");
  }

  // `lim(x→0⁺)` reached here as `lim(x\to 0^{+})`: the arrow and the sign are ordinary operator
  // rewrites, so all that is left is to move the parenthesised approach under the operator.
  // The `(?<!\\)` keeps the second pass off the `\lim` this one just produced.
  tex = tex.replace(
    /\blim(?![A-Za-z])\s*\(\s*([^()\n]*?\\to[^()\n]*?)\s*\)/g,
    (_match, approach: string) =>
      `\\lim_{${approach.replace(/\s*\\to\s*/, " \\to ").trim()}}`,
  );
  tex = tex
    .replace(/(?<!\\)\blim(?![A-Za-z])\s*/g, "\\lim ")
    .replace(/\\lim (?=[_^])/g, "\\lim");

  if (tex.includes("∫")) {
    tex = tex.replace(/∫\s*/g, "\\int ").replace(/\\int (?=[_^])/g, "\\int");
    // A thin space is the difference between ∫x²dx and ∫x² dx: TeX drops authored spaces, so
    // without `\,` the differential collides with the integrand. Only the differential that
    // CLOSES the integrand gets one — the `dx`/`dt` inside `√((dx/dt)² + (dy/dt)²)` must not.
    tex = tex
      .replace(new RegExp(`\\s+(${DIFFERENTIAL})`, "g"), "\\,$1")
      .replace(new RegExp(`(?<=[)\\]}|])(${DIFFERENTIAL})`, "g"), "\\,$1");
  }

  return tex;
}

/** Convert the corpus's explicit, author-friendly shorthand to TeX. */
export function powerShorthandToTex(source: string): string {
  const algebraicFraction = source.match(new RegExp(`^${ALGEBRAIC_FRACTION}$`));
  if (algebraicFraction && !hasProseWord(source)) {
    return `\\frac{${powerShorthandToTex(algebraicFraction[1])}}{${algebraicFraction[2]}}`;
  }  /* S242. Authors write both `≤` and `<=`. Normalising the ASCII pair to the Unicode relation here
   * — rather than adding a second spelling to the symbol table, the false-claim evaluator and every
   * future branch — means the rest of this file keeps one canonical form to reason about. Done
   * first so the `≤`/`≥` entries below pick them up. */
  const tex = subscriptToTex(
    superscriptToTex(source).replaceAll("<=", "≤").replaceAll(">=", "≥"),
  )
    .replace(/\^\(((?:[^()]|\([^()]*\))*)\)/g, "^{$1}")
    .replace(/\^((?:[?]|[A-Za-z0-9π∞+−-]+))/g, "^{$1}")
    /* S242 / MPB-05 — LEIBNIZ NOTATION IS STACKED. Placed after the `^{…}` normalisation above so
     * that `d²y/dx²` has already become `d^{2}y/dx^{2}` and the order marker can be carried into
     * the right half of the fraction rather than left dangling outside it. The `\\` in the
     * lookbehind keeps this off a command this chain has already emitted — without it the `d` of
     * `\cdot` would be a numerator. */
    .replace(
      /(?<![A-Za-z0-9\\])([d∂])((?:\^\{[^{}]*\})?)([A-Za-zθ](?![A-Za-z]))?\/([d∂])([A-Za-zθ])((?:\^\{[^{}]*\})?)(?![A-Za-z])/g,
      (
        _m,
        dTop: string,
        order: string,
        top: string | undefined,
        dBottom: string,
        bottom: string,
        bottomOrder: string,
      ) =>
        `\\frac{${dTop}${order}${top ?? ""}}{${dBottom}${bottom}${bottomOrder}}`,
    )
    .replace(
      new RegExp(RADICAL_FRACTION, "g"),
      (match, numerator: string, denominator: string) =>
        numerator.includes("√") || denominator.includes("√")
          ? radicalFractionToTex(numerator, denominator)
          : match,
    )
    /* S242 / MPB-05. A STACKED FRACTION NEEDS PARENTHESES THAT GROW WITH IT. The two shapes this
     * ruling makes common are the chain rule, `(dy/du)·(du/dx)`, and parametric arc length,
     * `√((dx/dt)² + (dy/dt)²)` — in both the authored parentheses are around a fraction that is now
     * two lines tall, and KaTeX sets a plain `(` at base height, so the bracket reads as belonging
     * to the numerator alone. Restricted to groups with NO nested parenthesis, which makes the
     * `\left`/`\right` pair balanced by construction: an unbalanced one is a KaTeX parse error, and
     * this function has no way to report one. */
    .replace(/\((?![^()]*\()([^()]*\\frac[^()]*)\)/g, "\\left($1\\right)")
    .replace(/(?<![A-Za-z])sqrt\s*\(((?:[^()]|\([^()]*\))*)\)/gi, "\\sqrt{$1}")
    .replace(/√\(((?:[^()]|\([^()]*\))*)\)/g, "\\sqrt{$1}")
    .replace(/√\|([^|]+)\|/g, "\\sqrt{\\lvert $1\\rvert}")
    .replace(/√([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(
      /(?<![\w/])((?:(?:\d+(?:\.\d+)?)?π|\d+(?:\.\d+)?|[A-Za-z])(?:\^\{[^{}\n]*\})?)\s*\/\s*((?:(?:\d+(?:\.\d+)?)?π|\d+(?:\.\d+)?|[A-Za-z])(?:\^\{[^{}\n]*\})?)(?![\w/])/g,
      (match, numerator: string, denominator: string) =>
        /[∫Σ∑]|\blim\b/.test(source)
          ? match
          : `\\frac{${numerator}}{${denominator}}`,
    )
    .replace(/(?<![\w/])(\d+)\s*\/\s*(\d+)(?![\w/])/g, "\\frac{$1}{$2}")
    .replaceAll("·", "\\cdot ")
    .replaceAll("×", "\\times ")
    .replaceAll("*", "\\times ")
    .replaceAll("÷", "\\div ")
    .replaceAll("−", "-")
    .replaceAll("≤", "\\le ")
    .replaceAll("≥", "\\ge ")
    .replaceAll("≠", "\\ne ")
    .replaceAll("≈", "\\approx ")
    .replaceAll("∞", "\\infty ")
    .replaceAll("→", "\\to ")
    .replaceAll("′", "'"); // U+2032 is not a KaTeX symbol; the ASCII prime typesets f′ correctly
  return /[∫Σ∑]|\blim\b/.test(source) ? calculusShorthandToTex(tex) : tex;
}

function collect(source: string, pattern: RegExp, matches: Match[]): void {
  pattern.lastIndex = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index === undefined || !match[0]) continue;
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      source: match[0],
    });
  }
}

/** Integral, summation and limit islands, minus the two shapes that must stay prose. */
function calculusMatches(text: string): Match[] {
  if (!CALCULUS_OPERATOR.test(text)) return [];
  const found: Match[] = [];
  for (const island of CALCULUS_ISLANDS) collect(text, island, found);
  const accepted: Match[] = [];
  const entireTrimmed = text.trim();

  for (const match of found) {
    const trimmed = match.source.trim();
    if (BARE_OPERATOR.test(trimmed)) {
      // A standalone widget label is notation; the same symbol inside a sentence remains prose.
      if (trimmed === entireTrimmed) accepted.push(match);
      continue;
    }
    if (!hasProseWord(match.source)) {
      accepted.push(match);
      continue;
    }
    if (!match.source.includes("∫")) continue;

    /* A parenthetical usage note can be greedily offered as one more juxtaposed group after the
     * closing differential: `∫… dx (for x ≠ 0)`. Keep the mathematically complete prefix and leave
     * the prose note outside. The last differential is intentional because an arc-length
     * integrand may contain dx/dt before its closing dt. */
    const differentials = [
      ...match.source.matchAll(new RegExp(DIFFERENTIAL, "g")),
    ];
    const closing = differentials.at(-1);
    if (closing?.index !== undefined) {
      const end = closing.index + closing[0].length;
      const prefix = match.source.slice(0, end);
      if (!hasProseWord(prefix)) {
        accepted.push({
          start: match.start,
          end: match.start + end,
          source: prefix,
        });
        continue;
      }
    }

    /* Bound-only properties can be followed by a prose gloss without a differential:
     * `∫ᵦᵃ f (running backwards ...)`. A parenthesis containing a real word is the first certain
     * prose boundary. Keep the clean prefix, but never promote a now-bare operator; the standalone
     * label rule above is the only licence for that. */
    const proseTail = match.source.search(/[ \t]+\((?=[^()\n]*[A-Za-z]{3,})/);
    if (proseTail > 0) {
      const prefix = match.source.slice(0, proseTail).trimEnd();
      if (!BARE_OPERATOR.test(prefix.trim()) && !hasProseWord(prefix)) {
        accepted.push({
          start: match.start,
          end: match.start + prefix.length,
          source: prefix,
        });
      }
    }
  }

  // Closed-vocabulary text integrands are intentionally accepted despite containing words.
  collect(text, TEXTUAL_INTEGRAL_ISLAND, accepted);
  return accepted;
}

/**
 * Find explicit math islands. The patterns are intentionally conservative:
 *
 * - powers, including a single balanced parenthesized group with spaces;
 * - numeric fractions (never dates, URLs, or word/word text);
 * - `sqrt(...)` shorthand;
 * - integral/summation/limit notation, with its bounds and its integrand.
 *
 * Overlaps are resolved longest-first, so `(x^2 y^3)^2` becomes one MathML
 * expression instead of two invalid fragments.
 */
function mathMatches(text: string, includeArithmetic: boolean): Match[] {
  const candidates: Match[] = [];

  collect(
    text,
    /\([^()\n]*\^[^()\n]*\)(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|(?:[?]|[A-Za-z0-9π∞+−-]+)))?/g,
    candidates,
  );
  // S242: the exponent admits ONE level of nesting, as powerShorthandToTex already does. Without
  // it "2^(3 + (−1))" matched no exponent at all and left "2^()" sitting in the prose.
  /* S242 / MATH-03. THE BASE ADMITS ONE LEVEL OF NESTING, exactly as the exponent already does.
  // A base of `\([^()\n]+\)` cannot contain brackets, so `(x - (-4))^2` and `(x^(3/5))^(5/3)` matched
  // nothing and the caret reached the screen — on vertex-form and rational-exponent lessons, where a
  // bracketed base with a signed or fractional inner term is the ordinary shape rather than an edge
  // case. The asymmetry was accidental: the exponent was widened in this session and the base was
  // not. */
  collect(
    text,
    new RegExp(
      `(?:[A-Za-z0-9?]+|\\((?:[^()\\n]|\\([^()\\n]*\\))*\\))\\^(?:\\((?:[^()\\n]|\\([^()\\n]*\\))*\\)|(?:[?]|[A-Za-z0-9π∞+−-]+))`,
      "g",
    ),
    candidates,
  );
  collect(
    text,
    /(?:(?<![A-Za-z0-9])\d+\s*)?(?<![A-Za-z])sqrt\s*\([^()\n]+\)/gi,
    candidates,
  );
  collect(text, /√(?:\((?:[^()\n]|\([^()\n]*\))*\)|\|[^|\n]+\||[A-Za-z0-9]+)/g, candidates);
  {
    const radicalFractions: Match[] = [];
    collect(text, new RegExp(RADICAL_FRACTION, "g"), radicalFractions);
    for (const candidate of radicalFractions) {
      if (candidate.source.includes("√")) candidates.push(candidate);
    }
  }
  /* S242 / MATH-03 (MPB-01). Either side of the slash may carry π. "π/2", "3π/2" and "2π/3" are
  // single quantities and were the second-largest π residue (409 rows) — the fraction island
  // required digits on both sides, so it declined them and the whole thing stayed prose on radian
  // lessons whose subject is exactly those values. */
  collect(
    text,
    /(?<![\w/])(?:\d+(?:\.\d+)?π?|π)\s*\/\s*(?:\d+(?:\.\d+)?π?|π)(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|(?:[?]|[A-Za-z0-9π∞+−-]+)))?(?![\w/])/g,
    candidates,
  );

  /* S242 / MATH-03 (MPB-01/03) — A SIGNED VALUE AND A π QUANTITY ARE ALWAYS-ON ISLANDS.
   *
   * The atom widening below only reaches surfaces that pass `includeArithmetic: true` — lesson
   * prose, hints, step feedback. But 1,602 of the 1,849 remaining symbolic-display rows sit on
   * WIDGET spec strings, which `widgets.tsx` renders with arithmetic OFF at 159 of its 160 call
   * sites. On those surfaces the arithmetic run is never consulted, so "x − 1 = ±4" and "36π" stayed
   * raw no matter how good the atom got. This is the same shape as the ASCII-inequality residue
   * earlier in S242, and it takes the same remedy for the same reason.
   *
   * The licence is that neither character occurs in English. `±` appears only as the symbol itself,
   * and it is admitted here only with a value bound to it, so "The ± in the formula" stays prose.
   * π is admitted only with a COEFFICIENT or a juxtaposed group — "36π", "2π(7)" — so a bare π used
   * as a word ("multiplying by π") is left alone rather than being lifted out of its sentence.
   * Cautious in the same direction as the relation island: evidence, not inference. */
  collect(
    text,
    /±\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z]))(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|(?:[?]|[A-Za-z0-9π∞+−-]+)))?/g,
    candidates,
  );
  collect(
    text,
    /(?<![\w.])\d+(?:\.\d+)?π(?:\([^()\n]{1,20}\))?|π\([^()\n]{1,20}\)/g,
    candidates,
  );


  /* S242 / MPB-05 — LEIBNIZ NOTATION IS AN ALWAYS-ON ISLAND, AND THE OPERATOR FORM CARRIES ITS
   * ARGUMENT.
   *
   * Always-on for the same reason as `±` and π: 190 of the 231 rows sit on widget spec strings,
   * which `widgets.tsx` renders with arithmetic OFF, so the atom widening below cannot reach them.
   * The constraints that make `dy/dx` safe without an arithmetic context are argued at
   * DERIVATIVE_OP.
   *
   * The trailing group is what makes `d/dx[x² + 7]` one object instead of a stacked fraction
   * standing next to an orphaned bracket. It is filtered by `hasProseWord` on the same argument the
   * integral island uses — the corpus writes word placeholders inside these brackets
   * (`d/dx[position]`), and typesetting one renders it as a product of italic letters. */
  {
    /* Both extents are offered and the existing longest-first resolution chooses between them: the
     * argument-carrying island wins where it is clean, and where `hasProseWord` rejects it the bare
     * operator is still there to be accepted, so `d/dx[position]` stacks the operator and leaves
     * the word alone rather than losing both. The bare operator needs no prose filter of its own —
     * `WORDS` wants three letters and the notation never has two in a row. */
    collect(text, new RegExp(DERIVATIVE_OP, "g"), candidates);
    const withArgument: Match[] = [];
    collect(
      text,
      new RegExp(
        `${DERIVATIVE_OP}(?:${GAP}*(?:${BRACKET}|${PAREN})${SCRIPTS})?`,
        "g",
      ),
      withArgument,
    );
    for (const candidate of withArgument) {
      if (!hasProseWord(candidate.source)) candidates.push(candidate);
    }
  }

  /* S242 — INEQUALITY RELATIONS ARE ALWAYS-ON ISLANDS, and they carry their operands' signs.
   *
   * Two residues from the first pass at ASCII inequalities, fixed together because they have one
   * cause: the relation was only reachable through the arithmetic run, and that run is the most
   * conservative pattern in this file.
   *
   *   · 26 rows sat on surfaces that pass `includeArithmetic: false` — option labels, widget
   *     prompts. "x >= 3" as an answer choice simply never became mathematics. Those surfaces are
   *     cautious for good reason: the arithmetic scanner guesses at expressions from bare `=` and
   *     `+`, which is speculative in prose. A RELATION is not a guess. `<=` and `>=` do not occur
   *     in English, and `≤`/`≥` occur nowhere else at all, so the digraph is its own evidence that
   *     the surrounding text is mathematics. That makes it safe always-on where a bare `=` is not.
   *
   *   · 11 rows carried negative operands — "-6x>=-24", "Add 4 (-6x>=-24), divide by -6 and FLIP".
   *     The atom deliberately refuses a leading ASCII hyphen, because S237 found the scanner
   *     crossing hyphens and typesetting "Ages 3-5" as arithmetic. That reasoning is about the
   *     hyphen as a binary OPERATOR between two atoms. Here it is a SIGN on an operand, and the
   *     relation on the other side of it removes the ambiguity that made the general case unsafe.
   *
   * Both operands still respect the ARCH-01 word boundaries, so this cannot reintroduce tearing,
   * and false claims are refused below exactly as they are for the arithmetic run — "9 <= 2" must
   * not be typeset into polished KaTeX any more than "2 + 2 = 5" may be. */
  {
    /* S242 / MATH-03 (MPB-04). ABSOLUTE-VALUE BARS ARE AN OPERAND.
     *
     * "Which is equivalent to |x| ≥ 2?" produced no island: the relation needs an operand on both
     * sides and `|x|` was not one, so the whole inequality sat in body type next to typeset
     * neighbours. ~200 rows of the symbolic display index are this shape.
     *
     * THE CONTENT IS RESTRICTED TO A VALUE, not to "anything between two bars", and the corpus is
     * why. The pipe is ALSO conditional-probability notation here — `P(A | B)`, `P(king | face)`.
     * A permissive `\|[^|\n]+\|` would match from one conditional's bar to the next one's across
     * intervening prose. Requiring the content to be a signed value, optionally combined by
     * arithmetic operators, cannot do that: 558 of the 731 bar-carrying strings match, yielding 95
     * distinct tokens — |x|, |−6|, |x − 2|, |x − h| — and every conditional-probability string is
     * refused. The one `P(...)` string that does match carries `|A|` as set cardinality, which is
     * mathematics and should typeset. */
    const PI_RELATION_TERM = String.raw`\d*(?:\.\d+)?π(?:\([^()\n]{1,20}\))?`;
    const PLUS_MINUS_TERM = String.raw`±\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z]))(?:${POWER})?`;
    const ABSOLUTE = String.raw`\|\s*[-−]?\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z]))(?:\s*[-−+×÷·]\s*[-−]?\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z])))*\s*\|`;
    const term = String.raw`(?:${DERIVATIVE_OP}|${PI_FRACTION}|${PI_RELATION_TERM}|${PLUS_MINUS_TERM}|${ABSOLUTE}|${SCRIPTED_ATOM}|(?<![A-Za-z])[θαβγλμσΔΩ](?:${SCRIPTS})?(?![A-Za-z])|\d+\s*\/\s*\d+(?:${POWER})?|(?<![A-Za-z])(?:\d*[A-Za-z]|[A-Za-z]\d+)(?![A-Za-z])(?:${POWER})?|\d+(?:\.\d+)?%?(?:${POWER})?|\([^()\n]{1,40}\)(?:${POWER})?)`;
    /* An operand is a sum, not a single term. Matching only one term made "2x + 4 >= 10" capture
     * `4 >= 10` — a FALSE claim, which the guard below then correctly refused, so the whole
     * inequality silently stayed raw. The leading sign binds tight (`(?:[-−]\s*)?`, not
     * `[-−]?\s*`) so a missing sign cannot swallow the preceding space into the island. The
     * internal operator admits the ASCII hyphen HERE and nowhere else. S237 excluded it from the
     * general arithmetic class because the scanner was typesetting "Ages 3-5" as arithmetic — but
     * that danger comes from guessing at an expression with no evidence it is one. Inside a
     * relation island the `<=` is that evidence, and "Solve: -7x - 8 <= -43" is unambiguous. "Ages
     * 3-5" still cannot match, because it carries no relation at all. */
    const operand = String.raw`(?:[-−]\s*)?${term}(?:\s*[-−+]\s*${term})*`;
    const relations: Match[] = [];
    /* S242 (MATH-01). `≠` joins the digraphs on the same argument that admitted them: it does not
     * occur in English at all, so it is its own evidence that the surrounding text is mathematics,
     * and the false-claim evaluator below already knows how to judge it. 285 rows of the symbolic
     * display index were "6 ≠ 4" and "−6 ≠ 6" sitting in body type beside typeset islands. */
    collect(
      text,
      new RegExp(`${operand}\\s*(?:<=|>=|≤|≥|≠)\\s*${operand}`, "g"),
      relations,
    );
    for (const candidate of relations) {
      if (!isFalseNumericClaim(candidate.source)) candidates.push(candidate);
    }
  }

  /* S251 — EVERY LEARNER-VISIBLE MATHEMATICAL GLYPH USES THE MATH RENDERER.
   * Larger validated expressions win overlap resolution. A false closed relation is still refused
   * as a complete island; its operator remains a one-glyph math island so the glyph is consistently
   * typeset without visually asserting the whole false statement. */
  collect(text, new RegExp(SCRIPTED_ATOM, "g"), candidates);
  {
    const algebraicFractions: Match[] = [];
    collect(text, new RegExp(ALGEBRAIC_FRACTION, "g"), algebraicFractions);
    for (const candidate of algebraicFractions) {
      if (!hasProseWord(candidate.source)) candidates.push(candidate);
    }
  }
  {
    const scriptedGroups: Match[] = [];
    collect(text, new RegExp(`${PAREN}(?:${SUB_CHARS})?(?:${POWER})`, "g"), scriptedGroups);
    for (const candidate of scriptedGroups) {
      if (!hasProseWord(candidate.source)) candidates.push(candidate);
    }
  }
  collect(text, /[πθαβγλμσΔΩ≤≥≠±∞∑∫√]/g, candidates);

  if (includeArithmetic) {
    /* S242 (ARCH-01, ruled 2026-08-15) — THE SINGLE-LETTER ATOM NEEDS WORD BOUNDARIES.
     *
     * `\d*[A-Za-z]` matched ONE letter with no regard for what sat either side of it, so the atom
     * happily consumed the last letter of an English word and the run built an "expression" out of
     * it. "Position −6" tokenized as the island `n −6`, and the learner saw "Positio" followed by a
     * KaTeX italic n − 6 — the word broken, and the authored U+2212 re-set as binary subtraction.
     * Measured across 39,236 authored strings before the fix: 3,113 such tears.
     *
     * The same hole destroyed radicals, which is what makes this one assertion worth its weight.
     * In "a = sqrt(25)" the scanner took `a`, `=`, then the `s` of `sqrt`, emitting `a = s` and
     * leaving `qrt(25)` as prose — 875 of the 879 raw-sqrt rows in the S242 index sit on
     * arithmetic-on surfaces. With the boundaries, `s` followed by `q` is no longer an atom, the
     * run cannot form, and the always-on `sqrt(...)` island at the top of `mathMatches` gets to
     * claim the text instead. That ordering is why widening `includeArithmetic` must never precede
     * this fix.
     *
     * Cost, measured the same way: ZERO. Every island the boundaries remove was a tear — the set
     * of islands lost that were not tears is empty. `(x) = x^2`, `x + 3 = 10` and `2x + 4` all
     * still typeset unchanged, because a parenthesised group, a number and a multi-digit
     * coefficient are all still atoms. Fixtures in `authoredMath.wordBoundary.s242.test.ts`. */
    /* S242. The variable-with-power alternative is tried BEFORE the bare number. Listed after it,
     * "3e^(x²)" matched just `3` and orphaned the exponent — the run emitted `f = 3` and left
     * `e^(x²)` in the prose. A bare digit still reaches the number branch, since the variable
     * branch requires a letter. */
    /* S242 / MATH-03 (MPB-04). The same absolute-value operand, for the arithmetic run — "|−6| = 6
     * and |4| = 4" is an equation, not a relation, so the always-on relation island cannot reach it.
     * The false-claim guard is unaffected: its evaluator refuses any source that is not a closed
     * numeric expression, and bars are not, so it returns "not false" and the island stands. */
    /* S242 / MATH-03 (MPB-03). `±` BINDS TO ITS OPERAND.
     *
     * "the cases are x − 1 = ±4" and "()² = 4 gives = ±2" left the sign and its value in body type:
     * ~460 rows. The atom deliberately refuses a leading ASCII hyphen — S237 found the scanner
     * typesetting "Ages 3-5" as arithmetic — but that reasoning is about a character English also
     * uses. `±` is not one: it does not occur in English at all, which is the same argument that
     * admitted `≤`, `≥` and `≠` as always-on evidence of mathematics.
     *
     * It binds to a VALUE, not to whatever follows. 622 of the 719 `±` strings in the corpus have a
     * number or a single variable immediately after; the other 97 are the symbol used as a word —
     * "The ± in the formula flips only the imaginary sign" — or standing alone as a token label, and
     * those must stay prose. Requiring a value keeps them there.
     */
    /* S242 / MATH-03 (MPB-01/02). π CARRIES ITS COEFFICIENT, AND ITS GROUP.
     * "36π", "4.5π", "9π" and "2π(7)" are single quantities, so they are one atom: a coefficient, the
     * constant, and optionally the bracketed factor juxtaposed after it. Without the group the run
     * stopped at "2π" and left "(7)" in the prose of a circumference explanation.
     * π used as a WORD is untouched — "use π ≈ 3.14159", "Before multiplying by π" — because an atom
     * only becomes an island inside a run, and prose supplies no operator on both sides. */
    const PI_TERM = String.raw`\d*(?:\.\d+)?π(?:\([^()\n]{1,20}\))?`;
    const PLUS_MINUS = String.raw`±\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z]))(?:${POWER})?`;
    const ABSOLUTE_ATOM = String.raw`\|\s*[-−]?\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z]))(?:\s*[-−+×÷·]\s*[-−]?\s*(?:\d+(?:\.\d+)?|(?<![A-Za-z])[A-Za-z](?![A-Za-z])))*\s*\|`;
    const atom = String.raw`(?:${DERIVATIVE_OP}|${PI_FRACTION}|${PI_TERM}|${PLUS_MINUS}|${ABSOLUTE_ATOM}|${SCRIPTED_ATOM}|(?<![A-Za-z])[θαβγλμσΔΩ](?:${SCRIPTS})?(?![A-Za-z])|\d+\s*\/\s*\d+(?:${POWER})?|(?<![A-Za-z])(?:\d*[A-Za-z]|[A-Za-z]\d+)(?![A-Za-z])(?:${POWER})?|\d+(?:\.\d+)?%?(?:${POWER})?|\([^()\n]{1,40}\)(?:${POWER})?)`;
    /* S242. `<=` and `>=` lead the alternation deliberately. Tried after the single `<`/`>`, the
     * scanner matches `>` alone, then looks for an atom, finds `=`, and abandons the run — which is
     * why 75 authored strings carrying ASCII inequalities leaked at a 100% rate while every other
     * operator in this class typeset fine. */
    /* S242 / MATH-03 (MPB-01). `≈` IS AN OPERATOR. It was the missing half of the π problem: the
     * dominant residue shape is "113.1 ≈ 36π", and the run never formed because `≈` was not in this
     * class at all — not because π was unrecognised. Like `≤` and `≠`, it does not occur in English,
     * so it is its own evidence that the surrounding text is mathematics. The false-claim evaluator
     * ignores it deliberately: its relation set is `[=≤≥≠<>]`, so an approximation is never judged
     * true or false, which is correct — 3.14159 ≈ π is not an equation to be checked. */
    const operator = String.raw`(?:<=|>=|=|≤|≥|≠|≈|<|>|\+|−|×|÷|·|\*)`;
    /* S242 (ARCH-01). The arithmetic run is collected into its OWN array. The S237 boundary guard
     * below judges "is this candidate the tail of a longer expression the scanner cut into?" —
     * a question that is only meaningful about candidates the ARITHMETIC scanner produced. It used
     * to run over the whole `candidates` array, so it also judged the always-on islands collected
     * at the top of this function, and dropped them for the crime of following an operator. That
     * is why "a = sqrt(25)" rendered NOTHING once the atom stopped tearing: the radical island
     * exists, and the guard threw it away because `=` sat in front of it. A power, a radical or a
     * fraction after an equals sign is the single most ordinary shape in this corpus. */
    const arithmetic: Match[] = [];
    collect(
      text,
      new RegExp(`${atom}(?:\\s*${operator}\\s*${atom})+`, "g"),
      arithmetic,
    );
    // S237. The operator class above deliberately omits the ASCII hyphen, so the scanner cannot
    // cross one — it restarts AFTER it and emits the tail as if it were a whole expression.
    // "x^2 - x - 6 = 0" produced the island "6 = 0"; "x^2 - 2x - 8 = 0" produced "8 = 0";
    // "x²/16 − y²/9 = 1" produced "16 - y" and "9 = 1". Those are not imperfect typesetting,
    // they are FALSE STATEMENTS rendered as polished KaTeX — strictly worse than the ASCII they
    // replaced. 117 authored rows in body/explanationVariants fields ship them today.
    //
    // The fix is a boundary guard, not a wider operator set: a candidate that is preceded by an
    // arithmetic operator is by definition the tail of a larger expression, so it is dropped and
    // the text stays plain ASCII. Adding "-" to the operator class instead would have swept in
    // ranges ("Ages 3-5") and hyphenation, converting things that are not arithmetic at all.
    // Dropping is honest: those rows revert to genuinely-open MATH_TYPESETTING work, which is
    // where the audit already counts them.
    for (let i = arithmetic.length - 1; i >= 0; i--) {
      const before = text.slice(0, arithmetic[i].start).replace(/\s+$/, "");
      if (
        /[-−+×÷*/^=<>≤≥≠·.)]$/.test(before) ||
        isFalseNumericClaim(arithmetic[i].source)
      ) {
        arithmetic.splice(i, 1);
      }
    }
    candidates.push(...arithmetic);
  }

  // WS-G. That guard judges candidates the arithmetic SCANNER cut out of a longer expression, so
  // it runs before the calculus islands are collected. An ∫/Σ/lim island is anchored on its own
  // operator and can never be such a tail: "∫₁⁴ = ∫₁³ + ∫₃⁴" is three integrals, two of which sit
  // right after an `=` and would otherwise be thrown away as mid-expression debris.
  //
  // For the same reason they are also resolved FIRST rather than by position. Overlaps are
  // otherwise won by whichever candidate starts earlier, and the arithmetic scanner is this
  // file's most speculative pattern — in "f_avg = (1/3)∫₀³ x² dx = 9/3" it starts one character
  // to the left, at "g = (1/3)", and beating the integral leaves "l" torn out of "lim" and "x"
  // out of "dx". An explicit operator symbol is the strongest evidence of authored mathematics
  // in this corpus, so it outranks a guess assembled from single letters and equals signs.
  const byStartThenLongest = (a: Match, b: Match) =>
    a.start - b.start || b.end - b.start - (a.end - a.start);
  const accepted: Match[] = [];
  const explicitRadicals = candidates.filter((candidate) => candidate.source.startsWith("√(") && candidate.source.slice(2, -1).includes("("));
  for (const candidate of [
    ...[...calculusMatches(text), ...explicitRadicals].sort(byStartThenLongest),
    ...candidates.sort(byStartThenLongest),
  ]) {
    if (
      accepted.some(
        (match) => candidate.start < match.end && candidate.end > match.start,
      )
    )
      continue;
    accepted.push(candidate);
  }
  return accepted.sort((a, b) => a.start - b.start);
}

function pushText(parts: AuthoredMathPart[], text: string): void {
  if (!text) return;
  const previous = parts.at(-1);
  if (previous && !previous.tex) previous.text += text;
  else parts.push({ text });
}

/** Split prose into contiguous text and canonical math islands. */
/**
 * S237. The boundary guard catches fragments the scanner started mid-expression because it could
 * not cross an ASCII hyphen. It does NOT catch fragments started after an English word: the
 * authored sentence "…(9 × 2 = 18, plus 36 = 54)" is describing the WRONG method a learner used,
 * and the scanner lifts "36 = 54" out of it as though it were an equation worth typesetting.
 *
 * So this is the backstop, and it is stated as an invariant rather than a pattern: an island made
 * only of literal arithmetic, whose two sides evaluate to different numbers, is never typeset.
 * Either the scanner mis-cut it or the prose is deliberately quoting a mistake — and in both cases
 * setting it in polished KaTeX asserts, in the app's most authoritative visual register, something
 * that is false. Nothing is rewritten: the island is dropped and the characters stay as authored
 * ASCII, which is the safe direction to fail in.
 *
 * Anything containing a variable is left alone — this only ever judges closed numeric claims.
 */
function isFalseNumericClaim(source: string): boolean {
  if (/[A-Za-z]/.test(source)) return false;
  // S242: same normalisation as the renderer. This matches ONE relation character, so a raw `>=`
  // would be judged as `>` — and "5 >= 5" would be called false.
  source = source.replaceAll("<=", "≤").replaceAll(">=", "≥");
  const relation = source.match(/[=≤≥≠<>]/);
  if (!relation) return false;
  const [left, right] = source.split(/[=≤≥≠<>]/);
  if (right === undefined || source.split(/[=≤≥≠<>]/).length !== 2)
    return false;
  const evaluate = (side: string): number | null => {
    const tokens = side
      .replace(/[×·]/g, "*")
      .replace(/÷/g, "/")
      .replace(/[−–]/g, "-")
      .trim();
    if (!/^[\d\s+\-*/.()%]+$/.test(tokens) || !/\d/.test(tokens)) return null;
    // Shunting-yard over a closed numeric expression: no identifiers, no calls, nothing to inject.
    const out: number[] = [];
    const ops: string[] = [];
    const precedence: Record<string, number> = {
      "+": 1,
      "-": 1,
      "*": 2,
      "/": 2,
    };
    const apply = () => {
      const op = ops.pop();
      const b = out.pop();
      const a = out.pop();
      if (op === undefined || a === undefined || b === undefined) return false;
      out.push(
        op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b,
      );
      return true;
    };
    const lexed = tokens.match(/\d+(?:\.\d+)?|[+\-*/()]/g) ?? [];
    for (let index = 0; index < lexed.length; index++) {
      const token = lexed[index];
      // Unary minus: "(-10/2)" and a leading "-5" are ordinary in this corpus, and treating them
      // as binary left the evaluator unable to decide — which silently let a false claim through.
      const previous = index === 0 ? undefined : lexed[index - 1];
      if (
        token === "-" &&
        (previous === undefined ||
          previous === "(" ||
          "+-*/".includes(previous))
      ) {
        out.push(0);
        ops.push("-");
        continue;
      }
      if (/^\d/.test(token)) out.push(Number(token));
      else if (token === "(") ops.push(token);
      else if (token === ")") {
        while (ops.length && ops.at(-1) !== "(") if (!apply()) return null;
        ops.pop();
      } else {
        while (
          ops.length &&
          precedence[ops.at(-1) as string] >= precedence[token]
        )
          if (!apply()) return null;
        ops.push(token);
      }
    }
    while (ops.length) if (!apply()) return null;
    return out.length === 1 && Number.isFinite(out[0]) ? out[0] : null;
  };
  const a = evaluate(left);
  const b = evaluate(right);
  if (a === null || b === null) return false;
  const symbol = relation[0];
  const holds =
    symbol === "="
      ? Math.abs(a - b) < 1e-9
      : symbol === "≠"
        ? Math.abs(a - b) >= 1e-9
        : symbol === "<"
          ? a < b
          : symbol === ">"
            ? a > b
            : symbol === "≤"
              ? a <= b
              : a >= b;
  return !holds;
}

export function authoredMathParts(
  text: string,
  options: { includeArithmetic?: boolean } = {},
): AuthoredMathPart[] {
  const matches = mathMatches(text, options.includeArithmetic ?? false);
  if (!matches.length) return [{ text }];

  const parts: AuthoredMathPart[] = [];
  let cursor = 0;
  for (const match of matches) {
    pushText(parts, text.slice(cursor, match.start));
    parts.push({
      text: "",
      source: match.source,
      tex: powerShorthandToTex(match.source),
    });
    cursor = match.end;
  }
  pushText(parts, text.slice(cursor));
  return parts;
}
