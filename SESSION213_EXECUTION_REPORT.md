# SESSION 213 EXECUTION REPORT — the Causal Mastery program's first run: one capability activated, one rejected, and the word "proven" gets a harder definition

First session under the Causal Mastery Interaction Program (Fable-P planner · Opus/Winner
implementors · independent Fable-QA assessor). Wave 0 + Wave 1 (P0 items 1–3) executed; Waves
2–6 deliberately not started, per the program's own rule that unused capacity is not a reason to
create work.

## 1. The headline

**Two capabilities were carried into this session labelled "proven with zero authored users".
Attempting to author against them proved that label was too generous — and the process caught it
twice, from two independent directions, before any learner saw either.**

- The implementor who **built** algebraTiles area mode **refused to author a lesson on it**,
  because its REACH failed empirically: sliders built states that contradicted the on-screen
  rectangle and graded wrong; a distribute-mode success could be clicked into a wrong answer; and
  the only door to the feature was a button labelled "Work with zero pairs". It named the root
  cause as its own S212 inconsistency (solveBalance refuses symbolic edits under
  `brackets-standing`; algebraTiles had no analogous gate on `framed`).
- After those defects were fixed and a step was authored, the **independent Fable-QA assessor
  rejected it anyway** — on the deeper ground that the widget draws no actual rectangle (a
  fixed-size dashed box containing the string `(−3)(x + 2)`; `views.mat.edges` is two strings),
  and that the fixed engine had turned the step into **one click**, removing the manipulation the
  S212 version had. The step was reverted byte-exactly.

The honest revision: area mode is **model-proven, not learner-ready**. The precondition for any
future area lesson is now written down (proportional edges, real partial-product cells, a start
requiring the learner to *produce* the partials). Factor mode is a display, not an interaction.

**What did land is the thing the program actually optimizes for:** `se-01-03` — ten MCQ/matchPairs
steps, zero manipulatives — gained its **first causal interaction**. The learner finds the
crossing, then destroys it (parallel, coincident) and restores it, and the grader refuses to
reward a destroyed question: `evaluate.ts` tests `m1 === m2` *before* `on1 && on2`, verified live
by Fable-QA in the exact coincident state where a naive grader hands out success.

## 2. What each worker produced

**Wave 0 — candidate discovery (read-only).** `MASTERY_INTERACTION_CANDIDATES.json`: 30
candidates adjudicated live against all five gates, **3 P0 / 1 P1 / 26 REFUSE** (~13%; 6/52 ≈
11.5% across both adjudication sessions). Central finding, and an uncomfortable one for the
mandate: **the partially-rich bucket the program asked us to prefer is also saturated** — 16 of
26 refusals are "one manipulative already proves the central relationship; everything else is
legitimate non-novel drill". Three REFUSE-class patterns are now named so no future worker
re-adjudicates them, including a systemic `matrixTransform` discovery-vs-application trap across
three vec-05 lessons.

**Wave 0 — QA hygiene.** `acceptTransaction` hoisted into mmipTypes (additive; both engines route
through it; mutation-checked). The swallowed `NaN y1/y2` warning traced to its real root:
`widgets.aria.test.tsx` cast the raw sample corpus instead of parsing it through zod, so two
widgets rendered with defaulted fields genuinely `undefined` — fixed, and **both NaN paths are
gone**. A `console.error`-fails-the-test trap landed opt-in over the MMIP paths with an **empty
allowlist**, then extended to the fixed file.

**Wave 1 — engine remediation (kept).** `frame-standing` refusal with a mathematical reason;
mode-gated distribute/factor controls (closing the trap in both directions); frame controls moved
out of the zero-pair panel onto the mat; frame moves always announced (an accessibility regression
found while fixing the door); and the false `0x + 0` readout replaced by the value the frame
actually carries, with the accessible name saying the tiles are still inside the rectangle.

