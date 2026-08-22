# S305 — Measure and Compare Kindergarten Choice-Order Parity

## Source evidence

The fresh live queue identifies CHOICE-0139 through CHOICE-0142 in the clean `measure-compare-k` course. Full source auditing verified the underlying course-wide source cause: all 23 learner-facing main-sequence MCQs have four stable option IDs and exactly one stable correct option (`o0`), authored first in every array. This fixed-order pattern makes answer position predictable beyond the four individually flagged source rows.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `57d0042d0072904ae9c89ef5707bbc3f8011aaa3ac22f03d1ab43d17d4aea82b`.

## Repair

All 23 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in an 8/8/7 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s305-measure-compare-k-choice-order-repair.mjs` accepts only the exact pre-repair order or the exact expected repaired order for every course MCQ. It fails on inventory, ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace.

The repaired source-set SHA-256 is `d562bc93608c4b67bc6d3a551c602d197bd13e06dffd4b1d6aa19b7663cf9722`.

## Boundaries

Only the 12 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s305-measure-compare-k-choice-order-repair.mjs
node scripts/session/s305-measure-compare-k-choice-order-repair.mjs
pnpm exec vitest run src/lib/session305.measureCompareKChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/measure-compare-k scripts/session/s305-measure-compare-k-choice-order-repair.mjs src/lib/session305.measureCompareKChoiceOrder.test.ts reports/quality/S305_MEASURE_COMPARE_K_CHOICE_ORDER.md
```
