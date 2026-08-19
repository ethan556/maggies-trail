# S273 — Conditional Probability Source Implementation

## Boundary

Course-local P0 repair for `content/courses/conditional-probability`. No shared renderer, figure registry, schema, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact visual dispositions

- `cpr-02-03/remedials.0.concept` retains `cpr-table-union`. The repaired remedial now explicitly states the diagram’s exact `100 + 110 − 40 = 170` of `200` contract and its `0.85` result.
- `cpr-03-03/c1` retains `cpr-multiplication-area`: its source already states the exact figure contract, `0.5 × 0.4 = 0.20`, with bus riders and sport conditional on bus.
- `cpr-05-03/c2` fail-closes `cpr-count-prob-bars`. That illustration is an exact `5 red, 3 blue, 10/56 all-red` model for `c1`, not the `c2` girls/boys split and complement strategy. The exact `c1` binding remains.

This closes all three source-verifiable P0 illustration rows without representing a fixed example as a different learner scenario.

## Guard and regression

`scripts/session/s273-conditional-probability-course-repair.mjs` is guarded and idempotent: it only rewrites the known legacy remedial body, only removes the named unrelated `c2` binding, and verifies both retained exact figures. `src/lib/session273.conditionalProbabilityCourse.test.ts` checks the three visual decisions and validates every current course lesson through schema and pedagogy.

Generic disposition rows remain independent-assessor work and are not self-closed.


## Evidence seal

Current course source seal: `a2de44d46f885a4ccd57620fd39ddee184930f5947e49983fedd2aa29b3d086f` across 16 lesson JSONs. The guarded repair was run twice (write, then no-op). Focused regression, full schema validation, pedagogy lint, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check pass.
