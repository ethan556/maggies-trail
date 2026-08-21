# S322 — Engineering: ep-03-01 figure adoption + dc-03-01 GraphZoomW curvature

Worker: bounded engineering worker, sole owner of `src/components/figures.tsx` and
`src/components/widgets.tsx` this round. Base commit: `a78d6a3e610ccf1b7a54721e907fca1be9d8c2d9`.
Read first: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`,
`reports/closure/S321_VERIFY_IMPL456.md` (ep-03-01 and dc-03-01 findings).

## Task A — ADOPT ep-03-01's `monomial-distribute-area` figure

**Resolution: ADOPTED (with one containment gap found and fixed).**

Read `MonomialDistributeArea()` (`src/components/figures.tsx`, orphaned/unattributed in commit
`a78d6a3`, registered as `"monomial-distribute-area"` in both `FIGURE_IDS` and the `FIGURES` map)
and ep-03-01's `c1` prose (`content/courses/exponents-polynomials/lessons/ep-03-01.json`):
`c1.body` reads "3x(x + 4) = 3x·x + 3x·4 = **3x² + 12x**" and `c1.figure` is
`"monomial-distribute-area"`.

Checks performed:
- **Registration**: `FIGURE_IDS.has("monomial-distribute-area")` → true; `FIGURES["monomial-
  distribute-area"]` defined. Confirmed via `node -e` inspection and pinned in
  `src/components/s322Figures.test.tsx`.
- **Rendered truth**: the SVG's `<title>` states "...three x by x square, solid-filled, with area
  three x times x equals three x squared; one three x by four rectangle, cross-hatched, with area
  three x times four equals twelve x. So three x times the quantity x plus four equals three x
  squared plus twelve x." — matches `c1.body` exactly (3, 4, 12; multiplication of the monomial
  `3x` across both terms). Two rects (solid `#EAF2FC` + hatched pattern) visually distinguish the
  two sub-areas by shape/fill, not colour alone.
- **`isFigureTextAligned("monomial-distribute-area", c1.body)`** → `true` (no blocklist hit, no
  registered numeric-claim mismatch).
- **Adversarial `risk_reasons`**: re-ran `figureTextAdversarialAudit.test.tsx` with
  `UPDATE_FIGURE_TEXT_AUDIT=1` to regenerate its CSV in-place, confirmed the live row —
  `ep-03-01,steps.0,monomial-distribute-area,RENDER,PASS,` (empty `risk_reasons` field) — then
  **reverted the CSV** (`git checkout -- FIGURE_TEXT_ADVERSARIAL_AUDIT.csv`) since regenerating
  that tracked artifact for the ~600 other unrelated stale rows is out of this packet's scope.
  The empty-`risk_reasons` finding is re-verified deterministically (without touching that file)
  in `s322Figures.test.tsx`'s own narrow re-implementation of the disjoint-number/disjoint-
  operation heuristic.
