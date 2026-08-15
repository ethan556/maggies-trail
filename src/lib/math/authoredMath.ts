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
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")",
  // WS-G. The Calc band writes eˣ, xⁿ, 2ᵏ, Σ1/nᵖ and — load-bearing for §2.2 — carries an
  // integral's upper bound as a superscript letter (∫ₐᵇ, ∫₀ˣ). Only GENUINE Unicode
  // superscripts are listed; see STRAY_SCRIPT for what happens to the improvised ones.
  "ᵃ": "a", "ᵇ": "b", "ᶜ": "c", "ᵈ": "d", "ᵉ": "e", "ᶠ": "f", "ᵍ": "g", "ʰ": "h",
  "ⁱ": "i", "ʲ": "j", "ᵏ": "k", "ˡ": "l", "ᵐ": "m", "ⁿ": "n", "ᵒ": "o", "ᵖ": "p",
  "ʳ": "r", "ˢ": "s", "ᵗ": "t", "ᵘ": "u", "ᵛ": "v", "ʷ": "w", "ˣ": "x", "ʸ": "y", "ᶻ": "z"
};

/** The subscript mirror. Lower bounds (∫₀, ∫ₐ, Σ) and indices (xᵢ, xᵢ₊₁) live here. */
const SUBSCRIPT: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "₊": "+", "₋": "-", "₌": "=", "₍": "(", "₎": ")",
  "ₐ": "a", "ₑ": "e", "ₕ": "h", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₗ": "l", "ₘ": "m",
  "ₙ": "n", "ₒ": "o", "ₚ": "p", "ᵣ": "r", "ₛ": "s", "ₜ": "t", "ᵤ": "u", "ᵥ": "v", "ₓ": "x"
};

const SUPERSCRIPT_RUN = new RegExp(`[${Object.keys(SUPERSCRIPT).join("")}]+`, "g");
const SUBSCRIPT_RUN = new RegExp(`[${Object.keys(SUBSCRIPT).join("")}]+`, "g");

function superscriptToTex(source: string): string {
  return source.replace(SUPERSCRIPT_RUN, (run) =>
    `^{${Array.from(run, (character) => SUPERSCRIPT[character] ?? character).join("")}}`
  );
}

