# S252 Multiplication & Division Whole-Course Repair

## Scope and authority

- Course: `content/courses/multiplication-division`
- Lessons reviewed: 24 of 24
- Stale authoritative input queue: 88 rows
- Source-controlled rows: 16
  - 5 `ILLUSTRATION_REPLACEMENT`
  - 4 `LESSON_PROGRESSION_AND_DUPLICATION`
  - 7 `CHOICE_SURFACE_INTEGRITY`
- Assessor-controlled residual rows: 72
  - 24 `VISUAL_FIRST_REPRESENTATION`
  - 24 `GRADE_LANGUAGE_REVIEW`
  - 24 `LESSON_COMPLETE_DISPOSITION`

This packet changes no review ledger, queue, card, cache, standards evidence, shared widget, shared schema, or figure registry. The parent serial rebuild remains authoritative for materializing the expected 88 → 72 queue reduction.

## Implemented source closures

### Semantic visuals — 5

| Lesson / step | Registered figure | Resolution |
|---|---|---|
| `mult-02-01/c2` | `mult3-fair-shares` | Re-authored the fixed prose/figure binding around the 15 ÷ 5 = 3 fair-sharing roles. |
| `mult-02-03/c2` | `number-line-jumps` | Replaced the missing-factor placeholder with the registered hop model required by the skip-count explanation. |
| `mult-03-01/c1` | `mult3-double` | Re-authored the binding around two equal copies and 6 × 2 = 6 + 6. |
| `mult-04-04/c2` | `mult3-which-op` | Replaced the estimate placeholder with the operation-selection model and synchronized two-step quantity prose. |
| `mult-04-05/c2` | `mult3-estimate` | Re-authored the fixed prose/figure binding around 6 × 9 and its nearby 6 × 10 benchmark. |

All five figures are registered, render an SVG `<title>`, expose `role="img"`, and pass the deterministic figure/text-alignment contract.

### Progression and duplication — 4 root causes

- `mult-02-02`: challenge changed from a number-swapped clone to error analysis of an impossible six-bag claim.
- `mult-03-03`: second retrieval changed from a bare fact prompt to executing a three-doubling chain.
- `mult-03-04`: the second nines item now derives a product from 10 × 6 − 6; the challenge consumes an established total rather than cloning the earlier theater template.
- `mult-05-03`: challenge changed from a number-swapped score computation to parity-claim testing and correction.

Across the course there are now zero exact-prompt, number-normalized-prompt, or complete-widget-payload collisions.

### Choice-surface integrity — 7

Repaired `mult-02-04/k3`, `mult-04-04/k3`, `mult-04-05/k1`, `mult-05-01/k2`, `mult-05-02/k3`, `mult-05-03/k1`, and `mult-05-04/k1`.

- Stable option IDs `a`–`d` preserved.
- Correct option and evaluator contracts preserved.
- One defensible answer retained per surface.
- Labels rewritten as parallel verdicts/plans/reasons instead of one answer explaining itself.
- Maximum option-length spread is bounded at 18 characters across every repaired surface.
- Diagnostic feedback remains misconception-specific for every option.

## Mathematical-truth audit

The 24-lesson learner-visible corpus and its remedials were audited together with evaluator truth. Repairs include:

1. Square fact families no longer claim every multiplication fact creates two distinct divisions; equal-factor repeats are stated explicitly.
2. Multiplication by 10 is explained through tenfold place value, not digits "shifting" or sliding.
3. Size checks are qualified for positive amounts and two-or-more groups; an impossible size proves a result wrong but does not falsely prove which operation error occurred.
4. The 4-by-4 multiplication table no longer claims every non-square product has exactly one factor-pair twin; it now states the precise reflection property of each off-diagonal cell.
5. The square-number explanation now includes both factor rectangles of 6 instead of falsely claiming that 6 has only the factorization 2 × 3.
6. The misleading distractor phrase "10 is the biggest one-digit jump" was removed.

Every numeric authored answer evaluates correct; no common-error value equals its answer. Every MCQ has exactly one correct option, and evaluator results agree with authored correctness for all primary and remedial MCQs.

## Reproducibility

- Idempotent repair: `node scripts/audit/repair-multiplication-division-s252.mjs --check`
- Result: `CURRENT`, 24 lessons, 0 drift
- Course source seal: `d5160d21c05f18041919d17190956d76ea818ae0a2111691270f9d87ea34e0c8`
- Semantic edits: 14 lessons
- Canonical serialization only: 10 lessons

## Verification

| Gate | Result |
|---|---|
| Focused aggregate Vitest | PASS — 1 file, 6 tests |
| Full content schema | PASS |
| Full pedagogy lint | PASS — 1,711 / 1,711 lesson files clean |
| Full CML lint | PASS — 0 errors, 0 warnings |
| Full CML integration | PASS — 18 flagship pilots, 91 direct-engine profiles, 1,701 lessons parsed |
| Full TypeScript, non-incremental | PASS |
| Full ESLint | PASS — 0 errors; 450 pre-existing repository warnings |
| Scoped `git diff --check` | PASS |

## Residual disposition boundary

The remaining 72 rows are not source defects that this repair script may self-close. They require explicit current human `KEEP`, `REVISE`, or `ESCALATE`, visual-sufficiency, and grade-language decisions through the canonical review authority. No disposition was fabricated in this packet.
