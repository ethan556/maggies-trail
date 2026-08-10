# SESSION 216 — FABLE-QA

Independent assessment. One object: **`tse-04-02/i1b`**, the first authored `numberLineRay` step, and
the `requireSolvedForm` grading field added to make it possible. Nothing here is taken from the
implementor's report; every number below was re-derived with my own exact (BigInt) arithmetic and
graded against the shipped code, or read off a byte diff against the S215 seal.

Method: 268-state reachability sweep driven by the widget's own edit set; 4,872-state old-path/new-path
comparison against the S215 evaluator imported *literally* from the seal; the 208-state sweep
reproduced against my own oracle; targeted vitest (1 run, 5 files, 136 tests); `validate:content`;
`lint:pedagogy`; full `diff -rq` against `maggies-trail-session-215.tar.gz`. No file in the repo was
edited; scratch scripts live in `/tmp/qa216/`.

---

## 1. INTEGRITY vs the S215 seal — CLEAN

`diff -rq` of the whole tree (excluding `node_modules`, `.next`, build artefacts):

| area | result |
|---|---|
| `content/` | **exactly one file differs**: `content/courses/two-step-equations/lessons/tse-04-02.json` |
| `src/` | 3 files: `lib/schema.ts`, `lib/evaluate.ts`, `components/widgets.numberLineRay.s215.test.tsx` |
| `scripts/`, `tests/`, `docs/`, `data/`, `db/`, `public/`, `e2e/`, root | identical (only `tsconfig.tsbuildinfo`, a build artefact) |
| `src/components/widgets/numberLineRay.tsx`, `src/lib/mmip/numberLineRayModel.ts` | **byte-identical to the seal** — the engine itself was not touched |

**The before/after hash claim holds, exactly.** Seal file = `79f82190e042ccffca9ea0a135e973c78fc4729d693326324bd151cc9546ef6a`;
current file = `03bf44a4b35998a5330d4fcdb9c10ea65aba4e7f772a9c4d4eafd65b51a4db97`. Removing the `i1b` step
and re-serialising (indent 2, non-ASCII preserved, **no** trailing newline) reproduces the seal hash
byte-for-byte. Structural check independently confirms every other step, every string, and the
`remedials` block are untouched. Rule 1 ("never change authored lesson prose") is satisfied literally.

**No test was weakened.** The test diff is `@@ -646,6 +646,133 @@` — 133 added lines, zero deletions,
zero modifications. Both schema and evaluate diffs are additive: the only *removed* line in
`evaluate.ts` is the early `if (sameSolutionSet) return correct` return, which is re-expressed below
the derivation guard as `if (sameSet && (requireSolvedForm !== true || mine.solved))`.

Gates run: `npm run validate:content` → **1840/1840 clean**; `npm run lint:pedagogy` → **1711/1711
clean**; `npx vitest run` on the five relevant files → **136/136 pass**.

**Process gap (minor):** there is no `SESSION216_EXECUTION_REPORT.md` or `SESSION216_CONTENT_CHANGE_LEDGER.md`
on disk, and `VARIANT_LOG.md` / `VARIANT_STATE.md` are unchanged from the seal. S215 shipped both
files. The content change is one step, so the ledger is small — but it is missing.

---

## 2. MATHEMATICS — re-derived from scratch

Authored state: `start = (−2)x > −8`, `target = x < 4`, `requireSolvedForm: true`, window `[−2, 10]`,
step 1, transforms `÷(−2)` (factor −1/2) and `×(−2)` (factor −2).

**Start.** boundary = c/a = (−8)/(−2) = **4** exactly. a < 0 ⇒ drawn relation is the flip of the
stored one ⇒ direction `less` ⇒ the line already draws **x < 4**, which is the target set. Confirmed
independently by substitution sampling (1,203 rationals at 1/12 spacing plus both boundaries and
ε-neighbours): `sameSet(start, target) = true`, `isSolvedForm(start) = false`. So the item genuinely
*is* ungradable by set alone — the flag is not a convenience, it is what makes the item exist.

**Boundary invariance.** For any k ≠ 0, (kc)/(ka) = c/a. Verified on every reachable state: no press
of either transform moves the endpoint off 4 (`boundaryT` stays 0.500 — and note 4 sits *exactly*
mid-window in `[−2, 10]`, so the reflection has equal runway in both directions; that is good
authoring, not luck).

