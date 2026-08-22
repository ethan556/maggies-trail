# Maggie’s Trail premium avatar V4 production runbook

Status: **the complete 60-item S244 library passed independent whole-library review and is enabled
as one atomic runtime release.** The exact approved 256/512 exports are in `public/avatars`; the
quarantined masters, contact sheets, revisions and hashes remain under `reports/avatar-candidates/`.
No composite-board crop may enter `public/avatars`.

## Outcome and release unit

The library is 48 independent human portraits plus 12 independent neutral maths/trail symbols.
Every source render is one square image for one id. A contact sheet is review evidence only; it is
never an image source.

Release is atomic across the complete 60-item learner-facing library, not by individual id or band:

| Band | Human ids | Assigned symbol ids | Runtime options |
|---|---|---|---:|
| Early, K–2 | `001–012` | `403–405` | 15 |
| Explorer, grades 3–5 | `101–112` | `408`, `409`, `411` | 15 |
| Adventurer, grades 6–8 | `201–212` | `401`, `410`, `412` | 15 |
| Summit, grades 9–13 | `301–312` | `402`, `406`, `407` | 15 |

`avatar-production-cohorts.json` is the machine-readable source. The validator rejects a release
with 1–14 enabled options in any band. The picker renders only enabled art and shows one honest
empty state for an unreleased band; it never repeats a silhouette across unavailable slots.

## Stage 0: precache once

Before image work, cache these immutable inputs for every worker:

- prompt pack version and SHA-256;
- portrait and symbol style blocks;
- the four supplied design-reference boards and their hashes;
- frame template: square canvas, eye line 55–58% (target 57%), crown-to-chin 48–52% (target 50%),
  complete narrow-shoulder silhouette inside centered `x=12.5–87.5%`, at least 5% clean canvas
  below the bust, warm ivory `#F7F3EC`, front-left soft light;
- negative prompt and the complete filename map;
- this runbook and `avatar-production-cohorts.json`.

Workers receive only their id list plus the cached blocks. They do not restate the whole program
or generate a board of several characters. This keeps prompt tokens bounded and prevents drift.

## Stage 1: non-shipping V4 canary

Render these ten independent masters, one image call and one output file per id:

- Early: `avatar-001`, `avatar-002`
- Explorer: `avatar-101`, `avatar-102`
- Adventurer: `avatar-201`, `avatar-202`
- Summit: `avatar-301`, `avatar-302`
- Neutral symbols: `avatar-401`, `avatar-403`

This is an art-direction canary, never a release cohort. Keep it outside `public/avatars` until the
full 15-option band containing each candidate is complete and approved.

The S244 sources and their deterministic normalized derivatives are retained under
`reports/avatar-candidates/`. Rebuild and validate the evidence batch with:

```text
npm run build:avatars:canary:s244
npm run validate:avatars:canary:s244
```

The normalization samples only the near-ivory background, preserves each independently painted
subject, applies uniform scale/translation without cropping, and creates a fresh `#F7F3EC` canvas.
It emits quarantined 256/512 WebPs and labeled contact sheets, never public assets. Exact hashes,
measurements and the historical canary verdict are in
`reports/avatar-candidates/S244_AVATAR_CANARY_EVIDENCE.md`.

The canary passes only when one independent assessor approves all of the following against exact
source hashes:

1. premium dimensional painterly finish at 512 px and realistic 32–48 px display size;
2. one professional-library read across all ten assets;
3. clear age progression without changing the common frame scale;
4. no phone/device chrome, board crop, text, watermark, edge bleed or repeated face;
5. consistent ivory background, light direction, saturation, sharpness and shoulder crop;
6. picker, profile, dashboard, trailhead/current-location, completion, roster and family states in
   light/dark, narrow/wide, keyboard, screen-reader and reduced-motion conditions.

Canary revision is cheaper than downstream repair. If one frame rule changes, update the single
generator style block, rebuild the prompt pack, invalidate the canary hashes and rerender all ten.

## Stage 2: complete all bands with bounded parallel work

After the canary passes, complete bands in parallel from the same locked inputs. They remain
quarantined until every band passes and the full library can release atomically. Recommended work
packets are six independent masters or fewer: large enough to amortize setup, small enough for a
contact-sheet checkpoint. Never ask a model for several avatars in one image.

- Early remainder: `003–012`, `404`, `405` (12 masters)
- Explorer remainder: `103–112`, `408`, `409`, `411` (13 masters)
- Adventurer remainder: `203–212`, `410`, `412` (12 masters)
- Summit remainder: `303–312`, `402`, `406`, `407` (13 masters)

At the end of each micro-batch, run mechanical checks and append the candidates to both a 512 px
review sheet and a small-size sheet. Do not wait until all 60 exist to discover frame drift.

