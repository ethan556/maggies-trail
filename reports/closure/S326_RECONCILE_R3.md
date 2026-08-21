# S326 RECONCILE R3 — system-wide gates (figures / widgets / variants / precache)

Worker: cowork-s326-R3. Branch: codex/v4-s244-authored-visual-wave. Date: 2026-08-21.
Scope: the SYSTEM-WIDE rows of reports/closure/S325_NEW_PLATFORM_REDS.txt —
figures.labelCollision.s238, widgets.numberLineDirection.s260, widgets.numberLines.s253,
figureTextAdversarialAudit, figureTextAlignment, session244.chatgptWorkPrecache,
variants.delivery.s242 (FLOOR row), variants.resolver (names-a-generator row).
variants.test.ts / variants.prose.test.ts have NO rows in the list (verified by grep) and are
therefore out of the new-red set; only checked for baseline status, not modified.
Method: one vitest process at a time, per-file verbose run first; every reconciliation verified
against a clean-HEAD (a78d6a3) worktree at /tmp/mt-r3 (created via `git worktree add --detach`,
node_modules symlinked; the working tree itself was never touched by git).

## 1. src/components/figures.labelCollision.s238.test.tsx — classification (c) PRE-EXISTING

- Failing row: "every registered figure renders with zero colliding pairs (ledger closed, wave 14)".
- Working-tree failure: exactly ONE figure in the `worse` list — `asv-surface-vs-volume: 2 pairs
  (baseline 0)` ("6 faces"/"= 16 sq units" overlap 50.4×0.6; "4 unit cubes"/"= 4 cu units"
  overlap 86.4×0.6 — the 12 px line gap is 0.6 units smaller than the model's 1.26 em box
  at font-size 10, eps 0.5).
- Root cause: intrinsic to the HEAD geometry. `AsvSurfaceVsVolume` (src/components/figures.tsx:770)
  is byte-identical to `git show HEAD:src/components/figures.tsx` (verified), and
  textBoxes.testkit.ts and the test file are unmodified in the tree.
- Baseline proof: `npx vitest run src/components/figures.labelCollision.s238.test.tsx` in the
  clean a78d6a3 worktree /tmp/mt-r3 fails with the BYTE-IDENTICAL assertion message (same one
  figure, same two pairs, same coordinates). The S325 list row is misfiled as NEW.
- Crucially, this run also proves NONE of the 13 figures added this session (mult3-*, g2l-read-*,
  pc-*, vec-matrix-row-recipe) collide: the working-tree `worse` list contains only the
  pre-existing asv entry, and the other two named-fix tests (waves 10-13, wave 14) PASS in the
  working tree.
- Disposition: document only. Fixing `asv-surface-vs-volume` is outside this packet's authority
  (figures.tsx may only be touched for the 13 new figures); never raise the ratchet. Flagged for
  the figures-authority lane: moving the two caption pairs from y=100/112 to y=99/112 (or
  y=100/113, +0.4 units clearance) closes both pairs without touching any other figure.
- Final result: NOT GREEN (1 of 3 tests red), unchanged from clean HEAD; no new-red remains.

## 2. src/components/widgets.numberLineDirection.s260.test.tsx — classification (a) STALE PIN — GREEN

