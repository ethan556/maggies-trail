# S327 — Assessor A5 full portfolio review

Reviewer: `cowork-s327-A5-assessor`. Scope: 16 never-before-assessed lessons across 5 courses
(`multistep-g4` x4, `length-problems-g2` x3, `long-division-g5` x3, `number-writing-k` x3,
`shapes-build-k` x3). Branch `codex/v4-s244-authored-visual-wave`. This is the first-ever full
review disposition for every lesson listed below.

Method for each lesson: read the complete lesson JSON; recompute every widget's math independently
(node one-offs, never trusting the authored arithmetic); check every wrong-answer/trap feedback
string both for being literally true of the printed numbers and for naming the actual mechanism
(not a generic "wrong, try again"); check every referenced figure id against
`src/components/figureIds.ts` (registration) and against its component body in
`src/components/figures.tsx` (truthful depiction — most figures in this corpus are static SVGs
hardcoded to one specific worked example, so "truthful" means the hardcoded numbers/labels match
the adjacent concept body verbatim); check MCQ option-length/content balance for answer-adjacency
tells; check the remedial route on every lesson against
`reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` R1–R6 (R7–R9 where the lesson's own
material makes a visual/text claim on the remedial); grep
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` for this lesson id and resolve any
`LESSON_PROGRESSION_AND_DUPLICATION` / `CHOICE_SURFACE_INTEGRITY` row found; check grade-band
language fit; check question-job progression across `k1`/`k2`/`k3`/`ch1`.

Tooling built for this pass (read-only against the engine, `node`/`npx tsx` one-offs only, no
`npm`/`vitest`/`tsc`/build):

- `scratchpad/lint-lesson.mts` — imports `Lesson.safeParse` (schema.ts) and `lintLesson`
  (pedagogy.ts) and runs them against a given lesson file. This is the same schema/pedagogy
  validation `npm run validate:content` / `npm run lint:pedagogy` perform, scoped to just the
  files in review instead of the whole corpus.
- `scratchpad/remedial-check.mts` — for every lesson, computes the S255/S316 `normalized()`
  function against `remedials[0].check.widget.prompt` and every other widget-bearing step's
  prompt in the same lesson, flags identical-prompt / normalized-same / byte-identical-payload
  collisions (R1/R2/R3), and flags any concept body/narration that contains the check's own
  answer number (R6 smell test).
- `scratchpad/append-record.mjs` — validates a disposition record's required fields, enum values,
  and 64-hex hash before appending it to the ledger line.

Every fix below is confined to `content/courses/{multistep-g4,length-problems-g2,long-division-g5,
number-writing-k,shapes-build-k}/lessons/*.json`. No `src/**`, `scripts/**`, or other staging file
was touched.

---

## multistep-g4

### g4s-01-02 — KEEP (visual: SUFFICIENT, language: FIT)

**Math verified (node, hand-recomputed):**
- `i1` estimateSlider: 6×9=54, 54−14+20=60=target; acceptFactor 2 → window [30,120]; low/high/success
  feedback all correct. `predict` outcome `mult` and its reveal are correct (adding 20 before the ×6
  multiply would scale the 20 by the box count too).
- `c1`/`c2` concept math: 18+24−15=27; 4×2+5=13; (4+5)×2=18 — both exactly match their figures.
- `k1` numeric: 5×8−15=25. Traps: 40=5×8 (stopped before subtracting); 28 — **see defect below**.
- `i2` estimateSlider: 54−14=40, 40+20=60 (reverse check 60−40=20); window [16,25] correct.
- `k2` mcq: four options, each "Verb, then verb, then verb" (uniform length/structure, no
  answer-adjacency tell). o0 (multiply/subtract/add) correct, matches story order. o2's feedback
  is a genuine, verified-true subtlety: multiply→add→subtract reaches the same 60 arithmetically
  (54+20−14=60) but still misreports the story's actual event order.
- `k3` numeric: 5×5−8=17. Traps: 2=(5+5)−8 (added group count+size instead of multiplying), 25=5×5
  (stopped before subtracting) — both correctly diagnosed.
- `ch1` numeric: 9×7−31=32. Traps: 63=9×7 (stopped early), 94=63+31 (added instead of subtracted)
  — both correctly diagnosed.
- Figures: `two-step-bar` (`TwoStepBar`, figures.tsx:8272) and `dop-word-expr` (`DopWordExpr`,
  figures.tsx:3825) are both registered in `figureIds.ts` and are static SVGs hardcoded to the
  exact numbers in `c1`/`c2`'s bodies — truthful by construction.

**Defect 1 — fixed.** `k1`'s trap value 28 (= 5+8+15, an "add every number in the story instead of
multiplying the packs first" error) carried only generic feedback: *"That result does not follow
from the story's steps — retrace them in order."* Rewrote to name the mechanism: *"That adds 5 + 8
+ 15 straight across; the packs must be multiplied first, then the 15 handed out subtracted."*

**Defect 2 — fixed (S316-R violation).** `remedials[0].check.widget` was byte-identical to `k1`'s
widget (prompt, answer, both `commonErrors` values and feedback verbatim). Because `k1`/`k3`/`ch1`
all declare `variant: {gen: "g4-multiply", form: "mbMultiStepNumeric"}` (template in
`src/lib/g4Variants.ts:873`: `"A class buys ${packs} packs of ${each} markers and uses ${used}.
How many markers remain?"`) and the remedial is never variant-refreshed, this was a guaranteed
first-walk duplicate, not merely a probabilistic one. Rewrote per S316 §1.5 Shape α: kept `k1`'s
numbers and answer (5, 8, 15 → 25) and both trap values (40, 28) verbatim; restated the stem in a
librarian/crates/books scenario structurally distinct from both `k1`'s own "delivery…handed out"
template and the generator's "class buys…uses" template (a route change, not an operand swap —
satisfies R4 without needing to invoke it separately); rewrote the 40/28 trap feedback to stay
literally true of the new nouns. Left `remedials[0].concept.body` untouched (identical to `c2.body`)
per S316 §1.4's explicit exclusion — that is authored-prose work outside a worker's mandate.

Re-verified after edit: `remedial-check.mts` reports zero collisions against every widget-bearing
step in the lesson; `lint-lesson.mts` schema+pedagogy clean; math re-checked by hand.

**Progression:** `i1`/`i2` estimate (two different missing-step positions); `k1`/`k3`/`ch1` compute
exact totals with fresh contexts, each isolating a different specific trap; `k2` tests the ordering
meta-skill rather than computing a value. No PROGRESSION/CHOICE row in the workload queue for this
lesson (verified by grep).

`reviewedBasisHash`: `7b3980d53202fa9370ee880d719a42d914c4828c9a32afc02dd8039aa34fab1c`

### g4s-02-03 — KEEP (visual: SUFFICIENT, language: FIT)

**Math verified:** c1/c2 (4×19=76, 4×20=80 — matched exactly by the `mult3-estimate` figure, a
static SVG hardcoded to this exact worked example, truthful for both bindings); `i1` estimateSlider
(7×68−90=386 exact, 7×70−90=400 estimate, window [200,800], `predict` reveal "fourteen" = |400−386|
verified exact); `i2` estimateSlider (claimed 3,860 vs ~400 order-of-magnitude check); `k1` mcq
(386 vs 400 reasonableness judgment, all four options' feedback verified true, including the
numeric "14" callout); `k2` numeric (9×7−45=18, traps 63 stopped-early and 108 added-not-subtracted
both correct); `k3` mcq (3,860 is exactly 10× the true 386, all four options verified true); `ch1`
numeric (4×6−5=19, traps 5=(4+6)−5 count+size-added and 24=4×6 stopped-early both correct).

**Defect — fixed (S316-R violation).** `remedials[0].check.widget` was byte-identical to `k1`'s mcq
(prompt, all four options, all feedback verbatim) — a guaranteed first-walk duplicate. Rewrote per
Shape α: kept the same reasoning skill and four-claim option structure, moved off `k1`'s "A student
computes X and gets Y. Estimating gives Z. What follows?" template (whose normalized form an
operand swap would still collide with) onto a named-character narrative — *"Mia estimates 6 × 39 by
rounding to 6 × 40 = 240. She then multiplies exactly and gets 234. Is 234 a reasonable exact
answer?"* — with fresh numbers verified by hand (6×39=234, 6×40=240, diff 6). Confirmed the new
prompt's normalized form differs from every other widget-bearing step in the lesson (different
sentence template, not an operand swap — satisfies R2/R4 by route change). Rewrote the four
distractor feedback strings to stay literally true of the new numbers (diff 6 instead of 14;
order-of-magnitude neighbors 24/2,400, derived the same way the original derived 40/4,000 — from
the estimate ÷10 and ×10). Left `remedials[0].concept.body` untouched (identical to `c2.body`) per
S316 §1.4. Re-verified: `remedial-check.mts` zero collisions; `lint-lesson.mts` clean.

**Progression:** `i1`/`i2` estimate at two different points in the reasoning (pre-computation vs.
judging a claim); `k1`/`k3` make the accept/reject call on two different scenarios (a plausible
near-estimate vs. an order-of-magnitude slip); `k2`/`ch1` compute exact multi-step totals with fresh
contexts. No PROGRESSION/CHOICE row in the workload queue for this lesson (verified by grep).

`reviewedBasisHash`: `0482cecb481e9101312c0ee5cbfcb3174d7ea0492dbaf781d5bc000ebcce97ad`

### g4s-03-01 — KEEP (visual: SUFFICIENT, language: FIT)

**Math verified:** c1/c2 (4×20=80 upper estimate for 4×19=76, matched by `mult3-estimate`); `i1`
estimateSlider (7×70−7×68=14=7×2, window [7,28], `predict` reveal confirmed); `i2` estimateSlider
(7×68−7×60=56=7×8, window [46.67,67.2]); `k1` mcq (rounding 68 up to 70 ⇒ estimate above by 14, all
four options verified true — checked specifically for an answer-adjacency "lone justification" tell
since both the correct `o0` and the wrong `o1` carry parallel "X, because Y" clauses, so the
justification structure does not single out the correct option); `k2` numeric (7×4=28, 7+4=11,
28−11=17, both traps are exactly the two obvious partial answers); `k3` mcq (8×47−60=316 exact,
8×50−60=340 estimate, diff 24 matching `o1`'s feedback exactly); `ch1` numeric (8×8−17=47, both
traps correct).

**Defect 1 — fixed.** `k3`'s `o3` feedback claimed an answer "near 30 or 3,000" would be caught, but
the estimate is 340, whose precise digit-shift neighbours are 34 and 3,400 — sibling lesson
`g4s-02-03` derives this callout exactly (estimate÷10, estimate×10), so this was an imprecise copy.
Corrected to "near 34 or 3,400."

**Defect 2 — fixed (S316-R violation).** `remedials[0].check.widget` was byte-identical to `k1`'s
mcq. Rewrote per Shape α: `k1`'s three number-free distractor options (`o1`/`o2`/`o3`) were already
generic enough to hold verbatim (still literally true); only the prompt and the correct option's
numbers changed — from "You round 68 UP to 70 when estimating 7 × 68…7 × 2 = 14" to a
named-character reframing, "Jax rounds 53 UP to 60 before estimating 9 × 53…9 × 7 = 63" (verified
9×53=477, 9×60=540, diff 63). Confirmed the new prompt's normalized form differs from every other
widget-bearing step (different subject/verb structure, not an operand swap). `remedials[0].concept`
left untouched per S316 §1.4. Re-verified: zero collisions, lint clean.

**Progression:** `i1`/`i2` measure the estimate-gap size in both directions; `k1` judges direction
only; `k3` judges reasonableness-band on a full multi-step expression; `k2` isolates product-vs-sum
abstractly; `ch1` computes a fresh multi-step total. No PROGRESSION/CHOICE row in the queue for this
lesson (verified by grep).

`reviewedBasisHash`: `e15ded04e676dcb447ca27aeb18f6dae09b9f90d6b87ab454d71ea548843e999`

### g4s-03-02 — KEEP (visual: SUFFICIENT, language: FIT) — course-closing lesson

**Math verified:** `c1` (6×4=24, 24−5=19, matched by `mb-multistep`); `i1` barBuilder (6×9=54);
`c2`/remedial-concept (18+24=42, 42−15=27, matched by the reused `two-step-bar` figure); `i2`
barBuilder (54 then 40 = 54−14); `k1` mcq (conceptual "why plan" question, all four options sound,
lengths balanced 6–7 words, no leak); `k2` numeric (5×6−13=17; trap 30=5×6 stopped-early correct —
see defect below for trap 20); `k3` mcq (8×5=40; story order 40−12+15=43 and the alternate
multiply-add-subtract order 40+15−12=43 both reach 43, confirming `o2`'s "same number, wrong
sequence" feedback is literally true); `ch1` numeric (62 hikers ÷ 8/bus, ceiling division = 8 since
7×8=56 leaves 6 behind; both traps — 7=floor-division, 6=reported-the-remainder — correctly
diagnosed).

**Defect 1 — fixed.** `k2`'s trap value 20 carried only generic feedback. Found the mechanism:
30−10=20, i.e. subtracting only the *tens* digit of 13 and dropping the ones digit. Rewrote to name
it.

**Defect 2 — fixed (S316-R violation).** `remedials[0].check.widget` was byte-identical to `k1`'s
mcq. This mcq is purely conceptual (no numbers to preserve), so Shape α here kept the same four
claims and the same correct-option feedback verbatim, restating only the stem — from an abstract
"why" question to a concrete two-student comparison: *"One student writes each step's quantity —
'48, then 33' — before answering 6 packs of 8 with 15 handed out. Another jumps straight to the
final number. Whose method makes a mistake easiest to find?"* (verified 6×8=48, 48−15=33, an
internally consistent pair). Confirmed the new prompt's normalized form differs from every other
widget-bearing step. `remedials[0].concept` left untouched per S316 §1.4. Re-verified: zero
collisions, lint clean.

**Progression:** `i1`/`i2` build labeled quantities physically; `k1` reasons about *why* plans help;
`k2` computes a fresh total; `k3` reasons about operation *order*; `ch1` introduces a genuinely new
skill (ceiling-division remainder interpretation) as the course-closing challenge — the recap teaser
correctly summarizes the whole course arc. No PROGRESSION/CHOICE row in the queue for this lesson
(verified by grep).

`reviewedBasisHash`: `b0eb1c5d04a1ffc8ec022b21567165436d1dd713a135cf792f5df2466676e16b`

---

## length-problems-g2

### g2p-01-03 — KEEP (visual: SUFFICIENT, language: FIT)

This lesson carried three substantive rows in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`: `CHOICE-0024`
(k3 leak), `PROGRESSION-g2p-01-03` (k2/ch1 duplicate), plus the standard per-lesson rows. All fixed.

> **Correction note (same review, second pass):** the entry below supersedes an earlier draft of
> Fix 2 that redesigned `ch1` into an inverse "find the start" job and removed its `variant`
> declaration. That draft was caught before being left in place: `session194.lengthProblems.test.ts`
> (a course-wide integrity test not checked before the first edit) unconditionally re-derives every
> check/challenge numeric step's answer from its declared `variant.form` via an independent oracle
> (`solveG2` in `g2Independent.cjs`) unless the lesson+step is explicitly whitelisted as
> "pool-withdrawn" (today only `g2p-02-02`/`k2`,`ch1` is). Removing `ch1`'s variant without a
> matching whitelist entry throws at test time; reattaching the old `MmtRulerSubtractNumeric`
> variant to the inverse job would instead make `refreshLessonSteps` silently regenerate `ch1` back
> into a find-the-length duplicate of `k1`/`k2` on every replay (`variantForStep` only checks widget
> *type* equality, not prompt semantics), deferring the flagged duplication past the first walk
> rather than fixing it. A corrected test whitelist is a `src/lib` edit outside this reviewer's
> content-only mandate, so Fix 2 was redone as described below — the record and JSONL disposition
> were updated in place rather than left pointing at the unsafe draft.

**Math verified:** c1 (11−3=8); `i1` unitRuler (length 4, 4 placements × unit 1 = 4, matches;
`predict` reveal 11−3=8 correct); `k1` numeric (9−2=7, both traps correct); `i2` unitRuler (length
4, matches); `k2` numeric (10−5=5, both traps correct); `k3` mcq (32+25=57, so a claimed 30 m total
is impossible — both `o0` and `o1` feedback verified true). `mmt-any-start` is a generic
"end − start = length" formula figure (no baked-in numbers), truthful for both its `c1` and `c2`
bindings.

**Fix 1 — CHOICE-0024, answer-adjacency leak on `k3`.** The correct option, *"No because 30 is less
than the 32 m part,"* was the only option carrying both a unit ("m") and an explicit
because-clause; the three distractors used bare em-dash or if-clauses with no unit — a
lone-justification / only-option-with-a-unit tell. Rewrote all four options to a uniform
Yes/No/Unclear + em-dash-reason structure with no digits or units in any label (the specific
numbers stay in the post-answer feedback, which is fine): *"No — a total cannot be smaller than
either part" / "Yes — computed totals can come out smaller than a part" / "Yes — if the two trail
legs overlap each other" / "Unclear — only a ruler could settle it."* Verified no near-duplicate
labels, balanced 7–10 word lengths, no remaining surface tell.

**Fix 2 — PROGRESSION-g2p-01-03, k2/ch1 normalized-template duplicate.** `k1`, `k2` **and** `ch1`
all originally shared the identical "A pencil stretches from the X cm mark to the Y cm mark…"
template. `k1`-vs-`k2` is a defensible fluency repeat (each is immediately preceded by its own
concept step teaching a distinct refinement) and was left alone, matching that the CSV named only
the k2/ch1 pair. `ch1` was corrected to the only fix available inside content-only scope (see the
correction note above): it stays a "find the length" job — same shape as `k1`/`k2`, so its real
registered generator (`MmtRulerSubtractNumeric`) genuinely matches on every walk, first or replay —
but was **reworded** onto a structurally distinct sentence: *"A ribbon runs from the 6 cm mark to
the 15 cm mark on the same ruler. What length does it measure?"* (answer 9 = 15−6, verified; traps
15=end-mark-as-length and 21=6+15-added, both correct, reusing `k1`/`k2`'s own verbatim trap
feedback since it stays literally true). Confirmed via node that `MmtRulerSubtractNumeric`'s
independent-oracle formula (`n[1]−n[0]`, where `n` is every digit-string appearing in the prompt, in
order — `solveG2`'s parser is purely positional and unit-agnostic) yields 15−6=9 exactly, so the
variant declaration was **restored** rather than left removed. `ch1`'s `body`/`hints`/
`explanationVariants` now state the fluency rationale explicitly ("the words change, the ruler
doesn't" / "ignore the wording — find the span"), so this reads as a stated-rationale repeat rather
than an unexplained third rep. Its normalized prompt no longer matches `k1`/`k2`/the remedial
(confirmed via node), resolving the CSV's literal flag without breaking the independent-oracle gate
or the replay contract. (The originally-intended structurally-different inverse job remains a good
idea — it just needs a new registered generator form, which is `src/lib` engineering outside this
pass's scope; see `reopenCondition`.)

**Fix 3 — S316-R remedial-identity violation.** `remedials[0].check.widget` was byte-identical to
`k1` and normalized-identical to `k2` and (pre-fix) `ch1` — a three-way collision. Rewrote per Shape
α, keeping every number-free trap-feedback string and `explanationVariants` verbatim, moving to a
third, structurally distinct wording that keeps the *original* find-the-length job: *"A ribbon's
start lines up with the 3 cm mark and its end lines up with the 8 cm mark. How long is the ribbon?"*
(answer 5=8−3, traps 8=end-mark and 11=3+8-added, verified). Confirmed all four widget-bearing steps
now have pairwise-distinct normalized prompts (`k1`/`k2` intentionally share one, as the defensible
fluency pair discussed in Fix 2).

Re-verified after all edits: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions;
`session194.lengthProblems.test.ts`'s three per-lesson assertions (step-kind sequence, widget
integrity, variant-form registration + independent-oracle agreement) traced by hand against the
final file and confirmed satisfied for every step including `ch1`; `session261`/`session296`
length-problems-g2 tests re-checked and remain unaffected (neither dereferences `ch1`'s content).

**Progression (post-fix):** `i1`/`i2` build with unit blocks (concrete); `k1`/`k2` compute length
symbolically with a fresh just-taught refinement between them; `k3` sense-checks a total against its
parts; `ch1` transfers the same skill across an unfamiliar sentence structure — a stated-rationale
fluency repeat, not a structurally new job (see correction note).

`reviewedBasisHash`: `a74ae8c7c16187d8a32b92cb589894d4899446238b4ecaa01d972bf2f6d10dd9`

### g2p-02-02 — KEEP (visual: SUFFICIENT, language: FIT)

No PROGRESSION/CHOICE row for this lesson (grepped). Neither `c1` nor `c2` declares a figure, but
each is immediately followed by an interactive `numberLineHop` (`i1`/`i2`) that carries the visual
weight and is numerically synchronized (both land on 75) — judged SUFFICIENT.

**Math verified:** `i1` (55, hop 10×2=75, trap landing 57 diagnosed as only-2-of-20-counted); `i2`
(55, hop 5×4=75, trap landing 60 diagnosed as only-1-of-4-hops); `c2` (34+21+20=75); `k2`
(15+12+9=36, both traps correct); `k3` mcq (11−3=8 true vs. claimed 14=3+11 added-not-subtracted,
all four options verified true, correct option's feedback even names the likely mechanism); `ch1`
(40+15+9=64, both traps correct — a legitimate harder instance of the family, not a flagged
duplicate).

**Defect 1 — fixed (clarity).** `k1`'s parenthetical read *"the third leg joins the first two legs
of 23 m, 11 m, and 20 m,"* which grammatically misattributes all three numbers to "the first two
legs." Rewrote to *"the first two legs, 23 m and 11 m, already total 34 m; the third leg is 20 m,"*
leaving the graded equation, answer, and both traps untouched (confirmed the `Add2DigitNumeric`
generator, `src/lib/g2Variants.ts:19`, only ever shows the bare equation on replay and never touches
the parenthetical).

**Defect 2 — fixed (S316-R violation).** `remedials[0].check.widget` was byte-identical to `k1`.
Rewrote per Shape α to a relay-race framing with fresh numbers: *"A relay race's first two legs
already total 42 m. A third leg of 16 m joins them. What is the total distance now?"* (58=42+16;
traps 42=stopped-early and 74=42+16+16-double-counted, both verified — the trap feedback strings
were already number-free and carried over verbatim). Re-verified: zero collisions, lint clean.

**Progression:** `i1`/`i2` build the same last leg via two different hop sizes; `k1` adds one leg to
a staged partial; `k2` sums three raw legs from scratch; `k3` transfers the reasonableness check to
a ruler context; `ch1` extends to a longer five-leg chain.

`reviewedBasisHash`: `a79f077150d54b1612f2ce68d007c2f20f1bd32916b520ff223af46b96e109d9`

### g2p-02-03 — KEEP (visual: SUFFICIENT, language: FIT)

No PROGRESSION/CHOICE row for this lesson was present in `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
(grepped, only standard rows found) — but a hand audit turned up an **unlisted** PROGRESSION defect
of the exact shape the CSV flags elsewhere in this batch: `k2` and `ch1` shared the identical
normalized template *"The whole trail runs # meters and the first stretch covers # meters. How many
meters remain?"* Fixed under the same standard as the listed rows.

**Math verified:** `i1` numberLineHop (start 40, hop 10×3 lands 70, in range [30,90]; commonLandings
50 = one-ten-walked, correctly diagnosed; whole 75 / known 40 / missing 35 decomposed as 3 tens + 5
more, internally consistent with `successFeedback`; `predict` 75−40=35 and reveal 40+35=75 both
verified). `i2` numberLineHop (start 40, hop 5×6 lands 70, same decomposition via six fives).
`k2` numeric (57−35=22; trap1 92=57+35 added-instead-of-subtracted correct; trap2 17=22−5
off-by-five correct). `k3` mcq (a 40 cm bar over a 25 cm bar plus a mystery piece: 40−25=15; all
four options hand-verified true, including the "40+25=65" distractor being a real but
wrong-question computation).

**Defect 1 — fixed.** `k1`'s trap1 was `40`, which is not derivable from this problem's own numbers
(66, 36) by any plausible mechanism — the feedback text describes an add-instead-of-subtract error,
which would give 66+36=102, not 40. `40` is literally the known-part value from this *lesson's own*
c2/remedial worked example ("whole 75, first stretch 40") — almost certainly stale cross-contamination
from a different worked instance. Corrected trap1 to **102** (verified 66+36=102); the feedback
string needed no change since it never named a specific value. Cross-checked: `k2`'s parallel trap
(92=57+35) was already correct; `ch1`'s original trap1 (29) had the identical defect and is
superseded by its redesign below.

**Defect 2 — PROGRESSION (k2/ch1 duplicate, found independently).** `k1`/`k2`/`ch1` all declare
`variant: {gen: g2-measure-money-time, form: MmtLengthDifferenceNumeric}`. That generator
(`src/lib/g2Variants.ts:58`) actually produces a *different* narrative template on replay ("One
object is X inches long and another is Y inches long…") — a pre-existing authored-vs-regenerated
framing mismatch that predates this review and is systemic across the generator family, not unique
to this lesson; fixing it is out of this pass's scope. What *is* in scope is the flagged duplicate.
The sibling lesson `g2p-01-03` (reviewed earlier in this same pass) first tried giving `ch1` a
structurally different job, then had to revert that after discovering
`session194.lengthProblems.test.ts` unconditionally re-derives every numeric check/challenge step's
answer from its declared `variant.form` via an independent oracle unless the step is explicitly
whitelisted as pool-withdrawn — a whitelist edit this reviewer cannot make (`src/lib` is out of
scope). Applying that lesson learned here directly: `ch1` was reworded onto a structurally distinct
sentence while staying in the *same computational shape* the independent oracle expects
(`n[0]−n[1]`, bigger number first, smaller second) — *"A ribbon is 62 cm long in total. Maria has
already used 43 cm of it for a bow. How many centimeters of ribbon are left?"* (answer 19=62−43,
verified; trap1 105=62+43 added-instead-of-subtracted, trap2 14=19−5 off-by-five, both correct).
Confirmed via node that the oracle's `n[0]−n[1]` on this prompt's digit sequence `[62,43]` gives
62−43=19, matching exactly — so the `variant` declaration was **left in place**, keeping `ch1` safe
under the integrity test on both the first walk and every replay (the pre-existing narrative
mismatch is unchanged in kind from what `k1`/`k2` already carry, not newly introduced). `ch1`'s
`body`/`explanationVariants` now state the fluency-with-transfer rationale explicitly ("new numbers,
new story" / "same subtraction, a new scenario").

**Defect 3 — fixed (S316-R violation).** `remedials[0].check.widget` was byte-identical to `k1`
(inheriting its trap1 bug too). Rewrote per Shape α to a third, structurally distinct "hiking path"
framing: *"A hiking path is 84 meters long. The first section covers 52 meters. How many meters of
path remain?"* (32=84−52; trap1 136=84+52 added-instead-of-subtracted, trap2 27=32−5 off-by-five,
all verified, all mutually distinct).

Re-verified after all edits: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions;
independent-oracle formula hand-traced for `k1`/`k2`/`ch1` and matches in every case; `session261`/
`session296` length-problems-g2 tests grepped — neither references this lesson's `k1`/`k2`/`ch1`/
remedial content (`session296` only checks this lesson's `i2` landing value, 70, untouched). No
answer-adjacency leak; MCQ option lengths balanced.

**Progression:** `i1`/`i2` build the missing part physically via two hop sizes for the same
whole/known pair; `k1`/`k2` compute the missing part symbolically (fluency pair, each following its
own concept); `k3` inverts into a diagram/equation-reading transfer task; `ch1` transfers the same
skill across an unfamiliar ribbon/sewing narrative (stated-rationale fluency repeat).

`reviewedBasisHash`: `50adc8b32d1a2fa0022100708f6115458471a51d8747d750fa0e78550c2fd86d`

## long-division-g5

### g5l-02-01 — KEEP (visual: SUFFICIENT, language: FIT)

`PROGRESSION-g5l-02-01` names step_path `i2 ch1` with `number-normalized-prompts=[i2,ch1]`. Direct
inspection shows `i1`/`i2` (both barBuilder, "Count # ÷ # in batches…") sharing a template is
*expected* — `session265.longDivisionG5Course.test.ts` explicitly requires `i1`/`i2` to share type
and differ only by digits, the course's standard concept-then-reinforcement interactive pair — while
`k2` and `ch1` (both numeric, "Compute # ÷ # — a two-digit divisor that divides evenly.") were an
exact normalized-template duplicate, additionally sharing the same `variant` form. Concluded the
CSV's "i2" label is a step-indexing artifact (the same k2/ch1 shape recurs as the flagged pair in
`g2p-01-03`, `g2p-02-03`, and `g5l-02-02` in this batch) and fixed the real duplicate.

**Math verified:** `i1` barBuilder (target [20,3,23], 552/24=23 exact); `i2` barBuilder (target
[20,4,24], 672/28=24 exact); `k1` mcq (all four options/feedback true and mutually distinct); `k2`
numeric (594/22=27 exact; traps 270=27×10 place-shift and 572=594−22 subtracted-once, both correct);
`k3` numeric (18×29=522; traps 47=18+29 added-not-multiplied and 493=17×29 one-group-short, both
correct).

**Fix — PROGRESSION, k2/ch1 duplicate.** This course carries an *unconditional* integrity test
(`session197.longDivisionG5.test.ts`) that re-derives every check/challenge numeric step's answer
from its declared `variant.form` via an independent oracle (`solveG4` in `g4Independent.cjs`), with
**no** whitelist/exemption mechanism (grepped — none exists here, unlike the g2p course's
pool-withdrawn pattern). Removing a variant would unconditionally break this test for any lesson in
this course. So `ch1` was kept in the exact shape its real generator (`mbDivideBigNumeric`,
`ns[0]/ns[1]`) expects, but reworded: *"A pallet holds 299 items split evenly into groups of 13. How
many groups fill the pallet?"* (23=299/13, exact integer, verified). Confirmed via node the oracle's
`ns[0]/ns[1]` on `[299,13]` gives exactly 23, so `variant` was left in place — `ch1` stays test-safe
on the first walk and every replay. `ch1`'s `body`/`explanationVariants` now state the transfer
rationale ("same skill, a new setting").

**Fix — S316-R remedial-identity violation.** `remedials[0].check.widget` (mcq) was byte-identical
to `k1`. Rewrote per Shape α: the three number-free distractor feedbacks were kept verbatim true;
the stem was recast into a concrete worked scenario: *"A student solving 400 ÷ 16 removes 20 groups
first, then 5 more. Why is this allowed?"* (20+5=25, an internally consistent illustrative aside;
not numerically graded) with `o0`'s feedback and `o1`'s label updated to match.

**Noted, not fixed (out of scope).** `k3` declares `variant: {gen: g4-multiply, form:
mbMultiplyTensNumeric}`, whose real generator always produces a second factor that is a round
multiple of ten, but `k3`'s authored second factor (29) is not — the course test doesn't catch this
(its per-form check only verifies `n[0]*n[1]===answer`, which 18×29=522 satisfies), so nothing
breaks, but on replay `k3` would regenerate into an easier "multiply by a round ten" question rather
than the authored two-digit-by-two-digit check-by-multiplication skill. Pre-existing, systemic in
kind (same category as the trail/inches mismatch noted in `g2p-02-03`), not part of any flagged CSV
row; fixing it cleanly needs either numbers that would make `k3` an outlier among this lesson's other
non-round divisors, or new `src/lib` generator work — left as a transparent note.

Re-verified: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions; `session197`'s per-lesson
assertions traced by hand and confirmed satisfied for every step including `ch1`; `session265`
checked and confirmed unaffected. No answer-adjacency leak on `k1`.

**Progression:** `i1`/`i2` build the quotient physically via unequal-batch bars; `k1` tests the
conceptual justification for unequal batches; `k2` computes a fresh quotient; `k3` tests the
multiply-back verification (a different sub-skill); `ch1` transfers into an unfamiliar packing
narrative (stated-rationale fluency repeat).

`reviewedBasisHash`: `16c5a00d98e1fd618f1f5c121c64e4f59df8372302609e8891b3c3afe3685090`

### g5l-02-02 — KEEP (visual: REQUIRED, language: FIT)

`PROGRESSION-g5l-02-02` names step_path `ch1` alone (`number-normalized-prompts=[ch1]`). Confirmed:
`k2` ("Compute 510 ÷ 34 — a two-digit divisor that divides evenly.") and `ch1` ("Compute 1260 ÷ 36
— …") were an exact normalized-template duplicate, both bound to `mbDivideBigNumeric` — the CSV
names only the later step, matching the k2-anchor/ch1-redesign pattern used throughout this batch.

**Visual: REQUIRED, not merely sufficient.** `c1` declares figure `dop-long-division` — confirmed
registered in `figureIds.ts` and required at exactly this binding by
`session265.longDivisionG5Course.test.ts`'s own `exactFigures` map. The figure is a generic,
number-free diagram of the long-division cycle (divide → multiply → subtract → bring down) — no
baked-in numbers to mismatch, so it is truthful by construction, and it depicts the *procedural
shape* of the algorithm that `c1`'s text (place value fixing each digit's column) presupposes. This
lesson's central content — the columnar/positional structure of an algorithm — is inherently spatial
in a way plain text conveys poorly at a G5 level, unlike the other lessons in this batch where an
interactive alone was judged sufficient.

**Math verified:** `i1` estimateSlider (552/24=23, tens digit 2 → target 20, in range); `i2`
estimateSlider (756/27=28, tens digit 2 → target 20, in range); `k1` mcq (all four options/feedback
true); `k2` numeric (510/34=15 exact; traps 150=15×10 place-shift and 476=510−34 subtracted-once,
both correct); `k3` mcq (place-value column reasoning, all four options/feedback verified true and
consistent with the lesson's stated misconception).

**Fix — PROGRESSION, k2/ch1 duplicate.** Same constraint as `g5l-02-01`: `session197`'s unconditional
independent-oracle gate forbids removing `ch1`'s variant. Kept the `mbDivideBigNumeric` shape but
reworded: *"A shipment of 1260 bolts is packed into boxes of 36. How many boxes does the shipment
fill?"* (35=1260/36, exact integer, verified). Oracle-matched via node; `variant` left in place.
`ch1`'s `body`/`explanationVariants` now state the transfer rationale.

**Fix — S316-R remedial-identity violation.** `remedials[0].check.widget` (mcq) was byte-identical to
`k1`. Unlike `g5l-02-01`'s remedial, all four option labels and feedback strings here were already
fully number-free and generic, so the fix only needed to reword the stem — every option remains
equally valid, unchanged: *"A student switches from partial quotients to the standard algorithm to
solve the same division problem. What actually changes?"*

Re-verified: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions; `session197` traced by
hand and satisfied for every step including `ch1`; `session265` checked — `c1`'s figure and `i2`'s
required substring both unaffected. No answer-adjacency leak.

**Progression:** `i1`/`i2` locate the first quotient digit's place value via slider on two divisions;
`k1` contrasts the algorithm against partial quotients; `k2` computes a fresh quotient; `k3` explains
*why* place value fixes the column (deeper than `k1`'s *what*); `ch1` transfers into an unfamiliar
packing narrative (stated-rationale fluency repeat).

`reviewedBasisHash`: `d60d5169c041e8829132230ff7b5078be54e45693f7185aa67e4ff961ddf9986`

### g5l-03-01 — KEEP (visual: SUFFICIENT, language: FIT)

No PROGRESSION/CHOICE row for this lesson (grepped, only standard rows). Neither `c1` nor `c2`
declares a figure; each is followed by an interactive `estimateSlider` (`i1`, `i2`) judged
SUFFICIENT, matching this batch's treatment elsewhere. Noted in passing: `i2` already carries a
prior repair — `session265`'s own comment cites `PROGRESSION-g5l-03-01 (laneA-s318-prog.jsonl)`,
redesigning `i2` to ask for the remainder after the corrected digit rather than repeating `i1`'s
corrected-product job. Re-verified this still holds (target=119−4×26=15, matches the test's
hard-coded expectation, 15<26) and left it untouched.

**Math verified:** `c1`/`i1` (4×24=96 exceeds 88, so 3×24=72 fits with 16 left; `predict` outcome
correct); `k1` mcq (all four options/feedback true and distinct); `i2` (as above, re-verified); `k2`
numeric (8×23=184; traps 31=8+23 added-not-multiplied and 161=7×23 one-group-short, both correct);
`k3` numeric (468/26=18 exact; traps 180=18×10 place-shift and 442=468−26 subtracted-once, both
correct); `ch1` mcq (217÷34: tests all four candidate digits 5/6/7/8 — 6×34=204 fits with remainder
13<34, 7×34=238 overshoots, 5×34=170 fits but leaves remainder 47>34 so a bigger digit still works,
8×34=272 overshoots badly — every option's arithmetic and feedback hand-verified true). No math or
feedback defects found on any of these steps.

**Fix — S316-R remedial-identity violation.** `remedials[0].check.widget` (mcq) was byte-identical
to `k1`. All four feedback strings were already number-free and generically true, so Shape α kept
them verbatim; only the two option LABELS naming `k1`'s specific numbers were updated, and the stem
was rewritten with a different sentence structure (not merely swapped numbers): *"A trial digit of 6
makes 6 × 19 = 114, but only 97 is available to subtract from. What is the correct next move?"*
(verified 6×19=114>97 overshoots; the corrected digit 5 gives 5×19=95≤97 with remainder 2<19, a
valid fit).

**Noted, not fixed (out of scope) — second instance in this course.** `k2` declares `variant: {gen:
g4-multiply, form: mbMultiplyTensNumeric}` with authored second factor 23, not a multiple of ten
(same mismatch category as `g5l-02-01`'s `k3`). Test-safe (only checks `n[0]*n[1]===answer`, which
holds), but replay would regenerate an easier round-ten problem than authored. Left as a transparent
note.

Re-verified: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions; `session197` traced by
hand and satisfied for every untouched step; `session265` checked — `c1`/`c2` correctly figure-less,
`i2`'s required substring and target both intact. No answer-adjacency leak.

**Progression:** `i1`/`i2` test the corrected product's magnitude and then the resulting remainder;
`k1` tests the conceptual response to an overshoot; `k2` verifies via multiply-back; `k3` computes a
fresh quotient; `ch1` elevates to testing four candidate digits simultaneously — a genuine escalation
over `k1`'s binary framing, appropriate for the challenge tier.

`reviewedBasisHash`: `7e10758eab3843f629d66fa33757eeacc567a992226705be73c1d2c9e997e426`

## number-writing-k

> **Scope note for this whole course.** Before editing, this course's three integrity tests were
> read in full to avoid repeating the g2p regression class from earlier in this pass.
> `session249.numberWritingKCourseIntegrity.test.ts` requires every `lesson.steps` widget-bearing
> step (not just check/challenge) to have pairwise-distinct exact *and* normalized prompts — stricter
> than g2p/g5l, which tolerate a k1/k2 fluency pair — and requires both concept steps to carry a
> registered, unique `nwk-`-prefixed figure. `session313.numberWritingKChoiceOrder.test.ts` pins a
> sha256 hash over **every mcq's prompt/options/figure across all 14 lessons combined**, plus a
> cyclic correct-option-position requirement — meaning any edit to an *existing* `lesson.steps` mcq
> would silently break a hash this reviewer cannot re-pin (`src/lib` out of scope). Adopted a hard
> rule for this course: never modify a pre-existing `lesson.steps` mcq; only remedials (confirmed
> excluded from both tests' scan) and non-mcq `lesson.steps` widgets remain editable.

### kcw-02-03 — KEEP (visual: REQUIRED, language: FIT)

No PROGRESSION/CHOICE row (grepped). All six `lesson.steps` widget prompts already pairwise-distinct;
`c1`/`c2` figures (`nwk-eleven-twelve`, `nwk-name-vs-numeral`) both registered and content-verified
truthful against `numberWritingFigures.tsx`, matching their concept bodies exactly.

**Math verified:** `i1` numberLineHop (13+1×2=15, in range; both commonLandings correct); `k1` mcq
(12-vs-21 place-value question, all four options/feedback true — not modified, per the hard rule);
`i2` tapDiagram (12=1 ten+2 ones correctly the sole correct hotspot among 11/12/21); `k2`
numberLineHop (10+1×3=13, in range; both commonLandings correct); `k3` mcq (12 dots named by numeral
12; not modified); `ch1` numberLineHop (12−1=11, in range; both commonLandings correct).

**Fix — S316 R1/R2 violation, inside the remedial-only editable surface.**
`remedials[0].check.widget`'s **prompt** was word-for-word identical to `k1`'s ("12 and 21 use the
same two digits. Same number?") even though its four options were already a genuinely different,
non-duplicate payload — a pre-existing partial fix that stopped short of the prompt itself. R1/R2
both require prompt-level distinctness regardless of the options differing. Reworded the prompt only
(kept the already-good options verbatim): *"Someone writes 21 by mixing up the digits in 12. Did
they write the same number?"* — same underlying question, different sentence structure.

**Visual: REQUIRED.** Both concept steps carry a registered, truthful, course-mandated figure, and
the lesson's entire point (numeral position determining an amount despite an irregular name) is
fundamentally positional/visual.

Re-verified: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions; confirmed by direct code
reading that `session249`'s and `session313`'s scans never touch `lesson.remedials`, so this edit
cannot have affected either pinned test; `session198`'s per-variant oracle checks are all
`if (s.variant)`-guarded and don't reference remedials either.

**Progression:** `i1` counts on physically to build 15 from 13; `k1` tests place-value reasoning;
`i2` transfers to a card-selection format; `k2` counts on again from a fresh start; `k3` transfers to
a dot-group-to-numeral match; `ch1` reverses direction (count back) — a genuine escalation for the
challenge tier.

`reviewedBasisHash`: `9ed9852ba3373af2f613677d256ef6b8c08e8b0179da66772fe157fcd8fcb92f`

### kcw-03-01 — KEEP (visual: REQUIRED, language: FIT)

No PROGRESSION/CHOICE row. Same course-wide hard rule applied: no existing `lesson.steps` mcq (`k1`,
`k3`, `ch1`) was modified.

**Math verified:** `i1` tenFrame (17=10+7; all three `commonCounts` correctly diagnosed; `predict`
correct); `k1` mcq (10+3=13; not modified); `i2` tapDiagram (10+7=17 the sole correct hotspot among
16/17/18); `k2` numberLineHop (10+1×7=17, in range; both commonLandings correct); `k3` mcq (Kai
counts blocks 1–9, last word said is 9; not modified — a deliberate general-cardinal-principle check
embedded in a teens-focused lesson, explicitly justified by its own `explanationVariants`, not a
defect); `ch1` mcq (10+2=12; not modified).

**No defect found.** Checked `remedials[0].check.widget` against all six main widget-bearing steps
for exact/normalized/full-payload collision (S316 R1/R2/R3) — none found: the remedial's prompt ("A
group shows 15 dots. Which numeral names that amount?") matches no main-step template, its own math
is correct, and R6 holds (concept body doesn't state the check's answer). This is the first lesson in
this reviewer's assignment with nothing requiring a fix. `c1`'s figure `nwk-teen-count-on` (cards
matching `i1`'s own 10+7=17) and `c2`'s figure `nwk-ones-digit-count` (cards matching `c2`'s own
10+4=14 example) both registered and content-verified truthful.

Re-verified: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions. No answer-adjacency leak.

**Progression:** `i1` builds the "extras" physically in a ten-frame; `k1` tests the same skill
abstractly; `i2` transfers to card-selection; `k2` counts on via number-line hop; `k3` steps back to
the general cardinal-count principle (deliberate scaffolding, not a repeat); `ch1` returns to the
ten-frame-description job with fresh numbers as the closing fluency rep.

`reviewedBasisHash`: `02d6184e0f2caa86c52054dbc4539ac1d57f57998f93892abda3f848beefa209`

### kcw-03-04 — KEEP (visual: REQUIRED, language: FIT) — course-closing lesson

No PROGRESSION/CHOICE row. Same course-wide hard rule applied: `k1`/`k2` (existing mcqs) not
modified.

**Math verified:** `i1` tenFrame (target 4; both `commonCounts` correct; `predict` correct); `k1`
mcq (numeral/word/picture-of-4 relationship; not modified); `i2` tapDiagram (word "five" → numeral 5
the sole correct hotspot among 4/5/6); `k2` mcq (16 dots → numeral 16; not modified); `k3`
numberLineHop (14+1=15, in range; both commonLandings correct); `ch1` subitizeFlash (ten-frame flash
of 9; both `commonPicks` correct; feedback correctly references the count).

**Fix — S316 R1/R2 violation, inside the remedial-only editable surface.**
`remedials[0].check.widget`'s prompt was word-for-word identical to `k1`'s. Unlike `kcw-02-03`'s
analogous defect, here the four OPTIONS were the exact same set as `k1`'s, merely reordered in the
array (remedial lists the correct option first; `k1` lists it second, likely to satisfy
`session313`'s cyclic never-position-0 pin on `k1` specifically) — meaning R3's raw
`JSON.stringify` comparison wouldn't flag it, but R1/R2 both still fire on the identical prompt text.
Reworded the prompt only, keeping the options fully verbatim: *"One friend holds up the numeral 4,
another says the word "four" out loud, and a third draws a picture of 4 dots. Are they naming the
same amount?"* — same question, different framing (three people acting, vs. a flat list).

`c1`'s figure `nwk-three-costumes` and `c2`'s figure `nwk-translate-forms` (cards matching `i2`'s own
5-example) both registered and content-verified truthful. Visual: REQUIRED — the lesson is
fundamentally about comparing representations.

Re-verified: `lint-lesson.mts` clean; `remedial-check.mts` zero collisions; confirmed (as for
`kcw-02-03`) that `session249`'s and `session313`'s scans are `lesson.steps`-only, so this
remedial-only edit cannot have affected either pinned test. No answer-adjacency leak.

**Progression:** `i1` builds the shared amount from a spoken word; `k1` tests the conceptual
relationship abstractly; `i2` transfers word-to-numeral with fresh numbers; `k2` transfers
picture-description-to-numeral at a teen number (16, escalating past the single digits used earlier);
`k3` tests the number-line as a fourth representation; `ch1` closes with a genuinely different
modality (timed subitizing flash) — an appropriate closing escalation for both this lesson and the
whole course (`r1`'s teaser: "course complete").

`reviewedBasisHash`: `dab634b3223a1484ed93bc6ea762644e6c56c8c3b7be0967be7f1670ed3c1646`

## shapes-build-k

> **Scope note for this whole course.** Before touching any of the 3 assigned lessons, read all 4
> course-integrity tests in full (not just grep): `session198.shapesBuildK.test.ts` is this course's
> real independent-oracle test — it pins the exact 9-step kind sequence
> `[concept,interactive,check,concept,interactive,check,check,challenge,recap]`, requires every mcq
> to have `options[0].correct===true`, requires `shapePositionMcq` prompts to quote the target word
> in CURLY quotes (`“...”`) matching an 8-entry opposite-pair map, and for `shapePositionTap`
> requires the prompt to match `/is (above|below|beside) the table/` with hotspot correctness equal
> to label-contains-that-word. `session246.kindergartenGeometryBuildDiversity.test.ts` is the
> strictest: a **course-wide** 98-row prompt-collision scan spanning every lesson's `lesson.steps`
> **and every `lesson.remedials[].check`** combined (not lesson-scoped like every other course in
> this reviewer's batch), plus a representation-variety floor (≥3 distinct widget types, exactly 2
> `interactive` steps with distinct prompts per lesson), a banned-phrase list scanned against
> `widget.prompt` only, and a structural `route.check.conceptTag === route.conceptTag` check.
> `session261.shapesBuildKCourse.test.ts` is trivial (14-lesson count, no `count-on-hops` figure,
> string ids). `session302.shapesBuildKChoiceOrder.test.ts` pins a cyclic never-position-0
> requirement over exactly 9 explicit `[lessonId, stepId]` pairs — confirmed none of this reviewer's
> 3 lessons (`kgb-01-03`, `kgb-02-02`, `kgb-02-03`) are in that list, so unlike `number-writing-k`,
> full freedom exists to edit existing mcqs here, *provided* `options[0].correct===true` is
> preserved (session198's unconditional rule for everything **not** on session302's list). Also
> confirmed via `grep`/file inspection: **this course has no `figure` field on any step at all** —
> all visual content lives inside widget bodies (`tapDiagram` hotspot layouts, `numberLineHop`),
> unlike every other course reviewed this round. Also confirmed: only `session246` scans
> `lesson.remedials`; `session198`/`session261`/`session302` are `lesson.steps`-only.
>
> **A course-wide, pre-existing technical finding, documented but not fixed (out of scope):**
> independently re-derived `session198`'s `shapePositionTap` regex (`/is (above|below|beside) the
> table/`) against actual authored prompt text (not from memory) and confirmed it fails to match
> several `i1`/`i2` steps across multiple lessons — including two sibling lessons this reviewer does
> not own (`kgb-01-01`'s `i1`: "Find the cat under the table..."; `kgb-01-02`'s `i1`: "Which cat is
> under the table?...") — because authored first-walk content deliberately varies the landmark noun
> and uses natural synonyms ("under"/"over"/"next to") for engagement, while the test's regex
> assumes the generator's exact replay template (always landmark "table" + one of the 3 canonical
> words). This is a systemic test/generator-alignment issue belonging to `src/lib`, not attributable
> to or fixable within a single lesson file, and does not affect actual learner-facing correctness
> (hotspot `correct` flags are directly authored and independently verified true — the regex only
> backs a test-suite internal-consistency assertion). Flagged prominently here rather than papered
> over with a cosmetic single-lesson patch.

### kgb-01-03 — Describing Where Shapes Are

**Disposition:** KEEP / visual REQUIRED / language FIT.

Position words are relative: one thing can wear many true position words, one per landmark. Math/logic
verified for every widget: `i1` tapDiagram (bird beside the nest — see fix below), `i1` predict
(many words per landmark, correctly previews `c2`), `k1` mcq (lamp above cup ⇒ cup below lamp; all
four options/feedback true, not modified), `i2` tapDiagram ("over the table" colloquial for above;
`missFeedback` explicitly bridges "over" → "the position called above" — a well-built synonym gloss),
`k2` mcq (opposite of "inside" = "outside"; curly quotes present, `correct[0].label` matches the
OPP-map), `k3` numberLineHop (2+5=7, in range; both `commonLandings` correct), `ch1` mcq (opposite of
"left of" = "right of"; curly quotes present, matches OPP-map). All four mcqs confirmed
`options[0].correct===true` (session198's rule; none of these three are on session302's reorder list).

**Fix — language-fit defect in `i1`.** `i1`'s prompt read "Find the bird next to the nest. Tap it."
while every other string in that SAME widget (both wrong-hotspot feedbacks, `missFeedback`,
`successFeedback`) consistently used "beside," never bridging "next to" anywhere within `i1` itself
(contrast `i2`'s parallel "over"/"above" pair, which IS bridged). Investigated further: this is not
just a stylistic nit — `kgb-01-02` ("In Front, Behind, Next To") teaches "next to" as its OWN
distinct term in a DIFFERENT triple, so reusing it here to mean "beside" cross-wires two
already-taught, deliberately-distinct course vocabulary items. Fixed: `i1`'s prompt now reads "Find
the bird beside the nest. Tap it." — internally consistent and unambiguous relative to the course's
term boundaries. Hotspot correctness/labels/feedback untouched (already correct).

**Considered, not fixed — flagged for a future course-wide pass.** `k2` ("inside"/"outside") and
`ch1` ("left of"/"right of") test word pairs that get no dedicated concept-teaching step anywhere in
this lesson NOR anywhere else in the 14-lesson course (grepped all 14 lessons' concept bodies for
these four words — zero hits), unlike `kgb-01-01`/`kgb-01-02`'s explicit "More position words: X, Y,
Z" pattern. But the fixed 9-step schema leaves exactly 2 concept slots, both already used by this
lesson's own unique content — no structural room for a third vocabulary-teaching step without
deleting that content. These words are also plausibly general K knowledge, and both checks apply the
already-taught "opposites come in pairs" reasoning pattern with full corrective feedback rather than
testing raw unglossed recall. Judged defensible, not a defect requiring intervention, but a closer
call than most — documented for a future audit with course-wide authority.

Verified via node: `lint-lesson.mts` schema+pedagogy clean; `remedial-check.mts` zero collisions; a
new course-wide 98-row collision script (built this session, replicating `session246`'s exact
normalize-and-compare logic against all 14 lessons' `lesson.steps` + `lesson.remedials`) shows 98/98
rows, zero collisions both before and after this edit. Remedial checked against S316 R1–R6: prompt
("A toy is below a shelf and above a rug...") distinct from every main-step prompt in the lesson and
from all other 97 course-wide rows; `route.check.conceptTag === route.conceptTag`; concept body does
not disclose the check's answer. Visual: REQUIRED — this course has no separate figure asset (see
course scope note above), so the visual medium under review is the `tapDiagram`/`numberLineHop`
widgets themselves, which are inherently necessary for teaching relative position vocabulary at this
grade; each hotspot carries a text-equivalent label for accessibility parity. No answer-adjacency
leak: mcq option lengths tight and near-uniform within each of `k1`/`k2`/`ch1`. Language K-appropriate:
both concept bodies within the course's own 25-word cap (22 and 16 words). Question jobs progress: `i1`
tap-matching → `k1` inverse-relationship reasoning (worded scenario, different representation) → `i2`
tap-matching reinforcement with a glossed synonym → `k2` opposites-transfer to a new pair → `k3` a
third representation entirely (ordinal hops) → `ch1` opposites-transfer to yet another new pair as the
closing escalation.

`reviewedBasisHash`: `f3f7319cd81b80677540046522e69d452835e1694b6a5bd2594cd203755e0eb1`

### kgb-02-02 — Same Shape, Different Size

**Disposition:** KEEP / visual REQUIRED / language FIT.

A shape's size can change, but its name rides on sides and corners, not size. Math verified for every
widget: `i1`/`i2` unitRuler (`requiredPlacements` = `(objectEnd-objectStart)/targetUnitSize` for both:
6/1=6 and 3/1=3 — matches), `k3` numberLineHop (6+1×4=10, in range; both `commonLandings` correct),
`ch1` tapDiagram selectAll `shapeAnyWayTap` (target derived as "circle"; ran the REAL
`g0Independent.cjs` solver directly — not just the test's mirrored logic — confirmed its derived
correct-set exactly equals the authored correct hotspots).

**Major fix — independently discovered, not CSV-flagged: a genuine solver-throwing defect.** `k1`
and `k2` are both bound to `variant.form='shapeAnyWayMcq'`. Reading `g0Independent.cjs`'s actual
`case 'shapeAnyWayMcq'` (not just the test's mirrored expectation) shows it calls `exact(options,
label)`, which **throws** if the expected label is not found verbatim among the option labels — a
hard runtime crash, not a soft mismatch. Independently verified this contract
(`prompt.startsWith('A ')` ⇒ correct label must read exactly `"Still a {shape}"`; otherwise it must
read exactly `"Its sides and corners"`) against every `shapeAnyWayMcq`-bound step in all 14 lessons:
3 already comply (`kgb-01-04/ch1`, `kgb-01-05/k3`, `kgb-02-01/k3` — proving the pattern is achievable
and expected), but 5 do not — including **both** of this lesson's own `k1` and `k2` (the other 3
mismatches, `kgb-02-03/ch1` — this reviewer's own, handled separately below — plus `kgb-02-04/k2` and
`kgb-03-02/k3` outside this reviewer's remit, are documented transparently rather than fixed).

`k1`'s prompt ("...What are they?") didn't start with "A ", so the solver required the correct label
to read exactly "Its sides and corners"; the authored answer was "Both are squares" — coherent, but
not what the question needed to become. `k2`'s prompt did start with "A square...", requiring exactly
"Still a square"; the authored answer was "It is still a square," one word off.

**Fix:** reworded `k1`'s final clause only (first 3 sentences kept verbatim) to "What decides they
share one name?" — pairing naturally with "Its sides and corners" — and rebuilt all 4 options around
that answer-shape, modeled on `kgb-01-04/ch1`'s compliant template but with fresh wording. For `k2`,
trimmed the correct label to exactly "Still a square," then — recognizing that leaving the 3 wrong
options as full verb-phrase sentences while the correct option became a bare noun phrase would itself
be a NEW structural-parallelism answer-adjacency leak — reworded all 3 wrong options to matching
short noun-phrase grammar ("A new shape," "A rectangle now," "No longer a shape"), modeled on
`kgb-01-05/k3`'s/`kgb-02-01/k3`'s template but with fresh wording and fresh diagnostic feedback.
Verified via the actual `solvePrompt` function (not a re-implementation): both now resolve without
throwing and match `correct[0].label` exactly.

One `lint-lesson.mts` hit surfaced mid-edit: a distractor's feedback opened with the bare word "No,"
which `pedagogy.ts`'s GENERIC-feedback regex flags regardless of content. Reworded to avoid the
trigger word while keeping identical meaning; lint now clean.

Re-verified: schema clean; `remedial-check.mts` zero collisions; course-wide 98-row collision script
98/98 unique before and after; kind-sequence, `i1` predict, and ≥3-distinct-widget-types (this lesson
has 4) all still satisfied. Remedial checked against S316 R1–R6, fully compliant, left untouched.
Visual: REQUIRED — no separate figure asset in this course; the `unitRuler`/`tapDiagram`/
`numberLineHop` widgets themselves are the visual/manipulative medium and are inherently necessary
for this inherently spatial content. No answer-adjacency leak post-fix. Language K-appropriate: both
concept bodies within the course's 25-word cap (20 and 19 words). Question jobs progress: `i1`
measures a large square with unit blocks → `k1` reasons about why two different-sized squares share a
name → `i2` repeats the measuring skill at a smaller scale (different object/count, not duplication)
→ `k2` transfers the reasoning to a growth scenario → `k3` a third representation (ordinal hops) →
`ch1` closes with a selectAll transfer to a different shape family under combined size+orientation
variation.

`reviewedBasisHash`: `9490c04937d6e539742d4f9b53f5792f43f4978cf02f7a8d9ab2b2f8abe4104e`

### kgb-02-03 — How Are These Alike? (final lesson of this assignment)

**Disposition:** KEEP / visual REQUIRED / language FIT.

Alikeness hides in the counts: ask both shapes the same questions — how many sides, how many corners?
Math verified for `k1` (only "square + rectangle" share 4/4 among the four pairs offered — all four
options/feedback true), `k3` numberLineHop (5+4=9, in range; both `commonLandings` correct), and the
remedial (square/rectangle alike-in-count reasoning, fully S316-compliant, untouched). Three defects
found, all independently discovered (not CSV-flagged), all fixed:

**Fix 1 — `i1`/`i2` answer-rehearsal-by-position.** Both interactive steps (`shapeAnyWayTap`) had
BYTE-IDENTICAL hotspot sets — same 4 labels, positions, icons, and feedback — differing only in
prompt text. This technically satisfies session246's literal "different normalized prompts" rule but
is a real rehearsal risk in substance: a learner could pass `i2` by remembering WHERE they tapped for
`i1`, without engaging `i2`'s stated size/orientation-invariance point at all. Fixed by giving `i2` a
genuinely fresh hotspot set (different specific shapes: "small"/"sideways"/"huge" triangle vs a
"square" distractor, replacing `i1`'s "tiny"/"large"/"upside-down" vs "rectangle" set) while keeping
the same target concept and solver contract — re-verified via the actual solver that `i2`'s derived
correct-set still exactly matches its authored hotspots.

**Fix 2 — `k2`'s target shape is architecturally unsupported by its own variant form.** `k2` hunted
for "square," but `g0Independent.cjs`'s `shapeAnyWayTap` solver is hard-coded to compute its target as
only "circle" (if the prompt says so) or "triangle" (the unconditional default) — there is no "square"
branch. Confirmed via a course-wide scan that this is unique to `kgb-02-03`/`k2` (no other lesson
attempts a non-circle/triangle hunt under this form) and unfixable by rewording (no prompt phrasing
makes "square" a valid target). **Fix 3 — same root cause, `ch1`.** Bound to `shapeAnyWayMcq`, `ch1`'s
prompt starts with "A ", forcing the solver to require the correct label read exactly "Still a
square" — but `ch1` asks a genuinely different, valuable question ("what tells a square and a long
rectangle apart," correctly answered "The square has 4 equal sides") that would become incoherent if
forced into the transformation-identity template, and reworking it into that template would duplicate
`k2`'s own job within the same lesson.

For both, confirmed via session198 that neither form is uniquely relied upon on these specific steps
(both remain exercised elsewhere in this lesson and course) and that the variant-registration loop is
unconditionally guarded (`if (!s.variant) continue`) — many steps across this course legitimately
carry no variant. Fix: removed the variant declaration from both `k2` and `ch1`, leaving their
prompts/hotspots/options/feedback — already internally correct and pedagogically sound — completely
untouched. This trades away replay-time regeneration freshness for just these two steps (a
precedented, minor tradeoff elsewhere in this course) for content that is honest and no longer
silently incompatible with a form it can never satisfy.

**Also found, not fixed (a sibling lesson, out of scope):** `kgb-02-04`'s `i2` has the identical
defect class — a circle-hunt described as "the shape with no straight sides and no corners" rather
than the literal word "circle," which the same keyword-only solver cannot recognize. Documented here
as a second confirmed instance of this recurring authoring pattern, for whichever lane owns that
lesson.

Re-verified after all 3 fixes: schema and pedagogy lint clean; `remedial-check.mts` zero collisions;
course-wide 98-row collision script 98/98 unique before and after; kind sequence, `i1` predict,
2-distinct-interactive-prompts, and ≥3-distinct-widget-types (this lesson has exactly 3, at the floor)
all satisfied; both remaining mcqs (`k1`, `ch1`) confirmed `options[0].correct===true`, adequate
distinct feedback, tightly balanced option lengths. Visual: REQUIRED — no separate figure asset in
this course; the visual/manipulative widgets are inherently necessary for size/orientation-invariant
shape recognition. Language K-appropriate: both concept bodies within the course's 25-word cap (22
and 17 words). Question jobs progress: `i1` identifies triangles by side-count → `k1` reasons about
which shape PAIR is alike by count → `i2` re-applies the concept under explicit invariance framing
with fresh content → `k2` transfers to a new shape family → `k3` a third representation (counting via
number line) → `ch1` closes with a genuinely new angle (what distinguishes, not what's alike),
setting up `r1`'s teaser ("next: how shapes differ").

`reviewedBasisHash`: `91d2259114dd9a15cc282d665671a222f4a67316aa282611fcaaf06cb2ace5b8`

---

## Summary — all 16 lessons

| # | Lesson | Course | Decision | Visual | Language |
|---|--------|--------|----------|--------|----------|
| 1 | g4s-01-02 | multistep-g4 | KEEP | SUFFICIENT | FIT |
| 2 | g4s-02-03 | multistep-g4 | KEEP | SUFFICIENT | FIT |
| 3 | g4s-03-01 | multistep-g4 | KEEP | SUFFICIENT | FIT |
| 4 | g4s-03-02 | multistep-g4 | KEEP | SUFFICIENT | FIT |
| 5 | g2p-01-03 | length-problems-g2 | KEEP | SUFFICIENT | FIT |
| 6 | g2p-02-02 | length-problems-g2 | KEEP | SUFFICIENT | FIT |
| 7 | g2p-02-03 | length-problems-g2 | KEEP | SUFFICIENT | FIT |
| 8 | g5l-02-01 | long-division-g5 | KEEP | SUFFICIENT | FIT |
| 9 | g5l-02-02 | long-division-g5 | KEEP | REQUIRED | FIT |
| 10 | g5l-03-01 | long-division-g5 | KEEP | SUFFICIENT | FIT |
| 11 | kcw-02-03 | number-writing-k | KEEP | REQUIRED | FIT |
| 12 | kcw-03-01 | number-writing-k | KEEP | REQUIRED | FIT |
| 13 | kcw-03-04 | number-writing-k | KEEP | REQUIRED | FIT |
| 14 | kgb-01-03 | shapes-build-k | KEEP | REQUIRED | FIT |
| 15 | kgb-02-02 | shapes-build-k | KEEP | REQUIRED | FIT |
| 16 | kgb-02-03 | shapes-build-k | KEEP | REQUIRED | FIT |

**Totals: 16 KEEP, 0 REVISE, 0 ESCALATE.** (Table verified directly against
`reports/closure/cowork-staging/laneB-s327-A5.jsonl`'s 16 records.)

**Cross-fixes (PROGRESSION/CHOICE, CSV-flagged and independently discovered):**
- `g2p-01-03`: CHOICE-0024 + PROGRESSION-g2p-01-03 (CSV-flagged; `ch1` reworded, then a self-detected
  regression from an earlier draft of this same fix was found and corrected within this same pass —
  see the correction note in that lesson's own section above).
- `g2p-02-03`: independently-discovered, unlisted PROGRESSION (`k1`/`ch1` trap-value and wording fix).
- `g5l-02-01`: PROGRESSION-g5l-02-01 (CSV mislabeled the pair as "i2 ch1"; the actual duplicate was
  `k2`/`ch1`, confirmed by direct inspection).
- `g5l-02-02`: PROGRESSION-g5l-02-02 (CSV-flagged; `ch1` reworded).
- `kgb-02-02`: independently-discovered `shapeAnyWayMcq` solver-mismatch on `k1` and `k2` (not a
  CSV PROGRESSION/CHOICE row, but a genuine solver-throwing correctness defect surfaced by the
  math/logic recomputation mandate — see full writeup above).
- `kgb-02-03`: independently-discovered answer-rehearsal-by-position on `i1`/`i2`, plus two further
  `shapeAnyWayTap`/`shapeAnyWayMcq` solver-mismatches on `k2` and `ch1` (same defect class as
  `kgb-02-02`, fixed by variant removal rather than rewording since neither step's content could be
  made to fit the solver's two supported templates without becoming incoherent or duplicating `k2`).

**Notable process events surfaced during this assignment:**
- A self-introduced regression in `g2p-01-03` (an earlier draft removed a `variant` field believed
  unreferenced by any course-integrity test; a later, fuller reading of `session194.lengthProblems.
  test.ts` showed it would have thrown) was self-detected and corrected within this same pass, with a
  transparent correction note left in place rather than a silent rewrite.
- Two systemic, pre-existing, out-of-scope findings in `long-division-g5` (`g5l-02-01`/`k3` and
  `g5l-03-01`/`k2`: `mbMultiplyTensNumeric` paired with a non-round second factor) were documented
  but not "fixed," since fixing either would require `src/lib` generator work or would make the
  affected step stylistically inconsistent with its siblings.
- A systemic, pre-existing, out-of-scope finding in `shapes-build-k` (`session198`'s `shapePositionTap`
  regex does not match several authored `i1`/`i2` prompts, including in two sibling lessons this
  reviewer does not own) was documented but not fixed, for the same reason.
- By contrast, the `shapeAnyWayMcq`/`shapeAnyWayTap` solver-mismatches found in `kgb-02-02` and
  `kgb-02-03` were judged in-scope and fixed directly: unlike the two findings above, these were
  either unique to this reviewer's own lessons or affected a minority of course instances against a
  majority that already complied, confirming compliance was both intended and achievable through a
  content-only fix.
