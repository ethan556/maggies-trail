# S324 ENG-FIG — figures-authority remediation evidence

Worker: cowork-s324-engfig (figures-authority packet, S324 wave). Branch: codex/v4-s244-authored-visual-wave.
Scope: the 11 signed ESCALATE records in reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl —
s323-P3-df3-01-01/-01-02/-02-01, s323-P6-g2l-01-03/-03-01/-03-02/-03-03, s323-P7-pc-01-02/-03-01,
s323-P8-vec-04-01, s323-P8-sy-06-01. Contracts: S322_ASSESS_F11.md (df3), S322_ASSESS_F5.md §48–51
(g2l), S322_ASSESS_F8.md (pc), S316_LANEB_VECTORS_MATRICES_ASSESSMENT.md (vec-04-01),
S319_ASSESS_SIM_GF.md (sy-06-01). Evidence packets S323_FIX_P3/P6/P7/P8.md read in full first.
Hard constraint honored: no npm run / vitest / tsc / builds — all verification via node,
npx tsx (with scripts/audit/tsconfig.figure-ssr.json), and npx esbuild one-offs.
Dispositions: reports/closure/cowork-staging/laneA-s324-engfig.jsonl (11 records).

## Figures added (all additive; registered via node scripts/gen-figure-ids.mjs, 2017 → 2029 ids)

| id | component | params/content | bound at |
|---|---|---|---|
| mult3-fair-shares-16-over-2 | Mult3FairShares16Over2 | Mult3FairSharesExample{16,2} → "16 ÷ 2 = 8 each" | df3-01-01/c1 |
| mult3-fair-shares-12-over-2 | Mult3FairShares12Over2 | {12,2} → "12 ÷ 2 = 6 each" | df3-01-01/rem-g3d-div2-c |
| mult3-fair-shares-18-over-3 | Mult3FairShares18Over3 | {18,3} → "18 ÷ 3 = 6 each" | df3-01-02/rem-g3d-div3-c |
| mult3-how-many-groups-21-over-3 | Mult3HowManyGroups21Over3 | new Mult3HowManyGroupsExample{total:21,size:3} → "21 ÷ 3 = 7" (7 rings of 3) | df3-01-02/c1 |
| mult3-divide-by-nine-54-over-9 | Mult3DivideByNine54Over9 | new Mult3DivideByNineExample{groups:6} → 6 rows of ten minus one; "54 ÷ 9 = 6 groups"; number-word title (family convention, not admitted to the claims map) | df3-02-01/rem-g3d-div89-c |
| g2l-read-landing-45-20 | G2ReadLanding45Plus20 | new G2ReadNumberLine: start 45, +10/+10 arcs, landing mark "?" | g2l-03-01/k3 |
| g2l-read-gap-53-33 | G2ReadGap53Minus33 | marks 33/53, shaded gap labeled "?" | g2l-03-02/k1 |
| g2l-read-missing-jump-33-43 | G2ReadMissingJump33To43 | start 33, landing 43, one jump labeled "?" | g2l-03-03/k3 |
| pc-arc-length-hypotenuses | PcArcLengthHypotenuses | curve cut into chords + magnified dx/dy/√(dx²+dy²) right triangle; word-only title | pc-01-02/c1, /rc1 |
| pc-integrand-speed | PcIntegrandSpeed | tracing point with tangent v arrow; "√((dx/dt)² + (dy/dt)²) = \|v\| = speed"; "L = ∫ speed dt" | pc-01-02/c2 |
| pc-motion-vectors | PcMotionVectors | r(t) from origin to moving point, tangent v, inward a, "speed = \|v\|", "v = ⟨x′, y′⟩  a = ⟨x″, y″⟩" | pc-03-01/c1, /rc1 |
| vec-matrix-row-recipe | VecMatrixRowRecipe | matrix as two color-coded row recipes → ax+by (new x), cx+dy (new y) | vec-04-01/c2 |

New/changed helpers (still additive in effect):
- `Mult3FairSharesExample` width now also covers its caption span (chars × fontSize × 0.72, the
  S260 estimate) and re-centers rings only when the caption sets the width — the sole prior
  binding (mult3-fair-shares-15-over-5) renders byte-identically (verified: viewBox 340×108
  unchanged, no translate wrapper emitted).
- `Mult3HowManyGroupsExample` and `Mult3DivideByNineExample` are new parameterized helpers
  following the S318 Mult3FairSharesExample/Mult3MissingFactorExample pattern.
- `G2ReadNumberLine` is a new single-panel sibling of `G2CandidateNumberLines` (same 0-anchored
  scale, hop-arc, gap-band conventions, `NumberLineAxis` inset-arrow axis).

