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
vitest (2 shards)        13,172 passing       (9,665 + 3,507; +2 opt-in sweep skips)
playwright               132 / 132            ALL 5 projects (not just chromium) vs next start
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     870 / 870            <- was 866; vm-02-01, mc-05-02, dd-02-01,
                                                 md-03-04 are the S238 entries
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
NAMED engine rows from S237 §3.1 are closed. **Batch 7:** the tail RE-MEASURED with a committed
opt-in sweep (COLLISION_SWEEP=1 …collisionSweep.s238.test.tsx → COWORK_CACHE/
label-collision-remainder-s238.csv), then its two largest engines closed: triangleSolve (21→0,
both renderer modes) and doubleNumberLine (15→0). **Batch 8:** the ENTIRE remaining tail (16
engines, 68 pairs) → 0 via one shared dodge mechanism (`s238Seat` in widgets.tsx), gated by an
always-on 198-spec batch sweep in widgets.labelCollision.s237.test.tsx. **The S237 collision
ledger closes: 267 → 0.** The opt-in sweep now reports an empty table; re-run it after ANY
widget-label change. The parity ratchet caught one regression en route (absValueLine's aria
range vs a suppressed edge label — fixed in the engine, baseline untouched). **Wave 9:** the
user's four rulings landed — two graded-wrong prose fixes, the dot glyph, the mixed-number
axis — closing the plotData family at 19 of 20 (dd-02-01/k2 excluded by leakage policy, a
decision not a debt). Next queue, user-ordered: figures.tsx ledger → NumericW rename → WS-C →
the 8 NOT-POSSIBLE engines. Details and rationale: `PREMIUM_REBUILD_S238_EXECUTION.md`.

**New defect for a ruling (found by reading, NOT fixed — frozen prose):** `g2g-01-05/k3`'s
count-vs-value distractor collapses onto the key: stacks 2,6,3,1 over 5,6,7,8 make mode = count
= 6, so bare "6 inches" (graded wrong) sits beside "6 inches — its stack is tallest" (graded
right). A learner reading the plot correctly can be marked wrong. No gate compares option labels
for near-duplication — same class as the S237 `dc-02-01/ch1` duplicate-trap-value finding.

**Do not assign hero-tier engines by guess.** The tier exists; engines join it with their WS-C
conversion after 1440px pixel QA. The six graph labs' SVGs are square viewBoxes — width is
height; their real growth is WS-C side panels, not a bigger square.

## 3. Suggested next actions (Plan v3 order, S237 measurements intact)

1. ~~Bring the user the rulings~~ RULED AND LANDED (wave 9, 2026-08-12): graded-wrong fixes
   only (g2g-01-05/k3 count reorder, mc-05-02/k2 mark reorder — both proof-ledgered); dot-glyph
   mode (dd-02-01/i1 wired; k2 stays leakage-excluded); mixed-number formatter mode (md-03-04's
   three wired; the line-plot generator now prints "2½", never "2.5"). **The plotData family is
   CLOSED at 19 of 20** — the 20th is a decision, not a debt. The cosmetic fraction/decimal
   inversions (S237 §5 item 3) stay logged, untouched by ruling; the 8 NOT-POSSIBLE rows
   (item 4) are queued as an engine project. Proof count is now 870/870.
2. ~~The collision tail~~ CLOSED in batch 8 — the sweep reports zero pairs corpus-wide.
   Re-run COLLISION_SWEEP=1 after any widget-label change to keep the table empty.
   **Wave 10 then OPENED the figures.tsx ledger**: all 1,871 registered figures measured
   (FIGURE_SWEEP=1 …figuresCollision.s238.test.tsx → COWORK_CACHE/
   figure-collision-remainder-s238.csv, usage-weighted), the seventy-eight worst by exposure
   closed across waves 10–13 (352 → 137 pairs; the IntLine and Pv3NumLine shared-helper fixes
   each closed whole figure families), and the 120-figure remainder FROZEN by an always-on
   ratchet
   (figures.labelCollision.s238.test.tsx): unlisted figures must be clean, listed ones may
   only improve, fixed ones must leave the baseline. Continue down the CSV by pairs × uses;
   respect the 10-unit font floor (figures.test.ts) when re-laying labels — it caught one
   of wave 10's own first drafts.
3. `NumericW` prompt-as-accessible-name — deferred mechanically-heavy rename, reasons in the
   execution report batch-3 section.
4. When a parallel wave launches, build the §4.2 precache first (`/.cowork-cache/`), not before.

Environment traps (S237 §6) all still apply: kill `next start` by pid before rebuilding; never
`pkill -f "next start"`; 2 vitest shards max; Trap K restores the queue CSV on every full run —
`git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv S237_SCREENSHOTS WAVE04_SCREENSHOTS` before
committing (playwright full runs rewrite sealed capture sets).
