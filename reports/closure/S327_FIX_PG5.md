# S327-PG5 — LESSON_PROGRESSION_AND_DUPLICATION closure (33 lessons, 10 courses)

Fixer: `cowork-s327-PG5-fixer`. Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows under workstream
`LESSON_PROGRESSION_AND_DUPLICATION` for 33 named lessons across `sampling-and-probability`,
`transformations-measurement`, `vectors-matrices`, `complex-numbers`, `linear-equations-systems`,
`measure-convert`, `place-value`, `quadratics`, `systems-equations`, `shapes-shares-g2`, plus the
five `CHOICE_SURFACE_INTEGRITY` rows this lane exclusively owns this round on `cn-01-02`, `les-01-02`,
`mc-03-02`, `tm-04-02`, `vec-03-01`. All 33 rows' `mismatch_evidence` is exclusively
`number-normalized-prompts` (`duplicate-widgets=[]` and `exact-prompts=[]` on every row) — confirmed
by direct grep against the CSV before any lesson was read. Every one of the other 28 lessons was
independently grepped against `CHOICE_SURFACE_INTEGRITY` in the same CSV (anchored on the exact
`/lessons/<id>.json` path to avoid substring collisions, e.g. `pv-04-01` vs `dpv-04-01`); no further
`CHOICE_SURFACE_INTEGRITY` rows exist for this scope beyond the five named in the brief.

## Method

