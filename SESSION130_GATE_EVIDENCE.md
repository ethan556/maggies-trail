# Session 130 gate evidence

## Baseline and environment

- Input: sealed `maggies-trail-session-129.tar.gz`.
- Working/package target: `maggies-trail-session-130`.
- Node: `v22.16.0`; npm: `10.9.2`.
- Exact `package-lock.json` was not edited.

## Exact-lock prerequisite

Command:

```text
npm ci --ignore-scripts
```

Result: **blocked, exit 1**.

```text
npm warn EBADENGINE @sparticuz/chromium@149.0.0 requires Node ^22.17.0 || >=24.0.0; current Node v22.16.0
npm error E404 ... zustand-5.0.14.tgz ... is not in this registry
```

Because project-local executables are absent, project-local tsc, targeted Vitest, full Vitest, content validation, pedagogy lint, ESLint, production build, live Next server, 71 Playwright executions, and screenshots are **blocked—not passed**.

## Source-level and package-safe gates

```text
changed TypeScript transpilation: 12 files, 0 diagnostics
Node syntax passed: 7 files
JSON parsing passed: 1364 files
Session 130 content proof passed: 1129 lessons; 2 files / 16 widget nodes / 8 variant forms changed; all other authored surfaces preserved
hash proof passed: 1129 authored lesson files byte-identical to SESSION130_LESSON_HASHES.json
registration: files ↔ course.json ↔ PLAN.md all consistent
engine registration passed: 106/106 core-complete; describeState 60/106
player harness contract passed: 36/36 checks, 71 projected browser executions
excellence-s126: 59/59 classified, 0 unreviewed | dispositions {"build":37,"extend":16,"intentional-assessment":2,"multi-engine":4}
reuse-wave-s128: 4 steps exact-fit; 3 false reuses preserved; current queue 59
estimate-compare-s129 passed: 4 exact-choice experiences; current queue 59
grid-read-s130 passed: 16 fixed-grid experiences; two C22 -> B28; queue 61 -> 59
generated freshness passed: 17 artifacts byte-stable after regeneration
Native integrity passed: 1364 JSON files, 780 source files, 1066 local imports, 45 internal links, 2 assets, 200 buttons, 25 API routes
native clean-copy gate passed
```

## Test declarations

- `src/lib/session130.grid-read.test.ts`: 5 tests.
- `src/components/widgets.gridRead.s130.test.tsx`: 3 jsdom tests.
- New declared tests: 8.
- Projected total since the last 10,092-test exact-lock certification: 10,113.

## Visual evidence

Stable hooks exist for the fixed grid, every cell, count readout, remaining-cell target ghost, and reveal chip. Production screenshots are unavailable because exact-lock build/browser prerequisites are blocked. No visual execution claim is made.

## Packaging evidence

The final package is required to pass identity, native integrity, Session-130 content proof, final lesson hashes, tidy, engine registration, player-harness contract, historical audits, fixed-grid audit, and re-extraction. The tar excludes dependencies, build output, caches, logs, and browser reports. Final package output and SHA-256 are recorded by the package command and sidecar.

## Re-extracted package rehearsal

```text
package identity passed: maggies-trail-session-130
Native integrity passed: 1366 JSON files, 780 source files, 1066 local imports, 45 internal links, 2 assets, 200 buttons, 25 API routes
Session 130 content proof passed: 1129 lessons; 2 files / 16 widget nodes / 8 variant forms changed; all other authored surfaces preserved
hash proof passed: 1129 authored lesson files byte-identical to SESSION130_LESSON_HASHES.json
tidy passed: Session 130 release tree has unique Session-125+ notes, canonical living docs, and no dependency/build artifacts
engine registration passed: 106/106 core-complete; describeState 60/106
player harness contract passed: 36/36 checks, 71 projected browser executions
reuse-wave-s128 passed; current queue 59
estimate-compare-s129 passed; current queue 59
grid-read-s130 passed: 16 fixed-grid experiences; two C22 -> B28; queue 61 -> 59
```
