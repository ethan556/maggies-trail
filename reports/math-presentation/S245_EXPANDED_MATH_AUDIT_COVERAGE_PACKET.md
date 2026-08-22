# S245 expanded mathematical-presentation audit coverage

## Result

The nine-index audit now measures every current learner-visible authored lesson surface plus generated widget strings. The previous zero claims were withdrawn, the newly visible rows were classified and repaired, and the reports were regenerated from the live worktree.

Current source evidence:

- source seal: `66ac01f+inputs.89a38a2b7604`;
- full input digest: `89a38a2b76043ab2a095bf0049e8e6aa39e49ca2331b3aca1a6f20cca0d7d1ae`;
- measured input files: 2,011;
- learner-visible strings scanned: 414,468;
- authored strings scanned: 153,708.

The seal combines the nominal Git commit with a deterministic digest of the actual content, production math/generator code, rendering surfaces, and audit logic. A regression test confirms that the checked-in report seal matches the current dirty-worktree inputs; HEAD alone is no longer accepted as evidence.

## Authored completeness

| Surface                        |  Count |
| ------------------------------ | -----: |
| Main lesson steps              | 15,653 |
| Remedial concept/check steps   |  3,394 |
| Main-step explanation variants | 13,760 |
| Remedial explanation variants  |  3,394 |
| Takeaways                      |  5,100 |
| Teasers                        |  1,701 |
| Main-step narration strings    |  1,100 |
| Remedial narration strings     |    550 |

The shared traversal also includes body, feedback, success feedback, explanations, hints, prediction prompts/reveals/options, and every learner-visible widget string. Lesson prose uses the arithmetic-on renderer contract; widget spec strings use arithmetic-off.

## Re-evaluated findings

Expanding the traversal invalidated the earlier narrow-scan zero claim and exposed 24 non-symbolic rows:

- machine-expression leak: 1;
- fraction display: 2;
- canonical form: 4;
- integral notation: 1;
- decimal/fraction policy: 16.

The packet closed those rows by cause:

- the shared authored-math parser now keeps signed rational powers and π-fractions inside complete, accessible math islands;
- one derivative-context explanation now states six-decimal precision and uses approximation signs truthfully;
- reviewed coefficient-1 instruction, exact terminating-decimal demonstrations, repeating-decimal demonstrations, the integral-symbol definition, and one quoted over-precision counterexample use exact field/form evidence keys;
- the decimal detector now associates precision language with the displayed decimal itself, so unrelated words such as “about” or “estimate” cannot blanket-exempt another long decimal.

## Final nine-index counts

| Index                   |  Rows |
| ----------------------- | ----: |
| Machine-expression leak |     0 |
| Symbolic display        | 1,078 |
| Fraction display        |     0 |
| Canonical form          |     0 |
| Constant order          |     0 |
| Derivative notation     |     0 |
| Integral notation       |     0 |
| Unit notation           |     0 |
| Decimal/fraction policy |     0 |

The symbolic queue increased from the prior narrow 804-row view to an honest 1,078-row expanded view. This is a coverage correction, not a regression. The consolidated workload now carries exactly 1,078 `MATH_PRESENTATION_RESIDUE` rows.

## Assurance

- complete authored-coverage and current-source-seal tests: 5/5 passed;
- focused parser/disposition tests: 21/21 passed;
- complete authored-math parser regression: 99/99 passed;
- combined parser and audit regression: 116/116 passed;
- TypeScript: passed;
- targeted lint: zero errors and zero warnings;
- diff check: passed;
- report regeneration: passed;
- workload consolidation: passed, 1,078 mathematical-presentation rows.

No commit, push, or deployment was performed.
