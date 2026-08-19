# S275 Tens and Ones P0 Repair

## Scope and selection

`complex-numbers` was clean but had no current P0 source rows, so no P0 packet was fabricated. `systems-equations`, `two-step-equations`, and `fractions` were excluded because their target files contained recent uncommitted work; `vectors-matrices` was actively owned by another lane. This packet therefore takes the highest remaining clean and unowned course, `tens-and-ones`, audits all 12 lessons, and repairs its one current P0 row.

Stable lesson and step IDs, widget types, answers, option IDs, evaluator behavior, and feedback are preserved. Shared runtime, generated numeric claims, figure registry, schema, queue, review cards, cache, ledgers, and standards evidence remain untouched.

## P0 source closure

| Queue row | Source repair | Evidence |
| --- | --- | --- |
| `VIS-tno-02-03-c1-expanded-form` | The opening concept now explicitly coordinates the fixed `expanded-form` example before transferring to 52. | Body, visible equation, and accessible title all state 46 = 40 + 6: the 4 is worth 40 in the tens place and the 6 is worth 6 in the ones place. `isFigureTextAligned` changed from false to true. The next `baseTenCompose` interaction remains 52, preserving a distinct concrete transfer. |

Result: **1/1 P0 row source-closed; 0 P0 residuals.**

## Executable evidence

- `scripts/audit/repair-tens-and-ones-p0-s275.mjs` audits all 12 lessons, targets one file, preserves stable IDs and widget types, leaves 11 non-target lessons byte-for-byte unchanged, and is idempotent.
- `src/lib/session275.tensAndOnesP0Integrity.test.tsx` verifies the full course for schema, pedagogy, widget integrity, exact figure/body/ARIA parity, the preserved 52 concrete evaluator, and whole-course MCQ evaluator/feedback agreement.
- Focused regression: 5/5 tests pass.
- Current course seal: `129be6dfaad3b4e6a04099b220d75f8ef6581bc6ec4d2a5f70902ceb0713548c`.

## Boundaries

Generic P1 lesson, visual-disposition, language, choice, and progression streams remain subject to independent assessment. No authoritative queue or disposition artifact was regenerated.
