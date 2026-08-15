# GATE-01 — SEALED VERIFICATION CHAIN

**Seal:** `e4b6caa` · **Date:** 2026-08-15 · **Node:** v22.22.2

Every line below was executed on this one source seal in this one session. Nothing is inherited
from an earlier run, and nothing is quoted from a previous document — which is the whole point of
GATE-01, since the artifacts it replaces mixed historical and current evidence.

## The chain

| Gate | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | clean |
| Tests | `npx vitest run --shard=1..4/4` | **13,831 passed, 1 skipped** |
| Content schema | `npm run validate:content` | 1840/1840 |
| Pedagogy lint | `npm run lint:pedagogy` | 1711/1711 |
| Strict CML | `node scripts/cml-lint.mjs --strict` | **0 errors**, 200 warnings, all within waived ceilings |
| Registration | `node scripts/check-registration.mjs` | files ↔ course.json ↔ PLAN.md consistent |
| Native integrity | `npm run validate:native` | 4 archive-only findings — see below |
| Production build | `npm run build` | **exit 0** |
| Build purity | two consecutive builds | **working tree byte-identical** |
| Route budgets | `node scripts/audit/route-budgets.mjs` | 32 routes within budget |
| Dependencies | `npm audit` | 0 vulnerabilities, 622 packages |
| Prediction Phase 4 | `node scripts/audit/prediction-recertify.mjs` | exit 0, every verdict reflected in the corpus |
| Precache | `pedagogy-v3-cache.mjs --verify` | 6 layers byte-identical across two clean rebuilds |
| Graph sweeps | 3 formerly opt-in gates | 10/10, **now blocking** |

### The native-integrity findings are the documented archive-only checks

`node_modules`, `.next`, `tsconfig.tsbuildinfo` and `.cowork-cache` are present in a working
checkout by definition. CLAUDE.md states these are expected and that **any other** finding is a real
defect; there are none. `.cowork-cache` joined that list in this session, deliberately, so a release
archive containing the precache fails the gate.

### Build purity is the TRUTH-03 property, and it is now proved on a real build

The audit that opened this program recorded `next build` mutating the consolidated queue from 11,487
rows to 1,078. Two consecutive production builds at this seal leave `git status --porcelain` empty:
no source file, no ledger, no cache input, no generated truth changed. The mechanism behind the
original mutation — a *passing* test writing `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` as a side effect,
deleting 10,409 rows on every run — was closed earlier in this session and is behind
`UPDATE_PENDING_WORKLOAD_QUEUE=1`.

## What green here does NOT mean

The rubric in `QA_INDEPENDENT_ASSESSMENT_RUBRIC.md` applies to this document too, so the same
discipline: a green chain is evidence about the things the chain measures.

- **No browser matrix.** Every test above runs in Node or jsdom. There is no real-device evidence,
  no viewport matrix, no 200% zoom, no screen-reader pass. ACC-01 is open.
- **No performance evidence beyond bundle size.** Route budgets are a ratchet on first-load JS.
  There is no LCP, INP, CLS or interaction-frame measurement, and the two hotspot routes are
  budgeted at their current size rather than their right size.
- **200 strict CML warnings are waived, not fixed**, and the waivers expire 2026-11-13.
- **Pedagogical quality is unmeasured.** Nothing here says a problem teaches the right thing.
- **No efficacy evidence of any kind.** Nothing in this chain is an outcome claim.

## Reproducing it

```bash
npm run typecheck
npx vitest run --shard=1/4   # …2/4, 3/4, 4/4 — shard or it OOMs under output buffering
npm run validate:content
npm run lint:pedagogy
node scripts/cml-lint.mjs --strict          # NOTE: the positional root matters — see the file
npm run validate:native
node scripts/check-registration.mjs
timeout 850 npm run build > /tmp/build.log 2>&1; echo "EXIT:$?"   # check the EXIT CODE, not the text
git status --porcelain                       # must be empty: build purity
node scripts/audit/route-budgets.mjs
node scripts/audit/prediction-recertify.mjs
node scripts/cache/pedagogy-v3-cache.mjs --verify
npm audit
```
