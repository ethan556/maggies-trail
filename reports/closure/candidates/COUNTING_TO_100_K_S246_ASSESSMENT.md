# Counting to 100 — S246 independent three-stream assessment

Scope: all 18 lessons in `counting-to-100-k`, reviewed in full against the V4 visual-first, question-job, stem, option, explanation, and Kindergarten language expectations. This packet records semantic decisions only; it changes no lesson, queue, shared ledger, cache, card, or generated evidence.

## Verdict

- Whole-lesson disposition: **18 REVISE**, 0 KEEP, 0 ESCALATE.
- Visual opportunity: **18 REQUIRED**, 0 PREFERRED, 0 SUFFICIENT, 0 ESCALATE.
- Grade-language fit: **9 FIT**, **9 REVISE**, 0 ESCALATE.
- Expected generic decision-row dispositions after root validation and append: **54** — 18 `LESSON_COMPLETE_DISPOSITION`, 18 `VISUAL_FIRST_REPRESENTATION`, and 18 `GRADE_LANGUAGE_REVIEW`.
- This does **not** close the underlying illustration replacements or implement any revision. The current scoped queue separately contains 35 withheld concept-figure rows.

## Evidence-led findings

| Lessons | Independent finding |
|---|---|
| all 18 | A visual model is mathematically required for early counting, tens, chart rows, and backward movement. The current audit withholds 35 of 36 concept placements, so no lesson is visually sufficient. |
| k100-01-02 | “Every ten ends in 9” is false or uses “ten” ambiguously for a decade; release-blocking wording needs correction. |
| k100-01-03, k100-01-04 | “Inside” a ten and “tens names” are unexplained abstractions for the early reading profile. |
| k100-02-01, k100-02-04 | Exact cluster `MCQ-cffd3f838bd6ebc7` repeats “Counting by tens — what comes after 30?” across lessons; the recurrence has no recorded instructional rationale. |
| k100-02-01, k100-02-05, k100-03-07 | Assessed jobs drift away from the lesson focus: counting-by-one in a tens lesson, forward tens in a backward-tens lesson, and ascending sequences in a backward-counting lesson. |
| k100-02-01, k100-02-02, k100-02-05 | “Count on/back one/two” feedback refers to a count of ten-hops without naming the ten unit, and one concept equates fingers and tens without defining the representation. |
| k100-02-03, k100-03-05, k100-03-06 | Prompts depend on hundred-chart squares, rows, “below,” and wraparound, but the lesson supplies withheld `number-track` concepts rather than a verified chart carrying the evidence. |
| k100-03-02, k100-03-03 | Prediction distractors say “Yes” while giving a landing below the stated boundary, making the options self-contradictory and cue-bearing. |
| course-wide | Many checks and challenges repeat the same hop, next-number, ordering, or missing-number job with changed values. Legitimate fluency remains, but premium revision needs clearer job progression and transfer challenges. |

## Validation gate

Run:

```text
node reports/closure/candidates/validate-counting-to-100-k-s246.mjs
```

The gate fails on a missing/extra lesson, stale review-basis hash, duplicate record ID, invalid enum, missing required field, weak evidence/reopen data, or missing lesson/visual evidence. A passing run reports 18/18 current hashes and the exact 18/18/9+9 decision distribution.

Authority boundary: these are candidate records. Only a root-reviewed append to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, followed by deterministic card/queue/cache regeneration, can make them current authoritative dispositions.
