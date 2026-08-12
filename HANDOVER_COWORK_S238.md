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

**HEAD at end of S238: see `git log` (final commit is the handover update on top of `2271cef`).**
Remote is at `ac54811` (verified via GitHub API this session). Read
`PREMIUM_REBUILD_S238_EXECUTION.md` for what landed — TWO batches this session — and the full
gate table.

## 1. Gate results at session end — your baseline

```
typecheck                clean
vitest (2 shards)        13,154 / 13,154      (9,654 + 3,500)
playwright               132 / 132            ALL 5 projects (not just chromium) vs next start
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     867 / 867            <- was 866; vm-02-01 is the new entry
validate:native          archive-only findings only
check-registration       consistent
build                    EXIT:0
gen:reports              head green; exits 1 at place-value-transform-mutations-s145 M28
                         (34/35) — PRE-EXISTING at 39bf84c (33/35 there), not S238 damage
```

Note the playwright number: S237 measured chromium only (97). S238 fixed three stale
`player-state.spec.ts` assertions that were failing at baseline in the player-state-desktop
project, and added 5 tests in `e2e/s238-stage-roles.spec.ts`. 132/132 across all projects is the
new bar; do not regress to counting one project.

## 2. What S238 landed

**Batch 1:** Plan v3 adopted in-repo · Premium Experience Contract written · WS-D §1 stage roles
shipped (reading 672 / compact 768 / wide model 1024 / hero 1152-empty; six graph labs' inner
SVG cap 512→576) with pixel evidence in `S238_SCREENSHOTS/` · stale e2e assertions fixed
stricter. **Batch 2:** `plotData` extended to `McqSpec` and 10 of the 16 inline-dataset rows
wired (family status: 10 done, 4 blocked on §5 rulings, 2 blocked on a dots-vs-X glyph ruling);
content-change proof 866→867; owed `gen:reports` head regenerated. **Batch 3:** unitChain's 82
label collisions → 0, proven over every authored spec × reachable state; SliderW's range renamed
to what it sets (estimateSlider house pattern). **Batch 4:** distributionCompareLab's 48 → 0,
proven over all 33 authored specs × 3 tones (merged group tags at coinciding means; disjoint
label bands; judge evidence un-stacked). **Batch 5:** slopeTriangle's 25 → 0 via a deterministic
callout layout (every authored lesson's START state was the reported collision). **Batch 6:**
samplingBiasLab (14), pointSetReasoningLab (10) and signChart (8) → 0, corpus-proven — all six
NAMED engine rows from S237 §3.1 are closed. Collision ledger: 267 → 80. Details and rationale:
`PREMIUM_REBUILD_S238_EXECUTION.md`.

**New defect for a ruling (found by reading, NOT fixed — frozen prose):** `g2g-01-05/k3`'s
count-vs-value distractor collapses onto the key: stacks 2,6,3,1 over 5,6,7,8 make mode = count
= 6, so bare "6 inches" (graded wrong) sits beside "6 inches — its stack is tallest" (graded
right). A learner reading the plot correctly can be marked wrong. No gate compares option labels
for near-duplication — same class as the S237 `dc-02-01/ch1` duplicate-trap-value finding.

**Do not assign hero-tier engines by guess.** The tier exists; engines join it with their WS-C
conversion after 1440px pixel QA. The six graph labs' SVGs are square viewBoxes — width is
height; their real growth is WS-C side panels, not a bigger square.

## 3. Suggested next actions (Plan v3 order, S237 measurements intact)

1. **Bring the user the rulings** — S237 §5's five, plus S238's `g2g-01-05/k3` collapsed
   distractor and the dd-02-01 dots-vs-X glyph question. Cheap to ask, all blocking content.
2. The collision long tail: "18 smaller engines (80 pairs)" — UNNAMED in the S237 measurement,
   and the measuring sweep was never committed. Re-measure first: build a corpus-wide sweep from
   the gate's patterns (unitChain: reachable states · DCL/samplingBias/pointSet/signChart:
   spec × tone · slopeTriangle: targeted state grid + callout layout), enumerate the 18, then
   fix by count. Also `figures.tsx` (4,953 text nodes) remains deliberately unmeasured.
3. `NumericW` prompt-as-accessible-name — deferred mechanically-heavy rename, reasons in the
   execution report batch-3 section.
4. When a parallel wave launches, build the §4.2 precache first (`/.cowork-cache/`), not before.

Environment traps (S237 §6) all still apply: kill `next start` by pid before rebuilding; never
`pkill -f "next start"`; 2 vitest shards max; Trap K restores the queue CSV on every full run —
`git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv S237_SCREENSHOTS WAVE04_SCREENSHOTS` before
committing (playwright full runs rewrite sealed capture sets).
