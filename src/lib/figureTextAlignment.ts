import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "./figureTextMismatchBlocklist.generated";
import { FIGURE_NUMERIC_CLAIMS } from "./figureNumericClaims.generated";
import {
  compareExactFigureNumericParity,
  FIXED_NUMERIC_EXEMPLAR_CONTRACTS,
  hasExplicitNumericOrSymbolicClaim,
  isDeclaredFixedNumericExemplarAligned,
} from "./figureNumericParity";

/**
 * Fixed-example figures must not be shown beside unrelated prose.
 *
 * Most figures are concept-specific and can be selected by ID alone. Four
 * legacy exemplars retain their focused checks below. Every registered figure
 * whose live SVG title asserts arithmetic/equality is generated into an exact
 * numeric-claim map; the smaller manual registry adds narrow generic-semantic
 * allowances. An unrecognised figure remains available.
 */
export const FIXED_EXEMPLAR_FIGURES = [
  "count-on-hops",
  "bar-compare",
  "number-track",
  "frac-equal-vs-unequal",
  ...Object.keys(FIXED_NUMERIC_EXEMPLAR_CONTRACTS),
  ...Object.keys(FIGURE_NUMERIC_CLAIMS),
] as const;

function plain(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function figureTextBindingKey(id: string, text: string): string {
  const value = `${id}\n${plain(text)}`;
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function isFigureTextAligned(id: string, text: string): boolean {
  if (FIGURE_TEXT_MISMATCH_BLOCKLIST.has(figureTextBindingKey(id, text))) return false;
  if (id in FIXED_NUMERIC_EXEMPLAR_CONTRACTS && !isDeclaredFixedNumericExemplarAligned(id, text)) return false;
  const renderedClaim = FIGURE_NUMERIC_CLAIMS[id as keyof typeof FIGURE_NUMERIC_CLAIMS];
  if (renderedClaim && hasExplicitNumericOrSymbolicClaim(text) && !compareExactFigureNumericParity(renderedClaim, text).aligned) return false;
  const value = plain(text);

  if (id === "count-on-hops") {
    return (
      /4\s*\+\s*3/.test(value) ||
      /start(?:ing)? at 4.*(?:5.*6.*7|land.*7)/.test(value) ||
      /after 4 comes 5,? 6,? 7/.test(value)
    );
  }

  if (id === "bar-compare") {
    return (
      /9\s*-\s*5\s*=\s*4/.test(value) ||
      (/\b9\b/.test(value) && /\b5\b/.test(value) && /compare|subtract|difference|more/.test(value))
    );
  }

  if (id === "number-track") {
    return (
      /count(?:ing)? (?:keeps going|continues) past 20/.test(value) ||
      /20,? 21,? 22,? 23/.test(value) ||
      /17,? 18,? 19,? 20/.test(value) ||
      /numbers have an order/.test(value)
    );
  }

  if (id === "frac-equal-vs-unequal") {
    const namesThirds = /\bthree\b|\bthirds?\b|\b1\s*\/\s*3\b/.test(value);
    const namesFourths = /\bfour\b|\bfourths?\b|\b1\s*\/\s*4\b/.test(value);
    return !namesThirds || namesFourths;
  }

  return true;
}
