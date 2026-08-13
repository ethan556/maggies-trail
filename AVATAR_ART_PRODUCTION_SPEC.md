# Avatar Art Production Spec

**Purpose.** The commissioning spec every final avatar portrait must be individually re-rendered
to. Written from `OPTIMIZATION_PLAN_V3.md:141-143,150-151`. Nothing in this document describes
work already done — see `AVATAR_CONCEPT_LEDGER.md` for what exists today (16 concept-only board
candidates, zero production renders) and the honest-placeholder policy at the end of this file for
exactly what ships while that remains true.

**The non-negotiable this whole document serves:** *every shipped avatar is an independent
production asset. A student never selects a quadrant of a board, and no board crop is ever claimed
as final art* (`OPTIMIZATION_PLAN_V3.md:141`). Nothing below should be read as permission to crop,
save, or reference `design-reference/ws-j-avatar-board-*.png` as if a rectangle cut from one of
them were a finished asset — it never is, regardless of how close a crop might look.

## 1. Framing

- **Composition:** head-and-shoulders, portrait orientation, centered.
- **Eye line:** target ~55–60% of frame height from the top. Lock the exact percentage from the
  first production re-render (an anchor concept is the natural first candidate — see §5) and hold
  every subsequent portrait to that same line; FABLE-A owns the final number.
- **Head height:** target ~45–55% of frame height (crown to chin), consistent across every
  portrait regardless of subject age — a K–2 portrait and a summit portrait use the *same* head
  scale so the grid reads as one consistent library, not four separately-scaled sets.
- **Shoulder crop:** both shoulders visible, cropped at a consistent point below the collarbone —
  no portrait crops at the neck, none extends to the elbows.
- **Margin:** uniform empty margin between the subject's outer silhouette (hair included) and the
  canvas edge on all four sides, consistent across the library. No portrait's hair or shoulders
  touch or bleed past the canvas edge.
- These four values (eye line, head height, shoulder crop point, margin) are what the FABLE-Q
  contact-sheet gate (§6) checks first — they are the single biggest driver of a library reading
  as "one professional team" versus "generated."

## 2. Background, lighting, finish

- **One restrained warm-neutral background**, a single flat tone in the Warm Ivory `#F7F3EC`
  family — no gradients, no props, no scenery, no drop shadow implying a surface.
- **Matched lighting and saturation** across every portrait: same apparent light direction/softness,
  same color intensity. A portrait that reads warmer, cooler, brighter, or more saturated than its
  neighbors fails the contact-sheet gate even if every other rule is met.
- **Dimensional-but-not-plasticky finish**, matching the boards' own art language (see
  `AVATAR_CONCEPT_LEDGER.md` "Shared art language"): stylized illustration with real shading and
  volume, not flat vector, not photoreal, not glossy 3D-render plastic.
- **No embedded card or device chrome of any kind.** The boards' phone-frame mockups (bezel +
  home-button glyph) exist only to present concepts to a human reviewer — production art is the
  portrait alone on its background, nothing else. This is the single most common way a crop from
  the boards would fail even if every framing rule happened to line up: the chrome rides along.

## 3. Age-truth per band

- High-school (`summit`) portraits are not enlarged elementary characters — proportions, styling,
  and presentation should read as genuinely older, matching board 1's most-mature concepts as a
  floor, not a ceiling.
- K–2 (`early`) portraits are not unnaturally mature — keep the boards' own young-child
  proportions (rounder faces, larger eye-to-face ratio) rather than "aging up" for polish.
- Every band should look like it belongs to the *same* library (§2's consistent lighting/finish
  rules) while still looking like its own age group.

## 4. Canvas & export

- Master render: square canvas, ≥1024×1024px, produced at high enough fidelity to downsample
  cleanly.
- Exported deliverables per avatar: exactly two WebP files —
  - **256×256** — grid/picker size.
  - **512×512** — profile size.
- No other sizes or formats ship. (AVIF is listed as an acceptable format in
  `OPTIMIZATION_PLAN_V3.md:151`; WebP is the format this spec and `src/lib/avatars.ts` standardize
  on for the first slice — an AVIF variant is a possible later optimization, not a first-slice
  requirement.)

## 5. File-naming convention

Pattern: `/public/avatars/avatar-<NNN>-<SIZE>.webp`, where `<NNN>` is the id's 3-digit numeric
suffix and `<SIZE>` is `256` or `512`. Every id below expands to exactly two files. The helper
`avatarSrc(id, size)` in `src/lib/avatars.ts` builds this path from the id, so an id and its file
path can never drift apart.

