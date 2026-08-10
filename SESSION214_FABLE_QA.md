# SESSION 214 — FABLE-QA independent assessment

Assessor: FABLE-QA, Session 214. I built none of this. Every claim below was re-derived from disk,
from the S213 seal (`/home/claude/maggie/maggies-trail-session-213.tar.gz`), or by driving the real
models with `tsx`. Implementor claims were treated as unverified until reproduced. I read my
predecessor's S213 report first and held its bar; I did not defer to it.

Subjects:

- **(A)** `content/courses/two-step-equations/lessons/tse-01-01.json` step `i1` — the re-authored
  `algebraTiles` area-mode distribution step, second attempt after S213's REJECT.
- **(B)** `content/courses/polygons-quadrilaterals/lessons/pq-05-03.json` step `i1` — an MCQ
  replaced by a `coordinateProofLab` rhombus certification.
- **(C)** `src/components/widgets.tsx` `SystemsExploreW` — the lines became draggable; re-scored
  against my predecessor's 7.9 for `se-01-03`.

---

## 1. Technical verification — every item re-run

| Claim | Result |
|---|---|
| Exactly TWO authored lesson files differ from the S213 seal | **TRUE.** Full-tree `diff -rq content/` returns exactly `pq-05-03.json` and `tse-01-01.json`, nothing else. |
| `tse-01-01.json` `86e8e986…128b` → `e4ea479d…afd8` | **TRUE** (`sha256sum`, both sides). |
| `pq-05-03.json` `8bfebfc0…3d9c` → `8b719052…f92f4` | **TRUE** (`sha256sum`, both sides). |
| `scripts/engine-capabilities.json` unchanged | **TRUE** — the entire `scripts/` tree is byte-identical to the seal. |
| `schema.ts` change is additive-optional-no-default | **TRUE.** One line: `unopenedFrameFeedback: z.string().min(1).optional()`. No default, no change to any existing field. |
| No existing test weakened | **TRUE for all six touched files.** Details in §1.1. |
| A hash-proof failure naming exactly these two files is expected | Acknowledged, not counted against the work. |

Also changed outside `content/`: `src/lib/evaluate.ts` (11 lines), `src/lib/schema.ts` (10),
`src/lib/mmip/algebraTilesModel.ts` (130), `src/components/widgets.tsx` (279), plus six test files.
`tsconfig.tsbuildinfo` differs (build cache) and an untracked `test-results/` directory of Playwright
artefacts exists in the checkout; neither is a source change.

**`se-01-03.json` is byte-identical to the seal** (`f9497d19…4cd1`). My predecessor's REQUIRED_FIXES
3 and 4 (state-neutral `degenerateSystemFeedback`, the missing `predict` block) landed *before* the
S213 seal — I re-read both and they are correct — and its F1 red pin
(`evaluate.systemsLines.s213.test.ts`) is green. So (C) is an engine change to a lesson whose
content nobody touched. That matters; see §5.

### 1.1 The six test files, judged individually

Narrowings, not relaxations, in all six:

- `schema.algebraTilesArea.s211.test.ts` — the blanket "gains NOT ONE key" pin became a **named
  `AREA_USERS` allowlist with an exact key set per entry**: an undeclared opt-in fails, *and* a
  declared lesson carrying a different key set fails. Plus a new test hand-checking
  `(0x−3)(1x+2)` → `{0, −3, −6}` against the step's own targets. Strictly stronger.
- `evaluate.algebraTilesArea.s212.test.ts` — the count 27 is still pinned; the old-path proof now
  runs over the 26 classic specs with `classic.length` pinned at 26 **and** the one opt-in named by
  full path. Strictly stronger.
- `widgets.mmip.o1.s212.test.tsx` — rewritten around the new design; asserts proportional edge
  segments read out of the DOM, cell counts by kind, fill-by-sign, and the absence of any
  open-the-rectangle control.
- `widgets.mmip.o2.s212.test.tsx` — the "a classic spec renders none of this" list gained all four
  grip testids, for the fixture *and* for every authored classic spec. Pure narrowing. New drag
  tests compute pointer targets from the two absorb rules by hand.
- `mmip/algebraTilesModel.test.ts` — new `deriveArea` suite asserting `needs === algebraTilesPartials`
  over four specs, that the cells tile the rectangle with **no gap and no overlap**
  (`Σ w·h === width × height`), sign propagation for a negative factor part, and that a wrong-sign
  tile covers nothing. Genuinely new proof obligations.
- `mmip/algebraTiles.harness.s210.test.ts` — the edit logs were rewritten because the start state
  changed; `casesRun` went 7 → 8. One equivalence proof was **replaced**: "open-then-build vs build
  by hand" became "two production orders reach the same views", and a third was added ("one tile at
  a time equals setting the count outright"). Net: one cross-path proof about the now-UI-unreachable
  `distribute` op was dropped, two production proofs added. Defensible, and the only place in the six
  where coverage moved sideways rather than up.

### 1.2 Test runs (3 of 3 used, all green)

```
vitest run schema.algebraTilesArea.s211 evaluate.algebraTilesArea.s212 algebraTilesModel
           algebraTiles.harness.s210 widgets.mmip.o1.s212      →  5 files, 95 tests, ALL PASS
vitest run widgets.mmip.o2.s212 evaluate.systemsLines.s213 schema.systemsExplore.s212
           systemsPairAdapter linePairModel mmipHarness        →  6 files, 150 tests, ALL PASS
vitest run conversions.s120 content content.widgets.audit
           widgets.keyboard widgets.aria                       →  5 files, 402 tests, ALL PASS
```

