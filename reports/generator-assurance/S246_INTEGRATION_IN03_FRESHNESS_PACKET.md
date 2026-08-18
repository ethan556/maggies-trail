# S246 integration `in-03` freshness packet

## Scope and boundary

- Generator: `g13-integration-accumulation`
- Lessons: `in-03-01`, `in-03-02`, and `in-03-03`
- Consumers: 12 declared steps across 7 distinct forms
- Entry frontier: `in-03-01.json/ch1` -> `integration-accumulation__in-ftc1__numeric`
- Stop frontier: `in-04-01.json/k2` -> `integration-accumulation__in-antiderivative__numeric`

No lesson, standards, figure, queue, card, cache, or global generated-evidence file changed.

## Root cause

The seven `in-03` forms fell back to authored banks containing only 1-3 prompts per form. The entry frontier had only one widget in the resolver sample. The family therefore repeated both presentation and truth across derivative-of-accumulation, antiderivative evaluation, and unified-FTC tasks.

## Implementation

| Form | Mathematical job | Dynamic prompts | Prompt-derived truths |
| --- | --- | ---: | ---: |
| `in-ftc1__mcq` | Differentiate accumulations, compare fixed lower limits, and apply the moving-endpoint chain rule | 12 | 12 |
| `in-ftc1__numeric` | Locate an accumulation minimum or maximum from the sign of its derivative | 12 | 6 |
| `in-ftc2__numeric` | Evaluate power integrals and accumulated linear rates with antiderivatives | 12 | 12 |
| `in-ftc2__mcq` | Explain constant cancellation, reverse limits, and join adjacent intervals | 12 | 12 |
| `in-ftc-unified__dragOrder` | Derive FTC Part 2 from Part 1 in a genuinely shuffled proof | 12 | 12 |
| `in-ftc-unified__dragBucket` | Classify differentiation and evaluation tasks by theorem part | 12 | 12 |
| `in-ftc-unified__numeric` | Combine Part 1 turning-point reasoning with Part 2 evaluation | 12 | 12 |

The designed family pool increased from 12 authored prompts to 84 dynamic prompts, and from 12 authored answers to 78 prompt-derived truths. Distractors target differentiating the integrand instead of the accumulation, omitting the moving-endpoint derivative, confusing endpoint height with accumulated value, failing to subtract the lower antiderivative value, and treating partial antiderivatives as unique.

## Independent truth contract

`calculusIndependent.cjs` parses the learner-visible prompt and independently recomputes every answer. It never reads generated numeric answers, MCQ correctness markers, drag-order IDs, or drag-bucket assignments. For extrema it evaluates endpoints and in-domain critical points for the requested minimum or maximum on the explicit closed interval. For adjacent integrals it requires the printed pieces to be contiguous and to cover the requested interval exactly. For the structured tasks it reconstructs the expected semantic labels from the parameters printed in the prompt, then the test compares those labels with the generated presentation.

The focused test samples 280 direct generator seeds and 96 unseen resolver seeds per form. It ratchets exact prompt/truth pools, exact replay, schema validity, one-answer MCQs, stable answer-ID agreement, distinct numeric errors, shuffled proof presentation, and use of both theorem buckets. Adversarial mutations also require the oracle to recompute a requested maximum instead of returning a memorized critical point, respect domains that exclude that critical point, and reject gapped or overextended interval joins.

## Gates

- Focused packet: PASS, 4/4 tests, including the extrema-domain and exact-interval-coverage mutation cases.
- Focused packet plus the `in-01` and `in-02` predecessor packets: PASS, 8/8 tests.
- Typecheck: PASS.
- Targeted ESLint: PASS with 0 errors; 3 pre-existing `no-explicit-any` warnings in `calculusVariants.ts`.
- Scoped diff check: PASS.
- Full resolver: all `in-03` consumers pass; it stops at the next untouched family, `in-04-01.json/k2` / `integration-accumulation__in-antiderivative__numeric`, which has only 2 distinct widgets.
- Global freshness evidence remains for the coordinating lane after all generator packets finish.
