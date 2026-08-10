# SESSION 213 — FABLE-QA independent assessment

Assessor: FABLE-QA, Session 213. I did not build any of this. Every claim below was re-derived from
disk, from the S212 seal (`/home/claude/maggie/maggies-trail-session-212.tar.gz`), or from running
the model. Implementor claims were treated as unverified.

Subjects:

- **(A)** `content/courses/two-step-equations/lessons/tse-01-01.json` step `i1` — `algebraTiles`
  gains `area {width:[0,−3], height:[1,2], mode:"distribute"}` + `partialProductFeedback`; prompt
  rewritten.
- **(B)** `content/courses/systems-equations/lessons/se-01-03.json` step `i1` — an MCQ replaced by
  `systemsExplore` with `editLine1`/`editLine2` + `degenerateSystemFeedback`.

---

## 1. Technical verification (all re-run, not accepted)

| Claim | Result |
|---|---|
| Exactly two authored lesson files differ from the S212 seal; nothing else in `content/**` | **TRUE.** Full-tree `diff -rq` of `content/` returns exactly `se-01-03.json` and `tse-01-01.json`. |
| `tse-01-01.json` `86e8e986…128b` → `c06546c2…e8f9` | **TRUE** (`sha256sum`, both sides). |
| `se-01-03.json` `95c9af67…437bc` → `db552da1…d145` | **TRUE** (`sha256sum`, both sides). |
| `scripts/engine-capabilities.json` unchanged | **TRUE.** `a30625529b…c0eb` both sides; the entire `scripts/` tree is byte-identical to the seal. |
| No existing test weakened | **TRUE for the six files touched**, and several were genuinely strengthened — see §1.1. |
| A hash-proof failure naming these two files is expected right now | Acknowledged, not counted against the work. |

**Correction to the landing description.** (B) is described as "`systemsExplore` *gains* editable
lines". It did not: at the S212 seal, `se-01-03` step `i1` was an **MCQ** ("How many solutions does
the system y = 2x + 1 and y = 3x − 1 have?"). The whole `systemsExplore` widget is new to this
lesson. The editable-line *engine* shipped in S212; this session is its first authored user. Same
for (A): `area` mode shipped in S211; `tse-01-01/i1` is its first authored user. Nothing in
`src/lib/evaluate.ts` changed this session — it is byte-identical to the seal.

### 1.1 Test files — judged individually

Strengthened, not weakened, in all six:

- `src/lib/schema.algebraTilesArea.s211.test.ts` — "none opts in" became a **named allowlist**
  (`AREA_USERS`) plus a new test that hand-checks `(0x−3)(1x+2)` partials against the step's targets.
  A second opt-in still fails the pin.
- `src/lib/evaluate.algebraTilesArea.s212.test.ts` — old-path claim narrowed to the 26 classic specs
  (count pinned), plus five new assertions on the one area lesson.
- `src/lib/schema.systemsExplore.s212.test.ts` — `OPTED_IN` allowlist; new tests that run the gate
  **through `widgetIntegrityErrors`**, which is the real `validate:content` path.
- `src/components/widgets.mmip.o2.s212.test.tsx` — the vacuous "none opts in" pin replaced by a real
  invariant: a classic spec renders with no line controls, no verdict, no status region, no Undo,
  and exactly two range inputs.
- `src/lib/mmip/mmipHarness.test.ts` — a genuine mutation test proving the hoist to
  `acceptTransaction` did not weaken no-op detection.
- `vitest.setup.ts` (**not in the reported list, but changed**) — adds an opt-in `console.error`
  trap over `src/lib/mmip/`, `widgets.mmip.*`, `widgets.aria.*`. A strengthening. It also documents
  and fixes a real pre-existing defect: `widgets.aria.test.tsx` cast raw `SAMPLES` to `TWidget[]`
  instead of parsing through `WidgetSpec`, feeding `undefined` → `NaN` into two widgets' SVG
  geometry. That fix is correct and is a genuine find.

### 1.2 RED GATE — a sixth pin was missed

`src/lib/evaluate.systemsLines.s213.test.ts` is **byte-identical to the seal and now fails.**

