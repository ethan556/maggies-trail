# SESSION 215 — FABLE-QA independent assessment

Assessor: FABLE-QA, Session 215. I built none of this. Every claim below was re-derived from disk,
diffed against the S214 seal (`/home/claude/maggie/maggies-trail-session-214.tar.gz`), or produced by
DRIVING the real models and rendering the real components. Implementor claims were treated as
unverified until reproduced. I read both predecessor reports first and held their bar; the one defect
class they kept catching — *a surface asserting something false of its own state* — is the class I
found three more instances of.

Subjects: **(A)** the `numberLineRay` engine; **(B)** line labels on `systemsExplore`, and a re-score
of `se-01-03`; **(C)** the x²-tile control and the `deriveArea` cell-budget fix; **(D)** the
`RotationLabW` tone defect. Plus the vacuous-assertion sweep and three rating adjudications.

---

## 0. What actually changed, against the seal

`diff -rq` against the S214 seal, full tree:

| Tree | Result |
|---|---|
| `content/` | **BYTE-IDENTICAL. Zero content changes, as claimed.** |
| `scripts/` | **BYTE-IDENTICAL** — `engine-capabilities.json` untouched, so no rating was self-applied. |
| `data/`, `e2e/`, `tests/`, `public/` | **BYTE-IDENTICAL.** |
| `src/` | 9 files modified, 6 added (incl. the new `src/components/widgets/` directory). |
| `docs/` | `CAPABILITY_AXES.md` added. |

Modified: `schema.ts`, `evaluate.ts`, `pedagogy.ts`, `stageWidth.ts`, `describeState.ts`,
`widgets.tsx`, `widgetSamples.ts`, `mmip/algebraTilesModel.ts`, and three test files.
Added: `mmip/numberLineRayModel.ts`, `components/widgets/numberLineRay.tsx`, and five test files.

**Additive-only claims, verified line by line:**

- `schema.ts` — the diff removes exactly ONE line (`RelatedRatesLabSpec`, re-added with a comma).
  Everything else is insertion: `NumberLineRaySpec`, its helpers, `numberLineRaySameSolutionSet`,
  one union member, one `widgetIntegrityErrors` case. **No existing field, default or check touched.**
- `evaluate.ts` — **zero removed lines.** Three additions: a `case "numberLineRay"` in `evaluate`,
  one in `canCheck`, one in `correctAnswerText`, plus two private helpers.
- `pedagogy.ts`, `stageWidth.ts` — one new case each, nothing else.
- `describeState.ts` — one new case, derived through the model rather than reformatted.
- No test was weakened. `widgets.keyboard.test.tsx` adds `numberLineRay` to a REQUIRED list plus
  three tests; `widgets.mmip.o2.s212.test.tsx` adds `se-eq-a`/`se-eq-b` to two *must-be-absent* lists
  (a strict narrowing) plus a new label suite; `describeState.test.tsx` adds a suite. All additive.
- Session labels: **zero `S216` strings anywhere.** S214's A-4 (work stamped with the next session's
  number) did not recur.

### 0.1 Test runs (4 of 4 used)

```
1. the six new S215 suites                          →  6 files, 140 tests, ALL PASS
   (numberLineRayModel 39 + harness 15 + widget 30 = 84 — the claimed count is exact)
2. engineCapabilities ×2, widgets.keyboard,         →  5 files, 232 tests, 3 FAIL (the declared red)
   widgets.mmip.o2.s212, describeState
3. 16 registry-exhaustive / regression suites       → 16 files, 1541 tests, 1 FAIL (UNDECLARED)
4. all of src/lib/mmip + four mmip widget suites    → 20 files, 666 tests, ALL PASS
   + conversions.s120
```

**The declared red is real and is exactly three assertions in two files**: `numberLineRay` missing
from the capability table (twice, `engineCapabilities` + `coverage.s116`), and
`exactNumberLab: onEvent wired=true but adapt=2`. Nothing else in those files is red.

**There is a FOURTH failing assertion that was not declared** — see F1.

---

## 1. (A) `numberLineRay` — the new engine

### 1.1 Every structural claim, driven

| Claim | Result |
|---|---|
| Canonical state is `a·x REL c` with the COEFFICIENT in state | **TRUE**, and load-bearing. `RayCanonical = {coeff, constant, relation, inclusive}`. |
| `scaleBothSides(k)` multiplies both sides and does NOT auto-flip | **TRUE, driven.** From `x > 3`, `scaleBothSides(−2)` → stored `−2x > −6` (`relation` field still `"gt"`), derived `x < 3`, `reversed: true`, ray flips to the other side of 3. `flipRelationSymbol` then returns `−2x < −6` → `x > 3`. The set is destroyed and restored by the learner's own two presses. |
| Grading is on the SOLUTION SET, not the writing | **TRUE, driven against a target of `x ≤ 2`.** All five of `x ≤ 2`, `−2x ≥ −4`, `3x ≤ 6`, `−x ≥ −2`, `(1/2)x ≤ 1` grade **CORRECT**. |
| Open vs closed differ by exactly one point | **TRUE, driven.** Swept `[−6,6]` in quarter-steps: membership differs at exactly one value, `12/4 = 3`. |
| Distinguished by three redundant channels | **TRUE, and it is five, not three**: dot fill; a literal 10-unit `OPEN_GAP` notch between a hollow dot and the ray; the words `"3 included"`/`"3 not included"` under the endpoint; the glyph `≥`/`>`; the interval bracket `[3, ∞)`/`(3, ∞)`. Plus `boundarySentence`. None of them is colour. |
| Empty/universal sets structurally unreachable | **TRUE, proved by closure.** I enumerated the full reachable state space of the sample spec under every edit (13 boundaries × toggle × flip × both transforms × scale-by-0): **5,304 states, zero with `coeff = 0`, zero empty, zero universal.** `scale-by-zero` was refused 5,304 times with a mathematical reason; `rational-overflow` 104 times. |
| The `scale-by-zero` rejection names mathematics, not policy | **TRUE**: *"multiplying both sides by 0 leaves 0 on both sides, and 0 compared with 0 says nothing about x at all — there would be no solution set left to draw."* |
| Membership is a second, independent derivation | **TRUE.** `raySatisfies` substitutes into `a·x REL c` (`ratCmp(ratMul(coeff,v), constant)`) rather than comparing against the boundary, so the ray and the claim "−5 is not a solution" are two derivations a test can hold against each other. The rendered sentence quotes real numbers: *"−1 × −5 = 5, and 5 < 5 is false, so −5 is not a solution."* |
| The grader never leaks the target | **TRUE, driven on all three wrong branches.** Each names the learner's OWN solved form and which of the three facts is wrong: *"Your line shows x ≤ 3, so its endpoint sits at 3. The endpoint is the part that is not right yet."* The target appears only in `correctAnswerText` and the `tone === "info"` ghost — verified by rendering all five tones. |
| Schema is an independent second opinion | **TRUE and thorough.** Eight guards, driven: zero coefficient (start and target), inverted window, boundary off the drawn line, boundary off the lattice, target off the lattice, transform factor 0. All fire with mathematical reasons. |

### 1.2 The pedagogy — judged, not taken on trust

**Is the non-auto-flip choice right for a learner meeting reversal for the first time? Yes, and it
is the best single decision in this session.** The alternative — flip the symbol for them — teaches
the rule as a rite the software performs. Here the learner presses `× (−1) both sides`, and the
solution set *visibly jumps to the other side of the line*. Nothing scolds them. To get their set
back they must press the symbol, and watch it come back. The rule stops being a rule to remember and
becomes the thing that keeps the set.

**Does it let the misconception pass silently? No — I checked this specifically, because "silently"
is the whole risk.** Three things fire on that move: the ray moves (the picture); the solved line and
interval change (`x > 3 (3, ∞)` → `x < 3 (−∞, 3)`); and `describeRayChange` **computes** the sentence
*"Multiply both sides by 2: x and 3 become −2x and −6. The solution set moved from x > 3 to x < 3."*
from `deriveSolution` on both states — it is never asserted, so it can only ever be said when true.
That sentence goes to a `role="status"` live region. A learner who does not notice the picture is
told in words.

