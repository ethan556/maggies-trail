/**
 * Semantic palette: color as *concept role*, not decoration.
 *
 * The five brand tokens each carry a fixed pedagogical meaning so that color is a
 * consistent channel for comprehension across every figure and manipulative:
 *   - a "given" quantity is always INK, a "target/unknown" is always TANGERINE, etc.
 * Figures historically inlined these hexes locally; new code imports from here so the
 * meaning stays single-sourced. See DESIGN.md for the role contract.
 */
export const PALETTE = {
  ink: "#22314F", // given / neutral structure / body text
  sky: "#2E7CD6", // primary / active / the result being built
  tangerine: "#FF8A3D", // unknown / target / the thing to find
  leaf: "#2FA36B", // auxiliary / a correct/confirmed state
  berry: "#D6455D" // image / scaled copy / an error to repair
} as const;

export type PaletteToken = keyof typeof PALETTE;

/** Concept role → token. The vocabulary authors and widgets reason in. */
export const ROLE = {
  given: "ink",
  active: "sky",
  target: "tangerine",
  correct: "leaf",
  error: "berry"
} as const satisfies Record<string, PaletteToken>;

export type ConceptRole = keyof typeof ROLE;

/** Resolve a concept role to its hex. */
export function roleColor(role: ConceptRole): string {
  return PALETTE[ROLE[role]];
}

/* ---- contrast utilities (WCAG relative luminance) ---- */

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of a #rrggbb hex. */
export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
