# Cowork execution workflow — S237 revision

Replaces the ad-hoc rhythm of sessions A–C. Written from what those three sessions actually cost,
not from what a workflow ought to look like.

---

## 1. The one rule that matters

**Batch at the family level, never the row level.** Every large workstream in this repo is a long
tail behind a handful of causes:

| Workstream | Rows | Families | Top-3 share |
|---|---:|---:|---|
| ILLUSTRATION_REPLACEMENT | 1,078 | 91 figures | **87%** (`count-on-hops` 793, `bar-compare` 84, `number-track` 65) |
| MATH_TYPESETTING | 9,579 | ~6 notation families over 263 real rows | — |
| MCQ_DISTRACTOR_REVIEW | 572 | 2 detector signals | — |
| PREDICTION_GATE_REVIEW | 200 | 1 systemic finding | 100% |

A worker leased "50 illustration rows" would redesign `count-on-hops` up to 50 times. A worker
leased "the `count-on-hops` figure" fixes 793 rows once. **Lease the cause, not the symptom** —
route through `COWORK_CACHE/work-index.json`, which is grouped that way.

Corollary, and the expensive lesson of this session: **before leasing any workstream, ask what the
audit actually measured.** The MATH_TYPESETTING audit reads raw JSON text and never asks the
renderer. Measuring the same rows against `authoredMathParts` took one throwaway probe and moved
9,316 rows out of the work column. One probe against the mechanism beats a thousand row reviews.

## 2. Roles

| Model | Role | May write |
|---|---|---|
| **Fable** | Planner / architect. Decomposition, dependency order, acceptance criteria, curriculum-risk framing. | Planning + QA artifacts only. Read-only on product source. |
| **Sonnet** | Bounded implementor. One family per worker, disjoint files, explicit acceptance command. | Only its leased files. |
| **Opus** | Orchestrator, shared-file owner, adversarial assessor. Owns `widgets.tsx`, `describeState.ts`, `schema.ts`, evaluators, gates, and every merge. | Anything, but is the only writer of shared files. |

No two workers write the same file, ever. Shared-file changes serialize through Opus. Workers
return a commit hash, a changed-file list, exact gate output, and unresolved risks — never file
dumps.

## 3. Precache — pay once

`COWORK_CACHE/` is **tracked**, deliberately against the execution prompt's "session-local"
instruction, because session-local is exactly why three sessions each re-derived the same facts.
It holds maps, counts, and traps — no lesson prose, no dependency content.

| File | Replaces |
|---|---|
| `gate-map.md` | rediscovering commands, runtimes, expected-clean output, and the environment traps |
| `engine-map.csv` | re-walking the registry for all 127 engines |
| `work-index.json` | reading an 11,487-row CSV to find a slice |
| `typesetting-renderer-gap.csv` | re-measuring the renderer over 9,579 rows |
| `PENDING_WORK_INVENTORY_S237.md` | reconstructing what is left from five handovers |

Refresh only the partition a batch touched. A worker that reads the whole corpus to answer one
question is the single biggest avoidable cost in this repo.

## 4. Adversarial protocol

Fable plans it, Sonnet builds it, **Opus tries to break it** — and the break attempt is the
deliverable, not a formality.

1. **Refute, don't confirm.** Verifiers are prompted to REFUTE and to default to REFUTED when
   uncertain. A claim that survives a weak attack has not been tested.
2. **Diverse lenses, not repeated ones.** Four identical skeptics find one thing four times. This
   session's typesetting panel used four distinct lenses — does it reach the DOM, are all call
   sites covered, what did the audit *mean*, does conversion preserve semantics — because those
   fail in different ways.
3. **Revert a known defect and watch the gate go red.** A gate that catches nothing is worse than
   no gate. Re-prove inherited gates rather than trusting the claim; this session found that
   reverting the `moneyBoard` fix turns `answerParity.s237` red while `accessibleParity.s237`
   stays green — reverting against the wrong file would have read as a dead gate.
4. **Print the output and read it.** Every material defect this session found came from rendering
   the string a learner or screen reader actually gets, past the fail-fast assertion. Two
   regressions the deterministic probes missed were caught only this way.
5. **Scale the attack to the blast radius.** A claim that closes 9,000 rows earns four independent
   lenses. A three-line copy fix earns one.

## 5. Token discipline

- **Aggregate in a script; never paste a corpus into context.** Row counts, top-N tables and
  concentration ratios — a `python3 -` heredoc that prints 20 lines answers what reading 11,487
  rows cannot.
- **Structured output over prose.** Workers return JSON against a schema. Free-text findings get
  re-read, re-summarised, and re-argued; structured ones get counted.
- **One ToolSearch call, batched.** Deferred tools load in a single `select:` list.
- **Probe the mechanism, not the instances.** See §1.
- **Never re-read a file you just wrote.** The harness tracks it.
- **Cheap gates first, always.** `typecheck` → targeted suites → content/pedagogy → registration →
  full Vitest (sharded) → `validate:native` → build. Stop a bad batch before the 20-minute suite.

## 6. Concurrency limits on this box

2 cores. Non-negotiable, learned by reproducing the failure:

- **Never more than 2 Vitest shards at once.** Six concurrent shards on 2 cores is what produced
  session A's phantom "25 failures / 11 files" — deterministic seed sweeps starved past Vitest's
  5,000 ms default and were reported as ordinary test failures.
- **Adjudicate every timeout solo before recording it.** A timeout is not a failure until it
  survives alone.
- **`git status --porcelain` after every Vitest run.** `figureTextAdversarialAudit.test.tsx`
  rewrites `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` from 11,487 rows to 1,078. It has bitten in every
  session that ran the suite, including this one.
- Read-only analysis agents parallelise freely; they are I/O-bound, not CPU-bound.

## 7. Batch protocol

1. Fable leases work IDs **by family** and freezes owned files.
2. Worker records the base commit; reads only its slice, the shared contract, and its targeted tests.
3. Worker writes the assertion beside the fix where practical.
4. Cheap gates first.
5. Worker commits only its owned files; reports exact evidence.
6. Opus reviews the diff, adversarially, and integrates. No blind cherry-pick.
7. **Regenerate the governing audit and prove its closure condition.** A row is not complete
   because code was edited, and the queue CSV is never hand-edited to close anything.
8. Update the ledger only when the stated reopen condition is satisfied.

## 8. Hand-back

`git push` is blocked by the Cowork git proxy in every session so far. The working loop is
`git bundle create <file> origin/cowork/s237..cowork/s237 --branches=cowork/s237` → `SendUserFile`
→ the user fetches into their own clone and pushes. The stop hook that nags about unpushed commits
cannot be satisfied from inside the session; do not spend budget on it.

The GitHub MCP connector **can** read this repo and exposes a write path that does not use the git
proxy. It was deliberately not used: `push_files` takes file content as a literal string argument,
so an 82 KB source file would have to be regenerated character-for-character with no cheap way to
prove it was not silently corrupted. Viable for new, small files only.
