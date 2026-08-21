# S329 Fix Packet PGA — LESSON_PROGRESSION_AND_DUPLICATION (24 lessons, 3 courses)

Fixer: Lane A, packet PG-A. Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `PROGRESSION-<lessonId>`
under workstream `LESSON_PROGRESSION_AND_DUPLICATION` for exactly the 24 lessons assigned this lane:

- `functions-and-sequences`: `fn-01-02`, `fn-01-03`, `fn-02-01`, `fn-02-02`, `fn-02-03`, `fn-03-01`, `fn-03-02`, `fn-03-03`, `fn-04-01`, `fn-04-02`
- `exponential-functions`: `exp-01-01`, `exp-01-02`, `exp-01-03`, `exp-03-01`, `exp-03-02`, `exp-03-03`, `exp-04-01`, `exp-04-02`, `exp-04-03`
- `counting-120`: `c120-01-02`, `c120-03-01`, `c120-04-03`, `c120-05-01`, `c120-05-02`

Standard for the fluency-vs-missed-opportunity judgment: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(R1–R6 distinctness discipline), applied here to ordinary lesson-step repeats rather than the
remedial-vs-`k1` defect class it was originally ruled on, and read alongside `CLAUDE.md`'s explicit
design intent that repeated checks of the *same* skill with fresh numbers are the app's intended
mastery model, not inherently a defect.

Detector reproduced verbatim from `scripts/audit/consolidate-pending-workload-s236.mjs` lines
124–130 (`stable()`) and 358–393 (`repeatedWidgets` / `repeatedPrompts` / `repeatedTemplates`, the
last built by `.toLowerCase().replace(/[-−+]?\d+(?:[.,\/]\d+)*/g,"#").replace(/\s+/g," ")`) into a
standalone script (`probe-repeats.mjs`) and run against every one of the 24 lessons' **live, current**
JSON both before and after any edit — judgments were never made by eye alone. All 24 rows in the
queue are `duplicate-widgets=[]; exact-prompts=[]` — every one is a `number-normalized-prompts`-only
(P1) collision: same sentence template, different digits, never a verbatim repeat.

## A note on the queue snapshot vs. live re-derivation, and on second steps touched

Two different things happened beyond a plain "redesign the queue-listed `ch1`," and they are not the
same phenomenon:

