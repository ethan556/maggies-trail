# Avatar Art Production Spec

**Purpose.** The commissioning spec every final avatar portrait must be individually re-rendered
to. Written from `OPTIMIZATION_PLAN_V3.md:141-143,150-151`. Nothing in this document describes
work already done — see `AVATAR_CONCEPT_LEDGER.md` for the production history. S243's four
pre-canary candidates were rejected; S244 subsequently produced, normalized and independently
approved the complete 60-item library. All 60 reviewed ids are now enabled atomically, while the
honest-placeholder policy remains the fallback for absent or invalid stored ids.

**The non-negotiable this whole document serves:** *every shipped avatar is an independent
production asset. A student never selects a quadrant of a board, and no board crop is ever claimed
as final art* (`OPTIMIZATION_PLAN_V3.md:141`). Nothing below should be read as permission to crop,
save, or reference `design-reference/ws-j-avatar-board-*.png` as if a rectangle cut from one of
them were a finished asset — it never is, regardless of how close a crop might look.

**V4 release rule.** `avatar-production-cohorts.json` is the machine-readable release contract and
`AVATAR_V4_PRODUCTION_RUNBOOK.md` is its operator guide. A canary is evidence only. Production
releases the complete learner-facing library at once: **48 independent human portraits + 12
independent neutral symbols**. Neither a partial band nor an individual avatar can be enabled.

## 1. Framing

- **Composition:** head-and-shoulders, portrait orientation, centered.
- **Eye line:** **55–58%** of frame height from the top, targeting **57%**. These values are locked
  from the normalized S244 canary and apply to every subsequent portrait.
- **Head height:** **48–52%** of frame height from crown to chin, targeting **50%**, consistent across every
  portrait regardless of subject age — a K–2 portrait and a summit portrait use the *same* head
  scale so the grid reads as one consistent library, not four separately-scaled sets.
- **Shoulder crop:** both shoulders visible, cropped at a consistent point below the collarbone —
  no portrait crops at the neck, none extends to the elbows. Use a deliberately narrow bust so the
  complete outer silhouette, including hair and shoulders, stays inside the centered **75% canvas
  width safe area** (`x=12.5–87.5%`).
- **Margin:** leave at least **5% clean canvas below the bust** and uniform empty margin on every
  other edge. No portrait's hair or shoulders touch, crop, or bleed past the canvas edge.
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

V4 locks the shipping library to the full 60. The 48 human portraits deliberately span four broad
visual skin-tone directions, three per direction in every age band. These are production-only art
directions: the app stores no identity category, exposes no demographic label, and makes no
ethnicity or gender inference. Difference must also come through independent facial geometry,
hair, clothing, expression, and age-truth—not stereotype or a palette swap.

**This target is met at the concept level** (`src/lib/avatars.ts` declares all 60 ids below and
`AVATAR_CONCEPT_LEDGER.md` carries a trait description for each of the 44 net-new ones). Four human
pre-canary candidates exist outside `public/`, but none is production art or enabled. §5a and §5b
remain the complete filename allocation, and §8 governs release.

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

### 5b. Explicit filenames — band expansion + symbols (P2)

Lower priority than §5a's P0/P1 rows, but no longer open ranges: every id below now has a concept
behind it in `AVATAR_CONCEPT_LEDGER.md`'s "Expansion concept tables" section (hairstyle,
accessories, clothing, expression — the same non-sensitive vocabulary as every other concept in
this library) and a declared `enabled: false` entry in `src/lib/avatars.ts`. What's still missing
is exactly what was always missing for §5a's rows too: production art. Listed individually, same
two-file rule as §5a.

The 4 `early`-expansion concepts:

| id | concept source | files |
|---|---|---|
| avatar-009 | none — net-new commission | avatar-009-256.webp, avatar-009-512.webp |
| avatar-010 | none — net-new commission | avatar-010-256.webp, avatar-010-512.webp |
| avatar-011 | none — net-new commission | avatar-011-256.webp, avatar-011-512.webp |
| avatar-012 | none — net-new commission | avatar-012-256.webp, avatar-012-512.webp |

The 8 `explorer`-expansion concepts:

| id | concept source | files |
|---|---|---|
| avatar-105 | none — net-new commission | avatar-105-256.webp, avatar-105-512.webp |
| avatar-106 | none — net-new commission | avatar-106-256.webp, avatar-106-512.webp |
| avatar-107 | none — net-new commission | avatar-107-256.webp, avatar-107-512.webp |
| avatar-108 | none — net-new commission | avatar-108-256.webp, avatar-108-512.webp |
| avatar-109 | none — net-new commission | avatar-109-256.webp, avatar-109-512.webp |
| avatar-110 | none — net-new commission | avatar-110-256.webp, avatar-110-512.webp |
| avatar-111 | none — net-new commission | avatar-111-256.webp, avatar-111-512.webp |
| avatar-112 | none — net-new commission | avatar-112-256.webp, avatar-112-512.webp |

