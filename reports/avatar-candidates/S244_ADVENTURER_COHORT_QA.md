# S244 Grades 6–8 Adventurer avatar cohort — author QA

**Status:** AUTHOR QA PASS — QUARANTINE ONLY  
**Release eligibility:** `false`  
**Independent assessment:** required before any manifest change, public copy, or runtime enablement  
**Cohort:** `avatar-201`–`avatar-212`, `avatar-401`, `avatar-410`, and `avatar-412`  
**Final count:** 15 masters: 12 human Adventurers and 3 neutral alternatives

## Outcome

The complete Grades 6–8 Adventurer cohort is present in the quarantine candidate area. The three approved anchors (`avatar-201`, `avatar-202`, and `avatar-401`) were retained. Every other member (`avatar-203`–`avatar-212`, `avatar-410`, and `avatar-412`) was produced as its own independent source with built-in image generation; none was cropped from a board or reused from another avatar.

All 15 final sources pass author visual review for the locked premium dimensional painterly style, Grades 6–8 age truth, warm-ivory background, bust framing, individual prompt traits, and cohort coherence. Normalized masters, 256 px and 512 px WebP derivatives, and labeled contact sheets were produced only after the normalizer label fix was present.

Nothing from this cohort was copied to `public/`, added to shared release assets, enabled in the runtime, or written into the shared avatar manifest, prompt pack, or cohort definition.

## Immutable production inputs

| Input | SHA-256 |
|---|---|
| `AVATAR_V4_PRODUCTION_RUNBOOK.md` | `d6bdb449a3fdc5709a167b4ef6752ae1144a4447eb459f3d0a66b57ad495df72` |
| `AVATAR_ART_PRODUCTION_SPEC.md` | `e84d0f026009f4dab57cad4ed70e8883b964e549cbf264a365721e51e0234dc4` |
| `AVATAR_PROMPT_PACK.md` | `a74dc848d234c59481faa003e3817de0ec5cc6a1064592922873bf1c99d39dae` |
| `avatar-prompts.json` | `b191a1be984eff8ea793b553285e31cd66e2e426e1e77629a1f04f61e60858f5` |
| `avatar-production-cohorts.json` | `56d8459b31eaefb65f9a575e4d78a258e5241bc3266d3ba5fd3805d256c59a9d` |

Prompt-pack encoding review found no replacement character (`U+FFFD`). Exact per-ID v1.4 prompt rows were used for production and trait review.

## Contact sheets

- [Labeled 256 px contact sheet](s244-adventurer-normalized/s244-adventurer-contact-sheet-256.png)
- [Labeled 512 px contact sheet](s244-adventurer-normalized/s244-adventurer-contact-sheet-512.png)
- [Normalization manifest](s244-adventurer-normalized/normalization-manifest.json)

Both sheets were inspected at original resolution. Labels render as `NNN · band/kind`; all tiles are distinct, correctly ordered, and readable. The artwork reads as one premium painterly family while retaining intentional differences in faces, hair, clothing, and presentation. Human skin-tone balance is even across the four production tone groups: three deep, three light, three golden, and three medium. These production groups are not runtime identity labels.

## Per-ID author visual QA

| ID | Source | Locked individual traits checked | Decision |
|---|---|---|---|
| `avatar-201` | approved anchor | Long braids, green top, calm Adventurer-age portrait | **PASS** |
| `avatar-202` | approved anchor | Wavy golden hair, freckles, denim layer over hoodie | **PASS** |
| `avatar-203` | independent final | Black fringe, navy jacket, black hoodie; corrected closer bust framing | **PASS** |
| `avatar-204` | independent final | Long wavy hair, turquoise accents, patterned rust top | **PASS** |
| `avatar-205` | independent final | Short coils and teal zip layer; corrected closer bust framing | **PASS** |
| `avatar-206` | independent final | Braided pigtails with gold cuffs, sage hoodie and denim layer | **PASS** |
| `avatar-207` | independent final | Half-up curls, freckles, rust-colored top | **PASS** |
| `avatar-208` | independent final | Bob with bangs, small studs, golden top | **PASS** |
| `avatar-209` | independent final | Single braid, open smile, blue track layer | **PASS** |
| `avatar-210` | independent final | Wavy hair, green hoodie and denim layer; corrected closer bust framing | **PASS** |
| `avatar-211` | independent final | Shoulder-length twists, visible undercut, hoops, denim zip and teal tee | **PASS** |
| `avatar-212` | independent final | Half-up waves, turquoise accents, lilac top | **PASS** |
| `avatar-401` | approved anchor | Dimensional Trail-mark medallion; identity-neutral alternative | **PASS** |
| `avatar-410` | independent final | Compact Data Ridge with five rising bars, orange tallest bar and mountain form | **PASS** |
| `avatar-412` | independent final | Symmetric dimensional Algebra Knot in deep navy and orange | **PASS** |

