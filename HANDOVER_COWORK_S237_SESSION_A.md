# HANDOVER — Cowork S237, session A → next Cowork session

**Read this file first, then `CLAUDE_COWORK_TRANSFER_MANIFEST_S237.md` and
`CLAUDE_COWORK_EXECUTION_PROMPT_S237.md` (both committed at repo root).** The manifest and
execution prompt remain the governing contract and are unchanged. This file records only what
session A established, changed, and learned.

---

## 0. Bootstrap facts (verified, reusable)

The transfer bootstrap is COMPLETE. A new session does not need to redo the access fight.

| Fact | Value |
|---|---|
| Repo | `https://github.com/ethan556/maggies-trail.git` |
| Working clone | `/home/claude/maggies-trail-s237` |
| Branch | `cowork/s237`, tracking `origin/main` |
| Execution base (`origin/main` head) | `586c489246ff48971811301f18b3bb228b4c7acd` — "Add Claude Cowork transfer handoff" |
| Required implementation ancestor | `4b66fe16361ccc03f59ea930013c2d0c94f48e14` — "S231-S236 premium learner experience checkpoint" |
| Ancestry gate | `git merge-base --is-ancestor 4b66fe16… HEAD` → **exit 0 (PASS)** |
| `npm ci` | PASS — 520 packages, 0 vulnerabilities |
| Node / npm | v22.22.2 / 10.9.7 |
| Clone size | 4,510 files, 150 MB (no `node_modules`/`.next` transferred) |

### Repository access — how it was unblocked (do not repeat the dead ends)

The sandbox could not `git clone` and `api.github.com` returned 403 ("Use add_repo…"). **None of
these worked:** the claude.ai GitHub connector (authenticates as `ethan556` but could not see the
repo — 404); the Claude Console; the "Finish connecting GitHub" button (loops to a
Team/Enterprise-only org-settings page — the account is **Max plan**, an individual tier, so that
surface is legitimately unavailable); GitHub App repo-access reconfiguration at
`github.com/settings/installations` (saved "All repositories" for the Claude app — did not
propagate to this session).

**What worked:** the user temporarily flipped `maggies-trail` to **public**, the clone succeeded
immediately, and the repo can now be flipped back to private — local work does not need it.

⚠️ **Push access is NOT established.** Nothing has been pushed. When work needs publishing, that
access problem is still unsolved and will need the user again.

---

## 1. Baseline gate results (current tree, Linux, this clone)

Run cheapest-first per the execution prompt. **These supersede the manifest's Windows figures as
the current-environment baseline** — the manifest explicitly said not to claim a new green result
until rerun in Cowork; this is that rerun.

| Gate | Result | Detail |
|---|---|---|
| `npm run typecheck` | **PASS** | clean, ~72 s |
| `node scripts/check-registration.mjs` | **PASS** | files ↔ course.json ↔ PLAN.md consistent |
| `scripts/audit/engine-registration-contract.mjs` | **PASS** | 127/127 core-complete; describeState 84/127 |
| `npm run validate:content` | **PASS** | schema 1840/1840 clean |
| `npm run lint:pedagogy` | **PASS** | pedagogy 1711/1711 clean |
| `npm run validate:native` | **PASS in substance** | only the 2 expected working-checkout findings (`node_modules`, `tsconfig.tsbuildinfo`). Per CLAUDE.md these are archive-only checks and expected; **any other** finding would be a real defect |
| `npm run build` | **PASS** | "✓ Compiled successfully in 2.0min"; full route table emitted |
| **Full Vitest (6 shards)** | **25 failed / 12,788 passed / 12,813 total; 11 failed files / 327 files** | see §2 |

Sharding is mandatory: `npx vitest run` as one command exceeds a 10-minute tool call
(`variants.test.ts` alone is 3,993 tests / ~5 min). Six background shards
(`npx vitest run --shard=i/6`) complete comfortably. **`--reporter=basic` no longer exists in
Vitest 4** — it errors out before running; use the default reporter.

---

## 2. ⚠️ Vitest is WORSE than the recorded baseline — unresolved, highest priority

CL-P1-033 records the Windows baseline as **15 failures / 6 files** (12,798 passing). This Linux
run gives **25 failures / 11 files** (12,788 passing). Total test count matches exactly (12,813),
so the suite itself is the same; the failure set is larger.

**This is not yet analyzed and must not be assumed to be "just portability."** CL-P1-033 and
CL-P1-040 describe path-separator/temp-cleanup portability defects that would plausibly *pass* on
Linux while failing on Windows — meaning the two failure sets may be overlapping-but-different,
not a clean superset. **Do the set difference before touching anything**: identify which of the 25
are the recorded Windows 15, which are Windows-only (now passing), and which are genuinely new
Linux failures. Only the last category is new information.