**`NNN` is allocated in per-band blocks, not sequentially across the whole library**, so a
filename is self-describing forever and a later addition never renumbers an earlier one. Display
order within a collection comes from the manifest's `order` field, never from the filename number.

| Band | Block | Kind |
|---|---|---|
| `early` (grades 0–2, K–2) | 001–012 | human |
| `explorer` (grades 3–5) | 101–112 | human |
| `adventurer` (grades 6–8) | 201–212 | human |
| `summit` (grades 9–13) | 301–312 | human |
| *(neutral/symbolic, no age band)* | 401–412 | symbol |

Grade→band mapping (`gradeToAgeBand` in `src/lib/avatars.ts`): grades 0–2 → `early`, 3–5 →
`explorer`, 6–8 → `adventurer`, 9–13 → `summit`. Product grade ids run 0–13 (0 = Kindergarten,
9–13 = Algebra 1 through Calculus — see `OnboardingFlow.tsx`'s `GRADES` table), so the plan's
"9–12" label at `OPTIMIZATION_PLAN_V3.md:142` is documented here as grade ids **9–13**.

**Sizing the library:** the plan's target is 56–60 total avatars, ~12 human portraits per band
plus 8–12 symbols (`OPTIMIZATION_PLAN_V3.md:142`). This spec adopts **12 per band + 12 symbols =
60** — the top of that range — as the provisional working target, because it keeps every block a
clean, symmetric 12 slots (`01`–`12`) with no bookkeeping asymmetry between bands. This is a
choice, not a requirement: FABLE-A may compress any band down to ~8–10 without renaming a single
already-assigned id, because compression only ever drops *trailing* slots (e.g. skip `009`–`012`)
— it never renumbers `001`–`008`.

### 5a. Explicit filenames — highest priority (P0 summit, P1 anchors)

No board concept anchors any `summit` portrait (`AVATAR_CONCEPT_LEDGER.md` finding 1) — these are
the most urgent net-new commissions and are listed individually rather than by range:

| id | concept source | files |
|---|---|---|
| avatar-301 | none — net-new commission | avatar-301-256.webp, avatar-301-512.webp |
| avatar-302 | none — net-new commission | avatar-302-256.webp, avatar-302-512.webp |
| avatar-303 | none — net-new commission | avatar-303-256.webp, avatar-303-512.webp |
| avatar-304 | none — net-new commission | avatar-304-256.webp, avatar-304-512.webp |
| avatar-305 | none — net-new commission | avatar-305-256.webp, avatar-305-512.webp |
| avatar-306 | none — net-new commission | avatar-306-256.webp, avatar-306-512.webp |
| avatar-307 | none — net-new commission | avatar-307-256.webp, avatar-307-512.webp |
| avatar-308 | none — net-new commission | avatar-308-256.webp, avatar-308-512.webp |
| avatar-309 | none — net-new commission | avatar-309-256.webp, avatar-309-512.webp |
| avatar-310 | none — net-new commission | avatar-310-256.webp, avatar-310-512.webp |
| avatar-311 | none — net-new commission | avatar-311-256.webp, avatar-311-512.webp |
| avatar-312 | none — net-new commission | avatar-312-256.webp, avatar-312-512.webp |

The 16 board-anchored concepts (already declared, `enabled: false`, in `src/lib/avatars.ts`):

| id | concept source | files |
|---|---|---|
| avatar-001 | C05 | avatar-001-256.webp, avatar-001-512.webp |
| avatar-002 | C06 | avatar-002-256.webp, avatar-002-512.webp |
| avatar-003 | C07 | avatar-003-256.webp, avatar-003-512.webp |
| avatar-004 | C08 | avatar-004-256.webp, avatar-004-512.webp |
| avatar-005 | C09 | avatar-005-256.webp, avatar-005-512.webp |
| avatar-006 | C10 | avatar-006-256.webp, avatar-006-512.webp |
| avatar-007 | C11 | avatar-007-256.webp, avatar-007-512.webp |
| avatar-008 | C12 | avatar-008-256.webp, avatar-008-512.webp |
| avatar-101 | C13 | avatar-101-256.webp, avatar-101-512.webp |
| avatar-102 | C14 | avatar-102-256.webp, avatar-102-512.webp |
| avatar-103 | C15 | avatar-103-256.webp, avatar-103-512.webp |
| avatar-104 | C16 | avatar-104-256.webp, avatar-104-512.webp |
| avatar-201 | C01 | avatar-201-256.webp, avatar-201-512.webp |
| avatar-202 | C02 | avatar-202-256.webp, avatar-202-512.webp |
| avatar-203 | C03 | avatar-203-256.webp, avatar-203-512.webp |
| avatar-204 | C04 | avatar-204-256.webp, avatar-204-512.webp |

### 5b. Remaining slots — P2 (band expansion + symbols)

Lower priority than §5a because these have no anchor concept yet to re-render *or* extend from —
they need new concepts designed first (band expansion needs FABLE-A-directed new characters in the
established art language; symbols need a design pass in the brand's illustration language once
WS-A's tokens are stable). Listed by range; each id follows the same two-file rule as §5a.

| Range | Count | Band | Kind |
|---|---|---|---|
| avatar-009 – avatar-012 | 4 | early | human |
| avatar-105 – avatar-112 | 8 | explorer | human |
| avatar-205 – avatar-212 | 8 | adventurer | human |
| avatar-401 – avatar-412 | 12 | *(symbol)* | symbol |

### 5c. The one file that exists today

`/public/avatars/placeholder-neutral.svg` — a hand-drawn, visibly generic silhouette, explicitly
labeled as a dev placeholder in its own `<title>` and an XML comment. It is not, and must never be
presented as, a selectable avatar (§7).

## 6. Art-consistency QA — the FABLE-Q contact-sheet gate

Before any portrait's manifest entry can flip `enabled: true`, FABLE-Q reviews the full library
(existing enabled entries + the new candidate) as a single contact sheet, per
`OPTIMIZATION_PLAN_V3.md:143`, and rejects outliers on:

- head scale (§1)
- eye line (§1)
- lighting (§2)
- background (§2)
- saturation (§2)
- sharpness / render fidelity
- age appearance (§3)

**The test:** *would a user assume one professional character-design team drew everything?* One
weak portrait makes the whole picker feel generated. P0/P1 findings from this gate block release
of the affected portrait(s), matching the Wave-2B gate in `OPTIMIZATION_PLAN_V3.md:190`.

Mechanically, `src/lib/avatars.test.ts` enforces a narrower but permanent version of this gate:
any manifest entry with `enabled: true` must have both its `-256.webp` and `-512.webp` files
actually present on disk. That test cannot verify *quality* (that is FABLE-Q's job, from pixels)
but it makes it structurally impossible to ship an enabled entry backed by nothing — or backed by
a board crop dropped in under the expected filename.

## 7. Accessibility naming (no board crop, no inferred identity, either way)

Per `OPTIMIZATION_PLAN_V3.md:150`: the UI never names ethnicity categories. Accessibility labels
are `Avatar 17` / `Avatar 17 selected`, or a concise non-sensitive descriptor in the same register
as this ledger's trait column ("Avatar with braids and green top") — never an inferred identity
claim. This rule applies identically to every finished asset regardless of source concept.

## 8. Honest-placeholder policy (what ships while art doesn't exist)

This is the section that makes the rest of this document safe to leave half-executed indefinitely:

- **No file matching `avatar-*-256.webp` / `avatar-*-512.webp` is created until real production
  art meeting §1–§4 exists for it.** Not a board crop, not a stretched/cropped concept thumbnail,
  not an AI placeholder standing in "for now" — nothing at that path until it is the genuine
  final asset.
- The manifest in `src/lib/avatars.ts` may declare an id, its (future) file paths, its band, and
  its order **before** the art exists — but that entry's `enabled` flag stays `false` until the
  files are real. `getAvatarsForAgeBand`, `isValidAvatarId`, and `getAvatarSrc` all treat a
  disabled entry as unusable, so a manifest ahead of the art can never leak into a real render.
- `src/lib/avatars.test.ts` asserts, for every `enabled: true` entry, that both files exist on
  disk. Today the manifest has zero enabled entries, so that assertion is vacuous — and stays that
  way, structurally, until someone actually adds the files and flips the flag in the same change.
- The **only** avatar-shaped asset that ships today is `/public/avatars/placeholder-neutral.svg` —
  a neutral silhouette, explicitly labeled as a placeholder in-file, used only as a last-resort
  visual fallback (e.g., before a learner has chosen, or for a since-invalidated stored id). It is
  never offered as a pickable option in any future picker UI.