Final author-QA tally: **15 PASS / 0 REVISE**. This is not independent release approval.

## Final source and normalized hashes

All final sources are opaque 1254 × 1254 PNGs. All normalized masters are opaque 1024 × 1024 PNGs with exact `#F7F3EC` corners.

| ID | Final source SHA-256 | Normalized master SHA-256 | Placed foreground W × H |
|---|---|---|---:|
| `201` | `98063d68fc99f546265a78a2092871d7561cb1481ea3c314fae77f653101d182` | `ae64cc10b137511c1f0214aec412fecb073dc1dc43d65375d82c9c8c51caf9a8` | 69.7% × 81.2% |
| `202` | `fa969fc59c4e9e6472b886d85c3fd7a5e6764929e85c32e912f64347af92e267` | `10e5d74b09de2555fbe1bdae4bf128f366629035bb8dc69f6aeb47905373013e` | 73.4% × 81.2% |
| `203` | `216c7e67745d58aa4f0a8261e3c993b0123c8a897d14274ef3d5f6e397b03a96` | `e18b331a6e64f4d1fb7aee8e2f55347efb1b1db61a03767d9d0230ab83c26753` | 75.1% × 77.1% |
| `204` | `f86ae3aa6873a74d5353875355a5f0a3fe01f4feb08dc45b6bd60ba385e9cb46` | `265b347118763362da28439121df29a379dce8560b3ce80d97938a41d5961a56` | 71.0% × 81.2% |
| `205` | `afabd9025921cb0a39578db38c8e936faef5c55335db40a7f22932cb946b2bf6` | `c7249bd85858f67006b8ca59b780c653112017d16a04cf9b110f7570183595de` | 75.1% × 77.8% |
| `206` | `0b30723023065e266d619985eb8dfd0116df4586954e446f744cf9a7bde22d02` | `2088785d1c5767073dc78c282f53ddf3f5d9d57529b45403f4079bc83866202f` | 75.1% × 80.0% |
| `207` | `1786df669b526c8b4d4737cae3eb87990c3eeddb33d82e5ccda477f35bdeb581` | `872fe3dc2d7734e16b593dedf6b8f982890b23ce563b306bc28606e99f8491b3` | 67.2% × 81.2% |
| `208` | `26254c107af7a9ad30e152eeca932147f38ddabaa2cd015266af51db7664250e` | `018ca3d89fea578665167a2295d4cb29f2f99b46794252e1173e4b94146aed59` | 75.1% × 77.9% |
| `209` | `c456aedfe578427924086590299a26b44588748fe883ae07770f0b2eb4296f5d` | `0524b2a82e3495124b717b2e449bb9e8150a648bfc471631f41075917b7d27ed` | 75.0% × 81.2% |
| `210` | `399bb14cd734e147d5d5433296fafd5e5c685abaf0f416bd10f60887e1150d6e` | `d92ba9aa9f15c56b7abd0eba6eb522afa0a8a4c1d7fd4ebbdd0414fa382c2240` | 75.1% × 79.3% |
| `211` | `bca5646815177ab83d1a581a009232ba3cdb79e9be1bcb0714489315cd2acf3c` | `96c41f45b510bef940aa66ffc17ba3c6589c2deac78cf6b6a7e5762781542695` | 75.1% × 77.9% |
| `212` | `a920ebaf5f053263b0420744b243bd3129a770d5ad018d8a45a19fbf7d7bc01f` | `642f0984d7157a85e587641686062cb753db2cc7483a7bc0f3c8146e5df2c7ec` | 74.7% × 81.2% |
| `401` | `4c78729598d9274b80bc76949f23e01a597777491b1420c2bffadd5f02e589ae` | `e1a41409ac86423c437860e841404ad0fe5fe5d312e30a79fccd2b866038c091` | 61.4% × 66.0% |
| `410` | `3443f55e54a867c8b120fb5f05d392456b2d0258953ce84296bf391ccbff39af` | `63323b24b23a4ac17789b4db1c080ec3680706ccf40284f7a9c3b71999ea7e38` | 52.9% × 66.1% |
| `412` | `4f872363906ebb17e55323eaebd47b8743611148bfc406c2e0fc043141ccd49a` | `1f47cfc2eb4e3299d9fa4b76c4648d628c17e24dffad0b9ba9cb644246c2c8e1` | 61.4% × 60.9% |

