# S318 Lane A — HS/advanced-course WITHHELD figure clearances

Worker: Claude Cowork implementation (sole owner `src/components/figures.tsx` this round).
Obeyed `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte: repository source is
authoritative; `reports/vis/VIS01_PLACEMENTS.csv` (cause != `RENDERS`) is the binding evidence
enumerating this packet's scope, and `reports/closure/S317_FIGURE_TRUTH_FIXES.md` is the proven
protocol this packet follows.

Scope (enumerated exactly from `VIS01_PLACEMENTS.csv`, one course match per bullet in the brief,
two for `exponential-functions`): `exponents-polynomials` (`ep-01-01`), `exponents-scientific-notation`
(`esn-01b-01`), `exponential-functions` (`exp-02-03` x2), `function-transformations` (`ft-03-02`),
`logarithms` (`lg-05-03`), `proportional-relationships` (`pr-04-02`), `rational-number-operations`
(`rno-01-03`), `right-triangles-trig` (`rt-02-01`), `systems-equations` (`se-03-03`),
`sequences-series` (`sr-01-01`), `decimal-operations` (`dop-05-03`). 12 placements total, 11 lesson
files (one file, `exp-02-03.json`, carries two placements).

## Result

**12 / 12 cleared. 0 fail-closed.**

| # | Lesson / step | Figure | Cause | Resolution |
|---|---|---|---|---|
| 1 | ep-01-01 / c1 | exponent-repeat | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD (+ parity `missing=3+2+5`) | Reword restates 3, 2, 5 |
| 2 | esn-01b-01 / c1 | exponent-repeat | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD | Reword adds ASCII "(3 + 2 = 5)" |
| 3 | exp-02-03 / c2 | exp-grow-50 | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD | Reword restates "1 + 1/2 = 1.5" |
| 4 | exp-02-03 / c3 | exp-decay-50 | WITHHELD_BLOCKLIST_FINGERPRINT (manual hold `67c19c25`) | Reword + retired dangling manual hold |
| 5 | ft-03-02 / c1 | stretch-reflect | WITHHELD_BLOCKLIST_FINGERPRINT | Reword + cleared heuristic risk |
| 6 | lg-05-03 / c1 | log-scale-ladder | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD | Reword restates magnitude 3 and x1000 |
| 7 | pr-04-02 / c2 | pr-markdown | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD | Reword restates "x 0.95" |
| 8 | rno-01-03 / c1 | integer-jump | WITHHELD_BLOCKLIST_FINGERPRINT | Reword + cleared heuristic risk |
| 9 | rt-02-01 / c2 | sohcahtoa-triangle | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD | Reword restates 3-4-5 triangle |
| 10 | se-03-03 / c2 | se-scale-both | WITHHELD_BLOCKLIST_FINGERPRINT | Reword + cleared heuristic risk |
| 11 | sr-01-01 / c1 | recursive-vs-explicit | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD | Reword restates 5, 3, 15 (a6=19) |
| 12 | dop-05-03 / c2 | decimal-shift -> decimal-shift-divide | WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD (genuine wrong-figure) | New additive component + rebind |

## Fix 1 — exponents-polynomials / ep-01-01 (`c1`, `exponent-repeat`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES.**

`exponent-repeat`'s fixed contract (`FIXED_NUMERIC_EXEMPLAR_CONTRACTS`) is `"a^3 x a^2 = a^5; 3 + 2
= 5."`. `c1`'s original body taught the product/quotient rules entirely in variables (`a^m . a^n =
a^(m+n)`), so `compareFigureNumericParity` found `figureAtoms=[3,2,5]` against `textAtoms=[]` --
`FIXED_VALUE_MISMATCH[missing=3+2+5]`, exactly the pre-existing finding
`scripts/audit/fixed-figure-numeric-parity.mts` had separately flagged for this same placement.
Added one worked instance inline: `"for example, a^3 . a^2 = a^5, since 3 + 2 = 5"`, immediately
before the general rule sentence. Recomputed `compareExactFigureNumericParity` against the real
module: `aligned: true, reasons: []`. Re-ran the whole-repo parity audit
(`npx tsx scripts/audit/fixed-figure-numeric-parity.mts --json`, read-only) after the fix: 0
`unsafeFindings`, 0 `rows` across all 79 fixed-numeric-exemplar placements repo-wide -- this
placement no longer appears, confirming both the guard and the parity finding cleared together.

## Fix 2 — exponents-scientific-notation / esn-01b-01 (`c1`, `exponent-repeat`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES (recognition-gap fix).**

Same shared `exponent-repeat` exemplar, a different lesson. `c1`'s original body already narrated
the exact 3/2/5 relationship correctly, in words ("three a's ... two more ... multiplying five
a's") and in superscript unicode (`a³.a²=a⁵`) -- but `signedRationalAtoms` only recognizes ASCII
digit characters (`\d`), so superscript `³`/`²`/`⁵` never registered as atoms, leaving `textAtoms`
empty despite truthful prose. This is a pure recognition gap, not a content defect. Appended the
literal ASCII parenthetical `"(3 + 2 = 5)"` right after the existing `a³.a²=a⁵` sentence so the
guard's atom-matcher sees the same numbers the prose already states. Verified `isFigureTextAligned`
now `true` and the new binding key (`40fa5e42`) absent from the blocklist.

## Fix 3 — exponential-functions / exp-02-03 (`c2`, `exp-grow-50`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES (notation-form fix).**

`exp-grow-50`'s registered `FIGURE_NUMERIC_CLAIMS` entry states the base as both `"1 + 1/2"` and
`"1.5"`. `c2`'s body worked `M(2) = 16.(3/2)^2 = 36` correctly but wrote the base only as the
fraction `3/2`, never as `1 + 1/2` or `1.5` -- mathematically identical (`3/2 = 1.5`) but a
different string, so `compareExactFigureNumericParity` reported
`EXACT_RENDERED_VALUE_MISMATCH[missing=1+1/2+1.5]`. Inserted `"means the base is 1 + 1/2 = 1.5
(also written 3/2)"`; every subsequent computed value (16, 24, 36, `M(2)`, `9/4`) is unchanged.

