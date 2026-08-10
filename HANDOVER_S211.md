# HANDOVER → Session 211

Read `SESSION210_EXECUTION_REPORT.md`, `SESSION210_CONTENT_CHANGE_LEDGER.md`, and the
"# S210 REVIEW" section of `SESSION208_INTEGRATION_REVIEW.md` first.

## 0. State

MMIP v1: four engines shipped through assembled `CanonicalModel` seams (solveBalance,
lineExplore, slopeTriangle, algebraTiles). RSG canonical family: `LineCanonical` (total),
`TriangleCanonical` (legs; partial line derivation), `LinePairCanonical` (module-only, no
consumer yet). Content: **hash baseline is now `SESSION210_LESSON_HASHES.json`** (re-baselined
after 2 authorized insertions — the first content change since S205; ledger has the full
protocol). Gates at seal: 302 files / 12,374 vitest, Playwright 115/115, hash 1,701/1,701,
content-change proof 809/809, build 0.

## 1. Restart priorities

1. **Wire linePairModel** into affineRelationshipLab's intersection (the last line math in that
   widget) and stand up the first systems-of-equations surface on it (unique/parallel/coincident
   as breakable, reachable states). O2-agent domain; widgets.tsx window needed.
2. **Hoist the shared morph/coalescing helper** out of the three widgets before a fourth engine
   copies it (SolveBalanceW, LineExploreW/SlopeTriangleW, AlgebraTilesW). Small, pays forever.
3. **Schema window for algebraTiles**: x² tiles + area frame (unlocks distribute→branch,
   factor→gather, and makes the workspace a multiplication surface). Schema changes = Opus +
   adversarial review before seal; additive only.
4. **Variant form restoring vec-05-03/k1 re-askability**: add a `matrixTransform` form to the
   `reflect-compose` generator (src/lib/variants.ts + independent route + BAND + declaration),
   per CLAUDE.md's variant protocol. Bounded, well-documented cost from S210.
5. Then: remaining P1 engine families (geometry studio next by mandate order), eight engine gaps,
   formalize the fifth adjudication gate (**DEMAND** — learner must SUPPLY the claim, not just
   see it) into the rich-mix method before any further adjudication sweeps.

## 2. Traps (cumulative; Trap D UPGRADED this session)

- Traps A/B/C unchanged (Playwright reuses 3100 prod server; two slow vitest files solo; no
  backgrounded monolithic runs — foreground directory batches, dot reporter).
- **Trap D (upgraded): `next-server` processes RESURRECT in this sandbox — even after SIGKILL,
  even with zero `pgrep -x next-server` output** (found holding the port via `/proc` fd scan +
  `fuser 3100/tcp`). Port state between tool calls is untrustworthy. The ONLY reliable freshness
  protocol: kill whatever `fuser 3100/tcp` names → start the new server → require BOTH a `Ready`
  line AND zero `EADDRINUSE` in ITS OWN log → run Playwright immediately. A green curl proves
  nothing about WHICH server answered.
- Trap E: byte-identical mtime churn — hash against the sealed tarball, never trust mtimes.
- Co-work rules that have now held for three sessions: single-writer lock per shared file;
  sequential widgets.tsx windows; workers run targeted vitest only; ONE serialized gate chain in
  the controller; the independent adversarial reviewer runs before seal and its conditions land
  before packaging. The reviewer's catch record: false doc claim, frozen-type hole, undo bug,
  loosened a11y check, stale proof denominator, an answer printed in a prompt. Keep it
  adversarial.
- An agent refusing to exceed its granted scope (S209 adjudicator declining content writes) is
  the system working — grant scope explicitly to a fresh worker instead of arguing.

## 3. Tripwires

- `mmipTypes.ts` FROZEN (byte-verified at three consecutive seals).
- Hash target is `SESSION210_LESSON_HASHES.json` everywhere (package.json, seal.sh,
  CO_WORK_PLAN.json all repointed — grep before assuming).
- The content-change proof's `AUTHORIZED` list + live denominator: extend in its own format,
  never weaken; the S151 baseline is cumulative by design.
- `leCanonicalFor` + SlopeTriangleW persistence tripwires (persisted values narrower than
  canonical types); `{x, c, mat}` in algebraTiles is the ONE sanctioned derived-value-persist
  (frozen grader contract) — delete `{x,c}` duality if evaluate.ts ever learns populations.
- keyboardParityCheck: native `disabled` only; all-exempt throws. No aria-disabled clause.
- Rating lifts: S205M rubric only. Four MMIP engines changed no rating; that remains correct
  until a dedicated adjudication pass.
- `describeState` target-narration: standing product decision, out of scope for leak checks.

## 4. Verification chain

As `HANDOVER_S210.md` §4 with Trap D's upgraded protocol. Hash gate now verifies against
SESSION210; expect `content-change proof 809/809`.
