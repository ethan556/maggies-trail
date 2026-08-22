# S320 — Independent Assessment A3: Sampling & Probability / Trig Functions / Trig Identities & Equations

Independent course assessor pass over three complete courses per the `MT-V4-WORKER-PREFIX-1`
authority contract (`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`). Every `course.json` and
every lesson (45 total) was read in full; every prompt/model/action/evaluator/feedback/reveal
claim was recomputed by hand. Dispositions are recorded per-lesson in
`reports/closure/cowork-staging/laneB-s320-A3-dispositions.jsonl` (NDJSON, 45 records). This
document is the narrative companion: full verdict table plus precise implementation contracts
for every REVISE and ESCALATE.

Reviewer: Claude Cowork independent assessor (S320). Reviewed: 2026-08-20T18:15:55.000Z.
Review basis hashes generated via `node scripts/session/print-review-basis.mjs <ids>` (all 45
lesson IDs in one call); each hash is reproduced verbatim in the NDJSON `reviewedBasisHash`
field and drift in that hash reopens the lesson per the standard `reopenCondition`.

No content file was written or edited by this review. `git status` confirms zero diffs under
`content/courses/{sampling-and-probability,trig-functions,trig-identities-equations}/` from this
pass. The only file changes are the two staging artifacts this packet authorizes.

## Scope verification performed

- All 3 `course.json` files: grade levels (G7 sampling-and-probability, G11 trig-functions, G12
  trig-identities-equations), chapter IDs, and lessonId lists cross-checked against the actual
  lesson files on disk — clean.
- All 45 lesson files read in full; every numeric answer, exact-value computation, identity
  derivation, and equation solution set recomputed by hand (see per-lesson notes below and in
  the NDJSON rationale field).
- Figure references: every `figure` id used across all 45 lessons resolves in both
  `src/components/figureIds.ts` and `src/components/figures.tsx` (verified by direct grep sweep,
  all 3 courses, zero misses).
- Cross-lesson and within-lesson duplication: scanned programmatically (digit-normalized prompt
  text, remedials excluded as an established non-defect corpus pattern) across all 3 courses,
  then followed up by hand for mathematically-equivalent-but-differently-worded duplicates the
  text scan cannot catch. Found 4 real instances (below); the scanner's remaining "duplicate
  groups" were confirmed false positives (intentional same-lesson contrast pairs at different
  angles/values, e.g. ti-03-01's cos 75° vs cos 15°).
- S309 choice-parity repair (trig-identities-equations, CHOICE-0267…0271): re-verified live by
  running `node scripts/session/s309-trig-identities-equations-choice-repair.mjs --check`
  (read-only in `--check` mode — confirmed by reading the script before executing). Result:
  `"labelEdits": 0, "current": true` — the repair is fully intact in current source, zero drift.
- S318 QUESTION_DIVERSITY_AND_TRANSFER row for sampling-and-probability (sp-03-02/ch1): confirmed
  from `reports/closure/S318_QD_P0_IMPLEMENTATION.md` as the only such row, closed
  NOT_REPRODUCIBLE with no edit (already distinct via matchPairs) — re-confirmed by my own read
  of sp-03-02.
- Widget shuffle-safety audit: read the full implementation of every widget type used across the
  45 lessons in `src/components/widgets.tsx` (McqW, FractionEntryW, TreeDiagramW,
  CompoundEventLabW, CompositeAreaLabW, TrialProbabilityLabW, SpinnerSimW, SampleSimW,
  RatioTableW, ProbabilityAreaW, MatchPairsW, SamplingBiasLabW, DistributionCompareLabW,
  UnitCircleExploreW) plus the `predict` block renderer in `LessonPlayer.tsx`. Confirmed
  `predict.options` are seeded-shuffled at render (`LessonPlayer.tsx:117-118`,
  `seededShuffle(predictStep.predict.options, ...)`) — safe corpus-wide, including the ~40+
  `unitCircleExplore` predict blocks in this batch whose authored JSON order happens to list the
  correct option first (an authoring-readability convention, not a leak, since shuffle intervenes
  before render). Found one genuine unshuffled choice-list defect (below).

