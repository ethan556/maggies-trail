# S307 — Teen Numbers Kindergarten Choice-Order Parity

## Source evidence

The fresh queue identifies CHOICE-0143 in the clean `teen-numbers-k` course. Full source auditing verifies the root cause across the complete main sequence: all 26 learner-facing MCQs have four stable option IDs and exactly one stable correct option (`o0`), authored first in every array. This makes answer position predictable beyond the queue sample.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `7a694ac700e3b7b7d4d1e8c5e0bc6edf26bdc3bbdc178f6535d600bba446dfef`.

## Repair

All 26 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in a 9/9/8 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s307-teen-numbers-k-choice-order-repair.mjs` seals the exact 26-item inventory with SHA-256 and accepts only the exact pre-repair or expected repaired order for every course MCQ. It fails on inventory, ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace.

The repaired source-set SHA-256 is `e57bb275e2683a8a576b9ec26486a887125312b07c03e63eaf4df480f827fc93`.

## Boundaries

Only the 12 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s307-teen-numbers-k-choice-order-repair.mjs
node scripts/session/s307-teen-numbers-k-choice-order-repair.mjs
pnpm exec vitest run src/lib/session307.teenNumbersKChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/teen-numbers-k scripts/session/s307-teen-numbers-k-choice-order-repair.mjs src/lib/session307.teenNumbersKChoiceOrder.test.ts reports/quality/S307_TEEN_NUMBERS_K_CHOICE_ORDER.md
```
