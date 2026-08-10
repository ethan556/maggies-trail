# WAVE 01 BASELINE — TRUTH AND RELEASE INTEGRITY

## Objective

Make one authored corpus produce one fail-closed product state, remove stale current-looking metrics,
unify the contradictory onboarding/placement path, and establish an honest release/security baseline
without modifying lesson mathematics.

## P0 evidence at entry

1. Direct corpus walk: **129 courses · 1,701 lessons · 15,621 steps**.
2. S218 manifest: **15,611 steps** and a `contentVersion` that could survive lesson-body changes.
3. S218 `PRODUCT_STATE.json`: **126 widgets · 11,910 tests/282 files · 71 Playwright executions,
   Session 135**, despite the S218 seal having 127 engines, 12,925/322, and 115/115.
4. S218 `CURRICULUM_INVENTORY.md`: **1,673 lessons · 15,359 steps**.
5. Grade 3 onboarding alone used a legacy 3-question comfort quiz while the current `/placement`
   architecture used a 12-item confidence-aware diagnostic.
6. Production homepage contained deliberately fictional/demo testimonials, contrary to launch
   social-proof integrity.
7. Full dependency/build/browser re-execution was unavailable because the checkout has no
   `node_modules`, the configured package registry is unavailable, and no matching dependency tree
   exists locally.

## Non-regression baseline

The last fully certified runtime remains S218: **12,925 Vitest tests / 322 files · engine
registration 127/127 · content proof 815/815 · hash proof 1,701/1,701 · Playwright 115/115 · build
0 · typecheck 0**. These values are historical evidence only; Wave 01 must not relabel them as a
current S219 run.

Full details: `CLOSURE_BASELINE.md`.
