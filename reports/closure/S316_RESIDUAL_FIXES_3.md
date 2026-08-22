# S316 Residual Fixes — batch 3

Bounded fix-up worker. Scope: exactly 3 items. Read first `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`,
then `reports/closure/S316_LANEAV2_G5U_VERIFICATION.md` (the verifier finding for items 1–2) and
`reports/closure/S316_LANEB_MMT_LC_TGI_IMPLEMENTATION.md` (the implementer note for item 3's
context). NDJSON ledger: `reports/closure/cowork-staging/laneA-residuals-3.jsonl` (3 rows).

## Item 1 — `content/courses/unlike-fractions-g5/lessons/g5u-01-02.json` — STATUS: FIXED

**Defect (per S316-R verification, REVISE):** the remedial check (`rem-g5u-find-common-k`)
regressed from a model-backed `numeric` widget carrying `previewDenominator: 6` to a text-only
`mcq`. The signed S253 rationale explicitly demanded "a visual diagnostic transfer task"; the
concept step kept its figure, but the check step — where the diagnostic judgment actually happens
— lost its own model-bearing surface.

**Fix:** studied the pre-edit shape via `git diff HEAD -- <file>` (numeric, `previewDenominator: 6`,
`answer: 3`, two `commonErrors`, `fallbackFeedback`/`successFeedback`) and the sibling numeric
checks in the same lesson (k1, k3), then converted the check back to that `numeric` shape —
**while keeping** the diagnostic scenario the mcq revision had introduced (a named learner
mistake: scaling the denominator only), so the S316-R distinctness gain is not lost:

```json
"widget": {
  "type": "numeric",
  "prompt": "A learner scales 1/2 to sixths but writes 1/6, changing only the bottom. What is the correct numerator?",
  "answer": 3,
  "tolerance": 0,
  "unit": "",
  "previewDenominator": 6,
  "commonErrors": [
    { "value": 1, "feedback": "Keeping the top fixed while the bottom triples turns 1/2 into the much smaller fraction 1/6." },
    { "value": 6, "feedback": "Matching the numerator to the denominator makes the fraction equal to one whole, not one half." }
  ],
  "fallbackFeedback": "Give both fractions the same piece size first; after that the pieces simply count.",
  "successFeedback": "Correct — 3 — scaling by 3/3 has to reach the top as well, or the fraction's value silently changes to 1/6."
}
```

**Verification:**
- JSON parses (`python3 -m json.tool` / `json.load`).
- Model-backed: `previewDenominator: 6` + `answer: 3` renders a live 3/6 partition bar per
  `numericPreviewParts` in `src/lib/schema.ts` (`shaded=3 <= total*2=12`, `total=6 <= 20`) — this is
  the model-bearing surface the S253 rationale asked for, restored.
