# S326 Reconciliation — Packet R2 (G3–G5 + HS course rows)

Scope: 17 red tests across 16 test files from reports/closure/S325_NEW_PLATFORM_REDS.txt.
Method: per-file verbose run, root-cause trace to signed authority, classify STALE PIN / REAL REGRESSION / PRE-EXISTING, re-pin with the test's own algorithm (never weakening assertions), re-run to green.

## 1. src/lib/session257.wordProblemsG3CourseIntegrity.test.tsx
- Failure: "renders all 24 exact registered accessible semantic figures" — g3w-02-01 concepts expected ["ee-variable","mult3-missing-factor"], received ["ee-variable","mult3-missing-factor-6x7"].
- Classification: (a) STALE PIN.
- Root cause: S318 figure-blocklist repair rebound g3w-02-01/c2 from the fixed 4×□=12 exemplar `mult3-missing-factor` to the new parameterized wrapper `mult3-missing-factor-6x7` (chapter's own 6×n=42 fact). The S257 expectedFigures map still pinned the old ID.
- Signed authority: recordId S318-FIGA-G3-g3w-02-01-c2 (reports/closure/cowork-staging/laneA-s318-g3-figures.jsonl); corroborated by S318_G3_CLEARANCE_VERIFICATION.md (g3w-02-01 c2 → mult3-missing-factor-6x7, 6×7=42) and S324_ENGFIG.md / S325_VERIFY_VENG.md notes.
- Pin change: expectedFigures["g3w-02-01"][1] "mult3-missing-factor" → "mult3-missing-factor-6x7". No assertion weakened; figure render/accessibility checks still apply to the new ID.
- Result: GREEN (5/5).

## 2. src/lib/session252.unlikeFractionsG5CourseIntegrity.test.tsx
- Failure: "preserves all evaluator IDs and correctness while repairing learner-visible truth" — evaluatorRows sha256 pin mismatch (expected 960b2d2c…, received 467b3c5c…).
- Classification: (a) STALE PIN.
- Root cause: signed S323-P4 dedup/truth fixes changed numeric evaluator answers inside the hashed signature set: g5u-01-02/k1 (ans 3→4, "1/3 = ?/12"), g5u-01-03/k2 ("1/6 = ?/12" ans 2), g5u-01-04/k2 ("3/4 = ?/12" ans 9), g5u-03-01/k3 (jug-story ans 5 → "pieces short of a whole" ans 1). All recomputed math verified in the signed record (1/3=4/12, 1/6=2/12, 3/4=9/12, 8/8−7/8=1/8).
- Signed authority: recordIds s323-P4-g5u-01-02, s323-P4-g5u-01-03, s323-P4-g5u-01-04, s323-P4-g5u-03-01 (reports/closure/cowork-staging/laneA-s323-P4.jsonl; details in reports/closure/S323_FIX_P4.md).
- Pin change: hash re-pinned with the test's own evaluatorSignature algorithm: 960b2d2cd31e09f30a84aaaa595b3308b4fcb50fe0030b82459a0063c3ec3bfa → 467b3c5cb0c34def0b23cebbe287d6b861031f8574ff0a507665fb7cd891317e. All per-widget evaluator-correctness assertions upstream of the hash still run and pass unweakened.
- Result: GREEN (5/5).

## 3. src/lib/session197.unlikeFractionsG5.test.ts
- NEW red in scope: "g5u-03-01: A-tier shape, solver agreement, widget contracts" — independent route derived 14 for k3 (faLikeDenomWordNumeric summed the numerators of "7/8 … 7/8") vs authored answer 1.
- Classification: (a) STALE PIN (independent-route coverage stale against a signed item rewrite).
- Root cause: signed S323-P4 replaced g5u-03-01/k3's jug-story duplicate (byte-identical to g5u-03-03/k1) with the benchmark item "7/8 sits just below one whole. How many eighth-size pieces short of a whole is 7/8?" (ans 1 = 8/8 − 7/8, verified). The S197 route for faLikeDenomWordNumeric only knew add / "were available"-subtract of two explicit numerators.
- Signed authority: recordId s323-P4-g5u-03-01 (laneA-s323-P4.jsonl; S323_FIX_P4.md "g5u-03-01" section).
- Pin change (no assertion weakened; both routes still re-derive from learner-visible prompt only):
  - src/lib/g4Independent.cjs faLikeDenomWordNumeric: additive branch — /short of a whole/i → den − num (returns 8−7=1).
  - session197 inline direction check: same additive branch (gap items expected = dens[0] − nums[0]); add/"were available" logic untouched.
- Result: scoped test GREEN. File overall 7 failed | 13 passed — the 7 others are (c) PRE-EXISTING (below).
- Pre-existing (c), documented only — NOT in S325_NEW_PLATFORM_REDS.txt, and each crashes on a step whose prompt is byte-identical to clean HEAD (verified via git show HEAD diff):
  - g5u-01-01, g5u-01-05, g5u-02-01, g5u-02-03: lesson files entirely unmodified in tree; red at clean HEAD.
  - g5u-01-04: crash in faEquivalenceRuleNumeric on unchanged k3 prompt ("A learner scales 1/4 to twelfths but writes 2/12…" matches neither solver regex).
  - g5u-02-02: crash in faMixedAddSubNumeric on unchanged k3 prompt ("A learner combines 2 3/8 and 1 2/8…").
  - g5u-03-03: crash in faLikeDenomWordNumeric on unchanged k3 prompt (fractions spelled in words: "one sixth and then three sixths").

## 4. src/lib/session196.multDivFluencyG4.test.ts
- NEW red in scope: "g4m-02-05: A-tier shape, solver agreement, widget contracts" — EXPECTED_NUMERIC_ANSWERS pinned g4m-02-05/k1 = 199, content answers 219.
- Classification: (a) STALE PIN.
- Root cause: signed S320 small-debt Item 2 replaced the cross-lesson duplicate fact 1,393 ÷ 7 = 199 (byte-identical to g4m-02-03/ch1) with 1,752 ÷ 8 = 219 in g4m-02-05/k1 (+ its remedial), traps 2190/21 recomputed. 219 × 8 = 1,752 verified.
- Signed authority: recordIds S320-A-g4m-02-05-k1 and S320-A-g4m-02-05-remedial (reports/closure/cowork-staging/laneA-s320-smalldebt.jsonl; reports/closure/S320_SMALL_DEBT_FIXES.md Item 2).
- Pin change: EXPECTED_NUMERIC_ANSWERS["g4m-02-05/k1"] 199 → 219. Evaluate/trap assertions unweakened.
- Result: scoped test GREEN. Remaining red in file: "every interactive step uses an engine rated manip >= 2" (g4m-01-01/i2 numeric rates manip 0) — (c) PRE-EXISTING: not in S325_NEW_PLATFORM_REDS.txt and g4m-01-01.json is unmodified in tree (last touched at commit c5af1f1). Documented only.

## 5. src/lib/session196.patternsFactorsG4.test.ts
- NEW red in scope: "g4p-03-04: A-tier shape, solver agreement, widget contracts" — solver and inline route derived 144 for k2 vs authored 96.
- Classification: (a) STALE PIN (independent-route coverage stale against a signed item rewrite).
- Root cause: signed S323-P7 replaced g4p-03-04/k2's duplicate ("4, 8, 16, 32 → 64", byte-identical to g4p-03-02/k3) with 'The stated rule is "multiply by 2": 6, 12, 24, 48 → 96' (48×2=96 verified; traps 72/50 recomputed). The route's heuristic multiplier ns[1]/ns[0] now reads the stated rule number "2" as the first sequence element (6/2=3 → 48×3=144).
- Signed authority: recordId s323-P7-g4p-03-04 (reports/closure/cowork-staging/laneA-s323-P7.jsonl; reports/closure/S323_FIX_P7.md "g4p-03-04").
- Pin change (both still derive from prompt text only, no weakening): src/lib/g4Independent.cjs mbPatternsNumeric + session196 inline check now read the multiplier from a stated /rule is "multiply by (\d+)"/ when present, else fall back to the original first-ratio derivation.
- Result: scoped test GREEN. Remaining 5 reds — g4p-01-01, g4p-01-02, g4p-01-03, g4p-02-01, g4p-03-01 — are (c) PRE-EXISTING: none in S325_NEW_PLATFORM_REDS.txt, all five lesson files unmodified in tree (only g4p-02-02/03-02/03-03/03-04 carry S323-P7 edits). Documented only.

## 6. src/lib/session248.multDivFluencyG4CourseIntegrity.test.ts
- NEW red in scope: "ratchets independent mathematical truth defects" — two stale pins inside one test:
  1. g4m-02-04 i1/i2: pin required successFeedback to contain "exact quotient is 213" on BOTH sliders; i2 was rewritten (dup i1==i2 fix) to 636 ÷ 4 with truthful "exact quotient is 159".
  2. g4m-02-03 i1/i2: pin required lowFeedback to contain "3 hundreds" on BOTH sliders; i2 was rewritten (dup fix) to 828 ÷ 4 with truthful "8 hundreds … gives 2 hundreds".
- Classification: (a) STALE PIN (both).
- Signed authority: recordIds S319-EARLY-g4m-02-04 and S319-EARLY-g4m-02-03 (reports/closure/cowork-staging/laneA-s319-early.jsonl; S319_ASSESS_DIG4_MDF4.md REVISE rows, S319_EARLY_GRADE_CONTRACTS.md table: g4m-02-03 → 828 ÷ 4 = 207-range claim, g4m-02-04 → 636 ÷ 4 = 159).
- Pin change: both assertions now re-derive each step's truth from its own prompt (quotient = dividend ÷ divisor for the "exact quotient is N" containment; hundreds-per-group = hundreds digit ÷ divisor for the lowFeedback containment). Math verified: 852/4=213, 636/4=159, 9/3=3, 8/4=2. The /broad.*not an exact answer/ and negative-match guards kept unweakened.
- Result: scoped test GREEN. Remaining red in file: "uses synchronized semantic visuals instead of the generic hop figure" (distinct concept-figure count 14 vs pinned 13) — (c) PRE-EXISTING: not in S325_NEW_PLATFORM_REDS.txt; mult-div-fluency-g4 content and the S248 test were both fully committed before this wave. Documented only.

## 7. src/lib/session265.longDivisionG5Course.test.ts (2 scoped reds)
- Failures: "turns every duplicate second interaction into a distinct evaluator-preserving transfer" (g5l-03-01 i2 prompt no longer contains "5 × 26 = 130") and "keeps all six repaired evaluator targets mathematically coherent" (adjustment slider target 15, pinned 4×26=104).
- Classification: (a) STALE PIN (both).
- Root cause: signed S318 progression fix redesigned g5l-03-01/i2 — it was template-identical to i1 ("N×D=P overshoots — slide to what M×D gives") and now asks for the RESULTING REMAINDER after the corrected digit: 119 − 4×26 = 15 (15 < 26 divisor, hand-verified in the signed report). The S265 pins predated that redesign.
- Signed authority: recordId PROGRESSION-g5l-03-01 (reports/closure/cowork-staging/laneA-s318-prog.jsonl; S318_PROG_P0_IMPLEMENTATION.md §9; slider bounds re-verified in S318_K2QDPROG_VERIFICATION.md "119−104=15").
- Pin changes: expectedI2Prompts["g5l-03-01"] "5 × 26 = 130" → "subtracting 104 from the 119" (still distinct from i1's prompt, distinctness assertion untouched); target pin 4*26 → 119 − 4*26 with the coherence bound tightened to target < 26 (remainder below divisor) replacing the now-vacuous < 119.
- Result: GREEN (6/6).

## 8. src/lib/session303.patternsFactorsG4P1ProgressionRepair.test.ts
- Failure: "hash-locks every field other than the nine declared bodies and prompts" — g4p-03-02 nonPermittedHash mismatch (loop stops at first mismatch; g4p-03-03 and g4p-03-04 hashes were also stale for the same reason).
- Classification: (a) STALE PIN.
- Root cause: signed S323-P7 dedup fixes rewrote the k2 widget (plus its hints/explanationVariants) in g4p-03-02, g4p-03-03, g4p-03-04 — the "add 6, 4-10-16-22" MCQ was byte-identically reused across consecutive lessons. k2 sits inside the S303 hash-locked field set (only each contract's i2 body/prompt is excluded), so the lock moved by design of the signed edit. All replacement math verified in the signed report (gap-2 triangle pattern; 4,8,12,16 evenness; 48×2=96).
- Signed authority: recordIds s323-P7-g4p-03-02, s323-P7-g4p-03-03, s323-P7-g4p-03-04 (reports/closure/cowork-staging/laneA-s323-P7.jsonl; reports/closure/S323_FIX_P7.md).
- Pin change: nonPermittedHashes re-pinned with the test's own algorithm — g4p-03-02 6b1524a3… → eab84289…, g4p-03-03 9d8c958a… → b8bc5aa3…, g4p-03-04 f1cb2dcd… → 5eade465…. The other five hashes recomputed byte-identical (verified) and left untouched. Contract body/prompt/evaluator assertions unweakened.
- Result: GREEN (4/4).

## 9. src/lib/session304.fractionMultiplyG4P0FigureFailclose.test.ts
- Failure: "hash-locks every field outside the 20 declared fail-closed visual placements" — g4x-01-03 nonPermittedHash mismatch (loop stops at first mismatch; recomputation showed g4x-03-02 and g4x-03-04 stale too, other nine byte-identical).
- Classification: (a) STALE PIN.
- Root cause: signed S320-impl contract implementations (committed in a78d6a3) edited widgets inside the S304 locked field set: g4x-01-03 k-step MCQ 2/5×3 → 3/8×4 (4 × 3/8 correct, 12/8 recomputed), g4x-03-02 convert item 2 3/4→11 replaced by 4 2/3→14 (4×3+2=14), g4x-03-04 compute item 3×2/6→6 replaced by 4×2/9→8. All arithmetic verified.
- Signed authority: recordIds IMPL-g4x-01-03, IMPL-g4x-03-02, IMPL-g4x-03-04 (reports/closure/cowork-staging/laneA-s320-impl-7.jsonl).
- Pin change: nonPermittedHashes re-pinned with the test's own algorithm — g4x-01-03 f28c9396… → 846e56ed…, g4x-03-02 ac141cf5… → ba9f840c…, g4x-03-04 aa18bb54… → 7282a477…. The 20 fail-closed placement assertions and evaluator contracts unweakened.
- Result: GREEN (3/3).

## 10. src/lib/session300.fractionsAddP1ChoiceProgressionRepair.test.ts
- Failure: "locks every field outside the explicitly allowed labels, bodies, and prompts" — fa-02-02 nonPermittedHash mismatch; recomputation also showed fa-04-02 stale (loop stops at first mismatch), other five byte-identical.
- Classification: (a) STALE PIN.
- Root cause: signed, committed edits inside the S300 locked field set: fa-02-02 QD P0 redesign (commit 992b590 — k2 "Team A/Team B" MCQ became the 1/2-benchmark left/right/can't-tell dragBucket-style surface with doubled-comparison feedback, all pair math verified in S318_K2QDPROG_VERIFICATION.md Scope B); fa-04-02 IMPL contract label fix "3" → "5" (commit a78d6a3).
- Signed authority: recordIds S318-QD-fa-02-02 (reports/closure/cowork-staging/laneA-s318-qd.jsonl; S318_QD_P0_IMPLEMENTATION.md) and IMPL-fa-04-02 (reports/closure/cowork-staging/laneA-s320-impl-7.jsonl).
- Pin change: nonPermittedHashes re-pinned with the test's own algorithm — fa-02-02 34953402… → 3a828a6d…, fa-04-02 ee289c3c… → afa55e12…. Choice/progression contract assertions unweakened.
- Result: GREEN (4/4).

## 11. src/lib/session298.solvingEquationsFigureChoice.test.ts
- Failure: "fails closed on the source-controlled flip-arrow binding…" — alg1-04-02/c1 body/narration pins still carried the −2x < 6 worked example; content now teaches −3x < 9.
- Classification: (a) STALE PIN.
- Root cause: signed S320 IMPL-A8 removed c1's answer leak (its worked example stated k1's exact −2x<6 → x>−3); replaced with −3x<9 → x>−3 (same solution, different equation; divide by −3 and flip, verified). Narration updated in lockstep ("negative three x less than nine…").
- Signed authority: recordId S320-IMPL-A8-alg1-04-02 (reports/closure/cowork-staging/laneA-s320-impl-5.jsonl; reports/closure/S320_IMPL_A8.md).
- Pin change: figureBody/figureNarration constants re-pinned to the current truthful strings (exact bytes read from the lesson); body/narration parity and figure/widget fail-closed assertions unweakened.
- Result: GREEN (3/3).

## 12. src/lib/session268.measureMoneyTimeCourse.test.ts
- Failure: "uses graph figures that match the taught representation and an exact clock explanation" — mmt-03-02/c2 body pin required digits "25, 50, 75"; content now spells "twenty-five, fifty, seventy-five".
- Classification: (a) STALE PIN.
- Root cause: signed S318 figure-alignment risk fix reworded c2 to spell the coin values exactly as the mmt-biggest-first figure title spells them (word-parse atoms 20/5 shared), rotating a stale blocklist fingerprint. Same mathematical claim (quarters 25→50→75).
- Signed authority: recordIds S318-FIGA-mmt-03-02 and S318-FIGA-RISK-mmt-03-02 (reports/closure/cowork-staging/laneA-s318-k2-figures.jsonl; committed in 992b590).
- Pin change: .toContain("25, 50, 75") → .toContain("twenty-five, fifty, seventy-five"). Figure-binding and clock assertions untouched.
- Result: GREEN (2/2).

## 13. src/lib/session279.exponentialFunctionsCourse.test.ts
- Failure: "retains only the exact generic decay-rate visual for the verified 80-to-40-to-20 source contract" — exp-02-03/c3 body pins "Losing 50% from 80" / "80, 40, 20" no longer match.
- Classification: (a) STALE PIN.
- Root cause: signed S318 HS figure fix minimally paraphrased c3's body (same numbers 50/80/40/20, same add-vs-subtract framing) to rotate its binding key off the raw blocklist hash 67c19c25 → 4ee4868e; content claim unchanged ("Losing 50% from a start of 80 gives D(x) = 80 · (1/2)ˣ, stepping 80, then 40, then 20").
- Signed authority: recordId S318-FIGA-exp-02-03-c3 (reports/closure/cowork-staging/laneA-s318-hs-figures.jsonl; committed in 992b590).
- Pin change: containment pins re-pinned to the signed wording ("Losing 50% from a start of 80", "80, then 40, then 20"); D(x) formula, figure-id, renderer-source, and registry assertions unweakened.
- Result: GREEN (3/3).

## 14. src/lib/session288.rightTrianglesTrigFigureChoice.test.ts
- Failure: "preserves evaluators and feedback while closing all seven choice-length leaks" — rt-01-04/i2 labels-hash mismatch (evaluator seal cf/f33018bd… still matched; only the labels hash moved).
- Classification: (a) STALE PIN.
- Root cause: signed S319 RTT choice-parity fix lengthened distractor labels o2/o3/o4 with true elaborations of each wrong step (recomputed against the lesson's 1:√3:2, hypotenuse-6 example), leaving correct flag/ids/order/feedback untouched — exactly the label-only change the two-hash design isolates.
- Signed authority: recordId S319-RTT-rt-01-04-i2 (reports/closure/cowork-staging/laneA-s319-rtt.jsonl).
- Pin change: rt-01-04/i2 labelsHash cf33fbe7… → 6ede72d1… (recomputed with the test's own algorithm; other six rows recomputed byte-identical). Evaluator seals and length-leak guard unweakened.
- Result: GREEN (3/3).

## 15. src/lib/session289.logarithmsChoiceFigure.test.ts
- Failure: "retains the exact logarithmic ladder binding only for its matching source claim" — lg-05-03/c1 body seal mismatch.
- Classification: (a) STALE PIN.
- Root cause: signed S318 HS figure fix added the ladder's missing rungs to c1's body (magnitude 3 and ×1000) so the text reaches exact numeric parity with log-scale-ladder's registered claim (magnitudes 3–6, factors ×10/×100/×1000; 10^3=1000 verified).
- Signed authority: recordId S318-FIGA-lg-05-03-c1 (reports/closure/cowork-staging/laneA-s318-hs-figures.jsonl; committed in 992b590).
- Pin change: body sha256 d0a12bd7… → 4e6d4f6d… (test's own hash algorithm); figure-binding assertion unweakened.
- Result: GREEN (3/3).

## 16. src/lib/session290.proportionalRelationshipsFigureChoice.test.ts
- Failure: "withholds all mismatched fixed exemplars and retains only the exact markdown model" — pr-04-02/c2 body seal mismatch.
- Classification: (a) STALE PIN.
- Root cause: signed S318 HS figure fix appended ", the same as multiplying $80 × 0.95" to c2's markdown body so it states pr-markdown's registered claim ($80 × 0.95 = $76); subtraction and complement-multiplier paths mathematically identical.
- Signed authority: recordId S318-FIGA-pr-04-02-c2 (reports/closure/cowork-staging/laneA-s318-hs-figures.jsonl; committed in 992b590).
- Pin change: body sha256 5ab34fff… → 197d5b7a…; figure-binding and service-fee evaluator assertions unweakened.
- Result: GREEN (3/3).

## 17. src/lib/session261.vis03SingletonClosure.test.ts
- Failure: "coordinate-proofs/cx-02-03/c1 has no misleading figure binding" — c1 now binds cx-perp-slopes; pin expected the S261 fail-close (figure undefined).
- Classification: (a) STALE PIN (fail-close superseded by a signed truthful rebinding).
- Root cause: signed S319 figure-contract fix removed cx-perp-slopes from its mismatched cx-02-02/c2 placement (parallel-converse prose) and bound it at its true home cx-02-03/c1, the step that literally derives m₁·m₂ = −1.
- Signed authority: recordId S319-A-cx-02-02 (reports/closure/cowork-staging/laneA-s319-figures.jsonl; S319_FIGURE_CONTRACTS_IMPLEMENTATION.md §7; S319_ASSESS_CP_SG.md).
- Pin change: the cx-02-03 row now pins the exact expected binding "cx-perp-slopes" (per-row expectedFigure added); the five other rows still pin undefined. Assertion strengthened from "undefined" to "this exact figure", not weakened.
- Result: GREEN (6/6).

## 18. src/lib/session179.linearFunctions.test.ts
- Failure: "parallel-perpendicular/ch1 asks for a PERPENDICULAR slope, not a parallel intercept" — exactNumberTruth answer 7 vs pinned −3.
- Classification: (a) STALE PIN.
- Root cause: signed S323-P7 redesigned lf-04-03/ch1 — it was a cosmetic clone of i2's "flip a fraction slope" job (answer −3). New shape is the contract's two-step build-the-perpendicular-line-through-(2,1) job: approxFormula b = y − (−(1/m))·x = 1 − (−3)·2 = 7, success names y = −3x + 7. Math verified in the signed report (−(1/(1/3)) = −3; −3·2 + 7 = 1; (1/3)·(−3) = −1).
- Signed authority: recordId s323-P7-lf-04-03 (reports/closure/cowork-staging/laneA-s323-P7.jsonl; reports/closure/S323_FIX_P7.md "lf-04-03").
- Pin change: test retitled to the new signed job; answer pin re-derived as 1 − (−3)·2 = 7 via the test's own exactNumberTruth path; /perpendicular/i prompt guard kept.
- Result: GREEN (5/5).

## Cross-cutting safety check
- src/lib/g4Independent.cjs (test-only, 13 consumer test files) received two ADDITIVE branches (faLikeDenomWordNumeric "short of a whole"; mbPatternsNumeric stated 'rule is "multiply by k"'). variants.test.ts re-run: its 32 reds are all pr-unit-rate/pct-of-number/pr-test-proportional/pr-constant-k/g13-calculus generator forms — R3-scope/pre-existing, none touch the edited g4-fractions/g4-multiply branches; 3964 tests still pass, no new failures introduced.

## Summary
- Scoped rows resolved: 17/17 test rows (16 files) — ALL GREEN.
- Classification counts: (a) STALE PIN = 17 scoped rows (18 report entries; every scoped red traced to a signed content change with recorded recordId); (b) REAL REGRESSION = 0 (no content edits, no corrective dispositions needed — reports/closure/cowork-staging/laneA-s326-R2.jsonl intentionally not created); (c) PRE-EXISTING documented only = 14 unscoped red test rows left red: session197 ×7 (g5u-01-01/-01-04/-01-05/-02-01/-02-02/-02-03/-03-03 solver-coverage crashes on prompts byte-identical to HEAD), session196.multDivFluencyG4 ×1 (manip>=2 on g4m-01-01/i2), session196.patternsFactorsG4 ×5 (g4p-01-01/-01-02/-01-03/-02-01/-03-01), session248 ×1 (figures.size 14 vs 13).
- No assertion was deleted or weakened; hash pins recomputed with each test's own algorithm; every re-pin cites its signed record above.
