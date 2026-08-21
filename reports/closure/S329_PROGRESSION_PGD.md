# S329 Progression Packet PG-D — LESSON_PROGRESSION_AND_DUPLICATION (24 lessons, 6 courses)

Reviewer: S329 Lane A progression/duplication reviewer (packet PG-D). Contract: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
rows `PROGRESSION-<lessonId>` (workstream `LESSON_PROGRESSION_AND_DUPLICATION`, all P1 / `repeatedTemplates`-only)
for the 24 lessons below, across `exponents-scientific-notation`, `arrays-even-odd-g2`, `long-division-g5`,
`radical-functions`, `shapes-measure-g1`, and `sampling-and-probability`.

**Method.** Every `PROGRESSION-*` row's `mismatch_evidence` was reproduced before touching any file, using a
scratch detector (`/tmp/.../scratchpad/detect.mjs`) that replicates the consolidator's own logic verbatim
(`scripts/audit/consolidate-pending-workload-s236.mjs:358-393`: per-lesson widget-bearing steps,
`duplicate-widgets` = identical widget JSON, `exact-prompts` = byte-identical `widget.prompt`,
`number-normalized-prompts` = prompts equal after `.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g,"#").replace(/\s+/g," ")`).
All 24 rows reproduced exactly against the CSV. Each lesson was read in full and judged against
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`'s R1–R6 non-duplication standard (R1 distinct prompt,
R2 distinct number-normalized template, R3 distinct full payload, R4 not reproducible by the same declared
variant generator, R5 traps recomputed from the actual printed numbers, R6 no answer-leakage) — applied here
by analogy to repeats *within* a lesson's own steps, since R1–R6's literal text targets remedial-vs-main-step
pairs. Two outcomes: **(a) KEEP** — the repeat is deliberate, evidence-backed spaced practice, escalation, or
a pinned regression, left untouched; or **(b) redesign** — one flagged step's action, representation,
misconception target, constraint, or transfer demand was changed (never just its numbers) while preserving
mathematical correctness. Where (b) fires, only the flagged (later-occurring) step was edited; the earlier,
unflagged instance the detector treats as canonical is left untouched. Post-edit, the detector was re-run on
the file and the flagged step confirmed absent from `number-normalized-prompts`. Two redesigns (`sp-02-01`
k1/k2 and `sp-02-03` k2) needed a second pass: an initial attempt that changed only the numbers, keeping the
literal sentence, did **not** clear the flag — digit-normalization masks numerals, not surrounding wording —
so the sentence itself had to be reworded.

**Result: 12 of 24 lessons redesigned (one step each, except `sp-02-01` and `esn-03-02` at two steps each — 14
steps total); 12 of 24 lessons kept fully as-is.** No lesson outside this 24-lesson set was touched.

## Gates run and results

- `npm run validate:content` (schema): **1840/1840 files clean**, repo-wide, after all edits.
- `npm run lint:pedagogy`: **1711/1711 files clean**, repo-wide, after all edits.
- `npx vitest run src/lib/session270.exponentsScientificNotationCourse.test.ts src/lib/session274.shapesMeasureG1Course.test.ts src/lib/session274.samplingProbabilityCourse.test.ts src/lib/session286.arraysEvenOddG2Progression.test.ts` — **4 files / 10 tests, all pass.** These pin, respectively: `esn-03-02`'s step-ID order and c1/c2 body text (both untouched by this packet); `smg1-04-02`'s step-ID order, per-step widget-type sequence, and c1 body text (untouched); a full-course `widgetIntegrityErrors`/`lintLesson` sweep of every `sampling-and-probability` lesson (covers all four edited lessons in that course); and `arrays-even-odd-g2`'s `i2` content pin for all 10 course lessons via `expectedSecondJobs` (covers `g2a-01-01`, `g2a-01-03`, `g2a-01-04`, `g2a-02-01`).
- `npx vitest run src/lib/session310.radicalFunctionsChoiceParity.test.ts src/lib/session265.longDivisionG5Course.test.ts` — **2 files / 8 tests, all pass.** Session310 pins an MCQ contract hash on `re-05-02:k3` (untouched by this packet) plus a full-course schema parse (covers `re-02-01`). Session265 pins `i2` content for all 6 `long-division-g5` lessons via `.toContain()` (covers `g5l-01-01`, `g5l-01-02`, `g5l-02-01`, `g5l-03-02`, all fully KEEP).
- `npx vitest run src/lib/variants.resolver.test.ts` — **14/17 pass, repo-wide.** The 3 failures are pre-existing and entirely outside this packet's scope (`ep-02-03/k2` in `exponents-polynomials`, and `k100-02-05/k3` twice in an unrelated course) — no lesson in this packet's 24 appears in any failure. Run specifically to verify every `variant` tag kept or removed in this packet's edits still satisfies the resolver contract (generator exists, form implemented, generated widget type matches the declared widget type).
- Detector re-run on every edited file, individually, after every edit: see per-lesson sections below; all edited lessons show the specific flagged step(s) absent from the post-edit `number-normalized-prompts` list.
- No `tsc --noEmit`, `npm test`/full `vitest`, or `npm run build` was run, per the container-resource constraint.

Disposition records: **12 new records**, one per redesigned lesson, written to
`reports/closure/cowork-staging/laneA-s329-PGD.jsonl` (new file; not appended to the main ledger), each
`recordId` prefixed `s329-PGD-<lessonId>`, `decision: KEEP`, `reviewedBasisHash` derived via
`node scripts/session/print-review-basis.mjs` after all edits landed. Untouched lessons carry no new
disposition, per the task's instruction.

---

# exponents-scientific-notation

## esn-01-03 — KEEP, no edit

Flagged: `i2` (dup of `k1`; both `placeValueTransformLab` widgets templated `"# written as a digit times a
power of ten is:"`). `k1` = 4,000 → 4×10³ (whole number, **positive** exponent). `i2` = 0.007 → 7×10⁻³
(decimal, **negative** exponent) — the lesson's own positive/negative place-value contrast; `i2`'s body
("Write a small decimal...") and its distractor set (a "7×10³, positive exponent gives a big number, not a
small decimal" trap) target sign confusion that `k1`'s distractors (only "one power too many" / "not standard
form") never test. Legitimate KEEP; no edit made.

## esn-02-02 — redesign (k2)

Flagged: `i2`, `k2` (both dup of `k1`; all three `"which value solves x³ = #?"`). `k1` (x³=27, positive) vs
`i2` (x³=−8, negative, mcq) is KEEP — the lesson's positive/negative cube-root contrast (c2: negatives cubed
stay negative), and `i2`'s distractors target sign-drop/±-both-work/no-real-solution misconceptions `k1` never
tests. `k2` (body "Another negative cube.") was a genuine third near-identical instance — its traps were a
strict subset of `i2`'s. Redesigned:

