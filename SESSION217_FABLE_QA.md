# SESSION 217 — FABLE-QA

Independent assessment of the three S217 deliverables. The implementor this session was the
coordinator itself, so nothing below is taken from any session report (none exists on disk — see
FAILURES); every number was re-derived with my own BigInt arithmetic and graded against the shipped
code, or read off a byte diff against the S216 seal (`maggies-trail-session-216.tar.gz`).

Method: 268-state reachability sweep driven through the real `absorbRayEdit`/`evaluate`, classified
by my own oracle (set equality by exact substitution sampling — 733 probes per comparison, boundary
and ε-neighbours included — not the schema's structural compare), with the instrument itself
mutation-verified; 8 constructed-spec probes of the reachability guard through the real
`widgetIntegrityErrors`, including a frontier probe past its own bounds; hand comparison of the o2
transcription against `deriveEquation` on all 10 authored (m,b) pairs; `validate:content` (1840/1840)
and `lint:pedagogy` (1711/1711); 2 targeted vitest runs (88/88 baseline on both touched test files;
forced-true guard mutation → exactly 2 red, restore verified by sha256). No repo file edited (the
mutation was restored byte-identically, hash-checked); scratch lives in `/tmp/qa217/`.

---

## 1. INTEGRITY vs the S216 seal

`diff -rq` (excluding `node_modules`, `.next`, `test-results`, `tsconfig.tsbuildinfo`): **four**
files differ, and nothing else — no file added, none removed.

| file | nature |
|---|---|
| `content/courses/two-step-equations/lessons/tse-04-01.json` | the inserted `i1b` step — the only content change |
| `src/lib/schema.ts` | one additive hunk: the reachability guard (+38 lines, 0 deletions) |
| `src/components/widgets.mmip.o2.s212.test.tsx` | one additive hunk inside the classic loop (+19 lines, 0 deletions) — stricter |
| `src/components/widgets.numberLineRay.s215.test.tsx` | **not disclosed** — +71 lines, 0 deletions: a new describe block with the guard's 5 tests |

**The hash claim holds exactly.** Seal `tse-04-01.json` = `9cf879c3…f9d1`; current = `169fd191…50ac`;
stripping `i1b` and re-serialising (indent 2, no trailing newline) reproduces the seal
**byte-for-byte**, and deep-compare confirms every other step and the `remedials` block untouched.
Step order is `c1, i1, i1b, k1, …` — same slot as the twin.

Engine untouched: `numberLineRayModel.ts`, `numberLineRay.tsx`, `evaluate.ts`, `widgets.tsx`,
`lineFamilyModel.ts`, `LessonPlayer.tsx`, `mmipTypes.ts` (FROZEN), `scripts/engine-capabilities.json`
all byte-identical to the seal (hashes checked, not mtimes).

**One integrity claim is false as relayed:** "no other test touched." The s215 test file gained the
guard's 5 tests. The change is additive-only and is the right home for those tests — but the
disclosure did not match the disk, and that distinction is this programme's whole business.

---

## 2. ITEM 1 — `tse-04-01/i1b`, the contrast twin

Authored: start `3x > 12`, transforms `÷3` (1/3) and `×3` (3), target `x > 4`,
`requireSolvedForm: true`, window `[−2, 10]`, step 1 — the positive-coefficient case where the ray
does not move.

### Mathematics, re-derived

- **Boundary** 12/3 = **4** exactly (my BigInt reduction), mid-window as in the twin. Coefficient
  positive ⇒ drawn relation = stored relation ⇒ the line draws **x > 4** from the first frame.
- **Start set = target set** by substitution sampling (733 exact probes incl. both boundaries and
  ε-neighbours) — so the item is ungradable by set alone and exists only because of the flag, exactly
  like the twin. Start is not solved form (coeff 3), so the **begins-solved gate does not fire**
  (its set-AND-form condition is what makes this authorable) — both shipped lessons pass the real
  `widgetIntegrityErrors` and the full `validate:content` corpus run.
- **`÷3`** → coeff 1, constant 4, relation untouched ⇒ `x > 4`, solved. Grades **CORRECT** with the
  authored success feedback. **`×3`** → `9x > 36`, boundary still 4, same set (substitution-checked)
  — grades incorrect via the **form** branch quoting `9x > 36`.
- **The untouched start grades INCORRECT via the form diagnosis** — "already shows the right set …
  still reads `3x > 12`, so x is not standing on its own yet" — every clause true of the state, no
  other fact named, not false-correct, not begins-solved. (Live, Check is disabled until the first
  edit — `canCheck(spec, null) === false`, confirmed.)
- **The misconception route** `÷3` then flip ⇒ `x < 4`: wrong set, boundary equal, so the
  **direction** branch fires — "Your line shows **x < 4**, so it runs toward the **smaller**
  numbers… Test a number … in the original **3x > 12**." It quotes the learner's own set, and no
  incorrect feedback anywhere in the reachable space prints the target `x > 4` as a standalone claim
  (checked with a boundary-aware match, not a naive substring — `(1/3)x > 4/3` legitimately contains
  the substring).
- **268-state sweep** (≤4 edits over both transforms, symbol flip, inclusive toggle, all 13 lattice
  endpoints — same reachable count as the twin's): evaluator verdict, branch choice, and every quoted
  number/text match my oracle on **every** state; branch census 1 correct / 8 form / 240 endpoint /
  12 direction / 7 inclusive; **exactly one state grades correct**, `(1, 4, gt)`. The sweep
  instrument is mutation-verified: deleting the form clause from *my* oracle produces detected
  mismatches, so agreement is not two instruments sharing an assumption — my set-equality comes from
  substitution, the evaluator's from boundary/direction/membership structure.
- **The step's thesis is machine-true**: over every reachable state, **no transform press ever
  changes the drawn set** (both factors positive — checked on every edge, not asserted). The wrong
  set is reachable only by the learner's own flip/drag — which is precisely the reachable-wrong-action
  the item wants to make meaningful.
- **SR narration is true of state and narrates the invariance positively** — `÷3`: *"Split both
  sides into 3 equal parts: 3x and 12 become x and 4. **The solution set is unchanged: still
  x > 4.**"*; `×3`: *"…become 9x and 36. The solution set is unchanged: still x > 4."* No boundary
  operation is emitted (nothing moved), and where the twin made the invariant audible by absence,
  this step states it — computed from both states, not asserted. The learner's own flip narrates
  honestly: *"The solution set moved from x > 4 to x < 4."*

### The one-press shape, judged under demand

The demand is objectively the lowest of any interactive in this lesson: one press, and the predict
prompt names it. Knowing S216 QA pre-nominated this exact step, I looked for reasons to refuse it
anyway and did not find one that survives:

- A second required move would add a second variable to what is deliberately a one-variable
  experiment (the twin holds everything else fixed — same window, same boundary 4, same step, same
  three predict beliefs — so the only difference across the pair is the sign of the factor and the
  only observed difference is swing/no-swing).
- Grading set-only is not an alternative: the gate refuses it as begins-solved. The form task is the
  only honest graded act for this state, and the predict carries the conceptual load — the commitment
  ("still" / "reflect" / "slide") is falsifiable and made before the widget appears.
- The reachable wrong action is real and diagnosed in the learner's own terms (flip ⇒ `x < 4` ⇒
  direction branch). A learner fresh from i1's reveal ("the one landmine is … a negative") who
  over-applies the landmine flips here and watches their own set go wrong — the over-generalised-flip
  misconception, enacted at the earliest moment it can exist.
- The step grounds the lesson's own trap corpus: the #1 distractor of k1, i2, i3, k2, k3 and ch1 is
  "flipped on a positive", and all six diagnoses ("Dividing by a POSITIVE n never flips…") now have a
  picture behind them, delivered before the drills.

Verdict: the one-press shape survives — *here*, and only because the predict does the work and the
contrast twin exists. The reachability guard is what keeps "one-press" from ever quietly becoming
"zero-press-possible" elsewhere.

### The pair, read as a pair

Read end to end (course order: 04-01 then 04-02), the contrast lands:

- The **same three beliefs** appear in both predicts and the truth migrates — "still" is right in the
  positive lesson, "reflect" in the negative one, each side's truth serving as the other's tempting
  distractor, in the learner's own recently-heard words.
- The **same picture** — window `[−2, 10]`, boundary 4, step 1 — with opposite behaviour: everything
  is controlled except the sign of the factor. That is a genuine controlled experiment, and it closes
  S216-F3 (the cause of reversal, previously narrated, is now isolated by contrast).
- The forward threading is explicit three times in 04-01 (success: "the half of the rule the next
  lesson breaks"; reveal: "the next lesson's story"; r1's pre-existing teaser) and `course.json`
  confirms 04-02 is literally next. 04-02 does not back-reference 04-01 (it was authored first and is
  now frozen prose) — one-directional threading is the permanent shape; the load-bearing direction is
  the one that exists.
- Distractor tuning differs correctly per lesson: 04-01's "slide" gives a true premise ("both sides
  got smaller" — they did, 3→1 and 12→4) with a false conclusion — the best distractor shape.

Voice niggle: the step body "— this time the number is positive" reads slightly forward — its
contrast anchor at that point is i1's landmine warning, not an experienced flip. True of state,
lightly odd in sequence.

### Findings on this step

**F-A (F5-class, the near-instance of the recurring defect).** The success feedback opens "x > 4,
and **the line never moved**." On every transform-only route that is true. But the route flip →
flip-back → `÷3` grades correct (driven, confirmed) and delivers this message to a learner who
watched the ray swing twice — the model's own narration of their first flip says "The solution set
moved." A history claim, not a state claim, and false of a reachable journey. The twin's authored
phrasing — "the line **finished exactly where it started**" — is true of every route and was
available. Same class as accepted S216-F5; not blocking; the one-line rewording is recorded as
optional polish. (The second clause, "Dividing by a POSITIVE 3 kept every number exactly where it
was," is universally true: every route to correct must press `÷3` at least once — coeff 3·3^(b−a)=1
forces a = b+1 ≥ 1.)

**F-B (inherited F4).** The appended fallback tail ("Test a number on each side…") is still oddly
aimed on the form branch, where the learner's set is already right. Same S215 design, same note.

**F-C.** The reveal's "The ray only ever swings when the divider is negative" is scoped to dividers
and true there; a hyper-literal reading collides with the learner's own flip button swinging the ray.
The twin's reveal handles the same point more carefully. Note only.

---

## 3. ITEM 2 — the reachability guard (`src/lib/schema.ts`)

**The forward-monoid premise is correct, checked in the model, not assumed.** The coefficient is
mutable through exactly one edit — `scaleBothSides` (the coeff slot is locked by design with the
lock reason in the model; `setBoundary`/`setConstant` move only the constant; flip/toggle touch
neither) — so the coefficients a learner can ever hold are `start.coeff × (finite products of the
offered factors)`. **Undo cannot enlarge that set**: `graph.undo()` pops a stack of previously-held
canonical states (`repSyncGraph.ts:442` — pop, push to redo, commit the popped state); it revisits,
never synthesises. Forward-only BFS is therefore the right model.

**The arithmetic is sound where it can run**: reduced integer pairs, gcd exact, sign normalised to a
positive denominator, products exact for anything within the 10^6 magnitude corridor (well under
2^53). `solvedReachable` is seeded with `n === d`, so a coefficient-1 start (a build-a-set task with
no transforms) stays legal — the guard's own test 4 pins that, and I re-checked it.

**Probes through the real `widgetIntegrityErrors`** (all as expected): both shipped ladders pass; a
`×3`-only ladder is refused by name; `transforms: []` with coeff 3 is refused (the S216-F1 trivial
case); a 6-press ladder (start 64, `÷2` only) passes; start 5 with `{÷2, ÷3}` is correctly refused
(5/(2^i·3^j) is never 1 — and the BFS proves it by exhausting the ~137-state lattice under the
bounds, not by luck); start 30 with `{÷2, ÷3, ÷5}` passes at depth 3; the negative twin passes.

**The mutation claim is TRUE, re-run by me**: with `solvedReachable` forced true, **exactly 2 tests
red** (the two refusal tests), 40 pass, in `widgets.numberLineRay.s215.test.tsx`; `schema.ts`
restored byte-identically (sha256-verified).

**F-D — the bounds can false-refuse, and the message then overclaims (found, demonstrated).** The
error string asserts "**no finite sequence** of the offered both-sides transforms reaches it … the
item is **unsolvable as authored**" unconditionally, but the search is bounded (256 states, 10^6
magnitude), and I constructed a schema-legal spec where the bound, not the mathematics, decides:
start coefficient 75600 with `{÷2, ÷3, ÷5, ÷7}` (minimum solve 10 presses; boundary 4, on-lattice,
in-window — every other gate passes) is **refused**, because the reachable lattice exceeds 256 states
before depth 10. The magnitude prune has the same property in principle (the model itself holds
coefficients up to the exact-integer range, far above 10^6). No plausible authored ladder is
anywhere near this frontier — authored ladders are 1–3 presses with ≤2 factors, the comment says so,
and the refusal direction is the safe one; there is **no false-accept path** (reachability is only
ever concluded from an exactly computed product). But a lint surface that can assert a false
proposition about a legal spec is this programme's named defect class, and the fix is one line:
claim "unsolvable" only when the BFS exhausted its queue without hitting the state cap, and
otherwise say "not reachable within the checked bound". → REQUIRED_FIX 2.

