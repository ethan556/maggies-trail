# S322 Independent Assessment — Packet F10

**Reviewer:** Claude Cowork independent assessor (S322)
**Reviewed at:** 2026-08-20T21:17:30.000Z
**Scope:** fractions-deeper-g3 (14 lessons), unlike-fractions-g5 (14 lessons), decimal-fluency-g5 (16 lessons) — 44 lessons total, every lesson signed.
**Staging output:** `reports/closure/cowork-staging/laneB-s322-F10-dispositions.jsonl` (44 records, schema-validated: unique recordIds, allowed enums, 64-hex reviewedBasisHash, non-empty rationale/evidenceRefs/reopenCondition).
**Prior truncated attempt (`laneB-s321-F10-dispositions.jsonl`)** was discarded per instruction — wrong field names (`reviewBasisHash`/`timestamp` instead of `reviewedBasisHash`/`reviewedAt`, missing `recordType`) and boilerplate rationale identical across all 44 lines, indicating no genuine per-lesson review. This assessment is a fresh, independent, per-lesson review.

## Method

- Read every lesson JSON in full; hand-recomputed every numeric/fractionBar/columnCalc/estimateSlider/numberLineHop widget's target answer.
- Ran two duplicate scans across all lessons in all three courses: (a) byte-identical widget objects (JSON.stringify equality) both within a lesson (remedial vs. its own step) and across lessons/courses; (b) grep sweeps for known generator defects (templated MCQ distractor feedback, singular/plural "1 X" grammar errors).
- Verified all `figure` references against `src/components/figureIds.ts` — none missing.
- Treated engine-level concerns (seeded shuffle for mcq/predict, lab-widget shuffle-fixing) as satisfied at current state — these are systemic fixes in `widgets.tsx`/`LessonPlayer.tsx`, not per-lesson source issues.
- Per established precedent (S316-R rationale for g3f-01-01): a remedial that is byte-identical to the step it remediates, or a check/challenge item byte-identical to one in another lesson, is REVISE-worthy even when the arithmetic is correct, because it fails to give a distinct instructional job / genuine re-teach. Same-template-different-numbers items *within* a single lesson (e.g., two checks using the same skill template with different numbers) were **not** flagged — non-blocking per that same precedent.
- Compact rationale per lesson; no defects invented — every REVISE cites the literal duplicated text or the literal broken string found in the source.

## Results by course

### fractions-deeper-g3 (14 lessons) — 4 KEEP / 10 REVISE
KEEP: g3f-01-01, g3f-02-03, g3f-02-05, g3f-03-01

REVISE:
- g3f-01-02 — cross-lesson duplicate widget (k2 == g3f-02-02/ch1, different conceptTags)
- g3f-01-03 — remedial byte-identical to k1
- g3f-01-04 — cross-lesson duplicate widget (ch1 == g3f-03-04/k1)
- g3f-01-05 — remedial byte-identical to k1, AND k1/ch1 each cross-lesson-duplicate g3f-02-04/ch1 and g3f-03-04/k2
- g3f-02-01 — remedial byte-identical to k1
- g3f-02-02 — remedial byte-identical to k1, AND ch1 cross-lesson-duplicates g3f-01-02/k2
- g3f-02-04 — cross-lesson duplicate widget (ch1 == g3f-01-05/k1)
- g3f-03-02 — grammar: "1 pieces is fewer than 2 pieces"
- g3f-03-03 — grammar: "1 pieces is fewer than 4 pieces"
- g3f-03-04 — cross-lesson duplicates (k1 == g3f-01-04/ch1; k2 == g3f-01-05/ch1)

### unlike-fractions-g5 (14 lessons) — 7 KEEP / 7 REVISE
KEEP: g5u-01-01, g5u-01-05, g5u-02-01, g5u-02-03, g5u-02-04, g5u-02-05, g5u-03-02

REVISE:
- g5u-01-02 — three-way cross-lesson duplicate widget (k1 == g5u-01-03/k2 == g5u-01-04/k2)
- g5u-01-03 — see above
- g5u-01-04 — see above
- g5u-02-02 — grammar: "dropped the 1 pieces already in hand"
- g5u-03-01 — cross-lesson duplicate widget (k3 == g5u-03-03/k1)
- g5u-03-03 — cross-lesson duplicate widget (k1 == g5u-03-01/k3), AND grammar: "1 pieces and 3 more make 4"
- g5u-03-04 — grammar: "1 pieces and 3 more make 4" (same generator bug, different widget)

### decimal-fluency-g5 (16 lessons) — 1 KEEP / 15 REVISE
KEEP: g5d-01-02

REVISE (all math hand-verified correct; defects are structural, not arithmetic):
- g5d-01-01 — remedial byte-identical to k1
- g5d-01-03 — k1 broken-template MCQ feedback; remedial cross-lesson-duplicates g5d-01-05's remedial
- g5d-01-04 — k3 broken-template MCQ feedback; remedial byte-identical to k1
- g5d-01-05 — k1+ch1 broken-template MCQ feedback; remedial cross-lesson-duplicates g5d-01-03's remedial
- g5d-01-06 — k3 broken-template MCQ feedback; remedial byte-identical to k1
- g5d-02-01 — k1+k3 broken-template MCQ feedback
- g5d-02-02 — remedial cross-lesson-duplicates g5d-02-03's remedial (own step feedback is otherwise strong)
- g5d-02-03 — k1+k3 broken-template MCQ feedback; remedial cross-lesson-duplicates g5d-02-02's remedial
- g5d-02-04 — k3 broken-template MCQ feedback; remedial byte-identical to k1
- g5d-02-05 — k1+k3 broken-template MCQ feedback; remedial cross-lesson-duplicates g5d-03-01's remedial
- g5d-03-01 — k1+k3 broken-template MCQ feedback; remedial cross-lesson-duplicates g5d-02-05's remedial
- g5d-03-02 — k1+k3 broken-template MCQ feedback
- g5d-03-03 — remedial byte-identical to k1 (otherwise a strong, well-written lesson)
- g5d-03-04 — remedial byte-identical to k1 (otherwise a strong, well-written lesson)
- g5d-03-05 — k3 broken-template MCQ feedback; remedial byte-identical to k1

**The single most significant systemic defect found:** in decimal-fluency-g5, 11 of 16 lessons contain an MCQ generator artifact where wrong-answer feedback is the templated string `Not quite — "[option's own label]" does not match the place-value model or the expected size.` — this quotes the distractor's label back verbatim with zero real misconception content, directly violating the "misconception-named feedback" quality bar for every learner who selects that option. Additionally, remedial-check widgets are byte-identical to the step they remediate (or to another lesson's remedial) in 13 of 16 lessons — struggling learners see no distinct re-teach.

## Totals across all three courses
- **44/44 lessons signed** (every lesson has a disposition record)
- **KEEP: 12** (g3f-01-01, g3f-02-03, g3f-02-05, g3f-03-01, g5u-01-01, g5u-01-05, g5u-02-01, g5u-02-03, g5u-02-04, g5u-02-05, g5u-03-02, g5d-01-02)
- **REVISE: 32**
- **ESCALATE: 0**
- No mathematical computation errors were found in any lesson across all three courses; all findings are structural (byte-identical duplicate widgets, broken generator-template feedback, singular/plural grammar defects).
