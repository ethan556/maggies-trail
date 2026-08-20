# S320-A7 — Independent Assessment: `fractions-add`, `fractions-multiply`, `fraction-division-g5`

Independent Cowork assessment of three complete elementary/upper-elementary fraction
courses — `content/courses/fractions-add` (grade 4, 14 lessons), `content/courses/fractions-multiply`
(grade 5, 13 lessons), and `content/courses/fraction-division-g5` (grade 5, 12 lessons), 39 lessons
total. Every lesson JSON and all three `course.json` files were read in full. Every fraction sum,
difference, product, quotient, mixed-number conversion, simplification, and comparison was
recomputed by hand against the prompt/widget/feedback/explanation text. `fa-02-02` (this session's
S300 choice/progression repair) was assessed at its current, post-repair bytes, not against any
historical label. Read-only on all content; the only writes are this report and the disposition
NDJSON at `reports/closure/cowork-staging/laneB-s320-A7-dispositions.jsonl`.

This report was produced starting from the `MT-V4-WORKER-PREFIX-1` block in
`reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: the cache is evidence only, nothing here approves
its own work, and this packet does not touch the ledger.

## Result counts

- `fractions-add`: 14 lessons reviewed — **13 KEEP, 1 REVISE**, 0 ESCALATE.
- `fractions-multiply`: 13 lessons reviewed — **12 KEEP, 1 REVISE**, 0 ESCALATE.
- `fraction-division-g5`: 12 lessons reviewed — **6 KEEP, 6 REVISE**, 0 ESCALATE.
- Combined: 39/39 lessons signed, **31 KEEP / 8 REVISE / 0 ESCALATE**.

Every `visualDecision` is SUFFICIENT (all 39 lessons' fractionBar/numberLineHop/matchPairs/
mixedRegroup/estimateSlider widgets render the actual fractions and relationships their prompts
name; none of the 8 REVISE findings involve a missing or mismatched visual). `gradeLanguageDecision`
is REVISE for 3 lessons (`g5f-01-03`, `g5f-01-04`, `g5f-03-02` — see below) and FIT for the
remaining 36.

`fraction-division-g5` carries a disproportionate share of the findings (6 of 12 lessons). All six
are concrete, text/code-verified copy-paste or grading seams, consistent with that course's lessons
sharing a heavily templated `cml`/step structure (identical invariant/misconception boilerplate,
identical `"Try it." / "Try it again." / "One more, for the road." / "You did it!"` step-body
pattern across nearly every lesson) — the templating appears to be the root cause of the repeated-
number and copy-pasted-feedback defects below.

## REVISE list — precise implementation contract per lesson

### `fractions-add` / `fa-04-02` — buildExpression duplicate token label (i2)

Step `i2`'s `buildExpression` widget token bank contains two tokens with the identical label `"3"`:

```json
{ "id": "t3", "label": "3" }        // used in correct=["t4","tx","t3","tp","t2"]
{ "id": "t2wrong", "label": "3" }   // NOT referenced by correct/acceptAlso/commonBuilds at all
```

`BuildExpressionW` (`src/components/widgets.tsx`) renders every token as its own separate button;
the two "3" buttons are visually indistinguishable. `evaluate.ts`'s `buildExpression` case grades
strictly by token-**id** sequence, never by label, and `schema.ts`'s `widgetIntegrityErrors` only
checks that ids in `correct`/`acceptAlso`/`commonBuilds` exist among `tokens` — it does not check
label uniqueness. Net effect: a learner who correctly reasons "4 × 3 + 2" but happens to click the
`t2wrong` button instead of `t3` is scored wrong and shown only the generic `missFeedback`, despite
having built the visually and mathematically correct expression.

**Fix**: change `t2wrong`'s `"label"` field from `"3"` to any numeral not already used by another
token in this array (e.g. `"5"`). Single-field text edit; `id`, `correct`, `acceptAlso`, and
`commonBuilds` are untouched and need no change since none of them reference `t2wrong`.

### `fractions-multiply` / `fm-04-02` — k1 duplicates fm-04-01/k1

Step `k1` ("Is 7/6 × 8 more than 8, less than 8, or equal to 8?") tests the identical numeric fact,
comparison target, correct answer, and misconception as `fm-04-01`/`k1` ("Is 8 × 7/6 bigger than 8,
smaller than 8, or exactly 8?") — same two numbers (7/6 and 8), one lesson apart, with only the
factor order and "bigger/smaller" → "more/less" wording changed. This is accidental repetition of
a check already administered one lesson earlier, not a new representation or context.

**Fix**: replace `k1`'s fraction/whole-number pair with a fact not already used in `fm-04-01`
(which used 7/6, 3/3, 5/6, 4/3 as its own scaler values) — e.g. `5/3 × 9` — keeping the same
`singleCompare` structure, three-option shape, and misconception-distractor pattern. Update
`explanationVariants` and hint text to match the new numbers.

### `fraction-division-g5` / `g5f-01-03` — remedial prompt/option mismatch

The remedial check (`rem-g5fd-interpret-k`) prompt reads: *"Use the picture: 13 counters fill 3
groups of 4, with 1 counter left. If that counter can be cut equally, **what form should the
answer take?**"* — but its four options are copy-pasted verbatim from the main-lesson `k1` step,
which answers a differently-shaped question (*"13 ÷ 4 gives 3 remainder 1. **When** is the answer
3 1/4 rather than 'remainder 1'?"*). The options ("When the leftover can be shared equally", etc.)
answer a WHEN question, not the remedial's own WHAT-FORM question — a grammatical mismatch left
over from copy-pasting the options without rewriting the new prompt to match. The designated
correct option remains mathematically defensible; this is a language-clarity defect.

**Fix**: reword the remedial's `prompt` to match its existing (correct, already-graded) options'
"when" framing, e.g.: *"Use the picture: 13 counters fill 3 groups of 4, with 1 counter left. When
should the leftover be written as a fraction rather than a remainder?"* Zero risk to grading —
`options`/`correct` untouched.

### `fraction-division-g5` / `g5f-01-04` — i2 unit-mismatch feedback

Step `i2`'s `fractionBar` prompt was rewritten to a new cover story ("Seven cups of soil fill 8
seed pots equally...") but its `successFeedback` and both `commonFractions[].feedback` strings
were left as literal copies of step `i1`'s "metres of rope" story:

- `successFeedback`: `"7/8 metre — seven wholes shared eight ways gives each seven of the eighth-pieces."`
- `commonFractions[0].feedback` (8/7): `"8/7 reverses the story; that would be eight metres shared among seven."`
- `commonFractions[1].feedback` (1/8): `"1/8 is one piece from a single metre; there are seven metres."`

All three say "metre(s)" in a step whose own prompt never mentions metres. The widget still grades
correctly (fractionBar grading is value-based on num/den, confirmed in `evaluate.ts`, unaffected by
this text), but every feedback string a learner can see contradicts the prompt's own units/context.

**Fix**: reword the three feedback strings to the cups/pots story, e.g.:
- `successFeedback` → `"7/8 cup — seven cups shared eight ways gives each pot seven of the eighth-pieces."`
- `commonFractions[0].feedback` → `"8/7 reverses the story; that would be eight cups shared among seven pots."`
- `commonFractions[1].feedback` → `"1/8 is one piece from a single cup; there are seven cups."`

### `fraction-division-g5` / `g5f-02-03` — k2 exact duplicate of g5f-02-02/k3

Step `k2`'s numeric widget — prompt `"Compute 8 × 5 — the number of fifths that fit in 8 wholes."`,
answer 40, identical `commonErrors`/`fallbackFeedback`/`successFeedback` — is byte-identical to
`g5f-02-02`/`k3`'s widget (confirmed by cross-lesson exact-string scan and direct reading).
Accidental repetition of a check already administered one lesson earlier.

**Fix**: replace `k2`'s numeric widget with a fresh "wholes × denominator" fact not already used in
`g5f-02-02` (which used 9×8, 8×5, 7×2) — e.g. `"Compute 6 × 3 — the number of thirds that fit in 6
wholes"` (answer 18), with `commonErrors` adjusted analogously (e.g. value 9 for "adding instead of
multiplying", value 3 for "only counted one whole").

