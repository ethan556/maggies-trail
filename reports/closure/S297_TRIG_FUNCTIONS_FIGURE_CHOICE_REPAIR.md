# S297 Trig Functions figure and choice repair

## Scope and closures

- Course: `trig-functions` (15 lessons), collision-cleared against every active source lane before this bounded HS packet.
- Closed `VIS-tf-01-01-c1-sohcahtoa-triangle` by retaining the registered instructional triangle and synchronizing c1 to its exact 3-4-5 claims: `sin θ = 3/5`, `cos θ = 4/5`, and `tan θ = 3/4`.
- Closed three P1 choice-integrity rows—`CHOICE-0256` (`tf-03-01/i3`), `CHOICE-0257` (`tf-04-01/i2`), and `CHOICE-0258` (`tf-05-03/k2`)—with concise, parallel labels. The correct IDs, evaluator surfaces, feedback, and answers remain exactly unchanged.
- Stable lesson/step IDs, widgets, figure registry/runtime, queue, cards, cache, and all derived artifacts remain untouched.

## Evidence and guard

- `scripts/session/s297-trig-functions-figure-choice-repair.mjs` is idempotent and changes only the c1 body plus the twelve audited option labels. It fails closed on concept/figure, evaluator, feedback, correct-answer, or raw-source drift; `--check` permits no pending repair.
- `src/lib/session297.trigFunctionsFigureChoice.test.ts` asserts the registered figure and exact numeric alignment, preserved MCQ evaluator/feedback hashes and correctness, option-label parity, and all 15 lesson schemas.
- Source seal (all 15 sorted lesson files): $seal.

## Audited residuals

- `PROGRESSION-tf-02-02` is a number-normalization finding only: `k2` converts `3π/2` via quarter turns and `ch1` converts `7π/6` from the π anchor. Their actions and representations differ, so no source edit is justified.
- Generic visual-disposition rows remain assessor authority and are intentionally outside this concrete source packet.
