# ARCH-03 & ARCH-04 — ENGINEERING SPECIFICATION

**Status:** specification only. Both carry **Fable** as decision owner in the plan's register; this
document is the Opus-design half — it states the problem, the evidence, the options and the
decision points, and it does not choose. Nothing here is implemented.

**Source seal:** `3166224` · Evidence: `reports/generator-audit/`, `reports/math-presentation/`,
`GENERATOR_INVENTORY.json`.

---

# ARCH-03 — the canonical generated-state contract

> *"Question, visual, grader, and feedback can otherwise drift. One state derives all learner-visible
> and accessible representations."*

## What exists today

A generator returns `Variant { tag, widget, answer, params? }`. Three things are worth knowing
before designing on top of it:

**`params` already exists and is already the thing ARCH-03 describes.** Its comment says so
plainly: every engine upgrade written between S142 and S151 recovered the generator's numbers by
parsing the rendered prompt with a bespoke per-form regex — "the single largest cost and the largest
defect source in the conversion programme", with a mis-scoped capture silently producing ten wrong
answers in S153. `params` carries the values forward instead. It is optional, additive, and adopted
unevenly.

**The drift ARCH-03 exists to prevent was not observed.** The generated-side sweep ran 102,251
problems and found **zero** interaction-sync defects: no answer whose shape the widget cannot grade,
no `numeric` widget whose own `answer` field disagrees with the variant's, no plot target outside
its grid, no bucket answer naming an item the widget does not show. The `INDEPENDENT` dual-route
design in `variants.test.ts` is holding the line that ARCH-03 would formalise.

**What did drift is the derived text, not the state.** Every finding in
`GENERATOR_MATH_PRESENTATION_AUDIT.csv` and `GENERATOR_CANONICAL_FORM_AUDIT.csv` is a *string*
built from correct numbers — `x = -2.236068`, `3 * 4^(4-1)` — where the value is right and its
presentation is not. So the contract that would actually pay is not "one state derives the answer",
which already holds, but **"one state derives every learner-visible rendering of a number"**.

## The decision points

**D1 — Is `params` mandatory, and what is its type?**
Options: (a) leave optional, adopt per family as generators are touched; (b) make it required with
a per-generator declared shape; (c) make it required and *typed*, so a `Quantity` knows it is a
length in centimetres rather than a bare `number`.

The cost rises steeply from (a) to (c) and so does the payoff: only (c) can make the unit-notation
and decimal-policy indexes structurally impossible rather than merely audited.

**D2 — Does the contract cover the accessible representation?**
The plan's wording says "all learner-visible **and accessible** representations". Today
`describeState.ts` builds narration separately from the widget. Two sources for one truth is the
drift ARCH-03 names, and D-14 and D-23 in this session were both instances of it. Deciding yes
means narration is derived, not authored alongside.

**D3 — Where does rounding live?**
CLAUDE.md rule 6 says round once, at the end, to a convention the prompt states. If a `Quantity`
carries its own precision the rule becomes enforceable; if precision stays in the format string it
stays a review item forever. This is the decision that determines whether `GRB-02` is a one-time
repair or a recurring class.

**D4 — Versioning.** A generator's state shape changing must invalidate its cached samples and its
certification. Options: a version integer per generator, or a content hash of the state shape. The
hash needs no discipline and cannot be forgotten; the integer is readable in a diff.

## What a Sonnet packet would need

- The `Variant` type change, with `params` required or not per D1.
- A migration order: shared-primitive generators first, then the 74 tier-500 generators, then the
  rest, in batches of 5–10 families as §9 requires.
- `variants.test.ts` gains an assertion that every learner-visible number in the widget is
  reachable from `params` — this is the assertion that makes the contract real rather than
  declared.
- The gate coupling hazard from `GRB-01` applies here too: `INDEPENDENT` routes parse the printed
  prompt, so any prompt-shape change breaks route regexes in the same commit.

---

# ARCH-04 — generator diversity, misconception and difficulty contracts

> *"Numerical variation alone can masquerade as curriculum variety. Allowed variation and learning
> invariants are versioned per family."*

## What the evidence says

**Misconception quality is unmeasured, and the structural half is perfect.** Zero distractor defects
in 102,251 problems: no trap colliding with its answer, no trap colliding with another trap, every
distractor carrying feedback over the diagnostic floor bar 25 exceptions. But *structurally valid*
is not *pedagogically real*. Nothing in the repository tests whether a trap is a mistake a learner
actually makes, and nothing can — that is the judgement ARCH-04 is for.

**Diversity is measurable and partially measured.** The freshness ceiling is now known per
(generator, form): 243 pairs whose whole pool fits inside a ten-draw window, smallest 4 distinct
problems, zero generators emitting one widget forever. The number that is *not* known is whether a
pool's variation is meaningful — thirty problems that differ only in their operands are one problem
thirty times, and no current measure can tell that from thirty genuinely different problems.

**There is no anti-repeat mechanism.** `variantForStep(item, seed)` is seeded from step and date;
nothing keeps a queue of served variants. §10's "duplicate rate 0 inside the anti-repeat window" has
no mechanism to measure against, which is why the QA rubric instructs assessors not to certify that
line yet.

**Difficulty exists as `Band` and is explicitly surface-only.** The `VariantGen` comment is emphatic:
band "scales SURFACE difficulty only — number size, benchmark familiarity — never the concept, never
the trap semantics: every band's parameters pass the same rejection gate". That is a deliberate
design decision that ARCH-04 either ratifies or overturns, and it should be named as such rather
than quietly extended.

## The decision points

**D5 — What counts as a meaningful dimension?**
CLAUDE.md already answers this for freshness failures — "fix with a new DIMENSION, not a wider axis…
add a second dimension, preferably one the authored content already uses (a second context, a second
phrasing, a different item count)". ARCH-04 needs that promoted from advice to a declared, versioned
list per family, so a generator can state which dimensions it varies and be checked against it.

**D6 — Does band stay surface-only?**
If yes, difficulty contracts are about *form* selection, not band. If no, the rejection-gate
invariant ("every band's parameters pass the same gate") has to be replaced with something weaker,
and every existing generator's band behaviour becomes a migration.

**D7 — Anti-repeat: where does the queue live?**
Options: (a) client-side, in the learner's local state; (b) server-side, in the skill record that
already tracks `lastSeen`; (c) in the seed itself, by mixing an attempt counter into it. Option (c)
is the smallest change and needs no storage, but it only spreads draws — it cannot *guarantee*
non-repetition. (b) can guarantee it and costs a write per attempt.

**D8 — Is a misconception taxonomy shared across generators?**
Today each generator names its own traps in prose. The CML metadata already carries
`cml.misconceptions` as stable identifiers on authored steps (`all-roots-of-squared-equation-valid`,
`every-root-flips-sign`). Deciding to share one taxonomy between authored CML metadata and generator
traps would make "which misconceptions does this learner hold" answerable across both paths. That is
the single highest-value item in this document, and it is also the largest.

## Ordering

`ARCH-04 D7` (anti-repeat) should land before `GRB-04` (243 small pools). Widening pools is much
less valuable while independent seeding can serve the same problem twice in a row from a pool of
four hundred. `ARCH-03 D3` (rounding) should land before `GRB-02`, so the rounding repair is done
once against a contract rather than twice against a habit.

## What neither of these is

Neither contract makes a generated problem *good*. They make it consistent, reproducible and
diagnosable. Whether a problem teaches the right thing at the right moment is Wave 5's question,
with a pedagogy owner in the loop per family, and no schema decided here will answer it.
