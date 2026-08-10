# Maggie's Trail — Session 126 execution report

## Executive result

Session 126 completed the truth-and-contract phase without converting a lesson or changing authored
lesson content. The former 64-item K–8 C/D count is now a source-backed, fully adjudicated execution
ledger rather than a score-raising queue. Release mechanics now derive their contracts from disk,
and later sessions can no longer claim excellence from tier letters alone.

## 1. Breakthrough corrections implemented

### 1.1 The queue now describes mathematical work, not rubric deficits

`EXCELLENCE_BACKLOG_S126.md/json/csv` is generated from the live repository and a reviewed policy.
It aborts unless the live K–8 C/D set and reviewed policy contain exactly the same 64 lesson IDs.
Every row includes:

- exact source path and prompt evidence;
- assessed interaction intent;
- required and currently rendered representation;
- honest prediction eligibility;
- `REUSE`, `EXTEND`, `BUILD`, `MULTI-ENGINE`, or `INTENTIONAL-ASSESSMENT` disposition;
- candidate engine or extension;
- an exact-fit acceptance contract;
- authored misconception inventory and reachability status;
- honest resting tier;
- remedial-route exposure;
- named verification owner.

Measured close:

| measure | value |
|---|---:|
| Live K–8 C/D lessons | 64 |
| Classified | 64 |
| Unreviewed | 0 |
| Build | 35 |
| Extend | 18 |
| Reuse | 5 |
| Multi-engine | 4 |
| Intentional assessment | 2 |
| Honest target A | 53 |
| Honest target B | 9 |
| Honest C-intentional | 2 |
| Required representation absent | 49 |
| Required representation partial | 13 |

### 1.2 Prediction is no longer used to purchase tier points

`scripts/audit/prediction-eligibility.mjs` derives `eligible`, `redundant`, or `unsafe` from task
structure and rendered engine state. `flagship-tier.mjs` now separates genuine one-gate prediction
opportunities from honest ceilings. It identifies:

- `mmt-05-01` — redundant observation prediction;
- `mmt-05-02` — redundant observation prediction;
- `dop-01-03` — unsafe until an exact-fit causal state exists.

No lesson-ID exception list is used.

### 1.3 Denominators now accompany tier letters

The compiler reports three independent measures by grade band: causal share of all widget steps,
causal share of exploratory/interactive steps, and lessons with a causal interactive spine.

| band | causal widget steps | causal exploratory steps | lessons with causal spine |
|---|---:|---:|---:|
| K–2 | 285/843 (33.8%) | 176/323 (54.5%) | 103/130 (79.2%) |
| G3–5 | 171/1,279 (13.4%) | 124/426 (29.1%) | 109/209 (52.2%) |
| G6–8 | 133/1,334 (10.0%) | 118/494 (23.9%) | 110/209 (52.6%) |
| High school | 327/3,372 (9.7%) | 315/1,115 (28.3%) | 305/581 (52.5%) |

These measures do not condemn numeric or MCQ assessment. They prevent a single rich engine from
masking the actual step-level interaction density of a lesson or grade band.

### 1.4 Registration is generated rather than remembered

`ENGINE_REGISTRATION_CONTRACT_S126.md/json` discovers the current surfaces from source instead of
freezing an obsolete “8/11/12-file” statement. All **106/106** current widget types satisfy the
core contract. `describeState` coverage is reported separately at **59/106**, because a meaningful
nonvisual state description is conditional on the engine's state model.

### 1.5 Release discipline is executable

Session 126 added canonical, root-relative commands for:

- full ordered verification;
- browser execution;
- generated-report freshness;
- clean-copy native integrity;
- authored-lesson SHA-256 proof;
- clean-copy tidy verification;
- package identity;
- tar creation, re-extraction, package-safe gates, and artifact SHA-256.

The old absolute Session-117/121 runners now delegate to the canonical runner. `HANDOVER.md` and
`STATE.md` were restored, the duplicated Session-125 note was removed, and package identity is now
`maggies-trail-session-126`.

## 2. Adversarial proof added

`src/lib/excellenceBacklog.s126.test.ts` adds four named adversarial tests:

1. live 64/64 policy parity with zero `UNREVIEWED`;
2. source evidence and conversion acceptance contract on every row;
3. honest prediction ceilings and removal of the old score-only report heading;
4. denominator-visible causal coverage for every grade band.

The file passed TypeScript syntax parsing. Vitest execution was environment-blocked because the
clean archive had no dependencies and dependency acquisition failed; this is not represented as a
passing test run.

## 3. Artifacts

- `EXCELLENCE_BACKLOG_S126.md`
- `EXCELLENCE_BACKLOG_S126.json`
- `EXCELLENCE_BACKLOG_S126.csv`
- `ENGINE_REGISTRATION_CONTRACT_S126.md`
- `ENGINE_REGISTRATION_CONTRACT_S126.json`
- `SESSION126_LESSON_HASHES.json`
- `SESSION126_DIFF_STATS.json`
- `SESSION126_GATE_EVIDENCE.md`
- `SESSION126_ARTIFACTS.json`

## 4. Diff evidence

Measured against the supplied Session-125 archive before adding this report:

- 22 files added;
- 8 files modified;
- 0 files deleted;
- 17,276 insertions and 126 deletions, dominated by generated JSON/CSV/hash evidence.

The exact lockfile is byte-identical to Session 125. No temporary local-package workaround remains
in `package.json` or `package-lock.json`.

## 5. Verification result

Dependency-free source, integrity, registration, hash, freshness, identity, and tidy gates are
green. Full TypeScript/Vitest/content/lint/build/Playwright gates could not be rerun because this
container could not acquire the locked dependency set. The exact failures and commands are recorded
verbatim in `SESSION126_GATE_EVIDENCE.md`; they are not silently converted into passes.

## 6. Frozen-content ledger

**No authored lesson content was changed.** All 1,129 lesson JSON files match the Session-125 input
archive byte-for-byte under `SESSION126_LESSON_HASHES.json`.

## 7. Next binding instruction

Session 127 begins by installing the exact lockfile in a compatible Node environment and running
`npm run verify:session`. Only after that chain is green should it implement the adversarial browser
and lesson-player state-machine matrix. Session 128 then starts exact-fit engine reuse from
`EXCELLENCE_BACKLOG_S126.json`; raw tier count is not an optimization target.

## 8. Final package

The release command writes `/mnt/user-data/outputs/maggies-trail-session-126.tar.gz`, re-extracts
it, reruns package-safe gates, and writes the final SHA-256 to the external
`maggies-trail-session-126.tar.gz.sha256` sidecar. The digest is intentionally not embedded inside
the tar whose bytes it authenticates.