### `fraction-division-g5` / `g5f-03-02` — i2 answer stated in prompt

Step `i2`'s `estimateSlider` prompt reads: *"**Eight** half-metre pieces are joined end to end.
Slide to the total number of **pieces** in the 4-metre ribbon."* — it states the target quantity
("Eight half-metre pieces") in the setup sentence, then asks the learner to find "the total number
of pieces," the same quantity already named. This lets the learner read the answer straight off the
prompt with no reasoning required, contrary to the lesson's own clean `i1` prompt ("A 4-metre
ribbon cut into 1/2-metre pieces — slide to the number of pieces"), which does not leak the target.

**Fix**: reword `i2`'s prompt so it no longer states the piece count, while preserving the "try it
again" reinforcement job — e.g.: *"A 4-metre ribbon is cut into half-metre pieces and laid end to
end. Slide to the total number of pieces."* No change needed to `min`/`max`/`target`/`acceptFactor`
or feedback strings.

### `fraction-division-g5` / `g5f-03-03` — k2 exact duplicate of g5f-03-02/k3

Step `k2`'s numeric widget — prompt `"Compute 9 ÷ 3 — sharing 9 equal pieces among 3 people."`,
answer 3, identical `commonErrors`/`fallbackFeedback`/`successFeedback` — is byte-identical to
`g5f-03-02`/`k3`'s widget (confirmed by cross-lesson exact-string scan and `grep` at
`g5f-03-03.json:200`). Accidental repetition of a check already administered one lesson earlier.

