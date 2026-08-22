# S302 — Shapes Build Kindergarten Choice-Order Parity

## Source evidence

The fresh live queue identifies CHOICE-0130 through CHOICE-0138: nine learner-facing `mcq` source blocks in the clean `shapes-build-k` course. Source inspection confirmed a common fixed-order defect: each item retains four stable option IDs and one stable correct option (`o0`), but every correct option is authored first. The items cover position words, flat and solid shapes, and drawing/building shapes.

The exact pre-repair source-set SHA-256 (the course JSON files in sorted filename order) was `562c6f7e1384d6394870f2adc9730b6a4ab4aad24386c0e49373e86c75985ae1`.

## Repair

Only the nine existing MCQ option arrays are deterministically reordered so their existing correct option renders at index 1, 2, or 3, three cases each. Stable option IDs, prompt wording, option wording, per-option feedback, correctness, figures, lesson sequencing, CML, and evaluator/runtime behavior are unchanged.

`scripts/session/s302-shapes-build-k-choice-order-repair.mjs` accepts only the exact pre-repair order or the exact expected repaired order for each target. It fails on ID, correct-answer, source-shape, or separator drift and preserves surrounding source whitespace.

The repaired source-set SHA-256 is `b439279db712940f321d380b00775ad1aad0285fa04f1d64b57708914facb4fc`.

## Boundaries

Only the nine course lesson files, the guarded replay script, the focused regression, and this report change. Generic disposition rows, non-targeted choices, shared runtime/schema/registry, queue/cards/cache/generated artifacts, and every other course remain untouched.

## Verification

```powershell
node scripts/session/s302-shapes-build-k-choice-order-repair.mjs
node scripts/session/s302-shapes-build-k-choice-order-repair.mjs
pnpm exec vitest run src/lib/session302.shapesBuildKChoiceOrder.test.ts
pnpm validate:content
pnpm lint:pedagogy
pnpm typecheck
git diff --check -- content/courses/shapes-build-k scripts/session/s302-shapes-build-k-choice-order-repair.mjs src/lib/session302.shapesBuildKChoiceOrder.test.ts reports/quality/S302_SHAPES_BUILD_K_CHOICE_ORDER.md
```
