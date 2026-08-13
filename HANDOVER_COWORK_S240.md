# HANDOVER — Cowork S240 → next session

Written at the end of S240 (2026-08-13), original wave: **the last 5 NOT-POSSIBLE rows close.**
**Updated same day, in place, after two further S240 commits landed post-write** (§0/§1/§3.2 below
now reflect the true HEAD, not the mid-session snapshot — see §2.5 and the two new addenda in
`PREMIUM_REBUILD_S240_EXECUTION.md` for what each commit did). Supersedes `HANDOVER_COWORK_S239.md`
§3 (that queue item is done); that file and `HANDOVER_COWORK_S238.md` stay correct on everything
else — §5/§6 environment traps and commit conventions there still apply verbatim, as do
S237-D-2's §6/§7.

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

**HEAD at end of S240: `19577e5`** — six commits on `80a5c1c` (S239's final commit), in order:
`c058a2b` (the 5 NOT-POSSIBLE rows + two engines), `d31ea6a` (grade-vocabulary re-audit, no code
change), `3324778` (the near-duplication gate + `dc-02-01/ch1` fix), `c88d91b` (the three
held-back rows converted per the user's ruling — §2.5 below), `7fb4c4f` (docs-only: this file
brought up to date after the first four commits), `19577e5` (the g5f-02-02/g5f-02-03
fraction/decimal format fix — §4 above).
`git push` is still proxy-blocked; work travels as an **incremental** bundle
(`git bundle create <f> 80a5c1c..HEAD` — a FULL bundle of the whole branch exceeded the delivery
size limit once and had to be redone incremental; don't default to `--all`/full-history unless
asked). Verified via a genuine purge-and-restore isolated-clone test each time, not a plain clone:
a disposable copy (`git clone --no-hardlinks --no-local`, so no shared objects with the working
repo) had its branch reset back to `80a5c1c`, remote stripped, reflog expired
(`--expire=now --all`), `git gc --prune=now --aggressive` — confirmed every newer commit's objects
were physically gone via `git cat-file -e` failing — then `git fetch` from the incremental bundle
ALONE restored the full chain back to true HEAD, confirmed via `git cat-file -e` succeeding and a
`git diff`/`git fsck --full --strict` producing exactly the expected file set with no integrity
errors. **The fetch refspec must name the actual branch** (`cowork/s237:refs/heads/<local-name>`)
— a bundle built from a named branch has no `HEAD` ref; `git fetch <bundle> HEAD:...` fails with
`fatal: couldn't find remote ref HEAD` even though the bundle is completely valid.

Read `PREMIUM_REBUILD_S240_EXECUTION.md` for this wave's full record — every one of the 5
NOT-POSSIBLE rows, the two new engines' design rationale, the gate gaps they caught, the one real
defect (a label collision) found and fixed that session, the near-duplication gate build, and the
three held-back-row conversions with their own defect-found-and-fixed (a second, unrelated label
collision). This file is the map.

---

## 1. Gate results at session end — YOUR BASELINE

**This is the `c88d91b` baseline (all four S240 commits included), re-run in full, not the
mid-session `c058a2b` snapshot the numbers below replace:**

```
typecheck                clean
vitest (2 shards)        13,385 tests / 354 files — 13,383 passed, 2 pre-existing skips, 0 real
                         failures (both shards EXIT:0). Running 2 shards concurrently on this
                         sandbox's 2 CPUs produced 2 spurious timeouts in figures.test.ts under
                         contention; re-ran that file alone afterward and it passed in 2.03s —
                         contention, not a regression. Re-run the isolated file if you see the
                         same pattern rather than assuming a real failure.
playwright               NOT clean at c88d91b — see below, this is a real gap, not an oversight
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     874 / 874        (873 -> 874: cpr-05-03 is a new AUTHORIZED key;
                         pc-03-01 and pv2-04-03 kept their existing keys and gained an appended
                         reason clause)
validate:native          archive-only findings (node_modules, .next, tsconfig.tsbuildinfo — the
                         third one appears because tsc's incremental mode writes it even under
                         --noEmit; `rm -rf test-results tsconfig.tsbuildinfo` before this gate as
                         always, but don't be surprised if it's back)
check-registration       consistent
build                    EXIT:0            check the EXIT CODE, never grep for "error"
gen:reports              NOT re-run this baseline (see below) — last known state still
                         place-value-transform-mutations-s145 M28 (34/35), PRE-EXISTING since
                         S145, unchanged through S238/S239/S240
COLLISION_SWEEP           the vectorExplore fix below is covered by the standing
                         widgets.labelCollision.s237.test.tsx suite (part of the main vitest run,
                         not a separate opt-in sweep for this particular defect) — 32/32 passing,
                         TAIL count for vectorExplore now 11 (was 10)
FIGURE_SWEEP=1           NOT re-run this baseline — no figure-rendering code touched since the
                         last EMPTY result; figures.test.ts's contention timeout above is unrelated
```

**Two honest gaps at this baseline, both explained in §2.5:**

1. **`playwright test` (132 e2e specs) was only partially re-run** (~27/132) chasing this
   baseline, and stopped deliberately: this sandbox's dev server takes 15–60s+ per
   `/learn/[lessonId]` hit even warm (compilation + an apparently-uncached full `getCatalog()`
   scan of 1,701 lesson files), which blew e2e/axe's internal timeouts across many routes that
   have nothing to do with this session's changes (`/`, `/dashboard`, `/courses`, `/daily`, …
   failed the same way). Confirmed by grep: **no e2e spec references** `pc-03-01`, `pv2-04-03`,
   `cpr-05-03`, or their slugs, so this gap doesn't cover the actual change — but it does mean the
   132/132 figure quoted by earlier S240 baselines is NOT re-confirmed here. Re-run it fresh
   before trusting it again; don't carry the old number forward.
