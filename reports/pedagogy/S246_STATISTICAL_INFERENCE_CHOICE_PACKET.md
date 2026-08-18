# S246 Statistical Inference Choice-Surface Packet

## Scope

- Course: `statistical-inference`
- Queue-defined authored rows: 13
- Lessons changed: 7
- Target steps: `si-02-01/ch1`, `si-02-01/k1`, `si-02-01/k3`, `si-03-01/k3`, `si-03-03/ch1`, `si-03-03/k1`, `si-04-01/ch1`, `si-04-01/k1`, `si-04-01/k2`, `si-04-02/ch1`, `si-04-02/k2`, `si-05-02/k2`, and `si-06-01/k1b`
- Primary repair: replace rationale-bearing correct choices with concise, parallel claims while preserving the misconception job of every distractor
- Mathematical wording repairs: state small- and large-p evidence without converting a p-value into the probability of an effect or claiming that chance “perfectly” explains the data
- Preserved: prompts, stable option IDs, correct markers, interaction types, figures, grading, standards intent, and all seven lesson identities
- Excluded by ownership: shared MCQ evidence, consolidated queue, review cards, precache, generators, deployment, and unrelated lessons

Queue work IDs are regenerated when the shared workload is consolidated, so this packet seals the 13 stable `lesson/step` semantic keys rather than volatile numeric IDs.

## Deterministic before/after evidence

The leakage rule matches the authored MCQ audit: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined authored rows | 13 | 13 |
| Leaking rows | 13 | 0 |
| Mean option-length spread | 60.69 | 6.08 |
| Maximum option-length spread | 84 | 10 |
| Mean correct-vs-distractor skew | 53.42 | 3.29 |
| Maximum correct-vs-distractor skew | 75 | 7 |

The post-repair aggregate is sealed exactly by the focused test: total spread `79`, total correct-vs-distractor skew `257/6`, maximum spread `10`, and maximum skew `7`.

## Construction improvements

- Recast each set as parallel answer jobs: polling-method diagnosis, sampling-distribution interpretation, confidence-band reading, null-model interpretation, p-value interpretation, multiple-testing diagnosis, extrapolation diagnosis, or symmetry comparison.
- Kept one defensible answer on every surface while retaining plausible misconceptions about bias, sample size, exact point estimates, conditional reversal, proof versus evidence, multiple comparisons, extrapolation, and one-sided bell curves.
- Kept the full reasoning in explanations and option-specific feedback instead of using it to signal the correct label.
- Replaced an overconfident small-p conclusion with “evidence against the no-effect model.”
- Replaced the claim that chance explains high-p data “perfectly” with the accurate statement that the data are compatible with no effect.
- Standardized learner-facing `centre`/`favours` usage inside the repaired symmetry and sampling items.

## Ratchet and gates

`src/lib/session246.statisticalInferenceChoiceIntegrity.test.ts` seals the exact 13-row target, exact aggregate parity metrics, stable IDs, answer markers, unique labels, evaluator/feedback agreement, deterministic seeded shuffling, useful misconception-specific feedback, schema/pedagogy validity for all seven lessons, and the two p-value wording corrections.

- Focused integrity packet: PASS, 4/4 tests.
- Whole-corpus schema validation: PASS, 1,840/1,840 files.
- Whole-corpus pedagogy validation: PASS, 1,711/1,711 files.
- Typecheck: PASS.
- Strict CML lint: PASS, 0 errors / 0 warnings.
- Targeted ESLint and scoped diff check: PASS.

Shared evidence is intentionally not regenerated in this isolated packet. The parent reconciliation wave should rebuild the MCQ index, consolidated workload, lesson cards, and precache once across all concurrent batches.
