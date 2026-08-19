# S304 — Rational Functions Choice-Surface Parity

Source-local P1 packet for Grade 11 `rational-functions`.

## Closed boundary

This closes exactly eight concrete choice-surface roots: `CHOICE-0216` through
`CHOICE-0223`, spanning six lessons. The repair changes only learner-visible
MCQ labels, replacing answer-length and explanation-density cues with concise,
comparable mathematical claims.

All step/option IDs and order, prompts, correct response (`o1`), feedback,
evaluator semantics, figures, and non-choice content are preserved. Interactive
and check step types remain unchanged. Each repaired choice vector has a
maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s304-rational-functions-choice-repair.mjs
node scripts/session/s304-rational-functions-choice-repair.mjs --check
npx vitest run src/lib/session304.rationalFunctionsChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, evaluator, feedback,
correct-answer, option identity, or raw-label drift. Its aggregate regression
seals all eight vectors, answer evaluation, parity, and every declared course
lesson schema.

Final source seal (the sorted fifteen lesson files, including filenames) is
`5a82e4a78ba4fffd8eca2bbf9443b11f76e7ddd9c88062fd887d6db2dd3af303`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
schema/content validation, pedagogy lint, strict CML lint, `git diff --check`,
and global `npm run typecheck` pass.

## Residual boundary

Only the listed P1 label roots are in scope. Generic visual/language/
disposition authority and every shared runtime, queue, card, portfolio, cache,
and other derived artifact are deliberately untouched.
