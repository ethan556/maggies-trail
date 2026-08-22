# S309 — Grade 4 Multiplication and Division Fluency P1 Progression Repair

## Scope

This source-local repair addresses only seven evaluator-safe lesson-revision roots in `mult-div-fluency-g4`. It leaves course figures, shared widgets, the queue, cards, cache, and all generic disposition streams unchanged.

## Closed source roots

Each affected `i2` keeps its stable ID and moves from a duplicate replay of `i1` to a distinct, evaluator-validated numeric learner job.

| Root | Lesson | New learner job | Exact answer |
| --- | --- | --- | --- |
| LESSON-REVISION-g4m-01-01 | `g4m-01-01` | Scale a basic fact with place value | 1,200 |
| LESSON-REVISION-g4m-01-02 | `g4m-01-02` | Add two partial products | 96 |
| LESSON-REVISION-g4m-02-01 | `g4m-02-01` | Compensate from a friendly factor | 2,254 |
| LESSON-REVISION-g4m-02-02 | `g4m-02-02` | Use partial products to check an exact claim | 282 |
| LESSON-REVISION-g4m-02-05 | `g4m-02-05` | Find the remainder after a large division chunk | 24 |
| LESSON-REVISION-g4m-03-04 | `g4m-03-04` | Divide compatible numbers for an estimate | 300 |
| LESSON-REVISION-g4m-03-05 | `g4m-03-05` | Multiply a proposed quotient by its divisor | 654 |

## Current source seal and gates

The current 16-lesson source seal is
`0c94eb4c09a571aa79f337875cb92256eb7cf993adc5c3991b7d5cbb9ca389c1`.
It is SHA-256 over sorted lesson filenames and each file's SHA-256 digest.

Passed against this source:

- S309 repair guard `--check` — current, zero pending repairs
- focused Vitest — 2 files, 9 tests
- `pnpm validate:content`
- `pnpm lint:pedagogy` — 1711/1711 files clean
- `pnpm cml:lint:strict` — 0 errors, 0 warnings
- `pnpm typecheck`
- scoped ESLint and `git diff --check`

The regression validates schema, widget integrity, each exact answer through the live evaluator, preserved `i2` IDs, distinct widget surfaces, and step-level CML action goals.

## Explicit residual

`LESSON-REVISION-g4m-02-04` remains open. Its intended partial-quotients job requires an exact semantic partial-quotients figure; no such registered figure is available in the current registry. The existing broad size-check interaction and its current concepts are therefore deliberately unchanged. This packet neither rebinds a non-equivalent visual nor represents that root as closed.

## Guard and evidence

`scripts/session/s309-mult-div-fluency-g4-progression-repair.mjs` is an idempotent source guard. It rejects unexpected source drift, reports seven pending safe repairs before application, and reports current only after every exact replacement is present. The source seal and gate outputs are recorded above.
