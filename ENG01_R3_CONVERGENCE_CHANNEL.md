# ENG-01 R3 — WHAT THE CONVERGENCE CHANNEL IS ACTUALLY WORTH

**Evidence:** `reports/eng/ENG01_R3_FISHING_ORACLE.csv`, from `scripts/audit/fishing-oracle.mts`
**Gates:** `src/lib/evaluate.fishingOracle.s242.test.ts`, `src/lib/content.authoredKeys.s242.test.ts`
**Date:** 2026-08-16

`ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` §3.4 recorded R3 from a source read — 38 engines, 725
instances, 68 of them graded, whose miss feedback is directional (`lowFeedback`/`highFeedback`) or
quantitative — and then asserted, also from source, that *"on a graded step the two-attempt bound
makes one directional bit nearly worthless."*

**"Nearly worthless" is not a measurement.** This packet measures it.

## The attacker

Knows no mathematics. Can enumerate the states the widget's controls reach, can read the feedback
string, and can count. Two submissions, which is what a graded step allows
(`playerStore.ts:366-376`).

For a probe `p` and a hypothetical target `c`, the feedback he would see is computed by **moving the
target inside the spec and asking the shipped grader** —

```ts
evaluate({ ...spec, /* target fields */ := c }, p).feedback
```

— never by restating the grading rule in the audit. That is the whole reason the numbers below can
be trusted, and it is why the repair could be verified by re-running the same script.

A probe splits the candidate space into `W(p)` (targets it already satisfies — usually more than
one, since `fractionBar` and `areaModel` deliberately accept every equivalent build) and one class
per distinct feedback string. Guessing uniformly inside the surviving class on the second attempt:

