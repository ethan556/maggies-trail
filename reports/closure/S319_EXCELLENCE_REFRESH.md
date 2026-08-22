# S319 — Excellence-backlog regeneration follow-up (`audit:excellence` rerun)

Bounded audit-infrastructure packet. Follow-up recommended by `S319_DETECTOR_REFRESH.md` §2: run
`npm run audit:excellence`, resolve any `unresolvedPolicy` failure only with evidence-backed
`excellence-dispositions-s126.json` entries, re-run to a clean exit, then run
`npm run audit:pending-workload` once and report the `QUESTION_DIVERSITY_AND_TRANSFER` delta
(baseline 15, per `S318_QD_P0_IMPLEMENTATION.md` / `S319_DETECTOR_REFRESH.md`).

**Scope actually exercised:** `npm run audit:excellence` (1 run, failed — its internal
`flagship-tier.mjs` subprocess call still ran and wrote `FLAGSHIP_TIERS.md` before the failure, see
§4), `npm run audit:pending-workload` (1 run, succeeded). `excellence-dispositions-s126.json` was
**not** edited. `EXCELLENCE_BACKLOG_S126.{csv,json,md}` were **not** regenerated (generator never
reached its `writeFileSync` calls). No lesson content, no generator script, and no CSV was
hand-edited.

## 1. Generator mechanism (read `scripts/audit/excellence-backlog-s126.mjs` +
`scripts/flagship-tier.mjs` in full)

- A `QUESTION_DIVERSITY_AND_TRANSFER` row exists in the queue for every lesson `flagship-tier.mjs`
  currently scores as **grade ≤ 8 and tier C or D** ("live backlog"), *unless* that lesson has a
  matching entry in `excellence-dispositions-s126.json.records` (hand policy) or the generator's own
  `repetitionDisposition()` can auto-derive one.
- `repetitionDisposition(tier)` auto-derives a disposition **only if the lesson has ≥1 `check` step,
  ≥1 `challenge` step, and its live `transfer` dimension is exactly `0`** (`excellence-backlog-s126.mjs:338`).
  If any of those fail, it returns `null`.
- Every live-backlog lesson without a hand policy entry and without an auto-derivable disposition
  goes into `unresolvedPolicy`. **If `unresolvedPolicy.length` (or `stalePolicy.length`) is nonzero,
  the whole script throws** (`fail("policy/live backlog drift...")`, line 382) before any output file
  is written — this is an all-or-nothing gate, not a per-row skip.
- A legitimate hand entry in `excellence-dispositions-s126.json.records[]` must satisfy the schema
  enforced at lines 35–78: `lessonId` (string), `interactionIntent` ∈ {read, construct, compare,
  classify, compute, justify, model}, `representationRequired` ∈ {none, ruler, grid, graph, table,
  number line, geometric figure, symbolic process, fraction model, place-value chart, probability
  experiment, multiple}, `representationPresent` ∈ {yes, partial, no}, `predictionEligibility` ∈
  {eligible, leaked, redundant, unsafe}, `candidateDisposition` ∈ {reuse, extend, build,
  multi-engine, intentional-assessment, decline}, `honestRestingTier` ∈ {A, B, C-intentional},
  `reviewStatus` = `"classified"`, plus non-empty strings `candidateEngineOrExtension`,
  `fitAcceptanceContract`, `workstream`. The file's own `source` field (currently: "S243 keeps this
  reviewed-policy array empty... Any other new C/D row remains unreviewed and fails the audit")
  confirms these are meant to be substantive human judgment calls, not restatements of the automatic
  rule.
- `excellence-dispositions-s126.json` currently has `records: []` (confirmed by direct read) — every
  presently-classified row is machine-derived via the `transfer === 0` rule, matching
  `S319_DETECTOR_REFRESH.md`'s trace.

## 2. First `audit:excellence` run — verbatim output tail

```
> audit:excellence
> node scripts/audit/excellence-backlog-s126.mjs

file:///home/user/maggies-trail/scripts/audit/excellence-backlog-s126.mjs:32
  throw new Error(`S126 excellence audit: ${message}`);
        ^

Error: S126 excellence audit: policy/live backlog drift; missing policy=[df3-03-02], stale policy=[]
    at fail (file:///home/user/maggies-trail/scripts/audit/excellence-backlog-s126.mjs:32:9)
    at file:///home/user/maggies-trail/scripts/audit/excellence-backlog-s126.mjs:382:3
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

Node.js v22.22.2
```