- Failing row: "pins all 502 authored runtime consumers" — counts came back numberLineHop 431 vs
  pinned 430 (other three types exact). The substantive contract test ("keeps axes, direction
  heads, labels, and ARIA inside every responsive viewBox") PASSED over all 503 consumers, so the
  extra consumer is geometry-compliant.
- Root cause: replayed the test's own corpus() in a node one-off over working tree, clean HEAD
  (/tmp/mt-r3) and the pre-wave commit (/tmp/mt-prev, c977efa). Working tree ≡ HEAD (503/503,
  identical consumer sets). The +1 vs c977efa is exactly
  `number-writing-k/kcw-02-04/ch1` — commit a78d6a3 converted that step subitizeFlash →
  numberLineHop (verified in `git show a78d6a3`), and the pin was never refreshed at commit time.
  So this red is technically pre-existing at HEAD (vitest in /tmp/mt-r3 fails identically), but
  the resolution class is stale pin.
- Signed authority: disposition record `S320-IMPL-A5-kcw-02-04`
  (reports/closure/cowork-staging/laneA-s320-impl-2.jsonl, contract S320_ASSESS_A5.md),
  independently verified KEEP by `S321-V1-kcw-02-04`
  (laneV-s321-impl123-dispositions.jsonl, reviewedBasisHash 564bbe36a0b3…).
- Old → new: numberLineHop 430 → 431; test title "pins all 502" → "pins all 503"; comment added
  citing the records. No assertion weakened — same exact-equality pin, truthful recount.
- Final result: GREEN (2/2 tests pass).

## 3. src/components/widgets.numberLines.s253.test.tsx — classification (a) STALE PIN — GREEN

- Failing row: "pins exactly 493 authored and remedial consumers" — HOPS length 431 vs pinned 430.
  All four substantive tests (63 placement renders, hop-structure renders, contextual titles,
  caret rejection) PASSED, so the extra hop consumer meets the S253 rendering contract.
- Root cause: same single consumer as §2 — number-writing-k/kcw-02-04/ch1
  (subitizeFlash → numberLineHop in commit a78d6a3; pre-existing at clean HEAD, same node-probe
  evidence). The new hop widget has no `denom` and no `hopSizeTargets` (inspected the lesson
  JSON), so the fractionDen=16 / denom=5 / hopSizeTargets=1 sub-pins are untouched — verified
  by the green re-run, which executes those assertions past the repaired length pin.
- Signed authority: S320-IMPL-A5-kcw-02-04 + S321-V1-kcw-02-04 (same records as §2).
- Old → new: HOPS 430 → 431; total 493 → 494; test titles "pins exactly 493" → "pins exactly 494"
  and "renders all 430 hop lines" → "renders all 431 hop lines"; citation comment added.
- Final result: GREEN (5/5 tests pass).

## 4. src/components/figureTextAdversarialAudit.test.tsx — classification (b) REAL (fail-closed containment) — GREEN

- Failing assertion: `blocklistCandidateKeys.every((key) => FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key))`
  — two candidate binding keys were missing from the generated blocklist: `f731297d` and
  `ff2324cb` (identified with a temporary debug copy of the test, deleted after use).
- The two candidates (test's own catalogue rows):
  - division-fluency-g3/df3-02-02 remedials.0.concept, figure `mult3-fact-family`, text
    "Fifty is 5 complete tens, so 50 ÷ 10 = 5." → EXAMPLE_NUMBER_CONFLICT[figure=12+3+4+2;text=5+50+10]
  - division-fluency-g3/df3-03-02 remedials.0.concept, figure `mult3-fact-family`, text
    "To divide 5 by 0, we would need a number that makes 0 × ? = 5. No number works."
    → EXAMPLE_NUMBER_CONFLICT[figure=12+3+4+2;text=5+0]
- Root cause: this wave's signed s323-P3 rebinds (records `s323-P3-df3-02-02`,
  `s323-P3-df3-03-02` in reports/closure/cowork-staging/laneA-s323-P3.jsonl; git diff confirms
  remedials.0.concept.figure mult3-divide-by-ten/-zero → mult3-fact-family) cured the S322-F11
  numeric contradictions but bound a figure whose description numbers {12,3,4,2} are disjoint
  from both remedial texts — which this audit's fail-closed heuristic mechanically classifies as
  an unreviewed high-confidence conflict. Genuinely NEW vs HEAD (bindings differ from HEAD).
- Resolution: regenerated src/lib/figureTextMismatchBlocklist.generated.ts with the test's OWN
  sanctioned path (`UPDATE_FIGURE_TEXT_BLOCKLIST=1 npx vitest run …`, monotonic — adds exactly
  f731297d and ff2324cb, removes nothing). Both placements are now contained
  (SUPPRESS_KNOWN_MISMATCH at runtime via isFigureTextAligned) and join the audit's pending
  replacement queue, per the audit's "hidden content is containment, not completion" contract.
  No lesson JSON changed (the s323-P3 signed bindings stay in place), so no laneA disposition is
  required; the s323 records' own reopenCondition anticipated exactly this ("an assessor
  requires an exact 50/10 [resp. 5/0] figure instantiation — would need a new registered figure
  in src"), which is outside this packet's figure authority. Flagged for the figures lane:
  registering mult3 instantiations for 50÷10=5 and 5÷0 and rebinding would lift the containment.
- Note: FIGURE_TEXT_ADVERSARIAL_AUDIT.csv (tracked, env-gated regeneration) was already stale
  from this wave's ~200 content edits and is asserted by no gate; left untouched.
  PREMIUM_PENDING_WORKLOAD_QUEUE.csv regeneration (Trap K) was NOT run — it would destroy the
  consolidated nine-workstream ledger.
- Final result: GREEN (1/1 test passes).

## 5. src/lib/figureTextAlignment.test.ts — classification (c) PRE-EXISTING

- Failing row: "suppresses every unrelated fixed exemplar across the complete lesson corpus" —
  `expect(safelyWithheld.length).toBeGreaterThan(0)` got 0. The test walks every lesson, collects
  uses of FIXED_EXEMPLAR_FIGURES, and demands at least one use be withheld (mis-aligned).
- Root cause: the corpus has outgrown the sentinel — every remaining fixed-exemplar use is now
  aligned (the S290/S304/S318 waves replaced or withheld every mismatched fixed exemplar, and the
  S324 gate already measured suppressed:0). The assertion fails precisely BECAUSE the corpus is
  fully clean.
- Baseline proof: byte-identical failure at clean HEAD a78d6a3 (`npx vitest run` in /tmp/mt-r3:
  "expected 0 to be greater than 0", same line 42). Misfiled as NEW in the S325 list.
- The §4 blocklist additions do not change this test's universe: `mult3-fact-family` carries no
  admitted numeric claim (absent from FIGURE_NUMERIC_CLAIMS and FIXED_NUMERIC_EXEMPLAR_CONTRACTS,
  verified by grep), so those uses are not fixed-exemplar uses.
- Disposition: document only. The truthful fix is test-side (drop or invert the >0 sentinel on
  safelyWithheld), which is a pin change this packet has no authority over and which the
  reconciliation rules bar as "weakening" without a signed contract. Flagged for the test-owner
  lane. The other three tests in the file pass.
- Final result: NOT GREEN (1 of 4 tests red), unchanged from clean HEAD; no new-red remains.

## 6. src/lib/session244.chatgptWorkPrecache.test.ts — classification (a) STALE PINS + stale tracked manifest — GREEN

- Listed row: "covers the live curriculum with course-granular invalidation". The verbose run
  showed 3 red tests in the file: byte-current manifest (`--check` throws "manifest is stale"),
  the inventory pin (topLevelLessonSteps 15654 vs pinned 15653), and the artifact recordCount
  pins. All three fail at clean HEAD too (/tmp/mt-r3 run: pending-workload 1735 vs pinned 6232,
  same stale-manifest throw) — the pins have been stale since commit a78d6a3 itself ("Queue
  honest state 1,735" was committed without re-pinning), and the working tree drifted further
  under this wave's signed dispositions.
- Resolution:
  1. Regenerated the tracked manifest with the builder's own tool
     (`node scripts/cache/chatgpt-work-v4-cache.mjs`, the test's BUILDER_PATH; --check now
     passes). Diff was 2 lines of manifest + the derived .md — the wave had left it near-current.
  2. Re-pinned truthfully to the builder-derived counts: topLevelLessonSteps 15653 → 15654
     (both the inventory pin and the partition stepCount sum); pending-workload 6232 → 789;
     lesson-review-decisions 455 → 2987; exact-mcq-duplicates 103 → 100; visual-placement-index
     3837 → 3573; choice-surface-index 461 → 259. Unchanged pins (lesson-review-cards 1701,
     standards-dossiers/decisions 6121, standards-lesson-map 1134, strict-cml-ledger 0,
     courses 129, lessons 1701) verified matching.
- Signed authority: commit a78d6a3 (S320-S321: CHOICE lane regenerated 447→252 → index 259;
  queue 6232 → 1735; +1 top-level step, already reflected in HEAD's committed manifest) plus this
  wave's signed staging lanes (reports/closure/cowork-staging/*.jsonl → decisions 2987, queue
  789) and the S324_ENGFIG gate (visual placements 3573). Queue integrity verified before
  re-pinning: PREMIUM_PENDING_WORKLOAD_QUEUE.csv retains its consolidated 9-workstream structure
  (252 CHOICE_SURFACE_INTEGRITY, 176 LESSON_PROGRESSION…, 27 CLOSURE_LEDGER, …) — the 789 is an
  honest disposition shrink, NOT a Trap-K overwrite (which would have left only
  ILLUSTRATION_REPLACEMENT rows).
- Final result: GREEN (6/6 tests pass).

## 7. src/lib/variants.delivery.s242.test.ts — FLOOR row: classification (c) PRE-EXISTING (with wave attribution)

- Listed row: "at least FLOOR pool-eligible practice items are refreshable" (FLOOR = 5900).
  Working tree at packet start: refreshable 5844. Clean HEAD (/tmp/mt-r3): 5849 — ALREADY BELOW
  FLOOR, so the row is red at baseline and misfiled as NEW. The breach predates this wave
  (the floor was set at 6,027; erosion happened across committed waves of signed variant-key
  removals).
- Wave attribution (node replica of the test's own loop with the real variantForStep, tree vs
  /tmp/mt-r3): the −5 from HEAD is exactly {g2p-01-02#k3 (S323 removed the inapplicable
  MmtLengthCompareMcq key), g3f-02-02#ch1 (S324-ENG-PIN removed the Ssg2CompareSharesMcq key),
  kc-03-01#ch1 (signed base-ten-build key removal), tm-04-02#k3, tm-05-02#ch1 (S322-tm-04-02 /
  S322-tm-05-02 renamed forms to unimplemented names — see §9)} — all signed work, no unsigned
  drift. After this packet's §9 dead-declaration removals the truthful count is 5842 (the two
  further steps, tm-05-02#k3 and co-01-03#k1b, were previously counted "refreshable" while
  silently mis-serving the generator's DEFAULT form instead of the authored shape — an honest −2).