No red pin anywhere. `widgetIntegrityErrors` (the real `validate:content` path) returns `[]` for
both new specs, checked directly.

---

## 2. (A) tse-01-01/i1 — the re-authored rectangle

### 2.1 What my predecessor rejected, item by item, verified against the running model

| S213 ground for REJECT | Status now | Evidence I produced |
|---|---|---|
| **F2** No rectangle — a fixed dashed box containing a string; `views.mat.edges` two strings | **FIXED** | `deriveArea` returns columns `[unit−, unit−, unit−]` and rows `[x+, unit+, unit+]`; `width = 54 = 3×18`, `height = 80 = 44+18+18`. The edges are **drawn proportionally**: an x-segment is 44, a unit 18. Nine real cells with x/y/w/h, labelled edges `−3` and `x + 2` rendered on the sides. |
| **F3** One click produces the answer; sliders disabled while framed | **FIXED** | `algebraTilesInitial` now returns `framed: false`; the distribute branch of the frame row renders **nothing** — the "Open the rectangle" and "Multiplier to the x only" buttons are gone from the file. Sliders are enabled from t=0 (`disabled = disabled \|\| views.mat.framed`, and `framed` is false). Driven: `x:=−1,−2,−3` fills 1→2→3 cells; `c:=−2,−4,−6` fills 5→7→9. |
| **F4** "0x + 0" displayed and spoken for a mat worth −3x−6 | **FIXED** | The mat genuinely holds nothing at the start, so `0x + 0` is true of it. The product caption renders only when `framed`, which distribute mode can no longer reach through the UI. |
| **F5** `constFeedback` served for "did nothing", revealing −6 | **FIXED** | New optional `unopenedFrameFeedback`; driven at the start state it fires with *"Nothing is on the mat yet. Read the rectangle…"*. |
| **F6** Misconception branch is a dead end behind a hidden Undo | **FIXED** | The `−3x + 2` state is now entered by moving the unit slider to +2 and left by moving it again. No special button, no hidden Undo. `partialProductFeedback` fires on exactly that state (verified). |

**Is it genuinely produce-not-click, or has the click moved?** Produce. There is no button in the
distribute path at all — I checked the JSX, not just the claim. The learner sets two counts and the
picture answers cell by cell. This is the S212 production demand *plus* a rectangle that adjudicates
it, which is strictly more than the seal had.

**Does the picture show the mathematics?** Yes, and in one respect better than I expected. `filled`
requires the **sign** to match, so:

```
x = +3, c = +6  (the minus dropped)   → 0 of 9 cells fill.  The rectangle stays empty.
x = −3, c = +2  (multiplier stopped)  → 3 of 9 fill; six holes where the units belong.
x = −3, c = −6                        → 9 of 9. complete.
```

The counts are readable off the subdivision — three x-shaped cells, six unit-shaped cells — and I
considered whether that hands over the answer. I judge not: that *is* the defining affordance of an
area model (the picture is the argument), the learner still has to translate cells → signed tile
counts → expression, and the one thing the picture withholds until it is produced correctly is the
**sign**, which is exactly the misconception this step and its `predict` block exist to attack. A
future assessor may disagree, but they should disagree knowing that is the crux.

### 2.2 New defects — both found by driving the model, both about strings that are false

**A-1 (blocking). `partialProductFeedback` states a falsehood about the picture it points at.**
It ends *"Look at the rectangle — four of its parts are still empty."* In the state it fires
(x = −3, c = +2) **six** of the nine are empty, and the widget's own progress line one inch away says
*"3 of 9 parts of the rectangle are covered."* Two on-screen strings contradicting each other, with
the feedback the false one. The "four" is correct only for the **positive** fixture `3(x + 2)` used
in `algebraTilesModel.test.ts` (`+2` units fill two of six positive cells); the authored lesson is
`−3(x + 2)`, where a `+2` unit cannot cover a negative cell — which the tests themselves assert
("a tile of the WRONG SIGN does not cover a cell"). This is CLAUDE.md rule 5, and it is precisely
the class of defect the project's own guidance says only *reading the printed output* catches.

**A-2 (blocking). Over-production makes the rectangle claim to be finished, and says so aloud.**
`complete` is computed by drawing a signed budget down, so any surplus still fills every cell:

```
x = −5, c = −8  → filled 9/9, complete = true, verdict = INCORRECT
  aria-live text: "Every part of the rectangle is covered: 9 pieces, and together they are −5x − 8."
x = −8, c = −8  → "…and together they are −8x − 8."
```

The nine pieces of a `(−3)(x + 2)` rectangle are `−3x − 6`, never `−8x − 8`. This is displayed in
the progress line **and announced** (`aria-live="polite"`), and it is reachable in one slider drag —
nothing in the picture tells the learner to stop at −3, because the rectangle goes complete at the
target and stays complete past it. This is the same class as the A-M2 my predecessor rejected the
first attempt for ("the surface asserts a false value"), newly introduced. The fix is one line:
render the rectangle's own value (from `needs`) rather than the mat's net, or make `complete` require
an exact match.

**A-3 (minor, a11y).** The SVG's accessible name is still *"Tile board showing 0x and a constant of
0."* — no mention that a nine-part rectangle with labelled edges is on the board. The only
non-visual route is the progress sentence, which gives a count ("0 of 9 parts") but never says which
parts are x-cells and which are units. The picture's structure is visual-only; a screen-reader user
gets the arithmetic from the prompt and nothing from the model.

