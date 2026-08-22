# S316 Lane B — Triangle Congruence Course Assessment

Reviewer: Claude Cowork independent assessor (triangle-congruence S316)
Reviewed: 2026-08-20T01:04:38.000Z
Scope: `content/courses/triangle-congruence/course.json` + all 15 lessons under
`content/courses/triangle-congruence/lessons/`. READ-ONLY review; no content edited.

## Summary

| Decision | Count |
|---|---|
| KEEP | 15 |
| REVISE | 0 |
| ESCALATE | 0 |

All 15 lessons: `visualDecision = SUFFICIENT`, `gradeLanguageDecision = FIT`.

No REVISE items. No mathematical errors, no invalid congruence-criterion applications, no
answer leaks, no bare "try again" feedback, and no missing/mismatched visuals were found across
the course.

## Per-lesson verdicts

### Chapter 1 — The Congruence Criteria

- **tc-01-01 — Shortcuts to Congruence** — KEEP. SSS/SAS/ASA and the AAS→ASA reduction argument
  (third angle = 180 − 50 − 60 = 70°) are all correct. `triangleConstraintLab` correctly shows
  SSA ambiguity collapsing to one triangle once the included angle is fixed at 60°/70° under SAS.
- **tc-01-02 — The One That Fails** — KEEP. SSA (ambiguous, swinging side) and AAA (similarity
  only) are both correctly identified as non-criteria; the `dragBucket` sort (SSS/SAS → yes,
  SSA/AAA → no) is accurate. The `ssa-ambiguous` figure genuinely renders two distinct triangles
  (C₁, C₂) from one angle + two sides.
- **tc-01-03 — Criteria & CPCTC** — KEEP. CPCTC-after-congruence ordering is enforced throughout.
  Letter-order correspondence is verified: △PQR ≅ △STU ⇒ QR corresponds to TU (positions 2–3),
  correctly rejecting ST/SU/PR distractors. The closing vertical-angle SAS proof (AP=CP, BP=DP,
  ∠APB=∠CPD) is complete and correctly named — not ASA (only one angle pair given) or SSS (only
  two side pairs given).

### Chapter 2 — Hypotenuse-Leg & CPCTC

- **tc-02-01 — The Hypotenuse-Leg Criterion** — KEEP. All three Pythagorean computations verified:
  √(13²−5²)=12, √(17²−8²)=√225=15 (a genuine 8-15-17 triple), and the 10/6 hypotenuse-leg pair
  recovers leg 8. HL is correctly restricted to right triangles with hypotenuse + one leg (not
  two legs, which is SAS; not a non-right angle, which reverts to ambiguous SSA). The lab
  correctly demonstrates the right angle collapsing SSA's second-triangle branch.
- **tc-02-02 — Proof Practice with CPCTC** — KEEP. Reflexive/vertical/right-angle "free part"
  framing is standard and correct. The bisector→SAS→CPCTC proof for AD=CD is complete and valid.
  The rule that CPCTC may only release parts *not* already used as criterion inputs is correctly
  tested (rejecting AB=DE, BC=EF, ∠B=∠E as CPCTC outputs of the very SAS proof that used them).
- **tc-02-03 — Overlapping Triangles** — KEEP. The overlapping-triangle SSS argument (AB=AC,
  BD=CD, shared AD) and the two-step CPCTC relay (first congruence's output feeds the second
  proof) are both valid and non-circular. The shared-angle SAS closer is a distinct application
  from tc-02-02's shared-side case, not a duplicate.

### Chapter 3 — Isosceles Triangles & Midsegments

- **tc-03-01 — The Isosceles Base Angles Theorem** — KEEP. Base-angle arithmetic verified:
  (180−80)/2=50, 180−2(65)=50, and the algebra challenge 5x=65 gives x=13. The apex-bisector SAS
  proof is the standard correct derivation; the multi-role-line claim (bisector = perpendicular
  bisector = median = altitude, coincident in isosceles triangles) is a true, standard fact.
- **tc-03-02 — The Converse & Equilateral Triangles** — KEEP. The converse (equal base angles ⇒
  equal legs) is correctly distinguished from the inverse distractor and from the restated
  original theorem. Equilateral⇔equiangular at 60° each is correct, and the note that this
  equivalence is special to triangles (unlike a rectangle) is accurate. Algebra check: 3x=2x+20 ⇒
  x=20 ⇒ base angle 60°, verified.
- **tc-03-03 — The Midsegment Theorem** — KEEP. Every numeric item verified: 18/2=9, 7×2=14,
  24/2=12 (inner-triangle perimeter), 2x+1=11 ⇒ x=5. The four-congruent-triangles-from-three-
  midsegments claim is standard and correct. Figure's M/N labels and "MN ∥ AB and MN = ½ AB"
  caption match the theorem exactly.

### Chapter 4 — The Four Triangle Centers

- **tc-04-01 — Circumcenter & Incenter** — KEEP. Circumcenter (perpendicular bisectors,
  equidistant from vertices, circumscribed circle) and incenter (angle bisectors, equidistant
  from sides, inscribed circle) definitions never cross. The shared `TriangleCenter` figure
  component draws the actual perpendicular-bisector/circumradius construction and the actual
  angle-bisector/inradius construction — the promised visual renders the real relationship, not
  a generic stand-in. `matchPairs` `pairErrors` correctly name the vertices/sides swap.
