# S244 premium avatar V4 — Explorer cohort QA

Status: **producer QA PASS after three targeted revisions; complete 15-option cohort remains
quarantined and non-shipping; independent assessor approval is still required before release.**

The reviewed release unit is exactly:

`avatar-101`–`avatar-112`, `avatar-408`, `avatar-409`, `avatar-411`.

No candidate from this cohort was copied to `public/avatars`, no manifest entry was enabled, and
no contact-sheet crop was used as source art. `avatar-101` and `avatar-102` are the exact approved
S244 canary anchors. Every other canonical master is a separate built-in image-generation call for
one id only.

## Cohort verdict

All 12 portraits read as upper-elementary learners, approximately 9–11 years old, rather than
scaled-down teenagers or enlarged Early-band children. Their facial geometry, hair, clothing,
glasses/head covering, and expressions vary independently. The locked production directions are
balanced at three portraits in each of the four painterly skin-tone directions; none of that art
direction becomes runtime identity data or an accessibility label.

The final 256 px and 512 px contact sheets read as one dimensional painterly library. Background,
lighting, saturation, shoulder treatment, sharpness, and safe margins are coherent with the two
approved anchors. The 48 px display sheet confirms that every portrait remains recognizable and
that all three neutral alternatives remain distinct.

Three first attempts were rejected rather than normalized into the final cohort:

- `avatar-408` v1 was a wide landscape bridge and became too small at picker scale. The final
  bridge uses a compact, foreshortened view while preserving equal, visible planks.
- `avatar-409` v1 was a wide horizontal ridge and became too small at picker scale. The final mark
  uses a compact diagonal rhythm of distinct peaks.
- `avatar-411` v1 interpreted “axes” as hatchets. The final mark contains only mathematical
  Cartesian x/y axes, an orange origin, and a navy needle pointing into the upper-right quadrant.

## Evidence locations

- Canonical and rejected sources: `reports/avatar-candidates/s244-explorer-masters/`
- Normalized masters and quarantined 256/512 WebPs:
  `reports/avatar-candidates/s244-explorer-normalized/`
- Labeled 256 sheet:
  `reports/avatar-candidates/s244-explorer-normalized/s244-explorer-contact-sheet-256.png`
- Labeled 512 sheet:
  `reports/avatar-candidates/s244-explorer-normalized/s244-explorer-contact-sheet-512.png`
- True 48 px display sheet:
  `reports/avatar-candidates/s244-explorer-normalized/s244-explorer-small-display-48.png`
- Normalization record:
  `reports/avatar-candidates/s244-explorer-normalized/normalization-manifest.json`

## Exact prompt lock

Prompt-pack version: **1.4**.

- `avatar-prompts.json` SHA-256:
  `b191a1be984eff8ea793b553285e31cd66e2e426e1e77629a1f04f61e60858f5`
- `AVATAR_PROMPT_PACK.md` SHA-256:
  `a74dc848d234c59481faa003e3817de0ec5cc6a1064592922873bf1c99d39dae`

For every id, the byte-exact locked base prompt is the `prompt` string in that id's record in the
hashed `avatar-prompts.json`; the byte-exact negative is the same record's `negative_prompt`.
Nothing in either locked field was edited. The final tool request is reconstructed exactly by the
templates below. Blank lines shown in each fenced block are two LF characters.

### Standard final request — `avatar-103` through `avatar-112`

```text
{prompt}

Avoid: {negative_prompt}. Produce exactly one independent source image for this avatar only. No text or labels anywhere in the image.
```

### Final `avatar-408` request

```text
{prompt}

Critical composition: make the bridge a compact, near-square emblem rather than a wide landscape. Use a shallow three-quarter or gently foreshortened view so the complete rope bridge rises vertically through the frame; both end posts remain visible, and every evenly spaced plank remains clear as an equal part. Keep the bridge silhouette no wider than it is tall and make it occupy about 60% of frame height.

Avoid: {negative_prompt}, wide landscape silhouette, long horizontal banner. Produce exactly one independent source image for this avatar only. No text or labels anywhere in the image.
```

### Final `avatar-409` request

