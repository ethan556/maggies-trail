# GRAPH_DEFECT_INDEX — Consolidated Defect & Gate-Gap Index (Graph/Figure Surfaces)

Consolidated 2026-08-14 from the five graph-standards audits
(`/home/claude/graph_review/audit-*.md`; inventory `inventory.md`). Deduplicated: where two or
more audits found the same underlying issue, one entry lists all source findings.

- **DEFECTS** — renders wrong, dishonest, or below the standard **today** on reachable input.
- **GATE GAPS** — output currently correct, but unguarded: a named defect class would ship silently.
- Severity: **C** critical (wrong answer graded / contradicts prompt / high reach), **H** high
  (dishonest or broken display on reachable states), **M** medium (standard violation, learner can
  still succeed), **L** low.
- "Rule" = `GRAPH_FIGURE_STANDARD.md` rule ID. "Fix scope" names the change class + the proposed
  gate (`PG-nn` in `GRAPH_RELEASE_GATES_PLAN.md`) that keeps it fixed.
- Sources: AX = audit-axes-formatting, DS = audit-data-sync, IA = audit-interaction-a11y,
  ST = audit-statistical-displays, RG = audit-runtime-audit-gates.

Totals as first written: **25 defects · 16 gate gaps** (+ 13 polish, appendix).

**Status as of S242 (2026-08-15): 25 CLOSED, 0 LIVE, 0 unverified.** Two were closed by ruling rather than by code (**D-19** not-a-defect; **D-20** bars start at zero), and **D-18** is closed for 5 of its 8 forms with the other 3 blocked by `MAX_PLOT_COLUMNS = 8` — a renderer decision, recorded at the call sites, not an open generator defect. All 25 were checked by executing the generator or rendering the widget and inspecting the emitted geometry — never from a commit message or a nearby comment. 

> **S242 — why this block exists.** This index was written at `73c62c7` (2026-08-14 16:20) with no
> status field: every entry is phrased in the present tense, so the file asserts 25 live defects
> forever, and it cannot record its own repairs. Three hours later `ad83214` — same session — fixed
> several of them, and nothing here changed. A reader on 2026-08-15 still saw "25 defects · wrong
> today". A defect ledger without a status column is a ledger that can only ever grow.
>
> Each entry below now carries a **Status:** line, and as of 2026-08-15 all 25 have been checked.
> Every verdict comes from executing the generator or rendering the widget and inspecting the
> emitted spec or geometry — never from a commit message or an adjacent comment, both of which
> proved unreliable here. The evidence and the command are recorded inline on each entry, so a
> later reader can re-derive the verdict rather than trust it.
>
> Two precision notes worth carrying: **D-19** has a served half (`g8-bv-scatter-basics` mcq forms,
> declared on bv-01-01) and a **latent** half (`pr-graph-rate-g7@default`, which no authored step
> reaches) — fixing the generator closes both, but only one is currently reaching learners. And
> **D-10/D-11**'s own text folds in a describeState sub-clause that is tracked as **D-24** and is
> still live, even though their axis defects are closed.
>
> Status vocabulary: `CLOSED` (repair verified on this seal, with the check that proved it) ·
> `CLOSED-FOLLOW-ON` (repaired, but the repair introduced something new that is now tracked) ·
> `UNVERIFIED` (no closure evidence gathered yet) · `LIVE` (re-confirmed present on this seal).

---

## DEFECTS (wrong today)

### D-01 · C — nl-unit generator drops `fractionDen`: refresh degrades a fraction line into an integer 0→n line
- Surface: variant `nl-unit` (default + fixMistake) → numberLinePlace · `src/lib/variants.ts:29397` (and ~29313); renderer contract `src/components/widgets.tsx:12543–12551`.
- Evidence (DS-D1): prompt says "On a 0→1 line split into ${n} equal jumps, place the marker at 1/${n}" but the emitted spec is `{min:0, max:n, step:1, tickStep:1, target:1}` with **no `fractionDen`** — "the learner is told 'a 0→1 line' and shown a 0→6 line." Authored analogue fr-02-02 k1/k2 authors the same prompt *with* `fractionDen`. Executed and confirmed: every practice/review refresh degrades it.
- Rule: A13, D4. Fix scope: 1-line generator emission fix (`fractionDen: n`) + PG-02 field-fidelity assert + PG-01 render.
- Status: **CLOSED** (S242, verified by execution). `variantForGenForm("nl-unit", …)` over 80 samples × {default, fixMistake} emits `fractionDen` on every numberLinePlace spec.

### D-02 · C — equivalent-fractions `findMark`: same missing `fractionDen`, and the integer axis prints the answer
- Surface: variant `equivalent-fractions` form findMark → numberLinePlace · `src/lib/variants.ts:29679`.
- Evidence (DS-D2): "On a TWELFTHS ruler, which mark sits on the same point as 2/3?" emits `{min:0, max:ruler, step:1, tickStep:1, target:8}` — "the graph is a 0-to-12 integer line, not a fraction ruler, and the integer label at the target … prints the position the learner is supposed to derive." Authored fr-03-01 k2 has `fractionDen: 8`.
- Rule: A13, D4 (plus answer-on-screen). Fix scope: generator fix + PG-02.
- Status: **CLOSED** (S242, verified by execution). 40 `equivalent-fractions/findMark` samples all emit `fractionDen`.

