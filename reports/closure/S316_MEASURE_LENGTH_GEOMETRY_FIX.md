# S316 — UnitRulerW ("Measure the pencil") geometry fix

## Live defect (production screenshot)

Lesson `content/courses/shapes-measure-g1/lessons/smg1-03-01.json`, slug `which-is-longer`,
step `i1`, widget `unitRuler`:

```
"prompt": "Measure the pencil. Align zero, use one-paperclip units, and cover it with five units exactly.",
"objectStart": 1, "objectEnd": 6, "targetUnitSize": 1, "requiredPlacements": 5
```

Reported symptom: TRUE LENGTH ✓5, UNITS PLACED ✓5/5, but COVERED showed ✓6.0, the finish marker
sat at 6.0 on the 0–20 axis, and the placed unit blocks started around x≈1 instead of 0.

## Root cause

`UnitRulerW` in `src/components/widgets.tsx` (line ~18903) computed:

```ts
const length = spec.objectEnd - spec.objectStart;
const covered = st.placements * st.unitSize;                 // pure length: 5*1 = 5
const finish = (st.zeroAligned ? spec.objectStart : 0)        // BUG: adds absolute objectStart
             + covered
             + Math.max(0, st.placements - 1) * delta;
```

With `zeroAligned = true`, `finish = objectStart(1) + covered(5) = 6`. The "covered" `LabReadout`
then displayed `finish.toFixed(1)` — i.e. it printed the **absolute axis coordinate of the
object's right edge** under the label "covered," conflating "how much length was covered" with
"where on the 0–20 number line the coverage ends." Since `spec.objectStart + trueLength ===
spec.objectEnd` always (an authored invariant, see sweep below), this bug is invisible whenever
`objectStart === 0` (∼35 of 47 authored steps) and only manifests when `objectStart > 0` — exactly
the smg1-03-01 case (`objectStart = 1`).

The same absolute coordinate was also used to draw the object bar (`x(spec.objectStart)` to
`x(spec.objectEnd)`, hard-coded regardless of alignment state) and to position the placed unit
blocks (`start = (zeroAligned ? spec.objectStart : 0) + i*unitSize + i*delta`). "Align zero" is
meant to represent physically sliding the object so its start touches the ruler's zero mark; the
old code instead kept the object pinned at its raw authored coordinates and only shifted where
*units* began, so after alignment the units track the object's real position (1→6) rather than
both sharing a 0-origin — which is why the finish/covered readout is measured from an origin that
disagrees with what "covered" is supposed to mean (a length from zero).

## Fix

```ts
const length = spec.objectEnd - spec.objectStart;
const unitsSum = st.placements * st.unitSize;
const delta = st.spacing === 'gap' ? 0.15 : st.spacing === 'overlap' ? -0.15 : 0;
// "Align zero" moves the shared measurement origin to 0 for BOTH the unit track and the object
// bar — mirroring the real action of sliding the object so its start touches the ruler's zero.
const origin = st.zeroAligned ? 0 : spec.objectStart;
// Physical span covered from that origin, including gap/overlap slack between units.
const covered = unitsSum + Math.max(0, st.placements - 1) * delta;
const finish = origin + covered;
const done = st.zeroAligned && st.spacing === 'exact' && covered === length;
```

- The object bar is now drawn `[x(origin), x(origin+length)]` (was hard-coded
  `[x(objectStart), x(objectEnd)]`), so it always spans exactly `trueLength` axis units and always
  shares the same origin as the unit track — pre-alignment it sits at its authored coordinates
  (still demonstrating a not-yet-aligned object); once "Align zero" is pressed, both the object
  bar and the units shift to originate at 0.
- Placed unit blocks now start at `origin + i*unitSize + i*delta` (was
  `(zeroAligned ? objectStart : 0) + …`, i.e. the same origin variable, so units and the object
  bar are always drawn from the same reference point).
