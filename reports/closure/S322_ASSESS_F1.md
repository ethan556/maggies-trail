# S322-F1 — Independent lesson assessment: patterns-factors-g4, multiply-bigger, word-problems-g3

Reviewer: Claude Cowork independent assessor (S322). Read-only on content; wrote only
`reports/closure/cowork-staging/laneB-s322-F1-dispositions.jsonl` (36 NDJSON records, one per
lesson, appended incrementally per course) and this report. Review basis hashes captured via
`node scripts/session/print-review-basis.mjs <ids>` before any judgment was formed; every number
in every widget (numeric answers, MCQ options, area-model/number-line/bar-builder targets and
bounds, common-error values) was recomputed by hand against the stated story. Read
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` first: its authority hierarchy (repo source and
human-decision ledgers are authoritative; the ChatGPT Work cache is evidence-only and cannot
approve its own work) governed this review — no prior cache entry, earlier KEEP label, or stale
basis hash from `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` was treated as binding; each
of the 36 lessons was independently re-derived from current source bytes.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| patterns-factors-g4 | 10 | 6 | 4 | 0 |
| multiply-bigger | 14 | 13 | 0 | 1 |
| word-problems-g3 | 12 | 0 | 12 | 0 |
| **Total** | **36** | **19** | **16** | **1** |

Every lesson received a signed disposition (`decision`, `visualDecision`, `gradeLanguageDecision`)
in `laneB-s322-F1-dispositions.jsonl`; no lesson was left open.

## REVISE list (one-phrase reasons)

**patterns-factors-g4**
- `g4p-02-02` — k2 ("smallest prime number?") is byte-identical to g4p-02-01's k2, no sieve-specific framing.
- `g4p-03-02` — k2 ("add 6" rule MCQ) is byte-identical to g4p-03-01's k3.
- `g4p-03-03` — k2 reuses the same "add 6" MCQ a third time in four consecutive lessons.
- `g4p-03-04` — k2 ("4,8,16,32→?") is byte-identical to g4p-03-02's k3.

**multiply-bigger**
- (none — see ESCALATE below)

**word-problems-g3** (all 12 lessons)
- `g3w-01-01` — generic ±1 numeric feedback, not misconception-named.
- `g3w-01-02` — generic ±1 numeric feedback (3 checks).
- `g3w-01-03` — generic ±1 numeric feedback (3 checks).
- `g3w-01-04` — generic ±1 numeric feedback (3 checks).
- `g3w-02-01` — generic ±1 numeric feedback (2 checks).
- `g3w-02-02` — generic ±1 numeric feedback (2 checks); source half of cross-lesson MCQ duplicate with g3w-03-04.
- `g3w-02-03` — generic ±1 numeric feedback (2 checks).
- `g3w-02-04` — generic ±1 numeric feedback (2 checks).
- `g3w-03-01` — generic ±1 numeric feedback (2 checks).
- `g3w-03-02` — generic ±1 numeric feedback (1 check).
- `g3w-03-03` — generic ±1 numeric feedback (2 checks).
- `g3w-03-04` — generic ±1 numeric feedback (1 check); k2 is byte-identical duplicate of g3w-02-02's k1.

## ESCALATE

- `mb-05-01` — renderer-level mastery-integrity gap (P0 class), not a content edit; see below.

## Findings in detail

### 1. Cross-lesson byte-identical duplicate checks (patterns-factors-g4, word-problems-g3)

Ran an exact-prompt scan across all 36 lessons per course (`widget.prompt` equality) and confirmed
each hit at the full-widget level (prompt + options/answer + feedback, byte-for-byte):

- **patterns-factors-g4, chapter 3** ("Number Patterns from a Rule" → "Extending and Explaining"):
  the MCQ `A pattern follows the rule "add 6", starting at 4: 4, 10, 16, 22. What comes next?`
  (options/feedback identical) appears as `g4p-03-01:k3`, `g4p-03-02:k2`, and `g4p-03-03:k2` — three
  times in four consecutive lessons. The numeric check `A pattern runs 4, 8, 16, 32. What comes
  next?` (answer 64, identical commonErrors) appears as `g4p-03-02:k3` and `g4p-03-04:k2`.
- **patterns-factors-g4, chapter 2**: `What is the smallest prime number?` (answer 2, identical
  commonErrors/feedback) appears as `g4p-02-01:k2` and `g4p-02-02:k2`, with no sieve-specific
  framing in the second occurrence.
- **word-problems-g3**: the MCQ `"There are 5 tables with 4 chairs each. 3 chairs break. How many
  chairs work?" Which equation matches?` (all four options and all four feedback strings
  identical) appears as `g3w-02-02:k1` and `g3w-03-04:k2` — notably the second occurrence sits
  inside "Writing Your Own Two-Step Problem," a lesson whose entire premise is that the learner
  authors a *new* story, making the verbatim reuse a direct violation of that lesson's own stated
  instructional job.

