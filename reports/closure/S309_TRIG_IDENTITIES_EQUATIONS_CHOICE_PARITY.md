# S309 — Trig Identities & Equations Choice-Surface Parity

Source-local P1 packet for Grade 12 `trig-identities-equations`.

## Closed boundary

This closes exactly five concrete choice roots: `CHOICE-0267` through
`CHOICE-0271`, each on an existing check. Only learner-visible MCQ labels
change. The revised vectors make option length and explanation density
parallel without changing the underlying mathematical decision.

Step/option IDs and order, prompts, correct response (`o1`), option feedback,
widget properties, and all other course content remain unchanged. The existing
S247 common-domain lesson work remains inside the masked-widget contract. Every
repaired option set has a maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s309-trig-identities-equations-choice-repair.mjs
node scripts/session/s309-trig-identities-equations-choice-repair.mjs --check
npx vitest run src/lib/session309.trigIdentitiesEquationsChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, prompt, option identity and
order, correctness, option feedback, any other widget property, or raw-label
drift. The regression seals all five vectors, answer evaluation, parity, and
every declared course schema.

The final fifteen-lesson source seal is
`fbd37da62df2d776a600363fb6abbe78570627a3aa4896888806d4e7a7a77e18`.
The repair write, `--check`, focused Vitest regression, preserved S247
domain-truth regression, scoped ESLint, global content/schema validation,
pedagogy lint, `npm run typecheck`, strict CML lint, and `git diff --check`
all pass.

## Residual boundary

Only the five P1 label vectors are in scope. Generic assessor and progression
streams, the prior S247 domain-truth implementation, shared runtime, and all
queue/card/portfolio/cache or other derived artifacts are deliberately
untouched.