```text
{prompt}

Critical composition: make the repeating peaks a compact, near-square ascending cluster, not a long horizontal ridgeline. Arrange the separate repeating peaks diagonally from lower-left to upper-right in a steady rhythm, overlapping slightly in depth while staying individually legible. Keep the overall silhouette no wider than it is tall and make it occupy about 60% of frame height; only the tallest peak has the summit-orange tip.

Avoid: {negative_prompt}, wide landscape silhouette, long horizontal banner. Produce exactly one independent source image for this avatar only. No text or labels anywhere in the image.
```

### Final `avatar-411` request

```text
{prompt}

Critical semantic clarification: on the compass face, show a simple mathematical Cartesian coordinate plane: one clean horizontal x-axis line crossing one clean vertical y-axis line at the summit-orange origin point. These are geometry/graph lines, never physical axes, hatchets, weapons, tools, handles, or blades. The single deep-navy compass needle points into the upper-right quadrant. Keep the graphic simple and legible at 32 pixels.

Avoid: {negative_prompt}, physical axe, hatchet, weapon, blade, tool. Produce exactly one independent source image for this avatar only. No text or labels anywhere in the image.
```

`avatar-101` and `avatar-102` were not regenerated. Their exact canary source hashes below are the
approved prompt/output anchors; their locked v1.4 base-prompt hashes are included for parity.

| id | locked base-prompt SHA-256 | final effective-request SHA-256 |
|---|---|---|
| avatar-101 | `28b4bf4b02abc42269879fbf0d642fa6c140c6fb93e4c8206b3bc398ebe386eb` | approved canary anchor; unchanged |
| avatar-102 | `0d4150a8e2a6f048a69282497e62e6e9b5f8155867bdd0ab3155850b2ce0188f` | approved canary anchor; unchanged |
| avatar-103 | `6387e2c6303c1c16292f5ed91752e6043140a72f80e47678937dc92095a7fa78` | `36370b5cd1b150385efcbc487c3ea0cdc64049536f48490db410cc74585e2ec7` |
| avatar-104 | `5fd0363c5dcff2a4143c83511ff3aeb632ca6539e73f5768e8b4e8810428ccd9` | `4d8a2bd08711bb3ce3cf9de79b5d43f8b9a8da4202857e2be826e53dc6ece16a` |
| avatar-105 | `352e99529fb9bfd64d69160fd07dbcb270a3b98ccad16707b3b627d5604626af` | `4c97981962471159d2a7db10a0c014a3d8e729954096f5db57698a8a831c804e` |
| avatar-106 | `a4a98c01d8953d195228baa900b50e6542392bc4eee713ba61196f637fc59789` | `01c314fba6c675ca70782d3a90c3ee901da81dea19ea8ac531a83be1e30a7ca7` |
| avatar-107 | `8363167a2a0d6c2f5419e749183d1f6cb2133e551f6b3715bcb671cbc9be41db` | `9e1647d6d68491847f6f76ed4223d00a3a1fc0036f42886fb41cdc06253c6c49` |
| avatar-108 | `124a08d3436834c205adc88236d26cb3f1ed5c716ce2da945f90c1e728afb403` | `6e5bd849f59f06e7425351e5852c86037d64fbf8ae495641e45e0fa93c7d7b0e` |
| avatar-109 | `6133aa7c2b609fc267a21b0c8b5b3cd58f09084ef615ed74e993679ab3b529c2` | `513353f3ea4fd0b01b2ca96acd3dad1fc2e9bbfc2adfd92fe0f1acaeed13563b` |
| avatar-110 | `95062670c2d673fe2d13d2dae8f673f0401a6109648101ba7cb1e80c5e58fada` | `021b64192d2cc33098ee831a155e0cbe06410ff8b8d2f4ff745403e9b5b3c41b` |
| avatar-111 | `0185db3a6a836899eb0a0492a12aae3bce6805a86f6c16bdc190fe5b74e73ff1` | `3874c332912d86cd2309842c032c155f2381956845e7bf584c1a75b4864b835e` |
| avatar-112 | `00e1b3f9ad6d4bd0c01697437f5317e927112b5262fa911c4091b55d7edc1f35` | `9ce99ca3f891436b1f6082dbb34578105f435dfdac64065a7a1b875b25812748` |
| avatar-408 | `352b45145810bdba485f1830a2f862e9dcce4b9970240f43b7c3eb2e637e5a96` | `d6eed89b7b9264a6ed1c95883d272376ed4bee4bf0014300ad68ee8db8a1727f` |
| avatar-409 | `abcb361be587073092b6d418c89d54004be06f91b67dac1beb4b04ea2cab140d` | `1d980fdf7643e6b9fd2944f24a771e24aede602f22ce3f21b6b88122879cbc92` |
| avatar-411 | `8da38ce2dae4ad75d754ac987f4bb9e67eae2c46c83286651ddd285d08c74636` | `1dea99355248708c5a3a59700f2682ad15d0ebc4bb077b4a1407e744f6aee196` |

