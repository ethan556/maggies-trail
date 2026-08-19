# S298 — Decimal Operations Grade 5 P1 repair

## Scope and authority

This bounded packet follows the older S266 fixed-figure fail-closure packet. It
addresses exactly three P1 choice-surface roots and five P1 progression roots;
`PROGRESSION-dop-03-01` covers two precise learner-job placements (`k2` and
`k3`). No figures, shared code, queue, cards, cache, or authority artifact was
changed.

Current 15-lesson source seal: `79e330bfc472ccddb0e84c2536baf1b52dbe990b883737a8d051a0eaa5fdbcf6`.

## Closed root causes

| Queue root | Lesson / step placement | Source-verifiable repair |
| --- | --- | --- |
| CHOICE-0047 | `dop-02-02` / `i2` | Rewrote carry explanations as three parallel place-value claims. |
| CHOICE-0048 | `dop-02-03` / `i2` | Rewrote placeholder-zero explanations as balanced tens-place claims. |
| CHOICE-0049 | `dop-03-01` / `i2` | Matched estimate-purpose choices as concise prediction claims. |
| PROGRESSION-dop-03-01 | `dop-03-01` / `k2`, `k3` | Split repeated estimate work into compatible-number construction and implausible-answer rejection. |
| PROGRESSION-dop-04-02 | `dop-04-02` / `k2` | Changed direct subtraction practice into a zero-borrow-chain trace. |
| PROGRESSION-dop-05-01 | `dop-05-01` / `k3` | Changed another product computation into equivalent-decimal interpretation. |
| PROGRESSION-dop-05-02 | `dop-05-02` / `ch1` | Made the challenge use an estimate to judge decimal placement. |
| PROGRESSION-dop-05-03 | `dop-05-03` / `k1` | Changed routine division calculation into decimal-alignment tracing. |

All repairs retain existing stable step IDs, kinds, concept tags, widgets,
answers/values/tolerances, variants, option IDs/order, correct flags, feedback,
hints, and explanation variants. The source diff is limited to the three MCQ
label vectors and the six learner-job bodies/prompts.

## Guardrails and regression

`scripts/session/s298-decimal-operations-p1-repair.mjs` validates exact
pre-/post-repair copy, MCQ IDs/order/correctness/feedback presence, option-length
parity, and current numeric or place-value-transform evaluator types. It only
writes after all source contracts match and fails `--check` if any approved
repair is pending.

`src/lib/session298.decimalOperationsP1Repair.test.ts` ratchets:

- all three repaired label vectors and their non-label evaluator/feedback
  fingerprints;
- all six distinct progression jobs and their presentation-stripped evaluator
  fingerprints;
- all nine existing S266 fixed-figure withholdings, so this P1 packet cannot
  accidentally restore a contradictory example.

## Deliberately retained debt

The previous S266 exact visual withholding decisions remain in force. All
non-scoped review, assessor-disposition, and derived-authority rows are
intentionally untouched; none can be self-closed by this course-local repair.

## Gates

- Repair guard: 8 signed root-cause closures across 9 repaired placements;
  `--check` reports 0 pending.
- Focused Vitest: 1 file / 3 assertions passed.
- Content schema: passed.
- Pedagogy: 1711/1711 files clean.
- Strict CML: 0 errors, 0 warnings.
- Typecheck: passed.
- Scoped ESLint and whitespace/diff checks: passed.

Queue-compatible effect: +8 P1 source closures, with no derived queue or
assessor authority writes.
