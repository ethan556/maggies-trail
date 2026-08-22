# Premium curriculum icons

Production paths are governed by `src/lib/curriculumIcons.ts` and
`curriculum-icon-prompts.json`. Subdirectories are `subjects/`, `grades/`, and `structure/`.

Do not place placeholders at a declared `*-512.webp` path. A file at that path means the icon has
passed the production and contact-sheet gates in `CURRICULUM_ICON_ART_PRODUCTION_SPEC.md`; only
then may its runtime registry entry become `enabled: true`.

The five `structure/` assets are the first released cohort. Their exact generation provenance,
hashes, and 32/48/80 px contact-sheet decision are recorded in
`reports/curriculum-icons/S244_STRUCTURE_COHORT_QA.md`. Verify them without rewriting files with:

```powershell
node scripts/brand/build-curriculum-icon-assets.mjs --check
```

The `subjects/` and `grades/` directories remain fenced until their own matched cohorts pass the
same review.