Also noted: the guard sits inside the existing `spec.target &&` block, so its own `spec.target`
condition is redundant-but-harmless; and the 256 cap is tested only in the `while` head, so the last
dequeue can add up to |factors| states past 256 — cosmetic, changes no verdict reachable above.

---

## 4. ITEM 3 — the o2 classic-name pin

**The fix direction was right, and the disk proves it.** `widgets.tsx` and `lineFamilyModel.ts`
(home of `deriveEquation`) are byte-identical to the seal — whatever disagreement the first run
found, the widget was not touched; the test's transcription was corrected. And the widget's rule is
the QA-accepted one: S215's Fable-QA drove the flat-line reading itself (its report shows
`m=0 → "line 2: y = 0"`), so `y = 4`, not `y = 0x + 4`, is the shipped surface. Correcting the
transcription was the only defensible direction.

**The transcription now matches the model on every authored pair.** I compared the in-test `eq`
against `deriveEquation`'s `display` by hand on all 10 (m,b) pairs across the six authored specs —
including the flat line `(0, 4) → "y = 4"`, the bare-x cases `(1, 0) → "y = x"`, and
`(−1, 5) → "y = −x + 5"` — and the baseline vitest run (88/88) confirms it against the real DOM.
Divergences exist off-content (fractional slopes: model prints `3/2x`, transcription would print
`1.5x`) — they would fail loudly, which is the safe direction.

