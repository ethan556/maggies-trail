# S327 — Assessor A2 full portfolio review: radicals-and-exponents (12/12 lessons)

Reviewer: cowork-s327-A2-assessor. Course: `radicals-and-exponents`, all 12 lessons
(`rad-01-01`…`rad-04-03`). This is the first-ever full review disposition for these lessons —
no prior `lesson-disposition` record existed for any of them before this pass.

Method per lesson: read the complete lesson JSON; recomputed every widget's math in node
one-offs; checked every `commonErrors`/`numericErrors`/MCQ-option feedback for literal,
misconception-specific truth against the actual drawn numbers; checked every remedial against
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` R1–R6 (byte/normalized prompt
distinctness against **every** widget-bearing step in the lesson, not just k1; payload
distinctness; no answer given away in the injected concept immediately before its check);
checked every `figure` id against `src/components/figureIds.ts` (registration) and against its
component body in `src/components/figures.tsx` (truthful depiction of the bound step); checked
MCQ option-label lengths for a correctness-correlated tell; read language for HS-Algebra-1 fit.

`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` carries `VISUAL_FIRST_REPRESENTATION` and
`GRADE_LANGUAGE_REVIEW`/`LESSON_COMPLETE_DISPOSITION` rows for all 12 `rad-0*` lessons but **no**
`LESSON_PROGRESSION_AND_DUPLICATION` or `CHOICE_SURFACE_INTEGRITY` row for any of them — confirmed
by grep before starting, so there was no exclusive-owner file to cross-fix under step 2 of the
assignment.

---

## Course-wide finding: every remedial failed the S316 distinctness standard

All 12 lessons share one `remedials[0]` keyed to the lesson's single shared `conceptTag`, and
**all 12**, as authored, violated S316-R:

- **10/12** (`rad-01-01`, `rad-01-02`, `rad-01-03`, `rad-02-01`, `rad-02-02`, `rad-02-03`,
  `rad-03-01`, `rad-03-02`, `rad-03-03`, `rad-04-02`) either restated another widget-bearing
  step's prompt byte-for-byte (R1/R2) or had `remedial.concept.body` state the check's exact
  numeric answer immediately before asking it (R6), and six of those did **both** at once
  (`rad-01-01`, `rad-01-02`, `rad-01-03`, `rad-02-01`, `rad-02-02`, `rad-04-02`).
- `rad-03-01`, `rad-03-02`, `rad-03-03`, `rad-04-01` had no literal duplicate step prompt but
  had the concept restate the check's own worked answer (R6).
- `rad-04-03` restated neither in its own concept, but its check replayed the lesson's own
  flagship opening example ((0,0)→(3,4)=5, taught in `c1` prose and drilled to full reveal in
  `i1`) rather than the `(1,2)→(4,6)` instance its own remedial concept had just taught —
  diagnostically worthless even though it clears the literal string tests.

Fix applied uniformly (S316 Shape α — route/representation shift, fresh numbers, same widget
family, traps recomputed and reverified distinct from the answer and each other): rewrote
`remedials[0].check.widget` in all 12 lessons with a fresh instance of the same conceptTag skill,
in a prompt template not used by any other widget-bearing step in that lesson, using numbers not
stated anywhere in that remedial's own `concept.body`. `remedials[0].concept` was left byte-for-byte
untouched everywhere (authored prose, per S316 §1.4 — not to be rewritten by a worker) except that
its untouched wording is now never immediately followed by a check asking for the exact fact it
just stated. Every new prompt was checked against every existing widget-bearing step's prompt
(`i1`–`i3`, `k1`–`k3`, `ch1`, and any `predict.prompt`) in its lesson with the exact S255
`normalized()` function before being accepted — full collision table below, then per-lesson
detail. All new numbers, answers, and traps were recomputed and cross-checked in node
(see per-lesson sections); no trap collides with its answer or its sibling trap in any of the 12.

```
rad-01-01: no collision -- new normalized: "a coach lines up players in a square formation with # players total. how many players are in each row?"
rad-01-02: no collision -- new normalized: "a scientist measures a sample as √# grams. simplified, that's a√# grams. what is a?"
rad-01-03: no collision -- new normalized: "a wire is cut to length √# meters, simplified as a√#. what is the coefficient a?"
rad-02-01: no collision -- new normalized: "two garden hoses measure #√# meters and #√# meters. what is their combined length, as a√#?"
rad-02-02: no collision -- new normalized: "a rectangular sticker measures √# inches by √# inches. what is its area in square inches?"
rad-02-03: no collision -- new normalized: "a researcher checks a formula by computing √# times itself. what is √# · √#?"
rad-03-01: no collision -- new normalized: "a square poster has area # square inches. using exponents, its side length is #^(#). what is that side length?"
rad-03-02: no collision -- new normalized: "a signal's amplitude multiplies by #^(#) after two boosts. what is that factor?"
rad-03-03: no collision -- new normalized: "a spring's tension multiplies by #^(#) each time it's stretched. what is that factor, as a fraction?"
rad-04-01: no collision -- new normalized: "a triangular sail has legs # and # meters. what is the length of its longest edge, the hypotenuse?"
rad-04-02: no collision -- new normalized: "a tent's frame forms a right triangle with legs # and # feet. what is c² for its diagonal support, before taking the root?"
rad-04-03: no collision -- new normalized: "two sensors on a warehouse ceiling sit at (#) and (#), in meters. what is the straight-line distance between them?"
```

Note on `rad-04-01`: its as-authored remedial prompt ("A right triangle has legs 3 and 4. What is
the hypotenuse c?") was not a literal duplicate of `k1`'s ("A right triangle has legs 6 and 8. What
is the hypotenuse?") — normalized they differ only by a trailing "c" — but it was a clear R6
violation (its own concept states "legs 3 and 4: c = 5" immediately above) and a near-miss of the
same template k1 already owns, so it was replaced under the same rule rather than left as a
technical pass.

---

## Other defects found and fixed (not the remedial pattern)

1. **`rad-03-01` `i2` — arithmetic-convention bug.** Trap value `49` for "243 ÷ 5" broke the
   course's own floor-division convention used consistently in four other analogous traps in this
   same lesson and in `rad-01-01` (`49÷2→24`, `121÷2→60`, `169÷2→84`, `625÷4→156` — all floors).
   `243 ÷ 5 = 48.6`, floor `48`, not `49`. Fixed: `49 → 48`.
2. **`rad-03-02` `k2` — trap doesn't catch its own narrated value.** The prompt has Ravi state
   `9^(3/2) = 13.5` (`9 × 3/2 = 13.5` exactly), but the coded trap value was the integer `14`. The
   evaluator (`src/lib/evaluate.ts`, `exactNumberLab`/`numeric` case) matches
   `Math.abs(entry.value - entered) <= tolerance` with `tolerance: 0`, and the widget's `<input
   type="number">` accepts decimal entry (`src/components/widgets.tsx:4677`) — so a learner who
   types exactly what the prompt tells them Ravi wrote (`13.5`) would silently miss the
   "repeats Ravi's mistake" diagnosis and fall through to the generic fallback. This is the only
   decimal value quoted in any prompt across all 12 lessons. Fixed: `14 → 13.5`.
3. **`rad-02-02` `c1` — figure depicts the wrong operation.** `radical-factor` (component
   `RadicalFactor`, `src/components/figures.tsx:8510`) is hard-coded, title and all, to
   "`√72 = √36 · √2 = 6√2`" — factoring *one* radical to extract a perfect square. `rad-02-02`'s
   `c1` teaches *multiplying two separate radicals* (`√2 · √3 = √6`, `√2 · √8 = √16 = 4`); the
   number 72 never appears anywhere in this lesson. The same figure is correctly bound in
   `rad-01-02`'s `c1`, whose text is the literal √72 example — this is a copy-paste onto the wrong
   lesson's `c1`, never caught by `S268` (which audited `rad-01-01/01-03/02-03/03-01/03-02/03-03`
   but not `rad-02-02`). No registered figure matches `c1`'s actual content (`rad-multiply` and
   `rad-multiply-then-simplify` are already correctly, exactly bound to this lesson's `c2`/`c3`
   worked examples). Fixed by fail-closing: removed the `figure` key from `c1`, matching the S268
   precedent for exactly this situation (`rad-01-01:c1`, `rad-01-03:c1`, `rad-02-03:c1` are all
   fail-closed for the same reason). `c1` is immediately followed by `i1`, a full interactive
   `areaModel` lab that builds the 2×8 rectangle and visually proves `√2·√8=√16=4`, so removing the
   false static figure does not leave the concept without visual support.
4. **`rad-03-03` `i2`/`i3` — MCQ option length is a 100%-consistent correctness tell.** In every
   MCQ in this lesson (`i2`, `i3`, and the original remedial), the correct answer is a unit
   fraction (`1/5`, `1/3`) and both distractors are bare/negative integers — so the correct answer
   is always the visually longest option, exploitable without doing the exponent math. The
   lesson's own graded checks (`k1`, `k2`, `k3`, `ch1`) already avoid this by using `fractionEntry`
   (construct the fraction, no visible options to compare) — a materially better format for this
   exact content. Fixed `i2`/`i3` by resharpening the sign-flip distractor to also be fraction-shaped
   (`-5` → `-1/5`, `-3` → `-1/3`), which is a *more precise* isolation of the "negative exponent
   means a negative result" misconception (previously that option conflated negating **and**
   forgetting to reciprocate) and removes the length correlation. New remedial uses
   `fractionEntry` (matching `k1`–`ch1`) rather than `mcq`, sidestepping the issue at the source.

---

## Per-lesson dispositions

### rad-01-01 — Perfect Squares & Square Roots — **KEEP** / SUFFICIENT / FIT

Recomputed every claim: `7²=49`, `8²=64`, `11²=121`, `13²=169`; largest perfect-square factor of
20 is 4 (divisors 1,2,4,5,10,20; squares 1,4), of 18 is 9 (divisors 1,2,3,6,9,18; squares 1,9), of
50 is 25 (50=2×5²) — all correct, all traps (halving-floor: 24, 60, 84; doubling: 98, 242, 338;
non-square factors 2/6 and 10/5) correctly computed and none collide with their answer or each
other. Every `commonErrors`/`numericErrors` feedback names the actual wrong operation
("√49 isn't 49 ÷ 2", "That's 49 × 2") using the drawn numbers — genuinely diagnostic, not generic.
Question jobs progress across the lesson: direct evaluation (i1) → error-diagnosis MCQ-free catch
(k1, "Nadia halved") → context application (i2, area→side length) → factor-finding method (k2) →
riddle/transfer framing (k3) → second error-diagnosis in the factor-finding sub-skill (ch1) — real
variety, not repeats. Figures `rad-between` (c2) and `rad-largest-factor` (c3) are registered and
their SVG `<title>` text matches their concept prose exactly; `c1` has no figure, which is S268's
own prior, correct fail-closed call (`radical-factor` would show the unrelated √72 example) and is
backed by two full interactive widgets (i1, i2) immediately around it. No MCQ widgets in this
lesson, so no option-length concern applies. Language is precise, HS-Algebra-1-appropriate,
consistent register throughout.

**Fixed**: `remedials[0].check.widget` was byte-identical to `i1`'s widget (same prompt "What is
√49?", same answer 7, same trap values 24/98, only the feedback wording changed) *and*
`remedials[0].concept.body` stated "√49 = 7" immediately before the check asked for it — a double
S316 violation (R1/R2 and R6). Rewrote the check to a fresh instance of the same skill (square
formation of 36 players → 6 per row), verified against every other widget prompt in the lesson (no
collision), traps recomputed (18 = 36÷2 floor, 72 = 36×2, both distinct from the answer 6 and each
other) and reverified in node. `remedials[0].concept.body` left untouched.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-01-01.json`.
reviewBasisHash (post-fix): `6742979d77f1836d6dc86e0ed258934cc1e403f5c8de23b9584a851024889375`

