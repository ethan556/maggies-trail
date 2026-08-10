# Maggie's Trail Session 94 — Whole-Package Audit and Repair

**Audit date:** 2026-07-23  
**Input:** `maggies-trail-session-94.tar.gz`  
**Scope:** archive integrity, source-tree hygiene, application and curriculum source syntax, local import/link integrity, content JSON, CML integration, Geometry engines, runtime variant generators, and release packaging.

## Executive result

The Session 94 Geometry implementation and curriculum data passed every dependency-free release gate available in the package. One confirmed whole-package release defect was found and repaired: the archive contained 93 compiler-emitted `.jsx` files beside their canonical `.tsx` sources. The emitted files were removed, and the native integrity gate was strengthened so duplicate emitted JavaScript and generated build artifacts cannot be shipped unnoticed in future releases.

No authored lesson, course, API, manipulative, generator, or canonical TypeScript/TSX source was changed by this repair.

## Confirmed defect repaired

### Stale emitted JSX shadow copies

- **Found:** 93 `.jsx` files, all with same-path `.tsx` counterparts.
- **Evidence:** emitted files were newer, type-erased compiler output; the project has `allowJs: false`, `noEmit: true`, and includes canonical `src/**/*.tsx` sources.
- **Risk:** framework/module resolution can select stale emitted files, and duplicate App Router entries such as `layout`, `page`, `error`, and `not-found` can make clean-build behavior differ from the audited TypeScript source.
- **Fix:** removed all 93 emitted `.jsx` siblings; retained every `.tsx` source.
- **Prevention:** extended `scripts/native-integrity.mjs` to reject:
  - `.jsx` beside `.tsx`
  - `.js` beside `.ts`
  - `.mjs` beside `.mts`
  - `.cjs` beside `.cts`
  - source releases containing `node_modules`, `.next`, `.cml-build`, `coverage`, `test-results`, `playwright-report`, `.turbo`, `.tsbuildinfo`, logs, or temp files.

## Final validation

| Gate | Result |
|---|---:|
| Archive/source JSON parse | PASS — 1,281 JSON files |
| TypeScript-family syntax parse | PASS — 290 files, 0 syntax errors |
| Registration consistency | PASS |
| Native integrity | PASS — 573 source files, 720 local imports, 38 internal links, 15 API routes |
| CML strict lint | PASS — 0 errors |
| CML integration | PASS — 18 flagship pilots, 68 direct-engine profiles, 1,129 lesson files |
| CML foundation compile/self-test | PASS |
| Geometry engine verification | PASS — 3 new engines, 9 flagship courses, 18 evaluator assertions, 8 independent checks |
| Runtime declaration/route gates | PASS — 417 generators, 1,157 routes, 3,620 declarations, 54,300 checks, 39,330 builds |
| Whole generator registry | PASS — 262,200 builds |
| Focused Geometry compiler/evaluator verification | PASS — 186,300 builds, 186,300 independent checks, 86,940 evaluator builds, 611,214 assertions |
| Geometry refresh coverage | PASS — 487/487 |
| Overall refresh coverage | 3,823/4,471 (85.51%) |

## Advisory findings

Strict CML lint reports **311 advisory warnings but zero errors**. Most warnings identify older lessons whose prediction is not close enough to a direct manipulation or whose flagship remains response-heavy outside its causal pilot. These are pedagogical enhancement opportunities, not malformed content or runtime failures. They were not mass-rewritten in this repair because doing so would alter hundreds of authored lesson sequences without a dedicated curriculum pass.

Several historical chapter-verifier scripts still assume answer fields are authored directly in lesson JSON. Runtime-variant lessons intentionally generate those fields at execution time, so those older scripts can raise `KeyError` for `answer`, `options`, or `items`. The current independent generator, evaluator, declaration, route, and semantic-lock gates supersede those authored-field assumptions. No runtime defect was reproduced from these legacy verifier failures.

## External verification boundary

A clean dependency install could not be completed because the configured package registry returned HTTP 503 for required tarballs, while direct public-registry DNS was unavailable in the execution environment. Therefore the following dependency-backed commands are not claimed in this audit:

- full application `tsc --noEmit`
- Vitest suite
- Next.js production build and framework lint
- Playwright end-to-end suite
- dependency vulnerability audit

The dependency manifests were restored byte-for-byte after temporary installation diagnostics; no dependency substitution or local stub is included in the repaired package.
