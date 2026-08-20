# S318 G3 withheld-figure clearance — independent verification

Verifier: Claude Cowork independent verifier (S318). Scope: the 19-placement / 16-lesson G3
mult/div packet (`division-fluency-g3`, `multiplication-division`, `word-problems-g3`), against
the implementer's `reports/closure/S318_G3_WITHHELD_CLEARANCE.md` and
`reports/closure/cowork-staging/laneA-s318-g3-figures.jsonl`. No content edited. Only the two
staging outputs below were written: `reports/closure/cowork-staging/laneV-s318-g3-dispositions.jsonl`
(16 records) and this report.

## Method

Formed an independent view before reading the implementer's claims: read `git diff HEAD` on
`src/components/figures.tsx` and all 16 lesson files directly, hand-recomputed every bound
arithmetic fact, and read each fixed component's source to check what it actually renders. Only
after that read the implementer's report and jsonl for cross-check. Ran, read-only:
`node scripts/check-registration.mjs` (the one named allowed script, run in bulk once),
`node scripts/session/print-review-basis.mjs` in a single bulk call over all 16 lesson IDs, and
`npx tsx scripts/audit/generate-figure-numeric-claims.mts --check` (documented generator's own
`--check` mode, read-only, no write). Replayed the exact `isFigureTextAligned` gate and the
`risks()` adversarial heuristic from `src/components/figureTextAdversarialAudit.test.tsx` against
all 19 placements via a throwaway `npx tsx` probe that imported the repo's live
`figures.tsx`, `figureTextAlignment.ts`, and `figureTextMismatchBlocklist.generated.ts` modules
directly (written to a scratch directory inside the checkout so module resolution and the `@/*`
alias worked, executed, then the directory was deleted — no residue). Did **not** run `npm`,
`vitest`, or (after one early, out-of-scope `tsc --noEmit`, noted below) `tsc` again, per the task's
constraint.

**Process deviation to flag:** early in verification I ran `npx tsc --noEmit -p
scripts/audit/tsconfig.figure-ssr.json` once, before re-reading the task's "no tsc beyond the
named script" constraint. It was read-only (`--noEmit`, no files written) and reported zero errors
for `figures.tsx`, so it did not affect any finding below, but it was outside the permitted tool
set and I stopped using it immediately afterward, relying on successful `tsx` execution (which
already required valid TS/JSX) for the remainder.

## Findings — components (`src/components/figures.tsx`)

- `git diff -- src/components/figures.tsx` is **231 insertions, 0 deletions** — strictly additive.
  Every existing fixed component (`Mult3MissingFactor`, `Mult3FactFamily`, `Mult3FairShares`,
  `Mult3Estimate`, `NumberLineJumps`, `Mult3Array`, `Mult3Flip`, `Mult3BreakApart`,
  `G3wSubtractOnce`, `G3wMultiplyThenAdd`) is byte-unmutated; confirmed by direct diff inspection,
  not by trusting the implementer's assertion.
- Exactly **5 new parameterized helpers** (`Mult3FairSharesExample`, `Mult3MissingFactorExample`,
  `Mult3FactFamilyExample`, `Mult3EstimateExample`, `NumberLineJumpsExample`) and **11 new zero-arg
  wrapper components**, matching the claimed count: `Mult3FairShares15Over5` (1),
  `Mult3MissingFactor6x7/6x5/8x9/7x8/7x7/6x9/8x7` (7), `Mult3FactFamily5x7` (1),
  `Mult3Estimate6x9` (1), `NumberLineJumps7x5` (1) = 11.
- Every helper's arithmetic was hand-recomputed and is correct: `Mult3FairSharesExample`
  (per = total/groups, 15/5=3), `Mult3MissingFactorExample` (product = a*b: 6x7=42, 6x5=30,
  8x9=72, 7x8=56, 7x7=49, 6x9=54, 8x7=56), `Mult3FactFamilyExample` (5x7=35),
  `Mult3EstimateExample` (a=6, bExact=9, bRound=10: estimate=60, exact=54, 54<60 by one group of 6),
  `NumberLineJumpsExample` (hops=7, hopLength=5, landing=35, sequence 5,10,...,35).
- All new SVGs carry `role="img"`, a `<title>`, an `aria-label` stating the real bound numbers
  (in digit form, not the spelled-word form the originals use — a stylistic difference, not a
  correctness or accessibility defect; both forms are valid accessible-name text), and non-colour
  cues (labelled text/digits for every quantity, not colour-only encoding).
