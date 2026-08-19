# Maggie's Trail V4 backlog execution optimization — S247

## Executive summary

- **The live backlog is 5,330, 9,117 below the 14,447-row reference.** The authoritative CSV passes uniqueness, completeness and priority-domain checks and is sealed by SHA-256 `ed87671de6e7880bdf570dc2199891ebc188b17944ba2153048cda21573c291c` at commit `54ff29f6`.
- **The queue is using the wrong unit of work.** Every row can be assigned exactly once to 146 primary portfolios: 129 course portfolios, 1 standards parent-family portfolio, 14 generator domains and 2 shared programme/engine portfolios. The 2 exact standards codes and 57 exact generator tags remain required subgroups. That is 36.51× fewer context scopes without deleting or auto-closing a single task.
- **The fastest safe path is course-first, cause-first and evidence-last.** Read each course once, emit all semantic contracts, implement file-disjoint causes, run deterministic evidence once, and obtain an independent verdict. Standards use a separate exact-code cache and retain edge-level decisions.

## Dataset and grain

The source is `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`: one row per currently open closure obligation. The compiler verifies 5330/5330 unique work IDs, 0 missing required records, and 0 invalid priority values. The portfolio CSV is a derived execution view; the queue remains the source of truth.

## The breakthrough: 5,330 rows become 146 claimable portfolios

| Portfolio class | Queue rows | Primary scopes | Rows per scope | P0 rows | Maximum scope |
|---|---:|---:|---:|---:|---:|
| COURSE_PORTFOLIO | 5,128 | 129 | 39.75 | 98 | 63 |
| GENERATOR_DOMAIN_PORTFOLIO | 166 | 14 | 11.86 | 0 | 46 |
| PROGRAM_SHARED_PORTFOLIO | 34 | 2 | 17 | 15 | 27 |
| STANDARD_FAMILY_PORTFOLIO | 2 | 1 | 2 | 0 | 2 |

This is a context-loading optimization, not a quality shortcut. A portfolio owns one coherent read and contract. Writes still split at shared hot files, exact generator-tag boundaries and maximum safe batch sizes.

## One course read should drive every local decision

The 129 course portfolios cover 5,128 source-local rows. A course assessor reads the full lesson set once and emits lesson/visual/language dispositions, progression and choice jobs, math and figure requirements, revision contracts and standards evidence summaries. Implementers receive only exact owned files and deltas.

Top closure-leverage course portfolios:

| Course | Rows | P0 | Lessons | Workstreams |
|---|---:|---:|---:|---|
| counting-to-100-k | 63 | 9 | 18 | GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| proportional-relationships | 59 | 4 | 16 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| measurement-data | 59 | 0 | 17 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| circle-theorems | 58 | 0 | 16 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| function-analysis | 57 | 0 | 16 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| expressions-equations | 57 | 0 | 18 | GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| integration-accumulation | 56 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| triangle-congruence | 56 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| measure-money-time | 55 | 4 | 15 | GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, QUESTION_DIVERSITY_AND_TRANSFER, VISUAL_FIRST_REPRESENTATION |
| limits-continuity | 55 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| trig-graphs-inverses | 55 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| vectors-matrices | 55 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| logarithms | 54 | 1 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| place-value | 54 | 1 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| constructions-and-proof | 54 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| fractions | 54 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| data-distributions | 54 | 0 | 18 | GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| statistical-inference | 54 | 0 | 18 | GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| conditional-probability | 53 | 2 | 16 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| right-triangles-trig | 53 | 1 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |

## Standards: cache the official source, never the verdict

The 2 open standards edges resolve to 1 authoritative framework+parent-family portfolio while retaining 2 required exact framework+code contracts across 1 course. Each exact-code subgroup is capped at 40 edges, producing 2 bounded batches. Official text is fetched and signed once per exact code; course evidence is read once; each edge still receives its own approve/reject/partial decision. Family grouping never supplies a verdict.

## Generators: parent domains retain exact-tag execution contracts

All 166 generator rows compile into 14 coherent grade/course domains while retaining all 57 exact generator tags as required subgroups. The 57 execution microbatches are tag-bounded and contain at most 40 rows; no decision or batch can cross an exact-tag boundary.

