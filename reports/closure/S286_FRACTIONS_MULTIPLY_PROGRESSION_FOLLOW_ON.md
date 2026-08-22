# S286 Fractions Multiply progression and option-parity follow-on

## Scope and boundary

- Course: `fractions-multiply` (Grade 5; 13 lessons).
- Source-only follow-on to the prior S266 figure packet.
- Owns ten exact, source-verifiable P1 causes: `CHOICE-0065` and `PROGRESSION-fm-01-01`, `fm-01-03`, `fm-02-02`, `fm-03-02`, `fm-03-03`, `fm-04-01`, `fm-04-02`, `fm-05-01`, and `fm-05-02`.
- Does not touch figures, shared widgets/schema/runtime, queue, cards, cache, ledgers, standards, or derived evidence.

## Implemented source closures

| Queue cause | Source steps | Distinct learner job now enforced |
| --- | --- | --- |
| `PROGRESSION-fm-01-01` | `k3`, `ch1` | Find a scale factor; complete an equivalent fraction. |
| `PROGRESSION-fm-01-03` | `k3` | Diagnose and correct an invalid denominator subtraction. |
| `PROGRESSION-fm-02-02` | `i2`, `k3`, `ch1` | Repair an equal-shares misconception; read selected groups; transfer to a shaded array. |
| `PROGRESSION-fm-03-02` | `k3`, `ch1` | Interpret one half of a fraction; cancel a shared factor before multiplying. |
| `PROGRESSION-fm-03-03` | `i2` | Verify a stated simplification rather than repeat a direct reduction prompt. |
| `PROGRESSION-fm-04-01` | `k2`, `k3` | Challenge a false claim about the identity multiplier; classify a shrink from a sub-unit scaler. |
| `PROGRESSION-fm-04-02` | `ch1` | Compare the scalers for two products with a shared starting amount. |
| `PROGRESSION-fm-05-01` | `ch1` | Count unit-fraction containers in a whole-number quantity. |
| `PROGRESSION-fm-05-02` | `ch1` | Share one fractional piece among equal recipients. |
| `CHOICE-0065` | `fm-03-01/k3` | Replaced the length-cued three-option prediction with four parallel, answer-neutral size descriptions. |

All 15 changed steps preserve their stable IDs, step kinds, widget types, accepted answer/correct option, tolerance/form fields, and feedback branch structure. No figure binding was added, removed, or rebound. The pre-existing S266 fail-closed visual policy remains intact.

## Evidence and gates

- Guarded idempotent repair: `scripts/session/s286-fractions-multiply-progression-repair.mjs`.
- `--check` requires all 15 exact source updates and fails closed on authored drift.
- Aggregate regression: `src/lib/session286.fractionsMultiplyProgression.test.ts` checks all ten source closures, 15 exact learner-job rewrites, evaluator targets, MCQ parity, all 13 lesson identities, and registered/text-aligned remaining figures.
- Current 13-lesson source seal: `e421a0281d0478e280762e45a8589d03a637303805533f6f22f8b2fc1166d14a`.
- Passed: repair `--check`; focused S266+S286 regression (5/5); schema (1711/1711); pedagogy (1711/1711); strict CML (0 errors, 0 warnings); scoped ESLint; and whitespace diff check.
- Repository-wide TypeScript: pass (`pnpm typecheck`) after the concurrent Circle Theorems fix.

The queue itself is intentionally untouched. Once independently assessed and source-seal reconciled, this packet can support a source-compatible closure delta of **10 P1 rows**. The course's 13 language rows, 13 lesson dispositions, and 13 visual dispositions remain assessor-controlled; no generic review authority is claimed here.
