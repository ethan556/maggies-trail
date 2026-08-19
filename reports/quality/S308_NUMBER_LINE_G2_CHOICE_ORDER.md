# S308 — Grade 2 Number Line Choice-Order Parity

## Source evidence

The live queue identifies the queue-backed P1 choice rows `CHOICE-0087` and `CHOICE-0088` in `g2l-02-03`. Full source auditing establishes the course-level root cause: all 14 main learner-facing MCQs have four stable option IDs and exactly one stable correct option (`o0`), authored first in every array. That predictable placement affects the entire number-line course, beyond the two queued checks.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `b888be785d384f26afb86281ccd9132214e4207e547d0df8dc8f5b181efbd569`.

## Repair

All 14 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in a 5/5/4 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s308-number-line-g2-choice-order-repair.mjs` seals the exact 14-item inventory with SHA-256 and accepts only the exact pre-repair or expected repaired order for every course MCQ. It fails on inventory, ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace.

The repaired source-set SHA-256 is `1b8e821df97b488fe0b687f8b6bca0498007dec177d4fc045fed3f9f65e40823`.

## Boundaries

Only the 10 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s308-number-line-g2-choice-order-repair.mjs
node scripts/session/s308-number-line-g2-choice-order-repair.mjs
pnpm exec vitest run src/lib/session308.numberLineG2ChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/number-line-g2 scripts/session/s308-number-line-g2-choice-order-repair.mjs src/lib/session308.numberLineG2ChoiceOrder.test.ts reports/quality/S308_NUMBER_LINE_G2_CHOICE_ORDER.md
```
