# ARCH-01 · ARCH-02 — THE SEMANTIC-MATH AND CANONICAL-FORM RULINGS

**Status:** RULED. Waves 1 / 1B / 1C and MATH-03 were blocked on these and are now unblocked.
**Date:** 2026-08-17 · **Supersedes nothing** — no prior document existed.

## 0. Who ruled this, and why that is stated first

The programme assigns ARCH-01 and ARCH-02 to a reserved decision lane. No ruling was ever made and
no document was ever written, so four waves have sat behind two empty boxes. The owner delegated the
decision explicitly and asked for it to be completed. It is ruled here, in the open, with the
evidence each choice rests on — so that whoever disagrees can see exactly which measurement to
attack rather than having to reconstruct the reasoning.

Three of ARCH-02's clauses are not mine at all. The owner has already ruled on exact π, on fraction
format, and on the caret; those are recorded below as given, not as proposals.

---

# ARCH-01 — the semantic-math schema and the renderer invariant

## 1. The decision

**Mathematics keeps two representations, and the boundary between them is enforced rather than
assumed.**

| | source of truth | where |
|---|---|---|
| **Computed values** | a typed value (`number`, `{num, den}`, `{whole, num, den}`, the widget spec's own fields) | generators, evaluators, graders |
| **Displayed mathematics** | a **string in authored notation**, converted at the boundary | lesson prose, prompts, feedback, hints, options |

**There is no learner-facing mathematical AST, and there will not be one.** That is the substantive
ruling, and it goes against the programme's stated target, so the reasons are given in full.

## 2. Why not an AST

The plan's Wave 1 asks for "structured mathematical state … not only recognition of authored
strings". That is the right architecture for a system being built now. This one is not.

**The corpus is prose with mathematics inside it, not mathematics with prose around it.**
1,701 authored lesson files read like this:

> *"Maya packs 3 bags for a picnic. She puts 4 apples in every bag. We write 3 × 4 = 12 … It means
> 4 + 4 + 4."*

An AST for that sentence is not a well-formed object. It would require a mixed prose/math document
model and a migration of every authored file — and CLAUDE.md rule 1, the oldest rule in the repo,
forbids touching authored prose at all. The architecture would demand the one edit the project has
banned since its first session.

**Every generator builds its prompt by string interpolation, and the dual-derivation design depends
on that.** `variants.ts` is ~40,500 lines emitting template literals. The `INDEPENDENT` routes in
`variants.test.ts` — the heart of the whole verification design — recompute each answer **from the
printed prompt** by a different method. If generators emitted ASTs, the independent route would read
the same structure the generator wrote, and two derivations sharing a representation are one
derivation. The AST migration would not strengthen the check; it would delete it.

**The recogniser already covers the corpus.** 9,327 of 9,576 risk signatures across 879 lessons pass
through the sanctioned boundary today. An AST would be rebuilding, at the cost of the two properties
above, something that is 97% done.

**And the defects are not the ones an AST prevents.** Every math-presentation defect this programme
has actually found was a *boundary* defect, not a structure defect:

| found | what it was |
|---|---|
| GRB-00 (a–d) | four tokenizer defects — U+2212 exponents, `4sqrt(3)`, an eaten space, `1/6^3` |
| S242 (this wave) | a parenthesised base could not carry an exponent → a literal `^x` on screen |
| S242 (this wave) | the exponent class swallowed sentence punctuation → `^{1?}` |
| MATH leak index | `160·(1/2)^(4/8)` and `(ⁿ√a)^m` reaching learners as raw text |

An AST would have prevented none of them, because each is a failure to *recognise* notation that was
authored correctly. The repair for that class is a better recogniser and a leak gate, which is what
§3 rules.

## 3. The renderer invariant

> **No learner-visible string may reach the DOM carrying implementation-form mathematics.**

"Implementation-form" is defined by enumeration, not by intuition — an open-ended definition cannot
be gated:

| banned in learner-visible output | write instead |
|---|---|
| `*` **as a binary operator** (`5 * (-5)`) | `·` or `×` |
| `<=` `>=` `!=` | `≤` `≥` `≠` |
| `sqrt(` | `√` |
| `pi` as a word standing for the constant | `π` |
| a caret that survives the boundary into prose | a typeset exponent |
| `_` as a subscript marker in prose | a Unicode subscript or a math island |

**`*` is banned as an OPERATOR, never as a character.** This clause exists because of a measurement:
of the 14 `asterisk-multiplication` rows in the current audit, **thirteen are markdown emphasis** —
`*any*`, `*and*`, `*inside*` — and exactly one is multiplication. A character-level ban would have
been a 13:1 false-positive rule, and it would have collided head-on with the standing ruling that
markdown italics must render as italics. The test is whether a value sits on both sides.

### 3.1 Enforcement

The invariant is worth nothing unasserted. It is enforced at three points, and all three already
exist or are added by this ruling:

1. **The boundary itself** — `src/lib/math/authoredMath.ts`, one sanctioned route to KaTeX.
2. **The leak index** — `reports/math-presentation/MATH_MACHINE_EXPRESSION_LEAK_INDEX.csv`, which
   measures the **prose residue after every island is removed**: what the learner reads, not what
   the author wrote. This is the only measurement that can see a generated leak, because generated
   text does not exist in source.
3. **The generated sweep** — `GENERATOR_MATH_PRESENTATION_AUDIT.csv`, run over 102,251 generated
   problems.

**Acceptance for MATH-03 is therefore stated as a number, not a feeling:** the leak index and the
`asterisk-multiplication`/`machine-inequality`/`raw-caret` codes both reach zero, and a gate holds
them there.

### 3.2 What this invariant deliberately does not promise

- **It does not certify beauty.** A correctly typeset expression can still be badly chosen. That is
  ARCH-02's job.
- **It does not cover the orphaned function name.** `f(x)` renders as a plain `f` beside a typeset
  `(x)`. Absorbing it needs a rule distinguishing a function name from a prose word before a
  parenthesis, which is the exact ambiguity the boundary was built to avoid. **Open, and named.**
- **It cannot see a bypass reached through a variable, a helper or `dangerouslySetInnerHTML`.** The
  surface inventory says so itself: *"this finds bypasses, it does not prove their absence."*

---

# ARCH-02 — grade and context canonical form

## 4. The three rulings already given by the owner

Recorded verbatim in intent, because they are not mine to restate:

1. **Exactness.** *"Exact answer with π is always preferable, unless the numeric answer is required
   for a specific pedagogic concept mastery."* App-wide, and re-authoring to achieve it is mandatory.
2. **Fraction format.** *"Use appropriate maths format for fractions. `1pi/2` should be `pi/2`."*
   A unit coefficient is never printed.
3. **The symbol.** *"π not pi. Do not use pi."*
4. **The caret.** *"`x` can be used in place of the caret, the question rephrased to be what is the
   value of `x` for which the equation is correct/true. This needs to be system-wide."*

## 5. The canonical-form ladder

Every value a learner sees is in exactly one of three states. The state is a property of the *step*,
not of the number.

| state | when | form |
|---|---|---|
| **EXACT** | default, everywhere | surds, π, and reduced rationals kept symbolic: `π/2`, `2√3`, `5/8` |
| **INTERMEDIATE** | inside a worked chain, before the last line | whatever the method produces, unrounded, not reduced early |
| **FINAL** | the graded answer | EXACT, unless the step's own prompt states a rounding convention |

**Rounding is never invented.** CLAUDE.md rule 6 is promoted from working practice to policy: round
once, at the end, and only to a convention the authored prompt states. A trap printing `1.67` for
5 ÷ 3 where no prompt mentions rounding is a defect, and `pf-quad-form`'s `x = -2.236068` (GRB-02,
40 rows) is the same defect at six decimal places.

