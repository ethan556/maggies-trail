# Session 202 Gate Evidence

_Re-run after the second pass (stable cartography, single search status, label agreement). Every
figure below is from the post-change tree._

Node v22.22.2 · npm 10.9.7 · 1 vCPU · 4 GB RAM · no swap.
Dependencies installed from the public npm registry (`npm ci`, rc=0, 435 packages). This is the
first session since S135 with a dependency-backed execution environment; S201 was blocked by a
registry 404 on `zustand@5.0.14` and claimed nothing green.

## Passed

| Gate | Result |
|---|---|
| `npm ci` | Pass — rc=0 |
| `tsc --noEmit` (full semantic typecheck) | Pass — rc=0 |
| `eslint` full tree | **Pass — 0 errors** (350 warnings, non-blocking) |
| Vitest — content group | Pass — 74 files, 1,259 tests |
| Vitest — rest group (6 chunks) | Pass — 199 files, 6,558 tests |
| Vitest — sweep group (400-seed generator sweep) | Pass — 1 file, 3,988 tests, 189.2s |
| **Vitest — full suite** | **Pass — 274 files, 11,805 tests, 0 failures** |
| `next build` | Pass — rc=0 |
| `test-groups.mjs verify` | Pass — 274 files tile exactly (content 74 / sweep 1 / rest 199) |
| `generator-guard.mjs check` | Pass — 29 generator inputs byte-identical to baseline |
| `check-registration.mjs` | Pass — files ↔ course.json ↔ PLAN.md consistent |
| S201 → S202 authored lesson hashes | Pass — **1,667/1,667 byte-identical** |
| `quotient-reasoning-mutations-s146` (edited file re-run) | Pass — 47/47 rejected, 3/3 controls |

### Full-suite result is better than the recorded baseline

The carried baseline (S191 chain, quoted by `generator-guard`) was *11,126 tests: 11,050 passed,
76 failed across 17 files, all `better-sqlite3` bindings failures*. Those 76 were treated as a
permanent sandbox baseline because the native module could not build. With a working registry it
builds, and **all 17 files now pass**. There is no remaining known-failing set: this is a clean
full-suite green, not a green-with-exceptions.

## Blocked — recorded, not claimed

| Gate | Status |
|---|---|
| Playwright (97 declarations incl. the S201/S202 world cases) | **Not run** — no browser binaries present and the Playwright CDN is outside this sandbox's allowlist. `playwright --version` resolves (1.56.1); `~/.cache/ms-playwright` is empty. |
| Forced-colors / grayscale / 4× CPU trace | Not run — same cause. Test sources are present and typecheck clean. |
| Screenshot sweep | Not run — same cause. |

The browser suite is the one gate this environment cannot close. Everything else is green.

## Build evidence

S201 recorded bundle size as "not measured". Measured here:

| Route | Route JS | First load JS |
|---|--:|--:|
| `/atlas` | 4.21 kB | 122 kB |
| `/trailhead` | 5.61 kB | 123 kB |
| `/basecamp/[courseId]` | 6.43 kB | 124 kB |
| `/courses/[slug]` (redirect only) | 208 B | 103 kB |
| shared by all | — | 103 kB |

Total static JS: **6.7 MB across 93 files** (`.next/static` 7.1 MB on disk), against the 6.39 MB
last recorded at S135.

The heaviest routes are unchanged by this session and remain `/dev/widgets` (671 kB first load),
`/practice/[chapterId]` (891 kB) and `/review` (892 kB) — all pre-existing, all dominated by the
widget catalogue, and all outside S202's scope.

## Method note — why the full suite kept dying

Three earlier attempts at `vitest run --reporter=dot` in this container died silently: no error,
no summary, no exit code in the npm log. That is a kill, not a crash, and it is the exact failure
`scripts/session/test-groups.mjs` was written to prevent — an unbounded default pool on a
1-core/4 GB box. The documented invocation in `HANDOVER.md:65` is the one that works:

```
NODE_OPTIONS="--max-old-space-size=2048" npx vitest run --pool=forks --maxWorkers=1 \
  $(node scripts/session/test-groups.mjs list <group>)
```

with `rest` further split via `test-groups.mjs chunk rest 6 <i>` so each chunk is a fresh process.
The harness already existed; the interrupted runs simply did not use it.
