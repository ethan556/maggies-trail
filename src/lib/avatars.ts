/**
 * WS-J — Student avatar & identity system: canonical manifest + resolution service.
 *
 * NO PRODUCTION ART YET. Every entry in `AVATARS` below is concept-only: an id, a deterministic
 * (future) filename pair, an age band, and `enabled: false`. No file exists on disk at those
 * paths, and none should ever be created by cropping or reusing
 * `design-reference/ws-j-avatar-board-*.png` — those boards are commissioning references only
 * (`OPTIMIZATION_PLAN_V3.md:141`: "A student never selects a quadrant of a board, and no board
 * crop is ever claimed as final art"). See `AVATAR_CONCEPT_LEDGER.md` for what each anchored
 * concept looks like and `AVATAR_ART_PRODUCTION_SPEC.md` for exactly how it must be re-rendered
 * before its `enabled` flag may flip to `true` — `avatars.test.ts` enforces that mechanically: an
 * `enabled: true` entry with no file on disk fails the suite.
 *
 * This module owns avatar identity end to end: the manifest shape, the deterministic
 * id → file-path derivation, and every read used elsewhere to resolve an id to a real, currently
 * shippable asset. Nothing outside this file should construct an avatar path by hand.
 *
 * Deliberately NOT in this pass (see the WS-J research report, "What this pass skips"):
 * `Profile.avatarId` in `./progress.ts` and the corresponding merge/validation lines in
 * `./sync.ts` are not added yet — both are hot, deeply-tested shared files with a concurrent
 * implementation wave already touching adjacent code, so the field addition is left as a small,
 * isolated follow-up (mirroring the existing `displayName` LWW pattern in `sync.ts`) rather than
 * risking a collision here. No picker component, no propagation to any render surface, no
 * service-worker precache — this file is the standalone foundation those land on.
 *
 * No race/ethnicity field. No gender field. No inferred identity, ever
 * (`OPTIMIZATION_PLAN_V3.md:146`).
 */

/** The four age-aware collections, preserving the concept boards' maturity range. */
export type AgeBand = "early" | "explorer" | "adventurer" | "summit";

/** `human` = an illustrated portrait; `symbol` = a neutral/symbolic option (mark, compass, star,
 *  animal, …). `AvatarDefinition` gives every entry a real `ageBand` regardless of kind — the
 *  plan's manifest shape (`OPTIMIZATION_PLAN_V3.md:146`) has no separate "bandless" case — but a
 *  symbol's band need not gate its visibility the way a human portrait's does: the plan's "See all
 *  avatars" escape hatch (`:148`) makes any collection, symbols included, reachable regardless of
 *  the band a learner's grade opens by default. No symbol concepts exist yet (see
 *  AVATAR_CONCEPT_LEDGER.md finding 4); how their `ageBand` values get assigned is a decision for
 *  whoever designs them. */
export type AvatarKind = "human" | "symbol";

/** `OPTIMIZATION_PLAN_V3.md:146`'s exact manifest shape. `id` is the sole value ever persisted on
 *  a Profile (once that field lands) — never a URL, so artwork stays replaceable forever. */
export interface AvatarDefinition {
  id: string;
  src256: string;
  src512: string;
  ageBand: AgeBand;
  kind: AvatarKind;
  /** Display position within its collection, 1-based. Curatable independently of `id` — adding or
   *  reordering avatars later never renumbers an existing id (see AVATAR_ART_PRODUCTION_SPEC.md
   *  §5's per-band filename blocks). */
  order: number;
  /** True only once real production art (AVATAR_ART_PRODUCTION_SPEC.md-compliant) exists at both
   *  `src256` and `src512` on disk. Every entry below is `false` — see the file banner. */
  enabled: boolean;
}

/** `256` = grid/picker size, `512` = profile size (`OPTIMIZATION_PLAN_V3.md:151`). */
export type AvatarSize = 256 | 512;

const AVATAR_DIR = "/avatars";

/** The single place an id becomes a file path. Every AvatarDefinition below is built through this
 *  (via `defineAvatar`), so an id and its paths can never drift apart. */