**Fix**: replace `k2`'s numeric widget with a fresh "sharing" fact not already used in `g5f-03-02`
(which used 5×6 and 9÷3) — e.g. `"Compute 15 ÷ 5 — sharing 15 equal pieces among 5 people"`
(answer 3), with `commonErrors` adjusted analogously (value 15 for "the whole pile", a subtraction
distractor for "removes one share once").

### `fraction-division-g5` / `g5f-03-04` — k1/k3 internal duplicate option set

Main-lesson steps `k1` ("Roughly how big is 5 ÷ 1/3, without computing exactly?") and `k3` ("Which
benchmark best explains why the quotient 5 ÷ 1/3 is close to 15?") use byte-identical option sets —
all four labels, the `correct` flag, and every feedback string, verbatim. Confirmed by `grep`: the
option text "About 15 because each whole has 3 thirds" appears 4 times in this course — 1 in
`g5f-02-04`/`k3` (a legitimate, distinctly-jobbed word-problem application in a different lesson,
not flagged) and 3 in `g5f-03-04` itself (`k1`, `k3`, and the remedial check). The remedial matching
`k1`/`k3` is expected platform convention (remedials intentionally mirror their trigger check) and
is not a defect. But `k1` and `k3` are both ungated main-lesson checks presented back-to-back in the
same lesson with no distinct instructional job between them — a within-lesson duplicate.

**Fix**: replace `k3`'s mcq widget with a question giving it a distinct job from `k1` — e.g. testing
the "multiply back to verify" idea that `ch1` already introduces (in mcq form), or estimating a
different quotient (e.g. `7 ÷ 1/4`) with the same triple/quadruple-style misconception distractors.
Leave `k1` and the remedial unchanged.

## Full per-lesson verdicts

All entries below are `decision` / `visualDecision` / `gradeLanguageDecision`. Full rationale for
every lesson (including all 31 KEEP) is in the NDJSON at
`reports/closure/cowork-staging/laneB-s320-A7-dispositions.jsonl`.

**`fractions-add`** (14/14 signed): fa-01-01 KEEP/SUFFICIENT/FIT · fa-01-02 KEEP/SUFFICIENT/FIT ·
fa-01-03 KEEP/SUFFICIENT/FIT · fa-02-01 KEEP/SUFFICIENT/FIT · fa-02-02 KEEP/SUFFICIENT/FIT
(post-S300-repair bytes) · fa-02-03 KEEP/SUFFICIENT/FIT · fa-03-01 KEEP/SUFFICIENT/FIT ·
fa-03-02 KEEP/SUFFICIENT/FIT · fa-03-03 KEEP/SUFFICIENT/FIT · fa-04-01 KEEP/SUFFICIENT/FIT ·
**fa-04-02 REVISE/SUFFICIENT/FIT** · fa-04-03 KEEP/SUFFICIENT/FIT · fa-05-01 KEEP/SUFFICIENT/FIT ·
fa-05-02 KEEP/SUFFICIENT/FIT.

**`fractions-multiply`** (13/13 signed): fm-01-01 KEEP/SUFFICIENT/FIT · fm-01-02 KEEP/SUFFICIENT/FIT ·
fm-01-03 KEEP/SUFFICIENT/FIT · fm-02-01 KEEP/SUFFICIENT/FIT · fm-02-02 KEEP/SUFFICIENT/FIT ·
fm-03-01 KEEP/SUFFICIENT/FIT · fm-03-02 KEEP/SUFFICIENT/FIT · fm-03-03 KEEP/SUFFICIENT/FIT ·
fm-04-01 KEEP/SUFFICIENT/FIT · **fm-04-02 REVISE/SUFFICIENT/FIT** · fm-05-01 KEEP/SUFFICIENT/FIT ·
fm-05-02 KEEP/SUFFICIENT/FIT · fm-05-03 KEEP/SUFFICIENT/FIT.

**`fraction-division-g5`** (12/12 signed): g5f-01-01 KEEP/SUFFICIENT/FIT ·
g5f-01-02 KEEP/SUFFICIENT/FIT · **g5f-01-03 REVISE/SUFFICIENT/REVISE** ·
**g5f-01-04 REVISE/SUFFICIENT/REVISE** · g5f-02-01 KEEP/SUFFICIENT/FIT ·
g5f-02-02 KEEP/SUFFICIENT/FIT · **g5f-02-03 REVISE/SUFFICIENT/FIT** ·
g5f-02-04 KEEP/SUFFICIENT/FIT · g5f-03-01 KEEP/SUFFICIENT/FIT ·
**g5f-03-02 REVISE/SUFFICIENT/REVISE** · **g5f-03-03 REVISE/SUFFICIENT/FIT** ·
**g5f-03-04 REVISE/SUFFICIENT/FIT**.

## Methodology

- **Basis hashes**: computed in bulk via `node scripts/session/print-review-basis.mjs <ids>`
  against current file bytes (re-run at report time to eliminate any transcription risk from the
  mid-session context compaction; all 39 values matched the pre-compaction run exactly).
- **Arithmetic**: every fraction sum/difference (common-denominator), product, quotient, mixed-
  number conversion, and simplification named in every prompt/widget/commonError/feedback/reveal
  string across all 39 lessons was recomputed by hand.
- **Grading-logic verification**: read `src/lib/evaluate.ts` (`buildExpression`, `exactNumberLab`,
  `fractionEntry`, `matchPairs`, `plotPoint` cases), `src/lib/schema.ts`
  (`widgetIntegrityErrors`/`exactNumberTruth`), and `src/components/widgets.tsx`
  (`BuildExpressionW`) to confirm the `fa-04-02` finding is a code-verified grading defect, not
  speculative.
- **S300 cross-check**: `fa-02-02` and the other S300-touched lessons (`fa-01-01`, `fa-02-01`,
  `fa-03-01`, `fa-03-02`, `fa-03-03`, `fa-04-02`) were checked against every contract in
  `src/lib/session300.fractionsAddP1ChoiceProgressionRepair.test.ts` (locked option labels, length-
  ratio ≤1.3 parity, exact body/prompt text, `widgetIntegrityErrors`/`evaluate()` correctness) —
  all pass at current bytes.
- **Duplication scanning**: (1) the repo's own `buildDuplicateInventory`
  (`scripts/audit/lesson-review-authority-s246.mjs`) covers `mcq`-type widgets only
  (`prompt.trim() + "~~" + sorted option labels`) — zero clusters touch these 39 lessons. (2) A
  supplementary script scanned every non-`mcq` widget's `prompt` field (main + remedial, all 39
  lessons) for exact cross-lesson string matches — found the `g5f-02-02`/`g5f-02-03` and
  `g5f-03-02`/`g5f-03-03` pairs. (3) A second supplementary script scanned `mcq`/`predict` prompts
  for exact cross-lesson matches — found none, which is why the `fm-04-02`, `g5f-01-03`, and
  `g5f-03-04` findings (near-duplicate or option-only duplicate, reworded prompts) required direct
  manual reading rather than scripting to catch. `grep` was used to enumerate every occurrence of a
  specific option string once a within-lesson duplicate was suspected (`g5f-03-04`).