## Per-id visual QA and source hash lock

| id | prompt/trait result | producer verdict | canonical source SHA-256 | normalized master SHA-256 |
|---|---|---|---|---|
| avatar-101 | Canary anchor: twists/coils, blue striped track jacket; clear 9–11 read | PASS | `0fa0e113d5ca049042bee63d3931fe16b82e647e12666b3cddc2502367261bcf` | `7fce17bda83f9da44b77a10178cbb2dd2c3128b25908b4e4ada0fa7e8592155f` |
| avatar-102 | Canary anchor: centred bob, studs, lilac cardigan and cream collar | PASS | `54c0d91fbb8d8dd8ecabe1b0feda8a2ec306ed75ec6f1896c3a9e52f4ecdba0b` | `aa2b677fd3cb13f990ce112e6c6d92e4fb33fe62f0f127c752302811584adbc8` |
| avatar-103 | Short wavy black hair, soft smile, forest crewneck and cream tee | PASS | `78ec20e472ffb61467da9561b67ec37934de686824d2137e9be51d058b26b394` | `df31c9f216a8db045114d1dd0fa51295a88f35f959949fe9048963c0a1d1f7c9` |
| avatar-104 | Long wavy brown hair, hoops, denim jacket and cream top | PASS | `f436c3db6bc2452aecd4bc3bdbc700b24fccdd7ee65c56401027b209d527c865` | `ba3e9efbd545c78f75fb70e91285e6f903f41af96501f3a44ebed761fdfe5881` |
| avatar-105 | Rounded high puff and patterned band, grin, blue hoodie and striped tee | PASS | `cce9105dbdb07a948498f9cacf7c9301d50bf96e9db15f7fef99e6a1df4aaaa9` | `53ef2f76f1afbb7da2bbd3675b000a636aff971d8bbc37bd5a8b31bf8843187a` |
| avatar-106 | Box-braid pigtails, round wire glasses, yellow raglan and chambray | PASS | `eb36d3c9f82f61197ddc57f9a1d85ae41a054eeed9179bee4042b7a6609d3f1a` | `70750fb7367bd120bbef08d7d0a111333ca010ad6e48848fe058c4eb3d09fcd2` |
| avatar-107 | Teal/cream head wrap, loose temple strands, studs, sage quarter zip | PASS | `8cf31718a0552e8d7e9f3f1af24863621292b87e1abc2d4270e27f5c6ded1b3d` | `2fb53002ed2f33c18478b99b8a9e40c5dd231a119e0f7447888bc34667938867` |
| avatar-108 | Close coils with sharp side part, grin, teal track jacket and cream trim | PASS | `5763df55853f82c213330d2234c7196a78736c68fd7a180565cfb8650956e675` | `bb279f4e7a8abd0637c7e25b17a6efe04537671e34923525c788b825a9cd3cb8` |
| avatar-109 | High ponytail and bright scrunchie, freckles, lilac hoodie | PASS | `79c6f501653604c075ae7c49b26b4e1b455fc5b1e47815e82e0d24f0b56fe463` | `0a301784260ab73ee60b8ababa1af5ed92df7961b928e0584d7cb86899dbb941` |
| avatar-110 | Deep side-part waves, thin round glasses, rust bomber and cream tee | PASS | `900d6b530922d09a7bf8fe168cdc974da2b6b99968d4b79a90447a60e7e17b83` | `9f6a54b7ca05329b438ea07bf85664e88792176fe176fbe7b9c19f50b39041f2` |
| avatar-111 | Chin-length curly bob, silver hoops, forest cardigan and striped tee | PASS | `b623a395f71827a0c190fcf35445350595feb7101237ace5ca4344d916d23188` | `86717579ee396338dbee610c17afb800f9dc3214c27485eab7279e5252998d56` |
| avatar-112 | Short coils, faded part and single braid accent, denim and yellow tee | PASS | `9e1f03ddb9ea1bd5302753f3aa54f47b6afa0366890e42f441b3eb80a0ac62db` | `8d56421863b134ed81971bbb892d4d5aa13615cbe0fd35d52c3b9383a60379a3` |
| avatar-408 | Compact foreshortened rope bridge with evenly visible planks | REVISE v1 → PASS v2 | `1f1ee2d64fb8943f55044112ee542b23232e7a4a7ff0995523e60b3c21eff1d5` | `bbdad7889f51f3081307ffccf91990298d5be6c2f1205df7d14cdf1ea4af6087` |
| avatar-409 | Compact diagonal rhythm of navy peaks; orange only on tallest tip | REVISE v1 → PASS v2 | `3bd71fec95a382c61dffb035accd247fb8ec2b85397a7793f1dceb7ba933e160` | `a56b60276514ccd5b1788173fe212ec0ba5185ec5a5ad9eee32c35a72b40d64b` |
| avatar-411 | Cartesian x/y axes, orange origin, navy upper-right needle; no tools | REVISE v1 → PASS v2 | `9ebc2b7ea3d72055ba0846e53699dd84189109b8d87d38740b6f601c12f240b3` | `1ca8ef96b8efefa6b3a12efb7641f0c96c953ae9e10c6d149222553fece41c86` |

