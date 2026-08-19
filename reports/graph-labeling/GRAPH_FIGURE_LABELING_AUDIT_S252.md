# Graph and figure labeling audit — S252

Source hash: `f7382cac07f01e83562c324ccf95e694ef1d1751c9ebdfd22931f50e4f3dd5f6`. Generated deterministically from renderer source, the complete figure registry, authored lessons, and generator declarations. `REVIEW` means static proof is impossible; it is not a pass or violation.

## Exact inventory

- 59 normative graph/statistical widget types; 59 renderer definitions resolved.
- 1974 total registered figures; 205 graph/statistical figures classified; 205 renderer definitions resolved.
- 1701 lesson files; 2166 authored/remedial graph consumers.
- 17 graph-emitting generator tags; 24 generator-to-surface declarations.
- 2112 renderer/rule checks: NOT_APPLICABLE 188, PASS 1171, REVIEW 252, VIOLATION 501.
- 501 statically proved violations compressed into 293 root-cause portfolios.

## Violations

By rule: grid 123, labels 7, origin 144, ticks 227.

By display type: bar_chart 15, box_plot 5, coordinate_graph 388, dot_plot 10, histogram 1, line_graph 3, number_line 60, scatter_plot 19.

By severity: MAJOR 371, MINOR 130.

## Gate

Run `npx tsx scripts/audit/graph-figure-labeling-inventory-s252.mts --check`. The gate verifies exact registry/scope floors, one-to-one consumer assignment, renderer dispatch coverage, and byte-for-byte source-current artifacts.