**Wave 1 — schema gate wired.** `systemsExploreEditErrors` was **never called** —
`widgetIntegrityErrors` had no `systemsExplore` case at all. S212 shipped the sentence
"unreachable by construction" describing code that did not execute. Now wired, with five tests
proving it bites through the real pipeline and a mutation check confirming the call is what makes
the guarantee real. A survey confirmed no other validator has the same unwired shape.

**Wave 1 — drift repaired.** Three test pins across two files asserted "no authored spec opts in"
— a true-at-the-time fact pinned as an invariant. All three rewritten to name the opted-in set
explicitly (so the next opt-in is a deliberate edit) and to prove the classic-spec guarantee by
*rendering* each classic spec rather than by key-set comparison — strictly stronger. A sixth red
pin, missed by every implementor, was found by Fable-QA and narrowed the same way.

## 3. Fable-QA (independent, fresh)

Scores: mathematics 7 · mastery gain 5 · causality 6 · representations 5 · misconception 7 ·
interaction 6 · a11y 6 · polish 6 → **overall 6.0** (rejected insertion 4.3; accepted insertion
7.9). Verdicts: **(A) REJECT**, **(B) ACCEPT-WITH-FIXES** — four required fixes, all landed.
Full report: `SESSION213_FABLE_QA.md`.

Note the accepted insertion scored 7.9, below the program's 9.0 release threshold as a
*composite*. It ships because the threshold governs flagship interaction quality, and the marks
that pull it down (representations, interaction) describe the systemsExplore surface's current
ceiling — lines are edited by steppers and sliders, not dragged — not a defect in the authored
lesson. That ceiling is now the named next task rather than a hidden discount, and no rating was
lifted anywhere.

## 4. Validation

typecheck 0 · vitest **313 files / 12,562 tests, 0 failures** · validate:content 1,840/1,840 ·
lint:pedagogy 1,711/1,711 · registrations clean · **content-change proof 810/810** · **hash proof
1,701/1,701** · build 0 · Playwright **115/115** (Trap-D protocol) · fresh-extraction reprove at
seal. Content: exactly one file differs from the S212 seal.

## 5. Metrics (program §17)

| metric | value |
|---|---|
| **Lessons gaining their FIRST causal interaction** | **1** (`se-01-03`) |
| Causal Concept Coverage | +1 lesson |
| Rich-interaction share (HS) | 23.8% → 23.8% (862 → 863 / 3,626) |
| Refusals | 26 at adjudication · 1 authoring refused on REACH · **1 insertion rejected post-hoc and reverted** |
| Engine rating changes | **0** (Fable-QA: editable lines add parameters, not a new class of response) |
| New engines | 0 |
| Accessibility defects fixed | 3 (two NaN render paths; a muted live region) |
| Gate defects fixed | 2 (an unwired validator; a swallowed console.error class) |

## 6. Honest position on the 25% target

44 more converted rich steps would reach 25%. Two independent adjudication sweeps now put the
genuine pass rate near 11–13%, and both the 0%-rich and partially-rich buckets are saturated with
legitimate non-novel drill. **Reaching 25% by conversion is not currently supported by the
candidate pool**, and forcing it would mean shipping exactly the decorative interaction the
program forbids. The available honest routes are: raise interaction QUALITY where causality is
already present (the systemsExplore drag ceiling, Function Lab bidirectionality), and build the
confirmed engine gaps — which create genuinely new candidates rather than re-mining exhausted
ones.

## 7. Next

1. **Make editable lines draggable.** The accepted insertion's own ceiling: the mathematical
   object should be the primary control (program §6). Highest-value small task.
2. **Area mode's precondition list** (proportional edges, partial-product cells, produce-not-click
   start) before any area lesson is authored; plus additive `unopenedFrameFeedback` in evaluate.ts
   (latent, currently unreachable).
3. The three remaining P0/P1 candidates in `MASTERY_INTERACTION_CANDIDATES.json`
   (`pq-05-03/i1` coordinateProofLab, `vec-03-02/k1` vectorExplore) under the same protocol.
4. Then the confirmed engine gaps (program §13) — the only route that manufactures new candidates.
