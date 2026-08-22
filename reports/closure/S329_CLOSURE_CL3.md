# S329 Closure Packet — Lane A / CL3: CL-P1-049 Prediction-Gate Causal-Surface Review (Wave D)

**Packet:** `s329-CL3` · **Scope:** `CLOSURE_LEDGER.md` row **CL-P1-049** ("Prediction ceremony... 200 of
1,362 authored prediction gates do not meet the direct causal surface threshold in the deterministic
audit.") · **Reviewer:** cowork-s329-CL3 · **Date:** 2026-08-21

## 0. Headline result

**200/200 flagged rows reviewed (full review, not a sample). 0 removed. 200 retained** — 169 because the
live gate is a genuine informative prediction → action → reveal loop, 31 because the flagged `predict`
block no longer exists in live content at all (superseded by unrelated content revision across the many
sessions between S226, when the audit ran, and now). **0 lesson files edited**, so no `validate:content`
/ `lint:pedagogy` runs were needed. **179 lesson-level signed KEEP dispositions** written to
`reports/closure/cowork-staging/laneA-s329-CL3.jsonl`; **18 lessons** reviewed and classified but
excluded from formal disposition/editing this round because they belong to other packets' declared scope
this wave (all 18 would also have been classified retain — see §4).

Recommended new status line for CL-P1-049 is in §8.

---

## 1. What "direct causal surface" actually means — reading the detector, not just its output

Per the task, I found the generator behind `PREDICTION_GATE_AUDIT.csv` (root) and read its scoring logic
directly: it is `scripts/audit/premium-rebuild-baseline-s226.mjs`, lines ~119–155. The decision logic
reduces to this:

```js
const c = caps[type] ?? {};                                    // type = step.widget?.type
const direct = (c.manip ?? 0) >= 2 && (c.conseq ?? 0) >= 2;     // scripts/engine-capabilities.json
const duplicatesTask = step.widget?.prompt && predict.prompt.trim().toLowerCase()
                        === step.widget.prompt.trim().toLowerCase();
// decision = REMOVE if !direct or duplicatesTask, else KEEP (REFRAME if outcome/reveal missing)
```

Two load-bearing facts follow directly from this, and I verified both independently against the live
1,362-row CSV before trusting them:

- **`direct_causal_surface` is a per-widget-*type* lookup into a 129-entry capability table
  (`scripts/engine-capabilities.json`), never a read of the gate's own `predict.prompt` /
  `predict.reveal` text.** Every instance of a given widget type gets the same verdict regardless of
  what the specific prediction actually says. Confirmed: 0 of 108 widget types split KEEP/REMOVE across
  their instances in the 1,362-row file.
- **`duplicates_task` is a brittle exact string-equality check** (`predict.prompt` vs the widget's own
  `prompt`, lower-cased and trimmed) that essentially never fires — confirmed: **it is `"no"` on all
  1,362 rows, with zero exceptions.** The ledger's framing ("remove duplicated... gates") describes a
  detector capability that does not actually exist in this CSV; the column is present but inert.

So the 200-row flag is evidence that certain **widget engines** score low on a generic
manipulation/consequence rubric — it is not evidence that any specific one of those 200 predictions is
duplicated or unreasoned. That distinction is the entire reason this row calls for **human** review
rather than trusting the CSV's own `decision` column (which mechanically says `REMOVE` on all 200 rows,
with only one of two boilerplate `reason` strings repeated verbatim throughout the 1,362-row file).

## 2. Prior work found in-repo: a full rubric-based re-adjudication already exists, never merged into the ledger

Before reviewing gates by hand from zero, I searched for anything upstream and found a substantial body
of prior work, all dated **S240–S241 (2026-08-13/14)**, that CL-P1-049's ledger entry (last touched S226,
still reading "OPEN — WAVE D REVIEW" as of S319) never absorbed:

- `WS_E_PREDICTION_PURGE_PLAN.md` — scoping doc that reaches the same detector-logic conclusion as §1
  independently.
- `WS_E_PREDICTION_RUBRIC.md` (v1.1) — a genuine, text-only, five-category operational rubric
  (**counterintuitive consequence, common misconception, invariant, estimate, causal contrast**) with an
  absolute rule that widget type/engine metadata may never be cited as verdict evidence. This *is* the
  correct operational definition of "direct causal surface" — far better specified than anything in the
  detector script — and I used it as my primary analytical framework below.
- `scripts/audit/prediction-gate-evidence.mjs` + `PREDICTION_GATE_ADJUDICATION.csv` (root, 1,362 rows) —
  a read-only re-extraction of every gate's actual prompt/options/outcome/reveal text, with five rubric
  category columns and a `proposed_verdict` (KEEP/REWRITE/REMOVE/THIN) filled in per gate.
