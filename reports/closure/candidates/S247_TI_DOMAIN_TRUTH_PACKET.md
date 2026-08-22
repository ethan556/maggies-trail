# S247 TI-A mathematical-domain truth packet

Date: 2026-08-18
Scope: `ti-02-03`, `ti-04-03`, one focused regression, and this evidence report only.

## Outcome

The two trigonometric-identity lessons now state the common domain before every cancellation and preserve the original exclusions through concepts, prediction reveals, prompts, explanation variants, option/error feedback, recaps, and remedials. The false claim that identities holding everywhere “can be cancelled anywhere” was removed. Equation work in `ti-04-03` still factors rather than dividing by `sin x`, so the `sin x = 0` solution branch is retained.

## Domain contract implemented

| Original expression | Required common domain | Explicit excluded-value evidence |
| --- | --- | --- |
| `tan θ · cos θ` | `cos θ ≠ 0` | At `θ = π/2`, the original left side is undefined although `sin θ` is defined. |
| `(1 − cos²θ)/sin θ` | `sin θ ≠ 0` | At `θ = 0`, the quotient is undefined although the reduced `sin θ` is defined. |
| `(sec²θ − 1)/tan θ` | `sin θ ≠ 0` and `cos θ ≠ 0` | `θ = 0` makes the denominator zero; `θ = π/2` makes `sec` and `tan` undefined. |
| `cot θ · sin θ` | `sin θ ≠ 0` | At `θ = 0`, the original product is undefined although `cos θ` is defined. |
| `sec θ · cos θ` | `cos θ ≠ 0` | At `θ = π/2`, the original product is undefined although the reduced value `1` is defined. |
| `sin 2θ/sin θ` | `sin θ ≠ 0` | At `θ = 0`, the quotient is undefined although `2 cos θ` is defined. |
| `sin 2θ/cos θ` | `cos θ ≠ 0` | At `θ = π/2`, the quotient is undefined although `2 sin θ` is defined. |
| `cos 2θ/(cos θ − sin θ)` | `cos θ − sin θ ≠ 0` | At `θ = π/4 + kπ`, the quotient is undefined although `cos θ + sin θ` is defined. |

The focused regression independently evaluates all nine representative excluded cases, including both `sin θ = 0` and `cos θ = 0` branches of the secant/tangent quotient. It also asserts that the former unrestricted-cancellation wording cannot return.

## Files and current SHA-256

- `content/courses/trig-identities-equations/lessons/ti-02-03.json` — `7c7d5e876d6c51682e7356c5531b48c792c3f19caf975ec7e9738c9eb0d66eab`
- `content/courses/trig-identities-equations/lessons/ti-04-03.json` — `1baaa5e317e10411caf4a5da2db0c39eb763c5a0d72068a3dc1c0b550f5920a8`
- `src/lib/session247.trigIdentityDomainTruth.test.ts` — `1bce5f20350de206956ebe36f4e5244c26492bfed00cd45ea68ddb88070d4d6e`
- `reports/closure/candidates/S247_TI_DOMAIN_TRUTH_PACKET.md` — this report

## Verification

| Gate | Result |
| --- | --- |
| `npx vitest run src/lib/session247.trigIdentityDomainTruth.test.ts` | PASS — 1 file, 5 tests. Includes `Lesson.parse`, all-widget `WidgetSpec.parse`, `widgetIntegrityErrors`, and `lintLesson` for both lessons. |
| `npm run typecheck` | PASS — `tsc --noEmit`. |
| `npm run cml:lint:strict` | PASS — 0 errors, 0 warnings. |
| `npx eslint src/lib/session247.trigIdentityDomainTruth.test.ts` | PASS — no findings. |
| `git diff --check -- <two lessons> <focused test>` | PASS — no whitespace errors. Git emitted only its configured LF-to-CRLF working-copy advisory. |

## Boundary and integration note

No other trig lesson, generator, renderer, shared queue, review card, cache, or ledger was edited. The existing signed decisions were deliberately not appended or regenerated. Because the lesson basis hashes changed, an independent supersession review should be performed by the serial integrator before any decision closure is claimed.
