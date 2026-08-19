# S260 SVG and question-stem clipping hardening

## Scope

This packet hardens the shared figure surface used by lesson concepts and question-stem figures. It addresses labels that could be clipped or disappear when SVG text is replaced with KaTeX, when a figure is rendered at a narrow viewport, or when browser zoom increases the painted label size. It does not change lesson evaluator targets, stable IDs, authored mathematics, or the separately owned number-line semantics.

## Root causes and repairs

1. `SvgLatexSurface` previously sized each `foreignObject` from the pre-KaTeX SVG `getBBox()`, then hid the source `<text>` before proving that the larger rendered KaTeX label fit. The surface now inserts the overlay first, measures meaningful rendered HTML dimensions, expands and clamps the overlay inside a padded viewBox, and hides the source only after the fit succeeds. If the fit cannot be proven, the overlay is removed and the original accessible SVG label remains visible.
2. Shared concept-stage and stepped-reveal wrappers could clip otherwise valid SVG overflow. The shared SVG surface is now responsive (`height:auto`, `max-width:100%`) with visible overflow; concept stages and the affected reveal wrapper no longer hide figure labels.
3. The old static audit did not account for anchored `tspan` labels or SVG transforms, leaving 135 numeric labels unaudited. The S260 scanner resolves text anchors, leaf tspans, and translate/scale/rotate/skew/matrix transforms. It now audits every numeral-bearing label in the registry.
4. `scatterFit` exposed point values only in its SVG accessibility name. A concise visible point inventory now gives visible/ARIA data parity for all 14 authored/remedial consumers.

## Evidence

| Measure | Before | Current |
|---|---:|---:|
| Registered SVG render samples | 1,970 | 1,970 |
| Measured numeral-bearing boxes | 4,259 | 4,397 |
| Unaudited numeric labels | 135 | 0 |
| Malformed or missing viewBoxes | 0 | 0 |
| Non-number-line source-coordinate overruns | 261 | 260 |
| Shared learner-stage clipping surfaces in scope | 3 | 0 |
| `scatterFit` visible/ARIA parity failures | 1 family / 14 consumers | 0 |
| Exact RNO browser placements at 360 px | 4 scoped | 8 green |
| Exact RNO browser placements at 360 px and 200% zoom | 4 scoped | 8 green |

The 260 source-coordinate overruns are not claimed as reauthored. They remain bounded source debt, protected at runtime by the enforced responsive, overflow-visible SVG and stage contract. Any growth beyond the pinned ceiling fails the corpus ratchet. Number-line figures are excluded from this source-overrun assertion because the concurrent S260 number-line lane owns their axis and arrow semantics; that lane separately reported 502/502 authored number-line consumers green after repairing 12 shared landing-label clips.

The browser proof loads `rno-01-01/c1`, `rno-01-01/c2`, `rno-02-01/c1`, `rno-02-02/c1`, `rno-02-02/c2`, `rno-02-03/c3`, `rno-04-02/c1`, and `rno-04-02/c2` at a 360-pixel viewport at both 100% and 200% zoom. It also verifies the exact signed operands/results and the intended movement or rewrite direction against visible text, SVG title/ARIA, and direction metadata. For every painted SVG or KaTeX label it checks the real browser client rectangle against the concept stage, viewport, and clipping ancestors. It also asserts no horizontal page overflow and no actionable console or page errors. A known Next development-only nonce hydration diagnostic is isolated from runtime/figure errors; the test still fails every other browser error.

## Regression authority

- `src/components/math/SvgLatexSurface.test.tsx`: ordinary labels, four notation families, all viewBox edges, post-KaTeX expansion, and fail-visible fallback.
- `src/components/figureViewportParity.s260.test.tsx`: exhaustive registry scan with zero unaudited numerals plus shared routing/CSS ratchets.
- `src/components/widgets.coordinateGraphs.s249.test.tsx`: all 87 `scatterFit`/`plotPoint` consumers, including visible/ARIA point parity.
- `e2e/s260-rno-svg-clipping.spec.ts`: sixteen real-browser cases covering eight exact placements at normal and 200% zoom.

## Residual inventory

- Reauthor the 260 bounded non-number-line source-coordinate overruns over time so labels fit intrinsically even without the runtime safety surface.
- A full browser traversal of all 1,970 registry figures is still impractical in one CI job; the exhaustive static proof and exact high-risk browser canaries divide that assurance without leaving any numeric label unaudited.
- Current unrelated figure-quality gates identify a small `g3w` word-problem font/collision packet and a stale figure-count expectation in the older adversarial audit. Those are not clipping regressions introduced by this packet.
