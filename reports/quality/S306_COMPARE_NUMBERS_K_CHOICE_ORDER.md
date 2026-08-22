# S306 — Compare Numbers Kindergarten Choice-Order Parity

## Source evidence

The freshly regenerated queue identifies CHOICE-0126 through CHOICE-0129 in the clean `compare-numbers-k` course. Full source auditing verified the root cause across the complete main sequence: all 34 learner-facing MCQs have four stable option IDs and exactly one stable correct option (`o0`), authored first in every array. This makes answer position predictable beyond the four queue samples.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `11fd5788cf52be38613a496a3ca6d0ee5b8c0b8f31a9056efb2e558244be90ca`.

## Repair

All 34 existing main-sequence MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3 in a 12/11/11 distribution. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior remain unchanged.

`scripts/session/s306-compare-numbers-k-choice-order-repair.mjs` seals the exact 34-item inventory with SHA-256 and accepts only the exact pre-repair or expected repaired order for every course MCQ. It fails on inventory, ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace.

The repaired source-set SHA-256 is `66b2da8927166799e18de8c8e14a94238c5b1121fa36fdc43e70cafb4cb22621`.

## Boundaries

Only the 12 course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s306-compare-numbers-k-choice-order-repair.mjs
node scripts/session/s306-compare-numbers-k-choice-order-repair.mjs
pnpm exec vitest run src/lib/session306.compareNumbersKChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/compare-numbers-k scripts/session/s306-compare-numbers-k-choice-order-repair.mjs src/lib/session306.compareNumbersKChoiceOrder.test.ts reports/quality/S306_COMPARE_NUMBERS_K_CHOICE_ORDER.md
```
