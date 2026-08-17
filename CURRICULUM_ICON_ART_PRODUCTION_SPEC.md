# Curriculum icon art production spec

## Purpose and honest status

This is the commissioning contract for the premium painterly curriculum-icon layer. The runtime
registry is `src/lib/curriculumIcons.ts`; the exact prompt recipe and every asset scene are in
`curriculum-icon-prompts.json`.

The taxonomy is intentionally finite: **12 subject families, 14 grade/level markers, and five
structural waymarks**. Those 31 assets can cover 129 courses and more than 1,700 lessons coherently.
Creating a unique generated picture for every lesson would weaken consistency, make contact-sheet
review impractical, and encode fragile title-to-image relationships.

An entry with `enabled: false` is not production art. The app renders a dimensional code-native
fallback and marks it `data-art-status="code-native-fallback"`. Nothing should flip to
`enabled: true` until the declared WebP exists and passes the gates below.

## Exact prompt construction

For every record in `curriculum-icon-prompts.json`, the generation prompt is exactly:

1. the JSON `styleLock` value;
2. a newline and `Scene: ` followed by that record's `scene` value;
3. a newline and `Avoid: ` followed by the JSON `negativePrompt` value.

Do not silently add a style modifier to one asset. If the shared direction changes, increment the
prompt-pack version and re-review the entire contact sheet.

## Canvas and export

- Generate a square master at 1024×1024 or larger.
- The object stays within a 12% safe margin and remains readable at 32, 40, 48, 64 and 80 px.
- Export one opaque, full-background, 512×512 WebP to the exact declared path.
- Do not add a 256px derivative: the app serves these small files unoptimized and lets the browser
  downsample them; a second variant would double the manifest and drift risk for negligible gain.
- Background corners must remain in the Warm Ivory `#F7F3EC` family. No alpha.

## Contact-sheet gates

Review each new candidate beside every already-enabled icon at 32, 48 and 80 px in both light and
dark app chrome. Reject an icon that fails any of these:

1. one clear silhouette and one focal orange accent;
2. matched top-left light, brush texture, saturation, perspective and shadow softness;
3. no embedded words, pseudo-letters, malformed numerals, equations, logos or watermarks;
4. no face, hand, avatar, phone frame, border card or busy background;
5. subject meaning remains recognizable without relying on color alone;
6. no important detail outside the safe margin;
7. no near-duplicate within its category;
8. one professional illustration-team test: the candidate does not look generated beside the set.

## Integration and accessibility

`CurriculumIcon` is decorative by default because every current use sits beside a visible course,
grade, chapter or lesson name. A future standalone use must pass `title`, which moves the semantic
name to the wrapper while keeping the internal WebP alt empty to avoid duplicate announcements.
Forced-colors mode intentionally falls back to the code-native silhouette and border treatment;
meaning never depends on painterly shading.

The app mark is not part of this raster library. Favicons, PWA tiles, the navigation lockup and the
trademark remain code-native SVG so they stay crisp, safe-circle-correct and legible at 16 px.

