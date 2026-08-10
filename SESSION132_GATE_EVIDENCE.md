# Session 132 gate evidence

## Ordered verification status

| gate | status | evidence |
|---|---|---|
| baseline measurement | PASS | Session-131 archive extracted; living docs and live 56-row excellence ledger read before mutation |
| changed-source TypeScript/TSX transpilation | PASS | 10 changed/new TS/TSX files, zero syntax diagnostics using global TypeScript 5.8.3 |
| targeted Vitest | BLOCKED | exact-lock install unavailable; 13 new declarations across two files are present but not executed |
| full Vitest | BLOCKED | last exact-runtime certification remains 10,092/10,092 in 162 files; projected current count 10,117 in 166 files |
| validate:content | BLOCKED | project dependencies unavailable; dependency-free JSON/content proof passed instead |
| lint:pedagogy | BLOCKED | project dependencies unavailable; `widgetWrongPaths` source contract and static audit passed |
| validate:native | PASS | clean-copy native-integrity gate passed |
| check-registration | PASS | course/file/PLAN consistent; generated engine contract 108/108 core-complete |
| ESLint | BLOCKED | exact-lock install unavailable |
| generated freshness | PASS | all generated report groups byte-stable on second run |
| production build | BLOCKED | exact-lock install unavailable; Node 22.16 is below Chromium 149's Node 22.17 floor |
| live server / Playwright | BLOCKED | harness contract 36/36; 71 projected browser executions; no compatible production build/browser runtime |
| Session-132 content proof | PASS | 1,129 lessons; exactly 2 files / 15 widget nodes / 7 variant forms changed |
| final lesson hash proof | PASS | 1,129/1,129 byte-identical to `SESSION132_LESSON_HASHES.json` |
| tidy clean-copy | PASS | no dependencies, builds, logs, caches, or temporary files in package tree |
| package identity | PASS | root, living docs, latest notes heading, and Session-132 artifacts agree |
| tar re-extraction | PASS | package-safe gates rerun against extracted archive |

## Exact-lock install attempt

```text
npm ci --ignore-scripts
EXIT:1
npm ERR! 404 Not Found: zustand-5.0.14.tgz
@sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24; container is Node 22.16.0
```

The lockfile and dependency versions were not changed. Package-backed gates are recorded as blocked, never inferred from static checks.

## Dependency-free gate outputs

```text
trial-probability-s132 passed: 15 experiences; two lessons -> honest B; queue 56 -> 54; registry 108
excellence-s126: 54/54 classified, 0 unreviewed
engine registration passed: 108/108 core-complete; describeState 62/108
player harness contract passed: 36/36 checks, 71 projected browser executions
Session 132 content proof passed: 1129 lessons; 2 files / 15 widget nodes / 7 variant forms changed; all other authored surfaces preserved
hash proof passed: 1129 authored lesson files byte-identical to SESSION132_LESSON_HASHES.json
```

## Historical non-regression outputs

```text
reuse-wave-s128: 4 steps exact-fit; 3 false reuses preserved; current queue 54
estimate-compare-s129 passed; current queue 54
grid-read-s130 passed; current queue 54
distribution-compare-s131 passed; current queue 54
```
