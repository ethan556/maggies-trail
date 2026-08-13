# Session 145 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Gate result |
|---|---|---|---|
| M01 | integrity | wrong-value-count | Rejected ✓ |
| M02 | mathematical | division-by-zero | Rejected ✓ |
| M03 | integrity | exponent-op-count | Rejected ✓ |
| M04 | integrity | stray-exponent-ops | Rejected ✓ |
| M05 | mathematical | zero-scientific-form | Rejected ✓ |
| M06 | mathematical | not-exact-power-ten | Rejected ✓ |
| M07 | integrity | impossible-exploration | Rejected ✓ |
| M08 | integrity | duplicate-choice-id | Rejected ✓ |
| M09 | integrity | duplicate-choice-label | Rejected ✓ |
| M10 | integrity | duplicate-mathematical-claim | Rejected ✓ |
| M11 | integrity | truth-carrier-count | Rejected ✓ |
| M12 | integrity | truth-carrier-count | Rejected ✓ |
| M13 | mathematical | not-exactly-one-truth | Rejected ✓ |
| M14 | integrity | numeric-carries-choices | Rejected ✓ |
| M15 | mathematical | missing-numeric-truth | Rejected ✓ |
| M16 | integrity | duplicate-numeric-error | Rejected ✓ |
| M17 | mathematical | numeric-error-collides | Rejected ✓ |
| M18 | mathematical | shift-direction-reversed | Rejected ✓ |
| M19 | mathematical | rounding-truncated | Rejected ✓ |
| M20 | mathematical | decimal-length-illusion | Rejected ✓ |
| M21 | mathematical | wrong-rounding-decider-place | Rejected ✓ |
| M22 | mathematical | divisor-only-shift | Rejected ✓ |
| M23 | mathematical | subtract-negative-sign-error | Rejected ✓ |
| M24 | mathematical | negative-exponent-made-negative | Rejected ✓ |
| M25 | mathematical | scientific-coefficient-not-single-digit | Rejected ✓ |
| M26 | schema | plain-zod-object-required | Rejected ✓ |
| M27 | schema | zod-effects-union-collapse | Rejected ✓ |
| M28 | accessibility | keyboard-stage-button-missing | NOT REJECTED ✗ |
| M29 | accessibility | digit-table-label-missing | Rejected ✓ |
| M30 | grading | fabricated-exploration-filter-missing | Rejected ✓ |
| M31 | reveal | reveal-overwrite-protection-missing | Rejected ✓ |
| M32 | variant | surface-upgrade-missing | Rejected ✓ |
| M33 | historical-regression | stale-generator-sweep | Rejected ✓ |
| M34 | package-identity | wrong-package-root | Rejected ✓ |
| M35 | tar-re-extraction | reextracted-hash-mismatch | Rejected ✓ |

## Valid controls

- ✓ 0.409 < 0.41 is a valid aligned comparison
- ✓ Nearest-tenth rounding uses the hundredths digit
- ✓ Subtracting a negative exponent adds its magnitude

**Result:** 34/35 mutations rejected; controls 3/3.