- The "covered" `LabReadout` now shows `covered.toFixed(1)` (the physical span from the origin —
  5.0 for 5 exact unit-1 placements), not `finish.toFixed(1)` (the old, mislabeled absolute
  coordinate).
- The finish marker's tone/color and the readout's tone now key off an explicit `done` flag
  (`zeroAligned && spacing === 'exact' && covered === length`) instead of the old
  `finish === spec.objectEnd` comparison, which only happened to work when zero was aligned.

This is a **display-only fix** — five lines of derived-value/JSX rewiring inside `UnitRulerW`,
nothing else in the file touched.

## Evaluator proof (cannot flip any authored answer)

`src/lib/evaluate.ts`, `case "unitRuler"` (line 1487):

```ts
case "unitRuler": {
  const v = value as {zeroAligned:boolean; unitSize:number; placements:number; spacing:string} | null | undefined;
  if (!v) return {correct:false, feedback:"Align zero and iterate equal units, then check."};
  if (!v.zeroAligned) return {correct:false, feedback:spec.alignFeedback};
  if (v.spacing !== "exact") return {correct:false, feedback:spec.gapOverlapFeedback};
  if (v.unitSize !== spec.targetUnitSize) return {correct:false, feedback:spec.unitFeedback};
  if (v.placements === spec.requiredPlacements) return {correct:true, feedback:spec.successFeedback};
  const named = spec.commonPlacements.find((c) => c.placements === v.placements);
  return {correct:false, feedback:named?.feedback ?? spec.gapOverlapFeedback};
}
```

Grading reads only `{zeroAligned, spacing, unitSize, placements}` from the interaction value.
It never reads `finish`, `covered`, or any derived geometry — those exist purely for the widget's
own on-screen readouts/SVG. `canCheck` for `unitRuler` (evaluate.ts line 2280) similarly only
checks `value !== null && value !== undefined`. Therefore the widget-internal geometry rewrite
cannot change what is graded correct/incorrect for any authored step. No grading logic was
touched.

## System-wide sweep — every `unitRuler` step (47 total, 24 lessons, 12 courses)

Checked `requiredPlacements * targetUnitSize === objectEnd - objectStart` (must tile exactly) for
every authored `unitRuler` widget in `content/courses/**`:

