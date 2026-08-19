# S272 — Statistical Inference figure-truth repair

`si-sampling-dist-sizes` visibly and accessibly shows samples of `n = 10`, `n = 40`, and `n = 100`, centred on `60%`, with labeled spreads about `±31`, `±16`, and `±10`. The lesson now uses those exact values rather than unsupported `400`, `1600`, and `6400` examples.

The statistical idea remains intact: spread falls with the square root of sample size, so each further halving requires four times as much data.

QA: idempotence guard, focused regression, schema, pedagogy, strict CML, TypeScript, lint, and scoped diff checks. Queue-compatible effect: one stale illustration row refresh-closes; independent review remains open.
