# Graph and figure labeling audit — S252

Source hash: `f1ca36f686cf4e7c34242ffdec4d3b75aff24c876cb448e59c71481139a0fd32`. Generated deterministically from renderer source, the complete figure registry, authored lessons, and generator declarations. `REVIEW` means static proof is impossible; it is not a pass or violation.

## Exact inventory

- 59 normative graph/statistical widget types; 59 renderer definitions resolved.
- 2031 total registered figures; 215 graph/statistical figures classified; 215 renderer definitions resolved.
- 1701 lesson files; 1975 authored/remedial graph consumers.
- 17 graph-emitting generator tags; 24 generator-to-surface declarations.
- 2192 renderer/rule checks: NOT_APPLICABLE 200, PASS 1196, REVIEW 274, VIOLATION 522.
- 522 statically proved violations compressed into 294 root-cause portfolios.

## Violations

By rule: grid 127, labels 12, origin 148, ticks 235.

By display type: bar_chart 15, box_plot 4, coordinate_graph 404, dot_plot 10, histogram 1, line_graph 3, number_line 66, scatter_plot 19.

By severity: MAJOR 383, MINOR 139.

## Gate

Run `npx tsx scripts/audit/graph-figure-labeling-inventory-s252.mts --check`. The gate verifies exact registry/scope floors, one-to-one consumer assignment, renderer dispatch coverage, and byte-for-byte source-current artifacts.
