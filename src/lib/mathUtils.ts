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
