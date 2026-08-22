# S279 — Coordinate Geometry Source Implementation

## Boundary

Course-local P1 source repair for `content/courses/coordinate-geometry`. No shared renderer, figure registry, schema, queue, review-card, cache, ledger, or standards artifact is changed.

## Exact closures

- `CHOICE-0008` (`cg-03-02/k2`): preserves option IDs, the sole correct answer, and diagnostic feedback while bringing all three option labels into parallel length. The distractors now explicitly represent the "at least one pair" convention and irrelevant-side-length misconceptions without making either option a writing clue.
- `PROGRESSION-cg-01-02` (`cg-01-02/k3`): preserves `pointSetReasoningLab`, numeric answer mode, `axisDistance` task, points, required explorations, errors, and answer. It now asks learners to audit a classmate's vertical-distance claim from the evidence rather than repeat the preceding horizontal-distance calculation as another bare computation.

The remaining generic lesson, visual-sufficiency, language, and human-disposition work remains assessor-controlled.

## Guard and regression

`scripts/session/s279-coordinate-geometry-course-repair.mjs` applies only the named exact source transitions and refuses unexpected states. `src/lib/session279.coordinateGeometryCourse.test.ts` verifies evaluator/answer-option stability, the distinct progression job, and schema/pedagogy across all current course lessons.


## Evidence seal

Current source seal: `d7b711e52e223561b7d5bbe6bc15968ce866d77d7d5d4fd63a4c066e658de704` across 10 lesson JSON files. The guarded repair ran twice (write, then no-op). Focused regression, content validation, pedagogy lint, strict CML lint, CML integration, TypeScript, scoped ESLint, and diff check passed.