### rad-01-02 — Simplifying with Factors — **KEEP** / REQUIRED / FIT

Recomputed every worked example and check: 72=36·2→6√2, 50=25·2→5√2, 48=16·3→4√3, 175=25·7→5√7,
162=81·2→9√2 — all correct, every MCQ distractor correctly diagnosed (root-not-taken, e.g.
"√36=6, not 36"; coefficient/radicand swap). All three concept steps carry a figure
(`radical-factor`, `rad-simplify-50`, `rad-pull-largest`) and each is registered and, checked
against its `figures.tsx` SVG `<title>`, an exact match to that step's own worked numbers — this
lesson is fully and correctly figured, and the visual (a highlighted box around the extracted
perfect square) is doing real work depicting the factor-extraction relationship, not decoration.
Question jobs progress: recognition MCQ, numeric coefficient-read, worked extension, radicand-read,
"why pull the largest" reasoning, application MCQ, fresh numeric, diagnostic peer-mistake MCQ,
word-problem application — real variety.

**Fixed**: `remedials[0].check.widget.prompt` ("Simplified, √72 = a√2. What is the coefficient a?")
was byte-identical to `k1`'s widget prompt, and `remedials[0].concept.body` states "√72 = √36 · √2
= 6√2" immediately above it — double S316 violation (R1/R2 and R6). Rewrote to a fresh instance
(√98 sample, a scientist-measurement context not used elsewhere in the lesson; 98 = 49·2, a = 7),
verified no normalized-prompt collision against any other widget in the lesson, traps recomputed
(49 = didn't-root, 2 = radicand/coefficient confusion) and reverified distinct from the answer and
each other. Also improved `i2`'s `10`-trap feedback, which previously just restated the correct
method without naming the wrong operation (divide-by-coefficient-instead-of-by-the-square) that
actually produces 10 — now names it explicitly, consistent with the diagnostic standard used
throughout the rest of the lesson.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-01-02.json`.
reviewBasisHash (post-fix): `a9ce31498623287d69b1ff40b6f0ce3dd73a9ec4a1e04cc054bfc7126835a405`

### rad-01-03 — Fully Simplified Form — **KEEP** / SUFFICIENT / FIT

Recomputed all worked math: 12=4·3→2√3, 2√8=2·2√2=4√2, 45=9·5→3√5, 28=4·7→2√7, 2·27→2·3√3=6√3,
245=49·5→7√5 — all correct. Every MCQ distractor is a correctly diagnosed real mistake (root not
taken, outside coefficient dropped, outside coefficient multiplied by the wrong factor). `c2`
(`rad-coefficient`) and `c3` (`rad-final-form`) figures are registered and match their concept text
exactly; `c1` has no figure, which is S268's own prior correct fail-closed call (`radical-factor`
shows the unrelated √72 example), backed by two interactive MCQs (i1, i2) around it. MCQ option
lengths checked across all 5 MCQs in this lesson: mixed/inconsistent (sometimes tied, sometimes the
simplified-form answer happens to be shorter, which is inherent to two of these items literally
asking "which is fully simplified" — not a reliable length-only shortcut, unlike the pattern found
in `rad-03-03`). Question jobs progress: recognition, numeric computation, application MCQ,
diagnostic peer-mistake catch, two word-problem applications — real variety.

**Fixed**: `remedials[0].check.widget.prompt` was byte-identical to `k1`'s ("Simplified, √12 = a√3.
What is a?"), and `remedials[0].concept.body` states "√12 = 2√3" immediately above it — double S316
violation. Rewrote to a fresh instance (√52 wire-length context; 52 = 4·13, a = 2), verified no
normalized-prompt collision against any other widget in the lesson, traps recomputed (4 =
didn't-root, 13 = radicand/coefficient confusion) and reverified distinct from the answer and each
other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-01-03.json`.
reviewBasisHash (post-fix): `306625503323d5078d778bf6012da8cb35a9aa13e86aa27b289407d90b796a94`

### rad-02-01 — Adding & Subtracting Like Radicals — **KEEP** / REQUIRED / FIT

Recomputed every check: 2+5=7, 6-2=4, 5+3=8, √50=5√2→5+1=6 (Mateo's mistake correctly caught),
√32=4√2→4+1=5 — all correct. Traps consistently model add-vs-multiply confusion and
radicand-for-coefficient confusion with feedback naming the actual numbers. All three concepts are
figured (`like-radicals`, `rad-like-radicals`, `rad-simplify-first`), all registered and, checked
against `figures.tsx`, exact matches to each step's own worked example. Only MCQ in the lesson
(`i2`) has balanced option lengths (8/7/9, correct is not the tell). Question jobs progress: direct
add, direct subtract (different widget engine), concept-recognition MCQ, simplify-then-combine
computation, contextual application (ladders), diagnostic peer-mistake catch (Mateo), transfer
application (hiking trail) — strong variety.

**Fixed**: `remedials[0].check.widget.prompt` ("2√3 + 5√3 = a√3. What is a?") was byte-identical to
`i1`'s widget, and `remedials[0].concept.body` states "2√3 + 5√3 = 7√3" immediately above it —
double S316 violation. Rewrote to a fresh instance (two garden hoses, 6√7 + 3√7 = 9√7), verified no
normalized-prompt collision against any other widget in the lesson, traps recomputed (18 =
multiplied-not-added, 7 = radicand/coefficient confusion) and reverified distinct from the answer
and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-02-01.json`.
reviewBasisHash (post-fix): `80a176db012c34313d6e9d8cfecf36709767c9f2d1f14eb8fa8367a867a3c530`

### rad-02-02 — Multiplying Radicals — **KEEP** / SUFFICIENT / FIT

Recomputed every check: 2·8=16→4, 3·12=36→6, 2√3·4√2=8√6, √6·√2=√12=2√3, 7·28=196→14,
3√2·2√5=6√10, √10·√15=√150=5√6 — all correct. `i1`'s `areaModel` lab (build a 2×8 rectangle, predict
before building) is a strong, genuinely interactive treatment of "two irrational factors can
multiply to a whole number."

**Fixed (3 defects in this lesson)**:
1. `c1`'s figure `radical-factor` is hard-coded (title and SVG both) to "√72 = √36 · √2 = 6√2" —
   factoring *one* radical, the wrong operation entirely for a concept about *multiplying two
   radicals* (√2·√3=√6, √2·√8=√16=4). The number 72 never appears anywhere in this lesson; this
   figure is correctly bound in `rad-01-02`'s `c1` (whose text is the literal √72 worked example)
   and looks like a copy/paste onto the wrong lesson, missed by S268 (which audited
   `rad-01-01/01-03/02-03/03-01/03-02/03-03` but not this lesson). No registered figure matches
   `c1`'s actual content — `rad-multiply` and `rad-multiply-then-simplify` are already correctly,
   exactly bound to this lesson's own `c2`/`c3`. Fixed by fail-closing (removed the `figure` key
   from `c1`), matching the S268 precedent; `i1`'s interactive area-model lab immediately following
   `c1` already carries real visual weight for this exact fact.
2. `i2`'s second trap (value `16`) had feedback that didn't match its own value — it read "Only
   the outside numbers make the coefficient... The 6 is the radicand," which explains why `6`
   (already the *other* trap's value, from adding 2+4) would be wrong, not why `16` would be.
   Rewrote to name what actually produces 16 — doubling the correct coefficient (`8 × 2`), the
   same doubling-misconception pattern used correctly dozens of times elsewhere in this course.
3. `remedials[0].check.widget.prompt` ("√3 · √12 = ?") was byte-identical to `k1`'s, and
   `remedials[0].concept.body` states "√3 · √12 = √36 = 6" immediately above it — double S316
   violation. Rewrote to a fresh instance (a √3-by-√27-inch sticker's area; 3·27=81, √81=9),
   verified no normalized-prompt collision against any other widget in the lesson, traps recomputed
   (30 = added-not-multiplied, 81 = stopped-before-root) and reverified distinct from the answer and
   each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-02-02.json`.
reviewBasisHash (post-fix): `c83d0a3efb1c37eb1e336b812ceb6961ccfd3625488b80e6eb5b9592961e61ca`

### rad-02-03 — Distributing Radicals — **KEEP** / SUFFICIENT / FIT

Recomputed every check: √2·(√3+√5)=√6+√10, 6·6=36→6, 3·(3+12)=9+36→3+6=9, 20·5=100→10,
2·(6+2)=12+4→2√3+2, 2·6=12→2√3, 27·3=81→9, 14·21=294→7√6, 3√2·√6=3√12=6√3 — all correct, escalating
in complexity toward `ch1` which combines distribution, simplification, and an outside coefficient
in one item. `c2` (`rad-distribute`) and `c3` (`rad-combine-after`) figures are registered and match
their concept text exactly; `c1` has no figure, S268's own prior correct fail-closed call
(`like-radicals` teaches addition of like radicals, not distribution), backed by a diagnostic MCQ
(`i1`) with real per-option feedback. Only MCQ in the lesson (`i1`) has balanced-enough lengths
(8/7/7, correct longest by one character, single instance — not a pattern).

**Fixed**: `remedials[0].check.widget.prompt` ("√6 · √6 = ?") was byte-identical to `k1`'s. (The
remedial's own concept discusses a different fact — distributing √2·(√3+√5) — so this was an R1/R2
violation, not R6.) Rewrote to a fresh instance (√11 · √11, framed as a researcher checking a
formula), verified no normalized-prompt collision against any other widget in the lesson, traps
recomputed (121 = stopped-before-root, 22 = added-not-multiplied) and reverified distinct from the
answer and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-02-03.json`.
reviewBasisHash (post-fix): `7f2732ecc364f2fa140368e79af228d7163e99cee4a792f47213437f6e452d95`

### rad-03-01 — Roots as Exponents — **KEEP** / REQUIRED / FIT

Recomputed every evaluation: 16^(1/2)=4, 27^(1/3)=3, 81^(1/4)=3, 243^(1/5)=3, 32^(1/5)=2,
625^(1/4)=5, 1000^(1/3)=10, 49^(1/2)=7, 216^(1/3)=6 — all correct. Two distinct, correctly
diagnosed misconceptions are targeted across the checks (divide-by-the-root-index, and
square/cube-instead-of-rooting — Oscar's and Talia's mistakes are different errors, not the same
trap repeated). `c1`/`c2` share `rad-denom-root` (a generic `a^(1/n)=ⁿ√a` formula figure, truthful
for both since both steps teach the same general rule), `c3` has `rad-perfect-power` (exact match
to its own 32^(1/5)=2 example) — all registered, all correctly matched, all three concepts figured.
No MCQ widgets in this lesson.

**Fixed (2 defects)**:
1. `i2`'s trap value `49` for "243 ÷ 5" broke this course's own floor-division convention, used
   consistently in four other analogous traps in this lesson and in `rad-01-01` (49÷2→24, 121÷2→60,
   169÷2→84, 625÷4→156, all floors). 243÷5 = 48.6, floor 48, not 49 — verified in node. Fixed:
   `49 → 48`.
2. `remedials[0].check.widget.prompt` ("What is 16^(1/2)?") is not a literal duplicate of another
   widget's prompt, but `remedials[0].concept.body` states "16^(1/2) = √16 = 4" (and also "27^(1/3)
   = ∛27 = 3") immediately above it — R6 violation, the check gives away its own answer one
   sentence earlier. Rewrote to a fresh instance not stated in the concept (64^(1/2), a square-poster
   area→side-length context), verified no normalized-prompt collision against any other widget in
   the lesson, traps recomputed (32 = halved-not-rooted, exact since 64/2=32; 128 = wrong-direction
   doubled) and reverified distinct from the answer and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-03-01.json`.
reviewBasisHash (post-fix): `bc4915cbcff376428cdf88e9995f78e8bf7efd3139385b72aad9548ff104a680`

### rad-03-02 — The Power/Root Combo — **KEEP** / REQUIRED / FIT

Recomputed every evaluation: 16^(3/4)=8, 27^(2/3)=9, 64^(2/3)=16, 32^(3/5)=8, 9^(3/2)=27,
25^(3/2)=125, 125^(2/3)=25, 27^(4/3)=81 (new remedial) — all correct. Two distinct misconceptions
are diagnosed (multiplying the base by the fraction instead of root-then-power, and stopping after
only the root step — Ravi's and Layla's mistakes are genuinely different). `c1`/`c3` share
`rad-read-fraction` (generic "numerator=power, denominator=root" figure, truthful for both — `c3`'s
own text nearly paraphrases the figure's title), `c2` has `rad-power-root` (exact match to its own
27^(2/3)=9 example) — all registered, all correct, all three concepts figured. No MCQ widgets.

**Fixed (2 defects)**:
1. `k2` narrates "Ravi says 9^(3/2) = 13.5, since he just multiplied 9 by 3/2" (9×3/2 = 13.5
   exactly) but the coded trap value was the integer `14`. Traced the evaluator
   (`src/lib/evaluate.ts` `exactNumberLab`/numeric case: `Math.abs(entry.value - entered) <=
   tolerance` with `tolerance: 0`) and the input (`src/components/widgets.tsx:4677`, a plain
   `<input type="number">` that accepts decimal entry) — a learner who types exactly the value the
   prompt tells them Ravi wrote, `13.5`, would silently miss the "repeats Ravi's mistake"
   diagnostic and fall through to the generic fallback. This is the only decimal value quoted in a
   prompt anywhere across all 12 lessons. Fixed: `14 → 13.5`.
2. `remedials[0].check.widget.prompt` ("What is 8^(2/3)?") is not a literal duplicate of another
   widget's prompt, but `remedials[0].concept.body` states "8^(2/3): ∛8=2, then 2²=4" immediately
   above it — R6 violation. Rewrote to a fresh instance not stated in the concept (27^(4/3)=81, a
   signal-amplitude context), verified no normalized-prompt collision against any other widget in
   the lesson, traps recomputed (3 = stopped-at-root-only, 36 = 27×4/3 exactly — no decimal-mismatch
   repeat of defect 1) and reverified distinct from the answer and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-03-02.json`.
reviewBasisHash (post-fix): `e0363b3097fd1e4c543c9a45f338531892c512481df8c451dd618a5695b0c1e2`

### rad-03-03 — Negative Rational Exponents — **KEEP** / REQUIRED / FIT

Recomputed every evaluation: 8^(-1/3)=1/2, 25^(-1/2)=1/5, 9^(-1/2)=1/3, 81^(-3/4)=1/27,
32^(-3/5)=1/8, 27^(-2/3)=1/9, 36^(-1/2)=1/6 (new remedial) — all correct. `c1`/`c2` share
`rad-neg-rational` (generic `a^(-m/n)=1/(ⁿ√a)^m` formula figure — `c1`'s own example is the m=1
special case of the same formula, a defensible foreshadowing use, not a false claim), `c3` has
`rad-sign-side` (exact match) — all registered, all three concepts figured. `k1`/`k2`/`k3`/`ch1`
already use `fractionEntry` (build the fraction; no visible options to compare), which is a
materially better format than MCQ for this content.

**Fixed (3 defects)**:
1. `i2` and `i3` MCQs: in every MCQ in this lesson (these two plus the original remedial), the
   correct answer was a unit fraction and both distractors were bare/negative integers, so the
   correct answer was *always* the visually longest option — a 100%-consistent, exploitable
   correctness tell that has nothing to do with actually evaluating the exponent. Resharpened the
   sign-flip distractor in both to also be fraction-shaped (`-5→-1/5`, `-3→-1/3`), which is also a
   *more precise* isolation of the "negative exponent flips the sign, not just the number" mistake
   (previously it conflated negating with also forgetting to reciprocate) and removes the length
   correlation (new lengths 3/4/1, correct no longer uniquely longest).
2. `remedials[0].concept.body` states "8^(−1/3): ∛8 = 2, then flip to 1/2" immediately above a
   check asking "What is 8^(-1/3)?" — R6 violation.
3. The remedial's own MCQ inherited the same length-tell as (1) (`1/2` vs `-2`/`2`).
   Rewrote the check as a `fractionEntry` widget (matching `k1`–`ch1`'s own, better-designed format,
   sidestepping the length-tell at the source) testing a fresh instance not stated in the concept
   (36^(-1/2) = 1/6, a spring-tension context), verified no normalized-prompt collision against any
   other widget in the lesson, traps mirror `k1`'s exact shape (whole 6 negated = sign-confusion;
   whole 6 positive = forgot-to-reciprocate) and were reverified distinct from the answer and each
   other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-03-03.json`.
reviewBasisHash (post-fix): `5b20d88952ec057eca8bffcda96b74049d2e4611acbc1160ef42200297ee7564`

### rad-04-01 — The Pythagorean Theorem — **KEEP** / REQUIRED / FIT

Recomputed every triple: 3-4-5 (c1 example), 6-8-10, 12-35-37, 13²-5²=12² (missing leg), 7-24-25,
15²-9²=12² (missing leg), 20-21-29, 8-15-17 (new remedial) — all correct, all verified in node.
Both jobs (find-the-hypotenuse and find-a-missing-leg) are covered with distinct, correctly
diagnosed traps (added-legs-instead-of-squares; stopped-at-c²-without-rooting). `c1`
(`right-triangle`, a generic a²+b²=c² diagram), `c2` (`rad-pythagorean`, exact match to its own
5-12-13 example), `c3` (`rad-missing-leg`, exact match) — all registered, all correct, all three
concepts figured, reinforced by a `distanceGrid` placement+prediction interactive (`i1`) and three
`geometricConstraintLab` multi-stage guided-exploration widgets (`k1`, `k2`, `k3`, `ch1` all
require 4 explored stages before checking). No MCQ widgets.

**Fixed**: `remedials[0].check.widget.prompt` was not a literal duplicate of `k1`'s (which uses
legs 6, 8), but `remedials[0].concept.body` states "legs 3 and 4: c = √(9+16) = √25 = 5"
immediately above a check asking "A right triangle has legs 3 and 4. What is the hypotenuse c?" —
a direct R6 violation, and (3,4)→5 is also `c1`'s own opening worked example, restated a third
time. Rewrote to a fresh, previously-unused primitive triple (8-15-17, a triangular-sail context),
verified no normalized-prompt collision against any other widget in the lesson, traps recomputed
(23 = added-legs-not-squares, 289 = stopped-before-root) and reverified distinct from the answer
and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-04-01.json`.
reviewBasisHash (post-fix): `0f5d5b9eff5313c3244723f11c97160dc7532e616d8552bf69b732bece3adb80`

### rad-04-02 — When the Answer is a Radical — **KEEP** / REQUIRED / FIT

Recomputed every triple: legs 2,2→c²=8=2√2; 2,4→c²=20=2√5; 1,2→c²=5=√5 (square-free, already
simplified); 4,5→c²=41; 4,4→c²=32=4√2; 5,10→c²=125=5√5; new remedial 3,5→c²=34 — all correct,
verified in node. `c1` (`right-triangle`), `c2` (`rad-radical-answer`, exact match to its own
legs-2,4 example), `c3` (`rad-already-simplified`, exact match to its own legs-1,2 example) — all
registered, all correct, all three concepts figured. MCQ option lengths across the 5 MCQs in this
lesson are mixed (correct is sometimes longest, sometimes tied, and in `ch1` the correct answer
`5√5` is *shorter* than the wrong `√125`) — not a reliable, exploitable pattern the way `rad-03-03`
was, so not flagged. Question jobs progress: recognition MCQ, staged c²-only computation (`k1`,
building toward the full skill), worked concept, word-problem application, "already simplified"
recognition, second staged c²-only computation, diagnostic peer-mistake catch (Kenji left `√32`
unsimplified), transfer word-problem.

**Fixed**: `remedials[0].check.widget.prompt` ("For legs 2 and 2, what is c² (before the root)?")
was byte-identical to `k1`'s widget prompt, and `remedials[0].concept.body` states "legs 2 and 2:
c²=8" immediately above it — double S316 violation (R1/R2 and R6). Rewrote to a fresh pair not used
elsewhere in the lesson (legs 3, 5 → c²=34, a tent-frame context), verified no normalized-prompt
collision against any other widget in the lesson, traps recomputed (9 = only-one-leg-squared,
matching the original's "only one leg" pattern; 64 = (3+5)², matching the original's
sum-then-squared pattern) and reverified distinct from the answer and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-04-02.json`.
reviewBasisHash (post-fix): `fb2df17c876176de4ae445314e174af77a430a588b7f2bbd0c0b9df1eb1874be`

