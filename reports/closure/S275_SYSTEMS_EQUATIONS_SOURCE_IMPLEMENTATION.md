# S275 — Systems of Equations Source Implementation

## Boundary

Course-local P0 visual-truth repair for `content/courses/systems-equations`. No shared renderer, figure registry, schema, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact dispositions

- `se-02-02/c1` fail-closes `coordinate-plane`: the registered image is a fixed first-quadrant walk to `(3, 2)`, whereas the source teaches isolating `y` from `x + y = 7`. The image cannot honestly represent that symbolic substitution move.
- `se-03-03/c2` retains `se-scale-both`: the visible source exactly names `2x + 3y = 13`, `3x + 2y = 12`, the two scalings to `6x`, `5y = 15`, and solution `(2, 3)` displayed in the figure.

This closes both source-verifiable P0 illustration rows without changing the shared figure registry or presenting a fixed example as a different one.

## Guard and regression

`scripts/session/s275-systems-equations-course-repair.mjs` removes only the named mismatched binding and asserts the retained exact contract. `src/lib/session275.systemsEquationsCourse.test.ts` guards both visual decisions and checks schema/pedagogy across all 12 current course lessons. Generic dispositions remain independently assessed.


## Evidence seal

Current source seal: `1e703bdb68de2a6f10b54c2e2348b45aed43aee679eb42fe10fd5ba043feeb7c` across 12 lesson JSON files. The guarded repair ran twice (write, then no-op). Focused regression, content validation, pedagogy lint, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check passed.
