# S247 Common Core HSF domain-scope assurance — batch 05 delta

Date: 2026-08-18
Portfolio: `CCSS-MATH|HSF`
Scope: next 40 post-batch-04 candidate edges only
Verdict: **40 isolated, canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | After integrated batches 01–04 | Batch 05 candidate | Projected after integration |
|---|---:|---:|---:|
| HSF coarse edges rejected | 160 | +40 | 200 of 249 |
| HSF coarse edges still candidate | 89 | −40 | 49 |
| Cumulative portfolio completion | 64.26% | +16.06 points | 80.32% |
| Authoritative shared decisions | 162 | unchanged | 202 after separate append/rebuild |

The shared standards ledger remains unchanged by this lane and has zero overlap with batch 05.

## Reused official source contract

No source refetch or new summary was performed. Batch 05 reuses the already-verified authority boundaries:

- Official web page: [High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/), boundary `Standards in this domain`.
- Official accessible PDF: [Common Core Mathematics Standards](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf), boundary `High School — Functions`, printed pages 67–73.
- Signed compact snapshot: “Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.”
- Web boundary SHA-256: `f92e42efedc3069fbaa3388b12b48cc5d3c26e1d066046e71a836e914d1769e8`.
- PDF boundary SHA-256: `dc583a9ddc043564eb2e904e72ff567db9363a39ef9edb2de554a03f4a80c8a1`.

The authority boundary establishes that `HSF` is a domain locator spanning distinct BF, IF, LE, and TF descendants, not a standalone assessable standard. Each rejection is limited to that coarse locator. Every descendant alignment remains unreviewed and open.

## Current source seals

- Evidence dossiers: `4f06ae6531f8a75b8abaf8ef72afe27d7d4802893879fbc90faff5b101d46756`
- Objectives: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- Source registry: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- Batch 04 packet: `2d599c107c9eaa491c9ad91855eee0ffd357019119e764ea322f6f0659b4f3fe`
- Batch 05 packet: `3f1e0dc1b3fa1767f4a6ca4e8cff196207e135d4db090fba891807b21e96276f`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Batch partition

| Course | Edges |
|---|---:|
| `trig-graphs-inverses` | 7 |
| `curve-analysis` | 16 |
| `derivative-rules` | 17 |

