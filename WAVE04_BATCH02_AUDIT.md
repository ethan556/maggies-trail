# Wave 04 batch-2 product-shell audit - S225

## Outcome

Batch 2 is closed. Two passive, load-bearing calculus acquisition surfaces now use exact interactive models, no curriculum mathematics changed, and current-source verification is green except for the explicitly retained pre-existing strict-CML baseline.

## Ranked evidence

Scoring is learner harm x frequency x visibility x strategic importance, each 1-4.

| Rank | Finding | Score | Decision | Result |
|---|---|---:|---|---|
| 1 | U-substitution acquisition did not let the learner consume `2x dx` into `du` or inspect the no-stranded-`x` invariant | 4x2x4x4 = 128 | CHANGE | `in-05-01` C24 -> A35 |
| 2 | Rolle acquisition did not connect equal endpoints, zero secant, and the interior flat tangent in one state | 4x2x4x4 = 128 | CHANGE | `ca-03-01` C24 -> A32 |
| 3 | New range controls exposed focus but initially failed the automated keyboard path | 4x2x4x4 = 128 | CHANGE | Explicit arrow/Home/End semantics; exact browser targets reached |
| 4 | Shared accessible-state disclosure measured 16px high | 3x4x3x3 = 108 | CHANGE | Final target 305x44 CSS px |
| 5 | Proposed motion odometer duplicates a strong exact accumulation model | 1x1x2x2 = 4 | REFUSE | `ia-04-01` remains A32 with no new engine |

## Audit steps

1. **Production baseline:** captured the live passive u-substitution and Rolle step-3 surfaces at 390x844.
2. **Current-source model:** implemented exact modes inside existing engines and authored them into the two target lessons.
3. **Mathematical falsification:** reached factor 2 / power 3 in u-substitution and endpoint B=4 in Rolle; visible, accessible, symbolic, and evaluator states agree.
4. **Notation:** fixed an initial visible `qquad` escape defect; final browser has four MathML trees and no raw escape artifact.
5. **Keyboard:** ArrowLeft/Right/Up/Down and Home/End are explicit; focused and global keyboard tests pass 149/149.
6. **Pointer/touch:** native ranges retain pointer input, are 44px high, and Rolle retains direct SVG endpoint manipulation. Physical-device touch remains a manual gate.
7. **Accessibility:** exact labels, role-image state descriptions, live readouts, MathML, and a 44px disclosure target are present.
8. **Motion:** Rolle geometry is static under reduced motion and transitions only under `prefers-reduced-motion: no-preference`.
9. **Responsive shell:** mobile layouts are single-column with zero measured horizontal overflow and no clipped mathematical state.
10. **Quality/security:** typecheck, focused tests, schema, pedagogy, registration, math-format, corpus identity, production build, and dependency audit pass.

## Screenshot evidence

| State | U-substitution | Rolle |
|---|---|---|
| Live production baseline | `WAVE04_SCREENSHOTS_BATCH02/01-live-usub-passive.png` | `WAVE04_SCREENSHOTS_BATCH02/02-live-rolle-passive.png` |
| Current-source result | `WAVE04_SCREENSHOTS_BATCH02/03-fixed-usub-mobile.png` | `WAVE04_SCREENSHOTS_BATCH02/04-fixed-rolle-mobile.png` |

## Retained risks

- Strict CML remains red on two pre-existing `re-04-02` radical-functions findings; S225 adds no strict error.
- The full Windows Vitest baseline remains CL-P1-033; this batch's affected and global keyboard scope is green.
- Physical NVDA/VoiceOver, 200% zoom, real-device touch, and reduced-motion OS checks remain CL-P1-035.
- Wave 04 stays open with 54 HS C-tier lessons and three unresolved advanced proposals.
