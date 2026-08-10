# Session 86 — Grade 1 compiler completion with full manipulative compliance

## Result

Session 86 applies the manifest-driven variant batch compiler to every remaining Grade-1 runtime gap and makes complete Grade-1 manipulative compliance a release-blocking gate.

- Grade 1: **60/224 (26.79%) → 224/224 (100%)**
- Overall: **2,388/4,471 (53.41%) → 2,552/4,471 (57.08%)**

Course results:

- `add-subtract-20`: **23/68 → 68/68** (+45)
- `counting-120`: **1/60 → 60/60** (+59)
- `shapes-measure-g1`: **20/48 → 48/48** (+28)
- `tens-and-ones`: **16/48 → 48/48** (+32)

Grades 0, 1, and 3–8 are now runtime-complete.

## Full manipulative compliance

The release does not limit verification to the 164 newly compiled gaps. It audits every Grade-1 manipulative assessment, including already-served steps, through learner-visible state and the production evaluator:

- 4 `numberLineHop`
- 1 `dragOrder`
- 1 `baseTenCompose`
- 2 `fractionBar`
- 8 `lengthCompare`
- 12 `clockSet`
- 12 `placeCompare`

The dedicated Grade-1 manipulative gate exercises all 40 steps across support, core, and stretch bands and 120 seeds per band. It independently derives hop landings, numeric ordering, standard base-ten builds, half/fourth partitions, shortest/longest truth, clock time, and place-value relations before submitting correct and misconception states to the production evaluator.

## Implementation profile

- **164 declarations**
- **74 selector groups / focused forms**
- **Four reusable generator families**
- **56 Grade-1 lesson files semantically compared**
- **Zero authored-content changes**
- **Zero non-target declaration changes**

New families:

- `g1-add-subtract`
- `g1-counting-120`
- `g1-shapes-measure`
- `g1-tens-ones`

Newly compiled authored surfaces preserved:

- **116 numeric**
- **42 MCQ**
- **3 `numberLineHop`**
- **2 `fractionBar`**
- **1 `baseTenCompose`**

Independent prompt/state-derived recomputation is centralized in `src/lib/g1Independent.cjs`; it does not read generated answer fields.

## Quality catches

The compiler and global audits identified and repaired:

- an ambiguous shape-classification form where both square and rectangle matched “4 sides and 4 corners”;
- an ambiguous repeated-digit place-value prompt such as asking for “the value of 3” in 33;
- singular wording such as `1 ones` and `1 tens` across generated prompts and feedback;
- static half/fourth numeric forms that failed the whole-registry freshness contract;
- a Grade-1 independent route that confused the part used to make ten with the part left;
- chart-row, teen-number, and tens/ones route parsing errors exposed by prompt-derived verification;
- missing standing independent base routes for all four new generator families.

## Verification

- **66,600** focused deterministic builds across 74 forms and three bands.
- **66,600** independent prompt/state-derived checks.
- **31,080** evaluator builds with **192,648** assertions.
- Grade-1 manipulative compliance: **14,400 builds** and **98,864 assertions** across all 40 manipulative assessments.
- Whole registry: **387 generators**, **189,480 deterministic builds**, PASS.
- **2,349 declarations** passed **35,235** cross-band checks.
- **28,422** registered generator/form/band builds passed.
- All **387** registered generators have callable base independent routes.
- Native integrity and course registration pass.
- All **1,243 JSON files** parse.
- **264 TypeScript-family files** syntax-transpile with zero diagnostics.
- Strict semantic checking of `variants.ts` passes.
- Baseline comparison covers all 56 Grade-1 lesson files and confirms exactly 164 declaration additions, zero authored changes, and zero non-target declaration changes.
- Runtime coverage independently confirms all four Grade-1 courses at 100%, Grade 1 at 224/224, and overall coverage at 2,552/4,471.

## Package-backed gate status

A bounded `npm ci --ignore-scripts` attempt stalled silently beyond its execution window. The timeout/npm processes were terminated and the partial dependency tree was removed. Package-backed project typecheck, full Vitest, schema/pedagogy validation, lint, production build, Playwright, and npm audit remain environment-blocked rather than reported as green.

## Next efficiency-first compiler batch

Grade 2 is now the only incomplete early-elementary grade and remains the smallest grade-wide compiler batch:

- **161 gaps**
- **68 selector groups**
- projected overall coverage **2,713/4,471 (60.68%)**

