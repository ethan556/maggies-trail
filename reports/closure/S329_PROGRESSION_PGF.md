# S329 Fix Packet PGF — LESSON_PROGRESSION_AND_DUPLICATION (20 lessons, 15 courses)

Fixer: `cowork-s329-PGF-fixer`. Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `PROGRESSION-<lessonId>`
under workstream `LESSON_PROGRESSION_AND_DUPLICATION` for exactly the 20 lessons assigned this lane:
`ssg2-02-01/02/03`, `gf-03-03`, `gf-05-02`, `kc-01-03`, `kc-05-01`, `ti-03-01`, `ti-03-02`, `as-04-01`,
`as100-03-04`, `asv-03-01`, `cn-05-02`, `ee-05-01`, `fna-03-02`, `g4p-01-01`, `pp-04-02`, `tf-02-02`,
`tg-05-01`, `tse-01-02`. Standard for non-duplication judgment: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(R1–R6 distinctness discipline, applied here to ordinary lesson-step repeats rather than the
remedial-vs-`k1` defect class it was originally ruled on). Detector reproduced verbatim from
`scripts/audit/consolidate-pending-workload-s236.mjs` lines 124–130 and 358–393 (`stable()` for
`duplicate-widgets`, exact string equality for `exact-prompts`, digit-normalized-template equality for
`number-normalized-prompts`) into a standalone `node`/`tsx` script and run against every lesson's
**live, current** JSON before and after any edit — never guessed by eye.

**Every one of this lane's 20 rows is `duplicate-widgets=[]; exact-prompts=[]` — a
`number-normalized-prompts`-only (P1) collision, same sentence template with different numbers, never a
verbatim repeat.**

## An important discovery before any edit was made

All 20 of these lessons were **already read and dispositioned in session S327**
(`reports/closure/S327_FIX_PG3.md`, `S327_FIX_PG5.md`, `S327_FIX_PG6.md`, staged in
`laneA-s327-PG3.jsonl` / `-PG5.jsonl` / `-PG6.jsonl`). Rather than re-deriving 20 independent
judgments from nothing, this lane's method was: **(1)** run the live detector against the current
lesson files to get the actual, current `step_path` for each of the 20 CSV rows and confirm it
against the CSV directly (`grep '^PROGRESSION-<id>,' PREMIUM_PENDING_WORKLOAD_QUEUE.csv`); **(2)** read
every flagged step's full content directly from the current lesson JSON (not from the prior report's
prose) and independently re-derive whether the repeat is legitimate; **(3)** cross-check every
unedited lesson's current `reviewBasisHash` (via `node scripts/session/print-review-basis.mjs`)
against the hash recorded in S327's own staged disposition — **all 18 unedited lessons' hashes matched
S327's recorded hash byte-for-byte**, independently proving (by content hash, not just by reading) that
nothing has drifted since S327's read and that S327's own recorded rationale is evidence about the
file as it exists today, not stale evidence about a different version. Two lessons
(`as100-03-04`, `tf-02-02`) had **already been redesigned** by S327 (their `ch1` step); the live
detector confirms those specific collisions are already closed (only `k2` remains flagged on each, the
separately-judged legitimate KEEP half) — verified, not re-edited. Two lessons
(`ssg2-02-01`, `ssg2-02-02`) turned out, on this lane's own independent read, to have a genuine
redesign opportunity S327 had called KEEP; those are redesigned below, with the reasoning for
disagreeing with the prior call stated explicitly.

This means: **16 lessons — pure KEEP, verified independently, no edit.** **2 lessons — already
redesigned by a prior session; reverified, not touched again.** **2 lessons — redesigned in this
session.**

---

## Category A — Pure KEEP, verified independently (16 lessons, no edit)

For each, the table gives the queue's flagged `step_path`, the one-line reason, and the fresh
`reviewBasisHash` confirming current file state (all 16 match the S327-recorded hash exactly, i.e.
these lessons are byte-identical to what S327 examined; no fresh disposition is filed per this lane's
instructions — untouched lessons don't need one, and S327's existing signed KEEP already covers this
exact content).

