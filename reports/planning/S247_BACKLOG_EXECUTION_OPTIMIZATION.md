# Maggie's Trail V4 backlog execution optimization — S247

## Executive summary

- **The live backlog is 141, 14,306 below the 14,447-row reference.** The authoritative CSV passes uniqueness, completeness and priority-domain checks and is sealed by SHA-256 `4f14d2c69f157dbd6824ec8f34279e9ef0ea908cd38356d8a8ef500ccc0d808c` at commit `7d8e4f40`.
- **The queue is using the wrong unit of work.** Every row can be assigned exactly once to 38 primary portfolios: 35 course portfolios, 1 standards parent-family portfolio, 0 generator domains and 2 shared programme/engine portfolios. The 2 exact standards codes and 0 exact generator tags remain required subgroups. That is 3.71× fewer context scopes without deleting or auto-closing a single task.
- **The fastest safe path is course-first, cause-first and evidence-last.** Read each course once, emit all semantic contracts, implement file-disjoint causes, run deterministic evidence once, and obtain an independent verdict. Standards use a separate exact-code cache and retain edge-level decisions.

## Dataset and grain

The source is `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`: one row per currently open closure obligation. The compiler verifies 141/141 unique work IDs, 0 missing required records, and 0 invalid priority values. The portfolio CSV is a derived execution view; the queue remains the source of truth.

## The breakthrough: 141 rows become 38 claimable portfolios

| Portfolio class | Queue rows | Primary scopes | Rows per scope | P0 rows | Maximum scope |
|---|---:|---:|---:|---:|---:|
| COURSE_PORTFOLIO | 110 | 35 | 3.14 | 1 | 9 |
| PROGRAM_SHARED_PORTFOLIO | 29 | 2 | 14.5 | 15 | 22 |
| STANDARD_FAMILY_PORTFOLIO | 2 | 1 | 2 | 0 | 2 |

This is a context-loading optimization, not a quality shortcut. A portfolio owns one coherent read and contract. Writes still split at shared hot files, exact generator-tag boundaries and maximum safe batch sizes.

## One course read should drive every local decision

The 35 course portfolios cover 110 source-local rows. A course assessor reads the full lesson set once and emits lesson/visual/language dispositions, progression and choice jobs, math and figure requirements, revision contracts and standards evidence summaries. Implementers receive only exact owned files and deltas.

Top closure-leverage course portfolios:

| Course | Rows | P0 | Lessons | Workstreams |
|---|---:|---:|---:|---|
| exponential-functions | 9 | 0 | 9 | LESSON_PROGRESSION_AND_DUPLICATION |
| functions-and-sequences | 9 | 0 | 9 | LESSON_PROGRESSION_AND_DUPLICATION |
| proportional-relationships | 9 | 0 | 9 | LESSON_PROGRESSION_AND_DUPLICATION |
| measure-money-time | 6 | 0 | 6 | LESSON_PROGRESSION_AND_DUPLICATION |
| the-real-number-system | 6 | 0 | 6 | LESSON_PROGRESSION_AND_DUPLICATION |
| counting-120 | 5 | 0 | 5 | LESSON_PROGRESSION_AND_DUPLICATION |
| decimals-place-value | 5 | 0 | 5 | LESSON_PROGRESSION_AND_DUPLICATION |
| functions-g8 | 5 | 0 | 5 | LESSON_PROGRESSION_AND_DUPLICATION |
| linear-functions | 5 | 0 | 5 | LESSON_PROGRESSION_AND_DUPLICATION |
| arrays-even-odd-g2 | 4 | 0 | 4 | LESSON_PROGRESSION_AND_DUPLICATION |
| length-problems-g2 | 4 | 0 | 4 | LESSON_PROGRESSION_AND_DUPLICATION |
| long-division-g5 | 4 | 0 | 4 | LESSON_PROGRESSION_AND_DUPLICATION |
| number-line-g2 | 4 | 0 | 4 | LESSON_PROGRESSION_AND_DUPLICATION |
| radical-functions | 4 | 0 | 4 | LESSON_PROGRESSION_AND_DUPLICATION |
| sampling-and-probability | 3 | 0 | 3 | LESSON_PROGRESSION_AND_DUPLICATION |
| shapes-measure-g1 | 3 | 0 | 3 | LESSON_PROGRESSION_AND_DUPLICATION |
| shapes-shares-g2 | 3 | 0 | 3 | LESSON_PROGRESSION_AND_DUPLICATION |
| counting-to-20-k | 2 | 0 | 2 | LESSON_PROGRESSION_AND_DUPLICATION |
| exponents-scientific-notation | 2 | 0 | 2 | LESSON_PROGRESSION_AND_DUPLICATION |
| geometry-foundations | 2 | 0 | 2 | LESSON_PROGRESSION_AND_DUPLICATION |

## Standards: cache the official source, never the verdict

