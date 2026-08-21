# S321 — Independent Verification: S320 Implementation Packets 7–8 + Small-Debt Packet

Reviewer: Claude Cowork independent verifier (S321). Reviewed at: 2026-08-20T20:20:25.000Z.
Authority: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (repository source and the four contract
files — `S320_ASSESS_A6.md`, `S320_ASSESS_A7.md`, `S320_ASSESS_A3.md`, `S320_ASSESS_A9.md` — are
authoritative; the two implementer-claim documents, `S320_IMPL_A6_A7.md` and
`S320_IMPL_A3_A9_WIDGET.md`, plus `S320_SMALL_DEBT_FIXES.md`, are evidence only and were read
**after** forming an independent view from `git diff` + hand arithmetic + direct source reading).
Read-only on all content and code; the only writes are this report and
`reports/closure/cowork-staging/laneV-s321-impl78-dispositions.jsonl` (28 records).

## Scope

28 lessons total, all already implemented and committed (working tree clean, commit
`a78d6a3` on top of base `ae399cc`):

- **Lane A (impl-7, 20 lessons)**: `pv2-01-01, pv2-02-01, pv2-04-01, pv2-04-02, pv2-04-03` (place-value-million);
  `g4x-01-03, g4x-03-02, g4x-03-04` (fraction-multiply-g4); `g3a-02-03, g3a-03-01, g3a-03-02, g3a-03-03`
  (add-subtract-1000-g3); `fa-04-02` (fractions-add); `fm-04-02` (fractions-multiply);
  `g5f-01-03, g5f-01-04, g5f-02-03, g5f-03-02, g5f-03-03, g5f-03-04` (fraction-division-g5).
- **Lane B (impl-8, 5 lessons + 1 widget code fix)**: `sp-03-03, sp-04-02` (sampling-and-probability);
  `tf-03-02` (trig-functions); `ti-05-03` (trig-identities-equations); `cg-03-03` (coordinate-geometry);
  plus `DistributionCompareLabW` measure-mode shuffle fix in `src/components/widgets.tsx`.
- **Small-debt packet (3 lessons)**: `vm-04-01` (volume-measurement, figure rebinding + additive
  `VmSixtyCubeBox`/`vm-sixty-cube-box`), `g4m-02-05` (mult-div-fluency-g4), `ns-01-01` (number-system).

## Method

For every one of the 28 lessons: read the REVISE contract text (A6/A7/A3/A9, or the small-debt
packet's own self-contained defect writeup for the 3 small-debt items, which cites
`S319_EARLY_MID_VERIFICATION.md`/`S319_FIG_HS_VERIFICATION.md` as the originating discrepancy
reports); ran `git diff ae399cc a78d6a3 -- <file>` to see the exact byte-level change; recomputed
every arithmetic/algebraic claim by hand (or via a scratch `npx tsx` probe against the real
`src/lib/evaluate.ts`/`schema.ts`/`pedagogy.ts`/`figureTextAlignment.ts`/`widgets.tsx` modules,
never a reimplementation); grepped for reintroduced duplication; confirmed `git diff --stat` scoped
to each course directory touched only the intended file(s); only **then** read the implementer's
own claim documents to cross-check. Basis hashes for all 28 lessons were computed via
`node scripts/session/print-review-basis.mjs` in one bulk call (exit 0, no missing lessons).

## Verdict counts

**28/28 KEEP, 0 REVISE, 0 ESCALATE.** Every REVISE contract from A6/A7/A3/A9 and every small-debt
defect writeup was implemented exactly as specified, with no collateral damage and no residual or
newly introduced defect found.

| Field | KEEP | REVISE | ESCALATE |
|---|---|---|---|
| `decision` | 28 | 0 | 0 |
| `visualDecision` | REQUIRED×16, SUFFICIENT×12 | — | — |
| `gradeLanguageDecision` | FIT×28 (4 lessons — `pv2-01-01`, `g5f-01-03`, `g5f-01-04`, `g5f-03-02` — were originally `REVISE` in the A6/A7 contracts for a language-clarity defect; all 4 confirmed fixed, now FIT) | 0 | 0 |

## Cascade/trade recount audits (per the method's CRITICAL instruction)