- Distinct (exact and normalized digit→#) from every other widget prompt in the lesson: `c1` has
  no widget; `i1` "Rename 1/3 as twelfths."; `k1`/`k3` "1/2 = ?/6. …"; `k2`/`ch1` "Scale 1/4 by
  ×2…"; `i2` "A learner changed only the denominator and built 1/12. Repair the bar…". The new
  remedial prompt ("A learner scales 1/2 to sixths but writes 1/6, changing only the bottom…")
  normalizes to a distinct string from every one of these.
- Not producible by the lesson's declared `g4-fractions` generator forms
  (`faEquivalenceRecapNumeric`, `faEquivalenceRuleNumeric` — read from `src/lib/g4Variants.ts`):
  neither template can print a "a learner … but writes …, changing only the bottom" sentence.
- Traps recomputed by hand: `1/2` scaled ×3 to sixths → numerator `3` (correct). Trap `1` = top
  left unchanged (the exact mistake the prompt narrates) → `1/6`, a real, different fraction from
  `1/2`. Trap `6` = numerator matched to denominator → `6/6` = one whole, not one half. Both traps
  are distinct from the answer and from each other, and their feedback names the numbers actually
  drawn (`1/2`, `1/6`, `3/6`) — no invented rounding, no generic "try again."
- `remedials[0].concept` (body/narration/figure) untouched.

## Item 2 — `content/courses/unlike-fractions-g5/lessons/g5u-01-04.json` — STATUS: FIXED

**Defect (per S316-R verification, REVISE + independent R6 finding):** the rewritten remedial
concept body — *"1/2 and 1/3 into sixths: the first scales by 3, the second by 2. Different
factors, same destination."* — literally states the answer to the immediately-following mcq check
(`rem-g5u-rename-k`), whose correct option is *"1/3 needs ×2, not ×3 — only 1/2 needs ×3 to reach
sixths."*

**Fix:** reworded `remedials[0].concept.body` and `.narration` (kept byte-identical to each other,
per S316-R R7) to teach the underlying idea — what a common denominator is, and that each fraction
is scaled by its own factor — **without** naming which factor (×3 or ×2) belongs to which
fraction:

```
"A common denominator lets 1/2 and 1/3 share the same piece size: sixths. Renaming never changes
either fraction's value — each fraction is scaled up by whatever factor turns its OWN denominator
into 6, and that factor can differ from one fraction to the next."
```

`remedials[0].concept.figure` (`fm-common-denom`) and the entire `check` step (prompt, options,
answer, feedback) are untouched.

**Verification:**
- JSON parses.
- Literally true and consistent with the `fm-common-denom` figure's own numbers (1/2→3/6,
  1/3→2/6): "share the same piece size: sixths" and "each fraction is scaled up by whatever factor
  turns its OWN denominator into 6" both hold.
- Checked directly (printed body + check prompt/options side by side, see below): no `×2`/`×3`
  factor-to-fraction assignment appears in the body, so the check's specific diagnostic judgment
  ("which fraction needs which factor") is no longer pre-answered:

```
body: A common denominator lets 1/2 and 1/3 share the same piece size: sixths. Renaming never
      changes either fraction's value — each fraction is scaled up by whatever factor turns its
      OWN denominator into 6, and that factor can differ from one fraction to the next.

check prompt:  To rename 1/2 and 1/3 both to sixths, a learner scales both by ×3. What is wrong
               with that plan?
correct option: 1/3 needs ×2, not ×3 — only 1/2 needs ×3 to reach sixths
```

## Item 3 — `src/lib/content.plotData.s237.test.ts` — STATUS: PARTIAL (22/29 passing; 7 residual
failures, all attributable to two causes outside this packet's 3-file scope — see below)

**Task:** extend the hardcoded exact-19 corpus allowlist to the 23 that should now exist after
S316 Lane B's 4 truthful `mmt-05-03` plotData additions (`i1`, `k1`, `i3`, `k3`), and get
`npx vitest run src/lib/content.plotData.s237.test.ts` green.

**What was done, entirely inside this one file:**

1. Extended the primary allowlist ("is declared on exactly the N measured steps…") from the
   literal 19 to 23, inserting `mmt-05-03/i1`, `/i3`, `/k1`, `/k3` in sorted position, and updated
   the test title/comment (19 → 23).
2. Extended the *secondary* allowlist ("exactly the N variant-bearing steps regenerate; the M
   static rows…", lines ~561–585 pre-edit) from 11/8 to 13/10: `mmt-05-03/k1` and `/k3` (which
   declare a `variant`) added to the variant-bearing list, `mmt-05-03/i1` and `/i3` (no `variant`)
   added to the static list — this second, independent hardcoded allowlist was not mentioned in
   the task but would otherwise regress the same way the first one did, for the same reason.
3. Added a new `plotStatedIn()` notation — `"N x's above the number V [and N x above the number
   V …]"`, mmt-05-03's own authored sentence shape — and a new `answerFromPlot()` case —
   `"How many data points are at V?"` — so the independent-route parser can actually verify the 4
   new rows' own truthfulness (prompt↔plotData agreement, plot↔frozen-answer agreement), not just
   count them. Without this, all 4 new rows would fail "every declared plot agrees with its OWN
   prompt" and "the drawn plot is the dataset the FROZEN ANSWER comes from" — silently defeating
   the gate's actual purpose while merely satisfying the count.

