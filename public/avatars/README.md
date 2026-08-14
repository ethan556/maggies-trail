# /public/avatars

Populated **only** by individually re-rendered production art produced to
`AVATAR_ART_PRODUCTION_SPEC.md` — never by crops of `design-reference/ws-j-avatar-board-*.png`.
Board crops are prohibited as shipped assets, full stop (`OPTIMIZATION_PLAN_V3.md:141`).

Expected filenames follow `avatar-<NNN>-<256|512>.webp`, where `<NNN>` is a 3-digit id allocated
in per-band blocks (`001`–`012` early, `101`–`112` explorer, `201`–`212` adventurer, `301`–`312`
summit, `401`–`412` neutral/symbolic) — see `AVATAR_ART_PRODUCTION_SPEC.md` §5 for the full table
and `src/lib/avatars.ts` for the manifest and the code that derives these paths from an id.

**Production art landed 2026-08-14.** All 120 WebP files (60 avatars x 2 sizes) are here. They are
generated, never hand-placed: `node scripts/build-avatar-assets.mjs` downsamples them from the
1024x1024 masters in `art/avatar-masters/`, then decodes every output back off disk to prove it is
a real image at its declared size. `src/lib/avatars.test.ts` re-checks all 120 on every test run,
so an entry that is `enabled: true` in the manifest can never be backed by nothing.

`placeholder-neutral.svg` also remains: an explicitly labeled dev-only fallback — see the comment
inside that file — shown before a learner has chosen or when a stored id no longer resolves. It is
not, and must never become, a selectable avatar.
