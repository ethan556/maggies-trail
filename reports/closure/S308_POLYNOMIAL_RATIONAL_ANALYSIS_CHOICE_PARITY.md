# S308 — Polynomial & Rational Analysis Choice-Surface Parity

Source-local P1 packet for Grade 12 `polynomial-rational-analysis`.

## Closed boundary

This closes exactly six concrete choice roots: `CHOICE-0200` through
`CHOICE-0205`, each on an existing check. Only learner-visible MCQ labels
change. The revised vectors make option length and explanation density
parallel without changing the underlying mathematical decision.

Step/option IDs and order, prompts, correct response (`o1`), option feedback,
widget properties, and all other course content remain unchanged. Every
repaired option set has a maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s308-polynomial-rational-analysis-choice-repair.mjs
node scripts/session/s308-polynomial-rational-analysis-choice-repair.mjs --check
npx vitest run src/lib/session308.polynomialRationalAnalysisChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, prompt, option identity and
order, correctness, option feedback, any other widget property, or raw-label
drift. The regression seals all six vectors, answer evaluation, parity, and
every declared course schema.

The final fifteen-lesson source seal is
`9d1121aaba9a0651b00ac7d3ddf9c0f09b6d2380e79408aeaf278e7d8e05ea76`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
content/schema validation, pedagogy lint, `npm run typecheck`, strict CML lint,
and `git diff --check` all pass.

## Residual boundary

Only the six P1 label vectors are in scope. Generic assessor streams, shared
runtime, and all queue/card/portfolio/cache or other derived artifacts are
deliberately untouched.
