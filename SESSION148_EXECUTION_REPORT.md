# Session 148 execution report

## Result

Session 148 began from the definitively sealed Session 147 archive, recomputed the live 17-lesson reviewed K–8 queue, reranked all remaining mathematical families, and selected the largest exact-fit closure that survived claim-level and learner-action review.

The selected closure is `exactNumberLab`, spanning seven lessons and 51 authored experiences. Forty-eight experiences were converted and three already-direct interactions were retained. The reviewed queue moved **17 → 10**.

## Exact authored boundary

- Changed lesson files: **7**
- Widget substitutions: **48**
- Main conversions: **41**
- Remedial conversions: **7**
- Retained direct experiences: **3**
- Variant declarations changed: **0**
- Non-target lessons byte-identical: **1,122**

## Breakthrough

One exact-number state now drives fraction benchmarks, grouping order, powers, inequality boundaries, signed rational operations, root classification, root bracketing, density witnesses, rendering, grading, feedback, narration, reveal, keyboard state, CML routing, and seeded generation.

A generic calculator approach was rejected. The engine preserves distinct tasks such as grouping-first, boundary membership, root classification, and density while sharing one exact truth layer.

## Failures found before release

1. Unicode inequality operators were not normalized.
2. Inequality parsing assumed variable `x`.
3. Numeric and relational choice carriers were incorrectly treated as semantic claim strings.
4. Root select/list variants initially had no valid exploration source set.
5. Repeated mathematical operands were wrongly treated as duplicate source data.
6. Session 147's historical content proof did not permit explicit later-session changes.
7. The first monolithic generated-freshness run exceeded an execution window; the chain was split into bounded, hash-preserving stages rather than weakened.

## Executed proof before packaging

- Failure-first audit: **50/50**
- Authored audit: **48/48 conversions + 3/3 retained direct interactions**
- Exact-number sweep: **27,648/27,648**
- Session 148 mutations: **60/60 rejected; 3/3 controls accepted**
- Historical and current seeded total: **154,368/154,368**
- Historical and current mutations, Sessions 143–148: **244/244 rejected**
- Source transpilation: **25/25**
- Lesson JSON and IDs: **1,129/1,129**
- Lesson hashes: **1,129/1,129**
- Registration: **122/122**
- Player harness: **36/36**
- CML integration: **PASS**

## Runtime boundary

A fresh exact-lock `npm ci` was executed. The configured registry returned 404 for locked `zustand@5.0.14`; Node 22.16.0 is also below Chromium 149's declared 22.17.0 minimum. The lockfile remained byte-identical and no usable dependency tree was produced.

Current-tree project typecheck, Vitest, production build, and Playwright are therefore **not claimed**.

## Package rehearsal

A clean rehearsal tar was extracted independently after the monolithic package command reached an execution-window boundary. The extracted bytes passed the complete proof chain in bounded stages: all 154,368 seeded cases, all 244 historical/current mutations, 98 generated artifacts, content boundary, lesson hashes, registration, player contract, native integrity, tidy, and package identity.

The rehearsal also caught and repaired one host-portability defect in `diff-stats-s148.py`: its baseline default used an absolute workspace path. It now resolves through `SESSION148_BASELINE_ROOT` or a relative sibling directory.
