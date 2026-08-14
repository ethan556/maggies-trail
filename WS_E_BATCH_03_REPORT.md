# WS-E Phase 2 — Batch 3 Adjudication Report (415 gates, chunks 1–7 of the corpus-scale wave)

Session S241, 2026-08-14. Per your "escalate only judgment calls" ruling, this batch was
adjudicated by 7 parallel agents (not by me directly), each reading the full rubric once and
adjudicating ~55–60 gates against it, quoting the gate's own text as evidence. I then ran a
**mechanical integrity checker** against all 415 verdicts before merging anything — it verifies
every note contains a real verbatim quote from that gate's own prompt/options/reveal, flags
boilerplate or near-duplicate reasoning, and rejects any note that cites widget type as evidence
(the exact failure mode this whole rubric replaces). **Zero boilerplate, zero widget-type
citations, zero near-duplicate notes found across all 415.** All verdicts are `PROPOSED` and
already merged into `PREDICTION_GATE_ADJUDICATION.csv` (nothing in `content/courses/` touched).

Running total: **475 of 1,362 gates adjudicated (35%).**

---

## Result

| Verdict | This batch (415) | Share | Running total (475) |
|---|---:|---:|---:|
| KEEP | 322 | 78% | 367 (77%) |
| REWRITE | 84 | 20% | 93 (20%) |
| REMOVE | 9 | 2% | 15 (3%) |

208 of 415 (50%) were escalated by the adjudicators for your attention — most (112) are
repetition-family flags, not disagreements. Breakdown: 112 repetition families, 79 disagree with
`old_decision`, 11 other hard calls, 6 contradictions/defects (below).

---

## Two verified content defects — not adjudication calls, need your ruling

Per `CLAUDE.md`'s standing rule (never silently edit frozen content; log genuine errors for a
human), I independently re-checked these against the live lesson files before reporting — these
are not the adjudicator's opinion, they're arithmetic I confirmed myself.

**1. `k100-03-02` and `k100-03-03` (Kindergarten, `counting-to-100-k`) — the graded-correct answer
has the wrong number.** I pulled the full `k100-03-*` family (7 gates, same template: "counting on
N from X, will you pass benchmark Y?"):

| Gate | Math | Keyed option | Reveal says |
|---|---|---|---|
| k100-03-01 | 7+5=12 | "Yes — you land on 12" ✓ | matches |
| **k100-03-02** | **34+4=38** | **"No — you stop at 40"** | **"reaches 38"** |
| **k100-03-03** | **46+3=49** | **"No — you stop at 50"** | **"reaches 49"** |
| k100-03-04 | 87+4=91 | "Yes — you land on 91" ✓ | matches |
| k100-03-05 | 29+1=30 | "You land right on 30" ✓ | matches |
| k100-03-06 | 72+1=73 | "You land right on 73" ✓ | matches |

Two of seven have a keyed answer whose *number* contradicts its own reveal — the "stop" option
should read "you stop at 38" / "you stop at 49," not the benchmark number itself. A learner who
computes correctly and picks based on the actual landing number is marked wrong. This isn't a
judgment call; it's a copy-paste-the-benchmark bug that hit 2 of 7 near-identical gates.

**2. `g1s-02-02` (Grade 1, geometry) — the reveal's own arithmetic doesn't reach its stated
answer.** Prompt: "Two squares join into a rectangle. How many sides?" Keyed answer "Four" (which
is geometrically correct — a rectangle has 4 sides). But the reveal says *"The two joined edges
are hidden inside, leaving four sides on the outside"* — 8 raw edges minus 2 hidden is 6, not 4.
The reveal skips the merge step (the two top edges become one side, the two bottom edges become
one side) that actually gets you to 4. The answer is right; the stated reasoning doesn't produce
it.

**What I need:** these are frozen-content defects, not something I'll silently fix. Want these
logged to a defects section (matching this project's `HANDOVER` §4 convention) for a later
content-fix pass, or do you want to rule on the fix now?

---

## Repetition families — 112 gates, worth a batch-level decision

The escalations surfaced far more repetition than batches 1–2's small sample suggested. Largest
families found so far:

- **"Hop direction" (5 gates):** `as-01-01`, `as-03-01`, `as-03-02`, `g1a-01-01`, `g1a-02-03` —
  identical claim and reveal shape across two courses.
- **"Crossing the ten benchmark" (4 gates):** `as-03-04`, `as-05-01`, `as-05-02`, `g1t-03-01`.
- Multiple tight pairs (2 gates each, same claim with swapped numbers): `as-03-03`/`as-05-03`,
  `g1t-01-04`/`g1t-03-03`, `g1t-02-01`/`g1t-02-03`, `as-04-01`/`as-04-03`, and others.

This is the same pattern you ruled on in batch 1 (thin to one or two canonical gates). Given the
volume here, I'd suggest **holding all repetition-family verdicts as provisional KEEP/REWRITE
until a course is fully adjudicated**, then bringing you one thinning decision per family rather
than 20+ individual ones. Matches your per-course purge cadence.

---

## What I need from you

1. **Ratify the 415 KEEP/REWRITE/REMOVE verdicts** (or spot-check — the full CSV with notes is in
   the repo at `PREDICTION_GATE_ADJUDICATION.csv`, rows tagged "PROPOSED (wave adjudication...)").
2. **The two content defects above** — log for later, or rule now?
3. **Repetition families** — hold for a per-course thinning pass (recommended), or rule family by
   family as they surface?

Remaining: 887 gates (chunks 08–11, ~250 gates, currently running; then 14 more chunks).
