# Session 88 — Causal Mastery Learning foundation

## Purpose

This overlay converts the K–8 manipulative strategy into executable platform primitives without adding another widget type. It is designed for the current Maggie’s Trail architecture: typed lesson JSON, one `LessonPlayer`, a centralized widget registry, deterministic evaluation, misconception-aware feedback, and a mastery/evidence system.

The implementation follows the required cycle:

> Predict → Construct → Observe → Explain → Revise → Generalize → Retrieve

## What is included

### Typed manipulative contract

`src/lib/cml/contracts.ts` defines:

- canonical mathematical state separate from visual state;
- semantic learner actions;
- constraints and machine-checkable invariants;
- process events containing direction, magnitude, strategies, misconceptions, confidence, and independence;
- synchronized representation adapters;
- fading plans;
- evidence outputs;
- flagship, supporting, and assessment engine roles.

### Deterministic causal runtime

`src/lib/cml/runtime.ts` provides:

- state transitions through semantic actions;
- invalid-state blocking;
- invariant checks after every action;
- strategy and misconception classification;
- prediction commitment and prediction-versus-observation comparison;
- undo, redo, reset, and replay;
- ghost-trace-ready event history;
- representation snapshots and staged fading.

It is intentionally framework-neutral. The current React widgets can use it without moving mathematical truth into component-local animation state.

### Strategy-aware adaptation

`src/lib/cml/adaptive.ts` implements the deterministic ladder:

1. cue;
2. structural lock;
3. contrast;
4. scaffold;
5. remediation.

The rung is selected from the learner’s process trace, not merely final correctness.

### Mastery integrity

`src/lib/cml/evidence.ts` keeps five evidence states distinct:

- exposed;
- practiced;
- mastered;
- retained;
- transferable.

A guessed answer cannot create independent mastery. Retention requires a later session on a later calendar day. Transferability requires delayed evidence, a transfer task, and more than one representation.

### Authoring validation

`src/lib/cml/authoring.ts` validates the CML lesson sequence and flags:

- flagship lessons built from response-only surfaces;
- construction without mathematical manipulation;
- observation without visible causal consequence;
- missing invariants;
- revision without a preserved earlier trace;
- incomplete representation translation;
- retrieval without delay or transfer;
- accidental restoration of faded support.

### Five reusable kernels

`src/lib/cml/kernels.ts` declares the common vertical architecture:

1. quantity and composition;
2. equivalence and transformation;
3. covariation;
4. spatial invariance;
5. chance and sampling.

### Three executable reference contracts

The overlay includes complete logic models for:

- `baseTenExchange`: exchanges, regrouping, place-value synchronization, strategy classification, and fading;
- `fractionEquivalence`: repartitioning, value invariance, diagram/number-line/symbolic synchronization, and fading;
- `ratioCovariation`: table/double-number-line/graph/equation synchronization, proportionality violations, and additive-versus-multiplicative misconception detection.

These are reference kernels, not new registry widget names. Existing widgets should become views over the contracts.

### K–8 audit and lint tools

- `scripts/cml-audit.mjs` measures response-only, supporting, direct-manipulation, and strongly causal use by lesson and grade.
- `scripts/cml-lint.mjs` flags prediction without manipulation, response-dominant flagship lessons, missing invariants, no revision, no fading, and no transfer evidence.

The engine sets are transparent in the scripts and should be reconciled with the live capability registry during integration.

### Eighteen pilot sequences

`content/cml/pilot-manifest.json` specifies 18 load-bearing pilots across K–2, Grades 3–5, and Grades 6–8. They cover place-value exchange, fraction equivalence/scaling, multiplication decomposition, decimal regrouping, ratio covariation, equations, functions, systems, sampling, bivariate data, coordinate transformations, and geometry invariants.

## What this overlay deliberately does not claim

The Session 87 application archive was not present in the mounted workspace. Therefore this package does not pretend that the following integration work has already occurred:

- `schema.ts` has not yet been patched to accept CML metadata;
- `widgets.tsx` has not yet been wired to emit the new semantic event contract;
- `LessonPlayer` has not yet been wired to instantiate runtimes, preserve ghost traces, or persist CML evidence;
- existing K–8 lesson JSON has not been rewritten;
- the full application test/build gates have not been run.

The included source itself compiles under strict TypeScript and passes its standalone runtime self-test.

## Verification performed

```bash
tsc -p tsconfig.cml.json
node .cml-build/tests/cml-selftest.js
```

The test covers:

- valid state transition;
- invariant preservation;
- prediction comparison;
- undo and redo;
- adaptation escalation;
- delayed, multi-representation transfer evidence;
- a complete valid CML authoring sequence.

## Recommended first integrated release

Integrate the foundation with three vertical pilots before changing hundreds of lessons:

1. place-value exchange (`baseTenCompose`, `mixedRegroup`, `columnCalc`);
2. fraction equivalence/scaling (`fractionBar`, `fractionGrid`, `numberLine` view);
3. ratio/function covariation (`ratioTable`, `doubleNumberLine`, `lineExplore`).

These three pilots exercise the highest-value architecture: canonical state, synchronized representations, strategy diagnosis, counterfactual experimentation, revision, fading, and transfer.
