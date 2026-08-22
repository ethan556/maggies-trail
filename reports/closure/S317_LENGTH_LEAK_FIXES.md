# S317 Lane B — MCQ Label-Length Answer-Leak Fixes + Teaser Correction

Implementation worker packet. Scope: the 13 lessons named in the four S317 Lane B assessor
reports (`S317_LANEB_DATA_DISTRIBUTIONS_ASSESSMENT.md`, `S317_LANEB_STATISTICAL_INFERENCE_ASSESSMENT.md`,
`S317_LANEB_FRACTIONS_ASSESSMENT.md`, `S317_LANEB_CONDITIONAL_PROBABILITY_ASSESSMENT.md`). Obeys
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: repository source is authoritative, this document
and the staged NDJSON are the only artifacts of this packet, and this worker did not assess or
close its own packet — the contracts above (written by an independent assessor) are implemented
as specified, with only the minimal wording changes needed to satisfy each contract.

No `npm`/`vitest`/`tsc` was run per instructions. Verification is a hand-rolled Python scan (see
"Verification method" below) against each edited widget's parsed JSON.

## What changed

13 files, 14 widget-level edits (13 MCQ length rebalances + 1 teaser rewrite). In every MCQ edit:
correct option's `id`/position/`correct: true` is untouched, all `feedback` strings are untouched,
and only distractor `label` text was lengthened with true, substantive elaboration of the same
misconception the original short label already encoded (no new misconception invented, none
weakened). Two labels (fr-02-01/k3 option `b`, fr-03-01/k3 option `b`) were extended enough that
they moved past the correct option's length — this is intended: the rule is "correct option not
the unique longest, **or** spread ≤15 chars/≤5 words," and lengthening a distractor past the
correct option's length also satisfies the "not unique longest" branch.

## Before/after spread table

Spread = max(option length) − min(option length) among all options in the widget, measured in
characters and words. "Longest?" = whether the correct option is the *unique* longest label.

| Lesson | Step | Kind | Spread chars (before→after) | Spread words (before→after) | Correct unique-longest (before→after) |
|---|---|---|---|---|---|
| dd-03-02 | k3 | main | 26 → 44 | 10 → **1** | Yes → No |
| si-01-03 | rk1 | remedial | 48 → 12 | 8 → 5 | Yes → No |
| si-02-02 | k4 | main | 43 → 10 | 8 → 3 | Yes → No |
| si-04-02 | rk1 | remedial | 29 → 8 | 5 → 1 | Yes → No |
| si-04-03 | k1 | main | 33 → 14 | 7 → 3 | Yes → No |
| si-05-01 | k2 | main | 30 → 13 | 9 → 2 | Yes → No |
| si-05-01 | rk1 | remedial | 17 → 3 | 3 → 1 | Yes → No |
| si-05-03 | rk1 | remedial | 38 → 8 | 5 → 3 | Yes → No |
| fr-02-01 | k3 | main | 32 → 10 | 6 → 3 | Yes → Yes (spread now ≤15 chars/≤5 words) |
| fr-02-04 | rem-nb-k | remedial | 23 → 8 | 4 → 3 | Yes → No |
| fr-03-01 | k3 | main | 56 → 15 | 9 → 5 | Yes → Yes (spread now ≤15 chars/≤5 words) |
| cpr-03-01 | k1 | main | 58 → 14 | 11 → 4 | Yes → Yes (spread now ≤15 chars/≤5 words) |
| cpr-04-01 | k1 | main | 60 → 10 | 10 → 3 | Yes → Yes (spread now ≤15 chars/≤5 words) |

`dd-03-02/k3`'s char spread rose (26→44) because option `b` was lengthened past option `a`'s
length to close the *word*-count gap the assessor report actually flagged (19 words vs 9 words);
word spread fell from 10 to 1, and the correct option is no longer the unique longest by either
metric, so the "not unique longest" branch of the target rule is satisfied.

