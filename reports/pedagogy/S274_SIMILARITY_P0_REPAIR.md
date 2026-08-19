# S274 Similarity P0 Repair

## Scope

`four-addends-g2` was excluded because all eight lesson files were already modified by another packet. `sampling-and-probability`, the first clean alternative, was excluded after explicit ownership coordination. This packet therefore takes the next clean course, `similarity`, audits all 16 lessons, and repairs its two current P0 rows without changing shared runtime, the figure registry, schema, queue, review cards, cache, ledgers, or standards evidence.

## P0 source closures

| Queue row | Source repair | Evidence |
| --- | --- | --- |
| `VIS-sy-04-01-c1-geometric-mean` | The concept now coordinates the fixed diagram's segments 4 and 9 and altitude 6 with its AA-similarity job. | The prose explains that each small right triangle shares an acute angle with the whole. Body, visible labels, and accessible description agree; `isFigureTextAligned` changed from false to true. |
| `VIS-sy-04-03-c2-geometric-mean` | The concept now uses the fixed 4–9–6 exemplar to distinguish the altitude relationship from the leg relationship. | The prose states `h = √(4·9) = 6`, then generalizes: altitude uses the two hypotenuse segments; a leg uses the whole hypotenuse and its adjacent segment. Body, visible labels, and ARIA description agree; `isFigureTextAligned` changed from false to true. |

Result: **2/2 P0 rows source-closed; 0 P0 residuals.**

## Executable evidence

- `scripts/audit/repair-similarity-p0-s274.mjs` audits all 16 lessons, targets exactly two lesson files, preserves stable step IDs and widget types, leaves 14 non-target lessons byte-for-byte unchanged, and is idempotent.
- `src/lib/session274.similarityP0Integrity.test.tsx` verifies all 16 lessons for schema, pedagogy, widget integrity, exact figure/body/ARIA parity, distinct instructional jobs, and whole-course MCQ evaluator/feedback agreement.
- Focused regression: 5/5 tests pass.
- Full gates: content schema, pedagogy (1,711/1,711 clean), strict CML (0 errors, 0 warnings), TypeScript, and scoped ESLint pass.
- Current course seal: `a84a06b1e497da4a5384bedc4988ad4e78840dc54c7baddb2a33b2aff079e2f4`.

## Boundaries

Generic P1 lesson, visual-disposition, language, choice, and progression streams are not self-closed. No authoritative queue, review-card, cache, ledger, or standards artifact was regenerated.