### rad-04-03 — Distance Between Points — **KEEP** / REQUIRED / FIT

Recomputed every distance: (0,0)-(3,4)→5, (0,0)-(6,8)→10, (1,2)-(4,6)→Δ3,4→5, (2,3)-(6,6)→Δ4,3→5,
(0,0)-(2,2)→2√2, (0,0)-(3,3)→3√2, (5,2)-(5,11)→Δ0,9→9, (3,2)-(9,10)→Δ6,8→10, (1,4)-(13,9)→Δ12,5→13,
new remedial (10,3)-(19,15)→Δ9,12→15 — all correct, verified in node, including the vertical-only
special case (Δx=0) in `k2`. The nested reasoning MCQ inside `i1`'s `cml.explanation` block
(hypotenuse-vs-two-segment-path) is correctly keyed and both option feedbacks are accurate. `c1`
(`right-triangle`), `c2` (`rad-distance-subtract`, exact match), `c3` (`rad-simplify-distance`,
exact match) — all registered, all correct, all three concepts figured, reinforced by a
`distanceGrid` placement+prediction interactive and three `geometricConstraintLab` `coordinateProof`
staged labs. Only MCQ (`i3`) has balanced lengths (3/3/1, correct tied not unique).

**Fixed**: `remedials[0].check.widget.prompt` ("What is the distance from (0,0) to (3,4)?") is not a
literal duplicate of another widget's prompt and its own remedial concept discusses a different pair
((1,2)→(4,6)), so it technically cleared the literal R1/R2/R6 string tests — but (0,0)→(3,4)=5 is
the lesson's own flagship opening example, stated in `c1`'s prose and drilled to a full worked
reveal in `i1` ("(3,4): 3²+4²=25, so the distance is √25=5") before the learner ever reaches a
check. A learner routed to the remedial after failing `k1`/`k2`/`k3`/`ch1` (none of which use this
pair) would be asked the single most-given-away fact in the entire lesson — diagnostically
worthless even though it clears the literal string tests, per S316 §1.1's "diagnostic equivalence,
not literal identity" standard. Rewrote to a fresh pair not used anywhere else in the lesson
((10,3)-(19,15), a warehouse-sensor context; Δx=9, Δy=12, d=15), verified no normalized-prompt
collision against any other widget in the lesson, traps recomputed (21 = added-gaps-not-squared,
225 = stopped-before-root) and reverified distinct from the answer and each other.

