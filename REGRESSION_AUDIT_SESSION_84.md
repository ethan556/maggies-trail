# Session 84 — Breakthrough workflow and Grade 4 completion

## Result

Session 84 replaces the repeated session-script workflow with a manifest-driven variant batch compiler, then uses it to complete every remaining Grade-4 runtime gap.

- Grade 4: **60/279 (21.51%) → 279/279 (100%)**
- Overall: **2,113/4,471 (47.26%) → 2,332/4,471 (52.16%)**

Course results:

- `fractions-add`: **18/58 → 58/58** (+40)
- `lines-angles`: **4/48 → 48/48** (+44)
- `measure-convert`: **31/60 → 60/60** (+29)
- `multiply-bigger`: **3/57 → 57/57** (+54)
- `place-value-million`: **4/56 → 56/56** (+52)

Grades 3–8 are now all runtime-complete.

## Workflow breakthrough

The former workflow rebuilt several nearly identical scripts for every session and duplicated target metadata across implementation, independent routes, evaluator tests, coverage scripts, and release notes. Session 84 introduces a single-source pipeline:

1. `discover.cjs` finds true runtime gaps and groups them by course, concept, and authored surface.
2. `session84-grade4.plan.json` maps the 97 discovered groups to reusable generator forms.
3. `compile.cjs` applies only unresolved targets and rejects unmapped gaps, unused selectors, stale declarations, or count drift.
4. `session84-grade4.lock.json` records all 219 exact targets and SHA-256 locks every authored step excluding its declaration.
5. `verify.cjs` derives deterministic, independent-route, evaluator, language, and coverage gates from that lock.
6. `whole-registry.cjs` provides a session-agnostic global generator audit.
7. `compare-baseline.cjs` proves declaration-only changes when a prior clean archive is available.

The pipeline is documented in `VARIANT_BATCH_WORKFLOW.md` and can be reused without cloning session-numbered gate scripts.

## Implementation profile

- **219 declarations**
- **97 focused forms**
- **Five reusable generator families**
- **57 edited lesson files** containing target declarations
- **69 Grade-4 lesson files** semantically compared against Session 83
- **Zero authored-content changes**
- **Zero non-target declaration changes**

New families:

- `g4-fractions`
- `g4-lines-angles`
- `g4-measure`
- `g4-multiply`
- `g4-place-million`

Authored assessment surfaces remain intact:

- **128 numeric**
- **83 MCQ**
- **3 `mixedRegroup`**
- **3 `columnCalc`**
- **2 `rationalCompare`**

Independent prompt-derived recomputation is centralized in `src/lib/g4Independent.cjs`; it does not read generated answer fields.

## Quality catches

The new high-volume compiler/verifier loop identified and repaired issues before release, including:

- factor and multiple MCQs with more than one mathematically correct option;
- remainder, pattern, GCF-style, and place-ladder distractor collisions;
- ambiguous place-value prompts caused by repeating the queried digit in lower places;
- duplicate scaling and measurement labels;
- deterministic-shuffle and sparse-parameter weaknesses;
- singular grammar such as `1 units`;
- terse remainder feedback that named an operation without explaining the leftover meaning;
- a no-freshness support form in comma-period reasoning.

## Verification

- **87,300** focused deterministic builds across 97 forms and three bands.
- **87,300** prompt-derived independent solution checks.
- **40,740** evaluator builds with **259,364** assertions.
- Whole registry: **381 generators**, **176,640 deterministic builds**, PASS.
- **2,129 declarations** passed **31,935** cross-band checks.
- **26,496** registered generator/form/band builds passed.
- All **381** registered generators have callable base independent routes.
- Native integrity and course registration pass.
- All **1,235 JSON files** parse.
- **262 TypeScript-family files** syntax-transpile with zero diagnostics.
- Strict semantic checking of `variants.ts` passes.
- Baseline comparison covers 69 Grade-4 lesson files and confirms 219 declaration additions, zero authored changes, and zero non-target declaration changes.
- Runtime coverage independently confirms all five Grade-4 courses at 100%, Grade 4 at 279/279, and overall coverage at 2,332/4,471.

## Package-backed gate status

A bounded `npm ci` attempt produced no output and remained stalled beyond its execution window. The orphaned timeout/npm processes were terminated and the partial dependency tree was removed. Package-backed project typecheck, full Vitest, schema/pedagogy validation, lint, production build, Playwright, and npm audit remain environment-blocked rather than reported as green.

## Next efficient use of the compiler

Apply the same grade-wide pipeline to Grade 0. Its two courses have **56 true runtime gaps grouped into only 33 concept/surface contracts**:

- `counting-to-20-k`: 22/52, 30 gaps
- `shapes-and-sorting-k`: 10/36, 26 gaps

That batch would complete another entire grade with a much smaller plan than Grade 4 and would raise overall runtime coverage to **2,388/4,471 (53.41%)**.
