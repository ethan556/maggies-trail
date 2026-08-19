# S260 number-line direction and clipping audit

## Scope and authority

- Parsed every lesson JSON and rendered all 502 runtime number-line consumers: 63 `numberLinePlace`, 430 `numberLineHop`, 4 `numberLineRay`, and 5 `doubleNumberLine` surfaces.
- Reconciled the authoritative graph-labeling inventory: all 49 figures classified as `number_line`, plus 6 newer rational-number figures not present when that inventory was generated. These 55 IDs have 438 current authored bindings across 51 bound IDs.
- Continuing axes are distinguished from mathematically bounded scales. Probability `[0,1]`, fixed fraction intervals, finite data-display domains, correlation `[-1,1]`, and ruler/interval depictions do not receive misleading continuation arrows. Directional hops, changes, rays, and distance arrows remain mandatory on either class.

## Root-cause repairs

- Added marker-ID-free `NumberLineAxis` and `NumberLineDirectionHead` primitives with inset heads, stable test hooks, and explicit left/right metadata.
- Repaired all runtime renderers at their shared roots. This supplied conventional axis ends to the paired number-line and ray renderers, removed global SVG marker IDs, retained evaluator/ARIA contracts, and fixed 12 observed `landing` labels that clipped at the right viewBox edge.
- Repaired the shared static `IntLine` root. Every registered consumer (`rno7-add-same-line`, `rno7-add-diff-line`, `rno7-zero-pair`, and `rno7-change-line`) now has a continuing axis and one visible direction head per jump, including leftward negative changes.
- Added explicit direction heads to both elapsed-time jumps and all four non-zero MAD distance arrows. Restored direction semantics to the RNO change figures and retained the existing integer, inequality, solution-ray, counting, skip-counting, and addition/subtraction arrows.
- Reduced the one clipped rational-number title without changing its wording. Numeric-label bounds are checked in viewBox units, which remain invariant under narrow responsive layouts and 200% zoom-equivalent SVG scaling.

## Evidence

- `number-line-direction-inventory-s260.mjs`: PASS; 502 runtime consumers, 49 inventory figures, 6 supplemental figures, 438 bindings, 0 invalid lesson JSON.
- `widgets.numberLineDirection.s260.test.tsx`: renders all 502 authored runtime consumers and checks axes, heads, direction/ARIA parity, stable viewBoxes, and numeric-label bounds.
- `figures.numberLineDirection.s260.test.tsx`: checks every arrow-required static family, all shared `IntLine` consumers, marker uniqueness, accessible direction language, and clipping.
- Legacy number-line and ray regressions remain green. The source-derived fraction-denominator ratchet is 16; the combined legacy Place/Hop authority remains 493.

## Residuals

No known direction, number-label clipping, ARIA-direction, marker-collision, or malformed-viewBox defect remains in the audited runtime/static number-line surfaces. General non-number-line figure labeling and collision queues remain owned by their separate graph-labeling programme.
