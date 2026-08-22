# S247 Common Core HSF domain-scope assurance — batch 04 delta

Date: 2026-08-18
Portfolio: `CCSS-MATH|HSF`
Scope: next 40 post-batch-03 candidate edges only
Verdict: **40 isolated, canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | After integrated batches 01–03 | Batch 04 candidate | Projected after integration |
|---|---:|---:|---:|
| HSF coarse edges rejected | 120 | +40 | 160 of 249 |
| HSF coarse edges still candidate | 129 | −40 | 89 |
| Cumulative portfolio completion | 48.19% | +16.06 points | 64.26% |
| Authoritative shared decisions | 122 | unchanged | 162 after separate append/rebuild |

The shared standards ledger remains unchanged by this lane and has zero overlap with batch 04.

## Reused official source contract

No source refetch or new summary was performed. Batch 04 reuses the already-verified authority boundaries:

- Official web page: [High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/), boundary `Standards in this domain`.
- Official accessible PDF: [Common Core Mathematics Standards](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf), boundary `High School — Functions`, printed pages 67–73.
- Signed compact snapshot: “Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.”
- Web boundary SHA-256: `f92e42efedc3069fbaa3388b12b48cc5d3c26e1d066046e71a836e914d1769e8`.
- PDF boundary SHA-256: `dc583a9ddc043564eb2e904e72ff567db9363a39ef9edb2de554a03f4a80c8a1`.

The authority boundary establishes that `HSF` is a domain locator spanning distinct BF, IF, LE, and TF descendants, not a standalone assessable standard. Each rejection is limited to that coarse locator. Every descendant alignment remains unreviewed and open.

## Current source seals

- Evidence dossiers: `c72fa16dad26652cc128b9fed9b2eabf66669fcab0d4495adc97f7da33f13d46`
- Objectives: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- Source registry: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- Batch 03 packet: `3dbda5fd92a72ad987ffb24d9e494a92b5da7c2e0cc691a2c63fb3ffd26a5730`
- Batch 04 packet: `2d599c107c9eaa491c9ad91855eee0ffd357019119e764ea322f6f0659b4f3fe`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Batch partition

| Course | Edges |
|---|---:|
| `function-analysis` | 2 |
| `limits-continuity` | 15 |
| `polar-parametric` | 15 |
| `trig-graphs-inverses` | 8 |

