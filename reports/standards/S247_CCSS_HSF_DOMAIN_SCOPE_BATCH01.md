# S247 Common Core HSF domain-scope assurance — batch 01

Date: 2026-08-18
Portfolio: `CCSS-MATH|HSF`
Scope: exactly 40 existing open dossier edges; no shared decision append, queue/cards/cache rebuild, content edit, commit, or deployment
Verdict: **40 canonical signed `rejected` candidates, isolated pending integration**

## Official authority and text boundary

The review read the Common Core State Standards Initiative's official
[High School: Functions](https://www.thecorestandards.org/Math/Content/HSF/) page directly through browser-supported web retrieval on 2026-08-18. The exact boundary used was
`High School: Functions > Standards in this domain`. Its compact signed snapshot is:

> Standards in this domain: HSF.BF.A, HSF.BF.B, HSF.IF.A, HSF.IF.B, HSF.IF.C, HSF.LE.A, HSF.LE.B, HSF.TF.A, HSF.TF.B, HSF.TF.C.

The authority page enumerates Building Functions, Interpreting Functions, Linear/Quadratic/Exponential Models, and Trigonometric Functions clusters and their descendant standards. It does **not** define `HSF` as a standalone assessable standard with a single mathematical action. The repository's source registry points to the same Common Core authority and 2010 canonical spine.

Signed source-boundary SHA-256: `f92e42efedc3069fbaa3388b12b48cc5d3c26e1d066046e71a836e914d1769e8`.

## Disposition contract

Every selected live dossier uses `candidateCode: HSF`, `candidateLabel: Candidate alignment to HSF`, and a candidate review state. A full-intent approval or partial decision is not contractually possible: there is no exact standard text at `HSF` against which the objective can be approved to a defined depth.

Each edge is rejected **only as a coarse domain-level crosswalk**. The decision explicitly does not reject possible evidence for a narrower descendant such as `HSF.IF.A.2`, `HSF.BF.A.2`, or a relevant Algebra/Geometry standard. Routing families in the packet are review hints only, not new alignment claims.

The current dossiers tag one step per edge as transfer. That tag was not used. Challenge presence and generated evidence-role metadata do not establish transfer or mastery; the exact descendant standard still requires official-text and full-lesson review.

## Current source seals

- `content/standards/evidence-dossiers.json`: `a8d7e5044fcb7ffd9448bf7846c875a588dbbedccf1a400afe3d317062321af2`
- `content/standards/objectives.json`: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- `content/standards/source-registry.json`: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- isolated candidate packet: `9aa4ab0d6aeeebea9f634fe20428623e2ac8c39c8f0241bb47f0b42f161c7fae`

Each record also signs the current dossier hash and SHA-256 of every lesson file in its evidence snapshot.

## Exact edges

| Edge ID | Objective | Course | Lesson | Current dossier SHA-256 | Replacement review routing only |
|---|---|---|---|---|---|
| `ce9d3192c9869e6b8ae4b266` | `fn-arith-rule` | `functions-and-sequences` | `fn-02-03` | `16e83d81161801466834a7dea0e33e7e86d9d69732174ac124a406b7533adcab` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `8c3d89a2de90f550696d71f5` | `fn-choose-formula` | `functions-and-sequences` | `fn-04-02` | `621b0fa1e96369538b2762a5b7b140ea5c91b66a2a69f564b8963b31728d1d03` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `fbb8ae3cd292d3334aad9b44` | `fn-classify` | `functions-and-sequences` | `fn-04-01` | `cf448534d5599263e1d423aa9aa607cd596036616a5e1106de949aa43180158b` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `1e2481d51bc984c970648450` | `fn-common-diff` | `functions-and-sequences` | `fn-02-01` | `e25716312a75bd3e35596c22eaa853a669b32a7f73281dd310ddc53ed4e664b6` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `cc177df968535bdb29a262a3` | `fn-common-ratio` | `functions-and-sequences` | `fn-03-01` | `1574085a0d6eef17da97233d8a2e88307b04c05715d06f9ca1531125c5530978` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `159a17c12673a486afbbf682` | `fn-domain-range` | `functions-and-sequences` | `fn-01-02` | `1c622f7f77330079e8f3decdd8bb364239f8c42d03d61472d039db47e6ee2da7` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `b5e9e77257884930b3ed2258` | `fn-geo-nth` | `functions-and-sequences` | `fn-03-02` | `8b38846429b8516696674dac599e449319f3156f112acd32eafb646347c18857` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `a9ce8929e5c7f8c26abac264` | `fn-geo-rule` | `functions-and-sequences` | `fn-03-03` | `cfa83907c8d9fbf39623d174253a5c168b2d723f5fb4a9497205037a8e815693` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `9bdf0abf167d176f16a134de` | `fn-growth-apply` | `functions-and-sequences` | `fn-04-03` | `5f98489e7584cef99393cdde5aa8f5a09852ca140fe05f3b3736a4709f2a28bf` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `d003871d2d399877e6821643` | `fn-notation` | `functions-and-sequences` | `fn-01-01` | `141bf1cb15fc35c6e6f549d4d8aaa974ce5200060eff5dcf950d8bfad71faecf` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `3b9206329391f292fd2f8de2` | `fn-nth-term` | `functions-and-sequences` | `fn-02-02` | `b48581ef975f5efd46d64cba0d14c4c870aa09a56e0e634d0bf84c475e8a96e4` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `7325e87129222b93cd14317f` | `fn-table-rule` | `functions-and-sequences` | `fn-01-03` | `f5e367a12546d114e7b1b207da853f783469e5fe7fd944c0f4149abbd3a77588` | `HSF.IF`, `HSF.BF`, `HSF.LE` |
| `6c47b81f632866f3d52a92ef` | `form-conversion` | `linear-functions` | `lf-03-02` | `342b336a32ed50a7658e42fa8eef4a00302be2d4051305200ada078f573d9864` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `375836024c6d289056cfda42` | `intercepts` | `linear-functions` | `lf-02-03` | `46e05537553927b85d512e625e44dd1367414830ba97dd724bf4c47a6f6ffad7` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `f1fa8138b09a8be0344a50ce` | `line-from-point-slope` | `linear-functions` | `lf-04-01` | `383aa11181f0193e417ce6d48f00d06b9a3a10bde07c6e1e716ce022aaba62e0` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `d36a90c5294f483e4b44c353` | `line-from-two-points` | `linear-functions` | `lf-04-02` | `ac5cfea178358776d0114431f513e9e90ef877fb3ea1de1032375be4949dd107` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `e8e08350c526b1f1a20c367b` | `parallel-perpendicular` | `linear-functions` | `lf-04-03` | `3868d7488fe8fc827d5cca411d1ab16eb4fc77428b62f02b8047ac1dd83a7f53` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `77b90257fde5a613b2aa81f9` | `point-slope-read` | `linear-functions` | `lf-03-01` | `31d398d0d222a7f38d91b907160f94c19908f373a828afffed7d65fcb851ed47` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `0fd452e3d6de46fb49d3b42d` | `slope-count` | `linear-functions` | `lf-01-01` | `597a6b6583cb9a0adb116bd0c7ebe2074e9a6b3c76bee2b81437cb54be90d547` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `9e949882a33df65270257c2a` | `slope-formula` | `linear-functions` | `lf-01-02` | `580a9a0d7000189fc8f9c2621832c89e2e7a43ba79f4690626bd1359609f7987` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `a43328b3b9054d55663036b1` | `slope-intercept-graph` | `linear-functions` | `lf-02-02` | `df63123a9c67ad3ceea237314502b56c52439a418fbff817c6bf7918d58f454a` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `f29709e2dafab5650ca3c233` | `slope-intercept-read` | `linear-functions` | `lf-02-01` | `a2204e0a4d402960016554b6b5172c02b6588dbd97f2f9f2fd25560ed98952b3` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `5c8768a312b02d03298cd7f8` | `slope-sign` | `linear-functions` | `lf-01-03` | `40da72b1a399c9208947ddadfecfdad9d9b27cbb48b31ee46935d69442a8847d` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `b1fc68d110f17506fe41eb4c` | `standard-form` | `linear-functions` | `lf-03-03` | `cb968e4f2514cc1c887303a75de4a0ede5f103e3697d70265d023acdb84094f4` | `HSF.IF`, `HSF.LE`, `HSA.CED`, `HSA.REI`, `HSG.GPE` |
| `c6c60829aef101ef48d008f3` | `quad-apply-choose` | `quadratics` | `qu-04-03` | `738390d090d4acd822aadcd141153479710060289bafcfd60948fc4aa5aec5fa` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `fcff3a16a764cafb68722d29` | `quad-diff-squares-solve` | `quadratics` | `qu-02-03` | `2d99702e3bc02410cf919970295ff5c3f68aea0237fe11b43280e00012f802b8` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `2a990d54fba9fe5d9652d694` | `quad-discriminant` | `quadratics` | `qu-03-03` | `91a3bb78adbb4bf18bf735048d52d30392d8896538654a32e78b00e043493b10` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `d03e86a95c3b32376df52ce5` | `quad-factor-solve` | `quadratics` | `qu-02-02` | `1735a23142747788051c61b7b6b63c09572b9fb67ea2f98689f3600e8fc96116` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `9b962b8da1f7c570973c31a3` | `quad-formula` | `quadratics` | `qu-03-02` | `994a4ebdb8e23ee0bcc6a3c4b9ba317fe7896a8d6c26ba26cd8440d0b3240fe2` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `7598c277b0ca0c2b6f6e981d` | `quad-projectile` | `quadratics` | `qu-04-01` | `3d413353459fd112f536d4f8d06e486c8dab2027f0eb3c71968e08774530893e` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `b05456323f534e8036e03faf` | `quad-square-root` | `quadratics` | `qu-03-01` | `a72735c280072629bc3edbd1a4ba2f9646b9fe47693b7a0636be5d2ae7b8fcf6` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `2f038e6d0ec43a948c5407a4` | `quad-standard-axis` | `quadratics` | `qu-01-02` | `86d2f59cacb9b14aa8c3907d75a858defed6fa754868ceeabb382e92388c71b8` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `51ac655208abb1494f870349` | `quad-transform` | `quadratics` | `qu-01-03` | `c9c67e284b8a7a039e6d0a7a85e3e09d63d700883c18af2c2acf3a839445c2c4` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `ec001301d3d2497dc07ac4f0` | `quad-vertex-form` | `quadratics` | `qu-01-01` | `d3b8facb22d96aac2abe8b7d8475b96fce7088e4f763de49f1cd167c730a2a37` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `62d4a68aca07ae0f62f5041f` | `quad-zero-product` | `quadratics` | `qu-02-01` | `2f47116bcc6ffc0364c2d9a959e4e7606b1dd59142f00b1b577d61c89f6c9600` | `HSF.IF`, `HSF.BF`, `HSA.SSE`, `HSA.REI`, `HSA.APR` |
| `833f12069db084a695ccc751` | `ft-arith` | `function-transformations` | `ft-04-01` | `a576c58fd5219fe8602563a230b8d9d0c47f88247bc61ce35cc0f20531b85a43` | `HSF.BF`, `HSF.IF` |
| `66e9136618e68bad4e65d48b` | `ft-combined-shift` | `function-transformations` | `ft-02-03` | `29291543685fce7a08ccfe3e4b00f1e8f5a6c5bf84255e1b0e327d149b65e763` | `HSF.BF`, `HSF.IF` |
| `2cce22508cba204bc0531670` | `ft-compose` | `function-transformations` | `ft-04-02` | `8e7a74536ebebde1ade588670e67b9c94ad225e3dddaa6d5858121f643a49b73` | `HSF.BF`, `HSF.IF` |
| `5278d3303a92e273257322d2` | `ft-compose-rule` | `function-transformations` | `ft-04-03` | `4ddc79932c4bd1addc56cee04b68e76dd5aeddba30103069a45c886ddb040aed` | `HSF.BF`, `HSF.IF` |
| `8ab6efbd9a2a7d0fff672d03` | `ft-domain` | `function-transformations` | `ft-01-02` | `0b30cd0e53fc370ed5b1e4eb1fc5e35937e708eaf99598051792d0bb0d0cb451` | `HSF.BF`, `HSF.IF` |

## Evidence gaps applied to every edge

1. `HSF` supplies no exact assessable standard action, conditions, representations, or limits.
2. Full-intent comparison requires a descendant standard code and its complete official wording.
3. A single objective/lesson cannot establish the whole HSF domain spanning interpreting, building, modeling, and trigonometric functions.
4. Challenge/transfer tags were not used to infer transfer or mastery.

## Strict validation and unseen sample

The isolated validator verifies canonical status, live edge identity, current candidate state, dossier/artifact/lesson hashes, official boundary, claim boundary, evidence gaps, signatures, and zero transfer-evidence use. It selects its sample from the live dossier seal rather than accepting an author-provided sample list.

- Full packet: **40/40 PASS**.
- Deterministic independent unseen sample: **8/8 PASS**.
- Sample edge IDs: `d003871d2d399877e6821643`, `f29709e2dafab5650ca3c233`, `5c8768a312b02d03298cd7f8`, `b05456323f534e8036e03faf`, `7598c277b0ca0c2b6f6e981d`, `9b962b8da1f7c570973c31a3`, `c6c60829aef101ef48d008f3`, `0fd452e3d6de46fb49d3b42d`.
- Course partition: 12 functions/sequences, 12 linear-functions, 11 quadratics, 5 function-transformations.

Command: `node reports/closure/candidates/validate-s247-ccss-hsf-domain-scope-batch01.mjs`.

## Integration boundary

These records are not appended to `content/standards/human-review-decisions.json`. Root integration must rerun the strict validator immediately before append, preserve the signed records exactly, then rebuild standards dossiers and the global queue/card/cache chain serially. Any changed dossier, standards artifact, or lesson hash invalidates the corresponding candidate.
