# S319 Independent Assessment: function-transformations & polynomial-rational-analysis

Reviewer: Claude Cowork independent assessor (S319)
Reviewed at: 2026-08-20T12:34:52.000Z
Method: full read of both course.json files and all 31 lesson JSON files (byte-level, in full); every
transformation mapping, asymptote, hole, intercept, sign chart, and arithmetic check recomputed by hand.
Basis hashes obtained via `node scripts/session/print-review-basis.mjs <ids>` (S246 authority module).
Read-only on all content; the only file written is the staging NDJSON plus this report.

Per the required prefix (`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`): this report and the staging
NDJSON are independent-assessment evidence only. They are not a ledger write and do not themselves
constitute a closure verdict; any cache entries referencing these lessons remain evidence-only pending
the human-decision ledger.

## Course decision counts

**function-transformations** (16 lessons, grade 11): 14 KEEP, 2 REVISE, 0 ESCALATE.
**polynomial-rational-analysis** (15 lessons, grade 12): 14 KEEP, 1 REVISE, 0 ESCALATE.
**Combined**: 28 KEEP, 3 REVISE, 0 ESCALATE — 31/31 lessons signed.

## REVISE list (one-phrase reasons)

1. `ft-05-03` — recap teaser falsely claims "Course complete!" while `ft-05-04` still follows in course.json.
2. `ft-05-04` — recap teaser re-promises the horizontal-line-test content that `ft-05-03` (its predecessor) already taught.
3. `pra-03-03` — i1 widget feedback falsely claims a removable hole at x=2 for f(x)=(x²−4)/(x−1), where the denominator does not vanish.

## Per-lesson verdicts

### function-transformations (ch1–ch5, gradeLevel 11)

| Lesson | Decision | Visual | Grade lang. | One-line basis |
|---|---|---|---|---|
| ft-01-01 | KEEP | REQUIRED | FIT | Parent-function shape/domain matching verified correct. |
| ft-01-02 | KEEP | REQUIRED | FIT | Domain rules (radicand ≥ 0, denom ≠ 0) verified correct incl. 2-step case. |
| ft-01-03 | KEEP | REQUIRED | FIT | Range floor/ceiling shifts verified correct incl. −x²+9 max. |
| ft-02-01 | KEEP | REQUIRED | FIT | Vertical-shift arithmetic verified correct throughout. |
| ft-02-02 | KEEP | REQUIRED | FIT | Horizontal-shift sign-flip rule verified correct throughout. |
| ft-02-03 | KEEP | REQUIRED | FIT | Combined (h,k) vertex reads verified correct. Minor: i1 predict reveal explains the raise-h case for a lower-h question — logically equivalent, not blocking. |
| ft-03-01 | KEEP | REQUIRED | FIT | x-axis vs y-axis reflection distinction verified correct incl. √(−x) domain flip. |
| ft-03-02 | KEEP | REQUIRED | FIT | Stretch/compression arithmetic verified correct. c1 figure is the S318-cleared ft-03-02 withheld figure — confirmed aligned, not re-flagged. |
| ft-03-03 | KEEP | REQUIRED | FIT | Full a(x−h)²+k pipeline evaluations verified correct. |
| ft-04-01 | KEEP | REQUIRED | FIT | Function arithmetic (+,−,·) verified correct at multiple inputs. |
| ft-04-02 | KEEP | REQUIRED | FIT | Composition order (inner-first) verified correct both directions. |
| ft-04-03 | KEEP | REQUIRED | FIT | Composition-formula substitution/solving verified correct. |
| ft-05-01 | KEEP | REQUIRED | FIT | Inverse-as-undo arithmetic and pair-swap logic verified correct. |
| ft-05-02 | KEEP | REQUIRED | FIT | Swap-and-solve / reverse-pipeline formulas verified correct for 3 rules. |
| **ft-05-03** | **REVISE** | REQUIRED | FIT | Math content all correct; teaser wrongly claims course completion. |
| **ft-05-04** | **REVISE** | REQUIRED | FIT | Math content all correct; teaser re-promises already-taught content. |

### polynomial-rational-analysis (ch1–ch5, gradeLevel 12)

| Lesson | Decision | Visual | Grade lang. | One-line basis |
|---|---|---|---|---|
| pra-01-01 | KEEP | REQUIRED | FIT | RRT candidate-list counts verified correct (8, 6, 8). |
| pra-01-02 | KEEP | REQUIRED | FIT | Factor Theorem evaluations verified correct by hand (7 values checked). |
| pra-01-03 | KEEP | REQUIRED | FIT | Synthetic division, factorization, and multiply-back all verified correct. |
| pra-02-01 | KEEP | REQUIRED | FIT | FTA multiplicity counting incl. x⁴−1 zeros {1,−1,i,−i} verified correct. |
| pra-02-02 | KEEP | REQUIRED | FIT | Conjugate-pair parity and (x²+4)(x−1) expansion verified correct. |
| pra-02-03 | KEEP | REQUIRED | FIT | Sum/product quadratic-building from conjugates verified correct. |
| pra-03-01 | KEEP | REQUIRED | FIT | Degree-gap asymptote classification correctly applied throughout. |
| pra-03-02 | KEEP | REQUIRED | FIT | Long division for 3 rational functions verified correct incl. gap-decay computation. |
| **pra-03-03** | **REVISE** | ESCALATE | FIT | Math error: false hole claim at x=2 for f(x)=(x²−4)/(x−1) in i1 feedback. |
| pra-04-01 | KEEP | REQUIRED | FIT | Sign-chart test points verified correct incl. double-root bounce. |
| pra-04-02 | KEEP | REQUIRED | FIT | Multiplicity shortcut (odd flips/even bounces) verified correct, incl. puncture case. |
| pra-04-03 | KEEP | REQUIRED | FIT | Move-to-zero pipeline verified correct incl. divide-by-variable trap flag. |
| pra-05-01 | KEEP | REQUIRED | FIT | Two-kind-cut sign charts verified correct by hand. |
| pra-05-02 | KEEP | REQUIRED | FIT | Boundary-kind rule verified correct incl. cancelled-factor hole trap. |
| pra-05-03 | KEEP | REQUIRED | FIT | Combine-to-one-fraction pipeline verified correct; genuinely the course's last lesson so its "course complete" teaser is accurate. |