- **Platform-level facts treated as context, not defects** (per task instructions): `McqW` and the
  nine `*LabW` widgets (including `exactNumberLab`) use `seededShuffle` keyed by
  `${lessonId}:${stepId}` and grade by option id/identity, never DOM position (`S316_LAB_CHOICE_SHUFFLE_FIX.md`,
  `S316_LAB_CHOICE_SHUFFLE_SWEEP.md`) — content authors do not need per-lesson shuffle logic, and
  `estimateSlider`'s plain `min/max/target/acceptFactor` sliders (used throughout
  `fraction-division-g5`) carry no `choices` array, so the `DiscreteEstimateCompareW`
  ascending-order exception never applies here.

## Notes on borderline calls resolved as KEEP

- **Remedial near-identical wording to its paired main check** — expected/intentional by design
  (remedials fire only after a missed main check and are meant to closely reteach it), not counted
  as duplication anywhere in this review, including for `g5f-03-04`'s remedial (see above).
- **`fm-03-01`, `fm-05-01`, `fm-05-02`/`fm-05-03`** — each reuses a numeric fact family across
  lessons/steps but pairs it with a genuinely new representation or word-problem context each time
  (area model → number-line hop → sharing story → counting-servings story); judged KEEP-worthy
  reuse, distinct from the REVISE-worthy "same fact, same abstract representation, no new context"
  pattern found in `fm-04-02`, `g5f-02-03`, `g5f-03-03`, and `g5f-03-04`.
- **`g5f-03-01`'s reuse of the "3 ÷ 1/4 = 12" fact** from chapter 2 — intentional and distinct
  (chapter 2 teaches the fact; `g5f-03-01` teaches checking-by-multiplying-back using the same
  fact as its worked example), not accidental repetition.
- **`g5f-02-04`/`k3`** shares its option set with `g5f-03-04`/`k1`+`k3` (see methodology above) but,
  taken alone, serves a legitimate, distinct job in its own lesson (a word-problem application of
  the number-line skill just taught) with no internal duplication — not the required fix point.
