# Session 127 gate evidence

All results below were produced from the Session-127 working tree. A blocked gate is never recorded
as passing.

## Environment and exact-lock installation

| check | result | evidence |
|---|---|---|
| Node | warning | `v22.16.0`; `@sparticuz/chromium@149.0.0` declares Node 22.17+ |
| lockfile preservation | PASS | Session-126 and Session-127 `package-lock.json` SHA-256 both `c7cfd90535fc2532455df543e64378b9c2256b5e6855e95663e538791a900b3b` |
| internal exact-lock install | BLOCKED, exit 1 | `404 Not Found ... zustand/-/zustand-5.0.14.tgz` |
| public exact-lock install | BLOCKED, exit 1 | repeated `getaddrinfo EAI_AGAIN registry.npmjs.org`; npm then reports `Exit handler never called!` |

The source dependency contract was not modified to bypass these failures.

## Implemented contract and dependency-free gates

| gate | result |
|---|---|
| changed TS/TSX isolated transpile | `EXIT:0`; 0 diagnostics for `LessonPlayer.tsx`, both new specs, and `playwright.config.ts` |
| changed Node-script syntax | `EXIT:0` |
| `check-registration.mjs` | `registration: files ↔ course.json ↔ PLAN.md all consistent` |
| `player-harness-contract-s127.mjs` | `player harness contract passed: 36/36 checks, 71 projected browser executions` |
| `excellence-backlog-s126.mjs` | `64/64 classified, 0 unreviewed` |
| `engine-registration-contract.mjs` | `106/106 core-complete; describeState 59/106` |
| clean-copy native integrity | `1348 JSON files, 766 source files, 1055 local imports, 45 internal links, 2 assets, 194 buttons, 25 API routes` |
| generated freshness | `9 artifacts byte-stable after regeneration` |
| authored hash proof | `1129 authored lesson files byte-identical to SESSION127_LESSON_HASHES.json` |
| package identity | `package identity passed: maggies-trail-session-127` |
| tidy clean-copy | `Session 127 release tree has unique Session-125+ notes, canonical living docs, and no dependency/build artifacts` |

### Generated-freshness output

```text
generated freshness note: PRODUCT_STATE regeneration skipped because local Vitest is unavailable;
full verify:session requires dependencies
tiers: A 608 B 201 C 292 D 28 | K-8 A 314 B 170 | C-only load-bearing 66 | backlog 64
playbook: 16 enhancements · 0 unbuilt · 0 built-but-unused
excellence-s126: 64/64 classified, 0 unreviewed
engine registration passed: 106/106 core-complete; describeState 59/106
player harness contract passed: 36/36 checks, 71 projected browser executions
generated freshness passed: 9 artifacts byte-stable after regeneration
```

The first word above is the script's informational message; the actual file output is unchanged.

## Ordered package-backed chain

`npm run verify:session` was attempted and stopped at the first gate, project typecheck, with exit 2
because the exact dependencies and type declarations were unavailable. Representative diagnostics:

```text
Cannot find module 'next/server' or its corresponding type declarations.
Cannot find module 'vitest' or its corresponding type declarations.
Cannot find module 'better-sqlite3' or its corresponding type declarations.
Cannot find name 'process'. Do you need to install type definitions for node?
```

Consequently these gates remain **BLOCKED**, not failed on project behavior and not passed:

1. project-local TypeScript;
2. targeted Vitest;
3. full Vitest;
4. `validate:content`;
5. `lint:pedagogy`;
6. ESLint;
7. production build by exit code;
8. production server;
9. 71-execution Playwright matrix;
10. six state screenshots.

## Browser scope awaiting runtime execution

The static contract proves the following are declared and cannot be silently focused/skipped:

- six state-machine tests;
- three viewport tests across six projects;
- 47 retained legacy executions;
- 71 total projected executions;
- six named screenshot states.

Static presence is not treated as runtime certification. `SESSION127_MUTATION_MATRIX.md` states the
defect each test must deterministically reject once the production-browser gate can run.

## Packaging gates

A complete package rehearsal returned exit 0. The archive re-extracted and reran:

```text
Native integrity passed: 1350 JSON files, 766 source files, 1055 local imports, 45 internal links, 2 assets, 194 buttons, 25 API routes.
package identity passed: maggies-trail-session-127
hash proof passed: 1129 authored lesson files byte-identical to SESSION127_LESSON_HASHES.json
tidy passed: Session 127 release tree has unique Session-125+ notes, canonical living docs, and no dependency/build artifacts
engine registration passed: 106/106 core-complete; describeState 59/106
player harness contract passed: 36/36 checks, 71 projected browser executions
```

The final packaging invocation reruns the same re-extraction chain before writing its external
`.sha256` sidecar.

## Frozen-content result

**No authored lesson content was changed.** All 1,129 lesson JSON files match the Session-126 hash
manifest byte-for-byte.
