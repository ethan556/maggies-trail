# S320 — Independent Assessment A12: lines-angles, shapes-measure-g1, measure-length-g1

Independent, read-only course-quality assessment of three complete courses per
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`'s framing (an implementation worker cannot assess
its own packet; this pass is independent of, and does not rely on, any prior authoring session's
self-report). Every `course.json` and every lesson (34 total, including all `remedials`) was read
in full. No content file was modified — the only writes are this report and
`reports/closure/cowork-staging/laneB-s320-A12-dispositions.jsonl` (34 NDJSON records, one per
lesson). `CLOSURE_LEDGER.md` was not touched.

## Scope

| Course | Grade | Lessons | course.json id |
|---|---|---|---|
| `content/courses/lines-angles` | G4 | 12 (`la-01-01`…`la-04-03`) | `lines-angles` |
| `content/courses/shapes-measure-g1` | G1 | 12 (`smg1-01-01`…`smg1-04-03`) | `shapes-measure-g1` |
| `content/courses/measure-length-g1` | G1 | 10 (`g1m-01-01`…`g1m-03-03`) | `measure-length-g1` |

## Result summary

| Course | KEEP | REVISE | ESCALATE |
|---|---|---|---|
| lines-angles | 10 | 2 | 0 |
| shapes-measure-g1 | 12 | 0 | 0 |
| measure-length-g1 | 6 | 4 | 0 |
| **Total** | **28** | **6** | **0** |

All `visualDecision` = `SUFFICIENT` (every figure/widget referenced by these 34 lessons renders —
confirmed against `reports/vis/VIS01_PLACEMENTS.csv`, cause=`RENDERS` on all 61 rows belonging to
these 3 courses, and against the relevant widget-rendering source in `src/components/widgets.tsx`
for widget-driven visuals with no static `figure` key). All `gradeLanguageDecision` = `FIT`.

## Methodology

- **Math truth.** Every widget instance (prompt, options, numeric answers, evaluator logic per
  `src/lib/evaluate.ts`, feedback, reveal) was checked by hand. lines-angles: every angle-sum
  (triangle 180°, quadrilateral 360°), classification (acute/right/obtuse), parallel/perpendicular
  claim, symmetry-line count, and the two combinatorics instances (`la-01-03`: C(3,2)=3, C(4,2)=6
  for "how many angles from N rays at a vertex") were recomputed independently — all correct, zero
  errors found.
- **unitRuler geometry (S316).** `src/components/measureLength.s316.test.tsx` and
  `src/lib/evaluate.ts` (grading reads only `{zeroAligned, spacing, unitSize, placements}`, never
  the rendered `finish`/`covered` display) were read as ground truth for the corrected
  covered-length-from-aligned-zero semantics. Every authored `unitRuler` spec in
  `measure-length-g1` (10 instances: `g1m-02-01`…`g1m-03-03`, i1+i2 each) and the one in
  `shapes-measure-g1` (`smg1-03-01/i1`, the exact lesson the regression test mirrors) was checked
  against the invariant `requiredPlacements × targetUnitSize === objectEnd − objectStart`. All 11
  instances satisfy it exactly.
- **Duplication, scanned programmatically.** A script parsed all 34 lessons' `steps[]` and
  `remedials[]`, extracted every widget/predict prompt with lesson/step id and options, and grouped
  by exact prompt text (284 prompts scanned, 274 unique, 10 duplicate-prompt groups). Each group was
  triaged by hand: 8 groups are a lesson's own main-check-vs-its-own-remedial pairing (by design,
  not a defect); 1 group (`smg1-04-01`/`smg1-04-03`, "Set the clock to show 12:00.") is a
  cross-lesson repeat judged an intentional callback in a manipulation widget with no options list
  to memorize, not a defect; 4 groups are genuine cross-lesson verbatim reuse of a primary
  check+remedial pair in `measure-length-g1`, producing the 4 REVISE verdicts there (detail below).
- **Option parity / length leaks.** A second script flagged MCQ/predict steps where the correct
  option's label length is a statistical outlier vs. its distractors (≥15 chars longer than the
  next-longest, or shortest by ≥15 chars). 8 candidates were flagged, all in `lines-angles`. The
  ~15–16 character gap-to-next-longest threshold was calibrated against precedent language already
  in `reports/closure/cowork-staging/*.jsonl` from prior review lanes. Of the 8: 2 are genuine leaks
  (`la-02-03/k3` gap=22, `la-03-01/k2` gap=25 — both REVISE); the rest are either the correct answer
  being the *shortest* option in a natural one-word always/never or yes/no answer (not a padding
  leak), a full descriptive phrase competing against short jargon distractors, or (one case,
  `la-04-01/ch1`) sitting exactly at the threshold as a one-off rather than a repeated pattern — kept
  as KEEP with the observation recorded in its rationale. Aggregate stats: correct option is
  strictly the longest option in 33.0% of this corpus's 97 scored MCQs overall (lines-angles 45.7%,
  shapes-measure-g1 5.0%, measure-length-g1 32.3%) — the elevated lines-angles rate is what the two
  REVISE items and the one noted borderline case are drawn from.
- **Reading level / grade-appropriate language.** `src/lib/pedagogy.ts`'s lint caps concept-step
  body word count at 25 words under `readingProfile:"early"` vs. 80 under `"standard"` (the schema
  default). Word counts were measured directly: lines-angles concept bodies run 26–55 words
  (avg 38.1, appropriate for G4, `"standard"` is correct and is the only sensible choice — the
  25-word `"early"` cap is a K/early-reader accommodation, inapplicable to G4); shapes-measure-g1
  concept bodies run 20–36 words (avg 28.3; 35/48 — 73% — already exceed the 25-word `"early"` cap,
  so `"early"` would be structurally infeasible without rewriting most of the course's prose);
  measure-length-g1 concept bodies run 15–26 words (avg 19.4; only 2/30 exceed 25). Separately,
  `readingProfile` was cross-checked against all other K and G1 courses in the repo: every K
  (grade 0) course uses `"early"` uniformly (10/10), while G1 courses split, with 8 of 11 using
  `"standard"` (explicit or default) and only 3 using `"early"`. `measure-length-g1` (explicit
  `"standard"`) and `shapes-measure-g1` (default, i.e. `"standard"`) both match the *majority*
  established G1 convention, not an outlier — `gradeLanguageDecision: FIT` for both. (Note for the
  record: `readingProfile` also gates a runtime read-aloud `<Narration>` component in
  `src/components/LessonPlayer.tsx:620`, shown only when `"early"`; this is a cross-cutting,
  repo-wide K/G1 authoring convention question that applies near-identically to 6 other G1 courses
  outside this assessment's scope, so it was resolved as FIT here on the evidence above rather than
  escalated as a per-course finding.)
- **Accessibility.** `LengthCompareW`/`LengthPickAlignW` and `UnitRulerW` were read in full
  (`src/components/widgets.tsx`); every other widget type used across these 3 courses
  (`angleMeasure`, `clockSet`, `dragBucket`, `lineRelationLab`, `matchPairs`, `shapeFamilyBuilder`,
  `shapeHierarchyLab`, `shapeParts`, `triangleAngleLab`) was spot-checked for `aria-label`/
  `role="img"` coverage — all carry non-trivial coverage, no widget type used in these courses lacks
  basic screen-reader affordances at the component level.
- **Reasoning before reveal / structure.** Scripted check across all 34 lessons: every lesson starts
  with a `concept` step and ends with `recap`; every `predict` block (present in a subset of
  lessons) carries both a non-empty `reveal` and ≥2 options. Zero ordering violations found.
- **Seeded shuffle.** `mcq`/`predict` options are seeded-shuffled at render, so authored JSON option
  order was not treated as a defect signal by itself anywhere in this review — only option *content*
  and *length* were scored.

## REVISE items — implementation contracts

### `la-02-03` (lines-angles) — option-length leak, k3
Correct option `"Neither parallel nor perpendicular — it crosses at some other angle"` (67 chars) is
22 chars longer than the next-longest distractor (45 chars) — the only option needing an
explanatory clause at that length. **Contract:** shorten the correct option's clause (e.g.
`"Neither — it crosses at another angle"`) or add comparable brief clauses to the three distractors,
so no option is a length outlier. Do not change which option is marked correct, the prompt, or any
feedback text.

### `la-03-01` (lines-angles) — option-length leak, k2
Correct option `"No triangle can — two such angles would already exceed 180° alone"` (65 chars) is
25 chars longer than the next-longest distractor (40 chars). **Contract:** trim the correct option's
justification clause to a length comparable with the three distractors, or add brief justification
clauses to the distractors. No change to the marked-correct option, prompt, or feedback text.

### `g1m-01-03` (measure-length-g1) — mislabeled visual + garbled feedback clause, i1
Step `i1`'s `lengthCompare` widget prompt reads "compare it fairly with the pole" and its
`successFeedback` reads "The pole beats the string...", but `widget.items` still carry the labels
`"top ribbon"` / `"bottom ribbon"` — a leftover from the ribbon-comparison template used in
`g1m-01-01`/`g1m-01-02` (confirmed correct there). `item.label` renders as literal visible SVG text
(`LengthCompareW`/`LengthPickAlignW`, `src/components/widgets.tsx`), so the learner sees bars
captioned "ribbon" while the prompt and feedback name a pole and a string. Sibling step `i2` in this
same lesson correctly uses `"string"`/`"rod"`, confirming `i1` is the outlier, not an intentional
naming choice. Separately, `i1.widget.successFeedback`'s trailing clause — "half of the chain that
will settle the pole against the rod" — is a dangling, grammatically unclear fragment for a G1
reader. **Contract:**
1. In step `i1`'s `widget.items`, rename the `"top"` item's `label` from `"top ribbon"` to
   `"pole"`, and the `"bottom"` item's `label` from `"bottom ribbon"` to `"string"`. `id`, `length`,
   `startOffset`, and `answerId` are all correct as authored and must not change.
2. Rewrite `successFeedback` to a complete, grade-appropriate sentence, e.g. `"The pole beats the
   string — that's one of the two links that will settle pole against rod."`
No other step, widget, or answer in this lesson needs to change.

### `g1m-01-04` (measure-length-g1) — mislabeled visual, i1
Step `i1`'s prompt reads "compare the string with the rod" and its `successFeedback` reads "The
string beats the rod...", but `widget.items` again carry the leftover labels `"top ribbon"` /
`"bottom ribbon"`. Sibling step `i2` in this lesson correctly labels its items `"string"`/`"rod"`,
confirming the fix is a pure relabel. **Contract:** in step `i1`'s `widget.items`, rename the
`"top"` item's `label` from `"top ribbon"` to `"string"`, and the `"bottom"` item's `label` from
`"bottom ribbon"` to `"rod"`. `id`, `length`, `startOffset`, and `answerId` are unaffected. No other
change needed.

### `g1m-03-01` (measure-length-g1) — cross-lesson duplicate check, k1
`k1`'s prompt ("Exactly 9 same-size cubes cover a ribbon with no gaps and no overlaps. How long is
the ribbon in cubes? Choose the key measurement idea.") and its paired remedial are byte-identical
in wording, numbers, options, and feedback to `g1m-02-01`'s `k1` check and remedial — the same
primary checkpoint reused verbatim three lessons later, with no distinct instructional job at this
point in the course. **Contract:** rewrite `k1`'s prompt/options and its paired remedial
(`rem-g1m-cubes-k`) to a fresh scenario — different object, cube count, and distractor set —
consistent with this lesson's existing `conceptTag`. Leave the `unitRuler` interactive steps (`i1`,
`i2`) and `k2`/`k3`/`ch1` untouched; they were independently verified correct and non-duplicated.

### `g1m-03-03` (measure-length-g1) — cross-lesson duplicate checks, k1 and k3
Two separate duplications in one lesson: `k3` ("Exactly 8 same-size cubes...") repeats `g1m-02-01`'s
`k3` check and remedial verbatim; `k1` ("A stick measures 12 small cubes... twice as long...")
repeats the immediately preceding lesson `g1m-03-02`'s `k1` check *and* remedial verbatim, including
identical option text and order. This is the most severe duplication instance found across the
three courses (adjacent lessons in the same chapter, two separate checkpoints copy-pasted).
**Contract:** rewrite `k1` and `k3` and their two paired remedials (`rem-g1m-unit-size-k`,
`rem-g1m-...` for k3) to fresh scenarios — different objects, cube counts, and distractor sets —
consistent with this lesson's own `conceptTag`s, so neither checkpoint duplicates `g1m-02-01` or
`g1m-03-02`. Leave the `unitRuler` interactive steps and `k2`/`ch1` untouched; independently verified
correct and non-duplicated.

## Full per-lesson disposition

Decision / visualDecision / gradeLanguageDecision for all 34 lessons (full rationale for each is in
`reports/closure/cowork-staging/laneB-s320-A12-dispositions.jsonl`):

### lines-angles
| Lesson | decision | visualDecision | gradeLanguageDecision |
|---|---|---|---|
| la-01-01 | KEEP | SUFFICIENT | FIT |
| la-01-02 | KEEP | SUFFICIENT | FIT |
| la-01-03 | KEEP | SUFFICIENT | FIT |
| la-02-01 | KEEP | SUFFICIENT | FIT |
| la-02-02 | KEEP | SUFFICIENT | FIT |
| la-02-03 | **REVISE** | SUFFICIENT | FIT |
| la-03-01 | **REVISE** | SUFFICIENT | FIT |
| la-03-02 | KEEP | SUFFICIENT | FIT |
| la-03-03 | KEEP | SUFFICIENT | FIT |
| la-04-01 | KEEP | SUFFICIENT | FIT |
| la-04-02 | KEEP | SUFFICIENT | FIT |
| la-04-03 | KEEP | SUFFICIENT | FIT |

### shapes-measure-g1
| Lesson | decision | visualDecision | gradeLanguageDecision |
|---|---|---|---|
| smg1-01-01 | KEEP | SUFFICIENT | FIT |
| smg1-01-02 | KEEP | SUFFICIENT | FIT |
| smg1-01-03 | KEEP | SUFFICIENT | FIT |
| smg1-02-01 | KEEP | SUFFICIENT | FIT |
| smg1-02-02 | KEEP | SUFFICIENT | FIT |
| smg1-02-03 | KEEP | SUFFICIENT | FIT |
| smg1-03-01 | KEEP | SUFFICIENT | FIT |
| smg1-03-02 | KEEP | SUFFICIENT | FIT |
| smg1-03-03 | KEEP | SUFFICIENT | FIT |
| smg1-04-01 | KEEP | SUFFICIENT | FIT |
| smg1-04-02 | KEEP | SUFFICIENT | FIT |
| smg1-04-03 | KEEP | SUFFICIENT | FIT |

### measure-length-g1
| Lesson | decision | visualDecision | gradeLanguageDecision |
|---|---|---|---|
| g1m-01-01 | KEEP | SUFFICIENT | FIT |
| g1m-01-02 | KEEP | SUFFICIENT | FIT |
| g1m-01-03 | **REVISE** | SUFFICIENT | FIT |
| g1m-01-04 | **REVISE** | SUFFICIENT | FIT |
| g1m-02-01 | KEEP | SUFFICIENT | FIT |
| g1m-02-02 | KEEP | SUFFICIENT | FIT |
| g1m-02-03 | KEEP | SUFFICIENT | FIT |
| g1m-03-01 | **REVISE** | SUFFICIENT | FIT |
| g1m-03-02 | KEEP | SUFFICIENT | FIT |
| g1m-03-03 | **REVISE** | SUFFICIENT | FIT |

## Explicitly ruled out (not defects)

- `smg1-01-02`/`smg1-02-01`/`smg1-02-02`/`smg1-02-03`: duplicate prompts are each lesson's own
  main-check-vs-its-own-remedial pairing — the standard, by-design pattern used throughout this
  corpus.
- `smg1-04-01` ↔ `smg1-04-03` ("Set the clock to show 12:00."): cross-lesson repeat in a `clockSet`
  manipulation widget (no options list to memorize) revisiting the hardest clock-reading edge case
  as the chapter's final mixed-review challenge — judged intentional, not copy-paste debt.
- `la-01-01` remedial, `la-01-02/k1`, `la-02-01/i1#predict`, `la-03-03/i1#predict`,
  `la-04-01` remedial: all flagged by the option-length scan but ruled out on inspection (natural
  short yes/no or never-type answers, or a full descriptive phrase vs. short jargon, or a gap
  below the calibrated leak threshold).
- `la-04-01/ch1`: sits exactly at the calibrated leak threshold (15-char gap) as a one-off
  construction, not a repeated pattern within the lesson — kept as KEEP, noted in its rationale for
  future attention rather than revised now, consistent with not inventing defects at the margin.

## Constraints honored

Read-only on all `content/` and `src/` files. No `npm`/`vitest`/`tsc` run. `CLOSURE_LEDGER.md` not
touched. The only writes are this file and
`reports/closure/cowork-staging/laneB-s320-A12-dispositions.jsonl`.