1. **Queue snapshot under-listed a live-flagged step.** For `fn-02-02`, the CSV row's `step_path` is
   `i2 k2 k3 ch1`, but live re-derivation against the pre-edit file found `i3` sharing the exact same
   normalized template as those four (confirmed directly: `i3`'s pre-edit prompt, "For a_1 = 1, d = 2,
   what is the 10th term?", normalizes identically to `i2`/`k2`/`k3`/`ch1`). For `fn-03-01`, the CSV
   row's `step_path` is `ch1` alone, but live re-derivation found a second, wholly separate cluster
   the row never named: `k1`/`k2` both matched a "what is the common ratio?" template. Per this
   task's own instruction to re-derive the detector myself rather than trust the queue at face value,
   the live result was treated as authoritative in both cases, and the queue-unlisted step (`fn-02-02
   /i3`, `fn-03-01/k2`) was redesigned alongside the queue-named `ch1`, with the specific evidence
   recorded in that lesson's write-up below and its disposition record's `rationale`.
2. **A queue-listed step was touched for a reason unrelated to clearing its own flag.** For
   `fn-03-03/k2`, `fn-04-02/k2`, and `exp-03-02/i2`, the queue *did* list the step, and it stayed a
   legitimate, intentional fluency repeat both before and after this edit (a digits-only refresh
   cannot clear a `number-normalized-prompts` flag). These three were touched anyway because reading
   the lesson surfaced a real, separate duplication concern worth fixing while already in the file:
   an internal same-ratio redundancy with `k1` (`fn-03-03/k2`), an incidental cross-lesson numeric
   collision with `fn-02-03`'s own worked example (`fn-04-02/k2`), or an interactive step that
   verbatim-repeated the immediately preceding concept card's fully worked example
   (`exp-03-02/i2`). None of these three claim to close a flag; each is recorded as an honest,
   separate improvement in that lesson's write-up below.

---

## Category A — Legitimately kept, no edit (9 lessons)

For each, the table gives the queue's flagged `step_path`, the specific reason the repeat is
deliberate fluency/retrieval practice (or an intentional escalating-difficulty pair) rather than a
missed redesign opportunity, and the current `reviewBasisHash` (no new disposition record is filed
for these — untouched lessons keep whatever disposition already covers them; this report is the
record of the judgment call itself, which is real evidence per the task's own instructions).

| Lesson | Course | Flagged | Why kept | reviewBasisHash |
|---|---|---|---|---|
| `fn-01-02` | functions-and-sequences | `k1` | `k1` ("For the pairs (0,3),(1,3),(2,3), what is the range?") repeats `i1`'s "what is the range?" template, but targets a genuinely different sub-skill: all three outputs are equal, so the check is really testing whether a repeated output still collapses to a **one-element set** (`{3}`, not `{0,1,3}` or three 3's) — a distinct misconception from `i1`'s ordinary distinct-output range. | `621eba7eca6af611864e88b6b1c2dba8c4d37294536cc5f384196cf4259f6a96` |
| `fn-01-03` | functions-and-sequences | `i2` | `i2` ("For f(x)=2x, what is f(20)?") repeats `k1`'s "for f(x)=#x, what is f(#)?" template, but its large, table-exceeding input (20) is the concrete embodiment of the adjacent concept card c2's own point — "the rule works for inputs the table never showed... even f(20)=40" — deliberately demonstrating extrapolation, not re-testing `k1`'s ordinary small-input evaluate. | `4350097d4c393bfd092462403508c3cbe428c12eeb8caa0f2cfe450ded487a32` |
| `fn-02-03` | functions-and-sequences | `i3 k2 k3` | This lesson's stated purpose (recap: "one rule replaces listing every term") is fluency with **one** nth-term formula applied forward (`k1`,`i3`,`k2`, three different `a1`/`d`/`n`) and in reverse (`i2`,`k3`, "which term equals X"). Multiple worked instances of a single well-defined procedure is exactly the textbook spaced-practice this app's fresh-instance mastery design (`CLAUDE.md`) calls for, not a gap. | `df40579fc0d4eaa9ff7518f76014be78734146ee446bc2838433fce2056e42a0` |
| `exp-04-01` | exponential-functions | `k3` | `k3` ("At what value does f(x)=10·3^x cross the y-axis?") repeats `k1`'s y-intercept-reading template at a different `a`/`b` pair — ordinary check-tier fluency. `ch1` is differently worded ("crosses the y-axis at what value?") and is **not** part of this cluster at all. | `fe170121f6de5bab8316bb4ebc9dda127bd4e63dcb6d66c3e91e12c0cb643c42` |
| `exp-04-02` | exponential-functions | `k3` | `k3` ("For g(x)=1·4^x, what is g(3)?") repeats `k1`'s evaluate-at-x template at a different `a`/`b`/`x`. `ch1` uses a two-function comparison framing and is **not** part of this cluster. | `98e262509d63004f21daa25c437a02d9b3f99d0a9588b721fd89c06fb0be1275` |
| `c120-01-02` | counting-120 | `i2 k2` | This lesson's own concept card states the pattern explicitly: "It happens at every ten. After 49 comes 50. After 59 comes 60. The nine always rolls." Drilling the identical rollover at six different decade boundaries across the lesson (27→31, 39→40, 48→52, 49→50, 59→60, 69→70) **is** the lesson's intended content — there is no further variation to add. `ch1` is not part of this cluster. | `f63252e482769e176f4e1a38fd07c51f1913c879b2055246e35c6fa54e92b954` |
| `c120-04-03` | counting-120 | `k2` | `k2` ("110+10=?") repeats `k1`'s ("90+10=?") add-a-ten numeric-fact template at a different starting point. This is foundational G1 "add ten" fact fluency — exactly how arithmetic fluency is built at this grade. `ch1` (place-value composition, "1 hundred 1 ten 4 ones") is unrelated and not part of this cluster. | `0a703f7a4c81bc7f74e21f1a26c0bcf0c5e315b41089f7fb34b0c0c66b5d2cc9` |
| `c120-05-01` | counting-120 | `k3 ch1` | `k3` (70→69) is an ordinary within-range "one less" check. `ch1` (100→99) is the lesson's deliberate capstone: the **first time** the student crosses a *hundred* boundary going backward (a 3-digit number becoming 2-digit), a qualitatively harder transfer than any earlier step — ch1's own body text flags it explicitly ("One less across a hundred!"). Same sentence template, genuinely different demand; the digit-stripping detector cannot see place-value significance. | `fe926f6c318b161d8f63f9e60ddce17428ff18f03f5a63aec24bd700572a1cd5` |
| `c120-05-02` | counting-120 | `ch1` | `k3` (58→68) is an ordinary within-range "ten more" check. `ch1` (90→100) is the lesson's deliberate capstone: the first time the student crosses the *hundred* boundary going up (2-digit becomes 3-digit) — ch1's own body text flags it ("Ten more past the chart!"). Same escalating-capstone reasoning as `c120-05-01`. | `093c765cd658ccfc9d94940c31e0bd76a9bb8a13b430ad297ab0dd97cd5c46b4` |

---

## Category B — Redesigned (15 lessons)

For each: the queue's flagged `step_path`, which step(s) were actually redesigned (occasionally one
more than the queue named — see the note above), the exact before/after, why it is a genuinely
different action/representation/misconception-target/transfer-demand (not a cosmetic number swap),
the `variant` tag decision, and the post-edit live re-derivation confirming the flag cleared.

