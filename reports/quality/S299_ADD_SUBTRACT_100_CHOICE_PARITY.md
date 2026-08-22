# S299 — Add and Subtract Within 100 Grade 2 Choice Parity

## Source evidence

Fresh live source auditing found 16 MCQs across all 16 clean `add-subtract-100` lesson sources. Every widget used stable option IDs `a`, `b`, and `c`, with the correct option `a` rendered first in all 16 cases. The first-position pattern spans doubles, near doubles, make-ten strategies, place-value addition and subtraction, and mixed review.

The exact pre-repair source-set SHA-256 (the 16 lesson JSON files in sorted filename order) was `0cb53ddd7375c0aa76dfa228bbc4b9bcee741738e827fb959c74bed493081273`.

## Repair

The 16 source option arrays are deterministically reordered so their correct option displays at index 1 or 2, alternating eight cases each. Stable option ID `a`, option labels, feedback, correctness flags, and evaluator outcomes are retained exactly. This is a display-order-only repair.

`scripts/session/s299-add-subtract-100-choice-parity-repair.mjs` accepts only the original canonical `a|b|c` order or the exact expected repaired order for each step and fails on source drift.

The repaired source-set SHA-256 is `f4fc27c2c2163387471b7cb83fec8ee49db60d844a0e85755c8c8b0742093efe`.

## Boundaries

Only the 16 course lesson files, the guarded replay script, the focused regression, and this report change. Learner-job IDs, option identities and wording, correct answers, evaluator semantics, existing figure/progression repairs, generic human-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s299-add-subtract-100-choice-parity-repair.mjs
node scripts/session/s299-add-subtract-100-choice-parity-repair.mjs
pnpm exec vitest run src/lib/session299.addSubtract100ChoiceParity.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/add-subtract-100 scripts/session/s299-add-subtract-100-choice-parity-repair.mjs src/lib/session299.addSubtract100ChoiceParity.test.ts reports/quality/S299_ADD_SUBTRACT_100_CHOICE_PARITY.md
```
