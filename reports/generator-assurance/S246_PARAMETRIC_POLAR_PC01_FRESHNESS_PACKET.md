# S246 — Parametric & Polar Calculus `pc-01` freshness packet

## Boundary and disposition

- Course: `parametric-polar-calculus` (Grade 13)
- Coherent family: Chapter 1, `pc-01-01` through `pc-01-02`
- Exact starting frontier: `pc-01-01.json/k1` / `parametric-polar-calculus__pc-parametric-derivative__numeric`
- Stop frontier: `pc-02-01.json/k3` in the next, untouched vector-motion family
- Lesson JSON was audited but not edited. Shared queues, cards, ledgers, caches, MCQ evidence, and audit scripts were not touched.

## Declared consumer census

| Form | Surface | Consumers | Deterministic prompt/truth states |
|---|---:|---:|---:|
| `parametric-polar-calculus__pc-parametric-derivative__numeric` | numeric | 2 | 12 |
| `parametric-polar-calculus__pc-parametric-derivative__mcq` | MCQ | 1 | 12 |
| `parametric-polar-calculus__pc-second-derivative__numeric` | numeric | 1 | 12 |
| `parametric-polar-calculus__pc-arc-length__numeric` | numeric | 3 | 12 |
| `parametric-polar-calculus__pc-arc-length__mcq` | MCQ | 1 | 12 |
| **Total** | **five forms** | **8** | **60** |

## Root-cause repair

The five forms previously fell through to one-to-three fixed authored prompts. The bounded replacement families preserve all numeric and MCQ surfaces while varying coordinate coefficients, translations, evaluation times, parameter intervals, velocities, slopes, second derivatives, and arc lengths.

- First derivatives are rebuilt as `(dy/dt)/(dx/dt)` from the displayed coordinate functions.
- Second derivatives are rebuilt as `d/dt(dy/dx)` divided again by `dx/dt`.
- Straight-line arc lengths are rebuilt by integrating the displayed constant speed across the complete parameter interval.
- MCQ choices are deterministically shuffled, label-parallel, unique, and position-varying.
- Numeric misconception values are rounded, deduplicated, and excluded from the prompt-derived truth.

## Predecessor compatibility repair

Before resolving lesson order, the registry-wide source gate exposed a legacy bare/default `g12-limits-continuity` route that still fell through to a small authored bank and disagreed with the strengthened average-rate oracle. The default route now delegates to the same 12-state, prompt-solvable average-rate MCQ family as the declared lc-05 form. A dedicated lc-05 regression exercises 240 default-route seeds, deterministic replay, 12 prompts, 12 truths, schema/surface agreement, and shuffled answer positions. Declared limits consumers and lesson content are unchanged.

## Independent assurance

`calculusIndependent.cjs` receives only learner-visible prompt text. It imports no pc-01 case table and does not inspect a generated answer.

The focused gate checks:

- 280 direct seeded calls per form with deterministic replay;
- exactly 12 distinct prompts and 12 distinct truths per form;
- 96 unseen `variantForStep` seeds per form;
- schema validity and preservation of every declared numeric/MCQ surface;
- exact prompt-oracle agreement, single-correct MCQs, unique labels, bounded option-length parity, and answer-position variation;
- six adversarial recomputation/rejection cases, including changed coefficients, zero `dx/dt`, and an invalid parameter interval.

This covers 1,400 direct generated states plus 480 resolver states across the five forms.

## Verification and stop boundary

- `session246.parametricPolarPc01Freshness.test.ts`: **4/4 passed**
- Sequential lc-01 through lc-05 plus pc-01 gate: **5 files, 24/24 tests passed**
- TypeScript: passed (`tsc --noEmit`)
- Diff check: passed
- Live lesson-order resolver: every `pc-01` consumer passes; the intentional stop is the next untouched frontier, `pc-02-01.json/k3`, where the vector-motion form emits exactly three distinct widgets and the gate requires more than three.

## Reopen conditions

Reopen this packet if a declared pc-01 consumer/form changes, a surface changes, the independent prompt grammar no longer parses learner-visible output, a pool falls below 12 prompt/truth states, or a shared calculus generator edit breaks this focused gate.
