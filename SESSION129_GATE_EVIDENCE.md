# Session 129 gate evidence

## Baseline and environment

- Input: sealed `maggies-trail-session-128.tar.gz`.
- Working/package root: `maggies-trail-session-129`.
- Node: `v22.16.0`; npm: `10.9.2`.
- Exact lockfile was not edited.

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

Because `node_modules/.bin/{tsc,vitest,tsx,eslint,next,playwright}` are absent, project-local typecheck, targeted Vitest, full Vitest, content validation, pedagogy lint, ESLint, production build, live Next server, 71 Playwright executions, and browser screenshots are **blocked—not passed**.

## Source-level and package-safe gates

```text
changed TypeScript transpilation passed: 9 files, 0 diagnostics
JSON parsing passed: 1358 files
Session 129 content proof passed: 1129 lessons; 1 file / 4 widget nodes changed, all other authored surfaces preserved
estimate-compare-s129 passed: 4 exact-choice experiences; mmt-02-01 C20 -> B27; queue 62 -> 61
excellence-s126: 61/61 classified, 0 unreviewed | dispositions {"build":37,"extend":18,"intentional-assessment":2,"multi-engine":4} | representations no=46 partial=13 | honest prediction ceilings=5
reuse-wave-s128: 4 steps exact-fit; 3 false reuses preserved; S128 backlog 64 -> 62; current 61
registration: files ↔ course.json ↔ PLAN.md all consistent
engine registration passed: 106/106 core-complete; describeState 59/106
player harness contract passed: 36/36 checks, 71 projected browser executions
hash proof passed: 1129 authored lesson files byte-identical to SESSION129_LESSON_HASHES.json
Native integrity passed: 1359 JSON files, 775 source files, 1061 local imports, 45 internal links, 2 assets, 196 buttons, 25 API routes.
native clean-copy gate passed
generated freshness passed: 15 artifacts byte-stable after regeneration
```

## Test delta

- Last exact-lock certified runtime: **10,092 tests / 162 files** from Session 125, preserved in `reports/certified-runtime.json`.
- Session 128 added five declared tests; Session 129 adds eight declared tests in two files.
- Current projected declaration total: **10,105 tests**, pending exact-lock execution.
- New named specs:
  - `src/lib/session129.estimate-choice.test.ts` — 5 tests.
  - `src/components/widgets.estimateChoice.s129.test.tsx` — 3 jsdom tests.

## Visual evidence

The exact-choice stage exposes stable test IDs for actual marker, learner marker, gap, and reveal ghost. Production screenshots are unavailable because the exact-lock build/browser prerequisite is blocked. No visual pass is claimed.

## Packaging evidence

Final package identity, tidy, re-extraction, and SHA-256 evidence are appended by the sealed artifact and manifest. The tar excludes dependencies, build output, caches, logs, and browser reports.

## Re-extracted package rehearsal

```text
package identity passed: maggies-trail-session-129
Native integrity passed: 1361 JSON files, 775 source files, 1061 local imports, 45 internal links, 2 assets, 196 buttons, 25 API routes.
Session 129 content proof passed: 1129 lessons; 1 file / 4 widget nodes changed, all other authored surfaces preserved
hash proof passed: 1129 authored lesson files byte-identical to SESSION129_LESSON_HASHES.json
tidy passed: Session 129 release tree has unique Session-125+ notes, canonical living docs, and no dependency/build artifacts
engine registration passed: 106/106 core-complete; describeState 59/106
player harness contract passed: 36/36 checks, 71 projected browser executions
reuse-wave-s128: 4 steps exact-fit; 3 false reuses preserved; S128 backlog 64 -> 62; current 61
estimate-compare-s129 passed: 4 exact-choice experiences; mmt-02-01 C20 -> B27; queue 62 -> 61
```