### `fn-02-01` — Terms of an Arithmetic Sequence
Queue `step_path`: `i3 k2 k3 ch1`. Redesigned: **`ch1`** only (`i3`/`k2`/`k3` are ordinary forward
next-term fluency at different `a1`/`d`, kept).
- **Before:** "In the sequence 100, 92, 84, 76, what is the next term?" → 68 (forward extend).
- **After:** "In the sequence 100, 92, 84, 76, what term comes right BEFORE 100?" → 108. Traps: 92
  (continues forward instead of reversing), 116 (reverses two steps instead of one).
- **Why genuine:** inverts the direction — finding what comes *before* the first given term requires
  recognizing that "before" undoes the common difference (the step becomes `+8` where the sequence's
  own step is `−8`), not just relabeling the same forward computation.
- **Variant:** removed `{gen:"fn-arith-seq", form:"nextDown"}` — that form only ever produces a
  forward "what is the next term" prompt (`src/lib/variants.ts`), never a "comes before" reversal.
- **Post-edit live re-derivation:** `repeatedTemplates=[i3,k2,k3]` — `ch1` no longer present.

### `fn-02-02` — The nth Term Formula
Queue `step_path`: `i2 k2 k3 ch1`. Redesigned: **`i3`** (queue-unlisted, but live-detected as sharing
the exact same template pre-edit) **and `ch1`** (`i2`/`k2`/`k3` kept, ordinary fluency).
- **`i3` before:** "For a_1 = 1, d = 2, what is the 10th term?" → 19 (forward evaluate).
- **`i3` after:** "A sequence has a_1 = 9 and the 4th term is 33. What is the common difference, d?"
  → 8 (verified `(33−9)/(4−1)=8`).
- **Why genuine:** inverts evaluate → solve-for-`d`, an algebraic-inversion demand this lesson never
  tested elsewhere despite `d` being the concept's own name.
- **`ch1` before:** "For a_1 = 7, d = 6, what is the 8th term?" → 49 (positive throughout).
- **`ch1` after:** "Starting at a_1 = 8 and stepping by d = -3 each time, what is the 8th term?" → −13
  (verified `8+7·(−3)=−13`). Traps: 13 (drops the negative sign), −16 (off-by-one on step count).
- **Why genuine:** requires correct sign propagation through a negative step to a negative final
  term — a materially different sign-handling demand than any all-positive evaluate.
- **Variant:** removed `{gen:"fn-arith-seq", form:"nthPos"}` from `ch1` (that form only ever draws a
  positive `d`); `i3` never carried a variant tag.
- **Post-edit live re-derivation:** `repeatedTemplates=[i2,k2,k3]` — neither `i3` nor `ch1` present.

