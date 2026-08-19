# S297 — Shapes & Equal Shares Grade 2 Choice Parity

## Source evidence

Fresh post-`c21763e` source auditing found 19 MCQs in the clean `shapes-shares-g2` course. Every source widget used stable option IDs `a`, `b`, and `c`, with the correct option `a` rendered first in all 19 cases. This produces a course-wide source-verifiable first-position pattern across shape vocabulary, equal parts, and fraction-size comparisons.

The exact pre-repair source-set SHA-256 (the nine lesson JSON files in sorted filename order) was `bf8dcf5ed61b6646b7c7f853477fd236b388add1a8a2b15463133034d34f7772`.

## Repair

The 19 source option arrays are deterministically reordered so their correct option displays at index 1 or 2, alternating 10 and 9 cases. The stable option ID remains `a`; each option’s label, feedback, correctness flag, and evaluator outcome are retained exactly. The repair changes display order only.

`scripts/session/s297-shapes-shares-g2-choice-parity-repair.mjs` accepts only the original canonical `a|b|c` order or the exact expected repaired order for each step and fails on source drift.

The repaired source-set SHA-256 is `097b931e5541da4539ae487eda1dd691b797b01dc767273ac63a42a8ae26da6a`.

## Boundaries

Only the six MCQ-bearing course lesson files, the guarded replay script, the focused regression, and this report change. Learner-job IDs, option identities and wording, correct answers, evaluator semantics, generic human-disposition rows, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s297-shapes-shares-g2-choice-parity-repair.mjs
node scripts/session/s297-shapes-shares-g2-choice-parity-repair.mjs
pnpm exec vitest run src/lib/session297.shapesSharesG2ChoiceParity.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/shapes-shares-g2 scripts/session/s297-shapes-shares-g2-choice-parity-repair.mjs src/lib/session297.shapesSharesG2ChoiceParity.test.ts reports/quality/S297_SHAPES_SHARES_G2_CHOICE_PARITY.md
```
