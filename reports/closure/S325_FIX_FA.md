# S325 Fix Packet FA — 7 verifier-diagnosed defects (s324-V1)

Fixer: cowork-s325-FA-fixer. Date: 2026-08-21T05:20Z.
Scope: the 7 REVISE findings signed by s324-V1 (records `s324-V1-<lessonId>` in the S244 ledger tail;
narrative in `reports/closure/S324_VERIFY_V1.md`) — decimal-fluency-g5: g5d-01-03, g5d-01-04,
g5d-01-05, g5d-02-01, g5d-03-02; word-problems-g3: g3w-01-02, g3w-02-02.
Files touched: only the 7 lesson JSONs above. No src/**, scripts/**, ledger, or other staging files.

Provenance note (recorded for audit honesty): on packet start, the working tree already contained
the corrective edits for all 7 findings (file mtimes 05:12–05:14Z, i.e. after the 04:52Z verifier
signing), but NO S325 staging record, evidence file, or ledger line existed anywhere — an earlier
incarnation of this packet evidently applied the edits and died before verifying or signing. This
run therefore re-derived every value from scratch in node one-offs (all recomputations below run and
passed, including the S316-R R1/R2/R3 clauses against every main-step prompt for each
remedial-bearing lesson), adopted the edits as its own after full verification, and signs them here.
Verification transcript clauses: 60/60 content assertions PASS (one scripted FAIL was a
floating-point artifact of the test itself: `4.9*6 === 29.4` is false in IEEE 754; `4.9 × 6 = 29.4`
exactly in decimal).

---

## 1. g5d-01-03 — i1/i2 columnCalc feedback misdiagnosed its triggers

Finding: 693/823 blamed on "the carry the tenths column produced — a whole 0.10 lost" (a
tenths-produced carry is worth 1.00, and the dropped carry is hundredths-produced); 603/733 claimed
"Both carries were stranded" (only the tenths-produced one was; both-stranded = 693/823 again).

Recomputed error paths (i1, 5.68 + 1.35 = 7.03; digits h/t/o = hundredths/tenths/ones):
- correct: h 8+5=13 → write 3 carry 1; t 6+3+1=10 → write 0 carry 1; o 5+1+1=7 → **703**.
- drop the hundredths-produced carry: h→3, t 6+3=9 (no further carry), o 6 → **693** = 0.10 short.
- keep h-carry, strand the tenths-produced carry: h→3 c1, t 10→0 carry dropped, o 5+1=6 → **603** = 1.00 short.
- both stranded ALSO gives 693 (t 9 produces no carry), so 603 is single-strand only.

Recomputed error paths (i2, 6.47 + 1.86 = 8.33):
- correct: h 7+6=13 → 3 c1; t 4+8+1=13 → 3 c1; o 6+1+1=8 → **833**.
- drop hundredths-produced carry: h 3, t 4+8=12 → 2 c1, o 8 → **823** = 0.10 short.
- strand tenths-produced carry: h 3 c1, t 13→3 drop, o 6+1=7 → **733** = 1.00 short.

Fix applied — trigger values kept, feedback rewritten to be literally true:
- 693 before: "693 hundredths dropped the carry the tenths column produced — a whole 0.10 lost."
  693 after: "693 dropped the carry the hundredths column produced — 8 + 5 = 13 wrote the 3, but the
  traded tenth never reached the tenths column, leaving the total 0.10 short."
- 603 before: "Both carries were stranded, so the total is short by the bundles they were carrying."
  603 after: "603 kept the hundredths trade but stranded the carry the tenths column produced —
  6 + 3 + 1 = 10 wrote the 0, but the traded whole never reached the ones, leaving the total 1.00 short."
- 823/733 (i2): same treatment with i2's own digits (7 + 6 = 13; 4 + 8 + 1 = 13), 0.10 / 1.00 shortfalls.

## 2. g5d-01-04 — trap 518 unreachable by its unpaid-trade feedback (k1 AND remedial)

Finding: trap 518 (= ans+100, the Pv1000SubtractTradeNumeric hundreds-trade formula) carried
"one trade taken but never paid back" in k1 (654 − 236) and in the S323 remedial (6.54 − 2.36), but
the only trade in this subtraction is hundredths-from-tenths, whose unpaid form yields 428.

Recomputed (654 − 236 = 418): h 4−6 short → trade: 14−6=8, tenths 5→4; t 4−3=1; o 6−2=4 → **418**.
Unpaid trade (tenths never drop): t 5−3=2 → **428** (= ans+10). 518 is reachable by no plausible
path here (no tens/hundreds trade exists: tenths 5−3 and ones 6−2 both clear).

Fix applied in BOTH places — trap value corrected to the true error-path value:
- k1: `518 / "One trade was taken but never paid back — the column you borrowed from must drop by
  one."` → `428 / "One trade was taken but never paid back — the column that lent a ten to make
  14 − 6 must drop from 5 to 4 before subtracting the 3."`
- remedial rem-g5dc-sub-k: `518 / same false claim` → `428 / "One trade was taken but never paid
  back — the tenths column lent a ten to make 14 − 6, so its 5 must drop to 4 before subtracting the 3."`
- R5 re-verified: traps 890 (= 654+236, add-instead) and 428 distinct, neither equals 418.
- k2 (901−321=580, trap 680 = unpaid hundreds trade) and ch1 (725−189=536, trap 636 = unpaid
  hundreds trade) recomputed and confirmed genuinely reachable — untouched, per the finding.
- R4 spot-check: `Pv1000SubtractTradeNumeric` (src/lib/g2Variants.ts:91) emits only
  `"${a} − ${b2} = ?"`; the remedial's stacked-subtraction prompt is not producible by it.

## 3. g5d-01-05 — i1 commonResults values swapped/wrong

Finding: 433 labeled flip-both (flip-both = 427); 387 labeled tenths-never-charged (that = 383).

Recomputed error paths (5.20 − 1.47 = 3.73; a = o5 t2 h0, b = o1 t4 h7):
- correct: h 10−7=3 (tenths 2→1), t 11−4=7 (ones 5→4), o 4−1=3 → **373**.
- flip both short columns: h 7−0=7, t 4−2=2, o 5−1=4 → **427** (not 433).
- borrow reaches hundredths but tenths never charged: h 10−7=3, t stays 2 → 12−4=8 (ones 5→4),
  o 4−1=3 → **383** (not 387).

Fix applied — values corrected to match the (retained, accurate) feedback stories:
- `433` → `427` ("427 flipped the short columns instead of trading — 7 − 0 and 4 − 2 are not legal
  moves when the top is smaller.")
- `387` → `383` (feedback extended with the proof digit: "… — the 2 tenths should have dropped to 1.")
- i2 (6.30 − 2.85 = 3.45) re-verified untouched and correct: flip-both → 455; borrow-once-then-
  flip-tenths → 465. Traps ≠ 373/345, distinct.

## 4. g5d-02-01 — remedial R6 answer adjacency (body named 30)

Finding: remedial concept body "…A result far from 30 has the decimal point in the wrong place."
named 30, the unique identifying value of the correct option ("5 × 6 = 30, so a little under 30") of
the immediately following check.

Fix applied — body rewritten with NO digits at all (verified `/\d/` finds none):
"To estimate a product, round the decimal factor to the nearest whole number and multiply the
wholes — that benchmark predicts the size of the true answer. After multiplying, compare: a product
many times bigger or smaller than the benchmark has its decimal point in the wrong place."
narration === body. Check untouched (4.9 × 6 = 29.4; 5 × 6 = 30 → "a little under 30" remains the
uniquely correct option, now nowhere pre-stated). R6 satisfied.

## 5. g5d-03-02 — remedial R6 adjacency (body resolved the check's exact instance)

Finding: body "The digits 144 can name 1.44, 14.4, or 144, but only 14.4 matches the estimate."
resolved the exact 3.6 × 4 / 1.44 instance the adjacent check asks.

Fix applied — body re-taught on a DIFFERENT instance, check keeps its current one:
"An estimate decides where the point belongs. Take 5.2 × 3: the digit work gives 156, which could
name 1.56, 15.6, or 156 — but three groups of about five total about fifteen, so only 15.6 fits.
The estimate never changes the digits; it picks which size the answer must be."
Recomputed: 5.2 × 3 = 15.6; 52 × 3 = 156; 3 × 5 = 15 ✓. 5.2 × 3 appears in no other step of the
lesson (i1/i2/k1 use 3.6 × 4; k2 58 × 6; k3 6.2 × 5; ch1 7 × 50 − 288). Body contains none of
3.6 / 1.44 / 14.4 / "near 14"; narration === body; check widget byte-untouched. R6 satisfied.

## 6. g3w-01-02 — commonLandings mismatch their feedback

Finding: i1 cland 8 with feedback naming 4×7+1 = 29; i2 cland 20 with feedback naming 3×5 = 15.

Recomputed: i1 (5 vans × 7 hikers, answer 35): extra-van-as-one-hiker = 4×7+1 = **29**;
sibling cland 28 = 4×7 (correct as authored). i2 (3+2 carts × 6 boxes, answer 30):
count-times-count = 3×5 = **15**; sibling cland 18 = 3×6 (correct as authored).

Fix applied — landing values made equal to the arithmetic their feedback describes:
- i1: `8` → `29`, feedback now "That added the extra van as a single hiker: 4 × 7 then + 1 gives 29.
  A whole van brings a whole group of 7."
- i2: `20` → `15`, feedback now "That multiplies the original cart count by the combined count —
  3 × 5 — instead of using six boxes per cart."
Both landings verified inside widget range (0–60 / 0–42), distinct from each other's sibling and
from the answers 35/30. The signed S323-P2 trap fixes (k1 25 with 10/20, k3 30 with 24/11,
ch1 32 with 12/28) recomputed and left intact.

## 7. g3w-02-02 — remedial concept narrated its check's own instance (R6)

Finding: body "Six groups of 4 make 24. When 5 are donated once from the total, 24 − 5 = 19."
narrated the adjacent check's instance ({4,6}, −5, "donated", worked to 19).

Fix applied — body re-taught on a DIFFERENT instance ({2,7,3}, "sold"), check keeps {4,6,5}/"donated":
"Two crates hold 7 jars each, so the total is 2 × 7 = 14. If 3 jars are then sold once from the
whole load, subtract after building the total: (2 × 7) − 3 = 11. Writing 2 × (7 − 3) = 8 instead
would sell 3 jars from EVERY crate — the brackets record whether a change happens once to the total
or inside each group."
Recomputed: 2×7 = 14; 14−3 = 11; 2×(7−3) = 8 ✓. Body shares no number, verb, or worked result with
the check ((4 × 6) − 5 = 19); check widget byte-untouched; narration === body. The signed S323-P2
trap fixes (k2 32 with 22/50; ch1 40 with 13/45) recomputed and left intact. S316-R conformance
re-verified: R1/R2 (normalized, vs ALL main-step prompts)/R3 pass; k1 declares no variant (R4
vacuous); R5 traps true and distinct; R6 now clean.

---

## S316-R sweep over the packet's remedial-bearing lessons

Scripted (node one-off): for each of g5d-01-03, g5d-01-04, g5d-02-01, g5d-03-02, g3w-02-02 —
R1 prompt ≠ k1, R2 normalized(prompt) ≠ normalized(every main-step prompt), R3 widget JSON ≠ k1
widget JSON: all PASS. g5d-01-05 and g3w-01-02 required no remedial changes.

Count: 7 findings dispatched, 7 fixed, 0 blocked.
