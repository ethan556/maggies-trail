# S321 — Independent Verification of S320 Implementation Packets 4–6

Reviewer: Claude Cowork independent verifier (S321). Date: 2026-08-20.
Scope: 59 lessons — impl-4 (`compose-shapes-g1` + `add-three-numbers-g1`, 17 lessons, contract
`S320_ASSESS_A13.md`), impl-5 (`solving-equations` + `linear-equations-systems` + `quadratics`, 23
lessons, contract `S320_ASSESS_A8.md`), impl-6 (`decimal-operations` + `decimals-place-value` +
`exponents-scientific-notation` + `derivatives-in-context` + `exponents-polynomials`, 19 lessons,
contracts `S320_ASSESS_A4.md` + `S320_ASSESS_A10.md`).

Method: for every lesson, the contract's REVISE section was read first, then the current committed
JSON (`git diff HEAD~1 HEAD -- <file>`, since all three implementation packets landed in a single
commit `a78d6a3`) was independently re-derived by hand before reading the implementer's own claim
documents (`S320_IMPL_A13.md`, `S320_IMPL_A8.md`, `S320_IMPL_A4_A10.md`) and their NDJSON records.
Every changed numeric fact, equation, system (checked in both equations), discriminant/root, and
commonError/feedback string was hand-recomputed against the new numbers actually printed — not
inferred from the contract's suggested text. Cross-lesson and within-lesson duplicate scans were
re-run programmatically per course on the current source tree. `node scripts/session/print-review-basis.mjs`
was run once in bulk for all 59 lesson IDs. No content was edited; no `npm`/`vitest`/`tsc` was run.

Dispositions signed to `reports/closure/cowork-staging/laneV-s321-impl456-dispositions.jsonl`
(59 NDJSON records, `recordId` = `S321-V2-<lessonId>`), written incrementally per course.

## Verdict counts

| Packet | Lessons | KEEP | REVISE |
|---|---|---|---|
| impl-4 (`compose-shapes-g1` + `add-three-numbers-g1`) | 17 | 15 | 2 |
| impl-5 (`solving-equations` + `linear-equations-systems` + `quadratics`) | 23 | 23 | 0 |
| impl-6 (`decimal-operations` + `decimals-place-value` + `exponents-scientific-notation`) | 14 | 14 | 0 |
| impl-6 (`derivatives-in-context` + `exponents-polynomials`) | 5 | 3 | 2 |
| **Total** | **59** | **55** | **4** |

`visualDecision` distribution: REQUIRED ×19, SUFFICIENT ×39, ESCALATE ×1 (`dc-03-01`).

## Non-KEEP dispositions and reasons

1. **`g1s-03-02`** (impl-4) — REVISE. The contract asked only for a grammar fix at `k2`, but the
   implementer additionally retargeted `k2`'s entire prompt (correctly resolving a genuine,
   previously-undetected 4th cross-lesson numeric duplicate with `g1s-02-01/k2`). The new answer (3)
   is correct, but the new wrong-answer feedback for value=2 — *"That misses one corner; the seam
   adds a new corner where the diagonal cut meets each side"* — is **geometrically false**: a
   diagonal cut through a square runs corner-to-corner (both endpoints are pre-existing square
   vertices), so no new vertex is ever created by the cut. `S320_IMPL_A13.md`'s "hand-verified
   arithmetic" claim for this lesson checked only the corner count (3), not this geometric claim.

2. **`g1t-01-01`** (impl-4) — REVISE. The `c2` figure/text mismatch (make-ten-bridge figure vs.
   false "third addend" framing) was correctly resolved via the contract's option (b). But `ch1`'s
   corrected commonError for value=11 — *"That is one less than the full total; recount both groups
   together"* — is **arithmetically false**: the prompt is "4 red beads + 9 blue beads" (answer 13),
   and 13 − 11 = 2, not 1. This exact false text was copied verbatim from the assessment contract's
   own suggested fix language (`S320_ASSESS_A13.md` contract #10) without independent verification;
   `S320_IMPL_A13.md`'s "hand-verified arithmetic (4+9=13)" claim covers only the correct answer, not
   the wrong-answer feedback's numeric relationship.

3. **`dc-03-01`** (impl-6/A10) — REVISE, `visualDecision=ESCALATE`. The contract required either
   (a) a genuinely curved backing function for this `graphZoom` widget instance, or (b) swapping to
   a widget capable of showing curvature, and explicitly said *"Text/feedback should not be changed
   to describe a lesser claim merely to match the current rendering."* The implementer did neither:
   `widgets.tsx`'s `GraphZoomW` is unchanged (still `f(x) = leftValue + 1*(x−a)`, an unconditionally
   straight line at every zoom level for `behaviour: "continuous"`), and only the lesson text was
   reworded to claim a lesser, currently-true fact ("confirm both sides settle on the same height")
   instead of the original false claim ("watch the curve straighten"). This is precisely the
   workaround the contract prohibited — the pedagogical defect (widget cannot demonstrate local
   straightening) remains unresolved, just no longer misdescribed.