- `WS_E_CORPUS_ADJUDICATION_REPORT.md` — reports the full-corpus re-adjudication result: **KEEP 1,145 /
  REWRITE 200 / REMOVE 17** (vs. the old CSV's KEEP 1,162 / REMOVE 200), and specifically: of the old
  CSV's 200 REMOVE rows, **178 are rubric-KEEP and only 2 are rubric-REMOVE** — "the purge the old CSV
  prescribed would have destroyed far more value than it removed."
- `WS_E_RULING_ROUND_1.md`, `WS_E_BATCH_01/02/03_REPORT.md` — partial human ratification of the pilot
  batches; most of the corpus-wide pass remained `PROPOSED`, never ratified, never executed against
  `content/courses/`.

**This is valuable, well-evidenced prior work, and I treated it as reference evidence, not as ground
truth to copy.** Two things stopped me from simply adopting its verdicts:

1. It never authorized a content edit (every verdict in it is explicitly `PROPOSED`, and its own rubric
   states no verdict it produces may be treated as a ruling).
2. **Critically, I found its cached gate text is now substantially stale.** Cross-checking its
   `predict_prompt`/`predict_reveal` columns against the *current* `content/courses/**/*.json` for
   exactly the 200 rows in this task's scope: **102 of 200 (51%) have live text that no longer matches
   what WS-E cached in S241**, and — more importantly — **100% of the non-KEEP verdicts (both REMOVE, all
   3 THIN, all 20 REWRITE) sit on rows whose text has since changed.** Not one of WS-E's "interesting"
   verdicts remains checkable against unchanged text. I confirmed this is real content drift, not an
   extraction bug, by reading raw JSON directly (e.g. `as100-04-01/i1`'s prompt and reveal today read
   completely differently from what WS-E's S241 cache recorded, byte for byte, straight from
   `content/courses/add-subtract-100/lessons/as100-04-01.json`).

**Consequence: I could not shortcut this review by trusting WS-E's cached verdicts.** I re-derived every
one of the 200 rows' classification from the *current* live `predict` block, using WS-E's five categories
as my analytical tool but forming my own judgment against today's text. Where WS-E's verdict happened to
still check out against unchanged text I note it as corroboration; where it didn't, I ignored the cached
verdict and read fresh.

## 3. Methodology

1. Parsed `PREDICTION_GATE_AUDIT.csv` (1,362 rows) and isolated the 200 rows with `decision == REMOVE` —
   the exact set CL-P1-049 and this task point at. (`duplicates_task` is `"no"` for all 200, confirming
   §1: the "duplicated" half of the ledger's framing was never actually detected by this CSV for any
   row — it would have to be found, if present at all, by reading the lessons.)
2. For every one of the 200 rows, opened the actual lesson JSON (`content/courses/<course>/lessons/
   <lesson>.json`), located the exact step, and pulled the **current live** `predict.prompt`,
   `predict.options`, `predict.outcomeId`, `predict.reveal` — not the CSV's cached text.
3. For every flagged **lesson**, enumerated *every* `predict` block in that lesson (not just the flagged
   step) to test the ledger's own "duplicated... already predicted earlier in the same lesson" criterion
   directly. Only 3 of the 197 unique flagged lessons contain more than one `predict` gate at all
   (`ns-04-02`, `ns-05-02`, `ns-05-03`); an exact-text duplicate check across all 200 found zero matches,
   and manual reading of the two gates in each of these three lessons found each pair tests a distinct
   sub-skill (e.g. `ns-04-02/i1` establishes "right always means greater, even below zero" as a general
   rule; `i2` applies it to a full ordering task with the added "biggest digit ≠ biggest number for
   negatives" misconception) — not a repeat of the same prediction.
4. Read every row's live prompt/options/reveal personally against `WS_E_PREDICTION_RUBRIC.md`'s five
   categories and this task's own (coarser, binary) bar: remove only if genuinely duplicated within the
   lesson, or non-causal/arbitrary/unlearnable; otherwise retain unchanged.
5. Cross-checked every "interesting" prior verdict (WS-E's 2 REMOVE, 3 THIN, 20 REWRITE candidates within
   this 200-row scope) individually against current live text (see §5.3).
6. Built the collision-exclusion set (§4), computed `reviewedBasisHash` for every lesson I formally
   dispose (§7), and wrote this report.

No lesson file was opened with intent to write during review — reads only until a decision was made
(none were made to edit).

## 4. Collision / concurrent-ownership safety

Excluded from formal disposition **and** from any edit consideration, per the task's named list plus the
`LESSON_PROGRESSION_AND_DUPLICATION` workstream (142 lessons enumerated in
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, workstream column): **18 of the 200 rows / 18 of the 197 unique
lessons** —

`as-04-01`, `asv-01-01`, `c120-05-02`, `dpv-02-02`, `esn-02-02`, `esn-03-01`, `esn-03-02`, `fg-01-02`,
`fg-04-01`, `gf-03-03`, `les-01-02`, `lf-03-02`, `mc-04-01`, `mc-04-03`, `pv-03-02`, `pv-04-01`,
`pv-04-02`, `qu-03-01`.

I additionally cross-checked live `git status` for uncommitted concurrent edits as an extra safety net
beyond the task's static list (this environment is visibly, actively multi-agent: a ~215-file commit
across `content/courses/` landed mid-review, between two of my own status checks minutes apart). At
various check points this surfaced up to 19 more lessons transiently modified in the working tree,
none of them on the named list. **This posed no actual collision risk in practice**, because every one of
those lessons — like all 200 rows — was independently classified **retain**, so no edit was ever
attempted against them either. I did not add them to the formal exclusion list above (git state is a
moving target and not authoritative scope), but I mention it for completeness: it did not change any
outcome. All 18 named/PROGRESSION-owned lessons were still read and classified (all 18 → retain; see the
`Excluded this wave?` column in §5.2/§5.1) — I simply did not write a signed disposition record or attempt
an edit for them, since another packet owns that lesson's edit surface this wave.

**Net effect: zero lesson files were edited this round, by any packet's boundary.** Since my conclusion
for all 200 rows (excluded or not) was retain, the collision question never had to be resolved in
practice — there was nothing to write.

## 5. Results

### 5.1 Already-resolved (31/200) — the flagged `predict` block no longer exists in live content

For these 31 rows, `PREDICTION_GATE_AUDIT.csv`'s cited step still exists in the lesson, but its `predict`
field (optional per `src/lib/schema.ts:9314`) has since been dropped entirely — confirmed directly against
raw JSON (e.g. `tens-and-ones/tno-04-01/i1` is now a plain `placeCompare` interactive step with no
`predict` block at all) — not a bug in my extraction. **Notably, this set includes every single one of
WS-E's own worst-rated candidates within this 200-row scope**: both of its two rubric-`REMOVE` gates
(`asv-04-02`, `dd-05-03`) and all three of its `THIN` (duplicate-family) candidates (`asv-01-01` —
also collision-excluded — plus `asv-05-03`, `dd-03-03`). Whatever removed these predict blocks (unrelated
later content revision across the many intervening sessions, not this packet) already resolved the exact
worst cases a much deeper prior audit had flagged. There is nothing left to act on for any of these 31
rows.

| # | Course | Lesson | Step | Old widget_type (why the old CSV flagged it) | Excluded this wave? |
|---|---|---|---|---|---|
| 1 | area-surface-volume | asv-01-01 | i1 | `numeric` | yes (EXPLICIT) |
| 2 | area-surface-volume | asv-04-02 | i1 | `numeric` | no |
| 3 | area-surface-volume | asv-05-01 | i1 | `numeric` | no |
| 4 | area-surface-volume | asv-05-03 | i1 | `numeric` | no |
| 5 | complex-numbers | cn-04-01 | i1 | `mcq` | no |
| 6 | complex-numbers | cn-04-02 | i1 | `numeric` | no |
| 7 | data-distributions | dd-03-03 | i1 | `numeric` | no |
| 8 | data-distributions | dd-05-03 | i1 | `dragOrder` | no |
| 9 | decimal-operations | dop-02-02 | i1 | `numeric` | no |
| 10 | exponents-polynomials | ep-01-03 | i1 | `numeric` | no |
| 11 | fractions | fr-04-01 | i1 | `dragOrder` | no |
| 12 | fractions-add | fa-05-01 | i1 | `matchPairs` | no |
| 13 | geometry-foundations | gf-02-02 | i1 | `numeric` | no |
| 14 | geometry-foundations | gf-02-03 | i1 | `buildExpression` | no |
| 15 | geometry-foundations | gf-03-03 | i1 | `mcq` | yes (PROGRESSION) |
| 16 | geometry-foundations | gf-04-03 | i1 | `numeric` | no |
| 17 | geometry-foundations | gf-05-01 | i1 | `mcq` | no |
| 18 | multiplication-division | mult-02-03 | i1 | `steppedReveal` | no |
| 19 | multiplication-division | mult-03-04 | i1 | `matchPairs` | no |
| 20 | multiplication-division | mult-04-05 | i1 | `dragBucket` | no |
| 21 | number-system | ns-01-01 | i2 | `matchPairs` | no |
| 22 | place-value-1000 | pv1000-03-02 | i1 | `placeCompare` | no |
| 23 | place-value-1000 | pv1000-03-03 | i2 | `dragOrder` | no |
| 24 | place-value-million | pv2-04-03 | i1 | `steppedReveal` | no |
| 25 | quadratics | qu-02-02 | i1 | `mcq` | no |
| 26 | quadratics | qu-03-01 | i1 | `numeric` | yes (PROGRESSION) |
| 27 | right-triangles-trig | rt-01-04 | i2 | `mcq` | no |
| 28 | tens-and-ones | tno-04-01 | i1 | `placeCompare` | no |
| 29 | tens-and-ones | tno-04-02 | i1 | `placeCompare` | no |
| 30 | tens-and-ones | tno-04-03 | i1 | `placeCompare` | no |
| 31 | triangle-congruence | tc-02-01 | i1 | `numeric` | no |

### 5.2 Retained as live, informative prediction → action → reveal loops (169/200)

Every row below still has a live `predict` block. Each was read in full and satisfies at least one of the
rubric's five categories (invariant, common misconception, causal contrast, estimate, or counterintuitive
consequence) or, at minimum, presents a specific, reasoned mechanism the learner can commit to before the
reveal explains it — never an arbitrary or unlearnable guess, and never a repeat of an earlier prediction
in the same lesson. None were edited.

