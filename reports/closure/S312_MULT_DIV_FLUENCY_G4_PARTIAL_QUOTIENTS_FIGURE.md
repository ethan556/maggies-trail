# S312 — Grade 4 Partial-Quotients Representation Closure

Status: source closure for the previously withheld `LESSON-REVISION-g4m-02-04` representation gap. No queue, card, cache, or ledger artifact was changed.

## Exact learner story

`g4m-02-04/c1` now uses `g4m-partial-quotients-852-4`, a compact two-step model for the lesson's existing task:

- `852 ÷ 4 = 213`
- remove `200` groups of `4`: `200 × 4 = 800`, leaving `52`
- remove `13` groups of `4`: `13 × 4 = 52`, leaving `0`
- add the recorded group counts: `200 + 13 = 213`

The binding changes only concept `c1`. The estimate target remains `213`; the correct `k1` and `k3` MCQ option remains `o0`; their IDs, option order, feedback, and evaluator contracts are untouched.

## Representation and accessibility evidence

- Registered, responsive `320 × 142` inline SVG with a short two-card landscape layout.
- Visible `<title>` contains all five exact arithmetic claims; the generated renderer-derived contract now contains the same claim under `g4m-partial-quotients-852-4`.
- `role="img"` and an equivalent `aria-label` state both removed chunks, both remainders, and the final quotient.
- All eight instructional SVG `<text>` labels use `INK` (`#22314F`) over white/light card fills; colour is carried by the two cards, not the text.
- The focused regression calculates the alpha-composited card backgrounds and asserts AA contrast of at least 4.5:1 (measured: #FFFFFF 12.96 #e2edf9 10.93 #e2f2ea 11.19).
- `isFigureTextAligned` and `compareExactFigureNumericParity` both accept the bound concept text. Any future competing numeric story fail-closes before rendering.

## Reproducibility and gates

- `scripts/session/s312-mult-div-fluency-g4-partial-quotients-figure-repair.mjs --check` first reported the expected pending baseline, then repaired one exact placement and is now `CURRENT`.
- Focused Vitest: 3 files, 5 tests passed (new SSR/ARIA/contract/evaluator regression, generated-claim parity, prior G4 visual regression).
- `validate:content`, `lint:pedagogy` (`1711/1711`), `cml:lint:strict` (`0` errors/warnings), registration check, global typecheck, scoped ESLint, figure-ID generation, numeric-claim generator `--check`, and `git diff --check` all passed.

## Source seal

`8a3b433a62912ebcecdca7b29e3bf274e59d758a087bc59c7620ee7ef2a952d1`

The seal covers the lesson, figure registry and generated figure contracts, plus the S312 guard and regression. It excludes unrelated concurrent worktree changes.