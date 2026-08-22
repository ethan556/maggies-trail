# S323 Fix Packet P8 — before/after evidence

Reviewer: cowork-s323-P8-fixer. Scope: dm-02-01, dm-02-02, iar-01-02, iar-03-03, mult-05-01,
vec-02-01, vec-04-01, ns-03-02 (P0), ep-03-01, sy-06-01.

## ns-03-02 (P0) — contract S319-D-ns-03-02 (ESCALATE, path (a) content-only rewording)

Defect: i1 numberLineHop prompt/feedback promised an on-screen "5-hopper" second track the
widget schema cannot render (single track only; KNOWN_ISSUES.md S119 gap). Path (b) — a
two-track engine mode — is src/** work, prohibited for this content packet. Dispatch of this
item to a content fix packet selects path (a) exactly as scoped in
reports/closure/S319_ASSESS_TSE_NS.md ("Scope if (a) is chosen": widget.prompt and the
5-hopper feedback strings). All strings implying a visible second hopper were reworded to
"multiples of 5" knowledge language; no widget field, answer, or other step changed.
Arithmetic unchanged and re-verified: multiples of 3 = 3,6,9,12,15; multiples of 5 = 5,10,15;
first shared = 15 = start(0)+hop(3)*hops(5).

Before → after (step i1 only):
- prompt: "Hop by 3 from 0. Stop at the first place a 5-hopper would also land."
  → "Hop by 3 from 0. Using what you know about multiples of 5, stop at the first landing that is also a multiple of 5."
- commonLandings[8].feedback: "…where their hops agree — the hoppers never both stop at 8."
  → "…where their lists of multiples agree — 8 is not a multiple of 3 or of 5."
- commonLandings[12].feedback: "12 is a landing for the 3-hopper, but the 5-hopper skips it: 5 goes 5, 10, 15. A shared landing…"
  → "12 is a multiple of 3, but not of 5: the multiples of 5 are 5, 10, 15. A shared multiple…"
- commonLandings[10].feedback: "10 is a landing for the 5-hopper, but the 3-hopper skips it: 3 goes 3, 6, 9, 12, 15. A shared landing…"
  → "10 is a multiple of 5, but hopping by 3 never lands there: 3 goes 3, 6, 9, 12, 15. A shared multiple…"
- missFeedback: "…check each stop against the 5-hopper's stops: 5, 10, 15."
  → "…check each stop against the list of multiples of 5: 5, 10, 15."
- successFeedback: "15 — the first place both hoppers stop… the earliest landing they share."
  → "15 — the first multiple of 3 that is also a multiple of 5… the earliest multiple they share."

reviewBasisHash after edit: 824bfe7278a74cb5bcc79a84a0334a84b62d51f567055c0a8c0d47b75f88f8e5

## dm-02-01 — contract S322-F8-dm-02-01 (REVISE) + CHOICE-0012 (k2 length leak)

Defects: (1) i1 scatterFit tolerance 0.4 vs true OLS MSE_min 0.746 / slider-grid min 0.833 —
success unreachable. (2) i2 tolerance 0.4 vs true MSE_min 2.16 / grid min 2.40 — unreachable.
(3) k2 correct option 84 chars vs longest distractor 46 — length leak.

Fixes (scope exactly i1.widget.tolerance, i2.widget.tolerance, k2.widget.options[*].label):
- i1.tolerance: 0.4 → 1 (≥0.75 per contract; node probe: exactly one passing grid cell,
  m=5, b=60, MSE 0.833 — matching successFeedback "About y = 5x + 60").
- i2.tolerance: 0.4 → 2.5 (≥2.2 per contract; node probe: exactly one passing grid cell,
  m=−2, b=180, MSE 2.4 — matching "About y = −2x + 180").
- k2 labels rebalanced (correct feedback/flags unchanged):
  a (correct): "The gaps between the points and the line are small overall, balanced above and below" (84)
    → "The point-to-line gaps stay small overall, balanced above and below" (67)
  b: "Every single point lies exactly on the line" (43) → "…, with zero gap at every point" (73)
  c: "The line touches the highest and lowest points" (46) → "The line touches the highest and the lowest points, spanning the extremes" (73)
  d: "The line has the steepest possible slope" (40) → "…, to show the trend strongly" (68)
  New lengths 67/73/73/68 — correct is neither longest nor an outlier.

reviewBasisHash after edit: 947031969992aa8699c8633c359eff78c069fec72f05625a558eb7ab641c050a

## dm-02-02 — contract S322-F8-dm-02-02 (REVISE) + CHOICE-0013 (ch1 numeral clue)

Defects: (1) i1 reuses dm-02-01's hours-vs-score dataset with tolerance 0.4 (unreachable,
true MSE_min 0.746 / grid min 0.833). (2) i2 tolerance 0.8 vs true OLS MSE_min 30.95 / grid
min 31.17 — unreachable by ~39x. (3) CHOICE-0013: ch1's correct option was the only one
carrying the stem's numerals ("0.95 in magnitude beats 0.8") — a surface clue.

Fixes:
- i1.tolerance: 0.4 → 1, matching dm-02-01's fix per contract (same dataset, consistent gate;
  sole passing grid cell (m=5,b=60) MSE 0.833, matching successFeedback "y = 5x + 60 again").
- i2.tolerance: 0.8 → 32 (contract's "raise to ≥32" lower-risk path; node probe: exactly two
  passing grid cells (5.5,58) MSE 31.29 and (6,56) MSE 31.17, both hugging the true OLS line
  y≈5.74x+56.7; successFeedback is generic about big residuals so no text change needed).
- ch1 distractor labels now carry the same numerals as the correct option (misconceptions kept):
  a: "Dataset A — positive is always stronger than negative" → "Dataset A — positive 0.8 beats negative −0.95"
  c: "They are equally strong since both are 'high'" → "Equally strong — 0.8 and −0.95 are both 'high'"
  d: "Cannot compare a positive and a negative correlation" → "Cannot compare — 0.8 and −0.95 point opposite ways"
  Lengths 39/45/46/50 with correct=39 — parallel construction, no numeral or length clue.

reviewBasisHash after edit: fb202df25192b5022be0e68c66b5d0b1f2269fe90d486fca29e3b7867dbf7041

## iar-01-02 — contract S322-F2-iar-01-02 (REVISE) + CHOICE-0047 (same ch1 item)

Defect: ch1 mcq correct option o1 (61 chars) was the only option carrying a parenthetical
verification "(0 = 2·0)" plus a prescriptive fix "use another point like (1, 0)" — a
construction/length outlier vs distractors (31, 22 chars) that lets a learner pick it
without reasoning.

Fix (contract's trim path, o1.label only; feedback and correctness flags unchanged):
- o1: "It's on the boundary (0 = 2·0); use another point like (1, 0)" (61)
  → "It's on the boundary — use a different point" (44)
  No option now carries a verification computation; 44 vs 31/22 sits inside the 1.5–2x
  ordinary-variance band S322_ASSESS_F2 itself deems non-defective. Math re-verified:
  (0,0) satisfies 0 = 2·0, so it lies on y = 2x, the boundary of y > 2x.

reviewBasisHash after edit: 7ba420b257446572dd9c977ada87ee82eecb067e89fcdb756a3a75138f355775

## iar-03-03 — contract S322-F2-iar-03-03 (REVISE)

Defect: i1b pointErrors feedback for (4,4) called the x + 2y ≤ 8 constraint "the flour cap",
but this lesson's story is cookies/brownies/oven slots ("oven cap" used everywhere else —
9 other occurrences); "flour" is copy-over from the unrelated iar-03-01 lesson.

Fix (one word, exactly per contract): "breaks the flour cap x + 2y ≤ 8" →
"breaks the oven cap x + 2y ≤ 8". Arithmetic in the same string re-verified:
x + 2y = 4 + 2·4 = 12 > 8, so (4,4) indeed violates the cap. No other text changed.

reviewBasisHash after edit: 4b4bf62e3829aadc6b470ac7b01f2d25f6710302e79888c6d071a58867fcf01a

## mult-05-01 — contract S321-F9-mult-05-01 (REVISE): verified fixed, no content edit needed

Defect: static mult3-add-table figure highlighted the anti-diagonal (r+c=3, constant sum)
while c1's text and k1's fold check teach the MAIN doubles diagonal (r=c).

Resolution: the S321-F9 contract's scope was "src/components/figures.tsx only... no
lesson-JSON change is needed". Contract option (a) is already implemented in the working
tree by the authorized figure-fix packet and fully attributed in
reports/closure/S322_V2_F479_FIXES.md item 17 (consumer grep, in-place Mult3AddTable
rewrite to r===c highlight + mirror caption, viewBox 112→122, aria/title updated). I
independently verified in src/components/figures.tsx:4512 that the component now highlights
r===c cells (values r+c+2 → diagonal 2,4,6,8, the doubles) with caption "the table mirrors
across this diagonal", matching c1/k1 exactly; grep confirms mult-05-01 is mult3-add-table's
only content consumer. Per my packet's figure constraint (figureId/params only, never src)
no further work exists in my authority, and none is needed — the S321-F9 reopen condition
("close after the figure visibly highlights r=c") is satisfied. Lesson JSON unchanged;
reviewBasisHash unchanged from the assessed basis (lesson/course bytes untouched):
e29150d65bcd395bb7a92338ea0ce500f7b9d0ac95b853fad5df699c335a5f83

## vec-02-01 — contract S316-VM-vec-02-01 (REVISE) + PROGRESSION-vec-02-01 (k3 near-duplicate)

Defect: k1 (⟨3,0⟩+⟨0,4⟩) and k3 (⟨1,2⟩+⟨2,2⟩) both landed on the identical resultant ⟨3,4⟩
with the identical answer 5 — k3 tested no new arithmetic and was pattern-matchable.

Fix (contract scope: k3 approxConstants, two numericErrors, explanationVariants,
fallback/successFeedback; no other step changed):
- k3 now asks the magnitude of ⟨2, 5⟩ + ⟨3, 7⟩ = ⟨5, 12⟩, magnitude √(25+144) = √169 = 13
  (exact integer, so approxRound 0 / tolerance 0 grade it exactly; addends stay
  non-axis-aligned, preserving k3's generalize-past-axis-aligned job).
- approxConstants: x1 1→2, y1 2→5, x2 2→3, y2 2→7.
- numericErrors: 7 ("3+4 add-the-components") → 17 (5+12, same misconception);
  25 (magnitude squared) → 169 (magnitude squared, same misconception).
- explanationVariants / fallbackFeedback / successFeedback updated to the ⟨5,12⟩/13 numbers.
- Answer separation verified: k1=5, k3=13, ch1 (⟨6,0⟩+⟨0,8⟩)=10 — all distinct.

reviewBasisHash after edit: fe7e739cbe5a80b1215f0ad39cefd9e007b40b9ae38c9981ecae1c5c99f535b9

## vec-04-01 — contract S316-VM-vec-04-01 (REVISE, visual): partial — remainder src-blocked, ESCALATE

Defect: c1 (matrix-vector product text, no mention of area/determinant) was bound to figure
vec-det-area, which labels "area = |det| = 5" — a concept not taught until vec-04-02, so a
first-time reader sees an unexplained det with no textual support; c2 held vec-matrix-row-dot,
the exact visual c1 needs.

Implemented (within figureId-rebinding authority, per the contract's own "move it to c1"):
- c1.figure: "vec-det-area" → "vec-matrix-row-dot" (before: line 13 '"figure": "vec-det-area"').
- c2: removed the now-moved "figure": "vec-matrix-row-dot" binding (the "move"); c2's text is a
  verbal restatement of the same row-recipe the figure states, and the figure now appears at
  the concept that introduces the product. No text, answer, or widget change (per contract).
- vec-det-area no longer bound anywhere in this lesson (verified) — reserved for vec-04-02
  per contract; binding it into vec-04-02 is outside this packet's 10-lesson scope.

Src-blocked remainder (ESCALATE): the contract requires c2 to be paired with a NEW, DISTINCT
visual (or a new registered figure id for c1) — searched every registered figure id and no
existing component depicts the row-dot/product idea besides vec-matrix-row-dot itself
(vec-transform/vec-read-transform are column-image visuals and would recreate the mismatch
class). Authoring a new figures.tsx component is src/** work outside this packet's authority.

reviewBasisHash after edit: c17b4223b2c462500f1df57c8a83952dc7514531d3ade58733e0fb0740d003b6

## ep-03-01 — contract S321-V2-ep-03-01 (REVISE, visual REQUIRED) + PROGRESSION-ep-03-01 (k2)

State verified in the working tree; no lesson-JSON edit needed:
- Defect A (remedial byte-duplicate of k1): already fixed and verified by S321-V2 itself —
  remedial now uses (2x)(x+5), coefficient 10 (re-verified: 2·5=10; commonError 7=2+5 ✓).
- Defect B (c1 figure): the S321-V2 hold was provenance, not content — the
  monomial-distribute-area component was unattributed. That hold is now discharged:
  reports/closure/S322_ENGINEERING.md Task A records the bounded engineering owner ADOPTING
  the component with independent review (registration check, rendered-truth check vs c1.body
  "3x(x+4)=3x²+12x", isFigureTextAligned pass, adversarial-audit row PASS, plus a real
  containment fix — caption split, viewBox 132→146 — pinned in s322Figures.test.tsx).
  I re-verified: c1.figure = "monomial-distribute-area"; figures.tsx:7857 renders 3x·x=3x²
  (solid) and 3x·4=12x (hatched) with the split caption; the id is in FIGURE_IDS. The
  contract's figure sub-item now has its signed authorization and independent review.
- PROGRESSION-ep-03-01 (k2 number-normalized vs i3): job assignment recorded per the row's
  "assign question jobs and approve" branch. i3's job: the CROSS term (coefficient of x³ = 4·2
  = 8, coefficient-multiplication demand). k2's job: the LEADING term (coefficient of x⁴ =
  4·1 = 4), targeting the invisible-coefficient-1 misconception on x²·x² — its own
  commonErrors (1: "the 4 carries through"; 8: "that's the x³ coefficient") show the two steps
  trap different errors. Distinct misconception jobs on a deliberately shared product; not a
  numbers-only repeat. Approved as-is; replacing k2 would also fight its declared
  poly-mul-mono/mulHigh variant form for no pedagogical gain.
- Arithmetic spot-check of the whole spine: k1 12 ✓, i2 −10 ✓, i3 8 ✓, k2 4 ✓, k3 15 ✓,
  ch1 6 ✓ ((−2x)(x−3) = −2x²+6x).

reviewBasisHash (unchanged lesson bytes): de7db318144d6c0af8affe9c96c4666e71a965213e441e7b57e507a0d13dd4f4

## sy-06-01 — contract S319-F-sy-06-01 (REVISE, visual REQUIRED): teaser fixed; figure src-blocked, ESCALATE

Defect (2), r1 teaser — FIXED. sy-06-01 is the course's final lesson (ch6 last per
course.json; sy-05-03's teaser already forwards INTO this lesson), yet its teaser pointed
backward at ch5 ("next chapter: applying similarity to indirect measurement.").
Before → after (r1.teaser only):
- "next chapter: applying similarity to indirect measurement."
  → "Course complete! Next up: right-triangle trigonometry, where the fixed ratios of
     similar right triangles get names — sine, cosine, and tangent."
  (Per contract: reflects being the actual final lesson and points at the genuine next
  course in the track — right-triangles-trig exists in this repo; the claim is
  mathematically sound: trig ratios are well defined precisely because right triangles
  with equal acute angles are similar.)

Defect (1), sy-dilation-parallel figure — NOT FIXABLE IN THIS PACKET (ESCALATE).
Verified still-broken in src/components/figures.tsx (function SyDilationParallel,
line 29268): center (40,130), original (100,70)-(140,70), image (200,30)-(260,30) hardcoded;
recomputed k for A: x (200-40)/(100-40)=2.667 vs y (30-130)/(70-130)=1.667; for B:
(260-40)/(140-40)=2.2 vs 1.667 — no single k, so the dashed rays do not pass through the
original endpoints. The contract's fix (compute image = O + k*(pt-O) with k=2 → (160,10),
(240,10)) is a src/components/figures.tsx edit, outside this content packet's authority
(figureId rebinding only). No alternate registered figure renders the
segment-misses-center-image-parallel idea (sy-dilation-origin is center-through-point
mapping; gf-dilation-excluded is rigidity; dilation-scale is polygon scaling) — rebinding
would recreate a figure/text mismatch, so the binding was left for the figures.tsx owner.

reviewBasisHash after edit: 830ce5a7b2ffc541269ded296e7f4061d31a40526cfb948a9470235340bb0309