Failed files (11):

- `src/lib/variants.test.ts` — 10 failures, all `150 seeds through the identical gate`:
  `double-angle-solve` @ `countSolutions`/`nextStep`/`sumSolutions`, `solve-trig-all` @
  `sumCos`/`sumSin`/`stretch`, `trig-inside` @ `sumSolutions`, `full-sketch` @
  `directionChanges`, `point-transform` @ `dilate`, `polygon-angles` @ `regularInterior`.
  Also seen in an earlier partial run: `fraction-benchmark` @ `straddleHalf`.
- `src/lib/variants.resolver.test.ts` — `is FRESH: varying the seed varies the problem`
- `src/components/LessonPlayer.play.test.tsx` — 4 (hint ladder XP; scripted DOM walk playthrough;
  remedial pair injection; mid-lesson resume)
- `src/components/ladder.s41.test.tsx` — 2 (rung 1/2 control lock; rung 3 remedial arming)
- `src/components/figureTextAdversarialAudit.test.tsx` — catalogues every placement / no
  unreviewed high-confidence conflict
- `src/components/figures.test.ts` — resolves every authored figure name
- `src/components/widgets.emitters.test.tsx` — numberLineHop wrong-side/away reading
- `src/lib/content.widgets.audit.test.ts` — solvability gate (SOLVABLE / not PRE-SOLVED / no DEAD
  wrong-paths)
- `src/lib/evaluate.negBracket.s208.test.ts` — grader vs hand arithmetic on beam tip
- `src/lib/session198.measureCompareK.test.ts` — adapt-3 engine recipe
- Two privacy/routing rules also failed: `RULE 1: a learner reaches their teacher and guardian,
  and NEVER a classmate`, `RULE 2: a parent reaches their child's teacher, not a stranger's child`

The variants failures are the CLAUDE.md-documented failure mode (trap collisions / freshness), and
`polygon-angles @ regularInterior` plus the trig forms are exactly the "geometry special angles are
collision factories" class. That is a hypothesis, not a diagnosis — verify.

---

## 3. 🚨 ENVIRONMENT TRAP K (new, destructive) — the test suite destroys the queue file

**Running Vitest silently rewrote `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` from 11,487 rows down to
1,078**, deleting all 10,409 non-illustration rows — the entire MATH_TYPESETTING, MCQ, PREDICTION,
CLOSURE_LEDGER, ENGINE_REVERSIBLE_PLAY, PREMIUM_REBUILD_WAVE, INTERACTION_NECESSITY and
ENGINE_DISPOSITION workstreams.

Cause: `src/components/figureTextAdversarialAudit.test.tsx` calls `writeFileSync` on that path
(line ~218-219) and emits only the illustration rows it computes. It is a **test that mutates
tracked source-of-truth data as a side effect.**

**Session A restored it** (`git checkout -- PREMIUM_PENDING_WORKLOAD_QUEUE.csv`; 11,487 rows
verified; tree clean). But:

- **Always `git status` after any Vitest run** and restore this file if modified.
- Regenerating via `npm run audit:pending-workload` is the sanctioned path; the *test* is not.
- Do not mistake the truncated 1,078-row file for real queue progress. It is data loss, not
  closure. This is precisely the "suppressed ≠ fixed" hazard class in a new costume.
- Consider whether making that test read-only (or write to a temp path) is itself a queue item —
  but note the manifest's "never weaken tests/gates" rule: changing what it *writes* is not the
  same as weakening what it *asserts*, and the distinction should be argued explicitly before any
  edit.

---

## 4. Work Package 1 — 127-engine learner-focus audit: **audit COMPLETE, fixes NOT STARTED**

`PREMIUM_ENGINE_LEARNER_FOCUS_AUDIT_S237.csv` is written at repo root: **128 lines = header + 127
rows**, validated as exactly 127 unique engines against `scripts/engine-capabilities.json` with
**no engine missing and none extra**. Produced by three disjoint read-only shards (A 1-42,
B 43-84, C 85-127); per-shard files `.wp1-shard-{a,b,c}.csv` retained.

Columns: `engine,file,line_ref,verdict,leak_class,evidence,confidence`.

**Verdicts: CLEAN 108 · LEAK 18 · UNCERTAIN 1.**

### The 18 LEAK engines

Shard A: `exactNumberLab`, `affineRelationshipLab`, `conditionalTableLab`, `equationOutcomeLab`
Shard B: `quotientReasoningLab`, `pointSetReasoningLab`, `placeValueTransformLab`,
`geometricConstraintLab`, `proportionalReasoningLab`, `lineRelationLab`, `graphStoryLab`
Shard C: `shapeHierarchyLab`, `signedFractionLab`, `sequenceBuild`, `unitCircleExplore`,
`signChart`, `verticalLineScanner`, `triangleAngleLab`