```
BEFORE k2: body "Another negative cube."
  widget.prompt: "Which value solves x³ = −27?"
  tokens: x=−3 (correct) / x=3 / "or"
  commonBuilds: [x=3]→"3³=27(positive), not −27"; [x=3,or,x=−3]/[x=−3,or,x=3]→"only −3 works, 3³ gives +27"

AFTER k2: body "A cube equation with an extra step."
  widget.prompt: "Which value solves (x+1)³ = −27?"
  tokens: x=−4 (correct) / x=−3 / x=2 / "or"
  commonBuilds: [x=−3]→"that's x+1=−3, still isolate x: −3−1=−4, not −3"
                [x=2]→"drops the sign: (2+1)³=27, not −27; x+1 must be −3, giving x=−4"
                [x=−4,or,x=2]/[x=2,or,x=−4]→"cube equations don't need ±: (2+1)³=27, not −27 — only x=−4 works"
```

Adds a linear-equation isolation step on top of the same cube-root fact — genuinely different transfer demand.
Verified: (−4+1)³=(−3)³=−27; (2+1)³=27≠−27. `variant {gen:"root-solve",form:"cubeNegative"}` kept — the
generator always emits a `buildExpression` widget for this form regardless of the numbers drawn (only the
widget-TYPE match is contractually required). Detector re-run: `[i2]` remains (accepted KEEP); `k2` cleared.

## esn-03-01 — redesign (i3)

Flagged: `i3` (dup of `k1`; both `"# in scientific notation is:"`). `i3` (body "One more conversion.") was a
fourth bare large-number conversion, already covered in kind by `k2`. Redesigned by shifting the ACTION from
producing to diagnosing:

```
BEFORE i3: body "One more conversion."
  widget.prompt: "9,300,000 in scientific notation is:"
  options: 9.3×10⁶(correct) / 9.3×10⁵ / 93×10⁵ / 0.93×10⁷

AFTER i3: body "Spot the flaw in someone else's conversion."
  widget.prompt: "A city's population is 6,400,000. A student writes this as 64 × 10⁵.
                  What's the flaw, and what should it be?"
  options: "coefficient must be under 10 — should be 6.4×10⁶" (correct)
           "exponent should be 6, but 64 can stay as the coefficient" (wrong: 64×10⁶=64,000,000≠6,400,000)
           "nothing is wrong — 64×10⁵ is valid scientific notation"
```

Verified: 64×100,000=6,400,000=6.4×10⁶ (same value, standard form); 64×10⁶=64,000,000 (a genuinely
different, false value). No `variant` tag on `i3` (none originally). Detector re-run: `[]` — fully cleared.

## esn-03-02 — redesign (i3, k3)

