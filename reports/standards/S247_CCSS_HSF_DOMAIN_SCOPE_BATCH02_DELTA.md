# S247 Common Core HSF domain-scope assurance — batch 02 delta

Date: 2026-08-18
Portfolio: `CCSS-MATH|HSF`
Scope: next 40 post-batch-01 candidate edges only
Verdict: **40 isolated, canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | After integrated batch 01 | Batch 02 candidate | Projected after integration |
|---|---:|---:|---:|
| HSF coarse edges rejected | 40 | +40 | 80 of 249 |
| HSF coarse edges still candidate | 209 | −40 | 169 |
| Cumulative portfolio completion | 16.06% | +16.06 points | 32.13% |
| Authoritative shared decisions | 42 | unchanged | 82 after separate append/rebuild |

The shared standards ledger remains unchanged by this lane and has zero overlap with batch 02.

## Reused official source contract

No source refetch or new summary was performed. Batch 02 reuses the already-verified authority boundaries:

- Official web page: [High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/), boundary `Standards in this domain`.
- Official accessible PDF: [Common Core Mathematics Standards](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf), boundary `High School — Functions`, printed pages 67–73.
- Signed compact snapshot: “Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.”
- Web boundary SHA-256: `f92e42efedc3069fbaa3388b12b48cc5d3c26e1d066046e71a836e914d1769e8`.
- PDF boundary SHA-256: `dc583a9ddc043564eb2e904e72ff567db9363a39ef9edb2de554a03f4a80c8a1`.

The source contract establishes that `HSF` is a domain locator spanning distinct BF, IF, LE, and TF descendants, not a standalone assessable standard. Each rejection is limited to that coarse locator. Descendant alignment remains unreviewed and open.

## Current post-rebuild seals

- Evidence dossiers: `4fc1e6d97a32e2e369ce8b4f34b5e3c56fd52d48862682711bec428ca2f8cb58`
- Objectives: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- Source registry: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- Batch 01 packet: `9aa4ab0d6aeeebea9f634fe20428623e2ac8c39c8f0241bb47f0b42f161c7fae`
- Batch 02 packet: `5bb16928f13bf7b86d2be06fef1b74c63f2ffe32db4392c866292ef6a199c5df`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Batch partition

- Function transformations: 10 edges.
- Logarithms: 15 edges.
- Sequences and series: 13 edges.
- Trigonometric functions: 2 edges.