**old → new allowlist counts** (as required to log): primary allowlist **19 → 23**; secondary
(variant-bearing / static) allowlist **11/8 → 13/10**.

**Result:** `npx vitest run src/lib/content.plotData.s237.test.ts` → **22/29 passing** (up from
21/29 measured before this edit — the pre-existing baseline was *already* red, for reasons
unrelated to this task). Full verbatim output below.

**Why it is not fully green, and why that is not addressed here:** measuring the corpus directly
(not trusting the task's stated "4 additions / target 23") found the true current declared count
is **24**, not 23. All 7 residual failures trace to exactly two causes, neither of which is among
the 4 named `mmt-05-03` additions and neither of which lives in, or is fixable from, the 3 files
this packet is scoped to:

1. **`content/courses/data-line-plots-g2/lessons/g2g-01-03.json` step `k3`** already carries a
   truthful `plotData` block (`{values:[4,5],counts:[2,1]}`, matching its mcq's correct option
   "Two Xs at 4; one at 5") that **predates this session** — it is not in `git diff HEAD` for that
   file, and it is not one of the 7 files S316 Lane B's implementation touched (that report cites
   it only as a pre-existing correct-usage *example*, in the passage justifying `mmt-05-03`'s own
   field choice). It was never added to this gate's allowlist and its mcq uses a `"The record is
   4, 4, 5."` raw-list phrasing this gate's independent-route parser has no case for. Building one
   would require inventing a general "count-word (One/Two/…) → number, multi-clause option-label"
   parser validated against exactly one existing example in the whole corpus — which would just
   re-encode the expected answer rather than independently verify it, defeating the stated purpose
   of this gate's own design ("a parser that returns null for everything… would pass a gate
   written only in the positive direction"). That is a real, separate piece of design work, not an
   allowlist extension, and it is outside this packet's remit.
2. **`mmt-05-03/k1` and `/k3`** pair a declared `variant`
   (`g2-measure-money-time` / `MmtLinePlotNumeric`) with `plotData`, but that generator's handler —
   `src/lib/g2Variants.ts:59`, the shared `num()` builder — never sets a `plotData` field on the
   regenerated widget. So on re-ask these two steps' generated widget carries no plot at all,
   failing all 4 "survives the re-ask" regeneration subtests for those two rows. Fixing this
   requires editing `src/lib/g2Variants.ts` — a 4th file, outside this packet's 3-file scope. This
   is precisely the risk the S316 Lane B implementer's own note flagged as "a virtual certainty"
   but explicitly left unfixed as out of its own 7-file scope; it remains unfixed here for the
   same reason.

Per the governing authority document (`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`): *"Treat
any mismatched source… as stale. Stop the packet and return the mismatch; do not repair or
reinterpret authority silently."* Both causes above are exactly that kind of mismatch — real,
pre-existing, and outside this packet's file boundary — so they are reported here rather than
silently fixed by expanding scope to a 4th/5th file, and rather than papering over them by
weakening the gate (e.g. excusing `mmt-05-03/k1`/`/k3` from the regeneration requirement, which the
gate is correctly right to demand).

**Confirmed clean attribution:** every one of the 7 residual failures names either `g2g-01-03/k3`
or `mmt-05-03/k1`/`/k3`'s *regeneration* (not its authored/static form) — none of the 4 mmt-05-03
additions fail on their own authored truthfulness; the "the drawn plot is the dataset the FROZEN
ANSWER comes from" test (which covers `i1`/`i3`'s numeric answers directly, and `k1`/`k3`'s
*authored* prompt↔plotData agreement via the "every declared plot agrees with its OWN prompt"
test) passes cleanly for all 4.

### Verbatim test output