2. **`gen:reports` was not re-run this baseline** — it's the slowest gate in the whole sequence
   (chains ~60 audit scripts) and nothing in this wave's diff touches anything it audits beyond
   what `validate:content`/`lint:pedagogy`/`check:registration` already re-confirmed clean. Next
   session should still run it fresh before trusting its number rather than assuming.

Commands, shard discipline, and every environment trap: unchanged from S238's handover §5,
S239's §1, plus §5 below (one more addition, on top of S240's original addition).

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

## 2.5. What S240 closed after this file's original write (two more commits)

**`3324778` — the near-duplication gate, built.** S238 §4 flagged "no gate compares option labels
for near-duplication" as still worth building; this commit built it, and it's narrower than it
sounds. `fractionEntry`/`pointEntry` already had a same-value trap-collision check; `numeric` had
none, and `evaluate.ts`'s numeric branch resolves via `commonErrors.find(e => e.value === v)` —
first match wins — so two `commonErrors` sharing a value silently drop the second diagnosis. Added
that check to `pedagogy.ts`'s numeric lint, plus an `mcq` same-shape check (two options with
identical normalized label text). Swept the full 1,701-lesson corpus: `mcq` found zero hits,
`numeric` found exactly one — the already-known `dc-02-01/ch1` double-36 defect carried frozen
since S238 §4. Fixed it rather than ship the gate red: `4·π·r²=36` and `(4/3)·π·r³` read without
its `π` also `=36` at `r=3` is a genuine numeric coincidence, not author error, so the two traps'
diagnoses were merged into one that names both slips instead of silently keeping only the first.
Answer/tolerance/grading untouched — explanation text only.
S238 §4 defect 1's class (near-duplicate-but-*distinct* text, `g2g-01-05/k3`) is intentionally
**not** covered — that needs semantic judgment a mechanical check would false-positive trying to
make.

**`c88d91b` — the three held-back rows converted, per the user's ruling (this file's old §3.2).**
Four rows had sat as "needs a human ruling, not an agent" since S238: converting an `mcq`
identification step to a manipulative execution widget changes what's graded. The user's answer
via `AskUserQuestion`: keep `pv-03-03/k1` as identification (no change, still open by design, not
an oversight); convert the other three.

- `pv2-04-03/k3`: `mcq` → `columnCalc` (8003 − 3457), reusing the existing
  `g4-place-million`/`pvAcrossZerosColumn` generator. Verified the reachable-wrong-value set
  directly from `columnCalcReachable`/`columnCalcTruth` rather than by hand — **{4546, 4554, 4654,
  5454}**, three wrong values, not the two a first hand-derivation suggested.
- `pc-03-01/k2`: `mcq` → `vectorExplore` (add mode: steer `v` so `⟨1,0⟩+v` lands on the origin —
  the acceleration at `t=0`). No compatible `vectorExplore`-shaped variant form exists for
  `pc-vector-motion`, so `variant` was **removed**, not left mismatched.
