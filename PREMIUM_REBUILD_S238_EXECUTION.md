# S238 — Plan v3 adoption + WS-D stage-role surgery

**Session date:** 2026-08-12 · **Base:** `39bf84c` (S237 session D bundle tip) · **Canonical plan:**
`OPTIMIZATION_PLAN_V3.md` (adopted this session; supersedes `PREMIUM_REBUILD_PLAN.md` where they
disagree — see the mapping table at the end of `PREMIUM_EXPERIENCE_CONTRACT.md`).

## Baseline verification (before any change)

typecheck clean · vitest 13,124/13,124 (9,644 + 3,480, two shards, both exit 0) ·
validate:content 1840/1840 · lint:pedagogy 1711/1711 · check-registration consistent ·
validate:native archive-only findings only. Matches HANDOVER_COWORK_S237_SESSION_D_2 §1 exactly.
Trap K fired as documented (queue CSV restored). Playwright chromium baseline was taken on faith
from the handover (97/97) and re-measured after the change — see below.

## What landed

### 1. Plan adoption (Wave 0 deliverables)

- `OPTIMIZATION_PLAN_V3.md` committed as the canonical program document.
- `PREMIUM_EXPERIENCE_CONTRACT.md` written from Plan v3 WS-G §1 — the 13 contract rows with
  their check style (machine vs pixels), the stop rules verbatim, the protected strengths, and
  the mapping from the old Waves A–F program into Plan v3 workstreams.
- Wave 0 precache reconciliation: the repo already carries the S237 inventory layer
  (`COWORK_CACHE/` — engine map, gate map, work index, absent-diagram and typesetting CSVs,
  pending-work inventory). The full §4.2 `/.cowork-cache/` build (17 JSON indexes + screenshot
  matrix) is the entry ticket for a *fanned-out* wave and was deliberately not rebuilt for this
  single-lane session — build it when the first parallel wave launches, not before.

### 2. WS-D §1 — semantic stage roles (the shell change Plan v3 orders first)

The defect (Plan v3 Part 1.2 "Stage & chrome"): the lesson stage capped at `max-w-3xl` (768px)
on 1440px displays, and the six flagship graph labs *additionally* capped their own SVG at
`max-w-lg` (512px) — the mathematics floated as a small diagram in a large page.

| Tier | Was | Now | Plan v3 band |
|---|---|---|---|
| narrow (reading) | `max-w-xl` 576px | `max-w-2xl` 672px | 600–680 |
| medium (compact manipulative) | `max-w-2xl` 672px | `max-w-3xl` 768px | 720–820 |
| wide (wide model) | `max-w-3xl` 768px | `max-w-5xl` 1024px | 920–1080 |
| **hero (new)** | — | `max-w-6xl` 1152px | 1100–1280 |

- `stageWidth.ts`: tier remap + new `hero` tier. **Hero ships with zero members by design** —
  engines opt in with their WS-C conversion after pixel QA at 1440px, never by guess.
- `LessonPlayer.tsx`: the four inner reading-column wrappers follow narrow to `max-w-2xl`, so
  prose, process cues, model controls and recap stay at reading width inside wide stages.
- `widgets.tsx`: the six graph labs sharing the `max-w-lg` SVG cap — ScatterFitW, DilationScaleW,
  TransformExploreW, SystemsExploreW, QuadraticVertexW, LineExploreW — raised to `max-w-xl`
  (512 → 576px). Deliberately modest: these are square viewBoxes, so width is height, and 768px+
  squares would overflow a laptop viewport. The real growth for these labs comes when WS-C gives
  them side panels (representation sync) that *use* the wide stage, not from inflating one SVG.

### 3. Pixel evidence, not JSX evidence

New spec `e2e/s238-stage-roles.spec.ts` (pattern: the two S237 purpose-built specs): at 1440px
the wide lab's main column measures ≥1000px and the graph ≥560px with header/footer agreeing; a
prose step stays ≤700px; at 390px both themes show zero horizontal overflow; 768px clean.
Captures in `S238_SCREENSHOTS/` (lab at 1440/768/390 light+dark, prose at 1440), taken against
`next start`, never dev.

### 4. Three stale e2e assertions fixed (stricter, not looser)