| Lesson/step | objectStart | objectEnd | trueLength | requiredPlacements × targetUnitSize | Verdict |
|---|---|---|---|---|---|
| g2g-01-01/i1 | 2 | 6 | 4 | 4×1=4 | OK |
| g2g-01-01/i2 | 1 | 6 | 5 | 5×1=5 | OK |
| g2p-01-03/i1 | 2 | 6 | 4 | 4×1=4 | OK |
| g2p-01-03/i2 | 4 | 8 | 4 | 4×1=4 | OK |
| kmd-01-01/i1 | 0 | 4 | 4 | 4×1=4 | OK |
| kmd-01-01/i2 | 0 | 5 | 5 | 5×1=5 | OK |
| kmd-01-02/i1 | 0 | 5 | 5 | 5×1=5 | OK |
| kmd-01-02/i2 | 0 | 6 | 6 | 6×1=6 | OK |
| kmd-02-01/i1 | 0 | 6 | 6 | 6×1=6 | OK |
| kmd-02-01/i2 | 0 | 7 | 7 | 7×1=7 | OK |
| kmd-02-03/i1 | 0 | 4 | 4 | 4×1=4 | OK |
| kmd-02-03/i2 | 0 | 5 | 5 | 5×1=5 | OK |
| kmd-02-04/i1 | 0 | 5 | 5 | 5×1=5 | OK |
| kmd-02-04/i2 | 0 | 6 | 6 | 6×1=6 | OK |
| mc-02-02/i1 | 0 | 20 | 20 | 20×1=20 | OK |
| mc-05-01/i1 | 0 | 11 | 11 | 11×1=11 | OK |
| g1m-02-01/i1 | 2 | 6 | 4 | 4×1=4 | OK |
| g1m-02-01/i2 | 1 | 6 | 5 | 5×1=5 | OK |
| g1m-02-02/i1 | 1 | 7 | 6 | 6×1=6 | OK |
| g1m-02-02/i2 | 2 | 9 | 7 | 7×1=7 | OK |
| g1m-02-03/i1 | 0 | 5 | 5 | 5×1=5 | OK |
| g1m-02-03/i2 | 3 | 9 | 6 | 6×1=6 | OK |
| g1m-03-01/i1 | 0 | 8 | 8 | 8×1=8 | OK |
| g1m-03-01/i2 | 2 | 8 | 6 | 6×1=6 | OK |
| g1m-03-02/i1 | 0 | 6 | 6 | 3×2=6 | OK |
| g1m-03-02/i2 | 2 | 10 | 8 | 4×2=8 | OK |
| g1m-03-03/i1 | 0 | 8 | 8 | 4×2=8 | OK |
| g1m-03-03/i2 | 1 | 7 | 6 | 3×2=6 | OK |
| mmt-01-01/i1 | 3 | 9 | 6 | 6×1=6 | OK |
| mmt-01-02/i1 | 4 | 10 | 6 | 6×1=6 | OK |
| mmt-01-02/i2 | 1 | 6 | 5 | 5×1=5 | OK |
| mmt-01-02/i3 | 3 | 11 | 8 | 8×1=8 | OK |
| mmt-01-03/i2 | 0 | 7 | 7 | 7×1=7 | OK |
| ks-03-01/i1 | 2 | 6 | 4 | 4×1=4 | OK |
| kgb-01-04/i1, i2 | 0 | 4 | 4 | 4×1=4 | OK |
| kgb-02-01/i1 | 0 | 3 | 3 | 3×1=3 | OK |
| kgb-02-01/i2 | 0 | 5 | 5 | 5×1=5 | OK |
| kgb-02-02/i1 | 0 | 6 | 6 | 6×1=6 | OK |
| kgb-02-02/i2 | 0 | 3 | 3 | 3×1=3 | OK |
| kgb-02-05/i1 | 0 | 6 | 6 | 6×1=6 | OK |
| kgb-02-05/i2 | 0 | 4 | 4 | 4×1=4 | OK |
| kgb-03-01/i1, i2 | 0 | 3/4 | 3/4 | matches | OK |
| kgb-03-02/i1, i2 | 0 | 4 | 4 | 4×1=4 | OK |
| **smg1-03-01/i1** | **1** | **6** | **5** | **5×1=5** | **OK — the reported step** |

Verdict: **0 mismatches, 0 authored lessons touched.** Every step already tiled exactly, so the
corrected geometry (origin-based, `covered = length` at success) reproduces authored intent for
every one of them; no `content/courses/**/*.json` file needed a change for this fix (each
lesson's numbers were never wrong — only the widget's on-screen readout was).

## Sibling ruler-like widgets — checked for the same defect class

- **`lengthCompare` (`difference` mode, `LengthDifferenceW`)**: both bars are drawn from a single
  shared baseline `x0` (`<line x1={x0} … />` for both bars, `bar()` always uses `x0` as its left
  edge); width is `it.length * u` (a pure length, not an endpoint subtraction). No origin
  mismatch — the shared-baseline design makes this defect class structurally impossible here.
- **`lengthCompare` (`align` mode, `LengthPickAlignW`)**: bars are deliberately drawn at
  `x0 + offset*u` where `offset` starts at each item's authored `startOffset` and the learner
  drags it toward 0 — that's the whole point of the exercise (misalignment is the initial,
  correct state, not a bug). Bar width is always `it.length * u`. No off-by-one found.
- **`lengthCompare` (`pick` mode)**: not origin/offset based; not applicable.
- Grepped all of `src/components/widgets.tsx` for `objectStart`/`objectEnd` — only `UnitRulerW`
  references these fields. No other widget shares this geometry pattern.

Conclusion: **`UnitRulerW` was the only widget with this defect class.** No other widget code was
changed.

