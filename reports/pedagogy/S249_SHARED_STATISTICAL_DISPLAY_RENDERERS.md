# S249 shared statistical-display renderer repair

Status: **bounded implementation complete; focused gates green**
Date: 2026-08-18
Scope owner: ChatGPT Work shared graph/statistical-display lane

## Outcome

This batch audited 712 authored main/remedial consumers across the requested shared display types and repaired the broadest coherent statistical-display boundary: 132 `graphRead`, `barBuilder`, `dotPlot`, and `boxPlot` consumers. It changes shared renderers and optional schema vocabulary only. No lesson JSON, landing page, queue, card, cache, ledger, commit, push, or deployment was touched.

The implementation follows `C:\Users\Amusa\Downloads\FIGURE_LABELING_PROMPT.md` and the WCAG 2.1 AA accessibility-review checklist. Visible data, axis furniture, and accessible names now derive from the same live widget state. Native range/button controls remain the keyboard paths and retain 44px targets.

## Exact consumer inventory

| Renderer | Main | Remedial | Total | Disposition in this batch |
|---|---:|---:|---:|---|
| `graphRead` | 33 | 1 | 34 | Repaired |
| `barBuilder` | 71 | 0 | 71 | Repaired |
| `dotPlot` | 21 | 0 | 21 | Repaired |
| `boxPlot` | 6 | 0 | 6 | Repaired |
| `scatterFit` | 14 | 0 | 14 | Audited; deferred |
| `plotPoint` | 68 | 5 | 73 | Audited; evaluator migration required |
| `numberLinePlace` | 63 | 0 | 63 | Audited; deferred |
| `numberLineHop` | 420 | 10 | 430 | Audited; deferred |
| **Total** | **696** | **16** | **712** | **132 repaired; 580 explicit residual** |

Repaired-mode breakdown:

- `graphRead`: 12 bar, 19 picture, 3 tally.
- `barBuilder`: 59 ordinary bar, 1 histogram, 7 pictograph, 4 tally.
- `dotPlot`: 11 build, 10 read.
- `boxPlot`: 6.

## Root-cause repairs

### `graphRead`

- Separates answer-choice values from bar-grid steps.
- Scaled bar ticks now print `step × unitValue`; a bar worth 15 can no longer stop at a tick labelled 3.
- Adds a true zero-based value axis, aligned gridlines, tick strokes, a visible figure title, category label, value-axis title, and live data/ARIA parity.
- Adds a visible pictograph key using the authored icon, scale, and singular/plural noun.

### `barBuilder` and histogram

- Adds visible titles, x/y axis titles, a y-axis line, a zero baseline, tick strokes, and different weights for major/minor ruled lines.
- Major tick selection uses the existing 1–2–5 `niceTicks` ladder and retains endpoints.
- Removes the white histogram stroke so bins genuinely touch.
- Converts the live inclusive integer-bin authoring (`0–9`, `10–19`, …) into shared edge ticks (`0`, `10`, `20`, …) while leaving ordinary categorical labels centered under separated bars.
- Adds visible titles for tally/picture modes and a visible one-icon key for all seven pictograph consumers.
- Accessible names now state both axis meanings and every current category/value pair.

### Dot/line plots

- Read mode gains one tick and ruled value column per authored position, a visible title, an axis title, and stateful accessible text using the same fraction formatter as the drawing.
- Build mode gains a ruled, ticked, double-arrow number line, visible title/axis label, and exact visible/ARIA count parity.
- Build mode now uses `dotPlotLabel` everywhere, closing the live fractional-build defect for `mc-05-02/i1`, `mc-05-03/i1`, and `md-03-04/i1`; the stale S241 ban was replaced by a positive shared-formatter gate.

### Box plots

- Replaces the three-floating-numeral scale with a 1–2–5 ticked/numbered number line and aligned ruled lines.
- Adds double arrowheads, a visible axis title, and five non-overlapping leader labels anchored to the exact minimum, Q1, median, Q3, and maximum positions.
- Uses standard visible and accessible vocabulary. Control names are prefixed with `set` so image and slider names remain distinguishable under the repository ARIA collision gate.

## Accessibility assessment

Standard: WCAG 2.1 AA, bounded to repaired renderers.

| Finding | Criterion | Before | After |
|---|---|---|---|
| Statistical structure not consistently encoded in the drawing | 1.3.1 | Missing axes/ticks/keys or loose numerals | Titles, axes, ticks, grids, keys, and landmark leaders encode structure |
| Figure names omitted current data or used different value semantics | 1.1.1 / 4.1.2 | Scaled bar and fractional-build divergence | Accessible names use the same derived values/formatters as visible marks |
| Image and control names collided on box plots | 4.1.2 | Standard terms made the image indistinguishable from sliders | Controls say “set …”; image remains a complete standard summary |
| Keyboard path | 2.1.1 | Native controls present | Preserved; no pointer-only interaction introduced |
| Target size | 2.5.5 | 44px buttons/range paths present | Preserved |

No new contrast claim is made; colors and opacity tokens remain the established shared palette. Manual NVDA/VoiceOver and 200% zoom checks remain release-level work.

## Verification

- `npm run typecheck` — PASS.
- Focused renderer/accessibility/integrity suite — PASS: 5 files, 187 tests.
- Expanded S249 corpus test — PASS: 9 tests covering every one of the 132 repaired authored/remedial consumers plus a scaled-bar canary.
- Targeted ESLint — PASS with zero errors; repository-pre-existing warnings remain. Two batch-created unused-variable warnings were removed before handoff.
- `git diff --check` — required after this report is added.

## Explicit residuals and blockers

1. **Context-specific lesson titles and units:** optional `title`, `axisLabel`, and `valueAxisLabel` fields now exist only for the four repaired contracts, but this batch does not edit lesson JSON. Current consumers therefore use truthful generic fallbacks where no contextual vocabulary is authored. Exact course-language/unit enrichment is a separate content batch.
2. **Histogram schema:** the single live histogram uses contiguous inclusive integer ranges, which can be converted deterministically to shared edges. Decimal, unequal, or differently inclusive bins require an explicit `binEdges` and inclusion-convention schema before authoring.
3. **`plotPoint` (73):** its stable evaluator treats 1-based cells as coordinates. A conventional first-quadrant plane with a real 0 row/column cannot be added honestly without a versioned coordinate/evaluator migration; relabelling alone would change mathematical meaning.
4. **Number lines (493):** `numberLinePlace` still withholds fractional interior labels in some teaching modes, and the shared number-line families do not uniformly draw continuation arrowheads at both ends. This high-volume lane should be a dedicated follow-up because label collision, answer-leak policy, hop structure, and 430 existing `numberLineHop` consumers must be reconciled together.
5. **`scatterFit` (14):** it already has numbered axes and graph paper, but context-specific variable/unit titles and a fully enumerated point/range accessible description remain. Coordinate-graph changes should be consolidated with the broader axis-caption family rather than patched only here.
6. **Unrelated gate observed:** `widgets.axisFurniture.s241.test.tsx` currently expects exactly three Argand-axis labels, while live `cn-03-02/i2` renders five (`−15, −10, 0, 10, 15`). This packet does not touch Argand rendering or that assertion. The failure is stable and outside this lane; all directly affected gates are green.

## Reopen conditions

Reopen this packet if any repaired schema, renderer, tick/grid helper, fraction formatter, authored display mode/count, current histogram-bin convention, accessible-name collision rule, keyboard control, or graph-labeling policy changes.
