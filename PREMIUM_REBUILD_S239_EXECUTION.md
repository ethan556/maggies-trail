# S239 — WS-C direct manipulation: the tail closes

**Session date:** 2026-08-13 · **Base:** `8038b7c` (S238 final bundle tip; ancestry to `4b66fe1`
verified) · **Canonical plan:** `OPTIMIZATION_PLAN_V3.md`. Continues the user-approved queue:
figures ledger (done, S238) → NumericW (done, S238) → **WS-C (this wave)** → the NOT-POSSIBLE rows
(next wave: percentBar flat-fee, systemsExplore vertical constraints ×2, parametric-direction
tracer ×2).

## Baseline verification (before any change)

typecheck clean · vitest 13,246 (9,698 + 3,548, two shards, both exit 0) · both opt-in sweeps
EMPTY · validate:content 1840/1840 · lint:pedagogy 1711/1711 · proof 871/871 ·
check-registration consistent. Matches HANDOVER_COWORK_S238 §1 exactly.

## Wave 19: every remaining slider-proxy engine adjudicated — 25 conversions, WS-C CLOSED

The frontier was RE-MEASURED first, not inherited: `scripts/measure/wsc-frontier-s239.mjs`
(committed) enumerates every widgets.tsx component carrying an `input[type=range]`, joins it
against live corpus usage (the S237 engine-map counts were stale — algebraTiles is 17 authored
steps, not 27), and flags existing `useSvgDrag` adoption plus bespoke pointer rails. Raw result:
84 range-carrying components, 57 not yet on the substrate. Every one of the 57 now has a verdict
below; none is silently skipped. Each conversion asked the standing question — *what is the
learner's object?* — and kept its slider as the keyboard-parity path, so grading, tone grammar,
process evidence and the a11y panel are untouched by construction.

### Converted this wave (25 engines, by gesture family)

**1D positions** — the object is a place on an axis, so it drags along it:
- **percentBar (10 uses):** the FILL EDGE (fractionBar's gesture), on the percentStep lattice.
  Next wave's flat-fee capability inherits this surface.
- **accumulateArea (7):** the SWEEP FRONTIER — the slider's own label already said "drag x".
- **solidSliceLab (7):** the SECTION PLANE pulls through the solid on the fractionStep lattice.
- **slopeField (9):** the INITIAL-CONDITION dot rides the y-axis; the solution re-threads live.
- **taylorApprox (3, radius mode only):** the EVALUATION POINT slides in tenths. Terms mode keeps
  its slider alone — a term count is scalar (survival rule), and the gate pins that asymmetry.
- **verticalLineScanner (2):** the SCANNER LINE sweeps; max-crossings bookkeeping rides the same
  setter as the slider.
- **covariationScrubber (3):** the POINT ON THE LINE scrubs the shared input.

**Angular / polar objects** — the object turns, so the pointer's angle drives it:
- **spinnerSim (6):** hundredthsGrid's sweep in polar form — the shading boundary pulls around
  the wheel, sector under the pointer inclusive; 0 stays slider-reachable.
- **triangleClosureLab (1):** the HINGED BEAM swings about the hinge (triangleConstraintLab's
  gesture) on the authored angleStep lattice, 0–180.
- **lineRelationLab (3):** grab the ACTIVE LINE and turn it about its own anchor, folded mod 180.
  The translate slider stays a slider — one surface must not steer two quantities.
- **rotationLab (2):** carry the IMAGE around the centre; the turn is the pointer's angle minus
  the tracked preimage's, snapped to angleStep and wrapped 0–359.
- **circleAngleExplore (5):** endpoints A and B each drag along the rim (the arc straddles the
  top symmetrically, so either endpoint sets it); P slides the far arc in inscribed mode ONLY —
  in cyclic mode P has no slider, so it gets no drag (parity rule, pinned by the gate).
- **elapsedTime (1):** the FINISH CLOCK'S MINUTE HAND turns (clockSet's gesture) with wrap
  tracking — each move adds the nearest signed hand delta, so winding past 12 accumulates hours
  and winding back sheds them, clamped to [0, maxMinutes]. The one authored step (mmt-04-03/e1)
  renders live and was driven by pointer in the browser.

**Probes** — signChart's class: local state, never graded, still the learner's hands:
- **sliceSum (5):** the INSPECTED SLICE follows the pointer (by angle from the pole in sector
  mode, by x elsewhere). The slice COUNT stays a slider (partition survival). The gate asserts
  the graded {n, rule} never moves under the probe.
- **extraneousRootLab (2):** the PROBE LINE drags. Its axis window stretches to hold the probe,
  so each gesture maps in the frame it STARTED in (frozen per drag via ref, released on end) —
  otherwise every move would re-derive the axis it is mapping against.

