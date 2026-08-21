# S323 Fix Packet P1 — decimal-fluency-g5 (template-feedback / remedial-duplicate defects)

Fixer: cowork-s323-P1-fixer. Contracts: PREMIUM_PENDING_WORKLOAD_QUEUE.csv rows S322-F10-g5d-*; reports/closure/S322_ASSESS_F10.md; standard: reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md (R1–R6).

## g5d-01-01
Defect (signed): remedial check rem-g5dc-add-model-k byte-identical to k1.
BEFORE (remedial prompt): "A hundredths grid has 100 equal cells. How many cells must be shaded to show 0.68?" (== k1, traps/feedback byte-identical)
AFTER: "Maggie shades a hundredths grid to show 0.68, filling whole columns first and then single cells. When she finishes, how many cells are shaded in all?" — answer 68 held (Shape α, mf3-01-01 precedent), traps 7/32 kept with feedback recomputed to be literally true of the new stem; fallback rewritten to the column/cell route.
Verified: R1/R2 (normalized digits→# distinct from i1,k1,i2,k2,k3,ch1), R3, R4 (not producible by dHundredthsCellsNumeric "A hundredths grid has 100 equal cells. How many cells must be shaded to show X?" nor dTenthsWrite/dHundredthsWrite "A unit square is split into..."), R5 (traps ≠ answer, distinct), R6 (concept body has no 68). Cross-lesson remedial scan over all 16 course lessons: no byte or normalized match.

## g5d-01-03
Defects (signed): (a) k1 MCQ distractor feedback = broken generator template ×3; (b) remedial byte-identical cross-lesson to g5d-01-05's remedial (subtraction wording in an addition lesson).
BEFORE (a): all three wrong options: 'Not quite — “[label]” does not match the place-value model or the expected size.'
AFTER (a): o1 "The zero SITS in the hundredths place, but a zero digit counts zero hundredths — 5.20 holds not one hundredth more than 5.2." / o2 "The tenths place already holds the 2, and the zero sits one place further right — and a zero digit adds no amount in any place." / o3 "Nothing is rounded — 5.20 and 5.2 name exactly the same amount; the zero only gives the hundredths column a digit to work with."
BEFORE (b): remedial MCQ "Subtracting 5.2 − 1.47, what does writing 5.2 as 5.20 do?" (byte-identical to g5d-01-05's remedial).
AFTER (b): "To add 4.6 + 2.83 in columns, a classmate refuses to write 4.6 as 4.60, saying the extra zero would change the total. Which reply is right?" — Shape β classmate-claim diagnostic in this lesson's own addition context; four options each with literally-true feedback. Duplication with g5d-01-05 resolved (01-05's subtraction remedial is topically native there and retained).
Verified: R1/R2 vs all steps, R3, cross-lesson scan clean over all 16 lessons, concept body (3.4/3.40) states no option answer.

## g5d-01-04
Defects (signed): (a) k3 MCQ broken-template feedback ×3; (b) remedial rem-g5dc-sub-k byte-identical to k1.
BEFORE (a): 'Not quite — “The digits nearest the left edge.” / “The largest digits only.” / “The final digits only.” does not match the place-value model or the expected size.'
AFTER (a): left-edge → "Left-edge alignment pairs digits by position on the page, not by value — with numbers of different lengths it would subtract hundredths from tenths."; largest → "Digit size says nothing about column position — a small digit in the ones place outweighs a large digit in the hundredths..."; final → "Final digits happen to share a place here only because both numbers end in hundredths — the rule that always works pairs EVERY column by equal place value..."
BEFORE (b): remedial prompt "Working in hundredths: 654 − 236 = ?" ans 418, traps 890/518 — byte-identical to k1.
AFTER (b): "Stack 6.54 above 2.36 and subtract column by column, trading where a top digit is short. Counting everything in hundredths, how many hundredths remain?" ans 418; traps 890/518 with feedback recomputed to name 6.54/2.36; fallback rewritten to the trade route. R4: Pv1000SubtractTradeNumeric emits only "a − b = ?" (src/lib/g2Variants.ts:91) — not producible. Concept body (5.00 − 1.75) does not state 418.
Verified: R1–R6 pass; course-wide cross-lesson remedial scan clean.

## g5d-01-05
Defects (signed): (a) k1 + ch1 MCQ broken-template feedback (6 options); (b) remedial byte-identical cross-lesson to g5d-01-03's remedial.
BEFORE (a): six wrong options all read 'Not quite — “[label]” does not match the place-value model or the expected size.'
AFTER (a): k1 — increase → "5.20 equals 5.2 exactly — a trailing zero adds no hundredths... opens the column the 7 must subtract from."; round → "Nothing is rounded — 5.2 is already exact..."; remove point → "The point stays exactly where it was... padding adds a digit AFTER the point". ch1 — hundredth-greater → "5.2 has no hundredths digit at all, and 5.20's hundredths digit is zero..."; tenth-greater → "Both numbers carry the same tenths digit, 2..."; cannot-compare → "Any two decimals compare place by place... The two are equal."
(b): duplication resolved in the g5d-01-03 edit (see that section): 01-03 now carries an addition-context remedial; 01-05 keeps the subtraction remedial that matches its own topic (i1 works 5.20 − 1.47). Remedial here passes R1/R2 vs all steps (different template from k1's why-question) and the course-wide byte/normalized scan is clean.
Also verified: prior working-tree correction of i2 commonResults (455 flip, 465 partial-borrow — both reachable) is intact; no 454 remains.

## g5d-01-06
Defects (signed): (a) k3 MCQ broken-template feedback ×3; (b) remedial rem-g5dc-mult-whole-k byte-identical to k1.
BEFORE (a): 'Not quite — “About 24.” / “A little less than 3.” / “About 300.” does not match...'
AFTER (a): 24 → "24 rounds 4.9 all the way down to 4, throwing away almost a full unit six times over — 5 × 6 hugs the true product far more closely."; under-3 → "That is ten times too small — six groups of almost 5 cannot total under 3..."; 300 → "300 is 50 × 6 — that reads 4.9 as ten times its size..."
BEFORE (b): remedial prompt "Working in hundredths: compute 43 × 4." ans 172 — byte-identical to k1.
AFTER (b): "For 0.43 × 4, stack up the four copies: 43 hundredths, then 43 more, then 43 more, then 43 more. How many hundredths does the stack hold?" ans 172; traps 47 (added amount to repeat count) / 129 (three copies) recomputed for the stack route; fallback walks 43→86→129 without stating 172.
Verified: R1–R6 pass (concept body cites 0.35 × 4/140, not 172); mbMultiplyTensNumeric emits only "Compute a × tens." with tens ∈ {20..90} — remedial not producible; course-wide remedial scan clean.

## g5d-02-01
Defect (signed): k1 + k3 MCQ broken-template feedback (6 options). No remedial defect signed (remedial estimate MCQ already distinct).
BEFORE: six wrong options all 'Not quite — “[label]” does not match the place-value model or the expected size.'
AFTER: k1 — 24 → "Rounding 4.9 down to 4 discards nine tenths six times over — nearly 6 whole units..."; 5÷6 → "That swaps multiplication for division — an estimate must keep the operation..."; 50×6 → "50 is ten times the size of 4.9 — that benchmark slides the decimal point a full place...". k3 — digits → "The digits 144 are exactly right — 36 × 4 = 144. What fails is the size..."; equal-16 → "An estimate is a size check, not a target — the true product 14.4 need not equal 16..."; whole-number → "Decimal factors routinely give decimal products — the true answer 14.4 is not whole either..."
Verified: no broken template remains; remedial distinct (probe pass); no other edits made.

## g5d-02-03
Defects (signed): (a) k1 + k3 MCQ broken-template feedback (6 options); (b) remedial byte-identical cross-lesson to g5d-02-02's remedial.
BEFORE (a): 'Not quite — “4.2”/“0.042”/“42”/“1.44”/“144”/“0.144” does not match...'
AFTER (a): k1 — 4.2 "keeps only one decimal place... ten times too large"; 0.042 "pushes the digits into thousandths, one place too far"; 42 "ignores both decimal points... a hundred times the true size". k3 — 1.44 "lives near 1, not near 14"; 144 "no point at all — a value near 150"; 0.144 "a hundred times too small".
BEFORE (b): remedial MCQ "Computing 0.4 × 0.3 in hundredths gives 12. Where does the point go?" (byte-identical to g5d-02-02's remedial).
AFTER (b): "A learner works 0.25 × 3, gets the digits 75, and writes down 7.5. The estimate says three quarters — under one whole. Which product is actually right?" — Shape β diagnostic drawn from this lesson's own i1/i2 (0.25 × 3, digits 75, reject 7.5); options 0.75 (correct), 7.5, 75, 0.075 each with place-count feedback. Duplication with g5d-02-02 resolved; 02-02 retains 0.4 × 0.3, its own k1 problem.
Verified: R1/R2 vs k1/k3/i1/i2 (distinct templates), R3, cross-lesson scan clean; remedial concept body states no numbers.

## g5d-02-02
Defect (signed): remedial byte-identical cross-lesson to g5d-02-03's remedial; own-step feedback already strong (per S322-F10).
Resolution: no edit to g5d-02-02. The shared MCQ ("Computing 0.4 × 0.3 in hundredths gives 12. Where does the point go?") is native to this lesson — k1/i1 are the 0.4 × 0.3 area-grid problem and the remedial concept teaches the place-count rule it checks. The duplicate side was g5d-02-03, rewritten (see its section) to a 0.25 × 3 diagnostic. Post-edit course-wide scan: no byte-identical or digits→# normalized-equal remedial pair remains; 02-02 remedial passes R1/R2 vs all its own steps (k1 asks what the overlap REPRESENTS; the remedial asks where the point goes in the digit product — different templates).

## g5d-02-04
Defects (signed): (a) k3 MCQ broken-template feedback ×3; (b) remedial rem-g5dc-div-whole-k byte-identical to k1.
BEFORE (a): 'Not quite — “Close to 4.” / “Close to 0.04.” / “Close to 36.” does not match...'
AFTER (a): 4 → "4 is the number of shares, not the size of one — splitting 1.44 four ways must give pieces smaller than 1.44..."; 0.04 → "Four shares of 0.04 would rebuild only 0.16 — nowhere near 1.44..."; 36 → "A share cannot be larger than the whole being shared — 36 dwarfs 1.44. The digits 36 name 36 hundredths..."
BEFORE (b): remedial prompt "Working in hundredths: compute 275 ÷ 5." ans 55 — byte-identical to k1.
AFTER (b): "Five equal shares are cut from 2.75. Read the whole as 275 hundredths, deal them out into the 5 shares, and count ONE share: how many hundredths does it hold?" ans 55; traps 275 (whole, not one share) / 270 (subtracted instead of shared) recomputed; fallback offers deal-out or missing-factor route without stating 55.
Verified: R1–R6 pass; mbDivideBigNumeric emits only "Compute n ÷ d." — not producible; concept body (1.44→36 hundredths example) does not state 55; course-wide remedial scan clean.

## g5d-02-05
Defects (signed): (a) k1 + k3 MCQ broken-template feedback (6 options); (b) remedial byte-identical cross-lesson to g5d-03-01's remedial.
BEFORE (a): six wrong options all 'Not quite — “[label]” does not match...'
AFTER (a): k1 — quotient-bigger → "The quotient is exactly what does NOT change — it is 8 both times..."; whole-numbers-only → "Dividing by a decimal is perfectly legal — the rewrite is a convenience..."; rounded-to-1 → "Nothing was rounded — 0.9 was multiplied by 10 to make exactly 9...". k3 — unchanged → "Scaling only the divisor changes the question — 4.8 ÷ 6 is ten times smaller..."; divide-by-10 → "Moving the two numbers in opposite directions shifts the quotient a hundred times off..."; round-4.8 → "Rounding changes the value and therefore the answer; scaling by 10 is exact..."
(b): duplication resolved on the g5d-03-01 side (see below); 02-05 keeps the 7.2 ÷ 0.9 remedial — native here (i1/k1/i2 all use 7.2 ÷ 0.9) and template-distinct from k1's "Why can 7.2 ÷ 0.9 be rewritten as 72 ÷ 9?" under digits→# normalization.

## g5d-03-01
Defects (signed): (a) k1 + k3 MCQ broken-template feedback (6 options); (b) remedial byte-identical cross-lesson to g5d-02-05's remedial.
BEFORE (a): 'Not quite — “One shift.”/“Three shifts.”/“Four shifts.”/“Shift one place.”/“Stay unchanged.”/“Shift three places.” does not match...'
AFTER (a): k1 — one → "One shift lands on 0.7 — still a decimal..."; three → "Three shifts overshoot to 70..."; four → "Four shifts blow past a whole number to 700...". k3 — one-place → "Unequal shifts scale the two numbers differently... ten times off"; unchanged → "Shifting only the divisor multiplies it by 100... a hundredth of the truth"; three-places → "...inflating the quotient tenfold — the shifts must be equal."
BEFORE (b): remedial MCQ "To compute 7.2 ÷ 0.9, why multiply BOTH numbers by 10 first?" (byte-identical to g5d-02-05's remedial).
AFTER (b): "A learner rewrites 4.8 ÷ 0.06 by shifting only the divisor, working 4.8 ÷ 6 instead. What went wrong?" — Shape β diagnostic in this lesson's own two-shift family; options: equal-two-shifts/480 ÷ 6 (correct), divisor-only, one-shift, round-to-1, each with literally-true feedback (4.8 ÷ 0.06 = 80 verified). Concept body keeps its 3.5 ÷ 0.07 example — different numbers from the check, no answer adjacency.
Verified both lessons: R1/R2 vs all steps, R3, course-wide cross-lesson remedial scan clean.

## g5d-03-02
Defect (signed): k1 + k3 MCQ broken-template feedback (6 options). Remedial already distinct — no remedial defect signed.
BEFORE: six wrong options all 'Not quite — “[label]” does not match...'
AFTER: k1 — near-1 → "An estimate near 1 would ACCEPT the wrong answer instead of exposing it..."; equal-16 → "16 is 4 × 4, a rounded benchmark — the true product only needs to land NEAR it..."; near-144 → "144 is the raw digit product with the point ignored...". k3 — 11 → "11 is what ADDING 6.2 and 5 would give..."; 3 → "3 is ten times too small — a single group of 6.2 is already double that..."; 300 → "300 would need a factor near 60...".
Verified: no broken template remains; probe pass; no other edits made.

## g5d-03-03
Defect (signed): remedial rem-g5dc-money-k byte-identical to k1 (otherwise strong lesson per S322-F10).
BEFORE: remedial prompt "A pocket holds 2 dimes and 4 pennies. Write the total amount in dollars as a decimal." ans 0.24 — byte-identical to k1.
AFTER: "A sticker's price tag reads 24 cents. Cents are hundredths of a dollar — write the price as a decimal number of dollars." ans 0.24 (Shape α — the remedial concept's own compute-in-cents route); traps 24 (cents kept) and 2.4 (cents as tenths; feedback notes 2.4 would be two dollars forty), both recomputed and literally true.
Verified: R1/R2 vs k1/k3 (dimes-pennies template) and k2/ch1 (wallet/lunch money), R3, R4 (dMoneyNumeric emits only the pocket-dimes-pennies template — src/lib/g4Variants.ts:1272), R5 (24, 2.4, 0.24 all distinct), R6 (concept body number-free). Course-wide remedial scan clean.

## g5d-03-04
Defect (signed): remedial rem-g5dc-measurement-k byte-identical to k1 (otherwise strong lesson per S322-F10).
BEFORE: remedial prompt "A ribbon measures 39 centimeters. One meter is 100 centimeters. Write the length in meters as a decimal." ans 0.39 — byte-identical to k1.
AFTER: "On a number line running from 0 to 1 meter, every tick is one centimeter. A snail stops at the 39th tick. How far has it crawled, in meters?" ans 0.39 (Shape α — the lesson's own numberLineHop representation from i1/i2); traps 39 (tick count = centimeters) and 3.9 (divided by ten) recomputed for tick wording.
Verified: R1/R2 vs k1/k2/ch1 (all ribbon/convert/express templates) and i1/i2/k3, R3, R4 (dMeasureNumeric emits only the ribbon template — src/lib/g4Variants.ts:1281), R5, R6 (concept body number-free). Course-wide remedial scan clean.

## g5d-03-05
Defects (signed): (a) k3 MCQ broken-template feedback ×3; (b) remedial rem-g5dc-multistep-k byte-identical to k1.
BEFORE (a): 'Not quite — “$0.42”/“$420.00”/“$42.00” does not match...'
AFTER (a): $0.42 → "A small discount cannot collapse $5 to under half a dollar — ten times too small, the mark of a decimal point slid one place left."; $420.00 → "about a hundred times the subtotal — a discount lowers a bill; it can never multiply it."; $42.00 → "about ten times the $5 subtotal — after a small discount the total must sit a little BELOW $5..."
BEFORE (b): remedial prompt "Working in hundredths: 6 items at 44 each, then 118 off. How many hundredths remain?" ans 146 — byte-identical to k1.
AFTER (b): "Six stickers cost $0.44 each, and a coupon takes $1.18 off the bill. Build the subtotal in hundredths first, then remove the coupon's 118 hundredths. How many hundredths are left to pay?" ans 146 (Shape α — money context the lesson's i1/i2 already use); traps 264 (stopped at subtotal) / 382 (added the coupon) recomputed; fallback names the route without stating 146. Math: 6 × 44 = 264; 264 − 118 = 146.
Verified: R1/R2 vs k1 ("Working in hundredths: 6 items at 44 each...") and ch1 ("For 6 items at 39 hundredths each..."), R3, R4 (mbMultiStepNumeric emits only the markers template — src/lib/g4Variants.ts:873), R5, R6 (concept body number-free). Course-wide remedial scan clean.
