# S323 Fix Packet P4 — evidence log

Fixer: cowork-s323-P4-fixer. Scope: sp-02-01, sp-02-02, sp-02-03, sp-02b-01, sp-02b-02, sp-02b-03 (P0);
g5u-01-02, g5u-01-03, g5u-01-04, g5u-02-02, g5u-03-01, g5u-03-03, g5u-03-04;
bv-02-01, bv-02-02, bv-03-02, bv-05-02.

## sp-02-01 (P0 — LESSON-REVISION-sp-02-01, S320-A3 ESCALATE; PROGRESSION-sp-02-01)

Queue defect: DistributionCompareLabW measure mode rendered `spec.measureChoices` via a raw `.map`
with no seededShuffle; correct choice at a fixed authored index, so position leaked correctness on
all 7 graded measure steps (i1,k1,i2,i3,k2,k3,ch1).

Verification (NO content edit needed — src-side fix already landed):
- `src/components/widgets.tsx:10465-10473` now defines `orderedMeasureChoices` via
  `seededShuffle(spec.measureChoices, "distributionCompareLab:measure:" + (seed ?? values.join("|")))`,
  mirroring the existing judge-mode shuffle; render at `widgets.tsx:10578` maps `orderedMeasureChoices`
  (not `spec.measureChoices`). Committed in a78d6a3.
- Grading is position-independent: `src/lib/evaluate.ts:865-873` keys measure mode strictly off
  `choice.value` vs `spec.answer` (never index), so display-order shuffle is evaluator-safe, exactly
  as the S320-A3 escalation predicted.
- Authored lesson re-checked at current state: 7 measure steps, answers {i1:3@idx1, k1:4@idx1,
  i2:0@idx0, i3:4@idx1, k2:3@idx1, k3:3@idx1, ch1:3@idx1} — every answer value is a member of its
  measureChoices, so post-shuffle grading remains reachable and correct. No other defect found.

PROGRESSION-sp-02-01 (number-normalized prompt repeats k1,i2,i3,k2,k3,ch1): approved with
fluency/retrieval rationale — the lesson is a single-widget measurement lab; each repeat applies the
identical "how many variability-units is the gap" question job to a DIFFERENT authored distribution
pair (distinct gap/MAD data per step: 12/4, 12/3, 0/2, 24/6, 15/5, 15/5-signed, 24/8), which is deliberate
measurement-fluency practice, not duplication; with display-order shuffle now live the repeats carry
no positional shortcut.

Decision: KEEP (no file change; before==after).

## sp-02-02 (P0 — LESSON-REVISION-sp-02-02, S320-A3 ESCALATE; PROGRESSION-sp-02-02)

Queue defect: same measure-mode no-shuffle defect; 3 of 7 graded steps (k1, i3, k3) in measure mode.
Verification (NO content edit): same src-side fix as sp-02-01 (widgets.tsx:10465-10473 seededShuffle,
render line 10578, evaluate.ts:865-873 value-keyed grading, commit a78d6a3). Re-verified at current
state: k1 (50-20)/5=6 ✓, i3 (36-24)/4=3 ✓, k3 (72-48)/6=4 ✓; every answer value is a member of its
measureChoices. The 4 judge-mode steps (i1,i2,k2,ch1) were already display-shuffled by the S243
judge canary and grade by option id. PROGRESSION-sp-02-02 (number-normalized repeat i3,k3): approved
as fluency/retrieval — same measurement question job over distinct data (36/24/4 vs 72/48/6), no
positional shortcut post-shuffle. Decision: KEEP (before==after).

## sp-02-03 (P0 — LESSON-REVISION-sp-02-03, S320-A3 ESCALATE; PROGRESSION-sp-02-03)

Queue defect: same measure-mode no-shuffle defect; 5 of 7 graded steps (i1,i2,i3,k2,ch1) in measure mode.
Verification (NO content edit): same src-side fix. Re-verified: i1 (28-16)/4=3 ✓, i2 (82-80)/8=0.25
with answer 0 tolerance 0.26 (choice value 0 within tolerance; distractors 2 and 8 outside) ✓,
i3 (96-60)/9=4 ✓, k2 (56-32)/8=3 ✓, ch1 (75-45)/10=3 ✓; all answers members of measureChoices.
Judge steps k1,k3 correct-option grading by id, display already shuffled. PROGRESSION-sp-02-03
(repeat i2,i3,k2): approved as fluency/retrieval — distinct data per step incl. the deliberate
near-zero-gap contrast case i2. Decision: KEEP (before==after).

## sp-02b-01 (P0 — LESSON-REVISION-sp-02b-01, S320-A3 ESCALATE)

Queue defect: same measure-mode no-shuffle defect; 1 of 6 graded steps (i2) affected, correct choice
at authored index 1. Verification (NO content edit): same src-side fix (widgets.tsx:10465-10473
seededShuffle of measureChoices, render line 10578, commit a78d6a3; evaluate.ts:865-873 value-keyed
grading). Re-verified: i2 gap 18-12=6, MAD 4, 6/4=1.5 = answer (tol 0.01), member of choices
[2, 1.5, 24, 3] ✓. Other graded steps are numeric/mcq types with existing seeded shuffle (mcq) or
free entry (numeric) — no positional channel. Decision: KEEP (before==after).

