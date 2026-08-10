# Session 82 — G6-D Ratios & Rates completion

## Result

Session 82 refreshes all **57** true runtime gaps in `ratios-rates`:

- `ratios-rates`: **4/61 → 61/61 (100%)**
- Grade 6: **187/303 (61.72%) → 244/303 (80.53%)**
- Overall: **1,997/4,471 (44.67%) → 2,054/4,471 (45.94%)**

This is a pure-reuse batch. The 57 declarations resolve through **50 forms** across four existing
generator families. Forty-nine forms are focused Session-82 extensions and one proven form is reused
directly; no generator family was added:

- `pr-constant-k-g7` — ratio order, part-to-part and part-to-whole meaning, equivalent ratios, tables,
  double number lines, and tool selection
- `pr-unit-rate-g7` — unit-rate setup, cost, speed, distance, price comparison, predictions, and
  percent-discount applications
- `pct-of-number` — fraction/percent equivalence, grid percentages, ordering, percentages over 100,
  inverse percent, benchmarks, and contexts
- `metric-convert` — conversion direction, larger-unit division, time chains, rate multiplication,
  and cross-unit comparison

All authored interaction surfaces remain intact: **35 numeric**, **18 MCQ**, and **4
`buildExpression`** assessments. Fourteen lesson files differ from Session 81 only through 57 added
`variant` declarations; authored prompts, answers, explanations, figures, widget specifications, and
prose are unchanged.

## Quality safeguards

- Equivalent-ratio, ratio-table, and double-number-line draws require distinct answer and
  misconception values across all three difficulty bands.
- Unit-rate contexts derive answers from visible quantities and reject configurations where total,
  reciprocal, additive, or wrong-store traps collide.
- Discount draws exclude percentages and subtotals that make the discount amount equal the final
  price or another diagnosis.
- Independent routes recompute answers from printed prompts and normalize only the final finite
  decimal result, avoiding trust in stored answer fields.
- Percent-whole explanations use exact `part ÷ percent × 100` arithmetic rather than repeating
  decimal scale factors.
- Time-conversion traps remain finite and student-readable; no repeating decimal is shown.
- Singular/plural wording is generated from the actual number of ratio groups.

## Verification

- **42,000** focused deterministic builds across all 50 Session-82 forms and three difficulty bands.
- **37,500** checks through the actual standing independent solution routes.
- **18,000** evaluator-level builds with **121,320** correctness and diagnostic assertions.
- Whole registry: **374 generators**, **157,920 deterministic builds**, PASS.
- Independent-route invariant: all **374** registered generators have callable base routes.
- **1,851 declarations** passed **27,765** cross-band declaration checks.
- **23,688** registered generator/form/band builds passed.
- Native integrity and course registration pass.
- All **1,231 JSON files** parse.
- **261 TypeScript-family files** under `src` and `scripts` syntax-transpile with zero diagnostics.
- Strict semantic checking of the numeric/MCQ contracts in `variants.ts` passes.
- Semantic lesson comparison confirms fourteen lesson files changed only by 57 added declarations.
- Runtime resolution independently confirms `ratios-rates` **61/61**, Grade 6 **244/303**, and overall
  coverage **2,054/4,471**.

## Package-backed gate status

A bounded `npm ci` attempt stalled silently and created a partial `node_modules` tree. The orphaned
process was terminated and all dependency/build/test residue was removed. Package-backed project
typecheck, full Vitest, schema/pedagogy validation, lint, production build, Playwright, and npm audit
remain environment-blocked and are not reported as green.

## Next efficient batch

Proceed with **G6-E: the 59 true runtime gaps in `data-distributions`**. It is the final incomplete
Grade-6 course and should reuse statistical-question, dot-plot, histogram, center/spread, and
comparison engines.

Completion would raise `data-distributions` from **0/59 to 59/59**, Grade 6 from **244/303 (80.53%)
to 303/303 (100%)**, and overall refreshed coverage to **2,113/4,471 (47.26%)**.
