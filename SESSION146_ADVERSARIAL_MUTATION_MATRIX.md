# Session 146 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Gate result |
|---|---|---|---|
| M01 | integrity | missing-dividend-or-divisor | Rejected ✓ |
| M02 | integrity | missing-dividend-or-divisor | Rejected ✓ |
| M03 | mathematical | invalid integer inputs | Rejected ✓ |
| M04 | mathematical | invalid integer inputs | Rejected ✓ |
| M05 | integrity | missing-context-policy | Rejected ✓ |
| M06 | integrity | missing-claimed-result | Rejected ✓ |
| M07 | integrity | missing-repeat-block | Rejected ✓ |
| M08 | mathematical | all-zero-repeat-block | Rejected ✓ |
| M09 | integrity | missing-classification-target | Rejected ✓ |
| M10 | integrity | too-few-candidates | Rejected ✓ |
| M11 | mathematical | not-exactly-one-target-candidate | Rejected ✓ |
| M12 | integrity | duplicate-candidate-id | Rejected ✓ |
| M13 | integrity | duplicate-candidate-label | Rejected ✓ |
| M14 | integrity | duplicate-candidate-value | Rejected ✓ |
| M15 | integrity | stray-candidates | Rejected ✓ |
| M16 | integrity | impossible-exploration | Rejected ✓ |
| M17 | integrity | too-many-authored-stages | Rejected ✓ |
| M18 | integrity | duplicate-choice-id | Rejected ✓ |
| M19 | integrity | duplicate-choice-label | Rejected ✓ |
| M20 | integrity | duplicate-choice-claim | Rejected ✓ |
| M21 | integrity | too-few-choices | Rejected ✓ |
| M22 | mathematical | not-exactly-one-choice-truth | Rejected ✓ |
| M23 | integrity | choice-carries-other-traps | Rejected ✓ |
| M24 | integrity | numeric-carries-wrong-surface | Rejected ✓ |
| M25 | mathematical | missing-numeric-truth | Rejected ✓ |
| M26 | integrity | duplicate-numeric-trap | Rejected ✓ |
| M27 | mathematical | numeric-trap-collides | Rejected ✓ |
| M28 | integrity | fraction-carries-wrong-surface | Rejected ✓ |
| M29 | mathematical | missing-fraction-truth | Rejected ✓ |
| M30 | integrity | duplicate-fraction-trap | Rejected ✓ |
| M31 | mathematical | fraction-trap-collides | Rejected ✓ |
| M32 | integrity | explore-carries-traps | Rejected ✓ |
| M33 | mathematical | remainder-policy-collapsed | Rejected ✓ |
| M34 | mathematical | flip-dividend-instead-of-divisor | Rejected ✓ |
| M35 | mathematical | repeating-denominator-is-9s | Rejected ✓ |
| M36 | mathematical | rounded-decimal-used-as-exact | Rejected ✓ |
| M37 | mathematical | remainder-not-normalized | Rejected ✓ |
| M37B | mathematical | claimed-result-does-not-reconstruct-dividend | Rejected ✓ |
| M38 | schema | plain-zod-object-required | Rejected ✓ |
| M39 | schema | zod-effects-union-collapse | Rejected ✓ |
| M40 | grading | fabricated-exploration-filter | Rejected ✓ |
| M41 | accessibility | keyboard-stage-control | Rejected ✓ |
| M42 | reveal | ghost-only-answer-reveal | Rejected ✓ |
| M43 | variant | surface-upgrade-required | Rejected ✓ |
| M44 | historical-regression | stale-source-hash | Rejected ✓ |
| M45 | mathematical | package-root-drift | Rejected ✓ |
| M46 | mathematical | tar-reextraction-hash-mismatch | Rejected ✓ |

## Valid controls

- ✓ 100 ÷ 15 in all-riders context rounds 6 remainder 10 up to 7
- ✓ 0.(45) reduces exactly to 5/11
- ✓ one terminating and one repeating candidate produce one exact target

**Result:** 47/47 mutations rejected; controls 3/3.
