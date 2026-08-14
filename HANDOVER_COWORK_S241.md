# Handover — Cowork session S241

Written 2026-08-14 at the end of the session. Branch `cowork/s237`, tip `5908eec`, pushed and
level with `origin`. Working tree clean. Read this before acting; it records what changed, what
was deliberately NOT done, and the two traps that cost real time.

---

## 1. State in one line

`origin/cowork/s237 == local == 5908eec`, tree clean, typecheck 0 errors, nothing running.
Sixteen commits landed this session (`3a67319..5908eec`).

---

## 2. What shipped

### WS-A — brand identity (complete)

The approved mountain-peaks identity is now the app's actual brand, not a plan.

- **Vectors:** `public/brand/maggies-mark{,-mono}.svg`, `maggies-wordmark{,-mono}.svg`.
  `public/icon.svg`, `src/app/icon.svg` and `public/brand/maggies-mark.svg` are now byte-identical
  — the three-way duplication of the old "Tally Peak" art is gone.
- **Raster derivatives:** `public/icons/{favicon-16,favicon-32,icon-192,icon-512,icon-maskable-512}.png`,
  `public/favicon.ico` (3-size container), `public/apple-touch-icon.png` (180),
  `public/brand/maggies-og.png` (1200×630). Regenerate with `npm run gen:brand-icons`, verify with
  `npm run verify:brand-icons`, OG card with `npm run gen:brand-og`.
- **Wiring:** `public/manifest.webmanifest` icons array and `src/app/layout.tsx` metadata
  (`metadataBase`, `icons`, `openGraph`, `twitter`) both reference the same files in the same words.
- **Components:** `src/components/brand.tsx` exports `MaggieMark` (badged, for favicon/nav),
  `MaggieMarkOpen` (unbadged ridgeline, for display sizes), `MaggieWordmark`, `MaggieBrandLockup`.
- **Landing page:** leads with `MaggieMarkOpen` at 132/176px, centred over the text column.

**Known limitation, measured not guessed:** the summit star does not survive 16px. Orange peak
coverage is 1.00 at ≥180px, 0.93 at 32px, **0.51 at 16px** — the star degrades to a warm-brown 2×2
blob on navy. The twin-peak silhouette still reads. This is a property of the approved vector, not
the rasteriser, so nothing was touched. It may argue for a simplified 16px variant; that is a call
for whoever owns the approved artwork.

### Icon vocabulary — all 54 alphanumeric

Per the naming ruling ("no names on icons or avatars except alphanumeric identification"), every
`AppIcon` entry now carries an identifier, never a name.

- 18 new duotone trail icons + the 36 pre-existing line icons, all renamed.
- Blocks mirror `AVATAR_ART_PRODUCTION_SPEC.md` §5 so a later addition never renumbers an earlier
  one: `0xx` navigation, `1xx` the path, `2xx` landmarks, `3xx` terrain, `4xx` kit, `5xx` moments,
  `8xx` the line set.
- Each trail icon also exists standalone at `public/icons/set/icon-NNN.svg` under the same id, so
  the identifier is the same string in the type union, at the call site, and on disk.
- **No code alias was added, deliberately.** An alias is a name by another route, and the first
  call site to use it puts the name back in the markup. What each id depicts lives only in the
  reference sheet and the SVG files.

**Not renamed, and why:** the brand assets (`maggies-mark.svg`, `maggies-wordmark.svg`,
`maggies-og.png`). The mark is the identity, not a catalogue entry; a numbered brand file is a
maintenance hazard with no naming benefit. One instruction away if the ruling is meant to reach it.

### WS-G — two slices

- MCQ near-duplicate fold also strips a **trailing** filler word (the spec said leading *and*
  trailing; only leading shipped). Measured first: **0 additional corpus hits**, so strictly
  stricter at zero cost. `total`/`altogether`/`each`/`only` were deliberately excluded — "18" vs
  "18 total" can be genuinely different answers.
- `authoredMath` parser learns integral, summation and limit shorthand (473 operator-bearing
  authored strings across 56 files drove the design).

### Graph & statistical-figure review

Standard, defect index and release-gate plan committed; 6 critical + 9 engine defects fixed; new
gates added; **the tier scorer is now quality-aware** — `scripts/flagship-tier.mjs` reads the ruled
adjudication instead of crediting the mere presence of a prediction gate. That closes the open
ruling from `BUNDLE_MANIFEST_S241_v2.md`.

---

## 3. The avatar episode — read this before touching WS-J

**Current state: no production art. All 60 entries `enabled: false`, zero `.webp` in
`public/avatars/`.** That is the honest-placeholder state `AVATAR_ART_PRODUCTION_SPEC.md` §8
describes, and it is deliberate.

A generated set of 120 WebPs was rendered, enabled, propagated to five surfaces, deployed — and
then **withdrawn**. Why, so nobody repeats it:

- The art was internally consistent: uniform eye line, head scale, shoulder crop, margin and
  background across all 60. That is the *mechanical* half of the §6 gate, and it passed.
