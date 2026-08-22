# S316 Lane B — Independent Assessment: circle-theorems

Reviewer: Claude Cowork independent assessor (circle-theorems S316)
Reviewed: 2026-08-20T00:15:18.000Z
Scope: `content/courses/circle-theorems/course.json` + all 16 lessons in
`content/courses/circle-theorems/lessons/`. Read-only review; dispositions staged to
`reports/closure/cowork-staging/laneB-circle-theorems-dispositions.jsonl` (16 NDJSON lines, one
per lesson). This report does not write to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`.

Authority note: per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, this assessment treats the
repository source as authoritative and does not consult or rely on any ChatGPT Work cache entry.

## Course summary

`circle-theorems` (grade 10, "Geometry: Circle Theorems") has 6 chapters and 16 lessons:

| Chapter | Lessons |
|---|---|
| ch1 Central & Inscribed Angles | cr-01-01, cr-01-02, cr-01-03 |
| ch2 Chords | cr-02-01, cr-02-02, cr-02-03 |
| ch3 Tangents | cr-03-01, cr-03-02, cr-03-03 |
| ch4 Secants, Angles & Power of a Point | cr-04-01, cr-04-02, cr-04-03 |
| ch5 Arcs, Sectors & Cyclic Quadrilaterals | cr-05-01, cr-05-02, cr-05-03 |
| ch6 All Circles Are Similar | cr-06-01 |

The course builds a coherent chain: central angle = arc → inscribed angle = half-arc → Thales
special case → chord/arc/distance locks → tangent-radius perpendicularity → two-tangent symmetry
→ circumscribed-figure bookkeeping → the four vertex-position angle formulas (center/rim/
inside/outside) → tangent-chord as the rim formula's limiting case → power of a point unifying
chords/secants/tangents by one product law → arc length and sector area as the same θ/360
fraction applied to two different circle formulas → cyclic quadrilaterals as the corollary of
complementary intercepted arcs → why all circles are similar (k vs k² scaling). Every numeric
example, every distractor's arithmetic, and every reverse/challenge problem was independently
recomputed by hand during this review (see per-lesson verdicts below); no arithmetic error was
found anywhere in the course.

## Decision counts

- **KEEP: 14** — cr-01-01, cr-01-02, cr-01-03, cr-02-01, cr-02-02, cr-02-03, cr-03-01, cr-03-02,
  cr-03-03, cr-04-01, cr-04-02, cr-04-03, cr-05-01, cr-05-02
- **REVISE: 2** — cr-05-03, cr-06-01
- **ESCALATE: 0**

## REVISE list (one-phrase reasons)

- **cr-05-03** (Cyclic Quadrilaterals) — step c1 introduces the concept in prose with no figure,
  the only concept step in the whole course missing one.
- **cr-06-01** (Why All Circles Are Similar) — recap teaser promises a "next chapter" that does
  not exist anywhere in the course or the repository.

## Notable findings (both REVISE items — precise implementation contracts)

### cr-05-03 — missing figure on step c1

Verified math: opposite-angle supplements (95°→85°, 117°→63°), the converse cyclicity test on a
consecutive-angle set (88+92=180 and 105+75=180 both check), the always-cyclic-shapes MCQ
(rectangle: yes; general parallelogram/kite/trapezoid: correctly qualified — a kite is cyclic
only when its two equal side-angles are 90° each, a parallelogram only when it is a rectangle,
a trapezoid only when isosceles), and the algebra challenge (2x+3x=180 → x=36 → C=108°, checked
against A=72°, 72+108=180). All correct.

Defect: step `c1` ("A cyclic quadrilateral has all four vertices on one circle... opposite angles
are supplementary") has no `"figure"` key. A repo-wide scan of every `concept` step across all 16
lessons in this course found exactly one step missing a figure — this one. Every other lesson's
first concept step pairs a comparable spatial claim (a new vertex position, a new line type, a
new locked relationship) with a diagram, and this lesson's own `c2` step immediately reuses figure
`cr-cyclic-quad` for the identical four-points-on-a-circle configuration. Introducing "four
vertices on one circle" — a spatial claim — in prose alone, in a course that otherwise diagrams
every such claim, is a missing promised visual under this review's quality bar.

Implementation contract:
- Add `"figure": "cr-cyclic-quad"` to step `c1` in `content/courses/circle-theorems/lessons/cr-05-03.json`
  (the figure is already registered in `src/components/figureIds.ts` and implemented in
  `src/components/figures.tsx`, so no new figure component is required) — OR, if `cr-cyclic-quad`
  should stay reserved for c2's angle-relationship claim, add a lighter definitional figure ID
  showing four labeled points on a circle for c1 specifically.
- No change to step text, answers, feedback, widgets, or any other step.

### cr-06-01 — dangling forward-reference in the recap teaser

Verified math: circumference's `2r` piece scales linearly (2×4=8, 2×6=12, 2×9=18, exactly 3×6),
area's `r²` piece scales quadratically (4²=16, 6²=36, 8²=64), and the closing challenge correctly
identifies that doubling the radius (4→8) doubles `2r` (8→16) but quadruples `r²` (16→64) — the
k-vs-k² argument for why any two circles are similar with no conditions to check. All `mcq` and
`scaledCircleLab` choice lists are seeded-shuffled at render (`seededShuffle` in
`src/components/widgets.tsx`), so authored option order (several correct-first arrangements in the
JSON) is not a defect per the known engineering context for this review. Figures `cr-circle-scaling`
and `cr-linear-vs-quadratic` are registered and correctly matched to their steps.

Defect: step `r1.teaser` reads "next chapter: inscribed and circumscribed circles of a triangle."
`course.json` lists ch6 ("All Circles Are Similar") as the course's final chapter, containing only
`cr-06-01` — there is no next chapter. A search of the repository's other courses
(`triangle-congruence`, `right-triangles-trig`) found no lesson covering triangle incircles or
circumcircles either, so this is not a case of a real next unit living under a different course id
that the teaser correctly anticipates — it is a dangling promise that will mislead a learner
finishing the course.

Implementation contract:
- Rewrite the `teaser` string in step `r1` of `content/courses/circle-theorems/lessons/cr-06-01.json`
  to either (a) close the course without a forward promise (e.g., a short closing statement
  summarizing what the six chapters covered), or (b) if a genuine follow-on unit exists in the
  product roadmap under a different course id, name that unit/course correctly instead of "next
  chapter."
- No change to any other step's text, answers, feedback, or widgets.

## KEEP lessons — verification highlights

Full per-lesson rationale is in the staged NDJSON; summary of the arithmetic independently
recomputed for each:

- **cr-01-01**: 360−140=220; 110+95+x=360→155; 230° classified major/three-letter; clock 7/12×360=210;
  ratio 2:3:4 of 360 → largest 4×40=160.
- **cr-01-02**: 80/2=40; 2×35=70; same-arc congruence 40; triangle challenge (P=24°, arc RP=142°)
  → Q=71°, audited against 24+71+85=180 and 142+48+170=360.
- **cr-01-03**: Thales 90° always; 90−28=62; legs 10,24→diameter 26; legs 9,12→radius 7.5.
- **cr-02-01**: chord/arc lock 75→75; 60° chord = radius (9); hexagon perimeter 6×5=30; chord
  12/radius 10 → distance 8 (6-8-10 triangle).
- **cr-02-02**: radius 10/distance 6 → chord 16; radius 13/chord 24 → distance 5; parallel chords
  16,12 on radius 10 → gap 8−6=2.
- **cr-02-03**: equal chords equidistant (7→7); ranking by distance (closest=longest); radius 15,
  distances 9/12 → chords 24/18, gap 6; pipe depth 10−6=4 (consistent with "less than half full").
- **cr-03-01**: tangent⊥radius 90°; OP=17,r=8→PT=15; OP=26,PT=24→r=10; horizon √(29²−25²)≈14.7
  (matches the prompt's stated "(1 decimal)").
- **cr-03-02**: PT1=PT2=11; kite supplement 180−40=140; OP bisects 40/2=20; chained tangents
  18−7=11.
- **cr-03-03**: AB=3+4=7; perimeter=2(12)=24; BC=(12−4)+(9−4)=13; incircle r=(6+8−10)/2=2; square
  perimeter 4×12=48.
- **cr-04-01**: inside half-sum (100+40)/2=70; outside half-difference (130−30)/2=50; tangent-
  tangent (220−140)/2=40 cross-checked against prior lesson's kite supplement; 65=(x+38)/2→x=92.
- **cr-04-02**: tangent-chord 140/2=70; supplementary sides 220/2=110 (70+110=180); backward
  challenge tangent-chord 54°→near arc 108°→far-side inscribed angle also 54°.
- **cr-04-03**: crossing chords 4·6=3x→8; secants 5·12=4(4+x)→11; tangent-secant PT=√36=6; well
  challenge d(d+14)=144→d≈6.89 (matches "(2 decimals)").
- **cr-05-01**: r=9,60°→9.42; r=12,150°→31.42; r=4,90°→6.28 (fraction and radian routes agree);
  reverse 8π/30π×360=96°; semicircle r=30→94.25 m.
- **cr-05-02**: r=6,90°→28.27; r=10,72°→62.83; r=4,60°→8.38 (½r²θ and fraction routes agree);
  sprinkler r=8,135°→75.4 m²; reverse 15π/36π×360=150°.

## Engineering context checked (repo-wide, not lesson-specific)

- All 31 distinct `figure` IDs referenced across the 16 lessons are registered in
  `src/components/figureIds.ts` and implemented exactly once each in `src/components/figures.tsx`,
  each with `role="img"` and an accessible `<title>` matching its lesson's claim.
- All interactive widget types used (`circleAngleExplore`, `circleMeasureExplore`,
  `scaledCircleLab`, `exactNumberLab`, `angleMeasure`, `mcq`, `numeric`) are implemented in
  `src/components/widgets.tsx`; `circleAngleExplore` renders an `aria-label` describing both the
  highlighted arc and the current angle reading, and respects `prefers-reduced-motion`.
- The `variant.gen` values `arc-measure`, `inscribed-angle`, `thales-right-angle`, `chord-perp`,
  `chord-dist`, `circle-sector` are registered generators in `src/lib/variants.ts`; `g10-circle-
  theorems` resolves through `src/lib/geometryVariants.ts` against
  `src/lib/geometryVariantTemplates.json`. Every `form` string used in this course's lessons
  (`cr-thales__numeric`, `cr-chord-arc__mcq`/`__numeric`, `cr-chord-perp__mcq`,
  `cr-tangent-perp__mcq`/`__numeric`, `cr-two-tangent__numeric`, `cr-tangent-apps__numeric`,
  `cr-secant-angles__mcq`/`__numeric`, `cr-tangent-chord__mcq`/`__numeric`,
  `cr-power-point__numeric`, `cr-arc-length__numeric`, `cr-sector-area__numeric`,
  `cr-cyclic-quad__mcq`/`__numeric`) is present in the templates JSON — no dangling variant
  declarations.
- `mcq` and `scaledCircleLab` choice lists are seeded-shuffled at render
  (`seededShuffle` in `src/components/widgets.tsx`), so authored option order alone (including
  several correct-first arrangements in this course's JSON) is not a defect, per this review's
  known engineering context. This course does not use `proportionalReasoningLab` or
  `percentChangeLab`, so the shared-widget shuffle fix in flight elsewhere does not apply here.
- The `circleAngleExplore` `cyclic` mode's readout function (`circleReadout` in
  `src/lib/evaluate.ts`, `180 − arc/2`) was checked against cr-05-03's `i1` widget parameters
  (targetAngle 110, startArc 80 → resolves at arc 140, giving 180−70=110) and is correct.

## Gate note

Per the assignment, no `npm`/`vitest`/`tsc` commands were run. This report and its findings are
raw, source-derived data for independent human/automated closure; recommendations here are
evidence only and do not self-approve.
