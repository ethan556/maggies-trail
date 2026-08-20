# S317 Lane A — Figure Truth Fixes (fractions ch4 + conditional-probability P0s)

Worker: Claude Cowork implementation (sole owner `src/components/figures.tsx` this round).
Obeyed `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte: repository source is
authoritative; source-matched contracts (`S317_LANEB_FRACTIONS_ASSESSMENT.md`,
`S317_LANEB_CONDITIONAL_PROBABILITY_ASSESSMENT.md`) are the binding evidence for this packet.

Scope: `src/components/figures.tsx` (additive only), figure-ID registration
(`src/components/figureIds.ts`, regenerated — never hand-edited), the 5 named lesson JSONs
(`fr-04-01`, `fr-04-02`, `fr-04-04`, `cpr-03-03`, `cpr-05-01`), the new test file
`src/components/s317Figures.test.tsx`, this report, and
`reports/closure/cowork-staging/laneA-s317-figures.jsonl`. `fr-04-03` was read-only (its own
figure bindings are untouched and re-verified). `src/lib/figureTextMismatchBlocklist.manualHolds.ts`
and `.generated.ts` were **not edited** — see fix 4's open follow-up.

## Fix 1 — fractions / fr-04-01 (`c1`, `frac-compare-same-denom`)

**Resolution: NEW FIGURE** (parameterized, additive; prose and `k1` untouched).

`k1`'s `fractionCompare` widget is built specifically around 3/8 vs 5/8 ("The cake showdown"),
so the lesson's checks *do* depend on the exact numbers `c1`'s prose states — the "align prose to
the figure's 2/5 vs 3/5" branch of the decision rule does not apply. Built a new, additive,
typed-props helper `FracCompareSameDenomExample({ den, leftNum, rightNum, objectLabel })` in
`src/components/figures.tsx`, and a zero-arg wrapper `FracCompareSameDenomCake()` =
`<FracCompareSameDenomExample den={8} leftNum={3} rightNum={5} objectLabel="one cake" />`,
registered under a new figure ID `frac-compare-same-denom-cake`. `c1`'s `figure` key was rebound
to the new ID. The original `FracCompareSameDenom` component and the `frac-compare-same-denom`
figure ID are untouched — `c2` (generic, asserts no specific numbers) still binds them.

House style followed: `role="img"`, `<title>` states the exact worked relationship
("Same denominator: 5/8 has more shaded pieces than 3/8."), `aria-label` gives a full accessible
description naming both fractions, and the "more shaded pieces wins" cue is carried by a printed
label (`5/8 > 3/8`), not colour alone.

## Fix 2 — fractions / fr-04-02 (`c1`, `frac-compare-same-numer`)

**Resolution: NEW FIGURE** (parameterized, additive; prose and `k1` untouched).

Same reasoning: `k1`'s `fractionCompare` widget is built around 2/3 vs 2/8 ("The pan showdown"),
and `i1`/`i2` build out several other "bigger pieces" pairs, so rewriting the prose to 1/3 vs 1/4
(fr-04-03's pair) would have been the larger, riskier edit the assessment explicitly warned
against. Built `FracCompareSameNumerExample({ num, leftDen, rightDen, objectLabel })` and a
zero-arg wrapper `FracCompareSameNumerBrownies()` = `num=2, leftDen=3, rightDen=8`, registered as
`frac-compare-same-numer-brownies`. `c1` rebound to the new ID. `frac-compare-same-numer` (the
figure fr-04-03 was built for) is untouched — fr-04-03's own `c1`/`c2` and fr-04-02's `c2`
(generic) still bind it, unchanged.

## Fix 3 — fractions / fr-04-04 (`c1`, `frac-compare-wholes`) + `rem-sw-k` length-leak

**Resolution: ALIGNED PROSE TO FIGURE** (smaller diff; the figure *is* the lesson's actual point).

Read the whole lesson before deciding. `i1` (half of an 8cm cookie vs half of a 20cm cake) and
`k1` (Marta: "1/4 of my sticky note equals 1/4 of your poster?") both teach **the same fraction
name on two differently-sized wholes** — exactly what `frac-compare-wholes` renders (1/2 of a
small whole vs 1/2 of a big whole; "same name, different size!"). `c1`'s original example ("1/2 of
a blueberry... far less berry than 1/4 of a watermelon") instead named two *different* fractions
on two different objects, which conflates "the wholes don't match" with "the fraction names
differ" and is not the relationship the figure shows. Since the figure's same-fraction framing is
the cleanest illustration of this lesson's own established teaching pattern (matches `i1` and `k1`
exactly), reworded `c1`'s specific example to name the *same* fraction (1/2) on the blueberry and
the watermelon:

> "...1/2 of a blueberry is a tiny sliver, but 1/2 of a watermelon is a hefty slice, even though
> both are called 'one half.'..."

`c2`, `k1`–`k3`, `i1`, `i2`, `ch1`, `r1` and every widget/answer/feedback are byte-identical.

**`rem-sw-k` length-leak** (contract: correct option 43 chars vs longest distractor 27 chars, a
16-char gap): left the correct option ("Not fairly — the wholes are different sizes", still
`id: "a"`, still `correct: true`, feedback unchanged) untouched, and lengthened both distractors
truthfully without changing their meaning:
- `b`: "Yes — 1/2 beats 1/3" (19 chars) → "Yes — 1/2 is the bigger fraction, so it wins" (44 chars)
- `c`: "Yes — the barrel's 1/3 wins" (27 chars) → "Yes — the barrel's 1/3 is the bigger amount" (43 chars)

New spread: 1 char (was 16). Feedback text for `b`/`c` was left unchanged and still reads
correctly against the new labels (verified by inspection — the assessment's `b` explains why
"1/2 beats 1/3" as a bare fraction claim is wrong, which the lengthened label still is; `c`'s
feedback explains why the real-world truth isn't a valid fraction comparison, which the lengthened
label still asserts).

## Fix 4 — conditional-probability / cpr-03-03 P0 (`c1`, `cpr-multiplication-area`, WITHHELD_BLOCKLIST_FINGERPRINT)

**Resolution: REWORDED PROSE OFF THE STALE FINGERPRINT** (component and numbers unchanged).

Read `CprMultiplicationArea` (title: "Half its width is the bus riders, and two fifths of that
strip's height are the ones who play a sport... area 0.2 — the joint probability") and `c1`'s
original body ("Half the students ride the bus; 40% of those play a sport; so 0.5 × 0.4 = 0.20 do
both.") side by side: **the content already agrees exactly.** The withhold is not a live content
mismatch — it is a legacy blocklist fingerprint. Computed
`figureTextBindingKey("cpr-multiplication-area", <original c1 body>)` and got `0dc18745`, which is
present verbatim at `src/lib/figureTextMismatchBlocklist.generated.ts:16` and is carried forward
by a `CURRENT_MANUAL_HOLD` row in `src/lib/figureTextMismatchBlocklist.manualHolds.ts` whose own
`reason` field states: *"The candidate scan no longer emits a high-confidence token conflict, but
no independent... guard withholds this currently bound... figure"* — i.e. the manual hold itself
documents that current content is fine and the suppression is legacy containment, not a live
finding.

Per the assessment's option (b) ("reword `c1`'s body — preserving the exact relationship and
bus/sport-conditional-on-bus framing — so its hash no longer collides with the blocklisted
fingerprint"), made a minimal, truth-preserving paraphrase that keeps every number and the exact
worked relationship:

> "...to get **both**, first land in B, then land in A *inside the world where B already
> happened*. Half the students ride the bus, and 40% of those bus riders play a sport, so
> 0.5 × 0.4 = 0.20 of all students do both."

Recomputed the new binding key: `5d9a9fce`. Confirmed by exact string search that `5d9a9fce` is
**not** present anywhere in the 200-entry `FIGURE_TEXT_MISMATCH_BLOCKLIST` set, and confirmed
`isFigureTextAligned("cpr-multiplication-area", <new c1 body>)` returns `true` (see verify
section and `s317Figures.test.tsx`). The figure component, the figure ID, and the remedial
`rc1` (which reuses the same figure generically and was already `RENDERS`) are byte-identical.

**Did not run `UPDATE_FIGURE_TEXT_BLOCKLIST=1`.** Read
`src/components/figureTextAdversarialAudit.test.tsx` closely: that regeneration is explicitly
monotonic add-only —
`nextBlocklistKeys = [...new Set([...FIGURE_TEXT_MISMATCH_BLOCKLIST, ...blocklistCandidateKeys, ...currentManualHoldKeys])]`
— it unions the *existing* generated set with new candidates and current manual holds, and its own
comment states *"this is intentionally monotonic. A candidate proves a key must be added; it does
not prove that a prior containment decision may be removed."* Running it could not have dropped
`0dc18745` from the generated file regardless of what I did to the lesson text, so it would not
have cleared this withhold; the only way to clear it, given `manualHolds.ts` is out of this
packet's scope (owned separately from `figures.tsx`), was for the live (figureId, text) pair to
stop hashing to an already-blocklisted key, which the reword achieves.

**Open follow-up (explicitly out of scope for this packet):** after this fix,
`CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS`'s `0dc18745` row in
`src/lib/figureTextMismatchBlocklist.manualHolds.ts` (source: `cpr-03-03.json`, `steps.0`,
`cpr-multiplication-area`) no longer binds to any live lesson placement — no step now produces
that hash. `figureTextAdversarialAudit.test.tsx`'s own invariant (`bindings...toHaveLength(1)` for
every `CURRENT_MANUAL_HOLD`) will fail on that specific row until the blocklist owner prunes it in
a reviewed removal wave. This packet did not touch `manualHolds.ts` (not owned by
`figures.tsx`) and did not run that test file (outside the three permitted gate commands); flagging
it here as the next owner's action rather than silently reinterpreting authority.

## Fix 5 — conditional-probability / cpr-05-01 P0 (`c2`, `cpr-permutation-slots`, WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD)

**Resolution: TEXT NOW RESTATES THE FIGURE'S FIXED VALUES** (component and numbers unchanged).

`cpr-permutation-slots` is registered in the generated `src/lib/figureNumericClaims.generated.ts`
with claim *"The first can be filled 5 ways, the second 4 ways because one runner is already used,
and the third 3 ways, so there are 5 times 4 times 3 equals 60 podiums."* — so `isFigureTextAligned`
routes through `compareExactFigureNumericParity` whenever the adjacent text itself makes an
explicit numeric/symbolic claim. `c2`'s original body (`n!`, `nPk`, "n × (n−1) × … × 1") does
trigger `hasExplicitNumericOrSymbolicClaim` (via the literal `1`), so the guard fired. Recomputed
directly against the real module: original body → `figureAtoms=[5,4,3,60]`, `textAtoms=[1]`, zero
overlap, `aligned=false` — exactly the reported withhold.

Reworded `c2` to restate the figure's exact fixed values while preserving its generalization
purpose:

> "...**n!** — arrange **all** n items: n × (n−1) × … × 1. For the 5 runners lined up in full,
> that would be 5 × 4 × 3 × 2 × 1.
> **nPk** — fill only **k** slots from n items: n × (n−1) × … , k factors in total. Filling 3
> medal slots from those same 5 runners is the figure above: 5 × 4 × 3 = 60 podiums."

Re-verified against the real module: `isFigureTextAligned("cpr-permutation-slots", <new c2 body>)`
is now `true`. `c1` (already aligned), the remedial `rc1` (generic reuse), and every other step
are byte-identical. No component or figure ID changed.

## Verification — binding recomputation ("small node script")

Per the VERIFY instructions, the binding-key recomputation is implemented as vitest assertions in
`src/components/s317Figures.test.tsx` (imports the repo's own `figureTextAlignment.ts` and
`figureTextMismatchBlocklist.generated.ts` modules directly — same code path
`LessonPlayer.tsx`/`FigureView.tsx` gate rendering on) rather than an ad hoc script outside the
three permitted gate commands. It:

- Parse-checks all 6 touched/read lesson files (`fr-04-01/02/03/04`, `cpr-03-03`, `cpr-05-01`).
- Confirms both new figure IDs are registered in `FIGURES` and the synchronous `FIGURE_IDS` gate.
- Confirms the two new components' `<title>`/`aria-label` carry the lesson's real numbers, and
  that the two *original* shared exemplars (`frac-compare-same-denom`, `frac-compare-same-numer`)
  are byte-unmutated (still render fr-04-03's 2/5-vs-3/5 and 1/3-vs-1/4 content).
- Recomputes `isFigureTextAligned` for every touched (figureId, body) binding and asserts `true`
  (not withheld) in every case, plus the untouched `c2` bindings and fr-04-03's own bindings as a
  regression check.
- Recomputes `figureTextBindingKey("cpr-multiplication-area", cpr-03-03 c1 body)` and asserts it
  differs from `"0dc18745"` and is absent from `FIGURE_TEXT_MISMATCH_BLOCKLIST`, while asserting
  `"0dc18745"` itself is still present in the generated blocklist (proof nothing was hand-edited).
- Asserts `cpr-05-01/c2`'s body contains `5`, `4`, `3`, `60`, `n!`, and `nPk`.
- Asserts `rem-sw-k`'s correct option is unchanged and the option-label spread is ≤15 chars.

## Gate outputs

```
$ npx vitest run src/components/s317Figures.test.tsx
 Test Files  1 passed (1)
      Tests  28 passed (28)