Rejected-source audit trail:

| rejected file | reason | SHA-256 |
|---|---|---|
| `avatar-408-master-v1-rejected.png` | Wide source normalized to only 31.3% height | `9a8821bdf709b98d061e3aa70565998f67476b15b06e899ee8e94bf2b78ab734` |
| `avatar-409-master-v1-rejected.png` | Wide source normalized to only 40.1% height | `a1b67dd25e5f49e3d514c62754a6c484a232c22172c68349a091e63d5c29c383` |
| `avatar-411-master-v1-rejected.png` | Semantic failure: rendered two hatchets | `e7258697d1dae65fb86812641bdbdd168b5a7aae832e0caba2a23c4c6df7a46b` |

## Mechanical measurements

All 15 source files are unique opaque PNGs at least 1024×1024. All normalized masters are unique,
opaque 1024×1024 PNGs. All 30 quarantined WebPs are unique, correctly paired, opaque, and exactly
256×256 or 512×512. Every output corner is the exact normalized warm ivory RGB `(247,243,236)`.

| group | count | mean top margin | top-margin range | mean width | width range | mean height | height range |
|---|---:|---:|---:|---:|---:|---:|---:|
| Explorer portraits | 12 | 15.0% | 4.1 pp | 70.2% | 11.4 pp | 80.0% | 4.4 pp |
| Neutral symbols | 3 | 17.4% | 0.2 pp | 52.5% | 15.4 pp | 65.4% | 0.2 pp |

The portrait width range reflects real hairstyle and shoulder-silhouette differences; every human
remains inside the locked 75% safe width and retains approximately 5% clean space below the bust.
The symbol width range is intentional aspect-ratio variation; the height is virtually identical
across the bridge, peak cluster, and compass.

## Validation record

- Scoped quarantine validator: **PASS** — 15 unique sources, 15 opaque normalized masters, 30
  unique WebPs with warm-ivory corners, exact contact sheets, `releaseEligible=false`, and no file
  leakage into `public/avatars`.
- `node scripts/brand/measure-avatar-canary-s244.mjs
  reports/avatar-candidates/s244-explorer-normalized`: **PASS** — 15 files and 15 unique hashes.
- `npx vitest run src/lib/avatarAssets.test.ts src/lib/avatars.test.ts
  src/components/AvatarPicker.test.tsx`: **PASS**, 3 files / 31 tests. This includes the full
  production-asset validator through `avatarAssets.test.ts`.
- Direct `npm run validate:avatars` could not start because this Windows host's `tsx` launcher
  returned `uv_os_get_passwd ENOMEM`; the same validator module executed successfully through
  Vitest, so this is recorded as an environment-launcher issue rather than an asset failure.

## Release boundary

This producer verdict authorizes **independent review only**. It does not authorize publishing or
enabling the band. An independent assessor must review the exact source hashes and both labeled
contact sheets, including the 48 px display result, before all 15 ids may be approved atomically.

