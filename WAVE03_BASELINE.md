# Wave 03 baseline — K–8 median lesson repair

**Session:** S223
**Date:** 2026-08-10
**Input:** S222 automated premium-shell seal
**Policy:** Existing engines first; no interaction inflation; retrieval and assessment remain independent.

## Fresh direct-source result

The historical `PREMIUM_INTERACTION_PRIORITY.csv` was not a safe implementation queue. It predated the S126–S218 interaction campaigns and still described lessons such as `rns-02-01` as having zero rich interactions even though current source contains multiple `exactNumberLab` states.

The current dependency-free excellence compiler was run against `content/courses/**`, `scripts/engine-capabilities.json`, the live tier compiler, and the reviewed disposition policy. It measured:

| Band | Lessons | Widget steps | Causal widget steps | Exploration steps | Causal exploration steps | Lessons with exploration | Lessons with causal spine |
|---|---:|---:|---:|---:|---:|---:|---:|
| K–2 | 410 | 2,523 | 998 | 883 | 727 | 410 | 389 |
| Grades 3–5 | 419 | 2,539 | 659 | 846 | 565 | 419 | 330 |
| Grades 6–8 | 245 | 1,548 | 444 | 563 | 268 | 245 | 186 |

Additional live gates:

- K–8 Tier C/D queue: **0**;
- unclassified K–8 backlog: **0**;
- load-bearing K–8 concepts with no experience above Tier C: **0**;
- K–8 Tier A: **821**;
- K–8 Tier B: **253**;
- honest Tier-B prediction ceilings: **15** (redundant or unsafe, not automatic change authority).

## Baseline decision

Wave 3 is not authorized to reopen already repaired lessons merely because a stale CSV says CHANGE. The only current queue is the 15 honest prediction ceilings. Each is now explicitly classified in `PREMIUM_INTERACTION_PRIORITY.csv` as KEEP or REFUSE with source-backed rationale.
