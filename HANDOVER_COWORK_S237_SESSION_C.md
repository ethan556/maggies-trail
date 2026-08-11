# HANDOVER — Cowork S237, session C → next Cowork session

Successor to `HANDOVER_COWORK_S237_SESSION_A.md` and the session-B handover. **This file is
self-contained**: everything you need to start is here, and A/B are history rather than
prerequisites. Read this whole file before touching anything. Every rule below was learned by
breaking something.

---

## 0. Bootstrap — do this first, in this order

```bash
git clone https://github.com/ethan556/maggies-trail.git
cd maggies-trail
git checkout cowork/s237
git fetch <bundle> cowork/s237:cowork/s237       # if a bundle was attached — see §1
git merge-base --is-ancestor 4b66fe1 HEAD; echo "ancestry:$?"   # MUST be 0
npm ci
```

Then read, in order: `CLAUDE.md`, `COWORK_CACHE/workflow-s237.md`,
`COWORK_CACHE/PENDING_WORK_INVENTORY_S237.md`, and §2–§4 of this file.

**HEAD at the end of session C: `7e6ac5b`** ("Put the unitRate engine to work: pr-03-03, pr-03-02,
and the variant path"). If a bundle was attached to the message that carried this file, fetch it
**before doing anything else** — it holds commits the remote does not have.

### Environment facts, verified in this container

- Node 22, Vitest 4.1.10, Playwright 1.56.1.
- **Chromium IS available** at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, with
  `PLAYWRIGHT_BROWSERS_PATH` already set. Project memory says the browser suite is unrunnable in
  these sandboxes; **that is out of date** — see §5. Do not run `playwright install`.
- 2 CPU cores. This single fact causes Trap B (§3) and dictates the sharding rule.

---

## 1. `git push` does not work from Cowork, and that is not fixable here

```
remote: access denied by the git proxy: ethan556/maggies-trail is not in this session's
authorized repository set, so the proxy will not inject a credential for it.
fatal: unable to access '…': The requested URL returned error: 403
```

Attempt it once to confirm, then stop. **The working transfer mechanism is a git bundle**, which
the human fetches and pushes:

```bash
git bundle create /tmp/s237x.bundle <remote-sha>..HEAD
# then deliver the file to the user with SendUserFile
```

**Check the real remote SHA before claiming a count.** The local `origin/…` tracking ref goes stale
the moment the human pushes a bundle, and reporting "22 unpushed commits" when the remote is two
behind is a false alarm that wastes their attention. The GitHub connector can read the truth
without a fetch:

```
mcp__Github__list_branches({owner:"ethan556", repo:"maggies-trail"})
git update-ref refs/remotes/origin/cowork/s237 <sha-from-the-connector>
```

**Do NOT push through the GitHub connector's `push_files`.** It would create commits with different
SHAs from your local ones; the branch would then diverge from the remote and the next bundle would
not fetch cleanly on top, breaking the arrangement that works.

---

## 2. NON-NEGOTIABLES

These are in force at all times and outrank any instinct to make progress.

1. **Never weaken a test or a gate.** If an assertion is genuinely wrong, you may correct it — but
   only to something **stricter or equally strict**, and you must say so explicitly in the commit
   and to the user. Session B wrote a gate whose threshold encoded its own implementation's
   weakness (25% alignment allowed) instead of the property the learner needs, and the user caught
   it. Write the gate for the property, then make the implementation meet it.
2. **No curriculum, grading, feedback or sequencing change without lesson-level evidence AND the
   user's approval.** Adding a required field to satisfy a new schema is not exempt — name it.
3. **`git status` after EVERY Vitest run AND every browser run.** See Trap K, §3.
4. **Never more than 2 Vitest shards concurrently. Adjudicate every timeout solo.** See Trap B.
5. **No `Math.random`, no `Date.now`, no network at runtime.** `DETERMINISM.md` §5; use
   `@/lib/prng` (`seededShuffle`, `hashSeed`, `mulberry32`).
6. **Suppressed ≠ fixed.** A silenced symptom is not a repaired defect.
7. **Print the output and READ it before declaring a fix good.** This is not optional ceremony —
   see §4, where it caught two shipped-quality defects that every green gate missed.
8. **Corpus prose is authored content.** You may add a `variant` key or replace a widget with an
   evidence-backed one; you may not copyedit.

---

## 3. The three environment traps

**Trap K — the test suite destroys a tracked evidence file.**
`figureTextAdversarialAudit.test.tsx` rewrites `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` from **11,487
rows to 1,078** as a side effect. It happens on every full run.

```bash
git status --short                                  # after EVERY vitest run
git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv  # if modified
wc -l < PREMIUM_PENDING_WORKLOAD_QUEUE.csv          # must be 11488 (11,487 + header)
```

**Trap K's sibling — the browser suite overwrites sealed screenshots.**
`e2e/wave04-math-rendering.spec.ts` is a CAPTURE spec: it writes tracked PNGs in
`WAVE04_SCREENSHOTS/` with output from the current build. Restore with
`git checkout -- WAVE04_SCREENSHOTS/`. If S237 wants captures they belong in an S237 folder.

**A third, benign one:** the suite regenerates `EXCELLENCE_BACKLOG_S126.{json,md}` from the corpus.
A diff there after a content change is a **measurement, not damage** — keep it and say what moved.
A diff there with no content change means something else moved; investigate.

**Trap B — Vitest's 5000ms default timeout under CPU contention.**
On 2 cores, deterministic sweeps that pass in ~2s solo time out and report as **ordinary
failures**, indistinguishable from real ones. Session A burned a session reading 25 of these as
defects. Rule: **never more than 2 shards**, and **re-run any failure solo before believing it**.

```bash
npx vitest run --shard=1/2 > /tmp/a.log 2>&1 &
npx vitest run --shard=2/2 > /tmp/b.log 2>&1
wait
```

Session C hit exactly one (`widgets.accessibleParity.s237`, 5107ms sharded / 1.9s solo).

---

## 4. The five lessons this workstream keeps re-learning

Carried forward from the session-B handover §3, each re-confirmed in session C.

1. **A green gate proves the gate ran, not that the output is right.** In session C the schema gate
   was green while the engine printed **"5 miles per hours"** — derived English morphology, which
   `CLAUDE.md` bans outright. It was found by printing the SVG and reading it. *Store singulars,
   plurals and units in data; never compose English with a template.*
2. **A detector that fires on a keyword is not evidence.** Session B's absent-diagram detector
   reported 105 defects; 44 were ordinary mathematical English ("the graph of y = x²", "the image
   of (3, 7)"). A Flesch-Kincaid pass was discarded entirely for the same reason — its top hit was
   "1 meter = how many centimeters?". **The honest move is to shrink the list and say so.**
3. **Measure the property, not your implementation of it.** The matchPairs gate allowed 25%
   alignment because that is what the fix achieved. A seeded shuffle can return identity.
4. **"Parser matches ⇒ finding resolved" is an inference, not a measurement.** Session B's
   typesetting optimisation claim was refuted by an adversarial panel — wrong by 15×. The
   measurement was reproducible; the inference was false. Nothing was closed on it.
5. **Fixing the authored item is half the fix.** Session C's real catch: this app *regenerates*
   items from seeds. Repairing an authored step while leaving its variant generator alone means the
   defect **returns the moment a learner re-asks the item**. Always check for a `variant` key and
   for `POINT_SET_VARIANT_FORMS`-style upgrade hooks.

---

## 5. What sessions B and C actually landed (22 commits on `cowork/s237`)

Nine learner-reported defects drove most of it. Current status:

| Reported defect | Status |
|---|---|
| Matching options pre-matched | **Fixed** — deterministic rotation in `MatchPairsW`/`DragBucketW`/`BuildExpressionW`; gates at zero tolerance |
| Number line unlabelled / unmarked | **Fixed** — `scaleTicks` with a 1-2-5-10 stride in `NumberLineHopW` |
| Graph axes unlabelled | **Fixed** — `AxisCaptions` across 23 engines; 3 deliberately left bare with the reasoning in the gate |
| Token bank too obvious | **Fixed** — symbols-then-numbers-ascending with shuffle+rotate fallback |
| Questions referring to absent diagrams | **Partly** — see §6; the engine now exists and 9 steps use it |
| Confusing K-4 wording | **Fixed** — 76 plain-language replacements across 35 files |
| Mastery Studio 404 | **Fixed** — `masteryMissionExists()` gates all three entry points; 571 dead links |
| Missing manipulatives | **Open** — 28 candidates, needs a schema field or a sequencing change (§6) |
| Missing illustrations | **Not started** (§6) |

Also landed: `authoredMath.ts` false-equation repair (178 → 0), the browser suite running for the
first time (85 passed / 2 failed — a real WCAG contrast defect, §6), and in session C the
`unitRate` engine extension.

**Session C's two commits in detail:**

- `760fde7` — **`unitRate` task on `pointSetReasoningLab`.** Reads the target point, states that it
  and the origin lie on one line, divides output by input. It is the only task in the engine whose
  answer is a relationship *between* points, so integrity checking requires every point in the
  target set to sit on that line. Two defects found by reading printed output: the "per hours"
  morphology bug, and a single plotted point landing in the corner with its label past the viewBox
  and the ray stopping dead at the dot. Gates: `src/lib/schema.unitRate.s237.test.ts`,
  `src/components/widgets.unitRate.s237.test.tsx`. Each fix was reverted in turn to confirm the
  gates go red.
- `7e6ac5b` — **9 steps converted** (`pr-03-03` i1/k1/i3/k2/ch1, `pr-03-02` i2/i3/k3/ch1) **and the
  variant path upgraded** (`pr-graph-rate-g7` @ `graphStoryRead`/`graphRateRead`). Three decisions
  are recorded in `COWORK_CACHE/absent-diagram-corrected-s237.md`: no units were invented (axes are
  `x`/`y`, because inferring units gives "a car trip at 5 miles per hour"); answering now requires
  **one** stage open, pinned to the point read, because this engine's `requiredExplorations` floor
  is 1 — **an interaction change on graded steps, deliberate**; and each step needed a
  `successFeedback` that `numeric` did not require.

---

## 6. What is left, in priority order

### 6.1 The 40 remaining absent-diagram rows — highest value, well specified

Full detail: `COWORK_CACHE/absent-diagram-corrected-s237.md` (read the "Progress — second batch"
section) and `absent-diagram-corrected-s237.csv`.

The corrected split: **45 real** (5 now done), 44 false positives (do nothing), 11 wording defects
(4 done, 4 converted with `pr-03-02`, 3 remain), 4 "no figure authored" (done).

Lease one lesson at a time, reusing an engine already present in that course:

| Lesson | Course | Rows | Likely engine |
|---|---|---:|---|
| `mmt-05-01` Reading a Picture Graph | measure-money-time | 4 | `dotPlot` READ mode |
| `vm-02-02` Using Line Plot Data | volume-measurement | 4 | `dotPlot` |
| `g2g-02-01` Building a Picture Graph | data-line-plots-g2 | 3 | `dotPlot` |
| `exp-04-01` Reading Exponential Graphs | exponential-functions | 3 | needs triage |
| `ee-05-02` Graphing Inequalities | expressions-equations | 3 | needs triage |
| `cx-03-03` Proofs for Every Figure | coordinate-proofs | 2 | `coordinateProofLab` |

**For every one of these, check the step for a `variant` key before you start.** That is lesson 5
and it is the difference between a fix and the appearance of one. `dm-01-01/k1` is the worked
example of the `dotPlot` READ-mode conversion (`given` + `askIndex`).

### 6.2 The `.bg-sky` WCAG contrast defect — needs a brand decision, not a patch

`#2E7CD6` under white text is **4.23:1**; AA needs 4.5:1. It is the token, not one button —
`AssignmentsCard`, `ReportIssue` and `HeroWidget` all pair `bg-sky` with `text-white`. Full analysis
including why each obvious fix is worse: `COWORK_CACHE/browser-verification-s237.md`.
**Recommendation: darken `sky` to `#1F5FA8` (6.44:1) in one change** that updates the Tailwind
token, the hardcoded SVG literals in `widgets.tsx`, and the two pinning tests
(`widgets.enrich.tone`, `widgets.fractionEntry`) **together**, then re-run axe in both themes and
`verify:instructional-colors`. Ask before doing it.

### 6.3 Browser verification — unblocked, per-engine matrix not done

WP1's exit condition wants the changed engine families at 390/768/1440 in light and dark, active
and retry. The page-level axe sweep is done; the per-engine matrix is the next batch.

```bash
npm run build
npx next start -H 127.0.0.1 -p 3100 &
PW_BASE_URL=http://127.0.0.1:3100 \
PW_CHROMIUM_EXE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  npx playwright test --project=chromium
git status --short          # Trap K's sibling
```

**Run against `next start`, never `next dev`** — dev compiles routes on demand and 30s `page.goto`
timeouts on 2 cores are not product defects. Projects `player-phone-390`, `player-tablet-768`,
`player-state-desktop` already exist in the config.

### 6.4 28 manipulative additions — blocked on a design decision

`COWORK_CACHE/needs-manipulative-s237.csv`. The user's ruling was "add alongside", which the step
schema has no field for. Needs either a schema addition or a sequencing change. Bring the user the
choice; do not pick one silently.

### 6.5 Illustrations programme — not started

The user's stated goal is **visual-first learning**, including "actually have the fraction shown as
[the entered number]/4". Unscoped. Start by measuring, not building.

### 6.6 Longer tail

`COWORK_CACHE/PENDING_WORK_INVENTORY_S237.md` has the measured family-level breakdown — the
headline is that **11,487 queue rows are a few hundred real decisions**, because the queue counts
row instances and the work lives at family level. 3 figures cover 87% of the illustration rows.
Work Package 2 (17 reversible-play engine families) is untouched; `numeric` and `mcq` in that list
are dispositions to argue, not features to build.

---

## 7. Workflow the user chose

- **Fable**: planner/architect only.
- **Sonnet**: implementor.
- **Opus**: orchestrator and adversarial quality assessor.
- Prioritise precaching, batch processing, and parallel workers. Work at **family level**, not row
  level. Details: `COWORK_CACHE/workflow-s237.md`.

**Adversarial protocol that actually caught things:** refute, don't confirm; give verifiers
*different lenses* rather than N identical ones; **revert the fix and watch the gate go red**;
print the output and read it; write self-checks so a gate cannot pass by blindness (every rejection
test paired with a near-identical spec that must be *accepted*).

**Work autonomously.** Ask only when a genuine curriculum ruling is needed, and when you do, bring
the user the specific choice rather than the whole problem.

---

## 8. Gate sequence — run all of it, every session

```bash
npm run typecheck                                    # clean
npx vitest run --shard=1/2 & npx vitest run --shard=2/2; wait   # 12,877 tests
git status --short                                   # ⚠️ TRAP K — restore the queue CSV
npm run validate:content                             # 1840/1840
npm run lint:pedagogy                                # 1711/1711
npm run validate:native                              # see note
node scripts/check-registration.mjs
timeout 850 npm run build > /tmp/build.log 2>&1; echo "EXIT:$?"
```

- `validate:native` **always** reports 3 findings in a working checkout: `node_modules`, `.next`,
  `tsconfig.tsbuildinfo`. Those are archive-only checks and are expected. **Any other finding is a
  real defect.**
- **Judge the build by EXIT CODE, not by grepping for "error".** It can print
  `✓ Compiled successfully` and still exit 1 on ESLint. Note `> log 2>&1`, never `2>&1 > log`.
- Baseline at `7e6ac5b`: typecheck clean, 12,877/12,877, content 1840/1840, pedagogy 1711/1711,
  registration consistent, build EXIT:0. **If your first run does not match this, that is your
  problem to solve before starting new work.**

---

## 9. Map of `COWORK_CACHE/`

Tracked deliberately, against the execution prompt's "session-local" guidance, because three
sessions of measurement kept being re-derived from scratch.

| File | What it holds |
|---|---|
| `PENDING_WORK_INVENTORY_S237.md` | **Start here.** Family-level breakdown of everything left |
| `workflow-s237.md` | The agent-role workflow and batching strategy |
| `absent-diagram-corrected-s237.{md,csv}` | The 105 → 45 correction, the 9 done, the 40 left |
| `browser-verification-s237.md` | How to run Playwright here; the `.bg-sky` defect in full |
| `learner-reports-status-s237.md` | The nine reported defects and where each stands |
| `needs-manipulative-s237.csv` | The 28 blocked additions |
| `axis-label-worklist-s237.csv` | The axis sweep, including the two engines the worklist got wrong |
| `grade-vocabulary-s237.csv` | The 76 K-4 replacements |
| `typesetting-verdict.md` | The refuted optimisation claim — **read before re-opening typesetting** |
| `gate-map.md`, `engine-map.csv`, `work-index.json` | Precached indexes; regenerate only if stale |

S237 gates added across B and C: `widgets.{answerOrder,numberLineScale,tokenOrder,axisCaptions,
accessibleParity,answerGating,answerParity,unitRate}.s237`, `schema.unitRate.s237`,
`authoredMath.falseClaims.s237`, `content.gradeVocabulary.s237`, `masteryMission.links.s237`,
`routeReachability.s237`, `describeState.signChart.s237`. Audit scripts:
`scripts/audit/learner-focus-recheck-s237.mjs` (33 probes, ~1s),
`scripts/audit/accessible-parity-s237.mjs`.

---

## 10. Suggested first action

Lease `mmt-05-01` (4 rows, `dotPlot` READ mode already used twice in the same course, `dm-01-01/k1`
is the worked example). Check each step for a `variant` key first. Then `vm-02-02` and `g2g-02-01`,
which are the same shape.

Do not start by re-measuring what §6 already measured.
