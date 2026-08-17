# S244 grade illustration cohort — production and QA record

## Release verdict

**PASS — release all 14 grade/level illustrations atomically.** The released cohort is visually
coherent with the approved number/place-value master and structure cohort, remains legible at
80, 48 and 32 px on both light and dark app chrome, contains no words, numerals, equations,
watermarks, people or logos, and keeps each important silhouette inside the safe margin.

The first Algebra 1 generation was rejected because its cube covers contained question-mark
glyphs. It is retained only as
`reports/icon-candidates/s244-grades/grade-algebra-1-rejected-question-marks.png`; the clean
replacement is the released master.

## Generation contract

- Tool: built-in image generation, one independent call per candidate.
- Reference images:
  - `reports/icon-candidates/s244-subjects/subject-number-place-value-master.png`
  - `reports/curriculum-icons/s244-structure-contact-sheet.png`
- Exact final prompt for each record: the `styleLock` value below, a newline and `Scene: <scene>`
  from the table, then a newline and `Avoid: <negativePrompt>` below.
- No per-icon style modifier was added.

### Shared style lock

> Create one premium dimensional painterly storybook icon for Maggie's Trail, centered on a clean warm-ivory #F7F3EC square. Hand-painted finish with fine brush texture, believable soft volume, restrained detail, and gentle top-left studio lighting; dimensional but never glossy plastic or photoreal. Use deep navy #0D1B2A for visual anchors and Summit Orange #F08A24 for one focal accent, with restrained sky blue or leaf green only when mathematically useful. One strong silhouette, clear at 32 to 80 pixels, generous 12 percent safe margin, no border or app-card chrome. The whole library must look commissioned by one professional illustration team.

### Shared negative prompt

> words, letters, numerals, equations as text, labels, watermarks, signatures, logos, people, faces, hands, avatars, photographic realism, glossy 3D plastic, flat vector line art, neon colors, dark background, transparent background, drop-shadow card, phone frame, busy scenery, multiple unrelated objects, cropped object, detail touching the canvas edge

## Asset ledger

Every master is quarantined under `reports/icon-candidates/s244-grades/`. Every released file is
an opaque 512×512 WebP under `public/illustrations/icons/grades/`.

| Id | Exact scene prompt | Released path | SHA-256 |
|---|---|---|---|
| `grade-k` | A welcoming first trailhead made from three rounded counting blocks, two smooth counters, and a tiny orange summit star, playful but refined and not babyish. | `public/illustrations/icons/grades/grade-k-512.webp` | `8f9047a62eed3bb86b2a24bd3072ec5dafad0b6336f7e5cd1b1ae8fe7c91c958` |
| `grade-01` | A compact ten-frame tray with a small set of tactile counters and one first stepping stone rising beside it, suggesting the beginning of number fluency. | `public/illustrations/icons/grades/grade-01-512.webp` | `42785ac01227a2ae886f25c2c0b0249385bf577fa0d45c04e2eecb518d2b7639` |
| `grade-02` | Two bundled place-value rods crossing a short measuring ribbon, with a small analog clock disk behind them and one orange ribbon tip. | `public/illustrations/icons/grades/grade-02-512.webp` | `1e2a7fa43537d13dced51e861407489fc036eb5c785f0b52f57bdb9c2512a2ee` |
| `grade-03` | A neat multiplication array of raised tiles beside a simple fraction circle, arranged as a confident next-stage mathematical toolkit with one orange tile. | `public/illustrations/icons/grades/grade-03-512.webp` | `f5302d74a2cb1cbd3cf86e3067b994cea8e3cdc281594a8ee0c5440ddae33e8c` |
| `grade-04` | A place-value stack, a clean angle wedge, and a small drawing compass forming one coherent still life, with the compass hinge in orange. | `public/illustrations/icons/grades/grade-04-512.webp` | `ee7ff7c05eb7aeaa804c0dc14d571bf8c5ff145ff2816bb792931ccc85733780` |
| `grade-05` | A translucent decimal hundred-grid slab interlocking with two fraction ribbons and a small volume cube, with one orange fractional section. | `public/illustrations/icons/grades/grade-05-512.webp` | `289d4e846aeb9b94ebded726c97115993fb61565c73d6d56e763bf1d91682aca` |
| `grade-06` | Two ratio vessels linked by a proportion ribbon, set against a short trail that crosses from a cool negative side to a warm positive side; one orange waypoint. | `public/illustrations/icons/grades/grade-06-512.webp` | `ea3fb0be5f9fe2d999db0ac43c3b384f48f99f15900def77b9d6e287b8f0bfa6` |
| `grade-07` | A balanced proportional scale paired with a small probability spinner and a rising straight path, composed as one mature explorer's toolkit. | `public/illustrations/icons/grades/grade-07-512.webp` | `dd2c6e28a3075a52437ec60b0aa953172a75e230cb9d47ba15b3bbd157abbb0e` |
| `grade-08` | A dimensional coordinate plane ridge with two intersecting line paths and a small irrational spiral marker, using one orange intersection point. | `public/illustrations/icons/grades/grade-08-512.webp` | `8a96ce78034082c662d7d4c88b3decf67e557f84973718eb6a59de503e640fa0` |
| `grade-algebra-1` | An elegant equation balance and a straight graph path sharing one base, with covered variable cubes and a single orange solution waypoint. | `public/illustrations/icons/grades/grade-algebra-1-512.webp` | `cdf9c45842192f5ab4e57c8c16cb564034d075b995052db0e280b8bee00eb337` |
| `grade-geometry` | A precision compass, triangular solid, circle hoop, and slim proof tiles arranged like an architect's mathematical still life; orange compass hinge. | `public/illustrations/icons/grades/grade-geometry-512.webp` | `e02c189ea7d24c52c04c9533bcb6e2d8516eafe31b7b78f5e675ad330081cadc` |
| `grade-algebra-2` | A sculptural parabolic arch crossing layered polynomial tiles and a subtle exponential ribbon, with one orange turning point. | `public/illustrations/icons/grades/grade-algebra-2-512.webp` | `dada92873fa3cd08a2c481b10821617c6d8a4fd7c3194fc125ca4f9529b48fd8` |
| `grade-precalculus` | A unit-circle compass disk connected to a smooth wave trail and a slim vector arrow, with one restrained orange phase marker. | `public/illustrations/icons/grades/grade-precalculus-512.webp` | `44cee1779b0a33550f5b26e652505197c25f603504afc386ef563f0b452238ec` |
| `grade-calculus` | A refined mountain-slope curve with a tangent bridge touching one point and layered area ribbons filling the valley below; the contact point is orange. | `public/illustrations/icons/grades/grade-calculus-512.webp` | `043ed98482398dd1f0a62226d1072470f9022bbb0570ff9ce9d7beedfab44ef4` |

## Review evidence

- Dark-chrome sheet: `reports/curriculum-icons/s244-grade-contact-sheet.png`
- Light-chrome sheet: `reports/curriculum-icons/s244-grade-contact-sheet-light.png`
- Reproducible exporter/checker: `scripts/brand/build-grade-icon-assets.mjs`
- Mechanical gates: 14/14 exact 512×512 WebP; 14/14 opaque; 14/14 unique hashes;
  all canonical paths present.
- Visual gates: 14/14 recognizable without text; 14/14 readable at all three target sizes;
  matched palette, top-left light, brush texture, perspective and shadow softness; no unsafe crop;
  no near-duplicate that compromises adjacent recognition.
- Release fence: all grade rows are enabled together through the grade registry constructor;
  subject and structure release state is untouched by this cohort.