**2D points** — the object is a point on a grid; both coordinates follow the finger:
- **distanceGrid (9):** the moving point (integer lattice; legs and hypotenuse re-derive).
- **coordinateProofLab (5):** vertex D (triangleAngleLab's vertex gesture).
- **slopeTriangle (10):** the TRIANGLE'S TIP sets run and rise together. Every drag move flows
  through the SAME `runEdit` path as the steppers under one "drag" gesture key, so the S210
  graph coalesces the gesture exactly as a stepper run and undo stays one-step. The morph/undo
  suites (470 tests) run green over it.

**Handles and edges:**
- **boxPlot (5):** the five-number skeleton — a press grabs the NEAREST handle and HOLDS it for
  the whole gesture (clockSet's grabbed-hand rule), so dragging min across Q1's seat never swaps
  hands mid-drag; the gate pins that with values. Ordering stays unenforced, exactly like the
  sliders.
- **fractionGrid (4):** both SHADE EDGES drag on their own partition lattices (row fill pulls
  down, column fill pulls right; the overlap is the product). Partition counts stay sliders.
- **binomialAreaLab (10):** both STRIP EDGES drag on the unit lattice, including THROUGH the
  x-block to negative partitions. The canvas rescales as |a|, |b| grow, so each gesture maps in
  a frozen-scale frame (same ref pattern as extraneousRootLab).

**Count sweeps** — algebraTiles' row rule, applied to every pile-of-things engine:
- **algebraTiles (17) — the "multi-range layout question", answered per range:** each pile's ROW
  is its own sweep surface (long tiles, unit tiles): the tile under the finger is included, left
  of the first tile is zero, and the sweep keeps the pile's CURRENT sign — magnitude is what a
  row shows spatially; sign changes stay on the sliders. On an AREA mat the rectangle's CELLS
  are the primary act: tapping a dashed hole produces its tile through the model's own
  `placeTile` — **the sign comes from the CELL, which is how −3(x + 2) builds −3x − 6 by
  touch** — and tapping a filled cell takes that tile back through `removeTile`. Every mutation
  rides `atRunEdit` → `model.apply`, so refusals, morphs and the C4 announcement rules hold
  unchanged; the sweep bands and cell handlers honour the framed-mat lock exactly as the sliders
  do. The x²-pile stays slider-and-cells (its row shares the long-tile band; both existing paths
  reach every state).
- **integerChips (4):** each sign's chip rows sweep, row-major; zero pairs keep their buttons.
- **placeValue (3):** flats, rods and ones each sweep their band; the ones wrap row-major.
- **fractionOfSet (1):** selection is first-k by construction, so the sweep chooses every item
  up to the one under the pointer.

### Adjudicated SURVIVAL — the slider IS the right control (Plan v3's own rule)

| Engine (live uses) | The quantity, and why it is genuinely scalar |
|---|---|
| slider (28) | The estimate slider — the scalar estimate IS the act. |
| ratioTable (11) | A number in an HTML table cell; nothing spatial exists. |
| functionMachine (10) | The machine's abstract input; the diagram is flow, not space. |
| balanceScale (9) | The unknown x; the beam's tilt is a consequence readout, not a handle. |
| samplingBiasLab (7) | Sample size — the handover's own survival example. |
| shapeFamilyBuilder (6) | Four attribute COUNTS (sides, right angles…); flagged survival in the handover, confirmed. |
| netFold (5) | Prism dimensions; the whole net re-lays-out per change — no stable handle. |
| treeDiagram (5) | Branch counts per stage. |
| conicLocusLab (5) | Eccentricity — a ratio; the conic drawings are stylized families. |
| riemannSum (4) | Strip count = partition (fractionBar-denominator precedent). |
| derivativeRuleLab (4) | Rates and a shrink-to-zero h — limit-process parameters, not positions. |
| doubleNumberLine (3) | The VALUE at a fixed tick; nothing on screen moves with it. |
| radicalCheck (0) | A candidate number; the surface is HTML panels, no drawing at all. |

Partial survivals inside converted engines: fractionGrid's rows/cols, sliceSum's n,
taylorApprox's terms mode, lineRelationLab's offset, algebraTiles' sign dimension — each named
in its WS-C comment.

### Already-direct (no change needed)

exactNumberLab (351 — S205K rail), the 19 substrate engines from prior waves, and the click-rail
engines the inventory surfaced (slopeTriangle's steppers now joined by its drag; SamplingBiasLab's
method buttons, etc.). Sub-branch components routed by parent kinds (QuadraticRootsW,
RelatedRatesLadderW, DotPlotBuildW, AreaBuildW, RoundSolid/PrismVolumeBuilderW, SequenceDialW,
TriangleRatiosW/SasSssTriangleW, CircleRadiusScaleW/CircleChordTangentArcW, LogEstimateSliderW,
HopSizeW, LengthDifferenceW, ClassicalConstructW) were measured and stay as they are this wave:
none is a registered engine kind, their parents' primary surfaces are converted or adjudicated,
and several are count/scalar controls. They are recorded here so the ledger is complete, not
quiet.

**WS-C status: CLOSED. 44 engines on the shared substrate (19 + 25), every remaining
range-carrier adjudicated by name.** Hero-tier assignments: still none — deliberate; see the
WS-D finding below before any engine joins.

## Gates — extended, and two caught real defects

`widgets.drag.test.tsx` grew 61 → **125 cases** (64 new), in the house shape: pinned VALUES from
pinned press coordinates, slider parity, no surface when disabled — plus the asymmetries
(terms-mode renders no surface; cyclic-mode P renders no surface; sliceSum's graded state never
moves under the probe; boxPlot's grab never swaps hands; algebraTiles' sweep preserves sign and
its cells carry the cell's sign).

**What the browser caught that jsdom could not (the reading rule, again):**

1. **algebraTiles' row captions sat ON the distribute rectangle and swallowed its cells'
   pointer events** — "long = x" intercepted the second x-cell's tap outright (Playwright named
   the interceptor). The captions now end clear of the frame and, as pure labels, no longer
   intercept presses; with a rectangle on the mat the long-tile caption also drops to y=34 so it
   clears the frame's height-edge label, and the frame moved to areaOy 18 because its top edge
   label ("−3") had been CLIPPED by the viewBox since authoring. Residual, recorded honestly: at
   7–8 tiles on an area mat the caption's band can graze tile glyphs — unreachable in the one
   authored area lesson's task (needs ±3) but reachable by slider play; the row is genuinely
   crowded and a future pass may want the captions outside the svg.
2. **Wide-tier engines with uncapped `w-full` SVGs rendered enormous at 1440px** — solidSliceLab's
   sphere filled 1024×853px and overflowed the fold. This is exactly the class WS-D §1 fixed on
   the six graph labs ("width IS height; 768px+ squares overflow a laptop viewport") — their
   audit just never reached these five. Same remedy, same cap: solidSliceLab,
   coordinateProofLab, lineRelationLab, verticalLineScanner, and (pre-converted, same defect)
   triangleAngleLab now cap their SVG at max-w-xl inside the wide stage. **This is also why
   hero-tier assignment stays evidence-driven:** the first 1440px pointer QA of these engines
   found them oversized, not undersized.

Pointer-driven QA ran against `next start` on the REAL player: ten engines driven by mouse at
1440px (percentBar, algebraTiles rows AND distribute cells, boxPlot, spinnerSim,
binomialAreaLab edges, slopeTriangle tip, solidSliceLab plane, circleAngleExplore endpoint,
elapsedTime wrap-turn — the turn accumulated 15 → 30 → 45 minutes through the 12 o'clock wrap
and wound back to 35). Captures in `S239_SCREENSHOTS/01–10`, all read. The temporary capture
spec was deleted before the final playwright count (the S238 trap).

## Content/renderer defects FOUND and NOT fixed (frozen prose — for a ruling)

1. **cpr-01-03/i1 renders literal `**or**`** — the spinnerSim prompt authors markdown bold
   ("multiple of 3 \*\*or\*\* a multiple of 4") and the widget-prompt pipeline (MathProse) does
   not render it, so the learner sees the asterisks. Either the renderer grows bold support or
   the prose drops the markers; both change a frozen surface. Screenshot 05 shows it.
2. **mmt-04-03/e1 is elapsedTime's ONLY authored step** — an example step, though it renders
   fully interactive (the drag works there; screenshot 10). Recorded so the 1-use exposure is
   understood, not discovered again.

## Gate results at session end

```
typecheck                clean
vitest (2 shards)        13,310 passing    (9,762 + 3,548; +64 drag cases; both EXIT:0)
playwright               132 / 132         ALL 5 projects, vs next start -p 3100
COLLISION_SWEEP          EMPTY             re-run after every widget change
FIGURE_SWEEP             EMPTY             figures.tsx untouched, re-verified
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     871 / 871         no content files touched
validate:native          archive-only findings (node_modules, .next)
check-registration       consistent
build                    EXIT:0            (three times: baseline, caption fix, cap fix)
gen:reports              head green; exits 1 at place-value-transform-mutations-s145 M28
                         (34/35) — PRE-EXISTING at 39bf84c, unchanged
```

Trap K fired as documented (queue CSV + sealed screenshot sets restored before commit).

## What S239 wave 19 did NOT do (open, per Plan v3)

- The 5 NOT-POSSIBLE rows — **the next "next"**: percentBar flat-fee two-segment bar
  (pr-04b-02/k3, and it now inherits the fill-edge drag), systemsExplore vertical constraints
  (iar-03-01/ch1, iar-03-03/ch1), parametric-direction tracer (pp-04-01/k1, k2). The four
  conversion-changes-what-is-graded rows still need a user ruling first.
- WS-A brand, WS-H landing, WS-J avatars; WS-E prediction purge, WS-G MCQ factory, WS-F sound.
- Hero tier: still empty by design — and the WS-D finding above is the cautionary evidence.
- §4 defects from S238 (g2g-01-05 ruling landed in S238; grade-vocabulary CSV etc.) unchanged.