Flagged: `i3`, `k3` (three-way dup with `k1`, all `"# in scientific notation is:"` — 0.000000091 / 0.0000002 /
0.05). All three also independently carried the identical sign-confusion trap, so `k3`'s own body claim
("Distinguish which direction the exponent goes") did not actually differentiate it. Both redesigned:

```
BEFORE i3: body "A tiny decimal."
  widget.prompt: "0.0000002 in scientific notation is:"
  options: 2×10⁻⁷(correct) / 2×10⁷ / 0.2×10⁻⁶ / 2×10⁻⁶

AFTER i3: body "Check a classmate's conversion for the flaw."
  widget.prompt: "A science project measures a value at 0.0000004. A classmate writes this as 0.4 × 10⁻⁶.
                  What's the flaw, and what should it be?"
  options: "coefficient must be at least 1 — should be 4×10⁻⁷" (correct)
           "exponent should be −7, but 0.4 can stay" (wrong: 0.4×10⁻⁷=0.00000004≠0.0000004)
           "nothing is wrong — 0.4×10⁻⁶ is valid"
```

Mirrors the sibling large-number lesson's `i3` fix (this packet, `esn-03-01`) with a coefficient-too-SMALL
flaw for direction symmetry. Verified: 0.4×10⁻⁶=0.0000004=4×10⁻⁷; 0.4×10⁻⁷=0.00000004 (genuinely
different value).

```
BEFORE k3: body "Distinguish which direction the exponent goes."
  widget.prompt: "0.05 in scientific notation is:"
  tokens: 5(correct)/×/10⁻²/10²/10⁻¹/0.5
  commonBuilds: [5,×,10²]→"that's 500, needs NEGATIVE exponent"; [5,×,10⁻¹]→"needs 2 places, not 1";
                [0.5,×,10⁻¹]→"coefficient must be ≥1"

AFTER k3: body "A number just barely under 1."
  widget.prompt: "A number is just a little less than 1: 0.9. Write it in scientific notation."
  tokens: 9(correct)/×/10⁻¹/10⁰/10¹/0.9
  commonBuilds: [9,×,10⁰]→"10⁰=1, so 9×10⁰=9 not 0.9 — even this close to 1, still needs the exponent"
                [9,×,10¹]→"positive exponent gives 90, not 0.9"
                [0.9,×,10⁰]→"0.9 isn't a valid coefficient, and 10⁰ means no shift happened at all"
```

Retargets a misconception NONE of the three colliding steps covered: the near-1 boundary confusion (a decimal
just under 1 tempting a "no shift needed" answer). Verified: 0.9 needs exactly one decimal-place shift;
9×10⁰=9≠0.9; 9×10¹=90≠0.9. `variant {gen:"sci-notation",form:"small"}` on `k3` kept — the generator's
"small" form always emits `buildExpression` regardless of the decimal chosen. Pinned test
(`session270.exponentsScientificNotationCourse.test.ts`) locks only step-ID order and c1/c2 body text — both
untouched. Detector re-run: `[]` — fully cleared.

---

# arrays-even-odd-g2

## g2a-01-01 — redesign (ch1)

Flagged: `i2`, `k2`, `ch1` (all dup of `i1`; all `oddEvenPairs` bare `"Is # odd or even?"`). `i2` and `k2` are
KEEP, backed by the pinned regression `src/lib/session286.arraysEvenOddG2Progression.test.ts`, which locks
`i2`'s exact `widget.prompt` across all 10 course lessons via `expectedSecondJobs` — a deliberate,
signed, course-wide design (immediate bare-number retrieval practice), out of scope to change here. `ch1`
(body "One more, for the road.") was a genuine fourth bare instance, same number (18) as `i1` itself.
Redesigned:

```
BEFORE ch1: body "One more, for the road."
  widget.prompt: "Is 18 odd or even?"
  oddFeedback: "18 pairs up completely (9 pairs, 0 left). No leftover means even."
  successFeedback: "Yes — 18 makes 9 pairs with none left over."

AFTER ch1: body "Apply the test to a real problem, not just a bare number."
  widget.prompt: "Maggie picked 18 leaves to lay along a nature trail, two leaves at every step, with none
                  left over. Pair up the leaves: is 18 odd or even?"
  oddFeedback: "18 leaves pair up completely (9 pairs, 0 left over) — Maggie CAN lay them all down two at a
               step. No leftover leaf means even, not odd."
  successFeedback: "Yes — 18 leaves make 9 pairs with none left over, so Maggie can lay out the whole trail
                    evenly."
```

Same number (18), same answer (even) — only representation/transfer demand changes (bare number → applied
scenario). "Maggie" confirmed via repo-wide grep (23 files) as an established recurring word-problem
character. No `variant` tag on `ch1`. Detector re-run: `[i2,k2]` remains (both accepted, pinned-test-backed
KEEPs); `ch1` cleared.