- Disposition: document only. The FLOOR's own contract permits lowering "when recording why",
  but that is a variants-lane authority call, not a reconciliation packet's; alternatively,
  implementing the four authored-but-unimplemented forms (spotTheHypError, tmConeToCylinder,
  tmConeCompare, widthFromP) in src/lib/variants.ts would raise refreshable and honor the S322
  authors' intent. Flagged for the variants lane. The companion pre-existing red in this file
  ("serves the declared generator…" — declined rows k100-02-05#k3 ×3 bands, mmt-02-01#ch1 ×3,
  mmt-05-02#k2/#k3 ×…) is byte-identical at clean HEAD (verified) and untouched.
- Final result: NOT GREEN (2 of 9 tests red — both red at clean HEAD with the same assertions);
  no new-red remains; pool 6,700+ and declaration-forwarding contracts all pass.

## 8. src/lib/variants.resolver.test.ts — listed row: classification (b) REAL (wave) + (c) pre-existing first-failure — GREEN (listed row)

- Listed row: "names a generator that exists, and a form that generator implements". Fail-fast
  assertion; the visible failure (co-01-03.json/k1b: parabola-focal lacks widthFromP) is
  byte-identical at clean HEAD — pre-existing. But a full-corpus node replica of the test's own
  declaredSteps()+VARIANT_GENERATORS check found the wave ADDED three more violations hidden
  behind the fail-fast: tm-04-02/k3 `pythagorean/spotTheHypError`, tm-05-02/k3
  `g8-tm-cone-volume/tmConeToCylinder`, tm-05-02/ch1 `g8-tm-cone-volume/tmConeCompare`
  (clean HEAD replica shows ONLY the co-01-03 row).
- Root cause: S322-tm-04-02 and S322-tm-05-02 (laneA-s322-dupfix.jsonl) rewrote the duplicate
  items and renamed the variant forms to match the new item semantics — but the forms were never
  implemented, so the declarations were dead (resolver serves the generator's DEFAULT form or
  declines). co-01-03/k1b (committed in the S319 wave) is the same defect class.
- Resolution (content side, per packet method): removed the four dead `variant` declarations —
  tm-04-02 steps.k3, tm-05-02 steps.k3 + steps.ch1, co-01-03 steps.k1b. Authored widgets,
  options, feedback, evaluators untouched; Lesson.parse + lintLesson clean on all three files.
  Redeclaring to an implemented form was rejected in each case because every implemented form
  regenerates the very template the S322 dedup removed (tmConeFromCylinder ≡ k2's direction;
  legFromHyp ≡ the six-fold template tm-04-02 was de-duplicated from; dishForm/focusPoint ≡
  co-01-03's sibling equation→p direction) — a refresh would betray the signed dedup intent.
- Corrective dispositions: reports/closure/cowork-staging/laneA-s326-R3.jsonl — records
  `s326-R3-tm-04-02`, `s326-R3-tm-05-02`, `s326-R3-co-01-03` (reviewer cowork-s326-R3,
  evidenceRefs this file, reviewedBasisHash recomputed via
  scripts/audit/lesson-review-authority-s246.mjs loadLessonReviewAuthority).
- Final result: listed row GREEN. File overall 15/17: the two remaining reds
  ("produces the SAME widget surface" and "is FRESH", both k100-02-05.json/k3 —
  k0-count-100 declared on an mcq surface it does not serve) are byte-identical at clean HEAD,
  are NOT in the S325 list, and belong to the k100 content lane — documented, untouched.

## 9. src/lib/variants.test.ts and variants.prose.test.ts — classification (c) NOT IN LIST, pre-existing

- Verified by grep: the S325 list contains NO rows for either file (only the two rows covered in
  §7/§8 mention "variants"). Ran both files in the working tree and in the clean-HEAD worktree:
  variants.test.ts fails 32/3996 (pct-of-number rrPercentContext, the pr-unit-rate-g7 form
  family, pr-test-proportional-g7, pr-constant-k-g7, and the g13-* calculus generators at all
  bands), variants.prose.test.ts fails 6/3084 (g13 differential-equations/integration prose
  gates). The failing-test name sets are IDENTICAL between working tree and clean HEAD
  (diff of sorted verbose output: empty, both files).
- Disposition: pre-existing baseline reds, correctly absent from the new-reds list; nothing
  touched.

## Side-effect verification (no gate newly broken by this packet)

- All 7 suites importing the regenerated blocklist pass: s318G3Figures, s322Figures,
  miscFigures.s316, s317Figures, s319Figures, s318HsFigures, s318G4G7Figures (161/161).
- Suites pinning the edited lessons pass: roundSolidVolume.s119, session291
  transformationsMeasurementFigureChoice (23/23); df3 pin suites + s324Figures pass (34/34).
- scripts/audit/figure-text-alignment.mjs re-run: {"uses":3573+,"fixedExemplars":12,
  "renderedFixed":12,"suppressed":0} — unchanged, since mult3-fact-family is not a fixed
  exemplar; the run also refreshed the tracked FIGURE_TEXT_ALIGNMENT_AUDIT.csv derived artifact
  to the wave's current lesson bodies (28 rows, all reflecting signed S325-lane body edits).
- Baseline worktree /tmp/mt-r3 (git worktree, detached at a78d6a3, node_modules symlinked) left
  in place for the wave's verifiers alongside the sibling agents' mt-head/mt-prev/mt-r1.

## Summary

| # | File | Class | Result |
|---|------|-------|--------|
| 1 | figures.labelCollision.s238.test.tsx | (c) pre-existing (asv-surface-vs-volume, misfiled) | red at baseline, unchanged; no new-red |
| 2 | widgets.numberLineDirection.s260.test.tsx | (a) stale pin (430→431 hops) | GREEN |
| 3 | widgets.numberLines.s253.test.tsx | (a) stale pin (493→494) | GREEN |
| 4 | figureTextAdversarialAudit.test.tsx | (b) real — fail-closed blocklist of 2 s323-P3 bindings | GREEN |
| 5 | figureTextAlignment.test.ts | (c) pre-existing (sentinel outgrown, misfiled) | red at baseline, unchanged; no new-red |
| 6 | session244.chatgptWorkPrecache.test.ts | (a) stale pins + stale manifest | GREEN |
| 7 | variants.delivery.s242.test.ts | (c) pre-existing FLOOR breach (5849@HEAD<5900), wave −7 all signed | red at baseline; no unsigned drift |
| 8 | variants.resolver.test.ts | (b) 3 wave dead declarations + (c) 1 pre-existing, all 4 removed | listed row GREEN; 2 pre-existing k100 rows remain |
| 9 | variants.test.ts / variants.prose.test.ts | (c) not in list, identical at HEAD | untouched |

Counts: (a) stale-pin files reconciled: 3 (§2, §3, §6). (b) real defects fixed: 2 packets of
fixes (§4 blocklist containment ×2 keys; §8 dead declarations ×4, 3 of them wave-added).
(c) pre-existing documented: 5 (§1, §5, §7, §8-partial, §9).
