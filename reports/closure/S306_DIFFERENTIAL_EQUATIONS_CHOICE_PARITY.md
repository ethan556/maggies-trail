# S306 — Differential Equations Choice-Surface Parity

Source-local P1 packet for Grade 13 `differential-equations`.

## Closed boundary

This closes exactly nine concrete choice roots: `CHOICE-0034` through
`CHOICE-0042`, across six lessons. Only learner-visible MCQ labels change;
the repair removes answer-length and explanation-density cues using concise,
parallel mathematical claims.

Step/option IDs and order, prompts, correct response (`o1`), feedback,
evaluator semantics, the pre-existing S276 figure withhold, and all other
course content remain unchanged. Challenge/check types remain intact. Every
repaired option set has a maximum label-length spread of 12 characters.

## Reproducible seal

```text
node scripts/session/s306-differential-equations-choice-repair.mjs
node scripts/session/s306-differential-equations-choice-repair.mjs --check
npx vitest run src/lib/session306.differentialEquationsChoiceParity.test.ts
```

The idempotent writer fails closed on source kind, evaluator, feedback,
correct-answer, option identity, or raw-label drift. Its regression seals all
nine vectors, answer evaluation, parity, and every declared course schema.

The final six-lesson source seal is
`7140da215e8f3304e37b2fb114c4feda9a5faef5398a4e2a95c81fcfe8200fb0`.
The repair write, `--check`, focused Vitest regression, scoped ESLint, global
content/schema validation, pedagogy lint, strict CML lint, and `git diff
--check` pass. The contemporaneous global TypeScript failure is confined to
the active peer-owned `session304.fractionMultiplyG4P0FigureFailclose` test
and is unrelated to this packet.

## Residual boundary

Only the nine P1 label vectors are in scope. Generic assessor streams, S276’s
separate figure decision, shared runtime, and all queue/card/portfolio/cache or
other derived artifacts are deliberately untouched.