## Verdict tally

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| sampling-and-probability (G7) | 15 | 7 | 2 | 6 |
| trig-functions (G11) | 15 | 14 | 1 | 0 |
| trig-identities-equations (G12) | 15 | 14 | 1 | 0 |
| **Total** | **45** | **35** | **4** | **6** |

All 45 lessons: `gradeLanguageDecision = FIT` (no language-register defect found anywhere in the
corpus — every REVISE below is a content-accuracy/duplication defect, not a language defect).
`visualDecision = REQUIRED` for all 39 non-escalated lessons (every lesson's figure and
interactive widget is load-bearing for the concept, not decorative); `visualDecision = ESCALATE`
for the 6 sampling-and-probability lessons sharing the widget-code defect below (the escalation
is specifically about the visual/interactive affordance).

## Full per-lesson verdict list

### sampling-and-probability (G7)

| Lesson | Decision | One-phrase reason |
|---|---|---|
| sp-01-01 | KEEP | — |
| sp-01-02 | KEEP | — |
| sp-01-03 | KEEP | — |
| sp-02-01 | ESCALATE | distributionCompareLab measure-mode choice list never shuffled (option clue), 7/7 graded steps |
| sp-02-02 | ESCALATE | same widget defect, 3/7 graded steps |
| sp-02-03 | ESCALATE | same widget defect, 5/7 graded steps |
| sp-02b-01 | ESCALATE | same widget defect, 1/6 graded steps |
| sp-02b-02 | ESCALATE | same widget defect, 1/6 graded steps |
| sp-02b-03 | ESCALATE | same widget defect, 1/6 graded steps |
| sp-03-01 | KEEP | — |
| sp-03-02 | KEEP | — |
| sp-03-03 | REVISE | 6/7 primary steps reuse sp-03-01/sp-03-02's exact numbers verbatim |
| sp-04-01 | KEEP | — |
| sp-04-02 | REVISE | ch1 hints/explanation describe the wrong (i1's) problem |
| sp-04-03 | KEEP | — |

### trig-functions (G11)

| Lesson | Decision | One-phrase reason |
|---|---|---|
| tf-01-01 | KEEP | — |
| tf-01-02 | KEEP | — |
| tf-01-03 | KEEP | — |
| tf-02-01 | KEEP | — |
| tf-02-02 | KEEP | — |
| tf-02-03 | KEEP | — |
| tf-03-01 | KEEP | — |
| tf-03-02 | REVISE | i1 predict block is tf-03-01/e1's predict block verbatim (angle relabeled only) |
| tf-03-03 | KEEP | — |
| tf-04-01 | KEEP | — |
| tf-04-02 | KEEP | — |
| tf-04-03 | KEEP | — |
| tf-05-01 | KEEP | — |
| tf-05-02 | KEEP | — |
| tf-05-03 | KEEP | — |

### trig-identities-equations (G12)

| Lesson | Decision | One-phrase reason |
|---|---|---|
| ti-01-01 | KEEP | — |
| ti-01-02 | KEEP | — |
| ti-01-03 | KEEP | — |
| ti-02-01 | KEEP | — |
| ti-02-02 | KEEP | — |
| ti-02-03 | KEEP | — |
| ti-03-01 | KEEP | — |
| ti-03-02 | KEEP | — |
| ti-03-03 | KEEP | — |
| ti-04-01 | KEEP | — |
| ti-04-02 | KEEP | — |
| ti-04-03 | KEEP | — |
| ti-05-01 | KEEP | — |
| ti-05-02 | KEEP | — |
| ti-05-03 | REVISE | ch1 reuses ti-05-02/ch1's equation and answer verbatim (capstone challenge) |

## REVISE — implementation contracts

### sp-03-03 — cross-lesson verbatim duplication (6 of 7 primary steps)

Steps i2, k1, i3, k2, k3, ch1 reuse the exact numeric scenarios and prompts already used in
sp-03-01 and/or sp-03-02's own primary (non-remedial) flow, despite this lesson's stated purpose
being to teach classification of theoretical-vs-experimental probability. Confirmed anomalous
(not a corpus pattern) by contrast with sp-01-0x/sp-02-0x, which use fresh numbers throughout.

**Fix**: re-author fresh favourable/total pairs for the 6 affected steps. Keep every step's
kind, widget type, conceptTag, and instructional role unchanged — only the numbers, prompt
wording tied to those numbers, and the numbers embedded in feedback/hints/explanationVariants
need to change. Re-verify the new numbers by hand before closing.

### sp-04-02 — ch1 false feedback (wrong problem referenced)

ch1's `explanationVariants` ("P(heads)=1/2, P(even)=1/2; multiply: 1/4") and `hints` (3-item
array ending "Multiply the two: 1/2 × 1/2 = 1/4") both describe i1's DIFFERENT problem ("heads
and even", answer 1/4) instead of ch1's actual prompt "What is P(heads and a multiple of 3)?"
(correct answer 1/6, matching the widget's own correct-option feedback: "multiples of 3 are 2 of
6, or 1/3 … 1/2 × 1/3 = 1/6"). A learner tapping hint is told the wrong target value.

**Fix**: rewrite `explanationVariants` and all 3 `hints` entries to reference "a multiple of 3"
and the product 1/2 × 1/3 = 1/6, matching the widget's existing correct-option feedback text
(which is already correct and needs no change).

### tf-03-02 — i1 duplicate predict block

The `predict` sub-block (prompt/options/outcomeId/reveal) is byte-identical to
tf-03-01/e1's predict block, differing only in the target rotation angle (120° vs 150°) — both
resolve via identical reasoning to "climbs, then falls back", providing zero new instructional
value and no connection to tf-03-02's actual new topic (reference angles). Contrast case:
tf-04-01's version is legitimately different (target = 90° exactly, differing correct answer
"climbs the whole way").