UNCERTAIN: `areaModel` (`widgets.tsx:8572`) — "…the number of unit squares stays **invariant**."
It is a true mathematical claim captioning a rotate-preserves-area control, but it is the only
place in shard A putting "invariant" on a learner screen. Human ruling needed; do not silently
resolve it either way.

### Systemic patterns — fix these FIRST (the execution prompt mandates shared-shell fixes before per-engine work)

1. **One shared "required before grading" sentence template, 8 engines.** `widgets.tsx` lines
   **5580, 6894, 6956, 6971, 6987, 7006, 7124, 7198** all render a variant of
   `"{n} valid <noun> state{s} inspected; {spec.requiredExplorations} required before grading."`
   This is authoring/grading vocabulary on the active screen. **One fix closes eight leaks.**
2. **`spec.task` (an internal enum) printed as learner prose.** `widgets.tsx:7004` ("Task:"),
   `:7179` ("Task mode:"), `:3461` ("Sequence workbench for …"), and `describeState.ts`
   **376, 378, 385, 393, 416, 669**. Learners read "Task: density witness.", "Task mode: invalid
   remainder.", "Base-ten task exponentChain." Some are de-camelCased, some raw.
3. **Raw enum discriminators painted straight to screen with no humanising map**:
   `evidenceKind` → BLOCKER/CLASSIFICATION/PATH/REVERSE chips (`widgets.tsx:15851-15852,15869`);
   `targetFeature.kind` → "midlineCross" drawn on the wave graph (`:11425`, `:11355`);
   `choice.path` → "magnitudeError" **and "correct"** announced via aria-live (`:5672`) — the
   latter also leaks correctness before checking; `line.sourceKind` (`:7115`);
   `condition`/`cell` → "col0"/"r0c1" in the accessible panel while the screen says "Given Boys"
   (`describeState.ts:439`, despite `conditionLabel()`/`cellLabel()` existing at
   `widgets.tsx:15919-15920` and simply not being used). Sibling engines that *do* map are clean —
   this is a consistent, mechanical defect class.
4. **The `<details> "Describe this model"` panel is the leakiest shared surface.** Rendered
   unconditionally at `widgets.tsx:16188` with no tone gate, it carries several leaks that never
   appear on the visual stage, and gets far less review.
5. **`WIDGET_ACTIONS` (`describeState.ts:915-960`) leaks design-system vocabulary into learner
   help** — e.g. "reveal uses a separate ghost without overwriting learner work" (lines 941,
   944-948, 951-954). Sweep the whole map.

### Two findings OUTSIDE the focus taxonomy — triage separately, do not bury

- **`describeState` speaks the ANSWER during active work** for ~12 engines (scaledCircleLab,
  unitCircleExplore, dilationExplore, quadraticExplore, lineExplore, vectorExplore, slopeField,
  triangleSolve, netFold, circleMeasureExplore, polarTrace, quadDrag): "The target real radius is
  N", "The target angle is N°". This **contradicts the codebase's own stated parity rule** at
  `widgets.tsx:10241` and `describeState.ts:553-556` ("`spec.targetAngle` is deliberately
  withheld… Parity means the same task, not an easier one"). Where the target is drawn on stage it
  is genuine parity; where the target ghost is `tone === "info"` only, screen-reader users are
  handed an easier task. Deserves its own sweep and probably its own ledger row.
- **`signChart` crashes.** `describeState.ts:761-768` calls `signChartSigns(spec.roots,
  spec.leadingPositive)` **omitting the `poles` argument**, while the widget cuts with
  `signChartCuts(spec.roots, spec.poles)`. Shipped specs have poles (rf-01-01, rf-01-02, rf-02-01,
  rf-05-01, pra-05-01). For `rf-01-03` (`roots: []`, `poles: [{x:-4}]`), `fmt(xs[0])` calls
  `undefined.toFixed` → **TypeError thrown inside WidgetRenderer's render**. Narration also
  describes a different model than the picture ("2 intervals" beside 3 sign buttons).
- **`compassConstruct` describes the wrong construction** to screen-reader users:
  `describeState.ts:809-812` branches only on `perpBisector`, so all five other classical modes
  (angleBisector, perpAtPoint, perpFromPoint, parallelThroughPoint, copyAngle) are narrated as
  "Building a regular hexagon stepped around the circle."
- **`matrixTransform`** help says "Four sliders set the matrix entries" but the controls are +/−
  steppers (`describeState.ts:941`).

### Verified-fixed (do not re-litigate)

- **rotationLab / S215 raw tone token: genuinely fixed.** The `{tone ? <p>{tone}</p> : null}`
  render is gone, a comment at `widgets.tsx:10232` records the removal, and
  `widgets.rotationLab.tone.s215.test.tsx` locks it with a `/\b(neutral|success|error|info)\b/i`
  assertion across all tones. No shard-C sibling repeats it.
- **systemsExplore stale narration: fixed.** `describeState.ts:188-216` builds
  `systemsPairModel(spec, v)` flowing through `systemsPairParams`
  (`src/lib/mmip/systemsPairAdapter.ts:116-135`), reading `value.lines` per editable slot, so
  narration tracks learner drags.

### Deliberate judgement calls recorded (a stricter reading could sweep these)

Exploration counters ("moves 2/3", "experiments", "deformations", "N of M states inspected") were
treated as legitimate next-action feedback rather than mastery telemetry — **except** where they
sit beside genuine system vocabulary. `lineRelationLab`'s `moves` tile (`widgets.tsx:15704`) *was*
flagged because it counts learner actions against an authoring quota. **A house ruling on bare
counters should be set before Work Package 1 fixes land**, because it moves the LEAK count. Also
recorded as deliberate non-flags: "Stage N" where stage means a derivation step or graph segment
(domain language, not lifecycle); `percentChangeLab`'s `{spec.direction}` (raw discriminant, but
its values are the real words "markup"/"markdown"); `compoundEventLab`'s "Stage 1/2/3" (stages of
the experiment); `conicLocusLab`'s `label="family"` (conic family, not transfer family);
`boxPlot`'s MIN/Q1/MED/Q3/MAX (standard five-number-summary names).

