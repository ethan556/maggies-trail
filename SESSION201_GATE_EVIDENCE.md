# Session 201 Gate Evidence

## Passed in the S201 working tree

| Gate | Result |
|---|---|
| Changed TS/TSX isolated transpile | Pass |
| `node scripts/verify-world.mjs` | Pass — 14 regions, 129 courses, 513 landmarks, 13 instruments |
| `node scripts/verify-trail-voice.mjs` | Pass |
| `node scripts/verify-instructional-colors.mjs` | Pass — player core clean, known surface debt 37/37 |
| `node scripts/verify-math-format.mjs` | Pass |
| `node scripts/verify-visual-explanations.mjs` | Pass — 3616/3616 concept steps |
| `node scripts/check-registration.mjs` | Pass |
| `node scripts/session/test-groups.mjs verify` | Pass — 273 files tile exactly |
| `node scripts/session/generator-guard.mjs check` | Pass — 29 inputs byte-identical |
| S201 lesson hash proof | Pass — 1,667 files |
| S200 → S201 lesson hash comparison | Pass — zero added/removed/changed |
| `content-change-proof-s151c` | Pass — 686/686 authorized changes, 981 sealed-ledger lessons identical |
| `npm run gen:reports` | Pass — rc=0 |
| Package identity + tidy + native integrity | Pass |
| Fresh-extraction dependency-free reproof | Pass |

## Blocked, not passed

| Gate | Status |
|---|---|
| `npm ci` | Blocked by registry 404 for `zustand@5.0.14`; rc=1 |
| `tsc` semantic typecheck | Not run — dependencies unavailable |
| Vitest content/rest chunks | Not run — dependencies unavailable |
| validate:content | Not rerun through npm chain |
| lint:pedagogy | Not rerun through npm chain |
| build / next start / curl | Not run — dependencies unavailable |
| Playwright | Not run — dependencies unavailable |
| grayscale / forced-colors runtime | Test source added; not executed here |
| 4x CPU trace | Test source added; not executed here |

## Bundle evidence

- Compact first-load Atlas course + lesson-band index: **7,340 bytes gzip**.
- Full lesson-title server index: 22,948 bytes gzip, fetched only after a query.
- Full world manifest: 39,685 bytes gzip, server-only.
- Actual Next route bundle delta: unmeasured because a production build was unavailable.
