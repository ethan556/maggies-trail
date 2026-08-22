# S263 Measure Convert P0 Repair

## Scope and authority

This bounded source-local packet audits all 15 lessons in `measure-convert` and repairs the seven current P0 illustration-replacement rows assigned to four lessons. It does not mutate the queue, review cards, cache, ledgers, standards evidence, shared figure registry, schema, or runtime.

The repair preserves lesson, step, and widget identifiers together with evaluator type and correct-answer semantics. Existing registered figures are used only where their visible and accessible claims align with the authored concept text.

## Source closures

| Queue row | Current source binding | Verified semantic alignment |
| --- | --- | --- |
| `VIS-mc-02-01-c1-mc-area-formula` | `mc-02-01/c1` → `mc-area-formula` | Rectangle area is `5 × 3 = 15` square units. |
| `VIS-mc-02-01-c2-mc-area-formula` | `mc-02-01/c2` → `dop-two-by-two` | `23 × 45` is partitioned into `800 + 120 + 100 + 15 = 1,035`. |
| `VIS-mc-03-02-c1-mc-protractor` | `mc-03-02/c1` → `mc-protractor` | The half-circle scale runs from `0°` to `180°` with the vertex on the baseline. |
| `VIS-mc-03-02-c2-mc-protractor` | `mc-03-02/c2` → `mc-protractor` | The authored explanation names the visible `0°, 30°, 60°, 90°, 120°, 150°, 180°` marks. |
| `VIS-mc-04-01-c1-mc-additive` | `mc-04-01/c1` → `mc-additive` | Adjacent angles combine as `30° + 40° = 70°`. |
| `VIS-mc-04-01-c2-mc-additive` | `mc-04-01/c2` → `mc-additive` | The same diagram supports decomposing the non-benchmark `70°` total. |
| `VIS-mc-04-02-c1-mc-missing-angle` | `mc-04-02/c1` → `g7-comp-supp` | Complementary angles total `90°`; supplementary angles form a straight `180°` line. |

Result: **7/7 P0 source rows closed; 0 P0 residuals.**

## Additional learner-visible truth repair

`mc-04-02/c2` was synchronized with its existing `mc-missing-angle` figure. The former prose reversed the displayed known and missing angle. The current concept consistently states `90° − 55° = 35°` in body, narration, visible figure text, title, and accessible description.

## Guard and regression evidence

- `scripts/audit/repair-measure-convert-s263.mjs` is guarded and idempotent. It changes only the four owned lessons and leaves the other 11 course lessons byte-for-byte unchanged.
- `src/lib/session263.measureConvertP0Integrity.test.tsx` validates all 15 lessons against schema, pedagogy, and widget contracts; checks the eight repaired/synchronized concept bindings through SSR and accessible figure output; requires figure-text numeric alignment; and verifies whole-course MCQ/numeric evaluator agreement.
- Stable course seal after repair: `19af8d1630c998c9f5c00dbf89dd654ee853a0a3d36e82a6fe269249ebf54509`.
- Focused regression: 5/5 tests pass.
- Full gates: content schema, pedagogy (1,711/1,711 clean), strict CML (0 errors, 0 warnings), TypeScript, and scoped ESLint all pass.

## Boundaries

This packet makes no claim against P1 choice-surface, language, disposition, or progression rows. Those remain assessor-controlled until separately reviewed against current-source hashes. No generic disposition stream is self-closed here.
