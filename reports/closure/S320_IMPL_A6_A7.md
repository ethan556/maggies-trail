# S320 Implementation — Lane A6/A7 REVISE Contracts (20 lessons)

Bounded implementation worker. Authority per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`:
repository source and the explicit implementation contracts in `reports/closure/S320_ASSESS_A6.md`
and `reports/closure/S320_ASSESS_A7.md` are authoritative; this packet implements every REVISE
contract from those two files exactly as written, does not weaken any gate, and does not invent
new judgment calls. Base commit: `ae399cc647fedf3f0a0db1aadfeb4cc04d3b90c1`.

Scope: 20 lessons across 6 courses (`place-value-million`, `fraction-multiply-g4`,
`add-subtract-1000-g3`, `fractions-add`, `fractions-multiply`, `fraction-division-g5`). All edits are
content-only JSON changes under `content/courses/`; no `src/` files were modified. `src/lib/evaluate.ts`,
`src/lib/schema.ts`, and `src/components/widgets.tsx` were read (not edited) to confirm
`buildExpression` grading semantics before the `fa-04-02` fix. No npm/vitest/tsc run, per instructions.

Deliverables: this report + NDJSON at
`reports/closure/cowork-staging/laneA-s320-impl-7.jsonl` (20 records, one per lesson).

## Verification method

- Every JSON file touched was parse-checked with `node -e "JSON.parse(...)"` after editing (20/20 OK).
- Every place-value trade/borrow, fraction product/quotient, and multi-digit sum/difference named in
  a changed field was recomputed by hand, shown below per lesson.
- A scripted duplicate scan was run per affected course pair, covering (a) exact MCQ
  prompt+sorted-option-label identity within and across the course's lessons (mirrors the repo's own
  `buildDuplicateInventory`), and (b) exact non-MCQ widget-prompt identity within and across the
  course's lessons (main steps + remedials). Result: **zero duplicate clusters remain in any of the
  6 affected courses** after the fixes (full output below).
- A within-file scan for accidentally-introduced duplicate widget prompts was run on all 20 edited
  files individually: zero hits.
- For `g5f-03-04`, an additional MCQ option-set-only scan (ignoring prompt text) was run to confirm
  `k1`/`k3` no longer share an identical option set; the two other option-set matches this scan
  surfaces (`g5f-02-02/k2`~`g5f-02-03/k1`~`ch1`, and `g5f-02-04/k3`~`g5f-03-04/k1`) are pre-existing
  and explicitly called out as non-defects in `S320_ASSESS_A7.md`'s "Notes on borderline calls
  resolved as KEEP" — they are not in the REVISE list and were left untouched.

---

## place-value-million (5 lessons)

### pv2-01-01 — k3
Contract: stray unedited "wait..." self-correction in `explanationVariants[1]`.
**Fix**: `"One rung up is ×10 (100 hundred-thousands... wait, one rung is 10 hundred-thousands per
million); two rungs from ten-thousands is 10 × 10 = 100."` → `"One rung up is ×10; two rungs from
ten-thousands to millions is 10 × 10 = 100."` Pure prose cleanup; 10×10=100 was already correct.

### pv2-02-01 — k1, i2
Contract: `k1` commonError names the wrong swapped digit-pair for 640,012; `i2` commonBuilds
misattributes 30,000 to "the thousands column."
**Fix**: `k1.commonErrors[1]` now says "swaps the ten-thousands and thousands digits" (was
"hundred-thousands and ten-thousands").
**Verification**: 604,012 = 6·0·4·0·1·2 (hundred-th·ten-th·thousands·hundreds·tens·ones);
640,012 = 6·4·0·0·1·2. Hundred-thousands digit is 6 in both — unchanged. Ten-thousands (0↔4) and
thousands (4↔0) are the two places that actually swapped. Confirmed.
**Fix**: `i2.commonBuilds[0].feedback` now says the wrong 30,000 token comes from "misreading the
ten-thousands digit 2 as if it were a 3" (was: "reads the 2 as if it belonged to the thousands
column").
**Verification**: 723,006 = 700,000+20,000+3,000+6; the digit 2 sits in ten-thousands (worth
20,000). A 2 read as thousands would be worth 2,000, not 30,000 — original text was internally
inconsistent; new text is correct.