| # | Course | Lesson | Step | Live prompt | Live reveal (why it's causal) | Excluded this wave? |
|---|---|---|---|---|---|---|
| 1 | add-subtract-100 | as100-01-01 | i1 | Doubles climb the same ladder: 6 + 6 = 12, so 7 + 7 is… | Each double is 2 more than the one before — BOTH addends grew by 1. Know one double and its neighbours come free: 12, 14, 16, 18. | no |
| 2 | add-subtract-100 | as100-01-02 | i1 | 6 + 7 is exactly one more than which double? | 6 + 7 hides 6 + 6 with one extra: 12 + 1 = 13. Near doubles lean on a double you already own — one more than 6 + 6, or one less than 7 + 7. Either crutch works. | no |
| 3 | add-subtract-100 | as100-01-03 | i1 | For 9 + 2: count on from 9, or make a ten? | With only 2 to add, two hops beat rebuilding: 9… 10, 11. Make-ten earns its keep when the second number is big enough to split (like 9 + 5). Strategies fit… | no |
| 4 | add-subtract-100 | as100-04-01 | i1 | 18 birds are here and 24 more land. What number must the second step start from? | The first hop lands on 42. A two-step story chains its steps, so 42 becomes the next starting number. | no |
| 5 | add-subtract-100 | as100-04-02 | i1 | In 52 − 27, what must happen before you can take 7 ones from 2 ones? | The column model breaks one ten into 10 ones, so 52 becomes 4 tens and 12 ones. Now 12 − 7 can be shown. | no |
| 6 | add-subtract-100 | as100-04-03 | i1 | If 15 coins are spent, which way should the amount move? | The hop moves back from 40 to 25. What happens in the story chooses the operation: leaving means subtract. | no |
| 7 | add-subtract-100 | as100-05-02 | i1 | When the 14 counters from 8 + 6 are paired, what do you expect to be left over? | The counters make seven complete pairs with none left over. That visible pairing is why even + even is even. | no |
| 8 | add-subtract-20 | as-04-01 | i1 | If 3 + 4 = 7, where should 7 − 3 land? | The three backward hops land on 4. The number line keeps the same three family numbers in view: 3, 4, and 7. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 9 | add-subtract-20 | as-04-02 | i1 | When x is 2, what should the scale show for 2 + 3 and 5? | 2 + 3 and 5 are the same amount, so the pans balance. That is exactly what the equal sign promises. | no |
| 10 | area-surface-volume | asv-01-03 | i1 | For a TRIANGLE, what does base × height alone give you? | Base × height measures the full rectangle around the triangle — the triangle claims only half of it, so the formula halves the product — that halving is where… | no |
| 11 | area-surface-volume | asv-02-01 | i1 | An L-shape has no formula of its own. Can its area still be found exactly? | Any straight-sided shape splits into rectangles — find each piece's area and add. Decomposing beats memorizing a formula for every shape. | no |
| 12 | area-surface-volume | asv-02-02 | i1 | A house shape is a rectangle with a triangle roof. To get the whole area, do you ADD the two… | Each piece covers its own patch of the figure — the total is patch plus patch. Multiplying areas would answer no question at all. | no |
| 13 | bivariate-statistics | bv-01-02 | i1 | Can a scatter plot show an association when the dots do not form a perfect line? | Association describes the overall direction of the cloud. Points may sit above and below a trend line while still rising together overall. | no |
| 14 | bivariate-statistics | bv-01-03 | i1 | One point sits far from a rising band. Does that point erase the overall pattern? | A point far from the main band is an outlier. It deserves attention, but the direction of the larger group still provides evidence of an association. | no |
| 15 | bivariate-statistics | bv-03-02 | i1 | For y = 2x + 10, which amount remains when zero gigabytes are used? | At x = 0, the 2x term becomes 0 and the 10 remains. The intercept is the fixed starting fee; the slope is the added cost per gigabyte. | no |
| 16 | bivariate-statistics | bv-03-03 | i1 | A line uses data from x = 1 to 10. What supports its values beyond x = 10? | The model was built from x-values 1 through 10. Beyond that range it assumes the trend continues, so an extrapolated prediction has less direct evidence than… | no |
| 17 | complex-numbers | cn-01-02 | i1 | To complete x² + 6x = −5 you'll add (6/2)² = 9 to both sides. The resulting k will be… | The right side becomes −5 + 9 = 4. A positive k is good news: (x + 3)² = 4 unwinds to x + 3 = ±2, handing over two real solutions, x = −1 and x = −5 — both… | no |
| 18 | compose-shapes-g1 | g1s-01-03 | i1 | Shapes are sorted by colour instead. Will each group contain only one kind of shape? | Colour is non-defining, so a red triangle and a red square land in the same pile — only sides and corners decide the shape. | no |
| 19 | compose-shapes-g1 | g1s-02-03 | i1 | Six matching triangle pieces fit evenly around one centre point. How many sides does the finished… | Each triangle contributes one outer edge, so the ring closes with six sides — eight triangles would close with eight. Counting three counts one triangle's own… | no |
| 20 | compose-shapes-g1 | g1s-02-04 | i1 | Can one outline be filled correctly in more than one way? | Different combinations of pieces can each cover the same outline exactly — a square can take two triangles, or four small squares. | no |
| 21 | compose-shapes-g1 | g1s-03-01 | i1 | Can a solid shape lie completely flat on the page? | A solid has thickness, so it cannot lie flat the way a drawn shape does — a picture of a ball is flat, but the ball itself is not. | no |
| 22 | constructions-and-proof | cp-01-03 | i1 | The construction swings one arc from V, then equal arcs from where it cut the two sides. What… | Equidistance does the work. VD = VE because they are one arc from V; then F is an equal radius from BOTH D and E. Two triangles with three matching sides are… | no |
| 23 | constructions-and-proof | cp-02-01 | i1 | P sits ON the line. The construction first marks two points equidistant from P, then swings equal… | The two marks are equal distances from P, so P is the MIDPOINT of the segment joining them. The crossings are equidistant from both marks, which is the… | no |
| 24 | constructions-and-proof | cp-02-02 | i1 | P is OFF the line. The first arc from P cuts the line in two places. Before the rest of the… | The two cuts are one arc from P, so P is equidistant from both — which puts P on the perpendicular bisector of the segment between them. That bisector is the… | no |
| 25 | constructions-and-proof | cp-02-03 | i1 | The parallel construction copies an angle from the given line up to P. Why does copying an angle… | Equal corresponding angles IS parallelism — it is the converse of the transversal theorem, and it is a proof rather than an appearance. The compass never… | no |
| 26 | constructions-and-proof | cp-05-03 | i2 | A TRUE theorem is about to meet its converse. Must the converse be true as well? | 'Divisible by 4 ⇒ divisible by 2' is true, yet 6 is divisible by 2 and not by 4 — the reverse arrow fails. A statement and its converse are separate claims,… | no |
| 27 | counting-120 | c120-01-03 | i1 | Where will one forward hop from 29 land? | The hop lands on 30. The 9 ones are full, so the next count starts a new ten. | no |
| 28 | counting-120 | c120-02-01 | i1 | The row starts at 21. Where will its tenth number be? | Nine hops after 21 land on 30, the tenth number in the row. The next row begins at 31. | no |
| 29 | counting-120 | c120-02-02 | i1 | Which row should hold 47? | The marker lands at 47 inside 41–50. Its tens digit 4 names the row, and its ones digit 7 finds the spot across. | no |
| 30 | counting-120 | c120-05-02 | i1 | Where will a forward jump of 10 from 45 land? | The 10-jump lands on 55. The tens digit grows by one while the ones digit stays 5. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 31 | counting-120 | c120-05-03 | i1 | Where will the first, ten-more jump from 34 land? | The first jump lands on 44. That result becomes the starting number for the next step. | no |
| 32 | data-distributions | dd-01-02 | i1 | One survey answer was '0 pets'. Does that zero count as a data value? | Zero is a real answer to the question — dropping it would erase a person from the survey. Data counts responses, not just positive numbers. | no |
| 33 | data-distributions | dd-03-02 | i1 | Can you spot the MEDIAN of a list without sorting it first? | The median is the middle by SIZE, not by position on the page — sorting first is the non-negotiable move. | no |
| 34 | data-distributions | dd-04-03 | i1 | This data set has SIX values. Will its median be one of the listed numbers, or sit between two of… | An even count has no single middle value — the median splits the difference between the two central numbers. | no |
| 35 | data-distributions | dd-05-02 | i1 | The mean allowance is 20, but one value is 64. Can MOST of the values sit BELOW the mean? | The mean balances totals, not headcounts — a single 64 hoists it above nearly everyone; one extreme value drags the mean toward itself. Half-on-each-side is… | no |
| 36 | data-graphs-g1 | dgr1-01-02 | i1 | You will sort fruit into Apples and Bananas. Where does a GREEN apple go? | The rule sorts by TYPE of fruit. A green apple is still an apple, so it joins the apple group. | no |
| 37 | decimal-operations | dop-01-01 | i1 | You'll evaluate 2 + 3 × 4 twice: multiply-first versus strict left-to-right. Will the answers agree? | Multiply-first gives 2 + 12 = 14; left-to-right gives 5 × 4 = 20. The same three numbers land six apart — which is exactly why everyone must agree on ONE… | no |
| 38 | decimal-operations | dop-01-02 | i1 | In 2 + 3 × 4, which operation must happen first? | Without parentheses, multiplication comes first: 2 + 12 = 14. Parentheses around 2 + 3 would force the addition first and change the value to 20. | no |
| 39 | decimals-place-value | dpv-02-01 | i1 | Moving RIGHT after the decimal point, do the place values get bigger or smaller? | Each step right divides by ten — tenths, then hundredths, then thousandths. The point is the hinge where growing turns into shrinking. | no |
| 40 | decimals-place-value | dpv-02-02 | i1 | Is 2/10 the same amount as 20/100? | Cut every tenth into ten slivers and two tenths become twenty hundredths — the amount never moves. That equivalence is what lets expanded form line up. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 41 | decimals-place-value | dpv-02-03 | i1 | Reading a decimal aloud — which place gives the read its NAME? | The final digit's place christens the whole read — the name comes from where the number ENDS, however many digits it took to get there. | no |
| 42 | decimals-place-value | dpv-03-02 | i1 | 0.5 and 0.05 — the same value? | A zero BETWEEN the point and the digit shoves the 5 into the hundredths — ten times smaller. Where a zero sits decides whether it matters at all. | no |
| 43 | exponents-polynomials | ep-02-01 | i1 | Before moving the marker, which exponent determines the degree of 3x^2 + 5x^4 - x? | The x^4 term controls the degree. Writing order and term count do not change the largest exponent, so the marker must land on 4. | no |
| 44 | exponents-scientific-notation | esn-02-01 | i1 | Before moving the crossings, can a negative number squared equal 25? | A negative times a negative is positive. Therefore (−5)² and 5² both equal 25, which the two graph crossings make visible. | no |
| 45 | exponents-scientific-notation | esn-02-02 | i1 | What does ∛64 ask you to find? | A cube root finds the edge length of a cube with the given volume. Since 4 × 4 × 4 = 64, the cube's edge and ∛64 are both 4. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 46 | exponents-scientific-notation | esn-03-01 | i1 | In scientific notation, the coefficient is at least 1 and less than which number? | A scientific-notation coefficient has exactly one nonzero digit before the decimal, so it is at least 1 and less than 10. The exponent then carries the… | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 47 | exponents-scientific-notation | esn-03-02 | i1 | Because 0.0056 is less than 1, what sign should its power-of-ten exponent have? | Negative exponents represent repeated division by 10. That moves 5.6 down three place-value positions to 0.0056. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 48 | exponents-scientific-notation | esn-04-01 | i1 | When powers of 10 are multiplied, how do their exponents combine? | Four factors of 10 followed by three more make seven factors in all. Therefore 10⁴ × 10³ = 10⁷, so the exponents add. | no |
| 49 | exponents-scientific-notation | esn-04-02 | i1 | Before adding scientific-notation numbers, what must be true of their powers of 10? | Addition combines like place-value units. Rewrite both terms with the same power of 10, then add their coefficients; adding exponents is a multiplication rule. | no |
| 50 | exponents-scientific-notation | esn-04-03 | i1 | For (3 × 10⁴)(2 × 10²), which power of 10 sets the product's scale? | The powers combine as 10⁴ × 10² = 10⁶, and the coefficients multiply to 6. The result is 6 × 10⁶ grams, so the scale is millions. | no |
| 51 | expressions-equations | ee-01-01 | i1 | A 2-by-2 base holds 4 unit cubes in one layer. How many cubes will TWO layers hold? | One 2-by-2 layer has 4 cubes. Two layers make 4 × 2 = 8, so the model shows 2³ = 2 × 2 × 2 = 8. | no |
| 52 | expressions-equations | ee-01-02 | i1 | 2⁴ — will it come out equal to 2 × 4? | The exponent counts FACTORS, not a multiplier: 2 × 2 × 2 × 2 = 16, double 2 × 4 = 8. Each extra factor of 2 doubles everything so far — that compounding is… | no |
| 53 | expressions-equations | ee-02-01 | i1 | In the expression n + 3, when n changes, does the 3 change too? | The variable varies; the constant doesn't. Whatever n becomes, the + 3 waits unchanged — that split is the whole grammar of expressions. | no |
| 54 | expressions-equations | ee-02-03 | i1 | The phrase 'more than' signals which operation? | 'More than' piles an amount on top of what's there — addition. Multiplication answers to a different family of phrases — 'times as many' — so '3 more than n'… | no |
| 55 | expressions-equations | ee-03-03 | i1 | If two expressions are TRULY equivalent, at how many values of n must they agree? | Equivalence is a promise about EVERY input. One matching value is evidence, not proof — but one mismatching value destroys the claim completely. | no |
| 56 | expressions-equations | ee-04-01 | i1 | What makes a number a SOLUTION of an equation? | A solution passes the substitution test — drop it in and both sides agree. Being written in the equation earns nothing; making it TRUE is everything. | no |
| 57 | expressions-equations | ee-05-03 | i1 | In pay = 8h, which variable depends on the other? | Hours are chosen; pay follows from them through the rule. The independent variable moves first, and the dependent one answers. | no |
| 58 | fractions | fr-01-03 | i1 | You took 5 of the 6 slices. Is your share more than half the pizza? | Half of six slices is three — five slices sails well past it. Benchmarking against a half reads a fraction before any symbols do. | no |
| 59 | fractions | fr-01-04 | i1 | If the BOTTOM number grows while the top stays put, does your amount grow or shrink? | A bigger bottom means the whole was cut into more, smaller pieces — holding the same count of tinier pieces is holding less. | no |
| 60 | fractions | fr-03-02 | i1 | Cutting every piece of a bar in half — does the shaded AMOUNT change? | The cuts multiply the count and shrink the size in perfect balance — 2/4 covers exactly the ground 1/2 did. That balance IS equivalence. | no |
| 61 | fractions | fr-04-03 | i1 | Why is 1/3 greater than 1/4 when the wholes are the same size? | When the same whole is split into 3 equal parts, each part is larger than when it is split into 4 equal parts. | no |
| 62 | fractions | fr-04-04 | i1 | Are half of a small cookie and half of a large cake the same amount? | Both shares are one half, but the cake is the larger whole, so its half is the larger amount. Fraction names alone compare amounts only when the wholes match. | no |
| 63 | fractions-add | fa-01-03 | i1 | Does simplifying a fraction change its VALUE, or only how it's written? | Simplifying regroups the same amount into bigger pieces — 4/8 and 1/2 are one quantity wearing two outfits. The value never moves. | no |
| 64 | fractions-add | fa-02-01 | i1 | Without a picture, how can you tell a fraction is MORE than 1/2? | Half of the denominator is the tipping point — 5/8 clears it because 5 beats 4. The benchmark lives in that comparison, no drawing required. | no |
| 65 | fractions-add | fa-03-02 | i1 | Subtracting 5/8 − 2/8 — do the DENOMINATORS get subtracted too? | The bottom number names the piece SIZE, and taking pieces away doesn't change what size they are — only how many remain. Tops subtract; bottoms hold still. | no |
| 66 | fractions-add | fa-03-03 | i1 | A story asks 'how much MORE did Ana eat than Ben?' — add or subtract? | 'How much more' measures the GAP between two amounts — a subtraction. The word 'more' baits addition, but the question's shape is a comparison. | no |
| 67 | fractions-add | fa-04-02 | i1 | In 2¾, how many FOURTHS are hiding inside just the 2 wholes? | Every whole shatters into four fourths — two wholes carry eight of them before the ¾ even joins. That unpacking is the mixed-to-improper move. | no |
| 68 | fractions-add | fa-04-03 | i1 | Adding 1½ + 1½ — can the fraction parts alone push the answer up to a new WHOLE? | Half and half make a full one — the parts regroup upward exactly like ones carrying into tens. Mixed numbers trade between their two columns. | no |
| 69 | fractions-add | fa-05-02 | i1 | 6 × (1/4) — will the answer be more or less than 1? | Four quarters already build a whole — six of them overflow it. "Multiplying by a fraction keeps you under 1" is only true for taking a single fraction of one… | no |
| 70 | function-transformations | ft-01-03 | i1 | y = \|x\|: can the machine ever output a negative number? | \|x\| measures distance from 0, and distances are never negative — feeding in x = −5 outputs +5. Zero itself IS reachable (at x = 0), so the range is y ≥ 0:… | no |
| 71 | functions-g8 | fg-01-02 | i1 | Which situation breaks the definition of a function? | A function assigns exactly one output to each input. Several inputs may share an output, but one input cannot point to two different outputs. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 72 | functions-g8 | fg-04-01 | i1 | For a linear relationship, how do outputs change when inputs increase by equal steps? | A linear relationship has a constant rate of change. Equal input steps produce equal output changes, and that constant change may be any value, not only 1. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 73 | geometry-g7 | g7-04-01 | i1 | Before moving the beams, what must the two shorter lengths do together? | The two shorter beams must reach past the longest beam's endpoint. If they only reach exactly as far, the shape lies flat instead of closing. | no |
| 74 | geometry-g7 | g7-04-02 | i1 | As a base-parallel cut moves up a cylinder, what happens to its cross-section? | A cut parallel to a cylinder's base keeps the base's circular outline at every height. A tilted or vertical cut would produce a different shape. | no |
| 75 | linear-equations-systems | les-01-02 | i1 | For 4x + 3 = 2x + 11, which first move gathers the x-terms on one side? | Subtracting 2x from both sides preserves the balance and changes the equation to 2x + 3 = 11. The variables are now gathered on one side for the remaining… | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 76 | linear-equations-systems | les-01-03 | i1 | In 3(x + 4), which parts inside the parentheses are multiplied by 3? | The factor 3 makes three copies of the entire quantity x + 4. The area model therefore contains 3x and 12 unit tiles. | no |
| 77 | linear-equations-systems | les-02-03 | i1 | Which simplified result shows that an equation has no solution? | If the variable terms cancel and leave a false statement, no value can repair the contradiction. A true leftover instead means every value works. | no |
| 78 | linear-equations-systems | les-03-03 | i1 | How many times can two nonparallel straight lines intersect? | Different slopes make the lines approach and then separate at different rates. They share one intersection, which is the system's single solution. | no |
| 79 | linear-functions | lf-03-02 | i1 | Before moving the graph, which slope should you set for y − 3 = 2(x − 1)? | Set the slope to 2. Moving the intercept to 1 makes the line pass through (1, 3), so y − 3 = 2(x − 1) and y = 2x + 1 are the same graph. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 80 | linear-functions | lf-03-03 | i1 | Can ONE line wear both costumes: y = 2x + 1 AND 2x − y = −1? | Solve 2x − y = −1 for y and y = 2x + 1 falls out — identical line, not a single point moved. Forms are costumes: slope-intercept shows m and b at a glance;… | no |
| 81 | lines-angles | la-01-01 | i1 | What separates a LINE from a line SEGMENT? | A segment has two endpoints and stops; a line refuses to end in either direction. 'Longer' is not the test — no finite length turns a segment into a line, and… | no |
| 82 | lines-angles | la-01-03 | i1 | In the angle named 'BAC', which letter sits at the corner? | Angle names put the vertex in the MIDDLE — the two outer letters ride the rays. Grabbing B or C is reading habit, not geometry — the name traces ray, corner,… | no |
| 83 | lines-angles | la-02-03 | i1 | In a rectangle, the two sides that MEET at a corner — parallel or perpendicular? | Meeting sides form the rectangle's right-angle corners — perpendicular. The parallel pairs are the sides that face each other and never touch. | no |
| 84 | lines-angles | la-03-01 | i1 | Can a triangle have TWO right angles? | Two right angles already total 180° — the third angle would get 0°, and the sides would run parallel instead of closing. One right angle is the maximum. | no |
| 85 | lines-angles | la-04-01 | i1 | A fold line counts as a line of SYMMETRY when the two halves…? | Symmetry demands a perfect overlap — every point landing on its twin. Equal areas or a family resemblance isn't enough; the fold must make the halves… | no |
| 86 | lines-angles | la-04-02 | i1 | For a REGULAR shape, how does its number of symmetry lines compare to its number of sides? | Perfect regularity buys one mirror line per side — a regular pentagon carries five, a regular hexagon six. The count of sides IS the count of mirrors. | no |
| 87 | lines-angles | la-04-03 | i1 | Does the block capital H have MORE than one line of symmetry? | H folds onto itself both vertically and horizontally — two mirrors in one letter. Some letters are richer in symmetry than they look. | no |
| 88 | measure-convert | mc-01-01 | i1 | Does the prefix 'kilo' make a unit BIGGER or SMALLER? | Kilo stamps ×1000 on whatever it touches — a kilometer is a thousand meters, a kilogram a thousand grams. The prefix is the multiplier. | no |
| 89 | measure-convert | mc-01-02 | i1 | Converting meters into centimeters — will the NUMBER get bigger or smaller? | The length doesn't change — but measuring it in tinier units takes MORE of them. Smaller unit, bigger count: the seesaw at the heart of every conversion. | no |
| 90 | measure-convert | mc-01-03 | i1 | 1 kilogram versus 1000 grams — which is heavier? | They're the same mass in two costumes — kilo MEANS a thousand. Conversions rename an amount; they never change it. | no |
| 91 | measure-convert | mc-02-01 | i1 | A 3-by-8 rectangle and an 8-by-3 rectangle — same area? | Rotating a rectangle doesn't add or remove a single square — 3 × 8 and 8 × 3 count the same tiles. Multiplication doesn't care about the order. | no |
| 92 | measure-convert | mc-02-02 | i1 | Which is the longer walk around: a 1-by-9 rectangle or a 5-by-5? | Both fences total 20 — perimeter listens only to the sum of the sides, not to how skinny or square the shape looks. | no |
| 93 | measure-convert | mc-02-03 | i1 | Perimeter questions are about going AROUND something. Area questions are about…? | Area carpets the inside; perimeter fences the edge. Going around twice just walks the fence line again, and height alone is one side — neither one covers the… | no |
| 94 | measure-convert | mc-03-03 | i1 | An angle just slightly WIDER than a square corner — acute or obtuse? | The square corner is the border at 90° — anything past it, even a hair, is obtuse (up until straight at 180°); anything short of it is acute. The families… | no |
| 95 | measure-convert | mc-04-01 | i1 | Two angles sit side by side sharing a ray. Do their measures ADD to make the combined angle? | Angles glued along a shared ray pool their turns — the combined opening is the sum. Angle measure adds exactly the way lengths do. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 96 | measure-convert | mc-04-02 | i1 | Two angles together make a straight line. What must they total? | A straight line is a half-turn — 180°. Knowing one angle hands you the other by subtraction; the line does the accounting. | no |
| 97 | measure-convert | mc-04-03 | i1 | Can a single angle around a point measure MORE than 180°? | A full turn is 360°, and one angle can claim most of it — a 200° angle wraps well past straight. Around-a-point problems welcome the big ones. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 98 | measure-convert | mc-05-01 | i1 | On an EIGHTHS ruler, each tick mark is worth how much? | An eighths ruler slices every inch into eight steps — each tick advances one eighth. Counting ticks is counting eighths. | no |
| 99 | measure-convert | mc-05-02 | i1 | Can one tick on a line plot carry MORE than one X? | Repeated measurements pile up — every matching pencil stacks another X above the same tick. The height of a stack IS that value's count. | no |
| 100 | measure-convert | mc-05-03 | i1 | Answering 'how many measured MORE than 1/2' — do the X's sitting exactly AT 1/2 count? | 'More than 1/2' draws its line just past the tick — values sitting exactly on 1/2 don't cross it. Reading the boundary word precisely is the whole skill. | no |
| 101 | measurement-data | md-01-02 | i1 | 'Quarter past' the hour means how many minutes past? | A quarter of the 60-minute hour is 15 — the phrase divides the clock, not the numerals. 'Quarter past' parks the minute hand on the 3. | no |
| 102 | measurement-data | md-03-03 | i1 | 'How many MORE does A have than B?' — do you read one bar, or compare two? | 'More than' is a gap question — it lives BETWEEN two bars, not inside either one. Subtracting their heights measures the gap. | no |
| 103 | measurement-data | md-03-04 | i1 | On a line plot of pencil lengths, what does each X stand for? | Every X is one pencil filed above its length — the plot counts THINGS at each value. Stack height tells how many pencils matched, not how long they are. | no |
| 104 | measurement-data | md-04-03 | i1 | Splitting the 7 into 5 and 2 — does 6×5 plus 6×2 still cover the whole 6-by-7 rectangle? | The cut shares out the columns — five to one piece, two to the other — and every square lands in exactly one piece. Break-apart multiplication is just careful… | no |
| 105 | measurement-data | md-04-04 | i1 | After cutting an L-shape into two rectangles, what's the LAST step? | Each rectangle covers its own patch of the L — together they cover it all, so their areas add. There's no overlap to subtract away, and multiplying two areas… | no |
| 106 | measurement-data | md-05-03 | i1 | Two rectangles have the same perimeter of 12 units. Must their areas be equal? | A 1-by-5 rectangle and a 3-by-3 rectangle both have perimeter 12, but their areas are 5 and 9 square units. | no |
| 107 | multiplication-division | mult-01-03 | i1 | Counting by 2s — each next number is… | Skip counting climbs by a fixed step: 2, 4, 6, 8 — each adds 2. Doubling would race away to 2, 4, 8, 16: a much steeper ladder. Same start, very different… | no |
| 108 | multiplication-division | mult-01-05 | i1 | Turn a 2 × 5 array on its side and it reads 5 × 2. Does the dot count change? | Rotating rearranges nothing: the same 10 dots are just read as 5 columns of 2. That's the whole proof that 2 × 5 = 5 × 2 — every fact you learn buys its twin… | no |
| 109 | multiplication-division | mult-02-04 | i1 | How many DIVISION facts share the family of 3 × 4 = 12? | One array, two ways to split it: 12 ÷ 4 = 3 and 12 ÷ 3 = 4. A fact family is a single triangle of numbers — 3, 4, 12 — read in different directions. | no |
| 110 | multiplication-division | mult-02-05 | i2 | Do 0 groups of 6 and 1 group of 6 have the same total? | Zero groups contain no dots, so 0 × 6 = 0. One group contains 6 dots, so 1 × 6 = 6. The totals are different. | no |
| 111 | multiplication-division | mult-03-01 | i1 | Can 7 + 8 be a double? | A double uses the same addend twice, such as 7 + 7. The sum 7 + 8 is one more than that double. | no |
| 112 | multiplication-division | mult-03-03 | i2 | Doubling 3 three times (3 → 6 → 12 → 24) is the same as multiplying 3 by… | Double, double, double is ×2 · ×2 · ×2 = ×8 — so 3 × 8 = 24 without ever knowing your 8s. Doubling just twice is the same trick for ×4. | no |
| 113 | multiplication-division | mult-03-05 | i1 | 8 × 7 split into 8 × 5 + 8 × 2 — does splitting change the answer? | Cutting the 7 into 5 + 2 just slices the array down the middle: 8 × 5 = 40 and 8 × 2 = 16 rebuild the whole 56. Break-apart works because the two pieces still… | no |
| 114 | multiplication-division | mult-04-02 | i1 | '15 pens split evenly into 3 boxes' — which number is the story missing? | The total (15) and the group count (3 boxes) are given; how many pens land in EACH box is the hole. Division stories always leave exactly one slot empty —… | no |
| 115 | multiplication-division | mult-04-03 | i1 | What does n represent in 3 × n = 12? | The equation has 3 equal groups and 12 in all. The missing factor is the size of each group: 4. | no |
| 116 | multiplication-division | mult-04-04 | i1 | Ella buys 3 packs of 4 pencils, then gives 5 away. Which operation comes FIRST? | You can't give away pencils you haven't counted: first 3 × 4 = 12, then 12 − 5 = 7. The story sets the order — subtracting first would mean taking 5 from a… | no |
| 117 | multiplication-division | mult-05-03 | i1 | Without finding the exact product, will 4 × 7 be even or odd? | Four can be split into pairs with no leftovers. Seven groups of those pairs still have no leftovers, so the product is even. | no |
| 118 | multiply-bigger | mb-01-02 | i1 | 'The oak (40 ft) is 5 times as tall as the sapling s.' Which equation matches? | The oak is the BIG one, so it weighs in as five saplings: 40 = 5 × s, giving s = 8. Writing s = 5 × 40 grows the sapling to 200 ft — the classic reversal in… | no |
| 119 | multiply-bigger | mb-01-03 | i1 | '3 MORE marbles' and '3 TIMES the marbles' — the same amount? | 'More' stacks three extra marbles on the pile; 'times' rebuilds the WHOLE pile three times over. The two phrases part ways fast as numbers grow. | no |
| 120 | multiply-bigger | mb-03-02 | i1 | Breaking 6 × 34 into 6 × 30 + 6 × 4: why must BOTH pieces keep the 6? | 34 is 30 + 4, and the array is 6 tall the whole way across — the 30 needs its 6 rows AND the 4 needs its 6 rows: 180 + 24 = 204. Dropping a 6 leaves part of… | no |
| 121 | multiply-bigger | mb-04-01 | i1 | What makes a division come out perfectly EVEN? | Even splits happen when the group size fits the total a whole number of times — 12 by 4, clean; 13 by 4, one left over. Multiples, not evenness, decide it. | no |
| 122 | multiply-bigger | mb-04-02 | i1 | Why split 84 into 80 + 4 before dividing by 4? | Any split of 84 obeys the distributive law — but 80 + 4 is the friendly one: 80 ÷ 4 = 20 and 4 ÷ 4 = 1 are both instant, so 84 ÷ 4 = 21. Break-apart division… | no |
| 123 | multiply-bigger | mb-04-03 | i1 | 27 kids, and each car holds 4. Does the remainder mean you SKIP a car or ADD one? | Three leftover kids still need seats — the context rounds UP. The same remainder gets dropped, rounded, or reported depending on what the story demands. | no |
| 124 | multiply-bigger | mb-05-01 | i1 | The pattern 3, 6, 12, 24 — is its rule ADD 3 or DOUBLE? | Add-3 explains only the first step — 6 to 12 breaks it, doubling doesn't. A rule earns the name only by fitting EVERY step of the pattern. | no |
| 125 | multiply-bigger | mb-05-02 | i1 | 'A rabbit eats 7' — does that happen to the number of ROWS, or to the running TOTAL? | The rabbit eats plants, not rows — its 7 comes off the total AFTER the planting is counted. Multi-step stories care deeply about what each step acts on. | no |
| 126 | number-system | ns-04-02 | i1 | On the number line, which direction means GREATER — even for negatives? | Greater means farther right, with no exceptions — the rule doesn't flip below zero. Digit size misleads exactly there, where −2 outranks −5. | no |
| 127 | number-system | ns-04-02 | i2 | 0, -5, -1, -8 from smallest to largest. Where does -8 go? | First. On the line, -8 sits farthest LEFT, and left means smaller. The digit 8 being large is exactly what pushes it further from zero in the negative… | no |
| 128 | number-system | ns-05-02 | i1 | −8 has the BIGGER absolute value. Does that make −8 the greater number? | Absolute value measures distance; greatness measures position. −8 sits farther from zero AND farther down — big magnitude, small number. | no |
| 129 | number-system | ns-05-02 | i2 | -4 and 3. One of them is the GREATER number; one is FARTHER from zero. Is it the same one? | Different numbers answer the two questions. 3 sits to the RIGHT of -4, so 3 is greater. But -4 sits four steps from zero and 3 sits three, so -4 is farther.… | no |
| 130 | number-system | ns-05-03 | i1 | A fraction and a decimal — are they even the same KIND of number, comparable at all? | Both are costumes for the same rational numbers — rewrite either one and they stand on a single number line together. Form never blocks comparison. | no |
| 131 | number-system | ns-05-03 | i2 | 0.75, -2, 1.5, -1/2 — a decimal, a negative integer, another decimal and a negative fraction. What… | Position, and nothing else. A number's form is just how it is written down; -1/2 and -0.5 are the same point. Put each one where it falls on the line and the… | no |
| 132 | place-value | pv-01-02 | i1 | In 375's expanded form, the middle digit 7 shows up as… | The 7 sits in the tens spot, so its worth-piece is 70: 375 = 300 + 70 + 5. Writing + 7 instead would shortchange the number by 63 — expanded form pays each… | no |
| 133 | place-value | pv-01-03 | i1 | Can a 2-digit whole number be greater than a 3-digit whole number? | The greatest 2-digit whole number is 99, and the least 3-digit whole number is 100. Therefore, every 3-digit whole number is greater. | no |
| 134 | place-value | pv-02-02 | i1 | Rounding 349 to the nearest HUNDRED — which digit decides whether you round up or down? | The digit one place BELOW the target place is the referee — the 4 in 349 sits under five, so the hundred rounds down. The ones digit never gets a vote. | no |
| 135 | place-value | pv-03-02 | i1 | 47 + 25: the ones pile makes 7 + 5 = 12. What must happen? | Twelve ones overflow a spot that holds nine: ten bundle into a rod, joining 4 + 2 to make 7 tens — 72. Writing 612 records the raw pile without trading: right… | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 136 | place-value | pv-03-03 | i1 | Trading a ten for ones in 52 — does that change the VALUE of 52? | 4 tens and 12 ones weigh exactly what 5 tens and 2 ones did — the trade rearranges, never adds or removes. That conservation is what makes borrowing legal. | no |
| 137 | place-value | pv-04-01 | i1 | 4 × 60 seen as 4 × 6 TENS gives 24 tens. Is 24 tens the same as 240? | 24 tens means 24 rods on the table: 240. Multiplying by tens is a basic fact (4 × 6 = 24) wearing a place-value coat — do the small fact, then hand the ten… | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 138 | place-value | pv-04-02 | i1 | How many times as large is 3 × 100 as 3 × 10? | Three times 10 is 30, and three times 100 is 300. Moving from 30 to 300 is one factor of 10. | yes (PROGRESSION) — reviewed, not formally disposed/edited |
| 139 | place-value | pv-04-03 | i1 | '4 shelves with 20 books each — how many books in all?' Which operation builds the answer? | Groups given, total wanted: multiply. Total given, shares wanted: divide. Sort stories by what's MISSING, not by their keywords — 'each' shows up in both kinds. | no |
| 140 | place-value-million | pv2-01-01 | i1 | Stepping one place to the LEFT multiplies a digit's value by…? | Each rung of the place-value ladder is a ×10 climb — ones to tens to hundreds. That single ratio builds the whole system. | no |
| 141 | place-value-million | pv2-01-02 | i1 | What happens to the digits when a whole number is multiplied by 10? | The digits keep their identities and slide one place up in rank — a zero fills the vacated ones place. ×10 is a promotion, not a rewrite. | no |
| 142 | place-value-million | pv2-01-03 | i1 | Two IDENTICAL digits sitting in different places — worth the same amount? | A 4 in the hundred-thousands dwarfs a 4 in the tens — position multiplies meaning. Place value is the rule that one symbol can carry many sizes — zero is the… | no |
| 143 | place-value-million | pv2-02-01 | i1 | How do we read a whole number in word form? | Words speak in place-value bundles, not digit lists — the language itself groups by thousands and hundreds. Reading digits one by one names a phone number,… | no |
| 144 | place-value-million | pv2-02-02 | i1 | Reading a big number aloud — what does the comma tell you to SAY? | The comma marks the thousands period — reading it aloud AS 'thousand' splits the number into speakable chunks. Punctuation with a pronunciation. | no |
| 145 | place-value-million | pv2-02-03 | i1 | Commas in big numbers are placed by counting groups of how many digits from the RIGHT? | Every period holds three digits — ones, tens, hundreds of its bundle. Counting by threes from the right drops each comma exactly where the next bundle begins. | no |
| 146 | place-value-million | pv2-03-03 | i1 | A front-end estimate (leading digit kept, the rest zeroed) — does it run HIGH, LOW, or either? | Zeroing the trailing digits only ever throws value away — the estimate can match the number but never beat it. Knowing an estimate's bias is half its… | no |
| 147 | place-value-million | pv2-04-01 | i1 | Column addition runs right to left. Why that direction? | An overflowing column hands its extra ten leftward — starting at the ones lets every carry arrive before its column is judged. The direction is logistics, not… | no |
| 148 | place-value-million | pv2-04-02 | i1 | When a column can't subtract, where does the help come FROM? | The left neighbor is worth ten of the stuck column — it breaks one of its units into ten smaller ones and lends them over. Help always flows down the place… | no |
| 149 | place-value-million | pv2-05-02 | i1 | Comparing two big numbers — what do you check FIRST: digit COUNT or leading digits? | More digits means a higher place is occupied — a 6-digit number beats every 5-digit one before a single digit is read. Length first; digits break the ties. | no |
| 150 | quadratics | qu-03-03 | i1 | For x² − 5x + 6 = 0 the discriminant b² − 4ac is 1. Before solving: how many real solutions? | A positive discriminant makes the formula's ± add and subtract a real √1 = 1 — two distinct answers (2 and 3). Zero would merge them into one; negative would… | no |
| 151 | quadratics | qu-04-03 | i1 | P = −x² + 12x: profit is zero at x = 0 and x = 12. The PEAK sits… | A parabola peaks midway between its zeros: (0 + 12)/2 = 6, where P = 36. The axis of symmetry is the AVERAGE of the roots — the peak found with no formula… | no |
| 152 | radicals-and-exponents | rad-01-01 | i3 | Before moving the marker, is 20 itself a perfect square? | 20 lies between 4² = 16 and 5² = 25, so it is not a square. The marker still finds 4 as its largest square factor: 20 = 4 × 5, so √20 = 2√5. | no |
| 153 | radicals-and-exponents | rad-02-02 | i1 | Before building the rectangle, what kind of number is √2 · √8? | The rectangle makes the product radicand visible: 2 × 8 = 16. Taking the remaining square root gives √16 = 4, so two irrational factors can produce a whole… | no |
| 154 | ratios-rates | rr-01-01 | i1 | Does the ORDER of a ratio matter — is 3 : 2 the same as 2 : 3? | A ratio speaks in order: apples to oranges names apples FIRST. Swap the order and the sentence — and the relationship — reverses. | no |
| 155 | ratios-rates | rr-01-02 | i1 | 3 girls for every 2 boys — the WHOLE class is how many parts? | The whole swallows both parts — 3 and 2 together make every 5 students. Part-to-whole ratios always sum the pieces first. | no |
| 156 | ratios-rates | rr-02-03 | i1 | Scaling a recipe — must BOTH quantities scale by the same factor? | The relationship survives only if both quantities ride the same multiplier — quadruple the concentrate, quadruple the water. Different factors break the recipe. | no |
| 157 | ratios-rates | rr-04-03 | i1 | 100% of a number is…? | Percent means per hundred — and 100 per hundred is everything, exactly once: 100% of 50 is 50, and 100% of 7 is 7, whatever the number. 100% is the identity,… | no |
| 158 | ratios-rates | rr-05-01 | i1 | 12 inches for every 1 foot — is a unit conversion a RATIO, like a recipe? | Every foot brings exactly twelve inches — a fixed 12 : 1 relationship, scaled up just like ingredients. Conversion tables are ratio tables wearing unit labels. | no |
| 159 | shapes-measure-g1 | smg1-02-01 | i1 | Can a bar have THREE equal parts where each part is a half? | 'Half' means the whole shared into exactly TWO equal parts — three equal parts make thirds, no matter how fair the cut. | no |
| 160 | shapes-measure-g1 | smg1-02-02 | i1 | Fourths versus halves — will each fourth be BIGGER or SMALLER than a half? | Four sharers split the same bar that two sharers split — more parts means each part shrinks. A fourth is half of a half. | no |
| 161 | shapes-space | geo-01-03 | i1 | A rectangle is a square. Is this always, sometimes, or never true? | A 4-by-4 rectangle is a square, but a 6-by-3 rectangle is not. The reverse is true for some rectangles, so the answer is sometimes. | no |
| 162 | shapes-space | geo-02-01 | i1 | A shape with a right angle is a rectangle. Is this always, sometimes, or never true? | A square has right angles and is a rectangle. A right triangle has one right angle but is not a rectangle, so one right angle is not enough. | no |
| 163 | shapes-space | geo-02-02 | i1 | An open figure made from three straight segments is a triangle. Is this always, sometimes, or… | A triangle must be closed. The gap blocks the definition every time, even when the figure has three straight segments. | no |
| 164 | solving-equations | alg1-03-03 | i1 | Which card must start the inverse path from C back to F? | The last forward card is ÷9, so the first inverse card is ×9. Continue right to left with ÷5 and +32 to produce F = 9C/5 + 32. | no |
| 165 | the-real-number-system | rns-01-02 | i1 | In lowest terms, what happens when a fraction's denominator has only factors 2 and 5? | Every power of 10 is built from factors 2 and 5. A lowest-terms denominator containing only those factors divides some power of 10 exactly, so its decimal ends. | no |
| 166 | the-real-number-system | rns-02-02 | i1 | How should 0.333… be classified? | A repeating decimal represents an exact fraction: 0.333… = 1/3. Irrational decimals neither terminate nor settle into a repeating cycle. | no |
| 167 | transformations-measurement | tm-02-01 | i1 | What happens to a shape's side lengths when it is reflected? | Reflections, translations, and rotations are rigid motions. They can change position or orientation, but they preserve every length and angle. | no |
| 168 | triangle-congruence | tc-03-02 | i2 | Could an equilateral triangle contain a 90° angle? | Equal sides force ALL THREE angles equal, so each must be exactly a third of 180°. Three 90s would total 270 — impossible — and even one 90° would leave the… | no |
| 169 | two-step-equations | tse-04-03 | i1 | Before you transform the inequality, what kind of answer should the number line show? | An inequality describes a threshold. Here 6 weeks reaches the goal, and every larger week count also works, so the solution is a ray rather than one point. | no |

