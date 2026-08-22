# S315 — Polar & Parametric Choice-Surface Parity

Source-local P1 repair packet for Grade 12 `polar-parametric`.

## Closed boundary

This packet closes exactly four concrete choice roots:

- `CHOICE-0189` — `pp-02-03/k3`
- `CHOICE-0190` — `pp-03-03/k2`
- `CHOICE-0191` — `pp-04-01/k3`
- `CHOICE-0192` — `pp-05-03/k1`

Twelve labels are rewritten as parallel, learner-visible mathematical choices.
IDs/order, prompts, correct response (`o1`), feedback, widget properties, and
all evaluator-owned contracts remain unchanged. The sole queued progression
row, generic assessor streams, all figures, shared runtime, and derived
artifacts remain outside this packet.

## Reproducible guard

`scripts/session/s315-polar-parametric-choice-repair.mjs` is idempotent and
fails closed on the exact four step contracts, option identity, correctness,
feedback, and evaluator-owned widget properties. Its `--check` mode proves the
repaired state without writing.

`src/lib/session315.polarParametricChoiceParity.test.ts` independently replays
the contracts, answer evaluation, label parity, complete manifest, and every
lesson schema.

Packet seal: `00cd27de7e10c9507b909d131385b90e9ac66d0e6af6ab6c7bb419cf80b7ed05`.
Source seal (15 lesson files):
`7a827b161f45dbd7a6d697ac09bebf056d441d7d5c6cdf19c9502dc2c5cc7e92`.

Writer/`--check`, focused regression, scoped ESLint, content validation,
pedagogy lint, TypeScript, strict CML, and `git diff --check` are green.
