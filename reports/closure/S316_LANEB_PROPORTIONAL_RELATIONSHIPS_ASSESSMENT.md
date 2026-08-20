# S316 Lane B — Proportional Relationships — Independent Assessment

Reviewer: Claude Cowork independent assessor (proportional-relationships S316)
Scope: content/courses/proportional-relationships/course.json + all 16 lessons in
content/courses/proportional-relationships/lessons/. Read-only; dispositions staged to
reports/closure/cowork-staging/laneB-proportional-relationships-dispositions.jsonl.

## Course summary

16 lessons across 6 chapters (unit rates with fractions; is it proportional; graphs of
proportional relationships; the equation of a proportion; percent problems; interest,
commission & error). All 16 lessons were read in full, all figure IDs referenced by `figure`
fields were confirmed present in `src/components/figureIds.ts`, and the corresponding widget
render code in `src/components/widgets.tsx` was inspected for two of the found defect classes
(see P0 findings below).

**Decisions: 9 REVISE, 7 KEEP, 0 ESCALATE.**

Three concrete, evidence-backed defect classes were found, two of which map directly to the
named workstreams (CHOICE_SURFACE_INTEGRITY, LESSON_PROGRESSION_AND_DUPLICATION) and one of which
is a math/feedback-truth defect (distractor feedback that does not describe the arithmetic that
actually produces the flagged wrong value). I could not independently confirm a fourth distinct
P0-caliber issue from static content alone; if the queue expects 4 P0 rows for this course and
only evidence for these 3 classes surfaced here, that gap should be reconciled by the queue owner
rather than papered over.

## P0 finding 1 — CHOICE_SURFACE_INTEGRITY: two widget types never shuffle their choices

