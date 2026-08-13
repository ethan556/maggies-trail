# HANDOVER — Cowork S240 → next session

Written at the end of S240 (2026-08-13), original wave: **the last 5 NOT-POSSIBLE rows close.**
**Updated same day, in place, multiple times, as further S240 commits landed post-write** (§0/§1/
§3.2/§3.1/§4 below reflect the true HEAD, not any mid-session snapshot — see §2.5, §2.6, and the
addenda in `PREMIUM_REBUILD_S240_EXECUTION.md` for what each commit did). Supersedes
`HANDOVER_COWORK_S239.md` §3 (that queue item is done); that file and `HANDOVER_COWORK_S238.md`
stay correct on everything else — §5/§6 environment traps and commit conventions there still apply
verbatim, as do S237-D-2's §6/§7.

**On user rulings vs. autonomous engineering calls, stated plainly because this file blurred the
line once already this session (§4's g5u-03-02 paragraph briefly overstated a ruling that hadn't
happened yet, caught and fixed before it shipped):** the three held-back widget conversions
(§2.5), the g5f-02-02/g5f-02-03 fraction-vs-decimal fix (§4), and g5u-03-02's closure (§4) were
all explicit user rulings via `AskUserQuestion`, on specific frozen-content questions. The hero
stage tier promotions (§2.6) are different in kind: the user's instruction was the priority order
itself ("1->2->3" — cosmetic inversions, then hero tier pixel QA, then scope Plan v3), not a
per-engine ruling. Which 7 of the ~66 "wide" engines qualified was an autonomous, evidence-driven
engineering decision made under `stageWidth.ts`'s own PRE-EXISTING standing rule ("evidence-driven,
not by guess") — the same category of autonomous call as fixing a label collision found by
`COLLISION_SWEEP=1`, not the same category as changing frozen lesson prose. Commit `cd613bf`'s
message says "(user ruling 2026-08-13)" in its title, matching this session's other commit-title
convention — that phrasing is imprecise for this one; the ruling was the priority order, not the
per-engine promotions. Recorded here rather than silently left, per this file's own standing
practice of correcting a claim before it gets carried forward as fact.

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

