# S244 premium subject-icon cohort — generation and QA

Date: 2026-08-17  
Generator: OpenAI built-in `image_gen`, one independent generation per semantic asset  
Release state: **approved and enabled as one coherent 12-asset cohort**

## Scope and provenance

The authoritative prompts, labels, categories, and release paths are in
[`curriculum-icon-prompts.json`](../../curriculum-icon-prompts.json). Every asset used the shared
`styleLock`, its own `scene`, and the shared `negativePrompt`; the generated PNG masters remain in
[`s244-subjects/`](./s244-subjects/) outside the runtime asset tree.

Production files are opaque 512 × 512 WebPs in
`public/illustrations/icons/subjects/`. They are derived and verified by
`scripts/brand/build-subject-icon-assets.mjs`.

| Semantic id | SHA-256 |
|---|---|
| `subject-number-place-value` | `24daddbb65efa146c6e239adae684f82f0eaa302f4ebbbba92106f020b4b23b9` |
| `subject-operations` | `2cde274a884e5a1fb98c1fff1aaa5635303a7126020b84289f366668823ec086` |
| `subject-fractions-ratios` | `3cc026721a1f098a3999a0999dfa26d981b53acded03249a44e1d857b2bd2501` |
| `subject-measurement` | `4025fcdc224ac71a6183d5eb27437dc9b7e5bd6ec4bd070bfdbc945ae43f8c88` |
| `subject-time` | `2f96b333e9d133d1a52fcf495578138da262d0ac022fa0c513c0a95ee23f4849` |
| `subject-geometry-shapes` | `59b3e570a00688c76b008abbf3e79cd212f2dd1e732e1d0d3761435c617cba31` |
| `subject-angles-construction` | `0462f0764653e0ec4195874194662cb8286c873e747a8a278e2c28716267a8f8` |
| `subject-algebra-equations` | `b99b1b88862860615a3c8776db94f23bdef00c008b84b61d16e64b7e31e7b583` |
| `subject-functions-graphs` | `a681990c57645ea1db73612bbea61baa713bc94852213a19c80df54ece13fb8d` |
| `subject-statistics-data` | `52d6f7dd4b162ce6dcace1ea3800f36833cca326763781fc8441041c33b1f4b8` |
| `subject-probability-chance` | `a1ba3af5e558850697b6f758b3191707d190f1f8048cc02813bbf53c07cba324` |
| `subject-calculus-change` | `02d98b1b6db32e5fa0cfe2cc4c279a1e4b1d7bc40a7effe99c31c9269e468889` |

## Contact-sheet verdict

[`s244-subjects-contact-sheet.png`](./s244-subjects-contact-sheet.png) reviews every icon at its
actual 80 px, 48 px, and 32 px size plus a nearest-neighbour enlargement of the 32 px result.

The cohort passes:

- consistent warm-ivory ground, painterly material treatment, top-left lighting, deep-navy anchors,
  and restrained summit-orange emphasis;
- distinct semantic silhouettes at all supported UI sizes;
- no words, numerals, equations, people, faces, app-card chrome, or misleading decorative logos;
- exact opaque WebP format, dimensions, presence, and byte-level uniqueness;
- coherent coverage of the 12 subject families used to classify all 129 courses.

The underlying mathematical surfaces inside lessons remain SVG/widget-driven and value-synchronised;
these painterly assets are navigation and curriculum-wayfinding art, not substitutes for instructional
diagrams.
