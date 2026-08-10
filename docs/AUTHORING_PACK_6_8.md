# Authoring pack — grades 6–8

**Read this instead of exploring.** Everything below was established by reading the tree; the point
of the file is that you do not have to read it again. `schema.ts` is 8,258 lines and `figures.tsx`
is 28,563 — neither is authoring input.

---

## 1. The loop

```
author patch.json  →  draw any new figures  →  gen-figure-ids  →  ingest --dry-run
   →  ingest  →  regen  →  fast gates  →  (once per session) expensive chain  →  snapshot
```

```bash
# 0. new figures first — the visual-explanations floor is 100%, not "eventually"
node scripts/gen-figure-ids.mjs

# 1. preflight, then ingest
npm run ingest:patch -- content/patches/<batch>.json --tag S20xA --dry-run
npm run ingest:patch -- content/patches/<batch>.json --tag S20xA

# 2. regen (order matters: manifest before world before reports)
npm run gen:manifest && node scripts/gen-world-manifest.mjs

# 3. fast gates — ~4 min, run after every batch
npm run validate:content && npm run lint:pedagogy
node scripts/verify-visual-explanations.mjs && node scripts/verify-math-format.mjs
node scripts/check-registration.mjs && node scripts/verify-world.mjs
npm run standards:coverage

# 4. expensive chain — ~25 min, ONCE per session, at the end
NODE_OPTIONS="--max-old-space-size=2048" npx vitest run --pool=forks --maxWorkers=1 \
  $(node scripts/session/test-groups.mjs list content)          # repeat for rest chunks
npx next build && npm run gen:reports

# 5. seal
# 5. seal — NEVER `npm run hash:snapshot`: that npm script is hardcoded to
#    SESSION201_LESSON_HASHES.json and silently OVERWRITES that sealed baseline.
#    Name the target file yourself, and pick a session number that does not exist yet.
node scripts/session/hash-proof.mjs snapshot SESSION<n>_LESSON_HASHES.json
```

`ingest-content-patch.mjs` writes nothing unless every preflight assertion passes, and it updates
all three authorization sets itself. Do not hand-edit lesson JSON in the tree — see §6.

---

## 2. The pedagogy contract

`src/lib/pedagogy.ts` is the authority; the ingest preflights the same rules so failures arrive in
seconds rather than after a full run. A lesson must satisfy **all** of:

**Shape**
- 8–15 steps; last step is `recap`; recap has 1–3 `takeaways` and a `teaser`
- ≥60% of steps require action (concept and recap steps do not count)
- no two `concept` steps in a row; a concept is followed by a check/interactive within 2 steps
- `challenge` only in the final third; exactly **3** hints (nudge → method → near-solution)
- at most **one** `predict`, only on an `interactive` step, only with a widget, and its
  `outcomeId` must be one of its own options

**Every concept step needs `"figure": "<registered-id>"`.** `verify-visual-explanations` runs at
`FLOOR_PCT = 100`. An id absent from `figureIds.ts` renders nothing and fails the same session.

**Checks and challenges**
- `conceptTag` (a real skill — it feeds mastery, spaced review and the Trailhead recommendation)
- ≥2 `explanationVariants`, genuinely different from each other
- `numeric` / `fractionEntry` / `pointEntry`: ≥2 `commonErrors` with **diagnostic** feedback, plus
  `fallbackFeedback`. Generic strings are rejected by pattern; name the misconception. No
  `commonError` may equal the answer, and two distractors may not share identical feedback
- `mcq`: exactly one correct option, every option has feedback. **Do not rotate option order** —
  authored order keeps the correct option at index 0 by corpus convention (pinned >0.95 in
  `optionOrder.test.tsx`); the learner-facing shuffle happens at render, seeded by
  `lessonId:stepId`
- widgets must not start solved: no slider on its target, no `dragOrder` already ordered

**Remedials** (optional): each pair is a `concept` step then a `check` step whose `conceptTag`
matches the pair's tag.

