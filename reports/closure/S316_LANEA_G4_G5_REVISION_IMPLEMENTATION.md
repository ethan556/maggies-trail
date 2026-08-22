# S316 Lane A — measure-problems-g4 / unlike-fractions-g5 REVISE implementation

Scope: 12 lessons in `content/courses/measure-problems-g4/lessons/` (g4v-01-01..g4v-03-04) and
11 lessons in `content/courses/unlike-fractions-g5/lessons/` (g5u-01-01..g5u-01-04,
g5u-02-02..g5u-02-05, g5u-03-01, g5u-03-03, g5u-03-04), per the LATEST
`lesson-disposition` record for each lessonId in
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` (the `-lfnorm` mechanical re-basing
records; decision content unchanged from the prior record).

All 23 lessons carried decision `REVISE`. All 23 were revised (0 full rejections). Every
lesson's remedial concept+check was repaired per its rationale. 8 of the 12 g4v lessons carry
an additional named main-route figure defect that could **not** be fixed within this worker's
authority (lesson-JSON only) — see "Escalations" below.

## Common defect pattern (all 23 lessons)

Before this session, every lesson's `remedials[0]` had two problems the rationale named:

1. **No figure on the remedial concept step**, even though the main route's `c1`/`c2` concept
   steps carry a registered figure. A struggling learner routed into the remedial lost the
   visual representation entirely.
2. **The remedial check was a near-verbatim repeat of `k1` (or `k3`)** — same prompt, same
   options/answer, sometimes with only directive words added ("Sketch...", "Draw...",
   "Place...", "List...", "Mark...") that asked the learner to construct their own mental model
   instead of being shown one.

Fix applied to every lesson:

- Added `"figure"` to `remedials[0].concept`, choosing whichever of the lesson's own `c1`/`c2`
  figures is verified truthful/correct by the rationale for that lesson (never a figure the
  rationale itself flagged as mismatched).
- Replaced `remedials[0].check.widget` with a new item: same `conceptTag`, a genuinely
  different instructional job or misconception target than `k1`/`k2`/`k3`/`ch1`, new numbers
  where the attached figure is generic, or numbers matched exactly to the attached figure where
  the figure is a fixed worked example (fraction-bar figures in g5u). All commonErrors/feedback
  were recomputed from the new numbers; no feedback string is a stale copy referring to numbers
  the learner no longer sees. Self-construction language ("Sketch/Draw/Place/Mark/List...") was
  removed once an actual figure was supplied.

One additional edit: **g5u-01-04**'s remedial concept body/narration previously described a
"1/4 and 1/6 into twelfths" example, but the only registered figure for this concept
(`fm-common-denom`) actually renders "1/2 → 3/6, 1/3 → 2/6". No figure exists for the
1/4-and-1/6-into-twelfths example. To avoid shipping a figure that visibly contradicts its own
concept body (a representation mismatch), the body/narration text was rewritten to the
1/2-and-1/3-into-sixths example, preserving the identical pedagogical point ("different scaling
factors reach the same destination") with numbers the attached figure actually shows.

## Per-lesson detail

See `reports/closure/cowork-staging/laneA-g4-g5.jsonl` for the exact machine-readable change
list per lessonId/recordId. Summary by lesson:

### measure-problems-g4

| Lesson | recordId | Remedial figure attached | Remedial check replaced with |
|---|---|---|---|
| g4v-01-01 | S256-G4V-g4v-01-01-lfnorm | rr-conversion | ribbon 4 m=400 cm, "which operation" mcq |
| g4v-01-02 | S256-G4V-g4v-01-02-lfnorm | mc-length-ladder | table 2 m/5 m → predict 9 m numeric |
| g4v-01-03 | S256-G4V-g4v-01-03-lfnorm | rr-conversion | 4000 m ÷ 1000 (untested divide direction) |
| g4v-01-04 | S256-G4V-g4v-01-04-lfnorm | mc-mass-volume | 6000 g ÷ 1000 (untested divide direction) |
| g4v-02-01 | S256-G4V-g4v-02-01-lfnorm | mc-mass-volume | 34 L into 5-L jugs, remainder diagnostic |
| g4v-02-02 | S256-G4V-g4v-02-02-lfnorm | rr-chain | 180 s ÷ 60 (untested divide direction) |
| g4v-02-03 | S256-G4V-g4v-02-03-lfnorm | mb-multistep (c1, verified good) | 6 laps×350 m − 45 m early |
| g4v-02-04 | S256-G4V-g4v-02-04-lfnorm | rr-chain | 7 shifts×20 min − 15 min early |
| g4v-03-01 | S256-G4V-g4v-03-01-lfnorm | mb-multistep | 7 passes×$20 − $15 voucher |
| g4v-03-02 | S256-G4V-g4v-03-02-lfnorm | vm-total-length | 28 quarter-marks → 7 units |
| g4v-03-03 | S256-G4V-g4v-03-03-lfnorm | rr-chain | 6 shifts×35 min − 20 min early |
| g4v-03-04 | S256-G4V-g4v-03-04-lfnorm | two-step-bar (c2, partial) | inside-every-group mcq, 5×(200−30) |

### unlike-fractions-g5

| Lesson | recordId | Remedial figure attached | Remedial check replaced with |
|---|---|---|---|
| g5u-01-01 | S253-G5U-g5u-01-01-lfnorm | fm-add-unlike | diagnose re-adding denominators after renaming |
| g5u-01-02 | S253-G5U-g5u-01-02-lfnorm | fa-multiplier | diagnose scaling only the denominator (1/2→1/6) |
| g5u-01-03 | S253-G5U-g5u-01-03-lfnorm | ns-lcm | diagnose why 20 fails as a common denominator |
| g5u-01-04 | S253-G5U-g5u-01-04-lfnorm | fm-common-denom | diagnose applying one shared scale factor to both fractions |
| g5u-02-02 | S253-G5U-g5u-02-02-lfnorm | fa-improper-mixed | overflow/regroup transfer, 2 5/8+1 6/8 |
| g5u-02-03 | S253-G5U-g5u-02-03-lfnorm | fa-mixed-improper | 2 1/4 → 9/4 transfer |
| g5u-02-04 | S253-G5U-g5u-02-04-lfnorm | fa-mixed-improper | legal-trade transfer, 2 1/4 − 1 3/4 |
| g5u-02-05 | S253-G5U-g5u-02-05-lfnorm | fa-simplify | 6/8 ÷ 2 → 3/4 transfer |
| g5u-03-01 | S253-G5U-g5u-03-01-lfnorm | fa-compare-benchmark | gap-to-whole comparison, 2/3 vs 3/5 |
| g5u-03-03 | S253-G5U-g5u-03-03-lfnorm | fm-subtract-unlike | subtract-story transfer, 3/4→9/12−4/12 |
| g5u-03-04 | S253-G5U-g5u-03-04-lfnorm | ns-lcm | multistep transfer, 5/6 litre −1/4 +1/3 |

## Escalations (not fixable within lesson-JSON scope)

8 of the 12 g4v rationales also named a **main-route** (`c1` or `c2`) figure whose rendered
content does not match the lesson's stated numbers/example — e.g. g4v-01-02's `c1` uses
`ratio-table`, a static component hardcoded to a flour/milk 2:3 example, not the stated
meter/centimeter table; g4v-02-02's `c1` clock (`clock-face`) is fixed at 3:00 and never shows
60 minutes or 60 seconds; g4v-03-01's `c1` (`mmt-coin-total`) shows 23 cents from dimes and
pennies, not nine $25 passes minus $40; etc. Full list: g4v-01-02, g4v-02-01, g4v-02-02,
g4v-02-03, g4v-02-04, g4v-03-01, g4v-03-02, g4v-03-04 (g4v-03-04 has defects on **both** `c1`
and `c2`).

I confirmed every figure referenced by `"figure"` in lesson JSON (`src/components/figureIds.ts`,
1,979 entries) maps to a **static, zero-argument React component** in
`src/components/figures.tsx` — there is no mechanism for a lesson to parameterize a figure's
numbers via JSON. I searched `figures.tsx` for an already-registered figure whose numbers
actually match each flagged lesson (meter/centimeter table, 1,000 mL liter figure with worked
conversions, a clock explicitly showing 60/60, an equal-groups-then-single-subtraction bar, a
quarter-unit line plot with 8 marks at 1/4, a money-pass-and-voucher figure) and found none.
Fixing these requires either writing a new component in `src/components/figures.tsx` — a file
outside this worker's authorized scope (`content/courses/<course>/lessons/` only, and
`figures.tsx` is not a lesson file) — or an authored-content decision to change the lesson's
worked numbers to match an existing figure. Both are judgment calls / new-mathematics-adjacent
changes this worker is instructed not to make unilaterally. **Recorded as an open item for a
human/next-lane decision, not silently dropped or hidden by a mismatched figure swap.**

No lesson was rejected outright — every lesson's remedial (the one component of the rationale
fully achievable in lesson-JSON) was fixed. The residual main-route figure defects above remain
open and are not marked `rejected: true` in the NDJSON ledger because real, in-scope progress
was made on each of those 8 lessons; they should be re-queued for a worker with figures.tsx
authority (or a content-numbers-to-match-figure decision) rather than closed.

## Verification performed

- `json.load()` parse-check on all 23 edited lesson files: **23/23 OK**.
- Programmatic check across all 23 remedial checks: no duplicate MCQ option ids, exactly one
  `correct: true` per mcq, no duplicate option labels, all feedback strings ≥25 characters, no
  feedback opens with a negation (`^(no|not|wrong|incorrect|sorry|try again|nope)`), numeric
  `answer`/`commonErrors` values have no collisions within an item, every remedial concept now
  carries a `figure` key. **All clear.**
- Programmatic check that no remedial check prompt string duplicates any of that lesson's
  `k1`/`k2`/`k3`/`ch1` prompt strings. **0 duplicates.**
- Manually re-derived every new/changed numeric answer and every mcq's correct option by hand
  (shown in the design work above) before writing it into JSON.

## Files touched

- `content/courses/measure-problems-g4/lessons/g4v-01-01.json` through `g4v-03-04.json` (12 files)
- `content/courses/unlike-fractions-g5/lessons/g5u-01-01.json`, `g5u-01-02.json`,
  `g5u-01-03.json`, `g5u-01-04.json`, `g5u-02-02.json`, `g5u-02-03.json`, `g5u-02-04.json`,
  `g5u-02-05.json`, `g5u-03-01.json`, `g5u-03-03.json`, `g5u-03-04.json` (11 files)
- `reports/closure/cowork-staging/laneA-g4-g5.jsonl` (created — 23 NDJSON rows)
- `reports/closure/S316_LANEA_G4_G5_REVISION_IMPLEMENTATION.md` (this file)

No other files were read for editing purposes beyond what's listed as read-only evidence
(course.json, figures.tsx, figureIds.ts, schema.ts, the repair script and repair report, the
decision ledger) — none of those were modified.

## Gates

Per instructions, this worker does not run npm/vitest/tsc/build (shared box; gates run
centrally). Only `json.load()` parse-checks and the programmatic structural checks above were
run. `npm run typecheck`, `npx vitest run`, `npm run validate:content`, `npm run
lint:pedagogy`, `npm run validate:native`, and the build were **not run by this worker** and
their results are unknown until the central gate run — do not treat this packet as gate-green.
