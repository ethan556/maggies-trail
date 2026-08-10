# Variant Batch Compiler Workflow

Session 84 replaces the old session-by-session gap-filling pattern with a manifest-driven compiler and a reusable verification pipeline.

## Why the old workflow stopped scaling

Sessions 74–83 proved the generator architecture, but each batch still repeated the same expensive work:

1. Re-scan course files and manually recount runtime gaps.
2. Hand-map each lesson step to a generator/form pair.
3. Copy and rename focused, evaluator, route, coverage, semantic-diff, and registry scripts.
4. Re-enter target metadata in several places, creating count and naming drift.
5. Depend on a previous archive to prove authored lesson content was untouched.
6. Discover missing independent routes or surface mismatches late in the release cycle.

That process was safe but linear. Grade 4 contained 219 gaps, enough to make copied session scripts the dominant cost rather than the mathematics.

## The new five-stage pipeline

### 1. Discover

```bash
node scripts/variant-batch/discover.cjs --grade 4 --out scripts/variant-batch/session84-grade4.discovery.json
```

The discovery pass evaluates the real runtime resolver, not declaration presence. It reports:

- served and unserved assessment steps by course;
- every exact gap target;
- grouped selector keys in the form `course|conceptTag|surface`;
- representative prompts for each group.

A `--root <checkout>` option allows discovery against a prior clean archive without changing the current tree.

### 2. Plan

The plan is the only hand-authored routing manifest:

```text
scripts/variant-batch/session84-grade4.plan.json
```

Each selector maps one discovered concept/surface group to one generator/form contract. The plan also declares the intended courses, expected gap count, grade, release ID, and independent-solution module.

The compiler rejects:

- an unrecognized runtime gap;
- an unused selector;
- a target that already has an unusable declaration;
- a final target count different from the plan.

### 3. Compile and lock

```bash
node scripts/variant-batch/compile.cjs scripts/variant-batch/session84-grade4.plan.json
```

The compiler:

- skips every assessment already served at runtime;
- adds declarations only to true gaps;
- preserves each authored widget surface;
- writes the changed lesson JSON;
- creates an immutable lock containing every course, lesson, step, concept, surface, generator, form, and authored-content SHA-256.

The lock makes later verification independent of memory or manual target lists. A changed prompt, answer, explanation, figure, widget specification, or other authored field invalidates the hash.

### 4. Verify from the lock

```bash
node scripts/variant-batch/verify.cjs scripts/variant-batch/session84-grade4.plan.json
```

The generic verifier derives its entire target matrix from the lock and automatically performs:

- deterministic cross-band generation;
- surface preservation;
- answer/trap and trap/trap collision checks;
- language and feedback audits;
- prompt-derived independent recomputation;
- production evaluator checks for correct answers and every diagnostic;
- course, grade, and whole-catalogue runtime coverage;
- machine-readable metrics output.

Independent routes live outside the generators. For Grade 4 they are in `src/lib/g4Independent.cjs`, so generator and verifier cannot silently agree through shared answer logic.

### 5. Global and release verification

```bash
node scripts/variant-batch/whole-registry.cjs session84-grade4-all
node scripts/variant-batch/compare-baseline.cjs <session-83-root> scripts/variant-batch/session84-grade4.plan.json
node scripts/measure/session83-repo-gates.cjs
node scripts/measure/session83-typescript-gates.cjs
node scripts/native-integrity.mjs
node scripts/check-registration.mjs
```

The whole-registry gate protects unrelated generators against newly exposed seeds. The optional baseline comparison proves that target lesson files differ only by locked declaration additions and that no non-target declaration moved.

## Session 84 scale result

The new pipeline converted a grade-wide problem into one reproducible batch:

- 5 courses;
- 69 lesson files;
- 219 true runtime gaps;
- 97 concept/surface contracts;
- 5 reusable generator families;
- 1 plan, 1 lock, 1 metrics file;
- zero authored-content changes.

