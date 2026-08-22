# S247 CCSS HSF batch 01 - post-append validation

The 40 signed records in `S247_CCSS_HSF_DOMAIN_SCOPE_BATCH01.jsonl` were independently checked
against the official Common Core mathematics PDF, pages 67-71. `HSF` is the Functions conceptual
category/domain; assessable actions are enumerated under `F-IF`, `F-BF`, `F-LE`, and `F-TF`.
Accordingly, each rejection is limited to the coarse `HSF` locator and leaves exact descendant
alignment open.

The bounded appender added all 40 packet records byte-for-byte to the standards authority. The
dossier rebuild now reports 6,079 candidate, 2 partial, 0 approved, and 40 rejected edges. The
post-append validator requires:

- exact packet-to-ledger equality for 40/40 records;
- valid canonical signatures and candidate dossier bases;
- current lesson source hashes for every evidence snapshot;
- `rejected` dossier state for every scoped edge; and
- 42/42 globally valid standards decisions with zero invalid records.

This closes 40 coarse standards rows. It does not approve any descendant standard, and it does
not infer transfer or mastery from challenge metadata.
