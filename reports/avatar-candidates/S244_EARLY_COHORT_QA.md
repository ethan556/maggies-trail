# S244 Early premium avatar cohort — production QA

Status: **quarantined candidate cohort; visual-production QA passed; independent cohort assessment
and release approval remain required.** Nothing in this cohort has been copied to `public/avatars`,
added to `ENABLED_AVATAR_IDS`, or marked approved in the release manifest.

## Production record

- Cohort: Early / K–2, 12 human portraits (`001`–`012`) plus three neutral symbols (`403`–`405`).
- New work in this packet: `003`–`012`, `404`, `405`.
- Locked anchors retained unchanged: `001`, `002`, `403`.
- Prompt pack: `avatar-prompts.json` v1.4, UTF-8, zero U+FFFD replacement characters.
- Prompt-pack SHA-256: `b191a1be984eff8ea793b553285e31cd66e2e426e1e77629a1f04f61e60858f5`.
- Generation path: OpenAI built-in image generation, one independent call and one output per id.
- Source format: all 15 masters are unique, opaque 1254×1254 PNGs. No board crop,
  composite generation, cloned reference face, text, watermark, device frame, scenery, hands, or
  full-body art was used.
- Masters: `reports/avatar-candidates/s244-masters/avatar-NNN-master.png`.
- Deterministic review derivatives: `reports/avatar-candidates/s244-early-normalized/`.

## Visual verdict

The 12 human options read as children aged about 5–8, with soft child proportions and clearly
individual facial geometry. Each requested hairstyle, accessory, clothing treatment, skin-tone
direction, and expression is present. The set includes coils, curls, braids, straight and wavy hair,
glasses, a head covering, freckles, and varied presentation without identity labels or narrative
stereotyping. `009` has a visible childlike gap-toothed grin; `010` has two complete beaded braids;
`011` has round dark-rimmed glasses; `005` has a naturally draped teal head covering.

The three neutral choices are equally finished and readable at small size. `403` is the approved
trail-footprint medallion anchor. `404` contains exactly three balanced stones with only the top
stone orange and no numeral. `405` has one triangular and one circular green leaf on an orange stem.

All new candidates have dimensional painterly modelling, restrained saturation, clean warm-ivory
fields, front-left soft light, complete silhouettes, and no visible generation artifacts. The full
band remains legible on both the 512 and 256 review sheets. This is a production-review verdict,
not the independent release sign-off.

## Normalization and mechanical evidence

The review transform removed only each sampled near-ivory field, preserved the independent painted
subject, applied uniform scaling/translation without cropping or stretching, and placed it on an
exact `#F7F3EC` canvas.

- 15/15 unique source hashes; 15/15 unique normalized-master hashes.
- 15 opaque 1024×1024 normalized PNGs.
- 30 unique opaque WebP review exports: one 256 and one 512 derivative per id.
- Every WebP has the required dimensions, warm-ivory corner pixels, and source-pair MAE ≤ 12.
- Human normalized height: mean 80.5%, range 0.3 percentage points.
- Human normalized top margin: mean 14.3%, range 0.2 percentage points.
- Human normalized width: mean 66.3%, range 14.9 points, reflecting naturally different hair and
  shoulder silhouettes rather than non-uniform distortion.
- Symbol normalized width: mean 59.0%, range 5.1 points; height mean 64.2%, range 3.9 points.
- `normalization-manifest.json` records every source bound, sampled background, placement, and scale.

Review sheets:

- `reports/avatar-candidates/s244-early-normalized/s244-early-contact-sheet-512.png`
- `reports/avatar-candidates/s244-early-normalized/s244-early-contact-sheet-256.png`

The pure-Node cohort gate passed all checks above. The broader `npm run validate:avatars` command
could not start in this Windows host because Node's `os.userInfo()` currently fails with
`uv_os_get_passwd` / `ENOMEM`; this is a host/tsx startup failure, not an asset failure, and must be
rerun during integration verification.

## Exact source lock

The approved anchors match the previously recorded source hashes exactly:

