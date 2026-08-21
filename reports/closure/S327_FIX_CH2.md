# S327 Fix Packet CH2 — 24 CHOICE_SURFACE_INTEGRITY rows (mcq-leakage option-surface tells)

Fixer: cowork-s327-CH2-fixer. Date: 2026-08-21T10:26Z.

Scope: the 24 CHOICE_SURFACE_INTEGRITY queue rows (`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, status
`OPEN_STEM_OPTION_AND_VISUAL_REVIEW`) whose `lesson_id` falls in this fixer's assigned lane —
work_ids CHOICE-0003/0004/0005/0007/0008/0009/0010/0011/0012/0014/0022/0028/0029/0030/0031/0032/
0033/0043/0045/0047/0048/0049/0057/0058, one MCQ step per lesson, across 22 courses. Each row was
raised by `scripts/audit/mcq-leakage.mts` — the leak detector documented there under one of five
named tells. All 24 rows in this lane carry one of three tells: `length-prose-vs-prose` (the
correct option is markedly longer than every distractor and both are prose), `length-answer-
explains-itself` (the correct option alone appends a dash-explanation clause, e.g. "X — because
Y"), or `only-option-with-a-unit` (the correct option alone matches the detector's unit regex).
Files touched: only the 24 lesson JSONs listed below, one MCQ step each. No src/**, scripts/**,
the ledger, or other staging files.

## Method

`scripts/audit/mcq-leakage.mts` cannot be run directly under this packet's constraints (no
npm/vitest/tsc — the container is 2-CPU and shared with 15 sibling agents). Its `leaks()` function
was instead replicated verbatim as a node one-off (`ABSOLUTE`/`QUALIFIER` regexes, the length gate
`answer.length > longestWrong*1.5 && answer.length - longestWrong >= 12`, the `dashExplained`
sub-classifier, and the unit/numeric/grammar/absolutes checks, byte-for-byte from the source file).
Run against all 24 steps BEFORE any edit, it reproduced every one of the 24 CSV `mismatch_evidence`
strings exactly (same tell code, same "N chars vs longest distractor M" / same matched substring)
— confirming the replica is faithful before it was trusted to sign off the fixes. Run again AFTER
all edits, all 24 steps report zero leaks. Every touched file was also re-parsed with `JSON.parse`
post-edit (24/24 OK) and diffed (`git diff --stat`): each file shows only the option-label lines
touched, insertions == deletions per file, confirming no structural change.

Repair policy applied throughout, per the fixer brief: for `length-prose-vs-prose`, distractors
were extended with misconception detail already present in their own `feedback` field (never
invented) until the correct option was no longer the length outlier — never by trimming the
correct option's mathematical content. For `length-answer-explains-itself`, the dash-clause was
stripped from the correct option's label back to a bare answer matching the distractors' style,
with the dropped reasoning confirmed already present (or made explicit) in that option's own
`feedback`, so no pedagogical content was lost — this simultaneously resolves the length gate
since the bare label is short. For `only-option-with-a-unit`, both instances were false positives
of the detector's unit regex (`\d\s+in\b` matching the word "in" as a preposition, not the unit
"inches") — the label was reworded to remove the false trigger while preserving the exact claim.
In every case the correct answer's identity, `correct: true`/`false` flags, and all `feedback`
text were left semantically intact; only option `label` text was edited (plus two `feedback`
touch-ups that fold back in a fact removed from a label, noted inline below).

---

## 1. gf-01-01 / k1 — length-prose-vs-prose (CHOICE-0028)

Prompt: "Why does geometry leave point, line, and plane UNDEFINED?"
Before: correct 77 chars vs longest distractor 46 ("Nobody has found good definitions for them yet").
Fix: extended all three distractors with the misconception detail their `feedback` already argues
against — "Nobody has discovered good definitions for these three yet" (58), "They are too simple
and obvious to need proof" (45), "They can only be understood once coordinates are introduced" (59).
After: 77 vs longest 59 (77 ≤ 59×1.5 = 88.5) — clean.

## 2. gf-04-02 / i2 — length-answer-explains-itself (CHOICE-0029)

Prompt: "How many lines of symmetry does a circle have?"
Before: correct "Infinitely many — every line through the center" (47) vs bare numeric distractors
"1"/"2"/"360" (max 3).
Fix: stripped the dash-clause from the label — the option's `feedback` ("Any diameter folds the
circle onto itself...") already carries that reasoning in full, so nothing was lost — leaving bare
"Infinitely many" (15). Extended the three numeric distractors with the misconception detail
already in their own feedback: "Just 1, the line you can see drawn" (24), "2, one vertical and one
horizontal" (34), "360, one line for every degree" (30).
After: 15 vs longest 34 — dash pattern now absent from every option, no length outlier either way.

## 3. gf-05-01 / i1 — length-prose-vs-prose (CHOICE-0030)

Prompt: "Which of these is NOT a rigid motion?"
Before: correct "a dilation with scale factor 2" (30) vs longest distractor "a translation" (13).
Fix: extended the three rigid-motion distractors with their defining action, matching what their
feedback already says — "a translation, sliding the figure sideways" (42), "a rotation about the
center point" (33), "a reflection across a mirror line" (33).
After: 30 vs longest 42 — correct is now the shortest option; no outlier.

## 4. avp-02-02 / k3 — length-prose-vs-prose (CHOICE-0004)

Prompt: "Graphically, why does |x| = −2 have no solutions?"
Before: correct 69 chars vs longest distractor 37 ("Because −2 is not an integer distance").
Fix: extended both distractors — "The V is too narrow near the top to ever reach that low" (55),
"Because −2 isn't a whole-number distance from zero" (62).
After: 69 vs longest 62 (69 ≤ 62×1.5 = 93) — clean.

## 5. avp-03-01 / k3 — length-prose-vs-prose (CHOICE-0005)

Prompt: "Why must the conditions of a piecewise rule never overlap?"
Before: correct 74 chars vs longest distractor 48.
Fix: extended both wrong-reason distractors without changing the misconception each represents —
"Because overlapping conditions are hard to write without care" (61), "Because the formulas would
have to be identical in every piece" (62).
After: 74 vs longest 62 (74 ≤ 62×1.5 = 93) — clean.

## 6. co-03-02 / k3 — length-prose-vs-prose (CHOICE-0007)

Prompt: "How does the hyperbola's focus rule differ from the ellipse's?"
Before: correct 48 chars vs longest distractor 31.
Fix: extended both distractors with content already in their feedback — "They use the exact same
formula for both conics" (47), "Hyperbola has no foci at all, unlike the ellipse" (48).
After: 48 vs longest 48 — tied, no outlier.

## 7. co-04-03 / k2 — length-prose-vs-prose (CHOICE-0008)

Prompt: "Which conic does NOT require dividing to make the right side equal 1?"
Before: correct "the parabola (only one squared term)" (36) vs longest bare distractor
"the hyperbola" (13).
Fix: extended "the ellipse"/"the hyperbola" with their genuine standard-form structure, matching
the parenthetical style of the correct option and the content already in their feedback —
"the ellipse (two squared terms, both positive)" (46), "the hyperbola (two squared terms, one
negative)" (47).
After: 36 vs longest 47 — correct no longer the outlier.

## 8. iar-02-02 / k1 — length-prose-vs-prose (CHOICE-0031)

Prompt: "How is a region's corner computed?"
Before: correct 47 chars vs longest distractor 28.
Fix: extended both distractors — "Average the two lines' y-intercepts together" (44), "Test random
points until one of them works" (42).
After: 47 vs longest 44 (47 ≤ 44×1.5 = 66) — clean.

## 9. iar-02-03 / k2 — length-answer-explains-itself (CHOICE-0032)

Prompt: "(5, 3) is outside x ≥ 0, y ≥ 0, x + y ≤ 6. Which fence broke?"
Before: correct "x + y ≤ 6 — the sum is 8" (24) vs bare "x ≥ 0"/"y ≥ 0" (5 each).
Fix: stripped the dash-clause to bare "x + y ≤ 6" (9), matching the bare-inequality style of both
distractors. The dropped "sum is 8" fact was folded into the option's `feedback`, which now reads
"Both individual signs pass (5 ≥ 0, 3 ≥ 0); the total 5 + 3 = 8 is what breaks this fence." (was:
"Both signs pass; the total is what's over the line.") — so the arithmetic fact is preserved, just
relocated to where a learner reads it after committing.
After: 9 vs longest 5 (ratio 9 > 5×1.5 = 7.5 is true, but margin 9 − 5 = 4 < 12, so the detector's
AND-gate does not fire) — clean; dash pattern absent from every option.

## 10. asv-01-03 / k3 — length-prose-vs-prose (CHOICE-0003)

Prompt: "For fixed height and two DIFFERENT base lengths, why does the trapezoid formula average
the bases instead of using just one?"
Before: correct 112 chars vs longest distractor 60.
Fix: extended both distractors with detail already in their feedback — "Because using only one
base is always close enough for practical purposes" (73), "Averaging is just a simplification with
no real geometric meaning behind it" (75).
After: 112 vs longest 75 (112 ≤ 75×1.5 = 112.5) — clean.

## 11. cpr-02-03 / k2 — length-prose-vs-prose (CHOICE-0009)

Prompt: "Why do we subtract the 40 when we add the bus row (100) to the sport column (110)?"
Before: correct 80 chars vs longest distractor 53.
Fix: extended all three distractors with the specificity already in their feedback — "Because
those 40 students actually belong to neither event at all." (66), "To make the final probability
come out under 1, as it must." (59), "Because the bus row and the sport column have different
totals." (63).
After: 80 vs longest 66 (80 ≤ 66×1.5 = 99) — clean.

## 12. dm-02-02 / ch1 — only-option-with-a-unit (CHOICE-0010)

Prompt: "Dataset A has r = 0.8. Dataset B has r = −0.95. Which has the STRONGER linear
relationship?"
Before: correct label "Dataset B — 0.95 in magnitude beats 0.8" false-matched the detector's unit
regex `\d\s+in\b` — "0.95 in" reads as digit-space-"in"-boundary, the same shape as "5 in" (5
inches), even though "in" here is the preposition in "in magnitude". No distractor contained that
shape.
Fix: reworded to "Dataset B — magnitude-wise, 0.95 beats 0.8" (42 chars) — identical claim, no
digit immediately followed by the standalone word "in". Mathematical content, correctness, and
feedback unchanged.
After: no option matches the unit regex — absent from all. Lengths (42/45/46/50) show no outlier
either.

## 13. esn-03-03 / k3 — length-prose-vs-prose (CHOICE-0011)

Prompt: "Which is bigger: 3.1 × 10⁶ or 7.5 × 10⁶?"
Before: correct 58 chars vs longest distractor 37.
Fix: extended two distractors — "3.1 × 10⁶, since it appears first in the question" (49), "Can't
tell — you would need standard form first" (47) — and lightly extended "They're equal" → "They're
equal in value" (22) for consistency; same wrong claims, more fully stated.
After: 58 vs longest 49 (58 ≤ 49×1.5 = 73.5) — clean.

## 14. ev-01-01 / k3 — length-prose-vs-prose (CHOICE-0012)

Prompt: "Which of these is a random VARIABLE, not an outcome?"
Before: correct "The number of heads in three flips" (34) vs longest distractor "The sequence HTH"
(16).
Fix: extended both distractors using the distinction already drawn in their feedback — "The
specific sequence HTH observed" (34), "The coin itself, not a number" (29).
After: 34 vs longest 34 — tied, no outlier.

## 15. fg-01-03 / k3 — length-prose-vs-prose (CHOICE-0014)

Prompt: "An upright U-shape (like y = x², opening upward) — does it pass the vertical line test?"
Before: correct 49 chars vs longest distractor 24.
Fix: extended all three distractors using the reasoning already in their feedback — "No — it
curves too much to stay a function" (42), "No — U-shapes never pass the line test" (38), "Only at
the very bottom vertex point" (36).
After: 49 vs longest 42 (49 ≤ 42×1.5 = 63) — clean.

## 16. ft-03-03 / i1 — only-option-with-a-unit (CHOICE-0022)

Prompt: "In y = −2(x − 1)² + 8, which number controls the FLIP?"
Before: correct label "The −2 in front; its negative sign reflects the parabola." false-matched
the unit regex via "2 in front" (digit-space-"in"-boundary). The distractors say "inside"/
"outside", neither of which matches `in\b` (the "in" is followed by a letter, not a boundary), so
only the correct option tripped it.
Fix: reworded to "The leading −2; its negative sign reflects the parabola." (56 chars) — same
claim and feedback, no digit immediately followed by the standalone word "in".
After: no option matches the unit regex — absent from all; lengths (56/50/49/52) show no outlier.

## 17. kcm-01-04 / ch1 — length-prose-vs-prose (CHOICE-0033) — K-language

Prompt: "A learner calls 8 the smaller group when it is paired with 6. Which observation corrects
the error?" (compare-numbers-k — kept strictly K-simple vocabulary throughout.)
Before: correct "8 is the larger group, not the smaller one" (42) vs longest distractor "6 is the
larger group" (21).
Fix: extended all three distractors with equally simple language, and gave the "6 is..." distractor
the same "X, not Y" contrast shape as the correct answer so the answer's structure no longer stands
alone — "They are exactly the same amount" (32), "6 is the bigger group, not 8" (28), "Nobody can
tell which is bigger" (31).
After: 42 vs longest 32 (42 ≤ 32×1.5 = 48) — clean.

## 18. lc-01-03 / k1 — length-prose-vs-prose (CHOICE-0043)

Prompt: "For f(x) = 1/x² as x → 0, the values grow 100, 10 000, 1 000 000, … So lim(x→0) f(x):"
Before: correct "does not exist; values grow without bound" (41) vs longest distractor 27.
Fix: extended both distractors — "approaches 0; the values shrink toward it" (41), "approaches 1;
the values settle near it" (39).
After: 41 vs longest 41 — tied, no outlier.

## 19. les-02-01 / ch1 — length-prose-vs-prose (CHOICE-0045)

Prompt: "Which value of ▢ makes 6x + 1 = 6x + ▢ have NO solution?"
Before: correct "Any number except 1 (like 9)" (28) vs longest distractor "No value can" (12),
with two near-bare distractors "1" and "0 only".
Fix: extended all three — "Just 1, and nothing else" (24), "0 only, no other number" (23), "No
value ever can work" (22) — same wrong claims, fully stated.
After: 28 vs longest 24 (28 ≤ 24×1.5 = 36) — clean.

## 20. mc-05-01 / k3 — length-answer-explains-itself (CHOICE-0047)

Prompt: "A measurement reads 3/8 inch. What is its simplest form?"
Before: correct "3/8 — it's already simplest" (27) vs bare fraction distractors "3/4"/"1/8"/"6/16"
(max 4).
Fix: stripped the dash-clause to bare "3/8" (3), matching every distractor's bare-fraction style.
The option's existing feedback ("3 and 8 share no common factor besides 1...") already states the
reasoning in full, so nothing was lost.
After: 3 vs longest 4 — correct is now the shortest option; dash pattern absent from all.

## 21. nls-01-02 / k3 — length-prose-vs-prose (CHOICE-0048)

Prompt: "A student claims (1, 3) is an intersection of y = x² + 1 and y = 2x + 1. The audit
says…"
Before: correct "On the line, off the curve — rejected" (37) vs longest distractor "Off both —
rejected" (19).
Fix: extended both distractors with descriptive detail, without hinting at which is wrong — "On
both the line and the curve — accepted" (41), "Off both the line and the curve — rejected" (42).
After: 37 vs longest 42 — correct no longer the outlier.

## 22. pf-04-02 / k2 — length-answer-explains-itself (CHOICE-0049)

Prompt: "After grouping, you get x²(x + 4) + 3(x + 2). What does this tell you?"
Before: correct "the grouping failed — the binomials must match" (46) vs short bare-phrase
distractors (max 27).
Fix: stripped the dash-clause to "the grouping failed" (19), matching the short-imperative-phrase
style of "pull out both binomials" / "the polynomial is prime" / "add the binomials: (2x + 6)".
The option's existing feedback ("(x + 4) ≠ (x + 2): no shared factor to pull...") already states
the reasoning in full.
After: 19 vs longest 27 — correct is now the shortest option; dash pattern absent from all.

## 23. sr-05-02 / i2 — length-prose-vs-prose (CHOICE-0057)

Prompt: "Plugging 5 + 10 + 20 + ⋯ into a₁/(1 − r) gives 5/(1 − 2) = −5. What's wrong?"
Before: correct 70 chars vs longest distractor 32.
Fix: extended all three distractors with detail already in their feedback — "Nothing — the sum
really is −5, a negative total" (48), "The arithmetic slipped somewhere in the division step" (53),
"a₁ should be 10, not 5, before applying the formula" (51).
After: 70 vs longest 53 (70 ≤ 53×1.5 = 79.5) — clean.

## 24. ssg2-03-01 / i2 — length-prose-vs-prose (CHOICE-0058) — G2-language

Prompt: "A shape is cut into 3 pieces, but one is bigger than the others. Are these thirds?"
(shapes-shares-g2 — kept simple G2 vocabulary.)
Before: correct "No — thirds must be three equal pieces" (38) vs longest distractor "Yes — there
are 3 pieces" (24).
Fix: extended both distractors — "Yes — there are 3 pieces total" (30), "Yes, close enough in
size" (25).
After: 38 vs longest 30 (38 ≤ 30×1.5 = 45) — clean.

---

## Verification

Node one-off replica of `leaks()` run over all 24 steps, pre- and post-edit:
- Pre-edit: 24/24 rows reproduce their CSV `mismatch_evidence` tell code and detail string exactly.
- Post-edit: 24/24 rows report zero leaks (`=== ALL CLEAN ===`).
- `JSON.parse` on all 24 touched files: 24/24 OK.
- `git diff --stat` on all 24 touched files: every file's insertion count equals its deletion
  count (label/feedback text edits only), confirming no keys, options, or structure were added or
  removed.
- Every fix preserves the option's `id`, its `correct` flag, and the mathematical content of the
  correct answer; only option `label` text was rebalanced (plus the two `feedback` touch-ups noted
  in §9 and, implicitly, nowhere else — every other feedback string is byte-unchanged).
- `scripts/session/print-review-basis.mjs` run against all 24 lesson IDs post-edit: 24/24 resolved
  a `reviewBasisHash`, recorded in `reports/closure/cowork-staging/laneA-s327-CH2.jsonl`.

## Summary

Tell breakdown: 18 `length-prose-vs-prose`, 4 `length-answer-explains-itself`, 2
`only-option-with-a-unit`.

Count: 24 findings dispatched, 24 fixed, 0 blocked, 0 escalated.
