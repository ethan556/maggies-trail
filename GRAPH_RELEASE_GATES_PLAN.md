# GRAPH_RELEASE_GATES_PLAN — Proposed Release-Gate Suite for Graph/Figure Surfaces

Consolidated 2026-08-14 from the graph-standards review. This plan turns the PROPOSED rules of
`GRAPH_FIGURE_STANDARD.md` into 13 concrete gates (`PG-01`–`PG-13`), each mapped to the defects
and gate gaps in `GRAPH_DEFECT_INDEX.md` (D-nn / GG-nn). Specified, **not built**; no source or
content files were modified by this review.

**The four graph states** (from the runtime/gates audit):
**A** authored (lesson JSON via LessonPlayer/FigureView) · **G** generated (`variantForStep` at
`PracticeClient.tsx:74`, `ReviewClient.tsx:118`, `masteryMission.server.ts:204`) · **R** remedial
(authored `lesson.remedials[]` injected adaptively; remedial checks also seed review → refresh as
G) · **I** post-interaction (same engine re-rendered with learner state, incl. `tone="error"`).

**The central hole** the suite closes: no test in the repo both imports a `variantFor*` function
and renders (state G unmounted everywhere); every collision scanner renders `value={null}` in
`neutral|info` tones (state I unseen); the corpus-wide widget sweep cannot fail
(`collisionSweep.s238`: "Not a gate — it counts, it does not fail").

Effort scale: **S** < 1 session · **M** 1–2 sessions · **L** 2+ sessions or a ledger burn-down.

---

## PG-01 · `variants.render.test.tsx` — generated-corpus render ratchet
- **Renders:** every generator tag × **declared form × band** (support/core/stretch) × ~25 seeds
  via `variantForGenForm`/`variantForStep` (≈ a few thousand mounts; shardable like the existing
  400-seed gate). `WidgetSpec.parse` → `<WidgetRenderer spec value={null}>` in jsdom, tones
  `neutral` **and** `error`.
- **Asserts:** (a) parse succeeds — closes the unparsed-serve hole (`variants.ts:40469`); (b)
  render throws nothing; (c) `scanTextBoxes` over every `<svg>` → zero collisions (S237 model);
  (d) paired acceptance — graph-bearing types must yield `boxes.length > 1` (a gate cannot pass by
  drawing nothing); (e) the unmodellable-label skip list stays empty for engines labelCollision
  already certifies. Fixes the band-sweep blind spot (`variants.test.ts:12047–12054` runs declared
  forms only at the default band — how D-03 shipped).
- **States:** G (and the R→G seam, since review refreshes remedial checks through the same
  generators).
- **Fixtures:** generative — none authored; pin the D-03 seed (g8-bv-scatter-basics × bvScatterPlot
  × stretch) as a named regression.
- **Closes:** GG-01; would have caught D-01, D-02, D-03, and the count-on-line trap-pile-up class.
- **Effort:** M.

## PG-02 · Generated field-fidelity & scale-honesty branch (inside `variants.test.ts`) + corpus-walk extension
- **Renders:** nothing — spec-level, in the per-engine-branch pattern CLAUDE.md already mandates.
- **Asserts per emitted spec:** numberLinePlace — `tickStep > 0`, `(max−min)/tickStep` integral,
  ≤ 30 labelled ticks, interior labels on the 1-2-5-10 ladder (port `numberLineScale.s237`'s
  `offLadder` predicate); **`fractionDen` present** whenever the form's prompt frames a 0→1
  fraction line (form-keyed table — the D-01/D-02 assert); plotPoint — labels non-empty, distinct,
  ≤ 4 chars (390px budget); graphStoryLab/affine/pointSet — `xAxisLabel`/`yAxisLabel` non-empty
  and consistent with `axisContext`/prompt quantity; dot-plot-describing `line-plot` forms must
  attach `plotData` (D-18) and "graphed point" forms must ship a plot path (D-19). Extend the
  `variants.surface.test.ts` walk to `lesson.remedials` (GG-07).
- **States:** G, R.
- **Fixtures:** none (asserts run on generated output).
- **Closes:** GG-10, GG-11, GG-07; re-ship protection for D-01, D-02, D-18, D-19.
- **Effort:** S. **Highest ROI in the suite — build first.**

## PG-03 · `widgets.plotPoint.axes.test.tsx` + plotPoint schema refinements
- **Renders:** every authored plotPoint spec (corpus walk **including remedials**) + the four
  generators × 40 seeds, in jsdom.
