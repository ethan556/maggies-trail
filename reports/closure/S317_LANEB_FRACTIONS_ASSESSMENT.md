# S317 Lane B — Fractions (grade 3) — Independent Assessment

Reviewer: Claude Cowork independent assessor (fractions S317)
Scope: content/courses/fractions/course.json + all 15 lessons in
content/courses/fractions/lessons/. Read-only; dispositions staged to
reports/closure/cowork-staging/laneB-fractions-dispositions.jsonl.

Obeyed `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte: the repository source is
authoritative, the ChatGPT Work cache is evidence only, and this packet does not approve its own
implementation work (no implementation was performed — this is an independent read-only review).

## Course summary

15 lessons across 4 chapters (What's a Fraction?; Fractions on the Number Line; Equivalent
Fractions; Comparing Fractions). course.json declares `gradeLevel: 3`. All 15 lessons and
course.json were read in full. Every `figure` key referenced by a step (16 distinct figure IDs)
was confirmed registered in the figure-ID map in `src/components/figures.tsx`, and the
SVG-producing component for each was read to compare its hardcoded numbers against the prose of
every step that cites it. Every `commonError`/`commonEntries`/`commonPlacements`/`commonBuilds`/
`commonFractions` arithmetic claim, every `fractionCompare`/`fractionEntry`/`numeric` answer, and
every `predict.outcomeId` was independently recomputed (spot-checked by hand for every lesson;
`fractionCompare` answers additionally verified programmatically across all three instances). All
45 `mcq` widgets' option label lengths were checked programmatically for a correct-option-is-longest
pattern. All widget `prompt` strings were checked programmatically for cross-lesson or
within-lesson duplication.

**Decisions: 9 KEEP, 6 REVISE, 0 ESCALATE.**

## Finding 1 (P0) — ILLUSTRATION_REPLACEMENT: a comparison figure was built for one lesson and reused, unedited, in another

Chapter 4 ("Comparing Fractions") has three lessons that each introduce a *specific* worked
numeric example in their opening concept step (`c1`) and then reuse a *fixed-number* SVG figure
that is expected to render that exact example:

| Lesson | `c1` prose says | Figure (`frac-compare-*`) actually renders | Verdict |
|---|---|---|---|
| fr-04-01 | "5/8 vs 3/8 of one cake" | `frac-compare-same-denom` → **2/5 vs 3/5** | mismatch |
| fr-04-02 | "2/3 vs 2/8" | `frac-compare-same-numer` → **1/3 vs 1/4** | mismatch |
| fr-04-03 | "1/3 is a three-person split; 1/4 is a four-person split" | `frac-compare-same-numer` → **1/3 vs 1/4** | **match** |

The `frac-compare-same-numer` figure (`FracCompareSameNumer` in `src/components/figures.tsx`,
hardcoded to shade 1 of 3 parts vs 1 of 4 parts) was clearly authored to match fr-04-03's own
worked example — and it does, exactly, in both of fr-04-03's occurrences (`c1` and `c2`). But the
identical figure ID is also used in fr-04-02's `c1`, where the prose has already moved on to a
different worked pair (2/3 vs 2/8, also correctly implemented in fr-04-02's own `k1`
`fractionCompare` widget) that the figure never shows. The same pattern hits fr-04-01: its `k1`
`fractionCompare` widget correctly implements the cake example the `c1` prose describes (3/8 vs
5/8), but the `c1` figure `frac-compare-same-denom` (`FracCompareSameDenom`, hardcoded to 2/5 vs
3/5) renders a pair from neither this lesson's prose nor its own widget. In every one of these
three lessons, the second concept step (`c2`) that reuses the same figure is written generically
(no specific number is asserted), so only the `c1` occurrence is unsynchronized — this is the same
"first-introduction-drafted-independently, second-occurrence-deferred-to-the-figure" pattern the
place-value (S316) and fractions-deeper-g3 (S299) assessments found in this codebase. Verified by
reading `figures.tsx`'s source directly, not just the figure-ID string.

A related, milder case: fr-04-04's `c1` gives a specific worked example — "1/2 of a blueberry is
far less berry than 1/4 of a watermelon" (two *different* fraction names on two different
objects) — but its figure `frac-compare-wholes` (`FracCompareWholes`) renders a different claim:
the *same* fraction (1/2) on a small whole versus a big whole. The figure still serves the
lesson's general theme (comparisons require matching wholes) but never renders the two distinct
fraction names the prose just used, so the specific relationship promised in text is not the one
on screen.

All four affected lessons (fr-04-01, fr-04-02, fr-04-04) are marked REVISE with
`visualDecision: REQUIRED`. fr-04-03 — the lesson the shared figure was actually built for — is
KEEP.

Every other figure in the course was confirmed correctly synchronized with its adjacent prose in
every occurrence, including the ones that reuse a single figure ID generically across two concept
steps without asserting a conflicting specific number (`frac-numline-fourths`, `frac-numline-unit`,
`frac-top-bottom`, `frac-unit-fourth`/`frac-unit-third`, `frac-equiv-numline`, `frac-equiv-half`).

## Finding 2 — isolated MCQ correct-option length-leak (not systemic in this course)

Across the course's 45 `mcq` widgets, the correct option is the single longest label in 14/45
(31%) — close to the ~25–33% chance baseline for 3–4-option MCQs, and far below the 64% found in
the place-value (S316) course. This course does **not** show the systemic pattern. However, four
individual instances have a length gap of 10+ characters between the correct option and the
next-longest distractor, where the correct option is written as a self-justifying explanation
while distractors stay terse:

| Lesson | Step | Correct option (len) | Next-longest distractor (len) | Gap |
|---|---|---|---|---|
| fr-03-01 | k3 | "The pieces are different sizes — two fourths together cover exactly one half" (76) | 54 | 22 |
| fr-02-04 | rem-nb-k | "2 wholes and one more half-jump" (31) | 15 | 16 |
| fr-04-04 | rem-sw-k | "Not fairly — the wholes are different sizes" (43) | 27 | 16 |
| fr-02-01 | k3 | "So each landing spot's name tells its true distance from 0" (58) | 44 | 14 |

Each of these four lessons is marked REVISE for this reason (unless already REVISE for Finding 1).
This is a content-authoring parity defect (option-label construction), fixable by shortening the
correct option or lengthening distractors to equalize label length, without changing which option
is correct.

## Finding 3 — "mixed number on exact whole-number quotient" defect class: absent

The task instructions flag a known defect class already repaired in `fractions-deeper-g3`: using
"mixed number" terminology on an exact whole-number quotient (e.g. calling `8/4` a mixed number
when it equals a clean `2`). This course was checked specifically for that pattern:

- The string "mixed number" does not appear anywhere in `content/courses/fractions/lessons/*.json`.
- The one occurrence of the bare word "mixed" (fr-04-01, step `i2`, `predict.options[2].id`) is an
  unrelated option identifier ("mixed" labeling the pair "2/5 and 4/5" in a benchmark-prediction
  question), not fraction-form terminology.
- fr-03-03 ("Whole Numbers in Disguise") is this course's fraction-as-division content and its
  primary home for exact whole-number quotients (`6/3=2`, `8/4=2`, `10/5=2`, `12/4=3`,
  `12/6=2`). Every one of these is presented as a plain whole-number equality ("8/4 = 2", "Twelve
  fourth-jumps... three wholes, on the nose") — never as a mixed number. This course does not
  exhibit the defect class.

## Duplication check (no defect)

No widget `prompt` string is reused anywhere in this course — checked programmatically across all
15 lessons' primary and remedial steps. Numbers vary lesson-to-lesson and step-to-step; every
lesson's remedial re-teaches its concept tag with fresh numbers distinct from the lesson's primary
steps (e.g. fr-01-01's remedial pie problem never reuses the primary lesson's bar/ribbon/sandwich
numbers).

## Grade-language check (no defect)

course.json declares `gradeLevel: 3`. Vocabulary and metaphors ("fairness inspector," "cuts vs.
pieces trap," "unit fraction," "trade rule," "whole numbers in disguise," "referee's toolkit," "of
WHAT?") are consistently concrete, playful, and read-aloud-appropriate for grade 3 throughout all
15 lessons, while still using the precise mathematical terms (numerator, denominator, equivalent,
unit fraction) the course exists to teach. No lesson uses vocabulary or sentence complexity outside
that band. `gradeLanguageDecision: FIT` for all 15 lessons.

## Choice-surface / shuffle status (no defect)

This course uses no `*Lab`-style widget type from the S316 lab-choice-shuffle sweep
(`proportionalReasoningLab`, `percentChangeLab`, `placeValueTransformLab`, etc.) — its widget
inventory is `mcq`, `numeric`, `slider`, `matchPairs`, `fractionBar`, `fractionEntry`,
`dragBucket`, `tapDiagram`, `steppedReveal`, `numberLinePlace`, `fractionCompare`, `dragOrder`,
`lengthCompare`, and `buildExpression`. All `mcq` and `predict` blocks render through the already
seeded-shuffled `McqW`/`predict` paths per the documented convention; authored correct-first order
in the JSON source is not a defect. `dragBucket`, `matchPairs`, `dragOrder`, and `buildExpression`
are drag/match/build/order interactions, not linear pick-one selections, so authored-order position
bias does not apply the same way; their `missFeedback`/`successFeedback`/pair-error text was
checked for accuracy in every instance and found correct.

## Per-lesson verdicts

| Lesson | Decision | Visual | Language | Key reason |
|---|---|---|---|---|
| fr-01-01 | KEEP | SUFFICIENT | FIT | Figures match prose in both occurrences; no other defects |
| fr-01-02 | KEEP | SUFFICIENT | FIT | Generic unit-fraction figures, no numeric conflict |
| fr-01-03 | KEEP | SUFFICIENT | FIT | Figures match; veggie-tray arithmetic verified |
| fr-01-04 | KEEP | SUFFICIENT | FIT | Generic num/denom figure; no numeric conflict |
| fr-02-01 | REVISE | SUFFICIENT | FIT | k3 length-leak (14-char gap) |
| fr-02-02 | KEEP | SUFFICIENT | FIT | Figure matches both occurrences; no other defects |
| fr-02-03 | KEEP | SUFFICIENT | FIT | Figure matches (3/4 mark); water-stop math verified |
| fr-02-04 | REVISE | SUFFICIENT | FIT | rem-nb-k length-leak (16-char gap) |
| fr-03-01 | REVISE | SUFFICIENT | FIT | k3 length-leak (22-char gap, largest in course) |
| fr-03-02 | KEEP | SUFFICIENT | FIT | Figure matches both occurrences; trade math verified |
| fr-03-03 | KEEP | SUFFICIENT | FIT | Figure matches; whole-number-quotient defect class checked and absent |
| fr-04-01 | REVISE | REQUIRED | FIT | c1 prose (5/8, 3/8) doesn't match `frac-compare-same-denom` figure (2/5, 3/5) |
| fr-04-02 | REVISE | REQUIRED | FIT | c1 prose (2/3, 2/8) doesn't match `frac-compare-same-numer` figure (1/3, 1/4) — figure belongs to fr-04-03 |
| fr-04-03 | KEEP | SUFFICIENT | FIT | c1/c2 prose (1/3, 1/4) is the pair the shared figure was built for |
| fr-04-04 | REVISE | REQUIRED | FIT | c1 prose (1/2 blueberry, 1/4 watermelon) doesn't match `frac-compare-wholes` figure (1/2 vs 1/2); rem-sw-k length-leak |

## Implementation contracts for each REVISE

**fr-02-01** — `k3`: shorten the correct option's justification clause (or lengthen the three
distractors) so no option is more than a few characters longer than the next-longest. Do not
change which option is correct, its feedback text, or any other step.

**fr-02-04** — `rem-nb-k` (in `remedials[0].check`): shorten the correct option "2 wholes and one
more half-jump" (or lengthen the two distractors "At the number 5" / "Before 1") to close the
16-character gap. Do not change the correct answer or feedback text.

**fr-03-01** — `k3`: shorten the correct option "The pieces are different sizes — two fourths
together cover exactly one half" (or lengthen the distractors, the longest of which is 54 chars)
to close the 22-character gap, the largest found in this course. Do not change the correct answer
or feedback text.

**fr-04-01** — `c1`: either (a) rewrite `c1`'s body to describe the pair `2/5 vs 3/5` (matching the
existing `frac-compare-same-denom` figure and its "3/5 > 2/5" caption), which would require also
updating `k1`'s `fractionCompare` widget (currently 3/8 vs 5/8) to keep the lesson internally
consistent, or (b) preferred: replace the figure reference for `c1` with a fixed figure hardcoded to
3/8 vs 5/8 (or parametrize `FracCompareSameDenom`), leaving `k1`'s widget and all prose untouched.
Prefer option (b) — smaller diff, and it fixes the root cause (a non-parametrized "example" figure
being reused across lessons) rather than chasing it lesson by lesson. No other step, answer, or
feedback text changes.

**fr-04-02** — `c1`: same choice as fr-04-01. Either rewrite `c1`'s prose to the pair `1/3 vs 1/4`
(and update `k1`'s `fractionCompare` widget, currently 2/3 vs 2/8, to match — a larger, riskier
edit since `i1`'s slider and the `i2` `matchPairs` widget are also built around the "bigger
pieces" theme with several different pairs), or preferred: give `c1` its own figure hardcoded to
2/3 vs 2/8, distinct from `frac-compare-same-numer` (which stays exactly as-is for fr-04-03, whose
own `c1`/`c2` already match it). Prefer the new-figure route to avoid touching fr-04-02's widget
content, which was independently verified correct.

**fr-04-04** — `c1`: either rewrite the prose's specific example so it names one fraction on two
differently-sized wholes (matching `frac-compare-wholes`'s actual "1/2 of a small whole vs 1/2 of
a big whole" content — e.g. "1/2 of a blueberry vs 1/2 of a watermelon"), or give `c1` a new figure
that renders two *different* fraction names (1/2 and 1/4) on two objects of visibly different size.
Prefer rewriting the prose (smaller diff; the figure's current same-fraction/different-whole
framing is arguably the clearer illustration of "the name matches, the amount doesn't," which is
exactly this lesson's point). Separately, `rem-sw-k` (in `remedials[0].check`): shorten the correct
option "Not fairly — the wholes are different sizes" (or lengthen the distractors) to close the
16-character length gap. Both fixes are independent and can land in the same or separate diffs.

## Untouched / out of scope

No figure ID, widget `type`, evaluator, generator (`variant.gen`/`variant.form`), CML block, or
remedial structure was modified or is recommended for structural change — every REVISE above is a
prose-text or option-label wording fix within the existing lesson JSON schema. No queue, ledger,
cache, or course.json write is in scope for this packet; this document and the staged NDJSON
dispositions are the complete output.
