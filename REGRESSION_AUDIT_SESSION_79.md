# Session 79 — G6-A Area, Surface Area & Volume completion

## Result

Session 79 refreshes all **23** true runtime gaps in `area-surface-volume`:

- `area-surface-volume`: **38/61 → 61/61 (100%)**
- Grade 6: **71/303 (23.43%) → 94/303 (31.02%)**
- Overall: **1,881/4,471 (42.07%) → 1,904/4,471 (42.59%)**

This is a pure-reuse batch. The 23 declarations resolve through **17 forms**: 15 focused form
extensions and two existing forms reused directly. No generator family was added. Eight proven
engines carry the batch:

- `coordinate-plot` — horizontal/vertical coordinate distance and missing rectangle corners
- `triangle-area-calc` — height meaning and coordinate right-triangle area
- `area-formula-pick` — parallelogram, trapezoid-average, and coordinate-rectangle reasoning
- `area-compose` — attached pieces and coordinate composite figures
- `box-surface-area` — room painting and equal-volume/different-surface comparisons
- `prism-surface-area` — triangular-prism tent fabric excluding the floor
- `box-volume` — measure choice, boxes that fit, and inverse height
- `fraction-volume` — decimal planter volume and bucket-trip applications

All **18 numeric** and **5 MCQ** authored surfaces remain intact. Eight lesson files differ from
Session 78 only through 23 added `variant` declarations; authored prompts, answers, explanations,
figures, widget specifications, and prose are unchanged.

## Quality safeguards

- Coordinate-distance draws reject zero endpoints, cross-origin ambiguity, and collisions between the
  correct difference and the fixed-coordinate or endpoint-sum misconceptions.
- Coordinate composite figures admit only whole component areas and distinct add/subtract traps.
- Equal-volume box comparisons calculate both six-face surface areas independently; equal volume is
  never allowed to imply equal surface area.
- Fractional-volume applications use exact half-unit cases, whole trip counts, and guarded traps that
  cannot equal the answer.
- Conceptual MCQs vary both their numeric context and shuffled correct-option position.

## Verification

- **9,180** focused deterministic builds across all 17 Session-79 forms and three difficulty bands.
- **12,240** checks through the actual standing independent solution routes.
- **6,120** evaluator-level builds with **38,880** correctness and diagnostic assertions.
- Whole registry: **374 generators**, **142,800 deterministic builds**, PASS.
- Independent-route invariant: all **374** registered generators have callable base routes.
- **1,701 declarations** passed **25,515** cross-band declaration checks.
- **21,420** registered generator/form/band builds passed.
- Native integrity and course registration pass.
- All **1,231 JSON files** parse.
- **261 TypeScript-family files** under `src` and `scripts` syntax-transpile with zero diagnostics.
- Strict semantic checking of the numeric/MCQ contracts in `variants.ts` passes.
- Semantic lesson comparison confirms eight lesson files changed only by 23 added declarations.
- Runtime resolution independently confirms `area-surface-volume` **61/61**, Grade 6 **94/303**, and
  overall coverage **1,904/4,471**.

## Package-backed gate status

A bounded `npm ci` attempt stalled silently beyond its termination window, left an orphaned npm
process, and created a partial `node_modules` tree. The process and all dependency/build/test residue
were removed. Package-backed project typecheck, full Vitest, schema/pedagogy validation, lint,
production build, Playwright, and npm audit remain environment-blocked and are not reported as green.

## Next efficient batch

Proceed with **G6-B: the 45 true runtime gaps in `expressions-equations`**. It is the smallest
remaining Grade-6 course and has strong reuse through existing exponent, evaluation, equivalence,
solution, variable-meaning, and inequality engines. The batch naturally groups into powers/order of
operations, translating and simplifying expressions, one-step equations, inequalities/number-line
meaning, and dependent-variable relationships.

Completion would raise `expressions-equations` from **17/62 to 62/62**, Grade 6 from **94/303
(31.02%) to 139/303 (45.87%)**, and overall refreshed coverage to **1,949/4,471 (43.59%)**.
