# Session 131 gate evidence

## Baseline and environment

- Source archive: `maggies-trail-session-130.tar.gz`.
- Working root after identity repair: `maggies-trail-session-131`.
- Runtime: Node `v22.16.0`, npm `10.9.2`.
- Exact-lock restore command: `npm ci --ignore-scripts`.

## Ordered verification status

| charter gate | status | evidence |
|---|---|---|
| TypeScript | BLOCKED / source transpile PASS | exact-lock dependencies unavailable; changed TypeScript/TSX: 10 files, 0 transpile diagnostics |
| targeted Vitest | BLOCKED | 12 new declared cases across two files; local Vitest unavailable |
| full Vitest | BLOCKED | last exact-runtime certification remains 10,092/10,092 in 162 files from Session 125; projected current count 10,104 in 164 files |
| `validate:content` | BLOCKED | package-backed script unavailable; dependency-free JSON/content proof passed |
| `lint:pedagogy` | BLOCKED | package-backed script unavailable; rule was not weakened |
| `validate:native` | PASS | `Native integrity passed: 1370 JSON files, 784 source files, 1071 local imports, 45 internal links, 2 assets, 202 buttons, 25 API routes.` |
| registration | PASS | `registration: files ↔ course.json ↔ PLAN.md all consistent`; engine contract `107/107 core-complete` |
| build | BLOCKED | exact-lock install failed before Next build could run |
| live server / Playwright | BLOCKED | harness contract `36/36`; 71 projected browser executions; no production build/browser binary under compatible Node |
| hash proof | PASS | `Session 131 content proof passed: 1129 lessons; 3 files / 26 widget nodes changed; all other authored surfaces preserved`; final lesson hash `1129/1129` |
| generated freshness | PASS | 19 generated artifacts byte-stable after regeneration |
| tidy / package identity | PASS | clean-copy tidy and `maggies-trail-session-131` identity pass |
| tar / re-extraction | PASS | final archive re-extracted and package-safe gates rerun |

## Exact-lock blocker — verbatim

```text
npm warn EBADENGINE Unsupported engine {
  package: '@sparticuz/chromium@149.0.0',
  required: { node: '^22.17.0 || >=24.0.0' },
  current: { node: 'v22.16.0', npm: '10.9.2' }
}
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/zustand/-/zustand-5.0.14.tgz
EXIT:1
```

## Dependency-free gate outputs — verbatim

```text
changed-typescript-transpile: 10 files, 0 diagnostics
Session 131 content proof passed: 1129 lessons; 3 files / 26 widget nodes changed; all other authored surfaces preserved
distribution-compare-s131 passed: 26 experiences; three lessons -> honest B; queue 59 -> 56
excellence-s126: 56/56 classified, 0 unreviewed
engine registration passed: 107/107 core-complete; describeState 61/107
player harness contract passed: 36/36 checks, 71 projected browser executions
registration: files ↔ course.json ↔ PLAN.md all consistent
Native integrity passed: 1370 JSON files, 784 source files, 1071 local imports, 45 internal links, 2 assets, 202 buttons, 25 API routes.
generated freshness passed: 19 artifacts byte-stable after regeneration
```

## Authored-content gate

Three files changed only under the charter's broken-representation exception. The ledger proves:

- 26 target widget nodes changed;
- zero variant declarations changed in lesson JSON;
- all top-level lesson fields, step IDs/order, prompts, bodies, hints, explanations, predictions, concept tags, remedial mappings, and non-widget fields are unchanged;
- all 26 authored wrong-path feedback mappings are preserved verbatim in reachable engine states;
- the other 1,126 lesson files are byte-identical to the Session-130 seal.
