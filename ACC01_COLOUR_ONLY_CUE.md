# ACC-01 §5(f) — COLOUR AS THE ONLY CHANNEL, AND WHY THE FIX IS A PEDAGOGY FIX

**Evidence:** `reports/acc/ACC01_COLOUR_ONLY_CUE.csv`, from `scripts/audit/colour-only-cue.mts`
**Gate:** `src/components/widgets.colourCue.s242.test.tsx` · **Date:** 2026-08-16

## The constraint that shapes this packet

§6 of the accessibility matrix states it, and it is the reason this could not be worked as an
accessibility backlog:

> Every colour-only correctness cue in §5(f) is **the same set of sites** ENG-01 classifies as
> **R2 — correctness signalled before commit** — and asks to be *removed*. The accessibility fix
> (add a text or glyph channel) makes the answer leak **louder**, and puts it in the accessible
> name. The pedagogy fix (gate on `tone === "info"`) makes the 1.4.1 problem **vanish**, because
> post-verdict the banner already states the outcome in words.

So the audit does not look for "colour without a glyph". It looks for the two facts that decide
what to do with a site: **is the colour derived from a correctness condition**, and **is it inside
a `tone === "info"` guard**.

## The measurement, and its own bug first

**76 verdict-coloured SVG props** (a ternary choosing between `PALETTE.leaf` and `PALETTE.berry`):

| | |
|---|---:|
| Phenomenon-derived — colouring a fact is not a claim about the learner | 59 |
| Correctness-derived, already tone-gated | 1 |
| **Correctness-derived and ungated — the population read by hand** | **16** |

**The first cut of the detector missed five of these, including sites the matrix had already
confirmed by hand.** `CORRECTNESS` carried a leading `\b`, and a word boundary does not exist inside
camelCase — so `msHolds`, `quadDrag`'s midsegment cue and a matrix-confirmed true positive, did not
match. It was caught by checking the three line numbers §5(f) names *before* trusting the count. A
detector that disagrees with the ground truth it was written against is wrong, and this one said so
only because the ground truth was checked first.

## The 16, read

Every row was opened and its condition traced to its definition, then checked against how the engine
is actually placed in the corpus. **Four are live defects.**

### Acted on — 4 sites, 3 engines, 23 graded instances

| site | condition, traced | graded placements |
|---|---|---:|
| `trialProbabilityLab` ×2 | `accepted = trialProbabilityEquivalent(spec, selected)` — literally the grader's own function | 7 |
| `distributionCompareLab` ×1 | `selectedCorrect = \|selectedMeasure − answer\| <= tolerance` | 12 |
| `fractionGrid` ×1 | `atTarget` matches every field of the spec — rows, cols and both shades | 4 |

All three now gate the leaf on `tone === "info"`.

### Recorded, not acted on — 12 sites, with the reason each

- **`roundSolidBuilder` ×4, `quadraticRoots` ×2 — zero authored placements.** Neither engine appears
  on a single step in the corpus. The cue is real in source and reaches nobody. Worth its own line:
  two engines ship, render and are gated by nothing because no lesson uses them.
- **`quadDrag` ×3 — the theorem, not the learner.** `msHolds = |msLen − msPredicted| < 1e-6` marks
  whether the midsegment formula holds for the current quadrilateral, which is the phenomenon the
  lesson is about. The berry state *is* reachable (a general quadrilateral is not a trapezoid), so
  it is a live cue — but all 7 placements are `interactive`, so nothing graded is at stake.
- **`coordinateProofLab` ×1 — ungraded drag target.** `atTarget = x===spec.target[0] && y===spec.target[1]`.
  All 5 placements `interactive`.
- **`triangleClosureLab` ×1 — a procedural sub-goal, exactly §6's carve-out.** `closesHere` marks the
  angle at which the frame closes; the *graded* answer is a separate multiple-choice about whether
  the three lengths can form a triangle at all. §6 names this class ("`solidSliceLab`'s 'the cutter
  is at the midpoint'") as needing an independent decision, and this is one.
- **`solveBalance` ×1 — colour is not the only channel.** The beam is wrapped in
  `transform: rotate(${tilt}deg)` and sits level exactly when balanced. A false positive for 1.4.1,
  and a good counter-example: the tilt is the second channel §5(f) asks for.

**4 of 16 acted on.** The other twelve are not a detector failure; each needed the engine's *placement*
data to settle, which no amount of source reading supplies.

## The gate

`widgets.colourCue.s242.test.tsx` renders each of the three engines from a **real graded step's
spec** (`sp-03-02#k1`, `sp-02-01#k1`, `fm-03-01#k1`) with the learner's state set to the answer, and
asserts symmetrically:

- **no leaf during active work** — the fix;
- **leaf after the verdict** — without which the gate would also pass on a deletion, and the
  coloured mark is a genuinely good explanation once the answer is settled.

**Verified to discriminate.** Reverting the `fractionGrid` gate turns it red naming that case;
restoring it turns it green.

**One false start, recorded.** The first draft trimmed `trialProbabilityLab` to two choices and Zod
rejected the spec — the schema requires three — rather than letting the test render something
unrepresentative. The gate would have been measuring a widget no learner can meet.

## What remains in ACC-01

`LabReadout`'s 53 colour-only sites were rewritten alongside ENG-01 R2; `openReading` reach was fixed
at `a5aa97b`; the focus ring at `f24bfc6`. §5(f)'s SVG half is now read end to end. What is left in
the matrix is the material it explicitly could not settle from source — §8's undetermined list,
which needs a screen reader and a browser.