> **P(win in 2 | p) = ( |W(p)| + #feedback classes ) / |C|**, against a blind baseline of 2·|W|/|C|.

## Result

**445 instances enumerated across five engines · 60 graded · 385 interactive.**

| | before | after |
|---|---:|---:|
| Graded, mean P(win in 2) — **oracle** | 0.410 | **0.230** |
| Graded, mean P(win in 2) — blind | 0.126 | 0.126 |
| Graded, **fishable to certainty** | **0** | **0** |

**The assessment's assertion survives: no graded step in the measured population can be won with
certainty by an attacker who knows nothing.** The two-attempt bound holds.

But one engine was far from worthless.

### `dragBucket` — a running score is not feedback

```ts
// src/lib/evaluate.ts:2110, before
const detail = `${right} of ${spec.items.length} sorted right so far. `;
return { correct: false, feedback: detail + (wrong ? wrong.feedback : spec.missFeedback), score };
```

The corpus's most common shape is four items and two buckets — **16 possible sortings**. The
feedback already named the first misplaced item, which distinguishes at most four things. The count
stacked on top of that identity and took the partition to **ten** classes, because the realisable
(count, first-wrong) pairs are exactly the ten with `j ≤ k`.

| `dragBucket`, 4 items × 2 buckets | classes | P(win in 2) |
|---|---:|---:|
| count + item identity | 10 | **0.688** |
| item identity alone | 4 | 0.313 |
| blind, two guesses | — | 0.125 |

Across all **37 graded** `dragBucket` steps the mean went **0.087 blind → 0.518 with the count**: a
learner who knows nothing passed **better than half** the graded sorting steps in the corpus. On the
**145 interactive** placements, where attempts are unbounded, it is the hill-climb itself — swap one
item, re-check, keep the swap if the number rose.

**Repair: the count is removed from the feedback string.** Not softened — removed, because it is the
one part of that string carrying no diagnosis. `wrong.feedback` names the misplaced item and says
why it belongs elsewhere; the count only scored the guess. Graded mean **0.518 → 0.225**.

Two things make this the platform's own answer rather than a new invention:

- **`plotPoint` already draws this exact line.** It computes a partial `score` and deliberately keeps
  it out of the feedback string; §3.6 of the assessment calls `plotPoint` clean for precisely that
  reason.
- **`score` still carries the number.** Any surface that wants to show progress *after* the verdict
  can, under the same post-verdict rule `tone === "info"` enforces at 154 sites.

### The directional channel is smaller than it looked

A census of every widget authoring both `lowFeedback` and `highFeedback` found 906 instances, 105 of
them graded, and **88 graded instances where the two strings differ** — the channel open on a scored
step. 78 of those 88 are `numberLineHop`.

**`numberLineHop`'s grader never reads either field, and its schema never declared them.** It grades
landings by name (`commonLandings`) and has no directional branch at all. So the real population is
**10 graded instances**, not 88: `fractionBar` ×4, `numberLinePlace` ×3, and one each of
`vectorExplore`, `probabilityArea`, `elapsedTime`.

Measured, those ten are worth ~1.5× on control spaces of six to nine states — from 0.33 to 0.50.
**The dominant term there is the size of the control space, not the oracle**: two blind guesses out
of six is already 33%. Closing the channel would move 0.50 → 0.33 on ten steps. Recorded, not
repaired: it is authored prose, the gain is second-order, and 17 graded instances already close it
by hand (`pv-02-02#k2` authors `lowFeedback === highFeedback === successFeedback`, restating the
reasoning instead of pointing a direction — the idiom, if anyone wants to adopt it deliberately).

## What checking `numberLineHop` turned up instead

Chasing those 78 phantom rows found two defects that have nothing to do with R3, and that no gate
could see.

### 1. 17,279 characters of authored feedback that no learner will ever read

`z.object` **strips** unknown keys by default. A lesson can author a field the engine's spec never
declared, `validate:content` passes, typecheck passes, and the string is discarded at parse time.

**152 of 10,260 authored widgets** carry at least one such key:

| engine | dropped keys |
|---|---|
| `numberLineHop` | `lowFeedback` ×124, `highFeedback` ×124 |
| `mcq` | `successFeedback` ×17 |
| `triangleSolve` | `angleStep` ×5 |
| `numeric` | `missFeedback` ×5 |
| `scatterFit` | `fallbackFeedback` ×1 |

The `numeric` and `scatterFit` cases are harmless duplicates — each also authors the live key with
the same content. The `numberLineHop` pairs are not: 248 distinct authored diagnostics, written for
real steps, that reach nobody.

### 2. One feedback string, pasted onto 36 problems it is false of

> `"Each hop is 10. From 430, 3 hops land on 460."`

This is the **live** `missFeedback` — the string the grader shows — on 38 steps. On `g2b-02-05`
("Hop by tens: three hops forward from 430") it is true. On the other **36** it is not:

| lesson | prompt | what the learner was told |
|---|---|---|
| `g4v-02-01#i2` | *How many milliliters in 4 liters?* | *Each hop is 10. From 430, 3 hops land on 460.* |
| `g4p-01-04#i1` | *Is 40 a multiple of 8?* | *Each hop is 10. From 430, 3 hops land on 460.* |
| `g5l-01-02#i1` | *How many 30s fit in 240?* | *Each hop is 10. From 430, 3 hops land on 460.* |

CLAUDE.md rule 5, exactly: *feedback must be literally true of the drawn problem.*

**It survived because of defect 1.** Anyone reading `g4v-02-01`'s JSON saw a well-authored widget —
*"Short of the landing — each liter is 1,000 milliliters, so four reach 4,000."* — sitting directly
above the boilerplate. That prose is in `lowFeedback`, which this engine drops.

**Repaired, using words that were already there.** 26 of the 36 took their own inert `lowFeedback`
with the directional opener removed; the other 10 filled the boilerplate's own template with their
own parameters. Two independent detectors agree the class is now empty: 0 instances whose feedback
is mostly numbers the widget never mentions, and 0 numeric miss strings shared across different
`(start, hop, hops, direction)` parameters.

## Gates landed

| Gate | Asserts |
|---|---|
| `evaluate.fishingOracle.s242.test.ts` | No running count in `dragBucket` feedback; `score` still returned; **a single probe distinguishes ≤ 4 classes** — the measurement itself, so the oracle cannot return in different words |
| `content.authoredKeys.s242.test.ts` | Dropped-key count pinned at 152 (exact, so a removal must be recorded); no `numberLineHop` feedback mostly about foreign numbers; no numeric miss string shared across different hop parameters |

## Not measured, and said so

`fishing-oracle.mts` enumerates five R3 engines. The other 34 are listed in its output with their
instance counts — an engine missing from a table reads as a clean one. The largest unenumerated are
`unitCircleExplore` 40, `hundredthsGrid` 36, `sequenceBuild` 30, `expLogExplore` 29, `slider` 28,
and **every one of those is entirely interactive**, which is why five engines of 38 still reach 60
of R3's 70 graded instances.

The ten graded instances outside the measurement, named rather than rounded away:

- `moneyBoard` `count` mode ×6 — grades a typed total, not a tray build, so there is no control
  space to enumerate. Its miss path is `commonEntries` by value, not a direction.
- `vectorExplore`, `probabilityArea`, `elapsedTime`, `angleMeasure` — one graded instance each, and
  all four consume `lowFeedback`/`highFeedback`, so they belong to the ten-instance directional
  population above.
