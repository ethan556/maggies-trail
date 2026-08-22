# S278 — Lines & Angles Source Implementation

## Boundary

Course-local P0 visual-truth repair for `content/courses/lines-angles`. No shared renderer, figure registry, schema, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact disposition

- `la-04-02/c1` retains `la-symmetry-regular`: its square and equilateral triangle exactly support the claim that a regular shape has as many symmetry lines as sides.
- `la-04-02/c2` fail-closes that same visual. The source instead explains an unequal-sided rectangle: exactly two horizontal/vertical center lines, with diagonals that do not fold the shape onto itself. No registered figure depicts that exact rectangle-symmetry contrast, so a regular square and triangle would contradict rather than illustrate it.

This closes the sole source-verifiable P0 illustration row without implying that an unequal-sided rectangle has the four diagonal-inclusive symmetry lines of the displayed square. Generic lesson, visual-sufficiency, language, choice, and progression dispositions remain independently assessed.

## Guard and regression

`scripts/session/s278-lines-angles-course-repair.mjs` removes only the named mismatched binding while asserting the retained regular-shape use. `src/lib/session278.linesAnglesCourse.test.ts` guards both dispositions and checks schema/pedagogy across all current course lessons.


## Evidence seal

Current source seal: `93bfc57b80bf070fc4248671746aeba60d26b76879b5fd123b7263be43858c81` across 12 lesson JSON files. The guarded repair ran twice (write, then no-op). Focused regression, content validation, pedagogy lint, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check passed.
