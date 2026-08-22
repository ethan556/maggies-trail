# S323 Fix Packet P3 — evidence log

Reviewer: cowork-s323-P3-fixer. Scope: 19 lessons in fractions-deeper-g3, division-fluency-g3, mult-fluency-g3.

## mf3-03-01 (P0) — verification only, no edit

- Queue defect (S248 ESCALATE, upheld S321-F9): shared figure `mult3-mult-table` labeled 4 × 6 = 24 while highlighting the rendered 4 × 4 = 16 cell — learner-visible contradiction.
- Verification at current source (`src/components/figures.tsx` L4504-4513, read-only): highlight condition `r===2&&c===2` → product `(2+2)*(2+2)=16`; footer text `4 × 4 = 16 (highlighted square fact)`; aria-label "the diagonal square fact four times four highlighted at sixteen". Figure is internally self-consistent; the false 4×6=24 label no longer exists (S305 repair confirmed).
- Lesson JSON re-read in full: c1/c2 bind `mult3-mult-table` (no params) with generic mixed-recall concept text; the only 4×4/16 mentions (ch1 + explanationVariants) state 4 × 4 = 16, agreeing with the figure. Answers hand-recomputed: 4×5=20, 3×4=12, 3×5=15, 5×5=25, 2×5=10, 4×4=16, remedial 3×4=12 — all correct.
- reviewBasisHash `a81f433e096c3c57c1da752e7d70fe6e500802f202f6f85ebb1b56074248d9c4` (byte-identical to S248/S321 records — source unchanged; defect lived in src, repaired there). Disposition: KEEP.

## mf3-03-03 (P0) — verification only, no edit

- Queue defect (S248 ESCALATE, upheld S321-F9): both concepts used the multiplication-table figure "whose claimed highlighted 4 × 6 product is absent from the rendered grid".
- Verification: same figure evidence as mf3-03-01 (`src/components/figures.tsx` L4504-4513) — highlight, footer, and aria all agree on 4 × 4 = 16; false label gone (S305 repair confirmed).
- Lesson JSON re-read in full: c1/c2 bind `mult3-mult-table` (no params); concept text is generic recall-speed language with no numeric claim about the highlighted cell; the strings "4 × 6", "24", "4 × 4", "16" appear nowhere in the lesson. Answers hand-recomputed: 5×7=35, 8×7=56, 9×4=36, 9×6 via 60−6=54, 6×9=54, 9×8=72, remedial 2×(4×7)=56 — all correct.
- reviewBasisHash `43fbaede275dab3b67e30d7537b317bb38a05e8ed782e4b3f5c6a45c6cb54997` (unchanged since S248 — defect was src-side). Disposition: KEEP.

## mf3-03-06 (P0) — verification only, no edit

- Queue defect (S248 ESCALATE, upheld S321-F9): "the code highlights 4 × 4 = 16 while the visible footer and accessible label claim 4 × 6 = 24 is highlighted".
- Verification: same figure evidence as mf3-03-01 (`src/components/figures.tsx` L4504-4513) — footer `4 × 4 = 16 (highlighted square fact)` and aria "four times four highlighted at sixteen" now match the highlighted cell's rendered 16 (S305 repair confirmed).
- Lesson JSON re-read in full: c1/c2 bind `mult3-mult-table` (no params) with generic whole-table concept text; no step claims which fact is highlighted; the lone "16" is a k2 commonError value. Answers hand-recomputed: 9×9=81 (×2), 10×7=70, 8×8=64, 7×7=49, 6×6=36, remedial 90−9=81 — all correct.
- reviewBasisHash `97f855e38bba0d81813b9364ab669839f25f574e3b026c08169186de8d63dcbc` (unchanged since S248 — defect was src-side). Disposition: KEEP.

## df3-02-02 — remedial figure contradiction fixed

