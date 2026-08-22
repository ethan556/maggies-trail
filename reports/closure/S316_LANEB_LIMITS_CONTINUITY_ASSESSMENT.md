# S316 Lane B — Independent Assessment: limits-continuity

Reviewer: Claude Cowork independent assessor (limits-continuity S316)
Reviewed: 2026-08-20T01:27:43.000Z
Scope: `content/courses/limits-continuity/course.json` + all 15 lessons in
`content/courses/limits-continuity/lessons/`. Read-only review; dispositions staged to
`reports/closure/cowork-staging/laneB-limits-continuity-dispositions.jsonl` (15 NDJSON lines, one
per lesson). This report does not write to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`.

Authority note: per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, this assessment treats the
repository source as authoritative and does not consult or rely on any ChatGPT Work cache entry.

## Course summary

`limits-continuity` (grade 12, "Precalculus: Limits & the Doorway to Calculus") has 5 chapters and
15 lessons:

| Chapter | Lessons |
|---|---|
| ch1 Limits Graphically & Numerically | lc-01-01, lc-01-02, lc-01-03 |
| ch2 Limit Laws & Algebraic Evaluation | lc-02-01, lc-02-02, lc-02-03 |
| ch3 One-Sided Limits & Limits at Infinity | lc-03-01, lc-03-02, lc-03-03 |
| ch4 Continuity & the IVT | lc-04-01, lc-04-02, lc-04-03 |
| ch5 Rate of Change & the Derivative | lc-05-01, lc-05-02, lc-05-03 |

The course builds a coherent chain: the approach-not-arrival idea of a limit → reading limits from
tables/graphs → why limits fail (jump / unbounded / oscillation) → limit laws and direct
substitution → resolving 0/0 by factoring → resolving 0/0 with a square root by the conjugate →
one-sided limits as the building block that decides two-sided existence → limits at infinity via
degree comparison → the full top/equal/bottom-degree end-behavior menu → the three-condition
definition of continuity → classifying discontinuities as removable/jump/infinite → the IVT and
sign-change root bracketing → average rate of change (secant slope) → the derivative as
lim_{h→0} of the difference quotient → infinite series as another instance of the same limit
machine. Every limit, continuity classification, IVT sign check, degree-comparison end-behavior
claim, derivative evaluation, and series sum in the course was independently recomputed by hand
during this review (see per-lesson verdicts below). Every `exactNumberLab`/`secantSlope` widget's
authored parameters (`polyCoefficients`, `approxFormula`+`approxConstants`, `limDegNum`/
`limDegDenom`/`limLeadNum`/`limLeadDenom`, `curve`/`a`/`targetH`) were checked against
`src/lib/evaluate.ts`'s shared grading functions (`curveAt`, `curveSlopeAt`, `secantSlopeOver`) and
`src/lib/schema.ts`'s `rationalLimitAtInfinity`/`polynomialEvaluate` cases to confirm the graded
answer and the printed explanation agree by construction. One `graphZoom` visual defect was found
(lc-03-03); no other arithmetic or logic error was found anywhere in the course.

## Decision counts

- **KEEP: 14** — lc-01-01, lc-01-02, lc-01-03, lc-02-01, lc-02-02, lc-02-03, lc-03-01, lc-03-02,
  lc-04-01, lc-04-02, lc-04-03, lc-05-01, lc-05-02, lc-05-03
- **REVISE: 1** — lc-03-03
- **ESCALATE: 0**

## REVISE list (one-phrase reason)

- **lc-03-03** (End Behavior: The Full Picture) — step i1's `graphZoom` prompt/feedback claim an
  asymmetric ("opposite directions," "one side dives, the other climbs") vertical-asymptote
  visual that the widget's `behaviour:"infinite"` rendering path cannot produce — it is hard-coded
  to a symmetric, always-positive 1/(x−a)² curve, so the promised visual does not render the real
  relationship described.

## Notable findings — lc-03-03 (precise implementation contract)

Verified math: all graded content in this lesson is correct. The leading-term-dominance mcq
(7x³/x³ = 7), the sign-aware top-heavy classification ((−2x³+5)/(x²+1) → −∞ because degree 3 > 2
and the lead is negative), the bottom-heavy-to-zero classification ((3x+2)/(x²+1) → 0), and the
challenge's top-heavy-to-+∞ classification ((x³+1)/(2x+5) → +∞) all recompute correctly, and every
mcq distractor names a real, checkable degree/leading-coefficient confusion.

Defect: step `i1`'s `graphZoom` widget is used to illustrate (x²+1)/(x−3) near its vertical
asymptote at x = 3. The `prompt` reads "zoom in on x = 3 and watch the two sides head in opposite
directions," and `successFeedback` reads "No limit: one side dives, the other climbs." This is a
mathematically accurate description of the real function — as x→3⁻ the denominator is negative and
small while the numerator stays near 10, so f→−∞; as x→3⁺, f→+∞ — a genuine sign-changing vertical
asymptote. But `GraphZoomW` in `src/components/widgets.tsx` (around line 2853) hard-codes the
`behaviour:"infinite"` rendering as:

```
if (spec.behaviour === "infinite") return Math.abs(d) < 1e-9 ? null : 1 / (d * d);
```

`1/(d*d)` is always positive and grows on **both** sides as `d→0` — it can never "dive." The
authored `leftValue`/`rightValue`/`fAtA` fields are ignored entirely for this behaviour (confirmed
by reading the function body), so there is no way for this widget, as authored, to render the
asymmetric behavior the text promises. This is a real promised-visual mismatch, not a rounding or
wording nitpick.

This is also a checkable outlier, not a guess about intended design: every other `"infinite"`-
behaviour `graphZoom` in the repository deliberately avoids directional language for exactly this
reason —

- this course's own `lc-04-02` step i1: "They never settle — the closer you look, the larger they
  grow, and the branches leave the window at every magnification."
- `content/courses/rational-functions/lessons/rf-04-01.json`: "They never settle — the closer you
  look, the larger they grow."
- `content/courses/curve-analysis/lessons/ca-04-01.json`: "They never settle — the closer you look,
  the larger they grow."
- `content/courses/polynomial-rational-analysis/lessons/pra-03-03.json`: describes the sides as
  flying apart without ever claiming which direction each side goes.

`lc-03-03` is the only one of these five that promises an asymmetric, signed visual, and it is the
only one whose promise the shared renderer cannot keep.

Implementation contract:
- Rewrite step `i1`'s `prompt`, `successFeedback`, `moreZoomFeedback`, and `wrongVerdictFeedback`
  in `content/courses/limits-continuity/lessons/lc-03-03.json` to drop the "opposite directions" /
  "one side dives, the other climbs" claim, matching the direction-neutral wording already used in
  this course's own `lc-04-02` (e.g. "They never settle — the closer you look, the larger they
  grow"). The pedagogical point ("no single number is approached, so the limit does not exist") is
  unaffected by this change.
- Alternative (larger, out of this packet's scope): extend `GraphZoomW`'s `"infinite"` behaviour
  with a signed variant (e.g. `1/d` scaled, or a `sign` flag selecting `+1/d²` vs. a piecewise
  `1/d` branch) so an authored asymmetric vertical asymptote can actually render — if taken, this
  is a shared-component change affecting every course that uses `graphZoom`, not a lesson-local fix.
- No change is needed to steps `k1`–`k3`, `ch1`, `r1`, or any answer/feedback value in this lesson
  — they are all correct as written. No change is needed to `c1`/`c2` concept prose.

## Other observations (no action required)

- **lc-03-02** step i1 reuses the `graphZoom` "zoom near a point" widget as a schematic stand-in
  for end-behavior settling (`leftValue=rightValue=fAtA=3` for (3x²+1)/(x²−5), which is not the
  function's literal value at x = 3, namely 7). This is not flagged as a defect: the same
  non-literal convention (anchor values representing the claimed limit, not a literal plot) is
  already used for the slant-asymptote `graphZoom` in
  `content/courses/polynomial-rational-analysis/lessons/pra-03-01.json`, confirming it is an
  established, intentional codebase pattern for "zoom to infinity" narratives rather than a
  content-specific error. `GraphZoomW`'s `"continuous"` branch always draws a slope-1 line through
  the anchor value regardless of the authored function, so no `graphZoom` widget in this codebase
  is a literal plot of its accompanying formula — the anchor value is the pedagogical payload, and
  it is set correctly here (3, the true limit at infinity).
- **lc-01-01 k2** and **lc-04-02 k1** both use the identical example (x²−4)/(x−2) → 4 at x = 2.
  This is deliberate spiral reuse, not unmotivated duplication: lc-01-01 introduces it to show a
  limit existing at a hole (ch1's core idea), and lc-04-02 explicitly revisits the same recognizable
  example to classify that hole's type as *removable* (ch4's core idea) — the instructional job
  (existence vs. classification) differs even though the function is shared, and the lesson's own
  `c2`/`k1` body text ("recall Ch2," "the hole's limit") signals the reuse is intentional
  scaffolding rather than a copy-paste accident.

## Gate note

Per task instructions, no `npm`/`vitest`/`tsc` commands were run. All verification above was
performed by independent hand recomputation of every limit, continuity classification, IVT
application, degree-comparison end-behavior claim, derivative evaluation, and series sum, plus
direct reading of `src/lib/evaluate.ts`, `src/lib/schema.ts`, and `src/components/widgets.tsx` to
confirm each widget's authored parameters drive its grading and rendering as claimed.