## The one non-additive edit: SyDilationParallel (sanctioned)

The signed S319-F-sy-06-01 contract (S319_ASSESS_SIM_GF.md, sy-06-01 item 1, cited by
s323-P8-sy-06-01) explicitly orders a coordinate rewrite of this existing component: the old
hardcoded image (200,30)–(260,30) implied k≈2.667(x)/1.667(y) for A and 2.2(x)/1.667(y) for B —
no single dilation factor, rays missing the original endpoints. Implemented exactly the
contract's mechanism: `img = O + k·(pt − O)` (mirroring DilationScale) with k=1.8, giving
A(100,70)→(148,22) and B(140,70)→(220,22). Recomputed: k_x = k_y = 1.8 for both endpoints
(rays exactly collinear with the center through each original endpoint); image parallel (both
endpoints y=22) with length 72 = 1.8×40. k=1.8 instead of the contract's example k=2 keeps the
image segment below the caption band so no ray crosses the title text (the contract's "e.g."
k=2 → (160,10),(240,10) would put the image behind the caption); every requirement of the
contract/reopen condition — one k, collinear rays, parallel image — is satisfied and now pinned
in src/components/s324Figures.test.tsx. The "image" label moved with the recomputed segment
(y=40 → y=32), per the contract's "re-derive the on-screen label positions from the same
computed points".

## Lesson edits

- df3-01-01: c1.figure mult3-fair-shares → mult3-fair-shares-16-over-2; rem-g3d-div2-c
  mult3-fair-shares → mult3-fair-shares-12-over-2. (16÷2=8 per its own c2; 12÷2=6 per remedial.)