| Lesson | Course | Flagged | Why kept | reviewBasisHash |
|---|---|---|---|---|
| `gf-03-03` | geometry-foundations | `k2` | k1 drills the 90° rotation rule, k2 the 270° rule — two different transformation formulas; each step's traps are built to catch confusion with the *other* named angle (k1's trap −4 is literally the 270° answer, and vice versa). The shared sentence template is structurally required to fit any of c1's three taught angles; the angle itself is the constraint the text-only detector can't see. | `f7eba86848d9f8b7dfff5bfba5b32f29e0d4714e4a5ae0b955aff6e1a884467c` |
| `gf-05-02` | geometry-foundations | `k2` | c2 teaches a 4-entry sign-pattern "fingerprint chart." i2 drills the x-only-flip entry (correct: y-axis reflection); k2 drills the both-flip entry (correct: 180° rotation) — different option sets, different correct answers, not the same question restated; only the mcq *stem* (structurally required to fit any of the four fingerprints) collided. | `5554469809c85050b798db5c12e8e0cdd4114f6aedee4ff813e1a9882b4845c4` |
| `kc-01-03` | counting-to-20-k | `i2` | Kindergarten counting-on lesson; the entire point is repeated hop-forward practice with a rising hop count. i1 is 2 hops (3→5); i2 is 3 hops (5→8), explicitly signposted by its own body text ("A longer hop trip") as a genuine escalation in how many counts a 5–6-year-old must track — real cognitive-load increase at this level, not filler. Both steps are ungraded interactives. | `0ed156a490feb4bf36538992586d590bd924f537d1611771ff8e3ed5a3dcb97f` |
| `kc-05-01` | counting-to-20-k | `i2 k2 k3` | "Make Ten" lesson whose explicit curricular content (named verbatim by c2: "6 and 4, 9 and 1, and 5 and 5") is systematic coverage of the fixed, finite set of make-ten fact pairs. Every flagged step drills a *different* pair (partners 3, 1, 7 respectively) — this is the lesson's actual mathematical content, not repetition. | `2d93e3c7e1c4d1c3058e92dd9ff2ce4886df08bb18f2f50d0a91b1700fc885b8` |
| `ti-03-01` | trig-identities-equations | `k2` | c1/c2's stated teaching point is that cosine's sign flips between sum and difference. k1b tests the SUM case (cos 75°, minus sign, 0.2588); k2 tests the DIFFERENCE case (cos 15°, plus sign, 0.9659) — the two complementary halves of one concept. k2's own trap (0.2588) is explicitly built to catch confusion with k1b's answer, confirming intentional contrast. | `4653bc4aeed9c45d37d91281f57d2762276614fa037cad00af64171253198000` |
| `ti-03-02` | trig-identities-equations | `ch1` | Same sum/difference contrast as `ti-03-01`, one function over: k1 tests tan(A+B) (tan 75°, 3.732); ch1 tests tan(A−B) (tan 15°, 0.268). ch1's own trap (3.732) directly targets confusion with k1's answer. (This lesson's `k3` also received an unrelated `CHOICE_SURFACE_INTEGRITY` MCQ-wording fix in a prior session — confirmed present and untouched by this lane; it does not affect the PROGRESSION classification.) | `e676073ff27fe8500d6ed652e669517847d1b2b6599786c3ec9d452550f49d2a` |
| `as-04-01` | add-subtract-20 | `k2` | Fact-families lesson whose own recap states the transferable point directly: "Knowing one fact gives you the other three." k1 drills family (8,5,13); k2 drills a *different* family (9,4,13) — testing whether the derivation strategy generalizes beyond the first memorized triple, not idle repetition. Traps recomputed for the new family, not reused. | `65fdb1cd5abd82b8706698ca77f4f03536f306998213f55eef9ccdb267410309` |
| `asv-03-01` | area-surface-volume | `k3` | The text scanner collapses any `(x,y)` pair to one `#` token, so it can't see which coordinate a side holds constant. k1=horizontal+positive, i2=horizontal+negative, k2=vertical+positive, k3=vertical+negative — the lesson deliberately fills all four cells of a horizontal/vertical × positive/negative case matrix; i2 and k3 are the two negative-coordinate cells. The shared answer value (8) is a numeric coincidence, not evidence the tasks are the same — the axis being measured differs. | `920e42eafdf70e93db7f6c814225994c964db27331c1f3fd7fd76d494f175371` |
| `cn-05-02` | complex-numbers | `k1 ch1` | k1 (roots 1±5i, positive center) and ch1 (roots −1±2i, "Negative center") both build a quadratic from a root pair, but ch1's negative real part forces a double sign-flip in −(sum) that k1 cannot exercise (sum=−2, so −(sum)x = −(−2)x = +2x) — ch1's own trap text ("The sum is NEGATIVE two, and minus a negative gives +2x") names exactly this mechanism. Genuine, distinct sign-handling misconception. | `919bceaf290854a4e90a52cb598619d650cb0c8397dd9e9c5f06f3e9dcf7844a` |
| `ee-05-01` | expressions-equations | `k1` | i1 tests membership at x=6 (interior point, clearly non-boundary, ungraded). k1 tests x=5 — exactly the strict inequality's excluded boundary, a GRADED check whose own options target "the boundary always counts," a misconception i1's own options never raise. Genuinely harder, boundary-specific case, deliberately placed right before c2 formalizes strict-vs-inclusive. | `060baf27e02cec0d7abaea2ed2f7ccb14d5cb3b8314a02eabab5d93ab887c2d3` |
| `fna-03-02` | function-analysis | `k2` | k1 (x=2) is the branch-boundary case (traps: wrong branch, returns input). k2 (x=3, "Deep in the second branch") tests a genuinely different, arithmetic-mechanics misconception — trap 6 is 3 doubled instead of squared (3×2 vs 3×3) — which is *impossible to even construct* at k1's boundary (2×2 = 2² = 4, doubling and squaring coincide exactly at x=2). Independently confirmed this trap literally cannot exist at the boundary case. | `d3dd1e3ffd144076ec5562f2a5c9a11eac856cf3096652afa3565a847e7fb4be` |
| `g4p-01-01` | patterns-factors-g4 | `i2` | i1 (area 24, sides 4×6) sits before c2 teaches the systematic search strategy and reuses c1's own worked numbers — first hands-on attempt. i2 (area 36, sides 9×4) sits after c2 and is a deliberate transfer trap: 36 is a perfect square with an easy 6×6 pair available, but `requireFactors` forces the *non-square* 9×4 pair, requiring genuine factor-pair search rather than "it's obviously square." | `bd30c65ccbd6b376af101baa681608da36842035abe21c0674be99b57b3f22f9` |
| `pp-04-02` | polar-parametric | `k3` | k2 (x=2cos t, y=2sin t — EQUAL coefficients) yields a circle x²+y²=4. k3 (x=3cos t, y=2sin t — UNEQUAL coefficients) yields an ellipse (x/3)²+(y/2)²=1 — a structurally different final answer with a genuinely different token bank (different correct-answer shape, different distractor: a swapped-divisor `(x/2)²+(y/3)²` option that is moot when the coefficients are equal). Not a magnitude restatement — a different final equation family. | `be2e2a908e1bf3659f88e3fdd180a4ef448cf708a35f68680fcac8ce8694880e` |
| `tg-05-01` | trig-graphs-inverses | `k3 ch1` | k1 (5π/6, QII, sin=+1/2 → π/6), k3 (5π/3, QIV, sin=−√3/2 → −π/3), ch1 (7π/6, QIII, sin=−1/2 → −π/6) are three different quadrants, each requiring a different reduction rule and targeting a different, explicitly-named misconception (k3's own distractor names "π−x mirror overgeneralization" by name; ch1's own distractor is a sign-tracking check). Correct handling of arcsin(sin x) genuinely depends on the quadrant — quadrant coverage is this "trap" lesson's intended breadth, not duplication. | `3117059920d764b7601e6899b41a59a3343a48037715c40c0918bba3cec7031a` |
| `tse-01-02` | two-step-equations | `k2 k3` | Two independent collision pairs. k1 (2x−7x, different signs) vs k2 (−3x−5x, same signs, both negative) — the two branches of the combine-like-terms sign rule, confirmed by k2's own explanationVariants ("Same signs (both negative): 3+5=8, keep negative"). i3 (2(x+3)+4x, distribute +2) vs k3 (−2(x+4)+3x, distribute −2) — positive- vs negative-coefficient distribution, confirmed by k3's own trap ("−2 times 4 is −8, not +8"). Both pairs are the first test of the second branch of a two-branch rule. | `71309cbc5b6cd724ddb8a22bdab46cc5eb86ede3522e5af620bcdf6d13014c7f` |
| `ssg2-02-03` | shapes-shares-g2 | `k1 i2 i3 k2 k3 ch1` | This lesson's stated thesis (title "Grids in Everyday Objects"; c1: "Grids of squares show up everywhere... Counting the grid tells you exactly how many pieces there are"; c3: "Whatever the object, the counting rule is the same") is explicitly, deliberately about **context transfer**: chocolate bar, window panes, checkerboard, garden bed, stamp sheet, tile floor, mosaic — seven distinct real-world nouns wrapped around the identical r×c mechanic. Near-transfer practice across varied contexts is a legitimate, well-established elementary goal (prevents context-bound learning) and is this lesson's own explicit purpose, unlike its magnitude-escalation sibling `ssg2-02-02` (see below). | `7f2e883a4adfd6b571bb49b8ea30920eb061ef735db1a0c90c9ab42acffd538f` |

All 16 hashes above were produced directly by `node scripts/session/print-review-basis.mjs <id>` run
against the live tree at report time, and cross-checked against each lesson's `reviewedBasisHash` as
recorded in its S327 staged disposition — every one matched byte-for-byte.

---

## Category B — already redesigned by a prior session, reverified (2 lessons, not re-touched)

### `as100-03-04` (add-subtract-100)

**Queue today:** `PROGRESSION-as100-03-04`, `step_path=k2` only (`duplicate-widgets=[]; exact-prompts=[];
number-normalized-prompts=[k2]`).

S327 (`S327_FIX_PG6.md`) found this row originally flagged both `k2` and `ch1`. `k2` (74−28, "Split the
two traps," the first check after c2 names both traps explicitly, cleanly isolating each into its own
trap value) was judged legitimate KEEP — reverified here, independently, by the same reasoning: k1
(62−37) predates c2 and its one trap value (35) ambiguously conflates the flip-trap and the
forgot-to-break-a-rod trap ("That's the flip trap... — or a break that forgot to spend a rod"); k2
cleanly separates them into distinct values (54=flip, 56=forgot-spent). `ch1` (originally the bare
equation "83 − 45 = ?", mechanically identical to k1/k2) was redesigned by S327 into a word-problem
wrapper ("A rack starts with 83 shirts. The store sells 45 of them today...") — same numbers (83, 45),
same answer (38), same recomputed traps (42=flip, 48=forgot-spent), but now requiring the learner to
extract the subtraction from a story context, a genuine transfer demand no other step in the lesson
makes. **Read directly from the current file: this redesign is in place exactly as described.**
Confirmed by the live detector: only `k2` collides today; `ch1`'s template
("a rack starts with # shirts. the store sells # of them today. how many shirts are left on the rack?")
is structurally distinct from the shared `"# − # = ?"` family. No further action needed.

### `tf-02-02` (trig-functions)

**Queue today:** `PROGRESSION-tf-02-02`, `step_path=k2` only. This lesson straddles both categories —
its `ch1` collision was already closed by S327 (below), and its still-open `k2` collision is a
separate, independently-reverified legitimate KEEP, documented here rather than in the Category A
table to avoid double-counting the lesson.

**`k2` — KEEP, reverified independently.** i2 (5π/6=150°, denominator-6 family, under the 180°
anchor) is the first read-back practice. k2 (3π/2=270°, denominator-2 family, *past* the 180° anchor)
tests a different family and the harder past-anchor case — genuinely distinct, not a magnitude
restatement.

S327 found this row originally flagging both `k2` and `ch1` as a 3-way collision against `i2`
(all three normalizing to `"convert #π/# to degrees."`). `k2` (above) was judged
legitimate KEEP. `ch1` (originally 7π/6=210°, reusing i2's own denominator-6 family and k2's
past-anchor property with no new demand, despite sitting after c3's "negative angles turn clockwise"
teaching that it never actually exercised) was redesigned by S327 to: *"Same size steps as before, but
this angle runs clockwise: −5π/6. What degree measure is that?"* (answer −150°). **Read directly from
the current file: confirmed in place.** Independently re-verified the math: 5π/6 is five 30° steps
(150°); the same magnitude run clockwise (negative) is −150°. Traps (150, drops the direction sign;
−30, only one step counted) are both ≠ −150 and ≠ each other. This is now the only step in the lesson
that actually exercises c3's clockwise/negative-angle content. Confirmed by the live detector: `ch1`'s
template ("same size steps as before, but this angle runs clockwise: −#π/#. what degree measure is
that?") is structurally distinct from the shared family. No further action needed.

---

## Category C — redesigned in this session (2 lessons)

### `ssg2-02-01` (shapes-shares-g2) — PROGRESSION, step_path `i3 k2 k3 ch1` → `i3 k2 k3`

**Queue evidence:** `duplicate-widgets=[]; exact-prompts=[]; number-normalized-prompts=[i3,k2,k3,ch1]`,
all colliding with anchor `k1`, template `"a rectangle is partitioned into # rows and # columns of unit
squares. how many unit squares in all?"`.

**Read all five instances directly:**

| Step | Rows × Cols | Answer | Body | Verdict |
|---|---|---|---|---|
| `k1` (anchor) | 2×5 | 10 | — | anchor, not flagged |
| `i3` | 1×6 | 6 | "A single row." | **KEEP** — the genuine degenerate case c3 explicitly names ("A single row or single column grid is the simplest case") |
| `k2` | 3×5 | 15 | "A wider grid." | **KEEP** — ordinary check-tier fluency rep, same class as `as-04-01`/k2 and `kc-05-01` |
| `k3` | 5×2 | 10 | "A taller grid." | **KEEP** — ordinary check-tier fluency rep |
| `ch1` | 6×4 | 24 | "A bigger grid." | **(b) true unintentional duplicate — redesigned** |

`ch1` was the true defect: a challenge-tier step, billed by its tier as the hardest task in the lesson,
but mechanically identical in action (compute rows × columns), representation (`numeric` widget), and
trap pair (sum-instead-of-product; report-one-dimension) to `k1`/`k2`/`k3` — magnitude was its only
distinguishing feature. This is the same defect class independently redesigned elsewhere this session
at `as100-03-04`/`ch1` and `tf-02-02`/`ch1` (Category B above) and in the prior session at
`alg1-01-01`/`ch1`, `sp-02-01`/`ch1`, `se-03-03`/`ch1`, `asv-01-02`/`ch1`, `asv-03-02`/`ch1`,
`asv-05-02`/`ch1` (`S327_FIX_PG2.md`, `PG3.md`, `PG5.md`) — by a wide margin the most common defect
shape found in this codebase's whole-session progression sweep, and the reason this lane checked every
`ch1` in its 20-lesson scope against this specific pattern.

**BEFORE:** `"A rectangle is partitioned into 6 rows and 4 columns of unit squares. How many unit
squares in all?"`, answer 24, traps 10 (sum) / 6 (one-column).

**AFTER:** `"A rectangle is partitioned into unit squares. It has 6 rows and 24 squares in all. How many
columns does it have?"`, answer 4.

**What changed:** the action inverted — from *compute rows × columns* to *given the total and one
dimension, find the missing dimension* — a genuinely new demand (missing-factor/division reasoning)
that no other step in this lesson tests. Precedented in-app by `g4p-01-01`/k1, which asks the identical
kind of question ("A rectangle has one side 7 and an area of 56. What is the other side?").

**Math verified:** 6 × 4 = 24. Traps recomputed: 30 (=6+24, sum instead of divide) and 6 (row count
echoed back, as if the grid must be square) — both ≠ 4 (the answer) and ≠ each other.

**Variant dropped:** the original `{gen:"grid-count", form:"colTrap"}` tag was removed. Read
`src/lib/variants.ts:7396–7443` in full: the `grid-count` generator's five forms (`colTrap`, `square`,
`read`, `colTrapRead`, `squareRead`) **all** produce only the forward `"rows × columns = total"` prompt
shape — none ever emits an inverse missing-dimension job. Leaving the tag in place would have let
`refreshLessonSteps` silently regenerate the old forward job on the next replay walk, undoing the fix.

**Verified:**
- Re-ran this session's own port of the consolidator's detector against the edited file:
  `number-normalized-prompts=[i3,k2,k3]` (was `[i3,k2,k3,ch1]`) — `ch1` no longer collides; the three
  legitimately-kept steps remain correctly flagged (expected — KEEP judgments don't close a queue row,
  only a structural change to every flagged step would, and forcing changes onto legitimate KEEPs is
  explicitly out of scope).
- `npm run validate:content` — 1840/1840 clean, including this file.
- `npm run lint:pedagogy` — 1711/1711 clean, including this file.
- JSON re-parses cleanly.
- `reviewBasisHash` (post-edit): `564da703d1390cddf77b264785686bce39d598774494aeb320525e6dc229207f`

### `ssg2-02-02` (shapes-shares-g2) — PROGRESSION, step_path `k1 i2 i3 k2 k3 ch1` → `k1 i2 i3 k2 k3`

**Queue evidence:** `duplicate-widgets=[]; exact-prompts=[]; number-normalized-prompts=[k1,i2,i3,k2,k3,ch1]`,
all colliding with anchor `i1`, same shared template as `ssg2-02-01`.

**Read all seven instances directly, in lesson order:**

| Step | Rows × Cols | Answer | Verdict |
|---|---|---|---|
| `i1` (anchor) | 5×5 | 25 | anchor, not flagged |
| `k1` | 7×2 | 14 | **KEEP** — precedes c2, which explicitly uses these exact numbers ("2 rows of 7 and 7 rows of 2 both give 14 squares") to teach the flip/transpose concept |
| `i2` | 2×7 | 14 | **KEEP** — "The flipped grid," directly tests the transpose concept c2 just taught, using k1's own numbers reversed — a deliberate before/after-concept pair, same pattern as `ee-05-01`/k1 and `g4p-01-01`/i2 |
| `i3` | 6×6 | 36 | **KEEP** — ordinary ungraded interactive rep |
| `k2` | 3×7 | 21 | **KEEP** — ordinary check-tier fluency rep |
| `k3` | 8×3 | 24 | **KEEP** — ordinary check-tier fluency rep |
| `ch1` | 7×7 | 49 | **(b) true unintentional duplicate — redesigned** |

`ch1` ("The biggest grid yet") was the same defect as `ssg2-02-01`/ch1: challenge-tier billing with no
actual escalation beyond magnitude — same action, same representation, same two-trap shape
(sum-instead-of-product; report-one-row) as every other step in the lesson. Worth noting: this lesson's
own opening concept (c1) states "Bigger grids just mean more squares to count — the counting idea never
changes, even when the grid grows," which actually *disclaims* magnitude as a source of real difficulty
— reinforcing that a magnitude-only "challenge" here is inconsistent with the lesson's own stated
thesis.

**First redesign attempt and the pinned-contract catch.** The first draft mirrored `ssg2-02-01`'s fix
exactly: invert the action to a `numeric` "given total and rows, find columns" widget (9 rows, 45
total → 5 columns). This produced a structurally clean fix (JSON valid, schema/pedagogy lint clean,
collision resolved) — but running this lesson's course-scoped targeted test,
`src/lib/session130.grid-read.test.ts`, caught a real defect the structural checks could not see:

```
FAIL src/lib/session130.grid-read.test.ts > draws every authored grid with exact rows × columns = answer
Error: .../ssg2-02-02.json/ch1: expected areaModel
```

That test (`session130.grid-read.test.ts:8–31`) is a deliberate, pre-existing pinned contract: **every**
widget-bearing step (`i1`–`i3`, `k1`–`k3`, `ch1`) plus the remedial check in *both*
`ssg2-02-02.json` and `ssg2-02-03.json` must use the `areaModel` widget with `countGrid:true`,
`wStart===wMax`, `hStart===hMax` (i.e. a fully-pre-drawn grid, not a build-by-dragging interaction), and
`evaluate()` checked against `targetArea` — a session-130 design decision to keep this lesson pair on
one uniform, always-visual "count the fully-drawn grid" representation. An inverse "solve for the
missing dimension" answer is structurally incompatible with `evaluate()`'s fixed
answer-equals-`targetArea` semantics, so a `numeric` "find the missing side" widget can never satisfy
this pin — the fix had to be revised, not just re-pinned, since the pin encodes a genuine, deliberate
content-architecture decision, not a stale value to update.

**Revised, correct redesign — kept the areaModel/countGrid/targetArea contract, changed the
misconception target instead of the action:**

**BEFORE:** `"A rectangle is partitioned into 7 rows and 7 columns of unit squares. How many unit
squares in all?"`, `targetArea:49`, traps 14 (=7+7, sum) / 7 (one-row).

**AFTER:** `"This grid has 7 rows and 7 columns of unit squares. Count only the squares — not the edge
around the grid."`, `targetArea:49` (unchanged — still an `areaModel`/`countGrid:true` widget with
`wStart=wMax=7`, `hStart=hMax=7`, satisfying the pin exactly), traps **28** (=2×(7+7), the perimeter,
not the area) and 7 (one-row, kept).

**What changed:** the misconception target — every other trap in this lesson is a version of "added
instead of multiplied" (r+c); `ch1` now targets perimeter/area confusion, a distinct, well-established
Grade 2–3 geometry misconception (mistaking the distance around a shape for the number of unit squares
filling it) that this lesson never tests elsewhere. The prompt was also reworded (not just the trap) so
its normalized template ("this grid is # rows by # columns...") no longer matches the shared family
template — a wording-only change was necessary for the structural fix, in addition to the substantive
one.

**Math verified:** 7 × 7 = 49 (area, the target). Perimeter = 2×(7+7) = 28. 28 ≠ 49 and ≠ 7 (the other
trap).

**Variant dropped:** the original `{gen:"grid-count", form:"squareRead"}` tag was removed, for the same
reason as `ssg2-02-01` — no `grid-count` form ever produces a perimeter-style trap, so a stale tag
would silently revert the fix on replay.

**Verified:**
- Re-ran this lane's port of the detector: `number-normalized-prompts=[k1,i2,i3,k2,k3]` (was
  `[k1,i2,i3,k2,k3,ch1]`) — `ch1` no longer collides.
