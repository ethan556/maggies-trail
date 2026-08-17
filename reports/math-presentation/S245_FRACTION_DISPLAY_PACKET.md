# S245 Phase 4 packet — radical fraction display

## Result

**PASS. The live fraction-display index is 12 → 0.** All 12 rows were genuine renderer
residues in the rational-exponents lesson `re-02-01`; none was a detector false positive. The
repair is at the shared `authoredMath` presentation boundary, so the same authored quantity is one
visual and accessible math island on lesson prose and arithmetic-off widget surfaces.

No evaluator, answer, lesson, widget, schema, figure, generator, or standards field changed.

## Disposition of the 12 rows

| Disposition                      | Arithmetic on | Arithmetic off |  Total | Resolution                    |
| -------------------------------- | ------------: | -------------: | -----: | ----------------------------- |
| Genuine radical-fraction residue |             2 |             10 |     12 | Shared parser boundary repair |
| Detector false positive          |             0 |              0 |      0 | None                          |
| **Total**                        |         **2** |         **10** | **12** | **All closed**                |

The corpus-proven shapes were:

- a radical over a radical: `√5/√5`, `√3/√3`;
- a coefficient and radical over a number: `5√5/5`, `10√5/5`, `2√2/2`, `3√3/3`;
- a number over a radical: `6/√3`, `4/√8`, `2/√2`, `3/√3`;
- a number over a parenthesized coefficient-radical denominator: `4/(2√2)`, `9/(3√3)`.

Previously the radical and the numeric slash shell became separate fragments, leaving learner-
visible text such as `5/5`, `4/(2)`, or `6/`. The repair recognises only a rational expression with
`√` on at least one side and emits one `\frac{…}{…}` containing the complete numerator and
denominator. Each radical is then emitted as `\sqrt{…}` inside that fraction.

## False-claim controls

- A radical is required on at least one side; ordinary numeric fraction handling is unchanged.
- Dates such as `5/5/2026`, URLs, and slash-separated prose remain plain text.
- ASCII word boundaries still prevent `word/√5` or `√5/result` from becoming a claimed fraction.
- When those word-boundary examples contain a genuine standalone radical, only that radical is
  presented as math; the prose and slash stay outside.
- Every new fraction parses without fallback and includes MathML `mfrac` semantics for assistive
  technology.

## Queue evidence

Source seal: `66ac01f`.

| Index                                 | Before | After | Change |
| ------------------------------------- | -----: | ----: | -----: |
| `MATH_FRACTION_DISPLAY_INDEX`         |     12 |     0 |    -12 |
| `MATH_SYMBOLIC_DISPLAY_INDEX`         |    804 |   804 |      0 |
| Total mathematical-presentation queue |    907 |   895 |    -12 |

The consolidated queue moved from 14,669 to 14,648 during this packet. Twelve rows are
attributable to this repair; a concurrent nine-row progression/duplication reduction accounts for
the remainder.

## Verification

- Seven parser/render test files: 100/100 pass.
- New S245 fraction tests cover every distinct live shape, sentence extraction, KaTeX parsing,
  MathML fraction output, dates, URLs, prose slashes, and word-boundary negative cases.
- Focused ESLint: pass with zero warnings or errors.
- Deterministic math-presentation reports regenerated: fraction index contains its header only.
- Consolidated pending-workload queue regenerated from the current report set.
- Whole-project TypeScript: pass after concurrent widget work settled.