**Is the engine's central causal action the mathematical object? Yes.** The endpoint is a 44×44
native `<button>` positioned over the axis and dragged in the variable's own units; the ray is
pressed on the arrow; the dot is pressed on the dot; the symbol is pressed on the symbol. The slider
and steppers are secondary, and the module says so. Drag, arrow-key, slider and typing the
right-hand side all converge on ONE `absorbRayEdit` under one lattice/clamp policy — typing the RHS
is `boundary = c/a` through the same `placeBoundary`, which is why the two alphabets cannot reach
states each other cannot.

**Where the design does cost something:** the SOLVED line (`x > −5`) is rendered at all times beside
the written form (`−x < 5`). The widget therefore always performs the solving step. That is coherent
— the graded act here is *producing a set*, not *writing a solved form* — but it means this engine
can never certify "solve this inequality symbolically", and an author who wants that will find the
answer already on screen. Worth recording as a scope fact, not a defect.

**The disclosed touch-target limit is accurately stated and I re-derived it.** Ticks are
`(320 − 2·30)/12 = 21.67` viewBox units apart; at a 320px viewport the stage is 288 CSS px
(`LessonPlayer`'s `px-4`), so ticks are **19.5 CSS px** apart and a 44px handle spans **2.26 units**.
Snap-to-lattice plus the ± steppers plus the range input make that recoverable. The disclosure is
honest — but it is incomplete, see A-2.

### 1.3 Defects

**A-1 (blocking, undisclosed red). `src/lib/allSamples.operability.s119.test.tsx` FAILS on this
engine, and the session did not declare it.**

```
FAIL  ADVERSARIAL — touch targets meet the 44px minimum contract
      sample #181 (numberLineRay) sizes its buttons
      bare-text button with no min-height — "rounded-full border-2 border-transparent focus-visible:border-sky"
```

The endpoint and direction handles carry their size **inline** (`style={{width:44, height:44}}`),
and the repo's 44px contract is a *class* scanner. So the engine is genuinely 44×44 and the repo's
own gate says it is unsized. Two honest readings; the cheap one is right: add `min-h-11 min-w-11` to
those two buttons and the contract sees what is already true. Either way, **the session shipped four
failing assertions in three files and declared three in two.** Under this programme's own standard
(the implementor does not certify; gates at seal) an undeclared red is the finding, not the class
scanner.

**A-2 (blocking). Two 44px handles collide at the window edge, and at the extreme they are exactly
coincident.** `arrowX = endpoint ± 58` viewBox units, clamped to `[PAD, VW−PAD]`. Measured in CSS px
at a 320px viewport, across the sample's own window:

```
x > 4   endpoint@222.0  arrow@261.0   centres 39.0px apart   overlap
x > 5   endpoint@241.5  arrow@261.0   centres 19.5px apart   overlap
x > 6   endpoint@261.0  arrow@261.0   centres  0.0px apart   EXACTLY COINCIDENT
x < −6  endpoint@ 27.0  arrow@ 27.0   centres  0.0px apart   EXACTLY COINCIDENT
```

6 of 26 probed states overlap; 2 are exactly coincident. The direction button is rendered last and
wins the pointer, so **the endpoint handle becomes pointer-unreachable at the end of the line** — and
with `outOfRange: "clamp"` (the shipped default) an over-drag lands there by design. Keyboard and the
range slider still reach it. S214 accepted the analogous `systemsExplore` case *because it was
documented*; this one is not. One line fixes it: pull the arrow back toward the endpoint, or place it
on the near side when the far side is clamped.

**A-3 (minor). Three simultaneous `aria-live="polite"` regions.** `nlr-solution`, `nlr-membership`
and `nlr-status` can all change on one edit. S213 was careful to keep stepper nudges silent; S214
docked `systemsExplore` for *one* chatty live region. This is three, on a widget whose primary
interaction is a drag.

**A-4 (minor). `raySatisfies` is exported and can throw.** It is documented as the independent
membership route, but `ratMul(coeff, value)` overflows for a large coefficient and an off-lattice
probe — I hit `RationalOverflowError` from a sweep. Not reachable in-widget (`rayDerivable` guards
against the tick lattice, and the widget only probes lattice values), but a public total-looking
function that throws is a trap for the next adopter.

**A-5 (minor). Coefficients grow without a pedagogical bound.** The sample offers `× 2`; nothing
stops it until `rational-overflow` at roughly 2⁵⁰. The reachable set contains
`−1125899906842624x < −1125899906842624` — a 38-character symbolic strip. Mathematically harmless
(the boundary is invariant), visually not.

**A-6 (scope, for the record). Zero authored content uses this engine.** `content/` is byte-identical
to the seal; the only instance is the sample in `widgetSamples.ts`. The mastery gain to a learner
today is exactly zero. That is the right build order (S214's own lesson: build the engine to the
standard BEFORE authoring on it) and I do not hold it against the work — but it caps MASTERY_GAIN.

---

## 2. (B) Line labels on `systemsExplore`, and `se-01-03` re-scored

### 2.1 Claims, driven by rendering

| Claim | Result |
|---|---|
| Each line carries its own live equation derived from the model, not formatted in JSX | **TRUE.** The label text is `line N: ${pairViews.<slot>.equation.display}` — the same derivation every other consumer reads. The new test transcribes the reading rule independently and compares, so a label that stopped tracking fails. |
| Anchored to the rightmost in-frame point | **TRUE.** `labelAnchor` walks `xMax → xMin` in half-steps until `inWindowY`. Driven: `y = 3x` (which leaves the top at x = 2.67) keeps its label at viewBox y = 25, inside the frame. |
| Labels stay separate and identical in the coincident case | **TRUE.** With both lines at `y = x + 1`, both render, pushed apart (y = 39 and y = 64), both reading `line N: y = x + 1`. **I agree with the design.** Two labels that are the same equation *is* the coincident case; collapsing them would be the surface hiding the mathematics. |
| Classic specs deliberately unlabelled | **TRUE**: `if (!editable) return []`, and the o2 suite now pins `se-eq-a`/`se-eq-b` absent for the fixture **and** for every authored classic spec. |
| No hit-area cost | **TRUE.** `pointerEvents: "none"` on both labels. |

The SVG's `aria-label` also gained both equations: *"Line 1 is y = x + 1; line 2 is y = −x + 5.
Point (0, 0); not on line 1, not on line 2."* That is a real accessibility gain.

### 2.2 Is the REPRESENTATIONS docking closed?

**Plainly: half of it is, and the half that is closed is closed well.**

My predecessor's docking had two clauses. *"The lines are unlabelled"* — **closed.** Each line now
carries its own equation, derived, live, anchored to what the learner can see, named in words so the
two are never told apart by colour, and present in the accessible name. That is the correct fix and
it was built the correct way (one derivation, not a second formatter).

*"The surface speaks rate/start while the lesson thinks in equations"* — **not closed.** Every
control is still `line 1 rate` / `line 1 start`, in both the visible label and the `aria-label`. I
note that the co-presence is arguably better than a rename — a learner now sees `rate 1, start 1`
beside `y = x + 1` and can read the correspondence off the screen — but that is an argument for a
different fix, not evidence the named one happened.

And the label work surfaced two defects, one of them serious.

### 2.3 Defects

**B-1 (blocking). The screen-reader panel narrates the AUTHORED lines, not the current ones — and
now openly contradicts the labels beside it.** `describeState.ts`'s `systemsExplore` branch builds
its equations from `spec.m1/b1/m2/b2` and never reads the persisted `lines`. Rendered, after the
learner tilts both lines to `m1=3,b1=0` / `m2=−2,b2=6`:

```
on-screen labels : ["line 1: y = 3x", "line 2: y = −2x + 6"]
svg aria-label   : Line 1 is y = 3x; line 2 is y = −2x + 6. Point (0, 0); on line 1, not on line 2.
"What's on screen right now":
                   Two lines are drawn: y = 1x + 1 and y = -1x + 5. Your point is at (0, 0),
                   which is on neither line; at x = 0 the lines sit at y = 1 and y = 5.
```

Three separate falsehoods in one sentence: the equations, the derived y-values (really 0 and 6), and
the on/off-line verdict — the point **is** on line 1. Two surfaces of the same widget in the same
render disagree, and the older one is wrong. It also writes `1x` and an ASCII `-1x` where the house
form is `x` and `−x`.

This is not S215's defect — the branch is unchanged since before the S213 seal, and the draggable
lines that made it wrong landed in S214. Both my predecessors missed it. But S215 is the session that
(a) touched `describeState.ts`, (b) built the `equation.display` derivation that makes the fix two
lines, and (c) put the correct equations on screen right beside the wrong ones. It should not seal
this way. `describeState.test.tsx` has a `systemsExplore` case that passes — it uses a spec-only
value with no `lines`, so it pins the authored state and never the reachable one. Trap F, exactly.

**B-2. Labels are clipped out of frame in 21.7% of reachable states — including the coincident case
the design singles out.** The x anchor is clamped (`Math.min(W − pad, Math.max(pad + 96, sx(...)))`);
the y is not clamped at all. I swept all 2,401 reachable `(m1,b1,m2,b2)` combinations in the authored
ranges and counted labels whose baseline falls outside the 0–300 viewBox:

```
states swept: 2401
states with a label outside the frame: 520 (21.7%)
  of which coincident: 32 of the 49 coincident states
example: m1=0 b1=0 m2=0 b2=0  →  "line 2: y = 0" at y = 302   [COINCIDENT]
```

So in two thirds of the coincident states, the second label — the one the design deliberately keeps
in order to show that two equations are the same equation — falls off the bottom of the picture. The
`crowded` branch adds `+16` without asking whether there is room. Same one-line clamp as x.

---

## 3. (C) The x²-tile control, and the `deriveArea` cell budget

### 3.1 The control

`setSquareCoefficient` is genuinely the same edit as the other two, and the suite proves each
equality rather than asserting it: it decomposes into single-tile moves whose fold equals the whole
edit; it empties one pile before filling the other (never invents a zero pair); it refuses fractions
and out-of-range values with the same codes; it is refused while the rectangle stands
(`frame-standing`); it announces `x²` in the algebra rather than a bare number. Two announcement
defects the x² pile had been carrying unreachably are fixed (an x² tile announced the x² count, not
the constant; an x² zero pair reads as x², not units). `(x + 3)(x + 2)` is now reachable **by
production** — the named gate on any factoring lesson is genuinely lifted.

### 3.2 The sweep — VERIFY THAT IT BITES. It does not.

The sweep is real and the arithmetic is exactly as claimed: 2 specs × 5 square × 13 x × 17 unit =
**2,210 states**, asserting `deriveArea().complete === evaluate().correct`. I ran it; it is green.

**But it does not catch the defect it was written for.** I restored the S214 seal's
`algebraTilesModel.ts` and ran the identical 2,210-state grid against BOTH models:

```
SWEEP AS WRITTEN (binomialSpec + authoredShapeSpec)
  NEW model: 2210 states, 0 mismatches
  OLD model: 2210 states, 0 mismatches        ← the pre-fix code passes it identically
```

Both specs in the sweep are same-sign rectangles, and for those the old signed-net budget and the new
per-pile budget agree at every reachable state. The sweep is a *regression guard*, which is worth
having — it is not a proof of the fix, and presenting it as "the defect is pinned by a 2,210-state
sweep" overstates it.

**The fix is real; here is the state that actually demonstrates it** — `(x − 2)(x + 3)`, mat holding
the rectangle's genuine parts (1 x², 3 positive and 2 negative x-tiles, 6 negative units):

```
mat {sq +1, x +3/−2, u −6}   grader: CORRECT
   OLD: complete=false   8 of 12 cells filled     ← a learner who built the rectangle was told it wasn't
   NEW: complete=true   12 of 12 cells filled
```

That single assertion — `expect(q.announced).toBe(true)` inside the "DIVERGE" test — is the whole
bite. It is one line, and it is the only line in the session that would have gone red before the fix.

### 3.3 The disclosed divergence — which is right, and is it safe?

I reproduced the divergence end to end by rendering the widget. With a mixed-sign area spec and a mat
holding one positive x-tile:

```
GRADER   : {"correct":true,"feedback":"That is x² + x − 6 — every part produced."}
ON SCREEN: "8 of 12 parts of the rectangle are covered. The empty ones are still waiting for tiles."
```

**Which is right: the picture.** The grader compares nets, so one x-tile "is" `x`. But the object of
study in area mode is the *partial products*; collapsing five strips to a net of one is precisely the
step the learner is meant to perform, not to be credited for skipping. A grader that rewards the
collapse is teaching the opposite of the representation beside it. Pinning the divergence rather than
papering over it was right, and I say so.

**But neither of the two closures the implementor named is the right one.** Restricting authoring
throws away `(x + a)(x − b)`, which is the interesting case. Moving the grader from nets to
populations would break the 26 classic specs, where many mats legitimately denote the same expression
(zero pairs are a *feature* there). The third option — the one not named — is right: **keep nets for
classic and add a population check gated on `spec.area`.** The area grader then measures what the
area picture measures, and nothing else moves.

**Is it safe to leave while no content uses it? Only just, and only because of an accident.** I
enumerated `content/` mechanically: exactly **one** authored `algebraTiles` area spec exists
(`tse-01-01`, `width:[0,−3] height:[1,2]`), and it is all-negative, so its kinds do not mix signs.
But **nothing prevents the next author from shipping the divergence.** `widgetIntegrityErrors` has no
`algebraTiles` case at all — the constraint lives in a comment inside a test file. Contrast the same
session's brand-new `numberLineRay`, which ships **eight** integrity guards including "the target
boundary is not on the step lattice, so no drag could reach it". The engine that just discovered a
divergence got no guard; the engine with no users got eight.

The guard is three lines and needs no new arithmetic: for `width [w₁,w₀]`, `height [h₁,h₀]`, only the
x-kind can mix, and it mixes exactly when `sign(w₁h₀) ≠ sign(w₀h₁)` and both are non-zero.

**C-1 (also standing). The SVG's accessible name is still `"Tile board showing 1x and a constant of
-6."`** — S214's A-3, unfixed, and now worse: there is a third pile and a twelve-cell rectangle that
the accessible name never mentions.

---

## 4. (D) `RotationLabW` — the shipped `{tone}` defect

**The defect was exactly as described and is gone.** `{tone ? <p className="text-sm">{tone}</p> :
null}` is removed, and its exact literal is pinned out of the source by a test. I rendered both modes
× five tones × two angles and read every text node and every accessible name: **no raw StageTone
token reaches the learner anywhere.**

**Nothing leaks, and I checked the specific leak vectors:**

- The retry cue is `[0,1,2,3,4].map(i => rotationLabImage(tracked, centre, angle + cueDir*i*5))` — a
  fixed 20° trail regardless of how far off the learner is. **It cannot encode distance.** Verified
  from the arithmetic, not the comment.
- The trail is plotted through real `rotationLabImage` calls, so it curves along the actual orbit
  rather than approximating one — the cue cannot point somewhere the mathematics does not.
- The reveal ghost is gated on `tone === "info" && offTarget` and states a computed image: for
  `(3,5)` at 90° it names `(−5, 3)`, which is correct. It appears only at reveal, where the player's
  banner already speaks the answer to everyone, and both cue and ghost are `aria-hidden` — so the
  ghost is not a second, unsynchronised voice, and `describeState` still withholds `targetAngle`
  while the hunt is live. That parity argument is coherent and I accept it.
- The slider tint and label colour change at `tone === "error"` only. No verdict text.

**D-1 (minor). The cue does reveal which side the target is on** (`cueDir = targetAngle > angle`), so
a learner can bisect on the arrow alone without rotational reasoning. It duplicates rather than
extends the authored `lowFeedback`/`highFeedback`, which already say the same thing in words — so the
new channel adds a strategy without adding information. Defensible; worth naming.

**D-2 (minor). In `symmetryOrder` the trail emanates from `pts[0]`**, one vertex of a polygon, while
the picture in that mode is two polygons. Coherent (the vertex does orbit) but not obviously legible.

**The test that accompanies this fix is the best-written artefact in the session** and I want that on
the record: it names the vacuity mechanism in its own header, walks text nodes rather than the blob,
also sweeps four attributes, covers two modes × five tones × two angles, forbids tone tokens in its
own fixture copy so the sweep cannot pass on its prompt, and pins the old markup out of the source
against a merge.

---

## 5. THE VACUOUS-ASSERTION SWEEP

**The mechanism, confirmed.** `container.textContent` concatenates a DOM tree with no separator, so
`<p>error</p><h3>What's on screen…</h3>` becomes `…errorWhat's on screen…`. `\b` needs a word/
non-word transition; `r` → `W` is not one. `/\b(neutral|error|info)\b/i` therefore cannot fire, and
passed with the defect fully present.

**I scanned all 315 test files mechanically** (extracting every `.not.toMatch()`, resolving named
regex constants, and classifying by subject and by whether the pattern contains a boundary or an
anchor):

```
test files scanned                                        315
total .not.toMatch assertions                              97
…whose subject is a CONCATENATED DOM BLOB                   7
…VACUOUS by the boundary/anchor mechanism                   0
\b-anchored negatives against ANY subject                  67
```

**Result: ZERO other suites are vacuous the same way.** The 67 `\b`-anchored negatives break down as:
65 in `variants.test.ts` (one `^`-anchored `NEGATION` constant, applied to plain feedback *strings*,
not DOM — sound, and I checked it behaves correctly on "Nothing is…"); 2 in
`evaluate.algebraTilesArea.s212` (plain JSON strings — sound); the fixed `rotationLab` pair (node-
level — sound); the new `numberLineRay` triple (element-level — sound); and
`ratioStrategy.s47:167` (`cue.textContent` on a single testid element with a single text run —
sound). The 7 blob-subject negatives all use weld-insensitive multi-word or single-token patterns.

**A SECOND-ORDER CLASS worth naming (4 instances, unproven not vacuous).** Blob negatives whose
pattern is a multi-token phrase (`/2 x-tiles and 0 unit tiles/`, `/3 x-tiles and 6 unit tiles/`,
`/Took 1 unit tile off the left pan/`, `/x = 5|x is 5|the answer/i`) are *fragile* rather than
vacuous: they fail to fire if the rendering ever splits the phrase across nodes. One of the four
(`o1.s210:225`) is immunised by a paired positive `toContain` on the ghost proving the phrase renders
contiguously. The other three are unpaired. Cheap fix: pair each with its positive.

### 5.1 The finding this sweep actually turned up — a structurally identical vacuous contract

The `\b` bug is the *symptom*. The same session's own subject, `rotationLab`, sat at `err: 3` for many
sessions with placeholder markup, and the contract that is supposed to police `err = 3` could not see
it — for the same reason, one level up. `engineCapabilities.test.ts`:

```js
const ghostCount = (src.match(/(?:data-testid|testid)="[a-z]+-ghost"/g) ?? []).length;
const rated3 = Object.values(table.types).filter((r) => r.err === 3).length;
expect(ghostCount).toBeGreaterThanOrEqual(rated3);
```

That is an **aggregate count**. It never checks that any *particular* `err = 3` engine has a ghost.
Measured:

```
ghost testid sites in widgets.tsx                                     128
engines rated err = 3                                                 116
err=3 engines with NO ghost testid in their OWN component              12
   trialProbabilityLab, distributionCompareLab, triangleAngleLab, verticalLineScanner,
   covariationScrubber, samplingBiasLab, shapeFamilyBuilder, unitRuler, graphStoryLab,
   triangleConstraintLab, coordinateProofLab, solidSliceLab
the pinned assertion: 128 >= 116  ->  true
```

Nine of those twelve are exactly the nine `CAPABILITY_AXES.md` flagged as "contested" — the rubric
found them by *reading*, because the test cannot. Three (`trialProbabilityLab`,
`distributionCompareLab`, `graphStoryLab`) are new here. Before this session `rotationLab` was a
thirteenth. **This is the most valuable thing in the sweep: the `\b` instance is fixed and unique,
but the same shape of blindness is load-bearing on the capability table right now.** Making the
assertion per-engine is a five-line change.

### 5.2 A third blindness, created this session

`numberLineRay` is the first widget to live outside `widgets.tsx`. Both consistency contracts —
`adapt=3` and the `err=3` ghost count — read `widgets.tsx` and only `widgets.tsx`. So
`NumberLineRayW` is invisible to both, even though it wires `onEvent` and carries an `nlr-ghost`
testid. **The session repaired one blind regex and structurally introduced another in the same
commit.** Both tests must learn to scan `src/components/widgets/` before a second engine moves out.

---

## 6. RATING_ADJUDICATION

### 6.0 Judging the rubric itself

**`docs/CAPABILITY_AXES.md` is descriptive, not self-serving.** I verified every checkable factual
claim in it against `scripts/engine-capabilities.json` and the source, and every one is exactly right:

```
manip 6/11/76/33 · conseq 2/5/51/68 · err 0/10/0/116 · adapt 63/0/5/58
a11y 0/0/7/119 · mobile 0/3/83/40 · polish 0/0/55/71          — all seven exact
grades A 65 · B 44 · C 12 · D 5                                — exact
adapt=2 members: barBuilder, graphRead, exactNumberLab, pointSetReasoningLab, hundredthsGrid — exact
a11y=2 members: mcq, numeric, fractionEntry, pointEntry, steppedReveal, radicalCheck, subitizeFlash — exact
mobile=1 members: systemsExplore, matrixTransform, compassConstruct — exact
err=2 and adapt=1 unused (0 of 126 each)                       — exact
exactNumberLab's packed `}:WProps<...>` signature              — exact
```

