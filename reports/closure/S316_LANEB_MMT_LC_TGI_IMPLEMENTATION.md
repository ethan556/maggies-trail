# S316 Lane B — Implementation: measure-money-time / limits-continuity / trig-graphs-inverses

Bounded implementation worker. Implements exactly the 7 contracts named by
`S316_LANEB_MEASURE_MONEY_TIME_ASSESSMENT.md`, `S316_LANEB_LIMITS_CONTINUITY_ASSESSMENT.md`, and
`S316_LANEB_TRIG_GRAPHS_INVERSES_ASSESSMENT.md`. Only the 7 named lesson JSON files were touched.
Per task instruction, no `npm`/`vitest`/`tsc` was run; verification below is JSON parse-checking,
a normalized-duplicate scan, direct reading of the relevant schema/widget source, and independent
hand arithmetic.

NDJSON ledger: `reports/closure/cowork-staging/laneB-mmt-lc-tgi-implementation.jsonl` (7 rows, one
per lesson).

## Files touched (7, exactly the scoped set)

- `content/courses/measure-money-time/lessons/mmt-02-01.json`
- `content/courses/measure-money-time/lessons/mmt-04-03.json`
- `content/courses/measure-money-time/lessons/mmt-05-02.json`
- `content/courses/measure-money-time/lessons/mmt-05-03.json`
- `content/courses/limits-continuity/lessons/lc-03-03.json`
- `content/courses/trig-graphs-inverses/lessons/tg-04-01.json`
- `content/courses/trig-graphs-inverses/lessons/tg-05-01.json`

All 7 re-parsed with `json.load` after editing: **7/7 valid JSON.**

---

## measure-money-time / mmt-02-01 — ch1 hints described a nonexistent problem

`ch1` is a `matchPairs` widget: book (9in→10in), key (4in→5in), marker (12in→13in). Its `hints`
described a single 8-inch object that does not exist in this step.

**Change:** replaced the 3 `hints` strings only. No widget, prompt, answer, or feedback field
changed.

```
"hints": [
  "This match has three objects — a book, a key, and a marker — each with its own real length.",
  "The book is about 9 inches, so look for the closest listed number: 10 inches.",
  "Do the same for the key (about 4 inches, closest is 5) and the marker (about 12 inches, closest is 13)."
]
```

**Arithmetic verification:** |9−10|=1, |4−5|=1, |12−13|=1 — every hint number matches the actual
match pairs and the lesson's own "off by 1–2 is fine" rule (`c2`).

## measure-money-time / mmt-04-03 — ch1 hints/explanationVariants described 9:45, widget answer is 2:40

`ch1` mcq: minute hand at 8, hour hand just past 2 → correct option `b` = "2:40" (feedback:
"Yes — 8 five-minute marks is 40 minutes, and the short hand says 2."). `hints` and
`explanationVariants` walked toward 9, 9, 45, 9:45 — none of those numbers exist in this widget.

**Change:** replaced `explanationVariants` and `hints` only.

```
"explanationVariants": [
  "Hour just past 2, minute hand at 8 (40 minutes): 2:40.",
  "8×5=40, so 2:40."
]
"hints": [
  "Check the minute hand first: it's at 8, not 12.",
  "Skip-count: 8 × 5 = 40 minutes.",
  "The hour hand is just past 2, so the time is 2:40."
]
```

