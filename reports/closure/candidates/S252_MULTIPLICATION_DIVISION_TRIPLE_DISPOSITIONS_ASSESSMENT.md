# S252 Multiplication & Division triple-disposition assessment

## Independent outcome

This is a current-source assessment of all 24 lessons and all 25 remedial routes in `content/courses/multiplication-division`. It does not append to or edit the authoritative decision ledger, queue, review cards, cache, standards evidence, lesson source, shared runtime, or figure registry.

The shared S244 cards are stale for this recently repaired course: 0 of 24 card hashes match current source. Every candidate record therefore binds directly to the current `reviewBasisHash` returned by `lesson-review-authority-s246.mjs`. The strict validator confirms all 24 bindings.

| Decision family | Distribution |
| --- | --- |
| Whole lesson | 19 `KEEP`, 5 `REVISE`, 0 `ESCALATE` |
| Visual | 3 `REQUIRED`, 2 `PREFERRED`, 19 `SUFFICIENT`, 0 `ESCALATE` |
| Grade language | 24 `FIT`, 0 `REVISE`, 0 `ESCALATE` |

Appending these 24 records through the canonical authority would close exactly 72 generic rows: 24 `LESSON_COMPLETE_DISPOSITION`, 24 `VISUAL_FIRST_REPRESENTATION`, and 24 `GRADE_LANGUAGE_REVIEW`. A `REVISE` decision closes the review row while preserving the implementation debt named below; it does not assert that the lesson needs no further work.

## Lesson decisions

| Lesson | Lesson | Visual | Language | Basis |
| --- | --- | --- | --- | --- |
| `mult-01-01` | KEEP | SUFFICIENT | FIT | Equal-groups model, discrimination, stories, evaluators, and two remedials agree. |
| `mult-01-02` | KEEP | SUFFICIENT | FIT | Array orientation, row selection, story transfer, and remedial agree. |
| `mult-01-03` | REVISE | REQUIRED | FIT | Both concepts use a +100 hundreds figure beside small-step multiplication counts. |
| `mult-01-04` | KEEP | SUFFICIENT | FIT | Exact 3 hops of 4 figure and hop/landing jobs agree. |
| `mult-01-05` | KEEP | SUFFICIENT | FIT | Rotated arrays prove the commutative total without confusing story roles. |
| `mult-02-01` | KEEP | SUFFICIENT | FIT | Fair-sharing roles and evaluator truth agree. |
| `mult-02-02` | KEEP | SUFFICIENT | FIT | Sharing/grouping distinction and corrected error-analysis challenge agree. |
| `mult-02-03` | KEEP | SUFFICIENT | FIT | Missing-factor and equal-hop method agree. |
| `mult-02-04` | KEEP | SUFFICIENT | FIT | Equal-factor exception and repaired choice surface are truthful. |
| `mult-02-05` | KEEP | SUFFICIENT | FIT | ×1, ×0, ÷1, and division-by-self claims are kept distinct. |
| `mult-03-01` | REVISE | REQUIRED | FIT | c1 says the model doubles 6; the live figure visibly and accessibly doubles 5. |
| `mult-03-02` | REVISE | REQUIRED | FIT | Correct ×10 place-value prose is paired with a fives-only static figure. |
| `mult-03-03` | KEEP | SUFFICIENT | FIT | Direct retrieval, three-doubling execution, area transfer, and remedial are distinct. |
| `mult-03-04` | KEEP | SUFFICIENT | FIT | Nines pattern, 10n − n reason, derivation, and application are coherent. |
| `mult-03-05` | KEEP | SUFFICIENT | FIT | Distributive cuts rebuild the whole in every representation and response. |
| `mult-04-01` | KEEP | SUFFICIENT | FIT | Operation choice is based on structure rather than keywords. |
| `mult-04-02` | KEEP | SUFFICIENT | FIT | Groups × size = total consistently locates the unknown. |
| `mult-04-03` | KEEP | SUFFICIENT | FIT | Letters, fact families, substitution, and feedback retain one equation meaning. |
| `mult-04-04` | REVISE | PREFERRED | FIT | Interactions are correct, but c2's static ×/÷ figure omits the taught intermediate total and subtraction. |
| `mult-04-05` | KEEP | SUFFICIENT | FIT | Qualified size checks, friendly estimates, rebuild checks, and feedback agree. |
| `mult-05-01` | REVISE | PREFERRED | FIT | Correct interactions carry doubles/parity, but the static figure highlights a constant-sum anti-diagonal and not the described patterns. |
| `mult-05-02` | KEEP | SUFFICIENT | FIT | The discovered 4×4/4×6 shared-figure contradiction was repaired and regression-locked during assessment. |
| `mult-05-03` | KEEP | SUFFICIENT | FIT | Parity logic, repaired reasons, and corrected claim-analysis challenge agree. |
| `mult-05-04` | KEEP | SUFFICIENT | FIT | Multiple patterns, chart width, first common landing, and repaired reasons agree. |

## Verification of the S252 source closures

### Semantic visuals

Exact-source review accepts three of the five claimed repairs:

- `mult-02-01/c2` → `mult3-fair-shares`: the fixed 12 ÷ 3 = 4 exemplar truthfully carries the same total/sharers/share roles as the adjacent 15 ÷ 5 = 3 explanation.
- `mult-02-03/c2` → `number-line-jumps`: the fixed 3 hops of 4 exemplar truthfully demonstrates equal hops to a total, the method used to solve 35 ÷ 5.
- `mult-04-05/c2` → `mult3-estimate`: the fixed 4 × 19 ≈ 4 × 20 exemplar truthfully demonstrates the nearby-friendly-fact check used for 6 × 9.

