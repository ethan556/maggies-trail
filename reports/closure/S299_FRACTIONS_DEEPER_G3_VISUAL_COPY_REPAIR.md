# S299 — Fractions Deeper G3 fixed-figure copy synchronization

## Scope and result

This packet closes four source-verifiable P0 `ILLUSTRATION_REPLACEMENT` causes in `fractions-deeper-g3`. Each placement had an existing, registered semantic figure. The repair synchronizes only the concept body and narration to the exact values represented by that figure; it does not change a figure ID, SVG, widget, evaluator, option, answer, feedback, remedial, or review record.

| Queue root | Lesson/step | Existing figure | Source-controlled alignment now asserted |
| --- | --- | --- | --- |
| `VIS-g3f-01-03-c1-frac-three-fourths` | `g3f-01-03/c1` | `frac-three-fourths` | four equal pieces; three shaded; `3/4` |
| `VIS-g3f-01-05-c2-mc-ruler-eighths` | `g3f-01-05/c2` | `mc-ruler-eighths` | `6/8 = 3/4` on the ruler |
| `VIS-g3f-02-01-c2-frac-numline-unit` | `g3f-02-01/c2` | `frac-numline-unit` | one equal fourth-jump from zero |
| `VIS-g3f-02-02-c1-thirds-compare` | `g3f-02-02/c1` | `thirds-compare` | equal halves, thirds, and fourths; more parts means smaller pieces |

The course-local guard is deliberately idempotent. It accepts only the exact pre-repair or post-repair body/narration pair, asserts `kind: concept` and the pre-existing fixed figure ID, and reports four signed root-cause closures. `--check` proves the current post-repair state without writing.

## Regression evidence

`src/lib/session299.fractionsDeeperG3VisualCopyRepair.test.ts` asserts:

- the full 14-lesson course inventory remains present;
- all four synchronized body/narration pairs are exact;
- every existing figure still server-renders with a `role="img"` and its exact semantic `<title>`; and
- a SHA-256 fingerprint of every touched lesson with only the permitted body/narration fields removed remains unchanged. This makes any evaluator, option, feedback, figure, or step-structure change fail the regression.

The existing S252 whole-course integrity test remains part of the focused run and continues to validate schema, pedagogy, widget integrity, the 28 main concept renderings, progression non-collision, and evaluator/feedback truth.

## Source seal

- Course lesson corpus SHA-256 after repair: `8a6f1baedb704f1d114fabd9b853b21c5f004428a5fca56477cb07336cd6824e`
- Non-copy field fingerprints:
  - `g3f-01-03`: `d469552451800b62603fe1c73bbe3eebb3c7733966f8c4f05728cf7a79a5f3e2`
  - `g3f-01-05`: `5e50b9a9cb587861212c54ad6b62c68dcc84226ce6966784a3706439df1da861`
  - `g3f-02-01`: `2cfc9aea2a8157846183c61b8bdc0c7eabe817269e2010689ac5463ca44789f0`
  - `g3f-02-02`: `6189227bd2337aa79baa3701d4d4fa52c807af8c462e7c81c1624e0ce438e765`

## Deliberately untouched residual debt

This source-only packet does not self-close assessor or generic review work. The current queue still contains 13 signed remedial/diversification revision roots (`LESSON-REVISION-g3f-01-01` through `-05`, `-02-01`, `-02-03` through `-05`, and `-03-01` through `-04`) plus the three generic review roots for `g3f-02-02` (`VISUAL-DISPOSITION`, `LANGUAGE`, and `LESSON`). These require the appropriate independent review or a separately scoped instructional redesign.

## Gates

Passed before seal:

```text
node scripts/session/s299-fractions-deeper-g3-visual-copy-repair.mjs --check
pnpm exec vitest run src/lib/session299.fractionsDeeperG3VisualCopyRepair.test.ts src/lib/session252.fractionsDeeperG3CourseIntegrity.test.tsx
pnpm validate:content
pnpm lint:pedagogy       # 1711/1711 files clean
pnpm cml:lint:strict     # 0 errors, 0 warnings
pnpm typecheck
pnpm exec eslint scripts/session/s299-fractions-deeper-g3-visual-copy-repair.mjs src/lib/session299.fractionsDeeperG3VisualCopyRepair.test.ts
git diff --check -- <all packet paths>
```

No queue, card, cache, ledger, figure-registry, or shared-runtime write is in scope.