## sp-02b-03 (P0 — LESSON-REVISION-sp-02b-03, S320-A3 ESCALATE)

Queue defect: same measure-mode no-shuffle defect; 1 of 6 graded steps (i2) affected. Verification
(NO content edit): same src-side fix. Re-verified: i2 gap 13.2-12.0=1.2, MAD 0.4, 1.2/0.4=3 = answer
(tol 0.01), member of choices [1.2, 3, 0.48, 0.8] ✓. Remaining graded steps numeric/mcq — no
positional channel. Decision: KEEP (before==after).

## sp-02b-02 (P0 — LESSON-REVISION-sp-02b-02, S320-A3 ESCALATE; CHOICE-0077)

Queue defect 1 (LESSON-REVISION): same measure-mode no-shuffle defect; 1 of 6 graded steps (i2)
affected. Verification (no edit needed for this defect): same src-side fix (widgets.tsx:10465-10473,
commit a78d6a3; evaluate.ts:865-873 value-keyed). Re-verified i2: (51-45)/6=1 = answer (tol 0.01),
member of choices [6,1,36,0] ✓.

Queue defect 2 (CHOICE-0077, k3): length-answer-explains-itself — correct option 74 chars vs longest
distractor 41; the correct label also carried its own justification ("could easily come from
sampling luck"), a writing clue.

Content edit (k3.widget.options[*].label only; ids, correct flag, feedback all unchanged):
- BEFORE a (correct, 74): "Not convincing yet — a gap that small could easily come from sampling luck"
- AFTER  a (correct, 41): "The gap is too small to be convincing yet"
- BEFORE c (35): "The two groups are proven identical"
- AFTER  c (41): "The two groups are proven to be identical"
- b unchanged (41): "Group D is definitely higher than Group C"
All three options are now parallel bare claims at 41/41/41 chars — no length leak (1.0x, 0-char gap,
well under the 1.5x/+12 guard) and the justification lives only in the feedback, where it already
existed verbatim. Single defensible answer preserved (a); b/c remain the two misconception claims
(overclaiming a difference / claiming proof of sameness).

Decision: KEEP.

## g5u-01-02 / g5u-01-03 / g5u-01-04 (S322-F10 REVISE — three-way byte-identical duplicate widget)

Contract: g5u-01-02/k1 == g5u-01-03/k2 == g5u-01-04/k2 were byte-identical numeric widgets
("1/2 = ?/6. What number goes on top?", answer 3) under three DIFFERENT conceptTags
(g5u-find-common / g5u-lcd / g5u-rename-both). Fix: give each lesson a distinct item serving its
own conceptTag; widget object only (ids, kind, cml, hints, variant untouched).

- g5u-01-02 k1 (Finding a Common Denominator): BEFORE "1/2 = ?/6" ans 3 → AFTER "1/3 = ?/12. What
  number goes on top?" ans 4 (previewDenominator 12; commonErrors 1 = scaled bottom only, 9 = 12−3
  denominator subtraction; successFeedback "Correct — 4."). Symbolic recap of i1's thirds→twelfths
  bar work; also breaks the pre-existing number-identical overlap with own k3 ("1/2 = ?/6", ans 3).
- g5u-01-03 k2 (The Least Common Denominator): AFTER "For the LCD 12: 1/6 = ?/12. What number goes
  on top?" ans 2 (commonErrors 1 = kept top, 6 = 12−6 subtraction; successFeedback "Correct — 2.")
  — ties the rename directly to the lesson's 1/4 + 1/6 LCD-12 storyline.
- g5u-01-04 k2 (Renaming Both Fractions): AFTER "3/4 = ?/12. What number goes on top?" ans 9
  (commonErrors 3 = kept top, 8 = 12−4 subtraction; successFeedback "Correct — 9.") — distinct from
  own k1 (1/6 ×2, ans 2), k3 (1/4→twelfths repair, ans 3) and ch1 (1/2 = ?/6, ans 3).

Cross-check after edit: JSON.stringify byte-duplicate scan across all numeric widgets of the three
lessons — zero duplicates remain; all answers hand-verified (1/3=4/12, 1/6=2/12, 3/4=9/12).
Incidental: re-serialization normalized g5u-01-03's \uXXXX escapes to literal UTF-8 (parsed JSON
content identical; sibling lesson files already use literal UTF-8).

## g5u-02-02 (S322-F10 REVISE — grammar)

Defect: commonError feedback (k2, convert 5 1/6 → 31/6, error value 30) read "That converted the
wholes but dropped the 1 pieces already in hand."
Fix (one string): "…dropped the 1 piece already in hand." Raw-text replacement; no other change.
The sibling "11 pieces" strings in g5u-02-03/g5u-02-04 are grammatically correct and untouched.

## g5u-03-01 (S322-F10 REVISE — cross-lesson duplicate k3 == g5u-03-03/k1)