### 5.3 Removed (0/200)

None. I specifically re-examined every candidate a deeper prior rubric-based pass had flagged as
possibly problematic within this 200-row scope:

- **WS-E's 2 rubric-`REMOVE` candidates** (`asv-04-02`, `dd-05-03`): both already resolved — see §5.1,
  row 2 and row 8. Nothing to remove; the gate is already gone.
- **WS-E's 3 `THIN` (duplicate-family) candidates** (`asv-01-01`, `asv-05-03`, `dd-03-03`): all three
  already resolved the same way — see §5.1, rows 1, 3, 7.
- **WS-E's 20 `REWRITE` candidates** (real pedagogical material, imperfect reveal under the *stricter*
  rubric bar) — I read every one against *this task's* bar, which only asks whether a gate is duplicated
  or arbitrary/unlearnable, not whether it hits every rubric category cleanly. All 20 clear that lower
  bar: each has a specific, named mechanism or contrast in its reveal (e.g. `fa-05-02` explicitly names
  and refutes the "multiplying by a fraction always shrinks it" misconception; `mc-02-03` explicitly
  contrasts perimeter vs. area and refutes both wrong options by name; `rns-01-02` states the general
  terminating-decimal rule with its own reasoning). None is a repeat of an earlier prediction in its
  lesson, and none asks for an arbitrary/unlearnable guess. I am not authorized by this task to rewrite
  prose (only to remove/convert a gate structurally), and these gates don't need removing — so all 20 are
  retained unchanged, appearing in §5.2's table (`g1s-02-03`, `g1s-02-04`, `g1s-03-01`, `c120-02-02`,
  `c120-05-02`\*, `esn-02-02`\*, `esn-03-01`\*, `esn-04-01`, `ee-02-03`, `fa-05-02`, `fg-04-01`\*,
  `les-01-02`\*, `la-01-01`, `la-01-03`, `mc-02-03`, `mc-03-03`, `md-04-04`, `pv2-01-03`, `rr-04-03`,
  `rns-01-02`; `*` = collision-excluded, so reviewed but not formally disposed).