| Edge ID | Objective | Course | Lesson evidence | Current dossier SHA-256 | Replacement routing only |
|---|---|---|---|---|---|
| `466c5477511d916f745a6cab` | `ft-full-rule` | `function-transformations` | `ft-03-03` | `227938517170941091025209cd524454205d7a2278072c67dff10e124481eb33` | `HSF.BF`, `HSF.IF` |
| `509d70354336c1e865928f41` | `ft-hshift` | `function-transformations` | `ft-02-02` | `0567e282cfa47f45c2de9beedfba47f1370add80da3bb563e8bf7372d35ce525` | `HSF.BF`, `HSF.IF` |
| `9e7b068c3cba86e677a50e9a` | `ft-inverse-graph` | `function-transformations` | `ft-05-03` | `9c3392eae7b2c3d8a169c22f03aa2e8722f224e099b7fcefefbc3557bee0d07e` | `HSF.BF`, `HSF.IF` |
| `3998eaadfc86d5c99625399b` | `ft-inverse-rule` | `function-transformations` | `ft-05-02`, `ft-05-04` | `fc8d3e0efcd08ec56630fddba894a31e800b6314b439dd0f3210462497cb4bf7` | `HSF.BF`, `HSF.IF` |
| `752e93483d316d1522e8d97e` | `ft-inverse-undo` | `function-transformations` | `ft-05-01`, `ft-05-04` | `9edad9a48451e539c4da66356da4d9907e64daf4720ecab6d2a54d5c07fb73e8` | `HSF.BF`, `HSF.IF` |
| `cc6723394d1a6d0cf0345ec0` | `ft-parents` | `function-transformations` | `ft-01-01` | `6a31d2fb9b161c568ad6031ecac3ed93ae8638b57358b94f5324c1e15a66028c` | `HSF.BF`, `HSF.IF` |
| `0df9527bc6fe16ddf5be343c` | `ft-range` | `function-transformations` | `ft-01-03` | `e48c83fb26b525e6df3fb3030309354056eebee2dc89e02e551b8ab3dd83d864` | `HSF.BF`, `HSF.IF` |
| `8b283bf3ea80dd8b804d9995` | `ft-reflect` | `function-transformations` | `ft-03-01` | `e1284f68d948eceea1e9b5f525c14aaee73e68214971c1f4f7c11927f82791da` | `HSF.BF`, `HSF.IF` |
| `d27e3c193930a341b4902422` | `ft-stretch` | `function-transformations` | `ft-03-02` | `52660e577dd8ae5da691a7c4b19354ec2c756fe22fa9b70a5d8c2a983654e458` | `HSF.BF`, `HSF.IF` |
| `b015670f86bf93e8c376d0c3` | `ft-vshift` | `function-transformations` | `ft-02-01` | `0574a3e134ec880ecaa661d0307027ceb18aa436c7fdceb52fd5041c9fba5c18` | `HSF.BF`, `HSF.IF` |
| `c8287421975d54308feaa634` | `lg-cob` | `logarithms` | `lg-03-01` | `7476ef9be3613a47c4c23a21606ad6912cdf84a5de37a7e02a23442031c0d617` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `4f8f90d2d2cf0b1a6d69d812` | `lg-define` | `logarithms` | `lg-01-01` | `bd87e045e5b001d7d50ca30a74dfca20a52b7ebef6de8eadf61597a2a523bdc7` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `ff708b311015616f93ab2711` | `lg-e` | `logarithms` | `lg-04-01` | `6dc894265e5004030162e9272d790c44ebb935ad92a556557bfb64474fc25c9f` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `135b97aeb20ebaf56cd3a805` | `lg-e-solve` | `logarithms` | `lg-04-03` | `49fc23bfff6f243ce576a645488809eb6eaa072a02e888621a18b3530efcd4f6` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `03388679a0d2d9eb6e00c14e` | `lg-evaluate` | `logarithms` | `lg-01-02` | `19f511d41ec314bd319a04ed47dbb375f4d75ca076376a66c6eeb9f09019dc11` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `e5ec596e8b2749a0813e3405` | `lg-exp-solve` | `logarithms` | `lg-03-02` | `21546af96804644e9b5ed285ccd28245ecf9ca704603d6cdfbd9629295ab9418` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `4ec5f90cca702951a2df4cf6` | `lg-expand-condense` | `logarithms` | `lg-02-03` | `3cb014f27fe356015abdf9223390b82adcc6b65c01f2864806bf89f1e0c11bfe` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `d77a2e315d97e80c0132d8c8` | `lg-graph` | `logarithms` | `lg-01-03` | `8a6892972430c871208035457adb1bf7e327c8a11dbdddd6aa88f396db2c9044` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `f341a2508c7a222a5075d3fe` | `lg-halflife` | `logarithms` | `lg-05-02` | `6abb61d8406078fa86cdb82828e48b63fe4909b9fedcdc86e98321b84a1c6d64` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `b18a26adff19087a3b3f0e31` | `lg-ln` | `logarithms` | `lg-04-02` | `0f54c9d5793b919dc09f3b79e6531ad062883b4ca391807e5d632e0ad3d50f0e` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `9b8d8c592ef18a0ffdf06223` | `lg-log-solve` | `logarithms` | `lg-03-03` | `40f777b60cdebe430d4d29609f4143ab934d4cf8fdd4736df62c418f511e6cbb` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `edeb31a197ba351beb0ca4ab` | `lg-models` | `logarithms` | `lg-05-01` | `7bb1c820620ca71c7390789ac2583661efbea371ca23a82582f7995b1e406469` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `ecc162e34bcd6c4a01a4fbb3` | `lg-power` | `logarithms` | `lg-02-02` | `eab7ca10f481c16482bd88f6a0f579f17eb6571b4ced364bc77c91bb98712a36` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `471e662139dd44dccafd94ef` | `lg-product` | `logarithms` | `lg-02-01` | `4707053ba334ef0cbb768b27cecbd4a5b6f9e8c5b60455af6a54079903459899` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `72bfc920593a1d9df212f39d` | `lg-scales` | `logarithms` | `lg-05-03` | `a05f4895932d16194d980345a0b5c6cc9ea2d8f6bd35f7ac0d0f7848be2f6f02` | `HSF.LE`, `HSF.BF`, `HSF.IF`, `HSA.REI` |
| `6448a2bdee15f6ae607af5d1` | `sr-arith-apply` | `sequences-series` | `sr-03-03` | `3f44abe205366c73fe8dbaf2a96ead9fc3e10c54fc63b7ff9318cebabbfae7a0` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `c6f75676d3c03886f0119154` | `sr-arith-sum` | `sequences-series` | `sr-03-01`, `sr-03-02` | `6050a231ff29fde6f222a5560ea7d62257d6fcfc5c36d77e70588280964df5af` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `226bb4aacf7bb71738399232` | `sr-convert` | `sequences-series` | `sr-01-03` | `f9847bb2d9dcdb3c5ebcf4c67f1d6377f48827bb6c90b79c585b2b3f39be0543` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `8ee6a91408eb082a96aca743` | `sr-geo-apply` | `sequences-series` | `sr-04-03` | `9dc2d527f63c8fda97d588e7ecca421845132aa6285ffd9f0f6501321edcf080` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `a2d98e3984ed09fcd63d6424` | `sr-geo-derive` | `sequences-series` | `sr-04-01` | `7e9288a89f487302b51ab52cb7a65bd0d32f8bc62765ce5003fe67a4c8d4e03a` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `0bea14f8398b301f274ec883` | `sr-geo-sum` | `sequences-series` | `sr-04-02` | `2c89854f8dd24b287612065aff0b609fc78c8e35c79beee96263945e7d5c8ee0` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `e488ea1a796d2a5e291df826` | `sr-inf-apply` | `sequences-series` | `sr-05-03` | `21027b923710ce567fb3645cb407ef21aba67d1f46e4d6ae5abf1b0dd2d66653` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `d52348f96da7e991ff39edae` | `sr-inf-converge` | `sequences-series` | `sr-05-01` | `e2d1eebd91e261934a7352f3160d02a386c09717a5e474b0989095fc175da856` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `9b577714932f5de519234551` | `sr-inf-sum` | `sequences-series` | `sr-05-02` | `a097c71108ddd76a5ab460d42588a7a906998114cebc9a878c2ccc1d7918cd70` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `2b4f8851f48ffa04a02626bb` | `sr-recursive` | `sequences-series` | `sr-01-01`, `sr-01-02` | `8d3e1cc84f3eb5a0e3784251390a88a70996c99c478c0d8fe4aa6411c8c85daf` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `5430c90a077c04f16ba929b0` | `sr-sigma-eval` | `sequences-series` | `sr-02-02` | `892e787a1fb9d35c5dbb0491dcb606e86a8f1f87976e99ed68bbd5c64847aaab` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `98bc9e1e0443c6bf8aa9425b` | `sr-sigma-read` | `sequences-series` | `sr-02-01` | `1d3ed3dade9ca6e65c838838716004c1ad8c42595494c7fa36539e56a6f364d0` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `e2749a7851e6fb6c2a5b702d` | `sr-sigma-write` | `sequences-series` | `sr-02-03` | `94f57d69209fab9692d6d7e39f0952e93e0e5f078e85eb82dfdbd68c4050514c` | `HSF.BF`, `HSF.IF`, `HSA.SSE`, `HSA.APR` |
| `18dd7b2a425692609f8d1d4e` | `tf-amp-period` | `trig-functions` | `tf-04-02` | `9214f8263e9ec453cb7799f1dd8803dfe9aba905e293fe9c17c5a4cff1cbdec9` | `HSF.TF`, `HSG.C` |
| `dc8ec2e121ffee256c47db20` | `tf-arc-length` | `trig-functions` | `tf-02-03` | `97cb2e28e00fdd12d406d7021251fbc0308472bb934e293aeb281c2749160c8d` | `HSF.TF`, `HSG.C` |

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
- Sample: `0df9527bc6fe16ddf5be343c`, `72bfc920593a1d9df212f39d`, `03388679a0d2d9eb6e00c14e`, `226bb4aacf7bb71738399232`, `4f8f90d2d2cf0b1a6d69d812`, `dc8ec2e121ffee256c47db20`, `a2d98e3984ed09fcd63d6424`, `e488ea1a796d2a5e291df826`.

Run: `node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch02.mjs`.

## Integration boundary

Do not regenerate this packet after append. Root should rerun the validator immediately before atomically appending all 40 signed records, then rebuild standards dossiers and the queue/card/cache chain serially. Any source/dossier/lesson hash change invalidates the affected candidate.