Defect: k3 was byte-identical to g5u-03-03/k1 (jug story "Once renamed, a jug holds 3/6 litre and
then 2/6 litre more…", ans 5) — a story item mis-serving this lesson's g5u-benchmark tag.
Fix (k3.widget only): BEFORE jug-story ans 5 → AFTER "7/8 sits just below one whole. How many
eighth-size pieces short of a whole is 7/8?" ans 1, previewDenominator 8, commonErrors 7 (counted
the shaded eighths, not the gap) and 8 (named the piece size; 8/8 − 7/8 = 1/8), successFeedback
tying the 1/8 gap to the lesson's "7/8 estimates as about one whole" benchmark storyline.
Distinct from every other step in the lesson (others are mcq/estimateSlider); the jug story now
lives only in g5u-03-03 where it serves g5u-story. Post-edit byte-compare vs g5u-03-03/k1: differs.

## g5u-03-03 (S322-F10 REVISE — duplicate + grammar)

Defect 1: k1 byte-identical to g5u-03-01/k3 — resolved by rewriting the g5u-03-01 side (above);
k1 kept here because the jug story natively serves this lesson's g5u-story tag and matches its
i1/i2 jug-model steps. Post-edit byte-compare confirms the two widgets now differ.
Defect 2: commonError feedback (k3, 1/6 + 3/6, error value 3 = 1×3) read "Multiplying the counts is
not joining them — 1 pieces and 3 more make 4." Fixed to "1 piece and 3 more make 4." (one string).

## g5u-03-04 (S322-F10 REVISE — grammar)

Defect: same generator bug, different widget (k2, 1/6 + 3/6, error value 3): "…— 1 pieces and 3 more
make 4." Fixed to "1 piece and 3 more make 4." (one string; raw-text replacement).

## bv-02-01 (S322-F8 REVISE — remedial choice-length leak)

Contract: rem-bv0201-k correct option 44 chars vs longest wrong 26 (1.69x, +18). Fix per contract:
labels only, correctness/feedback substance unchanged. Correct label kept; wrong labels lengthened
to parallel spatial claims:
- b: "Along the very top edge" (23) → "Along the very top edge, above all the dots" (43)
- c: "Below every dot" (15) → "Below every single dot, along the bottom edge" (45)
- d: "Through only the first dot" (26) → "Through only the very first dot in the data" (43)
After: correct 44 vs wrongs 43/45/43 — ratio 0.98, gap −1 (well inside the 1.5x/+12 guard). Each
new label preserves its option's meaning and still matches its authored feedback.

## bv-02-02 (S322-F8 REVISE + CHOICE-0007 — k2 choice-length leak)

Contract: k2 correct option 60 chars vs longest wrong 30 (2.0x, +30); CHOICE-0007 flags the same
item (length-prose leak). Fix per contract: shorten the correct option to its essential claim and
lightly extend wrongs; correctness/feedback unchanged:
- a (C): "How far the dots sit from the line overall (their residuals)" (60) → "How far the dots
  sit from the line" (34) — the residuals terminology stays in the feedback where it is taught.
- c: "How steep the line is" (21) → "How steep the fitted line is" (28)
- d: "How long the line is" (20) → "How long the drawn line is" (26)
- b unchanged (30).
After: correct 34 vs wrongs 30/28/26 — 1.13x, +4 gap. One defensible answer preserved.

## bv-03-02 (S322-F8 REVISE — remedial choice-length leak)

Contract: rem-bv0302-k correct option 45 chars vs longest wrong 27 (1.67x, +18). Fix (labels only,
same rebalancing approach as bv-02-01):
- b: "The starting value at x = 0" (27) → "The starting value of y where x equals 0" (40)
- c: "The total cost" (14) → "The total cost of the whole plan added up" (41)
- d: "The value at x = 5" (18) → "The value that y takes when x equals 5" (38)
- a (C) unchanged (45): "The amount y changes for each extra unit of x"
After: 45 vs 40/41/38 — 1.10x, +4 gap. Each wrong label keeps its misconception (intercept / total /
point-value) matching its authored feedback. NOTE: applied as a surgical raw-text replacement on the
HEAD bytes of this mixed-indentation file — final diff is exactly 3 label lines.

## bv-05-02 (S322-F8 REVISE — i1b scatterFit unreachable tolerance)

Contract: i1b fits (1,1),(2,4),(3,9),(4,16) (y=x²) with tolerance 0.5, but the true least-squares
line m=5, b=−5 (on the 0.5-step grid, and exactly the line the successFeedback names) has minimum
MSE=1.0 — success unreachable. Contracted fix (smaller, lower-risk option): raise tolerance only.
- BEFORE: "tolerance": 0.5 → AFTER: "tolerance": 1.05 (just above the true minimum, float-safe,
  matching bv-05-03's tolerance-just-above-minimum pattern).
Post-edit grid search over the full authored (m,b) grid: min MSE = 1.0 at m=5, b=−5 ≤ 1.05 —
success now reachable ONLY at the named best line; residuals +1,−1,−1,+1 and k0b's "two negative"
numeric answer untouched (no other field changed).
