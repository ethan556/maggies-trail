# Mathematical Writing Standard (Phase B, §21)

## The one rule
There is exactly one path from LaTeX to pixels: `src/lib/math/renderMath.ts` (KaTeX,
`htmlAndMathml` so screen readers receive real MathML) rendered through the component pair in
`src/components/math/MathText.tsx` — `MathInline` inside sentences, `MathDisplay` for standalone
equations. `verify:math-format` M1 fails any other katex import in the tree.

## What is and is not math
LaTeX is for **mathematics**: fractions, radicals, exponents, function notation, coordinates,
angle/probability/statistics notation, integrals, matrices, quantities with units. Ordinary UI
numerals — XP, step counts, scores, dates — are text and never routed through the renderer.
Learners never type raw LaTeX, and lesson JSON never contains it (M2 pins the corpus at zero
raw-LaTeX files; authored math will enter through structured fields at adoption time so
evaluator, display, and hint always agree on one source).

## Layout and theme contracts
KaTeX ships no color of its own, so math inherits `color` from its container — which is what
makes the `.stage` contract work unchanged in dark chrome: inside a stage the container is
ink-on-light in both themes. `globals.css` states `color: inherit` explicitly so a future global
KaTeX color rule cannot silently break it, and `.math-display` sets `overflow-x: auto` so a long
derivation scrolls itself rather than the page at 360px. `verify:math-format` M4 fails on the
removal of either. `MathDisplay` reserves height (`minHeight`) before KaTeX's stylesheet arrives — a lesson never
reflows under the learner's finger; M3 fails if the reservation is removed. Colors inherit
`currentColor`, so math is ink-on-light inside `.stage` in both themes, the same rule figures
follow. Invalid tex degrades to escaped plain text and reports the error — it never throws at
a learner and never opens an HTML injection path (tested).

## Adoption status — honest
Phase B ships the pipeline **unwired**: no route imports MathText yet, so today's bundle cost
is zero. KaTeX (~72 KB gz + fonts, lazy-loaded once) is paid only when Phase C adopts it in
surfaces. The LATEX_AUTHORING_GUIDE is deferred to Phase G, written from real usage.
