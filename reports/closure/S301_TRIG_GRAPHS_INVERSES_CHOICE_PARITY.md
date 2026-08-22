# S301 — Trig Graphs & Inverses Choice-Surface Parity

Source-local P1 packet for Grade 12 `trig-graphs-inverses`.

## Closed boundary

This closes exactly eight concrete choice-surface roots: `CHOICE-0259` through
`CHOICE-0266`, spanning seven lessons. The repair changes only the three
learner-visible option labels at each target, replacing explanation-density
and answer-length cues with concise, mathematically parallel claims.

All step IDs, option IDs and order, prompts, correct response (`o1`), feedback,
evaluator semantics, figures, and non-choice content are preserved. The one
challenge MCQ (`CHOICE-0264`) remains a challenge. Every repaired question has
an option-label spread of at most 12 characters.

## Reproducible seal

```text
node scripts/session/s301-trig-graphs-inverses-choice-repair.mjs
node scripts/session/s301-trig-graphs-inverses-choice-repair.mjs --check
npx vitest run src/lib/session301.trigGraphsInversesChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, evaluator, feedback,
correct-answer, option identity, or raw-label drift. The aggregate regression
checks all eight label vectors, evaluator behavior, parity, and all fifteen
course lesson schemas.

Final source seal (the sorted fifteen lesson files, including filenames) is
`5f7c48be2ea48bf3acb99978bba210f2477e85b759c430f8e1da11dc0212db1e`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
schema/content validation, pedagogy lint, `npm run typecheck`, strict CML lint,
and `git diff --check` all pass.

## Residual boundary

The two queued progression rows (`PROGRESSION-tg-02-03` and
`PROGRESSION-tg-04-02`) require pedagogical progression authority and remain
unclaimed. Generic disposition/language/visual review, shared runtime or
registry work, and all queue, card, portfolio, cache, and other derived
artifacts are deliberately untouched.
