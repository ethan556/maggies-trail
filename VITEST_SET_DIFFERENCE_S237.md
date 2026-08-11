# S237 — the full Vitest set difference

**Closes the top open item in `HANDOVER_COWORK_S237_SESSION_B.md` §4.1.** Session A recorded
25 failures / 11 files on Linux against CL-P1-033's recorded 15 failures / 6 files on Windows, and
asked for the set difference before anything was attributed to the session-B commits.

The answer is not the one the question expected. **Neither the Linux 25 nor the Windows 15 exists
as a failure set on this platform.** The only real Linux failures at `489b272` were four
regressions introduced by session B itself.

---

## 1. Environment

| | |
|---|---|
| Branch / head audited | `cowork/s237` @ `489b272` |
| Execution base compared against | `4b66fe1` (required implementation ancestor), in a `git worktree` sharing `node_modules` |
| Node / npm | v22.22.2 / 10.9.7, `npm ci` clean |
| Host | Linux, **2 cores / 8 GB** — this matters; see §5 |
| Vitest | 4.1.10 |
| Shape of every run | `npx vitest run --shard=i/6`, **two shards at a time** (`xargs -P 2`) |

`git status` was checked after every Vitest invocation. Trap K bit exactly as documented — the
first run truncated `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` from 11,487 rows to 1,078. Restored with
`git checkout --` and verified at 11,487 before any further work. It bit the base worktree too.

---

## 2. Result

| Run | Files | Tests | Failed |
|---|---:|---:|---:|
| **Base `4b66fe1`, Linux** | 327 | 12,813 | **0** (2 contention timeouts, adjudicated green solo — §5) |
| **Head `489b272`, Linux** | 331 | 12,824 | **2 assertions / 1 file** |
| Head `489b272` + this repair | 331 | 12,824 | **0** |
| *Recorded* Windows baseline (CL-P1-033) | 321 | 12,813 | 15 / 6 files |
| *Recorded* session-A Linux run | 327 | 12,813 | 25 / 11 files |

The base total (327 files / 12,813 tests) reproduces the recorded total exactly, so the suite is
the same suite. The head total is +4 files / +11 tests: session B's four new S237 spec files.

### The set difference, stated plainly

- **Windows 15 ∩ Linux = ∅.** Not one of CL-P1-033's recorded failures reproduces on Linux. The
  ledger's own hypothesis — path separators and temp-directory cleanup — is consistent with that:
  those defects pass on POSIX by construction. CL-P1-033 is a **Windows-only** item, and its
  reopen condition ("rerun full suite on Linux CI and Windows") is now half-satisfied: the Linux
  half is green.
- **Session-A Linux 25 = ∅ real failures.** All 10 named files pass at the base commit on Linux
  when run without CPU contention (4,079 tests, 0 failed). See §5 for what those 25 actually were.
- **Genuinely new = 4**, all introduced by session B, all inside one file, all repaired here.

---

## 3. The four regressions

`src/components/widgets.a11yAudit.s44.test.tsx` reported **2** failing assertions. Both assertions
loop over the registry and fail on the first violation, so the count understated the damage.
Enumerating past the fail-fast gives **four** distinct engines:

| Engine | Violation | Introduced by |
|---|---|---|
| `pointSetReasoningLab` | description 46 chars, floor is >60 | `3237c7d` |
| `quotientReasoningLab` | description 59 chars | `3237c7d` |
| `matrixTransform` | actions copy names no operable affordance | `523886e` |
| `equationOutcomeLab` | description 49 chars | `489b272` |

Attribution is not inference: each commit's `describeState.ts` and `widgets.tsx` were checked out
in turn against the fixed gate, and the violation set was re-enumerated at every step.

**Three of the four are one defect.** Removing an internal task enum from a description was right —
that is the WP1 metadata-leak rule doing its job. But in these three the enum clause was the *only*
context sentence in the string, so removing it left the panel both below the gate's substance floor
and quieter than the screen. The repair is not to restore the enum; it is to narrate what the
widget already shows:

- `equationOutcomeLab` — the collected-terms residue. The widget prints it in its own dashed panel
  and states it in the section's `aria-label`, and `equationOutcome.s141` pins it as deliberately
  exposed. **The outcome stays withheld**; only the residue is spoken.
- `quotientReasoningLab` — the labelled "Source state" panel. Before this, the description
  contained no mathematics at all: a screen-reader user was told how many stages were open and
  nothing about what was being divided.
