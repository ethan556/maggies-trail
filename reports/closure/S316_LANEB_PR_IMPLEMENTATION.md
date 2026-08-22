# S316 Lane B — Proportional Relationships — Implementation of the 9 REVISE contracts

Worker: Claude Cowork bounded implementation worker (proportional-relationships S316)
Scope: `content/courses/proportional-relationships/lessons/*.json` only, per the assessor's
contracts in `reports/closure/S316_LANEB_PROPORTIONAL_RELATIONSHIPS_ASSESSMENT.md` and the
staged dispositions in `reports/closure/cowork-staging/laneB-proportional-relationships-dispositions.jsonl`.
Per-lesson NDJSON: `reports/closure/cowork-staging/laneB-pr-implementation.jsonl`.

**Scope adjustment applied**: the unshuffled-choice defect in `proportionalReasoningLab` and
`percentChangeLab` (the P0 CHOICE_SURFACE_INTEGRITY finding) is fixed at the widget level
(`seededShuffle` landed in `src/components/widgets.tsx`). No lesson content was reordered for
that reason — correct-first remains the authoring convention. This closes pr-04-02 with **zero
content changes** (its only REVISE reason was that defect). It also means pr-02-01/02/03 needed
only their **duplication** fix in content, not a choice-reorder.

## Lessons touched (8 of 9; pr-04-02 required no edit)

| Lesson | Change class | Steps changed |
|---|---|---|
| pr-01-01 | false-feedback fix | k2 |
| pr-01-02 | false-feedback fix | k1, i3, k3, ch1, remedial |
| pr-01-03 | false-feedback fix | k2, remedial |
| pr-02-01 | duplication fix | ch1 |
| pr-02-02 | duplication fix | k1, i2, k2, remedial |
| pr-02-03 | duplication fix | i1, k1, i2, i3, k2, k3, remedial |
| pr-03-01 | duplication fix | k3, ch1 |
| pr-04-02 | none needed | — |
| pr-04b-02 | false-feedback fix | ch1 |

All edits preserve step IDs, `conceptTag` values, widget `type` fields, authored prose (lesson
bodies, concept explanations), and MCQ correct-first ordering. `git diff --stat` confirms exactly
these 8 files changed (plus `pr-04-02.json` untouched, verified byte-identical).

## False-feedback fixes — arithmetic verification

For each, the flagged `commonErrors`/`numericErrors` value is kept (it is a plausible real
misconception) and the feedback text is rewritten to name the operation that actually produces
that value, per the assessment's recommended approach.

| Lesson | Step | Value | Old (false) claim | Actual source (verified by hand) |
|---|---|---|---|---|
| pr-01-01 | k2 | 32 | "(1/8)÷(1/4)" (=0.5, not 32) | Invert **both** fractions and multiply denominators: 4×8=32 |
| pr-01-02 | k1 | 49 | "multiplies the fractions directly" (=0.383) | Numerators only, denominators dropped: 7×7=49 |
| pr-01-02 | i3 | 10 | "multiplies the fractions directly" (=0.08) | First fraction's numerator × its own denominator: 2×5=10 |
| pr-01-02 | k3 | 10 | same | same (identical 2/5-in-1/5 numbers) |
| pr-01-02 | ch1 | 9 | "multiplies the fractions directly" (=0.09) | Numerators only, denominators dropped: 3×3=9 |
| pr-01-02 | remedial | 25 | garbled, un-attributed | Numerators only: 5×5=25 |
| pr-01-03 | k2 | 10 | "multiplies the fractions directly" (=0.08) | 2×5=10 (same pattern as pr-01-02 i3/k3) |
| pr-01-03 | remedial | 25 | garbled, un-attributed | Numerators only: 5×5=25 |
| pr-04b-02 | ch1 | 1920 | "takes 8% OF 240" (=19.2, not 1920) | Treats "8%" as a bare ×8: 240×8=1920 |

All correct answers (2, 2, 2, 2, 2, 2, 2, 2, 3000 respectively) were left untouched — only the
distractor's diagnostic text changed. Confirmed by hand: `4×8=32`, `7×7=49`, `2×5=10` (×2),
`3×3=9`, `5×5=25` (×2), `240×8=1920`.

The task brief named only `k2`/`k1`,`i3`,`k3`,`ch1`/`k2`/`ch1` for pr-01-01/02/03/04b-02
respectively. pr-01-01's `k1` (flagged by the assessor as merely "vague," not false) was
deliberately left unchanged — out of the contract's explicit step list. The two remedial checks
in pr-01-02 and pr-01-03 share the *identical* garbled string and defect class as the contracted
steps in the same files already being edited, so they were fixed too for internal consistency
(both are the "feedback literally true" hard rule, not a new judgment call).

## Duplication fixes — new numbers and re-derived truth