## g2a-01-03 — KEEP, no edit

Flagged: `i2` (dup of `i1`; both `oddEvenPairs` "Pair up # counters. Odd or even?"). `i1`=16→even,
`i2`=12→even — both on the `g2a-doubles-even` concept's warm-up pair. Pinned verbatim by
`session286...test.ts`'s `expectedSecondJobs["g2a-01-03"]` (`"Pair up 12 counters. Odd or even?"`, `answer:
"even"`) — the same deliberate course-wide i1→i2 retrieval pattern protected across all 10 lessons in this
course. KEEP; no edit made.

## g2a-01-04 — KEEP, no edit

Flagged: `i2` (dup of `i1`; both `oddEvenPairs` "Pair up # counters. Odd or even?"). `i1`=18→**even**,
`i2`=13→**odd** — the two instances deliberately test opposite branches of the same widget (the `oddFeedback`
path at `i1`, the `evenFeedback` path at `i2`), not merely different numbers. Pinned verbatim by
`session286...test.ts`'s `expectedSecondJobs["g2a-01-04"]` (`"Pair up 13 counters. Odd or even?"`, `answer:
"odd"`). KEEP; no edit made.

## g2a-02-01 — KEEP, no edit

Flagged: `i2` (dup of `i1`; both `tapDiagram` widgets over the same 4×3 grid, "Tap the counter in row #, column
#."). `i1`=row 2/col 3, `i2`=row 3/col 1 — same course-wide i1→i2 second-instance pattern, this time on a
different widget type (`tapDiagram`, not `oddEvenPairs`), still pinned verbatim by
`session286...test.ts`'s `expectedSecondJobs["g2a-02-01"]` (`type: "tapDiagram"`, `prompt: "Tap the counter in
row 3, column 1."`, `correct: ["r3c1"]`). KEEP; no edit made.

---

# long-division-g5

All four lessons in this course were read in full and judged fully KEEP; **zero edits**. `i2`'s content is
pinned verbatim (via `.toContain()`) for all 6 course lessons by `src/lib/session265.longDivisionG5Course.test.ts`'s
`expectedI2Prompts` map, which independently protects the `i2` half of every collision below.

## g5l-01-01 — KEEP, no edit

Flagged: `i2`, `ch1` — two separate collisions, not one chain. `i1`/`i2` both `"# ÷ # — slide to estimate the
quotient before dividing."` (`i2` = "714 ÷ 21", pinned by session265). `k1`/`ch1` both
`"estimating # ÷ #, which pair of compatible numbers helps most?"` — `ch1`'s body explicitly says "Round DOWN
this time," an explicit, labeled contrast against `k1`'s case (opposite rounding direction when choosing a
compatible-number pair) — a genuine, stated distinguishing skill, not filler. KEEP both; no edit made.

## g5l-01-02 — KEEP, no edit