- `npm run validate:content` — 1840/1840 clean, including this file.
- `npm run lint:pedagogy` — 1711/1711 clean, including this file.
- `npx vitest run src/lib/session130.grid-read.test.ts src/lib/session264.shapesSharesG2P0Integrity.test.ts src/lib/session297.shapesSharesG2ChoiceParity.test.ts src/lib/session244.flagshipVisualPacketB.test.ts`
  — **4 files, 73/73 tests pass** (the `session130` failure from the first attempt is gone; the other
  three files were unaffected throughout, confirming `i2` — pinned by `session244` — and the remedial
  were never touched).
- JSON re-parses cleanly.
- `reviewBasisHash` (post-edit): `e02479bf924a492e37d0f8d65e4a37748f3621452f57f68ac3714870e2bfd0a0`

---

## Files changed

- `content/courses/shapes-shares-g2/lessons/ssg2-02-01.json` — `ch1` redesigned (see diff above).
- `content/courses/shapes-shares-g2/lessons/ssg2-02-02.json` — `ch1` redesigned (see diff above).
- `reports/closure/cowork-staging/laneA-s329-PGF.jsonl` — 2 new signed dispositions (new file).
- `reports/closure/S329_PROGRESSION_PGF.md` — this report (new file).

No other file was read for write purposes, and no file outside this lane's 20-lesson scope was edited.
(`content/courses/shapes-shares-g2/lessons/ssg2-03-01.json` shows as modified in `git status` at the
time of this report — that change is **not** this lane's; `ssg2-03-01` is outside this lane's 20-lesson
scope, was never read or written by this lane, and its diff is an unrelated MCQ-label edit consistent
with another concurrent agent's work on the same course.)

## Gate results

| Gate | Result |
|---|---|
| `npm run validate:content` | **1840/1840 files clean** (both edited files included, ✓) |
| `npm run lint:pedagogy` | **1711/1711 files clean** (both edited files included, ✓) |
| Live PROGRESSION detector (own port, matches `consolidate-pending-workload-s236.mjs` exactly), all 20 lessons | Matches CSV exactly pre-edit; both edits confirmed to drop `ch1` from their lesson's `number-normalized-prompts` list post-edit |
| `npx vitest run src/lib/session130.grid-read.test.ts src/lib/session264.shapesSharesG2P0Integrity.test.ts src/lib/session297.shapesSharesG2ChoiceParity.test.ts src/lib/session244.flagshipVisualPacketB.test.ts` | **4 files, 73/73 tests pass** (post-fix; the first-draft `numeric`-widget redesign of `ssg2-02-02`/`ch1` failed `session130` 4/5 tests before being revised — see Category C) |
| JSON validity, both edited files | clean |
| `reviewBasisHash` cross-check, all 18 unedited lessons | **18/18 match S327's recorded hash exactly** — independent, cryptographic confirmation that no unedited lesson in this lane's scope has drifted since S327's read |

`npm test`, full `vitest`, whole-project `tsc --noEmit`, and `npm run build` were **not** run, per the
container constraint (2 CPU / 7 GB, shared with concurrent work) — all verification above ran through
the two named fast gates plus four targeted, narrowly-scoped `vitest` files.

## Disposition ledger

Written to `reports/closure/cowork-staging/laneA-s329-PGF.jsonl` (append-only staging, **not** merged
into the main ledger by this lane): **2 records**, one per lesson actually edited
(`s329-PGF-ssg2-02-01`, `s329-PGF-ssg2-02-02`), both `decision:"KEEP"` per the closure schema's
convention (i.e. "this queue row's underlying content defect is now resolved"), `reviewedBasisHash` set
to each lesson's fresh post-edit hash. The other 18 lessons in this lane's scope were not edited and
therefore do not receive a fresh disposition from this lane — each already carries a valid, current
(hash-matching) signed KEEP from `S327` (`laneA-s327-PG3.jsonl` / `-PG5.jsonl` / `-PG6.jsonl`), which
this lane's independent re-read confirms rather than duplicates.

## Summary

| Outcome | Count | Lessons |
|---|---|---|
| KEEP, verified independently, no edit (Category A) | 16 | `ssg2-02-03`, `gf-03-03`, `gf-05-02`, `kc-01-03`, `kc-05-01`, `ti-03-01`, `ti-03-02`, `as-04-01`, `asv-03-01`, `cn-05-02`, `ee-05-01`, `fna-03-02`, `g4p-01-01`, `pp-04-02`, `tg-05-01`, `tse-01-02` |
| Already redesigned by a prior session, reverified — one step KEEP, one step already fixed (Category B) | 2 | `as100-03-04` (k2 KEEP / ch1 already fixed), `tf-02-02` (k2 KEEP / ch1 already fixed) |
| Redesigned in this session (Category C) | 2 | `ssg2-02-01` (ch1), `ssg2-02-02` (ch1) |
| **Total** | **20** | |
