# S249 shared coordinate-graph renderer packet

## Boundary and authority

This packet repairs the complete current authored/remedial consumer authority for the two assigned shared engines. Counts are measured directly from every lesson step plus remedial concept/check surface under `content/courses/*/lessons`.

| Engine | Before | After with convention contract | Remaining in this engine |
|---|---:|---:|---:|
| `scatterFit` | 14 | 14 | 0 |
| `plotPoint` | 73 | 73 | 0 |
| **Bounded packet** | **87** | **87** | **0** |

No lesson, evaluator, stable ID, queue, card, cache, ledger, standards file, landing surface, or number-line renderer was changed.

## Root-cause repairs

### `scatterFit`

- Added conventional minor and major graph-paper layers with distinct visual hierarchy.
- Put tick strokes on the actual horizontal and vertical axes rather than detached frame edges.
- Kept authored window endpoints visible, injected zero when it lies in a scale, and prints the two-axis origin once.
- Added positive-direction arrowheads and retained a responsive SVG `viewBox`.
- Added optional `title`, `xAxisLabel`, and `yAxisLabel` schema fields. Unit-bearing names such as `Time (days)` or `Height (cm)` are supported; safe fallbacks are `Scatter plot with line of fit`, `x`, and `y`.
- Made title and axis names visible without placing long labels outside the SVG.
- Expanded the accessible image description to state the title, both named ranges, every plotted point, and the current fitted-line equation. This makes the nonvisual data equal to the visible data rather than merely saying that a scatter plot exists.
- Clamped the post-verdict `best fit` label inside the view box.
- Preserved slope/intercept state, drag geometry, residual scoring, tolerance, feedback, and all evaluator behavior.

### `plotPoint`

- Added responsive minor and major graph-paper layers aligned to the existing single track source.
- Major graph lines cross at the same centers where learner point marks appear; the line-through-targets overlay remains aligned to those centers.
- Added axes, ticks, and positive-direction arrowheads without adding or removing any target button.
- Retained all existing endpoint numerals and the established single origin rule for numeric 1-to-N lattices.
- Added optional `title`, `xAxisLabel`, and `yAxisLabel` fields with safe fallbacks (`Coordinate plotting grid`, `x`, `y`).
- Added visible title and axis captions outside the compact tap lattice so labels are not clipped and study space remains available.
- Added an accessible group description containing title, both complete scales, and the currently marked points. Individual cell names remain unique and continue to use the exact visible label pair.
- Preserved 1-based evaluator coordinates, target order, x/y-reversal evidence, ghost targets, connect-target behavior, stable IDs, and button count.

## Deterministic evidence

`src/components/widgets.coordinateGraphs.s249.test.tsx` walks the full 87-surface authored/remedial authority and pins:

- exact consumer counts (14 + 73);
- schema parsing and optional metadata support;
- major/minor graph paper, axes, ticks, arrowheads, endpoint numerals, responsive view boxes, and single-origin behavior;
- every scatter point in the accessible description;
- full plotPoint scale/marked-state parity and unique cell names;
- unchanged target arrays, evaluator dimensions, and scatter tolerance;
- no learner-visible or accessible caret notation.

Legacy evaluator, drag, keyboard, reveal, tone, axis, and plot-layout ratchets also pass for both assigned renderers.

## Verification

- TypeScript: `pnpm exec tsc --noEmit` — pass.
- New exhaustive + stable-contract suite: 8 files, 397 tests — pass.
- Scatter/plot targeted axis, caption, post-interaction, and keyboard gates — pass (8 active assertions; unrelated assertions skipped by name filter).
- Targeted ESLint and `git diff --check` — pass.

The unfiltered legacy batch still contains pre-existing failures outside this bounded packet: the known Argand 3-versus-5-label expectation and statistical-display bar/box layout/accessible-name assertions. No failure names `scatterFit` or `plotPoint` after this repair.

## Exact residual

The next graph-standard lane is intentionally untouched:

| Engine | Current authored/remedial consumers |
|---|---:|
| `numberLinePlace` | 63 |
| `numberLineHop` | 430 |
| **Residual** | **493** |

Lesson-level semantic axis authoring also remains optional: current consumers receive truthful `x`/`y` fallbacks until a separately authorized content-authoring pass supplies domain-specific titles and units.