- df3-01-02: c1.figure mult3-how-many-groups → mult3-how-many-groups-21-over-3 (21÷3=7, the
  lesson's own i1/k1 fact); rem-g3d-div3-c mult3-how-many-groups → mult3-fair-shares-18-over-3.
  DEVIATION NOTE: the F11 contract's example instantiated the remedial as how-many-groups{18,3},
  but the remedial body ("Eighteen can be split into 3 equal groups of 6") and its check ("Share
  18 counters equally among 3 groups") use the fair-shares reading — a how-many-groups render
  (6 rings of 3) would contradict the stated grouping structure, so the truthfulness rule
  ("truthful to the bound step's actual quantities") selects the fair-shares 18÷3=6 figure.
- df3-02-01: rem-g3d-div89-c mult3-divide-by-nine → mult3-divide-by-nine-54-over-9 (54÷9=6,
  matching "Six groups of 9 make 54"). c1/c2 untouched.
- g2l-01-03: k3 replaced (same-template halfway mcq → closer-mark job: 43 between 40/50,
  distances 3 vs 7; correct "The 40 mark"). No figure (as before). F5 §48.
- g2l-03-01: k3 replaced (duplicate first-addend mcq → read-the-landing job over
  g2l-read-landing-45-20; 45+20=65; traps 45 start-mark, 47 hop-as-one, 25 backward). F5 §49.
- g2l-03-02: k1 replaced (duplicate which-drawing gap mcq → compute-the-gap job over
  g2l-read-gap-53-33; 53−33=20; traps 86 sum, 30 extra hop, 19 fencepost). k2's P6 trap fix
  (107 = 64+43) verified intact. Remedial which-drawing binding untouched per contract. F5 §50.
- g2l-03-03: k3 replaced (third-occurrence gap template → missing-jump reading over
  g2l-read-missing-jump-33-43; 43−33=10; traps +76 sum, −10 direction, +11 off-by-one),
  exercising this lesson's own c1/c2 concept. F5 §51.
- pc-01-02: c1/rc1 → pc-arc-length-hypotenuses; c2 → pc-integrand-speed (replacing
  dr-tangent-line / dr-derivative-as-function). Widgets untouched (P7's k3 fix intact).
- pc-03-01: c1/rc1 → pc-motion-vectors (replacing dr-derivative-as-function). c2 remains
  deliberately unfigured per the session271 withheld pin ("a · v = 0").
- vec-04-01: c2.figure → vec-matrix-row-recipe (P8's c1=vec-matrix-row-dot move verified
  intact; vec-det-area remains unbound here, reserved for vec-04-02).
- All four g2l mcq replacements keep: mcq type at the same step id (session308's exact-inventory
  pin), option ids o0–o3 with correct=o0, correct option at array index row%3+1 (verified 3/3/1/2
  for rows 5/11/12/13; global distribution 5/5/4 intact), 4 distinct labels, all feedbacks >20
  chars and diagnostic (lintLesson clean), evaluate() truth per option, digit-normalized prompt
  distinct from every other widget prompt in its lesson.

## Pins updated (old → new)

src/lib/session254.divisionFluencyG3CourseIntegrity.test.tsx (expectedFigures):
- df3-01-01[0]: mult3-fair-shares → mult3-fair-shares-16-over-2 (this packet's rebind)
- df3-01-02[0]: mult3-how-many-groups → mult3-how-many-groups-21-over-3 (this packet's rebind)
- df3-01-04[0]: mult3-missing-factor → mult3-missing-factor-6x7 (pre-existing S318 drift repair)
- df3-02-01[0]: mult3-missing-factor → mult3-missing-factor-8x9 (pre-existing S318 drift repair)
- df3-02-03[0]: mult3-missing-factor → mult3-missing-factor-7x8 (pre-existing S318 drift repair)
- df3-02-04[0]: mult3-missing-factor → mult3-missing-factor-6x9 (pre-existing S318 drift repair)
  (The four "drift repair" rows were red BEFORE this packet: S318's c1 rebinds landed in the
  lessons and in s318G3Figures.test.tsx but this pin was never refreshed. Verified by a node
  replica of the test's own comparison against current lesson bytes. Re-pinned to the truthful
  current state.)

src/lib/session254.divisionFluencyG3FollowOn.test.tsx:
- figures("df3-02-01") [mult3-missing-factor, mult3-divide-by-nine] →
  [mult3-missing-factor-8x9, mult3-divide-by-nine] (same pre-existing drift class).

src/components/s318G3Figures.test.tsx ("only the 19 named placements" map):
- df3-02-01 rem-g3d-div89-c: mult3-divide-by-nine → mult3-divide-by-nine-54-over-9.
  (The escalation's claimed second pin — a `targets` entry for rem-g3d-div89-c — does not exist
  in the file; only c1 is a target (line 87, unchanged). One pin edit sufficed.)

src/lib/session308.numberLineG2ChoiceOrder.test.ts (figure, promptHash, optionsHash):
- g2l-01-03/k3: null | 55b692b6… → 96ab4519… | 470106b4… → b2d4714c…
- g2l-03-01/k3: g2l-choice-add-45-20 → g2l-read-landing-45-20 | a816718e… → 2d973978… | 17cd0c60… → a469a9ba…
- g2l-03-02/k1: g2l-choice-gap-53-33 → g2l-read-gap-53-33 | fb734644… → f9a12579… | c27348b5… → 7cdc4121…
- g2l-03-03/k3: g2l-choice-gap-43-33 → g2l-read-missing-jump-33-43 | 069463f1… → c37505ee… | c27348b5… → 715ffacb…
  Every hash recomputed with the test's own algorithm (sha256 of prompt; sha256 of
  JSON.stringify of id-sorted {id,label,correct,feedback}) in a node one-off and re-verified
  against the edited file by re-parsing its contract rows and re-running the full assertion set.

src/components/session244.visualPromiseNumberLines.test.tsx:
- numberLinePacket: removed the three replaced rows (g2l-03-01/k3, g2l-03-02/k1, g2l-03-03/k3);
  distinct-candidate-set expectation 6 → 4 (remedial rows keep g2l-choice-add-44-20 and
  g2l-choice-gap-53-33 bound; g2l-choice-add-45-20 and g2l-choice-gap-43-33 remain registered
  but unbound). Added readDrawingPacket assertions binding + rendering the three new figures.
- Repaired a pre-existing stale assertion: the packet expected option labels in exact order
  [Drawing A..D], but S308's shuffle (pinned by session308) reordered options; label check is
  now order-insensitive (sorted), with a comment pointing at the S308 pin.

src/components/figures.numberLineDirection.s260.test.tsx:
- AXES += g2l-read-landing-45-20:1, g2l-read-gap-53-33:1, g2l-read-missing-jump-33-43:1;
- DIRECTIONS += g2l-read-landing-45-20:{2,right}, g2l-read-missing-jump-33-43:{1,right}
  (the gap figure has no hop arrows, so it is axis-audited only). Replicated the tests' own
  head/axis/numeral logic in a node probe: counts and insets match.

New: src/components/s324Figures.test.tsx — pins the 9 new figure renders (real numbers/content
substrings), the 12 rebound placements, the pc-03-01/c2 stays-unfigured contract, the
divide-by-nine number-word title convention, mult3-fair-shares-15-over-5 byte-compat, and the
SyDilationParallel single-k geometry. Every assertion verified by node replica before writing.

## Known pre-existing red gates NOT owned or expanded by this packet

- src/lib/session261.numberLineG2Course.test.ts asserts mcq option ids in sorted order
  (["o0","o1","o2","o3"]) and src/lib/session194.numberLine.test.ts asserts correct-at-index-0 —
  both contradict the later session308 shuffle contract for ALL 14 g2l mcqs and were red before
  this packet (verified by node replica against pre-edit bytes). My replacements follow the
  latest signed pin (session308). These two stale gates are outside this packet's figure-binding
  mandate; flagged for the test-owner lane.

## Regenerated artifacts

- src/components/figureIds.ts: 2017 → 2029 ids (node scripts/gen-figure-ids.mjs after each batch).
- src/lib/figureNumericClaims.generated.ts: 193 → 197 claims (npx tsx
  scripts/audit/generate-figure-numeric-claims.mts); the only additions are the four new digit
  fair-shares/how-many-groups titles (each verified against its bound step: no explicit numeric
  claim in those bodies, so exact-parity gating cannot misfire). The divide-by-nine, g2l-read,
  pc, and vec figures deliberately carry word-only/no-equality titles and are not admitted.

## Gates (all green; run after each group and re-run at the end)

- node scripts/gen-figure-ids.mjs → "figureIds.ts written: 2029 ids".
- npx tsx scripts/audit/vis01-illustration-measurement.mts → TOTAL PLACEMENTS 3573, BY CAUSE:
  3573 RENDERS (baseline before packet: 3572/3572 RENDERS; +1 placement = vec-04-01/c2).
- node scripts/audit/figure-text-alignment.mjs → {"uses":3573,"fixedExemplars":12,
  "renderedFixed":12,"suppressed":0}.
- npx esbuild parse of every edited TSX/TS file (figures.tsx, 6 test files, figureIds.ts,
  figureNumericClaims.generated.ts) → clean.
- S260 viewport-parity replica (the test's own scanNumeralBoxes math: width = chars×fontSize×0.72,
  ascent 0.98/descent 0.28, anchor-aware, translate-aware) over every new/modified figure →
  zero numeral boxes outside any viewBox, so the global ≤261 budget cannot have grown.
  This required real work: the fair-shares/how-many-groups/divide-by-nine captions initially
  overran their inherited 210/230-wide viewBoxes (measured −21.7…+249.6 vs 210/230) and were
  fixed by caption-aware widths before landing.
- S238 label-collision replica (textBoxes.testkit model: same box math, eps 0.5) over all 14
  new/modified figures → zero colliding pairs (PcMotionVectors' v/a labels were repositioned
  after the replica caught a v-label/top-caption overlap).
- session308/session244/session254/s318/s324 assertion sets fully replicated in node one-offs →
  ALL PASS (outputs in the session log; representative: "ALL GROUP-A PROBES PASS",
  "ALL GROUP-B PROBES PASS", "ALL GROUP-C PROBES PASS", "ALL S324-TEST-REPLICA PROBES PASS",
  sy rays k=1.8 x/y agree through (100,70) and (140,70), image parallel at y=22).
- lintLesson clean for all six touched/asserted g2l lessons (one iteration: a "No hop…"-leading
  feedback tripped the GENERIC-feedback lint and was rewritten diagnostically, with the
  session308 options hash re-pinned to the final bytes).

## Files touched

src/components/figures.tsx; src/components/figureIds.ts (generated);
src/lib/figureNumericClaims.generated.ts (generated); src/components/s318G3Figures.test.tsx;
src/components/session244.visualPromiseNumberLines.test.tsx;
src/components/figures.numberLineDirection.s260.test.tsx; src/components/s324Figures.test.tsx (new);
src/lib/session254.divisionFluencyG3CourseIntegrity.test.tsx;
src/lib/session254.divisionFluencyG3FollowOn.test.tsx;
src/lib/session308.numberLineG2ChoiceOrder.test.ts;
content/courses/division-fluency-g3/lessons/{df3-01-01,df3-01-02,df3-02-01}.json;
content/courses/number-line-g2/lessons/{g2l-01-03,g2l-03-01,g2l-03-02,g2l-03-03}.json;
content/courses/parametric-polar-calculus/lessons/{pc-01-02,pc-03-01}.json;
content/courses/vectors-matrices/lessons/vec-04-01.json;
FIGURE_TEXT_ALIGNMENT_AUDIT.csv + reports/vis/VIS01_PLACEMENTS.csv (audit outputs);
reports/closure/cowork-staging/laneA-s324-engfig.jsonl; this file.
Not touched: src/lib/session299*, src/lib/session286*, g3f/g2a lessons, widgets.tsx, the ledger,
other staging files. No escalations remain open from this packet: all 11 discharged.