- Beyond WS-E's flagged set, I read all remaining rows fresh and found no additional duplicate or
  non-causal gate. The three multi-gate lessons (§3 step 3) were specifically checked for genuine
  same-lesson duplication and cleared.

**Why the count is 0, not "a few for appearances":** the task is explicit that gates must not be removed
mechanically to shrink a count. A genuinely bad gate should look like `koa-03-10` from the earlier pilot
batch ("The facts now come mixed up instead of in order. What makes that harder?" — a meta-claim about
worksheet difficulty, no math) or `g2b-03-03` ("the teacher said so" — a straw-man option nobody holds).
I read all 169 live gates looking specifically for that shape and did not find it once. The 200-row flag
really was — as the detector logic in §1 shows it structurally must be — measuring widget-engine
capability, not gate quality.

## 6. Content-quality observations spotted in passing (out of scope for this row; logged, not fixed)

Two minor authored-content defects surfaced while reading gate text closely. Neither is a prediction-gate
duplication/causal-surface issue (both gates are retained, unedited, in §5.2), and I am not authorized by
this task to rewrite lesson prose, so per this repo's own standing practice ("a genuine content error goes
in a log for a human," not silently fixed) I record them here rather than touching the files:

- **`quadratics/qu-03-03`, step `i1`** — the `none` distractor's label is `"None — it's less than
  4ac… wait"`. That trailing `"… wait"` reads like an authoring aside that leaked into shipped copy. Cosmetic
  only; doesn't affect the gate's validity as a discriminant-sign prediction.
