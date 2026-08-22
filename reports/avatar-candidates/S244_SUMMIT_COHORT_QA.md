# S244 Summit avatar cohort QA

Status: **PASS for independent review / NON-SHIPPING**  
Prompt pack: `avatar-prompts.json` v1.4  
Cohort: `summit` — 12 human portraits plus 3 identity-neutral symbols

## Scope

This packet completes the Grades 9–12 Summit review cohort using the independently approved `avatar-301` and `avatar-302` anchors. Every additional source was generated as a separate image from its exact v1.4 prompt. No portrait was cropped from a picker board, and no source or normalized derivative has been copied to `public/avatars` or enabled in the runtime manifest.

Review artifacts:

- `reports/avatar-candidates/s244-summit-normalized/s244-summit-contact-sheet-256.png`
- `reports/avatar-candidates/s244-summit-normalized/s244-summit-contact-sheet-512.png`
- `reports/avatar-candidates/s244-summit-normalized/normalization-manifest.json`

## Visual review

The 256 px and 512 px sheets were reviewed together. The 12 portraits read as high-school students rather than enlarged elementary characters. The set has mature facial proportions and styling, restrained expressions, distinct facial geometry, varied hair textures and presentations, glasses/head-wrap representation, and a balanced range of warm skin tones without assigning identity labels. Rendering is consistently dimensional and painterly, with restrained saturation and a warm-ivory field. No hands, text, card chrome, watermarks, duplicate faces, obvious anatomy artifacts, or unsafe crops are present after normalization.

The three neutral choices remain legible at picker size and cover complementary silhouettes: an analytical summit curve, a proof lantern, and a continuous infinity trail. Their aspect ratios intentionally differ; each stays centred with generous negative space.

Provisional cohort verdict: **PASS for independent assessor review**. Runtime release remains fail-closed until every four-band cohort passes, the full 60-asset library is exported atomically, and the independent assessor signs the exact hashes.

## Exact source hashes

| ID | SHA-256 | Provisional verdict |
|---|---|---|
| avatar-301 | `806aeebe6a18c5e895a051946ed4e8d9f3995c40365e7eaa9c4642c741122f39` | PASS anchor |
| avatar-302 | `0d6bcf9b3f56ff782a59d0b13ed6f4d2ad3f4e1ba15d677965d173db2bdf96d2` | PASS anchor |
| avatar-303 | `68a4c391ab1116ca2c2f47f7f2ebaceb47ea2f87a62157a6f7b48fc191349247` | PASS |
| avatar-304 | `e185c53b994ad4b3c7af861244f0c98af32d1b7b852b3d43c2b360d88f5490dc` | PASS |
| avatar-305 | `8965d103dc2d58a8015fbc06533a4145ec256cf1395f99b27bcdd5ffa4714930` | PASS |
| avatar-306 | `9d745faed039387319a89a7d9991882adbe973473b9a3375dbcb6ac1cdac46f7` | PASS |
| avatar-307 | `aa953a4f6e6aff60a6a51da6f59dd631ca562d140aab129939e26b1e058985da` | PASS |
| avatar-308 | `49a98b71df6661a84a68465d11390aef8d10006f92e03a4db1c5506a3ca2ad37` | PASS |
| avatar-309 | `0dcbe0ebd0c8f730c6e69dfc8c34baebd4f69c68cd7a7b75f8bbd7bc1ff7304f` | PASS |
| avatar-310 | `898ec0862c1f5f1f7a83b6b391afa560293a53832f1c0b1ff3f1bbb588deb27e` | PASS |
| avatar-311 | `e4847e9af6fbe28e7ed5db1c58856ffbdbf5c349ce4ecef15e902c1617f9eda8` | PASS |
| avatar-312 | `74e373353c5ce7234ffa26246e41cabd2584b3adbf0869af44967f1d22a9acb6` | PASS |
| avatar-402 | `ef4fdea2310bfaaba61ed49f75428c1295102aae0c33e8a62d0aaf7dd51c2b8e` | PASS |
| avatar-406 | `dcdce980ee493b7d470d3e04a0c65f255c64df0b10911ab3cfbe47ec5752ce8b` | PASS |
| avatar-407 | `839cd2a6bc9c2d39faba9522e1de4cbb117d53691e3a23768b89c81ee53fdb82` | PASS |

## Release gate

Do not enable this cohort by itself. The cohort is a quarantined review packet until the complete 60-avatar library passes exact-hash review, small/large UI review, light/dark and narrow-layout review, keyboard and screen-reader picker review, and the atomic cohort validator.
## Independent revision addendum — avatar-303

The first `avatar-303` was retained as `avatar-303-master-v1-rejected.png` because a pale matte
halo remained around the dark hair. A precise independent edit removed only that edge artifact
while retaining identity, glasses, hairstyle, expression and clothing. Independent reassessment
passed it at 512, 256 and true 48 px. It is now the canonical quarantined source; the library
remains non-shipping pending full-library approval.

- source SHA-256: `36b2f1549f9b941bbadfc301ed2580d323104ef182c8fed648bace13dc7714b2`
- 256 WebP SHA-256: `c431cc615a12f1ccabbf3ce6d9d339140a901b2b9cc98f884ab8e6962f5e89ba`
- 512 WebP SHA-256: `7c24fe354f4104534d4d2677745660f3b33a34f074bda9c775bb58cac3cd306a`
