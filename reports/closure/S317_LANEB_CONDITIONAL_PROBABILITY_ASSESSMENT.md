# S317 Lane B Independent Assessment — conditional-probability

Reviewer: Claude Cowork independent assessor (conditional-probability S317)
Reviewed: 2026-08-20T08:13:06.000Z
Scope: content/courses/conditional-probability/course.json and all 16 lessons in
content/courses/conditional-probability/lessons/. Read-only review; dispositions staged to
reports/closure/cowork-staging/laneB-conditional-probability-dispositions.jsonl.

## Course-level summary

16/16 lessons reviewed: **12 KEEP, 4 REVISE, 0 ESCALATE.**

This course (Math, gradeLevel 10, "Conditional Probability & the Rules of Chance") is organized
into five chapters: Events, Sets & Sample Spaces (cpr-01-01..03), The Addition Rule & Two-Way
Tables (cpr-02-01..03), Conditioning: P(A|B) (cpr-03-01..04), Independence (cpr-04-01..03), and
Counting Your Way to a Probability (cpr-05-01..03).

### Mathematical truth (recomputed independently, not trusted from authored feedback text)

Every set-count, addition-rule, two-way-table joint/marginal, conditional-probability,
multiplication-rule, tree-path, independence-test, permutation, and combination claim across all
16 lessons was recomputed from scratch and matches the authored answer, feedback, and reveal
text. Representative checks:

- **Sets/complements**: |A∩B|={18}, |A∪B|=6+5-1=10; 2⁴-1=15 and 6³-5³=91 (at-least-one via
  complement); overlap backwards-solve 25+18-35=8.
- **Addition rule / two-way tables**: 13/52+12/52-3/52=22/52; the 200-student table (40/60/70/30
  inner cells, 100/100 row totals, 110/90 column totals) is internally consistent across every
  joint (40/200=0.20) and marginal (110/200=0.55) probability asked; the "or/neither on a table"
  contract 100+110-40=170, 170/200=0.85 matches the figure exactly.
- **Conditioning and P(A|B) vs P(B|A)**: P(6|even)=1/3; P(king|face)=1/3; the dedicated
  which-way-round lesson (cpr-03-02) correctly computes 40/100=0.400 (given bus) and
  40/110≈0.364 (given sport) as two genuinely different numbers from the same 40-count
  intersection, and never swaps the direction in feedback or reveal text.
- **Multiplication rule / trees**: 0.5×0.4=0.20; 13/52×12/51=1/17; 4/52×3/51=1/221; the
  without-replacement tree's four leaves (20/56, 15/56, 15/56, 6/56) sum to exactly 56/56=1.
- **Independence**: P(king|heart)=1/13=P(king) and the symmetric check P(heart|king)=1/4=P(heart)
  both confirmed; the product test 0.6×0.5×200=60 (match ⇒ independent) vs 0.5×0.55×200=55 against
  an actual 40 (15-student gap ⇒ dependent) is correct in both directions; independent-vs-exclusive
  is never conflated (P(A|B)=0/0.3=0 under exclusivity is correctly kept distinct from P(A)=0.5).
- **Counting**: 5×4×3=60 podiums; 4!=24; C(8,3)=56, C(5,3)=10, 10/56≈0.179; C(4,2)×C(5,1)=30/84
  and 30/56 exactly-two-of-three combinatorial-probability items.

No mathematical, conditioning-direction, or rounding-convention error was found in any of the 16
lessons.

### P0 finding: ILLUSTRATION_REPLACEMENT — 2 rows, both CONFIRMED LIVE (not resolved)

The review brief flagged this course as carrying 2 P0 rows under the ILLUSTRATION_REPLACEMENT
workstream. Both were independently located and verified using `reports/vis/VIS01_PLACEMENTS.csv`
(the authoritative, source-matched figure-placement gate for every course), cross-checked against
the live rendering gate (`isFigureTextAligned` in `src/lib/figureTextAlignment.ts`, consumed by
`LessonPlayer.tsx` and `FigureView.tsx`). **Both figures are currently suppressed at render — this
contradicts an earlier closure claim (see below) and is a genuine, currently-live defect.**

