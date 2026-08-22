# S268 — Measure, Money & Time source-local implementation

## Scope

- Course: `measure-money-time`; source tree clean at entry.
- Live baseline: 58 rows, **7 P0** causes across six lessons.
- This packet changes only course lesson JSON plus its repair, test, and report. No shared renderer, figure registry, queue, cache, cards, ledger, or standards artifact is changed.

## Exact P0 dispositions and repair

| Queue cause | Source action | Evidence |
| --- | --- | --- |
| `mmt-03-02/c2` coin visual | Retained | `mmt-biggest-first` renders the exact sequence in text: 25, 50, 75. |
| `mmt-04-03/c1` clock visual | Synchronized | Body now explicitly reads the retained figure as 3:20 and derives 4 × 5 = 20. |
| `mmt-05-01/c1` picture graph | Rebound | `single-scale-graph` (bar chart) → `mmt-picture-graph` (one picture = one). |
| `mmt-05-03/c1` line plot | Rebound | `single-scale-graph` (bar chart) → `md3-lineplot` (stacked X marks). |
| `mmt-02-01` diversity | Reworked | Challenge is now a three-object estimate match, a new formal/transfer action. |
| `mmt-04-03` diversity | Reworked | Challenge now reads hand positions through a misconception-aware MCQ, distinct from clock setting/elapsed time. |
| `mmt-05-02` progression | Reworked | The duplicate direct-reading sequence now includes graph comparison, a scale-error diagnostic, named graph reading, and a difference challenge. |

Stable lesson and step IDs are preserved. Each new MCQ has one correct option; all matching targets are reachable. Existing evaluator answer values remain truthful.

## Evidence and residuals

- Guarded idempotent repair: `scripts/session/s268-measure-money-time-course-repair.mjs`.
- Aggregate regression: `src/lib/session268.measureMoneyTimeCourse.test.ts` checks exact visual semantics, figure rebindings, distinct P0 widget types, answer contracts, and no repeated P0 prompt.
- Source-verifiable P0 closures: **7/7**.
- Residual independent assessor rows: **51** (non-P0 queue work); no queue/ledger status is altered by this packet.