**Fix**: rewrite the i1 predict block (prompt, at least one option label, and the reveal text) to
pose a question specific to reference angles — e.g. asking the learner to predict which of two
angles in different quadrants shares a reference angle and therefore a coordinate magnitude —
rather than reusing tf-03-01's "does the wave climb past the peak" framing verbatim.

### ti-05-03 — ch1 reuses ti-05-02/ch1's equation and answer verbatim

ti-05-03/ch1 ("Full solve with a trap check") sets up `2 sin x cos x = cos x`, which is
algebraically identical to ti-05-02/ch1's `sin 2x = cos x` (2 sin x cos x IS sin 2x by the
double-angle identity taught in ch4), and reuses the exact same 4 solutions (π/6, π/2, 5π/6,
3π/2) and exact same sum (3π ≈ 9.4248). The reuse is self-acknowledged in ti-05-03/ch1's own
hint text ("This is sin 2x = cos x again — factor, never divide by cos x."). As the course's
final capstone challenge, a learner can answer from memory of the immediately preceding lesson
without demonstrating the "factor, don't divide" skill this step claims to test.

**Fix**: substitute a fresh equation that still exercises the divide-vs-factor trap but yields a
different solution set/sum — e.g. `2 sin x cos x = −cos x` → `cos x(2 sin x + 1) = 0` → `cos x =
0` (π/2, 3π/2) or `sin x = −1/2` (7π/6, 11π/6), four solutions summing to π/2+3π/2+7π/6+11π/6 =
2π+3π = 5π ≈ 15.708. Update `explanationVariants`, `hints` (including the "again" callback line),
`commonErrors`, and `fallbackFeedback` to match the new numbers.

## ESCALATE — shared widget-code defect (6 lessons)

**Lessons**: sp-02-01, sp-02-02, sp-02-03, sp-02b-01, sp-02b-02, sp-02b-03.

**Defect**: `DistributionCompareLabW` in `src/components/widgets.tsx` (component starts at line
10431) has two modes. Its "judge" mode (~line 10441-10449) is shuffle-safe:
`orderedJudgeOptions = useMemo(() => spec.mode === "judge" ? seededShuffle(spec.judgeOptions, seed ?? ...) : [], [seed, spec])`.
Its "measure" mode (~line 10552-10560) is NOT: it renders `spec.measureChoices.map((choice) =>
(<button .../>))` directly in authored order, with no `seededShuffle` call — unlike this same
component's own judge mode, and unlike every sibling lab widget in the corpus (`McqW`,
`MatchPairsW`, `TrialProbabilityLabW`, `CompoundEventLabW`, `CompositeAreaLabW` all shuffle via
the same `useMemo(() => seededShuffle(...), [seed, spec.X])` pattern, per S237/S238/S242/S243/
S316 inline comments).

