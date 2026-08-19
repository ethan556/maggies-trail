# S264 The Real Number System P0 Repair

## Scope

This source-local packet audits all nine `the-real-number-system` lessons and repairs the three current P0 rows without changing shared runtime, the figure registry, schema, queue, review cards, cache, ledgers, or standards evidence. Stable lesson and step IDs, widget types, item IDs, correct order, option correctness, and evaluator behavior are preserved.

## P0 source closures

| Queue row | Source repair | Evidence |
| --- | --- | --- |
| `VIS-rns-01-03-c1-rns-convert-repeating` | `rns-01-03/c1` now explicitly introduces the registered worked exemplar. | Body, SVG title, visible equations, and ARIA description agree that 0.45 repeating equals 45/99, which simplifies to 5/11. `isFigureTextAligned` now returns true. |
| `VIS-rns-01-03-c2-rns-convert-repeating` | `rns-01-03/c2` now names the diagram's exact decimal form while explaining why a two-digit block requires multiplication by 100. | The body contains the complete fixed claim and the same intermediate equations as the visible and accessible diagram. `isFigureTextAligned` now returns true. |
| `PROGRESSION-rns-03-03` | `rns-03-03/ch1` is now an interval-bracketing transfer rather than a second generic “Order from least to greatest” prompt. | Learners use perfect-square bounds to build the chain √8 < 2.9 < 3 < √10. The drag-order widget, item IDs, correct order, and feedback truth are unchanged. |

Result: **3/3 P0 rows source-closed; 0 P0 residuals.**

## Executable evidence

- `scripts/audit/repair-the-real-number-system-s264.mjs` audits all nine lessons, targets only the two affected files, preserves stable step IDs and widget types, leaves seven non-target lessons byte-for-byte unchanged, and is idempotent.
- `src/lib/session264.theRealNumberSystemP0Integrity.test.tsx` verifies all nine lessons for schema, pedagogy, widget integrity, exact figure/body/ARIA parity, distinct prompt jobs, drag-order evaluator truth, and whole-course MCQ evaluator/feedback agreement.
- Focused regression: 5/5 tests pass.
- Full gates: content schema, pedagogy (1,711/1,711 clean), strict CML (0 errors, 0 warnings), TypeScript, and scoped ESLint all pass.
- Current course seal: `e5326e64120146e6bed7520d322fbb742a7f7db031a056a80e5c0eb38f3380c5`.

## Boundaries

P1 generic lesson, visual-disposition, language, choice, and remaining progression rows are not self-closed. They remain subject to independent current-source assessment. No authoritative queue, review-card, cache, ledger, or standards artifact was regenerated.
