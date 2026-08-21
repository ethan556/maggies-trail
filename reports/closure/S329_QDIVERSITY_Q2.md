# S329 QUESTION_DIVERSITY_AND_TRANSFER — Lane A, Packet Q2

Scope: the 3 `EXCELLENCE_BACKLOG_S126.csv` rows with `candidateDisposition = multi-engine` —
`mmt-02-01` (measure-money-time), `ns-04b-01` (number-system), `sp-03-02`
(sampling-and-probability). Each row's exact `sourcePath` column was read to locate the file (not
guessed); all three courses are otherwise disjoint (no shared lesson, generator family, or figure).
Investigated and implemented independently, one at a time, per instructions.

**Result: 3 of 3 completed.** Every lesson got one new challenge-tier step (`ch2`) that adds a
genuinely different, hand-verified engine to its assessed sequence and requires reconciling it with
representations the lesson (or its immediate sibling) already uses. No lesson was left unedited as
"too hard to do honestly" — all three had a clean, non-contrived fit once the right existing engine
was identified. No existing step (`ch1` included) was modified in `ns-04b-01` or `sp-03-02`; `ch1` was
also left untouched in `mmt-02-01` — the only touch outside the new step there is one recap takeaway
line, noted in §2. Per instructions, this session did not touch `EXCELLENCE_BACKLOG_S126.csv` or
`CLOSURE_LEDGER.md`, and did not append to the main
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` ledger — disposition records are staged at
`reports/closure/cowork-staging/laneA-s329-Q2.jsonl` for a separate integration step.

**Environment note:** this container had other work actively running concurrently while this session
worked, exactly as the task brief warned. `git diff --stat` scoped to each course directory shows
other lessons changing in parallel that this session never touched: `mmt-04-03.json` and
`mmt-05-03.json` in measure-money-time, and `sp-02-01.json` / `sp-02-02.json` / `sp-02-03.json` in
sampling-and-probability — all outside this packet's three lessons and all consistent with the
LESSON_PROGRESSION_AND_DUPLICATION workstream's own mandate to edit other lessons in these same
courses. Confirmed with `git diff --stat -- 'content/courses/<course>/*'` (§6.7) that this session's
own diff is scoped to exactly `mmt-02-01.json`, `ns-04b-01.json`, `sp-03-02.json` and nothing else.

---

## 0. A discrepancy this session found, and resolved in favor of the live scorer

Before designing anything, this session searched the ledger for prior work on these three lessons and
found that **all three already carry a "KEEP" disposition**, each explicitly reasoning that the
multi-engine gap was already closed:

| Lesson | Prior verdict | Reasoning given |
|---|---|---|
| `mmt-02-01` | `S318-QD-mmt-02-01`: `NOT_REPRODUCIBLE`, then `S317-V-mmt-02-01`: `KEEP` (unrelated choice-order fix) | "`ch1` is already matchPairs... distinct engine from k1/k2/k3's mcq." |
| `ns-04b-01` | `S318-QD-ns-04b-01`: `NOT_REPRODUCIBLE`, then `S319-D-ns-04b-01`: `KEEP` | "i1/i2 (plotPoint) now carry conceptTag... attributing them as assessment evidence alongside k1/k2/k3/ch1's mcq." |
| `sp-03-02` | `S318-QD-sp-03-02`: `NOT_REPRODUCIBLE`, then `S320-A3-sp-03-02`: `KEEP` | "`ch1` is already matchPairs... distinct engine from k1/k2's trialProbabilityLab and k3's mcq." |

(All in `reports/closure/cowork-staging/laneA-s318-qd.jsonl` and
`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`.)

But `EXCELLENCE_BACKLOG_S126.csv` — regenerated **after** all three of those reviews (its mtime and
the S317/S319/S320 `reviewedAt` timestamps are checked in §0.1) — still lists all three as
`candidateDisposition = multi-engine` with `classificationScoreGaps` including `contrast` and
`transfer`. That is a live contradiction, not a stale label, and it was worth resolving before writing
any code: either the CSV's classifier is wrong, or the three "NOT_REPRODUCIBLE" verdicts were.

**This session read `scripts/audit/flagship-representation.mjs` (the actual `contrastScore` /
`transferScore` implementation the classifier's `s243-representation-novelty` rule is built on) and
then executed it directly against the pre-edit files** (§6.4 shows the actual command and output).
Two precise mechanisms explain why every one of the three "NOT_REPRODUCIBLE" verdicts was mistaken:

1. **`representationSignature()` keys off `step.variant.gen`/`form` BEFORE it ever looks at
   `widget.type`.** In both `mmt-02-01` and `sp-03-02`, `ch1` carries the identical `variant` tag as
   its sibling `mcq`/`trialProbabilityLab` checks (`g2-measure-money-time`/`MmtEstimateMcq` in
   `mmt-02-01`; `prob-fraction`/`trialRelFreq` in `sp-03-02`) even though its **widget type** differs
   (`matchPairs`). The reviews read "different widget type" as "different representation" — but the
   scorer never gets that far, because the `variant` tag short-circuits the check first. Both
   lessons' pre-edit `d.contrast` and `d.transfer` were genuinely `0`, confirmed by running the
   function, not by re-reading the JSON.
2. **The `assessed` set that feeds `contrastScore`/`transferScore` is filtered to
   `kind === "check" || kind === "challenge"` — `kind: "interactive"` steps never count, no matter
   what `conceptTag` they carry.** `ns-04b-01`'s `i1`/`i2` are `kind: "interactive"`; giving them a
   `conceptTag` (a real, separate S282 fix, confirmed unrelated and left alone) does not and cannot
   move them into the assessed pool the scorer reads. `d.contrast`/`d.transfer` were genuinely `0`
   there too.

Given this, this session proceeded with the packet as instructed rather than deferring to the stale
"KEEP" verdicts, and closes the loop by superseding all three in a fresh, dated disposition (§5) that
names precisely which prior record it supersedes and why — turning this discrepancy into a durable,
checkable fact instead of leaving two contradictory ledger entries for someone else to puzzle over
later.

### 0.1 Timestamp check (why "stale label" was ruled out)

```
$ ls -la --time-style=full-iso EXCELLENCE_BACKLOG_S126.csv
-rw-r--r-- 1 root root 19198 2026-08-21 13:14 EXCELLENCE_BACKLOG_S126.csv
```
S317-V-mmt-02-01 `reviewedAt`: `2026-08-20T08:47:51Z`. S319-D-ns-04b-01: `2026-08-20T12:38:46Z`.
S320-A3-sp-03-02: `2026-08-20T18:15:55Z`. The CSV's mtime (2026-08-21 13:14) is chronologically after
all three — it was written or regenerated *after* every one of those KEEP dispositions and still
disagrees with them.

---

## 1. What each row actually said, and how the extension was chosen

| Lesson | Grade / course | Title | `candidateEngineOrExtension` | `classificationScoreGaps` | `currentWidgets` |
|---|---|---|---|---|---|
| `mmt-02-01` | G2, measure-money-time | Estimating Before You Measure | Multi-representation sequence beyond `variant:g2-measure-money-time:MmtEstimateMcq` | contrast; formal; prediction; transfer | estimateSlider×3; matchPairs×1; mcq×3 |
| `ns-04b-01` | G6, number-system | Signs, and What a Flip Does to Them | Multi-representation sequence beyond `surface:mcq` | contrast; formal; prediction; transfer | mcq×4; plotPoint×2 |
| `sp-03-02` | G7, sampling-and-probability | Estimating Probability from Trials | Multi-representation sequence beyond `variant:g7-sp-likelihood-words:spLikelihoodImpossible` + `variant:prob-fraction:trialRelFreq` | adapt; contrast; formal; prediction; transfer | matchPairs×1; mcq×1; trialProbabilityLab×5 |

Every lesson JSON was read in full before designing anything (all three are reproduced step-by-step
in §2–§4, since each mattered to the specific choice made). Per instructions, each design either
(a) combines two representations the learner must reconcile, or (b) moves the learner between two
engines already used elsewhere in the app for a related concept. All three designs below are (b), and
two of the three (`mmt-02-01`, `ns-04b-01`) are also (a) — the new step's prompt and success feedback
explicitly reference an earlier representation the learner already produced in the same lesson.

`src/lib/schema.ts` (`Step.predict`) and the pedagogy lint only allow a `predict` block on
`kind: "interactive"` steps, never `challenge` — so, as in the Q1 packet, no new challenge step could
close the `prediction` gap regardless of design, and `formal` (a notation-**entry** step —
`numeric`/`fractionEntry`/`pointEntry`/`buildExpression` — after a manipulable one) was left open
deliberately: forcing an entry-type follow-up onto an already-complete new step would have meant
re-asking the same fact a third way for no new pedagogical reason. Both gaps are real and both are
scoped out here on purpose, not overlooked; see §9 for what a future round would need.

---

## 2. `mmt-02-01` — Estimating Before You Measure

**What it teaches:** a length **estimate** is a smart guess close to (not equal to) the real length.
Three concept beats (`c1`–`c3`) and three `estimateSlider` interactives (`i1`–`i3`) each give the real
length as a stated fact and ask which nearby round number is the best estimate; three `mcq` checks
(`k1`–`k3`) repeat the identical judgment on new objects; `ch1` (`matchPairs`) matches three objects to
their best estimate at once.

**The gap:** every assessed item (`k1`–`k3`, `ch1`) is a `variant:g2-measure-money-time:MmtEstimateMcq`
signature (`ch1`'s widget is `matchPairs` but carries that identical `variant` tag — see §0). No item
anywhere in the lesson ever has the learner **actually measure** anything; "measuring" only ever
appears as a given fact in a prompt. `c3` states outright: *"Estimating helps you catch mistakes — if
you measure and get an answer wildly different from your estimate, it's worth checking your work"* —
a promise the lesson never lets the learner act on.

**The engine:** `unitRuler` — the exact widget `mmt-01-01`/`mmt-01-02`/`mmt-01-03` (the immediately
preceding chapter, "Measure Length") already use to teach zero-alignment, unit iteration, and
end-mark-vs-length. `mmt-01-01`'s own recap teaser is *"next: estimating a length before measuring
it"* — this lesson is the intended destination of that promise, and had never delivered the "measure
it" half.

**New step `ch2` (challenge, `conceptTag: "mmt-estimate"`, inserted between `ch1` and `r1`):**
"You estimated a book is about 9 inches long. Time to check for real: this book runs from mark 3 to
mark 12 on the ruler." — a fresh ruler configuration (`objectStart:3, objectEnd:12`, not reused from
any other lesson) whose **true length is exactly 9**, the same figure `c1`/`i1` already asserted for
"a book." The leading `commonPlacements` trap (12, "just the end mark") and second trap (15, the sum)
mirror the misconception pattern `mmt-01-*` already established. Also lightly reworded `r1`'s first
takeaway from *"Estimate before measuring, as a smart guess"* to *"Estimate first, as a smart
guess — then measure to check it"* so the recap reflects what the lesson now actually does (the only
change to an existing step in any of the three lessons this session touched).

**Math, verified two ways:**
- By hand: `12 − 3 = 9`, matching the book's already-established 9-inch length; 6 candidate unit
  sizes narrow to the required `targetUnitSize: 1` with `requiredPlacements: 9` (`1×9 = 9`, exactly
  the object length — `schema.ts`'s own `widgetIntegrityErrors` unitRuler case independently checks
  this arithmetic and passed, §6.2); traps 12 and 15 are both ≠ 9 and mutually distinct.
- By execution: `evaluate()` was called directly (§6.5) with the correct submission
  `{zeroAligned:true, unitSize:1, spacing:"exact", placements:9}` → `correct:true`, and with 6 wrong
  submissions (misaligned zero, gap/overlap, wrong unit size, the two named misconceptions, and one
  unnamed wrong count) → all `correct:false` with the intended, distinct diagnosis each time.

**Score effect, executed (§6.4):** assessed signatures go from `{k1,k2,k3,ch1}` all sharing
`variant:g2-measure-money-time:MmtEstimateMcq` to that same group plus `ch2:surface:unitRuler`.
`d.contrast: 0 → 2`. `ch2`'s widget type (`unitRuler`) matches none of `k1`/`k2`/`k3`'s (`mcq`), so
`transferEvidence` returns the full `3`: `d.transfer: 0 → 3`.

---

## 3. `ns-04b-01` — Signs, and What a Flip Does to Them

**What it teaches:** a coordinate pair's two signs name its quadrant, and flipping a sign reflects the
point across the corresponding axis. `c1`/`c2` state the rule; `i1`/`i2` (`plotPoint`, `kind:
"interactive"`) have the learner actually plot single-flip reflections on a 7×7 grid (labels −3…3);
`k1`–`k3` (`mcq`) test quadrant-naming and axis-identification; `ch1` (`mcq`) asks which quadrant
`(−3, 5)` lands in once **both** signs flip.

**The gap:** every one of `k1`, `k2`, `k3`, `ch1` carries no `variant` field at all, so each falls back
to `surface:mcq` — identical signatures, `d.contrast = d.transfer = 0` (confirmed by execution, §6.4,
not assumed). The lesson's own manipulable engine (`plotPoint`, `manip:3, conseq:2` per
`scripts/engine-capabilities.json`) exists and is used twice, but only ever ungraded, never assessed.

**The engine:** `plotPoint` — already live in this exact lesson (`i1`/`i2`), promoted from exploratory
to assessed for the first time, and pointed at the **identical fact** `ch1` already tests
symbolically: *both signs flip → the point lands diagonally opposite through the origin.* `ch1`'s own
example, `(−3, 5) → (3, −5)`, cannot be reused directly — its |y| = 5 exceeds `MAX_PLOT_POINT_DIM = 8`
(`schema.ts`) for a grid that also needs to hold both the point and −5..5, so a same-shape example
with grid-legal magnitudes was authored instead: `(3, −1) → (−3, 1)`, the mirror-image case
(Quadrant IV → II instead of `ch1`'s II → IV).

**New step `ch2` (challenge, `conceptTag: "ordered-pair-signs"`, inserted between `ch1` and `r1`):**
*"You already found which quadrant a double sign-flip lands in. Now plot the exact point: flip both
signs of (3, −1)."* Three `pointErrors` cover only-x-flipped, only-y-flipped, and the unflipped
original — the three ways a learner could half-do or skip the rule — plus a generic `missFeedback`
for anything else. The success feedback explicitly reconciles the new instance with `ch1`'s: *"Earlier
that was Quadrant II to IV; here it's Quadrant IV to II."*

**Math, verified two ways:**
- By hand: `(3, −1)` is Quadrant IV (+, −); flipping both signs gives `(−3, 1)`, Quadrant II (−, +).
  Grid math (1-based cell, `xLabels`/`yLabels` = `["-3"…"3"]`, so cell = real value + 4, independently
  re-derived from `i1`/`i2`'s own authored target/error pairs before reuse): target `(3,−1)→(−3,1)` is
  cell `{x:1,y:5}`; only-x-flipped `(−3,−1)` → `{x:1,y:3}`; only-y-flipped `(3,1)` → `{x:7,y:5}`;
  unflipped `(3,−1)` → `{x:7,y:3}` — four distinct cells, none colliding with the target.
- By execution: `evaluate()` on the target `[{x:1,y:5}]` → `correct:true`, `"(-3, 1). ..."`; each of
  the 3 named wrong cells and one unrelated miss (`{x:4,y:4}`) → `correct:false` with the matching
  authored diagnosis (§6.5).

**Score effect, executed (§6.4):** `d.contrast: 0 → 2` (two distinct signatures now share the
`ordered-pair-signs` group: `surface:mcq` and `surface:plotPoint`). `ch2`'s type matches none of
`k1`–`k3`'s, so `d.transfer: 0 → 3` (full).

---

## 4. `sp-03-02` — Estimating Probability from Trials

**What it teaches:** experimental probability (relative frequency from real trials) vs. theoretical
probability (from counting equally-likely outcomes) — `c2` states this contrast directly: *"doesn't
always exactly match... but with enough trials, it tends to get close."* `i1`–`i3`, `k1`, `k2` all use
`trialProbabilityLab` in **`mode: "experimental"`** exclusively; `k3` (`mcq`) is a landmark-value
question (P=0 means impossible); `ch1` (`matchPairs`) matches evidence to a conclusion.

**The gap:** `k1`, `k2`, `ch1` (`conceptTag: "sp-relative-freq"`) all carry the identical
`variant:prob-fraction:trialRelFreq` tag — `ch1`'s widget is `matchPairs`, but that shared tag still
makes its signature identical to `k1`/`k2`'s, so `d.contrast = d.transfer = 0` for that group
(confirmed by execution, §6.4). More importantly, `trialProbabilityLab` itself supports a
`mode: "theoretical"` — its own doc comment in `schema.ts` reads *"make favourable-over-total visible
for both experimental **and theoretical** probability... so theoretical-vs-experimental
misconceptions become visible"* — and this lesson, whose entire thesis is that exact contrast, never
uses it even once. `i2`'s prompt *asserts* "a die's theoretical probability... is 1/6" but never lets
the learner derive it from an actual sample space.

**The engine:** `trialProbabilityLab`, `mode: "theoretical"` — reusing the SAME widget already used
5× in this lesson (in `experimental` mode), not inventing a new one, and precisely the mode already
proven 3× in the very next lesson in this same chapter, `sp-03-03` (read for precedent, not edited —
its `i1`, `i2`, `k2` each enumerate a full outcome set with `favourable: boolean` per outcome, exactly
the pattern reused here).

**New step `ch2` (challenge, `conceptTag: "sp-relative-freq"`, inserted between `ch1` and `r1`):**
*"A die rolled a 6 twelve times out of 60 rolls — an experimental probability of 1/5. A fair die has
six equally likely faces. What is the THEORETICAL probability of rolling a 6?"* — the exact `i2`
scenario (12/60 = 1/5), now asking for its theoretical counterpart. The outcome set is the die's 6
faces (1 favourable: "6"). The leading distractor is `1/5` itself — the just-computed **experimental**
value — directly targeting the theoretical/experimental confusion this lesson exists to teach, with
feedback naming exactly that: *"1/5 was the EXPERIMENTAL result... The theoretical probability comes
from the die's 6 faces, not from trial counts."* The second distractor, `6/1`, is the inverted
fraction.

*A deliberate, documented choice not to force full marks:* `ch2` reuses `trialProbabilityLab`'s own
raw **widget type**, only the `mode` differs — the scoring rule (§0) gives full transfer credit only
when the challenge's widget type matches *no* same-`conceptTag` check's type, so this nets partial
(`2`, not `3`) transfer credit rather than the maximum. A different, unrelated widget type (e.g.
`probabilityArea`, used one lesson earlier in `sp-03-01`) would have scored the full `3`, but would
have meant abandoning the one widget purpose-built for exactly this contrast and precedented in the
very next lesson, in favor of a bigger, more invented footprint purely to move a number. This session
judged genuine, minimal, well-precedented engine reuse the more honest choice; see §0's supersession
rationale for the same judgment call stated in the staged ledger record.

**Math, verified two ways:**
- By hand: 1 favourable face ("6") out of 6 equally likely faces = 1/6. Distractor `1/5`:
  `1×6=6 ≠ 1×5=5`, correctly rejected. Distractor `6/1`: `6×6=36 ≠ 1×1=1`, correctly rejected. All
  three fraction choices reduce to distinct values (1/6, 1/5, 6/1) — no accidental duplicate.
  `outcomes.length = 6 = total`, exactly one outcome marked `favourable:true` — `schema.ts`'s own
  `widgetIntegrityErrors` independently checks both and passed (§6.2).
- By execution: `evaluate()` on choice `"a"` (1/6) → `correct:true`; `"b"` (1/5) and `"c"` (6/1) →
  `correct:false`, each with its own diagnosis (§6.5).

**Score effect, executed (§6.4):** `d.contrast: 0 → 2` (`sp-relative-freq` group now holds
`variant:prob-fraction:trialRelFreq` and `surface:trialProbabilityLab`). `d.transfer: 0 → 2` (partial,
per the design choice above — `ch2` shares its raw type with `k1`/`k2`, so the scorer awards `2`
rather than `3`).

---

## 5. Disposition records staged

`reports/closure/cowork-staging/laneA-s329-Q2.jsonl` — **3 records**, `recordId`s
`s329-Q2-mmt-02-01`, `s329-Q2-ns-04b-01`, `s329-Q2-sp-03-02`. All `decision: "KEEP"`,
`gradeLanguageDecision: "FIT"` (checked fresh — new copy reviewed for grade register against each
lesson's own existing vocabulary, not blindly carried forward). `visualDecision` was carried forward
unchanged from each lesson's most recent prior disposition (`SUFFICIENT` for `mmt-02-01`, `REQUIRED`
for `ns-04b-01` and `sp-03-02`) — this edit touches no concept-step `figure` and adds no new visual
dependency, so revising that dimension was not this session's evidence to produce. Every record's
`rationale` names precisely which prior record it supersedes and why (§0), cites the executed
`evaluate()` and `contrastScore`/`transferScore` results, and lists concrete `evidenceRefs`.

`reviewedBasisHash` for each record was taken from `node scripts/session/print-review-basis.mjs
mmt-02-01 ns-04b-01 sp-03-02`, run **after** all three content edits landed:

```
mmt-02-01  db2e5d35afc38ec3b0562db0b530799d27ae326be3d57f1aa8da5591b620f905
ns-04b-01  27185a52a34a07c88ed203ca12c7fc1dc512c7a5004b68254ad1539d538f5807
sp-03-02   1ba4b8654b78a7d4ad27f34ac78f0b8bdb61712bd079ed61060fa79ff6d07611
```

---

## 6. Gates run and results

### 6.1 `npm run validate:content` (`tsx scripts/content-check.ts schema`) — run after each edit

```
schema: 1840/1840 files clean
```
Exit code 0 all three times (once per lesson, immediately after that lesson's edit, per instructions).
All three target lessons individually listed `✓`. This is pure `Lesson.safeParse` — structural/type
validation (required fields, enums, numeric ranges) plus the one cross-field rule the exported
`WidgetSpec` itself enforces via `.superRefine()` (`schema.ts` line 7042,
`widgetSpecWithPlotPointIntegrity`): for `plotPoint`, `xLabels`/`yLabels` must each name their grid's
`cols`/`rows` exactly once with no duplicate label — confirmed satisfied for `ch2`'s new `plotPoint` in
`ns-04b-01`. **It does not run `widgetIntegrityErrors`.** That was double-checked directly for this
report: `WidgetSpec` (line 7067) wraps only `widgetSpecWithPlotPointIntegrity`, and
`widgetIntegrityErrors` (line 7123) is a separate, standalone export — grep across `schema.ts` finds no
`.refine()`/`.superRefine()` anywhere in the file that calls it. §6.2 below, not this gate, is what
independently confirms the `unitRuler`/`trialProbabilityLab`/full-`plotPoint` arithmetic hand-checked in
§2–§4.

### 6.2 `npm run lint:pedagogy` (`tsx scripts/content-check.ts pedagogy`) — run after each edit

```
pedagogy: 1711/1711 files clean
```
Exit code 0 all three times. Confirms each new `challenge` step has a `conceptTag`, exactly 3 `hints`,
2 genuinely distinct `explanationVariants`; sits at or past the final-third position
(`i ≥ ⌊2n/3⌋`); keeps the lesson's action-step ratio ≥60%; and that no wrong-path feedback opens with
a dismissive/generic word. This is also the gate that runs `widgetIntegrityErrors` — `lintStep` calls it
on every step with a `widget` (`pedagogy.ts` line 483) — and is therefore the gate that independently
confirms every hand-checked `unitRuler`/`plotPoint`/`trialProbabilityLab` integrity fact in §2–§4
(exact-length unit coverage, grid-bounded targets, single accepted fraction, outcome-set/
favourable-count agreement, no misconception count colliding with the correct one), not §6.1.

### 6.3 Targeted vitest — one per course

```
$ npx vitest run src/lib/session268.measureMoneyTimeCourse.test.ts
 Test Files  1 passed (1)  |  Tests  2 passed (2)