```
 RUN  v4.1.10 /home/user/maggies-trail

 ❯ src/lib/content.plotData.s237.test.ts (29 tests | 7 failed) 648ms
     × is declared on exactly the 23 measured steps of the inline-dataset family 14ms
     × every declared plot agrees with its OWN prompt, mark for mark and X for X 3ms
     × for the mcq rows, the CORRECT OPTION states the value the drawn plot fixes 1ms
     × exactly the 13 variant-bearing steps regenerate; the 10 static rows are the ones expected 2ms
     × each variant-bearing step regenerates WITH a plot that agrees with its regenerated prompt 9ms
     × the regenerated plot is the dataset the regenerated ANSWER comes from 5ms
     × the generated plots are FRESH — the picture moves with the seed, not just the sentence 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData — the corpus contract > is declared on exactly the 23 measured steps of the inline-dataset family
AssertionError: expected [ Array(24) ] to deeply equal [ Array(23) ]

- Expected
+ Received

@@ -1,7 +1,8 @@
  [
    "dd-02-01/i1",
+   "g2g-01-03/k3",
    "g2g-01-05/k1",
    "g2g-01-05/k3",
    "g2g-01-05/rem-g2g-mode-k",
    "g2g-03-03/k3",
    "mc-05-02/k2",

 ❯ src/lib/content.plotData.s237.test.ts:394:65

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData — the corpus contract > every declared plot agrees with its OWN prompt, mark for mark and X for X
AssertionError: g2g-01-03/k3: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "the prompt states no dataset this reader can find: The record is 4, 4, 5. Which line-plot stacks match it?",
+ ]

 ❯ src/lib/content.plotData.s237.test.ts:429:82

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData — the corpus contract > for the mcq rows, the CORRECT OPTION states the value the drawn plot fixes
AssertionError: g2g-01-03/k3: no answer shape recognised: expected null not to be null
 ❯ src/lib/content.plotData.s237.test.ts:490:78

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData survives the re-ask: every declared generator emits it > exactly the 13 variant-bearing steps regenerate; the 10 static rows are the ones expected
AssertionError: expected [ 'dd-02-01/i1', 'g2g-01-03/k3', …(9) ] to deeply equal [ 'dd-02-01/i1', 'g2g-01-05/k1', …(8) ]

- Expected
+ Received

@@ -1,7 +1,8 @@
  [
    "dd-02-01/i1",
+   "g2g-01-03/k3",
    "g2g-01-05/k1",
    "g2g-01-05/k3",
    "g2g-01-05/rem-g2g-mode-k",
    "g2g-03-03/k3",
    "mmt-05-03/i1",

 ❯ src/lib/content.plotData.s237.test.ts:579:71

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData survives the re-ask: every declared generator emits it > each variant-bearing step regenerates WITH a plot that agrees with its regenerated prompt
AssertionError: mmt-05-03/k1 seed 0: regenerated WITHOUT a plot: expected undefined to be defined
 ❯ src/lib/content.plotData.s237.test.ts:603:91

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData survives the re-ask: every declared generator emits it > the regenerated plot is the dataset the regenerated ANSWER comes from
TypeError: Cannot read properties of undefined (reading 'denominator')
 ❯ src/lib/content.plotData.s237.test.ts:635:33

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  src/lib/content.plotData.s237.test.ts > plotData survives the re-ask: every declared generator emits it > the generated plots are FRESH — the picture moves with the seed, not just the sentence
AssertionError: mmt-05-03/k1: the plot ignores the seed: expected 1 to be greater than 3
 ❯ src/lib/content.plotData.s237.test.ts:656:77

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 22 passed (29)
   Start at  02:26:51
   Duration  5.88s (transform 4.09s, setup 79ms, import 4.82s, tests 648ms, environment 0ms)
```

## Files touched (exactly the 3 scoped)

- `content/courses/unlike-fractions-g5/lessons/g5u-01-02.json`
- `content/courses/unlike-fractions-g5/lessons/g5u-01-04.json`
- `src/lib/content.plotData.s237.test.ts`

