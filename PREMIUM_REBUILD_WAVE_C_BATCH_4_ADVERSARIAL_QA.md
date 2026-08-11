# Premium Rebuild Adversarial QA — S231 Wave C Batch 4

## Findings and decisions

| Rank | Finding | Decision |
|---:|---|---|
| 1 | Twenty-seven clear families exposed keyed answers through length or punctuation across 61 rows. | FIXED; all 61 now report KEEP. |
| 2 | Larger batches risk silently changing unrelated audit decisions. | PREVENTED; zero non-target decision changes and zero row-identity changes. |
| 3 | Concision can remove required mathematical conditions. | PREVENTED; labels retain decisive conditions such as `23 × 24 + 8` rebuilding the dividend with `8 < 24`. |
| 4 | Throughput pressure could pull ambiguous curriculum items into mechanical remediation. | PREVENTED; fastest-strategy, questionable geometry, delicate sequence-premise, and division-by-zero families remain excluded. |

## Checks

1. **Blind-guess heuristic — PASS.** Exactly 61 target rows moved REMEDIATE → KEEP.
2. **Content boundary — PASS.** All 122 content diff lines are keyed-label replacements.
3. **Meaning — PASS.** Each replacement states the same selectable conclusion as its original label; explanation remains in authored feedback.
4. **Distractors and feedback — PASS.** No wrong label, misconception mapping, or feedback string changed.
5. **Correctness — PASS.** No prompt, option ID, correct marker, evaluator, widget, or sequence changed.
6. **Schema — PASS.** All 31 edited JSON files parse.
7. **Regression — PASS.** Typecheck, 303 focused tests, integration, math, engine, visual, production build, and security gates pass.
8. **Known test exception — RETAINED.** The Windows-only systems baseline/path mismatch concerns untouched `se-01-03` and reproduces independently of S231.
9. **Host exceptions — RETAINED.** The two `tsx` content commands fail before project code with the established Windows `uv_os_get_passwd` / `ENOMEM` condition.
10. **Assistive technology — RETAINED.** Physical screen-reader, zoom, forced-colors, keyboard-traversal, and real-device touch testing remain CL-P1-035.

## Remaining scope

572 rows remain. The residual queue now contains fewer repeated clean families and proportionally more singletons, context-sensitive choices, and curriculum-truth questions. Continue in large groups only after separating safe label normalization from content-correction work.
