# S246 integration `in-05` freshness packet

## Scope and boundary

- Generator: `g13-integration-accumulation`
- Lessons: `in-05-01`, `in-05-02`, and `in-05-03`
- Consumers: 12 declared steps across 7 distinct forms
- Entry frontier: `in-05-01.json/k2` -> `integration-accumulation__in-usub__numeric`
- Stop frontier: `ia-01-01.json/k2` in the untouched `g13-integration-applications` generator

No lesson, standards, figure, queue, review-card, cache, or global generated-evidence file changed.

## Root cause and repair

The seven `in-05` forms previously resolved to authored banks of one to three widgets, so multiple lesson consumers repeated the same substitution questions. The packet replaces the fallback with deterministic 12-case families while preserving the authored `mcq`, `numeric`, and `dragBucket` response surfaces.

| Form | Mathematical job | Consumers | Prompt pool | Truth pool |
| --- | --- | ---: | ---: | ---: |
| `in-usub__mcq` | Identify the inside whose derivative receipt is present | 1 | 12 | 12 |
| `in-usub__numeric` | Reverse the chain rule in a definite power integral | 3 | 12 | 12 |
| `in-usub-limits__mcq` | Convert both endpoints into the new variable | 1 | 12 | 12 |
| `in-usub-limits__numeric` | Evaluate after changing to coherent u-limits | 3 | 12 | 12 |
| `in-choosing-u__mcq` | Choose u so no x remains | 1 | 12 | 12 |
| `in-choosing-u__numeric` | Choose and execute a complete substitution | 2 | 12 | 12 |
| `in-choosing-u__dragBucket` | Classify integrals by derivative-receipt availability | 1 | 12 | 12 |

The case pools vary inner powers, shifts, outside multipliers, outer powers, and interval endpoints. Numeric distractors are calculated from named errors: dropping the constant receipt, retaining x-limits in a u-antiderivative, omitting the lower endpoint, or omitting division by the new power. MCQ option order is seed-shuffled without moving semantic truth.

## Independent truth contract

`calculusIndependent.cjs` parses only learner-visible prompt data and recomputes every answer. It verifies that the outside x-power is exactly one below the inside power, the outside coefficient is a valid constant multiple of the inside derivative, declared affine substitutions match the integrand, and intervals retain increasing orientation. The bucket solver derives the complete label-to-category map from the visible `p` and `c` values rather than trusting hidden item assignments.

The focused assurance samples 280 direct seeds and 96 unseen resolver seeds per form. It checks deterministic replay, schema validity, exact 12-prompt and 12-truth pools, one defensible MCQ answer, unique numeric traps, two-sided bucket use, response-surface preservation, and agreement between visible prompt, widget answer, and independent solver. Adversarial mutations cover non-divisible receipts, inconsistent declared substitutions, reversed intervals, and an invalid linear bucket parameter.

## Gates

- Focused `in-05` packet: PASS, 4/4 tests.
- Focused `in-01` through `in-05` integration assurance: PASS, 16/16 tests.
- Full resolver: all `g13-integration-accumulation` consumers pass; the next failure is the untouched `ia-01-01.json/k2` `g13-integration-applications` family.
- Typecheck: PASS.
- Targeted lint: PASS with 3 pre-existing `no-explicit-any` warnings and 0 errors.
- Scoped diff check: PASS.

Global freshness evidence remains for the coordinating reconciliation after all concurrent bounded packets land.
