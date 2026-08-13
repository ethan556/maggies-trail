# HANDOVER — Cowork S239 → next session

Written at the end of S239 (2026-08-13), one wave: **WS-C closed**. Supersedes
`HANDOVER_COWORK_S238.md` §3.1 (WS-C is no longer live work); that file stays correct on
everything else and §5/§6 there (environment traps, commit conventions) still apply verbatim,
as do S237-D-2's §6/§7.

**`OPTIMIZATION_PLAN_V3.md` remains the canonical program document.**

---

## 0. Bootstrap

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail && git checkout cowork/s237
git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming
git merge-base --is-ancestor 4b66fe1 HEAD; echo "ancestry:$?"    # MUST be 0
npm ci
```

**HEAD at end of S239: see the bundle tip** (one wave commit on `8038b7c`). `git push` is still
proxy-blocked; work travels as `git bundle create <f> ac54811..HEAD`.

Read `PREMIUM_REBUILD_S239_EXECUTION.md` for this wave's full record — including the complete
WS-C adjudication ledger (every one of the 57 formerly-unconverted range-carriers has a named
verdict there). This file is the map.

---

## 1. Gate results at session end — YOUR BASELINE

```
typecheck                clean
vitest (2 shards)        13,310 passing    (9,762 + 3,548; +2 opt-in sweep skips)
playwright               132 / 132         ALL 5 projects, vs `next start -p 3100`
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     871 / 871
validate:native          archive-only findings (node_modules, .next)
check-registration       consistent
build                    EXIT:0            check the EXIT CODE, never grep for "error"
gen:reports              head green (manifest was stale from S238's waves 9–18 and was
                         regenerated this session — S238 batch-2 precedent); still exits 1 at
                         place-value-transform-mutations-s145 M28 (34/35) — PRE-EXISTING
COLLISION_SWEEP=1        EMPTY   (run after ANY widget change)
FIGURE_SWEEP=1           EMPTY   (run after ANY figure change)
```

Commands, shard discipline, and every environment trap: unchanged from S238's handover §1/§5.

---

## 2. What S239 closed

**WS-C direct manipulation is DONE.** 44 engines share `useSvgDrag` (19 prior + 25 this wave);
every remaining range-carrier is adjudicated by name (converted / survival-with-reason /
already-direct / sub-branch) in the execution record. The drag gate is now 125 cases
(`widgets.drag.test.tsx`) and still pins VALUES, not presence. The frontier measurement itself
is committed: `scripts/measure/wsc-frontier-s239.mjs` — re-run it if you ever touch a range
input.

Two defect classes surfaced by this wave's 1440px pointer QA and fixed:
- **Caption-on-geometry / pointer-swallowing** (algebraTiles' row captions sat on the distribute
  rectangle and intercepted its cells' taps; plus the frame's clipped top edge label).
- **Uncapped `w-full` SVGs in the wide stage** (solidSliceLab's sphere rendered 1024×853 and
  overflowed the fold) — the WS-D §1 class, missed on five engines; all five now cap at
  max-w-xl. **Read this before assigning any hero tier: the first 1440 QA of these labs found
  them OVERSIZED, not undersized.**

---

## 3. The queue — where to pick up

The user's approved order has ONE item standing: **the 5 remaining NOT-POSSIBLE rows**
(`COWORK_CACHE/needs-manipulative-s237.csv`), each the same shape — one engine capability, then
an alongside insertion (`kind:"interactive"` step immediately before the graded check, check
byte-identical):

1. **pr-04b-02/k3** — `percentBar` flat-fee: a two-segment bar (fixed fee + proportional part)
   showing STRUCTURE without printing the answer. The fill-edge drag shipped this wave; the
   capability rides on top of it.
2. **iar-03-01/ch1, iar-03-03/ch1** — `systemsExplore` vertical-constraint support (x ≤ 4, x ≤ 5).
3. **pp-04-01/k1, k2** — parametric-direction tracer (arrowheads along the path as t increases).

**Gate:** `manipulativeAlongside.s237.test.ts` (17 rows → grows with each). Its UNCHANGED
contract catches paraphrased trap text — copy authored prose, never retype it.

**Four rows still must NOT be converted without a user ruling** (conversion changes what is
graded): pv-03-03/k1, pv2-04-03/k3, pc-03-01/k2, cpr-05-03/k2.

### Also open, per Plan v3 (unchanged from S238)

WS-A brand productionization, WS-H landing rebuild, WS-J avatars (concept boards only — Plan v3
Part 0 hard rules) · WS-E prediction purge · WS-G MCQ factory · WS-F sound/voice · §4.2 precache
only when a parallel wave launches · hero tier only with 1440px pixel QA evidence (see §2).

---

## 4. Content defects FOUND but NOT FIXED (frozen prose — need a user ruling)

Everything in S238's §4 stands (dc-02-01/ch1 double-36 trap; cosmetic inversions;
grade-vocabulary CSV, still the highest harm-per-effort item). New this session:

5. **cpr-01-03/i1 renders literal `**or**`** — spinnerSim's authored prompt uses markdown bold
   and the widget-prompt pipeline doesn't render it (`S239_SCREENSHOTS/05`). Renderer gap or
   prose fix — either touches a frozen surface; needs a ruling. Worth checking whether other
   prompts author `**…**` before deciding.
6. **elapsedTime's only authored step is a worked example** (mmt-04-03/e1) — it renders fully
   interactive, so the conversion is live there, but the engine's practice exposure is zero.

No gate compares option labels for near-duplication (S238 §4's class) — still worth building.

---

## 5. Commit conventions

Unchanged (S238 §6): both trailers, exact gate results in the body, red gates stated plainly.
Trap K list now also includes restoring `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` after
`gen:manifest`/`gen:reports`, which rewrite it.
