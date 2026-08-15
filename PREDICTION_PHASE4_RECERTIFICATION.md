# PREDICTION PHASE 4 — RE-CERTIFICATION

**Task:** PRED-01 · **Source seal:** `1f9bbe0` · **Date:** 2026-08-15
**Evidence:** `PREDICTION_PHASE4_RECERTIFICATION.csv`, from `scripts/audit/prediction-recertify.mjs`

## The question

`PREDICTION_GATE_ADJUDICATION.csv` holds 1,362 adjudicated gates — KEEP 1,145, REWRITE 200,
REMOVE 17. The reports built from it still describe that work as **open**. The plan's own reading of
the source says the opposite: removals done, rewrites in, 51 further rows thinned, 1,294 live.

Both cannot be true, and the difference is 217 pieces of pedagogy work either pending or already
done. So this re-certification trusts neither document and reads the live lesson JSON.

## The answer

| Verdict | Adjudicated | State in the live corpus |
|---|---:|---|
| REMOVE | 17 | **17 executed.** Every one absent. |
| REWRITE | 200 | **200 done.** Each gate present with reveal text that *differs* from the adjudicated original. |
| KEEP | 1,145 | 1,094 live · **51 stripped anyway** |

```
1,362 adjudicated − 17 removed − 51 thinned = 1,294 live   ← state before this session
1,294 + 3 restored (below)                  = 1,297 live   ← state at this seal
```

The arithmetic closes exactly, and no live gate exists that the adjudication never saw. **The
reports are wrong and the plan's reading of the source was right.** Phase 4 is implemented. The
1,145/200/17 work should not be re-run.

The REWRITE check is worth naming: it does not ask "is the gate still there?" but "is its reveal
text different from the adjudicated text?". Present-but-identical means the rewrite never happened,
and a presence check would have scored that as success. None of the 200 is identical.

## What this found that nobody was looking for

**51 gates carrying a KEEP verdict had their `predict` block stripped from steps that still exist,
and not one of those removals has a recorded rationale.**

**Three of the 51 were on flagship CML steps** — `dc-02-02#i1`, `pra-04-02#i1`, `tf-03-02#i1` — and
that is the entire cause of CML-01's three `flagship-missing-prediction` errors. Those steps did not
lack a prediction because nobody had written one. Each had one; it was reviewed; it was adjudicated
KEEP; the thinning pass removed it. By the time the strict gate saw the result, the only visible
fact was an absence, which is why it read as content that had never existed.

### The three are restored, and my reconstructions are withdrawn

Earlier in this session I authored replacement predictions for those three steps, deriving every
option from the step's own declared `cml.misconceptions` and every reveal from its declared
`cml.invariants`. That was the right thing to do while the originals were believed not to exist.

It is not the right thing to keep. `scripts/session/s242-pred01-restore.mjs` replaces all three with
the adjudicated originals, verbatim — **reviewed content beats reconstructed content even when the
reconstruction reads well.** `scripts/session/s242-cml01-predictions.mjs` is marked superseded and
no longer writes predictions; it retains only the `pra-04-02` sign-pattern correction, which is
independent of this and still needed.

Strict CML remains at 0 errors with the originals in place.

### The other 48 are reported, not resolved

They sit on non-flagship steps, so nothing is currently red. Restoring 48 reviewed-then-removed
predictions without a recorded reason for their removal would substitute my judgement for a decision
somebody made and did not write down — and the removals may well have been right. What is certain
is that the reason is not in the repository.

**Decision needed:** were the 51 thinned deliberately? If yes, record the rationale and the
adjudication CSV should carry a fourth verdict rather than 51 rows that say KEEP and mean removed.
If no, restore them. Rows with state `thinned` in the CSV are the work list either way.

## Acceptance against PRED-01

| Requirement | State |
|---|---|
| Rebuilt adjudication report matches live gates | **yes** — 1,297, arithmetic closes exactly |
| Resolved queue rows disappear | **yes** — the 217 REMOVE/REWRITE rows are certified done and should be retired from any open-task queue |
| Retained gates close a tested causal loop | **partial** — every retained gate has prompt, options, outcome and reveal, and strict CML enforces the flagship contract on flagship steps. Whether each *reveal* actually explains its outcome is a pedagogy reading, not a structural check, and is not claimed here. |
