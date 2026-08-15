# GRAPH_FIGURE_STANDARD — Normative Standard for Graphs, Statistical Displays, and Figures

Consolidated 2026-08-14 from the graph-standards review: `graph_review/inventory.md` plus the five
dimension audits (axes/formatting, data-sync, interaction/a11y, statistical displays,
runtime/gates). Every rule below is grounded in a real finding in this codebase — the motivating
example is cited as a defect (`D-nn`) or gate gap (`GG-nn`) from `GRAPH_DEFECT_INDEX.md`, with
file:line where load-bearing.

**Tags.** `ENFORCED` — an existing always-on gate covers the rule as scoped (the gate is named).
`PROPOSED` — the rule is normative now but needs a new gate (see `GRAPH_RELEASE_GATES_PLAN.md`,
gate IDs `PG-nn`).

**Scope.** All 59 graph-drawing widget engines (`src/components/widgets.tsx` + `src/components/widgets/*`),
the plotData overlay, the 1,871-figure registry (`src/components/figures.tsx`), and the 23
graph-emitting variant generators (`src/lib/variants.ts`). All four serving states: **A** authored,
**G** generated (practice/review/mastery), **R** remedial, **I** post-interaction.

Totals: **17 ENFORCED / 32 PROPOSED** (49 rules; mixed rules are counted by their primary scope —
the tag table at the end of this document is the canonical tally).

---

## A. Axes, ticks, scales, origins, units, legends, contrast

**A1. Every coordinate surface names its axes — or is bare by recorded ruling.** — `ENFORCED`
(`widgets.axisCaptions.s237.test.tsx`: 24 TOUCHED + 2 X_ONLY engines, polarTrace pinned
`BARE_BY_RULING`). Scoped to the 26 enrolled engines, authored state only.

**A2. Engines that postdate or escaped the S237 axis sweep must be enrolled or ruled.** — `PROPOSED`
(gate PG-09). Motivation: parametricTrace, feasibleRegionExplore, argandExplore (labels exist but
unpinned), dilationExplore grid mode all carry no axis gate at all (D-11, D-12, GG-12;
`widgets.tsx:3618`, `:13640`, `:2992`).

**A3. A plot whose readout or aria speaks in coordinates must draw a coordinate system** (at
minimum an origin mark and a scale cue). — `PROPOSED` (PG-09). Motivation: parametricTrace prints
`t ≈ … → (x, y)` and aria-labels the point while the SVG contains no axis, tick, or origin (D-11,
`widgets.tsx:3721–3747`).

**A4. Tick labels state values, never gridline indices.** If "each gridline stands for
`unitValue`", labels must be `t × unitValue`. — `PROPOSED` (PG-07). Motivation: graphRead bar mode
prints raw `{t}` while its aria claims "each gridline standing for ${spec.unitValue}" — latent-only
because all 33–35 authored specs use `unitValue: 1` (GG-04, `widgets.tsx:8518–8524`).

**A5. The top axis label states the chart's actual ceiling; no drawable value lies above the last
labelled gridline.** — `PROPOSED` (PG-06/PG-07). Motivation: barBuilder's gridline loop stops at the last
multiple of `step`, so `maxVal: 45, step: 10` labels a ceiling of 40 while bars can reach 45
(GG-05, `widgets.tsx:11958–11981`).

**A6. Single-axis rulers put labels on 1-2-5-10 landmarks, with no double labels, and a tick
density cap.** — `ENFORCED` for numberLineHop only (`widgets.numberLineScale.s237.test.tsx`;
property transfers to generated hops because the ruler is engine-computed). — extension to
numberLinePlace (whose `tickStep` is spec/generator-chosen and uncapped) is `PROPOSED` (PG-02;
GG-10, `variants.test.ts:11406–11441` checks reachability only).

**A7. Any surface graded on exact numeric positions shows a readable scale**: tick strokes at
countable intervals plus at least endpoint values — three floating numerals is not a scale. —
`PROPOSED` (PG-07/PG-05). Motivation: boxPlot asks for 78/82/85/88/92 against an axis labelled only
60 · 80 · 100 with zero tick strokes (D-15, `widgets.tsx:9447–9450`); scatterFit tunes m and b as
printed numbers over a plane where no number appears (D-25, `:9116–9117`); pointSetReasoningLab
draws labelled points with no ticks or gridlines (D-25, `:8037`).

