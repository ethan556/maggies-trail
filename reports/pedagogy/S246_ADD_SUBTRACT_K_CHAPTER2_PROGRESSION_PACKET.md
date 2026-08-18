# S246 Add/Subtract within 10 — Chapter 2 progression packet

## Scope and cause classification

The live workload queue contains 19 `LESSON_PROGRESSION_AND_DUPLICATION` rows for `add-subtract-10-k`. Every row is classified `OPEN_REPEAT_PURPOSE_OR_REDESIGN`, and every row is caused by number-normalized prompt repetition. None reports an exact prompt duplicate or a duplicate widget payload.

The rows split into three coherent chapter families:

- Chapter 1: 4 rows (`koa-01-02` through `koa-01-05`).
- Chapter 2: 5 rows (`koa-02-01` through `koa-02-05`).
- Chapter 3: 10 rows (`koa-03-01` through `koa-03-10`).

This bounded packet closes the complete Chapter 2 family. The shared figures, causal widget hosts, generator, standards data, and global evidence artifacts are intentionally unchanged.

## Implemented progression contract

| Lesson | Check 2 job | Check 3 job | Challenge transfer | Remedial action |
| --- | --- | --- | --- | --- |
| `koa-02-01` | Sketch and cross out | Diagnose Ava's incorrect remainder | Translate a new bird story to a subtraction sentence | Slide two of five counters away |
| `koa-02-02` | Predict, draw, and verify | Diagnose Mina's incorrect drawing | Choose the crossed-out picture for a new cat story | Draw five circles and cross out three |
| `koa-02-03` | Act out standing and sitting | Diagnose Leo's incorrect count | Choose the operation for a new duck story | Move one of four toy people home |
| `koa-02-04` | Translate a crossed-out picture to symbols | Correct Nia's operation-sign error | Translate number-line back-hops to a sentence | Model four blocks with one put away |
| `koa-02-05` | Model with fingers | Diagnose Jo's incorrect remainder | Solve a new kite story | Draw six balloons and cover two |

All five lessons retain their existing concept-specific figures and both `numberLineHop` causal hosts. Challenges use a new context or representation rather than repeating the preceding check with changed numbers. Remedials use a simpler concrete action and do not copy any primary prompt.

## Queue-defined closure evidence

The focused test implements the queue builder's lowercase, whitespace, and signed-number normalization rule. Before this packet, each row contained the following repeated normalized prompt steps; after the packet, each lesson has zero repeated normalized prompt step IDs.

| Work ID | Queue step path before | Repeated normalized prompts after |
| --- | --- | --- |
| `PROGRESSION-koa-02-01` | `k2 k3 ch1` | none |
| `PROGRESSION-koa-02-02` | `k2 k3 ch1` | none |
| `PROGRESSION-koa-02-03` | `k2 k3 ch1` | none |
| `PROGRESSION-koa-02-04` | `i2 k2 k3 ch1` | none |
| `PROGRESSION-koa-02-05` | `k2 k3 ch1` | none |

Expected queue delta after the coordinating lane regenerates deterministic evidence: **5 rows and 16 repeated normalized-prompt placements closed; 14 course rows remain open**.

## Deliberately open rows

- Chapter 1: `PROGRESSION-koa-01-02`, `PROGRESSION-koa-01-03`, `PROGRESSION-koa-01-04`, `PROGRESSION-koa-01-05`.
- Chapter 3: `PROGRESSION-koa-03-01`, `PROGRESSION-koa-03-02`, `PROGRESSION-koa-03-03`, `PROGRESSION-koa-03-04`, `PROGRESSION-koa-03-05`, `PROGRESSION-koa-03-06`, `PROGRESSION-koa-03-07`, `PROGRESSION-koa-03-08`, `PROGRESSION-koa-03-09`, `PROGRESSION-koa-03-10`.

Global queue, review-card, cache, and aggregate evidence regeneration remains a coordinating-lane task.