**A-4 (minor, polish).** The new algebraTiles comments are labelled **"S215"** in four files
(`schema.ts`, `evaluate.ts`, `algebraTilesModel.ts`, `widgets.tsx`) for Session-214 work, while the
same session's systemsExplore comments in the *same file* say "S214". My predecessor raised this
exact defect (F9) for S213; it recurred unchanged, one number higher. The stale S213 comment at
`widgets.tsx:5112` ("WHILE THE RECTANGLE STANDS… (S214)") also survives and now describes a state the
distribute path cannot reach.

**A-5 (secondary).** `constFeedback` still ends *"so it is −6"*. With the "nothing yet" state now
correctly diverted, this string becomes the **first** thing most learners see — the natural sequence
is set x, press Check — and it hands over the constant on the first miss. Pre-existing authored text,
unchanged this session, but its blast radius grew.

**Latent, not a defect.** `algebraTilesApply(..., {kind:"factor"})` still succeeds from a complete
distribute mat (`framed → true`), where `evaluate` would then serve *"Nothing is on the mat yet"* for
a full mat. Unreachable: `deriveControls.canFactor` requires `mode === "factor"` and the gather
button only renders in factor mode — and the source comment explains the one-direction rule
deliberately. Worth one line in the handover, nothing more.

### 2.3 Mathematics, hand-checked

`algebraTilesPartials([0,−3],[1,2])` = square 0·1 = **0**, x 0·2 + (−3)·1 = **−3**, unit
(−3)·2 = **−6**. Authored `targetX = −3`, `targetConst = −6` — match, unchanged from the seal.
`deriveArea(...).needs` returns `{square: 0, x: −3, unit: −6}` **by counting cells**, not by calling
`algebraTilesPartials`, and the tests assert the two agree over four different specs. `maxTiles = 8`
holds both piles. Every grader branch driven; no arithmetic error anywhere in the engine.

---

## 3. (B) pq-05-03/i1 — rhombus certification

### 3.1 The engine claim, verified myself

**TRUE.** `CoordinateProofLabW` computes `mAB, mCD, mBC, mAD` — sides AB/CD and BC/AD. There is no
diagonal slope anywhere in the widget; the diagonals appear only as dashed lines drawn by the
`midpoints` evidence. So `requiredEvidence: ["midpoints","slopes"]` genuinely **cannot** evidence
"the diagonals are perpendicular", and the author's reason for departing from the sweep's sketch is
sound. Choosing `midpoints` is additionally necessary for the diagonals to be visible at all.

### 3.2 Geometry, hand-verified three ways

A = (2,5), B = (5,1), C = (8,5), D = (5,9).

1. **Sides.** AB = |(3,−4)| = 5, BC = |(3,4)| = 5, CD = |(−3,4)| = 5, DA = |(−3,−4)| = 5. Four equal
   sides ⇒ rhombus. Diagonals AC = 6, BD = 8 — **unequal**, so not a rectangle and therefore not a
   square. Most specific = **rhombus**.
2. **Diagonals.** mid(AC) = (5,5) = mid(BD) ⇒ mutual bisection ⇒ parallelogram. AC·BD as vectors:
   (6,0)·(0,8) = **0** ⇒ perpendicular. Parallelogram + perpendicular diagonals ⇒ rhombus. Slopes
   confirm the parallelogram independently: AB = CD = −4/3, BC = AD = 4/3.
3. **The repo's own classifier.** `quadName([A,B,C,D])` returns **"a rhombus"**; at the start
   position it returns "just a quadrilateral".

**Target uniqueness — the best property in this step.** I swept the whole 0..10 lattice: the *only*
D making either a rhombus **or** a parallelogram is (5,9); the only other four-equal-sides solution
is D = (5,1), which is B itself. So the grader's exact-position requirement is mathematically forced,
not an arbitrary pin. Grader behaviour driven and confirmed: exact position → then `moves ≥ 3` and
all evidence → success; wrong position → `positionFeedback`; right position, missing evidence →
`evidenceFeedback`; `null` → the built-in nudge.

Every authored string is true, including the forward reference: *"the same theorem the
four-right-triangles trick in the next problem depends on"* — `k1` is exactly that problem
(diagonals 10 and 24, side √(5²+12²) = 13).

### 3.3 Is the visual-only right angle acceptable?

**For this configuration, yes — and only for this one.** The evidence the step actually gathers is
*bisection* (midpoints) + *four equal sides* (distances). That certifies a rhombus, but it
substitutes the **conclusion** for the **hypothesis** the prompt states: perpendicularity is never
measured. Three things make it survivable here: the diagonals land axis-aligned (one horizontal, one
vertical), so the right angle is visually unambiguous rather than eyeballed; the `predict` block asks
exactly the right question ("must the four sides come out equal, or could they differ?") and its
reveal supplies the SAS argument that *makes* the two conditions equivalent; and `successFeedback`
names the right angle explicitly. If the same design were reused on a tilted rhombus I would reject
it. The honest resolution is an engine gap to record: `slopes` should compute diagonal slopes too, or
a `diagonals` evidence kind should exist.

### 3.4 Defects

**B-1 (blocking). `positionFeedback` prints the answer.** It opens *"D is not at (5, 9) yet."* The
first Check at any wrong position hands the learner the exact graded quantity. Two of the four
sibling labs (`pq-02-01`, `cx-01-03`) diagnose without naming the target; two (`pq-02-03`,
`pq-05-01`) name it. This step followed the weaker half of the house pattern, on a step whose entire
graded act is *find D*. `evidenceFeedback` repeats it (*"at (5, 9) the position is right"*).

