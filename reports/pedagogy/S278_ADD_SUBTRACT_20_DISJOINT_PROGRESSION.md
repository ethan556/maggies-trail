# S278 Add/Subtract Within 20 Disjoint P1 Progression Repair

## Scope and collision boundary

With clean K–G3 P0 implementation exhausted, this packet selects the largest clean source-verifiable P1 set: 13 progression/duplication rows in `add-subtract-20`. The course has 14 P1 progression rows, but `as-04-01.json` already contained uncommitted figure-truth work. This packet excludes that lesson completely and does not claim `PROGRESSION-as-04-01`.

Both other active source lanes confirmed no ownership of this course. Every one of the 13 touched lesson files was clean immediately before repair. Generic lesson, visual, and language dispositions remain assessor-controlled. Shared runtime, schema, figure registry, generated artifacts, queue, cards, cache, ledgers, and standards evidence remain untouched.

## Root-cause repair

The queue rows were created because multiple main-step prompts became identical after replacing their numbers with placeholders. The packet replaces only the 22 later colliding prompts, preserving widget types, evaluator payloads, correct answers, option IDs, feedback, stable step IDs, and remediation surfaces.

The redesigned sequence assigns different learner work rather than swapping numbers:

- predict then verify on a number line;
- transfer to counters, birds, cubes, shelves, and arrival stories;
- find missing ten-frame spaces and missing partners;
- decompose and recombine through ten;
- model removal versus use related addition;
- critique incorrect addition, incomplete counting, and wrong unknown claims;
- compare via a number-line gap;
- solve equal-side and part-unknown equations.

## Exact source closures

| Course section | Closed rows | Changed prompt jobs |
| --- | ---: | ---: |
| Counting on and bigger-first | `PROGRESSION-as-01-01`, `PROGRESSION-as-01-02`, `PROGRESSION-as-01-03` | 3 |
| Partners and making ten | `PROGRESSION-as-02-01`, `PROGRESSION-as-02-03`, `PROGRESSION-as-02-04` | 4 |
| Subtraction meanings and facts | `PROGRESSION-as-03-01`, `PROGRESSION-as-03-02`, `PROGRESSION-as-03-03`, `PROGRESSION-as-03-04` | 12 |
| Equality and unknowns | `PROGRESSION-as-04-02`, `PROGRESSION-as-04-03` | 2 |
| Compare stories | `PROGRESSION-as-05-03` | 1 |

Result: **13/13 owned P1 progression rows source-closed through 22 distinct learner jobs.** Re-running the queue’s exact number-normalization rule finds zero prompt-template collisions in every owned lesson. The excluded `PROGRESSION-as-04-01` row remains explicit residual authority.

## Executable evidence

- `scripts/audit/repair-add-subtract-20-progression-s278.mjs` audits all 17 lessons, owns only 13 clean files, refuses to patch `as-04-01`, preserves stable IDs and all evaluator data beyond prompt wording, ratchets normalized prompt uniqueness, and byte-preserves already-correct sources.
- `src/lib/session278.addSubtract20Progression.test.ts` verifies all 17 lessons for schema, pedagogy, and widget integrity; exact detector closure; all 22 distinct jobs; all changed evaluator targets; exact row uniqueness; and whole-course MCQ evaluator/feedback agreement.
- Focused regression: 6/6 tests pass.
- Repair guard: `--check` reports `CURRENT`.
- Content schema validation passes.
- Pedagogy lint: 1,711/1,711 files clean.
- Strict CML lint: 0 errors and 0 warnings.
- TypeScript typecheck and scoped ESLint pass.
- Scoped `git diff --check` passes.
- Owned packet seal: `a462f3b11e845d01c6c45536db5f118c179ae7ba71523da7fe141365e61e92f5`.

## Residual authority

`PROGRESSION-as-04-01` remains excluded because its source was dirty before selection. The three generic P1 disposition streams and any independent qualitative review remain open until assessed against the eventual deployed candidate.