Chapter 2 (pr-02-01/02/03) reused roughly six tables across nine graded/interactive steps, both
within and across all three lessons. Fix strategy: the **first** occurrence of each table in
reading order (pr-02-01's i1/k1/i2/i3/k2/k3; pr-02-02's k3/ch1) was left as the canonical anchor;
every later duplicate (same-lesson or cross-lesson) got a fresh table, per CLAUDE.md's "new
dimension, not a wider axis" rule — new pair sets with new constants, not just bigger numbers
along the same pattern.

| Lesson.step | Old table (dup of) | New table | k / answer |
|---|---|---|---|
| pr-02-01.ch1 | (2,6)(3,9)(5,15), dup of own i1 | (2,10)(4,20)(6,30) | k=5, proportional |
| pr-02-02.k1 | (1,4)(2,8)(10,40), dup of pr-02-01.k1 | (1,6)(3,18)(9,54) | k=6 |
| pr-02-02.i2 | (3,2)(6,4)(9,6), dup of pr-02-01.k2 | (4,3)(8,6)(12,9) | k=3/4 |
| pr-02-02.k2 | (3,2)(6,4)(9,6), dup of its own i2 | (5,3)(10,6)(15,9) | k=3/5 |
| pr-02-02.remedial | (2,6)(3,9)(5,15), dup of pr-02-01 table | (2,10)(4,20)(5,25) | k=5 |
| pr-02-03.i1 | (2,6)(3,9)(5,15), dup of pr-02-01.i1 | (2,14)(3,21)(5,35) | k=7, proportional |
| pr-02-03.k1 | (2,6)(3,9)(5,15), dup of own (pre-edit) i1 | (2,18)(4,36)(6,54) | k=9 |
| pr-02-03.i2 | (2,6)(3,10)(5,15), dup of pr-02-01.i2 | (6,18)(8,25)(10,30) | k=3, not proportional (25/8=3.125) |
| pr-02-03.i3 | (3,9)(5,15) x=7→21, dup of pr-02-02.ch1 | (2,14)(4,28) x=5→35 | k=7 |
| pr-02-03.k2 | (3,2)(6,4)(9,6), dup of the chapter's recycled fractional table | (7,3)(14,6)(21,9) | k=3/7 |
| pr-02-03.k3 | k=4 x=5→20, dup of pr-02-02.k3 | k=6 x=7→42 | 42 |
| pr-02-03.remedial | (2,6)(3,9)(5,15) | (2,14)(3,21)(5,35), mirrors new i1 | k=7 |

