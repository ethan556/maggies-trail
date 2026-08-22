# S328 laneA-E2 — figure-authority remediation evidence

Worker: `cowork-s328-E2-engfig`. Scope: the two signed ESCALATE records in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` whose visual axis was blocked on
`src/**` figure authority — `s327-A4-g5v-03-01` and `s327-A4-g5v-03-03` (both authored by
`cowork-s327-A4-assessor`, both citing S316 §1.4/§7.8's "where the only conforming fix
needs a new figure, stop and escalate" sanction). Contract read in full first:
`reports/closure/S327_ASSESS_A4.md` (grepped for both lesson IDs; full text at lines
192–303), the two current ledger records (grepped `LESSON_REVIEW_DECISIONS_S244.jsonl` for
both lesson IDs, took the last/most recent match — the S327-A4 record in both cases, at
lines 3053–3054), `reports/closure/S324_ENGFIG.md` in full (precedent mechanics: how a
figure gets registered, how placements get bound, which gates confirm correct wiring, how
the earlier wave verified visibility/sync/accessibility), and
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` in full (the visual-figure
standard used throughout A4's own report: R7–R9, and §1.4/§7.8's escalation rule).
Dispositions: `reports/closure/cowork-staging/laneA-s328-E2.jsonl` (2 records, not
appended to the main ledger by this worker).

No `npm test`, full `vitest`, `tsc --noEmit`, or `npm run build` was run at any point —
every gate below is a targeted single-file `vitest run`, a `tsx`/`node` one-off, or one of
the two fast per-file content-check scripts.

---

## Figures added (both additive; registered via `node scripts/gen-figure-ids.mjs`, 2029 → 2031 ids)

| id | component | figures.tsx lines | depicts | bound at |
|---|---|---|---|---|
| `vm-notch-block` | `VmNotchBlock` | 17251–17282 | a rectangular block with a rectangular notch cut from one corner; `48 − 15 = 33` unit cubes remain | `g5v-03-01` / c1 (11–17), c2 (152–158), `remedials[0].concept` = `rem-g5v-composite-c` (411–417) |
| `vm-equal-volumes-compare` | `VmEqualVolumesCompare` | 17285–17313 | two differently-proportioned rectangular solids (base 20×3 layers vs. base 12×5 layers) side by side on one ground line, both equal to 60 unit cubes | `g5v-03-03` / c2 (138–144), `remedials[0].concept` = `rem-g5v-compare-c` (386–392) |

Registration lines in the `FIGURES` map (`src/components/figures.tsx`): 30974–30975,
inserted immediately after the existing `"vm-l-shape": VmLShape,` entry — i.e. grouped with
their `vm-*` siblings, matching the file's own organization-by-topic-prefix convention (not
appended at the end of the map; S324's own `vec-matrix-row-recipe` and
`mult3-fair-shares-16-over-2` entries are inserted the same way, next to their siblings, not
appended).

---

## g5v-03-01 — Composite Solids: what `vm-notch-block` depicts, and why it is true

**A4's finding, verified again before touching anything.** Read the lesson JSON directly:
neither `c1` nor `c2` carried a `figure` key. This lesson's defining action — subtract a
notch from a full block to get the remaining volume — was narrated only in text
(`i1.widget.successFeedback`: "30 cubes in the full block — the notch of 8 comes off this
total, leaving 22."; `i2.widget.successFeedback`: "28 cubes fill the block; remove the
6-cube notch once to leave 22.") and never shown. A4 checked every plausibly-relevant
registered figure and rejected all three candidates on the record: `vm-l-shape` and
`vm-add-volumes` depict the wrong *operation* (an **additive** cut-into-two-boxes-and-add
decomposition, which directly contradicts this lesson's subtractive method); `sg-subtracting`
has the right *abstract principle* (outer − removed) but the wrong *shape* (a circle) and the
wrong *register* (pricing/manufacturing framing, not this Grade-5 rectangular-prism,
unit-cube-counting course).

**What the new figure shows.** `VmNotchBlock` draws one light-filled rectangle (the full
block, SKY fill, solid ink stroke) and, at its top-right corner, a second rectangle drawn
white with a dashed berry outline (the notch — "removed", using `sg-subtracting`'s own
established "draw the removed piece as a dashed/hollow overlay" convention, corrected to
rectangular-corner geometry instead of circular-center geometry). Labels read "full block:
48", "notch: 15", and "48 − 15 = 33 remain". **The math:** 48 − 15 = 33 — arithmetically
trivial, but the point of the figure is that it is *shown*, not merely stated: the dashed
rectangle occupies the same on-screen area the "15" refers to, sitting inside the same
outline the "48" refers to, so a learner can see that the 33 remaining is the block minus
the visibly-removed corner, not an independent computation.

**Why 48/15/33 and not this lesson's own 30−8=22 or 28−6=22.** The figure is bound to
**both** `c1` and `c2`. `c1` sits *before* `i1`'s own predict-before-reveal question ("A
5-by-6 block with an 8-cube notch — volume? 22 or 38"). Had the figure used i1's own
numbers, it would have hand-fed the learner that prediction's answer before they commit to
one. Using a fresh, verified-distinct instance (confirmed by direct enumeration against
every worked pair in the lesson — i1 30−8=22, i2 28−6=22, k2 24−16=8, ch1 36−24=12,
remedial 28−6=22 — none of which is `(48, 15)`) lets the figure teach the *general method*
("find the full block, then subtract what was cut away" — c1's own sentence, which never
states specific numbers) without spoiling any specific answer anywhere else in the lesson.
`c2`'s sentence ("A notch is space removed... The subtraction happens once, on the whole
solid") is the same idea restated, so reusing one correct figure across both concept steps
is appropriate — and precedented in this exact course: `g5v-02-02` binds `vm-base-height` to
both its `c1` and `c2` (A4's own review of that lesson accepted the reuse). The same figure
is also bound to `remedials[0].concept` (`rem-g5v-composite-c`), whose body is byte-identical
to `c2.body` (a separate, already-documented, non-gating debt item — see Residual risk
below) — since the figure is truthful for `c2.body`, it is truthful for the remedial
concept's identical text by construction.

---

## g5v-03-03 — Comparing Two Solids: what `vm-equal-volumes-compare` depicts, and why it is true

**A4's finding, verified again before touching anything.** Neither `c1` nor `c2` carried a
`figure` key. The lesson's central claim — that two differently-shaped solids can hold the
same volume — was asserted only in feedback text (`i1.widget.successFeedback`: "60 — and B
is also 60, so two different shapes hold the same volume."; `i2.widget.successFeedback`:
"both C and D have the same volume even though their dimensions differ."). The
`estimateSlider` widgets themselves ask the learner to find only **one** of each pair's
volume; the two solids are never shown side by side, and the second solid's volume is never
independently verified by the learner. A4 checked every registered `vm-*` figure and found
none depicting two differently-proportioned solids compared with equal volume.

**Showing the volumes really are equal.** `i1`'s own authored prompt: "Solid A is 20 by 3;
solid B is 12 by 5" with `target: 60`.

```
Solid A: 20 × 3 = 60
Solid B: 12 × 5 = 60
```

Both computations are plain multiplication and both equal 60 — this is not a coincidence
manufactured for the figure; it is exactly the pair the lesson's own author already chose
for `i1`, confirmed by `successFeedback` stating "B is also 60" in words. `VmEqualVolumesCompare`
renders Solid A as a **wide, short** stack (base 20, 3 stacked layers, width 100 × height 36
in the SVG) and Solid B as a **narrower, taller** stack (base 12, 5 stacked layers, width 60
× height 60), both resting on one shared ground line, connected by an "=" glyph, with a
caption stating the arithmetic directly: "20 × 3 = 12 × 5 = 60". The different width:height
ratio of the two rectangles *is* the visual argument — same total area (a stand-in for
volume, consistent with this course's flat "count of unit cubes" register used throughout
its other `vm-*` figures), differently proportioned.

**Why bound to `c2` only, not `c1`.** `c2`'s own sentence — "Different shapes can hold
identical volumes, which is exactly why the count settles the question and appearances do
not" — **is** this claim, so binding there is a direct, truthful, one-to-one match. `c1`
("compute both volumes and the larger count wins") sits *before* `i1`'s own
predict-before-reveal question ("A is 20×3 and B is 12×5. Which is larger? Equal — both 60,
or A"). Putting this lesson's real 20×3/12×5=60 pair on `c1` would have handed the learner
that prediction's answer before they ever commit to a guess. By the time `c2` renders, `i1`
has already been played and has already stated "60 — and B is also 60" in its own
`successFeedback` — so drawing that same, already-revealed pair at `c2` supplies the missing
*picture* of a fact the learner has already been told in words, without previewing anything
still ahead: `i2`'s own pair (base 14/height 4 and base 7/height 8, both 56) is untouched and
remains an independent second exercise. This asymmetric binding — one concept step figured,
its sibling deliberately left bare — is not a new mechanism; it mirrors the S324 wave's own
`pc-03-01/c2`, left "deliberately unfigured per the session271 withheld pin"
(`S324_ENGFIG.md`). The same figure is also bound to `remedials[0].concept`
(`rem-g5v-compare-c`), whose body is byte-identical to `c2.body`, for the same reason given
above for the other lesson.

---

## visualDecision and decision: why `SUFFICIENT` / `KEEP`

The ledger schema (`LESSON_REVIEW_DECISIONS_S244.jsonl` line 1) lists the enum
`["REQUIRED","PREFERRED","SUFFICIENT","ESCALATE"]` with no inline definitions, so the
values' operative meaning was read from how this exact review lineage actually uses them
(the task's own instruction: pick correctly, do not guess):

- `scripts/audit/append-s316-dispositions.mjs` (lines 191–197) shows the repo's own
  normalization heuristic: a `REVISE` disposition whose rationale still names an open
  figure/visual problem is treated as `REQUIRED`; **everything else defaults to
  `SUFFICIENT`.** `REQUIRED` therefore denotes an *open, unmet* need, not a satisfied one —
  using it for a now-resolved gap would invert its meaning in this codebase's own tooling.
- The direct, on-point precedent: `reports/closure/cowork-staging/laneA-s324-engfig.jsonl`
  records `s324-engfig-df3-01-01` and `s324-engfig-df3-01-02` — the *exact* situation of a
  signed figure-authority `ESCALATE` discharged by registering a new `figures.tsx`
  component and binding it — both carry `"decision":"KEEP","visualDecision":"SUFFICIENT"`.
- Within A4's own report (this task's primary source), `SUFFICIENT` is the rating given
  whenever a correct static figure is reinforced by genuine interactive/manipulable
  coverage of the same idea (`g5v-01-01`: "Two interactive `areaModel` widgets ... add real
  visual/manipulable coverage on top of the two static figures, so visualDecision is
  SUFFICIENT rather than merely PREFERRED"). Both lessons here now match that exact
  pattern: `g5v-03-01` has `vm-notch-block` on both concept steps plus two genuinely
  interactive `barBuilder` widgets building the pre-notch block; `g5v-03-03` has
  `vm-equal-volumes-compare` on the step that states the central claim plus two genuinely
  interactive `estimateSlider` widgets that require computing and sliding to each volume.

`decision: KEEP` follows because A4 already confirmed every other axis (math, remedial
diagnostic-equivalence, progression, language) defect-free for both lessons — the *only*
thing tracking the overall decision away from KEEP was the visual axis, and that is now
resolved. `gradeLanguageDecision: FIT` is carried forward unchanged from A4 (no body,
narration, or widget text was touched by this record — only `figure` keys were added).

---

## Files changed / added

| file | change |
|---|---|
| `src/components/figures.tsx` | Added `VmNotchBlock` (lines 17251–17282) and `VmEqualVolumesCompare` (17285–17313); added both to the `FIGURES` map (30974–30975) |
| `src/components/figureIds.ts` | Regenerated (`node scripts/gen-figure-ids.mjs`): 2029 → 2031 ids |
| `src/lib/figureNumericClaims.generated.ts` | Regenerated (`npx tsx scripts/audit/generate-figure-numeric-claims.mts`): 197 → 199 claims; new entries `"vm-equal-volumes-compare": "20 × 3 = 12 × 5 = 60"` and `"vm-notch-block": "48 − 15 = 33 unit cubes remain"` |
| `content/courses/volume-problems-g5/lessons/g5v-03-01.json` | Added `"figure": "vm-notch-block"` to `c1` (line 15), `c2` (line 156), `remedials[0].concept` (line 415) |
| `content/courses/volume-problems-g5/lessons/g5v-03-03.json` | Added `"figure": "vm-equal-volumes-compare"` to `c2` (line 142), `remedials[0].concept` (line 390) — **not** `c1` (see spoiler-avoidance reasoning above) |
| `src/lib/session265.volumeProblemsG5Course.test.ts` | `exactFigures` map (lines 29–48) gained `["g5v-03-01:c1","vm-notch-block"]`, `["g5v-03-01:c2","vm-notch-block"]`, `["g5v-03-03:c2","vm-equal-volumes-compare"]`; count assertions (lines 116–117) updated `exact` 8→11, `withheld` 8→5 (`concepts` unchanged at 16) |
| `src/components/s328Figures.test.tsx` | **New.** 12 tests: render-content pins for both figures (role="img", `<title>`, a real aria-label, exact rendered substrings), an arithmetic-and-provenance check for each figure (48−15=33 distinct from every other worked pair in `g5v-03-01`; `vm-equal-volumes-compare`'s pair is exactly `i1`'s own 20×3/12×5=60, not `i2`'s 14×4/7×8=56), the 5 binding pins, the deliberate-non-binding pin on `g5v-03-03/c1`, and a scoped zero-label-collision check for both new figures |
| `reports/closure/cowork-staging/laneA-s328-E2.jsonl` | **New.** 2 `lesson-disposition` records, `recordId`s `s328-E2-g5v-03-01` and `s328-E2-g5v-03-03` |
| `reports/closure/S328_FIX_E2.md` | **New.** This report |
| `FIGURE_TEXT_ALIGNMENT_AUDIT.csv` | Regenerated as a side effect of running `scripts/audit/figure-text-alignment.mjs` (a tracked audit artifact, not hand-edited) |
| `reports/vis/VIS01_PLACEMENTS.csv` | Regenerated as a side effect of running `scripts/audit/vis01-illustration-measurement.mts` (tracked audit artifact, not hand-edited) |

No `src/components/widgets.tsx`, schema, pedagogy-lint, or other lesson file was touched.

---

## Gates run and results

All commands run from the repo root; none is a full-suite (`npm test` / full `vitest run` /
`tsc --noEmit` / `npm run build`) command, per this task's resource constraint.

| gate | command | result |
|---|---|---|
| Syntax parse | `npx esbuild src/components/figures.tsx --outfile=…` | clean, no errors/warnings |
| Figure-id registry | `node scripts/gen-figure-ids.mjs` | `figureIds.ts written: 2031 ids` (both new ids present) |
| Numeric-claims registry | `npx tsx scripts/audit/generate-figure-numeric-claims.mts` | `WROTE … (199 exact arithmetic-title claims)`; both new entries extracted correctly |
| SSR content check | `npx tsx scripts/audit/_s328_ssr_dump.mts` (throwaway probe, deleted after use) | both components render via `renderToStaticMarkup` with no exceptions; markup matched the hand-verified coordinates exactly |
| S238 label-collision replica (node one-off, using the real `collisions()`/`labelWidth()` from `textBoxes.testkit.ts`, not reimplemented) | `npx tsx <probe>` | **0 collisions**, all text boxes in-bounds, for both new figures (verified against both the hand-derived coordinates and the actual SSR-rendered markup) |
| New pinning test | `npx vitest run src/components/s328Figures.test.tsx` | **12/12 passed** |
| Course integrity (updated pin) | `npx vitest run src/lib/session265.volumeProblemsG5Course.test.ts` | **5/5 passed** |
| Corpus-wide "every registered figure renders with zero colliding pairs" ratchet | `npx vitest run src/components/figures.labelCollision.s238.test.tsx` | **2/3 passed**; 1 failure — see Residual risk below (pre-existing, unrelated, confirmed present at `HEAD`) |
| Registration consistency | `node scripts/check-registration.mjs` | `registration: files ↔ course.json ↔ PLAN.md all consistent` |
| Figure/text alignment audit | `npx tsx scripts/audit/figure-text-alignment.mjs` | `{"uses":3573,"fixedExemplars":12,"renderedFixed":12,"suppressed":0}`; all 5 new placement rows show `text_aligned=yes`, `render_decision=RENDER` |
| Illustration placement measurement | `npx tsx scripts/audit/vis01-illustration-measurement.mts` | `TOTAL PLACEMENTS: 3573`, `3571 RENDERS`; the only non-rendering rows (`2 × mult3-fact-family`) are pre-existing and unrelated |
| Content schema validation | `npm run validate:content` | `schema: 1840/1840 files clean` (both lesson files explicitly listed clean) |
| Pedagogy lint | `npm run lint:pedagogy` | `pedagogy: 1711/1711 files clean` (both lesson files explicitly listed clean) |

---

## Residual risk / follow-up

1. **One pre-existing, unrelated collision surfaced by the corpus-wide ratchet.**
   `figures.labelCollision.s238.test.tsx` reports `asv-surface-vs-volume` (a Grade-6
   area-surface-volume figure, `figures.tsx` line ~770 — nowhere near either edit made by
   this record, at lines 17251–17313 and 30974–30975) with 2 colliding text-box pairs
   ("6 faces"/"= 16 sq units" and "4 unit cubes"/"= 4 cu units", each a ~0.6-unit vertical
   sliver). Confirmed via `git diff HEAD -- src/components/figures.tsx | grep
   AsvSurfaceVsVolume` returning **empty** — the function is byte-identical to the last
   commit (`7d8e4f4`) and was not touched by this or any other change in this session. This
   is out of scope for `s327-A4-g5v-03-01`/`g5v-03-03` and is left for whichever lane owns
   `area-surface-volume`; it does not affect either lesson closed by this record, and
   neither `vm-notch-block` nor `vm-equal-volumes-compare` appears anywhere in that test's
   failure output (both pass the scoped collision check inside `s328Figures.test.tsx`).
2. **The S316 §6 remedial-concept-body debt is still open in both lessons**, unchanged by
   this record: `remedials[0].concept.body` is byte-identical to `c2.body` in both
   `g5v-03-01` and `g5v-03-03` (A4 recorded this and explicitly did not fix it, citing
   S316 §6 — "not a worker fix... rewriting an authored explanation is authored-prose
   work"). Both `reopenCondition`s in this record's staged dispositions name this
   explicitly, unchanged from A4's own wording, so a future authored-prose pass over this
   debt class will not find its reopen trigger silently dropped.
3. **`g5v-03-03/c1` is deliberately left unfigured** — documented at length above and
   pinned by `s328Figures.test.tsx`'s "keeps g5v-03-03/c1 deliberately unfigured" test. If a
   future worker wants a `c1`-side figure for this lesson (the general "compute both,
   compare the counts" procedure, as opposed to the equal-volumes special case `c2` now
   depicts), it must use numbers that do not appear in `i1`'s prompt/target, for the same
   spoiler-avoidance reason given above — or it must re-derive whether that concern still
   applies if `i1` itself is ever rewritten.
4. **Staging only.** Per instructions, `reports/closure/cowork-staging/laneA-s328-E2.jsonl`
   was written but **not** appended to
   `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`. Both `reviewedBasisHash` values
   were computed *after* the content edits landed, via `node
   scripts/session/print-review-basis.mjs g5v-03-01 g5v-03-03`, per the hash's documented
   byte-sensitivity; both records validate cleanly against the ledger schema's
   `requiredDecisionFields`/enum contract (checked programmatically against the schema
   record at the top of the ledger file).