```
npx vitest run src/lib/evaluate.systemsLines.s213.test.ts --maxWorkers=1 --reporter=dot
  Tests  2 failed | 11 passed (13)
```

1. `:57` — `expect(SPECS.length).toBe(5)` → received 6, and the loop below it asserts
   `"editLine1" in raw === false` for every authored spec.
2. `:85` — the lattice sweep injects a bogus envelope `lines:{m1:99,b1:99,m2:−99,b2:−99}` and
   asserts the grader ignores it. For `se-01-03` the grader now honours it — **by design**, so this
   is a stale pin rather than a behavioural defect, but it is red on disk.

This is **not** the expected hash-manifest failure. It must be updated (in the same
narrow-don't-relax style used on the other five) before seal.

It also surfaces a real robustness asymmetry worth a line of thought: `systemsPairAdapter.ts`
carefully gates the persisted envelope **per line** with type checks and an explicit fallback, and
its comment says that is "what makes a stale or corrupt envelope harmless" — but `evaluate.ts:484`
destructures `v.lines` raw. For `se-01-03` both lines are editable so widget and grader agree in
every reachable state (verified below); a non-numeric field in a hand-edited or stale value would
diverge. Low severity, worth a note in the handoff.

---

## 2. MATHEMATICS — hand-verified, both steps, independently

### (A) −3(x + 2)

`algebraTilesPartials([0,−3],[1,2])`, computed by hand from `w₁h₁ / (w₁h₀+w₀h₁) / w₀h₀`:

- square = 0·1 = **0**
- x = 0·2 + (−3)·1 = **−3**
- unit = (−3)·2 = **−6**

Authored `targetX = −3`, `targetConst = −6` — **they match**, and both are unchanged from the seal.
`maxTiles = 8` is not exceeded by either pile (3 and 6). Confirmed live against the model.

Every authored string, checked against the numbers:

| String | Fires when | Literally true? |
|---|---|---|
| `successFeedback` "−3x − 6 … three negative x-tiles and three negative 2s" | x=−3, c=−6 | **Yes** (3 neg x-tiles, 6 neg units = three 2s) |
| `xFeedback` "three x-tiles, and the −3 makes every one of them negative" | x ≠ −3 | **Yes** |
| `constFeedback` "…so it is −6, not −2 and not +6" | c ≠ −6 (x correct) | **Yes of the mathematics** — but see the defect below |
| `partialProductFeedback` "…the mat reads −3x + 2" | `width[0]===0 && sq===0 && x===−3 && c===height[1]` i.e. exactly (−3, +2) | **Yes.** The model's `distributePartial` produces exactly `{xNeg:3, uPos:2}` → "−3x + 2". Every clause checks. |

**Defect A-M1 — `constFeedback` is served for "did nothing".** `evaluate.ts:1677`:
`if (framed) return { correct:false, feedback: spec.constFeedback }`. The `distribute` mode **starts
framed** (`algebraTilesInitial`, line 187) with a bare mat, and the sliders are disabled while framed.
So a learner who presses Check first — the most likely first action — is told *"Check the units. Each
of the three copies carries a 2 … so it is −6, not −2 and not +6."* That diagnoses a constant error
they did not make and hands them −6 outright. There is no authored string for "you have not opened
it yet". Newly reachable, because this is the first authored area lesson.

**Defect A-M2 — the surface states a false value.** While the rectangle stands, the widget's largest
readout (`widgets.tsx:5133`, `views.expression.sentence`) reads **"0x + 0"**, directly beneath a box
labelled "(−3)(x + 2)". The mat is worth −3x − 6, not 0. The corrective string
(`views.expression.product` → "a product, not yet a sum") is rendered **only inside the collapsed
"Work with zero pairs" panel**. Verified live.

### (B) y = x + 1 and y = −x + 5

Solved two ways, by hand:

- Substitution: x + 1 = −x + 5 → 2x = 4 → **x = 2**, y = 2 + 1 = **3**.
- Elimination: adding the equations gives 2y = 6 → **y = 3**; then 3 = x + 1 → **x = 2**.

Both give **(2, 3)**. `successFeedback` "(2, 3) — and it checks in both: 2 + 1 = 3 and −2 + 5 = 3" is
**literally true**. (2,3) is inside the window; `xStart/yStart = (0,0)` sits on neither line, so
there is no accidental start-on-line. Both authored (m,b) pairs are inside their authored edit
ranges and on the authored lattice — the gate `systemsExploreEditErrors` checks exactly this and
now actually runs.

Every degenerate state, driven through the real model (`systemsPairModel` → `graph.apply` →
`systemsPairPersist` → `evaluate`):

| Learner action | Model says | Verdict |
|---|---|---|
| baseline, point (2,3) | unique; "the rates 1 and −1 differ … meet exactly once" | **correct** |
| line 2 rate −1 → 1 | parallel; "both climb at 1, so they keep a **constant gap of 4** and never meet" | **incorrect**, `degenerateSystemFeedback` |
| line 2 → rate 1, start 1 | coincident; "the same rate 1 and the same starting value 1 describe one line written twice" | **incorrect**, `degenerateSystemFeedback` |
| line 1 → rate −1, start 5 | coincident (the other way round) | **incorrect** |
| restore the rate | unique again; the `lines` envelope **disappears** from the persisted value | **correct** |
| rate driven to −5 (clamped to −3) | unique at (1,2); readout follows | **incorrect** — "On line 1, but not on line 2" |

**The parallel gap is 4** — b₂ − b₁ = 5 − 1 = 4, correct. **Coincident is reachable both ways**, and
restore genuinely returns the authored problem.

**The safety property holds, and I verified it live.** `evaluate.ts:487` tests `m1 === m2` **before**
the `on1 && on2` branch. In the coincident state, with the point *on the shared line* — the exact
case where a naive grader hands out `successFeedback` for collapsing the system — the verdict is
**incorrect**. A learner cannot be marked right by destroying the question. This is the single most
important thing in insertion (B) and it is correctly implemented.

**✓ marks vs verdict.** `systemsPointOn` (widget) and `evaluate.ts` read the same four numbers in
every reachable state, so `✓ line 1 / ✓ line 2` never disagrees with the grader's `on1`/`on2`. In
the coincident state the widget shows **✓ ✓ and a green dot** while the verdict is *incorrect* —
but the point genuinely **is** on both lines, and the `se-relation` panel simultaneously says "Both
relationships are the same line, so every point on it satisfies both." That is a mixed signal, not a
misteaching: nothing false is asserted, and the authored string names the resolution ("infinitely
many solutions, not none").

**Defect B-M1 — one string for two different states.** `degenerateSystemFeedback` is served for
*both* parallel and coincident. In the coincident state the clause *"Give them the same starting
value as well and they become one line"* instructs the learner to do what they have **already
done**. Against `CLAUDE.md` rule 5 ("feedback must be literally true of the drawn problem"), that
clause is not true of the state it is served in. The schema allows only one such string, so the fix
is to author it state-neutrally (or extend the schema).

**MATHEMATICS: 7/10.** Zero arithmetic errors — every partial product, every intersection, every
gap, every trigger condition checks out by hand and against the running model. Docked for three
strings/readouts that are not true of the state in which they are shown (A-M1, A-M2, B-M1).
**This is below the 10/10 release bar.**

---

## 3. MASTERY GAIN — against the S212 seal, honestly

### (A) — the step was already an `algebraTiles` step, so the question is sharp

**S212:** prompt *"Build −3(x + 2) with tiles: three copies of the group (x + 2), every tile turned
negative. **Set the x-count and the constant to what you end up holding.**"* The learner had to
**produce** −3 and −6.

**S213:** prompt *"The rectangle is −3 along one edge and (x + 2) along the other. Open it, and read
what lands on the mat."* Driven through the model:

```
START : dashed box, text "(−3)(x + 2)";  sliders DISABLED (frame-standing)
1 click "Open the rectangle"
      : tiles 3·(−x), 6·(−1);  readout "-3x − 6";  verdict = CORRECT
```

**One button press, and the engine produces the answer.** The learner states no number, chooses no
count, commits to no partial product. The route that *did* require the derivation — the sliders — is
now **disabled** by the new `frame-standing` refusal, and by the time it re-enables the answer is
already on the mat. The concept card immediately before (`c1`, unchanged) already prints
`-3(x + 2) = -3x + (-3)(2) = -3x − 6`.

So the graded act did not become richer; it became **strictly less demanding**, and the previous
conceptual action was removed. The brief's standard — "interaction that adds cognitive load without
conceptual gain … is a failure" — this is the harder case: it subtracts the manipulation.

The one genuine addition is the misconception fork, and it is real (§5). But it is opt-in, and it is
a **dead end**: after "Multiplier to the x only", `canDistribute` requires `st.framed`, so re-opening
is refused; the only recovery is an **Undo button hidden inside the collapsed panel labelled "Work
with zero pairs"** — a control about a different concept. The escape a learner *will* find is
sliding the unit slider from +2 to −6, which is precisely the "set the sliders to the answer" route
the `frame-standing` refusal was written to forbid. The refusal is skin-deep: it blocks only the
first move.

**(A) MASTERY GAIN: 2/10 — negative for the correct path.**

### (B) — the lesson had zero manipulatives

Ten steps, seven widgets, every one an MCQ or matchPairs. Step `i1` was an MCQ whose stem *told* the
learner the slopes were 2 and 3. Now the learner drags a point to a crossing they must find, then
changes a rate and watches the crossing leave, with the model naming the relation and the gap and
the solution set. The remaining six MCQ/matchPairs items then consolidate what was *done* rather
than only asserted. This is exactly the kind of insertion the program is for.

Diluted by: no `predict` block (§4), line parameters reachable only through steppers/sliders, and
the single degenerate string.

**(B) MASTERY GAIN: 8/10.**

**MASTERY_GAIN (combined): 5/10.**

---

## 4. CAUSALITY

**(A) 4/10.** A model does respond — the transaction narrates *"Every edge reached this corner of the
rectangle: 3 negative x-tiles came out onto the mat."* But the learner's action carries no
mathematical content on the correct path; the consequence *is* the answer, not a consequence of a
choice. Only the misconception branch is a genuine choice with a genuine consequence.

**(B) 9/10.** A real chain, verified end to end: change a rate → the polyline rotates → the crossing
leaves → `se-relation` reclassifies with a reason → the solution-set sentence changes → the verdict
changes → restore and the `lines` envelope **vanishes** from the persisted value and the original
problem returns. Clamping is mathematical too (rate −5 → −3, and the model reports the new unique
solution (1,2)). This is causality, not narration.

The body of (B) says *"Predict first: what happens to that crossing if you make the two rates
equal?"* — but the step has **no `predict` block**. 1,355 of 3,473 authored interactive steps have
one, including this session's own sibling `tse-01-01/i1`. The prediction is asked for and never
captured or contrasted, so the loop is manipulate → observe, not predict → manipulate → observe.

**CAUSALITY: 6/10.**

---

## 5. REPRESENTATIONS

**(A) 2/10 — the central representational claim is not delivered.** "A rectangle whose partial
products are tiles" does not exist on screen. `widgets.tsx:5118-5126` renders a **fixed-size dashed
box** (`width={W−90}`, `height={XH+UW+44}` — dimensions unrelated to −3 or x+2) containing the
literal string `(−3)(x + 2)`. `views.mat.edges` is two **strings**, used only for that centre text
and for `aria-label`s. There are **no drawn edges, no width, no height, no partial-product cells, no
area.** The prompt asserts geometry the learner never sees: *"−3 along one edge and (x + 2) along
the other."* And the readout beneath it says "0x + 0" (A-M2), actively breaking the link it claims
to build. Opening the box replaces it with an undifferentiated row of tiles — nothing shows which
tiles came from which partial product.

**(B) 8/10.** equations ↔ lines ↔ solution count is genuinely connected: two coloured polylines, a
live point readout with per-line ✓/○, a relation sentence naming the rate *and* the starting value,
and a solution-set sentence that changes with the relation. Docked because the equations appear only
in the prompt text (not labelled on the lines) and the controls say "rate"/"start" rather than m/b,
so the symbolization leg is soft.

**REPRESENTATIONS: 5/10.**

---

## 6. MISCONCEPTION TEACHING — the three named ones

**Partial distribution (A): VISIBLE. 7/10.** "Multiplier to the x only" is a real state in the model:
`p = {square, x, unit: height[1]}` → the mat reads **−3x + 2**, and the grader fires
`partialProductFeedback` on exactly that state. Gated correctly (`multiplierShape`, i.e.
`width[0]===0`), so it is offered only where "stopped early" is well defined. This is the best thing
in insertion (A). Docked for opt-in, dead-end, hidden Undo.

**"Parallel lines cross off-screen" (B): VISIBLE. 8/10.** The model backs the words: *"both climb at
1, so they keep a constant gap of 4 and never meet"*, and the string names the misconception
head-on — *"there is nowhere off the screen for them to cross."* The learner can pan nothing and
needs to: the invariant (constant gap) is stated as the reason.

**"Coincident means no solution" (B): VISIBLE. 6/10.** Both channels address it: the relation panel
("Both relationships are the same line, so every point on it satisfies both") and the string
("infinitely many solutions, **not none**"). Docked for B-M1 (the one clause that misfires in this
exact branch) and for the ✓ ✓ + green dot arriving alongside "incorrect" at precisely the moment the
learner is most confusable.

**MISCONCEPTION_TEACHING: 7/10.**

---

## 7. INTERACTION

**(A) 4/10.** The mathematical object is not a control — there is nothing to manipulate. Two buttons,
then two sliders. The frame move is one-way, and its Undo is behind a disclosure named for a
different concept. Low friction, yes; direct manipulation of mathematics, no.

**(B) 7/10.** The point **is** directly draggable on the plane (`useSvgDrag`, snapping to the integer
lattice so on-line checks stay exact), with x/y range inputs as the secondary precision/keyboard
route — exactly the pattern the brief calls legitimate. The lines themselves are not draggable: rate
and start move only via steppers, so the second-order object is still slider-driven. Undo is
correctly scoped (line moves only; point moves stay out of the pair's stack) and correctly coalesced
per `slot:parameter`.

**INTERACTION: 6/10.**

---

## 8. ACCESSIBILITY

Good, and mostly genuinely good:

- **Keyboard route to every conceptual action** in both. Native `<button type="button">` and native
  `<input type="range">` throughout; the frame controls moved **out** of the collapsed panel onto the
  mat, which is a real reachability improvement.
- **No answer leak before reveal — verified.** `tone === "info"` is the *revealed* state
  (`LessonPlayer.tsx:752`, `COPY.revealBanner`). The algebraTiles `GhostChip` ("−3 x-tiles and −6
  unit tiles") and the systemsExplore `se-ghost` target ring are both gated on it. `se-relation`
  renders only when the relation is **not** unique, and its degenerate sentences never name a
  solution point — so "x = 2 and y = 3" is never on screen before the check. Clean.
- **No colour-only signalling** — ✓/○ glyphs accompany every colour cue.
- **Live regions carry mathematics, not positions**: `se-status` narrates the transformation,
  `se-relation` names parallel/coincident *with the reason*, the point readout is `aria-live`. The
  S213 `audible` change correctly makes frame moves and refusals always spoken while leaving ordinary
  slider nudges silent on classic mats.
- **≥44px**: `min-h-11`/`h-11`/`w-11` throughout. One exception — the systemsExplore **line**
  range inputs are `h-10` (40px); mitigated by the 44px ± buttons beside them offering the same action.

Two real gaps:

- **A11Y-1.** The algebraTiles SVG accessible name is *"Tile board showing 0x and a constant of 0."*
  while a rectangle worth −3x−6 stands on it (`xv`/`cv` are `views.mat.netX/netConst`). The frame is
  an unlabelled `<g>` inside the image. A screen-reader user is told the board is empty and worth
  zero **in the state the lesson starts in**. The only SR route to the frame's existence is the
  button's own label.
- **A11Y-2.** Undo for a frame move lives behind a toggle named "Work with zero pairs" — a
  discoverability barrier that lands hardest on keyboard and SR users, and the only way back from the
  misconception branch.

**ACCESSIBILITY: 6/10.**

---

## 9. POLISH

The authored voice survives and is good — *"Open it, and read what lands on the mat"*, *"watch this
crossing leave"*, *"bring the single crossing home"*. That is the house voice. The house stepper
pattern and button styling are followed.

Blemishes: the (A) prompt describes edges that are not drawn; "0x + 0" under a standing rectangle;
`degenerateSystemFeedback` is ~380 characters and four sentences, reading as a lecture where its
siblings are one-line diagnoses; and the permanent source comments for this session's algebraTiles
work are labelled **"S214"** (`algebraTilesModel.ts`, `widgets.tsx`, and both algebraTiles test
files) while the systemsExplore/schema work is labelled "S213" — the repo's own archaeology will be
wrong at the next audit. (`correctAnswerText` rendering `-3x − 6` with a mixed ASCII hyphen and
U+2212 is pre-existing, not this session's.)

**POLISH: 6/10.**

---

## 10. Scores

| Dimension | Weight | (A) tse-01-01 | (B) se-01-03 | Reported |
|---|---|---|---|---|
| MATHEMATICS | 20% | 7 | 8 | **7** |
| MASTERY GAIN | 25% | 2 | 8 | **5** |
| CAUSALITY | 15% | 4 | 9 | **6** |
| REPRESENTATIONS | 10% | 2 | 8 | **5** |
| MISCONCEPTION | 10% | 7 | 7 | **7** |
| INTERACTION | 10% | 4 | 7 | **6** |
| ACCESSIBILITY | 5% | 5 | 7 | **6** |
| POLISH | 5% | 5 | 7 | **6** |
| **weighted** | | **4.3** | **7.9** | **6.0** |

---

## 11. Verdict, per insertion

### (A) `tse-01-01` step `i1` — **REJECT**

Not because it is broken. It is carefully built, its arithmetic is exactly right, and its
misconception branch is a genuine idea. It is rejected because it **fails the program's own bar**:

1. There is no rectangle. The central representation the insertion is named for is a fixed-size
   dashed box containing a string.
2. The manipulation was not added but **removed**. One click on the primary button produces the
   graded answer; the derivation the step previously required is now disabled while framed and
   pointless afterwards. The answer is already printed on the preceding concept card.
3. The surface asserts a false value ("0x + 0") in its largest type and in its accessible name
   during the state the lesson starts in.
4. The one real gain is opt-in and terminates in a dead end whose only exit is the slider route the
   session's own refusal was written to forbid.

Per the brief, a rejected interaction is **removed**. Revert step `i1` to its S212 form (drop `area`
and `partialProductFeedback`, restore the S212 prompt); the file returns to `86e8e986…128b`. A
REWORK path exists but is an **engine** change, not a content change: draw the actual area model —
edges labelled −3 and (x + 2), the interior subdivided into the −3·x and −3·2 regions, tiles filling
those regions — and require the learner to **place** each partial product rather than receive them.
Only then is the claim in the prompt true and the manipulation real.

### (B) `se-01-03` step `i1` — **ACCEPT-WITH-FIXES**

The mathematics is sound and I re-derived all of it. The learner directly manipulates the central
relationship (equal rates ⇒ no unique crossing) and a genuine model responds — relation, reason,
gap, solution set, verdict, all recomputed. The critical safety property — that the grader cannot be
won by destroying the question — is correctly implemented and I confirmed it live in the exact case
where a naive grader fails. Both named misconceptions become visible states, not just distractor
strings. A lesson with zero manipulatives now has one that earns its place.

---

## 12. FAILURES

- **F1 (blocking, technical).** `src/lib/evaluate.systemsLines.s213.test.ts` — 2 failing tests
  (`:57`, `:85`). Byte-identical to the seal; never updated for the new opt-in. Not the expected
  hash-manifest failure.
- **F2 (A).** The area representation is absent — no drawn rectangle, edges, or partial-product
  cells. The prompt describes geometry the learner cannot see.
- **F3 (A).** The correct path is one button press that produces the answer; the previous
  derivation route is disabled. Net-negative mastery change.
- **F4 (A).** "0x + 0" is displayed, and spoken, for a mat worth −3x − 6.
- **F5 (A).** `constFeedback` is served for the "nothing done yet" state, diagnosing an error the
  learner did not make and revealing −6.
- **F6 (A).** The misconception branch cannot be re-entered or reversed except via an Undo hidden
  behind a differently-named disclosure.
- **F7 (B).** `degenerateSystemFeedback` serves one string for two distinct states; one clause is
  untrue of the coincident branch.
- **F8 (B).** The body promises "Predict first" but the step has no `predict` block.
- **F9 (minor, both).** Permanent source comments labelled "S214" for session-213 work.
- **F10 (minor, B).** `evaluate.ts:484` trusts `v.lines` raw where `systemsPairAdapter` gates it
  per-line with type checks; a stale/corrupt envelope could diverge widget from grader.

## 13. REQUIRED_FIXES (only what must happen before seal)

1. **Revert `tse-01-01` step `i1` to its S212 form.** Then re-pin
   `schema.algebraTilesArea.s211.test.ts` and `evaluate.algebraTilesArea.s212.test.ts` to zero area
   users (their new named-allowlist structure supports this cleanly).
2. **Fix `src/lib/evaluate.systemsLines.s213.test.ts`** — narrow it the way the other five were
   narrowed: name `se-01-03` as the opt-in, keep the old-path proof over the five classic specs, and
   add a positive assertion that the opted-in spec **is** graded against the envelope.
3. **Rewrite `degenerateSystemFeedback` so every clause is true of both branches** (or split the
   field). Concretely: drop or reframe "Give them the same starting value as well and they become
   one line", which is an instruction to do what a coincident-state learner has already done.
4. **Add the `predict` block** the body of `se-01-03/i1` promises, or remove "Predict first" from the
   body. The prediction should be the one the manipulation answers: what happens to the crossing when
   the rates are made equal.

Not required before seal, but should be logged: A11Y-1 (name the standing frame in the SVG's
accessible name), F9 (the S214 comment labels), F10.

## 14. CONTENT_IMPACT

- **Accept (B):** `se-01-03.json` stays at `db552da1…d145` if fixes 3 and 4 are deferred; both fixes
  touch that file, so expect a new hash. One lesson moves from 0 to 1 manipulative; its
  `systemsExplore` instance count in content goes 5 → 6.
- **Reject (A):** `tse-01-01.json` returns to `86e8e986…128b`. Authored `algebraTiles` area-mode
  users return to **0** — the S211 capability remains unexercised by content, which is the honest
  state until the engine can draw the model.
- Net authored-content delta for the session: **one lesson**, not two.
- No other content file is touched. `scripts/`, `data/`, `e2e/`, `tests/` all unchanged.

## 15. ENGINE_RATING_CHANGE — recommend, do not edit

**Recommend NO change to `scripts/engine-capabilities.json`.**

Current rows: `algebraTiles` manip 2 / conseq 3 / err 3 / adapt 0 / a11y 3 / mobile 2 / polish 2;
`systemsExplore` manip 2 / conseq 3 / err 3 / adapt 3 / a11y 3 / mobile 1 / polish 3.

Under the S205M rubric — *manip ≥ 2 requires a mathematical **model** responding to the learner's
action, not that dragging or typing exists* — both engines already sit at 2 on the strength of
models that already responded. Nothing landed this session establishes a new tier:

- `systemsExplore`'s editable lines are a genuine capability increase, but the rubric hinge they
  would clear (a responding model) was already cleared; the new controls are more *parameters*, not
  a new class of response. This matches four consecutive sessions of "MMIP adoption changed no
  rating", which remains the correct discipline.
- `algebraTiles` must certainly not be lifted. Its one authored area lesson reduces the learner's
  action to a reveal; a dashed box containing a string is the "prettier chrome" case the rubric
  exists to refuse.

If (A) is ever reworked into a real area model — labelled edges, partial-product cells, learner-placed
partials — that is the evidence to re-open `algebraTiles`, through the rubric's own gates.

## 16. NEXT_RECOMMENDED_USE

1. **Land fixes 1–4 and re-run the six touched test files.** Do not seal with a red pin.
2. **Decide the area-model question deliberately, at the engine.** The S211 `area` capability now has
   a session's worth of evidence that it cannot carry a distribution lesson as drawn. Either build
   the real thing (a subdivided rectangle with labelled edges, tiles placed by the learner into the
   partial-product cells — which would also give `factor` mode something real to gather *into*) or
   record it as a permanent rejection with this reason. Shipping it again unchanged will fail the
   same audit.
3. **Propagate (B)'s pattern, not (A)'s.** `se-01-03` is the model insertion of this session:
   a genuinely breakable object, a grader that refuses to reward breaking it, and misconceptions that
   become states. The sibling lessons in `systems-equations/ch1-graphing` are the obvious next
   targets, and the four remaining classic `systemsExplore` specs are candidates for opting in.
4. **Fix the "predict promised but not captured" pattern generally.** 2,118 of 3,473 interactive
   steps have no `predict` block; a body that says "Predict first" without one is a measurable,
   greppable defect class worth a sweep.

---

```
TASK: FABLE-QA independent assessment of two S213 lesson interactions (tse-01-01/i1, se-01-03/i1)
MATHEMATICS: 7/10
MASTERY_GAIN: 5/10
CAUSALITY: 6/10
REPRESENTATIONS: 5/10
MISCONCEPTION_TEACHING: 7/10
INTERACTION: 6/10
ACCESSIBILITY: 6/10
POLISH: 6/10
OVERALL: 6.0/10   (A) 4.3   (B) 7.9

VERDICT:
  (A) content/courses/two-step-equations/lessons/tse-01-01.json step i1 — REJECT (remove; revert to 86e8e986…128b)
  (B) content/courses/systems-equations/lessons/se-01-03.json  step i1 — ACCEPT-WITH-FIXES

FAILURES: F1 red regression pin (evaluate.systemsLines.s213.test.ts, 2 failing, not the expected
hash failure) · F2 no rectangle is drawn — the area representation is absent · F3 the correct path
is one button press that produces the answer, and the prior derivation route is disabled · F4
"0x + 0" displayed and spoken for a mat worth −3x−6 · F5 constFeedback served for "nothing done
yet" · F6 misconception branch is a dead end with a hidden Undo · F7 one degenerate string for two
states, one clause untrue of the coincident branch · F8 "Predict first" with no predict block ·
F9 source comments labelled S214 for S213 work · F10 evaluate.ts trusts v.lines raw

REQUIRED_FIXES: (1) revert tse-01-01/i1 to its S212 form and re-pin the two algebraTiles suites;
(2) update evaluate.systemsLines.s213.test.ts by narrowing, not relaxing; (3) rewrite
degenerateSystemFeedback so every clause is true of both parallel and coincident; (4) add the
predict block se-01-03/i1's body promises, or remove the promise.

CONTENT_IMPACT: one lesson lands, not two. se-01-03.json keeps its manipulative (0 → 1) and
systemsExplore instances go 5 → 6; fixes 3–4 will re-hash it. tse-01-01.json returns to
86e8e986…128b and authored algebraTiles area-mode users return to 0. No other content file changes.

ENGINE_RATING_CHANGE: none recommended. scripts/engine-capabilities.json is byte-identical to the
seal and should stay so. Under S205M, manip ≥ 2 already requires a responding model and both
engines already sit at 2; editable lines add parameters, not a new class of response, and
algebraTiles must not be lifted on the strength of a dashed box containing a string.

NEXT_RECOMMENDED_USE: land fixes 1–4 and re-run the six touched test files before seal; then decide
the area-model question at the engine (build a real subdivided rectangle with learner-placed
partials, or record a permanent rejection); propagate se-01-03's pattern — breakable object,
grader that refuses to reward breaking it, misconceptions as states — to its sibling graphing
lessons and the four remaining classic systemsExplore specs.
```