## Measurement summary

Measured with `scripts/brand/measure-avatar-canary-s244.mjs` against the canonical normalized directory.

| Class | Count | Mean top margin | Top range | Mean foreground width | Width range | Mean foreground height | Height range |
|---|---:|---:|---:|---:|---:|---:|---:|
| Humans | 12 | 15.7% | 4.1 pp | 72.8% | 7.9 pp | 79.2% | 4.4 pp |
| Neutral symbols | 3 | 19.1% | 5.2 pp | 57.9% | 8.7 pp | 63.7% | 5.0 pp |

All 15 normalized masters have unique encoded and decoded image content. Background sampling is exactly RGB `247, 243, 236` for every normalized master.

## Revision record

Rejected versions remain only as source-level audit evidence in `reports/avatar-candidates/s244-masters/`; no rejected derivative set is retained.

| ID | Rejected source SHA-256 | Reason and correction |
|---|---|---|
| `203` | `129c449df7374e1a6e5fe1c5ac237f3f07857d8e98688a8517d46738436bbd22` | Bust was too wide and normalized too small; identity-preserving closer framing produced the final. |
| `205` | `f2ccf498627237a867a406413bef718744c42d159c93b6b79d740b85512d04f3` | Bust was too wide and normalized too small; identity-preserving closer framing produced the final. |
| `210` | `5a4d4cf29aa2e99eb694f391160e73f11269b2bfe8d39a2bc2c6dad353897486` | Bust was too wide and normalized too small; identity-preserving closer framing produced the final. |
| `211` | `86965e32cee39d71d67e40f27d3ce2adcac9a55ad241a8f07fe857b914bcfd0d` | Twists were too short for the locked individual trait; regenerated with shoulder-length twists, visible undercut, and retained clothing/accessory requirements. |
| `410` v1 | `46155ce924f42a28c90ea370744e508df39257679bb6531a953da6e48cdf7654` | Data Ridge composition was too horizontally spread and normalized too small. |
| `410` v2 | `765f866cd5b4042ea5f31eb23ab8166becf7384365b260791f4384d9399fdc0d` | Second source remained too wide; final identity-preserving object reframe made the ridge compact and retained five rising bars, the orange tallest bar, and mountain form. |

Three rejected normalized working directories (144 derived files, 47.23 MiB total) were removed after final QA. They were generated intermediates, not source evidence; the rejected source masters above were retained and can reproduce those derivatives if needed. The canonical normalized directory was verified present after cleanup.

## Scoped validation evidence

The cohort-specific gate passed with this result:

> Adventurer scoped validation passed: 15 unique opaque sources, 15 normalized masters, 30 derived WebPs, exact ivory corners, no decoded duplicates, 2 labeled sheets, no public leakage, releaseEligible=false.

The gate checked exact IDs and order, quarantine manifest state and prefix, source dimensions and opacity, normalized dimensions and opacity, WebP dimensions and opacity, exact ivory corners, encoded and decoded uniqueness, master-to-derivative similarity, contact-sheet integrity, absence from public release assets, and `releaseEligible=false`.

The repository-level `validate:avatars` wrapper could not start on this Windows host because Node failed in `uv_os_get_passwd` with `ENOMEM` before project validation code ran. Its directly relevant test suites were therefore run explicitly and passed:

- `src/lib/avatarAssets.test.ts`
- `src/lib/avatars.test.ts`
- `src/components/AvatarPicker.test.tsx`

Result: **3 files passed; 31 tests passed.**

## Handoff gate

The candidate cohort is ready for an independent assessor to review the final 256 px and 512 px contact sheets and source-level trait fidelity. It must remain quarantined until that assessor records approval. No public copy, shared-manifest edit, or runtime enablement is authorized by this author-QA record.
## Independent revision addendum — avatar-205

The first `avatar-205` was retained as `avatar-205-master-v1-rejected.png` because it read too
young and was too similar to `avatar-108`. The independently generated revision uses older
adolescent facial proportions, a quiet closed-mouth expression, and materially different facial
geometry. Independent reassessment passed it at 512, 256 and true 48 px. It is now the canonical
quarantined source; the library remains non-shipping pending full-library approval.

- source SHA-256: `6cf6a98da4a76383ab381e17753037138a1cb1eb6c852e92edf05628627ea692`
- 256 WebP SHA-256: `0db3dce625e24b5e50e06d742571e3ce159e5a7b0afd597b138bd04559a2f4a8`
- 512 WebP SHA-256: `ff3ac3736ff2ce43e9fffd25e12931649cb6bada3e4e10190a6f1123e0fa95cd`