**Arithmetic verification:** minute hand at clock-position 8 → 8×5 = 40 minutes (direct
multiplication). Hour hand just past 2, not yet 3 → hour = 2. Time = 2:40, matching the widget's
own correct option and the rejections baked into options `a` ("8×5=40, not 8") and `d` ("short
hand has not reached 3").

## measure-money-time / mmt-05-02 — ch1 hints/explanationVariants argued for the wrong distractor

`ch1` mcq: blue bar 11, green bar 6, "how many more does the blue bar show?" → correct option `a`
= "5" (11−6=5), with option `c` = "11" explicitly labeled wrong ("11 is the blue bar's total, not
how many more it shows"). The `hints`/`explanationVariants` argued the answer was 11 — directly
contradicting the scored option.

**Change:** replaced `explanationVariants` and `hints` only.

```
"explanationVariants": [
  "Blue reaches 11 and green reaches 6; the gap between them is 11 − 6 = 5.",
  "Subtract the two heights: 11 − 6 = 5 more."
]
"hints": [
  "Each gridline is worth exactly 1, so a bar's height is its value.",
  "Blue reaches 11 and green reaches 6 — \"how many more\" asks for the gap between them.",
  "Subtract: 11 − 6 = 5, so the blue bar shows 5 more."
]
```

**Arithmetic verification:** 11 − 6 = 5 (direct subtraction), matching option `a`'s answer and
feedback. Hints/explanations now agree with, rather than contradict, option `c`'s existing
feedback.

## measure-money-time / mmt-05-03 — missing plotData on 4 line-plot steps

`i1`, `k1`, `i3`, `k3` are bare `numeric` widgets narrating a specific line plot in prose with no
rendered visual. `PlotDataSpec` (`src/lib/schema.ts`) supports a display-only `plotData` block,
already used correctly by the sibling grade-2 course `data-line-plots-g2` (e.g. `g2g-01-03.json`
`k3`: `{"values":[4,5],"counts":[2,1]}` on an `mcq`).

**Schema constraint found during implementation, not anticipated by the assessment:**
`PlotDataSpec.values` and `.counts` are each `z.array(...).min(2)` — a single-stack plot
(`{values:[5],counts:[3]}`, as the assessment's literal example proposed) fails schema validation.
To satisfy the 2-value minimum truthfully, each prompt was extended by one honest clause stating
a second, non-conflicting stack; the graded `answer`, `tolerance`, `commonErrors`, and
`fallbackFeedback` for the value actually asked about are untouched and remain literally true.

| Step | New prompt | plotData | answer (unchanged) |
|---|---|---|---|
| i1 | "A line plot shows 3 x's above the number 5 and 1 x above the number 6. How many data points are at 5?" | `{values:[5,6],counts:[3,1]}` | 3 |
| k1 | "A line plot shows 6 x's above the number 8 and 2 x's above the number 9. How many data points are at 8?" | `{values:[8,9],counts:[6,2]}` | 6 |
| i3 | "A line plot shows 2 x's above the number 3 and 1 x above the number 4. How many data points are at 3?" | `{values:[3,4],counts:[2,1]}` | 2 |
| k3 | "A line plot shows 10 x's above the number 6 and 1 x above the number 7. How many data points are at 6?" | `{values:[6,7],counts:[10,1]}` | 10 |

**Arithmetic/schema verification (hand-checked against `plotDataParts`/`plotDataIntegrityErrors`
in `src/lib/schema.ts`):**
- `values.length === counts.length === 2` (≥2 satisfied) for all four.
- Values strictly increasing: 5<6, 8<9, 3<4, 6<7 — all true.
- At least one count > 0 — true for all four.
- No count exceeds `MAX_PLOT_STACK` (10): k3's stack of 10 is exactly at the ceiling, and the
  integrity rule only rejects `c > MAX_PLOT_STACK` (strictly greater), so 10 is allowed — no
  split/reduction needed.
- Every `commonErrors`/`fallbackFeedback` string re-checked against the now-drawn plot: each
  still describes only the narrated value's own stack, unaffected by the added second column.

**k2/ch1 unchanged**, per the assessment: they are numeric comparison items with no specific
line-plot picture claimed in prose.

**Open risk, flagged for a human / follow-up worker (not fixed — out of this packet's 7-file
scope):** `src/lib/content.plotData.s237.test.ts` hardcodes the exact list of every step in the
whole corpus permitted to declare `plotData` — "is declared on exactly the 19 measured steps of
the inline-dataset family" — and asserts the sorted `lesson/step` list equals a literal array.
Adding `plotData` to `mmt-05-03/i1`, `/k1`, `/i3`, `/k3` will make that list length 23 and fail the
assertion until the allowlist is extended to include these four locations. That test file is not
one of the 7 scoped lesson files and was not edited. Gates were not run per task instructions, so
this is a source-reading finding, not an empirically confirmed failure — but it is a virtual
certainty given the literal array comparison in that test.

## limits-continuity / lc-03-03 — i1 graphZoom prompt/feedback claimed unrenderable asymmetry

`i1`'s `graphZoom` widget illustrates (x²+1)/(x−3) near x=3 with `behaviour:"infinite"`. That
render path in `src/components/widgets.tsx` is hard-coded to `1/(d*d)` — always positive, grows
symmetrically on both sides, and can never "dive" on one side. The authored `prompt`/
`successFeedback`/`moreZoomFeedback`/`wrongVerdictFeedback` claimed "opposite directions," "one
side dives, the other climbs," and "two-sided disagreement" — none of which this renderer can
produce.

**Change:** reworded all four fields to direction-neutral language matching this course's own
`lc-04-02` convention (verified by reading `lc-04-02.json`/`i1` directly). No other field
(`behaviour`, `a`, `leftValue`, `rightValue`, `fAtA`, `targetVerdict`, `requiredZoom`) changed —
evaluator truth is untouched.

```
"prompt": "For (x² + 1)/(x − 3), zoom in on x = 3. Do the y-values settle on any number at all?",
"successFeedback": "They never settle — the closer you look, the larger the values grow without bound near x = 3. A vertical asymptote describes the failure, not a value the limit reaches.",
"moreZoomFeedback": "Keep zooming. A limit that exists gets easier to read as you zoom in; this one gets worse instead of settling.",
"wrongVerdictFeedback": "The y-values never settle on a common number near x = 3, so no limit exists here."
```

**Verification:** every remaining claim ("never settle," "grow without bound," "no limit") is true
of `1/d²` as `d→0` from either side, which is exactly what `GraphZoomW`'s `"infinite"` branch
draws for this widget. No claim about which side does what remains.

## trig-graphs-inverses / tg-04-01 — three arcsin(N) steps shared one literal template

`k2` ("What is arcsin(−1/2)?"), `k3` ("What is arcsin(2)?"), and the remedial ("What is
arcsin(0)?") shared one literal surface template despite testing three different jobs
(in-branch negative evaluation, out-of-domain undefined check, boundary identity).

**Change:** reworded `k2` and `k3` prompts only. `options`, `answer`, `feedback`,
`explanationVariants`, `conceptTag`, and `variant` are byte-identical to before.

```
k2: "What is arcsin(−1/2)?" -> "Evaluate arcsin(−1/2): which angle does the branch return?"
k3: "What is arcsin(2)?" -> "arcsin(2): what does the branch return for an input outside sine's range?"
```

Remedial (`rem-tg0401-k`, "What is arcsin(0)?") left unchanged, per the assessment's explicit
lowest-priority guidance (remediation-only track, not shown in the same pass as k2/k3).

**Verification:**
- `arcsin(−1/2) = −π/6`: `sin(−π/6) = −1/2` and `−π/6 ∈ [−π/2, π/2]` — matches unchanged option `o1`.
- `arcsin(2)`: undefined, sine's range is `[−1, 1]` and 2 is outside it — matches unchanged option `o1`.
- Normalized-duplicate scan (digits → `#`) across k1/k2/k3/remedial prompts in this lesson: all
  now distinct strings — `k2`'s and `k3`'s new prompts no longer collapse onto the shared
  `"What is arcsin(#)?"` template; `k1`'s prompt (already distinct, untouched) confirmed clear too.

## trig-graphs-inverses / tg-05-01 — k1/k3 were a genuine Quadrant-II near-duplicate

`k1` ("What is arcsin(sin(5π/6))?", Quadrant II, mirror `π−x`, answer `π/6`) and `k3` ("What is
arcsin(sin(3π/4))?", also Quadrant II, same mirror mechanism, answer `π/4`) tested the identical
method and the identical misconception, differing only in which fraction of π was used.

**Change:** replaced `k3`'s case with a Quadrant-IV input using a genuinely different reduction
mechanism (wrap by subtracting a full turn, rather than the `π−x` mirror), giving the lesson full
quadrant coverage across its check/challenge tier (II via k1, III via ch1, IV via the new k3).
Widget shape (`mcq`), option count (3), and `variant` (`trig-graphs-inverses__tg-composition-trap__mcq`)
left intact, per the assessment's explicit instruction.

```
body: "Predict with the rule." -> "Quadrant IV this time."
prompt: "What is arcsin(sin(3π/4))?" -> "What is arcsin(sin(5π/3))?"
o1 (correct): "π/4" -> "−π/3"
o2: "3π/4" -> "5π/3"           (same-angle trap, still real)
o3: "−π/4" -> "−2π/3"          (new trap: misapplied π−x mirror outside its valid range)
```

**Hand-verified principal values:**
- `sin(5π/3) = sin(300°) = −sin(60°) = −√3/2`.
- `arcsin(−√3/2) = −π/3` (`sin(−π/3) = −√3/2`, and `−π/3 ∈ [−π/2, π/2]`) — matches new `o1`.
- Trap `o2` = `5π/3 ≈ 5.236`: the raw input angle, real and far outside the branch — same-angle
  trap, same misconception family as the other steps in this lesson.
- Trap `o3` = `−2π/3 ≈ −2.094`: `π − 5π/3 = 3π/3 − 5π/3 = −2π/3` — the value a learner gets by
  applying the `π−x` mirror formula (the method taught in `c2`/`k1`/`ch1`) to an input outside the
  interval `[π/2, 3π/2]` where that formula actually recovers the branch angle. `−2π/3` is itself
  outside `[−π/2, π/2]`, so it cannot be a branch output — the trap's feedback names exactly this
  boundary condition, a genuinely new, previously-untaught misconception, not a restatement of
  k1/ch1's traps.
- Trap-vs-answer and trap-vs-trap all numerically distinct: `−π/3 (−1.047)`, `5π/3 (5.236)`,
  `−2π/3 (−2.094)` — no collision.
- Full quadrant/case spread across this lesson's graded steps, confirmed by re-reading all five:
  `k1` QII (`5π/6→π/6`), new `k3` QIV (`5π/3→−π/3`), `ch1` QIII (`7π/6→−π/6`), `k2` safe in-branch
  (`0.4→0.4`), remedial boundary (`π→0`) — no two share both quadrant and reduction mechanism.

---

## Gate status

Per task instruction, `npm`/`vitest`/`tsc` were **not run**. Verification performed instead:

- **Parse-check:** all 7 edited files re-loaded with `json.load` — 7/7 valid.
- **Normalized-duplicate scan** (regex-collapse digits to `#`) run within each of the 7 edited
  lessons, over every step's `widget.prompt`. Findings:
  - `mmt-02-01`, `mmt-04-03`, `mmt-05-02`, `mmt-05-03`: pre-existing same-template duplicates found
    (e.g. `clockSet` "Set the clock to show #:#" across mmt-04-03's i1/k1/i2/i3/k2/k3; mmt-05-03's
    i1/i3/k3 sharing "A line plot shows # x's above the number # and # x above the number #...").
    These are **pre-existing corpus conventions predating this packet's edits** (interactive/
    numeric fill-in-the-value items across a chapter routinely share one template; this was true
    of mmt-05-03's four steps before plotData was added, since the only defect assigned to them
    was the missing visual, not phrasing diversity) and are **not** in scope of any of the 7
    contracts implemented here. Not modified.
  - `lc-03-03`: no normalized-duplicate prompts.
  - `tg-04-01`: no normalized-duplicate prompts (k2/k3 diversification contract satisfied).
  - `tg-05-01`: `k1`/`k3`/`ch1` still normalize to the same `"What is arcsin(sin(#π/#))?"` shape —
    expected and correct per the assessment's own stated criterion for this lesson, which is
    quadrant/mechanism distinctness, not literal-string distinctness (`ch1`'s identical template
    shape versus `k1` was never flagged, precisely because its quadrant and mechanism differ; the
    same reasoning now applies to the recased `k3`). The `normalized-distinct (digits→#)`
    requirement in the task instructions was stated only for `tg-04-01`, not `tg-05-01`.
- **Schema conformance** (manual, by reading `src/lib/schema.ts`): `PlotDataSpec` field
  constraints (min-2 arrays, strictly-increasing values, `MAX_PLOT_STACK`) hand-verified for all
  four `mmt-05-03` additions, as detailed above.
- **Independent hand arithmetic**: every changed numeric claim (clock reading, bar-graph
  subtraction, line-plot counts, `arcsin` principal values, `sin` evaluations) recomputed by hand
  and shown above.
- **One known consequence flagged, not fixed** (out of 7-file scope): `mmt-05-03`'s new
  `plotData` declarations will need `src/lib/content.plotData.s237.test.ts`'s hardcoded 19-step
  allowlist extended to 23 steps by whoever owns that test file — see the mmt-05-03 section above.

No gate was run, so none is claimed green or red; all verification above is source-level and
hand-computed, as instructed.
