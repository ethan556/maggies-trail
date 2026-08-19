# S289 Volume & Measurement progression and choice packet

## Scope

- Course: `volume-measurement` (Grade 5; 12 lessons).
- Fresh source-local packet. The course tree was clean and no prior course repair or assessment packet was found. Historical references are limited to shared line-plot display work and the unrelated withheld `vm-05-02/c2` visual.
- Owns exactly four P1 root causes: `CHOICE-0281`, `PROGRESSION-vm-03-02`, `PROGRESSION-vm-04-02`, and `PROGRESSION-vm-05-01`.
- The grouped `PROGRESSION-vm-04-02` cause has two target steps, so four root causes produce five evaluator-safe step repairs.
- Leaves figures, stable IDs, widget types, answers, MCQ option IDs/order/correctness, runtime, queue, cards, cache, ledgers, standards, and derived artifacts untouched.

## Source closures

| Cause | Lesson step(s) | Repair and retained evaluator contract |
| --- | --- | --- |
| `PROGRESSION-vm-03-02` | `vm-03-02/ch1` | Replaced a repeated direct volume prompt with a missing-layer diagnosis. The MCQ remains option IDs `a`–`c`, with only `a` correct (`18 cubic units`). |
| `PROGRESSION-vm-04-02` | `vm-04-02/i2`, `vm-04-02/k3` | Gave `i2` a base-to-second-layer accumulation job (`28`) and `k3` a stopped-product diagnosis (`30`); both remain numeric evaluators with their original answers. |
| `PROGRESSION-vm-05-01` | `vm-05-01/k3` | Replaced a repeated composite-volume calculation with an add-versus-multiply diagnosis. The numeric answer remains `32`; the added `192` feedback addresses the newly explicit multiplication misconception. |
| `CHOICE-0281` | `vm-05-02/i2` | Replaced the 79-versus-42-character surface with three `He…` misconception claims of 77–78 characters. Option IDs/order and correct option `a` remain unchanged; feedback now matches each distractor. |

Every retained concept figure in all 12 lessons is registered and passes the current text-alignment guard. The historical `vm-05-02/c2` fail-closed visual remains withheld; it was neither reopened nor counted as a closure.

## Verification

- Guarded idempotent repair: `scripts/session/s289-volume-measurement-progression-choice-repair.mjs`.
  - `--check` reports four signed root-cause closures, five target-step repairs, and zero pending changes.
- Aggregate regression: `src/lib/session289.volumeMeasurementProgressionChoice.test.ts` asserts all exact current prompts, explanations, numeric answers, common-error values, MCQ IDs/correctness/feedback, one-character MCQ label spread, all 12 lesson identities, and every retained registered/text-aligned figure.
- Current 12-lesson source seal: `a6888a86d2fd1267d4108cb0ce418525b5aa5415311bd1beeb3804e11bfa88ff`.
- Passed: focused regression (2/2); content schema (1711/1711); pedagogy (1711/1711); strict CML (0 errors, 0 warnings); scoped ESLint; whitespace diff check; and repository-wide TypeScript.

## Residual authority

The current queue is intentionally untouched. This packet supports a source-compatible closure delta of **4 P1 rows** after independent review and source-seal reconciliation. The remaining 36 rows are assessor-controlled: 12 visual required/preferred/sufficient decisions, 12 grade-band language reviews, and 12 KEEP/REVISE/ESCALATE lesson dispositions. No additional learner-visible math or feedback falsehood was found in the full 12-lesson audit.
