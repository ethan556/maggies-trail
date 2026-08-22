# S272 — Fractions figure-truth repair

`frac-whole-disguise` visibly and accessibly represents exactly `4/4 = 1 whole`. `fr-03-03/c1` now uses that exact contract. The lesson's later `6/3 = 2` division example remains correct but cannot use a four-fourths diagram, so `fr-03-03/c2` withholds it.

The learner retains both ideas without receiving mismatched visual evidence: a numerator equal to its denominator makes one whole, and `6/3` is equivalent to `6 ÷ 3`.

QA: source guard, focused regression, schema, pedagogy, strict CML, TypeScript, lint, and scoped diff checks. Queue-compatible effect: two stale illustration rows refresh-close; independent review remains open.
