# Gate map — read this instead of rediscovering it

Sourced from `package.json` scripts, `CLAUDE.md`, `HANDOVER_COWORK_S237_SESSION_A.md`,
`HANDOVER_S237.md`, and `VITEST_SET_DIFFERENCE_S237.md`. If those files and this one disagree,
this one is stale — re-derive the disputed row, don't guess.

## Gate table

| Command | Proves | Runtime | Expected-clean output | Known false findings |
|---|---|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | No type errors anywhere in the tree | ~72 s | Clean, no output | None known |
| `node scripts/check-registration.mjs` | Files ↔ `course.json` ↔ `PLAN.md` are consistent | fast | PASS | None known |
| `node scripts/audit/engine-registration-contract.mjs` | Every widget engine is registered and core-complete | fast | 127/127 core-complete (describeState coverage is separately tracked, was 84/127 at S237) | None known |
| `npm run validate:content` (`tsx scripts/content-check.ts schema`) | Content JSON matches schema | fast | All items clean (1840/1840 at S237; count grows over time) | None known |
| `npm run lint:pedagogy` (`tsx scripts/content-check.ts pedagogy`) | Pedagogy rules (feedback length, no-negation-opener, etc.) hold | fast | All items clean (1711/1711 at S237) | None known |
| `npm run validate:native` (`node scripts/native-integrity.mjs`) | Source-level integrity: untyped native `<button>`, host-absolute imports, unbounded API parsing, unreachable routes — the only gate that catches these; typecheck/vitest cannot | fast | PASS in substance | **Always** reports `node_modules/` and `.next/tsconfig.tsbuildinfo` in a working checkout (archive-only checks). These are expected. **Any other finding is a real defect** — do not wave it through. |
| `npm run build` (`next build`) | Production build compiles and route table generates | ~2 min | `✓ Compiled successfully`, full route table printed | Can print `✓ Compiled successfully` and still exit 1 on an ESLint failure. **Check by exit code, not by grepping for "error".** Redirect as `> log 2>&1`, never `2>&1 > log` (wrong order leaks stderr). |
| `npx vitest run --shard=i/6` × 6 (i.e. `npm run test` sharded) | Full behavioral suite | ~20 min wall clock, 6 shards, **max 2 concurrent** on this box | 0 failed, 331 files / 12,824 tests (S237 head; base was 327 files / 12,813 tests) | See "Environment traps" below — Trap K (queue file gets rewritten) and Trap B (timeouts under contention are not real failures). A single un-sharded `npx vitest run` exceeds a 10-minute tool call budget (`variants.test.ts` alone is ~5 min / 3,993 tests). `--reporter=basic` does not exist in Vitest 4 — errors out before running; use the default reporter. |
| `npx tsx scripts/measure/verify.mts` | Generated variant output matches the authored template (variant-generation workstream only) | fast | Authored vs generated side by side, no diffs | None known |
| `node scripts/audit/consolidate-pending-workload-s236.mjs` (`npm run audit:pending-workload`) | Regenerates `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` from source-of-truth audits | fast | Row counts match the current workstream ledger | This is the **sanctioned** way to regenerate the queue file. Never trust `figureTextAdversarialAudit.test.tsx`'s side-effect write instead (Trap K). |

Full local gate sequence, in cheapest-first order (per `CLAUDE.md` / session A):

```
npm run typecheck
node scripts/check-registration.mjs
node scripts/audit/engine-registration-contract.mjs
npm run validate:content
npm run lint:pedagogy
npm run validate:native
npm run build            # check $? , not grep
npx vitest run --shard=i/6   # 6 shards, max 2 concurrent, git status after each
```

---

## Environment traps

### Trap K — vitest destroys `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`

`src/components/figureTextAdversarialAudit.test.tsx` (~line 218-219) calls `writeFileSync` on
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` as a side effect of running, and writes back **only the
illustration rows it computes** — rewriting the file from **11,487 rows down to 1,078**, silently
deleting all 10,409 non-illustration rows (MATH_TYPESETTING, MCQ, PREDICTION, CLOSURE_LEDGER,
ENGINE_REVERSIBLE_PLAY, PREMIUM_REBUILD_WAVE, INTERACTION_NECESSITY, ENGINE_DISPOSITION).

- **Run `git status` after EVERY vitest invocation**, no exceptions — it bites both the working
  clone and any worktree sharing the file.
- If it fired: `git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, then verify row count is back
  to 11,487 (or current committed count) before doing anything else.
- The truncated 1,078-row file is **data loss, not queue progress** — do not mistake it for real
  closure.
- The sanctioned way to regenerate the queue is `npm run audit:pending-workload`
  (`scripts/audit/consolidate-pending-workload-s236.mjs`). The test's write is not sanctioned and
  should never be treated as authoritative.

### Trap B — vitest timeouts under CPU contention are not real failures

Vitest's default `testTimeout` is 5000ms. This box has **2 cores**. Running many shards
concurrently starves long deterministic sweeps (large seed loops, jsdom playthroughs, audit
sweeps) past that budget, and they get reported as ordinary test failures with ordinary test
names — indistinguishable from real defects in the report.

- **Never run more than 2 shards at once** on this box (e.g. `xargs -P 2`).
- **Adjudicate every timeout solo before recording it as a failure.** Re-run the specific failing
  file alone, same commit, same machine. If it passes solo, it was contention, not a defect.
- Documented proof case: session A's reported "25 failures / 11 files" from a 6-way-concurrent
  run was later shown to be **entirely a Trap B artifact** — re-running the base commit with
  proper 2-at-a-time sharding gave 0 real failures. Two of those apparent failures were literally
  `Test timed out in 5000ms` on `trig-inside` / `solve-trig-all`, generators that are pure
  functions of a fixed seed and cannot legitimately be flaky.
- A timeout is not a failure until it survives being run alone.

### `validate:native` expected findings

`npm run validate:native` (`scripts/native-integrity.mjs`) will **always** flag `node_modules/`
and `.next/tsconfig.tsbuildinfo` in a working checkout — these are archive-only checks and are
expected, not defects. **Any other finding is a real defect** and must be triaged, not dismissed
alongside the expected two.

### Build gate: check exit code, not grep output

`npm run build` can print `✓ Compiled successfully` and still exit 1 (e.g. on an ESLint failure
after compilation). Always check `$?` (or the tool's exit status), never grep stdout for the word
"error" as a pass/fail proxy. If redirecting, use `> log 2>&1` — the reverse order (`2>&1 > log`)
leaks stderr to the terminal instead of the log.

---

## Measured full-suite shape (S237, Linux, this box)

- **331 files / 12,824 tests** (head `cowork/s237` @ `489b272`; base execution ancestor
  `4b66fe1` measured 327 files / 12,813 tests — the +4 files / +11 tests are session B's new spec
  files).
- **6 shards** (`npx vitest run --shard=i/6` for i in 1..6).
- **2 concurrent max** (Trap B — this is a 2-core box).
- **~20 min wall clock** for the full sharded run.
- Expected-clean result: **0 failed**, after Trap B solo-adjudication of any timeouts and Trap K
  restoration of the queue CSV if it fired.
