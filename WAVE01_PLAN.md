# WAVE 01 PLAN — TRUTH AND RELEASE INTEGRITY

## Change budget

No lesson/content expansion. No engine work. No visual refactor. Only high-leverage integrity and
entry-flow repairs whose failure can contaminate every later closure decision.

## Batch 1 — exact authored-corpus identity

1. Create a shared byte-level authored-corpus fingerprint over every course descriptor and lesson JSON.
2. Make manifest generation publish the full SHA-256 and authored file count.
3. Make product-state generation refuse to run if live authored bytes differ from the manifest hash.
4. Generate `PRODUCT_STATE_VERIFIED.json` with the same exact hash and truthful provenance.
5. Mutation-test a real lesson byte and require product-state generation to fail before overwriting state.

## Batch 2 — stale state/report repair

1. Re-generate manifest, inventory, notebook index, playbook status, product state.
2. Move stale S205Q runtime output away from a current-looking filename.
3. Carry the S218 runtime baseline only through an explicitly session-labelled certified-runtime file.
4. Require generated artifacts to be byte-stable after regeneration.
5. Do not report `.build-time` or runtime measurements as current unless their fingerprints match the
   current source/corpus.

## Batch 3 — placement unification

1. Remove the Grade-3-only legacy comfort-quiz route from production onboarding.
2. Route every grade/goal combination to the canonical 12-item placement diagnostic.
3. Preserve an explicit manual “start at my grade level” bypass.
4. When placement was launched from onboarding, persist its recommended route into onboarding state so
   setup does not reopen on dashboard return.
5. Retain legacy helper/data compatibility only where tests/storage may still need it; do not expose it.

## Batch 4 — social-proof integrity

Remove fictional testimonials from production launch UI. Replace them with verifiable catalogue/product
architecture evidence; no invented credibility.

## Batch 5 — adversarial QA

- compare all authored curriculum bytes against the S218 seal;
- independently recount course/lesson/step/engine/widget metrics;
- re-derive A/B/C/D using the exact registry formula;
- mutation-test corpus freshness and verify byte-exact restore;
- run dependency-free source syntax checks and static release assertions;
- run generated-freshness groups that do not need dependencies twice until byte-stable;
- search for a matching local dependency tree before accepting runtime unavailability;
- record current dependency/security limits rather than borrowing historical green counts.

## Exit decision

Wave 01's truth-layer exit can pass when one exact corpus hash controls manifest/product state and no
contradictory current counts remain. The full public-release dependency/build/browser gate can remain
open only if explicitly carried in `CLOSURE_LEDGER.md`; it may not be silently waived.
