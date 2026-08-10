# Maggie's Trail — S143–144 adversarial review of S141–142

## Sessions 143–144 — adversarial verification of S141–142 (and recovery of a lost repair)

**Root cause of a total typecheck collapse: one line.** S142 chained `.superRefine()` onto
`ConditionalTableLabSpec` before placing it in `z.discriminatedUnion`. Zod requires plain
`ZodObject` members; the wrapped member became `ZodEffects`, which collapsed the inferred type of
the **entire ~115-member `TWidget` union** to a generic fallback. Every consumer in the codebase
failed at once — thousands of errors from a single incompatible member. Removing the wrapper and
relocating its validation into `widgetIntegrityErrors` (the mechanism every other widget type
already uses for cross-field checks) took the count from thousands to 13.

**The tar was cut from a snapshot predating the S141–142 repair.** Verified by content comparison
against the last green tree, not assumed. Roughly twenty fixes had regressed and were reapplied:
`RevealGhost`→`GhostChip`; the `sh-ghost` testid collision; the signed-fraction `unreduced` math
bug and its type widening; four closure-narrowing test fixes; `angleMeasure`'s `commonAngles`
wiring; the whole `cgParallelogramTrapezoid` collision fix (7 coordinated edits incl. one content
string); missing `INDEPENDENT` and `GENERATOR_BAND` registrations; five `learnerAnswerText` cases;
`shapeHierarchyLab`'s `canCheck`; narration length; the `triangleClosureLab` aria collision; the
`compositeAreaLab` wording; four render-query fixes; six keyboard gate tests; four `gateOne`
branches. **Largest of all: the `pr-04-02`/`percentChangeLab` generator rewrite had reverted to
emitting `numeric` widgets, leaving that whole lesson broken for variant generation.**

**Genuinely new defects in S141/S142's own work:** `EquationOutcomeLabW` referenced an undefined
`optionClass`; `pedagogy.ts`'s `widgetWrongPaths` had a stub returning a string where an array is
required; two test files imported a non-existent default export; `conditionalTableLab` had no
`gateOne` branch and `equationOutcomeLab` no keyboard gate test; `percentChangeLab` had never had
a `gateOne` branch at all, because no generator successfully produced it until this repair.

**Two `GR:1` failures were staleness detectors doing their job**, not bugs. Each audit hashes its
generator source against a recorded sweep; the legitimate math fixes correctly invalidated them.
Sweeps were **re-executed**, never the checks weakened: signed-fraction **4,608/4,608**,
conditional-table **9,216/9,216** across all six metrics.

**Five errors of my own, each caught by running rather than reading:** a bare prompt passed where
the compound `prompt||labels` format was required; a numeric return assumed where two form-parsers
return a label string; two lines dropped in an edit (caught by re-reading the result); `min-h-14`
assumed wrong for `shapeHierarchyLab` when its two-line buttons genuinely need it; a
`correctAnswerText` match briefly misattributed to `learnerAnswerText`.

**Gates at close:** tsc 0 · vitest **10,339/10,339 (188 files)** · validate:content 1223/1223 ·
lint:pedagogy 1139/1139 · check-registration consistent · **gen:reports GR:0 (all 19 stages)** ·
**build exit 0** · **Playwright 71/71 (PWEXIT:0)**.

**Tiers: A 608 · B 224 · C 273 · D 24.** Registry 116 (110 manipulatives). K–8 queue 41.

**Content-change ledger:** one file, one string — `cg-04-02.json`'s `variant.form`
(`cgParallelogramTrapezoid` → `cgParallelogramTrapezoidVerdict`), forced by the S140 name
collision and verified byte-identical elsewhere by an abort-before-write assertion. No other
authored lesson content was changed by this repair session.


---

# Hazards recorded

## S143–144 — hazards from repairing S141–142
1. **Never chain `.refine()`/`.superRefine()` onto a discriminated-union member.** It yields
   `ZodEffects`, not `ZodObject`, and collapses the WHOLE union's inferred type — breaking every
   consumer repo-wide from one line. Cross-field validation belongs in `widgetIntegrityErrors`.
2. **Verify the branch point before starting.** Diff a handful of known-fixed strings against the
   last green tree; a tar cut from a stale snapshot silently reverts completed work, and the only
   signal is tests that "should already pass" failing again.
3. **A source-hash audit failure means regenerate the artifact, not edit the check.** Those
   detectors exist precisely to catch a generator changing without its sweep being re-executed.
4. **A new widget type has eight surfaces**, several of which fail silently: `evaluate`,
   `canCheck`, `correctAnswerText`, `learnerAnswerText`, `gateOne`, the keyboard gate,
   `INDEPENDENT`, and `GENERATOR_BAND`.
5. **Independent-check parsers return two honest shapes** — a numeric value or the winning
   label — and some require the compound `prompt||labels` argument. Read the specific parser
   before calling `check()` from a new gate branch.
6. **Background long chains with `nohup setsid`, not `setsid` alone.** A plain `setsid` process
   died silently at a turn boundary mid-pipeline.
