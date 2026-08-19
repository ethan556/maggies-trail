# S289 — Logarithms: Choice Parity and Exact Figure Retention

Source-local packet for the Grade 11 `logarithms` course.

## Scope and evidence

- Closed 8 P1 `CHOICE_SURFACE_INTEGRITY` rows: `CHOICE-0157` through `CHOICE-0164`.
- Revalidated 1 P0 source binding: `VIS-lg-05-03-c1-log-scale-ladder`.

The ladder is an exact semantic match for its concept: magnitudes 3–6 rise by one while the underlying bar values rise ×1, ×10, ×100, ×1000. The concept says a one-unit magnitude increase means ×10 and gives the 4/5/6 earthquake comparison. The source binding is retained and source-sealed; it is not replaced or silently withheld.

The existing generated blocklist still controls whether this valid source binding renders. Changing it is deliberately out of this course-local packet because it is a shared derived safety contract. That P0 runtime state remains explicit for the serial evidence owner; no unsafe source workaround was added.

For every MCQ, this packet preserves step ID, option IDs, correct option, feedback, prompt, and evaluator contract. Only labels changed, adding comparable misconception reasoning so prose length cannot disclose the answer.

## Reproducible checks

```text
node scripts/session/s289-logarithms-choice-repair.mjs --check
node scripts/session/s289-logarithms-choice-guard.mjs
npx vitest run src/lib/session289.logarithmsChoiceFigure.test.ts
```

The repair is idempotent. The guard and regression source-seal the retained figure relationship and all evaluator/label contracts.

## Residual boundary

The shared blocklist/render-state for `log-scale-ladder`, plus all generic grade-language, complete-disposition, and visual-first assessor rows, are not changed here. Queue, cards, portfolios, and cache remain intentionally stale until the global serial rebuild.