function subscriptToTex(source: string): string {
  return source.replace(SUBSCRIPT_RUN, (run) =>
    `_{${Array.from(run, (character) => SUBSCRIPT[character] ?? character).join("")}}`
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
const STRAY_SCRIPT = "\\u00B2\\u00B3\\u00B9\\u2070-\\u209C\\u02B0-\\u02FF\\u1D2C-\\u1DBF\\uA700-\\uA707\\u2C7C";

const SUP_CHARS = `[${Object.keys(SUPERSCRIPT).join("")}]+`;
const SUB_CHARS = `[${Object.keys(SUBSCRIPT).join("")}]+`;
/** A space or tab — never a newline: an island that spanned lines would eat the authored break. */
const GAP = "[ \\t]";
const PAREN = String.raw`\((?:[^()\n]|\([^()\n]*\))*\)`;
const BRACKET = String.raw`\[(?:[^[\]\n]|\[[^[\]\n]*\])*\]`;
const BARS = String.raw`\|[^|\n]+\|`;
/** A caret power, a brace power (`∫₀^{2π}` is authored that way), or a Unicode superscript run. */
const POWER = `(?:${SUP_CHARS}|\\^\\{[^{}\\n]*\\}|\\^${PAREN}|\\^[A-Za-z0-9?π∞+−-]+)`;
const SCRIPTS = `(?:${SUB_CHARS})?(?:${POWER})?`;
/** `∫` plus its bounds — an atom in its own right, so `∫₀² + ∫₂⁵ = ∫₀⁵` is one island. */
const INTEGRAL_OP = `∫(?:${SUB_CHARS})?(?:${POWER})?(?![${STRAY_SCRIPT}])`;
/** Function names that become a TeX command verbatim. `sqrt`/`lim` have their own rules below. */
const TEX_FUNCTIONS = "arcsin|arccos|arctan|sinh|cosh|tanh|sin|cos|tan|sec|csc|cot|log|ln|exp";
const FUNCTION_NAMES = `${TEX_FUNCTIONS}|sqrt|lim`;
const NAME = `[A-Za-zπθ]′?(?![A-Za-z])`;
/** A named function carries its argument, so `cos x dx` does not need bare-letter juxtaposition. */
const FUNCTION = `(?:${FUNCTION_NAMES})(?![A-Za-z])(?:${GAP}*(?:${PAREN}|${BARS}|${NAME}${SCRIPTS}))?`;
/** `dx`, `dt`, `du`, `dy`, `dθ` — the only two-letter runs the corpus's integrands contain. */
const DIFFERENTIAL = String.raw`d[A-Za-zθ](?![A-Za-z])`;
const NUMBER = String.raw`\d+(?:\.\d+)?%?`;
const ATOM_BODY = `(?:${PAREN}|${BRACKET}|${BARS}|${FUNCTION}|${DIFFERENTIAL}|${INTEGRAL_OP}|½|${NAME}|${NUMBER})`;
const ATOM = `(?:√${GAP}*)?${ATOM_BODY}${SCRIPTS}`;
/**
 * Juxtaposition across a space is how `x³ dx`, `½ r² dθ` and `cos x` are written — but it is
 * also how English is written. A bare single letter may therefore START a run (`∫ f dx`) and may
 * follow an operator (`x · e^(x²)`), yet may never be picked up by juxtaposition alone; without
 * that restriction "∫ f dx I think" would swallow the `I`.
 */
const JUXTAPOSED = `(?:√${GAP}*)?(?:${PAREN}|${BRACKET}|${BARS}|${FUNCTION}|${DIFFERENTIAL}|${INTEGRAL_OP}|½|${NUMBER}|${NAME}${POWER}|${NAME}${SUB_CHARS})${SCRIPTS}`;
const OPERATOR = String.raw`[-+−×÷·*/=<>≤≥≠≈]`;
const RUN = `${ATOM}(?:${GAP}*${OPERATOR}${GAP}*${ATOM}|${ATOM}|${GAP}+${JUXTAPOSED})*`;
/** `lim(x→4⁻) = 4 − 1 = 3` and `∫₁⁴ = ∫₁³ + ∫₃⁴`: the operator may lead, the result is the body. */
const BODY = `(?:${GAP}*${OPERATOR})?${GAP}*${RUN}`;
/** `π∫₀¹ x⁴ dx`, `(1/2)∫₁² u³ du`, `½∫(1 + cos θ)²dθ` — the coefficient belongs to the integral. */
const COEFFICIENT = String.raw`(?:½|π|\([^()\s\n]{1,14}\))`;

const INTEGRAL_ISLAND = `${COEFFICIENT}?${INTEGRAL_OP}(?:${BODY})?`;
const SUMMATION_ISLAND =
  `[Σ∑](?:${GAP}*${RUN})?` +
  `(?:${GAP}*(?:from|for)${GAP}+[A-Za-z]${GAP}*=${GAP}*[A-Za-z0-9]+(?:${GAP}+to${GAP}+[A-Za-z0-9]+)?)?` +
  `(?:${GAP}*of${GAP}+${RUN})?`;
const LIMIT_ISLAND = `\\blim(?![A-Za-z])(?:${GAP}*\\(${GAP}*[A-Za-z]${GAP}*→[^()\\n]{1,16}\\))?(?:${BODY})?`;

const CALCULUS_ISLANDS = [INTEGRAL_ISLAND, SUMMATION_ISLAND, LIMIT_ISLAND].map((island) => new RegExp(island, "g"));
/** Cheap gate: the overwhelming majority of the corpus contains no calculus operator at all. */
const CALCULUS_OPERATOR = /[∫Σ∑]|\blim\b/;
/** The operator alone carries no mathematics: "The ∫ is a stretched S for 'sum'" is prose. */
const BARE_OPERATOR = /^(?:∫|[Σ∑]|lim)$/;
const WORDS = /[A-Za-z]{3,}/g;
const FUNCTION_WORDS = new Set(FUNCTION_NAMES.split("|"));
/** The summation's own authored scaffolding, which SUMMATION_ISLAND consumes rather than typesets. */
const SUM_SCAFFOLD = /\b(?:from|for)[ \t]+[A-Za-z][ \t]*=[ \t]*[A-Za-z0-9]+(?:[ \t]+to[ \t]+[A-Za-z0-9]+)?(?:[ \t]+of\b)?/g;

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
    .replace(new RegExp(`(?<!\\\\)\\b(${TEX_FUNCTIONS})(?![A-Za-z])`, "g"), "\\$1")
    .replaceAll("½", "\\frac{1}{2}");

  const summation = tex.match(SUMMATION_BOUNDS);
  if (summation) {
    const [, before, index, lower, upper, after] = summation;
    const bounds = upper ? `_{${index}=${lower}}^{${upper}}` : `_{${index}=${lower}}`;
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
  tex = tex.replace(/\blim(?![A-Za-z])\s*\(\s*([^()\n]*?\\to[^()\n]*?)\s*\)/g, (_match, approach: string) =>
    `\\lim_{${approach.replace(/\s*\\to\s*/, " \\to ").trim()}}`
  );
  tex = tex.replace(/(?<!\\)\blim(?![A-Za-z])\s*/g, "\\lim ").replace(/\\lim (?=[_^])/g, "\\lim");

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
  /* S242. Authors write both `≤` and `<=`. Normalising the ASCII pair to the Unicode relation here
   * — rather than adding a second spelling to the symbol table, the false-claim evaluator and every
   * future branch — means the rest of this file keeps one canonical form to reason about. Done
   * first so the `≤`/`≥` entries below pick them up. */
  const tex = subscriptToTex(superscriptToTex(source).replaceAll("<=", "≤").replaceAll(">=", "≥"))
    .replace(/\^\(((?:[^()]|\([^()]*\))*)\)/g, "^{$1}")
    .replace(/\^([A-Za-z0-9?π∞+−-]+)/g, "^{$1}")
    .replace(/(?<![A-Za-z])sqrt\s*\(((?:[^()]|\([^()]*\))*)\)/gi, "\\sqrt{$1}")
    .replace(/√\(((?:[^()]|\([^()]*\))*)\)/g, "\\sqrt{$1}")
    .replace(/√\|([^|]+)\|/g, "\\sqrt{\\lvert $1\\rvert}")
    .replace(/√([A-Za-z0-9]+)/g, "\\sqrt{$1}")
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
    matches.push({ start: match.index, end: match.index + match[0].length, source: match[0] });
  }
}

/** Integral, summation and limit islands, minus the two shapes that must stay prose. */
function calculusMatches(text: string): Match[] {
  if (!CALCULUS_OPERATOR.test(text)) return [];
  const found: Match[] = [];
  for (const island of CALCULUS_ISLANDS) collect(text, island, found);
  return found.filter((match) => !BARE_OPERATOR.test(match.source.trim()) && !hasProseWord(match.source));
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

  collect(text, /\([^()\n]*\^[^()\n]*\)(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|[A-Za-z0-9?π∞+−-]+))?/g, candidates);
  // S242: the exponent admits ONE level of nesting, as powerShorthandToTex already does. Without
  // it "2^(3 + (−1))" matched no exponent at all and left "2^()" sitting in the prose.
  collect(text, /(?:[A-Za-z0-9?]+|\([^()\n]+\))\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|[A-Za-z0-9?π∞+−-]+)/g, candidates);
  collect(text, /(?:(?<![A-Za-z0-9])\d+\s*)?(?<![A-Za-z])sqrt\s*\([^()\n]+\)/gi, candidates);
  collect(text, /√(?:\([^()\n]+\)|\|[^|\n]+\||[A-Za-z0-9]+)/g, candidates);
  collect(text, /(?<![\w/])\d+\s*\/\s*\d+(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|[A-Za-z0-9?π∞+−-]+))?(?![\w/])/g, candidates);

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
    const term = String.raw`(?:\d+\s*\/\s*\d+|(?<![A-Za-z])\d*[A-Za-z](?![A-Za-z])(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|[A-Za-z0-9?π∞+−-]+))?|\d+(?:\.\d+)?%?|\([^()\n]{1,40}\))`;
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
    collect(text, new RegExp(`${operand}\\s*(?:<=|>=|≤|≥|≠)\\s*${operand}`, "g"), relations);
    for (const candidate of relations) {
      if (!isFalseNumericClaim(candidate.source)) candidates.push(candidate);
    }
  }

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
    const atom = String.raw`(?:\d+\s*\/\s*\d+|(?<![A-Za-z])\d*[A-Za-z](?![A-Za-z])(?:\^(?:\((?:[^()\n]|\([^()\n]*\))*\)|[A-Za-z0-9?π∞+−-]+))?|\d+(?:\.\d+)?%?|\([^()\n]{1,40}\))`;
    /* S242. `<=` and `>=` lead the alternation deliberately. Tried after the single `<`/`>`, the
     * scanner matches `>` alone, then looks for an atom, finds `=`, and abandons the run — which is
     * why 75 authored strings carrying ASCII inequalities leaked at a 100% rate while every other
     * operator in this class typeset fine. */
    const operator = String.raw`(?:<=|>=|=|≤|≥|≠|<|>|\+|−|×|÷|·|\*)`;
    /* S242 (ARCH-01). The arithmetic run is collected into its OWN array. The S237 boundary guard
     * below judges "is this candidate the tail of a longer expression the scanner cut into?" —
     * a question that is only meaningful about candidates the ARITHMETIC scanner produced. It used
     * to run over the whole `candidates` array, so it also judged the always-on islands collected
     * at the top of this function, and dropped them for the crime of following an operator. That
     * is why "a = sqrt(25)" rendered NOTHING once the atom stopped tearing: the radical island
     * exists, and the guard threw it away because `=` sat in front of it. A power, a radical or a
     * fraction after an equals sign is the single most ordinary shape in this corpus. */
    const arithmetic: Match[] = [];
    collect(text, new RegExp(`${atom}(?:\\s*${operator}\\s*${atom})+`, "g"), arithmetic);
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
      if (/[-−+×÷*/^=<>≤≥≠·.)]$/.test(before) || isFalseNumericClaim(arithmetic[i].source)) {
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
  const byStartThenLongest = (a: Match, b: Match) => a.start - b.start || (b.end - b.start) - (a.end - a.start);
  const accepted: Match[] = [];
  for (const candidate of [...calculusMatches(text).sort(byStartThenLongest), ...candidates.sort(byStartThenLongest)]) {
    if (accepted.some((match) => candidate.start < match.end && candidate.end > match.start)) continue;
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
  if (right === undefined || source.split(/[=≤≥≠<>]/).length !== 2) return false;
  const evaluate = (side: string): number | null => {
    const tokens = side.replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-").trim();
    if (!/^[\d\s+\-*/.()%]+$/.test(tokens) || !/\d/.test(tokens)) return null;
    // Shunting-yard over a closed numeric expression: no identifiers, no calls, nothing to inject.
    const out: number[] = [];
    const ops: string[] = [];
    const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
    const apply = () => {
      const op = ops.pop();
      const b = out.pop();
      const a = out.pop();
      if (op === undefined || a === undefined || b === undefined) return false;
      out.push(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b);
      return true;
    };
    const lexed = tokens.match(/\d+(?:\.\d+)?|[+\-*/()]/g) ?? [];
    for (let index = 0; index < lexed.length; index++) {
      const token = lexed[index];
      // Unary minus: "(-10/2)" and a leading "-5" are ordinary in this corpus, and treating them
      // as binary left the evaluator unable to decide — which silently let a false claim through.
      const previous = index === 0 ? undefined : lexed[index - 1];
      if (token === "-" && (previous === undefined || previous === "(" || "+-*/".includes(previous))) {
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
        while (ops.length && precedence[ops.at(-1) as string] >= precedence[token]) if (!apply()) return null;
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
  const holds = symbol === "=" ? Math.abs(a - b) < 1e-9
    : symbol === "≠" ? Math.abs(a - b) >= 1e-9
      : symbol === "<" ? a < b : symbol === ">" ? a > b
        : symbol === "≤" ? a <= b : a >= b;
  return !holds;
}

export function authoredMathParts(text: string, options: { includeArithmetic?: boolean } = {}): AuthoredMathPart[] {
  const matches = mathMatches(text, options.includeArithmetic ?? false);
  if (!matches.length) return [{ text }];

  const parts: AuthoredMathPart[] = [];
  let cursor = 0;
  for (const match of matches) {
    pushText(parts, text.slice(cursor, match.start));
    parts.push({ text: "", source: match.source, tex: powerShorthandToTex(match.source) });
    cursor = match.end;
  }
  pushText(parts, text.slice(cursor));
  return parts;
}
