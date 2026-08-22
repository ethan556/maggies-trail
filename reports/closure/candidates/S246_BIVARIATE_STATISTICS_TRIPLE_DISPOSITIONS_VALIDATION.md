# S246 bivariate-statistics triple-disposition assessment

Status: **PASS — one release blocker escalated**

Scope is deliberately bounded to the 15 live lessons in `bivariate-statistics`. The assessment read every complete lesson, including concepts, figures, interactions, predictions, checks, challenge, hints, feedback, recaps, remedials, generator bindings, and CML metadata, and reconciled each lesson with its current S244 card and existing visual/choice evidence. It made independent whole-lesson, visual-first, and Grade 8 language judgments; prior choice-surface repair and absence of duplicate flags were not treated as whole-lesson approval.

No lesson, generator, shared decision ledger, pending queue, lesson card, cache, or shared audit script was changed. This directory contains candidate assessment evidence only.

## Reproducible gate

Run:

```text
node reports/closure/candidates/validate-s246-bivariate-statistics-triple-dispositions.mjs
```

Validated result:

| Gate | Result |
|---|---:|
| Course-manifest lesson IDs | 15 / 15 exact |
| Candidate records | 15 / 15 |
| Live S244 cards | 15 / 15 |
| Candidate `reviewedBasisHash` equals live card | 15 / 15 |
| Live lesson source hash equals card | 15 / 15 |
| Live course source hash equals card | 15 / 15 |
| Records with every contract-required field | 15 / 15 |
| Unique record IDs | 15 / 15 |
| Exact fields, enums, timestamps, rationales, reopen conditions, and evidence references | PASS |
| Independent least-squares release-blocker canary | PASS |
| Candidate SHA-256 | `243cd7ed4555559d45b7c737bfe6c0dd1da59ab9412a1e68adca53527876271f` |

## Current-hash manifest and decisions

| Lesson | Review basis | Lesson | Visual | Language |
|---|---|---|---|---|
| bv-01-01 | `8938312c8518316a506eb5ea12159b59b86c1479fd07cbe12e846af6b3e5f213` | REVISE | REQUIRED | FIT |
| bv-01-02 | `ec425ca9fdafc900ca6c5cbbefb3bdd6a1d75d92bd51cd71008459a21ab24444` | REVISE | REQUIRED | FIT |
| bv-01-03 | `5349f974baa5f6171b37072992e626bbdebd1337fbd913d484b9c7ba115939d3` | REVISE | REQUIRED | FIT |
| bv-02-01 | `a049cf9427070936383f1b05600555125f465e1655fb777cbd1dc786efd77ef2` | REVISE | REQUIRED | FIT |
| bv-02-02 | `4d9397727a0ff2c9aef92d5b67e3dd363e4754bfbc569dd079627a7a905e92ef` | REVISE | REQUIRED | FIT |
| bv-02-03 | `9dabc4450769347548104be579f80397bda1c239e047bdcd7e01ce53b58b2756` | REVISE | SUFFICIENT | FIT |
| bv-03-01 | `e1754587712abbfc72140689b9337458e77b08fd40973f2630b7ecdf62aae185` | REVISE | REQUIRED | FIT |
| bv-03-02 | `782fad4a7c3b6a161ee28f5a815c9af5b4f932d7a45a26bba9174fb8f6a9300d` | KEEP | SUFFICIENT | FIT |
| bv-03-03 | `3c3dcd2383e6258f184a57745c7b4c5bc5fe6e66eedccd9fa01315386a3c21c4` | REVISE | PREFERRED | REVISE |
| bv-04-01 | `85eceb961e1bafa99f27f7af1bb6b92e5c0f5ba7b6626697fa805e786e0d7835` | REVISE | SUFFICIENT | FIT |
| bv-04-02 | `dece2a16130b1a83e24b1595a75b563725eaf11c41430e23cbc94968aa3bb484` | REVISE | SUFFICIENT | FIT |
| bv-04-03 | `f71410211cf3d9646df632bbb2f3d61b5d0766d7ca7b3e69312cc940ae5af352` | REVISE | REQUIRED | REVISE |
| bv-05-01 | `1416de66eeb3633f479602bd4fc0519fefe14d390e78399964bb3e3fe9eb33ee` | KEEP | SUFFICIENT | FIT |
| bv-05-02 | `7c5edc95120ab43a1b1bbe051a09078583217ebc36f289d6e21f828502185699` | REVISE | REQUIRED | REVISE |
| bv-05-03 | `ac8811de7881563d6d9a371cfe24788b674301cfbc1ff4519fabfadd1e6b0e35` | ESCALATE | ESCALATE | REVISE |