### pv2-04-01 — k2
Contract: `k2.body` says "A three-trade cascade" but 156,489+267,742 needs five trades, contradicting
the step's own explanationVariants/successFeedback.
**Fix**: `body` → "A five-trade cascade."
**Verification** (column-by-column): ones 9+2=11→write1 carry1; tens 8+4+1=13→write3 carry1;
hundreds 4+7+1=12→write2 carry1; thousands 6+7+1=14→write4 carry1; ten-thousands 5+6+1=12→write2
carry1; hundred-thousands 1+2+1=4. Result **424,231** (matches authored answer). Five columns
carried (ones, tens, hundreds, thousands, ten-thousands) — five trades confirmed.

### pv2-04-02 — k1, k2
Contract: `k1.body`/explanationVariant undercount a 3-break problem as "one break"/"only ones";
`k2.explanationVariants[0]` undercounts a 4-break problem as "3 columns."
**Fix**: `k1.body` → "Three breaks."; `k1.explanationVariants[1]` → "The ones, tens, and hundreds
columns each need a break here, cascading one into the next."
**Verification** (6,412 − 1,847, column-by-column): ones 2<7 break (tens 1→0, ones→12), 12−7=5;
tens 0<4 break (hundreds 4→3, tens→10), 10−4=6; hundreds 3<8 break (thousands 6→5, hundreds→13),
13−8=5; thousands 5−1=4. Result **4,565** (matches). Breaks in ones, tens, hundreds = **3**,
matching the step's own successFeedback ("three borrows").
**Fix**: `k2.explanationVariants[0]` → "...needs breaks in the ones, tens, hundreds, and thousands
columns..." (was "ones, tens, and hundreds").
**Verification** (83,251 − 46,378): ones 1<8 break (tens 5→4, ones→11), 11−8=3; tens 4<7 break
(hundreds 2→1, tens→14), 14−7=7; hundreds 1<3 break (thousands 3→2, hundreds→11), 11−3=8; thousands
2<6 break (ten-thousands 8→7, thousands→12), 12−6=6; ten-thousands 7−4=3. Result **36,873**
(matches, unchanged). Breaks in ones, tens, hundreds, thousands = **4**, confirmed.

### pv2-04-03 — i2
Contract: matchPairs `pairErrors`/`successFeedback` for the 40,052 item misidentify a tens digit as
"the hundreds digit" and describe the borrow direction backwards.
**Fix**: both strings now say the ones column's borrow "resolves immediately at the tens digit,
which is already 5 (nonzero)" (was: "the hundreds digit is already 5" / "reaching hundreds from
tens").
**Verification**: 40,052 = 4·0·0·5·2 (ten-th·thousands·hundreds·tens·ones). Hundreds digit is **0**,
not 5; the tens digit is **5**. The correct pairing (n40052→z0, "0 zeros") was already correct
pre-fix; only the prose feedback explaining it was wrong. Now consistent.

---

## fraction-multiply-g4 (3 lessons)

### g4x-01-03 — k3
Contract: verbatim cross-lesson duplicate of g4x-01-01/k2 ("2/5+2/5+2/5 as multiplication").
**Fix**: new example — "3/8 + 3/8 + 3/8 + 3/8 written as multiplication is…" correct = "4 × 3/8",
same misconception-distractor set (fraction×fraction, whole+fraction, denominator-scaling).
**Verification**: 4 × 3/8 = 12/8 (four groups of 3/8, denominator unchanged at 8).

### g4x-03-02 — ch1
Contract: verbatim cross-lesson duplicate of g4x-02-04/k2 ("Convert 2 3/4"); missed by prior
evidence-only S258 assessment.
**Fix**: mixed number changed to 4 2/3 (unused elsewhere in the course, confirmed by grep before
editing), previewDenominator 3, commonErrors/successFeedback recomputed.
**Verification**: 4 2/3 → improper numerator = 4×3+2 = **14**. Distractor 6 = whole+numerator error
(4+2); distractor 12 = wholes×denominator only, dropping the extra 2/3 (4×3).

### g4x-03-04 — k2
Contract: verbatim cross-lesson duplicate of g4x-03-03/k2 ("3 × 2/6").
**Fix**: replaced with 4 × 2/9 (unused elsewhere in this lesson — which already used 7×5/6, 5×4/5,
4×3/4, 6×4/5 — or in sibling g4x-03-03).
**Verification**: 4 × 2/9 = **8/9**. Distractor 36 = whole×denominator error (4×9); distractor 2 =
single-group numerator only.

---

## add-subtract-1000-g3 (4 lessons)

### g3a-02-03 — k3
Contract: `k1`/`k3` verbatim within-lesson duplicate (298+145 compensation reasoning).
**Fix**: new scenario — 396 + 258, "Priya adds 400 + 258 = 658 first," correct = "Subtract 4," all
four options/feedback re-derived.
**Verification**: 396 rounds up to 400 (+4); 400+258=658; repay 4 → 658−4=654. Direct check:
396+258 = 654. Confirmed.

