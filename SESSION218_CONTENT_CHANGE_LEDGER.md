# S218 — content-change ledger

**Exactly one authored lesson file changed.**

## `content/courses/expressions-equations/lessons/ee-05-02.json` — "Graphing Inequalities", step `k1`

Two changes to the one step, both inside the conversion:

1. **Widget: mcq → numberLineRay build task.** The mcq asked the learner to DESCRIBE the graph of
   x ≤ 3 (circle kind + arrow direction, three options); the learner now BUILDS it — start x > 0
   (open, right), target x ≤ 3 (closed at 3, left), no transforms, graded on the solution set.
   The mcq's two distractor misconceptions are now the engine's own reachable wrong states with
   state-computed diagnoses. Step id/kind/body/conceptTag/explanationVariants untouched
   (explanationVariants show post-check only — exposure unchanged, QA-verified).
2. **Variant form: graphDescription → graphBuild.** The old form generates mcqs; leaving it would
   have violated the resolver's type-match invariant (its test was red until this landed). The new
   ray-emitting `graphBuild` form ships under the full variant protocol — independent
   substitution route, engine-terms gate branch, 150 seeds, print-and-read (which caught an
   article-morphology bug and an in-set fallback test number pre-ship). The check keeps its
   re-askability, now at the build demand rather than the describe demand.

- before `ef94b24352e899e3a5f806e7926c1a384e298404116257450fd113782dbd4895` (S217 seal)
- mid (widget only) `155b4f82b9ad822518c90101261921d3e4514856f24f65fc28a8623cd350988f`
- after (variant form) `69dafdb236cc0e3d50580c5ecf1f63b689b341f78007358b7022f948acf2c032`
- Revert-proofs verified at both stages; QA re-confirmed the final bytes differ from its accepted
  widget state only in the variant form field.
- Authorization: AUTHORIZED map +1; count 814 → **815**; manifest regenerated; proof 815/815;
  hash 1,701/1,701.

**Independent Fable QA: ACCEPT — final delta OVERALL 9.55, mathematics 10/10, mastery 10/10**
(SESSION218_FABLE_QA.md, including the delta section where QA corrected a false claim in its own
first pass, on the record).

## Zero-content-byte activation

The distributionCompareLab judge-mode lift (evidence illumination + option grammar) activates on
**7 authored judge steps across 3 lessons** with no content change — QA render-diffed 525 cases
against the S217 seal: 483 byte-identical, 42 differing exactly at judge×{error, info}.

`scripts/engine-capabilities.json` unchanged (dCL already holds err 3; its judge mode now EARNS
the ghost half of that score — recorded, no rating change).
