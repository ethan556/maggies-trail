# S330 Fix Packet G11 — LESSON_PROGRESSION_AND_DUPLICATION (7 lessons, 7 courses)

Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `PROGRESSION-<lessonId>` under workstream
`LESSON_PROGRESSION_AND_DUPLICATION` for exactly the 7 lessons assigned this packet: `g4p-01-01`,
`les-01-01`, `pp-04-02`, `se-03-03`, `tf-02-02`, `tg-05-01`, `tse-01-02`.

**Method.** The detector (`scripts/audit/consolidate-pending-workload-s236.mjs` lines 358–393:
lowercase, strip digits via `/[-−+]?\d+(?:[.,\/]\d+)*/g` → `#`, collapse whitespace, flag any
widget-bearing step whose resulting template exactly matches an earlier step's) was reproduced
verbatim in a standalone `node` script and run against each lesson's live, current JSON. Every
flagged id and its colliding sibling(s) below is the **computed** output of that script, not a
by-eye guess — see the per-lesson collision line. Output matched the live queue CSV's `step_path`
for all 7 rows exactly. Every flagged step's full context (surrounding `concept`/`interactive`/
`check`/`challenge` steps, `explanationVariants`, traps, and where relevant the widget's reachable
input range) was then read directly from the current file and independently re-derived — not
carried over from any prior report's prose — before reaching a decision.

**Cross-reference.** 5 of these 7 lessons (`g4p-01-01`, `pp-04-02`, `tf-02-02`, `tg-05-01`,
`tse-01-02`) were also in scope for an earlier lane this session, `S329_PROGRESSION_PGF.md`. Before
using that report as anything more than a cross-check, this packet independently confirmed **zero
drift**: `node scripts/session/print-review-basis.mjs <id>` on the live tree today returns the exact
byte-identical `reviewBasisHash` S329 recorded for all 5 (`g4p-01-01`
`bd30c65c…33f22f9`, `pp-04-02` `be2e2a90…c8694880e`, `tg-05-01` `31170599…18bba3cec7031a`,
`tse-01-02` `71309cbc…dab3014c7f` — all match byte-for-byte; `tf-02-02` has no directly comparable
hash in that report but its file content was re-read and re-verified independently below anyway).
Given that, S329's conclusions are evidence about the file as it exists today. Each of the 5 was
still independently re-derived here from the raw file (not copied), and in one case
(`g4p-01-01`) this packet's read goes further than S329's, verifying an additional structural fact
(the widgets' reachable slider ranges) that strengthens the same conclusion. `les-01-01` and
`se-03-03` were not in S329's scope and are fully fresh reads.

**Outcome: all 7 rows are genuine KEEPs. Zero edits.** Every collision below is the detector
correctly catching an identical *sentence shape* while missing a real, verifiable difference in the
*question job* — different rule branch, different reachable trap, or explicit immediate-retrieval
design — that the digit-blind text scan cannot see. No shared generator file
(`src/lib/variants.ts`, `src/lib/g4Variants.ts`) was touched, since nothing was edited.

---

## `g4p-01-01` (patterns-factors-g4, Grade 4) — flagged `i2`, collides with `i1`

Template: `"build a rectangle with area # whose sides are # and #."`

`i1` (area 24, sides 4×6, `wMax`/`hMax`=6) sits right after `c1`'s own worked example (which uses
these exact numbers) — first hands-on tool use. `i2` (area 36, sides 9×4, `wMax`/`hMax`=9) sits
after `c2` teaches the systematic search-and-stop-at-repeat strategy.

**Verified beyond the prompt text — the reachable factor pairs, computed independently:** within
`i1`'s slider range `[1,6]×[1,6]`, the *only* pair of whole numbers ≤6 that multiplies to 24 is
{4,6} — no other factor pair of 24 (1×24, 2×12, 3×8) fits the range at all, so `i1`'s
`factorFeedback` trap is structurally close to unreachable. Within `i2`'s range `[1,9]×[1,9]`,
36 has **two** reachable pairs: the required {9,4} *and* {6,6} — 36 is a perfect square and 6≤9, so
the "obvious" square shortcut is live and must be explicitly rejected via `requireFactors`+
`factorFeedback` ("this transfer asks for the 9 by 4 factor pair"). This is a concrete, checkable
design fact (not flavor text): `i2`'s widget genuinely admits and defeats a shortcut that `i1`'s
range cannot even present. **KEEP.**

(`g4p-01-01` also carries a pre-existing S303 hash-lock regression test,
`src/lib/session303.patternsFactorsG4P1ProgressionRepair.test.ts`, which locks every field of this
lesson except `k3`'s `body`/`widget.prompt` — confirmed still green, `4/4` passed, untouched since
no edit was made here.)

