# S258 fraction-multiply-g4 source supersession

Date: 2026-08-18
Scope: `content/courses/fraction-multiply-g4` only
Boundary: lesson JSONs plus one idempotent repair, one aggregate regression, and this evidence report. No shared widget, schema, figure-registry, queue, card, cache, ledger, standard, or review-authority changes.

## Result

The S255 source portfolio’s generic 24 illustration replacements and 12 main-route progression repairs remain valid. S258 implements every bounded revision opened by the independent S255 assessment:

- restored all 14 `faWholeTimesFractionNumeric` prompts across 10 lessons to the literal `Compute W × N/D` prefix required by the registered independent solver;
- retained distinct apply, retrieval, and transfer jobs as prompt suffixes;
- synchronized all 11 audited main-route figure placements with explicit, mathematically exact “another example,” same-direction, or inverse-direction transitions;
- added a registered, accessible semantic figure to all 12 remedial concepts;
- replaced all 12 exact-k1 remedial checks with misconception-specific transfer checks;
- removed exact, number-normalized, and full-payload remedial/main collisions;
- retained stable lesson, main-step, remedial-step, and option IDs and preserved evaluator correctness.

The independent assessment projected 33 source revision rows: 12 consolidated lesson revisions, 11 figure-synchronization causes, and 10 lesson-level literal variant-contract causes covering 14 steps. All 33 are implemented in current source. Their authoritative closure still requires an independent reassessment against the new source hashes; the stale S255 candidate was not appended or modified.

## Truth and accessibility checks

- Every numeric target evaluates correct and differs from each authored common error.
- Every MCQ retains exactly one correct stable option and evaluator/feedback agreement.
- Every remedial concept narration equals its learner-visible body.
- Every remedial figure is registered and server-renders an SVG title and image role.
- The 11 contextualized main figures state their visible example’s exact quantities before transferring the structure to the adjacent lesson example.
- No learner-visible mathematical falsehood was found in the revised surfaces.

## Reproducible gates

```text
node scripts/audit/repair-fraction-multiply-g4-s258.mjs --check
npx vitest run src/lib/session196.fractionMultiplyG4.test.ts src/lib/session255.fractionMultiplyG4CourseIntegrity.test.tsx src/lib/session258.fractionMultiplyG4Supersession.test.tsx
npm run validate:content
npm run lint:pedagogy
npm run cml:lint:strict
npm run typecheck
npx eslint scripts/audit/repair-fraction-multiply-g4-s258.mjs src/lib/session258.fractionMultiplyG4Supersession.test.tsx
npm run lint
git diff --check
```

Focused result: 24/24 tests pass, including the formerly failing S196 15/15 independent solver gate.
Corpus result: schema 1840/1840, pedagogy 1711/1711, strict CML 0 errors/0 warnings, typecheck clean, owned lint clean.
Final current-source course seal: `a92be55f2aef530768229925aafc3ae48e04f95bce8f5583c39c7a47724e66dc`.

## Files

- 12 lesson JSONs in `content/courses/fraction-multiply-g4/lessons`
- `scripts/audit/repair-fraction-multiply-g4-s258.mjs`
- `src/lib/session258.fractionMultiplyG4Supersession.test.tsx`
- `reports/pedagogy/S258_FRACTION_MULTIPLY_G4_SUPERSESSION.md`
