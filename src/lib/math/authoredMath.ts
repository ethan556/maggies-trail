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
  "⁺": "+", "⁻": "-"
};

const SUPERSCRIPT_RUN = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g;

function superscriptToTex(source: string): string {
  return source.replace(SUPERSCRIPT_RUN, (run) =>
    `^{${Array.from(run, (character) => SUPERSCRIPT[character] ?? character).join("")}}`
  );
}

/** Convert the corpus's explicit, author-friendly shorthand to TeX. */
export function powerShorthandToTex(source: string): string {
  return superscriptToTex(source)
    .replace(/\^\(([^()]*)\)/g, "^{$1}")
    .replace(/\^([A-Za-z0-9?+-]+)/g, "^{$1}")
    .replace(/\bsqrt\s*\(([^()]*)\)/gi, "\\sqrt{$1}")
    .replace(/√\(([^()]*)\)/g, "\\sqrt{$1}")
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
    .replaceAll("≠", "\\ne ");
}

function collect(source: string, pattern: RegExp, matches: Match[]): void {
  pattern.lastIndex = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index === undefined || !match[0]) continue;
    matches.push({ start: match.index, end: match.index + match[0].length, source: match[0] });
  }
}

/**
 * Find explicit math islands. The patterns are intentionally conservative:
 *
 * - powers, including a single balanced parenthesized group with spaces;
 * - numeric fractions (never dates, URLs, or word/word text);
 * - `sqrt(...)` shorthand;
 *
 * Overlaps are resolved longest-first, so `(x^2 y^3)^2` becomes one MathML
 * expression instead of two invalid fragments.
 */
function mathMatches(text: string, includeArithmetic: boolean): Match[] {
  const candidates: Match[] = [];

  collect(text, /\([^()\n]*\^[^()\n]*\)(?:\^(?:\([^()\n]*\)|[A-Za-z0-9?+-]+))?/g, candidates);
  collect(text, /(?:[A-Za-z0-9?]+|\([^()\n]+\))\^(?:\([^()\n]*\)|[A-Za-z0-9?+-]+)/g, candidates);
  collect(text, /\bsqrt\s*\([^()\n]+\)/gi, candidates);
  collect(text, /√(?:\([^()\n]+\)|\|[^|\n]+\||[A-Za-z0-9]+)/g, candidates);
  collect(text, /(?<![\w/])\d+\s*\/\s*\d+(?![\w/])/g, candidates);

  if (includeArithmetic) {
    const atom = String.raw`(?:\d+\s*\/\s*\d+|\d+(?:\.\d+)?%?|\d*[A-Za-z](?:\^(?:\([^()\n]*\)|[A-Za-z0-9?+-]+))?|\([^()\n]{1,40}\))`;
    const operator = String.raw`(?:=|≤|≥|≠|<|>|\+|−|×|÷|·|\*)`;
    collect(text, new RegExp(`${atom}(?:\\s*${operator}\\s*${atom})+`, "g"), candidates);
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
    for (let i = candidates.length - 1; i >= 0; i--) {
      const before = text.slice(0, candidates[i].start).replace(/\s+$/, "");
      if (/[-−+×÷*/^=<>≤≥≠·.)]$/.test(before) || isFalseNumericClaim(candidates[i].source)) {
        candidates.splice(i, 1);
      }
    }
  }

  candidates.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const accepted: Match[] = [];
  for (const candidate of candidates) {
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