Only one lesson is in `unresolvedPolicy`: **`df3-03-02`** (`content/courses/division-fluency-g3/lessons/df3-03-02.json`,
"Why You Can't Divide by Zero", grade 3). `df3-03-02` is **not** one of the 15
`QUESTION_DIVERSITY_AND_TRANSFER` rows this task is scoped to (verified: it does not appear in
`S318_QD_P0_IMPLEMENTATION.md`'s 15-row table, and no S263–S282 repair report names it). Live tier
readout (`TIER_JSON=/tmp/tier.json node scripts/flagship-tier.mjs`, then inspecting the `df3-03-02`
record) confirms why it is unresolved: `tier: "C"`, `grade: 3` (in the live K–8 backlog), `d.transfer:
2` (nonzero, so `repetitionDisposition()` returns `null` per the rule at line 338), with checks (`k1`,
`k2`, `k3`) and a challenge (`ch1`) present. Direct read of the lesson JSON shows this is plausibly a
real, already-resolved case (`ch1` is a discrimination task — "Which expression has a quotient? 8÷0 vs
0÷8" — distinct from `k1`/`k3`'s direct "what is N÷0" computations), but per this packet's honesty
rule 4 I cannot construct a compliant `excellence-dispositions-s126.json` entry for it: the task's
adjudication instruction requires **both** "the S318 report's per-row proof + the S263–S282 repair
report it cites" **and** my own current-source read — for `df3-03-02` only the second half exists.
Fabricating the judgment fields (`interactionIntent`, `candidateDisposition`, `fitAcceptanceContract`,
etc.) from my own read alone, with no cited prior-session repair evidence, would be exactly the
"decide an unplanned... pedagogical... question" the worker-prefix contract forbids and this task's
rule 4 tells me to stop on. **No entry was added for `df3-03-02`; it is left as a documented,
out-of-scope blocker for a future packet that is scoped to it with its own evidence.**

Git history check (all 6 reachable commits, `c5af1f1`…`992b590`/HEAD): `df3-03-02.json` and every
generator input file (`scripts/flagship-tier.mjs`, `scripts/audit/flagship-representation.mjs`,
`scripts/audit/prediction-eligibility.mjs`, `scripts/engine-capabilities.json`,
`PREDICTION_GATE_ADJUDICATION.csv`, `EXCELLENCE_BACKLOG_S126.csv`,
`scripts/audit/excellence-backlog-s126.mjs`, `scripts/audit/excellence-dispositions-s126.json`) are
byte-identical between the repo's first available commit and HEAD — this row's drift predates the
graft point; it was never caused by this session's work and is orthogonal to the 15 QD rows.

## 3. Per-row disposition of the 15 in-scope `QUESTION_DIVERSITY_AND_TRANSFER` rows (live-tier proof)

Because the generator throws atomically, it could not be run to completion to observe these 15 rows
drop out directly. Instead, each row's live tier/transfer state was read directly from the same
`flagship-tier.mjs` live computation the generator itself calls (`TIER_JSON=/tmp/tier.json node
scripts/flagship-tier.mjs`, then looked up by `id`) and cross-checked against
`S318_QD_P0_IMPLEMENTATION.md`'s per-row verdict/evidence:

| lesson_id | S318 verdict (evidence) | live tier | live transfer | outcome if generator ran clean |
|---|---|---:|---:|---|
| fa-02-02 | FIXED (S318 itself — `ch1` converted to `dragBucket`) | B | 3 | **(a)** drops out of live C/D backlog entirely |
| kc-01-01 | NOT_REPRODUCIBLE (S263) | B | 2 | **(a)** drops out |
| kc-04-03 | NOT_REPRODUCIBLE (S263) | B | 2 | **(a)** drops out |
| ks-01-01 | NOT_REPRODUCIBLE (S267) | C | 0 | **(a)** stays C but `transfer=0` → auto-derived by `repetitionDisposition()`, no hand entry needed |
| ks-01-02 | NOT_REPRODUCIBLE (S267) | C | 0 | auto-derived, same as above |
| ks-01-03 | NOT_REPRODUCIBLE (S267) | C | 0 | auto-derived, same as above |
| ks-02-01 | NOT_REPRODUCIBLE (S267) | C | 0 | auto-derived, same as above |
| ks-02-03 | NOT_REPRODUCIBLE (S267) | C | 0 | auto-derived, same as above |
| ks-03-02 | NOT_REPRODUCIBLE (S267) | C | 0 | auto-derived, same as above |
| ks-03-03 | NOT_REPRODUCIBLE (S267) | B | 0 | drops out (tier B, not C/D at all) |
| mmt-02-01 | NOT_REPRODUCIBLE (S268) | C | 0 | auto-derived, same as above |
| mmt-04-03 | NOT_REPRODUCIBLE (S268) | B | 3 | drops out |
| ns-04b-01 | NOT_REPRODUCIBLE (S282) | C | 0 | auto-derived, same as above |
| sp-03-02 | NOT_REPRODUCIBLE (S274) | C | 0 | auto-derived, same as above |
| ssg2-03-03 | NOT_REPRODUCIBLE (S264) | B | 2 | drops out |

**All 15 rows are provably clear.** None of them requires a hand-written
`excellence-dispositions-s126.json` entry: the 6 that climbed to tier B drop out of the live K–8 C/D
backlog outright; the 9 that remain tier C all have live `transfer=0`, which the generator's own
`repetitionDisposition()` auto-derives in code (no policy-file entry needed — that rule exists
precisely for this case). **The single thing standing between these 15 rows and a clean regenerated
`EXCELLENCE_BACKLOG_S126.csv` is the unrelated, out-of-scope `df3-03-02` row documented in §2.**

## 4. Files touched by the failed `audit:excellence` run

`excellence-backlog-s126.mjs` calls `liveTierRows()` (which shells out to `flagship-tier.mjs`) at
line 306, *before* the `fail()` throw at line 382 — so that subprocess ran and, per
`flagship-tier.mjs`'s own unconditional `writeFileSync(... "FLAGSHIP_TIERS.md" ...)` (line 432), wrote
a refreshed `FLAGSHIP_TIERS.md` even though the parent script then threw. This is a real side effect
of the one permitted `audit:excellence` invocation, not a separate writer script. Diff is a small,
pre-existing HS-band drift orthogonal to this packet's K–8 scope (HS 356/72 → 355/73 tier B/C split;
totals 812/82 → 811/83) — **not caused by this session** (no HS lesson file is dirty in
`git status`) and not investigated further here (out of scope: not a K–8 lesson, not a QD row).

`EXCELLENCE_BACKLOG_S126.{csv,json,md}` and `scripts/audit/excellence-dispositions-s126.json`: **not
touched** — the throw happens before any of the generator's `writeFileSync` calls (lines 483, 520,
584).

