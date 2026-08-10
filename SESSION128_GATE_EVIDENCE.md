# Session 128 gate evidence

## Baseline and environment

- Input: sealed `maggies-trail-session-127.tar.gz`.
- Working/package root: `maggies-trail-session-128`.
- Node: `v22.16.0`.
- Exact `package-lock.json`: unchanged from Session 127.

## Dependency restoration attempt

Command:

```text
npm ci --ignore-scripts
```

Result:

```text
npm error code E404
npm error 404 Not Found ... /zustand/-/zustand-5.0.14.tgz
EXIT:1
```

The warning preceding the failure also reports that `@sparticuz/chromium@149.0.0` requires Node
22.17+ while this container supplies Node 22.16. No dependency version or lockfile was changed.

## Ordered verification status

| gate | result | evidence |
|---|---|---|
| TypeScript project typecheck | **BLOCKED** | `tsc --noEmit` exits 2 because project dependencies and their types are absent after exact-lock install failure; first errors are missing Node/Playwright/Vitest modules |
| Targeted Vitest | **BLOCKED** | local Vitest unavailable |
| Full Vitest | **BLOCKED** | local Vitest unavailable; last certified 10,092, with 5 new declared tests projected to 10,097 |
| `validate:content` | **BLOCKED** | requires project-local `tsx`/schema dependencies |
| `lint:pedagogy` | **BLOCKED** | requires project-local `tsx`/schema dependencies |
| ESLint | **BLOCKED** | exact project dependency tree unavailable |
| Production build | **BLOCKED** | Next/project dependencies unavailable |
| Playwright 71-execution matrix | **BLOCKED** | production build and compatible Chromium runtime unavailable |
| Browser screenshots | **BLOCKED** | same production-browser blocker |

No blocked gate is represented as passing.

## Dependency-free source and release gates

```text
Node syntax passed: 6 files
TypeScript transpile syntax passed: 5 changed TS/TSX files, 0 diagnostics
JSON parse passed: 1353 files
Session 128 content proof passed: 1129 lessons; 2 files / 4 widget specs changed, every other authored surface preserved
hash proof passed: 1129 authored lesson files byte-identical to SESSION128_LESSON_HASHES.json
reuse-wave-s128: 4 steps exact-fit; 3 false reuses rejected; backlog 64 -> 62
excellence-s126: 62/62 classified, 0 unreviewed | dispositions {"build":37,"extend":19,"intentional-assessment":2,"multi-engine":4}
engine registration passed: 106/106 core-complete; describeState 59/106
player harness contract passed: 36/36 checks, 71 projected browser executions
registration: files ↔ course.json ↔ PLAN.md all consistent
Native integrity passed: 1353 JSON files, 770 source files, 1057 local imports, 45 internal links, 2 assets, 195 buttons, 25 API routes.
native clean-copy gate passed
generated freshness passed: 11 artifacts byte-stable after regeneration
```

## Targeted adversarial proof

Five new Vitest cases are declared in `src/lib/session128.reuse.test.ts`:

1. physical and grading integrity for all four converted rulers;
2. verbatim misconception feedback at every named reachable placement;
3. `evalOrder` rejection because grouped-expression wrong values 14 and 24 are unreachable;
4. `estimateSlider` rejection because it accepts values outside the authored discrete choices;
5. `covariationScrubber` rejection because moving the already-given input alone completes the task.

The dependency-free `reuse-wave-s128` compiler independently asserts the renderer/evaluator/schema
hooks and rejects removal of reversible controls or named misconception routing.

## Content-change proof

`SESSION128_CONTENT_CHANGE_LEDGER.json` records before/after file hashes and per-step hashes.
Package-safe proof verifies:

- all 1,127 non-target lesson files equal Session 127 byte-for-byte;
- only two target lesson files differ;
- only four target widget specifications differ inside them;
- top-level lesson data, step order, every non-target step, and every target step outside `widget`
  retain their Session-127 hashes;
- every frozen answer equals independently re-derived `objectEnd − objectStart`;
- every authored common-error feedback string survives verbatim in a reachable placement state.

## Package verification

The Session-128 archive re-extracted successfully and reran native integrity, package identity,
Session-128 content proof, final lesson hashes, tidy, engine registration, the Session-127 player-
harness contract, and the Session-128 reuse-wave proof. The final SHA-256 is recorded in the
external `.sha256` sidecar.