- **pv2-04-01** (156,489 + 267,742): column-by-column — ones 9+2=11(carry), tens 8+4+1=13(carry),
  hundreds 4+7+1=12(carry), thousands 6+7+1=14(carry), ten-thousands 5+6+1=12(carry),
  hundred-thousands 1+2+1=4. Result **424,231**. Five carries → **5 trades**, confirming the fix
  ("three-trade" → "five-trade cascade") is correct.
- **pv2-04-02** (6,412 − 1,847): ones 2<7 break→12−7=5, tens 0<4 break→10−4=6, hundreds 3<8
  break→13−8=5, thousands 5−1=4. Result **4,565**, **3 breaks** (ones/tens/hundreds) — confirms
  "One break." → "Three breaks." (83,251 − 46,378): ones/tens/hundreds/thousands all break, ten-
  thousands is the untouched source → **4 breaks**. Result **36,873** — confirms "ones, tens, and
  hundreds" → "ones, tens, hundreds, and thousands."
- **g3a-03-02 no-carry verifications**: 132+400 — ones 2+0=2, tens 3+0=3, hundreds 1+4=5, **zero
  carries**, result 532 (distractor 432 differs only in the miscopied hundreds digit 4 vs 5,
  consistent with the new "copied down wrong" feedback, not the old false "missing carry" feedback).
  272+417 — ones 2+7=9, tens 7+1=8, hundreds 2+4=6, **zero carries**, result 689 (distractor 589,
  same pattern). Both confirm the fix replaces a false claim with a true one.

## Widget verdict (impl-8 Task A — not a lesson disposition, per instructions)

`DistributionCompareLabW`'s measure mode was unshuffled (raw `spec.measureChoices.map(...)` render
order) while its sibling judge mode already used a seeded `orderedJudgeOptions` shuffle — the A3
report's ESCALATE finding (correct answer sat at index 1 in 20/21 authored instances across 6
lessons). The applied fix adds `orderedMeasureChoices = useMemo(() => seededShuffle(...), [seed,
spec])`, keyed by the same seed convention as `orderedJudgeOptions`, and renders it in place of
`spec.measureChoices`. Independently confirmed:

- The shuffle is a display-order-only change: each button still prints its own `choice.label ??
  fmt(choice.value)`.
- Every grading/feedback/describe path I could find that touches `distributionCompareLab` measure
  mode keys strictly on `choice.value`, never array position — read directly in
  `src/lib/evaluate.ts` at all four relevant sites (`evaluate()` ~865, `canCheck()` ~2420,
  `correctAnswerText()` ~2800, `learnerAnswerText()` ~3107) and confirmed `onChange(choice.value)`
  is what the button's `onClick` calls.
- `git diff --stat` confirms this is the only functional hunk in `widgets.tsx`; the comment above
  the old code (claiming measure order was "part of the ruler/measurement model") was rewritten to
  record the true finding.

**Verdict: fix is correct and evaluator-safe.** No lesson-content edit was needed or made in any of
the 6 escalated lessons (`sp-02-01`, `sp-02-02`, `sp-02-03`, `sp-02b-01`, `sp-02b-02`,
`sp-02b-03`) — none of those 6 lessons are in this packet's 28-lesson scope and none received a
disposition record here; this verdict is reported per instructions, not signed as a lesson
disposition.

## Non-KEEP reasons

None. All 28 dispositions are KEEP. (For completeness: 4 lessons — `pv2-01-01`, `g5f-01-03`,
`g5f-01-04`, `g5f-03-02` — had a pre-fix `gradeLanguageDecision = REVISE` in their originating A6/A7
contracts; the underlying language defects — a scratch/self-correction fragment, a prompt/option
mismatch, a "metre" vs. "cup" unit inconsistency, and an answer-leaked-in-prompt — are all confirmed
fixed and are now `FIT`.)

## Discrepancies found