- **tc-04-02 — Centroid & Orthocenter** — KEEP. Centroid (medians, 2:1 split, coordinate average)
  and orthocenter (altitudes, no equidistance property) facts are correct; both coordinate-average
  items recomputed independently: (0+6+3)/3=3 and (2+8+5)/3=5. The Euler-line claim (circumcenter,
  centroid, orthocenter collinear; incenter generally off the line) is a true classical result,
  correctly distinguished from the "all four collinear" distractor.
- **tc-04-03 — Choosing the Right Center** — KEEP. The four-center synthesis is internally
  consistent with the two prior lessons. Bisector-family (circum/in) vs vertex-based (centroid/
  ortho) sort is correct; "always inside: centroid + incenter" vs "can exit for obtuse: circum +
  ortho" is a true classical fact, including the right-triangle circumcenter-at-hypotenuse-
  midpoint aside. Each application item (sprinkler, balance-a-plate, circle-through-vertices) is a
  distinct instructional job, not a re-skin of the definitional items in tc-04-01/02.

### Chapter 5 — Triangle Inequalities

- **tc-05-01 — The Triangle Inequality** — KEEP. `dragBucket` set verified: (3,4,5)→yes,
  (2,3,10)→no, (5,6,7)→yes, (4,4,9)→no. Bound arithmetic correct (|8−5|=3, 5+8=13); the integer-
  count challenge (strictly between 3 and 17 ⇒ 4..16 ⇒ 13 values) is correctly computed and is a
  distinct instructional job from the plain lower/upper-bound items earlier in the lesson.
- **tc-05-02 — The Hinge Theorem** — KEEP. Hinge Theorem and its converse are correctly stated and
  correctly distinguished from the SAS-congruence boundary case (equal included angle ⇒ equal
  third side, not a hinge comparison) — k1/i2/k2 test three genuinely different facets without
  duplication. The animated door-swing figure ties a widening angle to a lengthening third side,
  and degrades gracefully under `prefers-reduced-motion` to the static small-angle/large-angle
  triangle pair, so the relationship still reads without animation.
- **tc-05-03 — Inequalities in Proofs** — KEEP. Side-angle ordering (sides 10,7,5 ⇒ ∠C<∠B<∠A) is
  correctly matched by position. The Exterior Angle Inequality is correctly derived as a *sum*
  (45+60=105°, exceeding each remote interior), not misstated as a supplement. The closing item
  correctly cites the hinge theorem over plausible-but-wrong SAS-congruence and triangle-
  inequality distractors. The lesson's three tools each get one clean, non-overlapping test item,
  closing the course's inequality arc without repeating tc-05-01/02's items.

## Cross-cutting checks performed

- **Congruence criterion correctness**: every SSS/SAS/ASA/AAS/HL application in every lesson was
  checked for correct correspondence and correct rejection of look-alike distractors (SSA, AAA,
  non-included angle placements). No misapplied criterion or invalid correspondence found.
- **Figure registry**: every `figure` id referenced across all 15 lessons is registered in
  `src/components/figureIds.ts` and has a corresponding render function in
  `src/components/figures.tsx`. Spot-checked `SssCriterion`/`SasCriterion`/`AsaCriterion` (tick/arc
  marks match the named criterion), `HlCriterion` (right-angle box + hypotenuse ticks + one leg
  tick), `IsoscelesBaseAngles` (equal-leg ticks + equal-base-angle arcs), `Midsegment` (parallel
  arrows + half-length caption), `TriangleCenter` (kind-specific construction lines: medians for
  centroid, perpendicular-bisector circumradius lines for circumcenter, angle-bisector inradius
  lines for incenter, altitude segments for orthocenter), and `HingeInequality` (small-angle/
  short-side vs large-angle/long-side pair with reduced-motion fallback). All carry `<title>` and
  `aria-label` accessible descriptions that are literally true of what is drawn.
- **Cross-lesson duplication**: no two lessons ask the identical instructional question. Reused
  figures (e.g. `sss-criterion` reappearing in tc-01-03 and tc-02-03) are reused for genuinely
  different framing (CPCTC ordering vs. overlapping-triangle detection), not disguised repeats.
- **Feedback quality**: every sampled distractor's feedback names the actual misconception with
  the actual drawn numbers (e.g. "18 doubles it — congruent triangles are the SAME size"), and no
  feedback opens with a bare negation or a content-free "try again."
- **Grade-level language**: `course.json` declares `gradeLevel: 10`; vocabulary and pacing
  (definitions before use, one new idea per concept step, algebra folded into geometry only in
  the challenge steps) are consistent with a grade-10 geometry course throughout.

## Implementation contracts for REVISE items

None — no lesson in this course required a REVISE disposition.

## Files touched by this review

- Written: `content/courses/triangle-congruence` was NOT modified (read-only review).
- Written: `reports/closure/cowork-staging/laneB-triangle-congruence-dispositions.jsonl` (15
  lesson-disposition records, per-lesson `reviewedBasisHash` from
  `node scripts/session/print-review-basis.mjs`).
- Written: this file, `reports/closure/S316_LANEB_TRIANGLE_CONGRUENCE_ASSESSMENT.md`.
