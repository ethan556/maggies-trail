# SESSION 214 EXECUTION REPORT — the rejected step comes back with a real rectangle, the lines become grabbable, and a refusal generalizes into an engine finding

Second session under the Causal Mastery Interaction Program. Two sequential widgets.tsx windows,
one parallel content track, one fresh independent Fable-QA, one serialized gate chain.
`HANDOVER_S214.md` §1 items 1–3 all executed; item 4 (engine gaps) deliberately not started.

## 1. The headline

**Three lessons gained their first causal interaction, and the one that failed last session
passed this one by having its engine rebuilt first rather than its content re-argued.**

The S213 rejection said the algebraTiles rectangle did not exist. This session built it: edges
drawn proportionally to the factors, real partial-product cells whose counted needs reproduce
`algebraTilesPartials` *by construction rather than by calling it*, and — the change that matters
most — **the "Open the rectangle" button was deleted**. The learner now produces the partials and
watches cells fill 1→2→3→5→7→9. Drop the minus sign and the rectangle stays **completely empty**,
which the assessor called a better idea than the one it replaced. Only then was the lesson
re-authored.

**And the loop caught two more surface-lies before they shipped** — the same defect class as both
S213 rejections: a feedback string asserting "four of its parts are still empty" when six were
(while the widget's own progress line said "3 of 9" an inch away), and an over-production path,
reachable in **one slider drag**, that announced "9 pieces … together they are −8x − 8" as
complete. Both fixed; announcement/verdict agreement is now swept across the entire slider range.

Notably, the implementor **declined the planner's suggested fix** for the second one and was
right to: hard-refusing surplus at the slider bound would let a learner reach the target by
dragging to the limit without doing any mathematics — trading a truth bug for an answer leak. It
made `complete` mean *exactly* the rectangle instead.

## 2. What landed

**Draggable lines (the top priority).** `systemsExplore`'s lines are now grabbed, not stepped:
a slide grip (`dragPoint` handle `intercept`, holds the rate) and a tilt grip (handle `unit`,
holds the start, placed at x=1 matching `lineExplore`). No drag-specific mathematics anywhere —
everything routes through absorb paths under test since S208, so the authored range still bounds a
drag exactly as it bounds a stepper. Steppers and ranges retained as the precision/keyboard route.
Hit targets measured 34.6 → 46.1 CSS px at a 320px viewport, closing a pre-existing sub-44px
defect. The implementor caught and corrected its own first grip placement using arithmetic (a
far-edge tilt grip put almost every reachable slope off-plot). **Fable-QA ACCEPT (8.1), and it
re-scored the shipping `se-01-03` lesson end-to-end from 7.9 to 8.4, stating the interaction
ceiling it named last session is gone.**

**Two new causal interactions.** `pq-05-03/i1` — a lesson with zero manipulable steps across six
answerable ones — becomes a rhombus certification the learner constructs; D=(5,9) is the unique
non-degenerate solution, so the exact-position grader is mathematically forced. `tse-01-01/i1`
becomes the first authored user of area mode. `se-01-03`'s prompt caught up with the capability
its own lesson now ships.

**A refusal that became an engine finding.** `vec-03-02/k1` was refused: `vectorExplore` dot mode
grades `d === targetDot` and nothing else, so for u=(1,0) and target 1 every lattice v=(1,vy)
grades correct across angles 0°–80.5° — the graded quantity is not the taught quantity for any
nonzero target. Verified three ways by the assessor, which found a fourth reason it did not need.
**This is recorded against the engine, not just the candidate**: the constraint holds for every
(u, nonzero target) pair in schema range.

## 3. Fable-QA (fresh, independent)

Per item: (A) area step 6.9 ACCEPT-WITH-FIXES · (B) rhombus 6.9 ACCEPT-WITH-FIXES · (C) draggable
lines 8.1 ACCEPT. All required fixes landed before seal. It verified every technical claim by
diffing against the S213 seal and by *driving the model* rather than reading the implementors'
prose — including confirming the six touched test files are narrowings, not relaxations, and that
no red pin was left behind (S213 had one). Full report: `SESSION214_FABLE_QA.md`.

**A rating lift was proposed and declined.** Fable-QA recommended `systemsExplore` mobile 1 → 2 on
its own measured evidence, flagging that it could not find the axis's written definition. There
isn't one — no per-level rubric text for the mobile axis exists in the repo. A lift with no rubric
is precisely the arbitrary rating change the standing closed-shortcuts list forbids, so the axis
definition becomes the recorded blocker instead. The lift would have changed no tier (Σ=18,
already grade A), so refusing cost nothing — which is the right condition under which to hold a
line.

## 4. Validation

typecheck 0 · vitest **315 files / 12,585 tests, 0 failures** · validate:content 1,840/1,840 ·
lint:pedagogy 1,711/1,711 · registrations clean · **content-change proof 812/812** · **hash proof
1,701/1,701** · build 0 · Playwright **115/115** (Trap-D protocol) · fresh-extraction reprove at
seal.

## 5. Metrics (program §17)

| metric | value |
|---|---|
| **Lessons gaining their FIRST causal interaction** | **2** (`tse-01-01`, `pq-05-03`) |
| Lessons whose existing causal interaction was materially improved | 1 (`se-01-03`: 7.9 → 8.4) |
| Rich-interaction share (HS) | 23.8% → 23.8% (863 → 864 / 3,626) |
| Refusals | 1 candidate refused (with an engine-level generalization) |
| Rating changes | **0** — one proposed, declined for want of a rubric |
| Accessibility defects fixed | 1 measured (sub-44px targets, 34.6 → 46.1 px) |
| Truth defects caught pre-ship | 3 (two false-of-state strings; one over-production announcement) |
| New engines | 0 |

## 6. The pattern worth naming

Every defect this program has caught across S213–S214 — two rejections and three required-fix
rounds — is **one class: a surface asserting something false of its own state.** A dashed box
claiming to be a rectangle; a readout saying `0x + 0` over a mat worth −3x−6; "four parts empty"
when six were; "together they are −8x − 8" for a build that isn't the target; "D is not at (5,9)"
printing the answer. The implementor's own closing note is the right remedy and is now house
guidance: *every authored or generated string needs a test that renders the state which triggers
it and checks the claim* — not merely that the string appears.

## 7. Next

1. **Label each line with its equation** in systemsExplore — the REPRESENTATIONS docking Fable-QA
   kept (it was never about the controls: the lines are unlabelled and the surface speaks
   "rate/start" while the lesson thinks in equations).
2. **Write the mobile axis's 0–3 definitions**, then re-adjudicate systemsExplore with the
   measured evidence already in hand.
3. **x²-tile control** for algebraTiles — until it exists, distribute authoring is limited to the
   `a(x+b)` shape and factor mode remains a display rather than a production task.
4. **Then the confirmed engine gaps (§13)** — with both rich buckets saturated (~11–13% adjudication
   pass rate across three sweeps), new engines are the only route that manufactures new candidates.
