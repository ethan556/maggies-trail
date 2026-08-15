# PREDICTION PHASE 4 — RE-CERTIFICATION

**Task:** PRED-01 · **Source seal:** `dd2fdae` · **Date:** 2026-08-15
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
| KEEP | 1,145 | 1,094 live · 48 **THIN** · 3 **THIN-REVERSED** |

```
1,362 adjudicated − 17 removed − 51 thinned = 1,294 live   ← state before this session
1,294 + 3 restored (below)                  = 1,297 live   ← state at this seal
```

**Every one of the 1,362 rows is now accounted for and reflected in the corpus. The
re-certification exits 0.**

The arithmetic closes exactly, and no live gate exists that the adjudication never saw. **The
reports are wrong and the plan's reading of the source was right.** Phase 4 is implemented. The
1,145/200/17 work should not be re-run.

The REWRITE check is worth naming: it does not ask "is the gate still there?" but "is its reveal
text different from the adjudicated text?". Present-but-identical means the rewrite never happened,
and a presence check would have scored that as success. None of the 200 is identical.

## What this found that nobody was looking for

**51 gates carrying a KEEP verdict had their `predict` block stripped from steps that still exist,
and at the time of the scan not one of those removals had a recorded rationale.** They do now — see
the ruling below — but that they did not is the finding: the removals were real, deliberate, and
invisible to every document describing this work.

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

### The other 48: ruled deliberate, and the file now says so

**Ruling (S242): the 51 were thinned deliberately.**

That settles the divergence, and it moves the problem from the corpus to the adjudication file. 51
rows said KEEP and meant removed — and anyone reading them, or grepping them, which is how a number
reaches a status report, drew the wrong conclusion. This program has already been slowed once by
counts that were true when written and false when quoted.

So the verdict is written down. `PREDICTION_GATE_ADJUDICATION.csv` now carries **THIN** as a fourth
verdict on those 48 rows, with the rationale in `adjudicator_notes`, and a new
`adjudicated_verdict` column preserving what review originally said. A reader of
`proposed_verdict` sees what happened; a reader who needs the review history still has it. Nothing
was destroyed to achieve that.

`prediction-recertify.mjs` learned the verdict too, and the change cuts the other way as well: a
KEEP row whose gate is absent is now an **error**, not a shrug. A removal with no verdict recording
it is precisely the state this file was in, and it cannot recur silently.

### The three exceptions, recorded rather than folded in

`dc-02-02#i1`, `pra-04-02#i1` and `tf-03-02#i1` are marked **THIN-REVERSED**. Marking them THIN
would record a removal that did not happen and *cannot* happen while those steps carry
`cml.flagship: true`, because the flagship contract requires a prediction — their absence is what
produced CML-01's three errors in the first place.

The only way to thin those three as well is to drop `cml.flagship` from the steps, which weakens a
gate to make something pass — the one thing CLAUDE.md says never to do. So it is not done here, and
not done quietly. If the intent really is that those three steps should carry no prediction, the
question is whether they should be flagship at all, and that is a curriculum decision rather than a
bookkeeping one.

## Acceptance against PRED-01

| Requirement | State |
|---|---|
| Rebuilt adjudication report matches live gates | **yes** — 1,297, arithmetic closes exactly |
| Resolved queue rows disappear | **yes** — the 217 REMOVE/REWRITE rows are certified done and should be retired from any open-task queue |
| Retained gates close a tested causal loop | **partial** — every retained gate has prompt, options, outcome and reveal, and strict CML enforces the flagship contract on flagship steps. Whether each *reveal* actually explains its outcome is a pedagogy reading, not a structural check, and is not claimed here. |