`e2e/player-state.spec.ts` predated Wave A and S235 and was failing at *baseline* (outside the
handover's chromium-only 97/97 claim): it expected the removed `.trail-clearing-shell`, the old
"Picked up where you left off" resume copy (source renders "Resumed at step N of M"), and a
disabled answer input after reveal (S235 exploration checkpoints deliberately keep the model
live). All three now assert the current, intended behavior. Nothing was weakened: the replacement
assertions test the same invariants against the real markup.

## Gate results at session end

```
typecheck                clean
vitest (2 shards)        13,124 / 13,124      (9,644 + 3,480, both exit 0, re-run post-change)
playwright               132 / 132            ALL 5 projects vs next start (chromium + player-state
                                              + 3 viewport projects) — a wider net than the
                                              97/97 chromium-only baseline claim
validate:content         1840/1840
lint:pedagogy            1711/1711
check-registration       consistent
validate:native          archive-only findings only
build                    EXIT:0
```

**HEAD at end of session: `2aa3fca`** — three commits on `39bf84c`: plan adoption (`d410598`),
WS-D stage roles (`e89f23d`), stale e2e fixes (`2aa3fca`).

## Batch 2 (same session): `plotData` extended to `McqSpec` — the family closed to 10 of 16

The S237 handover's suggested first action, executed after the shell work. One field, one
resolver, one renderer, one spoken dialect — no second shape:

- **Schema:** `PlotDataSpec` moved above `McqSpec`; `plotData` optional on mcq with the
  MCQ-specific leakage rule documented (never where an option IS the dataset — dd-02-01/k2's
  shape stays excluded by policy). Integrity pre-switch now covers all three surfaces.
- **Renderer:** `McqW` draws the same `LinePlotFigure` from the same `plotDataParts` call,
  placed prompt → plot → options. `describeWidgetState` gained the mcq case in the identical
  dialect. Grading asserted byte-identical with and without the field.
- **Rows wired (10):** vm-02-01 k1(mcq)/k2/ch1/rem-rl-k · g2g-01-05 k1/k3/rem-g2g-mode-k (mcq)
  · g2g-03-03 k3 (mcq) · vm-02-02 i2 (fractionEntry) + rem-lo-k (mcq). The three vm-02-01
  variant forms (fractionMode, fractionTotal, atOrAbove) now emit the block on every re-ask.
- **Gates extended, not weakened:** corpus contract pins the 14 declared rows by name AND the
  7 variant-less rows by name; the prompt reader learned the two new authored notations (each
  acceptance paired with a rejection); the mcq answer direction is a boundary-guarded label
  check against the keyed option; 40-seed sweeps cover the mcq generator.
- **Still absent by decision:** md-03-04 (×3) and mc-05-02 (×1) blocked on the §5 rulings;
  dd-02-01 (×2) says "dots" where this figure draws X's — needs a glyph ruling, not a hack.
- **Proof:** content-change proof extended (866→867 authorized; vm-02-01 new entry, three
  files' reasons appended) and green at 867/867.
- **Read output (rhythm step 5):** `scripts/measure/print-plotdata-s238.mts` printed all 10
  authored rows and 9 generated seeds; all read clean. One authored defect FOUND and NOT fixed
  (frozen prose): **g2g-01-05/k3's distractor "6 inches" collapses onto the correct value** —
  stacks 2,6,3,1 above 5,6,7,8 make the mode 6 AND the tall-stack count 6, so the
  count-vs-value trap shares its label with the key ("6 inches — its stack is tallest" is
  correct, bare "6 inches" is wrong). A learner reading the plot correctly can be marked wrong.
  Pre-existing; needs a ruling (swap k3's counts, e.g. 2,5,3,1 variant, or reword the trap).
- **Housekeeping (owed from S237 §4):** `gen:manifest` + the head of `gen:reports` regenerated
  (PLAN registry → contentVersion e00cf089, PLAYBOOK_STATUS product-wide tiers A1190/B457/C54,
  PRODUCT_STATE refreshed). The `player-harness-contract-s127` audit expected the pre-S235
  `toBeDisabled()` token and was corrected to the equally-strict `toBeEnabled()` (stated here
  per the never-weaken rule). The full `gen:reports` chain still exits 1 deeper in:
  `place-value-transform-mutations-s145` M28 (accessibility mutation not rejected) — verified
  PRE-EXISTING at baseline `39bf84c` (33/35 there, 34/35 now), left for a dedicated session.

## Batch 3 (same session): unitChain label collisions closed — 82 → 0, corpus-proven

The next item by count in S237 §3.1. The ruler labels derive from the LEARNER'S value, so the
collisions are state-driven: value 1 puts "1.333333" on the t=0.88 tick ON the "ruler counts in
kg" caption (the reported screenshot), and a wrong crossing on mc-01-03/k3 reaches 4,000,000 —
labels wider than the tick spacing itself.

- **Fix, same remedy as HopLandingW:** the caption and the value labels now occupy disjoint
  vertical bands (labels y=76, caption y=92), and an intermediate label (t = 0.22/0.44/0.88) is
  drawn only when its box clears every kept box — the end (t=0) and the marker (t=0.66, the
  actual reading) always keep theirs. **Tick MARKS always stay**; only redundant text drops.
- **Gate extended two ways:** seven named failure-class cases (including the reported one), and
  a corpus-complete sweep — all 19 authored unitChain specs × every learner-reachable crossing
  state (≤2³ dir-sequences) × both tones — zero collisions. Verified the detector FIRES on the
  pre-fix layout (1 failed with the fix stashed, 14/14 with it).
- **Browser evidence:** `S238_SCREENSHOTS/06-unitchain-mc0101-k1-{390,1440}.png` — labels on
  their own row, caption clear below.

**Plus the class-B slider naming defect (S237 §3.1):** `SliderW` carried
`aria-label={spec.prompt}` — the whole task sentence as the range's accessible name, the exact
defect S237 fixed on estimateSlider. Same house pattern applied: a visible `<label>` wraps the
control ("Your value — liters left" / "Number of groups" / generic-and-true "Your value"),
gated in `widgets.estimateSliderLabel.s237.test.tsx`. **Deferred, recorded:** `NumericW` (the
other named instance) still names its input with the prompt — its accessible name is load-bearing
across the e2e and unit harness (`getByRole("textbox", { name: <prompt> })` sites), so renaming
it is a mechanical pass over the test suite that deserves its own batch, not a rider on this one.
The mcq radiogroup's prompt-as-group-name is correct ARIA practice and was left alone.

Reading note (rhythm step 5): ruler labels like "0.333333" are honest but ugly artifacts of the
fixed-marker geometry (value × t/0.66). Cosmetic formatting of ruler intermediates is a design
decision left open — the collision defect is what this batch closed.

## Batch 4 (same session): distributionCompareLab collisions closed — 48 → 0, corpus-proven

Next by count after unitChain. Three data-driven classes, all fixed by geometry:

1. **Group tag on group tag** — the tags sit under the MEANS, and sp-02-01/i2 authors
   meanA = meanB, so "Group A ○" printed on "Group B ◇". When the modelled boxes would collide,
   ONE merged tag names both groups at the midpoint ("Group A ○ · Group B ◇") — honest, because
   the markers ARE at (nearly) one position. Separated means keep two tags: geometry, not policy.
2. **Group tags vs the reveal ghost** — "target N units" shared the tags' baseline band. Bands
   are now disjoint by construction (tags y=170, ghost y=188, tape y=192).
3. **Judge evidence vs itself** — "gap ≈ …" (y=54) and "overlap ≈ …" (y=62) centered on the
   same midpoint in one band and collided whenever both drew (every judge retry AND reveal).
   The overlap line moved to y=76, still above the hatched region it describes.

Gate: six named failure-class cases × three tones, paired acceptances (merged tag present at
gap 0, two tags at gap 15, both evidence lines still state their quantities, the reveal still
names its target), and a corpus-complete sweep — all 33 authored specs × 3 tones, zero
collisions. SVG text here depends on spec × tone only (the learner's value moves rects), so
that sweep IS the reachable label space. Detector verified to fire on the pre-fix layout
(3 failed with the fix stashed). Browser evidence: `S238_SCREENSHOTS/07-dcl-sp0201-i2-390.png`.

**Collision ledger after batch 4: 267 → 137.** Next by count: `slopeTriangle` (25),
`samplingBiasLab` (14), `pointSetReasoningLab` (10), `signChart` (8), 18 smaller (80).

## Batch 5 (same session): slopeTriangle collisions closed — 25 → 0, and the start-state shame

The worst of the 25 was the START STATE of every authored lesson: each begins at run 1, so
"run 1" printed on "A (1, 1)" the moment the step opened (fg-02-02, the reported case). The
labels here are anchored to GEOMETRY the learner drags, so no fixed bands exist — instead a
small deterministic callout layout: each point label chooses among eight candidate corners
(4 + a further ring) and the rise label among six leg-side seats, greedily, first candidate
whose modelled box clears everything already placed plus the fixed obstacles (run label, axis
captions, reveal ghost). The run label keeps its canonical seat — it is the learner's primary
reading and everything else yields to it. The reveal ghost also moved to its own band (y=30):
at y=16 the widest ghost ("…slope undefined", the vertical lf-01-03/i3 line) overlapped the
y-axis caption — a pre-existing pair the sweep caught.

Gate: the reported state and four more named states × both tones, a never-dropped acceptance
(all four labels still present, flipped not suppressed), and a corpus sweep — all 10 authored
specs × 8 learner states (start, solved, four tiny-leg directions, both legMax extremes) ×
both tones, zero collisions. Detector verified to fire pre-fix (2 failed with the fix
stashed). Browser evidence: `S238_SCREENSHOTS/08-slopetriangle-fg0202-i2-390.png`.

**Collision ledger after batch 5: 267 → 112.** Next: `samplingBiasLab` (14),
`pointSetReasoningLab` (10), `signChart` (8), 18 smaller (80).

## Batch 6 (same session): samplingBiasLab, pointSetReasoningLab, signChart — the last NAMED engines

Three engines, three one-cause fixes, all corpus-proven:

- **samplingBiasLab (14 → 0):** "population 50%" and the "50" axis tick share x = 200 and
  printed on each other in every render of every authored spec (7 specs × 2 tones = the 14).
  The tick yields — the caption names that position — 0/25/75/100 stay. Corpus sweep: 7/7 specs
  clean, caption + remaining scale asserted present.
- **pointSetReasoningLab (10 → 0):** dd-04-01/k2 stacks duplicate values (three 6's in one set,
  a shared 2 across sets) and the 1D axis printed the same number once PER DOT. Now ONE label
  per distinct value (greedy skip for distinct-but-adjacent values; dots keep marking every
  position), and the 2D branch's coordinate labels choose a clear corner (the slopeTriangle
  candidate scheme). Corpus sweep: 23/23 specs × both tones; the dd-04-01/k2 verbatim case
  asserts one label per distinct value with every value still named.
- **signChart (8 → 0):** pf-02-03's close roots overprinted their value/kind tags. Close marks
  (roots, poles, holes share one pass) stagger onto a second row — the viewBox grew 28 units to
  give it space above the bottom caption. Corpus sweep: 28/28 specs × both tones; the pf-02-03
  shape asserts both "cross" tags survive on their own rows.

Detector verified to fire on all three pre-fix layouts (4 failed with the fix stashed).
Browser evidence: `S238_SCREENSHOTS/09-signchart-pf0203-i1-390.png`, `10-pointset-dd0401-k2-390.png`.

**Collision ledger after batch 6: 267 → 80.** All six NAMED engine rows from S237 §3.1 are now
closed; what remains is the "18 smaller engines (80 pairs)" long tail — unnamed in the S237
measurement, so the next session should re-run a corpus-wide sweep to enumerate them before
fixing (the measuring sweep itself was never committed; the gate's three sweep patterns are the
raw material for building it).

## Batch 7 (same session): the tail re-measured and its two largest engines closed

The S237 measuring sweep was never committed, so batch 7 rebuilt it as a committed, OPT-IN
measurement (`src/components/collisionSweep.s238.test.tsx`, `COLLISION_SWEEP=1` to run — 11,947
authored specs × 3 tones in ~77s, never fails, writes
`COWORK_CACHE/label-collision-remainder-s238.csv`). First run enumerated the tail at 104 pairs /
18 engines (vs S237's "80 / 18" — this sweep adds the error tone).

Fixed the two largest by the same greedy-seat scheme, corpus-proven:

- **triangleSolve (21 → 0):** the side labels move with the triangle, so a steep triangle slid
  "hyp" into "opp" and a shallow one slid it into the angle° — in BOTH renderer modes (the
  ratios lab and the sas/sss builder; rt-05-03's "4" on "30°" was the builder's). angle° and the
  base side keep their canonical seats; the moving labels take the first clear seat. Gate:
  15/15 authored specs × 3 tones + rt-01-04 across four learner states, every reading asserted
  present.
- **doubleNumberLine (15 → 0):** both row captions ("real metres", "drawing cm", "litres") sat
  on the first tick's "0" band. The captions now own their own bands above/below everything
  (viewBox +20). Gate: 3/3 specs, captions and full tick rows asserted present.

Post-fix re-measurement: **104 → 68 pairs across 16 engines**, largest now 9
(circleMeasureExplore, argandExplore). Detector verified to fire pre-fix (3 failed with the fix
stashed). One vitest flake investigated per Trap B: variants.test addition-patterns timed out
under build CPU contention, passes solo and in a clean shard run.

## Batch 8 (same session): the tail closed — 68 → 0, the collision ledger runs dry

The whole remaining tail (16 engines, 68 pairs) fell to ONE shared mechanism instead of sixteen
bespoke layouts: `s238Seat(text, fs, seats, obstacles)` in widgets.tsx — first candidate seat
whose modelled box (same 0.72em/0.98em/0.28em Chromium-calibrated model as the testkit) clears
every stated obstacle by a 2-unit margin, deterministic fallback to the first seat. Engines
whose collisions were a fixed pair got fixed-offset moves; engines whose label position depends
on authored values got seats.

Per-engine, what actually collided and what moved: **conicLocusLab** (directrix label off the
"directrix" tag), **secantSlope** ("target zone" off the secant readout), **trialProbabilityLab**
("given theoretical" out of the bar row — viewBox grew 116 → 132), **argandExplore** ("z × w"
dodges the z tag), **vectorExplore** ("v here" / "u·v = N" / "u + v" dodge the u and v tags — the
u+v fix required an IIFE inside the `mode === "add"` branch), **circleMeasureExplore** (the
chordDistance `d = …` readout rides its chord instead of the diameter label),
**angleMeasure** (the target tick label moved inside the arc at 0.6R), **triangleClosureLab**
(`{c} target` takes the first of four seats including end-anchored escapes), **accumulateArea**
(the running-area readout clamps below the curve cap), **taylorApprox** (polynomial caption and
radius bar drop to their own bands), **lengthCompare** (the comparison caption band moved clear
of the rulers), **slider**'s conic visual (`both = 2p` dodges the focus tag),
**circleAngleExplore** (below), **absValueLine** (an EDGE tick label is suppressed when an
authored item sits within a label-width of it — ns-05-02 puts −50 one unit from the −51 edge;
the tick MARK stays), **graphStoryLab** (segment labels take a greedy 0/13/26 stagger seeded
with the y-axis caption's box), **lineExplore** (the ghost's "target" dodges the run/rise tags).

**The last pair to fall** was circleAngleExplore cr-01-02/i1: arc 110 with targetAngle 35
exhausts the ghost's four edge seats — both ghost endpoints sit under the "arc AB = 110°"
banner's span and the two lowered seats land beside A's label — so the fallback re-created the
reported pair. The fix is a fifth, centered escape seat (x=cx, y=50): below the banner, below
the rim stroke's dip at the box's edge columns (y=37 cleared every TEXT but put the glyphs ON
the blue arc — caught by screenshot, not by the box model), x-clear of A and B. Pixel evidence:
`S238_SCREENSHOTS/11-circleangle-cr0102-i1-reveal-390.png`, captured from the real player
(3 wrong checks → "Show me how" → revealed ghost), with a real-getBoundingClientRect overlap
assertion in the capture script — zero overlapping pairs in Chromium.

**Parity ratchet caught a real regression of the absValueLine fix:** suppressing the −51 edge
label left "51" spoken in the svg's aria-label but absent from the visible interface
(`widgets.accessibleParity.s237.test.tsx`, absValueLine|51). The aria-label now states the
MARKED span (extreme items and zero — all always visibly labelled) instead of the ±1 padding
edge. The gate did exactly what its ratchet promises; nothing was added to its baseline.

Gates: always-on batch gate added to `widgets.labelCollision.s237.test.tsx` — every authored
spec of all 16 tail engines (counts pinned per engine, 198 specs) × all THREE tones × every svg,
zero collisions; plus cr-01-02/i1 verbatim asserting the ghost's label took the centered escape
seat. Detector verified to fire pre-fix (2 failed with widgets.tsx stashed). Re-measurement:
`COLLISION_SWEEP=1` sweep reports **zero colliding pairs corpus-wide** — 11,947 specs × 3
tones, renders failed 0. The committed remainder CSV is now the empty table.

**The label-collision ledger closes: 267 measured at S237 → 0.** (`figures.tsx`, 4,953 text
nodes, remains deliberately unmeasured — that is a different ledger, not a quiet part of this
one.) `validate:native` this run also lists `tsconfig.tsbuildinfo` alongside node_modules/.next
— gitignored compiler artifact, same archive-only class.

## What S238 did NOT do (open, in Plan v3 priority order)

- The 267 measured label collisions (S237 §3.1) — `unitChain` (82) is the named next target.
- The inline-dataset `plotData` family — extend to `McqSpec` (8 rows ready; handover §8's
  suggested first action, deferred here in favor of Plan v3's shell-first ordering).
- WS-C direct-manipulation conversion (the big one) and hero-tier assignments that come with it.
- WS-A brand productionization, WS-H landing rebuild, WS-J avatars (assets are concept boards
  only — see the two hard rules in Plan v3 Part 0).
- The five rulings in handover §5 still need user answers.