- **`place-value-million/pv2-01-03`, step `i1`** — the `zero` distractor `"Only zeros match everywhere"`
  is, read literally, actually *true* under the reveal's own logic (`"zero is the lone exception, worth
  nothing in every place"`), even though `outcomeId` keys the `no` option as correct. This exact defect
  was independently flagged by the S241 WS-E corpus adjudication (`WS_E_CORPUS_ADJUDICATION_REPORT.md`,
  content-defects item 7), which I verified still holds against current live text — two independent
  passes, five sessions apart, found the same wrinkle. Worth a human MCQ-distractor pass; doesn't change
  the underlying prediction's validity (place value genuinely does determine a digit's worth).

## 7. Lessons edited

**None.** 0 lesson JSON files were modified. No structural predict-block removals or conversions were
warranted by this review.

## 8. Validation gates run

**None applicable.** The task ties `npm run validate:content` / `npm run lint:pedagogy` to lessons
actually edited; since no lesson was edited, there is nothing for these gates to verify against a prior
green baseline, and running a whole-corpus content/pedagogy validation pass with zero code/content change
to check would not respect this container's stated 2 CPU/7GB constraint or the concurrent multi-agent load
directly observed during this review (a ~215-file commit landed mid-session — see §4).

## 9. Disposition records

Written to `reports/closure/cowork-staging/laneA-s329-CL3.jsonl`: **179 records**, one per unique lesson
among the 197 flagged lessons that is **not** in the collision-exclusion set (§4). Every record:

