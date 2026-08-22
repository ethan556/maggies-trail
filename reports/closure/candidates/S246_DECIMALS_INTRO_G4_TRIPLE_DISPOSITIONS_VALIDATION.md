# S246 decimals-intro-g4 triple-disposition validation

Status: **PASS**

Scope is deliberately bounded to the 18 live lessons in `decimals-intro-g4`. The assessment read each complete lesson and its current S244 card, then made independent whole-lesson, visual-first, and Grade 4 language decisions. It did not import the prior interaction classification or treat absence of a queue flag as approval. No lesson implementation, shared decision ledger, queue, card, cache, or generated evidence was changed.

## Reproducible gate

Run:

```text
node reports/closure/candidates/validate-s246-decimals-intro-g4-triple-dispositions.mjs
```

Validated result:

| Gate | Result |
|---|---:|
| Course-manifest lesson IDs | 18 / 18 exact |
| Candidate records | 18 / 18 |
| Live S244 cards | 18 / 18 |
| Candidate `reviewedBasisHash` equals live card | 18 / 18 |
| Live lesson source hash equals card | 18 / 18 |
| Live course source hash equals card | 18 / 18 |
| Records with every contract-required field | 18 / 18 |
| Unique record IDs | 18 / 18 |
| JSONL parse, enum, timestamp, evidence-reference gates | PASS |
| Candidate SHA-256 | `c269eee3ec0b9efcb1ef908f666b80f474f0a0a92cf1e9f0addffa083f7f1e7b` |

## Current-hash manifest and decisions

| Lesson | Review basis | Lesson | Visual | Language |
|---|---|---|---|---|
| dg4-01-01 | `bc947d5a207d4c684540f6393a520ecd9329cf7c37e7c82ac8e28db1c5f2e647` | KEEP | SUFFICIENT | FIT |
| dg4-01-02 | `fd37fb77bb2e7f1d5cf50bc0cbf1db9627e14ef05b04afe32cb3e435b0c5ec2f` | KEEP | SUFFICIENT | FIT |
| dg4-01-03 | `bb67cfc6696361b37675e0daad09e1bd4fdae0850b4962328bf21893c9f8fb59` | REVISE | REQUIRED | REVISE |
| dg4-01-04 | `59076e8dc3533d7210e5ef92f2d3fb1d1923a5e6910bb88efa0105963098661d` | KEEP | SUFFICIENT | FIT |
| dg4-01-05 | `78335cbc0349118de393c7d22f6aea395f51fce29a396eed58793107b28ec5bc` | KEEP | SUFFICIENT | FIT |
| dg4-01-06 | `f057fee3ba616fd9b25e08e47b6324b77df4867692e48e2228f7007599bec18e` | KEEP | SUFFICIENT | FIT |
| dg4-02-01 | `77aa7bd855a390eedd0ef2cf2272db8e4dddd17b3686acf068e3bfb91d651804` | KEEP | SUFFICIENT | FIT |
| dg4-02-02 | `c4a63f4b6fba590d2c4c079520e7f979f0c0a3d04ab4a497f8025b45882f3eca` | KEEP | SUFFICIENT | FIT |
| dg4-02-03 | `202d811cd91270f10f15c5dc3f05f7eea032547b6fa4fb1b143ab42db3c13157` | REVISE | REQUIRED | FIT |
| dg4-02-04 | `459e773e07440ca3b8d9f308d223845d0d0e82d8db0462f16c3a626d8a4904e9` | REVISE | PREFERRED | FIT |
| dg4-02-05 | `f33d352dfbf884197cf14bde9bdfa7699f56ba35b838ebec04ffeb06e254864b` | REVISE | REQUIRED | FIT |
| dg4-02-06 | `065659c10fb7efaa42cec4bd61a2701967ba840350824c0f11dc24508664bae2` | KEEP | SUFFICIENT | FIT |
| dg4-03-01 | `155cad9bedbd5f477b18efcd5a5ff3f9d6179441a31bc9e64a3e755bcf7549cd` | REVISE | PREFERRED | FIT |
| dg4-03-02 | `f29da7309e428ef261a1015212a2cae398221899b92eb5955a47317b22ef6377` | REVISE | REQUIRED | FIT |
| dg4-03-03 | `248c474b835d39b5138917813d3756f487e240188e0e4d76285dac7200daf0d0` | KEEP | SUFFICIENT | FIT |
| dg4-03-04 | `f5602236a7ec30dcb9edd037a70b5e00aa3da8dee6d4f303aa88a3744b404bc3` | REVISE | REQUIRED | FIT |
| dg4-03-05 | `3b1cf51f447f8a3cec9136e99d3cad8f4090f190b85d10b0cd10af03d4e6c0dd` | REVISE | REQUIRED | FIT |
| dg4-03-06 | `6a59dbc7ee3e827afe3f646072d9a5cd7e18f45274df054fe42f2bba39c90a56` | REVISE | REQUIRED | FIT |

Totals: 9 KEEP, 9 REVISE; 7 REQUIRED, 2 PREFERRED, 9 SUFFICIENT visual decisions; 17 FIT and 1 REVISE language decisions; no escalations.

## Material revision findings

- `dg4-01-03`: the lesson promises a number line but uses the hundredths grid throughout; challenge feedback also contains singular/plural errors (`1 columns`, `1 tenths`, `1 cells`).
- `dg4-02-03`: the addition story says 20 cells are prefilled and five are added, but the interaction has no prefilled start and asks only for the final total.
- `dg4-02-04`, `dg4-02-05`, and `dg4-03-01`: four assessed items repeat essentially one selection job; the next revision must diversify learner actions and remove authored-position cues.
- `dg4-03-02`: one explanation falsely says the tenths differ for 0.71 and 0.75; comparisons also need simultaneous paired models or a number line.
- `dg4-03-04`: ordering and an explicitly named number-line task are presented without an actual number line or simultaneous view of all values.
- `dg4-03-05` and `dg4-03-06`: generic grids stand in for coins and measurement tools, while the assessed sequences repeat one conversion job.

## Expected queue effect after authoritative integration

Appending these 18 current records to the shared ledger should close exactly:

- 18 `LESSON_COMPLETE_DISPOSITION` rows;
- 18 `VISUAL_FIRST_REPRESENTATION` rows;
- 18 `GRADE_LANGUAGE_REVIEW` rows;
- **54 triple-stream rows total**.

The current queue consolidator adds those three rows unconditionally and does not yet read the lesson-decision ledger. Therefore the 54-row reduction also requires a root-owned, closure-aware reconciliation in `scripts/audit/consolidate-pending-workload-s236.mjs`; the candidate packet intentionally does not modify that shared integration path.