Flagged: `k3` (dup of `k2`; both `"compute # ÷ # — dividing by a multiple of ten."`, 340÷20 vs 600÷40). `i1`/`i2`
do NOT collide despite similar structure, because their spelled-out multiplier words differ ("hop by
thirties" vs "hop by forties" — the detector's digit-regex does not touch number-words). `k3`'s own
`explanationVariants` state its purpose explicitly: "Not just 20 — any multiple of ten splits the same way" —
a deliberate generalization check (prove the method isn't a fluke of one specific divisor), reusing the same
two misconception traps (drop-the-extra-zero, ignore-the-other-digit) against a different multiple of ten and
without a `variant` tag (hand-authored specifically for this purpose, unlike `k2`). KEEP; no edit made.

## g5l-02-01 — KEEP, no edit

Flagged: `i2` (dup of `i1`; both partial-quotients "Count # ÷ # in batches: build 20 groups, then # more, then
the total."). `i2` = "672 ÷ 28," pinned verbatim by session265. Same course-wide i1→i2 pattern as the rest of
this course. KEEP; no edit made.

## g5l-03-02 — KEEP, no edit

Flagged: `i2` (dup of `i1`; both "Quotient #, divisor #, remainder # — slide to the dividend it rebuilds.").
`i2` = "Quotient 18, divisor 27, remainder 13," pinned verbatim by session265. Same course-wide i1→i2 pattern.
KEEP; no edit made.

---

# radical-functions

## re-01-01 — KEEP, no edit

Flagged: `k3` (dup of `k1`; both `buildExpression` "Write x^(#/#) as a radical."). `k1` = x^(2/7), a general
power/root pair (body "Exponent to radical"). `k3` = x^(1/4), the **unit-fraction** special case (body "Unit
fraction shortcut") — c2 explicitly calls this out as its own rule ("a unit fraction drops the power entirely:
x^(1/2)=√x"), and `k3`'s token/trap set is structurally different (tests the wrong-root-index "√" distractor
and warns against dividing x/4, neither present in `k1`). KEEP; no edit made.

## re-02-01 — redesign (ch1)

Flagged: `k1`, `ch1` (both dup of `i1`; the lesson's bare "Simplify and rationalize a/√b" `buildExpression`
drill template). `k1` is KEEP — ordinary fluency retrieval with its own radicand/numerator pairing ahead of
the challenge tier. `ch1` (body "Full pipeline.") was, as authored, a purely numeric drill functionally
identical in kind to `k1` and `i1`, despite being the graded challenge tier that should escalate rather than
repeat. Redesigned:

```
BEFORE ch1: prompt "Simplify and rationalize 9/√27."
  tokens: √3(correct)/3/9√27/27/√27//
  correct: [√3]
  three commonBuilds traps about 9/√27; missFeedback/successFeedback: 9/(3√3)=3/√3=√3
  variant {gen:"a2-radicals", form:"re-rationalize__buildExpression"}

AFTER ch1: prompt "Simplify and rationalize 3x/√(9x) (for x > 0)."
  tokens: √x(correct)/x/3/3x√(9x)/9x//
  correct: [√x]
  commonBuilds: [x]→"3x/√(9x) reduces to x/√x, but that still has a radical — rationalize once more: x/√x=√x"
                [3x√(9x)/9x]→"rationalized without simplifying √(9x)=3√x first, which collapses to x/√x
                              before you ever need to rationalize"
                [3]→"the 3s do cancel, but the x doesn't vanish — it becomes part of the final root: √x"
  variant unchanged {gen:"a2-radicals", form:"re-rationalize__buildExpression"}
```

Introduces a variable — the same simplify-then-rationalize pipeline now requires first recognizing
√(9x)=3√x, a genuinely different transfer demand and the lesson's natural challenge-tier escalation.
Verified by hand: 3x/√(9x) = 3x/(3√x) = x/√x = (x√x)/x = √x for x>0. Widget type
(`buildExpression`) and `variant` both unchanged — no resolver-test exposure. Also checked
`reports/closure/S320_ASSESS_A2.md`'s existing, unrelated general-quality KEEP disposition for this lesson —
confirmed no conflict. Detector re-run: `[k1]` remains (accepted KEEP); `ch1` cleared.

## re-03-01 — KEEP, no edit

Flagged: `k1` (dup of `i1`; both `"for f(x) = √x, what is f(#)?"`). `i1` (f(49)=7, body "Evaluate on the
curve.") is bare procedural fluency with purely computational distractors (÷2, squaring-instead-of-rooting).
`k1` (f(9)=3, body "The principal root.") is the lesson's FIRST test of its actual novel conceptual content —
its distractors are "±3" and "−3", targeting the "a function returns ONE value; √ picks only the nonnegative
root" misconception that is this lesson's central point (c2) and that `i1` never touches at all. KEEP; no
edit made.

## re-05-02 — KEEP, no edit

Flagged: `i2`, `k3` (both dup of `k1`; all three `"how many real solutions does x^(#/#) = #?"`). This is a
deliberate 2×2 design (numerator parity × target sign), not an accidental triple-ask: `k1` = x^(2/5)=4, **even
numerator, positive target → two solutions** (the base case). `i2` = x^(3/5)=8, body explicitly "Odd
numerator control case" — **odd numerator, positive target → one solution**, a stated scientific-control
contrast testing c2's rule directly. `k3` = x^(2/3)=−4 — **even numerator, negative target → no real
solutions**, the boundary case the recap's own takeaway states verbatim ("Even-numerator powers can never
equal a negative: no solution"). Three genuinely distinct cells of the same 2×2 matrix. KEEP both; no edit
made.

---

# shapes-measure-g1

## smg1-01-01 — redesign (ch1)

Flagged: `ch1` (dup of `k3`; both mcq `"which shape has # sides and # corners?"`). `k3` = 3-3/triangle is
KEEP (the dedicated check paired with c1's own worked triangle example). `ch1` (body "Name the 6-6 shape.")
was a fourth instance of the same naming-quiz job (after `k3`, `i2`'s hexagon-counting, `i3`'s
pentagon-counting, and c2's own hexagon-naming). Also found a latent authoring/generator mismatch: `ch1`'s
declared `variant {gen:"g1-shapes-measure", form:"Smg1ShapeSidesMcq"}` could never have reproduced its own
"hexagon" answer — `src/lib/g1Variants.ts` shows that generator/form only ever draws from {triangle, circle}.
Redesigned:

```
BEFORE ch1: widget {type:"mcq", prompt:"Which shape has 6 sides and 6 corners?",
                     options:[hexagon(correct), pentagon, rectangle]}
  variant {gen:"g1-shapes-measure", form:"Smg1ShapeSidesMcq"}

AFTER ch1: widget {type:"numeric", prompt:"A shape has 7 sides. How many corners does it have?",
                    answer:7, tolerance:0,
                    commonErrors:[{6,"count again — 7 sides means 7 corners, not 6"},
                                  {8,"7 sides means 7 corners, not one more"}]}
  variant field removed (no existing generator/form covers a 7-sided case; type changed mcq→numeric)
```

Changes the ACTION from shape-NAMING (recall a name, restricted to the four specifically-taught shapes) to
numeric TRANSFER (apply the sides=corners invariant to an unnamed 7-sided shape) — explicitly the deeper,
generalizable claim the lesson's own recap already makes. Detector re-run: `[]` — fully cleared.

## smg1-04-01 — redesign (k3)

Flagged: `i2`, `i3`, `k2`, `k3`, `ch1` (all dup of `k1`; six-instance bare `"set the clock to show #:00."`
clockSet sequence). `i3` (12:00, coincident hands) and `ch1` (11:00, hour/minute-hand adjacency right next to
12) are KEEP — each targets a genuinely distinct visual/perceptual discrimination. `i2` (10:00) and `k2`
(5:00) are KEEP on a softer but legitimate broad-fluency-coverage basis. `k3` (body "One more clock.") was the
weakest-justified instance. Redesigned:

```
BEFORE k3: body "One more clock."
  widget.prompt: "Set the clock to show 9:00."
  successFeedback: "Yes — hour hand at 9, minute hand at 12, means 9:00."

AFTER k3: body "A clock in a story."
  widget.prompt: "Maggie's class starts at 9 o'clock. Set the clock to show when class starts."
  successFeedback: "Yes — hour hand at 9, minute hand at 12, means 9:00, exactly when Maggie's class starts."
```

Same clock fact (9:00), only representation/transfer demand changes (bare instruction → applied scenario); no
clockSet-mechanics changes needed. Detector re-run: `[i2,i3,k2,ch1]` remains (four accepted KEEPs of varying
strength); `k3` cleared.

## smg1-04-02 — redesign (k3)

Flagged: `i2`, `i3`, `k2`, `k3`, `ch1` — the lesson's parallel half-past sequence (structured identically to
`smg1-04-01` but for :30 times). This file is individually pinned by
`session274.shapesMeasureG1Course.test.ts` (step-ID order and a c1 body substring, "minute hand points
straight down to 6") — confirmed untouched. `ch1` (12:30) is KEEP: the genuine case where this lesson's own
"use the smaller number" hour-reading heuristic breaks (12:30 reads the hour as 12, the LARGER neighboring
number). `i2` (5:30), `i3` (11:30), `k2` (1:30) are KEEP on the same broad-fluency basis as their `smg1-04-01`
counterparts (`i3` here is less sharply distinguished than its sibling lesson's `i3`, since 11→12 doesn't
break the "smaller number" rule the way `ch1`'s 12→1 case does). `k3` was the weakest-justified. Redesigned:

```
BEFORE k3: body "Half past eight."
  widget.prompt: "Set the clock to show 8:30."
  successFeedback: "Yes — hour hand between 8 and 9, minute hand at 6, means 8:30."

AFTER k3: body "A clock in a story."
  widget.prompt: "Maggie's family eats dinner at half past 8. Set the clock to show dinner time."
  successFeedback: "Yes — hour hand between 8 and 9, minute hand at 6, means 8:30, exactly when Maggie's
                    family eats dinner."
```

Mirrors the `smg1-04-01/k3` fix for structural consistency across this closely-parallel lesson pair. Detector
re-run: `[i2,i3,k2,ch1]` remains (four accepted KEEPs); `k3` cleared.

## smg1-04-03 — KEEP, no edit

Flagged: `k1`, `i2`, `i3`, `k2`, `k3`, `ch1` — **all six** non-anchor widget-bearing steps, every one a bare
`"set the clock to show #:#."` clockSet instance. This is the course's own explicit "On the Hour or Half
Past?" discrimination lesson: interleaving on-the-hour and half-past instances across every step IS the
stated lesson objective, traced literally in each step's body text — `i1` "Which kind is this?" (on-hour),
`k1` "Now half past.", `i2` "On the hour again.", `i3` "Half past two.", `k2` "On the hour once more.", `k3`
"Half past ten.", `ch1` "Both types in a row." (12:00, the hardest case — both hands point to 12 at once).
c1's very first line ("Check the minute hand first") and the recap both make the ABAB interleaving the
lesson's entire point. KEEP, all six; no edit made.

---

# sampling-and-probability

## sp-02-01 — redesign (k1, k2)

Flagged: `k1`, `i2`, `i3`, `k2`, `k3` (all dup of `i1`; the bare `"Group A has a mean of #. Group B has a mean
of #..."` `distributionCompareLab` template). `i2` (zero gap, tied to c2), `i3` (large gap, tied to c3), and
`k3` (reversed mean order, the order/sign-independence misconception) are KEEP — each anchored to a specific
concept step or a misconception untested elsewhere. `k1` and `k2` (both body "Another gap-in-units
measurement.") were genuine misses. A first attempt (numbers only) did not clear the detector flag; reworded
in a second pass:

```
BEFORE k1: prompt "Group A has a mean of 27. Group B has a mean of 15. The variability measure is 3.
                    How many variability-units apart are the means?"
  meanA:27, meanB:15, variability:3, answer:4
AFTER k1: prompt "Two classes' project scores average 34 and 20 points, with a variability measure of
                   4 points. How many variability-units apart are the class averages?"
  meanA:34, meanB:20, variability:4, answer:3.5 (a non-whole-number gap, previously untested by any widget)

BEFORE k2: prompt "Group A has a mean of 65. Group B has a mean of 50. The variability measure is 5.
                    How many variability-units apart are the means?"
  meanA:65, meanB:50, variability:5, answer:3
AFTER k2: prompt "Two gardens' plant heights average 19 and 15 centimeters, with a variability measure of
                   just 1 centimeter. How many variability-units apart are the garden averages?"
  meanA:19, meanB:15, variability:1, answer:4 (variability=1, tests whether the division step still happens)
```

Verified: (34−20)÷4=3.5; (19−15)÷1=4. `variant` tags (`spGapForwardA`/`spGapForwardB`) kept — widget type
unchanged throughout, and the `g7-sp-gap-units` generator's own "units" design space was confirmed (read
`src/lib/variants.ts`) to already include decimal answers, validating the non-whole-number case as
stylistically appropriate. Detector re-run: `[i2,i3,k3]` remains (three accepted KEEPs); `k1,k2` cleared.

## sp-02-02 — redesign (i3)

Flagged: `i3`, `k3` (both dup of `i2`; the same bare gap-in-units template). `k3` is KEEP — a deliberate
numeric callback reusing `i2`'s own gapUnits=4 value in judge-mode (interpretation) rather than compute-mode,
a genuinely different action. `i3` (body "Measure another moderate gap.") was the genuine miss:

```
BEFORE i3: prompt "Group A has a mean of 36. Group B has a mean of 24. The variability measure is 4.
                    How many variability-units apart are the means?"
  meanA:36, meanB:24, variability:4, answer:3
AFTER i3: prompt "Two teams' practice times average 26 and 20 minutes, with a variability measure of
                   5 minutes. How many variability-units apart are the team averages?"
  meanA:26, meanB:20, variability:5, answer:1.2
  successFeedback: "...just over the 'near 1' threshold where heavy overlap starts to fade into real
                     separation."
```

Lands right at the lesson's own "near 1" overlap/separation threshold — a boundary case not otherwise tested.
Verified: (26−20)÷5=1.2. Detector re-run: `[k3]` remains (accepted KEEP); `i3` cleared.

## sp-02-03 — redesign (k2)

Flagged: `i2`, `i3`, `k2` (all dup of `i1`). `i2` (near-zero gap, tied to c2) and `i3` (a fourth real-world
domain — factories — tied directly to this lesson's own stated purpose, title "...in Real Situations," c1
listing running-clubs/farms/schools as interchangeable contexts for the same technique) are KEEP. `k2` (body
"Another real-world gap-in-units problem.," despite the name never actually delivering a context wrapper) was
the genuine weak link:

```
BEFORE k2: prompt "Group A has a mean of 56. Group B has a mean of 32. The variability measure is 8.
                    How many variability-units apart are the means?"
  meanA:56, meanB:32, variability:8, answer:3
  variant {gen:"g7-sp-gap-units", form:"spGapRealA"}
AFTER k2: prompt "Two bakeries' weekly bread sales average 32 and 56 loaves, with a variability measure of
                   8 loaves. How many variability-units apart are the bakery averages?"
  meanA:32, meanB:56 (order reversed), variability:8, answer:3
  successFeedback: "...regardless of which bakery's average is listed first."
  variant field removed
```

Reworded into a bakery context AND reversed the mean order to test the order/sign-independence misconception
(the same one already validated at `sp-02-01/k3`, this packet). Verified: (56−32)÷8=3. `variant` removed:
read the generator source and confirmed neither existing form (`spGapRealA` = always bare, `spGapRealB` =
"fitness centers" context but never reversed) reproduces this new reversed+contextual combination. Detector
re-run: `[i2,i3]` remains (two accepted KEEPs); `k2` cleared.

## sp-03-01 — redesign (k3)

Flagged: `k3` (dup of `i3`; both bare mcq `"a probability of # describes an event that is..."`). A prior wave
(lane PG5, session s327; `reports/closure/S327_FIX_PG5.md` / `laneA-s327-PG5.jsonl`) already reviewed this
row and recorded KEEP ("different landmark points on the likelihood scale") — valid evidence, but a KEEP
disposition alone does not close a mechanized queue row, so it remained open. New evidence found here: `k3`'s
own declared variant generator (`src/lib/variants.ts`'s `g7-sp-likelihood-words`, form `spLikelihoodCertain`)
already generates scenario-grounded prompts at replay time (e.g. "The probability of rolling a number from 1
through 6 on a standard six-sided die is 1..."), never the bare text `k3` was hard-authored with. Redesigned:

```
BEFORE k3: prompt "A probability of 1 describes an event that is..."
  options: certain(correct) / impossible / unlikely

AFTER k3: prompt "A bag holds only red and yellow counters — nothing else. The probability of drawing either
                   a red or a yellow counter is 1. This describes an event that is..."
  options: certain(correct) / likely / impossible
```

Scenario-grounded, in the spirit of the generator's own certain-event list; distractor swapped from
{impossible, unlikely} to {likely, impossible}, sharpening the target to the near-1-vs-exactly-1
("likely" vs "certain") confusion c3's own text explicitly warns about — stricter than the original's
unlikely-vs-certain gap. `variant` kept unchanged (widget type still mcq, matching the generator's output
type); the new content is now more aligned with the generator's own design than the original was. Detector
re-run: `[]` — fully cleared.

---

# Summary table

| Lesson | Course | Flagged (CSV) | Category | Step(s) edited | Remaining flags |
|---|---|---|---|---|---|
| esn-01-03 | exponents-scientific-notation | i2 | KEEP | — | i2 |
| esn-02-02 | exponents-scientific-notation | i2, k2 | redesign | k2 | i2 |
| esn-03-01 | exponents-scientific-notation | i3 | redesign | i3 | (none) |
| esn-03-02 | exponents-scientific-notation | i3, k3 | redesign | i3, k3 | (none) |
| g2a-01-01 | arrays-even-odd-g2 | i2, k2, ch1 | redesign | ch1 | i2, k2 |
| g2a-01-03 | arrays-even-odd-g2 | i2 | KEEP | — | i2 |
| g2a-01-04 | arrays-even-odd-g2 | i2 | KEEP | — | i2 |
| g2a-02-01 | arrays-even-odd-g2 | i2 | KEEP | — | i2 |
| g5l-01-01 | long-division-g5 | i2, ch1 | KEEP | — | i2, ch1 |
| g5l-01-02 | long-division-g5 | k3 | KEEP | — | k3 |
| g5l-02-01 | long-division-g5 | i2 | KEEP | — | i2 |
| g5l-03-02 | long-division-g5 | i2 | KEEP | — | i2 |
| re-01-01 | radical-functions | k3 | KEEP | — | k3 |
| re-02-01 | radical-functions | k1, ch1 | redesign | ch1 | k1 |
| re-03-01 | radical-functions | k1 | KEEP | — | k1 |
| re-05-02 | radical-functions | i2, k3 | KEEP | — | i2, k3 |
| smg1-01-01 | shapes-measure-g1 | ch1 | redesign | ch1 | (none) |
| smg1-04-01 | shapes-measure-g1 | i2, i3, k2, k3, ch1 | redesign | k3 | i2, i3, k2, ch1 |
| smg1-04-02 | shapes-measure-g1 | i2, i3, k2, k3, ch1 | redesign | k3 | i2, i3, k2, ch1 |
| smg1-04-03 | shapes-measure-g1 | k1, i2, i3, k2, k3, ch1 | KEEP | — | k1, i2, i3, k2, k3, ch1 |
| sp-02-01 | sampling-and-probability | k1, i2, i3, k2, k3 | redesign | k1, k2 | i2, i3, k3 |
| sp-02-02 | sampling-and-probability | i3, k3 | redesign | i3 | k3 |
| sp-02-03 | sampling-and-probability | i2, i3, k2 | redesign | k2 | i2, i3 |
| sp-03-01 | sampling-and-probability | k3 | redesign | k3 | (none) |

**Totals: 12 redesigned (14 steps edited), 12 kept as-is.** Every "Remaining flags" entry above is an
intentional, evidence-backed KEEP recorded either in this report's per-lesson rationale or (for `esn-01-03`,
`g2a-01-03`, `g2a-01-04`, `g2a-02-01`, all of `long-division-g5`, `re-01-01`, `re-03-01`, `re-05-02`, and
`smg1-04-03`) as a fully-untouched lesson — the mechanized queue rows for the still-flagged steps stay open by
design, per this workstream's own rule that a KEEP disposition records the judgment but does not itself close
a structural queue row.