**Measured impact**: hand-audited all `measure`-mode instances across the 6 affected lessons —
20 of 21 authored instances have the mathematically correct choice sitting at array index 1
(the second button), regardless of whether the choice set has 3 or 4 total options. A learner
strategy of "always click the 2nd button" scores roughly 95% on these steps without engaging
with the content at all. Per-lesson share of primary graded (check/challenge) widget-bearing
steps affected: sp-02-01 7/7 (100%), sp-02-03 5/7 (~71%), sp-02-02 3/7 (~43%), sp-02b-01 1/6
(~17%), sp-02b-02 1/6 (~17%), sp-02b-03 1/6 (~17%).

**Why ESCALATE, not REVISE**: the fix is a widget code change (`src/components/widgets.tsx`),
outside content-only authority — no amount of editing the lesson JSON can add client-side
shuffling. This matches the authority doc's explicit "option clue" STOP condition
("Stop for a stale hash, ownership overlap, unreachable answer, false feedback, representation
mismatch, missing promised visual, option clue, accidental repetition, or new judgment call.").

**Implementation contract for the code owner**: add, immediately alongside the existing
`orderedJudgeOptions` memo,
```
const orderedMeasureChoices = useMemo(
  () => spec.mode === "measure" ? seededShuffle(spec.measureChoices, seed ?? spec.measureChoices.map((c) => String(c.value)).join("|")) : [],
  [seed, spec]
);
```
and render `orderedMeasureChoices` instead of `spec.measureChoices` in the measure-mode button
list. Grading already keys off `choice.value`, never array index (confirmed by reading the
grading path), so this is evaluator-safe by the same argument S316 used for every sibling widget
fix — no content edit is required once the widget is patched. Content in all 6 lessons is
otherwise mathematically correct and needs no other change.

## Investigated, not flagged (documented for transparency)

- **`unitCircleExplore` `ghostChoices` authored order** (ti-02-02, ti-02-03, ti-03-01, ti-03-02,
  ti-03-03, ti-04-02, ti-04-03 — 7 instances, all in "interactive" `i1` steps): the true/"exact"
  formula is listed first in every authored instance in this course, and the button list at
  `widgets.tsx:13955-13976` renders `spec.ghostChoices.map(...)` with no shuffle — structurally
  the same pattern as the DistributionCompareLabW defect above. Investigated in depth and NOT
  escalated, because: (1) `kind: "interactive"` steps are, corpus-wide, ungraded/formative —
  `engine.ts`'s XP formula and dozens of existing test files consistently gate scoring on
  `kind === "check" || kind === "challenge"` only; (2) every choice set is independently
  validated at schema-parse time by a numeric sweep across angles (`schema.ts` lines ~7951-7962,
  `ucGhostPoint`) that asserts every claimed-true formula coincides with the direct point
  everywhere and every impostor detaches somewhere — a materially stronger correctness guarantee
  than most widgets get; (3) the task additionally requires dragging to a specific target angle,
  which a blind first-click cannot shortcut. Net: a real but low-severity structural note, not a
  validity-breaking defect on graded work. Worth the same `seededShuffle` treatment if the widget
  is touched for the escalation above, but not independently blocking any of the 7 lessons.
- **sp-04-03/i3 vs sp-04-02/k1** numeric overlap ("both > 4 = 1/9"): judged below the REVISE bar
  because sp-04-03/i3 uses a materially richer visual representation (compoundEventLab outcome
  grid) that teaches systematic outcome-counting the earlier plain-fractionEntry step did not.
- Scanner false positives (ti-03-01 k1b/k2 "evaluate cos 75°"/"evaluate cos 15°"; ti-03-02
  k1/ch1 "evaluate tan 75°"/"evaluate tan 15°"): intentional same-lesson contrast pairs at
  complementary special angles, not duplication.

## Files touched by this review

- `reports/closure/cowork-staging/laneB-s320-A3-dispositions.jsonl` (created, 45 records)
- `reports/closure/S320_ASSESS_A3.md` (this file, created)

No other file was written or edited. The ledger was not touched.
