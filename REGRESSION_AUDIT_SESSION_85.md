# Session 85 — Grade 0 compiler completion

## Result

Session 85 applies the manifest-driven variant batch compiler to every remaining Grade-0 runtime gap and extends the compiler so early-learning manipulatives are first-class verified surfaces rather than special cases.

- Grade 0: **32/88 (36.36%) → 88/88 (100%)**
- Overall: **2,332/4,471 (52.16%) → 2,388/4,471 (53.41%)**

Course results:

- `counting-to-20-k`: **22/52 → 52/52** (+30)
- `shapes-and-sorting-k`: **10/36 → 36/36** (+26)

Grades 0 and 3–8 are now runtime-complete.

## Compiler upgrade

Grade 0 required the generic verifier to reason about learner actions rather than only typed answers. The workflow now treats these early-learning surfaces as reusable compiler contracts:

- `subitizeFlash`
- `numberLineHop`
- `dragOrder`
- `tapDiagram`
- `tenFrame`
- `matchPairs`
- `lengthCompare`, including alignment mode

For each surface, the verifier serializes only learner-visible state, asks the independent solver to reconstruct the mathematical target, maps that meaning back to widget IDs where necessary, and then exercises the production evaluator against every reachable diagnostic state.

The standing repository gate was upgraded in parallel: both Grade-0 generator families have registered independent base routes, `subitizeFlash` now has a full standing integrity branch, and the shared length-comparison gate handles visible measurements and alignment-aware submissions.

## Implementation profile

- **56 declarations**
- **33 selector groups / focused forms**
- **Two reusable generator families**
- **18 edited lesson files** containing targets
- **22 Grade-0 lesson files** semantically compared against Session 84
- **Zero authored-content changes**
- **Zero non-target declaration changes**

New families:

- `g0-counting`
- `g0-shapes-sorting`

Authored assessment surfaces preserved:

- **24 MCQ**
- **11 `tapDiagram`**
- **6 `numberLineHop`**
- **5 `subitizeFlash`**
- **4 `lengthCompare`**
- **3 `dragOrder`**
- **2 `tenFrame`**
- **1 `matchPairs`**

Independent prompt/state-derived recomputation is centralized in `src/lib/g0Independent.cjs`; it does not read generated answer fields.

## Quality catches

The compiler/verifier loop identified and repaired:

- a shape-composition route that treated the word “two” as an absent numeric token;
- alignment-mode feedback expectations that differed from pick-mode feedback;
- singular language such as `1 dots`, `1 hops`, and `1 stars`;
- early-manipulative route gaps in the standing repository test architecture;
- length-comparison verification that assumed every task asked for the shortest item and submitted a pick-only state even in alignment mode;
- a pre-existing `grouping-first@wordSubtractMultiply` rejection sampler whose stretch parameters could exhaust the draw budget; it now constructs a guaranteed-valid positive misconception directly.

## Verification

- **29,700** focused deterministic builds across 33 forms and three bands.
- **29,700** learner-visible independent solution checks.
- **13,860** evaluator builds with **91,012** assertions.
- Whole registry: **383 generators**, **180,600 deterministic builds**, PASS.
- **2,185 declarations** passed **32,775** cross-band checks.
- **27,090** registered generator/form/band builds passed.
- All **383** registered generators have callable base independent routes.
- Native integrity and course registration pass.
- All **1,239 JSON files** parse.
- **263 TypeScript-family files** syntax-transpile with zero diagnostics.
- Strict semantic checking of `variants.ts` passes.
- Baseline comparison covers all 22 Grade-0 lesson files and confirms 56 declaration additions, zero authored changes, and zero non-target declaration changes.
- Runtime coverage independently confirms both Grade-0 courses at 100%, Grade 0 at 88/88, and overall coverage at 2,388/4,471.

## Package-backed gate status

A bounded `npm ci --ignore-scripts` attempt produced no output and remained stalled beyond its execution window. The timeout/npm processes were terminated and the partial dependency tree was removed. Package-backed project typecheck, full Vitest, schema/pedagogy validation, lint, production build, Playwright, and npm audit remain environment-blocked rather than reported as green.

## Next efficiency-first compiler batch

Grade 2 is now the smallest remaining grade-wide compiler plan by both gap count and selector count:

- **161 gaps**
- **68 selector groups**
- projected overall coverage **2,549/4,471 (57.01%)**

Grade 1 is close behind at 164 gaps across 74 selector groups.
