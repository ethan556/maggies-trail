# Four defects reported from the running app — status

All four are app-wide classes, not single lessons. Two are fixed and gated; two are measured and
scoped but **not fixed** — say so plainly rather than leaving them looking handled.

| # | Defect | Status |
|---|---|---|
| 1 | Matching questions present already-matched columns | **FIXED + gated** |
| 2 | Number line marks only the tappable answers | **FIXED + gated** |
| 3 | Graph/diagram axes unlabelled | **MEASURED, not fixed** |
| 4 | Questions refer to a diagram that is not on screen | **MEASURED, not fixed** |

---

## 1. Answer-by-position in matching — FIXED

Reported: "Match each double to what it makes" showed 6+6/12, 7+7/14, 8+8/16, 9+9/18 as four
parallel rows, so every pair could be made by position.

Not one lesson. **143 of 175** authored `matchPairs` specs have `right[i]` as the partner of
`left[i]`; **41 of 187** `dragBucket` specs list items already grouped by destination.

`McqW` already documented and fixed this class for options (99.8% of mcq widgets author the
correct option first) using a seeded display shuffle. The mechanism, the `seed` prop and the
determinism rule all existed and had never been applied to the other two engines. Now they are.
Display order only; grading resolves by id in both (`links[l.id] === spec.pairs[l.id]`,
`placed[i.id] === i.bucketId`) and cannot be affected.

Pinned by `widgets.answerOrder.s237.test.tsx`, which includes a self-check that feeds the authored
order through and asserts the detector scores it 40/40 aligned — so the gate cannot pass by
blindness — plus an assertion that the answer key itself is never reordered.

**I checked `mcq` first and it was already correct.** Recorded because it is why the fix reuses an
existing mechanism instead of inventing one.

## 2. Number line was a row of answer slots — FIXED

Reported: "9 + 9: start at 9 and make one hop of 9" drew a mark at 9, marks at 17/18/19, and
nothing between. The hop could not be counted — the entire job of a number line at that grade —
and the only marks present were the candidate answers, so the line showed the shape of the answer
set rather than the structure of number.

A unit scale now spans `min..max` independently of the choices. Two things reading the output
caught that the first draft got wrong:

- the ruler and a choice tick both labelled `0`, stacking two labels at identical coordinates;
- dividing the span by a fixed count gave a 0–100 line ticks every 3 and labels at **9, 18, 27** —
  arithmetically even and useless to read a position off. Strides now snap to a 1-2-5-10 ladder.

Verified across 0–10, 0–20, 0–100, −5..5 and 0–1000. Scale is `aria-hidden`; the accessible
description and the interactive contract are unchanged. Pinned by
`widgets.numberLineScale.s237.test.tsx`.

## 3. Axis labelling — MEASURED, NOT FIXED

**70** widget components draw a multi-line SVG; **66** have no explicit axis-label binding.

That count over-reports: it catches fraction bars and triangle diagrams that have no axes to
label. The real subset is the coordinate-plane engines, and separating them needs a pass over each
component, not a regex. This is a genuine multi-batch sweep with a per-engine design question
(what do the axes mean in *this* model?), and it should be a leased work package with its own gate
— "every engine that draws a coordinate plane names both axes" — rather than a scattered fix.

**Nothing has been changed for this defect.**

## 4. Questions referring to an absent diagram — MEASURED, NOT FIXED

The most serious of the four: it makes items unanswerable as displayed.

Reported: "The graphed point (4, 20) represents a car trip. What is the rate?" with no graph.

`COWORK_CACHE/missing-diagram-candidates-s237.csv` — **105 candidate steps across 55 lessons**,
found by matching prompts that refer to a graph/figure/diagram/plot where the step has no `figure`
and its widget does not draw one. Split:

- **78 `REFERS_TO_ABSENT_FIGURE`** — no figure, and the data is not in the prompt either. Examples:
  `cx-01-01/k1` "Compute the distance from A(1, 2) to B(7, 10). **Read it off the figure.**";
  `cx-05-03/k1` "**Unmask the figure**"; `cx-05-02/k1` "**Against the figure's circle** …".
  These are unanswerable or misleading as rendered.
- **27 `DATA_INLINE_BUT_CALLS_IT_A_FIGURE`** — answerable, because the prompt carries the data
  (`vm-02-02` embeds "1/4 → XX, 1/2 → XXX, 3/4 → X"), but the wording still promises a picture
  that is not there. Lower severity, still wrong.

**This is very likely the withheld-illustration backlog surfacing to learners.** The manifest
records 1,078 misleading placements as *withheld*, with "hidden is not fixed" as an explicit rule —
and this is what withheld looks like from the learner's seat. Before treating these as 105 separate
authoring bugs, cross-reference the list against `ILLUSTRATION_REPLACEMENT`: if these steps' figures
are among the 1,078, the fix is the replacement programme, not prompt rewording. **Rewording the
prompts to stop mentioning the figure would be the wrong move** — it would hide the symptom and
close nothing, which is exactly the failure mode the manifest names.

The candidate list is a list of candidates, per handover lesson 2. Each row needs the same three
questions the audited engines got: is the figure withheld or genuinely absent, is the data
recoverable from the prompt, does an existing test pin the current behaviour.