- **Asserts:** schema — `xLabels`/`yLabels` **required** (kills D-05 forever; requires authoring
  the 12 unlabeled specs), `cols/rows ≤ 8` parsed on every serving path; render — each of
  cols × rows cells is a button whose accessible name contains its label pair; each axis label
  rendered exactly once; `max(label chars) × cols ≤ 52` (the 390px char budget); target and
  pointError cells have distinct accessible names; the `connectTargets` overlay and the label rows
  derive pitch from the same track source as the cell grid (guards the `CELL = 48` constant
  detachment, D-04).
- **States:** A, G, R.
- **Fixtures:** transposed xLabels/yLabels; duplicate labels; 4-char labels at cols=8; cols=8 +
  yLabels (the les-03-02 shape).
- **Closes:** GG-02; regression-protects D-03, D-04, D-05.
- **Effort:** M (the schema change forces the 12-spec content fix — coordinate with the D-05
  remediation).

## PG-04 · Post-interaction collision pass (extend `labelCollision.s237`)
- **Renders:** the existing 7-engine fixture set, three additional frames each: `value = target`
  (correct final state), `value = first trap/commonPlacement`, and the trap frame with
  `tone="error"` (the tone every learner sees after a miss, currently swept by no failing gate).
- **Asserts:** zero collisions + paired acceptance ("the marker label is present") per frame.
- **States:** I (jsdom).
- **Fixtures:** numberLinePlace `min:-10,max:10,tickStep:1,target:-5` with the marker AT a
  labelled tick (marker label vs tick label, same x); barBuilder `maxVal:8` fully built (per-bar
  count labels vs gridline labels); boxPlot dragged to `Q1=med=Q3` (three labels, one x);
  scatterFit line dragged near-vertical (slope label vs point label).
- **Closes:** GG-03 (and the F11 tone omission).
- **Effort:** S–M.

## PG-05 · Promote `collisionSweep.s238` to a zero-baseline widget ratchet
- **Renders:** what it renders today — every authored **and remedial** widget spec × 3 tones (its
  remedial walk at `:31` is already correct).
- **Asserts:** `hits == []` against a committed baseline CSV that only shrinks — the exact
  `figures.labelCollision.s238` pattern the repo already proved out to "ledger closed wave 14".
  Add a viewBox-containment assert (every text box fully inside the viewBox) to catch the
  feasibleRegionExplore corner-clip class (D-11 / rule B2).
- **States:** A, R.
- **Fixtures:** none new; the usage-weighted remainder CSV
  (`COWORK_CACHE/label-collision-remainder-s238.csv`) is the burn-down ledger.
- **Closes:** GG-08 — the ~50 SVG engines outside the 7-fixture gate finally get failing coverage.
- **Effort:** L (promotion itself S; burning the remainder ledger to zero is the long pole).

## PG-06 · `widgetIntegrityErrors` extensions (spec-integrity branches)
- **Renders:** nothing — schema/lint level, picked up automatically by `lint:pedagogy`
  (`pedagogy.ts:469`, already covers remedials) and by variants.test's integrity call
  (`variants.test.ts:10606`) for any future generator.
- **Asserts:** boxPlot — `axisMin < axisMax`, `targetMin ≤ targetQ1 ≤ targetMed ≤ targetQ3 ≤
  targetMax` (and same for starts), all ten values in `[axisMin, axisMax]`, start ≠ target;
  barBuilder — `maxVal % step === 0`; `plotDataParts` — uniform value spacing (or an explicit
  positional-layout waiver); sequenceBuild — control domain within drawable range (no negative-sum
  states the strip cannot draw); dotPlot — build mode + `denominator` either forbidden or formats
  identically to read mode.
- **States:** A, G, R (everywhere integrity runs).
- **Fixtures:** mis-ordered boxPlot targets; `maxVal:45,step:10`; `values:[1,2,4]` plotData;
  sequenceBuild `d=-5`.
- **Closes:** GG-05, GG-06, GG-14 (schema half), GG-15; the D-22 class.
- **Effort:** S.

## PG-07 · `widgets.scaleTruth.test.tsx` — drawn-label truth asserts
- **Renders:** adversarial per-engine fixtures in jsdom; drives interactions where the hazard is
  interactive (e.g. twenty "run 10" presses on sampleSim).
