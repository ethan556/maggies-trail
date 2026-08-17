# S245 Phase 4 packet — decimal/fraction policy

## Result

**PASS. The live decimal/fraction-policy index is 36 → 0.** Complete review found 35
intentional decimal representations and one genuine unstated approximation. The intentional rows
now have evidence-keyed audit dispositions; the generated approximation now states its precision
and displays an approximation truthfully.

No authored lesson, widget, schema, evaluator, figure, or standards field changed.

## Complete disposition

| Disposition                                           | Authored | Generated |  Total |
| ----------------------------------------------------- | -------: | --------: | -----: |
| Exact terminating scientific-notation value           |        5 |         4 |      9 |
| Explicit repeating or growing decimal-pattern example |       12 |        14 |     26 |
| Unstated generated approximation — repaired           |        0 |         1 |      1 |
| **Total**                                             |   **17** |    **19** | **36** |

### Exact and intentional decimals

- The nine scientific-notation rows are exact place-value expansions such as `0.000047` and
  `0.00000023`; their digits are the mathematical value being converted, not a rounded estimate.
- The 26 rational/irrational-number rows deliberately show repeating blocks or changing run
  lengths with an ellipsis. Their purpose is to classify or convert the visible infinite pattern.
  Truncating them to fewer digits or calling them rounded would change the task.

These dispositions are keyed to the reviewed source, owner/generator, form or lesson unit, and
field. An ellipsis or a long decimal in a new family is not automatically exempt.

### Genuine approximation repair

Generated `a2-trig / tf-identity__numeric` feedback previously presented
`cos θ=√(1−sin²θ)=0.916515` with no precision instruction and an equality sign. The generator now:

- asks for the answer **to three decimal places**;
- retains the exact numeric target and existing `0.001` tolerance;
- displays `≈` rather than `=`;
- uses exactly three visible decimal places, including trailing zeroes where appropriate.

The repair was verified over 24 deterministic draws across support, core, and stretch bands.

## Detector boundary

- Six exact scientific-notation field contracts are dispositioned, including the generated form
  contract that varies the exponent by seed.
- Twenty-four exact repeating/growing-pattern field contracts cover the 26 deduplicated rows; two
  fields legitimately produce more than one reviewed pattern shape.
- A near-miss lesson unit, generator, form, field, or owner still reports a long decimal.
- A future unstated approximation and the former six-place trig feedback both remain positive
  detector fixtures.
- Existing stated-rounding and exact-power-of-ten safeguards remain covered.

## Queue evidence

Source seal: `66ac01f`.

| Index                                 | Before |  After | Change |
| ------------------------------------- | -----: | -----: | -----: |
| `MATH_DECIMAL_FRACTION_POLICY_INDEX`  |     36 |      0 |    -36 |
| `MATH_SYMBOLIC_DISPLAY_INDEX`         |    804 |    804 |      0 |
| Total mathematical-presentation queue |    840 |    804 |    -36 |
| Consolidated pending-workload queue   | 14,593 | 14,554 |    -39 |

Thirty-six consolidated rows are attributable to this packet. A concurrent three-row
progression/duplication reduction accounts for the remainder.

## Verification

- Focused decimal-policy tests: 5/5 pass.
- Parser, renderer, detector, and full variant tests: 4,108/4,108 pass.
- The broader resolver suite passes 16/17; its only failure is the independently edited
  `g10-circle-theorems` freshness gate for `cr-01-03/k1`, unrelated to this packet.
- Whole-project TypeScript: pass.
- Focused ESLint: zero errors; warnings are pre-existing in the compact Algebra II generator and
  audit JSON walker.
- Deterministic math-presentation reports regenerated: decimal/fraction-policy index contains its
  header only.
- Consolidated pending-workload queue regenerated from the current report set.
