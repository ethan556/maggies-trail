# S283 — Canonical app-icon migration validation

Scope: an isolated, read-only contract over existing identity metadata and generated assets. This packet does not alter `src/components/brand.tsx`, vector/raster icon assets, the manifest, layout metadata, or the Open Graph renderer.

## Canonical source and resolved surfaces

`public/brand/maggies-mark.svg` is the approved canonical mark. `public/icon.svg` is byte-identical to it. The deterministic generator (`scripts/gen-brand-icons.mjs`) reads that canonical mark and verifies the derived icon assets without writing when invoked with `--check`.

| Surface | Declared source | Required physical output |
| --- | --- | --- |
| Browser favicon | `/icon.svg`, `/icons/favicon-16.png`, `/icons/favicon-32.png`, `/favicon.ico` | SVG source; 16×16 and 32×32 PNGs; ICO entries 16×16, 32×32, 48×48 |
| Apple touch | `/apple-touch-icon.png` | opaque 180×180 PNG |
| PWA | `/icon.svg`, 16, 32, 180, 192, 512 and maskable 512 entries in `manifest.webmanifest` | all files resolve; PNG dimensions exactly match declared sizes |
| Root metadata | `src/app/layout.tsx` icon/Apple/shortcut declarations plus `/manifest.webmanifest` | static browser metadata is the exact non-maskable subset of the manifest graph |
| Open Graph and Twitter | `/brand/maggies-og.png` | one shared 1200×630 PNG, rendered from the approved mark and wordmark by `scripts/brand/render-og-image.mjs` |

## Ratchet

`src/lib/session283.canonicalAppIconMigration.test.ts` enforces all of the following:

1. Exact manifest icon records, including media type, dimensions, and `purpose`.
2. Byte identity between the root SVG favicon and the approved mark.
3. File resolution and PNG dimensions for every declared raster derivative; valid ICO container and embedded 16/32/48 PNG dimensions.
4. Exact root-layout browser/Apple/PWA references and deliberate manifest-only placement of the maskable icon.
5. One shared Open Graph/Twitter card at 1200×630, with its renderer sourced from `maggies-mark.svg`.
6. The pre-existing read-only icon generator check, which decodes each raster, confirms non-blank approved-fill rendering, Apple opacity, and Android maskable safe-circle bounds.

## Findings at creation

All 7 manifest icon entries resolved and matched their declared sizes. The static layout declared the same browser/Apple/PWA subset, while correctly leaving the 512×512 maskable asset manifest-only. `favicon.ico` contained valid 16×16, 32×32, and 48×48 PNG entries. The shared Open Graph/Twitter asset resolved to `public/brand/maggies-og.png` at 1200×630 and its renderer consumed the approved mark.

Required read-only gates:

```text
npm exec vitest -- run src/lib/session283.canonicalAppIconMigration.test.ts
npm run verify:brand-icons
npm run typecheck
npm exec eslint -- src/lib/session283.canonicalAppIconMigration.test.ts
git diff --check
```
