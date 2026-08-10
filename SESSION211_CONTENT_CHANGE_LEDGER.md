# S211 — content-change ledger

**Exactly one authored lesson file changed, by exactly one added key.**

`content/courses/vectors-matrices/lessons/vec-05-03.json`, step `k1`: the variant key
`{"gen": "reflect-compose", "form": "composeMatrix"}` was added — the sanctioned single-key
addition of the repo's standing variant protocol (CLAUDE.md), restoring the re-askability lost
in S210's mcq→matrixTransform conversion (the trade recorded in
`SESSION210_CONTENT_CHANGE_LEDGER.md` §8, now repaid).

- before sha256: `f8686b99d0eb7ff0dde4d806fb30a11d1b394c7622e6d6eabe67dfd3276306bf` (S210 seal)
- after sha256: `84f5a44f78413f6690110fef58989b2e4767422fa91d17f2e61ac3fbace26ff9`
- No prose, answer, hint, id, conceptTag, or any other step touched (full-tree diff against the
  S210 seal: this is the only differing content file; the regenerated
  `SESSION210_LESSON_HASHES.json` differs from its sealed predecessor in exactly this one entry).
- Proof chain: the `AUTHORIZED` map is path-keyed and vec-05-03.json was already authorized in
  S210, so counts are unchanged — `content-change proof 809/809`, `hash proof 1,701/1,701`
  (verified by the adversarial reviewer against the script's actual matching semantics, not the
  worker's claim).

The new generator form (`composeMatrix`) is source code, not content: pure function of the seed,
independent test route walks basis vectors geometrically (mutation-tested — 8/8 sign
corruptions caught), prompts never contain the answer, all four gates of the variant protocol
green (variants.test.ts 3,992 solo, resolver 17/17, validate:content 1,840/1,840,
lint:pedagogy 1,711/1,711).

Everything else in S211 is platform code, tests, and docs. `scripts/engine-capabilities.json`
unchanged; `mmipTypes.ts` frozen, byte-verified.