**A8. First-quadrant teaching grids show the origin / zero**, matching what the companion concept
figure teaches. — `PROPOSED` (PG-03). Motivation: plotPoint cells run 1..N with no 0 row/column
while the `coordinate-plane` figure labels "(0, 0)" (D-25, `widgets.tsx:15192`, `figures.tsx:57`).

**A9. Axis scale is stable during interaction; if it must rescale, the change is made visible
(printed extents).** — `PROPOSED` (PG-05/PG-08). Motivation: argandExplore multiply mode shrinks
every grid unit live as the learner drags, with zero tick numerals to reveal it (D-13,
`widgets.tsx:3002–3005`); shuffleTest's `lim` grows with each extreme draw and the axis's only
label is "0" (D-21, `:2339–2358`).

**A10. Tick label equals tick value exactly — no rounding in tick generation.** — `PROPOSED`
(PG-07). Motivation: Pv3NumLine does `ticks.push(Math.round(v))` per step, so any fractional step
yields duplicated, mispositioned labels (GG-13, `figures.tsx:347–348`).

**A11. The axis variable label names the plotted variable and is consistent with the step's prompt
vocabulary.** — `PROPOSED` (PG-10). Motivation: barBuilder renders `axisLabel: "minutes read"`
verbatim on charts of vans/bikes/cars and field-trip votes (D-09, `widgets.tsx:12103–12105`,
`g2g-02-03.json`, `g2g-03-03.json`).

**A12. Answers are graded in the unit the prompt asks for**; choice labels and legends use that
unit. — `PROPOSED` (PG-10). Motivation: dm-03-01 asks "how many mg, to the nearest 10?" and grades
the literal answer 150 as a trap while the accepted answer 15 is labelled "variability-units"
(D-06, `dm-03-01.json` i2).

**A13. Fraction number lines carry their fraction labels**: a spec whose prompt frames a 0→1
fraction line must ship `fractionDen`. — `PROPOSED` (PG-02). Motivation: the nl-unit and
equivalent-fractions generators drop `fractionDen`, degrading correctly authored fraction rulers to
integer 0→n lines on every refresh (D-01, D-02, `variants.ts:29397`, `:29679`).

**A14. Keys and overlaid groups stay countable**: picture-graph icon counts match the prompt
(`ENFORCED` — `widgets.pictureGraphRead.s237.test.tsx` + e2e s237-picture-graph-scale); overlaid
marks must not fully occlude one another — offset, dodge, or hollow-vs-filled — `PROPOSED` (PG-09).
Motivation: sp7-dotplot-overlap draws group B dots at exactly group A's coordinates, occluding them
(D-16, `figures.tsx:2102–2103`).

**A15. Load-bearing axis text meets legibility bar** (slider labels contrast-checked: `ENFORCED`,
`widgets.estimateSliderLabel.s237.test.tsx`; forced-colors survival: `ENFORCED`,
`e2e/forced-colors.spec.ts`). Raising AxisCaptions above 55%-opacity/11px decorative-level
rendering for the plane's only axis naming — `PROPOSED` (polish tier; `widgets.tsx:17676`).

## B. Text layout, collision, clipping

