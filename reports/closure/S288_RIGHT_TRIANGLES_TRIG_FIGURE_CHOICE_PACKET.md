# S288 — Right Triangles & Trigonometry: Figure Truth and Choice Parity

Source-local closure packet for `content/courses/right-triangles-trig` (Grade 10).

## Scope sealed

- 5 P0 `ILLUSTRATION_REPLACEMENT` rows: `VIS-rt-01-04-c1-special-right-triangles`, `VIS-rt-03-01-c1-solve-right-triangle`, `VIS-rt-03-02-c2-sohcahtoa-triangle`, `VIS-rt-03-03-c1-solve-right-triangle`, and `VIS-rt-04-03-c2-solve-right-triangle`.
- 7 P1 `CHOICE_SURFACE_INTEGRITY` rows: `CHOICE-0226` through `CHOICE-0232`.

All five figure bindings were fail-closed. Their registered figures contained fixed claims that contradicted the bound concept surfaces: 45-45-90 versus 30-60-90, 3-4-5 versus 7/25, or a 20·sin(34°) example versus general or 18 m/65° prose. No exact registered rebind was source-verifiable. The underlying instructional text remains, but a mismatched learner-visible diagram can no longer render.

The seven MCQs retain their step IDs, option IDs, correct options, feedback, and evaluators. Labels were made semantically parallel so answer length and explanatory detail cannot cue correctness.

## Reproducible checks

```text
node scripts/session/s288-right-triangles-trig-repair.mjs --check
node scripts/session/s288-right-triangles-trig-guard.mjs
npx vitest run src/lib/session288.rightTrianglesTrigFigureChoice.test.ts
```

The repair script reports a deterministic packet seal and is idempotent. The guard source-seals the five retained concept texts, asserts that their `figure` bindings remain absent, validates all option/evaluator contracts, and rejects renewed length leakage.

## Explicit residual boundary

45 generic grade-language, complete-disposition, and visual-first-review rows are assessor-only and deliberately untouched. Queue, review cards, planning portfolios, and cache are intentionally not regenerated while parallel source work is active.