pr-03-01 (within-lesson only): `k3` was byte-identical to `i2` ("for k=3, plot (1,3) and
(2,6)"); `ch1` was byte-identical to `i3` ("for k=4, plot (1,4) and (2,8)"). Both fixed within
`plotPoint`'s 8×8 grid cap (`MAX_PLOT_POINT_DIM=8` in `src/lib/schema.ts` — see "caught before
shipping" below): `k3` now plots a fractional rate 1.5 at (2,3)/(4,6); `ch1` now plots a
*shallower* rate 2/3 at (3,2)/(6,4), with an added "assumes a 45° line" trap that makes the
challenge genuinely harder rather than a copy of the interactive example.

### Arithmetic verification (all new tables, hand + script)

Every new table's ratios were recomputed and cross-checked against `proportionalReasoningTruth()`
in `src/lib/schema.ts` (rate = y/x per pair; `constant = rates[0]`; `proportional` iff every rate
is within 1e-9 of the constant) via a Python re-implementation run against the edited JSON:

- pr-02-01.ch1: 10/2=20/4=30/6=5 → proportional:yes ✓
- pr-02-02.k1: 6/1=18/3=54/9=6 ✓; .i2: 3/4=6/8=9/12=0.75 ✓; .k2: 3/5=6/10=9/15=0.6 ✓; .remedial: 10/2=20/4=25/5=5 ✓
- pr-02-03.i1: 14/2=21/3=35/5=7 → proportional:yes ✓; .k1: 18/2=36/4=54/6=9 ✓; .i2: 18/6=30/10=3 but 25/8=3.125 → proportional:no ✓; .i3: 14/2=7, 7×5=35 ✓; .k2: 3/7=6/14=9/21≈0.428571428571 ✓; .k3: (after fix) 6/1=6, 6×7=42 ✓
- pr-03-01.k3: 3/2=6/4=1.5 ✓; .ch1: 2/3=4/6 ✓

Ran a Python-simulated `proportionalReasoningTruth()` against every touched
`proportionalReasoningLab` widget and confirmed the correct choice/value in each `choices` array
matches the computed `answerNumber`/`answerClaim`, and that every `numericErrors` value is
distinct from both the answer and every other trap (trap-vs-answer and trap-vs-trap guard, per
CLAUDE.md rule 4).

## Two defects caught before finalizing (not shipped)

1. **Grading/prose mismatch in pr-02-03.k3.** First draft changed the prompt text and feedback to
   claim "constant of proportionality 6... y=42" but left `widget.series[0].pairs` at the
   pre-edit `[[1,4]]`. `proportionalReasoningTruth()` derives the *graded* answer from
   `series[0]` (rate = y/x, `constant = rates[0]`), never from prompt prose — so the actual
   grading would have silently computed `4×7=28` as correct while every visible string in the
   step said 42. Caught by hand-simulating the truth function against the edited JSON before
   finalizing; `series` corrected to `[[1,6]]`.
2. **Schema-limit violation in pr-03-01.** First draft gave `k3`/`ch1` 10×10 and 12×12 grids to
   fit new whole-number k values without reusing i2/i3's exact points. `PlotPointSpec` in
   `src/lib/schema.ts` caps `cols`/`rows` at `MAX_PLOT_POINT_DIM = 8` — both drafts would fail
   content validation. Redesigned around fractional rates (1.5 and 2/3) that fit inside the
   required 8×8 grid instead of widening it.
3. **Trap-collides-with-answer in pr-02-02.k1.** After retabling to (1,6)/(3,18)/(9,54), k=6, the
   second `numericErrors` trap was initially left at `value: 6` — identical to the new correct
   answer, because the new table's first pair `(1,6)` makes the first-pair y-value equal the
   constant whenever x=1. Caught by a scripted trap-vs-answer sweep across all 8 edited files;
   corrected to `value: 18` (the second pair's y-value), matching the original file's own pattern
   of using a non-first-pair y-value as this trap.

## Verification performed

- `python3 -c "import json; json.load(open(f))"` on all 9 touched-or-reviewed files — all parse.
- `git diff --stat -- content/courses/proportional-relationships/` — confirms exactly the 8
  intended files changed; `pr-04-02.json` untouched.
- `git diff` line-level review of every changed file — confirms no `conceptTag`, step `"id"`, or
  widget `"type"` line was touched anywhere.
- Cross-lesson normalized-duplicate sweep (Python one-liner, digits→`#`) across
  pr-02-01/02/03 non-remedial widget prompts: only the accepted own-lesson
  remedial-mirrors-primary-step pattern remains (pr-02-01 i1↔remedial, pr-02-03 i1↔remedial).
  Exact-string (non-normalized) sweep confirms the same.
- Table-level sweep (comparing `series[0].pairs` tuples, not just prompt text) across the same
  three lessons: same result — zero non-remedial cross- or within-lesson duplicates remain.
- `plotPoint` sweep on pr-03-01: zero non-remedial duplicate prompts/targets; all `cols`/`rows`
  ≤ 8.
- Full trap-vs-answer / trap-vs-truth collision sweep across all 8 edited files (`numeric`,
  `fractionEntry`, and `proportionalReasoningLab` widgets): zero collisions after the pr-02-02.k1
  fix.
- Feedback length (≥25 chars) and no-leading-negation check on every rewritten false-feedback
  string: all pass.

**Not run, per task instructions**: `npm run typecheck`, `npx vitest run`,
`npm run validate:content`, `npm run lint:pedagogy`, `npm run validate:native`,
`node scripts/check-registration.mjs`, `npm run build`. This packet is an implementation worker
packet, not a closer; per the authority contract in
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, "An implementation worker cannot assess or close
its own packet" — the full gate sequence and independent re-assessment are for the next owner.

## What was not touched / could not be fixed here

- **pr-04-02**: zero content changes. Its only REVISE reason (unshuffled `percentChangeLab`
  choices) is a shared-component fix already landed outside this worker's file scope.
- **pr-01-01 k1**: the assessor's rationale called this commonError "vague," not false, and it is
  not in the implementation contract's explicit step list — left unchanged.
- Standards mappings, accessibility, and any content outside the 9 named lessons were out of
  scope and not reviewed.

## Return

packet_id: S316-LANEB-PR-IMPLEMENTATION-1
scope_ids: pr-01-01, pr-01-02, pr-01-03, pr-02-01, pr-02-02, pr-02-03, pr-03-01, pr-04-02, pr-04b-02
status: 8/9 lessons edited, 1/9 (pr-04-02) confirmed no-change-required; all 9 REVISE contracts addressed
changed_file_hashes: see `reports/closure/cowork-staging/laneB-pr-implementation.jsonl` (`postEditSha256` per lesson)
gates_passed: parse-check (9/9), hand-arithmetic re-derivation, truth-function simulation, cross-file duplicate sweep, trap-collision sweep, feedback length/negation check
gates_failed: none run (npm/vitest/tsc/build intentionally not run per task instructions)
new_decision_required: independent re-assessment and full gate sequence by the next owner (this worker cannot close its own packet)