**Its refusal clauses are load-bearing, and I can price them.** The `err` level-1 clause — *"a ghost
chip is necessary but not sufficient"* — is what holds `mcq`, `numeric`, `fractionEntry`,
`pointEntry`, `radicalCheck`, `rationalCompare`, `buildExpression`, `toggleExplore`, `subitizeFlash`
at 1 *after* each gained a reveal ghost in S206–S207. That is ten refused lifts on one axis. The
`manip` level-1 clause refuses "a better placement gesture" and is machine-pinned by name. The
`conseq` level-2 clause refuses "a representation that singly renders the input" as an unfinished 3.
The `a11y` clause refuses "perfect button semantics alone". A self-serving document does not write
four clauses whose only effect is to hold scores down, and it does not open a section by naming a
defect in a shipped engine that its own session then had to go fix.

It also declines to adjudicate three axes for want of a reliable proxy, marks its own weakest
inference (`manip` 2-vs-3) as "not reproduced precedent", and reports two failed mechanical
experiments rather than the one that would have worked. Those are the marks of a description.

**One omission to dock.** The `mobile` section reproduces S214's measurement caveat but never applies
its own definition to `systemsExplore` — the one row in the table for which a real-browser
measurement exists (34.6 → 46.1 CSS px) and the one lift that was DECLINED for want of this very
document. Under the level-3 text now written ("*…and/or the design offers a discrete tap/stepper
alternative alongside fine dragging*"), `systemsExplore`'s grips-plus-retained-steppers reads as
**3**, not the 1 it still carries. Not one of my three assigned questions, so I flag it rather than
adjudicate it — but it is the cheapest correction available and the document was written to enable it.

**Is the `adapt=2` vacuity finding sound? YES — and I verified it independently.** The level has five
members. Four (`barBuilder`, `graphRead`, `pointSetReasoningLab`, `hundredthsGrid`) contain **zero**
occurrences of `onEvent` in their component bodies — structurally identical to all 63 engines at
`adapt=0`. The fifth (`exactNumberLab`) destructures `onEvent` and invokes it — structurally
identical to all 58 at `adapt=3`. There is no residual property. I add one datum the document does
not have: **no consumer in the codebase can even express a 2.** The axis's only mechanical contract
is binary (`expect(rated).toBe(wired)`), and `flagship-tier.mjs` combines `adapt` with authored
remedials. A level nothing can produce and nothing can consume is not a level.

**And I priced the correction, which the document does not.** Retiring level 2 honestly (four engines
→ 0, one → 3) costs two A grades:

```
base (126)                          A 65 · B 44 · C 12 · D 5
+ numberLineRay                     A 66 · B 44 · C 12 · D 5
+ exactNumberLab adapt 3            A 66 · B 44 · C 12 · D 5   (no change — see below)
+ adapt=2 retired                   A 64 · B 46 · C 12 · D 5   (barBuilder A→B, graphRead A→B)
```

Recommendation: **retire `adapt` level 2 and resolve its five members to 0 or 3 on the mechanical
rule**, accepting the two-grade cost. A capability table that keeps a level because dissolving it is
expensive is the failure mode this whole document exists to prevent.

---

### 6.1 `numberLineRay` — the full seven-axis row

**RECOMMENDED ROW (Σ 19 → grade A):**

```json
"numberLineRay": { "manip": 2, "conseq": 3, "err": 3, "adapt": 3, "a11y": 3, "mobile": 2, "polish": 3 }
```

**`manip` = 2** *(not 3, and this is the hard one)*. Level 3 asks for an object "handled directly in
its own coordinate space rather than through a proxy control… a model built from several jointly-
adjustable named attributes", and on the bare text this engine qualifies: the endpoint is dragged on
the number line where it lives, and the state carries four named attributes. **I refuse it on
consistency.** `systemsExplore` sits at `manip 2` with *two* lines, each grabbable in its own
coordinate space since S214, and four jointly-adjustable parameters; `lineExplore` sits at 2;
`algebraTiles` at 2. Scoring a one-relation engine 3 while its strictly richer sibling sits at 2 would
make the axis stop meaning anything — which is precisely the argument S205M used to pin
`buildExpression`. The rubric itself calls 2-vs-3 "this document's own inference, not reproduced
precedent"; a new engine is the wrong place to spend an untested boundary. **What would earn 3:** more
than one relation on the line at once (a compound-inequality mode), so the manipulated object is
genuinely compound rather than a single half-line.

**`conseq` = 3.** Level 3: *"several dependent parts change together… or the same live model drives
both the interaction and the grading."* Both clauses hold, and the second holds literally — `evaluate`
imports `deriveSolution` and `makeRayCanonical` from the engine's own module, so the grader's sentence
and the picture's sentence are one computation. One edit moves the symbolic strip, the solved line,
the interval, the ray, the dot, the endpoint words, the membership substitution and the status
sentence. This is the level-3 case as written.

**`err` = 3.** Level 3: *"feedback is specific to what the learner actually got wrong… ideally across
several distinguishable misconception paths."* Driven: three distinguishable paths (endpoint,
direction, inclusion) each with distinct computed copy quoting the learner's own solved form and never
the target, plus a reveal ghost (`nlr-ghost`), plus a substitution probe the learner can use to
diagnose themselves. That is more than the nine contested `err=3` engines have. **Condition:** the
ghost contract cannot see it (§5.2), so this 3 ships unpoliced until the test scans `widgets/`.

