# S274 Place Value Million P0 Repair

## Scope

This source-local packet audits all 14 `place-value-million` lessons and repairs the two current P0 visual rows. Ownership was confirmed with every active implementation lane before edits. Stable lesson and step IDs, widget types, option IDs, answers, evaluator behavior, and feedback remain unchanged. No shared runtime, figure registry, schema, queue, review cards, cache, ledgers, or standards evidence was changed.

## P0 source closures

| Queue row | Source repair | Evidence |
| --- | --- | --- |
| `VIS-pv2-01-03-c1-pv4-periods` | `pv2-01-03/c1` now uses `pv4-ladder` instead of an unrelated fixed period example. | The six visible and accessible ladder rungs exactly match the lesson's named places from ones through hundred-thousands, and each rung states the ×10 relationship. The body retains its 425,301 transfer example without contradicting the diagram. |
| `VIS-pv2-04-03-c1-pv3-borrow-zero` | `pv2-04-03/c1` now uses the Grade 4 `pv4-borrow-chain` and explicitly coordinates its worked example. | Body, visible arithmetic, and ARIA semantics all state that 4,002 − 1,357 = 2,645 and explain why the regrouping chain passes the zero tens and hundreds. |

Both placements changed from withheld to `isFigureTextAligned === true`.

Result: **2/2 P0 rows source-closed; 0 P0 residuals.**

## Executable evidence

- `scripts/audit/repair-place-value-million-p0-s274.mjs` audits all 14 lessons, targets exactly two files, preserves stable step IDs and widget types, leaves 12 non-target lessons byte-for-byte unchanged, and is idempotent.
- `src/lib/session274.placeValueMillionP0Integrity.test.tsx` verifies the complete course for schema, pedagogy, widget integrity, figure/body/ARIA parity, exact visible quantities, removed mismatched bindings, and MCQ evaluator/feedback agreement.
- Focused regression: 5/5 tests pass.
- Current course seal: `bc294d9a300efb851672cb30ed060f0fd12e725d604b1a18d46d02648c99b45d`.

## Boundaries

Generic P1 lesson, visual-disposition, language, choice, and progression streams remain subject to independent assessment. No authoritative queue or disposition artifact was regenerated.
