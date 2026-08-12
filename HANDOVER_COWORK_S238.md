# HANDOVER — Cowork S238 → next session

Rewritten at the end of S238 (2026-08-12) after 18 waves. Supersedes the incremental version.
Successor to `HANDOVER_COWORK_S237_SESSION_D_2.md`, which remains correct on §6 (environment
traps) and §7 (reading catches) — re-read those there.

**`OPTIMIZATION_PLAN_V3.md` is the canonical program document** (user directive, 2026-08-12);
`PREMIUM_EXPERIENCE_CONTRACT.md` is its checkable core. Where any older program doc disagrees
with Plan v3, Plan v3 wins. Handover instruction files are guidance only.

---

## 0. Bootstrap

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail && git checkout cowork/s237
git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming
git merge-base --is-ancestor 4b66fe1 HEAD; echo "ancestry:$?"    # MUST be 0
npm ci
```

**HEAD at end of S238: `6db70d2` (wave 18).** The remote is at `ac54811`; S238's 31 commits
were delivered as git bundles because **`git push` is blocked by this environment's proxy** —
that is an environment limit, not a repo problem. Every wave shipped
`git bundle create <file> ac54811..HEAD`; the last one (`s238wave18.bundle`) contains all 31.
Apply with `git fetch <bundle> HEAD:refs/heads/incoming && git merge --ff-only incoming`.

Read `PREMIUM_REBUILD_S238_EXECUTION.md` for what each wave landed and why — it is the
detailed record; this file is the map.

---

## 1. Gate results at session end — YOUR BASELINE

Run all of these every wave. These numbers are the bar; a lower number is a regression.

```
typecheck                clean
vitest (2 shards)        13,246 passing    (9,698 + 3,548; +2 opt-in sweep skips)
playwright               132 / 132         ALL 5 projects, vs `next start -p 3100`
validate:content         1840 / 1840
lint:pedagogy            1711 / 1711
content-change proof     871 / 871         scripts/session/content-change-proof-s151c.mjs
validate:native          archive-only findings (node_modules, .next) — anything else is real
check-registration       consistent
build                    EXIT:0            check the EXIT CODE, never grep for "error"
gen:reports              head green; exits 1 at place-value-transform-mutations-s145 M28
                         (34/35) — PRE-EXISTING at 39bf84c, not S238 damage