Evidence: `content/courses/radicals-and-exponents/lessons/rad-04-03.json`.
reviewBasisHash (post-fix): `378617047acb54d74104788bef610eb21453f0f5023a555331f230f28824eb3c`

---

## Summary

12/12 KEEP, 0 REVISE, 0 ESCALATE. `visualDecision`: 8× REQUIRED (`rad-01-02`, `rad-02-01`,
`rad-03-01`, `rad-03-02`, `rad-03-03`, `rad-04-01`, `rad-04-02`, `rad-04-03` — all fully, correctly
figured), 4× SUFFICIENT (`rad-01-01`, `rad-01-03`, `rad-02-02`, `rad-02-03` — one concept step each
is legitimately unfigured, either a prior S268 fail-close or (rad-02-02) fail-closed in this pass,
each backed by a strong interactive on the same step). `gradeLanguageDecision`: 12× FIT.

No `LESSON_PROGRESSION_AND_DUPLICATION` or `CHOICE_SURFACE_INTEGRITY` row existed for any of these
12 lessons in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (confirmed by grep), so there was no
exclusive-owner cross-fix to perform under step 2 of the assignment.

Fixes landed, by class:
- **12/12 remedials rewritten** for S316 R1/R2/R6 violations (see course-wide finding above) —
  every lesson's single remedial now tests a fresh instance of its conceptTag skill that (a) does
  not collide, byte-for-byte or digit-normalized, with any other widget-bearing step's prompt in
  its lesson (verified programmatically against all 12 in the final file state), (b) is not stated
  as a worked answer anywhere in its own `remedials[0].concept.body`, and (c) carries traps
  recomputed and reverified distinct from the answer and from each other. `remedials[0].concept`
  left byte-for-byte untouched in all 12 (authored prose, not a worker's to rewrite per S316 §1.4).
- **2 arithmetic/evaluator bugs** fixed: `rad-03-01` `i2` (243÷5 floor-convention mismatch, 49→48)
  and `rad-03-02` `k2` (a trap that couldn't be triggered by literally typing the value the prompt
  itself narrates, 14→13.5).
- **1 figure-truthfulness defect** fixed: `rad-02-02` `c1`'s `radical-factor` figure depicted an
  unrelated worked example from a different lesson; fail-closed (removed) rather than left
  misleading, matching the S268 precedent for this exact situation.
- **1 MCQ answer-adjacency defect** fixed: `rad-03-03` `i2`/`i3` had a 100%-consistent
  option-length tell (correct answer always the visually longest); resharpened one distractor per
  widget to remove it while also sharpening the misconception it names.
- **2 feedback-clarity improvements**: `rad-01-02` `i2`'s and `rad-02-02` `i2`'s weakest trap
  feedback strings, previously generic or referencing the wrong value, rewritten to name the actual
  wrong operation.

All 12 lesson JSON files validated as parseable JSON after editing; all 12 `reviewBasisHash` values
in the ledger were re-derived from `scripts/session/print-review-basis.mjs` against the final
on-disk state and confirmed to match exactly (no drift between what was scored and what shipped).