No other file was edited. `content/courses/measure-money-time/lessons/mmt-05-03.json` and
`src/lib/g2Variants.ts` — the two files that would be required to close item 3's remaining 7
failures — were read but not touched, per the 3-file boundary.

## Next owner

To fully close item 3: (a) decide and implement an independent-route verification (or an explicit,
named exclusion in the style of `dd-02-01/i1`'s own `STATED_IN_LESSON_BODY` special case) for
`g2g-01-03/k3`'s "which stacks match" raw-list mcq shape, and add it to the corpus allowlist; (b)
extend `src/lib/g2Variants.ts`'s `MmtLinePlotNumeric` handler to emit a `plotData` block on
regeneration so `mmt-05-03/k1`/`/k3` honor the "declared variant ⇒ regenerates with a plot"
contract this gate enforces for every other variant-bearing row.

---

## Follow-up — coordinator scope extension: plotData gate closed to green

The coordinator granted scope extension for exactly two files to close both residual causes named
above: (1) `content/courses/measure-money-time/lessons/mmt-05-03.json` — remove the `variant` key
from steps `k1` and `k3` only; (2) `src/lib/content.plotData.s237.test.ts` — add an independent
verification route for `g2g-01-03/k3`'s "which stacks match" mcq shape. Both were implemented; the
gate is now **fully green: 30/30** (29 pre-existing tests + 1 new dedicated test for
`g2g-01-03/k3`).

### (1) `mmt-05-03.json` — removed `variant` from `k1` and `k3`, nothing else

Removed exactly the `"variant": { "gen": "g2-measure-money-time", "form": "MmtLinePlotNumeric" }`
key from steps `k1` and `k3` (the two steps pairing a `variant` with a `plotData` block whose
generator — `src/lib/g2Variants.ts:59`, the shared `num()` builder — never emits `plotData` on
regeneration). No other key on any step changed; `i1`/`i3` (already variant-less) and `k2`/`ch1`
(a different, unrelated variant form, `MmtGraphCompareNumeric`, no `plotData`) are untouched.
`reviewBasisHash` (current): `89f8e53c0598b19dc62e0d50c10c564dc64a590ff4a9e4fc095f4df42dd626b2`.

**Generator debt, logged for a future forms author:** `mmt-05-03/k1` and `/k3` are now static
(re-ask always shows the same authored numbers/plot) instead of re-askable, purely because
`MmtLinePlotNumeric`'s handler in `src/lib/g2Variants.ts` was written before `plotData` existed and
only ever builds a single-stack `num()` widget with no `plotData` field. To restore re-askability
with a visual, a future forms author needs either a new form (e.g. `MmtLinePlotTwoStackNumeric`)
or an extended `MmtLinePlotNumeric` that draws two stacks and sets `plotData` on the returned
widget, matching the shape `i1`/`i3`'s authored (still-static) prompts now use.

### (2) `content.plotData.s237.test.ts` — independent verification route for g2g-01-03/k3

Added a dedicated test, `"g2g-01-03/k3: the KEYED option's stacks match the drawn plot, and every
other listed option's do not — verified by direct stack-for-stack comparison, never by reading the
prompt's own 'record is' list"`. Method: parses each mcq OPTION's own label text ("Two Xs at 4; one
at 5") into a `{value → count}` map using a number-**word** vocabulary (`none`/`zero`/`one`/…/`ten`
→ 0–10) — never digits, so this route cannot degenerate into re-running the same digit-matching the
"agrees with its own prompt" test already does — then compares that map directly, entry-for-entry,
against the drawn plot's own `{value → count}` map. Asserts the keyed (`correct: true`) option
matches and every other option does not, and that exactly one option matches overall. This reads
only the OPTION TEXT and the DRAWN PLOT; it never reads what the prompt's "The record is 4, 4, 5."
sentence states, so it is independent of the (separate, digit-based) `plotStatedIn` "record is"
reader added for the prompt-agreement test.

