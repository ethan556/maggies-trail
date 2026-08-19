# S257 Word Problems Grade 3 Follow-On

## Scope and result

- Course: `content/courses/word-problems-g3`
- Current lessons reviewed and repaired: 12/12 (`g3w-01-01` through `g3w-03-04`)
- Bounded residual source rows entering this follow-on: 18
- Bounded residual source rows closed: 18
  - figured and diversified remedials: 12/12
  - main-figure synchronization rows: 6/6
- Additional overlapping language debt repaired: 11 prompts across 8 lessons
- Source/runtime residual in this bounded follow-on: 0

This follow-on preserves all lesson, step, option, and evaluator IDs and does not change the intended correct answer of any interaction. The estimator exact-versus-useful distinction, copied-feedback corrections, independent positional solver contracts, and strict CML cleanliness established by the whole-course repair remain intact.

## Semantic figure closure

Every remedial now uses a registered, accessible semantic figure and teaches a different same-concept example from its lesson's main route. Exact prompt, number-normalized prompt, and complete widget-payload diversity remain enforced by the aggregate regression.

Six main figures that depicted a different operation or learner job from their attached interaction were synchronized:

- `g3w-01-01/c2`: `two-step-bar` -> `mb-multistep`
- `g3w-01-03/c2`: `mult3-equal-groups` -> `g3w-subtract-once`
- `g3w-01-04/c2`: `bar-join` -> `g3w-share-then-add`
- `g3w-02-03/c1`: `two-step-bar` -> `g3w-subtract-once`
- `g3w-03-03/c1`: `as100-keyword-trap` -> `g3w-relevant-information`
- `g3w-03-04/c2`: `dop-grouping` -> `g3w-multiply-then-add`

Four narrowly scoped registered figures were added because no existing figure truthfully represented these jobs:

- `g3w-subtract-once`: a start/change/result bar that exposes one subtraction step without implying a second operation
- `g3w-share-then-add`: two equal shares followed by the explicit added quantity
- `g3w-relevant-information`: a story-information panel that distinguishes quantities needed by the question from irrelevant context
- `g3w-multiply-then-add`: grouped multiplication with a separately encoded add-on and resulting expression

Each has visible labels and accessible text aligned with the mathematical representation.

## Language closure

Unnatural zero/filler stems were replaced in the eight assessor-identified language-debt lessons: `g3w-01-03`, `g3w-01-04`, `g3w-02-02`, `g3w-02-03`, `g3w-02-04`, `g3w-03-01`, `g3w-03-02`, and `g3w-03-04`. Eleven prompts now use plausible Grade 3 contexts while preserving their existing numeric answers and evaluator behavior. Numeric tokens needed by the independent positional solvers remain explicit.

## Authority state

The pre-follow-on independent packet `S257_WORD_PROBLEMS_G3_TRIPLE_DISPOSITIONS` was sealed before this source work and is now intentionally stale: 0/12 lesson hashes match current source. It must not be appended. Its staleness is positive evidence that the cited visual, remedial, and language defects changed. A different assessor must produce a current-hash superseding triple-disposition packet before generic lesson, visual, or language authority is closed.

Expected source-compatible queue effect for this follow-on is 18 -> 0 bounded residual rows. Shared queue, cards, cache, and ledger were not edited.

## Reproducible evidence

- Guarded idempotent repair: `node scripts/audit/repair-word-problems-g3-follow-on-s257.mjs --check`
  - status: `CURRENT`
  - changed: 0
  - remedial figures: 12
  - diversified remedials: 12
  - main-figure synchronizations: 6
  - language lessons repaired: 8
  - language prompts repaired: 11
  - course seal: `70bfbe6f7fad3fe50e0e1f14c719cdef4d02411c852bfd633e9e667735d8e053`
- Focused regression: 4 files, 26 tests passing
  - `src/lib/session257.wordProblemsG3FollowOn.test.tsx`
  - `src/lib/session257.wordProblemsG3CourseIntegrity.test.tsx`
  - `src/lib/session195.wordProblemsG3.test.ts`
  - `src/components/figures.split.test.ts`
- Content schema: 1,840/1,840 files valid
- Pedagogy lint: 1,711/1,711 files clean
- Strict CML: 0 errors, 0 warnings
- TypeScript typecheck: passing
- Scoped ESLint: passing

Current artifact hashes at sealing:

- `src/components/figures.tsx`: `cd2770005355b392a6088ddde5b6b71d883745362ffd2bb74573740f8e9f648c`
- `src/components/figureIds.ts`: `4c27ab55e95ab404cbd6d8f4c2e8becff836a45059d775e45038df6cefe21ef3`
- repair script: `6a1fab711f2b43296a8eff91e564b35af8153ba8b590e4ccc96cddd1a5cbccdb`
- follow-on regression: `19242ee335a552703705eeffaaad9bff47c9c940ba948d961623f363999bfd1e`
- aggregate course regression: `1914308fb54bd064ce591fefd37445361b9c9b34f26f4bf131ce7c822a146d72`

## Remaining work

- Bounded course-local source/runtime debt: none found.
- Authority-only work: independent current-hash triple-disposition supersession, followed by normal queue/card/cache reconciliation by the owning process.
