# S257 Word Problems Grade 3 Whole-Course Repair

## Scope and source inventory

- Course: `content/courses/word-problems-g3`
- Lessons audited and normalized: 12/12 (`g3w-01-01` through `g3w-03-04`)
- Authoritative incoming queue rows: 72
- Source-controlled incoming rows: 36
  - `ILLUSTRATION_REPLACEMENT`: 24
  - `LESSON_PROGRESSION_AND_DUPLICATION`: 12
- Assessor-controlled incoming rows: 36
  - `VISUAL_FIRST_REPRESENTATION`: 12
  - `GRADE_LANGUAGE_REVIEW`: 12
  - `LESSON_COMPLETE_DISPOSITION`: 12

## Authoritative source closures

This batch closes all 36 source-derived rows:

- 24/24 withheld `count-on-hops` placements were replaced with registered, accessible semantic figures for hidden intermediate quantities, operation order, equal groups, fair shares, variables and missing factors, equation writing, two-step bar models, estimation, rounding, reasonableness, relevant information, and story-to-expression matching.
- 12/12 progression and duplication causes were closed across the complete learner sequence and remedial route. Every lesson now has a genuinely different second interaction, later checks use distinct application, diagnosis, computation, transfer, or authorship jobs, and each exact prompt, number-normalized prompt, and complete widget payload is unique within its lesson. The exact `k1` clone in every remedial was replaced with a new same-concept example.

The full-course truth audit also repaired release-grade defects not safely separable from the source causes. `g3w-03-03` contained copied fraction feedback claiming that fourths require equal pieces and that bars A and D pass; both data-selection interactions now give question-relevant feedback. `g3w-02-04` graded the exact result 240 while asking for the useful rounded estimate 250; the choice evaluator now accepts only 250 and explicitly distinguishes it from the exact value. The other estimation checks now use bounded misconception-specific candidates instead of multiplicative windows that accepted implausibly broad answers. Copied number-line feedback about 63 and its neighboring tens was replaced with story-specific bounds, unrelated one-step fact checks were returned to the lesson's two-step job, and generic CML/fallback language was replaced with lesson-specific actions, invariants, and misconceptions. Stable lesson, step, option, hotspot, and evaluator correctness contracts were preserved.

## Residual queue

- Source-controlled residual: 0
- Assessor-controlled residual: 36 review/disposition rows
- Expected residual after source reconciliation: 36

No generic visual-first, grade-language, or complete-lesson disposition row is self-closed by this source batch.

## Evidence

- Idempotent repair: `node scripts/audit/repair-word-problems-g3-s257.mjs --check`
- Current source seal: `b1a7690812284a46a25c6f4eebf66fdf90a3b8755322ca6fca378ec3e4a49661`
- Focused aggregate regression: `src/lib/session257.wordProblemsG3CourseIntegrity.test.tsx` — 5/5 passing
- Legacy independent-solver compatibility: src/lib/session195.wordProblemsG3.test.ts — 15/15 passing (combined 20/20)
- Full content schema: 1,840/1,840 files valid
- Full pedagogy lint: 1,711/1,711 files clean
- Strict CML lint: 0 errors, 0 warnings

The aggregate regression verifies every lesson and widget contract, all 24 exact registered accessible figures, exact/normalized/payload diversity across lesson and remedial widgets, evaluator agreement for numeric, MCQ, number-line, estimate-choice, hop, bar-builder, and tap-diagram surfaces, stable four-option IDs with one correct `o0`, and the specific copied-feedback and estimation-truth corrections.