| Generator domain | Rows | Exact tags | Microbatches ≤40 | Largest tag | Required exact tags |
|---|---:|---:|---:|---:|---|
| grade-10-geometry-probability | 46 | 8 | 8 | 10 | `g10-circle-theorems`, `g10-conditional-probability`, `g10-constructions-proof`, `g10-coordinate-proofs`, `g10-right-triangles`, `g10-similarity`, `g10-solid-geometry`, `g10-triangle-congruence` |
| grade-13-calculus | 45 | 12 | 12 | 10 | `const-sum-rule`, `critical-count`, `end-behavior`, `full-sketch`, `g13-curve-analysis`, `g13-derivative-rules`, `g13-derivatives-in-context`, `g13-differential-equations`, `g13-integration-accumulation`, `g13-parametric-polar-calculus`, `g13-series-convergence`, `opt-box` |
| grade-12-advanced-functions | 25 | 8 | 8 | 5 | `even-odd-classify`, `g12-conic-sections`, `g12-function-analysis`, `g12-polar-parametric`, `g12-polynomial-rational-analysis`, `g12-trig-graphs-inverses`, `g12-trig-identities-equations`, `g12-vectors-matrices` |
| secondary-algebra-2 | 13 | 6 | 6 | 5 | `a2-complex`, `a2-logarithms`, `a2-polynomials`, `a2-radicals`, `a2-rationals`, `a2-statistics` |
| grade-6-algebra-statistics | 9 | 3 | 3 | 5 | `g6-center-spread`, `g6-data-literacy`, `variable-meaning` |
| grade-4-number-measurement-geometry | 8 | 3 | 3 | 4 | `g4-lines-angles`, `g4-measure`, `g4-place-million` |
| grade-8-algebra-geometry-statistics | 5 | 3 | 3 | 3 | `g8-les-solution-count`, `g8-tm-congruence`, `scatter-features` |
| elementary-number-operations | 4 | 4 | 4 | 1 | `estimation`, `fact-family`, `g3-div-fluency`, `mult-patterns` |
| elementary-measurement-data | 3 | 2 | 2 | 2 | `line-plot`, `read-clock` |
| elementary-fractions | 2 | 2 | 2 | 1 | `compare-same-num`, `nl-fraction` |
| grade-7-proportionality-statistics | 2 | 2 | 2 | 1 | `g7-sp-sampling-bias`, `pr-constant-k-g7` |
| secondary-algebra-1 | 2 | 2 | 2 | 1 | `a1-exponential`, `a1-systems` |
| early-elementary-geometry | 1 | 1 | 1 | 1 | `attributes` |
| middle-grades-geometry-measurement | 1 | 1 | 1 | 1 | `area-formula-pick` |

## Shared causes that should close many rows

- **Math rendering:** 0 rows compile into 0 symbol × surface × source contracts. Repair the renderer boundary once, then verify every dependent field and screen-reader string.
- **Illustrations:** 63 rows compile into 45 figure+course contracts and 45 write batches capped at 20 placements. The 0 live `count-on-hops` placements require typed semantic figure specifications, not bespoke pictures.
- **Generators:** 166 generated rows compile into 14 parent domains, 57 required exact-tag contracts and 57 tag-bounded microbatches. Reuse domain context, but run the prompt-only oracle, deterministic replay and verdict independently per tag.
- **Progression and choices:** 245 progression rows are 52 course contracts; 447 choice rows are 131 authored-course or generator contracts.

## Optimized operating sequence

1. **Freeze and compile.** Require queue SHA, base commit, contract hash and owned files in every portfolio. Reject stale claims automatically.
2. **Assessment cohort.** Review 3 courses concurrently with four active agents, or 6 with eight active agents. One assessor owns one course. The 119 remaining course reviews become 40 three-assessor cohorts or 20 six-assessor cohorts.
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

All 254 current signed lesson reviews resolved 762 generic disposition rows and left 183 implementation or escalation rows. If the same 72% revision-required rate held—a planning scenario, not a forecast—the remaining 1,447 reviews would resolve 4,341 generic rows, create about 1,043 implementation rows and reduce the queue by about 3,298 net rows before those fixes are completed.

## Immediate next waves

1. Run six high-leverage course assessments per eight-agent cohort, prioritizing P0 density and cross-workstream overlap rather than raw row count alone.
2. Start renderer-boundary canaries, then expand through the 0 live exact boundary contracts.
3. Build one typed semantic-figure canary for three different `count-on-hops` concepts; scale across the 0 live placements only if value, visible model, explanation and accessible description remain synchronized.
4. Begin exact-code standards batches only after course evidence summaries are current; keep the existing 2 partial edges open.
5. Implement or adjudicate the 183 current revision/escalation packets before reviewing their courses again.

## Further questions

- Which exact semantic figure families can replace `count-on-hops` without recreating a generic illustration under a new name?
- Which standards authorities permit stable direct-source retrieval in the execution environment, and which need a separately cached official snapshot?
- Does the revision-required rate remain near the observed 72% once less risky courses are reviewed? Recalculate after every 100 decisions.

## Caveats and assumptions

- Portfolio compression reduces repeated reading and orchestration; it does not constitute closure evidence.
- Standards remain the largest semantic workload. Source caching saves tokens, but no benchmark is approved by analogy.
- The disposition scenario is based on all 254 current reviewed lessons and is deliberately labeled as a scenario.
- Shared renderer and semantic-figure scaling stops on any learner-visible mathematical, accessibility or state-synchronization failure.
