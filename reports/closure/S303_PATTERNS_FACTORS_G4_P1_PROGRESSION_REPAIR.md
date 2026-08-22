# S303 — Patterns and Factors G4 P1 progression repair

## Scope and source seal

- Course: `content/courses/patterns-factors-g4` (10 lessons).
- Source-only, evaluator-preserving follow-on to S264. No figure, widget implementation, schema, registry, queue, card, cache, ledger, or derived artifact changed.
- Course seal after the repair: `70819cebca96877cfe0784498fc054654c97b15f3b8f202d56e34a66d957f554` (SHA-256 of sorted parsed lesson JSON).

## Closed source-compatible roots

| Root cause | Placement(s) | Learner job after repair |
| --- | --- | --- |
| `PROGRESSION-g4p-01-01` | `k3` | Complete a factor-pair record for 40. |
| `PROGRESSION-g4p-01-02` | `k3` | Complete a factor-pair record for 60. |
| `PROGRESSION-g4p-01-03` | `k2` | Check whether a total can make equal groups of 7. |
| `PROGRESSION-g4p-01-04` | `k3` | Check whether a total can make equal groups of 8. |
| `PROGRESSION-g4p-02-01` | `k3`, `ch1` | Use, then rule out, a nontrivial factor pair to classify a number. |
| `PROGRESSION-g4p-03-02` | `i2` | Test a teammate's proposed constant-increase rule. |
| `PROGRESSION-g4p-03-03` | `i2` | Test a classmate's claim about stated versus visible features. |
| `PROGRESSION-g4p-03-04` | `i2` | Verify a teammate's doubling claim from its starting value. |

This closes 8 exact source-compatible roots across 9 physical step placements. The repair changes only each listed step's `body` and `widget.prompt`; the S303 regression hash-locks every other field in the eight touched lessons. In particular, lesson/step IDs, widget types and configuration, option order/IDs/correctness/feedback, numeric answers, figures, and evaluator contracts are unchanged.

## Evidence and gates

- `node scripts/session/s303-patterns-factors-g4-p1-progression-repair.mjs --check` reports current (`changedPlacements: 0`).
- `src/lib/session303.patternsFactorsG4P1ProgressionRepair.test.ts` proves 8 roots / 9 placements, exact prompts, evaluator correctness, option contracts, interaction contracts, and non-permitted hashes.
- Focused regressions: S303 plus S264, 10/10 passing.
- `pnpm validate:content`, `pnpm lint:pedagogy` (1711/1711), `pnpm cml:lint:strict` (0 errors, 0 warnings), `pnpm typecheck`, and scoped ESLint pass.

## Intentionally retained queue work

The authoritative queue is not edited by this packet. Its 38 source-current course rows comprise 8 progression roots above plus 30 assessor-controlled rows: 10 lesson dispositions, 10 visual-first dispositions, and 10 grade-language reviews. Those require independent review authority rather than source-local self-closure.
