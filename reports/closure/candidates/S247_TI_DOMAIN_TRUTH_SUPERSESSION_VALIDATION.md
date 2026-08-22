# S247 trigonometric domain-truth supersession validation

Status: **PASS — `ti-02-03` becomes `REVISE / PREFERRED / REVISE`; `ti-04-03` becomes `REVISE / PREFERRED / FIT`.** This is a post-append independent authority audit. The validator is read-only and does not mutate the ledger, queue, cards, or cache.

## Independent mathematical audit

All eight cancellation families were recomputed from definitions:

| Expression | Common domain | Independent result |
| --- | --- | --- |
| `tan θ · cos θ` | `cos θ ≠ 0` | Reduces to `sin θ`; zeros of cosine remain excluded. |
| `(1 − cos²θ)/sin θ` | `sin θ ≠ 0` | Reduces to `sin θ`; zeros of sine remain excluded. |
| `(sec²θ − 1)/tan θ` | `sin θ ≠ 0` and `cos θ ≠ 0` | Reduces to `tan θ`; tangent must exist and be nonzero. |
| `cot θ · sin θ` | `sin θ ≠ 0` | Reduces to `cos θ`; zeros of sine remain excluded. |
| `sec θ · cos θ` | `cos θ ≠ 0` | Reduces to `1`; zeros of cosine remain excluded. |
| `sin 2θ/sin θ` | `sin θ ≠ 0` | Reduces to `2 cos θ`; zeros of sine remain excluded. |
| `sin 2θ/cos θ` | `cos θ ≠ 0` | Reduces to `2 sin θ`; zeros of cosine remain excluded. |
| `cos 2θ/(cos θ − sin θ)` | `cos θ − sin θ ≠ 0` | Factors to `cos θ + sin θ`; `θ = π/4 + kπ` remains excluded. |

The repaired JSON states these restrictions across concepts, prediction reveals, prompts, explanations, answer feedback, recap, and remedials. The equation work is also correct: `sin 2x = sin x` has `0, π/3, π, 5π/3` on `[0,2π)`, with sum `3π`; `cos 2x = cos x` has `0, 2π/3, 4π/3`, with sum `2π`.

## Disposition results

`ti-02-03` clears its former domain-truth blocker. It stays `REVISE` because the correct k1 option alone announces that the proof is complete, the slogan figures do not represent a cancellation or an excluded input, and the cofunction ghost remains visually coincident at every angle rather than showing the proof quotient becoming undefined. The proof-point metaphor is also unnecessarily dense. These are bounded choice, visual-alignment, language, and rendering/accessibility repairs, not a remaining false textual proof claim.

`ti-04-03` now clears its former learner-visible truth blockers and becomes `REVISE`. `TiDoubleProve` retains the quotient equation but adds visible `only where sin θ ≠ 0` text; its accessible title also states that zeros of sine remain excluded. The `4.19` challenge feedback now truthfully identifies `4.19` as approximately the single root `4π/3`, then adds both nonzero roots to `2π`; `x = 0` correctly adds nothing. The lesson is not `KEEP` because the proof figure remains a textual equation rather than a stepwise domain/cancellation visual, and shared structured-math rendering plus screen-reader runtime evidence is still open.

## Test coverage finding

The focused test now passes six checks. In addition to `Lesson.parse`, `WidgetSpec.parse`, `widgetIntegrityErrors`, `lintLesson`, domain-text assertions, and representative excluded inputs, it inspects the `TiDoubleProve` visible/accessibility restriction and the complete `4.19` misconception feedback. The independent validator separately recomputes the identities and equation roots, checks the same two repaired surfaces, and will require reassessment if either contract changes.

## Authority and post-append verification

- `ti-02-03` live review basis: `cc4fe5e5eca0c428f04aba76f6aca7b4c52f1163cb008ade9363b575e0f878e6`
- `ti-04-03` live review basis: `9ef2282d8356194b354fb6e23265832b466bb02a34dd9bdb1265e1c8288f4496`
- `S247-TI-ti-02-03-DOMAIN-SUPERSESSION` and `S247-TI-ti-04-03-DOMAIN-SUPERSESSION` both resolve `CURRENT_HUMAN_DECISION` and are exact-equal to the two isolated candidate records.
- The authoritative ledger has history `146`, current decisions `140`, and stale decisions `0`.
- Each lesson has zero exact-MCQ duplicate clusters and six candidate standards edges; this packet does not approve standards.
- The validator performs no append simulation now that the record IDs are authoritative; duplicate rejection is the correct behavior for any attempted re-append.

## Reproduction

```text
node reports/closure/candidates/validate-s247-ti-domain-truth-supersession.mjs
pnpm exec vitest run src/lib/session247.trigIdentityDomainTruth.test.ts --pool=threads --maxWorkers=1
```
