# S297 — Unlike Fractions Grade 5 choice-surface repair

## Scope and authority

This is a narrow P1 follow-on to the older, disjoint S252 source packet. It
addresses exactly four current `CHOICE_SURFACE_INTEGRITY` rows. The repair is
limited to MCQ option labels: prompts, step IDs, kinds, concept tags,
evaluator/variant contracts, option IDs and order, correct flags, feedback,
figures, and remedials are preserved.

Current 14-lesson source seal: `b59314c932fe1e6951eaa7baa7a57a559d215438fdabcf8af31425103ca6c611`.

## Closed root causes

| Queue row | Lesson / step | Source-verifiable repair |
| --- | --- | --- |
| CHOICE-0094 | `g5u-01-05` / `k2` | Recast denominator-result options as four parallel, noun-first statements. |
| CHOICE-0095 | `g5u-02-01` / `k3` | Matched the same denominator-result choice surface without altering its generator contract. |
| CHOICE-0096 | `g5u-03-02` / `k1` | Replaced the lone long justification with concise, equally formed estimate claims. |
| CHOICE-0097 | `g5u-03-02` / `k3` | Matched benchmark-line conclusions as parallel support/rejection claims. |

The guarded repair validates each exact pre-repair vector before any write. It
also requires the stable option order `[o0,o1,o2,o3]`, a single first correct
option, an MCQ check step, nonempty existing feedback, and a maximum post-repair
option-label spread of 15 characters. `--check` reports any source drift or
pending repair.

## Deliberately retained debt

This packet leaves all non-choice work untouched: four P0 illustration rows
(`VIS-g5u-01-01-c2-fm-add-unlike`, `VIS-g5u-01-05-c2-fa-add-like`,
`VIS-g5u-02-02-c1-fa-add-like`, `VIS-g5u-03-02-c1-fm-add-unlike`) and fourteen
P1 specialised `LESSON_REVISION_IMPLEMENTATION` rows. They need visual or
whole-lesson work and cannot be truthfully closed by label edits.

## Evidence and gates

- `scripts/session/s297-unlike-fractions-g5-choice-repair.mjs`
- `src/lib/session297.unlikeFractionsG5ChoiceRepair.test.ts`
- Focused Vitest: 1 file / 2 assertions passed.
- Repair guard: 4 signed root-cause closures; `--check` reports 0 pending.
- Content schema: passed.
- Pedagogy: 1711/1711 files clean.
- Strict CML: 0 errors, 0 warnings.
- Typecheck: passed.
- Scoped ESLint and whitespace checks: passed.

Queue-compatible effect: +4 P1 source closures. Generic assessor and derived
authority artifacts were not changed.
