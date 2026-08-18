# S246 Multiply Bigger triple-disposition assessment

Status: **PASS — candidate evidence only**

Scope is the complete 14-lesson `multiply-bigger` course. Every live lesson, its remedial path, course metadata, current S244 review card, runtime figure placement, fixed-exemplar drift evidence, and scoped queue rows were reviewed independently across the V4 whole-lesson, visual-first, and Grade 4 language dimensions. Recent option edits and prior interaction `KEEP` classifications were not treated as whole-lesson approval.

This packet changes no lesson, generator, shared decision ledger, queue, review card, cache, or shared script.

## Decision summary

- Whole lesson: **4 KEEP**, **10 REVISE**, 0 ESCALATE.
- Visual-first: **6 REQUIRED**, **2 PREFERRED**, **6 SUFFICIENT**, 0 ESCALATE.
- Grade-language: **10 FIT**, **4 REVISE**, 0 ESCALATE.
- Expected generic review rows after root validation and authoritative ledger integration: **42** — 14 each in `LESSON_COMPLETE_DISPOSITION`, `VISUAL_FIRST_REPRESENTATION`, and `GRADE_LANGUAGE_REVIEW`.
- A `REVISE` disposition closes the generic decision row but creates or preserves implementation debt; it does not claim that the lesson repair is complete.

## Current-hash manifest

| Lesson | Review basis hash | Lesson | Visual | Language |
|---|---|---|---|---|
| mb-01-01 | `faf6f310ef52e7310ab4580a7ecc8a2543b96b63cce09b95e983a4520ce5466b` | REVISE | REQUIRED | REVISE |
| mb-01-02 | `a2a2cc45d5d418d270a30d20e112e77dc8483ac1a8fb446c5aec02e44b1f8ac9` | REVISE | REQUIRED | FIT |
| mb-01-03 | `3b2f141a09bc284cc052cea7f7becabfab917825047bf5b369610c6e78f77031` | KEEP | SUFFICIENT | FIT |
| mb-02-01 | `4990bf84cbf55c090c664621297da037dda1bef7342d0c9ae479b023f54be166` | KEEP | SUFFICIENT | FIT |
| mb-02-02 | `b2fb265b41ecc71e1665c4eebd86d40826512af15fb33029a217c897f34fce70` | REVISE | SUFFICIENT | REVISE |
| mb-02-03 | `1f5b18acf688d38ceb5bd4629bde42d10a1a19dbf8e7978e7d727d69faad0c2e` | KEEP | SUFFICIENT | FIT |
| mb-03-01 | `d2ca3d661692693c9f316c91d08e3599f9c42c3ddf5e9dc27675293f917217c5` | REVISE | REQUIRED | REVISE |
| mb-03-02 | `015cf9194fdb6be8f2903f1bbd571bae6e7def55c7b4807c8dc98df5273bea7e` | REVISE | REQUIRED | FIT |
| mb-03-03 | `23e44e7c29f729e0b2b5efe20625c8f402e47f9e886d5c95bfaa276fbd6ed9da` | KEEP | SUFFICIENT | FIT |
| mb-04-01 | `da3c9b274eb2f15adc46d325cedf4972f53d8785a53a1ca7f01d6829e1bc9b6a` | REVISE | REQUIRED | FIT |
| mb-04-02 | `04ee33342fe186706f4a46467c95a04ef8ef5b29ea1be47b16bc790b9dc8306e` | REVISE | REQUIRED | FIT |
| mb-04-03 | `7292713bf5c63d70ea7885476b2c768fd8b8033eb0a92f535712aa188f1291c9` | REVISE | PREFERRED | FIT |
| mb-05-01 | `89255826872e55ecafd96085ddfbcce583993f54f5edf35d47a33cc3b84f1c53` | REVISE | SUFFICIENT | FIT |
| mb-05-02 | `75a18cbb95b5a9ca11b5545432a80b61191aa8012c295a4082d6fee30007f8f8` | REVISE | PREFERRED | REVISE |

## Material findings

### Required visual repair

- `mb-01-01/c2` and `mb-04-02/c2` are withheld at runtime exactly where backward multiplicative comparison and quotient-with-remainder reasoning need visible state.
- `mb-01-02/c1`, both `mb-03-01` concepts, `mb-03-02/c1`, and `mb-04-01/c2` use fixed exemplars whose visible values differ from the adjacent authored example. These seven placements across six lessons require state-bound or text-aligned replacements.
- `mb-04-03` and `mb-05-02` already have functioning concept visuals, but simultaneous context comparison and a compact story ledger are preferred improvements for their next revisions.

### Semantic and Grade 4 language repair

- `mb-01-01` generalizes a local result as “times makes it longer than adding” and introduces an unnecessary `1.2 times` aside in an otherwise whole-number Grade 4 comparison.
- `mb-02-02` repeatedly teaches “small number → factor; big number → multiple.” Size is not the definition, and a positive number is both a factor and a multiple of itself; use exact divides/is-divided-by language.
- `mb-03-01` mixes sound tens-unit reasoning with “zero rides along” and “attach one zero” shortcuts that can teach the digit-appending misconception the concept is trying to avoid.
- `mb-05-02` uses long, parenthetical, multi-clause stems for k4 and the challenge; the underlying story chain should be shown in a compact ledger or diagram with shorter sentences.

### Question-job and progression repair

- Current detector evidence correctly flags value-swapped repeats at `mb-03-01/k2`, `mb-04-01/k3`, and `mb-05-01/k3`.
- `mb-05-01/ch1` also reuses the interactive's exact `3, 6, 12, 24` doubling sequence, so its supposed challenge is another next-term item rather than transfer.
- `mb-04-03` over-practises round-up contexts while never asking the learner to compute a round-down result and asking only for the numerator in its fractional case.
- `mb-05-02/k1`, `k2`, and `k3` repeat multiply-then-subtract computation; `k4` explicitly rehearses the challenge's two-products-add-then-divide chain. The next version needs distinct representation, planning, error-analysis, and transfer jobs.

## Strong current lessons

`mb-01-03`, `mb-02-01`, `mb-02-03`, and `mb-03-03` earn current `KEEP / SUFFICIENT / FIT` decisions. Each uses a rendered mathematical model, moves through materially different learner actions, routes feedback to genuine misconceptions, and ends in a transfer task without a current exact-duplicate or progression finding.

## Reproducible validation

Run:

```text
node reports/closure/candidates/validate-s246-multiply-bigger-triple-dispositions.mjs
```

The validator seals the exact 14 manifest IDs, 14 current card hashes, live lesson and course source hashes, contract-required fields, record IDs, enums, timestamps, evidence files, substantive rationales and reopen conditions, and the exact decision distribution.

Validated candidate SHA-256: `f07d6b14a59e3b6a790f7e956b01936637ac01f50e4eb237b7f95708d907b929`.

Authority boundary: these records remain candidates. Only root review, append to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, and deterministic card/queue/cache regeneration can make the dispositions authoritative.
