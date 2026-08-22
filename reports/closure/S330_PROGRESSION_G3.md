# S330 LESSON_PROGRESSION_AND_DUPLICATION — Packet G3 (proportional-relationships)

Queue source: `scripts/audit/consolidate-pending-workload-s236.mjs` (~lines 358–393). The detector
strips digits from every graded/interactive step's `widget.prompt` (replacing runs of digits with
`#`), lowercases, collapses whitespace, and flags any step whose resulting template exactly matches
another step's template within the same lesson. It is purely structural — no disposition note can
suppress it; a row leaves the queue only when the flagged step's actual wording changes enough that
it stops colliding. All nine assigned lessons were read in full; every collision was reproduced by
hand against the detector's own normalization logic (and re-confirmed by running that exact logic as
a script) before any decision was made.

Two dispositions were used:
- **KEPT (fluency-legitimate)** — the repeat is defensible instructional design (immediate
  teach→drill retrieval, a distinct misconception/representation/role even though the surface
  wording matches, or a textually-signalled deliberate revisit). Not edited. The row stays open in
  the queue (expected — the detector cannot be suppressed by disposition) but has been honestly
  reviewed.
- **REDESIGNED** — the repeat was structurally identical with no differentiator (same trap set, no
  adjacent teaching, no signal of intent) — accidental "same job, different numbers." One step
  (preferring the later one) was rewritten with a genuinely different action, representation,
  misconception, or transfer demand, and its wording changed enough to leave the queue.

---

## pr-02-01 — Testing a Table

Flagged: `k1, i2, i3, k2, k3`. All six widget-bearing steps in this lesson (`i1` canonical + the five
flagged) share one template: `"a table has pairs (#, #), (#, #), (#, #). is this proportional?"`

- **k1** vs `i1` — **KEPT**. Immediate check right after `i1` teaches the whole-number positive test
  (k=3 → k=4); the textbook teach→drill pattern.
- **i2** vs `i1` — **KEPT**. Immediate practice right after `c2` introduces the NOT-proportional idea
  — the opposite direction from `i1`, freshly taught.
