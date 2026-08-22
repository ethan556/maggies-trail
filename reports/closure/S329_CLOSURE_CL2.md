# S329 Closure Investigation — Packet CL2

Scope: `CL-P1-051` and `CL-P1-012` only. Read-only investigation of `CLOSURE_LEDGER.md`; this
session did not edit the ledger (a separate integration step applies status edits after reading
this report). Working tree: branch `codex/v4-s244-authored-visual-wave`, HEAD
`7d8e4f4` ("S322-S326: close all 128 implementation rows..."). The tree had a large number of
*other* files already modified by concurrent sibling sessions when this session started (content
lessons, `reports/`, other component additions later in `figures.tsx`, etc. — confirmed via
`git diff`, see §5) — none of that is this session's work and none of it was touched here. This
session's entire footprint is four files: `src/components/figures.tsx`,
`src/components/widgets.tsx` (one isolated hunk each), and two new permanent regression tests,
`src/components/figures.asv0101TriangleClip.s329.test.tsx` and
`src/components/widgets.dclBracketLabel.s329.test.tsx`. No lesson JSON was touched (confirmed by
`git status`), so `npm run validate:content` / `npm run lint:pedagogy` are not required by the
task's own conditional and were not run.

---

## 1. CL-P1-051 — `asv-01-01` triangle figure clips/overlaps at 390px

### 1.1 Finding the figure

