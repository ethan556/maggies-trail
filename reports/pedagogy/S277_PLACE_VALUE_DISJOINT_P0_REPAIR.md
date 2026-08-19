# S277 Grade 3 Place Value Disjoint P0 Repair

## Scope and collision boundary

The K–G3 collision inventory found no wholly clean course with current source-backed P0 work. Every candidate had recent uncommitted lesson changes. With explicit approval, this packet takes the nine disjoint P0 placements in `place-value` while excluding the only dirty lesson, `pv-03-02.json`.

The excluded row is `VIS-pv-03-02-c1-pv3-regroup`. Neither that lesson nor its pre-existing `c2` figure withholding was read-modify-written by this packet. The seven owned lessons were clean immediately before editing. Stable lesson/step IDs, widgets, answers, option IDs, evaluator behavior, and feedback are preserved. Shared runtime, figure registry, generated claims, queue, cards, cache, ledgers, and standards artifacts remain untouched.

## Exact source closures

| Queue row | Disposition | Source evidence |
| --- | --- | --- |
| `VIS-pv-01-02-c1-pv3-expanded` | Retained and synchronized | Body now states the exact visible/ARIA exemplar, 342 = 300 + 40 + 2. |
| `VIS-pv-01-02-c2-pv3-expanded` | Retained and synchronized | Body explicitly uses expanded form and the separated hundreds/tens/ones structure without asserting a competing fixed example. |
| `VIS-pv-01-03-c2-pv3-compare` | Retained and synchronized | Body now coordinates 342 > 328, with hundreds tied and 4 tens > 2 tens, exactly as the figure shows. |
| `VIS-pv-02-04-c2-pv3-round-ten` | Withheld | The fixed 47-to-50 rounding figure does not represent the 512 − 289 estimate guard; the figure binding is removed while the valid learner job remains. |
| `VIS-pv-03-01-c2-pv3-jump` | Withheld | The fixed 47 + 23 jump does not show the authored 356 + 99 overshoot-and-repay strategy; the binding is removed rather than showing contradictory numbers. |
| `VIS-pv-03-03-c1-pv3-borrow-zero` | Retained and synchronized | Body now teaches the exact 305 − 128 two-stage regroup shown visibly and accessibly. |
| `VIS-pv-03-04-c2-pv3-round-hundred` | Retained and synchronized | Body now identifies 349 rounding to 300 below the 350 halfway point before transferring the guard routine. |
| `VIS-pv-04-03-c1-pv3-times-tens` | Retained and synchronized | Body now states 4 × 60 = 24 tens = 240 and then transfers the method to story contexts. |
| `VIS-pv-04-03-c2-pv3-times-tens` | Withheld | A fixed one-step 4 × 60 figure does not represent the two-step story-planning job; the binding is removed. |

Result: **9/9 owned P0 rows source-closed: 6 aligned retained figures and 3 truthful fail-closed withholdings.** The single dirty `pv-03-02` P0 row remains explicitly outside this packet. No progression P0 rows were present in the authorized disjoint scope.

## Executable evidence

- `scripts/audit/repair-place-value-p0-s277.mjs` audits all 15 lessons, owns only seven clean lesson files, refuses to patch `pv-03-02`, preserves stable IDs/evaluator types, and is semantically idempotent across existing newline conventions.
- `src/lib/session277.placeValueP0Disjoint.test.tsx` verifies full-course schema/pedagogy/widget integrity, all six runtime alignment contracts, visible/title/ARIA presence, all three withholdings, exact row uniqueness, and whole-course MCQ evaluator/feedback agreement.
- Focused regression: 5/5 tests pass.
- Repair guard: `--check` reports `CURRENT`.
- Content schema validation passes.
- Pedagogy lint: 1,711/1,711 files clean.
- Strict CML lint: 0 errors and 0 warnings.
- TypeScript typecheck and scoped ESLint pass.
- Scoped `git diff --check` passes.
- Owned packet seal: `5f5d1163500253c174fac01ef071111534bccf8890e7bace7633c99eec49d6ca`.

## Residual authority

The excluded `pv-03-02` row and all generic P1 disposition streams remain assessor-controlled. This packet does not mutate or claim closure in any shared authority output.
