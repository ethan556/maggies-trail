# Session 150 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Result |
|---|---|---|---|
| M01 | integrity | duplicate-set-id | Rejected ✓ |
| M02 | integrity | duplicate-set-label | Rejected ✓ |
| M03 | integrity | duplicate-point-id | Rejected ✓ |
| M04 | integrity | duplicate-point-label | Rejected ✓ |
| M05 | integrity | missing-target-set | Rejected ✓ |
| M06 | integrity | duplicate-required-stage | Rejected ✓ |
| M07 | integrity | invalid-required-stage | Rejected ✓ |
| M08 | integrity | impossible-exploration | Rejected ✓ |
| M09 | integrity | duplicate-numeric-trap | Rejected ✓ |
| M10 | math | numeric-trap-collision | Rejected ✓ |
| M11 | integrity | numeric-cross-surface | Rejected ✓ |
| M12 | integrity | duplicate-choice-id | Rejected ✓ |
| M13 | integrity | duplicate-choice-label | Rejected ✓ |
| M14 | integrity | choice-carrier | Rejected ✓ |
| M15 | integrity | choice-carrier | Rejected ✓ |
| M16 | integrity | duplicate-choice-truth | Rejected ✓ |
| M17 | math | choice-winner-count | Rejected ✓ |
| M18 | integrity | choice-cross-surface | Rejected ✓ |
| M19 | integrity | explore-cross-surface | Rejected ✓ |
| M20 | math | sequence-nonconstant | Rejected ✓ |
| M21 | math | sequence-zero-x-step | Rejected ✓ |
| M22 | math | sequence-too-short | Rejected ✓ |
| M23 | integrity | missing-path-point | Rejected ✓ |
| M24 | math | path-too-short | Rejected ✓ |
| M25 | math | range-two-sets | Rejected ✓ |
| M26 | math | range-added-value | Rejected ✓ |
| M27 | integrity | missing-target-point | Rejected ✓ |
| M28 | math | choice-winner-count | Rejected ✓ |
| M29 | schema | plain-zod-object-required | Rejected ✓ |
| M30 | schema | zod-effects-union-collapse | Rejected ✓ |
| M31 | schema | union-registration | Rejected ✓ |
| M32 | schema | integrity-relocated | Rejected ✓ |
| M33 | math | range-min-max | Rejected ✓ |
| M34 | math | range-subtraction | Rejected ✓ |
| M35 | math | range-update-endpoints | Rejected ✓ |
| M36 | math | path-ordered-legs | Rejected ✓ |
| M37 | math | axis-distance-coordinate-deltas | Rejected ✓ |
| M38 | math | sequence-constant-rate | Rejected ✓ |
| M39 | math | point-meaning-axis-order | Rejected ✓ |
| M40 | grading | fabricated-exploration-filter | Rejected ✓ |
| M41 | grading | point-set-evaluate-route | Rejected ✓ |
| M42 | grading | can-check-route | Rejected ✓ |
| M43 | narration | truth-model-narration | Rejected ✓ |
| M44 | pedagogy | wrong-path-route | Rejected ✓ |
| M45 | renderer | single-truth-renderer | Rejected ✓ |
| M46 | renderer | point-set-diagram | Rejected ✓ |
| M47 | accessibility | keyboard-native-stages | Rejected ✓ |
| M48 | accessibility | aria-stage-group | Rejected ✓ |
| M49 | accessibility | no-color-only-answer | Rejected ✓ |
| M50 | reveal | ghost-does-not-overwrite | Rejected ✓ |
| M51 | variants | coordinate-wrappers | Rejected ✓ |
| M52 | variants | range-wrappers | Rejected ✓ |
| M53 | variants | point-set-upgrade | Rejected ✓ |
| M54 | gate | gateOne-point-set | Rejected ✓ |
| M55 | gate | keyboard-point-set | Rejected ✓ |
| M56 | gate | direct-truth-test | Rejected ✓ |
| M57 | gate | renderer-test | Rejected ✓ |
| M58 | capability | authoritative-capability | Rejected ✓ |
| M59 | cml | catalog-coverage | Rejected ✓ |
| M60 | cml | mesh-coverage | Rejected ✓ |
| M61 | cml | kernel-coverage | Rejected ✓ |
| M62 | mastery | direct-manipulative | Rejected ✓ |
| M63 | layout | wide-stage | Rejected ✓ |
| M64 | samples | sample-valid-shape | Rejected ✓ |
| M65 | registration | renderer-registration | Rejected ✓ |
| M66 | freshness | source-hash-current | Rejected ✓ |
| M67 | content | two-target-lessons | Rejected ✓ |
| M68 | content | thirteen-authored-surfaces | Rejected ✓ |
| M69 | queue | only-intentional-assessments | Rejected ✓ |
| M70 | queue | zero-representation-missing | Rejected ✓ |

## Valid controls

- ✓ A valid range state is accepted.
- ✓ A valid ordered path state is accepted.
- ✓ A valid range-blindness state is accepted.

**Result:** 70/70 mutations rejected; controls 3/3.
