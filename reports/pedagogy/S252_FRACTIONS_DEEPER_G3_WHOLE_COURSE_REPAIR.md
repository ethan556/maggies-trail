# S252 Fractions Deeper G3 whole-course repair

## Outcome

This bounded portfolio repairs all source-controlled findings for the 14 lessons in `content/courses/fractions-deeper-g3` without changing evaluator IDs, answer correctness, shared widgets, schemas, or the figure registry.

| Measure | Before | After |
| --- | ---: | ---: |
| Authoritative course queue rows | 82 | 42 after serial regeneration |
| Withheld generic concept figures | 26 | 0 |
| Progression/duplication causes | 14 | 0 |
| Incorrect target-half feedback lines | 36 | 0 |
| Assessor-controlled review rows | 42 | 42 |

The source closure is exactly 40 rows: 26 `ILLUSTRATION_REPLACEMENT` rows and 14 `LESSON_PROGRESSION_AND_DUPLICATION` rows. The remaining 42 rows are the independent `GRADE_LANGUAGE_REVIEW`, `LESSON_COMPLETE_DISPOSITION`, and `VISUAL_FIRST_REPRESENTATION` decisions, one of each for every lesson. They are not source defects and are intentionally left for the assessor.

Course seal after repair: `d9b31b12bd4fabaa60ba71c1bdb1ebb7a7d1f361227c49ba5170bf62114844ab`.

## Semantic figure closure

Every concept placement now uses an existing registered fraction or number-line figure whose mathematical meaning agrees with the adjacent lesson text. No decorative or fabricated substitute was introduced.

| Lesson | Concept 1 | Concept 2 |
| --- | --- | --- |
| `g3f-01-01` | `frac-equal-vs-unequal` | `frac-equal-vs-unequal` |
| `g3f-01-02` | `frac-unit-fourth` | `thirds-compare` |
| `g3f-01-03` | `frac-three-fourths` | `frac-top-bottom` |
| `g3f-01-04` | `fm-fraction-of` | `fm-fraction-of` |
| `g3f-01-05` | `frac-numline-fourths` | `mc-ruler-eighths` |
| `g3f-02-01` | `frac-numline-fourths` | `frac-numline-unit` |
| `g3f-02-02` | `thirds-compare` | `thirds-compare` |
| `g3f-02-03` | `frac-equiv-half` | `fa-multiplier` |
| `g3f-02-04` | `frac-equiv-numline` | `frac-equiv-numline` |
| `g3f-02-05` | `frac-whole-disguise` | `frac-whole-disguise` |
| `g3f-03-01` | `frac-whole-disguise` | `frac-whole-disguise` |
| `g3f-03-02` | `frac-compare-wholes` | `frac-compare-same-denom` |
| `g3f-03-03` | `frac-compare-same-denom` | `frac-compare-same-numer` |
| `g3f-03-04` | `frac-top-bottom` | `frac-top-bottom` |

The two placements whose former prose was narrower than the available truthful model were synchronized explicitly: the fourths number-line exemplar in `g3f-02-01` teaches the transferable equal-jump method before thirds, and the `4/4 = 1` whole-disguise model in `g3f-02-05` is the base case used to reason that `8/4 = 2`.

All 28 concept placements render with an accessible SVG title and image role; the two figures in `g3f-01-01` were already semantic and remain so. There are no remaining `count-on-hops` placements in the course.

## Progression and mathematical truth

The second interaction in every lesson is now a misconception-repair job with a distinct prompt and starting state from the first interaction. Widget type, target, evaluator identity, answer correctness, step IDs, option IDs, and option correctness flags are preserved. Knowledge-check and challenge prompts are differentiated without changing the generator forms that the independent solver verifies.

Thirty-six fraction-bar feedback lines that incorrectly described non-half targets as “the target half” or “longer than half” now name the actual target fraction. The valid quarter-specific feedback remains mathematically explicit. No learner-visible false target-half statement remains.

## Reproduction and regression

The idempotent repair is captured in `scripts/audit/repair-fractions-deeper-g3-s252.mjs`. Its `--check` mode verifies that the course is current and emits the course seal above.

The aggregate regression `src/lib/session252.fractionsDeeperG3CourseIntegrity.test.tsx` checks all 14 lessons together: schema and pedagogy validity, widget integrity, exact semantic figure mapping and accessible rendering, absence of generic figures, progression uniqueness, remedial second interactions, evaluator correctness at the target, numeric correctness, and MCQ evaluator/option agreement.

Validation results:

- Focused regression: 3 files, 26 tests passed.
- Content schema: passed.
- Pedagogy lint: 1,711/1,711 lesson files clean.
- CML lint: 0 errors and 0 warnings.
- TypeScript typecheck: passed.
- Repository lint: 0 errors; 450 pre-existing warnings.
- Course diff check: passed.
- Repair idempotence: current, 0 files changed.

## Serial reconciliation

This portfolio deliberately does not edit the shared authoritative queue, cards, cache, ledgers, standards evidence, or graph-audit files. The parent serial regeneration should remove the 40 stale source-controlled rows and retain the 42 assessor-controlled decisions. No shared runtime change is required.
