# S317 — ScatterFitW MSE/SSE label fix + barData bar-graph mechanism

`MT-V4-WORKER-PREFIX-1`

Worker scope this round: sole owner of `src/components/widgets.tsx` and `src/lib/schema.ts`.
Authority read first: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`.
Base commit: `8a0a8c7b66d92a1b7b9dca18e1266615b9a2f594`.

## A. ScatterFitW (bv-05-03) — label + accessibility fix, math untouched

**Signed rationale read**: `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, latest bv-05-03
record by `reviewedAt` is `S247-BV-bv-05-03-OLS-SUPERSESSION-lfnorm` (a byte-equivalent line-ending
re-basing of `S247-BV-bv-05-03-OLS-SUPERSESSION`, same `reviewedAt`, same content). Its
`reopenCondition`: promote to KEEP only after the shared `scatterFit` surface (a) names its
displayed quantity as mean squared residual (or displays SSE consistently with the lesson) and
(b) its SVG/state accessibility description communicates the data points, residual evidence, and
the current scored fit metric. `reports/closure/S316_MISC_FIGURE_REBUILD.md` fail-closed this
exact defect out of its `figures.tsx`-scoped batch, naming `ScatterFitW` (`src/components/
widgets.tsx`, then ~line 9709) as the shared renderer needing a `widgets.tsx`-scope worker.