**HEAD at end of S240: `cd613bf`** — nine commits on `80a5c1c` (S239's final commit), in order:
`c058a2b` (the 5 NOT-POSSIBLE rows + two engines), `d31ea6a` (grade-vocabulary re-audit, no code
change), `3324778` (the near-duplication gate + `dc-02-01/ch1` fix), `c88d91b` (the three
held-back rows converted per the user's ruling — §2.5 below), `7fb4c4f` (docs-only: this file
brought up to date after the first four commits), `19577e5` (the g5f-02-02/g5f-02-03
fraction/decimal format fix — §4 below), `23fde97` (docs-only: g5u-03-02's closure corrected to
reflect the user's actual confirmation, not an assumed one), `cd613bf` (the hero stage tier's
first pass, 7 engines promoted, 2 pre-existing label defects fixed — §2.6 below), and this
docs-only commit.
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

**This is the `cd613bf` baseline (all nine S240 commits included), re-run in full. The counts below
are unchanged from the earlier `c88d91b` baseline this section previously documented — the g5f fix
(`19577e5`) and the hero-tier wave (`cd613bf`) didn't move validate:content/lint:pedagogy/
content-change-proof at all, and vitest's total is an exact match — so this table now speaks for
all of `c88d91b`..`cd613bf`, not just the commit named below:**

```
typecheck                clean
vitest (2 shards)        13,385 tests / 354 files — 13,383 passed, 2 pre-existing skips, 0 real
                         failures (both shards EXIT:0). Run ALONE this time (not concurrent with
                         validate:content/lint:pedagogy) specifically to avoid the contention
                         pattern this session hit twice before (figures.test.ts, then
                         variants.surface.test.ts/variants.test.ts) — came back clean with zero
                         spurious timeouts, which is itself a useful data point: run vitest
                         without other heavy gates racing it on this sandbox's 2 CPUs when you can
                         afford the wall-clock, rather than parallelizing and re-diagnosing after.
playwright               STILL not re-run since c88d91b — same real gap, not an oversight. Nothing
                         in the g5f fix or the hero-tier wave touches routes this suite exercises
                         differently than validate:content/lint:pedagogy/vitest already cover, but
                         the 132/132 figure from early S240 remains unconfirmed. Re-run it fresh
                         before trusting it.
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     874 / 874        unchanged since c88d91b — the g5f fix appended reason
                         clauses to existing AUTHORIZED keys (no new key); the hero-tier wave
                         touched src/ only, no lesson content at all
validate:native          2 findings, both expected archive-only (node_modules, .next)
check-registration       consistent
build                    EXIT:0            check the EXIT CODE, never grep for "error"
gen:reports              STILL not re-run this baseline — same reasoning as before, nothing this
                         session's later commits touch that gen:reports audits beyond what the
                         gates above already re-confirm. Next session should run it fresh regardless.
COLLISION_SWEEP=1        re-run fresh after the hero-tier wave's two label-position fixes:
                         0 collisions, 11,957 specs, 0 renders failed, corpus-wide — confirms
                         neither fix introduced a new collision anywhere in the 1,701-lesson corpus.
FIGURE_SWEEP=1           NOT re-run this baseline — no figure-rendering code touched since the
                         last EMPTY result
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

## 2.6. What S240 closed, item 2 of the user's "1->2->3" order: hero stage tier, first pass (`cd613bf`)

`stageWidth.ts`'s `hero` tier (1100–1280px) has existed since early Plan v3 work but had never
been assigned to any widget — the code's own comment required real pixel-QA evidence per engine,
not a guess, and S239 §2's WS-D finding (some labs measured OVERSIZED, not undersized, the first
time anyone actually looked) was the standing reason nobody had done that measurement yet. See
this file's top for the note on what kind of decision this was (autonomous, evidence-driven — not
a per-engine user ruling).

**Scoping.** Three parallel research passes read every "wide"-tier engine's component source in
`widgets.tsx` (18,765 lines, one file) for two facts: genuine multi-representation (a synced
diagram PLUS a separate live equation/numeric readout — the qualifying bar per `stageWidth.ts`'s
own comment) and whether the engine's own SVG sizing is already capped by an inner `max-w-*` well
under 1024px (in which case promoting the *stage* tier does nothing — a different, out-of-scope
problem). Most genuinely multi-rep engines — `derivativeTrace`, `matrixTransform`,
`unitCircleExplore`, the whole algebra/precalc "explore" family — self-cap there and were excluded
from this pass on that basis. 8 cleared both bars.

**Real 1440px pointer QA, before vs. after, at the actually-promoted width — not simulated.**
Captured each of the 8 at the current `wide` tier, temporarily reassigned all 8 to `hero` in
`stageWidth.ts`, rebuilt, re-captured the identical steps at the real, live `hero` tier.
Screenshots: `S240_SCREENSHOTS/14`–`23`.

- **7 promoted:** `trialProbabilityLab`, `samplingBiasLab`, `percentChangeLab`,
  `conditionalTableLab`, `derivativeRuleLab` (product mode directly tested), `covariationScrubber`,
  `affineRelationshipLab`. All scaled cleanly — content genuinely used the added room rather than
  just adding empty margin.
- **1 rejected, reverted to `wide`:** `relatedRatesLab`. Its sliding-ladder diagram is a naturally
  tall/narrow construction; hero width added empty margin to the right of it, not more diagram —
  no evidence of benefit. Reasoning recorded inline in `stageWidth.ts` so it isn't re-litigated
  from nothing next time someone eyes this engine for hero.

**Two real, pre-existing label defects found by this pass, unrelated to the tier itself — both
reproduced at BOTH wide and hero width, fixed:**

1. `trialProbabilityLab`'s `"whole = N"` axis label overflowed its own SVG viewBox on the right
   edge whenever `spec.total === axisMax` (the common case) — a center-anchor sitting at the
   axis's own rightmost tick, not a container-sizing issue. `textAnchor="middle"` → `"end"`.
2. `affineRelationshipLab`'s `"Function A"`/`"Function B"` end-of-line legend labels rendered
   touching — S237b's existing same-clamped-y fix used a 16-unit gap that a real browser proved
   too tight for bold proportional text (the box model that gap was derived from, `textBoxes.
   testkit.ts`, explicitly warns it under-estimates wide proportional words, and this instance
   cleared the model's own math by under a unit — which is also why the corpus-wide
   `COLLISION_SWEEP=1` sweep, 0 hits across 11,957 specs, never caught it). Gap 16 → 20.

Both fixes are display-only — no grading/answer/`evaluate()` logic touched. Full reasoning, the
seeding/prediction-gate debugging (see this file's §5 for the general lesson), and complete gate
results are in `PREMIUM_REBUILD_S240_EXECUTION.md`'s new addendum. Gate results here in brief:
`tsc` clean; vitest 354 files/13,385 tests, 13,383 passed/2 pre-existing skips/0 failures, exact
match to this session's baseline; `validate:content` 1840/1840; `lint:pedagogy` 1711/1711;
`validate:native` 2 expected archive-only findings; `check:registration` consistent;
`content-change-proof` 874/874 unchanged (this wave is `src/` code only, no lesson content
touched); `build` EXIT:0; `COLLISION_SWEEP=1` 0 collisions/11,957 specs/0 renders failed, both
before and after the two fixes.

**What's still open for a future hero-tier pass:** the self-capped multi-rep engines excluded from
this pass by scoping (`derivativeTrace`, `accumulateArea`, `sliceSum`, `binomialAreaLab`,
`matrixTransform`, `quadraticExplore`, `unitCircleExplore`, `systemsExplore`, and others) are
real candidates IF their own inner Tailwind cap is widened alongside a tier promotion — that's a
more invasive, per-engine change than this pass made and needs its own evidence-driven look, not
an assumption that "promote + widen" is automatically safe. Also open: any engine newly converted
under WS-C/WS-B since this pass that might now qualify.

---

## 3. The queue — where to pick up

**The NOT-POSSIBLE queue that ran S237→S240 is fully closed.** There is no standing "next 5" —
the next session needs a fresh instruction from the user on where Plan v3 work resumes. Candidates,
unranked, all still open exactly as S239 left them:

### 3.1 Also open, per Plan v3 (mostly unchanged from S239)

WS-A brand productionization, WS-H landing rebuild, WS-J avatars (concept boards only — Plan v3
Part 0 hard rules) · WS-E prediction purge · WS-G MCQ factory · WS-F sound/voice · §4.2 precache
only when a parallel wave launches.

**Hero tier had its first pass this session — §2.6 above, not "still open" in the S239 sense
anymore.** 7 engines are now promoted with real pixel-QA evidence; the rule itself is unchanged
(any future promotion still needs the same evidence, not an assumption) and there's a real
follow-on list of self-capped candidates noted at the end of §2.6, but this is no longer an
un-started item.

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
- **`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (Trap K's queue half) regenerated mid-gate-sequence FOUR
  separate times this session** (a fourth, during the hero-tier wave's build), always collapsing
  from its committed 11,488-line form to a 1,078-row consolidated form matching
  `CLOSURE_LEDGER.md`'s "1,078 open rows" claim. The trigger is effectively confirmed at this
  point: every time, the CSV was untouched right up until `npm run build` ran, and changed
  immediately after — no other gate in the sequence (typecheck, vitest, validate:content,
  lint:pedagogy, validate:native, check:registration) ever produced this side effect on its own
  across many runs this session. Something in `next build`'s static generation (most plausibly a
  page that server-renders a workload/admin view and imports the consolidation logic as a side
  effect of prerendering it) regenerates the file. `git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv`
  restores it, as Trap K prescribes — but budget for doing this **after every `npm run build` in
  the session**, not once: check `git status` immediately after each build, not just before the
  final commit.
- **Seeding a `LessonSnapshot` via `localStorage` to jump to a target step silently no-ops if
  `i` (the target index) is `0`.** `src/lib/lessonState.ts`'s `restoreQueue()` treats `i <= 0` as
  "nothing worth resuming" and discards the snapshot, loading the lesson fresh from its real step
  0 instead — no error, no console warning, just a normal-looking page that happens to be the
  wrong step. Symptom: every screenshot in a batch comes back showing the SAME kind of content
  (the lesson's actual first step) regardless of which lesson/widget was targeted — that
  uniformity across otherwise-independent targets is the tell that it's one systematic seeding
  bug, not several unrelated per-widget issues. Fix: `stepIds` must be the lesson's FULL, real
  step-id sequence (every id must resolve via `stepIndex(lesson)` — base steps AND remedial
  concept/check pairs — or the whole snapshot is rejected too), and `i` must be that target step's
  actual index within it (≥ 1), not a 0-based index into a hand-picked subset array.
- **A "make a prediction first" gate (S200-era) hides a step's manipulative behind a commit
  click.** A screenshot taken right after navigation, with no interaction, may capture the
  prediction card instead of the widget it's gating — the card looks complete on its own (prompt,
  three options, a dismissible note), so this doesn't look like a broken capture unless you
  already know the widget should be there. Dismiss it the same way `LessonPlayer.play.test.tsx`'s
  own `commitPrediction()` helper does: click the first `role="radio"` option, wait briefly, then
  capture.
- **A stale `next start` from earlier in the same session can survive across shell calls and keep
  answering `curl` while `pgrep -af`/`ss -ltnp` intermittently fail to surface it** (the multi-line
  self-match hazard above muddied one `pgrep` check; a plain `ss -ltnp | grep <port>` missed the
  listener once too, for reasons not fully pinned down). `fuser <port>/tcp` reliably found the
  owning PID every time this session; `fuser -k <port>/tcp` is the clean kill. When the question
  is "is anything bound to this port" rather than "is a process matching this text running,"
  reach for the port-based check first — process-name pattern matching and port-binding checks
  aren't always equally reliable for the same question, on this sandbox at least.

---

## 6. Commit conventions

Unchanged (S238 §6, restated by S239 §5): both trailers, exact gate results in the body, red
gates stated plainly. Trap K restoration (queue CSV + sealed screenshot sets) done before this
wave's commit, as it must be before every commit.
