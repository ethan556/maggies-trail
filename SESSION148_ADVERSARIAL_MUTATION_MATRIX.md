# Session 148 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Result |
|---|---|---|---|
| M01 | schema | bad-rational | Rejected ✓ |
| M02 | integrity | duplicate-source-id | Rejected ✓ |
| M03 | integrity | duplicate-source-label | Rejected ✓ |
| M04 | integrity | impossible-exploration | Rejected ✓ |
| M05 | integrity | duplicate-required-stage | Rejected ✓ |
| M06 | integrity | invalid-required-stage | Rejected ✓ |
| M07 | mathematical | source-count | Rejected ✓ |
| M08 | mathematical | missing-relation-truth | Rejected ✓ |
| M09 | integrity | relation-cross-surface | Rejected ✓ |
| M10 | integrity | duplicate-choice-id | Rejected ✓ |
| M11 | integrity | duplicate-choice-label | Rejected ✓ |
| M12 | integrity | choice-truth-carrier | Rejected ✓ |
| M13 | integrity | choice-truth-carrier | Rejected ✓ |
| M14 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M15 | integrity | choice-cross-surface | Rejected ✓ |
| M16 | integrity | missing-group | Rejected ✓ |
| M17 | mathematical | numeric-trap-collision | Rejected ✓ |
| M18 | integrity | duplicate-numeric-trap | Rejected ✓ |
| M19 | integrity | numeric-cross-surface | Rejected ✓ |
| M20 | mathematical | missing-numeric-truth | Rejected ✓ |
| M21 | mathematical | bad-power | Rejected ✓ |
| M22 | mathematical | numeric-trap-collision | Rejected ✓ |
| M23 | mathematical | bad-power | Rejected ✓ |
| M24 | integrity | missing-inequality | Rejected ✓ |
| M25 | integrity | missing-candidate | Rejected ✓ |
| M26 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M27 | integrity | rational-shape | Rejected ✓ |
| M28 | schema | bad-rational | Rejected ✓ |
| M29 | mathematical | divide-zero | Rejected ✓ |
| M30 | mathematical | numeric-trap-collision | Rejected ✓ |
| M31 | integrity | root-shape | Rejected ✓ |
| M32 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M33 | integrity | duplicate-selectable-source | Rejected ✓ |
| M34 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M35 | mathematical | invalid-root-bracket | Rejected ✓ |
| M36 | mathematical | invalid-root-bracket | Rejected ✓ |
| M37 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M38 | mathematical | invalid-density-order | Rejected ✓ |
| M39 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M40 | integrity | explore-cross-surface | Rejected ✓ |
| M41 | schema | plain-zod-object-required | Rejected ✓ |
| M42 | schema | zod-effects-union-collapse | Rejected ✓ |
| M43 | schema | cross-field-integrity-relocated | Rejected ✓ |
| M44 | grading | fabricated-exploration-filter | Rejected ✓ |
| M45 | renderer | single-truth-renderer | Rejected ✓ |
| M46 | accessibility | keyboard-native-stages | Rejected ✓ |
| M47 | accessibility | no-color-only-semantics | Rejected ✓ |
| M48 | reveal | ghost-does-not-overwrite | Rejected ✓ |
| M49 | variants | all-target-forms-wrapped | Rejected ✓ |
| M50 | variants | unicode-inequality-normalized | Rejected ✓ |
| M51 | variants | arbitrary-variable-inequality-parser | Rejected ✓ |
| M52 | variants | numeric-choice-carrier | Rejected ✓ |
| M53 | variants | relation-choice-carrier | Rejected ✓ |
| M54 | variants | root-candidates-populated | Rejected ✓ |
| M55 | gate | gateOne-exact-number | Rejected ✓ |
| M56 | capability | authoritative-capability | Rejected ✓ |
| M57 | freshness | source-hash-current | Rejected ✓ |
| M58 | package | targeted-variants-never-fallback | Rejected ✓ |
| M59 | content | authored-ledger-present | Rejected ✓ |
| M60 | content | non-target-byte-identity | Rejected ✓ |

## Valid controls

- ✓ Repeated operands remain valid.
- ✓ Inclusive boundary accepts equality.
- ✓ A valid square-root bracket is accepted.

**Result:** 60/60 mutations rejected; controls 3/3.