**B-2 (mastery regression). The classification teaching was deleted, and the answer is printed from
t = 0.** The widget renders `LabReadout label="claim" value={spec.targetClaim}` unconditionally, so
**"rhombus" is on screen before the learner does anything** — on a step whose body is still *"Most
specific, not most generous."* The MCQ it replaced made the learner discriminate rhombus / square /
kite / rectangle with four diagnostic feedbacks, including the one this lesson now has nowhere else:
*"Square requires the diagonals ALSO be congruent. Perpendicular alone stops at rhombus."* I checked
the rest of the lesson: `k3` does most-specific for tick marks (kite), `i2` and `ch` cover congruent
diagonals — nothing now teaches *perpendicular ≠ square*. That discrimination left the product.

**B-3.** The disclosed visual-only right angle — see §3.3. Docked, not blocking.

**B-4 (minor).** The prompt says *"Drag D until both hold"*. This widget has **no drag handle**; D
moves only through two range sliders. (Its neighbours `triangleAngleLab` and `vectorExplore` do have
one.) The authored verb is not available to the learner.

**B-5 (minor).** `requiredMoves: 3` never binds: the two required evidence toggles each increment
`moves`, and reaching (5,9) from (2,2) needs at least two slider changes, so `moves ≥ 4` whenever the
other two conditions hold. The gate is decorative.

**B-6 (minor).** The start D = (2,2) makes ABCD **self-intersecting** — AB crosses CD at ≈(3.64,
2.82) — while it is drawn as a filled polygon and named "Quadrilateral A B C D" in the accessible
name.

