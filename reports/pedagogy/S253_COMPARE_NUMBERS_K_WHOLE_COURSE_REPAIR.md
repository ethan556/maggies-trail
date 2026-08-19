# S253 Compare Numbers K whole-course repair

## Result

The bounded `compare-numbers-k` portfolio closes all 40 source-controlled rows in the current 76-row course queue while preserving the 36 assessor-controlled lesson, visual, and language disposition rows for independent review.

| Workstream | Before | Source cause after |
|---|---:|---:|
| ILLUSTRATION_REPLACEMENT | 24 | 0 |
| LESSON_PROGRESSION_AND_DUPLICATION | 12 | 0 |
| CHOICE_SURFACE_INTEGRITY | 4 | 0 |
| Generic three-stream dispositions | 36 | 36 pending independent review |

Expected source-only queue change after serial regeneration: **76 → 36**.

## Implementation

- Replaced all 24 suppressed `count-on-hops` concept placements with registered, learner-appropriate comparison figures covering pairing, leftovers, greater/less, equality under rearrangement, and ordering.
- Synchronized every changed concept body and narration with its visible figure example.
- Rebuilt every cloned `i2` as a different comparison job and repaired all detector-identified normalized prompt collisions in `ch1`, `k1`, or `k3`.
- Rewrote the four flagged MCQs with parallel misconception-based labels while preserving option IDs, correct markers, evaluator routing, and diagnostic feedback.
- Corrected the stale `dragOrder` success message that claimed `21, 22, 23, 24, 25` for cards containing `7, 8, 9, 10`.

The idempotent repair authority is `scripts/audit/repair-compare-numbers-k-s253.mjs`; its current course seal is `36bbd9cf326b6e282bdc11c786dd4782badd8e72e12a6736c3cfcad8b864119d`.

## Verification

- focused whole-course regression: 4/4 PASS
- schema validation: PASS
- pedagogy: 1,711/1,711 PASS
- strict CML: 0 errors / 0 warnings
- global TypeScript: PASS
- focused ESLint: PASS
- guarded repair `--check`: CURRENT, 0 changed
- scoped diff check: PASS (line-ending advisories only)

No shared widget, schema, figure registry, queue, review-card, cache, standards, or decision-ledger file was changed by this packet.
