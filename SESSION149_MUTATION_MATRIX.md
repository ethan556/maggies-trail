# Session 149 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Result |
|---|---|---|---|
| M01 | schema | model-count | Rejected ✓ |
| M02 | schema | model-count | Rejected ✓ |
| M03 | integrity | duplicate-required-stage | Rejected ✓ |
| M04 | integrity | invalid-required-stage | Rejected ✓ |
| M05 | integrity | impossible-exploration | Rejected ✓ |
| M06 | math | nonpositive-boundary | Rejected ✓ |
| M07 | math | nonpositive-boundary | Rejected ✓ |
| M08 | integrity | duplicate-numeric-trap | Rejected ✓ |
| M09 | math | numeric-trap-collision | Rejected ✓ |
| M10 | integrity | numeric-cross-surface | Rejected ✓ |
| M11 | integrity | duplicate-piece-id | Rejected ✓ |
| M12 | integrity | duplicate-piece-label | Rejected ✓ |
| M13 | math | zero-dimension | Rejected ✓ |
| M14 | math | point-dimension-mismatch | Rejected ✓ |
| M15 | math | unknown-target-piece | Rejected ✓ |
| M16 | math | numeric-trap-collision | Rejected ✓ |
| M17 | schema | model-count | Rejected ✓ |
| M18 | math | invalid-angle | Rejected ✓ |
| M19 | integrity | duplicate-choice-id | Rejected ✓ |
| M20 | integrity | duplicate-choice-label | Rejected ✓ |
| M21 | integrity | choice-carrier | Rejected ✓ |
| M22 | integrity | choice-carrier | Rejected ✓ |
| M23 | integrity | duplicate-choice-truth | Rejected ✓ |
| M24 | math | choice-winner-count | Rejected ✓ |
| M25 | integrity | choice-cross-surface | Rejected ✓ |
| M26 | math | invalid-triangle-angle | Rejected ✓ |
| M27 | math | choice-winner-count | Rejected ✓ |
| M28 | math | invalid-aa-scale | Rejected ✓ |
| M29 | math | invalid-aa-scale | Rejected ✓ |
| M30 | math | missing-pyth-data | Rejected ✓ |
| M31 | math | nonexact-length | Rejected ✓ |
| M32 | integrity | explore-cross-surface | Rejected ✓ |
| M33 | schema | plain-zod-object-required | Rejected ✓ |
| M34 | schema | zod-effects-union-collapse | Rejected ✓ |
| M35 | schema | union-registration | Rejected ✓ |
| M36 | schema | integrity-relocated | Rejected ✓ |
| M37 | math | squared-area-factor | Rejected ✓ |
| M38 | math | coordinate-subtraction | Rejected ✓ |
| M39 | math | vertical-angle-equality | Rejected ✓ |
| M40 | math | adjacent-supplement | Rejected ✓ |
| M41 | math | full-turn-check | Rejected ✓ |
| M42 | math | aa-two-angle-set | Rejected ✓ |
| M43 | math | pythagorean-area-sum | Rejected ✓ |
| M44 | math | pythagorean-square-root | Rejected ✓ |
| M45 | grading | fabricated-exploration-filter | Rejected ✓ |
| M46 | grading | numeric-route | Rejected ✓ |
| M47 | narration | truth-model-narration | Rejected ✓ |
| M48 | pedagogy | wrong-path-route | Rejected ✓ |
| M49 | renderer | single-truth-renderer | Rejected ✓ |
| M50 | renderer | task-specific-diagrams | Rejected ✓ |
| M51 | accessibility | keyboard-native-stages | Rejected ✓ |
| M52 | accessibility | aria-stage-group | Rejected ✓ |
| M53 | reveal | ghost-does-not-overwrite | Rejected ✓ |
| M54 | variants | all-target-forms-wrapped | Rejected ✓ |
| M55 | variants | coordinate-point-parser | Rejected ✓ |
| M56 | variants | exact-aa-parser | Rejected ✓ |
| M57 | gate | gateOne-geometric | Rejected ✓ |
| M58 | gate | keyboard-geometric | Rejected ✓ |
| M59 | capability | authoritative-capability | Rejected ✓ |
| M60 | cml | catalog-coverage | Rejected ✓ |
| M61 | cml | mesh-coverage | Rejected ✓ |
| M62 | cml | kernel-coverage | Rejected ✓ |
| M63 | mastery | direct-manipulative | Rejected ✓ |
| M64 | samples | sample-valid-shape | Rejected ✓ |
| M65 | freshness | source-hash-current | Rejected ✓ |

## Valid controls

- ✓ A valid missing-perimeter state is accepted.
- ✓ A valid coordinate area state is accepted.
- ✓ A valid exact Pythagorean length state is accepted.

**Result:** 65/65 mutations rejected; controls 3/3.
