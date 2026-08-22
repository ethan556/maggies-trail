# S246 integration applications `ia-02` freshness packet

## Scope and boundary

- Generator: `g13-integration-applications`
- Lesson: `ia-02-01`
- Consumers: 4 declared steps across 2 distinct forms
- Entry frontier: `ia-02-01.json/k1` -> `integration-applications__ia-cross-sections__numeric`
- Stop frontier: `ia-03-01.json/k1` in the next applications family

No lesson, standards, figure, queue, review-card, cache, or global generated-evidence file changed.

## Root cause and repair

The two known-cross-sections forms previously resolved to undersized authored banks. This packet supplies twelve deterministic mathematical cases for each form while preserving the authored `numeric` and `mcq` response surfaces.

| Form | Mathematical job | Consumers | Prompt pool | Truth pool |
| --- | --- | ---: | ---: | ---: |
| `ia-cross-sections__numeric` | Integrate the area of square, equilateral-triangle, or semicircle slices | 3 | 12 | 12 |
| `ia-cross-sections__mcq` | Apply the correct shape-area factor to a displayed base width | 1 | 12 | 12 |

The cases vary the cross-section shape, base-width coefficient, base-width power, and displayed width. Numeric misconception values represent failing to square the width, omitting the shape factor, or failing to double the power before integration. MCQ distractors confuse one-dimensional width with area, treat a width as a circle radius, or apply an unsupported one-half factor.

## Independent truth contract

`calculusIndependent.cjs` parses only learner-visible prompt data. It independently selects the square, equilateral-triangle, or semicircle area factor, squares the displayed base-width function, integrates over the stated interval, and reconstructs the displayed slice-area statement. It does not trust generated answers, correctness flags, hidden case data, or option positions.

The focused assurance samples 280 direct seeds and 96 unseen resolver seeds per form. It checks deterministic replay, schema validity, exact 12-prompt and 12-truth pools, one defensible MCQ answer, unique numeric traps, response-surface preservation, and visible-prompt truth. Adversarial mutations change the integration bound and reject zero-width intervals or non-positive displayed widths.

## Gates

- Focused `ia-02` packet: PASS, 4/4 tests.
- Full preceding integration assurance from `in-01` through `ia-02`: PASS, 24/24 tests.
- Full resolver: all `ia-02` consumers pass and resolution advances beyond this family.
- Typecheck: PASS.
- Targeted lint: PASS with 3 pre-existing `no-explicit-any` warnings and 0 errors.
- Scoped diff check: PASS.

Global freshness evidence remains for the coordinating reconciliation after all concurrent bounded packets land.
