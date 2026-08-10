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
