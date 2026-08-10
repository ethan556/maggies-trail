# S214 — content-change ledger

**Three authored lesson files changed; one candidate refused.** Content-change proof 810 → 812
(se-01-03 re-edited under its existing S213 entry); hash proof 1,701/1,701.

## 1. `tse-01-01.json` — the rejected step, rebuilt and re-authored

`86e8e98614c674d86abb13df38c862cc27d5b46491189d7814d8e70e7734128b` (S213 seal, post-revert)
→ `c0c326f4d739a705ac31c8164d4e0659518319d78b8d2659eb9c6c2412e42a56`

S213 authored this step and an independent assessor rejected it: the widget drew no rectangle
(a fixed-size dashed box containing the string "(−3)(x + 2)") and the step had collapsed to one
click. This session rebuilt the **engine** to the precondition list before touching content:
edges drawn proportionally to the factors (x-segments 44px, unit-segments 18px); real
partial-product cells whose counted needs reproduce `algebraTilesPartials` **by construction**;
and the "Open the rectangle" button **removed entirely** — the rectangle starts empty and the
learner must produce the partials, cells filling 1→2→3→5→7→9 as they do. A learner who drops the
minus sign gets a **completely empty** rectangle (the fill rule requires sign match), which
Fable-QA called "a better idea than the one it replaced". Additive `unopenedFrameFeedback` now
answers a premature submit honestly instead of "check the units".

Only step `i1`'s widget changed (`area`, `partialProductFeedback`, `unopenedFrameFeedback`,
prompt). `predict`, `body`, the three original feedback strings, targets and all ten other steps
byte-identical. Partials of (0x−3)(1x+2) = square 0, x −3, unit −6 — exactly the step's unchanged
graded targets.

**Fable-QA: ACCEPT-WITH-FIXES; both landed.** (a) `partialProductFeedback` claimed "four of its
parts are still empty" when six were, while the progress line an inch away said "3 of 9" —
reworded to assert no count at all, pinned against reintroducing one. (b) **Over-production
announced a wrong expansion as complete** ("9 pieces … together they are −8x − 8"), reachable in
one slider drag. `complete` now means the mat holds *exactly* the rectangle; surplus is reported
honestly ("a rectangle holds exactly its own area — no more"). The implementor **declined the
planner's suggested fix** (hard-refusing surplus at the slider bound) with a correct argument: a
clamp at −3 lets a learner reach the target by dragging to the limit without doing any
mathematics — trading a truth bug for an answer leak. Announcement/verdict agreement is now swept
across the entire slider range.

## 2. `pq-05-03.json` — rhombus certification

`8bfebfc08f011c07b8f80957dbc5fd5ff4bb18b820bfdddcc974a24cd3343d9c`
→ `babfcc1d1367cac402e76dbf6de88b94a1c4763cdd919124f23f09029ece4a16`

Step `i1`'s mcq becomes `coordinateProofLab`. The lesson had **zero manipulable steps** across six
answerable ones. The learner moves D until the diagonals bisect *and* cross at a right angle, then
gathers the evidence that certifies it. D = (5,9) is the **unique** non-degenerate solution
(exhaustive lattice sweep by the assessor), so the exact-position grader is mathematically forced.

The author redesigned away from the candidate sweep's own spec sketch after reading the engine:
`requiredEvidence: ["midpoints","slopes"]` cannot work, because the engine's `slopes` evidence
only ever computes **side** slopes, never diagonal slopes — it could not evidence the very claim
the step makes. `["midpoints","distances"]` used instead (all four sides equal — an equivalent,
in-course-precedented rhombus test). Verified independently.

Geometry, two routes: distance formula gives AB=BC=CD=DA=5, midpoint(A,C)=midpoint(B,D)=(5,5);
synthetic SAS about the bisection point gives the same without coordinates. AC=6, BD=8 → 6≠8, so
"square" over-claims and rhombus is the maximal true certification.

**Fable-QA: ACCEPT-WITH-FIXES; all three landed.** `positionFeedback` printed the target
coordinate ("D is not at (5, 9) yet") — the answer, in the feedback for not having it; rewritten,
and the leak grep now covers every pre-reveal field, zero hits. The framing implied an
undiscovered identity while the widget printed `claim: rhombus` from frame zero — re-worded to
the honest task ("prove the claim is forced"). The deleted mcq's square-vs-rhombus discrimination,
which had ceased to exist anywhere in the lesson, is restored in the predict reveal at theorem
level (deliberately without printing the diagonal lengths, which would let a learner back-solve D).

## 3. `se-01-03.json` — copy caught up with the capability

`f9497d19e6969bd6c34d958944007cf80c25b90dffedb70896dd07c2c68d4cd1`
→ `f8b84802b573836f21aed5cc3112e8516481180ed796f027a5e0a1b65532b3cf`

Step `i1`'s prompt only. The lines became draggable this session; the prompt still said "use the
line controls". It now leads with grabbing the line and demotes the steppers to the exact-value
route — which also keeps it honest for a keyboard learner, who cannot grab anything. Graded task,
predict block, degenerate feedback and all other steps unchanged.

## 4. REFUSED — `vec-03-02/k1`

Not converted; file byte-identical (`d87acfff…71db`). `vectorExplore` dot mode grades
`d === targetDot` and nothing else, so for u=(1,0) and target 1, every lattice v=(1,vy),
vy ∈ [−6,6], grades **correct** while spanning angles 0° to 80.5° — the graded quantity is not the
taught quantity for any nonzero target. Independently verified three ways by the assessor, which
found a fourth reason it did not need: k1 carries a `variant` declaration whose generated items
the conversion would have orphaned. **The finding generalizes to the engine**, not just this
candidate, and is recorded against it.

## 5. Engine ratings — unchanged, deliberately

Fable-QA proposed `systemsExplore` mobile 1 → 2 on measured evidence (hit targets 34.6 → 46.1 CSS
px at a 320px viewport), flagging that it could not find the axis's written definition. **Declined
this session:** no per-level rubric text for the mobile axis exists anywhere in the repo, and a
lift with no rubric is exactly the arbitrary rating change the standing closed-shortcuts list
forbids. The gap is now the recorded blocker: write the mobile axis's 0–3 definitions, then
systemsExplore is the first candidate with measured evidence ready. Note the lift would change no
tier (Σ=18, already grade A), so refusing costs nothing.