## Representation and age-truth QA

Representation is deliberate art direction, not runtime identity data. Every age band contains
three portraits in each of four broad painterly skin-tone directions. The assignment lives only in
`avatar-prompts.json` (`skin_tone_art_direction`) to prevent model-default bias; the application
stores only avatar id and announces only “Avatar N”. Race, ethnicity, nationality and gender are
never inferred or labelled.

Reviewers additionally check that:

- facial geometry, hair, expressions and clothing vary independently of skin tone;
- no band makes one appearance exceptional, comic, villainous or more/less capable;
- head coverings and glasses remain ordinary styling, never narrative shorthand;
- all 12 neutral symbols are equally polished alternatives, not second-class fallbacks;
- Early reads 5–8, Explorer 9–11, Adventurer 12–14 and Summit 15–18;
- older learners are not enlarged child faces and younger learners are not aged up for polish.

The QA worksheet may record visual production directions and pass/fail findings. Those fields do
not enter the runtime manifest, analytics, accessibility names or learner profile.

## Master, export and validation

Every generated batch first stays outside `public/`. Normalize and build its labeled contact sheets
with an explicit id list; the tool never discovers or silently adds ids:

```text
node scripts/brand/normalize-avatar-canary-s244.mjs \
  --input reports/avatar-candidates/early-v1-masters \
  --output reports/avatar-candidates/early-v1-normalized \
  --ids avatar-001,avatar-002,avatar-003,avatar-004,avatar-005,avatar-006,avatar-007,avatar-008,avatar-009,avatar-010,avatar-011,avatar-012,avatar-403,avatar-404,avatar-405 \
  --sheet-prefix early-v1
```

Input names may be `avatar-NNN-master.png` or canonical `avatar-NNN.png`/`.webp`/`.tif`/`.tiff`.
The output directory receives normalized masters, 256/512 review files, labeled contact sheets and
`normalization-manifest.json`; it remains non-shipping. Review the whole 15-option band at both
sheet sizes. A mechanical pass never substitutes for the independent landmark, age, diversity and
art-direction sign-offs.

Only after all gates approve the entire band, place each approved normalized square master at
`art/avatar-masters/avatar-NNN.png` (or `.webp`, `.tif`, `.tiff`). The directory is ignored source-art
staging, not runtime content. A canonical master must be at least 1024×1024 and contain one subject
only.

Export reviewed ids explicitly:

```text
npm run build:avatars -- --confirm-reviewed <all 15 approved band ids>
```

The command produces only `avatar-NNN-256.webp` and `avatar-NNN-512.webp`, both from the same
master. It does not generate art or enable ids. Existing exports require the explicit
`--replace-reviewed` flag after renewed approval.

Then update the corresponding band status to `approved` in `avatar-production-cohorts.json`, add
all 15 ids to `ENABLED_AVATAR_IDS` in one change, and run:

```text
npm run validate:avatars
npx vitest run src/lib/avatarAssets.test.ts src/lib/avatars.test.ts src/components/AvatarPicker.test.tsx
```

The deterministic gate checks prompt/manifest/cohort parity, atomic full-library release, exact filenames,
paired dimensions, WebP/opacity, warm-ivory corner patches, broad safe-area/scale limits, byte and
decoded-pixel duplicates, and that the 256 export matches a downsample of the 512 source. Pixel
checks complement rather than replace independent visual review.

## Product integration contract

The selected avatar should identify the learner on identity, progress and celebration surfaces:

- onboarding and profile picker/preview;
- global profile menu and learner dashboard;
- Trailhead/current trail position;
- lesson completion (not every in-lesson maths step);
- practice/test-out completion, review completion, and daily progress summaries (never beside a
  question prompt);
- achievements, mastery, streak and progress summaries when a learner header is present;
- family/parent dashboard and multi-child roster;
- classroom/teacher learner rows;
- certificates if/when a certificate surface exists. No certificate product surface exists as of
  S244, so this program does not invent one.

`AvatarDisplay` is the only rendering resolver. Unknown, disabled or withdrawn ids use the honest
neutral fallback, so old synced profiles never create broken images. Decorative repetitions use an
empty `alt`; learner rows give the surrounding name/context the accessible identity.

## Restrained future customization

Customization is a later curated layer, not a character builder. Safe candidates are a small set
of approved frame accents, background patterns outside the portrait canvas, and achievement pins
that do not obscure the face. Do not add skin-tone sliders, face/body reshaping, identity labels,
free-form uploads, text overlays, paid rarity, or cosmetics that turn representation into a
progression hierarchy. Every variation must preserve recognizability at 32 px, contrast, reduced
motion and the same fallback/release gates.
