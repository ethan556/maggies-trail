# /public/avatars

Populated **only** by individually re-rendered production art produced to
`AVATAR_ART_PRODUCTION_SPEC.md` — never by crops of `design-reference/ws-j-avatar-board-*.png`.
Board crops are prohibited as shipped assets, full stop (`OPTIMIZATION_PLAN_V3.md:141`).

Expected filenames follow `avatar-<NNN>-<256|512>.webp`, where `<NNN>` is a 3-digit id allocated
in per-band blocks (`001`–`012` early, `101`–`112` explorer, `201`–`212` adventurer, `301`–`312`
summit, `401`–`412` neutral/symbolic) — see `AVATAR_ART_PRODUCTION_SPEC.md` §5 for the full table
and `src/lib/avatars.ts` for the manifest and the code that derives these paths from an id.

S243's four art-direction candidates were rejected. S244 then produced and independently approved
the complete 60-item library; its exact 120 reviewed WebP exports are released here atomically.
`placeholder-neutral.svg` remains an explicitly labeled fallback for absent or invalid stored ids.
`scripts/brand/validate-avatar-assets.ts` fails closed on unapproved, orphaned, malformed,
duplicate, or incomplete production assets.

V4 adds an atomic cohort contract in `avatar-production-cohorts.json` and the operating procedure in
`AVATAR_V4_PRODUCTION_RUNBOOK.md`. The release unit is the complete 60-item library. Use
`npm run build:avatars -- --confirm-reviewed avatar-NNN ...` only for reviewed exports; then approve
all four cohorts and enable all 60 ids in one reviewable change. The validator rejects a partial
library, an incomplete 256/512 pair, duplicate pixels, wrong dimensions, unsafe framing, or a
production file without a matching enabled manifest entry.
