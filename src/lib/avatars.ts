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
 * WITHDRAWN 2026-08-14. A generated set of 120 WebPs was rendered, enabled and then pulled
 * after review against the WS-J concept boards. Recording why, so the next pass does not
 * repeat it: the art was internally consistent — uniform eye line, head scale, shoulder crop,
 * margin and background across all 60, which is the mechanical half of the §6 gate — but it
 * failed the half that matters. All four bands read at the same apparent age, so §3's
 * age-truth rule was unmet and `summit` was indistinguishable from `early`, the exact failure
 * §3 names ("high-school portraits are not enlarged elementary characters"). Facial geometry
 * and expression were constant across the 48, so the grid read as one figure with swapped hair
 * and garment layers rather than 48 portraits. The finish was gradient-shaded vector, not the
 * boards' painterly, dimensional language (§2), and every figure used one flat neutral tone
 * where the boards show individuated children.
 *
 * `avatars.test.ts` passed 27/27 throughout. That is not a defect in the test — §6 says
 * outright it "cannot verify quality (that is FABLE-Q's job, from pixels)". Standing proof
 * that no mechanical gate substitutes for reading the contact sheet.
 *
 * Matching the boards needs a real image model, not a programmatic renderer. See
 * AVATAR_PROMPT_PACK.md for the 60 render-ready prompts, style-locked to those boards.
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
 *  the band a learner's grade opens by default. Twelve symbol concepts exist below (avatar-401
 *  through avatar-412, id block `4` per AVATAR_ART_PRODUCTION_SPEC.md §5, every one `enabled:
 *  false`) — their `ageBand` values were assigned three-per-band by thematic/tonal fit (a fox or
 *  owl portrait reads `early`; a topographic badge or constellation reads `summit`) rather than
 *  concentrated in one band, precisely because that band is a default/preload grouping, not an
 *  access restriction — see AVATAR_CONCEPT_LEDGER.md's "Expansion concept tables" section for the
 *  full reasoning. */
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
 * The manifest. Sixty entries: the original 16 board-anchored concepts (avatar-001…008,
 * avatar-101…104, avatar-201…204 — `AVATAR_CONCEPT_LEDGER.md`'s original concept table, C01–C16)
 * plus 44 net-new expansion concepts that bring every human band to its ~12 target and stand up
 * the symbol collection for the first time — 4 more `early`, 8 more `explorer`, 8 more
 * `adventurer`, all 12 `summit` (zero board anchors existed for this band — see finding 1), and
 * all 12 `symbol` (zero board anchors existed for any symbol — see finding 4). None of the 60 is
 * production-ready; every single entry below is `enabled: false`. See
 * `AVATAR_CONCEPT_LEDGER.md`'s "Expansion concept tables" section for the full trait rationale
 * behind each of the 44 net-new entries — hairstyle, accessories, clothing, expression only, never
 * race, ethnicity, or an invented name, matching the original 16's register exactly.
 *
 * Ids follow the per-band block convention in AVATAR_ART_PRODUCTION_SPEC.md §5: 0xx = early,
 * 1xx = explorer, 2xx = adventurer, 3xx = summit, 4xx = symbol. `avatars.test.ts` checks every
 * human entry's block agrees with its `ageBand` one-to-one; symbol entries (block 4xx) carry a
 * real `ageBand` too, but — per the `AvatarKind` doc comment above — it's assigned per-entry by
 * thematic fit rather than fixed by the block, so that same test checks it's a valid `AgeBand`
 * rather than one band for the whole block.
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
  // ---- early expansion — net-new, no board source (P2) ----
  // curly afro-textured hair shaped into a rounded puff with a thin striped headband; wide gap-toothed grin; teal-and-cream color-blocked tee
  defineAvatar("avatar-009", "early", "human", 9),
  // two short braided pigtails finished with small colorful beads; easy smile; rust-red overalls over a cream long-sleeve top
  defineAvatar("avatar-010", "early", "human", 10),
  // chin-length straight hair held back with a wide fabric headband; round dark-rimmed glasses; golden-yellow cardigan over a cream tee
  defineAvatar("avatar-011", "early", "human", 11),
  // short loose curls with a single flower hair clip; freckles across the cheeks; sage-green tunic top with rust trim
  defineAvatar("avatar-012", "early", "human", 12),

  // ---- explorer (3-5) — anchors from board 4 (C13-C16) ----
  // C13: short twists/coils on top with faded sides; royal-blue track jacket, white shoulder stripes
  defineAvatar("avatar-101", "explorer", "human", 1),
  // C14: straight black chin-length bob, center part; lilac cardigan over a cream collared shirt
  defineAvatar("avatar-102", "explorer", "human", 2),
  // C15: short wavy black hair; forest-green crewneck over a cream tee
  defineAvatar("avatar-103", "explorer", "human", 3),
  // C16: long wavy brown hair; gold hoop earrings; denim jacket over a cream top
  defineAvatar("avatar-104", "explorer", "human", 4),
  // ---- explorer expansion — net-new, no board source (P2) ----
  // curly afro-textured hair in a rounded high puff with a thin patterned headband; easy grin; royal-blue zip-up hoodie over a cream striped tee
  defineAvatar("avatar-105", "explorer", "human", 5),
  // two neat box braids gathered into low pigtails; round wire-rimmed glasses; golden-yellow raglan tee under an open chambray shirt
  defineAvatar("avatar-106", "explorer", "human", 6),
  // patterned teal-and-cream head wrap framing the face, loose strands at the temples; small gold stud earrings; sage-green quarter-zip pullover over a cream tee
  defineAvatar("avatar-107", "explorer", "human", 7),
  // short tightly-coiled hair cut close with a sharp side part; confident grin; teal track jacket with cream trim over a cream tee
  defineAvatar("avatar-108", "explorer", "human", 8),
  // straight waist-length hair in a high ponytail wrapped with a bright scrunchie; freckles; lilac zip hoodie over a cream tee
  defineAvatar("avatar-109", "explorer", "human", 9),
  // short wavy hair with a deep side part; thin round glasses; rust bomber-style jacket over a cream tee
  defineAvatar("avatar-110", "explorer", "human", 10),
  // chin-length curly bob; small silver hoop earrings; forest-green cardigan over a cream striped tee
  defineAvatar("avatar-111", "explorer", "human", 11),
  // short natural coils with a faded side part and a single thin braid accent; warm smile; denim jacket over a golden-yellow tee
  defineAvatar("avatar-112", "explorer", "human", 12),

  // ---- adventurer (6-8) — anchors from board 1 (C01-C04) ----
  // C01: long thin box braids past the shoulders; gold hoop earrings + pendant; dark-green ribbed top
  defineAvatar("avatar-201", "adventurer", "human", 1),
  // C02: tousled wavy golden-brown hair; freckles; cream hoodie under a blue denim jacket
  defineAvatar("avatar-202", "adventurer", "human", 2),
  // C03: short tousled black hair with a fringe; navy zip jacket over a black hoodie
  defineAvatar("avatar-203", "adventurer", "human", 3),
  // C04: very long wavy dark hair; turquoise earrings + pendant; patterned rust-red top
  defineAvatar("avatar-204", "adventurer", "human", 4),
  // ---- adventurer expansion — net-new, no board source (P2) ----
  // short natural coils cut close with a defined part; confident grin; teal zip-up jacket over a cream tee
  defineAvatar("avatar-205", "adventurer", "human", 5),
  // two thin braided pigtails past the shoulders with small gold cuffs at the ends; sage-green hoodie under a denim jacket
  defineAvatar("avatar-206", "adventurer", "human", 6),
  // loose corkscrew curls pulled half-up with a small clip; freckles; rust hoodie over a cream long-sleeve top
  defineAvatar("avatar-207", "adventurer", "human", 7),
  // chin-length straight bob with blunt bangs; small silver stud earrings; golden-yellow crewneck over a cream tee
  defineAvatar("avatar-208", "adventurer", "human", 8),
  // long single braid resting over one shoulder; wide open smile; royal-blue track jacket over a cream striped tee
  defineAvatar("avatar-209", "adventurer", "human", 9),
  // short wavy hair with a tousled side part; relaxed half-smile; forest-green hoodie under a light denim jacket
  defineAvatar("avatar-210", "adventurer", "human", 10),
  // shoulder-length twists with a faded undercut at the sides; small hoop earrings; denim zip jacket over a teal tee
  defineAvatar("avatar-211", "adventurer", "human", 11),
  // long wavy hair swept into a high half-up twist; turquoise stud earrings; lilac hoodie over a cream tee
  defineAvatar("avatar-212", "adventurer", "human", 12),

  // ---- summit (9-13) — zero board anchors; all 12 net-new (P0 — see AVATAR_CONCEPT_LEDGER.md
  // finding 1). Read genuinely older per AVATAR_ART_PRODUCTION_SPEC.md §3: board 1's most-mature
  // concepts as a floor, not a ceiling — layered/older clothing, self-possessed rather than
  // beaming expressions. Introduces locs to the library for the first time (three times, so it's
  // a recurring style rather than a token), plus side-shaves/short crops and longer braid forms
  // not used in the younger bands. ----
  // short tapered coils with a subtle side part; quiet half-smile; charcoal quarter-zip pullover over a light-gray tee
  defineAvatar("avatar-301", "summit", "human", 1),
  // shoulder-length locs tied back in a low ponytail; small silver stud earrings; olive canvas jacket over a plain cream tee
  defineAvatar("avatar-302", "summit", "human", 2),
  // straight dark hair in a low bun with loose face-framing strands; thin wire-rimmed glasses; navy button-up shirt, sleeves rolled
  defineAvatar("avatar-303", "summit", "human", 3),
  // short undercut with longer curls left on top; confident closed-mouth smile; rust bomber jacket over a charcoal tee
  defineAvatar("avatar-304", "summit", "human", 4),
  // long single braid over one shoulder with a few loose flyaway strands; freckles; forest-green flannel shirt over a cream tee
  defineAvatar("avatar-305", "summit", "human", 5),
  // loose shoulder-length wavy hair with a center part; small hoop earrings; cream cardigan over a rust top
  defineAvatar("avatar-306", "summit", "human", 6),
  // short locs cropped close to the head; faint, self-possessed smile; denim trucker jacket over a cream tee
  defineAvatar("avatar-307", "summit", "human", 7),
  // long straight hair with a deep side part; round tortoiseshell-style glasses; sage-green cardigan over a cream turtleneck
  defineAvatar("avatar-308", "summit", "human", 8),
  // twin long braids past the chest tied off with simple dark cord; steady, self-possessed expression; teal flannel shirt, sleeves rolled, over a cream tee
  defineAvatar("avatar-309", "summit", "human", 9),
  // short cropped locs with a faded undercut; relaxed half-smile; golden-yellow crewneck sweater over a collared cream shirt
  defineAvatar("avatar-310", "summit", "human", 10),
  // loose waves pulled into a low ponytail beneath a teal-patterned head wrap; calm, warm expression; cream button-up shirt under a rust cardigan
  defineAvatar("avatar-311", "summit", "human", 11),
  // short tousled wavy hair; thin rectangular glasses; charcoal bomber jacket over an olive tee
  defineAvatar("avatar-312", "summit", "human", 12),

  // ---- symbol — zero board anchors; all 12 net-new, brand-illustration-language design (P2).
  // Physically grouped here by id block (4xx), matching AVATAR_ART_PRODUCTION_SPEC.md §5's table,
  // even though each entry's `ageBand` (see the `AvatarKind` doc comment above) is assigned
  // individually by thematic/tonal fit rather than by this grouping — three per band, so every
  // band's default collection includes a few symbols without concentrating all twelve in one
  // band, while "See all avatars" keeps every symbol reachable from every band regardless. `order`
  // continues each band's sequence past its 12 human portraits (13-15), so it stays unique within
  // that `ageBand`, per the manifest-shape test. ----
  // Maggie mark medallion — the twin-peaks-and-trail icon as a dimensional badge, deep navy on warm ivory with a summit-orange star accent [ageBand: adventurer]
  defineAvatar("avatar-401", "adventurer", "symbol", 13),
  // compass rose — a dimensional trail compass, navy needle on a warm-ivory face with fine tick marks [ageBand: summit]
  defineAvatar("avatar-402", "summit", "symbol", 13),
  // summit star — a single faceted five-point star, dimensional and shaded, summit orange on an ivory disc [ageBand: early]
  defineAvatar("avatar-403", "early", "symbol", 13),
  // owl — a stylized perched owl, forest-green and cream plumage, calm forward gaze [ageBand: early]
  defineAvatar("avatar-404", "early", "symbol", 14),
  // fox — a stylized fox portrait, rust-and-cream coloring, alert forward gaze [ageBand: early]
  defineAvatar("avatar-405", "early", "symbol", 15),
  // constellation — a small connected star cluster on a deep-navy field, summit-orange linking lines [ageBand: summit]
  defineAvatar("avatar-406", "summit", "symbol", 14),
  // topographic badge — concentric contour-line rings like a map's elevation badge, navy lines on ivory [ageBand: summit]
  defineAvatar("avatar-407", "summit", "symbol", 15),
  // trail-marker cairn — a stacked stone trail cairn, warm stone tones on an ivory disc [ageBand: explorer]
  defineAvatar("avatar-408", "explorer", "symbol", 13),
  // compass-and-pine — a small evergreen sprig beside a trail arrow, sage-green and navy [ageBand: explorer]
  defineAvatar("avatar-409", "explorer", "symbol", 14),
  // mountain goat — a stylized mountain-goat portrait, cream-and-charcoal coloring, sure-footed profile [ageBand: adventurer]
  defineAvatar("avatar-410", "adventurer", "symbol", 14),
  // acorn-and-oak-leaf — a single acorn with an oak leaf, rust-and-forest-green, a small growth/beginnings mark [ageBand: explorer]
  defineAvatar("avatar-411", "explorer", "symbol", 15),
  // lantern — a small trail lantern with a warm glow, navy body with a summit-orange flame glyph [ageBand: adventurer]
  defineAvatar("avatar-412", "adventurer", "symbol", 15)
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