$ node scripts/check-registration.mjs
registration: files ↔ course.json ↔ PLAN.md all consistent

$ npx tsc --noEmit
(no output — exit 0)
```

`src/components/figureIds.ts` was regenerated via `node scripts/gen-figure-ids.mjs` (the
documented generator for that file — never hand-edited) after adding the two new figure IDs to
`figures.tsx`, so the synchronous existence gate (`FIGURE_IDS.has(...)`, consumed by
`LessonPlayer.tsx`) recognizes them; without this step the two new figures would silently fail to
render (a "missing promised visual" defect the packet explicitly says to stop for).

## Changed files

- `src/components/figures.tsx` — additive: 2 new typed-props helper functions
  (`FracCompareSameDenomExample`, `FracCompareSameNumerExample`) + 2 new zero-arg wrapper
  components (`FracCompareSameDenomCake`, `FracCompareSameNumerBrownies`) + 2 new `FIGURES`
  map entries. No existing component body edited.
- `src/components/figureIds.ts` — regenerated (adds the 2 new IDs; otherwise identical set).
- `content/courses/fractions/lessons/fr-04-01.json` — `c1.figure` rebind only.
- `content/courses/fractions/lessons/fr-04-02.json` — `c1.figure` rebind only.
- `content/courses/fractions/lessons/fr-04-04.json` — `c1.body` example reworded;
  `remedials[0].check` (`rem-sw-k`) options `b`/`c` labels lengthened.
- `content/courses/conditional-probability/lessons/cpr-03-03.json` — `c1.body` reworded
  (numbers/relationship unchanged).
- `content/courses/conditional-probability/lessons/cpr-05-01.json` — `c2.body` reworded to
  restate the figure's fixed values.
- `src/components/s317Figures.test.tsx` — new test file (28 assertions).
- `reports/closure/S317_FIGURE_TRUTH_FIXES.md` — this report.
- `reports/closure/cowork-staging/laneA-s317-figures.jsonl` — 5 `lesson-fix` records.

## Untouched / explicitly out of scope

`fr-04-03.json` (read-only dependency, re-verified unchanged and still aligned). `src/lib/
figureTextMismatchBlocklist.generated.ts` and `.manualHolds.ts` (not hand-edited; see fix 4's open
follow-up for the one action a different-scoped worker still needs to take).
`figureTextAdversarialAudit.test.tsx` and the `UPDATE_FIGURE_TEXT_BLOCKLIST=1`/
`UPDATE_FIGURE_TEXT_AUDIT=1`/`UPDATE_PENDING_WORKLOAD_QUEUE=1` regeneration flows were not run
(outside the three permitted gate commands, and — per fix 4 — would not have changed the outcome
regardless). The other REVISE items in both source assessments (`fr-02-01`, `fr-02-04`,
`fr-03-01`, `cpr-03-01`, `cpr-04-01` length-leaks) are out of scope for this packet's five named
fixes and were not touched.
