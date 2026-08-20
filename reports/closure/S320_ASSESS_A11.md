# S320 / Packet A11 — Independent Course-Quality Assessment

Scope: `content/courses/compare-numbers-k`, `content/courses/measure-compare-k`,
`content/courses/teen-numbers-k` — all three `course.json` files plus all 36 lessons
(12 per course), read in full. Assessed against
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` as the binding quality contract.
Read-only against `content/`; no npm/vitest/tsc run. Dispositions recorded at
`reports/closure/cowork-staging/laneB-s320-A11-dispositions.jsonl`
(36 NDJSON records, `recordId` prefix `S320-A11-`).

Reviewer: Claude Cowork independent assessor (S320). Reviewed at 2026-08-20T18:16:31.000Z.

## Result summary

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| compare-numbers-k | 12 | 3 | 9 | 0 |
| measure-compare-k | 12 | 5 | 7 | 0 |
| teen-numbers-k | 12 | 3 | 9 | 0 |
| **Total** | **36** | **11** | **25** | **0** |

All 36 lessons: `visualDecision = SUFFICIENT`, `gradeLanguageDecision = FIT` (see
"Axes not driving REVISE" below).

## Method

- Read `course.json` and all 12 lesson files per course in full (36 lessons total).
- Cross-checked prior repair evidence: `S253_*_WHOLE_COURSE_REPAIR.md` (all three
  courses — course-integrity pass covering illustrations, progression/duplication,
  choice-surface) and `S305/S306/S307_*_CHOICE_ORDER.md` (option-array reordering).
  Per the authority doc, prior KEEP labels/repairs are evidence, not self-approval;
  every lesson below was independently re-verified against current source bytes.
- Traced `src/lib/evaluate.ts` (tenFrame, dragOrder cases) and `TenFrameW` in
  `src/components/widgets.tsx` to determine, for every numeric-feedback finding,
  whether the buggy text is actually reachable by a learner or is dead code, rather
  than assuming severity from the JSON alone.
- Confirmed mcq/predict option order is display-only (`seededShuffle`, keyed
  `lessonId:stepId`, grading by option `id` in `evaluate.ts`) — so raw JSON option
  order (already normalized by S305/306/307) has no bearing on learner experience;
  this was not re-litigated.
- Ran three programmatic scans across all 36 lessons (ad hoc scripts, not part of
  the repo):
  1. Duplication scanner comparing prompt+values+feedback signatures (options,
     dragOrder `items`+`correctOrder`, lengthCompare/tapDiagram `items`/`hotspots`,
     tenFrame target/preFilled, numberLineHop parameters) across every lesson pair,
     within and across all three courses.
  2. Recompute pass: dragOrder ascending/descending order vs. prompt wording and
     successFeedback numbers; lengthCompare longest/shortest vs. actual `length`
     values; tapDiagram greatest/fewest vs. actual `count` values; numberLineHop
     landing position vs. `min`/`max`/`start`/`hop`/`hops`/`direction`; tenFrame
     `commonCounts`/`missFeedback`/`successFeedback` numeric mentions vs. `target`.
  3. Option-label-length parity scan across every MCQ's correct vs. distractor
     option lengths (flagged at >=1.8x vs. every distractor, i.e. the correct
     option is unambiguously the outlier).
  4. Figure-ID registry cross-check (all 25 distinct `figure` values referenced in
     the 36 lessons against `FIGURE_IDS` in `src/components/figureIds.ts`) and a
     25-word cap check on every `concept` step's `body`.

## Findings that drove REVISE, by category

### 1. Cross-lesson verbatim duplication (the dominant finding)

The duplication scanner found **30 groups** of byte-identical prompt+values+feedback
check/challenge/interactive steps shared between *different* lessons in the primary
(non-remedial) sequence — not the expected remedial-mirrors-own-lesson pattern.
Spot-checking several pairs against their full JSON (not just the scanner's
signature) confirmed these are genuine, not scanner artifacts: e.g.
`measure-compare-k/kmd-01-03` and `kmd-02-02` share three entire check steps
verbatim, including a CML block that is byte-identical except for the tag name
substituted into an otherwise-fixed template sentence ("...for kmd weight words."
vs "...for kmd compare weight.") — clear evidence of unvaried template reuse
rather than intentional spiral review. This matches the authority doc's explicit
"accidental repetition" stop-condition and the "distinct instructional job per
question" bar.

Attribution rule used: for each duplicate group, the numerically-earliest lesson
(by chapter.lesson) is treated as the legitimate original (KEEP on this axis); every
later lesson sharing that exact step is the one that needs new content (REVISE).
`compare-numbers-k` was only partly affected (5/12 lessons in 4 groups);
`measure-compare-k` and `teen-numbers-k` are pervasively affected — in
`teen-numbers-k` only the three earliest lessons of chapter 1 are clean, and
several later lessons (e.g. `knb-02-01`, `knb-03-02`, `knb-03-03`) have three or
four of their steps recycled from earlier lessons, leaving almost no original
check content. The prior S253 course-integrity pass explicitly scoped itself to
"a handful of flagged rows" for progression/duplication; this scan shows that pass
was not comprehensive.

A parallel "same prompt, different numbers" pattern (e.g. the three-ribbon
`lengthCompare` template reused with different lengths across `kmd-01-01/k2`,
`kmd-01-02/k2`, `kmd-02-01/k1`, etc., or `knb-02-04/k2` vs `knb-03-04/k2`'s
"which pair makes 10" with different addends) is **not** flagged — those are
legitimately parameterized templates with genuinely different values and are
normal, acceptable spiraled practice.

### 2. Stale dragOrder successFeedback (wrong numbers, confirmed learner-reachable)

`compare-numbers-k/kcm-03-03` (`k1` and its own remedial) and `kcm-03-04` (`k2`)
each have a `dragOrder` widget whose `successFeedback` reads
`"21, 22, 23, 24, 25 — perfect counting order!"` while the actual cards/
`correctOrder` are 5,6,7,8 (kcm-03-03) or 4,5,6,7 (kcm-03-04). Per
`evaluate.ts`'s `dragOrder` case, `successFeedback` is returned unconditionally on
a correct order — every learner who gets it right sees this false text. Sibling
step `kcm-03-03/k3` already carries the correctly-patterned text ("7, 8, 9, 10 —
the cards now run from least to greatest"), confirming the S253 repair fixed that
one instance but missed the other two occurrences of the identical bug in the
same and a neighboring lesson.

### 3. Stale tenFrame target numbers in commonCounts feedback (confirmed learner-reachable)

`measure-compare-k/kmd-01-04/i2` (target 6, preFilled 4) and `kmd-03-03/i2`
(target 8, preFilled 5) each have `commonCounts` feedback entries that cite the
wrong target ("...shows exactly 5" / "...exactly 7") instead of the widget's real
target (6 / 8 respectively). Tracing `TenFrameW`'s clamp
(`Math.max(spec.preFilled, Math.min(10, t))`) and `evaluate.ts`'s tenFrame case
shows one entry per widget is genuinely reachable today (kmd-01-04's `count:4`
entry, kmd-03-03's `count:6` entry — both land exactly where a learner submitting
from the pre-filled state, or after one add, would land) and shows the wrong
number; the other entries in each widget are currently unreachable (below the
`preFilled` clamp, or equal to `target` and short-circuited by evaluate.ts's
`v===target` check) but carry the same wrong number and should be corrected too
for source-of-truth hygiene.

### 4. Dead/self-contradictory tenFrame commonCounts entries (cosmetic, zero learner impact)

`compare-numbers-k/kcm-02-01/i2` and `kcm-03-02/i2` each contain a `commonCounts`
entry whose `count` equals the widget's own `target`. Per `evaluate.ts`, the
`v === target` branch always fires first, so these entries can never be shown —
they are inert, self-contradictory authoring data (describing the correct answer
as if it were a near-miss), not a learner-facing defect. Flagged for cleanup
because it is real, verifiable, and cheap to fix, not because it affects anyone
using the app today.

### 5. Option-label-length tells

Two remedial MCQs have a correct option unambiguously the length outlier versus
every distractor: `compare-numbers-k/kcm-02-04`'s remedial (correct 54 chars vs.
21-27 for distractors) and `measure-compare-k/kmd-03-02`'s remedial (correct 44
chars vs. 5-22, up to 8.8x the shortest). Both are in the remedial-only path, not
the main sequence.

## Axes not driving REVISE

- **Visuals**: all 25 distinct `figure` IDs referenced across the 36 lessons are
  registered in `FIGURE_IDS`; no promised-visual-vs-narration mismatch was found
  (contrast with the pattern seen in sibling lane reports, e.g. a figure rendering
  a different numeral than the prose beside it — nothing like that exists in these
  three courses). `lengthCompare`/`tapDiagram`/`balanceScale`/`numberLineHop`
  widgets were recomputed from their raw parameters and all match their prompts'
  stated comparisons. `visualDecision = SUFFICIENT` on all 36 records.
- **Grade language**: all `concept` step bodies are within the 25-word cap; prose
  throughout is short, concrete, and kindergarten-appropriate (familiar nouns,
  short sentences, no jargon) in both KEEP and REVISE lessons — the REVISE
  lessons' defects are factual/duplication issues, not reading-level issues.
  `gradeLanguageDecision = FIT` on all 36 records.
- **mcq/predict option order**: not assessed as a defect surface — render-time
  order is `seededShuffle`-determined per `lessonId:stepId` and grading is by
  option `id`, so the raw JSON order already normalized by S305/306/307 does not
  reach the learner as written.

## Per-lesson verdicts

### compare-numbers-k

| Lesson | Decision | One-line reason |
|---|---|---|
| kcm-01-01 | KEEP | Clean; original source others copied from |
| kcm-01-02 | KEEP | Clean |
| kcm-01-03 | REVISE | k1 (+remedial) verbatim-duplicates kcm-01-01/k1 |
| kcm-01-04 | REVISE | k3 verbatim-duplicates kcm-01-01/k2 |
| kcm-02-01 | REVISE | i2 tenFrame dead/self-contradictory commonCounts entry (cosmetic) |
| kcm-02-02 | REVISE | k1 dupes kcm-01-03/k2; k2 dupes kcm-02-03/k2 |
| kcm-02-03 | REVISE | k2 verbatim-duplicates kcm-02-02/k2 |
| kcm-02-04 | REVISE | Remedial MCQ correct option is a 2x+ length outlier |
| kcm-03-01 | KEEP | Clean |
| kcm-03-02 | REVISE | i2 tenFrame dead/self-contradictory commonCounts entry (cosmetic) |
| kcm-03-03 | REVISE | k1 (+remedial) dragOrder successFeedback cites wrong numbers (21-25 instead of 5-8) |
| kcm-03-04 | REVISE | k2 dragOrder successFeedback cites wrong numbers (21-25 instead of 4-7) |

### measure-compare-k

| Lesson | Decision | One-line reason |
|---|---|---|
| kmd-01-01 | KEEP | Clean; original source others copied from |
| kmd-01-02 | KEEP | Clean; original source others copied from |
| kmd-01-03 | KEEP | Clean; original source of 3 steps kmd-02-02 copied wholesale |
| kmd-01-04 | REVISE | ch1 dupes kmd-01-01/k3; i2 tenFrame cites stale target "5" instead of 6 |
| kmd-02-01 | KEEP | Clean; original source others copied from |
| kmd-02-02 | REVISE | k2/k3/ch1 are a wholesale verbatim reorder-copy of kmd-01-03's checks |
| kmd-02-03 | REVISE | k2 verbatim-duplicates kmd-02-01/k3 |
| kmd-02-04 | REVISE | k2 verbatim-duplicates kmd-01-02/k1 |
| kmd-03-01 | KEEP | Clean; original source others copied from |
| kmd-03-02 | REVISE | k1 dupes kmd-03-01/k2; remedial has 8.8x label-length tell |
| kmd-03-03 | REVISE | i2 tenFrame cites stale target "7" instead of 8 |
| kmd-03-04 | REVISE | i1 (full tapDiagram) dupes kmd-03-01/i1; ch1 dupes kmd-03-03/k3 |

### teen-numbers-k

| Lesson | Decision | One-line reason |
|---|---|---|
| knb-01-01 | KEEP | Clean; original source of 3 steps others copied |
| knb-01-02 | KEEP | Clean; original source of 2 steps others copied |
| knb-01-03 | KEEP | Clean; original source of several steps others copied |
| knb-01-04 | REVISE | k1 (+remedial) dupes knb-01-01/ch1; k2 dupes knb-01-01/k2 |
| knb-02-01 | REVISE | i1/k2/k3/remedial (4 steps) duplicate knb-01-02/knb-01-03 content |
| knb-02-02 | REVISE | Remedial tenFrame dupes knb-01-03/i1 (make-15 instead of 17-19 range) |
| knb-02-03 | REVISE | k1 (+remedial) dupes knb-02-02/ch1; i1 dupes knb-01-03/knb-02-01 remedials |
| knb-02-04 | REVISE | k3 verbatim-duplicates knb-03-02/i1 |
| knb-03-01 | REVISE | k1(+remedial)/k3/ch1 (3 steps) duplicate knb-02-03/knb-01-03/knb-03-03 |
| knb-03-02 | REVISE | k2/ch1/i1 (3 steps) duplicate knb-01-01/knb-02-01/knb-02-04 |
| knb-03-03 | REVISE | i1/k1(+remedial)/k2/k3 (4 steps) duplicate knb-01-02/knb-03-01/knb-01-03/knb-01-04 |
| knb-03-04 | REVISE | i1 dupes knb-01-04/i1; ch1 dupes knb-02-02/knb-02-03; k3 dupes knb-03-02 remedial |

## Implementation contracts (one per REVISE lesson)

Each contract lists the exact step(s), the current defect, and the minimum fix.
Where the defect is duplication, the fix is: keep the widget type/conceptTag/
mechanic, and write a new scenario (new objects/numbers/wording) that is not
byte-identical to the named source step, while still targeting the same
conceptTag's learning goal. No other steps in these lessons need to change.

### compare-numbers-k

- **kcm-01-03**: `k1` and its remedial `rem-kcm-bigger-group-k` currently reuse
  kcm-01-01/k1's "8 stars and 7 hearts" prompt+options+feedback verbatim. Replace
  with a new group-size scenario (different objects/counts) that still exercises
  kcm-bigger-group; keep the remedial mirroring the new k1 content (as designed).
- **kcm-01-04**: `k3` currently reuses kcm-01-01/k2's one-to-one-pairing question
  verbatim. Replace with new option wording for "why pairing settles bigger/
  smaller," distinct from kcm-01-01/k2, still targeting kcm-smaller-group.
- **kcm-02-01**: `i2`'s tenFrame `commonCounts` has `{count:4, feedback:"That
  matches the target count..."}` where target is also 4. Delete this entry (keep
  only the `count:3` entry) — it is dead code today, and removing it prevents an
  actually-wrong "near miss" message ever being live if the clamp/target logic
  changes later.
