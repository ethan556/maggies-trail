# S259 — Equations & Unknowns G1 whole-course repair

## Scope and authority boundary

This bounded source portfolio covers the 12 lessons in `content/courses/equations-unknowns-g1`.
The incoming current-source queue contained 71 rows:

- 23 `ILLUSTRATION_REPLACEMENT` rows;
- 12 `LESSON_PROGRESSION_AND_DUPLICATION` rows;
- 12 generic lesson-disposition rows;
- 12 generic visual-disposition rows; and
- 12 generic language-disposition rows.

Only the 35 course-local source-controlled causes were implemented here. The 36 generic
disposition rows remain under independent assessor authority. This packet does not edit or
append the queue, review cards, cache, ledgers, standards authority, shared schema, shared
runtime, or figure registry.

## Implemented source closures

### Illustration replacements — 23/23

Every queued placeholder `count-on-hops` placement was replaced with an existing registered,
semantically correct figure. A twenty-fourth unqueued placeholder discovered during the full
course audit was upgraded at the same root cause. All 24 resulting concept figures have
learner-visible accessible descriptions, and their concept narration is synchronized with the
body text and the quantities represented by the figure.

### Progression and duplication — 12/12

Every lesson now gives interaction 2 a genuinely different learner job, number set, and action
from interaction 1. Main-route prompts were reauthored where necessary so the course no longer
contains the queued normalized prompt collisions. Stable lesson, interaction, and choice IDs,
numeric evaluator contracts, correct answers, and diagnostic feedback were preserved.

## Whole-course truth and retry audit

- Added an existing registered semantic figure to each of the 12 remedial concepts.
- Replaced all 12 exact-k1 remedial checks with distinct misconception-transfer checks. Each
  retry is distinct from its main-route check by exact prompt, normalized prompt, and payload.
- Corrected the false claim that a false equation is not an equation. The lessons now distinguish
  an expression from an equation and a true equation from a false equation.
- Corrected the contradictory distractor `No — 3 + 4 = 7, not 7`.
- Simplified several opaque Grade 1 phrases while retaining mathematical precision.
- Audited every lesson, remedial route, evaluator, answer, feedback branch, and figure contract;
  no remaining learner-visible mathematical falsehood or evaluator/feedback disagreement was
  found in this course.

## Closure accounting

| Class | Incoming | Implemented | Residual |
| --- | ---: | ---: | ---: |
| Illustration replacement | 23 | 23 | 0 |
| Progression / duplication | 12 | 12 | 0 |
| Generic lesson disposition | 12 | 0 | 12 |
| Generic visual disposition | 12 | 0 | 12 |
| Generic language disposition | 12 | 0 | 12 |
| **Total** | **71** | **35** | **36** |

The additional unqueued concept-figure upgrade, 12 remedial figures, 12 distinct remedial
transfers, and truth/language repairs are quality improvements rather than extra queue closures.
The 35 source closures become authoritative only when the source-derived queue is refreshed;
this packet does not self-close assessor-controlled rows.

## Reproducibility and regression authority

- Guarded idempotent repair: `scripts/audit/repair-equations-unknowns-g1-s259.mjs`
- Aggregate regression: `src/lib/session259.equationsUnknownsG1CourseIntegrity.test.tsx`
- Current course seal: `fa8c9b2e6974dc0815354ed3ea9ae27dbd5c476dfbe18bd99081c886f182a7ad`

The repair script reports `CURRENT` with zero changed lessons and independently recomputes the
course seal. The aggregate regression verifies all 12 lesson schemas, pedagogy and evaluator
correctness; 24 accessible registered concept figures; figure/prose synchronization; progression
and prompt uniqueness; visual remedials; retry distinctness; and removal of the audited truth and
language defects.

## Verification

- Repair idempotence: pass (`CURRENT`, `changed: 0`)
- S259 aggregate regression: 5/5 pass
- Focused course regressions: 18/18 pass (15 unrelated tests skipped by course filter)
- Full lesson schema validation: pass
- Full pedagogy validation: 1,711/1,711 pass
- Strict CML validation: 0 errors, 0 warnings
- TypeScript typecheck: pass
- Owned-file lint: pass

The legacy combined S191 test also covers another course, `properties-strategies-g1`, which was
being changed concurrently outside this packet. Any failure confined to that external course is
not evidence against this S259 authority; the complete owned equations subset passes.