The 8 `adventurer`-expansion concepts:

| id | concept source | files |
|---|---|---|
| avatar-205 | none — net-new commission | avatar-205-256.webp, avatar-205-512.webp |
| avatar-206 | none — net-new commission | avatar-206-256.webp, avatar-206-512.webp |
| avatar-207 | none — net-new commission | avatar-207-256.webp, avatar-207-512.webp |
| avatar-208 | none — net-new commission | avatar-208-256.webp, avatar-208-512.webp |
| avatar-209 | none — net-new commission | avatar-209-256.webp, avatar-209-512.webp |
| avatar-210 | none — net-new commission | avatar-210-256.webp, avatar-210-512.webp |
| avatar-211 | none — net-new commission | avatar-211-256.webp, avatar-211-512.webp |
| avatar-212 | none — net-new commission | avatar-212-256.webp, avatar-212-512.webp |

The 12 `symbol` concepts (kind `symbol`; each one's individually-assigned `ageBand` — not fixed by
the `4xx` id block — is recorded in `AVATAR_CONCEPT_LEDGER.md`'s symbol expansion table, not
repeated here since it has no bearing on the filename):

| id | concept source | files |
|---|---|---|
| avatar-401 | none — net-new commission | avatar-401-256.webp, avatar-401-512.webp |
| avatar-402 | none — net-new commission | avatar-402-256.webp, avatar-402-512.webp |
| avatar-403 | none — net-new commission | avatar-403-256.webp, avatar-403-512.webp |
| avatar-404 | none — net-new commission | avatar-404-256.webp, avatar-404-512.webp |
| avatar-405 | none — net-new commission | avatar-405-256.webp, avatar-405-512.webp |
| avatar-406 | none — net-new commission | avatar-406-256.webp, avatar-406-512.webp |
| avatar-407 | none — net-new commission | avatar-407-256.webp, avatar-407-512.webp |
| avatar-408 | none — net-new commission | avatar-408-256.webp, avatar-408-512.webp |
| avatar-409 | none — net-new commission | avatar-409-256.webp, avatar-409-512.webp |
| avatar-410 | none — net-new commission | avatar-410-256.webp, avatar-410-512.webp |
| avatar-411 | none — net-new commission | avatar-411-256.webp, avatar-411-512.webp |
| avatar-412 | none — net-new commission | avatar-412-256.webp, avatar-412-512.webp |

Every id declared anywhere in `src/lib/avatars.ts` now has an explicit row in §5a or §5b — there is
no longer an id in the manifest that is only described by a range.

### 5c. Production directory status

`/public/avatars/placeholder-neutral.svg` remains the only runtime asset — a hand-drawn, visibly
generic silhouette, explicitly labeled as a dev placeholder in its own `<title>` and an XML
comment. It is not, and must never be presented as, a selectable avatar (§7). S243 pre-canary
renders are retained outside `public/` for art-direction review only.

## 6. Art-consistency QA — the FABLE-Q contact-sheet gate

Before the complete 60-item library's manifest entries can flip `enabled: true`, the independent assessor
reviews that complete 15-option cohort beside every previously approved cohort as contact sheets, per
`OPTIMIZATION_PLAN_V3.md:143`, and rejects outliers on:

- head scale (§1)
- eye line (§1)
- lighting (§2)
- background (§2)
- saturation (§2)
- sharpness / render fidelity
- age appearance (§3)

**The test:** *would a user assume one professional character-design team drew everything?* One
weak portrait makes the whole picker feel generated. P0/P1 findings block the whole cohort. Assets
may be revised individually, but release is atomic; there is never a one-portrait-plus-fourteen-
placeholders production state.

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
  complete cohort is approved. `getAvatarsForAgeBand`, `isValidAvatarId`, and `getAvatarSrc` all
  treat a disabled entry as unusable, so a manifest ahead of the art can never leak into a real
  render. The picker shows one honest empty state, never one selectable portrait surrounded by
  repeated silhouettes.
- `src/lib/avatars.test.ts` asserts, for every `enabled: true` entry, that both files exist on
  disk. S243 adds a stricter validator for format, dimensions, opacity, warm-ivory corners,
  duplicate files, prompt/manifest parity, and enabled/file-pair parity.
- `/public/avatars/placeholder-neutral.svg` remains a last-resort fallback before a learner chooses
  or when a stored id is invalid. It is never offered as a pickable option.