function avatarSrc(id: string, size: AvatarSize): string {
  return `${AVATAR_DIR}/${id}-${size}.webp`;
}

/** Every declared avatar today is concept-only — `enabled` is hardcoded false here so a future
 *  edit can never accidentally declare a new id as already shipped; flipping it to true is a
 *  deliberate, separate act tied to real files landing on disk. */
function defineAvatar(id: string, ageBand: AgeBand, kind: AvatarKind, order: number): AvatarDefinition {
  return {
    id,
    src256: avatarSrc(id, 256),
    src512: avatarSrc(id, 512),
    ageBand,
    kind,
    order,
    enabled: false
  };
}

/**
 * The manifest. Sixteen entries — exactly the 16 board-anchored concepts catalogued in
 * `AVATAR_CONCEPT_LEDGER.md`, none of them production-ready. The remaining slots this library will
 * eventually hold (band expansion to ~12 each, plus 8–12 neutral/symbolic options — see
 * `AVATAR_ART_PRODUCTION_SPEC.md` §5b) have no concept to anchor a manifest entry to yet, so they
 * are documented there as reserved id ranges rather than fabricated here as empty entries.
 *
 * Ids follow the per-band block convention in AVATAR_ART_PRODUCTION_SPEC.md §5: 0xx = early,
 * 1xx = explorer, 2xx = adventurer, 3xx = summit, 4xx = symbol. `avatars.test.ts` checks every
 * entry's block agrees with its `ageBand`.
 */
export const AVATARS: AvatarDefinition[] = [
  // ---- early (K-2) — anchors from board 2 (C05-C08) and board 3 (C09-C12) ----
  // C05: two high puff buns with braided sections + gold bead accents; yellow tee under denim overalls
  defineAvatar("avatar-001", "early", "human", 1),
  // C06: straight black hair with a fringe; round dark-rimmed glasses; royal-blue hoodie
  defineAvatar("avatar-002", "early", "human", 2),
  // C07: dark wavy high ponytail with a yellow scrunchie; purple embroidered tunic top
  defineAvatar("avatar-003", "early", "human", 3),
  // C08: loose curly mid-brown hair; freckles; green-and-cream raglan tee
  defineAvatar("avatar-004", "early", "human", 4),
  // C09: teal head covering (hijab-style); cream top with floral embroidery
  defineAvatar("avatar-005", "early", "human", 5),
  // C10: short tightly-coiled dark hair; golden-yellow drawstring hoodie
  defineAvatar("avatar-006", "early", "human", 6),
  // C11: shoulder-length coppery-red hair; freckles; sage-green tee under denim overalls
  defineAvatar("avatar-007", "early", "human", 7),
  // C12: short straight black hair, side-swept fringe; royal-blue zip jacket over a striped tee
  defineAvatar("avatar-008", "early", "human", 8),

  // ---- explorer (3-5) — anchors from board 4 (C13-C16) ----
  // C13: short twists/coils on top with faded sides; royal-blue track jacket, white shoulder stripes
  defineAvatar("avatar-101", "explorer", "human", 1),
  // C14: straight black chin-length bob, center part; lilac cardigan over a cream collared shirt
  defineAvatar("avatar-102", "explorer", "human", 2),
  // C15: short wavy black hair; forest-green crewneck over a cream tee
  defineAvatar("avatar-103", "explorer", "human", 3),
  // C16: long wavy brown hair; gold hoop earrings; denim jacket over a cream top
  defineAvatar("avatar-104", "explorer", "human", 4),

  // ---- adventurer (6-8) — anchors from board 1 (C01-C04) ----
  // C01: long thin box braids past the shoulders; gold hoop earrings + pendant; dark-green ribbed top
  defineAvatar("avatar-201", "adventurer", "human", 1),
  // C02: tousled wavy golden-brown hair; freckles; cream hoodie under a blue denim jacket
  defineAvatar("avatar-202", "adventurer", "human", 2),
  // C03: short tousled black hair with a fringe; navy zip jacket over a black hoodie
  defineAvatar("avatar-203", "adventurer", "human", 3),
  // C04: very long wavy dark hair; turquoise earrings + pendant; patterned rust-red top
  defineAvatar("avatar-204", "adventurer", "human", 4)

  // ---- summit (9-13) — zero board anchors; see AVATAR_CONCEPT_LEDGER.md finding 1 (P0) ----
  // ---- symbol — zero board anchors; net-new, brand-language design (P2) ----
];