## Fix 4 — exponential-functions / exp-02-03 (`c3`, `exp-decay-50`) + manual-hold retirement

**Resolution: REWORDED PROSE OFF THE STALE FINGERPRINT, then retired the now-dangling manual hold
(S317 fix-4 precedent).**

`exp-decay-50` is not in `FIXED_NUMERIC_EXEMPLAR_CONTRACTS` or `FIGURE_NUMERIC_CLAIMS`, so its
withhold came purely from the raw blocklist hash. That hash, `67c19c25`, was carried by an active
`CURRENT_MANUAL_HOLD` row in `src/lib/figureTextMismatchBlocklist.manualHolds.ts` whose own
`reason` field already stated: *"The candidate scan no longer emits a high-confidence token
conflict, but no independent fixed-number, numeric-parity, or legacy runtime guard withholds this
currently bound exponential-decay figure."* -- i.e. the hold itself documented that the content was
fine. `c3`'s body (losing 50% from 80 -> `D(x) = 80.(1/2)^x` -> 80, 40, 20) already agreed exactly
with the figure's rendered title. Per the task brief's explicit instruction for this placement,
minimally paraphrased `c3` (same numbers 50/80/40/20, same add-vs-subtract framing) so its binding
key moves from `67c19c25` to `4ee4868e`, confirmed absent from the generated blocklist.

This makes the `67c19c25` `CURRENT_MANUAL_HOLD` row dangling (no live placement binds that key
anymore). Following the exact precedent already documented in the same file (the retired
`0dc18745` / `cpr-03-03` hold from S317 fix 4), removed the row and added a matching dated comment
explaining the retirement. The legacy `67c19c25` key remains in the monotonic generated blocklist
file (`figureTextMismatchBlocklist.generated.ts`) untouched -- only the manual-hold reference to it
was removed, per the task's explicit one-time exception for this specific hold ("do NOT disturb a
hold that binds correctly unless your content fix makes it dangling, in which case retire it").

```ts
export const CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS: readonly FigureTextMismatchManualHold[] = [
  /* S317 (2026-08-20): the 0dc18745 hold ... was retired. ... */
  /* S318 (2026-08-20): the 67c19c25 hold for exp-02-03/exp-decay-50 was retired. ... */
];
```

