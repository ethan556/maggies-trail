# Handover — Session 227

S226 completed the premium rebuild forensic baseline and Wave A mathematics-first lesson shell. Continue in the declared order with **Wave B: canonical math typesetting**.

## Start here

1. Re-read `PREMIUM_REBUILD_EXECUTION_REPORT.md` and `PREMIUM_REBUILD_ADVERSARIAL_QA.md`.
2. Use `MATH_TYPESETTING_AUDIT.csv`; do not rescan by hand or convert all prose indiscriminately.
3. Prioritize learner-visible classification C rows, then B rows with `ascii_notation_risk=yes`.
4. Extend the existing sanctioned KaTeX + MathML path; do not introduce a second renderer.
5. Preserve authored mathematical meaning and screen-reader text. Curriculum changes need a separate content ledger.
6. Re-run 390/768/1440 light/dark and physical keyboard/screen-reader checks where available.

## Known open gates

- CL-P1-044: strict CML 2 errors / 340 warnings in the pre-existing `re-04-02` baseline.
- Full Vitest contains existing MathProse text-query and wider corpus/API failures; do not mask them.
- Windows Node `os.userInfo()` returned ENOMEM after the long global test run, blocking the TSX content/pedagogy commands in S226.
- CL-P1-035 retains physical Tab/Shift+Tab, forced-colors, NVDA/VoiceOver, 200% zoom, and real-device touch.

Do not begin MCQ, prediction, direct-manipulation, or engine waves until the canonical math-rendering boundary and its accessibility contract are sealed.
