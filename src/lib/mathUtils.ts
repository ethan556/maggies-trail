/**
 * Shared pure math helpers. Deliberately tiny and dependency-free so the
 * schema layer (which must stay import-light and side-effect-free) can use it.
 * Consolidates gcd, which was previously inlined in schema.ts, evaluate.ts and
 * widgets.tsx — one definition, one behavior, one place to test.
 */

/** Greatest common divisor (Euclid). gcd(a, 0) = a; sign follows `a`. */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Reduce a fraction to lowest terms, preserving sign on the numerator. */
export function reduceFraction(num: number, den: number): [number, number] {
  if (den === 0) return [num, 0];
  const g = Math.abs(gcd(num, den)) || 1;
  const s = den < 0 ? -1 : 1;
  return [(num / g) * s, Math.abs(den / g)];
}

/** S237 — fraction-first display. A fraction subject must be SHOWN as a fraction; a decimal may
 * appear beside it, never as its equal. Reported by a learner against `fractionBar`, which
 * printed "4/12 = 0.333 ✓ equal" — and 4/12 is exactly 1/3, whose decimal never terminates, so
 * the "=" asserted something false while a ✓ sat next to it. */

/** The reduced fraction as text: "1/3", or the whole number when the denominator reduces to 1. */
export function fractionText(num: number, den: number): string {
  if (den === 0) return "—";
  const [n, d] = reduceFraction(num, den);
  return d === 1 ? String(n) : `${n}/${d}`;
}

/** The EXACT decimal, or null when the expansion does not terminate.
 *
 * A fraction terminates iff its reduced denominator has no prime factor besides 2 and 5. When it
 * does, the decimal is exact and may be shown with "="; when it does not, any printed decimal is
 * an approximation and must be marked as one. Returning null rather than a rounded string is the
 * point: a caller cannot accidentally print a rounded value as though it were equal. */
export function terminatingDecimal(num: number, den: number): string | null {
  if (den === 0) return null;
  const [n, d] = reduceFraction(num, den);
  let rest = d;
  while (rest % 2 === 0) rest /= 2;
  while (rest % 5 === 0) rest /= 5;
  if (rest !== 1) return null;
  // Safe: a terminating expansion has at most log2(d)+log5(d) places, well inside float precision
  // for the denominators this app draws (bars cap at 20, tables at low hundreds).
  return String(n / d);
}

/** Fraction first, decimal only beside it and only when honest:
 *   3/4  -> "3/4 (0.75)"      exact, so the decimal is stated
 *   1/3  -> "1/3"             non-terminating, so no decimal is invented
 * `approx` opts into an explicitly-approximate decimal for surfaces that need a magnitude cue. */
export function fractionWithDecimal(num: number, den: number, approx = false): string {
  const frac = fractionText(num, den);
  const exact = terminatingDecimal(num, den);
  if (exact !== null) return `${frac} (${exact})`;
  if (!approx || den === 0) return frac;
  return `${frac} (≈ ${(num / den).toFixed(3)})`;
}