## `src/lib/session192.measureLength.test.ts` — did not pin the bug, is failing for an unrelated,
## pre-existing reason (out of scope, not touched)

This file's assertions never reference `finish`, `covered`, `zeroAligned`, or any rendered
geometry — its only `unitRuler`-specific checks are on the authored spec itself:
`requiredPlacements * targetUnitSize === objectEnd - objectStart`, `allowedUnitSizes` contains
`targetUnitSize`, and `startUnitSize !== targetUnitSize`. It does not import or render
`UnitRulerW`. So it never pinned the buggy geometry, and my fix cannot turn it green or red.

Running it (both before and independently confirmed via `git stash` on just `widgets.tsx`) shows
**10/12 tests failing on an unrelated assertion**:

```
AssertionError: g1m-01-01/k1 correct not at index 0: expected false to be true
  at src/lib/session192.measureLength.test.ts:108
```

This checks `w.options[0].correct === true` for `mcq` widgets on `check`/`challenge` steps — i.e.
it assumes the authored-correct option is always rendered first. That assumption is broken by
other, already in-flight work in this shared working tree (confirmed via `git status`/`git diff`
before I touched anything): `src/components/labChoiceOrder.s316*.test.tsx`,
`reports/closure/S316_LAB_CHOICE_SHUFFLE_FIX.md`, and modifications already present in
`src/components/widgets.tsx` (a `seededShuffle` of `choices` added to other lab widgets) and
across dozens of `content/courses/**/*.json` files predate my session. I verified with
`git stash push -- src/components/widgets.tsx` that these 10 failures reproduce identically with
my `UnitRulerW` change entirely removed — they are not caused by, or related to, this fix.

Per the packet's scope (only the widget component(s), the session192 test *if it pinned the
buggy geometry*, my new test, and lesson JSON only for impossible numbers), I did not touch this
test file or the mcq content it's complaining about — that's a different, already-owned defect
outside S316's measure-length-geometry scope. Flagging it here as a pre-existing, unrelated
failure for whoever owns the lab-choice-shuffle work.

## New regression test

`src/components/measureLength.s316.test.tsx` (jsdom, `@vitest-environment jsdom` on line 1).
Mounts `UnitRulerW` with the exact shipped `smg1-03-01/i1` spec, drives it through
Align zero → unit 1 → 5× Place unit, and asserts:

1. COVERED reads "5.0", never "6.0"; the SVG finish-marker text reads "finish 5.0", never
   "finish 6.0".
2. The finish marker's x-tick sits at axis coordinate 5 (`x(5)`), not 6 (`x(6)`).
3. The object bar's rendered width equals `trueLength * axisUnitScale` and starts at the same
   origin (`x(0)`) as the first placed unit block, once zero is aligned.
4. Before "Align zero" is pressed, the object bar still sits at its authored `objectStart`
   coordinate (proving the pre-alignment state is preserved, not silently zeroed).

## Gate results (verbatim, as run)

```
$ npx vitest run src/components/measureLength.s316.test.tsx
 Test Files  1 passed (1)
      Tests  4 passed (4)

$ npx vitest run src/lib/session192.measureLength.test.ts
 Test Files  1 failed (1)
      Tests  10 failed | 2 passed (12)
 (all 10 failures: "correct not at index 0" — pre-existing, unrelated mcq-shuffle defect;
  see explanation above; reproduces identically with the UnitRulerW fix reverted)

$ npx tsc --noEmit
(clean, exit 0)
```

## Files touched

- `src/components/widgets.tsx` — `UnitRulerW` only (origin/covered/finish/done rewiring; ~10
  lines changed, comments added). No other function in this file was edited by me.
- `src/components/measureLength.s316.test.tsx` — new regression test (created).
- No `content/courses/**` file was edited — the sweep found zero authored specs needing a change.
- `src/lib/session192.measureLength.test.ts` — not edited (does not pin the geometry bug; its
  failures are pre-existing and unrelated, as documented above).
