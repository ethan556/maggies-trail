# S299 — Integration & Accumulation Choice-Surface Parity

Source-local P1 packet for Grade 12 `integration-accumulation`.

## Closed boundary

This closes exactly eleven source-verifiable choice rows: `CHOICE-0115` through
`CHOICE-0125`, across ten lessons. Every affected surface is a four-option
`check` MCQ. The repair changes only learner-visible option labels, replacing
answer-length and explanation-density cues with concise, parallel mathematical
claims.

Stable lesson/step IDs, option IDs and order, prompts, correct response (`o1`),
feedback, evaluator semantics, concept tags, and every non-choice step are
preserved. The within-question label-length spread is at most 12 characters.

## Reproducible seal

```text
node scripts/session/s299-integration-accumulation-choice-repair.mjs
node scripts/session/s299-integration-accumulation-choice-repair.mjs --check
npx vitest run src/lib/session299.integrationAccumulationChoiceParity.test.ts
```

The repair fails closed on source shape, step kind, evaluator, feedback,
correct-answer, option-identity, or raw-label drift. Its regression seals all
eleven label arrays, answer evaluation, parity bound, and all fifteen lesson
schemas.

Final source seal (the sorted fifteen lesson files, including filenames) is
`d213da6e2e7a42f2fb8ea565808ec9cb6da4b6c09bcda5f12d41980cc97a27da`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
`npm run typecheck`, strict CML lint, and `git diff --check` all pass.

## Residual boundary

Only the listed P1 label vectors are in scope. P0 visual rows, progression and
disposition review, shared runtime/registry work, and every queue, card,
portfolio, cache, and other derived artifact are deliberately untouched.
