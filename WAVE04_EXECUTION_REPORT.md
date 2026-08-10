# Wave 04 execution report — S224 HS premium batch 1

**Decision:** BATCH CLOSED; WAVE 04 CONTINUES

## CHANGED

- Wired authored exponent shorthand through the existing lazy KaTeX/MathML pipeline across core lesson text surfaces.
- Made `verify:math-format` platform-neutral so it executes on Windows.
- Replaced `ep-02-01`’s like-term MCQ with a keyboard/touch equivalence-class sorting model.
- Added quotient mode to `derivativeRuleLab` and deployed it in `dr-03-02`.
- Pinned transitive `sharp` to patched 0.35.3 without a breaking Next migration.

## REFUSED

- No raw LaTeX commands were bulk-written into lesson JSON.
- No generic slider, decorative drag, or new standalone engine was added.
- No retrieval, fluency, mastery, or assessment question was replaced.
- Six advanced proposals were not improvised without exact state/evaluator contracts.

## MATHEMATICAL DELTA

Authored mathematics is unchanged by typography. The quotient model now derives the ordered numerator and denominator square live. Like terms are classified by full variable/exponent signature.

## PEDAGOGICAL DELTA

**Before:** exponent notation could display as programming-like carets; like terms were recognized once; the quotient mechanism was read.
**After:** notation is typeset and screen-reader backed; learners construct like-term families; learners cause both quotient numerator products and the signed rate to change.
**Causal mechanism:** rate controls → ordered products → signed difference → quotient rate.
**Misconception exposed:** coefficient/sign determines family; quotient products may be reversed; denominator may be left unsquared.
**Transfer:** all existing independent degree/coefficient and quotient numeric checks remain.

## VISUAL DELTA

`(2^4)^2` and `2^?` render as properly stacked KaTeX exponents at 390px. The quotient lab uses a restrained two-term numerator, fraction bar, exact readouts, and single-column mobile controls.

## METRIC DELTA

- HS tiers: **A 365/B 204/C 57/D 1 → A 366/B 205/C 56/D 0**.
- HS A/B lesson coverage: **90.75% → 91.07%**.
- `ep-02-01`: D 24 → B 27.
- `dr-03-02`: C → A 35.
- Production dependency audit: **2 high → 0 vulnerabilities**.

## QA

- TypeScript: PASS.
- Focused Vitest: 13/13 PASS.
- Content schema: PASS, 1,701 unique lessons.
- Pedagogy: 1,711/1,711 files clean.
- Course + engine registration: PASS, 127/127 core-complete.
- Math-format gate: PASS; two sanctioned importers, zero raw-LaTeX lesson files.
- Production build: PASS under Next 15.5.23 + sharp 0.35.3.
- Playwright affected-flow checks: PASS at 390px; keyboard and accessible-state assertions included.
- Production dependency audit: 0 vulnerabilities.
- S146 sealed authored-preservation audit: PASS, 37/37 after platform-neutral UTF-8/path/newline handling and exact authorization of the two S224 lesson files.
- Generated-artifact sweep: PASS through S146 and the S147 source/variant checks; the next historical Python authored audit remains Windows-blocked by the same legacy byte/path assumptions. Its false regenerated failure output was discarded. Current corpus state is independently fresh and green.

## REGRESSIONS

None found in the affected mathematical, content, responsive, accessibility, build, or security scopes. Existing repository-wide lint warnings remain visible and unchanged in character.

## OPEN

- 56 HS C-tier lessons remain; they require purpose classification rather than mechanical conversion.
- Six advanced proposals remain: nested-rule decomposition, u-substitution two-world, error propagation, growth race, movable Rolle interval, motion odometer.
- CL-P1-033 and CL-P1-035 remain open.
- The live production alias still serves GitHub `main` at base SHA `68b5814f7dcd25562e879ecff64ea073647b2880`; this Wave 04 work has not been pushed or deployed.

## NEXT

Continue Wave 04 with the six advanced necessity audits, beginning with u-substitution and movable Rolle because their current concept-acquisition lessons remain passive and strategically important.