```

Exact commands that matter:

```bash
npx vitest run --shard=1/2 --reporter=dot > /tmp/s1.log 2>&1; echo "EXIT:$?"   # 2 shards MAX
npx vitest run --shard=2/2 --reporter=dot > /tmp/s2.log 2>&1; echo "EXIT:$?"
rm -rf test-results tsconfig.tsbuildinfo && npm run validate:native
PW_BASE_URL=http://localhost:3100 \
PW_CHROMIUM_EXE=$(ls -d /opt/pw-browsers/chromium*/chrome-linux/chrome | head -1) \
npx playwright test                                    # all 5 projects, not just chromium
```

**Two opt-in sweeps, not part of the default run — run the matching one after any change:**

```bash
COLLISION_SWEEP=1 npx vitest run src/components/collisionSweep.s238.test.tsx   # widgets
FIGURE_SWEEP=1   npx vitest run src/components/figuresCollision.s238.test.tsx  # figures (~8s)
```

Both tables are currently **EMPTY**. Keep them empty. The widget sweep covers 11,950 authored
specs × tones; the figure sweep covers all 1,871 registered figures and writes a usage-weighted
CSV to `COWORK_CACHE/`.

---

## 2. What S238 finished — the closed ledgers

Do not re-open these; verify them and move on.

| Area | State |
|---|---|
| **Widget label collisions** | 267 → **0**, corpus-proven. Always-on gate: `widgets.labelCollision.s237.test.tsx` (198-spec batch sweep). |
| **figures.tsx label collisions** | 352 → **0** across all 1,871 figures. Always-on RATCHET: `figures.labelCollision.s238.test.tsx` — **empty baseline**, every figure must render zero pairs, both fix cohorts (78 + 120) pinned by name. |
| **plotData family** | CLOSED at 19 of 20. The 20th (dd-02-01/k2) is excluded by mcq leakage policy — a decision, not a debt. |
| **Prompt-as-accessible-name (class B)** | CLOSED. estimateSlider (S237), SliderW and NumericW (S238). House pattern: a visible `<label>` WRAPS the control and states what it sets/takes. mcq's radiogroup prompt-name is correct ARIA and stays. |
| **WS-D §1 stage roles** | Shipped with pixel evidence in `S238_SCREENSHOTS/`. |

**Standing rules learned here, worth keeping:**

- **Never weaken a gate to make it pass.** Two S238 gate corrections were made STRICTER and said
  so in the log: the numeric-preview additive guard had literally pinned the prompt-as-name
  defect; the alongside gate gained a documented structural exemption modelled on an existing
  precedent. Neither was relaxed.
- **The 10-unit font floor** (`figures.test.ts`) is real; it rejected fs-9 reworks twice.
- **Reading catches what gates cannot.** Wave 14 found a figure whose bars had rendered BLACK
  since authoring (`fill="{SKY}"` — literal braces, an invalid color no test models). Screenshot
  every restructured figure and actually look at it.

---

## 3. The queue — where to pick up

The user's approved order was: figures ledger → NumericW rename → WS-C → the 8 NOT-POSSIBLE
rows. The first two are done; the last two are live work.

### 3.1 WS-C direct manipulation (Plan v3's biggest single win) — IN PROGRESS

**19 engines** now share the `useSvgDrag` substrate (`src/components/useSvgDrag.ts`). The rule
that makes this safe: **a drag handle is always REDUNDANT** — every converted engine keeps its
slider/buttons as the keyboard-parity path, so grading, tone grammar, process evidence and the
a11y panel are untouched by construction.

Landed: numberLinePlace, unitCircleExplore, derivativeTrace, secantSlope, scatterFit,
vectorExplore, transformExplore, quadDrag, argandExplore, systemsExplore, lineExplore,
angleMeasure, triangleAngleLab, polarTrace (pre-S238) + **wave 16**: fractionBar, barBuilder,
clockSet, hundredthsGrid + **wave 17**: expLogExplore, signChart probe, probabilityArea,
compassConstruct, triangleConstraintLab.

**Method that worked — copy it:** inventory range-input engines against corpus usage FIRST
(the biggest range-carrier, exactNumberLab at 358 uses, already had a drag rail — guessing
would have wasted a wave), then ask *what is the learner's object?* and make THAT the thing
that drags. Sliders survive where the quantity is genuinely scalar (a fraction's denominator,
a sample size) — that is Plan v3's own rule, not a shortcut.

**Remaining frontier by exposure:** algebraTiles (17 uses, three ranges — a tile-count layout
problem, not a single-value drag), solidSliceLab (7), spinnerSim (6), shapeFamilyBuilder (6,
four attribute counts — likely slider-survival), riemannSum (4), then a 1–5-use tail.

**Gate:** `src/components/widgets.drag.test.tsx` (61 cases). It pins VALUES, not just presence
— which is how it caught a missing `svg ref` that would have shipped a live-looking but dead
drag surface. Add cases in the same shape for every conversion.

### 3.2 The 8 NOT-POSSIBLE rows — 3 CLOSED, 5 REMAIN

These are requests for engine capability that did not exist (`COWORK_CACHE/
needs-manipulative-s237.csv`, `resolution` column). Wave 18 built two capabilities and served
three rows under the standing **alongside ruling**: a new `kind:"interactive"` step inserted
IMMEDIATELY BEFORE the graded check, which stays byte-identical.

Closed: dc-02-01/k3 + /ch1 (relatedRatesLab `model: "circleArea" | "sphereVolume"`, exact
π-multiple readouts, chain rule instantiated in the rate readout, WS-C edge-drag);
ft-03-02/k3 (quadraticExplore `aDen` — every `a` field a numerator over a fixed denominator, so
a = 1/3 is authorable/drawable/gradable as integers — plus `showParent`).

**Remaining 5, each the same shape (one engine capability, then an alongside insertion):**

1. **pr-04b-02/k3** — `percentBar` has no flat-fee affordance, and fee-vs-percent IS the check.
   A bar for "3% of $200" alone would print the answer; the capability needed is a two-segment
   bar (fixed fee + proportional part) that shows the STRUCTURE without the number.
2. **iar-03-01/ch1** and **iar-03-03/ch1** — `systemsExplore` draws y = mx + b with integer
   m, b; both checks add a VERTICAL constraint (x ≤ 4, x ≤ 5). Needs vertical-constraint
   support in the grapher.
3. **pp-04-01/k1** and **k2** — `polarTrace` grades rose-petal count / limaçon a; both checks
   are about DIRECTION of travel on a parametric path. Needs a parametric-direction tracer
   (arrowheads along the path as t increases; orientation of a circle traversal).

**Four other rows must NOT be converted without a user ruling**, because conversion changes what
is graded (identification → execution): pv-03-03/k1, pv2-04-03/k3, pc-03-01/k2, cpr-05-03/k2.
That is a curriculum change, not an engine project.

**Gate:** `src/lib/manipulativeAlongside.s237.test.ts` (17 rows). It asserts SHAPE, ADJACENCY,
UNCHANGED (the served step pinned to literals), INTEGRITY and SOLVABLE. Its UNCHANGED contract
caught me paraphrasing authored trap text instead of copying it — trust it.

### 3.3 Also open, per Plan v3

- WS-A brand productionization, WS-H landing rebuild, WS-J avatars (assets are concept boards
  only — see the two hard rules in Plan v3 Part 0).
- WS-E prediction purge, WS-G MCQ factory, WS-F sound/voice.
- §4.2 precache (`/.cowork-cache/`) — build it when a PARALLEL wave launches, not before.
- **Hero tier: do not assign by guess.** Engines join it with their WS-C conversion after
  1440px pixel QA. The six graph labs' SVGs are square viewBoxes — width IS height; their real
  growth is WS-C side panels, not a bigger square.

---

## 4. Content defects FOUND but NOT FIXED (frozen prose — need a user ruling)

Recorded so a successor does not rediscover them, and does not silently "fix" them either.

1. **`g2g-01-05/k3`** — count-vs-value distractor collapses onto the key: stacks 2,6,3,1 over
   5,6,7,8 make mode = count = 6, so bare "6 inches" (graded wrong) sits beside "6 inches — its
   stack is tallest" (graded right). *(A learner reading correctly can be marked wrong.)*
2. **`dc-02-01/ch1`** — authors TWO traps at value 36, so the second ("That is the volume-ish,
   not the rate" — itself sloppy prose) can NEVER fire. Found by the alongside gate in wave 18.
3. **Cosmetic fraction/decimal inversions** (S237 §5 item 3) — `g5u-03-02.json:38`, distractor
   labels in `g5f-02-02`/`g5f-02-03`. User ruled these stay logged, untouched.
4. **Grade-inappropriate vocabulary** — 60 learner-facing surfaces across 28 K–4 lessons carry
   `equivalence`, `the claim`, `verdict`, `repair`, `invariant` (`COWORK_CACHE/
   grade-vocabulary-s237.csv`). 32 of the 60 are in FEEDBACK. Highest harm per unit of effort
   of anything left; needs a house glossary, changes no grading.

No gate compares option labels for near-duplication (defects 1 and 2's class). That gate is
worth building.

---

## 5. Environment traps — these cost real time

- **`git push` is proxy-blocked.** Deliver work as `git bundle create <f> ac54811..HEAD`. The
  stop-hook will keep demanding a push; answer it with the bundle-apply recipe.
- **`pkill -f "next start"` kills your own shell** — the pattern matches the agent's own command
  line. Build the pattern from fragments: `PAT="next-ser""ver"; pkill -f "$PAT"`. Same hazard
  for any `pgrep -f` over a script containing the literal string.
- **`next start` keeps serving a DELETED `.next` after a rebuild** — `/learn` routes render
  EMPTY while `/` works from static cache. Looks exactly like a product defect. Kill the server
  BY PID before rebuilding.
- **Trap K — playwright full runs REWRITE sealed capture sets.** Before every commit:
  `git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv S237_SCREENSHOTS WAVE04_SCREENSHOTS
  "S238_SCREENSHOTS/01-lab-1440-light.png" "S238_SCREENSHOTS/02-prose-1440-light.png"
  "S238_SCREENSHOTS/03-lab-390-dark.png" "S238_SCREENSHOTS/03-lab-390-light.png"
  "S238_SCREENSHOTS/04-lab-768-light.png"`.
- **Delete temporary e2e capture specs BEFORE the final playwright count.** A leftover
  `tmp-cap*.spec.ts` once inflated 132 → 133 and looked like a win.
- **2 vitest shards maximum**; more OOM. If a shard appears to hang, it was OOM-killed under
  output buffering — rerun with `--reporter=dot > /tmp/log 2>&1`.
- **`rm -rf test-results tsconfig.tsbuildinfo` before `validate:native`**, or it flags them.
- **Python patch scripts write at the end** — one failed `assert` discards every edit in the
  script. Assert-all-before-write is the pattern; use whitespace-flexible matching on
  `figures.tsx` (~29,500 lines) and scope edits per function for ambiguous strings.
- **`cd` matters.** Every command in this repo must run from the repo root; a stray `cd` to
  `/home/claude` makes vitest "fail" 100 files for no reason.

---

## 6. Commit conventions

Every commit carries both trailers:

```
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01AwDvDP6Nhh2qLeHqiWcdcm
```

State the exact gate results in the commit body. If a gate is red, say so plainly and do not
claim the wave landed — `CLAUDE.md`'s rule, and it holds.
