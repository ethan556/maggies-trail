# Session 91 — Seven Causal Manipulative Laboratories

## Result

Session 91 creates seven production manipulative engines and integrates them into 16 K–8 lesson steps. Each engine includes schema validation, rendering, state evaluation, check readiness, correct-answer narration, process telemetry, accessibility narration, stage-width policy, pedagogy-path enumeration, CML profile, specialized representation mesh, capability score, and gallery sample.

New engine types:

- `lineRelationLab`
- `triangleAngleLab`
- `verticalLineScanner`
- `covariationScrubber`
- `samplingBiasLab`
- `shapeFamilyBuilder`
- `unitRuler`

## Integration count

- `lineRelationLab`: 2 lessons
- `triangleAngleLab`: 1 lesson
- `verticalLineScanner`: 1 lesson
- `covariationScrubber`: 3 lessons
- `samplingBiasLab`: 3 lessons
- `shapeFamilyBuilder`: 3 lessons
- `unitRuler`: 3 lessons

Total: **16 lesson steps across Kindergarten through Grade 8**.

## Targeted verification

- 16 integrated lesson steps found; exact per-engine distribution verified.
- All 16 are flagship CML steps with prediction, invariant, misconception model, explanation, counterfactual, representation translation, fading, transfer family, and delayed retrieval.
- 58 production evaluator paths exercised.
- 339 targeted assertions passed.
- Independent mathematical truth checks cover line relation, triangle angles, function verdict, affine/proportional covariation, sample-design thresholds, shape attributes, and unit iteration.
- 48 linked representation cards generated for the 16 target steps.
- Every new engine has renderer, gallery sample, CML profile, and flagship capability profile.

## Whole-app verification

- CML integration: 18 original manifest pilots, 53 direct-engine profiles, 1,129 lesson JSON files parsed: PASS.
- CML audit: 548 K–8 lessons, 5,208 steps, 3,456 widget steps, zero parse errors.
- Specialized mesh smoke: 461/461 profiled K–8 steps, 1,383 cards, zero exceptions: PASS.
- Strict CML lint: 0 errors; 344 non-blocking strand-conversion warnings.
- Whole registry: 391 generators, 197,640 deterministic builds: PASS.
- Repository gate: 2,510 declarations, 37,650 declaration checks, 29,646 registered builds, 1,131 independent routes: PASS.
- Runtime coverage: 2,713/4,471 overall; every Grade 0–8 assessment served: PASS.
- TypeScript-family syntax: 278 files, zero syntax diagnostics: PASS.
- `variants.ts` strict semantic diagnostics: zero: PASS.
- Native integrity and course registration: PASS.

## Semantic content integrity

A semantic comparison against Session 90 checks all 1,129 lesson files.

- Changed lesson files: 16.
- Changed steps: 16.
- Allowed changed fields: `body`, `widget`, `predict`, and `cml`.
- Variant changes: zero.
- Unrelated authored-content drift: zero.

## Generated records

After the integration, the canonical generated records were refreshed:

- 93 widget types.
- 87 interactive manipulative types.
- 153 MCQ-heavy lessons.
- 7 reading-heavy lessons.
- 579 flagship-ranked lessons.

## Package-backed gate status

A bounded `npm ci --ignore-scripts --no-audit --no-fund` attempt stalled silently beyond the execution window. Its timeout wrapper also failed to reap the child npm process, so both processes were terminated explicitly and the partial `node_modules` tree was removed. Next.js typecheck, full Vitest, package-backed content/pedagogy validation, lint, production build, Playwright, and npm audit remain environment-blocked rather than reported as green. No dependency, build, coverage, or browser-test residue is included in the release.
