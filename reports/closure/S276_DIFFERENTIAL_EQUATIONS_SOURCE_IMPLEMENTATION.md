# S276 — Differential Equations Source Implementation

## Boundary

Course-local P0 visual-truth repair for `content/courses/differential-equations`. No shared renderer, figure registry, schema, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact disposition

- `de-02-01/c1` fail-closes `dr-chain-gears`. The registered visual is a fixed chain-rule example: `du/dx = 3`, `dy/du = 5`, and `dy/dx = 15`. The source instead teaches separation of variables for `dy/dx = 2xy`, including `(1/y) dy = 2x dx` and `ln|y| = x² + C`. No registered figure represents that exact derivation, so retaining the unrelated fixed exemplar would be misleading.

This closes the sole source-verifiable P0 illustration row without misrepresenting a chain-rule example as a separation-of-variables derivation. Generic lesson, visual-sufficiency, language, and P1 choice dispositions remain independently assessed.

## Guard and regression

`scripts/session/s276-differential-equations-course-repair.mjs` removes only the named mismatched binding and verifies the retained mathematical contract. `src/lib/session276.differentialEquationsCourse.test.ts` guards the disposition and checks schema/pedagogy across all current course lessons.


## Evidence seal

Current source seal: `b69e0e5b9c2ebe972bbc1f4c7d5cbc69ee0d4bec15ad74883bf376727c7a3f62` across six lesson JSON files. The guarded repair ran twice (write, then no-op). Focused regression, content validation, pedagogy lint, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check passed.