## Implementation contracts for every REVISE

### 1. `ft-05-03` (content/courses/function-transformations/lessons/ft-05-03.json)

**Defect**: step `r1` (recap), field `teaser`, currently reads:
> "Course complete! Next course: numbers beyond the real line — complex numbers."

This is false: `course.json`'s `ch5-inverse-functions.lessonIds` is `["ft-05-01","ft-05-02","ft-05-03","ft-05-04"]`,
so `ft-05-04` ("Building the Undo Machine") is still to come.

**Root cause**: `ft-05-04` appears to have been added after `ft-05-03` was already authored as the
chapter/course finale, without updating either teaser to match the final `course.json` order.
`ft-05-02`'s existing teaser ("Next: what inverses look like on a GRAPH — and a test for when one
exists.") already correctly points at `ft-05-03`'s content, so the intended fix is to leave
`course.json`'s lesson order unchanged and only correct the two stale teasers.

**Fix** (owned file: `ft-05-03.json` only):
- Replace `steps[].id == "r1"` → `teaser` with a forward pointer to `ft-05-04`'s actual content, e.g.:
  `"Next: one more hands-on round — building the undo machine step by step, then the course wraps."`
- Do not touch `takeaways` or `body` (unaffected).

### 2. `ft-05-04` (content/courses/function-transformations/lessons/ft-05-04.json)

**Defect**: step `r1` (recap), field `teaser`, currently reads:
> "Next: which machines can be reversed at all — the horizontal line test, and what goes wrong when
> two inputs share an output."

This exact content (horizontal line test, two-inputs-share-an-output) was already taught in `ft-05-03`
(k3 step), which precedes `ft-05-04` in `course.json`'s lessonIds order. The teaser describes content
as "next" that the learner has already completed.

**Fix** (owned file: `ft-05-04.json` only):
- Replace `steps[].id == "r1"` → `teaser` with the course-completion message that `ft-05-03` incorrectly
  carries today, since `ft-05-04` is the true final lessonId in `ch5-inverse-functions` (and in the
  course), e.g.:
  `"Course complete! Next course: numbers beyond the real line — complex numbers."`
- Do not touch `takeaways` or `body` (unaffected).

Net effect of contracts 1+2: the two teaser strings are swapped between the two lessons, with no
change to `course.json`, no change to any exercise, widget, or math content in either file.

### 3. `pra-03-03` (content/courses/polynomial-rational-analysis/lessons/pra-03-03.json)

**Defect**: step `i1` (`graphZoom` widget), field `successFeedback`, currently reads:
> "A vertical asymptote at x = 1: the denominator vanishes but the numerator does not, so the two sides
> fly apart. Compare that with x = 2, where BOTH vanish and the break is a removable hole instead —
> same-looking equation, different behaviour."

The widget's own prompt fixes f(x) = (x² − 4)/(x − 1). At x = 2 the denominator (x − 1) = 1 ≠ 0, so
the denominator does **not** vanish there — x = 2 is simply the x-intercept (f(2) = 0), a fact this
same lesson's `k3` step states correctly ("x = 2 is where f itself is 0 (the x-intercept)"). There is
no common factor between x² − 4 and x − 1, so f has no hole anywhere. The claim directly contradicts
verifiable arithmetic and contradicts the lesson's own later step.

**Fix** (owned file: `pra-03-03.json` only): replace the second sentence of `successFeedback` with an
accurate contrast that keeps the VA-vs-hole pedagogical point without misdescribing this specific f,
e.g.:
> "Compare that with a function where a factor is shared by BOTH the top and bottom at the same
> input — there the two sides would meet at a removable hole instead of flying apart, even though the
> equation looks just as broken at that point."
- Alternatively, if a concrete side-by-side example is preferred, cite a genuinely different function
  such as f(x) = (x² − 4)/(x − 2) (hole at (2, 4), since (x−2) cancels), being explicit that it is a
  *different* function from the one in this widget's prompt.
- No change needed to `k3` (already correct) or to any other step.

## Notes on scope guardrails honored

- No `npm`/`vitest`/`tsc` was run.
- Read-only on `content/`; only `reports/closure/cowork-staging/laneB-s319-ft-pra-dispositions.jsonl`
  and this report were written.
- Known-context items honored: ft-03-02's previously-withheld figure was confirmed cleared by S318 and
  not re-flagged; no polynomial-rational-analysis choice-parity item from the S308 repair was re-flagged
  (none of the reviewed MCQ/buildExpression items showed a parity regression); mcq/predict/lab-choice
  shuffle mechanics were not treated as a defect surface (out of lesson-JSON scope, per S316).
- All 54 distinct figure IDs referenced by the two courses were cross-checked against `src/` and each
  resolves to at least one implementation reference (no missing promised visuals found).
