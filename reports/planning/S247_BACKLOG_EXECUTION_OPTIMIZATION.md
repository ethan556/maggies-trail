# Maggie's Trail V4 backlog execution optimization — S247

## Executive summary

- **The live backlog is 4,451, 9,996 below the 14,447-row reference.** The authoritative CSV passes uniqueness, completeness and priority-domain checks and is sealed by SHA-256 `0683d50c43cfb932d0d0b288cdb8310c5fd42ef1655998c71d98e23a6be0b948` at commit `8a0a8c7b`.
- **The queue is using the wrong unit of work.** Every row can be assigned exactly once to 141 primary portfolios: 124 course portfolios, 1 standards parent-family portfolio, 14 generator domains and 2 shared programme/engine portfolios. The 2 exact standards codes and 57 exact generator tags remain required subgroups. That is 31.57× fewer context scopes without deleting or auto-closing a single task.
- **The fastest safe path is course-first, cause-first and evidence-last.** Read each course once, emit all semantic contracts, implement file-disjoint causes, run deterministic evidence once, and obtain an independent verdict. Standards use a separate exact-code cache and retain edge-level decisions.

## Dataset and grain

The source is `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`: one row per currently open closure obligation. The compiler verifies 4451/4451 unique work IDs, 0 missing required records, and 0 invalid priority values. The portfolio CSV is a derived execution view; the queue remains the source of truth.

## The breakthrough: 4,451 rows become 141 claimable portfolios

| Portfolio class | Queue rows | Primary scopes | Rows per scope | P0 rows | Maximum scope |
|---|---:|---:|---:|---:|---:|
| COURSE_PORTFOLIO | 4,249 | 124 | 34.27 | 86 | 54 |
| GENERATOR_DOMAIN_PORTFOLIO | 166 | 14 | 11.86 | 0 | 46 |
| PROGRAM_SHARED_PORTFOLIO | 34 | 2 | 17 | 15 | 27 |
| STANDARD_FAMILY_PORTFOLIO | 2 | 1 | 2 | 0 | 2 |

This is a context-loading optimization, not a quality shortcut. A portfolio owns one coherent read and contract. Writes still split at shared hot files, exact generator-tag boundaries and maximum safe batch sizes.

## One course read should drive every local decision

The 124 course portfolios cover 4,249 source-local rows. A course assessor reads the full lesson set once and emits lesson/visual/language dispositions, progression and choice jobs, math and figure requirements, revision contracts and standards evidence summaries. Implementers receive only exact owned files and deltas.

Top closure-leverage course portfolios:

| Course | Rows | P0 | Lessons | Workstreams |
|---|---:|---:|---:|---|
| decimals-intro-g4 | 54 | 0 | 18 | GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| right-triangles-trig | 53 | 1 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| rational-functions | 53 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| radical-functions | 53 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| exponents-scientific-notation | 52 | 1 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| derivative-rules | 52 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| trig-identities-equations | 52 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| area-surface-volume | 52 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| add-subtract-20 | 52 | 0 | 17 | GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| two-step-equations | 52 | 0 | 17 | GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| function-transformations | 51 | 1 | 16 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| number-system | 51 | 1 | 16 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, QUESTION_DIVERSITY_AND_TRANSFER, VISUAL_FIRST_REPRESENTATION |
| sampling-and-probability | 51 | 1 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, QUESTION_DIVERSITY_AND_TRANSFER, VISUAL_FIRST_REPRESENTATION |
| shapes-build-k | 51 | 0 | 14 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| polygons-quadrilaterals | 51 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| polynomial-rational-analysis | 51 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| add-subtract-1000-g2 | 50 | 2 | 16 | GRADE_LANGUAGE_REVIEW, ILLUSTRATION_REPLACEMENT, LESSON_COMPLETE_DISPOSITION, VISUAL_FIRST_REPRESENTATION |
| polar-parametric | 50 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| geometry-foundations | 50 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |
| measure-convert | 50 | 0 | 15 | CHOICE_SURFACE_INTEGRITY, GRADE_LANGUAGE_REVIEW, LESSON_COMPLETE_DISPOSITION, LESSON_PROGRESSION_AND_DUPLICATION, VISUAL_FIRST_REPRESENTATION |

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
- **Illustrations:** 57 rows compile into 41 figure+course contracts and 41 write batches capped at 20 placements. The 0 live `count-on-hops` placements require typed semantic figure specifications, not bespoke pictures.
- **Generators:** 166 generated rows compile into 14 parent domains, 57 required exact-tag contracts and 57 tag-bounded microbatches. Reuse domain context, but run the prompt-only oracle, deterministic replay and verdict independently per tag.
- **Progression and choices:** 238 progression rows are 51 course contracts; 447 choice rows are 131 authored-course or generator contracts.

## Optimized operating sequence

1. **Freeze and compile.** Require queue SHA, base commit, contract hash and owned files in every portfolio. Reject stale claims automatically.
2. **Assessment cohort.** Review 3 courses concurrently with four active agents, or 6 with eight active agents. One assessor owns one course. The 104 remaining course reviews become 35 three-assessor cohorts or 18 six-assessor cohorts.
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

All 485 current signed lesson reviews resolved 1,455 generic disposition rows and left 10 implementation or escalation rows. If the same 2.1% revision-required rate held—a planning scenario, not a forecast—the remaining 1,216 reviews would resolve 3,648 generic rows, create about 25 implementation rows and reduce the queue by about 3,623 net rows before those fixes are completed.

## Immediate next waves

1. Run six high-leverage course assessments per eight-agent cohort, prioritizing P0 density and cross-workstream overlap rather than raw row count alone.
2. Start renderer-boundary canaries, then expand through the 0 live exact boundary contracts.
3. Build one typed semantic-figure canary for three different `count-on-hops` concepts; scale across the 0 live placements only if value, visible model, explanation and accessible description remain synchronized.
4. Begin exact-code standards batches only after course evidence summaries are current; keep the existing 2 partial edges open.
5. Implement or adjudicate the 10 current revision/escalation packets before reviewing their courses again.

## Further questions

- Which exact semantic figure families can replace `count-on-hops` without recreating a generic illustration under a new name?
- Which standards authorities permit stable direct-source retrieval in the execution environment, and which need a separately cached official snapshot?
- Does the revision-required rate remain near the observed 2.1% once less risky courses are reviewed? Recalculate after every 100 decisions.

## Caveats and assumptions

- Portfolio compression reduces repeated reading and orchestration; it does not constitute closure evidence.
- Standards remain the largest semantic workload. Source caching saves tokens, but no benchmark is approved by analogy.
- The disposition scenario is based on all 485 current reviewed lessons and is deliberately labeled as a scenario.
- Shared renderer and semantic-figure scaling stops on any learner-visible mathematical, accessibility or state-synchronization failure.