| Edge ID | Objective | Course | Lesson evidence | Current dossier SHA-256 | Replacement routing only |
|---|---|---|---|---|---|
| `c01dfccbf12e4bcb85bbd4af` | `fna-secant` | `function-analysis` | `fna-01-02` | `a54dba1feaf6cd48399c9891af73b5891300670b275dc90daf2704f20b21761b` | `HSF.IF`, `HSF.BF` |
| `3c7ceaa35bbb790e35de9d5d` | `fna-step` | `function-analysis` | `fna-03-03` | `0078e15939a90d346ec81ec1aa9a8341c387347a0448d548ed9dfac4ab26d01a` | `HSF.IF`, `HSF.BF` |
| `e86d0671ecf65061aebf1bb3` | `lc-avg-rate` | `limits-continuity` | `lc-05-01` | `bdaba99cf8fa25fee3de370f90c8cc716085f63cd77cce2e87b950100ceb5cb3` | `HSF.IF` |
| `61ab464b57293a37e94b597b` | `lc-continuity` | `limits-continuity` | `lc-04-01` | `f9e26b3dcd238a7b758ca2456ae05b646eeed1568180088ce9faf67315da5f7f` | `HSF.IF` |
| `7c89f3e9d4a50ccedf2f53d0` | `lc-derivative` | `limits-continuity` | `lc-05-02` | `a324091b396f5e8c02cb5d3113e36f5eeb72ba1889b88d04aca1ad9abbf39f4f` | `HSF.IF` |
| `3d78412a09edc95d91ed776c` | `lc-discontinuity` | `limits-continuity` | `lc-04-02` | `0ba64d6bb51232c4e03a410fcd08767800a4400d5ce06d2121e23ca11e5a8437` | `HSF.IF` |
| `a2a4f2f613781b664998997b` | `lc-dne` | `limits-continuity` | `lc-01-03` | `ff3be3d2e3bfff2ae785481838e7728a51f8f28e30c0f439735b0362723524ed` | `HSF.IF` |
| `d091468b370859178fdcfc34` | `lc-endbehavior` | `limits-continuity` | `lc-03-03` | `d25be681a1dcb28aa6ab8010949c230f0569c7693991dfd8eb6935bca4600947` | `HSF.IF` |
| `fd032d166b01949ae70f60ea` | `lc-factor` | `limits-continuity` | `lc-02-02` | `0e51110c665d1c875d065cbcdb6a2adf70ca797eff485817098174fe3d6379f6` | `HSF.IF` |
| `547cfae89c5d119f7b336033` | `lc-infinity` | `limits-continuity` | `lc-03-02` | `264a49c881b64504ff874ae2aee41fcb395ff87fafc650dabe2341854617deff` | `HSF.IF` |
| `6c6afe306dbc4075e224bc67` | `lc-ivt` | `limits-continuity` | `lc-04-03` | `93e7ae011eeab47649b75b4b0da987a3d3309c8f5df921fc2581989350416c80` | `HSF.IF` |
| `51bf0cd19534dad31366d566` | `lc-laws` | `limits-continuity` | `lc-02-01` | `68bbb0682b4e55c07a3a8eaa0014425fc5578626df0409495102d47cee1aeb1f` | `HSF.IF` |
| `a9f0c35910a6810ac282b94a` | `lc-limit-idea` | `limits-continuity` | `lc-01-01` | `a49669dd240ac4cce7c4ffdd5ee813dac9747c3c227f0557d0d43da555a9205d` | `HSF.IF` |
| `d6e07e7254d2436418add6e1` | `lc-onesided` | `limits-continuity` | `lc-03-01` | `203f0ab3a2a0ad004a0008005e91999ba973c19a19827c686d0211ff169be737` | `HSF.IF` |
| `4faae8d43c58ce5e2593b867` | `lc-rationalize` | `limits-continuity` | `lc-02-03` | `2c2d8d4bdeaf94e10857c3775ad49ad421ad4a44cd2160d55aaf3259837ffbf8` | `HSF.IF` |
| `fba298e8c5f31283c3ae9c8c` | `lc-read-limit` | `limits-continuity` | `lc-01-02` | `27b8d20de404eed206a15de257ce2dfc56bbaaf2b4540176131602e960900a81` | `HSF.IF` |
| `597cfd749fccb3c35da543a3` | `lc-series-limit` | `limits-continuity` | `lc-05-03` | `1b40bae31017bd6396ff9e6d9aa5abcc219e7a05f53d8c5fd2d4556353952b0d` | `HSF.IF` |
| `8305d6ea3409b84ae860a8ea` | `pp-circles` | `polar-parametric` | `pp-02-01` | `6f7c54ddc1e1196ffe3073b9954f49d6f8f6b16fdaade0ad2a25fcde4a1e621c` | `HSF.TF`, `HSG.GPE` |
| `24ec2e47784beb19c6e693bf` | `pp-de-moivre` | `polar-parametric` | `pp-03-02` | `49307933483e68c6211f1d02665e6733fcd1883a04b970d7cc0ad0e74d8e7213` | `HSF.TF`, `HSG.GPE` |
| `deb7f5f86f403d2c17994b42` | `pp-eliminate` | `polar-parametric` | `pp-04-02` | `99773b901f10cf3c5e544964f556c67fbcd50ad777aa286cab10652ab515f6d3` | `HSF.TF`, `HSG.GPE` |
| `dbb1929b496f4c5cf9de8193` | `pp-limacons` | `polar-parametric` | `pp-02-03` | `7f9ddf2ef5991e10a7240cacbb46838272e43408d063f8ff5f84cdab9b8fbe76` | `HSF.TF`, `HSG.GPE` |
| `991ea149bc58a9b90e242471` | `pp-nth-roots` | `polar-parametric` | `pp-03-03` | `2350d6cf3f32e99c7a8df8cbf5d502f9608817267b0bbe3ab590537666a17c9b` | `HSF.TF`, `HSG.GPE` |
| `3e0a6d99fb904bc0c1959a1d` | `pp-parabolic-path` | `polar-parametric` | `pp-05-03` | `2c92ddb0f58a616e04c1586eaf9e374af755e630b3c1a2b0f94cafdcfb225a32` | `HSF.TF`, `HSG.GPE` |
| `9acd70bbea2dbb863265676d` | `pp-parametric` | `polar-parametric` | `pp-04-01` | `99742f4dc97c28b737d1dc4225977b22b3616b54444a82390206ee0f24def19d` | `HSF.TF`, `HSG.GPE` |
| `71df630bc6f80091f195f13a` | `pp-parametrize` | `polar-parametric` | `pp-04-03` | `e318144c3ec6eb6e33d6677663d29b7e18466d05e68c4a5b50533e8a06ad0672` | `HSF.TF`, `HSG.GPE` |
| `05e7a5c4b3e292090743a141` | `pp-polar-form` | `polar-parametric` | `pp-03-01` | `dc1d0c67ef74051fe29579bda46a2c6187d0b2eae9994728b275f3399bac83e0` | `HSF.TF`, `HSG.GPE` |
| `6bcc545fa93700c311fcfcbb` | `pp-polar-system` | `polar-parametric` | `pp-01-01` | `5fe526b4e8dc9a4c30af33a13b84f1b56514e71c21dc10161417b271a57f5e0c` | `HSF.TF`, `HSG.GPE` |
| `b88a18a2b29d8cc5c182ec86` | `pp-projectile` | `polar-parametric` | `pp-05-01` | `44471f7f1d9cf12ea156a42343faca32fc1fe820b03212845041e50b7a9c2666` | `HSF.TF`, `HSG.GPE` |
| `93be3c823d6195da8050fb13` | `pp-roses` | `polar-parametric` | `pp-02-02` | `3b1a8af4a6b975f210f56e781b1588c93a39f14bd8f9bf21c83da72b27703c43` | `HSF.TF`, `HSG.GPE` |
| `578ab46597ea7c267f546167` | `pp-to-polar` | `polar-parametric` | `pp-01-03` | `f5bbb3729cc9f3271bd10cbfd22d1ac4da09160bd3e0961344f0b829be5fd929` | `HSF.TF`, `HSG.GPE` |
| `7405db8b6064db202f3b337c` | `pp-to-rect` | `polar-parametric` | `pp-01-02` | `16e05365ff0473e048699229b00b89b00ec8e1132778d81c9cf4ffd1e45c66ae` | `HSF.TF`, `HSG.GPE` |
| `936b5ef5d202867b154a4b60` | `pp-trajectory` | `polar-parametric` | `pp-05-02` | `489211cdbccf26a6bc914808f0e16f856d63cd9b905227a69673f189ad81ee92` | `HSF.TF`, `HSG.GPE` |
| `393b884cab8b71e166193e6c` | `tg-arccos` | `trig-graphs-inverses` | `tg-04-02` | `0468edfc36879a3931e12eafa3103bb7bae8978f597fe6fe353287730f995adb` | `HSF.TF`, `HSF.IF` |
| `c8f622385d72d38b8ef4513c` | `tg-arcsin` | `trig-graphs-inverses` | `tg-04-01` | `391d942abcbba20bddb239cac50fb788fc90e4cb510c01453858d98a402daae0` | `HSF.TF`, `HSF.IF` |
| `b40ae3bc5deabc4b32613785` | `tg-composition-trap` | `trig-graphs-inverses` | `tg-05-01` | `cf188be905c2c156e355401cd81ceff6db8aff8443b484a6e00bc532df9c9f33` | `HSF.TF`, `HSF.IF` |
| `1c7922319633ad883f172b9f` | `tg-cos-graph` | `trig-graphs-inverses` | `tg-02-01` | `1b005e24d17308ff478b52741620cd1a3e45c93b3265033f4d33199abda71c61` | `HSF.TF`, `HSF.IF` |
| `ea72f97126ec50836adfed58` | `tg-cos-sin` | `trig-graphs-inverses` | `tg-02-02` | `c0e177146cbd8b27e37246d74cd50d7dab31471c4e6647e0a9b0d72d9c7ed8e4` | `HSF.TF`, `HSF.IF` |
| `8e37c5fb06fdb817b64f2d77` | `tg-equiv-rules` | `trig-graphs-inverses` | `tg-02-03` | `7f541ba33cdabd4ddb7f8384a8d7a4084fc891b943706bdb27684a4ae527f267` | `HSF.TF`, `HSF.IF` |
| `569724031541cae3c5f52e0a` | `tg-five-points` | `trig-graphs-inverses` | `tg-01-03` | `1e10e18573a3dbe83d8e01020369eefc338d6c58d9a6ff7e7dfc025ee858e695` | `HSF.TF`, `HSF.IF` |
| `5743ea2a23d98095a86e4dd5` | `tg-four-dials` | `trig-graphs-inverses` | `tg-01-02` | `8815204cefade695662c4a8f6237cfb3ace4ebee7173e70627a07a99526aa882` | `HSF.TF`, `HSF.IF` |

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
- Sample: `51bf0cd19534dad31366d566`, `7405db8b6064db202f3b337c`, `93be3c823d6195da8050fb13`, `3d78412a09edc95d91ed776c`, `61ab464b57293a37e94b597b`, `4faae8d43c58ce5e2593b867`, `6c6afe306dbc4075e224bc67`, `fba298e8c5f31283c3ae9c8c`.

Run: `node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch04.mjs`.

## Integration boundary

Do not regenerate this packet after append. Root should rerun the validator immediately before atomically appending all 40 signed records, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
