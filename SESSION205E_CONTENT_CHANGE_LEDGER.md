# S205E — content-change ledger

**No authored lesson content was altered.** One `insertion`, applied with the applier's structural
no-drift proof (serialise-minus-insert === original); 16 assertions passed.

## INSERTION — `alg1-01-01` "Two-Step Equations" · new step `c2b` (solveBalance)

Anchored after `c2`, the concept step that states *"whatever you do, do it to both sides."* The
insertion turns that rule into a consequence the learner produces: the predict block asks what
happens if you strip the 5 off the left pan only, and the beam tips immediately.

Uses the lesson's **own** authored example, 3x + 5 = 20 (named in `c1`) — no new mathematics
enters the lesson. Distinct from the existing rich step `i1`, a balanceScale on 2x + 3 = 11 which
asks the learner to *slide x until it balances*: this one asks them to *perform the two-sided
operations*, which is the two-step machine the lesson is about.

Verified against the grader's own functions, not by eye:

- `(c − b)/a = (20 − 5)/3 = 5`, a positive integer — the tile split is exact, satisfying the
  invariant `widgetIntegrityErrors` enforces.
- `solveBalanceWitness(3,5,20,"eq") = 5` — the beam weighs the true x, so what the learner watches
  and what the grader concludes cannot come apart.
- `solveBalanceSetsEqual` confirms the solved state (x = 5) is equivalent to the original, **and
  falsifies the one-sided removal**: 3x = 20 is *not* equivalent — which is exactly the claim the
  predict block's reveal makes. The predict prose is true because the grader says so, not because
  it reads well.

## REFUSALS (2), cited in `content/patches/s205e-campaign-batch2.json`

**`alg1-04-01` "Solving Inequalities" — refused as METRIC-PADDING, not for a gate failure.**
The engine fits. solveBalance supports `relation:"lt"` and models this lesson's own 2x + 3 < 11
exactly ((c−b)/a = 4, a positive integer; the grader decides inequalities by solution-set
equivalence, evaluate.ts:787-792, so x < 4 grades correctly). It was refused anyway because step
`i1` is already a rich equationOutcomeLab **on that same inequality**. A second lab on the same
2x + 3 < 11 raises the rich-step count without giving the learner a doing-moment they lack.

> The ≥25% target is a proxy for learners getting their hands on the mathematics. Inserting
> redundant labs satisfies the proxy while defeating the thing it proxies for. This is a refusal
> class the campaign will keep meeting, and **the prefilter cannot detect it** — the prefilter
> ranks by *adjudication cost*, and a lesson can be cheap to adjudicate and still wrong to convert.

The unserved content in that lesson is the number-line side (open vs closed endpoint, ray
direction, currently a matchPairs) — which needs a number-line ray engine, not another balance.

**`dr-03-02` "The Quotient Rule" — represents gate.** The lesson's graded subject is where the
minus and the square come from. `derivativeRuleLab`'s mode enum is `product|chain` only, and its
product mode renders a rectangle whose area is width × height — it shows u′v + uv′ but has no
representation of v⁻², so the −uv′/v² the lesson exists to explain never appears. A lab that stops
exactly where the lesson's question starts is not a doing-moment for this lesson. Engine gap
recorded: a quotient mode (fixed-area rectangle with one side driven, so the reciprocal's
inverse-square response is visible).

## Metrics

Census unchanged at **A 1177 · B 431 · C 92 · D 1** — alg1-01-01 was already Tier A; this
insertion targets the step mix, not the tier census (insertions are deliberately not tier-gated).
HS rich mix 15.1%, **358 more rich steps** to the ≥25% target.

## Process note recorded with this session

This ledger initially failed to write: its heredoc shared a command with a backgrounded launch and
was consumed by the `&`. The tarball was built and copied to outputs **without it** before the
omission was caught, and was rebuilt rather than shipped. A content change without its ledger is a
content change nobody can audit, so the rule is: build the ledger BEFORE the tarball, and verify
it is present inside the archive as part of packaging — not from the working tree.