**Verified the formula before touching anything** (mean vs sum, per the task's own gate):
- `ScatterFitW`'s `mse` (widgets.tsx): `points.reduce((acc,[px,py]) => acc + (py-(m*px+b))**2, 0) /
  points.length` — divides by `n`. That is the **mean** of the squared residuals (MSE), not their
  sum (SSE).
- `evaluate.ts`'s `scatterFit` case computes the **identical** formula (`/ spec.points.length`)
  and compares it to `spec.tolerance` to decide correctness. The widget's readout and the grader
  compute the same quantity — the math was never wrong, only the label.
- Checked every `scatterFit`-using lesson (`grep -rl scatterFit content/courses` → 12 lessons:
  `bv-01-02`, `bv-01-03`, `bv-02-01`, `bv-02-02`, `bv-03-01`, `bv-03-03`, `bv-05-02`, `bv-05-03`,
  `dm-02-01`, `dm-02-02`, `dm-03-01`, `si-05-02`). All 12 grade through the same `evaluate.ts`
  mean-formula path against their own authored `tolerance`, so no authored answer anywhere in the
  corpus depends on the widget computing a sum instead of a mean — there is nothing to fail-close
  on the math side. For `bv-05-03` specifically: tolerance `0.176` ≈ the signed rationale's
  independently-recomputed MSE `0.175` (SSE `0.70` ÷ 4 points) — confirms the grader, not the
  lesson's SSE-flavoured prose, is what the widget's number must be honest about.

**Fix applied (widgets.tsx, `ScatterFitW`)** — label only, math and grading byte-identical:
- The visible readout (previously `miss = {fmt(mse)}`, an unlabelled, ambiguous name) now reads
  `mean squared residual (MSE) = {fmt(mse)}` (`data-testid="sf-mse-readout"`). It is **not**
  relabelled "SSE" — that would be false, since the formula divides by `n`. This satisfies the
  reopenCondition's first branch ("names its displayed quantity as mean squared residual")
  without touching the second branch (displaying SSE), which would require dividing grading by a
  different quantity than every lesson's authored `tolerance` already assumes.
- Added a new always-visible line, `data-testid="sf-residual-readout"`: `Residuals: (x, y) residual
  ±n, …` for every point, directly under the MSE readout — the same residual state the berry
  whiskers already show visually, now also stated as text for anyone who cannot resolve whisker
  length by eye.
- Extended the SVG's `aria-label` (previously title + axis range + point list + current line only)
  to append the same per-point residuals plus a metric sentence: `Mean squared residual (MSE): X,
  at or under / above the target tolerance of Y.` — this is the "SVG/state accessibility
  description communicates the data points, residual evidence, and current scored fit metric"
  half of the reopenCondition. All prior aria-label content (title, axis range, point list, current
  line) is preserved verbatim — only appended to — so `widgets.coordinateGraphs.s249.test.tsx`'s
  substring assertions on that content stay valid (re-run, still green: 30/30).

**Out of scope, correctly**: `src/lib/describeState.ts`'s `scatterFit` case and `src/lib/
evaluate.ts` are both named in the signed rationale's `evidenceRefs`, but this round's ownership
is `widgets.tsx` + `schema.ts` only — neither file was touched. The fix above satisfies both
reopenCondition clauses entirely from within `ScatterFitW` (aria-label + visible text), so no
edit to those files was needed to close this defect; `describeState.ts`'s separate on-demand
"Describe this model" panel text for `scatterFit` still only states the line equation, which is a
pre-existing, narrower state description that this round did not touch (not required by the
in-scope fix, and out of ownership regardless).

**No fail-close on Task A.** The math was correct throughout; only the label was wrong, and no
authored answer depends on it (checked above), so schema/evaluator changes were neither made nor
needed.

## B. barData mechanism (md-03-02, md-03-03)

**Contract read**: `reports/closure/S316_LANEB_MEASUREMENT_DATA_ASSESSMENT.md` — `md-03-02`
(Scaled Bar Graphs) and `md-03-03` (Asking the Graph Questions) narrate specific bar-graph
category/value data in prose with no synced visual; `plotData` (schema.ts) covers line/dot plots
only. Pattern read: `PlotDataSpec`/`plotDataParts`/`plotDataIntegrityErrors` (schema.ts),
`LinePlotFigure` + its three call sites in `NumericW`/`FractionEntryW`/`McqW` (widgets.tsx), and
`content/courses/data-line-plots-g2/lessons/dlp2-01-01.json` (an authored `plotData`-carrying
lesson) for the authoring shape.

### 1. Schema addition (`src/lib/schema.ts`) — additive only

- `BarDataSpec` (new): `categories: string[min 2]`, `values: number[nonnegative, min 2]`, optional
  `title`, `axisLabel`, `scaleStep`, `axisMax`. Placed immediately after `PlotDataSpec`/
  `TPlotData` so every consumer that needs it can reference it (module load order).
- `MAX_BAR_COLUMNS = 8`, mirroring `MAX_PLOT_COLUMNS`.
- `barDataParts(spec)` — pure, total, never throws; returns `null` (draw nothing) for a missing
  field, a length mismatch, fewer than 2 or more than 8 bars, duplicate category labels, a
  negative value, or a value exceeding its own `axisMax`. Defaults: `axisMax` = the tallest bar's
  own value (never promises more scale than the data uses); `scaleStep` = a quarter of `axisMax`
  (at least 1).
- `barData: BarDataSpec.optional()` added to **five** widget spec types — `NumericSpec`,
  `McqSpec`, `MatchPairsSpec`, `DragOrderSpec`, `DragBucketSpec` — because the named steps in the
  contract use all five (`plotData` only needed three: numeric/fractionEntry/mcq). Every field is
  additive and optional; a spec without `barData` is byte-identical to before this change.
- `barDataIntegrityErrors` + a `widgetIntegrityErrors` hook for the same five types, mirroring
  `plotDataIntegrityErrors`'s discipline exactly (same rule shapes, same "renderer's own resolver
  is the last line of defence" check).

### 2. Rendering (`src/components/widgets.tsx`) — additive only

- `BarChartFigure` (new component, placed immediately after `LinePlotFigure`): an SVG bar chart —
  gridlines + tick labels at `scaleStep` multiples up to `axisMax`, one bar per category with its
  **value printed above the bar and its category printed below** (text on every bar — a
  non-colour cue, since every bar shares one fill colour). `role="img"` with a `<title>` and a
  full `aria-label` stating the chart title, axis label, scale step/max, and every
  `category: value` pair — unlike `LinePlotFigure` (which is `aria-hidden` and relies on a
  separate `describeState.ts` panel), this figure carries its own complete accessible description
  directly, per this round's literal instruction ("accessible: role="img", <title>, per-bar
  accessible text").
- Wired at the same call site pattern as `plotData` — `const bars = barDataParts(spec); {bars &&
  <BarChartFigure parts={bars} />}` — placed directly under the prompt, in `NumericW`, `McqW`,
  `MatchPairsW`, `DragOrderW`, and `DragBucketW`. No existing prop, control, drag handler, or
  evaluator call in any of these five renderers was modified.

### 3. Authored content (md-03-02.json, md-03-03.json) — 9 locations, truthful to the narrated data

All 9 locations the S316 contract names, **except one** (see fail-close below):

| Lesson | Step | Widget | categories | values |
|---|---|---|---|---|
| md-03-02 | i1 | matchPairs | "Bar reaching the 2nd/4th/3rd line" (verbatim = `left[].label`) | 10, 20, 15 |
| md-03-02 | k1 | mcq | Mon, Tue, Wed, Thu | 4, 7, 7, 2 |
| md-03-02 | i2 | dragOrder | "Bar at the 3rd/1st/2nd line (N)" / "Bar halfway to the 1st line (5)" (verbatim = `items[].label`) | 30, 10, 5, 20 |
| md-03-02 | ch1 | numeric | Bar A, Bar B | 8, 10 |
| md-03-03 | k1 | numeric | Dogs, Cats, Fish, Birds | 8, 6, 3, 5 |
| md-03-03 | k2 | numeric | Mon, Tue, Wed, Thu | 4, 7, 7, 2 |
| md-03-03 | i2 | dragBucket | Apples, Bananas, Grapes, Pears | 5, 8, 5, 2 |
| md-03-03 | k3 | numeric | Dogs, Cats, Fish, Birds (reuses k1's dataset, per its own prompt) | 8, 6, 3, 5 |
| md-03-03 | ch1 | numeric | Soccer, Tag, Swings, Slide | 9, 6, 4, 5 |

Every value matches its step's own narrated prose exactly (verified independently — see the gate
below, which re-derives every graded answer/claim from `barData` alone, never from the authored
`answer`/`correct` field).

For `matchPairs` (i1) and `dragOrder` (i2) in md-03-02, `categories` were authored as the
**verbatim** `left[].label` / `items[].label` text (not abbreviated) specifically so the gate's
independent route can match by exact string equality rather than a fuzzy substring rule — the
strongest, least ambiguous form of "the chart is the graded dataset."

### Fail-close: md-03-02/k2

The S316 contract's implementation note lists `k2` among the steps needing a figure ("the soccer
bar stops exactly halfway between the 4-line and the 6-line — how many votes?"). Its own prompt
names **exactly one** bar ("the soccer bar"); no second category is stated anywhere in the step.
`BarDataSpec` requires at least 2 bars (mirroring `plotData`'s `values.min(2)` — a chart of one
bar is not a comparison a bar CHART is for), and inventing a second, unnarrated bar to clear that
floor would not be "truthful… data drawn from what THIS step states" — it would be fabrication.
Per the fail-close instruction, `k2` was left unmodified (`barData` absent) rather than gamed, and
`content.barData.s317.test.ts` pins this decision with a dedicated test asserting `k2.widget.
barData` is `undefined` and that its prompt still names only one bar (so a future prose change
that adds a second bar is caught and this exclusion re-evaluated, rather than silently going
stale).

### A design call surfaced, not buried

Rendering `barData` draws bars at their **true** height (e.g. `md-03-02/i1`'s three bars sit at
their correct matched values 10/15/20, and `md-03-02/k2`... — excluded above — /`ch1`'s Bar B
sits at its correct halfway value 10) rather than hiding the graded quantity from the picture.
This mirrors the already-accepted `md-03-01` pictograph pattern (`Md3QuestionPictograph` draws the
literal, exact answer-bearing picture for a "read the graph" check) and the S316 contract's own
text ("bars at the stated heights… not its numeric value" — read as an instruction about the
**aria wording**, not the **visual geometry**, since a real bar graph's whole purpose is to let a
sighted learner read a bar's height off a labelled scale). Per-bar aria/visible text states
`category: value` plainly (this round's literal instruction), which for a handful of steps
(`md-03-02/i1`, `ch1`; `md-03-03`'s numeric steps) is the same information a sighted learner
already gets by looking at the picture — not a NEW leak beyond what rendering the promised visual
at all necessarily discloses. Flagging this transparently rather than silently choosing a side,
per house rules on new judgment calls.

### 4. Gate: `src/lib/content.barData.s317.test.ts`

Modelled on `content.plotData.s237.test.ts`. 16 tests, two `describe` blocks:
- **Corpus contract**: exact 9-location allowlist (corpus-wide `readdirSync` over all courses, not
  just `measurement-data`); the `md-03-02/k2` fail-close, pinned by name and by a live prompt-shape
  check; no-category-collision precondition for the lookup route; `barDataParts`/
  `widgetIntegrityErrors` drawability; **independent answer/claim derivation** — `answerFromBarData`
  (numeric steps: "how many more A than B", "in ALL", "A and B together", the grouped-comparison
  shape) and `claimTrueFromBarData` (dragBucket: ties, "most popular", "beat", the bars-vs-votes
  trap) both parse the step's own **prompt text** to decide which categories are in play, then
  compute purely from `bar.values` — never reading the authored `answer`/`correct`/`bucketId`
  field — and are asserted equal to what was authored; a dedicated `matchPairs` route confirms
  each left item's matched right-column number equals `barData`'s own value for that item (exact
  string match, verbatim categories); a dedicated `dragOrder` route confirms the authored
  shortest-to-tallest order equals `barData`'s values sorted ascending; grading-untouched checks
  per widget type; whole-corpus "no step outside the declared 9 has `barData`" regression guard
  (>10,000 steps swept).
- **Derivation routes are real detectors**: paired accept/reject synthetic cases for
  `answerFromBarData` and `claimTrueFromBarData`, off the corpus, mirroring the plotData gate's
  "every rejection is paired with a near-identical acceptance" discipline.

### 5. Render gate: `src/components/widgets.barData.s317.test.tsx`

`// @vitest-environment jsdom` pragma line 1, modelled on `widgets.coordinateGraphs.s249.test.tsx`.
12 tests: corpus size pinned at 9; every declared chart renders `role="img"`, a non-empty
`<title>`, one bar per category, category/value text on every bar (non-colour cue), and an
`aria-label` that contains every category and value string plus the axis-max and 0 tick labels; a
spec without `barData` renders no bar-chart figure (regression guard); interaction smoke tests
(`matchPairs` tap-to-link, `numeric` typed input, `tone="info"` reveal) confirm the chart does not
disturb existing controls; 6 synthetic `barDataParts` accept/reject pairs (too few categories,
length mismatch, duplicates, over-tall value vs `axisMax`, default resolution, absent `barData`,
too many categories).

## Gate results (verbatim)

```
$ npx vitest run src/lib/content.barData.s317.test.ts
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  1 passed (1)
      Tests  16 passed (16)

$ npx vitest run src/components/widgets.barData.s317.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  1 passed (1)
      Tests  12 passed (12)

$ npx vitest run src/lib/content.plotData.s237.test.ts
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  1 passed (1)
      Tests  30 passed (30)

$ npx tsc --noEmit
(no output — clean)

$ npm run validate:content
...
schema: 1840/1840 files clean
```

All required gates pass; the count held at 1840/1840 with the schema addition (additive/optional
fields never change how existing content parses).

## Fail-closed items

1. **md-03-02/k2** — no `barData` authored (see "Fail-close" above). Genuine, narrow: the step's
   own prompt narrates only one bar, below `BarDataSpec`'s (mirroring `plotData`'s) 2-bar floor.
   Pinned by a dedicated test so a future prose change re-opens the decision rather than silently
   drifting.
