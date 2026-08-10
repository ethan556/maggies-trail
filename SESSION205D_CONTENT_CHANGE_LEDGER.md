# S205D — content-change ledger

**No authored lesson content was altered.** Both changes are `insertions` — new steps spliced
after their anchors with the authored steps kept as the original array objects and the applier's
structural proof (serialise-minus-insert === original) that no authored byte drifted. 23 applier
assertions passed.

This is campaign batch 1 selected by the new prefilter
(`scripts/measure/insertion-candidates.mjs`, 627 ranked HS candidates). Both insertions reuse
engines already proven at Tier A **in the same course** — zero new registration work.

## 1. INSERTION — `ca-05-01` "Setting Up an Optimisation" · new step `i1b` (signChart) · **C 25 → A 31**

The authored reveal teaches that the physical domain decides the answer (V = x(12 − 2x)²; a
critical point outside 0 < x < 6 is fiction). The inserted lab has the learner build V′'s sign
chart themselves — V′ = 12(x − 2)(x − 6), roots at 2 and 6 — and the chart's own third column
(+ again past x = 6) becomes the reveal's point made visible: the algebra is right AND the region
is fiction, because at x = 6 the base is gone. Predict block carries exactly that question.

Every prose number verified against the grader's own functions, not by eye:
`signChartSigns([{2,1},{6,1}], true)` returns `+ − +` (matches success prose); V(2) = 128;
V′(1) = 60 > 0, V′(4) = −48 < 0, V′(7) = 60 > 0 (matches crossFeedback's test points);
independent numeric argmax of V on (0, 6) is x = 2.000, V = 128.00. bounceFeedback describes the
even-multiplicity case accurately and is unreachable here (both roots odd) — present because the
schema requires it, false nowhere.

## 2. INSERTION — `dc-02-01` "Related Rates" · new step `i1b` (relatedRatesLab) · **C → A 35**

The authored reveal teaches differentiate-first-substitute-last. The inserted lab makes the WHY
manipulable: a 10-ft ladder, foot moving at a constant 1 ft/s, and the learner slides through
positions (requiredMoves = 4) watching dy/dt change — the rate depends on the instant, which is
exactly why the numbers go in at the end.

Every number derived twice: closed form dy/dt = −x/√(100 − x²) AND independent difference
quotient (h = 10⁻⁵), agreeing at x = 3 (−0.3145), x = 6 (−0.75), x = 8 (−4/3). y(8) = 6 exactly;
the 2x·dx/dt + 2y·dy/dt = 0 instantiation in the success prose is 16 + 12·dy/dt = 0 → −4/3.
"More than four times" the x = 3 rate: ratio 4.24. Target x = 8 is an exact integer on the
slider's 1..9 step-1 range (reaches gate); grader is exact equality on integers.

## 3. REFUSALS (2), cited in `content/patches/s205d-campaign-batch1.json`

- **ca-03-03 "What the MVT Buys"** — represents gate. The reveal's subject is logical dependence
  (these facts are theorems requiring the MVT); a lab re-demonstrating the phenomenon would
  actively undercut the point that the fact is not free. No engine represents dependency between
  theorems.
- **dc-01-03 "Distance vs Displacement"** — models gate. The authored journey (s: 0→4→0→4,
  distance 12, displacement 4) is not drawable: derivativeTrace's fn enum (schema.ts:3136) has no
  matching curve and no accumulated-distance readout exists in any engine. Engine gap recorded:
  a motion engine with position playback and a running odometer.

## Census

A 1177 · B 431 · C 92 · D 1 (was A 1175 · C 94 before this batch).
