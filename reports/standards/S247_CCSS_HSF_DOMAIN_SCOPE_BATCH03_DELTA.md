# S247 Common Core HSF domain-scope assurance — batch 03 delta

Date: 2026-08-18
Portfolio: `CCSS-MATH|HSF`
Scope: next 40 post-batch-02 candidate edges only
Verdict: **40 isolated, canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | After integrated batches 01–02 | Batch 03 candidate | Projected after integration |
|---|---:|---:|---:|
| HSF coarse edges rejected | 80 | +40 | 120 of 249 |
| HSF coarse edges still candidate | 169 | −40 | 129 |
| Cumulative portfolio completion | 32.13% | +16.06 points | 48.19% |
| Authoritative shared decisions | 82 | unchanged | 122 after separate append/rebuild |

The shared standards ledger remains unchanged by this lane and has zero overlap with batch 03.

## Reused official source contract

No source refetch or new summary was performed. Batch 03 reuses the already-verified authority boundaries:

- Official web page: [High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/), boundary `Standards in this domain`.
- Official accessible PDF: [Common Core Mathematics Standards](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf), boundary `High School — Functions`, printed pages 67–73.
- Signed compact snapshot: “Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.”
- Web boundary SHA-256: `f92e42efedc3069fbaa3388b12b48cc5d3c26e1d066046e71a836e914d1769e8`.
- PDF boundary SHA-256: `dc583a9ddc043564eb2e904e72ff567db9363a39ef9edb2de554a03f4a80c8a1`.

The authority boundary establishes that `HSF` is a domain locator spanning distinct BF, IF, LE, and TF descendants, not a standalone assessable standard. Each rejection is limited to that coarse locator. Every descendant alignment remains unreviewed and open.

## Current source seals

- Evidence dossiers: `56298685a3841cea6997598f9220347f49e110f236eabff0c565d7f83ebec8fd`
- Objectives: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- Source registry: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- Batch 02 packet: `5bb16928f13bf7b86d2be06fef1b74c63f2ffe32db4392c866292ef6a199c5df`
- Batch 03 packet: `3dbda5fd92a72ad987ffb24d9e494a92b5da7c2e0cc691a2c63fb3ffd26a5730`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Batch partition

- Trigonometric functions: 11 edges.
- Conic sections: 16 edges.
- Function analysis: 13 edges.

