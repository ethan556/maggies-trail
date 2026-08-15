# EXACT π BEATS ITS DECIMAL — RULING, EVIDENCE, AND WHY THE FIRST RESTRUCTURE WAS REVERTED

**Ruling (user, S242):** *"It is better to leave questions/options/answers with pi than to give
exact answers (which are actually just approximations). Hence 9pi is better than 28.27, likewise
10pi is better than 31.42. Restructure questions, options, answers to meet this criteria instead."*
Plus: *"use appropriate maths format for fractions. 1pi/2 should be pi/2."*

**Evidence:** `reports/math-presentation/MATH_PI_EXACT_FORM_INDEX.csv`, from
`scripts/audit/pi-exact-form.mts`. **35 rows: 10 authored, 25 generated.**

The ruling is right and half-written into the repository already. CLAUDE.md rule 6 says round once,
at the end, and only to a convention the prompt states — so a graded answer of 28.27 where the exact
value is 9π asserts a precision the mathematics does not have. And it is gradeable-wrong: a learner
who answers 28.274 is correct, and whether they are marked right depends on a tolerance set around
the wrong number.

## The audit, and the false-positive trap it walked into first

The first cut used denominators up to 12 and a 0.005 tolerance, and reported 58 rows of which most
were nonsense: a median of 5.5 "is" 7π/4 (5.4978), a probability of 0.52 "is" π/6 (0.5236), and
"Compute 12.5 + 3.47 = 15.97" "is" 61π/12. That is the birthday problem, not a finding — the lattice
of clean π multiples is dense enough that almost any two-decimal number sits within 0.005 of one.

What separates 28.27-standing-in-for-9π from 5.5-meaning-five-and-a-half is the **subject**. A
decimal is only suspected when the item is about circles: π, radius, arc, sector, circumference,
radian, or a trigonometric value. With that filter: 58 → 35, and every remaining row is real.

Prompts that ASK for a decimal — "(2 decimals)", "round to the nearest tenth", "use π ≈ 3.14" — are
excluded. Giving the decimal there is compliance, not invention.

Fraction formatting is fixed in the audit output per the second ruling: `π/2`, never `1π/2`; `π`,
never `1π`.

## What the 35 rows are

**25 generated, and the sharpest is `a2-trig / tf-transform`.** It asks "Find the period of
y = cos(8x)", grades a numeric answer of `0.7853981634`, and its own success line reads
"Period=2π/|B|=0.785398" — it computes the exact form and then throws it away. π/4 *is* the period.
A numeric box cannot accept π/4 at all, so a learner who knows the answer must convert it to a
decimal to be marked right, and the `tolerance: 0.01` decides how many digits of an irrational
number count as knowing.

**10 authored, and 9 of them are `commonErrors[].value` — traps, not answers.** A numeric widget
compares a typed number against these; the learner never reads them as a form. They are lower stakes
than the generated case, though the same argument applies to the feedback text beside them.

## The restructure was attempted, and reverted — here is exactly why

`a2-trig / tf-transform` was rewritten as an mcq with exact options (`π/4`, `π/2`, `2π`, `8π`),
carrying the two authored misconceptions over unchanged — multiplying by the frequency instead of
dividing (2πB), and halving the cycle (π/B) — plus forgetting B (2π). It generated correctly, in
proper mathematical form. Then six tests failed, and both failures are the gates working:

1. **`variants.resolver.test.ts` — "produces the SAME widget surface the step was authored on".**
   `tf-04-03#k1` is an authored **numeric** step. Serving it an mcq changes what the learner does,
   and the resolver refuses. Correct: a generated variant must substitute for the authored item, not
   replace the interaction.

2. **`variants.test.ts` — the INDEPENDENT route.** It recomputes the period numerically and compares
   against `variant.answer`; with an mcq that answer is a label, so it read `'4π'` where it expected
   `12.5663706144`. Correct again: the dual-route design is doing its job.

**And underneath both, a curriculum question I should not answer alone.** The three authored steps
declaring this form are not all period questions:

| step | prompt | answer |
|---|---|---|
| `k1` | "What is the period of y = cos(x/2)? **(Round to hundredths.)**" | 12.57 |
| `k2` | "y = sin(bx) has period 2π/3. What is b?" | 3 — integer, no π issue |
| `ch1` | "For y = 3 sin(2x) + 1, find the value at x = π/4." | 4 — integer, no π issue |

Only `k1` is about exact π form, and its prompt *explicitly asks for hundredths* — so restructuring
it means rewriting the authored question, not just the generator. `k2` and `ch1` are integer-answer
numeric items that an mcq restructure would break for no benefit. The generator's one form is
serving three different question types, and splitting it is the real packet.

## The packet, specified

**PI-01 — split `tf-transform` and make the period question exact.**

1. Add a new form `tf-transform-period__mcq` emitting the mcq above. Options are exact π forms:
   correct `2π/|B|`, distractors `2π|B|`, `π/|B|`, `2π`, each reduced to proper form.
2. Rewrite authored `tf-04-03#k1` as an mcq with the same option set, dropping "(Round to
   hundredths.)" from the prompt — the question becomes "What is the period of y = cos(x/2)?" with
   options `4π`, `π`, `2π`, `π/4`. This is authored-content work and needs the pedagogy owner.
3. Leave `k2` and `ch1` on a numeric form. They ask different questions and their answers are
   already exact integers.
4. Update the `INDEPENDENT` route for the new form to derive the exact label from B by a different
   method than the generator uses — walk the period definition, not the formula.

**PI-02 — exact forms in trap values and their feedback.** The 9 authored `commonErrors` rows. Lower
priority: these are compared, not displayed. The feedback strings beside them already read
"Period = 2π/(1/2) = 4π ≈ 12.57", which is the right shape — exact first, decimal as the aside.

## What landed at this seal

The audit and the ruling are recorded and reproducible; no content or generator changed. The
`asPiMultiple` formatter follows the second ruling. Running
`npx tsx scripts/audit/pi-exact-form.mts` regenerates the index at any seal, so the 35 rows are a
work list rather than a snapshot that goes stale.