### D-03 · C — g8-bv-scatter stretch band emits a 10×10 plotPoint the schema forbids; served unparsed; overlapping touch targets at 390px
- Surface: variant `g8-bv-scatter-basics` form bvScatterPlot → plotPoint · `src/lib/variants.ts:10449` (`hi = … stretch ? 10 : 8`), `:37838` (`cols: hi, rows: hi`); schema cap `src/lib/schema.ts:442–443` (`max(8)`); unparsed serve `variants.ts:40469`.
- Evidence (IA-F1, AX-D5): a streak-proficient learner gets band=stretch → "a 100-button grid, min 10×44 + 9×4 = 476px of fixed-width `h-11 w-11` buttons … in a 390px viewport whose stage offers ~334px"; tracks shrink to ~30px so "adjacent touch targets overlap by ~14px"; fixed-track xLabels row stays 476px, clipped and misaligned. The band sweep never gates declared forms off the default band (`variants.test.ts:12047–12054`).
- Rule: C9, F2, F3, E5. Fix scope: generator cap (≤8) + parse-at-serve + PG-01/PG-03.
- Status: **CLOSED** (S242, verified by execution). 60 seeds × {support, core, stretch} of `g8-bv-scatter-basics/bvScatterPlot`: max observed `cols` = 8, at the schema cap. The stretch band no longer exceeds it.

### D-04 · C — Authored plotPoint at cols:8 (17 specs) breaks the 390px stage: buttons overlap, x-labels drift, connectTargets line misses its own cells
- Surface: plotPoint · `src/components/widgets.tsx:15217` (`minmax(0,1fr)` tracks under fixed 44px buttons), `:15277` (fixed `repeat(cols, 2.75rem)` label row), `:15193` (`const CELL = 48`), `:15254`; e.g. `content/courses/linear-equations-systems/lessons/les-03-02.json`; also DS-D4's g5e-03-02: "Plot the first three ordered pairs" where the first pair (0,0) is off-grid (axes start at 1) and `targets` holds only 2 pairs, so a correct 3-point attempt is graded wrong (`widgets.tsx:15199`).
- Evidence (IA-F2, AX-D5, DS-D4): "tracks fall to ~35px, and the 44px buttons overlap their neighbours by ~9px — sub-44px effective pitch, ambiguous touch hits on exactly the surface whose whole task is 'tap the right cell'"; "the drawn 'line through the points' no longer passes through the rendered cells".
- Rule: E5, E6, D1, C9. Fix scope: layout rework (single track source, responsive cell size) + content fix for g5e-03-02 + PG-03 + PG-08.
- Status: **CLOSED** (S242). The three constructs this entry cites (`minmax(0,1fr)`, `repeat(cols, 2.75rem)`, `const CELL = 48`) survive only inside the historical comment at `widgets.tsx:15641-15650` that documents their removal; the grid now has one track source. The g5e-03-02 content fix is on disk (i1/i2 carry `xLabels`, targets match the prompt). The rework's ~38.8px cell at `cols: 8` on a 390px stage was **ruled and ratified on 2026-08-15** as `GRAPH_FIGURE_STANDARD.md` **E5-EX1** — 44px is unreachable there by arithmetic (8 × 44 = 352 > ~334px of stage), the targets are non-overlapping (a strict improvement on the ~35px overlapping targets this defect was raised against), and ≥38px non-overlapping is the accepted floor. `allSamples.operability.s119.test.tsx` now encodes that exception narrowly and passes 942/942.

### D-05 · C — 12 authored plotPoint coordinate tasks render a grid with no visible axis numbers at all
- Surface: plotPoint · `src/components/widgets.tsx:15208`, `:15272` (label rows render only `{spec.xLabels && …}` — no fallback); specs incl. `asv-03-01.json` ("Mark the four corners … at (2,2), (6,2), (6,4), (2,4)"), `gf-03-01.json`, `gf-03-02.json`, `iar-02-03.json`, `cg-01-01.json`, `asv-03-02.json` (+6 more; ST counted 12 of 75).
- Evidence (ST-D2, DS-D3): "Sighted learners get an unlabeled button lattice and must count cells; only `aria-label=\"column 3, row 4\"` carries the coordinates" — and cells are 1-based, so a 0-origin assumption "is off by one on every point". These are the lessons that teach coordinates.
- Rule: C9, A8. Fix scope: schema refinement (labels required) + author the 12 specs + PG-03.
- Status: **CLOSED** (S242, verified by corpus scan). All 66 authored `plotPoint` specs now carry both `xLabels` and `yLabels`; 0 unlabelled remain (the entry cited 12 of 75).

### D-06 · C — dm-03-01: prompt asks "how many mg" but the graded answer and choice labels are in tens-of-mg
- Surface: distributionCompareLab measure mode · `content/courses/data-and-models/lessons/dm-03-01.json` i2; render `widgets.tsx` DistributionCompareLabW (~:9612).
- Evidence (DS-D6): prompt "Their gap is 150 mg. Report the gap to a sensible precision: how many mg, to the nearest 10?" — "the literal answer … is **150**; the spec's `answer` is **15** and the choice `150` is graded as a trap … The learner answering the question as asked is marked wrong."
- Rule: A12. Fix scope: content fix (prompt or answer/choice units) + PG-10 unit-agreement lint.
- Status: **CLOSED** (S242, verified on disk). `dm-03-01` i2 now reads "how many 10 mg units is it?" against `answer: 15` — prompt and graded answer agree in units.