Every other row shows both spreads shrinking and lands within the ≤15-char/≤5-word target, or
(where a distractor was pushed past the correct option's length) satisfies the rule via the
"correct option not the unique longest" branch.

## Per-lesson detail

### dd-03-02 (`content/courses/data-distributions/lessons/dd-03-02.json`, step `k3`)
- Option `b`: `"Jae should have used three middle numbers, not two"` (9w/52c) → `"Jae should
  have averaged three middle numbers instead of two, since the unsorted list has four positions
  to choose from"` (20w/119c).
- Option `c`: `"Nothing — 4.5 and 5.5 are both acceptable medians"` (9w/49c) → `"Nothing went
  wrong — both 4.5 (from the unsorted list) and 5.5 count as acceptable medians for this data"`
  (19w/104c).
- Option `a` (correct) unchanged, 19w/75c. Exact wording from the assessor's contract, verbatim.

### si-01-02 (`content/courses/statistical-inference/lessons/si-01-02.json`, step `r1.teaser`)
- Before: `"Next: watch a good estimate wobble, and measure exactly how much."` (describes
  si-02-01's content, not si-01-03's).
- After: `"Next: a sample can be perfectly unbiased and the experiment around it can still be
  broken. Four parts every experiment needs — and what happens when one is missing."`
- Verified against si-01-03's actual content (read in full): it teaches control, random
  assignment, blinding, and replication as "four parts every experiment needs," exactly what the
  new teaser previews. si-01-01's and si-01-03's own teasers were left untouched (already correct
  per the contract).

### si-01-03 (`.../si-01-03.json`, remedial `rk1`)
- Option `o2`: `"Random assignment."` (18c) → `"Random assignment — as if patients chose their own
  arm instead of a coin flip."` (78c), naming the specific wrong belief (that assignment wasn't
  actually random) the bare label only implied.

### si-02-02 (`.../si-02-02.json`, step `k4`)
- `o2`: `"Yes — with 5000 people the sample must become representative."` → `"...must finally
  become representative of renters too."`
- `o3`: `"Yes — the margin of error will be tiny."` → `"...will be tiny, so the estimate has to be
  trustworthy."`
- `o4`: `"Partly — bias falls as n rises, just slowly."` → `"...just slowly, the same way
  variability does."` (names the specific false analogy to variability).

### si-04-02 (`.../si-04-02.json`, remedial `rk1`)
- `o2`: `"There is a 3% chance the effect does not exist."` → `"...since the p-value measures the
  null."` (names the specific reversed-conditional reasoning).

### si-04-03 (`.../si-04-03.json`, step `k1`)
- `o2`: `"Yes — p < 0.001 is very strong evidence."` → `"...so the effect must be worth adopting."`
- `o3`: `"Yes — with 100,000 students, the effect must be large."` → `"...students behind it, the
  effect must be genuinely large."`
- `o4`: `"No — with p < 0.001, the result is too good to be true."` → `"...a result this clean is
  too good to be true."`

### si-05-01 (`.../si-05-01.json`, steps `k2` and `rk1`)
- `k2/o2`: `"...25 minutes longer."` → `"...25 minutes longer, exactly as the data shows."`
- `k2/o3`: `"Sleeping longer makes people download apps."` → `"...— the arrow just points the
  other way."`
- `k2/o4`: `"There is no relationship between apps and sleep."` → `"...— the 25-minute gap is just
  noise."`
- `rk1/o2`: `"Volunteering REDUCES stress."` → `"Volunteering REDUCES stress by calming the mind."`

### si-05-03 (`.../si-05-03.json`, remedial `rk1`)
- `o2`: `"Question 3 — the margin must be wrong."` → `"...wrong, since a huge effect should shrink
  it further."`

### fr-02-01 (`content/courses/fractions/lessons/fr-02-01.json`, step `k3`)
- `b`: `"To make the drawing neater"` → `"...neater and easier to look at"`.
- `c`: `"They don't need to be — close counts"` → `"...close counts as good enough"`.
- `d`: `"Because unequal jumps are impossible to draw"` → `"...impossible to ever draw"`.

### fr-02-04 (`.../fr-02-04.json`, remedial `rem-nb-k`)
- `b`: `"At the number 5"` → `"At the number 5 — one jump, one whole"` (names the specific
  misconception: treating each jump as worth a whole unit).
- `c`: `"Before 1"` → `"Before 1 — hardly any jumps have passed"`.

### fr-03-01 (`.../fr-03-01.json`, step `k3`)
- `b`: `"Rio is right — more pieces is more"` → `"...more pieces always means a bigger amount of
  the whole"`.
- `c`: `"Actually 1/2 is more"` → `"...more, since one big piece beats two small ones"`.
- `d`: `"Fractions with different bottoms can never be compared"` → `"...can never be fairly
  compared"`.

### cpr-03-01 (`content/courses/conditional-probability/lessons/cpr-03-01.json`, step `k1`)
- `o2`: `"The die became more likely to land on 6."` → `"...once we heard the roll was even."`
- `o3`: `"There are now 2 sixes among the even faces."` → `"...doubling the favourable count."`
- `o4`: `"Because 1/6 + 1/6 = 1/3."` → `"...which happens to match the new probability."`

### cpr-04-01 (`.../cpr-04-01.json`, step `k1`)
- `o2`: `"Kings and hearts are mutually exclusive."` → `"...since no card can be both at once."`
- `o3`: `"P(king and heart) = 0."` → `"...since no single card can be both a king and a heart."`
- `o4`: `"Every heart is equally likely to be a king."` → `"...the same as any single card."`

## Verification method (scripted scan, per edited widget)

For each of the 14 edited widgets, a Python script parsed the lesson JSON and checked:

1. **Exactly one correct option** (`n_correct == 1`).
2. **Correct-first** (`options[0].correct === true`).
3. **No label duplicates** within the widget.
4. **Length spread** (chars and words) before vs. after, and whether the correct option is the
   unique longest, before vs. after.
5. **Parse-clean JSON** — every one of the 13 files round-trips through `json.load` without error.

Result: **13/13 files parse-clean; 14/14 edited widgets pass exactly-one-correct, correct-first,
and no-duplicate-labels; all 13 MCQ widgets show reduced length spread and 9/13 no longer have
the correct option as the unique longest label** (the remaining 4 — fr-02-01/k3, fr-03-01/k3,
cpr-03-01/k1, cpr-04-01/k1 — land within the ≤15-char/≤5-word spread target instead, per the rule's
explicit "or" clause). Raw before/after JSON is in
`reports/closure/cowork-staging/laneB-s317-lengthfix.jsonl` (one record per lesson, `verify_status`
field on each).

## Untouched / out of scope

- No `feedback`, `hints`, `explanationVariants`, `correct` flag, option `id`, option order, figure,
  widget type, evaluator, or answer was changed anywhere.
- si-01-01's and si-01-03's own teasers were read to confirm they are already correct and were left
  untouched.
- No file outside the 13 named lessons was modified.
- `npm`/`vitest`/`tsc` were not run, per scope instructions.