- **Asserts:** graphRead bar mode tick text equals `t × unitValue` (fixtures `unitValue: 2, 5` —
  the latent axis lie); sampleSim/shuffleTest `max stack × row pitch` fits the frame at the
  retention caps (200/300) — the D-09 clip class; shuffleTest prints its ±lim extents (after the
  D-21 engine fix); dotPlot build formats with `denominator` identically to read mode; plotData
  column positions proportional to values (render half of GG-15); Pv3NumLine tick label ==
  tick value under fractional step; barBuilder top label == actual ceiling.
- **States:** A + I (scripted interaction frames).
- **Fixtures:** unitValue>1 graphRead spec; peaked-distribution sim seeds (populationP 0.5, size
  100); Pv3 step 0.5; barBuilder 45/10.
- **Closes:** GG-04, GG-13, GG-14 (render half), GG-15 (render half); regression-protects D-09,
  D-21, D-22.
- **Effort:** M.

## PG-08 · `e2e/generated-graphs.spec.ts` — real-browser generated + interactive pass
- **Renders:** `/practice/[chapterId]` for one chapter per graph-emitting surface family and
  `/review` with a seeded queue, at 390/768/1440px, both themes; drags one handle on one engine
  per family (state I in a real browser — today the entire graph e2e interaction evidence is one
  radio click).
- **Asserts:** the painted-box collision scan the s237 e2e already implements, applied to the
  generated widget **before and after** the interaction; axe pass on the practice route; no
  horizontal overflow; measured touch-target pitch ≥ 44px on grid/button surfaces.
- **States:** G, I (browser); also widens the E10 route-breadth blind spot (today's a11y e2e
  visits exactly one lesson).
- **Fixtures:** deterministic variant seeds per route; one chapter per family (number-line,
  coordinate-plot, scatter, distribution, story-graph).
- **Closes:** the jsdom under-measurement caveat labelCollision's own header records ("word labels
  optimistically"); the browser half of D-03/D-04.
- **Effort:** L.

## PG-09 · Axis-semantics enrollment — widgets escape-hatch closure + figures analogue
- **Part A (widgets):** enroll parametricTrace, feasibleRegionExplore, argandExplore, and
  dilationExplore grid mode in `axisCaptions.s237` — each either TOUCHED (captions asserted) or
  `BARE_BY_RULING` with a recorded ruling (the polarTrace precedent); assert corner-label viewBox
  containment for feasibleRegionExplore. Blocks the "engine postdates the sweep, misses every
  per-kind enrollment" failure pattern (D-10/D-11/D-12 all follow it).
- **Part B (figures):** new `figures.axisSemantics.test.tsx` — for the graph/statistical figure
  population (≥126 keyword-identified ids as the floor, extendable ledger), assert display-type
  furniture: a histogram draws and names a frequency axis; a scatter names its variables; numeric
  title/caption claims ("each gridline is worth exactly one") are consistent with drawn gridline
  count and label step; overlaid-mark occlusion scan — no two marks of different series at
  identical coordinates at full opacity (the sp7 class, invisible to the text-only ratchet).
- **States:** A (figures are static — all states collapse to one render).
- **Fixtures:** regression pins on the three offending figures (`single-scale-graph`,
  `sp7-dotplot-overlap`, `histogram-scores`) once fixed.
- **Closes:** GG-12, GG-16; regression-protects D-10–D-12 (caption half), D-15, D-16, D-17.
- **Effort:** M–L (Part B needs a per-figure assertion ledger, s238-style).

## PG-10 · `content.graphSemantics.test.ts` — prompt↔spec semantic lint
- **Renders:** nothing — walks the authored corpus (including remedials) at spec level.
- **Asserts:** barBuilder/graphRead `axisLabel` tokens appear in (or are declared synonyms of) the
  step's prompt/category vocabulary (the "minutes read" class); unit-suffix agreement between the
  prompt's question unit and the answer/choice labels (the mg vs "variability-units" class); every
  coordinate pair parsed from the prompt lies within the grid bounds and in `targets` (the
  unplottable-(0,0) class); hop-count phrases ("two hops total") match `spec.hops`; "level the
  bars"-style premises require drawn start data once the schema supports it.
- **States:** A, R.
- **Fixtures:** the four live findings as seed regressions (dm-03-01, as100-01-02, g2g-02-03/03-03,
  g5e-03-02) — each was found mechanically by the data-sync audit's regex harness, so the lint is
  demonstrably automatable.
