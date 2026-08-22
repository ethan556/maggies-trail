# S320-A4 — Independent Assessment: `decimal-operations`, `decimals-place-value`, `exponents-scientific-notation`

Independent Cowork assessment of three complete courses — `content/courses/decimal-operations`
(15 lessons), `content/courses/decimals-place-value` (12 lessons), and
`content/courses/exponents-scientific-notation` (15 lessons), 42 lessons total. Every lesson JSON
and all three `course.json` files were read in full (all lessons re-read a second time, fresh,
after a mid-session context compaction, to eliminate any risk of relying on stale memory). Every
decimal add/subtract/multiply/divide operation (place alignment, carries, borrows), every
scientific-notation conversion, and every exponent-law application named in any
prompt/widget/commonError/feedback/hint/explanation/reveal string was recomputed by hand. Two
programmatic scans supplemented manual reading: an exact-duplicate/option-length-parity scanner
across all 42 lessons, and a hint/explanationVariants-vs-widget-number mismatch scanner. Read-only
on all content; the only writes are this report and the disposition NDJSON at
`reports/closure/cowork-staging/laneB-s320-A4-dispositions.jsonl`.

This report was produced starting from `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the cache
is evidence only, nothing here approves its own work, and this packet does not touch the ledger.

## Special task: CHOICE-0050 / decimals-place-value progression-root re-audit

The S244 handover reserved five specific read-only candidates for re-audit against current source:
choice item **CHOICE-0050** (`dpv-01-02`/`k2`) and progression roots **dpv-01-03, dpv-02-02,
dpv-03-01, dpv-04-01, dpv-04-02**. All six were re-read fresh and hand-verified in this review.
Findings:

- **Hash drift: none.** All five progression-root lessons' current `reviewBasisHash` values
  (computed via `node scripts/session/print-review-basis.mjs`) match S244's recorded hashes
  exactly — the source bytes have not changed since S244's evidence was gathered.
- **CHOICE-0050 (`dpv-01-02`/`k2`) — CONFIRMED, REVISE.** The mcq "In the number 0.375, which
  digit is in the THOUSANDTHS place?" has correct option (a) `"5 — the third place after the
  point"` at 35 characters vs. distractors at 18/22/20 characters (measured with
  `String.prototype.length`, not estimated). The correct answer is markedly more elaborated than
  any distractor — a label-length/verbosity parity leak, matching S244's original flagged concern.
  Still present, unresolved. See fix below.
- **dpv-01-03 — re-audited, KEEP.** No defect found on independent re-read (ladder ×10/÷10 shift
  math, all hand-verified correct).
- **dpv-02-02 — re-audited, REVISE, but for a DIFFERENT reason than S244 flagged it.** S244
  reserved this lesson as a progression root (prerequisite-chain integrity), and that concern is
  not contradicted here — but this independent content re-audit surfaces a genuine, previously
  unflagged defect: step `i1`'s hints/explanationVariants describe a stale `"0.28"` / digit-`"8"`
  example that does not match the step's actual `hundredthsGrid` target (20 hundredths = 0.20).
  This is a real, code-level content bug S244's progression-integrity evidence did not check for
  (see REVISE list below) — an important divergence to flag explicitly per this task's
  instructions.
- **dpv-03-01 — re-audited, KEEP.** No defect found (place-by-place comparison math, all correct).
- **dpv-04-01 — re-audited, KEEP.** No defect found (round-to-whole math, all correct).
- **dpv-04-02 — re-audited, KEEP.** No defect found (round-to-any-place/decider-digit math, all
  correct).

Net effect on dispositions: 1 of 6 candidates (CHOICE-0050) confirmed exactly as originally
flagged; 4 of 6 (the non-`dpv-02-02` progression roots) confirmed clean with no drift and no new
defects; 1 of 6 (`dpv-02-02`) is REVISE, but from an independently-found content bug unrelated to
the original progression-root rationale, not a confirmation of that original concern.

## Result counts

- `decimal-operations`: 15 lessons reviewed — **12 KEEP, 3 REVISE**, 0 ESCALATE.
- `decimals-place-value`: 12 lessons reviewed — **7 KEEP, 5 REVISE**, 0 ESCALATE.
- `exponents-scientific-notation`: 15 lessons reviewed — **9 KEEP, 6 REVISE**, 0 ESCALATE.
- Combined: 42/42 lessons signed, **28 KEEP / 14 REVISE / 0 ESCALATE**.