(The array's type annotation was changed from `as const satisfies readonly
FigureTextMismatchManualHold[]` to an explicit `: readonly FigureTextMismatchManualHold[]`
declaration -- with zero elements, TypeScript's `const`-literal inference would otherwise narrow the
array to `readonly []` / element type `never`, breaking every `.bindingKey`/`.reason` access in
`figureTextAdversarialAudit.test.tsx`. Caught by `npx tsc --noEmit`; fixed by typing the export
explicitly rather than relying on literal inference of an empty array.)

## Fix 5 — function-transformations / ft-03-02 (`c1`, `stretch-reflect`)

**Resolution: REWORDED PROSE OFF THE STALE FINGERPRINT, verified against BOTH guards.**

`stretch-reflect` is not in any fixed-numeric-claim registry; the withhold was a pure stale
blocklist hash (`ea3f0e7e`), with no manual hold referencing it. A first-draft minimal paraphrase
cleared `isFigureTextAligned`, but replaying the repo's *separate* adversarial candidate scanner
(`figureTextAdversarialAudit.test.tsx`'s `risks()` heuristic) against both the original and the
reworded body showed the SAME `EXAMPLE_NUMBER_CONFLICT[figure=2+3;text=1+0]` in both -- a
pre-existing characteristic of this pairing (the figure's live SVG title says "2.f(x)" and "Three
parabolas"; the prose's only digits are the symbolic thresholds `|a|>1` and `0<|a|<1`), not
something the reword introduced. Since a heuristically-flagged pairing that also renders (i.e.
`isFigureTextAligned=true`) trips that test's stricter "no unreviewed REVIEW row" invariant, added a
second, true clause reusing the figure's own worked instance: `"for example, 2.f(x) stretches every
output to double height"`. This clears both guards simultaneously: `isFigureTextAligned=true` and
the heuristic scanner's `risks()` now returns `[]` for this pairing.

## Fix 6 — logarithms / lg-05-03 (`c1`, `log-scale-ladder`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES.**

`log-scale-ladder`'s registered claim names magnitudes 3, 4, 5, 6 and factors x1, x10, x100,
x1000. `c1`'s original body named only magnitudes 4, 5, 6 (omitting 3) and only the x10/x100
factors (omitting x1000) -- `EXACT_RENDERED_VALUE_MISMATCH[missing=3+1000]`. Added the missing
rungs: `"stepping from magnitude 3 to 4, 5, and 6 multiplies the shaking by x10, x100, and x1000"`
and `"a magnitude-6 quake shakes 1000 times harder than a magnitude 3"` (mathematically exact:
10^1=10, 10^2=100, 10^3=1000). The existing magnitude-6-vs-5 and magnitude-6-vs-4 comparisons are
unchanged.

## Fix 7 — proportional-relationships / pr-04-02 (`c2`, `pr-markdown`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES.**

`pr-markdown`'s registered claim is `"$80 x 0.95 = $76"`. `c2`'s body worked the subtraction path
(`5% of $80 = $4`, `$80 - $4 = $76`) correctly but never stated the equivalent multiplier form
0.95 -- `EXACT_RENDERED_VALUE_MISMATCH[missing=0.95]`. Appended `", the same as multiplying $80 x
0.95"` -- both paths are mathematically identical (100% - 5% = 95% = 0.95). `c3` (a different,
generic step later in the same lesson, no explicit numbers) binds the same figure separately and
was not touched or re-checked as part of this scope (it was not on the WITHHELD list).

## Fix 8 — rational-number-operations / rno-01-03 (`c1`, `integer-jump`)

**Resolution: REWORDED PROSE OFF THE STALE FINGERPRINT, verified against BOTH guards.**

`c1`'s original generic rule statement already matched `integer-jump`'s `genericText` contract
pattern (`/any two integers?.*signs? first/`), but hashed to a stale blocklisted key (`0535c53e`,
no manual hold). A first-draft reword cleared that key, but the adversarial heuristic scanner still
flagged `EXAMPLE_NUMBER_CONFLICT` between the figure's live SVG title numbers (4, 5, 9, from
`"negative four plus nine equals five"`) and the prose's incidental word-numbers ("one", "two") --
verified this exact conflict shape was already present in the ORIGINAL body too (replayed the
heuristic against both). Added a concrete worked instance restating the figure's own example:
`"for instance, -4 + 9 = 5, since 9 is farther from zero than 4"`. This keeps
`isFigureTextAligned=true` (still matches the `genericText` pattern; the new explicit claim also
parity-matches the figure's contract exactly) and clears the heuristic scanner (4, 5, 9 now overlap
between figure and text).