- `cpr-05-03/k2`: `mcq` → `probabilityArea` (shade 60/336 ordered all-red arrangements — the
  permutation-consistent equivalent of the lesson's own `P(all red)=10/56`). Same reasoning:
  `variant` removed, no compatible form exists for `count-prob`/`ratioMismatch`.

**A second real label-collision defect, found and fixed before it shipped — same class as
`percentBar`'s in §2, different engine.** `vectorExplore`'s initial `vxStart=0, vyStart=0` put the
"v here" reveal ghost and the "u + v" sum label on the same horizontal seat band; neither
`VectorExploreW`'s `s238Seat()` call treats the other's label as an obstacle (a structural gap in
the shared collision-avoidance code, not touched here), so `widgets.labelCollision.s237.test.tsx`'s
S238-batch-8 sweep caught it at info tone. Fixed as content, not engine code: `vyStart=1` clears
the band; `vxStart`/`vyStart` is only ever the drag's starting point and never enters `evaluate()`'s
grading, so the required `v = target − u` is unaffected. `TAIL`'s `vectorExplore` count updated
10→11 in the same test file (an authored-spec-count bump, not a weakened gate).

Real-browser QA for all three conversions used a **local Playwright script run via `node`/bash**,
not Claude-in-Chrome: the `mcp__claude-in-chrome__*` tools could not reach this session's own dev
server (`SecurityError`/`Frame ... showing error page` against `127.0.0.1:3100`, even though
`curl` from bash confirmed the server was live) — they appear to run outside this session's own
network namespace. A same-container Playwright script using the pre-installed Chromium
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) worked; seed the target step via
`localStorage`'s `numera:lesson:v1:c1:<lessonId>` key (same shape `playerStore.ts`'s `load()`
reads) to jump straight to it without clicking through prior steps. **If a future session needs
in-container browser screenshots, start with the local-Playwright approach, not Claude-in-Chrome —
this was confirmed a dead end, not a one-off flake, across ~5 identical retries.**

Full gate results for `c88d91b` are §1 above (this file's baseline was rewritten in place to match
it). Full detail on both commits — the exact gate catches, the collision-fix method, the
reachable-set correction — is in `PREMIUM_REBUILD_S240_EXECUTION.md`'s two new addenda.

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

### 3.2 The four held-back rows — ruled on and closed (was open through S238/S239/early S240)

`pv-03-03/k1` (kept as `mcq` identification — user's explicit choice, not an oversight),
`pv2-04-03/k3`, `pc-03-01/k2`, `cpr-05-03/k2` (all three converted to execution widgets) — see
§2.5 above for what shipped in `c88d91b`. **Nothing left open in this item.**

---

## 4. Content defects FOUND but NOT FIXED (frozen prose — need a user ruling)

Everything in S238's §4 and S239's §4 stands except: markdown-bold and elapsedTime exposure
(closed by editing, §2 above); grade-vocabulary CSV (closed by re-audit, below); the
`dc-02-01/ch1` double-36 trap (closed by editing, §2.5 above — the near-duplication gate's one
corpus hit); and cosmetic inversions (closed — one instance by re-audit, one by editing, both
below). **Nothing remains open in this section.**

**Cosmetic inversions — the old note described one class of defect; investigation found two
different things, closed differently.** S237-D's note read "two cosmetic inversions where the
decimal leads and the fraction follows" (`g5u-03-02.json:38`, distractor labels in
`g5f-02-02`/`g5f-02-03`). Neither instance actually matches that description on inspection:

- `g5u-03-02.json:38` ("About 0.83 — the exact answer is 5/6...") is an `estimateSlider`
  success-feedback string. Swept every such string in the corpus with a fraction in it —
  `g5u-03-01`, `g5u-03-04`, `g4x-03-04`, and others all use the identical "About [estimate] —
  the exact value is [fraction]" shape. This is the universal convention for this widget type
  (which is, by design, a decimal-estimate control), not an inversion of anything. **Dropped
  from the list, no edit.** The user's first answer was "investigate further first," not an
  approval to close — the deeper look (the estimateSlider sweep above, plus checking whether a
  different corpus-wide convention existed that this should have matched instead — it doesn't;
  the one relevant precedent, `pr-01-01`/`pr-01-03`'s decimal-axis fix in `CONVERSION_LOG.md`'s
  S119 entry, is about a fraction-lattice AXIS LABEL rendering as an accidental decimal, a
  rendering bug — structurally different from an estimation widget correctly reporting a decimal
  estimate, its designed function) was taken back to the user with the concrete text side by side
  (`g5u-03-02` vs. `g4x-03-04`), and the user confirmed closure with no edit on 2026-08-13.
- `g5f-02-02`/`g5f-02-03` (commit `19577e5`) had a REAL, different inconsistency: one shared
  `mcq`, reused across 4 step instances (`g5f-02-02/k2`; `g5f-02-03/k1`, `ch1`, and its
  remedial), had two structurally parallel wrong options format the same value differently —
  "giving 3/4" vs. "giving 0.75". Corpus-swept the whole defect class (mcq options mixing a
  fraction and a decimal) before treating it as isolated: 7 total hits, 4 of which are
  legitimate (`tf-01-03`, `sr-05-01`, `ns-05-03` — genuinely different candidate values, or the
  fraction-vs-decimal comparison IS the question). Only this one was a real mismatch. **Fixed**:
  "giving 0.75" → "giving 3/4" in all 4 JSON instances plus the original scaffolding script
  (`scripts/session/build-fraction-division-g5.mjs`, which still had the stale text — left
  alone it would have silently regenerated the old wording on any future re-run). User's
  direction: match the fraction, not the decimal — consistent with the `pr-01-01`/`pr-01-03`
  precedent that a decimal "sidesteps the subject" in a fraction-focused lesson.