1. **`cpr-03-03/c1`, figure `cpr-multiplication-area`** — `WITHHELD_BLOCKLIST_FINGERPRINT`
   (registered=true, aligned=false, blocklisted=true). Recomputing `figureTextBindingKey(
   "cpr-multiplication-area", c1.body)` against the *current* lesson bytes yields hash `0dc18745`,
   which is present verbatim in `src/lib/figureTextMismatchBlocklist.generated.ts` (line 16). Both
   `LessonPlayer.tsx:615` and `FigureView.tsx:33` gate figure rendering on
   `isFigureTextAligned(...)`, so this figure will not appear for a learner on this step, despite
   the step declaring `"figure": "cpr-multiplication-area"` and its prose stating the figure's
   exact contract ("Half the students ride the bus; 40% of those play a sport; so 0.5 × 0.4 = 0.20
   do both."). **This directly contradicts `reports/closure/S273_CONDITIONAL_PROBABILITY_SOURCE_IMPLEMENTATION.md`**,
   which claims "`cpr-03-03/c1` retains `cpr-multiplication-area`: its source already states the
   exact figure contract" — that packet verified the text/figure content match but not the live
   blocklist gate, which currently suppresses the figure regardless of the correct text. The
   remedial's reuse of the same figure (`rc1`) is unaffected — `VIS01_PLACEMENTS.csv` shows
   `RENDERS` for that binding.

2. **`cpr-05-01/c2`, figure `cpr-permutation-slots`** — `WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD`
   (registered=true, aligned=false, blocklisted=false). This is a different gate:
   `compareExactFigureNumericParity` in `src/lib/figureNumericParity.ts` compares the figure's
   generated rendered-title claim ("5 ways... 4 ways... 3 ways... 5 times 4 times 3 equals 60
   podiums") against c2's body. c2 generalizes to `n!`/`nPk` notation ("n × (n−1) × … × 1")
   without restating the fixed 5/4/3/60 values, and the guard's atom-comparison finds zero
   overlap, so it withholds the figure. The same figure correctly rendered one step earlier at c1
   (`VIS01_PLACEMENTS.csv`: `RENDERS`), so the visual anchor disappears exactly where the
   abstraction is introduced — the step that most needs it to tie the symbol back to the concrete
   count.

Both findings are staged as `REVISE`/`visualDecision: REQUIRED` in the disposition file, with
implementation contracts below. No other course-local figure suppression was found: all other 21
distinct `cpr-*` figure IDs referenced by this course's 16 lessons were confirmed registered in
`FIGURE_IDS`, mapped to a real component in `figures.tsx`, and `RENDERS` in
`VIS01_PLACEMENTS.csv` for every lesson binding.

### Visual truth (all 21 distinct figures, cross-checked against rendered SVG content)

Read the full JSX for every `Cpr*` figure component in `src/components/figures.tsx`. Each one
carries `role="img"` and a truthful, specific `<title>`, and — critically for this course's
two-way-table-heavy chapters — the SVGs hard-code the *same* numbers the lesson prose states, not
a generic or different placeholder table: `CprTwoWayTable` renders 40/60/70/30 inner cells with
100/100 row and 110/90 column totals; `CprTableUnion` renders the same 40/60/70/30 cells with
"100 + 110 − 40 = 170" and "170/200 = 0.85" printed directly on the figure; `CprJointVsMarginal`
highlights the 40-cell (JOINT) beside the 110-edge (MARGINAL); `CprRowVsColumn` shows both
reversed conditionals (40/100=0.400 and 40/110=0.364) side by side; `CprTreeWithoutReplacement`
labels all four branch pairs (5/8, 3/8, 4/7, 3/7, 5/7, 2/7) and all four leaves (20/56, 15/56,
15/56, 6/56); `CprIndependenceTest` shows both the matching (60=60) and gapped (55 vs 40) cases.
No promised diagram was found showing a different quantity or relationship than its adjacent
prose, other than the two P0 rows above, which are suppression (non-render) defects rather than
content-mismatch defects.

### Distinct instructional jobs / traps

Each of the 16 lessons targets a distinct conceptTag with no cross-lesson duplication of question
shape: events-as-sets → complements/at-least-one → mutually-exclusive → addition-rule →
joint/marginal tables → or/and/neither-on-a-table → restricting-the-sample-space →
which-way-round → multiplication-rule → trees → independence-definition → product-test →
independent-vs-exclusive → permutations → combinations → probability-by-counting. The recurring
`probabilityArea` "will this cover more or less than half?" predict-widget (present in roughly
half the lessons' `i1` steps) is a deliberate, explicitly-signposted retrieval-practice benchmark
(its own reveal text calls forward to later reuses, e.g. cpr-05-02's "the benchmark earns its keep
later in this course"), tagged with a consistent `transferFamily` and a different underlying
fraction/context every time — this is intentional spaced scaffolding, not accidental repetition.

Every MCQ distractor and `commonErrors`/`pairErrors` entry read across all 16 lessons names a
real, computed misconception in its feedback using the drawn numbers — none is a bare "try
again," and no trap collides with the correct answer or with another trap in any instance read.
Feedback never conflates P(A|B) with P(B|A): cpr-03-02 is built specifically around this
distinction and gets it right in every direction (including the remedial and the reversed-fraction
"which is bigger" framing).

### Option label-length parity (checked programmatically across every MCQ in the course)

Computed label lengths for all 23 MCQ widgets in the course (steps + remedials). Most items show
no length bias (12/23 have the correct option at or below the longest distractor's length; several
are markedly *shorter* than the longest wrong option, e.g. cpr-01-01/k1 at −89%). Two items,
however, show a severe length imbalance: **cpr-03-01/k1** and **cpr-04-01/k1** — both have their
correct option at 82 characters against a longest-distractor of 43 characters (a 91% margin,
effectively double length), which is exploitable as a "pick the longest" shortcut independent of
reasoning. These are staged as
`REVISE`. A handful of other items (cpr-02-03/k2 at 51%, cpr-05-01/k1 at 31%) show a smaller
margin consistent with ordinary "why" questions where the correct answer states a fuller
mechanism than a terse misconception — these are not flagged as defects on their own, but are
noted here since the pattern is visible across the course and a future authoring pass could
tighten it further.

### Grade-appropriate language

Prose is calibrated to grade 10 (precise set/probability notation — P(A∩B), P(A|B), nPk, C(n,k) —
introduced and used consistently, full derivations shown rather than asserted, explicit references
to prior grade-8 two-way-table knowledge in cpr-02-02). No derived-morphology artifacts, spliced
phrases, or dropped units were observed in any of the 16 lessons.

### Accessibility

Every figure carries `role="img"` and a specific `<title>` describing the actual rendered
relationship (not generic filler). Colour is never the sole cue: every colour-coded region in
every figure (Venn circles, table cells, tree branches) also carries a printed number or text
label, so the same information survives a colourblind or non-visual reading.

## Per-lesson verdicts

| Lesson | Verdict | Notes |
|---|---|---|
| cpr-01-01 Events as Sets of Outcomes | KEEP | Set arithmetic and figures cpr-event-as-set/cpr-union-intersection all correct and rendering. |
| cpr-01-02 Complements and "At Least One" | KEEP | Complement-rule arithmetic (2⁴-1=15, 6³-5³=91) correct; figures render. |
| cpr-01-03 Mutually Exclusive vs Overlapping | KEEP | Overlap counts (18+12-7=23, backwards-solve=8) correct; dragBucket sort correct. |
| cpr-02-01 The Addition Rule | KEEP | 13/52+12/52-3/52=22/52 and 26+4-2=28 (≈0.538) correct; figure matches. |
| cpr-02-02 Two-Way Tables: Joint and Marginal | KEEP | 200-student table internally consistent across every joint/marginal item. |
| cpr-02-03 Or, And, Neither — on a Table | KEEP | S273's original P0 remedial repair independently re-verified as RENDERS/aligned; math correct. |
| cpr-03-01 Restricting the Sample Space | **REVISE** | Math and figures correct; k1 MCQ has a 91%-margin option-length imbalance (see contract). |
| cpr-03-02 Which Way Round? P(A\|B) vs P(B\|A) | KEEP | Flagship conflation-prevention lesson; every direction verified correct. |
| cpr-03-03 The Multiplication Rule | **REVISE** | Math correct; P0 row 1 — cpr-multiplication-area is currently suppressed at c1 (blocklist fingerprint). |
| cpr-03-04 Trees and Drawing Without Replacement | KEEP | Tree arithmetic and leaf-sum-to-1 check correct; figure matches all branch/leaf labels. |
| cpr-04-01 What Independence Means | **REVISE** | Math and figure correct; k1 MCQ has the same 91%-margin option-length imbalance as cpr-03-01/k1. |
| cpr-04-02 The Product Test | KEEP | Product-test arithmetic correct in both the match and gap cases; figure matches. |
| cpr-04-03 Independent vs Mutually Exclusive | KEEP | Never conflates the two concepts; all arithmetic correct. |
| cpr-05-01 Permutations: When Order Matters | **REVISE** | Math correct; P0 row 2 — cpr-permutation-slots is withheld at c2 (fixed-exemplar text guard). |
| cpr-05-02 Combinations: When Order Doesn't Matter | KEEP | 5P3/3!=10, C(6,2)=15, C(10,3)=120 all correct; figure matches. |
| cpr-05-03 Probability by Counting | KEEP | S273's original P0 fail-close (c2 correctly has no figure) independently re-verified; math correct. |

## P0 illustration finding — status

**NOT RESOLVED for one of the two rows found; the other is a distinct, newly-verified defect.**
Both P0 rows are **currently live/suppressed**, verified against the authoritative
`reports/vis/VIS01_PLACEMENTS.csv` gate evidence and the live rendering code path, not merely
recorded evidence:

1. `cpr-03-03/c1` / `cpr-multiplication-area` — `WITHHELD_BLOCKLIST_FINGERPRINT`. Contradicts the
   "retains" claim in `reports/closure/S273_CONDITIONAL_PROBABILITY_SOURCE_IMPLEMENTATION.md`.
2. `cpr-05-01/c2` / `cpr-permutation-slots` — `WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD`.

Per the authority rules governing this review, source-matched gate evidence (`VIS01_PLACEMENTS.csv`
and the live `isFigureTextAligned`/`compareExactFigureNumericParity` code paths) is authoritative
over an earlier closure packet's claim; the earlier packet's "retains"/"already states the exact
figure contract" language is treated as stale for `cpr-03-03/c1` specifically, since it did not
account for the live blocklist gate.

## Implementation contracts for REVISE items

- **cpr-03-01** (`content/courses/conditional-probability/lessons/cpr-03-01.json`, step `k1`):
  Option-label-length parity. The correct option (82 chars) is 91% longer than the longest
  distractor (43 chars). Lengthen distractors `o2`–`o4` with a comparably explanatory clause (each
  already names a real misconception), or trim `o1` to a comparably terse form that still states
  "same numerator, smaller denominator." No math, feedback substance, or figure change needed.

- **cpr-03-03** (`content/courses/conditional-probability/lessons/cpr-03-03.json`, step `c1`):
  P0 — figure `cpr-multiplication-area` is suppressed by `src/lib/figureTextMismatchBlocklist.generated.ts`
  (key `0dc18745`) despite the body correctly stating the figure's exact 0.5×0.4=0.20 contract.
  Either (a) have the blocklist owner regenerate/prune the stale entry for this pairing, or (b)
  reword `c1`'s body — preserving the exact relationship and bus/sport-conditional-on-bus framing —
  so its hash no longer collides with the blocklisted fingerprint. Do not remove the `figure` key;
  the visual is pedagogically required here (this is the area-model introduction of the
  multiplication rule).

- **cpr-04-01** (`content/courses/conditional-probability/lessons/cpr-04-01.json`, step `k1`):
  Same option-label-length parity defect as cpr-03-01/k1 (82 vs 43 chars, 91% margin). Same
  contract: lengthen distractors `o2`–`o4` or trim `o1`.

- **cpr-05-01** (`content/courses/conditional-probability/lessons/cpr-05-01.json`, step `c2`):
  P0 — reused figure `cpr-permutation-slots` is withheld by the fixed-exemplar numeric-parity
  guard because `c2`'s generalization to `n!`/`nPk` never restates the figure's fixed 5/4/3/60
  values. Either (a) reword `c2`'s body to explicitly recall the medal numbers (e.g. "as in the
  5×4×3 podium above"), or (b) drop the reused `figure` key from `c2` entirely, matching the
  pattern already used by the analogous generalization steps in `cpr-05-02/c2` and `cpr-05-03/c2`,
  which correctly carry no figure key.
