# Maggie's Trail — Session 128 execution report

## Objective

Execute the first reviewed exact-fit reuse wave without optimizing the raw tier score. A candidate
ships only when the existing engine preserves the authored action, answer set, and misconception
reachability; otherwise the compiler must reject and reclassify it.

## Disk classification before work

| task | disk status | Session-128 decision |
|---|---|---|
| Restore Session-127 production-browser certification | MISSING / environment-blocked | exact-lock install retried first; blocker reproduced and recorded |
| `mmt-01-02 → unitRuler` | PARTIAL | engine existed, lesson lacked the ruler and engine lacked named placement errors; extend then convert |
| `mmt-01-03 → unitRuler` | PARTIAL | convert only the ruler-reading step; preserve unit-choice MCQs |
| `mmt-02-01 → estimateSlider` | PARTIAL candidate | rejected: changes discrete best-estimate action into interval estimation |
| `dop-01-02 → evalOrder` | PARTIAL candidate | rejected: grouped expression has only one reachable collapse result in current engine |
| `rr-03-03 → rate engines` | PARTIAL candidate | rejected: existing controls/feedback do not preserve the assessed output and wrong paths |

## Implemented artifacts

### `unitRuler` exact-fit extension

- optional `commonPlacements` schema for named wrong counts;
- physical integrity checks: valid object interval, allowed target/start unit, exact coverage equation,
  unique non-success misconception counts;
- evaluator routing to misconception-specific feedback;
- reachable placement bound derived from all named errors;
- reversible **Place unit / Remove unit** controls with 44px targets;
- keyboard test updated to the revised control names.

### Lesson conversion

| lesson | step | old | new | independently derived answer | preserved wrong placements |
|---|---|---|---|---:|---|
| `mmt-01-02` | `i1` | numeric | unitRuler | 6 | 10, 14 |
| `mmt-01-02` | `i2` | numeric | unitRuler | 5 | 6, 7 |
| `mmt-01-02` | `i3` | numeric | unitRuler | 8 | 11, 14 |
| `mmt-01-03` | `i2` | numeric | unitRuler | 7 | 0, 8 |

Movement: `mmt-01-02 C20 → B30`; `mmt-01-03 C20 → B30`. Product tiers become
**A 608 · B 203 · C 290 · D 28**. The reviewed K–8 C/D queue becomes **62/62**, zero unreviewed.
Both lessons intentionally stop at B because prediction would duplicate a read/measure action.

### Productive rejection

- `mmt-02-01` is now **EXTEND**: an exact discrete estimate-comparison mode is required.
- `dop-01-02` is now **BUILD**: a grouping-specific process engine must expose the authored wrong
  outcomes rather than structurally preventing them.
- `rr-03-03` is now **BUILD**: a coordinated bidirectional rate model must grade output and retain
  distinct misconception states.

This removes all five presumed `REUSE` rows: two were completed and three were corrected. The
remaining queue is now build/extend/multi-engine/intentional-assessment rather than padded with
false easy wins.

## Compiler and release-contract changes

- The excellence compiler no longer freezes the historical 64-row count; exact live-policy parity
  remains mandatory as the queue closes.
- Added `REUSE_WAVE_S128.md/json`, `SESSION128_CONTENT_CHANGE_LEDGER.json`, final lesson hashes,
  targeted Vitest specs, mutation matrix, package-safe content proof, and Session-128 packaging.
- `verify:session` now includes the reuse-wave audit.
- Generated freshness now covers 11 artifacts.

## Verification

Dependency-free gates are green and the exact outputs are preserved in
`SESSION128_GATE_EVIDENCE.md`. The tar re-extracted and passed every package-safe proof. Project-
local TypeScript/Vitest/content/pedagogy/ESLint/build/Playwright gates remain blocked by the exact-
lock installation failure and are not called green.

## Authored-content ledger

Authored lesson content changed under the charter's broken-interaction/representation exception.
Exactly four widget specifications in two files changed. Prompts, bodies, IDs, ordering, answers,
hints, explanation variants, concept tags, predictions, variants, and all non-target steps are
hash-proved unchanged. Existing misconception feedback is preserved verbatim.

## Artifacts

- `REUSE_WAVE_S128.md/json`
- `SESSION128_CONTENT_CHANGE_LEDGER.json`
- `SESSION128_MUTATION_MATRIX.md`
- `SESSION128_GATE_EVIDENCE.md`
- `SESSION128_DIFF_STATS.json`
- `SESSION128_LESSON_HASHES.json`
- `maggies-trail-session-128.tar.gz` and `.sha256`