**B-7 (test coverage).** `conversions.s120.test.ts` carries a per-lab claim test for `pq-02-03` and
`pq-05-01` ("at the target the two diagonal midpoints are one point"; "equal diagonals plus mutual
bisection is exactly a rectangle"; "evidence cannot be skipped"). **No equivalent was added for
`pq-05-03/i1`** — it is now the only `coordinateProofLab` in content without one. The house standard
exists, is three lines long, and `quadName` already returns "a rhombus".

---

## 4. (C) systemsExplore — the lines are draggable

### 4.1 Claims, all verified by driving the real graph

| Claim | Result |
|---|---|
| Two grips per editable line: slide = `dragPoint` handle `"intercept"` (holds the rate), tilt = handle `"unit"` at x = 1 (holds the start) | **TRUE.** `far = param === "slope"`; `preferredGripX(true)` = 1 for this window, matching `lineExplore`'s unit point since S208. |
| No drag-specific mathematics — all through existing absorb paths | **TRUE.** Steppers and drags both build a `LineEdit` and go through `graph.apply` → `absorbLineEdit`. The two rules are the S208 ones: slide `b = y − m·x`, tilt `m = (y − b)/x`. Both put the line **through the pointer at the grip's x**, so the grip tracks the finger — I checked the algebra, not just the wiring. |
| Steppers/ranges retained as secondary precision/keyboard controls | **TRUE**, with a new `"Or set the lines exactly"` header demoting them. |
| One grab = one undo step | **TRUE, driven.** Six pointermoves under one gesture key crossing two distinct slopes: history depth stayed **1**. A second grab made a second step. Undo unwound one grab at a time back to the authored `m₂ = −1`. A drag key (`b:slope#1`) can never merge with a stepper run (`b:slope`). |
| Hit targets r = 24 viewBox → 46.7–51.2 CSS px at 320px | **TRUE, and I re-derived it from the layout rather than the claim.** `LessonPlayer`'s `<main>` is `px-4`, so a 320px viewport gives a 288px stage; 2·24·288/300 = **46.1 px** (their 292 gives 46.7). The old `r = 18` gives 34.6 px — under the 44px bar, exactly as my predecessor said. |
| Live region narrates mathematics, not pixels | **TRUE.** Sentence = what changed + clamp reason + `Now <relation reason>.` Driven: *"…Now both climb at 1, so they keep a constant gap of 4 and never meet."* Clamps read *"5 clamped down to the largest allowed slope, 3"*. |

Also verified: snapping to the authored step is honoured on drag (pointer y = 5.4 → m 0.4 → **0**;
y = 5.8 → **1**); the grips walk back toward the intercept when a steep line leaves the window (with
m = 3, b = 1 the slide grip moved from x = 3 to x = 2 on its own); classic specs render no grips (the
o2 suite pins all four testids absent for the fixture *and* every authored classic spec); and the
critical safety property survives untouched — **coincident, with the point on the shared line, still
grades incorrect** with `degenerateSystemFeedback`. A learner still cannot win by destroying the
question.

### 4.2 Limits the claim does not mention

**C-1. The lesson was not told.** `se-01-03.json` is byte-identical to the seal, and its prompt still
reads *"Then use the **line controls** to change a rate"*. A learner who follows the authored text
never grabs anything. For a change whose whole justification is "the mathematical object should be
grabbed, not stepped", shipping it without touching the one lesson that uses it leaves the lift as an
unadvertised affordance.

**C-2. The drag covers only part of the authored range on line a.** The tilt grip sits at x = 1 and
the window is y ∈ [0,8], so line a (b = 1) can be tilted by drag only to m ∈ [−1, 3]; slopes −2 and
−3 are stepper-only, and nothing explains why the line stops following the pointer at the bottom
edge. Line b (b = 5) reaches the full [−3, 3]. The pedagogically essential move — make the rates
equal — is comfortably reachable on both (tilt b from y = 4 to y = 6 takes m₂ from −1 to 1 and the
model immediately reports *parallel, gap 4*), so this is a limitation, not a defect.

**C-3 (minor).** `stage(...)` runs on every pointermove, so the polite live region is written on
every move of a drag including "unchanged" ones. S213 was careful to keep ordinary stepper nudges
silent on classic mats; the drag reintroduces chattiness the stepper did not have.

**C-4 (minor).** Four `useSvgDrag` hooks are called inside a `.map()` with `rules-of-hooks`
suppressed. Fixed length and fixed order make it safe and the reason is written down, but it is a
lint suppression where the file previously had none for this rule.

**C-5 (by design, stated for the record).** Grips are `aria-hidden` with no keyboard equivalent of
their own — correct, because the retained steppers are the parity route. A grip sitting under the
answer point is temporarily unreachable by pointer (the point is drawn last and wins the overlap);
deliberate, documented, and the steppers cover it.

### 4.3 Re-scoring `se-01-03` end to end, against the predecessor's 7.9

| Dimension | S213 | Now | Why it moved |
|---|--:|--:|---|
| MATHEMATICS | 8 | **9** | `degenerateSystemFeedback` is now state-neutral — I re-read every clause against both branches and none is false of either. (This landed before the seal, not this session.) Not 10: the lines still carry no equation labels. |
| MASTERY GAIN | 8 | **8** | Graded task unchanged. The grab adds a real affordance (tilt-holds-start vs slide-holds-rate *is* the m/b distinction made physical) but the prompt never invites it (C-1). |
| CAUSALITY | 9 | **9** | The promised `predict` block now exists, so the loop is real; the drag makes the consequence continuous rather than stepwise. |
| REPRESENTATIONS | 8 | **8** | The parameter moved onto the picture — but my predecessor's docking reasons were equation labels and "rate"/"start" instead of m/b, and **those are untouched**. |
| MISCONCEPTION | 7 | **7** | Same states; the ✓✓-plus-green-dot-with-"incorrect" tension is unchanged. |
| INTERACTION | 7 | **9** | The named ceiling is gone. |
| ACCESSIBILITY | 7 | **8** | The answer point crossed the 44px bar (34.6 → 46.1). The line ranges are still `h-10` (40px). |
| POLISH | 7 | **8** | The steppers are correctly demoted; comments here are labelled S214 correctly. |
| **weighted** | **7.9** | **8.4** | |

**Plainly: the ceiling my predecessor named in INTERACTION is gone.** The mathematical object is now
grabbed, the grip identity carries the invariant it holds, one grab is one undo, and snapping and
clamping are honoured and spoken. **The ceiling it named in REPRESENTATIONS is not gone** — that
docking was about unlabelled lines and "rate"/"start" language, neither of which this touched, and it
would be wrong to read the drag as answering it. Of the +0.5 total, roughly +0.3 is (C) and +0.15 is
the S213 fixes that landed before the seal.

---

## 5. The refused candidate — vec-03-02/k1, spot-verified

**The refusal was RIGHT.** Three independent confirmations:

1. `evaluate.ts:1057` — `const d = dotProduct(spec.ux, spec.uy, v.vx, v.vy); if (d === spec.targetDot)
   return correct`. The dot product is the *only* thing checked.
2. For u = (1,0), d = vx. So d = 1 ⟺ vx = 1 for **any** vy. The widget's drag and sliders snap to
   `[−G, G]` with `gridMax` default 6, so all thirteen lattice v = (1, vy), vy ∈ [−6,6] grade correct,
   spanning θ = atan(|vy|) = **0° … 80.54°**. The step teaches θ = 45°. The graded quantity is not the
   taught quantity.
3. Structurally: for any u ≠ 0 the set `{v : u·v = k}` is a *line*, so a nonzero target can never
   certify an angle. The one target for which the level set **is** the taught set is k = 0
   (perpendicularity) — which is precisely what `vec-03-02/i1` already does, and its
   `successFeedback` celebrates the multiplicity by name: *"notice several v work — (4,−3), (−4,3),
   (8,−6) — because perpendicular is a whole line of directions."*

A fourth reason the refusal did not need: `k1` carries a `variant` declaration
(`g12-vectors-matrices` / `vectors-matrices__vec-angle__numeric`) that generates **numeric** items;
converting the widget would have orphaned it. Refusing cost the product nothing and protected a
working step.

---

## 6. Scores

| Dimension | Weight | (A) tse-01-01 | (B) pq-05-03 | (C) systemsExplore | Composite |
|---|---|--:|--:|--:|--:|
| MATHEMATICS | 20% | 7 | 9 | 9 | **8** |
| MASTERY GAIN | 25% | 7 | 6 | 7 | **7** |
| CAUSALITY | 15% | 7 | 7 | 9 | **8** |
| REPRESENTATIONS | 10% | 8 | 7 | 8 | **8** |
| MISCONCEPTION | 10% | 6 | 6 | 7 | **6** |
| INTERACTION | 10% | 7 | 6 | 9 | **7** |
| ACCESSIBILITY | 5% | 6 | 7 | 8 | **7** |
| POLISH | 5% | 5 | 6 | 8 | **6** |
| **weighted** | | **6.9** | **6.9** | **8.1** | **7.3** |

---

## 7. Verdicts

### (A) `tse-01-01` step `i1` — **ACCEPT-WITH-FIXES**

Every one of the four grounds my predecessor rejected on is genuinely addressed, and I verified each
against the running model rather than the report: there is a real rectangle with proportional edges
and nine partial-product cells whose counts reproduce `algebraTilesPartials` by construction; the
button is gone and the learner produces the tiles; the false "0x + 0" is true now; the "nothing yet"
state has its own words; and the misconception is a state you enter and leave with a slider instead
of a dead end behind a disclosure. The sign-sensitivity of the fill is a better idea than the one it
replaced — dropping the minus leaves the whole rectangle empty. That is a model responding to the
concept.

It is not ACCEPT because two authored strings assert things that are false of the drawn state, and
one of them (A-2) is spoken aloud. My predecessor rejected the first attempt partly because "the
surface asserts a false value"; I will not wave that through on the second. Both are small fixes.

### (B) `pq-05-03` step `i1` — **ACCEPT-WITH-FIXES**

The mathematics is the best in this session: I confirmed the rhombus three ways, and the exhaustive
lattice sweep showing (5,9) is the *unique* non-degenerate solution makes the exact-position grader
mathematically forced rather than arbitrary. The engine claim about `slopes` is true and the
redesign that followed from it is the right call. The midpoint dots converging give the learner a
complete causal route to the target, and `k1`/`k2` transfer the theorem to new numbers immediately.

It is held back by three things that are all fixable in the content file: the answer coordinates are
printed on the first miss, the answer *name* is printed from the first frame, and the four-way
classification teaching the step replaced is now nowhere in the lesson. The visual-only right angle
I accept for this configuration, and only because it is axis-aligned and the `predict` block carries
the argument.

### (C) systemsExplore draggable lines — **ACCEPT**

Correct in construction (no new mathematics, all through S208 absorb paths), correct in undo
granularity, correct in what it says aloud, and it moves every pointer target from under the 44px bar
to over it. It removes the exact interaction ceiling my predecessor named. The one thing standing
between "shipped" and "landed" is that the lesson's own prompt still points at the steppers.

---

## 8. FAILURES

- **A-1 (blocking).** `partialProductFeedback` says *"four of its parts are still empty"* when **six**
  are, contradicting the widget's own on-screen count, in the one string that tells the learner to
  look at the picture. The "four" is true only of the positive test fixture, not the authored lesson.
- **A-2 (blocking).** Over-production reports `complete` and announces *"Every part of the rectangle
  is covered: 9 pieces, and together they are −8x − 8"* — false, displayed and spoken, reachable in
  one slider drag.
- **A-3.** The algebraTiles SVG's accessible name never mentions the rectangle; its nine parts' kinds
  are visual-only.
- **A-4.** New comments labelled "S215" in four files for Session-214 work, beside "S214" for the same
  session in the same file. My predecessor's F9, recurred one number higher; the stale S213 "(S214)"
  comment at `widgets.tsx:5112` also survives and now describes an unreachable state.
- **A-5.** `constFeedback` still hands over "−6", and now does so at the most likely first miss.
- **B-1 (blocking).** `positionFeedback` prints the target coordinates on the first miss;
  `evidenceFeedback` repeats them.
- **B-2 (blocking).** `claim: rhombus` is on screen from t = 0 on a step whose body is "Most specific,
  not most generous", and the rhombus-vs-square-vs-kite-vs-rectangle discrimination the replaced MCQ
  taught is now absent from the whole lesson.
- **B-3.** Perpendicularity — the stated hypothesis — has no numeric readout; the gathered evidence
  is bisection + equal sides, i.e. the conclusion.
- **B-4.** "Drag D" — the widget has no drag handle.
- **B-5.** `requiredMoves: 3` never binds.
- **B-6.** The start position makes ABCD self-intersecting while it is named "Quadrilateral A B C D".
- **B-7.** No claim-verification test for the new lab, breaking the house standard set by
  `conversions.s120.test.ts` for its four siblings.
- **C-1.** `se-01-03`'s prompt still says "use the line controls"; the grab is unadvertised.
- **C-2.** Drag reaches only m ∈ [−1,3] on line a (stepper-only below), unexplained to the learner.
- **C-3.** The polite live region is written on every pointermove of a drag, including no-ops.
- **C-4.** `rules-of-hooks` suppressed for four hooks in a `.map()`.
- **Latent.** `algebraTilesApply({kind:"factor"})` succeeds from a complete distribute mat; the
  resulting `framed` state would be graded with "Nothing is on the mat yet". Unreachable from the UI
  by construction and deliberately documented.

## 9. REQUIRED_FIXES (only what must happen before seal)

1. **A-1 — rewrite the last clause of `partialProductFeedback`** so it is true of the state it fires
   in: with `x = −3, c = +2` the rectangle shows 3 of 9 covered and **six** parts empty. Content-file
   change only.
2. **A-2 — stop the surface claiming a wrong expression is the rectangle.** Either render the
   rectangle's own value (from `views.area.needs`) in the completion sentence, or require an exact
   match for `complete`. One line in `widgets.tsx` or `algebraTilesModel.ts`; add a pin for
   `x = −5, c = −8`.
3. **B-1 — remove the target coordinates from `positionFeedback` and `evidenceFeedback`.** Diagnose
   the way `pq-02-01` and `cx-01-03` do: name the failing condition, not the answer.
4. **B-2 — restore the classification discrimination this step deleted.** At minimum, put
   "perpendicular alone stops at rhombus; a square needs congruent diagonals too" back into the
   lesson (the step's own `successFeedback` or a sibling check). The widget printing the claim name
   is engine behaviour and is a separate, larger question — record it.
5. **B-4 — fix the prompt verb.** The widget has sliders, not a drag handle.
6. **B-7 — add the house-standard claim test** for `pq-05-03/i1` in `conversions.s120.test.ts`:
   `quadName([A,B,C,D]) === "a rhombus"`, `mid(A,C) === mid(B,D)`, `(C−A)·(D−B) === 0`, and the
   evidence-cannot-be-skipped triple. Three lines; the helper already exists.
7. **C-1 — decide the `se-01-03` prompt deliberately.** Either update it so the lesson invites the
   grab (which re-hashes the file and should be a conscious content change) or record that the drag
   ships as an unadvertised affordance. Shipping the capability while the text points away from it is
   the one thing that keeps (C) from fully landing.

Not required before seal, log them: A-3, A-4 (and sweep the S214/S215 labels once), A-5, B-3, B-5,
B-6, C-2, C-3, C-4, the latent factor-in-distribute path, and the fact that
`content/mastery/mastery-cells.json` still records `prediction: false, construction: false` for the
`pq-05-03` concept — a derived artefact that is now stale and should be regenerated.

## 10. CONTENT_IMPACT

- `tse-01-01.json` `86e8e986…128b` → `e4ea479d…afd8`. Authored `algebraTiles` **area-mode users go
  0 → 1** (verified: exactly one spec in all of `content/` carries `area`). The S211 capability
  finally has a user that exercises it honestly. Fix 1 will re-hash the file.
- `pq-05-03.json` `8bfebfc0…3d9c` → `8b719052…f92f4`. `coordinateProofLab` instances **4 → 5**; the
  lesson goes from **zero manipulatives to one** (its other widgets are numeric/mcq only), and loses
  one MCQ with four diagnostic distractors. Fixes 3–5 will re-hash it.
- `se-01-03.json` **unchanged** (`f9497d19…4cd1`). (C) is engine-only. Fix 7, if taken, re-hashes it
  and is the session's third content file.
- No other content file changes. `scripts/`, `data/`, `e2e/`, `tests/` byte-identical to the seal.
- Cross-references checked: `evidence-dossiers.json` records only `check`/`challenge` steps for
  `pq-05-03`, so replacing an `interactive` widget staled nothing there;
  `direct-manipulation-map.json` names neither lesson; `mastery-cells.json` carries a now-stale
  mastery arc for the `pq-05-03` concept (see §9).

## 11. ENGINE_RATING_CHANGE — recommend, do not edit

Current rows in `scripts/engine-capabilities.json` (read, not quoted from the predecessor):
`algebraTiles` manip 2 / conseq 3 / err 3 / adapt 0 / a11y 3 / mobile 2 / polish 2;
`systemsExplore` manip 2 / conseq 3 / err 3 / adapt 3 / a11y 3 / **mobile 1** / polish 3;
`coordinateProofLab` all 3s.

- **`algebraTiles` — no change.** The rebuild is a real representational fix and I said so, but the
  learner still produces the *result* with two sliders; the factors are fixed and cannot be
  manipulated. Under S205M — manip ≥ 2 requires a responding **model**, and a lift requires a new
  *class* of response — nothing here establishes a new tier. Two false surface strings are also
  outstanding. Keep at 2.
- **`systemsExplore` — no change to `manip`; propose `mobile` 1 → 2, through the rubric's own gate.**
  The responding model was already there, so the drag adds *parameters made grabbable*, not a new
  class of response — `manip` stays 2, consistent with five consecutive sessions of "MMIP adoption
  changed no rating". But `mobile: 1` is the lowest number in the row and this session produced
  measurable evidence against it: every pointer target moved from ~34.6 CSS px (under the 44px bar)
  to ~46.1 px at a 320px viewport, and the primary mathematical object became touch-grabbable rather
  than reachable only through a 40px range input. I could not find the axis's written definition in
  the repo, so this is a **proposal with evidence for the rubric owner**, not a verdict; if taken it
  moves Σ 18 → 19 and does not change the grade (already A).
- **`coordinateProofLab` — no change, but an observation for a future audit.** Its row is all 3s,
  including `manip 3` and `mobile 3`, for a widget whose only manipulation is two range sliders and
  three toggles and which has no drag path at all. That looks generous next to `systemsExplore`'s
  `mobile 1`. Not this session's business to fix; worth a line in the next matrix pass.

## 12. NEXT_RECOMMENDED_USE

1. **Land fixes 1–7 and re-run the three suites above.** Nothing is red today; do not seal with a
   string that contradicts the picture beside it.
2. **Finish (A) at the engine, then decide whether to propagate.** The honest ceiling of the rebuilt
   step is that the learner produces the *result* while the factors stay fixed. Let the multiplier
   be changed (−3 → −2 → +3) and the rectangle and expression re-derive together, and the invariant
   "the multiplier reaches every term, sign and all" becomes visible **across cases** instead of one.
   That is the change that would make `algebraTiles` a candidate for a rating conversation; a second
   area lesson before that is premature.
3. **Close the `coordinateProofLab` evidence gap before authoring another one.** `slopes` should
   compute diagonal slopes, or a `diagonals` evidence kind should exist. Until then every "diagonals
   are perpendicular" lab is certified by its conclusion, and only an axis-aligned configuration
   makes that survivable. Also stop printing `targetClaim` before the learner has done anything — on
   a "most specific name" step it is the answer.
4. **Finish (C) by telling the lesson.** Update `se-01-03`'s prompt, then look at the four remaining
   classic `systemsExplore` specs and the sibling `systems-equations/ch1-graphing` lessons: the
   pattern — a breakable object, a grader that refuses to reward breaking it, misconceptions that
   become states, and now a line you grab — is the best thing the program has, and it is being
   propagated one lesson per session.
5. **Sweep the session labels once.** Two sessions running, the same author has stamped work with the
   next session's number while the work beside it in the same file is stamped correctly. It is a
   greppable, one-pass fix, and the repo's archaeology is wrong until someone does it.

---

```
TASK: FABLE-QA independent assessment of S214 — (A) tse-01-01/i1 re-authored algebraTiles area step,
      (B) pq-05-03/i1 new coordinateProofLab rhombus certification, (C) draggable systemsExplore
      lines re-scored against se-01-03's 7.9; plus seal diff, hash, schema, test and refusal checks.
MATHEMATICS: 8/10
MASTERY_GAIN: 7/10
CAUSALITY: 8/10
REPRESENTATIONS: 8/10
MISCONCEPTION_TEACHING: 6/10
INTERACTION: 7/10
ACCESSIBILITY: 7/10
POLISH: 6/10
OVERALL: 7.3/10   (A) 6.9   (B) 6.9   (C) 8.1

VERDICT:
  (A) content/courses/two-step-equations/lessons/tse-01-01.json step i1 — ACCEPT-WITH-FIXES
  (B) content/courses/polygons-quadrilaterals/lessons/pq-05-03.json step i1 — ACCEPT-WITH-FIXES
  (C) src/components/widgets.tsx SystemsExploreW draggable lines — ACCEPT
      (se-01-03 re-scored 7.9 → 8.4; the INTERACTION ceiling is gone, the REPRESENTATIONS one is not)

FAILURES: A-1 partialProductFeedback says "four parts empty" when six are, contradicting the widget's
own count · A-2 over-production announces "9 pieces … together they are −8x − 8", false and spoken ·
A-3 the rectangle is absent from the SVG's accessible name · A-4 "S215" labels for S214 work in four
files (predecessor's F9 recurred) · A-5 constFeedback still hands over −6 at the likeliest first miss ·
B-1 positionFeedback prints the target coordinates · B-2 "rhombus" printed from t=0 and the
square/kite/rectangle discrimination deleted from the lesson · B-3 perpendicularity has no numeric
evidence · B-4 "Drag D" with no drag handle · B-5 requiredMoves never binds · B-6 the start figure is
self-intersecting · B-7 no claim test, breaking the house standard for this engine · C-1 se-01-03's
prompt still points at the steppers · C-2 drag covers only part of line a's authored range ·
C-3 the live region is written on every pointermove · C-4 rules-of-hooks suppressed for four hooks

REQUIRED_FIXES: (1) make partialProductFeedback true of the state it fires in (six parts, not four);
(2) stop the completion sentence claiming a wrong expression is the rectangle — render needs, or
require an exact match for complete, and pin x=−5,c=−8; (3) remove the target coordinates from
pq-05-03's positionFeedback and evidenceFeedback; (4) restore "perpendicular alone stops at rhombus"
to the lesson; (5) fix the "Drag D" verb; (6) add the conversions.s120 claim test for the new lab;
(7) decide se-01-03's prompt deliberately — invite the grab, or record it as unadvertised.

CONTENT_IMPACT: exactly two authored lessons differ from the S213 seal and both claimed hashes are
real. algebraTiles area-mode authored users 0 → 1; coordinateProofLab instances 4 → 5; pq-05-03 goes
from zero manipulatives to one and loses one four-distractor MCQ. se-01-03 is byte-identical — (C) is
engine-only, so the lift is real in the engine and unadvertised in the content. Fixes 1 and 3–5
re-hash both files; fix 7 would add a third. Nothing else in content/, scripts/, data/, e2e/ or
tests/ changed; evidence-dossiers is unaffected, mastery-cells is now stale for pq-05-03.

ENGINE_RATING_CHANGE: no change to any manip score. algebraTiles stays at manip 2 — the learner still
produces the result with two sliders while the factors stay fixed, which is not a new class of
response. systemsExplore stays at manip 2 for the same discipline, but I propose mobile 1 → 2 through
the rubric's own gate, on measured evidence: every pointer target moved from ~34.6 CSS px (under the
44px bar) to ~46.1 px at a 320px viewport and the mathematical object became touch-grabbable. I could
not find the mobile axis's written definition, so that is a proposal, not a verdict. Separately, note
for the next matrix pass that coordinateProofLab sits at manip 3 / mobile 3 with two range sliders and
no drag path at all. scripts/engine-capabilities.json is byte-identical to the seal and I edited
nothing.

NEXT_RECOMMENDED_USE: land fixes 1–7 and re-run the three suites; then finish (A) at the engine by
letting the learner change the multiplier so the invariant shows across cases — that, not a second
area lesson, is what would open an algebraTiles rating conversation; close the coordinateProofLab
evidence gap (diagonal slopes, or a diagonals evidence kind) and stop printing targetClaim before the
learner acts; finish (C) by updating se-01-03's prompt and then propagate the pattern to the four
remaining classic systemsExplore specs; and sweep the S214/S215 comment labels in one pass.
```
