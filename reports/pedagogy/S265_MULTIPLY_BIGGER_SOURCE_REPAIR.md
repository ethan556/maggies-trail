# S265 — Multiply Bigger source repair

## Outcome

Eleven P0 figures were attached beside fixed arithmetic examples that did not match the rendered quantities. They are now withheld rather than presenting a plausible but false illustration. No evaluator, option ID, or correct answer changed.

The three queued normalized repetitions are now distinct, generator-safe learner jobs:

- place-value multiplication (`mb-03-01/k2`),
- quotient-to-remainder reasoning (`mb-04-01/k3`), and
- multiplicative-pattern continuation (`mb-05-01/k3`).

## Queue-compatible scope

| Stream | Before | Source result |
| --- | ---: | ---: |
| P0 illustration replacement | 11 | 11 fixed-exemplar bindings safely withheld |
| P1 progression / duplication | 3 | 3 transfer prompts differentiated |
| P1 lesson revision implementation | 10 | Left for independent assessment |

Serial workload regeneration is required before treating these expected 14 source closures as queue closures.

## Verification

- `node scripts/audit/repair-multiply-bigger-s265.mjs --check`
- `pnpm exec vitest run src/lib/session265.multiplyBiggerSourceRepair.test.ts`
- Full content schema, pedagogy, strict CML, TypeScript, ESLint, and whitespace gates at the frozen-tree boundary.
