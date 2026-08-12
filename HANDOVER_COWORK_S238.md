# HANDOVER — Cowork S238 → next session

Successor to `HANDOVER_COWORK_S237_SESSION_D_2.md`, which remains correct on §3 (what is left),
§5 (rulings owed), §6 (environment traps) and §7 (reading catches) — re-read those there.
**New since S237: `OPTIMIZATION_PLAN_V3.md` is the canonical program document** (user directive,
2026-08-12); `PREMIUM_EXPERIENCE_CONTRACT.md` is its checkable core. Where any older program doc
disagrees with Plan v3, Plan v3 wins.

## 0. Bootstrap

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail && git checkout cowork/s237
git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming
git merge-base --is-ancestor 4b66fe1 HEAD; echo "ancestry:$?"    # MUST be 0
npm ci
```

**HEAD at end of S238: `2aa3fca`.** Remote is at `ac54811` (verified via GitHub API this
session), so the bundle carries **6** commits. Read `PREMIUM_REBUILD_S238_EXECUTION.md` for what
landed and the full gate table.

## 1. Gate results at `2aa3fca` — your baseline

```
typecheck                clean
vitest (2 shards)        13,124 / 13,124
playwright               132 / 132        ALL 5 projects (not just chromium) vs next start
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
validate:native          archive-only findings only
check-registration       consistent
build                    EXIT:0
```

Note the playwright number: S237 measured chromium only (97). S238 fixed three stale
`player-state.spec.ts` assertions that were failing at baseline in the player-state-desktop
project, and added 5 tests in `e2e/s238-stage-roles.spec.ts`. 132/132 across all projects is the
new bar; do not regress to counting one project.

## 2. What S238 landed

Plan v3 adopted in-repo · Premium Experience Contract written · WS-D §1 stage roles shipped
(reading 672 / compact 768 / wide model 1024 / hero 1152-empty; six graph labs' inner SVG cap
512→576) with pixel evidence in `S238_SCREENSHOTS/` · stale e2e assertions fixed stricter.
Details and rationale: `PREMIUM_REBUILD_S238_EXECUTION.md`.

**Do not assign hero-tier engines by guess.** The tier exists; engines join it with their WS-C
conversion after 1440px pixel QA. The six graph labs' SVGs are square viewBoxes — width is
height; their real growth is WS-C side panels, not a bigger square.

## 3. Suggested next actions (Plan v3 order, S237 measurements intact)

1. **WS-C opening move:** `plotData` extension to `McqSpec` (8 rows, renderer/resolver/spoken
   phrase already shared) — S237 §3.2's highest-leverage step, still undone.
2. **`unitChain` label collisions** (82 of the 267 measured; gate already exists).
3. **Bring the user the five rulings** in S237 handover §5 — cheap to ask, blocking.
4. When a parallel wave launches, build the §4.2 precache first (`/.cowork-cache/`), not before.

Environment traps (S237 §6) all still apply: kill `next start` by pid before rebuilding; never
`pkill -f "next start"`; 2 vitest shards max; Trap K restores the queue CSV on every full run —
`git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv S237_SCREENSHOTS WAVE04_SCREENSHOTS` before
committing (playwright full runs rewrite sealed capture sets).
