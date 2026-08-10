# S217 — content-change ledger

**Exactly one authored lesson file changed, by exactly one inserted step.**

## `content/courses/two-step-equations/lessons/tse-04-01.json` — "Solving Two-Step Inequalities", step `i1b`

The no-flip CONTRAST twin of S216's `tse-04-02/i1b`, nominated by S216's own independent QA.
Start `3x > 12` (the lesson's own c1 mid-state), transforms ÷3 and ×3, target `x > 4` under
`requireSolvedForm`. Dividing by a POSITIVE number moves nothing — the control experiment that
isolates the negative factor as the cause of reversal. The reachable wrong action (flipping when
you shouldn't) produces `x < 4`, a wrong set, graded incorrect with the direction diagnosis
quoting the learner's own line.

- before `9cf879c308c5cce4287fe7bec4773a8c7f01dad068309e526ee4965de4b7f9d1` (S216 seal)
- after  `0e4d5281fab10d59e5b13d734a392086c3eb27779f9ef897c4f8662928f43003`
- Only `i1b` inserted (order `c1, i1, i1b, k1, …`). **Revert-proof**: stripping `i1b` and
  re-serialising reproduces the seal hash byte-for-byte — verified at authoring time, re-verified
  after the QA-directed feedback fix, and independently by QA against the seal tarball.
- Authorization: AUTHORIZED map +1; count 813 → **814**; manifest regenerated; proof 814/814;
  hash 1,701/1,701.

**Independent Fable QA: ACCEPT — mathematics 10/10, overall 9.25** (SESSION217_FABLE_QA.md).
Machine-checked: no transform press ever changes the drawn set (the step's thesis, verified on
every edge of a 268-state sweep with a self-mutation-verified instrument); exactly one reachable
correct state; the untouched start grades incorrect via the form diagnosis. Its two required
fixes (an inclusion-shaped pin; a guard message false on bound-halt) and one optional fix (the
success string "the line never moved", false of a reachable flip-detour route — replaced with the
route-true "finished exactly where it started") all landed before seal.

The mathematics, two routes: boundary 12/3 = 4 by cross-multiplication (positive coefficient
preserves the written `>` ⇒ x > 4); samples in the ORIGINAL `3x > 12`: x=5 → 15 > 12 true,
x=3 → 9 > 12 false, x=4 excluded (12 > 12 false).

## Non-content changes in the same seal

- `src/lib/schema.ts`: the S216-QA reachability guard (coefficient 1 must be provably reachable
  from the offered transforms under `requireSolvedForm`), with the honest two-message refusal
  (proved-unreachable vs could-not-confirm-within-bounds). Mutation-verified.
- `src/components/widgets.numberLineRay.s215.test.tsx`: +5 guard tests (additive).
- `src/components/widgets.mmip.o2.s212.test.tsx`: the classic-spec pin now covers the SVG
  accessible name, delimiter-anchored, via an independent transcription of the reading rule.
- `scripts/engine-capabilities.json`: unchanged.
