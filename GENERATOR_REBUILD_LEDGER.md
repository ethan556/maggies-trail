# GENERATOR REBUILD LEDGER — S242

**Source seal:** `b1a8e79` · Evidence: `reports/generator-audit/*.csv`, produced by
`scripts/audit/generator-quality-sweep.mts` over 102,251 generated problems.

Packets are ordered by the plan's priority formula — learner exposure × reuse count × defect
severity × conceptual importance × generator reach — with the root-cause multiplier applied. **No
packet here patches sampled output.** Each names the generator, formatter or primitive to repair.

Status vocabulary: `LANDED` (fixed at this seal, fixtures in place) · `OPEN` (specified, not
implemented) · `DEFERRED` (evidence recorded, work belongs to a later wave).

---

## LANDED at this seal

### GRB-00 — four tokenizer defects, all found by generating and none visible in source

`src/lib/math/authoredMath.ts`; fixtures in `src/lib/math/authoredMath.wordBoundary.s242.test.ts`.

| # | Defect | Shape | Effect on the learner |
|---|---|---|---|
| a | Exponent class held ASCII `-` but not U+2212 | `3^−4` | literal caret on the negative-exponent lesson |
| b | `\bsqrt` needs a word boundary; a digit gives none | `4sqrt(3)` | MCQ option labels raw on a simplify-the-radical question |
| c | The first fix's `\d*\s*` ate the preceding space | `" sqrt(4)"` | island carries whitespace, sentence re-flows |
| d | Fraction island stopped at the denominator | `1/6^3` | typeset ⅙ followed by a literal `^3` |

None of these shapes occurs in authored lesson JSON — they are built at runtime from drawn values —
so every previous audit, all of which read source, was structurally incapable of seeing them.

**Reverted deliberately:** adding a number-with-power branch to the arithmetic atom, which would
have absorbed `3 * 4^(4-1)` into one island. It also tore `a4 = 3 * 4^(4-1)` into `a` plus an
island, and broke two existing fixtures. The leak it targeted is GRB-01's, and it belongs in the
generator.

---

## OPEN — specified, not implemented

### GRB-01 — machine operators in generated prose · 63 rows · 19 generators

**Evidence:** `GENERATOR_MATH_PRESENTATION_AUDIT.csv`, codes `asterisk-multiplication` (48) and
`machine-inequality` (15).

Generators emit `3 * 4^(4-1)` and `x <= 5`. The asterisk survives tokenization on both surfaces and
reaches the screen beside typeset mathematics; `<=` renders as two characters where `≤` belongs.

**The repair is in the generator, not the formatter.** `·` and `≤` are what the corpus's authored
content already uses, and the formatter correctly declines to guess that `*` means multiplication —
in `2 * 3` it does, and the tokenizer handles that, but in `a4 = 3 * 4^(4-1)` the run cannot cross
the power without tearing the label in front of it.

**Hazard, and it is the reason this is a packet rather than a one-line fix.** Changing a prompt's
wording changes seeded output, and `variants.test.ts`'s `INDEPENDENT` routes recompute answers from
the *printed prompt* with per-form regexes that hardcode the old phrasing. CLAUDE.md is explicit:
re-run the gate immediately after any prompt change. Batch 5–10 generator families, run the full
variant gate between batches, and expect route regexes to need updating in the same commit.

**Acceptance:** those 63 rows go to zero; `npx vitest run src/lib/variants.test.ts` green; the
sweep re-run at the new seal shows no new `raw-caret` or `raw-sqrt` rows.

### GRB-02 — invented rounding in generated labels · 40 rows · `pf-quad-form` and neighbours

**Evidence:** `GENERATOR_CANONICAL_FORM_AUDIT.csv`, code `float-artifact-in-prose`.

`pf-quad-form__buildExpression` offers token labels `x = -2.236068` and `x = 2.236068`. No prompt in
that generator states a rounding convention, so the sixth decimal place is invented — CLAUDE.md
rule 6 exactly, and the rule exists because a trap printing `1.67` for 5÷3 diagnoses a mistake the
learner did not make.

**The repair:** either state a convention in the prompt, or — better for a quadratic-formula
generator — keep the exact surd form the lesson is teaching. This is a representation decision, so
it needs the pedagogy owner before implementation, not after.

**Acceptance:** zero `float-artifact-in-prose` rows; the chosen convention is stated in the prompt
text of every affected form; `verify.mts` shows generated matching authored.

### GRB-03 — feedback below the diagnostic floor · 25 rows · 17 generators

**Evidence:** `GENERATOR_LANGUAGE_AUDIT.csv`, code `feedback-too-terse`.

25 generated feedback strings are under 25 characters. The floor is not arbitrary: rule 3 requires
every distractor's feedback to name the misconception using the numbers actually drawn, and nothing
that short can. K–2 copy trips this floor naturally and the repo's own guidance is to prepend
framing words rather than to lower the floor.

**Acceptance:** zero rows; each rewritten string names what the learner did and why it fails.

---

## DEFERRED — recorded, owned by a later wave

### GRB-04 — 243 (generator, form) pairs whose entire pool fits inside a 10-draw window

**Evidence:** `GENERATOR_DUPLICATION_AUDIT.csv`, verdict `pool-below-window`. Smallest observed
pool is 4 distinct problems.

A learner practising ten times on one of these must see a repeat, and no anti-repeat queue can
prevent it. CLAUDE.md is clear that a genuinely constrained pool is not fixed by widening an axis —
the fix is a new *dimension*, preferably one the authored content already uses, or an honest
acceptance under rule 7 that the concept has few distinct problems.

**Owner:** Wave 6, per concept family. **Not** a mechanical widening pass.

### GRB-05 — no anti-repeat mechanism exists

`variantForStep(item, seed)` is seeded from the step and the date. Nothing keeps a queue of
recently-served variants and nothing consults one, so §10's "duplicate rate 0 inside the anti-repeat
window" has no mechanism to measure against. 1,801 pairs have pools wider than the window and would
be fully served by a queue.

**Owner:** GEN-04. This is an architecture packet, not a generator repair, and it should land before
GRB-04 — widening pools is much less valuable while independent seeding can still serve the same
problem twice in a row from a pool of 400.

### GRB-06 — 26 out-of-scale geometry values

**Evidence:** `GENERATOR_VISUAL_SYNC_AUDIT.csv`, code `out-of-scale-value`. All `medium`, none
`high`. Coordinates or dimensions above 1e6 in a drawn spec, which the viewBox cannot show at any
useful scale. Needs a per-engine reading before it is a defect: some are legitimately large
quantities in a spec field that is never drawn to scale.

**Owner:** VIS-02, with the object-bounding-box contract.

---

## Ordering, and why

GRB-00 landed first because it is a formatter repair: one fix, every generator downstream of it
improves, and it cannot be done by the generator packets. GRB-05 should precede GRB-04 for the same
reason — repair the shared mechanism before the individual pools. GRB-01 is the largest generator
packet and carries the gate-coupling hazard, so it goes after the pedagogy decision in GRB-02 is
made, not before: both touch prompt text, and one pass through the `INDEPENDENT` route regexes is
better than two.