---

## 5. Queue verification

Independently tabulated from `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` (not from cached docs). **Every
figure matches the manifest exactly:**

| Workstream | Rows | | Priority | Rows |
|---|---:|---|---|---:|
| MATH_TYPESETTING | 9,579 | | P0 | 977 |
| ILLUSTRATION_REPLACEMENT | 1,078 | | P1 | 10,507 |
| MCQ_DISTRACTOR_REVIEW | 572 | | P2 | 3 |
| PREDICTION_GATE_REVIEW | 200 | | **Total** | **11,487** |
| CLOSURE_LEDGER | 27 | | | |
| ENGINE_REVERSIBLE_PLAY | 17 | | | |
| PREMIUM_REBUILD_WAVE | 8 | | | |
| INTERACTION_NECESSITY_REVIEW | 3 | | | |
| ENGINE_DISPOSITION_REVIEW | 3 | | | |

---

## 6. Working-tree state

```
?? .wp1-shard-a.csv                              (shard artifact, retained as evidence)
?? .wp1-shard-b.csv
?? .wp1-shard-c.csv
?? PREMIUM_ENGINE_LEARNER_FOCUS_AUDIT_S237.csv   (WP1 deliverable, 127 rows)
?? HANDOVER_COWORK_S237_SESSION_A.md             (this file)
```

**No tracked file has been modified.** No source, content, test, or gate has been touched. Nothing
committed, nothing pushed. `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` was clobbered by the test suite
and restored to its committed 11,487-row state (§3).

---

## 7. Next actions, in order

1. **Set the house ruling on bare exploration counters** (§4) — it changes the LEAK set before any
   fix lands.
2. **Do the Vitest set difference** (§2): recorded-Windows-15 vs current-Linux-25. Do not start
   fixing until you know which failures are new.
3. **Fix the systemic shared-shell leaks first** (§4 patterns 1-5), single-writer on
   `widgets.tsx` / `describeState.ts` per the execution prompt's shared-file ownership rule. Then
   **rerun the 127-engine audit** and confirm the LEAK count drops for the right reasons.
4. **Browser-verify changed families at 390/768/1440 px, light and dark**, per Work Package 1's
   exit condition.
5. **Triage the three out-of-taxonomy findings** (§4): the `describeState` answer-leak sweep, the
   `signChart` crash, the `compassConstruct` mis-narration. The crash is a live TypeError on
   shipped content and arguably jumps the queue.
6. Only then **Work Package 2** (17 reversible-play families) and the dependency-ordered queue.

## 8. Standing constraints (unchanged, repeated because they are easy to lose)

- The manifest's **8 non-negotiable closure rules** and the execution prompt's **hard
  prohibitions** remain in force verbatim.
- A queue row closes **only** via regenerated audits proving its condition. Queue presence is not
  completion; hidden/suppressed is not fixed.
- No curriculum-math, grading, feedback, or sequencing change without lesson-level evidence and
  explicit approval. Heuristic flags do not authorize curriculum edits.
- Never weaken a test or gate to make it pass.
- `CLAUDE.md` at repo root is the **variant-generation** operating manual — per the manifest it is
  explicitly *not* the premium-queue task definition. Do not follow it as the session mandate.
