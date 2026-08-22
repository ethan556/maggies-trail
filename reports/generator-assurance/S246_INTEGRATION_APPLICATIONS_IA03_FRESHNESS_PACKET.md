# S246 integration applications `ia-03` freshness packet

## Scope and boundary

- Generator: `g13-integration-applications`
- Lesson: `ia-03-01`
- Consumers: 4 declared steps across 2 distinct forms
- Entry frontier: `ia-03-01.json/k1` -> `integration-applications__ia-average-value__numeric`
- Stop frontier: `lc-01-01.json/k1` in the untouched `g12-limits-continuity` generator

No lesson, standards, figure, queue, review-card, cache, or global generated-evidence file changed.

## Root cause and repair

The average-value forms previously resolved to undersized authored banks. This packet supplies twelve deterministic mathematical cases for each form while preserving the authored `numeric` and `mcq` response surfaces.

| Form | Mathematical job | Consumers | Prompt pool | Truth pool |
| --- | --- | ---: | ---: | ---: |
| `ia-average-value__numeric` | Compute a function average, locate its mean-value point, or find average velocity | 3 | 12 | 12 |
| `ia-average-value__mcq` | Select the integral expression divided by interval width | 1 | 12 | 12 |

The cases vary coefficients, powers, interval endpoints, velocity slopes, and intercepts. Numeric misconception values represent omitting interval-width division, dividing twice, treating the right endpoint as the mean-value point, or failing to take the required root. MCQ distractors omit the average-value factor, average endpoints for a nonlinear function, or divide by the square of the interval width.

## Independent truth contract

`calculusIndependent.cjs` parses only learner-visible prompt data. It independently integrates the displayed power function and divides by interval width, solves the stated mean-value equation, or averages the displayed linear velocity. For MCQs it reconstructs the complete correct expression. It does not trust generated answers, correctness flags, hidden case data, or option positions.

The focused assurance samples 280 direct seeds and 96 unseen resolver seeds per form. It checks deterministic replay, schema validity, exact 12-prompt and 12-truth pools, one defensible MCQ answer, unique numeric traps, response-surface preservation, and visible-prompt truth. Adversarial mutations change coefficients and velocity parameters and reject zero-width intervals.

## Gates

- Focused `ia-03` packet: PASS, 4/4 tests.
- Full preceding integration assurance from `in-01` through `ia-03`: PASS, 28/28 tests.
- Full resolver: all integration-application consumers pass; the next freshness failure is the separate untouched `lc-01-01.json/k1` / `g12-limits-continuity` family.
- Typecheck: PASS.
- Targeted lint: PASS with 3 pre-existing `no-explicit-any` warnings and 0 errors.
- Scoped diff check: PASS.

Global freshness evidence remains for the coordinating reconciliation after all concurrent bounded packets land.
