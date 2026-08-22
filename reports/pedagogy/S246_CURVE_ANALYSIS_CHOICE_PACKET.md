# S246 Curve-Analysis Choice-Surface Packet

## Scope

- Course: `curve-analysis`
- Queue-defined rows: 19 authored MCQs in 13 lessons
- Source fields changed: 73 option labels; seven stems requiring mathematical precision; one success-feedback sentence whose old peak claim was not guaranteed by the stated derivative signs
- Preserved: stable option IDs, correct markers, generator bindings, misconception diagnoses, and standards intent

## Deterministic before/after evidence

The leakage rule matches the current MCQ index: the correct label is more than 1.5 times the longest distractor and at least 12 characters longer.

| Measure | Before | After |
| --- | ---: | ---: |
| Queue-defined rows | 19 | 19 |
| Leaking rows | 19 | 0 |
| Mean option-length spread | 52.84 | 8.53 |
| Maximum option-length spread | 111 | 14 |
| Mean correct-vs-distractor skew | 46.63 | 4.60 |
| Maximum correct-vs-distractor skew | 98 | 11 |

## Mathematical and construction corrections

- Moved derivations, examples, and causal explanations out of answer labels and retained them in post-selection feedback.
- Made option sets parallel: classifications, derivative tests, curve behaviours, theorem hypotheses, asymptote types, limits, equations, or domain locations.
- Added the interval condition required by the Mean Value Theorem claims about zero derivatives and antiderivatives.
- Replaced the unsupported claim that `f′ > 0` and `f″ < 0` guarantees an approaching maximum with the exact conclusion: the function rises while its slope decreases.
- Asked explicitly for the one-variable objective in the two-number optimisation item, removing the defensible two-variable answer.
- Reclassified `x = 6` in the open-top-box item as an inadmissible algebraic derivative root rather than a valid physical-domain critical point.
- Kept graph language self-contained. The one graph-based item describes the derivative graph in its stem and does not rely on an absent figure.

## Ratchet and shared-artifact note

`src/lib/session246.curveAnalysisChoiceIntegrity.test.ts` seals the exact 19-row target, leakage/parity metrics, one-answer truth, feedback/evaluator agreement, stable-ID shuffling, self-contained visual language, and the corrected calculus boundary claims.

Global MCQ indexes, queues, cards, caches, and consolidated evidence were intentionally not regenerated. Root must rebuild those shared deterministic artifacts after all active content lanes finish.
