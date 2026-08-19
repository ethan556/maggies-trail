# S263 Multistep Grade 4 P0 Repair

## Scope and authority

This packet audits and repairs all eight current lessons in `multistep-g4`. The source-derived baseline contains 24 P0 rows: 16 `ILLUSTRATION_REPLACEMENT` rows and eight `LESSON_PROGRESSION_AND_DUPLICATION` rows.

Only the eight course-local lesson JSON files are changed. The packet does not update the queue, review cards, cache, closure ledger, standards evidence, figure registry, shared schema, or shared runtime. Current deterministic course seal: `0274b6664f891de81b87b4ce9b23e502ae61f55f1135ec88c33bf6781f58584d`.

## Source-compatible result

| Cause | Baseline | Closed in source | P0 residual |
| --- | ---: | ---: | ---: |
| Illustration replacement | 16 | 16 | 0 |
| Progression and duplication | 8 | 8 | 0 |
| **Total P0** | **24** | **24** | **0** |

## Semantic visual replacements

Every generic `count-on-hops` concept placement is replaced by an existing registered figure whose rendered title and accessible semantics agree with the synchronized body and narration.

| Placement | Registered figure |
| --- | --- |
| `g4s-01-01/c1` | `mb-multistep` |
| `g4s-01-01/c2` | `g3w-subtract-once` |
| `g4s-01-02/c1` | `two-step-bar` |
| `g4s-01-02/c2` | `dop-word-expr` |
| `g4s-01-03/c1` | `mb-times-compare` |
| `g4s-01-03/c2` | `mb-more-vs-times` |
| `g4s-02-01/c1` | `mb-remainder` |
| `g4s-02-01/c2` | `dop-remainder` |
| `g4s-02-02/c1` | `ee-variable` |
| `g4s-02-02/c2` | `ee-mult-div-solve` |
| `g4s-02-03/c1`, `g4s-02-03/c2` | `mult3-estimate` |
| `g4s-03-01/c1`, `g4s-03-01/c2` | `mult3-estimate` |
| `g4s-03-02/c1` | `mb-multistep` |
| `g4s-03-02/c2` | `two-step-bar` |

The aggregate regression server-renders every binding and checks its `<title>`, `role="img"`, and live figure/text-alignment contract. Remedial concept text and figures are synchronized to each lesson's second concept.

## Progression closures

All eight P0 root causes now contain a distinct learner job instead of replaying the first interactive payload:

- `PROGRESSION-g4s-01-01`: construct the initial and remaining running totals rather than rebuilding identical equal groups.
- `PROGRESSION-g4s-01-02`: work backward from the final total to determine the missing third adjustment.
- `PROGRESSION-g4s-01-03`: contrast additive and multiplicative comparison outcomes from the same numbers.
- `PROGRESSION-g4s-02-01`: use backward hops to expose a remainder; the normalized challenge collision now applies the round-up rule in a distinct van context.
- `PROGRESSION-g4s-02-02`: verify a proposed letter value with an area model; the normalized check collision now solves `6 × n = 42` directly.
- `PROGRESSION-g4s-02-03`: use order of magnitude to reject `3,860`; the formerly repeated MCQ now diagnoses that place-value error.
- `PROGRESSION-g4s-03-01`: reverse rounding direction and quantify an underestimate rather than replaying the original overshoot.
- `PROGRESSION-g4s-03-02`: extend the bar plan from the built total to the quantity after the loss.

The regression checks exact prompt, number-normalized prompt, and complete widget-payload uniqueness for every queue-cited step. Widget types, step IDs, generator forms, correct option IDs, and evaluator behavior remain stable.

## Truth repair

The former universal statement that a misplaced digit “is wrong by a factor of ten” is replaced by a bounded claim: an answer in a much larger place-value range fails the estimate check. The estimate lessons now distinguish what an estimate proves about magnitude from the exact computation itself.

## Verification

- Idempotent repair check: `CURRENT`; 16 truthful bindings, eight progression causes repaired, zero P0 residuals.
- Focused current-source and pre-existing independent suites: two files, 18 tests passed.
- Full content schema validation: passed.
- Full pedagogy audit: 1,711 of 1,711 lessons clean.
- Strict CML: zero errors and zero warnings.
- Whole-repository TypeScript check: passed.
- Scoped ESLint: passed.
- Scoped diff check: passed at handoff.

## Authority boundary

This is source-compatible evidence for all 24 P0 rows. It does not self-close or mutate the authoritative queue and does not claim the 24 P1 language, visual-first, or complete-lesson disposition rows; those remain assessor-controlled.