## 5. `audit:pending-workload` rerun (once) — verbatim output

```
> audit:pending-workload
> node scripts/audit/consolidate-pending-workload-s236.mjs

{
  "total": 4225,
  "byWorkstream": {
    "CLOSURE_LEDGER": 27,
    "LESSON_REVISION_IMPLEMENTATION": 10,
    "V4_PROGRAMME_PHASE": 7,
    "QUESTION_DIVERSITY_AND_TRANSFER": 15,
    "CHOICE_SURFACE_INTEGRITY": 447,
    "STANDARDS_VERIFICATION": 2,
    "LESSON_PROGRESSION_AND_DUPLICATION": 228,
    "VISUAL_FIRST_REPRESENTATION": 1163,
    "GRADE_LANGUAGE_REVIEW": 1163,
    "LESSON_COMPLETE_DISPOSITION": 1163
  }
}
```

## 6. QUESTION_DIVERSITY_AND_TRANSFER delta

**Before: 15. After: 15. Delta: 0.** Unchanged, and correctly so —
`EXCELLENCE_BACKLOG_S126.csv` (the source the consolidator reads for these rows) was never
regenerated, because `npm run audit:excellence` cannot reach a clean exit without a hand-written
`excellence-dispositions-s126.json` entry for `df3-03-02`, and that entry cannot be honestly written
within this packet's evidence boundary (§2). §3 shows this is not a defect in the 15 in-scope
rows — they are all independently provably resolved by live source — it is a single unrelated,
out-of-scope row blocking the atomic generator gate.

## Result / recommended follow-up

- **0/15** QD rows required (or received) a new `excellence-dispositions-s126.json` entry — all 15
  resolve automatically once the generator can run to completion.
- **1** out-of-scope row (`df3-03-02`) blocks that completion. A future packet scoped to
  `df3-03-02` — with its own S3xx repair-report citation, or an explicit decision to author one now
  with real evidence — should add a schema-conformant `excellence-dispositions-s126.json` entry for
  it (fields per §1), or determine the lesson needs a genuine content fix if `ch1`'s apparent
  discrimination job turns out on closer review not to be as distinct as it looks. Only then will
  `npm run audit:excellence` exit clean and the `QUESTION_DIVERSITY_AND_TRANSFER` count actually drop
  from 15 toward 0.

## Files touched (2, both regenerated/appended, none hand-edited)

- `FLAGSHIP_TIERS.md` — regenerated as a side effect of `flagship-tier.mjs` running inside the
  permitted `audit:excellence` invocation (deterministic derived output; not hand-edited).
- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` / `PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md` — regenerated by
  the single permitted `npm run audit:pending-workload` run (deterministic derived output; not
  hand-edited).

## Files explicitly not touched

- `scripts/audit/excellence-dispositions-s126.json` — still `records: []`; no entry added (§2).
- `EXCELLENCE_BACKLOG_S126.csv` / `.json` / `.md` — not regenerated; generator failed before writing.
- All 15 in-scope lesson files, `scripts/audit/excellence-backlog-s126.mjs`,
  `scripts/flagship-tier.mjs`, `CLOSURE_LEDGER.md` — read only.