Every `mcq` widget (13/13) and every `predict` block (9/9) in this course authors its correct
option first. This is **not** itself a defect: `McqW` in `src/components/widgets.tsx` and the
`predict` renderer in `LessonPlayer.tsx` both call `seededShuffle(...options, seed)` before
rendering, seeded on `${lessonId}:${stepId}`, with grading always keyed by `option.id` — the
in-repo comments explain this is a deliberate compensation for exactly this authoring convention
("Authoring convention overwhelmingly writes the correct option first ... Displaying spec.options
in authored order would let a learner score well by pattern-matching position").

However, two other widget types share the same "correct choice authored first" convention **and
do not shuffle**:

- `proportionalReasoningLab` (answerMode:"choice") — `ProportionalReasoningLabW` (widgets.tsx
  ~line 8308) destructures `{ spec, value, onChange, disabled, tone, onEvent }` — no `seed` — and
  renders `spec.choices.map(...)` directly.
- `percentChangeLab` — `PercentChangeLabW` (widgets.tsx ~line 6827) destructures
  `{ spec, value, onChange, disabled, tone, onEvent }` — no `seed` — and renders `spec.choices.map(...)`
  directly.

In this course, **every** authored instance of both widget types puts the correct choice first:
12/12 `proportionalReasoningLab` choice-mode instances (pr-02-01, pr-02-02 k2, pr-02-03) and 7/7
`percentChangeLab` instances (pr-04-02). That means a learner can score 100% on every one of these
19 interactions in the four affected lessons by always pressing the first button, with zero
mathematical reasoning. This is a rendering-layer defect, not a content-authoring one — the
correct fix is adding the same `seededShuffle` call these two components are missing (matching
`McqW`), which lives in a shared, out-of-scope file (`src/components/widgets.tsx`) rather than in
any single lesson's JSON. Affected lessons are marked REVISE with this cited as the reason; no
lesson-content change alone can fix it.

(`PointSetReasoningLabW` has the same missing-shuffle gap, but no lesson in this course uses its
`answerMode:"choice"` branch — all `pointSetReasoningLab` steps here are `answerMode:"numeric"` —
so it is not exploitable in this course today.)

## P0 finding 2 — LESSON_PROGRESSION_AND_DUPLICATION: the same tables recycled verbatim

Chapter 2 ("Is It Proportional?", pr-02-01/02/03) reuses a small set of tables — (2,6)/(3,9)/(5,15),
(2,6)/(3,10)/(5,15), (1,4)/(2,8)/(10,40), (3,2)/(6,4)/(9,6), (3,9)/(5,15)→x=7 — as **byte-identical
prompts** across concept examples, interactive steps, graded checks, challenges, and remedials,
both within a single lesson and across all three lessons of the chapter. Concretely:

- pr-02-01: `i1` and `ch1` ("a trickier check") share the exact same table and prompt — the
  challenge is not actually harder, it is the intro example replayed.
- pr-02-01 `i1`/`i2` are byte-identical to pr-02-03 `i1`/`i2`.
- pr-02-02 `i2` (mcq) and `k2` (graded check) share the identical prompt/table — the check
  re-asks what the interactive step already fully solved moments earlier.
- pr-02-02 `ch1` is byte-identical to pr-02-03's plain interactive step `i3`; pr-02-02 `k3` is
  byte-identical to pr-02-03 `k3`.

pr-03-01 has the same pattern within a single lesson: `i2`/`k3` are byte-identical ("for k=3, plot
(1,3) and (2,6)"), and `i3`/`ch1` are byte-identical ("for k=4, plot (1,4) and (2,8)") — in both
cases a graded check or the lesson's designated challenge is a verbatim copy of an earlier worked
interactive example rather than a fresh problem.

Own-lesson remedial-mirrors-primary-step duplication (e.g. `i1` and its own remedial sharing a
prompt) is a **course-wide, consistent pattern** (seen in pr-01-01, pr-03-02, pr-03-03, pr-04-01,
pr-04-02, etc.) and was treated as intentional scaffolding, not flagged as a defect on its own.
Only cross-lesson duplication and same-lesson duplication between two *non-remedial* graded/
interactive steps were counted as the P0 defect above.

## Finding 3 — false/mismatched distractor feedback (math-truth defect)

A concrete, narrow but real defect: several `commonErrors` entries describe an arithmetic
operation that does **not** actually produce the flagged wrong value, violating "feedback must be
literally true of the drawn problem."

- pr-01-01 `k2`: value 32 is labeled "(1/4)÷(1/8)=(1/4)×8=2, not (1/8)÷(1/4)" — but (1/8)÷(1/4)=0.5,
  not 32. The value 32 actually comes from inverting *both* fractions and multiplying denominators
  (4×8=32), an entirely different, undescribed misconception.
- pr-01-02 `k1`/`i3`/`k3`/`ch1`: four separate values (49, 10, 10, 9) are all labeled "multiplies
  the fractions directly," which for e.g. 7/8×7/16 would give 0.383, not the whole number 49
  actually flagged. The real source is multiplying only the numerators (7×7=49) and dropping both
  denominators.
- pr-01-03 `k2`: same "multiplies the fractions directly" mislabeling for value 10 (true source:
  2×5, not 2/5×1/5).
- pr-04b-02 `ch1`: value 1920 is labeled "takes 8% OF 240" — 8% of 240 is 19.2, not 1920. The
  value 1920 actually comes from 240×8 (treating "8%" as a bare ×8 multiplier).

By contrast, the `fractionEntry` widgets in the same lessons (pr-01-03 `k1`, `k3`, `ch1`) have
verified-accurate `commonEntries`, and the vast majority of `numericErrors`/`commonErrors` across
the rest of the course (chapters 3, 3b, 4, 4b) were spot-checked against their stated arithmetic
and matched exactly (see per-lesson rationale in the disposition file for the specific values
checked). This defect is real but narrowly scoped to specific steps, not the whole course.

## Per-lesson verdicts

| Lesson | Decision | Key reason |
|---|---|---|
| pr-01-01 | REVISE | k2 commonError (32) is factually false; k1's is vague/undiagnostic |
| pr-01-02 | REVISE | 4 commonErrors mislabel "multiplies directly" for values that are really numerator-only products |
| pr-01-03 | REVISE | k2 same mislabeling; remedial commonErrors are garbled and undiagnostic |
| pr-02-01 | REVISE | P0 choice-surface (8/8 unshuffled proportionalReasoningLab) + P0 duplication (i1≈ch1, cross-lesson with pr-02-03) |
| pr-02-02 | REVISE | P0 choice-surface (k2) + P0 duplication (i2≈k2; ch1/k3 duplicated in pr-02-03) |
| pr-02-03 | REVISE | P0 choice-surface (i1, i2) + P0 duplication (i1≈pr-02-01 i1, i2≈pr-02-01 i2, i3≈pr-02-02 ch1, k3≈pr-02-02 k3) |
| pr-03-01 | REVISE | Within-lesson duplication: i2≈k3, and i3≈ch1 (the "challenge" is a verbatim copy of the interactive example) |
| pr-03-02 | KEEP | numeric-only choice surfaces (no gameable ordering); all numericErrors verified accurate |
| pr-03-03 | KEEP | numeric-only choice surfaces; all numericErrors verified accurate |
| pr-03b-01 | KEEP | mcq (shuffled) + numeric-mode proportionalReasoningLab (not exploitable); all commonErrors verified accurate |
| pr-04-01 | KEEP | percentBar + numeric only; all commonErrors verified accurate |
| pr-04-02 | REVISE | P0 choice-surface: 7/7 percentChangeLab steps unshuffled, correct answer always first |
| pr-04-03 | KEEP | percentBar + numeric only; all commonErrors verified accurate |
| pr-04b-01 | KEEP | percentBar + numeric only; I=P·r·t and all commonErrors verified accurate |
| pr-04b-02 | REVISE | ch1 commonError (1920) is factually false — "8% of 240" ≠ 1920 |
| pr-04b-03 | KEEP | percentBar + numeric/mcq (shuffled); all values verified accurate |

## Implementation contracts for each REVISE

**pr-02-01, pr-02-02, pr-02-03, pr-04-02 — choice-surface fix (shared root cause):**
Add a `seed`-based `seededShuffle(spec.choices, seed ?? spec.choices.map(c=>c.id).join("|"))`
call to `ProportionalReasoningLabW` and `PercentChangeLabW` in `src/components/widgets.tsx`,
mirroring the pattern already used in `McqW` (line ~446) and `ScaledCircleLabW`/`TriangleClosureLabW`/
etc. (lines ~1764, 1863, 1942, 6982, 8561, 18815). This is a single shared-component change, not a
per-lesson content edit — once shipped, no lesson JSON in this course needs to change for this
defect. This is out of a content worker's owned files; route to engineering.

**pr-02-01, pr-02-02, pr-02-03, pr-03-01 — duplication fix (content-owned):**
Regenerate the duplicated tables/points with fresh numbers per the CLAUDE.md "fix with a new
DIMENSION, not a wider axis" rule — vary the specific (x,y) pairs used in pr-02-01's `ch1` vs `i1`,
pr-02-02's `i2` vs `k2`, pr-03-01's `i2`/`k3` and `i3`/`ch1`, and de-duplicate the cross-lesson
reuse between pr-02-01/pr-02-02/pr-02-03 so each lesson's practice items are numerically distinct
from the other two lessons in the chapter, not just distinct from themselves.

**pr-01-01 `k2`, pr-01-02 `k1`/`i3`/`k3`/`ch1`, pr-01-03 `k2`, pr-04b-02 `ch1` — false-feedback fix
(content-owned):** For each listed step, either (a) change the flagged `commonErrors` value to the
one the stated operation actually produces, or (b) rewrite the feedback text to describe the
operation that actually produces the currently-flagged value. Recommended: keep the values (they
are plausible real errors) and rewrite the feedback to match — e.g. pr-01-01 `k2`'s 32 should read
something like "That flips *both* fractions instead of just the second: 4×8=32. Only the divisor
gets flipped: (1/4)×8=2." pr-01-04b-02's 1920 should read "That treats 8% as a plain ×8: 240×8=1920.
A percent divides by 100 first: 8% of 240 = 0.08×240=19.2, so 240÷0.08=3000 is how you go from the
$240 commission back to the sale."

## What could not be fully verified from static content

Per-widget accessibility (focus order, contrast, SVG titles, live-region behavior) was not
independently re-verified beyond confirming all referenced figure IDs exist in the registry and
are exercised by the shared, tested widget components — a full runtime accessibility audit would
require rendering, which is out of scope for a read-only content assessor. Standards-mapping
(7.RP.A.2c, 7.RP.A.3) was noted where declared but not independently re-derived against official
standards text, consistent with "standards evidence remains candidate-only" in the packet's
authority contract.
