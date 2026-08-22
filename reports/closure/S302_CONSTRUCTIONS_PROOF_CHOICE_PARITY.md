# S302 — Constructions & Proof Choice-Surface Parity

Source-local P1 packet for Grade 10 `constructions-and-proof`.

## Closed boundary

This closes exactly nine concrete choice-surface roots: `CHOICE-0012` through
`CHOICE-0020`, spanning seven lessons. The repair changes only MCQ option
labels, replacing explanation-density and length cues with comparable,
mathematically specific claims.

All lesson/step IDs, option IDs and order, prompts, correct response (`o1`),
feedback, evaluator semantics, figures, and non-choice content are preserved.
The existing challenge and interactive step types remain unchanged. Each
repaired option set has a maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s302-constructions-proof-choice-repair.mjs
node scripts/session/s302-constructions-proof-choice-repair.mjs --check
npx vitest run src/lib/session302.constructionsProofChoiceParity.test.ts
```

The idempotent writer fails closed on source shape, step kind, evaluator,
feedback, correct-answer, option-identity, or raw-label drift. The aggregate
regression seals all nine option vectors, evaluator behavior, label parity, and
every declared course lesson schema.

Final source seal (the sorted fifteen lesson files, including filenames) is
`682c83be7563e08fc76c0b11a8d9d07663fe99d7261c9c26fa349c944bfe649b`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
schema/content validation, pedagogy lint, `npm run typecheck`, strict CML lint,
and `git diff --check` all pass.

## Residual boundary

This course has no additional concrete P0/P1 source rows in the assigned
subset. Generic visual/language/disposition authority and every shared runtime,
queue, card, portfolio, cache, or other derived artifact remain untouched.