**The count claim is wrong as relayed**: there are 6 authored `systemsExplore` specs, of which
**5 are classic** — the pin covers those 5 (the test's own arithmetic: found 6, opted-in 1). The
opted-in `se-01-03` is deliberately outside the *classic* pin's scope. "All 6 classic" was a
miscount.

**F-E — the pin's claim is wider than its check, and the gap is load-bearing (REQUIRED_FIX 1).**
Two defects, one root:

1. The comment says the name "must state both authored equations **and nothing else may change it
   without a deliberate edit here**." The assertion is `svgName.includes(eq(m, b))` per line — an
   inclusion check. A rewrite of the name's frame, or anything appended, passes. The comment asserts
   something false of its own check — the exact S215/S216 lesson ("a check whose scope is narrower
   than its claim"), reproduced in the very test written to close that lesson.
2. Inclusion concretely misses the regression shape the pin was built after. For the two authored
   bare-x cases, `eq = "y = x"`, and `"y = x + 0".includes("y = x")` is **true** — a dropped-term
   formatting regression (the S215 incident class, in reverse) on `iar-02-02` line 1 or `se-01-02`
   line 1 would pass the pin. Likewise `"y = 4"` ⊂ `"y = 4 + 0x"`. The flat-line spec that motivated
   the whole widening is one of the two specs the check is weakest on.

**Pin-shape ruling** (the question asked): an in-test independent derivation is the **right shape
here** — the loop discovers content dynamically, so a derivation auto-covers the next authored spec
where golden literals would silently not, and divergence fails loudly (it already caught one real
gap on its first run, which is independence demonstrated, not drift). A parallel formatter that
*ships* is the bug class this repo hunts; a parallel formatter whose only power is to fail a test is
that class defanged. What is wrong is not the derivation but the **assertion strength**: it must be
full-name equality — the frame is deterministic per spec
(`Line 1 is ${eq(m1,b1)}; line 2 is ${eq(m2,b2)}. Point (${x}, ${y}); ${on/not on} line 1, …`) — or,
at minimum, the delimiter-anchored single string `` `Line 1 is ${eqA}; line 2 is ${eqB}.` ``, which
already kills both the `+ 0` miss (the next character must be `;`/`.`) and inter-equation drift.
Then the comment's claim becomes true of the check.

---

## 5. VERIFICATION LEDGER

| claim | verdict |
|---|---|
| exactly one content file differs from the S216 seal | **TRUE** |
| `9cf879c3… → 169fd191…`, revert-proof reproduces the seal | **TRUE**, byte-for-byte |
| schema diff = one additive guard; o2 diff additive-stricter | **TRUE** |
| "no other test touched" | **FALSE** — s215 test +71 lines (the guard's own tests; additive, undisclosed) |
| `scripts/engine-capabilities.json`, engine, player, `mmipTypes.ts` unchanged | **TRUE** (hash-checked) |
| untouched start grades INCORRECT via the form diagnosis | **TRUE** (driven; Check disabled until first edit) |
| misconception route ÷3+flip → direction diagnosis quoting the learner's own set | **TRUE**; no incorrect feedback states the target |
| one-press-to-correct defensible here | **YES** — see §2; the predict carries the demand |
| guard: forward-only monoid is the right model; undo cannot enlarge reachability | **TRUE** (coeff mutable only via `scaleBothSides`; undo pops held states) |
| bounds cannot false-refuse a legitimate authorable ladder | **TRUE for every plausible ladder** (1–6 presses, ≤3 factors, all probed); **demonstrably false in general** — 256-cap refusal of a schema-legal 10-press/4-factor spec, message then untrue (F-D) |
| both shipped i1b lessons pass the REAL lint path | **TRUE** (`widgetIntegrityErrors` directly, plus `validate:content` 1840/1840, `lint:pedagogy` 1711/1711) |
| mutation: 2 tests red under forced-true | **TRUE**, re-run by me (2 red / 40 pass, restore hash-verified) |
| o2 fix direction (transcription, not widget) | **TRUE** (widget/model byte-identical to seal; S215 QA drove `m=0 → "y = 0"` as shipped) |
| pin covers all 6 classic specs incl. flat line | **FALSE as counted** — 5 classic of 6 authored; flat line covered |
| pin scope = pin claim | **FALSE** — inclusion check vs full-name comment claim; `+ 0` regression shape passes (F-E) |

---

## 6. SCORES AND VERDICTS

Content step at 9.25 weighted; session ships after the two one-line-scale required fixes below.

**VERDICT per item**
- **Content step `tse-04-01/i1b`: ACCEPT** (no changes required; one optional wording improvement, F-A).
- **Reachability guard: ACCEPT with REQUIRED_FIX 2** (message honesty on bound-halted searches — one conditional, one string; verdict logic itself verified correct on all authorable inputs).
- **o2 name pin: REQUIRED_FIX 1** (assertion strength and comment claim must meet; derivation shape itself is right and should stay).

**FAILURES** — none in shipped mathematics. Claims corrected: (1) "no other test touched" is false —
the s215 test file gained the guard's tests, additive and appropriate but undisclosed; (2) "all 6
classic specs" — 5 classic of 6 authored; (3) the o2 pin comment overclaims its check (F-E); (4) the
guard's refusal message overclaims its bounded search (F-D, demonstrated); (5) process: no
`SESSION217_EXECUTION_REPORT.md` or `SESSION217_CONTENT_CHANGE_LEDGER.md` exists on disk at QA time
— second consecutive session; this file is currently the only S217 record.

**REQUIRED_FIXES (pre-seal)**
1. `widgets.mmip.o2.s212.test.tsx`: strengthen the name pin to full-name equality per classic spec
   (expected string constructible from the spec: equations via the existing `eq`, plus the
   deterministic point clause), or minimally the delimiter-anchored
   `` `Line 1 is ${eqA}; line 2 is ${eqB}.` `` single-string inclusion — and make the comment claim
   exactly what the assertion checks. As written, `"y = x + 0"`-shape regressions on the two bare-x
   specs pass the pin, and the comment's "nothing else may change it" is false of the check.
2. `schema.ts` reachability guard: emit "unsolvable as authored" only when the BFS exhausted its
   queue without touching the 256-state cap (and no edge was magnitude-pruned); otherwise phrase the
   refusal as "coefficient 1 not reachable within the checked bound". One flag, one string; no
   verdict changes on any probe above.

Optional (descending value): F-A — replace "the line never moved" with the twin's own
"the line finished exactly where it started" (true of every route); F-B/F-C as recorded; write the
missing S217 execution report and ledger before sealing.

**CONTENT_IMPACT** — one authored step added: `tse-04-01/i1b`, `interactive` between i1 and k1 with
a three-option predict, mirroring the twin's slot. Lesson 11 → 12 steps; `minutes` unchanged at 10
(defensible: one-press solve plus a prediction). No `conceptTag`, no `variant`, no remedial change —
mastery measurement untouched. `numberLineRay` now appears in two content files; the
predict→contrast pair (04-01 no-flip, 04-02 flip) is complete, and five lessons now carry
program-authored causal interactions. Gates at QA: `validate:content` 1840/1840, `lint:pedagogy`
1711/1711, touched-file vitest 88/88.

**NEXT_RECOMMENDED_USE** — (1) First, the two required fixes above; both are minutes, not sessions.
(2) **Do not add a third ray to ch4** — the pair is complete, both lessons are at their budget, and
a third pass would dilute the contrast; the pattern's next instance should be the **inclusive-dot
build-a-set task** (target-only, no transforms — the shape the guard's test 4 keeps legal, e.g.
"draw x ≥ 3"), placed in whichever lesson first *teaches* ≤/≥ reading, so the engine's
filled/open-dot channel — demanded by k2/k3/ch1 and still shown by nothing — finally appears on a
line without a solve ladder attached. (3) The highest-leverage next build remains
**distributionCompareLab's misconception model** (10-lesson reuse, HANDOVER priority 4). (4) Pattern
for the book, from F-E: when a session widens a pin *because* a check's scope was narrower than its
claim, the first thing to review in QA is whether the new check's claim exceeds the new check —
this session reproduced the defect class inside its own remedy, at one remove.

MATHEMATICS 10/10 · MASTERY_GAIN 9/10 · CAUSALITY 9/10 · REPRESENTATIONS 10/10 ·
MISCONCEPTION_TEACHING 9/10 · INTERACTION 9/10 · ACCESSIBILITY 10/10 · POLISH 7/10 ·
**OVERALL 9.25/10** (20/25/15/10/10/10/5/5) ·
**VERDICT: content step ACCEPT · guard ACCEPT + REQUIRED_FIX 2 · pin REQUIRED_FIX 1**
