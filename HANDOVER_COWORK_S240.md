# HANDOVER — Cowork S240 → next session

Written at the end of S240 (2026-08-13), one wave: **the last 5 NOT-POSSIBLE rows close.**
Supersedes `HANDOVER_COWORK_S239.md` §3 (that queue item is done); that file and
`HANDOVER_COWORK_S238.md` stay correct on everything else — §5/§6 environment traps and commit
conventions there still apply verbatim, as do S237-D-2's §6/§7.

**`OPTIMIZATION_PLAN_V3.md` remains the canonical program document.**

---

## 0. Bootstrap

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail && git checkout cowork/s237
git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming
git merge-base --is-ancestor 80a5c1c HEAD; echo "ancestry:$?"    # MUST be 0
npm ci
```

**HEAD at end of S240: see the bundle tip** (one wave commit on `80a5c1c`, S239's final commit).
`git push` is still proxy-blocked; work travels as `git bundle create <f> 80a5c1c..HEAD`.

Read `PREMIUM_REBUILD_S240_EXECUTION.md` for this wave's full record — every one of the 5
NOT-POSSIBLE rows, the two new engines' design rationale, the gate gaps they caught, and the one
real defect (a label collision) found and fixed this session, with how it was verified. This file
is the map.

---

## 1. Gate results at session end — YOUR BASELINE

```
typecheck                clean
vitest (2 shards)        13,383 passing   (9,782 + 3,601; both EXIT:0)
playwright               132 / 132        ALL 5 projects, vs `next start -p 3100`
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     873 / 873
validate:native          archive-only findings (node_modules, .next)
check-registration       consistent
build                    EXIT:0            check the EXIT CODE, never grep for "error"
gen:reports              head green; still exits 1 at place-value-transform-mutations-s145 M28
                         (34/35) — PRE-EXISTING since S145, unchanged through S238/S239/S240
COLLISION_SWEEP=1        EMPTY   (run after ANY widget change — this wave's own change tripped it
                         once; see §2)
