# S237 — re-check of the 127-engine learner-focus audit

**Closes `HANDOVER_COWORK_S237_SESSION_B.md` §4 item 2**, which asked for the LEAK count to be
confirmed dropping from 18 "for the right reasons", and warned that the session which made the
fixes should not grade them.

**Result: 18 LEAK + 1 UNCERTAIN → 10 CLEARED, 9 still open** (5 PARTIAL, 3 LEAK_REMAINS, 1
UNRESOLVED). Reproduce with `node scripts/audit/learner-focus-recheck-s237.mjs`.

That 9 is worth pausing on. The handover's §4 item 3 independently says *"the remaining 9 audited
engines, one at a time"* — arrived at by tracking what each commit claimed. This re-check never
read that number; it counted engines with a surviving probe. Two different routes, same 9.

---

## 1. Method — and why it is not a second opinion

Re-running a judgement pass over 127 engines would break both of the handover's warnings at once:
the same reasoning that produced a fix would decide whether the fix worked, and every borderline
call would be quietly re-litigated. Lesson 2 is that the original audit is a list of **candidates**;
re-deriving it would just produce a second list of candidates.

So `scripts/audit/learner-focus-recheck-s237.mjs` does not judge. Each of its 33 probes restates
**one falsifiable claim the original audit already made** — a named string, at a named site,
reaching a named channel — and asks whether that exact construct is still in current source. A
probe answers only PRESENT or GONE. Whether PRESENT is *acceptable* stays a human call, and where
the original audit refused to rule (`areaModel`), the probe refuses too.

One trap worth naming, because it inverts results silently: **the fixes left comments quoting the
strings they removed.** `c7df15d`'s comment contains the exact clause `"required before grading"`.
A naive grep reports that leak as un-fixed in three engines. The script strips `//` and `/* */`
before matching, so every hit is code. Anyone re-deriving this by hand should expect that.

### Why 108 CLEAN rows were not re-derived

A CLEAN engine can only have become dirty if its code changed. Mapping every changed line in
`4b66fe1..HEAD` to its enclosing component gives the complete exposure set: 17 components in
`widgets.tsx` and 13 `describeState` cases. That set is covered by the s44 gate, the parity gates,
and the full suite — all green. Re-reading 108 unchanged engines would produce reassurance, not
evidence.

---

## 2. Cleared, and by what

| Engine | Was | Cleared by |
|---|---|---|
| `equationOutcomeLab` | PROCESS_TELEMETRY | `c7df15d`, `489b272` |
| `exactNumberLab` | AUTHORING_LABEL | `c7df15d`, `3237c7d` |
| `geometricConstraintLab` | PROCESS_TELEMETRY | `c7df15d` |
| `pointSetReasoningLab` | AUTHORING_LABEL | `3237c7d` |
| `quotientReasoningLab` | AUTHORING_LABEL | `3237c7d` |
| `sequenceBuild` | AUTHORING_LABEL | `3237c7d` |
| `shapeHierarchyLab` (chips) | AUTHORING_LABEL | `b466212` |
| `signChart` | STALE_NARRATION | `a8baf9b` |
| `signedFractionLab` | AUTHORING_LABEL | `b466212` |
| `unitCircleExplore` | RAW_STATE_TOKEN | `523886e` |
| `verticalLineScanner` | RAW_STATE_TOKEN | `b466212` |

### "For the right reasons" — the suppression check

The failure mode this question is really about is deletion masquerading as repair: strip the
offending clause, watch the leak count fall, ship a description that now says less than the screen.
**That is not hypothetical here — it happened three times**, and the s44 substance floor caught all
three (`pointSetReasoningLab` 46 chars, `quotientReasoningLab` 59, `equationOutcomeLab` 49; see
`VITEST_SET_DIFFERENCE_S237.md`). One of them — `quotientReasoningLab` — had been reduced to a
description containing no mathematics whatsoever.

So the honest answer to "did the count drop for the right reasons" is: **for eight engines yes,
for three it dropped by over-deletion and has since been repaired properly, and for nine it has
not dropped.** The s44 floor is the standing detector for this class, and it now passes across all
113 dense descriptions.

