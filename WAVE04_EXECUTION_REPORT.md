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

---

# S225 HS premium batch 2

**Decision:** BATCH CLOSED; WAVE 04 CONTINUES

## Changed

- Added `derivativeRuleLab` substitution mode with synchronized x-world/u-world KaTeX, exact coefficient reduction, the no-stranded-`x` invariant, accessible state, CML, and evaluator coverage.
- Added shifted-square/Rolle mode to `secantSlope`, tying equal endpoints, zero secant slope, and the interior flat tangent into one movable state.
- Deployed those modes into `in-05-01` and `ca-03-01`, preserving every independent retrieval, challenge, and remedial item.
- Hardened the new range controls for keyboard operation and raised the shared accessible-state disclosure target to 44px.
- Regenerated the current manifest, notebook index, prerequisite graph, and product-state records after the two authorized content edits.

## Refused

- No standalone u-substitution, Rolle, or odometer engine was created.
- Motion odometer was formally refused because `ia-04-01` is already A-tier with exact signed/absolute accumulation.
- Error-propagation and growth-race proposals were not improvised from generic sliders; both remain exact-fit audits.
- No assessment or curriculum mathematics was rewritten.

## Metric delta

- HS tiers: **A 366/B 205/C 56/D 0 -> A 368/B 205/C 54/D 0**.
- HS A/B coverage: **91.07% -> 91.39%**.
- `in-05-01`: C 24 -> A 35.
- `ca-03-01`: C 24 -> A 32.
- Whole corpus: A 1189 / B 458 / C 54 / D 0.

## QA

- TypeScript: PASS.
- Focused + global widget keyboard Vitest: 149/149 PASS; new S225 regression file 3/3 PASS.
- Content schema: 1840/1840 files clean.
- Pedagogy: 1711/1711 files clean.
- Engine registration: 127/127 core-complete.
- Math-format: PASS; two sanctioned KaTeX importers, zero raw-LaTeX lesson files.
- Current corpus state: PASS at SHA-256 `6bd7524b947d1daf9d84d920c895d8366ad7e1b160cd19ccc14b9a8f8682ecc8`.
- Production build: PASS under Next 15.5.23.
- Browser: exact u-sub and Rolle target states reached by keyboard at 390x844; MathML present; zero overflow; 44px new controls/disclosure; zero console errors in final pass.
- Production dependency audit: 0 vulnerabilities.
- Strict CML: baseline RED only on the two pre-existing `re-04-02` radical-functions findings; no new S225 error.

## Open

- 54 HS C-tier lessons remain for purpose classification.
- Advanced proposal ledger: quotient, u-substitution, Rolle, and motion are closed; nested rules, error propagation, and growth race remain open.
- CL-P1-033, CL-P1-035, and CL-P1-040 remain open.
- S225 is local and uncommitted; the live alias continues to represent GitHub `main` at base SHA `ed3da510af24becda7589521b2e4f4c02942ccde`.

## Next

Start S226 with nested-rule decomposition at `dr-04-02`; then decide whether error propagation and growth race need authored prompt upgrades, existing-engine extensions, or formal refusal.