The 2 open standards edges resolve to 1 authoritative framework+parent-family portfolio while retaining 2 required exact framework+code contracts across 1 course. Each exact-code subgroup is capped at 40 edges, producing 2 bounded batches. Official text is fetched and signed once per exact code; course evidence is read once; each edge still receives its own approve/reject/partial decision. Family grouping never supplies a verdict.

## Generators: parent domains retain exact-tag execution contracts

All 0 generator rows compile into 0 coherent grade/course domains while retaining all 0 exact generator tags as required subgroups. The 0 execution microbatches are tag-bounded and contain at most 40 rows; no decision or batch can cross an exact-tag boundary.

| Generator domain | Rows | Exact tags | Microbatches ≤40 | Largest tag | Required exact tags |
|---|---:|---:|---:|---:|---|


## Shared causes that should close many rows

- **Math rendering:** 0 rows compile into 0 symbol × surface × source contracts. Repair the renderer boundary once, then verify every dependent field and screen-reader string.
- **Illustrations:** 0 rows compile into 0 figure+course contracts and 0 write batches capped at 20 placements. The 0 live `count-on-hops` placements require typed semantic figure specifications, not bespoke pictures.
- **Generators:** 0 generated rows compile into 0 parent domains, 0 required exact-tag contracts and 0 tag-bounded microbatches. Reuse domain context, but run the prompt-only oracle, deterministic replay and verdict independently per tag.
- **Progression and choices:** 109 progression rows are 34 course contracts; 0 choice rows are 0 authored-course or generator contracts.

## Optimized operating sequence

1. **Freeze and compile.** Require queue SHA, base commit, contract hash and owned files in every portfolio. Reject stale claims automatically.
2. **Assessment cohort.** Review 3 courses concurrently with four active agents, or 6 with eight active agents. One assessor owns one course. The 0 remaining course reviews become 0 three-assessor cohorts or 0 six-assessor cohorts.
3. **Contract fan-out.** Convert course findings into small, file-disjoint write packets: 5–12 lessons, one generator family, one math boundary, or at most 20 illustration placements.
4. **Deterministic evidence cohort.** Luna workers run schema, pedagogy, duplication, parity, seed, renderer and accessibility gates once per changed dependency partition; raw logs stay outside model context.
5. **Independent verdict cohort.** Assessors read the contract, diff, rendered state and unseen samples before the producer narrative. P0 and novel mathematics receive full semantic review; contract-identical mechanical rows receive representative plus unseen-sample review.
6. **Serial integration.** One steward regenerates queue/cards/cache and proves exact closures. No parallel writer touches a hot file or shared generated artifact.

## Throughput controls

- Active writers = `min(disjoint ready packets, implementation slots, 2 × active assessors, hot-file limit)`.
- Stop spawning writers when more than two completed packets wait per assessor.
- Use 3–5-task micro-cohorts; never hold fast scans behind a slow standards or browser task.
- Interrupt and split any packet lasting more than twice its cohort median.
- Standard speed is the default. Fast is allowed only when one short verdict unlocks at least three blocked workers. Ultra/Max is for genuine adjudication, not bulk work.
- Stable instructions, tools, rubric and schema go first in every prompt; packet-specific data goes last for exact-prefix cache reuse.

## Measured disposition leverage

All 1,701 current signed lesson reviews resolved 5,103 generic disposition rows and left 0 implementation or escalation rows. If the same 0% revision-required rate held—a planning scenario, not a forecast—the remaining 0 reviews would resolve 0 generic rows, create about 0 implementation rows and reduce the queue by about 0 net rows before those fixes are completed.

## Immediate next waves

1. Run six high-leverage course assessments per eight-agent cohort, prioritizing P0 density and cross-workstream overlap rather than raw row count alone.
2. Start renderer-boundary canaries, then expand through the 0 live exact boundary contracts.
3. Build one typed semantic-figure canary for three different `count-on-hops` concepts; scale across the 0 live placements only if value, visible model, explanation and accessible description remain synchronized.
4. Begin exact-code standards batches only after course evidence summaries are current; keep the existing 2 partial edges open.
5. Implement or adjudicate the 0 current revision/escalation packets before reviewing their courses again.

## Further questions

- Which exact semantic figure families can replace `count-on-hops` without recreating a generic illustration under a new name?
- Which standards authorities permit stable direct-source retrieval in the execution environment, and which need a separately cached official snapshot?
- Does the revision-required rate remain near the observed 0% once less risky courses are reviewed? Recalculate after every 100 decisions.

## Caveats and assumptions

- Portfolio compression reduces repeated reading and orchestration; it does not constitute closure evidence.
- Standards remain the largest semantic workload. Source caching saves tokens, but no benchmark is approved by analogy.
- The disposition scenario is based on all 1,701 current reviewed lessons and is deliberately labeled as a scenario.
- Shared renderer and semantic-figure scaling stops on any learner-visible mathematical, accessibility or state-synchronization failure.
