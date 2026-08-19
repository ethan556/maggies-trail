# S278 Add/Subtract Within 100 Disjoint P1 Progression Repair

## Scope and collision boundary

This packet takes the next-largest clean K–G3 source-verifiable P1 set: 11 progression/duplication rows in `add-subtract-100`. The dirty lesson `as100-03-04.json` is excluded completely. Its `PROGRESSION-as100-03-04` and `CHOICE-0002` rows remain unclaimed.

Both other active source lanes confirmed no ownership of this course. Every touched lesson was clean immediately before repair. Generic lesson, visual, and language dispositions remain assessor-controlled. Shared runtime, schema, figure registry, generated artifacts, queue, cards, cache, ledgers, and standards evidence remain untouched.

## Root-cause repair

The queue rows arose because repeated numerical exercises became identical after numbers were normalized. This packet changes only the 25 later-colliding prompts while preserving widget types, evaluator payloads, answers, option IDs, correctness, feedback, and stable step IDs.

The new learner jobs intentionally vary the cognitive demand:

- use doubles and near doubles in words, dominoes, and misconception critique;
- decompose and recombine through ten;
- translate bundles of ten into total ones;
- hold tens fixed while changing ones;
- split two-digit operations by place;
- regroup malformed 14- and 16-one representations;
- verify subtraction through related addition;
- distinguish whole-number parity using pair structure and the ones digit.

## Exact source closures

| Course section | Closed rows | Changed prompt jobs |
| --- | ---: | ---: |
| Doubles and strategy choice | `PROGRESSION-as100-01-01`, `PROGRESSION-as100-01-02`, `PROGRESSION-as100-01-03` | 5 |
| Adding tens, ones, and two-digit numbers | `PROGRESSION-as100-02-01`, `PROGRESSION-as100-02-02`, `PROGRESSION-as100-02-03`, `PROGRESSION-as100-02-04` | 10 |
| Subtracting tens, ones, and two-digit numbers | `PROGRESSION-as100-03-01`, `PROGRESSION-as100-03-02`, `PROGRESSION-as100-03-03` | 8 |
| Odd and even | `PROGRESSION-as100-05-01` | 2 |

Result: **11/11 owned P1 progression rows source-closed through 25 distinct learner jobs.** Re-running the queue’s number-normalization rule finds zero main-prompt template collisions in every owned lesson. The two dirty `as100-03-04` rows remain explicit residual authority.

## Executable evidence

- `scripts/audit/repair-add-subtract-100-progression-s278.mjs` audits all 16 lessons, owns only 11 clean files, refuses to patch `as100-03-04`, preserves stable IDs and evaluator data beyond prompt wording, ratchets prompt uniqueness, and byte-preserves already-correct sources.
- `src/lib/session278.addSubtract100Progression.test.ts` verifies all 16 lessons for schema, pedagogy, and widget integrity; exact detector closure; all 25 distinct jobs; every changed evaluator target; exact row uniqueness; and whole-course MCQ evaluator/feedback agreement.
- Focused regression: 6/6 tests pass.
- Repair guard: `--check` reports `CURRENT`.
- Content schema validation passes.
- Pedagogy lint passes for 1,711/1,711 lessons.
- Strict CML lint passes with 0 errors and 0 warnings.
- Typecheck and scoped ESLint pass.
- Scoped `git diff --check` passes; the 11 owned lesson diffs contain exactly 25 one-line prompt substitutions.
- Owned packet seal: `c3236e8cf8624ce3761b85e35a43b2ff91f51f3601dd1fd89b2cfc1e34216923`.

## Residual authority

`PROGRESSION-as100-03-04` and `CHOICE-0002` remain excluded because their shared lesson source was dirty before selection. Generic P1 disposition streams and independent qualitative assessment remain open until reviewed against the deployed candidate.