**Standards**: new 6–8 lessons should declare `"standards": ["6.SP.B.4"]`. Codes are validated
against `content/standards/ccss-6-8.json`.

---

## 3. Donors — clone these, do not invent

Median lesson is 358 lines of JSON; recent G7/G8 lessons run 520–580. Copy a donor's widget config
shape-for-value and change the numbers. All widgets below are already in production use.

| Target | Donor lesson(s) | Widget |
|---|---|---|
| 8.EE.A.1 exponent rules, zero/negative | `exponents-polynomials` ep-01-01…03 (G9) — port the design down a grade | — |
| 7.G.A.2 unique/many/no triangle | `triangle-congruence` tc-01-01, tc-01-02 (G10); `geometry-g7` g7-04-01 | `triangleConstraintLab`, `triangleClosureLab`, `angleMeasure` |
| 6.SP.B.4 box plots | `data-distributions` dd-04-02, dd-05-01 | `boxPlot` |
| MAD (6.SP.B.5c, 7.SP.B.3) | dd-04-03 "Same Center, Different Spread" | `distributionCompareLab`, `dotPlot`, `numeric` |
| 7.EE.A.1 factoring | `expressions-equations` ee-03-01 (distribution, run backwards) | `algebraTiles`, `buildExpression` |
| 7.EE.A.2 structure / 1.05a | `two-step-equations` tse-01-* | `buildExpression`; figure `pr7-percent-multiplier` |
| 7.RP.A.3 interest, commission, % error | `proportional-relationships` pr-04-* | `percentBar`, `percentChangeLab` |
| 8.G.A.3 coordinate rules | `transformations-measurement` tm-01-* | `transformExplore`, `plotPoint` |
| 6.RP.A.3a ratio pairs on the plane | `ratios-rates` rr-02-01; `number-system` ns-04-03 | `ratioTable`, `plotPoint` |
| 6.EE.A.2b expression vocabulary | `expressions-equations` ee-02-* | `buildExpression` |
| 8.EE.C.8b elimination | `systems-equations` se-03-03 (G9) | `systemsExplore` |
| probability / simulation | `sampling-and-probability` sp-04-01, sp-04-02 | `treeDiagram`, `spinnerSim`, `compoundEventLab` |

68 widget types are already in use across grades 6–8. **Wave 1 needs no new widget.** A new widget
costs a component + registry entry + samples + a11y/registry tests + mode-equivalence coverage —
roughly 5–10× a lesson.

---

## 4. Figures

1,827 registered. Search `figureIds.ts` before drawing. Families already present:
26 exponent/power · 29 coordinate/transform · 17 triangle · 8 percent (including
`pr7-percent-multiplier`, `pr7-percent-change`, `percent-price`) · `spread-compare` for variability.

New figures are plain SVG React components in `figures.tsx` (~30–50 lines): a `viewBox`, a
`<title>` that describes the picture for assistive tech, `INK`/`SKY` palette constants, no
animation. Register with `node scripts/gen-figure-ids.mjs`. Budget ~2–3 concept steps per lesson,
so a 6-lesson batch needs 12–18 figure slots and typically 4–8 genuinely new drawings.

**Hard rules `figures.test.ts` enforces on every registered figure** (learned the expensive way in
S203 — 14 labels had to be rewritten after the sweep failed):

- **`fontSize` ≥ 10 units. No exceptions.** `fontSize={9}` fails the render sweep. Small annotation
  text is not a licence to go under the floor; shorten the label instead.
- a narrated `<title>` describing what the picture *shows*, not what it is called
- any animation must be gated on `prefers-reduced-motion`, and the static render must still be the
  complete teaching state

Palette constants available: `INK`, `SKY`, `TANGERINE`, `LEAF`, `BERRY`.

---

## 5. Standards coverage

- `content/standards/ccss-6-8.json` — the 112 lettered sub-standards (G6 42, G7 37, G8 33)
- `content/standards/ccss-6-8-coverage-map.json` — chapter → sub-standards for the existing 218
  lessons, plus `incompleteCoverage` notes naming what is missing *inside* a covered code