**`adapt` = 3.** The axis is defined mechanically — *"`adapt=3` is exactly 'the function body invokes
`onEvent`'"* — and `NumberLineRayW` invokes it. 3 is the only answer the definition permits. **Two
conditions.** First, the CONSISTENCY test must scan `src/components/widgets/`, or this becomes the
second unpoliced `adapt=3` in a table that just spent a session finding the first. Second, record that
the evidence stream is partial: `onEvent` fires only for boundary moves and only when a target exists
— direction flips, inclusive toggles and both-sides transforms report nothing, so the adaptive layer
cannot see the engine's own signature misconception. That is exactly the drift the table should
resist, and the mechanical rule cannot express it.

**`a11y` = 3.** Level 3: *"`role="img"` with a state-dependent `aria-label`, or an `aria-live` region
reporting the model's state as it changes."* It has both, plus a `describeState` branch derived
through the model, plus keyboard parity **on the objects themselves** (Enter/Space on the dot and the
ray, arrow keys on the endpoint), pinned by `widgets.keyboard.test.tsx` and run green. Docking
recorded, not scored: three simultaneous polite regions.

**`mobile` = 2** *(not 3)*. Level 3 wants "every primary interactive control sized ≥44px in both
dimensions **in source**, and/or a discrete tap/stepper alternative". The stepper clause is satisfied
outright. But the axis's stated evidence base is source-level *class* scanning, and by that instrument
this engine reads as unsized — which is not a quibble, because **the repo's own 44px contract test
fails on it** (F1). Level 2's text — "*standard controls present and usually intended at ≥44px… and/or
one non-decorative control undershoots*" — describes today's engine better than level 3 does. It also
has a measured one-thumb failure at a reachable state: two 44px handles exactly coincident at the
window edge (A-2). **It becomes an evidenced 3** the moment those two buttons carry `min-h-11
min-w-11` and the arrow cannot land on the endpoint. That is a one-session, two-line lift and I would
expect to grant it.