### D-07 · H — as100-01-02 i2: prompt teaches "two hops (6, then 1)" while the graph draws seven unit hops
- Surface: numberLineHop · `content/courses/add-subtract-100/lessons/as100-01-02.json` i2; arc logic `widgets.tsx:15963–15968`.
- Evidence (DS-D5): spec `{start:6, hop:1, hops:7}` → "the make-a-double strategy the step exists to teach (one hop of 6, one hop of 1) is unrepresentable … the rendered picture (7 equal unit hops) actively contradicts 'two hops total'."
- Rule: C8, D2. Fix scope: content fix (pre-apply the double, as sibling g1p-02-02 does) + PG-10.
- Status: **CLOSED** (S242). `NumberLineHopSpec` computes `landing = start ± hop·hops` from one uniform hop size, so "hop 6, then 1 more" was structurally undrawable and had to resolve in prose. Now uses the pre-applied-double pattern already shipped in sibling `g1p-02-02`: "6 + 6 lands on 12, so count on 1 more from 12", `start:12, hop:1, hops:1`. Landing stays 13, near-doubles stays, and the drawing shows the one hop the prompt names. `commonLandings` updated with it — the old "That's 8 hops" would be false under the new framing.

### D-08 · H — barBuilder renders axisLabel "minutes read" on charts of vehicles and votes
- Surface: barBuilder bar mode · `widgets.tsx:12103–12105`; `content/courses/data-line-plots-g2/lessons/g2g-02-03.json`, `g2g-03-03.json` (live); `g2g-01-02.json`, `g2g-02-01.json` (same wrong string, latent — tally/pictograph branch skips axisLabel).
- Evidence (ST-D1): "the g2g course carries a copy-pasted `\"minutes read\"` on every barBuilder step, including vehicle counts and field-trip votes" — a live mislabeled variable on a G2 chart whose lesson point is "what does this graph count?".
- Rule: A11. Fix scope: content fix (4 specs) + PG-10 axisLabel↔prompt lint.
- Status: **CLOSED** (S242) — and it was 9 specs, one of which was CORRECT. `dd-02-02` e1 also carries `axisLabel: "minutes read"`, and there it is right: `axisLabel` captions the CATEGORY axis and that step's categories genuinely are minute bins (a comment at `widgets.tsx:12343` already treats the pairing as intended). It is almost certainly the source the others were copied from; left untouched. The other eight now read `length in cm`, `day`, `vehicle` and `trip spot`.

### D-09 · H — sampleSim and shuffleTest dot piles silently clip off the top under dense data
- Surface: sampleSim `widgets.tsx:2179`, shuffleTest `:2367`, shared `dotColumns` `:2108` (no height cap); retention `.slice(0,200)` `:2143` / `.slice(0,300)` `:2336`.
- Evidence (AX-D3, ST-D3, ST-D4): `cy = AXIS − 4 − k·5` with no cap on k → "stacks past ~22 dots … draw above the viewBox and vanish. The learner's 'chance alone could do this' judgement is made against a truncated null distribution"; "the aria/readout keeps counting ('200 polls') while the picture stops growing."
- Rule: B3. Fix scope: engine fix (cap/rescale row pitch at retention cap) + PG-07 stack-cap assert.
- Status: **CLOSED** (S242, verified by execution). `dotPileGeometry(cols, headroom)` (widgets.tsx ~:2196) rescales pitch and radius. Driven in jsdom: sampleSim at 250 polls → 200 dots, **0 clipped**, crown y=14.00 = PILE_TOP; shuffleTest at 400 shuffles → 300 dots, **0 clipped**, crown y=12.00.

### D-10 · H — parametricTrace draws a coordinate readout with no coordinate system at all
- Surface: parametricTrace · `widgets.tsx:3618` (svg body :3721–3745).
- Evidence (AX-D1): "the SVG contains only the curve, the traced portion, arrows, ghost, and handle — there is no axis line, no tick, no gridline, no origin mark" while the readout prints `t ≈ … → (x, y)` and the aria says `point (x, y)`. "In line mode the learner is told x = t + lineX0 but cannot see where x = 0 is." Also no `describeWidgetState` case (IA-F5) and a full-stage `touch-action:none` hit-rect (see D-14).
- Rule: A3, A2, E8. Fix scope: engine fix (axes/origin + AxisCaptions enrollment + describeState case) + PG-09.
- Status: **CLOSED** (S242, verified by execution). Rendered: `<g data-testid="ptr-axes">` with 8 lines, an origin dot, tick numerals (line mode `2,4,2.5,5,0`; circle mode `-1,1,-1,1,0`) and x/y axis captions. Note its describeState sub-clause is tracked separately as D-24 and remains LIVE.

### D-11 · H — feasibleRegionExplore: axes unnamed, zero ticks; corner labels clip off-canvas
- Surface: feasibleRegionExplore · `widgets.tsx:13640` (axes :13686–13687, corner labels :13699).
- Evidence (AX-D2): "only two bare axis segments are drawn … No `<AxisCaptions>`, no tick marks, no tick values"; a corner label at x = xMax "extends past the 300-unit viewBox and is clipped." "This is exactly the learner-reported defect class S237 was built to close; this engine postdates the sweep." Also no describeState case (IA-F5).
- Rule: A2, A7, B2, E8. Fix scope: engine fix + axisCaptions enrollment + PG-09/PG-05.
- Status: **CLOSED** (S242, verified by execution). Rendered the authored spec plus edge cases (fence at xMax for xMax ∈ {6,8,10}): x/y tick strokes and numerals `0,2,4,6`, axis captions present, and **0 of 14–15 text elements** fall outside the 300×300 viewBox — corner labels are seated via `s238Seat` against `s238Walls`.