## Fix 9 — right-triangles-trig / rt-02-01 (`c2`, `sohcahtoa-triangle`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES.**

`sohcahtoa-triangle`'s registered claim renders a fixed 3-4-5 triangle (`sin=3/5, cos=4/5,
tan=3/4`). `c2`'s body defines the three ratios purely symbolically (`theta`,
opposite/hypotenuse, etc., no digits) -- but `hasExplicitNumericOrSymbolicClaim` returns `true`
anyway, because the SOH-CAH-TOA mnemonic's hyphens (`"h-c"`, `"h-t"`) satisfy the checker's
letter-followed-by-operator heuristic for a symbolic expression. That routes the pairing through
the exact-parity branch, where `figureAtoms=[3,4]` against `textAtoms=[]` produced
`FIXED_VALUE_MISMATCH`+`EXACT_RENDERED_VALUE_MISMATCH[missing=3+4]`. Added a genuinely useful
concrete instance: `"In a 3-4-5 right triangle, sin theta = 3/5, cos theta = 4/5, and tan theta =
3/4"` -- mathematically exact (3^2+4^2=5^2=25) and restates the figure's own fixed values.

## Fix 10 — systems-equations / se-03-03 (`c2`, `se-scale-both`)

**Resolution: REWORDED PROSE OFF THE STALE FINGERPRINT, verified against BOTH guards.**

`se-scale-both` is not in any fixed-numeric-claim registry; the withhold was a pure stale
blocklist hash (`ea3f7fde`, no manual hold). A first-draft reword (using symbolic `x3`/`x2`,
matching the original's own style) cleared `isFigureTextAligned` but still tripped the adversarial
heuristic's `OPERATION_CONFLICT[figure=multiplication;text=subtraction]` -- the SAME conflict the
ORIGINAL body already had (verified by replay): the figure's live SVG title literally says
`"multiply the first by three ... second by two"`, but both the original and first-draft reworded
prose used the symbol `x`/`×` rather than the word "multiply", so the heuristic's word-based
operation matcher only ever saw "subtract" in the text. Changed `"Scale the first by 3"` /
`"Scale the second by 2"` to `"Multiply the first equation by 3"` / `"Multiply the second by 2"` --
the same operation, now spelled the way the figure's own title already spells it, with no change to
any number (`6x+9y=39`, `6x+4y=24`, `5y=15`, `y=3`, `x=2`, LCM=6 all unchanged).

## Fix 11 — sequences-series / sr-01-01 (`c1`, `recursive-vs-explicit`)

**Resolution: REWORDED PROSE TO RESTATE THE FIGURE'S EXACT VALUES.**

`recursive-vs-explicit`'s registered claim describes a long jump "from the first box straight to
the last, labeled plus 5 times 3 equals plus 15" -- i.e. a demonstration that the explicit rule can
leap ahead 5 terms (5x the common difference 3 = 15) in one step. `c1`'s body defined the sequence,
the recursive rule, and the explicit rule correctly but never demonstrated that leap --
`EXACT_RENDERED_VALUE_MISMATCH[missing=5+15]`. Added a worked instance: `"a6 leaps 5 steps of +3 at
once: 4 + 5.3 = 4 + 15 = 19"` -- arithmetically exact for `a_n = 4 + (n-1).3` at `n=6`
(`4 + (6-1).3 = 4 + 15 = 19`, verified both by hand and by a `it()` assertion in the new test file)
and restates the figure's own 5, 3, 15. Trimmed the intro slightly ("There are two ways to write
its rule" / "Same sequence -- two very different instructions" removed) to land the final body at
69 words, safely under the 80-word concept cap (the first draft, with those sentences kept, was 89
words).

## Fix 12 — decimal-operations / dop-05-03 (`c2`, `decimal-shift` -> new `decimal-shift-divide`)

**Resolution: NEW ADDITIVE PARAMETERIZED COMPONENT + REBIND** (the one genuine wrong-figure
placement in this packet, not just a wording/hash issue).

Confirmed `decimal-shift` is used correctly in its home lessons: `alg1-02-03/c1` (equation-clearing,
`0.5x + 1.2 = 3.7 -> 5x + 12 = 37, x = 5`) and `dpv-01-03` (generic x10/. 10 shifting prose with no
explicit numeric claim). `dop-05-03`'s entire lesson (`c1`, `i1`, `k1`, `c2`, `k2`, `i2`, `k3`,
`ch1`, `r1`, and the `rem-dd-*` remedials) is about decimal **division** (`1.5 / 0.5 -> 15 / 5 =
3`). Restating `decimal-shift`'s equation example inside `c2` would have injected an unrelated
equation into a division-only lesson -- a wrong-figure placement, not a prose-alignment fix; the
S317-style "align prose to the figure" branch of the decision rule does not apply here because the
figure's actual worked example is not this lesson's topic.