| Edge ID | Objective | Course | Lesson evidence | Current dossier SHA-256 | Replacement routing only |
|---|---|---|---|---|---|
| `f26d12b316a4e62363f7a642` | `tg-inverse-graphs` | `trig-graphs-inverses` | `tg-04-03` | `dcad2943997f90641aed0b708b2709c591bd286dba0a0e61b1ef03cc7390c328` | `HSF.TF`, `HSF.IF` |
| `d6dd994d7c099ce700c153cd` | `tg-mixed-comp` | `trig-graphs-inverses` | `tg-05-02` | `4d22f11f10c38383597a744c948ee117e7d81477bd72d36be1b72c6ae023f24c` | `HSF.TF`, `HSF.IF` |
| `71f13f12f7126ce9892a80cd` | `tg-phase` | `trig-graphs-inverses` | `tg-01-01` | `68be3a03bdfaf5b53f774f6aa7bffea03cdb1863ab6269134fb7e3696932e4e7` | `HSF.TF`, `HSF.IF` |
| `233700286348c44550125193` | `tg-solve-all` | `trig-graphs-inverses` | `tg-05-03` | `9701c64ada854539c4741b44459ed300dda5872271b54a981e07515e41239e76` | `HSF.TF`, `HSF.IF` |
| `894426d99f1b0c787b268d91` | `tg-tan-shape` | `trig-graphs-inverses` | `tg-03-01` | `56ce4ea1ae4197ae46427affb90bf4859ffb5edb8773cf735627fdff52ef02bc` | `HSF.TF`, `HSF.IF` |
| `f0fb4afc696a7dba8c7840ba` | `tg-tan-transform` | `trig-graphs-inverses` | `tg-03-03` | `cd5bb2bd299597bf72ca6d422d7d4c7f69fa51fc6a85bb5e4dabc2487dd8eabb` | `HSF.TF`, `HSF.IF` |
| `5576649380c2d84f09ef7c2a` | `tg-tan-values` | `trig-graphs-inverses` | `tg-03-02` | `4bb2e3b2f6f61720f8bcb9bb5118962824e50ced9bd78b8375cf2ce112469a25` | `HSF.TF`, `HSF.IF` |
| `5dbba5b93b6c8e3c1d4562a7` | `ca-concavity` | `curve-analysis` | `ca-02-01` | `9a9acb74f58d9db9f19b3145190793350f87b551d9da61594d057e1896e8c28d` | `HSF.IF` |
| `d8566bc383260b0a37c0cc2f` | `ca-critical-point` | `curve-analysis` | `ca-01-01` | `fea2b6bf99f95551ab78f2bee84872910158952538aa1a39571f2f6988826a6e` | `HSF.IF` |
| `f588187a0bb64e1c288752ca` | `ca-end-behaviour` | `curve-analysis` | `ca-04-01` | `32eeacf9dd12814b499cfb8bc41c21f81f0f61ff65f5242562fcfc6943e89e1f` | `HSF.IF` |
| `2bef810ae2368d3ff0254187` | `ca-evt` | `curve-analysis` | `ca-01-03` | `68c64682a52c31647faea5c520637bc5509afa5a1bcf8c15827ba5cab5706b46` | `HSF.IF` |
| `27db96e856e73bf3c9e698e4` | `ca-first-derivative-test` | `curve-analysis` | `ca-01-02` | `9f38736e50671c134f07f922edc11a7f82a0ac9eb6a350813ea3d35b9876bcf8` | `HSF.IF` |
| `6a41b47b17edc7c39d4b0ee5` | `ca-full-sketch` | `curve-analysis` | `ca-04-02` | `a41c64049a8b7e32873e681234c35acd87d9ee342d84106716255223a49b7d35` | `HSF.IF` |
| `a2a6d0614322e67a7865d43b` | `ca-inflection` | `curve-analysis` | `ca-02-01` | `5e8890fa4f5e2c6642ff0ea600ac180795e0b7177ef8a56e69eb1d637cf40202` | `HSF.IF` |
| `f4f11f8a7a099bf86a517925` | `ca-mvt` | `curve-analysis` | `ca-03-02` | `1c4883e95b5fbaa2215e375ee3eee2131ef1854d772410f40c55e3ac873e3048` | `HSF.IF` |
| `b6f308b69caa88f1e0ba8f78` | `ca-mvt-consequences` | `curve-analysis` | `ca-03-03` | `4c4ad5a81d37dcdfaaa923829f497e3d4b9cf953e6d9ab90724040bf12e9bf3d` | `HSF.IF` |
| `b66d126805b95de1033f1fff` | `ca-optimisation-applied` | `curve-analysis` | `ca-05-03` | `538634a17aa4a2147e474fe99a11960f1adb5f95788329967db248bee3ffe5a3` | `HSF.IF` |
| `1e9cd0c73fd1393174b0c6fb` | `ca-optimisation-box` | `curve-analysis` | `ca-05-02` | `6f015fea615d29a08212ad1347562bffc4059f293caadd5ac69cac7277daa335` | `HSF.IF` |
| `cfd4efe8087dd2112a064ed7` | `ca-optimisation-setup` | `curve-analysis` | `ca-05-01` | `bf7ce62b1724d6c23b4b2f884b6c0c0c27e1b23a4d552b1b770b6a90a4be89f8` | `HSF.IF` |
| `98843938c20d64c3773cf1ea` | `ca-read-f-prime` | `curve-analysis` | `ca-04-03` | `ec9107589e5e303a5116ff4740e96292767aeb8feff97641611c8a9f2a7907d6` | `HSF.IF` |
| `41e3e15e43b17c6aa768de64` | `ca-rolle` | `curve-analysis` | `ca-03-01` | `24d82da09e43038407830625692b2c4ff1d5308ed76ed066959cdea65f3274a0` | `HSF.IF` |
| `7f5fe4c89274fdb4da8eed17` | `ca-second-derivative-test` | `curve-analysis` | `ca-02-02` | `225d56d12717b3fc029bf36dd622af79d119881e0d8400eb702a5ea184a89bde` | `HSF.IF` |
| `8b0874231bc75f5f777fea26` | `ca-three-charts` | `curve-analysis` | `ca-02-03` | `5266b3c09972516a1f8254ba0f98a21f5907adf6786d661734ef7455a2f444de` | `HSF.IF` |
| `7b2a65ad3daa03c7aede28b9` | `dr-chain-nested` | `derivative-rules` | `dr-04-02` | `5c44b6e9a69b5c8383ab3345ba17d4abd158576698f2aced6c72aea1215e2742` | `HSF.IF` |
| `9f5ce32168f9fc5c80a737fc` | `dr-chain-rule` | `derivative-rules` | `dr-04-01` | `8362732fff28bd0b3c2189c7553c9c887bff82db2d6a870372ecec2963c538dc` | `HSF.IF` |
| `e7960ba615c312645646dc79` | `dr-choose-rule` | `derivative-rules` | `dr-03-03` | `df6650ecbd646a97ac9aabb2163e583e13d626677403a66586a7ab4194c7a620` | `HSF.IF` |
| `92446ea1503b8590af2288bb` | `dr-constant-sum` | `derivative-rules` | `dr-02-02` | `9ba6085cc4eb124a7f1a91b01c3225623b8a4acfca1a11b311a657d7a01276cb` | `HSF.IF` |
| `b9b518acdfa62934b9ce79d0` | `dr-critical-point` | `derivative-rules` | `dr-01-02` | `635b6dc978c2d2902fd9fc142ee35dfddc03e21c4601d029bc952749c20d9b38` | `HSF.IF` |
| `715f0bf2ef3422fef764692a` | `dr-derivative-function` | `derivative-rules` | `dr-01-01` | `eb96822749036f2debbc56a8a3d6d6957f0e762b65f202d74813ba43eb97050a` | `HSF.IF` |
| `dece291601b4aa45c790a5a9` | `dr-differentiability` | `derivative-rules` | `dr-01-03` | `5a9421fe5a6ca0fa2d1498ac66b7b0dc0bfe186346d90d90fc43e21d2bca9f0b` | `HSF.IF` |
| `7f3ebb2e034da8916098d9fd` | `dr-exp-log` | `derivative-rules` | `dr-05-01` | `2487e273084904a8e88721986499d76cb4ea0513b516e42ba84cc2237506575f` | `HSF.IF` |
| `6d5d28e2c886d9bcde84fc8f` | `dr-flat-not-turning` | `derivative-rules` | `dr-01-02` | `0f9052e328d1bb91b08a1bf630635fff49c4c5336d1a872dc771cd09a5caff91` | `HSF.IF` |
| `ee214912ec01f09eeec152c4` | `dr-implicit` | `derivative-rules` | `dr-04-02` | `bb0adf1bac7c1b037272eaf11913130ed596a90567b10f8143f9b874fda12ac3` | `HSF.IF` |
| `d49734754bfe351921379690` | `dr-implicit-practice` | `derivative-rules` | `dr-04-03` | `e666540ff94aaf4edab71dbfa8ce388afe52e3d69f025963a3b702eb558174da` | `HSF.IF` |
| `a6cf0ac758ad6dea33771fd7` | `dr-inverse-derivative` | `derivative-rules` | `dr-05-03` | `da9a6b3d45cf101ae64892442a1344be3c06e581221e4fabff31b4f67d837725` | `HSF.IF` |
| `f8a616e258ffc78a9e661c5b` | `dr-limit-definition` | `derivative-rules` | `dr-01-01` | `05627b341946f01f5d276f45245637dcc2c0089eeb9e9f71f9c25d30793fe438` | `HSF.IF` |
| `f2c68e58cca1b26e92672c97` | `dr-local-linearity` | `derivative-rules` | `dr-01-03` | `c535e0717cc7f15906187c2b9eaef2538d622f7b0ff9b9d36e84d41ecf4605f2` | `HSF.IF` |
| `ebc9b824d96602b3f868a898` | `dr-power-rule` | `derivative-rules` | `dr-02-01` | `bac7c4fa919a1353d8aa72fcec49ff109644ef6a01f720f3b25969e40f884279` | `HSF.IF` |
| `59988138316ba32ce5517f86` | `dr-product-rule` | `derivative-rules` | `dr-03-01` | `49519fc508714a51aa8c8f69ac5cda9302fe14eeab0d26934626dc2b6556d545` | `HSF.IF` |
| `01c63e11e54ba954a40f6713` | `dr-quotient-rule` | `derivative-rules` | `dr-03-02` | `1022323b66fb024ff80fa2029c4f7173d3f81df5511c7acfa4aa39c201f21dee` | `HSF.IF` |

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
- Sample: `894426d99f1b0c787b268d91`, `f8a616e258ffc78a9e661c5b`, `f4f11f8a7a099bf86a517925`, `9f5ce32168f9fc5c80a737fc`, `7f5fe4c89274fdb4da8eed17`, `6a41b47b17edc7c39d4b0ee5`, `b66d126805b95de1033f1fff`, `f2c68e58cca1b26e92672c97`.

Run: `node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch05.mjs`.

## Integration boundary

Do not regenerate this packet after append. Root should rerun the validator immediately before atomically appending all 40 signed records, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