### D-12 · H — argandExplore multiply mode rescales the grid mid-drag with no tick numbers to reveal it
- Surface: argandExplore · `widgets.tsx:3002–3005` (dynamic G), `:3033–3038` (unlabeled lattice).
- Evidence (AX-D4): "dragging z outward can grow |z·w| past gridMax and shrink every grid unit live … the rescale is invisible: the same arrow length means different |z| from frame to frame." Axis names real/imaginary exist but are asserted by no gate.
- Rule: A9, A2. Fix scope: engine fix (stable scale or printed extents) + caption pin + PG-09.
- Status: **CLOSED** (S242, verified by execution). The dynamic `G` remains but the printed-extents fix landed: rendered multiply mode at z=(1,1)/(3,2)/(5,5), axis numerals move **±5 → ±13 → ±25**, so the rescale announces itself in the numbers. `place` mode stays ±5.

### D-13 · M — Full-stage `touch-action: none` hit-rects make four graphs scroll-dead zones at 390px
- Surface: feasibleRegionExplore `widgets.tsx:13710`, parametricTrace `:3743`, distanceGrid `:1566`, rotationLab `:11662` (whole-SVG `mt-drag-hit` rects).
- Evidence (IA-F3): violates `useSvgDrag.ts:10–12`'s own contract ("`touch-action: none` on the HANDLE ONLY — the page … still scrolls natively"); "a large mid-lesson region where a scroll gesture is swallowed." Compliant peers confine hit bands (boxPlot :9478, percentBar :6368, numberLinePlace :12654).
- Rule: E4. Fix scope: scope hit-rects to handles/bands (4 engines) + PG-11 geometry gate.
- Status: **CLOSED** (S242, verified by execution). Rendered all four engines: feasibleRegionExplore hit area is `rect 32×244` (**8.7%** of stage), parametricTrace `circle r=20` (**1.9%**), distanceGrid `circle r=20`, rotationLab `circle r=20` (or the image polygon in symmetryOrder). No whole-SVG rects remain on any of the four.

### D-14 · M — boxPlot: 3 floating axis numerals, zero tick strokes, no visible handle readouts, unburned parity baseline, nonstandard aria vocabulary
- Surface: boxPlot · `widgets.tsx:9447–9450` (axis), `:9484–9489` (sliders), `:9446` (aria).
- Evidence (AX-G2, ST-G2, IA-F4, ST-P4): dm-01-01 asks for 78/82/85/88/92 "on an axis labelled only 60 · 80 · 100, no ticks, exact-match grading … a sighted learner must land five handles on unmarked integers by pixel estimation; the only numeric feedback is for screen-reader users." Four `boxPlot|*` entries sit in accessibleParity's `KNOWN_UNREVIEWED` baseline (test :173–176); aria speaks "low, lower-mid, mid, upper-mid, high" while the sliders teach Q1/median/Q3. Inventory: "weakest of the stats trio."
- Rule: A7, C2, E7. Fix scope: engine fix (ticks + visible readouts + vocabulary) + baseline burn-down + PG-05/PG-06/PG-12.
- Status: **CLOSED** (S242), all five. Tick strokes added; a per-slider readout added (the five values the learner sets appeared in NO visible text before); the four `boxPlot` entries in `KNOWN_UNREVIEWED` **burned, not waived** — removed and re-run to confirm the ratchet reports no new violations. The aria sub-defect resisted the obvious fix: unifying the image label with the slider vocabulary **breaks `widgets.aria.test.tsx`**, which requires an image label to stay distinguishable from every control label so a screen reader announcing "median" cannot leave the listener unsure whether they are on the figure or a slider. The original divergence was satisfying that gate, badly. The image now describes the SHAPE in standard box-plot vocabulary — "The box runs 3 to 10, its centre line at 7, with whiskers reaching 0 and 14" — carrying the same five numbers and reusing none of the control names.

### D-15 · M — sp7-dotplot-overlap figure: group B's dots fully occlude group A's at shared coordinates
- Surface: figure `sp7-dotplot-overlap` · `src/components/figures.tsx:2102–2103`.
- Evidence (ST-G6): at shared x positions 70/90/110/130 "the tangerine B dots land on exactly the same (cx, cy) as sky A dots and fully occlude them. A learner counting sky dots reads wrong frequencies; the 'heavy overlap' the title narrates is drawn as data loss."
- Rule: A14. Fix scope: figure fix (dodge/hollow marks) + PG-09 mark-occlusion check.
- Status: **CLOSED** (S242, verified by execution). Rendered sp7-dotplot-overlap and compared every A×B dot pair: **0 coincident, 0 overlapping**, minimum same-row gap 7.20 against combined radii 5.6. Both fixes are live — dodge=3.6 and hollow B marks (`fill="#ffffff"` with tangerine stroke).

