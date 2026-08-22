# S330 LESSON_PROGRESSION_AND_DUPLICATION — Queue Packet G6

Courses: `functions-g8` (fg) and `linear-functions` (lf). Detector: `scripts/audit/consolidate-pending-workload-s236.mjs`
(~lines 358-393) — strips digits from each graded/interactive step's widget `prompt` (replacing runs of digits
with `#`) and flags any step whose resulting normalized template exactly matches another step's normalized
template within the same lesson. Every collision below was independently re-derived from the live detector logic
(not assumed from the queue snapshot) before any decision was made.

For each lesson: the flagged step(s), the sibling step(s) they collide with (same normalized template), the
decision, and — for redesigns — the old vs. new question job with independent math re-verification.

---

## fg-01-02 — Functions from Tables and Pairs

**Flagged:** i2. **Collides with:** k1 (both normalize to `"is this a function? (#, #), (#, #), (#, #)"`).

**Decision: KEPT (legitimate).** k1 tests the repeated-**input** case ((4,1),(5,3),(4,9) — NOT a function); i2
tests the repeated-**output** case ((1,8),(2,8),(3,8) — IS a function). These are the two complementary halves of
the function definition this lesson exists to teach, deliberately phrased with the identical sentence frame so a
student must discriminate by which column repeats rather than by surface wording — a genuine minimal pair, not a
lazy repeat. No edit made.

---

## fg-02-01 — Rate of Change

**Flagged:** k3. **Collides with:** k1 (both normalize to `"as x goes from # to #, y goes from # to #. what is the rate of change?"`).

**Decision: KEPT (legitimate).** k1 is a positive-rate example (rate 4); k3 is a negative-rate example (rate −3,
explanationVariants explicitly flag "the output DROPS"). They are separated by i2 (an interactive matching task)
and k2 (a zero-rate check), so the three checks/interactive together give spaced practice across the full sign
space {positive, zero, negative} of the same skill — ordinary fluency reps at different values, matching this
session's established "check-at-different-values = legitimate" precedent. No edit made.

---

## fg-02-02 — Why a Line's Slope Is Constant

**Flagged:** ch1. **Collides with:** k2 (both normalize to `"find the slope of the line through (#, #) and (#, #)."`).

**Decision: REDESIGNED ch1.**

- **Old question job:** compute the slope from two points, (−1,2) and (3,14) → 3, mechanically identical to k2's
  "find the slope through (2,3) and (5,12)" — the only nominal difference was one negative coordinate. Its own
  `commonErrors` ("gave rise only" / "gave run only") were the *same two generic traps* as k2's, so the claimed
  negative-coordinate escalation was never actually exercised by the wrong-answer detection — a cosmetic bump in
  a challenge-tier slot, not a real one.
- **New question job:** using the same two points, now (−2, 1) and (2, 9) (negative-coordinate framing kept),
  find a **third** point's y-value by applying the lesson's own constant-slope property — an extend/predict
  action instead of a bare "compute the slope" repeat, and a direct application of this lesson's throughline
  concept (any two points on the line give the same slope).
- **Math re-verification (independent, via node):** slope = (9−1)/(2−(−2)) = 8/4 = **2**. From (2,9), x=5 is 3
  more across: y = 9 + 2×3 = **15**. Cross-checked against the line equation y=2x+5 (fits all of (−2,1), (2,9),
  and (5,15)). Traps: 6 (only the added rise, forgot to add to the known y) and 3 (9−6, subtracted instead of
  added) — both confirmed ≠ 15, both plausible.
- **Generator/variant handling:** removed the `variant: {gen: "g8-fn-constant-slope", form: "fgSlopeSigned"}`
  tag and hand-authored a static widget instead (per the strongly-preferred option). That form only ever
  regenerates a bare two-point "find the slope" prompt on replay and could never reproduce the new
  predict-a-point shape, so keeping the tag would have silently reverted the fix on the next generated instance.
  No new generator form was added.
