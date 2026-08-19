# S287 Shapes & Space choice-parity repair

## Scope

- Course: `shapes-space` (Grade 3; seven lessons).
- Fresh source-local packet: report/ledger search found standards-decision references only, with no previous course-repair script or source implementation report.
- Owns exactly seven P1 choice-surface causes: `CHOICE-0100` through `CHOICE-0106`.
- Leaves figures, lesson structure, stable IDs, correct options, feedback, evaluators, runtime, queues, cards, cache, ledgers, standards, and derived artifacts unchanged.

## Source closures

| Cause | Lesson step | Repair |
| --- | --- | --- |
| `CHOICE-0100` | `geo-01-01/ch1` | Replaced a reasoning-heavy correct label with four parallel shape-description labels. |
| `CHOICE-0101` | `geo-01-01/k2` | Made the turned-shape alternatives concise and structurally parallel. |
| `CHOICE-0102` | `geo-01-03/k2` | Made rectangle/square alternatives answer-neutral claims of comparable length. |
| `CHOICE-0103` | `geo-02-02/k3` | Replaced the unique explanatory correct label with four comparable claims about misfits. |
| `CHOICE-0104` | `geo-03-01/k2` | Made all equal-fourths choices use the same Square A/B/Both/Neither frame. |
| `CHOICE-0105` | `geo-03-01/k3` | Made all fourths/eighths comparison choices parallel size claims. |
| `CHOICE-0106` | `geo-03-02/k3` | Made all fractional-part choices use the same numerator/denominator/shading frame. |

Each surface retains option IDs `a`–`d`, one correct option (`a`), original feedback, and its pre-existing MCQ evaluator. The maximum label-length spread is six characters; no option label contains a correctness cue or a unique explanation.

## Verification

- Guarded idempotent repair: `scripts/session/s287-shapes-space-choice-parity-repair.mjs`.
- Aggregate regression: `src/lib/session287.shapesSpaceChoiceParity.test.ts` verifies all seven exact source closures, option/evaluator invariants, parity ceilings, all seven lesson identities, and remaining registered/text-aligned figure bindings.
- Current seven-lesson source seal: `7420554a614fec9adcbe4231b6890c0011ccc450194f7c64c72924e90dd54ba0`.
- Passed: repair `--check`; focused regression (2/2); schema (1711/1711); pedagogy (1711/1711); strict CML (0 errors, 0 warnings); scoped ESLint; whitespace diff check; and repository-wide TypeScript.
- The source queue is intentionally untouched. After independent review and source-seal reconciliation, this packet can support a source-compatible closure delta of **7 P1 rows**.
- Generic residuals remain assessor-controlled: seven language rows, seven lesson dispositions, and seven visual dispositions.