### D-16 · M — SingleScaleGraph figure claims "each line = 1" while drawing zero gridlines and labelling by 2s
- Surface: figure `single-scale-graph` · `figures.tsx:11187–11199`.
- Evidence (ST-G7): `<title>` says "each gridline is worth exactly one" and the caption reads "each line = 1", "but the SVG draws only the two axis strokes — no horizontal gridlines — and the y labels step 0/2/4/6."
- Rule: C1/A4 (figure claims vs geometry). Fix scope: figure fix + PG-09 title-claim lint.
- Status: **CLOSED** (S242, verified by execution). Rendered: **7 horizontal lines** (6 gridlines + axis) and texts `0..6` — one gridline per unit, one label per gridline. The title claim "each line = 1" is now true of the geometry.

### D-17 · M — Canonical statistical figures missing axis furniture: HistogramScores has no frequency axis; scatter figures have unnamed, tickless axes
- Surface: figures · HistogramScores `figures.tsx:5574`; ScatterAssociation `:7693`; ScatterBestFit `:7719`.
- Evidence (AX-G4): "no y-axis line, no frequency ticks or axis title; counts printed atop bars instead"; scatters draw "bare 50%-opacity segments; no variable names, no ticks, no origin label" — and these are "the lesson's canonical depiction of the display type."
- Rule: C1, C4, A1 (figures analogue). Fix scope: figure fixes + PG-09 figures axis-semantics gate.
- Status: **CLOSED** (S242, verified by execution). Rendered all three: `histogram-scores` gains a `"how many scores"` axis with ticks 0–4; `scatter-association` names y/x on each of 3 panels and prints the origin; `scatter-best-fit` ticks x at 2,4,6,8 and y at 0,4,8.

### D-18 · M — Eight line-plot dd* generator forms describe a dot plot but attach no plotData
- Surface: variant `line-plot` forms ddDotTotal/ddDotDataSet/ddDotMissingValue/ddDotMoreThan/ddShape* · `variants.ts:31989–32100`.
- Evidence (DS-G2): "A dot plot shows ${shownPlot(counts)}…" emitted as bare numeric — "the refresh serves describe-not-draw items (the pre-S125 anti-pattern) alongside sibling items that draw" (sibling forms of the same generator attach plotData).
- Rule: D3. Fix scope: generator fix (attach plotData) + PG-02 presence assert.
- Status: **CLOSED for 5 of 8 forms; 3 blocked by a renderer cap, not by the generator.** `ddDotTotal`, `ddDotDataSet`, `ddDotMissingValue`, `ddDotMoreThan`, `ddShapeSymmetric` now attach `plotData` 120/120 (`ddDotMissingValue` had no counts at all — the empty position IS its question). `ddShapeOutlier`, `ddShapeClusterCount` and `ddShapeFullStory` cannot draw: listing only occupied positions breaks **GG-15** (the renderer uses `repeat(values.length, 1fr)`, so an uneven lattice draws a nine-wide outlier gap at one-step width — the exact lie these questions teach learners to catch), while a uniform lattice needs 9–19 columns against **`MAX_PLOT_COLUMNS = 8`** (`schema.ts:78`). Both constraints are recorded at the call sites. Raising the cap is a renderer decision.

### D-19 · M — "The graphed point…" / "on a scatter plot… a dot is at" served with no graph
- Surface: `pr-graph-rate-g7` default `variants.ts:34803`, graphStoryRead numeric fallback `:34791`, `g8-bv-scatter-basics` mcq forms; authored `bv-01-01.json` k1 ("a dot sits at across-position 4, up-position 7" — `figure: null`).
- Evidence (DS-G3): "no plot, plotData, or figure accompanies these; in practice/review only the widget renders." (The upgradePointSetVariant-wrapped path was executed and is in sync; the naked path remains reachable and is what bv-01-01 k1–k3 refresh to.)
- Rule: D3. Fix scope: route through pointSet wrapper or attach figure/plotData + PG-02.
- Status: **CLOSED as not-a-defect** (ruled 2026-08-15). Two of the four flagged forms describe no specific figure — `bvScatterCount` asks "22 cyclists, how many dots should appear?" and `bvScatterPurpose` is conceptual. The other two ask what the coordinate (2, 6) *represents* given the axis names, where plotting the dot on labelled axes would show the answer. `plotData` is 1-D and cannot carry a scatter, and switching widget type would make `variantForStep` decline on its surface guard — removing the refresh entirely. The sweep flagged all four because they share a generator; the prompts do not support the claim.

### D-20 · M — dd-03-01 "Level the bars": the stated dataset (3, 4, 6, 7) is never drawn — bars always start at 0
- Surface: barBuilder · `content/courses/data-distributions/lessons/dd-03-01.json` i1; `widgets.tsx:11949`; `schema.ts:1739` (no start-heights field).
- Evidence (DS-G1): "The learner never sees 3/4/6/7; the 'fair-share leveling' action is a from-scratch build of 5,5,5,5. The mean-as-leveling concept survives only in the feedback text."
- Rule: D1, D2, C3. Fix scope: schema + engine start-heights support, or reword step + PG-10.
- Status: **CLOSED by ruling** (2026-08-15) — bars start at zero. `BarBuilderSpec` has no start-heights field, so the four uneven bars the prompt named could never be drawn. Rather than grow the schema, the step now describes what the widget does: "Four friends have 20 cookies between them. Build each bar to the level where all four are equal — that level IS the mean." The starting dataset (3, 4, 6, 7 — 20 in all) moves into the body, so the mean is still derived rather than asserted.