- **Verification run:** `node -e "JSON.parse(...)"` valid; `npx vitest run src/lib/session272.functionsG8FigureWithholding.test.ts`
  (1/1 passed — only touches fg-02-02's c1/c2, untouched by this edit); live re-run of the detector's own
  normalization on the edited file shows `repeatedTemplates: []` for this lesson.

---

## fg-03-02 — Comparing Rates of Change

**Flagged:** k1. **Collides with:** i1 (both normalize to `"function a is y = #x. function b is the table (#,#), (#,#), (#,#). which grows faster?"`).

**Decision: KEPT (legitimate).** i1 (interactive) teaches the equation-vs-table comparison method; c2 formalizes
it; k1 (check) immediately re-drills the identical skill with new numbers — the textbook "check right after a
concept/interactive teaches it" pattern this packet's instructions call out as normal instructional design. Note
it is even better-designed than the minimum bar: i1's answer is B (rate 3 > 2) while k1's answer is A (rate 5 > 4)
— the winner deliberately flips, so a student can't pattern-match the prior answer. No edit made.

---

## fg-04-01 — Linear vs. Nonlinear

**Flagged:** i2, k2. **Collide with:** k1 (all three normalize to `"a table gives outputs #, #, #, # for inputs #, #, #, #. linear or nonlinear?"`).

**Decision: SPLIT — k2 KEPT, i2 REDESIGNED.**

- **k2 (KEPT, legitimate):** k1 (squares, 0,1,4,9) and the original i2 (doubling, 2,4,8,16) both tested the
  **nonlinear** verdict. k2 is the *only* step in this lesson testing the **linear** verdict, and it does so with
  a decreasing table (10,8,6,4 — differences all −2), directly targeting the real, named misconception "a
  decreasing table must be nonlinear" (one of its own MCQ distractors says exactly this). A genuine minimal pair
  against the nonlinear examples, not a repeat. No edit made.
- **i2 (REDESIGNED):** the original doubling example (2,4,8,16) required the *exact same* computation as k1's
  squares example (compute consecutive differences, notice they're unequal) and reached the *same* verdict
  (nonlinear) — no new skill or misconception versus k1, a genuinely redundant repeat.
  - **Old question job:** "A table gives outputs 2, 4, 8, 16 for inputs 1, 2, 3, 4. Linear or nonlinear?" → nonlinear.
  - **New question job:** "A table lists the pairs (0, 0), (1, 2), (3, 6), (4, 8). Linear or nonlinear?" — a table
    with **uneven input spacing** that is actually LINEAR, but whose raw output jumps (2, 4, 2) look unequal to a
    student who doesn't divide by the corresponding input step. This transfers the "reduce to the change for ONE
    input step" rule this course already taught explicitly in the prerequisite lesson fg-02-01 (c2), and changes
    the representation from two parallel lists (which invites eyeballing just the output list) to explicit
    (input, output) pairs.
  - **Math re-verification (independent, via node):** consecutive rates (2−0)/(1−0)=2, (6−2)/(3−1)=2,
    (8−6)/(4−3)=2 — constant at 2, confirming **linear**. Distractors: "outputs jump 2, 4, 2" (raw-jump trap,
    wrong), "inputs skip from 1 to 3" (uneven-spacing-implies-nonlinear trap, wrong), "can't tell" (wrong, there
    is enough information) — all clearly distinct from the correct "linear, rate 2 throughout" answer.
  - **Generator/variant handling:** i2 carried no `variant` field before or after this edit — no generator/replay
    risk, nothing to reconcile.
  - **Verification run:** `node -e "JSON.parse(...)"` valid; independent node check of the four consecutive-pair
    rates (all =2, see above); live re-run of the detector's normalization shows i2 no longer appears in
    `repeatedTemplates` for this lesson (only k2 remains, which is the expected, reviewed KEEP).

---

## lf-01-03 — Positive, Negative, Zero & Undefined

**Flagged:** k2. **Collides with:** k1 (both normalize to `"build the triangle for the line through a (#, #) and b (#, #)."`).

**Decision: KEPT (legitimate).** k1 is a falling/negative-slope example (right after i1's sign-identification
MCQ); k2 is a rising/positive-slope example (right after i2/c2's horizontal-line detour) — k2's own body text is
literally "Rising again — with the formula," explicitly signaling the deliberate callback/contrast against k1's
falling case. The two are interleaved with the horizontal (i2/c2) and vertical (i3/c3) special cases in between,
so this is spaced retrieval of the sign concept across the whole lesson, not a back-to-back lazy repeat. No edit made.

---

## lf-03-01 — Point-Slope Form

**Flagged:** k3, ch1. **Collide with:** i2 (all three normalize to `"build the point-slope equation for the line through (#, #) with slope #."`).

**Decision: KEPT (both, legitimate).** A clean three-tier escalating-negative-sign ladder:
- i2 (interactive, baseline): point (2,5), slope 3 — zero negatives; teaches the "assemble the equation" action.
- k3 (check): point (5,−1), slope 2 — one negative, in the **y**-coordinate, directly following c3's "a plus
  sign inside hides a negative coordinate" teaching.
- ch1 (challenge, body explicitly "Two negatives to handle"): point (−3,4), slope −2 — negatives in **both** the
  **x**-coordinate and the slope simultaneously.

Each tier's `commonBuilds` wrong-answer traps are specifically tailored to the *new* sign slot introduced at that
tier (k3 catches the y-slot sign error only; ch1 catches the x-slot sign error and the slope-sign error as two
independent traps) — a deliberately instrumented complexity ramp, not a copy-pasted repeat. No edit made.

---

## lf-03-02 — Point-Slope to Slope-Intercept

**Flagged:** ch1. **Collides with:** k3 (both normalize to `"convert y − # = #(x − #) to slope-intercept form. what is b?"`).

**Decision: KEPT (legitimate).** k3 converts y−1=4(x−2) (all-positive inputs, b=−7) — a baseline case. ch1
(body explicitly "Negative slope, full convert") converts y−2=−3(x−1), introducing a **negative slope**, which
forces the qualitatively different "subtract a negative slope-times-x term" maneuver. ch1's `numericErrors`
(−1, −5) are specifically built around that double-negative mistake and are *not* shared with k3's traps (1, 9 —
generic "forgot to finish" / "added instead of subtracted"). This is a real, instrumented escalation — unlike
fg-02-02's ch1 above, where the equivalent "negative coordinate" bump was never actually exercised by the
wrong-answer detection. No edit made.

---

## lf-04-01 — Line from a Point and a Slope

**Flagged:** k2, ch1. **Collide with:** i2 (all three normalize to `"a line passes through (#, #) with slope #. what is b?"`).

**Decision: KEPT (both, legitimate).** Another clean three-tier ladder:
- i2 (interactive, baseline escalation): point (3,4), slope −1 — negative **slope** only.
- k2 (check, body explicitly "A negative x this time"): point (−1,2), slope 3 — negative **x-coordinate** only
  (a different slot than i2).
- ch1 (challenge, body explicitly "Two negatives to manage"): point (−2,2), slope −3 — both combined.

ch1's trap (value 8) specifically targets the "two negatives multiply to a positive" rule — a genuinely new,
harder rule that is exercised nowhere else in the lesson (neither i2 nor k2 alone requires multiplying two
negative numbers together). No edit made.

---

## lf-04-02 — Line Through Two Points

**Flagged:** ch1. **Collides with:** k1 (both normalize to `"the line through (#, #) and (#, #) has slope #. find b."`).

**Decision: KEPT (legitimate).** k1 converts using (1,2) and (3,8), slope 3 — all-positive coordinates, a
baseline case. ch1 (body explicitly "Negatives in a point") uses (−2,1) and (1,7), slope 2, introducing a
**negative x-coordinate** into one of the two given points, which requires the qualitatively different
"subtracting a negative" maneuver. ch1's trap (value −3, "computed 1 + 2·(−2) = −3") is specifically built around
that sign case and is distinct from k1's structurally-similar-looking but sign-free trap (value 5, "added instead
of subtracted" with no negative numbers involved). No edit made.

---

## Summary

| Lesson | Flagged | Decision | Redesigned step(s) |
|---|---|---|---|
| fg-01-02 | i2 | KEPT | — |
| fg-02-01 | k3 | KEPT | — |
| fg-02-02 | ch1 | **REDESIGNED** | ch1 |
| fg-03-02 | k1 | KEPT | — |
| fg-04-01 | i2, k2 | SPLIT | i2 redesigned, k2 kept |
| lf-01-03 | k2 | KEPT | — |
| lf-03-01 | k3, ch1 | KEPT | — |
| lf-03-02 | ch1 | KEPT | — |
| lf-04-01 | k2, ch1 | KEPT | — |
| lf-04-02 | ch1 | KEPT | — |

8 of 10 lessons are pure KEEPs. Across the `linear-functions` chapters 3-4 lessons in particular (lf-03-01,
lf-03-02, lf-04-01, lf-04-02), the course consistently uses a deliberate escalating-negative-number ladder
(zero negatives → one negative in a specific slot → two negatives combined), each tier instrumented with
wrong-answer traps tailored to the specific new sign case — genuine, verified pedagogical design, not
accidental duplication. The distinguishing test applied throughout this packet was **not** "did the numbers
change" but "does the later/harder step's own wrong-answer detection actually exercise a mechanically new
error mode" — where the answer was no (fg-02-02's original ch1, fg-04-01's original i2), the step was
redesigned; where the answer was yes, it was kept. These KEPT rows are expected to remain open in the
detector's queue (per this workstream's by-design lack of a disposition-based suppression) — they are honestly
reviewed, not silently closed.

Two lessons were edited: **fg-02-02** (ch1 redesigned; stale `variant` tag removed, no new generator form
added) and **fg-04-01** (i2 redesigned; carried no `variant` tag to begin with). No shared generator file
(`src/lib/variants.ts`) was modified by this packet.

**Unrelated pre-existing failure noted during verification (out of scope, not touched):** running
`npx vitest run src/lib/variants.resolver.test.ts -t "item-level variant declarations|variant resolver"` surfaced
2 failures against `mmt-05-02.json/k3` (`measure-money-time` course, generator `g2-measure-money-time`) — a
lesson and course entirely outside this packet's assignment (fg/lf only) and not modified by this session's
working tree at the time of this check. Flagging for the orchestrator; not remediated here.