- `npm run standards:coverage` — the gate, also in the `gen:reports` chain

The gate has a **two-way ratchet**: it fails if uncovered sub-standards rise above `MAX_UNCOVERED`,
and it also fails if coverage improves without the constant being lowered to match. When it tells
you to lower it, lower it in the same commit. A new chapter absent from the coverage map is a
failure, so new chapters must be mapped or their lessons must declare `standards` inline.

Regenerate both files with `npm run standards:gen` after editing
`scripts/standards/gen-ccss-6-8.mjs` — never hand-edit the JSON.

---

## 6. Traps (each one has cost a session)

1. **The authorization trap is NINETEEN places, not seven** (HANDOVER §8, §11). *Any* lesson-JSON
   byte change must be authorized in `content-change-proof-s151c.mjs` (which hardcodes both the
   changed count and the corpus total), `quotient-reasoning-s146.py`, and
   `affine-relationship-s147.py`; a lesson ADDED also needs `content/PLAN.md` and the eleven
   hardcoded corpus-total pins in `content-json-s143…s151.mjs` +
   `session150/151-failure-first.mjs`; and a SEAM EDIT to a pre-existing lesson additionally needs
   an `S20xX_AUTHORIZED` set in `exact-number-s148.py`, `geometric-constraint-s149.py` and
   `point-set-reasoning-s150.py`. `ingest-content-patch.mjs` handles the first fifteen. The
   `content-json-*` pins fail SILENTLY — empty error array, exit 1, no output — nine minutes into
   `gen:reports`. This is the reason not to hand-edit lessons.
2. **NEVER run `npm run hash:snapshot`.** The npm script is hardcoded to
   `SESSION201_LESSON_HASHES.json` and silently overwrites that sealed baseline — the "snapshot to
   a new file" advice does not protect you, because the script ignores you. Call the tool directly
   with an explicit, not-yet-used filename:
   `node scripts/session/hash-proof.mjs snapshot SESSION<n>_LESSON_HASHES.json`.
   (S203B ran the npm script and had to restore SESSION201 from the packaged tarball.)
3. **Bare `vitest run` is silently OOM-killed** on this 1-core/4 GB box — no error, no summary, no
   exit code. Use `--pool=forks --maxWorkers=1` with `test-groups.mjs list|chunk`.
4. **Unregistered `variant.form` names** pass `g1Independent.cjs`'s permissive `solvePrompt`
   fallback and then fail at runtime in `variantForGenForm`. Assert every declared form is in the
   generator's registered `forms` array.
5. **MCQ option rotation at authoring time** breaks `optionOrder.test.tsx`'s pinned corpus
   statistic. Leave the correct option at index 0.
6. **Figures cannot be deferred** — the floor is 100%, so "figures next session" is a build break
   this session.
7. **Playwright cannot run in these sandboxes** (no browser binaries, download host outside the
   allowlist). Write the specs, record them as unexecuted, do not claim them green.

---

## 7. Where the lessons should go

Wave 1 is 22 lessons closing every *absent* 6–8 sub-standard, as **chapter insertions into the 17
existing courses** — no new courses, so Basecamps, regions and the world manifest stay stable.
Batches, grouped by widget family so donor reading is amortized:

- **B — statistics & data (5):** MAD ×2, box plots ×2, 6.RP.A.3a
- **C — expressions & equations (6):** 7.EE.A.1 ×2, 7.EE.A.2 ×2, 6.EE.A.2b, elimination
- **D — exponents & percent applications (6):** 8.EE.A.1 ×3, interest/commission/percent-error ×3
- **E — geometry (5):** 7.G.A.2 ×3, 8.G.A.3 ×2, plus folding the 6-lesson
  `surface-area-solids-g7` stub into `geometry-g7`

Waves 2–3 (+62 lessons, bringing every domain to 2.5 lessons per sub-standard) come **after** a
pilot cohort: Wave 1 closes the absent standards, which is the alignment threshold; learner data is
the honest way to prioritize the thin ones.
