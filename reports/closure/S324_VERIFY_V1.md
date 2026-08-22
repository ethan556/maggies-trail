# S324 Verification — V1 (audit of S323 fixer packets P1, P2, P5)

Verifier: cowork-s324-V1-verifier. Date: 2026-08-21T04:52Z.
Scope: 44 lessons — decimal-fluency-g5 ×15 (P1), word-problems-g3 ×12 (P2), shapes-space ×7 + shapes-and-sorting-k ×4 + length-problems-g2 ×6 (P5).
Read-only on content/src; wrote only this file and `reports/closure/cowork-staging/laneV-s324-V1.jsonl` (13 REVISE records).

## Method actually run

- Contracts re-read from S322_ASSESS_F10/F1/F11/F3/F5 and the S316-R remedial standard; fixer claims from S323_FIX_P1/P2/P5 and the laneA-s323-P{1,2,5} ledger tails (44 dispositions, all KEEP).
- Fresh `node scripts/session/print-review-basis.mjs` run over all 44 ids, diffed against every ledger `reviewedBasisHash` — **43/44 match; 1 mismatch (g2p-02-01, see findings)**.
- Node probe over all 54 lessons of the 5 courses: JSON parse (54/54 clean), digits→# normalized prompt clusters (within- and cross-lesson, steps + remedial checks), byte-identity checks on every flagged cluster, broken-template feedback grep (0 hits — the S322-F10 `Not quite — "[label]"` class is fully gone), MCQ single-correct (0 violations), numeric trap-equals-answer / duplicate-trap (0 violations), MCQ option-length ratios.
- Every widget in all 44 lessons digest-dumped and hand-recomputed: numeric answers, columnCalc a±b and each commonResults route, estimateSlider targets, numberLineHop lattices and commonLandings reachability (HopLandingW adds cland values as tappable choices — widgets.tsx:16987ff), MCQ option truth, every trap value against its feedback story.
- R4 generator checks driven from source: dHundredthsCellsNumeric/dMoneyNumeric/dMeasureNumeric/dTenthsWrite/dHundredthsWrite (g4Variants.ts:1130–1290), mbMultiplyTensNumeric/mbDivideBigNumeric/mbMultiStepNumeric (g4Variants.ts:786–890), Pv1000SubtractTradeNumeric (g2Variants.ts) — none can emit any of the new remedial prompts; fixer R4 claims confirmed.
- shapes-space: scripted assertion that every concept step (c1, c2, remedial concept) in all 7 lessons carries `narration` with no `* _ — – - →` characters (pass), plus full read of all 21 narration blocks against their bodies (faithful, instruction-complete, "6 by 3"/"yes or no"/"one fourth" conversions correct); `git diff` confirmed narration-lines-only edits.
- shapes-and-sorting-k: all four ch1 hint/explanationVariants sets read against their actual widgets — all now match (bird/rabbit/kite dragBucket; cone reasoning; triangles→square/3-squares→rectangle/6-squares→cube; color-vs-kind matchPairs); remedials distinct from k1; K language fit.

## Verified-clean lessons (31 — no ledger record, per instruction)

decimal-fluency-g5 (10): g5d-01-01, g5d-01-06, g5d-02-02, g5d-02-03, g5d-02-04, g5d-02-05, g5d-03-01, g5d-03-03, g5d-03-04, g5d-03-05 — every signed fix verified (answers, traps, R1–R6 including generator non-producibility and course-wide remedial dedup); all arithmetic recomputed correct.
word-problems-g3 (10): g3w-01-01, g3w-01-03, g3w-01-04, g3w-02-01, g3w-02-03, g3w-02-04, g3w-03-01, g3w-03-02, g3w-03-03, g3w-03-04 — all 25 replaced ±1 trap pairs now misconception-named with story-true values (each recomputed); g3w-03-04/k2 duplicate replaced with a genuine author-critique item, byte- and template-distinct from g3w-02-02/k1; no new duplicates.
shapes-space (7): geo-01-01, geo-01-02, geo-01-03, geo-02-01, geo-02-02, geo-03-01, geo-03-02 — narration contract fully satisfied, spoken-safe, content-faithful; diffs narration-only.
shapes-and-sorting-k (4): ks-01-03, ks-02-01, ks-02-03, ks-03-03 — hint/explanation↔widget mismatches fully repaired, including the ks-02-01 wrong-answer (sphere→cone) reasoning.

## Findings (13 REVISE records signed in laneV-s324-V1.jsonl)