`content/courses/area-surface-volume/lessons/asv-01-01.json` step `c1` (the lesson's first step —
matches the screenshot evidence's "1/9" step counter and `step1` filename) carries
`"figure": "triangle-half-rectangle"`. `FIGURES["triangle-half-rectangle"]` in
`src/components/figures.tsx` resolves to `TriangleHalfRectangle()` (was at line 6742). The figure
is used in exactly this one place (`grep -c "triangle-half-rectangle" content/**/*.json` → 1 hit).

The evidence screenshot `PREMIUM_REBUILD_SCREENSHOTS_S227/asv-01-01-step1-390-light-after.png`
still exists and was read directly: it shows the right-side "height" label truncated to "heigl"
at the card's edge, and the diagonal (hypotenuse) line running through the "triangle = half the
rectangle" caption.

**This is NOT the same bug as the `asv-surface-vs-volume` collision** `S326_RECONCILE_R3.md` §1
flagged (its fix suggestion — nudging two caption pairs by 1 unit — was read and is inapplicable
here): `AsvSurfaceVsVolume` (figures.tsx:770, "6 faces" / "4 unit cubes" labels) is a different
figure entirely, used by a different `asv-*` lesson, untouched by this fix, and still shows in the
ratchet's `worse` list before and after this session's edits (see §1.5 — confirmed pre-existing
and out of this packet's scope, exactly as R3 already documented).

### 1.2 Root cause, quantified

`figures.labelCollision.s238.test.tsx`'s ratchet (`textBoxes.testkit.ts`'s `scanTextBoxes` +
`collisions`) only models **text-vs-text** overlap. CL-P1-051 is two bug classes that model can't
see at all: a label clipping past its own `<svg viewBox>`, and a label overlapping a drawn
**shape** (a `<polygon>` stroke, not a `<text>`). I mirrored the testkit's exact box formula
(`width = chars × fontSize × 0.72`; `ascent = 0.98em`, `descent = 0.28em`) and added a
Liang-Barsky segment/rect intersection check for the shape case. Original source
(`ox=40, oy=20, w=160, h=90`, `viewBox="0 0 240 130"`):

| label | box (modelled) | defect |
|---|---|---|
| `base` (x=120,y=130,middle) | x:[104.2..135.8] y:[119.2..133.1] | y1=133.1 > viewBox height 130 by 3.08 (no visible glyphs clip in practice — "base" has no descenders — left as-is) |
| `height` (x=216,y=65,start) | x:[216.0..263.5] y:[54.2..68.1] | **x1=263.5 > viewBox width 240 by 23.5** — clipped on every render width, not just 390px (SVG clips to viewBox in its own user-space coordinates; 390px is simply the QA breakpoint that caught it) |
| caption "triangle = half the rectangle" (x=130,y=85,middle) | x:[15.2..244.8] y:[74.2..88.1] | **the hypotenuse segment (40,110)→(200,20) crosses this box** (Liang-Barsky: true) — also clips viewBox right edge by 4.84 |

Probe output (`npx tsx`, mirrors `textBoxes.testkit.ts` exactly):

```
=== BEFORE (current src/components/figures.tsx TriangleHalfRectangle) ===
viewBox 0 0 240 130
base     x:[104.16..135.84] y:[119.22..133.08]  clipRight(margin 104.16)=false  clipBottom(margin -3.08)=true
height   x:[216.00..263.52] y:[54.22..68.08]    clipRight(margin -23.52)=true   clipBottom(margin 61.92)=false
caption  x:[15.16..244.84] y:[74.22..88.08]     clipRight(margin -4.84)=true    clipBottom(margin 41.92)=false
hypotenuse crosses caption bbox = true
```

### 1.3 Fix

`src/components/figures.tsx`, `TriangleHalfRectangle()`:

```diff
-    <svg viewBox="0 0 240 130" role="img" className="mx-auto w-full max-w-sm">
+    <svg viewBox="0 0 280 160" role="img" className="mx-auto w-full max-w-sm">
       ...
       <text x={ox + w / 2} y={oy + h + 20} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>base</text>
       <text x={ox + w + 16} y={oy + h / 2} fontSize={11} fontWeight={700} fill={INK}>height</text>
-      <text x={ox + w / 2 + 10} y={oy + h / 2 + 20} textAnchor="middle" fontSize={11} fontWeight={800} fill={SKY}>
+      <text x={140} y={oy + h + 38} textAnchor="middle" fontSize={11} fontWeight={800} fill={SKY}>
         triangle = half the rectangle
       </text>
```

- Widened the `viewBox` 240×130 → 280×160 so the unmoved `height` label (x:[216..263.52]) now has
  positive clearance to the right edge, and gives the taller canvas room for the caption below.
- Moved the caption from inside the shaded triangle (where it necessarily crosses the hypotenuse —
  the caption is 229.7 units wide, wider than the 160-unit-wide shape itself, so no position
  strictly inside the triangle can hold it without crossing the diagonal) to **below the whole
  figure**, matching the placement convention this same file already uses for other bottom
  summary captions (`LShapeDecompose`'s `total = bottom + top`, `PrismNet`'s
  `6 faces — add them ALL`). Below y=110 (the shape's lowest point) the hypotenuse cannot reach it
  by construction — a geometric guarantee, not a numerically-tight clearance.

Probe output after the fix (same three labels, same formulas):

```
=== AFTER (proposed fix) ===
viewBox 0 0 280 160
base     x:[104.16..135.84] y:[119.22..133.08]  clipRight(margin 144.16)=false  clipBottom(margin 26.92)=false
height   x:[216.00..263.52] y:[54.22..68.08]    clipRight(margin 16.48)=false   clipBottom(margin 91.92)=false
caption  x:[25.16..254.84] y:[137.22..151.08]   clipRight(margin 25.16)=false   clipBottom(margin 8.92)=false
collision(base,height)=false  collision(base,caption)=false  collision(height,caption)=false
hypotenuse crosses base/height/caption bbox = false / false / false
```

Zero clipping, zero text-text collisions, zero shape-text collisions, on every axis.

### 1.4 Visual confirmation

Rendered the actual component (via the project's own `@testing-library/react` + jsdom pipeline,
not a hand assembly) and rasterized the exact resulting SVG markup with `sharp` at a 342px card
width (mirroring the 390px-viewport mobile card's content area). Before/after are night-and-day:
the "height" label reads in full with clear margin, and the caption sits cleanly below the shape
with no line running through it. (Rendered PNG inspected directly during this session; not
re-attached to this report, but reproducible from `FIGURES["triangle-half-rectangle"]` — see the
regression test in §1.6, which asserts the same properties numerically.)

### 1.5 Gate: `figures.labelCollision.s238.test.tsx`

```
$ npx vitest run src/components/figures.labelCollision.s238.test.tsx
 ❯ figures.tsx label collisions — the ratchet
   × every registered figure renders with zero colliding pairs (ledger closed, wave 14)
     AssertionError: a figure got WORSE or a clean figure started colliding
     - []
     + ["asv-surface-vs-volume: 2 pairs (baseline 0) — ...6 faces.../.../4 unit cubes.../..."]
   ✓ the seventy-eight wave-10/11/12/13 fixes hold at exactly zero, by name
   ✓ the hundred-and-twenty wave-14 fixes hold at exactly zero, by name
 Tests  1 failed | 2 passed (3)
```

Identical before and after this session's edit (confirmed by inspecting `git diff`:
`AsvSurfaceVsVolume` at figures.tsx:770 is untouched by this session, and the only diff hunk this
session made to `figures.tsx` is the `TriangleHalfRectangle` block in §1.3, plus an unrelated
pre-existing sibling-session addition later in the file that this session also did not write —
confirmed by `git diff --stat` showing insertions at two disjoint line ranges, only one of which
matches this session's `Edit` call). `triangle-half-rectangle` contributes **zero** collisions to
this ratchet both before and after (it was never in the `worse` list — its bugs are the
viewBox-clip and shape-overlap classes this ratchet cannot see at all, which is why a *stronger*
gate was needed — see §1.6). The remaining failure is `asv-surface-vs-volume`, a different figure,
pre-existing per `S326_RECONCILE_R3.md` §1 (independently reproduced: byte-identical failure
message, same two pairs, same coordinates), out of this packet's authorized scope (CL-P1-051 only)
and untouched by this session.

### 1.6 New permanent regression gate (this session)

The ratchet's blind spot (no viewBox-containment check, no shape-vs-text check) meant a one-off
probe script wasn't durable evidence, so I added
`src/components/figures.asv0101TriangleClip.s329.test.tsx` — 3 tests, reusing
`textBoxes.testkit.ts`'s exact box model plus a Liang-Barsky segment/rect check, with the
hypotenuse read live from the rendered DOM (not hardcoded, so it stays correct if the geometry
changes again):

```
$ npx vitest run src/components/figures.asv0101TriangleClip.s329.test.tsx
 Tests  3 passed (3)
```

**Negative-control validation** (temporarily reverted the fix, confirmed the new test catches the
exact original bug, then restored the fix — not left in the tree):

```
× every label stays inside the svg's own viewBox (no clip, at any render width)
  AssertionError: "base" bottom-clipped (viewBox height 130): expected 133.08 to be <= 130
× no label overlaps the triangle's hypotenuse stroke
  AssertionError: hypotenuse crosses "triangle = half the rectangle": expected true to be false
```

Confirmed non-vacuous; confirmed passes again after restoring the fix.

---

## 2. CL-P1-012 — dCL (`distributionCompareLab`) overlap label vs. bracket

### 2.1 Finding the widget and the real current activation

"dCL" = `distributionCompareLab` (`DistributionCompareLabW`, `src/components/widgets.tsx:10455`;
`dcl-*` is its established `data-testid` prefix throughout the test suite). Judge mode draws a
"gap evidence" **bracket** — a caliper made of 3 `<line>`s (two vertical ticks at y:[58,70], one
horizontal bar at y=64, spanning `X(aMean))`→`X(bMean)`) — plus two text labels, "gap ≈ N
variability-units" and "overlap ≈ N%", only at `tone === "error" || "info"` (retry/reveal).

The ledger's "7 judge steps / 3 authored lessons" (S218-era) is **stale**. A full disk scan of
`content/courses/**/*.json` for `distributionCompareLab` steps in `mode: "judge"` (script:
`/tmp/.../find_dcl_uses.mjs`, walks every course/lesson/step + remedials) finds **10 judge-mode
instances across 4 lessons**, current tree:

```
sp-02-01/ch1        gapUnits 3
sp-02-02/i1          gapUnits 0.4
sp-02-02/i2          gapUnits 4
sp-02-02/k2          gapUnits 0.3
sp-02-02/ch1         gapUnits 2.5
sp-02-02/rem-soj-k   gapUnits 0.3   (remedial)
sp-02-03/k1          gapUnits 3.5
sp-02-03/k3          gapUnits 0.2
sp-02-03/rem-src-k   gapUnits 3.5   (remedial)
si-03-03/i1          gapUnits 1
```

### 2.2 Root cause, quantified against the REAL corpus

`widgets.labelCollision.s237.test.tsx`'s DCL suite only checks text-vs-text collisions
(`scanTextBoxes`/`collisions`), same blind spot as §1.2 — it cannot see the bracket (3 `<line>`s)
crossing a `<text>`. Its own docstring already documents that a prior wave (S238) fixed
"gap ≈" vs "overlap ≈" **colliding with each other**, by separating them to y=54 / y=76 — but
never checked either one against the bracket itself.

Mirroring the widget's exact geometry (`W=520, left=34, right=486, span=max(7,gap+6)`,
`X(x)=left+((x-xMin)/(xMax-xMin))×452`, `aMean=-gap/2, bMean=gap/2`) plus `textBoxes.testkit.ts`'s
box model, and a Liang-Barsky segment/rect check against all three bracket segments, for **every
gapUnits value in the real current corpus** (§2.1):

```
lesson/step          gap    overlapLabel y-range   tickA-crosses  tickB-crosses
sp-02-01/ch1         3      [65.2..79.1]            false          false
sp-02-02/i1          0.4    [65.2..79.1]            true           true
sp-02-02/i2          4      [65.2..79.1]            false          false
sp-02-02/k2          0.3    [65.2..79.1]             true           true
sp-02-02/ch1         2.5    [65.2..79.1]            false          false
sp-02-02/rem-soj-k   0.3    [65.2..79.1]             true           true
sp-02-03/k1          3.5    [65.2..79.1]            false          false
sp-02-03/k3          0.2    [65.2..79.1]             true           true
sp-02-03/rem-src-k   3.5    [65.2..79.1]            false          false
si-03-03/i1          1      [65.2..79.1]             true           true
```

**5 of the current 10 judge instances collide** — every authored `gapUnits <= 1`. Mechanism: at
small gaps, `X(aMean)` and `X(bMean)` sit close together near the horizontal center, so both
narrow tick marks fall *inside* the wide "overlap ≈ N%" label's x-span (~103 units), and the
label's top edge (y=65.2) sits 4.8 units inside the ticks' y-range (58–70). This is not an edge
case: small gaps are exactly the pedagogically load-bearing "overlap dominates, the groups are
NOT meaningfully different" judge moments the bracket exists to teach — `si-03-03/i1` (gap 1,
Candidate A/B poll-margin lesson) and `sp-02-03/k3` (gap 0.2, the tightest authored gap) both hit
it. There is no room to fix this by nudging the label down instead: the bracket's bottom is y=70
and the decorative hatch fill (which turns *fully opaque* at these same small gaps, since
`opacity = min(1, overlap + 0.15)` and `overlap → 1` as `gap → 0`) starts at y=82 — only 12 units
between them, less than one 11px label needs (13.86 units of ascent+descent).

### 2.3 Fix

`src/components/widgets.tsx`, `DistributionCompareLabW()`'s judge-evidence block:

```diff
-              <text x={(X(aMean) + X(bMean)) / 2} y={54} ...>
+              <text x={(X(aMean) + X(bMean)) / 2} y={34} textAnchor="middle" fontSize={11} fontWeight={800} fill={...}>
+                overlap ≈ {Math.round(overlap * 100)}%
+              </text>
+              <text x={(X(aMean) + X(bMean)) / 2} y={54} textAnchor="middle" fontSize={11} fontWeight={800} fill={...}>
                 gap ≈ {fmt(gap)} variability-unit{gap === 1 ? "" : "s"}
               </text>
-              <text x={(X(aMean) + X(bMean)) / 2} y={baseY - 74} ...>
-                overlap ≈ {Math.round(overlap * 100)}%
-              </text>
```

Moved "overlap ≈ N%" from `y=baseY-74` (76, below/through the bracket) to `y=34`, **above** "gap ≈"
(unchanged at y=54), both now stacked in the empty margin above the bracket (top y=58) and well
above the curve peaks (which never rise above y=78 — `Y(x,mean) = baseY - 72×exp(...)`, max
reduction 72 from `baseY=150`). This is the only region with enough headroom to hold two 11px
labels without touching the bracket or the hatch. Visual stacking order carries no accessibility
implication here: `role="img"` + the SVG root's own `aria-label` (unchanged) already states
`"...gap N variability-units apart. ...overlap is about N%."` in that order regardless of which
`<text>` paints where — inner `<text>` nodes of a `role="img"` element are not separately
announced.

Re-running the same geometric check against all 10 real corpus values with the fix applied:

```
lesson/step  ...  overlapLabel y-range   tickA-crosses  tickB-crosses  gap/overlap collide
(all 10)          [23.2..37.1]            false          false          false (dy=-6.14)
>>> ZERO collisions across all 10 real judge instances <<<
```

### 2.4 Visual confirmation

Rendered `si-03-03/i1`'s verbatim spec (gap 1) at `tone="error"` and `sp-02-03/k3`'s verbatim spec
(gap 0.2, the tightest real case) at `tone="info"` through `WidgetRenderer`, rasterized with
`sharp`. Before the fix, "overlap ≈ 88%" / "overlap ≈ 100%" would render through the bracket
ticks; after, both labels sit cleanly stacked above a fully visible bracket, in both cases,
including the most extreme real gap (0.2, where the bracket itself is nearly a single point).

### 2.5 Gates

Direct DCL suite, and every other test file referencing this widget:

```
$ npx vitest run src/components/widgets.labelCollision.s237.test.tsx -t distributionCompareLab
 Tests  5 passed | 27 skipped (32)

$ npx vitest run src/components/widgets.distributionCompare.tone.s218.test.tsx
 Tests  8 passed (8)

$ npx vitest run src/components/widgets.distributionCompare.s131.test.tsx src/components/widgets.colourCue.s242.test.tsx
 Tests  11 passed (11)
```

Full-file run of `widgets.labelCollision.s237.test.tsx` (not required by the task, run anyway for
completeness) has **8 pre-existing failures unrelated to this fix**: `numberLineHop`,
`numberLinePlace`, `signChart`, `triangleSolve`, `doubleNumberLine`, the "16 tail engines" batch
(`lengthCompare` count drift 66→68), and `barBuilder` ×2. None of these engine names is
`distributionCompareLab`; none touch `DistributionCompareLabW`. These are stale authored-spec-count
pins against a corpus that keeps growing from concurrent sibling-session content work — the same
class of drift `S326_RECONCILE_R3.md` §§2–3, §6 already documented and fixed for *other* files
(`numberLineDirection.s260`, `numberLines.s253`, `session244.chatgptWorkPrecache`); out of this
packet's authorized scope (CL-P1-012 only, no ledger row currently names these six engines), and
confirmed unaffected by this session's one-hunk `widgets.tsx` diff (only the DCL judge-evidence
block changed — `git diff -- src/components/widgets.tsx` is 29 lines total, one place).