/**
 * Grade → age band. Total and deterministic over the whole numeric range, matching the product's
 * grade ids (0 = Kindergarten … 13 = Calculus; see `OnboardingFlow.tsx`'s `GRADES` table and
 * `sync.ts`'s `integerIn(..., 0, 13)` bounds). Boundaries: 0–2 early, 3–5 explorer, 6–8
 * adventurer, 9–13 summit.
 *
 * Out-of-range input clamps rather than throwing, so a caller never needs to guard first:
 * negative grades fall into `early` (the first branch that can match), and anything at or above
 * the top of the range — including `+Infinity` and, because every comparison with `NaN` is
 * `false`, a `NaN` input — falls through every branch to `summit`, the last return.
 */
export function gradeToAgeBand(grade: number): AgeBand {
  if (grade <= 2) return "early";
  if (grade <= 5) return "explorer";
  if (grade <= 8) return "adventurer";
  return "summit";
}

/** Look up a manifest entry by id, enabled or not. Returns `undefined` for an unknown id. Use this
 *  for inspection/admin purposes; use `isValidAvatarId`/`getAvatarSrc` on any path that renders to
 *  a learner, since those two gate on `enabled` and this one deliberately does not. */
export function getAvatar(id: string): AvatarDefinition | undefined {
  return AVATARS.find((a) => a.id === id);
}

/** True only for an id that names a manifest entry AND is `enabled`. This is the gate every
 *  render path and every stored-id fallback chain must go through: a since-disabled id (art
 *  pulled after a QA rejection) fails validation exactly like an id that never existed, so a
 *  caller's fallback logic doesn't need two separate cases. */
export function isValidAvatarId(id: string): boolean {
  return AVATARS.some((a) => a.id === id && a.enabled);
}

/** Resolve an id + size to an image path — but only if that id is currently valid
 *  (`isValidAvatarId`). Returns `undefined` otherwise, deliberately: this function must never hand
 *  back a path to art that doesn't exist, even for a well-formed but disabled/unknown id. Callers
 *  needing a guaranteed-renderable fallback should use `AVATAR_PLACEHOLDER_SRC`. */
export function getAvatarSrc(id: string, size: AvatarSize): string | undefined {
  if (!isValidAvatarId(id)) return undefined;
  const avatar = getAvatar(id);
  return avatar && (size === 256 ? avatar.src256 : avatar.src512);
}

/** Every currently-enabled avatar in a band, in display order. (Today: always `[]`, for every
 *  band — the honest state of a manifest with zero enabled entries. See
 *  AVATAR_ART_PRODUCTION_SPEC.md §8.) */
export function getAvatarsForAgeBand(band: AgeBand): AvatarDefinition[] {
  return AVATARS.filter((a) => a.ageBand === band && a.enabled).sort((a, b) => a.order - b.order);
}

/** The grade-appropriate default: the first enabled avatar (by `order`) in that grade's band.
 *  Returns `undefined` while the band has no enabled entries — which is every band today — so
 *  callers fall through the rest of the `OPTIMIZATION_PLAN_V3.md:147` chain (retained legacy
 *  image → generated initials → default Maggie mark) exactly as they would for any other miss. */
export function getDefaultAvatarForGrade(grade: number): AvatarDefinition | undefined {
  return getAvatarsForAgeBand(gradeToAgeBand(grade))[0];
}

/**
 * Dev-only visual fallback — a neutral silhouette, explicitly labeled as a placeholder in its own
 * file (`<title>` + an XML comment). NOT a member of `AVATARS`, never returned by `getAvatarSrc`
 * or validated by `isValidAvatarId`, and never to be offered as a selectable option by any future
 * picker UI. Exists only so a render path has something honest to show before a learner has
 * chosen, or after a stored id is invalidated, while the manifest has zero enabled entries.
 */
export const AVATAR_PLACEHOLDER_SRC = `${AVATAR_DIR}/placeholder-neutral.svg`;
