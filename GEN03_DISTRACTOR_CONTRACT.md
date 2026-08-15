# GEN-03 — THE DISTRACTOR CONTRACT

**Evidence:** `reports/generator-audit/GENERATOR_DISTRACTOR_CONTRACT_AUDIT.csv`, from
`scripts/audit/distractor-contract.mts` · **Date:** 2026-08-15

CLAUDE.md rule 3: *"Every distractor is a computed real misconception whose feedback names it. Never
'try again' — say what the learner did and why it fails, using the numbers actually drawn."*

## The headline is a negative result, and it is the useful part

**Rule 3 is already met by the generated corpus.** 15,141 distractors across 2,037 (generator, form)
pairs; **100% carry feedback**, mean length 79 characters, 5,754 distinct feedback shapes. Zero use
any of the phrasings rule 3 bans by name.

That was not the expected answer, and it cost three detectors to establish. All three are recorded
in the audit's own header, because how they failed is the finding:

| Detector | Rows | Hand-checked | True |
|---|---:|---:|---:|
| `diagnosis-without-numbers` | 1,778 | 12 | **0** |
| `diagnosis-number-untraceable` | 1,320 | 12 | **0** |
| `no-error-reference-marker` | 1,549 | 30 | **0** |
| *(uniform-random control)* | — | 20 | **0** |

74 distractor feedback strings read by hand, no defects. A sample:

> `62.5 = v_y²/g` forgets the factor 2: `v_y²/(2g) = 625/20 = 31.25 m`.
> 12 is the HALF-diagonal (`√(169 − 25)`). Diagonals bisect each other — double it: 24.
> 30 is 6 × 5 — only the first two slots. 4 trophies still have to be placed.
> That counts each crossed group as one mark, but a crossed group holds FIVE marks.

Each names what the learner did, in their numbers. Rule 3's clause about numbers governs
misconceptions that *are* numeric — for a quadrant-sign or shape-classification error, quoting
numbers would make the diagnosis worse, and the first detector punished exactly that.

**Publishing 3,098 rows of this would have been the single most damaging thing in the program.** It
would have sent readers to inspect the best copy in the repository and find nothing wrong.

## What was actually wrong — 109 distractors, and a hidden collision under them

The one thing the census did find is small, precise and traceable to six lines of code.

**Eight templated fallbacks, 109 distractors (0.7%), 29 generators.** They read as diagnostic and are
not:

> That is 3 more than the requested value. Recount the visible quantities and operation.
> That result is 5 away from the correct value. Recompute the stated operation from the learner-visible numbers.
> This alternative does not preserve the displayed algebraic relationship.

These come from **padding helpers** — `safe()` in `g1Variants.ts:9`, `traps()` in `g2Variants.ts:9`,
`uniqueNums()` in `algebra2Variants.ts:23`, `g4Variants.ts:134`, and the `mcq()` helpers in
`algebra1Variants.ts:32` / `algebra2Variants.ts:25`. When a generator's real distractor list comes up
short, they manufacture one as `answer + d` and write feedback describing the padding.

A distractor that is `answer + 1` is not a misconception. Rule 3 wants a **computed real
misconception**; rule 7 says refusing to manufacture one is a success, not a failure.

### The visible half is fixed

**30 MCQ options reached learners labelled `Alternative 3`.** A learner solving `2^x = 16` was offered
`4`, `8`, `2`, and `Alternative 3`. Both `mcq()` padding helpers now emit a shorter option list
instead — a three-option item is a fine item; a four-option item with a giveaway is not.

**`Alternative N` options: 30 → 0.**

### And removing it surfaced a trap collision the padding had been hiding

The variant gate failed immediately on `a1-systems @ system-solution__mcq`: an MCQ with **one
option**.

The four options are `(x, y)`, `(y, x)`, `(-x, y)`, `(x, -y)`. At `x = 0` they collapse pairwise; at
`x = y = 0` all four become `(0, 0)`. One draw in 450 produced *"Which point solves y = -3x + 0 and
y = -2x + 0?"* — and it had been shipping as one real answer plus three filler options.

Guarded at the draw, as CLAUDE.md prescribes for collisions — `x ≠ 0`, `y ≠ 0`, `x ≠ y`, bounded
resample. **Option-count distribution across 450 draws: was {1: 1, 3: 99, 4: 350}, now {4: 450}.**
The 99 three-option draws were the same collision in its milder forms.

This is the argument for rule 7 in one example: the padding was not a convenience, it was a blindfold.

## What is NOT built, and what it would cost

**There is no per-distractor misconception identifier anywhere in this codebase.**

`cml.misconceptions` holds 644 distinct entries across 960 of 1,701 lessons, and they are authored
prose — *"Right-aligning digits instead of the points, treating a trailing zero as a change in value,
or losing count of the decimal places a product carries"* — three misconceptions in one sentence,
attached to a **lesson**, never to a distractor.

So nothing can currently check:

- that two distractors probing the same misconception agree about what it is;
- that a lesson's declared misconceptions are the ones its distractors actually test;
- that a remedial route addresses the misconception the learner's wrong answer revealed.

That last one is not hypothetical: `ADAPT01_STATE_GAPS.md` finds `adaptivePolicy.ts:79-98` consulting
misconception identity for the cue and scaffold rungs and then **dropping it at the remedial rung**,
which selects by `conceptTag`. The identifier this packet is missing is the thing that gap needs.

**Building it is authoring work, and it is stated rather than simulated.** The shape:

1. Split the 644 prose entries into atomic misconceptions with stable ids (est. 1,300–1,900 ids).
2. Add `misconception: "<id>"` to the distractor contract in `schema.ts` — optional at first.
3. A lint that ratchets: every generator that declares any distractor misconception must declare all
   of them, so coverage cannot regress while it grows.
4. Retrofit 15,141 generated distractors and the authored MCQ corpus.

Step 4 is the cost, and it is why this is a specification and not a landed packet. It is also the
natural pairing for MCQ-01's 507 `length-prose-vs-prose` rows, which need the same taxonomy to write
plausible wrong reasons against.

## What this does not certify

- **Authored** distractors were not measured here — this census walks the generator registry.
  `MCQ_LEAKAGE_ADJUDICATION.md` owns the authored corpus.
- **Three seeds per (generator, form)**, three bands. A misconception that only appears at an unusual
  draw is not in this file.
- **Whether each misconception is one a learner actually makes** is unmeasurable without learner
  data. It is the substance of the packet and it needs EVID-01, not a static scan.
- **The 6 remaining shared feedback shapes** (down from 8) sit in the numeric padding helpers, which
  were not disarmed — a numeric trap list falling below two entries has no legal shorter form the way
  an MCQ does, so that repair needs real misconception values per generator and is left open.