- **kcm-02-02**: `k1` currently reuses kcm-01-03/k2's "quick visual estimate"
  question verbatim; `k2` currently reuses kcm-02-03/k2's "5 stars and 6 hearts"
  question verbatim. Replace both with new content distinct from their sources,
  targeting kcm-compare-visual.
- **kcm-02-03**: `k2` currently reuses kcm-02-02/k2's "5 stars and 6 hearts"
  question verbatim (once kcm-02-02/k2 is replaced per above, this duplication
  target moves — either way, kcm-02-03/k2 needs its own distinct scenario for
  kcm-compare-count).
- **kcm-02-04**: Remedial `rem-kcm-greater-numeral-k`'s correct option ("8 comes
  later in the song, and later always means more", 54 chars) is more than 2x any
  distractor (21-27 chars). Shorten the correct option to a comparable length,
  e.g. "8 comes later in the song, so it names more" (~44 chars), or lengthen the
  distractors by a similar clause; keep the same misconceptions.
- **kcm-03-02**: `i2`'s tenFrame `commonCounts` has `{count:6, feedback:"That
  matches the target count..."}` where target is also 6. Delete this entry (keep
  only the `count:5` entry), same rationale as kcm-02-01.
- **kcm-03-03**: `k1`'s and remedial `rem-kcm-order-numerals-k`'s dragOrder
  `successFeedback` is `"21, 22, 23, 24, 25 — perfect counting order!"`. The
  actual cards are 5,6,7,8. Change both to `"5, 6, 7, 8 — perfect counting
  order!"`.