- **Viewport containment (numerals inside viewBox)**: **found a real gap.** The figure's bottom
  caption (`"3x(x + 4) = 3x² + 12x — the 3x reaches BOTH parts"`, one `<text>`, `fontSize=12`,
  `text-anchor=middle`, `x=150` in a `viewBox="0 0 300 132"`) is ~423 user-units wide against a
  300-wide viewBox — it overflowed from x≈−62 to x≈362. This alone pushed
  `figureViewportParity.s260.test.tsx`'s global overrun count from the pinned budget of 261 to
  263 (baseline run before any edit: `outside=263`, assertion `<=261` fails). **Fixed** by
  splitting the caption into two shorter lines ("3x(x + 4) = 3x² + 12x" / "the 3x reaches BOTH
  parts") and growing the viewBox height from 132 to 146 to fit them; re-verified all numeral
  boxes now sit inside the viewBox (see `s322Figures.test.tsx`'s containment describe block).

**Incidental second fix required for the same shared gate.** The same unattributed commit
(`a78d6a3`) also landed `VmSixtyCubeBox` (`vm-04-01`, an unrelated lesson) in `figures.tsx`, whose
two bottom captions (`"base layer: 4 × 3 = 12"`, `"12 × 5 = 60 cubes"`, default `text-anchor=start`
at `x=190` in a `viewBox="0 0 340 200"`) overflow the right edge by ~24 and ~9 user-units
respectively — contributing the *second* new overrun that, together with the monomial-distribute-
area one, put the shared count at 263/261. This is **not** part of either owned task (Task A is
ep-03-01 only; Task B is dc-03-01/GraphZoomW), but since this worker is sole owner of
`figures.tsx` this round and the shared viewport-parity gate must pass, the minimal fix
(widening the viewBox from `340 200` to `380 200`, an additive/non-semantic change — no text,
geometry, or numbers moved) was applied and is flagged here for a human to reconcile which
packet actually owns `vm-04-01`'s figure. It is called out explicitly in `s322Figures.test.tsx`'s
docstring and as its own `describe` block so it isn't silently absorbed into the ep-03-01 record.

No component rebuild was needed — `MonomialDistributeArea` was mathematically correct and
truthfully described; only its viewport containment needed a fix.

## Task B — dc-03-01 GraphZoomW curvature

**Resolution: IMPLEMENTED (grading-safe, swept, restored).**

### What was wrong
`GraphZoomW` (`src/components/widgets.tsx`) rendered `f(x) = leftValue + 1*(x−a)` — an
unconditionally straight line at **every** zoom level for `"continuous"`/`"removable"`
behaviours. The S320 assessor's contract for dc-03-01 required either genuine curvature or a
widget swap; the S320 implementer instead reworded the lesson text to a lesser, currently-true
claim ("confirm both sides settle on the same height"), which S321 correctly rejected as the
exact workaround the contract prohibited.

### Evaluator path (proved grading-unsafe changes cannot happen)
Read `src/lib/evaluate.ts`'s `"graphZoom"` case (line ~1775) and `canCheck`'s `"graphZoom"` case
(line ~2503): both read **only** `{ zoom, verdict }` from the learner's submitted value —
`zoom < spec.requiredZoom` → `moreZoomFeedback`; `verdict !== spec.targetVerdict` →
`wrongVerdictFeedback`; else correct. Neither touches the widget's rendered curve, `f(x)`, or any
pixel geometry. `describeState.ts`'s `"graphZoom"` case and `pedagogy.ts`'s `"graphZoom"` case
were also read: both describe `leftValue`/`rightValue`/`fAtA`/`verdict` in prose, never curve
shape. **Conclusion: rendering curvature is provably orthogonal to grading.** Confirmed with a
live re-run of `evaluate()` against dc-03-01's actual spec in `graphZoom.s322.test.tsx`.

### The fix
Added a deterministic quadratic remainder term to the shared `"continuous"`/`"removable"`
formula only:
```
const CURVE = 0.15;
...
return spec.leftValue + SLOPE * d + CURVE * d * d;   // d = x - spec.a
```
- Vanishes exactly at the anchor (`d=0`), so `f(a)`/hole/dot markers are untouched.
- Shrinks **quadratically** as the zoom window narrows (`w = 2/2^zoom`, driven entirely by the
  pre-existing `zoom` state and `spec.a` — no new schema field, no `Math.random`), while the
  linear (tangent) term shrinks only linearly — so the curve visibly straightens as zoom
  increases, for the same reason any twice-differentiable function looks straight once you zoom
  in far enough. This is the honest mathematical justification the contract asked for, not a
  cosmetic tweak.
- `"jump"` keeps its two genuinely straight branches (no local-straightening claim is made about
  a jump discontinuity) — untouched.
- `"infinite"` keeps its own already-nonlinear `1/d²` blow-up — untouched.

Measured effect at dc-03-01's own spec (`a=3, leftValue=rightValue=fAtA=5, requiredZoom=3`): at
zoom 0 the branch's max deviation from its own chord is ≈5.1 SVG user-units (clearly visible); by
zoom 3 (dc-03-01's `requiredZoom`) it is ≈0.65 units (sub-pixel, "indistinguishable from a
straight line" is now literally true); by zoom 6 (the widget's max) it is ≈0.08 units.

### Sweep of every authored `graphZoom` instance (grep content, 18 placements across 17 lessons)
`curve-analysis/ca-04-01` (infinite, untouched), `derivatives-in-context/dc-03-01` (continuous,
target), `dc-04-01` (removable — text already claims "zoom in far enough and both...look like
straight lines through the point"; the fix makes this claim *more* accurate than before, not
less), `limits-continuity/lc-01-01, lc-02-01, lc-02-02, lc-03-02, lc-04-01` (continuous/
removable — none claim "always a straight line" or reference exact pre-settling readout
numbers; all only claim eventual settling to `leftValue`/`rightValue`, still true), `lc-01-02`
(removable ×2, `i1`+`k2` — same), `lc-01-03, lc-03-01` (jump — untouched formula, unaffected),
`lc-03-03, lc-04-02` (infinite — untouched), `polynomial-rational-analysis/pra-03-01` (continuous
— "watch it settle onto a straight line" describes an asymptote-approach narrative, not local
shape; unaffected/still true), `pra-03-03` (infinite — untouched), `rational-functions/rf-04-01`
(infinite — untouched), `rf-04-02` (removable ×2 — settling-only claims, unaffected).
`content/patches/s203r-calculus.json` is an archival record of already-merged historical patches
(identical to the live lesson JSONs already swept above), not independently live.
**No lesson's textual claim became false; two (`dc-03-01`, `dc-04-01`) became more accurate.**

The S317 direction-neutral "infinite" wording fix (both sides of a `1/d²` blow-up climb, not
"opposite directions") stays true: the `"infinite"` branch of `f(x)` was not touched at all.

### dc-03-01's `i1` text restored
Restored to the original pre-S320 pedagogically-intended text (recovered via
`git show a78d6a3 -- content/courses/derivatives-in-context/lessons/dc-03-01.json`, which shows
exactly what the S320 implementer reworded away from):
- `body`: "Zoom in and the curve becomes its tangent."
- `prompt`: "Magnify a differentiable point. Watch the curve straighten — that straightness IS
  the linearisation."
- `successFeedback`: "At high magnification the curve is indistinguishable from a straight line.
  That line is the tangent, and the linearisation is simply USING it instead of the curve. The
  approximation is good precisely because differentiability promised local straightness in the
  first place."
- `moreZoomFeedback`: "Magnify further — the straightening is the point, and it only becomes
  obvious close in."
- `wrongVerdictFeedback`: "Both sides settle on the same value, so the limit exists — and the
  curve is locally straight, which is exactly what makes the tangent a usable stand-in."

All five claims are now literally true under the new render (verified quantitatively above).

### Tests added
`src/components/graphZoom.s322.test.tsx` (jsdom): curved-at-zoom-0 / near-collinear-by-zoom-6 /
already-straight-by-`requiredZoom`=3 render tests on dc-03-01's actual spec; anchor-exactness
(hole/dot marker unaffected); `"jump"` and `"infinite"` behaviours explicitly proven unchanged;
`"removable"` also straightens (supports dc-04-01); grading re-proven unaffected via a live
`evaluate()` call against dc-03-01's spec.

## Gate outputs (verbatim)

### `npx vitest run src/components/s322Figures.test.tsx src/components/graphZoom.s322.test.tsx`
```
 RUN  v4.1.10 /home/user/maggies-trail


 Test Files  2 passed (2)
      Tests  17 passed (17)
```

### `npx vitest run src/components/figureTextAdversarialAudit.test.tsx src/components/figureViewportParity.s260.test.tsx`
Baseline (before this packet's fixes): **FAILED** —
`svg=2016; numeric=4570; malformed=0; unmeasured=0; outside=263` (budget ≤261) — the two
containment gaps above (`monomial-distribute-area`, `vm-sixty-cube-box`).
After the fixes:
```
 RUN  v4.1.10 /home/user/maggies-trail


 Test Files  2 passed (2)
      Tests  3 passed (3)
```

### `node scripts/check-registration.mjs`
```
registration: files ↔ course.json ↔ PLAN.md all consistent
```

### `npx tsc --noEmit`
Clean (no output).

### Existing graphZoom-specific test file
None existed pre-packet (`graphZoom.s322.test.tsx` above is the first dedicated file). Other
files that merely *reference* `graphZoom` (`widgets.axisCaptions.s237.test.tsx`,
`widgets.keyboard.test.tsx`, `widgets.revealGhost.s103.test.tsx`, `widgets.tone.test.tsx`,
`content.widgets.audit.test.ts`, `evaluate.new.test.ts`, `session244.flagshipVisualPacket{A,B}
.test.ts`) were read (not run, per scope) and confirmed to assert only spec fields, ARIA
interaction state, or `evaluate()`/`canCheck()` logic on `{zoom, verdict}` — never rendered curve
geometry — so they carry no risk from this change; `tsc --noEmit` additionally confirms no type
regression across the whole tree.

## Raw data

- Changed files: `src/components/figures.tsx`, `src/components/widgets.tsx`,
  `content/courses/derivatives-in-context/lessons/dc-03-01.json` (content, Task B text restore
  only), `src/components/s322Figures.test.tsx` (new), `src/components/graphZoom.s322.test.tsx`
  (new).
- Base commit: `a78d6a3e610ccf1b7a54721e907fca1be9d8c2d9`.
- `sha256` of changed/added files:
  - `figures.tsx`: `69eff6f024515a7377e5c3cb6ddd7f66f582630cdab3cf2adec7f2091b324a02`
  - `widgets.tsx`: `e8629f549e00cdab9a5dab16d0cc3d8b5026a6a3595548b8a7954a99f65b3405`
  - `dc-03-01.json`: `b6ec4ed8f51785230178c864cfd74e9ca3c47ee9e0ad749b4739e50b6b106438`
  - `s322Figures.test.tsx`: `2a0320c7cea01dfea39c751a4a585e79c895c3fd590b7155237ef6833eb24323`
  - `graphZoom.s322.test.tsx`: `b66ff329c630df1d261306ef7c84691f2275d4cdcfd4fe24bc07a0cbcf70aebb`
- Sources read: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`,
  `reports/closure/S321_VERIFY_IMPL456.md`, `content/courses/exponents-polynomials/lessons/
  ep-03-01.json`, `content/courses/derivatives-in-context/lessons/dc-03-01.json` (+ its `dc-04-01`
  sibling), all 17 other `graphZoom`-authoring lesson files (grepped, listed above), `src/lib/
  evaluate.ts`, `src/lib/describeState.ts`, `src/lib/pedagogy.ts`, `src/lib/schema.ts`
  (`GraphZoomSpec`), `src/lib/figureTextAlignment.ts`, `reports/closure/S316_LANEB_LIMITS_
  CONTINUITY_ASSESSMENT.md` (S317 direction-neutral wording origin), `git show a78d6a3` (both
  touched files, for original/orphaned diffs).
- NDJSON: `reports/closure/cowork-staging/laneA-s322-eng.jsonl` (2 records).
- No file outside this worker's ownership (`figures.tsx`, `widgets.tsx`) and the one directed
  content restore (`dc-03-01.json`) was modified. `FIGURE_TEXT_ADVERSARIAL_AUDIT.csv` was
  regenerated for inspection only and reverted (`git checkout --`) before finishing.