Each later occurrence was dispositioned REVISE; the first (originating) occurrence of each pair/
triple was left KEEP since its own content is correct and it introduces nothing duplicative on its
own. Implementation contract for REVISE: replace the reused check's numbers, wording, and at least
one distractor's misconception with content specific to that lesson's own concept (e.g. `g4p-02-02`
should test a sieve-specific claim, not repeat "smallest prime"; `g3w-03-04:k2` should be an
author-your-own-story item, not a recycled equation-matching MCQ).

### 2. Course-wide generic numeric feedback (word-problems-g3, all 12 lessons)

Every lesson in word-problems-g3 has at least one (most have 2–3) numeric `check`/`challenge`
widgets whose `commonErrors` use one of exactly two boilerplate strings, verified by grep
(`content/courses/word-problems-g3/lessons/*.json`, 25 occurrences of each half of the pair):

> "That is one below the required result; check the stated operation and quantities."
> "That is one above the required result; recompute the declared step carefully."

with an identical `fallbackFeedback` ("Use the quantities in the order stated and complete only the
operation this check asks for.") on every one of them. This pattern is exclusive to
word-problems-g3 — a matching grep across patterns-factors-g4 and multiply-bigger returned zero
hits, confirming this is a course-specific authoring gap, not a shared-generator default. The
quality bar requires "misconception-named feedback with actual numbers"; these strings name no
misconception, reference no story quantity, and the chosen wrong-value probes (correct±1) do not
correspond to any plausible real error path for these problems (a student who adds instead of
subtracts, or forgets a step, lands far from ±1, not adjacent to it). Every lesson's math is
otherwise correct (recomputed by hand; see NDJSON rationale per lesson) and the MCQ-based checks in
each lesson largely do carry specific, well-written feedback — only the numeric-check commonErrors
are affected. Implementation contract: replace each generic ±1 commonError pair with values that
correspond to a real misread of the story (e.g. "forgot to add the returned amount," "used the
wrong operand order," "computed only the first step") and feedback that names it using the
lesson's own numbers, mirroring the pattern already used correctly by this course's MCQ steps.

### 3. mb-05-01 — sequenceBuild choice-mode is not seeded-shuffled (ESCALATE, not REVISE)

`mb-05-01` step `i1` is a `sequenceBuild` widget with `answerMode: "choice"` and three authored
choices, correct choice (`"double"`, "Multiply by 2") listed **first**. Read the render path in
`src/components/widgets.tsx`: `SequenceBuildW` routes `task !== "dial"` to `SequenceReasoningW`,
which renders `(spec.choices ?? []).map(...)` directly — no `seed` is even destructured from its
`WProps`, and no `seededShuffle` call exists anywhere in the function (confirmed by grep on the
function's line range). This is the identical P0 mastery-integrity defect class documented in
`reports/closure/S316_LAB_CHOICE_SHUFFLE_FIX.md` and swept across nine more widgets in
`reports/closure/S316_LAB_CHOICE_SHUFFLE_SWEEP.md` (`CompositeAreaLabW`, `TrialProbabilityLabW`,
`EquationOutcomeLabW`, `PlaceValueTransformLabW`, `PointSetReasoningLabW`, `ExactNumberLabW`,
`AffineRelationshipLabW`, `QuotientReasoningLabW`, `GraphStoryLabW`) plus the one documented,
justified exception (`DiscreteEstimateCompareW`/`estimateSlider`, skipped because its choices are
ordered by measurement scale, not arbitrary claim identity — confirmed independently in this
review, see below). `sequenceBuild`'s choice mode (`SequenceReasoningW`) does not appear anywhere
in that sweep's fixed-or-exempted list, so it is a genuine, previously undetected instance of the
same bug: a learner can pass this interaction by always pressing the first button, with no
reasoning about the multiplicative rule required.

This was dispositioned **ESCALATE**, not REVISE, because the defect lives in the widget renderer
(`src/components/widgets.tsx`), not in `mb-05-01.json` — reordering this one lesson's JSON would
mask the symptom locally but leaves the same renderer gap open for any future `sequenceBuild`
choice-mode authoring elsewhere in the app. The correct fix mirrors the established S316 pattern
exactly: destructure `seed` in `SequenceReasoningW`, add
`const orderedChoices = useMemo(() => seededShuffle(spec.choices, seed ?? spec.choices.map(c => c.id).join("|")), [spec.choices, seed])`,
and render `orderedChoices` in place of `spec.choices` in the `answerMode === "choice"` branch —
then confirm evaluation still keys off `choice.id` (via `truth.answerClaim`/`correctChoice`, not
position), which it already does. All of the lesson's own arithmetic is otherwise correct
(recomputed by hand: 4,9,14,19→24; 5,15,45,135→405; term 5 of 3,6,12,24,…→48), and none of the
other 13 multiply-bigger lessons exhibited this or any other defect.

### 4. Confirmed non-issues (checked, no defect)

- **mcq/predict seeded-shuffle**: confirmed present at render for `McqW` (grep for `seededShuffle`
  usage across `src/components/widgets.tsx` and its tests), so JSON option order (e.g. correct
  answer authored first in several prime/composite MCQs in patterns-factors-g4) is not a runtime
  leak for `mcq`/`predict` widgets.
- **Lab widget choice order (S316/S320 class)**: `compositeAreaLab` (mb-03-02, mb-03-03),
  `quotientReasoningLab` (mb-04-01/02/03), and `proportionalReasoningLab` (mb-01-02, mb-01-03) are
  all covered by the S316/S320 fix-and-test sweep (`labChoiceOrder.s316.test.tsx`,
  `labChoiceOrder.s316b.test.tsx`) and correctly seeded-shuffle at render.
- **estimateSlider choice order**: independently re-verified the ordered-semantics exception
  documented in `S316_LAB_CHOICE_SHUFFLE_SWEEP.md` — all 6 `estimateSlider` instances with a
  `choices` array across these three courses list choices in ascending numeric order (low →
  correct/on-target → high), matching a natural ruler scan, not an authored-correct-first bias; no
  action needed.
- **Accessibility**: shared widget components consistently carry `aria-label`, `aria-live`, and
  `role` attributes at the render layer for every widget type used in these 36 lessons; nothing
  lesson-specific to flag.
- **Grade language**: no grade-inappropriate vocabulary or notation found in any of the 36 lessons;
  all dispositioned `FIT`.
- **Math truth**: every numeric answer, MCQ correctness, area-model/number-line/bar-builder target,
  and commonError value across all 36 lessons was recomputed by hand and found correct. No
  arithmetic, unit, or representation errors were found anywhere in the three courses.

## Raw data

Full per-lesson dispositions: `reports/closure/cowork-staging/laneB-s322-F1-dispositions.jsonl`
(36 NDJSON records, `recordId` = `S322-F1-<lessonId>`, one line per lesson, appended incrementally
per course in write order: patterns-factors-g4, then multiply-bigger, then word-problems-g3).
