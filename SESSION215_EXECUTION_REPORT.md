# SESSION 215 EXECUTION REPORT — the first new engine, the first written rubric, and four contracts that could not see what they claimed to check

Third session under the Causal Mastery Interaction Program, run for maximum throughput at an
unchanged QA bar: four parallel tracks across disjoint files, three widgets.tsx windows, a fresh
independent Fable-QA, three adjudicated rating changes, one serialized gate chain.
**Zero content changes** — every capability built this session must pass QA before any lesson
uses it.

## 1. What landed

**`numberLineRay` — confirmed engine gap G, the first genuinely new engine this program has
authorised, and the first widget to live outside the `widgets.tsx` monolith.** Inequalities as a
manipulable object: the learner drags the endpoint, presses the dot to open/close it, and turns
the ray round. The design decision that matters is putting the **coefficient in canonical state**
— without it, `x > 3` and `−2x < −6` are the same claim and the picture cannot move, so reversal
is unshowable. `scaleBothSides(k)` multiplies both sides and *does not* auto-flip the symbol: the
learner's symbol stands and the ray simply shows the set they now have. Fable-QA drove it and
endorsed that choice as pedagogically right — it does not let the misconception pass silently, it
makes it visible. Grading is on the **solution set**, not the writing (five different writings of
`x ≤ 2` all grade correct). 84 tests, then 31 more after QA.

**The first written capability rubric.** `docs/CAPABILITY_AXES.md` gives all seven axes 0–3
definitions with named examples and — the load-bearing part — explicit "not earned by" clauses.
It is *descriptive*: derived from what the existing 126 scores already mean, with a published
honesty-check table of contradictions its author refused to paper over. Fable-QA independently
verified every distribution and membership list and judged it descriptive rather than
self-serving, noting its refusal clauses cost it ten lifts on `err` alone.

**Three rating changes, adjudicated against that rubric by someone who did not write it.**
`numberLineRay` gets a full row (manip 2 · conseq 3 · err 3 · adapt 3 · a11y 3 · mobile 2 · polish
3, Σ19, grade A — `manip` refused at 3 for consistency with `systemsExplore`). `exactNumberLab`
adapt 2 → 3: a whitespace-blind regex in the pinned test had been unable to see 15 components,
and once repaired, 14 were consistent and one — this row — was genuinely wrong. `rotationLab`
keeps err 3, now **earned rather than asserted**.

**Lines carry live equations** (systemsExplore), each derived from the model, anchored to stay in
frame, and deliberately *identical and both present* in the coincident case — because two
equations that are the same equation is precisely the mathematics of that case.

**An x²-tile control** for algebraTiles, unblocking `(x+a)(x+b)`.

## 2. What the independent assessor caught that the session had not disclosed

This is why the role exists. Four blocking findings, all fixed:

1. **A shipped defect worse than reported.** `RotationLabW`'s tone markup was
   `{tone ? <p>{tone}</p> : null}` and `tone` defaults to `"neutral"` — so **every learner who
   ever opened a rotationLab step read the literal word "neutral" on screen from load**, not just
   "error" at retry. Replaced with house-grammar tone content.
2. **A sweep that could not fail.** The 2,210-state proof of the `deriveArea` fix passes
   identically against the *pre-fix* model — verified by running it against the S214 seal. The fix
   was real; the proof was decoration. Replaced with a 33,075-state sweep over the six pile
   dimensions whose expectation is derived by a different route, and which **goes red in 6 tests
   when the fix is reverted**.
3. **Screen-reader users were told false mathematics.** `describeState` narrated
   systemsExplore's *authored* lines: after a drag the labels said `y = 3x` while the panel said
   `y = 1x + 1`, reported wrong y-values, and said the point was on neither line when it was on
   line 1. Now derived through the pair model, reading the same four numbers the ✓ marks read.
4. **An undeclared fourth red**, plus two 44px handles that could render exactly coincident.

