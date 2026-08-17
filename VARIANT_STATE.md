# Variant generation — current state

Rewrite this file at the end of every session. Keep it short; the running ledger lives in
`VARIANT_LOG.md`.

## Coverage (re-measured 2026-08-15, S242, seal 2d5f39f)

`VARIANT_GENERATORS.length` is **442**. The repository contains **5,897 declarations** across
**429** distinct generators; 13 generators are reached by tag/alias only.

**DELIVERED on Practice/Review: 6,027 of 6,762 pool-eligible items (89.1%).**

The figures above replace the long-standing 434 / 4,268 / 4,471 line, which was accurate at
Sessions 97–100 and was copied forward unre-run for five weeks. Specifically:

- **434 → 442.** Eight generators were added after S100. Verified by executing
  `VARIANT_GENERATORS.length`, not by parsing.
- **4,268 → 5,897.** Same counting rule (`scripts/verify-global-routes-session98.cjs:19`),
  re-run against the live corpus.
- **"practice-eligible 4,471 | REFRESHED 4,471 (100%)" was never a variant statistic.** 4,471 was
  the S83–S90 *total assessment* denominator. The corresponding number today is 6,762
  pool-eligible practice items, of which 6,027 refresh.

**Runtime resolution, not declaration count, remains the coverage authority — and S242 found that
the two had silently diverged.** Until S242, Practice and Review discarded `step.variant` in their
pool builders and pre-filtered on `hasVariants(conceptTag)` before the resolver ran, so only
**419 of 6,762 items (6.2%)** actually refreshed and **457 of 526 chapters had none at all**. The
generators, seeds and determinism proof were correct throughout; only the wiring was not. The
ratchet in `src/lib/variants.delivery.s242.test.ts` now fails closed if that regresses.

Mastery Studio was never affected — it passes the real `TStep`.

## Completed sequence

- Grades 0–8: **2,214/2,214 (100%)**.
- Grade 9 / Algebra I: **384/384 (100%)**.
- Grade 10 / Geometry: **487/487 (100%)**.
- Grade 10 / Conditional Probability: **76/76 (100%)**.
- Grade 11 / Algebra II: **515/515 (100%)**.
- Grade 12 / Precalculus: **483/483 (100%)**.
- Grade 13 / Calculus: **312/312 (100%)**.
- Overall: **4,471/4,471 (100%)**.

## Session-97 workflow state

The plan → compile → lock → verify compiler completes 27 Conditional Probability gaps through 21
forms and one reusable generator family. `statProbabilityIndependent.cjs` reconstructs truth from
learner-visible prompts and state.

The domain audit reviews 164 interactive steps and identifies 45 true mathematical manipulatives.
All 45 have explicit CML contracts: nine flagships and 36 supporting wires. Existing simulation,
distribution, sampling, regression, and inference engines were retained. One missing causal laboratory,
`conditionalTableLab`, was added to make the conditioned denominator and reversed conditional live.

## Verification status

- 21 forms passed **18,900** focused deterministic builds and independent checks.
- Evaluator checks passed **8,820** builds and **60,900** assertions.
- The whole-registry audit passed **434 generators and 305,400 builds**.
- All generators have callable base routes through **1,174 independent routes**.
- **4,268 declarations** pass **64,020** cross-band checks; **45,810** registered-form builds pass.
- Native integrity, registration, JSON parsing, TypeScript-family syntax, strict CML lint, CML
  integration, statistics/probability engine verification, and semantic comparison pass.
- All 1,129 lesson files show exactly 27 declaration additions, 38 CML additions, one prediction, one
  intentional lab replacement, and zero unauthorized drift.

Package-backed gates remain dependent on a healthy npm registry. The environment's injected
Artifactory endpoint timed out during the Session 97 preflight; this boundary is recorded in
`REGRESSION_AUDIT_SESSION_97.md`.

## Next efficient step

Run the dependency-backed typecheck, unit tests, production build, Playwright suite, and vulnerability
scan in a connected environment; then address the remaining advisory CML pedagogy backlog without
changing the now-complete runtime coverage.

## Session 132 update

The runtime declaration count is unchanged; seven existing `prob-fraction` declarations now use causal forms `trialRelFreq` or `trialTheoretical`. Variant coverage remains complete. The new forms preserve the authored probability action and are gated against rational answer/trap collisions.

## Session 133 update

The runtime declaration count is unchanged. Four existing compound-event declarations now resolve to `compoundEventLab`, preserving their authored form IDs while making stage factors, complete sample spaces, and count/probability truth visible. Variant coverage remains complete; the Session-133 seed sweep enforces surface continuity and the 120-outcome rendering ceiling.


## Session 242 update (2026-08-17)

Declaration count moves 5,897 → **5,895**: two `mbPrimeCompositeNumeric` declarations withdrawn as
rule-7 rejections (below). No declarations added — this session repaired existing generators
against the S242 register rather than extending coverage.

**Permanent rejections (running list — additions this session):**

- `g4p-02-01/k2`, `g4p-02-02/k2` — "What is the smallest prime number?" is a single-fact item; a
  generator would emit an identical widget forever. The form they declared
  (`mbPrimeCompositeNumeric`) generated an unrelated question whose answer coincided at 2, which
  three checks each pinned as truth. Withdrawn 2026-08-17; see VARIANT_LOG S242.
- Standing earlier rejections remain as recorded in VARIANT_LOG (single-fact items, closed fact
  sets). GRB-04's exhausted audit now also carries 17 `cosmetic-only` pairs — many prompts, ONE
  answer — where widening is the anti-pattern; they are recorded in
  `reports/generator-audit/GENERATOR_EXHAUSTED_BY_SUBJECT.csv` and must not be "fixed" by adding
  nouns.

**Next 3 targets by leverage, with the reason:**

1. **The 256 under-parameterised GRB-04 pairs**, batch of 5–10 families by
   `scripts/audit/exhausted-leverage.mts` harm order (declarations × window shortfall) —
   `g1-shapes-measure` (6 thin forms, 40 declarations) and `g2-shapes-shares` head the family
   list. Anti-repeat (GEN-04) is live, so pool width is now the binding constraint.
2. **The 143 CML prediction-not-causal lessons with no manipulative step anywhere**
   (`reports/CML01_BURNDOWN.csv`) — the waivers expire 2026-11-13 and these need an interactive
   surface BUILT, not re-sequenced. Highest calendar risk in the whole register.
3. **The 14 remaining `cosmetic-only` pairs not yet repaired** — same defect class as
   `compareNegativeFractions`/`trailingMatchCount` (many prompts, one answer): each needs the
   missing mathematical dimension, or a rule-7 rejection if none exists.

**Gate results at close (all green):** 4 vitest shards 5642/4354/2461/1473 (+1 skipped) ·
variants gate 3996/3996 · schema 1840/1840 · pedagogy 1711/1711 · registration consistent ·
native 4 archive-only · build EXIT:0 · generated sweep 102,281 samples, 0 throws ·
GENERATOR_MATH_PRESENTATION_AUDIT 0 rows · generated MCQ hard leaks 0.