**Grade-vocabulary CSV — drop this from the list. Re-audited post-commit, already resolved.** It
had been carried forward as "the highest harm-per-effort item" since S238 with no session actually
re-checking it against live content. A full re-check this session (exact-text match, then a
per-step search including `remedials`, then manual reads spanning all 6 flagged terms — see
`PREMIUM_REBUILD_S240_EXECUTION.md`'s addendum for the method and confirmed before/after examples)
found all 60 originally-flagged surfaces already reworded to plain K–4 language, done by some
other session at an unknown point after S237. The only remaining trace of a flagged term
(`invariant`, in `la-02-02`/`la-03-02`) is inside internal `cml` authoring metadata, never
rendered to a learner — both steps' actual learner-facing text is already fixed too. The CSV
itself is left in place as a historical artifact; treat it as stale, not as a live worklist.

**Take-away for next session: don't restate a carried-forward "still open" item without
re-checking it first** — this one sat unverified through three handovers.

~~No gate compares option labels for near-duplication (S238 §4's class) — still worth
building.~~ **Built in `3324778` — see §2.5.** `mcq`/`numeric` are covered; near-duplicate-but-
*distinct* text (`g2g-01-05/k3`, S238 §4 defect 1's class) is intentionally still uncovered —
that needs semantic judgment, not a mechanical check.

---

## 5. Environment traps — S238 §5 plus two additions

S238's full list (git push proxy-blocked, `pkill -f "next start"` self-kill hazard, stale `.next`
after rebuild, Trap K sealed-screenshot restoration, 2-shard vitest max, `rm -rf test-results
tsconfig.tsbuildinfo` before `validate:native`, Python patch script all-or-nothing writes, `cd`
discipline) all held this session exactly as documented. One more, hit fresh mid-S240:

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

One more, hit fresh in the `c88d91b` wave:

- **Claude-in-Chrome cannot reach this session's own dev server.** `mcp__claude-in-chrome__*`
  navigate/screenshot/javascript_tool calls against `127.0.0.1:3100` fail
  (`SecurityError: ... Access is denied`, `Frame with ID 0 is showing error page`) even while
  `curl` from bash confirms the server is live and responding — it appears to run in a separate
  network namespace from this session's own sandbox. Confirmed a dead end across ~5 identical
  retries, not a flake. Use a **local Playwright script run via `node`/bash** instead (Chromium is
  pre-installed at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`); seed
  `localStorage["numera:lesson:v1:c1:<lessonId>"]` with a `LessonSnapshot` (`{v:1, lessonId,
  stepIds, i:<targetIndex>, sessionXp:0, history:[], injected:[], savedAt}`) before the second
  navigation to jump straight to a target step. `npm run build`/`next start` requests are slow
  here (15–60s+, see §1) — give the script a genuinely generous timeout (120s used this wave, not
  the 5s+ default many tools assume) and run it via `nohup ... & disown` + poll, not inline,
  since it will exceed a 2-minute tool-call default.
- **`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (Trap K's queue half) regenerated mid-gate-sequence
  THREE separate times this session**, always collapsing from its committed 11,488-line form to a
  1,078-row consolidated form matching `CLOSURE_LEDGER.md`'s "1,078 open rows" claim. The trigger
  is now effectively confirmed, not just circumstantial: all three times, the CSV was untouched
  right up until `npm run build` ran, and changed immediately after — no other gate in the
  sequence (typecheck, vitest, validate:content, lint:pedagogy, validate:native,
  check:registration) ever produced this side effect on its own across many runs this session.
  Something in `next build`'s static generation (most plausibly a page that server-renders a
  workload/admin view and imports the consolidation logic as a side effect of prerendering it)
  regenerates the file. `git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv` restores it, as
  Trap K prescribes — but budget for doing this **after every `npm run build` in the session**,
  not once: check `git status` immediately after each build, not just before the final commit.

---

## 6. Commit conventions

Unchanged (S238 §6, restated by S239 §5): both trailers, exact gate results in the body, red
gates stated plainly. Trap K restoration (queue CSV + sealed screenshot sets) done before this
wave's commit, as it must be before every commit.
