# S298 — Counting to 120 Grade 1 Choice Parity

## Source evidence

Fresh live source auditing found 17 MCQs across all 15 clean `counting-120` lesson sources. Every widget used stable option IDs `a`, `b`, and `c`, with the correct option `a` rendered first in all 17 cases. The resulting first-position pattern spans order, row and column structure, tens and ones, comparison, and ten-more/ten-less work.

The exact pre-repair source-set SHA-256 (the 15 lesson JSON files in sorted filename order) was `fa791e14d812437ea017c4cfb3d5155ecd83c6962c64c15734e329519507afa5`.

## Repair

The 17 source option arrays are deterministically reordered so their correct option displays at index 1 or 2, alternating 9 and 8 cases. Stable option ID `a`, option labels, feedback, correctness flags, and evaluator outcomes are retained exactly. This is a display-order-only repair.

`scripts/session/s298-counting-120-choice-parity-repair.mjs` accepts only the original canonical `a|b|c` order or the exact expected repaired order for each step and fails on source drift.

The repaired source-set SHA-256 is `e894141848fee69e7c629125ee386a7019455c7f4e1ea7abab91ef0dcc6ec987`.

## Boundaries

Only the 15 course lesson files, the guarded replay script, the focused regression, and this report change. Learner-job IDs, option identities and wording, correct answers, evaluator semantics, generic human-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s298-counting-120-choice-parity-repair.mjs
node scripts/session/s298-counting-120-choice-parity-repair.mjs
pnpm exec vitest run src/lib/session298.counting120ChoiceParity.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/counting-120 scripts/session/s298-counting-120-choice-parity-repair.mjs src/lib/session298.counting120ChoiceParity.test.ts reports/quality/S298_COUNTING_120_CHOICE_PARITY.md
```
