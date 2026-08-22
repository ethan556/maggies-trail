# S272 — Linear Equations & Systems figure-truth repair

`les-back-subst` visibly and accessibly works `x = 2` through `y = 2x − 1` to produce `(2, 3)`. It cannot represent the first lesson's general system or the second lesson's `y = 4x`, `(2, 8)` example. Those two bindings are therefore withheld.

All correct back-substitution reasoning and assessed interactions remain. The learner never receives incompatible rendered or accessible numeric evidence.

QA: idempotence guard, focused regression, schema, pedagogy, strict CML, TypeScript, lint, and scoped diff checks. Queue-compatible effect: two stale illustration rows refresh-close; independent review remains open.
