# Premium Experience Rebuild — S227 Wave B Execution

## Verdict

Wave B seals the shared canonical mathematical-typesetting boundary without changing curriculum mathematics. Author-readable notation remains in lesson JSON; learner-visible caret powers, numeric fractions, radicals, and conservative arithmetic islands are converted at render time through the existing KaTeX `htmlAndMathml` renderer.

No second renderer, raw lesson LaTeX, grading change, answer change, explanation rewrite, sequencing change, or content JSON edit was introduced.

## Evidence-led implementation

The source audit contains 9,576 B/C rows marked `ascii_notation_risk=yes`. The boundary now recognizes the notation signature in 9,327 of those rows (97.4%) across 879 lessons:

- caret powers, including balanced multi-factor expressions such as `(x^2 y^3)^2`;
- numeric fractions such as `1/2`;
- authored `sqrt(...)` and Unicode radical forms such as `√D`, `√(−36)`, and `√|D|`;
- conservative arithmetic/equality islands such as `2x = 8` and `4 + 6 = 10` in long-form learning copy.

The remaining 249 rows are preserved in `MATH_TYPESETTING_WAVE_B_RESIDUAL.csv`. They contain structured/complex notation, operator-field/path false positives, or expressions requiring row-level mathematical review. They were not blindly converted.

## Product surfaces extended

- lesson concept prose and emphasized prose;
- prediction prompts/options and prediction reveal copy for structural notation;
- widget prompts and primary MCQ options for structural notation;
- retry/correct/reveal feedback;
- hint ladders and explanation variants;
- recap takeaways and teasers;
- review/practice bodies, hints, feedback, reveal answers, and explanations;
- mastery-lens headlines, representation values/details, explanation copy, and counterfactual copy.

Plain prose is returned as one contiguous text node. This removed the prior word-by-word span fragmentation and improved the seven-file LessonPlayer result from 34/53 in S226 to 52/53. The single remaining failure is the pre-existing Wave A resume-copy assertion (`Picked up where you left off` versus the current `Resumed at step…` UI).

## Accessibility and presentation contract

- KaTeX continues to emit `htmlAndMathml`; MathML, not an overriding raw-TeX `aria-label`, carries the screen-reader representation.
- Lazy inline rendering shows readable authored notation, never generated TeX commands.
- Display math reserves height but no longer flashes raw TeX while the renderer loads.
- Dates, URLs, slash-separated prose, and already-readable Unicode superscript prose are not reinterpreted.
- The dark lesson stage is restored to its documented ink-on-light contract. The repaired exponent prompt measures ink `rgb(34, 49, 79)` on the paper gradient, approximately 12.96:1 against white.
- `verify:math-format` now fails if the dark stage stops being an ink-on-light mathematical canvas.

## Current-source gates

| Gate | Result |
|---|---|
| TypeScript typecheck | PASS |
| Math/parser focused Vitest | PASS |
| Seven-file LessonPlayer Vitest | 52/53; one pre-existing resume-copy assertion remains |
| Production Next build | PASS — 57 route entries |
| Math-format verifier | PASS — one sanctioned renderer boundary, 0 raw-LaTeX lesson files |
| Engine registration | PASS — 127/127 core-complete; describeState 84/127 |
| Content schema/pedagogy | ENVIRONMENT EXCEPTION — Windows `uv_os_get_passwd` ENOMEM in `tsx`, unchanged from S226 |
| CML | Current census emitted; strict S225 baseline remains CL-P1-044 |
| Dependency security | PASS — offline production audit reports 0 vulnerabilities |
| Curriculum mutation | PASS — no `content/courses` file changed |

## Browser evidence

`PREMIUM_REBUILD_SCREENSHOTS_S227/` contains before/after exponent evidence, the 390/768/1440 light/dark exponent matrix, and 390 px fraction/radical spot checks.

Across the six exponent states:

- 2 KaTeX surfaces and 2 MathML trees were present;
- no visible caret shorthand remained;
- horizontal overflow was absent;
- exactly one H1 remained;
- no visible button, link, or input measured below 44 px.

The fraction screen shows `1/2` as a stacked fraction with no visible slash shorthand. The complex-number screen shows `√D` and `√(−36)` as radicals with no raw root shorthand in the rendered text layer.

## Scope boundary

Wave B does not claim physical NVDA/VoiceOver, 200% zoom, forced-colors, real-device touch, or full browser-wide Tab traversal. Those remain CL-P1-035. A 390 px fraction lesson also exposed a separate pre-existing figure-label crop; it is recorded for Wave E rather than mixed into the shared typesetting change.