And the deepest one: **`err = 3` was backed by an aggregate count** (128 ≥ 116) that could not name
a single engine — which is exactly how rotationLab held its score on placeholder markup. Twelve of
the 116 engines rated `err = 3` have no ghost in their own component.

## 3. Contracts that could not see what they claimed to check

Four separate blindnesses were found and closed this session, and the pattern is worth naming as
much as the fixes:

- a regex that missed 15 components because their signature had no space (`}:WProps<...>`);
- an `err = 3` contract satisfied by a **count**, never by an engine;
- two contracts that scan `widgets.tsx` **only** — so the first engine to live outside the
  monolith was structurally invisible to the guarantees every other engine must meet;
- an assertion of the form `expect(container.textContent).not.toMatch(/\b(neutral|error)\b/i)`
  which is **vacuous**: concatenating a DOM tree welds words together
  (`…(-1.41, 5.66).errorWhat's on screen…`) so the boundary never matches. It passed with the
  defect fully present. Fable-QA swept 315 files, 97 negative assertions, and confirmed **no other
  suite is vacuous the same way**.

Every one of these is the same failure in a different costume: a check whose *scope* is narrower
than its *claim*.

## 4. The twelve — a debt made explicit rather than resolved or hidden

Twelve engines carry `err: 3` with no reveal-ghost in their own component. The planner declined
to bulk-downgrade twelve rows on its own authority — this repo refused eleven `manip` lifts one
engine at a time with per-engine evidence, and a bulk downgrade deserves the same care in reverse
— and equally declined to seal on a red gate or to suppress the finding. Instead the per-engine
contract landed with a **named, non-growing debt list**: each of the twelve recorded with its
session and what is missing, and the test now fails if a thirteenth joins **or** if a listed
engine quietly gains a ghost without being retired from the list. Both directions were
adversarially proven to bite. S216 adjudicates them one at a time; the right outcome may be fixing
the engine or correcting the row.

## 5. Validation

typecheck 0 · vitest **319 files / 12,767 tests, 0 failures** · validate:content 1,840/1,840 ·
lint:pedagogy 1,711/1,711 · check:registration clean · **check:engine-registration 127/127**
(was 126 — the new engine) · content proof 812/812 · hash proof 1,701/1,701 · build 0 ·
Playwright 115/115 · fresh-extraction reprove at seal.

## 6. Metrics (program §17)

| metric | value |
|---|---|
| New engines | **1** (`numberLineRay`, gap G — the first authorised) |
| Confirmed engine gaps remaining | 7 of 8 |
| Lessons gaining first causal interaction | 0 (deliberate — no content may use a capability before QA passes it) |
| Rating changes | 3, all adjudicated against a written rubric by a non-author |
| Rubrics written | 7 axes (previously 1) |
| Shipped defects fixed | 2 (a widget printing "neutral" to every learner; SR users given false mathematics) |
| Contract blindnesses closed | 4 |
| Non-biting proofs replaced | 1 (2,210 → 33,075 states, mutation-verified) |
| Accessibility defects fixed | 3 |
| Content changes | **0** |

## 7. Next

1. **Author the first `numberLineRay` lesson** — the engine is QA-passed and rated; inequalities
   are a high-reuse concept and this is the first new candidate pool the program has manufactured.
2. **Adjudicate the twelve** one at a time against `docs/CAPABILITY_AXES.md`.
3. **Re-check `numberLineRay` mobile 2 → 3**: the adjudicator held it at 2 *because the 44px gate
   failed on it*, and that blocker was removed later the same session. The basis for the number no
   longer holds; it should be re-adjudicated, not quietly lifted.
4. Close the `rate/start` half of the systemsExplore REPRESENTATIONS docking (Fable-QA: `se-01-03`
   8.3, ≈8.7 with the fixes now landed).
5. The remaining seven engine gaps — still the only route that manufactures new candidates.
