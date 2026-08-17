# /public/avatars

Populated **only** by individually re-rendered production art produced to
`AVATAR_ART_PRODUCTION_SPEC.md` — never by crops of `design-reference/ws-j-avatar-board-*.png`.
Board crops are prohibited as shipped assets, full stop (`OPTIMIZATION_PLAN_V3.md:141`).

Expected filenames follow `avatar-<NNN>-<256|512>.webp`, where `<NNN>` is a 3-digit id allocated
in per-band blocks (`001`–`012` early, `101`–`112` explorer, `201`–`212` adventurer, `301`–`312`
summit, `401`–`412` neutral/symbolic) — see `AVATAR_ART_PRODUCTION_SPEC.md` §5 for the full table
and `src/lib/avatars.ts` for the manifest and the code that derives these paths from an id.

S243 produced four independent art-direction candidates, but none is released here: independent
review rejected inconsistent framing and the incomplete one-choice-per-band picker. Candidate
exports are retained under `reports/avatar-candidates/s243-precanary/`. The production directory
therefore still contains only `placeholder-neutral.svg`, an explicitly labeled fallback that must
never become selectable. `scripts/brand/validate-avatar-assets.ts` fails closed on unapproved,
orphaned, malformed, duplicate, or incomplete production assets.
