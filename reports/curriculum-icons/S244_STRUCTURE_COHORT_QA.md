# S244 premium structure-icon cohort — generation and QA record

Date: 2026-08-17  
Generator: OpenAI built-in `image_gen` tool, one independent generation call per asset  
Release state: **approved and enabled as one coherent five-asset cohort**

## Exact prompt assembly

Each asset used the production prompt verbatim in this order:

```text
Create one premium dimensional painterly storybook icon for Maggie's Trail, centered on a clean warm-ivory #F7F3EC square. Hand-painted finish with fine brush texture, believable soft volume, restrained detail, and gentle top-left studio lighting; dimensional but never glossy plastic or photoreal. Use deep navy #0D1B2A for visual anchors and Summit Orange #F08A24 for one focal accent, with restrained sky blue or leaf green only when mathematically useful. One strong silhouette, clear at 32 to 80 pixels, generous 12 percent safe margin, no border or app-card chrome. The whole library must look commissioned by one professional illustration team.
Scene: <asset scene below>
Avoid: words, letters, numerals, equations as text, labels, watermarks, signatures, logos, people, faces, hands, avatars, photographic realism, glossy 3D plastic, flat vector line art, neon colors, dark background, transparent background, drop-shadow card, phone frame, busy scenery, multiple unrelated objects, cropped object, detail touching the canvas edge
```

The authoritative machine-readable prompt pack remains
[`curriculum-icon-prompts.json`](../../curriculum-icon-prompts.json).

## Asset provenance

| Semantic id | Exact scene prompt | Quarantined master | Released 512 WebP | SHA-256 |
|---|---|---|---|---|
| `structure-course-trail` | A folded miniature trail map with one continuous winding navy route climbing toward a small orange summit star, no labels or legend text. | `reports/curriculum-icons/s244-masters/structure-course-trail-master.png` | `public/illustrations/icons/structure/structure-course-trail-512.webp` | `ed74f91b89c94553c36e1e55c436fb6dea6111dfcf14730c48d32caa27638b29` |
| `structure-chapter-landmark` | A carefully stacked stone cairn on a small painted terrain base, with one subtle orange trail marker tucked between two stones. | `reports/curriculum-icons/s244-masters/structure-chapter-landmark-master.png` | `public/illustrations/icons/structure/structure-chapter-landmark-512.webp` | `30ee535bf694de6481cf80180028318261b78b51840186638dd76e602a1a7ed5` |
| `structure-lesson-waypoint` | A single premium trail waypoint pin made of painted enamel and wood, its center holding a small orange dot and its base casting a restrained soft contact shadow. | `reports/curriculum-icons/s244-masters/structure-lesson-waypoint-master.png` | `public/illustrations/icons/structure/structure-lesson-waypoint-512.webp` | `56dfb9dbac93fa91d81356d374faad4f8226d3830e9781cb371dae242ad87ee5` |
| `structure-practice-clearing` | A small circular practice clearing with a rolled learning mat, three counters, and a short repeat-loop path, with one orange counter as the focus. | `reports/curriculum-icons/s244-masters/structure-practice-clearing-master.png` | `public/illustrations/icons/structure/structure-practice-clearing-512.webp` | `828715fae3b38f7e705e4ea32ae51898094c552f56165f474ce5ec9e8518e44a` |
| `structure-assessment-summit` | A compact navy mountain summit with a planted orange flag and a clean upward trail, conveying a mastery checkpoint rather than competition. | `reports/curriculum-icons/s244-masters/structure-assessment-summit-master.png` | `public/illustrations/icons/structure/structure-assessment-summit-512.webp` | `cd7dd28677c5892738dc1a012635b47e4a3af6368cc8f0dd61d59d7b59383bd1` |

The original generator outputs remain in the Codex generated-image store. The project masters above are the durable, pre-export source of record; they are intentionally outside `public/` until reviewed.

## Contact-sheet decision

The cohort was reviewed together at its actual 80 px, 48 px, and 32 px render sizes, plus a nearest-neighbour 4× enlargement of the 32 px downsample:

[`s244-structure-contact-sheet.png`](./s244-structure-contact-sheet.png)

Release checks:

- coherent warm-ivory ground, painterly brush treatment, top-left lighting, Deep Navy anchors, and one Summit Orange focus;
- one readable silhouette at every supported interface size;
- no words, numerals, logos, people, faces, borders, or app-card chrome;
- adequate perimeter safety at 32 px;
- the practice clearing remains a recognisable loop/counter vignette after downsampling despite having the richest environmental detail;
- the five exports are distinct, opaque, exact 512 × 512 WebPs.

## Reproduction and verification

Run:

```powershell
node scripts/brand/build-curriculum-icon-assets.mjs
node scripts/brand/build-curriculum-icon-assets.mjs --check
```

The first command derives production WebPs and the contact sheet from the quarantined masters. The second verifies release dimensions, format, opacity, presence, and byte-level uniqueness without rewriting assets.
