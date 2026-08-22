# S313 — Kindergarten Number Writing Choice-Order Parity

## Source evidence

The fresh queue retains open P1 lesson-revision source work for the clean `number-writing-k` course. A full source audit establishes a concrete and more immediate course-level issue: all 35 main learner-facing MCQs across 14 lessons have four stable option IDs and exactly one stable correct option (`o0`), authored first in every array. This creates a predictable answer position throughout the course.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `3f6c825e9669373f121564dbdbad6f3c575e2e5ce7bda6b76b068ba72b96ece9`.

## Repair

All 35 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in a 12/12/11 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s313-number-writing-k-choice-order-repair.mjs` seals the exact 35-item inventory with SHA-256 and accepts only the exact pre-repair or expected repaired order for every course MCQ. It fails on inventory, ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace. The focused regression seals an order-independent aggregate semantic hash over every prompt, figure binding, and option payload, as well as every evaluator result.

The repaired source-set SHA-256 is `5e7caa954e65f35176404b12fc85051d9fa0c41541108b41a932661389ba328d`.

## Boundaries

Only the 14 course lesson files, the guarded replay script, the focused regression, and this report change. Generic remedial-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s313-number-writing-k-choice-order-repair.mjs
node scripts/session/s313-number-writing-k-choice-order-repair.mjs
pnpm exec vitest run src/lib/session313.numberWritingKChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/number-writing-k scripts/session/s313-number-writing-k-choice-order-repair.mjs src/lib/session313.numberWritingKChoiceOrder.test.ts reports/quality/S313_NUMBER_WRITING_K_CHOICE_ORDER.md
```