- Defect (S322-F11): remedial concept "Fifty is 5 complete tens, so 50 ÷ 10 = 5" bound `mult3-divide-by-ten`, which renders "70 = 7 tens" / "70 ÷ 10 = 7 groups of ten" — direct contradiction.
- Before: `remedials[0].concept.figure = "mult3-divide-by-ten"`. After: `"mult3-fact-family"` (generic fact-family triangle; contract's explicit fallback since no 50÷10 instantiation is registered and new registrations are src work).
- Main steps untouched (c1/c2 correctly use `mult3-divide-by-ten` for their own 70÷10=7 text; pinned by `src/lib/session254.*` tests). Remedial figure is not id-pinned by any test — session254 follow-on requires only a registered, rendered figure, which `mult3-fact-family` satisfies.
- reviewBasisHash after edit: `07064e039d8e586f042a73644c5cf12862eb9ca68c3a6bb26295ea1b556ec163`. Disposition: KEEP.

## df3-03-02 — remedial figure contradiction fixed

- Defect (S322-F11, distinct from the respected S319 k1/k3 adjudication): remedial concept "To divide 5 by 0, we would need a number that makes 0 × ? = 5. No number works." bound `mult3-divide-by-zero`, which renders "7 ÷ 0 asks: 0 × ? = 7" — direct numeric contradiction.
- Before: `remedials[0].concept.figure = "mult3-divide-by-zero"`. After: `"mult3-fact-family"`. Contract offered "a generic figure/no figure"; no-figure would break `session254.divisionFluencyG3FollowOn` ("gives all 12 remedials a rendered semantic figure"), so the generic registered figure was chosen. The fact-family triangle depicts the multiplication↔division inverse link — precisely the remedial's 0 × ? = 5 argument — with no ÷0 or dividend-specific claim.
- Main steps and remedial check untouched; k1/k3 mcq option-id/length pins (`session254.divisionFluencyG3CourseIntegrity`) unaffected.
- reviewBasisHash after edit: `14394e98051521df12d8b0f895663ae7d7e87bbc1a8e9672b192e68d8a80d812`. Disposition: KEEP.

## df3-03-04 — k3 cross-lesson duplicate replaced

- Defect (S322-F11): k3 numeric byte-identical to df3-01-04/k1 (`42 ÷ 6 = ?`, answer 7, identical traps/feedback).
- Before: prompt `42 ÷ 6 = ?`, answer 7, traps [42 repeat-total, 8 overshoot "8 × 6 = 48"], factFamily `6x7`.
- After: prompt `18 ÷ 6 = ?`, answer 3, traps [18 repeat-total (same shape), 4 overshoot "4 × 6 = 24, which overshoots 18"], fallback "6 × ? = 18", success "18 ÷ 6 = 3", hints and explanationVariants renumbered, factFamily `3x6` (canonical lo-x-hi; product 18 appears in prompt per session186 relevance clause). Solver check: DivMixedNumeric derives 18/6=3.
- 18÷6 verified unused as a widget anywhere else in content/courses (only prose mentions in unrelated g4/g5 courses).
- reviewBasisHash after edit: `e70581b34bfb3cfb1373316eac74ae30d78eea585d934f7508f56970e7e9d711`. Disposition: KEEP.

## df3-01-01, df3-01-02, df3-02-01 — ESCALATE (no content-only conforming fix)

- **df3-01-01**: contract wants c1 → fair-shares {16,2} and remedial → {12,2}. No registered groups=2 fair-shares id exists (`Mult3FairSharesExample` is an unregistered helper; registry has only `mult3-fair-shares` = 12÷3 and `mult3-fair-shares-15-over-5`); lesson JSON has no figure-params mechanism; c1's binding is byte-pinned in `src/lib/session254.divisionFluencyG3CourseIntegrity.test.tsx` (`expectedFigures["df3-01-01"]`) and `session254.divisionFluencyG3FollowOn.test.tsx`. `mult3-fact-family` is unusable for this remedial (it renders 12÷3=4 next to text stating 12÷2=6 — same dividend, wrong divisor). S316-R: escalate where the only conforming fix needs a new figure.
- **df3-01-02**: same shape; the S322 contract itself notes "No parameterized version of `mult3-how-many-groups` currently exists ... one would need to be added" (src). c1 pin: `expectedFigures["df3-01-02"]`.
- **df3-02-01**: the contract's content-side fallback (rebind remedial to `mult3-fact-family`) is blocked by `src/components/s318G3Figures.test.tsx`, which byte-pins `rem-g3d-div89-c` → `mult3-divide-by-nine` in BOTH its `targets` list and its "only the 19 named placements were touched" map. Any rebind fails that src test.
- All three left unedited (hashes unchanged: 839f5f8f…, c61e2e90…, 50d23f41…) so the escalation implementer can make one coherent src+content change.

## g3f-01-02 — k2 cross-lesson duplicate replaced

- Defect (S322-F10): k2 byte-identical to g3f-02-02/ch1 ("Which is smaller: a half or a fourth?").
- Before: prompt "Which is smaller: a half or a fourth?", correct o0 "a fourth". After: prompt "Which is smaller: a half or a third?", correct o0 "a third"; o1/o2 and all feedback retained (still literally true of the new pair). Variant `g2-shapes-shares/Ssg2CompareSharesMcq` retained — `g2Independent.cjs` parses `a (half|third|fourth)` and "smaller" → max denominator → "a third" = authored correct label (session195 solver-agreement clause).
- Uniqueness verified: exact prompt appears nowhere else in content/courses (ssg2-03-03 uses a "Tap it." variant with different options); within-lesson exact/normalized/payload uniqueness holds (ch1 = bigger half-vs-fourth; remedial = smaller third-vs-sixth).
- reviewBasisHash after edit: `57612ff754930b76c41d5e34e2e0bd870ea805fe3d17507bdddf58e1ca7550ae`. Disposition: KEEP.

## g3f-01-04 — ch1 cross-lesson duplicate replaced

- Defect (S322-F10): ch1 byte-identical to g3f-03-04/k1 (ribbon 5/6 story mcq).
- After: on-tag set-model challenge "A box of 12 crayons is split into 4 equal groups. Which fraction of the box is one group?" — correct `1/4` at o0; distractors 1/12 (one item ≠ one group), 4/12 (group count misused as numerator), 1/3 (wrong group count); all feedback recomputed (12÷4=3 crayons/group). Hints/explanationVariants updated.
- Prompt and payload unique within lesson and course ("crayons" unused elsewhere in fractions-deeper-g3).
- reviewBasisHash after edit: `72aaa9410b3809d8307228b83543523bb465000220479d5c222f964754c0edc7`. Disposition: KEEP.

## g3f-02-04 — ch1 cross-lesson duplicate replaced

- Defect (S322-F10): ch1 byte-identical to g3f-01-05/k1 (eighths-ruler 1/2 mcq).
- After: "On a SIXTHS number line, which mark lands exactly on 1/2?" — correct "The 3/6 mark" at o0; distractors "The 2/6 mark", "The 1/6 mark", "There is no such mark"; feedback recomputed for sixths. Hints/explanationVariants kept (still true).
- Prompt unique corpus-wide; within-lesson exact/normalized/payload uniqueness holds.
- reviewBasisHash after edit: `156b4ea58892007083f9b4e74e451a760f73b74e93fa51d613f721439546ce76`. Disposition: KEEP.

## g3f-03-02 / g3f-03-03 — grammar fixes

- g3f-03-02: distractor feedback "1 pieces is fewer than 2 pieces of the very same size…" → "1 piece is fewer than 2 pieces…" (ch1's 1/3 option; only occurrence of the string in the file).
- g3f-03-03: "1 pieces is fewer than 4 pieces of the very same size…" → "1 piece is fewer than 4 pieces…" (ch1's 1/6 option).
- Hashes after edit: g3f-03-02 `3dda8432971b17c1af10f23a7ccc5c5849470fceee8a5dc4ed4e977d408e5529`; g3f-03-03 `5a0b7e6760329489e957757f89781731c6d8dffaecf9b26410a1a47cd34b5141`. Both KEEP.

## g3f-03-04 — k1 and k2 cross-lesson duplicates replaced

- Defects (S322-F10): k1 == g3f-01-04/ch1 (ribbon 5/6 mcq, also echoing this lesson's own i1); k2 == g3f-01-05/ch1 (trail 4/6 + 1/6 numeric).
- k1 after: eggs-carton story mcq (7/10 correct at o0; distractors 10/7 reversal, 3/10 remainder, 1/10 single item; feedback recomputed). Hints/explanationVariants updated to the carton story.
- k2 after: "A hiker walks 2/5 mile, rests, then walks 1/5 mile more. Express the total as ?/5." — answer 3, previewDenominator 5, traps [5 denominator-as-answer, 2 multiplied-counts], same trap shape as before; variant `g4-fractions/faLikeDenomWordNumeric` kept (solver: 2+1=3 ✓, no "were available" trigger).
- Both prompts unique within lesson and corpus (only unrelated "hiker walks N laps" items exist, in measure-problems-g4).
- reviewBasisHash after edit: `ae0156226e1b1f908c55fe923782f12ce60e501bb2cecf3d1e14aeac984736a8`. Disposition: KEEP.

## g3f-01-03, g3f-01-05, g3f-02-01, g3f-02-02 — ESCALATE (session299 byte-pin)

`src/lib/session299.fractionsDeeperG3VisualCopyRepair.test.ts` pins, for exactly these four lessons, a `nonCopyHash`: SHA-256 of the ENTIRE lesson JSON with only the named concept step's `body`/`narration` deleted (g3f-01-03/c1, g3f-01-05/c2, g3f-02-01/c2, g3f-02-02/c1). I recomputed all four hashes against the current working tree with the test's own algorithm — all four MATCH, i.e. the test is green today. Therefore ANY content fix to these lessons (remedial rewrites for the k1-identical remedials; g3f-02-02's ch1 replacement) breaks a green src test and requires a synchronized `sourceContracts` hash update in src/**, which is outside this packet's edit authority. Defects were each re-confirmed byte-identical at current state before escalating. Lessons left unedited (hashes 9d5be118…, 5a186133…, a70ba65c…, 9c5a21fe…).

Implementer notes carried in each record: S316-R remedial standard applies (R1–R6; R2 must clear k1 AND k3 in g3f-02-01); g3f-02-02's ch1 sixths/eighths replacement cannot keep the `Ssg2CompareSharesMcq` variant (g2 solver vocabulary is half/third/fourth only).
