# S310 — Kindergarten Counting & Numbers Choice-Order Parity

## Source evidence

The live backlog retains P0/P1 source rows for the clean `counting-to-20-k` course. Full source auditing establishes the concrete course-level root cause: all 15 main learner-facing MCQs have four stable option IDs (`a`–`d`) and exactly one stable correct option (`a`), authored first in every array. This makes the answer position predictable across the complete course.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `7db3e77f14689290f8270e835ee367876a6a1e763caf10cfb8a2f2379758c0a7`.

## Repair

All 15 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in an even 5/5/5 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s310-counting-to-20-k-choice-order-repair.mjs` seals the exact 15-item inventory with SHA-256 and accepts only the exact pre-repair or expected repaired order for every course MCQ. It fails on inventory, ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace.

The repaired source-set SHA-256 is `b7dcb18071824bfcbed7a104a0c650d94114e304b689d9aa60b4e52256092e1e`.

## Boundaries

Only the 13 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s310-counting-to-20-k-choice-order-repair.mjs
node scripts/session/s310-counting-to-20-k-choice-order-repair.mjs
pnpm exec vitest run src/lib/session310.countingTo20KChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/counting-to-20-k scripts/session/s310-counting-to-20-k-choice-order-repair.mjs src/lib/session310.countingTo20KChoiceOrder.test.ts reports/quality/S310_COUNTING_TO_20_K_CHOICE_ORDER.md
```