Also added, to support this newly-verified row and two pre-existing rows that turned out to be
**latent, previously-masked failures** (see below), three small, strictly-additive reader
extensions — none loosen any existing assertion; the exact-equality pairing checks (value↔count,
answer↔plot) are byte-for-byte unchanged, only the vocabulary of recognized authored English grew:

- `plotStatedIn`: a `"record is 4, 4, 5."` raw-measurement-list reader (den === 1 only; tallies the
  list, sorts by value) — for `g2g-01-03/k3`'s own prompt-agreement check.
- `plotStatedIn`: the existing counts-first `"stacks of C x's above V inches"` reader's `"stacks
  of "` lead-in was made optional (`g2g-01-05/k3`'s "A later plot has 6, 2, 3, and 1 Xs above 5, 6,
  7, and 8 inches" states the identical shape without that lead-in), and a new values-first mirror,
  `"above V inches (are|have) C [Xs]"`, was added (`g2g-01-05/k1`'s "above 5, 6, 7, and 8 inches
  are 2, 5, 3, and 1 Xs" and `g2g-01-05/rem-g2g-mode-k`'s "The counts above 2, 3, 4, and 5 inches
  are 1, 4, 2, and 3." — the latter omits the trailing "Xs" word entirely, hence `(?:\s*Xs)?` being
  optional).
- `answerFromPlot`: `/tallest stack/i` added alongside the existing `/most common/i` mode-detector,
  for `g2g-01-05/rem-g2g-mode-k`'s "Which measurement is under the tallest stack?" phrasing.

**Why these three were needed, and how they were found — a real discovery, not scope creep:**
fixing `g2g-01-03/k3` (which iterates earliest among `declared`, by course/lesson directory read
order — `data-line-plots-g2/g2g-01-03.json` sorts before `g2g-01-05.json`) let the corpus-contract
tests' `for`-loops, which `expect()`-throw on the FIRST failing row and so abandon the rest of the
loop silently, run past it for the first time. That immediately exposed three more rows —
`g2g-01-05/k1`, `g2g-01-05/k3`, `g2g-01-05/rem-g2g-mode-k` — whose own AUTHORED prompts had never
actually been verified: they used sentence shapes `plotStatedIn`/`answerFromPlot` never covered,
and were silently skipped by the same masking that hid `g2g-01-03/k3`. These are pre-existing,
genuine, truthful rows (confirmed: values/counts pair correctly, the keyed mcq option is the true
mode in every case) that had simply never been read correctly by this gate. Extending the reader's
vocabulary to recognize their real, already-authored phrasing is not a loosened assertion — every
equality check they must still pass is identical to what every other row already passes — it is
closing an actual gap in verification coverage that predates this task.

**Confirmed no assertion was loosened:** the full pre-existing "the prompt reader ACCEPTS the
authored shapes and REJECTS what it must" and "the agreement check REALLY disagrees" describe
blocks (10 tests total — the gate's own explicit negative-control suite, built to fail if the
reader/agreement-checker becomes permissive) still pass in full; see the verbatim output below.

### Verbatim final test output

```
 RUN  v4.1.10 /home/user/maggies-trail


 Test Files  1 passed (1)
      Tests  30 passed (30)
   Start at  02:39:40
   Duration  5.47s (transform 3.68s, setup 47ms, import 4.34s, tests 763ms, environment 0ms)
```

Verbose per-test listing (all 30 green, including the 10 negative-control reader tests):