| Edge ID | Objective | Course | Lesson evidence | Current dossier SHA-256 | Replacement routing only |
|---|---|---|---|---|---|
| `eda350ff6ac300c4442aaf83` | `tf-exact-values` | `trig-functions` | `tf-03-03` | `44ca63cd3a289f6e3bba5f048110b4c3fd079eada7dbd8e1400e3988fa6eb88b` | `HSF.TF`, `HSG.C` |
| `745b7633aad0295e9659c1f5` | `tf-identity` | `trig-functions` | `tf-05-03` | `8c2b617d7732865d56290c2374bcf1ffa71b3ad54f488c5cb80f07026d09188f` | `HSF.TF`, `HSG.C` |
| `f739c3282cb842973ed0d2d4` | `tf-inverse` | `trig-functions` | `tf-01-03` | `6a80871c8468fc95338b24f584262f360c227485a72eef612b78f1ff0d82a102` | `HSF.TF`, `HSG.C` |
| `976c890370454c107b87a2ed` | `tf-model` | `trig-functions` | `tf-05-01`, `tf-05-02` | `1ed44048241c99c9cadbef93cdba369c64b927aa6583573333e113709c0aab10` | `HSF.TF`, `HSG.C` |
| `ba63ef35a342756edb7efc99` | `tf-radians` | `trig-functions` | `tf-02-01`, `tf-02-02` | `f9dea084b3f53d01c7afec545c4f3a7db517494aea53cc6eedded10eb441b6fd` | `HSF.TF`, `HSG.C` |
| `5f4c7dca2f6a60056d0a6933` | `tf-ratios` | `trig-functions` | `tf-01-01` | `910f749ef5f1a9f09437b2156d23236d25cd55ead89273d001a2be0b0828d465` | `HSF.TF`, `HSG.C` |
| `56ec46f5fed873864d43b5d4` | `tf-reference` | `trig-functions` | `tf-03-02` | `62c57fb36ee457107d2f93048d24d2a37e2f45eddb4e8dfd8876d95e1e829d9a` | `HSF.TF`, `HSG.C` |
| `ea5ac29ebbb7a1d24f1ccb93` | `tf-solve-sides` | `trig-functions` | `tf-01-02` | `1562303879646fefd725ac8203d6f2bdb427dd8d1135592d5130c015307b3d30` | `HSF.TF`, `HSG.C` |
| `4c712f60fa74a2f1fadf1535` | `tf-transform` | `trig-functions` | `tf-04-03` | `6ef3fa6ac86137ac8a9ab6af4328411569c64e88552b151f6e18b4a1da4a29c7` | `HSF.TF`, `HSG.C` |
| `75f7c440a83d45d8e2e60756` | `tf-unit-circle` | `trig-functions` | `tf-03-01` | `9d20447a10f1d47b2c259728bac96353b4794b00fbc2c056ea9781d706b37f4b` | `HSF.TF`, `HSG.C` |
| `077254a4f04c6920d4af011c` | `tf-wave-read` | `trig-functions` | `tf-04-01` | `8f79c43cdb51bfd80b533b853524eef7645087e94d42c211616581cb21c7d56a` | `HSF.TF`, `HSG.C` |
| `317b642312e6170b283b1230` | `co-abc` | `conic-sections` | `co-02-02` | `12f5fdfec9b88f0bc50a4f990dbc8f47f6f7aa632ca265e622d6f4024bdcea0e` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `49e286e269566bfa1d8f714a` | `co-asymptote` | `conic-sections` | `co-03-02` | `827689fa09076a67f0b6763918f338d72edabb9c341190eacd9f28d5baf1a31f` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `729bb36a9d648f05892046f0` | `co-complete` | `conic-sections` | `co-04-02` | `b534a1bf03fad5d5352ae331d043f6df61f877616e56db514b829e21879be6c7` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `302a5e9ff30e7b8cd85dd929` | `co-ecc-unify` | `conic-sections` | `co-05-01` | `3ccf35b50e51df6b5603c40de4ba66897c41cc67133a330931098f6d9822a94d` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `54a95ecc5070b7b061e19207` | `co-ellipse` | `conic-sections` | `co-02-01` | `fb296519c1f0b032f22cd3a7765808220894790f9ca27fe26bc368bf938901e0` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `e915a4335d0d2289e90b0fa0` | `co-focus-directrix` | `conic-sections` | `co-05-02` | `77dc8b8578995e2a0fcab30ae562c95370a4514fc9db96b2e5a519b312bae543` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `8b3c70cd1f6405d373766f9b` | `co-general-hp` | `conic-sections` | `co-04-03` | `0ede0c9c1ca176b1ce2be08b6d4c399730bd3a1c1187169225b4ef57fa035bf3` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `d48f65975ba7b80bf9dfe5c4` | `co-hyp-ecc` | `conic-sections` | `co-03-03` | `961d764361b1acb98f479465542febff252974c8f9e3dd119fd3157bbb3763db` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `a22e6dc347cf993822f4a53c` | `co-hyperbola` | `conic-sections` | `co-03-01` | `f11f541a12b0371083e8662095bc19fe5249b32c12ecde2a32b0a0d36a533cf6` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `f7c168d3727a1c72554d1235` | `co-identify` | `conic-sections` | `co-04-01` | `07474013f830907e4352eaf4b0afdb288613761ac1561bc463d2c18eda6187cd` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `74b7103b2ac20b7362de34b0` | `co-orbits` | `conic-sections` | `co-05-03` | `ff834abac38d34504f6fc68e90374c9493b230e00686635f0befa3542807e37b` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `7e397ae541ec0f65a6961767` | `co-parabola-def` | `conic-sections` | `co-01-01` | `8ae47763ed96e05d6fb9ec4d2734515688e946ff694363f4012ca1a3fe3b4f0b` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `965f61ac5ab734d4b4120a44` | `co-parabola-eqn` | `conic-sections` | `co-01-01` | `937f8d2b61a4428f3be44eeb699cec4e2277e837e8dbbbcbf7a90c7a9db774ed` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `bce7bec05fc719018490ae7f` | `co-reflector` | `conic-sections` | `co-01-03` | `896e7d6b03d2eb9801164feeb06e9059ee963fe9cca61270facd4241991f3d4b` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `bbe59d5776bbaf48d04b8e33` | `co-shifted` | `conic-sections` | `co-02-03` | `98b0bc57e6fac27f3df0e3741f462fd10ebe1f04c277c354e59e05affc7f159d` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `6caa970bf8a06df4f3a761d4` | `co-shifted-parabola` | `conic-sections` | `co-01-02` | `4ee64ba06c9f8abdc0fc2b605b21fb3084dd433d1783b8aaaa1ba61e93b5c4ef` | `HSG.GPE`, `HSG.C`, `HSA.REI`, `HSA.CED` |
| `6ccb72f87b71fcd7bb63d6bd` | `fna-aroc` | `function-analysis` | `fna-01-01` | `fd9b0527e83d881f76677be5d3ee14816f5d46ef75cea62d4209488313bfe42e` | `HSF.IF`, `HSF.BF` |
| `10e6d7dc9ace1968545d00a1` | `fna-compose-domain` | `function-analysis` | `fna-04-02` | `10937be15ba26a26f15503ca15a2944dbf79c0ec5b05e3bd95ee8af11a6819eb` | `HSF.IF`, `HSF.BF` |
| `18127ed225833f08885fcab0` | `fna-compose-order` | `function-analysis` | `fna-04-01` | `9837c40ca4ac50281597e48638cdb758889bad49e5fdcef07ad4a1119520a585` | `HSF.IF`, `HSF.BF` |
| `0e5657c7536c12848b8a26b3` | `fna-decompose` | `function-analysis` | `fna-04-03` | `9f851225257c1312a1a862f60e155680ffacd93b424430bb82663b5485afc9ea` | `HSF.IF`, `HSF.BF` |
| `c563dafd1d8524b62667493b` | `fna-even-odd` | `function-analysis` | `fna-03-01` | `2e7488515e95d2b68b5b95aa4f0b93516d954fd030b47d4ae4b7eff5c7df942f` | `HSF.IF`, `HSF.BF` |
| `c3585914a99519e7dfb5ccb7` | `fna-extrema` | `function-analysis` | `fna-02-02` | `f44abab781512a53924ec98d7f3eaae29bd460cd242d473a6f38777f83755ea8` | `HSF.IF`, `HSF.BF` |
| `2992ceb45ce39858f9d52131` | `fna-graph-read` | `function-analysis` | `fna-02-03` | `aa695d36fcd800a5279b7a13033ffb3185ed2d8f1419e023802ac3f6e3059aeb` | `HSF.IF`, `HSF.BF` |
| `feec88b335313c562e7e5b3b` | `fna-inc-dec` | `function-analysis` | `fna-02-01` | `1f5e4df7e2cfa9afa4b3ac63c3731b7c1a46de4eb07e02301cb2cce07e298d58` | `HSF.IF`, `HSF.BF` |
| `3aea8ec15a01f4bf351d2dc9` | `fna-inverse-verify` | `function-analysis` | `fna-05-03` | `a9742e9d1a4f97120f0aa3b39f4f59b37d388ca144b41a2766a37b19b0068c78` | `HSF.IF`, `HSF.BF` |
| `6fc6c389dc1f187975478dc1` | `fna-one-to-one` | `function-analysis` | `fna-05-01` | `1932155e954a804e0955768ef954014c9f5c027fcb28541ebbd14b22b6be9977` | `HSF.IF`, `HSF.BF` |
| `00943cf1944c9696aac8a38e` | `fna-piecewise` | `function-analysis` | `fna-03-02` | `45079326dde220312e65e137a5b2864004726a3e0a9c8c677b828670d57c7fa6` | `HSF.IF`, `HSF.BF` |
| `388d3010657320b5491d4e63` | `fna-rate-interp` | `function-analysis` | `fna-01-03` | `86a5e0c1fae4fc0ca41c25edd010d2316667aff5f6643c85d616c64853b169f5` | `HSF.IF`, `HSF.BF` |
| `c8ded0fc395a41074f243819` | `fna-restricted` | `function-analysis` | `fna-05-02` | `4766351806ef321eca254a03339efe19e09c1751dc34b0b79d44e3d3f3bf11b8` | `HSF.IF`, `HSF.BF` |

## Decision and evidence boundary

All 40 records apply the same four contractual gaps:

1. `HSF` has no exact assessable action, conditions, representations, or limits.
2. Full-intent review requires an exact descendant code and its complete official wording.
3. The bounded lesson evidence cannot establish the entire HSF domain.
4. Challenge/transfer tags were not used to infer transfer or mastery.

Candidate replacement families are routing hints, not signed descendant mappings.

## Validation

- Strict full packet: **40/40 PASS**.
- Shared-ledger overlap: **0**.
- Live candidate state and current dossier hashes: **40/40 PASS**.
- Signatures and web/PDF authority seals: **40/40 PASS**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `6caa970bf8a06df4f3a761d4`, `7e397ae541ec0f65a6961767`, `54a95ecc5070b7b061e19207`, `302a5e9ff30e7b8cd85dd929`, `f7c168d3727a1c72554d1235`, `10e6d7dc9ace1968545d00a1`, `077254a4f04c6920d4af011c`, `5f4c7dca2f6a60056d0a6933`.

Run: `node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch03.mjs`.

## Integration boundary

Do not regenerate this packet after append. Root should rerun the validator immediately before atomically appending all 40 signed records, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