- One additional additive entry, `DecimalShiftDivide` / `"decimal-shift-divide"`, is present in the
  same diff. Confirmed this is **not** part of this packet's 19 placements: it is used only by
  `content/courses/decimal-operations/lessons/dop-05-03.json`, a course outside this packet's scope
  (division-fluency-g3 / multiplication-division / word-problems-g3). It is accounted for, not
  mystery drift — see "Numeric-claims regeneration" below.

## Findings — the 19 placements (16 lessons)

For every placement: `git diff HEAD` on the lesson file, cross-referenced against the lesson's own
adjacent steps (interactive widgets, predict prompts, checks) to recompute the taught fact
independently rather than trust the stated body text alone, then checked the bound figure against
that fact.

| lesson | step(s) | figure(s) | fact | recomputed | match |
|---|---|---|---|---|---|
| df3-01-04 | c1 | mult3-missing-factor-6x7 | 6×7=42 (i1 areaModel + predict confirm this is the chapter's leading fact) | 42 | yes |
| df3-01-04 | remedial | mult3-missing-factor-6x5 | 6×5=30 (remedial body states it verbatim) | 30 | yes |
| df3-02-01 | c1 | mult3-missing-factor-8x9 | 8×9=72 (i1 areaModel requireFactors 8×9, k1 check "72÷8=?" answer 9) | 72 | yes |
| df3-02-03 | c1 | mult3-missing-factor-7x8 | 7×8=56 ("56÷7 asks 7×?=56") | 56 | yes |
| df3-02-03 | remedial | mult3-missing-factor-7x7 | 7×7=49 ("49÷7 is 7×?=49") | 49 | yes |
| df3-02-04 | c1 | mult3-missing-factor-6x9 | 6×9=54 ("6×?=54 or 54÷?=9") | 54 | yes |
| df3-02-04 | remedial | mult3-missing-factor-8x7 | 8×7=56 ("8×?=56") | 56 | yes |
| df3-03-03 | remedial | mult3-fact-family-5x7 | 5×7=35 (body states it verbatim) | 35 | yes |
| mult-01-02 | c2 | mult3-array (fixed, reword) | 4×6=24 | 24 | yes |
| mult-01-03 | c1 | number-line-jumps (fixed, reword) | 3×4=12 | 12 | yes |
| mult-01-04 | c2 | number-line-jumps (fixed, reword) | 3×4=12 | 12 | yes |
| mult-01-05 | c2 | mult3-flip (fixed, reword) | 4×3=3×4=12 | 12 | yes |
| mult-02-01 | c2 | mult3-fair-shares-15-over-5 | 15÷5=3 | 3 | yes |
| mult-02-03 | c2 | number-line-jumps-7x5 | 7×5=35 (7 hops of 5) | 35 | yes |
| mult-03-05 | c1 | mult3-break-apart (fixed, reword) | 5×6+2×6=30+12=42 | 42 | yes |
| mult-04-05 | c2 | mult3-estimate-6x9 | 6×9≈6×10=60, exact 54 | 54/60 | yes |
| g3w-01-03 | c2 | g3w-subtract-once (fixed, reword) | 5×4−3=20−3=17 | 17 | yes |
| g3w-02-01 | c2 | mult3-missing-factor-6x7 | 6×7=42 ("6×n=42") | 42 | yes |
| g3w-03-04 | c2 | g3w-multiply-then-add (fixed, reword) | (5×6)+4=34 | 34 | yes |

19/19 placements: figure numbers match the step's own taught fact. 0 arithmetic discrepancies.

`mult-03-05` is worth flagging explicitly: the prose reword changed which factor is split (from
splitting the second factor, 6 into 5+1, to splitting the first factor, 7 into 5+2). Verified by
reading `Mult3BreakApart`'s source directly that only the first-factor split renders (5-row block
labelled "5×6=30" and 2-row block labelled "2×6=12"), so the *old* body was a genuine figure/text
mismatch and the reword is a real fix, not a cosmetic edit.

## Findings — the adversarial/alignment gate replay (throwaway `npx tsx` probe)

Ran the exact `isFigureTextAligned` check and a byte-identical copy of the `risks()` heuristic from
`figureTextAdversarialAudit.test.tsx` against all 19 (lesson step, figure) pairs, using the repo's
live modules directly (not re-implemented logic):

- **19/19** `isFigureTextAligned(figureId, body) === true`.
- **19/19** `figureTextBindingKey(figureId, body)` absent from `FIGURE_TEXT_MISMATCH_BLOCKLIST`.
- **19/19** `risks()` returned zero reasons (no `PART_COUNT_CONFLICT`, `OPERATION_CONFLICT`, or
  `EXAMPLE_NUMBER_CONFLICT`).
