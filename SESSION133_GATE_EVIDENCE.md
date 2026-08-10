# Session 133 gate evidence

## Ordered verification status

| gate | status | evidence |
|---|---|---|
| baseline measurement | PASS | Session-132 archive extracted; `HANDOVER`, `STATE`, `PRODUCT_STATE`, `SESSION_NOTES`, `KNOWN_ISSUES`, `FLAGSHIP`, and live 54-row ledger read before mutation |
| changed-source TypeScript/TSX transpilation | PASS | 11 changed/new TS/TSX files, zero syntax diagnostics using global TypeScript 5.8.3 |
| targeted Vitest | BLOCKED | exact-lock install unavailable; 10 new declarations across two files are present but not executed |
| full Vitest | BLOCKED | last exact-runtime certification remains 10,092/10,092 in 162 files; projected current count 10,127 in 168 files |
| validate:content | BLOCKED | project dependencies unavailable; dependency-free JSON/content proof passed instead |
| lint:pedagogy | BLOCKED | project dependencies unavailable; `widgetWrongPaths` and exact-choice measurement contracts passed static audits |
| validate:native | PASS | clean-copy native-integrity gate passed |
| check-registration | PASS | course/file/PLAN consistent; generated engine contract 109/109 core-complete |
| ESLint | BLOCKED | exact-lock install unavailable |
| generated freshness | PASS | 23 generated artifacts byte-stable on regeneration |
| production build | BLOCKED | exact-lock install unavailable; Node 22.16 is below Chromium 149's Node 22.17 floor |
| live server / Playwright | BLOCKED | harness contract 36/36; 71 projected browser executions; no compatible production build/browser runtime |
| Session-133 content proof | PASS | 1,129 lessons; exactly 1 file / 8 widget nodes / 0 variant declarations changed |
| final lesson hash proof | PASS | 1,129/1,129 byte-identical to `SESSION133_LESSON_HASHES.json` |
| tidy clean-copy | PASS | no dependencies, builds, logs, caches, or temporary files in package tree |
| package identity | PASS | root, living docs, latest notes heading, and Session-133 artifacts agree |
| tar re-extraction | PASS | package-safe gates rerun against the extracted archive |

## Exact-lock install attempt

```text
npm ci --ignore-scripts
EXIT:1
npm ERR! 404 Not Found: zustand-5.0.14.tgz
@sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24; container is Node 22.16.0
```

A public-registry retry did not transfer the locked dependency set and was stopped. The lockfile and dependency versions were not changed. Package-backed gates are recorded as blocked, never inferred from static checks.

## Dependency-free gate outputs

```text
changed-source transpilation: 11 files, 0 diagnostics
json parse: 1378 files, 0 errors
compound-event-s133: 8/8 fixed experiences; 4/4 variant declarations; registration 6/6
excellence-s126: 53/53 classified, 0 unreviewed
registration: files ↔ course.json ↔ PLAN.md all consistent
engine registration passed: 109/109 core-complete; describeState 63/109
player harness contract passed: 36/36 checks, 71 projected browser executions
Session 133 content proof passed: 1129 lessons; 1 file / 8 widget nodes / 0 variant declarations changed; all other authored surfaces preserved
hash proof passed: 1129 authored lesson files byte-identical to SESSION133_LESSON_HASHES.json
generated freshness passed: 23 artifacts byte-stable after regeneration
```

## Historical non-regression outputs

```text
reuse-wave-s128: 4 steps exact-fit; 3 false reuses preserved; current queue 53
estimate-compare-s129 passed; current queue 53
grid-read-s130 passed; current queue 53
distribution-compare-s131 passed; current queue 53
trial-probability-s132 passed; Session-132 queue ceiling 54, current 53; registry floor 108, current 109
```