**GRB-02 is hereby ruled, since it was waiting on exactly this.** A quadratic-formula generator
keeps the **surd**: `x = 1 ± √5`, not `x = -2.236068`. The lesson teaches the formula; the formula's
output is a surd; printing a float teaches that the formula produces decimals. The pedagogic
exception in ruling 1 does not apply — nothing in that step's concept requires a decimal.

## 6. Grade bands

Canonical form is not uniform across K–12, and pretending otherwise is how a Grade 2 screen ends up
with a radical on it.

| band | admits | never |
|---|---|---|
| **K–2** | whole numbers, halves and fourths as words or shapes | symbols for fractions, negative numbers, any radical |
| **3–5** | `a/b` reduced, mixed numbers, decimals to hundredths | surds, π as a symbol before it is taught, exponents beyond squares |
| **6–8** | signed rationals, `π`, integer exponents, √ of a perfect square | irrational surds left unsimplified |
| **Algebra +** | surds, π, e, rational exponents, function notation | decimal approximations of exact values |

The band is derived from the course's `gradeLevel`, which already exists. No new field.

## 7. Multiplication, order and units

- **Multiplication:** `×` between numerals (`3 × 4`), `·` between symbols or where `×` reads as a
  variable (`2 · x`), juxtaposition where convention expects it (`3x`). Never `*`.
- **Term order:** descending degree, then alphabetical. `3x² − 2x + 1`, never `1 − 2x + 3x²`.
- **Coefficients:** `1` is never printed (`x`, not `1x`; `π/2`, not `1π/2` — the owner's ruling 2).
- **Units:** a space then an upright unit — `12 cm`, `45°` closed up. A unit is never italic and
  never inside the math island unless the step is *about* the unit algebra.

## 8. What this does not settle

- **The 158 lessons under the CML waivers.** Canonical form is a display policy; those are a
  *sequencing* problem (a prediction with no manipulation within three steps). ARCH-02 does not touch
  them and must not be cited as if it did.
- **Which decimal conventions individual prompts should state.** The policy says an invented
  convention is a defect and a stated one is binding. It does not enumerate, per step, which should
  state one — that is per-lesson pedagogy.

---

## 9. What is unblocked by this document

| was blocked on | now |
|---|---|
| **Wave 1** semantic-math foundation | ruled: no AST; boundary + enumerated invariant + leak gate |
| **Wave 1B** canonicalization | ruled: the ladder in §5, the bands in §6, the notation in §7 |
| **Wave 1C** runtime migration | acceptance is the leak index and the sweep codes reaching zero |
| **MATH-03** | same acceptance; its 820 symbolic-display rows are now judgeable against §6 |
| **GRB-02** (40 rows) | ruled in §5: keep the surd |

## 10. The strongest argument against this ruling

Stated plainly, because a decision document that only argues its own side is advocacy.

**A recogniser can only ever be as good as its regexes, and this session alone found two more holes
in it.** Every defect in the table in §2 is evidence for the AST position as much as against it: a
structured representation could not have dropped an exponent off the end of a parenthesis, because
there would have been no parenthesis to fall off. The counter is that the migration cost is measured
in the thousands of authored files and the loss of dual derivation is unrecoverable — but if the
leak index refuses to reach zero after Wave 1C, that is the signal that this ruling was wrong, and
the reopening condition is exactly that.

**Reopen if:** the leak index cannot be driven to zero by boundary repairs alone, or a boundary
repair is found that cannot be made without breaking an existing fixture that is itself correct.
