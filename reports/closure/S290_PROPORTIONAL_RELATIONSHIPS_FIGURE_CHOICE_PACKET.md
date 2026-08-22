# S290 — Proportional Relationships: Figure Truth and Choice Parity

Source-local packet for Grade 7 `proportional-relationships`.

## Closed source boundary

- 5 P0 mismatched fixed-number figures were fail-closed: `VIS-pr-01-02-c1-fraction-unit-rate`, `VIS-pr-02-02-c3-pr-y-equals-kx`, `VIS-pr-03b-01-c1-pr-y-equals-kx`, `VIS-pr-04-01-c3-pr-percent-shortcut`, and `VIS-pr-04-02-c1-percent-price`.
- 1 P0 figure was retained after exact source verification: `pr-04-02/c2` / `pr-markdown`, where both source surfaces state `$80 × 0.95 = $76` (5% off, $4 reduction).
- 1 P1 MCQ was repaired: `CHOICE-0199` (`pr-04b-02/k3`). IDs, correctness, feedback, prompt, and evaluator contract are unchanged; only option-label parity changed.

The withheld figures otherwise displayed fixed examples not asserted by their bound text: a half-mile/quarter-hour rate under general prose, `k=3, x=5, y=15` under a `k=3, x=10, y=30` surface or a general rule, `$50 × 1.08 = $54` under generic language, and a $20/15% comparison under a $10/25% markup. No exact rebind was available in the registered figure library, so removal is the safe learner-visible state.

## Reproducible checks

```text
node scripts/session/s290-proportional-relationships-figure-choice-repair.mjs --check
node scripts/session/s290-proportional-relationships-figure-choice-guard.mjs
npx vitest run src/lib/session290.proportionalRelationshipsFigureChoice.test.ts
```

The repair is idempotent. The guard/test source-seal all retained concept texts, exact figure decisions, option IDs, evaluator parity, feedback presence, and the absence of renewed answer-length leakage.

## Residual boundary

Nine broad progression/revision rows remain deliberately unclaimed: `PROGRESSION-pr-02-01`, `-02-02`, `-03-01`, `-02-03`, `-03-02`, `-03b-01`, `-04-01`, `-04-03`, and `-04b-01`. They require question-job redesign beyond safe bounded visual/choice repair. Generic review rows and every shared/derived artifact remain untouched.