### g3a-03-01 — ch1
Contract: `k1`/`ch1` verbatim within-lesson duplicate (632−178=454 inverse-check reasoning); `k3`
(781−324=457) is distinct and unaffected.
**Fix**: new fact — 541 − 263 = 278, same four-option shape (correct add-back; redo-subtraction
distractor; grows-past-start distractor; compare-not-check distractor).
**Verification**: 541 − 263 = 278; inverse check 278 + 263 = 541. Confirmed.

### g3a-03-02 — k2, ch1
Contract: both steps' second `commonErrors` entry blames "the carry" for problems that hand-verify
to have **no** carry at all.
**Fix**: `k2.commonErrors[1].feedback` (value 432, for 132+400=532) → "The hundreds digit was copied
down wrong — recheck 1 + 4 in the hundreds column." `ch1.commonErrors[1].feedback` (value 589, for
272+417=689) → "The hundreds digit was copied down wrong — recheck 2 + 4 in the hundreds column."
**Verification**: 132+400: ones 2+0=2, tens 3+0=3, hundreds 1+4=5 — zero carries; result 532; wrong
answer 432 differs only in the hundreds digit (4 vs 5), consistent with a copy error, not a missing
carry. 272+417: ones 2+7=9, tens 7+1=8, hundreds 2+4=6 — zero carries; result 689; wrong answer 589
differs only in the hundreds digit (5 vs 6), same pattern. Both confirmed carry-free.

### g3a-03-03 — k3
Contract: `k1`/`k3` verbatim within-lesson duplicate (245+398 "fastest strategy" reasoning).
**Fix**: new scenario, 342 + 256, where the **standard column algorithm** (not compensation) is
fastest — correct option "The column algorithm — no carries anywhere," with compensation/
number-line/counting-on distractors rewritten to fit the new numbers, so the two checks now
discriminate between strategies instead of repeating the same judgment.
**Verification**: 342+256: ones 2+6=8, tens 4+5=9, hundreds 3+2=5 — zero carries in any column; sum
598. Confirms the column algorithm needs no regrouping here, unlike 245+398 (where compensation
wins).

---

## fractions-add (1 lesson)

### fa-04-02 — i2 (buildExpression)
Contract: token bank has two tokens (`t3`, `t2wrong`) with the identical visible label `"3"`,
causing grading ambiguity — a learner who clicks the "wrong" `3`-labeled button loses credit for
the correct expression despite it looking identical on screen.
**Evaluator semantics read before editing** (`src/lib/evaluate.ts` `buildExpression` case, line
~2156; `src/lib/schema.ts` `widgetIntegrityErrors` `buildExpression` case, line ~8854;
`src/components/widgets.tsx` `BuildExpressionW`): grading is strictly by **token id** sequence
(`correct`/`acceptAlso`), never by label; the integrity checker only validates that ids referenced
in `correct`/`acceptAlso`/`commonBuilds` exist among `tokens`, never label uniqueness; the widget
renders one button per token id.
**Fix**: `t2wrong.label` changed from `"3"` to `"5"` — a numeral not used by any other token in the
array. `id`, `correct=[t4,tx,t3,tp,t2]`, `acceptAlso`, `commonBuilds` all untouched (none reference
`t2wrong`), so no grading-logic change — the fix eliminates the visual collision at its root.

---

## fractions-multiply (1 lesson)

### fm-04-02 — k1
Contract: `k1` duplicates `fm-04-01`/`k1` (same numeric fact 7/6×8, same comparison target, same
misconception).
**Fix**: replaced with 5/3 × 9 — a fact unused in fm-04-01 (7/6, 3/3, 5/4-grower, 5/6, 4/3) and
unused elsewhere in fm-04-02 (3/4, 2/3, 5/4, 4/3, 1/2, 3/5, 7/6-ch1). Same `singleCompare`
structure, three-option shape, misconception-distractor pattern.
**Verification**: 5/3 > 1 (5>3), so 5/3 × 9 > 9 — scaler above one grows the number.

---

## fraction-division-g5 (6 lessons)

### g5f-01-03 — remedial check
Contract: remedial prompt asks a WHAT-FORM question but its (correct, already-graded) options
answer a WHEN question copy-pasted from the main-lesson `k1`.
**Fix**: prompt reworded to the "when" framing: "...When should the leftover be written as a
fraction rather than a remainder?" `options`/`correct` untouched — zero grading risk.