```
 ✓ plotData — the corpus contract > is declared on exactly the 24 measured steps of the inline-dataset family
 ✓ plotData — the corpus contract > every declared plot agrees with its OWN prompt, mark for mark and X for X
 ✓ plotData — the corpus contract > dd-02-01/i1 draws the pets plot c1 states — raw-list tally and stated heights agree
 ✓ plotData — the corpus contract > the glyph is "dot" exactly where the prose says dots, and absent everywhere else
 ✓ plotData — the corpus contract > labelStyle is "mixed" exactly where the prose writes mixed numbers, absent everywhere else
 ✓ plotData — the corpus contract > the drawn plot is the dataset the FROZEN ANSWER comes from
 ✓ plotData — the corpus contract > for the mcq rows, the CORRECT OPTION states the value the drawn plot fixes
 ✓ plotData — the corpus contract > g2g-01-03/k3: the KEYED option's stacks match the drawn plot, and every other listed option's do not — verified by direct stack-for-stack comparison, never by reading the prompt's own 'record is' list
 ✓ plotData — the corpus contract > every declared plot is drawable, and passes the shared integrity rules
 ✓ plotData — the corpus contract > declaring it left grading alone — the traps and the answer are untouched
 ✓ plotData — the corpus contract > no step outside the declared set acquired a plot — the whole-corpus guard
 ✓ plotData survives the re-ask: every declared generator emits it > exactly the 11 variant-bearing steps regenerate; the 13 static rows are the ones expected
 ✓ plotData survives the re-ask: every declared generator emits it > each variant-bearing step regenerates WITH a plot that agrees with its regenerated prompt
 ✓ plotData survives the re-ask: every declared generator emits it > the regenerated plot is the dataset the regenerated ANSWER comes from
 ✓ plotData survives the re-ask: every declared generator emits it > the generated plots are FRESH — the picture moves with the seed, not just the sentence
 ✓ plotData survives the re-ask: every declared generator emits it > k3's regenerated widget keeps its live ?/4 preview as well as its plot
 ✓ plotData survives the re-ask: every declared generator emits it > and it is deterministic: one seed rebuilds one plot, forever
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > reads the arrow notation, an em-dash stack included
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > reads the generator's "N marks at" sentence, singular and plural alike
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > reads the quarter-sum, and REJECTS the same sum over a different denominator
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > REJECTS a sentence with no dataset — and ACCEPTS the near-identical one that has one
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > reads the generator's "N ft (C X's)" sentence — and REJECTS a single mark (S238)
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > reads the g2g "stacks of … x's above …" sentence — and REJECTS unpaired lists (S238)
 ✓ the prompt reader ACCEPTS the authored shapes and REJECTS what it must > REJECTS a label the declared denominator cannot express
 ✓ the agreement check REALLY disagrees — every mutation of the real vm-02-02 data > ACCEPTS the plot the prompt states
 ✓ the agreement check REALLY disagrees — every mutation of the real vm-02-02 data > REJECTS one X added to a stack, and one taken away
 ✓ the agreement check REALLY disagrees — every mutation of the real vm-02-02 data > REJECTS the same counts on the wrong marks (a transposed axis)
 ✓ the agreement check REALLY disagrees — every mutation of the real vm-02-02 data > REJECTS a plot with a mark the prompt does not list
 ✓ the agreement check REALLY disagrees — every mutation of the real vm-02-02 data > REJECTS a quarter-sum plot whose stacks do not multiply out to the printed terms
 ✓ the agreement check REALLY disagrees — every mutation of the real vm-02-02 data > the answer-from-plot route really moves with the plot

 Test Files  1 passed (1)
      Tests  30 passed (30)
```

### Files touched in this follow-up (exactly the 2 scoped)

- `content/courses/measure-money-time/lessons/mmt-05-03.json` (removed `variant` from `k1`/`k3` only)
- `src/lib/content.plotData.s237.test.ts` (allowlists updated to the true 24/11/13; new
  independent route for `g2g-01-03/k3`; three additive reader-vocabulary extensions for the
  previously-masked `g2g-01-05` rows)

### old → new, final

- Primary allowlist: 19 → 23 (first pass) → **24** (final, with `g2g-01-03/k3`).
- Secondary (variant-bearing / static) allowlist: 11/8 → 13/10 (first pass, mmt k1/k3 counted as
  variant-bearing) → **11/13** (final, after removing `variant` from mmt k1/k3 per the coordinator's
  instruction; `g2g-01-03/k3` added to the static side).
- Test count: 29 → **30** (one new dedicated `g2g-01-03/k3` route).
- Result: **30/30 passing.**