2. Task A's math-fail-close condition ("if any authored answer depends on the wrong value, fail-
   close") was checked and found **not triggered** — reported above, not a fail-close, for
   completeness.

## Files touched

- `src/lib/schema.ts` — `BarDataSpec`, `MAX_BAR_COLUMNS`, `barDataParts`, `barDataIntegrityErrors`
  added; `barData` field added to `NumericSpec`, `McqSpec`, `MatchPairsSpec`, `DragOrderSpec`,
  `DragBucketSpec`; one hook line added to `widgetIntegrityErrors`. No existing field, export, or
  branch removed or altered.
- `src/components/widgets.tsx` — `ScatterFitW`: label fix + residual/metric accessible text
  (aria-label + new visible line), math/grading byte-identical. New `BarChartFigure` component;
  wired into `NumericW`, `McqW`, `MatchPairsW`, `DragOrderW`, `DragBucketW` via `barDataParts(spec)`
  at the same call-site pattern as `plotData`. `barDataParts` added to the schema import list.
- `content/courses/measurement-data/lessons/md-03-02.json` — `barData` added to `i1`, `k1`, `i2`,
  `ch1`. `k2` deliberately unmodified (fail-closed).
- `content/courses/measurement-data/lessons/md-03-03.json` — `barData` added to `k1`, `k2`, `i2`,
  `k3`, `ch1`.