Following the S317 fix-1/fix-2 precedent (new additive, typed-props-free parameterized component
when the existing fixed widget's numbers genuinely cannot change because other lessons depend on
them), built `DecimalShiftDivide()` in `src/components/figures.tsx` -- `1.5 / 0.5`, both numbers
shifted x10, `15 / 5 = 3`, same house style (`role="img"`, `<title>` states the exact relationship,
reduced-motion-gated CSS matching `DecimalShift`'s own pattern) -- and registered it under a new
figure ID `decimal-shift-divide`. `c2.figure` rebound from `decimal-shift` to
`decimal-shift-divide`; `c2.body` (already correct, already about `1.5 / 0.5 -> 15 / 5 = 3`) was
left untouched. `decimal-shift` itself, its `FIGURES` entry, and every lesson that uses it
(`alg1-02-03`, `dpv-01-03`) are byte-identical.

## Verification — binding recomputation ("small node script")

Implemented as vitest assertions in `src/components/s318HsFigures.test.tsx` (imports the repo's own
`figureTextAlignment.ts`, `figureNumericParity.ts`, and `figureTextMismatchBlocklist.*` modules
directly -- the same code path `LessonPlayer.tsx`/`FigureView.tsx` gate rendering on). It:

- Parse-checks all 11 touched lesson files.
- Recomputes `isFigureTextAligned` for all 12 touched (figureId, body) bindings and asserts `true`,
  plus that each new binding key is absent from the generated blocklist, and that every touched
  concept body is <=80 words.
- Recomputes `compareExactFigureNumericParity` for `ep-01-01/c1` against `exponent-repeat`'s
  contract and asserts `aligned: true, reasons: []` (clearing the pre-existing parity finding).
- Confirms `esn-01b-01/c1` carries the literal ASCII `"(3 + 2 = 5)"`.
- Confirms the new `decimal-shift-divide` component is registered in both `FIGURES` and
  `FIGURE_IDS`, its title states `1.5`, `0.5`, `15`, `5`, `3`, and that `decimal-shift`'s own
  registered title (the `0.5x+1.2=3.7 -> 5x+12=37` equation example) is unchanged.
- Confirms `exp-02-03/c3`'s new binding key differs from the legacy `67c19c25`, that `67c19c25`
  remains in the generated (monotonic) blocklist, and that no `CURRENT_MANUAL_HOLD` references it
  anymore.
- Confirms `exp-02-03/c2` states both `1.5` and `3/2`.
- Confirms `rt-02-01/c2` states `3/5`, `4/5`, `3/4`.
- Confirms `sr-01-01/c1`'s `a6 = 4 + 5.3 = 19` arithmetic and that the body states both `15` and
  `19`.

Additionally, for every placement whose reword changed a previously-computed heuristic finding
(`ft-03-02`, `rno-01-03`, `se-03-03`), the fix was verified against the adversarial candidate
scanner's own `risks()` heuristic (`figureTextAdversarialAudit.test.tsx`'s
`EXAMPLE_NUMBER_CONFLICT`/`OPERATION_CONFLICT`/`PART_COUNT_CONFLICT` detectors, replayed via a
temporary throwaway probe test, deleted before final gates) both before and after the fix, to
confirm (a) the risk was already present in the ORIGINAL body (i.e. not introduced by this packet)
and (b) the final reworded body clears it too -- not just the primary `isFigureTextAligned` guard.
`ep-01-01/c1` was additionally re-verified via a whole-repo, read-only run of
`npx tsx scripts/audit/fixed-figure-numeric-parity.mts --json`: 0 `unsafeFindings`, 0 findings
rows, confirming the pre-existing "missing=3+2+5" finding no longer reproduces anywhere in the
corpus.

## Gate outputs

