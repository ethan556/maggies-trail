# S290 Fractions choice-parity packet

## Scope

- Course: `fractions` (Grade 3; 15 lessons).
- Fresh disjoint P1 follow-on. The course tree was clean. Its only prior source work is the separate P0 visual repair `repair-fractions-figure-truth-s272.mjs`; no choice-surface repair, source report, or assessment packet overlaps these rows.
- Owns exactly nine P1 `CHOICE_SURFACE_INTEGRITY` rows: `CHOICE-0073` through `CHOICE-0081`.
- Leaves lesson/step IDs, question stems, figure bindings, option IDs/order, correct options, feedback, evaluators, runtime, queue, cards, cache, ledgers, standards, and derived artifacts untouched.

## Source closures

| Cause | Lesson step | Repair |
| --- | --- | --- |
| `CHOICE-0073` | `fr-01-01/k3` | Replaced the unique explanation of equal pieces with four parallel claims about equal parts and fraction naming. |
| `CHOICE-0074` | `fr-02-03/k3` | Replaced an answer-explaining equivalent-fraction label with four number-line locations. |
| `CHOICE-0075` | `fr-03-03/k3` | Made the `5/5` alternatives parallel whole/reason claims; the cancelling distractor is now explicitly invalid rather than a second valid computation. |
| `CHOICE-0076` | `fr-04-01/k3` | Expressed every same-denominator alternative in the same `Equal bottoms…` frame. |
| `CHOICE-0077` | `fr-04-02/k2` | Used parallel claims about ten cuts, piece size, and comparing `3/10` with `3/4`. |
| `CHOICE-0078` | `fr-04-04/ch1` | Made every trail-mix alternative state a comparable-pair verdict in the same concise form. |
| `CHOICE-0079` | `fr-04-04/k1` | Made whole-size alternatives parallel and removed a symbolic-only statement that could be mistaken for the correct amount comparison. |
| `CHOICE-0080` | `fr-04-04/k2` | Made every pizza claim a similarly detailed assertion about amounts from different-sized wholes. |
| `CHOICE-0081` | `fr-04-04/k3` | Made each fair-comparison condition a concise, parallel claim. |

All nine MCQs retain IDs `a`–`d`, one correct option (`a`), their original feedback, and their existing evaluator. The exact label-spread ceiling is 12 characters; no label uses a correctness cue or explanatory `because` clause.

## Verification

- Guarded idempotent repair: `scripts/session/s290-fractions-choice-parity-repair.mjs`.
- Aggregate regression: `src/lib/session290.fractionsChoiceParity.test.ts` asserts all nine exact label arrays, option/evaluator invariants, parity/cue constraints, all 15 lesson identities, and registered/text-aligned figures including remedials.
- Current 15-lesson source seal: `7bd6868135a7ff7de67db205b4ce4cab81b9c8a884246c14081d34336745e413`.
- Passed: repair `--check`; focused regression (2/2); content schema (1711/1711); pedagogy (1711/1711); strict CML (0 errors, 0 warnings); scoped ESLint; whitespace diff check; and repository-wide TypeScript.

## Residual authority

The queue is intentionally untouched. This packet supports a source-compatible closure delta of **9 P1 rows** after independent review and source-seal reconciliation. The 45 remaining rows are assessor-controlled: 15 visual required/preferred/sufficient decisions, 15 Grade 3 language reviews, and 15 KEEP/REVISE/ESCALATE lesson dispositions.