## `les-01-01` (linear-equations-systems) — flagged `ch1`, collides with `i2`

Template: `"solve for x: #x − # = #"` (the digit-stripper consumes a leading sign as part of the
number token, which is why `−2x` in `ch1` normalizes the same as `2x` in `i2`.)

`i2` (`2x − 6 = 12`, **positive** coefficient 2) drills "undo the subtracted constant by adding" —
its own traps (3, 18) are both about the subtraction step, never about dividing by a negative.
`ch1` (`−2x − 4 = 6`, **negative** coefficient −2) is the lesson's designated final-challenge step
and is the *only* step in the lesson that requires dividing by a negative coefficient — a distinct
sign-tracking skill named explicitly in the lesson's own recap takeaway ("Watch signs when dividing
by a negative coefficient"). `ch1`'s own trap (5, "dividing 10 by −2 gives −5, not 5") targets
exactly that misconception, which `i2`'s positive coefficient cannot construct. Math re-verified:
`2x−6=12 → x=9` ✓; `−2x−4=6 → −2x=10 → x=−5` ✓; both traps ≠ the correct answer and ≠ each other.
**KEEP.**

## `pp-04-02` (polar-parametric) — flagged `k3`, collides with `k2`

Template: `"eliminate t from x = #cos t, y = #sin t."`

`k2` (`x=2cos t, y=2sin t` — equal coefficients) eliminates to `x² + y² = 4`, a **circle**. `k3`
(`x=3cos t, y=2sin t` — unequal coefficients) eliminates to `(x/3)² + (y/2)² = 1`, an **ellipse** —
a different final equation *family*, not a magnitude restatement. Independently confirmed from the
`buildExpression` token banks: `k3`'s distractor `(x/2)² + (y/3)²` (swapped divisors) is only a
live, plausible trap once the two coefficients differ — at `k2`'s equal-coefficient case that same
swap would equal the correct answer, so the trap literally cannot be constructed there. **KEEP.**

## `se-03-03` (systems-equations) — flagged `i2`, collides with `k1`

Template: `"solve the system #x + #y = # and #x + #y = # by elimination. what is y?"`

`k1` (`2x+3y=13`, `3x+2y=12` → y=3) is the graded check right after `i1` scaffolds identifying the
multiplier. `c2` immediately follows `k1` and re-explains that *exact same* worked system,
step-by-step, by name ("Worked once more, phrased differently"). `i2` (body: **"Scale both
again."**) comes right after that re-explanation with a fresh system (`3x+4y=10`, `2x+3y=7` → y=1)
— textbook immediate-retrieval practice of a just-re-explained worked example, not an accidental
repeat. Math re-verified: first×2 (6x+8y=20), second×3 (6x+9y=21), subtract → −y=−1 → **y=1** ✓,
genuinely recomputed from different numbers, not a copy of k1's y=3. **KEEP.**

## `tf-02-02` (trig-functions) — flagged `k2`, collides with `i2`

Template: `"convert #π/# to degrees."`

`i2` (`5π/6 → 150°`) is, in fact, `c2`'s own worked example number-for-number ("π/6 steps are 30°
each, so 5π/6 is five 30° steps: 150°") — an immediate check-the-example step. `k2` (`3π/2 → 270°`)
switches to a genuinely new denominator family (halves of π, 90° steps) never drilled before,
testing whether the general step-counting *method* transfers beyond the one family the concept
happened to illustrate. (This lesson's `ch1` collision against the same anchor was already closed
by an earlier session — confirmed present and untouched: `"Same size steps as before, but this
angle runs clockwise: −5π/6..."`, template `"same size steps as before, but this angle runs
clockwise: #π/#. what degree measure is that?"`, structurally distinct — so only `k2` remains open,
consistent with the live queue row.) **KEEP.**

## `tg-05-01` (trig-graphs-inverses) — flagged `k3`, `ch1`, both collide with `k1`

Template: `"what is arcsin(sin(#π/#))?"` — a 3-way collision, `k1` is the unflagged anchor.

Three different quadrants, three different reduction mechanics: `k1` (5π/6, QII, mirror rule
π−x → π/6), `k3` (5π/3, QIV, subtract-a-full-turn → −π/3; its own distractor −2π/3 is k1's mirror
rule *mis-applied* outside its valid domain, named in-widget: "That uses the π − x mirror, which
only works when x is between π/2 and 3π/2"), `ch1` (7π/6, QIII, sign-tracking trap: distractor π/6
drops the negative sign sin(7π/6)=−1/2 requires). Math re-verified: sin(5π/6)=1/2→π/6 ✓;
sin(5π/3)=−√3/2→−π/3 ✓ (5π/3−2π=−π/3, inside [−π/2,π/2]); sin(7π/6)=−1/2→−π/6 ✓. Quadrant coverage
is this lesson's explicit "trap" thesis (recap: "Quadrant II inputs map to π−x; negative sines map
to negative branch angles"), not duplication. **KEEP** (both steps).

## `tse-01-02` (two-step-equations) — flagged `k2`, `k3`; two independent collision pairs

- `k1` vs `k2`, template `"simplify: #x - #x"`: `k1` (`2x − 7x`, **different** signs) vs `k2`
  (`−3x − 5x`, **same** signs, both negative) — the two branches of the signed-number combine rule,
  confirmed by `k2`'s own `explanationVariants` naming it directly ("Same signs (both negative):
  3+5=8, keep negative"). Math re-verified: `2x−7x=−5x` ✓ (different signs, 7−2=5, sign of larger
  magnitude); `−3x−5x=−8x` ✓ (same signs, 3+5=8). Traps for each (5x/−9x for k1; 8x/−2x for k2) all
  ≠ their own correct answer and ≠ each other.
