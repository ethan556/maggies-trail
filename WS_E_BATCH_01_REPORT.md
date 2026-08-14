# WS-E Phase 2 — Batch 1 Adjudication Report (gates 1–30 of 1,362)

Session S241, 2026-08-13. Adjudicated against `WS_E_PREDICTION_RUBRIC.md` §4/§5, reading each
gate's own `predict.prompt` / `predict.options` / `predict.reveal` text. `widget_type` was **not**
consulted for any verdict (rubric §2's absolute rule).

**Every verdict below is `PROPOSED`.** Nothing in `content/courses/` has been touched — the only
file changed is `PREDICTION_GATE_ADJUDICATION.csv` (verdict + category + notes columns for these
30 rows). Per the standing per-batch-rulings decision, batch 2 doesn't start until you rule on
this one.

---

## Result

| Verdict | Count | Share |
|---|---:|---:|
| KEEP | 20 | 67% |
| REWRITE | 9 | 30% |
| REMOVE | 1 | 3% |

**Old CSV comparison for the same 30 gates: 29 KEEP / 1 REMOVE.** The disagreement is not where
the old CSV's method would predict — the one gate it removed (`as100-01-01/i1`) is among the
strongest in the batch, and 9 gates it kept don't clear the rubric as written.

Coverage: `absolute-value-piecewise` (9 gates, grade 9), `add-subtract-10-k` (20, grade K),
`add-subtract-100` (1, grade 2).

### Cost signal (compare to the pilot's ~30% hard / ~13% second-reader)

7 of 30 flagged for a second reader (23%) — all in the K course, where the gates are short and
the KEEP/REWRITE line is genuinely thin. The grade-9 course took almost no judgment: 9/9 clean
KEEPs with quotable evidence. **Band matters more than volume for adjudication cost** — a useful
scheduling input for the remaining 1,332.

---

## The one flip worth your attention

**`as100-01-01/i1` — old CSV: REMOVE → proposed KEEP.** This is the rubric document's own §1
flagship example. The gate predicts `7 + 7` from `6 + 6 = 12` and reveals *"Each double is 2 more
than the one before — BOTH addends grew by 1. Know one double and its neighbours come free: 12,
14, 16, 18."* That's an invariant stated across four worked cases, plus a distractor (`13`)
refuted by naming the exact slip. The old CSV removed it because `matchPairs` scores low on
manipulation capability — a property of the engine, not of this gate's pedagogy.

---

## The 9 REWRITEs — one dominant pattern, not nine separate problems

**Six of the nine are the same gate shape** (`koa-01-04`, `koa-02-01`, `koa-02-03`, `koa-03-02`,
`koa-03-04`, and `koa-02-05` adjacent to it): *"N things, M join/leave — which way does the count
move?"* with a reveal that restates this instance's arithmetic (*"Children joining makes the group
bigger, so the count moves up"*) and never generalizes. Each is individually defensible; five
near-identical interruptions inside one K course is the interruption-cost problem
`OPTIMIZATION_PLAN_V3.md` Part 1.2 names. **The cheapest fix is not nine rewrites — it's keeping
one or two of these as the canonical direction-of-change gate (with an added always-claim or
join/leave counterfactual) and dropping the rest.** That's a judgment call I'm flagging, not
making.

Two more (`koa-01-05`, `koa-02-04`) are the plus-sign/minus-sign mirror pair: correct mapping
stated, wrong sign never worked out. One counterfactual sentence each would close both.

The ninth (`koa-03-06`, *"what changes with practice?"*) is a meta-claim about practice rather
than mathematics — salvageable only by rewriting toward the buried invariance *"Practice does not
change the answers."*

## The 1 REMOVE

`koa-03-10/i1` — *"The facts now come mixed up instead of in order. What makes that harder?"* No
mathematical claim in any of the five categories; distractors are generic (*"the numbers get
bigger"*, *"the rules change"*). No rewrite of the reveal alone produces a mathematical gate
without authoring a new one. Flagged for a second reader since it's the batch's only REMOVE.

---

## What I need from you

1. **Ratify, adjust, or reject these 30 verdicts** (whole batch, or call out individual gates).
2. **The repetition question** — for the six near-identical K direction-of-change gates, do you
   want each rewritten in place, or the set thinned to one or two canonical gates?
3. **Purge cadence** (deferred from the plan): execute Phase 4 content edits after each ruled
   batch, or accumulate rulings and purge in waves once a course or grade band is complete?
   My recommendation: **accumulate per course** — it keeps `content/courses/` diffs coherent and
   lets repetition patterns like the one above be seen whole before editing.
