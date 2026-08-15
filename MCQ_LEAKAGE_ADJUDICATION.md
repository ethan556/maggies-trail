# MCQ-01 — CLUE LEAKAGE, ADJUDICATED BY CAUSE

**Seal:** `9d23243` · **Evidence:** `reports/mcq/MCQ_LEAKAGE_INDEX.csv`, from
`scripts/audit/mcq-leakage.mts` · **Date:** 2026-08-15

## Why the queue was rebuilt rather than worked

`MCQ_DISTRACTOR_AUDIT.csv` marks 572 items REMEDIATE on a composite `blind_guess_test`. A composite
verdict cannot be worked: it says an item is guessable without saying why, so every row needs a human
read before anyone can decide whether it is even fixable. The file also predates an unknown amount of
content change, and this program has already been slowed twice by counts that were true when written.

The rebuild measures the live corpus — **5,227 MCQ items, 2,563 authored and 2,664 generated** — and
scores each tell separately.

## Findings

| Cause | Rows | Repairable without a pedagogy decision? |
|---|---:|---|
| `length-prose-vs-prose` | 507 | **No** — needs authoring |
| `length-answer-explains-itself` | 132 | **Yes** — move the clause |
| `lone-justification` | 18 | Partly |
| `only-option-with-a-unit` | 11 | Needs a read |
| `only-numeric-option` | 5 | Needs a read |
| `absolutes-in-distractors-only` | 2 | Needs a read |

**657 items carry at least one tell** of 5,227 — 12.6%.

## The one class with a mechanical repair — 132 rows

> **Prompt:** What kind of association does this scatter plot show?
> **Correct:** `Positive — y goes up as x goes up`
> **Distractors:** `Negative` · `No association` · `Can't tell`

This is not really a length problem. The answer carries its own **explanation** and the distractors
are bare labels, so a learner who knows nothing about scatter plots picks the option that argues for
itself. It is also the wrong home for that sentence: an explanation belongs in the option's
`feedback`, where the learner reads it *after* committing, not in the label where it decides the
commitment.

**The repair moves the clause and touches no pedagogy:** label becomes `Positive`, and
`— y goes up as x goes up` merges into that option's feedback. Every option ends up the same shape,
and the explanation still reaches the learner — later, which is when it teaches.

**Batch it by family, not by score**, per §9: 20–50 related items, grouped by the misconception they
test. `bv-01-*` (scatter association) is the natural first family and is demonstrated at this seal.

## The class that needs authoring — 507 rows

> **Prompt:** Why must the conditions of a piecewise rule never overlap?
> **Correct:** `Because an input in both would receive two outputs, and functions give one`
> **Distractors:** `Because overlapping conditions are hard to write` · `Because the formulas would
> have to be identical`

Prose against prose. The answer is longer because the true reason is longer, and the repair is to
write **more plausible wrong reasons** — which is authoring, requires the misconception taxonomy, and
is explicitly a human-in-the-loop activity in this plan. Shortening the correct answer would damage
the item.

Median length ratio across the whole length class is 2.03× and the 90th percentile is 3.7×, so this
is not a handful of outliers; it is a house style. Worth stating plainly: **it is the single largest
quality finding in the MCQ corpus** and it is not mechanically fixable.

## Three detectors were wrong first, and the corrections are the interesting part

- **`only-numeric-option`** flagged items whose distractors *are* numbers, because the test used the
  ASCII hyphen and the corpus writes U+2212. `−5` read as non-numeric, so every signed distractor
  made its positive answer look like "the only number". 7 → 5.
- **`only-option-with-a-unit`** read `1s` as one second — it is a plural — and `0.95 in magnitude` as
  inches. Ambiguous single-letter and English-word units now require a space before and a boundary
  after. 14 → 11.
- **`absolutes-in-distractors-only`** flagged `Equilateral — all three sides equal`, which is a
  definition, not an overclaim. Bare `all`, `none` and `every` left the set; only `always`, `never`,
  `impossible` and their kin remain. 6 → 2.

Each of those would have sent someone to read a correct item and find nothing wrong. A findings file
that is mostly false teaches its readers to skim, which costs more than the rows it saves.

## What is NOT claimed

- **No item was judged for misconception validity.** Whether each distractor maps to a real error a
  learner makes is the substance of MCQ-01 and none of these five tells measures it.
- **Generated items are sampled at three seeds per form**, not exhausted. A tell that only appears at
  an unusual draw is not in this file.
- **`assessment mode` distortion is untested.** The plan asks that remediation not distort
  assessment behaviour; that needs the runtime, not a static scan.