### 2.6 New permanent regression gate (this session)

Added `src/components/widgets.dclBracketLabel.s329.test.tsx` — scans the live corpus (mirroring
`widgets.labelCollision.s237.test.tsx`'s own "collision tail" disk-scan pattern) for every
`distributionCompareLab` judge-mode step, renders each at error/info tone, and Liang-Barsky-checks
the bracket's 3 live-read segments against both evidence labels' live-read boxes — so it
regresses against every *future* authored `gapUnits` too, not just the current 10:

```
$ npx vitest run src/components/widgets.dclBracketLabel.s329.test.tsx
 Tests  1 passed (1)
```

**Negative-control validation** (temporarily reverted `y={34}` back to `y={baseY - 74}`, confirmed
failure, then restored the fix):

```
× the gap-evidence bracket never crosses a text label, for every authored judge-mode step
  AssertionError: sp-02-02/i1 [error]: bracket segment [247.09,58]-[247.09,70]
  crosses "overlap ≈ 98%": expected true to be false
```

Confirmed non-vacuous, caught the real authored `sp-02-02/i1` lesson exactly as predicted; confirmed
passes again after restoring the fix.

---

## 3. Combined final gate run

All seven relevant files together, one `vitest` process:

```
$ npx vitest run \
    src/components/figures.asv0101TriangleClip.s329.test.tsx \
    src/components/widgets.dclBracketLabel.s329.test.tsx \
    src/components/figures.labelCollision.s238.test.tsx \
    src/components/widgets.labelCollision.s237.test.tsx \
    src/components/widgets.distributionCompare.tone.s218.test.tsx \
    src/components/widgets.distributionCompare.s131.test.tsx \
    src/components/widgets.colourCue.s242.test.tsx

 Test Files  2 failed | 5 passed (7)
      Tests  9 failed | 49 passed (58)
```

The 2 "failed" files are `figures.labelCollision.s238.test.tsx` (1 pre-existing failure,
`asv-surface-vs-volume`, §1.5) and `widgets.labelCollision.s237.test.tsx` (8 pre-existing
failures, none touching DCL, §2.5) — both fully accounted for above as out-of-scope,
pre-existing, and unaffected by this session. The 5 fully-green files include both new S329
regression tests and every test file this session could find that directly exercises either
fixed component.

---

## 4. Recommended ledger updates

### CL-P1-051 (Session 227 Premium Rebuild Wave-B update table, `ID | Priority | Area | Finding | Status | Evidence / next action`)

```
| CL-P1-051 | P1 | Mobile visual labels | `asv-01-01`'s triangle figure (`TriangleHalfRectangle`, `src/components/figures.tsx`) clipped its right-side "height" label past the SVG's own `viewBox` (23.5 units over, in viewBox user-space — reproducible at any render width, not only 390px) and its center caption sat directly on the triangle's hypotenuse stroke. | **CLOSED — S329** | `viewBox` widened 240×130 → 280×160; caption moved below the shape (the same bottom-caption placement `LShapeDecompose`/`PrismNet` already use), putting it entirely below the shape's y<=110 extent so the hypotenuse cannot cross it by construction. Verified with `textBoxes.testkit.ts`'s exact box model (0.72em/char, 0.98/0.28em ascent/descent) plus a Liang-Barsky segment/rect check: all 3 labels have positive clearance from every viewBox edge and from the hypotenuse, before/after numbers in `reports/closure/S329_CLOSURE_CL2.md` §1. New permanent gate `figures.asv0101TriangleClip.s329.test.tsx` (3/3 green, negative-control validated against the original geometry). `figures.labelCollision.s238.test.tsx` unaffected: `triangle-half-rectangle` measured 0 text-vs-text collisions before and after (its bug classes were outside that ratchet's model); the file's one remaining failure is the pre-existing, out-of-scope `asv-surface-vs-volume` figure (unchanged by this session, tracked separately, NOT the same bug despite both living in the area-surface-volume course). | Collision or clip observed at any supported viewport/zoom, or the figure's geometry changes without re-running `figures.asv0101TriangleClip.s329.test.tsx`. |
```

### CL-P1-012 (original 10-column ledger table, `ID | Sev | Area | Exact evidence / learner impact | Affected | Proposed fix | Status | Session | QA / closure evidence | Reopen condition`)

```
| CL-P1-012 | P1 | dCL visual polish | `distributionCompareLab`'s judge-mode "overlap ≈ N%" evidence label (`DistributionCompareLabW`, `src/components/widgets.tsx`) sat at y=76, inside the y:[58,70] gap-bracket's tick lines; for every authored `gapUnits <= 1` (5 of the current 10 judge instances — `sp-02-02/i1`, `sp-02-02/k2` + `rem-soj-k`, `sp-02-03/k3`, `si-03-03/i1`) the ticks fell inside the label's own width too, so the bracket visually pierced the text at exactly the small-gap "overlap dominates" moments this evidence exists to teach. | 10 judge steps / 4 authored lessons currently activated (recounted this session by full corpus scan — `sp-02-01`, `sp-02-02`, `sp-02-03`, `si-03-03`; the ledger's "7 steps / 3 lessons" was S218-era and stale) | Move the "overlap ≈" label above the bracket, stacked over "gap ≈"; verify geometrically against every authored `gapUnits`, not just spot cases. | **CLOSED — S329** | S329 | Liang-Barsky segment/rect check confirms zero bracket-vs-label collisions across all 10 current judge instances after the fix (was 5/10 colliding before); full numbers in `reports/closure/S329_CLOSURE_CL2.md` §2. `widgets.labelCollision.s237.test.tsx -t distributionCompareLab` 5/5, `widgets.distributionCompare.tone.s218.test.tsx` 8/8, `widgets.distributionCompare.s131.test.tsx` + `widgets.colourCue.s242.test.tsx` 11/11, all green. New permanent corpus-scanning gate `widgets.dclBracketLabel.s329.test.tsx` (negative-control validated: fails on the original geometry against the real `sp-02-02/i1` lesson, passes after the fix). Full-file run of `widgets.labelCollision.s237.test.tsx` has 8 pre-existing failures in unrelated engines (numberLineHop/numberLinePlace/signChart/triangleSolve/doubleNumberLine/barBuilder ×2/lengthCompare count drift) from ongoing concurrent-session content growth — none reference distributionCompareLab, confirmed unaffected by this session's single-hunk diff. | Collision observed at any supported viewport/zoom, or a newly authored `gapUnits` value reintroduces bracket/label overlap (the new gate reruns against the live corpus, so this should self-detect). |
```

---

## 5. Files touched this session

- `src/components/figures.tsx` — one hunk, `TriangleHalfRectangle()` only (§1.3). The larger
  `git diff --stat` total (97 insertions / 3 deletions) includes ~75 lines of a pre-existing,
  disjoint, sibling-session addition (`VmNotchBlock`/`VmEqualVolumesCompare`, S328-attributed in
  its own comment) at a different line range, already present and uncommitted before this session
  started; not written by this session and not touched by it.
- `src/components/widgets.tsx` — one hunk, the `dcl-evidence` block inside
  `DistributionCompareLabW()` only (§2.3). Full diff is 29 lines, all in that one place.
- `src/components/figures.asv0101TriangleClip.s329.test.tsx` — new, permanent (§1.6).
- `src/components/widgets.dclBracketLabel.s329.test.tsx` — new, permanent (§2.6).

No lesson JSON edited; `reports/closure/cowork-staging/laneA-s329-CL2.jsonl` was not created (no
content disposition needed — both fixes are component-layout-only, matching how sibling packet
CL1 also produced no staging record for its tooling-only fix).

## 6. Summary

| Row | Bug class the existing ratchet couldn't see | Fix | New gate | Result |
|---|---|---|---|---|
| CL-P1-051 | viewBox clip + shape-vs-text overlap | widen viewBox, move caption below shape | `figures.asv0101TriangleClip.s329.test.tsx` (3/3) | CLOSED — recommend above |
| CL-P1-012 | shape(bracket)-vs-text overlap, 5/10 real corpus instances | move "overlap ≈" above the bracket | `widgets.dclBracketLabel.s329.test.tsx` (1/1, scans live corpus) | CLOSED — recommend above |

Both new gates were negative-control validated (temporarily reverted each fix, confirmed the new
test fails on the original geometry against a real authored lesson, then restored the fix) before
being reported as passing.