- **i3** vs `i1`/`i2` — **KEPT**. Distinct misconception: distractor "b" ("Yes, the first and last
  match") directly operationalizes `c3`'s just-taught warning against skipping the middle row, which
  neither `i2`'s nor any other sibling's distractors test.
- **k2** vs `i1` — **KEPT**. Distinct misconception: "the ratio isn't a whole number" (fractional
  constant of proportionality), not tested by any other step in this collision group.
- **k3** vs `i1`/`i2`/`i3` — **REDESIGNED**. This was the genuine accident: a third undifferentiated
  "not proportional, broken middle ratio" instance (after `i2` and `i3`), reusing the same two trap
  *types* ("most ratios match" / "pattern looks close") with no adjacent teaching and no new
  misconception.
  - *Old job*: MCQ "Is this proportional?" on (4,12),(5,16),(8,24) — a broken-ratio classification.
  - *New job*: same widget family (`proportionalReasoningLab`), switched `task` from
    `testProportional` to the already-existing `steadyAssumption` task (also used in
    `rr-03-03.json` elsewhere in this app) and reframed as a real-world reliability judgment: "A
    vending machine is supposed to charge a steady $3 per snack... Does the steady-rate assumption
    hold?" — same numbers, but the action shifts from bare classification to evaluating a stated
    assumption.
  - *Math re-verification* (node): 12/4=3, 16/5=3.2, 24/8=3 → not constant, so
    `answerClaim="assumption:failed"`, matching choice "a"; distractors "most fit $3" and "all close
    to $3" are wrong-but-plausible and never equal the correct answer.
  - The step's `variant` field (`pr-test-proportional-g7` / `nonProportional`) was deleted rather than
    repointed, since no existing form produces a `steadyAssumption`-shaped widget — a hand-authored
    static widget avoids touching the shared generator file.

## pr-02-02 — Finding the Constant of Proportionality

Flagged: `i2, k2, k3`. Two collision groups: Group A (`k1` canonical + `i2` + `k2`, "table has
pairs... what is the constant of proportionality?"); Group B (`i3` canonical + `k3`, "proportional
table has constant of proportionality #. When x = #, what is y?").

- **i2** vs `k1` — **KEPT**. Different widget mechanics (plain `mcq`, no exploration gate) testing a
  new nuance (fractional constant, k=3/4) immediately after `c2` introduces it; distinct
  misconception (x/y-flip, "4/3") not tested by `k1`.
- **k2** vs `k1` — **KEPT**. Spaced/interleaved retrieval of the fractional-constant skill `i2` just
  introduced, now via the full interactive lab widget (forces exploring all 3 pairs) instead of a
  static MCQ, and adds a further new misconception ("the constant is 1" / assumes x=y) that neither
  `i2` nor `k1` tests.
- **k3** vs `i3` — **KEPT**. The canonical "check immediately follows the interactive that just
  demonstrated the same skill" pattern named in this packet's own brief as automatically legitimate:
  `i3` uses `c3`'s worked numbers (k=3, x=10, y=30); `k3` checks with fresh numbers (k=4, x=5) on the
  upgraded full lab widget.

No redesign — every flagged step in this lesson has a concrete differentiator.

## pr-02-03 — Tables in Real Situations

Flagged: `i2, k2`.

- **i2** vs `i1` — **KEPT**. Immediate practice right after its own dedicated concept `c2` ("not
  every real table is proportional — a flat fee breaks the pattern"), testing the NOT-proportional
  direction that `i1` (positive-only) never covered.
- **k2** vs `k1` — **KEPT**. This lesson is an explicit review/application lesson recombining three
  previously-taught skills (its own recap: "you've completed unit rates with fractions and testing
  tables"); `k1` (whole-number constant) then `k2` (fractional constant, k=3/7) follows the same
  whole-number-then-fraction progression convention used repeatedly across this course
  (pr-02-01, pr-02-02).

No redesign.

## pr-03-01 — Plotting a Proportional Relationship

Flagged: `k1, i3, k2, ch1`. Three collision groups: Group 1 (`i1` canonical + `k1`, 3-point "For k =
#, plot the points ..., ..., and ..."); Group 2 (`i2` canonical + `i3` + `k2`, 2-point "For k = #,
plot the points (#,#) and (#,#)"); Group 3 (`k3` canonical + `ch1`, "For a rate of #, plot the points
(#,#) and (#,#)").

- **k1** vs `i1` — **KEPT**. Immediate check right after `i1`'s teach, fresh k value (1 vs 2).
- **i3** vs `i2` — **REDESIGNED**. This was a bare renumbering of `i2` — identical action, identical
  single x/y-swap trap, k=3→k=4 with no other change — even though it sits right after `c3`, which
  specifically teaches that the origin is still on the line even though this grid starts counting at
  1. Nothing in the original widget engaged with that idea at all.
  - *Old job*: plot (1,4) and (2,8) for k=4; one swap trap.
  - *New job*: same target points, but the prompt now names the origin/off-grid idea directly ("the
    origin still counts even though this grid starts at 1"), and a second `pointError` trap was added
    at (1,1) — catching the specific, plausible misconception of mistaking the grid's labeled corner
    for the true mathematical origin (0,0), which is exactly what `c3` warns against.
  - *Verification*: targets unchanged and still consistent with k=4 (1×4=4, 2×4=8); the new trap
    coordinate (1,1) is inside the 8×8 grid and distinct from both real targets, so it is a genuinely
    reachable click — confirmed by the repo's own solvability gate
    (`content.widgets.audit.test.ts`), which found zero dead-path issues anywhere in this lesson.
- **k2** vs `i2` — **KEPT**. Body text explicitly says "Plot the line for k = 2 **again**" — a
  deliberate return to the first taught slope (k=2, from Group 1) using fresh, non-overlapping points
  (2,4)/(3,6). This operationalizes `c2`'s specific point ("any two points that fit y=kx will connect
  into a line") by testing whether the student's understanding survives a change of which two points
  are given, rather than rote memory of the original three.
- **ch1** vs `k3` — **KEPT**. Adds a second, new misconception trap not present in `k3` — assuming a
  45°/rate=1 line — and is explicitly framed as the harder "trickier" challenge, appropriate to its
  `challenge` role and its rate (2/3, below 1) vs `k3`'s (1.5, above 1).

## pr-03-02 — The Point That Shows the Unit Rate

Flagged: `k1, i3, k2, k3`. Two collision groups: Group A (`i1` canonical + `k1` + `k2`, "A line has
unit rate of #. Plot the point..."); Group B (`i2` canonical + `i3` + `k3`, "The graphed point (#,#)
represents a proportional relationship. What is the unit rate?").

- **k1** vs `i1` — **KEPT**. Immediate check after `i1`'s teach.
- **i3** vs `i2` — **KEPT**. The canonical pattern: `i2` tests the x=1 special case; `i3`, right
  after `c3` explicitly generalizes "for any OTHER point, the rate is still y/x," tests the harder
  general case (point (4,20), x≠1).
- **k2** vs `i1` — **KEPT**. Deliberate ABAB interleaving: after the "read from a point" thread
  (`c2`/`i2`, `c3`/`i3`) is introduced, `k2` returns to check the earlier "plot for a given rate"
  skill. `k2` and `k1` share `conceptTag: "pr-unit-rate-point"` (while `i2`/`i3` carry none) —
  confirming this is a deliberately tracked, spaced-retrieval pairing in the mastery system, matching
  the recap's explicit "this works whether you're plotting or reading" framing.
- **k3** vs `i2` — **KEPT**. The *first* tracked check (`conceptTag: "pr-read-rate-point"`, shared
  only with `ch1`) for the generalized "read any point" skill `i3` just introduced — not itself a
  repeat of an earlier check.

No redesign — this was the cleanest-designed lesson in the packet: a deliberate two-skill,
interleaved-retrieval structure with conceptTags that independently confirm the intent.

## pr-03b-01 — Writing the Equation y = kx

Flagged: `i2`.

- **i2** vs `i1` (canonical "table has pairs... what is the constant of proportionality?") —
  **KEPT**. Body text explicitly says "Find the constant from a **steeper** relationship" (k=7 vs
  k=5) — a textual signal of deliberate escalation — and its trap set adds a genuinely new
  misconception, "18 is 21−3, a difference" (additive-instead-of-multiplicative confusion, a
  misconception this course names explicitly elsewhere in its own `cml` blocks), which `i1`'s traps
  ("picked the raw x-value," "multiplied instead of divided") do not cover. The two steps also serve
  different structural roles: `i1` warms up immediately before the plain equation-writing check
  (`k1`); `i2` warms up immediately before the graph-based equation check (`k3`), directly
  supporting `c2`'s "the constant is the same wherever you look" point.

No redesign.

## pr-04-01 — Tax and Tip

Flagged: `k2, k3`. This lesson otherwise repeats the "add a percent to a price" job across many
numbers deliberately (a fluency lesson) — the detector only caught the two pairs that reused the
exact same noun+percent-type combination verbatim.

- **k2** vs `i3` (canonical "A jacket costs $#. With #% tax, what is the total?") —
  **REDESIGNED**. `k2` reused "jacket" + "tax" with the identical two trap types as `i3`
  ("treat % as cents," "forgot to add back the price") and no adjacent teaching or new angle — a
  genuine accident (the numbers even went back down from `i3`'s "bigger" framing).
  - *Old job*: compute one total ($80 jacket, 5% tax → $84).
  - *New job*: compare-two-totals MCQ — "Which costs more after tax: an $80 jacket with 5% tax, or a
    $76 jacket with 10% tax?" — changes the action from single computation to comparison, and targets
    a specific, valuable misconception: assuming the higher tax *rate* automatically means the higher
    *total*, ignoring the base price.
  - *Math re-verification* (node): 80×1.05 = 84.00; 76×1.10 = 83.60; 84.00 > 83.60 by $0.40, so "the
    $80 jacket at 5% tax" is correct. Both distractors ("the $76 jacket," "they're equal") are
    wrong-but-plausible and independently confirmed not to equal the correct choice.
- **k3** vs `k1` (canonical "A meal costs $#. With #% tip, what is the total?") —
  **REDESIGNED**. `k3` reused "meal" + "tip" with `k1`'s identical two trap types, no adjacent
  teaching, no signal of intent.
  - *Old job*: compute one total ($10 meal, 25% tip → $12.50).
  - *New job*: catch-the-mistake MCQ — "Deja computes a 25% tip by adding 10 + 0.25 to get $10.25.
    What is the CORRECT total?" — the action shifts from independent computation to error analysis,
    while both of the original misconceptions survive as answer options (the wrong "$10.25" *is* the
    percent-as-cents trap; "$2.50" is the forgot-to-add-back trap).
  - *Math re-verification* (node): 10×0.25 = 2.50; 10+2.50 = 12.50 (correct, option "b"); Deja's
    $10.25 (option "a") and the bare tip $2.50 (option "c") are confirmed wrong.
  - Both steps' `variant` fields (`pr-add-percent-g7` / `percentTax` and `percentTip`) were deleted
    rather than repointed — neither existing form produces an `mcq`-shaped widget, and a
    hand-authored static widget avoids touching the shared generator file.

## pr-04-03 — Percent Increase and Decrease

Flagged: `i3, k2, k3`. Two collision groups: Group 1 (`k1` canonical + `k3`, "price rises from # to
#"); Group 2 (`i2` canonical + `i3` + `k2`, "price falls from # to #").

- **i3** vs `i2` — **KEPT**. Immediate practice right after `c3` ("always use the ORIGINAL, never the
  new — watch the base carefully"); its second trap specifically divides by the NEW value (8 instead
  of 10), a misconception `i2` does not test.
- **k2** vs `i2` — **REDESIGNED**. The third undifferentiated "percent decrease" instance (after
  `i2` and `i3`), reusing `i2`'s exact two trap *types* (missing the negative sign; raw change
  instead of a percent) with no adjacent teaching and no new misconception — unlike `i3`, which had
  already earned its own collision fairly by adding the "divide by new" trap.
  - *Old job*: compute one percent change (40→30 → −25%).
  - *New job*: compare-two-percent-drops MCQ — "A $10 price drops to $8. A $100 price drops to $80.
    Which is the bigger PERCENT decrease?" — targets the classic absolute-vs-relative-change
    misconception (a $20 drop looks bigger than a $2 drop, but the percent is identical).
  - *Math re-verification* (node): (8−10)/10×100 = −20; (80−100)/100×100 = −20 — confirmed exactly
    equal. Correct choice is "they're the same"; both single-row distractors are wrong-but-plausible.
  - `variant` field (`pr-percent-change-g7` / `percentDecrease`) deleted for the same reason as above.
- **k3** vs `k1` — **KEPT**. Its second trap divides by the NEW value (60 instead of 50) — the same
  "watch the base" misconception `i3` introduced for the decrease direction, now cross-checked on the
  increase direction, which `k1` itself does not test.

*(Aside, not acted on: `k3`'s body text calls it "A bigger percent increase," but its actual percent
(20%, from 50→60) is smaller than `k1`'s (25%, from 80→100) — likely a pre-existing copy/labeling
slip unrelated to the duplication defect. `k3` was a KEEP, not a redesign, so it was left untouched
per this packet's scope.)*

## pr-04b-01 — Simple Interest

Flagged: `i2`.

- **i2** vs `i1` (canonical "A $# loan charges #% interest per year. Shade one year's interest.") —
  **KEPT**. Body text explicitly reads "A different rate, same structure" — a direct, deliberate
  demonstration of `c2`'s point that the simple-interest *mechanism* is invariant across different
  rates/principals — using new numbers ($1,200/10% vs $500/4%). Its `successFeedback` extends the
  "equal steps" idea with concrete multi-year arithmetic (4 × $120 = $480), which `i1` does not do.

No redesign.

---

## Summary

| Lesson | Flagged | Redesigned | Kept (fluency-legitimate) |
|---|---|---|---|
| pr-02-01 | k1, i2, i3, k2, k3 | k3 | k1, i2, i3, k2 |
| pr-02-02 | i2, k2, k3 | — | i2, k2, k3 |
| pr-02-03 | i2, k2 | — | i2, k2 |
| pr-03-01 | k1, i3, k2, ch1 | i3 | k1, k2, ch1 |
| pr-03-02 | k1, i3, k2, k3 | — | k1, i3, k2, k3 |
| pr-03b-01 | i2 | — | i2 |
| pr-04-01 | k2, k3 | k2, k3 | — |
| pr-04-03 | i3, k2, k3 | k2 | i3, k3 |
| pr-04b-01 | i2 | — | i2 |

Four lessons edited (`pr-02-01`, `pr-03-01`, `pr-04-01`, `pr-04-03`); five lessons reviewed and left
untouched as fully defensible KEEPs (`pr-02-02`, `pr-02-03`, `pr-03-02`, `pr-03b-01`, `pr-04b-01`).
No new generator forms were added to any shared file; every touched step that carried a `variant`
field had it deleted in favor of a hand-authored static widget (per this packet's guidance, to avoid
collisions with other concurrently-running packets touching `src/lib/variants.ts`).

## Verification performed

- **JSON validity**: `node -e "JSON.parse(...)"` on all four edited files — pass.
- **Live re-run of the exact S236 detector logic** (normalized-template collision), scripted
  independently and run against all nine lessons post-edit: every redesigned step id no longer
  appears in its lesson's flagged list; every KEPT step id remains (expectedly, since the detector is
  disposition-blind) flagged.
- **`Lesson.parse` (full Zod schema) + `lintLesson` (pedagogy linter)**, run directly against all four
  edited files via a standalone script: zero schema errors, zero lint findings.
- **`src/lib/content.widgets.audit.test.ts`** (whole-corpus SOLVABLE / NOT-PRE-SOLVED / NO-DEAD-PATHS
  gate, driven through the real grader): ran clean for every widget in all four touched lessons
  (including the new `steadyAssumption` task and the new `pointError` trap). Two failures elsewhere
  in the corpus (`g4x-02-01`, `sy-01-01`) are in unrelated courses/widget types, outside this
  packet's scope, and reproduced identically on a second run.
- **`src/lib/session144.proportional-reasoning.test.ts`**: independently parses and validates every
  `proportionalReasoningLab` widget in `pr-02-01.json` (including the redesigned `k3`) —
  the relevant "38 converted authored surfaces" assertion passed. One unrelated failure in the same
  file is a self-contained synthetic-fixture assertion that never reads lesson content, and is
  reproducible with zero content edits at all — pre-existing and out of scope.
- **`src/lib/session290.proportionalRelationshipsFigureChoice.test.ts`**: 3/3 pass (whole-course
  figure/choice structural check).
- **`src/lib/session261.vis03SingletonClosureB.test.ts`**: 11/11 pass.
- **`src/lib/variants.resolver.test.ts -t "item-level variant declarations"`**: re-scans every
  step-level `variant` field on disk fresh; 2/4 pass, 2 unrelated pre-existing failures in
  `mmt-05-02.json` (a different course). Confirms the four `variant`-field deletions in this packet
  introduced no dangling/broken references.
- **All arithmetic independently recomputed via `node`** (ratios, totals, percent changes) rather
  than trusted by inspection — see the per-lesson math notes above.

## Note on environment

This is a shared checkout with other packets editing lesson content concurrently. Two of this
packet's edits (`pr-02-01` `k3`, `pr-04-01` `k2`) were transiently overwritten mid-session by a
concurrent write and had to be reapplied. Final state was re-confirmed stable — file content, the
detector re-run, and the `print-review-basis.mjs` hashes all matched — across multiple repeated
checks a few seconds apart before this report and the disposition ledger were written.