**Post-scale.** `÷(−2)`: a = −2·(−1/2) = 1, c = −8·(−1/2) = 4, relation untouched ⇒ **x > 4**. The ray
reflects about 4; the endpoint does not move. `×(−2)`: a = 4, c = 16 ⇒ 4x > 16 ⇒ **x > 4** — the other
button reflects too, because *both* offered factors are negative.

**Both solve orders pass through the wrong set** — confirmed, and stronger than claimed:

- scale→flip: `−2x > −8` [x<4] → `x > 4` [**wrong set**, solved form] → `x < 4` ✓
- flip→scale: `−2x > −8` [x<4] → `−2x < −8` [**wrong set**, x>4] → `x < 4` ✓

I proved it is unavoidable rather than merely true of two paths. Both factors are negative, so *every*
transform press flips the drawn direction; reaching coefficient 1 from −2 requires an odd number of
presses (coeff = (−2)^(1+#mul−#div)); an odd number of direction flips must therefore be undone by an
odd number of symbol/ray flips. Every individual press toggles the direction, so **after the first
press of either kind the drawn set is wrong**. The reflection cannot be routed around. Machine check:
of the 268 reachable states (depth ≤ 4 over transforms, symbol flip, inclusive toggle and all 13
lattice endpoint positions) exactly **one** grades correct — `(1, 4, lt)` — and **every** path to it
passes through a state whose set differs from the target.

**The two-press form state.** `÷(−2)` twice: a = 1·(−1/2) = −1/2, c = 4·(−1/2) = −2 ⇒ `(−1/2)x > −2`,
boundary (−2)/(−1/2) = 4, a < 0 ⇒ direction `less` ⇒ **set is x < 4, correct; form is not**. This is
exactly where the third diagnosis must fire, and it does.

**The third diagnosis fires exactly where claimed, and its text is true of the state.** Over all 268
states I asserted, per state, that the branch taken matches an oracle-computed classification and that
the quoted relation matches my own independent rendering of the state's parts:

| branch | states | every claim true of its state? |
|---|---|---|
| correct | 1 | yes — set matches **and** coefficient is 1 |
| "already shows the right set … still reads *W*" | 8 | yes — set matches, form does not, and *W* is my own rendering of the state (`(−1/2)x > −2`, `2x < 8`, `−8x > −32`, …) |
| endpoint | 240 | yes — boundary differs from target's |
| direction | 14 | yes — boundary equal, direction differs |
| inclusive | 5 | yes — boundary and direction equal, membership differs |
| unclassified | 0 | — |

**Zero verdict mismatches, zero false claims, zero target leaks** across the sweep. Crucially, at
`(−1/2)x > −2` the pre-S216 code would have fallen to the *inclusivity* branch and said "whether the
endpoint itself belongs is the part that is not right yet" — false of a state whose endpoint,
direction and membership are all already right. That defect is real and this field removes it.

**The wrong-direction diagnosis, for these numbers.** State `x > 4` produces: *"Your line shows x > 4,
so it runs toward the larger numbers. Which way the ray runs is the part that is not right yet. Test a
number on each side of the endpoint in the original −2x > −8 and see which side really works."* Every
clause is true: the state's solved text is `x > 4`; its direction is `greater`; the original *is*
`−2x > −8`. It never prints `x < 4`. (Bounded observation, §6.)

**Screen-reader narration of the reflection is true of state** (driven, not read off a table):

- after `÷(−2)`: *"Multiply both sides by a negative number: −2x > −8 becomes x > 4. Every term reverses sign together."* + *"Split both sides into 2 equal parts: −2x and −8 become x and 4. The solution set moved from x < 4 to x > 4."*
- after the flip: *"Turn the sign round: x > 4 becomes x < 4. The solution set moved from x > 4 to x < 4."*

No "move the boundary" operation is emitted in either case, because the boundary did not move — the
invariant is audible by its absence, and the set change is *computed* from both states, never asserted.

**Membership by substitution is exact and is c3 embodied**: at the start the probe defaults to the
boundary and says *"−2 × 4 = −8, and −8 > −8 is false, so 4 is not a solution"*; *"−2 × 0 = 0, and
0 > −8 is true, so 0 is a solution"*. After `÷(−2)` the same values report *"0 > 4 is false, so 0 is
not a solution"* — the learner can watch a number they just verified stop working. c3 ("test a number
in the ORIGINAL") arrives four steps later and names what they will already have done.

**The predict block is mathematically correct and leak-free.** Outcome `reflect` is right: the ray does
swing across 4 and the endpoint does not move; `slide` and `still` are both genuinely false of the
mechanics, and both are real learner beliefs. The reveal's argument — *"4 is where −2x and −8 are
equal and that stays true whatever you divide by"* — is the exact invariance proof (−2·4 = −8 ⇒
k(−2·4) = k(−8)), not a slogan. The reveal is rendered **only when `finalized`** (`LessonPlayer.tsx:768`,
`finalized = phase === "correct" || "revealed"`), and the widget itself is hidden until the prediction
is committed (`:634`), so "turning the sign round is what brings them back" cannot be read early.
Naming `4` is not a leak: the line labels the endpoint `4 not included` from the first frame.

---

## 3. THE GRADING SEMANTICS

**Is set-AND-form right here?** Yes, and it is the only honest option. The engine draws the solution
set of whatever relation is held, so a set-only grader marks this item correct before the learner
touches it. The alternative — grade the *written form* only — would teach that `−2x > −8` and `x < 4`
are different claims, which is the opposite of the engine's thesis. Set-AND-form keeps the invariant
("the picture must not move") and adds the goal ("x standing alone"), which is exactly the task the
prompt states. The field is optional and never defaulted, so `off` remains "any equivalent writing
counts".

**Does the old flagless path reduce literally?** I imported the **S215 evaluator itself** from the seal
(`/tmp/oldpath/src/lib/evaluate.ts`, staged from the tarball) and compared it with the shipped one over
**4,872 states** across two flagless specs (the gallery sample, and `i1b` with the flag stripped):
coefficients ±1, ±2, ±3, 5 over denominators 1–3, both relations, both inclusivities, constants −14…14.

> **0 divergences** — identical `correct` **and** identical `feedback` string on every state.

I then reproduced their 208-state sweep verbatim and graded it against *my* oracle rather than the
schema helper: 208 states, 4 correct, **0 mismatches**. The sweep claim stands.

**One narrow correction to the "byte-identical" claim.** The refactor moved the success return *below*
the derivation guard, so a persisted value whose parts are safe integers, whose set matches the target
under the schema's float cross-multiplication, but whose *exact* derivation overflows, now grades
differently. Witness (verified, not hypothesised):

```
coeff = 1 / 9007199254740991 , constant = 4 / 9007199254740991 , relation "lt", inclusive false
   S215: correct = true   ("x < 4, and the line finished exactly where it started …")
   S216: correct = false  ("Your saved relation holds numbers this line can no longer draw exactly …")
```

This is **unreachable through the widget** — `accept()` refuses any state that is not derivable — so it
requires a tampered or corrupted persisted value, and the new behaviour is strictly the safer one (it
never marks correct a state it cannot draw). Record it as a behaviour *improvement* on an unreachable
corner, and stop saying "byte-identical" without the qualifier "on every state the model can hold".

**The mutation claim, corrected.** Their test asserts three named states flip when the flag is dropped;
that is true. The relayed claim "flips **exactly** the three form-only states" is not — the class is
infinite (every (−2)^k re-writing), and **8** members of it are reachable within four presses:

```
−2x > −8   (−1/2)x > −2   −8x > −32   4x < 16   (−1/8)x > −1/2   (1/4)x < 1   −32x > −128   16x < 64
```

Every one of the 8 is same-set-and-not-solved-form, and **no state outside that class changes verdict**
— which is the property that actually matters, and it holds exactly. The integrity guard moves with the
flag as claimed: the flagless `i1b` is refused by *both* the old and the new gate with "the item begins
solved", and a flagged spec whose target is `2x < 8` is refused with "the target must be written in it".

**Engine-case-only holds.** Both `schema.ts` hunks are inside `case "numberLineRay":`; the `evaluate.ts`
hunks are inside `case "numberLineRay":` plus one import and one local return-type widening. Nothing
shared is touched.

---

## 4. MASTERY — what the ray adds that the lesson did not have

The lesson before this step: **c1** narrates the rule in prose on these exact numbers; **i1**
(`solveBalance`) does the same problem on a balance beam, where the flip is justified by *which pan is
heavier*; **k1/k2/k3/ch1** are symbol drills; **i2/i3** are mcq; **c3** names the test-a-number check.

What `i1b` adds is genuinely new and is not a restatement:

1. **The set-level view.** The balance beam is a claim about *two quantities*; the ray is a claim about
   *which numbers work*. A learner can hold "the heavier pan swapped" without ever connecting it to
   "the numbers that were solutions stopped being solutions". This step makes the second one the
   visible object, and the transition between them is the reflection.
2. **The boundary invariant.** Nothing else in the lesson says *what does not change*. Here it is
   structural: the endpoint is pinned at 4 through every legal move, and the SR narration emits no
   boundary operation because there is none. "Dividing changes which side, never where" is a real
   addition to a rule the learner otherwise memorises as a symbol-level tic.
3. **c3 embodied before it is stated.** Substitution into the learner's *own current* relation, with
   every number in the sentence real.
4. **The misconception is enacted, not described.** The learner produces `x > 4` themselves and watches
   it be wrong. The predict block forces a commitment first, so the reflection lands as disconfirmation.

Where it falls short of a 10:

- **The destination is already known.** c1 prints `x < 4`, and i1 immediately before it ends at `x < 4`
  on the same problem. The step cannot be a discovery of the answer; it is a discovery of the mechanism.
  Defensible (three representations of one problem, explicitly threaded — "where the last step left
  you"), but the independent demand is low: the minimum solve is two presses, and a learner who just
  guesses "press the other button" is not stopped.
- **The engine's other unique affordance is unused.** `k2`, `k3` and `ch1` are all ≥/≤ items, and the
  open/closed dot — three redundant channels, the one point that decides inclusivity — never appears on
  a line in this lesson.
- **Not re-askable.** No `variant` declaration; there is no generator for this engine, so this is a
  single fixed encounter. Correct for a first step, but it means the mastery gain is not measured twice.

Novelty and demand re-checked, not assumed: `numberLineRay` appears in exactly **one** content file
repo-wide (this one), so novelty is total at the engine level; demand is the weakest dimension.

---

## 5. INTERACTION / ACCESSIBILITY (checked, briefly)

- **Keyboard route to the full solve exists**: `÷ (−2) on both sides` and the symbol/ray buttons are all
  native `<button type="button">`, reachable by Tab, and the two-press solve needs nothing else. The
  endpoint is a focusable button with ←/→ nudging and Enter to toggle inclusivity, its label saying so.
- **Touch targets**: transform buttons `min-h-11` (44 px) with `px-3` and wide labels; endpoint
  `h-11 w-11`; steppers and probe buttons `h-11 w-11`; the symbol button `min-h-11 min-w-11`. The
  known overlay hazard is handled structurally — exactly one fixed-size control sits inside the scaled
  viewBox (the endpoint), and the ray's control was moved into flow beneath the line.
- **SR narration of the reflection is true of state** (§2) and comes from the same derivation the
  picture uses. Refusals and clamps are announced, never silent.
- **Predict/no-leak**: the widget renders the target only in the reveal ghost (`tone === "info"`,
  `aria-hidden`); the reveal banner is `finalized`-gated; `describeState` deliberately omits the target.
- Minor: two polite live regions (the solved-form line and the status line) both update on every edit;
  and the endpoint button overloads Enter (toggle) against arrows (move). Both inherited from S215.

---

## 6. FINDINGS

**F1 — no reachability guard on `requireSolvedForm` (authoring hazard, not live).** The gate checks the
target is solved-form, but nothing checks that coefficient 1 is *reachable* from the start using the
offered transforms. `transforms: []` with a non-unit start coefficient, or factors like `×3` from −2,
produce an item that parses, passes integrity, and cannot be solved. `i1b` itself is fine (one press).
This is cheap to close and should be closed before a second `requireSolvedForm` item is authored.

**F2 — the declined `×(1/2)` distractor: right call, wrong reason.** The stated justification ("it
creates a genuine dead end") is false. With `{×(−1/2), ×(−2), ×(1/2)}` the coefficient monoid is
±2^k and coefficient 1 stays reachable from every reachable state: from `−x > −4`, `×(−2)` then
`×(1/2)` lands on `x < 4` — a two-press detour, and Undo exists regardless. The *decision* is still
defensible (two exactly-inverse buttons make every press reversible and make "every press reflects"
the item's single variable), but the stated reason should be retracted. Note the counter-argument the
false reason obscures: a **positive**-factor button is the only way to let the learner *isolate* the
negative as the cause of the reflection, which is precisely c2's scope claim — see F3 and the batch
answer.

**F3 — the reflection's cause is narrated, not isolated.** One press of `÷(−2)` performs the negation
and the halving together, so nothing in this step lets the learner test "does ×2 reflect it too?". The
rule's *scope* (c2: only multiplying/dividing by a negative flips it) is therefore still taken on
authority here.

**F4 — the appended fallback reads oddly on the form branch.** *"Your line already shows the right set
of numbers … Test a number on each side of the endpoint in the original −2x > −8 and see which side
really works."* Not false — the check is always legitimate — but for a learner whose set is already
right it is a no-op that faintly implies their side may be wrong. The tail is appended to every branch
by S215 design; the authored text was chosen for the direction branch.

**F5 — the success message narrates one specific order.** *"Dividing by −2 swung the ray across 4, and
turning the sign round swung it straight back."* A learner who flips first, or who solves via
`×(−2), ÷(−2), ÷(−2)`, made both kinds of move (necessarily) but not in that order. True in mechanism,
loose in sequence.

**F6 (inherited, not introduced) — "the endpoint is the part that is not right yet" can be said when
the direction is also wrong.** Reachable here: press `÷(−2)`, then drag the endpoint to 7 → `x > 7`,
where both the endpoint and the direction differ from the target and only the endpoint is named. The
definite article overclaims. S215 code, unchanged by this session; worth a look when the engine is next
opened.

**F7 (bounded) — the direction diagnosis is answer-determining.** With the endpoint and inclusivity
already right, "which way the ray runs is the part that is not right yet" fully determines `x < 4` for
a two-valued fact. It never *prints* the target and it is only reached after a wrong Check, and the
appended tail pushes verification rather than flipping — so this is a note, not a defect.

None of F1–F7 is a surface asserting something false of its own state. The one defect class this
programme keeps catching is **absent** from this step, and the new third diagnosis exists precisely to
keep it absent.

---

## 7. VERIFICATION LEDGER

| claim | verdict |
|---|---|
| exactly one content file differs from the S215 seal | **TRUE** |
| the diff is exactly the inserted `i1b` step; stripping it reproduces `79f82190…` | **TRUE**, byte-for-byte |
| schema/evaluate diffs additive, engine-case-only | **TRUE** |
| no test weakened | **TRUE** (133 added lines, 0 deletions) |
| 208-state old-path sweep, independent oracle, flagless specs grade identically | **TRUE** (reproduced; extended to 4,872 states, 0 divergences) |
| "flagless specs grade byte-identically" | **TRUE on every state the model can hold**; false on one unreachable, non-derivable class where the new path is safer |
| mutation flips exactly three form-only states | **the three named do flip**; the true count in the reachable space is 8, all inside the intended class, none outside |
| both solve orders pass through the wrong set | **TRUE**, and provably unavoidable |
| untouched start grades INCORRECT with the form diagnosis | **TRUE** (note: live, Check is disabled until the first edit, so the state is graded after any move that returns to it — e.g. `×(−2)` then `÷(−2)`) |
| leak-grep clean | **TRUE** — target rendered only in the reveal ghost; reveal banner `finalized`-gated |
| ×(1/2) declined because it creates a dead end | **FALSE as stated** — the decision stands, the reason does not (F2) |

---

MATHEMATICS 10/10 · MASTERY_GAIN 9/10 · CAUSALITY 9/10 · REPRESENTATIONS 10/10 · MISCONCEPTION_TEACHING 9/10 · INTERACTION 9/10 · ACCESSIBILITY 10/10 · POLISH 8/10 · **OVERALL 9.3/10** · **VERDICT: ACCEPT**

**FAILURES** — none blocking. Three claims need correcting in the session record: (1) "flagless specs
grade byte-identically" holds only on states the model can hold — one non-derivable, unreachable class
now grades incorrect where S215 graded correct (witness in §3); (2) the mutation flips 8 reachable
states, not 3 — all inside the intended right-set-wrong-form class, none outside it, which is the
property that was actually needed; (3) the `×(1/2)` distractor does **not** create a dead end
(`×(−2)` then `×(1/2)` reaches coefficient 1 from −1) — the exclusion is still the right call, the
reason is not. Process: no S216 execution report or content-change ledger exists on disk.

**REQUIRED_FIXES** — none for this step to ship. Before the **next** `requireSolvedForm` item is
authored: add a reachability check to `widgetIntegrityErrors` (`src/lib/schema.ts:6474`) — with
`requireSolvedForm: true`, refuse a spec in which no product of the offered transform factors takes
`start.coeff` to 1 (the trivial and most likely case being `transforms: []` with a non-unit start
coefficient). Optional polish, in descending value: F4 (author a form-branch tail, or drop the tail on
that branch); F5 (state the mechanism without the order); F6 (say "start with the endpoint" rather than
"the endpoint is the part that is not right yet" when more than one fact differs).

**CONTENT_IMPACT** — one authored step added: `tse-04-02/i1b`, an `interactive` between the
`solveBalance` (i1) and the first check (k1), carrying a three-option predict block. Lesson step count
11 → 12; `minutes` unchanged at 10 (the step is a two-press solve plus a prediction, so this is
defensible, but the lesson is now the longest in ch4). No `conceptTag`, no `variant`, no remedial
routing touched — the lesson's mastery measurement is exactly as it was. `numberLineRay` now appears in
one content file repo-wide; the engine has left the gallery.

**NEXT_RECOMMENDED_USE** — the batch question, answered per item:

- **k1 (−3x + 2 < 14), k2 (−6x − 4 ≥ −28), k3 (−2x + 6 ≤ −12), ch1 (−7x − 8 ≤ −43) — MUST NOT convert.**
  Two reasons, either sufficient: the engine's canonical state is `a·x REL c` with **no additive term**,
  so it cannot even hold these problems, let alone test the "undo the constant" move they exist for;
  and all four carry `conceptTag: tse-inequality-flip` plus `variant: g7-tse-inequality-build`, i.e.
  they are the lesson's only re-askable mastery measurement — replacing them would delete
  re-askability and remedial routing to buy a representation the lesson already has once.
- **i2 (−4x − 3 > 9), i3 (−5x + 1 < 21) — MUST NOT convert.** Same expressive-range wall (two-step),
  and converting the mcq pair would leave the lesson with three consecutive manipulatives before its
  first check.
- **The honest generalisation:** in ch4 *every* authored item is two-step, so a ray step can only ever
  be an **inserted mid-solve interactive** that picks up at `a·x REL c` — exactly how `i1b` is authored.
  The pattern is repeatable; it is never a replacement.
- **Best next instance (recommended): `tse-04-01`, the POSITIVE-coefficient lesson**, inserted after its
  i1 (`solveBalance` on 3x + 2 > 14). Start `3x > 12`, one transform `÷3` (factor 1/3), target `x > 4`,
  `requireSolvedForm: true`. It is the contrast case: a positive scale leaves the ray exactly where it
  is, which is that lesson's c3 ("the comparator stays the same … as long as you never multiply or
  divide by a negative") and this lesson's c2, made visible instead of asserted — and it closes F3 by
  letting the two lessons together isolate the negative as the cause.
- **Second best: a ≥/≤ instance**, e.g. picking up `2x + 4 ≥ 10` at `2x ≥ 10` in `tse-04-01/i2`'s
  neighbourhood, so the filled-dot/open-gap channel — the engine's other unique affordance, demanded by
  k2/k3/ch1 and shown by nothing — finally appears on a line.
- **Do not** add a second `numberLineRay` step to `tse-04-02`: it would be a fourth pass over the same
  numbers and would push the lesson past its 10-minute budget.