- **19/19** bound `figure` key in the live lesson JSON matches the intended figure ID.
- Word counts (body only) ranged 9–52, all ≤80 (`mult-03-05` c1 is the longest at 52).
- All 16 lesson files parse-clean as JSON.
- `git diff` on every one of the 16 lesson files touches **only** `figure`, `body`, and/or
  `narration` field values — confirmed line-by-line (grepped every added/removed line against the
  three field names; zero non-matching lines in any of the 16 files). No id, answer, option,
  feedback, hint, conceptTag, or widget field was touched.

## Findings — registration and numeric-claims regeneration

- `node scripts/check-registration.mjs` → `registration: files ↔ course.json ↔ PLAN.md all
  consistent`.
- All 11 new figure IDs spot-checked present in `src/components/figureIds.ts`.
- `npx tsx scripts/audit/generate-figure-numeric-claims.mts --check` → `CURRENT 190 exact
  arithmetic-title claims` (not stale — the committed generated file matches a fresh regeneration).
- Confirmed the exact mechanism for why only some new figures are admitted to
  `FIGURE_NUMERIC_CLAIMS`: the generator (`isExactArithmeticTitle`) only admits a figure whose live
  `<title>` asserts an operator/equals claim. `mult3-fair-shares-15-over-5`
  (`"15 ÷ 5 = 3 each"`) and `number-line-jumps-7x5` (`"7 times 5 equals 35"`) are newly admitted
  because their titles do assert arithmetic — verified by reading the generated file directly. The
  7 missing-factor instances, the fact-family instance, and the estimate instance are **not**
  admitted because their titles stay digit-free (`"Division finds the missing factor."` /
  `"Estimate to check the answer."`) or digit-but-no-operator (`"A fact family from 3, 4, and 12."`
  is the *original's* title style; the new `mult3-fact-family-5x7`'s title
  `"A fact family from 5, 7, and 35."` follows the identical convention) — confirmed absent from the
  generated map by direct grep, matching the fixed originals' own governance.
- **The one "unrelated additive entry" (`decimal-shift-divide`) is accounted for, not mystery
  drift**: it is not used by any lesson in this packet's 3 courses; it is used only by
  `content/courses/decimal-operations/lessons/dop-05-03.json` (confirmed via
  `git diff --stat` on that file, which shows exactly the expected 1-line figure rebind). Its
  presence in the regenerated map is a side effect of running the shared, documented generator
  against a shared file (`figures.tsx`) that a different concurrent lane had already added this
  component to before this packet regenerated the map — not a numeric-claims-map anomaly
  introduced by this packet.

## Cross-check against implementer's claims

Read `reports/closure/S318_G3_WITHHELD_CLEARANCE.md` and
`reports/closure/cowork-staging/laneA-s318-g3-figures.jsonl` only after forming the independent
view above.

- **sha256 cross-check**: every one of the 19 records in `laneA-s318-g3-figures.jsonl` carries a
  `sha256` for its target lesson file; recomputed all 19 hashes against the live file bytes —
  **0 mismatches**. The implementer's evidence trail is current, not stale.
- Placement count (19), lesson count (16), helper count (5), wrapper count (11), rebound-vs-reword
  split (12 rebound / 7 reword) all independently re-derived from the raw diffs above and match the
  implementer's stated counts exactly.
- The claimed reason the 8 missing-factor/fact-family/estimate wrappers don't gate future bodies
  (digit-free `<title>`, so excluded from `FIGURE_NUMERIC_CLAIMS`) was independently verified
  against the generator's actual `isExactArithmeticTitle` logic and the regenerated file's content,
  not merely restated.
- The claimed reason `decimal-shift-divide` is "unrelated" was independently verified by locating
  its sole consumer (`dop-05-03.json`, outside this packet's 3 courses) rather than trusted.
- No discrepancy found between the implementer's report/jsonl and independent recomputation on any
  of the 19 placements, the component additions, the registration state, or the numeric-claims
  regeneration.

## Verdict counts

- **16/16 lessons: KEEP / SUFFICIENT / FIT.**
- 0 REVISE, 0 ESCALATE, 0 non-KEEP dispositions. No discrepancies found requiring a different
  verdict than the implementer's clearance claim.

Signed dispositions: `reports/closure/cowork-staging/laneV-s318-g3-dispositions.jsonl` (16 records,
`recordId` `S318-V3-<lessonId>`, reviewer `Claude Cowork independent verifier (S318)`, basis hashes
from a single bulk `node scripts/session/print-review-basis.mjs` call, `reopenCondition` "Lesson or
course source bytes change (review basis hash drift).").