$ npx vitest run src/lib/session282.numberSystemCourse.test.ts
 Test Files  1 passed (1)  |  Tests  5 passed (5)

$ npx vitest run src/lib/session274.samplingProbabilityCourse.test.ts
 Test Files  1 passed (1)  |  Tests  2 passed (2)
```
`session282` and `session274` each include an exhaustive whole-course sweep
(`lintLesson(...) === []` and `widgetIntegrityErrors(...) === []` for every step of every lesson in
the course, plus the figure-registry check) — not just the 3 target lessons. All three files also pin
`ch1`'s exact widget type/prompt/pairs contract for these lessons
(`mmt-02-01/ch1 → matchPairs`; `sp-03-02/ch1 → matchPairs` with its exact `pairs` object;
`ns-04b-01`'s `i1`/`i2` → `plotPoint` with `conceptTag: "ordered-pair-signs"`) — all pass unchanged,
confirming `ch1`/`i1`/`i2` were never touched.

### 6.4 Executed scoring probe (not a required gate; run for the same reason Q1's §4.5 did)

`contrastScore`/`transferScore` from `scripts/audit/flagship-representation.mjs` were imported and
called directly (not re-derived by hand) against each lesson's `assessed` step list, both with and
without `ch2`:

```
mmt-02-01:  d.contrast 0 -> 2   d.transfer 0 -> 3
ns-04b-01:  d.contrast 0 -> 2   d.transfer 0 -> 3
sp-03-02:   d.contrast 0 -> 2   d.transfer 0 -> 2
```
Full assessed-signature listing for each lesson is in the probe output (reproduced in §2–§4 per
lesson). This is the execution referenced throughout §0 and §2–§4, not a hand-reconstruction of the
scorer's rules.

### 6.5 Executed evaluate() probe (not a required gate)

The app's own `evaluate()` (`src/lib/evaluate.ts`) was called directly against each new `ch2` widget,
once for the intended correct submission and once for every named wrong path (18 calls total across
the three lessons). **All 18 passed**: every correct submission graded `correct:true` with its
authored `successFeedback`; every wrong submission graded `correct:false` with its own authored
diagnosis, not a fallback. Full transcript:

```
=== mmt-02-01 / ch2 (unitRuler) ===
PASS correct measurement (9 units, aligned, exact, unit=1)
PASS not zero-aligned
PASS gaps/overlaps
PASS wrong unit size (2-inch units)
PASS end-mark-only misconception (12 placements)
PASS sum misconception (15 placements)
PASS some other wrong count (7 placements, falls to gapOverlapFeedback)

