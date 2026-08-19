# S296 Expressions & Equations fixed-figure truth repair

## Scope and closures

- Course: `expressions-equations` (Grade 6; 18 lessons). It was collision-checked with every active source lane before this course-local repair.
- Closed five P0 `ILLUSTRATION_REPLACEMENT` root causes by withholding only a fixed-number diagram that taught a different worked example than its adjacent concept:
  - `VIS-ee-02-02-c2-expression-machine`
  - `VIS-ee-02b-02-c2-expression-machine`
  - `VIS-ee-02b-03-c2-ee-like-terms`
  - `VIS-ee-04-02-c2-balance-scale`
  - `VIS-ee-04-03-c2-ee-mult-div-solve`
- Retained `VIS-ee-01-01-c2-ee-exponent-vs-mult` and synchronized its prose to name its exact rendered contrast: `2³ = 8`, not `2 × 3 = 6`.
- Stable lesson and step IDs, all bodies, widgets/evaluators, feedback, MCQ correctness, figure registry/runtime, queue, review cards, cache, and derived artifacts are unchanged.

## Evidence and guard

- `scripts/session/s296-expressions-equations-figure-truth-repair.mjs` accepts only the five original concept/figure/no-widget contracts and exact instructional text. It removes just the erroneous `figure` field and is idempotent: `--check` fails if any withhold is pending.
- `src/lib/session296.expressionsEquationsFigureTruth.test.ts` seals the five absent bindings and retained instructional text, the single exact retained figure and numeric/text alignment, every lesson identity, schema parse, and each extant widget evaluator parse.
- Source seal (all 18 sorted lesson files): $seal.

## Audited residuals

- The three P1 progression flags (`ee-01-02/k2,k3`, `ee-04-02/k3`, and `ee-05-01/k1`) are number-normalization findings, not exact duplication: each uses a distinct mathematical rule/action. They remain unchanged.
- The eighteen P1 `VISUAL_FIRST_REPRESENTATION` lesson dispositions require assessor authority and remain outside this concrete fixed-figure repair.
- The queue remains intentionally untouched pending independent review and a serial derived-artifact refresh.
