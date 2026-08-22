# S266 — Ratios & Rates source repair

## Outcome

Six P0 concept bindings rendered fixed examples that did not match the adjacent ratio, rate, or percent claim. They are withheld until an exact semantic visual exists; no mismatched diagram remains learner-visible.

Two P1 source causes were also repaired:

- `rr-02-02/k2` now has three 40–42 character answer labels, removing the correct-answer length cue while retaining its one defensible answer.
- `rr-04-02/k2` applies 30% to a price context instead of repeating the prior bare percent-of-number template. Its numeric target remains 27.

## Queue-compatible scope

| Stream | Before | Source result |
| --- | ---: | ---: |
| P0 illustration replacement | 6 | 6 fixed-exemplar bindings safely withheld |
| P1 choice integrity | 1 | 1 length-balanced answer surface |
| P1 progression | 1 | 1 price-context transfer |
| P1 lesson / visual / language review | 48 | Preserved for independent assessment |

Queue/card/cache regeneration is deliberately deferred until all source writers finish.

## Verification

- `node scripts/audit/repair-ratios-rates-s266.mjs --check`
- `pnpm exec vitest run src/lib/session266.ratiosRatesSourceRepair.test.ts`
- Full content schema, pedagogy, strict CML, TypeScript, ESLint, and whitespace checks at the frozen-tree boundary.
