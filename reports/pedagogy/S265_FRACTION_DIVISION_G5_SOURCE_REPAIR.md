# S265 — Fraction Division G5 source repair

## Outcome

The 12-lesson course had 24 P0 illustration rows: every concept was bound to the generic `count-on-hops` renderer despite teaching sharing, fraction notation, or dividing by a unit fraction.  That renderer supplies neither the stated quantities nor the division model, so all 24 bindings are now intentionally withheld rather than presenting a contradictory diagram.

Three additional queued normalized prompt repeats are now distinct learner jobs:

- `g5f-01-01/ch1` checks an equal-share bead context.
- `g5f-01-02/i2` builds a hiker's bar share.
- `g5f-03-01/k3` uses multiplication-back to count half-pieces.

Stable step IDs, widget families, evaluator targets, and answers were retained.

## Queue-compatible scope

| Stream | Before | Source result |
| --- | ---: | ---: |
| `ILLUSTRATION_REPLACEMENT` P0 | 24 | 24 unsafe generic bindings removed |
| `LESSON_PROGRESSION_AND_DUPLICATION` P1 | 3 | 3 distinct transfer jobs |
| Lesson / visual / language review P1 | 36 | Left for independent assessment |

This is a source repair only. The shared queue, review cards, cache, and planning reports must be regenerated serially after concurrent source writers settle.

## Verification

- `node scripts/audit/repair-fraction-division-g5-s265.mjs --check`
- `pnpm exec vitest run src/lib/session197.fractionDivisionG5.test.ts src/lib/session244.fractionDivisionDiversity.test.ts src/lib/session265.fractionDivisionG5VisualRepair.test.ts`
- Content schema, pedagogy, strict CML, TypeScript, scoped ESLint, and whitespace checks at the final frozen-tree boundary.
