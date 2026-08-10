# S205K — content-change ledger

**No authored lesson content was changed.** Zero conversions, zero insertions, zero edits — the
hash proof over all 1,701 authored lessons is unchanged. Everything in this session is engine and
instrument work; the step-mix moved because 310 existing steps' ENGINE genuinely gained a
manipulation surface, not because any lesson was touched.

## ENGINE — exactNumberLab gains the magnitude rail (numeric answerMode)

The candidate answer becomes a thing the learner **drags** along a number line where the
quantities they have derived — the REVEALED stages, and only those — sit as labelled landmarks.
Placing the answer is now a spatial act against the learner's own derivation. The typed input
remains as a second view of the exact same state: one value, two surfaces.

**Leak audit, structural:** the rail reads `v.numeric` and revealed stage strings. It never
renders anything derived from `truth.answerNumber` (its only read of the truth feeds the same
invisible toward/away telemetry the typed input has always emitted), unrevealed stages contribute
nothing, and the domain grows from landmarks + the candidate itself — its bounds encode nothing
about the answer.

**Verified as a per-TYPE claim must be** (`exactNumberRail.s205k.test.tsx`, 33 tests):
- presence + drag-writes-state for **every numeric task the corpus uses** (24, enumerated from the
  corpus at test time so new tasks join the suite automatically);
- one-state-two-surfaces coherence (rail and input write/read the same field);
- no landmarks before any reveal; one reveal → at most one landmark;
- the pre-reveal rail's rendered numbers exclude the answer;
- choice-mode steps render **no** rail (no capability claimed where none was verified).

**Failure-first, both probes bite:** leaking the answer as a landmark → 3 failures; forking the
surfaces (rail writes a different field) → 27 failures; restore → 33/33.

## INSTRUMENTS — capability ratings gain per-answerMode granularity

`engine-capabilities.json`: exactNumberLab gets `manipByAnswerMode: {numeric: 2, choice: 1,
relation: 1, explore: 1}`. **The type-level manip stays 1 as the floor**, so any reader unaware of
the new field under-counts rather than over-counts. This is the structural fix the
slider/balanceScale drift called for: stop forcing one claim across modes that genuinely differ.
choice (22 steps) and relation (3) stay truthfully at 1 — nobody verified a surface there.

Mode-aware readers, all three now agreeing: `step-mix.mjs`, `flagship-tier.mjs` (lesson manip
dimension is now the max over STEP-level ratings), `insertion-candidates.mjs` (banner + counts).

## Metrics

**HS rich mix 15.2% → 23.7%** (860 of 3,625 answerable). Gap to ≥25%: **357 → 47**.
K-8 moved too, for the same honest reason (3-5: 26.0→26.2 · 6-8: 28.5→29.2).
Tier census **A 1182 · B 458 · C 60 · D 1** (was A 1178 · B 432 · C 90 · D 1) — lessons whose only
manip deficit was exactNumberLab's answer surface rose with it.

The remaining 47: buildExpression carries 144 HS semi steps; one genuine upgrade of that engine
overshoots the target. Not claimed tonight because not built tonight.