**`polish` = 3.** Level 3: *"a value eases toward its new position… always gated behind
`prefers-reduced-motion: no-preference`."* The engine wires the shared MMIP morph choreography on four
actors (`data-morph-actor` on the ray, the dot, the coefficient and the constant) through
`useMorphStage`, whose reduced-motion query is read at edit time. Level 2's text ("*state changes SNAP
rather than settle*") is factually false of it. Consistent with `systemsExplore` 3 and `lineExplore` 3.
Craft defects (the collision, the bare-`<text>` ghost outside the shared chip treatment, the 16-digit
strip) are scored below in POLISH /10, where they belong; they do not change what the 0–3 axis
measures.

Row grade: **A** (Σ 19; `manip≥2 ∧ conseq≥2 ∧ err≥2 ∧ Σ≥17`). Table becomes 127 rows, A 66.

---

### 6.2 `exactNumberLab` — `adapt` 2 → 3?

**Decision: the SCORE is wrong. The test is right. Move it to 3.**

Citing the rubric's own text: *"`adapt=3` is exactly 'the function body invokes `onEvent`,'
mechanically pinned"* (§adapt), and the honesty table's verdict — *"**the score.** Its component
invokes `onEvent` from the reveal control, the numeric magnitude-rail drag, the typed-numeric field,
and the choice buttons — the same pattern that earns every other engine a 3."* I verified both halves:
`ExactNumberLabW` destructures `onEvent` and its body contains it; and level 2's definition, per §6.0,
corresponds to no technical state at all, so there is nothing for the score to be right *about*.

**The strongest evidence that this is a repair and not a lift dressed as one** is what the fixed regex
does to everyone else. It takes visible components from **126 → 141**; fourteen of the fifteen newly
visible components (`triangleConstraintLab`, `coordinateProofLab`, `solidSliceLab`,
`verticalLineScanner`, `covariationScrubber`, `unitRuler`, `triangleAngleLab`, `samplingBiasLab`,
`shapeFamilyBuilder`, `placeValueTransformLab`, `pointSetReasoningLab`, `geometricConstraintLab`,
`affineRelationshipLab`, `shapeHierarchyLab`) **pass unchanged**. Exactly one row is inconsistent, and
it is the one the rubric predicted. A regex loosened to manufacture a lift would have produced noise;
this produced a single named contradiction.

