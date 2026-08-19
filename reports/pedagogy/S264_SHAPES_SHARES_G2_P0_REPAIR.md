# S264 Shapes Shares G2 P0 Repair

## Scope

This bounded source-local packet audits the complete nine-lesson `shapes-shares-g2` course and repairs the six current P0 progression/diversity causes across five lessons. It preserves lesson and step IDs, widget types, correct option IDs, numeric answers, and evaluator behavior. No shared runtime, figure registry, schema, queue, cards, cache, ledger, or standards evidence is changed.

## Source closures

| Queue row | Distinct learner jobs now present |
| --- | --- |
| `PROGRESSION-ssg2-01-01` | `i3` recognizes an octagon from a stop-sign landmark; `k3` infers a name from eight corners; `ch1` moves one side-count step back from octagon to heptagon. |
| `PROGRESSION-ssg2-01-02` | The challenge combines four base edges and four sloping edges instead of repeating the direct “how many edges” retrieval prompt. |
| `PROGRESSION-ssg2-01-03` | Learners move one side past pentagon, identify the polygon bounded by hexagon and octagon, then correct a heptagon/octagon misconception. |
| `PROGRESSION-ssg2-03-02` | `k1` reconstructs a whole from three equal shares rather than copying the introductory “split into thirds” action. |
| `PROGRESSION-ssg2-03-03` | `k3` compares fair shares when the same-size sandwiches are shared among three versus four children. |
| `EXCELLENCE-ssg2-03-03` | The challenge is now an authored decision task: choose one half rather than one third to meet a larger-share goal. |

Result: **6/6 P0 rows source-closed; 0 P0 residuals.**

## Evaluator safety

- Every targeted widget retains its original evaluator type.
- Existing correct option IDs remain `a`; the square-pyramid numeric answer remains `8`; the fraction-bar target remains `1/3`.
- Feedback and explanations were synchronized to the new question jobs.
- Generated variants were removed only from the newly authored challenges whose prompts no longer represent their former direct-retrieval generator forms.

## Executable evidence

- `scripts/audit/repair-shapes-shares-g2-s264.mjs` is guarded, idempotent, and leaves the four non-target course lessons byte-for-byte unchanged.
- `src/lib/session264.shapesSharesG2P0Integrity.test.ts` validates all nine lessons for schema, pedagogy, widget integrity, distinct job evidence, whole-course evaluator correctness, and exact feedback agreement.
- Focused regression: 6/6 tests pass.
- Full gates: content schema, pedagogy (1,711/1,711 clean), strict CML (0 errors, 0 warnings), TypeScript, and scoped ESLint all pass.
- Current course seal: `d7cbf2c9a50972ed545a3c6a7e310f591bfcd95e3ae180a171bd894023967688`.

## Boundaries

P1 choice, language, visual-disposition, lesson-disposition, and remaining lower-priority progression rows remain assessor-controlled. This source packet does not self-close generic review streams.