- **kcm-03-04**: `k2`'s dragOrder `successFeedback` is `"21, 22, 23, 24, 25 —
  perfect counting order!"`. The actual cards are 4,5,6,7. Change to `"4, 5, 6,
  7 — perfect counting order!"`.

### measure-compare-k

- **kmd-01-04**: `ch1` currently reuses kmd-01-01/k3's seesaw-vs-ruler question
  verbatim; replace with new wording distinct from kmd-01-01/k3, targeting
  kmd-capacity-words. `i2`'s tenFrame (target 6, preFilled 4) has all three
  `commonCounts` feedback strings saying "...shows exactly 5" — change every
  occurrence of "5" to "6" (entries for count 2, 4, and 6).
- **kmd-02-02**: `k2`, `k3`, and `ch1` are a verbatim reordered copy of
  kmd-01-03's `ch1`, `k3`, and `k1` respectively (same toy-bear/balloon-and-stone
  scenarios). Write three new check/challenge items for kmd-compare-weight that
  apply weight comparison to new objects, distinct from kmd-01-03's
  vocabulary-introduction content; keep the existing i1/i2 balanceScale steps
  (already correctly varied) unchanged.
- **kmd-02-03**: `k2` currently reuses kmd-02-01/k3's "two runners race" question
  verbatim; replace with new wording for kmd-align-ends.