- `i3` vs `k3`, template `"simplify: #(x + #) + #x"`: `i3` (`2(x+3)+4x`, **positive** coefficient
  distribution) vs `k3` (`−2(x+4)+3x`, **negative** coefficient distribution). `k3`'s trap
  ("−2 times 4 is −8, not +8") targets the sign-of-distribution error, which is impossible to
  construct with `i3`'s positive multiplier. Math re-verified: `2(x+3)+4x=6x+6` ✓;
  `−2(x+4)+3x=x−8` ✓.

Both pairs are the lesson's own explicitly-named two branches of one signed-number rule
(`c1`: "add the coefficients using the signed-number rules you already know"), not accidental
repeats. **KEEP** (both steps).

---

## Summary

| Lesson | Flagged | Collides with | Decision | Reason (one clause) |
|---|---|---|---|---|
| `g4p-01-01` | `i2` | `i1` | KEEP | 36's reachable {6,6} square shortcut vs 24's structurally-unreachable alternates |
| `les-01-01` | `ch1` | `i2` | KEEP | negative-coefficient division vs positive-coefficient subtraction |
| `pp-04-02` | `k3` | `k2` | KEEP | ellipse (unequal coeffs) vs circle (equal coeffs) — different equation family |
| `se-03-03` | `i2` | `k1` | KEEP | explicit "Scale both again" immediate retrieval after c2's worked re-explanation |
| `tf-02-02` | `k2` | `i2` | KEEP | new denominator family (halves) vs c2's own worked sixths example |
| `tg-05-01` | `k3`, `ch1` | `k1` | KEEP | three quadrants, three distinct reduction/misconception mechanics |
| `tse-01-02` | `k2`, `k3` | `k1`, `i3` | KEEP | same-sign vs different-sign branch; positive vs negative distribution branch |

**Files changed: none.** **Shared generator files touched: none.**
`reports/closure/cowork-staging/laneA-s330-G11.jsonl` was **not created** — the disposition ledger
schema in this workstream is scoped to lessons actually edited, and none were; all 7 rows remain
open in the queue by design (a structural detector cannot be closed by a KEEP disposition), each now
carrying an honest, independently re-derived, math-verified review.

## Verification performed

- Live re-run of the detector's exact regex/logic (standalone script) against all 7 lessons' current
  files — flagged-id output matches `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`'s `step_path` exactly for
  every row.
- `node -e "JSON.parse(...)"` on all 7 files — valid (unsurprising: unedited).
- `git status --short` before and after — none of the 7 files appear; confirms no accidental writes
  and (separately) shows 10 other files under concurrent edit by other lanes this session, none
  overlapping this packet's scope.
- `npx vitest run src/lib/session303.patternsFactorsG4P1ProgressionRepair.test.ts` — 4/4 passed
  (incidental confirmation; this lesson's pre-existing hash-lock stayed intact because it was never
  touched).
- `reviewBasisHash` cross-check for the 5 lessons shared with `S329_PROGRESSION_PGF.md` — 4/4 with a
  directly recorded comparator hash in that report matched byte-for-byte (the 5th, `tf-02-02`, was
  independently re-read in full instead).

`npm test`, full `vitest`, and whole-project `tsc --noEmit` were **not** run, per the container
constraint (2-CPU sandbox) — verification above used the two targeted, narrowly-scoped commands.