**None.** Every one of the 28 `git diff` hunks matched its contract's exact prescribed fix (in
several cases, verbatim to the contract's own suggested replacement text/numbers, e.g. `fm-04-02`'s
"5/3 × 9", `ti-05-03`'s "2 sin x cos x = −cos x", `cg-03-03`'s `[6, 3, 5.2]`, `sp-04-02`'s
"1/2 × 1/3 = 1/6", `g5f-03-02`'s reworded prompt). `git diff --stat` scoped to each of the 13
touched course directories showed **only** the intended file(s) changed — no collateral edits to
sibling lessons, `course.json` files, or unrelated corpus content. The one code file touched
(`src/components/widgets.tsx`) received exactly the one contracted hunk (plus its updated comment);
`src/components/figures.tsx`/`figureIds.ts` received exactly the one additive `VmSixtyCubeBox`
registration for the small-debt packet (`box-layers` itself and `asv-05-01`'s binding to it
confirmed byte-unchanged). One unrelated addition (`MonomialDistributeArea` /
`monomial-distribute-area`) appears in the same `figures.tsx` diff window but belongs to a
different, unrelated packet folded into the same combined S320/S321 commit — not part of this
packet's scope, not claimed by either implementer document, and not a discrepancy against the small-
debt contract's own file list.

## Raw data / spot-verification log

- **28/28 basis hashes** computed via `node scripts/session/print-review-basis.mjs <28 ids>` in one
  call, exit 0, recorded verbatim in each disposition's `reviewedBasisHash`.
- **Figure verification (`vm-04-01`)**: scratch `npx tsx --tsconfig scripts/audit/tsconfig.figure-ssr.json`
  probes against the real `src/lib/figureTextAlignment.ts` and `src/components/figures.tsx`/`figureIds.ts`
  confirmed: `isFigureTextAligned("vm-sixty-cube-box", c1.body)` → `true`; `"vm-sixty-cube-box"` present
  in both `FIGURES` and `FIGURE_IDS`; rendered polygon count `180` (= 4×3×5×3 faces/cube, hand-expected);
  `"box-layers"` still registered and `asv-05-01`'s own `{c1: "box-layers", c2: "box-layers"}` binding
  unchanged.
- **Schema/lint verification**: scratch `npx tsx` probe importing the real `Lesson` Zod schema
  (`src/lib/schema.ts`) and `lintLesson` (`src/lib/pedagogy.ts`) against all 4 small-debt-adjacent
  files (`vm-04-01.json`, `g4m-02-05.json`, `g4m-02-03.json`, `ns-01-01.json`) → 4/4 schema-valid,
  0/4 lint findings. `ns-01-01.json` grepped for `wait[,:]|scratch|todo|fixme|xxx` (case-insensitive)
  → zero matches.
- **cg-03-03 triangle**: independently re-derived the widget's own side/vertex convention by reading
  `ShapeHierarchyLabW` (`src/components/widgets.tsx` ~19047-19082: `shapeSides = sides ?? ...`,
  `[left,right,base]=shapeSides`, `foot=(left²−right²+base²)/(2·base)`), then hand-applied the law of
  cosines to `[6,3,5.2]`: angle at L ≈ 30.0°, at T ≈ 60.1°, at R ≈ 89.9° (sum 180°, small residual
  purely from rounding 3√3=5.196… to authored 5.2) — matches the printed `triangleAngles:[30,60,90]`
  labels at those same vertices. `schema.ts`'s `shapeHierarchyTriangleLabels`/`shapeHierarchyChoiceCorrect`
  confirmed to read only the two authored arrays (never the rendered SVG), so grading (`"right"` +
  `"scalene"` → choice `"a"`) is unaffected.
- **Duplication re-scans**: for every REVISE'd MCQ/numeric/estimateSlider/trialProbabilityLab item,
  grepped the new prompt/fact against every sibling lesson named in its contract's "unused elsewhere"
  claim (`g4x-*`, `g5f-*`, `sp-03-0x`, `g4m-02-0x`) — zero collisions found in every case checked.
- **File-scope audit**: `git diff ae399cc a78d6a3 --stat -- content/courses/<course>/` run for all
  13 touched courses — each shows exactly the lesson file(s) named in that course's contract(s),
  nothing else.

## Files touched by this verification pass

- `reports/closure/cowork-staging/laneV-s321-impl78-dispositions.jsonl` (created, 28 records)
- `reports/closure/S321_VERIFY_IMPL78.md` (this file, created)

No content, code, or contract file was edited.
