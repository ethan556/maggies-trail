# Premium Rebuild Adversarial QA — S226 Wave A

## Verdict

Wave A closes its scoped lesson-shell defect. The active mathematical object begins materially higher in the viewport, the player exposes one lesson heading, and redundant active-work trail chrome is absent. Curriculum mathematics, grading, prediction state, feedback, XP, and completion behavior were not changed.

Whole-program closure remains open. Waves B–J and the retained human/hardware gates are explicitly not claimed complete.

## Like-for-like visual comparison

Target: `in-05-01`, step 3, u-substitution model.

- Baseline 390 px: the model began at roughly y=400 after a waypoint card, resume banner, prose, prediction receipt, and clearing label.
- Wave A 390 px: the model begins at roughly y=262 after the compact header, resume state, prose, and retained causal prediction receipt — about 138 px earlier.
- Baseline 1440 px: the model began at roughly y=347.
- Wave A 1440 px: the model begins at roughly y=238 — about 109 px earlier.
- No mathematical content, equation, answer, or engine state changed between captures.

Evidence is in `PREMIUM_REBUILD_SCREENSHOTS_S226/`.

## Responsive and theme matrix

| Viewport | Light | Dark | Horizontal overflow | Visible controls below 44 px | H1 count | Waypoint / clearing / atmosphere |
|---:|---|---|---|---:|---:|---|
| 390×844 | PASS | PASS | none | 0 | 1 | 0 / 0 / 0 |
| 768×960 | PASS | PASS | none | 0 | 1 | 0 / 0 / 0 |
| 1440×1000 | PASS | PASS | none | 0 | 1 | 0 / 0 / 0 |

The in-app browser reported `scrollWidth <= innerWidth` for all six states. Light-theme scrollbar gutters explain the 15 px smaller document width at 390/768/1440; they are not overflow.

## Adversarial checks

1. **Heading/landmark semantics — PASS.** One level-one lesson heading is in the compact banner; `<main>` is labelled by it; progress remains an accessible `role=img` label such as “Step 3 of 8.”
2. **Touch targets — PASS for captured state.** Exit, Start over, ranges, disclosure, prediction options, and Check produced no visible target below 44×44 px.
3. **Overflow — PASS.** No viewport in the 3×2 matrix exceeded its inner width.
4. **Math legibility — PASS for target state.** The u-substitution model remains KaTeX/MathML-backed, readable in both themes, and no visible caret shorthand appears.
5. **Reduced motion — PASS by change inspection; manual emulation retained.** Wave A adds no animation and preserves `motion-reduce:*` progress/width classes plus the existing `prefers-reduced-motion` CSS contract. The in-app browser does not expose media emulation, so physical reduced-motion review remains a retained manual gate.
6. **Keyboard — no regression found; hardware traversal retained.** Native links, buttons, radios, and ranges remain in source order with visible-focus/44 px contracts. The in-app browser’s element-level key API could not drive browser-wide Tab traversal reliably, so a physical Tab/Shift+Tab pass remains retained rather than falsely claimed.
7. **Forced colors/screen reader — source contract present; hardware pass retained.** Active decorative layers are absent; semantic roles and labels are present. NVDA/VoiceOver and physical forced-colors verification remain CL-P1-035.
8. **Completion regression — PASS in tests.** The focused UI suite retains the completion summit, goal, streak, next lesson, and replay contract.
9. **Curriculum mutation — PASS.** Wave A edits only player presentation/tests/CSS plus audit/report artifacts; no lesson JSON was changed by this wave.
10. **Security — PASS.** `npm audit --omit=dev` reports 0 vulnerabilities.

## Gate exceptions

- Strict CML remains at the known S225 baseline: 2 errors and 340 warnings, with the errors in `re-04-02` (CL-P1-044). Wave A does not touch that lesson.
- Full Vitest did not finish inside the 240 s host limit. A complete seven-file LessonPlayer run finished 34/53 with 19 failures in existing MathProse text-query assertions; the two Wave A presentation suites pass 17/17. These failures have no source overlap with the shell change and are not hidden as green.
- `validate:content` and `lint:pedagogy` could not start after the long global run because Node’s Windows `os.userInfo()` returned `ENOMEM`. The current build, typecheck, registration, and math-format gates succeeded, and Wave A changed no content files. This is recorded as an execution-environment exception, not a content pass.

## Reopen conditions

Reopen Wave A if an active lesson renders a second visible lesson heading, waypoint/clearing chrome, active trail atmosphere, any sub-44 px primary control, horizontal overflow, or a regression in grading/navigation/completion behavior.
