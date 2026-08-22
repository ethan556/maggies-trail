# S292 Measurement & Data choice-parity repair

## Scope and closures

- Course: `measurement-data` (Grade 3; 17 lessons). This is a disjoint P1 follow-on to the earlier S269 figure-withholding work: no figures, shared runtime, registry, queue, cards, cache, ledger, or derived artifacts changed here.
- Closed eight source-verifiable choice-surface roots: `CHOICE-0167` through `CHOICE-0174`. The repair only replaces the four learner-visible MCQ labels at each target; stable lesson/step IDs, widget types, option IDs/order, correct option (`a`), feedback, evaluators, figures, and all other lesson surfaces remain unchanged.
- `CHOICE-0167` was explicitly rebased against direct current source before repair. Its captured live correct label was `2:20 — Dee swapped the hands (and read the 2-mark as ten minutes)`; it is now the concise, equivalent label `2:20 — the hour and minute hands were swapped.`

## Evidence

- Guarded idempotent repair: `scripts/session/s292-measurement-data-choice-repair.mjs`. It validates each target's MCQ type, `a,b,c,d` option identity/order, and `a` correctness before writing. After repair, `--check` reports eight signed roots, zero pending changes, and `current: true`.
- Aggregate regression: `src/lib/session292.measurementDataChoiceParity.test.ts` seals every exact post-repair label, evaluator/option contract, 17 lesson identities, and registered/text-aligned figure placements.
- Current 17-lesson source seal: `fdfced977d58e6647ccbba5af2ba52adc232a7a58a9f95d4e97889a7bf431f1e`.

## Residual authority

The queue is intentionally untouched. This packet supports a source-compatible closure delta of **8 P1 choice rows** after independent review and seal reconciliation. The remaining 51 rows are assessor-controlled: 17 visual, 17 language, and 17 lesson-disposition decisions.
