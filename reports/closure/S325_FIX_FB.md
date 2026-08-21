# S325 Fix Packet FB — six g2p remedial duplicates + g3f-03-04 cross-course k2 duplicate

Fixer: cowork-s325-FB-fixer. Date: 2026-08-21T05:23Z. Branch: codex/v4-s244-authored-visual-wave.
Inputs: S324_VERIFY_V1.md findings 8–13 (signed s324-V1-g2p-01-02/02-01/03-01/03-02/03-03/03-04),
S324_VERIFY_V3.md finding 1 (signed s324-V3-g3f-03-04), S316_ADJUDICATION_REMEDIAL_STANDARD.md (S316-R
R1–R6), S323_FIX_P3.md variant-key precedent.
Files edited: exactly the 7 lesson JSONs below. No src/**, scripts/**, ledger, or other staging files
touched. All arithmetic recomputed in node one-offs; serialization round-trip (`json.dumps(indent=2,
ensure_ascii=False)+"\n"`) verified byte-identical BEFORE editing, so diffs are value-only.

## Pin check (required before g3f edit)

`grep -rn g3f-03-04 src/lib` → only `session252.fractionsDeeperG3CourseIntegrity.test.tsx:31`, which
pins concept FIGURES (`["frac-top-bottom","frac-top-bottom"]` — c1/c2, untouched) and generic
invariants (within-lesson exact/normalized/payload prompt uniqueness, evaluator truth, i2 repair
framing), NOT lesson bytes. g3f-03-04 is not in the hash-pinned set (g3f-01-03/01-05/02-01/02-02).
No ESCALATE needed; all pinned invariants re-verified green against the edited file (probe §3).

## Per-lesson before → after (remedial `check.widget` only; ids, concept, explanationVariants, tags untouched)

### g2p-01-02 (rem-g2p-compare-two-k) — was byte-identical to k1
- Before: "The ribbon is 10 inches. The shoelace is 15 inches. The bookmark is 18 inches. The straw is
  7 inches. Which is the longest?" (k1 verbatim, options+feedback included).
- After: "Maggie lines up four sticks. The red stick is 8 inches. The green stick is 16 inches. The
  blue stick is 11 inches. The white stick is 13 inches. Which stick is the longest?" — correct
  "green stick" (16 = max of 8/16/11/13); middle-number trap preserved (white 13 beats two, loses to 16).
  Option labels 9–11 chars, balanced; all four feedbacks recomputed true.
- R4: MmtLengthCompareMcq emits exactly three items from {key, book, phone} — cannot produce a
  four-stick color prompt.

### g2p-02-01 (rem-g2p-add-lengths-k) — was byte-identical to k1; ledger hash was stale
- Before: "25 + 13 = ? (the two ribbon pieces joined end to end, in cm)", answer 38, traps 12/48.
- After: "Maggie tapes a 21 cm stick to a 14 cm stick, end to end. How long is the taped stick?" —
  answer 35 (21+14); traps 7 (=21−14, difference-instead-of-join) and 45 (=35+10, phantom ten), both
  feedback strings literally true of the new numbers. fallbackFeedback retained (number-free, still true).
- R4: Add2DigitNumeric emits bare "a + c = ?" — cannot produce a word stem.
- The stale s323-P5-g2p-02-01 basisHash (8f3290…, drifted to a7c5bb…) is superseded by this packet's
  fresh signing (f48b48…).

### g2p-03-01 (rem-g2p-draw-model-k) — was byte-identical to g2p-02-03/k3 (signed duplicate surviving via remedial)
- Before: "A drawing shows two bars: a 40 cm bar, and under it a 25 cm bar plus a mystery piece
  reaching the same end. What is the mystery piece?" (g2p-02-03/k3 verbatim).
- After: "A drawing shows a 30 cm bar on top. Under it, an 18 cm bar and a mystery piece reach the
  same end. How long is the mystery piece?" — correct "The gap it fills: 30 − 18 = 12 cm";
  distractors recomputed (sum 48; twin-18 overshoots by 6; drawing-can't-tell refuted). Option
  lengths 33/36/30/30, correct not the outlier.
- Distinct from this lesson's k1 (three-part 60−24−16) and k3 (26+17 stacked total) templates.

### g2p-03-02 (rem-g2p-line-model-k) — was byte-identical to g2p-02-01/k3 (signed duplicate surviving via remedial)
- Before: "To show a 34 cm piece joined to a 20 cm piece on a number line, what is the drawing?"
- After: "Two ropes join: 16 cm, then 22 cm. Which jumps show this on a number line?" — correct
  "Jump 16, then 22, land on 38" (16+22=38); distractors: dots-no-jumps, hop-back-22, single-jump-22,
  all feedback true. Option lengths 28/30/25/31, correct not the outlier.
- Distinct from this lesson's k1 ("Maggie joins a 45 cm ribbon and a 30 cm ribbon. Which number-line
  drawing shows the join?") and from g2p-02-01/k3.

### g2p-03-03 (rem-g2p-two-step-k) — was byte-identical to k1
- Before: "Maggie had 60 cm of ribbon, used 31 cm on a bow, then bought 20 cm more. How much ribbon
  now?" answer 49, traps 29/71.
- After: "Maggie has 40 cm of string. She cuts off 13 cm for a kite tail, then finds 24 cm more. How
  much string now?" — answer 51 (40−13+24); traps 27 (=40−13, stopped after step one) and 29
  (=40+13−24, steps reversed); 51/27/29 all distinct; feedback recomputed true. Numbers chosen so
  the two trap values do not coincide (back ≠ 2×out).
- R2 vs the ribbon/bow template of k1/k2/ch1 and g2p-03-04/k2: distinct (string/kite/finds, present
  tense). R4: TwoStepTradeNumeric emits the stickers template only. R6: remedial concept body names
  60/25/30 — answer 51 is not stated.

### g2p-03-04 (rem-g2p-reasonable-k) — was byte-identical to g2p-01-03/k3 AND carried its CHOICE-0036 leak
- Before: "Two trail legs of 32 m and 25 m give a computed total of 30 m. Reasonable?" — correct
  option was the ONLY one with a numeric justification and unit (40 chars vs 24/30/23).
- After: "Maggie joins a 26 cm strip and a 15 cm strip, then writes 24 cm as the total. Does that
  make sense?" — correct "No — 24 cm is smaller than the 26 cm strip"; distractors: "No — the total
  must be exactly 31 cm" (false: 26+15=41; 31 = the missing-ten slip), "Yes — 24 cm is bigger than
  the 15 cm strip" (beats one part only), "Yes — a written total can come out any size". Leak fixed:
  three of four options carry numeric justifications; lengths 42/36/42/43 — correct is not the
  outlier. 2-yes/2-no shape follows this lesson's own k1 precedent.
- Distinct from g2p-01-03/k3, this lesson's k1 (rope gap) and k3 (18+24 "check out"), and
  g2p-02-02/k3 (pencil-marks reasonableness).

### g3f-03-04 (k2) — was a cross-course near-duplicate of fraction-multiply-g4 g4x-01-01/k3
- Before (S323-P3 tree state): "A hiker walks 2/5 mile, rests, then walks 1/5 mile more. Express the
  total as ?/5. What is the numerator?" answer 3, previewDenominator 5, traps 5/2 — same scenario,
  numbers, answer, preview, traps, and variant form as g4x-01-01/k3.
- After: "A baker uses 3/8 of a bag of flour for bread and 4/8 of the bag for buns. Express the total
  used as ?/8. What is the numerator?" — answer 7 (3+4), previewDenominator 8; traps 8
  (denominator-as-answer) and 12 (=3×4, multiplied counts), feedback recomputed true; success
  "Correct — 7."; fallback/hints/explanationVariants retained (number-free, still true);
  conceptTag g3f-story kept.
- Variant key `g4-fractions/faLikeDenomWordNumeric` RETAINED per the S323_FIX_P3 precedent test
  (keep only if inside the generator's declared family): the replacement is still a like-denominator
  addition word problem (the form's family; g4Variants.ts:385), and the independent solver
  (g4Independent.cjs:51 — first two prompt fractions, numerators added; no "were available" trigger)
  was RUN on the new widget in node: returns 7 = authored answer. Scenario AND number pair both
  changed (hiker 2/5+1/5 → baker 3/8+4/8), unlike the duplicate partner.

## Probe outputs (node one-offs, run at final tree state)

1. Arithmetic recompute: PASS on all 7 instances (16 max-of-4; 21+14=35/7/45; 30−18=12/48/36;
   16+22=38; 40−13+24=51/27/29; 26+15=41, 24<26, 41−10=31; 3+4=7, 3×4=12).
2. g4 independent solver on new g3f-03-04/k2: solve('faLikeDenomWordNumeric', widget) = 7 = authored. AGREE.
3. S316-R R1/R2/R3 (S255 normalized digits→#): each rewritten remedial distinct from EVERY
   widget-bearing step in its lesson AND from its named former duplicate partner
   (g2p-01-02↔k1, g2p-02-01↔k1, g2p-03-01↔g2p-02-03/k3, g2p-03-02↔g2p-02-01/k3, g2p-03-03↔k1,
   g2p-03-04↔g2p-01-03/k3): 6/6 PASS. g3f-03-04 in-lesson exact/normalized uniqueness: PASS.
4. R4: no rewritten remedial prompt matches any declared variant form's template
   (MmtLengthCompareMcq, MmtLengthDifferenceNumeric, Add2DigitNumeric, TwoStepTradeNumeric,
   MmtRulerSubtractNumeric — fixed templates read from src/lib/g2Variants.ts): 6/6 PASS.
5. R5/R6: numeric traps distinct from answer and each other (3/3); mcq single-correct (3/3 + g3f);
   no remedial concept body states its check's answer or correct label (6/6). MCQ option-length
   spreads printed above; correct never the lone outlier.
6. Course-wide duplicate probe over ALL length-problems-g2 steps AND remedials (byte + normalized,
   2,415 pairs): **0 collisions involve any of the six rewritten remedials.** 42 residual pairs
   remain, ALL pre-existing and outside this packet's 7-file scope:
   - 4 byte-identical remedials in lessons NOT signed by s324-V1 and outside the S322-F5/S323-P5
     contract: g2p-01-01, g2p-01-03, g2p-02-02, g2p-02-03 (rem == k1). Same S316-R class; needs its
     own signed lane (recorded here as open debt, not silently fixed — editing them would exceed
     this packet's authorized file list).
   - The remaining pairs are the g2p ribbon/pencil/trail same-template main-step fluency families,
     which s324-V1 explicitly left unflagged "per the explicit S322-F10/F5 precedent and the P5
     PROGRESSION fluency-rationale closures" (S324_VERIFY_V1.md, final paragraph). Not relitigated.
7. Cross-course probe for new g3f-03-04/k2 over BOTH fractions-deeper-g3 AND fraction-multiply-g4
   (byte + normalized, steps + remedials): unique. Corpus-wide normalized probe over all
   content/courses for all 7 new prompts: each appears exactly once (its own location).

## Fresh review-basis hashes (signed in reports/closure/cowork-staging/laneA-s325-FB.jsonl)

| lesson | reviewedBasisHash |
|---|---|
| g2p-01-02 | ccac9f840b5b62da4b83227c62dbc3321d4464573965ddfbb792c52c03a5a6f2 |
| g2p-02-01 | f48b48493ea6d50a73f09515bf7a138fbd731e8057a2b136039f221afb1aae53 (supersedes stale 8f3290…) |
| g2p-03-01 | 327e8c3e028e38efc947c98dd6395f892ba47df63f5b1a3403aa631a1e594b40 |
| g2p-03-02 | 733649bded97ec2e7cb9b039a8a1fe9f2f4866b2a6f53f2a6a859d7310bb5416 |
| g2p-03-03 | 2833066ffc70813be8720b781da23b07ecdefac056236a4d089ca973a0c0d623 |
| g2p-03-04 | 79733220dfe0ca762cf38733d2a3992041290a55c98052ae121b5ae1ff5410d8 |
| g3f-03-04 | bee5de518d1f0d042421ea10422d26503f8375e388a651aaf75c993f5d7c8d5d |

Disposition: 7 fixed, 0 escalated. No gates run (npm/vitest/tsc forbidden for this packet); all
verification via node one-offs against the real generator/solver sources.
