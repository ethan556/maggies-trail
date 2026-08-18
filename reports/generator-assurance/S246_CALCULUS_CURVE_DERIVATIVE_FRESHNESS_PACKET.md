# S246 Calculus curve-analysis and derivative-rules freshness packet

Status: PASS for the bounded generator packet. This is not a claim that the full V4 programme is complete.

## Scope

- `g13-curve-analysis`: six stale numeric/sign-chart forms replaced with deterministic mathematical families.
- `g13-derivative-rules`: all eight stale numeric forms replaced with deterministic mathematical families.
- Every changed form has a prompt-derived independent solver, schema checks, replay checks, distinct-error checks, and unseen-seed sampling.
- Authored lesson JSON and unchanged MCQ/ordering forms were not rewritten in this packet.

## Assurance

- Curve-analysis focused suite: seven tests over 192 seeds per numeric form and 160 sign-chart seeds.
- Derivative-rules focused suite: eight parameterized tests over 192 seeds per form.
- Each output is independently recomputed from learner-visible prompt data rather than trusted generator metadata.
- The global resolver advanced from `ca-01-02/k1` through the complete curve-analysis and derivative-rules numeric families to the next independent family, `g13-derivatives-in-context`.

## Acceptance evidence

- Focused S246 tests: 15/15 pass.
- TypeScript typecheck: pass.
- Global resolver: all consumers in these two families pass; next unrelated frontier is `dc-01-01/k1`.

## Remaining programme work

The V4 programme remains partial. Standards decisions, lesson dispositions, symbolic presentation, illustration replacement, progression, and choice-surface queues remain open and must not be inferred closed from this packet.