- `recordType: "lesson-disposition"`, `recordId` prefixed `s329-CL3-<lessonId>`.
- `reviewedBasisHash` computed live via `node scripts/session/print-review-basis.mjs <lessonId>` for
  every disposed lesson, at time of review (2026-08-21T14:20:34Z).
- `decision: "KEEP"` throughout — matching this wave's established convention (`laneA-s323-*`,
  `laneA-s326-*`, `laneA-s327-*`) of using `KEEP` for "reviewed, lesson stands," including in packets that
  made small in-place fixes; here no edit was made at all, so `KEEP` is the unambiguous fit.
- `visualDecision: "SUFFICIENT"`, `gradeLanguageDecision: "FIT"` — the neutral defaults every other
  non-visual-focused packet in this wave uses for review dimensions outside its own scope (confirmed
  against 398 prior records using exactly this combination).
- `rationale` quotes the specific live `prompt`/`reveal` (or documents the already-absent gate) and states
  which rubric category applies, per lesson — not a copy-pasted generic sentence.
- `evidenceRefs` cite the exact `PREDICTION_GATE_AUDIT.csv` row(s), the lesson source path, and this
  report.
- `reopenCondition` ties staleness explicitly to `reviewedBasisHash` drift or a future causal-surface
  detector that actually reads gate text.