4. **`ep-03-01`** (impl-6/A10) — REVISE, `visualDecision=REQUIRED`. Defect A (remedial duplicating
   `k1` verbatim) is correctly fixed and hand-verified (`(2x)(x+5)`, coefficient 10, correct). Defect
   B (the `distribute-area` figure mismatch) is explicitly disclosed by `S320_IMPL_A4_A10.md` as
   **fail-closed and unfixed** ("`c1.figure` remains `distribute-area`... NOT fixed"), consistent
   with that packet's declared content-JSON-only scope. See discrepancy below — signed REVISE per
   task direction, treating the figure sub-item as still-open pending its own signed authorization.

## Discrepancies

- **`ep-03-01` figure — implementer claim contradicts current committed source.**
  `S320_IMPL_A4_A10.md` states plainly that `c1`'s figure key was **not** changed and remains
  `distribute-area` (fail-closed). The actual current tree, however, shows `c1.figure` repointed to
  a newly-registered `monomial-distribute-area` component: `src/components/figures.tsx` gained a new
  `MonomialDistributeArea()` function (registered in `figureIds.ts` and the `FIGURES` map) whose SVG
  correctly renders `3x·x = 3x²` (solid) and `3x·4 = 12x` (hatched), matching the adjacent lesson
  text exactly — a mathematically correct fix, if considered in isolation. `figures.tsx` and
  `figureIds.ts` were in fact touched in the same commit (`a78d6a3`, 78 added lines), so someone's
  work landed there — but not `S320_IMPL_A4_A10.md`'s declared, content-JSON-only packet, and no
  REVISE contract in the four ASSESS files given to this verifier authorized a `figures.tsx` edit
  for this item (only A10's contract *suggested* it as one acceptable option, without granting scope
  to this specific implementer). This verifier treats the unattributed, unauthorized figure change as
  **not** a verified closure of the contract (per "an implementation worker cannot assess or close
  its own packet" / no self-authorization), and signs REVISE accordingly, per explicit task
  direction. A human should reconcile which packet actually owns this figure change and whether it
  needs its own signed disposition.

- **`alg1-04-03` / `i2.e2`** (impl-5) — disclosed residual, not blocking. `S320_IMPL_A8.md` honestly
  flags that `i2`'s `e2` (`3x+7<7x−5`) is byte-identical to this same lesson's `ch1` equation; the
  contract named only `e1`/`e3` for replacement, so `e2` was correctly left out of scope. Verified
  accurate (`ch1`'s prompt is confirmed identical). Recorded as open debt for a future disposition;
  does not affect `alg1-04-03`'s KEEP verdict since its own contract was fully satisfied.

- **`g1s-01-02` / `k2`** (impl-4) — disclosed residual, not blocking. The contract's Defect section
  named `k2` as part of a 4-lesson bare-triangle-corners duplicate cluster, but its Fix paragraph for
  this lesson only mandated action on `k1`/`ch1`. The implementer reworded `k2`'s prompt cosmetically
  ("How many corners can you count on a triangle?") without changing the shape/number, which clears
  the assessment's own exact-text duplicate scanner but leaves the same underlying fact (triangle has
  3 corners) tested three ways across three lessons in substance. Contract-compliant as literally
  written; recorded as open debt, not blocking KEEP.

## Raw data

- Dispositions: `reports/closure/cowork-staging/laneV-s321-impl456-dispositions.jsonl` (59 records)
- This report: `reports/closure/S321_VERIFY_IMPL456.md`
- Contracts read: `reports/closure/S320_ASSESS_A13.md`, `S320_ASSESS_A8.md`, `S320_ASSESS_A4.md`,
  `S320_ASSESS_A10.md`
- Implementer claims read (after forming independent view): `reports/closure/S320_IMPL_A13.md`,
  `S320_IMPL_A8.md`, `S320_IMPL_A4_A10.md`, plus
  `reports/closure/cowork-staging/laneA-s320-impl-{4,5,6}.jsonl`
- No file under `content/` or `src/` was modified by this verification. No `npm`/`vitest`/`tsc` was
  run.