- **Closes:** re-ship protection for D-06, D-07, D-08, D-20, and D-04's unplottable-pair half.
- **Effort:** M (heuristic; start from the audit's own cross-check patterns).

## PG-11 · `widgets.pointerGeometry.test.tsx` — touch/drag geometry gate
- **Renders:** all drag-enabled graph engines in jsdom; inspects the nodes receiving `handleProps`.
- **Asserts:** any element carrying `touchAction: "none"` has bounded extent (≤ a handle/band
  budget, e.g. ≤ 30% of SVG area, with an explicit allowlist for ruled exceptions) — enforcing
  `useSvgDrag.ts:10–12`'s own contract; drag pucks ≥ 44px effective diameter at minimum stage
  scale (computed from viewBox→334px mapping); the redundant keyboard control is still present
  (re-pins the drag contract).
- **States:** A, I.
- **Fixtures:** the four full-stage offenders (feasibleRegionExplore, parametricTrace,
  distanceGrid, rotationLab) as must-fail-until-fixed entries.
- **Closes:** D-13 regression protection; the sub-44px puck polish class.
- **Effort:** S–M.

## PG-12 · A11y enrollment & parity burn-down gate
- **Renders:** registry-wide in jsdom (extends a11yAudit.s44 / aria suites).
- **Asserts:** an explicit per-kind `describeWidgetState` enrollment list replaces the `dense ≥ 38`
  floor — every DENSE kind has a case or a recorded ruling (the floor "cannot name a kind that
  never enrolled"; feasibleRegionExplore/parametricTrace proved it); non-interactive graph SVGs are
  `role="img"` with stateful accessible names (template check — the HopLandingW "Number line"
  class); `accessibleParity` `KNOWN_UNREVIEWED` gets a max-size ratchet that only shrinks
  (burn-down order: the known answer-leak `extraneousRootLab|2` first, the four `boxPlot|*`
  entries next).
- **States:** A (+ I via stateful-name templates).
- **Closes:** regression protection for D-14 (parity debt), D-23, D-24.
- **Effort:** S for the gate; M to burn the entries (requires the paired engine fixes).

## PG-13 · `masteryMission.bank.test.ts` — assembled-mission gate
- **Renders:** for every tag the links gate says has a mission, `buildMasteryMission(tag, round)`
  for 2 rounds; every bank widget through `WidgetSpec.parse` + `widgetIntegrityErrors` + a jsdom
  mount + collision scan.
- **Asserts:** zero parse/integrity errors; every bank entry's widget type equals its source
  step's type — the surface rule extended to the cross-tag fallback rows
  (`masteryMission.server.ts:198`); collision-clean.
- **States:** G (mission composition) + A (authored fallback members).
- **Fixtures:** a cross-tag fallback case pairing a graph tag with a text-surface source
  (must-decline).
- **Closes:** GG-09 — the mission analogue of the downgrade `variants.surface` exists to prevent.
- **Effort:** S–M.

---

## Four-state coverage matrix

Per check dimension × state: what covers it **today** (always-on only) → what covers it **after**
this plan. `—` = nothing failing today.

| Dimension | A authored | G generated | R remedial | I post-interaction |
|---|---|---|---|---|
| Axis naming/captions | axisCaptions.s237 (26 engines) → + PG-09 (4 escapees + figures) | — → PG-01 (render) + PG-02 (caption text) | nominal (corpus recursion) → PG-02 walk | — → PG-04 frames, PG-08 browser |
| Label collision / clipping | labelCollision (7 engines) + figures ratchet + 3 e2e lessons → + PG-05 ratchet (all engines, viewBox containment) | — → PG-01 | measured-only (opt-in sweep) → PG-05 | — → PG-04 (+ error tone) + PG-08 |
| Scale/tick honesty | numberLineScale (hop only) → + PG-07 + PG-06 refinements | — → PG-02 (density/ladder/fractionDen) | via lint:pedagogy integrity → PG-06 | — → PG-07 scripted frames |
| Data sync (prompt↔graph) | plotData.s237, pictureGraphRead.s237, graphRead.s125, affine.s147 → + PG-10 (axisLabel/units/pairs/hops) | variants.test math + plotData lib sweep → + PG-02 (field fidelity) | pedagogy lint → + PG-10 walk | n/a (display-only overlays pinned) |
| plotPoint (DOM grid) | — → PG-03 | count-checks only → PG-03 + PG-01 | — → PG-03 walk | — → PG-08 |
| Interaction/touch geometry | keyboard + drag contracts → + PG-11 | — → PG-01 parse + PG-08 pitch | same as A via corpus | drag value contract only → PG-08 drags + PG-11 |
| A11y semantics/parity | aria + accessibleParity + a11yAudit floors → + PG-12 enrollment | — → PG-08 axe on practice route | corpus walks → unchanged | — → PG-12 stateful-name templates |
| Assembled surfaces (missions) | — → PG-13 | — → PG-13 | (review seam) → PG-02 | — |

Gate × state summary for the 13 proposed gates:

| Gate | A | G | R | I | Renders? | Effort |
|---|---|---|---|---|---|---|
| PG-01 variants.render ratchet | – | ✓ | seam | – | jsdom | M |
| PG-02 field-fidelity/scale model | – | ✓ | ✓ | – | no | S |
| PG-03 plotPoint axes | ✓ | ✓ | ✓ | – | jsdom | M |
| PG-04 post-interaction collisions | – | – | – | ✓ | jsdom | S–M |
| PG-05 widget collision ratchet | ✓ | – | ✓ | – | jsdom | L |
| PG-06 integrity branches | ✓ | ✓ | ✓ | – | no | S |
| PG-07 scale-truth asserts | ✓ | – | – | ✓ | jsdom | M |
| PG-08 e2e generated graphs | – | ✓ | – | ✓ | browser | L |
| PG-09 axis-semantics enrollment | ✓ | – | ✓* | – | jsdom | M–L |
| PG-10 prompt↔spec lint | ✓ | – | ✓ | – | no | M |
| PG-11 pointer geometry | ✓ | – | – | ✓ | jsdom | S–M |
| PG-12 a11y enrollment/burn-down | ✓ | – | – | ✓* | jsdom | S(+M) |
| PG-13 mission bank | ✓ | ✓ | – | – | jsdom | S–M |

\* figures/remedials collapse to the same registry entry; I-coverage via templates/frames.

## Shared adversarial fixture library

Each fixture names its defect class; build once, reuse across PG-01/03/04/05/07:

1. Negative-through-zero place line, marker at a labelled negative tick (sign-glyph width; D-class of PG-04).
2. Single-point scatterFit; two points at the same x (undefined fit line — data honesty).
3. barBuilder one-category `maxVal:1` (degenerate axis) and 12-bin histogram at 390px (bin-name shrink).
4. `0..1` place line `tickStep: 0.05` (float-label dust — the `0.30000000000000004` class; snapToStep guards the VALUE path, nothing guards label formatting).
5. 1000-wide hop line with `denom` lattice (fraction labels × wide span).
6. graphRead `unitValue: 2` and `5` (GG-04 axis lie).
7. plotPoint cols=8 + yLabels + 4-char labels; transposed labels; duplicate labels (D-03/D-04/GG-02).
8. boxPlot mis-ordered targets (integrity must-fail) and dragged-degenerate `Q1=med=Q3` (GG-06, PG-04).
9. sampleSim peaked seeds — populationP 0.5, size 100, 20× "run 10" (D-09 clip).
10. argandExplore multiply drag driving `|z·w| > gridMax` (D-12 rescale).
11. Pv3NumLine `step: 0.5` (GG-13).
12. sequenceBuild `d = −5` (D-22).
13. Unit-mismatch lint seeds: dm-03-01, as100-01-02, g2g-02-03 (PG-10 regressions).
14. sp7-dotplot-overlap occlusion pin (PG-09 Part B).

## Rollout order (ROI-first)

1. **PG-02** (S — stops the live D-01/D-02 recurrence class the day it lands) →
2. **PG-06** (S) → 3. **PG-01** (M — the central hole) → 4. **PG-03** (M, with the D-05 content
fix) → 5. **PG-10** (M, with the four content fixes) → 6. **PG-04** (S–M) → 7. **PG-13** (S–M) →
8. **PG-11** (S–M, with the D-13 engine fixes) → 9. **PG-12** (S) → 10. **PG-07** (M, with the
D-09/D-21/D-22 engine fixes) → 11. **PG-09** (M–L, with the D-10/D-11/D-12 + figure fixes) →
12. **PG-05** (L — ledger burn-down) → 13. **PG-08** (L).

Standing rule going forward (process, not a gate): a new graph engine, figure family, or generator
does not merge without naming its row in this matrix — the three worst defect clusters in this
review (parametricTrace/feasibleRegionExplore, plotPoint, the generated fraction lines) all trace
to surfaces that postdated or escaped an existing sweep's enrollment list.
