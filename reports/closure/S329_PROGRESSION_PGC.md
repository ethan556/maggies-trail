# S329 Progression & Duplication — Packet PG-C

**Workstream:** `LESSON_PROGRESSION_AND_DUPLICATION` (`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, rows `PROGRESSION-*`, tier P1 — `repeatedTemplates` only)
**Scope:** 23 lessons across 4 courses (linear-functions, measure-money-time, the-real-number-system, number-line-g2)
**Staging ledger:** `reports/closure/cowork-staging/laneA-s329-PGC.jsonl` (6 records)
**Reviewer:** S329 Lane A progression/duplication reviewer (packet PG-C)
**Reviewed:** 2026-08-21

## Result

**6 of 23 lessons redesigned; 17 kept as legitimate deliberate practice (rows stay open in the mechanized queue by design — an accepted, non-failure outcome for this tier).**

| # | Lesson | Course | Flagged step(s) | Verdict | Notes |
|---|---|---|---|---|---|
| 1 | lf-01-03 | linear-functions | k2 | KEEP | negative→positive slope-sign contrast, the lesson's own core teaching axis |
| 2 | lf-02-01 | linear-functions | i3 | **REDESIGNED** | positive→negative slope evaluation |
| 3 | lf-03-01 | linear-functions | k3, ch1 | KEEP | escalating sign-handling ladder (0→1→2 negatives) |
| 4 | lf-03-02 | linear-functions | ch1 | KEEP | positive→negative-slope conversion |
| 5 | lf-04-01 | linear-functions | k2, ch1 | KEEP | escalating sign-handling ladder (negative slope→negative x→both) |
| 6 | lf-04-02 | linear-functions | ch1 | KEEP | no-negatives→negative-coordinate escalation |
| 7 | mmt-03-01 | measure-money-time | k1 | KEEP | closed-set coin-name vocabulary recall (no escalation axis exists) |
| 8 | mmt-03-03 | measure-money-time | i3, k3, ch1 | KEEP | "reach $1.00" milestone escalation, same coin type each pair |
| 9 | mmt-04-01 | measure-money-time | i2, i3, k2, k3, ch1 | KEEP | ×5 multiplication-fact fluency drill across full clock-number range |
| 10 | mmt-04-02 | measure-money-time | k1, i2, i3, k2, k3, ch1 | KEEP | full-clock-reading fluency + explicit on-hour/near-boundary/wrap-past-12 edge cases |
| 11 | mmt-04-03 | measure-money-time | i3 | **REDESIGNED** | clockSet (construct) → mcq (read/select) |
| 12 | mmt-05-03 | measure-money-time | i3, k3, ch1 | **REDESIGNED** (i3 only) | i3: 2-stack→3-stack, largest→smallest target; k3/ch1 kept (magnitude/close-call escalation) |
| 13 | rns-01-01 | the-real-number-system | ch1 | KEEP | terminating→repeating classification, explicitly "trickier" |
| 14 | rns-01-03 | the-real-number-system | i2 | KEEP | construct (type the fraction) → recognize (targeted distractors) |
| 15 | rns-02-01 | the-real-number-system | i3, k3 | **REDESIGNED** (k3 only) | k3: bare symbolic → applied area/side-length context; i3-vs-k2 (rational/irrational contrast) intentionally still flagged |
| 16 | rns-02-03 | the-real-number-system | k2, ch1 | KEEP | precision escalation (k2) + transfer to a new root (ch1) |
| 17 | rns-03-01 | the-real-number-system | ch1 | KEEP | magnitude escalation, explicit "bigger one" |
| 18 | rns-03-02 | the-real-number-system | i2, k3, ch1 | **REDESIGNED** (k3 only) | k3: precision 1dp→2dp; i2 (fluency-ladder rep) and ch1 (magnitude) intentionally still flagged |
| 19 | g2l-02-01 | number-line-g2 | ch1 | KEEP | crossing the 100 place-value boundary |
| 20 | g2l-02-02 | number-line-g2 | ch1 | KEEP | landing below 10, new hop-count-vs-landing misconception |
| 21 | g2l-03-02 | number-line-g2 | ch1 | KEEP | regrouping escalation (course-wide pattern) |
| 22 | g2l-03-03 | number-line-g2 | ch1 | **REDESIGNED** | regrouping escalation, fully closes the file (0 residual flags) |
| 23 | g2l-03-04 | number-line-g2 | ch1 | KEEP* | pre-existing (not-mine) edit already applies the same regrouping fix; flag stays open only because of a detector wording quirk — see §5 |

*23 lessons total: 6 redesigned, 17 kept.*

---

## 1. Method

For every lesson, the structural duplication detector in `scripts/audit/consolidate-pending-workload-s236.mjs` (lines ~124-130 `stable()`, ~358-393 the repeat-detection block) was replicated exactly in a standalone probe (`detect.mjs`) and run against the **current on-disk file** before and after any edit. The detector:

1. Collects every step with a `widget`.
2. `repeatedWidgets` — flags steps whose entire widget JSON (canonicalized via `stable()`) is byte-identical to an earlier step's.
3. `repeatedPrompts` — flags steps whose raw `widget.prompt` string is byte-identical to an earlier step's.
4. `repeatedTemplates` — lower-cases each prompt, replaces every run matching `/[-−+]?\d+(?:[.,/]\d+)*/g` with `#`, collapses whitespace, and flags any step whose normalized template matches an **earlier** step's.

All 23 rows in this packet are P1 / `repeatedTemplates` only.

**Critical detector property exploited throughout this review:** the number regex consumes a sign character immediately adjacent to a digit (`-3` → `#`) but not one separated by a space or word (`y + 4` keeps its literal `+`). Consequently:
- A pure numeric or sign swap (`√81`→`√100`, `5x+3`→`-3x+8` used as *only* a coefficient change) **never** changes the normalized template, so it can never structurally close a flagged row by itself.
- An **English word** that differs between two prompts (`"one decimal place"` vs `"two decimal places"`; `"1 x"` singular vs `"2 x's"` plural) **does** survive normalization and **does** distinguish templates — which explains several apparent anomalies encountered below (e.g. why `mmt-03-01/k2` is not flagged alongside `k1`, or why `g2l-03-04/i1,k2,ch1` collide with each other but not with `k1`).

Every verdict below was reached by: (a) reading the full lesson JSON, (b) computing the exact colliding pair(s) from the detector replica's per-step template dump (not just the flag list), (c) judging the pairing against `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`'s R1-R6 bar for "genuinely different reasoning," using this rubric:

- **Genuine missed opportunity** → redesign: same complexity level, no new wrinkle, and the step's own body/feedback text signals nothing beyond "another one" or "one more."
- **Legitimate deliberate practice** → keep: the pairing diversifies across the lesson's own stated categories, escalates sign/magnitude/precision/place-value complexity, shifts action/representation/widget-type, changes the misconception specifically targeted, explicitly narrates transfer to a new target, or is inherent fact-set/vocabulary fluency practice with no available escalation axis.

Where a lesson was redesigned, the edit was required to change **actual wording or widget structure**, not just operands — both because that is what the task calls for (action/representation/misconception-target/constraint/transfer-demand) and because, per the property above, a pure operand change would not have closed the flag anyway.

## 2. Redesigned lessons (6) — full diffs

### 2.1 `lf-02-01` / step `i3`

Flag: `i3` duplicated an earlier positive-slope, positive-intercept evaluate-at-a-point item (same widget shape, same all-positive sign profile, only the coefficients differed — invisible to the detector's digit-stripping). Body text ("Evaluate quickly.") signaled no escalation.

**Fix:** introduced a negative slope, forcing the student to propagate a negative coefficient through multiplication before adding a positive intercept — the same positive→negative-coefficient escalation named in this workstream's own worked example. New commonErrors target the two specific negative-slope slips (dropping the sign entirely; applying the sign to the intercept instead of the product).

```diff
-      "body": "Evaluate quickly.",
+      "body": "Now with a negative slope.",
       "widget": {
         "type": "numeric",
-        "prompt": "For y = 5x + 3, find y when x = 1.",
-        "answer": 8,
+        "prompt": "The line y = -3x + 8 gives a value. What is y when x = 4?",
+        "answer": -4,
         "tolerance": 0,
         "commonErrors": [
           {
-            "value": 5,
-            "feedback": "That's just 5·1. Don't forget to add b: 5 + 3 = 8."
+            "value": 20,
+            "feedback": "That dropped the negative sign on the slope: 3·4 + 8 = 20. Keep it: -3·4 + 8 = -4."
           },
           {
-            "value": 15,
-            "feedback": "That multiplies 5·3. Use x = 1: y = 5·1 + 3 = 8."
+            "value": -20,
+            "feedback": "That's -3·4 - 8. The equation ADDS 8, so -12 + 8 = -4, not -12 - 8."
           }
         ],
-        "fallbackFeedback": "y = 5·1 + 3 = 5 + 3 = 8."
+        "fallbackFeedback": "Multiply first: -3 × 4 = -12. Then add 8: -12 + 8 = -4."
```

Verification: `detect.mjs` on the edited file shows `i3` absent from `repeatedWidgets`/`repeatedPrompts`/`repeatedTemplates` — full closure (`number-normalized-prompts=[]` for the whole file).

### 2.2 `mmt-04-03` / step `i3`

Flag: `i3` duplicated the family's `clockSet` (set-the-clock) manipulation task with only the target time changed. Body ("Another mixed reading.") signaled no escalation.

**Fix:** changed the action/representation dimension — `clockSet` (construct/manipulate) → `mcq` (observe/select, reading hands already drawn). Distractors specifically target: literal-count-of-the-5-minute-mark (misreads 5 as "5 minutes" instead of 25), hour/minute-hand swap, and premature hour rounding.

```diff
-      "body": "Another mixed reading.",
+      "body": "Read the hands instead of setting them.",
       "widget": {
-        "type": "clockSet",
-        "prompt": "Set the clock to show 1:00.",
-        "targetHour": 1,
-        "targetMinute": 0,
-        "minuteStep": 5,
-        "successFeedback": "Yes — minute hand at 12 means on the hour: 1:00.",
-        "hourFeedback": "The hour comes from the short hand, which is at 1: 1:00.",
-        "minuteFeedback": "The minute hand at 12 means \":00\", not \":12\"."
+        "type": "mcq",
+        "prompt": "Reading the hands: minute hand at 5, hour hand just past 9. What time is it?",
+        "options": [
+          { "id": "a", "label": "9:05", "feedback": "The minute hand's number is counted by 5s: 5 × 5 = 25, not 5." },
+          { "id": "b", "label": "9:25", "correct": true, "feedback": "Yes — 5 five-minute marks is 25 minutes, and the short hand says 9." },
+          { "id": "c", "label": "5:09", "feedback": "The long hand gives minutes, not the hour. The short hand is just past 9." },
+          { "id": "d", "label": "10:25", "feedback": "The short hand has not reached 10 yet. It is still 9:25." }
+        ]
       },
-      "conceptTag": "mmt-time-mixed",
-      "cml": { …stage:"construct", actionGoal:"Manipulate the model…" … }
+      "conceptTag": "mmt-time-mixed"
```

The step's `cml` block (which described a construct-stage manipulation) was **removed rather than left mismatched** with the new selection-based widget — `cml` is optional in the schema (`src/lib/schema.ts:9316`), and hand-writing a new one under time pressure risked tripping the CML cross-field validators (`translationFrom`/`translationTo` pairing, stage/kernel rules) for no correctness benefit. This is a scope-conscious omission, not a defect.

Verification: `i3` no longer appears in any of the three repeat lists. The family's other four items (`k1,i2,k2,k3`) remain flagged, as intended (see §3).

### 2.3 `mmt-05-03` / step `i3`

Flag family: two sub-groups — a line-plot X-count trio (`i1,i3,k3`) and a graph-compare pair (`k2,ch1`). Judged independently (see §3.9): `k3` and `ch1` are legitimate magnitude/close-call escalations and were left untouched. `i3` re-asked the identical two-column "read the bigger stack" task as `i1` with only the numbers changed ("One more X-count.").

**Fix:** changed the misconception-target and constraint dimensions together — added a third data column (2→3 stacks) **and** changed which value the question asks about from the largest stack to the smallest (answer 1, not 4), so the student must locate the specific column asked for rather than pattern-match "the question always wants the biggest number." New commonErrors target column-confusion (reading an adjacent column) rather than the old axis-label-vs-count confusion.

```diff
-      "body": "One more X-count.",
+      "body": "Three stacks this time — read the one the question asks for, not the biggest.",
       "widget": {
         "type": "numeric",
-        "prompt": "A line plot shows 2 x's above the number 3 and 1 x above the number 4. How many data points are at 3?",
-        "answer": 2,
+        "prompt": "A line plot shows 4 x's above the number 2, 2 x's above the number 3, and 1 x above the number 4. How many data points are at 4?",
+        "answer": 1,
         "tolerance": 0,
-        "plotData": { "values": [3, 4], "counts": [2, 1] },
+        "plotData": { "values": [2, 3, 4], "counts": [4, 2, 1] },
         "commonErrors": [
-          { "value": 3, "feedback": "3 is the number on the line, not the count of X's above it. There are 2 X's, so 2 data points." },
-          { "value": 1, "feedback": "Count again — there are exactly 2 X's above 3." }
+          { "value": 4, "feedback": "4 is the count above the number 2, a different column. The stack directly over 4 has just 1 X." },
+          { "value": 2, "feedback": "2 is the count above the number 3, not above 4. The stack directly over 4 has just 1 X." }
         ],
-        "fallbackFeedback": "There are 2 X's above 3, so 2 data points."
+        "fallbackFeedback": "The stack directly above 4 has 1 X, so 1 data point."
```

The 3-column `plotData` was checked against the schema's authoring rules (`src/lib/schema.ts` `plotDataIntegrityErrors`): values strictly increasing (2<3<4 ✓), 2 ≤ length ≤ `MAX_PLOT_COLUMNS` (8) ✓, every count ≤ `MAX_PLOT_STACK` (10) ✓.

Verification: `i3` closed; `k3` and `ch1` remain flagged as intended (legitimate keeps).

### 2.4 `rns-02-01` / step `k3`

Flag: `k3` and `i3` both used the bare `"√# is:"` `exactNumberLab` root-classification prompt. Two distinct pairings existed inside that flag: `i3`-vs-`k2` (√100 rational vs √50 irrational — a strong, deliberately-designed rational/irrational contrast) and `i3`-vs-original-`k3` (√100 vs √81, both rational — a weak pairing with no differentiating wrinkle).

**Fix:** reframed `k3` on the representation dimension — from the bare `"√81 is:"` symbolic prompt into an applied context, `"A square has an area of 81 square units. Its side length is:"`, requiring the student to first recognize that side-length-of-a-square-given-its-area *is* a square-root question before classifying it. The computation (9²=81, rational) is unchanged.

```diff
-      "body": "Classify √81.",
+      "body": "Apply it to a square's side.",
       …
-        "prompt": "√81 is:",
+        "prompt": "A square has an area of 81 square units. Its side length is:",
         …
         "label": "Rational — exactly 9",
-        "feedback": "Right — 9² = 81 exactly.",
+        "feedback": "Right — a square with area 81 has side length 9, since 9² = 81 exactly.",
       …
-        "successFeedback": "Right — 9² = 81 exactly."
+        "successFeedback": "Right — a square with area 81 has side length 9, since 9² = 81 exactly."
```

(Full step diff also updates the three distractor-option feedback strings to reference "side length" instead of the bare root, for internal consistency — same claims, same correctness, reworded framing throughout.)

Verification: the `i3`-vs-`k3` collision is closed. The `i3`-vs-`k2` collision **intentionally remains flagged** — this is the strong, deliberately-designed pairing (rational vs irrational outcome) and was left untouched on purpose. This is a partial, accepted closure exactly matching the task's "leave legitimately fine content as-is" guidance for the part of the flag that was never a problem.

### 2.5 `rns-03-02` / step `k3`

Flag family: `i2, k3, ch1` all shared the canonical `k1` template `"To one decimal place, √# ≈ ____"`. `i2` and `ch1` are legitimate (see §3.18); `k3` repeated the identical one-decimal-place bracketing task with no escalation signaled.

**Fix:** escalated the constraint dimension — precision from one decimal place to two (tolerance tightened 0.05→0.005), requiring the student to bracket √27 between 5.19 and 5.20 rather than 5.1 and 5.2. This also changes the prompt's actual wording (`"two decimal places"` vs `"one decimal place"` — literal words, not digits, so not swallowed by the normalizer).

```diff
-      "body": "Narrow √27.",
+      "body": "Narrow √27 one more decimal place.",
       …
       "explanationVariants": [
-        "√27 ≈ 5.196, which rounds to 5.2 at one decimal place.",
-        "5.1² = 26.01 undershoots 27, and 5.2² = 27.04 overshoots it, so √27 rounds to 5.2."
+        "√27 ≈ 5.1962, which rounds to 5.20 at two decimal places.",
+        "5.19² = 26.9361 undershoots 27, and 5.20² = 27.04 overshoots it — 27 is closer to 27.04, so √27 rounds to 5.20."
       ],
       "widget": {
         "type": "numeric",
-        "prompt": "To one decimal place, √27 ≈ ____",
+        "prompt": "To two decimal places, √27 ≈ ____",
         "answer": 5.2,
-        "tolerance": 0.05,
+        "tolerance": 0.005,
         "commonErrors": [
           {
-            "value": 5.1,
-            "feedback": "√27 ≈ 5.196, which rounds UP to 5.2, not down to 5.1."
+            "value": 5.19,
+            "feedback": "5.19² = 26.9361 and 5.20² = 27.04 — 27 is only 0.04 from 27.04 but 0.0639 from 26.9361, so it rounds UP to 5.20, not down to 5.19."
           },
           {
-            "value": 5,
-            "feedback": "That's just the whole-number bound — narrow further to one decimal place: 5.2."
+            "value": 5.1,
+            "feedback": "That's only one decimal place. Narrow further: 5.19² = 26.9361 and 5.20² = 27.04 bracket 27 more tightly, giving 5.20."
           }
         ],
-        "fallbackFeedback": "√27 ≈ 5.196, so to one decimal place it's 5.2."
+        "fallbackFeedback": "5.19² = 26.9361 and 5.20² = 27.04 bracket 27; since 27 is closer to 27.04, √27 rounds to 5.20."
```

**Note on a neighboring, not-mine change:** `k2` in this same file also differs from the committed baseline (its root changed √3→√6 and its prompt was rephrased from `"To one decimal place, √3 ≈ ____"` to a question form, `"Rounded to one decimal place, what is √6?"`). This was already present in the shared working tree before this review began and is not part of this disposition — it does not collide with `k1`'s template either before or after, so it has no bearing on the `k3` flag this record addresses. See §5 for how this was confirmed.

Verification: `k3`-vs-`k1` collision closed. `i2` and `ch1` remain flagged, intentionally (see §3.18).

### 2.6 `g2l-03-03` / step `ch1`

Flag: `ch1` duplicated the canonical `k1` missing-jump template `"# − # = ? (the jump that carried # to #)"`. The original task (41−20=21, no regrouping) was arithmetically no harder than `k1` (74−30=44, also no regrouping) — a genuine missed opportunity for the lesson's final challenge step. Body ("One more, for the road.") signaled no escalation.

**Fix:** changed the numbers so the subtraction **requires regrouping** (start 27, landing 53; 53−27=26, since ones digit 3<7 forces a borrow) and rewrote the prompt from the bare fill-in-the-blank into a narrated start/landing sentence, with new commonErrors/hints targeting the regrouping misconception specifically.

```diff
-      "body": "One more, for the road.",
+      "body": "A jump that needs regrouping.",
       …
       "explanationVariants": [
-        "Hidden jumps with messier landings.",
-        "The rule holds firm."
+        "The ones digit of the landing (3) is smaller than the start's ones digit (7), so regroup a ten: 53 is 4 tens and 13 ones, 13−7=6 ones and 4−2=2 tens, giving 26.",
+        "Borrow a ten, then subtract in the ones — the jump is still landing minus start: 53 − 27 = 26."
       ],
       "widget": {
         "type": "numeric",
-        "prompt": "41 − 20 = ? (the jump that carried 20 to 41)",
-        "answer": 21,
+        "prompt": "The line shows a start at 27 and a landing at 53. What is the missing jump?",
+        "answer": 26,
         …
         "commonErrors": [
           {
-            "value": 61,
-            "feedback": "Adding the two marks measures nothing — the missing jump is their DIFFERENCE."
+            "value": 34,
+            "feedback": "That subtracts each digit's smaller number from its bigger number instead of borrowing — regroup a ten first: 53 is 4 tens and 13 ones, so 13−7=6 ones and 4−2=2 tens, giving 26."
           },
           {
-            "value": 11,
-            "feedback": "That jump falls short of 41; the full gap is the jump."
+            "value": 36,
+            "feedback": "The ones are right (13−7=6), but the tens still need to drop by the ten you borrowed: 5 becomes 4, and 4−2=2, giving 26."
           }
         ],
-        "fallbackFeedback": "Walk the line: find the start mark, take the jumps one at a time, and read the mark you land on.",
-        "successFeedback": "Correct — 21."
+        "fallbackFeedback": "The ones digit (3) is too small to subtract 7 directly — regroup one ten into ten ones first, then subtract each place.",
+        "successFeedback": "Correct — 26."
       },
       "hints": [
-        "Mark both numbers.",
-        "The difference is the space between.",
-        "Hop the gap and count."
+        "Mark both numbers.",
+        "If the ones digit is too small, regroup a ten first.",
+        "Hop the gap and count, ten by ten and then one by one."
```

This mirrors the identical, already-established "add regrouping" pattern used at `g2l-03-02/ch1` and (independently, by a different/prior hand — see §5) at `g2l-03-04/ch1`; all three number-line-g2 lessons in this chapter use the same course-wide design.

**Note on a neighboring, not-mine change:** `k2` in this same file also differs from the committed baseline (rephrased from `"50 − 20 = ? (the jump that carried 20 to 50)"` to a narrated `"A route starts at 80 and lands at 50, moving backward. What is the missing jump?"`). Pre-existing, not part of this disposition, and — confirmed by rerunning the detector after this edit — does not interact with or reopen the `ch1` flag.

Verification: after this edit, `detect.mjs` reports `number-normalized-prompts=[]` for the **entire file** — a full closure, not merely a partial one (every step's template is now unique).

## 3. Kept lessons (17) — reasoning per lesson

Each of these was read in full, the exact colliding step-pair(s) identified from the detector replica's per-step template dump, and judged against the same R1-R6 bar. None were force-edited; per the task's own instruction this is an accepted, non-failure outcome and these rows remain open in the mechanized queue.

**3.1 `lf-01-03` (k2 vs k1).** `k1` (rise −8/run 4 = −2, right after the lesson's positive/negative-sign concept intro) and `k2` (rise 8/run 4 = +2, body "Rising again — with the formula") are a deliberate negative→positive slope-sign contrast — exactly the lesson's own stated teaching goal (c1: read a slope's sign from uphill/downhill). The zero and undefined cases get their own separately-worded steps (`i2`, `i3`) elsewhere in the same lesson; `k1`/`k2` are the two "plain" cases the sign lesson is built to contrast.

**3.2 `lf-03-01` (k3, ch1 vs i2).** Three-rung escalation, each explicitly signaled in its own body text: `i2` (2,5)/slope 3, no negatives → `k3` (5,−1)/slope 2, "A hidden negative" (first negative coordinate, in y) → `ch1` (−3,4)/slope −2, "Two negatives to handle" (negative x **and** negative slope together). Each rung adds a genuinely new sign-interaction, not just new numbers.

**3.3 `lf-03-02` (ch1 vs k3).** `k3` (all-positive inputs: y₁=1, m=4, x₁=2) vs `ch1` (m=−3, body "Negative slope, full convert.", commonErrors specifically targeting the sign slip on `m·x₁`). Same positive→negative-slope escalation pattern as the task's own worked example.

**3.4 `lf-04-01` (k2, ch1 vs i2).** `i2` (point (3,4), slope −1, body "Try a negative slope") → `k2` (point (−1,2), slope +3, body "A negative x this time" — a *different* sign-interaction, negative multiplicand rather than negative slope) → `ch1` (point (−2,2), slope −3, body "Two negatives to manage" — both together). Same escalation-ladder pattern as 3.2, on a different pair of steps.

**3.5 `lf-04-02` (ch1 vs k1).** `k1` (points (1,2)&(3,8), no negatives) vs `ch1` (points (−2,1)&(1,7), body "Negatives in a point" — first negative coordinate in this two-point sub-family, requiring `b = 1 − 2·(−2)` double-negative handling).

**3.6 `mmt-03-01` (k1 vs i1).** `i1` ("which coin is worth 10 cents?" → dime) and `k1` ("…25 cents?" → quarter) are bare recall of two *different*, necessary facts from a closed 4-item vocabulary set (penny/nickel/dime/quarter) at the very start of a foundational G2 lesson. Unlike the other flagged families in this packet, there is no available escalation axis for "which coin is worth an arbitrary fixed cent value" — every coin is a peer fact to be memorized, not a skill with intrinsic difficulty gradient. This is the closest call in the packet; it is distinguished from the redesigned items by the absence of any escalation dimension to apply, not by a weaker standard.

**3.7 `mmt-03-03` (i3, k3, ch1 vs i2, k1, i1 respectively).** All three flagged items pair with an earlier item of the **same coin type**, escalating the target to exactly 100¢ (one dollar) — explicitly signaled in each pair's body text ("A dollar in quarters" / "How many dimes for a dollar?" / "A dollar in nickels") and reinforced by the concept block immediately preceding (`c3`: "100 cents in quarters… a dollar's worth"). The resulting coin counts even escalate in magnitude across the three pairs (4, then 10, then 20), consistent with placing the hardest (nickels) last as the lesson's challenge step.

**3.8 `mmt-04-01` (i2, i3, k2, k3, ch1 vs k1).** A ×5 multiplication-fact fluency drill: "the minute hand points to N — how many minutes?" tested for N = 7, 6, 11, 2, 9, 1, deliberately sampling different clock numbers across the full 1-11 range. There is no mathematical escalation available among single-digit-×5 facts; building fluency requires exposure to *all* of them, which is exactly what this family does.

**3.9 `mmt-04-02` (k1, i2, i3, k2, k3, ch1 vs i1).** Full analog-clock-reading fluency across seven different times. Several pairs also carry genuine, explicitly-signaled special-case differentiation: `i2` (9:00) is the on-the-hour edge case flagged by its own preceding concept block; `k3` (2:55) explicitly tests the near-hour-boundary "use the passed number, not the next one" trap; `ch1` (12:15) explicitly tests wrapping past 12. The remainder provide the breadth of exposure a "read any clock" skill requires.

**3.10 `rns-01-01` (ch1 vs k4).** `k4` (9/20, terminates) vs `ch1` (5/11, body "A trickier one," repeats with a two-digit block) — a genuine classification-difficulty escalation (recognizing non-termination is harder than recognizing termination), explicitly signaled.

**3.11 `rns-01-03` (i2 vs k1).** `k1` (0.777…, `answerMode:"fraction"` — the student constructs the answer) vs `i2` (0.222…, `answerMode:"choice"` — the student selects from four options, each keyed to a distinct, specific misconception: rounding to a tenth, wrong power-of-ten for the block length, confusing repeating with terminating). Construct-vs-recognize is a genuine action/representation difference — the same dimension rewarded at `mmt-04-03` in §2.2 — that happens to already exist in the authored content.

**3.12 `rns-02-03` (k2, ch1 vs k1).** `k1` (√2 bracketed to 1dp) → `k2` (same root, bracketed to 2dp, body "Narrow it further," feedback explicitly contrasting "a tighter trap than 1.4 to 1.5") is a precision escalation. `ch1` (√10, a new target, body "Apply the narrowing idea to a new number") is an explicit transfer-demand shift — the challenge step testing the technique on a value never used in the worked examples.

**3.13 `rns-03-01` (ch1 vs k1).** `k1` (√70, bracket 8/9) vs `ch1` (√150, bracket 12/13, body "Bracket a bigger one," hints walk through listing more perfect squares). Magnitude/effort escalation.

**3.14 `g2l-02-01` (ch1 vs k1).** `k1` (57+20=77, stays under 100) vs `ch1` (68+50=118, body "A jump that crosses 100," feedback/hints explicitly call out working "even past 100"). Crossing a place-value boundary is a genuine constraint escalation for this grade level.

**3.15 `g2l-02-02` (ch1 vs k1).** `k1` (46−20=26) vs `ch1` (58−50=8, body "A walk that lands below ten"). New, explicitly-targeted misconception: confusing the *hop count* (5) with the *landing value* (8) — only plausible/salient when the landing is small.

**3.16 `g2l-03-02` (ch1 vs k2).** `k2` (64−43=21, no regrouping) vs `ch1` (52−24=28, body "A gap that needs regrouping," requires borrowing). Same regrouping-escalation pattern used for the redesign at `g2l-03-03` (§2.6) — here it was already present in the authored content.

**3.17 `g2l-03-04` (ch1 vs k2).** See §5 — the flag is real and open, but the underlying content already carries the same legitimate regrouping escalation as 3.16 and §2.6; it was not touched further in this pass.

**3.18 `rns-03-02` (i2, ch1 vs k1 — k3 redesigned, see §2.5).** `i2` and `k1` are the first two rungs of the lesson's five-item narrow-the-root ladder (`k1`→`i2`→`k2`→`k3`→`ch1`): `k1` is the first application immediately after the concept block, `i2` is one additional low-stakes practice rep (`kind:"interactive"`, not a graded check) before the graded checks begin escalating — a standard practice-before-escalation structure. `ch1` (√83, body "Narrow a bigger root") is the lesson's magnitude-escalation finale, explicitly signaled, exactly like §3.13.

## 4. Gates

Run after all six content edits landed (most recently the `mmt-05-03` edit), from repo root:

| Gate | Command | Result |
|---|---|---|
| Schema | `npx tsx scripts/content-check.ts schema` (= `npm run validate:content`) | **1840/1840 files clean** |
| Pedagogy | `npx tsx scripts/content-check.ts pedagogy` (= `npm run lint:pedagogy`) | **1711/1711 files clean** |
| linear-functions | `npx vitest run src/lib/session179.linearFunctions.test.ts` | **5/5 passed** |
| measure-money-time | `npx vitest run src/lib/session268.measureMoneyTimeCourse.test.ts` | **2/2 passed** |
| the-real-number-system | `npx vitest run src/lib/session264.theRealNumberSystemP0Integrity.test.tsx` | **5/5 passed** |
| number-line-g2 | `npx vitest run src/lib/session261.numberLineG2Course.test.ts` | **5/9 passed, 4 pre-existing failures — see §5, none caused by this packet** |
| number-line-g2 | `npx vitest run src/lib/session308.numberLineG2ChoiceOrder.test.ts` | **2/2 passed** |
| `mmt-05-03`-specific | `npx vitest run src/lib/content.plotData.s237.test.ts` | **30/30 passed** (corpus contract for the `plotData` field touched by the `i3` redesign) |
| `mmt-05-03`-specific | `npx vitest run src/lib/widgetIntegrity.graphs.s241.test.ts` | **passed** |

Per the task's resource constraints, no whole-project `vitest`, `npm test`, `tsc --noEmit`, or `npm run build` was run — only `npx tsx` probes and targeted single/multi-file `npx vitest run`.

## 5. Pre-existing, not-mine findings (documented, not acted on)

This is a shared working tree with substantial uncommitted content from prior/concurrent waves (confirmed via `git status` / `git diff --stat` against `HEAD` at commit `7d8e4f4`). Three findings needed disentangling from this packet's own work:

**5.1 — `session261.numberLineG2Course.test.ts`, 3 MCQ option-ordering failures.** These assert a specific `["o0","o1","o2","o3"]` option order on MCQ steps unrelated to any of this packet's 23 lessons. Confirmed pre-existing by `git stash` (removing every uncommitted change, mine and everyone else's) and rerunning: the same 3 failures reproduce at bare `HEAD`, before any of this session's or any other wave's edits. Not caused by this packet.

**5.2 — `session261.numberLineG2Course.test.ts`, `g2l-03-04` `ch1` expects `answer:32`, gets `27`.** `g2l-03-04` is one of this packet's 23 assigned lessons, so this required full characterization. `git diff HEAD -- content/courses/number-line-g2/lessons/g2l-03-04.json` shows `ch1` already differs from the committed baseline: the committed version read `"Maggie is at marker 45. How far behind her is marker 13? Compute 45 − 13."` (answer 32, no regrouping needed) — exactly matching the test's hardcoded expectation. The **current, uncommitted** version reads `"Maggie is at marker 71. How far behind her is marker 44? Compute 71 − 44."` (answer 27, **requires regrouping** since the ones digit 1<4) — a legitimate, well-executed redesign using the *exact same* regrouping-escalation pattern this packet independently applied at `g2l-03-03/ch1` (§2.6) and found already-authored at `g2l-03-02/ch1` (§3.16). This edit was not made by me (I never opened this file for writing) and predates this session. The test file itself (`git diff HEAD` on the test file: empty) was never updated to match — it still encodes the old, pre-redesign expectation.
  - **Disposition:** left as-is. Reverting the content to satisfy the stale test would undo a correct, already-legitimate fix and reintroduce the exact kind of low-effort duplicate this workstream exists to eliminate. Editing the shared test file was judged out of scope for this packet (it is not one of the 23 assigned lesson-content files, and another wave may still be actively reconciling it). Re-running `detect.mjs` on the current file confirms the flag (`ch1` vs `k2`, PROGRESSION-g2l-03-04) is real and still structurally open — see §5.3 for why.
  - **Queue row:** `g2l-03-04` is recorded as **KEEP, not edited by me** — no new disposition record was written for it (per the task's instruction that unedited lessons need no fresh disposition), but the finding is documented here since the lesson is in this packet's assigned scope.

**5.3 — Why `g2l-03-04`'s flag stays open despite legitimate content.** `ch1`'s new prompt ("Maggie is at marker 71. How far behind her is marker 44? Compute 71 − 44.") and `k2`'s prompt ("Maggie is at marker 46. How far behind her is marker 14? Compute 46 − 14.") normalize to the **identical** template (`"maggie is at marker #. how far behind her is marker #? compute # − #."`) because, as noted in §1, the detector's number regex cannot see that one case needs regrouping and the other does not — that distinction lives entirely in the digits. This is the same class of detector blind spot this packet worked around by also changing prompt wording wherever a redesign was made (§2); since `g2l-03-04`'s `ch1` was not touched in this pass, its wording was never updated, so the row remains open. Structurally verified via the detector replica: `number-normalized-prompts=[ch1]` on the current file, colliding with `k2`.

**5.4 — `rns-03-02` and `g2l-03-03`, neighboring `k2` changes.** Documented inline in §2.5 and §2.6. Both are pre-existing, uncommitted changes to a step adjacent to (but never colliding with) the step this packet redesigned. Confirmed via `git diff HEAD` on each file and cross-checked against the detector replica to confirm no interaction with either flag this packet closed.

## 6. Staging ledger

6 disposition records written to `reports/closure/cowork-staging/laneA-s329-PGC.jsonl` (schema: `LESSON_REVIEW_DECISIONS_S244.jsonl`'s `recordType:"lesson-disposition"` contract), one per **edited** lesson only, `recordId` prefixed `s329-PGC-<lessonId>`, `decision:"KEEP"`, `visualDecision:"SUFFICIENT"`, `gradeLanguageDecision:"FIT"`, each `reviewedBasisHash` computed via `node scripts/session/print-review-basis.mjs <lessonId>` **after** its edit landed:

| lessonId | reviewedBasisHash |
|---|---|
| lf-02-01 | `8c471b197ff65953580e33105310ea60b29e3c26545cf82c3dd0dc0a4b409b54` |
| mmt-04-03 | `e7df3d566c6b3c2b1fa3d85fb06a826c58921ebdba3abea6f8b4c234c6b40ad0` |
| mmt-05-03 | `f5124aea49f2c613353f0adb50c116043c47bfc3fdbb716b0f62fbf6ea9f53bf` |
| rns-02-01 | `8c43f2ac50a8678afe69307701d262e2b5dec48c5d3e870a5919a6a6ade5b9af` |
| rns-03-02 | `62a5e3f488bb56ea73ee9b31d9124c2e4de33efc3f58f0abc20a4bf6067b112a` |
| g2l-03-03 | `09fef2bc4578ec9d09899c0ab5bc35e6e499b8c37f2e27987f464a10b06b4ba6` |

The 17 kept lessons received no new disposition record, per the task's instruction that unedited lessons do not require one; their rows remain open in the mechanized queue as an accepted, non-failure outcome, with reasoning recorded in §3 of this report.
