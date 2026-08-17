# Variant generation — current state

Rewrite this file at the end of every session. The running ledger lives in `VARIANT_LOG.md`.

## S243 state (2026-08-17, implementation branch on base 0cedbac)

- Generator count: **442**; declarations: **5,895**. S243 added no generator and no declaration.
- Practice/Review delivery remains **6,027/6,762 pool-eligible items (89.1%)**.
- Authored lesson files changed: **0**. The Grade-K question work is generator-side only.
- Production avatars enabled: **0/60**. Four premium candidates are quarantined as
  **PRE-CANARY / NON-SHIPPING**; the release allowlist is empty.
- Strict CML: **0 errors / 200 warnings** within ceilings (161 prediction-not-causal,
  39 flagship-response-heavy). No waiver count moved.
- Stricter representation scoring exposes **83** K–8 C/D lessons: 72 multi-engine, 11 extend,
  all 83 partial representation, 0 unreviewed. This is debt made visible, not completed lessons.

## Validation status

Focused canaries, typecheck, schema **1,840/1,840**, pedagogy **1,711/1,711**, registration, and
build are green. The required shards are red: **13,917 passed / 23 failed / 1 skipped**. Therefore
the S243 tree is neither landed nor full-V4-complete. See `HANDOVER_COWORK_S243.md`.

## Governance and permanent holds

- Rule 1 still bars authored prose, options, and lesson structure. The 18 CML sequencing cases and
  143 lessons with no manipulative step require an explicit narrow owner override.
- The 25 authored MCQ shape leaks remain human-owned.
- `g4p-02-01/k2` and `g4p-02-02/k2` remain permanently withdrawn single-fact variants.
- `cosmetic-only` pairs need a mathematical dimension whose answer moves or a rule-7 rejection.

## Next 3 targets

1. Make all four shards green, preserving evidence for Windows path/temp/CRLF failures, the
   accessible-parity timeout, and the `nanoid` 3.3.17/3.3.18 mismatch.
2. Obtain the narrow authoring decision, then batch the 18 sequencing and 143 no-manipulative CML
   cases with hash proof and waiver ratchets; without it, continue only shared/generator work.
3. Produce a consistently framed, multi-choice avatar canary per band; pass independent contact-
   sheet review before enabling anything. Do not ship the four S243 candidates.
