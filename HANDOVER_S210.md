# HANDOVER → Session 210

Written after sealing S209 from a fresh-extraction reprove. Read
`SESSION209_EXECUTION_REPORT.md`, `SESSION209_CONTENT_CHANGE_LEDGER.md`, and the "# S209 REVIEW"
section of `SESSION208_INTEGRATION_REVIEW.md` before acting. Co-work template:
`CO_WORK_PLAN.json` (update it, don't start from scratch).

## 0. State in one paragraph

MMIP v1 frozen and now honest end-to-end: three engines (solveBalance, lineExplore,
slopeTriangle) ship through assembled `CanonicalModel` seams with source-level pins;
`transactionCheck` machine-verifies invariant 2 + the rejection contract; the RSG has two
canonical types (`LineCanonical` total, `TriangleCanonical` with partial line derivation — the
vertical-line decision, settled, `docs/RSG_DESIGN.md`); equation morph animates real transactions
only. Every picture/grader contradiction found so far is fixed (evaluate.ts negative bracket,
S208; slopeTriangle phantom line, S209 — both were LIVE on shipped content and both were found by
wiring, not by auditing). Gates at seal: 298 files / 12,317 vitest, Playwright 115/115, hash
proof 1,701/1,701, build 0.

## 1. Restart priorities

1. **Algebra Workspace (P1 item 7)** — `algebraTiles` physical↔symbolic on a new canonical model.
   The solveBalance pattern is the template (model file + factory + widget seam + harness bridge
   + morph). Biggest remaining flagship. Before starting, decide the zero-pair representation in
   the canonical state (it is the pedagogical heart of the engine).
2. **Two-line relation decision** (`LinePairCanonical` or a relation node over two graphs) — the
   only thing between affineRelationshipLab and full absorb-wiring; also unlocks systems lessons.
3. **Insertion batch for the two adjudicated PASSes** (`vec-05-03/k1` → matrixTransform;
   `sy-02-03` new step → dilationExplore segments) under the FULL content-freeze protocol:
   isolated single-writer content edit, before/after lesson hashes, ledger entry, independent
   mathematical verification, then a NEW authorized-changes manifest. Read
   `SESSION209_RICH_MIX_ADJUDICATION.md` first; do NOT re-adjudicate `lf-02-01/i3` (refused,
   NOVELTY, evidence pinned). Treat the 25% target as to-be-re-derived: the candidate pool is
   thinner than the mandate assumed and `INSERTION_CANDIDATES.json` is stale — regenerate it
   from the live step-mix scorer before any further adjudication sweeps.
4. Then: split `lineFamilyModel.ts` (line/triangle) before a third canonical type joins; the
   remaining P1 engine families; the eight engine gaps (P1.5); world parity (P3).

## 2. Traps (S206–S209 cumulative; two NEW this session)

- **Trap A** (Playwright reuses 3100 prod server), **Trap B** (two slow files solo), **Trap C**
  (no backgrounded monolithic vitest; foreground directory batches + dot reporter) — unchanged.
- **NEW Trap D — resurrected servers.** A `pkill -x next-server` can appear to succeed and the
  process return later (VM fork/restore). Before starting a prod server: `curl --max-time 4` the
  port and require FAILURE; after pkill: confirm the port is closed. An EADDRINUSE death plus a
  stale server yields a green curl that certifies the WRONG build. Kill the `npm exec`/`sh -c`
  wrapper PIDs too (`pgrep -f "next start"`), `kill -9` if needed.
- **NEW Trap E — byte-identical mtime churn.** Some tests rewrite files with identical bytes
  (`ca-01-03.json`, `evaluate.ts` observed). Never conclude tampering from mtime; hash against
  the sealed tarball (`tar -xzOf <seal> <path> | sha256sum`).
- Multi-agent co-work rules that held for two sessions: single-writer lock per shared file
  (widgets.tsx windows are SEQUENTIAL), workers run only targeted vitest
  (`--maxWorkers=1 --reporter=dot`), the full chain runs exactly once, serialized, in the
  controller. The independent adversarial reviewer runs BEFORE the gate chain and its conditions
  land before seal — it has caught a false doc claim, a frozen-type hole, an undo bug, and a
  loosened a11y check across two sessions. Keep it.

## 3. Tripwires

- `mmipTypes.ts` FROZEN (byte-verified at both seals). Additive union cases only, reviewer-signed.
- `leCanonicalFor` (lineExplore) and the equivalent comment at SlopeTriangleW: persisted values
  are narrower than the canonical types — widen persistence BEFORE wiring further edit origins.
- keyboardParityCheck: only the native `disabled` IDL property exempts a control; do not re-add
  aria-disabled. The all-exempt case throws by design.
- The exhaustive triangle verdict sweep derives its bound from authored content — if content
  authors a longer leg, the test moves or fails; don't hand-pin sweep bounds anywhere else either.
- Rating lifts still require the S205M rubric. Three engines adopting MMIP changed no rating this
  session; that remains the correct default until a dedicated adjudication pass.
- `describeState` "The target is…" narration: standing product decision, deliberately scoped out
  of harness leak checks. Don't fix in passing.

## 4. Verification chain

Unchanged from `HANDOVER_S209.md` §4, plus Trap D: verify port 3100 closed before `next start`,
verify the `Ready` line in the server log, and only then run Playwright.