### D-21 · M — shuffleTest axis: a single "0" tick on a silently self-rescaling scale
- Surface: shuffleTest · `widgets.tsx:2339–2358`.
- Evidence (AX-G6, ST-P5): `lim = max(|observed|·1.35, max|null|, 0.5)` — "±lim are never printed, and each new extreme draw re-maps every existing dot to new positions with no visible cue"; "two visually identical piles denote different spreads."
- Rule: A9. Fix scope: engine fix (print ±lim endpoints) + PG-07.
- Status: **CLOSED** (S242, verified by execution). Rendered `<g data-testid="sht-axis">`: five numerals `-5.4 · -2.7 · 0 · 2.7 · 5.4` for the authored spec. A constructed growing-`lim` case (groupA=groupB, observed 0) moves the numerals **±0.5 → ±8** after the first shuffle, so the rescale is visible in the numbers.

### D-22 · M — sequenceBuild dial: negative partial sums render clipped/degenerate while the control invites them
- Surface: sequenceBuild (SequenceDialW) · `widgets.tsx:3985`, `:4019–4020`, slider `min=-5` `:4039`.
- Evidence (ST-G5): "the clamps flatten every negative bar to a 1px sliver at a wrong position or clip it off-canvas entirely. The strip goes visually inert exactly when the learner explores the negative half of the control."
- Rule: B4. Fix scope: engine fix (zero-baseline negative bars or clamp domain) + PG-07.
- Status: **CLOSED** (S242, verified by execution). Rendered arithmetic mode at d = 2, 0, −1, −2, −5. At d=−5 (sums 3,1,−6,−18,−35,−57,−84,−116): **16 rects, 0 outside the 0–130 viewBox**, heights ∝ |sum| drawn from the zero line, and the `0` baseline label appears whenever `base < 0`. The only 1px bars are sums of exactly 0 or ±1.