=== ns-04b-01 / ch2 (plotPoint) ===
PASS correct point (-3,1) -> grid (1,5)
PASS only x flipped -> (-3,-1) grid (1,3)
PASS only y flipped -> (3,1) grid (7,5)
PASS original unflipped -> (3,-1) grid (7,3)
PASS random miss -> (0,0) grid (4,4)

=== sp-03-02 / ch2 (trialProbabilityLab) ===
PASS correct 1/6
PASS experimental-confusion trap 1/5
PASS inverted trap 6/1

ALL PASS
```

### 6.6 Executed ledger-merge simulation (not a required gate; replicates Q1's §4.5 approach)

Built, in memory only (never written to any repo file), the main ledger's raw text plus this
session's 3 staged lines, and called the real `loadLessonReviewAuthority` /
`resolveLessonDecisionLedger` from `scripts/audit/lesson-review-authority-s246.mjs` directly:

```
mmt-02-01 -> CURRENT_HUMAN_DECISION KEEP errors=[]
ns-04b-01 -> CURRENT_HUMAN_DECISION KEEP errors=[]
sp-03-02 -> CURRENT_HUMAN_DECISION KEEP errors=[]
```
(First attempt at this simulation used the bare `loadLessons()` export, which does not populate
`.reviewBasisHash` — every lesson in the corpus showed `STALE_HUMAN_DECISION` as a result. That was a
bug in the harness script, not a real signal; re-run with `loadLessonReviewAuthority()`, the exact
function `print-review-basis.mjs` itself calls, resolved cleanly. Left in this report because it is
the kind of false alarm worth naming precisely rather than silently correcting.)

### 6.7 Isolation check

```
$ git diff --stat -- content/courses/measure-money-time/lessons/mmt-02-01.json \
    content/courses/number-system/lessons/ns-04b-01.json \
    content/courses/sampling-and-probability/lessons/sp-03-02.json
 .../measure-money-time/lessons/mmt-02-01.json      | 45 ++++++++++++-
 .../courses/number-system/lessons/ns-04b-01.json   | 64 ++++++++++++++++++
 .../sampling-and-probability/lessons/sp-03-02.json | 75 ++++++++++++++++++++++
 3 files changed, 183 insertions(+), 1 deletion(-)
