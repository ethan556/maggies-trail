# Maggie's Trail — Session 133 execution report

## Answer-first result

Session 133 built `compoundEventLab`, a deterministic multi-stage probability engine that keeps the stage factors, complete ordered sample space, and learner claim under one mathematical truth while grading sample-space count and compound-event probability as separate actions.

## Artifacts shipped

- New engine registered across 109/109 generated core surfaces.
- 8 converted experiences in `sp-04-03`: 5 count claims and 3 probability claims, including the remedial check.
- 4 existing seeded variant declarations preserved on the new causal surface.
- 10 new test declarations across 2 named specifications.
- 20-case adversarial mutation matrix.
- Byte-level content ledger and final 1,129-lesson hash seal.

## Mathematical mechanism

For stages with outcome counts `n1, n2, …`, count mode derives:

```text
total ordered outcomes = n1 × n2 × …
```

If each stage supplies a favourable subset of size `f1, f2, …`, probability mode derives:

```text
favourable ordered outcomes = f1 × f2 × …
compound-event probability = favourable ordered outcomes / total ordered outcomes
```

Accepted probability choices are determined by exact cross-product equality, not a stored boolean. The same stage structure drives integrity, rendering, grading, answer summaries, screen-reader narration, reveal, tier measurement, and variant generation.

## Converted lesson

| lesson | before | after | count experiences | probability experiences | remedial |
|---|---:|---:|---:|---:|---:|
| `sp-04-03` | C22 | **B31** | 4 main + 1 remedial | 3 main | 1 |

Tier B is intentional. The authored concepts immediately before the interactions already state the relationships, so adding predictions would repeat taught information rather than create a genuine prediction–experiment cycle.

## Measured movement

| metric | Session 132 | Session 133 |
|---|---:|---:|
| registered widget types | 108 | **109** |
| manipulatives | 102 | **103** |
| Tier A | 608 | 608 |
| Tier B | 211 | **212** |
| Tier C | 282 | **281** |
| Tier D | 28 | 28 |
| reviewed K–8 queue | 54 | **53** |
| unreviewed | 0 | **0** |

## Adversarial findings and repairs

1. Existing `treeDiagram`, `probabilityArea`, and `trialProbabilityLab` were each PARTIAL: none simultaneously preserved fixed stage structure, complete sample-space size, and separately graded probability.
2. The new engine rejects duplicate stage outcomes, invalid favourable indices, impossible mode payloads, ambiguous accepted choices, and outcome products above the 120-item rendering ceiling.
3. Count and probability modes cannot silently share the wrong truth predicate. Count derives the stage product; probability derives the favourable product over that total.
4. All four existing variant declarations remain intact and now resolve to the causal surface across support/core/stretch seeds.
5. The tier and excellence compilers recognize engine-native exact choices and exclude only the truly accepted count or rationally equivalent probability claim.
6. Reveal preserves the learner's sky selection and adds a dashed tangerine target; colour is paired with checks, circles, labels, borders, and patterns.

## Authored-content ledger

One lesson JSON file changed under the charter's broken-representation and remedial-surface-continuity exceptions:

- 8 widget nodes;
- 0 variant declarations;
- 16 misconception-feedback mappings preserved verbatim;
- 1,128 other lesson files byte-identical;
- every non-target field in the changed lesson hash-proved unchanged.

## Verification boundary

All dependency-free source, content, registration, measurement, freshness, native-integrity, identity, tidy, hash, and package-re-extraction gates pass. Exact-lock restoration is externally blocked by the mirror's missing `zustand@5.0.14`; Node 22.16 is also below Chromium 149's Node 22.17 requirement. Project-local TypeScript, Vitest, content/pedagogy validators, ESLint, build, Playwright, and screenshots are therefore blocked—not passed.

Ten new test declarations bring the projected suite from 10,117 tests across 166 files to **10,127 tests across 168 files**, pending exact-lock execution.

## Diff statistics

See `SESSION133_DIFF_STATS.json` for the exact file list. The final report excludes itself, gate evidence, the diff-stat file, and the artifact manifest from its own diff scope.

## Next binding target

Select the next repeated representation gap from the live 53-row ledger using remedial reach and prerequisite centrality. Require a pre-mutation proof that the candidate engine preserves the authored action, every reachable misconception, and the honest resting tier.
