# S262 Counting to 100 K — bounded whole-course repair

## Scope and authority

- Course: `content/courses/counting-to-100-k`
- Current course size: 18 lessons, 162 stable authored steps.
- Authoritative input: 53 rows in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` — 35 P0 `ILLUSTRATION_REPLACEMENT` rows and 18 P1 `LESSON_REVISION_IMPLEMENTATION` rows.
- Course-source seal (sorted filename plus current JSON bytes, SHA-256): `d9296082ee1f88bb4689e2fb43bb5893b38a3df4e5e028a13b285df78004f6fb`.
- This packet does not mutate the queue, review cards, cache, ledger, standards evidence, schemas, figure registry, or shared runtime.

## Honest source-compatible result

| Stream | Before | Source closures | Explicit residual | After assessment/appending |
| --- | ---: | ---: | ---: | --- |
| P0 illustration replacement | 35 | 26 | 9 | Assessor-controlled |
| P1 lesson revision | 18 | 13 | 5 | Assessor-controlled |
| Total | 53 | 39 | 14 | No authority append in this packet |

The 26 replacements use existing registered semantic figures. Every bound figure renders an SVG title and `role="img"`, and its authored body passes the live figure/text alignment guard. The old fixed `number-track` is absent from all 35 queued placements. `k100-01-01/c1` retains its existing rendering because that placement was not among the queued 35.

## P0 replacements

| Placement(s) | Existing semantic figure | Mathematical job |
| --- | --- | --- |
| `k100-01-01/c2` | `c120-same-pattern` | Shows 24, 25, 26 following the same ones pattern as 4, 5, 6. |
| `k100-01-02/c1` | `odometer-roll` | Shows 29 becoming 30. |
| `k100-01-02/c2` | `c120-roll-ten` | Shows 49 becoming 50. |
| `k100-01-03/c1,c2` | `chart-120` | Exposes the 41–50 chart row and highlighted 47. |
| `k100-01-04/c1,c2` | `tno-move-tens-digit` | Shows 50, 60, 70 as adjacent ten-steps. |
| `k100-01-05/c1,c2`; `k100-01-06/c2` | `kc-ten-hops-to-100` | Shows ten equal hops of ten reaching 100. |
| `k100-02-01/c1,c2` | `kc-by-tens` | Shows 10, 20, 30, 40 as tens landings. |
| `k100-02-02/c1,c2`; `k100-02-04/c1,c2` | `kc-ten-hops-to-100` | Supports forward tens and the next-ten relationship. |
| `k100-02-03/c1` | `chart-120` | Shows ten entries per chart row. |
| `k100-02-03/c2` | `chart-rows` | Shows row ends 10, 20, 30. |
| `k100-02-05/c1,c2` | `tno-count-down-tens` | Shows 65, 55, 45, 35 decreasing by ten. |
| `k100-03-03/c1,c2` | `chart-120` | Supports restarting at 47 after 46. |
| `k100-03-05/c1` | `chart-rows` | Shows the end-of-row transition. |
| `k100-03-05/c2` | `c120-chart-row` | Shows 21–30 then the next row beginning at 31. |
| `k100-03-06/c1,c2` | `c120-missing-order` | Shows 42, 43, blank, 45, so the missing entry is 44. |

Chart-dependent questions in `k100-02-03`, `k100-03-05`, and `k100-03-06` now carry the same registered chart figures. Remedial concepts inherit the synchronized `c2` body and figure when one exists.

## P0 residual replacement debt

These exact rows are safely withheld because no existing registered figure is synchronized to the authored start, direction, and landing. Reusing a merely similar number line would reintroduce learner-visible numeric contradiction.

- `VIS-k100-01-06-c1-number-track` (`k100-01-06/c1`)
- `VIS-k100-03-01-c1-number-track`, `VIS-k100-03-01-c2-number-track`
- `VIS-k100-03-02-c1-number-track`, `VIS-k100-03-02-c2-number-track`
- `VIS-k100-03-04-c1-number-track`, `VIS-k100-03-04-c2-number-track`
- `VIS-k100-03-07-c1-number-track`, `VIS-k100-03-07-c2-number-track`

Their nine source placements have no `figure`, so they fail closed. The five corresponding lesson-revision rows remain open: `LESSON-REVISION-k100-01-06`, `LESSON-REVISION-k100-03-01`, `LESSON-REVISION-k100-03-02`, `LESSON-REVISION-k100-03-04`, and `LESSON-REVISION-k100-03-07`.

## P1 repairs and retained contracts

The other 13 lesson-revision rows are source-compatible closures: `k100-01-01` through `k100-01-05`, all five `k100-02-*` lessons, plus `k100-03-03`, `k100-03-05`, and `k100-03-06`.

Repairs include:

- replacing false/ambiguous “every ten ends in 9” and “inside each ten” language with ones-digit and next-ten language;
- naming tens as ten-hops rather than ambiguous “count on one/two” instructions;
- differentiating the duplicated `k100-02-01` MCQs with a bundle-building job and a missing-ten job;
- changing `k100-02-05/k3` from forward counting to the lesson's promised backward-tens job;
- correcting the `k100-03-02` and `k100-03-03` prediction distractors so their “pass” claims have plausible landings;
- making `k100-03-07/i2` and `k3` genuinely assess backward order while preserving item IDs and the existing correct option ID;
- preserving every lesson ID, step ID, evaluator target, and MCQ correctness ID.

The older generic drag-order regression was made direction-aware: ascending prompts still require ascending labels, while explicit “backward/biggest first” prompts require descending labels.

## Reproduction and gates

- `node scripts/audit/repair-counting-to-100-k-s262.mjs --check`
- `pnpm exec vitest run src/lib/session262.countingTo100KCourseIntegrity.test.tsx src/lib/session246.counting100Progression.test.ts src/lib/session183.counting100k.test.ts`
- `pnpm validate:content`
- `pnpm lint:pedagogy`
- `pnpm cml:lint:strict`
- `pnpm typecheck`
- scoped ESLint over the repair script and three course regressions

Observed results: focused Vitest 15/15; schema 1,840/1,840; pedagogy 1,711/1,711; strict CML 0 errors/0 warnings; whole-repository TypeScript clean; scoped ESLint clean; scoped `git diff --check` clean.

The repair script is guarded, deterministic, requires exactly 18 lesson files, preserves every step-ID sequence, and reports 26 truthful bindings plus nine fail-closed residuals. The aggregate regression seals the 39/14 source accounting, schema/pedagogy/widget integrity, semantic figure registration, visible/ARIA accessibility, alignment guard, direction jobs, prediction truth, chart support, and MCQ evaluator/feedback agreement.