`visualDecision` is REQUIRED for 39 of the 42 lessons, whose core interactive widget is itself the
mathematical visual (`columnCalc`, `areaModel`, `numberLinePlace`/`numberLineHop`,
`quotientReasoningLab`, `moneyBoard`, `probabilityArea`, `placeValueTransformLab`,
`hundredthsGrid`, `quadraticExplore`, `volumeBuilder`, `estimateSlider`, `dragOrder`, `matchPairs`,
`exactNumberLab`), and SUFFICIENT for the remaining 3 lessons built only from symbolic widgets
(`numeric`/`mcq`/`buildExpression`/`evalOrder`) plus a static supporting figure —
`dop-01-01`, `dop-01-03`, and `esn-01-01`. None of the 14 REVISE findings involve a broken,
missing, or mismatched visual — every figure sampled against `src/components/figures.tsx` renders
the quantities its concept text names, and every REVISE is a text-content defect (feedback, hint,
or option-label bug), so no lesson needed ESCALATE on either axis. `gradeLanguageDecision` is FIT
for all 42 lessons — no grade-level language issues were found in any lesson across all three
courses.

## REVISE list — precise implementation contract per lesson

### `decimal-operations` / `dop-01-02` — k3 exactNumberLab: incoherent/wrong numericError

Step `k3` ("What is (9 − 3) ÷ 2?") `numericErrors[0]` has `value: 8` with feedback: *"8 ignores the
parentheses (that's 9 − 3÷2 = 9 − 1.5... no). Group first: 9 − 3 = 6, then 6 ÷ 2 = 3."* The shown
derivation (9 − 3÷2 = 9 − 1.5) is arithmetically correct but equals **7.5**, not 8, and the
sentence trails off self-negating ("...no)") without ever resolving to a value that matches 8.
Either the stored `value` or the feedback text is wrong; as written, neither explains the other.

**Fix (recommended)**: reinterpret `value: 8` as the "grouped correctly but used the wrong outer
operation" error (9 − 3 = 6, then **added** 2 instead of dividing: 6 + 2 = 8), matching this
lesson's established feedback style (e.g. `k2`'s "X is just what's inside — the outer op still
happens" pattern): *"8 groups correctly (9 − 3 = 6) but adds instead of dividing outside the
parentheses (6 + 2 = 8). The outer operation here is ÷: 6 ÷ 2 = 3."* Alternative: change `value` to
`7.5` and rewrite the feedback to cleanly state 9 − 3÷2 = 9 − 1.5 = 7.5 without the "...no)"
fragment. Either is a single-field/single-string edit; grading key (answer = 3) is unaffected.

### `decimal-operations` / `dop-01-03` — i2 mcq: distractor is mathematically equivalent to the correct answer

Step `i2` ("Without computing it, what does 3 × (12 + 7) represent?") offers correct option (a)
*"Three times the sum of 12 and 7"* against distractor (c) *"12 plus 7, three times in a row
added."* Repeated addition of a sum three times **is** multiplication by 3 — the two options
describe the identical quantity/operation, not different ones. Option (c)'s own feedback concedes
this explicitly: *"The 3 × multiplies the sum, which is the same as adding it three times — but
stated as 'three times the sum of 12 and 7.'"* This makes the item defensibly dual-correct rather
than testing a real misconception.

**Fix**: reword option (c) to describe a genuinely different (wrong) quantity instead of a
rephrasing of the correct one — e.g. *"12, then 7 added three times"* (which reads as
12 + 7 + 7 + 7 = 33, a real "repeated the wrong part" misconception) — and give it feedback that
names that actual error. Options (a) and (b) and the rest of the lesson need no change.

### `decimal-operations` / `dop-02-02` — ch1 numeric: wrong concatenation value

Step `ch1` ("Use the standard algorithm for 74 × 8") `commonErrors[1]` has `value: 5612` with
feedback *"5612 writes 56 and 32 side by side"* — but `"56"` concatenated with `"32"` is `"5632"`,
not `"5612"` (confirmed by cross-checking the identical pattern correctly computed twice elsewhere
in this same lesson: `k2`'s `"30"+"15"="3015"` and the remedial's `"6"+"18"="618"` both check out
exactly).

**Fix**: change `commonErrors[1].value` from `5612` to `5632`. Single-field numeric edit; feedback
text is already correct and needs no change.

### `decimals-place-value` / `dpv-01-02` — k2 (CHOICE-0050) mcq: option-length parity leak

See the special re-audit section above. Correct option (a) `"5 — the third place after the point"`
(35 chars) is disproportionately longer/more elaborated than distractors (b) `"3 — it comes first"`
(18), (c) `"7 — it's in the middle"` (22), (d) `"0 — the leading zero"` (20).

**Fix**: shorten option (a)'s justification to a length comparable to the distractors, e.g.
`"5 — thousandths place"` (22 chars, matching option c) or `"5 — third place"` (15 chars),
preserving its `id`/`correct`/grading fields unchanged.

### `decimals-place-value` / `dpv-02-01` — i1 hints/explanationVariants reference the wrong digits

Step `i1` ("In 0.47, the 7 is in which place?") — step-level `hints` read *"The 2 is tenths; the 8
is next"* and `explanationVariants` read *"The 8 is the second digit after the point — hundredths"*
/ *"First place tenths (2), second place hundredths (8)."* Neither `2` nor `8` appears in `0.47`;
this is stale content from a different worked example (part of a chapter-2-wide pattern — see
`dpv-02-02` and `dpv-02-03` below, all three apparently drafted around a common `0.28` example that
was customized per-lesson in the widget but not in the accompanying hints/explanations).

**Fix**: rewrite to reference the lesson's actual digits: `hints`: *"Count places right from the
point.", "The 4 is tenths; the 7 is next.", "Second place is hundredths."*;
`explanationVariants`: *"The 7 is the second digit after the point — hundredths.", "First place
tenths (4), second place hundredths (7)."*

### `decimals-place-value` / `dpv-02-02` — i1 hints/explanationVariants reference the wrong digit (also a progression root — see special section)

Step `i1`'s `hundredthsGrid` targets 20 hundredths (0.20), but step-level `hints` read *"That digit
is 8, so 8/100"* and `explanationVariants` read *"0.28 = 2/10 + 8/100 — the 8 is the hundredths
numerator"* / *"Each place becomes its own fraction: 2/10 then 8/100."* The target's hundredths
digit is 0, not 8 — same stale-`"0.28"` pattern as `dpv-02-01`.

**Fix**: rewrite to match the actual target: `hints`: *"Expanded form takes one digit per place.",
"The tenths piece is 2/10; the hundredths digit is next.", "That digit is 0 — 20 hundredths is
exactly two full columns, 2/10."*; `explanationVariants`: *"0.20 = 2/10 + 0/100 — shading 20 cells
fills exactly two full columns.", "20 hundredths is the same amount as 2 tenths: 20/100 = 2/10."*

### `decimals-place-value` / `dpv-02-03` — i1 hints/explanationVariants contradict the correct answer

Step `i1` ("In 0.327, which place contains the last digit?" — correct: **thousandths**) —
step-level `hints` read *"Read the digits after the point as a number: 28", "The 8 is in
hundredths"* and `explanationVariants` read *"The last place (hundredths) names it: twenty-eight
hundredths"* / *"0.28 = 28/100 = twenty-eight hundredths."* This doesn't just reference a stale
number — it asserts **"hundredths,"** which is the lesson's own listed misconception/wrong choice,
directly contradicting the correct answer the student is meant to select. Worst instance of the
chapter-2 stale-content pattern.

**Fix**: rewrite to reference `0.327`/thousandths: `hints`: *"Read the digits after the point as a
number: 327.", "Find the last digit's place.", "The 7 is in thousandths."*;
`explanationVariants`: *"The last place (thousandths) names it: three hundred twenty-seven
thousandths.", "0.327 = 327/1000 = three hundred twenty-seven thousandths."*

### `decimals-place-value` / `dpv-03-02` — i1 mcq: option-length parity leak

Step `i1` ("Which statement about 0.5 and 0.50 is true?"): correct option (a) `"They are equal"`
is 14 characters vs. distractors at 35 and 28 characters (measured directly) — the correct answer
is markedly *shorter/terser* than both distractors, the same parity-leak category as CHOICE-0050
but in the opposite direction, caught by the required programmatic option-length scan.

**Fix**: rebalance option lengths — either lengthen (a) (e.g. *"They are equal — the trailing zero
adds no value"*) or trim (b)/(c) to comparable brevity (e.g. *"0.50 is bigger"*, *"0.5 is
bigger"*), preserving `id`/`correct`/grading fields.

### `exponents-scientific-notation` / `esn-01-01` — systemic off-by-one "n zeros" rule (highest severity in this batch)

The lesson's core taught heuristic — *"a decimal with n zeros between the point and the 1"* for
10⁻ⁿ — is wrong by exactly one throughout: the correct count is **(n−1)** zeros, since the 1 itself
occupies the nth decimal place. This is self-contradicting on the lesson's own first worked
example: `c1` states 10⁻³ = 0.001 has "n zeros" (i.e. 3), but 0.001 has 2 zeros before the 1. The
same off-by-one recurs in:
- `i2.fallbackFeedback`: claims 10⁻⁴ = 0.0001 has "four zeros" (actually 3), plus an ironic
  self-undermining "count carefully" aside that contradicts itself if actually counted;
  `i2.commonErrors[1]` claims 10⁻³ "(3 zeros before the 1)" (actually 2).
- `k3.explanationVariants[1]` and `k3.successFeedback`: both claim 10⁻⁵ = 0.00001 has "five zeros"
  (actually 4).
- `ch1.explanationVariants[0]`, `ch1.commonBuilds` (for both the 10⁻⁴ and 10⁻⁶ wrong choices), and
  `ch1.hints[2]`: all repeat the off-by-one count for their respective decimals.
- `r1`'s takeaway and the remedial concept: both state the wrong general rule as a summary a
  student is meant to remember.

Grading is unaffected — every stored numeric `answer` (0.0001, 0.01, 0.00001, etc.) and every
`buildExpression`/`mcq` correct selection is mathematically accurate; only the *taught rule* is
wrong. This matters because the rule is exactly the kind of heuristic a student would apply
unsupervised to a brand-new problem (e.g. writing 10⁻⁶ as a decimal from scratch) and get a
digit-count wrong as a result. The lesson's figure (`esn-power-meaning`, sampled directly from
`src/components/figures.tsx`) depicts only *positive* powers of ten (10³ = 1000 "3 zeros", etc.),
which is correctly stated for positive exponents and is unaffected by this bug.

**Fix**: replace every "n zeros between/before the point and the 1" phrasing with either
"(n−1) zeros before the 1" or the safer place-based framing the lesson already uses correctly in
one place (`ch1.missFeedback`: "0.00001 is five hops down" / `hints[0]`: "Count how many places the
1 sits after the decimal point") — extend that safe framing throughout `c1`, `i2`, `k3`, `ch1`,
`r1`, and the remedial concept, correcting each specific zero-count (10⁻³→2 zeros, 10⁻⁴→3 zeros,
10⁻⁵→4 zeros, 10⁻⁶→5 zeros) along the way.

### `exponents-scientific-notation` / `esn-01-02` — i2 numericError sign mismatch

Step `i2` ("10³ × 10⁻⁵ = 10^x") `numericErrors[0]` has `value: 15` with feedback *"That multiplies
the exponents instead of adding"* — but 3 × (−5) = **−15**, not +15. The literal "multiply the
exponents" error a student would actually make isn't represented by this value/feedback pair (and
−15 isn't caught by any listed `numericErrors` entry at all). Elsewhere in the same lesson this
sign-of-product pattern is handled correctly (e.g. `k3`'s `value: 12` correctly matches
(−3) × (−4) = 12), confirming this is an isolated slip rather than a house style.

**Fix**: change `numericErrors[0].value` from `15` to `-15` (feedback text needs no wording change,
since it already only says "multiplies the exponents" without stating an intermediate number).

### `exponents-scientific-notation` / `esn-02-02` — i2 + remedial mcq: option-length/meta-hint leak

Step `i2` ("Which value solves x³ = −8?") and the parallel remedial check both give the correct
option an editorializing parenthetical — `"x = −2 (only one solution)"` / `"x = 2 (only one
solution)"` — that is both longer than any distractor and previews the exact reasoning (single
real solution, unlike x² = p's pair) that distinguishes it from the "x = 2 or x = −2" distractor,
letting a test-wise student select it without cubing anything. This is distinct from the immediately
preceding lesson `esn-02-01`, where correct options like "x = 6 or x = −6" are naturally longer than
single-value distractors because x² = p genuinely has two solutions — that length difference is
mathematically inherent, not an artificial addition. In `esn-02-02`, the correct answer is a single
value like its neighbors, so the added "(only one solution)" annotation is avoidable.

**Fix**: drop the parenthetical from both option labels (`"x = −2"` / `"x = 2"`), keeping the
"only one real solution" reasoning inside each option's `feedback` string instead of its `label`.

### `exponents-scientific-notation` / `esn-04-01` — ch1 commonBuilds: wrong exponent + unresolved fragment

Step `ch1` ("(7 × 10⁶) × (6 × 10⁴) = ?") has a `commonBuilds` entry (for wrong-token sequence
`"1.3 × 10¹¹"`) whose feedback reads: *"That adds the coefficients instead of multiplying
(7+6=13→1.3×10¹²... check again: multiplying gives 7×6=42, not 13)."* Renormalizing 13×10¹⁰ gives
**1.3×10¹¹** (matching the actual flagged token sequence), not 10¹² — the stated exponent is wrong
by one power regardless of intent, and the sentence trails into an unresolved "check again"
fragment rather than a clean explanation.

**Fix**: rewrite to: *"That adds the coefficients instead of multiplying: 7+6=13, not 7×6=42. Even
renormalized (13×10¹⁰ = 1.3×10¹¹), that's still the wrong approach — multiplying gives 42×10¹⁰,
which renormalizes to 4.2×10¹¹."*

### `exponents-scientific-notation` / `esn-04-02` — i1 successFeedback references an ungrounded number

Step `i1` ("Rewrite 3 × 10³ as 0.3 × 10⁴...enter the shared value of both forms") has
`successFeedback`: *"Both 3 × 10³ and 0.3 × 10⁴ equal 3,000. Now the sum is (2.5 + 0.3) × 10⁴ =
2.8 × 10⁴."* The number `2.5 × 10⁴` never appears anywhere in this step's `prompt`, `body`, or
`predict` text — the arithmetic (2.5+0.3=2.8) is itself correct, but the sentence assumes a larger
addition problem the student was never shown, which is confusing rather than clarifying.

**Fix**: either (a) add the full context to the step (e.g. prompt/body: *"This step helps solve
(2.5×10⁴) + (3×10³). Rewrite 3×10³ as 0.3×10⁴..."*), or (b) simplify `successFeedback` to
*"Both 3 × 10³ and 0.3 × 10⁴ equal 3,000."* and drop the ungrounded "Now the sum is..." sentence.

### `exponents-scientific-notation` / `esn-04-03` — i1 numericError: stale "bee" content

Step `i1` ("For (3 × 10⁴)(2 × 10²), step through 4 + 2 and enter the exponent...") has
`numericErrors[1]` feedback: *"Keeping only the bee-count exponent ignores the 10² grams attached
to each bee."* "Bee"/"bee-count" is leftover content from an earlier (apparently bee-colony-themed)
draft — the current `prompt`/`body`/`predict` text is entirely abstract numeric, with no bees
anywhere in this step or lesson.

**Fix**: reword to match the abstract prompt, e.g. *"Keeping only the 10⁴ exponent ignores the
second factor's 10² — both must combine: 4 + 2 = 6."*

## Full per-lesson verdicts

All entries below are `decision` / `visualDecision` / `gradeLanguageDecision`. Full rationale for
every lesson (including all 28 KEEP) is in the NDJSON at
`reports/closure/cowork-staging/laneB-s320-A4-dispositions.jsonl`.

**`decimal-operations`** (15/15 signed): dop-01-01 KEEP/SUFFICIENT/FIT ·
**dop-01-02 REVISE/REQUIRED/FIT** · **dop-01-03 REVISE/SUFFICIENT/FIT** ·
dop-02-01 KEEP/REQUIRED/FIT · **dop-02-02 REVISE/REQUIRED/FIT** · dop-02-03 KEEP/REQUIRED/FIT ·
dop-03-01 KEEP/REQUIRED/FIT · dop-03-02 KEEP/REQUIRED/FIT · dop-03-03 KEEP/REQUIRED/FIT ·
dop-04-01 KEEP/REQUIRED/FIT · dop-04-02 KEEP/REQUIRED/FIT · dop-04-03 KEEP/REQUIRED/FIT ·
dop-05-01 KEEP/REQUIRED/FIT · dop-05-02 KEEP/REQUIRED/FIT · dop-05-03 KEEP/REQUIRED/FIT.

**`decimals-place-value`** (12/12 signed): dpv-01-01 KEEP/REQUIRED/FIT ·
**dpv-01-02 REVISE/REQUIRED/FIT** (CHOICE-0050) · dpv-01-03 KEEP/REQUIRED/FIT (progression root) ·
**dpv-02-01 REVISE/REQUIRED/FIT** · **dpv-02-02 REVISE/REQUIRED/FIT** (progression root) ·
**dpv-02-03 REVISE/REQUIRED/FIT** · dpv-03-01 KEEP/REQUIRED/FIT (progression root) ·
**dpv-03-02 REVISE/REQUIRED/FIT** · dpv-03-03 KEEP/REQUIRED/FIT ·
dpv-04-01 KEEP/REQUIRED/FIT (progression root) · dpv-04-02 KEEP/REQUIRED/FIT (progression root) ·
dpv-04-03 KEEP/REQUIRED/FIT.

**`exponents-scientific-notation`** (15/15 signed): **esn-01-01 REVISE/SUFFICIENT/FIT** ·
**esn-01-02 REVISE/REQUIRED/FIT** · esn-01-03 KEEP/REQUIRED/FIT · esn-01b-01 KEEP/REQUIRED/FIT ·
esn-01b-02 KEEP/REQUIRED/FIT · esn-01b-03 KEEP/REQUIRED/FIT · esn-02-01 KEEP/REQUIRED/FIT ·
**esn-02-02 REVISE/REQUIRED/FIT** · esn-02-03 KEEP/REQUIRED/FIT · esn-03-01 KEEP/REQUIRED/FIT ·
esn-03-02 KEEP/REQUIRED/FIT · esn-03-03 KEEP/REQUIRED/FIT · **esn-04-01 REVISE/REQUIRED/FIT** ·
**esn-04-02 REVISE/REQUIRED/FIT** · **esn-04-03 REVISE/REQUIRED/FIT**.

## Methodology

- **Basis hashes**: computed in bulk via `node scripts/session/print-review-basis.mjs <ids>`
  against current file bytes, then re-run a second time at report-writing time and diffed
  programmatically against the staged NDJSON — 0 mismatches across all 42 lessons, confirming no
  transcription error and no source drift across the session (including across the mid-session
  context compaction).
- **Arithmetic**: every decimal operation (place alignment, carrying, borrowing), scientific-
  notation conversion, and exponent-law application named in any prompt/widget/commonError/
  feedback/hint/explanation/reveal string across all 42 lessons was recomputed by hand — including
  cross-checking multi-instance patterns (e.g. the "write A and B side by side" concatenation
  feedback in `dop-02-02`, checked at all three of its occurrences; the "n zeros" heuristic in
  `esn-01-01`, checked at all 11 of its occurrences (`c1`, `i2.fallbackFeedback`,
  `i2.commonErrors[1]`, `k3.explanationVariants[1]`, `k3.successFeedback`,
  `ch1.explanationVariants[0]`, `ch1.commonBuilds[0]`, `ch1.commonBuilds[2]`, `ch1.hints[2]`,
  `r1`'s takeaway, and the remedial concept); every 10ⁿ/10⁻ⁿ decimal-place count across
  `esn-03-01`/`esn-03-02` to confirm the off-by-one bug is isolated to `esn-01-01` and does not
  recur elsewhere in the course).
- **Duplication scanning**: a custom script indexed every widget `prompt` (main + remedial, all 42
  lessons) and every concept-step `body` for exact cross-lesson/cross-step string matches — zero
  exact duplicates found in any of the three courses.
- **Option-parity scanning**: the same script flagged `mcq`/`predict` items where the correct
  option's character length was disproportionate (>1.6× or <1/1.6×, with an absolute difference
  >8 characters) to the longest/shortest distractor. This caught `dpv-03-02` outright; `CHOICE-0050`
  (`dpv-01-02`) and `esn-02-02` fell just under/at the edge of that heuristic threshold but were
  confirmed as genuine, qualitatively real parity concerns on manual inspection (`CHOICE-0050`
  because it was the specific S244-flagged candidate under mandated re-audit; `esn-02-02` because
  the excess length is a self-contained editorial annotation, not incidental wording) — exact
  character counts for every flagged/considered option are quoted in the REVISE entries above,
  computed via `String.prototype.length`, not estimated.
- **Hint/explanation-mismatch scanning**: a second custom script extracted every number appearing
  in each step's `hints`/`explanationVariants` and flagged any not present in that step's own
  `prompt`/`body`/widget text. This produced 73 raw candidates (mostly false positives — e.g.
  legitimate references to answer values not restated in the prompt); manual triage of every
  candidate surfaced the genuine, confirmed `dpv-02-01`/`dpv-02-02`/`dpv-02-03` chapter-wide
  stale-`"0.28"`-example pattern. The `esn-04-02` (ungrounded "2.5×10⁴") and `esn-04-03` (stale
  "bee") findings were caught by direct manual reading rather than this scanner, since one involves
  a `successFeedback` field the scanner did not check and the other involves a non-numeric stale
  reference.
- **Figure verification**: sampled figure components directly from `src/components/figures.tsx`
  (via `grep` for each `figureIds.ts` entry referenced by these 42 lessons, then reading the
  matched function body) for every figure a REVISE-adjacent step relies on, and a broad sample
  across both other courses — all rendered figures matched the quantities their concept text names;
  none were found broken or mismatched.
- **Platform-level facts treated as context, not defects** (per task instructions): `McqW` and the
  `*LabW`/lab-style widgets use seeded shuffle at render keyed by lesson/step id and grade by option
  id/identity, never DOM position — content authors do not need per-lesson shuffle logic, and this
  was not re-verified per lesson. Lab widgets are shuffle-fixed per the S316 history and were
  likewise treated as an established platform invariant.

## Notes on borderline calls

- **`dop-01-03`/i2**: the flagged option (c) is not a throwaway distractor — it is *literally*
  equivalent to the correct answer, and the item's own feedback concedes as much. This crosses from
  "slightly awkward wording" into "the item can be defended as having two correct answers," which
  is why it is counted as REVISE rather than left as a style note.
- **`esn-01-02`/i2 vs. `esn-01-02`/k3**: the same lesson gets the sign of a coefficient product
  right in one place (`k3`'s `value: 12` for (−3)×(−4)) and wrong in another (`i2`'s `value: 15` for
  3×(−5), which should be −15) — treated as an isolated slip rather than a systemic pattern,
  consistent with not finding the same issue anywhere else in this or the sibling exponent-rule
  lessons (`esn-01b-01/02/03`).
- **`esn-02-01` vs. `esn-02-02` option lengths**: both lessons have correct MCQ options longer than
  their distractors, but only `esn-02-02` is flagged. In `esn-02-01` (x² = p), the length difference
  is mathematically inherent — the correct answer genuinely has two parts ("x = 6 or x = −6") because
  the equation genuinely has two solutions. In `esn-02-02` (x³ = p), the correct answer is a single
  value with an added, avoidable editorial parenthetical — the length difference there is authorial,
  not mathematical, which is the distinction that makes one a leak and the other not.
- **`dop-03-01`/`dop-03-02`/`dop-03-03`, `dop-04-01`/`dop-04-02`, and the `esn-01b-*`/`esn-03-*`
  chapters**: each reuses the same instructional skill across 2–3 consecutive lessons (long
  division; standard multiplication; exponent rules; scientific-notation conversion), but every
  step within and across these lessons pairs the skill with a new numeric fact and, where
  applicable, a new representation (number line → grid → lab widget) — judged KEEP-worthy
  progression, not duplication.
