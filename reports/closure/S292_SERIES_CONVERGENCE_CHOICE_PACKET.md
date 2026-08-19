# S292 — Series & Convergence: Choice-Surface Parity

Source-local packet for Grade 13 `series-convergence`.

## Closed source boundary

All nine P1 choice rows are repaired: `CHOICE-0233` through `CHOICE-0241`, spanning nth-term, comparison, ratio, alternating, Taylor, and radius-of-convergence reasoning.

Each repair changes only answer labels. Step IDs, option IDs, correct option (`o1`), prompt, feedback, concept tag, variant form, and evaluator behavior are preserved. The revised wrong options now express plausible competing reasoning at comparable length, so answer selection cannot be cued by explanation density.

## Reproducible checks

```text
node scripts/session/s292-series-convergence-choice-repair.mjs --check
node scripts/session/s292-series-convergence-choice-guard.mjs
npx vitest run src/lib/session292.seriesConvergenceChoice.test.ts
```

The repair is idempotent. The guard and regression source-seal all evaluator and label contracts, one-correct-option behavior, feedback presence, and the threshold that catches renewed length leakage.

## Residual boundary

Generic grade-language, disposition, and visual-review records remain assessor-owned. This packet does not write shared figures, the queue, cards, portfolios, cache, or other derived evidence.
