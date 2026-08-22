# S263 — Four Addends G2 whole-course repair

## Outcome

This source-local packet repairs all eight `four-addends-g2` lessons. Every P0
`count-on-hops` placeholder was removed, and each cloned `i2` activity became a distinct
learner-repair state. Lesson, step, and MCQ-option IDs remain stable; no shared runtime,
queue, review authority, cache, or ledger is changed.

| Workstream | Before | After | Evidence |
| --- | ---: | ---: | --- |
| `ILLUSTRATION_REPLACEMENT` | 16 | 0 | 14 exact semantic rebindings; 2 explicitly fail-closed numeric diagrams where no matching renderer exists. |
| `LESSON_PROGRESSION_AND_DUPLICATION` | 8 | 0 | Every i2 has a different transfer, reconstruction, or story state; named follow-ups are distinct. |

The expected serial refresh is **48 → 24**. The remaining 24 rows are the three independent
lesson-level streams (visual-first, grade-language, and complete disposition) for eight lessons.

## Visual truth boundary

- Staged totals, place-value splitting, friendly pairs, running totals, story sums, and reverse
  checks use registered accessible models only where the model actually supports the claim.
- `g2n-01-03/c2` (the exact `38 + 25 + 12` example) and `g2n-02-01/c2` (the exact `34 + 25`
  decomposition) are intentionally figureless: the existing fixed-number visuals would show a
  different calculation. They are retained as explicit asset debt rather than silently presenting
  contradictory numbers.

## Interaction integrity

The number-line retries use different start, hop, and landing states. The two pair-selection
retries use new visible labels while retaining their stable hotspot IDs and correct-selection
structure. Rewritten checks/challenges remove an additional normalized prompt collision that was
not yet represented by a queue row.

## Verification

- `node scripts/audit/repair-four-addends-g2-s263.mjs --check` — current and idempotent.
- `pnpm exec vitest run src/lib/session263.fourAddendsG2CourseIntegrity.test.tsx` — 4/4 passed.
- Scoped schema, pedagogy, figure alignment/rendering, widget integrity, and MCQ ID/correctness
  contracts are asserted by that focused suite.

Broader repository quality gates are run after the active parallel source packets reach their
coherent boundaries.
