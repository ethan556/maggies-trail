# S261 data-graphs-g1 source implementation

Baseline: 64 rows (24 P0, 40 P1) across 12 clean lessons.

All 24 P0 illustration rows shared `bar-compare`, a hard-coded 9-versus-5 comparison model. It was reused beside survey questions, category sorting, tallies, picture graphs, bar-graph construction, totals, extrema, and claims. No exact registered course figure set exists, so the misleading bindings were fail-closed without changing text, IDs, evaluators, answers, remedials, or feedback.

Queue-compatible result: 24 illustration rows closed; 40 residual rows retained—36 generic assessor-controlled lesson/visual/language decisions and 4 choice-surface reviews. The repair is guarded and idempotent; shared runtime, registry, schema, queue, cards, cache, and ledgers are unchanged.