```
$ npx vitest run src/components/s318HsFigures.test.tsx
 Test Files  1 passed (1)
      Tests  33 passed (33)

$ node scripts/check-registration.mjs
registration: files ↔ course.json ↔ PLAN.md all consistent

$ npx tsc --noEmit
(no output — exit 0)
```

`src/components/figureIds.ts` was regenerated via `node scripts/gen-figure-ids.mjs` (the documented
generator for that file -- never hand-edited) after adding `decimal-shift-divide` to `figures.tsx`,
so the synchronous existence gate (`FIGURE_IDS.has(...)`, consumed by `LessonPlayer.tsx`) recognizes
it.

## Changed files

- `src/components/figures.tsx` — additive: 1 new component (`DecimalShiftDivide`) + 1 new `FIGURES`
  map entry (`decimal-shift-divide`). No existing component body edited.
- `src/components/figureIds.ts` — regenerated (adds the 1 new ID; otherwise identical set).
- `content/courses/exponents-polynomials/lessons/ep-01-01.json` — `c1.body` reworded.
- `content/courses/exponents-scientific-notation/lessons/esn-01b-01.json` — `c1.body` reworded.
- `content/courses/exponential-functions/lessons/exp-02-03.json` — `c2.body` and `c3.body` reworded.
- `content/courses/function-transformations/lessons/ft-03-02.json` — `c1.body` reworded.
- `content/courses/logarithms/lessons/lg-05-03.json` — `c1.body` reworded.
- `content/courses/proportional-relationships/lessons/pr-04-02.json` — `c2.body` reworded.
- `content/courses/rational-number-operations/lessons/rno-01-03.json` — `c1.body` reworded.
- `content/courses/right-triangles-trig/lessons/rt-02-01.json` — `c2.body` reworded.
- `content/courses/systems-equations/lessons/se-03-03.json` — `c2.body` reworded.
- `content/courses/sequences-series/lessons/sr-01-01.json` — `c1.body` reworded.
- `content/courses/decimal-operations/lessons/dop-05-03.json` — `c2.figure` rebind only (`decimal-shift` -> `decimal-shift-divide`); `c2.body` untouched.
- `src/lib/figureTextMismatchBlocklist.manualHolds.ts` — retired the now-dangling `67c19c25` row
  (S317 precedent); type annotation on the export changed from `as const satisfies` to an explicit
  `readonly FigureTextMismatchManualHold[]` so an empty array still type-checks.
- `src/components/s318HsFigures.test.tsx` — new test file (33 assertions).
- `reports/closure/S318_HS_WITHHELD_CLEARANCE.md` — this report.
- `reports/closure/cowork-staging/laneA-s318-hs-figures.jsonl` — 12 `lesson-fix` records.

## Untouched / explicitly out of scope

`decimal-shift`'s own `FIGURES` entry and the lessons that depend on it (`alg1-02-03`, `dpv-01-03`)
-- read-only dependencies, re-verified unchanged and still aligned. `src/lib/
figureTextMismatchBlocklist.generated.ts` was **not hand-edited** (its monotonic add-only
regeneration flow, `UPDATE_FIGURE_TEXT_BLOCKLIST=1 npx vitest run
src/components/figureTextAdversarialAudit.test.tsx`, was not run — outside the three permitted gate
commands, matching S317 fix 4's precedent).

**Open follow-up for the blocklist owner (not this packet's `figures.tsx` scope):** running
`figureTextAdversarialAudit.test.tsx` as-is currently fails at its `blocklistCandidateKeys`
assertion — but on inspection, every one of the 15 currently-missing candidate keys belongs to
OTHER lessons this packet never touched (`add-subtract-1000-g2/g2b-02-06`,
`counting-to-100-k/k100-01-03,02-05,03-03,03-06`, `decimal-fluency-g5/g5d-03-01`,
`measure-money-time/mmt-03-02`, `measure-problems-g4/g4v-01-02,02-02`) — pre-existing, uncommitted
drift from a different concurrent lane already present in the working tree before this packet
started (confirmed via `git status` and by replaying the audit's own `risks()` heuristic in a
throwaway probe test, deleted before the final gates). None of this packet's 12 placements appear
in that missing-candidate list; all 12 were independently re-verified clean against both
`isFigureTextAligned` and the adversarial heuristic scanner. Flagging this here rather than
touching files outside this packet's scope or running the blocklist-owner-only regeneration flow.
