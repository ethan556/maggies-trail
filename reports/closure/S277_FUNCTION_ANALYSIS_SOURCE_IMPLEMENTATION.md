# S277 — Function Analysis Source Implementation

## Boundary

Course-local P0 visual-truth repair for `content/courses/function-analysis`. No shared renderer, figure registry, schema, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact disposition

- `fna-05-03/c1` fail-closes `fna-inverse-reflection`. The registered visual is a fixed reflected pair, `f(x) = 2x + 6` and `f⁻¹(x) = (x − 6)/2`, with points `(0, 6)` and `(6, 0)`. The source instead establishes the generic inverse proof through both compositions, `f(g(x)) = x` and `g(f(x)) = x`, on the right domains. No registered figure represents that exact proof, so retaining the fixed reflection would substitute an unrelated exemplar for the learner-visible claim.

This closes the sole source-verifiable P0 illustration row without presenting a fixed example as a proof of all inverse pairs. Generic lesson, visual-sufficiency, language, P1 choice, and progression dispositions remain independently assessed.

## Guard and regression

`scripts/session/s277-function-analysis-course-repair.mjs` removes only the named mismatched binding and verifies the retained inverse-proof contract. `src/lib/session277.functionAnalysisCourse.test.ts` guards the disposition and checks schema/pedagogy across all current course lessons.


## Evidence seal

Current source seal: `a2ddf670e50810b3ffd1a844bc83059f4b0aa8d9e48c4ba02abb8b0da82b7f99` across 16 lesson JSON files. The guarded repair ran twice (write, then no-op). Focused regression, content validation, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check passed. The final global pedagogy run is currently blocked only by concurrent out-of-bound source `content/courses/add-subtract-20/lessons/as-04-01.json` (s-04-01/c2 is 28 words; maximum 25) and must be rerun after that independent repair settles.
