# S300 — Fractions Add P1 choice and progression repair

## Scope

This is a course-local Grade 4 `fractions-add` packet. It closes exactly eight source-verifiable P1 roots and deliberately excludes `EXCELLENCE-fa-02-02`, all visual/language/lesson dispositions, shared figures, shared widgets, and all derived authority artifacts.

| Work roots | Repair | Contract preserved |
| --- | --- | --- |
| `CHOICE-0060`–`CHOICE-0062` | Rewrote each four-option `k2` surface into concise, parallel misconception statements. | Option IDs/order, correct option (`a`), feedback, evaluator, and mathematical answer remain unchanged. Length ratios are now `1.14`, `1.15`, and `1.29`. |
| `PROGRESSION-fa-01-01` | Reframed `ch1` from bare missing-numerator recall to redraw-as-eighteenths transfer. | Numeric answer `15` and every evaluator field remain unchanged. |
| `PROGRESSION-fa-02-01` | Reframed `k3` as a 20-square count-model application. | `rationalCompare` values, answer `gt`, feedback, and evaluator remain unchanged. |
| `PROGRESSION-fa-02-02` | Made `k3` explicitly predict sides of one half before exact comparison. | `exactNumberLab` values, required stages, relation truth, feedback, and evaluator remain unchanged. |
| `PROGRESSION-fa-03-01` | Turned `k3` into a denominator-error diagnosis. | Numeric answer `13` and every evaluator field remain unchanged. |
| `PROGRESSION-fa-04-02` | Turned `k3` into verification of a partially built mixed-to-improper expression. | Numeric answer `13` and every evaluator field remain unchanged. |

## Guard and regression

`scripts/session/s300-fractions-add-p1-choice-progression-repair.mjs` accepts only the exact sealed before/after state, writes only the seven scoped lesson JSON files, and reports eight signed root-cause closures. `--check` is current after the repair.

`src/lib/session300.fractionsAddP1ChoiceProgressionRepair.test.ts` ratchets:

- all four MCQ option IDs/order/correctness and exact labels;
- maximum/minimum label-length ratio of at most `1.30` for each repaired MCQ;
- correct evaluation of the MCQs, numeric checks, rational comparison, and exact-number comparison after required exploration;
- schema-level widget integrity; and
- SHA-256 fingerprints of every field outside the explicitly allowed option labels, step body, and widget prompt.

The focused run also retains `S284`'s fourteen-lesson figure-safety regression.

## Source seal

- Course lesson corpus SHA-256: `474b32f4725c52452c9688b52b431da4c07c1bdc776016bf461693d1f2942dcc`
- Guarded non-permitted-field hashes:
  - `fa-01-01`: `51f7667d969e554a674aba3d59b7fbcd969bb45ce183f54e09ce55969b9d23bd`
  - `fa-02-01`: `4d7727cbfd05fea67b55ac93dbc635dfc0f628d0fa48020c6dd04adf2a417774`
  - `fa-02-02`: `34953402403b30f9bbdc19cb02728cd27970b15e44330eec85dcbf63e821f34c`
  - `fa-03-01`: `ff31cc6255ba7ef733c2e54355effd8d6caaf02f02e9844295f42ea78e7d4a9c`
  - `fa-03-02`: `b49e597f28fe7a47dd1ae28274e9ff72e4ef0745a796967c79825e9f19d59eeb`
  - `fa-03-03`: `f5c67ab8a28bdadf6dbe2c01ef7619dfab180b5a05057ae21da80ad21ccfd070`
  - `fa-04-02`: `ee289c3c09654919acbf13d83dcee8f177b07856c6928ba5ab0c728acfb22d22`

## Residuals

The eight root rows remain in the static queue until the integration owner regenerates derived evidence; this packet does not write that queue. The remaining source-specific root is `EXCELLENCE-fa-02-02`, which requires a separately designed multi-representation assessment sequence. The course’s 15 visual-disposition, 15 language-review, and 15 whole-lesson-disposition rows remain assessor-controlled and untouched.

## Gates

Passed:

```text
node scripts/session/s300-fractions-add-p1-choice-progression-repair.mjs --check
pnpm exec vitest run src/lib/session300.fractionsAddP1ChoiceProgressionRepair.test.ts src/lib/session284.fractionsAddFigureExact.test.tsx
pnpm exec eslint scripts/session/s300-fractions-add-p1-choice-progression-repair.mjs src/lib/session300.fractionsAddP1ChoiceProgressionRepair.test.ts
```

The final seal additionally runs content schema, pedagogy, strict CML, TypeScript, and whitespace/diff checks.