The signed S323 fixes themselves verify correct in 42/44 lessons; 12 of the 13 findings are defects the fix left standing next to it (10 pre-existing/unsigned, 2 fix-scope), 1 is a fix that propagated a wrong trap (g5d-01-04).

1. **g5d-01-03** — i1/i2 columnCalc commonResults feedback contradicts trigger values: 693/823 blame "the carry the tenths column produced — a whole 0.10 lost" (the dropped carry is hundredths-produced; a tenths-produced carry is worth 1.00); 603/733 claim "Both carries were stranded" (only the tenths-produced one was; both-stranded = 693/723).
2. **g5d-01-04** — trap 518 (=ans+100) in k1 (654−236) and in the NEW remedial (6.54−2.36) claims "one trade taken but never paid back", but the only trade is hundredths-from-tenths: that error yields 428 (=ans+10). R5 violation inside the fix; k2 (680) and ch1 (636) are fine because their stories really trade from the hundreds column.
3. **g5d-01-05** — i1 (5.20−1.47) commonResults both mismatched: 433 labeled flip-both (flip-both = 427; 433 is borrow-then-flip), 387 labeled tenths-never-charged (that = 383; 387 is flip-hundredths-then-borrow). i2's 455/465 repair verified correct.
4. **g5d-02-01** — remedial R6 adjacency: concept body names 30, the unique content of the correct option in the immediately following estimate MCQ.
5. **g5d-03-02** — remedial R6 adjacency: concept body resolves "only 14.4 matches the estimate" for the exact 3.6×4/1.44 instance the check then asks.
6. **g3w-01-02** — i1 cland 8 vs feedback naming 4×7+1=29; i2 cland 20 vs feedback naming 3×5=15. Both are live tappable landings with misdiagnosing feedback.
7. **g3w-02-02** — remedial concept narrates its check's own instance ({4,6}, −5, "donated", worked to 24−5=19) immediately before the equation-identification check; every sibling remedial in the course uses different numbers.
8. **g2p-01-02** — remedial check byte-identical to k1 (S316-R R1/R3 hard fail).
9. **g2p-02-01** — remedial check byte-identical to k1; AND ledger basisHash stale (signed 8f3290…, fresh a7c5bb08a71e8c7672c66514bded705a49de524e59566794f71dae9568f2f1ae — drift caused by the same packet's later g2p-03-02 edit dissolving the shared duplicate cluster after signing; the record's own reopenCondition is triggered).
10. **g2p-03-01** — remedial check byte-identical to g2p-02-03/k3 — the very widget whose k1 duplication the F5 contract ordered removed still ships verbatim via the remedial route.
11. **g2p-03-02** — remedial check byte-identical to g2p-02-01/k3 (same pattern: signed duplicate only half-removed).
12. **g2p-03-03** — remedial check byte-identical to k1 (60−31+20 story, all strings equal).
13. **g2p-03-04** — remedial check byte-identical to g2p-01-03/k3, and it retains the CHOICE-0036 length/justification leak the fix corrected at k1.

Basis-hash mismatch list: **g2p-02-01 only** (all other 43 fresh hashes byte-match their ledger records; my 13 records carry fresh hashes).

## Observations recorded, not signed (outside scope or below bar)

- g5d-01-02 (out of scope, the course's lone S322 KEEP) has the same columnCalc class: cres 532 says "Two carries went missing" but is the one-carry-missing result (two-missing = 522). Same lane as findings 1–3; needs an owner.
- Remedial concept body byte-equals c2.body across most of decimal-fluency-g5 and length-problems-g2 — the unsigned "concept-side twin" class S316 §6 already records as separate assessor debt (worst cases: g5d-01-04/01-05 remedial bodies say "The picture shows…" with no figure attached). Not signed, per the S316 ruling that this is authored-prose work needing its own pass.
- Mild correct-option length skews (no contract demanded balance): g5d-03-01 remedial (71 vs 46/47/52), g3w-01-01 k3/remedial, g3w-03-01 remedial, g3w-03-04 remedial, geo-01-01/k1, geo-01-03/k1, geo-02-01/k3, geo-03-01/ch1.
- Several decimal k1/k2/ch1 steps declare `variant` forms whose generators cannot reproduce the authored prompt (e.g. "Working in hundredths: compute 43 × 4" vs mbMultiplyTensNumeric's "Compute a × tens." with tens ∈ {20…90}) — pre-existing variant-declaration debt, replay-swap risk only.
- Number-normalized same-template repeats within/across lessons (g5d "Working in hundredths…" family; g2p ribbon/pencil families) were left unflagged per the explicit S322-F10/F5 precedent and the P5 PROGRESSION fluency-rationale closures, which I read and did not relitigate.