- **kmd-02-04**: `k2` currently reuses kmd-01-02/k1's "tower is TALL, snake is
  LONG" question verbatim; replace with new wording that tests taller/shorter
  comparison (not vocabulary recall) for kmd-taller-shorter.
- **kmd-03-02**: `k1` currently reuses kmd-03-01/k2's "what makes a sort a SORT"
  question verbatim; replace with new wording for kmd-sort-size. Remedial
  `rem-kmd-sort-size-k`'s correct option ("One rule that every object is tested
  against", 44 chars) is up to 8.8x the shortest distractor ("Speed", 5 chars);
  rebalance lengths, e.g. shorten correct to "One rule everyone must follow"
  (~30 chars) and lengthen "Speed" to "How fast it goes" (~17 chars).
- **kmd-03-03**: `i2`'s tenFrame (target 8, preFilled 5) has all three
  `commonCounts` feedback strings saying "...exactly 7" — change every
  occurrence of "7" to "8" (entries for count 3, 6, and 8).
- **kmd-03-04**: `i1`'s tapDiagram widget (hotspots/positions/icons/feedback) is
  byte-identical to kmd-03-01/i1; build a new shape-sorting scenario (different
  shape counts/categories) while keeping the already-varied `predict` sub-block.
  `ch1` currently reuses kmd-03-03/k3's "what does counting each group add"
  question verbatim; replace with new wording for kmd-compare-categories.