Totals: **2 KEEP, 12 REVISE, 1 ESCALATE**; **8 REQUIRED, 1 PREFERRED, 5 SUFFICIENT, 1 ESCALATE** visual decisions; **11 FIT, 4 REVISE** language decisions.

## Release blocker: `bv-05-03`

The final lesson must not ship in its current form. For the authored points `(1,3), (2,6), (3,7), (4,9)`:

- the lesson and scatter-fit success state call `ŷ = 2x + 1` optimal;
- that line gives residuals `0, +1, 0, 0`, and k1 calls their sum `+1` “essentially balanced”;
- the actual ordinary least-squares line with an intercept is `ŷ = 1.9x + 1.5`;
- its residuals are approximately `−0.4, +0.7, −0.2, −0.1`, whose sum is zero to floating-point tolerance;
- least squares minimizes the sum of squared residuals, while a fitted model with an intercept has residuals summing to zero. A near-zero residual sum does not by itself identify the best line.

The false target propagates through the visual evaluator, success feedback, k1, k2's trade-off claim, and the transition to the least-squares explanation. The prediction reveal also claims that all-zero residuals on real data would mean the data was invented, which is false: real observations can be exactly linear. This is an evaluator/representation/feedback agreement defect and therefore receives both whole-lesson and visual `ESCALATE` decisions.

## Other material revision findings

- `bv-01-01` never constructs a multi-point scatter plot; its three placement interactions repeat isolated one-point work.
- `bv-01-02` and `bv-01-03` verbally describe falling, directionless, straight, curved, clustered, and outlier plots in questions where the plotted evidence should be visible.
- `bv-02-01` says the line should “ignore outliers if anything”; outliers require investigation and influence analysis, not automatic dismissal. Its fit challenge also describes an invisible candidate line.
- `bv-02-02` asks learners to imagine nearly every comparison and shifts among gaps, total distance, and residuals without clearly separating informal visual fit from a defined numerical criterion.
- `bv-02-03` repeats slope/intercept reading and labels an intercept-only item as a two-piece challenge.
- `bv-03-01` repeats numeric substitution—usually at `x = 4`—instead of covering graph reading, units, equation-to-graph translation, diagnosis, and transfer.
- `bv-03-03` repeatedly labels every interpolation “reliable.” Inside-range predictions are better supported, but reliability still depends on the fit and context.
- `bv-04-01` ends with the same column-total job used earlier rather than a missing-cell or consistency challenge.
- `bv-04-02` reuses one pet-preference table throughout, and its challenge repeats percent-of-the-whole with a changed cell.
- `bv-04-03` needs visible rate comparisons, treats `70%` versus `68%` as conclusive without sample-size qualification, and falsely says the lesson completes all of Grade 8 mathematics.
- `bv-05-02` asks learners to infer residual-plot shapes from prose and number strings, overstates what a patternless residual plot proves, and uses dense metaphors (“diseases,” “X-ray,” “screams”) where direct Grade 8 language is clearer.

## Approved current lessons

- `bv-03-02` visibly constructs a phone-plan line and transfers slope/intercept meaning across pool, savings, and taxi contexts with clear units and distinct learner jobs.
- `bv-05-01` coordinates residual figures, computation, inverse point placement, sign, zero, absolute miss, and two-line comparison without evaluator or feedback disagreement.

## Expected authority and queue effect

After root-controlled validation and append to the authoritative ledger, these 15 current records should close exactly:

- 15 `LESSON_COMPLETE_DISPOSITION` rows;
- 15 `VISUAL_FIRST_REPRESENTATION` rows;
- 15 `GRADE_LANGUAGE_REVIEW` rows;
- **45 completed review rows total**.

Under the current decision-to-queue bridge, the 12 `REVISE` records and one `ESCALATE` record should create **13 `LESSON_REVISION_IMPLEMENTATION` rows**. The expected net pending-queue reduction is therefore **32 rows**, assuming no source hash changes or concurrent rows alter the same lesson-review identities before materialization. The escalation must remain release-blocking until its mathematical target, evaluator, representation, and feedback are independently repaired and reviewed under a new live basis hash.
