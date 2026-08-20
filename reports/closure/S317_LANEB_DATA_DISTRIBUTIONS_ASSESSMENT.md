# S317 Lane B — Data & Distributions — Independent Assessment

Reviewer: Claude Cowork independent assessor (data-distributions S317)
Reviewed: 2026-08-20T08:16:29.000Z
Course: `content/courses/data-distributions/course.json` (grade 6, 6 chapters, 18 lessons)
Method: read `course.json` and every one of the 18 lesson JSON files byte-for-byte;
independently recomputed every mean, median, IQR, MAD, range, quartile, and mean/median-gap
claim in the corpus by hand; verified every dot-plot/histogram/box-plot widget target against
its stated data; verified every named figure component (`src/components/figures.tsx`) renders
the specific numbers the lesson prose claims and carries an accessible `<title>`/`aria-label`;
verified every widget `type` referenced by a lesson is implemented in
`src/components/widgets.tsx`; ran a word-count scan for MCQ label-length parity (correct vs.
distractor option lengths) across all 18 lessons. No standard-deviation or z-score content
exists in this course (grade 6 topics stop at MAD/IQR), so no such claims required checking.

This lane obeys `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: this document, the two staging
files it produced, and the independently recomputed evidence below are the only artifacts of
this review; no cached ChatGPT-Work evidence was treated as authoritative, and no lesson or
course source file was edited (read-only per the assignment).

## Decision counts

- **KEEP: 17**
- **REVISE: 1** (dd-03-02)
- **ESCALATE: 0**

All 18 lessons received a `visualDecision` of `SUFFICIENT` (every promised diagram/animation
renders the actual synchronized data, with accessible titles and non-colour cues) and a
`gradeLanguageDecision` of `FIT` (language matches the grade-6 level declared in `course.json`
throughout — no notation or vocabulary beyond what the lesson itself teaches).

## REVISE list (one-phrase reasons)

- **dd-03-02** — MCQ label-length parity leak: correct option is 19 words vs. 9 words for both
  distractors (~2x), in the "what went wrong" median-sort-error question.

## Per-lesson verdicts

| Lesson | Decision | Visual | Grade Lang | One-line basis |
|---|---|---|---|---|
| dd-01-01 | KEEP | SUFFICIENT | FIT | Statistical-question definition correct across 5 MCQs + 2 dot-plot builds; mild length-parity notes (not blocking) |
| dd-01-02 | KEEP | SUFFICIENT | FIT | Data-set/repeat-value counts (8 students, 24 students) all correct; matchPairs size-mismatch traps correct |
| dd-01-03 | KEEP | SUFFICIENT | FIT | Sampling-bias lab and pipeline capstone correct (30−2=28 values; dot-plot sums to 12) |
| dd-02-01 | KEEP | SUFFICIENT | FIT | Dot-plot stack heights (1,2,3,1,1 = 8) and "more than 15" count (3) verified correct |
| dd-02-02 | KEEP | SUFFICIENT | FIT | Bin heights (1,2,4,3=10) and unequal-bin-width diagnosis correct; HistogramScores figure has a labelled frequency axis (post-S241 repair) |
| dd-02-03 | KEEP | SUFFICIENT | FIT | Peak/cluster/gap/outlier vocabulary correctly applied to every worked dataset, incl. matchPairs 3rd pair |
| dd-03-01 | KEEP | SUFFICIENT | FIT | Mean = sum÷count and its inverse (mean×count=total) both correct; fair-share bar target correct |
| dd-03-02 | **REVISE** | SUFFICIENT | FIT | Median mechanics fully correct; k3 MCQ has a severe (19w vs 9w) length-parity leak — see contract below |
| dd-03-03 | KEEP | SUFFICIENT | FIT | Outlier-drag arithmetic (mean 6→10, median 6→6.5) independently recomputed and correct |
| dd-04-01 | KEEP | SUFFICIENT | FIT | Range arithmetic correct throughout; uses pointSetReasoningLab (no mcq-type length-parity risk) |
| dd-04-02 | KEEP | SUFFICIENT | FIT | Q1/Q3/IQR for both even- and odd-count halves, and the outlier-robustness recompute (IQR 8→10 vs range 14→98), all independently verified correct |
| dd-04-03 | KEEP | SUFFICIENT | FIT | Class A/B means (7,7), medians (7,7), IQRs (4,10), ranges (6,12) all recomputed and correct |
| dd-04b-01 | KEEP | SUFFICIENT | FIT | Five-number summary reads/builds correct; Q1=7.5 challenge (lower half 4,6,9,10) correct |
| dd-04b-02 | KEEP | SUFFICIENT | FIT | Box widths (4 vs 8), containment (A⊂B), and bus/walk median-gap (12 min) all correct |
| dd-04b-03 | KEEP | SUFFICIENT | FIT | MAD = 2.4 recomputed independently for all three worked sets; outlier-sensitivity example (mean 10, MAD 7.5) correct |
| dd-05-01 | KEEP | SUFFICIENT | FIT | Symmetric trip data: median=mean=15, IQR=10, all recomputed correct; correct-shortest MCQ is thematically justified, not a leak |
| dd-05-02 | KEEP | SUFFICIENT | FIT | Allowance outlier example (mean 20, median 14, IQR 5, range 54) fully recomputed correct; mild length-parity notes |
| dd-05-03 | KEEP | SUFFICIENT | FIT | Full capstone pipeline on fresh data (mean 3, median 2, Q1 1, Q3 3, IQR 2) all independently recomputed correct |

## Implementation contract for the REVISE

### dd-03-02 — `content/courses/data-distributions/lessons/dd-03-02.json`, step `k3`

**Problem.** The `k3` MCQ widget's options show a severe label-length asymmetry:

```json
"options": [
  { "id": "a", "label": "Jae never sorted — the middle pair of the SORTED list 2, 4, 7, 9 is 4 and 7", "correct": true, ... },
  { "id": "b", "label": "Jae should have used three middle numbers, not two", ... },
  { "id": "c", "label": "Nothing — 4.5 and 5.5 are both acceptable medians", ... }
]
```

Option `a` (correct) is 19 words; `b` and `c` are 9 words each — the correct option is roughly
double the length of both distractors, and it restates the entire worked solution inline. This
is a length-based tell independent of statistical understanding.

**Fix (minimal, preserves correctness/feedback/meaning).** Lengthen `b` and `c` to comparable
detail without changing which option is correct or altering any `feedback` text's factual
content:

- `b`: `"Jae should have averaged three middle numbers instead of two, since the unsorted list has four positions to choose from"`
- `c`: `"Nothing went wrong — both 4.5 (from the unsorted list) and 5.5 count as acceptable medians for this data"`

This brings `b` to ~18 words and `c` to ~17 words, closing the gap with `a`'s 19 words while
leaving `correct: true` on option `a`, all `feedback` strings, `hints`, `explanationVariants`,
and the numeric answer unchanged. No other step, figure, or widget in this lesson needs a
change.

## Course-wide notable findings (non-blocking)

1. **Mathematical rigor.** Every mean/median/IQR/MAD/range/quartile claim across all 18 lessons
   (concept prose, widget targets, `commonErrors`/`numericErrors`, `successFeedback`, and figure
   `<title>`/`aria-label` text) was independently recomputed by hand and found correct. This
   includes non-trivial cases: the odd-count IQR convention (median excluded from both halves),
   the 9-value post-outlier IQR recompute (Q1=5, Q3=15, IQR=10) in dd-04-02, and every
   mean-vs-median outlier-drag pair in dd-03-03, dd-05-02, and dd-05-03.
2. **Label-length parity, course-wide pattern.** Beyond the blocking case in dd-03-02, a word-count
   scan found the correct MCQ option running 3-5 words longer than every distractor (with no
   compensating shorter-correct instances except the thematically-justified dd-05-01 case) in
   dd-01-01 (x2), dd-01-02, dd-03-03, dd-04-02, and dd-05-02 (x2) — 8 of 18 lessons show at least
   one instance. None individually rises to dd-03-02's ~2x severity, and most are single
   instances within an otherwise length-balanced lesson, so none of these were escalated to
   REVISE. Recommend a follow-up lightweight editorial pass across the flagged items the next
   time any of these lessons is opened for other reasons.
3. **Figures.** All 20 named figures used by this course (`dd-stat-question`, `dd-data-answers`,
   `dd-pipeline`, `dd-shape`, `dd-median-even`, `dd-summary-pairs`, `dot-plot-pets`,
   `histogram-scores`, `mean-level-off`, `median-sort`, `mean-outlier-pull`, `range-stretch`,
   `quartile-fence`, `spread-compare`, `distribution-story`, `dd-box-five-number`,
   `dd-box-quarters`, `dd-box-compare-two`, `dd-mad-distances`, `dd-mad-vs-iqr`) are registered
   in `src/components/figures.tsx`, render the exact numbers their lesson's prose states, and
   carry both an SVG `<title>` and a matching `aria-label` describing the depicted relationship
   in words (non-colour-dependent).
4. **Widget coverage.** All widget `type` values referenced by this course's lessons (`mcq`,
   `numeric`, `dotPlot`, `barBuilder`, `plotPoint`, `matchPairs`, `dragOrder`, `dragBucket`,
   `boxPlot`, `samplingBiasLab`, `pointSetReasoningLab`) are implemented in
   `src/components/widgets.tsx`; none is a dangling/unimplemented reference.
5. **Instructional-job distinctness.** No within-lesson or cross-lesson duplication was found.
   Each of the 18 lessons has a distinct job (statistical questions → data sets → pipeline →
   dot plots → histograms → shape → mean → median → mean-vs-median → range → IQR →
   same-center-different-spread → box plots → box-plot comparison → MAD → shape+center+spread
   synthesis → choosing summary pairs → full-pipeline capstone), and worked examples use fresh
   numbers in each lesson rather than recycling the same dataset.
6. **Standards tags.** `dd-04b-01`, `dd-04b-02` (`6.SP.B.4`), and `dd-04b-03` (`6.SP.B.5c`) carry
   a `standards` array; per the ChatGPT-Work prefix authority rules, these remain candidate-only
   evidence pending an independent human decision bound to official standards text and are not
   evaluated further by this lesson-quality assessment.