And the lift buys nothing: `exactNumberLab` has `manip: 1` (with a per-mode map whose floor is
untouched by this), so its grade is **C before and C after**, and the A/B/C/D distribution does not
move. Making a correction that costs and gains nothing is the cleanest circumstance there is.

Leaving the test failing was the right call and should not be repeated a second session running: a red
that is deliberate for one session is discipline; for two it is a broken gate.

---

### 6.3 `rotationLab` — `err` after the (D) fix

**Decision: `err = 3`, RETAINED — but for the first time it is earned rather than asserted. The
rubric author's ≤ 1 was correct on the evidence that existed when they wrote it.**

The question is whether a ghost is enough, and the rubric answers it directly at level 1: *"a ghost
chip is necessary but not sufficient"* — `mcq`, `numeric`, `fractionEntry`, `pointEntry`,
`radicalCheck` all gained one in S206–S207 and stayed at 1. So `rl-ghost` alone would leave
`rotationLab` in that cohort, and the honest score would be 1.

It has more than a ghost, and I checked each piece against level 3's text (*"feedback is specific to
what the learner actually got wrong… In the live-manipulation Lab engines the same job is done
differently — real-time direction cues computed from the model"*):

1. **`rl-cue` is computed from the model** — five real `rotationLabImage` calls, so it curves along
   the actual orbit and cannot point where the mathematics does not. It is direction-specific to the
   learner's current turn, which is a diagnosis of *what they got wrong*, not a mark.
2. **The ghost is genuinely computed**, not a canned string: it names the real image `(−5, 3)`, and in
   `symmetryOrder` it names the order.
3. **`spec.commonTurns` carries per-misconception copy** — this is the point on which I was asked to
   decide, and I decide it does not disqualify. The `err` axis in this table is a claim about the
   *feedback the learner receives for this engine*, and the rubric itself scores nine engines at 3 on
   feedback that is not engine-owned copy at all but the shared `processEvents.ts` cue tables — most
   of them falling through to `GENERIC`. `rotationLab` now has strictly more than those nine: a
   ghost they lack, a model-computed cue, and authored per-misconception copy the player renders.
   Holding it below them would be incoherent with the table as it stands.

Against 3, and recorded: `rotationLab` has `adapt: 0` and is not in `MULTI_CONTROL`, so `rl-cue` is
tone-gated (once, at retry) rather than a per-move stream — it is the weaker form of the live-cue
mechanism, not the strong one. That is enough to make 3 the *ceiling* of what this engine should ever
hold, not a floor to build on.

**The condition attached to this decision is the important part.** `rotationLab` held `err = 3`
through many sessions on placeholder markup because the pinned contract is an aggregate count that
cannot name an engine (§5.1) — and twelve engines are in that position *right now*. Retaining 3 is
only honest if the contract becomes per-engine in the same session. Otherwise I am ratifying a score
whose evidence nothing can check.

---

## 7. Scores

| Dimension | Weight | (A) numberLineRay | (B) line labels | (C) x²-tile + deriveArea | (D) rotationLab tone | Composite |
|---|---|--:|--:|--:|--:|--:|
| MATHEMATICS | 20% | 9 | 9 | 9 | 9 | **9.0** |
| MASTERY_GAIN | 25% | 6 | 8 | 7 | 8 | **7.3** |
| CAUSALITY | 15% | 10 | 9 | 9 | 8 | **9.0** |
| REPRESENTATIONS | 10% | 9 | 7 | 9 | 8 | **8.3** |
| MISCONCEPTION_TEACHING | 10% | 8 | 7 | 8 | 7 | **7.5** |
| INTERACTION | 10% | 8 | 9 | 7 | 7 | **7.8** |
| ACCESSIBILITY | 5% | 7 | 6 | 5 | 8 | **6.5** |
| POLISH | 5% | 7 | 6 | 5 | 9 | **6.8** |
| **weighted** | | **8.0** | **8.1** | **7.8** | **8.1** | **8.0** |

### `se-01-03` re-scored end to end, against 8.4

| Dimension | S214 | Now | Why |
|---|--:|--:|---|
| MATHEMATICS | 9 | **8** | The labels are exactly right. But the SR panel emits arithmetic that is false of the state (B-1) — wrong equations, wrong y-values, wrong on-line verdict. A defect S214 missed, not one S215 caused. |
| MASTERY GAIN | 8 | **9** | Two of the three things holding this at 8 are gone: the prompt now invites the grab (fixed pre-seal), and the equation now changes on the line as the learner tilts it — which is the lesson's own claim made visible. |
| CAUSALITY | 9 | **9** | Same loop; the consequence is now symbolic as well as geometric. |
| REPRESENTATIONS | 8 | **8** | The named half of the docking is genuinely closed. It does not move because the other half ("rate"/"start") is untouched and a new representational defect appeared in the same act (B-2, 21.7% of states clip a label). Flat by coincidence, not by inaction. |
| MISCONCEPTION | 7 | **7** | Untouched. |
| INTERACTION | 9 | **9** | Labels are `pointer-events: none`; no hit-area cost. |
| ACCESSIBILITY | 8 | **7** | The SVG accessible name gained both equations — a real gain — while the dedicated "What's on screen right now" panel in the same render contradicts it after any line move. |
| POLISH | 8 | **7** | The label's x anchor is clamped and its y is not; 520 of 2,401 reachable states push a label out of frame. |
| **weighted** | **8.4** | **8.3** | With required fixes 3 and 4 it lands at **≈ 8.7**. |

---

## 8. VERDICTS

- **(A) `numberLineRay` — ACCEPT-WITH-FIXES.** This is the best-conceived engine I have seen in this
  repo. The decision to put the coefficient in the state is genuinely the engine: it is what makes
  "multiply both sides" a move with somewhere to land, and it converts inequality reversal from a rule
  to be remembered into a thing the learner watches happen to their own picture. `scaleBothSides` not
  auto-flipping is right, and it does not let the misconception pass silently because the ray moves
  and a computed sentence says so. Grading on the solution set is right and I verified five writings
  of one set all pass. The empty and universal sets are unreachable by a proof I reproduced, not by
  assertion. It is not ACCEPT because the session shipped an **undeclared failing gate** on this very
  engine's touch targets, and because two 44px handles sit exactly on top of each other at a state one
  over-drag reaches.
- **(B) Line labels — ACCEPT-WITH-FIXES.** The equation rides the line, derived rather than
  reformatted, honest in the coincident case, and in the accessible name. Half the docking is closed
  and closed properly. It is held back by the label clipping out of frame in a fifth of reachable
  states — including two thirds of the coincident states the design exists to serve — and by the
  screen-reader panel now openly contradicting the labels beside it.
- **(C) x²-tile control + `deriveArea` — ACCEPT-WITH-FIXES.** The control is genuinely the same edit
  as its two siblings and the suite proves each equality; `(x + a)(x + b)` is reachable by production
  for the first time; the cell-budget fix is real and I reproduced it against the seal. Two things
  hold it: **the 2,210-state sweep does not bite** (the pre-fix model passes it identically — one line
  in a different test is the whole proof), and the divergence is disclosed in a test comment while
  `widgetIntegrityErrors` has no `algebraTiles` case at all, so nothing stops the next author shipping
  a mat the grader calls correct while the picture says "8 of 12 parts covered".
- **(D) `RotationLabW` — ACCEPT.** The defect is gone, the replacement is house grammar computed from
  the same function the picture and the grader use, the trail is a fixed 20° so it cannot leak
  distance, and the ghost/`describeState` parity argument is coherent. The accompanying test is the
  standard the rest of the repo should be held to.

---

## 9. FAILURES

- **F1 (blocking, undeclared).** `allSamples.operability.s119.test.tsx` FAILS on `numberLineRay`: the
  44px handles are sized inline, invisible to the repo's class-based touch-target contract. Four
  failing assertions in three files shipped; three in two files were declared.