The lock replaces 219 manually maintained target records. The generic verifier replaces the recurring family of session-numbered focused, route, evaluator, coverage, and semantic-contract scripts.

## Rule for future batches

A future grade or course batch should add only:

1. a discovery report;
2. a plan mapping discovered groups to generator forms;
3. the mathematical generator/forms;
4. an independent prompt-derived solver module when the existing module cannot cover them.

The compiler, lock, focused verifier, evaluator loop, coverage calculation, registry audit, and baseline comparison remain unchanged.

## Session 85 extension: learner-action adapters

Grade 0 proved that a batch compiler cannot stop at typed-answer surfaces. Early mathematics stores
meaning in visible arrangements and learner actions: a flashed dot group, a hop path, an ordered row,
a selected picture, a partially filled frame, linked shape pieces, or bars that must first share a
baseline.

The generic verifier now has a learner-action adapter layer. For each supported manipulative it:

1. serializes only state visible to the learner;
2. sends that state and the printed prompt to an independent solver outside the generator;
3. reconstructs the mathematical target as labels, values, order, links, or selected groups;
4. maps that meaning back to widget IDs only after the independent result is known;
5. submits correct and misconception states through the production evaluator;
6. confirms every diagnostic is reachable and no accepted state carries an error diagnosis.

The first adapter set covers `subitizeFlash`, `numberLineHop`, `dragOrder`, `tapDiagram`, `tenFrame`,
`matchPairs`, and `lengthCompare`, including its align-before-pick mode. This layer is generic and can
be reused by Grade 1, Grade 2, or any later batch using the same widgets; future plans do not need
session-specific evaluator scripts for these surfaces.

Session 85 scale result:

- 2 courses;
- 22 lesson files;
- 56 true runtime gaps;
- 33 concept/surface contracts;
- 2 reusable generator families;
- 8 preserved authored surface types;
- zero authored-content changes.

## Session 86 extension: whole-grade manipulative compliance

Grade 1 adds a second verification layer beyond locked new targets. A grade-wide manipulative audit now walks every assessment step in the selected grade, including steps already served before the batch, and verifies each learner action from visible state through the production evaluator.

The Grade-1 compliance set covers `numberLineHop`, `dragOrder`, `baseTenCompose`, `fractionBar`, `lengthCompare`, `clockSet`, and `placeCompare`. This prevents a grade from being declared complete when its new numeric/MCQ gaps pass but an older interactive surface still has incorrect truth, unreachable diagnostics, an invalid starting state, or a mismatch between the visible task and evaluator contract.

For future early-grade batches, completion therefore requires two independent green layers:

1. the lock-driven compiler verifier for every newly compiled target; and
2. the whole-grade manipulative compliance audit for every authored interactive assessment, whether newly generated or previously served.

## Session 87 extension: parity, constrained money, and token-sequence contracts

Grade 2 adds three learner-action types whose mathematical truth cannot be reduced safely to a stored
scalar answer:

- `oddEvenPairs` represents parity through complete pairs and a possible singleton;
- `moneyBoard` can require both an exact monetary total and compliance with allowed-denomination or
  coin-count constraints;
- `buildExpression` can represent number words through an ordered visible token sequence whose IDs are
  implementation details rather than mathematical meaning.

The generic verifier now serializes these learner-visible states, asks the independent Grade-2 solver
to reconstruct the required grouping, coin construction, or token labels, maps the result back to
widget IDs only after the independent answer is known, and submits both correct and misconception
states through the production evaluator.

The Grade-2 whole-grade compliance layer audits all 36 authored interactive assessments, including
previously served tasks. Grade completion therefore requires both the 161-target compiler lock and a
separate all-manipulatives pass over parity pairing, lengths, money, clocks, token building, place
comparison, shape selection, and fraction partitions.

Session 87 scale result:

- 4 courses;
- 52 lesson files;
- 161 true runtime gaps;
- 68 concept/surface contracts;
- 4 reusable generator families;
- 8 preserved authored surface types;
- 36 whole-grade manipulative assessments;
- zero authored-content changes.
