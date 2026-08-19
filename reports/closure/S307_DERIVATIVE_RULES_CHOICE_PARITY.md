# S307 — Derivative Rules Choice-Surface Parity

Source-local P1 packet for Grade 13 `derivative-rules`.

## Closed boundary

This closes exactly seven concrete choice roots: `CHOICE-0051` through
`CHOICE-0057`, each on an existing check. Only learner-visible MCQ labels
change. The revised vectors make option length and explanation density
parallel without changing the underlying mathematical decision.

Step/option IDs and order, prompts, correct response (`o1`), option feedback,
widget properties, and all other course content remain unchanged. Every
repaired option set has a maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s307-derivative-rules-choice-repair.mjs
node scripts/session/s307-derivative-rules-choice-repair.mjs --check
npx vitest run src/lib/session307.derivativeRulesChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, prompt, option identity and
order, correctness, option feedback, any other widget property, or raw-label
drift. The regression seals all seven vectors, answer evaluation, parity, and
every declared course schema.

The final fifteen-lesson source seal is
`c71fad070a9666f9693745cdf1588f865b1160f449f34910598d22e9130b77e5`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
content/schema validation, pedagogy lint, `npm run typecheck`, strict CML lint,
and `git diff --check` all pass.

## Residual boundary

Only the seven P1 label vectors are in scope. Generic assessor streams, shared
runtime, and all queue/card/portfolio/cache or other derived artifacts are
deliberately untouched.
