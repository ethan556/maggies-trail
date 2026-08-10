# Script map

## Canonical release checks

- `native-integrity.mjs` — dependency-free repository integrity.
- `check-registration.mjs` — lesson files, course registration, and plan consistency.
- `content-check.ts` — package-backed schema and pedagogy validation.
- `gen-manifest.mjs` / `gen-skill-prereqs.mjs` — canonical catalog and prerequisite graph.
- `flagship-rank.mjs`, `scaffold-gap-audit.mjs`, `curriculum-inventory.mjs`, `gen-product-state.mjs` — generated review and product-state records.
- `db-migrate.mjs`, `db-backup.mjs`, `db-purge.mjs` — durable database operations.

## Historical authoring verifiers

Files named `verify-*.py` or similarly scoped scripts are lesson/session-specific authoring aids. Many encode the exact widget shape or content snapshot that existed when they were written. They are useful forensic checks but are not a substitute for the canonical release gates above and should not be batch-interpreted as current product status without first updating their assumptions.
