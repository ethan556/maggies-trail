# S246 integration `in-04` freshness packet

## Scope and boundary

- Generator: `g13-integration-accumulation`
- Lessons: `in-04-01`, `in-04-02`, and `in-04-03`
- Consumers: 12 declared steps across 6 distinct forms
- Entry frontier: `in-04-01.json/k2` -> `integration-accumulation__in-antiderivative__numeric`
- Stop frontier: `in-05-01.json/k2` in the next, untouched integration family

No lesson, standards, figure, queue, card, cache, or global generated-evidence file changed.

## Root cause and repair

The six `in-04` forms previously resolved to small authored banks, so seeds changed presentation more often than they changed the mathematics. The packet replaces those fallbacks with deterministic 12-case builders while preserving every authored response surface.

| Form | Mathematical job | Prompt pool | Truth pool |
| --- | --- | ---: | ---: |
| `in-antiderivative__mcq` | Apply the power rule and identify the full antiderivative family | 12 | 12 |
| `in-antiderivative__numeric` | Evaluate exact polynomial definite integrals | 12 | 12 |
| `in-constant-of-integration__numeric` | Use an initial value to select one antiderivative | 12 | 10 |
| `in-constant-of-integration__mcq` | Explain why derivative information alone leaves a constant undetermined | 12 | 12 |
| `in-library__mcq` | Match sine, cosine, exponential, and reciprocal forms to antiderivatives | 12 | 12 |
| `in-library__numeric` | Evaluate exact definite integrals from the core antiderivative library | 12 | 12 |

Distractors are derived from named misconceptions: unchanged exponent, missing coefficient division, omitted endpoint subtraction, sign reversal, missing chain-rule factor, and treating an indefinite family as a single function. The initial-value form remains an `exactNumberLab` using `antiderivativeInitialValue`; it was not flattened into a generic numeric question.

## Independent truth contract

`calculusIndependent.cjs` parses only the learner-visible prompt and independently recomputes each answer. It does not trust generated answers, correct-option flags, or hidden widget parameters. The parser verifies coefficient divisibility, endpoint orientation, initial conditions, library-function identity, and exact supported angles or bounds before returning a truth.

The focused assurance samples 280 direct seeds and 96 unseen resolver seeds per form. It checks deterministic replay, schema validity, exact prompt and truth pools, one defensible MCQ answer, unique distractors, numeric-error separation, response-surface preservation, and agreement between visible prompt, widget answer, and independent solver. Adversarial mutations ensure malformed divisibility and unsupported library bounds are rejected while changed initial conditions are recomputed.

## Gates

- Focused packet: PASS, 4/4 tests.
- `in-01` through `in-04` focused assurance: PASS, 12/12 tests.
- Typecheck: PASS.
- Full resolver: every `in-04` consumer passes; the next failure is the untouched `in-05-01.json/k2` family.
- Targeted lint and scoped diff check: PASS.

Global freshness evidence remains for the coordinating reconciliation after the next bounded curriculum packet.