- **F2 (blocking).** `numberLineRay`'s endpoint and direction handles are **exactly coincident** at
  the window edge in the ray's direction (2 of 26 probed states; 6 overlap). The direction button
  wins the pointer, so the endpoint becomes pointer-unreachable at a state `outOfRange: "clamp"` makes
  routine. Undisclosed.
- **F3 (blocking).** `describeState`'s `systemsExplore` branch narrates the **authored** lines. After
  a line move it states wrong equations, wrong y-values and a wrong on/off-line verdict, in the same
  render as the correct new labels and the correct new `aria-label`. Pre-existing (S214), missed
  twice, and now self-contradictory. Its existing test passes because it pins the authored state.
- **F4 (blocking).** The claimed 2,210-state sweep **does not catch the defect it was written for** —
  verified by running the identical grid against the S214 seal's model: 0 mismatches on both. The fix
  is proven by one line in the separate "DIVERGE" test.
- **F5 (blocking).** No `algebraTiles` case exists in `widgetIntegrityErrors`, so a mixed-sign area
  spec can be authored today: rendered, the grader says CORRECT and celebrates "every part produced"
  while the widget says "8 of 12 parts of the rectangle are covered." Exactly the defect class
  S213–S215 keep catching, now reachable by authoring rather than by bug.
- **F6.** The `err=3` contract is an aggregate count; **12 of 116 engines rated `err = 3` have no
  ghost testid in their own component** and the test passes anyway. This is why `rotationLab` shipped
  a placeholder at 3.
- **F7.** Both consistency contracts scan `widgets.tsx` only, so the first engine to leave the
  monolith is invisible to the checks that police `adapt` and `err` — a new blind spot created in the
  same commit that fixed the old one.
- **F8.** `systemsExplore` labels clip out of frame in 520 of 2,401 reachable states (32 of 49
  coincident states). The x anchor is clamped; the y is not.
- **F9.** `algebraTiles`' SVG accessible name is still *"Tile board showing 1x and a constant of -6"* —
  S214's A-3 unfixed, and now missing a third pile and a twelve-cell rectangle.
- **F10.** `numberLineRay` writes three `aria-live="polite"` regions per edit.
- **F11.** `raySatisfies` is exported, documented as the independent membership route, and can throw
  `RationalOverflowError` on an off-lattice probe of a derivable state.
- **F12.** Repeated `× 2` reaches a coefficient of 2⁵⁰ before the overflow rejection, producing a
  38-character symbolic strip.
- **F13 (minor).** `rotationLab`'s retry cue reveals which side the target is on, duplicating the
  authored low/high copy and enabling bisection without rotational reasoning.
- **F14 (test quality).** Three blob-subject negative assertions use multi-token phrases with no
  paired positive proving the phrase renders contiguously — fragile, not proven vacuous.

## 10. REQUIRED_FIXES (pre-seal only)

1. **F1 — make the 44px contract see the handles.** Add `min-h-11 min-w-11` to `nlr-endpoint` and
   `nlr-direction` (the inline 44×44 stays). Re-run `allSamples.operability.s119`. **No red may be
   undeclared at seal.**
2. **F2 — stop the two handles landing on each other.** Clamp the arrow to at least 44 CSS px from
   the endpoint, or place it on the near side when the far side is clamped. Pin boundary = window max
   with direction "greater", and the mirror case.
3. **F3 — make `describeState`'s `systemsExplore` read the current lines.** The derivation already
   exists (`pairViews.<slot>.equation.display`); use it for the equations *and* for the y-values and
   the on/off-line verdict. Add a test that renders a **moved** state and asserts the panel agrees
   with the labels — the house rule from the S214 handover, applied to the exact defect it was written
   for.
4. **F8 — clamp the label's y as the x is already clamped**, and add the coincident-at-the-edge case
   to the new label suite.
5. **F5 — add the `algebraTiles` case to `widgetIntegrityErrors`**, refusing an `area` spec whose
   x-cells would carry both signs (`sign(w₁h₀) ≠ sign(w₀h₁)`, both non-zero). Three lines. Until the
   grader learns populations, the constraint must be mechanical, not a comment in a test.
6. **F4 — restate the sweep honestly** in its own header: it is a regression guard that both models
   pass, and the fix is proven by the parts-present assertion. Optionally extend the grid to
   `mixedSpec` with the divergence asserted, so the two claims live in one place.
7. **F7 — point both consistency contracts at `src/components/widgets/` as well as `widgets.tsx`**
   before a second engine moves out. Without this, `numberLineRay`'s recommended `adapt: 3` and
   `err: 3` ship unpoliced.
8. **F6 — make the `err=3` assertion per-engine**, not an aggregate count. It will go red for 12
   engines; that is the finding, and it should be recorded rather than suppressed.

Not required before seal, log them: F9, F10, F11, F12, F13, F14, the always-visible solved line as a
scope fact for `numberLineRay` authors, and the `symmetryOrder` cue anchored at one vertex.

## 11. NEXT_RECOMMENDED_USE

1. **Land fixes 1–8 and re-run the four suites above.** Nothing may seal with an undeclared red, and
   nothing may seal with a screen-reader panel contradicting the picture beside it.
2. **Author the first `numberLineRay` lesson, and author the reversal one.** The engine's whole
   argument is that `× (−1)` moves the ray; a lesson that never presses it wastes the build. The
   named targets from the programme's gap list are the right home. Do this before a second engine.
3. **Close the algebraTiles grader/picture divergence at the grader, gated on `spec.area`** — keep
   nets for the 26 classic specs, add a population check for area mode. Then delete the authoring
   guard from fix 5 and let `(x + a)(x − b)` be authored, which is the interesting case.
4. **Apply the capability table's own corrections in one deliberate pass**: add `numberLineRay`
   (row above), `exactNumberLab` adapt 2 → 3, retire `adapt` level 2 and resolve its other four
   members to 0 (accepting A 66 → 64), and re-adjudicate `systemsExplore` `mobile` against the text
   now written — the measurement has existed since S214 and the document that was blocking it now
   exists.
5. **Sweep the aggregate contracts.** The `\b`-vs-blob bug and the `err=3` count are the same mistake
   at two scales: an assertion that cannot fail for the thing it names. Every mechanical contract in
   `engineCapabilities.test.ts` should be checked for whether it can identify a violating row, not
   merely a violating total.

---

