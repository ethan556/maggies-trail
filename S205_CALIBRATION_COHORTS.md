# S205 — calibration field-readiness: Algebra 1 · G6-8 · G2-3 (generated — do not hand-edit)

Field calibration needs real learners; this audit proves the three pilot cohorts are READY to
collect and states the sample each needs, derived from the contract's own gates.

| cohort | courses | lessons | concept tags | mastery cells | bank items | sessions needed (promotion) |
| --- | --: | --: | --: | --: | --: | --: |
| algebra-1 | 11 | 120 | 120 | 94 | 8 | 500 |
| g6-8 | 16 | 245 | 255 | 220 | 10 | 500 |
| g2-3 | 21 | 276 | 282 | 136 | 8 | 500 |

## Readiness checks

- ✓ active bank honestly awaiting field data — status=awaiting-field-data runId=null — a pre-seeded runId would fake provenance
- ✓ promotion requires a human — qualityGates.humanApprovalRequired
- ✓ prerequisite: export tool — scripts/export-diagnostic-field.cjs
- ✓ prerequisite: estimation tool — scripts/calibrate-diagnostic.cjs
- ✓ prerequisite: promotion tool (human gate) — scripts/promote-diagnostic-calibration.cjs
- ✓ prerequisite: field-store migration — db/migrations/004_diagnostic_calibration.sql
- ✓ prerequisite: runtime overlay guard — src/lib/placementBank.server.ts
- ✓ prerequisite: field client — src/lib/diagnosticFieldClient.ts
- ✓ prerequisite: contract — content/assessment/diagnostic-calibration-contract.json
- ✓ algebra-1: has courses — 11 courses / 120 lessons
- ✓ algebra-1: instrument covers the cohort — 8 placement items address this cohort (floor 4 — below that a per-cohort start-grade estimate is unidentifiable)
- ✓ algebra-1: mastery cells exist to calibrate against — 94 cells
- ✓ g6-8: has courses — 16 courses / 245 lessons
- ✓ g6-8: instrument covers the cohort — 10 placement items address this cohort (floor 4 — below that a per-cohort start-grade estimate is unidentifiable)
- ✓ g6-8: mastery cells exist to calibrate against — 220 cells
- ✓ g2-3: has courses — 21 courses / 276 lessons
- ✓ g2-3: instrument covers the cohort — 8 placement items address this cohort (floor 4 — below that a per-cohort start-grade estimate is unidentifiable)
- ✓ g2-3: mastery cells exist to calibrate against — 136 cells

Overall: READY TO COLLECT. Runtime stays on provisional seeds until a run passes every gate AND a named human approves it (promote-diagnostic-calibration.cjs).