- `src/lib/content.barData.s317.test.ts` — new, 16 tests.
- `src/components/widgets.barData.s317.test.tsx` — new, 12 tests.
- `reports/closure/S317_SCATTERFIT_BARDATA.md` — this file.
- `reports/closure/cowork-staging/laneE-s317-engineering.jsonl` — NDJSON evidence lines.

Not touched (out of this round's ownership, correctly): `src/lib/describeState.ts`,
`src/lib/evaluate.ts`, `src/components/figures.tsx`, `src/components/figureIds.ts`, and any lesson
content outside `md-03-02`/`md-03-03`.

## Round 2 — closes the two independent-verifier REVISEs (`S317_BATCH1_VERIFICATION.md`)

Base commit unchanged: `8a0a8c7b66d92a1b7b9dca18e1266615b9a2f594`. Scope this round: sole owner of
`src/components/widgets.tsx`, `src/lib/schema.ts`, `src/lib/describeState.ts`. Authority read first:
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`; governing findings:
`reports/closure/S317_BATCH1_VERIFICATION.md` (md-03-02 and bv-05-03 sections), this file (round 1
context above).

### 1. md-03-02/i1, ch1 — the answer-leak the independent verifier confirmed

**Verifier finding (agreed with, not disputed).** `BarChartFigure` unconditionally prints every
bar's literal numeric value as SVG text (`data-testid="bar-chart-value"`) and states it verbatim in
the aria-label. On `i1` (matchPairs — derive each bar's value from line-count × scale-step, with a
`pairErrors` trap specifically for the multiplication misconception) and `ch1` (numeric — grades
the un-stated halfway height of Bar B), this hands over exactly the quantity the check exists to
test. `k1`/`i2` (md-03-02) and all 5 `md-03-03` steps were re-checked against their own prompt text
independently this round (see the gate below) and confirmed non-leaking — every value they draw is
already a numeral written elsewhere in that same step's own widget text (prompt, or — for `i2`'s
`dragOrder` — its item labels), so charting the identical numbers adds nothing new. **No
`md-03-03.json` change was needed or made.**

**Fix (schema.ts).** `BarDataSpec` gains an optional `valueLabels: "all" | "none"` field. Absent
(every pre-existing declaration, and `k1`/`i2`/all of `md-03-03`) resolves to `"all"` inside
`barDataParts` — byte-identical to round 1's behaviour. `"none"` is authored on exactly `i1` and
`ch1`'s `barData` blocks.

**Fix (widgets.tsx, `BarChartFigure`).** When `valueLabels` resolves to `"none"`: the per-bar
`<text data-testid="bar-chart-value">` element is omitted entirely (category label, gridlines, and
axis tick labels are unaffected — the contract's "bars render to scale against labeled axis
ticks/gridlines" instruction). The aria-label's per-bar clause switches from the flat
`"category: value"` fact to a POSITION sentence built by two new small pure helpers,
`ordinalWord`/`barGridlinePosition`: each bar is described by its **ordinal gridline count** from
the baseline — `"Bar B ends halfway between the 2nd gridline and the 3rd gridline above zero."` —
never by a gridline's own numeric label. This was a deliberate choice over restating tick VALUES
(e.g. "the 8-line"/"the 12-line", the phrasing `ch1`'s own prompt uses): for `ch1`'s Bar A that
phrasing would be harmless (its value, 8, is already given verbatim in the prompt), but for `i1`
every bar sits exactly ON a gridline, so a tick-value-based sentence would state "ends on the
10-line" for the very bar the matching task grades as 10 — recreating the identical leak in a new
wrapper. Ordinal gridline counting is safe for BOTH steps uniformly: it repeats zero information
beyond what each category's own name already states (`i1`'s categories are themselves phrased
"Bar reaching the 2nd line" etc.; `ch1`'s prompt already states Bar A's position and leaves Bar B's
implicit), so the sentence can never hand over more than the step already discloses in prose,
regardless of whether a future author's data happens to land exactly on a tick.

**Content (`md-03-02.json`).** `"valueLabels": "none"` added to `i1`'s and `ch1`'s `barData` blocks
only — 2 of the 9 declared locations. Every other field in both blocks is untouched.
`md-03-03.json` was read in full and independently re-checked (see gate below); no change made.

### 2. bv-05-03 — `describeState.ts`'s `scatterFit` case now carries residual/metric parity

**Verifier finding (agreed with — the implementer's own round-1 report already disclosed this
gap).** Round 1 satisfied the reopenCondition's SVG half (aria-label + a new visible
`sf-residual-readout` line in `ScatterFitW`) but left `describeState.ts`'s `scatterFit` case — the
corpus-wide, on-demand "Describe this model" panel `WidgetRenderer` builds for every widget type —
returning only the point range and the current fit line. The reopenCondition names "SVG/**state**"
explicitly; the "state" half stayed unmet.

**Fix (describeState.ts).** The `scatterFit` case (branch where a fit line has been set) now also
computes and states per-point residuals and the mean squared residual (MSE) against
`spec.tolerance` — the IDENTICAL formula `ScatterFitW`'s own `mse`/`evaluate.ts`'s `scatterFit`
grading use (divides by `points.length`, a mean, not a sum), phrased with the same wording the
widget's own visible/aria text already uses (`"Residuals: ..."` / `"Mean squared residual (MSE): X,
at or under/above the target tolerance of Y."`). The no-fit-line-yet branch (`value === null`) is
byte-identical to before. Read-only: `describeState.ts` is never read by `evaluate.ts` or any
grading path, so no answer/tolerance/grading changed anywhere.

### Gate: test updates

- **`src/components/widgets.barData.s317.test.tsx`** (12 → 15 tests). The main render-accessibility
  test now branches on `bar.valueLabels`: `"all"` mode keeps every prior assertion unchanged;
  `"none"` mode asserts NO `bar-chart-value` text anywhere (SVG or aria's flat `"category: value"`
  fact) and requires `gridline`/`baseline` wording in the aria-label. Three new tests: a disposition
  pin (`md-03-02/i1`+`ch1` are `"none"`, every other declared step is `"all"`), a dedicated
  leak-check computing the exact expected position sentences for `i1`/`ch1` and asserting the flat
  fact never appears, and a `barDataParts` unit test for `valueLabels` default-resolution
  (`"all"` when absent, preserved when authored `"none"`).
- **`src/lib/content.barData.s317.test.ts`** (16 → 20 tests). One new corpus-contract test pins the
  `valueLabels` disposition again independently (mirroring the render-gate's pin, so a drift in
  either file alone is caught) and — for every declared step OUTSIDE the two `"none"` locations —
  independently re-derives that every value the chart draws is already a numeral written somewhere
  else in that step's own widget JSON (prompt or item labels), with `barData` itself stripped out of
  the search haystack first so the check cannot pass vacuously against its own data block. Three new
  tests exercise `describeWidgetState`'s `scatterFit` case directly against `bv-05-03`'s own
  signed-off numbers (`m=1.9, b=1.5` → residuals −0.4/+0.7/−0.2/−0.1, MSE≈0.175, under tolerance
  0.176) plus a near-identical poor-fit case (`m=0, b=0`) that must report "above" the tolerance —
  every expected string is recomputed independently from `spec.points` in the test itself, not
  copy-pasted from `describeState.ts`.
- No pre-existing `describeState*` test file covered `scatterFit`; per task instruction, coverage
  was added to `content.barData.s317.test.ts` instead of creating a new file.

## Round 2 gate results (verbatim)

```
$ npx vitest run src/components/widgets.barData.s317.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  1 passed (1)
      Tests  15 passed (15)

$ npx vitest run src/lib/content.barData.s317.test.ts
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  1 passed (1)
      Tests  20 passed (20)

$ npx vitest run describeState
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  2 passed (2)
      Tests  39 passed (39)

$ npx vitest run src/lib/content.plotData.s237.test.ts src/components/widgets.coordinateGraphs.s249.test.tsx
 RUN  v4.1.10 /home/user/maggies-trail
 Test Files  2 passed (2)
      Tests  60 passed (60)

$ npx tsc --noEmit
(no output — clean)

$ npm run validate:content
...
schema: 1840/1840 files clean
```

### Round 2 fail-closed items

None. Both REVISEs were narrow, disclosed defects with a clear fix inside this round's owned files;
no new ambiguity, missing standard, or judgment call was encountered.

### Round 2 files touched

- `src/lib/schema.ts` — `BarDataSpec.valueLabels` (optional `"all" | "none"`) added;
  `barDataParts`'s return type/resolution extended to include it. No existing field, export, or
  branch removed or altered.
- `src/components/widgets.tsx` — `ordinalWord`/`barGridlinePosition` helpers added;
  `BarChartFigure` branches on `valueLabels` to omit per-bar value text and switch the aria-label's
  per-bar clause to a position sentence in `"none"` mode. `ScatterFitW` untouched this round (its
  round-1 fix already satisfied the SVG half of the reopenCondition).
- `src/lib/describeState.ts` — `scatterFit` case extended with residual/MSE-metric text, mirroring
  `ScatterFitW`'s own wording; `value === null` branch untouched.
- `content/courses/measurement-data/lessons/md-03-02.json` — `"valueLabels": "none"` added to `i1`
  and `ch1`'s `barData` blocks only.
- `src/components/widgets.barData.s317.test.tsx` — updated (12 → 15 tests).
- `src/lib/content.barData.s317.test.ts` — updated (16 → 20 tests).
- `reports/closure/S317_SCATTERFIT_BARDATA.md` — this section.
- `reports/closure/cowork-staging/laneE-s317-engineering.jsonl` — 2 new NDJSON evidence lines
  appended (round 2 records reference their round-1 `priorRecordRef`).

Not touched this round (out of ownership, correctly): `content/courses/measurement-data/lessons/
md-03-03.json` (independently re-verified non-leaking, no change needed), `src/lib/evaluate.ts`,
`src/components/figures.tsx`, `src/components/figureIds.ts`.
