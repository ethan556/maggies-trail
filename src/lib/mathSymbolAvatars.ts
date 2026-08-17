import type { AvatarDefinition, AvatarSize } from "@/lib/avatars";

export type MathSymbolAvatarId =
  | "avatar-501"
  | "avatar-502"
  | "avatar-503"
  | "avatar-504"
  | "avatar-505"
  | "avatar-506"
  | "avatar-507"
  | "avatar-508"
  | "avatar-509"
  | "avatar-510"
  | "avatar-511"
  | "avatar-512";

export interface MathSymbolAvatarDefinition extends AvatarDefinition {
  id: MathSymbolAvatarId;
  collection: "math-symbols";
  semanticName: string;
  symbol: string;
}

/** Independent release fence. The mathematics collection is all-or-none and does not weaken the
 * locked 60-avatar core library. */
export const ENABLED_MATH_SYMBOL_AVATAR_IDS: readonly MathSymbolAvatarId[] = [
  "avatar-501",
  "avatar-502",
  "avatar-503",
  "avatar-504",
  "avatar-505",
  "avatar-506",
  "avatar-507",
  "avatar-508",
  "avatar-509",
  "avatar-510",
  "avatar-511",
  "avatar-512"
];
const enabled = new Set<string>(ENABLED_MATH_SYMBOL_AVATAR_IDS);

const definitions: Array<[MathSymbolAvatarId, string, string]> = [
  ["avatar-501", "π", "Pi symbol avatar"],
  ["avatar-502", "θ", "Theta symbol avatar"],
  ["avatar-503", "∫", "Integral symbol avatar"],
  ["avatar-504", "Σ", "Sigma symbol avatar"],
  ["avatar-505", "√", "Square root symbol avatar"],
  ["avatar-506", "Δ", "Delta symbol avatar"],
  ["avatar-507", "∇", "Nabla symbol avatar"],
  ["avatar-508", "±", "Plus-minus symbol avatar"],
  ["avatar-509", "≈", "Approximately equal symbol avatar"],
  ["avatar-510", "∂", "Partial derivative symbol avatar"],
  ["avatar-511", "ƒ", "Function symbol avatar"],
  ["avatar-512", "→", "Limit symbol avatar"]
];

const expectedIds = definitions.map(([id]) => id);
const completeCohortEnabled =
  ENABLED_MATH_SYMBOL_AVATAR_IDS.length === expectedIds.length &&
  new Set(ENABLED_MATH_SYMBOL_AVATAR_IDS).size === expectedIds.length &&
  expectedIds.every((id) => enabled.has(id));

function src(id: MathSymbolAvatarId, size: AvatarSize): string {
  return `/avatars/math-symbols/${id}-${size}.webp`;
}

export const MATH_SYMBOL_AVATARS: MathSymbolAvatarDefinition[] = definitions.map(
  ([id, symbol, semanticName], index) => ({
    id,
    src256: src(id, 256),
    src512: src(id, 512),
    ageBand: "summit",
    kind: "symbol",
    order: index + 1,
    // Deliberately ignore a partial allowlist. Stored ids and direct render paths must fail closed,
    // not merely the picker tab, until the complete reviewed 12-item cohort is released.
    enabled: completeCohortEnabled,
    collection: "math-symbols",
    semanticName,
    symbol
  })
);

export function getMathSymbolAvatar(id: string): MathSymbolAvatarDefinition | undefined {
  return MATH_SYMBOL_AVATARS.find((avatar) => avatar.id === id);
}

/** Never expose a partial mathematics collection. */
export function getEnabledMathSymbolAvatars(): MathSymbolAvatarDefinition[] {
  if (!completeCohortEnabled) return [];
  return MATH_SYMBOL_AVATARS.filter((avatar) => avatar.enabled).sort((a, b) => a.order - b.order);
}

export function isCompleteMathSymbolCohortEnabled(): boolean {
  return completeCohortEnabled;
}
