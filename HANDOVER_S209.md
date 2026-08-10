# HANDOVER → Session 209

Written after sealing S208 from a fresh-extraction reprove. Started from the sealed S207 tarball.

## 0. What S208 did

Read `SESSION208_EXECUTION_REPORT.md` and `SESSION208_CONTENT_CHANGE_LEDGER.md` first; the
adversarial review with all conditions and carried defects is `SESSION208_INTEGRATION_REVIEW.md`;
the co-work structure (locks, acceptance criteria) is `CO_WORK_PLAN.json`.

1. **P0 — MMIP foundations: DONE and frozen.** `solveBalance` full bidirectional proof (tiles ↔
   term controls ↔ symbolic strip on one canonical state, decomposition invariant, named
   refusals); `mmipTypes.ts` v1 contract frozen (`CanonicalModel` is normative — doc §2);
   `repSyncGraph.ts` + `lineFamilyModel.ts` (exact rationals, rejection-with-reason, graph-owned
   undo with gesture coalescing); `equationMorph.ts` (kind→motion semantics, no-crossfade,
   refusals compile to zero phases); `mmipHarness.ts` (8 checks that provably bite).
2. **First propagation: `lineExplore` runs on the RSG.** No line algebra in JSX; clamp/snap
   reported aloud; byte-identical first render; all pinned suites green unmodified.
3. **Grader/renderer contradiction fixed:** `evaluate.ts` negative-bracket sign (`tse-03-02` now
   reaches its authored `unexpandedFeedback`; zero correctness verdicts changed, by structure).
4. Full serialized gate chain green TWICE (per wave). Final: 296 files / 12,262 tests ·
   Playwright 115/115 · hash proof 1,701/1,701 · build 0 · fresh-extraction reprove clean.

**No authored lesson content file changed.** One learner-visible behavior change (tse-03-02
feedback path — a bug fix restoring authored intent) is ledgered.

## 1. Restart priorities for S209

1. **Wave 2 propagation, in the standing prompt's P1 order, one engine family per worker,
   isolated modules + thin integration:** (a) `affineRelationshipLab` derive-only adoption
   (ready now, no decision needed — `docs/RSG_DESIGN.md`); (b) settle the vertical-line
   modelling decision, then wire `slopeTriangle`; (c) Algebra Workspace (`algebraTiles`
   physical↔symbolic on a new canonical model — the solveBalance pattern is the template);
   (d) onward per P1 list. **Before a third adopter:** land the owed independent widget-level
   pass over SolveBalanceW (S1's unclaimed file), and close the two documented v1 gaps (route
   SolveBalanceW through the assembled `CanonicalModel`; harness check inspecting
   `SyncTransaction.ops`/`rejection`).
2. **HS rich mix 23.7% → ≥25%** is now unblocked (MMIP v1 stable): parallel Sonnet adjudication
   with FIT/REACH/READOUT/NOVELTY, starting from carried candidate `lf-02-01/i3`, batched, with
   content ledger + hash authorization per insertion.
3. Eight engine gaps (P1.5), illustration premium pass (P2), world parity + CPU-throttled perf
   (P3), field-calibration instrumentation — unchanged queue.

## 2. Traps (all re-confirmed this session)

- **Trap A:** Playwright reuses `next start` on 127.0.0.1:3100 (`reuseExistingServer` outside CI).
- **Trap B:** `src/lib/variants.test.ts` and `src/lib/content.widgets.audit.test.ts` solo.
- **Trap C:** never background a monolithic vitest run; foreground directory batches with
  `--reporter=dot` (components / lib-minus-slow / app+server+world+math) + the two solo files.
- **New observation:** a test in the src/app+src/server batch rewrites
  `content/courses/curve-analysis/lessons/ca-01-03.json` with identical bytes (mtime churn only —
  harmless, but don't panic at the mtime; hash it).
- `pkill -x next-server`, never `-f`. Read what's on disk before writing a report.
- Multi-agent co-work works in this box IF: single-writer lock per shared file, workers run only
  targeted vitest (`--maxWorkers=1 --reporter=dot`), and the full chain is serialized in one
  place. `CO_WORK_PLAN.json` is the reusable template.

## 3. Tripwires for Wave-2 workers

- `leCanonicalFor` (widgets.tsx): persisted `{m,b}` is narrower than `LineCanonical` — widen it
  BEFORE wiring `setRunRise`/`setRun`/`setInputCell`/`setDomain`, or the graph resets every render.
- `MmipOperation.sides` is a non-empty tuple; `mmipTypes.ts` is FROZEN (additive union cases only,
  with reviewer sign-off).
- `describeState`'s "The target is…" narration is a standing product-level answer-disclosure
  question — scoped out of harness leak checks deliberately; do not "fix" it in passing.
- Rating lifts still require the S205M rubric with a genuinely responding model; MMIP adoption
  alone was deliberately NOT claimed as a rating change this session.

## 4. Verification chain (unchanged, Trap C applied)

`tsc → targeted vitest → batched full vitest (dot) → two slow files solo → validate:content →
lint:pedagogy → check:registration → check:engine-registration → build (exit code) → next start
3100 + curl 200 → Playwright (reuse) → hash:proof → tar → fresh-extraction reprove → sha256 →
present files → HANDOVER.`
