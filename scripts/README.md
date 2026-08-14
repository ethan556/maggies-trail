# Script map

## Canonical release checks

- `native-integrity.mjs` — dependency-free repository integrity.
- `check-registration.mjs` — lesson files, course registration, and plan consistency.
- `content-check.ts` — package-backed schema and pedagogy validation.
- `gen-manifest.mjs` / `gen-skill-prereqs.mjs` — canonical catalog and prerequisite graph.
- `flagship-rank.mjs`, `scaffold-gap-audit.mjs`, `curriculum-inventory.mjs`, `gen-product-state.mjs` — generated review and product-state records.
- `db-migrate.mjs`, `db-backup.mjs`, `db-purge.mjs` — durable database operations.

## Brand raster derivatives

`gen-brand-icons.mjs` re-derives every raster icon from the approved vector mark
(`public/brand/maggies-mark.svg`) — PWA 192/512, maskable 512, Apple Touch 180, favicon 16/32 and
`favicon.ico`. It rasterises only; it never authors artwork. Output is deterministic (same source
SVG ⇒ byte-identical PNGs), so a re-run is a no-op unless the vector changed.

```bash
npm run gen:brand-icons                            # regenerate + verify
npm run verify:brand-icons                         # verify on-disk output only, write nothing
node scripts/gen-brand-icons.mjs --renderer=chromium   # fall back to headless Chromium
```

The default renderer is `sharp` (libvips/librsvg) when it resolves from `node_modules`; the
`chromium` backend (playwright-core, honouring `PLAYWRIGHT_BROWSERS_PATH`) is an equivalent
fallback, verified to produce the same geometry. Verification is part of both modes: each PNG is
decoded and checked for real dimensions, non-blank content, the presence of every brand fill,
opacity where required, and — for the maskable icon — that no mark pixel escapes Android's inner
80% safe circle. It also re-checks that every `icons[]` entry in `public/manifest.webmanifest`
resolves to a file of the declared size.

## Historical authoring verifiers

Files named `verify-*.py` or similarly scoped scripts are lesson/session-specific authoring aids. Many encode the exact widget shape or content snapshot that existed when they were written. They are useful forensic checks but are not a substitute for the canonical release gates above and should not be batch-interpreted as current product status without first updating their assumptions.
