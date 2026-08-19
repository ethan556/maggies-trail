# S310 — Radical Functions Choice-Surface Parity

Source-local P1 packet for Grade 11 `radical-functions`.

## Closed boundary

This closes exactly four concrete choice roots: `CHOICE-0212` through
`CHOICE-0215`, including one existing interactive MCQ. Only learner-visible
MCQ labels change. The revised vectors make option length and explanation
density parallel without changing the underlying mathematical decision.

Step/option IDs and order, prompts, correct response (`o1`), option feedback,
widget properties, and all other course content remain unchanged. Every
repaired option set has a maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s310-radical-functions-choice-repair.mjs
node scripts/session/s310-radical-functions-choice-repair.mjs --check
npx vitest run src/lib/session310.radicalFunctionsChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, prompt, option identity and
order, correctness, option feedback, any other widget property, or raw-label
drift. The regression seals all four vectors, answer evaluation, parity, and
every declared course schema.

The final fifteen-lesson source seal is
`6f4ca34b162de6f823b61177bc06f84b07fad074532a908e6a26ca01a57a3fab`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
content/schema validation, pedagogy lint, `npm run typecheck`, strict CML lint,
and `git diff --check` all pass.

## Residual boundary

Only the four P1 label vectors are in scope. Generic assessor and progression
streams, shared runtime, and all queue/card/portfolio/cache or other derived
artifacts are deliberately untouched.