### The parity gate is not theatre — re-proven, not inherited

Lesson 4 says always revert a known defect and confirm the gate goes red. `be2abd2` claims to have
done this; claims of that shape are exactly what should not be taken on trust. Re-run here:
reverting `79b0671`'s `moneyBoard` change-mode fix turns
`widgets.answerParity.s237.test.tsx` red —

```
FAIL  moneyBoard change mode does not announce the change the learner must compute
      expected 'You pay $10.00 for an item costing $6…' not to match /325 cents/
```

— and restoring it turns it green. Note *which* gate fired: `widgets.accessibleParity.s237.test.tsx`
stayed green throughout. The two files are not interchangeable, and a future session reverting a
defect against the wrong one will wrongly conclude the gate is dead.

---

## 3. Still open — the 9, with the exact surviving construct

Ranked by how mechanical the remaining work is.

### Unambiguous, no ruling needed (5)

| Engine | Surviving construct | Site |
|---|---|---|
| `affineRelationshipLab` | `{line.label} · {line.sourceKind}` — raw `z.enum(["equation","table","context"])` as a visible label; and the description still opens `"Affine relationship lab."` | `widgets.tsx:7129`, `describeState.ts:449` |
| `conditionalTableLab` | `Condition changes recorded: {n}/{spec.requiredSwitches}` — the authoring quota on the active screen. The *description* half was fixed. | `widgets.tsx:16016` |
| `graphStoryLab` | actions copy: `"reveal draws a separate dashed target without overwriting learner work"` — render-phase and program vocabulary in learner-facing copy | `describeState.ts:1021` |
| `placeValueTransformLab` | actions copy: `"reveal uses a separate ghost and never overwrites your work"`. The description half was fixed. | `describeState.ts:1020` |
| `proportionalReasoningLab` | actions copy narrates the authoring design (`"without replacing learner work"`). The counter was fixed. | `describeState.ts:1019` |

Three of those five are the same defect in the same place: **`WIDGET_ACTIONS` copy that explains
the authoring system's design rather than how to work the control.** The systemic-fix pass reached
the widgets and the descriptions and never reached `actionsFor`. One pass over those three entries
closes three rows, and it is the cheapest remaining item in the whole work package.

### Needs a ruling, not a patch (4)

| Engine | Question |
|---|---|
| `shapeHierarchyLab` | `"The engine independently derives: isosceles + acute."` names the software *and* states the classification the learner is being asked for. The audit filed it under AUTHORING_LABEL, but the answer-leak audit files the same line under clear leaks. It is probably both, and gating it is a behaviour change on a graded surface. |
| `lineRelationLab` | `LabReadout label="moves"` showing `{moves}/{spec.requiredMoves}`. Is a move counter against an authoring quota telemetry, or the learner's own progress? The house ruling in the handover (§5) says a counter stays when it reports progress toward a required action — which arguably protects this. It was still filed as a LEAK. Same construct appears on a solids engine at `widgets.tsx`, so the ruling covers two sites. |
| `triangleAngleLab` | `label="invariant sum"` and `label="deformations"`. The value (180.0°) is mathematics; the words are CML design vocabulary. "angle sum" is the honest label — but relabelling a readout on a graded geometry surface is a curriculum-copy change. |
| `areaModel` | `"Rows and columns can trade orientation while the number of unit squares stays invariant."` The original audit explicitly declined to rule and asked for a human. Still UNRESOLVED. It is a true mathematical claim about area conservation captioning a Rotate button — the word "invariant" is the only thing making it look like metadata. |

`triangleAngleLab` and `areaModel` are the same underlying question — *is the word "invariant"
banned, or only invariant **panels**?* — and answering it once settles both. That question is the
single highest-leverage ruling left in Work Package 1, and it is a house call, not a code call.

---

## 4. What this does not do

No browser verification, at any width, in either theme — Work Package 1's actual exit condition
remains unmet and untouched by this document. Nothing here regenerates
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv`. `PREMIUM_ENGINE_LEARNER_FOCUS_AUDIT_S237.csv` is deliberately
left as written: it is the pre-fix audit and its value is as provenance. This re-check is the
later row that supersedes it, per the manifest's latest-row rule.
