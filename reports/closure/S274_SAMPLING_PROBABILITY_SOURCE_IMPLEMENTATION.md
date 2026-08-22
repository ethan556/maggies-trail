# S274 — Sampling and Probability Source Implementation

## Boundary

Course-local P0 repair for `content/courses/sampling-and-probability`: 15 lessons and three source-verifiable P0 root causes. No shared runtime, schema, figure registry, queue, review-card, cache, ledger, or standards artifact is changed.

## Closed P0 causes

- `sp-03-02`: its final trial-probability calculation becomes a three-way evidence match: observed frequency, theoretical probability, and the difference between them.
- `sp-04-01`: the repeated outcome-count sequence becomes branch construction, multiplication-plan selection, an explanation of repeated binary branching, and a multi-context outcome match.
- `sp-04-02`: the repeated heads/even and double-die entries become a compound-event match, an asymmetric `1/6 × 1/3 = 1/18` calculation, and a multiple-of-three transfer decision.

All lesson and step IDs stay stable. New answer surfaces have a single correct answer or explicit pair map, with misconception feedback retained at the evaluator boundary.

## Guard and regression

`scripts/session/s274-sampling-probability-course-repair.mjs` recognizes every legacy evaluator before replacement and is idempotent (0 or 8 writes). `src/lib/session274.samplingProbabilityCourse.test.ts` asserts the distinct jobs, answer contracts, widget integrity, schema parsing, and pedagogy across the entire course.

Generic disposition rows remain independent-assessor work and are not self-closed.


## Evidence seal

Current course source seal: `d0979917376f48efb1ca38907190ad65df6a1410400109066492c506483c49e4` across 15 lesson JSONs. The guarded repair was run twice (8 writes, then 0). Focused regression, full schema validation, pedagogy lint, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check pass.
