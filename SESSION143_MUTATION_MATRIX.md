# Session 143 Adversarial Mutation Matrix

Every listed defect was deliberately introduced into a proof specimen or source copy. A passing row means the gate rejected the mutation.

| ID | Category | Deliberate defect | Gate result |
|---|---|---|---|
| M01 | mathematical | away-only-distance-falls | Rejected ✓ |
| M02 | mathematical | story-truth-mismatch | Rejected ✓ |
| M03 | mathematical | story-truth-mismatch | Rejected ✓ |
| M04 | mathematical | story-truth-mismatch | Rejected ✓ |
| M05 | mathematical | story-truth-mismatch | Rejected ✓ |
| M06 | integrity | duplicate-segment-id | Rejected ✓ |
| M07 | integrity | duplicate-segment-label | Rejected ✓ |
| M08 | integrity | duplicate-bank-id | Rejected ✓ |
| M09 | integrity | duplicate-wrong-sequence | Rejected ✓ |
| M10 | integrity | wrong-equals-target | Rejected ✓ |
| M11 | variant | surface-fallback | Rejected ✓ |
| M12 | integrity | duplicate-claim | Rejected ✓ |
| M13 | visual | no-separate-reveal | Rejected ✓ |
| M14 | reveal | reveal-overwrite-risk | Rejected ✓ |
| M15 | accessibility | keyboard-button-missing | Rejected ✓ |
| M16 | accessibility | stage-aria-label-missing | Rejected ✓ |
| M17 | visual | color-only-semantics | Rejected ✓ |
| M18 | historical-regression | stale-generator-sweep | Rejected ✓ |
| M19 | package-identity | wrong-package-root | Rejected ✓ |
| M20 | tar-re-extraction | reextracted-hash-mismatch | Rejected ✓ |

## Valid controls

- ✓ Downward temperature is valid
- ✓ Downward distance-from-origin is valid when return travel is explicit

**Result:** 20/20 mutations rejected; controls 2/2.