`number-normalized-prompts` is produced by `scripts/audit/consolidate-pending-workload-s236.mjs`
(read in full): for every widget-bearing step it builds `template = prompt.toLowerCase().replace(digits→"#").replace(whitespace→" ")`
and flags every step after the first whose template repeats. It is a purely textual signal — it
cannot tell a deliberate contrastive pair (same sentence frame, opposite outcome or a swapped
constraint) from an accidental copy with new numbers. So every flagged step was read against every
other step sharing its template, using a bulk survey script
(`node` one-off reading every target lesson's `steps[].{id,kind,body,widget.prompt,widget.answer,
widget.options,variant,hints}` and grouping by normalized template) followed by full-file reads
wherever the survey left the job genuinely ambiguous (10 lessons: `cn-01-01`, `cn-01-02`, `cn-05-02`,
`mc-04-01`, `mc-04-03`, `qu-02-03`, `qu-04-02`, `se-02-02`, `se-03-03`, `les-04-01`, plus the 5
CHOICE-linked files read in full for the MCQ fix anyway).

Two classes:

- **(a) KEEP** — the repeat carries a real, distinct job: a different qualitative case (edge case,
  sign flip, order reversal, negative-vs-positive instance), a distinct named sub-skill the
  intervening concept step just introduced, an explicit self-declared fluency rep ("another one",
  "one more ... rep", "... again"), or genuine real-world context/representation variety that is the
  lesson's own stated purpose. Left untouched.
- **(b) REDESIGN** — the flagged step (in every case here, a `ch1` **challenge**) was the same
  action/representation/magnitude as an earlier step in the family with no added demand, despite
  being billed as harder ("one more corner", "a trickier ...", "full ... solve"). The flagged step was
  rewritten to differ in **action** (compute → invert-the-recipe; compute → judge/interpret) or
  **constraint** (even/positive coefficients → an odd coefficient forcing a fractional midstep and a
  sign-mixed trinomial; one-equation-scale-suffices → genuinely requiring both equations scaled), with
  every number recomputed and verified in a `node` one-off (never by hand), and every `commonError` /
  `numericError` trap re-checked to differ from the new answer and from every other trap.

Where a redesigned step's job diverged from what its authored `variant.gen`/`variant.form` generator
produces, `variant` was removed rather than left stale (**VARIANT_LOG debt**, matching the convention
in `laneA-s318-prog.jsonl`) — `src/lib/lessonVariants.ts`'s `refreshLessonSteps` regenerates any
step carrying a `variant` on every replay walk using that exact generator, so leaving a stale
`variant` in place would make the authored fix invisible after the first playthrough. Four steps
needed this: `sp-02-01/ch1`, `cn-01-01/ch1`, `cn-01-02/ch1`, `se-03-03/ch1`.

Only files under `content/courses/<course>/lessons/` were touched, and only the 33 lesson ids named
in the brief. No `src/**`, `scripts/**`, ledger, or other agent's staging file was edited or read for
write purposes. `npm`/`vitest`/`tsc`/build were never invoked — every number, JSON validity check, and
the MCQ-leak re-scan below ran through plain `node` one-offs, verified against the repo's own live
detector logic (`scripts/audit/consolidate-pending-workload-s236.mjs`'s duplicate/template scorer and
`scripts/audit/mcq-leakage.mts`'s `leaks()` function) ported verbatim into throwaway scripts, never
guessed by eye.

Disposition records are appended to `reports/closure/cowork-staging/laneA-s327-PG5.jsonl` (schema
`lesson-disposition`, one line per lesson, `decision:"KEEP"` per the closure schema — i.e. "this queue
row is now resolved" — with the (a)/(b) substance and all cross-fix detail carried in `rationale`).

---

## Verification tooling (used for every lesson, not just the CHOICE five)

1. **Duplicate/template collision scorer** — the exact `repeatedWidgets`/`repeatedPrompts`/
   `repeatedTemplates` logic from `consolidate-pending-workload-s236.mjs` (widget-signature equality,
   exact-prompt equality, and digit-normalized-template equality) ported into a `node` one-off and run
   against every one of the 33 post-edit files. Result: **zero** `duplicate-widgets` or `exact-prompts`
   anywhere (unchanged from the CSV baseline — this workstream was never about those two), and every
   `number-normalized-prompts` collision the CSV originally flagged is now either (a) still present and
   intentionally KEPT (29 lessons, unedited — collision list identical to the CSV `mismatch_evidence`),
   or (b) reduced by exactly the redesigned step for the 4 REDESIGN lessons (`sp-02-01`: `ch1` no longer
   in the 6-member collision list, `[k1,i2,i3,k2,k3]` remains as the intentionally-kept family;
   `cn-01-01`/`cn-01-02`: collision list now empty, `ch1` was each lesson's *only* flagged member;
   `se-03-03`: `ch1` no longer collides with `k2`, the separate intentionally-kept `[k1,i2]` pair
   remains).
2. **MCQ-leak detector** — the exact `leaks()` function from `scripts/audit/mcq-leakage.mts` (all seven
   tell codes: `length-prose-vs-prose`, `length-answer-explains-itself`, `lone-justification`,
   `absolutes-in-distractors-only`, `only-answer-completes-stem`, `only-numeric-option`,
   `only-option-with-a-unit`) copied verbatim (logic only, no TS types) into a `node` one-off. First
   run against the five known-leaking items **reproduced the CSV's exact stated evidence** (byte-for-byte
   matching detail strings, e.g. `"57 chars vs longest distractor 32"` for `cn-01-02/k3`), confirming
   the port is faithful. Every proposed fix was iterated against this same script until it returned
   `[]`. After editing, **every `mcq`-type widget step across all 33 lessons** (not only the five named
   ones) was re-scanned — **zero leaks found anywhere**, confirming no new leak was introduced and the
   five targeted ones are closed.
3. **JSON validity** — every one of the 33 files re-parses cleanly (`JSON.parse`, zero errors) after
   editing.

Both scripts, plus the per-lesson survey/full-context dumps and the arithmetic verification for every
redesigned step, were run as disposable `node` one-offs in the scratch directory — nothing under
`scripts/**` was created, edited, or executed.

---

## The four REDESIGN lessons (b)

### `sp-02-01` — Are Two Groups Really Different? (`sampling-and-probability`)

Flagged: `k1 i2 i3 k2 k3 ch1` (all share the `distributionCompareLab` "measure" template). Read: `i1`
(baseline 20/8/4→3), `i2` (zero-gap edge case, 12/12/2→0), `i3` (large-gap case, 90/66/6→4) are three
distinct qualitative cases tied to concept steps `c1/c2/c3`; `k1`/`k2` are explicit fluency reps (body
text literally "Another gap-in-units measurement."); `k3` (30/45/5→3, groups listed in reverse order)
tests order/sign-invariance. All six of those are legitimate and were **kept untouched**.

`ch1` (84/60/8→3, body "A trickier gap-in-units measurement.") was the outlier: same `measure`-mode
job, same magnitude class as `k1`–`k3`, no added demand despite its "trickier" billing — `k3` already
owns the only real transfer point in this family (order reversal). Redesigned into a **judge**-mode
interpretive task (schema confirmed via `DistributionCompareLabSpec` in `src/lib/schema.ts:2004`,
which declares `mode: z.enum(["measure","judge"])` with `gapUnits`/`judgeOptions`/`successFeedback` for
the judge branch — this exact shape is already used by four steps in sibling lesson `sp-02-02`, so the
pattern is proven, not invented): same numbers (84, 60, 8 → gap 3, recomputed:
`Math.abs(84-60)/8 === 3`), but now asks the learner to judge what a gap of 3 variability-units
*implies*, tied directly to `c3`'s own claim ("A large gap-in-units ... means the two groups' data
barely overlap, a strong sign of a real difference"). Three `judgeOptions` (correct + two
distractors, each with real feedback). `variant` removed — `g7-sp-gap-units`/`spGapChallenge` only
ever emits `measure`-mode content, so leaving it in place would have reverted the fix on every replay.

### `cn-01-01` — Building a Perfect Square (`complex-numbers`)

Flagged: `ch1` only (`k2` is the family's first occurrence). `k2` (x²+14x+___→49, "a bigger middle
term") and `ch1` (x²+18x+___→81, "one more corner") are the same forward "compute (b/2)²" job at the
same magnitude (both even, two-digit, positive `b`); `i2` already owns the lesson's only genuine
distinct case (negative `b`, "now with a minus"). Redesigned `ch1` into the **reverse** action: given
the completed-square constant, recover `b`. New prompt: *"The constant that completes the square for
x² + bx is 100. What POSITIVE value of b works?"*, answer `20`. Verified: `(20/2)**2 === 100`. Two
recomputed traps (`10`, "only b/2, double it"; `50`, "half of 100, not its square root"). `variant`
removed — `cn-square`/`completeConstant` only emits the forward job.

```
git diff --stat content/courses/complex-numbers/lessons/cn-01-01.json
 1 file changed, 14 insertions(+), 18 deletions(-)   # ch1 block only; confirmed by diff read
```

### `cn-01-02` — Completing the Square to Solve (`complex-numbers`)

Flagged: `ch1` only. `k1` (x²+6x+5=0→−1) is billed "Read off the roots" but its widget is actually the
full unscaffolded raw-quadratic job — `k2`, not `k1`, is the step that's actually given the
already-shifted form ("From (x − 2)² = 16, ..."). `ch1` (x²+8x+7=0→−1, "Full method, start to finish")
is therefore the same job as `k1` at the same magnitude (both even `b`, positive `c`). Redesigned `ch1`
to `x² + 5x − 6 = 0`: odd `b` (forcing `(5/2)² = 6.25`, a fractional midstep no sibling step needs) and
a **negative** constant term (a sign-mixed trinomial, vs. every prior example's positive `c`).
Verified by two independent routes: factoring, `(x+6)(x-1) = x²+5x-6` ✓ (roots `-6`, `1`); and the
taught method, `x²+5x=6 → (x+2.5)²=12.25 → x=-2.5±3.5 → 1 or -6` ✓ — larger solution `1`. Traps
recomputed (`-6` "smaller root"; `6` "sign slip"). `variant` removed — `cn-cts-solve` only emits the
plain even-`b`/positive-`c` job.

### `se-03-03` — Scale Both, and Special Cases (`systems-equations`)

Flagged: `i2 ch1`. Two independent families here. `k1`/`i2` ("scale both, then solve" / "scale both
again" — explicitly self-labeled a repeat) are legitimate spaced practice, **kept untouched**. `k2`/
`ch1` both ask "solve by elimination, what is x?", and `ch1` is billed "Full scale-both solve" — but
its own hints reveal the system `5x+2y=16` & `3x+4y=18` only needs the **first** equation scaled (y-
coefficients 2 and 4, one a multiple of the other), while `k2`'s system (`4x+3y=18` & `3x+2y=13`,
y-coefficients 3 and 2) genuinely needs **both** scaled. `ch1` was billed as the harder step but was
mechanically the easier one. Redesigned `ch1`'s system to `2x+3y=11` & `5x+2y=22` (y-coefficients 3 and
2 again, neither a multiple of the other, LCM 6 — genuinely forcing both equations to be scaled, by 2
and 3), and reworded the prompt itself ("Eliminate y from ... by scaling BOTH equations to match the
y-coefficients. What is x?" — a different sentence shape from `k2`'s "Solve the system ... by
elimination. What is x?", clearing the mechanical template match as well as the substantive one).
Verified two ways: direct elimination (`4x+6y=22`, `15x+6y=66` → `11x=44` → `x=4`, then `y=1`) and the
widget's own `affineRelationshipLab` line-intersection formula (`m1=-2/3, b1=11/3, m2=-5/2, b2=11` →
solved intersection `(4, 1)`, computed independently in `node` and matching exactly). `variant`
removed — the generator's draws are not guaranteed to require dual-scaling.

```
node collision-check (post-edit): only [k1,i2] remains — ch1/k2 collision resolved, k1/i2 intentionally kept
```

---

## The 29 KEEP lessons (a)

For each, the flagged steps' actual jobs (read in full, not assumed) are distinct enough that the
number-normalized-template match is a false positive for this workstream's purpose. One line each;
full reasoning is in the `rationale` field of the corresponding JSONL record
(`reports/closure/cowork-staging/laneA-s327-PG5.jsonl`) and was independently re-derived from the
lesson JSON, not copied between lessons:

| Lesson | Flagged | Why kept (one phrase) |
|---|---|---|
| `sp-02-02` | `i3 k3` | low-overlap / moderate / clearly-separated — three gap categories, dual-track with judge-mode interpretation steps |
| `sp-02-03` | `i2 i3 k2` | four different real-world domains — the lesson's stated purpose ("Real Situations") |
| `sp-03-01` | `k3` | p=1/20 "unlikely" vs. p=1 "certain" — different landmark points on the likelihood scale |
| `tm-01b-03` | `i2` | enlargement (k=2) vs. reduction (k=0.5) — the standard dilation-case contrast, plus a predict-then-verify demand |
| `tm-03-03` | `k2 k3` | trivial match → derived-third-angle match → deliberate AA-fails non-example |
| `tm-04-02` | `k2` | hypotenuse fluency reps separated by the missing-leg sub-skill (i2/c2) |
| `tm-04-03` | `i2` | deliberate converse-holds / converse-fails contrastive pair |
| `vec-01-01` | `k2 ch1` | sign-handling → shortcut-recognition → full-computation escalation across three named triples |
| `vec-02-01` | `k3` | degenerate axis-aligned intro vs. general two-nonzero-component addition |
| `vec-03-01` | `k2` | general dot-product computation vs. the special zero-result (perpendicularity) interpretation |
| `vec-05-01` | `k3` | two individually-named standard transformations (reflect over x-axis vs. y=x) |
| `cn-05-02` | `k1 ch1` | positive-center vs. negative-center root pair — forces the double sign-flip in −(sum) |
| `les-01-01` | `k3 ch1` | two-step fluency reps, separately escalating to negative-coefficient sign-handling |
| `les-01-02` | `i2 k3` | base intro, explicit smaller-x-term strategy sub-skill, fluency retrieval |
| `les-04-01` | `k3` | explicit "another coefficient case" rep of k2's just-introduced sub-skill; ch1 adds a subtraction term |
| `mc-03-02` | `k2 i2` | slider practice reps; straight-angle benchmark vs. plain acute reading |
| `mc-04-01` | `k2` | benchmark-producing sum vs. explicit "non-benchmark combination" |
| `mc-04-03` | `k3` | same 360°-around-a-point skill, interleaved with a distinct benchmark-selection sub-skill |
| `pv-03-02` | `k3` | hands-on single-trade practice pair before ch1's harder two-trade chain |
| `pv-04-01` | `k3` | "the small fact is big" — a named distinct digit-count constraint |
| `pv-04-02` | `k3` | explicitly self-labeled "one more calm-corner rep" |
| `qu-02-03` | `k3` | same base skill, interleaved with sum-of-roots and product-of-roots sub-skills |
| `qu-03-01` | `k3` | same base skill, interleaved with negative-root and shifted-square sub-skills |
| `qu-04-02` | `k3` | interleaved sub-skills; ch1 additionally requires modeling from words, not just solving |
| `se-01-02` | `k2` | second half of a designed x-then-y two-part pair, repeated with new systems |
| `se-02-02` | `k3` | targets the sign-distribution misconception the intervening c3 concept names |
| `ssg2-02-01` | `i3 k2 k3 ch1` | edge case, commutativity pair, fluency rep, engineered visual-trap challenge |
| `ssg2-02-02` | `k1 i2 i3 k2 k3 ch1` | lesson titled "Bigger Grids" — deliberate size/orientation ladder + explicit flip pair |
| `ssg2-02-03` | `k1 i2 i3 k2 k3 ch1` | lesson titled "Grids in Everyday Objects" — seven distinct real-world contexts |

---

## CHOICE_SURFACE_INTEGRITY cross-fixes (5, this lane's exclusive files this round)

All five verified against the ported `leaks()` (§ Verification tooling) both before (reproducing the
CSV's exact evidence) and after (returning `[]`) the edit. No option's `correct` flag, semantics, or
feedback truth was changed — only label wording/length, so every existing feedback string remains
literally true of its option.

| Lesson/step | Work id | Tell | Before | After |
|---|---|---|---|---|
| `cn-01-02/k3` | CHOICE-0006 | length-prose-vs-prose | correct 57 vs distractor max 32 | correct 57 vs distractor max 65 (three distractors lengthened, meaning unchanged) |
| `tm-04-02/k3` | CHOICE-0060 | length-prose-vs-prose | correct 84 vs distractor max 54 | correct 69 vs distractor max 67 (correct shortened, distractors lengthened) |
| `vec-03-01/k3` | CHOICE-0064 | length-prose-vs-prose | correct 25 vs distractor max 13 | all three restructured to one "name — threshold" shape, 19–25 chars |
| `les-01-02/k2` | CHOICE-0044 | length-answer-explains-itself | correct 54 (self-justifying dash clause) vs distractor max 34 | correct shortened to bare 24-char claim, matching distractor style |
| `mc-03-02/k3` | CHOICE-0046 | only-option-with-a-unit | correct carried a lone "N hours" digit+unit-word phrase (the `°` symbol itself never actually matches the detector — verified directly, see rationale) | justification moved out of the label (already in feedback); label now matches the other three options' bare dash-descriptor style |

`tm-04-02` and `vec-03-01`'s own `LESSON_PROGRESSION_AND_DUPLICATION` rows were **KEEP** (progression
untouched); `cn-01-02`'s was **REDESIGN** (§ above — both fixes landed in the same file, on different
steps: `k3` for CHOICE, `ch1` for progression); `les-01-02` and `mc-03-02`'s progression rows were also
**KEEP**.

---

## Gate state

- `node scripts/session/print-review-basis.mjs <all 33 ids>` — clean run, exit 0, 33/33 hashes
  returned, zero "unknown lesson" errors. Hashes recorded per-lesson in
  `reports/closure/cowork-staging/laneA-s327-PG5.jsonl`.
- All 33 files re-parse as valid JSON.
- Duplicate/template collision re-scan (own port of the consolidator's exact scorer): 29 KEEP lessons
  show collision lists byte-identical to the CSV's original `mismatch_evidence`; all 4 REDESIGN lessons
  show the flagged step's collision resolved while any separately-KEPT family in the same lesson is
  untouched.
- MCQ-leak re-scan (own port of `mcq-leakage.mts`'s `leaks()`) across every `mcq`-type step in all 33
  lessons: **zero leaks**, before-edit reproduction matched the CSV exactly, after-edit is clean.
- `npm run validate:content`, `npm run lint:pedagogy`, `npx vitest`, `tsc`, and any build were **not**
  run, per the container/lane constraint (2-CPU, 15 sibling agents) — all verification above ran
  through disposable `node` one-offs against ported copies of the repo's own detector logic, not
  against a guess of what that logic does.
- No escalations. Every one of the 33 rows and all 5 co-located CHOICE rows closed within this lane's
  file scope (`content/courses/{sampling-and-probability,transformations-measurement,vectors-matrices,
  complex-numbers,linear-equations-systems,measure-convert,place-value,quadratics,systems-equations,
  shapes-shares-g2}/lessons/`); nothing required `src/**`, `scripts/**`, or a new figure/generator.
