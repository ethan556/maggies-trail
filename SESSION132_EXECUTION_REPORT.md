# Maggie's Trail — Session 132 execution report

## Answer-first result

Session 132 built `trialProbabilityLab`, a shared deterministic probability engine that makes favourable-over-total visible in both experimental trials and theoretical outcome spaces. It converts the two highest-leverage remaining probability lessons without turning them into simulations that change the authored task.

## Artifacts shipped

- New engine registered across 108/108 generated core surfaces.
- 15 converted experiences: 12 experimental, 3 theoretical, including 2 remedial checks.
- 7 surface-preserving variant declarations using `trialRelFreq` and `trialTheoretical`.
- 13 new test declarations across 2 named specs.
- 16-case adversarial mutation matrix.
- Byte-level content ledger and final 1,129-lesson hash seal.

## Mathematical mechanism

For every selected fraction `n/d`, the engine computes the claim on the displayed total:

```text
claimed favourable count = total × n ÷ d
```

The accepted answer is determined only by exact cross-product equality:

```text
n × displayed total = displayed favourable × d
```

Experimental mode fixes the observed trial strip. Theoretical mode fixes every equally likely outcome. The same truth drives integrity, grading, answer summaries, screen-reader narration, and reveal.

## Converted lessons

| lesson | before | after | experiences | remedials |
|---|---:|---:|---:|---:|
| `sp-03-02` | C | B27 | 6 | 1 |
| `sp-03-03` | C | B30 | 7 | 1 |
| **Total** |  |  | **13 authored steps** | **2** |

Both lessons rest at Tier B. Their authored concept sequence does not justify inserting new predictions under the frozen-content contract.

## Measured movement

| metric | Session 131 | Session 132 |
|---|---:|---:|
| registered widget types | 107 | **108** |
| manipulatives | 101 | **102** |
| Tier A | 608 | 608 |
| Tier B | 209 | **211** |
| Tier C | 284 | **282** |
| Tier D | 28 | 28 |
| reviewed K–8 queue | 56 | **54** |
| unreviewed | 0 | **0** |

## Adversarial findings and repairs

1. Generic `choices` measurement assumed a boolean `correct` field. The new engine uses rational equivalence, so both tier and excellence compilers now invoke the engine's truth relationship rather than counting the accepted fraction as a misconception.
2. Experimental and theoretical probability were not collapsed into one simulation. Fixed-trial evidence and fixed outcome spaces remain distinct modes under one favourable-over-total invariant.
3. Seven existing freshness declarations were upgraded atomically; variants cannot silently fall back to `fractionEntry`.
4. Rationally equivalent duplicate choices, ambiguous accepted answers, inconsistent outcome counts, and mode-conflicting authoring are rejected by integrity checks.
5. Reveal preserves the learner's sky claim and adds a dashed tangerine target; color is paired with checkmarks, circles, diamonds, labels, and line patterns.

## Authored-content ledger

Two lesson JSON files changed under the charter's broken-representation, remedial-surface-continuity, and variant-surface-continuity exceptions:

- 15 widget nodes;
- 7 variant-form declarations;
- 15 misconception-feedback mappings preserved verbatim;
- 1,127 other lesson files byte-identical;
- every non-target field in the two changed lessons hash-proved unchanged.

## Verification boundary

All dependency-free source, content, registration, measurement, freshness, native-integrity, identity, tidy, hash, and package-re-extraction gates pass. Exact-lock restoration is externally blocked by the mirror's missing `zustand@5.0.14`; Node 22.16 is also below Chromium 149's Node 22.17 requirement. TypeScript with project dependencies, Vitest, content/pedagogy runtime validators, ESLint, build, Playwright, and screenshots are therefore blocked—not passed.

## Diff statistics

See `SESSION132_DIFF_STATS.json` for the exact file list. The final report excludes itself, gate evidence, the diff-stat file, and the artifact manifest from its own diff scope.

## Next binding target

`sp-04-03` is the remaining compound-probability dependency. Extend `treeDiagram` or `probabilityArea` only if the learner can separately see and grade sample-space size and the compound-event probability; do not merge the two claims for a tier increase.
