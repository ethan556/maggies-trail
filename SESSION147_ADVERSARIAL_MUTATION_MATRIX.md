# Session 147 Adversarial Mutation Matrix

| ID | Category | Deliberate defect | Gate result |
|---|---|---|---|
| M01 | integrity | missing-lines | Rejected ✓ |
| M02 | integrity | duplicate-line-id | Rejected ✓ |
| M03 | integrity | duplicate-line-label | Rejected ✓ |
| M04 | integrity | duplicate-mathematical-line | Rejected ✓ |
| M05 | mathematical | off-line-table-point | Rejected ✓ |
| M06 | integrity | nonfinite-line | Rejected ✓ |
| M07 | integrity | missing-target-input | Rejected ✓ |
| M08 | integrity | missing-candidate-point | Rejected ✓ |
| M09 | integrity | needs-two-lines | Rejected ✓ |
| M10 | mathematical | parallel-intersection | Rejected ✓ |
| M11 | integrity | unknown-task | Rejected ✓ |
| M12 | integrity | impossible-exploration | Rejected ✓ |
| M13 | integrity | duplicate-required-stage | Rejected ✓ |
| M14 | integrity | invalid-required-stage | Rejected ✓ |
| M15 | integrity | duplicate-choice-id | Rejected ✓ |
| M16 | integrity | duplicate-choice-label | Rejected ✓ |
| M17 | integrity | duplicate-choice-claim | Rejected ✓ |
| M18 | mathematical | choice-truth-not-unique | Rejected ✓ |
| M19 | integrity | choice-cross-surface | Rejected ✓ |
| M20 | integrity | duplicate-numeric-trap | Rejected ✓ |
| M21 | mathematical | numeric-trap-collision | Rejected ✓ |
| M22 | integrity | numeric-cross-surface | Rejected ✓ |
| M23 | mathematical | missing-numeric-truth | Rejected ✓ |
| M24 | integrity | duplicate-point-trap | Rejected ✓ |
| M25 | mathematical | point-trap-collision | Rejected ✓ |
| M26 | integrity | point-cross-surface | Rejected ✓ |
| M27 | mathematical | missing-point-truth | Rejected ✓ |
| M28 | integrity | explore-cross-surface | Rejected ✓ |
| M29 | mathematical | slope-intercept-swap | Rejected ✓ |
| M30 | mathematical | compare-raw-output-not-rate | Rejected ✓ |
| M31 | mathematical | start-vs-rate-conflation | Rejected ✓ |
| M32 | mathematical | lower-rate-direction | Rejected ✓ |
| M33 | mathematical | intersection-sign-error | Rejected ✓ |
| M34 | mathematical | intersection-y-not-x | Rejected ✓ |
| M35 | mathematical | candidate-must-satisfy-both | Rejected ✓ |
| M36 | mathematical | table-delta-over-input-delta | Rejected ✓ |
| M37 | mathematical | negative-slope-association | Rejected ✓ |
| M38 | mathematical | substitution-keeps-intercept | Rejected ✓ |
| M39 | mathematical | same-rate-is-tie | Rejected ✓ |
| M40 | mathematical | same-start-is-tie | Rejected ✓ |
| M41 | schema | plain-zod-object-required | Rejected ✓ |
| M42 | schema | zod-effects-union-collapse | Rejected ✓ |
| M43 | grading | fabricated-exploration-filter | Rejected ✓ |
| M44 | accessibility | keyboard-stage-control | Rejected ✓ |
| M45 | accessibility | non-color-line-semantics | Rejected ✓ |
| M46 | reveal | ghost-does-not-overwrite | Rejected ✓ |
| M47 | variant | surface-upgrade-required | Rejected ✓ |
| M48 | variant | slope-prose-parser-required | Rejected ✓ |
| M49 | variant | context-proportional-parser-required | Rejected ✓ |
| M50 | capability | authoritative-capability-entry | Rejected ✓ |
| M51 | historical-regression | stale-source-hash | Rejected ✓ |
| M52 | mathematical | package-root-drift | Rejected ✓ |
| M53 | mathematical | tar-reextraction-hash-mismatch | Rejected ✓ |

## Valid controls

- ✓ A grows faster while B starts higher
- ✓ intersection is exactly (3,11)
- ✓ valid controls have no integrity errors

**Result:** 53/53 mutations rejected; controls 3/3.
