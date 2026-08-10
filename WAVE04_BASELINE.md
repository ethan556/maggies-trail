# Wave 04 baseline — high-school premium pass

**Session:** S224
**Date:** 2026-08-10
**Status:** Batch 1 of Wave 04; current-source measurement, not historical projection.

## Deployment identity

- Local base `HEAD` and GitHub `main` both resolve to `68b5814f7dcd25562e879ecff64ea073647b2880`.
- GitHub records a successful Vercel **Production** deployment for that exact SHA at 2026-08-10T15:54:43Z.
- `https://maggies-trail.vercel.app/` returns HTTP 200 from Vercel with build marker `CU9JIR_rzFD20qEIRFcCc`.
- Wave 04 changes are uncommitted current-source work and therefore are not claimed to be present on the live alias.

## Direct-source tier result

The live 627-lesson HS corpus measured:

| Tier | Before |
|---|---:|
| A | 365 |
| B | 204 |
| C | 57 |
| D | 1 |

HS A/B coverage was **569/627 = 90.75%**. K–8 remained 821 A / 253 B / 0 C / 0 D. The single HS D lesson was `ep-02-01` (Degree & Like Terms), a load-bearing Algebra I acquisition lesson whose like-term interaction was only an MCQ.

`dr-03-02` (The Quotient Rule) was C-tier. Its acquisition experience explained the minus sign and denominator square through a stepped reveal; the learner could not vary `u′` and `v′` and observe the two ordered products.

## Math typography defect

The screenshot defect was reproduced from current source: `ep-01-02` authored `Simplify (2^4)^2 to 2^?` and the shared prompt boundary emitted it as ordinary text. The corpus contains **1,025 strings across 95 lesson files** with the explicit caret shorthand signal. Maggie already had a sanctioned lazy KaTeX renderer, but it was not wired into lesson routes.

## Security baseline

`npm audit --omit=dev --audit-level=high` found two high-severity libvips advisories through `next@15.5.23 → sharp@0.34.5`. The automated recommendation was a breaking Next 16.3 migration. Current Node 24 satisfies the patched `sharp@0.35.3` runtime floor.

## Ranked defects

Ranking uses learner harm × frequency × visibility × strategic importance on a 1–4 scale.

| Rank | Defect | Score | Decision |
|---|---|---:|---|
| 1 | Raw caret math on learner-facing lesson text | 3×4×4×4 = 192 | CHANGE at shared render boundary |
| 2 | Only HS D-tier lesson uses recognition instead of constructing like-term families | 4×2×4×4 = 128 | CHANGE using existing `dragBucket` |
| 3 | Quotient rule mechanism is passive despite an exact existing engine seam | 4×2×4×4 = 128 | EXTEND `derivativeRuleLab`; ship immediately |
| 4 | High security advisories in production dependency tree | 4×4×1×4 = 64 | PATCH narrow transitive dependency; no blind framework migration |

## Advanced-gap necessity audit

Of the seven historical proposals, quotient mode has the clearest exact fit and reuse seam in this batch. Nested-rule decomposition, u-substitution two-world, error propagation, growth race, movable Rolle interval, and motion odometer remain evidence-supported candidates but require separate state/evaluator designs. They are not collapsed into decorative modes here.
