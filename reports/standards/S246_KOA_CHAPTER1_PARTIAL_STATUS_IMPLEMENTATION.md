# S246 K.OA Chapter 1 partial-status implementation

## Result

The Phase-1 blocker recorded in `S246_KOA_CHAPTER1_COMMON_CORE_CANARY.md` is closed for the bounded
`add-subtract-10-k` Chapter 1 canary. Standards decisions now use the canonical contract
`candidate | partial | approved | rejected`; legacy `ready-for-human-review | approve | reject`
values remain readable and normalize to their canonical equivalents.

No full-intent approval was created. The two exact Common Core candidates are signed as `partial`.

## Bounded mappings

The source-controlled override covers only `koa-01-01` through `koa-01-05` and the five Chapter 1
concept tags. The full mastery builder consumes the override, while the standards-only applicator
allows this bounded evidence to be refreshed without rewriting mastery artifacts.

| Edge | Standard | Lessons | Disposition | Claim boundary |
|---|---|---:|---|---|
| `8900583c72ca2c802bed757a` | `K.OA.A.1` | 5 | `partial` | Addition representations only; no subtraction evidence. |
| `79471c7e3ec00a6c3a9c8e08` | `K.OA.A.2` | 5 | `partial` | Addition problems with totals through 9 only; no subtraction problems or assessments. |

Each dossier contains 30 tagged step-evidence references across the five lessons, including
independent checks and challenges. The exact official standard page URL and the bounded benchmark
snapshot documented by the earlier canary are signed into each decision.

## Decision safety

- Ledger schema: version 2.
- Candidate dossiers: 6,119.
- Partial dossiers and valid signed decisions: 2.
- Approved dossiers: 0.
- Rejected dossiers: 0.
- Invalid or stale decisions: 0.
- Total dossiers: 6,121.

`partial` remains open for full-intent standards closure. Queue logic already closes only
`approved` or `rejected`; the lesson-card validator now counts partial decisions separately and
continues to include them in pending standards work.

## Verification

- Focused Vitest: 4 tests passed.
- TypeScript typecheck: passed.
- Standards decision verifier: 2/2 valid, 0 invalid.
- Mapping/dossier regeneration idempotence: zero hash mismatches across the five standards data
  artifacts.
- Script syntax checks: passed.
- No lesson content, generators, widgets, mastery data, global queue, lesson cards, or V4 cache were
  written by this lane.
