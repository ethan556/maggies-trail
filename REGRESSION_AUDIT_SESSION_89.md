# Session 89 — Integrated K–8 Causal Mastery Learning

## Result

Session 89 merges the CML foundation overlay into the complete Session 87 application and activates it in the production lesson player.

- 45 profiled direct/supporting manipulative engines.
- 447 K–8 widget steps receive the shared CML layer; 414 receive specialized representation meshes.
- 18 full flagship lesson sequences across Grades 0–8.
- Eight high-leverage manipulatives receive deeper causal behavior.
- K–8 runtime coverage remains 2,214/2,214.
- Overall runtime coverage remains 2,713/4,471 (60.68%).

## Verification

- CML foundation self-test: PASS.
- CML integration check: 18 pilots, 45 profiles, 1,129 lesson JSON files: PASS.
- Representation-mesh smoke: 447 profiled K–8 steps, 414 specialized meshes, 1,242 representation cards, zero exceptions: PASS.
- Pilot manifest verification: PASS.
- Strict CML lint: 0 errors; 348 non-blocking expansion warnings.
- Semantic baseline comparison: 1,129 lesson files, 10,487 steps, exactly 18 CML additions and 2 prediction additions, no other authored drift: PASS.
- Whole registry: 391 generators, 197,640 deterministic builds: PASS.
- Repository declaration gate: 2,510 declarations, 37,650 declaration checks, 29,646 registered builds, 1,131 independent routes: PASS.
- TypeScript-family syntax/semantic gate: 278 files, zero syntax diagnostics, zero `variants.ts` semantic diagnostics: PASS.
- Native integrity: 1,251 JSON files and 580 source files: PASS.
- Course registration consistency: PASS.
- Current coverage audit: 4,471 total assessments, 2,713 runtime-served; every Grade 0–8 assessment served: PASS.

## Content integrity

Only 18 lesson files changed. The permitted changes are:

- one `cml` metadata object on each selected flagship step;
- one new prediction in `mmt-02-03#i1`;
- one new prediction in `dop-02-02#k3`.

No authored question, answer, explanation, figure, widget specification, variant declaration, or step order changed.

## Package-backed gate status

A bounded `npm ci --ignore-scripts --no-audit --no-fund` attempt did not complete within the available execution window. The npm processes and partial dependency tree were removed. Full Next.js typecheck, Vitest, content/pedagogy commands, lint, production build, Playwright, and npm audit remain environment-blocked rather than reported as green.

## Known limitation

This release supplies a system-wide causal shell for profiled direct manipulatives and deeply authors 18 vertical pilots. It does not claim that all 548 K–8 lessons have completed the full CML authoring cycle. The strict lint's 348 warnings are the explicit strand-conversion backlog.
