# S296 — Multiplication & Division Grade 3 choice-surface repair

## Scope and authority

This bounded P1 packet addresses exactly seven current, source-verifiable
`CHOICE_SURFACE_INTEGRITY` rows in `multiplication-division`. It changes only
MCQ option labels. Prompts, bodies, option IDs and order, correct flags,
feedback, evaluator contracts, figures, and lesson/remedial structure are
preserved.

Current 24-lesson source seal: `d7b2628f07882fc2ce73edcd90a71ff9192b986ff013f8e3c1656a856fe44a8d`.

## Closed root causes

| Queue row | Lesson / step | Source-verifiable repair |
| --- | --- | --- |
| CHOICE-0175 | `mult-02-04` / `k3` | Rephrased the fact-family options into concise, parallel claims. |
| CHOICE-0176 | `mult-04-04` / `k3` | Made every plan a parallel verb-first operation sequence. |
| CHOICE-0177 | `mult-04-05` / `k1` | Matched the size-check options without revealing the correct quotient. |
| CHOICE-0178 | `mult-05-01` / `k2` | Used concise, parallel parity predictions. |
| CHOICE-0179 | `mult-05-02` / `k3` | Balanced each row-relationship explanation as a single claim. |
| CHOICE-0180 | `mult-05-03` / `k1` | Distinguished the parity rule from outcome- and procedure-based distractors. |
| CHOICE-0181 | `mult-05-04` / `k1` | Balanced chart-structure explanations with equally concise labels. |

The repair guard requires IDs `[a,b,c,d]`, exactly one correct option (`a`),
the exact sealed label vectors, nonempty feedback on every option, and a
maximum option-label length spread of 15 characters. It applies only after
all seven current pre-repair vectors are present, and `--check` fails on any
pending source mutation.

## Deliberately retained debt

Five P1 `LESSON_REVISION_IMPLEMENTATION` rows remain outside this label-only
packet because they need specialised visual or interaction work rather than a
truthful choice-surface edit: `mult-01-03`, `mult-03-01`, `mult-03-02`,
`mult-04-04`, and `mult-05-01`.

## Evidence and gates

- `scripts/session/s296-multiplication-division-choice-repair.mjs`
- `src/lib/session296.multiplicationDivisionChoiceRepair.test.ts`
- Focused Vitest: 1 file / 2 assertions passed.
- Repair guard: 7 signed root-cause closures; `--check` reports 0 pending.
- Content schema: passed.
- Pedagogy: 1711/1711 files clean.
- Strict CML: 0 errors, 0 warnings.
- Typecheck: passed.
- Scoped ESLint and whitespace checks: passed.

Queue-compatible effect: +7 P1 source closures. Generic dispositions and all
derived authority artifacts remain untouched.
