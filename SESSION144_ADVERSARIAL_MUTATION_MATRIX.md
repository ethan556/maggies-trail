# Session 144 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Gate result |
|---|---|---|---|
| M01 | integrity | duplicate-series-id | Rejected ✓ |
| M02 | integrity | duplicate-series-label | Rejected ✓ |
| M03 | mathematical | zero-input | Rejected ✓ |
| M04 | integrity | duplicate-pair | Rejected ✓ |
| M05 | integrity | missing-target-series | Rejected ✓ |
| M06 | mathematical | nonconstant-target | Rejected ✓ |
| M07 | mathematical | nonconstant-comparison | Rejected ✓ |
| M08 | mathematical | zero-rate-division | Rejected ✓ |
| M09 | integrity | impossible-exploration | Rejected ✓ |
| M10 | integrity | duplicate-choice-id | Rejected ✓ |
| M11 | integrity | duplicate-choice-label | Rejected ✓ |
| M12 | integrity | duplicate-mathematical-claim | Rejected ✓ |
| M13 | mathematical | not-exactly-one-truth | Rejected ✓ |
| M13A | integrity | ambiguous-choice-truth-carrier | Rejected ✓ |
| M13B | integrity | ambiguous-choice-truth-carrier | Rejected ✓ |
| M14 | integrity | duplicate-numeric-error | Rejected ✓ |
| M15 | mathematical | numeric-error-collides | Rejected ✓ |
| M16 | mathematical | discount-added-not-subtracted | Rejected ✓ |
| M17 | mathematical | percent-treated-as-whole | Rejected ✓ |
| M18 | schema | plain-zod-object-required | Rejected ✓ |
| M19 | accessibility | keyboard-button-missing | Rejected ✓ |
| M20 | accessibility | row-aria-label-missing | Rejected ✓ |
| M21 | visual | initial-conclusion-guard-missing | Rejected ✓ |
| M22 | grading | fabricated-exploration-filter-missing | Rejected ✓ |
| M23 | variant | surface-upgrade-missing | Rejected ✓ |
| M24 | schema | zod-effects-union-collapse | Rejected ✓ |
| M25 | historical-regression | stale-generator-sweep | Rejected ✓ |
| M26 | package-identity | wrong-package-root | Rejected ✓ |
| M27 | tar-re-extraction | reextracted-hash-mismatch | Rejected ✓ |

## Valid controls

- ✓ A nonproportional table is valid in test mode
- ✓ A zero-percent discount preserves the subtotal
- ✓ Max-rate comparison selects the larger unit rate

**Result:** 29/29 mutations rejected; controls 3/3.