### D-23 · L — HopLandingW's drawing is `role="group"` named "Number line", stateless
- Surface: numberLineHop landing mode · `widgets.tsx:15975` (vs the gold standard in its own sibling HopSizeW `:15799–15800`).
- Evidence (IA-F6): "announced as the two words 'Number line' … A screen-reader learner … never gets the picture's content: where the start is, how many hop arcs are drawn, which direction they run" — and counting hops "is the entire job of a number line at this grade" (engine's own S237 comment).
- Rule: E9. Fix scope: engine fix (role="img" + stateful label) + PG-12.
- Status: **CLOSED** (S242). `HopLandingW` emitted `role="group" aria-label="Number line"` — a static name saying the same thing before and after the learner acts, on the surface whose entire content is the hops; `role="group"` was wrong anyway, the SVG has no focusable children. Now `role="img"` with a state sentence matching its own sibling `HopSizeW`, reporting start, hop count, hop size, direction and landing through the same `hopLabel`/`denom` formatter the ruler uses, so a rational lattice narrates "1 1/2" and not a raw count of halves. Off-lattice taps describe a single jump rather than a false hop count.

### D-24 · L — feasibleRegionExplore and parametricTrace have no "Describe this model" narration
- Surface: `src/lib/describeState.ts` — no `case "feasibleRegionExplore"`, no `case "parametricTrace"` (fall to `default: return null`, :1127–1128); no `WIDGET_ACTIONS` entries.
- Evidence (IA-F5): the a11yAudit.s44 contract says every dense kind narrates via describeWidgetState; "the persistent, re-readable … panel that every peer lab offers screen-reader users is absent for exactly these two" — the same two engines that escaped S237.
- Rule: E8. Fix scope: two describeState cases + PG-12 per-kind enrollment gate.
- Status: **CLOSED** (S242). Both engines returned null from `describeWidgetState`, so "Describe this model" said nothing at all on two of the newest interactive surfaces while 88 other cases narrate. Both now do the arithmetic a sighted learner reads off the axes: the fence's x with the region's boundaries and top-right corner; the parameter t with the plotted point, the target point, and which way t must move.

### D-25 · L — Systemic tick-value sparsity on value-graded planes: scatterFit, slopeField, pointSetReasoningLab, plotPoint origin
- Surface: scatterFit `widgets.tsx:9116–9117` (gridlines at opacity 0.06, zero numerals under a numeric `y = mx + b` readout), slopeField `:5639–5650`, PointSetDiagram `:8037` (named axes, zero ticks/gridlines, names unpinned), plotPoint no origin/0 (`:15192`).
- Evidence (AX-G3, ST-G8, AX-G8, AX-G7): "the learner tunes m and b as printed numbers against a plane where no number appears; intercept b is unverifiable against the picture"; "no gate anywhere asserts a numeric tick, and most engines print none" — coordinateProofLab is the sole full-tick engine.
- Rule: A7, A8. Fix scope: per-engine sparse tick/endpoint labels (design pass) + PG-05/PG-09.
- Status: **CLOSED** (S242, verified by execution). All four sub-claims. scatterFit draws `sf-ticks` with numerals and x/y captions; slopeField draws `sfd-ticks`; PointSetDiagram draws tick strokes, numerals and an origin `0`; plotPoint renders `data-testid="pp-origin"`. Corpus-wide, of 71 authored plotPoint specs **50 draw the origin marker** and the other 15 numeric-band specs already print 0 or a negative in their own labels (6 categorical bands correctly abstain).

---

## GATE GAPS (unguarded but currently correct)

### GG-01 · C — Generated graph specs are never rendered by any gate (all 23 tags, state G)
- Surface: all variant emissions; serving paths `PracticeClient.tsx:74`, `ReviewClient.tsx:118`, `masteryMission.server.ts:204`.
- Evidence (RG-F1; inventory gap #1): "no test file in the repo both imports a `variantFor*` function and renders — verified by cross-grep … Every generated widget spec that reaches a learner through practice, review, or Mastery Studio has never been mounted by any gate." D-01/D-02/D-03 all shipped through this hole.
- Rule: F1. Gate: PG-01 (+ PG-08).

### GG-02 · C — plotPoint is invisible to every axis/label gate in every state (DOM grid, not SVG)
- Surface: plotPoint `widgets.tsx:15176` + its four generators.
- Evidence (RG-F2; inventory gap #2): `scanTextBoxes` and axisCaptions key off `<svg>`; the variant branch checks only label *counts* (`variants.test.ts:10731–10732`) — "label CONTENT, distinctness, width at 390px, and axis captions are unchecked in both authored and generated states."
- Rule: C9, A1. Gate: PG-03.

### GG-03 · H — Post-interaction state (I) has zero collision/scale coverage; the error tone is never swept by a failing gate
- Surface: every interactive graph engine (51 drag engines).
- Evidence (RG-F3, RG-F11): all collision scanners render `value={null}`; labelCollision sweeps `["neutral","info"]` only while the post-miss frame is `tone="error"` — "marker label vs tick label at the same x, bar count labels vs gridline labels at maxVal, dragged whisker label crossing the median label — no gate can see any of it."
- Rule: B1 (state I). Gate: PG-04.

### GG-04 · H — graphRead bar mode: latent axis lie whenever `unitValue > 1`
- Surface: graphRead bar branch `widgets.tsx:8518–8531`.
- Evidence (AX-G1, DS-G4, ST-G1): labels print raw `t`, aria says "each gridline standing for ${spec.unitValue}", ghost computes `drawn × unitValue`. All 33–35 authored specs use `unitValue: 1` (verified) — "one authored edit from live", and the scaled-bar skill (2.MD) is on the roadmap.
- Rule: A4. Gate: PG-07 (render-honesty assert or engine fix `t × unitValue`).

### GG-05 · M — barBuilder drops the true ceiling when `maxVal % step !== 0`
- Surface: barBuilder `widgets.tsx:11958–11981`.
- Evidence (AX-G9, ST-G4): "for `maxVal: 45, step: 10` the gridlines/labels stop at 40 while `hScale` runs to 45" — against the engine's own S237b comment "the axis always states its ceiling". All authored specs currently divisible.
- Rule: A5. Gate: PG-06 (`maxVal % step === 0` integrity refinement).

### GG-06 · M — boxPlot has no `widgetIntegrityErrors` branch: an unwinnable spec would ship silently
- Surface: `schema.ts:1846–1865`; `case "boxPlot"` absent from widgetIntegrityErrors.
- Evidence (RG-F4): "five unconstrained ints for targets and five for starts — no `targetMin ≤ targetQ1 ≤ …` refine, no bounds-vs-axis check, no start ≠ target check … A mis-ordered target set makes the step unwinnable." All 5 authored specs verified ordered/in-axis.
- Rule: C2. Gate: PG-06.

### GG-07 · M — Remedial steps are outside the surface-preservation proof while being exactly the steps review refreshes
- Surface: `variants.surface.test.ts:45` (`for (const s of j.steps ?? [])`); `review-steps/route.ts:50–51`; `ReviewClient.tsx:118`.
- Evidence (RG-F5): "remedial pairs never enter [the walk] … the corpus-level proof … is silently not a proof for the remedial third of the servable step space" (runtime decline guard still holds).
- Rule: F5, D4. Gate: PG-02 (extend walk).

### GG-08 · M — The only corpus-wide widget render check cannot fail a build; figures got the ratchet, widgets did not
- Surface: `collisionSweep.s238.test.tsx` (`skipIf(!COLLISION_SWEEP)`, "Not a gate — it counts, it does not fail").
- Evidence (RG-F6): "always-on rendered collision coverage for widgets is therefore 7 fixture engines + 2 e2e lessons; the other ~50 SVG engines' authored specs ship on the strength of a measurement that cannot go red."
- Rule: B1. Gate: PG-05 (promote to zero-baseline ratchet).

### GG-09 · M — Mastery Studio missions: a 32-item generated/authored bank with no render or spec gate of its own
- Surface: `masteryMission.server.ts:195–225` (`selectPracticeBank`, cross-tag fallback rows :198).
- Evidence (RG-F7): "No gate constructs a mission and parses/integrity-checks/renders its bank … the composition … is unaudited."
- Rule: F5. Gate: PG-13 (mission bank gate).

### GG-10 · M — Generated numberLinePlace tick density is generator-chosen and uncapped
- Surface: round-ten/hundred/half `variants.ts:28376–28706`, nl-unit `:29312`, equivalent-fractions `:29678`; variant branch `variants.test.ts:11406–11441`.
- Evidence (RG-F8): reachability is checked, but "nothing about `tickStep` dividing the span, tick count caps, or ladder membership … nothing stops the next generator (or band) from emitting `tickStep: 1` over `0..1000`." numberLineRay got a schema-level 200-tick cap; numberLinePlace did not.
- Rule: A6. Gate: PG-02.

### GG-11 · M — Spec-driven axis captions of generated specs are never asserted (graphStoryLab, affine, pointSet)
- Surface: `graphStoryReadVariant`/`graphStoryBuildVariant` `variants.ts:1602–1661`; upgradeAffineVariant `:39947`; upgradePointSetVariant `:40133`.
- Evidence (RG-F9): the graphStoryLab variant branch "audits segments/claims/feedback exhaustively but never touches `xAxisLabel`/`yAxisLabel`/`axisContext` consistency (e.g. an `axisContext: 'distanceFromOrigin'` prompt paired with a 'speed' y-label would pass)."
- Rule: F4, A1. Gate: PG-02.

### GG-12 · M — Four coordinate-plane engines carry no axis/scale gate even in the authored state
- Surface: parametricTrace, feasibleRegionExplore, argandExplore, dilationExplore grid mode.
- Evidence (RG-F10): "A regression that deletes their tick labels entirely would pass every suite" — they postdate/escaped the S237 worklist; axisCaptions' own header records them "OPEN pending a ruling". (The live rendering defects are D-10/D-11/D-12; this entry is the gate absence.)
- Rule: A2. Gate: PG-09 (enroll or rule).

### GG-13 · L — Pv3NumLine rounds every tick to an integer: latent mislabeling on any fractional step
- Surface: `figures.tsx:344` (ticks :347–348).
- Evidence (AX-G5): "with step 0.5 … rounding produces duplicated values (duplicate React keys) and ticks positioned at the rounded value." Current call sites use integer steps.
- Rule: A10. Gate: PG-07/PG-09.

### GG-14 · L — DotPlotBuildW ignores `denominator` while read mode formats with it
- Surface: `widgets.tsx:9360` (build: raw `{v}`) vs `:9270` (read: `dotPlotLabel(value, denominator)`).
- Evidence (DS-G5): "a build-mode dotPlot authored with `denominator: 2` would label its axis 12/14/16 instead of 6/7/8." All 5 authored build specs omit denominator; the read-mode authoring pattern is live.
- Rule: C5. Gate: PG-07 or schema restriction.

### GG-15 · L — plotData/DotPlotReadW lay numeric values out in equal-width columns: latent number-line distortion for non-consecutive values
- Surface: `widgets.tsx:446` (`repeat(values.length, 1fr)`), `:9284`; schema requires strictly increasing but not uniform (`schema.ts:97`). Build mode uses true `linScale` — the two dot-plot modes silently disagree about geometry.
- Evidence (ST-G3): "`values: [1, 2, 4]` (legal per schema) would render 2→4 the same width as 1→2 — a distorted number line." All 19 authored blocks + both emitters verified consecutive.
- Rule: C6. Gate: PG-06 (`plotDataParts` uniform-spacing refinement).

### GG-16 · L — Figures have no axis-semantics gate: no figures analogue of axisCaptions or any scale gate across the 1,871
- Surface: `figures.tsx` registry; gates figures.test / labelCollision.s238 / figureTextAdversarialAudit.
- Evidence (AX-G4, inventory gap #4): collision, render integrity, and text alignment are gated; "axis-caption semantics and scale honesty" are unswept — which is how D-16/D-17 exist despite three figure gates.
- Rule: A1 (figures), C1, C4. Gate: PG-09.

---

## POLISH APPENDIX (noted, not counted above)

- P-01 ciCapture: 3 text-only labels, no tick strokes; counts 60 intervals while displaying 24 (`widgets.tsx:2247–2277`) [AX-P1].
- P-02 dragOrder rank-polyline: fontSize-9 labels, no collision handling; "−7.25" abuts at n≥6 (`:14693–14695`) [AX-P2].
- P-03 dotPlot build axis has positions but no title/unit (`:9353–9359`) [AX-P3].
- P-04 CoordinatePlane concept figure: no numeric ticks — "(3, 2)" verifiable only by counting lines (`figures.tsx:57–91`) [AX-P4].
- P-05 AxisCaptions at 55% opacity / 11px for load-bearing axis naming (`widgets.tsx:17676`) [AX-P5].
- P-06 prob-fraction trialRelFreq feedback speaks unreduced counts the learner never tapped [DS-P2].
- P-07 HistogramScores caption "bins share edges" vs "0-4 / 5-9" integer-bin labels (`figures.tsx:5577–5593`) [ST-P1].
- P-08 MmtBarGraph "each line is worth one" with no lines drawn (`figures.tsx:15177–15185`) [ST-P2].
- P-09 Md3BarGraph aria promises "a bar stopping between lines" that never occurs (`figures.tsx:4092–4096`) [ST-P3].
- P-10 dotColumns half-width edge bins thin the pile extremes (`widgets.tsx:2113`) [ST-P6].
- P-11 Axis captions aria-hidden with no accessible restatement of axis meaning on most planes (graphStoryLab is the in-repo standard, `widgets.tsx:8343`) [IA-F7].
- P-12 Sub-44px drag pucks r=16–18 on handle-scoped engines (`widgets.tsx:2951/:3086/:3233/:4887`) [IA-F8].
- P-13 Gate hygiene: figureTextAdversarialAudit rewrites `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` on every run (Trap K) [RG-F12]; the graph e2e suites' only interaction is one radio click [RG-F13/IA-F9].