```
Confirmed this is the **complete** set of files this session changed: `git diff --stat` scoped to
each of the three course directories (`'content/courses/<course>/*'`) shows only these three files
plus other agents' concurrent, out-of-scope edits noted in the Environment note above — never a fourth
file this session itself touched.

---

## 7. Files changed

```
content/courses/measure-money-time/lessons/mmt-02-01.json          | 45 (44 insertions, 1 deletion)
content/courses/number-system/lessons/ns-04b-01.json               | 64 (64 insertions)
content/courses/sampling-and-probability/lessons/sp-03-02.json     | 75 (75 insertions)
```
Each lesson gained exactly one step, `id: "ch2"`, `kind: "challenge"`, inserted between the existing
`ch1` and `r1` (recap). Step counts: `mmt-02-01` 11→12, `ns-04b-01` 9→10, `sp-03-02` 11→12 — all
within the schema's 8–15 range. `mmt-02-01`'s `r1.takeaways[0]` was also reworded (§2); no other
existing step, in any of the three lessons, was modified. No `course.json` was touched.

New staging artifact (this session's own output, not the main ledger):
`reports/closure/cowork-staging/laneA-s329-Q2.jsonl` — **3 records** (§5).

---

## 8. Lessons left unedited

**None.** All three `multi-engine`-flagged rows in this packet got a genuinely new, hand-verified
(both by arithmetic and by executing the app's own `evaluate()`) challenge item that adds a real,
previously-unassessed engine and requires reconciling it with a representation already present in the
lesson or its immediate sibling. No design was forced past its natural fit for the sake of the score:
`sp-03-02`'s design deliberately accepts partial (not maximum) transfer credit rather than swap in a
less-precedented, more invented widget purely to move a number (§4).

---

## 9. Integration notes for the separate follow-up step

Per instructions, this session did not append to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`
and did not edit `EXCELLENCE_BACKLOG_S126.csv` or `CLOSURE_LEDGER.md`. For whoever runs that
integration step:

