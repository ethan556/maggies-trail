# Session 137 gate evidence

## Canonical executed boundary — Session 135 verified

The user-supplied Session-135 verified archive remains the last fully executed primary-gate boundary:

```text
Node 22.22.2
tsc 0
Vitest 10,201/10,201 (174 files)
validate:content 1,223/1,223
lint:pedagogy 1,139/1,139
predict-qa 801 checked / 73 pre-existing / zero added
check-registration consistent
gen:reports exit 0
build exit 0
Playwright 71/71 (PWEXIT:0)
```

Session 137 does not inherit those results for changed code.

## Exact-lock environment attempt — blocked

Current runtime:

```text
node v22.16.0
npm 10.9.2
```

`npm ci --ignore-scripts`:

```text
EBADENGINE: @sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24.0.0
404 Not Found: zustand-5.0.14.tgz is not in the configured internal registry
EXIT:1
```

No dependency was upgraded, removed, or substituted in the committed tree. The package manifest and lockfile remain unchanged from the Session-136 input.

Consequently, the following current-tree primary gates are **unavailable—not passed**:

- project-local strict TypeScript;
- targeted and full Vitest;
- content and pedagogy validators requiring installed tooling;
- ESLint;
- production Next build;
- live production server;
- Playwright and screenshots.

## Session 137 source and contract gates — passed

Final dependency-free chain:

```text
changed-source transpilation: 10/10
JSON parsing: 1,391 files
Session 137 content proof: 1,129 lessons; 1 file / 6 widget nodes / 1 variant declaration
geometry-roundup-s137: 6/6 experiences; 2 engines; queue 50
excellence-s126: 50/50 classified; 0 unreviewed
registration: files ↔ course.json ↔ PLAN.md consistent
engine registration: 112/112 core-complete; describeState 66/112
player harness contract: 36/36 checks; 71 projected browser executions
historical S128–S136 non-regression audits: passed
generated freshness: 27 artifacts byte-stable
hash proof: 1,129/1,129 authored lesson files
native clean-copy integrity: passed
tidy clean-copy gate: passed
STATIC_CHAIN_FAIL:0
```

## Executable variant adversary — passed

The actual `variantForGenForm` source was executed through a dependency-free TypeScript loader after two defects were found and repaired:

```text
seed sweep: angle 768/768; frame 768/768; valid 369; invalid 399
EXIT:0
```

This sweep covers both support/core/stretch bands and exercises 1,536 generated problems. It detects non-Variant return values, malformed prompts, `undefined`/`NaN` values, wrong answer state shape, surface fallback, and loss of both valid and invalid triangle cases.

## Measured product delta

```text
Session 136: A608 · B214 · C281 · D26 · registry110 · manipulatives104 · K–8 queue51
Session 137: A608 · B215 · C281 · D25 · registry112 · manipulatives106 · K–8 queue50
```

- `g7-04-03`: D22 → B33
- six exact-fit causal experiences
- 13 authored wrong paths preserved and reachable
- two new engine types plus one narrow mature-engine extension
- ten new declared tests across two files
- projected suite: 10,211 tests / 176 files

## Authored-content proof — passed

```text
changed lesson files: 1
changed widget nodes: 6
changed variant declarations: 1
unchanged lesson files: 1,128
all authored answers preserved
all prose/order/hints/explanations/predictions/concept tags/remedial mappings preserved
all 13 authored feedback strings preserved verbatim and reachable
```

## Final package verification

The Session-137 package was created, re-extracted, and reran:

```text
native integrity
package identity
Session-137 authored-content proof
1,129-file lesson hash proof
tidy
engine registration
player harness contract
historical non-regression audits
Session-137 geometry-roundup audit
```

The final SHA-256 is recorded in `maggies-trail-session-137.tar.gz.sha256` and `SESSION137_ARTIFACTS.json`.