- It failed the half that decides. All four bands read at the same apparent age, so §3 age-truth
  was unmet and `summit` was indistinguishable from `early` — the exact failure §3 names
  ("high-school portraits are not enlarged elementary characters"). Facial geometry and expression
  were constant across the 48, so the grid read as one figure with swapped hair and garment layers.
  The finish was gradient-shaded vector, not the boards' painterly dimensional language (§2).

**`avatars.test.ts` passed 27/27 for the entire episode.** That is not a defect in the test — §6
says outright it "cannot verify quality (that is FABLE-Q's job, from pixels)". Treat this as the
standing proof that no mechanical gate substitutes for reading the contact sheet.

**What a real attempt needs:** an image-generation model. A programmatic renderer produces exactly
the mannequin-in-wigs result that was rejected. `AVATAR_PROMPT_PACK.md` (+ `avatar-prompts.json`)
carries 60 render-ready prompts, style-locked to the concept boards, with a byte-identical style
block across all 48 portraits — that invariance *is* the consistency mechanism.

**Evidence it works:** one test render through Figma Weave (Flux 2 Pro, flow
`app.weavy.ai/flow/G9nhOEsYiZN9bkTFSJlLQQ`) produced a painterly, individuated, correctly-proportioned
young-child portrait on the flat ivory ground. Cost exactly 5 credits.

**Two things to fix before a bulk run:**
1. Trait fidelity. `avatar-001` returned auburn buns without the braided sections and gold beads its
   concept specifies — move the trait clause to the front or weight it harder.
2. Finish leans slightly more 3D-rendered than the boards' painterly 2D.

**Budget, measured from the Weave UI:** 145 credits remain. Flux Fast 0.4/image · Imagen 3 Fast 3 ·
Flux Pro 1.1 5 · Flux 2 Pro 5 · Imagen 4 6 · Recraft V4 33. All 60 at Flux 2 Pro is **300 credits**,
about double the balance. Flux Fast would cover 60 for 24 credits but it is the draft model — draft
is what was thrown away. Spend 10–15 on prompt tuning before committing to the bulk run.

**Do not crop the boards.** `design-reference/ws-j-avatar-board-*.png` are commissioning references
only (`OPTIMIZATION_PLAN_V3.md:141`). Every cell sits inside phone-frame chrome, no cell is square,
and the 60-icon board is ~90px per cell against a 256/512 requirement — a 5.7× upscale.

---

## 4. Two traps this session hit

**Trap 1 — rebasing published history.** A stop hook asked for commits to be re-signed via
`git rebase --exec`. I ran it without first checking what was already on the remote, and it orphaned
`f2c63c2` and `f3517c2` — both already pushed with Vercel builds against them. Recovered from the
reflog, then re-signed **only** the unpushed commits.

*Rule: before any history rewrite, run `git ls-remote origin <branch>` and confirm the range is
local-only.* The stop hook cannot see the remote, so it cannot distinguish "unsigned and safe to
amend" from "unsigned and already public". Nine commits on this branch are unsigned and published;
leave them. Anything new should be signed at creation — the signing server was 401 for part of this
session, which is the whole cause.

**Trap 2 — a document lies more quietly than a picture.** The avatar withdrawal reverted the ship
and propagation commits but not `30dd16e`, so `AVATAR_CONCEPT_LEDGER.md` still asserted "all 60
shipped" while zero shipped. Caught only because a subagent re-read HEAD instead of trusting its
brief. When reverting, check whether *documentation* commits in the range also need reverting.

---

## 5. Pushing

`git push` does not work from a Cowork session: the proxy refuses to inject a credential
(`ethan556/maggies-trail is not in this session's authorized repository set`), and the GitHub
connector is read-only (`403 Resource not accessible by integration`). Delivery is via
`git bundle`, applied manually:

```bash
git bundle verify <bundle>
git fetch <bundle> cowork/s237:cowork/s237
git push origin cowork/s237
```

Adding the repo to the session's authorized sources removes this whole step.

---

## 6. Outstanding

| # | Item | Blocked on |
|---|---|---|
| 1 | 60 avatar renders | credits (~300 needed, 145 held) + prompt tuning |
| 2 | Rename the 36 line icons' *call sites*? | your call — ~500 sites, own commit, own gate run |
| 3 | Rename brand asset filenames? | your call — recommended against |
| 4 | Landing CTAs still `bg-cta` blue, not navy/orange | WS-A token reconciliation not landed on the most-seen surface |
| 5 | 16px mark variant | needs the artwork owner |

---

## 7. Regenerating things

```bash
npm run gen:brand-icons        # raster derivatives from the approved vector
npm run verify:brand-icons     # verify on-disk only
npm run gen:brand-og           # 1200x630 share card
python3 scripts/brand/gen_trail_icons.py            # 18 trail icons -> contact sheet
python3 scripts/brand/gen_icon_reference_sheet.py   # full 54-icon HTML reference
python3 scripts/brand/gen_avatar_prompt_pack.py     # AVATAR_PROMPT_PACK.md + avatar-prompts.json
```

The gate sequence in `CLAUDE.md` still applies in full, every session. `validate:native` is not
optional.