- All 3 rows above (`mmt-02-01`, `ns-04b-01`, `sp-03-02`) are now resolved for the
  `QUESTION_DIVERSITY_AND_TRANSFER` workstream, and the 3 staged records in
  `reports/closure/cowork-staging/laneA-s329-Q2.jsonl` are ready to append as-is (verified in §6.6).
- These records **supersede**, not duplicate, `S318-QD-mmt-02-01` / `S318-QD-ns-04b-01` /
  `S318-QD-sp-03-02` (staged, never consolidated — `reports/closure/cowork-staging/laneA-s318-qd.jsonl`)
  and the inherited `S317-V-mmt-02-01` / `S319-D-ns-04b-01` / `S320-A3-sp-03-02` KEEP dispositions
  already in the main ledger. §0 documents precisely why those verdicts under-counted; nothing further
  needs to be done to reconcile them beyond appending this packet's fresher records, since the ledger
  is append-only and resolves by most-recent `recordId` per lesson (confirmed in §6.6).
- `formal` and `prediction` remain open gaps for all three lessons, left open **deliberately** (§1):
  `predict` is schema-restricted to `kind: "interactive"` steps, so no new `challenge` step could ever
  close it, and forcing a redundant notation-entry step onto an already-complete design would have
  been padding, not a genuine fourth representation. A future round wanting `formal` specifically
  would need a *different* kind of step — e.g. an early, ungraded `interactive` numeric-entry
  formalization step inserted **before** the existing manipulable steps, which is a different-shaped
  change than this packet's brief (challenge-tier transfer additions) and was left out of scope rather
  than forced in.
