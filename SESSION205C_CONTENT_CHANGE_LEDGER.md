# S205C — content-change ledger

Two content changes. One is a **mathematical-correctness repair to content shipped in the S205B
seal**; the other is a **new inserted step** that leaves every authored byte untouched.

---

## 1. REPAIR — `ca-01-03` step `i1b`, `widget.lowFeedback`

**File:** `content/courses/curve-analysis/lessons/ca-01-03.json`
(mirrored in `content/patches/s205b-insert-after.json` so patch and corpus cannot disagree)

**Original (shipped in the S205B tarball, sha256 `238b6083…`):**
> Not flat yet — the f′ pane is still below zero here, and the curve is falling. Keep moving toward where f′ crosses zero.

**Replacement:**
> Not flat yet — the f′ pane is still above zero here, and the curve is still climbing. Keep moving right toward where f′ dips to zero.

**Reason: mathematical correctness — three false claims in one string.**
The step draws `fn: "cubic"`, i.e. f(x) = x³, so f′(x) = 3x², which is **never negative**.
`lowFeedback` fires when x < targetX = 0, i.e. at every reachable x in [−4, −0.5]. At each one:

| x | f′(x) = 3x² | "below zero"? | "falling"? |
|---|---|---|---|
| −4 | 48 | false | false |
| −3 | 27 | false | false |
| −2 | 12 | false | false |
| −1 | 3 | false | false |
| −0.5 | 0.75 | false | false |

1. **"below zero"** — false at every firing position; f′ > 0 throughout.
2. **"the curve is falling"** — false everywhere; x³ is monotonically increasing on ℝ.
3. **"where f′ crosses zero"** — 3x² *touches* zero at x = 0 (a minimum of f′) and never changes
   sign. "Crosses" describes a sign change that does not happen.

The learner who took the wrong path was told the opposite of what the picture showed.

**Instructional meaning preserved:** the sentence still says *not there yet*, still names the f′
pane as the thing to watch, still gives the direction of travel, and still names the target
condition. Only the three false assertions changed. No ids, order, answers, hints, `conceptTag`,
predict block, or any other field was touched.

**Verification:** `above zero` and `climbing` now hold at **every** reachable firing x (checked
programmatically against `traceSlopeAt`, not by eye); `dips to zero` matches the touch-minimum at
x = 0. Schema 1840/1840 clean, pedagogy 1711/1711 clean.

**Regression coverage added:** `src/lib/derivativeTraceFeedback.s205c.test.ts` — a corpus-wide lint
that reads every `derivativeTrace` widget's feedback prose against the function it is actually
drawn on, computing each string's firing range from the grader in `evaluate.ts` and the reachable
x-grid from the renderer. It asserts only that a directional claim is true *somewhere* in its
firing range, so defensible wording cannot trip it, while a claim false at *every* reachable
position fails. **Failure-first proof:** re-injecting the original string into the corpus makes the
suite fail with both false claims named and the exact range cited; restoring it returns 3/3 green.

---

## 2. INSERTION — `ca-02-02` new step `i1b`

**File:** `content/courses/curve-analysis/lessons/ca-02-02.json` ("The Second-Derivative Test")
**Patch:** `content/patches/s205c-second-derivative.json`

**No authored content was altered.** The `insertions` operation splices a new step after the
anchor while keeping the authored steps as the original array objects, with a structural proof
(serialise-minus-insert === original) that no authored byte can drift. The authored steppedReveal
`i1` — x⁴, −x⁴, x³ all with f′(0) = 0 and f″(0) = 0 and three different verdicts — is untouched
and still does its teaching.

**What the insertion adds:** the complement the lesson never had. The reveal shows the test
*failing*; the lab shows it *working*, on f(x) = x³ − 3x where f″ = 6x is nowhere near zero at the
points that matter. The learner starts at x = 2 and drags left across the inflection at x = 0,
watching f″ flip sign, to the critical point the test calls a maximum.

**Every number derived twice** — closed form and numeric difference quotients (h = 10⁻⁴):

| quantity | closed form | independent numeric |
|---|---|---|
| f′(−1) | 3(−1)² − 3 = 0 | 0.0000 |
| f″(−1) | 6(−1) = −6 | −6.000 |
| f′(1) | 0 | 0.0000 |
| f″(1) | +6 | 6.000 |
| f(−1) | −1 + 3 = 2 | — |

**Unique solvability proved on the reachable grid**, not assumed: the renderer's slider and its
pointer path both snap to the same 0.5 grid on [−4, 4], so the reachable critical points are
exactly {−1, +1}; only x = −1 has f″ < 0. Target is therefore unique, and the point-mode grader's
exact equality (`x === spec.targetX`) is satisfiable.

**Feedback truth checked across full firing ranges:** `lowFeedback` fires on [−4, −1.5] where
f′ > 0 *everywhere* (claim "still climbing" true) and f″ < 0 *everywhere* (claim "already
negative" true). `highFeedback` fires on [−0.5, 4], every point of which is strictly right of the
target (claim "gone past" true); its statements about f″ describe the function, not the learner's
position, so they hold regardless of where they stopped.

**Tier effect:** ca-02-02 **C 24 → A 32**. Census A 1175 · B 431 · C 94 · D 1.

---

## 3. LEDGER CORRECTION (no content change)

The S205B refusal ledger recorded **`ca-03-01`** against reasoning about concavity, f″ and
inflection. `ca-03-01` is **Rolle's Theorem**; the concavity lesson is `ca-02-01` and the
f″-test lesson is `ca-02-02`. The cited engine gap was real and is now closed — the lesson id
attached to it was wrong. Both lessons are re-adjudicated by name in
`content/patches/s205c-second-derivative.json`:

- **ca-03-01** stays refused for a *different, still-standing* reason: its reveal argues the
  existence claim (equal endpoint heights force a flat tangent between), and `derivativeTrace` has
  no interval controls — `fn` is a fixed four-item enum (schema.ts:3136) — so the learner cannot
  test the hypothesis by breaking it. Engine gap: needs a movable interval.
- **ca-02-01** is not a candidate at all: already Tier A (32), and its interactive step is a
  `signChart`, not a `steppedReveal`. It was never on the wall.

This is exactly the failure mode the "cite your refusals with source lines" rule exists to catch:
the *citation* was accurate and verifiable, which is how the wrong *id* became visible a session
later. Cite-bearing refusals are auditable; bare ones are not.