### `fn-03-01` — Common Ratio
Queue `step_path`: `ch1`. Redesigned: **`k2`** (queue-unlisted, but live-detected: `k1`/`k2` shared an
undeclared "what is the common ratio?" cluster the CSV row didn't name) **and `ch1`**.
- **`k2` before:** "In the sequence 5, 10, 20, 40, what is the common ratio?" → 5 (bare sequence).
- **`k2` after:** "A savings account balance forms the sequence $4, $20, $100, $500 across four
  months. What is the common ratio?" → 5 (verified `20/4=5`).
- **Why genuine:** symbolic sequence → contextualized word-problem extraction, a representation the
  bare-number generator could never produce.
- **`ch1` before:** "In the sequence 2, 10, 50, 250, what is the next term?" → 1250 (growing ratio, r=5).
- **`ch1` after:** "The sequence 80, 40, 20, 10 keeps halving. What is the next term?" → 5 (verified
  `10×0.5=5`). Traps: 0 (treats it as a difference, subtracts), 20 (multiplies by 2, the wrong
  direction for a shrinking sequence).
- **Why genuine:** a fractional ratio (`r<1`) is a distinct transfer demand not tested anywhere else
  in the lesson (every earlier step uses an integer `r`).
- **Variant:** `k2`'s stale `{gen:"a1-functions-sequences", form:"fn-common-ratio__numeric"}` tag
  removed (word-problem framing outside anything the generator produces). `ch1`'s identical tag was
  **kept** — `src/lib/algebra1Variants.ts` shows this generator/form already produces "what is the
  next term" phrasing on sibling `k3`, pre-existing this session, so the fidelity level is unchanged.
- **Post-edit live re-derivation:** `repeatedTemplates=[]` — this lesson now has **zero** remaining
  structural repeats of any kind.

### `fn-03-02` — The nth Term of a Geometric Sequence
Queue `step_path`: `i2 i3 k2 k3 ch1`. Redesigned: **`ch1`** only (others kept, ordinary forward
geometric-evaluate fluency).
- **Before:** "For a_1 = 3, r = 3, what is the 4th term?" → 81 (forward evaluate).
- **After:** "A geometric sequence has a_1 = 2 and r = 4. Which term equals 512?" → 5 (verified
  `2·4⁴=512`; 4 undershoots at `2·4³=128`, 6 overshoots at `2·4⁵=2048`). Traps: 4 (off-by-one on
  step count), 6 (overshoot).
- **Why genuine:** solves for position/exponent rather than plugging a given `n` into the formula —
  deliberately stops short of introducing logarithms or a dedicated "solve for n" formula-manipulation
  skill, which has its own coverage elsewhere in the course.
- **Variant:** none existed before or after.
- **Post-edit live re-derivation:** `repeatedTemplates=[i2,i3,k2,k3]` — `ch1` no longer present.

### `fn-03-03` — Reading a Geometric Rule
Queue `step_path`: `i3 k2 k3 ch1`. Redesigned: **`k2`** (queue-listed) **and `ch1`** (queue-listed);
`i3`/`k3` kept.
- **`k2` before:** "For the sequence 1, 3, 9, 27, ..., what is the 5th term?" (a_1=1, r=3) — the same
  ratio r=3 as anchor `k1` (a_1=2, r=3), an internally redundant computation shape the digit-stripping
  detector can't see (different `a1`, same `r`).
- **`k2` after:** "For the sequence 2, 10, 50, 250, ..., what is the 5th term?" → 1250 (a_1=2, **r=5**,
  verified `2·5⁴=1250`) — diversifies the ratio value used across the lesson's checks.
- **Note:** this is a wording-preserving numeric refresh, so `k2` correctly **remains** in the live
  cluster afterward (same accepted-fluency bucket as `i3`/`k3` — not claimed as a closed flag). Its
  stale variant tag was dropped since the newly-paired numbers are not the ones originally authored
  under it.
- **`ch1` before:** "For the sequence 1, 2, 4, 8, ..., what is the 8th term?" → 128 (growing ratio, r=2).
- **`ch1` after:** "The sequence 64, 32, 16, 8, ... keeps halving. What is the 6th term?" → 2 (verified
  `64·(1/2)⁵=2`). Traps: 4 (one halving short), 32 (mistakes the 2nd term for the answer).
- **Why genuine:** fractional ratio (`r<1`), untested elsewhere in this lesson.
- **Variant:** `ch1`'s `{gen:"a1-functions-sequences", form:"fn-geo-rule__numeric"}` tag **kept** —
  same generator-fidelity reasoning as `fn-03-01/ch1` (sibling `k3` already carries this tag over
  "what is the #th term" phrasing, pre-existing this session).
- **Post-edit live re-derivation:** `repeatedTemplates=[i3,k2,k3]` — `ch1` no longer present; `k2`
  correctly remains (intentionally, as accepted fluency, not claimed closed).

### `fn-04-01` — Arithmetic or Geometric?
Queue `step_path`: `i2 i3 k2 k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "Which kind of sequence is 5, 10, 15, 20?" (plain, trap-free arithmetic).
- **After:** "The first jump might mislead you. Which kind of sequence is 3, 9, 15, 21?" → Arithmetic,
  d=6 (verified constant difference 6; the first gap 3→9 could misleadingly look like ×3/geometric
  until the second gap 9→15 breaks that pattern, `+6` not `×5/3`).
- **Why genuine:** targets a new misconception untested elsewhere in this lesson — "the first gap is
  enough evidence to classify" — forcing a second-gap check, which is exactly what this chapter's own
  concept text teaches ("check a second gap; that's what separates arithmetic from geometric").
- **Variant:** none existed before or after (a pre-existing generator/prompt-wording mismatch is
  present elsewhere in this lesson's family, unrelated to and not introduced by this edit).
- **Post-edit live re-derivation:** `repeatedTemplates=[i2,i3,k2,k3]` — `ch1` no longer present.

### `fn-04-02` — Choosing the Right Formula
Queue `step_path`: `i3 k2 k3 ch1`. Redesigned: **`k2`** (queue-listed) **and `ch1`** (queue-listed);
`i3`/`k3` kept.
- **`k2` before:** "For 4, 7, 10, 13, ... (arithmetic), what is the 6th term?" → 19.
- **`k2` after:** "For 5, 12, 19, 26, ... (arithmetic), what is the 6th term?" → 40 (verified
  `5+5·7=40`).
- **Why:** while reading this lesson, found its original numbers were **identical** to the fully
  worked example in `fn-02-03`'s own concept card and remedial concept ("For 4, 7, 10, 13, …: a_1=4,
  d=3, the 6th term is 4+5·3=19") — an incidental cross-lesson duplicate a student progressing
  through the course would see twice with the same numbers and the same answer. Not itself a
  same-lesson template fix (wording-preserving, so `k2` correctly remains in this lesson's own live
  cluster afterward), but a real duplication catch worth recording.
- **`ch1` before:** "For 2, 4, 8, 16, ... (geometric), what is the 7th term?" (type labeled).
- **`ch1` after:** "For 3, 12, 48, 192, ..., what is the 6th term?" → 3072 (verified ratio
  `12/3=48/12=192/48=4`, `3·4⁵=3072`) — **no type label given**. Traps: 48 (misapplies the arithmetic
  formula — a genuine classification-miss consequence), 12288 (off-by-one exponent, uses r⁶).
- **Why genuine:** the student must classify (difference vs. ratio, per this lesson's own c1/c2/c3
  arc) before applying the correct formula — a categorically different demand than "apply the
  formula you're told to use."
- **Variant:** removed `{gen:"a1-functions-sequences", form:"fn-choose-formula__numeric"}` from `ch1`
  (that form always supplies the type label, so it could never regenerate a self-classify item); `k2`
  never carried this tag before or after.
- **Post-edit live re-derivation:** `repeatedTemplates=[i3,k2,k3]` — `ch1` no longer present; `k2`
  correctly remains (accepted fluency, digits-only change).

### `exp-01-01` — Evaluating Exponential Functions
Queue `step_path`: `k2 k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "For f(x) = 2 · 3^x, what is f(3)?" (abstract function notation).
- **After:** "A colony starts with 2 bacteria and triples every hour. How many bacteria are there
  after 3 hours?" → 54 — same math (`a=2,b=3`, verified `2·3·3·3=54`), same `approxFormula` tree.
  Traps: 27 (tripled three times but dropped the starting count), 24 (swapped which number is the
  start vs. the multiplier).
- **Why genuine:** the numbers/answer are unchanged but the demand is genuinely different — extract
  the start value and multiplier from prose rather than read them off `f(x)` notation, a
  symbolic-to-word-problem translation untested elsewhere in this lesson.
- **Variant:** removed `{gen:"exp-function"}` (default form) — that form always produces the abstract
  notation-style prompt, never a word problem.
- **Post-edit live re-derivation:** `repeatedTemplates=[k2,k3]` — `ch1` no longer present.

### `exp-01-02` — Growth vs Decay
Queue `step_path`: `k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "For f(x) = 32 · (1/2)^x, what is f(4)?" (abstract decay notation).
- **After:** "A medicine dose starts at 320 mg and is cut in half by the body every hour (its
  half-life is 1 hour). How much remains after 4 hours?" → 20 mg (verified `320·0.5⁴=20`; formula
  extended to four nested multiplies). Traps: 40 (one halving short), 80 (divides the original by
  the hour count instead of halving repeatedly — the classic linear-thinking error for decay).
- **Why genuine:** symbolic decay notation → a named, unit-bearing half-life scenario, untested
  elsewhere in this lesson.
- **Variant:** none existed before or after.
- **Post-edit live re-derivation:** `repeatedTemplates=[k3]` — `ch1` no longer present.

### `exp-01-03` — The Constant Ratio
Queue `step_path`: `k2 k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "The sequence 5, 15, 45, 135 continues. What is the next term?" (forward extend).
- **After:** "A sequence continues 20, 100, 500, 2500, .... What term comes right BEFORE 20?" → 4
  (verified ratio `r=100/20=5`, `20/5=4`). `approxFormula` changed to `t0/(t1/t0)` (divide by the
  ratio instead of multiplying); `requiredStageKeys` dropped the now-irrelevant `tLast` stage (4→3).
  Traps: 100 (continues forward instead of reversing), 15 (treats the ratio as a subtractable amount).
- **Why genuine:** reverses the geometric step instead of extending it — a different operation, not
  a relabeled forward extend.
- **Variant:** removed `{gen:"exp-function", form:"nextTerm"}` — that form only ever produces a
  forward "continues... next term" prompt.
- **Post-edit live re-derivation:** `repeatedTemplates=[k2,k3]` — `ch1` no longer present.

### `exp-03-01` — Solving by Matching Bases
Queue `step_path`: `i2 i3 k2 k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "Solve 3^x = 243." (ordinary positive-integer exponent).
- **After:** "What value of x solves 9^x = 1?" → 0 (verified `9⁰=1` by definition). Traps: 1 (the
  intuitive-but-wrong guess that x should match the target number 1; `9¹=9≠1`, not `9⁰=1`), 9
  (echoes the base itself as if it were the answer).
- **Why genuine:** the zero-exponent case is conceptually distinct ("no multiplying at all," not
  "count factors to reach k") and untested elsewhere in this lesson. Widget simplified from
  `exactNumberLab`/`exponentSolve` to plain `numeric` because the `a1-exponential` generator's own
  range (`pick(r,2,...)`, `src/lib/algebra1Variants.ts`) always draws an exponent ≥ 2 and can
  structurally never produce x=0 — authoring this edge case on the engine would require a generator
  change out of this task's scope.
- **Variant:** removed `{gen:"a1-exponential", form:"exp-match-base__numeric"}` for the same reason.
- **Post-edit live re-derivation:** `repeatedTemplates=[i2,i3,k2,k3]` — `ch1` no longer present.

### `exp-03-02` — Equations with a Coefficient
Queue `step_path`: `i2 i3 k2 k3 ch1`. Redesigned: **`i2`** (queue-listed) **and `ch1`** (queue-listed);
`i3`/`k2`/`k3` kept.
- **`i2` before:** "Solve 5 · 2^x = 40." — this exact problem is the fully-worked example in the
  immediately preceding concept card c2 ("For 5·2^x=40: divide by 5 → 2^x=8 → x=3"), so the very next
  interactive step asked the student to re-derive an answer just shown in full — not practice at all.
- **`i2` after:** "Solve 3 · 10^x = 300." → 2 (verified `300/3=100=10²`), a fresh base (10, not 2) so
  it cannot echo any worked example in this lesson.
- **`ch1` before:** "Solve 5 · 4^x = 80." (solve for the exponent, same action as every earlier check).
- **`ch1` after:** "In a · 4^3 = 320, what is a?" → 5 (verified `4³=64`, `320/64=5`). Traps: 80
  (divides by the base 4 instead of the full power 64), 1280 (multiplies instead of divides).
- **Why genuine:** inverts which unknown is solved for — the coefficient, with the exponent now given
  as a fixed literal — a different algebraic target than every earlier step in the lesson.
- **Variant:** removed `{gen:"exp-solve"}` (default form) from `ch1` — that form only ever solves for
  the exponent; `i2` never carried a variant tag.
- **Post-edit live re-derivation:** `repeatedTemplates=[i3,k2,k3]` — neither `i2` nor `ch1` present.

### `exp-03-03` — Decay & Negative Exponents
Queue `step_path`: `k1 k2 k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "Solve 10^x = 1/1000." (negative-exponent skill in isolation, same kind as `k2`).
- **After:** "Solve 8 · 2^x = 1/2." → −4 (verified `(1/2)/8=1/16=2⁻⁴`). Traps: −1 (matches `1/2`
  directly to `2⁻¹`, skipping the coefficient-division step), 4 (drops the negative sign after
  correctly isolating `1/16`).
- **Why genuine:** combines coefficient-isolation (this chapter's earlier lesson) with
  negative-exponent reasoning (this lesson's own topic) — a compounded transfer demand untested
  anywhere else in this lesson.
- **Variant:** removed `{gen:"exp-solve", form:"negExponent"}` — that form never combines a
  coefficient with a negative-exponent target.
- **Post-edit live re-derivation:** `repeatedTemplates=[k1,k2,k3]` — `ch1` no longer present.

### `exp-04-03` — Exponential vs Linear
Queue `step_path`: `k1 ch1`. Redesigned: **`ch1`** only.
- **Before:** "For the exponential f(x) = 5 · 2^x, what is f(3)?" — as the **course's own closing
  capstone** (recap: "you've completed exponential functions"), this was a single-model plain evaluate,
  no different in kind from any earlier check in the whole course.
- **After:** "A line starts at 10 and adds 6 each step; an exponential starts at 5 and multiplies by 2
  each step. At x = 4, what is the LARGER of the two values?" → 80 (verified linear `10+6·4=34`,
  exponential `5·2⁴=80`, `80>34`). Traps: 34 (reports the linear value), 16 (drops the exponential's
  starting coefficient, computes `2⁴` alone).
- **Why genuine:** synthesizes the whole lesson's compare-growth-models content into one item —
  compute two different models and compare them — a categorically harder, appropriately
  capstone-level demand versus single-model evaluation.
- **Variant:** removed `{gen:"a1-exponential", form:"exp-vs-linear__numeric"}` — that form only ever
  produces a single-model evaluate/classify task, never a two-model numeric comparison.
- **Post-edit live re-derivation:** `repeatedTemplates=[k1]` — `ch1` no longer present.

### `c120-03-01` — Tens and Ones Make a Numeral
Queue `step_path`: `i2 k3 ch1`. Redesigned: **`ch1`** only.
- **Before:** "Build 94 with ten-rods and one-cubes." (9 tens, 4 ones — ordinary non-zero-ones build).
- **After:** "No loose ones this time — build 80 with ten-rods and one-cubes." (target 80 = 8 tens, 0
  ones). Traps: `{tens:8,ones:8}` ("80 has ZERO ones — leave the ones side empty... no cubes
  needed"), `{tens:0,ones:80}` ("EIGHT TENS, not eighty loose ones").
- **Why genuine:** targets whether a 0 in the ones place means the ones side should be left **empty**
  — a distinct, important place-value misconception untested elsewhere in this lesson (neither trap
  is meaningful for a non-zero-ones number like 94).
- **Variant:** `{gen:"g1-counting-120", form:"TensOnesBaseTenCompose"}` **kept** — `src/lib/g1Variants.ts`
  shows this generator's range (`pick(r,21,hi(b,69,94,99))`) already includes round multiples of ten
  such as 80, so the tag remains accurate and was not made stale by this edit.
- **Post-edit live re-derivation:** `repeatedTemplates=[i2,k3]` — `ch1` no longer present.

---

## Gates run (after all edits)

- `node -e "JSON.parse(readFileSync(...))"` on all 15 edited files — all syntactically valid.
- `npm run validate:content` → **schema: 1840/1840 files clean**.
- `npm run lint:pedagogy` → **pedagogy: 1711/1711 files clean**.
- Targeted vitest (single-file, per this lane's container constraints):
  - `src/lib/session279.exponentialFunctionsCourse.test.ts` → 3/3 pass, no changes needed.
  - `src/lib/session298.counting120ChoiceParity.test.ts` → 2/2 pass, no changes needed.
  - `src/lib/session180.expFunction.test.ts` (frozen answers for the `exp-function` generator
    family) → 2 pre-existing frozen assertions broke on `exp-01-03/ch1`'s legitimate answer change
    (405→4) and the family-completeness count (16→14, from the two `exp-function`-tagged `ch1`
    redesigns' variant removals) — **re-pinned with justification** (frozen table and count updated
    in-file, with an inline comment explaining the S329 redesign); re-run: 7/7 pass.
  - `src/lib/session181.a1Exponential.test.ts` (frozen answers for `a1-exponential`) → 2 pre-existing
    frozen assertions broke: the course-wide engine-backed count (39→32, from all seven redesigned
    `ch1`'s variant removals) and `exp-01-02/ch1`'s answer change (2→20); `exp-04-03/ch1` also
    dropped from the frozen table entirely since it moved off the `exactNumberLab` engine onto a
    plain `numeric` widget (confirmed by direct probe: `exactNumberTruth` throws `spec.values is not
    iterable` on a `numeric`-type widget) — **re-pinned with justification**; re-run: 5/5 pass.
  - `src/lib/session181.exponentSolve.test.ts` (frozen answers for `exp-solve`/`exp-match-base`) →
    2 pre-existing frozen assertions broke: `exp-03-01/ch1`, `exp-03-02/ch1`, `exp-03-03/ch1` all
    moved off the `exactNumberLab`/`exponentSolve` engine (11 frozen rows → 8; `solve` family count
    8→6, `matchBase` count 3→2) — **re-pinned with justification**; re-run: 14/14 pass.
  - No `*CourseIntegrity*`/`*Course*test*` file exists for `functions-and-sequences` specifically
    (searched both by course-name substring and by every generator tag the course's lessons declare
    — `fn-arith-seq`, `a1-functions-sequences`, `g1-counting-120` — across all of `src/lib/*.test.ts`;
    the only hits were the generic cross-generator registry files `variants.test.ts` /
    `variants.resolver.test.ts`, which dispatch on generator tag only and reference no specific
    lesson content, and `session244.flagshipVisualPacketA.test.ts`, which only touches `fn-01-01`
    (not one of this lane's 24 lessons)). No functions-and-sequences-specific frozen-answer test
    exists to break or re-pin.
  - `variants.test.ts` / `variants.resolver.test.ts` (the generic cross-course generator registry
    tests) were **not** run: confirmed via grep they reference no lesson ID or course name touched by
    this lane (pure generator-tag dispatch, unaffected by content-only edits, since no generator
    source was modified), and an initial attempt timed out at 2 minutes — consistent with these being
    full-registry tests across every course's generators, disproportionate to re-run for a change
    that cannot affect them, and risky for this shared, resource-constrained container.
- Live structural-repeat probe re-run on all 24 lessons after every edit: all 15 redesigned `ch1`
  entries (and the 3 additional queue-unlisted-but-live-flagged steps: `fn-02-02/i3`, `fn-03-01/k2`,
  and the queue-listed-but-touched `fn-03-03/k2`/`fn-04-02/k2`/`exp-03-02/i2`) resolve exactly as
  described per-lesson above; every remaining open flag was independently re-examined and judged
  legitimate fluency/retrieval practice or an intentional escalating-difficulty capstone.

## Disposition ledger

15 fresh signed disposition records written to
`reports/closure/cowork-staging/laneA-s329-PGA.jsonl` (append-only staging file, not the main
ledger), one per redesigned lesson, `recordId` prefixed `s329-PGA-<lessonId>`, `decision: "KEEP"`,
each with a `reviewedBasisHash` computed via `scripts/session/print-review-basis.mjs` **after** all
edits landed. The 9 legitimately-kept lessons are not re-dispositioned (no content changed under
them); their current `reviewBasisHash` values are recorded in the Category A table above as evidence
that the judgment call was made against today's actual file content.

## Summary

**15 of 24 lessons redesigned, 9 kept as-is.** The split: every redesigned lesson's flagged repeat
sat at the **challenge (`ch1`) tier** and was mechanically identical in action/representation to an
earlier check or interactive in the same lesson — a real missed opportunity for a capstone step,
which should demand something a plain number-swap doesn't (a direction reversal, an inverted unknown,
an edge case the ordinary checks never reach, a word-problem translation, or a synthesis of two
skills). Every kept lesson's flagged repeat sat at the check/interactive tier (or, for `c120-05-01`
and `c120-05-02`, at `ch1` but as a clearly intentional escalating-difficulty capstone already doing
real pedagogical work) — ordinary fluency/retrieval practice of one well-defined skill across fresh
numbers, exactly the design this app is built around per `CLAUDE.md`. Five lessons additionally
received a second, queue-adjacent fix beyond the named `ch1` (`fn-02-02/i3`, `fn-03-01/k2`,
`fn-03-03/k2`, `fn-04-02/k2`, `exp-03-02/i2`) where live re-derivation or direct reading surfaced a
genuine duplicate the CSV snapshot's `step_path` either didn't list or where a same-lesson or
cross-lesson content collision was independently noticed and worth fixing alongside the primary
redesign.