- `pointSetReasoningLab` — what the axes measure, matching the plot's on-screen axis titles and its
  own `aria-label`.

`matrixTransform` is a different defect. `523886e` was **factually correct** to replace "Four
sliders" with "Four steppers" — `MatrixTransformW` contains no `type="range"`; it renders
`MatrixStepper` minus/plus button pairs. But the s44 gate does not check prose quality, it checks
that the copy names something a keyboard user can operate, and "steppers" names none. The copy now
says minus/plus button pairs and *press* — true about the control and about how to work it.

**The gate was not touched.** It was red before, green after, and it demonstrably catches this
class: reverting any one of the four turns it red again.

### Reading the output, not the assertion

Both repairs and both verifications came from printing strings, per handover lesson 1:

- enumerating every engine past the fail-fast assertion: **4 violations → 0**;
- printing the description for **all 73 authored instances** of the four engines and reading them.
  This is what caught `The number line is labelled value.` — the first draft read
  `Values plotted along value.`, which is near-tautological on the three 1-D lessons whose
  `xLabel` is literally `"value"`. Green either way.

---

## 4. Recorded, not fixed

Reading those 73 authored instances surfaced two pre-existing defects outside this repair's scope.
Neither is caused by session B and neither is touched here.

1. **`quotientReasoningLab` renders whole numbers as improper fractions on screen.** `dop-03-02`
   shows **`492/1 ÷ 15/1`** in its prominent "Source state" panel; `ns-02-01` shows
   `1248/1 ÷ 24/1`. That is `quotientRationalKey` used verbatim as display text in
   `widgets.tsx`. The description now mirrors it exactly, because parity is the rule and the
   description must not be quietly nicer than the screen — but **the screen is the thing to fix**,
   and fixing it will require the description to follow. 39 authored instances; a `MATH_TYPESETTING`
   / premium-quality row, not an accessibility one.
2. **`equationOutcomeLab` transform mode emits a trailing space** — `"… equals 3x plus 10. "` — on
   all 8 authored transform instances. The dangling-fragment class from handover lesson 1. Cosmetic,
   pre-existing, untouched.

---

## 5. What the "25 Linux failures" actually were — Trap B, at scale

Session A ran its six shards **concurrently on a 2-core box**. Vitest's default `testTimeout` is
5,000 ms. Under 6-way contention, long deterministic sweeps blow that budget and are reported as
ordinary test failures with ordinary test names — which is why the report reads like a list of real
defects rather than an environment fault.

This was not deduced, it was reproduced. The base full-suite run in this session happened to
overlap with targeted head runs, and shard 1 came back with:

```
× trig-inside: 400 seeds — correct, trapped, diagnostic, deterministic  5922ms
× solve-trig-all: 400 seeds — correct, trapped, diagnostic, deterministic  5283ms
Error: Test timed out in 5000ms.
```

Re-run **solo, same commit, same machine**: `442 passed | 3551 skipped`, exit 0. Same two tests,
same seeds, no source change. These generators are pure functions of a fixed seed string — they
cannot be flaky in the ordinary sense, only starved. That is the standing Trap B ("roaming vitest
timeouts — solo-adjudicate") appearing on a fresh axis, and it accounts for the shape of session
A's report: deterministic seed gates, jsdom playthroughs, and audit sweeps are exactly the slow
tests, and they are exactly the 11 files named.

**Operational rule for this box: never run more than two shards at once, and adjudicate every
timeout solo before recording it.** A timeout is not a failure until it survives alone.

---

## 6. Ledger effect

- **CL-P1-033** — narrow it, do not close it. Linux is now evidenced green at both `4b66fe1` and
  (post-repair) `489b272`; the 15 recorded failures are Windows-only and remain open until a
  Windows run proves them fixed. The remaining work is genuinely portability, and its Linux-side
  reopen condition is satisfied.
- **Handover §4 item 1** — closed by this document.
- **Session A's §1–§2 Vitest numbers** — superseded. `HANDOVER_COWORK_S237_SESSION_A.md` §2 should
  be read as an environment artifact, not a defect list, and its 11-file list is not a work queue.

## 7. What this does not do

No browser verification. No claim about Windows. Nothing here regenerates
`PREMIUM_ENGINE_LEARNER_FOCUS_AUDIT_S237.csv` or the pending-workload queue — item 2 in the
handover's order (rerun the 127-engine audit and confirm the LEAK count drops for the right
reasons) is still open, and is deliberately still the *next* session's verification of this one.
