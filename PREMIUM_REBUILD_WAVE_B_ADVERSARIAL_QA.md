# Premium Rebuild Adversarial QA — S227 Wave B

## Defect ranking

Ranking uses learner harm × frequency × visibility × strategic importance.

| Rank | Finding | Decision |
|---:|---|---|
| 1 | Dark-theme lesson stages used a dark gradient while fixed `text-ink` widgets and equations assumed paper-light stages, producing extremely low contrast. | FIXED at the shared stage contract and pinned in `verify:math-format`. |
| 2 | Caret powers, slash fractions, and radicals could remain author shorthand outside the initial prompt/feedback adoption points. | FIXED through the single boundary and expanded core-surface wiring. |
| 3 | The old parser wrapped every prose token in a span and split balanced powers at spaces. This broke semantic text queries and could emit invalid fragments such as `(x^2` / `y^3)^2`. | FIXED: contiguous prose plus longest-first balanced math islands. |
| 4 | 249 complex or false-positive audit rows cannot be safely converted by a generic parser. | RETAINED for row-level review in `MATH_TYPESETTING_WAVE_B_RESIDUAL.csv`. |
| 5 | `asv-01-01`'s 390 px triangle figure clips the right-side “height” label and overlaps its central label. | OPEN for Wave E visual rebuild; not a typesetting-boundary fix. |

## Adversarial checks

1. **Raw notation — PASS for targets.** Exponent, fraction, and radical targets expose KaTeX/MathML and no visible caret, `1/2`, or raw radical shorthand in the rendered learner text.
2. **Meaning preservation — PASS.** Conversion is display-only. Lesson JSON, evaluator state, answers, error models, XP, hints, and sequence are unchanged.
3. **False-positive resistance — PASS in unit tests.** Dates (`8/10/2026`), URLs, `input/output`, and ordinary prose remain text.
4. **Balanced expressions — PASS.** `(x^2 y^3)^2` is one expression, not two invalid tokens.
5. **Lazy-load fallback — PASS.** Authored notation remains readable before KaTeX loads; raw `\frac`/`\sqrt` source is not shown.
6. **Screen-reader structure — SOURCE PASS / HARDWARE OPEN.** Each target has a MathML tree. Physical NVDA/VoiceOver remains CL-P1-035.
7. **Dark-theme contrast — PASS after repair.** All three dark viewport states use the paper gradient and ink prompt color; measured nominal contrast is 12.96:1.
8. **Responsive overflow — PASS.** 390, 768, and 1440 px light/dark exponent states report `scrollWidth <= innerWidth`.
9. **Target size — PASS in captured states.** Zero visible interactive targets below 44 px.
10. **Keyboard — SOURCE/TEST PASS; browser-wide traversal retained.** Native buttons/inputs remain in source order and the focused keyboard suites remain green. The in-app element-level key API could focus but did not fire native default activation reliably, so physical Tab/Shift+Tab is not falsely claimed.
11. **Reduced motion — no new motion.** The change adds no animation and preserves existing `motion-reduce` contracts; physical preference emulation remains retained.
12. **Build/security — PASS.** Production build emits all routes; offline production dependency audit reports 0 vulnerabilities.

## Reopen conditions

Reopen Wave B if a core lesson/review surface shows caret powers, slash fractions, raw radical shorthand, raw generated TeX, a second renderer, missing MathML, dark-stage ink below AA contrast, page-level horizontal overflow, or a parser false positive that changes the visible mathematical meaning.
