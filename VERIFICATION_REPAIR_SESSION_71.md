# Session 71 — Verification invariant repair

Session 71 repairs the verification and packaging defects reported after Session 70. Curriculum
coverage and authored lesson content are unchanged; this is a gate, test, presentation, and release
integrity pass.

## Blocking invariant repairs

- Added callable independent routes for all thirteen previously unverified Grade 7 generator families:
  `g7-tse-expression-build`, `g7-tse-inequality-build`, `g7-tse-evaluate-distribution`,
  `g7-tse-context-equation`, `g7-tse-balance-solve`, `g7-sp-sample-estimate`, `g7-sp-gap-units`,
  `g7-sp-counting-principle`, `g7-sp-sampling-bias`, `g7-sp-sample-reliability`,
  `g7-sp-overlap-interpret`, `g7-sp-likelihood-words`, and `g7-sp-compound-model`.
- Added dedicated `columnCalc` and `solveBalance` branches to the standing variant gate. Both branches
  validate the independently reconstructed answer, actual evaluator behavior, reachable diagnostic
  states, feedback floors, and deterministic output.
- Corrected the vertical-angle independent route so adjacent angles are derived from the 180-degree
  supplement rather than an incompatible rule.
- The gate still fails closed when a registered generator lacks an independent route; all 354
  registered generator families now have one.

## Parser and registry repairs

- Updated `equal-parts@whyEqualEvidence` to derive the correct option from equal-piece evidence.
- Updated both bivariate relative-frequency routes to parse adults, students, and returning customers.
- Removed the shadowed `perimeter` and `missing-side` aliases and the dead rectangle-side parser.
  The live triangle `missing-side` route is now the single authoritative path.
- Added the missing Grade 7 band declarations for all thirteen repaired families.

## Learner-facing quality repairs

- Corrected singular/plural output such as `1 place`.
- Removed raw binary floating-point tails and truncated decimal representations.
- Removed the repeated phrase `value value`.
- Expanded short prompts and feedback below the standing floors.
- Broadened every `g8-esn-power-meaning` form to at least four deterministic problem states per band,
  including zero powers, negative powers, deep negative powers, and decimal-to-power conversion.
- Corrected the categorical-association MCQ verifier so its label agrees with the generated answer.

## Type, environment, and packaging repairs

- Replaced the nonexistent `repeatedWrongDrop` test signal with the real kebab-case signal.
- Removed tuple-union spread expressions that caused TS2556 diagnostics.
- Marked storage and account browser tests for jsdom and supplied a deterministic fetch stub.
- Restored `tailwind.config.ts`, including the `paper` color used by `bg-paper` and the retained design
  tokens used throughout the application.

## Verification performed

- 89,100 focused independent checks across the reported G7 and G8 defects.
- 74,400 checks executing the actual `INDEPENDENT` routes extracted from the standing gate.
- 12,000 evaluator-level checks for `columnCalc` and `solveBalance`.
- 6,000 targeted checks for the categorical-rate MCQ and live `missing-side` route.
- All 354 registered generator families have callable independent routes.
- 1,231 JSON files parse; native integrity reports 547 source files, 678 local imports, 38 internal
  links, 133 native buttons, and 15 bounded API routes.
- 266 executable TypeScript/TSX/MTS files syntax-transpile with zero diagnostics.
- Registration remains consistent across lesson files, course registries, and `PLAN.md`.

A bounded dependency restoration attempt again hung silently and produced no usable package tree. The
orphaned process and all partial dependency/build/test residue were removed. Full package-backed
Vitest, typecheck, lint, production build, Playwright, schema/pedagogy commands, and npm audit remain
environment-blocked rather than recorded as green.
