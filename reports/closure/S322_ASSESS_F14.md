# S322 Assessment F14 — linear-functions, volume-measurement

Independent course assessor pass over two complete courses (24 lessons total: 12 + 12). Read-only on
content; dispositions staged (not ledger-written) at
`reports/closure/cowork-staging/laneB-s322-F14-dispositions.jsonl`. Every disposition supersedes any
prior decision on these lesson IDs.

Prefix `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` read and obeyed: the repository source and the
current workload queue (`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`) are authoritative; any cached or prior
assessor's prose is evidence only and cannot approve its own work. No npm/vitest/tsc was run.

## Method

Every one of the 24 lessons was read in full (every step's body, widget, `commonErrors`/`commonBuilds`/
`numericErrors`, predict/reveal, `cml`, remedial, and referenced figure). Every numeric/mcq/challenge
answer was hand-recomputed (slopes, intercepts, form conversions, unit conversions, line-plot fraction
arithmetic, unit-cube counts, `V = l×w×h` / `V = B×h`, composite-volume decompositions cross-checked
against a second legal cut).

`node scripts/session/print-review-basis.mjs <id>` was run for all 24 lessons to record the current
review-basis hash in each disposition (`reports/cache` derived data was not used as a hash source).

**Figure truth.** A scratch `npx tsx --tsconfig scripts/audit/tsconfig.figure-ssr.json` probe called the
real `isFigureTextAligned` (`src/lib/figureTextAlignment.ts`, not reimplemented) against every
concept-step figure/body pair in both courses: **27/27 aligned, 0 mismatches**. This included an
independent re-verification of `vm-04-01/c1`'s figure binding (`vm-sixty-cube-box`, the S320/S321 fix
for the prior `box-layers`/60-cube-figure mismatch documented in `S320_SMALL_DEBT_FIXES.md` and
verified in `S321_VERIFY_IMPL78.md`) — confirmed still bound correctly and text-aligned at current
source, and `vm-04-01/c2`'s sibling figure `vm-base-layers` confirmed unchanged.

**Duplicate scans (both required kinds).** A byte-identical widget-signature scan and a full-object
numeric-signature (prompt-excluded) scan were run across every widget-bearing step in both courses:
zero collisions of either kind, in either course. Separately, the exact live detector
(`repeatedTemplates` from `scripts/audit/consolidate-pending-workload-s236.mjs`, replicated verbatim by
reading its source, not reimplemented from memory) was run against `lesson.steps` prompts. This
reproduced `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`'s **9 open `PROGRESSION-lf-*` rows exactly**
(`lf-01-01, lf-01-03, lf-02-01, lf-03-01, lf-03-02, lf-03-03, lf-04-01, lf-04-02, lf-04-03`) — the
claim in the task brief is accurate and live, not stale. `volume-measurement` has **zero** queue
`PROGRESSION-vm-*` rows and the detector reproduces zero collisions on all 12 lessons, confirmed clean.

Each of the 9 flagged `lf-*` lessons was read concretely to decide whether its same-template repeat
carries a genuinely distinct instructional job (a real escalation in sign complexity, representation,
or scaffolding role — explicit in body text and in the specific misconception each `commonErrors`/
distractor targets) or is a bare clone. **6 of the 9 are legitimate escalation/scaffolding, not
defects** (see per-lesson rationale in the JSONL); **3 are genuine repeats without a distinct job**
(`lf-02-01`'s and `lf-03-03`'s open rows resolved as legitimate too, but `lf-03-03`'s pair is the
weakest-differentiated case reviewed and is noted honestly rather than silently waved through).

**Shuffle/lab-fixed checks.** Confirmed `seededShuffle` (`src/lib/prng.ts`) drives both the mcq
render order (`McqW`, `widgets.tsx:448`) and the predict-option render order (`LessonPlayer.tsx:118`),
and that `matchPairs`' right-hand column is independently seeded-shuffled (`widgets.tsx:15869`).
Neither course uses `ProportionalReasoningLabW`/`PercentChangeLabW` (the S316/S320 lab-shuffle-fix
targets), so that specific regression class does not apply here; `buildExpression`'s bank uses the
established grouped/shuffle-fallback ordering (`widgets.tsx:16086-16110`), confirmed present and
correctly avoiding an authored-order leak in every `buildExpression` step used by `linear-functions`.

**Schema/lint.** Real `Lesson` Zod schema (`src/lib/schema.ts`) + real `lintLesson`
(`src/lib/pedagogy.ts`), run via `npx tsx` against all 24 lesson files: **24/24 schema-valid, 0/24
lint findings**.

## Per-course counts

| Course | Lessons | KEEP | REVISE | ESCALATE |
|---|---|---|---|---|
| linear-functions | 12 | 9 | 3 | 0 |
| volume-measurement | 12 | 12 | 0 | 0 |
| **Total** | **24** | **21** | **3** | **0** |

## REVISE list (one-phrase reasons)

1. **lf-02-03** (`x-intercept vs y-intercept`) — step `i3` uses a `quadraticExplore` (vertex-form
   parabola) widget to stand in for "where a line with y-intercept 5 crosses the axis"; the rendered
   equation/aria-label are always parabola notation (`y = a(x-h)²+k`, never `2x+5`) and at the target
   state the curve is flat (slope 0) — the promised line with slope 2 never actually renders.
2. **lf-04-01** (`Line from a Point and a Slope`) — `k2` and `ch1` both drill "subtract m times a
   negative x₁" with no other differentiation, and `ch1`'s own "Two negatives to manage" framing isn't
   realized (its slope is +4, not negative); `k1`/`k3` are also a bare clone of the same mcq template.
3. **lf-04-03** (`Parallel & Perpendicular Lines`) — two same-job duplicate pairs collapse 4 of 7
   widget steps: `k1`/`k3` (whole-number-slope flip) and `i2`/`ch1` (fraction-slope flip) each drill
   the identical mechanical task with only cosmetic number changes.

All three REVISE lessons have correct underlying mathematics; the defects are representation choice
(`lf-02-03`) and progression-duplication without a distinct instructional job (`lf-04-01`, `lf-04-03`).
Implementation contracts are recorded in full in each lesson's JSONL rationale.

## Raw data

- Staging file: `reports/closure/cowork-staging/laneB-s322-F14-dispositions.jsonl` (24 records, one
  per lesson; `recordId` = `S322-F14-<lessonId>`).
- Review-basis hashes: computed via `node scripts/session/print-review-basis.mjs` for all 24 lessons
  in two batched calls (one per course), recorded verbatim in each disposition's `reviewedBasisHash`.
- Figure-alignment probe: `npx tsx --tsconfig scripts/audit/tsconfig.figure-ssr.json` against the real
  `isFigureTextAligned`, scratch script deleted after use — 27/27 concept-step figure bindings aligned.
- Duplicate-detector replica: `repeatedTemplates` logic read verbatim from
  `scripts/audit/consolidate-pending-workload-s236.mjs` and re-run against current source — reproduces
  `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`'s 9 `PROGRESSION-lf-*` rows exactly; 0 `PROGRESSION-vm-*` rows.
- Schema/lint probe: real `Lesson` schema + `lintLesson`, run via `npx tsx` — 24/24 valid, 0 findings.
- No ledger file was written. No content file was edited.
