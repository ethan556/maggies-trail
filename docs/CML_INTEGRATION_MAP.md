# CML integration map for the current Maggie’s Trail app

This is the required merge sequence after the current application archive is available.

## 1. Schema: add CML metadata without breaking existing lessons

**Target:** `src/lib/schema.ts`

Add an optional `cml` object to the shared lesson-step schema rather than duplicating it in every widget schema. The object should support:

- `stage`;
- `flagship`;
- `predictionId`;
- `invariants`;
- `misconceptions`;
- `translationFrom` / `translationTo`;
- `revisionOf`;
- `fadeLevel`;
- `transferFamily`;
- `delayed`.

Existing content must remain valid when `cml` is absent. New pilot flagship lessons should require it through the pedagogy linter, not through a global schema hard requirement.

## 2. Widget boundary: emit mathematical actions, not pointer noise

**Target:** `src/components/widgets.tsx` and common widget props

Add a shared optional callback such as:

```ts
onProcessEvent?: (event: ProcessEvent<unknown, unknown>) => void
```

Do not emit `pointermove`, pixel coordinates, or raw DOM events as learning evidence. Each flagship widget maps UI gestures to semantic actions such as:

- `exchange-ten-ones-up`;
- `repartition-by-3`;
- `add-to-both-sides`;
- `translate-by-vector`;
- `scale-ratio-pair`;
- `draw-sample`.

The CML contract owns the canonical state and mathematical truth. React owns rendering and accessibility.

## 3. LessonPlayer: one runtime per active flagship step

**Target:** the existing `LessonPlayer`

For a CML-enabled step:

1. resolve the engine contract;
2. instantiate `createCausalRuntime()` from the generated widget state;
3. commit the learner prediction before enabling construction when the step requires prediction;
4. route semantic widget actions through `dispatch()`;
5. render synchronized representation adapters from `mathematicalSnapshot()`;
6. call `decideAdaptiveRung()` after meaningful actions;
7. preserve the first attempt as a ghost/replay when revision starts;
8. append evidence only when the declared evidence condition is met.

Do not treat every drag as evidence. Record semantically distinct actions and final stage evidence.

## 4. Existing evaluator remains authoritative for answer acceptance

**Targets:** `src/lib/evaluate.ts`, existing generator/evaluator pipeline

The CML runtime supplements rather than replaces the production evaluator:

- evaluator: “Is this submitted state mathematically accepted?”
- CML process trace: “How did the learner reach it, what strategy did it reveal, and what should happen next?”

A correct accepted state may still produce fragile strategy evidence. An incorrect state may produce valuable misconception evidence.

## 5. Pedagogy linter: add CML flagship rules

**Target:** `src/lib/pedagogy.ts` and/or current lint scripts

Make these release-blocking for lessons declared `cml.flagship`:

- no response-only centerpiece;
- prediction followed by direct manipulation;
- machine-readable invariant;
- at least one revision/repair opportunity;
- at least one required representation translation;
- a fading path to symbolic independence;
- a transfer family;
- retrieval evidence distinct from immediate lesson completion.

Run the included advisory linter before making it blocking. Reconcile false positives against the live content schema.

## 6. Progress and mastery persistence

**Targets:** `src/lib/progress.ts`, `src/lib/mastery.ts`, and lesson completion persistence

Persist only compact evidence summaries and diagnostically useful process information:

- semantic strategy tags;
- misconception tags;
- independent/support level;
- representation;
- confidence;
- transfer/delay flags;
- response time;
- replay trace only for the active or most recent revision, unless analytics requirements justify longer storage.

Use the existing mastery ladder rather than introducing a competing completion state. Map CML evidence into exposed, practiced, mastered, retained, and transferable.

## 7. Representation mesh UI

Create a reusable shell that can show two or three coordinated views without overwhelming the screen:

- one primary manipulable view;
- one consequential view;
- one symbolic or linguistic view.

On mobile, use progressive disclosure rather than shrinking all representations into a dense grid. Keep 44-pixel targets, keyboard parity, reduced-motion behavior, and stable layouts.

A synchronized view is not enough. At least one step in the sequence must require the learner to translate manually between views.

## 8. First engine integrations

### Place value

Use `createBaseTenExchangeContract()` behind `baseTenCompose`, `mixedRegroup`, and `columnCalc`.

Required visible consequences:

- blocks;
- place-value chart;
- expanded form;
- numeral;
- written algorithm exchange mark.

Required strategy distinctions:

- efficient exchange;
- counting by ones;
- illegal exchange without ten;
- missed exchange.

### Fraction equivalence and scaling

Use `createFractionEquivalenceContract()` behind `fractionBar` and `fractionGrid`, with a number-line adapter.

Required learner actions:

- repartition the same whole;
- predict the equivalent numerator/denominator;
- create a near-miss that changes magnitude;
- explain why the point did or did not move.

### Ratio and functions

Use `createRatioCovariationContract()` behind `ratioTable`, `doubleNumberLine`, and `lineExplore`.

Required learner actions:

- scale both quantities;
- change only one quantity as a counterfactual;
- diagnose additive thinking;
- translate among table, aligned number lines, graph, equation, and context.

## 9. Release gates

Run the current application gates plus:

```bash
npm run cml:audit
npm run cml:lint
npm run cml:selftest
```

After pilot metadata is complete:

```bash
npm run cml:lint:strict
```

Add pilot-specific tests that verify:

- every semantic action is keyboard-accessible;
- all constraints are reachable and narratable;
- invariants hold for legal transformations;
- each misconception signature is reachable;
- the adaptive ladder does not loop indefinitely;
- faded states remain solvable;
- transfer tasks do not leak the original representation;
- existing generated variants and evaluators remain deterministic.

## 10. Scaling rule

Do not convert lessons by replacing every MCQ with drag-and-drop. Scale only after a pilot demonstrates better delayed transfer or misconception repair. Then convert by curricular strand, using the five kernels and shared contracts rather than creating lesson-specific widget logic.
