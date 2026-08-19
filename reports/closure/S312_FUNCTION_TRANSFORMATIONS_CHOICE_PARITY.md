# S312 — Function Transformations Choice-Surface Parity

Source-local P1 repair packet for Grade 11 `function-transformations`.

## Closed boundary

This packet closes exactly these concrete choice roots:

- `CHOICE-0082` — `ft-03-03/i1` interactive multiple choice
- `CHOICE-0083` — `ft-04-01/k3` check multiple choice

The repair replaces eight terse distractor/answer labels with complete,
learner-visible mathematical descriptions. Step and option IDs/order, prompts,
correct response (`o1`), option feedback, widget properties, evaluator
contracts, and all other course content remain unchanged. Each repaired label
is at most 12 words.

The independently blocklisted P0 fixed-exemplar binding
`ft-03-02/c1 -> stretch-reflect` is intentionally retained. No figure, shared
runtime, registry, or derived artifact is changed by this packet.

## Reproducible guard

`scripts/session/s312-function-transformations-choice-repair.mjs` is
idempotent and fails closed on the exact two step contracts, option identity,
correctness, feedback, evaluator-owned widget properties, and the retained P0
blocklisted figure binding. Its `--check` mode proves the repaired state
without writing.

`src/lib/session312.functionTransformationsChoiceParity.test.ts` independently
replays the same contracts, validates all course lesson schemas and the course
manifest, and asserts the retained visual binding.

Packet seal: `1e3de4cd00d282c4f3230c47d5a0179bd5d5de4fa50e1fafdbfa052c36526f51`.
Source seal (16 lesson files):
`adb0bbc2b3e40854e9299b0ce97b0666bd329c230835c150a0bd4a8f66aa1a7f`.

Focused regression, writer/`--check`, scoped ESLint, content validation,
pedagogy lint, TypeScript, strict CML, and `git diff --check` are green.

## Residual boundary

The blocklisted P0 visual remains withheld for the existing visual-quality
workflow. Generic assessor dispositions and progression streams remain outside
this narrowly source-verifiable choice-parity packet.
