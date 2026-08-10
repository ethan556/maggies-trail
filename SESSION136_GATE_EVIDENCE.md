# Session 136 gate evidence

## Canonical input boundary — Session 135 verified

The user-supplied Session-135 package is the canonical baseline. Sessions 134–135 executed and repaired the complete primary chain:

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

This boundary is recorded in `SESSION134-135_ADVERSARIAL_REVIEW.md`, `SESSION135_CANONICAL_REVIEW_S136.md`, and `reports/certified-runtime.json`.

## Session 136 dependency restoration attempts

The final execution container differed from the verified Session-135 environment: Node 22.16.0 and no reusable dependency tree.

### Public registry

```text
npm ci --ignore-scripts --registry=https://registry.npmjs.org
EBADENGINE: @sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24
npm error: Exit handler never called
EXIT:1
```

### Internal registry

```text
npm ci --ignore-scripts
EBADENGINE: @sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24
404: zustand-5.0.14.tgz is not in the internal registry
EXIT:1
```

The unchanged `package.json` and `package-lock.json` were preserved. No dependency was upgraded, removed, or substituted in the committed tree.

## Ordered current-tree gate attempt

| Gate | Result | Evidence |
|---|---:|---|
| `npm run typecheck` | **blocked, exit 2** | Dependency/type packages absent; errors are missing `react`, `next`, `vitest`, Node types, etc. The command generated `tsconfig.tsbuildinfo`, which was removed before clean-copy gates. |
| `npm run test:session136` | **blocked, exit 127** | `vitest: not found` |
| `npm test` | **blocked, exit 127** | `vitest: not found` |
| `npm run validate:content` | **blocked, exit 127** | `tsx: not found` |
| `npm run lint:pedagogy` | **blocked, exit 127** | `tsx: not found` |
| `npm run build` | **blocked, exit 127** | `next: not found` |
| `npm run verify:browser` | **blocked** | `@sparticuz/chromium` unavailable; no production server/browser claim made |

These are current-environment blocks, not passed gates. The Session-135 canonical boundary remains fully executed; Session 136 adds code and tests that require execution under the same exact lock and Node floor before browser certification.

## Session 136 source and contract gates — passed

```text
changed-source transpilation: 10 TypeScript/TSX files, 0 diagnostics
JSON parsing: 1,386 files, 0 errors
content-change proof: 1,129 lessons; 2 files / 13 widget nodes / 7 variants; all other surfaces preserved
lesson hash proof: 1,129/1,129
composite-area audit: 13/13 experiences; 7/7 variant declarations; registration 8/8
excellence compiler: 51/51 classified; zero unreviewed
engine registration: 110/110 core-complete; describeState 64/110
player harness contract: 36/36; 71 projected browser executions
course/file/PLAN registration: consistent
gen:reports: exit 0
generated freshness: 25/25 artifacts byte-stable
native clean-copy integrity: passed
release-tree tidy: passed
```

## Measured product delta

```text
Session 135 canonical: A608 · B212 · C281 · D28 · registry109 · manipulatives103 · K–8 queue53
Session 136 source:    A608 · B214 · C281 · D26 · registry110 · manipulatives104 · K–8 queue51
```

- `asv-01-02`: D20 → B30
- `asv-02-03`: D20 → B30
- 13 fixed causal experiences, including two remedial checks
- Seven existing seeded declarations preserved on `composite-area-lab`
- Eleven new declared tests across two files; projected suite 10,212 tests across 176 files, pending exact-lock execution

## Final package verification — passed

`npm run package:session` created the Session-136 tar, re-extracted that actual archive, and reran:

```text
native integrity: passed
package identity: passed
authored-content proof: passed
1,129-file hash proof: passed
tidy: passed
engine registration: 110/110
player harness contract: 36/36
historical non-regression audits: passed
Session-136 composite-area audit: 13/13 experiences; 7/7 variants; registration 8/8
```

The release tree was then left unchanged except for deterministic regeneration of the package-time artifact manifest. The final SHA-256 is recorded in the sidecar and `SESSION136_ARTIFACTS.json`.