FIGURE_SWEEP=1           EMPTY   (run after ANY figure change; figures.tsx untouched this wave)
```

Commands, shard discipline, and every environment trap: unchanged from S238's handover §5,
S239's §1. One addition to the trap list, §5 below.

---

## 2. What S240 closed

**All 5 remaining NOT-POSSIBLE rows from `COWORK_CACHE/needs-manipulative-s237.csv` are done.**
Two new engines joined the registry — `feasibleRegionExplore` (a draggable vertical fence
clipping a feasible region, corners re-deriving live) and `parametricTrace` (a direction tracer,
line and circle modes, continuous forward angle accumulation with no backward-wrap at the
circle's seam) — plus `percentBar` grew a flat-fee structure (a fixed segment beside the existing
percent track). Every insertion is the same "alongside" shape: a new `kind:"interactive"` step
directly before the existing graded check, the check copied byte-for-byte, re-verified identical
by the gate. `manipulativeAlongside.s237.test.ts` is now 22 rows; `widgets.drag.test.tsx` is now
138 cases.

Building the two new engines caught two registration-checklist gaps from how they were
originally wired: `REGISTERED_WIDGETS` (in `widgets.tsx`) and `scripts/engine-capabilities.json`
itself were both missed on the first pass despite every OTHER surface (schema, evaluate,
pedagogy, renderer, stageWidth, widgetSamples, keyboard gate) being correctly wired. Both fixed;
confirmed complete against `scripts/audit/engine-registration-contract.mjs` (129/129). Also wrong
initially: both engines' `adapt` capability was set to `0` by analogy with a sibling engine
instead of checking the actual rule (`adapt=3` iff the component source contains `"onEvent"`) —
both wire `onEvent`, both corrected to `adapt:3`.

**A real defect shipped and was caught before commit, not after:** the flat-fee label and the
"0%" tick label in `percentBar` rendered on the identical row and collided (confirmed by
`COLLISION_SWEEP=1`, all 3 tones, the one authored instance `pr-04b-02/i2b`). Fixed by giving the
fee label its own row (`y: barY-6` → `barY-18`); re-swept clean, re-verified in a real-browser
1440px capture (`S240_SCREENSHOTS/01`). **Run `COLLISION_SWEEP=1` after every widget-rendering
change, not just at the end of a wave** — this is the second wave running where it caught
something (S239 caught the pointer-swallowing captions; S240 caught this).

Two smaller items ruled on mid-wave, both closed: the MathProse markdown-bold rendering gap
(`cpr-01-03/i1` was showing literal `**or**`; user chose fix-the-renderer) and elapsedTime's
zero graded-practice exposure (user chose author-a-new-step; `mmt-04-03` gained `i4` + a new
**graded** `k4`).

---

## 3. The queue — where to pick up

**The NOT-POSSIBLE queue that ran S237→S240 is fully closed.** There is no standing "next 5" —
the next session needs a fresh instruction from the user on where Plan v3 work resumes. Candidates,
unranked, all still open exactly as S239 left them:

### 3.1 Also open, per Plan v3 (unchanged from S239)

WS-A brand productionization, WS-H landing rebuild, WS-J avatars (concept boards only — Plan v3
Part 0 hard rules) · WS-E prediction purge · WS-G MCQ factory · WS-F sound/voice · §4.2 precache
only when a parallel wave launches · hero tier only with 1440px pixel QA evidence (S239 §2's WS-D
finding: the first 1440 QA of several labs found them OVERSIZED, not undersized — don't assume,
measure).

### 3.2 Four rows still must NOT be converted without a user ruling

`pv-03-03/k1`, `pv2-04-03/k3`, `pc-03-01/k2`, `cpr-05-03/k2` — conversion changes what is graded
on each. Unchanged across S238/S239/S240; still needs a person to decide, not an agent.

---

## 4. Content defects FOUND but NOT FIXED (frozen prose — need a user ruling)

Everything in S238's §4 and S239's §4 stands except the two items S240 closed (markdown-bold,
elapsedTime exposure — see §2 above). Remaining: dc-02-01/ch1 double-36 trap; cosmetic inversions;
grade-vocabulary CSV (still the highest harm-per-effort item, per S238).

No gate compares option labels for near-duplication (S238 §4's class) — still worth building.

---

## 5. Environment traps — S238 §5 plus one addition

S238's full list (git push proxy-blocked, `pkill -f "next start"` self-kill hazard, stale `.next`
after rebuild, Trap K sealed-screenshot restoration, 2-shard vitest max, `rm -rf test-results
tsconfig.tsbuildinfo` before `validate:native`, Python patch script all-or-nothing writes, `cd`
discipline) all held this session exactly as documented. One more, hit fresh this wave:

- **`pgrep -af "next start"` (and any `-f` pattern search) matches the pgrep INVOCATION ITSELF**,
  not just target processes — the same hazard S238 documented for `pkill`, but it applies to any
  `-f`-style full-command-line match, including read-only ones like `pgrep`/`ps -ef | grep`. A
  literal `pgrep -af "next start"` call's own command line contains the substring `"next start"`
  and matches itself, printing a false positive that looks exactly like a stale server. Build the
  pattern from concatenated fragments even for read-only checks: `PAT="next"" start"; pgrep -af
  "$PAT"`.
- **`gen-product-state.mjs`** (inside the `gen:reports` chain) spawns its own internal, unsharded
  `vitest run --reporter=json` and single-handedly accounts for several minutes of the chain's
  total wall time with near-zero visible log output in between — expected, not a hang; confirm
  via `ps`/`top` showing a live worker at full CPU, same diagnostic as the shard-buffering trap.

---

## 6. Commit conventions

Unchanged (S238 §6, restated by S239 §5): both trailers, exact gate results in the body, red
gates stated plainly. Trap K restoration (queue CSV + sealed screenshot sets) done before this
wave's commit, as it must be before every commit.