```
TASK: FABLE-QA independent assessment of S215 — (A) the numberLineRay engine, (B) systemsExplore line
      labels + se-01-03 re-score, (C) the x²-tile control and the deriveArea cell-budget fix,
      (D) the RotationLabW tone defect; plus the repo-wide vacuous-assertion sweep and three rating
      adjudications against docs/CAPABILITY_AXES.md.
MATHEMATICS: 9.0/10
MASTERY_GAIN: 7.3/10
CAUSALITY: 9.0/10
REPRESENTATIONS: 8.3/10
MISCONCEPTION_TEACHING: 7.5/10
INTERACTION: 7.8/10
ACCESSIBILITY: 6.5/10
POLISH: 6.8/10
OVERALL: 8.0/10   (A) 8.0   (B) 8.1   (C) 7.8   (D) 8.1

VERDICT:
  (A) numberLineRay engine (model + widget + 84 tests + additive schema) — ACCEPT-WITH-FIXES
  (B) systemsExplore line labels — ACCEPT-WITH-FIXES   (se-01-03 re-scored 8.4 → 8.3; the
      REPRESENTATIONS docking is HALF closed — the unlabelled-lines clause is genuinely fixed,
      the "rate/start" clause is untouched; ≈8.7 once fixes 3 and 4 land)
  (C) algebraTiles x²-tile control + deriveArea per-pile budget — ACCEPT-WITH-FIXES
  (D) RotationLabW tone content — ACCEPT

FAILURES: F1 an UNDECLARED fourth red — allSamples.operability.s119 fails on numberLineRay because its
44px handles are sized inline, invisible to the class-based contract · F2 the endpoint and direction
handles are EXACTLY coincident at the window edge, making the endpoint pointer-unreachable after one
over-drag · F3 describeState narrates systemsExplore's AUTHORED lines, so after a drag it states wrong
equations, wrong y-values and a wrong on-line verdict beside the correct new labels · F4 the 2,210-state
sweep DOES NOT BITE — the S214 seal's pre-fix model passes it with 0 mismatches · F5 no algebraTiles
case in widgetIntegrityErrors, so a mixed-sign area spec can ship where the grader says CORRECT while
the picture says "8 of 12 parts covered" · F6 the err=3 contract is an aggregate count and 12 of 116
engines rated 3 have no ghost in their own component · F7 both consistency contracts scan widgets.tsx
only, so the first engine outside the monolith is invisible to them · F8 labels clip out of frame in
520/2401 reachable states, 32 of 49 coincident · F9 the algebraTiles accessible name still omits the
rectangle · F10 three aria-live regions per edit · F11 raySatisfies can throw · F12 coefficients reach
2^50 · F13 the rotationLab cue reveals which side the target is on · F14 three fragile blob negatives

REQUIRED_FIXES: (1) add min-h-11 min-w-11 to the two ray handles and clear the undeclared red;
(2) keep the arrow ≥44px from the endpoint; (3) make describeState's systemsExplore read the CURRENT
lines and pin it with a moved-state render; (4) clamp the label's y as its x already is;
(5) add an algebraTiles integrity guard refusing mixed-sign area specs; (6) restate the 2,210 sweep
honestly as a regression guard; (7) point both consistency contracts at src/components/widgets/;
(8) make the err=3 assertion per-engine and record the 12 it reddens.

VACUOUS-ASSERTION SWEEP: 315 test files scanned mechanically; 97 negative `.not.toMatch` assertions;
7 against concatenated DOM blobs; 67 \b-anchored. ZERO other suites are vacuous by the word-boundary
mechanism — the 65 variants.test.ts uses apply ^-anchored patterns to plain feedback strings, the
algebraTilesArea pair to JSON strings, and both S215 suites correctly assert node-by-node and
element-by-element. Secondary class: 4 blob negatives use multi-token phrases that would silently stop
firing if the DOM split them; 1 is immunised by a paired positive, 3 are not. THE REAL FINDING is the
same mistake one level up: engineCapabilities.test.ts backs err=3 with an AGGREGATE count
(ghostCount 128 >= rated3 116), which cannot name an engine — 12 of the 116 engines rated err=3 have
no ghost testid in their own component and it passes anyway. That is why rotationLab carried a
placeholder at err=3 for many sessions. And the same blindness was newly created this session: both
consistency contracts read widgets.tsx only, so numberLineRay — the first engine outside the monolith,
which wires onEvent and carries nlr-ghost — is invisible to the checks that police adapt and err.

RATING_ADJUDICATION:
  RUBRIC — DESCRIPTIVE, NOT SELF-SERVING. I re-derived every checkable claim from
  scripts/engine-capabilities.json and the source: all seven axis distributions, the A65/B44/C12/D5
  grade counts, the adapt=2, a11y=2 and mobile=1 membership lists, the unused err=2 / adapt=1, and the
  packed exactNumberLab signature — every one exact. Its refusal clauses are load-bearing and priceable:
  the err level-1 clause ("a ghost chip is necessary but not sufficient") alone holds ten engines down
  after each gained a ghost. It declines to adjudicate three axes for want of a proxy, marks its own
  weakest inference, and names a defect in a shipped engine that its own session then had to fix. One
  omission: it never applies its own mobile text to systemsExplore, the single row for which a real
  measurement exists and the lift that was declined for want of this document.
  adapt=2 VACUITY — SOUND, independently verified: four of five members contain zero onEvent (identical
  to all 63 at adapt=0), the fifth invokes it (identical to all 58 at adapt=3), and no consumer in the
  codebase can express a 2 (the only contract is binary). I add the price the document omits: retiring
  it honestly costs two A grades (barBuilder and graphRead A→B; A 66 → 64). Retire it anyway.
  1. numberLineRay ROW (Σ 19, grade A):
     { "manip": 2, "conseq": 3, "err": 3, "adapt": 3, "a11y": 3, "mobile": 2, "polish": 3 }
     manip 2 not 3 — level 3's text arguably fits, but systemsExplore holds 2 with TWO lines grabbable
     in their own space and four parameters; scoring a one-relation engine above it would empty the
     axis, and the rubric calls 2-vs-3 its own weakest inference. A compound-inequality mode earns 3.
     conseq 3 — both level-3 clauses hold, the second literally: evaluate imports deriveSolution from
     the engine's own module. err 3 — three distinguishable diagnosed paths quoting the learner's own
     solved form and never the target, plus nlr-ghost, plus a substitution probe. adapt 3 — the axis IS
     "the body invokes onEvent" and it does; conditional on fix 7, and record that the stream is partial
     (boundary moves only). a11y 3 — role="img" with a computed name AND live regions AND keyboard
     parity on the objects themselves. mobile 2 not 3 — the axis's evidence base is class scanning and
     the repo's own 44px contract FAILS on this engine, plus a measured handle collision; it becomes an
     evidenced 3 with fixes 1 and 2. polish 3 — MMIP morph choreography on four actors, reduced-motion
     gated at edit time; level 2's "state changes SNAP" is factually false of it.
  2. exactNumberLab adapt 2 → 3: THE SCORE IS WRONG, THE TEST IS RIGHT. Rubric: "adapt=3 is exactly
     'the function body invokes onEvent,' mechanically pinned"; the honesty table already names this
     row. The repaired regex takes visible components 126 → 141 and FOURTEEN of the fifteen newly
     visible ones pass unchanged — one named contradiction, not manufactured pressure. The lift changes
     no grade (manip 1 ⇒ C before and after), which is the cleanest circumstance for making it.
  3. rotationLab err after the fix: KEEP 3 — now earned rather than asserted; the rubric author's ≤1 was
     correct on the evidence then. A ghost alone would leave it in the err=1 cohort by the rubric's own
     refusal clause. It clears the bar because rl-cue is computed from the same rotationLabImage the
     picture and grader use, the ghost states a genuinely computed image, and spec.commonTurns supplies
     per-misconception copy the player renders — strictly more than the nine engines the rubric holds at
     3 on GENERIC live cues alone, so holding it below them would be incoherent. That commonTurns lives
     one layer up does not disqualify it: the axis is a claim about the feedback the learner receives.
     Recorded against it: adapt=0 and no MULTI_CONTROL membership, so the cue is tone-gated rather than
     per-move — 3 is this engine's ceiling, not a floor. CONDITIONAL on fix 8: retaining 3 is only
     honest if the contract that could not see the placeholder becomes per-engine in the same session.
  BEYOND THE THREE ASKED: systemsExplore mobile 1 is now demonstrably wrong under the text this session
  wrote (grips at 46.1 CSS px plus a full retained stepper alternative reads as 3, not even 2).

NEXT_RECOMMENDED_USE: land fixes 1–8 and re-run the four suites — no undeclared red, and no panel that
contradicts the picture beside it; then AUTHOR the first numberLineRay lesson and make it the reversal
lesson, because an engine whose whole argument is that ×(−1) moves the ray is wasted until a learner
presses it; then close the algebraTiles divergence at the grader gated on spec.area (keeping nets for
the 26 classic specs) so (x + a)(x − b) becomes authorable; then apply the capability table's own
corrections in one deliberate pass — add numberLineRay, exactNumberLab adapt 2→3, retire adapt level 2
accepting A 66 → 64, and re-adjudicate systemsExplore mobile against the text that now exists; and
finally sweep every mechanical contract in engineCapabilities.test.ts for the same defect the \b bug
had at a smaller scale — an assertion that can identify a violating TOTAL but never a violating ROW.
```