### g5f-01-04 — i2
Contract: `i2`'s prompt was rewritten to a cups/pots story but `successFeedback` and both
`commonFractions[].feedback` strings still say "metre(s)."
**Fix**: all three strings reworded to cups/pots ("7/8 cup...", "eight cups shared among seven
pots", "there are seven cups"). fractionBar grading is value-based on num/den (confirmed in
`src/lib/evaluate.ts`), unaffected by the text change.

### g5f-02-03 — k2
Contract: `k2` byte-identical to `g5f-02-02`/`k3` ("Compute 8×5 — fifths that fit in 8 wholes").
**Fix**: replaced with "Compute 6 × 3 — the number of thirds that fit in 6 wholes" (answer 18),
unused fact in g5f-02-02 (which used 9×8, 8×5, 7×2); commonErrors adjusted (9 = addition error,
3 = only-one-whole error).
**Verification**: 6 × 3 = **18**.

### g5f-03-02 — i2
Contract: `i2` prompt states the target quantity ("Eight half-metre pieces") in its own setup
sentence, then asks for that same quantity — answer leaked, no reasoning required. (Its `k3`
duplication by `g5f-03-03`/`k2` is a separate pairing, fixed in that lesson's own record below.)
**Fix**: prompt reworded to "A 4-metre ribbon is cut into half-metre pieces and laid end to end.
Slide to the total number of pieces." — no longer states the count; `min`/`max`/`target`/
`acceptFactor`/feedback untouched.

### g5f-03-03 — k2
Contract: `k2` byte-identical to `g5f-03-02`/`k3` ("Compute 9÷3 — sharing 9 pieces among 3 people").
**Fix**: replaced with "Compute 15 ÷ 5 — sharing 15 equal pieces among 5 people" (answer 3), unused
fact in g5f-03-02 (5×6, 9÷3); commonErrors adjusted (15 = whole-pile error, 10 = one-subtraction
error).
**Verification**: 15 ÷ 5 = **3**.

### g5f-03-04 — k3
Contract: `k1`/`k3` share a byte-identical option set (all four labels/feedback), two ungated
main-lesson checks with no distinct job. (Its remedial mirroring `k1` is expected platform
convention, not a defect, and was left unchanged.)
**Fix**: `k3` replaced with a different quotient estimate: "Roughly how big is 7 ÷ 1/4, without
computing exactly?" correct = "About 28 because each whole has 4 fourths," same
misconception-distractor pattern (dividing-shrinks error; fraction-close-to-nothing error;
forgot-to-scale-by-wholes error) rewritten for the new numbers.
**Verification**: each whole holds 4 fourths; 7 wholes hold 7×4 = **28** fourths, so 7 ÷ 1/4 = 28.

---

## Duplicate-scan output (post-fix, all 6 courses)

```
=== place-value-million ===        0 MCQ-identity dupes, 0 non-MCQ prompt dupes
=== fraction-multiply-g4 ===       0 MCQ-identity dupes, 0 non-MCQ prompt dupes
=== add-subtract-1000-g3 ===       0 MCQ-identity dupes, 0 non-MCQ prompt dupes
=== fractions-add ===              0 MCQ-identity dupes, 0 non-MCQ prompt dupes
=== fractions-multiply ===         0 MCQ-identity dupes, 0 non-MCQ prompt dupes
=== fraction-division-g5 ===       0 MCQ-identity dupes, 0 non-MCQ prompt dupes
```

`g5f-03-04` option-set-only scan (post-fix): `k1` and `k3` no longer share an identical option set.
Two pre-existing, explicitly-non-defect option-set matches remain untouched per the S320-A7 report's
own "Notes on borderline calls resolved as KEEP" (not in scope of any REVISE contract):
`g5f-02-02/k2` ~ `g5f-02-03/k1` ~ `g5f-02-03/ch1`, and `g5f-02-04/k3` ~ `g5f-03-04/k1`.

## Parse-check

All 20 edited files verified with `node -e "JSON.parse(fs.readFileSync(...))"` — 20/20 OK.

## Scope discipline

- No changes to IDs, `conceptTag`s, widget `type`s, or evaluator semantics anywhere.
- No changes outside the 20 named lessons; no forbidden/read-only files touched.
- No npm/vitest/tsc run (per instructions).
- Every feedback rewrite is ≥25 characters, mcq correct-option-first order preserved throughout
  (only distractor text/values changed, never option ordering), no negation-opening feedback
  introduced, no "mixed number" language introduced on whole-number quotients, grade-appropriate
  language preserved.
