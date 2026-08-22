# S311 — Grade 1 Addition & Subtraction within 20 Choice-Order Parity

## Source evidence

The fresh post-commit queue retains open P1 source work for the clean `add-subtract-20` course. Full source auditing establishes the concrete course-level root cause: every main learner-facing MCQ has one stable correct option (`a`) authored first. The 17 checks comprise 15 three-option arrays (`a`, `b`, `c`) and two two-option arrays (`a`, `b`), with the correct option at index zero in all 17 cases.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `79fa4b80beab65c934d49e905f8b0ec89f33e6aa4d9e377d664ce5161f53da82`.

## Repair

All 17 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option never renders first. The 15 three-option checks distribute correct answers 8/7 between indices 1 and 2; both two-option checks put the correct answer at index 1. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s311-add-subtract-20-choice-order-repair.mjs` seals the exact 17-item inventory, including each original option-shape contract, with SHA-256. It accepts only the exact pre-repair or expected repaired order for every course MCQ and fails on inventory, ID, correct-answer, source-shape, or separator drift while preserving surrounding source whitespace.

The repaired source-set SHA-256 is `f008a748bca7d99c41405d20756845a5b9fb4fb9107a6283adde14c760981b07`.

## Boundaries

Only the 17 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s311-add-subtract-20-choice-order-repair.mjs
node scripts/session/s311-add-subtract-20-choice-order-repair.mjs
pnpm exec vitest run src/lib/session311.addSubtract20ChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/add-subtract-20 scripts/session/s311-add-subtract-20-choice-order-repair.mjs src/lib/session311.addSubtract20ChoiceOrder.test.ts reports/quality/S311_ADD_SUBTRACT_20_CHOICE_ORDER.md
```
