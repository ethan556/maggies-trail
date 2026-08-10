# S216 — content-change ledger

**Exactly one authored lesson file changed, by exactly one inserted step.**

## `content/courses/two-step-equations/lessons/tse-04-02.json` — "The Sign-Flip Rule", step `i1b`

The FIRST authored user of the `numberLineRay` engine (built S215, QA-passed, zero users until
now), inserted in the one lesson that exists to teach inequality reversal.

- before `79f82190e042ccffca9ea0a135e973c78fc4729d693326324bd151cc9546ef6a` (S215 seal)
- after  `03bf44a4b35998a5330d4fcdb9c10ea65aba4e7f772a9c4d4eafd65b51a4db97`
- Only `i1b` inserted (order `c1, i1, i1b, k1, …`); **stripping `i1b` and re-serialising
  reproduces the before-hash byte-for-byte** — verified independently by Fable-QA against the
  seal tarball. Serialization matched exactly (the implementor caught its own trailing-newline
  difference before writing).
- Authorization: AUTHORIZED map +1 in its own format; count 812 → **813**; manifest regenerated;
  proof 813/813; hash 1,701/1,701.

The step: start `−2x > −8` — the lesson's own c1 worked example mid-state — with both-sides
transforms ÷(−2) and ×(−2), target `x < 4`, graded with the new additive `requireSolvedForm`
field (solution set AND coefficient 1). Predict block aims at the invariant: the boundary stays
at 4; the SET flips.

**Why the field exists — the honest chain of custody:** the implementor REFUSED the original
packet because its own integrity gate rejected the step ("begins solved") and the untouched start
would have graded correct — a learner scoring without ever performing the flip. Every alternative
shape keeping c1's numbers failed worse (one rewards the misconception). The ~15-line additive
fix (`requireSolvedForm`; the begins-solved guard comparing set AND form; the target-must-be-
solved guard) made the real task gradable, and surfaced a third diagnosis — right set, wrong
form — whose absence would previously have produced a FALSE inclusivity message.

**Independent Fable-QA: ACCEPT — mathematics 10/10, mastery 9, overall 9.3** (the program's P0
release gate: math 10, mastery ≥9, overall ≥9 — met). Its verification: own BigInt oracle; a
268-reachable-state sweep (exactly one state grades correct); the S215 evaluator imported FROM
THE SEAL TARBALL and diffed over 4,872 states to prove flagless specs grade identically; proof
that both solve orders unavoidably pass through the wrong set; every diagnosis string verified
true of the state that triggers it; zero leaks (`x < 4` appears only post-correct and in the
frozen c1). Three implementor claims corrected on the record (mutation flips 8 states, not 3;
the ×(1/2) dead-end justification was false though the exclusion stands; one unreachable-state
caveat). Batch ruling: **no other step in this family converts** — all are two-step inequalities
the engine's `a·x REL c` state cannot hold, and the four checks carry the lesson's variant-backed
mastery measurement. Next instance: `tse-04-01`'s positive-coefficient contrast.

## Registry changes (adjudicated, rubric-cited)

1. **`covariationScrubber` err 3 → 1** (Σ21 → 19, grade A → B). No reveal ghost, not in
   `MULTI_CONTROL`, only authored low/high strings — mechanism parity with `numeric` (err 1).
   The one genuine wrong row among the twelve S215 debts.
2. **`numberLineRay` mobile 2 → 3** (Σ19 → 20, stays A). Rubric level-3 both clauses verified in
   source; the S215 adjudicator's sole stated blocker (failing 44px gate) was removed the same
   session; barBuilder precedent.

The other eleven S215 debts were retired without registry changes: three were false positives of
the contract's hyphen-blind ghost regex (the engines had ghosts all along); eight hold err 3 via
the rubric's second mechanism (live model-computed cues), which the contract now checks.
