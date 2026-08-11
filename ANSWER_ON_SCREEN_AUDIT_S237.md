# S237 — "the widget shows its own answer" audit

**Scope.** All 127 registered engines, audited for one defect: *during active work, before the
learner has answered, the widget renders the value it is about to grade them on.* Three read-only
shards (43/43/41), each required to trace every finding to a source line **and** an authored lesson.

**Result: 14 engines.** This is systemic, not the two lessons that prompted the audit.

**This is a findings document, not a change.** Nothing here has been fixed. Several of these
require per-lesson pedagogical judgment that the manifest reserves for human review.

---

## Why the earlier "describeState answer-leak" framing was wrong

The session-A audit reported ~12 engines leaking the answer through `describeState`. That was a
misattribution, and acting on it would have made accessibility **worse**.

`scaledCircleLab` narrates "The target circumference coefficient of pi is 8" — but the widget
*prints* `2 × 4 = 8` on screen at `widgets.tsx:1437`, ungated. The narration was faithful parity.
Checked across the flagged set: every `target*` field except `polarTrace.targetPetals` is
referenced heavily by its widget too, i.e. displayed. Stripping those from the narration would have
removed information blind users are entitled to while leaving the real defect untouched.

**The defect is upstream, in what the widget draws.** That reframing is the main result of this audit.

---

## Findings

Confirmed by rendering the component (not by reading JSX):

### scaledCircleLab — the seed case
`widgets.tsx:1437`, ungated. `cr-06-01` asks "In C = 2πr, what does 2r equal?", choices 8/4/16,
screen prints **`2 × 4 = 8`**. Also `g7-04-03`: "3 × 2 = 6" above choices 6m/3m/12m. 4 steps, 2 lessons.

### fractionBar — largest blast radius, but needs per-lesson judgment
`widgets.tsx:1105-1108`. The target fraction is drawn shaded and labelled "target", gated only by
`spec.showTarget`, which **defaults to `true`** (`schema.ts:675`). **96 of 101 authored instances
leave the default.** Independently verified.

⚠️ **Do not blanket-fix.** Whether this is a leak depends on the task:
- `fa-03-01` — "2/8 + 3/8. Build the answer on the bar." Showing 5/8 shaded **bypasses the addition**. Leak.
- `g5f-01-01` — "3 sandwiches shared among 4 people. Build one person's share." A visible target is
  arguably the *representation* practice itself, not a giveaway.

The per-item `showTarget` flag exists precisely for this distinction; the likelihood is that 96
items inherited the permissive default rather than choosing it. **Needs an authoring pass, item by
item — not a code change.**

### Clear leaks — the rendered value *is* the graded value

| Engine | Site | Evidence |
|---|---|---|
| `equationOutcomeLab` | `widgets.tsx:5599-5600` | Renders `"false residue → no solution"`. `les-02-01` asks "How many solutions does 4x + 1 = 4x + 9 have?" with that exact category among the choices. |
| `signedFractionLab` | `widgets.tsx:5642` | Renders `"different signs → negative"` before any choice. Every `rno-04-01` item carries a sign-flipped distractor — the displayed sign eliminates it outright. |
| `compoundEventLab` | `widgets.tsx:1548` | Renders `6 × 5 = 30`; `sp-04-03` asks "How many total outfits?" with choices 30/11/6. Character-for-character the correct choice's justification. |
| `conditionalTableLab` | `widgets.tsx:16036` | `LabReadout "derived value"` shows `truth.value` — the number the MCQ is graded against. `bv-04-01` shows "50" for "What is the grand total?" (choices 50/45/30). |
| `geometricConstraintLab` | `widgets.tsx:6981-6983` | Diagram prints `hypotenuse square = 100` for `tm-04-01` ("legs 6 and 8, what is c²?"). Also `vertical = 75°`, and the derived third angle. `GeometricConstraintDiagram` takes no tone prop at all. |
| `triangleClosureLab` | `widgets.tsx:1492` | "A non-flat closure exists near 106.1°" renders iff the triangle forms — the sentence's *presence* announces the forms/does-not-form verdict being asked for. |
| `argandExplore` | `widgets.tsx:2637` | Draws a ring at `(targetRe, targetIm)`. `cn-03-01` asks the learner to plot `(1+3i)+(3−2i)`; the ring sits at 4+1i from first render. The code's own comment says "in place mode the target ring IS the answer's location." |
| `sequenceBuild` | `widgets.tsx:3462-3473` | Term and partial-sum chips render unconditionally. `sr-01-03` asks for a₃ and chip 3 reads "36"; `sr-02-01` asks for Σ and the S5 chip reads "35". Only leaks when count ≤ 10 (the render slice). |
| `shapeHierarchyLab` | `widgets.tsx:15910, 15916` | Triangle mode prints "The engine independently derives: isosceles." — verbatim the correct choice. Verdict mode: *which* of witness/counterexample/blocker is populated is a deterministic encoding of always/sometimes/never. |
| `extraneousRootLab` | `widgets.tsx:10155` | Candidates are stroked green/red by `isPhantom` before the learner picks — the platform's own correct/incorrect colour convention naming the answer. |
| `matrixTransform` | `widgets.tsx:15088` | Ungated dashed target polygon. Only a leak where the target is *derived* (`vec-05-02`, "build the 90° rotation"); where the prompt states the coordinates (`vec-04-02`) it is a harmless restatement. |

### Accessibility asymmetry — screen-reader users get *more* than sighted users

These are the inverse of the failure I was guarding against, and the fix is unambiguous: state the
givens, drop the computed answer. Do **not** remove the descriptions.

| Engine | Site | Evidence |
|---|---|---|
| `moneyBoard` | `widgets.tsx:15323` | Visible receipt deliberately prints "Change ?" — the author clearly intended the target hidden — while `sr-only` text announces "target 325 cents". `dop-04-03`. |
| `lengthCompare` | `widgets.tsx:14392` | Sighted learners must count ticks in the overhang; the SVG `aria-label` states "The shaded overhang is 5 blocks long", exactly `targetDifference`. `smg1-03-02`. |

---

## Recommended order

1. **`moneyBoard` and `lengthCompare` first.** No pedagogical ambiguity — one channel contradicts
   the other, and the visible UI already documents the intended behaviour. Pure defect fix.
2. **The clear leaks**, gating each behind the existing post-verdict convention (`tone === "info"`)
   that these same components already use correctly for their ghost chips. The convention exists;
   these sites are outliers from it.
3. **`fractionBar` last, as an authoring pass.** Code change alone is wrong. Each of the 96 items
   needs a human ruling on whether its target is the task or the giveaway.

## What this audit did not do

- No browser verification at 390/768/1440. Findings are source + rendered-DOM (jsdom) only.
- Shards were instructed to prefer under-reporting; `CLEAN` lists are "no defect found", not proof
  of absence.
- No fix, no gate change, no content change.
