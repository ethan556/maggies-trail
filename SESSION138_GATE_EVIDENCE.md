# Session 138 gate evidence

## Canonical executed boundary — Session 135 verified

The user-supplied verified archive remains the last fully executed primary-gate boundary:

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

Session 138 does not inherit these results for changed code.

## Exact-lock environment attempt — unavailable

Current runtime:

```text
node v22.16.0
npm 10.9.2
```

Exact-lock offline installation:

```text
npm ci --ignore-scripts --offline
npm warn EBADENGINE: @sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24.0.0
npm error ENOTCACHED: locked zustand@5.0.14 tarball is not cached from the configured registry
EXIT:1
```

No dependency, package manifest, or lockfile was substituted or weakened. Consequently these current-tree gates are **unavailable—not passed**:

- project-local strict TypeScript;
- targeted and full Vitest;
- content and pedagogy validators requiring installed tooling;
- ESLint;
- production Next build;
- live production server;
- Playwright and screenshots.

## Changed-source and data-integrity gates — passed

```text
node syntax: 5/5
changed-source transpilation: 9/9, diagnostics 0
JSON parse: 1,395 files, 0 errors
```

The transpilation gate is a syntax/emit diagnostic over the changed TS/TSX files using the available TypeScript compiler. It is not represented as full project typecheck.

## Mathematical and authored-content gates — passed

```text
Session 138 content proof passed:
1,129 lessons
1 changed lesson file
7 changed widget nodes
0 changed variant declarations
all other authored surfaces preserved

percent-change-s138: 7/7 experiences; queue 49
hash proof: 1,129/1,129 authored lesson files
```

Independent derivations:

```text
$10 + 25% = $12.50
$50 + 20% = $60
$80 − 5% = $76
$200 − 15% = $170
$50 − 10% = $45
$20 + 50% = $30
$200 − 8% = $184
```

All fourteen authored misconception-feedback strings are exact reachable choices and are preserved verbatim.

## Product and registration gates — passed

```text
excellence-s126: 49/49 classified; 0 unreviewed
  dispositions: build 31; extend 14; intentional-assessment 2; multi-engine 2
  missing representation: 34; partial representation: 13
  honest prediction ceilings: 8

registration: files ↔ course.json ↔ PLAN.md consistent
engine registration: 113/113 core-complete; describeState 67/113
player harness contract: 36/36 checks; 71 projected browser executions
```

Measured product state:

```text
84 courses
1,129 lessons
10,487 steps
113 widget types
107 manipulatives
tiers A608 / B216 / C281 / D24
K–8 A314 / B185
reviewed K–8 queue 49
```

## Historical non-regression and generated-state gates — passed

`npm run gen:reports` executed the maintained tier, playbook, product-state, excellence, registration, player-harness, and Session 128–138 audit chain.

```text
reuse-wave-s128: passed; current queue 49
estimate-compare-s129: passed; current queue 49
grid-read-s130: passed; current queue 49
distribution-compare-s131: passed; current queue 49
trial-probability-s132: passed; current registry 113
compound-event-s133: 8/8 fixed; 4/4 variants
composite-area-s136: 13/13; 7/7 variants
geometry-roundup-s137: 6/6
percent-change-s138: 7/7
generated freshness: 29/29 artifacts byte-stable
```

## Clean-tree gates — passed

```text
Native integrity passed:
1,395 JSON files
806 source files
1,095 local imports
45 internal links
2 assets
208 buttons
25 API routes
native clean-copy gate passed

tidy passed:
unique Session-125+ notes
canonical living documents
no dependency/build artifacts
tidy clean-copy gate passed
```

## New test declarations — not executed in this container

Two test files add seven declarations:

```text
src/lib/session138.percent-change.test.ts
  derives change and final price for markup and markdown
  grades exactly one authored final-price claim
  rejects duplicate and ambiguous claims while allowing a zero-price 100% markdown

src/components/widgets.percentChange.s138.test.tsx
  renders base, percent amount, direction, and three 44px claims
  emits away and toward process signals from exact choices
  preserves the learner choice on reveal and adds a separate correct ghost
  uses labels, operator text, and dashed structure rather than color alone
```

## Package proof

The final package step must and did rerun against the extracted tar:

- native integrity;
- package identity;
- Session-138 content proof;
- 1,129-file hash proof;
- tidy;
- 113/113 engine registration;
- 36/36 player-harness contract;
- every historical Session 128–138 audit.

The final package digest and exact extracted-tree results are recorded in the package output and `SESSION138_ARTIFACTS.json`.