**B1. No two rendered text boxes may overlap, for any spec the engine accepts.** — `ENFORCED` for
all 1,871 figures (`figures.labelCollision.s238` zero-collision ratchet), for 7 engines' authored
fixtures (`widgets.labelCollision.s237`), and for 3 authored lessons in a real browser
(`e2e/s237-label-collision.spec.ts`). Corpus-wide always-failing widget coverage is `PROPOSED`
(PG-05 — today's corpus sweep `collisionSweep.s238` is opt-in and "counts, does not fail"; GG-08).

**B2. Text stays inside the viewBox at every anchor position.** — `PROPOSED` (PG-05). Motivation:
feasibleRegionExplore corner labels at `x = X(c.x) + 6`, anchor start, clip past the 300-unit
viewBox for corners near xMax (D-12, `widgets.tsx:13699`).

**B3. Marks never silently clip: a frequency pile either fits its stated frame at its retention
cap or visibly rescales/caps — the counter may not diverge from the drawing.** — `PROPOSED`
(PG-07). Motivation: sampleSim/shuffleTest dot stacks draw above the viewBox past ~22 dots while
the poll counter keeps rising (D-10, `widgets.tsx:2179`, `:2367`, `dotColumns` `:2108`).

**B4. Negative or out-of-domain values either draw honestly (below a zero baseline) or the control
domain is constrained to what the display can draw.** — `PROPOSED` (PG-07). Motivation:
sequenceBuild lets d go to −5 while negative partial sums flatten to 1px slivers at wrong positions
(D-22, `widgets.tsx:3985–4039`).

## C. Per-display-type conventions

**C1. Histogram** (barBuilder `histogram:true`; figure family): bars touch; bin labels are
consistent with shared-edge claims; a frequency axis is drawn and named. — `PROPOSED` (PG-09).
Motivation: HistogramScores has no y-axis, no frequency ticks, no axis title (D-18,
`figures.tsx:5574`), and its caption's "bins share edges" justification contradicts its own
"0-4 / 5-9" labels (polish, `:5577–5593`).

**C2. Box plot**: five-number targets ordered (`min ≤ q1 ≤ med ≤ q3 ≤ max`), all within
`[axisMin, axisMax]`, start ≠ target; tick strokes per A7; visible per-handle numeric readouts
(values may not live only in `aria-valuetext`); standard quartile vocabulary in both visible and
accessible text. — `PROPOSED` (PG-06 integrity branch + PG-05). Motivation: `BoxPlotSpec` has no
ordering/bounds refinement and no `widgetIntegrityErrors` branch (GG-06, `schema.ts:1846–1865`);
four boxPlot entries sit unburned in the accessibleParity baseline (D-15,
`widgets.accessibleParity.s237.test.tsx:173–176`); aria speaks "low/lower-mid/mid" while sliders
teach "Q1/median/Q3" (D-15, `widgets.tsx:9446`).

**C3. Bar chart / pictograph / tally** (barBuilder, graphRead): value-axis honesty per A4/A5; axis
label truth per A11; a stated starting dataset is actually drawn (a "level the bars" premise
requires start heights, not zeroed bars — D-23, `dd-03-01.json`, `widgets.tsx:11949`). Read
semantics for graphRead: `ENFORCED` (`graphRead.s125` lib gate + `session185.dataGraphs`); the
bar-mode label-scaling half is `PROPOSED` (GG-04).

**C4. Scatter / fit**: points inside the authored axis window and prompt-listed points present
(verified clean this review, but by hand — gate `PROPOSED`, PG-01/PG-10); axis names via
AxisCaptions (`ENFORCED` for scatterFit) plus endpoint scale values per A7 (`PROPOSED`); a scatter
prompt asserting "a dot is at (x, y)" ships a rendered plot (D-20).

**C5. Dot plot**: read-mode count semantics `ENFORCED` (`dotPlotRead.s122`); build and read modes
must agree on geometry and label formatting — build mode currently ignores `denominator` that read
mode formats with (GG-14, `widgets.tsx:9360` vs `:9270`) and lays columns by true `linScale`
position while read mode uses equal `1fr` columns (GG-15) — `PROPOSED` (PG-07).

**C6. Line plot / plotData overlay**: the plot draws exactly the prompt's data, never the answer,
display-only — `ENFORCED` (`widgets.plotData.s237` + `content.plotData.s237` lib sweep, the only
gate that audits generated output beyond variants.test). Positional honesty for non-uniform value
spacing (equal-width columns require consecutive values) — `PROPOSED` (PG-07; GG-15,
`widgets.tsx:446`, `schema.ts:97`).

**C7. Frequency / simulation displays** (sampleSim, shuffleTest, ciCapture, trialProbabilityLab):
stack caps per B3; dynamic-extent axes label their extents per A9; displayed subset vs counted
total divergence is disclosed (ciCapture counts 60 intervals while displaying 24 — polish,
`widgets.tsx:2247–2277`). trialProbability semantics `ENFORCED` (`trialProbability.s132`);
distribution comparison `ENFORCED` (`distributionCompare.s131` + `.tone.s218`).

**C8. Number lines** (numberLineHop/Place/Ray, absValueLine): ruler scale per A6; hop structure
drawn must match the hop structure the prompt teaches (D-07: "two hops total" rendered as seven
unit arcs, `as100-01-02.json` i2, `widgets.tsx:15963–15968`) — `PROPOSED` (PG-10); fraction labels
per A13. Collision regimes for place/hop: `ENFORCED` (`labelCollision.s237`).

**C9. Coordinate button grids** (plotPoint): `xLabels`/`yLabels` are required, not optional — a
coordinate prompt must never render an unnumbered lattice (D-05: 12 authored specs omit both;
`widgets.tsx:15208`, `:15272`); labels fit the width budget (≤ 4 chars at the 390px 8-column
budget); origin per A8; `cols/rows ≤ 8` enforced at parse time on every serving path (D-03: the
stretch band ships an out-of-schema 10×10 unparsed, `variants.ts:37838`,
`schema.ts:442–443`). — `PROPOSED` (PG-03).

## D. Data synchronization (prompt/table ↔ graph)

**D1. Every number, point, and object the prompt states must appear on (or be plottable/markable
on) the graph.** — `PROPOSED` (PG-10). Motivation: g5e-03-02 asks for "the first three ordered
pairs" on a grid whose axes start at 1 and whose `targets` hold only two pairs — (0,0) is
unplottable and a correct 3-point attempt is graded wrong (D-04).

**D2. The drawn structure matches the stated structure** (hops, groupings, leveling premises), not
just the endpoint answer. — `PROPOSED` (PG-10). Motivation: D-07, D-23.

**D3. A prompt that references a rendered graph ("the graphed point…", "a dot plot shows…") ships
one** — via widget, plotData, or figure. — `PROPOSED` (PG-02). Motivation: eight `line-plot`
dd* forms and the pr-graph-rate-g7 / g8-bv-scatter mcq forms emit bare numeric/mcq describing plots
that are never drawn (D-19, D-20, `variants.ts:31989–32100`, `:34803`).

**D4. Practice/review refresh preserves the graph surface.** Widget *type* preservation:
`ENFORCED` (`variants.surface.test.ts` — no graph→text downgrade, plus the runtime decline guard at
`variants.ts:40469–40497`). Field-level fidelity (fractionDen, plotData attachment, label arrays)
is `PROPOSED` (PG-02) — the type-only rule is exactly what let D-01/D-02 through. Remedial steps
must be inside the corpus walk (GG-07: `variants.surface.test.ts:45` walks `steps` only while
review refreshes remedial checks) — `PROPOSED` (PG-02).

**D5. Generated answers are correct by an independent route, traps real and distinct, output
deterministic per seed.** — `ENFORCED` (`variants.test.ts`, 400 seeds/generator, plus
`widgetIntegrityErrors` on every generated spec).

**D6. Where a dedicated data-sync gate exists, it defines the bar**: plot==prompt (plotData.s237),
icon-count==prompt (pictureGraphRead.s237), equation==line and table points on-line
(`affineRelationship.s147`) — all `ENFORCED` and all verified clean this review. New display types
must ship an equivalent gate at introduction. — the meta-rule itself is `PROPOSED` (process).

## E. Interaction, keyboard, touch, a11y, responsive

**E1. Every widget is completable to a correct answer by keyboard alone through native controls.**
— `ENFORCED` (`widgets.keyboard.test.tsx`, all 129 kinds, registry lock).

**E2. No faux controls**: `role=button/radio/switch` must be native `<button>`, `role=slider` a
native `<input>`. — `ENFORCED` (`auditNativeControls` in the keyboard gate).

**E3. Drag is a redundant input**: the handle is presentation (`aria-hidden`); a slider or buttons
remain the accessible path driving the same value. — `ENFORCED`
(`useSvgDrag.ts` contract + `widgets.drag.test.tsx`).

**E4. `touch-action: none` on the handle only** — never a full-stage hit-rect; the page must stay
scrollable from non-handle graph area at 390px. — `PROPOSED` (PG-11). Motivation: four graph
engines spread `handleProps` over whole-SVG rects (D-14, `widgets.tsx:13710`, `:3743`, `:1566`,
`:11662`) against the hook's own documented contract (`useSvgDrag.ts:10–12`).

**E5. Touch targets ≥ 44px effective pitch, non-overlapping, at 390px** — the repo's own phone
contract (`e2e/s238-stage-roles.spec.ts`). — `PROPOSED` for the graph corpus (PG-11 + PG-08).
Motivation: plotPoint cols=8 compresses `1fr` tracks to ~35px under fixed 44px buttons — ambiguous
touch hits on the exact surface whose task is "tap the right cell" (D-04); drag pucks r=16–18 fall
under 44px at mobile scale (polish, `widgets.tsx:2951` et al.).

**E5-EX1 — the one ratified exception: a dense cell grid on a narrow stage may fall to ≥ 38px
provided every target is unambiguous.** Ruled 2026-08-15 (S242) by the product owner, on the
arithmetic below. This is an exception to E5's threshold, not a repeal of it: E5 continues to
apply in full everywhere else, and the *non-overlapping* half of E5 is never waived.

*Why the threshold is unreachable here.* A 390px phone gives the lesson stage ~334px, of which the
y-label band takes ~24px. Eight columns at a true 44px need 352px of cells alone. `8 × 44 = 352 >
334`, so **44px at `cols: 8` on a 390px stage is arithmetically impossible** — no layout tightening
reaches it, because even deleting the y-band entirely leaves 334px. The only ways to satisfy E5
literally are to carry fewer columns or to scroll the grid horizontally. Fewer columns changes the
mathematics of 17 authored tasks (some genuinely plot x = 8). Horizontal scrolling puts a scroll
gesture on the one surface whose entire task is "tap the right cell", and mobile-scroll is itself a
tracked defect class. Both were considered and rejected in favour of stating the limit honestly.

*What is accepted, and what is not.* At `cols: 8` on a ~334px stage the cell measures **~38.8px**,
and the 4px separation is padding INSIDE the button, so the tappable area equals the pitch exactly:
no dead gutters and **no overlap** — every tap lands on the cell under the finger. That is a
strict improvement on the ~35px *overlapping* targets D-04 was raised against, where a target's
edges belonged to its neighbour. ~38.8px also clears WCAG 2.2 AA SC 2.5.8 (24×24 minimum); it falls
short only of WCAG 2.1 AAA SC 2.5.5 and of this repo's own stricter 44px ambition.

*Scope, stated so it cannot quietly widen.* The exception covers **grid-cell buttons sized by
aspect ratio from a capped track** (`w-full aspect-square` under `minmax(0, 44px)`), on stages too
narrow for the full pitch. It reaches 17 of 66 authored plotPoint specs and ~11% of sampled
generated plotPoint states, all at `cols: 8`, all at ≈390px; at ≤ 7 columns, and on any wider
stage, the full 44px is still met and still required. It does **not** license a sub-44px target
anywhere else, and it does **not** license overlap. Floor: **38px**. Below that, or at any overlap,
this is a defect again.

*Gate.* `src/lib/allSamples.operability.s119.test.tsx` encodes this exception narrowly: a button
counts as height-declaring if it carries an explicit ≥44px height utility, wraps substantive
content, **or** is sized by aspect ratio. A bare-text button with none of those still fails.

**E6. Dependent geometry uses one source of truth**: overlays must not hardcode cell pitch the
layout can compress (plotPoint `connectTargets` uses `const CELL = 48` and misses its own cells at
390px — D-04, `widgets.tsx:15193`); label rows must use the same tracks as the grid
(`repeat(cols, 2.75rem)` fixed tracks misalign labels — D-03/D-04, `:15277`). — `PROPOSED` (PG-03).

**E7. Screen-reader/visible parity**: accessible-only text may never state a numeric value the
visible UI withholds. — `ENFORCED` (`widgets.accessibleParity.s237.test.tsx` ratchet); baseline
burn-down (four boxPlot entries + the known `extraneousRootLab|2` answer leak) is `PROPOSED`
(PG-12) — the baseline is "explicitly not a list of approved exemptions".

**E8. Every dense kind (state living in an SVG) narrates its state via `describeWidgetState`.** —
partially enforced by the `a11yAudit.s44` floor (`dense ≥ 38`), which cannot name a kind that never
enrolled; per-kind enrollment is `PROPOSED` (PG-12). Motivation: feasibleRegionExplore and
parametricTrace are the only coordinate labs with no case — both fall to `default: return null`
(D-24-adjacent, `describeState.ts:1127–1128`).

**E9. Non-interactive graph SVGs are `role="img"` with a stateful accessible name** — the standard
HopSizeW itself sets. — `PROPOSED` (PG-12). Motivation: HopLandingW's picture is `role="group"`
named just "Number line", stateless (D-24, `widgets.tsx:15975` vs `:15799–15800`).

**E10. Reduced-motion and axe**: all widget animations motion-gated (verified clean — 6/6 inline
blocks in `prefers-reduced-motion` media, `motion-safe:` pulse); axe zero-violations per covered
route — `ENFORCED` (`e2e/a11y.spec.ts`) but route breadth (one lesson) is a known blind spot; graph
route breadth is `PROPOSED` (PG-08).

## F. Runtime-generated graph audit requirements

**F1. Every generator tag × form × band must be rendered under a failing gate** — no generated spec
reaches a learner unmounted. — `PROPOSED` (PG-01). Motivation: mechanical proof from the gates
audit — no test file both imports `variantFor*` and renders (GG-01); both fractionDen defects and
the 10×10 grid shipped through exactly this hole.

**F2. Every generated spec passes `WidgetSpec.parse` on every serving path** before render
(`variantForStep` currently hands specs to the renderer unparsed). — `PROPOSED` (PG-01/PG-03).
Motivation: D-03 (`variants.ts:40469`).

**F3. The band sweep must cover declared forms, not only the default band** — `variants.test.ts`'s
band sweep runs forms only for `declarationOnly` generators, so `bvScatterPlot` was never gated at
stretch (D-03, `variants.test.ts:12047–12054`). — `PROPOSED` (PG-01).

**F4. Generated scale honesty and caption text are asserted at the model level**: tick density and
ladder membership for generated number lines, label budgets for generated grids, axis-caption ↔
`axisContext`/prompt consistency for story/affine/pointSet variants. — `PROPOSED` (PG-02; GG-10,
GG-11).

**F5. Assembled serving surfaces are gated as served**: the Mastery Studio 32-item bank
(parse + integrity + mount + type-vs-source rule, including cross-tag fallback rows) — `PROPOSED`
(PG-13; GG-09, `masteryMission.server.ts:195–225`). Remedial state R enters every corpus walk
(`PROPOSED`, PG-02/PG-05 — collisionSweep and figureTextAdversarialAudit already walk remedials;
variants.surface does not).

---

## Canonical tag tally

| Tag | Rules |
|---|---|
| **ENFORCED (17)** | A1, A6, A14, A15, B1, C3, C5, C6, C7, C8, D4, D5, E1, E2, E3, E7, E10 |
| **PROPOSED (32)** | A2, A3, A4, A5, A7, A8, A9, A10, A11, A12, A13, B2, B3, B4, C1, C2, C4, C9, D1, D2, D3, D6, E4, E5, E6, E8, E9, F1, F2, F3, F4, F5 |

Several ENFORCED rules carry PROPOSED extensions in their text (e.g. A6's numberLinePlace
extension, B1's corpus-wide ratchet, C3's bar-mode scaling, D4's field-level fidelity, E7's
baseline burn-down); those extensions are tracked through the PG references and the defect index,
not double-counted here.

## Four-state applicability note

Rules in sections A–D apply in all four states (A/G/R/I). The current gate suite enforces almost
exclusively in state A at `value={null}` with `neutral|info` tones; states G and I have zero
always-on render coverage, and R is covered only where a gate's corpus walk recurses whole lesson
JSON. The full gate × state matrix and the plan to close it live in
`GRAPH_RELEASE_GATES_PLAN.md`.