- `001`: `aa04aa6624e59e942b575a7aab9aabf18f16bfc89aa97a3fff0695c561179e97`
- `002`: `ee13d56b59aa2e0bcf1da0461bb4ae3114e10fa700a81bb9cd31a76746ede2dd`
- `403`: `6b9bbe44290225aab6e3c3dd912b6100b524eb2465401c81e479b064ee34f657`

| id | source master SHA-256 | normalized master SHA-256 |
|---|---|---|
| `001` | `aa04aa6624e59e942b575a7aab9aabf18f16bfc89aa97a3fff0695c561179e97` | `3fefe1980d6a60d09601801a30e41d36d560d8fa0a02ae8ee29a99fff6269736` |
| `002` | `ee13d56b59aa2e0bcf1da0461bb4ae3114e10fa700a81bb9cd31a76746ede2dd` | `fa6430f479322366ef7b9fac80c788bd110f5e8d713a0bcb0a438b604eb21c0c` |
| `003` | `942fa1dcb738612c843126d4cf7ce94cf312d5d925d0723e44f7757a901d7301` | `adcea70d05dff2a1f759fb39e8ded0b6dc52e6d784cd2f0def22ae5babf3da1b` |
| `004` | `59e35044993f2665a3729d969deceb7092b14226e71a2f37323c6cf656a02cbd` | `1823d90e556d770850ba7cb94b4c0d1b658927ac7d7ba5282cc34302ddb17686` |
| `005` | `7c846b73ec7740154d066c28cbf00ed711ae8e0bca9faead42f54f87428a1a2f` | `5b05f1b00a8dd1851d418e4f344e62b188d1faf88c5f29e6758f0aa46341a926` |
| `006` | `1f1dedcb3ad112c0dbeeb8bf5ffaf01e2101b6acf3efe31027cbc84598a1da7f` | `18e8e4c6d3ebeec76d147d412b945e5dc2617c971b18e886a4c1f576c391671f` |
| `007` | `a078fbb63b15d32621deb5db504c10238b1670d562c8dec5b1bd3fa0b771c2a0` | `bee15f40ef6a9111c243b7221cea556f924e1953ca776d9722fd8c7431581868` |
| `008` | `616852c82fd1ad594eb86a225e9d44e0973a4da83baac8248e8d60e4204724c7` | `65c913176ba88993f72b0b693aa5888e34e6443ca7f71261808e74895c08a465` |
| `009` | `2a672123179310e4b60d777c8c20447ac0c6db0ac8c929db88421571f78773ac` | `4c90c504b156f4a02d8bb07c330536282e107959643eeedd7ca51bcf11d8892e` |
| `010` | `41128dfb00c0265de7d4be07f85f364f91e12a8e2c41b4d98e021a97a59c9c8d` | `41cfdf2b850e1422f463324fd8e3ef7c6cf16b668ba29693d1cf2a0ed22fe50a` |
| `011` | `bc6b48466b6b0d35c04e91b9c88bfa9c71f70f1786b41cb42975e24037629656` | `59695a95f79609af9d75de086eeb2deb313f96034938a39b0cbb6c1ff1691658` |
| `012` | `ec53e485cb0caa12f7ff78a558eb6bc2ece1a16cd877dfd88f7d73bb100e0de3` | `2d98abfc8d8f501c49c793da6359738caa9c40f6c1646b8364da84f9c9d79de3` |
| `403` | `6b9bbe44290225aab6e3c3dd912b6100b524eb2465401c81e479b064ee34f657` | `213894894b6d1f7562feccd884b7ca9a971aa412735e370784a7127f742947a3` |
| `404` | `12ce505d3c16a9f2f336236e1edc0feec858a683c7a2e3d506323ea23ec87b64` | `19bd97fd29a49567cca014e27be643030d8763ba88d405626cc4c0db2c4bbb2a` |
| `405` | `a81369707b60be1e24e50cbb0c5b6103e8889a87d73006db0e498573bf9c322a` | `6f7c0821f56f30c3e21d473cfe178368f39ff7e2099e801e966d234f05d5e362` |

## Release boundary

An independent assessor must approve the exact 15 source hashes and both contact sheets before any
runtime copy, manifest status change, or atomic Early-band enablement. Until then, the existing app
fallback remains the only learner-facing avatar behavior for this band.