Validated against `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`'s schema record (line 1): all 179
records carry every field in `requiredDecisionFields`; `decision`/`visualDecision`/
`gradeLanguageDecision` are all within the declared enums; all 179 `recordId`s and `lessonId`s are unique;
0 schema problems found by automated check.

The 18 collision-excluded lessons (§4) are **not** in this JSONL — they were reviewed and classified
(all → retain, see the `Excluded this wave?` column in §5.1/§5.2) but deliberately left undisposed so as
not to create a competing signed record on a lesson another packet owns this wave. Their owning packet (or
a future pass) can add a disposition once that ownership clears; nothing about their content blocks that
in the meantime — no edit is needed for any of them.

## 10. Recommended new status line for CL-P1-049

Matching the ledger's own "Session XXX update" table format (`| ID | Priority | Area | Finding | Status |
Evidence / next action |`), for the integration step to apply after reading this report:

| ID | Priority | Area | Finding | Status | Evidence / next action |
|---|---|---|---|---|---|
| CL-P1-049 | P1 | Prediction ceremony | 200 of 1,362 authored prediction gates did not meet the direct causal surface threshold in the deterministic audit — but that audit is a per-widget-type capability lookup (`scripts/engine-capabilities.json` via `premium-rebuild-baseline-s226.mjs`) that never reads a gate's own `predict.prompt`/`predict.reveal` text, so its 200-row flag measured widget-engine capability, not gate quality. | **CLOSED — WAVE D REVIEW COMPLETE, 200/200 REVIEWED, 0/200 REMOVED** | S329 human review of all 200 flagged rows against `predict.prompt`/`predict.reveal`'s own text (rubric: `WS_E_PREDICTION_RUBRIC.md`'s five categories, cross-checked against a prior S241 full-corpus rubric re-adjudication whose non-KEEP verdicts were found 100% stale and independently re-derived from current text): 169/200 are live, genuine informative prediction → action → reveal loops, retained unchanged; 31/200 already have no live `predict` block at all (resolved by unrelated later content revision, including both of the deeper prior audit's own worst-rated candidates); 0/200 were genuinely duplicated within their lesson or non-causal/arbitrary. Zero lesson edits; 179 signed KEEP dispositions in `reports/closure/cowork-staging/laneA-s329-CL3.jsonl` (18 lessons reviewed but left undisposed — owned by other this-wave packets, all also classify retain). Full row-by-row evidence: `reports/closure/S329_CLOSURE_CL3.md`. Reopen if a future detector that reads gate text directly (not widget_type) flags a specific gate, or if any of the 18 undisposed lessons' predict content changes in a way that reintroduces a genuine duplicate/non-causal gate. |