### teen-numbers-k

- **knb-01-04**: `k1` (+ its remedial `rem-knb-11-13-k`) currently reuses
  knb-01-01/ch1's "12 dots, which numeral" question verbatim; `k2` currently
  reuses knb-01-01/k2's "what does 14 secretly say" question verbatim. Replace
  both with content specific to the 11-13 range (e.g. build/identify 11 or 13
  rather than reusing 12/14 material already covered by knb-01-01).
- **knb-02-01**: `i1` (tenFrame, currently target 15/pre 0, byte-identical to
  knb-01-03/i1) needs a fresh make-a-teen scenario in the 14-16 range (e.g.
  target 14). `k2` (currently reuses knb-01-02/ch1's "14 dots" question
  verbatim) needs new wording. `k3` (numberLineHop, currently identical to
  knb-01-03/k3) needs new start/hop parameters distinct from knb-01-03's. The
  remedial (tenFrame make-16, currently identical to knb-01-03's remedial) needs
  a fresh scenario for the same target.
- **knb-02-02**: Remedial `rem-knb-17-19-k` (tenFrame, currently target 15/pre 0,
  byte-identical to knb-01-03/i1 and knb-02-01/i1) needs a fresh scenario in the
  actual 17-19 range this remedial is meant to cover (e.g. target 17 or 19, not
  15).
- **knb-02-03**: `k1` (+ its remedial `rem-knb-decompose-teen-k`, currently
  reuses knb-02-02/ch1's "not a split of 18" question verbatim) needs new
  wording. `i1` (tenFrame, currently reuses knb-01-03's and knb-02-01's remedial
  make-16 scenario verbatim) needs a fresh scenario.
- **knb-02-04**: `k3` (numberLineHop, currently identical to knb-03-02/i1's
  "start at 10, count on 3") needs new start/hop parameters for knb-teen-equation.
- **knb-03-01**: `k1` (+ its remedial `rem-knb-leftover-ones-k`, currently reuses
  knb-02-03/k2's "17 dots...how many left over" question verbatim) needs new
  wording. `k3` (numberLineHop, currently identical to knb-01-03/k3 and
  knb-02-01/k3) needs new parameters. `ch1` (currently reuses knb-03-03/k1's
  "full ten and 3 outside" question verbatim) needs new wording, all for
  knb-leftover-ones.
- **knb-03-02**: `k2` (numberLineHop, currently identical to knb-01-01/k3's
  "after 16" hop) needs new parameters. `ch1` (currently reuses knb-02-01/ch1's
  "what comes after 17" question verbatim) needs new wording. `i1`
  (numberLineHop, currently identical to knb-02-04/k3's "count on 3 from 10")
  needs new parameters, all for knb-teen-line. (The lesson's own remedial,
  count-on-4, is original and does not need to change.)
- **knb-03-03**: `i1` (tenFrame, currently identical to knb-01-02/i1's make-12)
  needs a fresh scenario. `k1` (+ its remedial `rem-knb-identify-teen-k`,
  currently reuses knb-03-01/ch1's "full ten and 3 outside" question verbatim)
  needs new wording. `k2` (currently reuses knb-01-03/k2's "16 dots" question
  verbatim) needs new wording. `k3` (numberLineHop, currently identical to
  knb-01-04/k3's "before 18" hop) needs new parameters, all for
  knb-identify-teen.
- **knb-03-04**: `i1` (tenFrame, currently identical to knb-01-04/i1's make-13)
  needs a fresh scenario. `ch1` (currently reuses knb-02-02/ch1 and
  knb-02-03/k1's "not a split of 18" question verbatim) needs new wording. `k3`
  (numberLineHop, currently identical to knb-03-02's remedial "count on 4") needs
  new parameters, all for knb-teen-apply. (`k2`'s "which pair makes 10" is a
  legitimately-varied template and does not need to change.)

## Notes on prior repair passes

- S305/S306/S307 (choice-order repairs) verifiably normalized raw option-array
  order across all three courses, but this has no bearing on learner experience
  because `McqW`/predict rendering always applies `seededShuffle` keyed by
  `lessonId:stepId` and grading is by option `id` — confirmed by direct reading
  of `src/components/widgets.tsx` and `src/lib/evaluate.ts`. No new work needed
  here; nothing to reopen.
- S253 (whole-course repair, all three courses) fixed illustration references,
  a handful of progression/duplication rows, and one instance of the dragOrder
  stale-successFeedback bug in `kcm-03-03/k3`. This assessment independently
  re-verified all three courses from current source bytes (per the authority
  doc's "cannot approve their own work" instruction) and found the
  progression/duplication sweep was materially incomplete — 30 additional
  cross-lesson duplicate groups remain, concentrated in `measure-compare-k` and
  `teen-numbers-k` — and found two further instances of the exact dragOrder bug
  pattern S253 partially fixed.