Two claims are reopened by evidence stronger than the current aggregate heuristic:

- `mult-03-01/c1`: lesson text explicitly says “The model pairs 6 with another 6,” but `Mult3Double` renders and announces two groups of 5.
- `mult-04-04/c2`: `Mult3WhichOp` only contrasts multiplication and division; it does not represent the intermediate item total followed by subtraction that the adjacent concept teaches.

Three additional existing bindings require disposition:

- `mult-01-03/c1,c2`: `skip-count-line` is a +100 line from 200 to 600, not a representation of the lesson's counts by 2, 5, and 10.
- `mult-03-02/c1`: `mult3-fives` contains only the fives sequence while c1 teaches tenfold place-value change and explicitly rejects digit gluing.
- `mult-05-01/c1,c2`: the static addition-table figure highlights a constant-sum anti-diagonal and supplies no parity representation, while the concept text discusses the main doubles diagonal, direction, and parity. The correct interactive surfaces prevent escalation but do not make this static binding sufficient.

During assessment, exact figure review also found that `Mult3MultTable` highlighted the 4 × 4 cell containing 16 while its visible and accessible text claimed 4 × 6 = 24. The parent repaired the shared figure to 4 × 4 = 16 and added `src/components/session252.mult3TableTruth.test.tsx`; the candidate was rebased after that repair, so no stale escalation remains.

### Progression and duplication

All four source causes verify:

- `mult-02-02/ch1` is correction of an impossible bag-count claim.
- `mult-03-03/k2` executes a three-doubling chain rather than repeating direct recall.
- `mult-03-04/k2` derives a nines fact from a ten-fact, while `ch1` applies an established total to occupancy.
- `mult-05-03/ch1` tests and corrects a parity claim rather than cloning the earlier score computation.

There are zero exact-prompt, number-normalized-prompt, or complete-widget-payload collisions across the 24 current lessons.

### Choice-surface integrity

All seven repaired surfaces verify: `mult-02-04/k3`, `mult-04-04/k3`, `mult-04-05/k1`, `mult-05-01/k2`, `mult-05-02/k3`, `mult-05-03/k1`, and `mult-05-04/k1` retain stable IDs `a`–`d`, exactly one correct option, evaluator agreement, diagnostic feedback, and a maximum option-length spread of 18 characters. The options are parallel equations, plans, verdicts, or reasons rather than one answer explaining itself.

### Mathematical truth and evaluator agreement

All six S252 prose repairs verify in current lesson and remedial source:

1. Equal-factor fact families correctly collapse repeated equations.
2. ×10 is explained through tenfold place value, not digit shifting or gluing.
3. Size rules are qualified for positive amounts and more than one group.
4. Off-diagonal multiplication-table cells are described as reflected partners without the former overclaim.
5. Six is shown with both whole-number factor rectangles, 1 × 6 and 2 × 3.
6. The false “biggest one-digit jump” reason is absent.

The reviewed corpus contains 183 widgets: 46 primary MCQs, 25 remedial MCQs, and 63 numeric widgets. Every MCQ has one authored correct option with unique IDs and labels; every numeric answer is finite, has zero tolerance, and differs from every authored common error. The focused application regression independently exercises the live evaluator at every numeric answer and every MCQ option.

## Residual implementation debt

Five lessons retain bounded semantic-visual debt:

| Lesson | Placements | Required closure |
| --- | --- | --- |
| `mult-01-03` | `c1`, `c2` | Bind a registered accessible small-step skip-count representation. |
| `mult-03-01` | `c1` | Make prose, visible model, SVG title, and accessible label double the same quantity. |
| `mult-03-02` | `c1` | Represent tenfold place-value change rather than only a fives sequence. |
| `mult-04-04` | `c2` | Prefer a two-step diagram showing intermediate total then subtraction. |
| `mult-05-01` | `c1`, `c2` | Prefer synchronized doubles-diagonal/direction and parity representations. |

No progression, choice-surface, language, math-presentation, evaluator, or feedback implementation row remains from this assessment. These five `REVISE` records preserve `LESSON_REVISION_IMPLEMENTATION` debt; the first three are visual `REQUIRED`, and the last two are visual `PREFERRED`.

## Validation and authority boundary

- Candidate: `S252_MULTIPLICATION_DIVISION_TRIPLE_DISPOSITIONS.jsonl`
- Strict read-only validator: `validate-s252-multiplication-division-triple-dispositions.mjs`
- Candidate records: 24 unique lesson records, 24 current direct authority hashes.
- Candidate SHA-256: `81e7266f2bfd93a5b6bd170cc879069f2f12ed2b3fc037375ef19ad6f48fc4b2`.
- Strict validator: PASS, 24/24 direct current-authority hashes, zero errors.
- Canonical appender `--check`: PASS, 24 records; ledger remains unchanged at 431 historical decisions.
- Focused regressions: PASS, 2 files and 7 tests, including the repaired shared multiplication-table truth contract.
- Focused ESLint: PASS with zero errors or warnings.
- Canonical appender: run in `--check` mode only; no ledger append is authorized by this packet.
- Current pre-reconciliation scoped queue: 88 rows — 72 generic, 5 illustration, 4 progression, and 7 choice-surface rows.

The candidate and validator are isolated under `reports/closure/candidates`. Shared cards, queue, cache, ledger, standards, course source, and runtime artifacts remain outside this assessment's write boundary.
